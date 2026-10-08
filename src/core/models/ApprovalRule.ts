import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovalRule extends Document {
    orgId: string;
    module: string;
    conditions: any; // JSON string or mixed object for logic
    approverRoles: string[];
    isActive: boolean;
}

const ApprovalRuleSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    module: { type: String, required: true }, // e.g., 'Journal', 'InterCompanyTransaction'
    conditions: { type: Schema.Types.Mixed },
    approverRoles: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ApprovalRule = mongoose.models.ApprovalRule || mongoose.model<IApprovalRule>('ApprovalRule', ApprovalRuleSchema);
