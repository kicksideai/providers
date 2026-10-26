import { openBlock as s, createElementBlock as u, mergeProps as N, createBlock as P, resolveDynamicComponent as _e, createCommentVNode as k, renderSlot as W, createElementVNode as a, toDisplayString as m, defineComponent as M, computed as I, Fragment as B, createVNode as v, unref as l, createTextVNode as _, renderList as R, normalizeClass as E, resolveDirective as xe, withDirectives as me, resolveComponent as Se, createSlots as Ce, withCtx as q, ref as A, watch as D, withModifiers as oe, onBeforeUnmount as be, Transition as pe, vShow as Le } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as J, define as Te } from "@wippy-fe/proxy";
import { B as ae, d as Ae, f as le, c as ve, s as ue, k as te, g as Q, h as Be, i as H, e as Ie, u as Ve, a as Oe, b as Pe, m as Ee } from "./types-CLfIEQjM.js";
import { s as ge, u as ie, _ as ze, a as Re } from "./useMemory-DzBogiMW.js";
import { R as ye, u as Ke, d as Ne, b as De, e as fe } from "./useWidget-8y_TLXxw.js";
var Me = `
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
`, Ue = {
  root: function(t) {
    var n = t.props;
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
}, je = ae.extend({
  name: "tag",
  style: Me,
  classes: Ue
}), Fe = {
  name: "BaseTag",
  extends: Ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: je,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function Y(e) {
  "@babel/helpers - typeof";
  return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Y(e);
}
function We(e, t, n) {
  return (t = qe(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qe(e) {
  var t = He(e, "string");
  return Y(t) == "symbol" ? t : t + "";
}
function He(e, t) {
  if (Y(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var c = n.call(e, t);
    if (Y(c) != "object") return c;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var se = {
  name: "Tag",
  extends: Fe,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return le(We({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ge = ["data-p"];
function Je(e, t, n, c, r, o) {
  return s(), u("span", N({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (s(), P(_e(e.$slots.icon), N({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (s(), u("span", N({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : k("", !0), e.value != null || e.$slots.default ? W(e.$slots, "default", {
    key: 2
  }, function() {
    return [a("span", N({
      class: e.cx("label")
    }, e.ptm("label")), m(e.value), 17)];
  }) : k("", !0)], 16, Ge);
}
se.render = Je;
const F = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people" },
  fact: { label: "Fact", icon: "tabler:note", group: "people" }
}, Ye = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route" },
  { id: "people", title: "About people", icon: "tabler:users" }
];
function j(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
function Ze(e) {
  return e.scope_family === "agent" ? "The agent" : "A person it talked with";
}
const Qe = {
  capture: "learned in conversation",
  tool: "saved by the agent",
  reflection: "from consolidation",
  owner: "added by a person"
};
function he(e) {
  return Qe[e] || e;
}
function ke(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function G(e) {
  const t = ke(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const Xe = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function U(e, t = Date.now()) {
  const n = ke(e);
  if (!Number.isFinite(n)) return "";
  const c = Math.round((n - t) / 1e3), r = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, i] of Xe)
    if (Math.abs(c) >= i) return r.format(Math.round(c / i), o);
  return "just now";
}
const et = { class: "mm-view-head" }, tt = { class: "mm-view-title" }, nt = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, ot = { class: "kx-empty-ico" }, at = {
  key: 1,
  class: "mm-runs"
}, lt = { class: "mm-run-main" }, it = { class: "mm-run-t" }, st = ["title"], rt = {
  key: 0,
  class: "mm-run-err"
}, dt = /* @__PURE__ */ M({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = I(() => t.memory.status.value?.runs || []);
    function c(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function r(o) {
      const i = o.stats || {}, d = [
        i.added ? `${i.added} new` : "",
        i.superseded ? `${i.superseded} updated` : "",
        i.conflicted ? `${i.conflicted} contested` : ""
      ].filter(Boolean);
      return d.length ? d.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, i) => (s(), u(B, null, [
      a("header", et, [
        a("h2", tt, [
          v(l(f), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          i[0] || (i[0] = _("Activity", -1))
        ]),
        i[1] || (i[1] = a("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (s(), u("ol", at, [
        (s(!0), u(B, null, R(n.value, (d) => (s(), u("li", {
          key: d.id,
          class: E(["mm-run", d.status])
        }, [
          a("div", lt, [
            a("span", it, m(c(d)), 1),
            a("span", {
              class: "mm-muted",
              title: l(G)(d.finished_at || d.started_at || d.created_at)
            }, [
              _(m(l(U)(d.finished_at || d.started_at || d.created_at)), 1),
              r(d) ? (s(), u(B, { key: 0 }, [
                _(" · " + m(r(d)), 1)
              ], 64)) : k("", !0)
            ], 8, st),
            d.last_error ? (s(), u("span", rt, m(d.last_error), 1)) : k("", !0)
          ]),
          d.status !== "succeeded" ? (s(), P(l(se), {
            key: 0,
            class: "kx-tag-sm",
            severity: l(ge)(d.status),
            value: d.status
          }, null, 8, ["severity", "value"])) : k("", !0)
        ], 2))), 128))
      ])) : (s(), u("div", nt, [
        a("span", ot, [
          v(l(f), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        i[2] || (i[2] = a("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        i[3] || (i[3] = a("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
var ut = `
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
`, ct = {
  root: function(t) {
    var n = t.instance, c = t.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": c.fluid,
      "p-togglebutton-sm p-inputfield-sm": c.size === "small",
      "p-togglebutton-lg p-inputfield-lg": c.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, mt = ae.extend({
  name: "togglebutton",
  style: ut,
  classes: ct
}), bt = {
  name: "BaseToggleButton",
  extends: ve,
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
  style: mt,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function Z(e) {
  "@babel/helpers - typeof";
  return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Z(e);
}
function pt(e, t, n) {
  return (t = vt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vt(e) {
  var t = gt(e, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function gt(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var c = n.call(e, t);
    if (Z(c) != "object") return c;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $e = {
  name: "ToggleButton",
  extends: bt,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, t), this.$emit("change", t));
    },
    onBlur: function(t) {
      var n, c;
      (n = (c = this.formField).onBlur) === null || n === void 0 || n.call(c, t);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return ue(this.onLabel) && ue(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return le(pt({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ye
  }
}, yt = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], ft = ["data-p"];
function ht(e, t, n, c, r, o) {
  var i = xe("ripple");
  return me((s(), u("button", N({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: t[0] || (t[0] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    })
  }, o.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": o.active,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [a("span", N({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [W(e.$slots, "default", {}, function() {
    return [W(e.$slots, "icon", {
      value: e.d_value,
      class: E(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (s(), u("span", N({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : k("", !0)];
    }), a("span", N({
      class: e.cx("label")
    }, o.getPTOptions("label")), m(o.label), 17)];
  })], 16, ft)], 16, yt)), [[i]]);
}
$e.render = ht;
var kt = `
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
`, $t = {
  root: function(t) {
    var n = t.props, c = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": c.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, wt = ae.extend({
  name: "selectbutton",
  style: kt,
  classes: $t
}), _t = {
  name: "BaseSelectButton",
  extends: ve,
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
  style: wt,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function xt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = we(e)) || t) {
      n && (e = n);
      var c = 0, r = function() {
      };
      return { s: r, n: function() {
        return c >= e.length ? { done: !0 } : { done: !1, value: e[c++] };
      }, e: function(g) {
        throw g;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, i = !0, d = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var g = n.next();
    return i = g.done, g;
  }, e: function(g) {
    d = !0, o = g;
  }, f: function() {
    try {
      i || n.return == null || n.return();
    } finally {
      if (d) throw o;
    }
  } };
}
function St(e) {
  return Tt(e) || Lt(e) || we(e) || Ct();
}
function Ct() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function we(e, t) {
  if (e) {
    if (typeof e == "string") return ne(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ne(e, t) : void 0;
  }
}
function Lt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Tt(e) {
  if (Array.isArray(e)) return ne(e);
}
function ne(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, c = Array(t); n < t; n++) c[n] = e[n];
  return c;
}
var re = {
  name: "SelectButton",
  extends: _t,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? Q(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Q(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? Q(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Q(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, c) {
      var r = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var o = this.isSelected(n), i = this.getOptionValue(n), d;
        if (this.multiple)
          if (o) {
            if (d = this.d_value.filter(function($) {
              return !te($, i, r.equalityKey);
            }), !this.allowEmpty && d.length === 0) return;
          } else
            d = this.d_value ? [].concat(St(this.d_value), [i]) : [i];
        else {
          if (o && !this.allowEmpty) return;
          d = o ? null : i;
        }
        this.writeValue(d, t), this.$emit("change", {
          originalEvent: t,
          value: d
        });
      }
    },
    isSelected: function(t) {
      var n = !1, c = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var r = xt(this.d_value), o;
          try {
            for (r.s(); !(o = r.n()).done; ) {
              var i = o.value;
              if (te(i, c, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (d) {
            r.e(d);
          } finally {
            r.f();
          }
        }
      } else
        n = te(this.d_value, c, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return le({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ye
  },
  components: {
    ToggleButton: $e
  }
}, At = ["aria-labelledby", "data-p"];
function Bt(e, t, n, c, r, o) {
  var i = Se("ToggleButton");
  return s(), u("div", N({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(s(!0), u(B, null, R(e.options, function(d, $) {
    return s(), P(i, {
      key: o.getOptionRenderKey(d),
      modelValue: o.isSelected(d),
      onLabel: o.getOptionLabel(d),
      offLabel: o.getOptionLabel(d),
      disabled: e.disabled || o.isOptionDisabled(d),
      unstyled: e.unstyled,
      size: e.size,
      readonly: o.isOptionReadonly(d),
      onChange: function(L) {
        return o.onOptionSelect(L, d, $);
      },
      pt: e.ptm("pcToggleButton")
    }, Ce({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: q(function() {
        return [W(e.$slots, "option", {
          option: d,
          index: $
        }, function() {
          return [a("span", N({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), m(o.getOptionLabel(d)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, At);
}
re.render = Bt;
function It(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function ce(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
const Vt = { class: "mm-field" }, Ot = { class: "mm-hint" }, Pt = { class: "mm-field" }, Et = ["selected"], zt = { class: "mm-field" }, Rt = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Kt = {
  key: 1,
  class: "mm-hint"
}, Nt = {
  key: 2,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, Dt = ["onClick"], Mt = { class: "mm-field" }, Ut = { class: "mm-form-foot" }, jt = ["disabled"], Ft = /* @__PURE__ */ M({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(e, { emit: t }) {
    const n = e, c = t, r = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = A("rule"), i = A(""), d = A(""), $ = A(""), g = Ke("wc-agent-picker"), L = I(() => r.find((O) => O.value === o.value)?.hint || ""), V = I(() => It(d.value)), z = I(() => d.value && !ce(V.value) ? "Use a short topic of letters, digits and spaces." : ""), S = I(() => !!i.value && ce(V.value) && !!$.value.trim()), T = ie(
      () => n.memory.kbId.value ? `${n.memory.base.value}/topics?scope_family=agent&kind=${o.value}` : null,
      "topics",
      n.memory.revision
    ), p = I(() => T.rows.value.map((O) => O.key).filter((O) => O !== V.value).slice(0, 8));
    D(o, () => {
      d.value = "";
    });
    function y(O) {
      const x = Be(O).selected;
      i.value = String((Array.isArray(x) ? x : [])[0] || "");
    }
    async function K() {
      if (!S.value) return;
      let O = null;
      const x = `${n.memory.base.value}/items`;
      await n.memory.act(async () => {
        const { data: b } = await J.post(x, {
          kind: o.value,
          scope_family: "agent",
          scope_id: i.value,
          key: V.value,
          content: $.value.trim()
        });
        O = b && typeof b.item_id == "string" ? b.item_id : null;
      }) && c("added", O);
    }
    return (O, x) => (s(), u("form", {
      class: "mm-form",
      onSubmit: oe(K, ["prevent"])
    }, [
      a("div", Vt, [
        x[3] || (x[3] = a("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        v(l(re), {
          modelValue: o.value,
          "onUpdate:modelValue": x[0] || (x[0] = (w) => o.value = w),
          options: r,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        a("span", Ot, [
          v(l(f), {
            icon: l(F)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          _(m(L.value), 1)
        ])
      ]),
      a("div", Pt, [
        x[4] || (x[4] = a("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        l(g).ready.value ? (s(), u("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: i.value ? JSON.stringify([i.value]) : "[]",
          onChange: y
        }, null, 40, Et)) : l(g).failed.value ? (s(), P(l(Ne), {
          key: 1,
          severity: "error",
          size: "small"
        }, {
          default: q(() => [
            _("The agent picker could not load: " + m(l(g).failed.value), 1)
          ]),
          _: 1
        })) : k("", !0)
      ]),
      a("div", zt, [
        x[5] || (x[5] = a("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        v(l(De), {
          id: "add_topic",
          modelValue: d.value,
          "onUpdate:modelValue": x[1] || (x[1] = (w) => d.value = w),
          placeholder: "e.g. response style",
          invalid: !!z.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        z.value ? (s(), u("span", Rt, m(z.value), 1)) : (s(), u("span", Kt, "What this is about, not what it says. A topic that already exists gets a new version.")),
        p.value.length ? (s(), u("div", Nt, [
          (s(!0), u(B, null, R(p.value, (w) => (s(), u("button", {
            key: w,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (b) => d.value = l(j)(w)
          }, m(l(j)(w)), 9, Dt))), 128))
        ])) : k("", !0)
      ]),
      a("div", Mt, [
        x[6] || (x[6] = a("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        v(l(fe), {
          id: "add_text",
          modelValue: $.value,
          "onUpdate:modelValue": x[2] || (x[2] = (w) => $.value = w),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      a("div", Ut, [
        a("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !S.value
        }, [
          v(l(f), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: E({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          x[7] || (x[7] = _("Add to memory ", -1))
        ], 8, jt)
      ])
    ], 32));
  }
}), Wt = { class: "mm-view-head" }, qt = { class: "mm-view-title" }, Ht = {
  key: 0,
  class: "kx-notice error"
}, Gt = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, Jt = { class: "kx-empty-ico" }, Yt = ["aria-label"], Zt = { class: "mm-card-h" }, Qt = { class: "kx-chip" }, Xt = { class: "mm-option-main" }, en = { class: "mm-option-t" }, tn = { class: "mm-muted" }, nn = ["disabled", "onClick"], on = ["disabled"], an = /* @__PURE__ */ M({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = ie(() => t.memory.kbId.value ? `${t.memory.base.value}/conflicts` : null, "groups", t.memory.revision);
    function c(r, o) {
      const i = `${t.memory.base.value}/conflicts/${encodeURIComponent(r.group_id)}/resolve`;
      t.memory.act(() => J.post(i, { winner_id: o.id }));
    }
    return (r, o) => (s(), u(B, null, [
      a("header", Wt, [
        a("h2", qt, [
          v(l(f), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = _("Conflicts", -1))
        ]),
        o[2] || (o[2] = a("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      l(n).error.value ? (s(), u("div", Ht, [
        v(l(f), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, m(l(n).error.value), 1)
      ])) : !l(n).loading.value && !l(n).rows.value.length ? (s(), u("div", Gt, [
        a("span", Jt, [
          v(l(f), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = a("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = a("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : k("", !0),
      (s(!0), u(B, null, R(l(n).rows.value, (i) => (s(), u("section", {
        key: i.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${l(j)(i.items[0]?.key || "")}`
      }, [
        a("div", Zt, [
          a("span", Qt, m(l(F)[i.items[0]?.kind]?.label), 1),
          _(m(l(j)(i.items[0]?.key || "")), 1)
        ]),
        (s(!0), u(B, null, R(i.items, (d) => (s(), u("div", {
          key: d.id,
          class: "mm-option"
        }, [
          a("div", Xt, [
            a("span", en, m(d.content), 1),
            a("span", tn, m(l(U)(d.valid_at)) + " · " + m(l(he)(d.source)), 1)
          ]),
          a("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: ($) => c(i, d)
          }, [
            v(l(f), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = _("Keep this ", -1))
          ], 8, nn)
        ]))), 128))
      ], 8, Yt))), 128)),
      l(n).next.value !== null ? (s(), u("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: l(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...i) => l(n).more && l(n).more(...i))
      }, "Show more conflicts", 8, on)) : k("", !0)
    ], 64));
  }
}), ln = ["aria-label", "title", "aria-pressed", "disabled"], X = /* @__PURE__ */ M({
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
  setup(e, { emit: t }) {
    const n = t;
    return (c, r) => (s(), u("button", {
      type: "button",
      class: E(["kx-iconbtn", { on: e.active, danger: e.danger, sm: e.small }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: r[0] || (r[0] = (o) => n("click"))
    }, [
      v(l(f), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, ln));
  }
}), sn = ["aria-label"], rn = { class: "kx-drawer-h" }, dn = { class: "kx-drawer-title" }, un = { class: "kx-drawer-b" }, cn = /* @__PURE__ */ M({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, c = t;
    function r(o) {
      o.key === "Escape" && c("close");
    }
    return D(() => n.open, (o) => {
      o ? window.addEventListener("keydown", r) : window.removeEventListener("keydown", r);
    }), be(() => window.removeEventListener("keydown", r)), (o, i) => (s(), P(pe, { name: "kx-drawer" }, {
      default: q(() => [
        e.open ? (s(), u("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: i[1] || (i[1] = oe((d) => c("close"), ["self"]))
        }, [
          a("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            a("div", rn, [
              a("span", dn, [
                v(l(f), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                _(m(e.title), 1)
              ]),
              v(X, {
                icon: "tabler:x",
                label: "Close",
                onClick: i[0] || (i[0] = (d) => c("close"))
              })
            ]),
            a("div", un, [
              W(o.$slots, "default")
            ])
          ], 8, sn)
        ])) : k("", !0)
      ]),
      _: 3
    }));
  }
}), mn = ["aria-label"], bn = { class: "kx-modal-h" }, pn = { class: "kx-modal-h-ico" }, vn = { class: "kx-modal-h-text" }, gn = { class: "kx-modal-h-title" }, yn = {
  key: 0,
  class: "kx-modal-h-sub"
}, fn = { class: "kx-modal-body" }, hn = { class: "kx-modal-foot" }, kn = ["disabled"], $n = ["disabled"], wn = /* @__PURE__ */ M({
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
  setup(e, { emit: t }) {
    const n = e, c = t;
    function r(o) {
      o.key === "Escape" && !n.busy && c("cancel");
    }
    return D(() => n.open, (o) => {
      o ? window.addEventListener("keydown", r) : window.removeEventListener("keydown", r);
    }), be(() => window.removeEventListener("keydown", r)), (o, i) => (s(), P(pe, { name: "kx-modal" }, {
      default: q(() => [
        e.open ? (s(), u("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: i[3] || (i[3] = oe((d) => !e.busy && c("cancel"), ["self"]))
        }, [
          a("div", {
            class: E(["kx-modal", { danger: e.danger }]),
            role: "alertdialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            a("div", bn, [
              a("span", pn, [
                v(l(f), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("span", vn, [
                a("span", gn, m(e.title), 1),
                e.subtitle ? (s(), u("span", yn, m(e.subtitle), 1)) : k("", !0)
              ]),
              v(X, {
                icon: "tabler:x",
                label: "Close",
                disabled: e.busy,
                onClick: i[0] || (i[0] = (d) => c("cancel"))
              }, null, 8, ["disabled"])
            ]),
            a("div", fn, [
              W(o.$slots, "default")
            ]),
            a("div", hn, [
              a("button", {
                type: "button",
                class: "kx-btn kx-btn-ghost",
                disabled: e.busy,
                onClick: i[1] || (i[1] = (d) => c("cancel"))
              }, "Cancel", 8, kn),
              a("button", {
                type: "button",
                class: E(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
                disabled: e.busy,
                onClick: i[2] || (i[2] = (d) => c("confirm"))
              }, [
                e.busy ? (s(), P(l(f), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : k("", !0),
                _(m(e.confirmLabel), 1)
              ], 10, $n)
            ])
          ], 10, mn)
        ])) : k("", !0)
      ]),
      _: 3
    }));
  }
}), _n = {
  key: 0,
  class: "kx-notice error"
}, xn = {
  key: 1,
  class: "mm-skel-reader"
}, Sn = {
  key: 2,
  class: "mm-reader"
}, Cn = { class: "mm-head" }, Ln = { class: "mm-head-body" }, Tn = { class: "mm-head-top" }, An = { class: "kx-chip" }, Bn = { class: "mm-topic" }, In = { class: "mm-head-acts" }, Vn = ["disabled"], On = ["disabled"], Pn = ["disabled"], En = {
  key: 0,
  class: "mm-edit"
}, zn = { class: "mm-edit-acts" }, Rn = ["disabled"], Kn = {
  key: 1,
  class: "mm-title"
}, Nn = { class: "mm-facts" }, Dn = { class: "mm-fact" }, Mn = ["title"], Un = ["title"], jn = ["title"], Fn = { class: "mm-fact" }, Wn = {
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, qn = { class: "mm-timeline" }, Hn = { class: "mm-tl-body" }, Gn = { class: "mm-tl-t" }, Jn = { class: "mm-tl-s" }, Yn = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, Zn = {
  key: 0,
  class: "mm-muted"
}, Qn = {
  key: 1,
  class: "mm-sources"
}, Xn = ["title"], eo = /* @__PURE__ */ M({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone"],
  setup(e, { emit: t }) {
    const n = e, c = t, r = A(null), o = A([]), i = A(null), d = A([]), $ = A(""), g = A(null), L = A(!1), V = I(() => `${n.memory.base.value}/items/${encodeURIComponent(n.itemId)}`), z = I(() => r.value ? F[r.value.kind] : null), S = I(() => r.value?.status === "current" || r.value?.status === "conflict");
    let T = 0;
    async function p(w = 0) {
      const b = ++T, h = V.value;
      try {
        const { data: C } = await J.get(w ? `${h}?offset=${w}` : h);
        if (b !== T || !H(C)) return;
        if (!w) {
          const ee = H(C.item) ? C.item : null;
          if (!ee || ee.status === "forgotten") {
            c("gone");
            return;
          }
          r.value = ee, d.value = Array.isArray(C.provenance) ? C.provenance : [];
        }
        const de = Array.isArray(C.versions) ? C.versions : [];
        o.value = w ? [...o.value, ...de] : de, i.value = typeof C.next_offset == "number" ? C.next_offset : null, $.value = "";
      } catch (C) {
        if (b !== T) return;
        H(C) && H(C.response) && C.response.status === 404 ? c("gone") : $.value = Ie(C);
      }
    }
    D(() => n.itemId, () => {
      r.value = null, o.value = [], g.value = null, L.value = !1, p();
    }, { immediate: !0 }), D(n.memory.revision, () => {
      p();
    });
    function y(w) {
      const b = `${V.value}/${w}`;
      return n.memory.act(() => J.post(b, {}));
    }
    async function K() {
      const w = (g.value || "").trim();
      if (!w || !r.value) return;
      const b = V.value;
      await n.memory.act(async () => {
        const { data: C } = await J.put(b, { content: w });
        H(C) && typeof C.item_id == "string" && C.item_id !== n.itemId && c("replaced", C.item_id);
      }) && (g.value = null);
    }
    async function O() {
      await y("forget") && (L.value = !1, c("gone"));
    }
    function x(w) {
      return w.host_kind === "session" ? "Conversation" : w.host_kind === "dataflow" ? "Workflow run" : w.host_kind === "content" ? "Document" : w.host_kind;
    }
    return (w, b) => (s(), u(B, null, [
      $.value ? (s(), u("div", _n, [
        v(l(f), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, m($.value), 1)
      ])) : r.value ? (s(), u("article", Sn, [
        a("header", Cn, [
          a("span", {
            class: E(["mm-head-ic", z.value?.group])
          }, [
            v(l(f), {
              icon: z.value?.icon || "tabler:note",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          a("div", Ln, [
            a("div", Tn, [
              a("span", An, m(z.value?.label), 1),
              a("span", Bn, m(l(j)(r.value.key)), 1),
              r.value.status !== "current" ? (s(), P(l(se), {
                key: 0,
                class: "kx-tag-sm",
                severity: l(ge)(r.value.status),
                value: r.value.status
              }, null, 8, ["severity", "value"])) : k("", !0),
              a("span", In, [
                S.value && g.value === null ? (s(), u("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: b[0] || (b[0] = (h) => g.value = r.value.content)
                }, [
                  v(l(f), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  b[8] || (b[8] = _("Edit ", -1))
                ])) : k("", !0),
                S.value ? (s(), u("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: b[1] || (b[1] = (h) => y("archive"))
                }, [
                  v(l(f), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  b[9] || (b[9] = _("Archive ", -1))
                ], 8, Vn)) : k("", !0),
                r.value.status === "archived" ? (s(), u("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: b[2] || (b[2] = (h) => y("restore"))
                }, [
                  v(l(f), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  b[10] || (b[10] = _("Restore ", -1))
                ], 8, On)) : k("", !0),
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: b[3] || (b[3] = (h) => L.value = !0)
                }, [
                  v(l(f), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  b[11] || (b[11] = _("Forget ", -1))
                ], 8, Pn)
              ])
            ]),
            g.value !== null ? (s(), u("div", En, [
              v(l(fe), {
                modelValue: g.value,
                "onUpdate:modelValue": b[4] || (b[4] = (h) => g.value = h),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              a("div", zn, [
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !g.value.trim(),
                  onClick: K
                }, [
                  v(l(f), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  b[12] || (b[12] = _("Save as new version ", -1))
                ], 8, Rn),
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: b[5] || (b[5] = (h) => g.value = null)
                }, "Cancel")
              ])
            ])) : (s(), u("h2", Kn, m(r.value.content), 1)),
            a("div", Nn, [
              a("span", Dn, [
                v(l(f), {
                  icon: "tabler:user-circle",
                  "aria-hidden": "true"
                }),
                _(m(l(Ze)(r.value)), 1)
              ]),
              a("span", {
                class: "mm-fact",
                title: l(G)(r.value.valid_at)
              }, [
                v(l(f), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                _("True since " + m(l(U)(r.value.valid_at)), 1)
              ], 8, Mn),
              r.value.invalid_at ? (s(), u("span", {
                key: 0,
                class: "mm-fact",
                title: l(G)(r.value.invalid_at)
              }, [
                v(l(f), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                _("Until " + m(l(U)(r.value.invalid_at)), 1)
              ], 8, Un)) : k("", !0),
              a("span", {
                class: "mm-fact",
                title: l(G)(r.value.recorded_at)
              }, [
                v(l(f), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                _(m(l(he)(r.value.source)), 1)
              ], 8, jn),
              a("span", Fn, [
                v(l(f), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                _(m(r.value.cardinality === "single" ? "One value at a time" : "Can hold several values"), 1)
              ])
            ])
          ])
        ]),
        a("section", Wn, [
          b[14] || (b[14] = a("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          a("ol", qn, [
            (s(!0), u(B, null, R(o.value, (h) => (s(), u("li", {
              key: h.id,
              class: E({ now: h.id === r.value.id, past: h.status !== "current" })
            }, [
              b[13] || (b[13] = a("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              a("span", Hn, [
                a("span", Gn, m(h.content), 1),
                a("span", Jn, [
                  _("v" + m(h.version) + " · " + m(l(U)(h.valid_at)), 1),
                  h.status !== "current" ? (s(), u(B, { key: 0 }, [
                    _(" · " + m(h.status), 1)
                  ], 64)) : k("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          i.value !== null ? (s(), u("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: b[6] || (b[6] = (h) => p(i.value))
          }, "Show older versions")) : k("", !0)
        ]),
        a("section", Yn, [
          b[15] || (b[15] = a("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          d.value.length ? (s(), u("ul", Qn, [
            (s(!0), u(B, null, R(d.value, (h) => (s(), u("li", {
              key: h.host_kind + h.host_id + h.event_id
            }, [
              v(l(f), {
                icon: "tabler:message-circle",
                "aria-hidden": "true"
              }),
              a("span", null, m(x(h)), 1),
              h.recorded_at ? (s(), u("span", {
                key: 0,
                class: "mm-muted",
                title: l(G)(h.recorded_at)
              }, m(l(U)(h.recorded_at)), 9, Xn)) : k("", !0)
            ]))), 128))
          ])) : (s(), u("p", Zn, m(r.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (s(), u("div", xn, [
        (s(), u(B, null, R(4, (h) => a("div", {
          key: h,
          class: "mm-skel-line"
        })), 64))
      ])),
      v(wn, {
        open: L.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: r.value ? l(j)(r.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: b[7] || (b[7] = (h) => L.value = !1),
        onConfirm: O
      }, {
        default: q(() => [...b[16] || (b[16] = [
          _(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), to = { class: "mm-rail-tools" }, no = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, oo = {
  key: 0,
  class: "mm-skel"
}, ao = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, lo = {
  key: 2,
  class: "mm-rail-empty"
}, io = ["aria-expanded", "onClick"], so = { class: "kx-railsec-t" }, ro = { class: "count" }, uo = { class: "kx-railsec-b" }, co = ["aria-current", "onClick"], mo = { class: "mm-row-main" }, bo = { class: "mm-row-t" }, po = { class: "mm-row-s" }, vo = ["disabled"], go = /* @__PURE__ */ M({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered"],
  setup(e, { emit: t }) {
    const n = e, c = t, r = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = A("current"), i = A(""), d = A("");
    let $;
    D(i, (S) => {
      clearTimeout($), $ = setTimeout(() => {
        d.value = S.trim();
      }, 250);
    });
    const g = ie(() => {
      if (!n.memory.kbId.value) return null;
      const S = new URLSearchParams({ status: o.value, limit: "100" });
      return d.value && S.set("q", d.value), `${n.memory.base.value}/items?${S.toString()}`;
    }, "items", n.memory.revision);
    D([o, d], () => c("filtered"));
    const L = A({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), V = I(() => Ye.map((S) => ({ ...S, items: g.rows.value.filter((T) => F[T.kind]?.group === S.id) })).filter((S) => S.items.length)), z = I(() => d.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (S, T) => (s(), u(B, null, [
      a("div", to, [
        v(ze, {
          modelValue: i.value,
          "onUpdate:modelValue": T[0] || (T[0] = (p) => i.value = p),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        v(l(re), {
          modelValue: o.value,
          "onUpdate:modelValue": T[1] || (T[1] = (p) => o.value = p),
          class: "mm-views",
          options: r,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      a("nav", no, [
        l(g).loading.value && !l(g).rows.value.length ? (s(), u("div", oo, [
          (s(), u(B, null, R(6, (p) => a("div", {
            key: p,
            class: "mm-skel-row"
          })), 64))
        ])) : l(g).error.value ? (s(), u("div", ao, [
          v(l(f), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          a("span", null, m(l(g).error.value), 1)
        ])) : l(g).rows.value.length ? k("", !0) : (s(), u("div", lo, m(z.value), 1)),
        (s(!0), u(B, null, R(V.value, (p) => (s(), u("div", {
          key: p.id,
          class: E(["kx-railsec", { closed: L.value[p.id] }])
        }, [
          a("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !L.value[p.id],
            onClick: (y) => L.value[p.id] = !L.value[p.id]
          }, [
            v(l(f), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            v(l(f), {
              class: "kx-railsec-ic",
              icon: p.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            a("span", so, m(p.title), 1),
            a("span", ro, m(p.items.length), 1)
          ], 8, io),
          me(a("div", uo, [
            (s(!0), u(B, null, R(p.items, (y) => (s(), u("button", {
              key: y.id,
              type: "button",
              class: E(["mm-row", { on: e.selectedId === y.id }]),
              "aria-current": e.selectedId === y.id ? "true" : void 0,
              onClick: (K) => c("select", y)
            }, [
              a("span", {
                class: E(["mm-row-ic", l(F)[y.kind]?.group])
              }, [
                v(l(f), {
                  icon: l(F)[y.kind]?.icon || "tabler:note",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              a("span", mo, [
                a("span", bo, m(y.content), 1),
                a("span", po, m(l(j)(y.key)) + " · " + m(l(U)(y.valid_at)), 1)
              ])
            ], 10, co))), 128))
          ], 512), [
            [Le, !L.value[p.id]]
          ])
        ], 2))), 128)),
        l(g).next.value !== null ? (s(), u("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: l(g).loading.value,
          onClick: T[2] || (T[2] = //@ts-ignore
          (...p) => l(g).more && l(g).more(...p))
        }, [
          l(g).loading.value ? (s(), P(l(f), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : k("", !0),
          T[3] || (T[3] = _("Show more ", -1))
        ], 8, vo)) : k("", !0)
      ])
    ], 64));
  }
}), yo = { class: "mm-page" }, fo = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, ho = { class: "kx-shell" }, ko = { class: "kx-rail" }, $o = { class: "kx-railhead" }, wo = { class: "kx-railhead-title" }, _o = { key: 0 }, xo = { class: "kx-railhead-acts" }, So = { class: "kx-main" }, Co = { class: "kx-main-scroll mm-main" }, Lo = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, To = { class: "kx-empty-ico" }, Ao = /* @__PURE__ */ M({
  __name: "MemoryManage",
  setup(e) {
    const t = Ve(), n = Oe(), c = I(() => Pe(t.value.config)), r = Re(I(() => String(c.value.kb_id || ""))), o = A("item"), i = A(String(c.value.route || "")), d = A(!1), $ = I(() => r.status.value?.counts.current), g = I(() => r.status.value?.counts.conflict_groups || 0), L = I(() => (r.status.value?.runs || []).filter((p) => p.status === "failed").length);
    D(() => c.value.route, (p) => {
      typeof p == "string" && p && p !== i.value && (i.value = p, o.value = "item");
    }), D(r.kbId, () => {
      i.value = "", o.value = "item";
    });
    function V(p) {
      o.value = "item", p !== i.value && (i.value = p, n("navigate", p));
    }
    function z(p) {
      V(p.id);
    }
    function S(p) {
      o.value = o.value === p ? "item" : p;
    }
    function T(p) {
      d.value = !1, p && V(p);
    }
    return (p, y) => (s(), u("div", yo, [
      l(r).error.value ? (s(), u("div", fo, [
        v(l(f), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, m(l(r).error.value), 1)
      ])) : k("", !0),
      a("div", ho, [
        a("aside", ko, [
          a("div", $o, [
            a("span", wo, [
              y[6] || (y[6] = _("Memories", -1)),
              $.value !== void 0 ? (s(), u("b", _o, m($.value), 1)) : k("", !0)
            ]),
            a("div", xo, [
              v(X, {
                icon: "tabler:activity",
                label: L.value ? `Activity, ${L.value} failed` : "Activity",
                active: o.value === "activity",
                onClick: y[0] || (y[0] = (K) => S("activity"))
              }, null, 8, ["label", "active"]),
              v(X, {
                icon: "tabler:plus",
                label: "Add agent memory",
                active: d.value,
                onClick: y[1] || (y[1] = (K) => d.value = !0)
              }, null, 8, ["active"])
            ])
          ]),
          g.value ? (s(), u("button", {
            key: 0,
            type: "button",
            class: E(["mm-conflict-bar", { on: o.value === "conflicts" }]),
            onClick: y[2] || (y[2] = (K) => S("conflicts"))
          }, [
            v(l(f), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            a("span", null, m(g.value === 1 ? "1 conflict to resolve" : `${g.value} conflicts to resolve`), 1),
            v(l(f), {
              class: "mm-conflict-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : k("", !0),
          v(go, {
            memory: l(r),
            "selected-id": o.value === "item" ? i.value : "",
            onSelect: z,
            onFiltered: y[3] || (y[3] = (K) => i.value = "")
          }, null, 8, ["memory", "selected-id"])
        ]),
        a("main", So, [
          a("div", Co, [
            o.value === "conflicts" ? (s(), P(an, {
              key: 0,
              memory: l(r)
            }, null, 8, ["memory"])) : o.value === "activity" ? (s(), P(dt, {
              key: 1,
              memory: l(r)
            }, null, 8, ["memory"])) : i.value ? (s(), P(eo, {
              key: i.value,
              memory: l(r),
              "item-id": i.value,
              onReplaced: V,
              onGone: y[4] || (y[4] = (K) => i.value = "")
            }, null, 8, ["memory", "item-id"])) : (s(), u("div", Lo, [
              a("span", To, [
                v(l(f), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              y[7] || (y[7] = a("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              y[8] || (y[8] = a("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      v(cn, {
        open: d.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: y[5] || (y[5] = (K) => d.value = !1)
      }, {
        default: q(() => [
          d.value ? (s(), P(Ft, {
            key: 0,
            memory: l(r),
            onAdded: T
          }, null, 8, ["memory"])) : k("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), Bo = Ee(Ao, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
Te(import.meta.url, Bo);
//# sourceMappingURL=index.js.map
