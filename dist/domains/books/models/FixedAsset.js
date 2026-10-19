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
exports.FixedAsset = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FixedAssetSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    assetName: { type: String, required: true },
    assetNumber: { type: String, required: true, unique: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salvageValue: { type: Number, default: 0 },
    usefulLifeMonths: { type: Number, required: true },
    depreciationMethod: { type: String, enum: ['Straight_Line', 'Declining_Balance', 'None'], required: true },
    depreciationRate: { type: Number },
    accumulatedDepreciation: { type: Number, default: 0 },
    currentBookValue: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Active', 'Disposed', 'Fully_Depreciated'], default: 'Draft' },
    disposalDate: { type: Date },
    disposalAmount: { type: Number },
    depreciationHistory: [{
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            journalId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Journal' }
        }]
}, { timestamps: true });
exports.FixedAsset = mongoose_1.default.models.FixedAsset || mongoose_1.default.model('FixedAsset', FixedAssetSchema);
exports.default = exports.FixedAsset;
