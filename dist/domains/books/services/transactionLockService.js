"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransactionLock = exports.TransactionLockError = void 0;
const TransactionLock_1 = __importDefault(require("../models/TransactionLock"));
class TransactionLockError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TransactionLockError';
    }
}
exports.TransactionLockError = TransactionLockError;
/**
 * Validates if a transaction can be created/modified/deleted based on transaction locking rules.
 * @param orgId The organization ID
 * @param module 'Sales' | 'Purchases' | 'Banking' | 'Accountant'
 * @param transactionDate The date of the transaction
 */
const validateTransactionLock = async (orgId, module, transactionDate) => {
    if (!orgId || !module || !transactionDate)
        return;
    const tDate = new Date(transactionDate);
    const lock = await TransactionLock_1.default.findOne({ orgId }).lean();
    if (!lock)
        return; // No locks configured
    let isLocked = false;
    let lockReason = '';
    // 1. Check Master All Lock
    if (lock.allLockDate && tDate < new Date(lock.allLockDate)) {
        isLocked = true;
        lockReason = lock.reason || 'Closed for all transactions';
    }
    // 2. Check Module Lock
    if (!isLocked) {
        let moduleLockDate = null;
        switch (module) {
            case 'Sales':
                moduleLockDate = lock.salesLockDate;
                break;
            case 'Purchases':
                moduleLockDate = lock.purchasesLockDate;
                break;
            case 'Banking':
                moduleLockDate = lock.bankingLockDate;
                break;
            case 'Accountant':
                moduleLockDate = lock.accountantLockDate;
                break;
        }
        if (moduleLockDate && tDate < new Date(moduleLockDate)) {
            isLocked = true;
            lockReason = lock.reason || `Closed for ${module} module`;
        }
    }
    // 3. If locked, check Partial Unlocks
    if (isLocked && lock.partialUnlocks && lock.partialUnlocks.length > 0) {
        const activePartialUnlock = lock.partialUnlocks.find(pu => pu.module === module &&
            tDate >= new Date(pu.startDate) &&
            tDate <= new Date(pu.endDate));
        if (activePartialUnlock) {
            isLocked = false; // Transaction falls in a partially unlocked window
        }
    }
    if (isLocked) {
        throw new TransactionLockError(`This transaction is locked and cannot be modified. Reason: ${lockReason}`);
    }
};
exports.validateTransactionLock = validateTransactionLock;
