"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimeEntry = exports.updateTimeEntry = exports.createTimeEntry = exports.getTimeEntryById = exports.getTimeEntries = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TimeEntry_1 = __importDefault(require("../models/TimeEntry"));
const getTimeEntries = async (req, res) => {
    try {
        const orgId = String(req.org?._id ||
            req.headers['x-org-id'] ||
            req.headers['x-company-id'] ||
            '6aa797278d301b4735f1d322');
        const conditions = [{ orgId }, { companyId: orgId }];
        if (mongoose_1.default.Types.ObjectId.isValid(orgId)) {
            const objId = new mongoose_1.default.Types.ObjectId(orgId);
            conditions.push({ orgId: objId }, { companyId: objId });
        }
        const filter = { $or: conditions };
        const entries = await TimeEntry_1.default.find(filter)
            .populate('project', 'projectName projectCode customer')
            .populate('projectId', 'projectName projectCode customer')
            .sort({ date: -1, createdAt: -1 });
        const enriched = entries.map((e) => {
            const obj = e.toObject ? e.toObject() : e;
            obj.timeSpent = obj.timeSpent || (obj.hours ? `${obj.hours} hrs` : '0h');
            obj.task = obj.task || 'General Development & Diagnostics';
            if (obj.project && typeof obj.project === 'object') {
                obj.projectName = obj.project.projectName;
            }
            return obj;
        });
        res.json(enriched);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTimeEntries = getTimeEntries;
const getTimeEntryById = async (req, res) => {
    try {
        const entry = await TimeEntry_1.default.findById(req.params.id)
            .populate('project', 'projectName projectCode customer')
            .populate('projectId', 'projectName projectCode customer');
        if (!entry)
            return res.status(404).json({ message: 'Time Entry not found' });
        const obj = entry.toObject ? entry.toObject() : entry;
        obj.timeSpent = obj.timeSpent || (obj.hours ? `${obj.hours} hrs` : '0h');
        obj.task = obj.task || 'General Development & Diagnostics';
        if (obj.project && typeof obj.project === 'object') {
            obj.projectName = obj.project.projectName;
        }
        res.json(obj);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTimeEntryById = getTimeEntryById;
const createTimeEntry = async (req, res) => {
    try {
        const orgId = String(req.org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
        const entry = new TimeEntry_1.default({
            ...req.body,
            companyId: orgId,
            orgId
        });
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
