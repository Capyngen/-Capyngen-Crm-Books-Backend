"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWithholdingTax = exports.createWithholdingTax = exports.getWithholdingTaxes = exports.deleteTax = exports.createTax = exports.getTaxes = void 0;
const Tax_1 = require("../models/Tax");
const WithholdingTax_1 = require("../models/WithholdingTax");
// --- TAX RATES & GROUPS ---
const getTaxes = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const taxes = await Tax_1.Tax.find({ orgId }).sort({ regime: 1, name: 1 }).populate('components.accountId', 'name code').lean();
        res.json(taxes);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTaxes = getTaxes;
const createTax = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { name, regime, taxType, components = [] } = req.body;
        // Calculate total effective rate
        let totalRate = 0;
        if (Array.isArray(components)) {
            for (const comp of components) {
                if (comp.isCompound) {
                    totalRate += ((100 + totalRate) * comp.rate) / 100;
                }
                else {
                    totalRate += Number(comp.rate);
                }
            }
        }
        const tax = new Tax_1.Tax({ orgId, name, regime, taxType, components, totalRate });
        const saved = await tax.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating Tax' });
    }
};
exports.createTax = createTax;
const deleteTax = async (req, res) => {
    try {
        await Tax_1.Tax.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tax deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteTax = deleteTax;
// --- WITHHOLDING TAXES (TDS/TCS) ---
const getWithholdingTaxes = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const taxes = await WithholdingTax_1.WithholdingTax.find({ orgId }).sort({ sectionCode: 1 }).populate('accountId', 'name code').lean();
        res.json(taxes);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getWithholdingTaxes = getWithholdingTaxes;
const createWithholdingTax = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const tax = new WithholdingTax_1.WithholdingTax({ ...req.body, orgId });
        const saved = await tax.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating Withholding Tax' });
    }
};
exports.createWithholdingTax = createWithholdingTax;
const deleteWithholdingTax = async (req, res) => {
    try {
        await WithholdingTax_1.WithholdingTax.findByIdAndDelete(req.params.id);
        res.json({ message: 'Withholding Tax deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteWithholdingTax = deleteWithholdingTax;
