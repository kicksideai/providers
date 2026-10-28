import { defineComponent as T, ref as m, watch as S, computed as $, openBlock as n, createElementBlock as a, toDisplayString as u, createElementVNode as i, createVNode as v, unref as r, createCommentVNode as d, Fragment as x, renderList as q, normalizeClass as F, createTextVNode as f } from "vue";
import { Icon as h } from "@iconify/vue";
import { define as I } from "@wippy-fe/proxy";
import { u as L, a as P, b as U, e as C, m as j } from "./types-CkAlvrJt.js";
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
}, Z = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], ee = { class: "mm-choice-ic" }, te = { class: "mm-choice-main" }, oe = { class: "mm-choice-t" }, re = {
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
}, le = ["disabled"], ie = /* @__PURE__ */ T({
  __name: "MemorySettings",
  setup(de) {
    const V = L(), D = P(), s = m(""), p = m(""), b = m(""), k = B(b, 250, (o) => o.trim());
    S(() => V.value.config, (o) => {
      try {
        const e = U(o);
        s.value = typeof e.memory_id == "string" ? e.memory_id : "", p.value = "";
      } catch (e) {
        p.value = C(e);
      }
    }, { immediate: !0, deep: !0 });
    const l = z(() => `/api/v1/memory?limit=20${k.value ? `&q=${encodeURIComponent(k.value)}` : ""}`, "items"), M = m(null), E = m(!1), y = m(""), g = m(!1);
    S(s, async (o) => {
      if (M.value = null, y.value = "", g.value = !1, !!o) {
        E.value = !0;
        try {
          const e = await R(o);
          if (o !== s.value) return;
          M.value = e;
        } catch (e) {
          o === s.value && ([403, 404].includes(G(e) ?? 0) || C(e) === "Selected resource is not a memory" ? g.value = !0 : y.value = C(e));
        } finally {
          o === s.value && (E.value = !1);
        }
      }
    }, { immediate: !0 });
    function K() {
      D("config-changed", { context: { memory_id: s.value } });
    }
    const c = $(() => l.rows.value);
    function A(o, e) {
      if (!["ArrowDown", "ArrowUp"].includes(o.key) || !c.value.length) return;
      o.preventDefault();
      const t = o.key === "ArrowDown" ? 1 : -1, _ = c.value[(e + t + c.value.length) % c.value.length];
      N(_), o.currentTarget.parentElement?.querySelectorAll(".mm-choice")?.[(e + t + c.value.length) % c.value.length]?.focus();
    }
    function N(o) {
      s.value = o.id, K();
    }
    return (o, e) => p.value ? (n(), a("div", J, u(p.value), 1)) : (n(), a("div", O, [
      i("div", Q, [
        e[4] || (e[4] = i("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[5] || (e[5] = i("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits and cadence are set on the memory.", -1)),
        y.value ? (n(), a("div", W, [
          v(r(h), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          i("span", null, u(y.value), 1)
        ])) : g.value ? (n(), a("div", X, [
          v(r(h), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[2] || (e[2] = i("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : d("", !0),
        v(H, {
          modelValue: b.value,
          "onUpdate:modelValue": e[0] || (e[0] = (t) => b.value = t),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        i("div", Y, [
          (n(!0), a(x, null, q(r(l).rows.value, (t, _) => (n(), a("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: F(["mm-choice", { on: t.id === s.value }]),
            "data-memory-choice": t.id,
            "aria-checked": t.id === s.value,
            tabindex: t.id === s.value || !s.value && _ === 0 ? 0 : -1,
            onClick: (w) => N(t),
            onKeydown: (w) => A(w, _)
          }, [
            i("span", ee, [
              v(r(h), {
                icon: t.id === s.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            i("span", te, [
              i("span", oe, u(t.name), 1),
              t.description || t.item_count !== void 0 ? (n(), a("span", re, [
                f(u(t.description), 1),
                t.description && t.item_count !== void 0 ? (n(), a(x, { key: 0 }, [
                  f(" · ")
                ], 64)) : d("", !0),
                t.item_count !== void 0 ? (n(), a(x, { key: 1 }, [
                  f(u(t.item_count) + " memories", 1)
                ], 64)) : d("", !0)
              ])) : d("", !0)
            ])
          ], 42, Z))), 128)),
          r(l).loading.value && !r(l).rows.value.length ? (n(), a("div", ne, [
            v(r(h), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[3] || (e[3] = f("Loading memories…", -1))
          ])) : r(l).error.value ? (n(), a("div", ae, u(r(l).error.value), 1)) : r(l).rows.value.length ? d("", !0) : (n(), a("div", se, u(r(k) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        r(l).next.value !== null ? (n(), a("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: r(l).loading.value,
          onClick: e[1] || (e[1] = //@ts-ignore
          (...t) => r(l).more && r(l).more(...t))
        }, "Show more", 8, le)) : d("", !0)
      ])
    ]));
  }
}), me = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, ue = {
  wippy: me
}, ce = j(ie, ue.wippy.props);
I(import.meta.url, ce);
//# sourceMappingURL=memory_settings.js.map
