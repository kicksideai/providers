import { l as t } from "./wc-runtime-DBE0CU59.js";
import { m as n } from "./element-CzSM43lK.js";
import { define as r } from "@wippy-fe/proxy";
const e = n(
  {
    ...t(() => import("./lazy-mount-W-hZWwm5.js").then((o) => o.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the memory knowledge base. Reload the page to try again.", timeout: 3e4 })
  },
  {
    type: "object",
    properties: {
      config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
    }
  }
);
async function p() {
  return e;
}
r(import.meta.url, e);
export {
  p as webComponent
};
//# sourceMappingURL=index.js.map
