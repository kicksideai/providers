import { u as r, a as p, W as c, s as a, p as m } from "./package-BLKW-MpW.js";
import { defineComponent as f, computed as u, openBlock as l, createBlock as g } from "vue";
import { _ } from "./PickerBody.vue_vue_type_script_setup_true_lang-D_r5wwEz.js";
import "@iconify/vue";
import { define as C } from "@wippy-fe/proxy";
const d = /* @__PURE__ */ f({
  __name: "JiraPicker",
  setup(n) {
    const o = r(), t = p(), s = u(() => o.value.config || null);
    function i(e) {
      t("config-changed", e);
    }
    return (e, k) => (l(), g(_, {
      kind: "jira",
      config: s.value,
      onChange: i
    }, null, 8, ["config"]));
  }
});
class h extends c {
  static get wippyConfig() {
    return {
      propsSchema: m.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: a
    };
  }
  static get vueConfig() {
    return { rootComponent: d };
  }
}
C(import.meta.url, h);
//# sourceMappingURL=jira_picker.js.map
