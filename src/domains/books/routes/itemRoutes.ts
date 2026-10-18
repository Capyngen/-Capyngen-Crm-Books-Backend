import { Router } from 'express';
import { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem,
  deleteItem,
  assembleKit
} from '../../inventory/controllers/itemController';

const router = Router();

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

router.post('/:id/assemble', assembleKit);

export default router;
