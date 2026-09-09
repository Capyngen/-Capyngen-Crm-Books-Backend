import mongoose, { Schema, Document } from 'mongoose';
export interface IExceptionLog extends Document {
  orgId: string;
  module: string;
  errorMessage: string;
  context: string;
}
const ExceptionLogSchema = new Schema({
  orgId: { type: String, required: true },
  module: { type: String, required: true },
  errorMessage: { type: String, required: true },
  context: { type: String }
}, { timestamps: true });
export default mongoose.models.ExceptionLog || mongoose.model<IExceptionLog>('ExceptionLog', ExceptionLogSchema);