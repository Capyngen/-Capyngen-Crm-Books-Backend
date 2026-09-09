import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationLog extends Document {
  orgId: string;
  profileId: string;
  module: string;
  status: 'Success' | 'Failure';
  message?: string;
  triggeredBy: string;
}

const AutomationLogSchema = new Schema({
  orgId: { type: String, required: true },
  profileId: { type: String, required: true },
  module: { type: String, required: true },
  status: { type: String, enum: ['Success', 'Failure'], required: true },
  message: { type: String },
  triggeredBy: { type: String, default: 'SYSTEM_CRON' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export default mongoose.models.AutomationLog || mongoose.model<IAutomationLog>('AutomationLog', AutomationLogSchema);
