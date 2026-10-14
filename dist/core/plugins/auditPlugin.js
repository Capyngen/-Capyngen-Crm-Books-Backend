"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditPlugin = auditPlugin;
const requestContext_1 = require("../middlewares/requestContext");
const mongoose_1 = __importDefault(require("mongoose"));
function auditPlugin(schema, options) {
    schema.pre('save', async function () {
        this._isNewRecord = this.isNew;
    });
    schema.post('save', async function (doc, next) {
        try {
            const org = (0, requestContext_1.getContextValue)('org');
            const user = (0, requestContext_1.getContextValue)('user');
            if (!org || !user)
                return next();
            const action = this._isNewRecord ? 'Create' : 'Update';
            const AuditLog = mongoose_1.default.models.AuditLog;
            if (AuditLog) {
                await AuditLog.create({
                    orgId: org._id,
                    userId: user._id,
                    module: doc.constructor.modelName || 'Unknown',
                    action,
                    recordId: doc._id,
                    newValues: doc.toObject()
                });
            }
        }
        catch (e) {
            console.error('Audit Error:', e);
        }
        next();
    });
    schema.pre('findOneAndUpdate', async function () {
        try {
            const docToUpdate = await this.model.findOne(this.getQuery()).lean();
            this._originalDoc = docToUpdate;
        }
        catch (e) { }
    });
    schema.post('findOneAndUpdate', async function (doc, next) {
        try {
            const org = (0, requestContext_1.getContextValue)('org');
            const user = (0, requestContext_1.getContextValue)('user');
            if (!org || !user || !doc)
                return next();
            const originalDoc = this._originalDoc;
            const AuditLog = mongoose_1.default.models.AuditLog;
            if (AuditLog) {
                await AuditLog.create({
                    orgId: org._id,
                    userId: user._id,
                    module: doc.constructor.modelName || 'Unknown',
                    action: 'Update',
                    recordId: doc._id,
                    oldValues: originalDoc,
                    newValues: doc.toObject()
                });
            }
        }
        catch (e) {
            console.error('Audit Error:', e);
        }
        next();
    });
    schema.post('findOneAndDelete', async function (doc, next) {
        try {
            const org = (0, requestContext_1.getContextValue)('org');
            const user = (0, requestContext_1.getContextValue)('user');
            if (!org || !user || !doc)
                return next();
            const AuditLog = mongoose_1.default.models.AuditLog;
            if (AuditLog) {
                await AuditLog.create({
                    orgId: org._id,
                    userId: user._id,
                    module: doc.constructor.modelName || 'Unknown',
                    action: 'Delete',
                    recordId: doc._id,
                    oldValues: doc.toObject()
                });
            }
        }
        catch (e) {
            console.error('Audit Error:', e);
        }
        next();
    });
}
