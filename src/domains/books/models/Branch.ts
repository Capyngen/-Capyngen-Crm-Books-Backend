import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  orgId: string;
  branchName: string;
  branchCode: string;
  gstin?: string;
  address?: string;
  isPrimary?: boolean;
  isActive: boolean;
}

const BranchSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  branchName: { type: String, required: true },
  branchCode: { type: String },
  gstin: { type: String },
  address: { type: String },
  isPrimary: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.BooksBranch || mongoose.model<IBranch>('BooksBranch', BranchSchema);
