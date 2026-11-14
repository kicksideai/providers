import { W as t, u as e } from "./wc-runtime-CWzMpxrl.js";
import { l as n, c as r, p as s } from "./package-CcOPnqd3.js";
import { define as i } from "@wippy-fe/proxy";
const p = n(
  () => import("./Picker-D-noRmVD.js"),
  { loading: "Loading the MCP tool picker…", failed: "Could not load the MCP tool picker. Reload the page to try again." },
  e
);
class o extends t {
  static get wippyConfig() {
    return {
      propsSchema: s.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: p };
  }
}
async function C() {
  return o;
}
i(import.meta.url, o);
export {
  C as webComponent
};
