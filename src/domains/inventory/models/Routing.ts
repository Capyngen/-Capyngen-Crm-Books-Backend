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

const RoutingModel = mongoose.models.Routing || mongoose.model<IRouting>('Routing', RoutingSchema, 'routings');
if (!mongoose.models.BooksRouting) {
  try { mongoose.model('BooksRouting', RoutingSchema, 'routings'); } catch (e) {}
}
export default RoutingModel;
