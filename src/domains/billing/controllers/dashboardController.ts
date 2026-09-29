import { Request, Response } from 'express';
import Plan from '../models/Plan';
import Customer from '../models/Customer';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find().lean();
        const customers = await Customer.find().lean();
        
        let mrr = 0;
        plans.forEach(p => {
            if (p.status === 'Active' && p.price) {
                mrr += p.price; // Approximation for demo
            }
        });

        res.json({
            success: true,
            data: {
                netRevenue: mrr * 12,
                mrr,
                activeSubscriptions: plans.length,
                arpu: plans.length ? (mrr / plans.length) : 0,
                churnRate: 0,
                activeCustomers: customers.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
