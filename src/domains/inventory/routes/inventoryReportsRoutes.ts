import express from 'express';
import {
  getInventoryDrilldown,
  // Category 1
  getStockSummary,
  getInventoryValuation,
  getInventorySummary,
  getInventoryAgingSummary,
  getWeightedAverageCostSummary,
  getCommittedStockDetails,
  // Category 2
  getInventoryTurnoverByQuantity,
  getInventoryTurnoverByAmount,
  getABCClassification,
  getInventoryAdjustmentSummary,
  getInventoryAdjustmentDetails,
  getProductProfitability,
  // Category 3
  getWarehouseStockDistribution,
  getInTransitTransferOrders,
  getPutawayStorageUtilization,
  getMoveOrdersSummary,
  // Category 4
  getFulfillmentProgress,
  getPackagePackingSlips,
  getCarrierShipments,
  getDeliveryChallanDetails,
  getSalesReturnsAudit,
  // Category 5
  getPurchaseReceives,
  getPurchaseOrdersByItem,
  getPurchaseOrdersByVendor,
  getPurchaseOrderDetails,
  // Category 6
  getMRPPlanning,
  getWorkOrdersExecution,
  getMachineWorkCentersCapacity,
  getProductionRoutings,
  getAISupplyChainInsights
} from '../controllers/inventoryReportsController';

const router = express.Router();

// Universal Inventory Drilldown
router.get('/drilldown', getInventoryDrilldown);

// Category 1: Stock Summary & Valuation
router.get('/stock-summary', getStockSummary);
router.get('/inventory-valuation', getInventoryValuation);
router.get('/inventory-summary', getInventorySummary);
router.get('/inventory-aging', getInventoryAgingSummary);
router.get('/weighted-average-cost', getWeightedAverageCostSummary);
router.get('/committed-stock', getCommittedStockDetails);

// Category 2: Velocity, Turnover & Adjustments
router.get('/turnover-qty', getInventoryTurnoverByQuantity);
router.get('/turnover-amount', getInventoryTurnoverByAmount);
router.get('/abc-classification', getABCClassification);
router.get('/inventory-adj-summary', getInventoryAdjustmentSummary);
router.get('/inventory-adj-details', getInventoryAdjustmentDetails);
router.get('/profit-by-item', getProductProfitability);

// Category 3: Warehouse & Transfer Operations
router.get('/warehouse-distribution', getWarehouseStockDistribution);
router.get('/transfer-orders', getInTransitTransferOrders);
router.get('/putaways', getPutawayStorageUtilization);
router.get('/move-orders', getMoveOrdersSummary);

// Category 4: Fulfillment & Dispatch Logistics
router.get('/fulfillment-progress', getFulfillmentProgress);
router.get('/packages', getPackagePackingSlips);
router.get('/shipments', getCarrierShipments);
router.get('/delivery-challans', getDeliveryChallanDetails);
router.get('/sales-returns', getSalesReturnsAudit);

// Category 5: Procurement & Inbound Goods
router.get('/purchase-receives', getPurchaseReceives);
router.get('/po-by-item', getPurchaseOrdersByItem);
router.get('/po-by-vendor', getPurchaseOrdersByVendor);
router.get('/po-details', getPurchaseOrderDetails);

// Category 6: Manufacturing & Material Planning
router.get('/mrp-planning', getMRPPlanning);
router.get('/work-orders', getWorkOrdersExecution);
router.get('/machines-capacity', getMachineWorkCentersCapacity);
router.get('/production-routings', getProductionRoutings);
router.get('/ai-insights', getAISupplyChainInsights);

export default router;
