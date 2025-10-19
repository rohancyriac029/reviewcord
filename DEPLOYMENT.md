# DEPLOYMENT GUIDE

## Quick Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Don't add any files (README, .gitignore, etc.)

2. **Push Your Code**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Literature Survey Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com/
   - Sign up or log in (use GitHub account for easy setup)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings ✅

4. **Add Environment Variables**
   Before deploying, add these in the Environment Variables section:
   
   ```
   MONGODB_URI
   mongodb+srv://iamnotrohan23_db_user:L2DAYCzo9VYXz73s@cluster0.ctnwvmk.mongodb.net/literature-survey?retryWrites=true&w=majority
   
   GEMINI_API_KEY
   AIzaSyAwt-3grIHKA9_g972wGiDhVJSTp1NQ00s
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? → Yes
   - Which scope? → Your account
   - Link to existing project? → No
   - Project name? → Press Enter (use folder name)
   - Directory? → Press Enter (current directory)
   - Override settings? → No

4. **Add Environment Variables**
   ```powershell
   vercel env add MONGODB_URI
   ```
   Paste your MongoDB URI when prompted
   
   ```powershell
   vercel env add GEMINI_API_KEY
   ```
   Paste your Gemini API key when prompted

5. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

## Post-Deployment

### 1. Test Your Deployment
- Visit your Vercel URL
- Try adding a paper
- Test the AI summary generation
- Check all filters and status updates

### 2. Share with Your Team
- Send them the Vercel URL
- Everyone can now add and review papers
- No authentication needed (public access)

### 3. MongoDB Atlas Configuration
If you get connection errors:

1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in the left sidebar
3. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   - This is needed for Vercel's dynamic IPs
4. Save

### 4. Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Updating Your App

After making changes:

### If using GitHub + Vercel:
```powershell
git add .
git commit -m "Your update message"
git push
```
Vercel will automatically redeploy!

### If using Vercel CLI:
```powershell
vercel --prod
```

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript types are correct

### Database Connection Errors
- Verify MongoDB URI in Vercel environment variables
- Check MongoDB Atlas network access settings
- Ensure database name is included in connection string

### Gemini API Errors
- Verify API key in Vercel environment variables
- Check API quota in Google Cloud Console
- Ensure Generative Language API is enabled

### 404 on API Routes
- Next.js API routes should work automatically
- Check file structure matches: app/api/papers/route.ts
- Rebuild the project: `vercel --prod --force`

## Environment Variables Security

⚠️ **IMPORTANT**: 
- Never commit .env.local to Git
- The .gitignore file already excludes it
- Environment variables on Vercel are secure and encrypted
- Each team member should NOT need access to the keys
- Only you (deployer) needs them

## Monitoring

### View Logs
1. Go to Vercel dashboard
2. Select your project
3. Click on a deployment
4. View "Functions" logs for API errors

### Analytics
- Vercel provides basic analytics
- View visitor count and page views in dashboard

## Cost
- Vercel: FREE for hobby projects ✅
- MongoDB Atlas: FREE tier (512MB) ✅
- Google Gemini: FREE tier (60 requests/minute) ✅

Perfect for student projects!

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test MongoDB connection from local dev first
4. Check Google Cloud Console for Gemini API status

## Quick Reference Commands

```powershell
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

---

**Your app will be live at**: `https://your-project-name.vercel.app`

Share this URL with your team members to start collaborating! 🚀
