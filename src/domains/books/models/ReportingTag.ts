import mongoose, { Schema, Document } from 'mongoose';

export interface IReportingTag extends Document {
  orgId: string;
  tagName: string;
  tagValue: string;
}

const ReportingTagSchema = new Schema({
  orgId: { type: String, required: true },
  tagName: { type: String, required: true },
  tagValue: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.ReportingTag || mongoose.model<IReportingTag>('ReportingTag', ReportingTagSchema);
