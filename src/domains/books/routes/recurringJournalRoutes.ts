import express from 'express';
import { getRecurringJournals, getRecurringJournalById, createRecurringJournal, updateRecurringJournalStatus, deleteRecurringJournal } from '../controllers/recurringJournalController';

const router = express.Router();

router.get('/', getRecurringJournals);
router.get('/:id', getRecurringJournalById);
router.post('/', createRecurringJournal);
router.patch('/:id/status', updateRecurringJournalStatus);
router.delete('/:id', deleteRecurringJournal);

export default router;
