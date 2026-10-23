import express from 'express';
import {
  processPayrollBatch,
  getPayrollBatches,
  getPayrollBatchById,
  approvePayrollBatch,
  disbursePayrollBatch,
  downloadBankDisbursementFile,
  downloadEPF_ECRFile,
  downloadESICReturn,
  getPayslipById
} from '../controllers/payrollController';

const router = express.Router();

router.get('/', getPayrollBatches);
router.get('/batches', getPayrollBatches);
router.post('/batches/process', processPayrollBatch);
router.get('/batches/:id', getPayrollBatchById);
router.put('/batches/:id/approve', approvePayrollBatch);
router.post('/batches/:id/disburse', disbursePayrollBatch);
router.get('/batches/:id/bank-file', downloadBankDisbursementFile);
router.get('/batches/:id/compliance/epf-ecr', downloadEPF_ECRFile);
router.get('/batches/:id/compliance/esic-return', downloadESICReturn);
router.get('/payslips/:id', getPayslipById);

export default router;
