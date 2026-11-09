# Source text indexing

PostgreSQL rejects source documents whose generated full-text vector exceeds its size limit. The same constraint rejects the failure document, so an upload can complete without leaving a visible knowledge-base document.

The forward migration indexes source content through its existing bounded chunk and summary nodes. Source document bodies remain intact. No upload callback, ingestion contract, endpoint, or UI changes.

## Compatibility

- The migration rebuilds the derived PostgreSQL search vector and its existing GIN index in one transaction. Source text, node identifiers, metadata, timestamps, edges, and embeddings remain unchanged.
- Engine retrieval already searches chunk, summary, and concept nodes. Those indexed values and query paths remain unchanged. Source document nodes no longer duplicate their full body in the PostgreSQL lexical index.
- SQLite behavior remains unchanged. The migration applies automatically on existing installations and needs no installation-specific procedure.
- The index migration does not reconstruct document rows lost before the update; their retained uploads and source events remain unchanged.

## Load

The change adds no rows or retention workload. At 10x and 100x load, source, chunk, summary, and embedding row counts follow the existing ingestion model with no additional table or row amplification. PostgreSQL source bodies no longer create duplicate lexical vectors.
