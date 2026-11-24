import { defineComponent as U, useModel as L, useSlots as N, useId as K, ref as h, watch as V, openBlock as l, createElementBlock as n, normalizeClass as I, unref as t, createElementVNode as o, toDisplayString as _, renderSlot as S, createCommentVNode as m, createVNode as c, createBlock as A, Transition as W, withCtx as E, withDirectives as j, vShow as q, mergeModels as F, computed as r } from "vue";
import P from "primevue/button";
import G from "primevue/inputtext";
import H from "primevue/password";
import J from "primevue/selectbutton";
import O from "primevue/tag";
import { Icon as Q } from "@iconify/vue";
import { a as X, u as Y } from "./wc-runtime-ChwhCkze.js";
const Z = { class: "kx-settings-item-head" }, ee = { class: "kx-settings-item-main" }, ae = { class: "kx-settings-item-line" }, le = { class: "kx-settings-item-title" }, te = {
  key: 0,
  class: "kx-settings-item-desc"
}, se = {
  key: 1,
  class: "kx-settings-item-meta"
}, ie = { class: "kx-settings-item-actions" }, oe = ["aria-expanded", "aria-controls", "aria-label"], ne = ["id", "inert"], de = { class: "kx-settings-item-clip" }, ue = { class: "kx-settings-item-body" }, z = /* @__PURE__ */ U({
  __name: "SettingsItem",
  props: /* @__PURE__ */ F({
    title: {},
    description: {},
    expandLabel: {},
    keepMounted: { type: Boolean }
  }, {
    open: { type: Boolean, default: !1 },
    openModifiers: {}
  }),
  emits: ["update:open"],
  setup(u) {
    const g = u, s = L(u, "open"), v = N(), k = K(), y = h(s.value);
    return V(s, (a) => {
      a && (y.value = !0);
    }), (a, i) => (l(), n("article", {
      class: I(["kx-settings-item", { "kx-settings-item-open": s.value && t(v).default }])
    }, [
      o("div", Z, [
        o("div", ee, [
          o("div", ae, [
            o("h3", le, _(u.title), 1),
            S(a.$slots, "status")
          ]),
          u.description ? (l(), n("p", te, _(u.description), 1)) : m("", !0),
          t(v).meta ? (l(), n("p", se, [
            S(a.$slots, "meta")
          ])) : m("", !0)
        ]),
        o("div", ie, [
          t(v).default ? (l(), n("button", {
            key: 0,
            type: "button",
            class: "kx-settings-item-expand",
            "aria-expanded": s.value,
            "aria-controls": t(k),
            "aria-label": (u.expandLabel || "Details") + " " + u.title,
            onClick: i[0] || (i[0] = (f) => s.value = !s.value)
          }, [
            o("span", null, _(u.expandLabel || "Details"), 1),
            c(t(Q), {
              icon: "tabler:chevron-down",
              "aria-hidden": "true"
            })
          ], 8, oe)) : m("", !0),
          S(a.$slots, "actions")
        ])
      ]),
      t(v).default ? (l(), A(W, {
        key: 0,
        name: "kx-settings-item-motion"
      }, {
        default: E(() => [
          y.value || g.keepMounted ? j((l(), n("div", {
            key: 0,
            id: t(k),
            inert: !s.value,
            class: "kx-settings-item-panel"
          }, [
            o("div", de, [
              o("div", ue, [
                S(a.$slots, "default")
              ])
            ])
          ], 8, ne)), [
            [q, s.value]
          ]) : m("", !0)
        ]),
        _: 3
      })) : m("", !0)
    ], 2));
  }
}), re = ["disabled"], ce = { class: "mg-control" }, me = {
  key: 0,
  class: "mg-secret"
}, ve = {
  key: 1,
  class: "mg-secret"
}, pe = {
  key: 2,
  class: "mg-error",
  role: "alert"
}, ge = { class: "mg-control" }, ke = {
  key: 0,
  class: "mg-error",
  role: "alert"
}, ye = { class: "mg-control" }, fe = {
  key: 0,
  class: "mg-error",
  role: "alert"
}, Ee = /* @__PURE__ */ U({
  __name: "MailgunSettings",
  setup(u) {
    const g = X(), s = Y(), v = r(() => g.value?.values ?? {}), k = r(() => !!g.value?.secrets?.api_key), y = r(() => g.value?.errors ?? {}), a = r(() => !!g.value?.disabled), i = h(""), f = h("us"), p = h(""), x = h(!1);
    V([v, () => g.value?.draft], ([d, e]) => {
      i.value = e?.domain ?? d.domain ?? "", f.value = (e?.region ?? d.region) === "eu" ? "eu" : "us", p.value = e?.api_key ?? "", x.value = !!e?.api_key;
    }, { immediate: !0 });
    function D() {
      x.value = !1, p.value = "";
    }
    const R = [{ label: "United States", value: "us" }, { label: "European Union", value: "eu" }], T = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i, w = r(() => !!i.value && !T.test(i.value)), C = r(() => !k.value && !p.value && !!i.value), $ = r(() => w.value ? "Enter a domain such as mg.example.com." : y.value.domain ?? ""), M = r(() => C.value ? "Enter the API key for this domain." : y.value.api_key ?? ""), B = r(() => !w.value && !C.value);
    return V([i, f, p], () => {
      const d = {};
      i.value !== (v.value.domain ?? "") && (d.domain = i.value), f.value !== (v.value.region ?? "us") && (d.region = f.value), p.value && (d.api_key = p.value), s("change", { values: d }), s("validity", { valid: B.value });
    }), V(B, (d) => s("validity", { valid: d }), { immediate: !0 }), (d, e) => (l(), n("fieldset", {
      class: "mg",
      disabled: a.value
    }, [
      e[4] || (e[4] = o("legend", { class: "mg-sr-only" }, "Mailgun", -1)),
      c(z, {
        title: "API key",
        description: "A Mailgun sending key for this domain.",
        class: I({ "mg-invalid": M.value })
      }, {
        actions: E(() => [
          o("span", ce, [
            k.value && !x.value ? (l(), n("span", me, [
              c(t(O), {
                severity: "success",
                value: "Set",
                class: "kx-tag-sm"
              }),
              c(t(P), {
                label: "Replace",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: a.value,
                onClick: e[0] || (e[0] = (b) => x.value = !0)
              }, null, 8, ["disabled"])
            ])) : (l(), n("span", ve, [
              c(t(H), {
                modelValue: p.value,
                "onUpdate:modelValue": e[1] || (e[1] = (b) => p.value = b),
                feedback: !1,
                "toggle-mask": "",
                fluid: "",
                invalid: !!M.value,
                disabled: a.value,
                "aria-label": "API key",
                placeholder: k.value ? "Enter a new key…" : "key-…"
              }, null, 8, ["modelValue", "invalid", "disabled", "placeholder"]),
              k.value ? (l(), A(t(P), {
                key: 0,
                label: "Cancel",
                severity: "secondary",
                text: "",
                size: "small",
                disabled: a.value,
                onClick: D
              }, null, 8, ["disabled"])) : m("", !0)
            ])),
            M.value ? (l(), n("small", pe, _(M.value), 1)) : m("", !0)
          ])
        ]),
        _: 1
      }, 8, ["class"]),
      c(z, {
        title: "Sending domain",
        description: "The domain you verified in Mailgun.",
        class: I({ "mg-invalid": $.value })
      }, {
        actions: E(() => [
          o("span", ge, [
            c(t(G), {
              modelValue: i.value,
              "onUpdate:modelValue": e[2] || (e[2] = (b) => i.value = b),
              modelModifiers: { trim: !0 },
              fluid: "",
              invalid: !!$.value,
              disabled: a.value,
              placeholder: "mg.example.com",
              "aria-label": "Sending domain"
            }, null, 8, ["modelValue", "invalid", "disabled"]),
            $.value ? (l(), n("small", ke, _($.value), 1)) : m("", !0)
          ])
        ]),
        _: 1
      }, 8, ["class"]),
      c(z, {
        title: "Region",
        description: "Where your Mailgun account keeps this domain."
      }, {
        actions: E(() => [
          o("span", ye, [
            c(t(J), {
              modelValue: f.value,
              "onUpdate:modelValue": e[3] || (e[3] = (b) => f.value = b),
              options: R,
              "option-label": "label",
              "option-value": "value",
              "allow-empty": !1,
              disabled: a.value,
              "aria-label": "Region"
            }, null, 8, ["modelValue", "disabled"]),
            y.value.region ? (l(), n("small", fe, _(y.value.region), 1)) : m("", !0)
          ])
        ]),
        _: 1
      })
    ], 8, re));
  }
});
export {
  Ee as default
};
//# sourceMappingURL=MailgunSettings-CnJo7dwN.js.map
