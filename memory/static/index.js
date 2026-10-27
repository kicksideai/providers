import { mergeProps as v, resolveDirective as Ve, withDirectives as pe, openBlock as l, createBlock as z, resolveDynamicComponent as se, withCtx as L, renderSlot as T, normalizeClass as J, createElementBlock as h, createElementVNode as f, createCommentVNode as k, Fragment as V, vShow as Tt, toDisplayString as S, computed as U, ref as B, watch as Ce, onUnmounted as nt, defineComponent as ae, createVNode as y, unref as c, renderList as W, resolveComponent as j, createTextVNode as R, Transition as zt, normalizeProps as At, createSlots as it, withModifiers as xt } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as Bt, api as N, define as Pt } from "@wippy-fe/proxy";
import { A as Vt, s as Ft, B as _, k as de, b as Z, Q as ze, z as fe, R as ie, T as le, C as Mt, K as Ae, v as ot, V as Ye, c as Kt, e as xe, d as Et, f as ue, F as Dt, M as Je, g as Rt, Y as _t, I as Ht, D as jt, S as Nt, L as Ut, h as Wt, $ as Gt, J as qt, p as Y, u as Zt, m as Yt } from "./element-Cn2qOarc.js";
import { R as $e, s as te, f as X, b as he, i as ce, e as Be, K as Ge, c as K, d as rt, g as Jt, h as st, j as Qt, k as at, l as lt, u as Xt, m as Pe, n as ut, o as en, a as tn, p as nn } from "./ConfigFields.vue_vue_type_script_setup_true_lang-WV4tp5wf.js";
function on() {
  let e = [], t = (s, a, u = 999) => {
    let p = r(s, a, u), b = p.value + (p.key === s ? 0 : u) + 1;
    return e.push({ key: s, value: b }), b;
  }, n = (s) => {
    e = e.filter((a) => a.value !== s);
  }, o = (s, a) => r(s).value, r = (s, a, u = 0) => [...e].reverse().find((p) => !0) || { key: s, value: u }, i = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: i, set: (s, a, u) => {
    a && (a.style.zIndex = String(t(s, !0, u)));
  }, clear: (s) => {
    s && (n(i(s)), s.style.zIndex = "");
  }, getCurrent: (s) => o(s) };
}
var Me = on();
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function rn(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function sn(e, t) {
  for (var n = 0; n < t.length; n++) {
    var o = t[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, ln(o.key), o);
  }
}
function an(e, t, n) {
  return t && sn(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function ln(e) {
  var t = un(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function un(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (we(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var dn = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    rn(this, e), this.element = t, this.listener = n;
  }
  return an(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Vt(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), cn = Ft(), pn = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": o.disabled
    }];
  }
}, fn = _.extend({
  name: "tab",
  classes: pn
}), hn = {
  name: "BaseTab",
  extends: te,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    }
  },
  style: fn,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, me = {
  name: "Tab",
  extends: hn,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(t) {
      switch (t.code) {
        case "ArrowRight":
          this.onArrowRightKey(t);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(t);
          break;
        case "Home":
          this.onHomeKey(t);
          break;
        case "End":
          this.onEndKey(t);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(t);
          break;
      }
    },
    onArrowRightKey: function(t) {
      var n = this.findNextTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onHomeKey(t), t.preventDefault();
    },
    onArrowLeftKey: function(t) {
      var n = this.findPrevTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onEndKey(t), t.preventDefault();
    },
    onHomeKey: function(t) {
      var n = this.findFirstTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onEndKey: function(t) {
      var n = this.findLastTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.findLastTab()), t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(this.findFirstTab()), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.changeActiveValue();
    },
    findNextTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = n ? t : t.nextElementSibling;
      return o ? ze(o, "data-p-disabled") || ze(o, "data-pc-section") === "activebar" ? this.findNextTab(o) : fe(o, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = n ? t : t.previousElementSibling;
      return o ? ze(o, "data-p-disabled") || ze(o, "data-pc-section") === "activebar" ? this.findPrevTab(o) : fe(o, '[data-pc-name="tab"]') : null;
    },
    findFirstTab: function() {
      return this.findNextTab(this.$pcTabList.$refs.tabs.firstElementChild, !0);
    },
    findLastTab: function() {
      return this.findPrevTab(this.$pcTabList.$refs.tabs.lastElementChild, !0);
    },
    changeActiveValue: function() {
      this.$pcTabs.updateValue(this.value);
    },
    changeFocusedTab: function(t, n) {
      Z(n), this.scrollInView(n);
    },
    scrollInView: function(t) {
      var n;
      t == null || (n = t.scrollIntoView) === null || n === void 0 || n.call(t, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var t;
      return de((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
    },
    id: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return v(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        id: this.id,
        tabindex: this.active ? this.$pcTabs.tabindex : -1,
        role: "tab",
        "aria-selected": this.active,
        "aria-controls": this.ariaControls,
        "data-pc-name": "tab",
        "data-p-disabled": this.disabled,
        "data-p-active": this.active,
        onFocus: this.onFocus,
        onKeydown: this.onKeydown
      };
    },
    ptParams: function() {
      return {
        context: {
          active: this.active
        }
      };
    },
    dataP: function() {
      return X({
        active: this.active
      });
    }
  },
  directives: {
    ripple: $e
  }
};
function bn(e, t, n, o, r, i) {
  var s = Ve("ripple");
  return e.asChild ? T(e.$slots, "default", {
    key: 1,
    dataP: i.dataP,
    class: J(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs,
    onClick: i.onClick
  }) : pe((l(), z(se(e.as), v({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP,
    onClick: i.onClick
  }, i.attrs), {
    default: L(function() {
      return [T(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
me.render = bn;
var dt = {
  name: "ChevronLeftIcon",
  extends: he
};
function vn(e) {
  return wn(e) || yn(e) || gn(e) || mn();
}
function mn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gn(e, t) {
  if (e) {
    if (typeof e == "string") return Ee(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ee(e, t) : void 0;
  }
}
function yn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function wn(e) {
  if (Array.isArray(e)) return Ee(e);
}
function Ee(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function In(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), vn(t[0] || (t[0] = [f("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
dt.render = In;
var ct = {
  name: "ChevronRightIcon",
  extends: he
};
function kn(e) {
  return $n(e) || Cn(e) || Sn(e) || On();
}
function On() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sn(e, t) {
  if (e) {
    if (typeof e == "string") return De(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? De(e, t) : void 0;
  }
}
function Cn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $n(e) {
  if (Array.isArray(e)) return De(e);
}
function De(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ln(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), kn(t[0] || (t[0] = [f("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ct.render = Ln;
var Tn = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, zn = _.extend({
  name: "tablist",
  classes: Tn
}), An = {
  name: "BaseTabList",
  extends: te,
  props: {},
  style: zn,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, pt = {
  name: "TabList",
  extends: An,
  inheritAttrs: !1,
  inject: ["$pcTabs"],
  data: function() {
    return {
      isPrevButtonEnabled: !1,
      isNextButtonEnabled: !0
    };
  },
  resizeObserver: void 0,
  inkBarObserver: void 0,
  watch: {
    showNavigators: function(t) {
      t ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var t = this;
    setTimeout(function() {
      t.updateInkBar(), t.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(t) {
      this.showNavigators && this.updateButtonState(), t.preventDefault();
    },
    onPrevButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), o = ie(t) - n, r = Math.abs(t.scrollLeft), i = o * 0.8, s = r - i, a = Math.max(s, 0);
      t.scrollLeft = Ye(t) ? -1 * a : a;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), o = ie(t) - n, r = Math.abs(t.scrollLeft), i = o * 0.8, s = r + i, a = t.scrollWidth - o, u = Math.min(s, a);
      t.scrollLeft = Ye(t) ? -1 * u : u;
    },
    bindResizeObserver: function() {
      var t = this;
      this.resizeObserver = new ResizeObserver(function() {
        return t.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var t;
      (t = this.resizeObserver) === null || t === void 0 || t.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var t = this;
      this.unbindInkBarObserver();
      var n = this.$refs.content, o = fe(n, '[data-pc-name="tab"][data-p-active="true"]');
      o && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(o));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, o = t.inkbar, r = t.tabs;
      if (o) {
        var i = fe(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (o.style.height = Mt(i) + "px", o.style.top = Ae(i).top - Ae(r).top + "px") : (o.style.width = ot(i) + "px", o.style.left = Ae(i).left - Ae(r).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, o = t.content, r = o.scrollTop, i = o.scrollWidth, s = o.scrollHeight, a = o.offsetWidth, u = o.offsetHeight, p = Math.abs(o.scrollLeft), b = [ie(o), le(o)], m = b[0], I = b[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = r !== 0, this.isNextButtonEnabled = n.offsetHeight >= u && parseInt(r) !== s - I) : (this.isPrevButtonEnabled = p !== 0, this.isNextButtonEnabled = n.offsetWidth >= a && parseInt(p) !== i - m);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, o = t.nextButton, r = 0;
      return this.showNavigators && (r = (n?.offsetWidth || 0) + (o?.offsetWidth || 0)), r;
    }
  },
  computed: {
    templates: function() {
      return this.$pcTabs.$slots;
    },
    activeValue: function() {
      return this.$pcTabs.d_value;
    },
    showNavigators: function() {
      return this.$pcTabs.showNavigators;
    },
    prevButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.previous : void 0;
    },
    nextButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.next : void 0;
    },
    dataP: function() {
      return X({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: dt,
    ChevronRightIcon: ct
  },
  directives: {
    ripple: $e
  }
}, xn = ["data-p"], Bn = ["aria-label", "tabindex"], Pn = ["data-p"], Vn = ["aria-orientation"], Fn = ["aria-label", "tabindex"];
function Mn(e, t, n, o, r, i) {
  var s = Ve("ripple");
  return l(), h("div", v({
    ref: "list",
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [i.showNavigators && r.isPrevButtonEnabled ? pe((l(), h("button", v({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": i.prevButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return i.onPrevButtonClick && i.onPrevButtonClick.apply(i, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(l(), z(se(i.templates.previcon || "ChevronLeftIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Bn)), [[s]]) : k("", !0), f("div", v({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    }),
    "data-p": i.dataP
  }, e.ptm("content")), [f("div", v({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": i.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [T(e.$slots, "default"), f("span", v({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Vn)], 16, Pn), i.showNavigators && r.isNextButtonEnabled ? pe((l(), h("button", v({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": i.nextButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return i.onNextButtonClick && i.onNextButtonClick.apply(i, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(l(), z(se(i.templates.nexticon || "ChevronRightIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Fn)), [[s]]) : k("", !0)], 16, xn);
}
pt.render = Mn;
var Kn = {
  root: function(t) {
    var n = t.instance;
    return ["p-tabpanel", {
      "p-tabpanel-active": n.active
    }];
  }
}, En = _.extend({
  name: "tabpanel",
  classes: Kn
}), Dn = {
  name: "BaseTabPanel",
  extends: te,
  props: {
    // in Tabs
    value: {
      type: [String, Number],
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "DIV"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    // in TabView
    header: null,
    headerStyle: null,
    headerClass: null,
    headerProps: null,
    headerActionProps: null,
    contentStyle: null,
    contentClass: null,
    contentProps: null,
    disabled: Boolean
  },
  style: En,
  provide: function() {
    return {
      $pcTabPanel: this,
      $parentInstance: this
    };
  }
}, ge = {
  name: "TabPanel",
  extends: Dn,
  inheritAttrs: !1,
  inject: ["$pcTabs"],
  computed: {
    active: function() {
      var t;
      return de((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
    },
    id: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tabpanel_").concat(this.value);
    },
    ariaLabelledby: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tab_").concat(this.value);
    },
    attrs: function() {
      return v(this.a11yAttrs, this.ptmi("root", this.ptParams));
    },
    a11yAttrs: function() {
      var t;
      return {
        id: this.id,
        tabindex: (t = this.$pcTabs) === null || t === void 0 ? void 0 : t.tabindex,
        role: "tabpanel",
        "aria-labelledby": this.ariaLabelledby,
        "data-pc-name": "tabpanel",
        "data-p-active": this.active
      };
    },
    ptParams: function() {
      return {
        context: {
          active: this.active
        }
      };
    }
  }
};
function Rn(e, t, n, o, r, i) {
  var s, a;
  return i.$pcTabs ? (l(), h(V, {
    key: 1
  }, [e.asChild ? T(e.$slots, "default", {
    key: 1,
    class: J(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs
  }) : (l(), h(V, {
    key: 0
  }, [!((s = i.$pcTabs) !== null && s !== void 0 && s.lazy) || i.active ? pe((l(), z(se(e.as), v({
    key: 0,
    class: e.cx("root")
  }, i.attrs), {
    default: L(function() {
      return [T(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class"])), [[Tt, (a = i.$pcTabs) !== null && a !== void 0 && a.lazy ? !0 : i.active]]) : k("", !0)], 64))], 64)) : T(e.$slots, "default", {
    key: 0
  });
}
ge.render = Rn;
var _n = {
  root: "p-tabpanels"
}, Hn = _.extend({
  name: "tabpanels",
  classes: _n
}), jn = {
  name: "BaseTabPanels",
  extends: te,
  props: {},
  style: Hn,
  provide: function() {
    return {
      $pcTabPanels: this,
      $parentInstance: this
    };
  }
}, ft = {
  name: "TabPanels",
  extends: jn,
  inheritAttrs: !1
};
function Nn(e, t, n, o, r, i) {
  return l(), h("div", v({
    class: e.cx("root"),
    role: "presentation"
  }, e.ptmi("root")), [T(e.$slots, "default")], 16);
}
ft.render = Nn;
var Un = `
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
        background: dt('tabs.tablist.background');
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`, Wn = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Gn = _.extend({
  name: "tabs",
  style: Un,
  classes: Wn
}), qn = {
  name: "BaseTabs",
  extends: te,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    scrollable: {
      type: Boolean,
      default: !1
    },
    showNavigators: {
      type: Boolean,
      default: !0
    },
    tabindex: {
      type: Number,
      default: 0
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    }
  },
  style: Gn,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, ht = {
  name: "Tabs",
  extends: qn,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(t) {
      this.d_value = t;
    }
  },
  methods: {
    updateValue: function(t) {
      this.d_value !== t && (this.d_value = t, this.$emit("update:value", t));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function Zn(e, t, n, o, r, i) {
  return l(), h("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [T(e.$slots, "default")], 16);
}
ht.render = Zn;
var Yn = `
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
`, Jn = {
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
}, Qn = _.extend({
  name: "tag",
  style: Yn,
  classes: Jn
}), Xn = {
  name: "BaseTag",
  extends: te,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Qn,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function Ie(e) {
  "@babel/helpers - typeof";
  return Ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ie(e);
}
function ei(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ie(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ee = {
  name: "Tag",
  extends: Xn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return X(ei({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ii = ["data-p"];
function oi(e, t, n, o, r, i) {
  return l(), h("span", v({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (l(), z(se(e.$slots.icon), v({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (l(), h("span", v({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : k("", !0), e.value != null || e.$slots.default ? T(e.$slots, "default", {
    key: 2
  }, function() {
    return [f("span", v({
      class: e.cx("label")
    }, e.ptm("label")), S(e.value), 17)];
  }) : k("", !0)], 16, ii);
}
ee.render = oi;
function ri(e) {
  const t = U(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = B(null), o = B([]), r = B(""), i = B(!1), s = B(0);
  let a = 0;
  async function u() {
    if (!e.value) return;
    const m = ++a;
    try {
      const [I, x] = await Promise.all([N.get(`${t.value}/status`), N.get(`${t.value}/conflicts`)]);
      if (m !== a) return;
      n.value = I.data;
      const C = x.data;
      o.value = ce(C) && Array.isArray(C.groups) ? C.groups : [], r.value = "", s.value++;
    } catch (I) {
      m === a && (r.value = Be(I));
    }
  }
  async function p(m) {
    i.value = !0, r.value = "";
    try {
      return await m(), await u(), !0;
    } catch (I) {
      return r.value = Be(I), !1;
    } finally {
      i.value = !1;
    }
  }
  let b = null;
  return Ce(e, (m, I) => {
    if (b && b(), b = null, !m) return;
    const x = Bt(`component.${m}`, () => {
      u();
    });
    b = typeof x == "function" ? x : null, I !== void 0 && u();
  }, { immediate: !0 }), nt(() => {
    b && b();
  }), Kt(u), { kbId: e, base: t, status: n, conflicts: o, error: r, busy: i, revision: s, act: p };
}
const si = { current: "success", conflict: "warn", failed: "danger" };
function Re(e) {
  return si[e] || "secondary";
}
function ye(e) {
  if (!e) return "";
  const t = Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z");
  return Number.isFinite(t) ? new Date(t).toLocaleString() : e;
}
const ai = { class: "mm-panel" }, li = {
  key: 0,
  class: "kx-empty"
}, ui = { class: "kx-empty-ico" }, di = { class: "mm-row-t" }, ci = { class: "mm-row-s" }, pi = /* @__PURE__ */ ae({
  __name: "ConflictList",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e;
    function n(o, r) {
      t.memory.act(() => N.post(`${t.memory.base.value}/conflicts/${encodeURIComponent(o.group_id)}/resolve`, { winner_id: r.id }));
    }
    return (o, r) => (l(), h("div", ai, [
      e.memory.conflicts.value.length ? k("", !0) : (l(), h("div", li, [
        f("span", ui, [
          y(c(E), { icon: "tabler:circle-check" })
        ]),
        r[0] || (r[0] = f("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        r[1] || (r[1] = f("p", { class: "kx-empty-sub" }, "When two memories contradict each other, they wait here for you to keep the right one.", -1))
      ])),
      (l(!0), h(V, null, W(e.memory.conflicts.value, (i) => (l(), h("div", {
        key: i.group_id,
        class: "mm-conflict"
      }, [
        r[2] || (r[2] = f("span", { class: "mm-hint" }, "These memories contradict each other. Keep the one that is right; the others become earlier versions.", -1)),
        (l(!0), h(V, null, W(i.items, (s) => (l(), h("div", {
          key: s.id,
          class: "mm-option"
        }, [
          f("div", null, [
            f("div", di, S(s.content), 1),
            f("div", ci, [
              y(c(ee), {
                class: "kx-tag-sm",
                severity: "secondary",
                value: c(Ge)[s.kind]
              }, null, 8, ["value"]),
              f("span", null, S(c(ye)(s.valid_at)), 1)
            ])
          ]),
          y(c(K), {
            label: "Keep this",
            size: "small",
            disabled: e.memory.busy.value,
            onClick: (a) => n(i, s)
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:check" })
            ]),
            _: 1
          }, 8, ["disabled", "onClick"])
        ]))), 128))
      ]))), 128))
    ]));
  }
});
var bt = {
  name: "BlankIcon",
  extends: he
};
function fi(e) {
  return mi(e) || vi(e) || bi(e) || hi();
}
function hi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bi(e, t) {
  if (e) {
    if (typeof e == "string") return _e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _e(e, t) : void 0;
  }
}
function vi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mi(e) {
  if (Array.isArray(e)) return _e(e);
}
function _e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function gi(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fi(t[0] || (t[0] = [f("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
bt.render = gi;
var vt = {
  name: "CheckIcon",
  extends: he
};
function yi(e) {
  return Oi(e) || ki(e) || Ii(e) || wi();
}
function wi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ii(e, t) {
  if (e) {
    if (typeof e == "string") return He(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? He(e, t) : void 0;
  }
}
function ki(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Oi(e) {
  if (Array.isArray(e)) return He(e);
}
function He(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Si(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), yi(t[0] || (t[0] = [f("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
vt.render = Si;
var mt = {
  name: "ChevronDownIcon",
  extends: he
};
function Ci(e) {
  return zi(e) || Ti(e) || Li(e) || $i();
}
function $i() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Li(e, t) {
  if (e) {
    if (typeof e == "string") return je(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? je(e, t) : void 0;
  }
}
function Ti(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zi(e) {
  if (Array.isArray(e)) return je(e);
}
function je(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ai(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ci(t[0] || (t[0] = [f("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
mt.render = Ai;
var gt = {
  name: "SearchIcon",
  extends: he
};
function xi(e) {
  return Fi(e) || Vi(e) || Pi(e) || Bi();
}
function Bi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pi(e, t) {
  if (e) {
    if (typeof e == "string") return Ne(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ne(e, t) : void 0;
  }
}
function Vi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Fi(e) {
  if (Array.isArray(e)) return Ne(e);
}
function Ne(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Mi(e, t, n, o, r, i) {
  return l(), h("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), xi(t[0] || (t[0] = [f("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gt.render = Mi;
var Ki = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, Ei = {
  root: "p-iconfield"
}, Di = _.extend({
  name: "iconfield",
  style: Ki,
  classes: Ei
}), Ri = {
  name: "BaseIconField",
  extends: te,
  style: Di,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, yt = {
  name: "IconField",
  extends: Ri,
  inheritAttrs: !1
};
function _i(e, t, n, o, r, i) {
  return l(), h("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [T(e.$slots, "default")], 16);
}
yt.render = _i;
var Hi = {
  root: "p-inputicon"
}, ji = _.extend({
  name: "inputicon",
  classes: Hi
}), Ni = {
  name: "BaseInputIcon",
  extends: te,
  style: ji,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, wt = {
  name: "InputIcon",
  extends: Ni,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ui(e, t, n, o, r, i) {
  return l(), h("span", v({
    class: i.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [T(e.$slots, "default")], 16);
}
wt.render = Ui;
var Wi = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Gi = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, Qe = _.extend({
  name: "virtualscroller",
  css: Gi,
  style: Wi
}), qi = {
  name: "BaseVirtualScroller",
  extends: te,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: Qe,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Qe.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function ke(e) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ke(e);
}
function Xe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Xe(Object(n), !0).forEach(function(o) {
      It(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Xe(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function It(e, t, n) {
  return (t = Zi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zi(e) {
  var t = Yi(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function Yi(e, t) {
  if (ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kt = {
  name: "VirtualScroller",
  extends: qi,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var t = this.isBoth();
    return {
      first: t ? {
        rows: 0,
        cols: 0
      } : 0,
      last: t ? {
        rows: 0,
        cols: 0
      } : 0,
      page: t ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: t ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: t ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(t) {
      this.d_numToleratedItems = t;
    },
    loading: function(t, n) {
      this.lazy && t !== n && t !== this.d_loading && (this.d_loading = t);
    },
    items: {
      handler: function(t, n) {
        (!n || n.length !== (t || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      xe(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = ie(this.element), this.defaultHeight = le(this.element), this.defaultContentWidth = ie(this.content), this.defaultContentHeight = le(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(t) {
      this.element && this.element.scrollTo(t);
    },
    scrollToIndex: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), s = r ? t.every(function(A) {
        return A > -1;
      }) : t > -1;
      if (s) {
        var a = this.first, u = this.element, p = u.scrollTop, b = p === void 0 ? 0 : p, m = u.scrollLeft, I = m === void 0 ? 0 : m, x = this.calculateNumItems(), C = x.numToleratedItems, w = this.getContentPosition(), d = this.itemSize, g = function() {
          var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Q = arguments.length > 1 ? arguments[1] : void 0;
          return P <= Q ? 0 : P;
        }, O = function(P, Q, G) {
          return P * Q + G;
        }, M = function() {
          var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: P,
            top: Q,
            behavior: o
          });
        }, $ = r ? {
          rows: 0,
          cols: 0
        } : 0, ne = !1, D = !1;
        r ? ($ = {
          rows: g(t[0], C[0]),
          cols: g(t[1], C[1])
        }, M(O($.cols, d[1], w.left), O($.rows, d[0], w.top)), D = this.lastScrollPos.top !== b || this.lastScrollPos.left !== I, ne = $.rows !== a.rows || $.cols !== a.cols) : ($ = g(t, C), i ? M(O($, d, w.left), b) : M(I, O($, d, w.top)), D = this.lastScrollPos !== (i ? I : b), ne = $ !== a), this.isRangeChanged = ne, D && (this.first = $);
      }
    },
    scrollInView: function(t, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), s = this.isHorizontal(), a = i ? t.every(function(d) {
          return d > -1;
        }) : t > -1;
        if (a) {
          var u = this.getRenderedRange(), p = u.first, b = u.viewport, m = function() {
            var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: g,
              top: O,
              behavior: r
            });
          }, I = n === "to-start", x = n === "to-end";
          if (I) {
            if (i)
              b.first.rows - p.rows > t[0] ? m(b.first.cols * this.itemSize[1], (b.first.rows - 1) * this.itemSize[0]) : b.first.cols - p.cols > t[1] && m((b.first.cols - 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.first - p > t) {
              var C = (b.first - 1) * this.itemSize;
              s ? m(C, 0) : m(0, C);
            }
          } else if (x) {
            if (i)
              b.last.rows - p.rows <= t[0] + 1 ? m(b.first.cols * this.itemSize[1], (b.first.rows + 1) * this.itemSize[0]) : b.last.cols - p.cols <= t[1] + 1 && m((b.first.cols + 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.last - p <= t + 1) {
              var w = (b.first + 1) * this.itemSize;
              s ? m(w, 0) : m(0, w);
            }
          }
        }
      } else
        this.scrollToIndex(t, r);
    },
    getRenderedRange: function() {
      var t = function(m, I) {
        return Math.floor(m / (I || m));
      }, n = this.first, o = 0;
      if (this.element) {
        var r = this.isBoth(), i = this.isHorizontal(), s = this.element, a = s.scrollTop, u = s.scrollLeft;
        if (r)
          n = {
            rows: t(a, this.itemSize[0]),
            cols: t(u, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var p = i ? u : a;
          n = t(p, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var t = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, r = this.getContentPosition(), i = this.element ? this.element.offsetWidth - r.left : 0, s = this.element ? this.element.offsetHeight - r.top : 0, a = function(I, x) {
        return Math.ceil(I / (x || I));
      }, u = function(I) {
        return Math.ceil(I / 2);
      }, p = t ? {
        rows: a(s, o[0]),
        cols: a(i, o[1])
      } : a(n ? i : s, o), b = this.d_numToleratedItems || (t ? [u(p.rows), u(p.cols)] : u(p));
      return {
        numItemsInViewport: p,
        numToleratedItems: b
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), o = this.first, r = this.calculateNumItems(), i = r.numItemsInViewport, s = r.numToleratedItems, a = function(b, m, I) {
        var x = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(b + m + (b < I ? 2 : 3) * I, x);
      }, u = n ? {
        rows: a(o.rows, i.rows, s[0]),
        cols: a(o.cols, i.cols, s[1], !0)
      } : a(o, i, s);
      this.last = u, this.numItemsInViewport = i, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var p;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(t.step ? t.step : u, ((p = t.items) === null || p === void 0 ? void 0 : p.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), o = t.isHorizontal(), r = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var i = [ie(t.element), le(t.element)], s = i[0], a = i[1];
          (n || o) && (t.element.style.width = s < t.defaultWidth ? s + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || r) && (t.element.style.height = a < t.defaultHeight ? a + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), o = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), r = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), i = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: r,
          bottom: i,
          x: n + o,
          y: r + i
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var t = this;
      if (this.element) {
        var n = this.isBoth(), o = this.isHorizontal(), r = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), a = function(p, b) {
          return t.element.style[p] = b;
        };
        n || o ? (a("height", s), a("width", i)) : a("height", s);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var o = this.isBoth(), r = this.isHorizontal(), i = this.getContentPosition(), s = function(u, p, b) {
          var m = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = ve(ve({}, t.spacerStyle), It({}, "".concat(u), (p || []).length * b + m + "px"));
        };
        o ? (s("height", n, this.itemSize[0], i.y), s("width", this.columns || n[1], this.itemSize[1], i.x)) : r ? s("width", this.columns || n, this.itemSize, i.x) : s("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), r = this.isHorizontal(), i = t ? t.first : this.first, s = function(b, m) {
          return b * m;
        }, a = function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ve(ve({}, n.contentStyle), {
            transform: "translate3d(".concat(b, "px, ").concat(m, "px, 0)")
          });
        };
        if (o)
          a(s(i.cols, this.itemSize[1]), s(i.rows, this.itemSize[0]));
        else {
          var u = s(i, this.itemSize);
          r ? a(u, 0) : a(0, u);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, o = t.target, r = this.isBoth(), i = this.isHorizontal(), s = this.getContentPosition(), a = function(F, H) {
        return F ? F > H ? F - H : F : 0;
      }, u = function(F, H) {
        return Math.floor(F / (H || F));
      }, p = function(F, H, be, Le, q, oe) {
        return F <= q ? q : oe ? be - Le - q : H + q - 1;
      }, b = function(F, H, be, Le, q, oe, Te, Lt) {
        if (F <= oe) return 0;
        var Fe = Math.max(0, Te ? F < H ? be : F - oe : F > H ? be : F - 2 * oe), Ze = n.getLast(Fe, Lt);
        return Fe > Ze ? Ze - q : Fe;
      }, m = function(F, H, be, Le, q, oe) {
        var Te = H + Le + 2 * q;
        return F >= q && (Te += q + 1), n.getLast(Te, oe);
      }, I = a(o.scrollTop, s.top), x = a(o.scrollLeft, s.left), C = r ? {
        rows: 0,
        cols: 0
      } : 0, w = this.last, d = !1, g = this.lastScrollPos;
      if (r) {
        var O = this.lastScrollPos.top <= I, M = this.lastScrollPos.left <= x;
        if (!this.appendOnly || this.appendOnly && (O || M)) {
          var $ = {
            rows: u(I, this.itemSize[0]),
            cols: u(x, this.itemSize[1])
          }, ne = {
            rows: p($.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: p($.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], M)
          };
          C = {
            rows: b($.rows, ne.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: b($.cols, ne.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], M, !0)
          }, w = {
            rows: m($.rows, C.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: m($.cols, C.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, d = C.rows !== this.first.rows || w.rows !== this.last.rows || C.cols !== this.first.cols || w.cols !== this.last.cols || this.isRangeChanged, g = {
            top: I,
            left: x
          };
        }
      } else {
        var D = i ? x : I, A = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && A) {
          var P = u(D, this.itemSize), Q = p(P, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, A);
          C = b(P, Q, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, A), w = m(P, C, this.last, this.numItemsInViewport, this.d_numToleratedItems), d = C !== this.first || w !== this.last || this.isRangeChanged, g = D;
        }
      }
      return {
        first: C,
        last: w,
        isRangeChanged: d,
        scrollPos: g
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), o = n.first, r = n.last, i = n.isRangeChanged, s = n.scrollPos;
      if (i) {
        var a = {
          first: o,
          last: r
        };
        if (this.setContentPosition(a), this.first = o, this.last = r, this.lastScrollPos = s, this.$emit("scroll-index-change", a), this.lazy && this.isPageChanged(o)) {
          var u, p, b = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : r, ((p = this.items) === null || p === void 0 ? void 0 : p.length) || 0)
          }, m = this.lazyLoadState.first !== b.first || this.lazyLoadState.last !== b.last;
          m && this.$emit("lazy-load", b), this.lazyLoadState = b;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(t), r = o.isRangeChanged, i = r || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(t), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(t);
    },
    onResize: function() {
      var t = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (xe(t.element)) {
          var n = t.isBoth(), o = t.isVertical(), r = t.isHorizontal(), i = [ie(t.element), le(t.element)], s = i[0], a = i[1], u = s !== t.defaultWidth, p = a !== t.defaultHeight, b = n ? u || p : r ? u : o ? p : !1;
          b && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = s, t.defaultHeight = a, t.defaultContentWidth = ie(t.content), t.defaultContentHeight = le(t.content), t.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        t.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(t) {
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var o = this.loaderArr.length;
      return ve({
        index: t,
        count: o,
        first: t === 0,
        last: t === o - 1,
        even: t % 2 === 0,
        odd: t % 2 !== 0
      }, n);
    },
    getPageByFirst: function(t) {
      return Math.floor(((t ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(t) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(t ?? this.first) : !0;
    },
    setContentEl: function(t) {
      this.content = t || this.content || fe(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(t) {
      this.element = t;
    },
    contentRef: function(t) {
      this.content = t;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var t = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return t.columns ? n : n.slice(t.appendOnly ? 0 : t.first.cols, t.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var t = this.isBoth(), n = this.isHorizontal();
        if (t || n)
          return this.d_loading && this.loaderDisabled ? t ? this.loaderArr[0] : this.loaderArr : this.columns.slice(t ? this.first.cols : this.first, t ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: rt
  }
}, Ji = ["tabindex"];
function Qi(e, t, n, o, r, i) {
  var s = j("SpinnerIcon");
  return e.disabled ? (l(), h(V, {
    key: 1
  }, [T(e.$slots, "default"), T(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: i.loadedColumns
  })], 64)) : (l(), h("div", v({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, e.ptmi("root")), [T(e.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: r.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: e.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [f("div", v({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, e.ptm("content")), [(l(!0), h(V, null, W(i.loadedItems, function(a, u) {
      return T(e.$slots, "item", {
        key: u,
        item: a,
        options: i.getOptions(u)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (l(), h("div", v({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, e.ptm("spacer")), null, 16)) : k("", !0), !e.loaderDisabled && e.showLoader && r.d_loading ? (l(), h("div", v({
    key: 1,
    class: i.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (l(!0), h(V, {
    key: 0
  }, W(r.loaderArr, function(a, u) {
    return T(e.$slots, "loader", {
      key: u,
      options: i.getLoaderOptions(u, i.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : k("", !0), T(e.$slots, "loadingicon", {}, function() {
    return [y(s, v({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : k("", !0)], 16, Ji));
}
kt.render = Qi;
var Xi = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, eo = {
  root: function(t) {
    var n = t.instance, o = t.props, r = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(t) {
    var n, o = t.instance, r = t.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && o.label === r.placeholder,
      "p-select-label-empty": !r.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(t) {
    var n = t.instance, o = t.props, r = t.state, i = t.option, s = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, to = _.extend({
  name: "select",
  style: Xi,
  classes: eo
}), no = {
  name: "BaseSelect",
  extends: Qt,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: to,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Oe(e) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Oe(e);
}
function io(e) {
  return ao(e) || so(e) || ro(e) || oo();
}
function oo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ro(e, t) {
  if (e) {
    if (typeof e == "string") return Ue(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ue(e, t) : void 0;
  }
}
function so(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ao(e) {
  if (Array.isArray(e)) return Ue(e);
}
function Ue(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function tt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? et(Object(n), !0).forEach(function(o) {
      re(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : et(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function re(e, t, n) {
  return (t = lo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function lo(e) {
  var t = uo(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function uo(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Oe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ot = {
  name: "Select",
  extends: no,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Me.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Y(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Y(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Y(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, o, r) {
      return this.ptm(r, {
        context: {
          option: t,
          index: o,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Y(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Y(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Y(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && Z(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && Z(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var o, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (o = (r = n.formField).onBlur) === null || o === void 0 || o.call(r, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Gt())
        switch (t.code) {
          case "Backspace":
            this.onBackspaceKey(t, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(t);
            break;
          default:
            t.preventDefault();
            return;
        }
      var o = t.metaKey || t.ctrlKey;
      switch (t.code) {
        case "ArrowDown":
          this.onArrowDownKey(t);
          break;
        case "ArrowUp":
          this.onArrowUpKey(t, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(t, this.editable);
          break;
        case "Home":
          this.onHomeKey(t, this.editable);
          break;
        case "End":
          this.onEndKey(t, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Space":
          this.onSpaceKey(t, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(t);
          break;
        case "Escape":
          this.onEscapeKey(t);
          break;
        case "Tab":
          this.onTabKey(t);
          break;
        case "Backspace":
          this.onBackspaceKey(t, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !o && qt(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && Z(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var o = this.searchOptions(t, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && ue(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Wt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Z(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Ut(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Z(n);
    },
    onOptionSelect: function(t, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(t, r), o && this.hide(!0);
      }
    },
    onOptionMouseMove: function(t, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(t, n);
    },
    onFilterChange: function(t) {
      var n = t.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: t,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(t) {
      if (!t.isComposing)
        switch (t.code) {
          case "ArrowDown":
            this.onArrowDownKey(t);
            break;
          case "ArrowUp":
            this.onArrowUpKey(t, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(t, !0);
            break;
          case "Home":
            this.onHomeKey(t, !0);
            break;
          case "End":
            this.onEndKey(t, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(t);
            break;
          case "Escape":
            this.onEscapeKey(t);
            break;
          case "Tab":
            this.onTabKey(t);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(t) {
      cn.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(t) {
      switch (t.code) {
        case "Escape":
          this.onEscapeKey(t);
          break;
      }
    },
    onArrowDownKey: function(t) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(t, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, n);
      }
      t.preventDefault();
    },
    onArrowUpKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (t.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), t.preventDefault();
      else {
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, o), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = t.currentTarget;
        t.shiftKey ? o.setSelectionRange(0, t.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = t.currentTarget;
        if (t.shiftKey)
          o.setSelectionRange(t.target.selectionStart, o.value.length);
        else {
          var r = o.value.length;
          o.setSelectionRange(r, r), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(t, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(0), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.visibleOptions.length - 1), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(t)), t.preventDefault();
    },
    onSpaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(t);
    },
    onEscapeKey: function(t) {
      this.overlayVisible && this.hide(!0), t.preventDefault(), t.stopPropagation();
    },
    onTabKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (Z(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Me.set("overlay", t, this.$primevue.config.zIndex.overlay), Nt(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Z(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Z(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Me.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Ht(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = ot(this.$el) + "px", jt(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        t.overlayVisible && t.overlay && !o.includes(t.$el) && !o.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new dn(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !_t() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && xe(n) && (this.labelClickListener = function() {
          Z(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && xe(t) && t.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var t = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          t.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Rt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(t) {
      return ue(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return de(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return Je(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, o = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, o = t > 0 ? Je(this.visibleOptions.slice(0, t), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o : t;
    },
    findSelectedOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findFirstOptionIndex() : t;
    },
    findLastFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findLastOptionIndex() : t;
    },
    searchOptions: function(t, n) {
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, i = !1;
      return ue(this.searchValue) && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionExactMatched(s);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionStartsWith(s);
      })), r !== -1 && (i = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(t, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, r = fe(t.list, 'li[id="'.concat(o, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : t.virtualScrollerDisabled || t.virtualScroller && t.virtualScroller.scrollToIndex(n !== -1 ? n : t.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(t, n) {
      this.writeValue(n, t), this.$emit("change", {
        originalEvent: t,
        value: n
      });
    },
    flatOptions: function(t) {
      var n = this;
      return (t || []).reduce(function(o, r, i) {
        o.push({
          optionGroup: r,
          group: !0,
          index: i
        });
        var s = n.getOptionGroupChildren(r);
        return s && s.forEach(function(a) {
          return o.push(a);
        }), o;
      }, []);
    },
    overlayRef: function(t) {
      this.overlay = t;
    },
    listRef: function(t, n) {
      this.list = t, n && n(t);
    },
    virtualScrollerRef: function(t) {
      this.virtualScroller = t;
    }
  },
  computed: {
    visibleOptions: function() {
      var t = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var o = Dt.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(s) {
            var a = t.getOptionGroupChildren(s), u = a.filter(function(p) {
              return o.includes(p);
            });
            u.length > 0 && i.push(tt(tt({}, s), {}, re({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", io(u))));
          }), this.flatOptions(i);
        }
        return o;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return ue(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var t = this;
      return this.visibleOptions.filter(function(n) {
        return !t.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return X(re({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return X(re(re({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return X(re({}, this.size, this.size));
    },
    overlayDataP: function() {
      return X(re({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: $e
  },
  components: {
    InputText: st,
    VirtualScroller: kt,
    Portal: Et,
    InputIcon: wt,
    IconField: yt,
    TimesIcon: Jt,
    ChevronDownIcon: mt,
    SpinnerIcon: rt,
    SearchIcon: gt,
    CheckIcon: vt,
    BlankIcon: bt
  }
}, co = ["id", "data-p"], po = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], fo = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], ho = ["data-p"], bo = ["id"], vo = ["id"], mo = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function go(e, t, n, o, r, i) {
  var s = j("SpinnerIcon"), a = j("InputText"), u = j("SearchIcon"), p = j("InputIcon"), b = j("IconField"), m = j("CheckIcon"), I = j("BlankIcon"), x = j("VirtualScroller"), C = j("Portal"), w = Ve("ripple");
  return l(), h("div", v({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, e.ptmi("root")), [e.editable ? (l(), h("input", v({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: i.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), null, 16, po)) : (l(), h("span", v({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), [T(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var d;
    return [R(S(i.label === "p-emptylabel" ? " " : (d = i.label) !== null && d !== void 0 ? d : "empty"), 1)];
  })], 16, fo)), i.isClearIconVisible ? T(e.$slots, "clearicon", {
    key: 2,
    class: J(e.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(l(), z(se(e.clearIcon ? "i" : "TimesIcon"), v({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: i.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : k("", !0), f("div", v({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? T(e.$slots, "loadingicon", {
    key: 0,
    class: J(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (l(), h("span", v({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (l(), z(s, v({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : T(e.$slots, "dropdownicon", {
    key: 1,
    class: J(e.cx("dropdownIcon"))
  }, function() {
    return [(l(), z(se(e.dropdownIcon ? "span" : "ChevronDownIcon"), v({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), y(C, {
    appendTo: e.appendTo
  }, {
    default: L(function() {
      return [y(zt, v({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: L(function() {
          return [r.overlayVisible ? (l(), h("div", v({
            key: 0,
            ref: i.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, e.ptm("overlay")), [f("span", v({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), T(e.$slots, "header", {
            value: e.d_value,
            options: i.visibleOptions
          }), e.filter ? (l(), h("div", v({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [y(b, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: L(function() {
              return [y(a, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: J(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), y(p, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: L(function() {
                  return [T(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (l(), h("span", v({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (l(), z(u, At(v({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), f("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), S(i.filterResultMessageText), 17)], 16)) : k("", !0), f("div", v({
            class: e.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [y(x, v({
            ref: i.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), it({
            content: L(function(d) {
              var g = d.styleClass, O = d.contentRef, M = d.items, $ = d.getItemOptions, ne = d.contentStyle, D = d.itemSize;
              return [f("ul", v({
                ref: function(P) {
                  return i.listRef(P, O);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), g],
                style: ne,
                role: "listbox"
              }, e.ptm("list")), [(l(!0), h(V, null, W(M, function(A, P) {
                return l(), h(V, {
                  key: i.getOptionRenderKey(A, i.getOptionIndex(P, $))
                }, [i.isOptionGroup(A) ? (l(), h("li", v({
                  key: 0,
                  id: e.$id + "_" + i.getOptionIndex(P, $),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [T(e.$slots, "optiongroup", {
                  option: A.optionGroup,
                  index: i.getOptionIndex(P, $)
                }, function() {
                  return [f("span", v({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), S(i.getOptionGroupLabel(A.optionGroup)), 17)];
                })], 16, vo)) : pe((l(), h("li", v({
                  key: 1,
                  id: e.$id + "_" + i.getOptionIndex(P, $),
                  class: e.cx("option", {
                    option: A,
                    focusedOption: i.getOptionIndex(P, $)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(A),
                  "aria-selected": i.isSelected(A),
                  "aria-disabled": i.isOptionDisabled(A),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(P, $)),
                  onMousedown: function(G) {
                    return i.onOptionSelect(G, A);
                  },
                  onMousemove: function(G) {
                    return i.onOptionMouseMove(G, i.getOptionIndex(P, $));
                  },
                  onClick: t[8] || (t[8] = xt(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && i.isSelected(A),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(P, $),
                  "data-p-disabled": i.isOptionDisabled(A)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(A, $, P, "option")), [e.checkmark ? (l(), h(V, {
                  key: 0
                }, [i.isSelected(A) ? (l(), z(m, v({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (l(), z(I, v({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : k("", !0), T(e.$slots, "option", {
                  option: A,
                  selected: i.isSelected(A),
                  index: i.getOptionIndex(P, $)
                }, function() {
                  return [f("span", v({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), S(i.getOptionLabel(A)), 17)];
                })], 16, mo)), [[w]])], 64);
              }), 128)), r.filterValue && (!M || M && M.length === 0) ? (l(), h("li", v({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [T(e.$slots, "emptyfilter", {}, function() {
                return [R(S(i.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (l(), h("li", v({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [T(e.$slots, "empty", {}, function() {
                return [R(S(i.emptyMessageText), 1)];
              })], 16)) : k("", !0)], 16, bo)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: L(function(d) {
              var g = d.options;
              return [T(e.$slots, "loader", {
                options: g
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), T(e.$slots, "footer", {
            value: e.d_value,
            options: i.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (l(), h("span", v({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), S(i.emptyMessageText), 17)) : k("", !0), f("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), S(i.selectedMessageText), 17), f("span", v({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, ho)) : k("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, co);
}
Ot.render = go;
var yo = `
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
`, wo = {
  root: function(t) {
    var n = t.instance, o = t.props;
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
}, Io = _.extend({
  name: "togglebutton",
  style: yo,
  classes: wo
}), ko = {
  name: "BaseToggleButton",
  extends: at,
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
  style: Io,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function Oo(e, t, n) {
  return (t = So(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function So(e) {
  var t = Co(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Co(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Se(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var St = {
  name: "ToggleButton",
  extends: ko,
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
      var n, o;
      (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, t);
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
      return X(Oo({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: $e
  }
}, $o = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Lo = ["data-p"];
function To(e, t, n, o, r, i) {
  var s = Ve("ripple");
  return pe((l(), h("button", v({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: t[0] || (t[0] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    })
  }, i.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": i.active,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [f("span", v({
    class: e.cx("content")
  }, i.getPTOptions("content"), {
    "data-p": i.dataP
  }), [T(e.$slots, "default", {}, function() {
    return [T(e.$slots, "icon", {
      value: e.d_value,
      class: J(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (l(), h("span", v({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, i.getPTOptions("icon")), null, 16)) : k("", !0)];
    }), f("span", v({
      class: e.cx("label")
    }, i.getPTOptions("label")), S(i.label), 17)];
  })], 16, Lo)], 16, $o)), [[s]]);
}
St.render = To;
var zo = `
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
`, Ao = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, xo = _.extend({
  name: "selectbutton",
  style: zo,
  classes: Ao
}), Bo = {
  name: "BaseSelectButton",
  extends: at,
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
  style: xo,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Po(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Ct(e)) || t) {
      n && (e = n);
      var o = 0, r = function() {
      };
      return { s: r, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(p) {
        throw p;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, s = !0, a = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var p = n.next();
    return s = p.done, p;
  }, e: function(p) {
    a = !0, i = p;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (a) throw i;
    }
  } };
}
function Vo(e) {
  return Ko(e) || Mo(e) || Ct(e) || Fo();
}
function Fo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ct(e, t) {
  if (e) {
    if (typeof e == "string") return We(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? We(e, t) : void 0;
  }
}
function Mo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ko(e) {
  if (Array.isArray(e)) return We(e);
}
function We(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var qe = {
  name: "SelectButton",
  extends: Bo,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? Y(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Y(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? Y(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Y(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, o) {
      var r = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var i = this.isSelected(n), s = this.getOptionValue(n), a;
        if (this.multiple)
          if (i) {
            if (a = this.d_value.filter(function(u) {
              return !de(u, s, r.equalityKey);
            }), !this.allowEmpty && a.length === 0) return;
          } else
            a = this.d_value ? [].concat(Vo(this.d_value), [s]) : [s];
        else {
          if (i && !this.allowEmpty) return;
          a = i ? null : s;
        }
        this.writeValue(a, t), this.$emit("change", {
          originalEvent: t,
          value: a
        });
      }
    },
    isSelected: function(t) {
      var n = !1, o = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var r = Po(this.d_value), i;
          try {
            for (r.s(); !(i = r.n()).done; ) {
              var s = i.value;
              if (de(s, o, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (a) {
            r.e(a);
          } finally {
            r.f();
          }
        }
      } else
        n = de(this.d_value, o, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return X({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: $e
  },
  components: {
    ToggleButton: St
  }
}, Eo = ["aria-labelledby", "data-p"];
function Do(e, t, n, o, r, i) {
  var s = j("ToggleButton");
  return l(), h("div", v({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": i.dataP
  }), [(l(!0), h(V, null, W(e.options, function(a, u) {
    return l(), z(s, {
      key: i.getOptionRenderKey(a),
      modelValue: i.isSelected(a),
      onLabel: i.getOptionLabel(a),
      offLabel: i.getOptionLabel(a),
      disabled: e.disabled || i.isOptionDisabled(a),
      unstyled: e.unstyled,
      size: e.size,
      readonly: i.isOptionReadonly(a),
      onChange: function(b) {
        return i.onOptionSelect(b, a, u);
      },
      pt: e.ptm("pcToggleButton")
    }, it({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: L(function() {
        return [T(e.$slots, "option", {
          option: a,
          index: u
        }, function() {
          return [f("span", v({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), S(i.getOptionLabel(a)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Eo);
}
qe.render = Do;
const Ro = {
  identity: ["agent_identity", "role", "name"],
  rule: ["response_style", "format", "language", "safety"],
  skill: ["capability", "workflow", "tool_use"],
  lesson: ["operating_principle", "domain_guidance", "quality_standard"]
};
function $t(e) {
  return Ro[e];
}
function Ke(e) {
  return $t(e)[0];
}
function _o(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Ho(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
const jo = { class: "mm-panel" }, No = { class: "mm-panel-b" }, Uo = { class: "mm-field" }, Wo = ["selected"], Go = { class: "mm-field" }, qo = { id: "rule_topic_suggestions" }, Zo = ["value"], Yo = { class: "mm-field" }, Jo = { class: "mm-actions" }, Qo = /* @__PURE__ */ ae({
  __name: "AgentRuleForm",
  props: {
    memory: {}
  },
  emits: ["done"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = lt(["identity", "rule", "skill", "lesson"]), i = B("rule"), s = B(""), a = B(Ke("rule")), u = B(""), p = Xt("wc-agent-picker"), b = U(() => $t(i.value)), m = U(() => _o(a.value)), I = U(() => Ho(m.value) ? "" : "Use a short topic key that starts with a letter and contains only lowercase letters, numbers, and underscores.");
    Ce(i, (w, d) => {
      a.value === Ke(d) && (a.value = Ke(w));
    });
    function x(w) {
      const d = en(w).selected;
      s.value = String((Array.isArray(d) ? d : [])[0] || "");
    }
    async function C() {
      const w = u.value.trim();
      if (I.value) return;
      await n.memory.act(() => N.post(`${n.memory.base.value}/items`, {
        kind: i.value,
        scope_family: "agent",
        scope_id: s.value,
        key: m.value,
        content: w
      })) && o("done");
    }
    return (w, d) => (l(), h("div", jo, [
      d[9] || (d[9] = f("div", { class: "mm-panel-h" }, "Add agent memory", -1)),
      f("div", No, [
        d[8] || (d[8] = f("span", { class: "mm-hint" }, "Identity and rules are part of the agent's instructions in every conversation.", -1)),
        y(c(qe), {
          modelValue: i.value,
          "onUpdate:modelValue": d[0] || (d[0] = (g) => i.value = g),
          options: c(r),
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Kind"
        }, null, 8, ["modelValue", "options"]),
        f("div", Uo, [
          d[4] || (d[4] = f("span", {
            id: "rule_agent",
            class: "mm-label"
          }, "Agent", -1)),
          c(p).ready.value ? (l(), h("wc-agent-picker", {
            key: 0,
            "aria-labelledby": "rule_agent",
            multi: "false",
            placeholder: "Pick the agent",
            selected: s.value ? JSON.stringify([s.value]) : "[]",
            onChange: x
          }, null, 40, Wo)) : c(p).failed.value ? (l(), z(c(Pe), {
            key: 1,
            severity: "error",
            size: "small"
          }, {
            default: L(() => [
              R("The agent picker could not load: " + S(c(p).failed.value), 1)
            ]),
            _: 1
          })) : k("", !0)
        ]),
        f("div", Go, [
          d[5] || (d[5] = f("label", {
            class: "mm-label",
            for: "rule_topic"
          }, "Topic key", -1)),
          y(c(st), {
            id: "rule_topic",
            modelValue: a.value,
            "onUpdate:modelValue": d[1] || (d[1] = (g) => a.value = g),
            list: "rule_topic_suggestions",
            "aria-describedby": "rule_topic_hint rule_topic_error"
          }, null, 8, ["modelValue"]),
          f("datalist", qo, [
            (l(!0), h(V, null, W(b.value, (g) => (l(), h("option", {
              key: g,
              value: g
            }, null, 8, Zo))), 128))
          ]),
          d[6] || (d[6] = f("span", {
            id: "rule_topic_hint",
            class: "mm-hint"
          }, "A stable subject for this memory. Choose a suggestion or enter a short key; it never comes from the memory text.", -1)),
          I.value ? (l(), z(c(Pe), {
            key: 0,
            id: "rule_topic_error",
            severity: "error",
            size: "small"
          }, {
            default: L(() => [
              R(S(I.value), 1)
            ]),
            _: 1
          })) : k("", !0)
        ]),
        f("div", Yo, [
          d[7] || (d[7] = f("label", {
            class: "mm-label",
            for: "rule_text"
          }, "Text", -1)),
          y(c(ut), {
            id: "rule_text",
            modelValue: u.value,
            "onUpdate:modelValue": d[2] || (d[2] = (g) => u.value = g),
            "auto-resize": "",
            placeholder: "e.g. Answer in short bullet points."
          }, null, 8, ["modelValue"])
        ]),
        f("div", Jo, [
          y(c(K), {
            label: "Add",
            size: "small",
            disabled: e.memory.busy.value || !u.value.trim() || !s.value || !!I.value,
            onClick: C
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:plus" })
            ]),
            _: 1
          }, 8, ["disabled"]),
          y(c(K), {
            label: "Cancel",
            size: "small",
            severity: "secondary",
            text: "",
            onClick: d[3] || (d[3] = (g) => o("done"))
          })
        ])
      ])
    ]));
  }
}), Xo = { class: "mm-panel" }, er = { class: "mm-panel-h" }, tr = { class: "mm-panel-b" }, nr = { class: "mm-actions" }, ir = {
  key: 1,
  class: "mm-row-t"
}, or = { class: "mm-dl" }, rr = { class: "mm-actions" }, sr = { class: "mm-actions mm-confirm" }, ar = {
  key: 3,
  class: "mm-hint"
}, lr = /* @__PURE__ */ ae({
  __name: "MemoryDetail",
  props: {
    memory: {},
    item: {}
  },
  emits: ["replaced"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = B(n.item), i = B([]), s = B([]), a = B(""), u = B(!1), p = U(() => `${n.memory.base.value}/items/${encodeURIComponent(n.item.id)}`), b = U(() => (r.value.kind === "identity" || r.value.kind === "rule") && r.value.status === "current");
    async function m() {
      a.value = "", u.value = !1, r.value.id !== n.item.id && (r.value = n.item);
      try {
        const { data: d } = await N.get(p.value);
        if (!ce(d)) return;
        ce(d.item) && (r.value = d.item), i.value = Array.isArray(d.versions) ? d.versions : [], s.value = Array.isArray(d.provenance) ? d.provenance : [];
      } catch (d) {
        n.memory.error.value = Be(d);
      }
    }
    Ce([() => n.item.id, n.memory.revision], () => {
      m();
    }, { immediate: !0 });
    function I() {
      n.memory.act(() => N.post(`${p.value}/forget`, {}));
    }
    function x() {
      n.memory.act(() => N.post(`${p.value}/archive`, {}));
    }
    function C() {
      n.memory.act(() => N.post(`${p.value}/restore`, {}));
    }
    function w() {
      const d = a.value.trim();
      d && n.memory.act(async () => {
        const { data: g } = await N.put(p.value, { content: d });
        ce(g) && typeof g.item_id == "string" && o("replaced", { ...r.value, id: g.item_id });
      });
    }
    return (d, g) => (l(), h("div", Xo, [
      f("div", er, [
        f("span", null, S(c(Ge)[r.value.kind]) + " · " + S(r.value.key), 1),
        y(c(ee), {
          class: "kx-tag-sm",
          severity: c(Re)(r.value.status),
          value: r.value.status
        }, null, 8, ["severity", "value"])
      ]),
      f("div", tr, [
        a.value ? (l(), h(V, { key: 0 }, [
          y(c(ut), {
            modelValue: a.value,
            "onUpdate:modelValue": g[0] || (g[0] = (O) => a.value = O),
            "auto-resize": "",
            "aria-label": "Memory text"
          }, null, 8, ["modelValue"]),
          f("div", nr, [
            y(c(K), {
              label: "Save new version",
              size: "small",
              disabled: e.memory.busy.value,
              onClick: w
            }, {
              icon: L(() => [
                y(c(E), { icon: "tabler:check" })
              ]),
              _: 1
            }, 8, ["disabled"]),
            y(c(K), {
              label: "Cancel",
              size: "small",
              severity: "secondary",
              text: "",
              onClick: g[1] || (g[1] = (O) => a.value = "")
            })
          ])
        ], 64)) : (l(), h("div", ir, S(r.value.content), 1)),
        f("dl", or, [
          g[6] || (g[6] = f("dt", null, "About", -1)),
          f("dd", null, S(r.value.scope_family === "agent" ? `agent ${r.value.scope_id}` : "the person who said it"), 1),
          g[7] || (g[7] = f("dt", null, "True since", -1)),
          f("dd", null, S(c(ye)(r.value.valid_at)), 1),
          r.value.invalid_at ? (l(), h(V, { key: 0 }, [
            g[5] || (g[5] = f("dt", null, "Until", -1)),
            f("dd", null, S(c(ye)(r.value.invalid_at)), 1)
          ], 64)) : k("", !0),
          g[8] || (g[8] = f("dt", null, "Learned", -1)),
          f("dd", null, S(c(ye)(r.value.recorded_at)) + " · " + S(r.value.source), 1)
        ]),
        f("div", rr, [
          b.value && !a.value ? (l(), z(c(K), {
            key: 0,
            label: "Edit",
            size: "small",
            severity: "secondary",
            outlined: "",
            onClick: g[2] || (g[2] = (O) => a.value = r.value.content)
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:pencil" })
            ]),
            _: 1
          })) : k("", !0),
          r.value.status === "current" || r.value.status === "conflict" ? (l(), z(c(K), {
            key: 1,
            label: "Archive",
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: x
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:archive" })
            ]),
            _: 1
          }, 8, ["disabled"])) : k("", !0),
          r.value.status === "archived" ? (l(), z(c(K), {
            key: 2,
            label: "Restore",
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: C
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:restore" })
            ]),
            _: 1
          }, 8, ["disabled"])) : k("", !0),
          r.value.status !== "forgotten" && !u.value ? (l(), z(c(K), {
            key: 3,
            label: "Forget",
            size: "small",
            severity: "danger",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: g[3] || (g[3] = (O) => u.value = !0)
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:trash" })
            ]),
            _: 1
          }, 8, ["disabled"])) : k("", !0)
        ]),
        u.value ? (l(), z(c(Pe), {
          key: 2,
          severity: "warn",
          size: "small"
        }, {
          default: L(() => [
            g[9] || (g[9] = R(" Forget erases this memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)),
            f("div", sr, [
              y(c(K), {
                label: "Forget for good",
                size: "small",
                severity: "danger",
                disabled: e.memory.busy.value,
                onClick: I
              }, null, 8, ["disabled"]),
              y(c(K), {
                label: "Cancel",
                size: "small",
                severity: "secondary",
                text: "",
                onClick: g[4] || (g[4] = (O) => u.value = !1)
              })
            ])
          ]),
          _: 1
        })) : k("", !0),
        g[10] || (g[10] = f("p", { class: "mm-h" }, "Versions", -1)),
        (l(!0), h(V, null, W(i.value, (O) => (l(), h("div", {
          key: O.id,
          class: J(["mm-version", { past: O.status !== "current" }])
        }, [
          y(c(ee), {
            class: "kx-tag-sm",
            severity: c(Re)(O.status),
            value: `v${O.version}`
          }, null, 8, ["severity", "value"]),
          f("span", null, S(O.content), 1)
        ], 2))), 128)),
        g[11] || (g[11] = f("p", { class: "mm-h" }, "Seen in", -1)),
        s.value.length ? k("", !0) : (l(), h("span", ar, "Added by a person or by consolidation.")),
        (l(!0), h(V, null, W(s.value, (O) => (l(), h("span", {
          key: O.host_kind + O.host_id + O.event_id,
          class: "mm-hint"
        }, S(O.host_kind) + " " + S(O.host_id) + " · message " + S(O.event_id), 1))), 128))
      ])
    ]));
  }
}), ur = { class: "mm-filters" }, dr = { class: "mm-panel" }, cr = {
  key: 0,
  class: "kx-loading"
}, pr = {
  key: 1,
  class: "kx-empty"
}, fr = { class: "kx-empty-ico" }, hr = ["onClick"], br = { class: "mm-row-t" }, vr = { class: "mm-row-s" }, mr = {
  key: 3,
  class: "mm-panel-b"
}, gr = /* @__PURE__ */ ae({
  __name: "MemoryList",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = lt(), o = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier versions" },
      { value: "archived", label: "Archived" }
    ], r = B("current"), i = B(null), s = B([]), a = B(!0), u = B(null), p = B(!1), b = B(null);
    let m = 0;
    async function I(C = !1) {
      const w = C ? b.value : 0;
      if (w === null || C && a.value) return;
      const d = ++m;
      C || (s.value = [], b.value = null), a.value = !0, t.memory.error.value = "";
      const g = new URLSearchParams({ limit: "200", status: r.value });
      i.value && g.set("kind", i.value), C && g.set("offset", String(w));
      try {
        const { data: O } = await N.get(`${t.memory.base.value}/items?${g.toString()}`);
        if (d !== m) return;
        const M = ce(O) && Array.isArray(O.items) ? O.items : [];
        s.value = C ? [...s.value, ...M] : M;
        const $ = ce(O) ? O.next_offset : void 0;
        b.value = M.length > 0 && typeof $ == "number" && Number.isInteger($) && $ > w ? $ : null;
      } catch (O) {
        d === m && (t.memory.error.value = Be(O));
      } finally {
        d === m && (a.value = !1);
      }
    }
    Ce([r, i, t.memory.base, t.memory.revision], () => {
      I();
    }, { immediate: !0 }), nt(() => {
      m++;
    });
    function x(C) {
      p.value = !1, u.value = C;
    }
    return (C, w) => (l(), h(V, null, [
      f("div", ur, [
        y(c(qe), {
          modelValue: r.value,
          "onUpdate:modelValue": w[0] || (w[0] = (d) => r.value = d),
          options: o,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Status"
        }, null, 8, ["modelValue"]),
        y(c(Ot), {
          modelValue: i.value,
          "onUpdate:modelValue": w[1] || (w[1] = (d) => i.value = d),
          options: c(n),
          "option-label": "label",
          "option-value": "value",
          size: "small",
          placeholder: "All kinds",
          "show-clear": "",
          "aria-label": "Kind"
        }, null, 8, ["modelValue", "options"]),
        p.value ? k("", !0) : (l(), z(c(K), {
          key: 0,
          label: "Add agent memory",
          size: "small",
          severity: "secondary",
          outlined: "",
          onClick: w[2] || (w[2] = (d) => {
            p.value = !0, u.value = null;
          })
        }, {
          icon: L(() => [
            y(c(E), { icon: "tabler:plus" })
          ]),
          _: 1
        }))
      ]),
      f("div", {
        class: J(["mm-split", { solo: !p.value && !u.value }])
      }, [
        f("div", dr, [
          a.value && !s.value.length ? (l(), h("div", cr, [
            y(c(E), {
              icon: "tabler:loader-2",
              class: "spin"
            }),
            w[6] || (w[6] = R("Loading memories", -1))
          ])) : s.value.length ? (l(!0), h(V, { key: 2 }, W(s.value, (d) => (l(), h("button", {
            key: d.id,
            class: J(["mm-row", { on: u.value?.id === d.id }]),
            onClick: (g) => x(d)
          }, [
            f("span", null, [
              f("span", br, S(d.content), 1),
              f("span", vr, [
                y(c(ee), {
                  class: "kx-tag-sm",
                  severity: "secondary",
                  value: c(Ge)[d.kind]
                }, null, 8, ["value"]),
                f("span", null, S(d.scope_family === "agent" ? "agent" : "person") + " · " + S(d.key) + " · v" + S(d.version), 1)
              ])
            ])
          ], 10, hr))), 128)) : (l(), h("div", pr, [
            f("span", fr, [
              y(c(E), { icon: "tabler:brain" })
            ]),
            w[7] || (w[7] = f("p", { class: "kx-empty-title" }, "Nothing here yet", -1)),
            w[8] || (w[8] = f("p", { class: "kx-empty-sub" }, "Memories appear as agents talk with people, or add the agent's identity and rules yourself.", -1))
          ])),
          b.value !== null ? (l(), h("div", mr, [
            y(c(K), {
              label: "Load more memories",
              size: "small",
              severity: "secondary",
              outlined: "",
              loading: a.value,
              disabled: a.value,
              onClick: w[3] || (w[3] = (d) => I(!0))
            }, null, 8, ["loading", "disabled"])
          ])) : k("", !0)
        ]),
        p.value ? (l(), z(Qo, {
          key: 0,
          memory: e.memory,
          onDone: w[4] || (w[4] = (d) => p.value = !1)
        }, null, 8, ["memory"])) : u.value ? (l(), z(lr, {
          key: 1,
          memory: e.memory,
          item: u.value,
          onReplaced: w[5] || (w[5] = (d) => u.value = d)
        }, null, 8, ["memory", "item"])) : k("", !0)
      ], 2)
    ], 64));
  }
});
function yr(e, t) {
  return { ...e, ...t };
}
function wr(e, t) {
  return { ...e, ...t };
}
const Ir = { class: "mm-panel" }, kr = { class: "mm-panel-b" }, Or = { class: "mm-actions" }, Sr = {
  key: 0,
  class: "mm-hint"
}, Cr = /* @__PURE__ */ ae({
  __name: "MemorySettings",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = B({}), o = B(!1), r = U(() => t.memory.status.value?.config || {}), i = U(() => ({ ...yr(t.memory.status.value?.defaults || {}, r.value), ...n.value })), s = U(() => Object.keys(n.value).length > 0);
    Ce(() => t.memory.kbId.value, () => {
      n.value = {};
    });
    function a(p) {
      const b = {};
      for (const [m, I] of Object.entries(p))
        (I !== i.value[m] || m in n.value) && (b[m] = I);
      n.value = { ...n.value, ...b }, o.value = !1;
    }
    async function u() {
      const p = wr(r.value, n.value);
      await t.memory.act(() => N.put(`/api/v1/knowledge/${encodeURIComponent(t.memory.kbId.value)}`, { config: p })) && (n.value = {}, o.value = !0);
    }
    return (p, b) => (l(), h("div", Ir, [
      f("div", kr, [
        e.memory.status.value ? (l(), z(tn, {
          key: 0,
          "model-value": i.value,
          schema: e.memory.status.value.config_schema,
          "onUpdate:modelValue": a
        }, null, 8, ["model-value", "schema"])) : k("", !0),
        f("div", Or, [
          y(c(K), {
            label: "Save settings",
            size: "small",
            disabled: e.memory.busy.value || !s.value,
            onClick: u
          }, {
            icon: L(() => [
              y(c(E), { icon: "tabler:device-floppy" })
            ]),
            _: 1
          }, 8, ["disabled"]),
          o.value ? (l(), h("span", Sr, "Saved.")) : k("", !0)
        ])
      ])
    ]));
  }
}), $r = { class: "mm-panel" }, Lr = {
  key: 0,
  class: "kx-empty"
}, Tr = { class: "kx-empty-ico" }, zr = { class: "mm-row-t" }, Ar = { class: "mm-row-s" }, xr = { key: 0 }, Br = { key: 1 }, Pr = { key: 2 }, Vr = {
  key: 0,
  class: "mm-row-s mm-row-err"
}, Fr = /* @__PURE__ */ ae({
  __name: "RunList",
  props: {
    runs: {}
  },
  setup(e) {
    function t(n) {
      return n.run_type === "consolidate" ? "Consolidation" : n.run_type === "reembed" ? "Re-embedding" : n.host_kind === "content" ? "Learned from content" : "Learned from a conversation";
    }
    return (n, o) => (l(), h("div", $r, [
      e.runs.length ? k("", !0) : (l(), h("div", Lr, [
        f("span", Tr, [
          y(c(E), { icon: "tabler:activity" })
        ]),
        o[0] || (o[0] = f("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        o[1] || (o[1] = f("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, the run shows here.", -1))
      ])),
      (l(!0), h(V, null, W(e.runs, (r) => (l(), h("div", {
        key: r.id,
        class: "mm-row"
      }, [
        f("span", null, [
          f("span", zr, S(t(r)), 1),
          f("span", Ar, [
            f("span", null, S(c(ye)(r.finished_at || r.started_at || r.created_at)), 1),
            r.stats?.added ? (l(), h("span", xr, "+" + S(r.stats.added) + " new", 1)) : k("", !0),
            r.stats?.superseded ? (l(), h("span", Br, S(r.stats.superseded) + " updated", 1)) : k("", !0),
            r.stats?.conflicted ? (l(), h("span", Pr, S(r.stats.conflicted) + " contested", 1)) : k("", !0)
          ]),
          r.last_error ? (l(), h("span", Vr, S(r.last_error), 1)) : k("", !0)
        ]),
        r.status !== "succeeded" ? (l(), z(c(ee), {
          key: 0,
          class: "kx-tag-sm",
          severity: c(Re)(r.status),
          value: r.status
        }, null, 8, ["severity", "value"])) : k("", !0)
      ]))), 128))
    ]));
  }
}), Mr = { class: "mm-page" }, Kr = /* @__PURE__ */ ae({
  __name: "MemoryManage",
  setup(e) {
    const t = Zt(), n = ri(U(() => String(nn(t.value.config).kb_id || ""))), o = B("memories"), r = U(() => (n.status.value?.runs || []).filter((i) => i.status === "failed").length);
    return (i, s) => (l(), h("div", Mr, [
      y(c(ht), {
        value: o.value,
        "onUpdate:value": s[0] || (s[0] = (a) => o.value = a)
      }, {
        default: L(() => [
          y(c(pt), null, {
            default: L(() => [
              y(c(me), { value: "memories" }, {
                default: L(() => [
                  s[1] || (s[1] = R("Memories ", -1)),
                  c(n).status.value ? (l(), z(c(ee), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "secondary",
                    value: String(c(n).status.value.counts.current)
                  }, null, 8, ["value"])) : k("", !0)
                ]),
                _: 1
              }),
              y(c(me), { value: "conflicts" }, {
                default: L(() => [
                  s[2] || (s[2] = R("Conflicts ", -1)),
                  c(n).conflicts.value.length ? (l(), z(c(ee), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "warn",
                    value: String(c(n).conflicts.value.length)
                  }, null, 8, ["value"])) : k("", !0)
                ]),
                _: 1
              }),
              y(c(me), { value: "activity" }, {
                default: L(() => [
                  s[3] || (s[3] = R("Activity ", -1)),
                  r.value ? (l(), z(c(ee), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "danger",
                    value: `${r.value} failed`
                  }, null, 8, ["value"])) : k("", !0)
                ]),
                _: 1
              }),
              y(c(me), { value: "settings" }, {
                default: L(() => [...s[4] || (s[4] = [
                  R("Settings", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          }),
          c(n).error.value ? (l(), z(c(Pe), {
            key: 0,
            severity: "error",
            class: "mm-error"
          }, {
            default: L(() => [
              R(S(c(n).error.value), 1)
            ]),
            _: 1
          })) : k("", !0),
          y(c(ft), null, {
            default: L(() => [
              y(c(ge), { value: "memories" }, {
                default: L(() => [
                  y(gr, { memory: c(n) }, null, 8, ["memory"])
                ]),
                _: 1
              }),
              y(c(ge), { value: "conflicts" }, {
                default: L(() => [
                  y(pi, { memory: c(n) }, null, 8, ["memory"])
                ]),
                _: 1
              }),
              y(c(ge), { value: "activity" }, {
                default: L(() => [
                  y(Fr, {
                    runs: c(n).status.value?.runs || []
                  }, null, 8, ["runs"])
                ]),
                _: 1
              }),
              y(c(ge), { value: "settings" }, {
                default: L(() => [
                  y(Cr, { memory: c(n) }, null, 8, ["memory"])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"])
    ]));
  }
}), Er = Yt(Kr, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
Pt(import.meta.url, Er);
//# sourceMappingURL=index.js.map
