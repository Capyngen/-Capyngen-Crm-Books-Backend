import { Request } from 'express';
import mongoose from 'mongoose';
import { requestContext } from '../../context';

/**
 * Universal Tenant Filter Helper
 * Safely resolves tenant ID across Request object, user context, and headers,
 * and builds a comprehensive $or filter matching both String and ObjectId BSON types
 * across companyId, orgId, and tenantId.
 */
export const buildTenantFilter = (reqOrOrgId?: Request | string | any): Record<string, any> => {
  let orgId: any = null;

  if (typeof reqOrOrgId === 'string') {
    orgId = reqOrOrgId;
  } else if (reqOrOrgId && typeof reqOrOrgId === 'object') {
    orgId =
      (reqOrOrgId as any).org?._id ||
      (reqOrOrgId as any).user?.companyId ||
      (reqOrOrgId as any).user?.orgId ||
      (reqOrOrgId as any).headers?.['x-org-id'] ||
      (reqOrOrgId as any).headers?.['x-organization-id'] ||
      (reqOrOrgId as any).headers?.['x-company-id'] ||
      (reqOrOrgId as any).body?.companyId ||
      (reqOrOrgId as any).body?.orgId ||
      (reqOrOrgId as any).query?.companyId ||
      (reqOrOrgId as any).query?.orgId;
  }

  if (!orgId) {
    // Fallback to async requestContext if available
    try {
      const store = requestContext.getStore();
      if (store?.orgId) {
        orgId = store.orgId;
      }
    } catch (e) {}
  }

  if (!orgId) return {};

  const orgIdStr = orgId.toString().trim();
  if (!orgIdStr || orgIdStr === 'default-org') return {};

  const isValidObjectId = mongoose.Types.ObjectId.isValid(orgIdStr);
  const orgIdObj = isValidObjectId ? new mongoose.Types.ObjectId(orgIdStr) : null;

  const conditions: any[] = [
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

export default buildTenantFilter;
