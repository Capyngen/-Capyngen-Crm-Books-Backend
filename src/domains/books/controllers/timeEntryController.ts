import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TimeEntry from '../models/TimeEntry';

export const getTimeEntries = async (req: Request, res: Response) => {
  try {
    const orgId = String(
      (req as any).org?._id ||
      req.headers['x-org-id'] ||
      req.headers['x-company-id'] ||
      '6aa797278d301b4735f1d322'
    );
    const conditions: any[] = [{ orgId }, { companyId: orgId }];
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      const objId = new mongoose.Types.ObjectId(orgId);
      conditions.push({ orgId: objId }, { companyId: objId });
    }
    const filter = { $or: conditions };

    const entries = await TimeEntry.find(filter)
      .populate('project', 'projectName projectCode customer')
      .populate('projectId', 'projectName projectCode customer')
      .sort({ date: -1, createdAt: -1 });

    const enriched = entries.map((e: any) => {
      const obj = e.toObject ? e.toObject() : e;
      obj.timeSpent = obj.timeSpent || (obj.hours ? `${obj.hours} hrs` : '0h');
      obj.task = obj.task || 'General Development & Diagnostics';
      if (obj.project && typeof obj.project === 'object') {
        obj.projectName = obj.project.projectName;
      }
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getTimeEntryById = async (req: Request, res: Response) => {
  try {
    const entry = await TimeEntry.findById(req.params.id)
      .populate('project', 'projectName projectCode customer')
      .populate('projectId', 'projectName projectCode customer');
    if (!entry) return res.status(404).json({ message: 'Time Entry not found' });
    const obj: any = entry.toObject ? entry.toObject() : entry;
    obj.timeSpent = obj.timeSpent || (obj.hours ? `${obj.hours} hrs` : '0h');
    obj.task = obj.task || 'General Development & Diagnostics';
    if (obj.project && typeof obj.project === 'object') {
      obj.projectName = obj.project.projectName;
    }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTimeEntry = async (req: Request, res: Response) => {
  try {
    const orgId = String((req as any).org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
    const entry = new TimeEntry({
      ...req.body,
      companyId: orgId,
      orgId
    });
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
