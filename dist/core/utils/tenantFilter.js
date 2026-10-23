"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTenantFilter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const context_1 = require("../../context");
/**
 * Universal Tenant Filter Helper
 * Safely resolves tenant ID across Request object, user context, and headers,
 * and builds a comprehensive $or filter matching both String and ObjectId BSON types
 * across companyId, orgId, and tenantId.
 */
const buildTenantFilter = (reqOrOrgId) => {
    let orgId = null;
    if (typeof reqOrOrgId === 'string') {
        orgId = reqOrOrgId;
    }
    else if (reqOrOrgId && typeof reqOrOrgId === 'object') {
        orgId =
            reqOrOrgId.org?._id ||
                reqOrOrgId.user?.companyId ||
                reqOrOrgId.user?.orgId ||
                reqOrOrgId.headers?.['x-org-id'] ||
                reqOrOrgId.headers?.['x-organization-id'] ||
                reqOrOrgId.headers?.['x-company-id'] ||
                reqOrOrgId.body?.companyId ||
                reqOrOrgId.body?.orgId ||
                reqOrOrgId.query?.companyId ||
                reqOrOrgId.query?.orgId;
    }
    if (!orgId) {
        // Fallback to async requestContext if available
        try {
            const store = context_1.requestContext.getStore();
            if (store?.orgId) {
                orgId = store.orgId;
            }
        }
        catch (e) { }
    }
    if (!orgId)
        return {};
    const orgIdStr = orgId.toString().trim();
    if (!orgIdStr || orgIdStr === 'default-org')
        return {};
    const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(orgIdStr);
    const orgIdObj = isValidObjectId ? new mongoose_1.default.Types.ObjectId(orgIdStr) : null;
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
exports.buildTenantFilter = buildTenantFilter;
exports.default = exports.buildTenantFilter;
