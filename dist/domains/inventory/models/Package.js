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
const PackageSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    orgId: { type: String, index: true },
    packageNumber: { type: String, required: true },
    salesOrderId: { type: mongoose_1.Schema.Types.Mixed, ref: 'SalesOrder' },
    salesOrderNumber: { type: String, default: '' },
    customerId: { type: mongoose_1.Schema.Types.Mixed, ref: 'ClientAccount' },
    customer: { type: String, default: '' },
    warehouseId: { type: mongoose_1.Schema.Types.Mixed, ref: 'Warehouse' },
    warehouse: { type: String, default: '' },
    packageDate: { type: Date, default: Date.now },
    weightKg: { type: Number, default: 1 },
    dimensions: { type: String, default: 'Standard Box' },
    carrier: { type: String, default: 'Standard Express' },
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Draft', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Packed' },
    items: [{
            itemId: { type: mongoose_1.Schema.Types.Mixed },
            name: { type: String, default: '' },
            sku: { type: String, default: '' },
            quantity: { type: Number, default: 1 },
            unit: { type: String, default: 'pcs' }
        }],
    itemsPacked: { type: Number, default: 0 }
}, { timestamps: true, strict: false });
const PackageModel = mongoose_1.default.models.Package || mongoose_1.default.model('Package', PackageSchema, 'packages');
exports.default = PackageModel;
