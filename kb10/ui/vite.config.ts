import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('wc-') } } }), wippyComponentPlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/kb10 ships and
    // serves its own detail UI bundle (no dependency on the knowledge module).
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      // One package, two KB-detail elements — the document UI and the wiki UI (the
      // concept-graph KB, hosting both the reader and the graph canvas behind a
      // view switch) — plus the create-config element, all over the same backend.
      entry: {
        document: resolve(__dirname, 'src/document.ts'),
        wiki: resolve(__dirname, 'src/wiki.ts'),
        create: resolve(__dirname, 'src/create.ts'),
      },
      name: 'KicksideKb10',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        document: resolve(__dirname, 'src/document.ts'),
        wiki: resolve(__dirname, 'src/wiki.ts'),
        create: resolve(__dirname, 'src/create.ts'),
      },
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
