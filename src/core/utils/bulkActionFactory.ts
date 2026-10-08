import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Creates generic bulk action endpoints for any given Mongoose model.
 * It provides standardized handles for Bulk Delete and Bulk Update.
 */
export const buildBulkController = (Model: mongoose.Model<any>) => {
    return {
        // Handle POST /bulk-delete
        bulkDelete: async (req: Request, res: Response) => {
            try {
                const orgId = (req as any).org?._id;
                const { ids } = req.body;
                if (!orgId) return res.status(401).json({ success: false, message: 'Unauthorized' });
                if (!Array.isArray(ids) || ids.length === 0) {
                    return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
                }

                // Since we rely on auditPlugin for Mongoose 'findOneAndDelete', we can't use 'deleteMany' directly
                // if we want to retain full audit trails per document. We iterate and delete.
                let deletedCount = 0;
                for (const id of ids) {
                    const doc = await Model.findOneAndDelete({ _id: id, orgId });
                    if (doc) deletedCount++;
                }

                res.json({ success: true, message: `Successfully deleted ${deletedCount} record(s)` });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // Handle POST /bulk-update
        bulkUpdate: async (req: Request, res: Response) => {
            try {
                const orgId = (req as any).org?._id;
                const { ids, updates } = req.body;
                if (!orgId) return res.status(401).json({ success: false, message: 'Unauthorized' });
                if (!Array.isArray(ids) || ids.length === 0 || !updates || typeof updates !== 'object') {
                    return res.status(400).json({ success: false, message: 'Invalid payload' });
                }

                // Protect immutable fields
                delete updates._id;
                delete updates.orgId;

                let updatedCount = 0;
                for (const id of ids) {
                    const doc = await Model.findOneAndUpdate({ _id: id, orgId }, { $set: updates }, { new: true });
                    if (doc) updatedCount++;
                }

                res.json({ success: true, message: `Successfully updated ${updatedCount} record(s)` });
            } catch (error: any) {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    };
};
