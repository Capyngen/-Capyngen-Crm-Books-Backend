import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const verifyCapyngenToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.accessToken_hrms) {
            token = req.cookies.accessToken_hrms;
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access Denied: Missing Capyngen Token' });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || 'esdjAF8ZphD/gj14SlF35Ej97NL/C5PIQphWvzKYLzsX8l2QEMs1PQAXPTsugLIO';
        
        const decoded = jwt.verify(token, secret) as any;

        // Fetch Employee from HRMS collection (Cross-collection read)
        // Since we are connected to hrms_crm DB, 'employees' collection exists.
        const employeeDoc = await mongoose.connection.collection('employees').findOne({ 
            _id: new mongoose.Types.ObjectId(decoded._id || decoded.id) 
        });

        if (!employeeDoc) {
            return res.status(401).json({ success: false, message: 'User not found in Capyngen Ecosystem' });
        }

        // ADAPTER PATTERN: Inject HRMS identity into Books legacy variables
        // Books logic relies on (req as any).user._id and (req as any).org._id
        (req as any).user = {
            _id: employeeDoc._id.toString(),
            role: employeeDoc.role,
            email: employeeDoc.email
        };

        (req as any).org = {
            _id: employeeDoc.companyId.toString()
        };

        next();
    } catch (err) {
        console.error("HRMS Auth Error:", err);
        return res.status(401).json({ success: false, message: 'Invalid or Expired Capyngen Session' });
    }
};

export const requireBooksSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = (req as any).org?._id;
        if (!orgId) return res.status(401).json({ success: false, message: 'Missing Organization context' });

        // Check the HRMS company profile collection
        const company = await mongoose.connection.collection('companyprofiles').findOne({ 
            _id: new mongoose.Types.ObjectId(orgId) 
        });

        if (!company) return res.status(404).json({ success: false, message: 'Company Profile missing' });

        const platformType = (company.platformType || '').toLowerCase();
        
        // Allowed platforms for Books
        if (['all', 'accounts', 'books', 'crm', 'sales'].includes(platformType)) {
            return next(); // Let them pass for now. Ideally should be strictly accounts/all
        }

        return res.status(403).json({ 
            success: false, 
            message: 'Upgrade Required: Your active plan does not include the Books module.' 
        });

    } catch (err) {
        console.error("Subscription Check Error:", err);
        return res.status(500).json({ success: false, message: 'Subscription verification failed' });
    }
};


export const requireFeature = (requiredFeature: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = (req as any).org?._id;
            if (!orgId) return res.status(401).json({ success: false, message: 'Missing Organization context' });

            const company = await mongoose.connection.collection('companyprofiles').findOne({ 
                _id: new mongoose.Types.ObjectId(orgId) 
            });

            if (!company || !company.subscriptionId) {
                return res.status(403).json({ success: false, message: 'No active subscription found. Please subscribe to a plan.' });
            }

            const subscription = await mongoose.connection.collection('subscriptions').findOne({
                _id: new mongoose.Types.ObjectId(company.subscriptionId)
            });

            if (!subscription || !subscription.planId) {
                return res.status(403).json({ success: false, message: 'Invalid subscription plan.' });
            }

            const plan = await mongoose.connection.collection('plans').findOne({
                _id: new mongoose.Types.ObjectId(subscription.planId)
            });

            if (!plan) {
                return res.status(403).json({ success: false, message: 'Plan details not found.' });
            }

            const featureKeys = plan.featureKeys || [];
            if (!featureKeys.includes(requiredFeature)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Upgrade Required: Your active plan does not include access to this feature.` 
                });
            }

            next();
        } catch (err) {
            console.error("Feature Check Error:", err);
            return res.status(500).json({ success: false, message: 'Feature verification failed' });
        }
    };
};
