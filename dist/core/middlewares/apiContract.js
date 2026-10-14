"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiContract = void 0;
const apiResponse_1 = require("../http/apiResponse");
const apiContract = (req, res, next) => {
    const originalJson = res.json.bind(res);
    const { page, limit, skip } = (0, apiResponse_1.getPagination)(req.query);
    res.json = ((body) => {
        const isSuccess = body?.success !== false;
        const message = body?.message || (isSuccess ? 'Request successful' : 'Request failed');
        let data = body?.data;
        let meta = body?.meta;
        if (Array.isArray(body)) {
            data = body;
        }
        else if (data === undefined && body && typeof body === 'object' && isSuccess) {
            const { success: _success, message: _message, ...rest } = body;
            data = rest;
        }
        else if (data === undefined) {
            data = null;
        }
        if (Array.isArray(data)) {
            const totalCount = data.length;
            data = data.slice(skip, skip + limit);
            meta = { ...meta, ...(0, apiResponse_1.paginationMeta)(page, limit, totalCount) };
        }
        return originalJson({
            success: isSuccess,
            message,
            data,
            ...(meta ? { meta } : {}),
        });
    });
    next();
};
exports.apiContract = apiContract;
