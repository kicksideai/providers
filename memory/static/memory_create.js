import { defineComponent as b, computed as s, ref as d, watch as h, openBlock as n, createElementBlock as c, createElementVNode as r, toDisplayString as y, createBlock as k, createCommentVNode as E, createVNode as C } from "vue";
import "@iconify/vue";
import { define as V } from "@wippy-fe/proxy";
import { p as w, i as B, m as M } from "./useWidget-DS0_L3EF.js";
import { u as N, a as j } from "./index-CyCydJaQ.js";
import { _ as x, a as S } from "./ConfigFields.vue_vue_type_script_setup_true_lang-CiCV5rcW.js";
const $ = { class: "mm-stack" }, D = { class: "mm-field" }, P = {
  key: 0,
  class: "mm-hint"
}, R = {
  key: 2,
  class: "mm-hint"
}, U = /* @__PURE__ */ b({
  __name: "MemoryCreate",
  setup(z) {
    const u = N(), f = j(), a = s(() => w(u.value.config)), l = s(() => !!a.value.edit), p = s(() => B(a.value.config?.config_schema) ? a.value.config?.config_schema : {}), o = d("class:embed"), t = d({});
    h(a, (e) => {
      const { config_schema: i, ...v } = e.config || {};
      t.value = { ...v }, e.embedding_model && (o.value = e.embedding_model), m();
    }, { immediate: !0 });
    function m() {
      f("config-changed", { embedding_model: o.value, config: { ...t.value } });
    }
    function _(e) {
      o.value = e, m();
    }
    function g(e) {
      t.value = e, m();
    }
    return (e, i) => (n(), c("div", $, [
      r("div", D, [
        i[0] || (i[0] = r("span", {
          id: "embedding_label",
          class: "mm-label"
        }, "Embedding model", -1)),
        l.value ? (n(), c("span", P, y(o.value) + " — fixed when the memory was created.", 1)) : (n(), k(x, {
          key: 1,
          "labelled-by": "embedding_label",
          value: o.value,
          capability: "embed",
          onSelect: _
        }, null, 8, ["value"])),
        l.value ? E("", !0) : (n(), c("span", R, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      C(S, {
        schema: p.value,
        "model-value": t.value,
        "onUpdate:modelValue": g
      }, null, 8, ["schema", "model-value"])
    ]));
  }
}), q = M(U, {
  type: "object",
  properties: {
    config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
  }
});
V(import.meta.url, q);
//# sourceMappingURL=memory_create.js.map
