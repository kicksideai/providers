import { u as i, a as r, W as p, s as m } from "./styles-CFY21Xvp.js";
import { defineComponent as f, computed as a, openBlock as u, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js";
import "@iconify/vue";
import { define as _ } from "@wippy-fe/proxy";
const C = /* @__PURE__ */ f({
  __name: "ConfluencePicker",
  setup(n) {
    const o = i(), t = r(), s = a(() => o.value.config || null);
    function c(e) {
      t("config-changed", e);
    }
    return (e, h) => (u(), l(g, {
      kind: "confluence",
      config: s.value,
      onChange: c
    }, null, 8, ["config"]));
  }
});
class d extends p {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: { config: { type: "object" } } },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: m
    };
  }
  static get vueConfig() {
    return { rootComponent: C };
  }
}
_(import.meta.url, d);
//# sourceMappingURL=confluence_picker.js.map
