import express from 'express';
import {
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  updateCreditNote,
  deleteCreditNote
} from '../controllers/creditNoteController';

const router = express.Router();

router.route('/')
  .post(createCreditNote)
  .get(getCreditNotes);

router.route('/:id')
  .get(getCreditNoteById)
  .put(updateCreditNote)
  .delete(deleteCreditNote);

export default router;
