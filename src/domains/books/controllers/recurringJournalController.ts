import { Request, Response } from 'express';
import { RecurringJournal } from '../models/RecurringJournal';

export const getRecurringJournals = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const filter = orgId ? { orgId } : {};
    const journals = await RecurringJournal.find(filter).sort({ createdAt: -1 }).lean();
    res.json(journals);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getRecurringJournalById = async (req: Request | any, res: Response) => {
  try {
    const journal = await RecurringJournal.findById(req.params.id).lean();
    if (!journal) return res.status(404).json({ message: 'Not found' });
    res.json(journal);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createRecurringJournal = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { startsOn, endsAfterOccurrences, endsOn } = req.body;
    
    // Automatically set the first run date to the startsOn date.
    // An enterprise background job would poll for nextRunDate <= new Date().
    const journal = new RecurringJournal({
      ...req.body,
      orgId,
      nextRunDate: new Date(startsOn),
      occurrencesPosted: 0,
      status: 'Active'
    });

    const saved = await journal.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating recurring journal' });
  }
};

export const updateRecurringJournalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Active, Paused
    const journal = await RecurringJournal.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!journal) return res.status(404).json({ message: 'Not found' });
    res.json(journal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRecurringJournal = async (req: Request, res: Response) => {
  try {
    const deleted = await RecurringJournal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};
