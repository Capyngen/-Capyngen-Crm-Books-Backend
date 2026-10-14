"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAccount = exports.createAccount = exports.getAccountById = exports.getAccounts = void 0;
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const getAccounts = async (req, res) => {
    try {
        const accounts = await ChartOfAccount_1.ChartOfAccount.find().sort({ createdAt: -1 });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAccounts = getAccounts;
const getAccountById = async (req, res) => {
    try {
        const account = await ChartOfAccount_1.ChartOfAccount.findById(req.params.id);
        if (!account)
            return res.status(404).json({ message: 'Not found' });
        res.json(account);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAccountById = getAccountById;
const createAccount = async (req, res) => {
    try {
        const account = new ChartOfAccount_1.ChartOfAccount(req.body);
        const saved = await account.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createAccount = createAccount;
const updateAccount = async (req, res) => {
    try {
        const updated = await ChartOfAccount_1.ChartOfAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res) => {
    try {
        const deleted = await ChartOfAccount_1.ChartOfAccount.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteAccount = deleteAccount;
