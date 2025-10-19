import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize ArXiv URLs - convert HTML/PDF to abstract page
    let normalizedUrl = url;
    if (url.includes('arxiv.org')) {
      // Extract ArXiv ID (e.g., 2506.07285 or 2506.07285v1)
      const arxivIdMatch = url.match(/(\d{4}\.\d{4,5}(?:v\d+)?)/);
      if (arxivIdMatch) {
        const arxivId = arxivIdMatch[1];
        // Always use the abstract page for consistent extraction
        normalizedUrl = `https://arxiv.org/abs/${arxivId}`;
        console.log(`Normalized ArXiv URL: ${normalizedUrl}`);
      }
    }
    
    // Handle PDF URLs - try to get the parent page or extract from PDF metadata
    const isPDF = url.toLowerCase().endsWith('.pdf');
    if (isPDF) {
      console.log('PDF URL detected, will try to extract from page metadata');
      // For CEUR-WS and similar, the PDF URL itself might have metadata in the HTML wrapper
      // We'll try to fetch the URL anyway and parse what we can
    }

    // Fetch the webpage
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let extractedData: any = {
      title: '',
      authors: '',
      year: '',
      abstract: '',
      doi: '',
      source: url
    };

    // Detect paper source and extract accordingly
    if (normalizedUrl.includes('arxiv.org')) {
      // ArXiv paper
      extractedData.title = $('h1.title').text().replace('Title:', '').replace(/\s+/g, ' ').trim();
      
      // Try multiple selectors for authors
      let authors = $('.authors a').map((_, el: any) => $(el).text()).get().join(', ');
      if (!authors) {
        authors = $('.authors').text().replace('Authors:', '').trim();
      }
      extractedData.authors = authors;
      
      // Try multiple selectors for abstract
      let abstract = $('blockquote.abstract').text().replace('Abstract:', '').trim();
      if (!abstract) {
        abstract = $('.abstract').text().replace('Abstract:', '').trim();
      }
      if (!abstract) {
        abstract = $('meta[property="og:description"]').attr('content') || '';
      }
      extractedData.abstract = abstract;
      
      // Extract year from submission info or dateline
      const submittedText = $('.dateline').text() || $('.submission-history').text();
      const yearMatch = submittedText.match(/\d{4}/);
      extractedData.year = yearMatch ? yearMatch[0] : '';
      
      // Extract ArXiv ID for DOI-like reference
      const arxivIdMatch = normalizedUrl.match(/(\d{4}\.\d{4,5})/);
      if (arxivIdMatch) {
        extractedData.doi = `arXiv:${arxivIdMatch[1]}`;
      }

    } else if (normalizedUrl.includes('doi.org') || normalizedUrl.includes('dx.doi.org')) {
      // DOI redirect - extract DOI
      extractedData.doi = normalizedUrl.split('doi.org/')[1];
      extractedData.title = $('h1').first().text().trim() || $('title').text().trim();
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
      extractedData.abstract = $('meta[name="citation_abstract"]').attr('content') || $('abstract').text().trim();
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] || '';

    } else if (normalizedUrl.includes('scholar.google')) {
      // Google Scholar
      extractedData.title = $('#gsc_oci_title').text().trim() || $('.gs_rt').first().text().trim();
      extractedData.authors = $('.gs_a').first().text().split('-')[0].trim();
      extractedData.abstract = $('#gsc_oci_descr').text().trim();
      const yearMatch = $('.gs_a').text().match(/\d{4}/);
      extractedData.year = yearMatch ? yearMatch[0] : '';

    } else if (normalizedUrl.includes('ieee.org')) {
      // IEEE Xplore
      extractedData.title = $('h1.document-title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
      extractedData.abstract = $('meta[name="citation_abstract"]').attr('content') || $('.abstract-text').text().trim();
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] || '';
      extractedData.doi = $('meta[name="citation_doi"]').attr('content') || '';

    } else if (normalizedUrl.includes('acm.org')) {
      // ACM Digital Library
      extractedData.title = $('h1.citation__title').text().trim() || 
                           $('h1').first().text().trim() ||
                           $('meta[property="og:title"]').attr('content') || 
                           $('meta[name="citation_title"]').attr('content') || '';
      
      // Try multiple selectors for authors
      let authors = $('span[property="author"] span[property="name"]').map((_, el: any) => $(el).text()).get().join(', ');
      if (!authors) {
        authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
      }
      if (!authors) {
        authors = $('.author-name').map((_, el: any) => $(el).text().trim()).get().join(', ');
      }
      if (!authors) {
        // Try from structured data
        authors = $('.loa__item .author-name').map((_, el: any) => $(el).text().trim()).get().join(', ');
      }
      extractedData.authors = authors;
      
      // Try multiple selectors for abstract
      let abstract = $('.abstractSection').text().trim() || 
                    $('.abstractInFull').text().trim() ||
                    $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') ||
                    $('div.abstract').text().trim() || '';
      extractedData.abstract = abstract;
      
      // Try multiple selectors for year
      let year = $('.CitationCoverDate').text().match(/\d{4}/)?.[0] || 
                $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] ||
                $('meta[name="citation_year"]').attr('content') ||
                $('.epub-section__date').text().match(/\d{4}/)?.[0] || '';
      extractedData.year = year;
      
      // Try multiple selectors for DOI
      let doi = $('meta[name="dc.Identifier"]').attr('content') || 
               $('meta[name="citation_doi"]').attr('content') ||
               $('.issue-item__doi').text().replace('https://doi.org/', '').trim() || '';
      extractedData.doi = doi;

    } else if (normalizedUrl.includes('springer.com') || normalizedUrl.includes('link.springer.com')) {
      // Springer
      extractedData.title = $('h1.c-article-title').text().trim() || $('meta[name="citation_title"]').attr('content') || '';
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
      extractedData.abstract = $('section.Abstract p').text().trim() || $('meta[name="description"]').attr('content') || '';
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] || '';
      extractedData.doi = $('meta[name="citation_doi"]').attr('content') || '';

    } else if (normalizedUrl.includes('sciencedirect.com')) {
      // ScienceDirect
      extractedData.title = $('h1.title-text').text().trim() || $('meta[name="citation_title"]').attr('content') || '';
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
      extractedData.abstract = $('#abstracts .abstract').text().trim() || $('meta[name="description"]').attr('content') || '';
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] || '';
      extractedData.doi = $('meta[name="citation_doi"]').attr('content') || '';

    } else if (normalizedUrl.includes('ceur-ws.org')) {
      // CEUR Workshop Proceedings
      // Try to extract from the volume page if it's a PDF
      if (isPDF) {
        // Extract volume and paper number from URL
        const volumeMatch = normalizedUrl.match(/Vol-(\d+)/);
        const paperMatch = normalizedUrl.match(/paper(\d+)\.pdf/);
        
        if (volumeMatch) {
          const volumeUrl = `https://ceur-ws.org/Vol-${volumeMatch[1]}/`;
          console.log(`Trying to fetch CEUR volume page: ${volumeUrl}`);
          
          try {
            const volumeResponse = await fetch(volumeUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            if (volumeResponse.ok) {
              const volumeHtml = await volumeResponse.text();
              const $volume = cheerio.load(volumeHtml);
              
              // Find the paper entry in the table of contents
              const paperFileName = `paper${paperMatch ? paperMatch[1] : ''}.pdf`;
              let foundPaper = false;
              
              $volume('li').each((_, li: any) => {
                const liText = $volume(li).text();
                const liHtml = $volume(li).html() || '';
                
                if (liHtml.includes(paperFileName)) {
                  foundPaper = true;
                  // Extract title (usually in bold or as link text)
                  const titleLink = $volume(li).find('a').first();
                  extractedData.title = titleLink.text().trim();
                  
                  // Extract authors (usually after title, before paper link)
                  const authors = liText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.includes('.pdf') && line !== extractedData.title)
                    .join(', ');
                  
                  extractedData.authors = authors;
                }
              });
              
              // Get year from volume page
              const volumeTitle = $volume('title').text();
              const yearMatch = volumeTitle.match(/\d{4}/);
              extractedData.year = yearMatch ? yearMatch[0] : '';
            }
          } catch (volumeError) {
            console.error('Failed to fetch CEUR volume page:', volumeError);
          }
        }
      }
      
      // Fallback: try to extract from PDF page metadata
      if (!extractedData.title) {
        extractedData.title = $('meta[name="citation_title"]').attr('content') || 
                             $('title').text().replace('.pdf', '').trim();
        extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ');
        extractedData.year = $('meta[name="citation_year"]').attr('content') || '';
      }

    } else if (isPDF) {
      // Generic PDF handling - try to extract from any PDF page
      console.log('Generic PDF URL, attempting to extract metadata');
      
      // Try common PDF metadata tags
      extractedData.title = $('meta[name="citation_title"]').attr('content') ||
                           $('meta[name="DC.title"]').attr('content') ||
                           $('meta[property="og:title"]').attr('content') ||
                           $('title').text().replace('.pdf', '').replace(/\s+/g, ' ').trim();
      
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ') ||
                             $('meta[name="DC.creator"]').map((_, el: any) => $(el).attr('content')).get().join(', ') ||
                             $('meta[name="author"]').attr('content') || '';
      
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] ||
                          $('meta[name="citation_year"]').attr('content') ||
                          $('meta[name="DC.date"]').attr('content')?.match(/\d{4}/)?.[0] || '';
      
      extractedData.abstract = $('meta[name="citation_abstract"]').attr('content') ||
                              $('meta[name="DC.description"]').attr('content') ||
                              $('meta[name="description"]').attr('content') || '';
      
      extractedData.doi = $('meta[name="citation_doi"]').attr('content') ||
                         $('meta[name="DC.identifier"]').attr('content') || '';

    } else {
      // Generic fallback - try common meta tags
      extractedData.title = $('meta[name="citation_title"]').attr('content') ||
                           $('meta[property="og:title"]').attr('content') ||
                           $('h1').first().text().trim() ||
                           $('title').text().trim();
      
      extractedData.authors = $('meta[name="citation_author"]').map((_, el: any) => $(el).attr('content')).get().join(', ') ||
                             $('meta[name="author"]').attr('content') || '';
      
      extractedData.abstract = $('meta[name="citation_abstract"]').attr('content') ||
                              $('meta[name="description"]').attr('content') ||
                              $('abstract').text().trim() || '';
      
      extractedData.year = $('meta[name="citation_publication_date"]').attr('content')?.match(/\d{4}/)?.[0] ||
                          $('meta[name="citation_year"]').attr('content') || '';
      
      extractedData.doi = $('meta[name="citation_doi"]').attr('content') || '';
    }

    // Clean up extracted data
    extractedData.title = extractedData.title.trim();
    extractedData.authors = extractedData.authors.trim();
    extractedData.abstract = extractedData.abstract.trim().substring(0, 2000); // Limit abstract length
    extractedData.year = extractedData.year.trim();
    extractedData.doi = extractedData.doi.trim();
    extractedData.source = normalizedUrl; // Use normalized URL

    // If we couldn't extract anything meaningful, return error
    if (!extractedData.title && !extractedData.abstract) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not extract paper information from URL. Please enter details manually.',
          details: `Tried to extract from: ${normalizedUrl}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: extractedData 
    });

  } catch (error: any) {
    console.error('Paper Extraction Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to extract paper information',
        details: 'The URL might be inaccessible, require authentication, or be in an unsupported format. Try using the abstract/main page URL instead of PDF or HTML versions.',
        suggestion: 'For ArXiv papers, use: https://arxiv.org/abs/PAPER_ID'
      },
      { status: 500 }
    );
  }
}
