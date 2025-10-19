# 🤖 Smart Paper Extraction & Duplicate Detection

## Overview

The Literature Survey Tracker now features an **intelligent automated workflow** that:
1. **Extracts paper metadata** from URLs (title, authors, abstract, DOI)
2. **Checks for duplicates** using AI-powered semantic matching  
3. **Generates summaries** automatically using Google Gemini

## New Automated Flow

### When You Add a Paper

```
User pastes paper URL
        ↓
Step 1: 🕷️ Crawl & Extract
   - Extract title, authors, year, abstract, DOI
   - Supports ArXiv, IEEE, ACM, Springer, etc.
        ↓
Step 2: 🔍 Duplicate Detection  
   - AI compares with ALL existing papers
   - Checks title, authors, abstract, DOI, URLs
   - Prevents duplicates even with variations
        ↓
Step 3: ✨ AI Summary Generation
   - Gemini analyzes abstract + title
   - Generates comprehensive summary
   - Extracts key findings & methodology
        ↓
Step 4: 💾 Save to Database
   - Paper saved with all metadata
   - Ready for team review
```

## Supported Paper Sources

### ✅ Fully Supported
- **ArXiv** (arxiv.org)
- **IEEE Xplore** (ieeexplore.ieee.org)
- **ACM Digital Library** (dl.acm.org)
- **Springer** (link.springer.com)
- **ScienceDirect** (sciencedirect.com)
- **DOI Links** (doi.org, dx.doi.org)
- **Google Scholar** (scholar.google.com)

### Partial Support
- Any site with standard meta tags (citation_title, citation_author, etc.)

## Duplicate Detection Intelligence

### What Gets Compared

1. **DOI Matching** (Highest Priority)
   - If DOIs match → 100% duplicate
   - Most reliable identifier

2. **URL/ArXiv ID Matching**
   - Extracts paper IDs from URLs
   - Matches even if from different mirrors

3. **Title + Authors + Year**
   - Semantic title comparison
   - Author name format variations
   - Year must match

4. **Abstract Similarity**
   - Compares abstract content
   - Catches papers with slightly different titles

### Examples of Detected Duplicates

#### Example 1: Same Paper, Different URLs
```
Paper 1: https://arxiv.org/abs/1706.03762
Paper 2: https://papers.nips.cc/paper/7181-attention
Result: ⚠️ DUPLICATE (same ArXiv ID)
```

#### Example 2: Title Variations
```
Paper 1: "Attention Is All You Need"
Paper 2: "attention is all you need" 
Result: ⚠️ DUPLICATE (semantic match)
```

#### Example 3: Author Format Differences
```
Paper 1: Authors: "Vaswani, A., Shazeer, N."
Paper 2: Authors: "Ashish Vaswani, Noam Shazeer"
Result: ⚠️ DUPLICATE (same authors)
```

#### Example 4: DOI Match
```
Paper 1: DOI: 10.1234/example
Paper 2: DOI: 10.1234/example
Result: ⚠️ DUPLICATE (DOI match - highest confidence)
```

## Web Crawling Details

### Extraction Process

```javascript
1. Fetch webpage HTML
2. Parse with Cheerio (jQuery-like)
3. Extract using source-specific selectors:
   
   ArXiv:
   - Title: h1.title
   - Authors: .authors a
   - Abstract: blockquote.abstract
   
   IEEE:
   - Title: meta[name="citation_title"]
   - Authors: meta[name="citation_author"]
   - DOI: meta[name="citation_doi"]
   
   // ...and more
4. Clean and normalize data
5. Return structured JSON
```

### What Gets Extracted

```typescript
{
  title: string,        // Paper title
  authors: string,      // Author names (comma-separated)
  year: string,         // Publication year
  abstract: string,     // Full abstract (up to 2000 chars)
  doi: string,          // DOI if available
  source: string        // Original URL
}
```

## AI Summary Generation

### Enhanced with Abstract

When abstract is available:
```
Summary includes:
- Brief overview (2-3 sentences)
- Main findings/contributions
- Key methodology
- Potential applications
- Significance to field
```

### Fallback (No Abstract)

```
Summary based on:
- Title only
- Link metadata
- Limited but still useful
```

## User Experience

### Option 1: URL Only (Recommended 🌟)

```
1. Paste paper URL: https://arxiv.org/abs/1234.5678
2. Enter your name
3. Click "Add Paper"

✅ Result:
- Title automatically filled
- Authors extracted
- Abstract retrieved
- Summary generated
- Duplicate check performed
- Paper saved!
```

### Option 2: Manual Entry

```
1. Enter title manually
2. (Optional) Enter authors, year
3. Enter your name
4. Click "Add Paper"

✅ Result:
- Duplicate check (title-based)
- Manual summary (or generate with button)
- Paper saved
```

### Option 3: URL + Manual Override

```
1. Paste URL (data extracted)
2. Edit any field if extraction wrong
3. Your edits take priority
4. Click "Add Paper"

✅ Result:
- Best of both: automated + manual control
```

## Error Handling

### Extraction Fails
```
Error: "Could not extract paper information from URL"
Fallback: Use manually entered data
```

### Duplicate Detected
```
Error: "🔍 Duplicate Detected: This paper appears to be..."
Action: Paper NOT added
Info: Shows who added original, why it's a duplicate
```

