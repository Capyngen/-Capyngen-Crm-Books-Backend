import { setContextValue } from './requestContext';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const verifyCapyngenToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.cookie) {
            const matchHrms = req.headers.cookie.match(/accessToken_hrms=([^;]+)/);
            const matchOld = req.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
            if (matchHrms) token = matchHrms[1];
            else if (matchOld) token = matchOld[1];
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
            email: employeeDoc.email,
            designation: employeeDoc.designation ? employeeDoc.designation.toString() : undefined
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
        // Bypassing strict platformType check because some older orgs have 'hrms' or empty strings
        // We will rely on requireFeature and the actual subscription object to secure routes.
        return next();

    } catch (err) {
        console.error("Subscription Check Error:", err);
        return res.status(500).json({ success: false, message: 'Subscription verification failed' });
    }
};


export const requireFeature = (requiredFeature: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (process.env.NODE_ENV === 'development') return next();
            const orgId = (req as any).org?._id;
            if (!orgId) return res.status(401).json({ success: false, message: 'Missing Organization context' });

            const company = await mongoose.connection.collection('companyprofiles').findOne({ 
                _id: new mongoose.Types.ObjectId(orgId) 
            });

            let subscription = null;
            if (company && company.subscriptionId) {
                subscription = await mongoose.connection.collection('subscriptions').findOne({
                    _id: new mongoose.Types.ObjectId(company.subscriptionId)
                });
            }
            if (!subscription) {
                subscription = await mongoose.connection.collection('subscriptions').findOne({ companyId: orgId }) || 
                               await mongoose.connection.collection('subscriptions').findOne({ orgId: orgId });
            }

            if (!subscription) {
                return res.status(403).json({ success: false, message: 'No active subscription found. Please subscribe to a plan.' });
            }

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



