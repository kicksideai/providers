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
  build: {
    target: "esnext",
    emptyOutDir: true,
    lib: {
      entry: {
        picker: resolve(__dirname, "src/picker.ts"),
      },
      name: "KicksideHubSpot",
      formats: ["es"],
    },
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: {
        picker: resolve(__dirname, "src/picker.ts"),
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
