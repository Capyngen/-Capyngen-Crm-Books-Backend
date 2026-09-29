const fs = require('fs');

const navCode = fs.readFileSync('D:\\frontend\\src\\core\\config\\navigation\\billing.tsx', 'utf8');
const routesCode = fs.readFileSync('D:\\frontend\\src\\app\\routes.tsx', 'utf8');

const navPaths = [...navCode.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1]);

console.log("Nav Paths from sidebar:");
for (let p of navPaths) {
    // Check if it exists in routes.tsx
    // The route in routes.tsx is relative to /billing
    let relPath = p.replace('/billing/', '');
    let exists = routesCode.includes(`path: '${relPath}'`);
    if (!exists && relPath !== '/billing') {
        console.log(`MISSING: ${p} (relative: ${relPath})`);
    }
}
