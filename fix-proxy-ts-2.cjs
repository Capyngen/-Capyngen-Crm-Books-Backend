const fs = require('fs');
const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/pathRewrite: \(path, req\)/g, 'pathRewrite: (path: any, req: any)');

fs.writeFileSync(path, content);
