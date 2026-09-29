import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import Quote from '../models/Quote';

export const createQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let quoteNumber = req.body.quoteNumber;
    
    if (!quoteNumber) {
      let nextNum = (await Quote.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        quoteNumber = `QUO-${String(nextNum).padStart(5, '0')}`;
        const exists = await Quote.findOne({ quoteNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    const quote = await Quote.create({ ...req.body, quoteNumber , companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    const populated = await Quote.findById(quote._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quotes = await Quote.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    next(error);
  }
};

export const getQuoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('customer')
      .populate('items.item');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

export const updateQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quote = await Quote.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, { new: true })
      .populate('customer')
      .populate('items.item');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

export const deleteQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quote = await Quote.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
