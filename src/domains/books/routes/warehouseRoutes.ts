import express from 'express';
import { 
  getWarehouses, 
  getWarehouseById, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse,
  getWarehouseStock,
  addWarehouseBin
} from '../../inventory/controllers/warehouseController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .get(getWarehouseById)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

router.get('/:id/stock', getWarehouseStock);
router.post('/:id/bins', addWarehouseBin);

export default router;
