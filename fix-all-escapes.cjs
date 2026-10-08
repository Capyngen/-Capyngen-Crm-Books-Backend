const fs = require('fs');
const path = require('path');

const walkAndFix = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkAndFix(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('\\`') || content.includes('\\$')) {
        content = content.replace(/\\\`/g, '`');
        content = content.replace(/\\\$/g, '$');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', fullPath);
      }
    }
  }
};

walkAndFix('D:\\backend\\src\\domains\\books');
