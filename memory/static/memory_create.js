import { u as o, P as t } from "./wc-runtime-Cnj2CWxS.js";
import { l as n, m as i } from "./lazy-0O1vWIeh.js";
import "@iconify/vue";
import { define as m } from "@wippy-fe/proxy";
const r = n(
  () => import("./MemoryCreate-CbP4Cm6G.js"),
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
async function d() {
  return e;
}
m(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=memory_create.js.map
