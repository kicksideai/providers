import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { wippyComponentPlugin } from "@wippy-fe/vite-plugin";
import { defineConfig } from "vite";

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
        phantombuster_picker: resolve(__dirname, "src/phantombuster_picker.ts"),
      },
      name: "KicksidePhantomBuster",
      formats: ["es"],
    },
    rollupOptions: {
      preserveEntrySignatures: false,
      input: {
        phantombuster_picker: resolve(__dirname, "src/phantombuster_picker.ts"),
      },
      external: ["vue", "@wippy-fe/proxy"],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
      },
    },
    sourcemap: true,
  },
}));
