/**
 * Release Notes Generation API Route
 * POST - Generate comprehensive release notes using Gemini AI
 * Produces customer-facing, executive, and internal format variants
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { differenceInDays } from 'date-fns'

export const dynamic = 'force-dynamic'

interface OpportunityParams {
  params: Promise<{ id: string }>
}

interface ReleaseNotesRequest {
  format?: 'all' | 'customer-facing' | 'executive' | 'internal'
  style?: 'concise' | 'detailed' | 'narrative'
}

interface ReleaseNotesResponse {
  customerFacing: string
  executiveSummary: string
  internalNotes: string
  suggestedTitle: string
  metadata: {
    chiImprovement: number | null
    sentimentRecovery: number
    affectedCustomers: number
    timeToRecover: string
    detectionDate: string
    fixDate: string
    recoveryDate: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Parse request body
    const body: ReleaseNotesRequest = await request.json().catch(() => ({}))
    const format = body.format || 'all'
    const style = body.style || 'detailed'

    // Validate Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Fetch opportunity with full details
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(id, name, color, description)
      `)
      .eq('id', id)
      .single()

    if (oppError) {
      return NextResponse.json(
        { error: 'Opportunity not found', message: oppError.message },
        { status: 404 }
      )
    }

    // Verify opportunity has close-loop data (should be recovered)
    const closeLoopData = opportunity.meta?.closeloop
    if (!closeLoopData || closeLoopData.status !== 'recovered') {
      return NextResponse.json(
        {
          error: 'Opportunity not ready for release notes',
          message: 'Only opportunities with "recovered" status can generate release notes',
          currentStatus: closeLoopData?.status || 'unknown',
        },
        { status: 400 }
      )
    }

    // Fetch linked signals for customer quotes
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .in('id', opportunity.derived_from_signal_ids || [])
      .order('detected_at', { ascending: true })

    if (signalsError) {
      console.error('Error fetching signals:', signalsError)
    }

    // Calculate metrics
    const recoveryMetrics = closeLoopData.recoveryMetrics
    const chiImprovement = recoveryMetrics?.sentimentChange
      ? Math.round(recoveryMetrics.sentimentChange * 50) // Convert -1 to 1 scale to 0-100
      : null

    const sentimentRecoveryPercent = Math.round(
      ((recoveryMetrics?.afterSentiment || 0) - (recoveryMetrics?.beforeSentiment || 0)) * 100
    )

    const detectionDate = new Date(opportunity.created_at)
    const fixDate = opportunity.marked_done_at ? new Date(opportunity.marked_done_at) : new Date()
    const recoveryDate = closeLoopData.monitoredAt ? new Date(closeLoopData.monitoredAt) : new Date()

    const timeToRecover = differenceInDays(recoveryDate, detectionDate)
    const timeToFix = differenceInDays(fixDate, detectionDate)

    // Prepare customer quotes (top 5 most representative)
    const customerQuotes = (signals || [])
      .filter((s) => s.meta?.text && s.meta.text.length > 20)
      .slice(0, 5)
      .map((s) => `"${s.meta.text}" - ${s.source} (Sentiment: ${s.sentiment.toFixed(2)})`)
      .join('\n')

    // Get PRD if available
    const prd = opportunity.meta?.prd
    const insights = opportunity.meta?.insights

    // Prepare Gemini prompt
    const styleInstructions = {
      concise: 'Keep it brief and to the point. Use bullet points where appropriate.',
      detailed: 'Provide comprehensive details with full context and explanations.',
      narrative: 'Tell a compelling story with a clear beginning (customer pain), middle (solution), and end (impact).',
    }

    const prompt = `You are a senior product communications specialist at T-Mobile. Generate professional release notes for a successfully resolved customer issue.

**Issue Context:**
- Title: ${opportunity.title}
- Product Area: ${opportunity.product_area?.name || 'General'}
- Severity: ${opportunity.severity}
- Detection Date: ${detectionDate.toLocaleDateString()}
- Fix Deployed: ${fixDate.toLocaleDateString()}
- Customer Recovery Confirmed: ${recoveryDate.toLocaleDateString()}
- Total Resolution Time: ${timeToRecover} days (${timeToFix} days to fix + ${timeToRecover - timeToFix} days to recovery)

**Original Customer Feedback (Verbatim Quotes):**
${customerQuotes || 'No customer quotes available'}

**Problem Analysis:**
${prd?.problemStatement || opportunity.description || 'See customer feedback above'}

**Root Cause:**
${insights?.rootCause || 'Technical issue identified and resolved'}

**Solution Implemented:**
${prd?.proposedSolution || 'Fix deployed to address customer concerns'}

**Measurable Impact:**
- Customer Happiness Index (CHI): ${chiImprovement !== null ? `Improved by ${chiImprovement} points` : 'Positive improvement observed'}
- Sentiment Recovery: ${recoveryMetrics?.beforeSentiment?.toFixed(2) || 'baseline'} → ${recoveryMetrics?.afterSentiment?.toFixed(2) || 'improved'} (${sentimentRecoveryPercent > 0 ? '+' : ''}${sentimentRecoveryPercent}%)
- Affected Customers: Approximately ${opportunity.reach} customers impacted
- Signal Reduction: ${recoveryMetrics?.signalCountBefore || 0} complaints → ${recoveryMetrics?.signalCountAfter || 0} complaints (${Math.round(((recoveryMetrics?.signalCountBefore || 0) - (recoveryMetrics?.signalCountAfter || 0)) / (recoveryMetrics?.signalCountBefore || 1) * 100)}% reduction)

**Style Preference:** ${styleInstructions[style]}

---

Generate 3 distinct versions of release notes optimized for different audiences. Each should be well-formatted with markdown.

**Version 1: CUSTOMER-FACING (150-250 words)**
Audience: T-Mobile customers, community members, public communication
Tone: Empathetic, appreciative, clear, and accessible
Focus:
- Acknowledge the customer frustration with specific examples
- Explain what was fixed in plain language (avoid technical jargon)
- Show gratitude for customer feedback and patience
- Quantify the improvement in customer-friendly terms
- End with a forward-looking, positive note

**Version 2: EXECUTIVE SUMMARY (100-150 words)**
Audience: T-Mobile executives, senior leadership, board members
Tone: Professional, data-driven, strategic
Focus:
- Business impact and ROI of the fix
- Key performance metrics (CHI improvement, customer impact)
- Timeline efficiency (detection → fix → recovery)
- Strategic importance to brand and customer retention
- Link to broader product strategy

**Version 3: INTERNAL NOTES (200-300 words)**
Audience: Engineering teams, customer support, product teams
Tone: Technical, detailed, process-oriented
Focus:
- Technical details of what was implemented
- Root cause analysis and lessons learned
- Implementation phases and approach
- Success metrics for monitoring
- Guidance for customer support on handling related inquiries
- Documentation/runbook references if applicable

**Output Format:**
Return ONLY a valid JSON object with this exact structure (no markdown code blocks, no extra text):

{
  "customerFacing": "# [Compelling Title]\\n\\n[Customer-facing content with markdown formatting]",
  "executiveSummary": "# Executive Summary: [Title]\\n\\n[Executive content with markdown formatting]",
  "internalNotes": "# Internal Release Notes: [Title]\\n\\n[Internal content with markdown formatting]",
  "suggestedTitle": "Brief, compelling title for this release (max 60 chars)"
}

IMPORTANT:
- Use \\n for newlines in JSON strings
- Include markdown formatting (headers, bold, bullets, etc.)
- Make each version genuinely distinct (not just rewording the same content)
- Use actual customer quotes where impactful
- Be specific with metrics and timelines
- Return ONLY valid JSON, no markdown code blocks around it`

    // Generate release notes with Gemini
    console.log(`Generating release notes for opportunity ${id} with style: ${style}`)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON response
    let releaseNotesJson: ReleaseNotesResponse
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
      const parsed = JSON.parse(jsonText)

      releaseNotesJson = {
        customerFacing: parsed.customerFacing || 'Release notes generation failed.',
        executiveSummary: parsed.executiveSummary || 'Executive summary generation failed.',
        internalNotes: parsed.internalNotes || 'Internal notes generation failed.',
        suggestedTitle: parsed.suggestedTitle || opportunity.title,
        metadata: {
          chiImprovement,
          sentimentRecovery: sentimentRecoveryPercent,
          affectedCustomers: opportunity.reach,
          timeToRecover: `${timeToRecover} days`,
          detectionDate: detectionDate.toISOString(),
          fixDate: fixDate.toISOString(),
          recoveryDate: recoveryDate.toISOString(),
        },
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', text.substring(0, 500))

      // Fallback release notes
      const fallbackTitle = `${opportunity.product_area?.name || 'Service'} Improvement: ${opportunity.title}`
      releaseNotesJson = {
        customerFacing: `# ${fallbackTitle}\n\nWe've successfully resolved an issue affecting ${opportunity.reach} customers. Customer satisfaction has improved significantly since the fix was deployed.\n\n**Timeline:**\n- Issue detected: ${detectionDate.toLocaleDateString()}\n- Fix deployed: ${fixDate.toLocaleDateString()}\n- Full recovery: ${recoveryDate.toLocaleDateString()}\n\nThank you for your patience and feedback.`,
        executiveSummary: `# Executive Summary: ${fallbackTitle}\n\n**Impact:** ${opportunity.reach} customers affected\n**Resolution Time:** ${timeToRecover} days\n**Sentiment Improvement:** ${sentimentRecoveryPercent > 0 ? '+' : ''}${sentimentRecoveryPercent}%\n\nSuccessfully resolved with measurable customer satisfaction improvement.`,
        internalNotes: `# Internal Notes: ${fallbackTitle}\n\n**Root Cause:** ${insights?.rootCause || 'See opportunity details'}\n**Solution:** ${prd?.proposedSolution || 'Fix deployed'}\n**Metrics:** Sentiment improved from ${recoveryMetrics?.beforeSentiment?.toFixed(2)} to ${recoveryMetrics?.afterSentiment?.toFixed(2)}`,
        suggestedTitle: opportunity.title,
        metadata: {
          chiImprovement,
          sentimentRecovery: sentimentRecoveryPercent,
          affectedCustomers: opportunity.reach,
          timeToRecover: `${timeToRecover} days`,
          detectionDate: detectionDate.toISOString(),
          fixDate: fixDate.toISOString(),
          recoveryDate: recoveryDate.toISOString(),
        },
      }
    }

    // Update opportunity with release notes
    const { error: updateError } = await supabase
      .from('opportunity_cards')
      .update({
        meta: {
          ...opportunity.meta,
          releaseNotes: {
            ...releaseNotesJson,
            generatedAt: new Date().toISOString(),
            format,
            style,
          },
        },
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating opportunity with release notes:', updateError)
    }

    return NextResponse.json({
      success: true,
      releaseNotes: releaseNotesJson,
    })
  } catch (error) {
    console.error('Error in POST /api/opportunities/[id]/release-notes:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate release notes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
