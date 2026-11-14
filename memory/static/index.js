import { u as t } from "./wc-runtime-KO3cNuNo.js";
import { m as r, a as n } from "./lazy-Dyi12j7w.js";
import "@iconify/vue";
import { define as m } from "@wippy-fe/proxy";
const e = r(
  {
    lazyConfig: n(
      () => import("./lazy-mount-CYBG1M8L.js").then((o) => o.mountConfig),
      "Could not load the memory knowledge base. Reload the page to try again.",
      t
    )
  },
  {
    type: "object",
    properties: {
      config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
    }
  }
);
async function g() {
  return e;
}
m(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=index.js.map
