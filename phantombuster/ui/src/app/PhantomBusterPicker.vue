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

const selected = computed(() =>
  connections.value.find((c) => connectionValue(c) === connectionId.value),
);
const pickerValue = computed(() =>
  JSON.stringify({ connection_id: connectionId.value }),
);

function connectionValue(c: Conn): string {
  return c.component_id;
}

watch(
  () => props.value.config,
  (cfg) => {
    connectionId.value = cfg?.connection_id || "";
  },
  { immediate: true },
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
  if (status === "expired") return "Expired";
  if (status === "needs_reauth" || status === "reauth_required")
    return "Reconnect required";
  if (status === "disabled") return "Disabled";
  if (status === "unknown") return "Unknown";
  return status.replace(/_/g, " ");
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
      "/api/v1/connections?provider=phantombuster&limit=100",
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
  <div class="pbpick">
    <label class="pbpick-field">
      <span>PhantomBuster connection</span>
      <wc-connection-picker
        source="/api/v1/connections"
        providers="phantombuster"
        reply-only="false"
        placeholder="Auto-select default"
        :value="pickerValue"
        @change="onPickerChange"
      ></wc-connection-picker>
    </label>

    <div
      v-if="selected"
      class="pbpick-meta"
      :class="`state-${normalizedStatus(selected)}`"
    >
      {{ statusLabel(selected) }}
    </div>
    <p v-if="!connections.length && !loading" class="pbpick-hint">
      No PhantomBuster connection yet.
    </p>
    <p v-if="pickerError" class="pbpick-error" role="alert">
      Connection picker unavailable: {{ pickerError }}
    </p>
    <p v-if="error" class="pbpick-error">{{ error }}</p>
  </div>
</template>
