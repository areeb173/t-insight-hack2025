/**
 * Generate Recommended Actions for Product Area API
 *
 * POST /api/insights/product-area-actions
 * Generates 3 recommended actions for a product area using Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY not configured',
          message: 'Please add GEMINI_API_KEY to your .env.local file',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productArea, chi, trend, signalCount, topIssues } = body;

    if (!productArea) {
      return NextResponse.json(
        { error: 'Product area data is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.0-flash';
    console.log(`Using Gemini model: ${modelName} to generate actions for ${productArea.name}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Build context about top issues
    const issuesContext = topIssues && topIssues.length > 0
      ? topIssues.slice(0, 5).map((issue: any, idx: number) => 
          `${idx + 1}. ${issue.topic} (Intensity: ${issue.intensity}, Sentiment: ${issue.sentiment.toFixed(2)})`
        ).join('\n')
      : 'No specific issues identified yet';

    // Build the prompt
    const prompt = `You are a customer experience analyst for a telecommunications company. Generate exactly 3 actionable recommendations for the "${productArea.name}" product area.

Product Area Context:
- Name: ${productArea.name}
- CHI Score: ${chi || 50} (Customer Happiness Index, 0-100, higher is better)
- Trend: ${trend || 0} (positive = improving, negative = declining)
- Signal Count: ${signalCount || 0} (number of customer signals detected)

Top Issues in this Product Area:
${issuesContext}

Generate exactly 3 recommended actions in the following JSON format:
{
  "actions": [
    {
      "title": "First actionable recommendation title (max 60 characters)",
      "description": "Brief description of what to do and why (1-2 sentences)"
    },
    {
      "title": "Second actionable recommendation title (max 60 characters)",
      "description": "Brief description of what to do and why (1-2 sentences)"
    },
    {
      "title": "Third actionable recommendation title (max 60 characters)",
      "description": "Brief description of what to do and why (1-2 sentences)"
    }
  ]
}

Requirements:
1. Actions must be specific and actionable (not generic advice)
2. Prioritize based on CHI score, trend, and top issues
3. Focus on quick wins and high-impact improvements
4. Consider the product area context (Network, Mobile App, Billing, or Home Internet)
5. Make titles concise and clear (under 60 characters)
6. Descriptions should be brief but informative

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    console.log('Generating product area actions with Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini, length:', text.length);

    // Parse the JSON response
    let actionsData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      console.log('Attempting to parse JSON, extracted text length:', jsonText.length);
      actionsData = JSON.parse(jsonText);
      console.log('Successfully parsed actions');
      
      // Ensure we have exactly 3 actions
      if (actionsData.actions && Array.isArray(actionsData.actions)) {
        actionsData.actions = actionsData.actions.slice(0, 3);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response text:', text.substring(0, 500));
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          message: parseError instanceof Error ? parseError.message : 'JSON parse error',
          rawResponse: text.substring(0, 1000),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      actions: actionsData.actions || [],
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating product area actions:', error);
    
    let errorMessage = 'Unknown error';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      console.error('Error stack:', error.stack);
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      const geminiError = error as any;
      if (geminiError.message) {
        errorMessage = geminiError.message;
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to generate actions',
        message: errorMessage,
        details: errorDetails.substring(0, 500),
      },
      { status: 500 }
    );
  }
}

