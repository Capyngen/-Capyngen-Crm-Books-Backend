"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TimeEntry_1 = __importDefault(require("../models/TimeEntry"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const ledgerService_1 = require("./ledgerService");
class ProjectsService {
    static async generateInvoiceFromTimesheets(orgId, projectId, customerId, timesheetIds) {
        // Check for contamination explicitly
        const timesheets = await TimeEntry_1.default.find({ _id: { $in: timesheetIds } });
        if (!timesheets.length)
            throw new Error('No timesheets found');
        for (const t of timesheets) {
            if (t.projectId.toString() !== projectId) {
                throw new Error('Cross-Project Contamination detected: Timesheet does not belong to this project');
            }
            if (t.status === 'Invoiced') {
                throw new Error('Timesheet is already invoiced');
            }
            if (!t.isBillable) {
                throw new Error('Cannot invoice non-billable timesheet');
            }
        }
        // Calculate revenue
        const revenue = timesheets.reduce((sum, t) => sum + (t.hours * t.billingRate), 0);
        // Create Invoice
        const invId = new mongoose_1.default.Types.ObjectId();
        const invoice = new Invoice_1.default({
            _id: invId,
            orgId,
            customer: customerId,
            invoiceNumber: 'INV-TS-' + Date.now(),
            invoiceDate: new Date(),
            subTotal: revenue,
            total: revenue,
            status: 'Sent'
        });
        await invoice.save();
        // Ledger posting
        await ledgerService_1.LedgerService.postTransaction(orgId, invId.toString(), 'Invoice', invoice.invoiceDate, [
            { accountId: 'Accounts Receivable', debit: revenue, contactId: customerId },
            { accountId: 'Service Income', credit: revenue }
        ], { projectId });
        // Update Timesheets
        await TimeEntry_1.default.updateMany({ _id: { $in: timesheetIds } }, { $set: { status: 'Invoiced', invoiceId: invId } });
        return invoice;
    }
}
exports.ProjectsService = ProjectsService;
