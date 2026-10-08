import express from 'express';
import { getRoutings, getRoutingById, createRouting, updateRouting, deleteRouting } from '../../inventory/controllers/routingController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRoutings)
  .post(createRouting);

router.route('/:id')
  .get(getRoutingById)
  .put(updateRouting)
  .delete(deleteRouting);

export default router;
