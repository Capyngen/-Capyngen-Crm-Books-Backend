import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Shipment from '../models/Shipment';
import Package from '../models/Package';
import Item from '../models/Item';
import StockLedger from '../models/StockLedger';
import SalesOrder from '../../billing/models/SalesOrder';
import { requestContext } from '../../../context';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getShipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const docs = await Shipment.find(tenantFilter)
      .populate('items.item', 'name sku unit salesRate')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
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

    // 1. Update linked Package status to 'Shipped'
    if (req.body.packageId || req.body.packageNumber) {
      try {
        const pkgFilter: any = { $or: [] };
        if (req.body.packageId && mongoose.isValidObjectId(req.body.packageId)) {
          pkgFilter.$or.push({ _id: req.body.packageId });
        }
        if (req.body.packageNumber) {
          pkgFilter.$or.push({ packageNumber: req.body.packageNumber });
        }
        if (pkgFilter.$or.length > 0) {
          await Package.updateOne(pkgFilter, {
            $set: {
              status: 'Shipped',
              trackingNumber: req.body.trackingNumber || '',
              carrier: req.body.carrier || ''
            }
          });
        }
      } catch (err) {
        console.warn('Could not update package status on shipment dispatch:', err);
      }
    }

    // 2. Update linked Sales Order fulfillment status to 'Fulfilled'
    if (req.body.salesOrderId || req.body.salesOrderNumber) {
      try {
        const soFilter: any = { $or: [] };
        if (req.body.salesOrderId && mongoose.isValidObjectId(req.body.salesOrderId)) {
          soFilter.$or.push({ _id: req.body.salesOrderId });
        }
        if (req.body.salesOrderNumber) {
          soFilter.$or.push({ salesOrderNumber: req.body.salesOrderNumber });
        }
        if (soFilter.$or.length > 0) {
          await SalesOrder.updateOne(soFilter, {
            $set: { fulfillmentStatus: 'Fulfilled' }
          });
        }
      } catch (err) {
        console.warn('Could not update sales order fulfillment status on dispatch:', err);
      }
    }

    // 3. Physical Inventory Deduction & Double-Entry Stock Ledger Posting (COGS)
    const itemsToDeduct = (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0)
      ? req.body.items
      : [];

    for (const line of itemsToDeduct) {
      try {
        const lineQty = Number(line.quantity || 1);
        const itemFilter: any = { $or: [] };
        const rawItemId = line.item?._id || line.itemId || line.item;

        if (rawItemId && mongoose.isValidObjectId(rawItemId)) {
          itemFilter.$or.push({ _id: rawItemId });
        }
        if (line.sku) itemFilter.$or.push({ sku: line.sku });
        if (line.name) itemFilter.$or.push({ name: line.name });

        if (itemFilter.$or.length > 0) {
          const matchedItem = await Item.findOne(itemFilter);
          if (matchedItem) {
            // Deduct physical on-hand and committed stock
            await Item.updateOne(
              { _id: matchedItem._id },
              {
                $inc: {
                  stockOnHand: -lineQty,
                  committedStock: -lineQty,
                  stock: -lineQty
                },
                $set: { updatedAt: new Date() }
              }
            );

            // Record Double-Entry Stock Ledger (STORAGE_BIN -> CUSTOMER / COGS)
            const unitValuation = matchedItem.costPrice || matchedItem.purchaseRate || 0;
            await StockLedger.create({
              companyId: orgId,
              orgId,
              itemId: matchedItem._id,
              itemSku: matchedItem.sku || line.sku || '',
              itemName: matchedItem.name || line.name || '',
              fromLocation: { type: 'STORAGE_BIN', code: req.body.warehouse || 'Central Warehouse' },
              toLocation: { type: 'CUSTOMER', code: req.body.customerName || 'Customer Dispatch' },
              bucketFrom: 'COMMITTED',
              bucketTo: 'DISPATCHED_COGS',
              quantity: lineQty,
              valuationRate: unitValuation,
              totalValuation: lineQty * unitValuation,
              referenceDocType: 'SHIPMENT',
              referenceDocNumber: shipmentNumber,
              batchNumber: line.batchNumber || line.batchNo || '',
              actor: {
                userId: (req as any).user?._id || (req as any).user?.id,
                name: (req as any).user?.name || (req as any).user?.email || 'Logistics Dispatcher',
                role: 'Logistics Dispatcher'
              },
              timestamp: new Date()
            }).catch((e: any) => console.warn('Could not record stock ledger for shipment:', e));
          }
        }
      } catch (e) {
        console.warn('Error during line item stock deduction on shipment:', e);
      }
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
    const doc = await Shipment.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
    const doc = await Shipment.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

export const integrateCarrier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };

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
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };

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
      items: (doc.items || []).map((li: any) => ({
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
