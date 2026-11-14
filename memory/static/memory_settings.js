import { u as t } from "./wc-runtime-KO3cNuNo.js";
import { P as e } from "./primevue-plugin-CaP7wV_M.js";
import { l as r, m as i } from "./lazy-Dyi12j7w.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const m = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, p = {
  wippy: m
}, s = r(
  () => import("./MemorySettings-BeN2sX12.js"),
  { loading: "Loading the memory settings…", failed: "Could not load the memory settings. Reload the page to try again." },
  t
), o = i(
  { rootComponent: s, plugins: [e] },
  p.wippy.props
);
async function g() {
  return o;
}
n(import.meta.url, o);
export {
  g as webComponent
};
//# sourceMappingURL=memory_settings.js.map
