import express from 'express';
import { getShipments, getShipmentById, createShipment, updateShipment, deleteShipment, integrateCarrier } from '../../inventory/controllers/shipmentController';

const router = express.Router({ mergeParams: true });


router.route('/')
  .get(getShipments)
  .post(createShipment);

router.route('/:id/carrier').post(integrateCarrier);

router.route('/:id')
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);

export default router;
