import mongoose, { Schema, Document } from 'mongoose';

export interface IStockLedger extends Document {
  companyId?: string;
  orgId?: string;
  itemId: mongoose.Types.ObjectId | string;
  itemSku: string;
  itemName: string;

  // Double-Entry Physical Locations
  fromLocation: {
    type: string; // 'VENDOR' | 'DOCK_BAY' | 'STORAGE_BIN' | 'PACKING_CART' | 'CUSTOMER' | 'SCRAP_BAY'
    code: string;
  };
  toLocation: {
    type: string;
    code: string;
  };

  // State Machine Buckets
  bucketFrom: string; // 'INBOUND_DOCK' | 'QUARANTINE_QC' | 'ACTIVE_STORAGE_BINS' | 'COMMITTED' | 'OUTBOUND_BAY' | 'DISPATCHED_COGS'
  bucketTo: string;

  quantity: number;
  valuationRate: number;
  totalValuation: number;

  // Commercial / Operational Traceability
  referenceDocType: 'PURCHASE_ORDER' | 'PURCHASE_RECEIVE' | 'PUTAWAY' | 'SALES_ORDER' | 'PACKAGE' | 'SHIPMENT' | 'ADJUSTMENT' | 'MOVE_ORDER' | 'SALES_RETURN';
  referenceDocNumber: string;
  batchNumber?: string;
  serialNumbers?: string[];

  // Audit Actor
  actor?: {
    userId?: string;
    name?: string;
    role?: string;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockLedgerSchema: Schema = new Schema(
  {
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    itemId: { type: Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String, default: '', index: true },
    itemName: { type: String, default: '' },
    fromLocation: {
      type: { type: String, default: 'STORAGE_BIN' },
      code: { type: String, default: 'MAIN_WAREHOUSE' }
    },
    toLocation: {
      type: { type: String, default: 'STORAGE_BIN' },
      code: { type: String, default: 'MAIN_WAREHOUSE' }
    },
    bucketFrom: { type: String, default: 'ACTIVE_STORAGE_BINS' },
    bucketTo: { type: String, default: 'ACTIVE_STORAGE_BINS' },
    quantity: { type: Number, required: true },
    valuationRate: { type: Number, default: 0 },
    totalValuation: { type: Number, default: 0 },
    referenceDocType: {
      type: String,
      enum: ['PURCHASE_ORDER', 'PURCHASE_RECEIVE', 'PUTAWAY', 'SALES_ORDER', 'PACKAGE', 'SHIPMENT', 'ADJUSTMENT', 'MOVE_ORDER', 'SALES_RETURN'],
      required: true
    },
    referenceDocNumber: { type: String, required: true, index: true },
    batchNumber: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    actor: {
      userId: { type: String },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'Operator' }
    },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

StockLedgerSchema.index({ orgId: 1, itemId: 1, timestamp: -1 });
StockLedgerSchema.index({ orgId: 1, referenceDocNumber: 1 });

const StockLedger = mongoose.models.StockLedger || mongoose.model<IStockLedger>('StockLedger', StockLedgerSchema, 'stockledgers');

export { StockLedger };
export default StockLedger;
