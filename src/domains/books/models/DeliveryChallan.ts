import mongoose, { Document, Schema } from 'mongoose';
import { IInvoiceItem } from './Invoice'; // Reuse item interface

export interface IDeliveryChallan extends Document {
  challanNumber: string;
  customer: mongoose.Types.ObjectId;
  referenceNumber?: string;
  challanDate: Date;
  challanType?: string; // Supply of Liquid Gas, Job Work, Supply on Approval, Others
  status: 'Draft' | 'Open' | 'Delivered' | 'Returned' | 'Closed';
  
  items: IInvoiceItem[];
  subTotal: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  discount?: number;
  adjustment?: number;
  total: number;
  
  notes?: string;
  terms?: string;
  attachments?: string[];
  createdBy: string;
}

const DeliveryChallanItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const DeliveryChallanSchema = new Schema<IDeliveryChallan>({
  challanNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  referenceNumber: { type: String },
  challanDate: { type: Date, required: true, default: Date.now },
  challanType: { type: String, enum: ['Supply of Liquid Gas', 'Job Work', 'Supply on Approval', 'Others'] },
  status: { 
    type: String, 
    enum: ['Draft', 'Open', 'Delivered', 'Returned', 'Closed'],
    default: 'Draft'
  },
  
  items: [DeliveryChallanItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  
  notes: { type: String },
  terms: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IDeliveryChallan>('DeliveryChallan', DeliveryChallanSchema);
