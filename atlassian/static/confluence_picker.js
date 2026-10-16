import { u as i, a as r, W as p, s as m, p as a } from "./package-BLKW-MpW.js";
import { defineComponent as f, computed as u, openBlock as l, createBlock as g } from "vue";
import { _ } from "./PickerBody.vue_vue_type_script_setup_true_lang-D_r5wwEz.js";
import "@iconify/vue";
import { define as C } from "@wippy-fe/proxy";
const d = /* @__PURE__ */ f({
  __name: "ConfluencePicker",
  setup(n) {
    const o = i(), t = r(), s = u(() => o.value.config || null);
    function c(e) {
      t("config-changed", e);
    }
    return (e, k) => (l(), g(_, {
      kind: "confluence",
      config: s.value,
      onChange: c
    }, null, 8, ["config"]));
  }
});
class h extends p {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: m
    };
  }
  static get vueConfig() {
    return { rootComponent: d };
  }
}
C(import.meta.url, h);
//# sourceMappingURL=confluence_picker.js.map
