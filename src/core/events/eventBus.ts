import { EventEmitter } from 'events';

class AsyncEventEmitter extends EventEmitter {
  /**
   * Emit events asynchronously and wait for all listeners to finish.
   * If any listener throws an error, it rejects the promise and the error bubbles up.
   */
  async emitAsync(event: string | symbol, ...args: any[]): Promise<boolean> {
    const listeners = this.listeners(event);
    if (listeners.length === 0) return false;

    for (const listener of listeners) {
      await listener.apply(this, args);
    }
    return true;
  }
}

export const eventBus = new AsyncEventEmitter();

// Define Event Constants
export const EVENTS = {
  // Billing
  INVOICE_CREATED: 'INVOICE_CREATED',
  PAYMENT_RECEIVED_CREATED: 'PAYMENT_RECEIVED_CREATED',
  CREDIT_NOTE_CREATED: 'CREDIT_NOTE_CREATED',
  
  // Inventory
  BILL_CREATED: 'BILL_CREATED',
  DELIVERY_CHALLAN_CREATED: 'DELIVERY_CHALLAN_CREATED',
  INVENTORY_ADJUSTMENT_CREATED: 'INVENTORY_ADJUSTMENT_CREATED',
  VENDOR_PAYMENT_MADE: 'VENDOR_PAYMENT_MADE',
  // Integrations
  PAYROLL_FINALIZED: 'PAYROLL_FINALIZED',
  CRM_DEAL_WON: 'CRM_DEAL_WON'
};
