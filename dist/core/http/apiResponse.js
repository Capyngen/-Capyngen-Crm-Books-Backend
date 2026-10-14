"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.paginationMeta = exports.getPagination = exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = void 0;
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 25;
exports.MAX_LIMIT = 100;
const getPagination = (query) => {
    const parsedPage = Number(query.page);
    const parsedLimit = Number(query.limit);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : exports.DEFAULT_PAGE;
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, exports.MAX_LIMIT)
        : exports.DEFAULT_LIMIT;
    return { page, limit, skip: (page - 1) * limit };
};
exports.getPagination = getPagination;
const paginationMeta = (page, limit, totalCount) => ({
    page,
    limit,
    totalCount,
    totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
});
exports.paginationMeta = paginationMeta;
const sendSuccess = (res, status, data, message = 'Request successful', meta) => res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
exports.sendSuccess = sendSuccess;
const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null });
exports.sendError = sendError;
