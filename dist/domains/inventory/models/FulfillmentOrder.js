"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FulfillmentOrderSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    orgId: { type: String, index: true },
    waveNumber: { type: String, required: true },
    salesOrderId: { type: mongoose_1.Schema.Types.Mixed, ref: 'SalesOrder' },
    salesOrderNumber: { type: String, required: true },
    customerName: { type: String, default: '' },
    warehouseName: { type: String, default: 'Main Central Warehouse' },
    pickBin: { type: String, default: 'BIN-A1' },
    itemsCount: { type: Number, default: 1 },
    priority: { type: String, enum: ['Urgent', 'High', 'Standard'], default: 'High' },
    stage: { type: String, enum: ['To Pick', 'Picked', 'Packed', 'Shipped'], default: 'To Pick' },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    assignedTo: { type: String, default: '' }
}, { timestamps: true, strict: false });
FulfillmentOrderSchema.index({ orgId: 1, waveNumber: 1 });
FulfillmentOrderSchema.index({ orgId: 1, stage: 1 });
const FulfillmentOrderModel = mongoose_1.default.models.FulfillmentOrder || mongoose_1.default.model('FulfillmentOrder', FulfillmentOrderSchema, 'fulfillment_orders');
exports.default = FulfillmentOrderModel;
