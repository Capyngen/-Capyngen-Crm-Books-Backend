import mongoose, { Schema, Document } from 'mongoose';
import './Vendor';
import './Item';

export interface IBillItem {
  itemId?: mongoose.Types.ObjectId;
  account: string;
  quantity: number;
  rate: number;
  discount: number;
  customerId?: mongoose.Types.ObjectId;
  amount: number;
}

export interface IBill extends Document {
  [key: string]: any;
  taxConfigurationId?: mongoose.Types.ObjectId | string;
  branchId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  reportingTagIds?: (mongoose.Types.ObjectId | string)[];

  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  companyId?: string;
  balanceDue?: number;
  vendorId: mongoose.Types.ObjectId;
  billNumber: string;
  orderNumber?: string;
  billDate: Date;
  dueDate?: Date;
  accountsPayable: string;
  subject?: string;
  lineItems: IBillItem[];
  
  subTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  taxWithheldType: 'none' | 'TDS' | 'TCS';
  taxWithheldAmount: number;
  adjustment: number;
  totalAmount: number;

  notes?: string;
  status: 'Draft' | 'Pending Approval' | 'Open' | 'Partially Paid' | 'Paid' | 'Void';
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema({
  taxConfigurationId: { type: Schema.Types.ObjectId, ref: 'TaxConfiguration' },
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' },
  reportingTagIds: [{ type: Schema.Types.ObjectId, ref: 'ReportingTag' }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
    orgId: { type: String },
    companyId: { type: String },
    balanceDue: { type: Number },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  billNumber: { type: String, required: true },
  orderNumber: { type: String },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'BooksPurchaseOrder' },
  billDate: { type: Date, required: true },
  dueDate: { type: Date },
  accountsPayable: { type: String, default: 'Accounts Payable' },
  subject: { type: String },
  
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Product' },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    customerId: { type: Schema.Types.ObjectId, ref: 'ClientAccount' },
    amount: { type: Number, required: true }
  }],
  
  subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
  taxWithheldAmount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true },
  
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Open', 'Partially Paid', 'Paid', 'Void'],
    default: 'Open'
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Approved'
  },
  rejectionReason: { type: String },
  createdBy: { type: String }
}, { timestamps: true, optimisticConcurrency: true });

BillSchema.index({ orgId: 1, billNumber: 1 }, { unique: true });

BillSchema.pre('save', async function() {
  if (this.isNew && this.vendorId) {
    try {
      const Master = mongoose.models.BooksVendor || mongoose.models.Vendor || mongoose.model('BooksVendor');
      const record = await Master.findById(this.vendorId);
      if (record && (record as any).isActive === false) {
        throw new Error('Cannot create bill for a deactivated vendor');
      }
    } catch (err: any) {
      if (err.message?.includes('deactivated')) throw err;
    }
  }
});

export default mongoose.models.BooksBill || mongoose.model<IBill>('BooksBill', BillSchema);
