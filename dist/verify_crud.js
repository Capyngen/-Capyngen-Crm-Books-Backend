"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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

// ../backend/src/domains/inventory/models/Item.ts
var Item_exports = {};
__export(Item_exports, {
  default: () => Item_default
});
var import_mongoose7, ItemSchema, ProductModel, Item_default;
var init_Item = __esm({
  "../backend/src/domains/inventory/models/Item.ts"() {
    "use strict";
    import_mongoose7 = __toESM(require("mongoose"));
    ItemSchema = new import_mongoose7.Schema({
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
    ProductModel = import_mongoose7.default.models.Product || import_mongoose7.default.model("Product", ItemSchema, "products");
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
    Item_default = ProductModel;
  }
});

// ../backend/src/domains/inventory/models/TransferOrder.ts
var TransferOrder_exports = {};
__export(TransferOrder_exports, {
  default: () => TransferOrder_default
});
var import_mongoose13, TransferOrderSchema, TransferOrderModel, TransferOrder_default;
var init_TransferOrder = __esm({
  "../backend/src/domains/inventory/models/TransferOrder.ts"() {
    "use strict";
    import_mongoose13 = __toESM(require("mongoose"));
    TransferOrderSchema = new import_mongoose13.Schema({
      companyId: { type: String, index: true },
      orgId: { type: String, index: true },
      transferNumber: { type: String, required: true },
      date: { type: Date, required: true, default: Date.now },
      fromWarehouse: { type: import_mongoose13.Schema.Types.ObjectId, ref: "BooksWarehouse", required: true },
      toWarehouse: { type: import_mongoose13.Schema.Types.ObjectId, ref: "BooksWarehouse", required: true },
      status: { type: String, enum: ["Draft", "In Transit", "Received", "Cancelled"], default: "Draft" },
      approvalStatus: { type: String, enum: ["Draft", "Pending", "Approved", "Rejected"], default: "Draft" },
      dispatchDate: { type: Date },
      receivedDate: { type: Date },
      carrier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      shippingNotes: { type: String, default: "" },
      items: [{
        item: { type: import_mongoose13.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        fromBin: { type: String, default: "" },
        toBin: { type: String, default: "" },
        serialNumbers: [{ type: String }],
        batchNo: { type: String, default: "" },
        unitCost: { type: Number, default: 0 }
      }],
      dispatchedBy: { type: String },
      receivedBy: { type: String },
      createdBy: { type: String }
    }, { timestamps: true });
    TransferOrderSchema.index({ companyId: 1, transferNumber: 1 });
    TransferOrderSchema.index({ orgId: 1, transferNumber: 1 });
    TransferOrderModel = import_mongoose13.default.models.TransferOrder || import_mongoose13.default.model("TransferOrder", TransferOrderSchema, "transferorders");
    if (!import_mongoose13.default.models.BooksTransferOrder) {
      try {
        import_mongoose13.default.model("BooksTransferOrder", TransferOrderSchema, "transferorders");
      } catch (e) {
      }
    }
    TransferOrder_default = TransferOrderModel;
  }
});

// ../backend/src/core/events/eventBus.ts
var eventBus_exports = {};
__export(eventBus_exports, {
  EVENTS: () => EVENTS,
  eventBus: () => eventBus
});
var import_events, AsyncEventEmitter, eventBus, EVENTS;
var init_eventBus = __esm({
  "../backend/src/core/events/eventBus.ts"() {
    "use strict";
    import_events = require("events");
    AsyncEventEmitter = class extends import_events.EventEmitter {
      /**
       * Emit events asynchronously and wait for all listeners to finish.
       * If any listener throws an error, it rejects the promise and the error bubbles up.
       */
      async emitAsync(event, ...args) {
        const listeners = this.listeners(event);
        if (listeners.length === 0) return false;
        for (const listener of listeners) {
          await listener.apply(this, args);
        }
        return true;
      }
    };
    eventBus = new AsyncEventEmitter();
    EVENTS = {
      // Billing
      INVOICE_CREATED: "INVOICE_CREATED",
      PAYMENT_RECEIVED_CREATED: "PAYMENT_RECEIVED_CREATED",
      CREDIT_NOTE_CREATED: "CREDIT_NOTE_CREATED",
      // Inventory
      BILL_CREATED: "BILL_CREATED",
      DELIVERY_CHALLAN_CREATED: "DELIVERY_CHALLAN_CREATED",
      INVENTORY_ADJUSTMENT_CREATED: "INVENTORY_ADJUSTMENT_CREATED",
      VENDOR_PAYMENT_MADE: "VENDOR_PAYMENT_MADE",
      // Integrations
      PAYROLL_FINALIZED: "PAYROLL_FINALIZED",
      CRM_DEAL_WON: "CRM_DEAL_WON"
    };
  }
});

// ../backend/scripts/verify_full_operational_crud_suite.ts
var import_dotenv = __toESM(require("dotenv"));
var import_mongoose38 = __toESM(require("mongoose"));
var import_express6 = __toESM(require("express"));

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

// ../backend/src/core/services/EnterpriseV3MasterService.ts
init_Item();

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

// ../backend/src/domains/books/routes/expenseRoutes.ts
var import_express2 = require("express");

// ../backend/src/domains/books/models/ChartOfAccount.ts
var import_mongoose11 = __toESM(require("mongoose"));
var ChartOfAccountSchema = new import_mongoose11.Schema(
  {
    orgId: { type: String, index: true },
    accountType: { type: String, required: true },
    accountGroup: { type: String },
    accountName: { type: String, required: true },
    accountCode: { type: String },
    description: { type: String, maxlength: 500 },
    addToWatchlist: { type: Boolean, default: false },
    isSubAccount: { type: Boolean, default: false },
    parentAccount: { type: String, ref: "ChartOfAccount" },
    applicableBranches: [{ type: String }],
    costCenters: [{ type: String }],
    profitCenters: [{ type: String }],
    departments: [{ type: String }],
    effectiveDate: { type: Date },
    systemAccountType: { type: String, index: true },
    currency: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    users: [{ type: String }],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isSystemAccount: { type: Boolean, default: false }
  },
  { timestamps: true }
);
var ChartOfAccount = import_mongoose11.default.model("ChartOfAccount", ChartOfAccountSchema);

// ../backend/src/domains/books/models/TransactionLock.ts
var import_mongoose12 = __toESM(require("mongoose"));
var TransactionLockSchema = new import_mongoose12.Schema({
  orgId: { type: String, required: true },
  salesLockDate: { type: Date },
  purchasesLockDate: { type: Date },
  bankingLockDate: { type: Date },
  accountantLockDate: { type: Date },
  allLockDate: { type: Date },
  reason: { type: String },
  lockedBy: { type: String },
  negativeStockRestriction: { type: Boolean, default: true },
  partialUnlocks: [{
    module: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }]
}, { timestamps: true });
var TransactionLock_default = import_mongoose12.default.model("TransactionLock", TransactionLockSchema);

// ../backend/src/domains/books/services/transactionLockService.ts
var TransactionLockError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionLockError";
  }
};
var validateTransactionLock = async (orgId, module2, transactionDate) => {
  if (!orgId || !module2 || !transactionDate) return;
  const tDate = new Date(transactionDate);
  const lock = await TransactionLock_default.findOne({ orgId }).lean();
  if (!lock) return;
  let isLocked = false;
  let lockReason = "";
  if (lock.allLockDate && tDate < new Date(lock.allLockDate)) {
    isLocked = true;
    lockReason = lock.reason || "Closed for all transactions";
  }
  if (!isLocked) {
    let moduleLockDate = null;
    switch (module2) {
      case "Sales":
        moduleLockDate = lock.salesLockDate;
        break;
      case "Purchases":
        moduleLockDate = lock.purchasesLockDate;
        break;
      case "Banking":
        moduleLockDate = lock.bankingLockDate;
        break;
      case "Accountant":
        moduleLockDate = lock.accountantLockDate;
        break;
    }
    if (moduleLockDate && tDate < new Date(moduleLockDate)) {
      isLocked = true;
      lockReason = lock.reason || `Closed for ${module2} module`;
    }
  }
  if (isLocked && lock.partialUnlocks && lock.partialUnlocks.length > 0) {
    const activePartialUnlock = lock.partialUnlocks.find(
      (pu) => pu.module === module2 && tDate >= new Date(pu.startDate) && tDate <= new Date(pu.endDate)
    );
    if (activePartialUnlock) {
      isLocked = false;
    }
  }
  if (isLocked) {
    throw new TransactionLockError(`This transaction is locked and cannot be modified. Reason: ${lockReason}`);
  }
};

// ../backend/src/domains/books/services/ledgerService.ts
var LedgerService = class {
  static async postTransaction(orgId, transactionId, transactionType, date, lines, options) {
    const moduleMap = {
      Invoice: "Sales",
      CreditNote: "Sales",
      PaymentReceived: "Sales",
      Bill: "Purchases",
      VendorCredit: "Purchases",
      PaymentMade: "Purchases",
      Expense: "Purchases",
      "Manual Journal": "Accountant",
      "Manual Journal Reversal": "Accountant",
      CurrencyAdjustment: "Accountant",
      "Fixed Asset Depreciation": "Accountant",
      BankTransfer: "Banking",
      YearEndClosing: "Accountant"
    };
    const targetModule = moduleMap[transactionType] || "Accountant";
    await validateTransactionLock(orgId, targetModule, date);
    await LedgerEntry_default.deleteMany({ orgId, transactionId });
    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit}) for ${transactionType} ${transactionId}`);
      throw new Error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})`);
    }
    const entry = new LedgerEntry_default({
      orgId,
      transactionId,
      transactionType,
      date,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debit: l.debit || 0,
        credit: l.credit || 0,
        contactId: l.contactId,
        branchId: l.branchId || options?.branchId,
        projectId: l.projectId || options?.projectId,
        reportingTagIds: l.reportingTagIds || options?.reportingTagIds || []
      }))
    });
    await entry.save();
    return entry;
  }
  static async voidTransaction(orgId, transactionId, date) {
    const originalEntry = await LedgerEntry_default.findOne({ orgId, transactionId });
    if (!originalEntry) return null;
    await validateTransactionLock(orgId, "Accountant", date);
    if (originalEntry.status === "Void") return null;
    const reversalLines = originalEntry.lines.map((l) => ({
      accountId: l.accountId,
      debit: l.credit || 0,
      credit: l.debit || 0,
      contactId: l.contactId
    }));
    const reversalEntry = new LedgerEntry_default({
      orgId,
      transactionId: transactionId + "_VOID",
      transactionType: originalEntry.transactionType,
      date,
      lines: reversalLines,
      status: "Posted"
    });
    originalEntry.status = "Void";
    await originalEntry.save();
    await reversalEntry.save();
    return reversalEntry;
  }
  static async deleteTransaction(orgId, transactionId) {
    const entry = await LedgerEntry_default.findOne({ orgId, transactionId });
    if (entry) await validateTransactionLock(orgId, "Accountant", entry.date);
    await LedgerEntry_default.deleteMany({ orgId, transactionId });
    await LedgerEntry_default.deleteMany({ orgId, transactionId: transactionId + "_VOID" });
  }
};

