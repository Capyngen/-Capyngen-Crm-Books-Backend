import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWithholdingTax extends Document {
  orgId: string;
  regime: string; // e.g., 'India - TDS', 'India - TCS', 'US - Backup Withholding'
  taxType: 'TDS' | 'TCS' | 'Withholding';
  sectionCode: string; // e.g., '194J', '194C'
  natureOfPayment: string; // e.g., 'Professional Services', 'Contractor Payments'
  rate: number; // e.g., 10, 2
  thresholdAmount: number; // Exemption limit before tax applies (e.g., 30000)
  accountId: Types.ObjectId; // The GL Account (TDS Payable / TCS Receivable)
  isActive: boolean;
}

const WithholdingTaxSchema = new Schema<IWithholdingTax>(
  {
    orgId: { type: String, required: true, index: true },
    regime: { type: String, required: true, default: 'Global' },
    taxType: { type: String, enum: ['TDS', 'TCS', 'Withholding'], required: true },
    sectionCode: { type: String, required: true },
    natureOfPayment: { type: String, required: true },
    rate: { type: Number, required: true },
    thresholdAmount: { type: Number, default: 0 },
    accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const WithholdingTax = mongoose.models.WithholdingTax || mongoose.model<IWithholdingTax>('WithholdingTax', WithholdingTaxSchema);
