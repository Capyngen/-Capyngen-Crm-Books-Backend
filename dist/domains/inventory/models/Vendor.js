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
    designation: String
});
const CustomFieldSchema = new mongoose_1.Schema({
    label: String,
    value: String
}, { _id: false });
const VendorSchema = new mongoose_1.Schema({
    orgId: { type: String },
    companyId: { type: String },
    vendorType: { type: String, enum: ['business', 'individual'], default: 'business' },
    salutation: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    companyName: { type: String },
    displayName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    mobile: { type: String },
    billingAddress: { type: AddressSchema, default: {} },
    shippingAddress: { type: AddressSchema, default: {} },
    contactPersons: { type: [ContactPersonSchema], default: [] },
    pan: { type: String },
    gstin: { type: String },
    taxTreatment: { type: String, default: 'Registered Business - Regular' },
    msmeNumber: { type: String },
    creditLimit: { type: Number, default: 0 },
    leadTimeDays: { type: Number, default: 7 },
    onboardingStatus: {
        type: String,
        enum: ['Draft', 'KYC Pending', 'UnderReview', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    portalAccessStatus: {
        type: String,
        enum: ['Not Invited', 'Invited', 'Active', 'Revoked'],
        default: 'Not Invited'
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
    currency: { type: String, default: 'INR' },
    accountsPayable: { type: String },
    openingBalance: { type: Number, default: 0 },
    paymentTerms: String,
    portalAccess: { type: Boolean, default: false },
    msmeRegistered: { type: Boolean, default: false },
    tds: { type: String, enum: ['yes', 'no'], default: 'no' },
    bankDetails: {
        accountHolderName: String,
        bankName: String,
        accountNumber: String,
        ifscCode: String,
    },
    customFields: { type: [CustomFieldSchema], default: [] },
    remarks: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    payables: { type: Number, default: 0 },
    unusedCredits: { type: Number, default: 0 },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });
const VendorModel = mongoose_1.default.models.BooksVendor || mongoose_1.default.model('BooksVendor', VendorSchema);
if (!mongoose_1.default.models.Vendor) {
    try {
        mongoose_1.default.model('Vendor', VendorSchema, 'booksvendors');
    }
    catch (e) { }
}
exports.default = VendorModel;
