import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookSubscription extends Document {
    orgId: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
}

const WebhookSubscriptionSchema = new Schema({
    orgId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    events: [{ type: String }],
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const WebhookSubscription = mongoose.model<IWebhookSubscription>('WebhookSubscription', WebhookSubscriptionSchema);
