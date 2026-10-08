import mongoose from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder';

export class PurchaseOrderApprovalService {
    /**
     * Approves a PO based on hierarchical limits.
     * < $1000 => Auto-Approved (ManagerApproved)
     * $1000 - $5000 => Requires Manager
     * > $5000 => Requires Director
     */
    static async requestApproval(poId: string | mongoose.Types.ObjectId, requestedBy: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const po = await PurchaseOrder.findById(poId).session(session);
            if (!po) throw new Error('Purchase Order not found');

            if (po.total < 1000) {
                po.approvalStatus = 'ManagerApproved';
                po.status = 'Open'; // It's approved and open for vendors
                po.notes = (po.notes || '') + '\\n[SYSTEM]: Auto-approved (under $1000)';
            } else {
                po.approvalStatus = 'Pending';
                po.notes = (po.notes || '') + '\\n[SYSTEM]: Pending higher-level approval';
            }

            await po.save({ session });
            await session.commitTransaction();
            return po;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    static async approveByManager(poId: string | mongoose.Types.ObjectId, managerId: string) {
        const po = await PurchaseOrder.findById(poId);
        if (!po) throw new Error('Purchase Order not found');
        if (po.total > 5000) throw new Error('Cannot be approved by Manager. Requires Director approval.');
        
        po.approvalStatus = 'ManagerApproved';
        po.status = 'Open';
        po.notes = (po.notes || '') + `\\n[SYSTEM]: Approved by Manager ${managerId}`;
        await po.save();
        return po;
    }

    static async approveByDirector(poId: string | mongoose.Types.ObjectId, directorId: string) {
        const po = await PurchaseOrder.findById(poId);
        if (!po) throw new Error('Purchase Order not found');
        
        po.approvalStatus = 'DirectorApproved';
        po.status = 'Open';
        po.notes = (po.notes || '') + `\\n[SYSTEM]: Approved by Director ${directorId}`;
        await po.save();
        return po;
    }

    /**
     * Blanket PO logic: Logs utilization against a blanket PO.
     */
    static async utilizeBlanketPO(blanketPoId: string | mongoose.Types.ObjectId, amount: number) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const po = await PurchaseOrder.findById(blanketPoId).session(session);
            if (!po || po.poType !== 'Blanket' || !po.blanketDetails) {
                throw new Error('Valid Blanket PO not found');
            }

            if (new Date() > new Date(po.blanketDetails.validUntil)) {
                throw new Error('Blanket PO has expired');
            }

            if (po.blanketDetails.amountUtilized + amount > po.blanketDetails.maxAmount) {
                throw new Error('Amount exceeds Blanket PO max limit');
            }

            po.blanketDetails.amountUtilized += amount;
            
            // If we've reached 100%, optionally close it
            if (po.blanketDetails.amountUtilized === po.blanketDetails.maxAmount) {
                po.status = 'Closed';
            }

            await po.save({ session });
            await session.commitTransaction();
            return po;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
