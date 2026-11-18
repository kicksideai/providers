export type QueryConfig = Record<string, unknown>

function model(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function applyQueryModel(config: QueryConfig, value: unknown): void {
  const selected = model(value)
  if (selected) {
    config.retrieval_model = selected
    config.analysis_model = selected
    return
  }
  delete config.retrieval_model
  // The query choice does not change document summary generation.
  config.analysis_model = false
}
