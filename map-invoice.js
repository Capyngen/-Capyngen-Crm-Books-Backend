const fs = require('fs');
const path = require('path');

const file = path.join('D:\\', 'backend', 'src', 'domains', 'billing', 'controllers', 'invoiceController.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PostingEngine')) {
    content = content.replace(
        "import { LedgerService } from '../../books/services/ledgerService';",
        "import { LedgerService } from '../../books/services/ledgerService';\nimport { PostingEngine } from '../../books/services/PostingEngine';"
    );
}

const oldLogic = /if \(invoice\.status !== 'Draft'\) \{[\s\S]*?await LedgerService\.postTransaction\([\s\S]*?\]\);\s*\}/;

const newLogic = `if (invoice.status !== 'Draft') {
      const orgId = (requestContext.getStore()?.orgId || invoice.orgId || 'SYSTEM');
      
      const payload = {
        invoiceId: invoice._id.toString(),
        companyId: orgId,
        customerId: invoice.customer?._id?.toString() || invoice.customer?.toString(),
        subTotal: invoice.subTotal || 0,
        taxTotal: invoice.taxTotal || 0,
        grandTotal: invoice.total || 0,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber
      };

      await PostingEngine.handleEvent('INVOICE_APPROVED', payload);
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log('Mapped InvoiceController to PostingEngine');
