import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPagination,
  buildPaginationMeta,
  paginatedData,
} from '../src/utils/pagination';

test('pagination normalizes invalid input and caps the page size', () => {
  assert.deepEqual(getPagination({ page: '-2', limit: '1000' }), {
    page: 1,
    limit: 100,
    offset: 0,
  });
  assert.deepEqual(getPagination({ page: '3', limit: '25' }), {
    page: 3,
    limit: 25,
    offset: 50,
  });
});

test('pagination meta matches the shared response contract', () => {
  return assert.deepEqual(buildPaginationMeta(51, {
    page: 2, limit: 25,
    offset: 0
  }), {
    page: 2,
    limit: 25,
    totalRows: 51,
    totalPage: 3,
    totalPages: 3,
  });
});

test('paginated data nests the named collection and meta', () => {
  return assert.deepEqual(
    paginatedData('properties', [{ id: 'one' }], 1, {
      page: 1, limit: 20,
      offset: 0
    }),
    {
      properties: [{ id: 'one' }],
      meta: {
        page: 1,
        limit: 20,
        totalRows: 1,
        totalPage: 1,
        totalPages: 1,
      },
    }
  );
});
