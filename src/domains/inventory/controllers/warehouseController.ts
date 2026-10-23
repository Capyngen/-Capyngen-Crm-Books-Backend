import { Request, Response, NextFunction } from 'express';
import Warehouse from '../models/Warehouse';
import Item from '../models/Item';
import { requestContext } from '../../../context';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const docs = await Warehouse.find(tenantFilter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Warehouse.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const payload = {
      ...req.body,
      companyId: orgId,
      orgId
    };
    const doc = await Warehouse.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Warehouse.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Warehouse.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

// @desc Get items and stock levels in a specific warehouse
// @route GET /api/v1/books/inventory/warehouses/:id/stock
export const getWarehouseStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const warehouseId = req.params.id;

    const filter: any = {
      $or: [
        { 'warehouseStock.warehouse': warehouseId },
        { defaultWarehouseId: warehouseId }
      ]
    };
    if (orgId) {
      filter.$and = [{ $or: [{ companyId: orgId }, { orgId }] }];
    }

    const items = await Item.find(filter).select('name sku unit salesRate purchaseRate stock warehouseStock trackingType');

    const stockSummary = items.map(item => {
      const whStock = item.warehouseStock?.find(
        (ws: any) => ws.warehouse?.toString() === warehouseId
      );
      const onHand = whStock ? whStock.stockOnHand : (item.stock || 0);
      const committed = whStock ? whStock.committedStock : 0;
      const available = Math.max(0, onHand - committed);
      return {
        _id: item._id,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        salesRate: item.salesRate,
        purchaseRate: item.purchaseRate,
        stockOnHand: onHand,
        committedStock: committed,
        availableStock: available,
        bin: whStock?.bin || '',
        trackingType: item.trackingType
      };
    });

    res.status(200).json({ success: true, count: stockSummary.length, data: stockSummary });
  } catch (error) { next(error); }
};

// @desc Add a bin to a warehouse
// @route POST /api/v1/books/inventory/warehouses/:id/bins
export const addWarehouseBin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const warehouse = await Warehouse.findOne(filter);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });

    const newBin = {
      binCode: req.body.binCode,
      name: req.body.name || req.body.binCode,
      zone: req.body.zone || 'Zone A',
      aisle: req.body.aisle || '',
      rack: req.body.rack || '',
      shelf: req.body.shelf || '',
      capacityVolume: req.body.capacityVolume || 0,
      capacityWeight: req.body.capacityWeight || 0,
      isQuarantine: Boolean(req.body.isQuarantine),
      isDamaged: Boolean(req.body.isDamaged),
      status: req.body.status || 'Active'
    };

    warehouse.bins.push(newBin as any);
    await warehouse.save();

    res.status(201).json({ success: true, data: warehouse });
  } catch (error) { next(error); }
};
