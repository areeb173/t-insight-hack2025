/**
 * Gemini Insights Generation API
 *
 * POST /api/insights/generate
 * Generates actionable insights for emerging issues using Google Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

interface IssueData {
  topic: string;
  intensity: number;
  sentiment: number;
  sourceCount: number;
  productArea: string;
}

interface InsightsResponse {
  summary: string;
  rootCause: string;
  recommendations: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedImpact: string;
  stakeholders: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY is not configured',
          message: 'Please set GEMINI_API_KEY in your environment variables',
        },
        { status: 500 }
      );
    }

    // Parse request body
    const issueData: IssueData = await request.json();

    if (!issueData.topic || !issueData.productArea) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Missing required fields: topic, productArea',
        },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash (Gemini 2.0 Flash model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create prompt
    const prompt = `You are a customer intelligence analyst for T-Mobile. Analyze the following customer issue and provide actionable insights.

Issue Details:
- Topic: ${issueData.topic}
- Product Area: ${issueData.productArea}
- Intensity Score: ${issueData.intensity} (higher = more signals/mentions)
- Sentiment: ${issueData.sentiment.toFixed(2)} (range: -1 to +1, negative = bad, positive = good)
- Source Count: ${issueData.sourceCount} (number of different data sources reporting this)

Provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the issue and its significance",
  "rootCause": "A brief analysis of likely root causes based on the data",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "priority": "Low" | "Medium" | "High" | "Critical",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "expectedImpact": "Description of potential impact if not addressed",
  "stakeholders": ["Stakeholder 1", "Stakeholder 2", "Stakeholder 3"]
}

Guidelines:
- Priority should be based on intensity and sentiment (high intensity + negative sentiment = high priority)
- Urgency should consider how quickly this needs attention
- Recommendations should be specific and actionable, not generic
- Focus on T-Mobile's product areas: Network, Mobile App, Billing, Home Internet
- Be concise but thorough

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

    // Generate insights
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response (handle potential markdown code blocks)
    let insightsJson: InsightsResponse;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      insightsJson = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      
      // Fallback response
      insightsJson = {
        summary: `This ${issueData.productArea} issue (${issueData.topic}) has an intensity of ${issueData.intensity} and sentiment of ${issueData.sentiment.toFixed(2)}.`,
        rootCause: 'Unable to analyze root cause at this time.',
        recommendations: [
          'Monitor the issue closely',
          'Gather more data from affected sources',
          'Engage with customer support team',
        ],
        priority: issueData.intensity > 100 ? 'High' : issueData.intensity > 50 ? 'Medium' : 'Low',
        urgency: issueData.sentiment < -0.5 ? 'High' : 'Medium',
        expectedImpact: 'Impact assessment unavailable',
        stakeholders: ['Product Team', 'Customer Support', 'Engineering'],
      };
    }

    // Validate and normalize response
    const insights: InsightsResponse = {
      summary: insightsJson.summary || 'No summary available',
      rootCause: insightsJson.rootCause || 'Root cause analysis unavailable',
      recommendations: Array.isArray(insightsJson.recommendations)
        ? insightsJson.recommendations
        : ['No recommendations available'],
      priority: ['Low', 'Medium', 'High', 'Critical'].includes(insightsJson.priority)
        ? insightsJson.priority
        : 'Medium',
      urgency: ['Low', 'Medium', 'High', 'Critical'].includes(insightsJson.urgency)
        ? insightsJson.urgency
        : 'Medium',
      expectedImpact: insightsJson.expectedImpact || 'Impact assessment unavailable',
      stakeholders: Array.isArray(insightsJson.stakeholders)
        ? insightsJson.stakeholders
        : ['Product Team'],
    };

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

