import express from 'express';
import { getWarehouses, getWarehouseById, createWarehouse, updateWarehouse, deleteWarehouse } from '../../inventory/controllers/warehouseController';

const router = express.Router({ mergeParams: true });


router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .get(getWarehouseById)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

export default router;
