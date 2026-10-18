import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UserOrganization } from '../models/UserOrganization';
import { Role } from '../models/Role';
import { requestContext } from '../../../context';

// Helper to get all child user IDs in the hierarchy
async function getChildUserIds(orgId: string, roleId: string): Promise<string[]> {
  // 1. Find all descendant roles of this roleId
  const allRoles = await Role.find({ orgId }).lean();
  
  const descendantRoleIds = new Set<string>();
  const queue = [roleId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = allRoles.filter(r => r.parentRoleId?.toString() === current);
    for (const child of children) {
      const cId = child._id.toString();
      if (!descendantRoleIds.has(cId)) {
        descendantRoleIds.add(cId);
        queue.push(cId);
      }
    }
  }

  if (descendantRoleIds.size === 0) return [];

  // 2. Find all users assigned to these descendant roles
  const users = await UserOrganization.find({ 
    orgId, 
    roleId: { $in: Array.from(descendantRoleIds) },
    status: 'Active'
  }).lean();

  return users.map(u => u.userId?.toString()).filter(Boolean) as string[];
}

export const loadRbacContext = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.headers['x-user-id'] as string) || (req as any).user?._id;
  const orgId = (req.headers['x-org-id'] as string) || (req as any).org?._id;

  if (!userId || !orgId) {
    return requestContext.run({ userId, orgId }, next);
  }

  try {
    const userEmail = (req as any).user?.email;
    const query: any = { orgId };
    if (userId && mongoose.isValidObjectId(userId)) {
      query.$or = [{ userId: new mongoose.Types.ObjectId(userId) }, { userId: userId }];
      if (userEmail) query.$or.push({ email: userEmail.toLowerCase() });
    } else if (userEmail) {
      query.email = userEmail.toLowerCase();
    } else {
      query.userId = userId;
    }

    const mapping = await UserOrganization.findOne(query).populate('roleId').lean();

    const isSystemAdmin = (req as any).user?.role === 'Admin' || (req as any).user?.role === 'Owner';
    const isAdmin = mapping ? (mapping.isAdmin === true || isSystemAdmin) : isSystemAdmin;
    let permissions = {};
    let childUserIds: string[] = [];
    let roleIdStr = mapping?.roleId ? (mapping.roleId as any)._id?.toString() : undefined;

    if (!isAdmin && mapping?.roleId) {
      permissions = (mapping.roleId as any).permissions || {};
      if (roleIdStr) {
        childUserIds = await getChildUserIds(orgId, roleIdStr);
      }
    }

    requestContext.run({
      userId,
      orgId,
      roleId: roleIdStr,
      isAdmin,
      permissions,
      childUserIds
    }, next);

  } catch (error) {
    console.error('Error loading RBAC context:', error);
    next(error);
  }
};
