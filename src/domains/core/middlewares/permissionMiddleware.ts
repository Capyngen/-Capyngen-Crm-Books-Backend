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
    
    // Assume we are checking 'books' app for now, fallback to root if not nested
    const appPerms = permissions['books'] || permissions;
    const modulePerms = appPerms[module];

    if (modulePerms) {
      if (modulePerms === true || modulePerms.full === true || modulePerms[action] === true) {
        return next();
      }
      if (typeof modulePerms[action] === 'object') {
        const actObj = modulePerms[action];
        if (actObj.view === true || actObj.create === true || actObj.edit === true || actObj.full === true) {
          return next();
        }
      }
    }

    return res.status(403).json({ success: false, message: `Forbidden: Missing ${module}.${action} permission` });

    next();
  };
};
