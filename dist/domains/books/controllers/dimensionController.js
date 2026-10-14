"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranchById = exports.getBranches = exports.deleteDimension = exports.updateDimension = exports.createDimension = exports.getDimensionById = exports.getDimensions = void 0;
const FinancialDimension_1 = require("../models/FinancialDimension");
const Branch_1 = __importDefault(require("../models/Branch"));
// =======================
// Financial Dimensions
// =======================
const getDimensions = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const filter = orgId ? { orgId } : {};
        // Explicitly use .lean() to return plain JSON objects, preventing the raw Mongoose _doc UI bug!
        const dimensions = await FinancialDimension_1.FinancialDimension.find(filter).sort({ createdAt: -1 }).lean();
        res.json(dimensions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getDimensions = getDimensions;
const getDimensionById = async (req, res) => {
    try {
        const dim = await FinancialDimension_1.FinancialDimension.findById(req.params.id).lean();
        if (!dim)
            return res.status(404).json({ message: 'Not found' });
        res.json(dim);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getDimensionById = getDimensionById;
const createDimension = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const payload = { ...req.body, orgId };
        const dimension = new FinancialDimension_1.FinancialDimension(payload);
        const saved = await dimension.save();
        // Return lean object via toJSON
        res.status(201).json(saved.toJSON());
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createDimension = createDimension;
const updateDimension = async (req, res) => {
    try {
        // Basic circular dependency check
        if (req.body.parentDimensionId && req.body.parentDimensionId === req.params.id) {
            return res.status(400).json({ message: 'Cannot be its own parent.' });
        }
        const updated = await FinancialDimension_1.FinancialDimension.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateDimension = updateDimension;
const deleteDimension = async (req, res) => {
    try {
        const deleted = await FinancialDimension_1.FinancialDimension.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteDimension = deleteDimension;
// =======================
// Branches
// =======================
const getBranches = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const filter = orgId ? { orgId } : {};
        const branches = await Branch_1.default.find(filter).sort({ createdAt: -1 }).lean();
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBranches = getBranches;
const getBranchById = async (req, res) => {
    try {
        const branch = await Branch_1.default.findById(req.params.id).lean();
        if (!branch)
            return res.status(404).json({ message: 'Not found' });
        res.json(branch);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBranchById = getBranchById;
const createBranch = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        // If setting as primary, unset other primaries
        if (req.body.isPrimary && orgId) {
            await Branch_1.default.updateMany({ orgId }, { $set: { isPrimary: false } });
        }
        const payload = { ...req.body, orgId };
        const branch = new Branch_1.default(payload);
        const saved = await branch.save();
        res.status(201).json(saved.toJSON());
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createBranch = createBranch;
const updateBranch = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        if (req.body.isPrimary && orgId) {
            await Branch_1.default.updateMany({ orgId, _id: { $ne: req.params.id } }, { $set: { isPrimary: false } });
        }
        const updated = await Branch_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res) => {
    try {
        const deleted = await Branch_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteBranch = deleteBranch;
