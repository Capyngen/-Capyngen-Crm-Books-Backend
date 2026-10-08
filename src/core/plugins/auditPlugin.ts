import { Schema, Document } from 'mongoose';
import { getContextValue } from '../middlewares/requestContext';
import mongoose from 'mongoose';

export function auditPlugin(schema: Schema, options: any) {
    schema.pre('save', function (next) {
        (this as any)._isNewRecord = this.isNew;
        next();
    });

    schema.post('save', async function (doc: any, next) {
        try {
            const org = getContextValue('org');
            const user = getContextValue('user');
            if (!org || !user) return next();

            const action = (this as any)._isNewRecord ? 'Create' : 'Update';
            const AuditLog = mongoose.models.AuditLog;
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
        } catch (e) { console.error('Audit Error:', e); }
        next();
    });

    schema.pre('findOneAndUpdate', async function (next) {
        try {
            const docToUpdate = await this.model.findOne(this.getQuery()).lean();
            (this as any)._originalDoc = docToUpdate;
        } catch (e) {}
        next();
    });

    schema.post('findOneAndUpdate', async function (doc: any, next) {
        try {
            const org = getContextValue('org');
            const user = getContextValue('user');
            if (!org || !user || !doc) return next();

            const originalDoc = (this as any)._originalDoc;
            const AuditLog = mongoose.models.AuditLog;
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
        } catch (e) { console.error('Audit Error:', e); }
        next();
    });

    schema.post('findOneAndDelete', async function (doc: any, next) {
        try {
            const org = getContextValue('org');
            const user = getContextValue('user');
            if (!org || !user || !doc) return next();

            const AuditLog = mongoose.models.AuditLog;
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
        } catch (e) { console.error('Audit Error:', e); }
        next();
    });
}
