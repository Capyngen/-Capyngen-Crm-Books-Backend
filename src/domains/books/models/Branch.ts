import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  orgId: string;
  branchName: string;
  branchCode: string;
  isActive: boolean;
}

const BranchSchema = new Schema({
  orgId: { type: String, required: true },
  branchName: { type: String, required: true },
  branchCode: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.BooksBranch || mongoose.model<IBranch>('BooksBranch', BranchSchema);
