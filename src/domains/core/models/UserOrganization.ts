import mongoose, { Schema, Document } from 'mongoose';
import './Role';

export interface IUserOrganization extends Document {
  email: string;
  userId?: mongoose.Types.ObjectId;
  orgId: string;
  roleId?: mongoose.Types.ObjectId;
  isAdmin: boolean;
  status: 'Invited' | 'Active' | 'Inactive';
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserOrganizationSchema = new Schema<IUserOrganization>(
  {
    email: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orgId: { type: String, required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ['Invited', 'Active', 'Inactive'], default: 'Invited' },
    name: { type: String }, // Stored during invite
  },
  { timestamps: true }
);

// A user/email can only have one mapping per organization
UserOrganizationSchema.index({ email: 1, orgId: 1 }, { unique: true });

export const UserOrganization = mongoose.models.UserOrganization || mongoose.model<IUserOrganization>('UserOrganization', UserOrganizationSchema);
export default UserOrganization;
