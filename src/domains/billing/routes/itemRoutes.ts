import express from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController';
import {
  getItemMovements,
  getItemTransactions,
  getItemActivity
} from '../../inventory/controllers/itemController';

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(createItem);

router.get('/:id/movements', getItemMovements);
router.get('/:id/transactions', getItemTransactions);
router.get('/:id/activity', getItemActivity);
router.get('/:id/timeline', getItemActivity);
router.get('/:id/history', getItemActivity);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

export default router;
