import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovalRequest extends Document {
    orgId: string;
    module: string;
    entityId: string;
    documentNumber?: string;
    amount?: number;
    customerOrVendorName?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedBy: string;
    requestedByName?: string;
    parentRoleId?: string;
    approverRoles?: string[];
    approvedBy?: string;
    approvedByName?: string;
    comments?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ApprovalRequestSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    documentNumber: { type: String },
    amount: { type: Number, default: 0 },
    customerOrVendorName: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String },
    parentRoleId: { type: String, index: true },
    approverRoles: [{ type: String }],
    approvedBy: { type: String },
    approvedByName: { type: String },
    comments: { type: String },
    rejectionReason: { type: String }
}, { timestamps: true });

export const ApprovalRequest = mongoose.models.ApprovalRequest || mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);
export default ApprovalRequest;
