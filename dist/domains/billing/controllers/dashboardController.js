"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const getDashboardData = async (req, res) => {
    try {
        const orgId = req.org?._id || req.user?.companyId || req.headers?.['x-organization-id'] || req.headers?.['x-company-id'];
        const orgIdStr = orgId ? orgId.toString() : '';
        const isValidId = mongoose_1.default.Types.ObjectId.isValid(orgIdStr);
        const orgIdObj = isValidId ? new mongoose_1.default.Types.ObjectId(orgIdStr) : null;
        const tenantFilter = orgId ? {
            $or: [
                { orgId: orgIdStr },
                { companyId: orgIdStr },
                ...(orgIdObj ? [{ orgId: orgIdObj }, { companyId: orgIdObj }] : [])
            ]
        } : {};
        const [plans, customers, invoices] = await Promise.all([
            Plan_1.default.find(tenantFilter).lean(),
            Customer_1.default.find(tenantFilter).sort({ createdAt: -1 }).lean(),
            Invoice_1.default.find(tenantFilter).sort({ createdAt: -1 }).lean()
        ]);
        let mrr = 0;
        let activePlanCount = 0;
        plans.forEach((p) => {
            if (p.status === 'Active' && p.price) {
                mrr += p.price;
                activePlanCount++;
            }
        });
        let totalInvoicedRevenue = 0;
        invoices.forEach((i) => {
            totalInvoicedRevenue += (i.total || 0);
        });
        const netRevenue = totalInvoicedRevenue > 0 ? totalInvoicedRevenue : mrr * 12;
        const activeCustomers = customers.length;
        const arpu = activeCustomers > 0 ? (mrr / activeCustomers) : 0;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthlyRevenue = monthNames.map((name, index) => {
            let rev = 0;
            invoices.forEach((i) => {
                const d = new Date(i.invoiceDate || i.createdAt);
                if (d.getFullYear() === currentYear && d.getMonth() === index) {
                    rev += (i.total || 0);
                }
            });
            return {
                month: name,
                revenue: rev
            };
        });
        const recentCustomers = customers.slice(0, 5).map((c) => ({
            id: c._id,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Valued Customer',
            email: c.email || c.contactPersons?.[0]?.email || '-',
            currency: c.currency || 'USD',
            createdAt: c.createdAt
        }));
        const setupSteps = [
            { id: 'org', title: 'Complete your organization profile', desc: 'Add legal company details, timezone and billing currency', completed: true, link: '/settings/organization' },
            { id: 'plans', title: 'Create products & pricing plans', desc: 'Define recurring billing cycles and subscription tiers', completed: plans.length > 0, count: plans.length, link: '/billing/product-catalog/plans/new' },
            { id: 'customers', title: 'Onboard billing customers', desc: 'Add client profiles for automated subscription management', completed: customers.length > 0, count: customers.length, link: '/billing/customers/new' },
            { id: 'invoices', title: 'Customize invoice templates & branding', desc: 'Upload company logo and set terms for invoices', completed: invoices.length > 0, count: invoices.length, link: '/billing/sales/invoices/new' },
            { id: 'gateway', title: 'Payment Gateways & Hosted Checkout', desc: 'Configure payment processor or bank transfer collection', completed: true, link: '/billing/apps/zoho-payments' }
        ];
        const recentEvents = [
            ...customers.slice(0, 4).map((c) => ({
                id: c._id,
                type: 'customer',
                title: `New customer: ${c.name || 'Client'}`,
                desc: `Customer profile registered with email ${c.email || 'N/A'}`,
                date: c.createdAt || new Date(),
                link: `/billing/customers/${c._id}`
            })),
            ...invoices.slice(0, 4).map((i) => ({
                id: i._id,
                type: 'invoice',
                title: `Invoice ${i.invoiceNumber || 'INV-001'} generated`,
                desc: `Billed amount: ${i.total || 0} (${i.status || 'Draft'})`,
                date: i.invoiceDate || i.createdAt || new Date(),
                link: `/billing/sales/invoices/${i._id}`
            })),
            ...plans.slice(0, 3).map((p) => ({
                id: p._id,
                type: 'plan',
                title: `Plan: ${p.planName} (${p.status || 'Active'})`,
                desc: `Price tier configured at ${p.price || 0} / ${p.billingFrequencyUnit || 'month'}`,
                date: p.createdAt || new Date(),
                link: `/billing/product-catalog/plans`
            }))
        ];
        recentEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.json({
            success: true,
            data: {
                netRevenue,
                mrr,
                activeSubscriptions: activePlanCount || plans.length,
                arpu,
                churnRate: 0,
                activeCustomers,
                monthlyRevenue,
                recentCustomers,
                totalPlans: plans.length,
                setupProgress: {
                    completedCount: setupSteps.filter(s => s.completed).length,
                    totalCount: setupSteps.length,
                    percentage: Math.round((setupSteps.filter(s => s.completed).length / setupSteps.length) * 100),
                    steps: setupSteps
                },
                recentEvents
            }
        });
    }
    catch (error) {
        console.error("Billing Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDashboardData = getDashboardData;
