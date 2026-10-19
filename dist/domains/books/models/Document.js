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
const DocumentSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    module: { type: String, enum: ['books', 'billing', 'inventory'], default: 'books', index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'Image', 'Spreadsheet', 'Other'], default: 'Other' },
    folder: { type: String, default: 'Inbox', index: true },
    size: { type: String, default: '0 KB' },
    fileSizeInBytes: { type: Number, default: 0 },
    fileUrl: { type: String, default: '' },
    status: {
        type: String,
        enum: ['Unprocessed', 'Converted to Bill', 'Converted to Expense', 'Archived'],
        default: 'Unprocessed'
    },
    amount: { type: Number },
    entityType: { type: String },
    entityId: { type: mongoose_1.Schema.Types.ObjectId },
    createdBy: { type: String, default: 'User' }
}, { timestamps: true });
exports.default = mongoose_1.default.models.BooksDocument || mongoose_1.default.model('BooksDocument', DocumentSchema);
