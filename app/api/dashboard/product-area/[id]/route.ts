/**
 * Product Area Detail API
 *
 * GET /api/dashboard/product-area/[id]
 * Returns detailed metrics for a specific product area
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateCHI } from '@/lib/utils/chi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

interface ProductAreaDetailData {
  id: string;
  name: string;
  color: string;
  chi: number;
  trend: number;
  signalCount: number;
  resolvedCount: number;
  sentimentTimeline: Array<{
    timestamp: Date;
    sentiment: number;
  }>;
  topIssues: Array<{
    id: string;
    topic: string;
    intensity: number;
    sentiment: number;
    sourceCount: number;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productAreaId } = await params;
    const supabase = createServiceClient();

    // Fetch product area info
    const { data: productArea, error: paError } = await supabase
      .from('product_areas')
      .select('*')
      .eq('id', productAreaId)
      .single();

    if (paError || !productArea) {
      return NextResponse.json(
        { error: 'Product area not found' },
        { status: 404 }
      );
    }

    // Time windows
    const timeWindowHours = 24;
    const timeAgo = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

    // Calculate CHI and trend
    const chi = (await calculateCHI(timeWindowHours * 60, productAreaId)) || 50;

    // Get trend (compare to previous window)
    const previousWindowStart = new Date(Date.now() - timeWindowHours * 2 * 60 * 60 * 1000).toISOString();
    const previousWindowEnd = timeAgo;

    const { data: currentSignals } = await supabase
      .from('signals')
      .select('sentiment, intensity')
      .eq('product_area_id', productAreaId)
      .gte('detected_at', timeAgo);

    const { data: previousSignals } = await supabase
      .from('signals')
      .select('sentiment, intensity')
      .eq('product_area_id', productAreaId)
      .gte('detected_at', previousWindowStart)
      .lt('detected_at', previousWindowEnd);

    // Calculate trend
    let trend = 0;
    if (currentSignals && previousSignals && previousSignals.length > 0) {
      const calcCHI = (signals: Array<{ sentiment: number; intensity: number }>) => {
        const total = signals.reduce((sum, s) => sum + (s.sentiment * s.intensity), 0);
        const totalInt = signals.reduce((sum, s) => sum + s.intensity, 0);
        return totalInt > 0 ? Math.round(((total / totalInt + 1) / 2) * 100) : 50;
      };
      const currentCHI = calcCHI(currentSignals);
      const previousCHI = calcCHI(previousSignals);
      trend = currentCHI - previousCHI;
    }

    // Count total signals
    const { count: signalCount } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('product_area_id', productAreaId)
      .gte('detected_at', timeAgo);

    // Count "resolved" signals (signals that improved sentiment)
    // We'll use a heuristic: signals with positive sentiment that occurred after negative ones
    const { data: allSignals } = await supabase
      .from('signals')
      .select('topic, sentiment, detected_at')
      .eq('product_area_id', productAreaId)
      .gte('detected_at', timeAgo)
      .order('detected_at', { ascending: true });

    let resolvedCount = 0;
    if (allSignals) {
      // Group by topic and look for sentiment improvements
      const topicMap = new Map<string, Array<{ sentiment: number; time: string }>>();

      for (const signal of allSignals) {
        const topicKey = signal.topic.toLowerCase().trim();
        if (!topicMap.has(topicKey)) {
          topicMap.set(topicKey, []);
        }
        topicMap.get(topicKey)!.push({
          sentiment: signal.sentiment,
          time: signal.detected_at,
        });
      }

      // Count topics that show improvement (latest sentiment > first sentiment)
      for (const signals of topicMap.values()) {
        if (signals.length >= 2) {
          const first = signals[0].sentiment;
          const last = signals[signals.length - 1].sentiment;
          if (first < 0 && last > first + 0.2) {
            resolvedCount++;
          }
        }
      }
    }

    // Get 24-hour sentiment timeline for this product area
    const { data: timelineSignals } = await supabase
      .from('signals')
      .select('detected_at, sentiment')
      .eq('product_area_id', productAreaId)
      .gte('detected_at', timeAgo)
      .order('detected_at', { ascending: true });

    // Group into hourly buckets
    const hourlyData = new Map<string, number[]>();
    if (timelineSignals) {
      for (const signal of timelineSignals) {
        const hour = new Date(signal.detected_at).setMinutes(0, 0, 0);
        const hourKey = new Date(hour).toISOString();

        if (!hourlyData.has(hourKey)) {
          hourlyData.set(hourKey, []);
        }
        hourlyData.get(hourKey)!.push(signal.sentiment);
      }
    }

    // Create timeline array
    const sentimentTimeline = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      timestamp.setMinutes(0, 0, 0);
      const hourKey = timestamp.toISOString();

      const sentiments = hourlyData.get(hourKey) || [];
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
        : 0;

      sentimentTimeline.push({
        timestamp,
        sentiment: avgSentiment,
      });
    }

    // Get top issues for this product area
    const { data: issueSignals } = await supabase
      .from('signals')
      .select('id, topic, intensity, sentiment, source')
      .eq('product_area_id', productAreaId)
      .gte('detected_at', timeAgo)
      .order('intensity', { ascending: false });

    // Group by topic
    const issueMap = new Map<string, {
      topics: Set<string>;
      totalIntensity: number;
      sentiments: number[];
      sources: Set<string>;
    }>();

    if (issueSignals) {
      for (const signal of issueSignals) {
        const topic = signal.topic || 'Unknown';
        const key = topic.toLowerCase().trim();

        if (!issueMap.has(key)) {
          issueMap.set(key, {
            topics: new Set([topic]),
            totalIntensity: 0,
            sentiments: [],
            sources: new Set(),
          });
        }

        const issue = issueMap.get(key)!;
        issue.totalIntensity += signal.intensity || 1;
        issue.sentiments.push(signal.sentiment || 0);
        issue.sources.add(signal.source);
      }
    }

    // Convert to array and get top 3
    const topIssues = Array.from(issueMap.entries())
      .map(([key, issue]) => ({
        id: key,
        topic: normalizeTopicText(Array.from(issue.topics)[0]),
        intensity: issue.totalIntensity,
        sentiment: issue.sentiments.reduce((sum, s) => sum + s, 0) / issue.sentiments.length,
        sourceCount: issue.sources.size,
      }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3);

    // Get color mapping
    const colorMap: Record<string, string> = {
      Network: '#E8258E',
      'Mobile App': '#7C3E93',
      Billing: '#00A19C',
      'Home Internet': '#F58220',
    };

    const response: ProductAreaDetailData = {
      id: productArea.id,
      name: productArea.name,
      color: colorMap[productArea.name] || '#6B7280',
      chi: Math.round(chi),
      trend: Math.round(trend),
      signalCount: signalCount || 0,
      resolvedCount,
      sentimentTimeline,
      topIssues,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching product area detail:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch product area detail',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
