import mongoose, { Document, Schema } from 'mongoose';
import './Customer';
import '../../inventory/models/Item';

export interface IInvoiceItem {
  item: mongoose.Types.ObjectId;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  // AI Analytics & Risk
  riskScore?: number;
  riskFlags?: string[];
  taxConfigurationId?: mongoose.Types.ObjectId | string;
  branchId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  reportingTagIds?: (mongoose.Types.ObjectId | string)[];
  currency?: string;
  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  companyId?: string;
  invoiceNumber: string;
  customer: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate?: Date;
  paymentTerms?: string;
  status: 'Draft' | 'Pending Approval' | 'Open' | 'Sent' | 'Viewed' | 'Paid' | 'PartiallyPaid' | 'Void' | 'Overdue';
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  postingStatus?: 'Draft' | 'Posted' | 'Reversed';
  dispatchStatus?: 'Not Sent' | 'Sent' | 'Viewed';
  rejectionReason?: string;
  referenceNumber?: string;
  orderNumber?: string;
  salesOrderId?: mongoose.Types.ObjectId;
  accountsReceivable?: string;
  items: IInvoiceItem[];
  subTotal: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  discount?: number;
  taxWithheldType?: 'TDS' | 'TCS' | 'none';
  taxWithheldAmount?: number;
  adjustment?: number;
  taxTotal?: number;
  total: number;
  balanceDue: number;
  
  salesperson?: string;
  projectName?: string;
  projectDetails?: any;
  subject?: string;
  attachments?: string[];
  
  notes?: string;
  terms?: string;
  createdBy: string;
  // Enterprise Features
  invoiceType?: 'Standard' | 'Proforma' | 'Retainer' | 'Consolidated';
  milestoneId?: mongoose.Types.ObjectId;
  consolidatedFrom?: mongoose.Types.ObjectId[];
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const InvoiceSchema = new Schema<IInvoice>({
  taxConfigurationId: { type: Schema.Types.ObjectId, ref: 'TaxConfiguration' },
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' },
  reportingTagIds: [{ type: Schema.Types.ObjectId, ref: 'ReportingTag' }],
  currency: { type: String },
  exchangeRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100 },
  baseTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100 },
  orgId: { type: String },
  companyId: { type: String },
  invoiceNumber: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  paymentTerms: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Open', 'Sent', 'Viewed', 'Paid', 'PartiallyPaid', 'Void', 'Overdue'],
    default: 'Open'
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Approved'
  },
  postingStatus: {
    type: String,
    enum: ['Draft', 'Posted', 'Reversed'],
    default: 'Draft'
  },
  dispatchStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Viewed'],
    default: 'Not Sent'
  },
  rejectionReason: { type: String },
  referenceNumber: { type: String },
  orderNumber: { type: String },
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  accountsReceivable: { type: String, default: 'Accounts Receivable' },
  items: [InvoiceItemSchema],
  subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  balanceDue: { type: Number, required: true, default: 0 },
  
  salesperson: { type: String },
  projectName: { type: String },
  projectDetails: { type: Schema.Types.Mixed },
  subject: { type: String },
  attachments: [{ type: String }],
  
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: 'system' },
  invoiceType: { type: String, enum: ['Standard', 'Proforma', 'Retainer', 'Consolidated'], default: 'Standard' },
  milestoneId: { type: Schema.Types.ObjectId, ref: 'ProjectMilestone' },
  consolidatedFrom: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }]
}, { timestamps: true, optimisticConcurrency: true });

InvoiceSchema.index({ orgId: 1, invoiceNumber: 1 }, { unique: true });

InvoiceSchema.pre('save', async function() {
  if (this.isNew && (this as any).customer) {
    try {
      const Master = mongoose.models.ClientAccount || mongoose.models.BooksCustomer || mongoose.model('ClientAccount');
      const record = await Master.findById((this as any).customer);
      if (record && (record as any).isActive === false) {
        throw new Error('Cannot create invoice for a deactivated customer');
      }
    } catch (err: any) {
      if (err.message?.includes('deactivated')) throw err;
    }
  }
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
