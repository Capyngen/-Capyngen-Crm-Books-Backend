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

export interface IBillingCustomer extends Document {
  orgId?: string;
  customerType: 'business' | 'individual';
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
  accountsReceivable?: string;
  openingBalance: number;
  paymentTerms?: string;
  portalAccess: boolean;
  customFields: ICustomField[];
  remarks?: string;
  status: 'Active' | 'Inactive';
  receivables: number;
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

const BillingCustomerSchema = new Schema({
  customerType: { type: String, enum: ['business', 'individual'], default: 'business' },
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
  accountsReceivable: { type: String },
  openingBalance: { type: Number, default: 0 },
  paymentTerms: { type: String },
  portalAccess: { type: Boolean, default: false },
  customFields: { type: [CustomFieldSchema], default: [] },
  remarks: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  receivables: { type: Number, default: 0 },
  unusedCredits: { type: Number, default: 0 },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.model<IBillingCustomer>('BillingCustomer', BillingCustomerSchema, 'billing_customers');
