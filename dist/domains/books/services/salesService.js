"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const ledgerService_1 = require("./ledgerService");
class SalesService {
    static async voidInvoice(orgId, invoiceId, testErrorInjection = false) {
        const inv = await Invoice_1.default.findOne({ _id: invoiceId, orgId });
        if (!inv)
            throw new Error('Invoice not found');
        if (inv.status === 'Void')
            throw new Error('Invoice already voided');
        const originalStatus = inv.status;
        inv.status = 'Void';
        // We must use Mongoose optimistic concurrency (`save()`) to ensure no race conditions
        // during the status update.
        await inv.save();
        try {
            if (testErrorInjection) {
                throw new Error('Injected Error During Ledger Reversal');
            }
            await ledgerService_1.LedgerService.voidTransaction(orgId, invoiceId, new Date());
            return inv;
        }
        catch (error) {
            // Rollback status because ledger reversal failed!
            const rollbackInv = await Invoice_1.default.findById(invoiceId);
            if (rollbackInv) {
                rollbackInv.status = originalStatus;
                await rollbackInv.save();
            }
            throw error; // Re-throw
        }
    }
}
exports.SalesService = SalesService;
