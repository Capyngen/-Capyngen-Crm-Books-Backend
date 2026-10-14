"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = require("../../../core/events/eventBus");
const Quote_1 = __importDefault(require("../models/Quote"));
// Listen to CRM_DEAL_WON and generate a Draft Quote
eventBus_1.eventBus.on(eventBus_1.EVENTS.CRM_DEAL_WON, async (payload) => {
    const { dealData, companyId } = payload;
    const { customerId, dealName, dealAmount } = dealData;
    const quote = new Quote_1.default({
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
