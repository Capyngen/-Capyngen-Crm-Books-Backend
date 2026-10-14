"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class LoggingService {
    static async logAction(orgId, userId, module, action, recordId, oldDoc = null, newDoc = null, context = {}) {
        let oldValues = undefined;
        let newValues = undefined;
        if (action === 'Update' && oldDoc && newDoc) {
            oldValues = {};
            newValues = {};
            const keys = new Set([...Object.keys(oldDoc), ...Object.keys(newDoc)]);
            for (const k of keys) {
                if (k.startsWith('_'))
                    continue; // Ignore mongo internal fields like _id, __v
                if (k === 'updatedAt')
                    continue;
                const v1 = JSON.stringify(oldDoc[k]);
                const v2 = JSON.stringify(newDoc[k]);
                if (v1 !== v2) {
                    oldValues[k] = oldDoc[k];
                    newValues[k] = newDoc[k];
                }
            }
            // If no actual fields changed, do not log an update.
            if (Object.keys(oldValues).length === 0)
                return null;
        }
        else if (action === 'Void') {
            // Void only logs the fact that it was voided, to prevent overlapping Update log
            oldValues = { status: oldDoc.status };
            newValues = { status: 'Void' };
        }
        else if (action === 'Create') {
            newValues = { ...newDoc };
            delete newValues._id;
            delete newValues.__v;
        }
        const log = new AuditLog_1.default({
            orgId, userId, module, action, recordId, oldValues, newValues, batchId: context.batchId, reason: context.reason
        });
        await log.save();
        return log;
    }
}
exports.LoggingService = LoggingService;
