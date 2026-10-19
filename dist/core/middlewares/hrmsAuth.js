"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFeature = exports.requireBooksSubscription = exports.verifyCapyngenToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const verifyCapyngenToken = async (req, res, next) => {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.headers.cookie) {
            const matchHrms = req.headers.cookie.match(/accessToken_hrms=([^;]+)/);
            const matchOld = req.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
            if (matchHrms)
                token = matchHrms[1];
            else if (matchOld)
                token = matchOld[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access Denied: Missing Capyngen Token' });
        }
        const secret = process.env.ACCESS_TOKEN_SECRET || 'esdjAF8ZphD/gj14SlF35Ej97NL/C5PIQphWvzKYLzsX8l2QEMs1PQAXPTsugLIO';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Fetch Employee from HRMS collection (Cross-collection read)
        // Since we are connected to hrms_crm DB, 'employees' collection exists.
        const employeeDoc = await mongoose_1.default.connection.collection('employees').findOne({
            _id: new mongoose_1.default.Types.ObjectId(decoded._id || decoded.id)
        });
        if (!employeeDoc) {
            return res.status(401).json({ success: false, message: 'User not found in Capyngen Ecosystem' });
        }
        // ADAPTER PATTERN: Inject HRMS identity into Books legacy variables
        // Books logic relies on (req as any).user._id and (req as any).org._id
        req.user = {
            _id: employeeDoc._id.toString(),
            role: employeeDoc.role,
            email: employeeDoc.email,
            designation: employeeDoc.designation ? employeeDoc.designation.toString() : undefined
        };
        req.org = {
            _id: employeeDoc.companyId.toString()
        };
        next();
    }
    catch (err) {
        console.error("HRMS Auth Error:", err);
        return res.status(401).json({ success: false, message: 'Invalid or Expired Capyngen Session' });
    }
};
exports.verifyCapyngenToken = verifyCapyngenToken;
const requireBooksSubscription = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        if (!orgId)
            return res.status(401).json({ success: false, message: 'Missing Organization context' });
        const orgObjectId = mongoose_1.default.Types.ObjectId.isValid(orgId) ? new mongoose_1.default.Types.ObjectId(orgId) : orgId;
        const company = await mongoose_1.default.connection.collection('companyprofiles').findOne({
            $or: [{ _id: orgObjectId }, { _id: orgId.toString() }]
        });
        if (!company)
            return res.status(404).json({ success: false, message: 'Company Profile missing' });
        return next();
    }
    catch (err) {
        console.error("Subscription Check Error:", err);
        return res.status(500).json({ success: false, message: 'Subscription verification failed' });
    }
};
exports.requireBooksSubscription = requireBooksSubscription;
const requireFeature = (requiredFeature) => {
    return async (req, res, next) => {
        try {
            if (process.env.NODE_ENV === 'development')
                return next();
            const orgId = req.org?._id;
            if (!orgId)
                return res.status(401).json({ success: false, message: 'Missing Organization context' });
            const user = req.user;
            const role = (user?.role || '').toLowerCase();
            // Bypass feature-key restrictions for Admin, Owner, SuperAdmin, HR Admin
            if (['admin', 'owner', 'superadmin', 'super_admin', 'hradmin', 'hr_admin'].includes(role)) {
                return next();
            }
            const orgObjectId = mongoose_1.default.Types.ObjectId.isValid(orgId) ? new mongoose_1.default.Types.ObjectId(orgId) : orgId;
            const company = await mongoose_1.default.connection.collection('companyprofiles').findOne({
                $or: [{ _id: orgObjectId }, { _id: orgId.toString() }]
            });
            // If company is Enterprise tier or platform, automatically grant full feature access
            if (company && ((company.platformType && company.platformType.toLowerCase().includes('enterprise')) ||
                (company.tier && company.tier.toLowerCase().includes('enterprise')))) {
                return next();
            }
            let subscription = null;
            if (company && company.subscriptionId) {
                const subId = mongoose_1.default.Types.ObjectId.isValid(company.subscriptionId)
                    ? new mongoose_1.default.Types.ObjectId(company.subscriptionId)
                    : company.subscriptionId;
                subscription = await mongoose_1.default.connection.collection('subscriptions').findOne({
                    $or: [{ _id: subId }, { _id: company.subscriptionId.toString() }]
                });
            }
            if (!subscription) {
                subscription = await mongoose_1.default.connection.collection('subscriptions').findOne({
                    $or: [
                        { companyId: orgObjectId },
                        { companyId: orgId.toString() },
                        { orgId: orgObjectId },
                        { orgId: orgId.toString() }
                    ]
                });
            }
            if (!subscription) {
                // If company is active, gracefully fallback instead of crashing business
                if (company && (company.accountStatus === 'Active' || company.status === 'Active')) {
                    return next();
                }
                return res.status(403).json({ success: false, message: 'No active subscription found. Please subscribe to a plan.' });
            }
            if (!subscription || !subscription.planId) {
                if (company && (company.accountStatus === 'Active' || company.status === 'Active')) {
                    return next();
                }
                return res.status(403).json({ success: false, message: 'Invalid subscription plan.' });
            }
            const planId = mongoose_1.default.Types.ObjectId.isValid(subscription.planId)
                ? new mongoose_1.default.Types.ObjectId(subscription.planId)
                : subscription.planId;
            const plan = await mongoose_1.default.connection.collection('plans').findOne({
                $or: [{ _id: planId }, { _id: subscription.planId.toString() }]
            });
            if (!plan) {
                if (company && (company.accountStatus === 'Active' || company.status === 'Active')) {
                    return next();
                }
                return res.status(403).json({ success: false, message: 'Plan details not found.' });
            }
            // Enterprise plan includes all features
            if (plan.name && plan.name.toLowerCase().includes('enterprise')) {
                return next();
            }
            const featureKeys = plan.featureKeys || [];
            if (featureKeys.includes('*') || featureKeys.includes('all') || featureKeys.includes(requiredFeature)) {
                return next();
            }
            return res.status(403).json({
                success: false,
                message: `Upgrade Required: Your active plan does not include access to this feature.`
            });
        }
        catch (err) {
            console.error("Feature Check Error:", err);
            return res.status(500).json({ success: false, message: 'Feature verification failed' });
        }
    };
};
exports.requireFeature = requireFeature;
