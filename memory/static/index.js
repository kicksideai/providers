import { openBlock as u, createElementBlock as c, mergeProps as w, createBlock as D, resolveDynamicComponent as ct, createCommentVNode as h, renderSlot as O, createElementVNode as d, toDisplayString as m, defineComponent as N, computed as M, Fragment as T, createVNode as g, unref as l, createTextVNode as C, renderList as K, normalizeClass as F, resolveDirective as Ct, withDirectives as mt, resolveComponent as nt, createSlots as ne, withCtx as V, ref as A, watch as U, withModifiers as oe, Transition as re, onUnmounted as ae, vShow as ie } from "vue";
import { Icon as k } from "@iconify/vue";
import { api as et, define as le } from "@wippy-fe/proxy";
import { B as X, d as gt, f as W, c as Rt, s as bt, k as ht, g as ut, h as se, l as Kt, L as de, j as q, v as J, U as ue, I as Bt, n as ce, r as Ht, o as be, q as pe, t as me, C as ge, w as fe, S as ve, _ as he, W as ye, i as Q, x as ke, e as Nt, u as we, a as xe, b as $e, m as Ce } from "./types-yNEBYydW.js";
import { s as Ut, u as St, _ as Se, a as _e } from "./useMemory-DLBqiJmH.js";
import { R as ft, u as ze, d as Et, b as Le, e as Wt, s as _t, B as Ie, a as Pe } from "./useWidget-CvUXiKK3.js";
function Be() {
  let t = [], e = (i, s, p = 999) => {
    let b = a(i, s, p), y = b.value + (b.key === i ? 0 : p) + 1;
    return t.push({ key: i, value: y }), y;
  }, n = (i) => {
    t = t.filter((s) => s.value !== i);
  }, r = (i, s) => a(i).value, a = (i, s, p = 0) => [...t].reverse().find((b) => !0) || { key: i, value: p }, o = (i) => i && parseInt(i.style.zIndex, 10) || 0;
  return { get: o, set: (i, s, p) => {
    s && (s.style.zIndex = String(e(i, !0, p)));
  }, clear: (i) => {
    i && (n(o(i)), i.style.zIndex = "");
  }, getCurrent: (i) => r(i) };
}
var yt = Be(), Ee = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, Ae = {
  root: function(e) {
    var n = e.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, De = X.extend({
  name: "tag",
  style: Ee,
  classes: Ae
}), Oe = {
  name: "BaseTag",
  extends: gt,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: De,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ot(t) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ot(t);
}
function Te(t, e, n) {
  return (e = je(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function je(t) {
  var e = Me(t, "string");
  return ot(e) == "symbol" ? e : e + "";
}
function Me(t, e) {
  if (ot(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zt = {
  name: "Tag",
  extends: Oe,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return W(Te({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ve = ["data-p"];
function Fe(t, e, n, r, a, o) {
  return u(), c("span", w({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (u(), D(ct(t.$slots.icon), w({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (u(), c("span", w({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : h("", !0), t.value != null || t.$slots.default ? O(t.$slots, "default", {
    key: 2
  }, function() {
    return [d("span", w({
      class: t.cx("label")
    }, t.ptm("label")), m(t.value), 17)];
  }) : h("", !0)], 16, Ve);
}
zt.render = Fe;
const G = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people" },
  fact: { label: "Fact", icon: "tabler:note", group: "people" }
}, Re = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route" },
  { id: "people", title: "About people", icon: "tabler:users" }
];
function Y(t) {
  const e = t.replace(/[_\-.]+/g, " ").trim();
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : t;
}
function Ke(t) {
  return t.scope_family === "agent" ? "The agent" : "A person it talked with";
}
const He = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function Zt(t) {
  return He[t] || t;
}
function Yt(t) {
  return t ? Date.parse(t.includes("T") ? t : t.replace(" ", "T") + "Z") : NaN;
}
function tt(t) {
  const e = Yt(t);
  return Number.isFinite(e) ? new Date(e).toLocaleString() : "";
}
const Ne = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function Z(t, e = Date.now()) {
  const n = Yt(t);
  if (!Number.isFinite(n)) return "";
  const r = Math.round((n - e) / 1e3), a = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, i] of Ne)
    if (Math.abs(r) >= i) return a.format(Math.round(r / i), o);
  return "just now";
}
const Ue = { class: "mm-view-head" }, We = { class: "mm-view-title" }, Ze = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, Ye = { class: "kx-empty-ico" }, Xe = {
  key: 1,
  class: "mm-runs"
}, qe = { class: "mm-run-main" }, Ge = { class: "mm-run-t" }, Je = ["title"], Qe = {
  key: 0,
  class: "mm-run-err"
}, tn = /* @__PURE__ */ N({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(t) {
    const e = t, n = M(() => e.memory.status.value?.runs || []);
    function r(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function a(o) {
      const i = o.stats || {}, s = [
        i.added ? `${i.added} new` : "",
        i.superseded ? `${i.superseded} updated` : "",
        i.conflicted ? `${i.conflicted} contested` : "",
        i.rejected ? `${i.rejected} rejected` : ""
      ].filter(Boolean);
      return s.length ? s.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, i) => (u(), c(T, null, [
      d("header", Ue, [
        d("h2", We, [
          g(l(k), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          i[0] || (i[0] = C("Activity", -1))
        ]),
        i[1] || (i[1] = d("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (u(), c("ol", Xe, [
        (u(!0), c(T, null, K(n.value, (s) => (u(), c("li", {
          key: s.id,
          class: F(["mm-run", s.status])
        }, [
          d("div", qe, [
            d("span", Ge, m(r(s)), 1),
            d("span", {
              class: "mm-muted",
              title: l(tt)(s.finished_at || s.started_at || s.created_at)
            }, [
              C(m(l(Z)(s.finished_at || s.started_at || s.created_at)), 1),
              a(s) ? (u(), c(T, { key: 0 }, [
                C(" · " + m(a(s)), 1)
              ], 64)) : h("", !0)
            ], 8, Je),
            s.last_error ? (u(), c("span", Qe, m(s.last_error), 1)) : h("", !0)
          ]),
          s.status !== "succeeded" ? (u(), D(l(zt), {
            key: 0,
            class: "kx-tag-sm",
            severity: l(Ut)(s.status),
            value: s.status
          }, null, 8, ["severity", "value"])) : h("", !0)
        ], 2))), 128))
      ])) : (u(), c("div", Ze, [
        d("span", Ye, [
          g(l(k), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        i[2] || (i[2] = d("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        i[3] || (i[3] = d("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
var en = `
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`, nn = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": r.fluid,
      "p-togglebutton-sm p-inputfield-sm": r.size === "small",
      "p-togglebutton-lg p-inputfield-lg": r.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, on = X.extend({
  name: "togglebutton",
  style: en,
  classes: nn
}), rn = {
  name: "BaseToggleButton",
  extends: Rt,
  props: {
    onIcon: String,
    offIcon: String,
    onLabel: {
      type: String,
      default: "Yes"
    },
    offLabel: {
      type: String,
      default: "No"
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: on,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function rt(t) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, rt(t);
}
function an(t, e, n) {
  return (e = ln(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ln(t) {
  var e = sn(t, "string");
  return rt(e) == "symbol" ? e : e + "";
}
function sn(t, e) {
  if (rt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Xt = {
  name: "ToggleButton",
  extends: rn,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, e), this.$emit("change", e));
    },
    onBlur: function(e) {
      var n, r;
      (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return bt(this.onLabel) && bt(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return W(an({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ft
  }
}, dn = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], un = ["data-p"];
function cn(t, e, n, r, a, o) {
  var i = Ct("ripple");
  return mt((u(), c("button", w({
    type: "button",
    class: t.cx("root"),
    tabindex: t.tabindex,
    disabled: t.disabled,
    "aria-pressed": t.d_value,
    onClick: e[0] || (e[0] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    })
  }, o.getPTOptions("root"), {
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "data-p-checked": o.active,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [d("span", w({
    class: t.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [O(t.$slots, "default", {}, function() {
    return [O(t.$slots, "icon", {
      value: t.d_value,
      class: F(t.cx("icon"))
    }, function() {
      return [t.onIcon || t.offIcon ? (u(), c("span", w({
        key: 0,
        class: [t.cx("icon"), t.d_value ? t.onIcon : t.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : h("", !0)];
    }), d("span", w({
      class: t.cx("label")
    }, o.getPTOptions("label")), m(o.label), 17)];
  })], 16, un)], 16, dn)), [[i]]);
}
Xt.render = cn;
var bn = `
    .p-selectbutton {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton {
        border-radius: 0;
        border-width: 1px 1px 1px 0;
    }

    .p-selectbutton .p-togglebutton:focus-visible {
        position: relative;
        z-index: 1;
    }

    .p-selectbutton .p-togglebutton:first-child {
        border-inline-start-width: 1px;
        border-start-start-radius: dt('selectbutton.border.radius');
        border-end-start-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton:last-child {
        border-start-end-radius: dt('selectbutton.border.radius');
        border-end-end-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .p-selectbutton-fluid {
        width: 100%;
    }
    
    .p-selectbutton-fluid .p-togglebutton {
        flex: 1 1 0;
    }
`, pn = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": r.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, mn = X.extend({
  name: "selectbutton",
  style: bn,
  classes: pn
}), gn = {
  name: "BaseSelectButton",
  extends: Rt,
  props: {
    options: Array,
    optionLabel: null,
    optionValue: null,
    optionDisabled: null,
    multiple: Boolean,
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    dataKey: null,
    ariaLabelledby: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: mn,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function fn(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = qt(t)) || e) {
      n && (t = n);
      var r = 0, a = function() {
      };
      return { s: a, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(b) {
        throw b;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, i = !0, s = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var b = n.next();
    return i = b.done, b;
  }, e: function(b) {
    s = !0, o = b;
  }, f: function() {
    try {
      i || n.return == null || n.return();
    } finally {
      if (s) throw o;
    }
  } };
}
function vn(t) {
  return kn(t) || yn(t) || qt(t) || hn();
}
function hn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qt(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function yn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function kn(t) {
  if (Array.isArray(t)) return kt(t);
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Lt = {
  name: "SelectButton",
  extends: gn,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(e) {
      return this.optionLabel ? ut(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? ut(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e) {
      return this.dataKey ? ut(e, this.dataKey) : this.getOptionLabel(e);
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? ut(e, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(e) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(e);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(e, n, r) {
      var a = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var o = this.isSelected(n), i = this.getOptionValue(n), s;
        if (this.multiple)
          if (o) {
            if (s = this.d_value.filter(function(p) {
              return !ht(p, i, a.equalityKey);
            }), !this.allowEmpty && s.length === 0) return;
          } else
            s = this.d_value ? [].concat(vn(this.d_value), [i]) : [i];
        else {
          if (o && !this.allowEmpty) return;
          s = o ? null : i;
        }
        this.writeValue(s, e), this.$emit("change", {
          originalEvent: e,
          value: s
        });
      }
    },
    isSelected: function(e) {
      var n = !1, r = this.getOptionValue(e);
      if (this.multiple) {
        if (this.d_value) {
          var a = fn(this.d_value), o;
          try {
            for (a.s(); !(o = a.n()).done; ) {
              var i = o.value;
              if (ht(i, r, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (s) {
            a.e(s);
          } finally {
            a.f();
          }
        }
      } else
        n = ht(this.d_value, r, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return W({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ft
  },
  components: {
    ToggleButton: Xt
  }
}, wn = ["aria-labelledby", "data-p"];
function xn(t, e, n, r, a, o) {
  var i = nt("ToggleButton");
  return u(), c("div", w({
    class: t.cx("root"),
    role: "group",
    "aria-labelledby": t.ariaLabelledby
  }, t.ptmi("root"), {
    "data-p": o.dataP
  }), [(u(!0), c(T, null, K(t.options, function(s, p) {
    return u(), D(i, {
      key: o.getOptionRenderKey(s),
      modelValue: o.isSelected(s),
      onLabel: o.getOptionLabel(s),
      offLabel: o.getOptionLabel(s),
      disabled: t.disabled || o.isOptionDisabled(s),
      unstyled: t.unstyled,
      size: t.size,
      readonly: o.isOptionReadonly(s),
      onChange: function(y) {
        return o.onOptionSelect(y, s, p);
      },
      pt: t.ptm("pcToggleButton")
    }, ne({
      _: 2
    }, [t.$slots.option ? {
      name: "default",
      fn: V(function() {
        return [O(t.$slots, "option", {
          option: s,
          index: p
        }, function() {
          return [d("span", w({
            ref_for: !0
          }, t.ptm("pcToggleButton").label), m(o.getOptionLabel(s)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, wn);
}
Lt.render = xn;
function $n(t) {
  return t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function At(t) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(t);
}
const Cn = { class: "mm-field" }, Sn = { class: "mm-hint" }, _n = { class: "mm-field" }, zn = ["selected"], Ln = { class: "mm-field" }, In = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Pn = {
  key: 1,
  class: "mm-hint"
}, Bn = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, En = ["onClick"], An = { class: "mm-field" }, Dn = { class: "mm-form-foot" }, On = ["disabled"], Tn = /* @__PURE__ */ N({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(t, { emit: e }) {
    const n = t, r = e, a = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = A("rule"), i = A(""), s = A(""), p = A(""), b = ze("wc-agent-picker"), y = M(() => a.find((E) => E.value === o.value)?.hint || ""), _ = M(() => $n(s.value)), L = M(() => s.value && !At(_.value) ? "Use a short topic of letters, digits and spaces." : ""), S = M(() => !!i.value && At(_.value) && !!p.value.trim()), B = St(
      () => n.memory.memoryId.value ? `${n.memory.base.value}/topics?scope_family=agent&kind=${o.value}` : null,
      "topics",
      n.memory.revision
    ), x = M(() => B.rows.value.map((E) => E.key).filter((E) => E !== _.value).slice(0, 8));
    U(o, () => {
      s.value = "";
    });
    function v(E) {
      const P = se(E).selected;
      i.value = String((Array.isArray(P) ? P : [])[0] || "");
    }
    async function I() {
      if (!S.value) return;
      let E = null;
      const P = `${n.memory.base.value}/items`;
      await n.memory.act(async () => {
        const { data: f } = await et.post(P, {
          kind: o.value,
          scope_family: "agent",
          scope_id: i.value,
          key: _.value,
          value: p.value.trim(),
          content: p.value.trim()
        });
        if (!f || typeof f.item_id != "string" || !f.item_id) throw new Error("Memory create response is missing item_id");
        E = f.item_id;
      }) && E !== null && r("added", E);
    }
    return (E, P) => (u(), c("form", {
      class: "mm-form",
      onSubmit: oe(I, ["prevent"])
    }, [
      d("div", Cn, [
        P[3] || (P[3] = d("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        g(l(Lt), {
          modelValue: o.value,
          "onUpdate:modelValue": P[0] || (P[0] = (z) => o.value = z),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        d("span", Sn, [
          g(l(k), {
            icon: l(G)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          C(m(y.value), 1)
        ])
      ]),
      d("div", _n, [
        P[4] || (P[4] = d("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        l(b).ready.value ? (u(), c("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: i.value ? JSON.stringify([i.value]) : "[]",
          onChange: v
        }, null, 40, zn)) : l(b).failed.value ? (u(), D(l(Et), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: V(() => [
            C("The agent picker could not load: " + m(l(b).failed.value), 1)
          ]),
          _: 1
        })) : h("", !0)
      ]),
      d("div", Ln, [
        P[5] || (P[5] = d("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        g(l(Le), {
          id: "add_topic",
          modelValue: s.value,
          "onUpdate:modelValue": P[1] || (P[1] = (z) => s.value = z),
          placeholder: "e.g. response style",
          invalid: !!L.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        L.value ? (u(), c("span", In, m(L.value), 1)) : (u(), c("span", Pn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        l(B).error.value ? (u(), D(l(Et), {
          key: 2,
          severity: "error",
          size: "small"
        }, {
          default: V(() => [
            C(m(l(B).error.value), 1)
          ]),
          _: 1
        })) : h("", !0),
        x.value.length ? (u(), c("div", Bn, [
          (u(!0), c(T, null, K(x.value, (z) => (u(), c("button", {
            key: z,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (f) => s.value = l(Y)(z)
          }, m(l(Y)(z)), 9, En))), 128))
        ])) : h("", !0)
      ]),
      d("div", An, [
        P[6] || (P[6] = d("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        g(l(Wt), {
          id: "add_text",
          modelValue: p.value,
          "onUpdate:modelValue": P[2] || (P[2] = (z) => p.value = z),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      d("div", Dn, [
        d("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: t.memory.busy.value || !S.value
        }, [
          g(l(k), {
            icon: t.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: F({ spin: t.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          P[7] || (P[7] = C("Add to memory ", -1))
        ], 8, On)
      ])
    ], 32));
  }
}), jn = { class: "mm-view-head" }, Mn = { class: "mm-view-title" }, Vn = {
  key: 0,
  class: "kx-notice error"
}, Fn = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, Rn = { class: "kx-empty-ico" }, Kn = ["aria-label"], Hn = { class: "mm-card-h" }, Nn = { class: "kx-chip" }, Un = { class: "mm-option-main" }, Wn = { class: "mm-option-t" }, Zn = { class: "mm-muted" }, Yn = ["disabled", "onClick"], Xn = ["disabled"], qn = /* @__PURE__ */ N({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(t) {
    const e = t, n = St(() => e.memory.memoryId.value ? `${e.memory.base.value}/conflicts` : null, "groups", e.memory.revision);
    function r(a, o) {
      const i = `${e.memory.base.value}/conflicts/${encodeURIComponent(a.group_id)}/resolve`;
      e.memory.act(() => et.post(i, { winner_id: o.id }));
    }
    return (a, o) => (u(), c(T, null, [
      d("header", jn, [
        d("h2", Mn, [
          g(l(k), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = C("Conflicts", -1))
        ]),
        o[2] || (o[2] = d("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      l(n).error.value ? (u(), c("div", Vn, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, m(l(n).error.value), 1)
      ])) : !l(n).loading.value && !l(n).rows.value.length ? (u(), c("div", Fn, [
        d("span", Rn, [
          g(l(k), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = d("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = d("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : h("", !0),
      (u(!0), c(T, null, K(l(n).rows.value, (i) => (u(), c("section", {
        key: i.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${l(Y)(i.items[0]?.key || "")}`
      }, [
        d("div", Hn, [
          d("span", Nn, m(l(G)[i.items[0]?.kind]?.label), 1),
          C(m(l(Y)(i.items[0]?.key || "")), 1)
        ]),
        (u(!0), c(T, null, K(i.items, (s) => (u(), c("div", {
          key: s.id,
          class: "mm-option"
        }, [
          d("div", Un, [
            d("span", Wn, m(s.content), 1),
            d("span", Zn, m(l(Z)(s.valid_at)) + " · " + m(l(Zt)(s.source)), 1)
          ]),
          d("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: t.memory.busy.value,
            onClick: (p) => r(i, s)
          }, [
            g(l(k), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = C("Keep this ", -1))
          ], 8, Yn)
        ]))), 128))
      ], 8, Kn))), 128)),
      l(n).next.value !== null ? (u(), c("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: l(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...i) => l(n).more && l(n).more(...i))
      }, "Show more conflicts", 8, Xn)) : h("", !0)
    ], 64));
  }
}), Gn = ["aria-label", "title", "aria-pressed", "disabled"], pt = /* @__PURE__ */ N({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    danger: { type: Boolean },
    small: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: e }) {
    const n = e;
    return (r, a) => (u(), c("button", {
      type: "button",
      class: F(["kx-iconbtn", { on: t.active, danger: t.danger, sm: t.small }]),
      "aria-label": t.label,
      title: t.label,
      "aria-pressed": t.active === void 0 ? void 0 : t.active,
      disabled: t.disabled,
      onClick: a[0] || (a[0] = (o) => n("click"))
    }, [
      g(l(k), {
        icon: t.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, Gn));
  }
});
var Gt = {
  name: "WindowMaximizeIcon",
  extends: _t
};
function Jn(t) {
  return no(t) || eo(t) || to(t) || Qn();
}
function Qn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function to(t, e) {
  if (t) {
    if (typeof t == "string") return wt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wt(t, e) : void 0;
  }
}
function eo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function no(t) {
  if (Array.isArray(t)) return wt(t);
}
function wt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function oo(t, e, n, r, a, o) {
  return u(), c("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Jn(e[0] || (e[0] = [d("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Gt.render = oo;
var Jt = {
  name: "WindowMinimizeIcon",
  extends: _t
};
function ro(t) {
  return so(t) || lo(t) || io(t) || ao();
}
function ao() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function io(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function lo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function so(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function uo(t, e, n, r, a, o) {
  return u(), c("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ro(e[0] || (e[0] = [d("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jt.render = uo;
var Qt = {
  name: "SpinnerIcon",
  extends: _t
};
function co(t) {
  return go(t) || mo(t) || po(t) || bo();
}
function bo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function po(t, e) {
  if (t) {
    if (typeof t == "string") return $t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $t(t, e) : void 0;
  }
}
function mo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function go(t) {
  if (Array.isArray(t)) return $t(t);
}
function $t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function fo(t, e, n, r, a, o) {
  return u(), c("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), co(e[0] || (e[0] = [d("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Qt.render = fo;
var vo = `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`, ho = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": bt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Kt(n.value) && !r.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, yo = X.extend({
  name: "badge",
  style: vo,
  classes: ho
}), ko = {
  name: "BaseBadge",
  extends: gt,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: yo,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function at(t) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, at(t);
}
function Dt(t, e, n) {
  return (e = wo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function wo(t) {
  var e = xo(t, "string");
  return at(e) == "symbol" ? e : e + "";
}
function xo(t, e) {
  if (at(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var te = {
  name: "Badge",
  extends: ko,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return W(Dt(Dt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, $o = ["data-p"];
function Co(t, e, n, r, a, o) {
  return u(), c("span", w({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [O(t.$slots, "default", {}, function() {
    return [C(m(t.value), 1)];
  })], 16, $o);
}
te.render = Co;
var So = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: " ";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, it(t);
}
function H(t, e, n) {
  return (e = _o(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _o(t) {
  var e = zo(t, "string");
  return it(e) == "symbol" ? e : e + "";
}
function zo(t, e) {
  if (it(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Lo = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-button p-component", H(H(H(H(H(H(H(H(H({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", H({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Io = X.extend({
  name: "button",
  style: So,
  classes: Lo
}), Po = {
  name: "BaseButton",
  extends: gt,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: [String, Object],
      default: null
    },
    badgeSeverity: {
      type: String,
      default: "secondary"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Io,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, lt(t);
}
function R(t, e, n) {
  return (e = Bo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Bo(t) {
  var e = Eo(t, "string");
  return lt(e) == "symbol" ? e : e + "";
}
function Eo(t, e) {
  if (lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ee = {
  name: "Button",
  extends: Po,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    },
    attrs: function() {
      return w(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        "aria-label": this.defaultAriaLabel,
        "data-pc-name": "button",
        "data-p-disabled": this.disabled,
        "data-p-severity": this.severity
      };
    },
    hasFluid: function() {
      return Kt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return W(R(R(R(R(R(R(R(R(R(R({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return W(R(R({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return W(R(R({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Qt,
    Badge: te
  },
  directives: {
    ripple: ft
  }
}, Ao = ["data-p"], Do = ["data-p"];
function Oo(t, e, n, r, a, o) {
  var i = nt("SpinnerIcon"), s = nt("Badge"), p = Ct("ripple");
  return t.asChild ? O(t.$slots, "default", {
    key: 1,
    class: F(t.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : mt((u(), D(ct(t.as), w({
    key: 0,
    class: t.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: V(function() {
      return [O(t.$slots, "default", {}, function() {
        return [t.loading ? O(t.$slots, "loadingicon", w({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), c("span", w({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), D(i, w({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : O(t.$slots, "icon", w({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), c("span", w({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": o.dataIconP
          }, t.ptm("icon")), null, 16, Ao)) : h("", !0)];
        }), t.label ? (u(), c("span", w({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": o.dataLabelP
        }), m(t.label), 17, Do)) : h("", !0), t.badge ? (u(), D(s, {
          key: 3,
          value: t.badge,
          class: F(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : h("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[p]]);
}
ee.render = Oo;
var To = X.extend({
  name: "focustrap-directive"
}), jo = Ie.extend({
  style: To
});
function st(t) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, st(t);
}
function Ot(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(t, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Tt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Mo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Mo(t, e, n) {
  return (e = Vo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Vo(t) {
  var e = Fo(t, "string");
  return st(e) == "symbol" ? e : e + "";
}
function Fo(t, e) {
  if (st(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ro = jo.extend("focustrap", {
  mounted: function(e, n) {
    var r = n.value || {}, a = r.disabled;
    a || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var r = n.value || {}, a = r.disabled;
    a && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var r = this, a = n.value || {}, o = a.onFocusIn, i = a.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(p) {
          if (p.type === "childList" && !e.contains(document.activeElement)) {
            var b = function(_) {
              var L = Bt(_) ? Bt(_, r.getComputedSelector(e.$_pfocustrap_focusableselector)) ? _ : J(e, r.getComputedSelector(e.$_pfocustrap_focusableselector)) : J(_);
              return bt(L) ? L : _.nextSibling && b(_.nextSibling);
            };
            q(b(p.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(s) {
        return o && o(s);
      }, e.$_pfocustrap_focusoutlistener = function(s) {
        return i && i(s);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Tt(Tt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var r = n.value || {}, a = r.autoFocusSelector, o = a === void 0 ? "" : a, i = r.firstFocusableSelector, s = i === void 0 ? "" : i, p = r.autoFocus, b = p === void 0 ? !1 : p, y = J(e, "[autofocus]".concat(this.getComputedSelector(o)));
      b && !y && (y = J(e, this.getComputedSelector(s))), q(y);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, a = e.relatedTarget, o = a === r.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? J(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_lasthiddenfocusableelement;
      q(o);
    },
    onLastHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, a = e.relatedTarget, o = a === r.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? de(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_firsthiddenfocusableelement;
      q(o);
    },
    createHiddenFocusableElements: function(e, n) {
      var r = this, a = n.value || {}, o = a.tabIndex, i = o === void 0 ? 0 : o, s = a.firstFocusableSelector, p = s === void 0 ? "" : s, b = a.lastFocusableSelector, y = b === void 0 ? "" : b, _ = function(x) {
        return ue("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: i,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(r)
        });
      }, L = _(this.onFirstHiddenElementFocus), S = _(this.onLastHiddenElementFocus);
      L.$_pfocustrap_lasthiddenfocusableelement = S, L.$_pfocustrap_focusableselector = p, L.setAttribute("data-pc-section", "firstfocusableelement"), S.$_pfocustrap_firsthiddenfocusableelement = L, S.$_pfocustrap_focusableselector = y, S.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(L), e.append(S);
    }
  }
});
function jt() {
  be({
    variableName: Ht("scrollbar.width").name
  });
}
function Mt() {
  ce({
    variableName: Ht("scrollbar.width").name
  });
}
var Ko = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, Ho = {
  mask: function(e) {
    var n = e.position, r = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: r ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, No = {
  mask: function(e) {
    var n = e.props, r = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], a = r.find(function(o) {
      return o === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, a ? "p-dialog-".concat(a) : ""];
  },
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && r.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Uo = X.extend({
  name: "dialog",
  style: Ko,
  classes: No,
  inlineStyles: Ho
}), Wo = {
  name: "BaseDialog",
  extends: gt,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: Uo,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, It = {
  name: "Dialog",
  extends: Wo,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: M(function() {
        return e._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && yt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && yt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && ye(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), q(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && yt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(a) {
        return a && a.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && q(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? jt() : Mt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && jt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Mt();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", he(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var r in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(r, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[r], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && ve(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var r = me(e.container), a = ge(e.container), o = n.pageX - e.lastPageX, i = n.pageY - e.lastPageY, s = e.container.getBoundingClientRect(), p = s.left + o, b = s.top + i, y = fe(), _ = getComputedStyle(e.container), L = parseFloat(_.marginLeft), S = parseFloat(_.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (p >= e.minX && p + r < y.width && (e.lastPageX = n.pageX, e.container.style.left = p - L + "px"), b >= e.minY && b + a < y.height && (e.lastPageY = n.pageY, e.container.style.top = b - S + "px")) : (e.lastPageX = n.pageX, e.container.style.left = p - L + "px", e.lastPageY = n.pageY, e.container.style.top = b - S + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return W({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: ft,
    focustrap: Ro
  },
  components: {
    Button: ee,
    Portal: pe,
    WindowMinimizeIcon: Jt,
    WindowMaximizeIcon: Gt,
    TimesIcon: Pe
  }
};
function dt(t) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, dt(t);
}
function Vt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(t, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ft(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Vt(Object(n), !0).forEach(function(r) {
      Zo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Zo(t, e, n) {
  return (e = Yo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Yo(t) {
  var e = Xo(t, "string");
  return dt(e) == "symbol" ? e : e + "";
}
function Xo(t, e) {
  if (dt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qo = ["data-p"], Go = ["aria-labelledby", "aria-modal", "data-p"], Jo = ["id"], Qo = ["data-p"];
function tr(t, e, n, r, a, o) {
  var i = nt("Button"), s = nt("Portal"), p = Ct("focustrap");
  return u(), D(s, {
    appendTo: t.appendTo
  }, {
    default: V(function() {
      return [a.containerVisible ? (u(), c("div", w({
        key: 0,
        ref: o.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return o.onMaskMouseDown && o.onMaskMouseDown.apply(o, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return o.onMaskMouseUp && o.onMaskMouseUp.apply(o, arguments);
        }),
        "data-p": o.dataP
      }, t.ptm("mask")), [g(re, w({
        name: "p-dialog",
        onEnter: o.onEnter,
        onAfterEnter: o.onAfterEnter,
        onBeforeLeave: o.onBeforeLeave,
        onLeave: o.onLeave,
        onAfterLeave: o.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: V(function() {
          return [t.visible ? mt((u(), c("div", w({
            key: 0,
            ref: o.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": o.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": o.dataP
          }, t.ptmi("root")), [t.$slots.container ? O(t.$slots, "container", {
            key: 0,
            closeCallback: o.close,
            maximizeCallback: function(y) {
              return o.maximize(y);
            },
            initDragCallback: o.initDrag
          }) : (u(), c(T, {
            key: 1
          }, [t.showHeader ? (u(), c("div", w({
            key: 0,
            ref: o.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return o.initDrag && o.initDrag.apply(o, arguments);
            })
          }, t.ptm("header")), [O(t.$slots, "header", {
            class: F(t.cx("title"))
          }, function() {
            return [t.header ? (u(), c("span", w({
              key: 0,
              id: o.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), m(t.header), 17, Jo)) : h("", !0)];
          }), d("div", w({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? O(t.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(y) {
              return o.maximize(y);
            }
          }, function() {
            return [g(i, w({
              ref: o.maximizableRef,
              autofocus: a.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: o.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: V(function(b) {
                return [O(t.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(u(), D(ct(o.maximizeIconComponent), w({
                    class: [b.class, a.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : h("", !0), t.closable ? O(t.$slots, "closebutton", {
            key: 1,
            closeCallback: o.close
          }, function() {
            return [g(i, w({
              ref: o.closeButtonRef,
              autofocus: a.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: o.close,
              "aria-label": o.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: V(function(b) {
                return [O(t.$slots, "closeicon", {}, function() {
                  return [(u(), D(ct(t.closeIcon ? "span" : "TimesIcon"), w({
                    class: [t.closeIcon, b.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : h("", !0)], 16)], 16)) : h("", !0), d("div", w({
            ref: o.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": o.dataP
          }, Ft(Ft({}, t.contentProps), t.ptm("content"))), [O(t.$slots, "default")], 16, Qo), t.footer || t.$slots.footer ? (u(), c("div", w({
            key: 1,
            ref: o.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [O(t.$slots, "footer", {}, function() {
            return [C(m(t.footer), 1)];
          })], 16)) : h("", !0)], 64))], 16, Go)), [[p, {
            disabled: !t.modal
          }]]) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, qo)) : h("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
It.render = tr;
const er = { class: "kx-drawer-title" }, nr = /* @__PURE__ */ N({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(t, { emit: e }) {
    const n = e;
    return (r, a) => (u(), D(l(It), {
      visible: t.open,
      position: "right",
      "append-to": "self",
      modal: "",
      "aria-label": t.title,
      closable: !1,
      "dismissable-mask": "",
      class: "kx-drawer",
      pt: { mask: "kx-drawer-mask", header: "kx-drawer-h", content: "kx-drawer-b" },
      "onUpdate:visible": a[1] || (a[1] = (o) => !o && n("close"))
    }, {
      header: V(() => [
        d("span", er, [
          g(l(k), {
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          C(m(t.title), 1)
        ]),
        g(pt, {
          autofocus: "",
          icon: "tabler:x",
          label: "Close",
          onClick: a[0] || (a[0] = (o) => n("close"))
        })
      ]),
      default: V(() => [
        O(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["visible", "aria-label"]));
  }
}), or = { class: "kx-modal-h-ico" }, rr = { class: "kx-modal-h-text" }, ar = { class: "kx-modal-h-title" }, ir = {
  key: 0,
  class: "kx-modal-h-sub"
}, lr = ["disabled"], sr = ["disabled"], dr = /* @__PURE__ */ N({
  __name: "ConfirmDialog",
  props: {
    open: { type: Boolean },
    title: {},
    subtitle: {},
    icon: { default: "tabler:alert-circle" },
    danger: { type: Boolean },
    busy: { type: Boolean },
    confirmLabel: { default: "Confirm" }
  },
  emits: ["confirm", "cancel"],
  setup(t, { emit: e }) {
    const n = e;
    return (r, a) => (u(), D(l(It), {
      visible: t.open,
      modal: "",
      "append-to": "self",
      role: "alertdialog",
      "aria-label": t.title,
      closable: !1,
      "close-on-escape": !t.busy,
      "dismissable-mask": !t.busy,
      class: F(["kx-modal", { danger: t.danger }]),
      pt: { mask: "kx-modal-mask", header: "kx-modal-h", content: "kx-modal-body", footer: "kx-modal-foot" },
      "onUpdate:visible": a[3] || (a[3] = (o) => !o && n("cancel"))
    }, {
      header: V(() => [
        d("span", or, [
          g(l(k), {
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        d("span", rr, [
          d("span", ar, m(t.title), 1),
          t.subtitle ? (u(), c("span", ir, m(t.subtitle), 1)) : h("", !0)
        ]),
        g(pt, {
          icon: "tabler:x",
          label: "Close",
          disabled: t.busy,
          onClick: a[0] || (a[0] = (o) => n("cancel"))
        }, null, 8, ["disabled"])
      ]),
      footer: V(() => [
        d("button", {
          type: "button",
          autofocus: "",
          class: "kx-btn kx-btn-ghost",
          disabled: t.busy,
          onClick: a[1] || (a[1] = (o) => n("cancel"))
        }, "Cancel", 8, lr),
        d("button", {
          type: "button",
          class: F(["kx-btn", t.danger ? "kx-btn-danger" : "kx-btn-primary"]),
          disabled: t.busy,
          onClick: a[2] || (a[2] = (o) => n("confirm"))
        }, [
          t.busy ? (u(), D(l(k), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : h("", !0),
          C(m(t.confirmLabel), 1)
        ], 10, sr)
      ]),
      default: V(() => [
        O(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["visible", "aria-label", "close-on-escape", "dismissable-mask", "class"]));
  }
}), ur = {
  key: 0,
  class: "kx-notice error"
}, cr = {
  key: 1,
  class: "mm-skel-reader"
}, br = {
  key: 2,
  class: "mm-reader"
}, pr = { class: "mm-head" }, mr = { class: "mm-head-body" }, gr = { class: "mm-head-top" }, fr = { class: "kx-chip" }, vr = { class: "mm-topic" }, hr = { class: "mm-head-acts" }, yr = ["disabled"], kr = ["disabled"], wr = ["disabled"], xr = {
  key: 0,
  class: "mm-edit"
}, $r = { class: "mm-edit-acts" }, Cr = ["disabled"], Sr = {
  key: 1,
  class: "mm-title"
}, _r = { class: "mm-facts" }, zr = { class: "mm-fact" }, Lr = ["title"], Ir = ["title"], Pr = ["title"], Br = { class: "mm-fact" }, Er = {
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, Ar = { class: "mm-timeline" }, Dr = { class: "mm-tl-body" }, Or = { class: "mm-tl-t" }, Tr = { class: "mm-tl-s" }, jr = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, Mr = {
  key: 0,
  class: "mm-muted"
}, Vr = {
  key: 1,
  class: "mm-sources"
}, Fr = ["title"], Rr = /* @__PURE__ */ N({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone"],
  setup(t, { emit: e }) {
    const n = t, r = e, a = A(null), o = A([]), i = A(null), s = A([]), p = A(""), b = A(null), y = A(!1), _ = M(() => `${n.memory.base.value}/items/${encodeURIComponent(n.itemId)}`), L = M(() => a.value ? G[a.value.kind] : null), S = M(() => a.value?.status === "current" || a.value?.status === "conflict");
    let B = 0;
    async function x(z = 0) {
      const f = ++B, $ = _.value;
      try {
        const { data: j } = await et.get(z ? `${$}?offset=${z}` : $);
        if (f !== B) return;
        if (!Q(j) || !Q(j.item) || !Array.isArray(j.provenance)) throw new Error("Memory detail response is malformed");
        if (!z) {
          const Pt = j.item;
          if (Pt.status === "forgotten") {
            r("gone");
            return;
          }
          a.value = Pt, s.value = j.provenance;
        }
        const vt = ke(j, "versions");
        o.value = z ? [...o.value, ...vt.rows] : vt.rows, i.value = vt.next, p.value = "";
      } catch (j) {
        if (f !== B) return;
        Q(j) && Q(j.response) && j.response.status === 404 ? r("gone") : p.value = Nt(j);
      }
    }
    U(() => n.itemId, () => {
      a.value = null, o.value = [], b.value = null, y.value = !1, x();
    }, { immediate: !0 }), U(n.memory.revision, () => {
      x();
    });
    function v(z) {
      const f = `${_.value}/${z}`;
      return n.memory.act(() => et.post(f, {}));
    }
    async function I() {
      const z = (b.value || "").trim();
      if (!z || !a.value) return;
      const f = _.value;
      await n.memory.act(async () => {
        const { data: j } = await et.put(f, { content: z });
        Q(j) && typeof j.item_id == "string" && j.item_id !== n.itemId && r("replaced", j.item_id);
      }) && (b.value = null);
    }
    async function E() {
      await v("forget") && (y.value = !1, r("gone"));
    }
    function P(z) {
      return z.host_kind === "session" ? "Conversation" : z.host_kind === "dataflow" ? "Workflow run" : z.host_kind === "content" ? "Document" : z.host_kind;
    }
    return (z, f) => (u(), c(T, null, [
      p.value ? (u(), c("div", ur, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, m(p.value), 1)
      ])) : a.value ? (u(), c("article", br, [
        d("header", pr, [
          d("span", {
            class: F(["mm-head-ic", L.value?.group])
          }, [
            g(l(k), {
              icon: L.value?.icon || "tabler:note",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          d("div", mr, [
            d("div", gr, [
              d("span", fr, m(L.value?.label), 1),
              d("span", vr, m(l(Y)(a.value.key)), 1),
              a.value.status !== "current" ? (u(), D(l(zt), {
                key: 0,
                class: "kx-tag-sm",
                severity: l(Ut)(a.value.status),
                value: a.value.status
              }, null, 8, ["severity", "value"])) : h("", !0),
              d("span", hr, [
                S.value && b.value === null ? (u(), c("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[0] || (f[0] = ($) => b.value = a.value.content)
                }, [
                  g(l(k), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  f[8] || (f[8] = C("Edit ", -1))
                ])) : h("", !0),
                S.value ? (u(), c("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: t.memory.busy.value,
                  onClick: f[1] || (f[1] = ($) => v("archive"))
                }, [
                  g(l(k), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  f[9] || (f[9] = C("Archive ", -1))
                ], 8, yr)) : h("", !0),
                a.value.status === "archived" ? (u(), c("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: t.memory.busy.value,
                  onClick: f[2] || (f[2] = ($) => v("restore"))
                }, [
                  g(l(k), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  f[10] || (f[10] = C("Restore ", -1))
                ], 8, kr)) : h("", !0),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: t.memory.busy.value,
                  onClick: f[3] || (f[3] = ($) => y.value = !0)
                }, [
                  g(l(k), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  f[11] || (f[11] = C("Forget ", -1))
                ], 8, wr)
              ])
            ]),
            b.value !== null ? (u(), c("div", xr, [
              g(l(Wt), {
                modelValue: b.value,
                "onUpdate:modelValue": f[4] || (f[4] = ($) => b.value = $),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              d("div", $r, [
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: t.memory.busy.value || !b.value.trim(),
                  onClick: I
                }, [
                  g(l(k), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  f[12] || (f[12] = C("Save text ", -1))
                ], 8, Cr),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[5] || (f[5] = ($) => b.value = null)
                }, "Cancel")
              ])
            ])) : (u(), c("h2", Sr, m(a.value.content), 1)),
            d("div", _r, [
              d("span", zr, [
                g(l(k), {
                  icon: "tabler:user-circle",
                  "aria-hidden": "true"
                }),
                C(m(l(Ke)(a.value)), 1)
              ]),
              d("span", {
                class: "mm-fact",
                title: l(tt)(a.value.valid_at)
              }, [
                g(l(k), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                C("True since " + m(l(Z)(a.value.valid_at)), 1)
              ], 8, Lr),
              a.value.invalid_at ? (u(), c("span", {
                key: 0,
                class: "mm-fact",
                title: l(tt)(a.value.invalid_at)
              }, [
                g(l(k), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                C("Until " + m(l(Z)(a.value.invalid_at)), 1)
              ], 8, Ir)) : h("", !0),
              d("span", {
                class: "mm-fact",
                title: l(tt)(a.value.recorded_at)
              }, [
                g(l(k), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                C(m(l(Zt)(a.value.source)), 1)
              ], 8, Pr),
              d("span", Br, [
                g(l(k), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                C(m(a.value.cardinality === "single" ? "One value at a time" : "Can hold several values"), 1)
              ])
            ])
          ])
        ]),
        d("section", Er, [
          f[14] || (f[14] = d("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          d("ol", Ar, [
            (u(!0), c(T, null, K(o.value, ($) => (u(), c("li", {
              key: $.id,
              class: F({ now: $.id === a.value.id, past: $.status !== "current" })
            }, [
              f[13] || (f[13] = d("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              d("span", Dr, [
                d("span", Or, m($.content), 1),
                d("span", Tr, [
                  C("v" + m($.version) + " · " + m(l(Z)($.valid_at)), 1),
                  $.status !== "current" ? (u(), c(T, { key: 0 }, [
                    C(" · " + m($.status), 1)
                  ], 64)) : h("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          i.value !== null ? (u(), c("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: f[6] || (f[6] = ($) => x(i.value))
          }, "Show older versions")) : h("", !0)
        ]),
        d("section", jr, [
          f[15] || (f[15] = d("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          s.value.length ? (u(), c("ul", Vr, [
            (u(!0), c(T, null, K(s.value, ($) => (u(), c("li", {
              key: $.host_kind + $.host_id + $.event_id
            }, [
              g(l(k), {
                icon: "tabler:message-circle",
                "aria-hidden": "true"
              }),
              d("span", null, m(P($)), 1),
              $.recorded_at ? (u(), c("span", {
                key: 0,
                class: "mm-muted",
                title: l(tt)($.recorded_at)
              }, m(l(Z)($.recorded_at)), 9, Fr)) : h("", !0)
            ]))), 128))
          ])) : (u(), c("p", Mr, m(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (u(), c("div", cr, [
        (u(), c(T, null, K(4, ($) => d("div", {
          key: $,
          class: "mm-skel-line"
        })), 64))
      ])),
      g(dr, {
        open: y.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? l(Y)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: t.memory.busy.value,
        onCancel: f[7] || (f[7] = ($) => y.value = !1),
        onConfirm: E
      }, {
        default: V(() => [...f[16] || (f[16] = [
          C(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), Kr = { class: "mm-rail-tools" }, Hr = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, Nr = {
  key: 0,
  class: "mm-skel"
}, Ur = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Wr = {
  key: 2,
  class: "mm-rail-empty"
}, Zr = ["aria-expanded", "onClick"], Yr = { class: "kx-railsec-t" }, Xr = { class: "count" }, qr = { class: "kx-railsec-b" }, Gr = ["aria-current", "onClick"], Jr = { class: "mm-row-main" }, Qr = { class: "mm-row-t" }, ta = { class: "mm-row-s" }, ea = ["disabled"], na = /* @__PURE__ */ N({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered"],
  setup(t, { emit: e }) {
    const n = t, r = e, a = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = A("current"), i = A(""), s = A("");
    let p;
    U(i, (S) => {
      clearTimeout(p), p = setTimeout(() => {
        s.value = S.trim();
      }, 250);
    }), ae(() => clearTimeout(p));
    const b = St(() => {
      if (!n.memory.memoryId.value) return null;
      const S = new URLSearchParams({ status: o.value, limit: "100" });
      return s.value && S.set("q", s.value), `${n.memory.base.value}/items?${S.toString()}`;
    }, "items", n.memory.revision);
    U([o, s], () => r("filtered"));
    const y = A({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), _ = M(() => Re.map((S) => ({ ...S, items: b.rows.value.filter((B) => G[B.kind]?.group === S.id) })).filter((S) => S.items.length)), L = M(() => s.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (S, B) => (u(), c(T, null, [
      d("div", Kr, [
        g(Se, {
          modelValue: i.value,
          "onUpdate:modelValue": B[0] || (B[0] = (x) => i.value = x),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        g(l(Lt), {
          modelValue: o.value,
          "onUpdate:modelValue": B[1] || (B[1] = (x) => o.value = x),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      d("nav", Hr, [
        l(b).loading.value && !l(b).rows.value.length ? (u(), c("div", Nr, [
          (u(), c(T, null, K(6, (x) => d("div", {
            key: x,
            class: "mm-skel-row"
          })), 64))
        ])) : l(b).error.value ? (u(), c("div", Ur, [
          g(l(k), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          d("span", null, m(l(b).error.value), 1)
        ])) : l(b).rows.value.length ? h("", !0) : (u(), c("div", Wr, m(L.value), 1)),
        (u(!0), c(T, null, K(_.value, (x) => (u(), c("div", {
          key: x.id,
          class: F(["kx-railsec", { closed: y.value[x.id] }])
        }, [
          d("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !y.value[x.id],
            onClick: (v) => y.value[x.id] = !y.value[x.id]
          }, [
            g(l(k), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            g(l(k), {
              class: "kx-railsec-ic",
              icon: x.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", Yr, m(x.title), 1),
            d("span", Xr, m(x.items.length), 1)
          ], 8, Zr),
          mt(d("div", qr, [
            (u(!0), c(T, null, K(x.items, (v) => (u(), c("button", {
              key: v.id,
              type: "button",
              class: F(["mm-row", { on: t.selectedId === v.id }]),
              "aria-current": t.selectedId === v.id ? "true" : void 0,
              onClick: (I) => r("select", v)
            }, [
              d("span", {
                class: F(["mm-row-ic", l(G)[v.kind]?.group])
              }, [
                g(l(k), {
                  icon: l(G)[v.kind]?.icon || "tabler:note",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              d("span", Jr, [
                d("span", Qr, m(v.content), 1),
                d("span", ta, m(l(Y)(v.key)) + " · " + m(l(Z)(v.valid_at)), 1)
              ])
            ], 10, Gr))), 128))
          ], 512), [
            [ie, !y.value[x.id]]
          ])
        ], 2))), 128)),
        l(b).next.value !== null ? (u(), c("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: l(b).loading.value,
          onClick: B[2] || (B[2] = //@ts-ignore
          (...x) => l(b).more && l(b).more(...x))
        }, [
          l(b).loading.value ? (u(), D(l(k), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : h("", !0),
          B[3] || (B[3] = C("Show more ", -1))
        ], 8, ea)) : h("", !0)
      ])
    ], 64));
  }
}), oa = {
  key: 0,
  class: "kx-notice error"
}, ra = {
  key: 1,
  class: "mm-page"
}, aa = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, ia = { class: "kx-shell" }, la = { class: "kx-rail" }, sa = { class: "kx-railhead" }, da = { class: "kx-railhead-title" }, ua = { key: 0 }, ca = { class: "kx-railhead-acts" }, ba = { class: "kx-main" }, pa = { class: "kx-main-scroll mm-main" }, ma = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, ga = { class: "kx-empty-ico" }, fa = /* @__PURE__ */ N({
  __name: "MemoryManage",
  setup(t) {
    const e = we(), n = xe(), r = A(""), a = A({});
    U(() => e.value.config, (v) => {
      try {
        a.value = $e(v), r.value = "";
      } catch (I) {
        r.value = Nt(I);
      }
    }, { immediate: !0 });
    const o = _e(M(() => String(a.value.kb_id || ""))), i = A("item"), s = A(String(a.value.route || "")), p = A(!1), b = M(() => o.status.value?.counts.current), y = M(() => o.status.value?.counts.conflict_groups || 0), _ = M(() => (o.status.value?.runs || []).filter((v) => v.status === "failed").length);
    U(() => a.value.route, (v) => {
      typeof v == "string" && v && v !== s.value && (s.value = v, i.value = "item");
    }), U(o.memoryId, () => {
      s.value = "", i.value = "item";
    });
    function L(v) {
      i.value = "item", v !== s.value && (s.value = v, n("navigate", v));
    }
    function S(v) {
      L(v.id);
    }
    function B(v) {
      i.value = i.value === v ? "item" : v;
    }
    function x(v) {
      p.value = !1, v && L(v);
    }
    return (v, I) => r.value ? (u(), c("div", oa, m(r.value), 1)) : (u(), c("div", ra, [
      l(o).error.value ? (u(), c("div", aa, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, m(l(o).error.value), 1)
      ])) : h("", !0),
      d("div", ia, [
        d("aside", la, [
          d("div", sa, [
            d("span", da, [
              I[6] || (I[6] = C("Memories", -1)),
              b.value !== void 0 ? (u(), c("b", ua, m(b.value), 1)) : h("", !0)
            ]),
            d("div", ca, [
              g(pt, {
                icon: "tabler:activity",
                label: _.value ? `Activity, ${_.value} failed` : "Activity",
                active: i.value === "activity",
                onClick: I[0] || (I[0] = (E) => B("activity"))
              }, null, 8, ["label", "active"]),
              g(pt, {
                icon: "tabler:plus",
                label: "Add agent memory",
                active: p.value,
                onClick: I[1] || (I[1] = (E) => p.value = !0)
              }, null, 8, ["active"])
            ])
          ]),
          y.value ? (u(), c("button", {
            key: 0,
            type: "button",
            class: F(["mm-conflict-bar", { on: i.value === "conflicts" }]),
            onClick: I[2] || (I[2] = (E) => B("conflicts"))
          }, [
            g(l(k), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            d("span", null, m(y.value === 1 ? "1 conflict to resolve" : `${y.value} conflicts to resolve`), 1),
            g(l(k), {
              class: "mm-conflict-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : h("", !0),
          g(na, {
            memory: l(o),
            "selected-id": i.value === "item" ? s.value : "",
            onSelect: S,
            onFiltered: I[3] || (I[3] = (E) => s.value = "")
          }, null, 8, ["memory", "selected-id"])
        ]),
        d("main", ba, [
          d("div", pa, [
            i.value === "conflicts" ? (u(), D(qn, {
              key: 0,
              memory: l(o)
            }, null, 8, ["memory"])) : i.value === "activity" ? (u(), D(tn, {
              key: 1,
              memory: l(o)
            }, null, 8, ["memory"])) : s.value ? (u(), D(Rr, {
              key: s.value,
              memory: l(o),
              "item-id": s.value,
              onReplaced: L,
              onGone: I[4] || (I[4] = (E) => s.value = "")
            }, null, 8, ["memory", "item-id"])) : (u(), c("div", ma, [
              d("span", ga, [
                g(l(k), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              I[7] || (I[7] = d("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              I[8] || (I[8] = d("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      g(nr, {
        open: p.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: I[5] || (I[5] = (E) => p.value = !1)
      }, {
        default: V(() => [
          p.value ? (u(), D(Tn, {
            key: 0,
            memory: l(o),
            onAdded: x
          }, null, 8, ["memory"])) : h("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), va = Ce(fa, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
le(import.meta.url, va);
//# sourceMappingURL=index.js.map
