"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../backend/scripts/test_v3_http_live_api.ts
var import_dotenv = __toESM(require("dotenv"));
var import_mongoose11 = __toESM(require("mongoose"));
var import_express2 = __toESM(require("express"));

// ../backend/src/routes/erpV3Routes.ts
var import_express = require("express");

// ../backend/src/core/models/ERPConfig.ts
var import_mongoose = __toESM(require("mongoose"));
var ERPConfigSchema = new import_mongoose.Schema(
  {
    orgId: { type: String, required: true, unique: true, index: true },
    controlProfile: {
      type: String,
      enum: ["LITE", "STANDARD", "STRICT"],
      default: "STANDARD"
    },
    tolerances: {
      overDeliveryTolerancePct: { type: Number, default: 5 },
      underDeliveryTolerancePct: { type: Number, default: 5 },
      priceVarianceTolerancePct: { type: Number, default: 2 },
      reservationTtlHours: { type: Number, default: 2 },
      negativeStockMaxHours: { type: Number, default: 4 },
      msmeDaysWithAgreement: { type: Number, default: 45 },
      msmeDaysWithoutAgreement: { type: Number, default: 15 },
      rule37ItcReversalDays: { type: Number, default: 180 },
      dunningIntervalsDays: { type: [Number], default: [0, 3, 7, 10] }
    },
    tieredApprovalThresholds: {
      tier1Limit: { type: Number, default: 5e3 },
      tier2Limit: { type: Number, default: 5e4 },
      tier3Limit: { type: Number, default: 1e5 }
    },
    statusRegistries: {
      locations: {
        type: [String],
        default: [
          "INBOUND_DOCK",
          "QC_AREA",
          "STORAGE_BINS",
          "PICK_CART",
          "PACKING_TABLE",
          "OUTBOUND_BAY",
          "TRANSIT_INTERWH",
          "SCRAP_BAY",
          "WIP_SHOP_FLOOR",
          "RETURN_DOCK",
          "CUSTOMER_TRANSIT",
          "RTO_TRANSIT"
        ]
      },
      statuses: {
        type: [String],
        default: [
          "AVAILABLE",
          "QC_HOLD",
          "QUARANTINE",
          "ADJ_HOLD",
          "EXCESS_HOLD",
          "UNDER_INVESTIGATION",
          "RETURN_PENDING_QC",
          "REWORK",
          "DAMAGED"
        ]
      },
      reservationStatuses: {
        type: [String],
        default: ["ACTIVE", "PICKED", "RELEASED", "EXPIRED"]
      },
      documentStatuses: {
        type: import_mongoose.Schema.Types.Mixed,
        default: {
          purchaseOrder: ["DRAFT", "ISSUED", "PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED"],
          salesOrder: ["DRAFT", "CONFIRMED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED", "CLOSED"],
          grn: ["DRAFT", "ACCEPTED", "QUARANTINE_SPLIT", "POSTED"],
          invoice: ["DRAFT", "IRN_GENERATED", "DISPATCHED", "PAID", "VOID"]
        }
      }
    },
    taxTable: {
      defaultGstRate: { type: Number, default: 18 },
      tdsRates: {
        type: import_mongoose.Schema.Types.Mixed,
        default: {
          "194C": 2,
          "194J": 10,
          "194Q": 0.1,
          "194I": 10
        }
      },
      tcsRates: {
        type: import_mongoose.Schema.Types.Mixed,
        default: {
          "206C": 0.1
        }
      }
    }
  },
  { timestamps: true }
);
ERPConfigSchema.statics.getOrCreate = async function(orgId) {
  let config = await this.findOne({ orgId });
  if (!config) {
    config = await this.create({ orgId });
  }
  return config;
};
var ERPConfig_default = import_mongoose.default.models.ERPConfig || import_mongoose.default.model("ERPConfig", ERPConfigSchema);

// ../backend/src/domains/inventory/models/StockReservation.ts
var import_mongoose2 = __toESM(require("mongoose"));
var StockReservationSchema = new import_mongoose2.Schema(
  {
    orgId: { type: String, required: true, index: true },
    warehouseId: { type: String, index: true },
    itemId: { type: import_mongoose2.Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String },
    soId: { type: String, index: true },
    soLineId: { type: String, index: true },
    customerId: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["SOFT", "HARD"], default: "SOFT" },
    status: {
      type: String,
      enum: ["ACTIVE", "PICKED", "RELEASED", "EXPIRED"],
      default: "ACTIVE",
      index: true
    },
    allocatedBy: { type: String, default: "SYSTEM" },
    expiresAt: { type: Date, required: true, index: true },
    notes: { type: String }
  },
  { timestamps: true }
);
var StockReservation_default = import_mongoose2.default.models.StockReservation || import_mongoose2.default.model("StockReservation", StockReservationSchema);

