import { W as o, l as n } from "./wc-runtime-CuuaQDIp.js";
import { s as i } from "./styles-CV5852_Q.js";
import { define as s } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (atlassian)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, a = {
  wippy: r
};
class t extends o {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return n(() => import("./Connect-C_lZ1bJx.js").then((e) => ({ rootComponent: e.default })), { surface: "compact", loading: "Loading Atlassian connection…", failed: "Could not load the Atlassian connection form. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function m() {
  return t;
}
s(import.meta.url, t);
export {
  m as webComponent
};
//# sourceMappingURL=connect.js.map
