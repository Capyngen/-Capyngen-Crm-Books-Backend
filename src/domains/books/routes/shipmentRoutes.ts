import express from 'express';
import { 
  getShipments, 
  getShipmentById, 
  createShipment, 
  updateShipment, 
  deleteShipment, 
  integrateCarrier,
  getPackingSlip
} from '../../inventory/controllers/shipmentController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getShipments)
  .post(createShipment);

router.route('/:id/carrier').post(integrateCarrier);
router.route('/:id/packing-slip').get(getPackingSlip);

router.route('/:id')
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);

export default router;
