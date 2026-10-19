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
const WarehouseBinSchema = new mongoose_1.Schema({
    binCode: { type: String, required: true },
    name: { type: String, required: true },
    zone: { type: String, default: 'Zone A' },
    aisle: { type: String, default: '' },
    rack: { type: String, default: '' },
    shelf: { type: String, default: '' },
    capacityVolume: { type: Number, default: 0 },
    capacityWeight: { type: Number, default: 0 },
    isQuarantine: { type: Boolean, default: false },
    isDamaged: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Full', 'Maintenance'], default: 'Active' }
}, { _id: true });
const WarehouseSchema = new mongoose_1.Schema({
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: {
        type: String,
        enum: ['Central Hub', 'Regional Distribution', 'Transit', 'Quarantine', 'Damaged', 'Production Staging', 'Standard'],
        default: 'Standard'
    },
    branchId: { type: String },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '' },
    managerName: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    bins: [WarehouseBinSchema],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
WarehouseSchema.index({ companyId: 1, code: 1 });
WarehouseSchema.index({ orgId: 1, code: 1 });
exports.default = mongoose_1.default.models.BooksWarehouse || mongoose_1.default.model('BooksWarehouse', WarehouseSchema);
