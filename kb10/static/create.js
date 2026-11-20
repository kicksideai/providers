import { W as o, l as n } from "./wc-runtime-CuuaQDIp.js";
import { b as i } from "./styles-48TYyLEK.js";
import { define as a } from "@wippy-fe/proxy";
const s = {
  type: "object",
  properties: {
    config: { type: "object", description: "Configuration context: { kb_type, id?, embedding_model?, config?, edit? }" }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: s,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return n(() => import("./KbCreateConfig-BhQl0o6H.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the knowledge base settings…", failed: "Could not load the knowledge base settings. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function g() {
  return e;
}
a(import.meta.url, e);
export {
  g as webComponent
};
