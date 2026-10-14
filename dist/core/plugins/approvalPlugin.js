"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalPlugin = approvalPlugin;
const requestContext_1 = require("../middlewares/requestContext");
const mongoose_1 = __importDefault(require("mongoose"));
function approvalPlugin(schema, options) {
    schema.pre('save', async function () {
        try {
            if (!this.isNew)
                return;
            const org = (0, requestContext_1.getContextValue)('org');
            const user = (0, requestContext_1.getContextValue)('user');
            if (!org || !user)
                return;
            const moduleName = this.constructor.modelName;
            const ApprovalRule = mongoose_1.default.models.ApprovalRule;
            if (!ApprovalRule)
                return;
            // Check if any rule targets this module
            const rules = await ApprovalRule.find({ orgId: org._id, module: moduleName, isActive: true });
            if (rules.length > 0) {
                // If a 'status' field exists on this entity, force it to Pending_Approval
                if (this.status !== undefined) {
                    this.status = 'Pending_Approval'; // or your domain-specific pending status
                }
                this._needsApprovalRequest = true;
            }
        }
        catch (e) {
            console.error('Approval Intercept Error:', e);
        }
    });
    schema.post('save', async function (doc, next) {
        if (this._needsApprovalRequest) {
            try {
                const org = (0, requestContext_1.getContextValue)('org');
                const user = (0, requestContext_1.getContextValue)('user');
                const ApprovalRequest = mongoose_1.default.models.ApprovalRequest;
                if (ApprovalRequest && org && user) {
                    await ApprovalRequest.create({
                        orgId: org._id,
                        module: doc.constructor.modelName,
                        entityId: doc._id,
                        status: 'Pending',
                        requestedBy: user._id
                    });
                }
            }
            catch (e) {
                console.error('Approval Request Creation Error:', e);
            }
        }
        next();
    });
}
