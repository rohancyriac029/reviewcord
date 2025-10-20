import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Paper, PaperInput } from '@/types/paper';

// GET all papers
export async function GET() {
  try {
    const db = await getDatabase();
    const papers = await db
      .collection<Paper>('papers')
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: papers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST a new paper
export async function POST(request: NextRequest) {
  try {
    const body: PaperInput = await request.json();

    if (!body.addedBy) {
      return NextResponse.json(
        { success: false, error: 'Your name is required' },
        { status: 400 }
      );
    }

    let paperData = {
      title: body.title || '',
      authors: body.authors || '',
      year: body.year || '',
      link: body.link || '',
      abstract: '',
      doi: '',
      notes: body.notes || ''
    };

    // STEP 1: If link is provided, extract paper information
    if (body.link && body.link.trim()) {
      try {
        console.log('Extracting paper data from URL:', body.link);
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const extractResponse = await fetch(`${protocol}://${host}/api/extract-paper`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: body.link })
        });

        const extractResult = await extractResponse.json();

        if (extractResult.success && extractResult.data) {
          // Use extracted data, but allow user-provided data to override if present
          paperData = {
            title: body.title || extractResult.data.title || '',
            authors: body.authors || extractResult.data.authors || '',
            year: body.year || extractResult.data.year || '',
            link: body.link,
            abstract: extractResult.data.abstract || '',
            doi: extractResult.data.doi || '',
            notes: body.notes || ''
          };
          console.log('Successfully extracted paper data:', paperData.title);
        } else {
          console.log('Could not extract from URL, using provided data');
        }
      } catch (extractError) {
        console.error('Paper extraction failed:', extractError);
        // Continue with user-provided data
      }
    }

    // Validate we have at least a title
    if (!paperData.title || paperData.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Paper title is required. Either provide a title or a valid paper URL.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // STEP 2: Get all existing papers for duplicate detection
    const existingPapers = await db
      .collection<Paper>('papers')
      .find({})
      .project({ title: 1, authors: 1, year: 1, link: 1, addedBy: 1, summary: 1, doi: 1 })
      .toArray();

    // STEP 3: Use AI to check for duplicates with extracted data
    if (existingPapers.length > 0) {
      try {
        console.log('Checking for duplicates...');
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const duplicateCheckResponse = await fetch(`${protocol}://${host}/api/check-duplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newPaper: {
              title: paperData.title,
              authors: paperData.authors,
              year: paperData.year,
              link: paperData.link,
              abstract: paperData.abstract,
              doi: paperData.doi
            },
            existingPapers: existingPapers.map(p => ({
              title: p.title,
              authors: p.authors,
              year: p.year,
              link: p.link,
              abstract: p.summary || '',
              doi: (p as any).doi || ''
            }))
          })
        });

        const duplicateCheck = await duplicateCheckResponse.json();

        if (duplicateCheck.success && duplicateCheck.isDuplicate) {
          const matchedPaper = existingPapers[duplicateCheck.matchedPaperIndex];
          console.log('Duplicate found:', matchedPaper?.title);
          return NextResponse.json(
            { 
              success: false, 
              error: `🔍 Duplicate Detected: This paper appears to be "${duplicateCheck.matchedPaperTitle || matchedPaper?.title}" (added by ${matchedPaper?.addedBy}). ${duplicateCheck.reason}`,
              isDuplicate: true,
              matchedPaper: matchedPaper
            },
            { status: 409 }
          );
        }
        console.log('No duplicates found');
      } catch (aiError) {
        console.error('AI duplicate check failed:', aiError);
        // Continue without duplicate check rather than blocking
      }
    }

    // STEP 4: Generate AI summary if we have enough information
    let aiSummary = '';
    if (paperData.abstract || paperData.title) {
      try {
        console.log('Generating AI summary...');
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const summaryResponse = await fetch(`${protocol}://${host}/api/generate-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: paperData.title,
            link: paperData.link,
            abstract: paperData.abstract
          })
        });

        const summaryResult = await summaryResponse.json();
        if (summaryResult.success && summaryResult.data) {
          // Use the formatted summary text
          aiSummary = summaryResult.data.summary || summaryResult.data.raw || '';
          console.log('AI summary generated');
        }
      } catch (summaryError) {
        console.error('AI summary generation failed:', summaryError);
        // Continue without summary
      }
    }

    // STEP 5: Save paper to database
    const newPaper: any = {
      title: paperData.title,
      authors: paperData.authors,
      year: paperData.year,
      link: paperData.link,
      summary: aiSummary,
      abstract: paperData.abstract,
      doi: paperData.doi,
      status: 'not-reviewed',
      addedBy: body.addedBy,
      addedAt: new Date(),
      notes: paperData.notes,
      tags: body.tags || [],
    };

    console.log('Saving paper to database:', newPaper.title);
    const result = await db.collection<Paper>('papers').insertOne(newPaper as Paper);
    
    return NextResponse.json(
      { 
        success: true, 
        data: { _id: result.insertedId, ...newPaper },
        extracted: !!paperData.abstract // Let frontend know if data was extracted
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding paper:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
