<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import SettingsItem from '@kickside/ui-kit/SettingsItem.vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { PanelEvents, PanelProps, Values } from '../types'

// Mailgun's rows inside the Mail delivery block. The block keeps the draft and saves it; this panel starts from the
// saved values with the block's draft applied, reports each change and whether it is valid. The server validates
// again when the block saves.
const props = useProps<PanelProps>()
const emit = useEvents<PanelEvents>()

const saved = computed<Values>(() => props.value?.values ?? {})
const keySet = computed(() => !!props.value?.secrets?.api_key)
const serverErrors = computed(() => props.value?.errors ?? {})
const disabled = computed(() => !!props.value?.disabled)

const domain = ref(''), region = ref('us'), apiKey = ref('')
const replacingKey = ref(false)
watch([saved, () => props.value?.draft], ([value, draft]) => {
  domain.value = draft?.domain ?? value.domain ?? ''
  region.value = (draft?.region ?? value.region) === 'eu' ? 'eu' : 'us'
  apiKey.value = draft?.api_key ?? ''
  replacingKey.value = !!draft?.api_key
}, { immediate: true })

function cancelReplace() {
  replacingKey.value = false
  apiKey.value = ''
}

const regions = [{ label: 'United States', value: 'us' }, { label: 'European Union', value: 'eu' }]
// The same rule as the driver's domain validation: the domain must form a valid address after "x@".
const domainPattern = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
const domainInvalid = computed(() => !!domain.value && !domainPattern.test(domain.value))
const keyMissing = computed(() => !keySet.value && !apiKey.value && !!domain.value)
const domainError = computed(() => domainInvalid.value ? 'Enter a domain such as mg.example.com.' : serverErrors.value.domain ?? '')
const keyError = computed(() => keyMissing.value ? 'Enter the API key for this domain.' : serverErrors.value.api_key ?? '')
const valid = computed(() => !domainInvalid.value && !keyMissing.value)

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
    <SettingsItem title="API key" description="A Mailgun sending key for this domain." :class="{ 'mg-invalid': keyError }">
      <template #actions>
        <span class="mg-control">
          <span v-if="keySet && !replacingKey" class="mg-secret">
            <Tag severity="success" value="Set" class="kx-tag-sm" />
            <Button label="Replace" severity="secondary" outlined size="small" :disabled="disabled" @click="replacingKey = true" />
          </span>
          <span v-else class="mg-secret">
            <Password v-model="apiKey" :feedback="false" toggle-mask fluid :invalid="!!keyError" :disabled="disabled"
              aria-label="API key" :placeholder="keySet ? 'Enter a new key…' : 'key-…'" />
            <Button v-if="keySet" label="Cancel" severity="secondary" text size="small" :disabled="disabled" @click="cancelReplace" />
          </span>
          <small v-if="keyError" class="mg-error" role="alert">{{ keyError }}</small>
        </span>
      </template>
    </SettingsItem>
    <SettingsItem title="Sending domain" description="The domain you verified in Mailgun." :class="{ 'mg-invalid': domainError }">
      <template #actions>
        <span class="mg-control">
          <InputText v-model.trim="domain" fluid :invalid="!!domainError" :disabled="disabled" placeholder="mg.example.com" aria-label="Sending domain" />
          <small v-if="domainError" class="mg-error" role="alert">{{ domainError }}</small>
        </span>
      </template>
    </SettingsItem>
    <SettingsItem title="Region" description="Where your Mailgun account keeps this domain.">
      <template #actions>
        <span class="mg-control">
          <SelectButton v-model="region" :options="regions" option-label="label" option-value="value" :allow-empty="false" :disabled="disabled" aria-label="Region" />
          <small v-if="serverErrors.region" class="mg-error" role="alert">{{ serverErrors.region }}</small>
        </span>
      </template>
    </SettingsItem>
  </fieldset>
</template>
