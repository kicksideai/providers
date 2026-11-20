import { W as o, l as n } from "./wc-runtime-BSKB6yGs.js";
import { c as i, p as r } from "./package-2cp6oTNq.js";
import { define as a } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return n(() => import("./Connect-De9PqfQ5.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the MCP connection editor…", failed: "Could not load the MCP connection editor. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function l() {
  return e;
}
a(import.meta.url, e);
export {
  l as webComponent
};
