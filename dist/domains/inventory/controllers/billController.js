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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBillOCR = exports.deleteBill = exports.updateBill = exports.getBillById = exports.getBills = exports.createBill = void 0;
const context_1 = require("../../../context");
const Bill_1 = __importDefault(require("../models/Bill"));
const createBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.create({ ...req.body, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        await doc.populate('items.item');
        await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.BILL_CREATED, { bill: doc, companyId: doc.companyId }));
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createBill = createBill;
const getBills = async (req, res, next) => {
    try {
        const docs = await Bill_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBills = getBills;
const getBillById = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('vendorId', 'displayName')
            .populate('lineItems.itemId', 'name')
            .populate('lineItems.customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBillById = getBillById;
const updateBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteBill = deleteBill;
// @desc    Process Bill OCR
// @route   POST /api/v1/books/purchases/bills/ocr
const processBillOCR = async (req, res, next) => {
    try {
        const mockOCRData = {
            vendorName: 'Acme Corp',
            billNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 1500.00,
            lineItems: [
                { name: 'Scanned Item 1', quantity: 10, rate: 100, amount: 1000 },
                { name: 'Scanned Item 2', quantity: 5, rate: 100, amount: 500 }
            ]
        };
        res.status(200).json({ success: true, data: mockOCRData });
    }
    catch (error) {
        next(error);
    }
};
exports.processBillOCR = processBillOCR;
