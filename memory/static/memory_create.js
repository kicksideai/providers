import { u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as t } from "./primevue-plugin-CaP7wV_M.js";
import { l as n, m as i } from "./lazy-l_o3DZGp.js";
import "@iconify/vue";
import { define as m } from "@wippy-fe/proxy";
const r = n(
  () => import("./MemoryCreate-BXSQo9P9.js"),
  { loading: "Loading the memory settings…", failed: "Could not load the memory settings. Reload the page to try again." },
  o
), e = i(
  { rootComponent: r, plugins: [t] },
  {
    type: "object",
    properties: {
      config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
    }
  }
);
async function c() {
  return e;
}
m(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=memory_create.js.map
