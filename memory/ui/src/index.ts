// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import type { WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import MemorySettings from './app/MemorySettings.vue'
import pkg from '../package.json'

const KicksideMemorySettingsElement = memoryElement(MemorySettings, pkg.wippy.props as WippyPropsSchema)

export async function webComponent() {
  return KicksideMemorySettingsElement
}

define(import.meta.url, KicksideMemorySettingsElement)
