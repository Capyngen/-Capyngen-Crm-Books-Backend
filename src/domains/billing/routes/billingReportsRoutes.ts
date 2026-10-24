import express from 'express';
import {
  getMRRWaterfall,
  getSubscriptionLifecycle,
  getARRForecast,
  getTrialConversion,
  getNetRevenueRetention,
  getRecurringInvoicesSchedule,
  getARAgingDetails,
  getPaymentsReceivedLedger,
  getDunningRetries,
  getReceivablesSummary,
  getPlanPerformance,
  getAddonConsumption,
  getCouponAudit,
  getPricingWidgetAnalytics,
  getLTVAndARPU,
  getChurnAnalysis,
  getTopCustomers,
  getCreditRefundLedger,
  getProjectSummary,
  getTimesheetProfitability,
  getTimeEntriesLog,
  getResourceUtilization,
  getGatewaySettlements,
  getExpensesByCategory,
  getRecurringExpenseCommitments,
  getCashFlow,
  getProfitAndLoss,
  getBillingDrilldown
} from '../controllers/billingReportsController';

const router = express.Router();

// Universal Drilldown
router.get('/drilldown', getBillingDrilldown);

// Category 1: Subscription & MRR Analytics
router.get('/mrr-waterfall', getMRRWaterfall);
router.get('/subscription-lifecycle', getSubscriptionLifecycle);
router.get('/arr-forecast', getARRForecast);
router.get('/trial-conversion', getTrialConversion);
router.get('/net-revenue-retention', getNetRevenueRetention);

// Category 2: Invoicing, Collections & AR Aging
router.get('/recurring-invoices-schedule', getRecurringInvoicesSchedule);
router.get('/ar-aging', getARAgingDetails);
router.get('/payments-received', getPaymentsReceivedLedger);
router.get('/dunning-retries', getDunningRetries);
router.get('/receivables-summary', getReceivablesSummary);

// Category 3: Product Catalog & Pricing Monetization
router.get('/plan-performance', getPlanPerformance);
router.get('/addon-consumption', getAddonConsumption);
router.get('/coupon-audit', getCouponAudit);
router.get('/pricing-widget-analytics', getPricingWidgetAnalytics);

// Category 4: Customer Lifetime & Retention Metrics
router.get('/ltv-arpu', getLTVAndARPU);
router.get('/churn-analysis', getChurnAnalysis);
router.get('/top-customers', getTopCustomers);
router.get('/credit-refund-ledger', getCreditRefundLedger);

// Category 5: Time Tracking, Projects & Billability
router.get('/project-summary', getProjectSummary);
router.get('/timesheet-profitability', getTimesheetProfitability);
router.get('/time-entries-log', getTimeEntriesLog);
router.get('/resource-utilization', getResourceUtilization);
router.get('/gateway-settlements', getGatewaySettlements);

// Category 6: Operating Expenses & Cash Margin
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/recurring-expenses', getRecurringExpenseCommitments);
router.get('/cash-flow', getCashFlow);
router.get('/profit-and-loss', getProfitAndLoss);

export default router;
