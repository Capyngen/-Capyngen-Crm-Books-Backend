import express from 'express';
import { getJournals, getJournalById, createJournal, updateJournal, deleteJournal } from '../controllers/journalController';

const router = express.Router();

router.get('/', getJournals);
router.get('/:id', getJournalById);
router.post('/', createJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

export default router;
