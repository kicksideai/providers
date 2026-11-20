import { W as o, l as i } from "./wc-runtime-BSKB6yGs.js";
import { c as n, p } from "./package-2cp6oTNq.js";
import { define as r } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: p.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return i(() => import("./Picker-DlrykQ8Q.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the MCP tool picker…", failed: "Could not load the MCP tool picker. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function c() {
  return e;
}
r(import.meta.url, e);
export {
  c as webComponent
};
