import { Request, Response } from 'express';
import { YearEndClosingService } from '../services/YearEndClosingService';
import { FiscalYear } from '../models/FiscalYear';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

export const getFiscalYears = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    let years = await FiscalYear.find({ orgId }).sort({ startDate: -1 });

    if (years.length === 0) {
      // Auto-seed current and next fiscal year if none exist
      const currentYear = new Date().getFullYear();
      const fy1 = new FiscalYear({
        orgId,
        yearName: `FY ${currentYear}-${currentYear + 1}`,
        startDate: new Date(currentYear, 3, 1), // April 1
        endDate: new Date(currentYear + 1, 2, 31, 23, 59, 59), // March 31
        isClosed: false,
        periods: [
          { periodName: `Q1 ${currentYear}`, startDate: new Date(currentYear, 3, 1), endDate: new Date(currentYear, 5, 30), isClosed: false },
          { periodName: `Q2 ${currentYear}`, startDate: new Date(currentYear, 6, 1), endDate: new Date(currentYear, 8, 30), isClosed: false },
          { periodName: `Q3 ${currentYear}`, startDate: new Date(currentYear, 9, 1), endDate: new Date(currentYear, 11, 31), isClosed: false },
          { periodName: `Q4 ${currentYear + 1}`, startDate: new Date(currentYear + 1, 0, 1), endDate: new Date(currentYear + 1, 2, 31), isClosed: false }
        ]
      });
      await fy1.save();
      years = [fy1];
    }

    res.json(years);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching fiscal years' });
  }
};

export const previewClosing = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { fiscalYearId } = req.params;

    const preview = await YearEndClosingService.previewYearEndClosing(orgId, String(fiscalYearId));
    res.json(preview);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error generating closing preview' });
  }
};

export const executeClosing = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { fiscalYearId } = req.params;
    const { notes } = req.body;

    const result = await YearEndClosingService.executeYearEndClosing(orgId, String(fiscalYearId), notes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error executing year-end close' });
  }
};
