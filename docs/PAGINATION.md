# Pagination contract

Collection endpoints accept:

- `page`: positive integer, default `1`
- `limit`: positive integer, default `20`, maximum `100`

The response places the named collection and pagination metadata inside `data`:

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": {
    "properties": [],
    "meta": {
      "page": 1,
      "limit": 20,
      "totalRows": 0,
      "totalPage": 0,
      "totalPages": 0
    }
  }
}
```

`totalPage` is retained for compatibility with the supplied reference response.
New clients should prefer `totalPages`.

Singleton resources, aggregate statistics, location dictionaries, mutation
responses, and ID-only helper endpoints are intentionally not paginated.
