import { u as p, a as c, W as a } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as m, computed as f, openBlock as u, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-D_r5wwEz.js";
import { s as _, p as C } from "./package-BOalANyK.js";
import "@iconify/vue";
import { define as d } from "@wippy-fe/proxy";
const h = /* @__PURE__ */ m({
  __name: "JiraPicker",
  setup(o) {
    const t = p(), r = c(), s = f(() => t.value.config || null);
    function i(e) {
      r("config-changed", e);
    }
    return (e, k) => (u(), l(g, {
      kind: "jira",
      config: s.value,
      onChange: i
    }, null, 8, ["config"]));
  }
});
class n extends a {
  static get wippyConfig() {
    return {
      propsSchema: C.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: h };
  }
}
async function B() {
  return n;
}
d(import.meta.url, n);
export {
  B as webComponent
};
//# sourceMappingURL=jira_picker.js.map