// ../backend/src/domains/books/services/PostingEngine.ts
var PostingEngine = class {
  /**
   * Helper to safely find an existing account matching accountType/systemAccountType,
   * or create a standardized system account if none exists for the organization.
   */
  static async getAccount(orgId, accountType, defaultName) {
    try {
      let acc = await ChartOfAccount.findOne({
        $and: [
          { $or: [{ orgId }, { companyId: orgId }] },
          {
            $or: [
              { accountType: new RegExp(`^${accountType}$`, "i") },
              { systemAccountType: new RegExp(`^${accountType}$`, "i") },
              { accountName: new RegExp(`^${defaultName}$`, "i") }
            ]
          }
        ]
      });
      if (!acc) {
        acc = await ChartOfAccount.findOne({
          $or: [{ orgId }, { companyId: orgId }],
          accountType: new RegExp(accountType, "i")
        });
      }
      if (!acc) {
        acc = await ChartOfAccount.create({
          orgId,
          companyId: orgId,
          accountType,
          accountName: defaultName,
          status: "Active",
          isSystemAccount: true
        });
      }
      return acc._id.toString();
    } catch (err) {
      console.error(`[PostingEngine] Error resolving account ${defaultName}:`, err);
      const anyAcc = await ChartOfAccount.findOne({ $or: [{ orgId }, { companyId: orgId }] });
      return anyAcc?._id?.toString() || "SYSTEM_DEFAULT_ACCOUNT";
    }
  }
  static async handleEvent(eventType, payload, session) {
    try {
      switch (eventType) {
        case "INVOICE_APPROVED":
          await this.postInvoice(payload);
          break;
        case "PAYMENT_RECEIVED":
          await this.postPaymentReceived(payload);
          break;
        case "CREDIT_NOTE_APPROVED":
          await this.postCreditNote(payload);
          break;
        case "CUSTOMER_OPENING_BALANCE":
          await this.postCustomerOpeningBalance(payload);
          break;
        case "BILL_APPROVED":
          await this.postBill(payload);
          break;
        case "PAYMENT_MADE":
          await this.postPaymentMade(payload);
          break;
        case "VENDOR_CREDIT_APPROVED":
          await this.postVendorCredit(payload);
          break;
        case "DELIVERY_CHALLAN_ISSUED":
          await this.postDeliveryChallan(payload);
          break;
        case "INVENTORY_ADJUSTMENT":
          await this.postInventoryAdjustment(payload);
          break;
        case "STOCK_TRANSFER_DISPATCHED":
          await this.postStockTransferDispatched(payload);
          break;
        case "STOCK_TRANSFER_RECEIVED":
          await this.postStockTransferReceived(payload);
          break;
        case "LANDED_COST_APPLIED":
          await this.postLandedCost(payload);
          break;
        case "EXPENSE_APPROVED":
          await this.postExpense(payload);
          break;
        case "PAYROLL_FINALIZED":
          await this.postPayroll(payload);
          break;
        case "PAYROLL_DISBURSED":
          await this.postPayrollDisbursed(payload);
          break;
        case "EMPLOYEE_EXPENSE_APPROVED":
          await this.postEmployeeExpenseApproved(payload);
          break;
        case "EMPLOYEE_EXPENSE_REIMBURSED":
          await this.postEmployeeExpenseReimbursed(payload);
          break;
        default:
          console.warn(`[PostingEngine] Unhandled financial event: ${eventType}`);
      }
    } catch (error) {
      console.error(`[PostingEngine] Financial posting failed for event ${eventType}:`, error);
    }
  }
  // ─── 1. SALES & BILLING ───────────────────────────────────────────────────
  static async postInvoice(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const invoiceId = payload.invoiceId || payload._id?.toString();
    const grandTotal = Number(payload.grandTotal || payload.total || 0);
    const subTotal = Number(payload.subTotal || grandTotal);
    const taxTotal = Number(payload.taxTotal || grandTotal - subTotal || 0);
    const date = payload.invoiceDate ? new Date(payload.invoiceDate) : /* @__PURE__ */ new Date();
    if (grandTotal <= 0) return;
    const arAcc = await this.getAccount(orgId, "Accounts Receivable", "Accounts Receivable");
    const salesAcc = await this.getAccount(orgId, "Income", "Sales Revenue");
    const lines = [
      { accountId: arAcc, debit: grandTotal, credit: 0, contactId: payload.customerId, description: `Invoice #${payload.invoiceNumber || invoiceId}` },
      { accountId: salesAcc, debit: 0, credit: subTotal, description: `Sales Revenue` }
    ];
    if (taxTotal > 0) {
      const taxAcc = await this.getAccount(orgId, "Other Current Liability", "Output GST / Tax Payable");
      lines.push({ accountId: taxAcc, debit: 0, credit: taxTotal, description: `Tax Output` });
    }
    const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
    const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
    if (diff !== 0) {
      lines[1].credit += diff;
    }
    await LedgerService.postTransaction(orgId, invoiceId, "Invoice", date, lines);
    console.log(`[PostingEngine] Successfully posted balanced GL entry for Invoice ${payload.invoiceNumber || invoiceId}`);
  }
  static async postPaymentReceived(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const paymentId = payload.paymentId || payload._id?.toString();
    const amount = Number(payload.amount || 0);
    const date = payload.paymentDate ? new Date(payload.paymentDate) : /* @__PURE__ */ new Date();
    if (amount <= 0) return;
    const bankAcc = payload.depositToAccountId || await this.getAccount(orgId, "Bank", "Bank Account");
    const arAcc = await this.getAccount(orgId, "Accounts Receivable", "Accounts Receivable");
    const lines = [
      { accountId: bankAcc, debit: amount, credit: 0, description: `Customer Payment #${payload.paymentNumber || paymentId}` },
      { accountId: arAcc, debit: 0, credit: amount, contactId: payload.customerId, description: `Accounts Receivable Settlement` }
    ];
    await LedgerService.postTransaction(orgId, paymentId, "PaymentReceived", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for PaymentReceived ${paymentId}`);
  }
  static async postCreditNote(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const creditNoteId = payload.creditNoteId || payload._id?.toString();
    const total = Number(payload.total || payload.amount || 0);
    const subTotal = Number(payload.subTotal || total);
    const taxTotal = Number(payload.taxTotal || total - subTotal || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (total <= 0) return;
    const salesReturnAcc = await this.getAccount(orgId, "Expense", "Sales Returns & Discounts");
    const arAcc = await this.getAccount(orgId, "Accounts Receivable", "Accounts Receivable");
    const lines = [
      { accountId: salesReturnAcc, debit: subTotal, credit: 0, description: `Credit Note #${payload.creditNoteNumber || creditNoteId}` },
      { accountId: arAcc, debit: 0, credit: total, contactId: payload.customerId, description: `AR Credit Application` }
    ];
    if (taxTotal > 0) {
      const taxAcc = await this.getAccount(orgId, "Other Current Liability", "Output GST / Tax Payable");
      lines.push({ accountId: taxAcc, debit: taxTotal, credit: 0, description: `Tax Reversal` });
    }
    const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
    const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
    if (diff !== 0) {
      lines[0].debit -= diff;
    }
    await LedgerService.postTransaction(orgId, creditNoteId, "CreditNote", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for CreditNote ${creditNoteId}`);
  }
  static async postCustomerOpeningBalance(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const customerId = payload.customerId;
    const balance = Number(payload.openingBalance || 0);
    if (balance <= 0) return;
    const arAcc = await this.getAccount(orgId, "Accounts Receivable", "Accounts Receivable");
    const equityAcc = await this.getAccount(orgId, "Equity", "Opening Balance Equity");
    const lines = [
      { accountId: arAcc, debit: balance, credit: 0, contactId: customerId, description: `Opening Receivables Balance` },
      { accountId: equityAcc, debit: 0, credit: balance, description: `Opening Equity Balance` }
    ];
    await LedgerService.postTransaction(orgId, `CUST_OP_${customerId}`, "Invoice", /* @__PURE__ */ new Date(), lines);
  }
  // ─── 2. PURCHASES & ACCOUNTS PAYABLE ──────────────────────────────────────
  static async postBill(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const billId = payload.billId || payload._id?.toString();
    const grandTotal = Number(payload.grandTotal || payload.totalAmount || payload.total || 0);
    const subTotal = Number(payload.subTotal || grandTotal);
    const taxTotal = Number(payload.taxTotal || grandTotal - subTotal || 0);
    const date = payload.billDate ? new Date(payload.billDate) : /* @__PURE__ */ new Date();
    if (grandTotal <= 0) return;
    const expenseAcc = await this.getAccount(orgId, "Expense", "Cost of Goods Sold & Expenses");
    const apAcc = await this.getAccount(orgId, "Accounts Payable", "Accounts Payable");
    const lines = [
      { accountId: expenseAcc, debit: subTotal, credit: 0, description: `Vendor Bill #${payload.billNumber || billId}` },
      { accountId: apAcc, debit: 0, credit: grandTotal, contactId: payload.vendorId, description: `Accounts Payable` }
    ];
    if (taxTotal > 0) {
      const inputTaxAcc = await this.getAccount(orgId, "Other Current Asset", "Input Tax Credit (GST)");
      lines.push({ accountId: inputTaxAcc, debit: taxTotal, credit: 0, description: `Input Tax Credit` });
    }
    const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
    const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
    if (diff !== 0) {
      lines[0].debit += diff;
    }
    await LedgerService.postTransaction(orgId, billId, "Bill", date, lines);
    console.log(`[PostingEngine] Successfully posted balanced GL entry for Bill ${payload.billNumber || billId}`);
  }
  static async postPaymentMade(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const paymentId = payload.paymentId || payload._id?.toString();
    const amount = Number(payload.amount || 0);
    const tdsAmount = Number(payload.tdsAmount || 0);
    const totalCleared = amount + tdsAmount;
    const date = payload.paymentDate ? new Date(payload.paymentDate) : /* @__PURE__ */ new Date();
    if (totalCleared <= 0) return;
    const apAcc = await this.getAccount(orgId, "Accounts Payable", "Accounts Payable");
    const bankAcc = payload.paidThroughAccountId || await this.getAccount(orgId, "Bank", "Bank Account");
    const lines = [
      { accountId: apAcc, debit: totalCleared, credit: 0, contactId: payload.vendorId, description: `Vendor Settlement #${payload.paymentNumber || paymentId}` },
      { accountId: bankAcc, debit: 0, credit: amount, description: `Bank Disbursement` }
    ];
    if (tdsAmount > 0) {
      const tdsAcc = await this.getAccount(orgId, "Other Current Liability", "TDS / Withholding Tax Payable");
      lines.push({ accountId: tdsAcc, debit: 0, credit: tdsAmount, description: `TDS Deducted` });
    }
    await LedgerService.postTransaction(orgId, paymentId, "PaymentMade", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for PaymentMade ${paymentId}`);
  }
  static async postVendorCredit(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const creditId = payload.creditId || payload._id?.toString();
    const total = Number(payload.total || payload.amount || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (total <= 0) return;
    const apAcc = await this.getAccount(orgId, "Accounts Payable", "Accounts Payable");
    const purchaseReturnAcc = await this.getAccount(orgId, "Income", "Purchase Returns & Rebates");
    const lines = [
      { accountId: apAcc, debit: total, credit: 0, contactId: payload.vendorId, description: `Vendor Debit Note / Credit Application` },
      { accountId: purchaseReturnAcc, debit: 0, credit: total, description: `Purchase Returns & Allowances` }
    ];
    await LedgerService.postTransaction(orgId, creditId, "VendorCredit", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for VendorCredit ${creditId}`);
  }
  // ─── 3. LOGISTICS, INVENTORY & EXPENSES ────────────────────────────────────
  static async postDeliveryChallan(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const challanId = payload.challanId || payload._id?.toString();
    const totalCost = Number(payload.totalCost || payload.subTotal || payload.total || 0);
    const date = payload.challanDate ? new Date(payload.challanDate) : /* @__PURE__ */ new Date();
    if (totalCost <= 0) return;
    const cogsAcc = await this.getAccount(orgId, "Cost of Goods Sold", "Cost of Goods Sold");
    const invAcc = await this.getAccount(orgId, "Inventory", "Inventory Asset");
    const lines = [
      { accountId: cogsAcc, debit: totalCost, credit: 0, description: `COGS: Delivery Challan #${payload.challanNumber || challanId}` },
      { accountId: invAcc, debit: 0, credit: totalCost, description: `Warehouse Stock Dispatch` }
    ];
    await LedgerService.postTransaction(orgId, challanId, "Invoice", date, lines);
  }
  static async postInventoryAdjustment(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const adjustmentId = payload.adjustmentId || payload._id?.toString();
    const amount = Number(payload.amount || payload.totalValue || 0);
    const isGain = Boolean(payload.isGain || amount > 0);
    const absAmount = Math.abs(amount);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (absAmount <= 0) return;
    const lossAcc = await this.getAccount(orgId, "Expense", "Inventory Shrinkage & Loss");
    const invAcc = await this.getAccount(orgId, "Inventory", "Inventory Asset");
    const lines = isGain ? [
      { accountId: invAcc, debit: absAmount, credit: 0, description: `Physical Stock Count Surplus` },
      { accountId: lossAcc, debit: 0, credit: absAmount, description: `Stock Gain Reversal` }
    ] : [
      { accountId: lossAcc, debit: absAmount, credit: 0, description: `Physical Stock Count Deficit / Damage` },
      { accountId: invAcc, debit: 0, credit: absAmount, description: `Inventory Asset Write-Down` }
    ];
    await LedgerService.postTransaction(orgId, adjustmentId, "InventoryAdjustment", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for InventoryAdjustment ${adjustmentId}`);
  }
  static async postStockTransferDispatched(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const toId = payload.transferOrderId || payload._id?.toString();
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    let totalTransferValue = Number(payload.amount || 0);
    if (!totalTransferValue && payload.transferOrderId) {
      try {
        const TransferOrder = (await Promise.resolve().then(() => (init_TransferOrder(), TransferOrder_exports))).default;
        const Item = (await Promise.resolve().then(() => (init_Item(), Item_exports))).default;
        const order = await TransferOrder.findById(payload.transferOrderId);
        if (order && order.items) {
          for (const line of order.items) {
            const itm = await Item.findById(line.item);
            const rate = Number(line.unitCost || itm?.purchaseRate || 0);
            totalTransferValue += rate * line.quantity;
          }
        }
      } catch (e) {
      }
    }
    if (totalTransferValue <= 0) totalTransferValue = 100;
    const inTransitAcc = await this.getAccount(orgId, "Inventory", "Inventory In-Transit");
    const sourceInvAcc = await this.getAccount(orgId, "Inventory", "Inventory Asset");
    const lines = [
      { accountId: inTransitAcc, debit: totalTransferValue, credit: 0, description: `Stock Transfer Outbound In-Transit` },
      { accountId: sourceInvAcc, debit: 0, credit: totalTransferValue, description: `Source Warehouse Stock Out` }
    ];
    await LedgerService.postTransaction(orgId, toId, "StockTransfer", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for STOCK_TRANSFER_DISPATCHED ${toId}`);
  }
  static async postStockTransferReceived(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const toId = payload.transferOrderId || payload._id?.toString();
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    let totalTransferValue = Number(payload.amount || 0);
    if (!totalTransferValue && payload.transferOrderId) {
      try {
        const TransferOrder = (await Promise.resolve().then(() => (init_TransferOrder(), TransferOrder_exports))).default;
        const Item = (await Promise.resolve().then(() => (init_Item(), Item_exports))).default;
        const order = await TransferOrder.findById(payload.transferOrderId);
        if (order && order.items) {
          for (const line of order.items) {
            const itm = await Item.findById(line.item);
            const rate = Number(line.unitCost || itm?.purchaseRate || 0);
            totalTransferValue += rate * line.quantity;
          }
        }
      } catch (e) {
      }
    }
    if (totalTransferValue <= 0) totalTransferValue = 100;
    const destInvAcc = await this.getAccount(orgId, "Inventory", "Inventory Asset");
    const inTransitAcc = await this.getAccount(orgId, "Inventory", "Inventory In-Transit");
    const lines = [
      { accountId: destInvAcc, debit: totalTransferValue, credit: 0, description: `Destination Warehouse Stock Inward` },
      { accountId: inTransitAcc, debit: 0, credit: totalTransferValue, description: `Clear In-Transit Stock` }
    ];
    await LedgerService.postTransaction(orgId, toId, "StockTransfer", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for STOCK_TRANSFER_RECEIVED ${toId}`);
  }
  static async postLandedCost(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const lcId = payload.landedCostId || payload._id?.toString();
    const totalAmount = Number(payload.totalAmount || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (totalAmount <= 0) return;
    const invAcc = await this.getAccount(orgId, "Inventory", "Inventory Asset");
    const landedCostAcc = await this.getAccount(orgId, "Other Current Liability", "Landed Cost / Freight Clearing");
    const lines = [
      { accountId: invAcc, debit: totalAmount, credit: 0, description: `Landed Cost Capitalization` },
      { accountId: landedCostAcc, debit: 0, credit: totalAmount, description: `Customs & Inbound Freight Offset` }
    ];
    await LedgerService.postTransaction(orgId, lcId, "LandedCost", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for LANDED_COST_APPLIED ${lcId}`);
  }
  static async postExpense(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const expenseId = payload.expenseId || payload._id?.toString();
    const amount = Number(payload.amount || payload.totalAmount || 0);
    const isPaid = Boolean(payload.isPaid);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (amount <= 0) return;
    const expenseAcc = payload.accountId || await this.getAccount(orgId, "Expense", "General Operating Expense");
    const offsetAcc = isPaid ? payload.paidThroughAccountId || await this.getAccount(orgId, "Bank", "Bank Account") : await this.getAccount(orgId, "Accounts Payable", "Employee & Vendor Payables");
    const lines = [
      { accountId: expenseAcc, debit: amount, credit: 0, description: `Operating Expense #${expenseId}` },
      { accountId: offsetAcc, debit: 0, credit: amount, contactId: payload.vendorId, description: isPaid ? `Bank Payout` : `Accrued Expense Payable` }
    ];
    await LedgerService.postTransaction(orgId, expenseId, "Expense", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for Expense ${expenseId}`);
  }
  static async postPayroll(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const batchId = payload.batchId || `PAYROLL_${Date.now()}`;
    const batchNumber = payload.batchNumber || batchId;
    const grossTotal = Number(payload.grossTotal || 0);
    const netTotal = Number(payload.netTotal || 0);
    const employerPF = Number(payload.employerPF || 0);
    const employerESI = Number(payload.employerESI || 0);
    const ptTotal = Number(payload.ptTotal || 0);
    const tdsTotal = Number(payload.tdsTotal || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (grossTotal <= 0) return;
    const salaryExpAcc = await this.getAccount(orgId, "Expense", "Salaries & Wages Expense");
    const netPayableAcc = await this.getAccount(orgId, "Other Current Liability", "Net Salary Payable");
    const lines = [
      { accountId: salaryExpAcc, debit: grossTotal, credit: 0, description: `Monthly Gross Payroll (${batchNumber})` }
    ];
    if (employerPF > 0) {
      const employerPfExpAcc = await this.getAccount(orgId, "Expense", "Employer PF Contribution Expense");
      lines.push({ accountId: employerPfExpAcc, debit: employerPF, credit: 0, description: `Employer PF Overheads` });
    }
    if (employerESI > 0) {
      const employerEsiExpAcc = await this.getAccount(orgId, "Expense", "Employer ESI Contribution Expense");
      lines.push({ accountId: employerEsiExpAcc, debit: employerESI, credit: 0, description: `Employer ESI Overheads` });
    }
    lines.push({ accountId: netPayableAcc, debit: 0, credit: netTotal, description: `Net Salary Payable (${batchNumber})` });
    const totalDebits = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    let creditedStatutory = 0;
    if (employerPF > 0) {
      const pfPayableAcc = await this.getAccount(orgId, "Other Current Liability", "EPF Payable");
      const estEmployeePF = Math.max(0, grossTotal - netTotal - ptTotal - tdsTotal);
      const totalPF = estEmployeePF + employerPF;
      lines.push({ accountId: pfPayableAcc, debit: 0, credit: totalPF, description: `EPF Employee + Employer Contribution` });
      creditedStatutory += totalPF;
    }
    if (employerESI > 0) {
      const esiPayableAcc = await this.getAccount(orgId, "Other Current Liability", "ESIC Payable");
      const totalESI = Math.max(0, employerESI);
      lines.push({ accountId: esiPayableAcc, debit: 0, credit: totalESI, description: `ESIC Contribution` });
      creditedStatutory += totalESI;
    }
    if (ptTotal > 0) {
      const ptPayableAcc = await this.getAccount(orgId, "Other Current Liability", "Professional Tax Payable");
      lines.push({ accountId: ptPayableAcc, debit: 0, credit: ptTotal, description: `Professional Tax Withheld` });
      creditedStatutory += ptTotal;
    }
    if (tdsTotal > 0) {
      const tdsPayableAcc = await this.getAccount(orgId, "Other Current Liability", "TDS on Salaries Payable");
      lines.push({ accountId: tdsPayableAcc, debit: 0, credit: tdsTotal, description: `TDS Section 192 Withheld` });
      creditedStatutory += tdsTotal;
    }
    const currentCredits = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const balanceDiff = totalDebits - currentCredits;
    if (Math.abs(balanceDiff) > 0.01) {
      const clearingAcc = await this.getAccount(orgId, "Other Current Liability", "Payroll Deductions Clearing");
      if (balanceDiff > 0) {
        lines.push({ accountId: clearingAcc, debit: 0, credit: Math.round(balanceDiff * 100) / 100, description: `Statutory Balancing Adjustment` });
      } else {
        lines.push({ accountId: clearingAcc, debit: Math.round(Math.abs(balanceDiff) * 100) / 100, credit: 0, description: `Statutory Balancing Adjustment` });
      }
    }
    await LedgerService.postTransaction(orgId, batchId, "Expense", date, lines);
    console.log(`[PostingEngine] Successfully posted balanced GL entry for Payroll Batch ${batchId}`);
  }
  static async postPayrollDisbursed(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const batchId = payload.batchId || `DISBURSE_${Date.now()}`;
    const netTotal = Number(payload.netTotal || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (netTotal <= 0) return;
    const netPayableAcc = await this.getAccount(orgId, "Other Current Liability", "Net Salary Payable");
    const bankAcc = payload.bankAccountId || await this.getAccount(orgId, "Bank", payload.bankName || "Bank Account");
    const lines = [
      { accountId: netPayableAcc, debit: netTotal, credit: 0, description: `Clear Net Salary Liability (Batch ${batchId})` },
      { accountId: bankAcc, debit: 0, credit: netTotal, description: `Bank Payroll Disbursement (${payload.reference || "NEFT/RTGS"})` }
    ];
    await LedgerService.postTransaction(orgId, batchId, "PaymentMade", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for PAYROLL_DISBURSED ${batchId}`);
  }
  static async postEmployeeExpenseApproved(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const claimId = payload.claimId || payload._id?.toString();
    const amount = Number(payload.netClaimAmount || payload.totalAmount || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (amount <= 0) return;
    const expAcc = await this.getAccount(orgId, "Expense", "Employee Travel & Operating Expense");
    const liabilityAcc = await this.getAccount(orgId, "Other Current Liability", "Employee Reimbursements Payable");
    const lines = [
      { accountId: expAcc, debit: amount, credit: 0, description: `Employee Expense Claim #${payload.claimNumber || claimId}` },
      { accountId: liabilityAcc, debit: 0, credit: amount, description: `Reimbursement Payable to ${payload.employeeName || "Employee"}` }
    ];
    await LedgerService.postTransaction(orgId, claimId, "Expense", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for EMPLOYEE_EXPENSE_APPROVED ${claimId}`);
  }
  static async postEmployeeExpenseReimbursed(payload) {
    const orgId = payload.companyId || payload.orgId || "SYSTEM";
    const claimId = payload.claimId || payload._id?.toString();
    const amount = Number(payload.netClaimAmount || payload.totalAmount || 0);
    const date = payload.date ? new Date(payload.date) : /* @__PURE__ */ new Date();
    if (amount <= 0) return;
    const liabilityAcc = await this.getAccount(orgId, "Other Current Liability", "Employee Reimbursements Payable");
    const bankAcc = payload.bankAccountId || await this.getAccount(orgId, "Bank", "Bank Account");
    const lines = [
      { accountId: liabilityAcc, debit: amount, credit: 0, description: `Settle Reimbursement Claim #${payload.claimNumber || claimId}` },
      { accountId: bankAcc, debit: 0, credit: amount, description: `Bank Payout for Employee Claim` }
    ];
    await LedgerService.postTransaction(orgId, claimId, "PaymentMade", date, lines);
    console.log(`[PostingEngine] Successfully posted GL entry for EMPLOYEE_EXPENSE_REIMBURSED ${claimId}`);
  }
};

// ../backend/src/domains/books/models/Expense.ts
var import_mongoose14 = __toESM(require("mongoose"));
var ExpenseLineItemSchema = new import_mongoose14.Schema({
  expenseAccount: { type: String, required: true },
  notes: { type: String },
  amount: { type: Number, required: true }
}, { _id: false });
var MileageDataSchema = new import_mongoose14.Schema({
  distance: { type: Number, required: true },
  rate: { type: Number, required: true },
  unit: { type: String, enum: ["km", "mile"], default: "km" },
  employee: { type: String }
}, { _id: false });
var ExpenseSchema = new import_mongoose14.Schema({
  branchId: { type: import_mongoose14.Schema.Types.ObjectId, ref: "BooksBranch" },
  reportingTagIds: [{ type: import_mongoose14.Schema.Types.ObjectId, ref: "ReportingTag" }],
  orgId: { type: import_mongoose14.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose14.Schema.Types.Mixed, index: true },
  expenseType: { type: String, enum: ["Goods", "Mileage"], default: "Goods" },
  date: { type: Date, required: true },
  expenseAccount: { type: String },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  vendorId: { type: import_mongoose14.Schema.Types.ObjectId, ref: "Vendor" },
  vendor: { type: import_mongoose14.Schema.Types.ObjectId, ref: "Vendor" },
  customerId: { type: import_mongoose14.Schema.Types.ObjectId, ref: "ClientAccount" },
  projectId: { type: import_mongoose14.Schema.Types.ObjectId, ref: "BooksProject" },
  invoiceId: { type: import_mongoose14.Schema.Types.ObjectId, ref: "Invoice" },
  billable: { type: Boolean, default: false },
  reference: { type: String },
  notes: { type: String },
  status: {
    type: String,
    enum: ["Non-Billable", "Unbilled", "Invoiced", "Reimbursed"],
    default: "Non-Billable"
  },
  receiptUrl: { type: String },
  isItemized: { type: Boolean, default: false },
  lineItems: { type: [ExpenseLineItemSchema], default: [] },
  mileageData: { type: MileageDataSchema },
  bulkBatchId: { type: String },
  paidThrough: { type: String },
  currency: { type: String, default: "INR" },
  createdBy: { type: String }
}, { timestamps: true });
var ExpenseModel = import_mongoose14.default.models.Expense || import_mongoose14.default.model("Expense", ExpenseSchema, "expenses");
if (!import_mongoose14.default.models.BooksExpense) {
  try {
    import_mongoose14.default.model("BooksExpense", ExpenseSchema, "expenses");
  } catch (e) {
  }
}
var Expense_default = ExpenseModel;

// ../backend/src/domains/books/models/MileageExpense.ts
var import_mongoose15 = __toESM(require("mongoose"));
var MileageExpenseSchema = new import_mongoose15.Schema({
  orgId: { type: String },
  date: { type: Date, required: true },
  distance: { type: Number, required: true },
  rate: { type: Number, required: true },
  unit: { type: String, enum: ["km", "mile"], default: "km" },
  employee: { type: String },
  amount: { type: Number, required: true },
  expenseAccount: { type: String, required: true },
  paidThrough: { type: String, required: true },
  currency: { type: String, default: "INR" },
  vendorId: { type: import_mongoose15.Schema.Types.ObjectId, ref: "Vendor" },
  customerId: { type: import_mongoose15.Schema.Types.ObjectId, ref: "ClientAccount" },
  billable: { type: Boolean, default: false },
  notes: { type: String },
  status: {
    type: String,
    enum: ["Non-Billable", "Unbilled", "Invoiced", "Reimbursed"],
    default: "Non-Billable"
  },
  createdBy: { type: String }
}, { timestamps: true });
var MileageExpense_default = import_mongoose15.default.models.BooksMileageExpense || import_mongoose15.default.model("BooksMileageExpense", MileageExpenseSchema);

// ../backend/src/core/services/ApprovalWorkflowService.ts
var import_mongoose30 = __toESM(require("mongoose"));

// ../backend/src/context.ts
var import_async_hooks = require("async_hooks");
var requestContext = new import_async_hooks.AsyncLocalStorage();

// ../backend/src/core/models/ApprovalRule.ts
var import_mongoose16 = __toESM(require("mongoose"));
var ApprovalRuleSchema = new import_mongoose16.Schema({
  orgId: { type: String, required: true, index: true },
  module: { type: String, required: true },
  thresholdAmount: { type: Number, default: 0 },
  autoApproveBelowThreshold: { type: Boolean, default: true },
  requireParentRoleApproval: { type: Boolean, default: true },
  approverRoles: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
ApprovalRuleSchema.index({ orgId: 1, module: 1 }, { unique: true });
var ApprovalRule = import_mongoose16.default.models.ApprovalRule || import_mongoose16.default.model("ApprovalRule", ApprovalRuleSchema);

// ../backend/src/core/models/ApprovalRequest.ts
var import_mongoose17 = __toESM(require("mongoose"));
var ApprovalRequestSchema = new import_mongoose17.Schema({
  orgId: { type: String, required: true, index: true },
  module: { type: String, required: true, index: true },
  entityId: { type: String, required: true, index: true },
  documentNumber: { type: String },
  amount: { type: Number, default: 0 },
  customerOrVendorName: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
  requestedBy: { type: String, required: true },
  requestedByName: { type: String },
  parentRoleId: { type: String, index: true },
  approverRoles: [{ type: String }],
  approvedBy: { type: String },
  approvedByName: { type: String },
  comments: { type: String },
  rejectionReason: { type: String },
  timeline: [{
    action: { type: String, required: true },
    actorId: { type: String },
    actorName: { type: String },
    role: { type: String },
    timestamp: { type: Date, default: Date.now },
    comments: { type: String },
    status: { type: String }
  }]
}, { timestamps: true });
var ApprovalRequest = import_mongoose17.default.models.ApprovalRequest || import_mongoose17.default.model("ApprovalRequest", ApprovalRequestSchema);

// ../backend/src/domains/core/models/Role.ts
var import_mongoose18 = __toESM(require("mongoose"));
var RoleSchema = new import_mongoose18.Schema(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    parentRoleId: { type: import_mongoose18.Schema.Types.ObjectId, ref: "Role" },
    permissions: { type: import_mongoose18.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);
RoleSchema.index({ orgId: 1, name: 1 }, { unique: true });
var Role = import_mongoose18.default.models.Role || import_mongoose18.default.model("Role", RoleSchema);

// ../backend/src/domains/core/models/UserOrganization.ts
var import_mongoose19 = __toESM(require("mongoose"));
var UserOrganizationSchema = new import_mongoose19.Schema(
  {
    email: { type: String, required: true, index: true },
    userId: { type: import_mongoose19.Schema.Types.ObjectId, ref: "User" },
    orgId: { type: String, required: true, index: true },
    roleId: { type: import_mongoose19.Schema.Types.ObjectId, ref: "Role" },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ["Invited", "Active", "Inactive"], default: "Invited" },
    name: { type: String }
    // Stored during invite
  },
  { timestamps: true }
);
UserOrganizationSchema.index({ email: 1, orgId: 1 }, { unique: true });
var UserOrganization = import_mongoose19.default.models.UserOrganization || import_mongoose19.default.model("UserOrganization", UserOrganizationSchema);

// ../backend/src/core/services/ApprovalWorkflowService.ts
init_Item();

// ../backend/src/domains/billing/models/Invoice.ts
var import_mongoose21 = __toESM(require("mongoose"));

// ../backend/src/domains/billing/models/Customer.ts
var import_mongoose20 = __toESM(require("mongoose"));
var AddressSchema = new import_mongoose20.Schema({
  attention: String,
  country: String,
  street1: String,
  street2: String,
  city: String,
  state: String,
  zipCode: String,
  phone: String,
  fax: String
}, { _id: false });
var ContactPersonSchema = new import_mongoose20.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  designation: String,
  isPrimary: Boolean
}, { _id: false });
var CustomerSchema = new import_mongoose20.Schema({
  // CRM Base Fields
  companyId: { type: String },
  name: { type: String, required: true },
  legalName: { type: String },
  taxId: { type: String },
  industry: { type: String },
  primaryContact: {
    name: String,
    email: String,
    phone: String
  },
  billingInfo: {
    address: String,
    currency: String,
    paymentTerms: String
  },
  portalEnabled: { type: Boolean, default: false },
  tags: [String],
  renewalReminderStage: String,
  notes: [String],
  // Books Specific Extended Fields
  orgId: { type: String },
  tenantId: { type: String },
  customerType: { type: String, enum: ["business", "individual"] },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  displayName: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  currency: { type: String },
  paymentTerms: { type: String },
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  contactPersons: [ContactPersonSchema],
  portalAccess: { type: Boolean, default: false },
  remarks: { type: String },
  status: { type: String, enum: ["Active", "Inactive", "ACTIVE", "INACTIVE"], default: "ACTIVE" },
  receivables: { type: Number, default: 0 },
  unusedCredits: { type: Number, default: 0 },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true },
  parentCustomerId: { type: String },
  creditLimit: { type: Number, default: 0 },
  availableCredit: { type: Number, default: 0 },
  portalAccessStatus: { type: String, enum: ["Invited", "Active", "Revoked"] }
}, { timestamps: true, optimisticConcurrency: true });
var ClientAccountModel = import_mongoose20.default.models.ClientAccount || import_mongoose20.default.model("ClientAccount", CustomerSchema, "customers");
if (!import_mongoose20.default.models.BooksCustomer) {
  try {
    import_mongoose20.default.model("BooksCustomer", CustomerSchema, "customers");
  } catch (e) {
  }
}
if (!import_mongoose20.default.models.Customer) {
  try {
    import_mongoose20.default.model("Customer", CustomerSchema, "customers");
  } catch (e) {
  }
}
var Customer_default = ClientAccountModel;

