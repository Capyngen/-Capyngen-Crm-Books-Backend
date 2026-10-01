const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
app.use('/api', createProxyMiddleware({
  target: 'http://example.com',
  pathRewrite: (path, req) => {
    console.log('originalUrl:', req.originalUrl);
    return req.originalUrl;
  }
}));
const server = app.listen(4000, () => {
  const http = require('http');
  http.get('http://localhost:4000/api/test', (res) => {
    server.close();
    process.exit(0);
  });
});
