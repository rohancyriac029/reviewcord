# 🚀 QUICK START GUIDE

## Your Literature Survey Tracker is Ready!

### ✅ What's Been Set Up

1. **Next.js Application** - Full-stack React app with TypeScript
2. **MongoDB Integration** - Your database is connected and ready
3. **Google Gemini AI** - Automatic paper summary generation
4. **Serverless API Routes** - Ready for Vercel deployment
5. **Beautiful UI** - Responsive design with status tracking

---

## 🏃 Run Locally (RIGHT NOW)

Your server is already running! Open your browser and go to:
**http://localhost:3000**

If you need to start it again:
```powershell
npm run dev
```

---

## 📋 How to Use

### Adding a Paper
1. Fill in the paper title (required)
2. Add authors, year, and link (optional)
3. Enter your name (required)
4. Click "✨ Generate Summary with AI" to auto-generate notes (optional)
5. Click "Add Paper"

### Tracking Progress
- **📖 Start Review** - When someone begins reading
- **✅ Mark Reviewed** - When finished reviewing
- **↩️ Reset** - Return to not-reviewed status
- **🗑️ Delete** - Remove from database

### Filtering
Use the filter buttons to view:
- All papers
- Not Reviewed
- In Progress  
- Reviewed

---

## 🌐 Deploy to Vercel (Make it Live for Your Team)

### Option 1: GitHub + Vercel (Recommended - Takes 5 minutes)

1. **Create GitHub Repo**
   - Go to https://github.com/new
   - Create a new repository (e.g., "literature-survey-tracker")
   - Don't initialize with anything

2. **Push Your Code**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com/
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - **IMPORTANT**: Before deploying, add Environment Variables:
     - Click "Environment Variables"
     - Add `MONGODB_URI` with value:
       ```
       mongodb+srv://iamnotrohan23_db_user:L2DAYCzo9VYXz73s@cluster0.ctnwvmk.mongodb.net/literature-survey?retryWrites=true&w=majority
       ```
     - Add `GEMINI_API_KEY` with value:
       ```
       AIzaSyAwt-3grIHKA9_g972wGiDhVJSTp1NQ00s
       ```
   - Click "Deploy"

4. **Done!** 🎉
   - You'll get a URL like: `https://your-project.vercel.app`
   - Share this with your team members!

### Option 2: Vercel CLI (Alternative)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
# Then deploy to production
vercel --prod
```

---

## 🔧 Important: MongoDB Configuration

If you get connection errors after deployment:

1. Go to https://cloud.mongodb.com/
2. Log in to your account
3. Click "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Choose "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"

This is necessary because Vercel uses dynamic IPs.

---

## 📁 Project Structure

```
capstone/
├── app/
│   ├── api/               # Serverless API routes
│   │   ├── papers/        # CRUD operations
│   │   └── generate-summary/  # AI summary
│   ├── page.tsx           # Main UI
│   └── globals.css        # Styling
├── lib/
│   └── mongodb.ts         # Database connection
├── types/
│   └── paper.ts           # TypeScript types
├── .env.local             # Your credentials (DO NOT COMMIT)
└── package.json           # Dependencies
```

---

## 🎯 Features

✅ Add papers with title, authors, year, link  
✅ AI-powered summary generation  
✅ Status tracking (Not Reviewed → In Progress → Reviewed)  
✅ Filter by status  
✅ See who added/reviewed each paper  
✅ Add notes and summaries  
✅ Responsive design  
✅ Real-time updates  
✅ Delete papers  

---

## 💡 Tips

1. **Always enter your name** when adding or reviewing papers so teammates know who did what

2. **Use AI Summary** for quick paper overviews:
   - Enter title and/or link
   - Click "Generate Summary with AI"
   - Wait a few seconds
   - Summary appears in the notes field

3. **Filter to avoid duplicates**:
   - Before adding a paper, check if it's already there
   - The system prevents exact duplicate titles

4. **Track progress**:
   - Mark papers as "In Progress" when you start
   - This prevents others from duplicating work

---

## 🐛 Troubleshooting

### "Failed to fetch papers"
- Check if your MongoDB URI is correct in .env.local
- Ensure MongoDB Atlas network access allows your IP

### "Failed to generate summary"  
- Verify Gemini API key is correct
- Check you haven't exceeded API quota (60 requests/minute)

### Port 3000 already in use
```powershell
# Stop the current dev server (Ctrl+C)
# Then start on a different port
$env:PORT=3001; npm run dev
```

---

## 📞 Need Help?

Check these files for more details:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide

---

## 🎉 You're All Set!

1. Your app is running at **http://localhost:3000**
2. Test it with your team locally
3. Deploy to Vercel when ready
4. Share the Vercel URL with your team
5. Start tracking papers!

**No authentication needed** - Everyone on your team can access it freely.

---

## Next Steps

1. ✅ Test locally (http://localhost:3000)
2. ✅ Add a few test papers
3. ✅ Try the AI summary feature
4. ✅ Deploy to Vercel
5. ✅ Share with team
6. ✅ Start your literature survey!

Good luck with your project! 🚀📚
