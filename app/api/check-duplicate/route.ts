import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PaperComparison {
  title: string;
  authors?: string;
  year?: string;
  link?: string;
  abstract?: string;
  doi?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { newPaper, existingPapers } = await request.json();

    if (!newPaper || !existingPapers || existingPapers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        isDuplicate: false 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Format papers for comparison (include abstract and DOI for better matching)
    const newPaperStr = `Title: ${newPaper.title || 'N/A'}
Authors: ${newPaper.authors || 'N/A'}
Year: ${newPaper.year || 'N/A'}
Link: ${newPaper.link || 'N/A'}
DOI: ${newPaper.doi || 'N/A'}
Abstract: ${newPaper.abstract ? newPaper.abstract.substring(0, 300) : 'N/A'}`;

    const existingPapersStr = existingPapers.map((paper: PaperComparison, index: number) => 
      `Paper ${index + 1}:
Title: ${paper.title || 'N/A'}
Authors: ${paper.authors || 'N/A'}
Year: ${paper.year || 'N/A'}
Link: ${paper.link || 'N/A'}
DOI: ${paper.doi || 'N/A'}
Abstract: ${paper.abstract ? paper.abstract.substring(0, 300) : 'N/A'}`
    ).join('\n\n');

    const prompt = `You are a research paper duplicate detector. Compare the NEW paper with the EXISTING papers to determine if it's a duplicate.

NEW PAPER:
${newPaperStr}

EXISTING PAPERS IN DATABASE:
${existingPapersStr}

Analyze if the NEW paper is the same as any EXISTING paper based on:
1. **DOI Match**: If DOIs are present and identical, they are 100% the same paper
2. **Title similarity**: Even with slight variations in formatting, punctuation, or word order
3. **Author names**: Even if ordered differently, with/without initials, or different formats
4. **Abstract content**: If abstracts are semantically very similar
5. **Publication year**: Must match if other criteria match
6. **URL/Link**: ArXiv IDs, DOIs, or paper IDs that point to the same paper

Consider these the SAME paper if:
- DOIs match (highest priority)
- ArXiv IDs or paper IDs match in URLs
- Titles are semantically identical AND authors match
- Titles are very similar AND abstract content is essentially the same
- Same authors, year, and highly similar titles

Do NOT consider duplicates if:
- Only titles are vaguely similar but authors differ
- Same topic but clearly different papers
- Different years with similar titles

Respond ONLY with valid JSON in this exact format:
{
  "isDuplicate": true/false,
  "matchedPaperIndex": number or null (0-based index if duplicate found),
  "matchedPaperTitle": "title" or null,
  "confidence": "high/medium/low",
  "reason": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback to simple title matching
      return NextResponse.json({ 
        success: true, 
        isDuplicate: false,
        error: 'AI analysis failed, using simple matching'
      });
    }

    return NextResponse.json({ 
      success: true, 
      ...analysisData 
    });

  } catch (error: any) {
    console.error('Duplicate Detection Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        isDuplicate: false,
        error: error.message || 'Failed to check for duplicates' 
      },
      { status: 500 }
    );
  }
}
