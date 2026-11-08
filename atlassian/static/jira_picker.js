import { u as r, a as c, W as p, s as a } from "./styles-CFY21Xvp.js";
import { defineComponent as m, computed as f, openBlock as u, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js";
import "@iconify/vue";
import { define as _ } from "@wippy-fe/proxy";
const C = /* @__PURE__ */ m({
  __name: "JiraPicker",
  setup(o) {
    const t = r(), n = c(), i = f(() => t.value.config || null);
    function s(e) {
      n("config-changed", e);
    }
    return (e, h) => (u(), l(g, {
      kind: "jira",
      config: i.value,
      onChange: s
    }, null, 8, ["config"]));
  }
});
class d extends p {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: { config: { type: "object" } } },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: a
    };
  }
  static get vueConfig() {
    return { rootComponent: C };
  }
}
_(import.meta.url, d);
//# sourceMappingURL=jira_picker.js.map
