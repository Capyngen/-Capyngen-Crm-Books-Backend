import { Request, Response } from 'express';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import { ChartOfAccount } from '../models/ChartOfAccount';
import Expense from '../models/Expense';
import Item from '../../inventory/models/Item';
import SalesOrder from '../../billing/models/SalesOrder';
import Shipment from '../../inventory/models/Shipment';
import Warehouse from '../../inventory/models/Warehouse';
import TransferOrder from '../../inventory/models/TransferOrder';
import Customer from '../../billing/models/Customer';
import Vendor from '../../inventory/models/Vendor';
import PaymentReceived from '../../billing/models/PaymentReceived';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        const tenantFilter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};

        const [
            invoices, 
            bills, 
            expenses, 
            items, 
            customers, 
            vendors, 
            paymentsReceived, 
            watchlistedAccounts,
            bankAccounts
        ] = await Promise.all([
            Invoice.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            Bill.find(tenantFilter).populate('vendorId', 'name displayName companyName vendorName').sort({ createdAt: -1 }).lean(),
            Expense.find(tenantFilter).sort({ createdAt: -1 }).lean(),
            Item.find(tenantFilter).lean(),
            Customer.find(tenantFilter).lean(),
            Vendor.find(tenantFilter).lean(),
            PaymentReceived.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            ChartOfAccount.find({ ...tenantFilter, addToWatchlist: true, status: 'Active' }).lean(),
            ChartOfAccount.find({ 
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
        const now = new Date();

        invoices.forEach((i: any) => {
            const bal = i.balanceDue || 0;
            const tot = i.total || 0;
            totalReceivables += bal;
            totalIncome += tot;

            if (bal > 0) {
                if (i.dueDate && new Date(i.dueDate) < now) {
                    overdueReceivables += bal;
                } else {
                    currentReceivables += bal;
                }
            }
        });
        
        let totalPayables = 0;
        let currentPayables = 0;
        let overduePayables = 0;

        bills.forEach((b: any) => {
            const tot = b.totalAmount || 0;
            if (b.status !== 'Paid') {
                totalPayables += tot;
                if (b.dueDate && new Date(b.dueDate) < now) {
                    overduePayables += tot;
                } else {
                    currentPayables += tot;
                }
            }
        });

        let totalExpense = 0;
        const expenseCategoryMap: Record<string, { amount: number; count: number }> = {};

        expenses.forEach((e: any) => {
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

            invoices.forEach((i: any) => {
                const d = new Date(i.invoiceDate || i.createdAt);
                if (d.getFullYear() === currentYear && d.getMonth() === index) {
                    monthIncome += (i.total || 0);
                }
            });

            expenses.forEach((e: any) => {
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
        const recentActivity: any[] = [];

        invoices.slice(0, 5).forEach((inv: any) => {
            recentActivity.push({
                id: inv._id,
                type: 'invoice',
                title: `Invoice ${inv.invoiceNumber}`,
                subtitle: (inv.customer as any)?.displayName || (inv.customer as any)?.name || 'Client',
                amount: inv.total || 0,
                status: inv.status || 'Draft',
                date: inv.invoiceDate || inv.createdAt,
                url: `/books/sales/invoices/${inv._id}`
            });
        });

        paymentsReceived.slice(0, 5).forEach((pmt: any) => {
            recentActivity.push({
                id: pmt._id,
                type: 'payment',
                title: `Payment ${pmt.paymentNumber || 'Receipt'}`,
                subtitle: (pmt.customer as any)?.displayName || (pmt.customer as any)?.name || 'Customer Payment',
                amount: pmt.amount || 0,
                status: pmt.status || 'Received',
                date: pmt.paymentDate || pmt.createdAt,
                url: `/books/sales/payments-received/${pmt._id}`
            });
        });

        bills.slice(0, 4).forEach((bill: any) => {
            recentActivity.push({
                id: bill._id,
                type: 'bill',
                title: `Bill ${bill.billNumber}`,
                subtitle: (bill.vendorId as any)?.name || (bill.vendorId as any)?.displayName || 'Vendor Bill',
                amount: bill.totalAmount || 0,
                status: bill.status || 'Open',
                date: bill.billDate || bill.createdAt,
                url: `/books/purchases/bills/${bill._id}`
            });
        });

        expenses.slice(0, 4).forEach((exp: any) => {
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
        paymentsReceived.forEach((p: any) => { totalCashInflow += (p.amount || 0); });
        if (totalCashInflow === 0) {
            invoices.forEach((i: any) => {
                if (i.status === 'Paid') totalCashInflow += (i.total || 0);
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
        const announcements: any[] = [];
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
                totalPayables,
                currentPayables,
                overduePayables,
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
                bankAccountsSummary: bankAccounts.map((b: any) => ({
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
    } catch (error) {
        console.error("Books Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getInventoryDashboardData = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        const tenantFilter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};

        const [items, salesOrders, shipments, warehouses, transferOrders] = await Promise.all([
            Item.find(tenantFilter).lean(),
            SalesOrder.find(tenantFilter).populate('customer', 'name displayName companyName').sort({ createdAt: -1 }).lean(),
            Shipment.find(tenantFilter).lean(),
            Warehouse.find(tenantFilter).lean(),
            TransferOrder.find(tenantFilter).lean()
        ]);

        let totalQuantityOnHand = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        const lowStockItems: any[] = [];

        items.forEach((item: any) => {
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
            } else if (stock <= reorder) {
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

        const pendingPackingOrders = salesOrders.filter((so: any) => 
            so.status === 'Open' || (so.fulfillmentStatus && so.fulfillmentStatus !== 'Fulfilled')
        );
        let itemsToBePacked = 0;
        pendingPackingOrders.forEach((so: any) => {
            (so.items || []).forEach((it: any) => {
                const qty = it.quantity || 0;
                const fulfilled = it.quantityFulfilled || 0;
                itemsToBePacked += Math.max(0, qty - fulfilled);
            });
        });
        if (itemsToBePacked === 0 && pendingPackingOrders.length > 0) {
            itemsToBePacked = pendingPackingOrders.length;
        }

        const pendingShipments = shipments.filter((sh: any) => 
            sh.status === 'Draft' || sh.status === 'Picked' || sh.status === 'Packed'
        );
        let itemsToBeShipped = 0;
        pendingShipments.forEach((sh: any) => {
            (sh.items || []).forEach((it: any) => {
                itemsToBeShipped += (it.quantity || 1);
            });
        });
        if (itemsToBeShipped === 0 && pendingShipments.length > 0) {
            itemsToBeShipped = pendingShipments.length;
        }

        const inTransitTransfers = transferOrders.filter((to: any) => to.status === 'In Transit').length;

        const orderSummary = {
            draft: salesOrders.filter((s: any) => s.status === 'Draft').length,
            confirmed: salesOrders.filter((s: any) => s.status === 'Open' || s.status === 'Confirmed').length,
            invoiced: salesOrders.filter((s: any) => s.status === 'Invoiced').length,
            closed: salesOrders.filter((s: any) => s.status === 'Closed').length,
            total: salesOrders.length
        };

        const recentOrders = salesOrders.slice(0, 5).map((so: any) => ({
            id: so._id,
            salesOrderNumber: so.salesOrderNumber,
            customerName: (so.customer as any)?.displayName || (so.customer as any)?.name || (so.customer as any)?.companyName || 'Valued Customer',
            date: so.salesOrderDate || (so as any).createdAt,
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
    } catch (error) {
        console.error("Inventory Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
