const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRows: number;
  totalPage: number;
  totalPages: number;
}

function positiveInteger(value: any, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPagination(query: any = {}, options: PaginationOptions = {}): Pagination {
  const defaultLimit = positiveInteger(options.defaultLimit, DEFAULT_LIMIT);
  const maxLimit = positiveInteger(options.maxLimit, MAX_LIMIT);
  const page = positiveInteger(query.page, DEFAULT_PAGE);
  const requestedLimit = positiveInteger(query.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPaginationMeta(totalRows: any, pagination: Pagination): PaginationMeta {
  const safeTotal = Math.max(0, Number(totalRows) || 0);
  const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / pagination.limit);

  return {
    page: pagination.page,
    limit: pagination.limit,
    totalRows: safeTotal,
    totalPage: totalPages,
    totalPages,
  };
}

export function paginatedData(collectionName: string, rows: any[], totalRows: any, pagination: Pagination) {
  return {
    [collectionName]: rows,
    meta: buildPaginationMeta(totalRows, pagination),
  };
}
