import express from 'express';
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  importBankStatement,
  getBankFeedSummary
} from '../controllers/bankAccountController';

const router = express.Router();

router.get('/summary', getBankFeedSummary);
router.get('/', getBankAccounts);
router.get('/:id', getBankAccountById);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);
router.post('/import-statement', importBankStatement);

export default router;