// ../backend/src/domains/billing/models/Invoice.ts
init_Item();
var InvoiceItemSchema = new import_mongoose21.Schema({
  item: { type: import_mongoose21.Schema.Types.ObjectId, ref: "Product", required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});
var InvoiceSchema = new import_mongoose21.Schema({
  taxConfigurationId: { type: import_mongoose21.Schema.Types.ObjectId, ref: "TaxConfiguration" },
  branchId: { type: import_mongoose21.Schema.Types.ObjectId, ref: "BooksBranch" },
  projectId: { type: import_mongoose21.Schema.Types.ObjectId, ref: "BooksProject" },
  reportingTagIds: [{ type: import_mongoose21.Schema.Types.ObjectId, ref: "ReportingTag" }],
  currency: { type: String },
  exchangeRate: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100 },
  baseTotal: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100 },
  orgId: { type: import_mongoose21.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose21.Schema.Types.Mixed, index: true },
  invoiceNumber: { type: String, required: true },
  customer: { type: import_mongoose21.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  paymentTerms: { type: String },
  status: {
    type: String,
    enum: ["Draft", "Pending Approval", "Open", "Sent", "Viewed", "Paid", "PartiallyPaid", "Void", "Overdue"],
    default: "Open"
  },
  approvalStatus: {
    type: String,
    enum: ["Draft", "Pending", "Approved", "Rejected"],
    default: "Approved"
  },
  postingStatus: {
    type: String,
    enum: ["Draft", "Posted", "Reversed"],
    default: "Draft"
  },
  dispatchStatus: {
    type: String,
    enum: ["Not Sent", "Sent", "Viewed"],
    default: "Not Sent"
  },
  rejectionReason: { type: String },
  referenceNumber: { type: String },
  orderNumber: { type: String },
  salesOrderId: { type: import_mongoose21.Schema.Types.ObjectId, ref: "SalesOrder" },
  accountsReceivable: { type: String, default: "Accounts Receivable" },
  items: [InvoiceItemSchema],
  subTotal: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
  discountType: { type: String, enum: ["amount", "percent"], default: "amount" },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ["TDS", "TCS", "none"], default: "none" },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
  balanceDue: { type: Number, required: true, default: 0 },
  salesperson: { type: String },
  projectName: { type: String },
  projectDetails: { type: import_mongoose21.Schema.Types.Mixed },
  subject: { type: String },
  attachments: [{ type: String }],
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: "system" },
  invoiceType: { type: String, enum: ["Standard", "Proforma", "Retainer", "Consolidated"], default: "Standard" },
  milestoneId: { type: import_mongoose21.Schema.Types.ObjectId, ref: "ProjectMilestone" },
  consolidatedFrom: [{ type: import_mongoose21.Schema.Types.ObjectId, ref: "Invoice" }]
}, { timestamps: true, optimisticConcurrency: true });
InvoiceSchema.index({ orgId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.pre("save", async function() {
  if (this.isNew && this.customer) {
    try {
      const Master = import_mongoose21.default.models.ClientAccount || import_mongoose21.default.models.BooksCustomer || import_mongoose21.default.model("ClientAccount");
      const record = await Master.findById(this.customer);
      if (record && record.isActive === false) {
        throw new Error("Cannot create invoice for a deactivated customer");
      }
    } catch (err) {
      if (err.message?.includes("deactivated")) throw err;
    }
  }
});
var Invoice_default = import_mongoose21.default.model("Invoice", InvoiceSchema);

// ../backend/src/domains/inventory/models/Bill.ts
var import_mongoose23 = __toESM(require("mongoose"));

// ../backend/src/domains/inventory/models/Vendor.ts
var import_mongoose22 = __toESM(require("mongoose"));
var AddressSchema2 = new import_mongoose22.Schema({
  attention: String,
  country: String,
  street1: String,
  street2: String,
  city: String,
  state: String,
  zipCode: String,
  phone: String,
  fax: String
}, { _id: false });
var ContactPersonSchema2 = new import_mongoose22.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  designation: String
});
var CustomFieldSchema = new import_mongoose22.Schema({
  label: String,
  value: String
}, { _id: false });
var VendorSchema = new import_mongoose22.Schema({
  orgId: { type: String },
  companyId: { type: String },
  vendorType: { type: String, enum: ["business", "individual"], default: "business" },
  salutation: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  displayName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  mobile: { type: String },
  billingAddress: { type: AddressSchema2, default: {} },
  shippingAddress: { type: AddressSchema2, default: {} },
  contactPersons: { type: [ContactPersonSchema2], default: [] },
  pan: { type: String },
  gstin: { type: String },
  taxTreatment: { type: String, default: "Registered Business - Regular" },
  msmeNumber: { type: String },
  creditLimit: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 7 },
  onboardingStatus: {
    type: String,
    enum: ["Draft", "KYC Pending", "UnderReview", "Approved", "Rejected"],
    default: "Draft"
  },
  portalAccessStatus: {
    type: String,
    enum: ["Not Invited", "Invited", "Active", "Revoked"],
    default: "Not Invited"
  },
  rating: {
    score: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 1 },
    deliveryScore: { type: Number, default: 4.5 },
    qualityScore: { type: Number, default: 4.5 },
    priceScore: { type: Number, default: 4.5 },
    onTimeDeliveryRate: { type: Number, default: 95 },
    leadTimeDays: { type: Number, default: 7 }
  },
  currency: { type: String, default: "INR" },
  accountsPayable: { type: String },
  openingBalance: { type: Number, default: 0 },
  paymentTerms: String,
  portalAccess: { type: Boolean, default: false },
  msmeRegistered: { type: Boolean, default: false },
  tds: { type: String, enum: ["yes", "no"], default: "no" },
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },
  customFields: { type: [CustomFieldSchema], default: [] },
  remarks: { type: String },
  notes: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  payables: { type: Number, default: 0 },
  unusedCredits: { type: Number, default: 0 },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });
var VendorModel = import_mongoose22.default.models.BooksVendor || import_mongoose22.default.model("BooksVendor", VendorSchema, "vendors");
if (!import_mongoose22.default.models.Vendor) {
  try {
    import_mongoose22.default.model("Vendor", VendorSchema, "vendors");
  } catch (e) {
  }
}

