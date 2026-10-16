<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'

type AuthMode = 'none' | 'bearer' | 'header'
import type { ConnectProps, ConnectEvents } from '../types'
const props = useProps<ConnectProps>()
const emit = useEvents<ConnectEvents>()

const name = ref('Remote MCP')
const endpoint = ref('')
const authMode = ref<AuthMode>('none')
const bearerToken = ref('')
const headerName = ref('X-API-Key')
const headerValue = ref('')
const protocolVersion = ref('2025-11-25')
const showSecret = ref(false)
const advancedOpen = ref(false)
const busy = ref(false)
const error = ref('')
const result = ref<{ toolCount: number } | null>(null)
const existingId = computed(() => props.value.componentId || '')
const submitLabel = computed(() => busy.value ? 'Verifying connection…' : existingId.value ? 'Verify and reconnect' : 'Verify and connect')

function selectAuth(mode: AuthMode) { authMode.value = mode; error.value = ''; result.value = null }
function validationError(): string {
  if (!endpoint.value.trim()) return 'Enter the MCP server endpoint.'
  try { const u = new URL(endpoint.value.trim()); if (!['http:', 'https:'].includes(u.protocol)) return 'The endpoint must use HTTP or HTTPS.' } catch { return 'Enter a valid MCP endpoint URL.' }
  if (authMode.value === 'bearer' && !bearerToken.value.trim()) return 'Enter the access token.'
  if (authMode.value === 'header' && (!headerName.value.trim() || !headerValue.value.trim())) return 'Enter both the API-key header and value.'
  return ''
}
function privateContext() {
  return {
    auth_type: authMode.value, endpoint_url: endpoint.value.trim(),
    bearer_token: authMode.value === 'bearer' ? bearerToken.value.trim() : '',
    header_name: authMode.value === 'header' ? headerName.value.trim() : '',
    header_value: authMode.value === 'header' ? headerValue.value.trim() : '',
    protocol_version: protocolVersion.value.trim() || '2025-11-25',
  }
}
async function save() {
  error.value = validationError(); result.value = null
  if (error.value) return
  busy.value = true
  try {
    const body = { name: name.value.trim() || 'Remote MCP', private_context: privateContext() }
    const response = existingId.value
      ? await api.put(`/api/v1/mcp-client/connections/${encodeURIComponent(existingId.value)}`, body)
      : await api.post('/api/v1/connections', { impl_id: 'kickside.mcp_client:remote_connection', ...body, validate: true })
    const data = response.data
    if (!data?.success) throw new Error(data?.error || 'The server could not be verified.')
    result.value = { toolCount: Number(data.tool_count ?? 0) }
    emit('connection-saved', { success: true, component_id: data.component_id || existingId.value })
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    emit('connection-saved', { success: false, error: error.value })
  } finally { busy.value = false }
}
</script>

<template>
  <form class="mcp connect" aria-label="Remote MCP connection" @submit.prevent="save">
    <section class="section" aria-labelledby="mcp-server-heading">
      <div id="mcp-server-heading" class="section-title">Server details</div>
      <label class="field"><span>Connection name</span><input v-model="name" autocomplete="off" placeholder="Engineering tools" /></label>
      <label class="field"><span>Streamable HTTP endpoint <em>Required</em></span><input v-model="endpoint" type="url" inputmode="url" autocomplete="url" placeholder="https://mcp.example.com/mcp" @input="result=null" /><small>The exact MCP endpoint, not the provider homepage.</small></label>
    </section>

    <section class="section" aria-labelledby="mcp-auth-heading">
      <div id="mcp-auth-heading" class="section-title">Authentication</div>
      <div class="auth-grid" role="radiogroup" aria-label="Authentication method">
        <button v-for="mode in ([['none','No authentication','Public or network-protected'],['bearer','Access token','OAuth or bearer token'],['header','API key','Custom request header']] as const)" :key="mode[0]" type="button" class="auth-card" :class="{active:authMode===mode[0]}" role="radio" :aria-checked="authMode===mode[0]" @click="selectAuth(mode[0])"><span class="radio-dot"></span><strong>{{mode[1]}}</strong><small>{{mode[2]}}</small></button>
      </div>
      <label v-if="authMode==='bearer'" class="field secret-field"><span>Access token <em>Required</em></span><span class="secret-wrap"><input v-model="bearerToken" :type="showSecret?'text':'password'" autocomplete="new-password" placeholder="Paste a token issued for this MCP server" /><button type="button" class="reveal" :aria-label="showSecret?'Hide token':'Show token'" @click="showSecret=!showSecret">{{showSecret?'Hide':'Show'}}</button></span><small>Sent as <code>Authorization: Bearer</code> on every MCP request.</small></label>
      <div v-if="authMode==='header'" class="header-pair"><label class="field"><span>Header name <em>Required</em></span><input v-model="headerName" autocomplete="off" placeholder="X-API-Key" /></label><label class="field secret-field"><span>Header value <em>Required</em></span><span class="secret-wrap"><input v-model="headerValue" :type="showSecret?'text':'password'" autocomplete="new-password" /><button type="button" class="reveal" @click="showSecret=!showSecret">{{showSecret?'Hide':'Show'}}</button></span></label></div>
      <p class="security-note"><span aria-hidden="true">◆</span> Credentials stay in the connection's private component context and never enter agent prompts.</p>
    </section>

    <button type="button" class="advanced-toggle" :aria-expanded="advancedOpen" @click="advancedOpen=!advancedOpen"><span>Advanced protocol settings</span><span>{{advancedOpen?'−':'+'}}</span></button>
    <section v-if="advancedOpen" class="advanced"><label class="field"><span>MCP protocol version</span><input v-model="protocolVersion" autocomplete="off" /><small>The server may negotiate another supported version during initialization.</small></label></section>

    <div v-if="error" class="feedback error" role="alert"><span>!</span><div><strong>Connection failed</strong><small>{{error}}</small></div></div>
    <div v-if="result" class="feedback success" role="status"><span>✓</span><div><strong>Connection verified</strong><small>{{result.toolCount ? `${result.toolCount} tools discovered and ready.` : 'The MCP handshake completed successfully.'}}</small></div></div>
    <p class="footnote">A worker starts only while this connection is in use.</p>
    <button class="primary" type="submit" :disabled="busy"><span v-if="busy" class="spinner"></span>{{submitLabel}}</button>
  </form>
</template>
