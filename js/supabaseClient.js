// ============================================================
// ClassBoard — Supabase client
// Fill these in with YOUR project's values from:
// Supabase Dashboard → Project Settings → API
// ============================================================
const SUPABASE_URL = "https://lvbgnvykmmkaqepmltuw.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmdudnlrbW1rYXFlcG1sdHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjUxNjgsImV4cCI6MjA5OTk0MTE2OH0.FkZuflO_JGim0i6uzQ8kQJ84GVARlqFmZuk8N57Fb0E";

// Loaded from the CDN script tag included on every page (see <head>)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
