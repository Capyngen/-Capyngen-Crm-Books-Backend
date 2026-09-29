const fs = require('fs');

let content = fs.readFileSync('D:\\backend\\src\\app.ts', 'utf8');

// Add import if not present
if (!content.includes("createProxyMiddleware")) {
    const importProxy = "\nimport { createProxyMiddleware } from 'http-proxy-middleware';\n";
    content = content.replace("import express from 'express';", "import express from 'express';" + importProxy);
}

// Add proxy middlewares before other routes
if (!content.includes("app.use('/api/v1/employees'")) {
    const proxyConfig = `
const hrmsBackendUrl = process.env.HRMS_BACKEND_URL || 'http://127.0.0.1:3000';

// API Gateway / Reverse Proxy to HRMS Backend
const hrmsProxy = createProxyMiddleware({
  target: hrmsBackendUrl,
  changeOrigin: true,
  // Optional: pathRewrite if needed, but not needed here since HRMS also uses /api/v1/...
});

app.use('/api/v1/employees', hrmsProxy);
app.use('/api/v1/superadmin/public', hrmsProxy);
app.use('/api/v1/subscribe', hrmsProxy);

`;
    // Find where app.use(express.json()) is
    content = content.replace("app.use(express.json());", proxyConfig + "app.use(express.json());");
}

fs.writeFileSync('D:\\backend\\src\\app.ts', content, 'utf8');
console.log("Patched app.ts");
