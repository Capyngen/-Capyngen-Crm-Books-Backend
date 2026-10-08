import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role';

export const requirePermission = (permissionKey: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const orgId = (req as any).org?._id;
            if (!user || !orgId) return res.status(401).json({ success: false, message: 'Unauthorized access' });
            
            // Bypass for Owner / Admin roles implicitly
            if (user.role === 'Owner' || user.role === 'Admin') return next();

            const userRole = await Role.findOne({ orgId, name: user.role }).lean();
            if (!userRole || !userRole.permissions.includes(permissionKey)) {
                return res.status(403).json({ success: false, message: `Forbidden: Requires ${permissionKey}` });
            }
            next();
        } catch (e: any) {
            res.status(500).json({ success: false, message: 'RBAC verification failed' });
        }
    };
};
