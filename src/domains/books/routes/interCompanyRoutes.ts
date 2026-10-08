import express from 'express';
import { getTransactions, createTransaction, approveTransaction } from '../controllers/interCompanyController';

export const interCompanyRoutes = express.Router();

interCompanyRoutes.get('/', getTransactions);
interCompanyRoutes.post('/', createTransaction);
interCompanyRoutes.post('/:id/approve', approveTransaction);
