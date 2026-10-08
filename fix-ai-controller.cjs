const fs = require('fs');

const path = 'D:\\backend\\src\\domains\\books\\controllers\\aiController.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(path, content);
