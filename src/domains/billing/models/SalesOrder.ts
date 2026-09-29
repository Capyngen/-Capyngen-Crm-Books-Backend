import mongoose, { Document, Schema } from 'mongoose';

export interface ISalesOrderItem {
  item: mongoose.Types.ObjectId;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ISalesOrder extends Document {
  orgId?: string;
  salesOrderNumber: string;
  customer: mongoose.Types.ObjectId;
  salesOrderDate: Date;
  expectedShipmentDate?: Date;
  status: 'Draft' | 'Open' | 'Closed' | 'Cancelled' | 'Invoiced';
  referenceNumber?: string;
  items: ISalesOrderItem[];
  subTotal: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  discount?: number;
  taxWithheldType?: 'TDS' | 'TCS' | 'none';
  taxWithheldAmount?: number;
  adjustment?: number;
  taxTotal?: number;
  total: number;
  
  salesperson?: string;
  deliveryMethod?: string;
  paymentTerms?: string;
  attachments?: string[];
  
  notes?: string;
  terms?: string;
  createdBy: string;
}

const SalesOrderItemSchema = new Schema<ISalesOrderItem>({
  item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const SalesOrderSchema = new Schema<ISalesOrder>({
    orgId: { type: String },
  salesOrderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
  salesOrderDate: { type: Date, required: true, default: Date.now },
  expectedShipmentDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Draft', 'Open', 'Closed', 'Cancelled', 'Invoiced'],
    default: 'Open'
  },
  referenceNumber: { type: String },
  items: [SalesOrderItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  
  salesperson: { type: String },
  deliveryMethod: { type: String },
  paymentTerms: { type: String },
  attachments: [{ type: String }],

  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

export default mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);
