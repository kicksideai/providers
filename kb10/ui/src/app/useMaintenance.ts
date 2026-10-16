import { ref, computed, watch, onUnmounted } from 'vue'
import { api, host } from '@wippy-fe/proxy'

// The two whole-knowledge-base maintenance actions kb10 exposes — regenerate the
// stored document summaries, re-embed the stored vectors — and the run record
// they report through.
//
// Neither action runs in its request: it starts a job and the caller polls
// GET /kb10/{id}/maintenance for the run's progress and outcome. The server's run
// record is the only source of truth about what is in flight, so a surface that
// mounts in the middle of a run finds it still running.

export type MaintenanceRunType = 'resummarize' | 'reembed'

export interface MaintenanceRun {
  id: string
  run_type: string
  status: string
  in_flight: boolean
  stale: boolean
  total: number
  scanned: number
  resummarized: number
  chunks_reenriched: number
  chunks_failed: number
  documents_skipped: number
  embedded: number
  last_error: string | null
}

export interface RunStatusLine {
  text: string
  tone: '' | 'ok' | 'err'
}

const POLL_MS = 3000
// A status surface that is answering with errors is asked less often, up to this
// ceiling; the loop never stops asking, because only the server knows whether the
// runs it last saw are still going.
const POLL_MAX_MS = 30000

const UNITS: Record<MaintenanceRunType, string> = { resummarize: 'documents', reembed: 'nodes' }

function errorText(e: any, fallback: string): string {
  return e?.response?.data?.error || e?.message || fallback
}
function reportError(e: any) {
  host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
}

export function useMaintenance(kbId: () => string) {
  const runs = ref<Record<MaintenanceRunType, MaintenanceRun | null>>({ resummarize: null, reembed: null })
  const starting = ref<Record<MaintenanceRunType, boolean>>({ resummarize: false, reembed: false })
  const startError = ref<Record<MaintenanceRunType, string>>({ resummarize: '', reembed: '' })
  const statusError = ref('')

  function running(runType: MaintenanceRunType): boolean {
    return starting.value[runType] || runs.value[runType]?.in_flight === true
  }
  const anyBusy = computed(() => running('resummarize') || running('reembed'))

  // Every request belongs to a generation: the surface it was started from,
  // showing the knowledge base it was started for. A response that arrives after
  // that surface is gone, or after it switched knowledge bases, belongs to no one
  // and is dropped rather than written over what is on screen.
  let disposed = false
  let generation = 0
  let pollTimer: ReturnType<typeof setTimeout> | null = null

  function current(gen: number): boolean {
    return !disposed && gen === generation
  }

  function cancelPoll() {
    if (pollTimer !== null) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function schedule(gen: number, delay: number) {
    cancelPoll()
    if (!current(gen)) return
    pollTimer = setTimeout(() => { void poll(gen, delay) }, delay)
  }

  // One status read, then another scheduled while something is still in flight. A
  // read that fails leaves the surface unable to say what the runs are doing, so
  // it reports that and keeps asking at a widening interval — the surface never
  // settles into a spinner it has stopped checking.
  async function poll(gen: number, delay: number = POLL_MS) {
    cancelPoll()
    const id = kbId()
    if (!id || !current(gen)) return
    try {
      const { data } = await api.get(`/api/v1/kb10/${id}/maintenance`)
      if (!current(gen)) return
      if (!data?.success) throw new Error(data?.error || 'could not read maintenance status')
      runs.value = {
        resummarize: (data.resummarize as MaintenanceRun | null) ?? null,
        reembed: (data.reembed as MaintenanceRun | null) ?? null,
      }
      statusError.value = ''
    } catch (e: any) {
      if (!current(gen)) return
      statusError.value = errorText(e, 'could not read maintenance status')
      reportError(e)
      schedule(gen, Math.min(delay * 2, POLL_MAX_MS))
      return
    }
    if (anyBusy.value) schedule(gen, POLL_MS)
  }

  // A knowledge base of its own carries its own runs: the previous KB's loop is
  // retired with its readings before the new one is asked.
  function reload() {
    const gen = ++generation
    cancelPoll()
    runs.value = { resummarize: null, reembed: null }
    startError.value = { resummarize: '', reembed: '' }
    statusError.value = ''
    if (!kbId()) return
    void poll(gen)
  }

  // Starting a run answers as soon as the job is minted; everything the run does
  // afterwards is read back from its record.
  async function start(runType: MaintenanceRunType) {
    const id = kbId()
    if (!id || anyBusy.value) return
    const gen = generation
    starting.value = { ...starting.value, [runType]: true }
    startError.value = { ...startError.value, [runType]: '' }
    try {
      const { data } = await api.post(`/api/v1/kb10/${id}/${runType}`)
      if (!current(gen)) return
      if (!data?.success) throw new Error(data?.error || 'could not start the run')
      if (data.run) runs.value = { ...runs.value, [runType]: data.run as MaintenanceRun }
    } catch (e: any) {
      if (!current(gen)) return
      startError.value = { ...startError.value, [runType]: errorText(e, 'could not start the run') }
      reportError(e)
      return
    } finally {
      if (current(gen)) starting.value = { ...starting.value, [runType]: false }
    }
    void poll(gen)
  }

  // What a run says about itself right now: how far along while it is in flight,
  // what it did once it settled, and the server's own words when it failed.
  function statusLine(runType: MaintenanceRunType): RunStatusLine {
    const failed = startError.value[runType]
    if (failed) return { text: failed, tone: 'err' }
    if (starting.value[runType]) return { text: 'Starting…', tone: '' }

    const run = runs.value[runType]
    if (!run) return { text: '', tone: '' }

    if (run.in_flight) {
      if (run.status === 'scheduled') return { text: 'Scheduled — the run starts shortly', tone: '' }
      if (run.total > 0) return { text: `${run.scanned} of ${run.total} ${UNITS[runType]}…`, tone: '' }
      return { text: 'Running…', tone: '' }
    }
    if (run.stale) return { text: 'This run stopped reporting — start it again.', tone: 'err' }
    if (run.status === 'failed') return { text: run.last_error || 'The run failed.', tone: 'err' }
    if (run.status === 'succeeded') {
      if (runType === 'reembed') {
        return { text: `${run.embedded} vectors re-embedded, ${run.scanned} scanned`, tone: 'ok' }
      }
      return {
        text: `${run.resummarized} summaries regenerated, ${run.chunks_reenriched} chunks re-situated, `
          + `${run.documents_skipped} documents skipped, ${run.chunks_failed} chunks failed`,
        tone: 'ok',
      }
    }
    return { text: '', tone: '' }
  }

  watch(kbId, reload, { immediate: true })
  // The timer is only half of the loop: an in-flight read resolves after the
  // surface is gone, so teardown retires the generation it belongs to as well.
  onUnmounted(() => {
    disposed = true
    cancelPoll()
  })

  return { runs, statusError, running, anyBusy, start, statusLine }
}
