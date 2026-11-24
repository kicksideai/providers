// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { wippyComponentPlugin } from "@wippy-fe/vite-plugin";
import { defineConfig } from "vite";
import { hostExternals, wcRuntimeChunk } from "../../wc-build";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith("wc-") },
      },
    }),
    wippyComponentPlugin(),
  ],
  define: {
    "process.env": JSON.stringify({ NODE_ENV: mode }),
  },
  esbuild: { supported: { 'template-literal': false } },
  build: {
    target: "esnext",
    emptyOutDir: true,
    lib: {
      entry: {
        settings: resolve(__dirname, "src/settings.ts"),
      },
      name: "KicksideMailgun",
      formats: ["es"],
    },
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: {
        settings: resolve(__dirname, "src/settings.ts"),
      },
      external: hostExternals,
      output: {
        manualChunks: wcRuntimeChunk,
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
      },
    },
    sourcemap: true,
  },
}));
