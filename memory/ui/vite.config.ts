// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

const entries = {
  memory_settings: resolve(__dirname, 'src/index.ts'),
  memory_create: resolve(__dirname, 'src/create.ts'),
  index: resolve(__dirname, 'src/manage.ts'),
}

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }), wippyComponentPlugin()],
  // Lib builds don't auto-replace process.env; provide it so deps that read
  // NODE_ENV don't throw "process is not defined" in the browser/shadow DOM.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/memory ships and
    // serves its own UI bundle (no dependency on the app to host it).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      // Three elements ship from this package: the Memory trait settings
      // (memory_settings.js), the memory engine's create pane (memory_create.js)
      // and the memory knowledge base page (index.js). Entry keys are the
      // served filenames the registry entry points name.
      entry: entries,
      name: 'KicksideMemorySettings',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: entries,
      external: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
