import { defineComponent as g, ref as l, computed as v, watch as w, openBlock as d, createElementBlock as p, createElementVNode as s, unref as r, createBlock as C, withCtx as E, createTextVNode as h, toDisplayString as V, createCommentVNode as x, createVNode as A } from "vue";
import "@iconify/vue";
import { define as N } from "@wippy-fe/proxy";
import { u as R, a as S, b as j, p as M, s as B, c as K, i as O, m as P } from "./useWidget-DkS779Qs.js";
const T = { class: "mm-stack" }, D = { class: "mm-field" }, I = ["config"], z = { class: "mm-toggle" }, J = /* @__PURE__ */ g({
  __name: "knowledge-memory",
  setup($) {
    const u = ["read_enabled", "recall_limit"], _ = R(), f = S(), o = l(""), a = l(!0), m = l({}), n = j("wc-kb-picker"), k = v(() => JSON.stringify({ kb_ids: o.value ? [o.value] : [] }));
    w(() => _.value.config, (t) => {
      const e = M(t), i = Array.isArray(e.kb_ids) ? e.kb_ids : [];
      o.value = String(e.memory_id || e.write_kb_id || i[0] || ""), a.value = e.write_enabled !== !1, m.value = Object.fromEntries(Object.entries(e).filter(([y]) => u.includes(y)));
    }, { immediate: !0, deep: !0 });
    function c() {
      f("config-changed", { context: { ...m.value, memory_id: o.value, write_enabled: a.value } });
    }
    function b(t) {
      const e = t instanceof CustomEvent && O(t.detail) ? t.detail : {}, i = Array.isArray(e.kb_ids) ? e.kb_ids : [];
      o.value = String(i[i.length - 1] || ""), c();
    }
    return (t, e) => (d(), p("div", T, [
      s("div", D, [
        e[1] || (e[1] = s("span", { class: "mm-label" }, "Memory", -1)),
        r(n).ready.value ? (d(), p("wc-kb-picker", {
          key: 0,
          config: k.value,
          onConfigChanged: b
        }, null, 40, I)) : r(n).failed.value ? (d(), C(r(B), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: E(() => [
            h("The knowledge base picker could not load: " + V(r(n).failed.value), 1)
          ]),
          _: 1
        })) : x("", !0),
        e[2] || (e[2] = s("span", { class: "mm-hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      s("div", z, [
        e[3] || (e[3] = s("span", { class: "mm-label" }, "Remember conversations", -1)),
        A(r(K), {
          modelValue: a.value,
          "onUpdate:modelValue": [
            e[0] || (e[0] = (i) => a.value = i),
            c
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), U = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_id, write_enabled, read_enabled, recall_limit }; earlier kb_ids and write_kb_id are read when memory_id is empty.", default: {} } } } }, W = {
  wippy: U
}, Y = P(J, W.wippy.props);
N(import.meta.url, Y);
//# sourceMappingURL=index.js.map
