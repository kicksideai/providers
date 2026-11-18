export type QueryConfig = Record<string, unknown>

export function applyQueryModel(config: QueryConfig, value: string | false): void {
  const selected = value === false ? '' : value.trim()
  if (selected) {
    config.retrieval_model = selected
    config.analysis_model = selected
    return
  }
  delete config.retrieval_model
  // The query choice does not change document summary generation.
  config.analysis_model = value === false ? false : ''
}
