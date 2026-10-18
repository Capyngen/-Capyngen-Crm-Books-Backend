import { Request, Response } from 'express';
import { TreasuryForecastService } from '../services/TreasuryForecastService';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

export const getCashForecast = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const horizon = Number(req.query.days) || 90;

    const forecast = await TreasuryForecastService.getTreasuryForecast(orgId, horizon);
    res.json(forecast);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating cash forecast' });
  }
};