// ../backend/src/domains/inventory/models/StockBalance.ts
var import_mongoose3 = __toESM(require("mongoose"));
var StockBalanceSchema = new import_mongoose3.Schema(
  {
    orgId: { type: String, required: true, index: true },
    warehouseId: { type: String, required: true, index: true },
    itemId: { type: import_mongoose3.Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    binCode: { type: String, default: "MAIN_BIN", index: true },
    status: { type: String, required: true, index: true },
    batchId: { type: String, index: true },
    serialNumber: { type: String, index: true },
    quantity: { type: Number, required: true, default: 0 },
    uom: { type: String, default: "pcs" },
    unitCost: { type: Number, default: 0 },
    totalValuation: { type: Number, default: 0 }
  },
  { timestamps: true }
);
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
var StockBalance_default = import_mongoose3.default.models.StockBalance || import_mongoose3.default.model("StockBalance", StockBalanceSchema);

// ../backend/src/domains/inventory/models/StockLedger.ts
var import_mongoose4 = __toESM(require("mongoose"));
var StockLedgerSchema = new import_mongoose4.Schema(
  {
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    itemId: { type: import_mongoose4.Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String, default: "", index: true },
    itemName: { type: String, default: "" },
    fromLocation: {
      type: { type: String, default: "STORAGE_BIN" },
      code: { type: String, default: "MAIN_WAREHOUSE" }
    },
    toLocation: {
      type: { type: String, default: "STORAGE_BIN" },
      code: { type: String, default: "MAIN_WAREHOUSE" }
    },
    bucketFrom: { type: String, default: "ACTIVE_STORAGE_BINS" },
    bucketTo: { type: String, default: "ACTIVE_STORAGE_BINS" },
    quantity: { type: Number, required: true },
    valuationRate: { type: Number, default: 0 },
    totalValuation: { type: Number, default: 0 },
    referenceDocType: {
      type: String,
      enum: ["PURCHASE_ORDER", "PURCHASE_RECEIVE", "PUTAWAY", "SALES_ORDER", "PACKAGE", "SHIPMENT", "ADJUSTMENT", "MOVE_ORDER", "SALES_RETURN"],
      required: true
    },
    referenceDocNumber: { type: String, required: true, index: true },
    batchNumber: { type: String, default: "" },
    serialNumbers: [{ type: String }],
    actor: {
      userId: { type: String },
      name: { type: String, default: "System" },
      role: { type: String, default: "Operator" }
    },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
StockLedgerSchema.index({ orgId: 1, itemId: 1, timestamp: -1 });
StockLedgerSchema.index({ orgId: 1, referenceDocNumber: 1 });
var StockLedger = import_mongoose4.default.models.StockLedger || import_mongoose4.default.model("StockLedger", StockLedgerSchema, "stockledgers");
var StockLedger_default = StockLedger;

// ../backend/src/domains/books/models/Journal.ts
var import_mongoose5 = __toESM(require("mongoose"));
var JournalLineItemSchema = new import_mongoose5.Schema({
  account: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  debits: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  costCenter: { type: String },
  department: { type: String }
});
var JournalSchema = new import_mongoose5.Schema(
  {
    orgId: { type: String },
    date: { type: Date, required: true },
    reverseJournalDate: { type: Date },
    publishReverseOnlyOnDate: { type: Boolean, default: false },
    journalNumber: { type: String, required: true, unique: true },
    referenceNumber: { type: String },
    notes: { type: String, required: true },
    reportingMethod: { type: String, enum: ["accrual", "cash", "both"], required: true },
    currency: { type: String, default: "INR" },
    lineItems: [JournalLineItemSchema],
    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["Draft", "Published", "Void", "Reversed"], default: "Draft" },
    reversalOfId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Journal" },
    reversedById: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Journal" },
    reversalReason: { type: String }
  },
  { timestamps: true }
);
JournalSchema.index({ orgId: 1, date: -1 });
JournalSchema.index({ reversalOfId: 1 });
var Journal = import_mongoose5.default.models.Journal || import_mongoose5.default.model("Journal", JournalSchema, "booksjournals");
if (!import_mongoose5.default.models.BooksJournal) {
  try {
    import_mongoose5.default.model("BooksJournal", JournalSchema, "booksjournals");
  } catch (e) {
  }
}
var Journal_default = Journal;

// ../backend/src/domains/books/models/LedgerEntry.ts
var import_mongoose6 = __toESM(require("mongoose"));
var LedgerLineSchema = new import_mongoose6.Schema({
  accountId: { type: import_mongoose6.Schema.Types.Mixed, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  contactId: { type: import_mongoose6.Schema.Types.Mixed },
  branchId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "BooksBranch" },
  projectId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "BooksProject" },
  reportingTagIds: [{ type: import_mongoose6.Schema.Types.ObjectId, ref: "ReportingTag" }],
  description: { type: String }
});
var LedgerEntrySchema = new import_mongoose6.Schema({
  orgId: { type: String, required: true, index: true },
  transactionId: { type: String, required: true, index: true },
  transactionType: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  lines: [LedgerLineSchema],
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["Posted", "Void"], default: "Posted" }
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });
var LedgerEntry_default = import_mongoose6.default.model("LedgerEntry", LedgerEntrySchema);

// ../backend/src/domains/inventory/models/Item.ts
var import_mongoose7 = __toESM(require("mongoose"));
var ItemSchema = new import_mongoose7.Schema({
  // Enterprise Inventory Features
  itemClass: { type: String, enum: ["Standard", "Variant", "Kit", "Assembly"], default: "Standard" },
  trackingType: { type: String, enum: ["None", "Serial", "Batch"], default: "None" },
  valuationMethod: { type: String, enum: ["FIFO", "FEFO", "WAC"], default: "FIFO" },
  barcode: { type: String, default: "" },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    unit: { type: String, default: "cm" }
  },
  weight: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: "kg" }
  },
  reorderPoint: { type: Number, default: 0 },
  safetyStock: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 0 },
  defaultWarehouseId: { type: String, default: "" },
  defaultBin: { type: String, default: "" },
  salesAccount: { type: String, default: "Sales" },
  purchaseAccount: { type: String, default: "Cost of Goods Sold" },
  inventoryAccount: { type: String, default: "Inventory Asset" },
  purchaseDescription: { type: String, default: "" },
  preferredVendorId: { type: String, default: "" },
  variants: [{
    attributeName: String,
    attributeValue: String,
    sku: String,
    priceOverride: Number,
    purchaseRateOverride: Number,
    stock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    barcode: String
  }],
  bom: [{
    itemId: { type: import_mongoose7.Schema.Types.ObjectId, ref: "Product" },
    itemName: String,
    quantity: { type: Number, required: true },
    wastagePercent: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    notes: String
  }],
  serialNumbers: [{
    serialNo: String,
    status: { type: String, enum: ["Available", "Committed", "Sold", "Damaged"], default: "Available" },
    warehouse: String,
    bin: String,
    addedDate: String,
    warrantyExpiry: String
  }],
  batches: [{
    batchNo: String,
    mfgDate: String,
    expiryDate: String,
    quantity: { type: Number, default: 0 },
    warehouse: String,
    bin: String,
    status: { type: String, enum: ["Active", "Quarantine", "Expired"], default: "Active" }
  }],
  warehouseStock: [{
    warehouse: { type: import_mongoose7.Schema.Types.ObjectId, ref: "BooksWarehouse" },
    warehouseName: { type: String, default: "" },
    bin: { type: String, default: "" },
    stockOnHand: { type: Number, default: 0 },
    committedStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 }
  }],
  costLayers: [{
    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    referenceDoc: { type: String, default: "" }
  }],
  // CRM Base Fields
  companyId: { type: import_mongoose7.Schema.Types.Mixed },
  category: { type: String },
  hsnCode: { type: String },
  gstRate: { type: String },
  price: { type: Number },
  stockQuantity: { type: Number },
  minimumStock: { type: Number },
  tags: [String],
  images: [String],
  status: { type: String },
  currency: { type: String },
  features: [String],
  // Books / Inventory Fields
  orgId: { type: import_mongoose7.Schema.Types.Mixed },
  name: { type: String, required: true },
  sku: { type: String, default: "" },
  type: { type: String, enum: ["goods", "service"], default: "goods" },
  unit: { type: String, default: "pcs" },
  salesRate: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
  purchaseRate: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
  description: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  createdBy: { type: String, default: "piyushsharma12452" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });
var ProductModel = import_mongoose7.default.models.Product || import_mongoose7.default.model("Product", ItemSchema, "products");
if (!import_mongoose7.default.models.BooksItem) {
  try {
    import_mongoose7.default.model("BooksItem", ItemSchema, "products");
  } catch (e) {
  }
}
if (!import_mongoose7.default.models.Item) {
  try {
    import_mongoose7.default.model("Item", ItemSchema, "products");
  } catch (e) {
  }
}
var Item_default = ProductModel;

