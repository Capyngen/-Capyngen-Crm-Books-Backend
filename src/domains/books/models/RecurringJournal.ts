import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringJournalLine {
  accountId: mongoose.Types.ObjectId | string;
  debit: number;
  credit: number;
  contactId?: mongoose.Types.ObjectId | string;
}

export interface IRecurringJournal extends Document {
  orgId: string;
  profileName: string;
  repeatEvery: string;
  startsOn: Date;
  status: 'Active' | 'Stopped';
  lines: IRecurringJournalLine[];
}

const RecurringJournalLineSchema = new Schema({
  accountId: { type: Schema.Types.Mixed, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  contactId: { type: Schema.Types.Mixed }
});

const RecurringJournalSchema = new Schema({
  orgId: { type: String, required: true },
  profileName: { type: String, required: true },
  repeatEvery: { type: String, required: true },
  startsOn: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Stopped'], default: 'Active' },
  lines: [RecurringJournalLineSchema]
}, { timestamps: true });

export default mongoose.models.RecurringJournal || mongoose.model<IRecurringJournal>('RecurringJournal', RecurringJournalSchema);
