# Literature Survey Tracker

A collaborative web application for tracking research papers during literature surveys. Built with Next.js, MongoDB, and Google Gemini AI.

## Features

- 📝 Add research papers with title, authors, year, and links
- 🤖 AI-powered summary generation using Google Gemini
- 👥 Team collaboration with status tracking
- ✅ Mark papers as: Not Reviewed, In Progress, or Reviewed
- 🔍 Filter papers by status
- 📱 Responsive design
- ☁️ Serverless deployment on Vercel

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env.local` file has been created with your credentials. Make sure it contains:

```
MONGODB_URI=mongodb+srv://iamnotrohan23_db_user:L2DAYCzo9VYXz73s@cluster0.ctnwvmk.mongodb.net/literature-survey?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSyAwt-3grIHKA9_g972wGiDhVJSTp1NQ00s
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `MONGODB_URI` and `GEMINI_API_KEY`

### Option 2: Deploy via GitHub (Recommended)

1. Create a new GitHub repository

2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

3. Go to [Vercel Dashboard](https://vercel.com/dashboard)

4. Click "Add New Project"

5. Import your GitHub repository

6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GEMINI_API_KEY`: Your Gemini API key

7. Click "Deploy"

## Usage Guide

### Adding a Paper

1. Fill in the paper details (title and your name are required)
2. Optionally click "Generate Summary with AI" to auto-generate notes
3. Click "Add Paper"

### Managing Papers

- **Start Review**: Click to mark a paper as "In Progress"
- **Mark Reviewed**: Click when you've finished reviewing
- **Reset**: Return paper to "Not Reviewed" status
- **Delete**: Remove paper from the database

### Filtering

Use the filter buttons to view:
- All papers
- Only not reviewed papers
- Papers in progress
- Completed reviews

## API Endpoints

- `GET /api/papers` - Fetch all papers
- `POST /api/papers` - Add a new paper
- `GET /api/papers/[id]` - Get a single paper
- `PATCH /api/papers/[id]` - Update a paper
- `DELETE /api/papers/[id]` - Delete a paper
- `POST /api/generate-summary` - Generate AI summary

## Project Structure

```
capstone/
├── app/
│   ├── api/
│   │   ├── papers/
│   │   │   ├── route.ts          # GET all, POST new paper
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PATCH, DELETE single paper
│   │   └── generate-summary/
│   │       └── route.ts          # AI summary generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── lib/
│   └── mongodb.ts                # MongoDB connection utility
├── types/
│   └── paper.ts                  # TypeScript interfaces
├── .env.local                    # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

### Papers Collection

```typescript
{
  _id: ObjectId,
  title: string,
  authors?: string,
  year?: string,
  link?: string,
  summary?: string,
  status: 'not-reviewed' | 'in-progress' | 'reviewed',
  addedBy: string,
  addedAt: Date,
  reviewedBy?: string,
  reviewedAt?: Date,
  notes?: string,
  tags?: string[]
}
```

## Security Notes

- Never commit `.env.local` to Git (it's in `.gitignore`)
- Keep your MongoDB credentials and Gemini API key secure
- For production, consider adding authentication
- Add rate limiting to API routes if needed

## Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas
- Check connection string format
- Ensure network access settings in MongoDB Atlas

### Gemini API Issues
- Verify API key is correct
- Check API quota limits
- Ensure you have Gemini API enabled in Google Cloud Console

### Vercel Deployment Issues
- Ensure all environment variables are set in Vercel dashboard
- Check build logs for errors
- Verify Node.js version compatibility

## Future Enhancements

- [ ] User authentication
- [ ] File upload for PDFs
- [ ] Export to BibTeX/CSV
- [ ] Advanced search and filtering
- [ ] Comments and discussions on papers
- [ ] Email notifications
- [ ] Dark mode

## License

MIT

## Contributors

Created for group literature survey collaboration.
