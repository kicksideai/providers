import { B as ue, c as Ve, f as de, R as ye, a as ve, k as ae, d as ne, e as Oe, b as Pe, u as Ee, P as Ne } from "./wc-runtime-Cnj2CWxS.js";
import { openBlock as i, createElementBlock as d, mergeProps as j, createBlock as z, resolveDynamicComponent as ze, createCommentVNode as w, renderSlot as Y, createElementVNode as a, toDisplayString as p, defineComponent as H, computed as P, Fragment as V, createVNode as h, unref as s, createTextVNode as B, renderList as M, normalizeClass as R, resolveDirective as Re, withDirectives as he, resolveComponent as De, createSlots as Me, withCtx as G, ref as T, watch as U, onUnmounted as Ke, withModifiers as ke, onBeforeUnmount as je, Transition as Ue, nextTick as pe, vShow as Fe } from "vue";
import { Icon as x } from "@iconify/vue";
import { b as _e, u as qe, s as He, c as se } from "./useWidget-BoLMowwj.js";
import { e as X, b as We, p as Je } from "./types-DQ01_s6c.js";
import { on as Ye } from "@wippy-fe/proxy";
import { m as F, a as ce, h as fe, u as Ge, _ as Ze } from "./usePaged-BxR1AKIL.js";
var Qe = "\n    .p-tag {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        background: dt('tag.primary.background');\n        color: dt('tag.primary.color');\n        font-size: dt('tag.font.size');\n        font-weight: dt('tag.font.weight');\n        padding: dt('tag.padding');\n        border-radius: dt('tag.border.radius');\n        gap: dt('tag.gap');\n    }\n\n    .p-tag-icon {\n        font-size: dt('tag.icon.size');\n        width: dt('tag.icon.size');\n        height: dt('tag.icon.size');\n    }\n\n    .p-tag-rounded {\n        border-radius: dt('tag.rounded.border.radius');\n    }\n\n    .p-tag-success {\n        background: dt('tag.success.background');\n        color: dt('tag.success.color');\n    }\n\n    .p-tag-info {\n        background: dt('tag.info.background');\n        color: dt('tag.info.color');\n    }\n\n    .p-tag-warn {\n        background: dt('tag.warn.background');\n        color: dt('tag.warn.color');\n    }\n\n    .p-tag-danger {\n        background: dt('tag.danger.background');\n        color: dt('tag.danger.color');\n    }\n\n    .p-tag-secondary {\n        background: dt('tag.secondary.background');\n        color: dt('tag.secondary.color');\n    }\n\n    .p-tag-contrast {\n        background: dt('tag.contrast.background');\n        color: dt('tag.contrast.color');\n    }\n", Xe = {
  root: function(n) {
    var t = n.props;
    return ["p-tag p-component", {
      "p-tag-info": t.severity === "info",
      "p-tag-success": t.severity === "success",
      "p-tag-warn": t.severity === "warn",
      "p-tag-danger": t.severity === "danger",
      "p-tag-secondary": t.severity === "secondary",
      "p-tag-contrast": t.severity === "contrast",
      "p-tag-rounded": t.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, et = ue.extend({
  name: "tag",
  style: Qe,
  classes: Xe
}), tt = {
  name: "BaseTag",
  extends: Ve,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: et,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ee(e) {
  "@babel/helpers - typeof";
  return ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, ee(e);
}
function nt(e, n, t) {
  return (n = ot(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function ot(e) {
  var n = lt(e, "string");
  return ee(n) == "symbol" ? n : n + "";
}
function lt(e, n) {
  if (ee(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var c = t.call(e, n);
    if (ee(c) != "object") return c;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(e);
}
var me = {
  name: "Tag",
  extends: tt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return de(nt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, at = ["data-p"];
function st(e, n, t, c, l, o) {
  return i(), d("span", j({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (i(), z(ze(e.$slots.icon), j({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (i(), d("span", j({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : w("", !0), e.value != null || e.$slots.default ? Y(e.$slots, "default", {
    key: 2
  }, function() {
    return [a("span", j({
      class: e.cx("label")
    }, e.ptm("label")), p(e.value), 17)];
  }) : w("", !0)], 16, at);
}
me.render = st;
const J = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, it = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function q(e) {
  const n = e.replace(/[_\-.]+/g, " ").trim();
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : e;
}
function rt(e, n) {
  if (e === void 0) return [];
  const t = [];
  function c(l, o) {
    if (l !== null && typeof l == "object") {
      const r = Array.isArray(l) ? l.map((v, g) => [String(g + 1), v]) : Object.entries(l);
      if (r.length) {
        for (const [v, g] of r) c(g, [...o, q(v)]);
        return;
      }
    }
    const u = l === null ? "Not set" : typeof l == "object" ? "None" : typeof l == "boolean" ? l ? "Yes" : "No" : String(l);
    t.push({ label: o.length ? o.join(" · ") : q(n), text: u });
  }
  return c(e, []), t;
}
const ut = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function dt(e) {
  return ut[e];
}
const ie = {
  current: "Current",
  superseded: "Earlier",
  conflict: "Conflict",
  archived: "Archived",
  forgotten: "Forgotten",
  scheduled: "Scheduled",
  running: "Running",
  succeeded: "Completed",
  failed: "Failed",
  rejected: "Rejected",
  cancelled: "Cancelled"
}, ct = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function we(e) {
  return ct[e] ?? "secondary";
}
function $e(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function oe(e) {
  const n = $e(e);
  return Number.isFinite(n) ? new Date(n).toLocaleString() : "";
}
const mt = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function W(e, n = Date.now()) {
  const t = $e(e);
  if (!Number.isFinite(t)) return "";
  const c = Math.round((t - n) / 1e3), l = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, u] of mt)
    if (Math.abs(c) >= u) return l.format(Math.round(c / u), o);
  return "just now";
}
const bt = { class: "mm-view-head" }, vt = { class: "mm-view-title" }, pt = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, ft = { class: "kx-empty-ico" }, gt = {
  key: 1,
  class: "mm-runs"
}, yt = { class: "mm-run-main" }, ht = { class: "mm-run-t" }, kt = ["title"], _t = {
  key: 0,
  class: "mm-run-err"
}, wt = /* @__PURE__ */ H({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const n = e, t = P(() => n.memory.status.value?.runs || []);
    function c(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function l(o) {
      const u = o.stats || {}, r = [
        u.added ? "".concat(u.added, " new") : "",
        u.superseded ? "".concat(u.superseded, " updated") : "",
        u.conflicted ? "".concat(u.conflicted, " contested") : "",
        u.rejected ? "".concat(u.rejected, " rejected") : ""
      ].filter(Boolean);
      return r.length ? r.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, u) => (i(), d(V, null, [
      a("header", bt, [
        a("h2", vt, [
          h(s(x), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          u[0] || (u[0] = B("Activity", -1))
        ]),
        u[1] || (u[1] = a("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      t.value.length ? (i(), d("ol", gt, [
        (i(!0), d(V, null, M(t.value, (r) => (i(), d("li", {
          key: r.id,
          class: R(["mm-run", r.status])
        }, [
          a("div", yt, [
            a("span", ht, p(c(r)), 1),
            a("span", {
              class: "mm-muted",
              title: s(oe)(r.finished_at || r.started_at || r.created_at)
            }, [
              B(p(s(W)(r.finished_at || r.started_at || r.created_at)), 1),
              l(r) ? (i(), d(V, { key: 0 }, [
                B(" · " + p(l(r)), 1)
              ], 64)) : w("", !0)
            ], 8, kt),
            r.last_error ? (i(), d("span", _t, p(r.last_error), 1)) : w("", !0)
          ]),
          r.status !== "succeeded" ? (i(), z(s(me), {
            key: 0,
            class: "kx-tag-sm",
            severity: s(we)(r.status),
            value: s(ie)[r.status]
          }, null, 8, ["severity", "value"])) : w("", !0)
        ], 2))), 128))
      ])) : (i(), d("div", pt, [
        a("span", ft, [
          h(s(x), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        u[2] || (u[2] = a("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        u[3] || (u[3] = a("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
var $t = "\n    .p-togglebutton {\n        display: inline-flex;\n        cursor: pointer;\n        user-select: none;\n        overflow: hidden;\n        position: relative;\n        color: dt('togglebutton.color');\n        background: dt('togglebutton.background');\n        border: 1px solid dt('togglebutton.border.color');\n        padding: dt('togglebutton.padding');\n        font-size: 1rem;\n        font-family: inherit;\n        font-feature-settings: inherit;\n        transition:\n            background dt('togglebutton.transition.duration'),\n            color dt('togglebutton.transition.duration'),\n            border-color dt('togglebutton.transition.duration'),\n            outline-color dt('togglebutton.transition.duration'),\n            box-shadow dt('togglebutton.transition.duration');\n        border-radius: dt('togglebutton.border.radius');\n        outline-color: transparent;\n        font-weight: dt('togglebutton.font.weight');\n    }\n\n    .p-togglebutton-content {\n        display: inline-flex;\n        flex: 1 1 auto;\n        align-items: center;\n        justify-content: center;\n        gap: dt('togglebutton.gap');\n        padding: dt('togglebutton.content.padding');\n        background: transparent;\n        border-radius: dt('togglebutton.content.border.radius');\n        transition:\n            background dt('togglebutton.transition.duration'),\n            color dt('togglebutton.transition.duration'),\n            border-color dt('togglebutton.transition.duration'),\n            outline-color dt('togglebutton.transition.duration'),\n            box-shadow dt('togglebutton.transition.duration');\n    }\n\n    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {\n        background: dt('togglebutton.hover.background');\n        color: dt('togglebutton.hover.color');\n    }\n\n    .p-togglebutton.p-togglebutton-checked {\n        background: dt('togglebutton.checked.background');\n        border-color: dt('togglebutton.checked.border.color');\n        color: dt('togglebutton.checked.color');\n    }\n\n    .p-togglebutton-checked .p-togglebutton-content {\n        background: dt('togglebutton.content.checked.background');\n        box-shadow: dt('togglebutton.content.checked.shadow');\n    }\n\n    .p-togglebutton:focus-visible {\n        box-shadow: dt('togglebutton.focus.ring.shadow');\n        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');\n        outline-offset: dt('togglebutton.focus.ring.offset');\n    }\n\n    .p-togglebutton.p-invalid {\n        border-color: dt('togglebutton.invalid.border.color');\n    }\n\n    .p-togglebutton:disabled {\n        opacity: 1;\n        cursor: default;\n        background: dt('togglebutton.disabled.background');\n        border-color: dt('togglebutton.disabled.border.color');\n        color: dt('togglebutton.disabled.color');\n    }\n\n    .p-togglebutton-label,\n    .p-togglebutton-icon {\n        position: relative;\n        transition: none;\n    }\n\n    .p-togglebutton-icon {\n        color: dt('togglebutton.icon.color');\n    }\n\n    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {\n        color: dt('togglebutton.icon.hover.color');\n    }\n\n    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {\n        color: dt('togglebutton.icon.checked.color');\n    }\n\n    .p-togglebutton:disabled .p-togglebutton-icon {\n        color: dt('togglebutton.icon.disabled.color');\n    }\n\n    .p-togglebutton-sm {\n        padding: dt('togglebutton.sm.padding');\n        font-size: dt('togglebutton.sm.font.size');\n    }\n\n    .p-togglebutton-sm .p-togglebutton-content {\n        padding: dt('togglebutton.content.sm.padding');\n    }\n\n    .p-togglebutton-lg {\n        padding: dt('togglebutton.lg.padding');\n        font-size: dt('togglebutton.lg.font.size');\n    }\n\n    .p-togglebutton-lg .p-togglebutton-content {\n        padding: dt('togglebutton.content.lg.padding');\n    }\n\n    .p-togglebutton-fluid {\n        width: 100%;\n    }\n", xt = {
  root: function(n) {
    var t = n.instance, c = n.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": t.active,
      "p-invalid": t.$invalid,
      "p-togglebutton-fluid": c.fluid,
      "p-togglebutton-sm p-inputfield-sm": c.size === "small",
      "p-togglebutton-lg p-inputfield-lg": c.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, St = ue.extend({
  name: "togglebutton",
  style: $t,
  classes: xt
}), Ct = {
  name: "BaseToggleButton",
  extends: _e,
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
  style: St,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function te(e) {
  "@babel/helpers - typeof";
  return te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, te(e);
}
function Tt(e, n, t) {
  return (n = At(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function At(e) {
  var n = It(e, "string");
  return te(n) == "symbol" ? n : n + "";
}
function It(e, n) {
  if (te(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var c = t.call(e, n);
    if (te(c) != "object") return c;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(e);
}
var xe = {
  name: "ToggleButton",
  extends: Ct,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(n) {
      var t = n === "root" ? this.ptmi : this.ptm;
      return t(n, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(n) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, n), this.$emit("change", n));
    },
    onBlur: function(n) {
      var t, c;
      (t = (c = this.formField).onBlur) === null || t === void 0 || t.call(c, n);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return ve(this.onLabel) && ve(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return de(Tt({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ye
  }
}, Bt = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Lt = ["data-p"];
function Vt(e, n, t, c, l, o) {
  var u = Re("ripple");
  return he((i(), d("button", j({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: n[0] || (n[0] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    }),
    onBlur: n[1] || (n[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    })
  }, o.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": o.active,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [a("span", j({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [Y(e.$slots, "default", {}, function() {
    return [Y(e.$slots, "icon", {
      value: e.d_value,
      class: R(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (i(), d("span", j({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : w("", !0)];
    }), a("span", j({
      class: e.cx("label")
    }, o.getPTOptions("label")), p(o.label), 17)];
  })], 16, Lt)], 16, Bt)), [[u]]);
}
xe.render = Vt;
var Ot = "\n    .p-selectbutton {\n        display: inline-flex;\n        user-select: none;\n        vertical-align: bottom;\n        outline-color: transparent;\n        border-radius: dt('selectbutton.border.radius');\n    }\n\n    .p-selectbutton .p-togglebutton {\n        border-radius: 0;\n        border-width: 1px 1px 1px 0;\n    }\n\n    .p-selectbutton .p-togglebutton:focus-visible {\n        position: relative;\n        z-index: 1;\n    }\n\n    .p-selectbutton .p-togglebutton:first-child {\n        border-inline-start-width: 1px;\n        border-start-start-radius: dt('selectbutton.border.radius');\n        border-end-start-radius: dt('selectbutton.border.radius');\n    }\n\n    .p-selectbutton .p-togglebutton:last-child {\n        border-start-end-radius: dt('selectbutton.border.radius');\n        border-end-end-radius: dt('selectbutton.border.radius');\n    }\n\n    .p-selectbutton.p-invalid {\n        outline: 1px solid dt('selectbutton.invalid.border.color');\n        outline-offset: 0;\n    }\n\n    .p-selectbutton-fluid {\n        width: 100%;\n    }\n    \n    .p-selectbutton-fluid .p-togglebutton {\n        flex: 1 1 0;\n    }\n", Pt = {
  root: function(n) {
    var t = n.props, c = n.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": c.$invalid,
      // @todo: check
      "p-selectbutton-fluid": t.fluid
    }];
  }
}, Et = ue.extend({
  name: "selectbutton",
  style: Ot,
  classes: Pt
}), Nt = {
  name: "BaseSelectButton",
  extends: _e,
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
  style: Et,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function zt(e, n) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = Se(e)) || n) {
      t && (e = t);
      var c = 0, l = function() {
      };
      return { s: l, n: function() {
        return c >= e.length ? { done: !0 } : { done: !1, value: e[c++] };
      }, e: function(g) {
        throw g;
      }, f: l };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, u = !0, r = !1;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var g = t.next();
    return u = g.done, g;
  }, e: function(g) {
    r = !0, o = g;
  }, f: function() {
    try {
      u || t.return == null || t.return();
    } finally {
      if (r) throw o;
    }
  } };
}
function Rt(e) {
  return Kt(e) || Mt(e) || Se(e) || Dt();
}
function Dt() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Se(e, n) {
  if (e) {
    if (typeof e == "string") return re(e, n);
    var t = {}.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? re(e, n) : void 0;
  }
}
function Mt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Kt(e) {
  if (Array.isArray(e)) return re(e);
}
function re(e, n) {
  (n == null || n > e.length) && (n = e.length);
  for (var t = 0, c = Array(n); t < n; t++) c[t] = e[t];
  return c;
}
var be = {
  name: "SelectButton",
  extends: Nt,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(n) {
      return this.optionLabel ? ne(n, this.optionLabel) : n;
    },
    getOptionValue: function(n) {
      return this.optionValue ? ne(n, this.optionValue) : n;
    },
    getOptionRenderKey: function(n) {
      return this.dataKey ? ne(n, this.dataKey) : this.getOptionLabel(n);
    },
    isOptionDisabled: function(n) {
      return this.optionDisabled ? ne(n, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(n) {
      if (this.allowEmpty) return !1;
      var t = this.isSelected(n);
      return this.multiple ? t && this.d_value.length === 1 : t;
    },
    onOptionSelect: function(n, t, c) {
      var l = this;
      if (!(this.disabled || this.isOptionDisabled(t) || this.isOptionReadonly(t))) {
        var o = this.isSelected(t), u = this.getOptionValue(t), r;
        if (this.multiple)
          if (o) {
            if (r = this.d_value.filter(function(v) {
              return !ae(v, u, l.equalityKey);
            }), !this.allowEmpty && r.length === 0) return;
          } else
            r = this.d_value ? [].concat(Rt(this.d_value), [u]) : [u];
        else {
          if (o && !this.allowEmpty) return;
          r = o ? null : u;
        }
        this.writeValue(r, n), this.$emit("change", {
          originalEvent: n,
          value: r
        });
      }
    },
    isSelected: function(n) {
      var t = !1, c = this.getOptionValue(n);
      if (this.multiple) {
        if (this.d_value) {
          var l = zt(this.d_value), o;
          try {
            for (l.s(); !(o = l.n()).done; ) {
              var u = o.value;
              if (ae(u, c, this.equalityKey)) {
                t = !0;
                break;
              }
            }
          } catch (r) {
            l.e(r);
          } finally {
            l.f();
          }
        }
      } else
        t = ae(this.d_value, c, this.equalityKey);
      return t;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return de({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ye
  },
  components: {
    ToggleButton: xe
  }
}, jt = ["aria-labelledby", "data-p"];
function Ut(e, n, t, c, l, o) {
  var u = De("ToggleButton");
  return i(), d("div", j({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(i(!0), d(V, null, M(e.options, function(r, v) {
    return i(), z(u, {
      key: o.getOptionRenderKey(r),
      modelValue: o.isSelected(r),
      onLabel: o.getOptionLabel(r),
      offLabel: o.getOptionLabel(r),
      disabled: e.disabled || o.isOptionDisabled(r),
      unstyled: e.unstyled,
      size: e.size,
      readonly: o.isOptionReadonly(r),
      onChange: function(S) {
        return o.onOptionSelect(S, r, v);
      },
      pt: e.ptm("pcToggleButton")
    }, Me({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: G(function() {
        return [Y(e.$slots, "option", {
          option: r,
          index: v
        }, function() {
          return [a("span", j({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), p(o.getOptionLabel(r)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, jt);
}
be.render = Ut;
function Ft(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function ge(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function qt(e) {
  const n = P(() => "/api/v1/memory/".concat(encodeURIComponent(e.value))), t = T(null), c = T(""), l = T(!1), o = T(0);
  let u = 0;
  async function r() {
    const S = ++u;
    if (!e.value) return !1;
    try {
      const C = await F(e.value).status();
      return S !== u ? !1 : (t.value = C, c.value = "", o.value++, !0);
    } catch (C) {
      return S === u && (c.value = X(C)), !1;
    }
  }
  async function v(S) {
    l.value = !0, c.value = "";
    try {
      return await S(), await r();
    } catch (C) {
      return c.value = X(C), !1;
    } finally {
      l.value = !1;
    }
  }
  let g = null;
  return U(e, (S) => {
    if (g && g(), g = null, u++, t.value = null, c.value = "", !S) return;
    const C = Ye("component.".concat(S), () => {
      r();
    });
    g = typeof C == "function" ? C : null, r();
  }, { immediate: !0 }), Ke(() => {
    g && g();
  }), Oe(async () => {
    await r();
  }), { memoryId: e, base: n, status: t, error: c, busy: l, revision: o, act: v };
}
const Ht = { class: "mm-field" }, Wt = { class: "mm-hint" }, Jt = { class: "mm-field" }, Yt = ["selected"], Gt = {
  key: 1,
  class: "kx-notice error"
}, Zt = {
  key: 2,
  class: "mm-picker-pending mm-picker-pending--list",
  "aria-hidden": "true"
}, Qt = { class: "mm-field" }, Xt = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, en = {
  key: 1,
  class: "mm-hint"
}, tn = {
  key: 2,
  class: "kx-notice error"
}, nn = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, on = ["onClick"], ln = { class: "mm-field" }, an = { class: "mm-form-foot" }, sn = ["disabled"], rn = /* @__PURE__ */ H({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(e, { emit: n }) {
    const t = e, c = n, l = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = T("rule"), u = T(""), r = T(""), v = T(""), g = qe("wc-agent-picker"), S = P(() => l.find((L) => L.value === o.value)?.hint || ""), C = P(() => Ft(r.value)), I = P(() => r.value && !ge(C.value) ? "Use a short topic of letters, digits and spaces." : ""), k = P(() => !!u.value && ge(C.value) && !!v.value.trim()), f = ce(
      () => t.memory.memoryId.value ? [t.memory.memoryId.value, o.value] : null,
      (L) => F(t.memory.memoryId.value).topics({ kind: o.value, offset: L }),
      t.memory.revision
    ), $ = P(() => f.rows.value.map((L) => L.key).filter((L) => L !== C.value).slice(0, 8));
    U(o, () => {
      r.value = "";
    });
    function E(L) {
      const y = We(L).selected;
      u.value = String((Array.isArray(y) ? y : [])[0] || "");
    }
    async function N() {
      if (!k.value) return;
      let L = null;
      await t.memory.act(async () => {
        L = await F(t.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: u.value,
          key: C.value,
          value: v.value.trim(),
          content: v.value.trim()
        });
      }) && L !== null && c("added", L);
    }
    return (L, y) => (i(), d("form", {
      class: "mm-form",
      onSubmit: ke(N, ["prevent"])
    }, [
      a("div", Ht, [
        y[3] || (y[3] = a("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        h(s(be), {
          modelValue: o.value,
          "onUpdate:modelValue": y[0] || (y[0] = (_) => o.value = _),
          options: l,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        a("span", Wt, [
          h(s(x), {
            icon: s(J)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          B(p(S.value), 1)
        ])
      ]),
      a("div", Jt, [
        y[4] || (y[4] = a("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        s(g).ready.value ? (i(), d("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: u.value ? JSON.stringify([u.value]) : "[]",
          onChange: E
        }, null, 40, Yt)) : s(g).failed.value ? (i(), d("div", Gt, "The agent picker could not load: " + p(s(g).failed.value), 1)) : (i(), d("div", Zt))
      ]),
      a("div", Qt, [
        y[5] || (y[5] = a("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        h(s(He), {
          id: "add_topic",
          modelValue: r.value,
          "onUpdate:modelValue": y[1] || (y[1] = (_) => r.value = _),
          placeholder: "e.g. response style",
          invalid: !!I.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        I.value ? (i(), d("span", Xt, p(I.value), 1)) : (i(), d("span", en, "What this is about, not what it says. A topic that already exists gets a new version.")),
        s(f).error.value ? (i(), d("div", tn, p(s(f).error.value), 1)) : w("", !0),
        $.value.length ? (i(), d("div", nn, [
          (i(!0), d(V, null, M($.value, (_) => (i(), d("button", {
            key: _,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (K) => r.value = s(q)(_)
          }, p(s(q)(_)), 9, on))), 128))
        ])) : w("", !0)
      ]),
      a("div", ln, [
        y[6] || (y[6] = a("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        h(s(se), {
          id: "add_text",
          modelValue: v.value,
          "onUpdate:modelValue": y[2] || (y[2] = (_) => v.value = _),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      a("div", an, [
        a("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !k.value
        }, [
          h(s(x), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: R({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          y[7] || (y[7] = B("Add to memory ", -1))
        ], 8, sn)
      ])
    ], 32));
  }
}), un = { class: "mm-view-head" }, dn = { class: "mm-view-title" }, cn = {
  key: 0,
  class: "kx-notice error"
}, mn = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, bn = { class: "kx-empty-ico" }, vn = ["aria-label"], pn = { class: "mm-card-h" }, fn = { class: "kx-chip" }, gn = { class: "mm-option-main" }, yn = { class: "mm-option-t" }, hn = { class: "mm-muted" }, kn = ["disabled", "onClick"], _n = ["disabled"], wn = /* @__PURE__ */ H({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const n = e, t = ce(() => n.memory.memoryId.value || null, (l) => F(n.memory.memoryId.value).conflicts(l), n.memory.revision);
    function c(l, o) {
      n.memory.act(() => F(n.memory.memoryId.value).resolve(l.group_id, o.id));
    }
    return (l, o) => (i(), d(V, null, [
      a("header", un, [
        a("h2", dn, [
          h(s(x), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = B("Conflicts", -1))
        ]),
        o[2] || (o[2] = a("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      s(t).error.value ? (i(), d("div", cn, [
        h(s(x), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, p(s(t).error.value), 1)
      ])) : !s(t).loading.value && !s(t).rows.value.length ? (i(), d("div", mn, [
        a("span", bn, [
          h(s(x), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = a("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = a("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : w("", !0),
      (i(!0), d(V, null, M(s(t).rows.value, (u) => (i(), d("section", {
        key: u.group_id,
        class: "mm-card",
        "aria-label": "Conflict about ".concat(s(q)(u.items[0].key))
      }, [
        a("div", pn, [
          a("span", fn, p(s(J)[u.items[0].kind].label), 1),
          B(p(s(q)(u.items[0].key)), 1)
        ]),
        (i(!0), d(V, null, M(u.items, (r) => (i(), d("div", {
          key: r.id,
          class: "mm-option"
        }, [
          a("div", gn, [
            a("span", yn, p(r.content), 1),
            a("span", hn, p(s(W)(r.valid_at)) + " · " + p(s(dt)(r.source)), 1)
          ]),
          a("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (v) => c(u, r)
          }, [
            h(s(x), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = B("Keep this ", -1))
          ], 8, kn)
        ]))), 128))
      ], 8, vn))), 128)),
      s(t).next.value !== null ? (i(), d("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: s(t).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...u) => s(t).more && s(t).more(...u))
      }, "Show more conflicts", 8, _n)) : w("", !0)
    ], 64));
  }
}), $n = ["aria-label", "title", "aria-pressed", "disabled"], le = /* @__PURE__ */ H({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: n }) {
    const t = n;
    return (c, l) => (i(), d("button", {
      type: "button",
      class: R(["kx-iconbtn", { on: e.active }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: l[0] || (l[0] = (o) => t("click"))
    }, [
      h(s(x), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, $n));
  }
}), Ce = /* @__PURE__ */ H({
  __name: "AccessibleOverlay",
  props: {
    open: { type: Boolean },
    kind: {},
    dismissible: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(e, { emit: n }) {
    const t = e, c = n, l = T(null);
    let o = null;
    const u = /* @__PURE__ */ new Map();
    function r(k) {
      const f = k.getRootNode(), $ = f instanceof ShadowRoot ? f.activeElement : document.activeElement;
      return $ instanceof HTMLElement ? $ : null;
    }
    function v(k) {
      let f = k;
      for (; f; ) {
        const $ = f.parentNode;
        if (!($ instanceof HTMLElement || $ instanceof ShadowRoot)) break;
        for (const E of Array.from($.children))
          E instanceof HTMLElement && E !== f && !u.has(E) && (u.set(E, E.inert), E.inert = !0);
        f = $ instanceof ShadowRoot ? $.host : $;
      }
    }
    function g() {
      for (const [k, f] of u) k.inert = f;
      u.clear();
    }
    function S() {
      return l.value ? Array.from(l.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((k) => !k.hasAttribute("disabled")) : [];
    }
    function C(k) {
      if (k.key === "Escape" && t.dismissible) {
        k.preventDefault(), c("close");
        return;
      }
      if (k.key !== "Tab") return;
      const f = S();
      if (!f.length) {
        k.preventDefault();
        return;
      }
      const $ = f[0], E = l.value ? r(l.value) : null, N = f.indexOf(E || $), L = f[(N + (k.shiftKey ? -1 : 1) + f.length) % f.length];
      k.preventDefault(), L.focus();
    }
    async function I(k) {
      if (k) {
        if (await pe(), !l.value) return;
        o = r(l.value), v(l.value), (l.value.querySelector("[data-overlay-initial]") || S()[0])?.focus();
        return;
      }
      g();
      const f = o;
      o = null, await pe(), f?.focus();
    }
    return U(() => t.open, (k) => {
      I(k);
    }, { immediate: !0 }), je(() => {
      g(), o?.focus(), o = null;
    }), (k, f) => (i(), z(Ue, {
      name: e.kind === "drawer" ? "kx-drawer" : "kx-modal"
    }, {
      default: G(() => [
        e.open ? (i(), d("div", {
          key: 0,
          ref_key: "overlay",
          ref: l,
          class: R(e.kind === "drawer" ? "kx-drawer-mask" : "kx-modal-mask"),
          onKeydown: C,
          onClick: f[0] || (f[0] = ke(($) => e.dismissible && c("close"), ["self"]))
        }, [
          Y(k.$slots, "default")
        ], 34)) : w("", !0)
      ]),
      _: 3
    }, 8, ["name"]));
  }
}), xn = ["aria-label"], Sn = { class: "kx-drawer-h" }, Cn = { class: "kx-drawer-title" }, Tn = { class: "kx-drawer-b" }, An = /* @__PURE__ */ H({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: n }) {
    const t = n;
    return (c, l) => (i(), z(Ce, {
      open: e.open,
      kind: "drawer",
      onClose: l[1] || (l[1] = (o) => t("close"))
    }, {
      default: G(() => [
        a("aside", {
          class: "kx-drawer",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": e.title
        }, [
          a("div", Sn, [
            a("span", Cn, [
              h(s(x), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              B(p(e.title), 1)
            ]),
            h(le, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              onClick: l[0] || (l[0] = (o) => t("close"))
            })
          ]),
          a("div", Tn, [
            Y(c.$slots, "default")
          ])
        ], 8, xn)
      ]),
      _: 3
    }, 8, ["open"]));
  }
}), In = ["aria-label"], Bn = { class: "kx-modal-h" }, Ln = { class: "kx-modal-h-ico" }, Vn = { class: "kx-modal-h-text" }, On = { class: "kx-modal-h-title" }, Pn = {
  key: 0,
  class: "kx-modal-h-sub"
}, En = { class: "kx-modal-body" }, Nn = { class: "kx-modal-foot" }, zn = ["disabled"], Rn = ["disabled"], Dn = /* @__PURE__ */ H({
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
  setup(e, { emit: n }) {
    const t = n;
    return (c, l) => (i(), z(Ce, {
      open: e.open,
      kind: "dialog",
      dismissible: !e.busy,
      onClose: l[3] || (l[3] = (o) => t("cancel"))
    }, {
      default: G(() => [
        a("div", {
          class: R(["kx-modal", { danger: e.danger }]),
          role: "alertdialog",
          "aria-modal": "true",
          "aria-label": e.title
        }, [
          a("div", Bn, [
            a("span", Ln, [
              h(s(x), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            a("span", Vn, [
              a("span", On, p(e.title), 1),
              e.subtitle ? (i(), d("span", Pn, p(e.subtitle), 1)) : w("", !0)
            ]),
            h(le, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              disabled: e.busy,
              onClick: l[0] || (l[0] = (o) => t("cancel"))
            }, null, 8, ["disabled"])
          ]),
          a("div", En, [
            Y(c.$slots, "default")
          ]),
          a("div", Nn, [
            a("button", {
              type: "button",
              class: "kx-btn kx-btn-ghost",
              disabled: e.busy,
              onClick: l[1] || (l[1] = (o) => t("cancel"))
            }, "Cancel", 8, zn),
            a("button", {
              type: "button",
              class: R(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
              disabled: e.busy,
              onClick: l[2] || (l[2] = (o) => t("confirm"))
            }, [
              e.busy ? (i(), z(s(x), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : w("", !0),
              B(p(e.confirmLabel), 1)
            ], 10, Rn)
          ])
        ], 10, In)
      ]),
      _: 3
    }, 8, ["open", "dismissible"]));
  }
}), Mn = {
  key: 0,
  class: "kx-notice error"
}, Kn = {
  key: 1,
  class: "mm-skel-reader"
}, jn = {
  key: 2,
  class: "mm-reader"
}, Un = { class: "mm-head" }, Fn = { class: "mm-head-body" }, qn = { class: "mm-head-top" }, Hn = { class: "kx-chip" }, Wn = { class: "mm-topic" }, Jn = { class: "mm-head-acts" }, Yn = ["disabled"], Gn = ["disabled"], Zn = ["disabled"], Qn = {
  key: 0,
  class: "mm-edit"
}, Xn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, eo = { class: "mm-edit-acts" }, to = ["disabled"], no = {
  key: 1,
  class: "mm-title"
}, oo = { class: "mm-facts" }, lo = {
  key: 0,
  class: "mm-fact"
}, ao = ["title"], so = ["title"], io = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-details"
}, ro = { class: "mm-value-fields" }, uo = {
  key: 1,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, co = { class: "mm-timeline" }, mo = { class: "mm-tl-body" }, bo = { class: "mm-tl-t" }, vo = { class: "mm-tl-s" }, po = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, fo = {
  key: 0,
  class: "mm-muted"
}, go = {
  key: 1,
  class: "mm-sources"
}, yo = { class: "mm-source-body" }, ho = { class: "mm-source-head" }, ko = ["title"], _o = {
  key: 0,
  class: "mm-quote"
}, wo = ["onClick"], $o = { class: "mm-source-topic" }, xo = ["onClick"], So = /* @__PURE__ */ H({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(e, { emit: n }) {
    const t = e, c = n, l = T(null), o = T([]), u = T(null), r = T([]), v = T(""), g = T(null), S = T(null), C = T(""), I = T(!1), k = P(() => l.value ? J[l.value.kind] : null), f = P(() => l.value ? J[l.value.kind].icon : "tabler:brain"), $ = P(() => l.value?.status === "current" || l.value?.status === "conflict"), E = P(() => l.value ? rt(l.value.value, l.value.key) : []);
    let N = 0;
    async function L(A = 0, m) {
      const b = ++N;
      try {
        const O = await F(t.memory.memoryId.value).item(t.itemId, A, m);
        if (b !== N) return;
        if (!A) {
          const Z = O.item;
          if (Z.status === "forgotten") {
            c("gone");
            return;
          }
          l.value = Z, r.value = O.provenance;
        }
        const D = O.versions;
        o.value = A ? [...o.value, ...D.rows] : D.rows, u.value = D.next, v.value = "";
      } catch (O) {
        if (b !== N) return;
        fe(O) === 404 ? c("gone") : v.value = X(O);
      }
    }
    U(() => t.itemId, () => {
      l.value = null, o.value = [], g.value = null, S.value = null, C.value = "", I.value = !1, L();
    }, { immediate: !0 });
    async function y() {
      const A = ++N, m = o.value.length;
      try {
        let b = 0, O = null;
        const D = [];
        let Z = !0;
        do {
          const Le = Math.min(100, Math.max(1, m - D.length)), Q = await F(t.memory.memoryId.value).item(t.itemId, b, Le);
          if (A !== N) return;
          if (Z) {
            if (Q.item.status === "forgotten") {
              c("gone");
              return;
            }
            l.value = Q.item, r.value = Q.provenance, Z = !1;
          }
          D.push(...Q.versions.rows), O = Q.versions.next, b = O ?? 0;
        } while (D.length < m && O !== null);
        o.value = D, u.value = O, v.value = "";
      } catch (b) {
        A === N && (fe(b) === 404 ? c("gone") : v.value = X(b));
      }
    }
    U(t.memory.revision, () => {
      y();
    });
    function _(A) {
      return t.memory.act(() => F(t.memory.memoryId.value).act(t.itemId, A));
    }
    async function K() {
      const A = (g.value || "").trim();
      if (!A || !l.value) return;
      let m;
      if (S.value !== null)
        try {
          m = JSON.parse(S.value);
        } catch {
          C.value = "Details must be valid JSON.";
          return;
        }
      await t.memory.act(async () => {
        const O = S.value === null ? { content: A } : { content: A, value: m }, D = await F(t.memory.memoryId.value).edit(t.itemId, O);
        D && D !== t.itemId && c("replaced", D);
      }) && (g.value = null, S.value = null, C.value = "");
    }
    function Te() {
      l.value && (g.value = l.value.content, S.value = l.value.value === void 0 ? null : JSON.stringify(l.value.value, null, 2), C.value = "");
    }
    async function Ae() {
      await _("forget") && (I.value = !1, c("gone"));
    }
    function Ie(A) {
      return A.host_kind === "item" ? "tabler:brain" : A.host_kind === "content" ? "tabler:file-text" : A.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function Be(A) {
      if (A.line) {
        if (A.line.role === "tool") return "Tool result";
        if (A.line.role === "document") return "Document";
        const m = A.line.author;
        return m?.kind === "user" ? "They said" : m?.kind === "system" ? "Workflow input" : m?.kind === "agent" ? l.value?.scope_family === "agent" && l.value.scope_id === m.id ? "The agent said" : "Task from ".concat(m.id || "an agent") : "Message";
      }
      return A.host_kind === "item" ? A.memory ? "From the memory" : "From a memory that is no longer kept" : A.host_kind === "content" ? "A document" : A.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (A, m) => (i(), d(V, null, [
      v.value ? (i(), d("div", Mn, [
        h(s(x), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, p(v.value), 1)
      ])) : l.value ? (i(), d("article", jn, [
        a("header", Un, [
          a("span", {
            class: R(["mm-head-ic", k.value?.tone])
          }, [
            h(s(x), {
              icon: f.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          a("div", Fn, [
            a("div", qn, [
              a("span", Hn, p(k.value?.label), 1),
              a("span", Wn, p(s(q)(l.value.key)), 1),
              l.value.status !== "current" ? (i(), z(s(me), {
                key: 0,
                class: "kx-tag-sm",
                severity: s(we)(l.value.status),
                value: s(ie)[l.value.status]
              }, null, 8, ["severity", "value"])) : w("", !0),
              a("span", Jn, [
                $.value && g.value === null ? (i(), d("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: Te
                }, [
                  h(s(x), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  m[8] || (m[8] = B("Edit ", -1))
                ])) : w("", !0),
                $.value ? (i(), d("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: m[0] || (m[0] = (b) => _("archive"))
                }, [
                  h(s(x), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  m[9] || (m[9] = B("Archive ", -1))
                ], 8, Yn)) : w("", !0),
                l.value.status === "archived" ? (i(), d("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: m[1] || (m[1] = (b) => _("restore"))
                }, [
                  h(s(x), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  m[10] || (m[10] = B("Restore ", -1))
                ], 8, Gn)) : w("", !0),
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: m[2] || (m[2] = (b) => I.value = !0)
                }, [
                  h(s(x), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  m[11] || (m[11] = B("Forget ", -1))
                ], 8, Zn)
              ])
            ]),
            g.value !== null ? (i(), d("div", Qn, [
              m[14] || (m[14] = a("label", {
                class: "mm-label",
                for: "memory_content"
              }, "Memory text", -1)),
              h(s(se), {
                id: "memory_content",
                modelValue: g.value,
                "onUpdate:modelValue": m[3] || (m[3] = (b) => g.value = b),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              S.value !== null ? (i(), d(V, { key: 0 }, [
                m[12] || (m[12] = a("label", {
                  class: "mm-label",
                  for: "memory_value"
                }, "Details", -1)),
                h(s(se), {
                  id: "memory_value",
                  modelValue: S.value,
                  "onUpdate:modelValue": m[4] || (m[4] = (b) => S.value = b),
                  "auto-resize": "",
                  rows: "5",
                  "aria-label": "Details"
                }, null, 8, ["modelValue"]),
                C.value ? (i(), d("span", Xn, p(C.value), 1)) : w("", !0)
              ], 64)) : w("", !0),
              a("div", eo, [
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !g.value.trim(),
                  onClick: K
                }, [
                  h(s(x), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  m[13] || (m[13] = B("Save ", -1))
                ], 8, to),
                a("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: m[5] || (m[5] = (b) => {
                    g.value = null, S.value = null, C.value = "";
                  })
                }, "Cancel")
              ])
            ])) : (i(), d("h2", no, p(l.value.content), 1)),
            a("div", oo, [
              l.value.scope_family === "agent" ? (i(), d("span", lo, [
                h(s(x), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                m[15] || (m[15] = B("About the agent itself", -1))
              ])) : w("", !0),
              a("span", {
                class: "mm-fact",
                title: s(oe)(l.value.valid_at)
              }, [
                h(s(x), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                B("True since " + p(s(W)(l.value.valid_at)), 1)
              ], 8, ao),
              l.value.invalid_at ? (i(), d("span", {
                key: 1,
                class: "mm-fact",
                title: s(oe)(l.value.invalid_at)
              }, [
                h(s(x), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                B("Until " + p(s(W)(l.value.invalid_at)), 1)
              ], 8, so)) : w("", !0)
            ])
          ])
        ]),
        g.value === null && E.value.length ? (i(), d("section", io, [
          m[16] || (m[16] = a("h3", {
            id: "mm-details",
            class: "mm-sec-h"
          }, "Details", -1)),
          a("dl", ro, [
            (i(!0), d(V, null, M(E.value, (b, O) => (i(), d("div", { key: O }, [
              a("dt", null, p(b.label), 1),
              a("dd", null, p(b.text), 1)
            ]))), 128))
          ])
        ])) : w("", !0),
        o.value.length > 1 || u.value !== null ? (i(), d("section", uo, [
          m[18] || (m[18] = a("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          a("ol", co, [
            (i(!0), d(V, null, M(o.value, (b) => (i(), d("li", {
              key: b.id,
              class: R({ now: b.id === l.value.id, past: b.status !== "current" })
            }, [
              m[17] || (m[17] = a("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              a("span", mo, [
                a("span", bo, p(b.content), 1),
                a("span", vo, [
                  B("v" + p(b.version) + " · " + p(s(W)(b.valid_at)), 1),
                  b.status !== "current" ? (i(), d(V, { key: 0 }, [
                    B(" · " + p(s(ie)[b.status]), 1)
                  ], 64)) : w("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          u.value !== null ? (i(), d("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: m[6] || (m[6] = (b) => L(u.value))
          }, "Show older versions")) : w("", !0)
        ])) : w("", !0),
        a("section", po, [
          m[20] || (m[20] = a("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          r.value.length ? (i(), d("ul", go, [
            (i(!0), d(V, null, M(r.value, (b) => (i(), d("li", {
              key: b.host_kind + b.host_id + b.event_id,
              class: "mm-source"
            }, [
              h(s(x), {
                class: "mm-source-ic",
                icon: Ie(b),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              a("div", yo, [
                a("div", ho, [
                  a("span", null, p(Be(b)), 1),
                  b.line?.created_at || b.recorded_at ? (i(), d("span", {
                    key: 0,
                    class: "mm-muted",
                    title: s(oe)(b.line?.created_at || b.recorded_at || "")
                  }, p(s(W)(b.line?.created_at || b.recorded_at || "")), 9, ko)) : w("", !0)
                ]),
                b.line ? (i(), d("blockquote", _o, p(b.line.text), 1)) : w("", !0),
                b.memory ? (i(), d("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (O) => c("open", b.memory.id)
                }, [
                  a("span", $o, p(s(q)(b.memory.key)), 1),
                  a("span", null, p(b.memory.content), 1)
                ], 8, wo)) : w("", !0),
                b.host_kind === "session" ? (i(), d("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (O) => c("conversation", b.host_id)
                }, [
                  h(s(x), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  m[19] || (m[19] = B("Open conversation ", -1))
                ], 8, xo)) : w("", !0)
              ])
            ]))), 128))
          ])) : (i(), d("p", fo, p(l.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (i(), d("div", Kn, [
        (i(), d(V, null, M(4, (b) => a("div", {
          key: b,
          class: "mm-skel-line"
        })), 64))
      ])),
      h(Dn, {
        open: I.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: l.value ? s(q)(l.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: m[7] || (m[7] = (b) => I.value = !1),
        onConfirm: Ae
      }, {
        default: G(() => [...m[21] || (m[21] = [
          B(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), Co = { class: "mm-rail-tools" }, To = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, Ao = {
  key: 0,
  class: "mm-skel"
}, Io = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Bo = {
  key: 2,
  class: "mm-rail-empty"
}, Lo = ["aria-expanded", "onClick"], Vo = { class: "kx-railsec-t" }, Oo = { class: "kx-railsec-b" }, Po = ["aria-current", "onClick"], Eo = { class: "mm-row-main" }, No = { class: "mm-row-t" }, zo = { class: "mm-row-s" }, Ro = ["disabled"], Do = /* @__PURE__ */ H({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(e, { emit: n }) {
    const t = e, c = n, l = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = T("current"), u = T(""), r = Ge(u, 250, (I) => I.trim()), v = ce(() => t.memory.memoryId.value ? [t.memory.memoryId.value, o.value, r.value] : null, (I) => F(t.memory.memoryId.value).items({ status: o.value, query: r.value, offset: I }), t.memory.revision);
    U([o, r], () => {
      c("filtered"), c("status-change", o.value);
    });
    const g = T({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), S = P(() => it.map((I) => ({ ...I, items: v.rows.value.filter((k) => J[k.kind].group === I.id) })).filter((I) => I.items.length)), C = P(() => r.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (I, k) => (i(), d(V, null, [
      a("div", Co, [
        h(Ze, {
          modelValue: u.value,
          "onUpdate:modelValue": k[0] || (k[0] = (f) => u.value = f),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        h(s(be), {
          modelValue: o.value,
          "onUpdate:modelValue": k[1] || (k[1] = (f) => o.value = f),
          class: "mm-views",
          options: l,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      a("nav", To, [
        s(v).loading.value && !s(v).rows.value.length ? (i(), d("div", Ao, [
          (i(), d(V, null, M(6, (f) => a("div", {
            key: f,
            class: "mm-skel-row"
          })), 64))
        ])) : s(v).error.value ? (i(), d("div", Io, [
          h(s(x), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          a("span", null, p(s(v).error.value), 1)
        ])) : s(v).rows.value.length ? w("", !0) : (i(), d("div", Bo, p(C.value), 1)),
        (i(!0), d(V, null, M(S.value, (f) => (i(), d("div", {
          key: f.id,
          class: R(["kx-railsec", { closed: g.value[f.id] }])
        }, [
          a("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !g.value[f.id],
            onClick: ($) => g.value[f.id] = !g.value[f.id]
          }, [
            h(s(x), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            h(s(x), {
              class: "kx-railsec-ic",
              icon: f.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            a("span", Vo, p(f.title), 1)
          ], 8, Lo),
          he(a("div", Oo, [
            (i(!0), d(V, null, M(f.items, ($) => (i(), d("button", {
              key: $.id,
              type: "button",
              class: R(["mm-row", { on: e.selectedId === $.id }]),
              "aria-current": e.selectedId === $.id ? "true" : void 0,
              onClick: (E) => c("select", $)
            }, [
              a("span", {
                class: R(["mm-row-ic", s(J)[$.kind].tone])
              }, [
                h(s(x), {
                  icon: s(J)[$.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              a("span", Eo, [
                a("span", No, p($.content), 1),
                a("span", zo, p(s(q)($.key)) + " · " + p(s(W)($.valid_at)), 1)
              ])
            ], 10, Po))), 128))
          ], 512), [
            [Fe, !g.value[f.id]]
          ])
        ], 2))), 128)),
        s(v).next.value !== null ? (i(), d("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: s(v).loading.value,
          onClick: k[2] || (k[2] = //@ts-ignore
          (...f) => s(v).more && s(v).more(...f))
        }, [
          s(v).loading.value ? (i(), z(s(x), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : w("", !0),
          k[3] || (k[3] = B("Show more ", -1))
        ], 8, Ro)) : w("", !0)
      ])
    ], 64));
  }
}), Mo = {
  key: 0,
  class: "kx-notice error"
}, Ko = {
  key: 1,
  class: "mm-page"
}, jo = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Uo = { class: "kx-shell" }, Fo = { class: "kx-rail" }, qo = { class: "kx-railhead" }, Ho = { class: "kx-railhead-title" }, Wo = { key: 0 }, Jo = { class: "kx-railhead-acts" }, Yo = { class: "kx-main" }, Go = { class: "kx-main-scroll mm-main" }, Zo = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, Qo = { class: "kx-empty-ico" }, Xo = /* @__PURE__ */ H({
  __name: "MemoryManage",
  setup(e) {
    const n = Pe(), t = Ee(), c = T(""), l = T({});
    U(() => n.value.config, (y) => {
      try {
        l.value = Je(y), c.value = "";
      } catch (_) {
        c.value = X(_);
      }
    }, { immediate: !0 });
    const o = qt(P(() => String(l.value.kb_id || ""))), u = T("item"), r = T(String(l.value.route || "")), v = T(!1), g = T("current"), S = P(() => o.status.value?.counts[g.value]), C = P(() => o.status.value?.counts.conflict_groups || 0), I = P(() => (o.status.value?.runs || []).filter((y) => y.status === "failed").length);
    U(() => l.value.route, (y) => {
      const _ = typeof y == "string" ? y : "";
      _ !== r.value && (k = !0, r.value = _, _ && (u.value = "item"));
    }), U(o.memoryId, () => {
      r.value = "", u.value = "item";
    });
    let k = !1;
    U(r, (y) => {
      if (k) {
        k = !1;
        return;
      }
      t("navigate", y || "");
    });
    function f(y) {
      t("kickside-chat-open", { kind: "session", sessionId: y });
    }
    function $(y) {
      u.value = "item", y !== r.value && (r.value = y);
    }
    function E(y) {
      $(y.id);
    }
    function N(y) {
      u.value = u.value === y ? "item" : y;
    }
    function L(y) {
      v.value = !1, y && $(y);
    }
    return (y, _) => c.value ? (i(), d("div", Mo, p(c.value), 1)) : (i(), d("div", Ko, [
      s(o).error.value ? (i(), d("div", jo, [
        h(s(x), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, p(s(o).error.value), 1)
      ])) : w("", !0),
      a("div", Uo, [
        a("aside", Fo, [
          a("div", qo, [
            a("span", Ho, [
              _[7] || (_[7] = B("Memories", -1)),
              S.value !== void 0 ? (i(), d("b", Wo, p(S.value), 1)) : w("", !0)
            ]),
            a("div", Jo, [
              h(le, {
                icon: "tabler:activity",
                label: I.value ? "Activity, ".concat(I.value, " failed") : "Activity",
                active: u.value === "activity",
                onClick: _[0] || (_[0] = (K) => N("activity"))
              }, null, 8, ["label", "active"]),
              h(le, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: _[1] || (_[1] = (K) => v.value = !0)
              })
            ])
          ]),
          C.value ? (i(), d("button", {
            key: 0,
            type: "button",
            class: R(["mm-conflict-bar", { on: u.value === "conflicts" }]),
            onClick: _[2] || (_[2] = (K) => N("conflicts"))
          }, [
            h(s(x), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            a("span", null, p(C.value === 1 ? "1 conflict to resolve" : "".concat(C.value, " conflicts to resolve")), 1),
            h(s(x), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : w("", !0),
          h(Do, {
            memory: s(o),
            "selected-id": u.value === "item" ? r.value : "",
            onSelect: E,
            onFiltered: _[3] || (_[3] = (K) => r.value = ""),
            onStatusChange: _[4] || (_[4] = (K) => g.value = K)
          }, null, 8, ["memory", "selected-id"])
        ]),
        a("main", Yo, [
          a("div", Go, [
            u.value === "conflicts" ? (i(), z(wn, {
              key: 0,
              memory: s(o)
            }, null, 8, ["memory"])) : u.value === "activity" ? (i(), z(wt, {
              key: 1,
              memory: s(o)
            }, null, 8, ["memory"])) : r.value ? (i(), z(So, {
              key: r.value,
              memory: s(o),
              "item-id": r.value,
              onReplaced: $,
              onOpen: $,
              onConversation: f,
              onGone: _[5] || (_[5] = (K) => r.value = "")
            }, null, 8, ["memory", "item-id"])) : (i(), d("div", Zo, [
              a("span", Qo, [
                h(s(x), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              _[8] || (_[8] = a("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              _[9] || (_[9] = a("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      h(An, {
        open: v.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: _[6] || (_[6] = (K) => v.value = !1)
      }, {
        default: G(() => [
          v.value ? (i(), z(rn, {
            key: 0,
            memory: s(o),
            onAdded: L
          }, null, 8, ["memory"])) : w("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), il = {
  rootComponent: Xo,
  plugins: [Ne]
};
export {
  il as mountConfig
};
//# sourceMappingURL=lazy-mount-B-xTrirj.js.map
