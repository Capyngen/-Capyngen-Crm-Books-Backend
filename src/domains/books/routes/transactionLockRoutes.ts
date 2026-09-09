import express from 'express';
import { getTransactionLock, updateTransactionLock } from '../controllers/transactionLockController';

const router = express.Router();

router.get('/', getTransactionLock);
router.put('/', updateTransactionLock);

export default router;
