import { defineComponent as b, ref as l, computed as v, watch as g, openBlock as m, createElementBlock as p, createElementVNode as i, unref as r, createBlock as w, withCtx as C, createTextVNode as E, toDisplayString as h, createCommentVNode as V, createVNode as x } from "vue";
import "@iconify/vue";
import { define as N } from "@wippy-fe/proxy";
import { u as S, p as j, s as M, a as R, e as A, m as B } from "./useWidget-DS0_L3EF.js";
import { u as D, a as K } from "./index-CyCydJaQ.js";
const O = { class: "mm-stack" }, P = { class: "mm-field" }, T = ["config"], I = { class: "mm-toggle" }, z = /* @__PURE__ */ b({
  __name: "knowledge-memory",
  setup(Y) {
    const u = ["read_enabled", "recall_limit"], f = D(), _ = K(), o = l(""), a = l(!0), d = l({}), n = S("wc-kb-picker"), y = v(() => JSON.stringify({ kb_ids: o.value ? [o.value] : [] }));
    g(() => f.value.config, (s) => {
      const e = j(s);
      o.value = String(e.memory_id || ""), a.value = e.write_enabled !== !1, d.value = Object.fromEntries(Object.entries(e).filter(([t]) => u.includes(t)));
    }, { immediate: !0, deep: !0 });
    function c() {
      _("config-changed", { context: { ...d.value, memory_id: o.value, write_enabled: a.value } });
    }
    function k(s) {
      const e = A(s).kb_ids, t = Array.isArray(e) ? e : [];
      o.value = String(t[t.length - 1] || ""), c();
    }
    return (s, e) => (m(), p("div", O, [
      i("div", P, [
        e[1] || (e[1] = i("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        r(n).ready.value ? (m(), p("wc-kb-picker", {
          key: 0,
          "aria-labelledby": "trait_memory",
          config: y.value,
          onConfigChanged: k
        }, null, 40, T)) : r(n).failed.value ? (m(), w(r(M), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: C(() => [
            E("The knowledge base picker could not load: " + h(r(n).failed.value), 1)
          ]),
          _: 1
        })) : V("", !0),
        e[2] || (e[2] = i("span", { class: "mm-hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      i("div", I, [
        e[3] || (e[3] = i("span", { class: "mm-label" }, "Remember conversations", -1)),
        x(r(R), {
          modelValue: a.value,
          "onUpdate:modelValue": [
            e[0] || (e[0] = (t) => a.value = t),
            c
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), J = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_id, write_enabled, read_enabled, recall_limit }; earlier kb_ids and write_kb_id are read when memory_id is empty.", default: {} } } } }, U = {
  wippy: J
}, W = B(z, U.wippy.props);
N(import.meta.url, W);
//# sourceMappingURL=index.js.map
