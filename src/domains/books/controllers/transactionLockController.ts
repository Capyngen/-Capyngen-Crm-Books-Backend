import { Request, Response, NextFunction } from 'express';
import TransactionLock from '../models/TransactionLock';
import Item from '../../inventory/models/Item';
import { requestContext } from '../../../context';

// @desc    Get transaction lock configuration
// @route   GET /api/v1/books/accountant/locks
export const getTransactionLock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = requestContext.getStore();
    const orgId = store?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    let lock = await TransactionLock.findOne({ orgId });
    if (!lock) {
      lock = await TransactionLock.create({ orgId });
    }

    res.status(200).json({ success: true, data: lock });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction lock configuration
// @route   PUT /api/v1/books/accountant/locks
export const updateTransactionLock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = requestContext.getStore();
    const orgId = store?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const lock = await TransactionLock.findOneAndUpdate(
      { orgId },
      { ...req.body, lockedBy: (req as any).user?._id || 'System' },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: lock });
  } catch (error) {
    next(error);
  }
};
