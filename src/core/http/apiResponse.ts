import { Response } from 'express';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export const getPagination = (query: Record<string, unknown>) => {
  const parsedPage = Number(query.page);
  const parsedLimit = Number(query.limit);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, MAX_LIMIT)
    : DEFAULT_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
};

export const paginationMeta = (page: number, limit: number, totalCount: number) => ({
  page,
  limit,
  totalCount,
  totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
});

export const sendSuccess = (
  res: Response,
  status: number,
  data: unknown,
  message = 'Request successful',
  meta?: Record<string, unknown>,
) => res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });

export const sendError = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, message, data: null });
