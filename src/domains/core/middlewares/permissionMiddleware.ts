import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';

export const requirePermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = requestContext.getStore();
    console.log("Permission Check ctx:", ctx);
    
    // If no context, or no user/org, deny
    if (!ctx || !ctx.userId || !ctx.orgId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing Auth Headers' });
    }

    // Admin bypasses all checks
    if (ctx.isAdmin) {
      return next();
    }

    // Check specific permission
    const permissions = ctx.permissions || {};
    
    // permissions structure example:
    // { "sales.invoices": { "view": true, "create": true } }
    
    // Assume we are checking 'books' app for now, fallback to root if not nested
    const appPerms = permissions['books'] || permissions;
    const modulePerms = appPerms[module];
    if (!modulePerms || modulePerms[action] !== true) {
      // Check if they have 'full' access to the module
      if (modulePerms && modulePerms['full'] === true) {
        return next();
      }
      return res.status(403).json({ success: false, message: `Forbidden: Missing ${module}.${action} permission` });
    }

    next();
  };
};
