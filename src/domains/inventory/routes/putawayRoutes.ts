import { Router } from 'express';
import {
  getPutaways,
  getPutawayById,
  createPutaway,
  completePutaway,
  updatePutaway,
  deletePutaway
} from '../controllers/putawayController';

const router = Router();

router.get('/', getPutaways);
router.get('/:id', getPutawayById);
router.post('/', createPutaway);
router.post('/:id/complete', completePutaway);
router.put('/:id', updatePutaway);
router.delete('/:id', deletePutaway);

export default router;
