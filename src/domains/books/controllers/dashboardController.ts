import { Request, Response } from 'express';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import { ChartOfAccount } from '../models/ChartOfAccount';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const invoices = await Invoice.find().lean();
        const bills = await Bill.find().lean();
        const watchlistedAccounts = await ChartOfAccount.find({ addToWatchlist: true, status: 'Active' }).lean();
        
        let totalReceivables = 0;
        let totalIncome = 0;
        invoices.forEach(i => {
            if (i.balanceDue) totalReceivables += i.balanceDue;
            if (i.total) totalIncome += i.total;
        });
        
        let totalPayables = 0;
        bills.forEach(b => {
            if (b.totalAmount) totalPayables += b.totalAmount;
        });

        res.json({
            success: true,
            data: {
                totalReceivables,
                totalPayables,
                totalIncome,
                watchlist: watchlistedAccounts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
