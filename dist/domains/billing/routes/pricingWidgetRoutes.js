"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? {
            $or: [
                { orgId },
                { orgId: orgId.toString() },
                { companyId: orgId },
                { companyId: orgId.toString() },
                { orgId: { $exists: false } }
            ]
        } : {};
        const items = await mongoose_1.default.connection.collection('pricingwidgets').find(filter).toArray();
        res.json({ success: true, count: items.length, data: items });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const orgId = req.org?._id;
        const doc = {
            ...req.body,
            orgId,
            companyId: orgId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await mongoose_1.default.connection.collection('pricingwidgets').insertOne(doc);
        res.status(201).json({ success: true, data: { ...doc, _id: result.insertedId } });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = String(req.params.id);
        const doc = await mongoose_1.default.connection.collection('pricingwidgets').findOne({
            $or: [
                { _id: mongoose_1.default.Types.ObjectId.isValid(id) ? new mongoose_1.default.Types.ObjectId(id) : null },
                { _id: id },
                { id: id }
            ]
        });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Widget not found' });
        res.json({ success: true, data: doc });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = String(req.params.id);
        const query = {
            $or: [
                { _id: mongoose_1.default.Types.ObjectId.isValid(id) ? new mongoose_1.default.Types.ObjectId(id) : null },
                { _id: id },
                { id: id }
            ]
        };
        await mongoose_1.default.connection.collection('pricingwidgets').updateOne(query, {
            $set: { ...req.body, updatedAt: new Date() }
        });
        const updated = await mongoose_1.default.connection.collection('pricingwidgets').findOne(query);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = String(req.params.id);
        await mongoose_1.default.connection.collection('pricingwidgets').deleteOne({
            $or: [
                { _id: mongoose_1.default.Types.ObjectId.isValid(id) ? new mongoose_1.default.Types.ObjectId(id) : null },
                { _id: id },
                { id: id }
            ]
        });
        res.json({ success: true, data: {} });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
