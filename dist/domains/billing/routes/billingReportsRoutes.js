"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billingReportsController_1 = require("../controllers/billingReportsController");
const router = express_1.default.Router();
// Universal Drilldown
router.get('/drilldown', billingReportsController_1.getBillingDrilldown);
// Category 1: Subscription & MRR Analytics
router.get('/mrr-waterfall', billingReportsController_1.getMRRWaterfall);
router.get('/subscription-lifecycle', billingReportsController_1.getSubscriptionLifecycle);
router.get('/arr-forecast', billingReportsController_1.getARRForecast);
router.get('/trial-conversion', billingReportsController_1.getTrialConversion);
router.get('/net-revenue-retention', billingReportsController_1.getNetRevenueRetention);
// Category 2: Invoicing, Collections & AR Aging
router.get('/recurring-invoices-schedule', billingReportsController_1.getRecurringInvoicesSchedule);
router.get('/ar-aging', billingReportsController_1.getARAgingDetails);
router.get('/payments-received', billingReportsController_1.getPaymentsReceivedLedger);
router.get('/dunning-retries', billingReportsController_1.getDunningRetries);
router.get('/receivables-summary', billingReportsController_1.getReceivablesSummary);
// Category 3: Product Catalog & Pricing Monetization
router.get('/plan-performance', billingReportsController_1.getPlanPerformance);
router.get('/addon-consumption', billingReportsController_1.getAddonConsumption);
router.get('/coupon-audit', billingReportsController_1.getCouponAudit);
router.get('/pricing-widget-analytics', billingReportsController_1.getPricingWidgetAnalytics);
// Category 4: Customer Lifetime & Retention Metrics
router.get('/ltv-arpu', billingReportsController_1.getLTVAndARPU);
router.get('/churn-analysis', billingReportsController_1.getChurnAnalysis);
router.get('/top-customers', billingReportsController_1.getTopCustomers);
router.get('/credit-refund-ledger', billingReportsController_1.getCreditRefundLedger);
// Category 5: Time Tracking, Projects & Billability
router.get('/project-summary', billingReportsController_1.getProjectSummary);
router.get('/timesheet-profitability', billingReportsController_1.getTimesheetProfitability);
router.get('/time-entries-log', billingReportsController_1.getTimeEntriesLog);
router.get('/resource-utilization', billingReportsController_1.getResourceUtilization);
router.get('/gateway-settlements', billingReportsController_1.getGatewaySettlements);
// Category 6: Operating Expenses & Cash Margin
router.get('/expenses-by-category', billingReportsController_1.getExpensesByCategory);
router.get('/recurring-expenses', billingReportsController_1.getRecurringExpenseCommitments);
router.get('/cash-flow', billingReportsController_1.getCashFlow);
router.get('/profit-and-loss', billingReportsController_1.getProfitAndLoss);
exports.default = router;
