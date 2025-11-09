/**
 * Sentiment Timeline API
 *
 * GET /api/dashboard/sentiment-timeline?range=24h|7d|30d
 * Returns sentiment timeline data for the specified time range
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSentimentTimeline } from '@/lib/utils/dashboard-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '24h';

    // Validate range
    if (!['24h', '7d', '30d'].includes(range)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid range parameter',
          message: 'Range must be one of: 24h, 7d, 30d',
        },
        { status: 400 }
      );
    }

    // Fetch sentiment timeline data
    const timeline = await getSentimentTimeline(range as '24h' | '7d' | '30d');

    return NextResponse.json({
      success: true,
      timeline,
      range,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sentiment timeline:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sentiment timeline',
        message: error instanceof Error ? error.message : 'Unknown error',
        timeline: [],
      },
      { status: 500 }
    );
  }
}

