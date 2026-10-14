"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RecurringBill_1 = __importDefault(require("../../inventory/models/RecurringBill"));
const RecurringJournal_1 = require("../models/RecurringJournal");
const TaxConfiguration_1 = __importDefault(require("../models/TaxConfiguration"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const AutomationLog_1 = __importDefault(require("../models/AutomationLog"));
const ledgerService_1 = require("./ledgerService");
const loggingService_1 = require("./loggingService");
class RecurringService {
    static async createRecurringJournalProfile(data) {
        const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})`);
        }
        const rj = new RecurringJournal_1.RecurringJournal(data);
        await rj.save();
        return rj;
    }
    static async triggerRecurringBill(profileId, executionDate) {
        try {
            const profile = await RecurringBill_1.default.findById(profileId);
            if (!profile)
                throw new Error('Profile not found');
            if (profile.status === 'Stopped')
                throw new Error('Cannot trigger a Stopped recurring profile');
            let tdsAmount = 0;
            if (profile.taxConfigurationId) {
                const taxConfig = await TaxConfiguration_1.default.findById(profile.taxConfigurationId);
                if (taxConfig && taxConfig.taxType === 'TDS') {
                    // DYNAMIC CALCULATION - Fetches current rate!
                    tdsAmount = profile.totalAmount * (taxConfig.rate / 100);
                }
            }
            const netPayable = profile.totalAmount - tdsAmount;
            const childBill = new Bill_1.default({
                orgId: profile.orgId,
                vendorId: profile.vendorId,
                billNumber: `BILL-${profileId.substring(0, 6)}-${executionDate.getTime()}`,
                billDate: executionDate,
                totalAmount: profile.totalAmount, subTotal: profile.totalAmount,
                taxConfigurationId: profile.taxConfigurationId,
                taxWithheldAmount: tdsAmount,
                taxWithheldType: tdsAmount > 0 ? 'TDS' : 'none',
                status: 'Open'
            });
            await childBill.save();
            const COA = mongoose_1.default.model('ChartOfAccount');
            const expenseCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'Expense' });
            const apCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'Accounts Payable' });
            const tdsCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'TDS Payable' });
            await ledgerService_1.LedgerService.postTransaction(profile.orgId, childBill._id.toString(), 'Bill', executionDate, [
                { accountId: expenseCoa ? expenseCoa._id : 'Expense', debit: profile.totalAmount, contactId: profile.vendorId.toString() },
                { accountId: apCoa ? apCoa._id : 'Accounts Payable', credit: netPayable, contactId: profile.vendorId.toString() },
                ...(tdsAmount > 0 ? [{ accountId: tdsCoa ? tdsCoa._id : 'TDS Payable', credit: tdsAmount }] : [])
            ]);
            await loggingService_1.LoggingService.logAction(profile.orgId, 'SYSTEM_CRON', 'Bill', 'Create', childBill._id.toString(), null, childBill.toObject());
            await AutomationLog_1.default.create({ orgId: profile.orgId, profileId, module: 'RecurringBill', status: 'Success', triggeredBy: 'SYSTEM_CRON' });
            return childBill;
        }
        catch (e) {
            await AutomationLog_1.default.create({ orgId: 'SYSTEM', profileId, module: 'RecurringBill', status: 'Failure', message: e.message, triggeredBy: 'SYSTEM_CRON' });
            throw e;
        }
    }
}
exports.RecurringService = RecurringService;
