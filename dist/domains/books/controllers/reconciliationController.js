"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmMatch = exports.getReconciliationFeeds = void 0;
const BankStatementLine_1 = require("../models/BankStatementLine");
const BankingRule_1 = require("../models/BankingRule");
// Mock function to simulate AI parsing of bank feeds
const getAIAccountSuggestion = (desc) => {
    const input = desc.toLowerCase();
    if (input.includes('aws') || input.includes('google'))
        return { name: 'IT & Cloud Services', confidence: 95 };
    if (input.includes('uber') || input.includes('lyft'))
        return { name: 'Travel & Transportation', confidence: 92 };
    if (input.includes('wework') || input.includes('rent'))
        return { name: 'Rent Expense', confidence: 88 };
    if (input.includes('stripe') || input.includes('fee'))
        return { name: 'Bank Fees', confidence: 85 };
    return { name: 'General Expenses', confidence: 60 };
};
const getReconciliationFeeds = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { bankAccountId } = req.query;
        const filter = { orgId, reconciliationStatus: 'Unreconciled' };
        if (bankAccountId)
            filter.bankAccountId = bankAccountId;
        let feeds = await BankStatementLine_1.BankStatementLine.find(filter).sort({ date: -1 }).limit(50).lean();
        // In a real ERP, rules are pre-calculated on import. We'll simulate applying them on the fly here for demo purposes.
        const rules = await BankingRule_1.BankingRule.find({ orgId, isActive: true }).sort({ order: 1 }).lean();
        // Simulate auto-matching (Rule Engine + AI)
        const enrichedFeeds = feeds.map(feed => {
            let matchedRule = null;
            // 1. Rule Engine Matching
            for (const rule of rules) {
                // Very basic rule simulation: check Description Contains
                const hasMatch = rule.conditions.some((c) => c.field === 'Description' && c.operator === 'Contains' && feed.description.toLowerCase().includes(c.value.toLowerCase()));
                if (hasMatch) {
                    matchedRule = rule;
                    break;
                }
            }
            if (matchedRule) {
                feed.suggestedMatch = {
                    matchType: 'Rule',
                    confidence: 100,
                    ruleId: matchedRule._id,
                    accountId: matchedRule.assignAccountId,
                    message: `Matched by Rule: ${matchedRule.ruleName}`
                };
            }
            else {
                // 2. AI Matching
                const aiSuggestion = getAIAccountSuggestion(feed.description);
                feed.suggestedMatch = {
                    matchType: 'AI',
                    confidence: aiSuggestion.confidence,
                    message: `AI suggests: ${aiSuggestion.name}`
                };
            }
            return feed;
        });
        res.json(enrichedFeeds);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getReconciliationFeeds = getReconciliationFeeds;
const confirmMatch = async (req, res) => {
    try {
        const { feedId } = req.params;
        const { accountId, createAs } = req.body; // e.g., createAs = 'Expense'
        const feed = await BankStatementLine_1.BankStatementLine.findById(feedId);
        if (!feed)
            return res.status(404).json({ message: 'Feed not found' });
        // In a real system, we would create the Expense/Journal document here and link its ID.
        // We will just mark it reconciled for the UI demo.
        feed.reconciliationStatus = 'Reconciled';
        feed.matchedTransactionModel = createAs || 'Journal';
        await feed.save();
        res.json(feed);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.confirmMatch = confirmMatch;
