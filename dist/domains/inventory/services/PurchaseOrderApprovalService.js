"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderApprovalService = void 0;
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
class PurchaseOrderApprovalService {
    /**
     * Approves a PO based on hierarchical limits.
     * <= 50,000 => Auto-Approved (ManagerApproved)
     * 50,000 - 250,000 => Requires Manager
     * > 250,000 => Requires Director
     */
    static async requestApproval(poId, requestedBy) {
        const po = await PurchaseOrder_1.default.findById(poId);
        if (!po)
            throw new Error('Purchase Order not found');
        const amount = Number(po.totalAmount || 0);
        if (amount <= 50000) {
            po.approvalStatus = 'ManagerApproved';
            po.status = 'Issued';
            po.notes = (po.notes || '') + `\n[SYSTEM]: Auto-approved (within ₹50,000 threshold) by ${requestedBy}`;
        }
        else {
            po.approvalStatus = 'Pending';
            po.notes = (po.notes || '') + `\n[SYSTEM]: Submitted for hierarchical approval by ${requestedBy}`;
        }
        await po.save();
        return po;
    }
    static async approveByManager(poId, managerId) {
        const po = await PurchaseOrder_1.default.findById(poId);
        if (!po)
            throw new Error('Purchase Order not found');
        po.approvalStatus = 'ManagerApproved';
        po.status = 'Issued';
        po.notes = (po.notes || '') + `\n[SYSTEM]: Approved by Procurement Manager (${managerId})`;
        await po.save();
        return po;
    }
    static async approveByDirector(poId, directorId) {
        const po = await PurchaseOrder_1.default.findById(poId);
        if (!po)
            throw new Error('Purchase Order not found');
        po.approvalStatus = 'DirectorApproved';
        po.status = 'Issued';
        po.notes = (po.notes || '') + `\n[SYSTEM]: Approved by Finance Director (${directorId})`;
        await po.save();
        return po;
    }
    /**
     * Blanket PO logic: Logs utilization against a blanket PO.
     */
    static async utilizeBlanketPO(blanketPoId, amount) {
        const po = await PurchaseOrder_1.default.findById(blanketPoId);
        if (!po || po.poType !== 'Blanket' || !po.blanketDetails) {
            throw new Error('Valid Blanket PO not found');
        }
        if (po.blanketDetails.validUntil && new Date() > new Date(po.blanketDetails.validUntil)) {
            throw new Error('Blanket PO has expired');
        }
        if ((po.blanketDetails.amountUtilized || 0) + amount > (po.blanketDetails.maxAmount || 0)) {
            throw new Error('Release amount exceeds Blanket PO contract ceiling');
        }
        po.blanketDetails.amountUtilized = (po.blanketDetails.amountUtilized || 0) + amount;
        if (po.blanketDetails.amountUtilized >= po.blanketDetails.maxAmount) {
            po.status = 'Billed';
        }
        await po.save();
        return po;
    }
}
exports.PurchaseOrderApprovalService = PurchaseOrderApprovalService;
