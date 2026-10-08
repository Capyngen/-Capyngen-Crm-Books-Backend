import mongoose, { Schema, Document } from 'mongoose';

export interface ITransferOrder extends Document {
  orgId?: string;
  transferNumber: string;
  date: Date;
  fromWarehouse: mongoose.Types.ObjectId;
  toWarehouse: mongoose.Types.ObjectId;
  status: 'Draft' | 'In Transit' | 'Received';
  items: { item: mongoose.Types.ObjectId; quantity: number; fromBin?: string; toBin?: string }[];
}

const TransferOrderSchema: Schema = new Schema({
  orgId: { type: String },
  transferNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  fromWarehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
  toWarehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
  status: { type: String, enum: ['Draft', 'In Transit', 'Received'], default: 'Draft' },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    fromBin: { type: String },
    toBin: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<ITransferOrder>('BooksTransferOrder', TransferOrderSchema);
