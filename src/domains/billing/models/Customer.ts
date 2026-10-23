import mongoose, { Schema, Document } from 'mongoose';

export interface ICrmPrimaryContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ICrmBillingInfo {
  address?: string;
  currency?: string;
  paymentTerms?: string;
}

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
  isPrimary?: boolean;
}

export interface ICustomer extends Document {
  // Common / CRM fields
  companyId: string; // From CRM
  name: string;      // CRM uses 'name' for the display name
  legalName?: string;
  taxId?: string;
  industry?: string;
  primaryContact?: ICrmPrimaryContact;
  billingInfo?: ICrmBillingInfo;
  portalEnabled?: boolean;
  tags?: string[];
  renewalReminderStage?: string;
  notes?: string[];
  
  // Books / Billing specific fields (Extended on top of CRM)
  orgId?: string;
  tenantId?: string; // Kept for backward compatibility with Books logic
  customerType?: 'business' | 'individual';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName?: string; // Optional if we use CRM 'name'
  email?: string;
  phone?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  contactPersons?: IContactPerson[];
  portalAccess?: boolean;
  remarks?: string;
  status?: string;
  receivables?: number;
  unusedCredits?: number;
  createdBy?: string;
  isActive?: boolean;
  // Enterprise Features
  parentCustomerId?: string;
  creditLimit?: number;
  availableCredit?: number;
  portalAccessStatus?: 'Invited' | 'Active' | 'Revoked';
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
  designation: String,
  isPrimary: Boolean
}, { _id: false });

const CustomerSchema: Schema = new Schema({
  // CRM Base Fields
  companyId: { type: String },
  name: { type: String, required: true },
  legalName: { type: String },
  taxId: { type: String },
  industry: { type: String },
  primaryContact: {
    name: String,
    email: String,
    phone: String
  },
  billingInfo: {
    address: String,
    currency: String,
    paymentTerms: String
  },
  portalEnabled: { type: Boolean, default: false },
  tags: [String],
  renewalReminderStage: String,
  notes: [String],

  // Books Specific Extended Fields
  orgId: { type: String },
  tenantId: { type: String },
  customerType: { type: String, enum: ['business', 'individual'] },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  displayName: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  currency: { type: String },
  paymentTerms: { type: String },
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  contactPersons: [ContactPersonSchema],
  portalAccess: { type: Boolean, default: false },
  remarks: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  receivables: { type: Number, default: 0 },
  unusedCredits: { type: Number, default: 0 },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true },
  parentCustomerId: { type: String },
  creditLimit: { type: Number, default: 0 },
  availableCredit: { type: Number, default: 0 },
  portalAccessStatus: { type: String, enum: ['Invited', 'Active', 'Revoked'] }
}, { timestamps: true, optimisticConcurrency: true });

// CRITICAL: Point all Customer models to the SINGLE SOURCE OF TRUTH 'customers' collection
const ClientAccountModel = mongoose.models.ClientAccount || mongoose.model<ICustomer>('ClientAccount', CustomerSchema, 'customers');
if (!mongoose.models.BooksCustomer) {
  try { mongoose.model('BooksCustomer', CustomerSchema, 'customers'); } catch (e) {}
}
if (!mongoose.models.Customer) {
  try { mongoose.model('Customer', CustomerSchema, 'customers'); } catch (e) {}
}
export default ClientAccountModel;
