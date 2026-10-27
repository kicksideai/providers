import { openBlock as d, createElementBlock as b, mergeProps as w, createBlock as O, resolveDynamicComponent as ct, createCommentVNode as y, renderSlot as D, createElementVNode as s, toDisplayString as m, defineComponent as N, computed as M, Fragment as T, createVNode as g, unref as l, createTextVNode as C, renderList as K, normalizeClass as V, resolveDirective as Ct, withDirectives as mt, resolveComponent as nt, createSlots as ee, withCtx as R, ref as A, watch as U, withModifiers as ne, Transition as oe, vShow as re } from "vue";
import { Icon as k } from "@iconify/vue";
import { api as et, define as ae } from "@wippy-fe/proxy";
import { B as X, d as gt, f as W, c as Ft, s as bt, k as ht, g as ut, h as ie, l as Rt, L as le, j as q, v as J, U as se, I as Bt, n as de, r as Kt, o as ue, q as ce, t as be, C as pe, w as me, S as ge, _ as fe, W as ve, i as Q, x as he, e as Ht, u as ye, a as ke, b as we, m as xe } from "./types-B7VilOFV.js";
import { s as Nt, u as St, _ as $e, a as Ce } from "./useMemory-C3qy8kGk.js";
import { R as ft, u as Se, d as _e, b as ze, e as Ut, s as _t, B as Le, a as Ie } from "./useWidget-SFloqZkE.js";
function Pe() {
  let t = [], e = (u, i, c = 999) => {
    let p = a(u, i, c), v = p.value + (p.key === u ? 0 : c) + 1;
    return t.push({ key: u, value: v }), v;
  }, n = (u) => {
    t = t.filter((i) => i.value !== u);
  }, o = (u, i) => a(u).value, a = (u, i, c = 0) => [...t].reverse().find((p) => !0) || { key: u, value: c }, r = (u) => u && parseInt(u.style.zIndex, 10) || 0;
  return { get: r, set: (u, i, c) => {
    i && (i.style.zIndex = String(e(u, !0, c)));
  }, clear: (u) => {
    u && (n(r(u)), u.style.zIndex = "");
  }, getCurrent: (u) => o(u) };
}
var yt = Pe(), Be = `
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
`, Ee = {
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
}, Ae = X.extend({
  name: "tag",
  style: Be,
  classes: Ee
}), De = {
  name: "BaseTag",
  extends: gt,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Ae,
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
function Oe(t, e, n) {
  return (e = Te(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Te(t) {
  var e = je(t, "string");
  return ot(e) == "symbol" ? e : e + "";
}
function je(t, e) {
  if (ot(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zt = {
  name: "Tag",
  extends: De,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return W(Oe({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Me = ["data-p"];
function Ve(t, e, n, o, a, r) {
  return d(), b("span", w({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (d(), O(ct(t.$slots.icon), w({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (d(), b("span", w({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : y("", !0), t.value != null || t.$slots.default ? D(t.$slots, "default", {
    key: 2
  }, function() {
    return [s("span", w({
      class: t.cx("label")
    }, t.ptm("label")), m(t.value), 17)];
  }) : y("", !0)], 16, Me);
}
zt.render = Ve;
const G = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people" },
  fact: { label: "Fact", icon: "tabler:note", group: "people" }
}, Fe = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route" },
  { id: "people", title: "About people", icon: "tabler:users" }
];
function Y(t) {
  const e = t.replace(/[_\-.]+/g, " ").trim();
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : t;
}
function Re(t) {
  return t.scope_family === "agent" ? "The agent" : "A person it talked with";
}
const Ke = {
  capture: "learned in conversation",
  tool: "saved by the agent",
  reflection: "from consolidation",
  owner: "added by a person"
};
function Wt(t) {
  return Ke[t] || t;
}
function Zt(t) {
  return t ? Date.parse(t.includes("T") ? t : t.replace(" ", "T") + "Z") : NaN;
}
function tt(t) {
  const e = Zt(t);
  return Number.isFinite(e) ? new Date(e).toLocaleString() : "";
}
const He = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function Z(t, e = Date.now()) {
  const n = Zt(t);
  if (!Number.isFinite(n)) return "";
  const o = Math.round((n - e) / 1e3), a = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [r, u] of He)
    if (Math.abs(o) >= u) return a.format(Math.round(o / u), r);
  return "just now";
}
const Ne = { class: "mm-view-head" }, Ue = { class: "mm-view-title" }, We = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, Ze = { class: "kx-empty-ico" }, Ye = {
  key: 1,
  class: "mm-runs"
}, Xe = { class: "mm-run-main" }, qe = { class: "mm-run-t" }, Ge = ["title"], Je = {
  key: 0,
  class: "mm-muted"
}, Qe = {
  key: 1,
  class: "mm-run-err"
}, tn = /* @__PURE__ */ N({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(t) {
    const e = t, n = M(() => e.memory.status.value?.runs || []);
    function o(u) {
      return u.run_type === "consolidate" ? "Consolidation" : u.run_type === "reembed" ? "Re-embedding" : u.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function a(u) {
      const i = u.stats || {}, c = [
        i.added ? `${i.added} new` : "",
        i.superseded ? `${i.superseded} updated` : "",
        i.conflicted ? `${i.conflicted} contested` : "",
        i.rejected ? `${i.rejected} rejected` : ""
      ].filter(Boolean);
      return c.length ? c.join(" · ") : u.status === "succeeded" ? "No changes" : "";
    }
    function r(u) {
      return Object.entries(u.stats || {}).filter(([i, c]) => i.startsWith("rejected_") && c > 0).sort(([i], [c]) => i.localeCompare(c)).map(([i, c]) => {
        const [p, ...v] = i.slice(9).split("_");
        return `${p}: ${v.join(" ")} (${c})`;
      }).join(" · ");
    }
    return (u, i) => (d(), b(T, null, [
      s("header", Ne, [
        s("h2", Ue, [
          g(l(k), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          i[0] || (i[0] = C("Activity", -1))
        ]),
        i[1] || (i[1] = s("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (d(), b("ol", Ye, [
        (d(!0), b(T, null, K(n.value, (c) => (d(), b("li", {
          key: c.id,
          class: V(["mm-run", c.status])
        }, [
          s("div", Xe, [
            s("span", qe, m(o(c)), 1),
            s("span", {
              class: "mm-muted",
              title: l(tt)(c.finished_at || c.started_at || c.created_at)
            }, [
              C(m(l(Z)(c.finished_at || c.started_at || c.created_at)), 1),
              a(c) ? (d(), b(T, { key: 0 }, [
                C(" · " + m(a(c)), 1)
              ], 64)) : y("", !0)
            ], 8, Ge),
            r(c) ? (d(), b("span", Je, m(r(c)), 1)) : y("", !0),
            c.last_error ? (d(), b("span", Qe, m(c.last_error), 1)) : y("", !0)
          ]),
          c.status !== "succeeded" ? (d(), O(l(zt), {
            key: 0,
            class: "kx-tag-sm",
            severity: l(Nt)(c.status),
            value: c.status
          }, null, 8, ["severity", "value"])) : y("", !0)
        ], 2))), 128))
      ])) : (d(), b("div", We, [
        s("span", Ze, [
          g(l(k), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        i[2] || (i[2] = s("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        i[3] || (i[3] = s("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
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
    var n = e.instance, o = e.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": o.fluid,
      "p-togglebutton-sm p-inputfield-sm": o.size === "small",
      "p-togglebutton-lg p-inputfield-lg": o.size === "large"
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
  extends: Ft,
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
    var o = n.call(t, e);
    if (rt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Yt = {
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
      var n, o;
      (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, e);
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
function cn(t, e, n, o, a, r) {
  var u = Ct("ripple");
  return mt((d(), b("button", w({
    type: "button",
    class: t.cx("root"),
    tabindex: t.tabindex,
    disabled: t.disabled,
    "aria-pressed": t.d_value,
    onClick: e[0] || (e[0] = function() {
      return r.onChange && r.onChange.apply(r, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    })
  }, r.getPTOptions("root"), {
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "data-p-checked": r.active,
    "data-p-disabled": t.disabled,
    "data-p": r.dataP
  }), [s("span", w({
    class: t.cx("content")
  }, r.getPTOptions("content"), {
    "data-p": r.dataP
  }), [D(t.$slots, "default", {}, function() {
    return [D(t.$slots, "icon", {
      value: t.d_value,
      class: V(t.cx("icon"))
    }, function() {
      return [t.onIcon || t.offIcon ? (d(), b("span", w({
        key: 0,
        class: [t.cx("icon"), t.d_value ? t.onIcon : t.offIcon]
      }, r.getPTOptions("icon")), null, 16)) : y("", !0)];
    }), s("span", w({
      class: t.cx("label")
    }, r.getPTOptions("label")), m(r.label), 17)];
  })], 16, un)], 16, dn)), [[u]]);
}
Yt.render = cn;
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
    var n = e.props, o = e.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
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
  extends: Ft,
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
    if (Array.isArray(t) || (n = Xt(t)) || e) {
      n && (t = n);
      var o = 0, a = function() {
      };
      return { s: a, n: function() {
        return o >= t.length ? { done: !0 } : { done: !1, value: t[o++] };
      }, e: function(p) {
        throw p;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var r, u = !0, i = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var p = n.next();
    return u = p.done, p;
  }, e: function(p) {
    i = !0, r = p;
  }, f: function() {
    try {
      u || n.return == null || n.return();
    } finally {
      if (i) throw r;
    }
  } };
}
function vn(t) {
  return kn(t) || yn(t) || Xt(t) || hn();
}
function hn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xt(t, e) {
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
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
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
    onOptionSelect: function(e, n, o) {
      var a = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var r = this.isSelected(n), u = this.getOptionValue(n), i;
        if (this.multiple)
          if (r) {
            if (i = this.d_value.filter(function(c) {
              return !ht(c, u, a.equalityKey);
            }), !this.allowEmpty && i.length === 0) return;
          } else
            i = this.d_value ? [].concat(vn(this.d_value), [u]) : [u];
        else {
          if (r && !this.allowEmpty) return;
          i = r ? null : u;
        }
        this.writeValue(i, e), this.$emit("change", {
          originalEvent: e,
          value: i
        });
      }
    },
    isSelected: function(e) {
      var n = !1, o = this.getOptionValue(e);
      if (this.multiple) {
        if (this.d_value) {
          var a = fn(this.d_value), r;
          try {
            for (a.s(); !(r = a.n()).done; ) {
              var u = r.value;
              if (ht(u, o, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (i) {
            a.e(i);
          } finally {
            a.f();
          }
        }
      } else
        n = ht(this.d_value, o, this.equalityKey);
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
    ToggleButton: Yt
  }
}, wn = ["aria-labelledby", "data-p"];
function xn(t, e, n, o, a, r) {
  var u = nt("ToggleButton");
  return d(), b("div", w({
    class: t.cx("root"),
    role: "group",
    "aria-labelledby": t.ariaLabelledby
  }, t.ptmi("root"), {
    "data-p": r.dataP
  }), [(d(!0), b(T, null, K(t.options, function(i, c) {
    return d(), O(u, {
      key: r.getOptionRenderKey(i),
      modelValue: r.isSelected(i),
      onLabel: r.getOptionLabel(i),
      offLabel: r.getOptionLabel(i),
      disabled: t.disabled || r.isOptionDisabled(i),
      unstyled: t.unstyled,
      size: t.size,
      readonly: r.isOptionReadonly(i),
      onChange: function(v) {
        return r.onOptionSelect(v, i, c);
      },
      pt: t.ptm("pcToggleButton")
    }, ee({
      _: 2
    }, [t.$slots.option ? {
      name: "default",
      fn: R(function() {
        return [D(t.$slots, "option", {
          option: i,
          index: c
        }, function() {
          return [s("span", w({
            ref_for: !0
          }, t.ptm("pcToggleButton").label), m(r.getOptionLabel(i)), 17)];
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
function Et(t) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(t);
}
const Cn = { class: "mm-field" }, Sn = { class: "mm-hint" }, _n = { class: "mm-field" }, zn = ["selected"], Ln = { class: "mm-field" }, In = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Pn = {
  key: 1,
  class: "mm-hint"
}, Bn = {
  key: 2,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, En = ["onClick"], An = { class: "mm-field" }, Dn = { class: "mm-form-foot" }, On = ["disabled"], Tn = /* @__PURE__ */ N({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(t, { emit: e }) {
    const n = t, o = e, a = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], r = A("rule"), u = A(""), i = A(""), c = A(""), p = Se("wc-agent-picker"), v = M(() => a.find((E) => E.value === r.value)?.hint || ""), _ = M(() => $n(i.value)), L = M(() => i.value && !Et(_.value) ? "Use a short topic of letters, digits and spaces." : ""), S = M(() => !!u.value && Et(_.value) && !!c.value.trim()), B = St(
      () => n.memory.memoryId.value ? `${n.memory.base.value}/topics?scope_family=agent&kind=${r.value}` : null,
      "topics",
      n.memory.revision
    ), x = M(() => B.rows.value.map((E) => E.key).filter((E) => E !== _.value).slice(0, 8));
    U(r, () => {
      i.value = "";
    });
    function h(E) {
      const P = ie(E).selected;
      u.value = String((Array.isArray(P) ? P : [])[0] || "");
    }
    async function I() {
      if (!S.value) return;
      let E = null;
      const P = `${n.memory.base.value}/items`;
      await n.memory.act(async () => {
        const { data: f } = await et.post(P, {
          kind: r.value,
          scope_family: "agent",
          scope_id: u.value,
          key: _.value,
          value: c.value.trim(),
          content: c.value.trim()
        });
        if (!f || typeof f.item_id != "string" || !f.item_id) throw new Error("Memory create response is missing item_id");
        E = f.item_id;
      }) && E !== null && o("added", E);
    }
    return (E, P) => (d(), b("form", {
      class: "mm-form",
      onSubmit: ne(I, ["prevent"])
    }, [
      s("div", Cn, [
        P[3] || (P[3] = s("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        g(l(Lt), {
          modelValue: r.value,
          "onUpdate:modelValue": P[0] || (P[0] = (z) => r.value = z),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        s("span", Sn, [
          g(l(k), {
            icon: l(G)[r.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          C(m(v.value), 1)
        ])
      ]),
      s("div", _n, [
        P[4] || (P[4] = s("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        l(p).ready.value ? (d(), b("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: u.value ? JSON.stringify([u.value]) : "[]",
          onChange: h
        }, null, 40, zn)) : l(p).failed.value ? (d(), O(l(_e), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: R(() => [
            C("The agent picker could not load: " + m(l(p).failed.value), 1)
          ]),
          _: 1
        })) : y("", !0)
      ]),
      s("div", Ln, [
        P[5] || (P[5] = s("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        g(l(ze), {
          id: "add_topic",
          modelValue: i.value,
          "onUpdate:modelValue": P[1] || (P[1] = (z) => i.value = z),
          placeholder: "e.g. response style",
          invalid: !!L.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        L.value ? (d(), b("span", In, m(L.value), 1)) : (d(), b("span", Pn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        x.value.length ? (d(), b("div", Bn, [
          (d(!0), b(T, null, K(x.value, (z) => (d(), b("button", {
            key: z,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (f) => i.value = l(Y)(z)
          }, m(l(Y)(z)), 9, En))), 128))
        ])) : y("", !0)
      ]),
      s("div", An, [
        P[6] || (P[6] = s("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        g(l(Ut), {
          id: "add_text",
          modelValue: c.value,
          "onUpdate:modelValue": P[2] || (P[2] = (z) => c.value = z),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      s("div", Dn, [
        s("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: t.memory.busy.value || !S.value
        }, [
          g(l(k), {
            icon: t.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: V({ spin: t.memory.busy.value }),
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
    function o(a, r) {
      const u = `${e.memory.base.value}/conflicts/${encodeURIComponent(a.group_id)}/resolve`;
      e.memory.act(() => et.post(u, { winner_id: r.id }));
    }
    return (a, r) => (d(), b(T, null, [
      s("header", jn, [
        s("h2", Mn, [
          g(l(k), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          r[1] || (r[1] = C("Conflicts", -1))
        ]),
        r[2] || (r[2] = s("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      l(n).error.value ? (d(), b("div", Vn, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        s("span", null, m(l(n).error.value), 1)
      ])) : !l(n).loading.value && !l(n).rows.value.length ? (d(), b("div", Fn, [
        s("span", Rn, [
          g(l(k), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        r[3] || (r[3] = s("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        r[4] || (r[4] = s("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : y("", !0),
      (d(!0), b(T, null, K(l(n).rows.value, (u) => (d(), b("section", {
        key: u.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${l(Y)(u.items[0]?.key || "")}`
      }, [
        s("div", Hn, [
          s("span", Nn, m(l(G)[u.items[0]?.kind]?.label), 1),
          C(m(l(Y)(u.items[0]?.key || "")), 1)
        ]),
        (d(!0), b(T, null, K(u.items, (i) => (d(), b("div", {
          key: i.id,
          class: "mm-option"
        }, [
          s("div", Un, [
            s("span", Wn, m(i.content), 1),
            s("span", Zn, m(l(Z)(i.valid_at)) + " · " + m(l(Wt)(i.source)), 1)
          ]),
          s("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: t.memory.busy.value,
            onClick: (c) => o(u, i)
          }, [
            g(l(k), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            r[5] || (r[5] = C("Keep this ", -1))
          ], 8, Yn)
        ]))), 128))
      ], 8, Kn))), 128)),
      l(n).next.value !== null ? (d(), b("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: l(n).loading.value,
        onClick: r[0] || (r[0] = //@ts-ignore
        (...u) => l(n).more && l(n).more(...u))
      }, "Show more conflicts", 8, Xn)) : y("", !0)
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
    return (o, a) => (d(), b("button", {
      type: "button",
      class: V(["kx-iconbtn", { on: t.active, danger: t.danger, sm: t.small }]),
      "aria-label": t.label,
      title: t.label,
      "aria-pressed": t.active === void 0 ? void 0 : t.active,
      disabled: t.disabled,
      onClick: a[0] || (a[0] = (r) => n("click"))
    }, [
      g(l(k), {
        icon: t.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, Gn));
  }
});
var qt = {
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
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function oo(t, e, n, o, a, r) {
  return d(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Jn(e[0] || (e[0] = [s("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qt.render = oo;
var Gt = {
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
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function uo(t, e, n, o, a, r) {
  return d(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ro(e[0] || (e[0] = [s("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Gt.render = uo;
var Jt = {
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
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function fo(t, e, n, o, a, r) {
  return d(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), co(e[0] || (e[0] = [s("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jt.render = fo;
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
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": bt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Rt(n.value) && !o.$slots.default,
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
function At(t, e, n) {
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
    var o = n.call(t, e);
    if (at(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qt = {
  name: "Badge",
  extends: ko,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return W(At(At({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, $o = ["data-p"];
function Co(t, e, n, o, a, r) {
  return d(), b("span", w({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [D(t.$slots, "default", {}, function() {
    return [C(m(t.value), 1)];
  })], 16, $o);
}
Qt.render = Co;
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
    var o = n.call(t, e);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Lo = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", H(H(H(H(H(H(H(H(H({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
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
function F(t, e, n) {
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
    var o = n.call(t, e);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var te = {
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
      return Rt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return W(F(F(F(F(F(F(F(F(F(F({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return W(F(F({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return W(F(F({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Jt,
    Badge: Qt
  },
  directives: {
    ripple: ft
  }
}, Ao = ["data-p"], Do = ["data-p"];
function Oo(t, e, n, o, a, r) {
  var u = nt("SpinnerIcon"), i = nt("Badge"), c = Ct("ripple");
  return t.asChild ? D(t.$slots, "default", {
    key: 1,
    class: V(t.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : mt((d(), O(ct(t.as), w({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: R(function() {
      return [D(t.$slots, "default", {}, function() {
        return [t.loading ? D(t.$slots, "loadingicon", w({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (d(), b("span", w({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (d(), O(u, w({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : D(t.$slots, "icon", w({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (d(), b("span", w({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": r.dataIconP
          }, t.ptm("icon")), null, 16, Ao)) : y("", !0)];
        }), t.label ? (d(), b("span", w({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": r.dataLabelP
        }), m(t.label), 17, Do)) : y("", !0), t.badge ? (d(), O(i, {
          key: 3,
          value: t.badge,
          class: V(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : y("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[c]]);
}
te.render = Oo;
var To = X.extend({
  name: "focustrap-directive"
}), jo = Le.extend({
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
function Dt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(t, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ot(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Dt(Object(n), !0).forEach(function(o) {
      Mo(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Dt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
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
    var o = n.call(t, e);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ro = jo.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, a = o.disabled;
    a || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, a = o.disabled;
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
      var o = this, a = n.value || {}, r = a.onFocusIn, u = a.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(i) {
        i.forEach(function(c) {
          if (c.type === "childList" && !e.contains(document.activeElement)) {
            var p = function(_) {
              var L = Bt(_) ? Bt(_, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? _ : J(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : J(_);
              return bt(L) ? L : _.nextSibling && p(_.nextSibling);
            };
            q(p(c.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(i) {
        return r && r(i);
      }, e.$_pfocustrap_focusoutlistener = function(i) {
        return u && u(i);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Ot(Ot({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, a = o.autoFocusSelector, r = a === void 0 ? "" : a, u = o.firstFocusableSelector, i = u === void 0 ? "" : u, c = o.autoFocus, p = c === void 0 ? !1 : c, v = J(e, "[autofocus]".concat(this.getComputedSelector(r)));
      p && !v && (v = J(e, this.getComputedSelector(i))), q(v);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, a = e.relatedTarget, r = a === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? J(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      q(r);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, a = e.relatedTarget, r = a === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? le(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      q(r);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, a = n.value || {}, r = a.tabIndex, u = r === void 0 ? 0 : r, i = a.firstFocusableSelector, c = i === void 0 ? "" : i, p = a.lastFocusableSelector, v = p === void 0 ? "" : p, _ = function(x) {
        return se("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: u,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(o)
        });
      }, L = _(this.onFirstHiddenElementFocus), S = _(this.onLastHiddenElementFocus);
      L.$_pfocustrap_lasthiddenfocusableelement = S, L.$_pfocustrap_focusableselector = c, L.setAttribute("data-pc-section", "firstfocusableelement"), S.$_pfocustrap_firsthiddenfocusableelement = L, S.$_pfocustrap_focusableselector = v, S.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(L), e.append(S);
    }
  }
});
function Tt() {
  ue({
    variableName: Kt("scrollbar.width").name
  });
}
function jt() {
  de({
    variableName: Kt("scrollbar.width").name
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
    var n = e.position, o = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, No = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], a = o.find(function(r) {
      return r === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, a ? "p-dialog-".concat(a) : ""];
  },
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
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
      this.modal && !this.isUnstyled && ve(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
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
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? Tt() : jt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Tt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && jt();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", fe(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && ge(document.body, {
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
          var o = be(e.container), a = pe(e.container), r = n.pageX - e.lastPageX, u = n.pageY - e.lastPageY, i = e.container.getBoundingClientRect(), c = i.left + r, p = i.top + u, v = me(), _ = getComputedStyle(e.container), L = parseFloat(_.marginLeft), S = parseFloat(_.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (c >= e.minX && c + o < v.width && (e.lastPageX = n.pageX, e.container.style.left = c - L + "px"), p >= e.minY && p + a < v.height && (e.lastPageY = n.pageY, e.container.style.top = p - S + "px")) : (e.lastPageX = n.pageX, e.container.style.left = c - L + "px", e.lastPageY = n.pageY, e.container.style.top = p - S + "px");
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
    Button: te,
    Portal: ce,
    WindowMinimizeIcon: Gt,
    WindowMaximizeIcon: qt,
    TimesIcon: Ie
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
function Mt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(t, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Vt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Mt(Object(n), !0).forEach(function(o) {
      Zo(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Mt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
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
    var o = n.call(t, e);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qo = ["data-p"], Go = ["aria-labelledby", "aria-modal", "data-p"], Jo = ["id"], Qo = ["data-p"];
function tr(t, e, n, o, a, r) {
  var u = nt("Button"), i = nt("Portal"), c = Ct("focustrap");
  return d(), O(i, {
    appendTo: t.appendTo
  }, {
    default: R(function() {
      return [a.containerVisible ? (d(), b("div", w({
        key: 0,
        ref: r.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return r.onMaskMouseDown && r.onMaskMouseDown.apply(r, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return r.onMaskMouseUp && r.onMaskMouseUp.apply(r, arguments);
        }),
        "data-p": r.dataP
      }, t.ptm("mask")), [g(oe, w({
        name: "p-dialog",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: R(function() {
          return [t.visible ? mt((d(), b("div", w({
            key: 0,
            ref: r.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": r.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": r.dataP
          }, t.ptmi("root")), [t.$slots.container ? D(t.$slots, "container", {
            key: 0,
            closeCallback: r.close,
            maximizeCallback: function(v) {
              return r.maximize(v);
            },
            initDragCallback: r.initDrag
          }) : (d(), b(T, {
            key: 1
          }, [t.showHeader ? (d(), b("div", w({
            key: 0,
            ref: r.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return r.initDrag && r.initDrag.apply(r, arguments);
            })
          }, t.ptm("header")), [D(t.$slots, "header", {
            class: V(t.cx("title"))
          }, function() {
            return [t.header ? (d(), b("span", w({
              key: 0,
              id: r.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), m(t.header), 17, Jo)) : y("", !0)];
          }), s("div", w({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? D(t.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(v) {
              return r.maximize(v);
            }
          }, function() {
            return [g(u, w({
              ref: r.maximizableRef,
              autofocus: a.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: r.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: R(function(p) {
                return [D(t.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(d(), O(ct(r.maximizeIconComponent), w({
                    class: [p.class, a.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : y("", !0), t.closable ? D(t.$slots, "closebutton", {
            key: 1,
            closeCallback: r.close
          }, function() {
            return [g(u, w({
              ref: r.closeButtonRef,
              autofocus: a.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: r.close,
              "aria-label": r.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: R(function(p) {
                return [D(t.$slots, "closeicon", {}, function() {
                  return [(d(), O(ct(t.closeIcon ? "span" : "TimesIcon"), w({
                    class: [t.closeIcon, p.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : y("", !0)], 16)], 16)) : y("", !0), s("div", w({
            ref: r.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": r.dataP
          }, Vt(Vt({}, t.contentProps), t.ptm("content"))), [D(t.$slots, "default")], 16, Qo), t.footer || t.$slots.footer ? (d(), b("div", w({
            key: 1,
            ref: r.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [D(t.$slots, "footer", {}, function() {
            return [C(m(t.footer), 1)];
          })], 16)) : y("", !0)], 64))], 16, Go)), [[c, {
            disabled: !t.modal
          }]]) : y("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, qo)) : y("", !0)];
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
    return (o, a) => (d(), O(l(It), {
      visible: t.open,
      position: "right",
      "append-to": "self",
      modal: "",
      "aria-label": t.title,
      closable: !1,
      "dismissable-mask": "",
      class: "kx-drawer",
      pt: { mask: "kx-drawer-mask", header: "kx-drawer-h", content: "kx-drawer-b" },
      "onUpdate:visible": a[1] || (a[1] = (r) => !r && n("close"))
    }, {
      header: R(() => [
        s("span", er, [
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
          onClick: a[0] || (a[0] = (r) => n("close"))
        })
      ]),
      default: R(() => [
        D(o.$slots, "default")
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
    return (o, a) => (d(), O(l(It), {
      visible: t.open,
      modal: "",
      "append-to": "self",
      role: "alertdialog",
      "aria-label": t.title,
      closable: !1,
      "close-on-escape": !t.busy,
      "dismissable-mask": !t.busy,
      class: V(["kx-modal", { danger: t.danger }]),
      pt: { mask: "kx-modal-mask", header: "kx-modal-h", content: "kx-modal-body", footer: "kx-modal-foot" },
      "onUpdate:visible": a[3] || (a[3] = (r) => !r && n("cancel"))
    }, {
      header: R(() => [
        s("span", or, [
          g(l(k), {
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        s("span", rr, [
          s("span", ar, m(t.title), 1),
          t.subtitle ? (d(), b("span", ir, m(t.subtitle), 1)) : y("", !0)
        ]),
        g(pt, {
          icon: "tabler:x",
          label: "Close",
          disabled: t.busy,
          onClick: a[0] || (a[0] = (r) => n("cancel"))
        }, null, 8, ["disabled"])
      ]),
      footer: R(() => [
        s("button", {
          type: "button",
          autofocus: "",
          class: "kx-btn kx-btn-ghost",
          disabled: t.busy,
          onClick: a[1] || (a[1] = (r) => n("cancel"))
        }, "Cancel", 8, lr),
        s("button", {
          type: "button",
          class: V(["kx-btn", t.danger ? "kx-btn-danger" : "kx-btn-primary"]),
          disabled: t.busy,
          onClick: a[2] || (a[2] = (r) => n("confirm"))
        }, [
          t.busy ? (d(), O(l(k), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : y("", !0),
          C(m(t.confirmLabel), 1)
        ], 10, sr)
      ]),
      default: R(() => [
        D(o.$slots, "default")
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
    const n = t, o = e, a = A(null), r = A([]), u = A(null), i = A([]), c = A(""), p = A(null), v = A(!1), _ = M(() => `${n.memory.base.value}/items/${encodeURIComponent(n.itemId)}`), L = M(() => a.value ? G[a.value.kind] : null), S = M(() => a.value?.status === "current" || a.value?.status === "conflict");
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
            o("gone");
            return;
          }
          a.value = Pt, i.value = j.provenance;
        }
        const vt = he(j, "versions");
        r.value = z ? [...r.value, ...vt.rows] : vt.rows, u.value = vt.next, c.value = "";
      } catch (j) {
        if (f !== B) return;
        Q(j) && Q(j.response) && j.response.status === 404 ? o("gone") : c.value = Ht(j);
      }
    }
    U(() => n.itemId, () => {
      a.value = null, r.value = [], p.value = null, v.value = !1, x();
    }, { immediate: !0 }), U(n.memory.revision, () => {
      x();
    });
    function h(z) {
      const f = `${_.value}/${z}`;
      return n.memory.act(() => et.post(f, {}));
    }
    async function I() {
      const z = (p.value || "").trim();
      if (!z || !a.value) return;
      const f = _.value;
      await n.memory.act(async () => {
        const { data: j } = await et.put(f, { content: z });
        Q(j) && typeof j.item_id == "string" && j.item_id !== n.itemId && o("replaced", j.item_id);
      }) && (p.value = null);
    }
    async function E() {
      await h("forget") && (v.value = !1, o("gone"));
    }
    function P(z) {
      return z.host_kind === "session" ? "Conversation" : z.host_kind === "dataflow" ? "Workflow run" : z.host_kind === "content" ? "Document" : z.host_kind;
    }
    return (z, f) => (d(), b(T, null, [
      c.value ? (d(), b("div", ur, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        s("span", null, m(c.value), 1)
      ])) : a.value ? (d(), b("article", br, [
        s("header", pr, [
          s("span", {
            class: V(["mm-head-ic", L.value?.group])
          }, [
            g(l(k), {
              icon: L.value?.icon || "tabler:note",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          s("div", mr, [
            s("div", gr, [
              s("span", fr, m(L.value?.label), 1),
              s("span", vr, m(l(Y)(a.value.key)), 1),
              a.value.status !== "current" ? (d(), O(l(zt), {
                key: 0,
                class: "kx-tag-sm",
                severity: l(Nt)(a.value.status),
                value: a.value.status
              }, null, 8, ["severity", "value"])) : y("", !0),
              s("span", hr, [
                S.value && p.value === null ? (d(), b("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[0] || (f[0] = ($) => p.value = a.value.content)
                }, [
                  g(l(k), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  f[8] || (f[8] = C("Edit ", -1))
                ])) : y("", !0),
                S.value ? (d(), b("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: t.memory.busy.value,
                  onClick: f[1] || (f[1] = ($) => h("archive"))
                }, [
                  g(l(k), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  f[9] || (f[9] = C("Archive ", -1))
                ], 8, yr)) : y("", !0),
                a.value.status === "archived" ? (d(), b("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: t.memory.busy.value,
                  onClick: f[2] || (f[2] = ($) => h("restore"))
                }, [
                  g(l(k), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  f[10] || (f[10] = C("Restore ", -1))
                ], 8, kr)) : y("", !0),
                s("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: t.memory.busy.value,
                  onClick: f[3] || (f[3] = ($) => v.value = !0)
                }, [
                  g(l(k), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  f[11] || (f[11] = C("Forget ", -1))
                ], 8, wr)
              ])
            ]),
            p.value !== null ? (d(), b("div", xr, [
              g(l(Ut), {
                modelValue: p.value,
                "onUpdate:modelValue": f[4] || (f[4] = ($) => p.value = $),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              s("div", $r, [
                s("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: t.memory.busy.value || !p.value.trim(),
                  onClick: I
                }, [
                  g(l(k), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  f[12] || (f[12] = C("Save text ", -1))
                ], 8, Cr),
                s("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[5] || (f[5] = ($) => p.value = null)
                }, "Cancel")
              ])
            ])) : (d(), b("h2", Sr, m(a.value.content), 1)),
            s("div", _r, [
              s("span", zr, [
                g(l(k), {
                  icon: "tabler:user-circle",
                  "aria-hidden": "true"
                }),
                C(m(l(Re)(a.value)), 1)
              ]),
              s("span", {
                class: "mm-fact",
                title: l(tt)(a.value.valid_at)
              }, [
                g(l(k), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                C("True since " + m(l(Z)(a.value.valid_at)), 1)
              ], 8, Lr),
              a.value.invalid_at ? (d(), b("span", {
                key: 0,
                class: "mm-fact",
                title: l(tt)(a.value.invalid_at)
              }, [
                g(l(k), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                C("Until " + m(l(Z)(a.value.invalid_at)), 1)
              ], 8, Ir)) : y("", !0),
              s("span", {
                class: "mm-fact",
                title: l(tt)(a.value.recorded_at)
              }, [
                g(l(k), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                C(m(l(Wt)(a.value.source)), 1)
              ], 8, Pr),
              s("span", Br, [
                g(l(k), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                C(m(a.value.cardinality === "single" ? "One value at a time" : "Can hold several values"), 1)
              ])
            ])
          ])
        ]),
        s("section", Er, [
          f[14] || (f[14] = s("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          s("ol", Ar, [
            (d(!0), b(T, null, K(r.value, ($) => (d(), b("li", {
              key: $.id,
              class: V({ now: $.id === a.value.id, past: $.status !== "current" })
            }, [
              f[13] || (f[13] = s("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              s("span", Dr, [
                s("span", Or, m($.content), 1),
                s("span", Tr, [
                  C("v" + m($.version) + " · " + m(l(Z)($.valid_at)), 1),
                  $.status !== "current" ? (d(), b(T, { key: 0 }, [
                    C(" · " + m($.status), 1)
                  ], 64)) : y("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          u.value !== null ? (d(), b("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: f[6] || (f[6] = ($) => x(u.value))
          }, "Show older versions")) : y("", !0)
        ]),
        s("section", jr, [
          f[15] || (f[15] = s("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          i.value.length ? (d(), b("ul", Vr, [
            (d(!0), b(T, null, K(i.value, ($) => (d(), b("li", {
              key: $.host_kind + $.host_id + $.event_id
            }, [
              g(l(k), {
                icon: "tabler:message-circle",
                "aria-hidden": "true"
              }),
              s("span", null, m(P($)), 1),
              $.recorded_at ? (d(), b("span", {
                key: 0,
                class: "mm-muted",
                title: l(tt)($.recorded_at)
              }, m(l(Z)($.recorded_at)), 9, Fr)) : y("", !0)
            ]))), 128))
          ])) : (d(), b("p", Mr, m(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (d(), b("div", cr, [
        (d(), b(T, null, K(4, ($) => s("div", {
          key: $,
          class: "mm-skel-line"
        })), 64))
      ])),
      g(dr, {
        open: v.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? l(Y)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: t.memory.busy.value,
        onCancel: f[7] || (f[7] = ($) => v.value = !1),
        onConfirm: E
      }, {
        default: R(() => [...f[16] || (f[16] = [
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
    const n = t, o = e, a = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], r = A("current"), u = A(""), i = A("");
    let c;
    U(u, (S) => {
      clearTimeout(c), c = setTimeout(() => {
        i.value = S.trim();
      }, 250);
    });
    const p = St(() => {
      if (!n.memory.memoryId.value) return null;
      const S = new URLSearchParams({ status: r.value, limit: "100" });
      return i.value && S.set("q", i.value), `${n.memory.base.value}/items?${S.toString()}`;
    }, "items", n.memory.revision);
    U([r, i], () => o("filtered"));
    const v = A({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), _ = M(() => Fe.map((S) => ({ ...S, items: p.rows.value.filter((B) => G[B.kind]?.group === S.id) })).filter((S) => S.items.length)), L = M(() => i.value ? "No memories match this search." : r.value === "superseded" ? "No earlier versions yet." : r.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (S, B) => (d(), b(T, null, [
      s("div", Kr, [
        g($e, {
          modelValue: u.value,
          "onUpdate:modelValue": B[0] || (B[0] = (x) => u.value = x),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        g(l(Lt), {
          modelValue: r.value,
          "onUpdate:modelValue": B[1] || (B[1] = (x) => r.value = x),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      s("nav", Hr, [
        l(p).loading.value && !l(p).rows.value.length ? (d(), b("div", Nr, [
          (d(), b(T, null, K(6, (x) => s("div", {
            key: x,
            class: "mm-skel-row"
          })), 64))
        ])) : l(p).error.value ? (d(), b("div", Ur, [
          g(l(k), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          s("span", null, m(l(p).error.value), 1)
        ])) : l(p).rows.value.length ? y("", !0) : (d(), b("div", Wr, m(L.value), 1)),
        (d(!0), b(T, null, K(_.value, (x) => (d(), b("div", {
          key: x.id,
          class: V(["kx-railsec", { closed: v.value[x.id] }])
        }, [
          s("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !v.value[x.id],
            onClick: (h) => v.value[x.id] = !v.value[x.id]
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
            s("span", Yr, m(x.title), 1),
            s("span", Xr, m(x.items.length), 1)
          ], 8, Zr),
          mt(s("div", qr, [
            (d(!0), b(T, null, K(x.items, (h) => (d(), b("button", {
              key: h.id,
              type: "button",
              class: V(["mm-row", { on: t.selectedId === h.id }]),
              "aria-current": t.selectedId === h.id ? "true" : void 0,
              onClick: (I) => o("select", h)
            }, [
              s("span", {
                class: V(["mm-row-ic", l(G)[h.kind]?.group])
              }, [
                g(l(k), {
                  icon: l(G)[h.kind]?.icon || "tabler:note",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              s("span", Jr, [
                s("span", Qr, m(h.content), 1),
                s("span", ta, m(l(Y)(h.key)) + " · " + m(l(Z)(h.valid_at)), 1)
              ])
            ], 10, Gr))), 128))
          ], 512), [
            [re, !v.value[x.id]]
          ])
        ], 2))), 128)),
        l(p).next.value !== null ? (d(), b("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: l(p).loading.value,
          onClick: B[2] || (B[2] = //@ts-ignore
          (...x) => l(p).more && l(p).more(...x))
        }, [
          l(p).loading.value ? (d(), O(l(k), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : y("", !0),
          B[3] || (B[3] = C("Show more ", -1))
        ], 8, ea)) : y("", !0)
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
    const e = ye(), n = ke(), o = A(""), a = A({});
    U(() => e.value.config, (h) => {
      try {
        a.value = we(h), o.value = "";
      } catch (I) {
        o.value = Ht(I);
      }
    }, { immediate: !0 });
    const r = Ce(M(() => String(a.value.kb_id || ""))), u = A("item"), i = A(String(a.value.route || "")), c = A(!1), p = M(() => r.status.value?.counts.current), v = M(() => r.status.value?.counts.conflict_groups || 0), _ = M(() => (r.status.value?.runs || []).filter((h) => h.status === "failed").length);
    U(() => a.value.route, (h) => {
      typeof h == "string" && h && h !== i.value && (i.value = h, u.value = "item");
    }), U(r.memoryId, () => {
      i.value = "", u.value = "item";
    });
    function L(h) {
      u.value = "item", h !== i.value && (i.value = h, n("navigate", h));
    }
    function S(h) {
      L(h.id);
    }
    function B(h) {
      u.value = u.value === h ? "item" : h;
    }
    function x(h) {
      c.value = !1, h && L(h);
    }
    return (h, I) => o.value ? (d(), b("div", oa, m(o.value), 1)) : (d(), b("div", ra, [
      l(r).error.value ? (d(), b("div", aa, [
        g(l(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        s("span", null, m(l(r).error.value), 1)
      ])) : y("", !0),
      s("div", ia, [
        s("aside", la, [
          s("div", sa, [
            s("span", da, [
              I[6] || (I[6] = C("Memories", -1)),
              p.value !== void 0 ? (d(), b("b", ua, m(p.value), 1)) : y("", !0)
            ]),
            s("div", ca, [
              g(pt, {
                icon: "tabler:activity",
                label: _.value ? `Activity, ${_.value} failed` : "Activity",
                active: u.value === "activity",
                onClick: I[0] || (I[0] = (E) => B("activity"))
              }, null, 8, ["label", "active"]),
              g(pt, {
                icon: "tabler:plus",
                label: "Add agent memory",
                active: c.value,
                onClick: I[1] || (I[1] = (E) => c.value = !0)
              }, null, 8, ["active"])
            ])
          ]),
          v.value ? (d(), b("button", {
            key: 0,
            type: "button",
            class: V(["mm-conflict-bar", { on: u.value === "conflicts" }]),
            onClick: I[2] || (I[2] = (E) => B("conflicts"))
          }, [
            g(l(k), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            s("span", null, m(v.value === 1 ? "1 conflict to resolve" : `${v.value} conflicts to resolve`), 1),
            g(l(k), {
              class: "mm-conflict-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : y("", !0),
          g(na, {
            memory: l(r),
            "selected-id": u.value === "item" ? i.value : "",
            onSelect: S,
            onFiltered: I[3] || (I[3] = (E) => i.value = "")
          }, null, 8, ["memory", "selected-id"])
        ]),
        s("main", ba, [
          s("div", pa, [
            u.value === "conflicts" ? (d(), O(qn, {
              key: 0,
              memory: l(r)
            }, null, 8, ["memory"])) : u.value === "activity" ? (d(), O(tn, {
              key: 1,
              memory: l(r)
            }, null, 8, ["memory"])) : i.value ? (d(), O(Rr, {
              key: i.value,
              memory: l(r),
              "item-id": i.value,
              onReplaced: L,
              onGone: I[4] || (I[4] = (E) => i.value = "")
            }, null, 8, ["memory", "item-id"])) : (d(), b("div", ma, [
              s("span", ga, [
                g(l(k), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              I[7] || (I[7] = s("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              I[8] || (I[8] = s("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      g(nr, {
        open: c.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: I[5] || (I[5] = (E) => c.value = !1)
      }, {
        default: R(() => [
          c.value ? (d(), O(Tn, {
            key: 0,
            memory: l(r),
            onAdded: x
          }, null, 8, ["memory"])) : y("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), va = xe(fa, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
ae(import.meta.url, va);
//# sourceMappingURL=index.js.map
