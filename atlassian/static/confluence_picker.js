import { u as i, a as p, W as m } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as a, computed as f, openBlock as u, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-D_r5wwEz.js";
import { s as C, p as _ } from "./package-BOalANyK.js";
import "@iconify/vue";
import { define as d } from "@wippy-fe/proxy";
const h = /* @__PURE__ */ a({
  __name: "ConfluencePicker",
  setup(o) {
    const t = i(), s = p(), r = f(() => t.value.config || null);
    function c(e) {
      s("config-changed", e);
    }
    return (e, k) => (u(), l(g, {
      kind: "confluence",
      config: r.value,
      onChange: c
    }, null, 8, ["config"]));
  }
});
class n extends m {
  static get wippyConfig() {
    return {
      propsSchema: _.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: C
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
//# sourceMappingURL=confluence_picker.js.map
