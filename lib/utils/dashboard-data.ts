/**
 * Dashboard Data Utilities
 *
 * Aggregate and transform signal data for dashboard consumption
 */

import { createServiceClient } from '@/lib/supabase/service';
import { calculateCHI, getCHITrend } from './chi';

/**
 * Normalize topic text to proper title case with special handling
 */
function normalizeTopicText(topic: string): string {
  // Special case mappings
  const specialCases: Record<string, string> = {
    'tmobile': 'T-Mobile',
    't-mobile': 'T-Mobile',
    '5g': '5G',
    'lte': 'LTE',
    'wifi': 'WiFi',
    'wi-fi': 'Wi-Fi',
    'app': 'App',
    'api': 'API',
    'sms': 'SMS',
    'mms': 'MMS',
    'sim': 'SIM',
    'esim': 'eSIM',
    'voip': 'VoIP',
    'vpn': 'VPN',
    'tv': 'TV',
    'hbo': 'HBO',
    'netflix': 'Netflix',
    'iphone': 'iPhone',
    'ipad': 'iPad',
    'android': 'Android',
    'ios': 'iOS',
    'ok': 'OK',
  };

  // Split on spaces and convert to title case
  const words = topic.toLowerCase().split(' ');

  const normalizedWords = words.map(word => {
    // Check if word is in special cases (exact match)
    if (specialCases[word]) {
      return specialCases[word];
    }

    // Check if word contains a special case (e.g., "t-mobile's")
    for (const [key, value] of Object.entries(specialCases)) {
      if (word.startsWith(key)) {
        return word.replace(key, value);
      }
    }

    // Standard title case: capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return normalizedWords.join(' ');
}

// Product area color mapping (from CLAUDE.md design system)
const PRODUCT_AREA_COLORS: Record<string, string> = {
  Network: '#E8258E', // T-Mobile Magenta
  'Mobile App': '#7C3E93', // Purple
  Billing: '#00A19C', // Teal
  'Home Internet': '#F58220', // Orange
};

// Source name mapping (internal -> friendly display names)
const SOURCE_NAME_MAPPING: Record<string, string> = {
  'google-news': 'Google News',
  reddit: 'Reddit',
  downdetector: 'DownDetector',
  'outage-report': 'Outage.report',
  'tmobile-community': 'T-Mobile Community',
  'customer-feedback': 'Customer Feedback',
  istheservicedown: 'IsTheServiceDown',
};

export interface ProductArea {
  id: string;
  name: string;
  color: string;
  chi: number;
  trend: number;
  signalCount: number;
}

export interface EmergingIssue {
  id: string;
  topic: string;
  intensity: number;
  sentiment: number;
  sourceCount: number;
  productArea: string;
}

export interface SentimentDataPoint {
  timestamp: Date;
  network: number;
  mobileApp: number;
  billing: number;
  homeInternet: number;
}

export interface SourceData {
  name: string;
  value: number;
}

/**
 * Get product area metrics with CHI, trend, and signal count
 */
export async function getProductAreaMetrics(timeWindowHours: number = 24): Promise<ProductArea[]> {
  try {
    const supabase = createServiceClient();

    // Fetch all product areas
    const { data: productAreas, error: paError } = await supabase
      .from('product_areas')
      .select('*')
      .order('name');

    if (paError || !productAreas) {
      console.error('Error fetching product areas:', paError);
      return [];
    }

    // Calculate metrics for each product area
    const metrics: ProductArea[] = [];
    const timeWindowMinutes = timeWindowHours * 60;

    for (const area of productAreas) {
      // Calculate CHI for this product area
      const chi = (await calculateCHI(timeWindowMinutes, area.id)) || 50; // Default to neutral 50 if no data

      // Calculate trend
      const trend = await getCHITrend(timeWindowMinutes, area.id);

      // Count signals from time window
      const timeAgo = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

      const { count, error: countError } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('product_area_id', area.id)
        .gte('detected_at', timeAgo);

      metrics.push({
        id: area.id,
        name: area.name,
        color: PRODUCT_AREA_COLORS[area.name] || '#6B7280', // Fallback to gray
        chi: Math.round(chi),
        trend: Math.round(trend),
        signalCount: count || 0,
      });
    }

    return metrics;
  } catch (error) {
    console.error('Error getting product area metrics:', error);
    return [];
  }
}

/**
 * Get top emerging issues from the last hour
 */
export async function getEmergingIssues(limit: number = 10, timeWindowHours: number = 24): Promise<EmergingIssue[]> {
  try {
    const supabase = createServiceClient();
    const timeAgo = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

    // Query signals from time window with product area info
    const { data: signals, error } = await supabase
      .from('signals')
      .select(`
        id,
        topic,
        intensity,
        sentiment,
        source,
        product_area_id,
        product_areas (name)
      `)
      .gte('detected_at', timeAgo)
      .order('intensity', { ascending: false });

    if (error || !signals) {
      console.error('Error fetching emerging issues:', error);
      return [];
    }

    // Group by topic and aggregate
    const issueMap = new Map<string, {
      topics: Set<string>;
      totalIntensity: number;
      sentiments: number[];
      sources: Set<string>;
      productArea: string;
    }>();

    for (const signal of signals) {
      const topic = signal.topic || 'Unknown';
      const key = topic.toLowerCase().trim();

      if (!issueMap.has(key)) {
        issueMap.set(key, {
          topics: new Set([topic]),
          totalIntensity: 0,
          sentiments: [],
          sources: new Set(),
          productArea: (signal.product_areas as any)?.name || 'Other',
        });
      }

      const issue = issueMap.get(key)!;
      issue.totalIntensity += signal.intensity || 1;
      issue.sentiments.push(signal.sentiment || 0);
      issue.sources.add(signal.source);
    }

    // Convert to array and calculate averages
    const issues: EmergingIssue[] = Array.from(issueMap.entries())
      .map(([key, issue]) => ({
        id: key,
        topic: normalizeTopicText(Array.from(issue.topics)[0]), // Use first topic variant with proper formatting
        intensity: issue.totalIntensity,
        sentiment: issue.sentiments.reduce((sum, s) => sum + s, 0) / issue.sentiments.length,
        sourceCount: issue.sources.size,
        productArea: issue.productArea,
      }))
      .sort((a, b) => b.intensity - a.intensity) // Sort by intensity descending
      .slice(0, limit);

    return issues;
  } catch (error) {
    console.error('Error getting emerging issues:', error);
    return [];
  }
}

/**
 * Get 24-hour sentiment timeline with hourly buckets by product area
 */
export async function getSentimentTimeline(): Promise<SentimentDataPoint[]> {
  try {
    const supabase = createServiceClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Fetch signals from last 24 hours with product area
    const { data: signals, error } = await supabase
      .from('signals')
      .select(`
        detected_at,
        sentiment,
        product_area_id,
        product_areas (name)
      `)
      .gte('detected_at', twentyFourHoursAgo)
      .order('detected_at', { ascending: true });

    if (error || !signals) {
      console.error('Error fetching sentiment timeline:', error);
      return generateEmpty24HourTimeline();
    }

    // Group by hour and product area
    const hourlyData = new Map<string, {
      network: number[];
      mobileApp: number[];
      billing: number[];
      homeInternet: number[];
    }>();

    for (const signal of signals) {
      const hour = new Date(signal.detected_at).setMinutes(0, 0, 0);
      const hourKey = new Date(hour).toISOString();
      const productArea = (signal.product_areas as any)?.name || '';

      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, {
          network: [],
          mobileApp: [],
          billing: [],
          homeInternet: [],
        });
      }

      const hourData = hourlyData.get(hourKey)!;
      const sentiment = signal.sentiment || 0;

      // Map to appropriate product area
      switch (productArea) {
        case 'Network':
          hourData.network.push(sentiment);
          break;
        case 'Mobile App':
          hourData.mobileApp.push(sentiment);
          break;
        case 'Billing':
          hourData.billing.push(sentiment);
          break;
        case 'Home Internet':
          hourData.homeInternet.push(sentiment);
          break;
      }
    }

    // Convert to timeline array with averages
    const timeline: SentimentDataPoint[] = [];

    // Generate 24 hour buckets
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      timestamp.setMinutes(0, 0, 0);
      const hourKey = timestamp.toISOString();

      const hourData = hourlyData.get(hourKey) || {
        network: [],
        mobileApp: [],
        billing: [],
        homeInternet: [],
      };

      timeline.push({
        timestamp,
        network: average(hourData.network),
        mobileApp: average(hourData.mobileApp),
        billing: average(hourData.billing),
        homeInternet: average(hourData.homeInternet),
      });
    }

    return timeline;
  } catch (error) {
    console.error('Error getting sentiment timeline:', error);
    return generateEmpty24HourTimeline();
  }
}

