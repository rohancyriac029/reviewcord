import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { title, link, abstract } = await request.json();

    if (!title && !link && !abstract) {
      return NextResponse.json(
        { success: false, error: 'Title, link, or abstract is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    let prompt = '';
    
    if (abstract && abstract.trim()) {
      // If we have abstract, generate detailed summary from it
      prompt = `Given this research paper:

Title: ${title || 'Not provided'}
Link: ${link || 'Not provided'}

Abstract:
${abstract}

Please provide a comprehensive summary including:
1. A brief summary (2-3 sentences)
2. Main findings or contributions
3. Key methodology (if mentioned)
4. Potential applications or significance

Format the response as JSON with keys: summary, findings, methodology, significance`;
    } else {
      // Fallback to title/link only
      prompt = `Given this research paper ${title ? `titled "${title}"` : ''} ${link ? `with link: ${link}` : ''}, provide:
1. A brief summary (2-3 sentences)
2. Main findings or contributions  
3. Key methodology (if applicable)

Format the response as JSON with keys: summary, findings, methodology`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse as JSON, if it fails return the raw text
    let parsedData;
    let summaryText = '';
    
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanedText);
      
      // Create a formatted summary from the JSON fields
      summaryText = '';
      if (parsedData.summary) {
        summaryText += parsedData.summary + '\n\n';
      }
      if (parsedData.findings) {
        summaryText += '**Key Findings:** ' + parsedData.findings + '\n\n';
      }
      if (parsedData.methodology) {
        summaryText += '**Methodology:** ' + parsedData.methodology + '\n\n';
      }
      if (parsedData.significance) {
        summaryText += '**Significance:** ' + parsedData.significance;
      }
      
      summaryText = summaryText.trim();
      
    } catch {
      // If JSON parsing fails, use the raw text
      summaryText = text;
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        summary: summaryText,
        raw: parsedData || text 
      } 
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
