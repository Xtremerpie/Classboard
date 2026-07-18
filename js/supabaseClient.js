// ============================================================
// ClassBoard — Supabase client
// Fill these in with YOUR project's values from:
// Supabase Dashboard → Project Settings → API
// ============================================================
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

// Loaded from the CDN script tag included on every page (see <head>)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
