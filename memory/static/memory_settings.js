import { l as o, P as i } from "./wc-runtime-DBE0CU59.js";
import { m as n } from "./element-CzSM43lK.js";
import { define as r } from "@wippy-fe/proxy";
const m = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, p = {
  wippy: m
}, e = n(
  o(() => import("./MemorySettings-D9qqUe95.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading the memory settings…", failed: "Could not load the memory settings. Reload the page to try again.", delay: 200, timeout: 3e4 }),
  p.wippy.props
);
async function c() {
  return e;
}
r(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=memory_settings.js.map
