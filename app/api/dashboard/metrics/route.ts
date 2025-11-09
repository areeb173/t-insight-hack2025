/**
 * Dashboard Metrics API
 *
 * GET /api/dashboard/metrics
 * Returns all dashboard data in a single response for optimal performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateCHI } from '@/lib/utils/chi';
import {
  getProductAreaMetrics,
  getEmergingIssues,
  getSentimentTimeline,
  getSourceBreakdown,
} from '@/lib/utils/dashboard-data';

export const dynamic = 'force-dynamic'; // Always fetch fresh data
export const revalidate = 0; // Disable caching

export async function GET(request: NextRequest) {
  try {
    // Use 24-hour window to show existing data (configurable)
    const timeWindowHours = 24;

    // Fetch all dashboard data in parallel for better performance
    const [
      overallCHI,
      productAreas,
      emergingIssues,
      sentimentTimeline,
      sourceData,
    ] = await Promise.all([
      calculateCHI(timeWindowHours * 60), // Overall CHI from time window
      getProductAreaMetrics(timeWindowHours),
      getEmergingIssues(10, timeWindowHours), // Top 10 emerging issues
      getSentimentTimeline('24h'),
      getSourceBreakdown(),
    ]);

    // Return all data
    return NextResponse.json({
      overallCHI: overallCHI || 50, // Default to neutral if no data
      productAreas,
      emergingIssues,
      sentimentTimeline,
      sourceData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);

    // Return fallback data on error
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        overallCHI: 50,
        productAreas: [],
        emergingIssues: [],
        sentimentTimeline: [],
        sourceData: [],
      },
      { status: 500 }
    );
  }
}
