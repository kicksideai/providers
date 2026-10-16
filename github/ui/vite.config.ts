import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), wippyComponentPlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    lib: {
      entry: {
        connect: resolve(__dirname, 'src/connect.ts'),
      },
      name: 'KicksideGitHub',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        connect: resolve(__dirname, 'src/connect.ts'),
      },
      external: ['vue', '@wippy-fe/proxy'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
