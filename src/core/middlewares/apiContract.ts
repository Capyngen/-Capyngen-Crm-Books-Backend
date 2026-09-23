import { Request, Response, NextFunction } from 'express';
import { getPagination, paginationMeta } from '../http/apiResponse';

export const apiContract = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);

  res.json = ((body: any) => {
    const isSuccess = body?.success !== false;
    const message = body?.message || (isSuccess ? 'Request successful' : 'Request failed');
    let data = body?.data;
    let meta = body?.meta;

    if (Array.isArray(body)) {
      data = body;
    } else if (data === undefined && body && typeof body === 'object' && isSuccess) {
      const { success: _success, message: _message, ...rest } = body;
      data = rest;
    } else if (data === undefined) {
      data = null;
    }

    if (Array.isArray(data)) {
      const totalCount = data.length;
      data = data.slice(skip, skip + limit);
      meta = { ...meta, ...paginationMeta(page, limit, totalCount) };
    }

    return originalJson({
      success: isSuccess,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }) as Response['json'];

  next();
};
