import express from 'express';
import { getMachines, getMachineById, createMachine, updateMachine, deleteMachine } from '../../inventory/controllers/machineController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getMachines)
  .post(createMachine);

router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

export default router;
