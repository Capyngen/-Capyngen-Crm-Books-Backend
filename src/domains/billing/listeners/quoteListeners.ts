import { eventBus, EVENTS } from '../../../core/events/eventBus';
import Quote from '../models/Quote';

// Listen to CRM_DEAL_WON and generate a Draft Quote
eventBus.on(EVENTS.CRM_DEAL_WON, async (payload: { dealData: any, companyId: string }) => {
  const { dealData, companyId } = payload;
  const { customerId, dealName, dealAmount } = dealData;

  const quote = new Quote({
    companyId,
    customer: customerId,
    quoteNumber: `QT-CRM-${Date.now().toString().slice(-4)}`,
    quoteDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    referenceNumber: dealName,
    items: [
      {
        item: null, // Custom line item
        quantity: 1,
        rate: dealAmount,
        amount: dealAmount,
        description: `Generated from CRM Deal: ${dealName}`
      }
    ],
    subTotal: dealAmount,
    total: dealAmount,
    status: 'Draft' // Leaves it in Draft for the accountant to review and send
  });

  await quote.save();
});
