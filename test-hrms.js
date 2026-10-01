const https = require('https');

const payload = JSON.stringify({ email: 'test@orinite.com', password: 'password' });

const options = {
  hostname: 'api.orinite.com',
  port: 443,
  path: '/api/v1/employees/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  res.on('end', () => {
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(payload);
req.end();
