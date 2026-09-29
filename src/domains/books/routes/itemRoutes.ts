import { Router } from 'express';
import { createItem, getItems, getItemById, updateItem } from '../../inventory/controllers/itemController';

const router = Router();

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem);

export default router;
