"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJournalReport = exports.getGeneralLedger = exports.getTrialBalance = void 0;
const getTrialBalance = async (req, res, next) => {
    res.status(200).json({ success: true, data: { accounts: [], totalDebit: 0, totalCredit: 0 } });
};
exports.getTrialBalance = getTrialBalance;
const getGeneralLedger = async (req, res, next) => {
    res.status(200).json({ success: true, data: { transactions: [] } });
};
exports.getGeneralLedger = getGeneralLedger;
const getJournalReport = async (req, res, next) => {
    res.status(200).json({ success: true, data: { journals: [] } });
};
exports.getJournalReport = getJournalReport;
