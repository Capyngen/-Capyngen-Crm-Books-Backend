const fs = require('fs');

let content = fs.readFileSync('D:\\backend\\src\\app.ts', 'utf8');

// Remove import
content = content.replace("import { createProxyMiddleware } from 'http-proxy-middleware';", "");

// Remove proxy block
const proxyRegex = /const hrmsBackendUrl[\s\S]*?app\.use\('\/api\/v1\/subscribe', hrmsProxy\);/g;
content = content.replace(proxyRegex, "");

fs.writeFileSync('D:\\backend\\src\\app.ts', content, 'utf8');
console.log("Reverted app.ts");
