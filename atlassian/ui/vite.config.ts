import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { hostExternals, wcRuntimeChunk } from '../../wc-build'

export default defineConfig({
  plugins: [vue(), wippyComponentPlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    // Build into the module's own served directory so kickside/atlassian ships and
    // serves its own connect UI bundle.
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: {
        connect: resolve(__dirname, 'src/connect.ts'),
        jira_picker: resolve(__dirname, 'src/jira_picker.ts'),
        confluence_picker: resolve(__dirname, 'src/confluence_picker.ts'),
      },
      name: 'KicksideAtlassian',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        connect: resolve(__dirname, 'src/connect.ts'),
        jira_picker: resolve(__dirname, 'src/jira_picker.ts'),
        confluence_picker: resolve(__dirname, 'src/confluence_picker.ts'),
      },
      external: hostExternals,
      output: {
        manualChunks: wcRuntimeChunk,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
