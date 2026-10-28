import { defineComponent as q, ref as m, watch as N, computed as A, openBlock as a, createElementBlock as n, toDisplayString as u, createElementVNode as l, createVNode as p, unref as r, createCommentVNode as c, Fragment as w, renderList as F, normalizeClass as I, createTextVNode as f } from "vue";
import { Icon as h } from "@iconify/vue";
import { define as L } from "@wippy-fe/proxy";
import { u as P, a as T, b as U, e as x, m as j } from "./types-CkAlvrJt.js";
import { u as B, a as z, r as R, h as G, _ as H } from "./usePaged-DiPI-biL.js";
const J = {
  key: 0,
  class: "kx-notice error"
}, O = {
  key: 1,
  class: "mm-trait"
}, Q = { class: "mm-field" }, W = {
  key: 0,
  class: "kx-notice error"
}, X = {
  key: 1,
  class: "kx-notice warn"
}, Y = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, Z = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], ee = { class: "mm-choice-ic" }, oe = { class: "mm-choice-main" }, te = { class: "mm-choice-t" }, re = {
  key: 0,
  class: "mm-choice-s"
}, ae = {
  key: 0,
  class: "mm-choice-empty"
}, ne = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, se = {
  key: 2,
  class: "mm-choice-empty"
}, ie = ["disabled"], le = /* @__PURE__ */ q({
  __name: "MemorySettings",
  setup(de) {
    const V = P(), D = T(), s = m(""), v = m(""), k = m(""), b = B(k, 250, (t) => t.trim());
    N(() => V.value.config, (t) => {
      try {
        const e = U(t);
        s.value = typeof e.memory_id == "string" ? e.memory_id : "", v.value = "";
      } catch (e) {
        v.value = x(e);
      }
    }, { immediate: !0, deep: !0 });
    const i = z(() => `/api/v1/memory?limit=20${b.value ? `&q=${encodeURIComponent(b.value)}` : ""}`, "items"), C = m(null), M = m(!1), y = m(""), g = m(!1);
    N(s, async (t) => {
      if (C.value = null, y.value = "", g.value = !1, !!t) {
        M.value = !0;
        try {
          const e = await R(t);
          if (t !== s.value) return;
          C.value = e;
        } catch (e) {
          t === s.value && ([403, 404].includes(G(e) ?? 0) || x(e) === "Selected resource is not a memory" ? g.value = !0 : y.value = x(e));
        } finally {
          t === s.value && (M.value = !1);
        }
      }
    }, { immediate: !0 });
    function K() {
      D("config-changed", { context: { memory_id: s.value } });
    }
    const _ = A(() => i.rows.value);
    function $(t, e) {
      if (!["ArrowDown", "ArrowUp"].includes(t.key) || !_.value.length) return;
      t.preventDefault();
      const o = t.key === "ArrowDown" ? 1 : -1, d = _.value[(e + o + _.value.length) % _.value.length];
      S(d), requestAnimationFrame(() => document.querySelector(`[data-memory-choice="${CSS.escape(d.id)}"]`)?.focus());
    }
    function S(t) {
      s.value = t.id, K();
    }
    return (t, e) => v.value ? (a(), n("div", J, u(v.value), 1)) : (a(), n("div", O, [
      l("div", Q, [
        e[4] || (e[4] = l("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[5] || (e[5] = l("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits and cadence are set on the memory.", -1)),
        y.value ? (a(), n("div", W, [
          p(r(h), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          l("span", null, u(y.value), 1)
        ])) : g.value ? (a(), n("div", X, [
          p(r(h), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[2] || (e[2] = l("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : c("", !0),
        p(H, {
          modelValue: k.value,
          "onUpdate:modelValue": e[0] || (e[0] = (o) => k.value = o),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        l("div", Y, [
          (a(!0), n(w, null, F(r(i).rows.value, (o, d) => (a(), n("button", {
            key: o.id,
            type: "button",
            role: "radio",
            class: I(["mm-choice", { on: o.id === s.value }]),
            "data-memory-choice": o.id,
            "aria-checked": o.id === s.value,
            tabindex: o.id === s.value || !s.value && d === 0 ? 0 : -1,
            onClick: (E) => S(o),
            onKeydown: (E) => $(E, d)
          }, [
            l("span", ee, [
              p(r(h), {
                icon: o.id === s.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            l("span", oe, [
              l("span", te, u(o.name), 1),
              o.description || o.item_count !== void 0 ? (a(), n("span", re, [
                f(u(o.description), 1),
                o.description && o.item_count !== void 0 ? (a(), n(w, { key: 0 }, [
                  f(" · ")
                ], 64)) : c("", !0),
                o.item_count !== void 0 ? (a(), n(w, { key: 1 }, [
                  f(u(o.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 42, Z))), 128)),
          r(i).loading.value && !r(i).rows.value.length ? (a(), n("div", ae, [
            p(r(h), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[3] || (e[3] = f("Loading memories…", -1))
          ])) : r(i).error.value ? (a(), n("div", ne, u(r(i).error.value), 1)) : r(i).rows.value.length ? c("", !0) : (a(), n("div", se, u(r(b) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        r(i).next.value !== null ? (a(), n("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: r(i).loading.value,
          onClick: e[1] || (e[1] = //@ts-ignore
          (...o) => r(i).more && r(i).more(...o))
        }, "Show more", 8, ie)) : c("", !0)
      ])
    ]));
  }
}), me = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, ue = {
  wippy: me
}, ce = j(le, ue.wippy.props);
L(import.meta.url, ce);
//# sourceMappingURL=memory_settings.js.map
