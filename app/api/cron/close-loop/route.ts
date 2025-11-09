/**
 * Close-the-Loop Cron Endpoint
 * Secured endpoint called by Supabase pg_cron daily
 * Triggers sentiment recovery monitoring for all opportunities marked "done"
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    // Check authorization header
    const expectedAuth = `Bearer ${cronSecret}`
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    console.log('[CRON] Starting close-the-loop monitoring...')

    // Call the close-loop processor
    const response = await fetch(`${baseUrl}/api/process/close-loop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[CRON] Close-loop monitoring failed:', data)
      return NextResponse.json(
        {
          success: false,
          error: 'Close-loop monitoring failed',
          details: data,
        },
        { status: 500 }
      )
    }

    console.log('[CRON] Close-loop monitoring complete:', data)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data,
    })
  } catch (error) {
    console.error('[CRON] Error in close-loop cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
