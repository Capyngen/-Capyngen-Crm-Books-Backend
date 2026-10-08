const fs = require('fs');
const path = require('path');

// Helper
function replaceInFile(filePath, searches) {
  const fullPath = path.join('D:\\backend', filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const { target, replacement } of searches) {
    // If target is regex or string
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(fullPath, content);
}

// 1. fixedAssetController.ts
replaceInFile('src/domains/books/controllers/fixedAssetController.ts', [
  { target: "import Journal from '../models/Journal';", replacement: "import { Journal } from '../models/Journal';" },
  { target: "journalId: journal._id as Types.ObjectId", replacement: "journalId: journal._id as mongoose.Types.ObjectId" }
]);

// 2. aiController.ts
replaceInFile('src/domains/books/controllers/aiController.ts', [
  { target: "const anomalies = [];", replacement: "const anomalies: any[] = [];" }
]);

// 3. fiscalCalendarController.ts
replaceInFile('src/domains/books/controllers/fiscalCalendarController.ts', [
  { target: "const period = year.periods.id(periodId);", replacement: "const period = (year.periods as any).id(periodId);" }
]);

// 4. reconciliationController.ts
replaceInFile('src/domains/books/controllers/reconciliationController.ts', [
  { target: "const hasMatch = rule.conditions.some(c =>", replacement: "const hasMatch = rule.conditions.some((c: any) =>" }
]);

// 5. bankingService.ts
replaceInFile('src/domains/books/services/bankingService.ts', [
  { target: "import BankStatementLine from '../models/BankStatementLine';", replacement: "import { BankStatementLine } from '../models/BankStatementLine';" },
  { target: "statementLines.forEach(l => {", replacement: "statementLines.forEach((l: any) => {" }
]);

// 6. recurringService.ts
replaceInFile('src/domains/books/services/recurringService.ts', [
  { target: "import RecurringJournal from '../models/RecurringJournal';", replacement: "import { RecurringJournal } from '../models/RecurringJournal';" }
]);

// 7. app.ts (Proxy types)
replaceInFile('src/app.ts', [
  { target: /req\.originalUrl/g, replacement: "(req as any).originalUrl" },
  { target: /onProxyRes: \(proxyRes\) =>/g, replacement: "onProxyRes: (proxyRes: any) =>" },
  { target: /cookies\.map\(c =>/g, replacement: "cookies.map((c: any) =>" }
]);
