<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, ConnectionSaved, DiscoveredAccount } from '../types.ts'

const IMPL_ID = 'kickside.simplefin.connection:simplefin_connection'
const BRIDGE_URL = 'https://bridge.simplefin.org'

const props = useProps<ComponentProps>()
const emit = useEvents<{ 'connection-saved': ConnectionSaved }>()

const name = ref('SimpleFIN')
const token = ref('')
const showToken = ref(false)
const busy = ref(false)
const error = ref('')
const accounts = ref<DiscoveredAccount[] | null>(null)
// The host closes the dialog on connection-saved, so the event waits for Done:
// the discovered accounts stay on screen until the user has seen them.
const savedId = ref('')

function done() {
  emit('connection-saved', { success: true, component_id: savedId.value })
}

// useProps normalizes attribute names to camel case.
const existingId = computed(() => {
  return String(props.value.componentId ?? '')
})
const isRotation = computed(() => existingId.value !== '')
const submitLabel = computed(() => {
  if (busy.value) return isRotation.value ? 'Claiming new token…' : 'Claiming token…'
  return isRotation.value ? 'Claim and replace credential' : 'Claim and connect'
})

function apiError(e: unknown): string {
  const r = (e as { response?: { data?: { error?: string } } })?.response
  if (r?.data?.error) return r.data.error
  return e instanceof Error ? e.message : String(e)
}

function validation(): string {
  if (!token.value.trim()) return 'Paste the setup token from SimpleFIN Bridge.'
  return ''
}

async function discover(componentId: string) {
  const { data } = await api.post(`/api/v1/connections/${encodeURIComponent(componentId)}/discover_resources`, {})
  if (!data?.success) throw new Error(data?.error || 'The connection was created but its accounts could not be listed.')
  accounts.value = Array.isArray(data.resources) ? data.resources : []
}

async function create(): Promise<string> {
  const { data } = await api.post('/api/v1/connections', {
    impl_id: IMPL_ID,
    name: name.value.trim() || 'SimpleFIN',
    private_context: { setup_token: token.value.trim() },
    validate: true,
  })
  if (!data?.success) throw new Error(data?.error || 'SimpleFIN did not accept the setup token.')
  return String(data.component_id)
}

async function rotate(): Promise<string> {
  const { data } = await api.put(`/api/v1/simplefin/connections/${encodeURIComponent(existingId.value)}`, {
    setup_token: token.value.trim(),
    name: name.value.trim() || undefined,
  })
  if (!data?.success) throw new Error(data?.error || 'SimpleFIN did not accept the new setup token.')
  return String(data.component_id || existingId.value)
}

async function save() {
  error.value = validation()
  accounts.value = null
  savedId.value = ''
  if (error.value) return
  busy.value = true
  try {
    const componentId = isRotation.value ? await rotate() : await create()
    savedId.value = componentId
    await discover(componentId)
    token.value = ''
  } catch (e) {
    error.value = apiError(e)
    emit('connection-saved', { success: false, error: error.value })
  } finally {
    busy.value = false
  }
}

function accountLabel(a: DiscoveredAccount): string {
  return a.metadata?.account_name || a.name
}
function accountOrg(a: DiscoveredAccount): string {
  return a.metadata?.org?.name || a.metadata?.org?.domain || ''
}
function accountBalance(a: DiscoveredAccount): string {
  const m = a.metadata
  if (!m?.balance) return a.description || ''
  const n = Number(m.balance)
  const amount = Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : m.balance
  return `${amount} ${m.currency || ''}`.trim()
}
</script>

<template>
  <form class="sf" aria-label="SimpleFIN connection" @submit.prevent="save">
    <div class="sf-intro">
      <div class="sf-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6"></path><path d="M5 10v8"></path><path d="M10 10v8"></path><path d="M14 10v8"></path><path d="M19 10v8"></path><path d="M3 20h18"></path></svg>
      </div>
      <div class="sf-intro-text">
        <strong>{{ isRotation ? 'Replace the SimpleFIN credential' : 'Connect your bank feed through SimpleFIN' }}</strong>
        <small>SimpleFIN Bridge links your banks once and hands out a one-time setup token. The token is claimed on the server and never stored; only the access it unlocks is kept, privately, on this connection.</small>
      </div>
    </div>

    <ol v-if="!savedId" class="sf-steps">
      <li>Sign in at <a :href="BRIDGE_URL" target="_blank" rel="noopener">bridge.simplefin.org</a> and link your institutions.</li>
      <li>Under My Account, Apps, create a new app and copy the setup token it shows once.</li>
      <li>Paste it below. Claiming takes a moment; then your accounts appear here.</li>
    </ol>

    <label v-if="!isRotation && !savedId" class="sf-field">
      <span>Connection name</span>
      <input v-model="name" class="sf-input" autocomplete="off" placeholder="SimpleFIN" />
    </label>

    <label v-if="!savedId" class="sf-field">
      <span>Setup token <em>Required</em></span>
      <span class="sf-secret">
        <input
          v-model="token"
          class="sf-input"
          :type="showToken ? 'text' : 'password'"
          autocomplete="off"
          spellcheck="false"
          placeholder="aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0v…"
          @input="error = ''"
        />
        <button type="button" class="sf-reveal" :aria-label="showToken ? 'Hide token' : 'Show token'" @click="showToken = !showToken">{{ showToken ? 'Hide' : 'Show' }}</button>
      </span>
      <small>A setup token works exactly once. If it was already used, create a new one at the bridge.</small>
    </label>

    <p v-if="!savedId" class="sf-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
      <span>Read-only. SimpleFIN cannot move money, and the credential stays in this connection's private context, never in agent prompts.</span>
    </p>

    <div v-if="error" class="sf-feedback error" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
      <div><strong>Could not connect</strong><small>{{ error }}</small></div>
    </div>

    <div v-if="accounts" class="sf-feedback success" role="status">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>
      <div style="flex: 1; min-width: 0;">
        <strong>{{ isRotation ? 'Credential replaced' : 'Connected' }}</strong>
        <small>{{ accounts.length === 0 ? 'The bridge shares no accounts yet. Link an institution at bridge.simplefin.org and adjust which accounts it shares.' : `${accounts.length} account${accounts.length === 1 ? '' : 's'} shared by the bridge. Sources and the SimpleFIN Reader trait can use this connection now.` }}</small>
        <ul v-if="accounts.length" class="sf-accounts">
          <li v-for="a in accounts" :key="a.id" class="sf-account">
            <div class="sf-account-name"><span>{{ accountLabel(a) }}</span><small>{{ accountOrg(a) }}</small></div>
            <span class="sf-account-balance">{{ accountBalance(a) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <button v-if="savedId" class="sf-submit" type="button" @click="done">Done</button>
    <button v-else class="sf-submit" type="submit" :disabled="busy">
      <span v-if="busy" class="sf-spinner" aria-hidden="true"></span>
      {{ submitLabel }}
    </button>
  </form>
</template>
