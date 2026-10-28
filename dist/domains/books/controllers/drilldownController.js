"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrilldown = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const Expense_1 = __importDefault(require("../models/Expense"));
const PaymentReceived_1 = __importDefault(require("../../billing/models/PaymentReceived"));
const PaymentMade_1 = __importDefault(require("../models/PaymentMade"));
const CreditNote_1 = __importDefault(require("../../billing/models/CreditNote"));
const VendorCredit_1 = __importDefault(require("../../inventory/models/VendorCredit"));
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
const TimeEntry_1 = __importDefault(require("../models/TimeEntry"));
const Project_1 = require("../models/Project");
const SalesOrder_1 = __importDefault(require("../../billing/models/SalesOrder"));
const Quote_1 = __importDefault(require("../../billing/models/Quote"));
const DeliveryChallan_1 = __importDefault(require("../../inventory/models/DeliveryChallan"));
const PurchaseOrder_1 = __importDefault(require("../../inventory/models/PurchaseOrder"));
const Vendor_1 = __importDefault(require("../../inventory/models/Vendor"));
const Customer_1 = __importDefault(require("../../billing/models/Customer"));
const reportsController_1 = require("./reportsController");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getDrilldown = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const { accountId, customerId, vendorId, itemId, itemName, projectId, type, date, salesperson, title, quoteNumber } = req.query;
        let results = [];
        const orgFilter = advancedReportsService_1.AdvancedReportsService.getOrgFilter(orgId);
        // Fetch customers and vendors in-memory for zero-crash resilient lookups
        const [customers, vendors] = await Promise.all([
            Customer_1.default.find(orgFilter).lean(),
            Vendor_1.default.find(orgFilter).lean()
        ]);
        const customerMap = new Map(customers.map((c) => [c._id.toString(), c]));
        const vendorMap = new Map(vendors.map((v) => [v._id.toString(), v]));
        const getCustomerName = (cust, custId) => {
            if (cust && typeof cust === 'object') {
                if (cust.displayName)
                    return cust.displayName;
                if (cust.name)
                    return cust.name;
                if (cust.companyName)
                    return cust.companyName;
            }
            const idStr = (custId?._id || custId || cust?._id || cust)?.toString();
            if (idStr && customerMap.has(idStr)) {
                const c = customerMap.get(idStr);
                return c.displayName || c.companyName || c.name;
            }
            return typeof cust === 'string' ? cust : 'Customer';
        };
        const getVendorName = (vend, vendId, defaultName) => {
            if (vend && typeof vend === 'object') {
                if (vend.displayName)
                    return vend.displayName;
                if (vend.vendorName)
                    return vend.vendorName;
                if (vend.companyName)
                    return vend.companyName;
            }
            const idStr = (vendId?._id || vendId || vend?._id || vend)?.toString();
            if (idStr && vendorMap.has(idStr)) {
                const v = vendorMap.get(idStr);
                return v.displayName || v.vendorName || v.companyName;
            }
            return defaultName || (typeof vend === 'string' ? vend : 'Vendor');
        };
        // 1. Customer Drilldown (Sales, Orders, Payments & Customer Balances)
        if (customerId) {
            const custObjId = mongoose_1.default.Types.ObjectId.isValid(String(customerId))
                ? new mongoose_1.default.Types.ObjectId(String(customerId))
                : null;
            const custConditions = [
                { customer: customerId },
                { customerId: customerId },
                { 'customer._id': customerId }
            ];
            if (custObjId) {
                custConditions.push({ customer: custObjId }, { customerId: custObjId }, { 'customer._id': custObjId });
            }
            const baseFilter = {
                $and: [
                    orgFilter,
                    { $or: custConditions },
                    { status: { $ne: 'Void' } }
                ]
            };
            const [invoices, payments, creditNotes, orders, challans, quotes] = await Promise.all([
                Invoice_1.default.find(baseFilter).lean(),
                PaymentReceived_1.default.find(baseFilter).lean(),
                CreditNote_1.default.find(baseFilter).lean(),
                SalesOrder_1.default.find(baseFilter).lean(),
                DeliveryChallan_1.default.find(baseFilter).lean(),
                Quote_1.default.find(baseFilter).lean()
            ]);
            const mappedInvoices = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: getCustomerName(inv.customer, inv.customerId),
                direction: 'inflow',
                amount: inv.total || inv.amount || 0
            }));
            const mappedPayments = payments.map((pmt) => ({
                _id: pmt._id,
                date: pmt.paymentDate || pmt.date || pmt.createdAt,
                transactionNumber: pmt.paymentNumber || 'PMT',
                sourceType: 'PaymentReceived',
                sourceId: pmt._id,
                partyName: getCustomerName(pmt.customer, pmt.customerId),
                direction: 'outflow',
                amount: -(pmt.amount || 0)
            }));
            const mappedCredits = creditNotes.map((cn) => ({
                _id: cn._id,
                date: cn.creditNoteDate || cn.date || cn.createdAt,
                transactionNumber: cn.creditNoteNumber || 'CN',
                sourceType: 'CreditNote',
                sourceId: cn._id,
                partyName: getCustomerName(cn.customer, cn.customerId),
                direction: 'outflow',
                amount: -(cn.total || cn.amount || 0)
            }));
            const mappedOrders = orders.map((so) => ({
                _id: so._id,
                date: so.date || so.orderDate || so.createdAt,
                transactionNumber: so.salesOrderNumber || 'SO',
                sourceType: 'SalesOrder',
                sourceId: so._id,
                partyName: getCustomerName(so.customer, so.customerId),
                direction: 'inflow',
                amount: so.totalAmount || so.amount || 0
            }));
            const mappedChallans = challans.map((dc) => ({
                _id: dc._id,
                date: dc.date || dc.shipDate || dc.createdAt,
                transactionNumber: dc.challanNumber || 'DC',
                sourceType: 'DeliveryChallan',
                sourceId: dc._id,
                partyName: getCustomerName(dc.customer, dc.customerId),
                direction: 'inflow',
                amount: dc.totalAmount || dc.amount || 0
            }));
            const mappedQuotes = quotes.map((q) => ({
                _id: q._id,
                date: q.quoteDate || q.date || q.createdAt,
                transactionNumber: q.quoteNumber || 'QUO',
                sourceType: 'Quote',
                sourceId: q._id,
                partyName: getCustomerName(q.customer, q.customerId),
                direction: 'inflow',
                amount: q.total || q.totalAmount || 0
            }));
            results = [...mappedInvoices, ...mappedPayments, ...mappedCredits, ...mappedOrders, ...mappedChallans, ...mappedQuotes];
        }
        // 2. Vendor Drilldown (Purchases, Bills, Vendor Credits & POs)
        else if (vendorId) {
            const vendObjId = mongoose_1.default.Types.ObjectId.isValid(String(vendorId))
                ? new mongoose_1.default.Types.ObjectId(String(vendorId))
                : null;
            const vendConditions = [
                { vendorId: vendorId },
                { vendor: vendorId },
                { 'vendorId._id': vendorId },
                { 'vendor._id': vendorId }
            ];
            if (vendObjId) {
                vendConditions.push({ vendorId: vendObjId }, { vendor: vendObjId }, { 'vendorId._id': vendObjId }, { 'vendor._id': vendObjId });
            }
            const baseFilter = {
                $and: [
                    orgFilter,
                    { $or: vendConditions },
                    { status: { $ne: 'Void' } }
                ]
            };
            const [bills, paymentsMade, vendorCredits, pos] = await Promise.all([
                Bill_1.default.find(baseFilter).lean(),
                PaymentMade_1.default.find(baseFilter).lean(),
                VendorCredit_1.default.find(baseFilter).lean(),
                PurchaseOrder_1.default.find(baseFilter).lean()
            ]);
            const mappedBills = bills.map((bill) => ({
                _id: bill._id,
                date: bill.billDate || bill.date || bill.createdAt,
                transactionNumber: bill.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: bill._id,
                partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                direction: 'outflow',
                amount: -(bill.totalAmount || bill.total || bill.amount || 0)
            }));
            const mappedPayments = paymentsMade.map((pmt) => ({
                _id: pmt._id,
                date: pmt.paymentDate || pmt.date || pmt.createdAt,
                transactionNumber: pmt.paymentNumber || 'PMT-OUT',
                sourceType: 'PaymentMade',
                sourceId: pmt._id,
                partyName: getVendorName(pmt.vendor, pmt.vendorId, pmt.vendorName),
                direction: 'inflow',
                amount: pmt.amount || 0
            }));
            const mappedCredits = vendorCredits.map((vc) => ({
                _id: vc._id,
                date: vc.creditDate || vc.date || vc.createdAt,
                transactionNumber: vc.vendorCreditNumber || vc.creditNoteNumber || 'VC',
                sourceType: 'VendorCredit',
                sourceId: vc._id,
                partyName: getVendorName(vc.vendor, vc.vendorId, vc.vendorName),
                direction: 'inflow',
                amount: vc.totalAmount || vc.amount || 0
            }));
            const mappedPOs = pos.map((po) => ({
                _id: po._id,
                date: po.orderDate || po.date || po.createdAt,
                transactionNumber: po.poNumber || po.orderNumber || 'PO',
                sourceType: 'PurchaseOrder',
                sourceId: po._id,
                partyName: getVendorName(po.vendor, po.vendorId, po.vendorName),
                direction: 'outflow',
                amount: -(po.totalAmount || po.total || 0)
            }));
            results = [...mappedBills, ...mappedPayments, ...mappedCredits, ...mappedPOs];
        }
        // 2b. Project Drilldown (Timesheets, Invoices & Project Expenses)
        else if (projectId) {
            const projObjId = mongoose_1.default.Types.ObjectId.isValid(String(projectId))
                ? new mongoose_1.default.Types.ObjectId(String(projectId))
                : null;
            const projConditions = [
                { projectId: projectId },
                { project: projectId }
            ];
            if (projObjId) {
                projConditions.push({ projectId: projObjId }, { project: projObjId });
            }
            const baseFilter = {
                $and: [
                    orgFilter,
                    { $or: projConditions },
                    { status: { $ne: 'Void' } }
                ]
            };
            const [projectDoc, timeEntries, invoices, bills, expenses] = await Promise.all([
                Project_1.BooksProject.findOne({ _id: projObjId || projectId }).lean(),
                TimeEntry_1.default.find(baseFilter).lean(),
                Invoice_1.default.find(baseFilter).lean(),
                Bill_1.default.find(baseFilter).lean(),
                Expense_1.default.find(baseFilter).lean()
            ]);
            const projHourlyRate = projectDoc?.ratePerHour || projectDoc?.hourlyRate || 1500;
            const mappedTime = timeEntries.map((te) => {
                const rate = te.billingRate || projHourlyRate || 1500;
                return {
                    _id: te._id,
                    date: te.date || te.createdAt,
                    transactionNumber: te.task || 'Time Log',
                    sourceType: 'TimeEntry',
                    sourceId: te._id,
                    partyName: `Time Log - ${te.hours || 0} hrs (${te.isBillable ? 'Billable' : 'Non-billable'}) @ ₹${rate.toLocaleString('en-IN')}/hr`,
                    direction: 'inflow',
                    amount: (te.hours || 0) * rate
                };
            });
            const mappedInvoices = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: getCustomerName(inv.customer, inv.customerId),
                direction: 'inflow',
                amount: inv.total || inv.amount || 0
            }));
            const mappedBills = bills.map((bill) => ({
                _id: bill._id,
                date: bill.billDate || bill.date || bill.createdAt,
                transactionNumber: bill.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: bill._id,
                partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                direction: 'outflow',
                amount: -(bill.totalAmount || bill.total || bill.amount || 0)
            }));
            const mappedExpenses = expenses.map((exp) => ({
                _id: exp._id,
                date: exp.date || exp.createdAt,
                transactionNumber: exp.reference || 'EXP',
                sourceType: 'Expense',
                sourceId: exp._id,
                partyName: getVendorName(exp.vendorId, null, exp.expenseAccount || exp.notes || 'Operating Expense'),
                direction: 'outflow',
                amount: -(exp.totalAmount || exp.amount || 0)
            }));
            results = [...mappedTime, ...mappedInvoices, ...mappedBills, ...mappedExpenses];
        }
        // 3. Item Drilldown (Item Sales, Purchases & Profitability)
        else if (itemId || itemName) {
            const itemIdStr = itemId ? String(itemId) : '';
            const itemObjId = (itemIdStr && mongoose_1.default.Types.ObjectId.isValid(itemIdStr))
                ? new mongoose_1.default.Types.ObjectId(itemIdStr)
                : null;
            const rawName = itemName || (title ? title.replace(/^Purchases for Purchases from\s*/i, '').replace(/^Purchases for\s*/i, '').replace(/^PO for\s*/i, '').trim() : '');
            const cleanName = rawName.replace(/^Purchases from\s*/i, '').replace(/^PO\s*/i, '').replace(/\s*Items$/i, '').trim();
            const itemConditions = [];
            if (itemIdStr) {
                itemConditions.push({ 'items.item': itemIdStr }, { 'items.itemId': itemIdStr }, { 'items.name': itemIdStr }, { 'lineItems.itemId': itemIdStr }, { 'lineItems.productId': itemIdStr }, { 'lineItems.name': itemIdStr }, { 'lineItems.product': itemIdStr });
            }
            if (itemObjId) {
                itemConditions.push({ _id: itemObjId }, { purchaseOrderId: itemObjId }, { 'items.item': itemObjId }, { 'items.itemId': itemObjId }, { 'lineItems.itemId': itemObjId }, { 'lineItems.productId': itemObjId });
            }
            if (cleanName) {
                itemConditions.push({ 'items.name': cleanName }, { 'lineItems.name': cleanName }, { 'lineItems.product': cleanName }, { vendorName: cleanName }, { poNumber: cleanName }, { orderNumber: cleanName });
            }
            const baseFilter = {
                $and: [
                    orgFilter,
                    { $or: itemConditions },
                    { status: { $ne: 'Void' } }
                ]
            };
            const [invoices, bills, pos] = await Promise.all([
                Invoice_1.default.find(baseFilter).lean(),
                Bill_1.default.find(baseFilter).lean(),
                PurchaseOrder_1.default.find(baseFilter).lean()
            ]);
            // Cross-link: If POs were found, also include bills linked to those POs
            let linkedBills = [];
            if (pos.length > 0) {
                const poIds = pos.map((p) => p._id);
                const poNumbers = pos.map((p) => p.poNumber || p.orderNumber).filter(Boolean);
                const existingBillIds = new Set(bills.map((b) => b._id.toString()));
                linkedBills = await Bill_1.default.find({
                    $and: [
                        orgFilter,
                        {
                            $or: [
                                { purchaseOrderId: { $in: poIds } },
                                { orderNumber: { $in: poNumbers } }
                            ]
                        },
                        { status: { $ne: 'Void' } }
                    ]
                }).lean();
                linkedBills = linkedBills.filter((b) => !existingBillIds.has(b._id.toString()));
            }
            const allBills = [...bills, ...linkedBills];
            const mappedInvoices = invoices.map((inv) => {
                const allItems = [...(inv.items || []), ...(inv.lineItems || [])];
                const itemLine = allItems.find((it) => (itemIdStr && String(it.item || it.itemId || it.productId || it._id) === itemIdStr) ||
                    (itemIdStr && String(it.name || it.itemName || it.product) === itemIdStr) ||
                    (cleanName && String(it.name || it.itemName || it.product).toLowerCase() === cleanName.toLowerCase()));
                const lineTotal = itemLine ? (itemLine.amount || (itemLine.quantity * itemLine.rate) || (itemLine.qty * itemLine.unitPrice)) : (inv.total || inv.amount);
                return {
                    _id: inv._id,
                    date: inv.invoiceDate || inv.date || inv.createdAt,
                    transactionNumber: inv.invoiceNumber || 'INV',
                    sourceType: 'Invoice',
                    sourceId: inv._id,
                    partyName: getCustomerName(inv.customer, inv.customerId),
                    direction: 'inflow',
                    amount: lineTotal || 0
                };
            });
            const mappedBills = allBills.map((bill) => {
                const allItems = [...(bill.items || []), ...(bill.lineItems || [])];
                const itemLine = allItems.find((it) => (itemIdStr && String(it.item || it.itemId || it.productId || it._id) === itemIdStr) ||
                    (itemIdStr && String(it.name || it.itemName || it.itemDetails) === itemIdStr) ||
                    (cleanName && String(it.name || it.itemName || it.itemDetails).toLowerCase() === cleanName.toLowerCase()));
                const lineTotal = itemLine ? (itemLine.amount || (itemLine.quantity * itemLine.rate)) : (bill.totalAmount || bill.total);
                return {
                    _id: bill._id,
                    date: bill.billDate || bill.date || bill.createdAt,
                    transactionNumber: bill.billNumber || 'BILL',
                    sourceType: 'Bill',
                    sourceId: bill._id,
                    partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                    direction: 'outflow',
                    amount: -(lineTotal || 0)
                };
            });
            const mappedPOs = pos.map((po) => {
                const allItems = [...(po.items || []), ...(po.lineItems || [])];
                const itemLine = allItems.find((it) => (itemIdStr && String(it.item || it.itemId || it.productId || it._id) === itemIdStr) ||
                    (itemIdStr && String(it.name || it.itemName || it.itemDetails) === itemIdStr) ||
                    (cleanName && String(it.name || it.itemName || it.itemDetails).toLowerCase() === cleanName.toLowerCase()));
                const lineTotal = itemLine ? (itemLine.amount || (itemLine.quantity * itemLine.rate)) : (po.totalAmount || po.total);
                return {
                    _id: po._id,
                    date: po.orderDate || po.date || po.createdAt,
                    transactionNumber: po.poNumber || po.orderNumber || 'PO',
                    sourceType: 'PurchaseOrder',
                    sourceId: po._id,
                    partyName: getVendorName(po.vendor, po.vendorId, po.vendorName),
                    direction: 'outflow',
                    amount: -(lineTotal || 0)
                };
            });
            results = [...mappedInvoices, ...mappedBills, ...mappedPOs];
        }
        // 4. Date Drilldown (Sales & Purchases for a specific date)
        else if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));
            const dateRange = { $gte: startOfDay, $lte: endOfDay };
            const baseFilter = {
                $and: [
                    orgFilter,
                    {
                        $or: [
                            { invoiceDate: dateRange },
                            { date: dateRange },
                            { createdAt: dateRange },
                            { invoiceDate: date },
                            { date: date }
                        ]
                    },
                    { status: { $ne: 'Void' } }
                ]
            };
            const [invoices, creditNotes, bills] = await Promise.all([
                Invoice_1.default.find(baseFilter).lean(),
                CreditNote_1.default.find(baseFilter).lean(),
                Bill_1.default.find(baseFilter).lean()
            ]);
            const mappedInvoices = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: getCustomerName(inv.customer, inv.customerId),
                direction: 'inflow',
                amount: inv.total || inv.amount || 0
            }));
            const mappedCredits = creditNotes.map((cn) => ({
                _id: cn._id,
                date: cn.creditNoteDate || cn.date || cn.createdAt,
                transactionNumber: cn.creditNoteNumber || 'CN',
                sourceType: 'CreditNote',
                sourceId: cn._id,
                partyName: getCustomerName(cn.customer, cn.customerId),
                direction: 'outflow',
                amount: -(cn.total || cn.amount || 0)
            }));
            const mappedBills = bills.map((b) => ({
                _id: b._id,
                date: b.billDate || b.date || b.createdAt,
                transactionNumber: b.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: b._id,
                partyName: getVendorName(b.vendor, b.vendorId, b.vendorName),
                direction: 'outflow',
                amount: -(b.totalAmount || b.total || 0)
            }));
            results = [...mappedInvoices, ...mappedCredits, ...mappedBills];
        }
        // 5. Expense Drilldown
        else if (type === 'expense' || req.query.expenseId) {
            const baseFilter = {
                $and: [
                    orgFilter,
                    { status: { $ne: 'Void' } }
                ]
            };
            const expenses = await Expense_1.default.find(baseFilter).lean();
            results = expenses.map((exp) => ({
                _id: exp._id,
                date: exp.date || exp.createdAt,
                transactionNumber: exp.reference || exp.expenseNumber || 'EXP',
                sourceType: 'Expense',
                sourceId: exp._id,
                partyName: getVendorName(exp.vendorId, null, exp.expenseAccount || exp.category || 'Operating Expense'),
                direction: 'outflow',
                amount: -(exp.totalAmount || exp.amount || 0)
            }));
        }
        // 6. Salesperson Drilldown
        else if (salesperson || (title && title.toLowerCase().includes('sales by'))) {
            const spName = salesperson || (title.replace(/Sales by/i, '').trim());
            const query = {
                $and: [
                    orgFilter,
                    { status: { $nin: ['Draft', 'Void'] } }
                ]
            };
            if (spName && spName !== 'Direct Sales') {
                query.$and.push({ salesperson: spName });
            }
            const invoices = await Invoice_1.default.find(query).lean();
            results = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: getCustomerName(inv.customer, inv.customerId),
                direction: 'inflow',
                amount: inv.total || inv.amount || 0
            }));
        }
        // 7. Budget Drilldown (Expenses and Procurement Bills making up budget spend)
        else if (type === 'budget' || req.query.budgetId) {
            const expFilter = {
                $and: [
                    orgFilter,
                    { status: { $ne: 'Void' } }
                ]
            };
            const billFilter = {
                $and: [
                    orgFilter,
                    { status: { $nin: ['Draft', 'Void'] } }
                ]
            };
            const [expenses, bills] = await Promise.all([
                Expense_1.default.find(expFilter).lean(),
                Bill_1.default.find(billFilter).lean()
            ]);
            const mappedExpenses = expenses.map((exp) => ({
                _id: exp._id,
                date: exp.date || exp.createdAt,
                transactionNumber: exp.reference || exp.expenseNumber || 'EXP',
                sourceType: 'Expense',
                sourceId: exp._id,
                partyName: exp.expenseAccount || exp.category || getVendorName(exp.vendorId, null, 'Operating Expense'),
                direction: 'outflow',
                amount: -(exp.totalAmount || exp.amount || 0)
            }));
            const mappedBills = bills.map((bill) => ({
                _id: bill._id,
                date: bill.billDate || bill.date || bill.createdAt,
                transactionNumber: bill.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: bill._id,
                partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                direction: 'outflow',
                amount: -(bill.totalAmount || bill.total || 0)
            }));
            results = [...mappedExpenses, ...mappedBills];
        }
        // 8. Quote Drilldown
        else if (quoteNumber || (title && title.toLowerCase().startsWith('quote'))) {
            const qNum = quoteNumber || title.replace(/^Quote\s*/i, '').trim();
            const quoteQuery = {
                $and: [
                    orgFilter,
                    { status: { $ne: 'Void' } }
                ]
            };
            if (qNum) {
                quoteQuery.$and.push({ quoteNumber: qNum });
            }
            const quotes = await Quote_1.default.find(quoteQuery).lean();
            results = quotes.map((q) => ({
                _id: q._id,
                date: q.quoteDate || q.date || q.createdAt,
                transactionNumber: q.quoteNumber || 'QUO',
                sourceType: 'Quote',
                sourceId: q._id,
                partyName: getCustomerName(q.customer, q.customerId),
                direction: 'inflow',
                amount: q.total || q.totalAmount || 0
            }));
        }
        // 9. Account Drilldown (Balance Sheet, P&L, Trial Balance, Ledger)
        else if (accountId) {
            const accStr = String(accountId).toLowerCase();
            // Check if LedgerEntry has postings for this account
            const ledgerEntries = await LedgerEntry_1.default.find({
                $and: [
                    orgFilter,
                    { status: 'Posted', 'lines.accountId': accountId }
                ]
            }).lean();
            if (ledgerEntries.length > 0) {
                results = ledgerEntries.map((le) => {
                    const line = (le.lines || []).find((l) => String(l.accountId) === String(accountId));
                    const debit = line?.debit || 0;
                    const credit = line?.credit || 0;
                    const isDebit = debit > 0;
                    return {
                        _id: le._id,
                        date: le.date,
                        transactionNumber: le.transactionId || 'ENTRY',
                        sourceType: le.transactionType || 'Journal',
                        sourceId: le.transactionId,
                        partyName: line?.description || le.transactionType || 'General Ledger',
                        direction: isDebit ? 'inflow' : 'outflow',
                        amount: isDebit ? debit : -credit
                    };
                });
            }
            // Dynamic sub-ledger breakdown if no direct ledger lines
            if (results.length === 0) {
                // A. Cash and Cash Equivalents / Bank accounts
                if (accStr.includes('cash') || accStr.includes('bank') || accStr === 'asset-cash-bank') {
                    const pmtInFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
                    const pmtOutFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
                    const expFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
                    const [paymentsIn, paymentsOut, cashExpenses] = await Promise.all([
                        PaymentReceived_1.default.find(pmtInFilter).lean(),
                        PaymentMade_1.default.find(pmtOutFilter).lean(),
                        Expense_1.default.find(expFilter).lean()
                    ]);
                    const mappedIn = paymentsIn.map((p) => ({
                        _id: p._id,
                        date: p.paymentDate || p.date || p.createdAt,
                        transactionNumber: p.paymentNumber || 'PMT-IN',
                        sourceType: 'PaymentReceived',
                        sourceId: p._id,
                        partyName: getCustomerName(p.customer, p.customerId),
                        direction: 'inflow',
                        amount: p.amount || 0
                    }));
                    const mappedOut = paymentsOut.map((p) => ({
                        _id: p._id,
                        date: p.paymentDate || p.date || p.createdAt,
                        transactionNumber: p.paymentNumber || 'PMT-OUT',
                        sourceType: 'PaymentMade',
                        sourceId: p._id,
                        partyName: getVendorName(p.vendor, p.vendorId, p.vendorName),
                        direction: 'outflow',
                        amount: -(p.amount || 0)
                    }));
                    const mappedExp = cashExpenses.map((exp) => ({
                        _id: exp._id,
                        date: exp.date || exp.createdAt,
                        transactionNumber: exp.reference || 'EXP',
                        sourceType: 'Expense',
                        sourceId: exp._id,
                        partyName: getVendorName(exp.vendorId, null, exp.expenseAccount || 'Operating Expense'),
                        direction: 'outflow',
                        amount: -(exp.totalAmount || exp.amount || 0)
                    }));
                    results = [...mappedIn, ...mappedOut, ...mappedExp];
                }
                // B. Accounts Receivable
                else if (accStr.includes('receivable') || accStr === 'asset-accounts-receivable') {
                    const invFilter = { $and: [orgFilter, { status: { $nin: ['Draft', 'Void'] } }] };
                    const invoices = await Invoice_1.default.find(invFilter).lean();
                    results = invoices.map((inv) => ({
                        _id: inv._id,
                        date: inv.invoiceDate || inv.date || inv.createdAt,
                        transactionNumber: inv.invoiceNumber,
                        sourceType: 'Invoice',
                        sourceId: inv._id,
                        partyName: getCustomerName(inv.customer, inv.customerId),
                        direction: 'inflow',
                        amount: inv.balanceDue !== undefined ? inv.balanceDue : (inv.total || 0)
                    }));
                }
                // C. Accounts Payable
                else if (accStr.includes('payable') || accStr === 'liability-accounts-payable') {
                    const billFilter = { $and: [orgFilter, { status: { $nin: ['Draft', 'Void'] } }] };
                    const bills = await Bill_1.default.find(billFilter).lean();
                    results = bills.map((bill) => ({
                        _id: bill._id,
                        date: bill.billDate || bill.date || bill.createdAt,
                        transactionNumber: bill.billNumber,
                        sourceType: 'Bill',
                        sourceId: bill._id,
                        partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                        direction: 'outflow',
                        amount: -(bill.balanceDue !== undefined ? bill.balanceDue : (bill.totalAmount || bill.total || 0))
                    }));
                }
                // D. Sales / Revenue / Operating Income
                else if (accStr.includes('sales') || accStr.includes('income') || accStr.includes('revenue') || accStr === 'income-sales') {
                    const invFilter = { $and: [orgFilter, { status: { $nin: ['Draft', 'Void'] } }] };
                    const cnFilter = { $and: [orgFilter, { status: { $nin: ['Draft', 'Void'] } }] };
                    const [invoices, creditNotes] = await Promise.all([
                        Invoice_1.default.find(invFilter).lean(),
                        CreditNote_1.default.find(cnFilter).lean()
                    ]);
                    const mappedInvoices = invoices.map((inv) => ({
                        _id: inv._id,
                        date: inv.invoiceDate || inv.date || inv.createdAt,
                        transactionNumber: inv.invoiceNumber,
                        sourceType: 'Invoice',
                        sourceId: inv._id,
                        partyName: getCustomerName(inv.customer, inv.customerId),
                        direction: 'inflow',
                        amount: inv.total || inv.amount || 0
                    }));
                    const mappedCredits = creditNotes.map((cn) => ({
                        _id: cn._id,
                        date: cn.creditNoteDate || cn.date || cn.createdAt,
                        transactionNumber: cn.creditNoteNumber || 'CN',
                        sourceType: 'CreditNote',
                        sourceId: cn._id,
                        partyName: getCustomerName(cn.customer, cn.customerId),
                        direction: 'outflow',
                        amount: -(cn.total || 0)
                    }));
                    results = [...mappedInvoices, ...mappedCredits];
                }
                // E. Inventory Asset / COGS / Purchases
                else if (accStr.includes('cogs') || accStr.includes('purchase') || accStr.includes('inventory') || accStr === 'cogs-inventory' || accStr === 'asset-inventory') {
                    const billFilter = { $and: [orgFilter, { status: { $nin: ['Draft', 'Void'] } }] };
                    const bills = await Bill_1.default.find(billFilter).lean();
                    results = bills.map((bill) => ({
                        _id: bill._id,
                        date: bill.billDate || bill.date || bill.createdAt,
                        transactionNumber: bill.billNumber,
                        sourceType: 'Bill',
                        sourceId: bill._id,
                        partyName: getVendorName(bill.vendor, bill.vendorId, bill.vendorName),
                        direction: accStr === 'asset-inventory' ? 'inflow' : 'outflow',
                        amount: accStr === 'asset-inventory' ? (bill.totalAmount || bill.total || 0) : -(bill.totalAmount || bill.total || 0)
                    }));
                }
                // F. Operating Expenses
                else {
                    const expFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
                    const expenses = await Expense_1.default.find(expFilter).lean();
                    results = expenses.map((exp) => ({
                        _id: exp._id,
                        date: exp.date || exp.createdAt,
                        transactionNumber: exp.reference || 'EXP',
                        sourceType: 'Expense',
                        sourceId: exp._id,
                        partyName: getVendorName(exp.vendorId, null, exp.expenseAccount || exp.notes || 'Operating Expense'),
                        direction: 'outflow',
                        amount: -(exp.totalAmount || exp.amount || 0)
                    }));
                }
            }
        }
        // 10. Fallback: If title was provided (e.g. from general report click)
        else if (title) {
            const invFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
            const billFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
            const expFilter = { $and: [orgFilter, { status: { $ne: 'Void' } }] };
            const [invoices, bills, expenses] = await Promise.all([
                Invoice_1.default.find(invFilter).lean(),
                Bill_1.default.find(billFilter).lean(),
                Expense_1.default.find(expFilter).lean()
            ]);
            const mappedInvoices = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: getCustomerName(inv.customer, inv.customerId),
                direction: 'inflow',
                amount: inv.total || inv.amount || 0
            }));
            const mappedBills = bills.map((b) => ({
                _id: b._id,
                date: b.billDate || b.date || b.createdAt,
                transactionNumber: b.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: b._id,
                partyName: getVendorName(b.vendor, b.vendorId, b.vendorName),
                direction: 'outflow',
                amount: -(b.totalAmount || b.total || 0)
            }));
            const mappedExpenses = expenses.map((e) => ({
                _id: e._id,
                date: e.date || e.createdAt,
                transactionNumber: e.reference || 'EXP',
                sourceType: 'Expense',
                sourceId: e._id,
                partyName: getVendorName(e.vendorId, null, e.expenseAccount || 'Operating Expense'),
                direction: 'outflow',
                amount: -(e.totalAmount || e.amount || 0)
            }));
            results = [...mappedInvoices, ...mappedBills, ...mappedExpenses];
        }
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        next(error);
    }
};
exports.getDrilldown = getDrilldown;
