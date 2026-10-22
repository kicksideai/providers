import { u as y, a as b, _ as C, W as E } from "./ModelPicker.vue_vue_type_script_setup_true_lang-BXa7KiZU.js";
import { defineComponent as k, computed as c, ref as r, watch as V, openBlock as s, createElementBlock as m, createElementVNode as d, toDisplayString as w, createBlock as x, createCommentVNode as N, createVNode as S } from "vue";
import { i as B, _ as M, s as j } from "./memory-B1z0wrmu.js";
import "@iconify/vue";
import { define as U } from "@wippy-fe/proxy";
const W = { class: "mm-pane" }, $ = { class: "mm-field" }, D = {
  key: 0,
  class: "mm-hint"
}, J = {
  key: 2,
  class: "mm-hint"
}, K = /* @__PURE__ */ k({
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
    }), l = c(() => !!o.value.edit), _ = c(() => B(o.value.config?.config_schema) ? o.value.config?.config_schema : {}), t = r("class:embed"), n = r({});
    V(o, (e) => {
      const { config_schema: i, ...v } = e.config || {};
      n.value = { ...v }, e.embedding_model && (t.value = e.embedding_model), a();
    }, { immediate: !0 });
    function a() {
      f("config-changed", { embedding_model: t.value, config: { ...n.value } });
    }
    function g(e) {
      t.value = e, a();
    }
    function h(e) {
      n.value = e, a();
    }
    return (e, i) => (s(), m("div", W, [
      d("div", $, [
        i[0] || (i[0] = d("span", { class: "mm-label" }, "Embedding model", -1)),
        l.value ? (s(), m("span", D, w(t.value) + " — fixed when the memory was created.", 1)) : (s(), x(C, {
          key: 1,
          value: t.value,
          capability: "embed",
          onSelect: g
        }, null, 8, ["value"])),
        l.value ? N("", !0) : (s(), m("span", J, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      S(M, {
        schema: _.value,
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
class P extends E {
  static get wippyConfig() {
    return { propsSchema: O, hostCssKeys: ["themeConfigUrl"], inlineCss: j };
  }
  static get vueConfig() {
    return { rootComponent: K };
  }
}
U(import.meta.url, P);
//# sourceMappingURL=memory_create.js.map
