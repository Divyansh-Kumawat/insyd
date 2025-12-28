# Environment Variables Guide

## Required Variables

### Supabase (Database)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to get:**
1. Go to https://supabase.com
2. Open your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

---

## Optional Variables

### Gemini AI (Lead Categorization)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Where to get:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste it

**Note:** If you don't provide this, the system will use rule-based categorization instead of AI.

---

## Your Current .env Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyD5IM7dhLCpolEdcY9EVWcMZ1hUr343443
```

---

## AI Model Configuration

The system now uses:
- **Model:** `gemini-2.5-flash`
- **Fallback:** Rule-based categorization if API key is missing
- **Purpose:** Automatically categorize leads as HOT, WARM, or COLD

✅ **Your AI is configured and ready to use!**
