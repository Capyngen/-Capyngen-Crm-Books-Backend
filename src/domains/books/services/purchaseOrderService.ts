import mongoose from 'mongoose';
import PurchaseOrder from '../../inventory/models/PurchaseOrder';
import Bill from '../../inventory/models/Bill';

export class PurchaseOrderService {
  static async convertToBill(orgId: string, poId: string) {
    const po = await PurchaseOrder.findOne({ _id: poId, orgId });
    if (!po) throw new Error('Purchase Order not found');

    if (po.status === 'Billed') {
      throw new Error('Double Conversion Guard: This Purchase Order has already been converted to a Bill.');
    }

    // Simulate conversion
    const bill = new Bill({
      orgId: po.orgId,
      vendorId: po.vendorId,
      billNumber: `BILL-PO-${Date.now()}`,
      billDate: new Date(),
      subTotal: po.subTotal,
      totalAmount: po.totalAmount,
      status: 'Open'
    });
    
    await bill.save();

    // Mark PO as Billed
    po.status = 'Billed';
    await po.save();

    return bill;
  }
}
