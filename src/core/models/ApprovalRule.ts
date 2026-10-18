import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovalRule extends Document {
    orgId: string;
    module: string; // e.g. 'invoices', 'bills', 'purchase_orders', 'sales_orders', 'expenses', 'credit_notes', 'vendor_credits', 'inventory_adjustments'
    thresholdAmount: number; // 0 = every transaction requires approval
    autoApproveBelowThreshold: boolean;
    requireParentRoleApproval: boolean;
    approverRoles: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ApprovalRuleSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    module: { type: String, required: true },
    thresholdAmount: { type: Number, default: 0 },
    autoApproveBelowThreshold: { type: Boolean, default: true },
    requireParentRoleApproval: { type: Boolean, default: true },
    approverRoles: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

ApprovalRuleSchema.index({ orgId: 1, module: 1 }, { unique: true });

export const ApprovalRule = mongoose.models.ApprovalRule || mongoose.model<IApprovalRule>('ApprovalRule', ApprovalRuleSchema);
export default ApprovalRule;
