import { defineComponent as b, computed as c, ref as d, watch as h, openBlock as t, createElementBlock as i, createElementVNode as r, toDisplayString as y, createBlock as k, createCommentVNode as E, createVNode as C } from "vue";
import "@iconify/vue";
import { define as V } from "@wippy-fe/proxy";
import { u as w, a as B, m as M } from "./element-DWmSgOr-.js";
import { p as N, i as j, _ as x, a as S } from "./ConfigFields.vue_vue_type_script_setup_true_lang-ZBhJIuN_.js";
const $ = { class: "mm-stack" }, D = { class: "mm-field" }, P = {
  key: 0,
  class: "mm-hint"
}, R = {
  key: 2,
  class: "mm-hint"
}, U = /* @__PURE__ */ b({
  __name: "MemoryCreate",
  setup(z) {
    const u = w(), _ = B(), a = c(() => N(u.value.config)), l = c(() => !!a.value.edit), f = c(() => j(a.value.config?.config_schema) ? a.value.config?.config_schema : {}), o = d("class:embed"), n = d({});
    h(a, (e) => {
      const { config_schema: s, ...v } = e.config || {};
      n.value = { ...v }, e.embedding_model && (o.value = e.embedding_model), m();
    }, { immediate: !0 });
    function m() {
      _("config-changed", { embedding_model: o.value, config: { ...n.value } });
    }
    function p(e) {
      o.value = e, m();
    }
    function g(e) {
      n.value = e, m();
    }
    return (e, s) => (t(), i("div", $, [
      r("div", D, [
        s[0] || (s[0] = r("span", {
          id: "embedding_label",
          class: "mm-label"
        }, "Embedding model", -1)),
        l.value ? (t(), i("span", P, y(o.value) + " — fixed when the memory was created.", 1)) : (t(), k(x, {
          key: 1,
          "labelled-by": "embedding_label",
          value: o.value,
          capability: "embed",
          onSelect: p
        }, null, 8, ["value"])),
        l.value ? E("", !0) : (t(), i("span", R, "Vectors are 512-dimensional; the model cannot change later."))
      ]),
      C(S, {
        schema: f.value,
        "model-value": n.value,
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
