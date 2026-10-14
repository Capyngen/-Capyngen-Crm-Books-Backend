"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.eventBus = void 0;
const events_1 = require("events");
class AsyncEventEmitter extends events_1.EventEmitter {
    /**
     * Emit events asynchronously and wait for all listeners to finish.
     * If any listener throws an error, it rejects the promise and the error bubbles up.
     */
    async emitAsync(event, ...args) {
        const listeners = this.listeners(event);
        if (listeners.length === 0)
            return false;
        for (const listener of listeners) {
            await listener.apply(this, args);
        }
        return true;
    }
}
exports.eventBus = new AsyncEventEmitter();
// Define Event Constants
exports.EVENTS = {
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
