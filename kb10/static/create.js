import { W as t, u as o } from "./wc-runtime-CNDpK4lj.js";
import { l as n, b as i } from "./styles-B-Ei5Rxs.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const r = n(
  () => import("./KbCreateConfig-bhsV4Lkd.js"),
  { loading: "Loading the knowledge base settings…", failed: "Could not load the knowledge base settings. Reload the page to try again." },
  o
), a = {
  type: "object",
  properties: {
    config: { type: "object", description: "Configuration context: { kb_type, id?, embedding_model?, config?, edit? }" }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: r };
  }
}
async function c() {
  return e;
}
s(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=create.js.map
