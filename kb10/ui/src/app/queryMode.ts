import { resolveModel } from './modelSettings'

export type QueryConfig = Record<string, unknown>

// Query analysis has its own explicit model; summaries do not select it.
export function analysisModel(config: QueryConfig): string {
  return resolveModel(config.analysis_model)
}

export function canGenerateAnswer(config: QueryConfig): boolean {
  return analysisModel(config) !== ''
}
