# Test Data for Literature Survey Tracker

Use these sample papers to test your app:

## Sample Papers You Can Add

### Paper 1: Machine Learning
- **Title**: Attention Is All You Need
- **Authors**: Vaswani et al.
- **Year**: 2017
- **Link**: https://arxiv.org/abs/1706.03762
- **Notes**: Introduced the Transformer architecture

### Paper 2: Computer Vision
- **Title**: Deep Residual Learning for Image Recognition
- **Authors**: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
- **Year**: 2015
- **Link**: https://arxiv.org/abs/1512.03385
- **Notes**: ResNet paper, revolutionized deep learning

### Paper 3: Natural Language Processing
- **Title**: BERT: Pre-training of Deep Bidirectional Transformers
- **Authors**: Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova
- **Year**: 2018
- **Link**: https://arxiv.org/abs/1810.04805
- **Notes**: BERT model for NLP tasks

## Testing Checklist

### Basic Features
- [ ] Add a paper with all fields filled
- [ ] Add a paper with only required fields (title + your name)
- [ ] Try to add a duplicate paper (should show error)
- [ ] View all papers in the grid
- [ ] Click on a paper link (should open in new tab)

### Status Management
- [ ] Mark a paper as "In Progress"
- [ ] Mark a paper as "Reviewed"
- [ ] Reset a paper back to "Not Reviewed"
- [ ] Check that reviewer name appears

### Filtering
- [ ] Filter to show only "Not Reviewed"
- [ ] Filter to show only "In Progress"
- [ ] Filter to show only "Reviewed"
- [ ] Return to "All" view
- [ ] Verify counts are correct

### AI Features
- [ ] Enter a paper title
- [ ] Click "Generate Summary with AI"
- [ ] Wait for summary to appear in notes field
- [ ] Add the paper with generated summary

### Delete
- [ ] Delete a test paper
- [ ] Confirm it's removed from the list

### Multi-User Simulation
- [ ] Add papers as different team members (use different names)
- [ ] Have "Person A" add a paper
- [ ] Have "Person B" mark it in progress
- [ ] Have "Person C" mark it reviewed
- [ ] Verify all names appear correctly

## Expected Behaviors

### Success Messages
- "Paper added successfully!" (green)
- "Summary generated!" (green)
- "Paper deleted" (green)

### Error Messages
- "Title and your name are required" (red)
- "Paper with this title already exists" (red)
- "Failed to generate summary" (red)
- "Failed to fetch papers" (red)

## Performance Tests

### Load Test
- [ ] Add 10+ papers quickly
- [ ] Verify all appear correctly
- [ ] Test filtering with many papers
- [ ] Verify page remains responsive

### Network Test
- [ ] Disconnect internet
- [ ] Try to add a paper (should show error)
- [ ] Reconnect
- [ ] Verify app recovers

## Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if on Mac)
- [ ] Mobile browser (responsive design)

## After Deployment

Test on Vercel:
- [ ] All features work the same as localhost
- [ ] Multiple people can access simultaneously
- [ ] Data persists across sessions
- [ ] Environment variables loaded correctly

## Common Issues & Solutions

### Issue: Papers not loading
**Solution**: Check MongoDB connection string, verify network access

### Issue: AI summary not working
**Solution**: Verify Gemini API key, check API quota

### Issue: Duplicate papers allowed
**Solution**: Check if exact title matching is working

### Issue: Status not updating
**Solution**: Refresh page, check API route logs

---

## Quick Test Script

```
1. Open http://localhost:3000
2. Add paper "Test Paper" by "Your Name"
3. Click "Start Review" → Should show "In Progress"
4. Click "Mark Reviewed" → Should show "Reviewed"
5. Click "Reset" → Should show "Not Reviewed"
6. Click "Delete" → Paper should disappear
```

If all of the above works, your app is ready! 🎉
