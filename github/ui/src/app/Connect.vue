<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { api } from '@wippy-fe/proxy'

interface P { providerId?: string; componentId?: string }
interface E {
  'connection-saved': { success: boolean; error?: string }
  'oauth-result': { success: boolean; error?: string }
}

const props = useProps<P>()
const emit = useEvents<E>()

const CONN_IMPL = 'kickside.github.connection:github_connection'
const DEFAULT_SCOPES = ['read:user', 'user:email']

const mode = ref<'oauth' | 'pat'>('oauth')
const busy = ref(false)
const error = ref('')
const pendingAuthUrl = ref('')
const name = ref('')
const repoScope = ref<'public_repo' | 'repo'>('public_repo')
const readOrg = ref(false)
const token = ref('')
let popup: Window | null = null
let popupTimer: ReturnType<typeof setInterval> | null = null
let expectedCallbackOrigin = ''
let expectedStateToken = ''
let messageListenerAttached = false
let attemptGeneration = 0
let unmounted = false

const providerId = computed(() => props.value.providerId || 'github')
const reauth = computed(() => props.value.componentId || '')
const connName = computed(() => name.value.trim() || 'GitHub')

function fail(msg: string) {
  error.value = msg
  busy.value = false
}

function oauthScopes(): string[] {
  const scopes = [...DEFAULT_SCOPES, repoScope.value]
  if (readOrg.value) scopes.push('read:org')
  return scopes
}

function closePopup(target: Window | null) {
  if (!target) return
  try {
    target.close()
  } catch { /* popup may already be cross-origin or closed */ }
}

function cleanupPopup(close = false) {
  if (popupTimer) {
    clearInterval(popupTimer)
    popupTimer = null
  }
  if (messageListenerAttached) {
    window.removeEventListener('message', onMessage)
    messageListenerAttached = false
  }
  if (close) closePopup(popup)
  popup = null
}

function onMessage(e: MessageEvent) {
  const data = e.data as { type?: string; success?: boolean; error?: string; state_token?: string }
  if (!data || data.type !== 'oauth_result') return
  if (!popup || e.source !== popup) return
  if (!expectedCallbackOrigin || e.origin !== expectedCallbackOrigin) return
  if (!expectedStateToken || data.state_token !== expectedStateToken) return

  cleanupPopup(true)
  expectedCallbackOrigin = ''
  expectedStateToken = ''
  busy.value = false
  pendingAuthUrl.value = ''
  if (data.success) {
    error.value = ''
    emit('oauth-result', { success: true })
  } else {
    const message = data.error || 'GitHub authorization failed'
    error.value = message
    emit('oauth-result', { success: false, error: message })
  }
}

function watchPopupClose() {
  popupTimer = setInterval(() => {
    let closed = false
    try { closed = !popup || popup.closed } catch { closed = false }
    if (!closed) return
    cleanupPopup()
    expectedCallbackOrigin = ''
    expectedStateToken = ''
    busy.value = false
    pendingAuthUrl.value = ''
    const message = 'GitHub authorization was cancelled before completion'
    error.value = message
    emit('oauth-result', { success: false, error: message })
  }, 800)
}

function monitorPopup() {
  if (!messageListenerAttached) {
    window.addEventListener('message', onMessage)
    messageListenerAttached = true
  }
  watchPopupClose()
}

