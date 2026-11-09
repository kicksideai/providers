<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->

# Source text indexing

PostgreSQL rejects source documents whose generated full-text vector exceeds its size limit. The same constraint rejects the failure document, so an upload can complete without leaving a visible knowledge-base document.

The forward migration indexes source content through its existing bounded chunk and summary nodes. Source document bodies remain intact. No upload callback, ingestion contract, endpoint, or UI changes.

## Compatibility

- The migration rebuilds the derived PostgreSQL search vector and its existing GIN index in one transaction. Source text, node identifiers, metadata, timestamps, edges, and embeddings remain unchanged. PostgreSQL holds a table lock while rebuilding the derived column and index; the work scales with retained node data.
- Engine retrieval already searches chunk, summary, and concept nodes. Those indexed values and query paths remain unchanged. Source document nodes no longer duplicate their full body in the PostgreSQL lexical index.
- SQLite behavior remains unchanged. The migration applies automatically on existing installations and needs no installation-specific procedure.
- The index migration does not reconstruct document rows lost before the update; their retained uploads and source events remain unchanged.

## Load

The change adds no rows or retention workload. Knowledge nodes hold user-retained content, so they have no rate-independent bounded steady state. If the base retained volume has N nodes, 10x and 100x retained volumes have 10N and 100N nodes under the same lifecycle, with zero extra rows introduced by this migration. PostgreSQL source bodies no longer create duplicate lexical vectors.
