// ===============================
// ClassBoard - Supabase Config
// ===============================
# anon api key - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Y3praWR0eXBxZ3NjdGR4b2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzE3ODksImV4cCI6MjA5ODkwNzc4OX0.4u6-epzrcgJu58R3mFZuH4eaTAmTUCG_c3aM1nQ09x8 
# project ulr/id - qzczkidtypqgsctdxocb
// Replace these with YOUR project values
const SUPABASE_URL = "https://qzczkidtypqgsctdxocb.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Y3praWR0eXBxZ3NjdGR4b2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzE3ODksImV4cCI6MjA5ODkwNzc4OX0.4u6-epzrcgJu58R3mFZuH4eaTAmTUCG_c3aM1nQ09x8";

// Create Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Test Connection
(async () => {

    const { error } = await supabase
        .from("files")
        .select("id")
        .limit(1);

    if (error) {

        console.error("❌ Supabase Connection Failed");

        console.error(error);

    } else {

        console.log("✅ Connected to Supabase");

    }

})();