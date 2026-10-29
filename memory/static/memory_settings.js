import { defineComponent as T, ref as m, watch as S, computed as F, openBlock as a, createElementBlock as n, toDisplayString as u, createElementVNode as i, createVNode as v, unref as r, createCommentVNode as d, Fragment as x, renderList as L, normalizeClass as P, createTextVNode as f } from "vue";
import { Icon as h } from "@iconify/vue";
import { define as j } from "@wippy-fe/proxy";
import { u as q, a as B, b as I, e as M, m as U } from "./types-D3kJ2ulw.js";
import { u as $, a as z, r as G, h as H, _ as J, l as O } from "./usePaged-B6B3LhXE.js";
const Q = {
  key: 0,
  class: "kx-notice error"
}, R = {
  key: 1,
  class: "mm-trait"
}, W = { class: "mm-field" }, X = {
  key: 0,
  class: "kx-notice error"
}, Y = {
  key: 1,
  class: "kx-notice warn"
}, Z = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, ee = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], te = { class: "mm-choice-ic" }, oe = { class: "mm-choice-main" }, re = { class: "mm-choice-t" }, ae = {
  key: 0,
  class: "mm-choice-s"
}, ne = {
  key: 0,
  class: "mm-choice-empty"
}, se = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, le = {
  key: 2,
  class: "mm-choice-empty"
}, ie = ["disabled"], me = /* @__PURE__ */ T({
  __name: "MemorySettings",
  setup(ve) {
    const V = q(), D = B(), s = m(""), p = m(""), b = m(""), k = $(b, 250, (o) => o.trim());
    S(() => V.value.config, (o) => {
      try {
        const e = I(o);
        s.value = typeof e.memory_id == "string" ? e.memory_id : "", p.value = "";
      } catch (e) {
        p.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const l = z(() => k.value, (o) => O(k.value, o)), C = m(null), E = m(!1), y = m(""), g = m(!1);
    S(s, async (o) => {
      if (C.value = null, y.value = "", g.value = !1, !!o) {
        E.value = !0;
        try {
          const e = await G(o);
          if (o !== s.value) return;
          C.value = e;
        } catch (e) {
          o === s.value && ([403, 404].includes(H(e) ?? 0) || M(e) === "Selected resource is not a memory" ? g.value = !0 : y.value = M(e));
        } finally {
          o === s.value && (E.value = !1);
        }
      }
    }, { immediate: !0 });
    function K() {
      D("config-changed", { context: { memory_id: s.value } });
    }
    const c = F(() => l.rows.value);
    function A(o, e) {
      if (!["ArrowDown", "ArrowUp"].includes(o.key) || !c.value.length) return;
      o.preventDefault();
      const t = o.key === "ArrowDown" ? 1 : -1, _ = c.value[(e + t + c.value.length) % c.value.length];
      N(_), o.currentTarget.parentElement?.querySelectorAll(".mm-choice")?.[(e + t + c.value.length) % c.value.length]?.focus();
    }
    function N(o) {
      s.value = o.id, K();
    }
    return (o, e) => p.value ? (a(), n("div", Q, u(p.value), 1)) : (a(), n("div", R, [
      i("div", W, [
        e[4] || (e[4] = i("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[5] || (e[5] = i("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits and cadence are set on the memory.", -1)),
        y.value ? (a(), n("div", X, [
          v(r(h), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          i("span", null, u(y.value), 1)
        ])) : g.value ? (a(), n("div", Y, [
          v(r(h), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[2] || (e[2] = i("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : d("", !0),
        v(J, {
          modelValue: b.value,
          "onUpdate:modelValue": e[0] || (e[0] = (t) => b.value = t),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        i("div", Z, [
          (a(!0), n(x, null, L(r(l).rows.value, (t, _) => (a(), n("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: P(["mm-choice", { on: t.id === s.value }]),
            "data-memory-choice": t.id,
            "aria-checked": t.id === s.value,
            tabindex: t.id === s.value || !s.value && _ === 0 ? 0 : -1,
            onClick: (w) => N(t),
            onKeydown: (w) => A(w, _)
          }, [
            i("span", te, [
              v(r(h), {
                icon: t.id === s.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            i("span", oe, [
              i("span", re, u(t.name), 1),
              t.description || t.item_count !== void 0 ? (a(), n("span", ae, [
                f(u(t.description), 1),
                t.description && t.item_count !== void 0 ? (a(), n(x, { key: 0 }, [
                  f(" · ")
                ], 64)) : d("", !0),
                t.item_count !== void 0 ? (a(), n(x, { key: 1 }, [
                  f(u(t.item_count) + " memories", 1)
                ], 64)) : d("", !0)
              ])) : d("", !0)
            ])
          ], 42, ee))), 128)),
          r(l).loading.value && !r(l).rows.value.length ? (a(), n("div", ne, [
            v(r(h), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[3] || (e[3] = f("Loading memories…", -1))
          ])) : r(l).error.value ? (a(), n("div", se, u(r(l).error.value), 1)) : r(l).rows.value.length ? d("", !0) : (a(), n("div", le, u(r(k) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        r(l).next.value !== null ? (a(), n("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: r(l).loading.value,
          onClick: e[1] || (e[1] = //@ts-ignore
          (...t) => r(l).more && r(l).more(...t))
        }, "Show more", 8, ie)) : d("", !0)
      ])
    ]));
  }
}), ue = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, ce = {
  wippy: ue
}, de = U(me, ce.wippy.props);
j(import.meta.url, de);
//# sourceMappingURL=memory_settings.js.map
