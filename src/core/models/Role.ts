import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    orgId: string;
    name: string;
    permissions: string[];
    isActive: boolean;
}

const RoleSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
