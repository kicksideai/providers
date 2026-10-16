<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { api } from '@wippy-fe/proxy'

// Atlassian connection setup. Two paths, one component (the picker mounts this as
// the provider's component.create.view): OAuth 3LO, or a stored credential (Cloud API
// token / Server PAT). Both end by signalling the host.
interface P { providerId?: string; componentId?: string }
interface E {
  'connection-saved': { success: boolean; error?: string }
  'oauth-result': { success: boolean; error?: string }
}

const props = useProps<P>()
const emit = useEvents<E>()

const CONN_IMPL = 'kickside.atlassian.connection:atlassian_connection'
const OAUTH_SCOPES = [
  'read:me', 'offline_access',
  'read:jira-work', 'write:jira-work', 'read:jira-user',
  'read:confluence-content.all', 'write:confluence-content',
]

const mode = ref<'oauth' | 'credential'>('oauth')
const busy = ref(false)
const error = ref('')
const pendingAuthUrl = ref('')
let popup: Window | null = null
let oauthTimer: ReturnType<typeof setInterval> | null = null
let expectedCallbackOrigin = ''
let expectedStateToken = ''
let messageListenerAttached = false
let oauthGeneration = 0
let unmounted = false

const name = ref('')
const siteUrl = ref('')
const deployment = ref<'cloud' | 'server'>('cloud')
const email = ref('')
const apiToken = ref('')
const pat = ref('')

const reauth = computed(() => props.value.componentId || '')
const connName = computed(() => name.value.trim() || 'Atlassian')

function fail(msg: string) {
  error.value = msg
  busy.value = false
}

// ─── OAuth ────────────────────────────────────────────────────────────────
function closePopup(target: Window | null) {
  if (!target) return
  try { target.close() } catch { /* cross-origin popup may reject access */ }
}

function cleanupPopup(close = false) {
  if (oauthTimer) { clearInterval(oauthTimer); oauthTimer = null }
  if (messageListenerAttached) {
    window.removeEventListener('message', onMessage)
    messageListenerAttached = false
  }
  if (close) closePopup(popup)
  popup = null
}

function resetOAuthAttempt(close = true) {
  oauthGeneration += 1
  cleanupPopup(close)
  expectedCallbackOrigin = ''
  expectedStateToken = ''
  pendingAuthUrl.value = ''
}

function callbackOrigin(redirectUri: unknown): string {
  if (typeof redirectUri !== 'string' || !redirectUri) return ''
  try {
    const url = new URL(redirectUri, window.location.href)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : ''
  } catch {
    return ''
  }
}

function onMessage(event: MessageEvent) {
  const data = event.data as { type?: string; success?: boolean; error?: string; state_token?: string }
  if (!data || data.type !== 'oauth_result') return
  if (!popup || event.source !== popup) return
  if (!expectedCallbackOrigin || event.origin !== expectedCallbackOrigin) return
  if (!expectedStateToken || data.state_token !== expectedStateToken) return

  cleanupPopup(true)
  expectedCallbackOrigin = ''
  expectedStateToken = ''
  pendingAuthUrl.value = ''
  busy.value = false
  if (data.success) {
    error.value = ''
    emit('oauth-result', { success: true })
  } else {
    const message = data.error || 'Atlassian authorization failed'
    error.value = message
    emit('oauth-result', { success: false, error: message })
  }
}

function monitorPopup() {
  if (!messageListenerAttached) {
    window.addEventListener('message', onMessage)
    messageListenerAttached = true
  }
  oauthTimer = setInterval(() => {
    let closed = false
    try { closed = !popup || popup.closed } catch { closed = false }
    if (!closed) return
    cleanupPopup()
    expectedCallbackOrigin = ''
    expectedStateToken = ''
    pendingAuthUrl.value = ''
    busy.value = false
    const message = 'Atlassian authorization was cancelled before completion'
    error.value = message
    emit('oauth-result', { success: false, error: message })
  }, 600)
}

