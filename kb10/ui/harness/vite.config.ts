import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Throwaway rendering harness for the create-config element: the real component
// and the real stylesheet, with the host seams (props/events, proxy api) stubbed.
export default defineConfig({
  root: __dirname,
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } })],
  resolve: {
    alias: {
      '@wippy-fe/webcomponent-vue': resolve(__dirname, 'stub-host.ts'),
      '@wippy-fe/proxy': resolve(__dirname, 'stub-host.ts'),
    },
  },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
})
