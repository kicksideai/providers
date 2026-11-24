<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { PanelEvents, PanelProps, Values } from '../types'

// Mailgun's rows inside the Mail delivery block. The block keeps the draft and saves it; this panel reports
// each change and whether it is valid. The server validates again when the block saves.
const props = useProps<PanelProps>()
const emit = useEvents<PanelEvents>()
const ids = { key: useId(), domain: useId(), region: useId() }

const saved = computed<Values>(() => props.value?.values ?? {})
const keySet = computed(() => !!props.value?.secrets?.api_key)
const serverErrors = computed(() => props.value?.errors ?? {})
const disabled = computed(() => !!props.value?.disabled)

const domain = ref(''), region = ref('us'), apiKey = ref('')
const replacingKey = ref(false)
watch(saved, value => {
  domain.value = value.domain ?? ''
  region.value = value.region === 'eu' ? 'eu' : 'us'
  apiKey.value = ''
  replacingKey.value = false
}, { immediate: true })

const regions = [{ label: 'United States', value: 'us' }, { label: 'European Union', value: 'eu' }]
// The same rule as the driver's domain validation: the domain must form a valid address after "x@".
const domainPattern = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
const domainError = computed(() => domain.value && !domainPattern.test(domain.value) ? 'Enter a domain such as mg.example.com.' : serverErrors.value.domain ?? '')
const keyError = computed(() => {
  if (!keySet.value && !apiKey.value && domain.value) return 'Enter the API key for this domain.'
  return serverErrors.value.api_key ?? ''
})
const valid = computed(() => !(domain.value && !domainPattern.test(domain.value)) && !(!keySet.value && !apiKey.value && domain.value))

watch([domain, region, apiKey], () => {
  const changes: Values = {}
  if (domain.value !== (saved.value.domain ?? '')) changes.domain = domain.value
  if (region.value !== (saved.value.region ?? 'us')) changes.region = region.value
  if (apiKey.value) changes.api_key = apiKey.value
  emit('change', { values: changes })
  emit('validity', { valid: valid.value })
})
watch(valid, value => emit('validity', { valid: value }), { immediate: true })
</script>

<template>
  <fieldset class="mg" :disabled="disabled">
    <legend class="mg-sr-only">Mailgun</legend>
    <div class="mg-row" :class="{ 'mg-row-invalid': keyError }">
      <div class="mg-text">
        <label class="mg-title" :for="ids.key">API key</label>
        <p class="mg-help">A Mailgun sending key for this domain.</p>
      </div>
      <div class="mg-control">
        <div v-if="keySet && !replacingKey" class="mg-secret">
          <Tag severity="success" value="Set" />
          <Button label="Replace" severity="secondary" outlined size="small" @click="replacingKey = true" />
        </div>
        <Password v-else v-model="apiKey" :input-id="ids.key" :feedback="false" toggle-mask fluid :invalid="!!keyError"
          :placeholder="keySet ? 'Enter a new key…' : 'key-…'" :aria-describedby="ids.key + '-error'" />
        <small v-if="keyError" :id="ids.key + '-error'" class="mg-error" role="alert">{{ keyError }}</small>
      </div>
    </div>
    <div class="mg-row" :class="{ 'mg-row-invalid': domainError }">
      <div class="mg-text">
        <label class="mg-title" :for="ids.domain">Sending domain</label>
        <p class="mg-help">The domain you verified in Mailgun.</p>
      </div>
      <div class="mg-control">
        <InputText :id="ids.domain" v-model.trim="domain" fluid :invalid="!!domainError" placeholder="mg.example.com"
          :aria-describedby="ids.domain + '-error'" />
        <small v-if="domainError" :id="ids.domain + '-error'" class="mg-error" role="alert">{{ domainError }}</small>
      </div>
    </div>
    <div class="mg-row">
      <div class="mg-text">
        <span :id="ids.region" class="mg-title">Region</span>
        <p class="mg-help">Where your Mailgun account keeps this domain.</p>
      </div>
      <div class="mg-control">
        <SelectButton v-model="region" :options="regions" option-label="label" option-value="value" :allow-empty="false" :aria-labelledby="ids.region" />
        <small v-if="serverErrors.region" class="mg-error" role="alert">{{ serverErrors.region }}</small>
      </div>
    </div>
  </fieldset>
</template>
