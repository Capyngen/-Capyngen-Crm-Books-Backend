import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { Request, Response } from 'express';
import { Journal } from '../models/Journal';

export const getJournals = async (req: Request, res: Response) => {
  try {
    const journals = await Journal.find().sort({ date: -1, createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getJournalById = async (req: Request, res: Response) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createJournal = async (req: Request, res: Response) => {
  try {
    const journal = new Journal(req.body);
    
    // Double-entry validation
    const totalDebit = journal.lineItems.reduce((sum, l) => sum + (l.debits || 0), 0);
    const totalCredit = journal.lineItems.reduce((sum, l) => sum + (l.credits || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ message: `Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})` });
    }

    const savedJournal = await journal.save();

    // Fix Bug 1: Push Manual Journal to Ledger
    if (savedJournal.status !== 'Draft') {
      const orgId = requestContext.getStore()?.orgId || savedJournal.orgId || 'SYSTEM';
      const ledgerLines = savedJournal.lineItems.map(l => ({
        accountId: l.account,
        debit: l.debits || 0,
        credit: l.credits || 0,
        contactId: l.contact || undefined
      }));

      await LedgerService.postTransaction(
        orgId,
        savedJournal._id.toString(),
        'Manual Journal',
        savedJournal.date,
        ledgerLines
      );
    }

    res.status(201).json(savedJournal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateJournal = async (req: Request, res: Response) => {
  try {
    const updatedJournal = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJournal) return res.status(404).json({ message: 'Journal not found' });
    res.json(updatedJournal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteJournal = async (req: Request, res: Response) => {
  try {
    const deletedJournal = await Journal.findByIdAndDelete(req.params.id);
    if (!deletedJournal) return res.status(404).json({ message: 'Journal not found' });
    res.json({ message: 'Journal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const reverseJournal = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { id } = req.params;
    const { reversalDate, reversalReason } = req.body;

    const originalJournal = await Journal.findOne({ _id: id, orgId });
    if (!originalJournal) return res.status(404).json({ message: 'Journal not found' });
    if (originalJournal.status === 'Reversed') return res.status(400).json({ message: 'Journal is already reversed' });

    // Enterprise checks: Should verify if the reversalDate is in a closed FiscalPeriod.
    // Assuming period checks pass...

    const reversedLineItems = originalJournal.lineItems.map(item => ({
      account: item.account,
      description: `Reversal of ${originalJournal.journalNumber} - ${item.description || ''}`,
      contact: item.contact,
      debits: item.credits, // Swap debits and credits
      credits: item.debits,
      costCenter: item.costCenter,
      department: item.department
    }));

    const reversalJournal = new Journal({
      orgId,
      date: new Date(reversalDate || new Date()),
      journalNumber: `${originalJournal.journalNumber}-REV`,
      referenceNumber: originalJournal.journalNumber,
      notes: reversalReason || `Reversal of journal ${originalJournal.journalNumber}`,
      reportingMethod: originalJournal.reportingMethod,
      currency: originalJournal.currency,
      lineItems: reversedLineItems,
      subTotal: originalJournal.subTotal,
      total: originalJournal.total,
      status: 'Published',
      reversalOfId: originalJournal._id
    });

    const savedReversal = await reversalJournal.save();

    // Mark original as reversed
    originalJournal.status = 'Reversed';
    originalJournal.reversedById = savedReversal._id as any;
    originalJournal.reversalReason = reversalReason;
    await originalJournal.save();

    res.status(201).json(savedReversal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error reversing journal' });
  }
};
