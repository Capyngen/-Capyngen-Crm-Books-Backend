import { Request, Response } from 'express';
import { GstComplianceService } from '../services/GstComplianceService';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

export const getGSTR1 = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await GstComplianceService.getGSTR1Summary(orgId, month, year);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating GSTR-1 summary' });
  }
};

export const getGSTR2B = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await GstComplianceService.getGSTR2BITCReconciliation(orgId, month, year);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating GSTR-2B reconciliation' });
  }
};

export const getGSTR3B = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await GstComplianceService.getGSTR3BSummary(orgId, month, year);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating GSTR-3B summary' });
  }
};

export const getTdsReturn = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const quarter = req.query.quarter ? Number(req.query.quarter) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await GstComplianceService.getTdsForm26QSummary(orgId, quarter, year);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating TDS return summary' });
  }
};
