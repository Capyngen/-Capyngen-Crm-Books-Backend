import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export const requestContext = new AsyncLocalStorage<Map<string, any>>();

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    requestContext.run(new Map<string, any>(), () => {
        next();
    });
};

export const setContextValue = (key: string, value: any) => {
    const store = requestContext.getStore();
    if (store) store.set(key, value);
};

export const getContextValue = (key: string) => {
    const store = requestContext.getStore();
    return store ? store.get(key) : undefined;
};
