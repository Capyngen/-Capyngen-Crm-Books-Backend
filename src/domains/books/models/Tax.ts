import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITaxComponent {
  name: string; // e.g., CGST, SGST, State Tax, County Tax
  rate: number;
  isCompound: boolean; // if true, calculates on (Base Amount + Prior Taxes) instead of just Base Amount
  accountId: Types.ObjectId; // The GL Account (Duties & Taxes) where this specific component posts
}

export interface ITax extends Document {
  orgId: string;
  regime: string; // e.g., 'India - GST', 'US - California Sales Tax', 'UK - VAT'
  name: string; // e.g., 'GST 18% (Intra-State)', 'Standard VAT 20%'
  taxType: 'Sales' | 'Purchase' | 'Both';
  components: ITaxComponent[];
  totalRate: number; // Auto-calculated sum of components (or effective rate for compound)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxComponentSchema = new Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  isCompound: { type: Boolean, default: false },
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true }
});

const TaxSchema = new Schema<ITax>(
  {
    orgId: { type: String, required: true, index: true },
    regime: { type: String, required: true, default: 'Global' },
    name: { type: String, required: true },
    taxType: { type: String, enum: ['Sales', 'Purchase', 'Both'], default: 'Both' },
    components: [TaxComponentSchema],
    totalRate: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// To ensure a tax name is unique within an organization
TaxSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Tax = mongoose.models.Tax || mongoose.model<ITax>('Tax', TaxSchema);
