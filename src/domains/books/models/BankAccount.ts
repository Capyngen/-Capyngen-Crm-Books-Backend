import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  orgId: string;
  accountName: string;
  accountNumber: string;
  currency: string;
}

const BankAccountSchema = new Schema({
  orgId: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String },
  currency: { type: String, default: 'INR' }
}, { timestamps: true });

export default mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
