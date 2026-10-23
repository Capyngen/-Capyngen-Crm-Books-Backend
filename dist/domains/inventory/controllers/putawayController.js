"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePutaway = exports.updatePutaway = exports.completePutaway = exports.createPutaway = exports.getPutawayById = exports.getPutaways = void 0;
const Putaway_1 = __importDefault(require("../models/Putaway"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getPutaways = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { ...tenantFilter };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.vendor) {
            filter.$or = [
                { vendor: req.query.vendor },
                { vendorName: { $regex: String(req.query.vendor), $options: 'i' } }
            ];
        }
        if (req.query.search) {
            const s = String(req.query.search);
            filter.$or = [
                { putawayNumber: { $regex: s, $options: 'i' } },
                { grnNumber: { $regex: s, $options: 'i' } },
                { itemName: { $regex: s, $options: 'i' } },
                { vendorName: { $regex: s, $options: 'i' } },
                { targetBin: { $regex: s, $options: 'i' } },
                { batchNumber: { $regex: s, $options: 'i' } }
            ];
        }
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
        const limit = Math.max(1, parseInt(String(req.query.limit || '50'), 10));
        const skip = (page - 1) * limit;
        const [docs, totalCount] = await Promise.all([
            Putaway_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Putaway_1.default.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            message: 'Putaways retrieved successfully',
            data: docs,
            count: docs.length,
            meta: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPutaways = getPutaways;
const getPutawayById = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Putaway_1.default.findOne(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Putaway order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getPutawayById = getPutawayById;
const createPutaway = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const orgId = tenantFilter.orgId ||
            tenantFilter.companyId ||
            req.org?._id?.toString() ||
            req.user?.companyId ||
            'SYSTEM';
        let putawayNumber = req.body.putawayNumber || req.body.order;
        if (!putawayNumber) {
            const count = await Putaway_1.default.countDocuments({
                $or: [{ orgId }, { companyId: orgId }]
            });
            putawayNumber = `PW-${String(count + 1).padStart(5, '0')}`;
        }
        const doc = await Putaway_1.default.create({
            ...req.body,
            putawayNumber,
            order: putawayNumber,
            quantity: Number(req.body.quantity ?? req.body.qty ?? 1),
            vendorName: req.body.vendorName || req.body.vendor,
            itemName: req.body.itemName || req.body.item,
            companyId: orgId,
            orgId: orgId.toString()
        });
        res.status(201).json({
            success: true,
            message: 'Putaway created successfully',
            data: doc
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPutaway = createPutaway;
const completePutaway = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Putaway_1.default.findOneAndUpdate(filter, {
            $set: {
                status: 'Put Away Completed',
                completedAt: new Date(),
                completedBy: req.user?.name || req.user?.email || 'User'
            }
        }, { new: true });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Putaway not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Putaway marked Completed',
            data: doc
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completePutaway = completePutaway;
const updatePutaway = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Putaway_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Putaway not found' });
        }
        res.status(200).json({ success: true, message: 'Putaway updated', data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePutaway = updatePutaway;
const deletePutaway = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Putaway_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Putaway not found' });
        }
        res.status(200).json({ success: true, message: 'Putaway deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePutaway = deletePutaway;
