import mongoose, { Schema, Document } from 'mongoose';

export interface IStockBalance extends Document {
  orgId: string;
  warehouseId: string;
  itemId: mongoose.Types.ObjectId | string;
  itemSku: string;
  location: string; // 11 zones: INBOUND_DOCK, QC_AREA, STORAGE_BINS, PICK_CART, PACKING_TABLE, OUTBOUND_BAY, TRANSIT_INTERWH, SCRAP_BAY, WIP_SHOP_FLOOR, RETURN_DOCK, CUSTOMER_TRANSIT, RTO_TRANSIT
  binCode: string;
  status: string;   // 9 states: AVAILABLE, QC_HOLD, QUARANTINE, ADJ_HOLD, EXCESS_HOLD, UNDER_INVESTIGATION, RETURN_PENDING_QC, REWORK, DAMAGED
  batchId?: string;
  serialNumber?: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalValuation: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockBalanceSchema = new Schema<IStockBalance>(
  {
    orgId: { type: String, required: true, index: true },
    warehouseId: { type: String, required: true, index: true },
    itemId: { type: Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    binCode: { type: String, default: 'MAIN_BIN', index: true },
    status: { type: String, required: true, index: true },
    batchId: { type: String, index: true },
    serialNumber: { type: String, index: true },
    quantity: { type: Number, required: true, default: 0 },
    uom: { type: String, default: 'pcs' },
    unitCost: { type: Number, default: 0 },
    totalValuation: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Unique compound index on item, warehouse, location, bin, status, batch and serial
StockBalanceSchema.index(
  {
    orgId: 1,
    warehouseId: 1,
    itemId: 1,
    location: 1,
    binCode: 1,
    status: 1,
    batchId: 1,
    serialNumber: 1
  },
  { unique: true }
);

export default mongoose.models.StockBalance ||
  mongoose.model<IStockBalance>('StockBalance', StockBalanceSchema);
