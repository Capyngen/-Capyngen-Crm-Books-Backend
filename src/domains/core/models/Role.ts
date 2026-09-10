import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  orgId: string;
  name: string;
  description?: string;
  parentRoleId?: mongoose.Types.ObjectId;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    parentRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    permissions: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Prevent duplicate role names within the same org
RoleSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
export default Role;
