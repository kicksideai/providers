import { W as t, u as e } from "./wc-runtime-CNDpK4lj.js";
import { l as n, c as r, p as i } from "./package-COEhTfSU.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const s = n(
  () => import("./Picker-DtOpTvwT.js"),
  { loading: "Loading the MCP tool picker…", failed: "Could not load the MCP tool picker. Reload the page to try again." },
  e
);
class o extends t {
  static get wippyConfig() {
    return {
      propsSchema: i.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: s };
  }
}
async function g() {
  return o;
}
p(import.meta.url, o);
export {
  g as webComponent
};
