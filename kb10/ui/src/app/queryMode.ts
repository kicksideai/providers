export type QueryConfig = Record<string, unknown>

function model(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// Query analysis has its own explicit model; summaries do not select it.
export function analysisModel(config: QueryConfig): string {
  return model(config.analysis_model)
}

export function canGenerateAnswer(config: QueryConfig): boolean {
  return analysisModel(config) !== ''
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
