import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  ownerId: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  location: string;
  state: string;
  currency: string;
  language: string;
  timeZone: string;
  gstRegistered: boolean;
  gstNumber?: string;
  fiscalYearStartMonth?: number;
  fiscalYearStartDay?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String },
    currency: { type: String },
    language: { type: String },
    timeZone: { type: String },
    gstRegistered: { type: Boolean, default: false },
    gstNumber: { type: String },
    fiscalYearStartMonth: { type: Number, default: 4 },
    fiscalYearStartDay: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
