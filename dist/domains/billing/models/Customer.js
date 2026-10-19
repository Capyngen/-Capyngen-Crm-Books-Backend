"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AddressSchema = new mongoose_1.Schema({
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
const ContactPersonSchema = new mongoose_1.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    designation: String,
    isPrimary: Boolean
}, { _id: false });
const CustomerSchema = new mongoose_1.Schema({
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
    customerType: { type: String, enum: ['business', 'individual'] },
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
    status: { type: String, enum: ['Active', 'Inactive', 'ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    receivables: { type: Number, default: 0 },
    unusedCredits: { type: Number, default: 0 },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true },
    parentCustomerId: { type: String },
    creditLimit: { type: Number, default: 0 },
    availableCredit: { type: Number, default: 0 },
    portalAccessStatus: { type: String, enum: ['Invited', 'Active', 'Revoked'] }
}, { timestamps: true, optimisticConcurrency: true });
// CRITICAL: We point this model to the CRM's exact collection name!
const ClientAccountModel = mongoose_1.default.models.ClientAccount || mongoose_1.default.model('ClientAccount', CustomerSchema, 'clientaccounts');
if (!mongoose_1.default.models.BooksCustomer) {
    try {
        mongoose_1.default.model('BooksCustomer', CustomerSchema, 'clientaccounts');
    }
    catch (e) { }
}
if (!mongoose_1.default.models.Customer) {
    try {
        mongoose_1.default.model('Customer', CustomerSchema, 'clientaccounts');
    }
    catch (e) { }
}
exports.default = ClientAccountModel;
