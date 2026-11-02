import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookSubscription extends Document {
    orgId: string;
    url: string;
    description?: string;
    events: string[];
    secret: string;
    isActive: boolean;
    failureCount: number;
    lastDeliveryStatus?: string;
    lastDeliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WebhookSubscriptionSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    description: { type: String },
    events: [{ type: String }],
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    failureCount: { type: Number, default: 0 },
    lastDeliveryStatus: { type: String },
    lastDeliveredAt: { type: Date }
}, { timestamps: true });

export const WebhookSubscription = mongoose.models.WebhookSubscription || mongoose.model<IWebhookSubscription>('WebhookSubscription', WebhookSubscriptionSchema);

export interface IWebhookDeliveryLog extends Document {
    orgId: string;
    subscriptionId: mongoose.Types.ObjectId;
    event: string;
    url: string;
    requestHeaders?: Record<string, string>;
    requestPayload: any;
    responseStatus?: number;
    responseBody?: string;
    latencyMs?: number;
    isSuccess: boolean;
    errorMessage?: string;
    createdAt: Date;
}

const WebhookDeliveryLogSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'WebhookSubscription', required: true, index: true },
    event: { type: String, required: true, index: true },
    url: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed },
    requestPayload: { type: Schema.Types.Mixed },
    responseStatus: { type: Number },
    responseBody: { type: String },
    latencyMs: { type: Number },
    isSuccess: { type: Boolean, default: false },
    errorMessage: { type: String }
}, { timestamps: true });

export const WebhookDeliveryLog = mongoose.models.WebhookDeliveryLog || mongoose.model<IWebhookDeliveryLog>('WebhookDeliveryLog', WebhookDeliveryLogSchema);

export interface ILifecycleEvent extends Document {
    orgId: string;
    eventId: string;
    eventType: string;
    domain: string;
    entityId?: string;
    payload: any;
    status: 'DELIVERED' | 'PENDING' | 'FAILED';
    subscribersNotified: number;
    createdAt: Date;
}

const LifecycleEventSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true, index: true },
    domain: { type: String, required: true, enum: ['billing', 'books', 'inventory'], default: 'billing' },
    entityId: { type: String },
    payload: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['DELIVERED', 'PENDING', 'FAILED'], default: 'DELIVERED' },
    subscribersNotified: { type: Number, default: 0 }
}, { timestamps: true });

export const LifecycleEvent = mongoose.models.LifecycleEvent || mongoose.model<ILifecycleEvent>('LifecycleEvent', LifecycleEventSchema);

