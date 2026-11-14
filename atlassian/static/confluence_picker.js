import { u as i, a as p, W as m } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as f, computed as u, openBlock as a, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js";
import { s as C } from "./styles-CV5852_Q.js";
import "@iconify/vue";
import { define as _ } from "@wippy-fe/proxy";
const y = /* @__PURE__ */ f({
  __name: "ConfluencePicker",
  setup(o) {
    const t = i(), c = p(), r = u(() => t.value.config || null);
    function s(e) {
      c("config-changed", e);
    }
    return (e, d) => (a(), l(g, {
      kind: "confluence",
      config: r.value,
      onChange: s
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
async function P() {
  return n;
}
_(import.meta.url, n);
export {
  P as webComponent
};
//# sourceMappingURL=confluence_picker.js.map
