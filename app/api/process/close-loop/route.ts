/**
 * Close-the-Loop Monitoring API
 * Monitors opportunities marked as "done" to track sentiment recovery
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { calculateRecoveryStatus } from '@/lib/utils/close-loop'

export const dynamic = 'force-dynamic'

interface OpportunityToMonitor {
  id: string
  title: string
  topic: string
  product_area_id: string | null
  product_area?: { name: string }
  marked_done_at: string
  baseline_sentiment: number
  baseline_intensity: number
  baseline_signal_count: number
  derived_from_signal_ids: string[]
  meta: any
}

/**
 * Fetch recent signals for the same topic and product area
 */
async function fetchRecentSignals(
  supabase: any,
  topic: string,
  productAreaId: string | null,
  afterTimestamp: string
) {
  let query = supabase
    .from('signals')
    .select('*')
    .ilike('topic', `%${topic}%`)
    .gte('detected_at', afterTimestamp)
    .order('detected_at', { ascending: false })

  if (productAreaId) {
    query = query.eq('product_area_id', productAreaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recent signals:', error)
    return []
  }

  return data || []
}

/**
 * Process a single opportunity for close-loop monitoring
 */
async function processOpportunity(
  opportunity: OpportunityToMonitor,
  supabase: any
): Promise<{ success: boolean; status?: string }> {
  try {
    // Fetch recent signals for this topic/product area since marked done
    const recentSignals = await fetchRecentSignals(
      supabase,
      opportunity.topic,
      opportunity.product_area_id,
      opportunity.marked_done_at
    )

    // Calculate current metrics
    const currentSentiment = recentSignals.length > 0
      ? recentSignals.reduce((sum: number, s: any) => sum + s.sentiment, 0) / recentSignals.length
      : opportunity.baseline_sentiment

    const currentIntensity = recentSignals.length > 0
      ? recentSignals.reduce((sum: number, s: any) => sum + (s.intensity || 1), 0)
      : 0

    // Calculate recovery status
    const recoveryStatus = calculateRecoveryStatus(
      opportunity.baseline_sentiment,
      currentSentiment,
      opportunity.baseline_intensity,
      currentIntensity,
      opportunity.marked_done_at
    )

    // Build timeline data (last 10 signals)
    const timeline = recentSignals.slice(0, 10).map((signal: any) => ({
      timestamp: signal.detected_at,
      sentiment: signal.sentiment,
      intensity: signal.intensity || 1,
    }))

    // Update close-loop metadata
    const closeLoopData = {
      status: recoveryStatus,
      monitoredAt: new Date().toISOString(),
      recoveryMetrics: {
        beforeSentiment: opportunity.baseline_sentiment,
        afterSentiment: currentSentiment,
        sentimentChange: currentSentiment - opportunity.baseline_sentiment,
        beforeIntensity: opportunity.baseline_intensity,
        afterIntensity: currentIntensity,
        intensityChange: opportunity.baseline_intensity - currentIntensity,
        signalCountBefore: opportunity.baseline_signal_count,
        signalCountAfter: recentSignals.length,
      },
      timeline,
    }

    // Update opportunity with close-loop data
    const currentMeta = opportunity.meta || {}
    const { error: updateError } = await supabase
      .from('opportunity_cards')
      .update({
        meta: {
          ...currentMeta,
          closeloop: closeLoopData,
        },
      })
      .eq('id', opportunity.id)

    if (updateError) {
      console.error(`Error updating opportunity ${opportunity.id}:`, updateError)
      return { success: false }
    }

    console.log(
      `Processed opportunity ${opportunity.id}: ${recoveryStatus} (sentiment: ${opportunity.baseline_sentiment.toFixed(2)} → ${currentSentiment.toFixed(2)})`
    )

    return { success: true, status: recoveryStatus }
  } catch (error) {
    console.error(`Error processing opportunity ${opportunity.id}:`, error)
    return { success: false }
  }
}

/**
 * POST /api/process/close-loop
 * Monitor opportunities marked "done" in last 72 hours
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Calculate 72 hours ago
    const seventyTwoHoursAgo = new Date()
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72)

    // Query opportunities marked as "done" in last 72 hours
    const { data: opportunities, error: queryError } = await supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(name)
      `)
      .eq('status', 'done')
      .not('marked_done_at', 'is', null)
      .gte('marked_done_at', seventyTwoHoursAgo.toISOString())
      .order('marked_done_at', { ascending: false })

    if (queryError) {
      console.error('Error querying opportunities:', queryError)
      return NextResponse.json(
        { error: 'Failed to query opportunities', details: queryError.message },
        { status: 500 }
      )
    }

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No opportunities to monitor',
        monitored: 0,
      })
    }

    console.log(`Found ${opportunities.length} opportunities to monitor`)

    // Extract topic from title (simple extraction - assumes format "[TOPIC] ...")
    const opportunitiesToMonitor: OpportunityToMonitor[] = opportunities.map((opp) => ({
      ...opp,
      topic: extractTopicFromTitle(opp.title),
    }))

    // Process each opportunity
    let successCount = 0
    const statusBreakdown = {
      recovered: 0,
      monitoring: 0,
      'not-recovered': 0,
    }

    for (const opportunity of opportunitiesToMonitor) {
      const result = await processOpportunity(opportunity, supabase)

      if (result.success && result.status) {
        successCount++
        statusBreakdown[result.status as keyof typeof statusBreakdown]++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Close-loop monitoring complete',
      monitored: successCount,
      total: opportunities.length,
      statusBreakdown,
    })
  } catch (error) {
    console.error('Error in close-loop processing:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/process/close-loop
 * Get status of opportunities being monitored
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Calculate 72 hours ago
    const seventyTwoHoursAgo = new Date()
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72)

    // Count opportunities in monitoring
    const { count: monitoringCount, error: countError } = await supabase
      .from('opportunity_cards')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .not('marked_done_at', 'is', null)
      .gte('marked_done_at', seventyTwoHoursAgo.toISOString())

    if (countError) {
      console.error('Error counting opportunities:', countError)
      return NextResponse.json(
        { error: 'Failed to count opportunities', details: countError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      opportunitiesMonitoring: monitoringCount || 0,
      monitoringWindow: '72 hours',
    })
  } catch (error) {
    console.error('Error in close-loop GET:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Extract topic from opportunity title
 * Assumes format: "[Topic]", "Topic:", or just extracts first 3 words
 */
function extractTopicFromTitle(title: string): string {
  // Try to extract from brackets [Topic]
  const bracketMatch = title.match(/\[(.*?)\]/)
  if (bracketMatch) {
    return bracketMatch[1].trim()
  }

  // Try to extract before colon: "Topic: description"
  const colonMatch = title.split(':')[0]
  if (colonMatch && colonMatch.length < title.length) {
    return colonMatch.trim()
  }

  // Extract first 3 words as topic
  const words = title.split(' ').slice(0, 3).join(' ')
  return words
}