/**
 * Get source breakdown (count of signals by source)
 */
export async function getSourceBreakdown(): Promise<SourceData[]> {
  try {
    const supabase = createServiceClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Count signals by source from last 24 hours
    const { data: signals, error } = await supabase
      .from('signals')
      .select('source')
      .gte('detected_at', twentyFourHoursAgo);

    if (error || !signals) {
      console.error('Error fetching source breakdown:', error);
      return [];
    }

    // Count by source
    const sourceCounts = new Map<string, number>();

    for (const signal of signals) {
      const source = signal.source;
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    }

    // Convert to array with friendly names
    const breakdown: SourceData[] = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({
        name: SOURCE_NAME_MAPPING[source] || source,
        value: count,
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending

    return breakdown;
  } catch (error) {
    console.error('Error getting source breakdown:', error);
    return [];
  }
}

/**
 * Helper: Calculate average of array, return 0 if empty
 */
function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Helper: Generate empty 24-hour timeline with neutral sentiment
 */
function generateEmpty24HourTimeline(): SentimentDataPoint[] {
  const timeline: SentimentDataPoint[] = [];

  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
    timestamp.setMinutes(0, 0, 0);

    timeline.push({
      timestamp,
      network: 0,
      mobileApp: 0,
      billing: 0,
      homeInternet: 0,
    });
  }

  return timeline;
}
