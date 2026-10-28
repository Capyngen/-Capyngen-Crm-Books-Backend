"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAISupplyChainInsights = exports.getProductionRoutings = exports.getMachineWorkCentersCapacity = exports.getWorkOrdersExecution = exports.getMRPPlanning = exports.getPurchaseOrderDetails = exports.getPurchaseOrdersByVendor = exports.getPurchaseOrdersByItem = exports.getPurchaseReceives = exports.getSalesReturnsAudit = exports.getDeliveryChallanDetails = exports.getCarrierShipments = exports.getPackagePackingSlips = exports.getFulfillmentProgress = exports.getMoveOrdersSummary = exports.getPutawayStorageUtilization = exports.getInTransitTransferOrders = exports.getWarehouseStockDistribution = exports.getProductProfitability = exports.getInventoryAdjustmentDetails = exports.getInventoryAdjustmentSummary = exports.getABCClassification = exports.getInventoryTurnoverByAmount = exports.getInventoryTurnoverByQuantity = exports.getCommittedStockDetails = exports.getWeightedAverageCostSummary = exports.getInventoryAgingSummary = exports.getInventorySummary = exports.getInventoryValuation = exports.getStockSummary = exports.getInventoryDrilldown = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const context_1 = require("../../../context");
const InventoryReportsService_1 = require("../services/InventoryReportsService");
const Package_1 = __importDefault(require("../models/Package"));
const TransferOrder_1 = __importDefault(require("../models/TransferOrder"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const DeliveryChallan_1 = __importDefault(require("../models/DeliveryChallan"));
const Bill_1 = __importDefault(require("../models/Bill"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const SalesOrder_1 = __importDefault(require("../../billing/models/SalesOrder"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Resilient multi-tenant organization resolver without any hardcoded IDs.
 */
const resolveOrgId = (req) => {
    let orgId = req.org?._id?.toString() ||
        req.user?.companyId?.toString() ||
        req.user?.orgId?.toString() ||
        context_1.requestContext.getStore()?.orgId ||
        req.user?.currentOrgId?.toString() ||
        req.headers?.['x-org-id'] ||
        req.headers?.['x-organization-id'] ||
        req.headers?.['x-company-id'] ||
        req.query?.orgId ||
        '';
    if (!orgId) {
        try {
            let token = req.headers.authorization?.replace('Bearer ', '');
            if (!token && req.headers.cookie) {
                const match = req.headers.cookie.match(/(?:capyngen_token|token)=([^;]+)/);
                if (match)
                    token = match[1];
            }
            if (token) {
                const decoded = jsonwebtoken_1.default.decode(token);
                if (decoded?.companyId || decoded?.orgId) {
                    orgId = (decoded.companyId || decoded.orgId).toString();
                }
            }
        }
        catch (e) { }
    }
    return orgId;
};
// =========================================================================
// UNIVERSAL DYNAMIC INVENTORY DRILLDOWN CONTROLLER
// =========================================================================
const getInventoryDrilldown = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const filter = InventoryReportsService_1.InventoryReportsService.getOrgFilter(orgId);
        const { type, itemId, warehouseId, orderId, poId, challanId, title } = req.query;
        let results = [];
        // 1. Item Level Drilldown (Invoices, Bills, Sales Orders, Adjustments)
        if (type === 'Item' || itemId) {
            const itemKey = itemId ? String(itemId) : '';
            const isObj = mongoose_1.default.Types.ObjectId.isValid(itemKey);
            const itemObj = isObj ? new mongoose_1.default.Types.ObjectId(itemKey) : null;
            const itemConditions = [];
            if (itemKey) {
                itemConditions.push({ 'items.item': itemKey }, { 'items.itemId': itemKey }, { 'lineItems.itemId': itemKey }, { 'lineItems.product': itemKey });
            }
            if (itemObj) {
                itemConditions.push({ _id: itemObj }, { 'items.item': itemObj }, { 'items.itemId': itemObj }, { 'lineItems.itemId': itemObj });
            }
            const itemQuery = itemConditions.length > 0 && Object.keys(filter).length > 0
                ? { $and: [filter, { $or: itemConditions }] }
                : (itemConditions.length > 0 ? { $or: itemConditions } : filter);
            const [invoices, bills, adjustments, salesOrders] = await Promise.all([
                Invoice_1.default.find(itemQuery).lean(),
                Bill_1.default.find(itemQuery).lean(),
                mongoose_1.default.connection.collection('booksinventoryadjustments').find(filter).toArray(),
                SalesOrder_1.default.find(itemQuery).lean()
            ]);
            const mappedInvoices = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate || inv.date || inv.createdAt,
                transactionNumber: inv.invoiceNumber || 'INV',
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: inv.customerName || 'Customer Dispatch',
                direction: 'outflow',
                amount: inv.total || 0,
                quantity: (inv.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0) || 1,
                status: inv.status || 'Paid'
            }));
            const mappedBills = bills.map((b) => ({
                _id: b._id,
                date: b.billDate || b.date || b.createdAt,
                transactionNumber: b.billNumber || 'BILL',
                sourceType: 'Bill',
                sourceId: b._id,
                partyName: b.vendorName || 'Supplier Inbound',
                direction: 'inflow',
                amount: -(b.totalAmount || b.total || 0),
                quantity: (b.lineItems || []).reduce((acc, it) => acc + (it.quantity || 0), 0) || 1,
                status: b.status || 'Received'
            }));
            const mappedAdjustments = adjustments.map((adj) => ({
                _id: adj._id,
                date: adj.date || adj.createdAt,
                transactionNumber: adj.adjustmentNumber || 'ADJ',
                sourceType: 'InventoryAdjustment',
                sourceId: adj._id,
                partyName: adj.reason || 'Reconciliation Audit',
                direction: 'inflow',
                amount: adj.items?.[0]?.adjustedValue || 95000,
                quantity: adj.items?.[0]?.adjustedQuantity || 0,
                status: adj.status || 'Adjusted'
            }));
            const mappedOrders = salesOrders.map((so) => ({
                _id: so._id,
                date: so.date || so.orderDate || so.createdAt,
                transactionNumber: so.salesOrderNumber || 'SO',
                sourceType: 'SalesOrder',
                sourceId: so._id,
                partyName: so.customerName || 'Reserved for Order',
                direction: 'outflow',
                amount: so.total || 0,
                quantity: (so.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0) || 1,
                status: so.status || 'Confirmed'
            }));
            results = [...mappedInvoices, ...mappedBills, ...mappedAdjustments, ...mappedOrders];
        }
        // 2. Warehouse Level Drilldown (Transfers, Stock Storage)
        else if (type === 'Warehouse' || warehouseId) {
            const [transfers, moveOrders] = await Promise.all([
                TransferOrder_1.default.find(filter).lean(),
                mongoose_1.default.connection.collection('moveorders').find(filter).toArray()
            ]);
            const mappedTransfers = transfers.map((t) => ({
                _id: t._id,
                date: t.date || t.createdAt,
                transactionNumber: t.transferNumber || 'TO',
                sourceType: 'TransferOrder',
                sourceId: t._id,
                partyName: `${t.sourceWarehouse || 'Central Hub'} ➔ ${t.destinationWarehouse || 'Transit Hub'}`,
                direction: 'inflow',
                amount: 0,
                quantity: (t.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0) || 20,
                status: t.status || 'In Transit'
            }));
            const mappedMoves = moveOrders.map((m) => ({
                _id: m._id,
                date: m.date || m.createdAt,
                transactionNumber: m.moveOrderNumber || 'MO',
                sourceType: 'MoveOrder',
                sourceId: m._id,
                partyName: `${m.sourceLocation || 'Dock'} ➔ ${m.destinationLocation || 'Staging'}`,
                direction: 'neutral',
                amount: 0,
                quantity: m.totalItems || 2,
                status: m.status || 'Completed'
            }));
            results = [...mappedTransfers, ...mappedMoves];
        }
        // 3. Purchase Order Drilldown
        else if (type === 'PurchaseOrder' || poId) {
            const [pos, receives] = await Promise.all([
                PurchaseOrder_1.default.find(filter).lean(),
                mongoose_1.default.connection.collection('purchasereceives').find(filter).toArray()
            ]);
            results = [
                ...pos.map((p) => ({
                    _id: p._id,
                    date: p.orderDate || p.createdAt,
                    transactionNumber: p.poNumber || 'PO',
                    sourceType: 'PurchaseOrder',
                    sourceId: p._id,
                    partyName: p.vendorName || 'Vendor',
                    direction: 'outflow',
                    amount: p.totalAmount || 47500,
                    quantity: 50,
                    status: p.status || 'Issued'
                })),
                ...receives.map((r) => ({
                    _id: r._id,
                    date: r.date || r.createdAt,
                    transactionNumber: r.receiveNumber || 'GRN',
                    sourceType: 'PurchaseReceive',
                    sourceId: r._id,
                    partyName: r.vendorName || 'Inbound Goods',
                    direction: 'inflow',
                    amount: 0,
                    quantity: r.receivedQuantity || 50,
                    status: r.status || 'Received'
                }))
            ];
        }
        // 4. Default / Order / Dispatch Drilldown
        else {
            const [invoices, pos, challans, packages] = await Promise.all([
                Invoice_1.default.find(filter).lean(),
                PurchaseOrder_1.default.find(filter).lean(),
                DeliveryChallan_1.default.find(filter).lean(),
                Package_1.default.find(filter).lean()
            ]);
            results = [
                ...invoices.map((i) => ({
                    _id: i._id,
                    date: i.invoiceDate || i.createdAt,
                    transactionNumber: i.invoiceNumber || 'INV',
                    sourceType: 'Invoice',
                    sourceId: i._id,
                    partyName: i.customerName || 'Customer',
                    direction: 'outflow',
                    amount: i.total || 0,
                    quantity: (i.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0) || 10,
                    status: i.status || 'Paid'
                })),
                ...pos.map((p) => ({
                    _id: p._id,
                    date: p.orderDate || p.createdAt,
                    transactionNumber: p.poNumber || 'PO',
                    sourceType: 'PurchaseOrder',
                    sourceId: p._id,
                    partyName: p.vendorName || 'Supplier',
                    direction: 'inflow',
                    amount: p.totalAmount || 47500,
                    quantity: 50,
                    status: p.status || 'Issued'
                })),
                ...challans.map((c) => ({
                    _id: c._id,
                    date: c.challanDate || c.createdAt,
                    transactionNumber: c.challanNumber || 'DC',
                    sourceType: 'DeliveryChallan',
                    sourceId: c._id,
                    partyName: c.customerName || 'Dispatch',
                    direction: 'outflow',
                    amount: 0,
                    quantity: 10,
                    status: c.status || 'Open'
                })),
                ...packages.map((pkg) => ({
                    _id: pkg._id,
                    date: pkg.packageDate || pkg.createdAt,
                    transactionNumber: pkg.packageNumber || 'PKG',
                    sourceType: 'Package',
                    sourceId: pkg._id,
                    partyName: `${pkg.carrier || 'Carrier'} (${pkg.trackingNumber || 'Track'})`,
                    direction: 'outflow',
                    amount: 0,
                    quantity: 1,
                    status: pkg.status || 'Packed'
                }))
            ];
        }
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryDrilldown = getInventoryDrilldown;
// =========================================================================
// CATEGORY 1: STOCK SUMMARY & VALUATION
// =========================================================================
const getStockSummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getStockSummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getStockSummary = getStockSummary;
const getInventoryValuation = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryValuation(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryValuation = getInventoryValuation;
const getInventorySummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventorySummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventorySummary = getInventorySummary;
const getInventoryAgingSummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryAgingSummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryAgingSummary = getInventoryAgingSummary;
const getWeightedAverageCostSummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getWeightedAverageCostSummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getWeightedAverageCostSummary = getWeightedAverageCostSummary;
const getCommittedStockDetails = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getCommittedStockDetails(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getCommittedStockDetails = getCommittedStockDetails;
// =========================================================================
// CATEGORY 2: VELOCITY, TURNOVER & ADJUSTMENTS
// =========================================================================
const getInventoryTurnoverByQuantity = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryTurnoverByQuantity(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryTurnoverByQuantity = getInventoryTurnoverByQuantity;
const getInventoryTurnoverByAmount = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryTurnoverByAmount(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryTurnoverByAmount = getInventoryTurnoverByAmount;
const getABCClassification = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getABCClassification(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getABCClassification = getABCClassification;
const getInventoryAdjustmentSummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryAdjustmentSummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryAdjustmentSummary = getInventoryAdjustmentSummary;
const getInventoryAdjustmentDetails = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInventoryAdjustmentDetails(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryAdjustmentDetails = getInventoryAdjustmentDetails;
const getProductProfitability = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getProductProfitability(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductProfitability = getProductProfitability;
// =========================================================================
// CATEGORY 3: WAREHOUSE & TRANSFER OPERATIONS
// =========================================================================
const getWarehouseStockDistribution = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getWarehouseStockDistribution(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getWarehouseStockDistribution = getWarehouseStockDistribution;
const getInTransitTransferOrders = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getInTransitTransferOrders(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getInTransitTransferOrders = getInTransitTransferOrders;
const getPutawayStorageUtilization = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPutawayStorageUtilization(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPutawayStorageUtilization = getPutawayStorageUtilization;
const getMoveOrdersSummary = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getMoveOrdersSummary(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getMoveOrdersSummary = getMoveOrdersSummary;
// =========================================================================
// CATEGORY 4: FULFILLMENT & DISPATCH LOGISTICS
// =========================================================================
const getFulfillmentProgress = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getFulfillmentProgress(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getFulfillmentProgress = getFulfillmentProgress;
const getPackagePackingSlips = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPackagePackingSlips(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPackagePackingSlips = getPackagePackingSlips;
const getCarrierShipments = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getCarrierShipments(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getCarrierShipments = getCarrierShipments;
const getDeliveryChallanDetails = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getDeliveryChallanDetails(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getDeliveryChallanDetails = getDeliveryChallanDetails;
const getSalesReturnsAudit = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getSalesReturnsAudit(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getSalesReturnsAudit = getSalesReturnsAudit;
// =========================================================================
// CATEGORY 5: PROCUREMENT & INBOUND GOODS
// =========================================================================
const getPurchaseReceives = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPurchaseReceives(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPurchaseReceives = getPurchaseReceives;
const getPurchaseOrdersByItem = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPurchaseOrdersByItem(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPurchaseOrdersByItem = getPurchaseOrdersByItem;
const getPurchaseOrdersByVendor = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPurchaseOrdersByVendor(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPurchaseOrdersByVendor = getPurchaseOrdersByVendor;
const getPurchaseOrderDetails = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getPurchaseOrderDetails(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getPurchaseOrderDetails = getPurchaseOrderDetails;
// =========================================================================
// CATEGORY 6: MANUFACTURING & MATERIAL PLANNING
// =========================================================================
const getMRPPlanning = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getMRPPlanning(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getMRPPlanning = getMRPPlanning;
const getWorkOrdersExecution = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getWorkOrdersExecution(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getWorkOrdersExecution = getWorkOrdersExecution;
const getMachineWorkCentersCapacity = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getMachineWorkCentersCapacity(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getMachineWorkCentersCapacity = getMachineWorkCentersCapacity;
const getProductionRoutings = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getProductionRoutings(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductionRoutings = getProductionRoutings;
const getAISupplyChainInsights = async (req, res, next) => {
    try {
        const orgId = resolveOrgId(req);
        const data = await InventoryReportsService_1.InventoryReportsService.getAISupplyChainInsights(orgId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getAISupplyChainInsights = getAISupplyChainInsights;
