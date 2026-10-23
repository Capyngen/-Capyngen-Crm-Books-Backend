import mongoose, { Schema, Document } from 'mongoose';

export interface IMachine extends Document {
  orgId?: string;
  name: string;
  status: 'Available' | 'Maintenance' | 'Offline';
  capacityPerHour: number;
}

const MachineSchema: Schema = new Schema({
  orgId: { type: String },
  name: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Maintenance', 'Offline'], default: 'Available' },
  capacityPerHour: { type: Number, required: true, default: 1 }
}, { timestamps: true });

const MachineModel = mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema, 'machines');
if (!mongoose.models.BooksMachine) {
  try { mongoose.model('BooksMachine', MachineSchema, 'machines'); } catch (e) {}
}
export default MachineModel;
