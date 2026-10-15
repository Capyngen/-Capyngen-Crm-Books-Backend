import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface IBooksDocument extends MongooseDoc {
  orgId: string;
  name: string;
  type: 'PDF' | 'Image' | 'Spreadsheet' | 'Other';
  folder: string;
  size: string;
  fileSizeInBytes?: number;
  fileUrl: string;
  status: 'Unprocessed' | 'Converted to Bill' | 'Converted to Expense' | 'Archived';
  amount?: number;
  entityType?: 'Bill' | 'Invoice' | 'Expense' | 'Payment' | 'Manual';
  entityId?: mongoose.Types.ObjectId;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IBooksDocument>({
  orgId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Image', 'Spreadsheet', 'Other'], default: 'Other' },
  folder: { type: String, default: 'Inbox', index: true },
  size: { type: String, default: '0 KB' },
  fileSizeInBytes: { type: Number, default: 0 },
  fileUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Unprocessed', 'Converted to Bill', 'Converted to Expense', 'Archived'], 
    default: 'Unprocessed' 
  },
  amount: { type: Number },
  entityType: { type: String },
  entityId: { type: Schema.Types.ObjectId },
  createdBy: { type: String, default: 'User' }
}, { timestamps: true });

export default mongoose.models.BooksDocument || mongoose.model<IBooksDocument>('BooksDocument', DocumentSchema);
