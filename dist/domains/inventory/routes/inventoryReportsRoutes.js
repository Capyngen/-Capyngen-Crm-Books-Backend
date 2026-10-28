"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryReportsController_1 = require("../controllers/inventoryReportsController");
const router = express_1.default.Router();
// Universal Inventory Drilldown
router.get('/drilldown', inventoryReportsController_1.getInventoryDrilldown);
// Category 1: Stock Summary & Valuation
router.get('/stock-summary', inventoryReportsController_1.getStockSummary);
router.get('/inventory-valuation', inventoryReportsController_1.getInventoryValuation);
router.get('/inventory-summary', inventoryReportsController_1.getInventorySummary);
router.get('/inventory-aging', inventoryReportsController_1.getInventoryAgingSummary);
router.get('/weighted-average-cost', inventoryReportsController_1.getWeightedAverageCostSummary);
router.get('/committed-stock', inventoryReportsController_1.getCommittedStockDetails);
// Category 2: Velocity, Turnover & Adjustments
router.get('/turnover-qty', inventoryReportsController_1.getInventoryTurnoverByQuantity);
router.get('/turnover-amount', inventoryReportsController_1.getInventoryTurnoverByAmount);
router.get('/abc-classification', inventoryReportsController_1.getABCClassification);
router.get('/inventory-adj-summary', inventoryReportsController_1.getInventoryAdjustmentSummary);
router.get('/inventory-adj-details', inventoryReportsController_1.getInventoryAdjustmentDetails);
router.get('/profit-by-item', inventoryReportsController_1.getProductProfitability);
// Category 3: Warehouse & Transfer Operations
router.get('/warehouse-distribution', inventoryReportsController_1.getWarehouseStockDistribution);
router.get('/transfer-orders', inventoryReportsController_1.getInTransitTransferOrders);
router.get('/putaways', inventoryReportsController_1.getPutawayStorageUtilization);
router.get('/move-orders', inventoryReportsController_1.getMoveOrdersSummary);
// Category 4: Fulfillment & Dispatch Logistics
router.get('/fulfillment-progress', inventoryReportsController_1.getFulfillmentProgress);
router.get('/packages', inventoryReportsController_1.getPackagePackingSlips);
router.get('/shipments', inventoryReportsController_1.getCarrierShipments);
router.get('/delivery-challans', inventoryReportsController_1.getDeliveryChallanDetails);
router.get('/sales-returns', inventoryReportsController_1.getSalesReturnsAudit);
// Category 5: Procurement & Inbound Goods
router.get('/purchase-receives', inventoryReportsController_1.getPurchaseReceives);
router.get('/po-by-item', inventoryReportsController_1.getPurchaseOrdersByItem);
router.get('/po-by-vendor', inventoryReportsController_1.getPurchaseOrdersByVendor);
router.get('/po-details', inventoryReportsController_1.getPurchaseOrderDetails);
// Category 6: Manufacturing & Material Planning
router.get('/mrp-planning', inventoryReportsController_1.getMRPPlanning);
router.get('/work-orders', inventoryReportsController_1.getWorkOrdersExecution);
router.get('/machines-capacity', inventoryReportsController_1.getMachineWorkCentersCapacity);
router.get('/production-routings', inventoryReportsController_1.getProductionRoutings);
router.get('/ai-insights', inventoryReportsController_1.getAISupplyChainInsights);
exports.default = router;
