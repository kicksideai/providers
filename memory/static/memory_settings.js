import { defineComponent as U, ref as m, watch as x, onUnmounted as $, openBlock as n, createElementBlock as a, toDisplayString as u, createElementVNode as s, createVNode as d, unref as o, createCommentVNode as c, Fragment as C, renderList as j, normalizeClass as F, createTextVNode as b } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as K, define as O } from "@wippy-fe/proxy";
import { u as P, a as q, b as B, e as M, i as D, m as L } from "./types-cXMhssjU.js";
import { s as z } from "./index-DqZ-un-l.js";
import { u as A, _ as Y } from "./useMemory-BkOJCZoy.js";
const G = {
  key: 0,
  class: "kx-notice error"
}, H = {
  key: 1,
  class: "mm-trait"
}, J = { class: "mm-field" }, Q = {
  key: 0,
  class: "kx-notice error"
}, W = {
  key: 1,
  class: "kx-notice warn"
}, X = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, Z = ["aria-checked", "onClick"], ee = { class: "mm-choice-ic" }, te = { class: "mm-choice-main" }, oe = { class: "mm-choice-t" }, re = {
  key: 0,
  class: "mm-choice-s"
}, ne = {
  key: 0,
  class: "mm-choice-empty"
}, ae = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, se = {
  key: 2,
  class: "mm-choice-empty"
}, le = ["disabled"], ie = { class: "mm-toggle" }, me = /* @__PURE__ */ U({
  __name: "MemorySettings",
  setup(pe) {
    const N = ["read_enabled", "recall_limit"], R = P(), S = q(), l = m(""), p = m(!0), E = m({}), v = m(""), k = m(""), y = m("");
    let g;
    x(k, (r) => {
      clearTimeout(g), g = setTimeout(() => {
        y.value = r.trim();
      }, 250);
    }), $(() => clearTimeout(g)), x(() => R.value.config, (r) => {
      try {
        const e = B(r);
        l.value = String(e.memory_id || ""), p.value = e.write_enabled !== !1, E.value = Object.fromEntries(Object.entries(e).filter(([t]) => N.includes(t))), v.value = "";
      } catch (e) {
        v.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const T = m(0), i = A(() => `/api/v1/memory?limit=20${y.value ? `&q=${encodeURIComponent(y.value)}` : ""}`, "items", T), h = m(null), w = m(!1), _ = m("");
    x(l, async (r) => {
      if (h.value = null, _.value = "", !!r) {
        w.value = !0;
        try {
          const { data: e } = await K.get(`/api/v1/knowledge/${encodeURIComponent(r)}`);
          if (r !== l.value) return;
          if (!D(e) || e.kb_type !== "memory" || typeof e.name != "string") throw new Error("Selected resource is not a memory");
          h.value = { id: r, name: e.name };
        } catch (e) {
          r === l.value && (_.value = M(e));
        } finally {
          r === l.value && (w.value = !1);
        }
      }
    }, { immediate: !0 });
    function V() {
      S("config-changed", { context: { ...E.value, memory_id: l.value, write_enabled: p.value } });
    }
    function I(r) {
      l.value = r.id, V();
    }
    return (r, e) => v.value ? (n(), a("div", G, u(v.value), 1)) : (n(), a("div", H, [
      s("div", J, [
        e[5] || (e[5] = s("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[6] || (e[6] = s("span", { class: "mm-hint" }, "The agent remembers into this memory and recalls from it. Models, limits and cadence are set on the memory.", -1)),
        _.value ? (n(), a("div", Q, [
          d(o(f), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          s("span", null, u(_.value), 1)
        ])) : l.value && !h.value && !w.value ? (n(), a("div", W, [
          d(o(f), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[3] || (e[3] = s("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : c("", !0),
        d(Y, {
          modelValue: k.value,
          "onUpdate:modelValue": e[0] || (e[0] = (t) => k.value = t),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        s("div", X, [
          (n(!0), a(C, null, j(o(i).rows.value, (t) => (n(), a("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: F(["mm-choice", { on: t.id === l.value }]),
            "aria-checked": t.id === l.value,
            onClick: (ve) => I(t)
          }, [
            s("span", ee, [
              d(o(f), {
                icon: t.id === l.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            s("span", te, [
              s("span", oe, u(t.name), 1),
              t.description || t.item_count !== void 0 ? (n(), a("span", re, [
                b(u(t.description), 1),
                t.description && t.item_count !== void 0 ? (n(), a(C, { key: 0 }, [
                  b(" · ")
                ], 64)) : c("", !0),
                t.item_count !== void 0 ? (n(), a(C, { key: 1 }, [
                  b(u(t.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 10, Z))), 128)),
          o(i).loading.value && !o(i).rows.value.length ? (n(), a("div", ne, [
            d(o(f), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[4] || (e[4] = b("Loading memories…", -1))
          ])) : o(i).error.value ? (n(), a("div", ae, u(o(i).error.value), 1)) : o(i).rows.value.length ? c("", !0) : (n(), a("div", se, u(y.value ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        o(i).next.value !== null ? (n(), a("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: o(i).loading.value,
          onClick: e[1] || (e[1] = //@ts-ignore
          (...t) => o(i).more && o(i).more(...t))
        }, "Show more", 8, le)) : c("", !0)
      ]),
      s("div", ie, [
        e[7] || (e[7] = s("span", { class: "mm-field" }, [
          s("span", { class: "mm-label" }, "Remember conversations"),
          s("span", { class: "mm-hint" }, "Off keeps the memory read-only for this agent: it recalls but learns nothing new.")
        ], -1)),
        d(o(z), {
          modelValue: p.value,
          "onUpdate:modelValue": [
            e[2] || (e[2] = (t) => p.value = t),
            V
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), ue = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id, write_enabled, read_enabled, recall_limit }.", default: {} } } } }, de = {
  wippy: ue
}, ce = L(me, de.wippy.props);
O(import.meta.url, ce);
//# sourceMappingURL=memory_settings.js.map
