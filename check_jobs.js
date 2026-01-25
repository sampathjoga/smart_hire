
const http = require('http');

http.get('http://localhost:3000/jobs', (res) => {
    console.log('StatusCode:', res.statusCode);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => console.log('Body:', body));
}).on('error', (e) => {
    console.error(e);
});
