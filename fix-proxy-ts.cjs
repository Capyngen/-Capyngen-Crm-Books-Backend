const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace createProxyMiddleware({ ... }) with createProxyMiddleware({ ... } as any)
content = content.replace(/createProxyMiddleware\(\{/g, 'createProxyMiddleware({'); // Just to be safe, find the pattern
content = content.replace(/onProxyRes: \(proxyRes: any\) => \{ const cookies = proxyRes\.headers\['set-cookie'\]; if \(cookies\) \{ proxyRes\.headers\['set-cookie'\] = cookies\.map\(\(c: any\) => c\.replace\(\/SameSite=\[a-zA-Z\]\+\/i, ''\) \+ '; SameSite=None; Secure'\); \} \}\s*\}/g, "onProxyRes: (proxyRes: any) => { const cookies = proxyRes.headers['set-cookie']; if (cookies) { proxyRes.headers['set-cookie'] = cookies.map((c: any) => c.replace(/SameSite=[a-zA-Z]+/i, '') + '; SameSite=None; Secure'); } } } as any");

fs.writeFileSync(path, content);
