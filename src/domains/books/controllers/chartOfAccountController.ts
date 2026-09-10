import { Request, Response } from 'express';
import { ChartOfAccount } from '../models/ChartOfAccount';
import Invoice from '../models/Invoice';
import Bill from '../models/Bill';
import Expense from '../models/Expense';

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await ChartOfAccount.find().sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await ChartOfAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const account = new ChartOfAccount(req.body);
    const saved = await account.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const updated = await ChartOfAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const deleted = await ChartOfAccount.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
