import mongoose, { Schema, Document } from 'mongoose';

export interface ITransferOrderItem {
  item: mongoose.Types.ObjectId;
  quantity: number;
  fromBin?: string;
  toBin?: string;
  serialNumbers?: string[];
  batchNo?: string;
  unitCost?: number;
}

export interface ITransferOrder extends Document {
  companyId?: string;
  orgId?: string;
  transferNumber: string;
  date: Date;
  fromWarehouse: mongoose.Types.ObjectId;
  toWarehouse: mongoose.Types.ObjectId;
  status: 'Draft' | 'In Transit' | 'Received' | 'Cancelled';
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  dispatchDate?: Date;
  receivedDate?: Date;
  carrier?: string;
  trackingNumber?: string;
  shippingNotes?: string;
  items: ITransferOrderItem[];
  dispatchedBy?: string;
  receivedBy?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransferOrderSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  transferNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  fromWarehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
  toWarehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
  status: { type: String, enum: ['Draft', 'In Transit', 'Received', 'Cancelled'], default: 'Draft' },
  approvalStatus: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Draft' },
  dispatchDate: { type: Date },
  receivedDate: { type: Date },
  carrier: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  shippingNotes: { type: String, default: '' },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    fromBin: { type: String, default: '' },
    toBin: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    batchNo: { type: String, default: '' },
    unitCost: { type: Number, default: 0 }
  }],
  dispatchedBy: { type: String },
  receivedBy: { type: String },
  createdBy: { type: String }
}, { timestamps: true });

TransferOrderSchema.index({ companyId: 1, transferNumber: 1 });
TransferOrderSchema.index({ orgId: 1, transferNumber: 1 });

const TransferOrderModel = mongoose.models.TransferOrder || mongoose.model<ITransferOrder>('TransferOrder', TransferOrderSchema, 'transferorders');
if (!mongoose.models.BooksTransferOrder) {
  try { mongoose.model('BooksTransferOrder', TransferOrderSchema, 'transferorders'); } catch (e) {}
}
export default TransferOrderModel;
