const fs = require('fs');
const path = require('path');

const modelsDir = 'D:\\backend\\src\\domains\\books\\models';
const controllersDir = 'D:\\backend\\src\\domains\\books\\controllers';
const routesDir = 'D:\\backend\\src\\domains\\books\\routes';

// 1. Model
const modelContent = `import mongoose, { Schema, Document } from 'mongoose';

export interface IInterCompanyTransaction extends Document {
  fromOrgId: string;
  toOrgId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  transactionDate: Date;
  description: string;
  status: 'Pending' | 'Approved' | 'Posted' | 'Rejected';
  fromJournalId?: string;
  toJournalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterCompanyTransactionSchema = new Schema<IInterCompanyTransaction>({
  fromOrgId: { type: String, required: true, index: true },
  toOrgId: { type: String, required: true, index: true },
  fromAccountId: { type: String, required: true },
  toAccountId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  transactionDate: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Posted', 'Rejected'], default: 'Pending' },
  fromJournalId: { type: String },
  toJournalId: { type: String }
}, { timestamps: true });

export const InterCompanyTransaction = mongoose.model<IInterCompanyTransaction>('InterCompanyTransaction', InterCompanyTransactionSchema);
`;
fs.writeFileSync(path.join(modelsDir, 'InterCompanyTransaction.ts'), modelContent);

// 2. Controller
const controllerContent = `import { Request, Response } from 'express';
import { InterCompanyTransaction } from '../models/InterCompanyTransaction';
import { Journal } from '../models/Journal';
import mongoose from 'mongoose';

const getOrgId = (req: any) => {
  const orgIdRaw = req.org?._id || req.headers['x-org-id'];
  return orgIdRaw ? String(orgIdRaw) : undefined;
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing Org ID' });

    // Find transactions where current org is either sender or receiver
    const transactions = await InterCompanyTransaction.find({
      $or: [{ fromOrgId: orgId }, { toOrgId: orgId }]
    }).sort({ transactionDate: -1 }).lean();

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing Org ID' });

    const data = req.body;
    const transaction = new InterCompanyTransaction({
      ...data,
      fromOrgId: orgId,
      status: 'Pending'
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveTransaction = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const transaction = await InterCompanyTransaction.findById(id).session(session);
    
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'Pending') throw new Error('Only Pending transactions can be approved');

    // Generate Journal for Originating Company (fromOrgId)
    const fromJournal = new Journal({
      orgId: transaction.fromOrgId,
      date: transaction.transactionDate,
      journalNumber: 'ICT-OUT-' + Date.now(),
      notes: 'Inter-Company Transfer Out: ' + transaction.description,
      reportingMethod: 'both',
      currency: transaction.currency,
      subTotal: transaction.amount,
      total: transaction.amount,
      lineItems: [
        { account: transaction.fromAccountId, debits: 0, credits: transaction.amount, description: 'ICT Transfer Out' },
        // Dummy balancing leg to a clearing account (Assuming user has one, else we just use the same for demo)
        { account: transaction.fromAccountId, debits: transaction.amount, credits: 0, description: 'ICT Clearing' }
      ]
    });
    await fromJournal.save({ session });

    // Generate Journal for Receiving Company (toOrgId)
    const toJournal = new Journal({
      orgId: transaction.toOrgId,
      date: transaction.transactionDate,
      journalNumber: 'ICT-IN-' + Date.now(),
      notes: 'Inter-Company Transfer In: ' + transaction.description,
      reportingMethod: 'both',
      currency: transaction.currency,
      subTotal: transaction.amount,
      total: transaction.amount,
      lineItems: [
        { account: transaction.toAccountId, debits: transaction.amount, credits: 0, description: 'ICT Transfer In' },
        { account: transaction.toAccountId, debits: 0, credits: transaction.amount, description: 'ICT Clearing' }
      ]
    });
    await toJournal.save({ session });

    transaction.status = 'Posted';
    transaction.fromJournalId = fromJournal._id.toString();
    transaction.toJournalId = toJournal._id.toString();
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(transaction);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
`;
fs.writeFileSync(path.join(controllersDir, 'interCompanyController.ts'), controllerContent);

// 3. Routes
const routesContent = `import express from 'express';
import { getTransactions, createTransaction, approveTransaction } from '../controllers/interCompanyController';

export const interCompanyRoutes = express.Router();

interCompanyRoutes.get('/', getTransactions);
interCompanyRoutes.post('/', createTransaction);
interCompanyRoutes.post('/:id/approve', approveTransaction);
`;
fs.writeFileSync(path.join(routesDir, 'interCompanyRoutes.ts'), routesContent);

console.log('Backend files generated successfully.');
