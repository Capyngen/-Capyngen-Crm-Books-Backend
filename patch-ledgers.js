const fs = require('fs');
const path = require('path');

function addImport(content) {
    if (!content.includes('PostingEngine')) {
        content = content.replace(
            "import { LedgerService } from '../../books/services/ledgerService';",
            "import { LedgerService } from '../../books/services/ledgerService';\nimport { PostingEngine } from '../../books/services/PostingEngine';"
        );
    }
    return content;
}

// 1. CreditNote
const cnFile = 'D:\\backend\\src\\domains\\billing\\controllers\\creditNoteController.ts';
let cnContent = fs.readFileSync(cnFile, 'utf8');
cnContent = addImport(cnContent);
const cnOld = /await LedgerService\.postTransaction\([\s\S]*?\]\);/;
const cnNew = `const payload = { creditNoteId: creditNote._id.toString(), companyId: orgId, customerId: creditNote.customer?.toString(), subTotal: creditNote.subTotal, grandTotal: creditNote.total };
      await PostingEngine.handleEvent('CREDIT_NOTE_APPROVED', payload);`;
cnContent = cnContent.replace(cnOld, cnNew);
fs.writeFileSync(cnFile, cnContent, 'utf8');

// 2. Customer Opening Balance
const custFile = 'D:\\backend\\src\\domains\\billing\\controllers\\customerController.ts';
let custContent = fs.readFileSync(custFile, 'utf8');
custContent = addImport(custContent);
const custOld = /await LedgerService\.postTransaction\([\s\S]*?\]\);/;
const custNew = `const payload = { customerId: customer._id.toString(), companyId: orgId, openingBalance: customer.openingBalance };
      await PostingEngine.handleEvent('CUSTOMER_OPENING_BALANCE', payload);`;
custContent = custContent.replace(custOld, custNew);
fs.writeFileSync(custFile, custContent, 'utf8');

// 3. Expense
const expFile = 'D:\\backend\\src\\domains\\books\\controllers\\expenseController.ts';
let expContent = fs.readFileSync(expFile, 'utf8');
// Fix import path for expense since it's already in books
if (!expContent.includes('PostingEngine')) {
    expContent = expContent.replace(
        "import { LedgerService } from '../services/ledgerService';",
        "import { LedgerService } from '../services/ledgerService';\nimport { PostingEngine } from '../services/PostingEngine';"
    );
}
// Expense has two postTransaction calls (one for paid, one for unpaid)
expContent = expContent.replace(/await LedgerService\.postTransaction\([\s\S]*?\]\);/g, `const payload = { expenseId: doc._id.toString(), companyId: orgId, amount: doc.amount, vendorId: doc.vendorId?.toString(), isPaid: doc.paidThroughAccount ? true : false };
        await PostingEngine.handleEvent('EXPENSE_APPROVED', payload);`);
fs.writeFileSync(expFile, expContent, 'utf8');

// 4. Vendor Credit
const vcFile = 'D:\\backend\\src\\domains\\inventory\\controllers\\vendorCreditController.ts';
let vcContent = fs.readFileSync(vcFile, 'utf8');
vcContent = addImport(vcContent);
const vcOld = /await LedgerService\.postTransaction\([\s\S]*?\]\);/;
const vcNew = `const payload = { creditId: vc._id?.toString(), companyId: orgId, vendorId: vc.vendorId?.toString(), total: vc.total };
      await PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);`;
vcContent = vcContent.replace(vcOld, vcNew);
fs.writeFileSync(vcFile, vcContent, 'utf8');

console.log('All manual ledger posts replaced with PostingEngine!');
