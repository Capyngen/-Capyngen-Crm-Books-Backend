import { Router } from 'express';
import { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem,
  deleteItem,
  assembleKit,
  getItemMovements,
  getItemTransactions,
  getItemActivity
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

router.get('/:id/movements', getItemMovements);
router.get('/:id/transactions', getItemTransactions);
router.get('/:id/activity', getItemActivity);
router.get('/:id/timeline', getItemActivity);
router.get('/:id/history', getItemActivity);
router.post('/:id/assemble', assembleKit);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

export default router;
