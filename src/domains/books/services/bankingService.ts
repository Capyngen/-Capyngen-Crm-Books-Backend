import mongoose from 'mongoose';
import BankAccount from '../models/BankAccount';
import BankStatementLine from '../models/BankStatementLine';
import PaymentReceived from '../../billing/models/PaymentReceived';
import PaymentMade from '../models/PaymentMade';
import Expense from '../models/Expense';
import LedgerEntry from '../models/LedgerEntry';
import { LedgerService } from './ledgerService';

export class BankingService {

  static async getSuggestedMatches(lineId: string) {
    const line = await BankStatementLine.findById(lineId).lean();
    if (!line) throw new Error('Line not found');

    const minDate = new Date(line.date);
    minDate.setDate(minDate.getDate() - 3);
    const maxDate = new Date(line.date);
    maxDate.setDate(maxDate.getDate() + 3);

    const matchCandidates = [];
    const absoluteAmount = Math.abs(line.amount);

    if (line.amount > 0) {
      const prs = await PaymentReceived.find({ 
        orgId: line.orgId, 
        amount: absoluteAmount,
        paymentDate: { $gte: minDate, $lte: maxDate }
      }).lean();
      matchCandidates.push(...prs.map(p => ({ type: 'PaymentReceived', id: p._id, date: p.paymentDate, amount: p.amount })));
    } else {
      const pms = await PaymentMade.find({
        orgId: line.orgId,
        amount: absoluteAmount,
        paymentDate: { $gte: minDate, $lte: maxDate }
      }).lean();
      matchCandidates.push(...pms.map(p => ({ type: 'PaymentMade', id: p._id, date: p.paymentDate, amount: p.amount })));

      const exps = await Expense.find({
        orgId: line.orgId,
        totalAmount: absoluteAmount,
        date: { $gte: minDate, $lte: maxDate }
      }).lean();
      matchCandidates.push(...exps.map(p => ({ type: 'Expense', id: p._id, date: p.date, amount: p.totalAmount })));
    }

    return matchCandidates;
  }

  static async matchTransaction(lineId: string, transactionId: string, transactionType: string) {
    const line = await BankStatementLine.findById(lineId);
    if (!line) throw new Error('Line not found');
    
    line.status = 'Matched';
    line.linkedTransactionId = transactionId;
    line.linkedTransactionType = transactionType;
    await line.save();
    return line;
  }
  
  static async unmatchTransaction(lineId: string) {
    const line = await BankStatementLine.findById(lineId);
    if (!line) throw new Error('Line not found');
    
    line.status = 'Unreconciled';
    line.linkedTransactionId = undefined;
    line.linkedTransactionType = undefined;
    await line.save();
    return line;
  }

  static async categorizeTransaction(lineId: string, accountId: string, contactId?: string) {
    const line = await BankStatementLine.findById(lineId);
    if (!line) throw new Error('Line not found');

    const transactionId = new mongoose.Types.ObjectId().toString(); 

    const glLines = [];
    if (line.amount < 0) {
      glLines.push({ accountId: accountId, debit: Math.abs(line.amount), contactId });
      glLines.push({ accountId: 'Bank', credit: Math.abs(line.amount) });
    } else {
      glLines.push({ accountId: 'Bank', debit: line.amount });
      glLines.push({ accountId: accountId, credit: line.amount, contactId });
    }

    await LedgerService.postTransaction(line.orgId, transactionId, 'ManualJournal', line.date, glLines);

    line.status = 'Categorized';
    line.linkedTransactionId = transactionId;
    line.linkedTransactionType = 'ManualJournal';
    await line.save();
    return line;
  }

  static async getReconciliationStatus(orgId: string, bankAccountId: string, statementEndingBalance?: number) {
    const allGL = await LedgerEntry.aggregate([
      { $match: { orgId } },
      { $unwind: '$lines' },
      { $match: { 'lines.accountId': 'Bank' } },
      { $group: { _id: null, totalDebit: { $sum: '$lines.debit' }, totalCredit: { $sum: '$lines.credit' } } }
    ]);
    
    const booksBalance = (allGL[0]?.totalDebit || 0) - (allGL[0]?.totalCredit || 0);

    const statementLines = await BankStatementLine.find({ orgId, bankAccountId }).lean();
    let calculatedStatementBalance = 0; 
    let unreconciledCount = 0;
    
    statementLines.forEach(l => {
      calculatedStatementBalance += l.amount;
      if (l.status === 'Unreconciled') unreconciledCount++;
    });

    const targetStatementBalance = statementEndingBalance !== undefined ? statementEndingBalance : calculatedStatementBalance;

    return {
      booksBalance,
      statementEndingBalance: targetStatementBalance,
      difference: targetStatementBalance - booksBalance,
      unreconciledCount
    };
  }
}
