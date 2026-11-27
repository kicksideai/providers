import { u as c, a as p, W as a } from "./wc-runtime-CuuaQDIp.js";
import { defineComponent as m, computed as f, openBlock as u, createBlock as l } from "vue";
import { _ as g } from "./PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js";
import { s as _ } from "./styles-CV5852_Q.js";
import { define as C } from "@wippy-fe/proxy";
const y = /* @__PURE__ */ m({
  __name: "JiraPicker",
  setup(n) {
    const t = c(), r = p(), i = f(() => t.value.config || null);
    function s(e) {
      r("config-changed", e);
    }
    return (e, d) => (u(), l(g, {
      kind: "jira",
      config: i.value,
      onChange: s
    }, null, 8, ["config"]));
  }
});
class o extends a {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: { config: { type: "object" } } },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: y };
  }
}
async function j() {
  return o;
}
C(import.meta.url, o);
export {
  j as webComponent
};
//# sourceMappingURL=jira_picker.js.map
