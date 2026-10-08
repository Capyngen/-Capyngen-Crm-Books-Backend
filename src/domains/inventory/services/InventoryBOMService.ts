import mongoose from 'mongoose';
import Item from '../models/Item';

export class InventoryBOMService {
    /**
     * Assembles a Kit/BOM item. 
     * This increases the stock of the Kit, while proportionately deducting the stock of its raw materials (BOM items).
     */
    static async assembleKit(kitItemId: string | mongoose.Types.ObjectId, quantityToAssemble: number, warehouseId?: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const kit = await Item.findById(kitItemId).session(session);
            if (!kit || kit.itemClass !== 'Kit' || !kit.bom || kit.bom.length === 0) {
                throw new Error('Item is not a valid Kit or lacks a BOM definition');
            }

            // 1. Deduct Raw Materials
            for (const component of kit.bom) {
                const requiredQty = component.quantity * quantityToAssemble;
                const rawMaterial = await Item.findById(component.itemId).session(session);
                
                if (!rawMaterial) throw new Error(`BOM component ${component.itemId} not found`);
                if (rawMaterial.stock < requiredQty) {
                    throw new Error(`Insufficient stock for component ${rawMaterial.name}. Need ${requiredQty}, have ${rawMaterial.stock}`);
                }

                rawMaterial.stock -= requiredQty;
                await rawMaterial.save({ session });
            }

            // 2. Increase Kit Stock
            kit.stock += quantityToAssemble;
            await kit.save({ session });

            await session.commitTransaction();
            return kit;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
