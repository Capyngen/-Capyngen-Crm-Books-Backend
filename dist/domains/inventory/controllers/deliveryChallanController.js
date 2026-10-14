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
exports.deleteDeliveryChallan = exports.updateDeliveryChallan = exports.getDeliveryChallanById = exports.getDeliveryChallans = exports.createDeliveryChallan = void 0;
const context_1 = require("../../../context");
const DeliveryChallan_1 = __importDefault(require("../models/DeliveryChallan"));
const createDeliveryChallan = async (req, res, next) => {
    try {
        let challanNumber = req.body.challanNumber;
        if (!challanNumber) {
            let nextNum = (await DeliveryChallan_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
                const exists = await DeliveryChallan_1.default.findOne({ challanNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const deliveryChallan = await DeliveryChallan_1.default.create({ ...req.body, challanNumber, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        const populated = await DeliveryChallan_1.default.findById(deliveryChallan._id).populate('customer').populate('items.item');
        await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.DELIVERY_CHALLAN_CREATED, { challan: populated, companyId: populated?.companyId }));
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createDeliveryChallan = createDeliveryChallan;
const getDeliveryChallans = async (req, res, next) => {
    try {
        const challans = await DeliveryChallan_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: challans });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryChallans = getDeliveryChallans;
const getDeliveryChallanById = async (req, res, next) => {
    try {
        const challan = await DeliveryChallan_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('items.item');
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryChallanById = getDeliveryChallanById;
const updateDeliveryChallan = async (req, res, next) => {
    try {
        const challan = await DeliveryChallan_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDeliveryChallan = updateDeliveryChallan;
const deleteDeliveryChallan = async (req, res, next) => {
    try {
        const challan = await DeliveryChallan_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDeliveryChallan = deleteDeliveryChallan;
