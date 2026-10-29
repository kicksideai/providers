import { defineComponent as T, ref as d, watch as N, computed as A, openBlock as n, createElementBlock as a, toDisplayString as m, createElementVNode as r, withDirectives as I, vModelCheckbox as L, createVNode as v, unref as s, createCommentVNode as c, Fragment as C, renderList as F, normalizeClass as P, createTextVNode as b } from "vue";
import { Icon as k } from "@iconify/vue";
import { define as U } from "@wippy-fe/proxy";
import { u as j, a as q, b as B, e as M, m as $ } from "./types-Dpmtmezp.js";
import { u as z, a as R, r as G, h as H, _ as J, l as O } from "./usePaged-DSKgwS8l.js";
const Q = {
  key: 0,
  class: "kx-notice error"
}, W = {
  key: 1,
  class: "mm-trait"
}, X = { class: "mm-toggle" }, Y = { class: "mm-field" }, Z = {
  key: 0,
  class: "kx-notice error"
}, ee = {
  key: 1,
  class: "kx-notice warn"
}, oe = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, te = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], se = { class: "mm-choice-ic" }, ne = { class: "mm-choice-main" }, ae = { class: "mm-choice-t" }, re = {
  key: 0,
  class: "mm-choice-s"
}, le = {
  key: 0,
  class: "mm-choice-empty"
}, ie = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, me = {
  key: 2,
  class: "mm-choice-empty"
}, ue = ["disabled"], de = /* @__PURE__ */ T({
  __name: "MemorySettings",
  setup(ye) {
    const S = j(), D = q(), i = d(""), y = d(!1), f = d(""), g = d(""), w = z(g, 250, (t) => t.trim());
    N(() => S.value.config, (t) => {
      try {
        const e = B(t);
        i.value = typeof e.memory_id == "string" ? e.memory_id : "", y.value = e.learn_in_isolation === !0, f.value = "";
      } catch (e) {
        f.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const l = R(() => w.value, (t) => O(w.value, t)), h = d(""), x = d(!1);
    N(i, async (t) => {
      if (h.value = "", x.value = !1, !!t)
        try {
          if (await G(t), t !== i.value) return;
        } catch (e) {
          t === i.value && ([403, 404].includes(H(e) ?? 0) || M(e) === "Selected resource is not a memory" ? x.value = !0 : h.value = M(e));
        }
    }, { immediate: !0 });
    function E() {
      D("config-changed", { context: { memory_id: i.value, learn_in_isolation: y.value } });
    }
    const u = A(() => l.rows.value);
    function K(t, e) {
      if (!["ArrowDown", "ArrowUp"].includes(t.key) || !u.value.length) return;
      t.preventDefault();
      const o = t.key === "ArrowDown" ? 1 : -1, _ = u.value[(e + o + u.value.length) % u.value.length];
      V(_), t.currentTarget.parentElement?.querySelectorAll(".mm-choice")?.[(e + o + u.value.length) % u.value.length]?.focus();
    }
    function V(t) {
      i.value = t.id, E();
    }
    return (t, e) => f.value ? (n(), a("div", Q, m(f.value), 1)) : (n(), a("div", W, [
      r("label", X, [
        I(r("input", {
          "onUpdate:modelValue": e[0] || (e[0] = (o) => y.value = o),
          type: "checkbox",
          onChange: E
        }, null, 544), [
          [L, y.value]
        ]),
        e[3] || (e[3] = r("span", null, "Learn from isolated runs", -1))
      ]),
      e[8] || (e[8] = r("p", { class: "mm-hint" }, "Keep reusable lessons, skills and stable knowledge from runs without a human conversation. Task inputs and one-off results stay out of memory. Recall stays active when this is off.", -1)),
      r("div", Y, [
        e[6] || (e[6] = r("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[7] || (e[7] = r("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits, memory rules and cadence are set on the memory.", -1)),
        h.value ? (n(), a("div", Z, [
          v(s(k), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, m(h.value), 1)
        ])) : x.value ? (n(), a("div", ee, [
          v(s(k), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[4] || (e[4] = r("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : c("", !0),
        v(J, {
          modelValue: g.value,
          "onUpdate:modelValue": e[1] || (e[1] = (o) => g.value = o),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        r("div", oe, [
          (n(!0), a(C, null, F(s(l).rows.value, (o, _) => (n(), a("button", {
            key: o.id,
            type: "button",
            role: "radio",
            class: P(["mm-choice", { on: o.id === i.value }]),
            "data-memory-choice": o.id,
            "aria-checked": o.id === i.value,
            tabindex: o.id === i.value || !s(l).rows.value.some((p) => p.id === i.value) && _ === 0 ? 0 : -1,
            onClick: (p) => V(o),
            onKeydown: (p) => K(p, _)
          }, [
            r("span", se, [
              v(s(k), {
                icon: o.id === i.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            r("span", ne, [
              r("span", ae, m(o.name), 1),
              o.description || o.item_count !== void 0 ? (n(), a("span", re, [
                b(m(o.description), 1),
                o.description && o.item_count !== void 0 ? (n(), a(C, { key: 0 }, [
                  b(" · ")
                ], 64)) : c("", !0),
                o.item_count !== void 0 ? (n(), a(C, { key: 1 }, [
                  b(m(o.item_count) + " memories", 1)
                ], 64)) : c("", !0)
              ])) : c("", !0)
            ])
          ], 42, te))), 128)),
          s(l).loading.value && !s(l).rows.value.length ? (n(), a("div", le, [
            v(s(k), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = b("Loading memories…", -1))
          ])) : s(l).error.value ? (n(), a("div", ie, m(s(l).error.value), 1)) : s(l).rows.value.length ? c("", !0) : (n(), a("div", me, m(s(w) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        s(l).next.value !== null ? (n(), a("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: s(l).loading.value,
          onClick: e[2] || (e[2] = //@ts-ignore
          (...o) => s(l).more && s(l).more(...o))
        }, "Show more", 8, ue)) : c("", !0)
      ])
    ]));
  }
}), ce = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, pe = {
  wippy: ce
}, ve = $(de, pe.wippy.props);
U(import.meta.url, ve);
//# sourceMappingURL=memory_settings.js.map
