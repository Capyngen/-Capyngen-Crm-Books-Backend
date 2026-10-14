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
exports.Tax = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TaxComponentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    isCompound: { type: Boolean, default: false },
    accountId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true }
});
const TaxSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    regime: { type: String, required: true, default: 'Global' },
    name: { type: String, required: true },
    taxType: { type: String, enum: ['Sales', 'Purchase', 'Both'], default: 'Both' },
    components: [TaxComponentSchema],
    totalRate: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
// To ensure a tax name is unique within an organization
TaxSchema.index({ orgId: 1, name: 1 }, { unique: true });
exports.Tax = mongoose_1.default.models.Tax || mongoose_1.default.model('Tax', TaxSchema);
