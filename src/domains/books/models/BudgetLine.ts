import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBudgetPeriod {
  periodIndex: number; // 1 to 12 for monthly
  amount: number;
}

export interface IBudgetLine extends Document {
  orgId: string;
  scenarioId: Types.ObjectId;
  accountId: Types.ObjectId;
  totalAmount: number;
  periods: IBudgetPeriod[];
}

const BudgetLineSchema = new Schema<IBudgetLine>({
  orgId: { type: String, required: true, index: true },
  scenarioId: { type: Schema.Types.ObjectId, ref: 'BudgetScenario', required: true, index: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  totalAmount: { type: Number, required: true },
  periods: [{
    periodIndex: { type: Number, required: true },
    amount: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.models.BudgetLine || mongoose.model<IBudgetLine>('BudgetLine', BudgetLineSchema);
