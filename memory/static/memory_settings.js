import { defineComponent as I, ref as m, watch as h, openBlock as a, createElementBlock as r, createElementVNode as n, createVNode as u, unref as o, toDisplayString as d, createCommentVNode as c, Fragment as w, renderList as $, normalizeClass as j, createTextVNode as _ } from "vue";
import { Icon as b } from "@iconify/vue";
import { api as U, define as F } from "@wippy-fe/proxy";
import { u as K, a as O, b as P, i as x, e as q, m as B } from "./types-BgQdoNlH.js";
import { s as D } from "./index-DTqhJDJU.js";
import { u as L, _ as z } from "./useMemory-D2I9oK1I.js";
const A = { class: "mm-trait" }, Y = { class: "mm-field" }, G = {
  key: 0,
  class: "kx-notice error"
}, H = {
  key: 1,
  class: "kx-notice warn"
}, J = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, Q = ["aria-checked", "onClick"], W = { class: "mm-choice-ic" }, X = { class: "mm-choice-main" }, Z = { class: "mm-choice-t" }, ee = {
  key: 0,
  class: "mm-choice-s"
}, te = {
  key: 0,
  class: "mm-choice-empty"
}, oe = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, se = {
  key: 2,
  class: "mm-choice-empty"
}, ne = ["disabled"], ae = { class: "mm-toggle" }, re = /* @__PURE__ */ I({
  __name: "MemorySettings",
  setup(ue) {
    const M = ["read_enabled", "recall_limit"], N = K(), R = O(), l = m(""), p = m(!0), C = m({}), f = m(""), v = m("");
    let V;
    h(f, (s) => {
      clearTimeout(V), V = setTimeout(() => {
        v.value = s.trim();
      }, 250);
    }), h(() => N.value.config, (s) => {
      const e = P(s);
      l.value = String(e.memory_id || ""), p.value = e.write_enabled !== !1, C.value = Object.fromEntries(Object.entries(e).filter(([t]) => M.includes(t)));
    }, { immediate: !0, deep: !0 });
    const S = m(0), i = L(() => `/api/v1/memory?limit=20${v.value ? `&q=${encodeURIComponent(v.value)}` : ""}`, "items", S), g = m(null), k = m(!1), y = m("");
    h(l, async (s) => {
      if (g.value = null, y.value = "", !!s) {
        k.value = !0;
        try {
          const { data: e } = await U.get(`/api/v1/knowledge/${encodeURIComponent(s)}`);
          if (s !== l.value) return;
          g.value = x(e) && e.kb_type === "memory" ? { id: s, name: String(e.name || "") } : null;
        } catch (e) {
          const t = x(e) && x(e.response) ? e.response.status : 0;
          s === l.value && t !== 404 && t !== 403 && (y.value = q(e));
        } finally {
          s === l.value && (k.value = !1);
        }
      }
    }, { immediate: !0 });
    function E() {
      R("config-changed", { context: { ...C.value, memory_id: l.value, write_enabled: p.value } });
    }
    function T(s) {
      l.value = s.id, E();
    }
    return (s, e) => (a(), r("div", A, [
      n("div", Y, [
        e[5] || (e[5] = n("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[6] || (e[6] = n("span", { class: "mm-hint" }, "The agent remembers into this memory and recalls from it. Models, limits and cadence are set on the memory.", -1)),
        y.value ? (a(), r("div", G, [
          u(o(b), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          n("span", null, d(y.value), 1)
        ])) : l.value && !g.value && !k.value ? (a(), r("div", H, [
          u(o(b), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[3] || (e[3] = n("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : c("", !0),
        u(z, {
          modelValue: f.value,
          "onUpdate:modelValue": e[0] || (e[0] = (t) => f.value = t),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        n("div", J, [
          (a(!0), r(w, null, $(o(i).rows.value, (t) => (a(), r("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: j(["mm-choice", { on: t.id === l.value }]),
            "aria-checked": t.id === l.value,
            onClick: (de) => T(t)
          }, [
            n("span", W, [
              u(o(b), {
                icon: t.id === l.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            n("span", X, [
              n("span", Z, d(t.name), 1),
              t.description || t.item_count !== void 0 ? (a(), r("span", ee, [
                _(d(t.description), 1),
                t.description && t.item_count !== void 0 ? (a(), r(w, { key: 0 }, [
                  _(" · ")
                ], 64)) : c("", !0),
                t.item_count !== void 0 ? (a(), r(w, { key: 1 }, [
                  _(d(t.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 10, Q))), 128)),
          o(i).loading.value && !o(i).rows.value.length ? (a(), r("div", te, [
            u(o(b), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[4] || (e[4] = _("Loading memories…", -1))
          ])) : o(i).error.value ? (a(), r("div", oe, d(o(i).error.value), 1)) : o(i).rows.value.length ? c("", !0) : (a(), r("div", se, d(v.value ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        o(i).next.value !== null ? (a(), r("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: o(i).loading.value,
          onClick: e[1] || (e[1] = //@ts-ignore
          (...t) => o(i).more && o(i).more(...t))
        }, "Show more", 8, ne)) : c("", !0)
      ]),
      n("div", ae, [
        e[7] || (e[7] = n("span", { class: "mm-field" }, [
          n("span", { class: "mm-label" }, "Remember conversations"),
          n("span", { class: "mm-hint" }, "Off keeps the memory read-only for this agent: it recalls but learns nothing new.")
        ], -1)),
        u(o(D), {
          modelValue: p.value,
          "onUpdate:modelValue": [
            e[2] || (e[2] = (t) => p.value = t),
            E
          ],
          "aria-label": "Remember conversations"
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), le = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id, write_enabled, read_enabled, recall_limit }.", default: {} } } } }, ie = {
  wippy: le
}, me = B(re, ie.wippy.props);
F(import.meta.url, me);
//# sourceMappingURL=memory_settings.js.map
