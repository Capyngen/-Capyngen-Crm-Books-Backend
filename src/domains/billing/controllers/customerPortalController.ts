import { Request, Response } from 'express';
import { CustomerPortalService } from '../../billing/services/CustomerPortalService';

export const getSecurePortalLink = async (req: Request, res: Response) => {
    try {
        const link = await CustomerPortalService.generateSecurePortalLink(req.params.customerId);
        res.status(200).json({ success: true, link });
    } catch (e: any) {
        res.status(400).json({ success: false, message: e.message });
    }
};

export const getStatementOfAccount = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const soa = await CustomerPortalService.getStatementOfAccount(
            req.params.customerId,
            new Date(startDate as string),
            new Date(endDate as string)
        );
        res.status(200).json({ success: true, data: soa });
    } catch (e: any) {
        res.status(400).json({ success: false, message: e.message });
    }
};

export const getOpenInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await CustomerPortalService.getOpenInvoices(req.params.customerId);
        res.status(200).json({ success: true, data: invoices });
    } catch (e: any) {
        res.status(400).json({ success: false, message: e.message });
    }
};
