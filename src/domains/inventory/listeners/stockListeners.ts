import { eventBus, EVENTS } from '../../../core/events/eventBus';
import Item from '../../inventory/models/Item';

// When a Delivery Challan is created, stock leaves the warehouse
(eventBus as any).on(EVENTS.DELIVERY_CHALLAN_CREATED, async (payload: { challan: any, companyId: string }) => {
  const { challan } = payload;
  if (!challan.items) return;

  for (const line of challan.items) {
    if (line.item) {
      await Item.findByIdAndUpdate(line.item, {
        $inc: { currentStock: -line.quantity }
      });
    }
  }
});

// When a Vendor Bill is created, stock enters the warehouse
(eventBus as any).on(EVENTS.BILL_CREATED, async (payload: { bill: any, companyId: string }) => {
  const { bill } = payload;
  if (!bill.items) return;

  for (const line of bill.items) {
    if (line.item) {
      await Item.findByIdAndUpdate(line.item, {
        $inc: { currentStock: line.quantity }
      });
    }
  }
});
