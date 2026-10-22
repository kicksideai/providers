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

Each hit carries `id` and `similarity`; fused hits also carry
`vector_similarity`, `vector_rank`, `lexical_rank` and `hybrid_score`.
