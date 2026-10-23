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

// Sub-routes declared before /:id parameter to avoid CastError
router.get('/item-groups', (req, res) => res.status(200).json({ success: true, count: 0, data: [] }));
router.get('/composite-items', (req, res) => res.status(200).json({ success: true, count: 0, data: [] }));
router.get('/price-lists', (req, res) => res.status(200).json({ success: true, count: 0, data: [] }));
router.get('/preferences', (req, res) => res.status(200).json({ success: true, count: 0, data: {} }));
router.get('/reorder-items', (req, res) => res.status(200).json({ success: true, count: 0, data: [] }));

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

router.post('/:id/assemble', assembleKit);

export default router;
