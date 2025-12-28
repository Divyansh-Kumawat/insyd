# 🚀 Quick Start - Add Dummy Data

## Step 1: Add Dummy Data to Supabase

1. Go to your Supabase project
2. Click on **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `dummy-data.sql` in this project
5. **Copy ALL the content** from `dummy-data.sql`
6. **Paste** it into the Supabase SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: "Success. No rows returned"

## Step 2: Verify Data

1. Go to **Table Editor** in Supabase
2. Click on the **leads** table
3. You should see **6 dummy leads**:
   - John Smith (HOT)
   - Sarah Johnson (WARM)
   - Mike Chen (COLD)
   - Emily Davis (HOT)
   - Robert Wilson (WARM)
   - Lisa Anderson (COLD)

## Step 3: Refresh Your App

1. Go back to your browser where the app is running
2. Navigate to **Admin Dashboard** 
3. You should now see all the leads!

## Add New Leads

### Option 1: Use the Form (Recommended)
1. Go to the **homepage** (http://localhost:3000)
2. Fill out the "Get a Quote" form
3. Submit it
4. Go to Admin Dashboard to see the new lead

### Option 2: Add Directly in Supabase
1. Go to **Table Editor** → **leads**
2. Click **Insert** → **Insert row**
3. Fill in the fields
4. Click **Save**

## Troubleshooting

**If you still don't see data:**
1. Check browser console for errors (F12)
2. Verify `.env` has correct Supabase credentials
3. Make sure the SQL ran without errors
4. Try restarting the dev server (`npm run dev`)

## What Data is Included

The dummy data includes:
- ✅ 6 leads with different categories (HOT, WARM, COLD)
- ✅ 3 follow-ups (some pending, some sent)
- ✅ 2 approval requests

This gives you a realistic view of how the system works!
