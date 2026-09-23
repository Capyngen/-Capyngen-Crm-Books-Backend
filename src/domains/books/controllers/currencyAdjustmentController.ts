import { Request, Response } from 'express';
import CurrencyAdjustment from '../models/CurrencyAdjustment';

export const getCurrencyAdjustments = async (req: Request, res: Response) => {
  try {
    const adjustments = await CurrencyAdjustment.find().sort({ date: -1, createdAt: -1 });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCurrencyAdjustmentById = async (req: Request, res: Response) => {
  try {
    const adjustment = await CurrencyAdjustment.findById(req.params.id);
    if (!adjustment) return res.status(404).json({ message: 'Not found' });
    res.json(adjustment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const adjustment = new CurrencyAdjustment(req.body);
    const saved = await adjustment.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const updated = await CurrencyAdjustment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const deleted = await CurrencyAdjustment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
