import { defineComponent as k, ref as l, computed as _, watch as v, openBlock as m, createElementBlock as p, createElementVNode as i, unref as r, createBlock as w, withCtx as C, createTextVNode as E, toDisplayString as h, createCommentVNode as x, createVNode as V } from "vue";
import "@iconify/vue";
import { define as S } from "@wippy-fe/proxy";
import { u as M, a as N, b as j, p as R, s as A, c as B, e as D, m as K } from "./useWidget-Oapw5JdO.js";
const O = { class: "mm-stack" }, P = { class: "mm-field" }, T = ["config"], I = { class: "mm-toggle" }, z = /* @__PURE__ */ k({
  __name: "knowledge-memory",
  setup(Y) {
    const u = ["read_enabled", "recall_limit"], y = M(), f = N(), o = l(""), a = l(!0), c = l({}), s = j("wc-kb-picker"), g = _(() => JSON.stringify({ kb_ids: o.value ? [o.value] : [] }));
    v(() => y.value.config, (n) => {
      const e = R(n);
      o.value = String(e.memory_id || ""), a.value = e.write_enabled !== !1, c.value = Object.fromEntries(Object.entries(e).filter(([t]) => u.includes(t)));
    }, { immediate: !0, deep: !0 });
    function d() {
      f("config-changed", { context: { ...c.value, memory_id: o.value, write_enabled: a.value } });
    }
    function b(n) {
      const e = D(n).kb_ids, t = Array.isArray(e) ? e : [];
      o.value = String(t[t.length - 1] || ""), d();
    }
    return (n, e) => (m(), p("div", O, [
      i("div", P, [
        e[1] || (e[1] = i("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        r(s).ready.value ? (m(), p("wc-kb-picker", {
          key: 0,
          "aria-labelledby": "trait_memory",
          config: g.value,
          onConfigChanged: b
        }, null, 40, T)) : r(s).failed.value ? (m(), w(r(A), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: C(() => [
            E("The knowledge base picker could not load: " + h(r(s).failed.value), 1)
          ]),
          _: 1
        })) : x("", !0),
        e[2] || (e[2] = i("span", { class: "mm-hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      i("div", I, [
        e[3] || (e[3] = i("span", { class: "mm-label" }, "Remember conversations", -1)),
        V(r(B), {
          modelValue: a.value,
          "onUpdate:modelValue": [
            e[0] || (e[0] = (t) => a.value = t),
            d
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), J = { props: { type: "object", properties: { config: { type: "object", description: "Typed Memory trait context { memory_id, write_enabled, read_enabled, recall_limit }. Select memory_id explicitly; document-backed agents retain their original separate settings.", default: {} } } } }, U = {
  wippy: J
}, W = K(z, U.wippy.props);
S(import.meta.url, W);
//# sourceMappingURL=index.js.map
