
const http = require('http');

const data = JSON.stringify({
    email: 'finaltest@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log('StatusCode:', res.statusCode);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => console.log('Body:', body));
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();
