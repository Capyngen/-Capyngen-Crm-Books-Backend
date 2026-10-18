import express from 'express';
import {
  getTransactions,
  createTransaction,
  approveTransaction,
  getConsolidatedEliminations
} from '../controllers/interCompanyController';

export const interCompanyRoutes = express.Router();

interCompanyRoutes.get('/eliminations', getConsolidatedEliminations);
interCompanyRoutes.get('/', getTransactions);
interCompanyRoutes.post('/', createTransaction);
interCompanyRoutes.post('/:id/approve', approveTransaction);

export default interCompanyRoutes;
