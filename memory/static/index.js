import { defineComponent as x, ref as i, computed as C, watch as A, onMounted as N, openBlock as d, createElementBlock as y, createElementVNode as s, createBlock as S, unref as f, withCtx as V, createTextVNode as M, toDisplayString as j, createCommentVNode as R, createVNode as B } from "vue";
import "@iconify/vue";
import { loadByTagName as O, define as T } from "@wippy-fe/proxy";
import { u as I, a as K, s as P, b as D, m as J } from "./index-0-zpYODo.js";
const z = { class: "mm-stack" }, U = { class: "mm-field" }, Y = ["config"], $ = { class: "mm-toggle" }, q = /* @__PURE__ */ x({
  __name: "knowledge-memory",
  setup(L) {
    const k = ["read_enabled", "recall_limit"], _ = I(), b = K(), n = i(""), a = i(!0), p = i({}), l = i(!!customElements.get("wc-kb-picker")), c = i(""), g = C(() => JSON.stringify({ kb_ids: n.value ? [n.value] : [] }));
    function m(e) {
      return e && typeof e == "object" && !Array.isArray(e) ? e : {};
    }
    function v(e) {
      let t = e;
      if (typeof e == "string")
        try {
          t = JSON.parse(e);
        } catch {
          return;
        }
      const r = m(t), o = { ...m(r.context), ...r };
      delete o.context, delete o.agent_options;
      const E = Array.isArray(o.kb_ids) ? o.kb_ids : [];
      n.value = String(o.memory_id || o.write_kb_id || E[0] || ""), a.value = o.write_enabled !== !1, p.value = Object.fromEntries(Object.entries(o).filter(([h]) => k.includes(h)));
    }
    function u() {
      b("config-changed", { context: { ...p.value, memory_id: n.value, write_enabled: a.value } });
    }
    function w(e) {
      const t = m(e instanceof CustomEvent ? e.detail : void 0), r = Array.isArray(t.kb_ids) ? t.kb_ids : [];
      n.value = String(r[r.length - 1] || ""), u();
    }
    return A(() => _.value.config, v, { immediate: !0, deep: !0 }), N(async () => {
      if (!l.value)
        try {
          await O("wc-kb-picker", { timeoutMs: 8e3 }), l.value = !0;
        } catch (e) {
          c.value = e instanceof Error ? e.message : String(e);
        }
    }), (e, t) => (d(), y("div", z, [
      s("div", U, [
        t[1] || (t[1] = s("span", { class: "mm-label" }, "Memory", -1)),
        l.value ? (d(), y("wc-kb-picker", {
          key: 0,
          config: g.value,
          onConfigChanged: w
        }, null, 40, Y)) : c.value ? (d(), S(f(P), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: V(() => [
            M("The knowledge base picker could not load: " + j(c.value), 1)
          ]),
          _: 1
        })) : R("", !0),
        t[2] || (t[2] = s("span", { class: "mm-hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      s("div", $, [
        t[3] || (t[3] = s("span", { class: "mm-label" }, "Remember conversations", -1)),
        B(f(D), {
          modelValue: a.value,
          "onUpdate:modelValue": [
            t[0] || (t[0] = (r) => a.value = r),
            u
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), F = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_id, write_enabled, read_enabled, recall_limit }; earlier kb_ids and write_kb_id are read when memory_id is empty.", default: {} } } } }, G = {
  wippy: F
}, H = J(q, G.wippy.props);
T(import.meta.url, H);
//# sourceMappingURL=index.js.map
