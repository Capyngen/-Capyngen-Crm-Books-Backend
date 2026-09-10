import mongoose from 'mongoose';
import { validateTransactionLock } from './transactionLockService';
﻿import LedgerEntry from '../models/LedgerEntry';

export class LedgerService {
  static async postTransaction(orgId: string, transactionId: string, transactionType: string, date: Date, lines: { accountId: string, debit?: number, credit?: number, contactId?: string, branchId?: string, projectId?: string, reportingTagIds?: string[] }[], options?: { branchId?: string, projectId?: string, reportingTagIds?: string[] }) {
    await LedgerEntry.deleteMany({ orgId, transactionId });

    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit}) for ${transactionType} ${transactionId}`);
      throw new Error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})`);
    }

    const entry = new LedgerEntry({
      orgId,
      transactionId,
      transactionType,
      date,
      lines: lines.map(l => ({
        accountId: l.accountId,
        debit: l.debit || 0,
        credit: l.credit || 0,
        contactId: l.contactId,
        branchId: l.branchId || options?.branchId,
        projectId: l.projectId || options?.projectId,
        reportingTagIds: l.reportingTagIds || options?.reportingTagIds || []
      }))
    });

    await entry.save();
    return entry;
  }

  static async voidTransaction(orgId: string, transactionId: string, date: Date) {
    const originalEntry = await LedgerEntry.findOne({ orgId, transactionId });
    if (!originalEntry) return null; 
    
    // Fix for Edge Case 2: Do not duplicate reversal if already voided
    if (originalEntry.status === 'Void') return null;

    const reversalLines = originalEntry.lines.map(l => ({
      accountId: l.accountId,
      debit: l.credit || 0, 
      credit: l.debit || 0, 
      contactId: l.contactId
    }));

    const reversalEntry = new LedgerEntry({
      orgId,
      transactionId: transactionId + '_VOID',
      transactionType: originalEntry.transactionType,
      date,
      lines: reversalLines,
      status: 'Posted'
    });

    originalEntry.status = 'Void';
    await originalEntry.save();
    
    await reversalEntry.save();
    return reversalEntry;
  }

  static async deleteTransaction(orgId: string, transactionId: string) {
    const entry = await mongoose.model('LedgerEntry').findOne({ orgId, transactionId });
    if (entry) await validateTransactionLock(orgId, 'Accountant', entry.date);
    // Fix for Edge Case 1: deleteMany handles missing documents gracefully
    await LedgerEntry.deleteMany({ orgId, transactionId });
    await LedgerEntry.deleteMany({ orgId, transactionId: transactionId + '_VOID' });
  }
}
