import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  orgId: string;
  accountId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  budgetedAmount: number;
  branchId?: string | mongoose.Types.ObjectId;
  projectId?: string | mongoose.Types.ObjectId;
}

const BudgetSchema = new Schema({
  orgId: { type: String, required: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  budgetedAmount: { type: Number, required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' }
}, { timestamps: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
