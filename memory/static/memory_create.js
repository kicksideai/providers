import { l as o, P as i } from "./wc-runtime-DBE0CU59.js";
import { m as n } from "./element-CzSM43lK.js";
import { define as m } from "@wippy-fe/proxy";
const e = n(
  o(() => import("./MemoryCreate-Cw1DrRo8.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading the memory settings…", failed: "Could not load the memory settings. Reload the page to try again.", delay: 200, timeout: 3e4 }),
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
