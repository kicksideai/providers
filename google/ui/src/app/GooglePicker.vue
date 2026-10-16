<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { api, loadByTagName } from "@wippy-fe/proxy";
import { useEvents, useProps } from "@wippy-fe/webcomponent-vue";

interface Config {
  connection_id?: string;
}
interface Conn {
  component_id: string;
  name?: string;
  status?: string;
  connection_state?: string;
  expires_at?: number | null;
  scope_count?: number;
  scopes_granted?: string[] | string;
}
interface P {
  config?: Config | null;
}
interface E {
  "config-changed": Config;
}

const props = useProps<P>();
const emit = useEvents<E>();

const connections = ref<Conn[]>([]);
const connectionId = ref("");
const loading = ref(false);
const error = ref("");
const pickerError = ref("");

watch(
  () => props.value.config,
  (cfg) => {
    connectionId.value = cfg?.connection_id || "";
  },
  { immediate: true },
);

const selected = computed(() =>
  connections.value.find((c) => c.component_id === connectionId.value),
);
const pickerValue = computed(() =>
  JSON.stringify({ connection_id: connectionId.value }),
);

function normalizedStatus(c?: Conn): string {
  if (!c) return "";
  const status = String(c.connection_state || c.status || "").toLowerCase();
  const expiresAt = Number(c.expires_at || 0);
  if (expiresAt > 0 && expiresAt <= Math.floor(Date.now() / 1000))
    return "expired";
  if (
    status === "authenticated" ||
    status === "active" ||
    status === "connected"
  )
    return "connected";
  return status || "unknown";
}

function statusLabel(c?: Conn): string {
  const status = normalizedStatus(c);
  if (!status) return "";
  if (status === "connected") return "Connected";
  if (status === "expired") return "Token expired";
  if (status === "needs_reauth" || status === "reauth_required")
    return "Reconnect required";
  if (status === "disabled") return "Disabled";
  if (status === "unknown") return "Unknown";
  return status.replace(/_/g, " ");
}

function grantedScopes(c?: Conn): string[] {
  if (!c?.scopes_granted) return [];
  if (Array.isArray(c.scopes_granted)) return c.scopes_granted;
  return String(c.scopes_granted).split(/\s+/).filter(Boolean);
}

function scopeName(scope: string): string {
  if (scope === "openid") return "Sign in";
  if (scope.includes("/auth/gmail")) return "Gmail";
  if (scope.includes("/auth/drive")) return "Drive";
  if (scope.includes("/auth/calendar")) return "Calendar";
  if (scope.includes("/auth/documents")) return "Docs";
  if (scope.includes("/auth/spreadsheets")) return "Sheets";
  if (scope.includes("/auth/presentations")) return "Slides";
  if (scope.includes("/auth/contacts")) return "Contacts";
  if (scope.includes("/auth/analytics")) return "Analytics";
  if (scope.includes("/auth/userinfo.email")) return "Email";
  if (scope.includes("/auth/userinfo.profile")) return "Profile";
  return scope.replace(/^https:\/\/www\.googleapis\.com\/auth\//, "");
}

function scopeText(c?: Conn): string {
  const scopes = [...new Set(grantedScopes(c).map(scopeName))];
  const n = scopes.length || Number(c?.scope_count || 0);
  if (!n) return "";
  if (!scopes.length) return `${n} scope${n === 1 ? "" : "s"}`;
  const visible = scopes.slice(0, 4).join(", ");
  const extra = scopes.length > 4 ? ` +${scopes.length - 4}` : "";
  return `${visible}${extra}`;
}

function publish() {
  emit("config-changed", { connection_id: connectionId.value || undefined });
}

function onPickerChange(event: Event) {
  const detail = (event as CustomEvent).detail as Config | undefined;
  connectionId.value = detail?.connection_id || "";
  publish();
}

async function loadConnections() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get(
      "/api/v1/connections?provider=google&limit=100",
    );
    connections.value = (data?.connections ?? []) as Conn[];
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await loadByTagName("wc-connection-picker", { timeoutMs: 8000 });
  } catch (cause) {
    pickerError.value =
      cause instanceof Error ? cause.message : "Connection picker unavailable";
  }
  await loadConnections();
});
</script>

<template>
  <div class="gpick">
    <label class="gfield">
      <span>Google connection</span>
      <wc-connection-picker
        source="/api/v1/connections"
        providers="google"
        reply-only="false"
        placeholder="Auto-select default"
        :value="pickerValue"
        @change="onPickerChange"
      ></wc-connection-picker>
    </label>

    <div
      v-if="selected"
      class="gmeta"
      :class="`state-${normalizedStatus(selected)}`"
    >
      <span>{{ statusLabel(selected) }}</span>
      <span v-if="scopeText(selected)"> · {{ scopeText(selected) }}</span>
    </div>

    <p v-if="!connections.length && !loading" class="ghint">
      No Google connection yet.
    </p>
    <p v-if="pickerError" class="gerr" role="alert">
      Connection picker unavailable: {{ pickerError }}
    </p>
    <p v-if="error" class="gerr">{{ error }}</p>
  </div>
</template>
