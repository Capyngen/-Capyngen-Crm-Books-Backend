"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Let's inspect route files in D:/backend/src
const routeDirs = [
    'D:/backend/src/domains/books/routes',
    'D:/backend/src/domains/billing/routes',
    'D:/backend/src/domains/inventory/routes',
    'D:/backend/src/domains/core/routes',
    'D:/backend/src/routes'
];
const allRoutes = [];
for (const dir of routeDirs) {
    if (!fs_1.default.existsSync(dir))
        continue;
    const files = fs_1.default.readdirSync(dir);
    for (const file of files) {
        if (!file.endsWith('.ts'))
            continue;
        const filePath = path_1.default.join(dir, file);
        const content = fs_1.default.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const match = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/i);
            if (match) {
                allRoutes.push({
                    file: file,
                    method: match[1].toUpperCase(),
                    path: match[2],
                    rawLine: line.trim()
                });
            }
        }
    }
}
console.log(JSON.stringify(allRoutes, null, 2));
console.log('Total routes found across route files:', allRoutes.length);
