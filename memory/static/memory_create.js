import { u as y, a as b, W as C } from "./MmSwitch.vue_vue_type_script_setup_true_lang-CAQfcCan.js";
import { defineComponent as E, computed as c, ref as r, watch as k, openBlock as s, createElementBlock as m, createElementVNode as d, toDisplayString as V, createBlock as w, createCommentVNode as x, createVNode as N } from "vue";
import { i as S, _ as B, a as M, s as j } from "./memory-DSw53YZr.js";
import "@iconify/vue";
import { define as U } from "@wippy-fe/proxy";
const W = { class: "mm-pane" }, $ = { class: "mm-field" }, D = {
  key: 0,
  class: "mm-hint"
}, J = {
  key: 2,
  class: "mm-hint"
}, K = /* @__PURE__ */ E({
  __name: "MemoryCreate",
  setup(u) {
    const p = y(), f = b(), o = c(() => {
      const e = p.value.config;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    }), l = c(() => !!o.value.edit), g = c(() => S(o.value.config?.config_schema) ? o.value.config?.config_schema : {}), t = r("class:embed"), n = r({});
    k(o, (e) => {
      const { config_schema: i, ...v } = e.config || {};
      n.value = { ...v }, e.embedding_model && (t.value = e.embedding_model), a();
    }, { immediate: !0 });
    function a() {
      f("config-changed", { embedding_model: t.value, config: { ...n.value } });
    }
    function _(e) {
      t.value = e, a();
    }
    function h(e) {
      n.value = e, a();
    }
    return (e, i) => (s(), m("div", W, [
      d("div", $, [
        i[0] || (i[0] = d("span", { class: "mm-label" }, "Embedding model", -1)),
        l.value ? (s(), m("span", D, V(t.value) + " — fixed when the memory was created.", 1)) : (s(), w(B, {
          key: 1,
          value: t.value,
          capability: "embed",
          onSelect: _
        }, null, 8, ["value"])),
        l.value ? x("", !0) : (s(), m("span", J, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      N(M, {
        schema: g.value,
        "model-value": n.value,
        "onUpdate:modelValue": h
      }, null, 8, ["schema", "model-value"])
    ]));
  }
}), O = {
  type: "object",
  properties: {
    config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
  }
};
class P extends C {
  static get wippyConfig() {
    return { propsSchema: O, hostCssKeys: ["themeConfigUrl"], inlineCss: j };
  }
  static get vueConfig() {
    return { rootComponent: K };
  }
}
U(import.meta.url, P);
//# sourceMappingURL=memory_create.js.map
