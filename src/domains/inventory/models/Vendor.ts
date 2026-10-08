import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  attention?: string;
  country?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  fax?: string;
}

export interface IContactPerson {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface ICustomField {
  label: string;
  value: string;
}

export interface IVendor extends Document {
  // Enterprise Vendor Features
  onboardingStatus?: 'Draft' | 'UnderReview' | 'Approved' | 'Rejected';
  rating?: { score: number; reviewCount: number };
  portalAccessStatus?: 'Invited' | 'Active' | 'Revoked';
  orgId?: string;
  vendorType: 'business' | 'individual';
  salutation?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  contactPersons: IContactPerson[];
  pan?: string;
  currency: string;
  accountsPayable?: string;
  openingBalance: number;
  paymentTerms?: string;
  portalAccess: boolean;
  msmeRegistered?: boolean;
  tds?: 'yes' | 'no';
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  customFields: ICustomField[];
  remarks?: string;
  status: 'Active' | 'Inactive';
  payables: number;
  unusedCredits: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  attention: String,
  country: String,
  street1: String,
  street2: String,
  city: String,
  state: String,
  zipCode: String,
  phone: String,
  fax: String
}, { _id: false });

const ContactPersonSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  designation: String
});

const CustomFieldSchema = new Schema({
  label: String,
  value: String
}, { _id: false });

const VendorSchema = new Schema({
    orgId: { type: String },
  companyId: { type: String },
  vendorType: { type: String, enum: ['business', 'individual'], default: 'business' },
  salutation: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  displayName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  mobile: { type: String },
  billingAddress: { type: AddressSchema, default: {} },
  shippingAddress: { type: AddressSchema, default: {} },
  contactPersons: { type: [ContactPersonSchema], default: [] },
  pan: { type: String },
  currency: { type: String, default: 'INR' },
  accountsPayable: { type: String },
  openingBalance: { type: Number, default: 0 },
  paymentTerms: String,
  portalAccess: { type: Boolean, default: false },
  msmeRegistered: { type: Boolean, default: false },
  tds: { type: String, enum: ['yes', 'no'], default: 'no' },
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },
  customFields: { type: [CustomFieldSchema], default: [] },
  remarks: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  payables: { type: Number, default: 0 },
  unusedCredits: { type: Number, default: 0 },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, optimisticConcurrency: true });



 mongoose.models.BooksVendor || mongoose.model<IVendor>('BooksVendor', VendorSchema);

export default mongoose.models.BooksVendor || mongoose.model<IVendor>('BooksVendor', VendorSchema);
