# KickSide Search Index

`kickside.search_index:index` runs hybrid retrieval over tables that the
calling module owns. The library owns no schema and no connection: the caller
passes an open connection and a table spec.

## Table spec

- `vectors`: Vector table: a `vec0` virtual table on SQLite, a table with a `vector(512)` column on PostgreSQL.
- `vector_key`: Column in `vectors` that references the row id.
- `vector_column`: Vector column, default `embedding`.
- `rows`: Row table that holds the searchable content.
- `row_key`: Row id column.
- `partition`: Column present on both tables that scopes every search (a `vec0` partition key on SQLite).
- `columns`: Row columns returned with each hit.
- `fts` / `fts_key`: SQLite `fts5` table and its row-id column.
- `tsvector`: PostgreSQL `tsvector` column on `rows`.
- `json_columns`: Row columns decoded from JSON text.

## Functions

- `search(db, spec, vector, {partition, limit, filters, query_text})`: dense
  search without query text; with query text, reciprocal-rank fusion of
  lexical and dense candidates.
- `dense_search`, `lexical_search`, `lexical_query`, `fuse`: the parts of
  `search`.
- `filters` is a list of `{column, values, table = "rows" | "vectors"}`
  equality or `IN` constraints.
- `vector_literal`, `placeholders`, `insert_rows_tx`, `VECTOR_DIMENSIONS`.

`db` is a pooled connection, not a transaction: on PostgreSQL a dense search
runs in its own read transaction with `hnsw.iterative_scan = strict_order`, so
an HNSW index keeps scanning until the partition and filters admit `limit`
rows. This needs pgvector 0.8 or later.

Each hit carries `id` and `similarity`; fused hits also carry
`vector_similarity`, `vector_rank`, `lexical_rank` and `hybrid_score`.

`search` accepts optional `group_by`, naming a column in `spec.columns`.
Each dense and lexical ranking selects distinct non-null group values before
its candidate limit; fusion then ranks groups by their best member in each
ranking. Group results use the group value as `id`. Callers load authorized
members after paging these group results. Omitting `group_by` preserves row
search and its response shape.
