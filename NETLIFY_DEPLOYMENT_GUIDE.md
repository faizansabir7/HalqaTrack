# 🚀 Netlify Deployment Guide - Step by Step

Follow this guide to deploy your HalqaTrack application to Netlify and configure your Supabase credentials.

---

## Part 1: Deploy Your Site to Netlify

### Step 1: Push Your Code to GitHub (if not already done)

```bash
git add .
git commit -m "Fixed bugs and added Supabase setup"
git push origin main
```

### Step 2: Connect GitHub to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Log in with your Netlify account
3. Click **"Add new site"** button (top right)
4. Select **"Import an existing project"**

### Step 3: Choose Your Repository

1. Click **"Deploy with GitHub"**
2. If prompted, authorize Netlify to access your GitHub account
3. You'll see a list of your repositories
4. Find and click on **"HalqaTrack"** (or your repository name)

### Step 4: Configure Build Settings

Netlify should automatically detect your settings from `netlify.toml`, but verify:

- **Branch to deploy**: `main` (or your default branch)
- **Build command**: `npm run build` ✅ (auto-detected)
- **Publish directory**: `dist` ✅ (auto-detected)

**Don't add environment variables yet!** Click **"Deploy site"** to continue.

### Step 5: Wait for Initial Deployment

- Netlify will start building your site
- This takes about 2-3 minutes
- You'll see a random URL like: `random-name-123456.netlify.app`
- **The site will show a warning about Supabase credentials** - that's expected!

---

## Part 2: Add Supabase Credentials to Netlify

### Step 1: Get Your Supabase Credentials

First, make sure you have your Supabase credentials ready:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your HalqaTrack project
3. Click the **⚙️ Settings** icon (bottom left sidebar)
4. Click **"API"** in the settings menu
5. Copy these two values:
   - **Project URL** (example: `https://abcdefghijk.supabase.co`)
   - **anon public key** (long string under "Project API keys")

**Keep this tab open** - you'll need to copy-paste these values.

---

### Step 2: Navigate to Environment Variables in Netlify

1. Go back to your Netlify dashboard: [app.netlify.com](https://app.netlify.com)
2. Click on your **HalqaTrack site** (the one you just deployed)
3. Click on **"Site configuration"** in the top menu
4. In the left sidebar, scroll down and click **"Environment variables"**

---

### Step 3: Add VITE_SUPABASE_URL

1. Click the **"Add a variable"** button (or **"Add variable"** dropdown → **"Add a single variable"**)
2. In the form that appears:
   - **Key**: Type exactly `VITE_SUPABASE_URL` (case-sensitive!)
   - **Values**: Select **"Same value for all deploy contexts"**
   - **Value**: Paste your Supabase Project URL (e.g., `https://abcdefghijk.supabase.co`)
3. Click **"Create variable"**

---

### Step 4: Add VITE_SUPABASE_ANON_KEY

1. Click **"Add a variable"** button again
2. In the form:
   - **Key**: Type exactly `VITE_SUPABASE_ANON_KEY` (case-sensitive!)
   - **Values**: Select **"Same value for all deploy contexts"**
   - **Value**: Paste your Supabase anon public key (the long string)
3. Click **"Create variable"**

---

### Step 5: Verify Your Variables

You should now see both variables listed:

```
✅ VITE_SUPABASE_URL = https://your-project.supabase.co
✅ VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 6: Trigger a Redeploy

**Important:** Environment variables only apply to NEW deploys!

1. Go to **"Deploys"** tab (top menu)
2. Click **"Trigger deploy"** dropdown button (top right)
3. Select **"Deploy site"**
4. Wait 2-3 minutes for the new deployment to complete

---

## Part 3: Test Your Live Site

### Step 1: Open Your Site

1. In Netlify, click the **site URL** (something like `random-name-123456.netlify.app`)
2. Your site should now load with live data!

### Step 2: Verify It's Working

You should see:
- ✅ **No warning** about "Supabase credentials missing"
- ✅ **4 areas** on the dashboard (North, South, East, West)
- ✅ Click on an area → see halqas
- ✅ Click "Manage" → open meeting details
- ✅ Make changes → they persist after refresh

---

## 🎉 Success Checklist

- [ ] Site deployed to Netlify
- [ ] Both environment variables added:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Site redeployed after adding variables
- [ ] Live site shows data (not mock data warning)
- [ ] Can create and edit meetings
- [ ] Changes persist after page refresh

---

## 🔧 Troubleshooting

### Still showing "Supabase credentials missing"
- **Check**: Did you redeploy after adding environment variables?
- **Check**: Are the variable names EXACTLY `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`?
- **Fix**: Go to Deploys → Trigger deploy → Deploy site

### Site shows "Build failed"
- **Check**: Look at the deploy logs for errors
- **Common issue**: Missing `netlify.toml` file
- **Fix**: Make sure you pushed the fixed `netlify.toml` to GitHub

### Variables not showing up
- **Check**: Are you in the right site?
- **Check**: Site configuration → Environment variables
- **Fix**: Try adding them again with exact names

### Can't find "Environment variables" in Netlify
- **Update needed**: Netlify may have updated their UI
- **Alternative path**: Site settings → Build & deploy → Environment
- **Still can't find it**: Look for "Environment" or "Environment variables" in any settings menu

---

## 📝 Optional: Customize Your Site URL

By default, Netlify gives you a random URL. You can change it:

1. In Netlify, go to **Site configuration**
2. Click **"Site details"**
3. Under "Site information", click **"Change site name"**
4. Enter a custom name (e.g., `halqatrack-bangalore`)
5. Your new URL will be: `https://halqatrack-bangalore.netlify.app`

---

## 🎯 Next Steps

Once everything is working:
- Share the URL with your team
- Customize member names in each halqa
- Start tracking weekly meetings
- Consider adding a custom domain (optional)

For help with custom domains, see: [Netlify Custom Domains Guide](https://docs.netlify.com/domains-https/custom-domains/)

---

## 📞 Need Help?

If you're stuck, check:
- Netlify Deploy Logs (for build errors)
- Browser Console (F12) for runtime errors
- Supabase Dashboard → API Settings (to verify credentials)

Happy tracking! 🚀
