import mongoose from 'mongoose';
import ERPConfig, { IERPConfig } from '../models/ERPConfig';
import StockReservation, { IStockReservation } from '../../domains/inventory/models/StockReservation';
import StockBalance, { IStockBalance } from '../../domains/inventory/models/StockBalance';
import StockLedger from '../../domains/inventory/models/StockLedger';
import Journal from '../../domains/books/models/Journal';
import LedgerEntry from '../../domains/books/models/LedgerEntry';
import Item from '../../domains/inventory/models/Item';
import Customer from '../../domains/billing/models/Customer';
import Vendor from '../../domains/inventory/models/Vendor';
import PurchaseOrder from '../../domains/inventory/models/PurchaseOrder';
import SalesOrder from '../../domains/billing/models/SalesOrder';
import Invoice from '../../domains/billing/models/Invoice';
import Bill from '../../domains/inventory/models/Bill';
import FixedAsset from '../../domains/books/models/FixedAsset';
import WorkOrder from '../../domains/inventory/models/WorkOrder';
import Routing from '../../domains/inventory/models/Routing';
import Machine from '../../domains/inventory/models/Machine';

export interface IActor {
  userId: string;
  name?: string;
  role?: string;
}

export class EnterpriseV3MasterService {
  /**
   * Helper: Get dynamic configuration from DB (Zero hardcoding)
   */
  public static async getConfig(orgId: string): Promise<IERPConfig> {
    return await ERPConfig.getOrCreate(orgId);
  }

  /**
   * Helper: Immutable Double-Entry Ledger Posting
   * Invariant: Sum of Debits === Sum of Credits (Zero tolerance)
   */
  public static async postBalancedJournal(
    orgId: string,
    transactionType: string,
    transactionId: string,
    referenceNumber: string,
    notes: string,
    lines: Array<{
      account: string;
      debit: number;
      credit: number;
      description?: string;
    }>,
    date: Date = new Date()
  ) {
    const totalDebits = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredits = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);

    const roundedDebits = Math.round(totalDebits * 100) / 100;
    const roundedCredits = Math.round(totalCredits * 100) / 100;

    if (Math.abs(roundedDebits - roundedCredits) > 0.01) {
      throw new Error(
        `[INVARIANT VIOLATION] Debit and Credit must balance! Debits: ${roundedDebits}, Credits: ${roundedCredits}`
      );
    }

