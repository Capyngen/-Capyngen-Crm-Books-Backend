"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringJournal = exports.updateRecurringJournalStatus = exports.createRecurringJournal = exports.getRecurringJournalById = exports.getRecurringJournals = void 0;
const RecurringJournal_1 = require("../models/RecurringJournal");
const getRecurringJournals = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const filter = orgId ? { orgId } : {};
        const journals = await RecurringJournal_1.RecurringJournal.find(filter).sort({ createdAt: -1 }).lean();
        res.json(journals);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getRecurringJournals = getRecurringJournals;
const getRecurringJournalById = async (req, res) => {
    try {
        const journal = await RecurringJournal_1.RecurringJournal.findById(req.params.id).lean();
        if (!journal)
            return res.status(404).json({ message: 'Not found' });
        res.json(journal);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getRecurringJournalById = getRecurringJournalById;
const createRecurringJournal = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { startsOn, endsAfterOccurrences, endsOn } = req.body;
        // Automatically set the first run date to the startsOn date.
        // An enterprise background job would poll for nextRunDate <= new Date().
        const journal = new RecurringJournal_1.RecurringJournal({
            ...req.body,
            orgId,
            nextRunDate: new Date(startsOn),
            occurrencesPosted: 0,
            status: 'Active'
        });
        const saved = await journal.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating recurring journal' });
    }
};
exports.createRecurringJournal = createRecurringJournal;
const updateRecurringJournalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Active, Paused
        const journal = await RecurringJournal_1.RecurringJournal.findByIdAndUpdate(id, { status }, { new: true }).lean();
        if (!journal)
            return res.status(404).json({ message: 'Not found' });
        res.json(journal);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateRecurringJournalStatus = updateRecurringJournalStatus;
const deleteRecurringJournal = async (req, res) => {
    try {
        const deleted = await RecurringJournal_1.RecurringJournal.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteRecurringJournal = deleteRecurringJournal;
