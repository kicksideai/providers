import { P as t, u as e } from "./wc-runtime-Cnj2CWxS.js";
import { l as n, m as r } from "./lazy-CG__0OGb.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const m = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, p = {
  wippy: m
}, s = n(
  () => import("./MemorySettings-BRJZsSj5.js"),
  { loading: "Loading the memory settings…", failed: "Could not load the memory settings. Reload the page to try again." },
  e
), o = r(
  { rootComponent: s, plugins: [t] },
  p.wippy.props
);
async function d() {
  return o;
}
i(import.meta.url, o);
export {
  d as webComponent
};
//# sourceMappingURL=memory_settings.js.map
