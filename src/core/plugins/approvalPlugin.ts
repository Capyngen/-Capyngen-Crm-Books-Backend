import { Schema } from 'mongoose';
import { getContextValue } from '../middlewares/requestContext';
import mongoose from 'mongoose';

export function approvalPlugin(schema: Schema, options: any) {
    schema.pre('save', async function (next) {
        try {
            if (!this.isNew) return next();
            const org = getContextValue('org');
            const user = getContextValue('user');
            if (!org || !user) return next();

            const moduleName = (this.constructor as any).modelName;
            const ApprovalRule = mongoose.models.ApprovalRule;
            if (!ApprovalRule) return next();

            // Check if any rule targets this module
            const rules = await ApprovalRule.find({ orgId: org._id, module: moduleName, isActive: true });
            if (rules.length > 0) {
                // If a 'status' field exists on this entity, force it to Pending_Approval
                if ((this as any).status !== undefined) {
                    (this as any).status = 'Pending_Approval'; // or your domain-specific pending status
                }
                (this as any)._needsApprovalRequest = true;
            }
        } catch (e) { console.error('Approval Intercept Error:', e); }
        next();
    });

    schema.post('save', async function (doc: any, next) {
        if ((this as any)._needsApprovalRequest) {
            try {
                const org = getContextValue('org');
                const user = getContextValue('user');
                const ApprovalRequest = mongoose.models.ApprovalRequest;
                if (ApprovalRequest && org && user) {
                    await ApprovalRequest.create({
                        orgId: org._id,
                        module: doc.constructor.modelName,
                        entityId: doc._id,
                        status: 'Pending',
                        requestedBy: user._id
                    });
                }
            } catch (e) { console.error('Approval Request Creation Error:', e); }
        }
        next();
    });
}
