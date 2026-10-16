import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: Object.fromEntries(['vue', '@iconify/vue', '@wippy-fe/proxy'].map((name) => [name, require.resolve(name)])) },
  test: { environment: 'happy-dom' },
})
