import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  orgId: string;
  userId: string;
  module: string;
  action: 'Create' | 'Update' | 'Delete' | 'Void';
  recordId: string | mongoose.Types.ObjectId;
  oldValues?: any;
  newValues?: any;
  batchId?: string;
  reason?: string;
}

const AuditLogSchema = new Schema({
  orgId: { type: String, required: true },
  userId: { type: String, required: true },
  module: { type: String, required: true },
  action: { type: String, enum: ['Create', 'Update', 'Delete', 'Void'], required: true },
  recordId: { type: Schema.Types.Mixed, required: true },
  oldValues: { type: Schema.Types.Mixed },
  newValues: { type: Schema.Types.Mixed },
  batchId: { type: String },
  reason: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

AuditLogSchema.pre('save', async function() {
  if (!this.isNew) throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('updateOne', function() { throw new Error('Audit logs are immutable'); });
AuditLogSchema.pre('findOneAndUpdate', function() { throw new Error('Audit logs are immutable'); });
AuditLogSchema.pre('deleteOne', function() { throw new Error('Audit logs are immutable'); });
AuditLogSchema.pre('findOneAndDelete', function() { throw new Error('Audit logs are immutable'); });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
