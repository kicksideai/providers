<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useProps, useEvents } from "@wippy-fe/webcomponent-vue";
import { api, loadByTagName } from "@wippy-fe/proxy";
import Select from "primevue/select";

interface Conn {
  component_id: string;
  name?: string;
  provider?: string;
}
interface Resource {
  type?: string;
  id?: string;
  name?: string;
}
interface Config {
  connection_id?: string;
  object_type?: string;
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
// The connection owns the readable-object vocabulary through
// discover_resources; keeping a frontend copy drifts when providers evolve.
const resources = ref<Resource[]>([]);
const connectionId = ref("");
const objectType = ref("contacts");
const loadingConns = ref(false);
const loadingResources = ref(false);
const error = ref("");
const pickerError = ref("");
const MAX_DISCOVERY_ERROR_LENGTH = 240;

const selectedName = computed(() => {
  const found = resources.value.find((r) => r.id === objectType.value);
  return (
    found?.name || objectType.value
  );
});
const pickerValue = computed(() =>
  JSON.stringify({ connection_id: connectionId.value }),
);

function readConfig(cfg: Config | null | undefined) {
  connectionId.value = cfg?.connection_id || "";
  objectType.value = cfg?.object_type || "contacts";
}
watch(
  () => props.value.config,
  (c) => readConfig(c),
  { immediate: true },
);

function publish() {
  emit("config-changed", {
    connection_id: connectionId.value || undefined,
    object_type: objectType.value || undefined,
  });
}

async function loadConnections() {
  loadingConns.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/api/v1/connections?provider=hubspot");
    connections.value = (data && data.connections) || [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loadingConns.value = false;
  }
}

async function loadResources() {
    resources.value = [];
  if (!connectionId.value) return;
  loadingResources.value = true;
  error.value = "";
  try {
    const { data } = await api.post(
      `/api/v1/connections/${encodeURIComponent(connectionId.value)}/discover_resources`,
      {},
    );
    const response = data && typeof data === "object" ? data as {
      success?: unknown;
      error?: unknown;
      resources?: unknown;
    } : null;
    if (response?.success === false) {
      const detail = typeof response.error === "string"
        ? response.error.trim().slice(0, MAX_DISCOVERY_ERROR_LENGTH)
        : "";
      error.value = detail
        ? `HubSpot object discovery failed: ${detail}`
        : "HubSpot object discovery failed";
      return;
    }
    const all: Resource[] = Array.isArray(response?.resources)
      ? response.resources
      : [];
    const discovered = all.filter((r) => r.type === "hubspot_object" && r.id);
    if (!discovered.length) {
      error.value = "HubSpot object discovery returned no readable objects";
      return;
    }
    resources.value = discovered;
    if (!resources.value.some((r) => r.id === objectType.value))
      objectType.value = resources.value[0]?.id || objectType.value;
  } catch (cause) {
    resources.value = [];
    error.value =
      cause instanceof Error
        ? cause.message
        : "HubSpot object discovery failed";
  } finally {
    loadingResources.value = false;
  }
}

function onConnectionChange(event: Event) {
  const detail = (event as CustomEvent).detail as Config | undefined;
  connectionId.value = detail?.connection_id || "";
  publish();
  loadResources();
}

function onObjectChange() {
  publish();
}

onMounted(async () => {
  try {
    await loadByTagName("wc-connection-picker", { timeoutMs: 8000 });
  } catch (cause) {
    pickerError.value =
      cause instanceof Error ? cause.message : "Connection picker unavailable";
  }
  await loadConnections();
  if (connectionId.value) await loadResources();
});
</script>

<template>
  <div class="hs">
    <label class="hs-field">
      <span>HubSpot connection</span>
      <wc-connection-picker
        source="/api/v1/connections"
        providers="hubspot"
        reply-only="false"
        placeholder="Select a connection"
        :value="pickerValue"
        @change="onConnectionChange"
      ></wc-connection-picker>
    </label>

    <label class="hs-field">
      <span>CRM object</span>
      <Select
        v-model="objectType"
        :options="resources"
        option-label="name"
        option-value="id"
        :loading="loadingResources"
        aria-label="CRM object"
        @change="onObjectChange"
      />
    </label>

    <div class="hs-summary">
      <span class="hs-dot" />
      <span>{{ loadingResources ? "Loading objects..." : selectedName }}</span>
    </div>

    <p v-if="!connections.length && !loadingConns" class="hs-hint">
      No HubSpot connection yet. Add one from the Connections page first.
    </p>
    <p v-if="pickerError" class="hs-error" role="alert">
      Connection picker unavailable: {{ pickerError }}
    </p>
    <p v-if="error" class="hs-error">{{ error }}</p>
  </div>
</template>
