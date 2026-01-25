require('dotenv').config({ path: './backend/.env' });
const { Client } = require('pg');
const https = require('https');

const projectUrl = 'https://zeuddtbdfrrcnagelzrk.supabase.co';
const connectionString = process.env.DATABASE_URL;

console.log('=== Supabase Connection Diagnostic ===');
console.log(`1. Checking Project URL: ${projectUrl}`);

const req = https.get(projectUrl, (res) => {
    console.log(`   HTTP Status: ${res.statusCode} (Expected: 200 or 404 from Kong)`);
    if (res.statusCode === 503) {
        console.error('   CRITICAL: Service Unavailable. Project is likely PAUSED.');
    } else if (res.statusCode !== 200 && res.statusCode !== 404) {
        console.warn(`   WARNING: Unexpected status ${res.statusCode}.`);
    }
    checkDatabase();
});

req.on('error', (e) => {
    console.error('   HTTP Check Error:', e.message);
    checkDatabase();
});

async function checkDatabase() {
    console.log('\n2. Checking Database Connection (Session Pooler)...');
    // Mask password in logs
    const maskedString = connectionString ? connectionString.replace(/:[^:@]*@/, ':****@') : 'UNDEFINED';
    console.log(`   Connection String: ${maskedString}`);

    if (!connectionString) {
        console.error('   ❌ Error: DATABASE_URL is missing in ./backend/.env');
        return;
    }

    console.log('   SSL Config:', { rejectUnauthorized: false });
    console.log('   SSL Config:', { rejectUnauthorized: false });
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('   ✅ Database Connection: SUCCESS');
        const res = await client.query('SELECT NOW() as time, current_user as user, version()');
        console.log('   Query Result:', res.rows[0]);
    } catch (err) {
        console.error('   ❌ Database Connection: FAILED');
        console.error('   Error:', err.message);

        if (err.message.includes('tenant or user not found')) {
            console.error('\n   --> DIAGNOSIS: Project is PAUSED. Please restore it in Supabase Dashboard.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('\n   --> DIAGNOSIS: Connection refused. Check if project is restoring.');
        }
    } finally {
        await client.end();
    }
}
