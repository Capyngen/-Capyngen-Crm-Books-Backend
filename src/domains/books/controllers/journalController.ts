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