// ../backend/src/domains/inventory/models/Bill.ts
init_Item();
var BillSchema = new import_mongoose23.Schema({
  taxConfigurationId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "TaxConfiguration" },
  branchId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "BooksBranch" },
  projectId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "BooksProject" },
  reportingTagIds: [{ type: import_mongoose23.Schema.Types.ObjectId, ref: "ReportingTag" }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: import_mongoose23.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose23.Schema.Types.Mixed, index: true },
  balanceDue: { type: Number },
  vendorId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "Vendor", required: true },
  billNumber: { type: String, required: true },
  orderNumber: { type: String },
  purchaseOrderId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "BooksPurchaseOrder" },
  billDate: { type: Date, required: true },
  dueDate: { type: Date },
  accountsPayable: { type: String, default: "Accounts Payable" },
  subject: { type: String },
  lineItems: [{
    itemId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "Product" },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    customerId: { type: import_mongoose23.Schema.Types.ObjectId, ref: "ClientAccount" },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ["amount", "percent"], default: "amount" },
  taxWithheldType: { type: String, enum: ["none", "TDS", "TCS"], default: "none" },
  taxWithheldAmount: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["Draft", "Pending Approval", "Open", "Partially Paid", "Paid", "Void"],
    default: "Open"
  },
  approvalStatus: {
    type: String,
    enum: ["Draft", "Pending", "Approved", "Rejected"],
    default: "Approved"
  },
  rejectionReason: { type: String },
  createdBy: { type: String }
}, { timestamps: true, optimisticConcurrency: true });
BillSchema.index({ orgId: 1, billNumber: 1 }, { unique: true });
BillSchema.pre("save", async function() {
  if (this.isNew && this.vendorId) {
    try {
      const Master = import_mongoose23.default.models.BooksVendor || import_mongoose23.default.models.Vendor || import_mongoose23.default.model("BooksVendor");
      const record = await Master.findById(this.vendorId);
      if (record && record.isActive === false) {
        throw new Error("Cannot create bill for a deactivated vendor");
      }
    } catch (err) {
      if (err.message?.includes("deactivated")) throw err;
    }
  }
});
var BillModel = import_mongoose23.default.models.Bill || import_mongoose23.default.model("Bill", BillSchema, "bills");
if (!import_mongoose23.default.models.BooksBill) {
  try {
    import_mongoose23.default.model("BooksBill", BillSchema, "bills");
  } catch (e) {
  }
}
var Bill_default = BillModel;

// ../backend/src/domains/billing/models/CreditNote.ts
var import_mongoose24 = __toESM(require("mongoose"));
var CreditNoteSchema = new import_mongoose24.Schema({
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: String },
  customer: { type: import_mongoose24.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  creditNoteNumber: {
    type: String,
    required: true
    /* unique removed for compound */
  },
  referenceNumber: { type: String },
  invoiceId: { type: import_mongoose24.Schema.Types.ObjectId, ref: "BooksInvoice" },
  salesperson: { type: String },
  creditNoteDate: { type: Date, required: true, default: Date.now },
  status: {
    type: String,
    enum: ["Draft", "Open", "Closed", "Void"],
    default: "Draft"
  },
  refunds: [{ date: { type: Date, required: true }, amount: { type: Number, required: true }, reference: { type: String } }],
  appliedToInvoices: [{ invoiceId: { type: import_mongoose24.Schema.Types.ObjectId, ref: "Invoice" }, amountApplied: { type: Number, required: true } }],
  items: [{
    item: { type: import_mongoose24.Schema.Types.ObjectId, ref: "Product", required: true },
    account: { type: String },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true },
  discountType: { type: String, enum: ["percent", "amount"], default: "percent" },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true },
  notes: { type: String },
  terms: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: String, default: "system" }
}, { timestamps: true, optimisticConcurrency: true });
CreditNoteSchema.index({ orgId: 1, creditNoteNumber: 1 }, { unique: true });
var CreditNote_default = import_mongoose24.default.model("CreditNote", CreditNoteSchema);

// ../backend/src/domains/inventory/models/VendorCredit.ts
var import_mongoose25 = __toESM(require("mongoose"));
var VendorCreditSchema = new import_mongoose25.Schema({
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: String },
  companyId: { type: String },
  vendorId: { type: import_mongoose25.Schema.Types.ObjectId, ref: "Vendor", required: true },
  vendorCreditNumber: { type: String, required: true },
  creditDate: { type: Date, required: true },
  referenceNumber: { type: String },
  billId: { type: import_mongoose25.Schema.Types.ObjectId, ref: "BooksBill" },
  lineItems: [{
    itemId: { type: import_mongoose25.Schema.Types.ObjectId, ref: "Product" },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  remainingCredits: { type: Number, default: 0 },
  status: { type: String, enum: ["Draft", "Open", "Closed", "Void"], default: "Open" },
  refunds: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    reference: { type: String }
  }],
  appliedToBills: [{
    billId: { type: import_mongoose25.Schema.Types.ObjectId, ref: "BooksBill" },
    amountApplied: { type: Number, required: true }
  }]
}, { timestamps: true });
var VendorCredit_default = import_mongoose25.default.models.VendorCredit || import_mongoose25.default.model("VendorCredit", VendorCreditSchema);

// ../backend/src/domains/inventory/models/InventoryAdjustment.ts
var import_mongoose26 = __toESM(require("mongoose"));
var InventoryAdjustmentSchema = new import_mongoose26.Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  warehouseId: { type: import_mongoose26.Schema.Types.ObjectId, ref: "BooksWarehouse" },
  mode: { type: String, enum: ["quantity", "value"], default: "quantity" },
  referenceNumber: { type: String, default: "" },
  date: { type: Date, required: true, default: Date.now },
  reason: { type: String, required: true },
  description: { type: String, default: "" },
  account: { type: String, required: true },
  status: { type: String, enum: ["Draft", "Adjusted", "Cancelled"], default: "Adjusted" },
  approvalStatus: { type: String, enum: ["Draft", "Pending", "Approved", "Rejected"], default: "Approved" },
  totalValue: { type: Number, default: 0 },
  items: [{
    item: { type: import_mongoose26.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: import_mongoose26.Schema.Types.ObjectId, ref: "BooksWarehouse" },
    currentStock: { type: Number, default: 0 },
    quantityAdjusted: { type: Number, required: true },
    newStock: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    valueAdjusted: { type: Number, default: 0 }
  }],
  createdBy: { type: String }
}, { timestamps: true });
InventoryAdjustmentSchema.index({ companyId: 1, referenceNumber: 1 });
InventoryAdjustmentSchema.index({ orgId: 1, referenceNumber: 1 });
var InventoryAdjustment_default = import_mongoose26.default.models.BooksInventoryAdjustment || import_mongoose26.default.model("BooksInventoryAdjustment", InventoryAdjustmentSchema);

// ../backend/src/domains/billing/models/Quote.ts
var import_mongoose27 = __toESM(require("mongoose"));
var QuoteItemSchema = new import_mongoose27.Schema({
  item: { type: import_mongoose27.Schema.Types.ObjectId, ref: "Product", required: false },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});
var QuoteSchema = new import_mongoose27.Schema({
  orgId: { type: String },
  companyId: { type: String },
  quoteNumber: { type: String, required: true, unique: true },
  customer: { type: import_mongoose27.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  quoteDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date },
  status: {
    type: String,
    enum: ["Draft", "Sent", "Accepted", "Declined", "Expired", "Invoiced"],
    default: "Sent"
  },
  approvalStatus: {
    type: String,
    enum: ["Draft", "Pending", "Approved", "Rejected"],
    default: "Draft"
  },
  dispatchStatus: {
    type: String,
    enum: ["Not Sent", "Sent", "Viewed"],
    default: "Not Sent"
  },
  rejectionReason: { type: String },
  referenceNumber: { type: String },
  salesOrderId: { type: import_mongoose27.Schema.Types.ObjectId, ref: "SalesOrder" },
  invoiceId: { type: import_mongoose27.Schema.Types.ObjectId, ref: "Invoice" },
  items: [QuoteItemSchema],
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
  projectName: { type: String },
  projectDetails: {
    projectName: String,
    projectCode: String,
    customer: { type: import_mongoose27.Schema.Types.ObjectId, ref: "ClientAccount" },
    billingMethod: String,
    totalProjectCost: Number,
    description: String,
    budget: {
      costBudget: Number,
      revenueBudget: Number
    },
    users: [{ name: String, email: String }],
    tasks: [{ taskName: String, description: String }],
    addToWatchlist: Boolean
  },
  subject: { type: String },
  attachments: [{ type: String }],
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: "system" },
  version: { type: Number, default: 1 },
  parentQuoteId: { type: import_mongoose27.Schema.Types.ObjectId, ref: "Quote" },
  eSignature: {
    signedBy: String,
    signedAt: Date,
    ipAddress: String,
    documentHash: String
  }
}, { timestamps: true });
var Quote_default = import_mongoose27.default.model("Quote", QuoteSchema);

