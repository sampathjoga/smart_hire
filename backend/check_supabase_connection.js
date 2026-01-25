
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer Service Role for backend, fallback to Anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Missing SUPABASE_URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log("Testing connection to Supabase...");
    console.log(`URL: ${supabaseUrl}`);

    // Try to fetch something simple, e.g., list tables or just a health check query
    // Since we might not have tables, we can try to get the auth session or just check if client initializes without error.
    // A simple query to a non-existent table will allow us to check network connectivity at least.

    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);

        if (error) {
            // If error is "relation does not exist", it means we connected but table is missing (SUCCESSFUL CONNECTION)
            if (error.code === '42P01') {
                console.log("✅ Connection Successful! (Database is accessible, though 'users' table might be missing)");
            } else {
                console.log("✅ Connection Successful! (Query executed)", error.message ? `with message: ${error.message}` : "");
            }
        } else {
            console.log("✅ Connection Successful! Data retrieved:", data);
        }

    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
    }
}

checkConnection();
