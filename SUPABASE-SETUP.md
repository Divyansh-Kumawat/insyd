# Lead Management System - Supabase Setup Guide

## ✅ What's Been Done

All Prisma dependencies have been removed and replaced with Supabase:

- ✅ Removed Prisma from `package.json`
- ✅ Updated `lib/db.ts` to use Supabase client
- ✅ Updated `lib/automation.ts` to use Supabase
- ✅ Updated API routes:
  - `app/api/leads/route.ts`
  - `app/api/approvals/route.ts`
  - `app/api/follow-ups/route.ts`
- ✅ Created SQL schema file (`supabase-schema.sql`)

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: lead-management-system
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait for it to finish

### Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public** key (under "Project API keys")

### Step 3: Update Environment Variables

Open your `.env` file and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**IMPORTANT**: Replace `your_project_url_here` and `your_anon_key_here` with the actual values from Step 2.

### Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

### Step 5: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `leads`
   - `follow_ups`
   - `approvals`
   - `conversions`

### Step 6: Install Dependencies and Run

```bash
npm install
npm run dev
```

## 📊 Database Schema Overview

### Tables Created:

1. **leads** - Main lead information with AI categorization
2. **follow_ups** - Automated follow-up emails
3. **approvals** - Manual approval workflows
4. **conversions** - Track when leads convert to customers

### Features:

- ✅ Row Level Security (RLS) enabled
- ✅ Indexes for performance
- ✅ Foreign key relationships
- ✅ Cascade deletes

## 🔧 Troubleshooting

### If you see "Failed to fetch leads"

1. Check your `.env` file has the correct Supabase credentials
2. Verify the SQL schema was run successfully
3. Check browser console for detailed error messages
4. Go to Supabase → Logs to see database errors

### If tables don't show up

1. Make sure you ran the SQL from `supabase-schema.sql`
2. Check for errors in the SQL Editor
3. Try running the SQL in smaller chunks if there's an error

### If you get RLS errors

The policies are set to allow all operations. If you need authentication:
1. Set up Supabase Auth
2. Update the RLS policies to check `auth.uid()`

## 🎉 You're All Set!

Once you complete these steps, your Lead Management System will be fully functional with Supabase!

## Need Help?

Check the Supabase documentation: https://supabase.com/docs
