import { defineComponent as v, ref as l, computed as g, watch as w, openBlock as m, createElementBlock as p, createElementVNode as o, unref as r, createBlock as C, withCtx as E, createTextVNode as h, toDisplayString as V, createCommentVNode as x, createVNode as A } from "vue";
import "@iconify/vue";
import { define as N } from "@wippy-fe/proxy";
import { u as S, a as j, b as M, p as R, s as B, c as D, e as K, m as O } from "./useWidget-J59kHsf7.js";
const P = { class: "mm-stack" }, T = { class: "mm-field" }, I = ["config"], z = { class: "mm-toggle" }, J = /* @__PURE__ */ v({
  __name: "knowledge-memory",
  setup($) {
    const u = ["read_enabled", "recall_limit"], _ = S(), b = j(), i = l(""), s = l(!0), d = l({}), n = M("wc-kb-picker"), k = g(() => JSON.stringify({ kb_ids: i.value ? [i.value] : [] }));
    w(() => _.value.config, (a) => {
      const e = R(a), t = Array.isArray(e.kb_ids) ? e.kb_ids : [];
      i.value = String(e.memory_id || e.write_kb_id || t[0] || ""), s.value = e.write_enabled !== !1, d.value = Object.fromEntries(Object.entries(e).filter(([f]) => u.includes(f)));
    }, { immediate: !0, deep: !0 });
    function c() {
      b("config-changed", { context: { ...d.value, memory_id: i.value, write_enabled: s.value } });
    }
    function y(a) {
      const e = K(a).kb_ids, t = Array.isArray(e) ? e : [];
      i.value = String(t[t.length - 1] || ""), c();
    }
    return (a, e) => (m(), p("div", P, [
      o("div", T, [
        e[1] || (e[1] = o("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        r(n).ready.value ? (m(), p("wc-kb-picker", {
          key: 0,
          "aria-labelledby": "trait_memory",
          config: k.value,
          onConfigChanged: y
        }, null, 40, I)) : r(n).failed.value ? (m(), C(r(B), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: E(() => [
            h("The knowledge base picker could not load: " + V(r(n).failed.value), 1)
          ]),
          _: 1
        })) : x("", !0),
        e[2] || (e[2] = o("span", { class: "mm-hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      o("div", z, [
        e[3] || (e[3] = o("span", { class: "mm-label" }, "Remember conversations", -1)),
        A(r(D), {
          modelValue: s.value,
          "onUpdate:modelValue": [
            e[0] || (e[0] = (t) => s.value = t),
            c
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), U = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_id, write_enabled, read_enabled, recall_limit }; earlier kb_ids and write_kb_id are read when memory_id is empty.", default: {} } } } }, W = {
  wippy: U
}, Y = O(J, W.wippy.props);
N(import.meta.url, Y);
//# sourceMappingURL=index.js.map
