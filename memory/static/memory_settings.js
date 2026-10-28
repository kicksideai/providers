import { defineComponent as U, ref as m, watch as x, onUnmounted as $, openBlock as r, createElementBlock as n, toDisplayString as u, createElementVNode as s, createVNode as d, unref as o, createCommentVNode as c, Fragment as C, renderList as j, normalizeClass as L, createTextVNode as f } from "vue";
import { Icon as b } from "@iconify/vue";
import { api as F, define as K } from "@wippy-fe/proxy";
import { u as O, a as P, b as q, e as M, i as B, m as D } from "./types-yNEBYydW.js";
import { s as z } from "./index-Bu08HCpl.js";
import { u as A, _ as Y } from "./useMemory-DLBqiJmH.js";
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
}, Z = ["aria-checked", "onClick"], ee = { class: "mm-choice-ic" }, te = { class: "mm-choice-main" }, oe = { class: "mm-choice-t" }, ae = {
  key: 0,
  class: "mm-choice-s"
}, re = {
  key: 0,
  class: "mm-choice-empty"
}, ne = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, se = {
  key: 2,
  class: "mm-choice-empty"
}, le = ["disabled"], ie = { class: "mm-toggle" }, me = /* @__PURE__ */ U({
  __name: "MemorySettings",
  setup(pe) {
    const N = ["read_enabled", "recall_limit"], S = O(), T = P(), l = m(""), p = m(!0), E = m({}), v = m(""), k = m(""), y = m("");
    let g;
    x(k, (a) => {
      clearTimeout(g), g = setTimeout(() => {
        y.value = a.trim();
      }, 250);
    }), $(() => clearTimeout(g)), x(() => S.value.config, (a) => {
      try {
        const e = q(a);
        l.value = String(e.memory_id || ""), p.value = e.write_enabled !== !1, E.value = Object.fromEntries(Object.entries(e).filter(([t]) => N.includes(t))), v.value = "";
      } catch (e) {
        v.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const I = m(0), i = A(() => `/api/v1/memory?limit=20${y.value ? `&q=${encodeURIComponent(y.value)}` : ""}`, "items", I), h = m(null), w = m(!1), _ = m("");
    x(l, async (a) => {
      if (h.value = null, _.value = "", !!a) {
        w.value = !0;
        try {
          const { data: e } = await F.get(`/api/v1/knowledge/${encodeURIComponent(a)}`);
          if (a !== l.value) return;
          if (!B(e) || e.kb_type !== "memory" || typeof e.name != "string") throw new Error("Selected resource is not a memory");
          h.value = { id: a, name: e.name };
        } catch (e) {
          a === l.value && (_.value = M(e));
        } finally {
          a === l.value && (w.value = !1);
        }
      }
    }, { immediate: !0 });
    function V() {
      T("config-changed", { context: { ...E.value, memory_id: l.value, write_enabled: p.value } });
    }
    function R(a) {
      l.value = a.id, V();
    }
    return (a, e) => v.value ? (r(), n("div", G, u(v.value), 1)) : (r(), n("div", H, [
      s("div", J, [
        e[5] || (e[5] = s("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[6] || (e[6] = s("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits and cadence are set on the memory.", -1)),
        _.value ? (r(), n("div", Q, [
          d(o(b), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          s("span", null, u(_.value), 1)
        ])) : l.value && !h.value && !w.value ? (r(), n("div", W, [
          d(o(b), {
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
          (r(!0), n(C, null, j(o(i).rows.value, (t) => (r(), n("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: L(["mm-choice", { on: t.id === l.value }]),
            "aria-checked": t.id === l.value,
            onClick: (ve) => R(t)
          }, [
            s("span", ee, [
              d(o(b), {
                icon: t.id === l.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            s("span", te, [
              s("span", oe, u(t.name), 1),
              t.description || t.item_count !== void 0 ? (r(), n("span", ae, [
                f(u(t.description), 1),
                t.description && t.item_count !== void 0 ? (r(), n(C, { key: 0 }, [
                  f(" · ")
                ], 64)) : c("", !0),
                t.item_count !== void 0 ? (r(), n(C, { key: 1 }, [
                  f(u(t.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 10, Z))), 128)),
          o(i).loading.value && !o(i).rows.value.length ? (r(), n("div", re, [
            d(o(b), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[4] || (e[4] = f("Loading memories…", -1))
          ])) : o(i).error.value ? (r(), n("div", ne, u(o(i).error.value), 1)) : o(i).rows.value.length ? c("", !0) : (r(), n("div", se, u(y.value ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        o(i).next.value !== null ? (r(), n("button", {
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
          s("span", { class: "mm-label" }, "Learn from conversations"),
          s("span", { class: "mm-hint" }, "Off keeps the memory read-only for this agent: it recalls but learns nothing new.")
        ], -1)),
        d(o(z), {
          modelValue: p.value,
          "onUpdate:modelValue": [
            e[2] || (e[2] = (t) => p.value = t),
            V
          ],
          "aria-label": "Learn from conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), ue = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id, write_enabled, read_enabled, recall_limit }.", default: {} } } } }, de = {
  wippy: ue
}, ce = D(me, de.wippy.props);
K(import.meta.url, ce);
//# sourceMappingURL=memory_settings.js.map
