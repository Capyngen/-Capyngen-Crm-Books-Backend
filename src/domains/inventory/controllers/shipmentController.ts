import { Request, Response, NextFunction } from 'express';
import Shipment from '../models/Shipment';
import { requestContext } from '@/core/middlewares/requestContext';

export const getShipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter = orgId ? { orgId } : {};
    const docs = await Shipment.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Shipment.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    if (orgId) req.body.orgId = orgId;
    const doc = await Shipment.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Shipment.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Shipment.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

export const integrateCarrier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Shipment.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.carrier = req.body.carrier || 'FedEx API';
    doc.trackingNumber = 'TRK-' + Math.floor(1000000 + Math.random() * 9000000);
    doc.shippingCost = req.body.shippingCost || 15.00;
    await doc.save();
    res.status(200).json({ success: true, data: doc, message: 'Carrier integrated successfully' });
  } catch (error) { next(error); }
};
