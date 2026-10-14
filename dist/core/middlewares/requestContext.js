"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextValue = exports.setContextValue = exports.requestContextMiddleware = exports.requestContext = void 0;
const async_hooks_1 = require("async_hooks");
exports.requestContext = new async_hooks_1.AsyncLocalStorage();
const requestContextMiddleware = (req, res, next) => {
    exports.requestContext.run(new Map(), () => {
        next();
    });
};
exports.requestContextMiddleware = requestContextMiddleware;
const setContextValue = (key, value) => {
    const store = exports.requestContext.getStore();
    if (store)
        store.set(key, value);
};
exports.setContextValue = setContextValue;
const getContextValue = (key) => {
    const store = exports.requestContext.getStore();
    return store ? store.get(key) : undefined;
};
exports.getContextValue = getContextValue;
