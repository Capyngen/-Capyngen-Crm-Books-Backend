import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{ 
  userId?: string; 
  orgId?: string;
  roleId?: string;
  isAdmin?: boolean;
  permissions?: Record<string, any>;
  childUserIds?: string[];
}>();
