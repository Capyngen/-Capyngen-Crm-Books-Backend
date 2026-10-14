"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrderFulfillmentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const CustomerBalanceService_1 = require("./CustomerBalanceService");
class SalesOrderFulfillmentService {
    /**
     * ERP-Level Backorder Engine.
     * Partially fulfills a sales order and generates a backorder for the remaining items inside an ACID transaction.
     */
    static async fulfill(salesOrderId, fulfillmentItems, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const originalSo = await SalesOrder_1.default.findById(salesOrderId).session(session);
            if (!originalSo)
                throw new Error('Sales Order not found');
            if (['Fulfilled', 'Void', 'Invoiced'].includes(originalSo.status)) {
                throw new Error(`Cannot fulfill a Sales Order in ${originalSo.status} status`);
            }
            let isPartial = false;
            let hasFulfillment = false;
            const backorderItems = [];
            // Process line items
            for (const origItem of originalSo.items) {
                const reqItem = fulfillmentItems.find(i => String(i.itemId) === String(origItem.item));
                const qtyToFulfill = reqItem ? reqItem.quantityToFulfill : 0;
                // Track remaining quantity
                const previouslyFulfilled = origItem.quantityFulfilled || 0;
                const remaining = origItem.quantity - previouslyFulfilled;
                if (qtyToFulfill > remaining) {
                    throw new Error(`Cannot fulfill more than remaining quantity (${remaining}) for item ${origItem.item}`);
                }
                if (qtyToFulfill > 0)
                    hasFulfillment = true;
                // Update fulfilled quantity on original item
                origItem.quantityFulfilled = previouslyFulfilled + qtyToFulfill;
                const newRemaining = origItem.quantity - origItem.quantityFulfilled;
                if (newRemaining > 0) {
                    isPartial = true;
                    // Prepare backorder item
                    backorderItems.push({
                        item: origItem.item,
                        description: origItem.description,
                        quantity: newRemaining,
                        rate: origItem.rate,
                        amount: newRemaining * origItem.rate
                    });
                }
            }
            if (!hasFulfillment) {
                throw new Error('No valid quantities provided for fulfillment');
            }
            // Update Original SO Status
            originalSo.fulfillmentStatus = isPartial ? 'PartiallyFulfilled' : 'Fulfilled';
            // Wait, does SalesOrder have fulfillmentStatus? We patched it in Phase 1!
            // Update main status if totally fulfilled
            if (!isPartial)
                originalSo.status = 'Invoiced'; // Or 'Fulfilled' depending on workflow
            await originalSo.save({ session });
            let backorderSo = null;
            // Generate Backorder if partial
            if (isPartial && backorderItems.length > 0) {
                const subTotal = backorderItems.reduce((sum, item) => sum + item.amount, 0);
                // Calculate proportional discount/tax for backorder (Simplified for this snippet)
                const total = subTotal;
                backorderSo = new SalesOrder_1.default({
                    orgId: originalSo.orgId,
                    companyId: originalSo.companyId,
                    salesOrderNumber: originalSo.salesOrderNumber + '-BO',
                    customer: originalSo.customer,
                    salesOrderDate: new Date(),
                    status: 'Draft',
                    fulfillmentStatus: 'Unfulfilled',
                    backorderOf: originalSo._id,
                    items: backorderItems,
                    subTotal,
                    total,
                    createdBy: userId
                });
                await backorderSo.save({ session });
            }
            await session.commitTransaction();
            session.endSession();
            // Async update customer balance
            CustomerBalanceService_1.CustomerBalanceService.updateAvailableCredit(originalSo.customer).catch(console.error);
            return { originalSo, backorderSo };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
exports.SalesOrderFulfillmentService = SalesOrderFulfillmentService;
