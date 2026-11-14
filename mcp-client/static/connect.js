import { W as t, u as e } from "./wc-runtime-CWzMpxrl.js";
import { l as n, c as i, p as r } from "./package-CcOPnqd3.js";
import { define as s } from "@wippy-fe/proxy";
const p = n(
  () => import("./Connect-D0enpqbQ.js"),
  { loading: "Loading the MCP connection editor…", failed: "Could not load the MCP connection editor. Reload the page to try again." },
  e
);
class o extends t {
  static get wippyConfig() {
    return {
      propsSchema: r.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: p };
  }
}
async function C() {
  return o;
}
s(import.meta.url, o);
export {
  C as webComponent
};
