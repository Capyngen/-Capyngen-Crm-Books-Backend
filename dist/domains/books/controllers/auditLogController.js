"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = exports.getAuditLogs = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getAuditLogs = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { module, action, userId, startDate, endDate, limit = 100, page = 1 } = req.query;
        const filter = { orgId };
        if (module)
            filter.module = String(module);
        if (action)
            filter.action = String(action);
        if (userId)
            filter.userId = String(userId);
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(String(startDate));
            if (endDate)
                filter.createdAt.$lte = new Date(String(endDate));
        }
        const skip = (Number(page) - 1) * Number(limit);
        const logs = await AuditLog_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();
        const total = await AuditLog_1.default.countDocuments(filter);
        res.json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            logs
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching audit logs' });
    }
};
exports.getAuditLogs = getAuditLogs;
const createAuditLog = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { module, action, recordId, oldValues, newValues, reason } = req.body;
        const userId = req.user?._id?.toString() || req.user?.email || 'system';
        const log = new AuditLog_1.default({
            orgId,
            userId,
            module: module || 'General',
            action: action || 'Create',
            recordId,
            oldValues,
            newValues,
            reason
        });
        await log.save();
        res.status(201).json({ success: true, log });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating audit log' });
    }
};
exports.createAuditLog = createAuditLog;
