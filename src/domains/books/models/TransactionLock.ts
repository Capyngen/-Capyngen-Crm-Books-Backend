import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionLock extends Document {
  orgId?: string;
  salesLockDate?: Date;
  purchasesLockDate?: Date;
  bankingLockDate?: Date;
  accountantLockDate?: Date;
  allLockDate?: Date;
  reason?: string;
  lockedBy?: string;
  
  // Advanced settings from Zoho functional spec
  negativeStockRestriction?: boolean;
  partialUnlocks?: {
    module: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }[];
}

const TransactionLockSchema = new Schema<ITransactionLock>({
  orgId: { type: String, required: true },
  salesLockDate: { type: Date },
  purchasesLockDate: { type: Date },
  bankingLockDate: { type: Date },
  accountantLockDate: { type: Date },
  allLockDate: { type: Date },
  reason: { type: String },
  lockedBy: { type: String },
  negativeStockRestriction: { type: Boolean, default: true },
  partialUnlocks: [{
    module: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }]
}, { timestamps: true });

export default mongoose.model<ITransactionLock>('TransactionLock', TransactionLockSchema);