### AI Summary Fails
```
Fallback: Paper still added without AI summary
User can add notes manually
```

### Crawling Blocked
```
Some sites block scrapers
Fallback: Manual entry or try different URL
```

## Performance

### Typical Times

- **URL Extraction**: 1-3 seconds
- **Duplicate Check**: 2-4 seconds (with AI)
- **Summary Generation**: 3-5 seconds
- **Total**: ~5-10 seconds per paper

### Optimization

- Parallel processing where possible
- Caching (future enhancement)
- Fallback to simpler methods if AI slow

## API Endpoints

### POST /api/extract-paper
```json
Request:
{
  "url": "https://arxiv.org/abs/1234.5678"
}

Response:
{
  "success": true,
  "data": {
    "title": "...",
    "authors": "...",
    "year": "...",
    "abstract": "...",
    "doi": "..."
  }
}
```

### POST /api/check-duplicate
```json
Request:
{
  "newPaper": { title, authors, year, link, abstract, doi },
  "existingPapers": [{ same fields }]
}

Response:
{
  "success": true,
  "isDuplicate": true/false,
  "matchedPaperIndex": 0,
  "matchedPaperTitle": "...",
  "confidence": "high/medium/low",
  "reason": "..."
}
```

### POST /api/generate-summary
```json
Request:
{
  "title": "...",
  "link": "...",
  "abstract": "..."  // New! More detailed summaries
}

Response:
{
  "success": true,
  "data": {
    "summary": "...",
    "findings": "...",
    "methodology": "...",
    "significance": "..."
  }
}
```

## Benefits

### For Users
✅ **One-click adding** - Just paste URL
✅ **No manual typing** - Automatic extraction
✅ **Instant summaries** - AI-generated
✅ **Duplicate prevention** - Never add same paper twice
✅ **Time savings** - 90% less manual work

### For Teams
✅ **Consistency** - All papers have full metadata
✅ **Quality** - Automatic summaries for all papers
✅ **No confusion** - Duplicates caught immediately
✅ **Better organization** - Complete paper information
✅ **Faster surveys** - More papers processed quickly

## Limitations

### Current Limitations

1. **Paywalled Papers**: Can't extract from paywalled content
2. **JavaScript-Heavy Sites**: Some sites need browser rendering
3. **Rate Limiting**: Sites may block too many requests
4. **Accuracy**: Extraction not 100% perfect
5. **Language**: Works best with English papers

### Workarounds

- Use ArXiv/preprint versions when available
- Try different URLs (DOI, ArXiv, Google Scholar)
- Manual entry always available as fallback
- Edit extracted data if incorrect

## Future Enhancements

### Planned Features

- [ ] PDF parsing (extract from PDF directly)
- [ ] Browser extension (one-click from any site)
- [ ] Batch import (multiple URLs at once)
- [ ] Citation extraction (references and cited-by)
- [ ] arXiv API integration (faster, more reliable)
- [ ] DOI.org API integration
- [ ] Semantic Scholar API
- [ ] Google Scholar API (if available)

### Possible Improvements

- [ ] Cache extracted papers (avoid re-crawling)
- [ ] User feedback on extraction accuracy
- [ ] Confidence scores for extractions
- [ ] Multiple URL support per paper
- [ ] Version tracking (preprint vs published)

## Troubleshooting

### "Could not extract paper information"

**Causes:**
- URL is paywalled
- Site blocks scrapers
- Unsupported site format

**Solutions:**
1. Try ArXiv version if available
2. Use DOI link instead
3. Try Google Scholar link
4. Fall back to manual entry

### "Duplicate detected but papers are different"

**Causes:**
- Similar titles, same authors
- AI false positive (rare)
- Related papers (sequel, extension)

**What to do:**
1. Check the reason given
2. Verify if truly different
3. Contact admin if needed
4. Add with more distinguishing info

### Extraction is slow or timing out

**Causes:**
- Site is slow to respond
- Network issues
- Heavy page with lots of content

**Solutions:**
1. Try again (might be temporary)
2. Use simpler URL (direct PDF link)
3. Manual entry as fallback

## Testing

### Test URLs

```
ArXiv:
https://arxiv.org/abs/1706.03762

IEEE:
https://ieeexplore.ieee.org/document/8578166

DOI:
https://doi.org/10.1145/3313831.3376727

ACM:
https://dl.acm.org/doi/10.1145/3313831.3376727
```

### Test Duplicates

1. Add paper via URL
2. Try adding same paper with different URL
3. Should detect duplicate

## Dependencies

```json
{
  "cheerio": "^1.0.0-rc.12",  // HTML parsing
  "@google/generative-ai": "^0.2.1",  // AI summaries & duplicate detection
  "mongodb": "^6.3.0"  // Database
}
```

## Security & Privacy

### Safe Practices

✅ Only fetches public paper pages
✅ No authentication bypassing
✅ Respects robots.txt (best effort)
✅ No personal data scraped
✅ URLs validated before crawling

### Not Allowed

❌ Bypassing paywalls
❌ Scraping user data
❌ Excessive rate limiting violations
❌ Malicious URL injection

---

**Status**: ✅ Fully Implemented & Working

**Last Updated**: October 19, 2025

**Version**: 2.0 - Smart Extraction Edition
