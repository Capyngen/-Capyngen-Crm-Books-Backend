import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IERPConfig extends Document {
  orgId: string;
  controlProfile: 'LITE' | 'STANDARD' | 'STRICT';
  tolerances: {
    overDeliveryTolerancePct: number;
    underDeliveryTolerancePct: number;
    priceVarianceTolerancePct: number;
    reservationTtlHours: number;
    softReservationHours: number; // Layer 1: 48h
    scheduledDeliveryLeadWindowDays: number; // Layer 2
    confirmedSoReminderDays: number; // Layer 3: 7 days
    confirmedSoAutoReleaseDays: number; // Layer 3: 15 days
    negativeStockMaxHours: number; // 24h for consumables
    negativeStockAllowedCategories: string[]; // only non-batch consumables
    msmeDaysWithAgreement: number;
    msmeDaysWithoutAgreement: number;
    rule37ItcReversalDays: number;
    dunningIntervalsDays: number[];
  };
  tieredApprovalThresholds: {
    tier0AutoLimit: number; // <= 5,000 (Auto-approved with cumulative limit)
    tier1Limit: number; // 5,000 - 50,000 (Store / Warehouse Manager)
    tier2Limit: number; // 50,000 - 2,00,000 (Head SC + Finance Manager dual sign-off)
    tier3Limit: number; // > 2,00,000 (SVP Operations + Finance Director dual sign-off)
    cumulativeDailyUserLimit: number; // e.g. 25,000 max cumulative auto-approval
  };
  statusRegistries: {
    locations: string[];
    statuses: string[];
    reservationStatuses: string[];
    documentStatuses: Record<string, string[]>;
  };
  taxTable: {
    defaultGstRate: number;
    rateRules: Array<{
      hsnSacCode: string;
      description?: string;
      taxRate: number;
      isInterstate: boolean;
      cgstRate: number;
      sgstRate: number;
      igstRate: number;
    }>;
    tdsRates: Record<string, number>;
    tcsRates: Record<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IERPConfigModel extends Model<IERPConfig> {
  getOrCreate(orgId: string): Promise<IERPConfig>;
}

const ERPConfigSchema = new Schema<IERPConfig>(
  {
    orgId: { type: String, required: true, unique: true, index: true },
    controlProfile: {
      type: String,
      enum: ['LITE', 'STANDARD', 'STRICT'],
      default: 'STANDARD'
    },
    tolerances: {
      overDeliveryTolerancePct: { type: Number, default: 5 },
      underDeliveryTolerancePct: { type: Number, default: 5 },
      priceVarianceTolerancePct: { type: Number, default: 2 },
      reservationTtlHours: { type: Number, default: 2 },
      softReservationHours: { type: Number, default: 48 },
      scheduledDeliveryLeadWindowDays: { type: Number, default: 3 },
      confirmedSoReminderDays: { type: Number, default: 7 },
      confirmedSoAutoReleaseDays: { type: Number, default: 15 },
      negativeStockMaxHours: { type: Number, default: 24 },
      negativeStockAllowedCategories: { type: [String], default: ['CONSUMABLES', 'PACKING_MATERIAL'] },
      msmeDaysWithAgreement: { type: Number, default: 45 },
      msmeDaysWithoutAgreement: { type: Number, default: 15 },
      rule37ItcReversalDays: { type: Number, default: 180 },
      dunningIntervalsDays: { type: [Number], default: [0, 3, 7, 10] }
    },
    tieredApprovalThresholds: {
      tier0AutoLimit: { type: Number, default: 5000 },
      tier1Limit: { type: Number, default: 50000 },
      tier2Limit: { type: Number, default: 200000 },
      tier3Limit: { type: Number, default: 200000 },
      cumulativeDailyUserLimit: { type: Number, default: 25000 }
    },
    statusRegistries: {
      locations: {
        type: [String],
        default: [
          'INBOUND_DOCK',
          'QC_AREA',
          'STORAGE_BINS',
          'PICK_CART',
          'PACKING_TABLE',
          'OUTBOUND_BAY',
          'TRANSIT_INTERWH',
          'SCRAP_BAY',
          'WIP_SHOP_FLOOR',
          'RETURN_DOCK',
          'CUSTOMER_TRANSIT',
          'RTO_TRANSIT'
        ]
      },
      statuses: {
        type: [String],
        default: [
          'AVAILABLE',
          'QC_HOLD',
          'QUARANTINE',
          'ADJ_HOLD',
          'EXCESS_HOLD',
          'UNDER_INVESTIGATION',
          'RETURN_PENDING_QC',
          'REWORK',
          'DAMAGED'
        ]
      },
      reservationStatuses: {
        type: [String],
        default: ['ACTIVE', 'PICKED', 'RELEASED', 'EXPIRED']
      },
      documentStatuses: {
        type: Schema.Types.Mixed,
        default: {
          purchaseOrder: ['DRAFT', 'ISSUED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
          salesOrder: ['DRAFT', 'CONFIRMED', 'ALLOCATED', 'PICKING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CLOSED'],
          grn: ['DRAFT', 'ACCEPTED', 'QUARANTINE_SPLIT', 'POSTED'],
          invoice: ['DRAFT', 'IRN_GENERATED', 'DISPATCHED', 'PAID', 'VOID']
        }
      }
    },
    taxTable: {
      defaultGstRate: { type: Number, default: 18 },
      rateRules: {
        type: [
          {
            hsnSacCode: String,
            description: String,
            taxRate: Number,
            isInterstate: Boolean,
            cgstRate: Number,
            sgstRate: Number,
            igstRate: Number
          }
        ],
        default: [
          {
            hsnSacCode: '8708',
            description: 'Automobile Parts & Hardware',
            taxRate: 18,
            isInterstate: false,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 0
          },
          {
            hsnSacCode: '8708-INTER',
            description: 'Automobile Parts Interstate',
            taxRate: 18,
            isInterstate: true,
            cgstRate: 0,
            sgstRate: 0,
            igstRate: 18
          },
          {
            hsnSacCode: '9983',
            description: 'IT & Cloud SaaS Services',
            taxRate: 18,
            isInterstate: false,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 0
          }
        ]
      },
      tdsRates: {
        type: Schema.Types.Mixed,
        default: {
          '194C': 2,
          '194J': 10,
          '194Q': 0.1,
          '194I': 10
        }
      },
      tcsRates: {
        type: Schema.Types.Mixed,
        default: {
          '206C': 0.1
        }
      }
    }
  },
  { timestamps: true }
);

ERPConfigSchema.statics.getOrCreate = async function (orgId: string): Promise<IERPConfig> {
  let config = await this.findOne({ orgId });
  if (!config) {
    config = await this.create({ orgId });
  }
  return config;
};

export default (mongoose.models.ERPConfig as IERPConfigModel) ||
  mongoose.model<IERPConfig, IERPConfigModel>('ERPConfig', ERPConfigSchema);
