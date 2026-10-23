import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { Request, Response } from 'express';
import { Journal } from '../models/Journal';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const getJournals = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id?.toString() || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};
    const journals = await Journal.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getJournalById = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id?.toString() || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ orgId }, { companyId: orgId }];
    }
    const journal = await Journal.findOne(filter);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createJournal = async (req: Request, res: Response) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let journalNumber = req.body.journalNumber;
    if (!journalNumber) {
      const count = await Journal.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      journalNumber = `JRN-${String(count + 1).padStart(5, '0')}`;
    }

    const notes = req.body.notes || 'Manual Journal entry';
    const reportingMethod = req.body.reportingMethod || 'accrual';
    const lineItems = (req.body.lineItems || req.body.lines || []).map((l: any) => ({
      account: l.account || l.accountName || 'General Ledger',
      description: l.description || '',
      debits: Number(l.debits ?? l.debit ?? 0),
      credits: Number(l.credits ?? l.credit ?? 0),
      contact: l.contact,
      costCenter: l.costCenter,
      department: l.department
    }));

    const journal = new Journal({
      ...req.body,
      journalNumber,
      notes,
      reportingMethod,
      lineItems,
      orgId,
      companyId: orgId
    });
    
    // Double-entry validation
    const totalDebit = (journal.lineItems as any[]).reduce((sum: number, l: any) => sum + (l.debits || 0), 0);
    const totalCredit = (journal.lineItems as any[]).reduce((sum: number, l: any) => sum + (l.credits || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ message: `Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})` });
    }

    const requestedStatus = req.body.status || 'Published';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'manual_journals',
        totalDebit,
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Published';
        finalApprovalStatus = 'Approved';
      }
    }

    journal.status = finalStatus;
    (journal as any).approvalStatus = finalApprovalStatus;

    const savedJournal = await journal.save();

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'manual_journals',
        documentId: savedJournal._id.toString(),
        documentNumber: journalNumber,
        amount: totalDebit,
        customerOrVendorName: 'Manual General Ledger Entry',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (savedJournal.status !== 'Draft') {
      const ledgerLines = (savedJournal.lineItems as any[]).map((l: any) => ({
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
    const orgId = (req as any).org?._id?.toString() || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];

    const updatedJournal = await Journal.findOneAndUpdate(filter, req.body, { new: true });
    if (!updatedJournal) return res.status(404).json({ message: 'Journal not found' });
    res.json(updatedJournal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteJournal = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id?.toString() || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];

    const deletedJournal = await Journal.findOneAndDelete(filter);
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

    const reversedLineItems = (originalJournal.lineItems as any[]).map((item: any) => ({
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

    // Post reversal entries to Ledger
    const ledgerLines = (savedReversal.lineItems as any[]).map((l: any) => ({
      accountId: l.account,
      debit: l.debits || 0,
      credit: l.credits || 0,
      contactId: l.contact || undefined
    }));

    await LedgerService.postTransaction(
      orgId,
      savedReversal._id.toString(),
      'Manual Journal Reversal',
      savedReversal.date,
      ledgerLines
    );

    res.status(201).json(savedReversal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error reversing journal' });
  }
};
