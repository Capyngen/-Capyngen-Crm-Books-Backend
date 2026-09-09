import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrderItem {
  itemId?: mongoose.Types.ObjectId;
  itemDetails?: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IPurchaseOrder extends Document {
  orgId?: string;
  vendorId: mongoose.Types.ObjectId;
  deliveryDestination: 'organization' | 'customer';
  customerId?: mongoose.Types.ObjectId;
  poNumber: string;
  referenceNumber?: string;
  orderDate: Date;
  deliveryDate?: Date;
  shipmentPreference?: string;
  paymentTerms?: string;
  lineItems: IPurchaseOrderItem[];
  
  subTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  taxWithheldType: 'none' | 'TDS' | 'TCS';
  taxWithheldAmount: number;
  adjustment: number;
  totalAmount: number;

  notes?: string;
  terms?: string;
  status: 'Draft' | 'Issued' | 'Billed' | 'Cancelled';
  currency: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema({
    orgId: { type: String },
  vendorId: { type: Schema.Types.ObjectId, ref: 'BooksVendor', required: true },
  deliveryDestination: { type: String, enum: ['organization', 'customer'], default: 'organization' },
  customerId: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
  poNumber: { type: String, required: true },
  referenceNumber: { type: String },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  shipmentPreference: { type: String },
  paymentTerms: { type: String },
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'BooksItem' },
    itemDetails: { type: String },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  terms: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Issued', 'Billed', 'Cancelled'],
    default: 'Issued'
  },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksPurchaseOrder || mongoose.model<IPurchaseOrder>('BooksPurchaseOrder', PurchaseOrderSchema);
