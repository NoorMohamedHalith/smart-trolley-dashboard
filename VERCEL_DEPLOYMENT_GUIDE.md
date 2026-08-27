# Vercel Hosting & Deployment Guide

This project is fully configured and ready for **Vercel** deployment with 1-click SPA routing setup.

---

## ⚡ Method 1: Host via GitHub & Vercel Dashboard (Recommended)

### Step 1: Initialize Git & Push to GitHub
Open PowerShell in `D:\trolley` and run:

```bash
git init
git add .
git commit -m "Initial commit of Smart RFID Trolley Management Dashboard"
```

Then create a new repository on [GitHub](https://github.com/new) named `smart-trolley-dashboard` and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-trolley-dashboard.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Click **"Import"** next to your `smart-trolley-dashboard` repository.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variables** (Optional, or configure inside app UI):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`

5. Click **"Deploy"**! 🚀
   In 30 seconds, Vercel will generate your live production URL (e.g. `https://smart-trolley-dashboard.vercel.app`).

---

## ⚡ Method 2: Deploy Directly via Terminal (Vercel CLI)

1. Open PowerShell in `D:\trolley` and run:
   ```bash
   npx vercel
   ```
2. Log in when prompted.
3. Select defaults for all prompts:
   - *Set up and deploy?* -> `y`
   - *Which scope?* -> `Your Account`
   - *Link to existing project?* -> `n`
   - *Project Name?* -> `smart-trolley-dashboard`
   - *In which directory is code located?* -> `./`
   - *Want to modify settings?* -> `n`
4. Deploy to Production:
   ```bash
   npx vercel --prod
   ```

---

## 🌐 Live Single Page App (SPA) Routing Configuration

`vercel.json` is already created in your root directory:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This guarantees page refreshes and tab navigation work seamlessly without 404 errors on Vercel!
