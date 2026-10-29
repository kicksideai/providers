import { defineComponent as I, ref as m, watch as D, computed as L, openBlock as n, createElementBlock as a, toDisplayString as u, createElementVNode as l, withDirectives as F, vModelCheckbox as P, createVNode as v, unref as s, createCommentVNode as d, Fragment as C, renderList as U, normalizeClass as j, createTextVNode as _ } from "vue";
import { Icon as b } from "@iconify/vue";
import { define as q } from "@wippy-fe/proxy";
import { u as B, a as $, b as z, e as M, m as R } from "./types-D3kJ2ulw.js";
import { u as G, a as H, r as J, h as O, _ as Q, l as W } from "./usePaged-Co1PX6mr.js";
const X = {
  key: 0,
  class: "kx-notice error"
}, Y = {
  key: 1,
  class: "mm-trait"
}, Z = { class: "mm-toggle" }, ee = { class: "mm-field" }, te = {
  key: 0,
  class: "kx-notice error"
}, oe = {
  key: 1,
  class: "kx-notice warn"
}, se = {
  class: "mm-choices",
  role: "radiogroup",
  "aria-labelledby": "trait_memory"
}, ne = ["data-memory-choice", "aria-checked", "tabindex", "onClick", "onKeydown"], ae = { class: "mm-choice-ic" }, le = { class: "mm-choice-main" }, re = { class: "mm-choice-t" }, ie = {
  key: 0,
  class: "mm-choice-s"
}, me = {
  key: 0,
  class: "mm-choice-empty"
}, ue = {
  key: 1,
  class: "mm-choice-empty mm-hint-err"
}, ce = {
  key: 2,
  class: "mm-choice-empty"
}, de = ["disabled"], ve = /* @__PURE__ */ I({
  __name: "MemorySettings",
  setup(he) {
    const K = B(), T = $(), r = m(""), p = m(!1), y = m(""), k = m(""), g = G(k, 250, (o) => o.trim());
    D(() => K.value.config, (o) => {
      try {
        const e = z(o);
        r.value = typeof e.memory_id == "string" ? e.memory_id : "", p.value = e.learn_in_isolation === !0, y.value = "";
      } catch (e) {
        y.value = M(e);
      }
    }, { immediate: !0, deep: !0 });
    const i = H(() => g.value, (o) => W(g.value, o)), E = m(null), V = m(!1), f = m(""), w = m(!1);
    D(r, async (o) => {
      if (E.value = null, f.value = "", w.value = !1, !!o) {
        V.value = !0;
        try {
          const e = await J(o);
          if (o !== r.value) return;
          E.value = e;
        } catch (e) {
          o === r.value && ([403, 404].includes(O(e) ?? 0) || M(e) === "Selected resource is not a memory" ? w.value = !0 : f.value = M(e));
        } finally {
          o === r.value && (V.value = !1);
        }
      }
    }, { immediate: !0 });
    function N() {
      T("config-changed", { context: { memory_id: r.value, learn_in_isolation: p.value } });
    }
    const c = L(() => i.rows.value);
    function A(o, e) {
      if (!["ArrowDown", "ArrowUp"].includes(o.key) || !c.value.length) return;
      o.preventDefault();
      const t = o.key === "ArrowDown" ? 1 : -1, h = c.value[(e + t + c.value.length) % c.value.length];
      S(h), o.currentTarget.parentElement?.querySelectorAll(".mm-choice")?.[(e + t + c.value.length) % c.value.length]?.focus();
    }
    function S(o) {
      r.value = o.id, N();
    }
    return (o, e) => y.value ? (n(), a("div", X, u(y.value), 1)) : (n(), a("div", Y, [
      l("label", Z, [
        F(l("input", {
          "onUpdate:modelValue": e[0] || (e[0] = (t) => p.value = t),
          type: "checkbox",
          onChange: N
        }, null, 544), [
          [P, p.value]
        ]),
        e[3] || (e[3] = l("span", null, "Learn from isolated runs", -1))
      ]),
      e[8] || (e[8] = l("p", { class: "mm-hint" }, "Keep reusable lessons, skills and stable knowledge from runs without a human conversation. Task inputs and one-off results stay out of memory. Recall stays active when this is off.", -1)),
      l("div", ee, [
        e[6] || (e[6] = l("span", {
          id: "trait_memory",
          class: "mm-label"
        }, "Memory", -1)),
        e[7] || (e[7] = l("span", { class: "mm-hint" }, "Memory learns from conversations automatically and supplies recall. Models, limits, memory rules and cadence are set on the memory.", -1)),
        f.value ? (n(), a("div", te, [
          v(s(b), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          l("span", null, u(f.value), 1)
        ])) : w.value ? (n(), a("div", oe, [
          v(s(b), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          e[4] || (e[4] = l("span", null, "The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.", -1))
        ])) : d("", !0),
        v(Q, {
          modelValue: k.value,
          "onUpdate:modelValue": e[1] || (e[1] = (t) => k.value = t),
          placeholder: "Find a memory…",
          label: "Find a memory"
        }, null, 8, ["modelValue"]),
        l("div", se, [
          (n(!0), a(C, null, U(s(i).rows.value, (t, h) => (n(), a("button", {
            key: t.id,
            type: "button",
            role: "radio",
            class: j(["mm-choice", { on: t.id === r.value }]),
            "data-memory-choice": t.id,
            "aria-checked": t.id === r.value,
            tabindex: t.id === r.value || !r.value && h === 0 ? 0 : -1,
            onClick: (x) => S(t),
            onKeydown: (x) => A(x, h)
          }, [
            l("span", ae, [
              v(s(b), {
                icon: t.id === r.value ? "tabler:circle-check-filled" : "tabler:brain",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            l("span", le, [
              l("span", re, u(t.name), 1),
              t.description || t.item_count !== void 0 ? (n(), a("span", ie, [
                _(u(t.description), 1),
                t.description && t.item_count !== void 0 ? (n(), a(C, { key: 0 }, [
                  _(" · ")
                ], 64)) : d("", !0),
                t.item_count !== void 0 ? (n(), a(C, { key: 1 }, [
                  _(u(t.item_count) + " memories", 1)
                ], 64)) : d("", !0)
              ])) : d("", !0)
            ])
          ], 42, ne))), 128)),
          s(i).loading.value && !s(i).rows.value.length ? (n(), a("div", me, [
            v(s(b), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = _("Loading memories…", -1))
          ])) : s(i).error.value ? (n(), a("div", ue, u(s(i).error.value), 1)) : s(i).rows.value.length ? d("", !0) : (n(), a("div", ce, u(s(g) ? "No memory matches." : "No memories yet. Create one from Knowledge → New knowledge base → Memory."), 1))
        ]),
        s(i).next.value !== null ? (n(), a("button", {
          key: 2,
          type: "button",
          class: "kx-btn kx-btn-ghost sm",
          disabled: s(i).loading.value,
          onClick: e[2] || (e[2] = //@ts-ignore
          (...t) => s(i).more && s(i).more(...t))
        }, "Show more", 8, de)) : d("", !0)
      ])
    ]));
  }
}), pe = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context { memory_id }.", default: {} } } } }, ye = {
  wippy: pe
}, fe = R(ve, ye.wippy.props);
q(import.meta.url, fe);
//# sourceMappingURL=memory_settings.js.map
