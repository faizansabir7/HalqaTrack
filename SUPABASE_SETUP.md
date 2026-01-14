# 🚀 Complete Supabase Setup Guide

Follow these steps to set up your database and get the application running with live data.

---

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Project Name**: HalqaTrack (or your preferred name)
   - **Database Password**: Choose a strong password (save it somewhere safe!)
   - **Region**: Choose the closest region to your users
5. Click **"Create new project"** and wait 2-3 minutes for setup to complete

---

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase_schema.sql` from your project root
4. **Copy ALL the contents** and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see a success message: "Success. No rows returned"

**What this does:**
- Creates 3 tables: `areas`, `halqas`, and `meetings`
- Sets up Row Level Security (RLS) policies
- Configures permissions for public access

---

## Step 3: Load Sample Data

1. Still in the **SQL Editor**, click **"New query"** again
2. Open the file `supabase_seed_data.sql` from your project root
3. **Copy ALL the contents** and paste into the SQL Editor
4. Click **"Run"**
5. You should see a success message showing rows inserted

**What this does:**
- Adds 4 areas (North, South, East, West)
- Adds 34 halqas across all areas
- Each halqa comes with 5 sample members

---

## Step 4: Get Your API Credentials

1. In your Supabase dashboard, click the **⚙️ Settings** icon (bottom left)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** (something like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. **Copy both values** - you'll need them in the next step

---

## Step 5: Configure Local Environment

### For Local Development:

1. In your project root (same level as `package.json`), create a file named `.env`
2. Add the following content (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

3. **Save the file**
4. If your dev server is running, **restart it**:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"** and add both:
   - Key: `VITE_SUPABASE_URL` | Value: Your project URL
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: Your anon key
5. Redeploy your site

---

## Step 6: Test Your Setup

1. Open your application in the browser (http://localhost:5174/)
2. You should see:
   - ✅ 4 areas on the dashboard (North, South, East, West)
   - ✅ Click on an area to see all halqas
   - ✅ Click "Manage" on any halqa to open meeting details
3. Test these features:
   - **Mark attendance**: Click on member names to toggle attendance
   - **Check agenda items**: Toggle agenda checkboxes
   - **Edit members**: Click "Manage Members" to add/edit/remove members
   - **Save**: Click "Save & Return" to persist changes

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Schema SQL executed successfully
- [ ] Seed data loaded (34 halqas visible)
- [ ] API credentials copied
- [ ] `.env` file created locally
- [ ] Environment variables set in Netlify
- [ ] Application shows live data (not mock data)
- [ ] Can create and edit meetings
- [ ] Can manage members
- [ ] Changes persist after page refresh

---

## 🔧 Troubleshooting

### "Supabase credentials missing" warning
- Check if `.env` file exists in project root
- Verify the variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating/editing `.env`

### No data showing
- Verify schema SQL ran successfully (check Supabase Table Editor)
- Verify seed data SQL ran successfully (should see 4 rows in `areas` table)
- Check browser console for errors

### Permission errors
- Verify RLS policies were created (check in Supabase → Authentication → Policies)
- Make sure you're using the **anon public** key, not the service role key

### Changes not saving
- Check browser console for errors
- Verify your Supabase project is active and not paused
- Check if RLS policies allow INSERT/UPDATE operations

---

## 🎉 You're All Set!

Your application is now connected to a live Supabase database. All changes you make will be persisted and can be accessed from anywhere.

**Next Steps:**
- Customize member names for each halqa
- Start tracking weekly meetings
- Explore the admin features
- Set up proper authentication (for production use)

For questions or issues, check the Supabase docs at [supabase.com/docs](https://supabase.com/docs)
