import { defineComponent as h, computed as m, ref as d, watch as b, openBlock as n, createElementBlock as i, createElementVNode as r, toDisplayString as y, createBlock as k, createCommentVNode as E, createVNode as C } from "vue";
import "@iconify/vue";
import { define as V } from "@wippy-fe/proxy";
import { u as w, a as B, p as M, i as N, m as j } from "./useWidget-DkS779Qs.js";
import { _ as x, a as S } from "./ConfigFields.vue_vue_type_script_setup_true_lang-IIsRUPkM.js";
const $ = { class: "mm-stack" }, D = { class: "mm-field" }, P = {
  key: 0,
  class: "mm-hint"
}, R = {
  key: 2,
  class: "mm-hint"
}, U = /* @__PURE__ */ h({
  __name: "MemoryCreate",
  setup(z) {
    const u = w(), f = B(), t = m(() => M(u.value.config)), l = m(() => !!t.value.edit), p = m(() => N(t.value.config?.config_schema) ? t.value.config?.config_schema : {}), o = d("class:embed"), a = d({});
    b(t, (e) => {
      const { config_schema: c, ...v } = e.config || {};
      a.value = { ...v }, e.embedding_model && (o.value = e.embedding_model), s();
    }, { immediate: !0 });
    function s() {
      f("config-changed", { embedding_model: o.value, config: { ...a.value } });
    }
    function _(e) {
      o.value = e, s();
    }
    function g(e) {
      a.value = e, s();
    }
    return (e, c) => (n(), i("div", $, [
      r("div", D, [
        c[0] || (c[0] = r("span", { class: "mm-label" }, "Embedding model", -1)),
        l.value ? (n(), i("span", P, y(o.value) + " — fixed when the memory was created.", 1)) : (n(), k(x, {
          key: 1,
          value: o.value,
          capability: "embed",
          onSelect: _
        }, null, 8, ["value"])),
        l.value ? E("", !0) : (n(), i("span", R, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      C(S, {
        schema: p.value,
        "model-value": a.value,
        "onUpdate:modelValue": g
      }, null, 8, ["schema", "model-value"])
    ]));
  }
}), q = j(U, {
  type: "object",
  properties: {
    config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
  }
});
V(import.meta.url, q);
//# sourceMappingURL=memory_create.js.map
