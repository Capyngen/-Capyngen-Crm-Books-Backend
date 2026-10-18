import { Request, Response, NextFunction } from 'express';
import Shipment from '../models/Shipment';
import { requestContext } from '../../../context';

export const getShipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await Shipment.find(filter)
      .populate('items.item', 'name sku unit salesRate')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await Shipment.findOne(filter).populate('items.item', 'name sku unit salesRate');
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;

    let shipmentNumber = req.body.shipmentNumber;
    if (!shipmentNumber) {
      const count = await Shipment.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      shipmentNumber = `SHP-${String(count + 1).padStart(5, '0')}`;
    }

    let packageNumber = req.body.packageNumber;
    if (!packageNumber) {
      const count = await Shipment.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      packageNumber = `PKG-${String(count + 1).padStart(5, '0')}`;
    }

    const payload = {
      ...req.body,
      shipmentNumber,
      packageNumber,
      companyId: orgId,
      orgId
    };

    const doc = await Shipment.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await Shipment.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await Shipment.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

export const integrateCarrier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const doc = await Shipment.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const carrier = req.body.carrier || 'BlueDart Express';
    const trackingNo = req.body.trackingNumber || ('BD' + Math.floor(100000000 + Math.random() * 900000000));
    const trackingUrl = carrier.toLowerCase().includes('fedex')
      ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNo}`
      : carrier.toLowerCase().includes('delhivery')
      ? `https://www.delhivery.com/track/package/${trackingNo}`
      : `https://www.bluedart.com/tracking?track=${trackingNo}`;

    doc.carrier = carrier;
    doc.trackingNumber = trackingNo;
    doc.trackingUrl = trackingUrl;
    doc.shippingCost = Number(req.body.shippingCost || 250);
    doc.shippingMethod = req.body.shippingMethod || doc.shippingMethod || 'Air Express';
    doc.status = 'Shipped';
    doc.shippingLabelUrl = `/api/v1/books/inventory/shipments/${doc._id}/label`;

    await doc.save();
    res.status(200).json({ 
      success: true, 
      data: doc, 
      message: `Carrier ${carrier} booked successfully. Tracking: ${trackingNo}` 
    });
  } catch (error) { next(error); }
};

export const getPackingSlip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const doc = await Shipment.findOne(filter).populate('items.item', 'name sku unit');
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const packingSlip = {
      shipmentNumber: doc.shipmentNumber,
      packageNumber: doc.packageNumber,
      date: doc.date,
      customerName: doc.customerName,
      deliveryAddress: doc.deliveryAddress,
      carrier: doc.carrier,
      trackingNumber: doc.trackingNumber,
      weight: doc.weight,
      dimensions: doc.dimensions,
      items: doc.items.map((li: any) => ({
        itemName: li.item?.name || 'Item',
        sku: li.item?.sku || '',
        quantity: li.quantity,
        unit: li.unit || 'pcs',
        serialNumbers: li.serialNumbers || [],
        batchNo: li.batchNo || ''
      })),
      printedAt: new Date(),
      status: doc.status
    };

    res.status(200).json({ success: true, data: packingSlip });
  } catch (error) { next(error); }
};