async function connectOAuth() {
  resetOAuthAttempt()
  const generation = oauthGeneration
  error.value = ''
  busy.value = true
  popup = window.open('about:blank', 'oauth_atlassian', 'width=520,height=680,menubar=no,toolbar=no,location=no,status=no')
  try {
    const body: Record<string, unknown> = { name: connName.value, scopes: OAUTH_SCOPES }
    if (reauth.value) body.component_id = reauth.value
    const { data } = await api.post('/api/v1/oauth/providers/atlassian/init', body)
    if (unmounted || generation !== oauthGeneration) return
    if (!data?.success || !data.authorization_url) {
      resetOAuthAttempt()
      return fail(data?.error || 'Could not start Atlassian sign-in')
    }

    const origin = callbackOrigin(data.redirect_uri)
    const stateToken = typeof data.state_token === 'string' ? data.state_token : ''
    if (!origin || !stateToken) {
      resetOAuthAttempt()
      return fail('OAuth response did not include a valid callback identity')
    }
    expectedCallbackOrigin = origin
    expectedStateToken = stateToken

    if (popup && !popup.closed) {
      monitorPopup()
      popup.location.href = data.authorization_url
    } else {
      popup = null
      pendingAuthUrl.value = data.authorization_url
      busy.value = false
    }
  } catch (e) {
    if (unmounted || generation !== oauthGeneration) return
    resetOAuthAttempt()
    fail(e instanceof Error ? e.message : String(e))
  }
}

function openBlockedPopup() {
  if (!pendingAuthUrl.value || !expectedCallbackOrigin || !expectedStateToken) return
  busy.value = true
  const nextPopup = window.open(
    pendingAuthUrl.value,
    'oauth_atlassian',
    'width=520,height=680,menubar=no,toolbar=no,location=no,status=no',
  )
  if (!nextPopup || nextPopup.closed) {
    closePopup(nextPopup)
    busy.value = false
    return fail('Popup blocked — allow popups and retry')
  }
  cleanupPopup(true)
  popup = nextPopup
  pendingAuthUrl.value = ''
  monitorPopup()
}

onUnmounted(() => {
  unmounted = true
  resetOAuthAttempt()
  busy.value = false
})

// ─── Stored credential ──────────────────────────────────────────────────────
async function saveCredential() {
  error.value = ''
  if (!siteUrl.value.trim()) return fail('Site URL is required')
  const priv: Record<string, unknown> = { site_url: siteUrl.value.trim(), deployment: deployment.value }
  if (deployment.value === 'server') {
    if (!pat.value.trim()) return fail('Personal access token is required')
    priv.personal_access_token = pat.value.trim()
  } else {
    if (!email.value.trim() || !apiToken.value.trim()) return fail('Email and API token are required')
    priv.email = email.value.trim()
    priv.api_token = apiToken.value.trim()
  }

  busy.value = true
  try {
    const { data } = await api.post('/api/v1/connections', {
      impl_id: CONN_IMPL,
      name: connName.value,
      private_context: priv,
    })
    if (!data || data.success === false) return fail(data?.error || 'Could not save connection')
    busy.value = false
    emit('connection-saved', { success: true })
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
}
</script>

<template>
  <div class="atl">
    <div class="atl-tabs">
      <button :class="['atl-tab', { on: mode === 'oauth' }]" @click="mode = 'oauth'">Sign in with Atlassian</button>
      <button :class="['atl-tab', { on: mode === 'credential' }]" @click="mode = 'credential'">API token / PAT</button>
    </div>

    <label class="atl-field">
      <span>Connection name</span>
      <input v-model="name" type="text" placeholder="Atlassian" />
    </label>

    <div v-if="mode === 'oauth'" class="atl-pane">
      <p class="atl-hint">Authorize KickSide to access your Atlassian Jira and Confluence. Opens a secure Atlassian sign-in window.</p>
      <button class="atl-primary" :disabled="busy" @click="connectOAuth">{{ busy ? 'Connecting…' : 'Connect Atlassian' }}</button>
      <div v-if="pendingAuthUrl" class="atl-warn">
        <span>Your browser blocked the popup.</span>
        <button type="button" @click="openBlockedPopup">Open authorization</button>
      </div>
    </div>

    <div v-else class="atl-pane">
      <label class="atl-field">
        <span>Site URL</span>
        <input v-model="siteUrl" type="text" placeholder="https://your-org.atlassian.net" />
      </label>
      <label class="atl-field">
        <span>Deployment</span>
        <select v-model="deployment">
          <option value="cloud">Cloud (email + API token)</option>
          <option value="server">Server / Data Center (PAT)</option>
        </select>
      </label>
      <template v-if="deployment === 'cloud'">
        <label class="atl-field">
          <span>Account email</span>
          <input v-model="email" type="email" placeholder="you@example.com" />
        </label>
        <label class="atl-field">
          <span>API token</span>
          <input v-model="apiToken" type="password" placeholder="Atlassian API token" />
        </label>
      </template>
      <label v-else class="atl-field">
        <span>Personal access token</span>
        <input v-model="pat" type="password" placeholder="Server/DC PAT" />
      </label>
      <button class="atl-primary" :disabled="busy" @click="saveCredential">{{ busy ? 'Saving…' : 'Save connection' }}</button>
    </div>

    <p v-if="error" class="atl-error">{{ error }}</p>
  </div>
</template>
