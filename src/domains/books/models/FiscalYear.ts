import mongoose, { Schema, Document } from 'mongoose';

export interface IFiscalPeriod {
  periodName: string; // e.g., "Jan 2026"
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
}

export interface IFiscalYear extends Document {
  orgId: string;
  yearName: string; // e.g., "FY 2026-2027"
  startDate: Date;
  endDate: Date;
  isClosed: boolean; // if true, the entire year is locked
  periods: IFiscalPeriod[];
  createdAt: Date;
  updatedAt: Date;
}

const FiscalPeriodSchema = new Schema<IFiscalPeriod>({
  periodName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isClosed: { type: Boolean, default: false }
});

const FiscalYearSchema = new Schema<IFiscalYear>(
  {
    orgId: { type: String, required: true, index: true },
    yearName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
    periods: [FiscalPeriodSchema]
  },
  { timestamps: true }
);

// Prevent overlapping years in the same org (basic unique index)
FiscalYearSchema.index({ orgId: 1, yearName: 1 }, { unique: true });

export const FiscalYear = mongoose.model<IFiscalYear>('FiscalYear', FiscalYearSchema);