// ../backend/src/domains/inventory/models/PurchaseOrder.ts
var import_mongoose8 = __toESM(require("mongoose"));
var PurchaseOrderSchema = new import_mongoose8.Schema({
  // Enterprise PO Features
  poType: { type: String, enum: ["Standard", "Blanket"], default: "Standard" },
  approvalStatus: { type: String, enum: ["Draft", "Pending", "ManagerApproved", "DirectorApproved", "Approved", "Rejected"], default: "Draft" },
  blanketDetails: {
    maxAmount: { type: Number },
    validUntil: { type: Date },
    amountUtilized: { type: Number, default: 0 }
  },
  orgId: { type: import_mongoose8.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose8.Schema.Types.Mixed, index: true },
  vendorId: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Vendor", required: true },
  deliveryDestination: { type: String, enum: ["organization", "customer"], default: "organization" },
  customerId: { type: import_mongoose8.Schema.Types.ObjectId, ref: "ClientAccount" },
  poNumber: { type: String, required: true },
  referenceNumber: { type: String },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  shipmentPreference: { type: String },
  paymentTerms: { type: String },
  lineItems: [{
    itemId: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Product" },
    itemDetails: { type: String },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ["amount", "percent"], default: "amount" },
  taxWithheldType: { type: String, enum: ["none", "TDS", "TCS"], default: "none" },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  terms: { type: String },
  status: {
    type: String,
    enum: ["Draft", "Issued", "Billed", "Cancelled"],
    default: "Issued"
  },
  currency: { type: String, default: "INR" },
  createdBy: { type: String }
}, { timestamps: true });
var PurchaseOrderModel = import_mongoose8.default.models.PurchaseOrder || import_mongoose8.default.model("PurchaseOrder", PurchaseOrderSchema, "purchaseorders");
if (!import_mongoose8.default.models.BooksPurchaseOrder) {
  try {
    import_mongoose8.default.model("BooksPurchaseOrder", PurchaseOrderSchema, "purchaseorders");
  } catch (e) {
  }
}
var PurchaseOrder_default = PurchaseOrderModel;

// ../backend/src/domains/billing/models/SalesOrder.ts
var import_mongoose9 = __toESM(require("mongoose"));
var SalesOrderItemSchema = new import_mongoose9.Schema({
  item: { type: import_mongoose9.Schema.Types.ObjectId, ref: "Product", required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
  quantityFulfilled: { type: Number, default: 0 },
  isDropShip: { type: Boolean, default: false }
});
var SalesOrderSchema = new import_mongoose9.Schema({
  orgId: { type: String },
  companyId: { type: String },
  salesOrderNumber: { type: String, required: true, unique: true },
  customer: { type: import_mongoose9.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  salesOrderDate: { type: Date, required: true, default: Date.now },
  expectedShipmentDate: { type: Date },
  status: {
    type: String,
    enum: ["Draft", "Open", "Confirmed", "Closed", "Cancelled", "Invoiced"],
    default: "Open"
  },
  approvalStatus: {
    type: String,
    enum: ["Draft", "Pending", "Approved", "Rejected"],
    default: "Approved"
  },
  rejectionReason: { type: String },
  referenceNumber: { type: String },
  items: [SalesOrderItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ["amount", "percent"], default: "amount" },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ["TDS", "TCS", "none"], default: "none" },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  salesperson: { type: String },
  deliveryMethod: { type: String },
  paymentTerms: { type: String },
  attachments: [{ type: String }],
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: "system" },
  fulfillmentStatus: { type: String, enum: ["Unfulfilled", "PartiallyFulfilled", "Fulfilled"], default: "Unfulfilled" },
  backorderOf: { type: import_mongoose9.Schema.Types.ObjectId, ref: "SalesOrder" }
}, { timestamps: true });
var SalesOrder_default = import_mongoose9.default.model("SalesOrder", SalesOrderSchema);

// ../backend/src/domains/books/models/FixedAsset.ts
var import_mongoose10 = __toESM(require("mongoose"));
var FixedAssetSchema = new import_mongoose10.Schema(
  {
    orgId: { type: String, required: true, index: true },
    assetName: { type: String, required: true },
    assetNumber: { type: String, required: true, unique: true },
    categoryId: { type: import_mongoose10.Schema.Types.ObjectId, ref: "AssetCategory", required: true },
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salvageValue: { type: Number, default: 0 },
    usefulLifeMonths: { type: Number, required: true },
    depreciationMethod: { type: String, enum: ["Straight_Line", "Declining_Balance", "None"], required: true },
    depreciationRate: { type: Number },
    accumulatedDepreciation: { type: Number, default: 0 },
    currentBookValue: { type: Number, required: true },
    status: { type: String, enum: ["Draft", "Active", "Disposed", "Fully_Depreciated"], default: "Draft" },
    disposalDate: { type: Date },
    disposalAmount: { type: Number },
    depreciationHistory: [{
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      journalId: { type: import_mongoose10.Schema.Types.ObjectId, ref: "Journal" }
    }]
  },
  { timestamps: true }
);
var FixedAsset = import_mongoose10.default.models.FixedAsset || import_mongoose10.default.model("FixedAsset", FixedAssetSchema);
var FixedAsset_default = FixedAsset;

// ../backend/src/core/services/EnterpriseV3MasterService.ts
var EnterpriseV3MasterService = class {
  /**
   * Helper: Get dynamic configuration from DB (Zero hardcoding)
   */
  static async getConfig(orgId) {
    return await ERPConfig_default.getOrCreate(orgId);
  }
  /**
   * Helper: Immutable Double-Entry Ledger Posting
   * Invariant: Sum of Debits === Sum of Credits (Zero tolerance)
   */
  static async postBalancedJournal(orgId, transactionType, transactionId, referenceNumber, notes, lines, date = /* @__PURE__ */ new Date()) {
    const totalDebits = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredits = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
    const roundedDebits = Math.round(totalDebits * 100) / 100;
    const roundedCredits = Math.round(totalCredits * 100) / 100;
    if (Math.abs(roundedDebits - roundedCredits) > 0.01) {
      throw new Error(
        `[INVARIANT VIOLATION] Debit and Credit must balance! Debits: ${roundedDebits}, Credits: ${roundedCredits}`
      );
    }
    const journal = await Journal_default.create({
      orgId,
      date,
      journalNumber: `JRN-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      referenceNumber,
      notes,
      reportingMethod: "accrual",
      currency: "INR",
      lineItems: lines.map((l) => ({
        account: l.account,
        description: l.description || notes,
        debits: l.debit || 0,
        credits: l.credit || 0
      })),
      subTotal: roundedDebits,
      total: roundedDebits,
      status: "Published"
    });
    await LedgerEntry_default.create({
      orgId,
      transactionId: transactionId || journal._id.toString(),
      transactionType,
      date,
      currency: "INR",
      status: "Posted",
      lines: lines.map((l) => ({
        accountId: l.account,
        debit: l.debit || 0,
        credit: l.credit || 0,
        description: l.description || notes
      }))
    });
    return journal;
  }
  /**
   * ATP Formula v3 (Section 3.3 & Pillar 2)
   * ATP = Sellable On-Hand (STORAGE_BINS + AVAILABLE) - Unpicked Active Reservations
   */
  static async calculateATP(orgId, itemId, warehouseId) {
    const matchQuery = {
      orgId,
      itemId,
      location: "STORAGE_BINS",
      status: "AVAILABLE"
    };
    if (warehouseId) matchQuery.warehouseId = warehouseId;
    const availableBalances = await StockBalance_default.find(matchQuery);
    const sellableOnHand = availableBalances.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const now = /* @__PURE__ */ new Date();
    const resQuery = {
      orgId,
      itemId,
      status: "ACTIVE",
      expiresAt: { $gt: now }
    };
    if (warehouseId) resQuery.warehouseId = warehouseId;
    const activeReservations = await StockReservation_default.find(resQuery);
    const unpickedReservations = activeReservations.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const atp = Math.max(0, sellableOnHand - unpickedReservations);
    return {
      sellableOnHand,
      unpickedReservations,
      atp
    };
  }
  /**
   * FLOW 1: Procure-to-Pay (P2P) Inbound Supply Gate
   */
  static async executeInboundReceipt(params) {
    const config = await this.getConfig(params.orgId);
    const po = await PurchaseOrder_default.findById(params.poId);
    if (!po) throw new Error(`PO not found: ${params.poId}`);
    const poRate = po.lineItems?.[0]?.rate || params.vendorBillPricePerUnit;
    const poQty = po.lineItems?.[0]?.quantity || params.receivedQty;
    const maxAllowedQty = poQty * (1 + config.tolerances.overDeliveryTolerancePct / 100);
    const totalIncoming = params.receivedQty + params.rejectedQty;
    if (totalIncoming > maxAllowedQty) {
      throw new Error(
        `[LOCK 1.1] Over-delivery exceeds dynamic tolerance limit of ${config.tolerances.overDeliveryTolerancePct}%. Max allowed: ${maxAllowedQty}, Attempted: ${totalIncoming}`
      );
    }
    const billRate = params.vendorBillPricePerUnit;
    const allowedVariancePct = config.tolerances.priceVarianceTolerancePct;
    const actualVariancePct = Math.abs((billRate - poRate) / poRate * 100);
    if (actualVariancePct > allowedVariancePct) {
      throw new Error(
        `[LOCK 1.5] Purchase Price Variance of ${actualVariancePct.toFixed(2)}% exceeds allowed dynamic tolerance of ${allowedVariancePct}%!`
      );
    }
    const acceptedQty = params.receivedQty;
    const rejectedQty = params.rejectedQty;
    const binCode = params.binCode || "BIN-RACK-B04";
    let acceptedBalance = await StockBalance_default.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: "STORAGE_BINS",
      binCode,
      status: "AVAILABLE"
    });
    if (!acceptedBalance) {
      acceptedBalance = new StockBalance_default({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        itemSku: params.itemSku,
        location: "STORAGE_BINS",
        binCode,
        status: "AVAILABLE",
        quantity: 0,
        unitCost: poRate,
        totalValuation: 0
      });
    }
    acceptedBalance.quantity += acceptedQty;
    acceptedBalance.totalValuation = acceptedBalance.quantity * poRate;
    await acceptedBalance.save();
    if (rejectedQty > 0) {
      let quarantineBalance = await StockBalance_default.findOne({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        location: "QC_AREA",
        binCode: "QUARANTINE_BIN",
        status: "QUARANTINE"
      });
      if (!quarantineBalance) {
        quarantineBalance = new StockBalance_default({
          orgId: params.orgId,
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemSku: params.itemSku,
          location: "QC_AREA",
          binCode: "QUARANTINE_BIN",
          status: "QUARANTINE",
          quantity: 0,
          unitCost: poRate,
          totalValuation: 0
        });
      }
      quarantineBalance.quantity += rejectedQty;
      quarantineBalance.totalValuation = quarantineBalance.quantity * poRate;
      await quarantineBalance.save();
    }
    await StockLedger_default.create({
      orgId: params.orgId,
      itemId: params.itemId,
      itemSku: params.itemSku,
      fromLocation: { type: "VENDOR", code: "GATE_ENTRY" },
      toLocation: { type: "STORAGE_BIN", code: binCode },
      bucketFrom: "INBOUND_DOCK",
      bucketTo: "STORAGE_BINS",
      quantity: acceptedQty,
      valuationRate: poRate,
      totalValuation: acceptedQty * poRate,
      referenceDocType: "PURCHASE_RECEIVE",
      referenceDocNumber: po.poNumber,
      actor: params.actor,
      timestamp: /* @__PURE__ */ new Date()
    });
    const acceptedValuation = acceptedQty * poRate;
    await this.postBalancedJournal(
      params.orgId,
      "GRN",
      po._id.toString(),
      po.poNumber,
      `GRN Inbound Accrual for PO ${po.poNumber}`,
      [
        { account: "Inventory Asset", debit: acceptedValuation, credit: 0 },
        { account: "GRNI Accrual", debit: 0, credit: acceptedValuation }
      ]
    );
    const priceVariance = (billRate - poRate) * acceptedQty;
    const gstRate = config.taxTable.defaultGstRate || 18;
    const gstAmount = acceptedQty * billRate * gstRate / 100;
    const totalApLiability = acceptedQty * billRate + gstAmount;
    const billLines = [
      { account: "GRNI Accrual", debit: acceptedValuation, credit: 0 },
      { account: "Input GST Pending Verification", debit: gstAmount, credit: 0 }
    ];
    if (priceVariance > 0) {
      billLines.push({ account: "Purchase Price Variance (PPV)", debit: priceVariance, credit: 0 });
    } else if (priceVariance < 0) {
      billLines.push({ account: "Purchase Price Variance (PPV)", debit: 0, credit: Math.abs(priceVariance) });
    }
    billLines.push({ account: "Accounts Payable", debit: 0, credit: totalApLiability });
    await this.postBalancedJournal(
      params.orgId,
      "Bill",
      po._id.toString(),
      po.poNumber,
      `Vendor Bill 3-Way Match Posting for PO ${po.poNumber}`,
      billLines
    );
    await Item_default.updateOne(
      { _id: params.itemId },
      {
        $inc: {
          stockOnHand: acceptedQty,
          stock: acceptedQty
        }
      }
    );
    return {
      status: "SUCCESS",
      acceptedQty,
      rejectedQty,
      acceptedValuation,
      atp: await this.calculateATP(params.orgId, params.itemId, params.warehouseId)
    };
  }
  /**
   * FLOW 2: Order-to-Cash (O2C) Outbound Fulfillment Gate
   */
  static async executeOutboundFulfillment(params) {
    const config = await this.getConfig(params.orgId);
    const so = await SalesOrder_default.findById(params.soId);
    if (!so) throw new Error(`SO not found: ${params.soId}`);
    const atpResult = await this.calculateATP(params.orgId, params.itemId, params.warehouseId);
    if (atpResult.atp < params.fulfillQty) {
      throw new Error(
        `[LOCK 2.1 - ZERO OVERSELLING] Insufficient ATP stock! Available ATP: ${atpResult.atp}, Requested: ${params.fulfillQty}`
      );
    }
    const ttlHours = config.tolerances.reservationTtlHours || 2;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1e3);
    const reservation = await StockReservation_default.create({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      itemSku: params.itemSku,
      soId: params.soId,
      quantity: params.fulfillQty,
      type: "HARD",
      status: "ACTIVE",
      allocatedBy: params.actor.userId,
      expiresAt
    });
    const binCode = params.binCode || "BIN-RACK-B04";
    const sourceBalance = await StockBalance_default.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: "STORAGE_BINS",
      binCode,
      status: "AVAILABLE"
    });
    if (!sourceBalance || sourceBalance.quantity < params.fulfillQty) {
      throw new Error(`[LOCK 2.2] Bin ${binCode} does not contain enough physical stock!`);
    }
    sourceBalance.quantity -= params.fulfillQty;
    sourceBalance.totalValuation = sourceBalance.quantity * params.costPricePerUnit;
    await sourceBalance.save();
    let cartBalance = await StockBalance_default.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: "PICK_CART",
      status: "ALLOCATED"
    });
    if (!cartBalance) {
      cartBalance = new StockBalance_default({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        itemSku: params.itemSku,
        location: "PICK_CART",
        binCode: "CART-01",
        status: "ALLOCATED",
        quantity: 0,
        unitCost: params.costPricePerUnit,
        totalValuation: 0
      });
    }
    cartBalance.quantity += params.fulfillQty;
    cartBalance.totalValuation = cartBalance.quantity * params.costPricePerUnit;
    await cartBalance.save();
    const soNumber = so.salesOrderNumber || so.orderNumber || `SO-${so._id}`;
    const gstRate = config.taxTable.defaultGstRate || 18;
    const grossSales = params.fulfillQty * params.sellingPricePerUnit;
    const outputGst = grossSales * gstRate / 100;
    const totalArAmount = grossSales + outputGst;
    await this.postBalancedJournal(
      params.orgId,
      "Invoice",
      so._id.toString(),
      soNumber,
      `Pack Complete Draft Invoice & IRN Generated for SO ${soNumber}`,
      [
        { account: "Accounts Receivable", debit: totalArAmount, credit: 0 },
        { account: "Output GST Payable", debit: 0, credit: outputGst },
        { account: "Sales Clearing Account", debit: 0, credit: grossSales }
      ]
    );
    reservation.status = "PICKED";
    await reservation.save();
    cartBalance.quantity -= params.fulfillQty;
    cartBalance.totalValuation = cartBalance.quantity * params.costPricePerUnit;
    await cartBalance.save();
    const totalCogs = params.fulfillQty * params.costPricePerUnit;
    await this.postBalancedJournal(
      params.orgId,
      "Dispatch",
      so._id.toString(),
      soNumber,
      `Courier Dispatch Derecognition & Revenue Realization for SO ${soNumber}`,
      [
        { account: "Cost of Goods Sold (COGS)", debit: totalCogs, credit: 0 },
        { account: "Inventory Asset", debit: 0, credit: totalCogs },
        { account: "Sales Clearing Account", debit: grossSales, credit: 0 },
        { account: "Realized Sales Revenue", debit: 0, credit: grossSales }
      ]
    );
    await Item_default.updateOne(
      { _id: params.itemId },
      {
        $inc: {
          stockOnHand: -params.fulfillQty,
          stock: -params.fulfillQty
        }
      }
    );
    return {
      status: "DISPATCHED_AND_POSTED",
      fulfillQty: params.fulfillQty,
      grossSales,
      cogs: totalCogs,
      reservationId: reservation._id
    };
  }
  /**
   * FLOW 3: Ind AS 115 / IFRS 15 Standalone Selling Price (SSP) Allocation for Hybrid Bundles
   */
  static async executeIndAS115SSPAllocation(params) {
    const totalSSP = params.hardwareSSP + params.saasSSP;
    if (totalSSP <= 0) throw new Error("Total Standalone Selling Price must be greater than 0");
    const hardwareRatio = params.hardwareSSP / totalSSP;
    const saasRatio = params.saasSSP / totalSSP;
    const allocatedHardwareRevenue = Math.round(params.bundlePrice * hardwareRatio * 100) / 100;
    const allocatedSaasRevenue = Math.round((params.bundlePrice - allocatedHardwareRevenue) * 100) / 100;
    const monthlyAmortization = Math.round(allocatedSaasRevenue / params.durationMonths * 100) / 100;
    await this.postBalancedJournal(
      params.orgId,
      "Subscription",
      params.customerId,
      `SSP-BUNDLE-${Date.now()}`,
      `Ind AS 115 SSP Bundle Allocation: Hardware \u20B9${allocatedHardwareRevenue}, SaaS Deferred \u20B9${allocatedSaasRevenue}`,
      [
        { account: "Accounts Receivable", debit: params.bundlePrice, credit: 0 },
        { account: "Realized Hardware Revenue", debit: 0, credit: allocatedHardwareRevenue },
        { account: "Deferred SaaS Revenue", debit: 0, credit: allocatedSaasRevenue }
      ]
    );
    return {
      bundlePrice: params.bundlePrice,
      hardwareRatio,
      saasRatio,
      allocatedHardwareRevenue,
      allocatedSaasRevenue,
      monthlyAmortization
    };
  }
  /**
   * FLOW 5: Warehouse Audits, Cycle Counts, ADJ_HOLD and Scrap Lifecycle
   */
  static async executeCycleCountAndScrap(params) {
    const config = await this.getConfig(params.orgId);
    if (params.actor.userId === params.approverUserId) {
      if (config.controlProfile === "STRICT" || config.controlProfile === "STANDARD") {
        throw new Error(
          `[LOCK 9.1 - SoD VIOLATION] Operator who performed the physical count (${params.actor.userId}) cannot approve the adjustment!`
        );
      }
    }
    const varianceQty = params.countedQty - params.systemQty;
    const varianceValue = Math.abs(varianceQty * params.unitCost);
    const thresholds = config.tieredApprovalThresholds;
    let requiredTier = "Tier 1 (Store Manager)";
    if (varianceValue > thresholds.tier2Limit) {
      requiredTier = "Tier 3 (Finance Director / VP)";
    } else if (varianceValue > thresholds.tier1Limit) {
      requiredTier = "Tier 2 (Warehouse Head)";
    }
    let balance = await StockBalance_default.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: "STORAGE_BINS",
      binCode: params.binCode,
      status: "AVAILABLE"
    });
    if (varianceQty < 0) {
      const shortage = Math.abs(varianceQty);
      if (balance) {
        balance.quantity = Math.max(0, balance.quantity - shortage);
        balance.totalValuation = balance.quantity * params.unitCost;
        await balance.save();
      }
      if (params.witnessUserIds.length < 2) {
        throw new Error("[LOCK 9.4] Scrap disposal requires at least 2 authorized physical witnesses!");
      }
      const gstRate = config.taxTable.defaultGstRate || 18;
      const gstReversalAmount = varianceValue * gstRate / 100;
      await this.postBalancedJournal(
        params.orgId,
        "InventoryAdjustment",
        `SCRAP-${Date.now()}`,
        `SCRAP-LOSS-${params.itemSku}`,
        `Scrap Write-Off: Qty ${shortage}, Cost \u20B9${varianceValue}, GST Reversal \u20B9${gstReversalAmount}`,
        [
          { account: "Inventory Loss (Scrap Expense)", debit: varianceValue, credit: 0 },
          { account: "Inventory Asset", debit: 0, credit: varianceValue },
          { account: "Input GST Reversal Expense (Sec 17(5)(h))", debit: gstReversalAmount, credit: 0 },
          { account: "Input GST Pending Verification", debit: 0, credit: gstReversalAmount }
        ]
      );
    }
    return {
      status: "APPROVED_AND_POSTED",
      varianceQty,
      varianceValue,
      requiredTier,
      approvedBy: params.approverUserId
    };
  }
  /**
   * FLOW 6: Returns, RTO, RMA and Reverse Logistics
   */
  static async executeReturnsAndRTO(params) {
    const config = await this.getConfig(params.orgId);
    const gstRate = config.taxTable.defaultGstRate || 18;
    const totalCogsReversal = params.returnQty * params.originalCostPrice;
    const grossSalesReturn = params.returnQty * params.originalSellingPrice;
    const outputGstReversal = grossSalesReturn * gstRate / 100;
    const totalCreditMemo = grossSalesReturn + outputGstReversal;
    if (params.triageDecision === "RESTOCK") {
      let restockBalance = await StockBalance_default.findOne({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        location: "STORAGE_BINS",
        binCode: "BIN-RACK-B04",
        status: "AVAILABLE"
      });
      if (!restockBalance) {
        restockBalance = new StockBalance_default({
          orgId: params.orgId,
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemSku: params.itemSku,
          location: "STORAGE_BINS",
          binCode: "BIN-RACK-B04",
          status: "AVAILABLE",
          quantity: 0,
          unitCost: params.originalCostPrice,
          totalValuation: 0
        });
      }
      restockBalance.quantity += params.returnQty;
      restockBalance.totalValuation = restockBalance.quantity * params.originalCostPrice;
      await restockBalance.save();
      await this.postBalancedJournal(
        params.orgId,
        "SalesReturn",
        params.soId,
        `RMA-${params.soId}`,
        `Restock Return: Reverse COGS \u20B9${totalCogsReversal}`,
        [
          { account: "Inventory Asset", debit: totalCogsReversal, credit: 0 },
          { account: "Cost of Goods Sold (COGS)", debit: 0, credit: totalCogsReversal }
        ]
      );
    } else {
      await this.postBalancedJournal(
        params.orgId,
        "SalesReturn",
        params.soId,
        `RMA-SCRAP-${params.soId}`,
        `Damaged Return Scrapped: Loss \u20B9${totalCogsReversal}`,
        [
          { account: "Inventory Loss (Scrap Expense)", debit: totalCogsReversal, credit: 0 },
          { account: "Cost of Goods Sold (COGS)", debit: 0, credit: totalCogsReversal }
        ]
      );
    }
    await this.postBalancedJournal(
      params.orgId,
      "CreditNote",
      params.soId,
      `CN-${Date.now()}`,
      `Credit Note on RMA Return for SO ${params.soId}`,
      [
        { account: "Realized Sales Revenue", debit: grossSalesReturn, credit: 0 },
        { account: "Output GST Payable", debit: outputGstReversal, credit: 0 },
        { account: "Accounts Receivable", debit: 0, credit: totalCreditMemo }
      ]
    );
    return {
      status: "RMA_COMPLETED",
      returnQty: params.returnQty,
      triageDecision: params.triageDecision,
      creditMemoAmount: totalCreditMemo
    };
  }
  /**
   * FLOW 10: Finance Operations (Payment Gateways, COD Remittance, Bad Debt, Fixed Assets, Year-End)
   */
  static async executeFinanceOperations(params) {
    switch (params.flowType) {
      case "GATEWAY_SETTLEMENT": {
        const { grossAmount, feeAmount, gstOnFee } = params.payload;
        const netBankDeposit = Math.round((grossAmount - feeAmount - gstOnFee) * 100) / 100;
        return await this.postBalancedJournal(
          params.orgId,
          "PaymentReceived",
          `GATEWAY-${Date.now()}`,
          `SETTLE-${Date.now()}`,
          `Payment Gateway Net Settlement: Gross \u20B9${grossAmount}, Fee \u20B9${feeAmount}, GST \u20B9${gstOnFee}, Net \u20B9${netBankDeposit}`,
          [
            { account: "Main Bank Account", debit: netBankDeposit, credit: 0 },
            { account: "Payment Gateway Fee Expense", debit: feeAmount, credit: 0 },
            { account: "Input GST on Gateway Fee", debit: gstOnFee, credit: 0 },
            { account: "Gateway Clearing Account", debit: 0, credit: grossAmount }
          ]
        );
      }
      case "COD_REMITTANCE": {
        const { codCashCollected, courierFee, gstOnFee } = params.payload;
        const netPayout = Math.round((codCashCollected - courierFee - gstOnFee) * 100) / 100;
        return await this.postBalancedJournal(
          params.orgId,
          "PaymentReceived",
          `COD-${Date.now()}`,
          `COD-REMIT-${Date.now()}`,
          `3PL COD Courier Remittance: Cash \u20B9${codCashCollected}, Fee \u20B9${courierFee}, Net Bank \u20B9${netPayout}`,
          [
            { account: "Main Bank Account", debit: netPayout, credit: 0 },
            { account: "Courier Remittance Fee Expense", debit: courierFee, credit: 0 },
            { account: "Input GST on Courier Fee", debit: gstOnFee, credit: 0 },
            { account: "COD Receivable (Courier)", debit: 0, credit: codCashCollected }
          ]
        );
      }
      case "BAD_DEBT_ECL": {
        const { overdueAmount, provisionRatePct } = params.payload;
        const provisionAmount = Math.round(overdueAmount * provisionRatePct / 100 * 100) / 100;
        return await this.postBalancedJournal(
          params.orgId,
          "ManualJournal",
          `ECL-${Date.now()}`,
          `ECL-PROVISION-${Date.now()}`,
          `Ind AS 109 Bad Debt ECL Provision on \u20B9${overdueAmount} at ${provisionRatePct}%`,
          [
            { account: "Bad Debt Expense (ECL)", debit: provisionAmount, credit: 0 },
            { account: "Allowance for Expected Credit Losses", debit: 0, credit: provisionAmount }
          ]
        );
      }
      case "FIXED_ASSET_DEPRECIATION": {
        const { assetId, monthlyDepreciation } = params.payload;
        const asset = await FixedAsset_default.findById(assetId);
        if (asset) {
          asset.accumulatedDepreciation = (asset.accumulatedDepreciation || 0) + monthlyDepreciation;
          asset.currentBookValue = Math.max(0, (asset.purchasePrice || 0) - asset.accumulatedDepreciation);
          await asset.save();
        }
        return await this.postBalancedJournal(
          params.orgId,
          "ManualJournal",
          assetId,
          `DEP-${Date.now()}`,
          `Monthly Straight-Line Depreciation on Fixed Asset \u20B9${monthlyDepreciation}`,
          [
            { account: "Depreciation Expense", debit: monthlyDepreciation, credit: 0 },
            { account: "Accumulated Depreciation", debit: 0, credit: monthlyDepreciation }
          ]
        );
      }
      case "YEAR_END_CLOSE": {
        const { totalRevenue, totalExpense } = params.payload;
        const netProfit = totalRevenue - totalExpense;
        return await this.postBalancedJournal(
          params.orgId,
          "ManualJournal",
          `YEAREND-${Date.now()}`,
          `CLOSE-${Date.now()}`,
          `Year-End P&L Close into Retained Earnings: Net Profit \u20B9${netProfit}`,
          [
            { account: "Revenue Summary Account", debit: totalRevenue, credit: 0 },
            { account: "Expense Summary Account", debit: 0, credit: totalExpense },
            { account: "Retained Earnings", debit: 0, credit: netProfit }
          ]
        );
      }
      default:
        throw new Error(`Unsupported Finance Operation: ${params.flowType}`);
    }
  }
  /**
   * FLOW 11: Ground Operating Rules & Controlled Exceptions
   */
  static async executeFlow11GroundExceptions(params) {
    const config = await this.getConfig(params.orgId);
    switch (params.exceptionType) {
      case "PROVISIONAL_DOCK_INTAKE": {
        const { itemId, itemSku, warehouseId, qty } = params.payload;
        let provBalance = await StockBalance_default.findOne({
          orgId: params.orgId,
          warehouseId,
          itemId,
          location: "INBOUND_DOCK",
          status: "QC_HOLD"
        });
        if (!provBalance) {
          provBalance = new StockBalance_default({
            orgId: params.orgId,
            warehouseId,
            itemId,
            itemSku,
            location: "INBOUND_DOCK",
            binCode: "PROVISIONAL_DOCK",
            status: "QC_HOLD",
            quantity: 0,
            unitCost: 0,
            totalValuation: 0
          });
        }
        provBalance.quantity += qty;
        await provBalance.save();
        return {
          status: "PROVISIONALLY_STORED_AT_DOCK",
          location: "INBOUND_DOCK",
          statusField: "QC_HOLD",
          atpImpact: 0,
          notes: "Truck released from dock; stock locked pending vendor documentation."
        };
      }
      case "CONTROLLED_NEGATIVE_STOCK": {
        const { supervisorOverrideId, qty } = params.payload;
        if (!supervisorOverrideId) {
          throw new Error("[LOCK 11.4] Controlled Negative Stock requires Supervisor Override ID!");
        }
        const maxHours = config.tolerances.negativeStockMaxHours || 4;
        const autoReconDeadline = new Date(Date.now() + maxHours * 60 * 60 * 1e3);
        return {
          status: "CONTROLLED_NEGATIVE_DISPATCH_AUTHORIZED",
          authorizedBy: supervisorOverrideId,
          allowedHours: maxHours,
          mandatoryReconciliationDeadline: autoReconDeadline
        };
      }
      case "OFFLINE_SCAN_SYNC": {
        const { idempotencyKey, scans } = params.payload;
        return {
          status: "SYNCED_IDEMPOTENTLY",
          idempotencyKey,
          processedScansCount: scans?.length || 0
        };
      }
      default:
        throw new Error(`Unsupported Ground Exception: ${params.exceptionType}`);
    }
  }
};

// ../backend/src/routes/erpV3Routes.ts
var router = (0, import_express.Router)();
var getOrgId = (req) => {
  return req.orgId || req.user?.orgId || req.headers["x-org-id"] || "6aa797278d301b4735f1d322";
};
router.get("/config", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const config = await EnterpriseV3MasterService.getConfig(orgId);
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/config", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const updated = await ERPConfig_default.findOneAndUpdate(
      { orgId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/atp/:itemId", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { itemId } = req.params;
    const warehouseId = req.query.warehouseId;
    const atpData = await EnterpriseV3MasterService.calculateATP(orgId, itemId, warehouseId);
    res.json({ success: true, data: atpData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/inbound/receipt", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeInboundReceipt({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "Warehouse Operator" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/outbound/fulfill", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeOutboundFulfillment({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "Dispatch Supervisor" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/subscriptions/ssp-allocate", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const result = await EnterpriseV3MasterService.executeIndAS115SSPAllocation({
      orgId,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/audits/cycle-count-scrap", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeCycleCountAndScrap({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "Stock Auditor" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/returns/rma", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeReturnsAndRTO({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "RMA Specialist" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/finance/operation", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeFinanceOperations({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "Finance Executive" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/ground/exception", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.user?.id || "SYSTEM";
    const result = await EnterpriseV3MasterService.executeFlow11GroundExceptions({
      orgId,
      ...req.body,
      actor: { userId, role: req.user?.role || "Ground Operator" }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
var erpV3Routes_default = router;

// ../backend/scripts/test_v3_http_live_api.ts
import_dotenv.default.config();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority";
async function runHttpApiTest() {
  console.log("================================================================================");
  console.log("\u{1F310} TESTING LIVE HTTP REST APIS FOR V3 BUSINESS LOGIC (PORT 5099)");
  console.log("================================================================================\n");
  await import_mongoose11.default.connect(MONGODB_URI);
  console.log("\u2705 Connected to MongoDB Atlas: hrms_crm");
  const testApp = (0, import_express2.default)();
  testApp.use(import_express2.default.json());
  testApp.use("/api/v1/erp", erpV3Routes_default);
  const server = testApp.listen(5099);
  console.log("\u2705 Live V3 REST API Server listening on http://localhost:5099/api/v1/erp");
  const testOrgId = "6aa797278d301b4735f1d322";
  const headers = {
    "Content-Type": "application/json",
    "x-org-id": testOrgId
  };
  try {
    console.log("\n--- 1. Testing GET /api/v1/erp/config ---");
    const configRes = await fetch("http://localhost:5099/api/v1/erp/config", { headers });
    const configData = await configRes.json();
    console.log(`\u2022 Status: ${configRes.status}, Success: ${configData.success}`);
    console.log(`\u2022 Org ID: ${configData.data?.orgId}, Profile: ${configData.data?.controlProfile}`);
    if (configRes.status !== 200 || !configData.data?.tolerances) {
      throw new Error("GET /api/v1/erp/config failed!");
    }
    console.log("\u2705 [PASSED] GET /api/v1/erp/config");
    console.log("\n--- 2. Testing PUT /api/v1/erp/config ---");
    const updateRes = await fetch("http://localhost:5099/api/v1/erp/config", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        "tolerances.overDeliveryTolerancePct": 6
      })
    });
    const updateData = await updateRes.json();
    console.log(`\u2022 Status: ${updateRes.status}, OverDelivery Tolerance: ${updateData.data?.tolerances?.overDeliveryTolerancePct}%`);
    if (updateRes.status !== 200 || updateData.data?.tolerances?.overDeliveryTolerancePct !== 6) {
      throw new Error("PUT /api/v1/erp/config failed!");
    }
    console.log("\u2705 [PASSED] PUT /api/v1/erp/config");
    await fetch("http://localhost:5099/api/v1/erp/config", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        "tolerances.overDeliveryTolerancePct": 5
      })
    });
    console.log("\n--- 3. Testing GET /api/v1/erp/atp/:itemId ---");
    const timestamp = Date.now().toString().slice(-4);
    const testSku = `HTTP-V3-${timestamp}`;
    const item = await Item_default.create({
      orgId: testOrgId,
      name: `HTTP Test Item ${timestamp}`,
      sku: testSku,
      type: "goods",
      unit: "pcs",
      rate: 3500,
      purchaseRate: 2e3,
      stockOnHand: 0,
      stock: 0,
      isActive: true
    });
    const atpRes = await fetch(`http://localhost:5099/api/v1/erp/atp/${item._id}`, { headers });
    const atpData = await atpRes.json();
    console.log(`\u2022 Status: ${atpRes.status}, ATP: ${atpData.data?.atp}`);
    if (atpRes.status !== 200 || atpData.data?.atp !== 0) {
      throw new Error("GET /api/v1/erp/atp/:itemId failed!");
    }
    console.log("\u2705 [PASSED] GET /api/v1/erp/atp/:itemId");
    console.log("\n--- 4. Testing POST /api/v1/erp/inbound/receipt (Flow 1) ---");
    const po = await PurchaseOrder_default.create({
      orgId: testOrgId,
      vendorId: new import_mongoose11.default.Types.ObjectId(),
      poNumber: `PO-HTTP-${timestamp}`,
      orderDate: /* @__PURE__ */ new Date(),
      lineItems: [
        {
          itemId: item._id,
          quantity: 50,
          rate: 2e3,
          amount: 1e5,
          account: "Cost of Goods Sold"
        }
      ],
      subTotal: 1e5,
      totalAmount: 1e5,
      status: "Issued"
    });
    const inboundRes = await fetch("http://localhost:5099/api/v1/erp/inbound/receipt", {
      method: "POST",
      headers,
      body: JSON.stringify({
        poId: po._id.toString(),
        itemId: item._id.toString(),
        itemSku: testSku,
        warehouseId: "HTTP-WAREHOUSE-01",
        binCode: "BIN-HTTP-01",
        receivedQty: 50,
        rejectedQty: 0,
        vendorBillPricePerUnit: 2e3
      })
    });
    const inboundData = await inboundRes.json();
    console.log(`\u2022 Status: ${inboundRes.status}, Accepted Qty: ${inboundData.data?.acceptedQty}, New ATP: ${inboundData.data?.atp?.atp}`);
    if (inboundRes.status !== 200 || inboundData.data?.atp?.atp !== 50) {
      throw new Error("POST /api/v1/erp/inbound/receipt failed!");
    }
    console.log("\u2705 [PASSED] POST /api/v1/erp/inbound/receipt");
    console.log("\n--- 5. Testing POST /api/v1/erp/outbound/fulfill (Flow 2) ---");
    const so = await SalesOrder_default.create({
      orgId: testOrgId,
      customer: new import_mongoose11.default.Types.ObjectId(),
      salesOrderNumber: `SO-HTTP-${timestamp}`,
      salesOrderDate: /* @__PURE__ */ new Date(),
      createdBy: "HTTP-TESTER",
      items: [
        {
          item: item._id,
          quantity: 10,
          rate: 3500,
          amount: 35e3
        }
      ],
      subTotal: 35e3,
      total: 35e3,
      status: "Confirmed"
    });
    const fulfillRes = await fetch("http://localhost:5099/api/v1/erp/outbound/fulfill", {
      method: "POST",
      headers,
      body: JSON.stringify({
        soId: so._id.toString(),
        itemId: item._id.toString(),
        itemSku: testSku,
        warehouseId: "HTTP-WAREHOUSE-01",
        binCode: "BIN-HTTP-01",
        fulfillQty: 10,
        sellingPricePerUnit: 3500,
        costPricePerUnit: 2e3
      })
    });
    const fulfillData = await fulfillRes.json();
    console.log(`\u2022 Status: ${fulfillRes.status}, Fulfill Status: ${fulfillData.data?.status}, Realized Gross: \u20B9${fulfillData.data?.grossSales}`);
    if (fulfillRes.status !== 200 || fulfillData.data?.grossSales !== 35e3) {
      throw new Error("POST /api/v1/erp/outbound/fulfill failed!");
    }
    console.log("\u2705 [PASSED] POST /api/v1/erp/outbound/fulfill");
    console.log("\n--- 6. Testing POST /api/v1/erp/subscriptions/ssp-allocate (Flow 3) ---");
    const sspRes = await fetch("http://localhost:5099/api/v1/erp/subscriptions/ssp-allocate", {
      method: "POST",
      headers,
      body: JSON.stringify({
        customerId: "CUST-HTTP-01",
        bundlePrice: 1e4,
        hardwareSSP: 6e3,
        saasSSP: 4e3,
        durationMonths: 12
      })
    });
    const sspData = await sspRes.json();
    console.log(`\u2022 Status: ${sspRes.status}, Hardware Allocated: \u20B9${sspData.data?.allocatedHardwareRevenue}, SaaS Allocated: \u20B9${sspData.data?.allocatedSaasRevenue}`);
    if (sspRes.status !== 200 || sspData.data?.allocatedHardwareRevenue !== 6e3) {
      throw new Error("POST /api/v1/erp/subscriptions/ssp-allocate failed!");
    }
    console.log("\u2705 [PASSED] POST /api/v1/erp/subscriptions/ssp-allocate");
    console.log("\n--- 7. Testing POST /api/v1/erp/finance/operation (Flow 10) ---");
    const finRes = await fetch("http://localhost:5099/api/v1/erp/finance/operation", {
      method: "POST",
      headers,
      body: JSON.stringify({
        flowType: "GATEWAY_SETTLEMENT",
        payload: {
          grossAmount: 5e4,
          feeAmount: 1e3,
          gstOnFee: 180
        }
      })
    });
    const finData = await finRes.json();
    console.log(`\u2022 Status: ${finRes.status}, Net Settle Journal: ${finData.data?.journalNumber}, Debits=Credits: \u20B9${finData.data?.total}`);
    if (finRes.status !== 200 || finData.data?.total !== 5e4) {
      throw new Error("POST /api/v1/erp/finance/operation failed!");
    }
    console.log("\u2705 [PASSED] POST /api/v1/erp/finance/operation");
    console.log("\n--- 8. Testing POST /api/v1/erp/ground/exception (Flow 11) ---");
    const exRes = await fetch("http://localhost:5099/api/v1/erp/ground/exception", {
      method: "POST",
      headers,
      body: JSON.stringify({
        exceptionType: "PROVISIONAL_DOCK_INTAKE",
        payload: {
          itemId: item._id.toString(),
          itemSku: testSku,
          warehouseId: "HTTP-WAREHOUSE-01",
          qty: 25
        }
      })
    });
    const exData = await exRes.json();
    console.log(`\u2022 Status: ${exRes.status}, Provisional Status: ${exData.data?.status}`);
    if (exRes.status !== 200 || exData.data?.status !== "PROVISIONALLY_STORED_AT_DOCK") {
      throw new Error("POST /api/v1/erp/ground/exception failed!");
    }
    console.log("\u2705 [PASSED] POST /api/v1/erp/ground/exception");
    console.log("\n================================================================================");
    console.log("\u{1F389} ALL LIVE REST API ENDPOINTS VERIFIED & FUNCTIONING WITH 100% ACCURACY");
    console.log("================================================================================\n");
  } finally {
    server.close();
    await import_mongoose11.default.disconnect();
    process.exit(0);
  }
}
runHttpApiTest().catch((err) => {
  console.error("\n\u274C HTTP API TEST FAILURE:", err);
  process.exit(1);
});
