# Deployment Guide

## Local Development

1. **Start the local server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Visit http://localhost:8080

## Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally (if not already installed):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   
   First time deployment:
   - It will ask you to log in
   - Select "N" when asked "Link to existing project?"
   - Enter a project name or use the default
   - Select the directory (current directory)
   - The deployment will start automatically

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```
   or
   ```bash
   npm run deploy
   ```

### Method 2: Using GitHub Integration

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Method 3: Direct Upload

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Select "Upload" option**
4. **Drag and drop your project folder**

## Environment Variables

No environment variables are required for this static site.

## Custom Domain

After deployment, you can add a custom domain in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain

## Deployment URLs

After deployment, you'll get:
- **Preview URL:** `https://your-project-name.vercel.app`
- **Production URL:** Same as preview URL for production deployments

## Troubleshooting

- If port 3000 is in use, the server defaults to port 8080
- Make sure Node.js is installed (version 14 or higher)
- Clear browser cache if styles don't update