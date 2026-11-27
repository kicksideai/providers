import { u as i, a as p, W as m } from "./wc-runtime-CuuaQDIp.js";
import { defineComponent as f, computed as u, openBlock as a, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js";
import { s as C } from "./styles-CV5852_Q.js";
import { define as _ } from "@wippy-fe/proxy";
const y = /* @__PURE__ */ f({
  __name: "ConfluencePicker",
  setup(o) {
    const t = i(), c = p(), s = u(() => t.value.config || null);
    function r(e) {
      c("config-changed", e);
    }
    return (e, d) => (a(), l(g, {
      kind: "confluence",
      config: s.value,
      onChange: r
    }, null, 8, ["config"]));
  }
});
class n extends m {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: { config: { type: "object" } } },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: C
    };
  }
  static get vueConfig() {
    return { rootComponent: y };
  }
}
async function E() {
  return n;
}
_(import.meta.url, n);
export {
  E as webComponent
};
//# sourceMappingURL=confluence_picker.js.map
