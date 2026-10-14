"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryChallan = exports.updateDeliveryChallan = exports.getDeliveryChallanById = exports.getDeliveryChallans = exports.createDeliveryChallan = void 0;
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
        const deliveryChallan = await DeliveryChallan_1.default.create({ ...req.body, challanNumber });
        const populated = await DeliveryChallan_1.default.findById(deliveryChallan._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createDeliveryChallan = createDeliveryChallan;
const getDeliveryChallans = async (req, res, next) => {
    try {
        const challans = await DeliveryChallan_1.default.find()
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
        const challan = await DeliveryChallan_1.default.findById(req.params.id)
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
        const challan = await DeliveryChallan_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
        const challan = await DeliveryChallan_1.default.findByIdAndDelete(req.params.id);
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
