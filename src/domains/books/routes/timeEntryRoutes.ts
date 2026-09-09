import express from 'express';
import { getTimeEntries, getTimeEntryById, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '../controllers/timeEntryController';

const router = express.Router();

router.get('/', getTimeEntries);
router.get('/:id', getTimeEntryById);
router.post('/', createTimeEntry);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

export default router;
