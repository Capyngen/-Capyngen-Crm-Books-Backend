import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  orgId?: string;
  name: string;
  code: string;
  address: string;
  bins: { code: string; description: string }[];
  status: 'Active' | 'Inactive';
}

const WarehouseSchema: Schema = new Schema({
  orgId: { type: String },
  name: { type: String, required: true },
  code: { type: String, required: true },
  address: { type: String },
  bins: [{ code: { type: String }, description: { type: String } }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model<IWarehouse>('BooksWarehouse', WarehouseSchema);
