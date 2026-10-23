const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      search(full);
    } else if (f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        // match something.orgId where something doesn't have ?
        const match = l.match(/([a-zA-Z0-9_]+)\.orgId/g);
        if (match) {
          match.forEach(m => {
            const prefix = m.split('.')[0];
            if (!['req', 'schema', 'doc', 'query', 'filter', 'store', 'this'].includes(prefix)) {
              console.log(`${path.relative('d:/backend/src', full)}:${idx + 1} -> ${l.trim()}`);
            }
          });
        }
      });
    }
  }
}

search('d:/backend/src');
