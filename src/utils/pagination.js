const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getPagination(query = {}, options = {}) {
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

function buildPaginationMeta(totalRows, pagination) {
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

function paginatedData(collectionName, rows, totalRows, pagination) {
  return {
    [collectionName]: rows,
    meta: buildPaginationMeta(totalRows, pagination),
  };
}

module.exports = {
  getPagination,
  buildPaginationMeta,
  paginatedData,
};
