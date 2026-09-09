import { Request, Response } from 'express';
import { TimeEntry } from '../models/TimeEntry';

export const getTimeEntries = async (req: Request, res: Response) => {
  try {
    const entries = await TimeEntry.find().sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getTimeEntryById = async (req: Request, res: Response) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTimeEntry = async (req: Request, res: Response) => {
  try {
    const entry = new TimeEntry(req.body);
    const savedEntry = await entry.save();
    res.status(201).json(savedEntry);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateTimeEntry = async (req: Request, res: Response) => {
  try {
    const updatedEntry = await TimeEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) return res.status(404).json({ message: 'Time Entry not found' });
    res.json(updatedEntry);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteTimeEntry = async (req: Request, res: Response) => {
  try {
    const deletedEntry = await TimeEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ message: 'Time Entry not found' });
    res.json({ message: 'Time Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
