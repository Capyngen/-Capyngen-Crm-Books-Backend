"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimeEntry = exports.updateTimeEntry = exports.createTimeEntry = exports.getTimeEntryById = exports.getTimeEntries = void 0;
const TimeEntry_1 = __importDefault(require("../models/TimeEntry"));
const getTimeEntries = async (req, res) => {
    try {
        const entries = await TimeEntry_1.default.find().sort({ date: -1, createdAt: -1 });
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTimeEntries = getTimeEntries;
const getTimeEntryById = async (req, res) => {
    try {
        const entry = await TimeEntry_1.default.findById(req.params.id);
        if (!entry)
            return res.status(404).json({ message: 'Time Entry not found' });
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTimeEntryById = getTimeEntryById;
const createTimeEntry = async (req, res) => {
    try {
        const entry = new TimeEntry_1.default(req.body);
        const savedEntry = await entry.save();
        res.status(201).json(savedEntry);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createTimeEntry = createTimeEntry;
const updateTimeEntry = async (req, res) => {
    try {
        const updatedEntry = await TimeEntry_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEntry)
            return res.status(404).json({ message: 'Time Entry not found' });
        res.json(updatedEntry);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateTimeEntry = updateTimeEntry;
const deleteTimeEntry = async (req, res) => {
    try {
        const deletedEntry = await TimeEntry_1.default.findByIdAndDelete(req.params.id);
        if (!deletedEntry)
            return res.status(404).json({ message: 'Time Entry not found' });
        res.json({ message: 'Time Entry deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteTimeEntry = deleteTimeEntry;
