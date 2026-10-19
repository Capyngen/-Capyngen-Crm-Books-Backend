"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = require("../../../core/events/eventBus");
const Quote_1 = __importDefault(require("../models/Quote"));
const mongoose_1 = __importDefault(require("mongoose"));
// Listen to CRM_DEAL_WON and generate a Draft Quote
eventBus_1.eventBus.on(eventBus_1.EVENTS.CRM_DEAL_WON, async (payload) => {
    try {
        const { dealData, companyId } = payload;
        const { customerId, dealName, dealAmount } = dealData;
        const quoteNumber = `QT-CRM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const custId = mongoose_1.default.Types.ObjectId.isValid(customerId)
            ? new mongoose_1.default.Types.ObjectId(customerId)
            : new mongoose_1.default.Types.ObjectId();
        const quote = new Quote_1.default({
            companyId,
            orgId: companyId,
            customer: custId,
            quoteNumber,
            quoteDate: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            referenceNumber: dealName || 'Inbound CRM Deal',
            items: [
                {
                    description: `Generated from CRM Deal: ${dealName || 'Won Deal'}`,
                    quantity: 1,
                    rate: Number(dealAmount) || 0,
                    amount: Number(dealAmount) || 0
                }
            ],
            subTotal: Number(dealAmount) || 0,
            total: Number(dealAmount) || 0,
            status: 'Draft',
            approvalStatus: 'Draft'
        });
        await quote.save();
        console.log(`[Integration] Successfully generated Quote ${quoteNumber} from CRM deal "${dealName}"`);
    }
    catch (error) {
        console.error(`[Integration Error] Failed to generate Quote from CRM Deal:`, error.message);
        throw error;
    }
});