function resetOAuthAttempt(close = true) {
  attemptGeneration += 1
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

async function connectOAuth() {
  resetOAuthAttempt()
  const generation = attemptGeneration
  error.value = ''
  busy.value = true
  popup = window.open('about:blank', 'oauth_github', 'width=520,height=680,menubar=no,toolbar=no,location=no,status=no')
  try {
    const body: Record<string, unknown> = { name: connName.value, scopes: oauthScopes() }
    if (reauth.value) body.component_id = reauth.value
    const { data } = await api.post(`/api/v1/oauth/providers/${encodeURIComponent(providerId.value)}/init`, body)
    if (unmounted || generation !== attemptGeneration) return
    if (!data?.success || !data.authorization_url) {
      resetOAuthAttempt()
      return fail(data?.error || 'Could not start GitHub sign-in')
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
    if (unmounted || generation !== attemptGeneration) return
    resetOAuthAttempt()
    fail(e instanceof Error ? e.message : String(e))
  }
}

function openBlockedPopup() {
  if (!pendingAuthUrl.value || !expectedCallbackOrigin || !expectedStateToken) return
  busy.value = true
  const nextPopup = window.open(pendingAuthUrl.value, 'oauth_github', 'width=520,height=680,menubar=no,toolbar=no,location=no,status=no')
  if (!nextPopup || nextPopup.closed) {
    closePopup(nextPopup)
    busy.value = false
    return fail('Popup blocked - allow popups and retry')
  }
  cleanupPopup(true)
  popup = nextPopup
  pendingAuthUrl.value = ''
  monitorPopup()
}

async function savePat() {
  error.value = ''
  const raw = token.value.trim()
  if (!raw) return fail('Personal access token is required')
  busy.value = true
  try {
    const { data } = await api.post('/api/v1/connections', {
      impl_id: CONN_IMPL,
      name: connName.value,
      private_context: { token: raw },
      validate: true,
    })
    if (!data || data.success === false) return fail(data?.error || 'Could not save GitHub connection')
    busy.value = false
    emit('connection-saved', { success: true })
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
}

onUnmounted(() => {
  unmounted = true
  resetOAuthAttempt()
  busy.value = false
})
</script>

<template>
  <div class="gh">
    <div class="gh-tabs">
      <button type="button" :class="['gh-tab', { on: mode === 'oauth' }]" :disabled="busy" @click="mode = 'oauth'">GitHub OAuth</button>
      <button type="button" :class="['gh-tab', { on: mode === 'pat' }]" :disabled="busy" @click="mode = 'pat'">Personal access token</button>
    </div>

    <label class="gh-field">
      <span>Connection name</span>
      <input v-model="name" type="text" placeholder="GitHub" :disabled="busy" />
    </label>

    <div v-if="mode === 'oauth'" class="gh-pane">
      <p class="gh-hint">Authorize KickSide with a GitHub OAuth App. This is the preferred path for repository agents and automations.</p>

      <div class="gh-pick" role="radiogroup" aria-label="Repository access">
        <label class="gh-choice">
          <input v-model="repoScope" type="radio" value="public_repo" :disabled="busy" />
          <span>
            <strong>Public repositories</strong>
            <em>Use GitHub's public_repo scope.</em>
          </span>
        </label>
        <label class="gh-choice">
          <input v-model="repoScope" type="radio" value="repo" :disabled="busy" />
          <span>
            <strong>Private and public repositories</strong>
            <em>Use GitHub's broader repo scope.</em>
          </span>
        </label>
      </div>

      <label class="gh-check">
        <input v-model="readOrg" type="checkbox" :disabled="busy" />
        <span>Read organization membership when repository access depends on teams.</span>
      </label>

      <button class="gh-primary" type="button" :disabled="busy" @click="connectOAuth">{{ busy ? 'Connecting...' : 'Sign in with GitHub' }}</button>
      <div v-if="pendingAuthUrl" class="gh-warn">
        <span>Your browser blocked the popup.</span>
        <button type="button" @click="openBlockedPopup">Open authorization</button>
      </div>
    </div>

    <div v-else class="gh-pane">
      <p class="gh-hint">Use a fine-grained or classic GitHub token only when OAuth is unavailable. The token is stored in the connection private context.</p>
      <label class="gh-field">
        <span>Personal access token</span>
        <input v-model="token" type="password" placeholder="github_pat_..." :disabled="busy" @keydown.enter.prevent="savePat" />
      </label>
      <button class="gh-primary" type="button" :disabled="busy" @click="savePat">{{ busy ? 'Saving...' : 'Save token connection' }}</button>
    </div>

    <p v-if="error" class="gh-error">{{ error }}</p>
  </div>
</template>
