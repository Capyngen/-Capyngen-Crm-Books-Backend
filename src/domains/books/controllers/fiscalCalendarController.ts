import { Request, Response } from 'express';
import { FiscalYear } from '../models/FiscalYear';

// Generate 12 months for a year
const generatePeriods = (startDate: Date) => {
  const periods = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 12; i++) {
    const periodStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const periodEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0); // last day of month
    
    periods.push({
      periodName: periodStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
      startDate: periodStart,
      endDate: periodEnd,
      isClosed: false
    });
  }
  return periods;
};

export const getFiscalYears = async (req: Request | any, res: Response) => {
  try {
    
    let orgIdRaw = req.org?._id || req.headers['x-org-id']; let orgId = orgIdRaw ? String(orgIdRaw) : undefined;
    if (!orgId) {
      const mongoose = require('mongoose');
      const firstCompany = await mongoose.connection.collection('companyprofiles').findOne();
      if (firstCompany) orgId = firstCompany._id.toString();
    }

    const filter = orgId ? { orgId } : {};
    const years = await FiscalYear.find(filter).sort({ startDate: -1 }).lean();
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createFiscalYear = async (req: Request | any, res: Response) => {
  try {
    const orgIdRaw = req.org?._id || req.headers['x-org-id']; const orgId = orgIdRaw ? String(orgIdRaw) : undefined;
    const { yearName, startDate, endDate } = req.body;
    
    const periods = generatePeriods(new Date(startDate));
    
    const fiscalYear = new FiscalYear({
      orgId,
      yearName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isClosed: false,
      periods
    });

    const saved = await fiscalYear.save();
    res.status(201).json(saved.toJSON());
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const togglePeriodLock = async (req: Request, res: Response) => {
  try {
    const { id, periodId } = req.params;
    const { isClosed } = req.body;

    const year = await FiscalYear.findById(id);
    if (!year) return res.status(404).json({ message: 'Fiscal Year not found' });

    const period = (year.periods as any).id(periodId);
    if (!period) return res.status(404).json({ message: 'Period not found' });

    period.isClosed = isClosed;
    await year.save();

    res.json(year.toJSON());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleYearLock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isClosed } = req.body;

    const year = await FiscalYear.findByIdAndUpdate(id, { isClosed }, { new: true }).lean();
    if (!year) return res.status(404).json({ message: 'Not found' });

    res.json(year);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
