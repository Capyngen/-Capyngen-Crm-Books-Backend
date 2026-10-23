const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

const needle = 'console.error(err);\n        console.log(\'[Auth] hrmsBackend unreachable';
const needleCRLF = 'console.error(err);\r\n        console.log(\'[Auth] hrmsBackend unreachable';

if (content.includes(needle)) {
  content = content.replace(needle, '// Standalone mode: Seamlessly authenticating via direct local DB\n        console.log(\'[Auth] Standalone mode: Authenticating directly via local DB for:');
  fs.writeFileSync('src/app.ts', content, 'utf8');
  console.log('Successfully updated app.ts (LF)!');
} else if (content.includes(needleCRLF)) {
  content = content.replace(needleCRLF, '// Standalone mode: Seamlessly authenticating via direct local DB\r\n        console.log(\'[Auth] Standalone mode: Authenticating directly via local DB for:');
  fs.writeFileSync('src/app.ts', content, 'utf8');
  console.log('Successfully updated app.ts (CRLF)!');
} else {
  console.log('Pattern not found.');
}