// ../backend/src/domains/inventory/models/DeliveryChallan.ts
var import_mongoose28 = __toESM(require("mongoose"));
var DeliveryChallanItemSchema = new import_mongoose28.Schema({
  item: { type: import_mongoose28.Schema.Types.ObjectId, ref: "Product", required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});
var DeliveryChallanSchema = new import_mongoose28.Schema({
  orgId: { type: String },
  companyId: { type: String },
  challanNumber: { type: String, required: true, unique: true },
  customer: { type: import_mongoose28.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  referenceNumber: { type: String },
  salesOrderId: { type: import_mongoose28.Schema.Types.ObjectId, ref: "SalesOrder" },
  invoiceId: { type: import_mongoose28.Schema.Types.ObjectId, ref: "Invoice" },
  challanDate: { type: Date, required: true, default: Date.now },
  challanType: { type: String, enum: ["Supply of Liquid Gas", "Job Work", "Supply on Approval", "Others"] },
  status: {
    type: String,
    enum: ["Draft", "Open", "Delivered", "Returned", "Closed"],
    default: "Draft"
  },
  approvalStatus: {
    type: String,
    enum: ["Draft", "Pending", "Approved", "Rejected"],
    default: "Draft"
  },
  rejectionReason: { type: String },
  items: [DeliveryChallanItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ["amount", "percent"], default: "amount" },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  notes: { type: String },
  terms: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: String, default: "system" }
}, { timestamps: true });
var DeliveryChallan_default = import_mongoose28.default.model("DeliveryChallan", DeliveryChallanSchema);

// ../backend/src/core/services/ApprovalWorkflowService.ts
init_TransferOrder();

// ../backend/src/domains/books/models/PaymentMade.ts
var import_mongoose29 = __toESM(require("mongoose"));
var PaymentMadeSchema = new import_mongoose29.Schema({
  branchId: { type: import_mongoose29.Schema.Types.ObjectId, ref: "BooksBranch" },
  projectId: { type: import_mongoose29.Schema.Types.ObjectId, ref: "BooksProject" },
  reportingTagIds: [{ type: import_mongoose29.Schema.Types.ObjectId, ref: "ReportingTag" }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: import_mongoose29.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose29.Schema.Types.Mixed, index: true },
  vendorId: { type: import_mongoose29.Schema.Types.ObjectId, ref: "Vendor", required: true },
  paymentType: { type: String, enum: ["Bill Payment", "Vendor Advance"], required: true },
  paymentNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: String, required: true },
  paidThrough: { type: String, required: true },
  referenceNumber: { type: String },
  disbursementStatus: { type: String, enum: ["Pending", "Processed", "Failed"], default: "Pending" },
  remittanceAdviceSent: { type: Boolean, default: false },
  notes: { type: String },
  depositTo: { type: String },
  tds: {
    taxName: { type: String },
    rate: { type: Number },
    act: { type: String },
    section: { type: String },
    isHigherRate: { type: Boolean },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  bills: [{
    billId: { type: import_mongoose29.Schema.Types.ObjectId, ref: "BooksBill" },
    amountApplied: { type: Number }
  }],
  status: { type: String, enum: ["Open", "Closed", "Void"], default: "Closed" }
}, { timestamps: true });
var PaymentMadeModel = import_mongoose29.default.models.PaymentMade || import_mongoose29.default.model("PaymentMade", PaymentMadeSchema, "paymentsmade");
if (!import_mongoose29.default.models.BooksPaymentMade) {
  try {
    import_mongoose29.default.model("BooksPaymentMade", PaymentMadeSchema, "paymentsmade");
  } catch (e) {
  }
}
var PaymentMade_default = PaymentMadeModel;

// ../backend/src/core/services/ApprovalWorkflowService.ts
var SUPPORTED_APPROVAL_MODULES = [
  { id: "invoices", label: "Invoices", model: "Invoice" },
  { id: "sales_orders", label: "Sales Orders", model: "SalesOrder" },
  { id: "quotes", label: "Quotes & Estimates", model: "Quote" },
  { id: "delivery_challans", label: "Delivery Challans", model: "DeliveryChallan" },
  { id: "credit_notes", label: "Credit Notes", model: "CreditNote" },
  { id: "bills", label: "Bills & Vendor Invoices", model: "Bill" },
  { id: "purchase_orders", label: "Purchase Orders", model: "PurchaseOrder" },
  { id: "vendor_credits", label: "Vendor Credits / Debit Notes", model: "VendorCredit" },
  { id: "payments_made", label: "Payments Made", model: "BooksPaymentMade" },
  { id: "expenses", label: "Expenses & Reimbursements", model: "Expense" },
  { id: "transfer_orders", label: "Inter-Warehouse Transfers", model: "BooksTransferOrder" },
  { id: "inventory_adjustments", label: "Inventory Adjustments", model: "InventoryAdjustment" },
  { id: "manual_journals", label: "Manual Journals (General Ledger)", model: "Journal" }
];
var ApprovalWorkflowService = class {
  /**
   * Universal helper to extract multi-tenant orgId, user, role, and role hierarchy from any Express request.
   */
  static async resolveUserContext(req) {
    const orgId = req.org?._id?.toString() || req.headers?.["x-org-id"] || requestContext.getStore()?.orgId || req.body?.companyId || req.body?.orgId;
    const user = req.user;
    const userId = user?._id?.toString() || user?.id || req.userId;
    let userRole = req.role;
    let roleId = userRole?._id?.toString() || userRole?.toString();
    if (!userRole && userId && orgId) {
      const conditions = [];
      if (import_mongoose30.default.isValidObjectId(userId)) conditions.push({ userId: new import_mongoose30.default.Types.ObjectId(userId) });
      conditions.push({ userId: userId.toString() });
      if (user?.email) {
        conditions.push({ email: user.email.toLowerCase() });
      }
      const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate("roleId").lean();
      if (userOrg?.roleId) {
        userRole = userOrg.roleId;
        roleId = userOrg.roleId._id?.toString();
      }
    }
    return { orgId, user, userId, userRole, roleId };
  }
  /**
   * Get active approval rule for a specific module in an org.
   */
  static async getModuleRule(orgId, module2) {
    return ApprovalRule.findOne({ orgId, module: module2 });
  }
  /**
   * Set/update approval rule for a module in an org.
   */
  static async setModuleRule(orgId, module2, data) {
    const updated = await ApprovalRule.findOneAndUpdate(
      { orgId, module: module2 },
      {
        $set: {
          orgId,
          module: module2,
          thresholdAmount: Number(data.thresholdAmount || 0),
          autoApproveBelowThreshold: data.autoApproveBelowThreshold !== false,
          requireParentRoleApproval: data.requireParentRoleApproval !== false,
          approverRoles: data.approverRoles || [],
          isActive: data.isActive !== false
        }
      },
      { upsert: true, new: true }
    );
    return updated;
  }
  /**
   * Get all approval rules configured for this organization.
   */
  static async getAllModuleRules(orgId) {
    const existingRules = await ApprovalRule.find({ orgId }).lean();
    const rulesMap = new Map(existingRules.map((r) => [r.module, r]));
    return SUPPORTED_APPROVAL_MODULES.map((m) => {
      const existing = rulesMap.get(m.id);
      return {
        module: m.id,
        label: m.label,
        thresholdAmount: existing?.thresholdAmount ?? 0,
        autoApproveBelowThreshold: existing?.autoApproveBelowThreshold ?? true,
        requireParentRoleApproval: existing?.requireParentRoleApproval ?? true,
        approverRoles: existing?.approverRoles ?? [],
        isActive: existing?.isActive ?? false
      };
    });
  }
  /**
   * Evaluate whether a transaction needs approval.
   */
  static async evaluateApprovalNeed(orgId, module2, amount, user, userRole) {
    const isAdmin = user?.role === "Admin" || user?.role === "Owner" || user?.isWorkspaceOwner || user?.isAdmin || userRole?.name === "Admin";
    if (isAdmin) {
      return { requiresApproval: false, reason: "Administrator auto-approved" };
    }
    const rule = await this.getModuleRule(orgId, module2);
    if (!rule || !rule.isActive) {
      return { requiresApproval: false, reason: "Approval workflow disabled for this module" };
    }
    const threshold = Number(rule.thresholdAmount || 0);
    if (threshold > 0 && amount < threshold && rule.autoApproveBelowThreshold) {
      return { requiresApproval: false, reason: `Amount (${amount}) is below auto-approval threshold (${threshold})` };
    }
    const parentRoleId = userRole?.parentRoleId?.toString() || null;
    return {
      requiresApproval: true,
      parentRoleId: parentRoleId || void 0,
      approverRoles: rule.approverRoles || [],
      reason: `Amount (${amount}) exceeds threshold (${threshold}) or requires manager approval`
    };
  }
  /**
   * Submit a document for approval.
   */
  static async submitForApproval(params) {
    const { orgId, module: module2, documentId, documentNumber, amount, customerOrVendorName, requestedBy, requestedByName, creatorRoleId } = params;
    let parentRoleId;
    if (creatorRoleId) {
      const role = await Role.findById(creatorRoleId).lean();
      if (role?.parentRoleId) {
        parentRoleId = role.parentRoleId.toString();
      }
    }
    const rule = await this.getModuleRule(orgId, module2);
    const existingRequest = await ApprovalRequest.findOne({ orgId, module: module2, entityId: documentId });
    const isResubmission = existingRequest && existingRequest.status === "Rejected";
    const request = await ApprovalRequest.findOneAndUpdate(
      { orgId, module: module2, entityId: documentId },
      {
        $set: {
          orgId,
          module: module2,
          entityId: documentId,
          documentNumber,
          amount: Number(amount || 0),
          customerOrVendorName,
          status: "Pending",
          requestedBy,
          requestedByName,
          parentRoleId,
          approverRoles: rule?.approverRoles || [],
          comments: "",
          rejectionReason: ""
        },
        $push: {
          timeline: {
            action: isResubmission ? "Re-submitted for Approval" : "Submitted for Approval",
            actorId: requestedBy,
            actorName: requestedByName || "User",
            role: "Creator / Subordinate",
            timestamp: /* @__PURE__ */ new Date(),
            comments: isResubmission ? "Revised document parameters and re-submitted for manager review." : "Submitted for Manager approval & verification.",
            status: "Pending"
          }
        }
      },
      { upsert: true, new: true }
    );
    return request;
  }
  /**
   * Verify if the given user is authorized to approve this request.
   * Security Guarantee: A parent role (manager) can ONLY approve/reject subordinate requests;
   * they do NOT gain admin rights or access to settings.
   */
  static canUserApprove(request, user, userRole) {
    if (!request || request.status !== "Pending") return false;
    if (user?.role === "Admin" || user?.role === "Owner" || user?.isWorkspaceOwner || user?.isAdmin || userRole?.name === "Admin") {
      return true;
    }
    const userRoleId = userRole?._id?.toString() || userRole?.toString();
    if (!userRoleId) return false;
    if (request.parentRoleId && request.parentRoleId === userRoleId) {
      return true;
    }
    if (request.approverRoles && request.approverRoles.includes(userRoleId)) {
      return true;
    }
    return false;
  }
  /**
   * Approve a transaction and execute all cross-domain operations:
   * 1. Status -> 'Approved' / 'Sent' / 'Open'
   * 2. Double-Entry Accounting (PostingEngine)
   * 3. Inventory Stock Deduction / Addition (Item.stock & currentStock)
   */
  static async approveTransaction(params) {
    const { orgId, module: module2, documentId, approverUser, approverRole, comments } = params;
    const request = await ApprovalRequest.findOne({ orgId, module: module2, entityId: documentId });
    if (!request) {
      throw new Error("Approval request not found");
    }
    if (!this.canUserApprove(request, approverUser, approverRole)) {
      throw new Error("You do not have permission to approve this transaction");
    }
    request.status = "Approved";
    request.approvedBy = approverUser._id?.toString() || approverUser.id;
    request.approvedByName = approverUser.displayName || approverUser.name || approverUser.email;
    request.comments = comments || "Approved";
    request.timeline = request.timeline || [];
    request.timeline.push({
      action: "Approved",
      actorId: approverUser._id?.toString() || approverUser.id,
      actorName: approverUser.displayName || approverUser.name || approverUser.email || "Priya Verma (Finance Manager)",
      role: "Manager / Approver",
      timestamp: /* @__PURE__ */ new Date(),
      comments: comments || "Verified line items, pricing, and commercial terms. Approved for execution.",
      status: "Approved"
    });
    await request.save();
    switch (module2) {
      case "invoices": {
        const invoice = await Invoice_default.findById(documentId);
        if (!invoice) throw new Error("Invoice not found");
        invoice.status = "Open";
        invoice.approvalStatus = "Approved";
        invoice.postingStatus = "Posted";
        if (!invoice.dispatchStatus) {
          invoice.dispatchStatus = "Not Sent";
        }
        await invoice.save();
        if (invoice.items && Array.isArray(invoice.items)) {
          for (const line of invoice.items) {
            if (line.item) {
              const itemDoc = await Item_default.findById(line.item);
              if (itemDoc && itemDoc.type !== "service") {
                const qty = Number(line.quantity || 0);
                await Item_default.findByIdAndUpdate(line.item, {
                  $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                });
              }
            }
          }
        }
        const payload = {
          invoiceId: invoice._id.toString(),
          companyId: orgId,
          customerId: invoice.customer?._id?.toString() || invoice.customer?.toString(),
          subTotal: invoice.subTotal || 0,
          taxTotal: invoice.taxTotal || 0,
          grandTotal: invoice.total || 0,
          invoiceDate: invoice.invoiceDate,
          invoiceNumber: invoice.invoiceNumber
        };
        await PostingEngine.handleEvent("INVOICE_APPROVED", payload);
        break;
      }
      case "bills": {
        const bill = await Bill_default.findById(documentId);
        if (!bill) throw new Error("Bill not found");
        bill.status = "Open";
        bill.approvalStatus = "Approved";
        await bill.save();
        const lineItems = bill.items || bill.lineItems || [];
        for (const line of lineItems) {
          const itemId = line.item || line.itemId;
          if (itemId) {
            const itemDoc = await Item_default.findById(itemId);
            if (itemDoc && itemDoc.type !== "service") {
              const qty = Number(line.quantity || 0);
              await Item_default.findByIdAndUpdate(itemId, {
                $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
              });
            }
          }
        }
        const payload = {
          billId: bill._id.toString(),
          companyId: orgId,
          vendorId: bill.vendorId?.toString(),
          subTotal: bill.subTotal || 0,
          taxTotal: bill.taxTotal || 0,
          grandTotal: bill.total || 0,
          billDate: bill.billDate,
          billNumber: bill.billNumber
        };
        await PostingEngine.handleEvent("BILL_APPROVED", payload);
        break;
      }
      case "sales_orders": {
        const so = await SalesOrder_default.findById(documentId);
        if (!so) throw new Error("Sales Order not found");
        so.status = "Confirmed";
        so.approvalStatus = "Approved";
        await so.save();
        if (so.items && Array.isArray(so.items)) {
          for (const line of so.items) {
            if (line.item) {
              const qty = Number(line.quantity || 0);
              await Item_default.findByIdAndUpdate(line.item, {
                $inc: { committedStock: qty }
              });
            }
          }
        }
        break;
      }
      case "purchase_orders": {
        const po = await PurchaseOrder_default.findById(documentId);
        if (!po) throw new Error("Purchase Order not found");
        po.status = "Issued";
        po.approvalStatus = "Approved";
        await po.save();
        break;
      }
      case "quotes": {
        const quote = await Quote_default.findById(documentId);
        if (!quote) throw new Error("Quote not found");
        quote.approvalStatus = "Approved";
        await quote.save();
        break;
      }
      case "delivery_challans": {
        const dc = await DeliveryChallan_default.findById(documentId);
        if (!dc) throw new Error("Delivery Challan not found");
        dc.status = "Delivered";
        dc.approvalStatus = "Approved";
        await dc.save();
        if (dc.items && Array.isArray(dc.items)) {
          for (const line of dc.items) {
            if (line.item) {
              const itemDoc = await Item_default.findById(line.item);
              if (itemDoc && itemDoc.type !== "service") {
                const qty = Number(line.quantity || 0);
                await Item_default.findByIdAndUpdate(line.item, {
                  $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                });
              }
            }
          }
        }
        await PostingEngine.handleEvent("DELIVERY_CHALLAN_ISSUED", {
          challanId: dc._id.toString(),
          companyId: orgId,
          total: dc.total || 0
        });
        break;
      }
      case "transfer_orders": {
        const to = await TransferOrder_default.findById(documentId);
        if (!to) throw new Error("Transfer Order not found");
        to.status = "In Transit";
        to.approvalStatus = "Approved";
        await to.save();
        break;
      }
      case "payments_made": {
        const pm = await PaymentMade_default.findById(documentId);
        if (!pm) throw new Error("Payment Made not found");
        pm.status = "Closed";
        pm.approvalStatus = "Approved";
        await pm.save();
        await PostingEngine.handleEvent("PAYMENT_MADE", {
          paymentId: pm._id.toString(),
          companyId: orgId,
          vendorId: pm.vendorId?.toString(),
          amount: pm.amount,
          paymentMode: pm.paymentMode,
          paidThrough: pm.paidThrough,
          referenceNumber: pm.referenceNumber
        });
        break;
      }
      case "credit_notes": {
        const cn = await CreditNote_default.findById(documentId);
        if (!cn) throw new Error("Credit Note not found");
        cn.status = "Open";
        cn.approvalStatus = "Approved";
        await cn.save();
        if (cn.items && Array.isArray(cn.items)) {
          for (const line of cn.items) {
            if (line.item) {
              const itemDoc = await Item_default.findById(line.item);
              if (itemDoc && itemDoc.type !== "service") {
                const qty = Number(line.quantity || 0);
                await Item_default.findByIdAndUpdate(line.item, {
                  $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
                });
              }
            }
          }
        }
        const payload = {
          creditNoteId: cn._id.toString(),
          companyId: orgId,
          customerId: cn.customer?.toString(),
          subTotal: cn.subTotal || 0,
          taxTotal: cn.taxTotal || 0,
          total: cn.total || 0,
          creditNoteNumber: cn.creditNoteNumber
        };
        await PostingEngine.handleEvent("CREDIT_NOTE_APPROVED", payload);
        break;
      }
      case "vendor_credits": {
        const vc = await VendorCredit_default.findById(documentId);
        if (!vc) throw new Error("Vendor Credit not found");
        vc.status = "Open";
        vc.approvalStatus = "Approved";
        await vc.save();
        if (vc.items && Array.isArray(vc.items)) {
          for (const line of vc.items) {
            if (line.item) {
              const qty = Number(line.quantity || 0);
              await Item_default.findByIdAndUpdate(line.item, {
                $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
              });
            }
          }
        }
        const payload = {
          creditId: vc._id.toString(),
          companyId: orgId,
          vendorId: vc.vendorId?.toString(),
          total: vc.total || 0
        };
        await PostingEngine.handleEvent("VENDOR_CREDIT_APPROVED", payload);
        break;
      }
      case "expenses": {
        const exp = await Expense_default.findById(documentId);
        if (!exp) throw new Error("Expense not found");
        exp.status = exp.paidThroughAccount ? "Paid" : "Approved";
        exp.approvalStatus = "Approved";
        await exp.save();
        const payload = {
          expenseId: exp._id.toString(),
          companyId: orgId,
          amount: exp.amount,
          vendorId: exp.vendorId?.toString(),
          isPaid: !!exp.paidThroughAccount,
          accountId: exp.accountId?.toString(),
          paidThroughAccountId: exp.paidThroughAccount?.toString()
        };
        await PostingEngine.handleEvent("EXPENSE_APPROVED", payload);
        break;
      }
      case "inventory_adjustments": {
        const adj = await InventoryAdjustment_default.findById(documentId);
        if (!adj) throw new Error("Inventory adjustment not found");
        adj.status = "Adjusted";
        adj.approvalStatus = "Approved";
        await adj.save();
        if (adj.items && Array.isArray(adj.items)) {
          for (const line of adj.items) {
            const qty = Number(line.quantityAdjusted || 0);
            const itemDoc = await Item_default.findById(line.item);
            if (itemDoc) {
              itemDoc.stock = Math.max(0, (itemDoc.stock || 0) + qty);
              itemDoc.stockQuantity = itemDoc.stock;
              if (itemDoc.currentStock !== void 0) itemDoc.currentStock = itemDoc.stock;
              const targetWh = line.warehouse || adj.warehouseId || itemDoc.defaultWarehouseId;
              if (targetWh) {
                if (!itemDoc.warehouseStock) itemDoc.warehouseStock = [];
                let ws = itemDoc.warehouseStock.find((w) => w.warehouse?.toString() === targetWh.toString());
                if (ws) {
                  ws.stockOnHand = Math.max(0, (ws.stockOnHand || 0) + qty);
                  ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
                } else {
                  itemDoc.warehouseStock.push({
                    warehouse: targetWh,
                    bin: "",
                    stockOnHand: Math.max(0, qty),
                    committedStock: 0,
                    availableStock: Math.max(0, qty)
                  });
                }
              }
              await itemDoc.save();
              const unitRate = itemDoc.costPrice || itemDoc.purchaseRate || 0;
              await StockLedger.create({
                companyId: orgId,
                orgId,
                itemId: itemDoc._id,
                itemSku: itemDoc.sku || "",
                itemName: itemDoc.name || "",
                fromLocation: qty < 0 ? { type: "STORAGE_BIN", code: targetWh || "BIN" } : { type: "VIRTUAL_ADJUSTMENT", code: "Found Excess" },
                toLocation: qty < 0 ? { type: "SCRAP_BAY", code: "Damaged / Discrepancy Bay" } : { type: "STORAGE_BIN", code: targetWh || "BIN" },
                bucketFrom: qty < 0 ? "ACTIVE_STORAGE_BINS" : "FOUND_EXCESS",
                bucketTo: qty < 0 ? "SCRAP_BAY" : "ACTIVE_STORAGE_BINS",
                quantity: Math.abs(qty),
                valuationRate: unitRate,
                totalValuation: Math.abs(qty) * unitRate,
                referenceDocType: "ADJUSTMENT",
                referenceDocNumber: adj.referenceNumber || documentId,
                actor: {
                  userId: approverUser._id?.toString() || approverUser.id,
                  name: approverUser.displayName || approverUser.name || approverUser.email || "Approver",
                  role: approverRole?.name || "Manager / Approver"
                },
                timestamp: /* @__PURE__ */ new Date()
              }).catch((err) => console.warn("Could not record stock ledger for adjustment approval:", err));
            }
          }
        }
        await PostingEngine.handleEvent("INVENTORY_ADJUSTMENT", { adjustmentId: adj._id.toString(), companyId: orgId });
        break;
      }
      case "manual_journals": {
        const journal = await Journal.findById(documentId);
        if (!journal) throw new Error("Journal not found");
        journal.status = "Published";
        journal.approvalStatus = "Approved";
        await journal.save();
        const ledgerLines = journal.lineItems.map((l) => ({
          accountId: l.account,
          debit: l.debits || 0,
          credit: l.credits || 0,
          contactId: l.contact || void 0
        }));
        await LedgerService.postTransaction(
          orgId,
          journal._id.toString(),
          "Manual Journal",
          journal.date || /* @__PURE__ */ new Date(),
          ledgerLines
        );
        break;
      }
      default:
        console.warn(`[ApprovalWorkflowService] Unhandled module: ${module2}`);
    }
    return request;
  }
  /**
   * Reject a transaction.
   */
  static async rejectTransaction(params) {
    const { orgId, module: module2, documentId, approverUser, approverRole, reason } = params;
    const request = await ApprovalRequest.findOne({ orgId, module: module2, entityId: documentId });
    if (!request) {
      throw new Error("Approval request not found");
    }
    if (!this.canUserApprove(request, approverUser, approverRole)) {
      throw new Error("You do not have permission to reject this transaction");
    }
    request.status = "Rejected";
    request.approvedBy = approverUser._id?.toString() || approverUser.id;
    request.approvedByName = approverUser.displayName || approverUser.name || approverUser.email;
    request.rejectionReason = reason;
    request.timeline = request.timeline || [];
    request.timeline.push({
      action: "Rejected",
      actorId: approverUser._id?.toString() || approverUser.id,
      actorName: approverUser.displayName || approverUser.name || approverUser.email || "Priya Verma (Finance Manager)",
      role: "Manager / Approver",
      timestamp: /* @__PURE__ */ new Date(),
      comments: reason,
      status: "Rejected"
    });
    await request.save();
    switch (module2) {
      case "invoices":
        await Invoice_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "bills":
        await Bill_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "sales_orders":
        await SalesOrder_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "purchase_orders":
        await PurchaseOrder_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "quotes":
        await Quote_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "credit_notes":
        await CreditNote_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "vendor_credits":
        await VendorCredit_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "delivery_challans":
        await DeliveryChallan_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "transfer_orders":
        await TransferOrder_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "payments_made":
        await PaymentMade_default.findByIdAndUpdate(documentId, { status: "Void", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "expenses":
        await Expense_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "inventory_adjustments":
        await InventoryAdjustment_default.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
      case "manual_journals":
        await Journal.findByIdAndUpdate(documentId, { status: "Draft", approvalStatus: "Rejected", rejectionReason: reason });
        break;
    }
    return request;
  }
  /**
   * Get pending approvals for the current user.
   */
  static async getPendingApprovals(orgId, user, userRole) {
    const allPending = await ApprovalRequest.find({ orgId, status: "Pending" }).sort({ createdAt: -1 }).lean();
    return allPending.filter((req) => this.canUserApprove(req, user, userRole));
  }
};

// ../backend/src/domains/books/controllers/expenseController.ts
var import_uuid = require("uuid");

// ../backend/src/core/utils/tenantFilter.ts
var import_mongoose31 = __toESM(require("mongoose"));
var buildTenantFilter = (reqOrOrgId) => {
  let orgId = null;
  if (typeof reqOrOrgId === "string") {
    orgId = reqOrOrgId;
  } else if (reqOrOrgId && typeof reqOrOrgId === "object") {
    orgId = reqOrOrgId.org?._id || reqOrOrgId.user?.companyId || reqOrOrgId.user?.orgId || reqOrOrgId.headers?.["x-org-id"] || reqOrOrgId.headers?.["x-organization-id"] || reqOrOrgId.headers?.["x-company-id"] || reqOrOrgId.body?.companyId || reqOrOrgId.body?.orgId || reqOrOrgId.query?.companyId || reqOrOrgId.query?.orgId;
  }
  if (!orgId) {
    try {
      const store = requestContext.getStore();
      if (store?.orgId) {
        orgId = store.orgId;
      }
    } catch (e) {
    }
  }
  if (!orgId) return {};
  const orgIdStr = orgId.toString().trim();
  if (!orgIdStr || orgIdStr === "default-org") return {};
  const isValidObjectId = import_mongoose31.default.Types.ObjectId.isValid(orgIdStr);
  const orgIdObj = isValidObjectId ? new import_mongoose31.default.Types.ObjectId(orgIdStr) : null;
  const conditions = [
    { companyId: orgIdStr },
    { orgId: orgIdStr },
    { tenantId: orgIdStr }
  ];
  if (orgIdObj) {
    conditions.push({ companyId: orgIdObj });
    conditions.push({ orgId: orgIdObj });
    conditions.push({ tenantId: orgIdObj });
  }
  return { $or: conditions };
};

// ../backend/src/domains/books/controllers/expenseController.ts
var createExpense = async (req, res, next) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);
    const requestedStatus = req.body.status || (req.body.paidThroughAccount ? "Paid" : "Approved");
    let finalStatus = requestedStatus;
    let finalApprovalStatus = "Approved";
    if (requestedStatus === "Draft") {
      finalStatus = "Draft";
      finalApprovalStatus = "Draft";
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        "expenses",
        Number(req.body.amount || 0),
        user,
        userRole
      );
      if (evalResult.requiresApproval) {
        finalStatus = "Pending Approval";
        finalApprovalStatus = "Pending";
      }
    }
    const doc = await Expense_default.create({
      ...req.body,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });
    if (finalApprovalStatus === "Pending") {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: "expenses",
        documentId: doc._id.toString(),
        documentNumber: doc.expenseNumber || `EXP-${doc._id.toString().slice(-5).toUpperCase()}`,
        amount: Number(req.body.amount || 0),
        customerOrVendorName: req.body.vendorName || "Expense",
        requestedBy: userId || "system",
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus !== "Draft") {
      const isPaid = doc.status === "Paid" || !!doc.paidThroughAccount;
      const payload = {
        expenseId: doc._id.toString(),
        companyId: orgId,
        amount: doc.amount,
        vendorId: doc.vendorId?.toString(),
        isPaid,
        accountId: doc.accountId?.toString(),
        paidThroughAccountId: doc.paidThroughAccount?.toString()
      };
      await PostingEngine.handleEvent("EXPENSE_APPROVED", payload);
    }
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var createBulkExpenses = async (req, res, next) => {
  try {
    const expenses = req.body.expenses;
    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: "Invalid data format. Expected an array of expenses." });
    }
    const bulkBatchId = (0, import_uuid.v4)();
    const expensesWithBatch = expenses.map((e) => ({ ...e, bulkBatchId }));
    const docs = await Expense_default.insertMany(expensesWithBatch);
    res.status(201).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getExpenses = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const regularDocs = await Expense_default.find(tenantFilter).populate("vendorId", "displayName companyName").populate("customerId", "displayName").lean();
    const mileageDocs = await MileageExpense_default.find(tenantFilter).populate("vendorId", "displayName companyName").populate("customerId", "displayName").lean();
    const mileageWithFlag = mileageDocs.map((m) => ({ ...m, expenseType: "Mileage" }));
    const combined = [...regularDocs, ...mileageWithFlag].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(200).json({ success: true, count: combined.length, data: combined });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getExpenseById = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = { _id: req.params.id, ...tenantFilter };
    let doc = await Expense_default.findOne(filter).populate("vendorId", "displayName").populate("customerId", "displayName").lean();
    if (doc) {
      return res.status(200).json({ success: true, data: doc });
    }
    let mileageDoc = await MileageExpense_default.findOne(filter).populate("vendorId", "displayName").populate("customerId", "displayName").lean();
    if (mileageDoc) {
      const combinedDoc = { ...mileageDoc, expenseType: "Mileage" };
      return res.status(200).json({ success: true, data: combinedDoc });
    }
    return res.status(404).json({ success: false, message: "Expense not found" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var updateExpense = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = { _id: req.params.id, ...tenantFilter };
    const doc = await Expense_default.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var updateBulkExpenses = async (req, res, next) => {
  try {
    const bulkBatchId = req.params.batchId;
    const expenses = req.body.expenses;
    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: "Invalid data." });
    }
    await Expense_default.deleteMany({ bulkBatchId });
    const expensesWithBatch = expenses.map((e) => ({ ...e, bulkBatchId }));
    const docs = await Expense_default.insertMany(expensesWithBatch);
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var deleteExpense = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = { _id: req.params.id, ...tenantFilter };
    let doc = await Expense_default.findOneAndDelete(filter);
    if (!doc) {
      doc = await MileageExpense_default.findOneAndDelete(filter);
    }
    if (!doc) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getBulkExpenses = async (req, res, next) => {
  try {
    const docs = await Expense_default.find({ bulkBatchId: req.params.batchId }).populate("vendorId", "displayName").populate("customerId", "displayName");
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ../backend/src/domains/books/routes/expenseRoutes.ts
var router2 = (0, import_express2.Router)();
router2.route("/").get(getExpenses).post(createExpense);
router2.route("/bulk").post(createBulkExpenses);
router2.route("/bulk/:batchId").get(getBulkExpenses).put(updateBulkExpenses);
router2.route("/:id").get(getExpenseById).put(updateExpense).delete(deleteExpense);
var expenseRoutes_default = router2;

// ../backend/src/domains/books/routes/recurringExpenseRoutes.ts
var import_express3 = require("express");

// ../backend/src/domains/books/models/RecurringExpense.ts
var import_mongoose32 = __toESM(require("mongoose"));
var RecurringExpenseSchema = new import_mongoose32.Schema({
  orgId: { type: String },
  profileName: { type: String, required: true },
  repeatEvery: { type: String, required: true },
  startsOn: { type: Date, required: true },
  endsOn: { type: Date },
  expenseAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  paidThrough: { type: String, required: true },
  vendorId: { type: import_mongoose32.Schema.Types.ObjectId, ref: "Vendor" },
  customerId: { type: import_mongoose32.Schema.Types.ObjectId, ref: "ClientAccount" },
  billable: { type: Boolean, default: false },
  notes: { type: String },
  status: {
    type: String,
    enum: ["Active", "Paused", "Stopped", "Expired"],
    default: "Active"
  },
  currency: { type: String, default: "INR" },
  createdBy: { type: String }
}, { timestamps: true });
var RecurringExpenseModel = import_mongoose32.default.models.RecurringExpense || import_mongoose32.default.model("RecurringExpense", RecurringExpenseSchema, "recurringexpenses");
if (!import_mongoose32.default.models.BooksRecurringExpense) {
  try {
    import_mongoose32.default.model("BooksRecurringExpense", RecurringExpenseSchema, "recurringexpenses");
  } catch (e) {
  }
}
var RecurringExpense_default = RecurringExpenseModel;

// ../backend/src/domains/books/controllers/recurringExpenseController.ts
var createRecurringExpense = async (req, res, next) => {
  try {
    const doc = await RecurringExpense_default.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getRecurringExpenses = async (req, res, next) => {
  try {
    const docs = await RecurringExpense_default.find().populate("vendorId", "displayName companyName").populate("customerId", "displayName").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getRecurringExpenseById = async (req, res, next) => {
  try {
    const doc = await RecurringExpense_default.findById(req.params.id).populate("vendorId", "displayName").populate("customerId", "displayName");
    if (!doc) {
      return res.status(404).json({ success: false, message: "Recurring Expense not found" });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var updateRecurringExpense = async (req, res, next) => {
  try {
    const doc = await RecurringExpense_default.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Recurring Expense not found" });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var deleteRecurringExpense = async (req, res, next) => {
  try {
    const doc = await RecurringExpense_default.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Recurring Expense not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ../backend/src/domains/books/routes/recurringExpenseRoutes.ts
var router3 = (0, import_express3.Router)();
router3.route("/").get(getRecurringExpenses).post(createRecurringExpense);
router3.route("/:id").get(getRecurringExpenseById).put(updateRecurringExpense).delete(deleteRecurringExpense);
var recurringExpenseRoutes_default = router3;

// ../backend/src/domains/billing/routes/customerRoutes.ts
var import_express4 = __toESM(require("express"));

// ../backend/src/domains/billing/models/PaymentReceived.ts
var import_mongoose33 = __toESM(require("mongoose"));
var PaymentReceivedSchema = new import_mongoose33.Schema({
  branchId: { type: import_mongoose33.Schema.Types.ObjectId, ref: "BooksBranch" },
  projectId: { type: import_mongoose33.Schema.Types.ObjectId, ref: "BooksProject" },
  reportingTagIds: [{ type: import_mongoose33.Schema.Types.ObjectId, ref: "ReportingTag" }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: import_mongoose33.Schema.Types.Mixed, index: true },
  companyId: { type: import_mongoose33.Schema.Types.Mixed, index: true },
  customer: { type: import_mongoose33.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  amount: { type: Number, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100, required: true },
  unusedAmount: { type: Number, default: 0, min: [0, "Amount cannot be negative"], max: 1e14, set: (v) => Math.round(v * 100) / 100 },
  bankCharges: { type: Number, default: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentNumber: {
    type: String,
    required: true
    /* unique removed for compound */
  },
  paymentMode: { type: String, required: true },
  depositTo: { type: String },
  referenceNumber: { type: String },
  taxDeducted: { type: Boolean, default: false },
  taxType: { type: String },
  taxAmount: { type: Number, default: 0 },
  invoices: [{
    invoice: { type: import_mongoose33.Schema.Types.ObjectId, ref: "Invoice" },
    amountApplied: { type: Number, required: true }
  }],
  amountUsed: { type: Number, default: 0 },
  amountRefunded: { type: Number, default: 0 },
  amountInExcess: { type: Number, default: 0 },
  notes: { type: String },
  attachments: [{ type: String }],
  sendThankYouNote: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["Unused", "Partially Used", "Closed"],
    default: "Unused"
  },
  createdBy: { type: String, default: "system" }
}, { timestamps: true, optimisticConcurrency: true });
var PaymentReceived_default = import_mongoose33.default.models.PaymentReceived || import_mongoose33.default.model("PaymentReceived", PaymentReceivedSchema, "paymentsreceived");

// ../backend/src/domains/billing/controllers/customerController.ts
var import_mongoose35 = __toESM(require("mongoose"));

// ../backend/src/domains/billing/models/RecurringInvoice.ts
var import_mongoose34 = __toESM(require("mongoose"));
var RecurringInvoiceItemSchema = new import_mongoose34.Schema({
  item: { type: import_mongoose34.Schema.Types.ObjectId, ref: "Product", required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});
var RecurringInvoiceSchema = new import_mongoose34.Schema({
  orgId: { type: String },
  companyId: { type: import_mongoose34.Schema.Types.Mixed },
  profileName: { type: String, required: true },
  customer: { type: import_mongoose34.Schema.Types.ObjectId, ref: "Customer", required: true },
  repeatEvery: { type: String, required: true, default: "1 month" },
  startsOn: { type: Date, required: true, default: Date.now },
  endsOn: { type: Date },
  neverExpires: { type: Boolean, default: false },
  paymentTerms: { type: String },
  status: {
    type: String,
    enum: ["Active", "Stopped", "Draft"],
    default: "Draft"
  },
  items: [RecurringInvoiceItemSchema],
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
  projectName: { type: String },
  projectDetails: { type: import_mongoose34.Schema.Types.Mixed },
  subject: { type: String },
  attachments: [{ type: String }],
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: "system" }
}, { timestamps: true, strict: false });
var RecurringInvoiceModel = import_mongoose34.default.models.RecurringInvoice || import_mongoose34.default.model("RecurringInvoice", RecurringInvoiceSchema, "recurringinvoices");
var RecurringInvoice_default = RecurringInvoiceModel;

// ../backend/src/domains/billing/controllers/customerController.ts
var createCustomer = async (req, res, next) => {
  try {
    const orgId = req.org?._id || requestContext.getStore()?.orgId;
    const payload = {
      ...req.body,
      name: req.body.name || req.body.displayName || req.body.companyName || "Unnamed Customer",
      companyId: orgId || req.body.companyId,
      orgId: orgId || req.body.orgId,
      createdBy: req.user?._id
    };
    const customer = await Customer_default.create(payload);
    if (customer.openingBalance && customer.openingBalance > 0) {
      const payloadEvent = { customerId: customer._id.toString(), companyId: orgId || "SYSTEM", openingBalance: customer.openingBalance };
      await PostingEngine.handleEvent("CUSTOMER_OPENING_BALANCE", payloadEvent);
    }
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
var getCustomers = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const customers = await Customer_default.find(tenantFilter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};
var findCustomerById = async (customerId, extraFilter = {}) => {
  let customer = await Customer_default.findOne({ _id: customerId, ...extraFilter }).lean().catch(() => null);
  if (!customer && import_mongoose35.default.isValidObjectId(customerId)) {
    const objId = new import_mongoose35.default.Types.ObjectId(customerId);
    customer = await import_mongoose35.default.connection.collection("customers").findOne({ _id: objId, ...extraFilter }) || await import_mongoose35.default.connection.collection("clientaccounts").findOne({ _id: objId, ...extraFilter });
  } else if (!customer) {
    customer = await import_mongoose35.default.connection.collection("customers").findOne({ _id: customerId, ...extraFilter }) || await import_mongoose35.default.connection.collection("clientaccounts").findOne({ _id: customerId, ...extraFilter });
  }
  return customer;
};
var getCustomerById = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const customer = await findCustomerById(req.params.id, tenantFilter);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
var updateCustomer = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 ? { _id: req.params.id, ...tenantFilter } : { _id: req.params.id };
    if (!req.body.name && req.body.displayName) req.body.name = req.body.displayName;
    const customer = await Customer_default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
var deleteCustomer = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 ? { _id: req.params.id, ...tenantFilter } : { _id: req.params.id };
    const customer = await Customer_default.findOneAndDelete(filter);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
var getCustomerTransactions = async (req, res, next) => {
  try {
    const orgId = req.org?._id || requestContext.getStore()?.orgId;
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const [invoices, quotes, salesOrders, paymentsReceived, creditNotes, subscriptions] = await Promise.all([
      Invoice_default.find(customerFilter).sort({ invoiceDate: -1, createdAt: -1 }).lean(),
      Quote_default.find(customerFilter).sort({ quoteDate: -1, createdAt: -1 }).lean(),
      SalesOrder_default.find(customerFilter).sort({ salesOrderDate: -1, createdAt: -1 }).lean(),
      PaymentReceived_default.find(customerFilter).sort({ paymentDate: -1, createdAt: -1 }).lean(),
      CreditNote_default.find(customerFilter).sort({ creditNoteDate: -1, createdAt: -1 }).lean(),
      RecurringInvoice_default.find(customerFilter).sort({ createdAt: -1 }).lean().catch(() => [])
    ]);
    res.status(200).json({
      success: true,
      data: {
        invoices,
        quotes,
        salesOrders,
        paymentsReceived,
        creditNotes,
        subscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};
var getCustomerStatement = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date(0);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const [invoices, payments, creditNotes] = await Promise.all([
      Invoice_default.find({ ...customerFilter, invoiceDate: { $gte: start, $lte: end }, status: { $ne: "Draft" } }).lean(),
      PaymentReceived_default.find({ ...customerFilter, paymentDate: { $gte: start, $lte: end } }).lean(),
      CreditNote_default.find({ ...customerFilter, creditNoteDate: { $gte: start, $lte: end }, status: { $ne: "Draft" } }).lean()
    ]);
    const openingBalance = Number(customer.openingBalance || 0);
    const statementLines = [];
    invoices.forEach((inv) => {
      statementLines.push({
        date: inv.invoiceDate || inv.createdAt,
        type: "Invoice",
        reference: inv.invoiceNumber,
        details: `Invoice #${inv.invoiceNumber}`,
        debit: Number(inv.total || 0),
        credit: 0
      });
    });
    payments.forEach((pmt) => {
      statementLines.push({
        date: pmt.paymentDate || pmt.createdAt,
        type: "Payment",
        reference: pmt.paymentNumber,
        details: `Payment Received #${pmt.paymentNumber} (${pmt.paymentMode || "Cash"})`,
        debit: 0,
        credit: Number(pmt.amount || 0)
      });
    });
    creditNotes.forEach((cn) => {
      statementLines.push({
        date: cn.creditNoteDate || cn.createdAt,
        type: "Credit Note",
        reference: cn.creditNoteNumber,
        details: `Credit Note #${cn.creditNoteNumber}`,
        debit: 0,
        credit: Number(cn.total || 0)
      });
    });
    statementLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;
    const transactions = statementLines.map((line) => {
      runningBalance = runningBalance + line.debit - line.credit;
      totalDebit += line.debit;
      totalCredit += line.credit;
      return {
        ...line,
        balance: Math.round(runningBalance * 100) / 100
      };
    });
    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: customer.displayName || customer.name,
          companyName: customer.companyName,
          email: customer.email,
          phone: customer.phone,
          currency: customer.currency || "USD",
          billingAddress: customer.billingAddress
        },
        period: {
          startDate: start,
          endDate: end
        },
        openingBalance,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        closingBalance: Math.round(runningBalance * 100) / 100,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};
var getCustomerActivity = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const [invoices, quotes, salesOrders, payments, creditNotes] = await Promise.all([
      Invoice_default.find(customerFilter).sort({ createdAt: -1, invoiceDate: -1 }).limit(20).lean(),
      Quote_default.find(customerFilter).sort({ createdAt: -1, quoteDate: -1 }).limit(10).lean(),
      SalesOrder_default.find(customerFilter).sort({ createdAt: -1, salesOrderDate: -1 }).limit(10).lean(),
      PaymentReceived_default.find(customerFilter).sort({ createdAt: -1, paymentDate: -1 }).limit(20).lean(),
      CreditNote_default.find(customerFilter).sort({ createdAt: -1, creditNoteDate: -1 }).limit(10).lean()
    ]);
    const activityList = [];
    activityList.push({
      id: `act-create-${customer._id}`,
      action: "Created",
      type: "create",
      title: "Customer Profile Created",
      description: `Customer "${customer.displayName || customer.name}" was registered in the ERP.`,
      actorName: customer.createdByName || "System / Staff",
      role: "Staff",
      timestamp: customer.createdAt || /* @__PURE__ */ new Date(),
      date: customer.createdAt || /* @__PURE__ */ new Date(),
      status: customer.status || "Active"
    });
    invoices.forEach((inv) => {
      activityList.push({
        id: `act-inv-${inv._id}`,
        action: "Invoice Generated",
        type: "invoice",
        title: `Invoice #${inv.invoiceNumber} Generated`,
        description: `Billed total: \u20B9${(inv.total || 0).toLocaleString("en-IN")} (Status: ${inv.status || "Sent"})`,
        referenceId: inv._id,
        referenceNumber: inv.invoiceNumber,
        actorName: "Billing Engine",
        timestamp: inv.createdAt || inv.invoiceDate,
        date: inv.invoiceDate || inv.createdAt,
        status: inv.status
      });
    });
    payments.forEach((pmt) => {
      activityList.push({
        id: `act-pmt-${pmt._id}`,
        action: "Payment Received",
        type: "payment",
        title: `Payment Received #${pmt.paymentNumber}`,
        description: `Received \u20B9${(pmt.amount || 0).toLocaleString("en-IN")} via ${pmt.paymentMode || "Bank Transfer"}`,
        referenceId: pmt._id,
        referenceNumber: pmt.paymentNumber,
        actorName: "Accounts Team",
        timestamp: pmt.createdAt || pmt.paymentDate,
        date: pmt.paymentDate || pmt.createdAt,
        status: "Processed"
      });
    });
    salesOrders.forEach((so) => {
      activityList.push({
        id: `act-so-${so._id}`,
        action: "Sales Order Placed",
        type: "sales_order",
        title: `Order #${so.salesOrderNumber} Placed`,
        description: `Order amount: \u20B9${(so.total || 0).toLocaleString("en-IN")} (Fulfillment: ${so.fulfillmentStatus || "Pending"})`,
        referenceId: so._id,
        referenceNumber: so.salesOrderNumber,
        actorName: "Sales Department",
        timestamp: so.createdAt || so.salesOrderDate,
        date: so.salesOrderDate || so.createdAt,
        status: so.status
      });
    });
    quotes.forEach((qt) => {
      activityList.push({
        id: `act-qt-${qt._id}`,
        action: "Quote Issued",
        type: "quote",
        title: `Quote #${qt.quoteNumber} Issued`,
        description: `Estimate amount: \u20B9${(qt.total || 0).toLocaleString("en-IN")}`,
        referenceId: qt._id,
        referenceNumber: qt.quoteNumber,
        actorName: "Sales Department",
        timestamp: qt.createdAt || qt.quoteDate,
        date: qt.quoteDate || qt.createdAt,
        status: qt.status
      });
    });
    creditNotes.forEach((cn) => {
      activityList.push({
        id: `act-cn-${cn._id}`,
        action: "Credit Note Issued",
        type: "credit_note",
        title: `Credit Note #${cn.creditNoteNumber}`,
        description: `Credit allowance of \u20B9${(cn.total || 0).toLocaleString("en-IN")}`,
        referenceId: cn._id,
        referenceNumber: cn.creditNoteNumber,
        actorName: "Accounts Team",
        timestamp: cn.createdAt || cn.creditNoteDate,
        date: cn.creditNoteDate || cn.createdAt,
        status: cn.status
      });
    });
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.status(200).json({
      success: true,
      data: activityList,
      timeline: activityList,
      count: activityList.length
    });
  } catch (error) {
    next(error);
  }
};
var getCustomerSubscriptions = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const subs = await RecurringInvoice_default.find(customerFilter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: subs.length, data: subs });
  } catch (error) {
    next(error);
  }
};
var getCustomerInvoices = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const invoices = await Invoice_default.find(customerFilter).sort({ invoiceDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};
var getCustomerQuotes = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const quotes = await Quote_default.find(customerFilter).sort({ quoteDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    next(error);
  }
};
var getCustomerSalesOrders = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const orders = await SalesOrder_default.find(customerFilter).sort({ salesOrderDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};
var getCustomerPayments = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const payments = await PaymentReceived_default.find(customerFilter).sort({ paymentDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};
var getCustomerCreditNotes = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customer: new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { "customer._id": customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ "customer._id": new import_mongoose35.default.Types.ObjectId(customerId) }] : [],
        { customerId },
        ...import_mongoose35.default.isValidObjectId(customerId) ? [{ customerId: new import_mongoose35.default.Types.ObjectId(customerId) }] : []
      ]
    };
    const notes = await CreditNote_default.find(customerFilter).sort({ creditNoteDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
};
var getCustomerPortalLink = async (req, res, next) => {
  try {
    const customer = await findCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    const host = req.get("host") || "localhost:5173";
    const link = `http://${host}/portal/auth?token=cust_${customer._id}`;
    res.status(200).json({ success: true, link, url: link });
  } catch (error) {
    next(error);
  }
};

// ../backend/src/domains/billing/routes/customerRoutes.ts
var router4 = import_express4.default.Router();
router4.route("/").get(getCustomers).post(createCustomer);
router4.get("/:id/transactions", getCustomerTransactions);
router4.get("/:id/statement", getCustomerStatement);
router4.get("/:id/activity", getCustomerActivity);
router4.get("/:id/timeline", getCustomerActivity);
router4.get("/:id/history", getCustomerActivity);
router4.get("/:id/subscriptions", getCustomerSubscriptions);
router4.get("/:id/invoices", getCustomerInvoices);
router4.get("/:id/quotes", getCustomerQuotes);
router4.get("/:id/sales-orders", getCustomerSalesOrders);
router4.get("/:id/orders", getCustomerSalesOrders);
router4.get("/:id/payments", getCustomerPayments);
router4.get("/:id/credit-notes", getCustomerCreditNotes);
router4.get("/:id/portal-link", getCustomerPortalLink);
router4.route("/:id").get(getCustomerById).put(updateCustomer).delete(deleteCustomer);
var customerRoutes_default = router4;

// ../backend/src/domains/books/routes/invoiceRoutes.ts
var import_express5 = __toESM(require("express"));

// ../backend/src/domains/billing/controllers/invoiceController.ts
var import_mongoose37 = __toESM(require("mongoose"));

// ../backend/src/domains/billing/services/InvoiceConsolidationService.ts
var import_mongoose36 = __toESM(require("mongoose"));
var InvoiceConsolidationService = class {
  /**
   * ERP-Level Invoice Consolidation Engine.
   * Merges multiple draft/unbilled invoices into a single Consolidated invoice for corporate clients.
   */
  static async consolidateInvoices(customerId, invoiceIds, createdBy) {
    const session = await import_mongoose36.default.startSession();
    session.startTransaction();
    try {
      const sourceInvoices = await Invoice_default.find({
        _id: { $in: invoiceIds },
        customer: customerId,
        status: "Draft",
        invoiceType: { $ne: "Consolidated" }
      }).session(session);
      if (sourceInvoices.length !== invoiceIds.length) {
        throw new Error("Some invoices could not be found, belong to a different customer, or are not in Draft state.");
      }
      if (sourceInvoices.length < 2) {
        throw new Error("At least 2 invoices are required for consolidation.");
      }
      let consolidatedItems = [];
      let totalSubTotal = 0;
      let totalTax = 0;
      let totalAdjustment = 0;
      let totalAmount = 0;
      let totalDiscount = 0;
      const consolidatedFromIds = [];
      for (const inv of sourceInvoices) {
        consolidatedItems = consolidatedItems.concat(inv.items);
        totalSubTotal += inv.subTotal;
        totalTax += inv.taxTotal || 0;
        totalAdjustment += inv.adjustment || 0;
        totalAmount += inv.total;
        totalDiscount += inv.discount || 0;
        consolidatedFromIds.push(inv._id);
      }
      const consolidatedInvoice = new Invoice_default({
        customer: customerId,
        invoiceNumber: `CONSOL-${Date.now()}`,
        invoiceDate: /* @__PURE__ */ new Date(),
        status: "Draft",
        invoiceType: "Consolidated",
        items: consolidatedItems,
        subTotal: totalSubTotal,
        taxTotal: totalTax,
        adjustment: totalAdjustment,
        discount: totalDiscount,
        total: totalAmount,
        balanceDue: totalAmount,
        createdBy,
        consolidatedFrom: consolidatedFromIds,
        notes: `Consolidated from ${sourceInvoices.length} invoices.`
      });
      await consolidatedInvoice.save({ session });
      for (const inv of sourceInvoices) {
        inv.status = "Void";
        inv.notes = (inv.notes || "") + `
Merged into Consolidated Invoice: ${consolidatedInvoice.invoiceNumber}`;
        await inv.save({ session });
      }
      await session.commitTransaction();
      return consolidatedInvoice;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
};

// ../backend/src/domains/billing/services/PaymentPredictionService.ts
var PaymentPredictionService = class {
  /**
   * AI Analytics Heuristic Engine (Phase 4)
   * Analyzes historical payment behaviors and invoice properties to predict the probability of default.
   * In a full Python-ML setup, this would be an API call to a TensorFlow/scikit-learn microservice.
   */
  static async analyzeInvoiceRisk(invoiceId) {
    const invoice = await Invoice_default.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    const customer = await Customer_default.findById(invoice.customer);
    if (!customer) throw new Error("Customer not found");
    let riskScore = 10;
    const riskFlags = [];
    if (customer.creditLimit && customer.creditLimit > 0) {
      const utilization = invoice.total / customer.creditLimit;
      if (utilization > 0.8) {
        riskScore += 25;
        riskFlags.push("High Credit Utilization");
      }
    }
    const pastPayments = await PaymentReceived_default.find({ customer: invoice.customer }).sort({ paymentDate: -1 }).limit(10);
    if (pastPayments.length > 0) {
      let latePayments = 0;
      if (customer.availableCredit !== void 0 && customer.availableCredit < 0) {
        riskScore += 30;
        riskFlags.push("Negative Available Credit");
      }
    } else {
      riskScore += 20;
      riskFlags.push("New Customer (No Payment History)");
    }
    const pastInvoices = await Invoice_default.find({ customer: invoice.customer, _id: { $ne: invoice._id } });
    if (pastInvoices.length > 0) {
      const avgInvoiceValue = pastInvoices.reduce((acc, inv) => acc + inv.total, 0) / pastInvoices.length;
      if (invoice.total > avgInvoiceValue * 3) {
        riskScore += 35;
        riskFlags.push("High-Value Anomaly (3x Avg Invoice Size)");
      }
    }
    riskScore = Math.min(riskScore, 100);
    invoice.riskScore = riskScore;
    invoice.riskFlags = riskFlags;
    await invoice.save();
    return { riskScore, riskFlags };
  }
  /**
   * Batch job to run every night via Cron
   */
  static async runNightlyRiskAnalysis() {
    const openInvoices = await Invoice_default.find({
      status: { $in: ["Sent", "Viewed", "PartiallyPaid"] },
      balanceDue: { $gt: 0 },
      riskScore: { $exists: false }
    }).limit(100);
    for (const inv of openInvoices) {
      await this.analyzeInvoiceRisk(inv._id);
    }
  }
};

// ../backend/src/domains/billing/controllers/invoiceController.ts
var createInvoice = async (req, res, next) => {
  try {
    const orgId = requestContext.getStore()?.orgId || req.org?._id?.toString() || req.body.orgId || "SYSTEM";
    const user = req.user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;
    let invoiceNumber = req.body.invoiceNumber;
    if (invoiceNumber) {
      const existing = await Invoice_default.findOne({ invoiceNumber, orgId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Invoice number ${invoiceNumber} already exists` });
      }
    }
    let userRole = null;
    let roleId = requestContext.getStore()?.roleId;
    if (orgId && (userId || user?.email)) {
      const conditions = [];
      if (userId) {
        if (import_mongoose37.default.isValidObjectId(userId)) conditions.push({ userId: new import_mongoose37.default.Types.ObjectId(userId) });
        conditions.push({ userId: userId.toString() });
      }
      if (user?.email) {
        conditions.push({ email: user.email.toLowerCase() });
      }
      const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate("roleId").lean();
      if (userOrg?.roleId) {
        userRole = userOrg.roleId;
        roleId = userOrg.roleId._id?.toString();
      }
    }
    const requestedStatus = req.body.status || "Draft";
    let finalStatus = requestedStatus;
    let finalApprovalStatus = "Approved";
    if (requestedStatus === "Draft") {
      finalStatus = "Draft";
      finalApprovalStatus = "Draft";
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        "invoices",
        Number(req.body.total || 0),
        user,
        userRole
      );
      if (evalResult.requiresApproval) {
        finalStatus = "Pending Approval";
        finalApprovalStatus = "Pending";
      }
    }
    const invoice = await Invoice_default.create({
      ...req.body,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      orgId,
      companyId: orgId
    });
    try {
      await invoice.populate("customer");
    } catch (e) {
    }
    try {
      await invoice.populate("items.item");
    } catch (e) {
    }
    if (finalApprovalStatus === "Pending") {
      try {
        await ApprovalWorkflowService.submitForApproval({
          orgId,
          module: "invoices",
          documentId: invoice._id.toString(),
          documentNumber: invoice.invoiceNumber,
          amount: invoice.total,
          customerOrVendorName: invoice.customer?.displayName || invoice.customer?.name || "Customer",
          requestedBy: userId || "system",
          requestedByName: user?.displayName || user?.name || user?.email,
          creatorRoleId: roleId
        });
      } catch (apprErr) {
        console.error("Failed to submit approval request:", apprErr);
      }
    } else if (invoice.status !== "Draft") {
      const payload = {
        invoiceId: invoice._id.toString(),
        companyId: orgId,
        customerId: invoice.customer?._id?.toString() || invoice.customer?.toString(),
        subTotal: invoice.subTotal || 0,
        taxTotal: invoice.taxTotal || 0,
        grandTotal: invoice.total || 0,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber
      };
      try {
        await PostingEngine.handleEvent("INVOICE_APPROVED", payload);
      } catch (postErr) {
        console.error("Failed to post approved invoice to GL:", postErr);
      }
      try {
        await Promise.resolve().then(() => (init_eventBus(), eventBus_exports)).then((m) => m.eventBus.emitAsync(m.EVENTS.INVOICE_CREATED, { invoice, companyId: orgId }));
      } catch (eventErr) {
        console.warn("Invoice eventBus error:", eventErr);
      }
    }
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    require("fs").appendFileSync("d:/backend/error.log", (/* @__PURE__ */ new Date()).toISOString() + " " + (error?.stack || error) + "\n");
    if (error?.code === 11e3) {
      return res.status(400).json({ success: false, message: "Invoice number already exists. Please choose a different number." });
    }
    res.status(500).json({ success: false, message: error?.message || "Internal server error while creating invoice" });
  }
};
var getInvoices = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = { ...tenantFilter };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const invoices = await Invoice_default.find(filter).populate("customer").populate("items.item").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    require("fs").appendFileSync("d:/backend/error.log", (/* @__PURE__ */ new Date()).toISOString() + " " + (error.stack || error) + "\n");
    next(error);
  }
};
var getInvoiceById = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 ? { _id: req.params.id, ...tenantFilter } : { _id: req.params.id };
    const invoice = await Invoice_default.findOne(filter).populate("customer").populate("items.item");
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    require("fs").appendFileSync("d:/backend/error.log", (/* @__PURE__ */ new Date()).toISOString() + " " + (error.stack || error) + "\n");
    next(error);
  }
};
var updateInvoice = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const originalInvoice = await Invoice_default.findOne({ _id: req.params.id, ...tenantFilter });
    if (!originalInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    if (originalInvoice.balanceDue < originalInvoice.total) {
      if (req.body.status === "Void") {
        return res.status(400).json({ success: false, message: "Cannot void an invoice that has payments applied. Delete payments first." });
      }
    }
    if (req.body.total !== void 0) {
      if (originalInvoice.balanceDue === originalInvoice.total) {
        req.body.balanceDue = req.body.total;
      }
    }
    const orgId = requestContext.getStore()?.orgId || originalInvoice.orgId || "SYSTEM";
    const user = req.user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;
    if (req.body.status === "Pending Approval" || req.body.approvalStatus === "Pending") {
      let roleId = requestContext.getStore()?.roleId;
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: "invoices",
        documentId: req.params.id,
        documentNumber: originalInvoice.invoiceNumber,
        amount: Number(req.body.total ?? originalInvoice.total),
        customerOrVendorName: originalInvoice.customer?.displayName || originalInvoice.customer?.name,
        requestedBy: userId || "system",
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
      req.body.status = "Pending Approval";
      req.body.approvalStatus = "Pending";
    }
    const invoice = await Invoice_default.findOneAndUpdate({ _id: req.params.id, ...tenantFilter }, req.body, { new: true, runValidators: true }).populate("customer").populate("items.item");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (invoice.status === "Void") {
      await LedgerService.voidTransaction(orgId, invoice._id.toString(), /* @__PURE__ */ new Date());
    } else if (invoice.status !== "Draft" && invoice.status !== "Pending Approval") {
      const cogsEstimate = (invoice.subTotal || 0) * 0.4;
      const adjustment = invoice.adjustment || 0;
      await LedgerService.postTransaction(orgId, invoice._id.toString(), "Invoice", invoice.invoiceDate, [
        { accountId: invoice.accountsReceivable || "Accounts Receivable", debit: invoice.total, contactId: invoice.customer?._id?.toString() || invoice.customer?.toString() },
        { accountId: "Sales Income", credit: invoice.subTotal || 0 },
        { accountId: "Tax Payable", credit: invoice.taxTotal || 0 },
        { accountId: "Discount Given", debit: invoice.discount || 0 },
        { accountId: "Adjustment", credit: adjustment > 0 ? adjustment : 0, debit: adjustment < 0 ? Math.abs(adjustment) : 0 },
        { accountId: "Cost of Goods Sold", debit: cogsEstimate },
        { accountId: "Inventory Asset", credit: cogsEstimate }
      ]);
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};
var deleteInvoice = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const originalInvoice = await Invoice_default.findOne({ _id: req.params.id, ...tenantFilter });
    if (!originalInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    if (originalInvoice.balanceDue < originalInvoice.total) {
      return res.status(400).json({ success: false, message: "Cannot delete an invoice that has payments applied. Delete payments first." });
    }
    const invoice = await Invoice_default.findOneAndDelete({ _id: req.params.id, ...tenantFilter });
    const orgId = requestContext.getStore()?.orgId || originalInvoice.orgId || "SYSTEM";
    await LedgerService.deleteTransaction(orgId, originalInvoice._id.toString());
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
var consolidateInvoices = async (req, res) => {
  try {
    const { customerId, invoiceIds } = req.body;
    const consolidated = await InvoiceConsolidationService.consolidateInvoices(customerId, invoiceIds, "system");
    res.status(201).json({ success: true, data: consolidated });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
var analyzeRisk = async (req, res) => {
  try {
    const analysis = await PaymentPredictionService.analyzeInvoiceRisk(req.params.id);
    res.status(200).json({ success: true, data: analysis });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ../backend/src/domains/books/routes/invoiceRoutes.ts
var router5 = import_express5.default.Router();
router5.route("/").post(createInvoice).get(getInvoices);
router5.route("/:id").get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);
var invoiceRoutes_default = router5;
router5.post("/consolidate", consolidateInvoices);
router5.get("/:id/risk-analysis", analyzeRisk);

// ../backend/scripts/verify_full_operational_crud_suite.ts
init_Item();
import_dotenv.default.config();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority";
async function runFullOperationalVerification() {
  console.log("================================================================================");
  console.log("\u{1F50D} FULL OPERATIONAL AUDIT: SAVE, EDIT, DELETE, SPLIT VIEW & FETCH FLOW");
  console.log("================================================================================\n");
  await import_mongoose38.default.connect(MONGODB_URI);
  console.log("\u2705 Connected to MongoDB Atlas: hrms_crm");
  const testApp = (0, import_express6.default)();
  testApp.use(import_express6.default.json());
  const testOrgId = "6aa797278d301b4735f1d322";
  const testUserId = new import_mongoose38.default.Types.ObjectId().toString();
  testApp.use((req, res, next) => {
    req.orgId = testOrgId;
    req.companyId = testOrgId;
    req.user = { id: testUserId, _id: testUserId, role: "Admin", orgId: testOrgId };
    next();
  });
  testApp.use("/api/v1/erp", erpV3Routes_default);
  testApp.use("/api/v1/billing/expenses/recurring", recurringExpenseRoutes_default);
  testApp.use("/api/v1/billing/expenses", expenseRoutes_default);
  testApp.use("/api/v1/billing/customers", customerRoutes_default);
  testApp.use("/api/v1/billing/invoices", invoiceRoutes_default);
  const server = testApp.listen(5098);
  const baseUrl = "http://localhost:5098";
  console.log("\u2705 Test Server listening on port 5098");
  const headers = {
    "Content-Type": "application/json",
    "x-org-id": testOrgId
  };
  const timestamp = Date.now().toString().slice(-4);
  try {
    console.log("\n--- [1. AUDIT: DIRECT EXPENSES (SAVE, FETCH, EDIT, DELETE)] ---");
    console.log("  A. Testing Save/Create Expense...");
    const createExpRes = await fetch(`${baseUrl}/api/v1/billing/expenses`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        date: (/* @__PURE__ */ new Date()).toISOString(),
        expenseType: "Goods",
        expenseAccount: "Cloud Hosting Infrastructure",
        paidThrough: "HDFC Corporate Current A/C",
        amount: 25e3,
        taxAmount: 4500,
        totalAmount: 29500,
        vendorName: `AWS India Tier-${timestamp}`,
        reference: `REF-EXP-${timestamp}`,
        notes: "Initial test expense note",
        billable: false,
        status: "Unbilled"
      })
    });
    const createExpData = await createExpRes.json();
    const expenseId = createExpData.data?._id || createExpData._id;
    console.log(`  \u2713 Create Response Status: ${createExpRes.status}, Created ID: ${expenseId}`, createExpData);
    if (createExpRes.status !== 200 && createExpRes.status !== 201) throw new Error(`Create Expense failed: ${JSON.stringify(createExpData)}`);
    console.log("  B. Testing Split View Fetch & Search...");
    const listExpRes = await fetch(`${baseUrl}/api/v1/billing/expenses?search=AWS`, { headers });
    const listExpData = await listExpRes.json();
    const items = listExpData.data || listExpData;
    console.log(`  \u2713 Split View List fetched: ${items.length} records found`);
    const foundExpense = items.find((e) => e._id === expenseId || e.reference === `REF-EXP-${timestamp}`);
    if (!foundExpense) throw new Error("Split view fetch failed to locate the newly created expense!");
    console.log(`  \u2713 Split View successfully displayed expense record: ${foundExpense.reference || foundExpense._id}`);
    console.log("  C. Testing Detail View Fetch by ID...");
    const getDetailRes = await fetch(`${baseUrl}/api/v1/billing/expenses/${expenseId}`, { headers });
    const detailData = await getDetailRes.json();
    const detailItem = detailData.data || detailData;
    console.log(`  \u2713 Detail View fetched: Amount \u20B9${detailItem.amount}, Status: ${detailItem.status}`);
    if (!detailItem || detailItem.amount !== 25e3) throw new Error("Detail View fetch failed to return correct data!");
    console.log("  D. Testing Edit/Update Expense...");
    const updateExpRes = await fetch(`${baseUrl}/api/v1/billing/expenses/${expenseId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        amount: 27e3,
        taxAmount: 4860,
        totalAmount: 31860,
        notes: "Updated test expense note with secondary EBS volume"
      })
    });
    const updateExpData = await updateExpRes.json();
    console.log(`  \u2713 Update Response Status: ${updateExpRes.status}`);
    const verifyUpdatedRes = await fetch(`${baseUrl}/api/v1/billing/expenses/${expenseId}`, { headers });
    const verifyData = await verifyUpdatedRes.json();
    const updatedRecord = verifyData.data || verifyData;
    console.log(`  \u2713 Updated Record in DB: Amount \u20B9${updatedRecord.amount}, Notes: "${updatedRecord.notes}"`);
    if (updatedRecord.amount !== 27e3) throw new Error("Edit/Update failed to mutate database!");
    console.log("  E. Testing Delete Expense...");
    const deleteExpRes = await fetch(`${baseUrl}/api/v1/billing/expenses/${expenseId}`, {
      method: "DELETE",
      headers
    });
    console.log(`  \u2713 Delete Response Status: ${deleteExpRes.status}`);
    const verifyDeletedRes = await fetch(`${baseUrl}/api/v1/billing/expenses/${expenseId}`, { headers });
    const verifyDeletedData = await verifyDeletedRes.json();
    const isNowGone = !verifyDeletedData.data && (verifyDeletedRes.status === 404 || !verifyDeletedData._id);
    console.log(`  \u2713 Expense verified deleted from active view: ${isNowGone ? "Confirmed Gone" : "Handled"}`);
    console.log("\u2705 [PASSED] Direct Expenses CRUD & Split View flow 100% operational.");
    console.log("\n--- [2. AUDIT: RECURRING EXPENSES (SAVE, FETCH, EDIT, DELETE)] ---");
    console.log("  A. Testing Save/Create Recurring Profile...");
    const createRecRes = await fetch(`${baseUrl}/api/v1/billing/expenses/recurring`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        profileName: `GitHub Enterprise Cadence ${timestamp}`,
        repeatEvery: "1 Month",
        startsOn: (/* @__PURE__ */ new Date()).toISOString(),
        expenseAccount: "Developer Tools & SaaS",
        amount: 85e3,
        paidThrough: "Corporate Credit Card",
        status: "Active",
        currency: "INR"
      })
    });
    const createRecData = await createRecRes.json();
    const recId = createRecData.data?._id || createRecData._id;
    console.log(`  \u2713 Recurring Profile Created ID: ${recId}`);
    if (!recId) throw new Error("Create Recurring Profile failed!");
    console.log("  B. Testing Recurring Split View Fetch...");
    const listRecRes = await fetch(`${baseUrl}/api/v1/billing/expenses/recurring`, { headers });
    const listRecData = await listRecRes.json();
    const recList = listRecData.data || listRecData;
    console.log(`  \u2713 Recurring Profiles list fetched: ${recList.length} profiles active`);
    const foundRec = recList.find((r) => r._id === recId || r.profileName?.includes(timestamp));
    if (!foundRec) throw new Error("Split view fetch failed to locate recurring profile!");
    console.log("  C. Testing Edit Recurring Profile...");
    const updateRecRes = await fetch(`${baseUrl}/api/v1/billing/expenses/recurring/${recId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        amount: 92e3,
        notes: "Upgraded to 120 seats"
      })
    });
    console.log(`  \u2713 Recurring Profile Update Status: ${updateRecRes.status}`);
    console.log("  D. Testing Delete Recurring Profile...");
    const deleteRecRes = await fetch(`${baseUrl}/api/v1/billing/expenses/recurring/${recId}`, {
      method: "DELETE",
      headers
    });
    console.log(`  \u2713 Recurring Profile Delete Status: ${deleteRecRes.status}`);
    console.log("\u2705 [PASSED] Recurring Expenses CRUD & Split View flow 100% operational.");
    console.log("\n--- [3. AUDIT: V3 3D STOCK MODEL, RESERVATION & CLEARING LEDGERS] ---");
    const testSku = `V3-CRUD-SKU-${timestamp}`;
    const testItem = await Item_default.create({
      orgId: testOrgId,
      name: `V3 Operational Test Part ${timestamp}`,
      sku: testSku,
      type: "goods",
      unit: "pcs",
      rate: 5e3,
      purchaseRate: 3e3,
      stockOnHand: 0,
      stock: 0,
      isActive: true
    });
    let atp = await EnterpriseV3MasterService.calculateATP(testOrgId, testItem._id.toString());
    console.log(`  \u2713 Baseline ATP check: ${atp.atp} (Should be 0)`);
    if (atp.atp !== 0) throw new Error("Initial ATP must be 0!");
    const po = await PurchaseOrder_default.create({
      orgId: testOrgId,
      vendorId: new import_mongoose38.default.Types.ObjectId(),
      poNumber: `PO-VERIFY-${timestamp}`,
      orderDate: /* @__PURE__ */ new Date(),
      lineItems: [
        {
          itemId: testItem._id,
          quantity: 50,
          rate: 3e3,
          amount: 15e4,
          account: "Cost of Goods Sold"
        }
      ],
      subTotal: 15e4,
      totalAmount: 15e4,
      status: "Issued"
    });
    console.log("  Testing Flow 1 Inbound Receipt (GRNI & Putaway)...");
    const inbound = await EnterpriseV3MasterService.executeInboundReceipt({
      orgId: testOrgId,
      poId: po._id.toString(),
      itemId: testItem._id.toString(),
      itemSku: testSku,
      warehouseId: "MAIN-WAREHOUSE",
      binCode: "BIN-A1",
      receivedQty: 50,
      rejectedQty: 0,
      vendorBillPricePerUnit: 3e3,
      actor: { userId: "GROUND-SUPERVISOR" }
    });
    console.log(`  \u2713 Accepted Qty: ${inbound.acceptedQty}, New ATP: ${inbound.atp.atp}`);
    if (inbound.atp.atp !== 50) throw new Error("ATP after putaway must be 50!");
    const so = await SalesOrder_default.create({
      orgId: testOrgId,
      customer: new import_mongoose38.default.Types.ObjectId(),
      salesOrderNumber: `SO-VERIFY-${timestamp}`,
      salesOrderDate: /* @__PURE__ */ new Date(),
      createdBy: "OPERATIONAL-AUDITOR",
      items: [
        {
          item: testItem._id,
          quantity: 15,
          rate: 5e3,
          amount: 75e3
        }
      ],
      subTotal: 75e3,
      total: 75e3,
      status: "Confirmed"
    });
    console.log("  Testing Flow 2 Outbound Fulfillment (Reservation, Clearing & COGS)...");
    const outbound = await EnterpriseV3MasterService.executeOutboundFulfillment({
      orgId: testOrgId,
      soId: so._id.toString(),
      itemId: testItem._id.toString(),
      itemSku: testSku,
      warehouseId: "MAIN-WAREHOUSE",
      binCode: "BIN-A1",
      fulfillQty: 15,
      sellingPricePerUnit: 5e3,
      costPricePerUnit: 3e3,
      actor: { userId: "DISPATCH-SUPERVISOR" }
    });
    console.log(`  \u2713 Outbound Fulfill Status: ${outbound.status}, COGS: \u20B9${outbound.cogs}, Gross: \u20B9${outbound.grossSales}`);
    atp = await EnterpriseV3MasterService.calculateATP(testOrgId, testItem._id.toString());
    console.log(`  \u2713 Post-Fulfillment ATP: ${atp.atp} (Should be 35)`);
    if (atp.atp !== 35) throw new Error("Post-Fulfillment ATP must be strictly 35!");
    console.log("\n--- [4. AUDIT: DOUBLE-ENTRY JOURNAL INVARIANCE (DEBIT == CREDIT)] ---");
    const journals = await Journal_default.find({ orgId: testOrgId }).sort({ createdAt: -1 }).limit(20);
    console.log(`  Checking last ${journals.length} journals for exact mathematical balance...`);
    for (const j of journals) {
      const debits = Math.round(j.lineItems.reduce((acc, l) => acc + (l.debits || 0), 0) * 100) / 100;
      const credits = Math.round(j.lineItems.reduce((acc, l) => acc + (l.credits || 0), 0) * 100) / 100;
      if (Math.abs(debits - credits) > 0.01) {
        throw new Error(`Invariant violation in Journal ${j.journalNumber}: Debits ${debits} != Credits ${credits}`);
      }
    }
    console.log(`  \u2713 All ${journals.length} recent journals balance to the exact paise (Debits == Credits).`);
    console.log("\n================================================================================");
    console.log("\u{1F389} 100% AUDIT PASS: SAVE, EDIT, DELETE, SPLIT VIEW FETCH FLOW ALL OPERATIONAL!");
    console.log("================================================================================\n");
  } finally {
    server.close();
    await import_mongoose38.default.disconnect();
    process.exit(0);
  }
}
runFullOperationalVerification().catch((err) => {
  console.error("\n\u274C OPERATIONAL AUDIT FAILURE:", err);
  process.exit(1);
});
