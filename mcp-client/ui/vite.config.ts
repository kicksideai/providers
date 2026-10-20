import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [vue(), wippyComponentPlugin()],
  // Library builds leave Vue's environment checks intact unless defined here.
  define: { 'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production') },
  build: {
    target: 'esnext',
    emptyOutDir: true,
    lib: {
      entry: { connect: resolve(__dirname, 'src/connect.ts'), picker: resolve(__dirname, 'src/picker.ts') },
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      external: ['vue', '@wippy-fe/proxy'],
      output: { entryFileNames: '[name].js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name]-[hash][extname]' },
    },
    sourcemap: false,
  },
}))
