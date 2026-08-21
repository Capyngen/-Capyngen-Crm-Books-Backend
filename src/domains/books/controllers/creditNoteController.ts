import { Request, Response, NextFunction } from 'express';
import CreditNote from '../models/CreditNote';

export const createCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let creditNoteNumber = req.body.creditNoteNumber;
    
    if (!creditNoteNumber) {
      let nextNum = (await CreditNote.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        creditNoteNumber = `CN-${String(nextNum).padStart(5, '0')}`;
        const exists = await CreditNote.findOne({ creditNoteNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    const creditNote = await CreditNote.create({ ...req.body, creditNoteNumber });
    const populated = await CreditNote.findById(creditNote._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getCreditNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNotes = await CreditNote.find()
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: creditNotes });
  } catch (error) {
    next(error);
  }
};

export const getCreditNoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id)
      .populate('customer')
      .populate('items.item');
      
    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }
    res.status(200).json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

export const updateCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }

    res.status(200).json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

export const deleteCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findByIdAndDelete(req.params.id);
    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
