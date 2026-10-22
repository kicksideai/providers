import { defineComponent as h, computed as m, ref as r, watch as b, openBlock as a, createElementBlock as i, createElementVNode as d, toDisplayString as y, createBlock as k, createCommentVNode as E, createVNode as V } from "vue";
import "@iconify/vue";
import { define as w } from "@wippy-fe/proxy";
import { u as C, a as N, m as B } from "./index-0-zpYODo.js";
import { i as M, _ as S, a as j } from "./memoryTypes-B2QaFCPR.js";
const x = { class: "mm-stack" }, $ = { class: "mm-field" }, D = {
  key: 0,
  class: "mm-hint"
}, J = {
  key: 2,
  class: "mm-hint"
}, O = /* @__PURE__ */ h({
  __name: "MemoryCreate",
  setup(R) {
    const u = C(), f = N(), t = m(() => {
      const e = u.value.config;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    }), l = m(() => !!t.value.edit), p = m(() => M(t.value.config?.config_schema) ? t.value.config?.config_schema : {}), o = r("class:embed"), n = r({});
    b(t, (e) => {
      const { config_schema: s, ...v } = e.config || {};
      n.value = { ...v }, e.embedding_model && (o.value = e.embedding_model), c();
    }, { immediate: !0 });
    function c() {
      f("config-changed", { embedding_model: o.value, config: { ...n.value } });
    }
    function _(e) {
      o.value = e, c();
    }
    function g(e) {
      n.value = e, c();
    }
    return (e, s) => (a(), i("div", x, [
      d("div", $, [
        s[0] || (s[0] = d("span", { class: "mm-label" }, "Embedding model", -1)),
        l.value ? (a(), i("span", D, y(o.value) + " — fixed when the memory was created.", 1)) : (a(), k(S, {
          key: 1,
          value: o.value,
          capability: "embed",
          onSelect: _
        }, null, 8, ["value"])),
        l.value ? E("", !0) : (a(), i("span", J, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      V(j, {
        schema: p.value,
        "model-value": n.value,
        "onUpdate:modelValue": g
      }, null, 8, ["schema", "model-value"])
    ]));
  }
}), P = B(O, {
  type: "object",
  properties: {
    config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
  }
});
w(import.meta.url, P);
//# sourceMappingURL=memory_create.js.map
