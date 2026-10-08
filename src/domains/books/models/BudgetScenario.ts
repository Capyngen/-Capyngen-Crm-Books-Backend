import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBudgetScenario extends Document {
  orgId: string;
  name: string; // e.g., '2026 Base Budget', '2026 Optimistic'
  fiscalYearId: Types.ObjectId;
  type: 'Profit_Loss' | 'Balance_Sheet';
  periodType: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'Draft' | 'Active' | 'Archived';
  description?: string;
  totalBudgetedAmount: number;
}

const BudgetScenarioSchema = new Schema<IBudgetScenario>({
  orgId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  fiscalYearId: { type: Schema.Types.ObjectId, ref: 'FiscalYear', required: true },
  type: { type: String, enum: ['Profit_Loss', 'Balance_Sheet'], default: 'Profit_Loss' },
  periodType: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'], default: 'Monthly' },
  status: { type: String, enum: ['Draft', 'Active', 'Archived'], default: 'Draft' },
  description: { type: String },
  totalBudgetedAmount: { type: Number, default: 0 }
}, { timestamps: true });

export const BudgetScenario = mongoose.models.BudgetScenario || mongoose.model<IBudgetScenario>('BudgetScenario', BudgetScenarioSchema);
