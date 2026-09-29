const fs = require('fs');

function extractKeys(navPath, prefix) {
    const code = fs.readFileSync(navPath, 'utf8');
    const itemsMatch = [...code.matchAll(/id:\s*'([^']+)'(?:.*?children:\s*\[([\s\S]*?)\])?/g)];
    
    let keys = [];
    
    // Quick and dirty regex extraction
    const lines = code.split('\n');
    let currentModule = null;
    
    for (let line of lines) {
        let parentMatch = line.match(/id:\s*'([^']+)'/);
        let pathMatch = line.match(/path:\s*'([^']+)'/);
        
        if (line.includes('children: [')) {
            // Group with children
            currentModule = line.match(/id:\s*'([^']+)'/)?.[1] || currentModule;
        } else if (line.includes('id:') && line.includes('path:')) {
            // Single item or child
            let id = line.match(/id:\s*'([^']+)'/)[1];
            if (line.includes('{ id:') && !line.includes('children:')) {
                if (currentModule && line.match(/^\s*{/)) { // it's a child
                    keys.push(`${prefix}-${currentModule}-${id}`);
                } else {
                    currentModule = null;
                    keys.push(`${prefix}-${id}`);
                }
            }
        } else if (line.includes(']')) {
            currentModule = null;
        }
    }
    return keys;
}

const billingKeys = extractKeys('D:\\frontend\\src\\core\\config\\navigation\\billing.tsx', 'billing');
const inventoryKeys = extractKeys('D:\\frontend\\src\\core\\config\\navigation\\inventory.tsx', 'inventory');

console.log("BILLING KEYS:");
console.log(billingKeys.join('\n'));
console.log("\nINVENTORY KEYS:");
console.log(inventoryKeys.join('\n'));
