import express from 'express';
import {
  getDepartmentPayrollSummary,
  getTimesheetProfitabilityReport,
  getStatutoryComplianceReport,
  getPayrollVarianceReport
} from '../controllers/hrmsReportsController';

const router = express.Router();

router.get('/', getDepartmentPayrollSummary);
router.get('/summary', getDepartmentPayrollSummary);
router.get('/department-summary', getDepartmentPayrollSummary);
router.get('/timesheet-profitability', getTimesheetProfitabilityReport);
router.get('/statutory-compliance', getStatutoryComplianceReport);
router.get('/variance', getPayrollVarianceReport);

export default router;
