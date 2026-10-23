"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryDashboardData = exports.getDashboardData = exports.buildTenantFilter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const Expense_1 = __importDefault(require("../models/Expense"));
const Item_1 = __importDefault(require("../../inventory/models/Item"));
const SalesOrder_1 = __importDefault(require("../../billing/models/SalesOrder"));
const Shipment_1 = __importDefault(require("../../inventory/models/Shipment"));
const Warehouse_1 = __importDefault(require("../../inventory/models/Warehouse"));
const TransferOrder_1 = __importDefault(require("../../inventory/models/TransferOrder"));
const Customer_1 = __importDefault(require("../../billing/models/Customer"));
const Vendor_1 = __importDefault(require("../../inventory/models/Vendor"));
const PaymentReceived_1 = __importDefault(require("../../billing/models/PaymentReceived"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const buildTenantFilter = (req) => (0, tenantFilter_1.buildTenantFilter)(req);
exports.buildTenantFilter = buildTenantFilter;
const getDashboardData = async (req, res) => {
    try {
        const tenantFilter = (0, exports.buildTenantFilter)(req);
        const [invoices, bills, expenses, items, customers, vendors, paymentsReceived, watchlistedAccounts, bankAccounts] = await Promise.all([
            Invoice_1.default.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            Bill_1.default.find(tenantFilter).populate('vendorId', 'name displayName companyName vendorName').sort({ createdAt: -1 }).lean(),
            Expense_1.default.find(tenantFilter).sort({ createdAt: -1 }).lean(),
            Item_1.default.find(tenantFilter).lean(),
            Customer_1.default.find(tenantFilter).lean(),
            Vendor_1.default.find(tenantFilter).lean(),
            PaymentReceived_1.default.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            ChartOfAccount_1.ChartOfAccount.find({ ...tenantFilter, addToWatchlist: true, status: 'Active' }).lean(),
            ChartOfAccount_1.ChartOfAccount.find({
                ...tenantFilter,
                $or: [
                    { accountType: { $in: ['Bank', 'Cash', 'Credit Card'] } },
                    { systemAccountType: { $in: ['bank', 'cash', 'credit_card'] } },
                    { accountGroup: { $in: ['Bank', 'Cash', 'Cash & Bank'] } }
                ]
            }).lean()
        ]);
        let totalReceivables = 0;
        let currentReceivables = 0;
        let overdueReceivables = 0;
        let totalIncome = 0;
        let pendingApprovalReceivables = 0;
        let pendingInvoicesCount = 0;
        let draftReceivables = 0;
        let draftInvoicesCount = 0;
        const now = new Date();
        invoices.forEach((i) => {
            const bal = i.balanceDue || 0;
            const tot = i.total || 0;
            const isPendingApproval = i.status === 'Pending Approval' || i.approvalStatus === 'Pending';
            const isDraft = i.status === 'Draft' || i.approvalStatus === 'Draft';
            const isVoidOrRejected = i.status === 'Void' || i.status === 'Rejected' || i.approvalStatus === 'Rejected';
            if (isPendingApproval) {
                pendingApprovalReceivables += (bal > 0 ? bal : tot);
                pendingInvoicesCount += 1;
                return;
            }
            if (isDraft) {
                draftReceivables += (bal > 0 ? bal : tot);
                draftInvoicesCount += 1;
                return;
            }
            if (isVoidOrRejected) {
                return;
            }
            // Realized / Approved Invoices
            totalReceivables += bal;
            totalIncome += tot;
            if (bal > 0) {
                if (i.dueDate && new Date(i.dueDate) < now) {
                    overdueReceivables += bal;
                }
                else {
                    currentReceivables += bal;
                }
            }
        });
        let totalPayables = 0;
        let currentPayables = 0;
        let overduePayables = 0;
        let pendingApprovalPayables = 0;
        let pendingBillsCount = 0;
        let draftPayables = 0;
        let draftBillsCount = 0;
        bills.forEach((b) => {
            const tot = b.totalAmount || b.total || 0;
            const isPendingApproval = b.status === 'Pending Approval' || b.approvalStatus === 'Pending';
            const isDraft = b.status === 'Draft' || b.approvalStatus === 'Draft';
            const isVoidOrRejected = b.status === 'Void' || b.status === 'Cancelled' || b.approvalStatus === 'Rejected';
            if (isPendingApproval) {
                pendingApprovalPayables += tot;
                pendingBillsCount += 1;
                return;
            }
            if (isDraft) {
                draftPayables += tot;
                draftBillsCount += 1;
                return;
            }
            if (isVoidOrRejected) {
                return;
            }
            if (b.status !== 'Paid') {
                totalPayables += tot;
                if (b.dueDate && new Date(b.dueDate) < now) {
                    overduePayables += tot;
                }
                else {
                    currentPayables += tot;
                }
            }
        });
        let totalExpense = 0;
        const expenseCategoryMap = {};
        expenses.forEach((e) => {
            const amt = (e.totalAmount || e.amount || 0);
            totalExpense += amt;
            const cat = e.expenseAccount || e.category || 'General Operating';
            if (!expenseCategoryMap[cat]) {
                expenseCategoryMap[cat] = { amount: 0, count: 0 };
            }
            expenseCategoryMap[cat].amount += amt;
            expenseCategoryMap[cat].count += 1;
        });
        // Top 5 Expenses by Category
        const expensesByCategory = Object.entries(expenseCategoryMap)
            .map(([category, val]) => ({
            category,
            amount: val.amount,
            count: val.count,
            percentage: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0
        }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        // 12 Months Comparative Stats
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = now.getFullYear();
        const monthlyStats = monthNames.map((name, index) => {
            let monthIncome = 0;
            let monthExpense = 0;
            invoices.forEach((i) => {
                const isUnapproved = ['Draft', 'Pending Approval', 'Void', 'Rejected'].includes(i.status) ||
                    ['Pending', 'Draft', 'Rejected'].includes(i.approvalStatus);
                if (isUnapproved)
                    return;
                const d = new Date(i.invoiceDate || i.createdAt);
                if (d.getFullYear() === currentYear && d.getMonth() === index) {
                    monthIncome += (i.total || 0);
                }
            });
            expenses.forEach((e) => {
                const d = new Date(e.date || e.createdAt);
                if (d.getFullYear() === currentYear && d.getMonth() === index) {
                    monthExpense += (e.totalAmount || e.amount || 0);
                }
            });
            return {
                month: name,
                income: monthIncome,
                expense: monthExpense
            };
        });
        // Unified Recent Activity Feed
        const recentActivity = [];
        invoices.slice(0, 5).forEach((inv) => {
            recentActivity.push({
                id: inv._id,
                type: 'invoice',
                title: `Invoice ${inv.invoiceNumber}`,
                subtitle: inv.customer?.displayName || inv.customer?.name || 'Client',
                amount: inv.total || 0,
                status: inv.status || 'Draft',
                date: inv.invoiceDate || inv.createdAt,
                url: `/books/sales/invoices/${inv._id}`
            });
        });
        paymentsReceived.slice(0, 5).forEach((pmt) => {
            recentActivity.push({
                id: pmt._id,
                type: 'payment',
                title: `Payment ${pmt.paymentNumber || 'Receipt'}`,
                subtitle: pmt.customer?.displayName || pmt.customer?.name || 'Customer Payment',
                amount: pmt.amount || 0,
                status: pmt.status || 'Received',
                date: pmt.paymentDate || pmt.createdAt,
                url: `/books/sales/payments-received/${pmt._id}`
            });
        });
        bills.slice(0, 4).forEach((bill) => {
            recentActivity.push({
                id: bill._id,
                type: 'bill',
                title: `Bill ${bill.billNumber}`,
                subtitle: bill.vendorId?.name || bill.vendorId?.displayName || 'Vendor Bill',
                amount: bill.totalAmount || 0,
                status: bill.status || 'Open',
                date: bill.billDate || bill.createdAt,
                url: `/books/purchases/bills/${bill._id}`
            });
        });
        expenses.slice(0, 4).forEach((exp) => {
            recentActivity.push({
                id: exp._id,
                type: 'expense',
                title: `Expense: ${exp.expenseAccount || 'Operating'}`,
                subtitle: exp.reference || 'Recorded Expense',
                amount: exp.totalAmount || exp.amount || 0,
                status: exp.status || 'Paid',
                date: exp.date || exp.createdAt,
                url: `/books/purchases/expenses/${exp._id}`
            });
        });
        recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Cash Flow estimation
        let totalCashInflow = 0;
        paymentsReceived.forEach((p) => { totalCashInflow += (p.amount || 0); });
        if (totalCashInflow === 0) {
            invoices.forEach((i) => {
                if (i.status === 'Paid')
                    totalCashInflow += (i.total || 0);
            });
        }
        const totalCashOutflow = totalExpense;
        const netCashFlow = totalCashInflow - totalCashOutflow;
        // Dynamic Setup Progress
        const setupSteps = [
            { id: 'org', title: 'Organization Profile', desc: 'Company details, currency and fiscal year configured', completed: true, link: '/settings/organization' },
            { id: 'items', title: 'Add Items & Services', desc: 'Create your inventory or service catalog', completed: items.length > 0, count: items.length, link: '/books/items/new' },
            { id: 'customers', title: 'Add Customers & Vendors', desc: 'Onboard clients and suppliers', completed: customers.length > 0 || vendors.length > 0, count: customers.length + vendors.length, link: '/books/sales/customers/new' },
            { id: 'bank', title: 'Connect Bank & Cash Accounts', desc: 'Track deposits and automated feeds', completed: bankAccounts.length > 0, count: bankAccounts.length, link: '/books/banking' },
            { id: 'invoice', title: 'Create your First Invoice', desc: 'Bill a customer and record receivables', completed: invoices.length > 0, count: invoices.length, link: '/books/sales/invoices/new' },
            { id: 'taxes', title: 'Configure Taxes & Reporting', desc: 'GSTIN, TDS, and Chart of Accounts compliance', completed: true, link: '/books/taxes' }
        ];
        const completedStepsCount = setupSteps.filter(s => s.completed).length;
        // Dynamic Smart Announcements
        const announcements = [];
        if (pendingApprovalReceivables > 0) {
            announcements.unshift({
                id: 'pending-approvals-inv',
                type: 'warning',
                title: 'Pending Authorizations: Invoices',
                message: `You have ${pendingInvoicesCount} invoice(s) totaling ₹${pendingApprovalReceivables.toLocaleString('en-IN')} pending authorization. These transactions are excluded from realized income and receivables until approved.`,
                actionLabel: 'Review Pending Invoices',
                actionUrl: '/books/sales/invoices?status=Pending+Approval'
            });
        }
        if (pendingApprovalPayables > 0) {
            announcements.unshift({
                id: 'pending-approvals-bills',
                type: 'warning',
                title: 'Pending Authorizations: Bills',
                message: `You have ${pendingBillsCount} vendor bill(s) totaling ₹${pendingApprovalPayables.toLocaleString('en-IN')} awaiting authorization before posting.`,
                actionLabel: 'Review Bills',
                actionUrl: '/books/purchases/bills'
            });
        }
        if (overdueReceivables > 0) {
            announcements.push({
                id: 'overdue-rec',
                type: 'warning',
                title: 'Action Needed: Overdue Receivables',
                message: `You have overdue customer balances. Send automated payment reminders to accelerate collections.`,
                actionLabel: 'View Overdue Invoices',
                actionUrl: '/books/sales/invoices?tab=Overdue'
            });
        }
        if (overduePayables > 0) {
            announcements.push({
                id: 'overdue-pay',
                type: 'info',
                title: 'Upcoming Payables Due',
                message: `You have pending vendor bills due for settlement to maintain good supplier credit.`,
                actionLabel: 'Review Bills',
                actionUrl: '/books/purchases/bills'
            });
        }
        announcements.push({
            id: 'hrms-sync',
            type: 'success',
            title: 'Capyngen HRMS Payroll Integration Active',
            message: 'Employee payroll records and salary disbursements automatically sync with Books Chart of Accounts.',
            actionLabel: 'Check Chart of Accounts',
            actionUrl: '/books/accountant/chart-of-accounts'
        });
        announcements.push({
            id: 'multi-currency',
            type: 'info',
            title: 'Automated Multi-Currency Revaluation Ready',
            message: 'Track unrealized forex gains and losses dynamically based on live central exchange rates.',
            actionLabel: 'Currency Adjustments',
            actionUrl: '/books/accountant/currency-adjustments'
        });
        res.json({
            success: true,
            data: {
                totalReceivables,
                currentReceivables,
                overdueReceivables,
                pendingApprovalReceivables,
                pendingInvoicesCount,
                draftReceivables,
                draftInvoicesCount,
                totalPayables,
                currentPayables,
                overduePayables,
                pendingApprovalPayables,
                pendingBillsCount,
                draftPayables,
                draftBillsCount,
                totalIncome,
                totalExpense,
                netProfit: totalIncome - totalExpense,
                monthlyStats,
                expensesByCategory,
                cashFlow: {
                    inflow: totalCashInflow,
                    outflow: totalCashOutflow,
                    net: netCashFlow
                },
                bankAccountsSummary: bankAccounts.map((b) => ({
                    id: b._id,
                    name: b.accountName,
                    accountType: b.accountType || 'Bank',
                    accountNumber: b.accountNumber ? `••••${b.accountNumber.slice(-4)}` : 'Active Feed',
                    currency: b.currency || 'USD',
                    status: b.status || 'Active'
                })),
                recentActivity: recentActivity.slice(0, 10),
                setupProgress: {
                    completedCount: completedStepsCount,
                    totalCount: setupSteps.length,
                    percentage: Math.round((completedStepsCount / setupSteps.length) * 100),
                    steps: setupSteps
                },
                announcements,
                watchlist: watchlistedAccounts
            }
        });
    }
    catch (error) {
        console.error("Books Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDashboardData = getDashboardData;
const getInventoryDashboardData = async (req, res) => {
    try {
        const tenantFilter = (0, exports.buildTenantFilter)(req);
        const packagesColl = mongoose_1.default.connection.collection('packages');
        let [items, salesOrders, shipments, warehouses, transferOrders, packagesList] = await Promise.all([
            Item_1.default.find(tenantFilter).lean(),
            SalesOrder_1.default.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            Shipment_1.default.find(tenantFilter).lean(),
            Warehouse_1.default.find(tenantFilter).lean(),
            TransferOrder_1.default.find(tenantFilter).lean(),
            packagesColl.find(tenantFilter).toArray()
        ]);
        if (items.length === 0) {
            items = await mongoose_1.default.connection.collection('items').find(tenantFilter).toArray();
        }
        let totalQuantityOnHand = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        const lowStockItems = [];
        items.forEach((item) => {
            const stock = item.stockOnHand ?? item.quantityOnHand ?? 0;
            const reorder = item.reorderPoint ?? 10;
            totalQuantityOnHand += stock;
            if (stock === 0) {
                outOfStockCount++;
                lowStockCount++;
                lowStockItems.push({
                    id: item._id,
                    name: item.name,
                    sku: item.sku || '-',
                    stockOnHand: stock,
                    reorderPoint: reorder,
                    unit: item.unit || 'pcs'
                });
            }
            else if (stock <= reorder) {
                lowStockCount++;
                lowStockItems.push({
                    id: item._id,
                    name: item.name,
                    sku: item.sku || '-',
                    stockOnHand: stock,
                    reorderPoint: reorder,
                    unit: item.unit || 'pcs'
                });
            }
        });
        const pendingPackingOrders = salesOrders.filter((so) => (so.status === 'Open' || so.status === 'Confirmed' || so.status === 'Pending') &&
            so.fulfillmentStatus !== 'Fulfilled');
        let itemsToBePacked = 0;
        pendingPackingOrders.forEach((so) => {
            (so.items || []).forEach((it) => {
                const qty = it.quantity || 0;
                const fulfilled = it.quantityFulfilled || 0;
                itemsToBePacked += Math.max(0, qty - fulfilled);
            });
        });
        if (itemsToBePacked === 0 && pendingPackingOrders.length > 0) {
            itemsToBePacked = pendingPackingOrders.length;
        }
        const pendingShipments = shipments.filter((sh) => sh.status === 'Draft' || sh.status === 'Picked' || sh.status === 'Packed');
        const packedPackages = packagesList.filter((pkg) => pkg.status === 'Packed' || pkg.status === 'Draft');
        let itemsToBeShipped = 0;
        pendingShipments.forEach((sh) => {
            (sh.items || []).forEach((it) => {
                itemsToBeShipped += (it.quantity || 1);
            });
        });
        if (itemsToBeShipped === 0) {
            itemsToBeShipped = packedPackages.length > 0 ? packedPackages.length : pendingShipments.length;
        }
        const inTransitTransfers = transferOrders.filter((to) => to.status === 'In Transit').length;
        const orderSummary = {
            draft: salesOrders.filter((s) => s.status === 'Draft').length,
            confirmed: salesOrders.filter((s) => s.status === 'Open' || s.status === 'Confirmed').length,
            invoiced: salesOrders.filter((s) => s.status === 'Invoiced').length,
            closed: salesOrders.filter((s) => s.status === 'Closed').length,
            total: salesOrders.length
        };
        const recentOrders = salesOrders.slice(0, 5).map((so) => ({
            id: so._id,
            salesOrderNumber: so.salesOrderNumber,
            customerName: so.customer?.displayName || so.customer?.name || so.customer?.companyName || 'Valued Customer',
            date: so.salesOrderDate || so.createdAt,
            total: so.total || 0,
            status: so.status || 'Draft',
            fulfillmentStatus: so.fulfillmentStatus || 'Unfulfilled'
        }));
        res.json({
            success: true,
            data: {
                totalSkus: items.length,
                totalQuantityOnHand,
                lowStockCount,
                outOfStockCount,
                itemsToBePacked,
                pendingPackingOrdersCount: pendingPackingOrders.length,
                itemsToBeShipped,
                pendingShipmentsCount: pendingShipments.length,
                totalWarehouses: warehouses.length,
                inTransitTransfers,
                orderSummary,
                recentOrders,
                lowStockItems: lowStockItems.slice(0, 6)
            }
        });
    }
    catch (error) {
        console.error("Inventory Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getInventoryDashboardData = getInventoryDashboardData;
