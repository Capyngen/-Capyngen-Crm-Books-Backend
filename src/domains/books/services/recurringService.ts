import mongoose from 'mongoose';
import RecurringBill from '../models/RecurringBill';
import RecurringJournal from '../models/RecurringJournal';
import TaxConfiguration from '../models/TaxConfiguration';
import Bill from '../models/Bill';
import AutomationLog from '../models/AutomationLog';
import { LedgerService } from './ledgerService';
import { LoggingService } from './loggingService';

﻿

export class RecurringService {
  static async createRecurringJournalProfile(data: any) {
    const totalDebit = data.lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Double-entry violation: Debits (\${totalDebit}) do not equal Credits (\${totalCredit})`);
    }

    const rj = new RecurringJournal(data);
    await rj.save();
    return rj;
  }

  static async triggerRecurringBill(profileId: string, executionDate: Date) {
  try {
    const profile = await RecurringBill.findById(profileId);
    if (!profile) throw new Error('Profile not found');
    if (profile.status === 'Stopped') throw new Error('Cannot trigger a Stopped recurring profile');

    let tdsAmount = 0;
    if (profile.taxConfigurationId) {
      const taxConfig = await TaxConfiguration.findById(profile.taxConfigurationId);
      if (taxConfig && taxConfig.taxType === 'TDS') {
        // DYNAMIC CALCULATION - Fetches current rate!
        tdsAmount = profile.totalAmount * (taxConfig.rate / 100);
      }
    }

    const netPayable = profile.totalAmount - tdsAmount;

    const childBill = new Bill({
      orgId: profile.orgId,
      vendorId: profile.vendorId,
      billNumber: `BILL-\${profileId.substring(0,6)}-\${executionDate.getTime()}`,
      billDate: executionDate,
      totalAmount: profile.totalAmount, subTotal: profile.totalAmount,
      taxConfigurationId: profile.taxConfigurationId,
      taxWithheldAmount: tdsAmount,
      taxWithheldType: tdsAmount > 0 ? 'TDS' : 'none',
      status: 'Open'
    });
    await childBill.save();

    
      const COA = mongoose.model('ChartOfAccount');
      const expenseCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'Expense' });
      const apCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'Accounts Payable' });
      const tdsCoa = await COA.findOne({ orgId: profile.orgId, accountName: 'TDS Payable' });

      await LedgerService.postTransaction(profile.orgId, childBill._id.toString(), 'Bill', executionDate, [
        { accountId: expenseCoa ? expenseCoa._id : 'Expense', debit: profile.totalAmount, contactId: profile.vendorId.toString() },
        { accountId: apCoa ? apCoa._id : 'Accounts Payable', credit: netPayable, contactId: profile.vendorId.toString() },
        ...(tdsAmount > 0 ? [{ accountId: tdsCoa ? tdsCoa._id : 'TDS Payable', credit: tdsAmount }] : [])
      ]);


    await LoggingService.logAction(profile.orgId, 'SYSTEM_CRON', 'Bill', 'Create', childBill._id.toString(), null, childBill.toObject());
    await AutomationLog.create({ orgId: profile.orgId, profileId, module: 'RecurringBill', status: 'Success', triggeredBy: 'SYSTEM_CRON' });
    return childBill;
  } catch (e: any) {
    await AutomationLog.create({ orgId: 'SYSTEM', profileId, module: 'RecurringBill', status: 'Failure', message: e.message, triggeredBy: 'SYSTEM_CRON' });
    throw e;
  }
}
}
