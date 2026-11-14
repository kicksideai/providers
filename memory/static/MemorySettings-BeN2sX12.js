import { defineComponent as T, ref as d, watch as D, computed as A, openBlock as a, createElementBlock as n, toDisplayString as m, createElementVNode as r, withDirectives as I, vModelCheckbox as L, createVNode as y, unref as s, createCommentVNode as c, Fragment as C, renderList as F, normalizeClass as P, createTextVNode as k } from "vue";
import { Icon as b } from "@iconify/vue";
import { a as U, u as q } from "./wc-runtime-KO3cNuNo.js";
import { u as B, a as $, r as z, h as R, _ as j, l as G } from "./usePaged-DWrKufE-.js";
import { p as H, e as M } from "./types-DQ01_s6c.js";
const J = {
  key: 0,
  class: "kx-notice error"
}, O = {
  key: 1,
  class: "mm-trait"
}, Q = { class: "mm-toggle" }, W = { class: "mm-field" }, X = {
  key: 0,
  class: "kx-notice error"
}, Y = {
  key: 1,
  class: "kx-notice warn"
}, Z = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, ee = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], oe = { class: "mm-choice-ic" }, te = { class: "mm-choice-main" }, se = { class: "mm-choice-t" }, ae = {
  key: 0,
  class: "mm-choice-s"
}, ne = {
  key: 0,
  class: "mm-choice-empty"
}, re = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, le = {
  key: 2,
  class: "mm-choice-empty"
}, ie = ["disabled"], pe = /* @__PURE__ */ T({
  __name: "MemorySettings",
  setup(me) {
    const E = U(), S = q(), i = d(""), p = d(!1), f = d(""), g = d(""), w = B(g, 250, (t) => t.trim());
    D(() => E.value.config, (t) => {
      try {
        const e = H(t);
        i.value = typeof e.memory_id == "string" ? e.memory_id : "", p.value = e.learn_in_isolation === !0, f.value = "";
      } catch (e) {
        f.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const l = $(() => w.value, (t) => G(w.value, t)), h = d(""), x = d(!1);
    D(i, async (t) => {
      if (h.value = "", x.value = !1, !!t)
        try {
          if (await z(t), t !== i.value) return;
        } catch (e) {
          t === i.value && ([403, 404].includes(R(e) ?? 0) || M(e) === "Selected resource is not a memory" ? x.value = !0 : h.value = M(e));
        }
    }, { immediate: !0 });
    function V() {
      S("config-changed", { context: { memory_id: i.value, learn_in_isolation: p.value } });
    }
    const u = A(() => l.rows.value);
    function K(t, e) {
      if (!["ArrowDown", "ArrowUp"].includes(t.key) || !u.value.length) return;
      t.preventDefault();
      const o = t.key === "ArrowDown" ? 1 : -1, _ = u.value[(e + o + u.value.length) % u.value.length];
      N(_), t.currentTarget.parentElement?.querySelectorAll(".mm-choice")?.[(e + o + u.value.length) % u.value.length]?.focus();
    }
    function N(t) {
      i.value = t.id, V();
    }
    return (t, e) => f.value ? (a(), n("div", J, m(f.value), 1)) : (a(), n("div", O, [
      r("label", Q, [
        I(r("input", {
          "onUpdate:modelValue": e[0] || (e[0] = (o) => p.value = o),
          type: "checkbox",
          onChange: V
        }, null, 544), [
          [L, p.value]
        ]),
        e[3] || (e[3] = r("span", null, "Learn from isolated runs", -1))
      ]),
      e[8] || (e[8] = r("p", { class: "mm-hint" }, "Keep reusable lessons, skills and stable knowledge from runs without a human conversation. Task inputs and one-off results stay out of memory. Recall stays active when this is off.", -1)),
      r("div", W, [
        e[6] || (e[6] = r("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[7] || (e[7] = r("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits, memory rules and cadence are set on the memory.", -1)),
        h.value ? (a(), n("div", X, [
          y(s(b), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, m(h.value), 1)
        ])) : x.value ? (a(), n("div", Y, [
          y(s(b), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[4] || (e[4] = r("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : c("", !0),
        y(j, {
          modelValue: g.value,
          "onUpdate:modelValue": e[1] || (e[1] = (o) => g.value = o),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        r("div", Z, [
          (a(!0), n(C, null, F(s(l).rows.value, (o, _) => (a(), n("button", {
            key: o.id,
            type: "button",
            role: "radio",
            class: P(["mm-choice", { on: o.id === i.value }]),
            "data-memory-choice": o.id,
            "aria-checked": o.id === i.value,
            tabindex: o.id === i.value || !s(l).rows.value.some((v) => v.id === i.value) && _ === 0 ? 0 : -1,
            onClick: (v) => N(o),
            onKeydown: (v) => K(v, _)
          }, [
            r("span", oe, [
              y(s(b), {
                icon: o.id === i.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            r("span", te, [
              r("span", se, m(o.name), 1),
              o.description || o.item_count !== void 0 ? (a(), n("span", ae, [
                k(m(o.description), 1),
                o.description && o.item_count !== void 0 ? (a(), n(C, { key: 0 }, [
                  k(" · ")
                ], 64)) : c("", !0),
                o.item_count !== void 0 ? (a(), n(C, { key: 1 }, [
                  k(m(o.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 42, ee))), 128)),
          s(l).loading.value && !s(l).rows.value.length ? (a(), n("div", ne, [
            y(s(b), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = k("Loading memories…", -1))
          ])) : s(l).error.value ? (a(), n("div", re, m(s(l).error.value), 1)) : s(l).rows.value.length ? c("", !0) : (a(), n("div", le, m(s(w) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        s(l).next.value !== null ? (a(), n("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: s(l).loading.value,
          onClick: e[2] || (e[2] = //@ts-ignore
          (...o) => s(l).more && s(l).more(...o))
        }, "Show more", 8, ie)) : c("", !0)
      ])
    ]));
  }
});
export {
  pe as default
};
//# sourceMappingURL=MemorySettings-BeN2sX12.js.map
