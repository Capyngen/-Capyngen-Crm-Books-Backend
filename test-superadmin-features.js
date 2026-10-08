const https = require('https');
const payload = JSON.stringify({
  updates: [
    { planId: '6a9aab2b37f115525a01b0dc', featureKeys: ['accounts-sales-customers'] }
  ]
});
const req = https.request({
  hostname: 'api.orinite.com',
  port: 443,
  path: '/api/v1/superadmin/plans/features',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('BODY:', data));
});
req.on('error', e => console.error(e));
req.write(payload);
req.end();
