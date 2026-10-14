"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = require("../../../core/events/eventBus");
const Item_1 = __importDefault(require("../../inventory/models/Item"));
// When a Delivery Challan is created, stock leaves the warehouse
eventBus_1.eventBus.on(eventBus_1.EVENTS.DELIVERY_CHALLAN_CREATED, async (payload) => {
    const { challan } = payload;
    if (!challan.items)
        return;
    for (const line of challan.items) {
        if (line.item) {
            await Item_1.default.findByIdAndUpdate(line.item, {
                $inc: { currentStock: -line.quantity }
            });
        }
    }
});
// When a Vendor Bill is created, stock enters the warehouse
eventBus_1.eventBus.on(eventBus_1.EVENTS.BILL_CREATED, async (payload) => {
    const { bill } = payload;
    if (!bill.items)
        return;
    for (const line of bill.items) {
        if (line.item) {
            await Item_1.default.findByIdAndUpdate(line.item, {
                $inc: { currentStock: line.quantity }
            });
        }
    }
});
