"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hrmsReportsController_1 = require("../controllers/hrmsReportsController");
const router = express_1.default.Router();
router.get('/department-summary', hrmsReportsController_1.getDepartmentPayrollSummary);
router.get('/timesheet-profitability', hrmsReportsController_1.getTimesheetProfitabilityReport);
router.get('/statutory-compliance', hrmsReportsController_1.getStatutoryComplianceReport);
router.get('/variance', hrmsReportsController_1.getPayrollVarianceReport);
exports.default = router;
