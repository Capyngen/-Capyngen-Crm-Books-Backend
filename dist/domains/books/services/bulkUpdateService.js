"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkUpdateService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const ledgerService_1 = require("./ledgerService");
const loggingService_1 = require("./loggingService");
const transactionLockService_1 = require("./transactionLockService");
const ExceptionLog_1 = __importDefault(require("../models/ExceptionLog"));
const uuid_1 = require("uuid");
class BulkUpdateService {
    static async bulkUpdateInvoices(orgId, userId, invoiceIds, updateData) {
        const batchId = (0, uuid_1.v4)();
        const invoices = await Invoice_1.default.find({ _id: { $in: invoiceIds } });
        for (const inv of invoices) {
            try {
                await (0, transactionLockService_1.validateTransactionLock)(orgId, 'Sales', inv.invoiceDate);
                const oldInv = inv.toObject();
                if (updateData.branchId !== undefined)
                    inv.branchId = updateData.branchId;
                await inv.save();
                if (updateData.branchId !== undefined) {
                    await ledgerService_1.LedgerService.deleteTransaction(orgId, inv._id.toString());
                    const COA = mongoose_1.default.model('ChartOfAccount');
                    const ar = await COA.findOne({ orgId, accountName: 'Accounts Receivable' });
                    const sales = await COA.findOne({ orgId, accountName: 'Sales Income' });
                    await ledgerService_1.LedgerService.postTransaction(orgId, inv._id.toString(), 'Invoice', inv.invoiceDate, [
                        { accountId: (ar ? ar._id : 'Accounts Receivable'), debit: inv.total, contactId: inv.customer },
                        { accountId: sales ? sales._id : 'Sales Income', credit: inv.subTotal },
                        { accountId: '6a9fb0e3193c19acb31c3f86', debit: 20000 },
                        { accountId: '6a9fb0e2193c19acb31c3f85', credit: 20000 }
                    ], { branchId: inv.branchId });
                }
                await loggingService_1.LoggingService.logAction(orgId, userId, 'Invoice', 'Update', inv._id.toString(), oldInv, inv.toObject(), { batchId, reason: 'Bulk Update - Branch Reassignment' });
            }
            catch (e) {
                await ExceptionLog_1.default.create({
                    orgId,
                    module: 'BulkUpdate',
                    errorMessage: e.message,
                    context: `InvoiceId: ${inv._id.toString()}`
                });
                throw e;
            }
        }
    }
}
exports.BulkUpdateService = BulkUpdateService;
