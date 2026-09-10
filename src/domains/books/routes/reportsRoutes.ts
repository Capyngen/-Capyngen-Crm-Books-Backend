import { getDrilldown } from '../controllers/drilldownController';
import express from 'express';
import { getProfitAndLoss } from '../controllers/reportsController';
import { getSalesByCustomer, getSalesByItem, getSalesBySalesPerson, getSalesSummary } from '../controllers/salesReportsController';

import { getProfitByItem, getSalesChannelSync } from '../controllers/salesReportsController';
import { getCommittedStockDetails, getInventoryAgingSummary, getStockSummary, getInventoryAdjustmentSummary, getInventoryAdjustmentDetails, getInventoryTurnoverByQuantity, getABCClassification, getInventoryTurnoverByAmount, getWeightedAverageCostSummary } from '../controllers/inventoryReportsController';

import { getInventorySummary, getInventoryValuationSummary, getFifoCostLotTracking } from '../controllers/inventoryReportsController';
import { getCustomerBalances, getVendorBalances } from '../controllers/balanceReportsController';
import { getBalanceSheet, getCashFlow, getHorizontalPL, getHorizontalBS, getMovementOfEquity, getBusinessPerformanceRatios } from '../controllers/reportsController';
import { getReceivablesAging, getInvoiceDetails } from '../controllers/receivablesReportsController';

import { getARAgingDetails, getSalesOrderDetailsReport, getDeliveryChallanDetailsReport, getQuoteDetailsReport, getQuoteItemDetailsReport, getReceivableSummary, getReceivableDetails } from '../controllers/receivablesReportsController';

import { getPayablesAging, getPurchaseOrderDetails } from '../controllers/payablesReportsController';

import { getAPAgingDetails, getVendorCreditDetailsReport, getPayablesRefundHistory, getPurchaseOrdersByVendor, getPurchaseOrderByItem, getPayableSummary, getPayableDetails } from '../controllers/payablesReportsController';

import { getTrialBalance, getGeneralLedger, getJournalReport, getDayBook, getAccountTransactions, getAccountTypeSummary, getDetailedGeneralLedger } from '../controllers/reportsController';


import { getExpensesByCategory, getExpenseDetails, getPurchasesByVendor, getPurchasesByItem } from '../controllers/purchasesReportsController';
import { getProjectSummary, getTimesheetProfitability, getPaymentsReceivedReport, getPaymentsMadeReport, getTaxSummary, getBudgetVsActual, getActivityLog } from '../controllers/otherReportsController';

const router = express.Router();

router.get('/drilldown', getDrilldown);


router.get('/profit-and-loss', getProfitAndLoss);
router.get('/sales-by-customer', getSalesByCustomer);
router.get('/sales-by-item', getSalesByItem);
router.get('/sales-by-salesperson', getSalesBySalesPerson);
router.get('/sales-summary', getSalesSummary);

router.get('/inventory-summary', getInventorySummary);
router.get('/inventory-valuation', getInventoryValuationSummary);
router.get('/fifo-tracking', getFifoCostLotTracking);

router.get('/profit-by-item', getProfitByItem);
router.get('/sales-channel-sync', getSalesChannelSync);
router.get('/committed-stock', getCommittedStockDetails);
router.get('/inventory-aging', getInventoryAgingSummary);
router.get('/stock-summary', getStockSummary);
router.get('/inventory-adj-summary', getInventoryAdjustmentSummary);
router.get('/inventory-adj-details', getInventoryAdjustmentDetails);
router.get('/turnover-qty', getInventoryTurnoverByQuantity);
router.get('/abc-classification', getABCClassification);
router.get('/turnover-amount', getInventoryTurnoverByAmount);
router.get('/weighted-average-cost', getWeightedAverageCostSummary);


router.get('/customer-balances', getCustomerBalances);
router.get('/vendor-balances', getVendorBalances);
router.get('/balance-sheet', getBalanceSheet);
router.get('/cash-flow', getCashFlow);

router.get('/horizontal-pl', getHorizontalPL);
router.get('/horizontal-bs', getHorizontalBS);
router.get('/movement-of-equity', getMovementOfEquity);
router.get('/business-performance-ratios', getBusinessPerformanceRatios);
router.get('/trial-balance', getTrialBalance);
router.get('/general-ledger', getGeneralLedger);
router.get('/journal-report', getJournalReport);

router.get('/horizontal-pl', getHorizontalPL);
router.get('/horizontal-bs', getHorizontalBS);
router.get('/movement-of-equity', getMovementOfEquity);
router.get('/receivables-aging', getReceivablesAging);
router.get('/invoice-details', getInvoiceDetails);

router.get('/ar-aging-details', getARAgingDetails);
router.get('/so-details', getSalesOrderDetailsReport);
router.get('/delivery-challan-details', getDeliveryChallanDetailsReport);
router.get('/quote-details', getQuoteDetailsReport);
router.get('/quote-item-details', getQuoteItemDetailsReport);
router.get('/receivable-summary', getReceivableSummary);
router.get('/receivable-details', getReceivableDetails);

router.get('/payables-aging', getPayablesAging);
router.get('/po-details', getPurchaseOrderDetails);

router.get('/ap-aging-details', getAPAgingDetails);
router.get('/vendor-credit-details', getVendorCreditDetailsReport);
router.get('/payables-refund-history', getPayablesRefundHistory);
router.get('/po-by-vendor', getPurchaseOrdersByVendor);
router.get('/po-by-item', getPurchaseOrderByItem);
router.get('/payable-summary', getPayableSummary);
router.get('/payable-details', getPayableDetails);

router.get('/trial-balance', getTrialBalance);
router.get('/general-ledger', getGeneralLedger);
router.get('/journal-report', getJournalReport);

export default router;


router.get('/expenses-by-category', getExpensesByCategory);
router.get('/expense-details', getExpenseDetails);
router.get('/purchases-by-vendor', getPurchasesByVendor);
router.get('/purchases-by-item', getPurchasesByItem);
router.get('/project-summary', getProjectSummary);
router.get('/timesheet-profitability', getTimesheetProfitability);
router.get('/payments-received-report', getPaymentsReceivedReport);
router.get('/payments-made-report', getPaymentsMadeReport);
router.get('/tax-summary', getTaxSummary);
router.get('/budget-vs-actual', getBudgetVsActual);
router.get('/activity-log', getActivityLog);

router.get('/day-book', getDayBook);
router.get('/account-transactions', getAccountTransactions);
router.get('/account-type-summary', getAccountTypeSummary);
router.get('/detailed-general-ledger', getDetailedGeneralLedger);