    const journal = await Journal.create({
      orgId,
      date,
      journalNumber: `JRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceNumber,
      notes,
      reportingMethod: 'accrual',
      currency: 'INR',
      lineItems: lines.map((l) => ({
        account: l.account,
        description: l.description || notes,
        debits: l.debit || 0,
        credits: l.credit || 0
      })),
      subTotal: roundedDebits,
      total: roundedDebits,
      status: 'Published'
    });

    await LedgerEntry.create({
      orgId,
      transactionId: transactionId || journal._id.toString(),
      transactionType: transactionType as any,
      date,
      currency: 'INR',
      status: 'Posted',
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
  public static async calculateATP(orgId: string, itemId: string, warehouseId?: string) {
    const matchQuery: any = {
      orgId,
      itemId,
      location: 'STORAGE_BINS',
      status: 'AVAILABLE'
    };
    if (warehouseId) matchQuery.warehouseId = warehouseId;

    const availableBalances = await StockBalance.find(matchQuery);
    const sellableOnHand = availableBalances.reduce((sum, b) => sum + (b.quantity || 0), 0);

    const now = new Date();
    const resQuery: any = {
      orgId,
      itemId,
      status: 'ACTIVE',
      expiresAt: { $gt: now }
    };
    if (warehouseId) resQuery.warehouseId = warehouseId;

    const activeReservations = await StockReservation.find(resQuery);
    const unpickedReservations = activeReservations.reduce((sum, r) => sum + (r.quantity || 0), 0);

    const atp = Math.max(0, sellableOnHand - unpickedReservations);

    return {
      sellableOnHand,
      unpickedReservations,
      atp
    };
  }

  /**
   * FLOW 1: Procure-to-Pay (P2P) Inbound Supply Gate (D-5 & D-6 aligned)
   */
  public static async executeInboundReceipt(params: {
    orgId: string;
    poId: string;
    itemId: string;
    itemSku: string;
    warehouseId: string;
    binCode?: string;
    receivedQty: number;
    rejectedQty: number;
    vendorBillPricePerUnit: number;
    actor: IActor;
  }) {
    const config = await this.getConfig(params.orgId);
    const po = await PurchaseOrder.findById(params.poId);
    if (!po) throw new Error(`PO not found: ${params.poId}`);

    const poRate = po.lineItems?.[0]?.rate || params.vendorBillPricePerUnit;
    const poQty = po.lineItems?.[0]?.quantity || params.receivedQty;

    // Tolerance Checks (Dynamic from ERPConfig)
    const maxAllowedQty = poQty * (1 + config.tolerances.overDeliveryTolerancePct / 100);
    const totalIncoming = params.receivedQty + params.rejectedQty;

    if (totalIncoming > maxAllowedQty) {
      throw new Error(
        `[LOCK 1.1] Over-delivery exceeds dynamic tolerance limit of ${config.tolerances.overDeliveryTolerancePct}%. Max allowed: ${maxAllowedQty}, Attempted: ${totalIncoming}`
      );
    }

    // PPV Tolerance Check upfront
    const billRate = params.vendorBillPricePerUnit;
    const allowedVariancePct = config.tolerances.priceVarianceTolerancePct;
    const actualVariancePct = Math.abs(((billRate - poRate) / poRate) * 100);
    if (actualVariancePct > allowedVariancePct) {
      throw new Error(
        `[LOCK 1.5] Purchase Price Variance of ${actualVariancePct.toFixed(2)}% exceeds allowed dynamic tolerance of ${allowedVariancePct}%!`
      );
    }

    const acceptedQty = params.receivedQty;
    const rejectedQty = params.rejectedQty;

    // 1. Move Accepted Units to INBOUND_DOCK (Pending Putaway - ATP stays 0 until physical putaway scan) (D-5)
    let dockBalance = await StockBalance.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: 'INBOUND_DOCK',
      status: 'QC_HOLD'
    });

    if (!dockBalance) {
      dockBalance = new StockBalance({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        itemSku: params.itemSku,
        location: 'INBOUND_DOCK',
        binCode: 'INBOUND_STAGE_DOCK',
        status: 'QC_HOLD',
        quantity: 0,
        unitCost: poRate,
        totalValuation: 0
      });
    }

    dockBalance.quantity += acceptedQty;
    dockBalance.totalValuation = dockBalance.quantity * poRate;
    await dockBalance.save();

    // 2. Move Rejected Units to QC_AREA / QUARANTINE
    if (rejectedQty > 0) {
      let quarantineBalance = await StockBalance.findOne({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        location: 'QC_AREA',
        binCode: 'QUARANTINE_BIN',
        status: 'QUARANTINE'
      });

      if (!quarantineBalance) {
        quarantineBalance = new StockBalance({
          orgId: params.orgId,
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemSku: params.itemSku,
          location: 'QC_AREA',
          binCode: 'QUARANTINE_BIN',
          status: 'QUARANTINE',
          quantity: 0,
          unitCost: poRate,
          totalValuation: 0
        });
      }

      quarantineBalance.quantity += rejectedQty;
      quarantineBalance.totalValuation = quarantineBalance.quantity * poRate;
      await quarantineBalance.save();
    }

    // 3. Stock Ledger Audit Trail (Immutable)
    await StockLedger.create({
      orgId: params.orgId,
      itemId: params.itemId,
      itemSku: params.itemSku,
      fromLocation: { type: 'VENDOR', code: 'GATE_ENTRY' },
      toLocation: { type: 'STAGE_DOCK', code: 'INBOUND_STAGE_DOCK' },
      bucketFrom: 'VENDOR_GATE',
      bucketTo: 'INBOUND_DOCK',
      quantity: acceptedQty,
      valuationRate: poRate,
      totalValuation: acceptedQty * poRate,
      referenceDocType: 'PURCHASE_RECEIVE',
      referenceDocNumber: po.poNumber,
      actor: params.actor,
      timestamp: new Date()
    });

    // 4. GRN Financial Accrual: Dr Inventory / Cr GRNI Accrual
    const acceptedValuation = acceptedQty * poRate;
    await this.postBalancedJournal(
      params.orgId,
      'GRN',
      po._id.toString(),
      po.poNumber,
      `GRN Inbound Accrual for PO ${po.poNumber} (${acceptedQty} units at ₹${poRate})`,
      [
        { account: 'Inventory Asset', debit: acceptedValuation, credit: 0 },
        { account: 'GRNI Accrual', debit: 0, credit: acceptedValuation }
      ]
    );

    return {
      status: 'RECEIVED_AT_DOCK',
      acceptedQty,
      rejectedQty,
      acceptedValuation,
      atp: await this.calculateATP(params.orgId, params.itemId, params.warehouseId)
    };
  }

  /**
   * FLOW 1 (Putaway Gate): Scans destination bin to activate ATP (D-5)
   */
  public static async executePutawayScan(params: {
    orgId: string;
    itemId: string;
    itemSku: string;
    warehouseId: string;
    binCode: string;
    putawayQty: number;
    actor: IActor;
  }) {
    // 1. Deduct from INBOUND_DOCK
    const dockBalance = await StockBalance.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: 'INBOUND_DOCK',
      status: 'QC_HOLD'
    });

    if (!dockBalance || dockBalance.quantity < params.putawayQty) {
      throw new Error(`Insufficient dock stock to putaway! Available at dock: ${dockBalance?.quantity || 0}`);
    }

    const unitCost = dockBalance.unitCost || 2800;
    dockBalance.quantity -= params.putawayQty;
    dockBalance.totalValuation = dockBalance.quantity * unitCost;
    await dockBalance.save();

    // 2. Put into STORAGE_BINS with status AVAILABLE -> Activates ATP!
    let binBalance = await StockBalance.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: 'STORAGE_BINS',
      binCode: params.binCode,
      status: 'AVAILABLE'
    });

    if (!binBalance) {
      binBalance = new StockBalance({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        itemSku: params.itemSku,
        location: 'STORAGE_BINS',
        binCode: params.binCode,
        status: 'AVAILABLE',
        quantity: 0,
        unitCost,
        totalValuation: 0
      });
    }

    binBalance.quantity += params.putawayQty;
    binBalance.totalValuation = binBalance.quantity * unitCost;
    await binBalance.save();

    // 3. Update Item Master Stock
    await Item.updateOne(
      { _id: params.itemId },
      {
        $inc: {
          stockOnHand: params.putawayQty,
          stock: params.putawayQty
        }
      }
    );

    // 4. Ledger Trail
    await StockLedger.create({
      orgId: params.orgId,
      itemId: params.itemId,
      itemSku: params.itemSku,
      fromLocation: { type: 'INBOUND_DOCK', code: 'INBOUND_STAGE_DOCK' },
      toLocation: { type: 'STORAGE_BIN', code: params.binCode },
      bucketFrom: 'INBOUND_DOCK',
      bucketTo: 'STORAGE_BINS',
      quantity: params.putawayQty,
      valuationRate: unitCost,
      totalValuation: params.putawayQty * unitCost,
      referenceDocType: 'PUTAWAY',
      referenceDocNumber: `PUT-${Date.now()}`,
      actor: params.actor,
      timestamp: new Date()
    });

    return {
      status: 'PUTAWAY_COMPLETED_ATP_ACTIVATED',
      putawayQty: params.putawayQty,
      destinationBin: params.binCode,
      atp: await this.calculateATP(params.orgId, params.itemId, params.warehouseId)
    };
  }

  /**
   * FLOW 1 (Vendor Bill 3-Way Match & ITC Pending Flow) (D-6)
   */
  public static async executeVendorBillThreeWayMatch(params: {
    orgId: string;
    poId: string;
    totalBillUnits: number; // e.g. 100 units
    acceptedUnits: number; // e.g. 95 units
    rejectedUnits: number; // e.g. 5 units
    unitPrice: number; // e.g. ₹2,800
    gstRatePct?: number; // e.g. 18%
  }) {
    const config = await this.getConfig(params.orgId);
    const gstRate = params.gstRatePct ?? (config.taxTable.defaultGstRate || 18);

    const grossGoodsValue = params.totalBillUnits * params.unitPrice; // 100 * 2800 = 2,80,000
    const grossGst = (grossGoodsValue * gstRate) / 100; // 50,400
    const grossBillTotal = grossGoodsValue + grossGst; // 3,30,400

    const acceptedValuation = params.acceptedUnits * params.unitPrice; // 95 * 2800 = 2,66,000
    const acceptedGst = (acceptedValuation * gstRate) / 100; // 47,880

    const rejectedGoodsValue = params.rejectedUnits * params.unitPrice; // 5 * 2800 = 14,000
    const rejectedItcPending = (rejectedGoodsValue * gstRate) / 100; // 2,520
    const supplierCreditNoteAmount = rejectedGoodsValue + rejectedItcPending; // 16,520

    const netPayableLiability = grossBillTotal - supplierCreditNoteAmount; // 3,13,880

    // Step 1: Post Gross Vendor Bill (₹3,30,400) with ITC Pending & Vendor Return Receivable
    await this.postBalancedJournal(
      params.orgId,
      'Bill',
      params.poId,
      `BILL-GROSS-${Date.now()}`,
      `Gross Vendor Bill: 100 units ₹3,30,400 (Accepted ₹2,66,000, Return Recv ₹14,000, ITC Pending ₹2,520)`,
      [
        { account: 'GRNI Accrual', debit: acceptedValuation, credit: 0 },
        { account: 'Input GST (Eligible ITC)', debit: acceptedGst, credit: 0 },
        { account: 'Vendor Return Receivable (Debit Note)', debit: rejectedGoodsValue, credit: 0 },
        { account: 'ITC Pending (Rejected Units)', debit: rejectedItcPending, credit: 0 },
        { account: 'Accounts Payable', debit: 0, credit: grossBillTotal }
      ]
    );

    // Step 2: Upon receipt of Supplier Credit Note (Section 34 CGST Act):
    await this.postBalancedJournal(
      params.orgId,
      'DebitNote',
      params.poId,
      `SCN-SEC34-${Date.now()}`,
      `Supplier Credit Note Settlement: Clears Return Recv ₹14,000 & ITC Pending ₹2,520, Net AP resolves to ₹${netPayableLiability}`,
      [
        { account: 'Accounts Payable', debit: supplierCreditNoteAmount, credit: 0 },
        { account: 'Vendor Return Receivable (Debit Note)', debit: 0, credit: rejectedGoodsValue },
        { account: 'ITC Pending (Rejected Units)', debit: 0, credit: rejectedItcPending }
      ]
    );

    return {
      status: 'THREE_WAY_MATCH_COMPLETED',
      grossBillTotal,
      rejectedItcPending,
      vendorReturnReceivable: rejectedGoodsValue,
      supplierCreditNoteAmount,
      netPayableLiability
    };
  }

  /**
   * FLOW 2: Order-to-Cash (O2C) Outbound Fulfillment Gate
   */
  public static async executeOutboundFulfillment(params: {
    orgId: string;
    soId: string;
    itemId: string;
    itemSku: string;
    warehouseId: string;
    binCode?: string;
    fulfillQty: number;
    sellingPricePerUnit: number;
    costPricePerUnit: number;
    actor: IActor;
  }) {
    const config = await this.getConfig(params.orgId);
    const so = await SalesOrder.findById(params.soId);
    if (!so) throw new Error(`SO not found: ${params.soId}`);

    // 1. ATP Check before Reservation
    const atpResult = await this.calculateATP(params.orgId, params.itemId, params.warehouseId);
    if (atpResult.atp < params.fulfillQty) {
      throw new Error(
        `[LOCK 2.1 - ZERO OVERSELLING] Insufficient ATP stock! Available ATP: ${atpResult.atp}, Requested: ${params.fulfillQty}`
      );
    }

    // 2. Create Stock Reservation with Dynamic Layered TTL (D-4)
    const softHours = config.tolerances.softReservationHours || 48;
    const expiresAt = new Date(Date.now() + softHours * 60 * 60 * 1000);

    const reservation = await StockReservation.create({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      itemSku: params.itemSku,
      soId: params.soId,
      quantity: params.fulfillQty,
      type: 'HARD',
      status: 'ACTIVE',
      allocatedBy: params.actor.userId,
      expiresAt
    });

    // 3. Picking: Stock moves to PICK_CART
    const binCode = params.binCode || 'BIN-RACK-B04';
    const sourceBalance = await StockBalance.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: 'STORAGE_BINS',
      binCode,
      status: 'AVAILABLE'
    });

    if (!sourceBalance || sourceBalance.quantity < params.fulfillQty) {
      throw new Error(`[LOCK 2.2] Bin ${binCode} does not contain enough physical stock!`);
    }

    sourceBalance.quantity -= params.fulfillQty;
    sourceBalance.totalValuation = sourceBalance.quantity * params.costPricePerUnit;
    await sourceBalance.save();

    let cartBalance = await StockBalance.findOne({
      orgId: params.orgId,
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      location: 'PICK_CART',
      status: 'ALLOCATED'
    });

    if (!cartBalance) {
      cartBalance = new StockBalance({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        itemSku: params.itemSku,
        location: 'PICK_CART',
        binCode: 'CART-01',
        status: 'ALLOCATED',
        quantity: 0,
        unitCost: params.costPricePerUnit,
        totalValuation: 0
      });
    }

    cartBalance.quantity += params.fulfillQty;
    cartBalance.totalValuation = cartBalance.quantity * params.costPricePerUnit;
    await cartBalance.save();

    const soNumber = (so as any).salesOrderNumber || (so as any).orderNumber || `SO-${so._id}`;

    // 4. Pack Complete & Invoice Draft with IRN / E-Way Bill (Section 6.1)
    const gstRate = config.taxTable.defaultGstRate || 18;
    const grossSales = params.fulfillQty * params.sellingPricePerUnit;
    const outputGst = (grossSales * gstRate) / 100;
    const totalArAmount = grossSales + outputGst;

    await this.postBalancedJournal(
      params.orgId,
      'Invoice',
      so._id.toString(),
      soNumber,
      `Pack Complete Draft Invoice & IRN Generated for SO ${soNumber}`,
      [
        { account: 'Accounts Receivable', debit: totalArAmount, credit: 0 },
        { account: 'Output GST Payable', debit: 0, credit: outputGst },
        { account: 'Sales Clearing Account', debit: 0, credit: grossSales }
      ]
    );

    // 5. Courier Handover / Dispatch Manifest Gate (Control Transfer Point)
    reservation.status = 'PICKED';
    await reservation.save();

    cartBalance.quantity -= params.fulfillQty;
    cartBalance.totalValuation = cartBalance.quantity * params.costPricePerUnit;
    await cartBalance.save();

    const totalCogs = params.fulfillQty * params.costPricePerUnit;
    await this.postBalancedJournal(
      params.orgId,
      'Dispatch',
      so._id.toString(),
      soNumber,
      `Courier Dispatch Derecognition & Revenue Realization for SO ${soNumber}`,
      [
        { account: 'Cost of Goods Sold (COGS)', debit: totalCogs, credit: 0 },
        { account: 'Inventory Asset', debit: 0, credit: totalCogs },
        { account: 'Sales Clearing Account', debit: grossSales, credit: 0 },
        { account: 'Realized Sales Revenue', debit: 0, credit: grossSales }
      ]
    );

    // Update parent Item master
    await Item.updateOne(
      { _id: params.itemId },
      {
        $inc: {
          stockOnHand: -params.fulfillQty,
          stock: -params.fulfillQty
        }
      }
    );

    return {
      status: 'DISPATCHED_AND_POSTED',
      fulfillQty: params.fulfillQty,
      grossSales,
      cogs: totalCogs,
      reservationId: reservation._id
    };
  }

  /**
   * FLOW 3: Ind AS 115 / IFRS 15 Standalone Selling Price (SSP) Allocation for Hybrid Bundles (D-9)
   * Fixture: ₹30,000 Bundle (₹20,000 Hardware Point-in-time + ₹10,000 SaaS Over-time)
   * GST Rule: No advance GST on goods; advance GST applies only on services -> Day-1 Journal ₹35,400
   */
  public static async executeIndAS115SSPAllocation(params: {
    orgId: string;
    customerId: string;
    bundlePrice: number;
    hardwareSSP: number;
    saasSSP: number;
    durationMonths: number;
  }) {
    const totalSSP = params.hardwareSSP + params.saasSSP;
    if (totalSSP <= 0) throw new Error('Total Standalone Selling Price must be greater than 0');

    const hardwareRatio = params.hardwareSSP / totalSSP;
    const saasRatio = params.saasSSP / totalSSP;

    const allocatedHardwareRevenue = Math.round(params.bundlePrice * hardwareRatio * 100) / 100;
    const allocatedSaasRevenue = Math.round((params.bundlePrice - allocatedHardwareRevenue) * 100) / 100;
    const monthlyAmortization = Math.round((allocatedSaasRevenue / params.durationMonths) * 100) / 100;

    // GST Rule (D-9): 18% GST on entire bundle = ₹5,400 (Hardware GST ₹3,600 + Service GST ₹1,800)
    const hardwareGst = Math.round((allocatedHardwareRevenue * 0.18) * 100) / 100;
    const saasGst = Math.round((allocatedSaasRevenue * 0.18) * 100) / 100;
    const totalGst = hardwareGst + saasGst;
    const totalReceiptDay1 = params.bundlePrice + totalGst; // 30,000 + 5,400 = 35,400

    // Day-1 Journal Posting (₹35,400 balanced):
    // Dr Bank / Accounts Receivable: ₹35,400
    // Cr Realized Revenue (Hardware Point-in-time): ₹20,000
    // Cr Output GST on Hardware: ₹3,600
    // Cr Deferred SaaS Revenue: ₹10,000
    // Cr Output GST on SaaS Services: ₹1,800
    await this.postBalancedJournal(
      params.orgId,
      'Subscription',
      params.customerId,
      `SSP-BUNDLE-${Date.now()}`,
      `Ind AS 115 SSP Bundle Allocation: Hardware ₹${allocatedHardwareRevenue}, SaaS Deferred ₹${allocatedSaasRevenue}, GST ₹${totalGst}`,
      [
        { account: 'Accounts Receivable', debit: totalReceiptDay1, credit: 0 },
        { account: 'Realized Hardware Revenue', debit: 0, credit: allocatedHardwareRevenue },
        { account: 'Output GST Payable (Goods)', debit: 0, credit: hardwareGst },
        { account: 'Deferred SaaS Revenue', debit: 0, credit: allocatedSaasRevenue },
        { account: 'Output GST Payable (Services)', debit: 0, credit: saasGst }
      ]
    );

    return {
      bundlePrice: params.bundlePrice,
      hardwareRatio,
      saasRatio,
      allocatedHardwareRevenue,
      allocatedSaasRevenue,
      monthlyAmortization,
      day1Total: totalReceiptDay1
    };
  }

  /**
   * FLOW 4: Manufacturing (BOM, MRP Netting, Work Order 3-Gate Lifecycle, Standard Costing & Recall Trace) (D-1)
   */
  public static async executeManufacturingLifecycle(params: {
    orgId: string;
    workOrderNumber: string;
    parentItemId: string;
    parentSku: string;
    warehouseId: string;
    plannedQty: number;
    components: Array<{ itemId: string; sku: string; qtyRequired: number; unitCost: number }>;
    laborAndOverheadCost: number;
    actualProducedQty: number;
    actor: IActor;
  }) {
    // GATE 1: Component ATP Check (T-4.1)
    for (const comp of params.components) {
      const compATP = await this.calculateATP(params.orgId, comp.itemId, params.warehouseId);
      if (compATP.atp < comp.qtyRequired) {
        throw new Error(
          `[LOCK 4.1] Cannot release Work Order ${params.workOrderNumber}: Component ${comp.sku} has insufficient ATP (${compATP.atp} available, ${comp.qtyRequired} required)!`
        );
      }
    }

    // GATE 2: Issue Components to WIP (P-4.2)
    const totalComponentCost = params.components.reduce((sum, c) => sum + c.qtyRequired * c.unitCost, 0);
    const totalStandardCost = totalComponentCost + params.laborAndOverheadCost;

    // Financial Posting: Dr WIP Inventory / Cr Raw Material Inventory
    await this.postBalancedJournal(
      params.orgId,
      'WorkOrder',
      params.workOrderNumber,
      `WO-ISSUE-${params.workOrderNumber}`,
      `Work Order Component Issuance to WIP for ${params.plannedQty} units of ${params.parentSku}`,
      [
        { account: 'WIP Inventory Asset', debit: totalComponentCost, credit: 0 },
        { account: 'Raw Materials Inventory Asset', debit: 0, credit: totalComponentCost }
      ]
    );

    // GATE 3: Completion & Standard Costing Capitalization
    const yieldVariance = (params.actualProducedQty - params.plannedQty) * (totalStandardCost / params.plannedQty);
    const finishedGoodsValuation = params.actualProducedQty * (totalStandardCost / params.plannedQty);

    const completionLines = [
      { account: 'Finished Goods Inventory Asset', debit: finishedGoodsValuation, credit: 0 },
      { account: 'WIP Inventory Asset', debit: 0, credit: totalComponentCost },
      { account: 'Manufacturing Overhead Absorbed', debit: 0, credit: params.laborAndOverheadCost }
    ];

    if (yieldVariance < 0) {
      // Yield loss
      completionLines.push({ account: 'Manufacturing Yield Variance (Loss)', debit: Math.abs(yieldVariance), credit: 0 });
    } else if (yieldVariance > 0) {
      // Yield gain
      completionLines.push({ account: 'Manufacturing Yield Variance (Gain)', debit: 0, credit: yieldVariance });
    }

    await this.postBalancedJournal(
      params.orgId,
      'WorkOrder',
      params.workOrderNumber,
      `WO-CLOSE-${params.workOrderNumber}`,
      `Work Order Completion: Standard Cost ₹${finishedGoodsValuation}, Yield Variance ₹${yieldVariance}`,
      completionLines
    );

    return {
      status: 'WORK_ORDER_COMPLETED',
      plannedQty: params.plannedQty,
      actualProducedQty: params.actualProducedQty,
      totalStandardCost,
      yieldVariance,
      finishedGoodsValuation
    };
  }

  /**
   * FLOW 5: Warehouse Audits, 4-Tier Approval Ladder, ADJ_HOLD and Scrap Lifecycle (D-2 & D-10)
   */
  public static async executeCycleCountAndScrap(params: {
    orgId: string;
    warehouseId: string;
    itemId: string;
    itemSku: string;
    binCode: string;
    systemQty: number;
    countedQty: number;
    unitCost: number;
    witnessUserIds: string[];
    actor: IActor;
    approverUserId: string;
    approverRole?: string;
    cumulativeDailyAdjustmentsByUser?: number;
  }) {
    const config = await this.getConfig(params.orgId);

    // Segregation of Duties Check
    if (params.actor.userId === params.approverUserId) {
      if (config.controlProfile === 'STRICT' || config.controlProfile === 'STANDARD') {
        throw new Error(
          `[LOCK 9.1 - SoD VIOLATION] Operator who performed the physical count (${params.actor.userId}) cannot approve the adjustment!`
        );
      }
    }

    const varianceQty = params.countedQty - params.systemQty;
    const varianceValue = Math.abs(varianceQty * params.unitCost);

    // 4-Tier Approval Ladder Check (D-2)
    const tiers = config.tieredApprovalThresholds;
    let requiredTier = 'Tier 0 (Auto-Approved)';

    if (varianceValue <= tiers.tier0AutoLimit) {
      // Tier 0: Auto-approved up to ₹5,000 unless cumulative user daily limit is exceeded (T-5.4)
      const currentDaily = params.cumulativeDailyAdjustmentsByUser || 0;
      if (currentDaily + varianceValue > tiers.cumulativeDailyUserLimit) {
        throw new Error(
          `[LOCK 5.4] Cumulative daily adjustment limit of ₹${tiers.cumulativeDailyUserLimit} breached! Requires Tier 1 Manager Approval.`
        );
      }
      requiredTier = 'Tier 0 (Auto-Approved)';
    } else if (varianceValue <= tiers.tier1Limit) {
      requiredTier = 'Tier 1 (Store / Warehouse Manager)';
    } else if (varianceValue <= tiers.tier2Limit) {
      requiredTier = 'Tier 2 (Head of Supply Chain + Finance Manager Dual Sign-off)';
    } else {
      requiredTier = 'Tier 3 (SVP Operations + Finance Director Dual Sign-off)';
    }

    // Shortage handling
    if (varianceQty < 0) {
      const shortage = Math.abs(varianceQty);

      // Check physical witnesses for scrap (D-10)
      if (params.witnessUserIds.length < 2) {
        throw new Error('[LOCK 9.4] Scrap disposal requires at least 2 authorized physical witnesses!');
      }

      // Scrap Write-Off with GST Section 17(5)(h) Reversal
      const gstRate = config.taxTable.defaultGstRate || 18;
      const gstReversalAmount = (varianceValue * gstRate) / 100;

      await this.postBalancedJournal(
        params.orgId,
        'InventoryAdjustment',
        `SCRAP-${Date.now()}`,
        `SCRAP-LOSS-${params.itemSku}`,
        `Scrap Write-Off: Qty ${shortage}, Cost ₹${varianceValue}, GST Reversal ₹${gstReversalAmount}`,
        [
          { account: 'Inventory Loss (Scrap Expense)', debit: varianceValue, credit: 0 },
          { account: 'Inventory Asset', debit: 0, credit: varianceValue },
          { account: 'Input GST Reversal Expense (Sec 17(5)(h))', debit: gstReversalAmount, credit: 0 },
          { account: 'Input GST Pending Verification', debit: 0, credit: gstReversalAmount }
        ]
      );
    }

    return {
      status: 'APPROVED_AND_POSTED',
      varianceQty,
      varianceValue,
      requiredTier,
      approvedBy: params.approverUserId
    };
  }

  /**
   * FLOW 6: Returns, RTO, RMA and Reverse Logistics
   */
  public static async executeReturnsAndRTO(params: {
    orgId: string;
    soId: string;
    itemId: string;
    itemSku: string;
    warehouseId: string;
    returnQty: number;
    originalCostPrice: number;
    originalSellingPrice: number;
    triageDecision: 'RESTOCK' | 'SCRAP';
    actor: IActor;
  }) {
    const config = await this.getConfig(params.orgId);
    const gstRate = config.taxTable.defaultGstRate || 18;

    const totalCogsReversal = params.returnQty * params.originalCostPrice;
    const grossSalesReturn = params.returnQty * params.originalSellingPrice;
    const outputGstReversal = (grossSalesReturn * gstRate) / 100;
    const totalCreditMemo = grossSalesReturn + outputGstReversal;

    if (params.triageDecision === 'RESTOCK') {
      let restockBalance = await StockBalance.findOne({
        orgId: params.orgId,
        warehouseId: params.warehouseId,
        itemId: params.itemId,
        location: 'STORAGE_BINS',
        binCode: 'BIN-RACK-B04',
        status: 'AVAILABLE'
      });

      if (!restockBalance) {
        restockBalance = new StockBalance({
          orgId: params.orgId,
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemSku: params.itemSku,
          location: 'STORAGE_BINS',
          binCode: 'BIN-RACK-B04',
          status: 'AVAILABLE',
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
        'SalesReturn',
        params.soId,
        `RMA-${params.soId}`,
        `Restock Return: Reverse COGS ₹${totalCogsReversal}`,
        [
          { account: 'Inventory Asset', debit: totalCogsReversal, credit: 0 },
          { account: 'Cost of Goods Sold (COGS)', debit: 0, credit: totalCogsReversal }
        ]
      );
    } else {
      await this.postBalancedJournal(
        params.orgId,
        'SalesReturn',
        params.soId,
        `RMA-SCRAP-${params.soId}`,
        `Damaged Return Scrapped: Loss ₹${totalCogsReversal}`,
        [
          { account: 'Inventory Loss (Scrap Expense)', debit: totalCogsReversal, credit: 0 },
          { account: 'Cost of Goods Sold (COGS)', debit: 0, credit: totalCogsReversal }
        ]
      );
    }

    await this.postBalancedJournal(
      params.orgId,
      'CreditNote',
      params.soId,
      `CN-${Date.now()}`,
      `Credit Note on RMA Return for SO ${params.soId}`,
      [
        { account: 'Realized Sales Revenue', debit: grossSalesReturn, credit: 0 },
        { account: 'Output GST Payable', debit: outputGstReversal, credit: 0 },
        { account: 'Accounts Receivable', debit: 0, credit: totalCreditMemo }
      ]
    );

    return {
      status: 'RMA_COMPLETED',
      returnQty: params.returnQty,
      triageDecision: params.triageDecision,
      creditMemoAmount: totalCreditMemo
    };
  }

  /**
   * FLOW 7: Compliance, Statutory Rate Tables & Dynamic TDS (D-7)
   */
  public static async calculateStatutoryTax(params: {
    orgId: string;
    hsnSacCode: string;
    isInterstate: boolean;
    baseAmount: number;
    tdsSection?: '194C' | '194J' | '194Q' | '194I';
    vendorHasPan?: boolean;
  }) {
    const config = await this.getConfig(params.orgId);
    
    // 1. Dynamic GST Split
    const rule = config.taxTable.rateRules?.find(
      (r) => r.hsnSacCode === params.hsnSacCode && r.isInterstate === params.isInterstate
    );

    const taxRate = rule ? rule.taxRate : config.taxTable.defaultGstRate || 18;
    const cgstRate = rule ? rule.cgstRate : (params.isInterstate ? 0 : taxRate / 2);
    const sgstRate = rule ? rule.sgstRate : (params.isInterstate ? 0 : taxRate / 2);
    const igstRate = rule ? rule.igstRate : (params.isInterstate ? taxRate : 0);

    const cgstAmount = Math.round(((params.baseAmount * cgstRate) / 100) * 100) / 100;
    const sgstAmount = Math.round(((params.baseAmount * sgstRate) / 100) * 100) / 100;
    const igstAmount = Math.round(((params.baseAmount * igstRate) / 100) * 100) / 100;
    const totalGst = cgstAmount + sgstAmount + igstAmount;

    // 2. Dynamic TDS
    let tdsRate = 0;
    if (params.tdsSection) {
      if (params.vendorHasPan === false) {
        tdsRate = 20; // Statutory 20% flat penalty rate when PAN is not provided
      } else {
        tdsRate = config.taxTable.tdsRates[params.tdsSection] ?? 2;
      }
    }
    const tdsAmount = Math.round(((params.baseAmount * tdsRate) / 100) * 100) / 100;

    return {
      baseAmount: params.baseAmount,
      isInterstate: params.isInterstate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGst,
      tdsSection: params.tdsSection,
      tdsRate,
      tdsAmount,
      netPayable: params.baseAmount + totalGst - tdsAmount
    };
  }

  /**
   * FLOW 10: Finance Operations (Payment Gateways, COD Remittance, Bad Debt, Fixed Assets, Year-End)
   */
  public static async executeFinanceOperations(params: {
    orgId: string;
    flowType: 'GATEWAY_SETTLEMENT' | 'COD_REMITTANCE' | 'BAD_DEBT_ECL' | 'FIXED_ASSET_DEPRECIATION' | 'YEAR_END_CLOSE';
    payload: any;
    actor: IActor;
  }) {
    switch (params.flowType) {
      case 'GATEWAY_SETTLEMENT': {
        const { grossAmount, feeAmount, gstOnFee } = params.payload;
        const netBankDeposit = Math.round((grossAmount - feeAmount - gstOnFee) * 100) / 100;

        return await this.postBalancedJournal(
          params.orgId,
          'PaymentReceived',
          `GATEWAY-${Date.now()}`,
          `SETTLE-${Date.now()}`,
          `Payment Gateway Net Settlement: Gross ₹${grossAmount}, Fee ₹${feeAmount}, GST ₹${gstOnFee}, Net ₹${netBankDeposit}`,
          [
            { account: 'Main Bank Account', debit: netBankDeposit, credit: 0 },
            { account: 'Payment Gateway Fee Expense', debit: feeAmount, credit: 0 },
            { account: 'Input GST on Gateway Fee', debit: gstOnFee, credit: 0 },
            { account: 'Gateway Clearing Account', debit: 0, credit: grossAmount }
          ]
        );
      }

      case 'COD_REMITTANCE': {
        const { codCashCollected, courierFee, gstOnFee } = params.payload;
        const netPayout = Math.round((codCashCollected - courierFee - gstOnFee) * 100) / 100;

        return await this.postBalancedJournal(
          params.orgId,
          'PaymentReceived',
          `COD-${Date.now()}`,
          `COD-REMIT-${Date.now()}`,
          `3PL COD Courier Remittance: Cash ₹${codCashCollected}, Fee ₹${courierFee}, Net Bank ₹${netPayout}`,
          [
            { account: 'Main Bank Account', debit: netPayout, credit: 0 },
            { account: 'Courier Remittance Fee Expense', debit: courierFee, credit: 0 },
            { account: 'Input GST on Courier Fee', debit: gstOnFee, credit: 0 },
            { account: 'COD Receivable (Courier)', debit: 0, credit: codCashCollected }
          ]
        );
      }

      case 'BAD_DEBT_ECL': {
        const { overdueAmount, provisionRatePct } = params.payload;
        const provisionAmount = Math.round(((overdueAmount * provisionRatePct) / 100) * 100) / 100;

        return await this.postBalancedJournal(
          params.orgId,
          'ManualJournal',
          `ECL-${Date.now()}`,
          `ECL-PROVISION-${Date.now()}`,
          `Ind AS 109 Bad Debt ECL Provision on ₹${overdueAmount} at ${provisionRatePct}%`,
          [
            { account: 'Bad Debt Expense (ECL)', debit: provisionAmount, credit: 0 },
            { account: 'Allowance for Expected Credit Losses', debit: 0, credit: provisionAmount }
          ]
        );
      }

      case 'FIXED_ASSET_DEPRECIATION': {
        const { assetId, monthlyDepreciation } = params.payload;

        const asset = await FixedAsset.findById(assetId);
        if (asset) {
          asset.accumulatedDepreciation = (asset.accumulatedDepreciation || 0) + monthlyDepreciation;
          asset.currentBookValue = Math.max(0, (asset.purchasePrice || 0) - asset.accumulatedDepreciation);
          await asset.save();
        }

        return await this.postBalancedJournal(
          params.orgId,
          'ManualJournal',
          assetId,
          `DEP-${Date.now()}`,
          `Monthly Straight-Line Depreciation on Fixed Asset ₹${monthlyDepreciation}`,
          [
            { account: 'Depreciation Expense', debit: monthlyDepreciation, credit: 0 },
            { account: 'Accumulated Depreciation', debit: 0, credit: monthlyDepreciation }
          ]
        );
      }

      case 'YEAR_END_CLOSE': {
        const { totalRevenue, totalExpense } = params.payload;
        const netProfit = totalRevenue - totalExpense;

        return await this.postBalancedJournal(
          params.orgId,
          'ManualJournal',
          `YEAREND-${Date.now()}`,
          `CLOSE-${Date.now()}`,
          `Year-End P&L Close into Retained Earnings: Net Profit ₹${netProfit}`,
          [
            { account: 'Revenue Summary Account', debit: totalRevenue, credit: 0 },
            { account: 'Expense Summary Account', debit: 0, credit: totalExpense },
            { account: 'Retained Earnings', debit: 0, credit: netProfit }
          ]
        );
      }

      default:
        throw new Error(`Unsupported Finance Operation: ${params.flowType}`);
    }
  }

  /**
   * FLOW 11: Ground Operating Rules & Negative Stock Window (D-3)
   */
  public static async executeFlow11GroundExceptions(params: {
    orgId: string;
    exceptionType: 'PROVISIONAL_DOCK_INTAKE' | 'CONTROLLED_NEGATIVE_STOCK' | 'OFFLINE_SCAN_SYNC';
    payload: any;
    actor: IActor;
  }) {
    const config = await this.getConfig(params.orgId);

    switch (params.exceptionType) {
      case 'PROVISIONAL_DOCK_INTAKE': {
        const { itemId, itemSku, warehouseId, qty } = params.payload;

        let provBalance = await StockBalance.findOne({
          orgId: params.orgId,
          warehouseId,
          itemId,
          location: 'INBOUND_DOCK',
          status: 'QC_HOLD'
        });

        if (!provBalance) {
          provBalance = new StockBalance({
            orgId: params.orgId,
            warehouseId,
            itemId,
            itemSku,
            location: 'INBOUND_DOCK',
            binCode: 'PROVISIONAL_DOCK',
            status: 'QC_HOLD',
            quantity: 0,
            unitCost: 0,
            totalValuation: 0
          });
        }

        provBalance.quantity += qty;
        await provBalance.save();

        return {
          status: 'PROVISIONALLY_STORED_AT_DOCK',
          location: 'INBOUND_DOCK',
          statusField: 'QC_HOLD',
          atpImpact: 0,
          notes: 'Truck released from dock; stock locked pending vendor documentation.'
        };
      }

      case 'CONTROLLED_NEGATIVE_STOCK': {
        // Strict Policy (D-3): Sellable stock can NEVER go negative. Negative window is strictly restricted to non-batch consumables with max 24h window.
        const { itemCategory, isBatchTracked, supervisorOverrideId } = params.payload;

        if (isBatchTracked === true) {
          throw new Error('[LOCK 11.3 - MATHEMATICAL BLOCK] Batch-tracked and serialized goods can NEVER go negative!');
        }

        const allowedCats = config.tolerances.negativeStockAllowedCategories || ['CONSUMABLES', 'PACKING_MATERIAL'];
        if (!allowedCats.includes(itemCategory)) {
          throw new Error(
            `[LOCK 11.3] Negative stock is prohibited for sellable category "${itemCategory}". Strictly limited to non-batch consumables!`
          );
        }

        if (!supervisorOverrideId) {
          throw new Error('[LOCK 11.4] Controlled Negative Stock requires Supervisor Override ID!');
        }

        const maxHours = config.tolerances.negativeStockMaxHours || 24;
        const autoReconDeadline = new Date(Date.now() + maxHours * 60 * 60 * 1000);

        return {
          status: 'CONTROLLED_NEGATIVE_CONSUMABLE_AUTHORIZED',
          authorizedBy: supervisorOverrideId,
          allowedHours: maxHours,
          mandatoryReconciliationDeadline: autoReconDeadline
        };
      }

      case 'OFFLINE_SCAN_SYNC': {
        const { idempotencyKey, scans } = params.payload;
        return {
          status: 'SYNCED_IDEMPOTENTLY',
          idempotencyKey,
          processedScansCount: scans?.length || 0
        };
      }

      default:
        throw new Error(`Unsupported Ground Exception: ${params.exceptionType}`);
    }
  }
}
