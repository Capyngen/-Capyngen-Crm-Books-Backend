import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovalRequest extends Document {
    orgId: string;
    module: string;
    entityId: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedBy: string;
    approvedBy?: string;
    comments?: string;
}

const ApprovalRequestSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    module: { type: String, required: true },
    entityId: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    requestedBy: { type: String, required: true },
    approvedBy: { type: String },
    comments: { type: String }
}, { timestamps: true });

export const ApprovalRequest = mongoose.models.ApprovalRequest || mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);
