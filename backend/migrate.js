require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use connection string from env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is missing in .env");
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    console.log("Connecting to database...");
    try {
        await client.connect();
        console.log("Connected. Reading schema file...");

        const schemaPath = path.join(__dirname, 'supabase_schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const sql = fs.readFileSync(schemaPath, 'utf8');
        console.log("Applying schema...");

        await client.query(sql);
        console.log('✅ Schema applied successfully!');

        // Optional: Seed initial data if requested
        // check if profiles are empty
        /*
        const res = await client.query('SELECT count(*) FROM public.profiles');
        if (res.rows[0].count === '0') {
             console.log("Seeding initial data...");
             // ... seed logic if we had auth users ... 
             // But profiles depend on auth.users which we can't easily insert into without supabase admin API
             // So skipping direct profile seed for now.
        }
        */

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
