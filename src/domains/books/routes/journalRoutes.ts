import express from 'express';
import { getJournals, getJournalById, createJournal, updateJournal, deleteJournal, reverseJournal } from '../controllers/journalController';

const router = express.Router();

router.get('/', getJournals);
router.get('/:id', getJournalById);
router.post('/', createJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);
router.post('/:id/reverse', reverseJournal);

export default router;
