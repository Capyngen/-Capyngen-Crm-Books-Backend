import mongoose, { Schema, Document } from 'mongoose';

export interface IRouting extends Document {
  orgId?: string;
  name: string;
  operations: { stepNumber: number; name: string; machineId: mongoose.Types.ObjectId; expectedTimeMinutes: number }[];
}

const RoutingSchema: Schema = new Schema({
  orgId: { type: String },
  name: { type: String, required: true },
  operations: [{
    stepNumber: { type: Number },
    name: { type: String },
    machineId: { type: Schema.Types.ObjectId, ref: 'BooksMachine' },
    expectedTimeMinutes: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model<IRouting>('BooksRouting', RoutingSchema);
