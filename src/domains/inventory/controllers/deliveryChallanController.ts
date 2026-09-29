import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import DeliveryChallan from '../models/DeliveryChallan';

export const createDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let challanNumber = req.body.challanNumber;
    
    if (!challanNumber) {
      let nextNum = (await DeliveryChallan.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
        const exists = await DeliveryChallan.findOne({ challanNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    const deliveryChallan = await DeliveryChallan.create({ ...req.body, challanNumber , companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    const populated = await DeliveryChallan.findById(deliveryChallan._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challans = await DeliveryChallan.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: challans });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await DeliveryChallan.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('customer')
      .populate('items.item');
      
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }
    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await DeliveryChallan.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await DeliveryChallan.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
