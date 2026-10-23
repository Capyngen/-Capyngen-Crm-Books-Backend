import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesReturnItem {
  itemId?: mongoose.Types.ObjectId | string;
  name: string;
  sku?: string;
  quantity: number;
  rate?: number;
  condition?: 'Restockable (Good)' | 'Damaged / Scrap' | 'Warranty Repair';
  restockBin?: string;
}

export interface ISalesReturn extends Document {
  companyId?: any;
  orgId?: string;
  rmaNumber: string;
  salesOrderId?: mongoose.Types.ObjectId | string;
  salesOrderNumber?: string;
  customerId?: mongoose.Types.ObjectId | string;
  customerName?: string;
  warehouseId?: mongoose.Types.ObjectId | string;
  warehouseName?: string;
  items: ISalesReturnItem[];
  reason?: string;
  condition: 'Restockable (Good)' | 'Damaged / Scrap' | 'Warranty Repair';
  status: 'RMA Requested' | 'RMA Approved' | 'Received & Restocked' | 'Credit Note Issued' | 'Rejected';
  returnDate: Date;
  creditNoteId?: mongoose.Types.ObjectId | string;
  creditNoteNumber?: string;
  notes?: string;
  receivedBy?: string;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalesReturnSchema: Schema = new Schema({
  companyId: { type: Schema.Types.Mixed, index: true },
  orgId: { type: String, index: true },
  rmaNumber: { type: String, required: true },
  salesOrderId: { type: Schema.Types.Mixed, ref: 'SalesOrder' },
  salesOrderNumber: { type: String, default: '' },
  customerId: { type: Schema.Types.Mixed, ref: 'ClientAccount' },
  customerName: { type: String, default: '' },
  warehouseId: { type: Schema.Types.Mixed, ref: 'Warehouse' },
  warehouseName: { type: String, default: '' },
  items: [{
    itemId: { type: Schema.Types.Mixed },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, default: 0 },
    condition: { 
      type: String, 
      enum: ['Restockable (Good)', 'Damaged / Scrap', 'Warranty Repair'], 
      default: 'Restockable (Good)' 
    },
    restockBin: { type: String, default: 'BIN-RESTOCK-01' }
  }],
  reason: { type: String, default: 'Customer Return' },
  condition: { 
    type: String, 
    enum: ['Restockable (Good)', 'Damaged / Scrap', 'Warranty Repair'], 
    default: 'Restockable (Good)' 
  },
  status: { 
    type: String, 
    enum: ['RMA Requested', 'RMA Approved', 'Received & Restocked', 'Credit Note Issued', 'Rejected'], 
    default: 'RMA Approved' 
  },
  returnDate: { type: Date, default: Date.now },
  creditNoteId: { type: Schema.Types.Mixed, ref: 'CreditNote' },
  creditNoteNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
  receivedBy: { type: String, default: '' },
  receivedAt: { type: Date }
}, { timestamps: true, strict: false });

SalesReturnSchema.index({ orgId: 1, rmaNumber: 1 });
SalesReturnSchema.index({ orgId: 1, status: 1 });

const SalesReturnModel = mongoose.models.SalesReturn || mongoose.model<ISalesReturn>('SalesReturn', SalesReturnSchema, 'sales_returns');
export default SalesReturnModel;
