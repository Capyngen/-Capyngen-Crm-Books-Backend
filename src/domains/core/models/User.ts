import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  mobile?: string;
  password?: string;
  role: string; 
  companyName?: string;
  country?: string;
  state?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String },
    role: { type: String, default: 'Business User' },
    companyName: { type: String },
    country: { type: String },
    state: { type: String },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
