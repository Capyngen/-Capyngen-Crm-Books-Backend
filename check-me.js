const https = require('https');
https.get('https://backend-books-hxcr.onrender.com/api/v1/books/me', (res) => {
  console.log('STATUS:', res.statusCode);
  process.exit();
}).on('error', (e) => {
  console.error(e);
});
