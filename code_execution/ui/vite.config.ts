import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { hostExternals, wcRuntimeChunk } from '../../wc-build'

const entries = {
  'code-body': resolve(__dirname, 'src/codeBody.ts'),
}

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('wc-') || tag.startsWith('kickside-'),
        },
      },
    }),
    wippyComponentPlugin(),
  ],
  resolve: { dedupe: ['vue', '@iconify/vue', '@wippy-fe/proxy'] },
  build: {
    target: 'esnext',
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'KicksideCodeExecutionBlocks',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: entries,
      external: hostExternals,
      output: {
        manualChunks: wcRuntimeChunk,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: false,
  },
})
