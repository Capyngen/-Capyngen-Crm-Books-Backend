import { Request, Response, NextFunction } from 'express';
import Putaway from '../models/Putaway';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getPutaways = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { ...tenantFilter };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.vendor) {
      filter.$or = [
        { vendor: req.query.vendor },
        { vendorName: { $regex: String(req.query.vendor), $options: 'i' } }
      ];
    }
    if (req.query.search) {
      const s = String(req.query.search);
      filter.$or = [
        { putawayNumber: { $regex: s, $options: 'i' } },
        { grnNumber: { $regex: s, $options: 'i' } },
        { itemName: { $regex: s, $options: 'i' } },
        { vendorName: { $regex: s, $options: 'i' } },
        { targetBin: { $regex: s, $options: 'i' } },
        { batchNumber: { $regex: s, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || '50'), 10));
    const skip = (page - 1) * limit;

    const [docs, totalCount] = await Promise.all([
      Putaway.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Putaway.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Putaways retrieved successfully',
      data: docs,
      count: docs.length,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPutawayById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await Putaway.findOne(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Putaway order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const createPutaway = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const orgId =
      tenantFilter.orgId ||
      tenantFilter.companyId ||
      (req as any).org?._id?.toString() ||
      (req as any).user?.companyId ||
      'SYSTEM';

    let putawayNumber = req.body.putawayNumber || req.body.order;
    if (!putawayNumber) {
      const count = await Putaway.countDocuments({
        $or: [{ orgId }, { companyId: orgId }]
      });
      putawayNumber = `PW-${String(count + 1).padStart(5, '0')}`;
    }

    const doc = await Putaway.create({
      ...req.body,
      putawayNumber,
      order: putawayNumber,
      quantity: Number(req.body.quantity ?? req.body.qty ?? 1),
      vendorName: req.body.vendorName || req.body.vendor,
      itemName: req.body.itemName || req.body.item,
      companyId: orgId,
      orgId: orgId.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Putaway created successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

export const completePutaway = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await Putaway.findOneAndUpdate(
      filter,
      {
        $set: {
          status: 'Put Away Completed',
          completedAt: new Date(),
          completedBy: (req as any).user?.name || (req as any).user?.email || 'User'
        }
      },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Putaway not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Putaway marked Completed',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

export const updatePutaway = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await Putaway.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Putaway not found' });
    }
    res.status(200).json({ success: true, message: 'Putaway updated', data: doc });
  } catch (error) {
    next(error);
  }
};

export const deletePutaway = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await Putaway.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Putaway not found' });
    }
    res.status(200).json({ success: true, message: 'Putaway deleted' });
  } catch (error) {
    next(error);
  }
};
