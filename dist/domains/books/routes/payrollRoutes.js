"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payrollController_1 = require("../controllers/payrollController");
const router = express_1.default.Router();
router.get('/', payrollController_1.getPayrollBatches);
router.get('/batches', payrollController_1.getPayrollBatches);
router.post('/batches/process', payrollController_1.processPayrollBatch);
router.get('/batches/:id', payrollController_1.getPayrollBatchById);
router.put('/batches/:id/approve', payrollController_1.approvePayrollBatch);
router.post('/batches/:id/disburse', payrollController_1.disbursePayrollBatch);
router.get('/batches/:id/bank-file', payrollController_1.downloadBankDisbursementFile);
router.get('/batches/:id/compliance/epf-ecr', payrollController_1.downloadEPF_ECRFile);
router.get('/batches/:id/compliance/esic-return', payrollController_1.downloadESICReturn);
router.get('/payslips/:id', payrollController_1.getPayslipById);
exports.default = router;
