import { mergeProps as v, resolveDirective as Be, withDirectives as ce, openBlock as l, createBlock as z, resolveDynamicComponent as re, withCtx as C, renderSlot as $, normalizeClass as Z, createElementBlock as f, createElementVNode as p, createCommentVNode as O, Fragment as V, vShow as Ct, toDisplayString as S, computed as ie, ref as B, watch as Pe, onUnmounted as $t, defineComponent as ae, createVNode as m, unref as c, renderList as Y, resolveComponent as j, createTextVNode as N, Transition as Lt, normalizeProps as Tt, createSlots as tt, withModifiers as zt } from "vue";
import { Icon as K } from "@iconify/vue";
import { on as At, api as _, define as xt } from "@wippy-fe/proxy";
import { A as Bt, d as Pt, B as R, R as Ce, f as ee, g as Q, k as de, h as G, Q as Te, z as pe, j as fe, l as ne, T as le, C as Vt, K as ze, v as nt, V as Ze, n as Ft, i as ge, o as Ae, q as Ue, r as xe, t as Mt, w as Kt, x as ue, F as Et, M as Ye, y as Dt, Y as Rt, I as Ht, D as jt, S as Nt, L as _t, E as Ut, $ as Wt, J as Gt, G as q, H as it, N as ot, b as qt, s as We, e as Zt, u as Yt, p as Jt, m as Qt } from "./useWidget-Oapw5JdO.js";
import { s as M, b as st, c as rt, d as Xt, e as at, a as en } from "./ConfigFields.vue_vue_type_script_setup_true_lang-B4quf9ar.js";
function tn() {
  let e = [], t = (r, a, u = 999) => {
    let d = s(r, a, u), h = d.value + (d.key === r ? 0 : u) + 1;
    return e.push({ key: r, value: h }), h;
  }, n = (r) => {
    e = e.filter((a) => a.value !== r);
  }, o = (r, a) => s(r).value, s = (r, a, u = 0) => [...e].reverse().find((d) => !0) || { key: r, value: u }, i = (r) => r && parseInt(r.style.zIndex, 10) || 0;
  return { get: i, set: (r, a, u) => {
    a && (a.style.zIndex = String(t(r, !0, u)));
  }, clear: (r) => {
    r && (n(i(r)), r.style.zIndex = "");
  }, getCurrent: (r) => o(r) };
}
var Fe = tn();
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function nn(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function on(e, t) {
  for (var n = 0; n < t.length; n++) {
    var o = t[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, rn(o.key), o);
  }
}
function sn(e, t, n) {
  return t && on(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function rn(e) {
  var t = an(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function an(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (we(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var ln = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    nn(this, e), this.element = t, this.listener = n;
  }
  return sn(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Bt(this.element);
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
})(), un = Pt(), dn = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": o.disabled
    }];
  }
}, cn = R.extend({
  name: "tab",
  classes: dn
}), pn = {
  name: "BaseTab",
  extends: ee,
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
  style: cn,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "Tab",
  extends: pn,
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
      return o ? Te(o, "data-p-disabled") || Te(o, "data-pc-section") === "activebar" ? this.findNextTab(o) : pe(o, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = n ? t : t.previousElementSibling;
      return o ? Te(o, "data-p-disabled") || Te(o, "data-pc-section") === "activebar" ? this.findPrevTab(o) : pe(o, '[data-pc-name="tab"]') : null;
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
      G(n), this.scrollInView(n);
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
      return Q({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Ce
  }
};
function fn(e, t, n, o, s, i) {
  var r = Be("ripple");
  return e.asChild ? $(e.$slots, "default", {
    key: 1,
    dataP: i.dataP,
    class: Z(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs,
    onClick: i.onClick
  }) : ce((l(), z(re(e.as), v({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP,
    onClick: i.onClick
  }, i.attrs), {
    default: C(function() {
      return [$(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[r]]);
}
ve.render = fn;
var lt = {
  name: "ChevronLeftIcon",
  extends: fe
};
function hn(e) {
  return gn(e) || mn(e) || vn(e) || bn();
}
function bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vn(e, t) {
  if (e) {
    if (typeof e == "string") return Me(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Me(e, t) : void 0;
  }
}
function mn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gn(e) {
  if (Array.isArray(e)) return Me(e);
}
function Me(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function yn(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), hn(t[0] || (t[0] = [p("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
lt.render = yn;
var ut = {
  name: "ChevronRightIcon",
  extends: fe
};
function wn(e) {
  return Sn(e) || On(e) || kn(e) || In();
}
function In() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kn(e, t) {
  if (e) {
    if (typeof e == "string") return Ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ke(e, t) : void 0;
  }
}
function On(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Sn(e) {
  if (Array.isArray(e)) return Ke(e);
}
function Ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Cn(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wn(t[0] || (t[0] = [p("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ut.render = Cn;
var $n = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Ln = R.extend({
  name: "tablist",
  classes: $n
}), Tn = {
  name: "BaseTabList",
  extends: ee,
  props: {},
  style: Ln,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, dt = {
  name: "TabList",
  extends: Tn,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), o = ne(t) - n, s = Math.abs(t.scrollLeft), i = o * 0.8, r = s - i, a = Math.max(r, 0);
      t.scrollLeft = Ze(t) ? -1 * a : a;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), o = ne(t) - n, s = Math.abs(t.scrollLeft), i = o * 0.8, r = s + i, a = t.scrollWidth - o, u = Math.min(r, a);
      t.scrollLeft = Ze(t) ? -1 * u : u;
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
      var n = this.$refs.content, o = pe(n, '[data-pc-name="tab"][data-p-active="true"]');
      o && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(o));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, o = t.inkbar, s = t.tabs;
      if (o) {
        var i = pe(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (o.style.height = Vt(i) + "px", o.style.top = ze(i).top - ze(s).top + "px") : (o.style.width = nt(i) + "px", o.style.left = ze(i).left - ze(s).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, o = t.content, s = o.scrollTop, i = o.scrollWidth, r = o.scrollHeight, a = o.offsetWidth, u = o.offsetHeight, d = Math.abs(o.scrollLeft), h = [ne(o), le(o)], g = h[0], y = h[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = s !== 0, this.isNextButtonEnabled = n.offsetHeight >= u && parseInt(s) !== r - y) : (this.isPrevButtonEnabled = d !== 0, this.isNextButtonEnabled = n.offsetWidth >= a && parseInt(d) !== i - g);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, o = t.nextButton, s = 0;
      return this.showNavigators && (s = (n?.offsetWidth || 0) + (o?.offsetWidth || 0)), s;
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
      return Q({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: lt,
    ChevronRightIcon: ut
  },
  directives: {
    ripple: Ce
  }
}, zn = ["data-p"], An = ["aria-label", "tabindex"], xn = ["data-p"], Bn = ["aria-orientation"], Pn = ["aria-label", "tabindex"];
function Vn(e, t, n, o, s, i) {
  var r = Be("ripple");
  return l(), f("div", v({
    ref: "list",
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [i.showNavigators && s.isPrevButtonEnabled ? ce((l(), f("button", v({
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
  }), [(l(), z(re(i.templates.previcon || "ChevronLeftIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, An)), [[r]]) : O("", !0), p("div", v({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    }),
    "data-p": i.dataP
  }, e.ptm("content")), [p("div", v({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": i.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [$(e.$slots, "default"), p("span", v({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Bn)], 16, xn), i.showNavigators && s.isNextButtonEnabled ? ce((l(), f("button", v({
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
  }), [(l(), z(re(i.templates.nexticon || "ChevronRightIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Pn)), [[r]]) : O("", !0)], 16, zn);
}
dt.render = Vn;
var Fn = {
  root: function(t) {
    var n = t.instance;
    return ["p-tabpanel", {
      "p-tabpanel-active": n.active
    }];
  }
}, Mn = R.extend({
  name: "tabpanel",
  classes: Fn
}), Kn = {
  name: "BaseTabPanel",
  extends: ee,
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
  style: Mn,
  provide: function() {
    return {
      $pcTabPanel: this,
      $parentInstance: this
    };
  }
}, me = {
  name: "TabPanel",
  extends: Kn,
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
function En(e, t, n, o, s, i) {
  var r, a;
  return i.$pcTabs ? (l(), f(V, {
    key: 1
  }, [e.asChild ? $(e.$slots, "default", {
    key: 1,
    class: Z(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs
  }) : (l(), f(V, {
    key: 0
  }, [!((r = i.$pcTabs) !== null && r !== void 0 && r.lazy) || i.active ? ce((l(), z(re(e.as), v({
    key: 0,
    class: e.cx("root")
  }, i.attrs), {
    default: C(function() {
      return [$(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class"])), [[Ct, (a = i.$pcTabs) !== null && a !== void 0 && a.lazy ? !0 : i.active]]) : O("", !0)], 64))], 64)) : $(e.$slots, "default", {
    key: 0
  });
}
me.render = En;
var Dn = {
  root: "p-tabpanels"
}, Rn = R.extend({
  name: "tabpanels",
  classes: Dn
}), Hn = {
  name: "BaseTabPanels",
  extends: ee,
  props: {},
  style: Rn,
  provide: function() {
    return {
      $pcTabPanels: this,
      $parentInstance: this
    };
  }
}, ct = {
  name: "TabPanels",
  extends: Hn,
  inheritAttrs: !1
};
function jn(e, t, n, o, s, i) {
  return l(), f("div", v({
    class: e.cx("root"),
    role: "presentation"
  }, e.ptmi("root")), [$(e.$slots, "default")], 16);
}
ct.render = jn;
var Nn = `
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
`, _n = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Un = R.extend({
  name: "tabs",
  style: Nn,
  classes: _n
}), Wn = {
  name: "BaseTabs",
  extends: ee,
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
  style: Un,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, pt = {
  name: "Tabs",
  extends: Wn,
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
function Gn(e, t, n, o, s, i) {
  return l(), f("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [$(e.$slots, "default")], 16);
}
pt.render = Gn;
var qn = `
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
`, Zn = {
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
}, Yn = R.extend({
  name: "tag",
  style: qn,
  classes: Zn
}), Jn = {
  name: "BaseTag",
  extends: ee,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Yn,
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
function Qn(e, t, n) {
  return (t = Xn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xn(e) {
  var t = ei(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function ei(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ie(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var X = {
  name: "Tag",
  extends: Jn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Q(Qn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ti = ["data-p"];
function ni(e, t, n, o, s, i) {
  return l(), f("span", v({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (l(), z(re(e.$slots.icon), v({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (l(), f("span", v({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : O("", !0), e.value != null || e.$slots.default ? $(e.$slots, "default", {
    key: 2
  }, function() {
    return [p("span", v({
      class: e.cx("label")
    }, e.ptm("label")), S(e.value), 17)];
  }) : O("", !0)], 16, ti);
}
X.render = ni;
function ii(e) {
  const t = ie(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = B(null), o = B([]), s = B(""), i = B(!1), r = B(0);
  let a = 0;
  async function u() {
    if (!e.value) return;
    const g = ++a;
    try {
      const [y, b] = await Promise.all([_.get(`${t.value}/status`), _.get(`${t.value}/conflicts`)]);
      if (g !== a) return;
      n.value = y.data;
      const w = b.data;
      o.value = ge(w) && Array.isArray(w.groups) ? w.groups : [], s.value = "", r.value++;
    } catch (y) {
      g === a && (s.value = Ae(y));
    }
  }
  async function d(g) {
    i.value = !0, s.value = "";
    try {
      return await g(), await u(), !0;
    } catch (y) {
      return s.value = Ae(y), !1;
    } finally {
      i.value = !1;
    }
  }
  let h = null;
  return Pe(e, (g, y) => {
    if (h && h(), h = null, !g) return;
    const b = At(`component.${g}`, () => {
      u();
    });
    h = typeof b == "function" ? b : null, y !== void 0 && u();
  }, { immediate: !0 }), $t(() => {
    h && h();
  }), Ft(u), { kbId: e, base: t, status: n, conflicts: o, error: s, busy: i, revision: r, act: d };
}
const oi = { current: "success", conflict: "warn", failed: "danger" };
function Ee(e) {
  return oi[e] || "secondary";
}
function ye(e) {
  if (!e) return "";
  const t = Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z");
  return Number.isFinite(t) ? new Date(t).toLocaleString() : e;
}
const si = { class: "mm-panel" }, ri = {
  key: 0,
  class: "kx-empty"
}, ai = { class: "kx-empty-ico" }, li = { class: "mm-row-t" }, ui = { class: "mm-row-s" }, di = /* @__PURE__ */ ae({
  __name: "ConflictList",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e;
    function n(o, s) {
      t.memory.act(() => _.post(`${t.memory.base.value}/conflicts/${encodeURIComponent(o.group_id)}/resolve`, { winner_id: s.id }));
    }
    return (o, s) => (l(), f("div", si, [
      e.memory.conflicts.value.length ? O("", !0) : (l(), f("div", ri, [
        p("span", ai, [
          m(c(K), { icon: "tabler:circle-check" })
        ]),
        s[0] || (s[0] = p("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        s[1] || (s[1] = p("p", { class: "kx-empty-sub" }, "When two memories contradict each other, they wait here for you to keep the right one.", -1))
      ])),
      (l(!0), f(V, null, Y(e.memory.conflicts.value, (i) => (l(), f("div", {
        key: i.group_id,
        class: "mm-conflict"
      }, [
        s[2] || (s[2] = p("span", { class: "mm-hint" }, "These memories contradict each other. Keep the one that is right; the others become earlier versions.", -1)),
        (l(!0), f(V, null, Y(i.items, (r) => (l(), f("div", {
          key: r.id,
          class: "mm-option"
        }, [
          p("div", null, [
            p("div", li, S(r.content), 1),
            p("div", ui, [
              m(c(X), {
                class: "kx-tag-sm",
                severity: "secondary",
                value: c(Ue)[r.kind]
              }, null, 8, ["value"]),
              p("span", null, S(c(ye)(r.valid_at)), 1)
            ])
          ]),
          m(c(M), {
            label: "Keep this",
            size: "small",
            disabled: e.memory.busy.value,
            onClick: (a) => n(i, r)
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:check" })
            ]),
            _: 1
          }, 8, ["disabled", "onClick"])
        ]))), 128))
      ]))), 128))
    ]));
  }
});
var ft = {
  name: "BlankIcon",
  extends: fe
};
function ci(e) {
  return bi(e) || hi(e) || fi(e) || pi();
}
function pi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fi(e, t) {
  if (e) {
    if (typeof e == "string") return De(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? De(e, t) : void 0;
  }
}
function hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function bi(e) {
  if (Array.isArray(e)) return De(e);
}
function De(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function vi(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ci(t[0] || (t[0] = [p("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
ft.render = vi;
var ht = {
  name: "CheckIcon",
  extends: fe
};
function mi(e) {
  return Ii(e) || wi(e) || yi(e) || gi();
}
function gi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yi(e, t) {
  if (e) {
    if (typeof e == "string") return Re(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Re(e, t) : void 0;
  }
}
function wi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ii(e) {
  if (Array.isArray(e)) return Re(e);
}
function Re(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ki(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), mi(t[0] || (t[0] = [p("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ht.render = ki;
var bt = {
  name: "ChevronDownIcon",
  extends: fe
};
function Oi(e) {
  return Li(e) || $i(e) || Ci(e) || Si();
}
function Si() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return He(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? He(e, t) : void 0;
  }
}
function $i(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Li(e) {
  if (Array.isArray(e)) return He(e);
}
function He(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ti(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Oi(t[0] || (t[0] = [p("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
bt.render = Ti;
var vt = {
  name: "SearchIcon",
  extends: fe
};
function zi(e) {
  return Pi(e) || Bi(e) || xi(e) || Ai();
}
function Ai() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xi(e, t) {
  if (e) {
    if (typeof e == "string") return je(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? je(e, t) : void 0;
  }
}
function Bi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pi(e) {
  if (Array.isArray(e)) return je(e);
}
function je(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Vi(e, t, n, o, s, i) {
  return l(), f("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), zi(t[0] || (t[0] = [p("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
vt.render = Vi;
var Fi = `
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
`, Mi = {
  root: "p-iconfield"
}, Ki = R.extend({
  name: "iconfield",
  style: Fi,
  classes: Mi
}), Ei = {
  name: "BaseIconField",
  extends: ee,
  style: Ki,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, mt = {
  name: "IconField",
  extends: Ei,
  inheritAttrs: !1
};
function Di(e, t, n, o, s, i) {
  return l(), f("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [$(e.$slots, "default")], 16);
}
mt.render = Di;
var Ri = {
  root: "p-inputicon"
}, Hi = R.extend({
  name: "inputicon",
  classes: Ri
}), ji = {
  name: "BaseInputIcon",
  extends: ee,
  style: Hi,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, gt = {
  name: "InputIcon",
  extends: ji,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ni(e, t, n, o, s, i) {
  return l(), f("span", v({
    class: i.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [$(e.$slots, "default")], 16);
}
gt.render = Ni;
var _i = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ui = `
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
`, Je = R.extend({
  name: "virtualscroller",
  css: Ui,
  style: _i
}), Wi = {
  name: "BaseVirtualScroller",
  extends: ee,
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
  style: Je,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Je.loadCSS({
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
function Qe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function be(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qe(Object(n), !0).forEach(function(o) {
      yt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qe(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function yt(e, t, n) {
  return (t = Gi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gi(e) {
  var t = qi(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function qi(e, t) {
  if (ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wt = {
  name: "VirtualScroller",
  extends: Wi,
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
      xe(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = ne(this.element), this.defaultHeight = le(this.element), this.defaultContentWidth = ne(this.content), this.defaultContentHeight = le(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", s = this.isBoth(), i = this.isHorizontal(), r = s ? t.every(function(A) {
        return A > -1;
      }) : t > -1;
      if (r) {
        var a = this.first, u = this.element, d = u.scrollTop, h = d === void 0 ? 0 : d, g = u.scrollLeft, y = g === void 0 ? 0 : g, b = this.calculateNumItems(), w = b.numToleratedItems, P = this.getContentPosition(), k = this.itemSize, I = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, J = arguments.length > 1 ? arguments[1] : void 0;
          return x <= J ? 0 : x;
        }, L = function(x, J, U) {
          return x * J + U;
        }, E = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, J = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: x,
            top: J,
            behavior: o
          });
        }, T = s ? {
          rows: 0,
          cols: 0
        } : 0, te = !1, D = !1;
        s ? (T = {
          rows: I(t[0], w[0]),
          cols: I(t[1], w[1])
        }, E(L(T.cols, k[1], P.left), L(T.rows, k[0], P.top)), D = this.lastScrollPos.top !== h || this.lastScrollPos.left !== y, te = T.rows !== a.rows || T.cols !== a.cols) : (T = I(t, w), i ? E(L(T, k, P.left), h) : E(y, L(T, k, P.top)), D = this.lastScrollPos !== (i ? y : h), te = T !== a), this.isRangeChanged = te, D && (this.first = T);
      }
    },
    scrollInView: function(t, n) {
      var o = this, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), r = this.isHorizontal(), a = i ? t.every(function(k) {
          return k > -1;
        }) : t > -1;
        if (a) {
          var u = this.getRenderedRange(), d = u.first, h = u.viewport, g = function() {
            var I = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: I,
              top: L,
              behavior: s
            });
          }, y = n === "to-start", b = n === "to-end";
          if (y) {
            if (i)
              h.first.rows - d.rows > t[0] ? g(h.first.cols * this.itemSize[1], (h.first.rows - 1) * this.itemSize[0]) : h.first.cols - d.cols > t[1] && g((h.first.cols - 1) * this.itemSize[1], h.first.rows * this.itemSize[0]);
            else if (h.first - d > t) {
              var w = (h.first - 1) * this.itemSize;
              r ? g(w, 0) : g(0, w);
            }
          } else if (b) {
            if (i)
              h.last.rows - d.rows <= t[0] + 1 ? g(h.first.cols * this.itemSize[1], (h.first.rows + 1) * this.itemSize[0]) : h.last.cols - d.cols <= t[1] + 1 && g((h.first.cols + 1) * this.itemSize[1], h.first.rows * this.itemSize[0]);
            else if (h.last - d <= t + 1) {
              var P = (h.first + 1) * this.itemSize;
              r ? g(P, 0) : g(0, P);
            }
          }
        }
      } else
        this.scrollToIndex(t, s);
    },
    getRenderedRange: function() {
      var t = function(g, y) {
        return Math.floor(g / (y || g));
      }, n = this.first, o = 0;
      if (this.element) {
        var s = this.isBoth(), i = this.isHorizontal(), r = this.element, a = r.scrollTop, u = r.scrollLeft;
        if (s)
          n = {
            rows: t(a, this.itemSize[0]),
            cols: t(u, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var d = i ? u : a;
          n = t(d, this.itemSize), o = n + this.numItemsInViewport;
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
      var t = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, s = this.getContentPosition(), i = this.element ? this.element.offsetWidth - s.left : 0, r = this.element ? this.element.offsetHeight - s.top : 0, a = function(y, b) {
        return Math.ceil(y / (b || y));
      }, u = function(y) {
        return Math.ceil(y / 2);
      }, d = t ? {
        rows: a(r, o[0]),
        cols: a(i, o[1])
      } : a(n ? i : r, o), h = this.d_numToleratedItems || (t ? [u(d.rows), u(d.cols)] : u(d));
      return {
        numItemsInViewport: d,
        numToleratedItems: h
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), o = this.first, s = this.calculateNumItems(), i = s.numItemsInViewport, r = s.numToleratedItems, a = function(h, g, y) {
        var b = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(h + g + (h < y ? 2 : 3) * y, b);
      }, u = n ? {
        rows: a(o.rows, i.rows, r[0]),
        cols: a(o.cols, i.cols, r[1], !0)
      } : a(o, i, r);
      this.last = u, this.numItemsInViewport = i, this.d_numToleratedItems = r, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var d;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(t.step ? t.step : u, ((d = t.items) === null || d === void 0 ? void 0 : d.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), o = t.isHorizontal(), s = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var i = [ne(t.element), le(t.element)], r = i[0], a = i[1];
          (n || o) && (t.element.style.width = r < t.defaultWidth ? r + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || s) && (t.element.style.height = a < t.defaultHeight ? a + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, s = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(s ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), o = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), s = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), i = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: s,
          bottom: i,
          x: n + o,
          y: s + i
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
        var n = this.isBoth(), o = this.isHorizontal(), s = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || s.offsetWidth, "px"), r = this.scrollHeight || "".concat(this.element.offsetHeight || s.offsetHeight, "px"), a = function(d, h) {
          return t.element.style[d] = h;
        };
        n || o ? (a("height", r), a("width", i)) : a("height", r);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), i = this.getContentPosition(), r = function(u, d, h) {
          var g = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = be(be({}, t.spacerStyle), yt({}, "".concat(u), (d || []).length * h + g + "px"));
        };
        o ? (r("height", n, this.itemSize[0], i.y), r("width", this.columns || n[1], this.itemSize[1], i.x)) : s ? r("width", this.columns || n, this.itemSize, i.x) : r("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), s = this.isHorizontal(), i = t ? t.first : this.first, r = function(h, g) {
          return h * g;
        }, a = function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = be(be({}, n.contentStyle), {
            transform: "translate3d(".concat(h, "px, ").concat(g, "px, 0)")
          });
        };
        if (o)
          a(r(i.cols, this.itemSize[1]), r(i.rows, this.itemSize[0]));
        else {
          var u = r(i, this.itemSize);
          s ? a(u, 0) : a(0, u);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, o = t.target, s = this.isBoth(), i = this.isHorizontal(), r = this.getContentPosition(), a = function(F, H) {
        return F ? F > H ? F - H : F : 0;
      }, u = function(F, H) {
        return Math.floor(F / (H || F));
      }, d = function(F, H, he, $e, W, oe) {
        return F <= W ? W : oe ? he - $e - W : H + W - 1;
      }, h = function(F, H, he, $e, W, oe, Le, St) {
        if (F <= oe) return 0;
        var Ve = Math.max(0, Le ? F < H ? he : F - oe : F > H ? he : F - 2 * oe), qe = n.getLast(Ve, St);
        return Ve > qe ? qe - W : Ve;
      }, g = function(F, H, he, $e, W, oe) {
        var Le = H + $e + 2 * W;
        return F >= W && (Le += W + 1), n.getLast(Le, oe);
      }, y = a(o.scrollTop, r.top), b = a(o.scrollLeft, r.left), w = s ? {
        rows: 0,
        cols: 0
      } : 0, P = this.last, k = !1, I = this.lastScrollPos;
      if (s) {
        var L = this.lastScrollPos.top <= y, E = this.lastScrollPos.left <= b;
        if (!this.appendOnly || this.appendOnly && (L || E)) {
          var T = {
            rows: u(y, this.itemSize[0]),
            cols: u(b, this.itemSize[1])
          }, te = {
            rows: d(T.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], L),
            cols: d(T.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], E)
          };
          w = {
            rows: h(T.rows, te.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], L),
            cols: h(T.cols, te.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], E, !0)
          }, P = {
            rows: g(T.rows, w.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: g(T.cols, w.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, k = w.rows !== this.first.rows || P.rows !== this.last.rows || w.cols !== this.first.cols || P.cols !== this.last.cols || this.isRangeChanged, I = {
            top: y,
            left: b
          };
        }
      } else {
        var D = i ? b : y, A = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && A) {
          var x = u(D, this.itemSize), J = d(x, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, A);
          w = h(x, J, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, A), P = g(x, w, this.last, this.numItemsInViewport, this.d_numToleratedItems), k = w !== this.first || P !== this.last || this.isRangeChanged, I = D;
        }
      }
      return {
        first: w,
        last: P,
        isRangeChanged: k,
        scrollPos: I
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), o = n.first, s = n.last, i = n.isRangeChanged, r = n.scrollPos;
      if (i) {
        var a = {
          first: o,
          last: s
        };
        if (this.setContentPosition(a), this.first = o, this.last = s, this.lastScrollPos = r, this.$emit("scroll-index-change", a), this.lazy && this.isPageChanged(o)) {
          var u, d, h = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : s, ((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0)
          }, g = this.lazyLoadState.first !== h.first || this.lazyLoadState.last !== h.last;
          g && this.$emit("lazy-load", h), this.lazyLoadState = h;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(t), s = o.isRangeChanged, i = s || (this.step ? this.isPageChanged() : !1);
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
          var n = t.isBoth(), o = t.isVertical(), s = t.isHorizontal(), i = [ne(t.element), le(t.element)], r = i[0], a = i[1], u = r !== t.defaultWidth, d = a !== t.defaultHeight, h = n ? u || d : s ? u : o ? d : !1;
          h && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = r, t.defaultHeight = a, t.defaultContentWidth = ne(t.content), t.defaultContentHeight = le(t.content), t.init());
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
      return be({
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
      this.content = t || this.content || pe(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: st
  }
}, Zi = ["tabindex"];
function Yi(e, t, n, o, s, i) {
  var r = j("SpinnerIcon");
  return e.disabled ? (l(), f(V, {
    key: 1
  }, [$(e.$slots, "default"), $(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: i.loadedColumns
  })], 64)) : (l(), f("div", v({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, e.ptmi("root")), [$(e.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: s.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: e.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: s.spacerStyle,
    contentStyle: s.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [p("div", v({
      ref: i.contentRef,
      class: i.contentClass,
      style: s.contentStyle
    }, e.ptm("content")), [(l(!0), f(V, null, Y(i.loadedItems, function(a, u) {
      return $(e.$slots, "item", {
        key: u,
        item: a,
        options: i.getOptions(u)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (l(), f("div", v({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: s.spacerStyle
  }, e.ptm("spacer")), null, 16)) : O("", !0), !e.loaderDisabled && e.showLoader && s.d_loading ? (l(), f("div", v({
    key: 1,
    class: i.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (l(!0), f(V, {
    key: 0
  }, Y(s.loaderArr, function(a, u) {
    return $(e.$slots, "loader", {
      key: u,
      options: i.getLoaderOptions(u, i.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : O("", !0), $(e.$slots, "loadingicon", {}, function() {
    return [m(r, v({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : O("", !0)], 16, Zi));
}
wt.render = Yi;
var Ji = `
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
`, Qi = {
  root: function(t) {
    var n = t.instance, o = t.props, s = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": s.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": s.focused || s.overlayVisible,
      "p-select-open": s.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(t) {
    var n, o = t.instance, s = t.props;
    return ["p-select-label", {
      "p-placeholder": !s.editable && o.label === s.placeholder,
      "p-select-label-empty": !s.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = t.instance, o = t.props, s = t.state, i = t.option, r = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": s.focusedOptionIndex === r,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Xi = R.extend({
  name: "select",
  style: Ji,
  classes: Qi
}), eo = {
  name: "BaseSelect",
  extends: Xt,
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
  style: Xi,
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
function to(e) {
  return so(e) || oo(e) || io(e) || no();
}
function no() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function io(e, t) {
  if (e) {
    if (typeof e == "string") return Ne(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ne(e, t) : void 0;
  }
}
function oo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function so(e) {
  if (Array.isArray(e)) return Ne(e);
}
function Ne(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Xe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function et(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Xe(Object(n), !0).forEach(function(o) {
      se(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Xe(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function se(e, t, n) {
  return (t = ro(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ro(e) {
  var t = ao(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function ao(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Oe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var It = {
  name: "Select",
  extends: eo,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Fe.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? q(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? q(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? q(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, o, s) {
      return this.ptm(s, {
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
      return this.optionDisabled ? q(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return q(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return q(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && G(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && G(n.$refs.focusInput);
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
        var o, s;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (o = (s = n.formField).onBlur) === null || o === void 0 || o.call(s, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Wt())
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
          !o && Gt(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && G(n.$refs.filterInput.$el);
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
      var n = t.relatedTarget === this.$refs.focusInput ? Ut(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      G(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? _t(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      G(n);
    },
    onOptionSelect: function(t, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var s = this.getOptionValue(n);
        this.updateModel(t, s), o && this.hide(!0);
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
      un.emit("overlay-click", {
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
          var s = o.value.length;
          o.setSelectionRange(s, s), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (G(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Fe.set("overlay", t, this.$primevue.config.zIndex.overlay), Nt(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && G(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && G(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Fe.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Ht(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = nt(this.$el) + "px", jt(this.overlay, this.$el));
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
      this.scrollHandler || (this.scrollHandler = new ln(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Rt() && t.hide();
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
          G(t.$refs.focusInput);
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
      return Dt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return Ye(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, o = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(s) {
        return n.isValidOption(s);
      }) : -1;
      return o > -1 ? o + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, o = t > 0 ? Ye(this.visibleOptions.slice(0, t), function(s) {
        return n.isValidOption(s);
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
      var s = -1, i = !1;
      return ue(this.searchValue) && (s = this.visibleOptions.findIndex(function(r) {
        return o.isOptionExactMatched(r);
      }), s === -1 && (s = this.visibleOptions.findIndex(function(r) {
        return o.isOptionStartsWith(r);
      })), s !== -1 && (i = !0), s === -1 && this.focusedOptionIndex === -1 && (s = this.findFirstFocusedOptionIndex()), s !== -1 && this.changeFocusedOptionIndex(t, s)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, s = pe(t.list, 'li[id="'.concat(o, '"]'));
        s ? s.scrollIntoView && s.scrollIntoView({
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
      return (t || []).reduce(function(o, s, i) {
        o.push({
          optionGroup: s,
          group: !0,
          index: i
        });
        var r = n.getOptionGroupChildren(s);
        return r && r.forEach(function(a) {
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
        var o = Et.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var s = this.options || [], i = [];
          return s.forEach(function(r) {
            var a = t.getOptionGroupChildren(r), u = a.filter(function(d) {
              return o.includes(d);
            });
            u.length > 0 && i.push(et(et({}, r), {}, se({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", to(u))));
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
      return Q(se({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Q(se(se({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Q(se({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Q(se({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: Ce
  },
  components: {
    InputText: rt,
    VirtualScroller: wt,
    Portal: Kt,
    InputIcon: gt,
    IconField: mt,
    TimesIcon: Mt,
    ChevronDownIcon: bt,
    SpinnerIcon: st,
    SearchIcon: vt,
    CheckIcon: ht,
    BlankIcon: ft
  }
}, lo = ["id", "data-p"], uo = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], co = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], po = ["data-p"], fo = ["id"], ho = ["id"], bo = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function vo(e, t, n, o, s, i) {
  var r = j("SpinnerIcon"), a = j("InputText"), u = j("SearchIcon"), d = j("InputIcon"), h = j("IconField"), g = j("CheckIcon"), y = j("BlankIcon"), b = j("VirtualScroller"), w = j("Portal"), P = Be("ripple");
  return l(), f("div", v({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, e.ptmi("root")), [e.editable ? (l(), f("input", v({
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
    "aria-expanded": s.overlayVisible,
    "aria-controls": s.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
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
  }, e.ptm("label")), null, 16, uo)) : (l(), f("span", v({
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
    "aria-expanded": s.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
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
  }, e.ptm("label")), [$(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var k;
    return [N(S(i.label === "p-emptylabel" ? " " : (k = i.label) !== null && k !== void 0 ? k : "empty"), 1)];
  })], 16, co)), i.isClearIconVisible ? $(e.$slots, "clearicon", {
    key: 2,
    class: Z(e.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(l(), z(re(e.clearIcon ? "i" : "TimesIcon"), v({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: i.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : O("", !0), p("div", v({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? $(e.$slots, "loadingicon", {
    key: 0,
    class: Z(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (l(), f("span", v({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (l(), z(r, v({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : $(e.$slots, "dropdownicon", {
    key: 1,
    class: Z(e.cx("dropdownIcon"))
  }, function() {
    return [(l(), z(re(e.dropdownIcon ? "span" : "ChevronDownIcon"), v({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), m(w, {
    appendTo: e.appendTo
  }, {
    default: C(function() {
      return [m(Lt, v({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: C(function() {
          return [s.overlayVisible ? (l(), f("div", v({
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
          }, e.ptm("overlay")), [p("span", v({
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
          }), null, 16), $(e.$slots, "header", {
            value: e.d_value,
            options: i.visibleOptions
          }), e.filter ? (l(), f("div", v({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [m(h, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: C(function() {
              return [m(a, {
                ref: "filterInput",
                type: "text",
                value: s.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: Z(e.cx("pcFilter")),
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
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), m(d, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: C(function() {
                  return [$(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (l(), f("span", v({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (l(), z(u, Tt(v({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), p("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), S(i.filterResultMessageText), 17)], 16)) : O("", !0), p("div", v({
            class: e.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [m(b, v({
            ref: i.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), tt({
            content: C(function(k) {
              var I = k.styleClass, L = k.contentRef, E = k.items, T = k.getItemOptions, te = k.contentStyle, D = k.itemSize;
              return [p("ul", v({
                ref: function(x) {
                  return i.listRef(x, L);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), I],
                style: te,
                role: "listbox"
              }, e.ptm("list")), [(l(!0), f(V, null, Y(E, function(A, x) {
                return l(), f(V, {
                  key: i.getOptionRenderKey(A, i.getOptionIndex(x, T))
                }, [i.isOptionGroup(A) ? (l(), f("li", v({
                  key: 0,
                  id: e.$id + "_" + i.getOptionIndex(x, T),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [$(e.$slots, "optiongroup", {
                  option: A.optionGroup,
                  index: i.getOptionIndex(x, T)
                }, function() {
                  return [p("span", v({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), S(i.getOptionGroupLabel(A.optionGroup)), 17)];
                })], 16, ho)) : ce((l(), f("li", v({
                  key: 1,
                  id: e.$id + "_" + i.getOptionIndex(x, T),
                  class: e.cx("option", {
                    option: A,
                    focusedOption: i.getOptionIndex(x, T)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(A),
                  "aria-selected": i.isSelected(A),
                  "aria-disabled": i.isOptionDisabled(A),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(x, T)),
                  onMousedown: function(U) {
                    return i.onOptionSelect(U, A);
                  },
                  onMousemove: function(U) {
                    return i.onOptionMouseMove(U, i.getOptionIndex(x, T));
                  },
                  onClick: t[8] || (t[8] = zt(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && i.isSelected(A),
                  "data-p-focused": s.focusedOptionIndex === i.getOptionIndex(x, T),
                  "data-p-disabled": i.isOptionDisabled(A)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(A, T, x, "option")), [e.checkmark ? (l(), f(V, {
                  key: 0
                }, [i.isSelected(A) ? (l(), z(g, v({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (l(), z(y, v({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : O("", !0), $(e.$slots, "option", {
                  option: A,
                  selected: i.isSelected(A),
                  index: i.getOptionIndex(x, T)
                }, function() {
                  return [p("span", v({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), S(i.getOptionLabel(A)), 17)];
                })], 16, bo)), [[P]])], 64);
              }), 128)), s.filterValue && (!E || E && E.length === 0) ? (l(), f("li", v({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [$(e.$slots, "emptyfilter", {}, function() {
                return [N(S(i.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (l(), f("li", v({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [$(e.$slots, "empty", {}, function() {
                return [N(S(i.emptyMessageText), 1)];
              })], 16)) : O("", !0)], 16, fo)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: C(function(k) {
              var I = k.options;
              return [$(e.$slots, "loader", {
                options: I
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), $(e.$slots, "footer", {
            value: e.d_value,
            options: i.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (l(), f("span", v({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), S(i.emptyMessageText), 17)) : O("", !0), p("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), S(i.selectedMessageText), 17), p("span", v({
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
          }), null, 16)], 16, po)) : O("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, lo);
}
It.render = vo;
var mo = `
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
`, go = {
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
}, yo = R.extend({
  name: "togglebutton",
  style: mo,
  classes: go
}), wo = {
  name: "BaseToggleButton",
  extends: it,
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
  style: yo,
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
function Io(e, t, n) {
  return (t = ko(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ko(e) {
  var t = Oo(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Oo(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Se(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kt = {
  name: "ToggleButton",
  extends: wo,
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
      return Q(Io({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: Ce
  }
}, So = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Co = ["data-p"];
function $o(e, t, n, o, s, i) {
  var r = Be("ripple");
  return ce((l(), f("button", v({
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
  }), [p("span", v({
    class: e.cx("content")
  }, i.getPTOptions("content"), {
    "data-p": i.dataP
  }), [$(e.$slots, "default", {}, function() {
    return [$(e.$slots, "icon", {
      value: e.d_value,
      class: Z(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (l(), f("span", v({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, i.getPTOptions("icon")), null, 16)) : O("", !0)];
    }), p("span", v({
      class: e.cx("label")
    }, i.getPTOptions("label")), S(i.label), 17)];
  })], 16, Co)], 16, So)), [[r]]);
}
kt.render = $o;
var Lo = `
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
`, To = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, zo = R.extend({
  name: "selectbutton",
  style: Lo,
  classes: To
}), Ao = {
  name: "BaseSelectButton",
  extends: it,
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
  style: zo,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function xo(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Ot(e)) || t) {
      n && (e = n);
      var o = 0, s = function() {
      };
      return { s, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(d) {
        throw d;
      }, f: s };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, r = !0, a = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return r = d.done, d;
  }, e: function(d) {
    a = !0, i = d;
  }, f: function() {
    try {
      r || n.return == null || n.return();
    } finally {
      if (a) throw i;
    }
  } };
}
function Bo(e) {
  return Fo(e) || Vo(e) || Ot(e) || Po();
}
function Po() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ot(e, t) {
  if (e) {
    if (typeof e == "string") return _e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _e(e, t) : void 0;
  }
}
function Vo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Fo(e) {
  if (Array.isArray(e)) return _e(e);
}
function _e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var Ge = {
  name: "SelectButton",
  extends: Ao,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? q(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? q(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? q(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? q(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, o) {
      var s = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var i = this.isSelected(n), r = this.getOptionValue(n), a;
        if (this.multiple)
          if (i) {
            if (a = this.d_value.filter(function(u) {
              return !de(u, r, s.equalityKey);
            }), !this.allowEmpty && a.length === 0) return;
          } else
            a = this.d_value ? [].concat(Bo(this.d_value), [r]) : [r];
        else {
          if (i && !this.allowEmpty) return;
          a = i ? null : r;
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
          var s = xo(this.d_value), i;
          try {
            for (s.s(); !(i = s.n()).done; ) {
              var r = i.value;
              if (de(r, o, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (a) {
            s.e(a);
          } finally {
            s.f();
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
      return Q({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: Ce
  },
  components: {
    ToggleButton: kt
  }
}, Mo = ["aria-labelledby", "data-p"];
function Ko(e, t, n, o, s, i) {
  var r = j("ToggleButton");
  return l(), f("div", v({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": i.dataP
  }), [(l(!0), f(V, null, Y(e.options, function(a, u) {
    return l(), z(r, {
      key: i.getOptionRenderKey(a),
      modelValue: i.isSelected(a),
      onLabel: i.getOptionLabel(a),
      offLabel: i.getOptionLabel(a),
      disabled: e.disabled || i.isOptionDisabled(a),
      unstyled: e.unstyled,
      size: e.size,
      readonly: i.isOptionReadonly(a),
      onChange: function(h) {
        return i.onOptionSelect(h, a, u);
      },
      pt: e.ptm("pcToggleButton")
    }, tt({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: C(function() {
        return [$(e.$slots, "option", {
          option: a,
          index: u
        }, function() {
          return [p("span", v({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), S(i.getOptionLabel(a)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Mo);
}
Ge.render = Ko;
const Eo = { class: "mm-panel" }, Do = { class: "mm-panel-b" }, Ro = { class: "mm-field" }, Ho = ["selected"], jo = { class: "mm-field" }, No = { class: "mm-field" }, _o = { class: "mm-actions" }, Uo = /* @__PURE__ */ ae({
  __name: "AgentRuleForm",
  props: {
    memory: {}
  },
  emits: ["done"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ot(["identity", "rule", "skill", "lesson"]), i = B("rule"), r = B(""), a = B(""), u = B(""), d = qt("wc-agent-picker");
    function h(y) {
      const b = Zt(y).selected;
      r.value = String((Array.isArray(b) ? b : [])[0] || "");
    }
    async function g() {
      const y = u.value.trim();
      await n.memory.act(() => _.post(`${n.memory.base.value}/items`, {
        kind: i.value,
        scope_family: "agent",
        scope_id: r.value,
        key: a.value.trim() || y,
        content: y
      })) && o("done");
    }
    return (y, b) => (l(), f("div", Eo, [
      b[8] || (b[8] = p("div", { class: "mm-panel-h" }, "Add agent memory", -1)),
      p("div", Do, [
        b[7] || (b[7] = p("span", { class: "mm-hint" }, "Identity and rules are part of the agent's instructions in every conversation.", -1)),
        m(c(Ge), {
          modelValue: i.value,
          "onUpdate:modelValue": b[0] || (b[0] = (w) => i.value = w),
          options: c(s),
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Kind"
        }, null, 8, ["modelValue", "options"]),
        p("div", Ro, [
          b[4] || (b[4] = p("span", {
            id: "rule_agent",
            class: "mm-label"
          }, "Agent", -1)),
          c(d).ready.value ? (l(), f("wc-agent-picker", {
            key: 0,
            "aria-labelledby": "rule_agent",
            multi: "false",
            placeholder: "Pick the agent",
            selected: r.value ? JSON.stringify([r.value]) : "[]",
            onChange: h
          }, null, 40, Ho)) : c(d).failed.value ? (l(), z(c(We), {
            key: 1,
            severity: "error",
            size: "small"
          }, {
            default: C(() => [
              N("The agent picker could not load: " + S(c(d).failed.value), 1)
            ]),
            _: 1
          })) : O("", !0)
        ]),
        p("div", jo, [
          b[5] || (b[5] = p("label", {
            class: "mm-label",
            for: "rule_topic"
          }, "Topic", -1)),
          m(c(rt), {
            id: "rule_topic",
            modelValue: a.value,
            "onUpdate:modelValue": b[1] || (b[1] = (w) => a.value = w),
            placeholder: "e.g. tone"
          }, null, 8, ["modelValue"])
        ]),
        p("div", No, [
          b[6] || (b[6] = p("label", {
            class: "mm-label",
            for: "rule_text"
          }, "Text", -1)),
          m(c(at), {
            id: "rule_text",
            modelValue: u.value,
            "onUpdate:modelValue": b[2] || (b[2] = (w) => u.value = w),
            "auto-resize": "",
            placeholder: "e.g. Answer in short bullet points."
          }, null, 8, ["modelValue"])
        ]),
        p("div", _o, [
          m(c(M), {
            label: "Add",
            size: "small",
            disabled: e.memory.busy.value || !u.value.trim() || !r.value,
            onClick: g
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:plus" })
            ]),
            _: 1
          }, 8, ["disabled"]),
          m(c(M), {
            label: "Cancel",
            size: "small",
            severity: "secondary",
            text: "",
            onClick: b[3] || (b[3] = (w) => o("done"))
          })
        ])
      ])
    ]));
  }
}), Wo = { class: "mm-panel" }, Go = { class: "mm-panel-h" }, qo = { class: "mm-panel-b" }, Zo = { class: "mm-actions" }, Yo = {
  key: 1,
  class: "mm-row-t"
}, Jo = { class: "mm-dl" }, Qo = { class: "mm-actions" }, Xo = { class: "mm-actions mm-confirm" }, es = {
  key: 3,
  class: "mm-hint"
}, ts = /* @__PURE__ */ ae({
  __name: "MemoryDetail",
  props: {
    memory: {},
    item: {}
  },
  emits: ["replaced"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = B(n.item), i = B([]), r = B([]), a = B(""), u = B(!1), d = ie(() => `${n.memory.base.value}/items/${encodeURIComponent(n.item.id)}`), h = ie(() => (s.value.kind === "identity" || s.value.kind === "rule") && s.value.status === "current");
    async function g() {
      a.value = "", u.value = !1, s.value.id !== n.item.id && (s.value = n.item);
      try {
        const { data: k } = await _.get(d.value);
        if (!ge(k)) return;
        ge(k.item) && (s.value = k.item), i.value = Array.isArray(k.versions) ? k.versions : [], r.value = Array.isArray(k.provenance) ? k.provenance : [];
      } catch (k) {
        n.memory.error.value = Ae(k);
      }
    }
    Pe([() => n.item.id, n.memory.revision], () => {
      g();
    }, { immediate: !0 });
    function y() {
      n.memory.act(() => _.post(`${d.value}/forget`, {}));
    }
    function b() {
      n.memory.act(() => _.post(`${d.value}/archive`, {}));
    }
    function w() {
      n.memory.act(() => _.post(`${d.value}/restore`, {}));
    }
    function P() {
      const k = a.value.trim();
      k && n.memory.act(async () => {
        const { data: I } = await _.put(d.value, { content: k });
        ge(I) && typeof I.item_id == "string" && o("replaced", { ...s.value, id: I.item_id });
      });
    }
    return (k, I) => (l(), f("div", Wo, [
      p("div", Go, [
        p("span", null, S(c(Ue)[s.value.kind]) + " · " + S(s.value.key), 1),
        m(c(X), {
          class: "kx-tag-sm",
          severity: c(Ee)(s.value.status),
          value: s.value.status
        }, null, 8, ["severity", "value"])
      ]),
      p("div", qo, [
        a.value ? (l(), f(V, { key: 0 }, [
          m(c(at), {
            modelValue: a.value,
            "onUpdate:modelValue": I[0] || (I[0] = (L) => a.value = L),
            "auto-resize": "",
            "aria-label": "Memory text"
          }, null, 8, ["modelValue"]),
          p("div", Zo, [
            m(c(M), {
              label: "Save new version",
              size: "small",
              disabled: e.memory.busy.value,
              onClick: P
            }, {
              icon: C(() => [
                m(c(K), { icon: "tabler:check" })
              ]),
              _: 1
            }, 8, ["disabled"]),
            m(c(M), {
              label: "Cancel",
              size: "small",
              severity: "secondary",
              text: "",
              onClick: I[1] || (I[1] = (L) => a.value = "")
            })
          ])
        ], 64)) : (l(), f("div", Yo, S(s.value.content), 1)),
        p("dl", Jo, [
          I[6] || (I[6] = p("dt", null, "About", -1)),
          p("dd", null, S(s.value.scope_family === "agent" ? `agent ${s.value.scope_id}` : "the person who said it"), 1),
          I[7] || (I[7] = p("dt", null, "True since", -1)),
          p("dd", null, S(c(ye)(s.value.valid_at)), 1),
          s.value.invalid_at ? (l(), f(V, { key: 0 }, [
            I[5] || (I[5] = p("dt", null, "Until", -1)),
            p("dd", null, S(c(ye)(s.value.invalid_at)), 1)
          ], 64)) : O("", !0),
          I[8] || (I[8] = p("dt", null, "Learned", -1)),
          p("dd", null, S(c(ye)(s.value.recorded_at)) + " · " + S(s.value.source), 1)
        ]),
        p("div", Qo, [
          h.value && !a.value ? (l(), z(c(M), {
            key: 0,
            label: "Edit",
            size: "small",
            severity: "secondary",
            outlined: "",
            onClick: I[2] || (I[2] = (L) => a.value = s.value.content)
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:pencil" })
            ]),
            _: 1
          })) : O("", !0),
          s.value.status === "current" || s.value.status === "conflict" ? (l(), z(c(M), {
            key: 1,
            label: "Archive",
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: b
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:archive" })
            ]),
            _: 1
          }, 8, ["disabled"])) : O("", !0),
          s.value.status === "archived" ? (l(), z(c(M), {
            key: 2,
            label: "Restore",
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: w
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:restore" })
            ]),
            _: 1
          }, 8, ["disabled"])) : O("", !0),
          s.value.status !== "forgotten" && !u.value ? (l(), z(c(M), {
            key: 3,
            label: "Forget",
            size: "small",
            severity: "danger",
            outlined: "",
            disabled: e.memory.busy.value,
            onClick: I[3] || (I[3] = (L) => u.value = !0)
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:trash" })
            ]),
            _: 1
          }, 8, ["disabled"])) : O("", !0)
        ]),
        u.value ? (l(), z(c(We), {
          key: 2,
          severity: "warn",
          size: "small"
        }, {
          default: C(() => [
            I[9] || (I[9] = N(" Forget erases this memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)),
            p("div", Xo, [
              m(c(M), {
                label: "Forget for good",
                size: "small",
                severity: "danger",
                disabled: e.memory.busy.value,
                onClick: y
              }, null, 8, ["disabled"]),
              m(c(M), {
                label: "Cancel",
                size: "small",
                severity: "secondary",
                text: "",
                onClick: I[4] || (I[4] = (L) => u.value = !1)
              })
            ])
          ]),
          _: 1
        })) : O("", !0),
        I[10] || (I[10] = p("p", { class: "mm-h" }, "Versions", -1)),
        (l(!0), f(V, null, Y(i.value, (L) => (l(), f("div", {
          key: L.id,
          class: Z(["mm-version", { past: L.status !== "current" }])
        }, [
          m(c(X), {
            class: "kx-tag-sm",
            severity: c(Ee)(L.status),
            value: `v${L.version}`
          }, null, 8, ["severity", "value"]),
          p("span", null, S(L.content), 1)
        ], 2))), 128)),
        I[11] || (I[11] = p("p", { class: "mm-h" }, "Seen in", -1)),
        r.value.length ? O("", !0) : (l(), f("span", es, "Added by a person or by consolidation.")),
        (l(!0), f(V, null, Y(r.value, (L) => (l(), f("span", {
          key: L.host_kind + L.host_id + L.event_id,
          class: "mm-hint"
        }, S(L.host_kind) + " " + S(L.host_id) + " · message " + S(L.event_id), 1))), 128))
      ])
    ]));
  }
}), ns = { class: "mm-filters" }, is = { class: "mm-panel" }, os = {
  key: 0,
  class: "kx-loading"
}, ss = {
  key: 1,
  class: "kx-empty"
}, rs = { class: "kx-empty-ico" }, as = ["onClick"], ls = { class: "mm-row-t" }, us = { class: "mm-row-s" }, ds = /* @__PURE__ */ ae({
  __name: "MemoryList",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = ot(), o = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier versions" },
      { value: "archived", label: "Archived" }
    ], s = B("current"), i = B(null), r = B([]), a = B(!0), u = B(null), d = B(!1);
    async function h() {
      const y = new URLSearchParams({ limit: "200", status: s.value });
      i.value && y.set("kind", i.value);
      try {
        const { data: b } = await _.get(`${t.memory.base.value}/items?${y.toString()}`);
        r.value = ge(b) && Array.isArray(b.items) ? b.items : [];
      } catch (b) {
        t.memory.error.value = Ae(b);
      } finally {
        a.value = !1;
      }
    }
    Pe([s, i, t.memory.revision], () => {
      h();
    }, { immediate: !0 });
    function g(y) {
      d.value = !1, u.value = y;
    }
    return (y, b) => (l(), f(V, null, [
      p("div", ns, [
        m(c(Ge), {
          modelValue: s.value,
          "onUpdate:modelValue": b[0] || (b[0] = (w) => s.value = w),
          options: o,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Status"
        }, null, 8, ["modelValue"]),
        m(c(It), {
          modelValue: i.value,
          "onUpdate:modelValue": b[1] || (b[1] = (w) => i.value = w),
          options: c(n),
          "option-label": "label",
          "option-value": "value",
          size: "small",
          placeholder: "All kinds",
          "show-clear": "",
          "aria-label": "Kind"
        }, null, 8, ["modelValue", "options"]),
        d.value ? O("", !0) : (l(), z(c(M), {
          key: 0,
          label: "Add agent memory",
          size: "small",
          severity: "secondary",
          outlined: "",
          onClick: b[2] || (b[2] = (w) => {
            d.value = !0, u.value = null;
          })
        }, {
          icon: C(() => [
            m(c(K), { icon: "tabler:plus" })
          ]),
          _: 1
        }))
      ]),
      p("div", {
        class: Z(["mm-split", { solo: !d.value && !u.value }])
      }, [
        p("div", is, [
          a.value ? (l(), f("div", os, [
            m(c(K), {
              icon: "tabler:loader-2",
              class: "spin"
            }),
            b[5] || (b[5] = N("Loading memories", -1))
          ])) : r.value.length ? (l(!0), f(V, { key: 2 }, Y(r.value, (w) => (l(), f("button", {
            key: w.id,
            class: Z(["mm-row", { on: u.value?.id === w.id }]),
            onClick: (P) => g(w)
          }, [
            p("span", null, [
              p("span", ls, S(w.content), 1),
              p("span", us, [
                m(c(X), {
                  class: "kx-tag-sm",
                  severity: "secondary",
                  value: c(Ue)[w.kind]
                }, null, 8, ["value"]),
                p("span", null, S(w.scope_family === "agent" ? "agent" : "person") + " · " + S(w.key) + " · v" + S(w.version), 1)
              ])
            ])
          ], 10, as))), 128)) : (l(), f("div", ss, [
            p("span", rs, [
              m(c(K), { icon: "tabler:brain" })
            ]),
            b[6] || (b[6] = p("p", { class: "kx-empty-title" }, "Nothing here yet", -1)),
            b[7] || (b[7] = p("p", { class: "kx-empty-sub" }, "Memories appear as agents talk with people, or add the agent's identity and rules yourself.", -1))
          ]))
        ]),
        d.value ? (l(), z(Uo, {
          key: 0,
          memory: e.memory,
          onDone: b[3] || (b[3] = (w) => d.value = !1)
        }, null, 8, ["memory"])) : u.value ? (l(), z(ts, {
          key: 1,
          memory: e.memory,
          item: u.value,
          onReplaced: b[4] || (b[4] = (w) => u.value = w)
        }, null, 8, ["memory", "item"])) : O("", !0)
      ], 2)
    ], 64));
  }
});
function cs(e, t) {
  return { ...e, ...t };
}
function ps(e, t) {
  return { ...e, ...t };
}
const fs = { class: "mm-panel" }, hs = { class: "mm-panel-b" }, bs = { class: "mm-actions" }, vs = {
  key: 0,
  class: "mm-hint"
}, ms = /* @__PURE__ */ ae({
  __name: "MemorySettings",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = B({}), o = B(!1), s = ie(() => t.memory.status.value?.config || {}), i = ie(() => ({ ...cs(t.memory.status.value?.defaults || {}, s.value), ...n.value })), r = ie(() => Object.keys(n.value).length > 0);
    Pe(() => t.memory.kbId.value, () => {
      n.value = {};
    });
    function a(d) {
      const h = {};
      for (const [g, y] of Object.entries(d))
        (y !== i.value[g] || g in n.value) && (h[g] = y);
      n.value = { ...n.value, ...h }, o.value = !1;
    }
    async function u() {
      const d = ps(s.value, n.value);
      await t.memory.act(() => _.put(`/api/v1/knowledge/${encodeURIComponent(t.memory.kbId.value)}`, { config: d })) && (n.value = {}, o.value = !0);
    }
    return (d, h) => (l(), f("div", fs, [
      p("div", hs, [
        e.memory.status.value ? (l(), z(en, {
          key: 0,
          "model-value": i.value,
          schema: e.memory.status.value.config_schema,
          "onUpdate:modelValue": a
        }, null, 8, ["model-value", "schema"])) : O("", !0),
        p("div", bs, [
          m(c(M), {
            label: "Save settings",
            size: "small",
            disabled: e.memory.busy.value || !r.value,
            onClick: u
          }, {
            icon: C(() => [
              m(c(K), { icon: "tabler:device-floppy" })
            ]),
            _: 1
          }, 8, ["disabled"]),
          o.value ? (l(), f("span", vs, "Saved.")) : O("", !0)
        ])
      ])
    ]));
  }
}), gs = { class: "mm-panel" }, ys = {
  key: 0,
  class: "kx-empty"
}, ws = { class: "kx-empty-ico" }, Is = { class: "mm-row-t" }, ks = { class: "mm-row-s" }, Os = { key: 0 }, Ss = { key: 1 }, Cs = { key: 2 }, $s = {
  key: 0,
  class: "mm-row-s mm-row-err"
}, Ls = /* @__PURE__ */ ae({
  __name: "RunList",
  props: {
    runs: {}
  },
  setup(e) {
    function t(n) {
      return n.run_type === "consolidate" ? "Consolidation" : n.run_type === "reembed" ? "Re-embedding" : n.host_kind === "content" ? "Learned from content" : "Learned from a conversation";
    }
    return (n, o) => (l(), f("div", gs, [
      e.runs.length ? O("", !0) : (l(), f("div", ys, [
        p("span", ws, [
          m(c(K), { icon: "tabler:activity" })
        ]),
        o[0] || (o[0] = p("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        o[1] || (o[1] = p("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, the run shows here.", -1))
      ])),
      (l(!0), f(V, null, Y(e.runs, (s) => (l(), f("div", {
        key: s.id,
        class: "mm-row"
      }, [
        p("span", null, [
          p("span", Is, S(t(s)), 1),
          p("span", ks, [
            p("span", null, S(c(ye)(s.finished_at || s.started_at || s.created_at)), 1),
            s.stats?.added ? (l(), f("span", Os, "+" + S(s.stats.added) + " new", 1)) : O("", !0),
            s.stats?.superseded ? (l(), f("span", Ss, S(s.stats.superseded) + " updated", 1)) : O("", !0),
            s.stats?.conflicted ? (l(), f("span", Cs, S(s.stats.conflicted) + " contested", 1)) : O("", !0)
          ]),
          s.last_error ? (l(), f("span", $s, S(s.last_error), 1)) : O("", !0)
        ]),
        s.status !== "succeeded" ? (l(), z(c(X), {
          key: 0,
          class: "kx-tag-sm",
          severity: c(Ee)(s.status),
          value: s.status
        }, null, 8, ["severity", "value"])) : O("", !0)
      ]))), 128))
    ]));
  }
}), Ts = { class: "mm-page" }, zs = /* @__PURE__ */ ae({
  __name: "MemoryManage",
  setup(e) {
    const t = Yt(), n = ii(ie(() => String(Jt(t.value.config).kb_id || ""))), o = B("memories"), s = ie(() => (n.status.value?.runs || []).filter((i) => i.status === "failed").length);
    return (i, r) => (l(), f("div", Ts, [
      m(c(pt), {
        value: o.value,
        "onUpdate:value": r[0] || (r[0] = (a) => o.value = a)
      }, {
        default: C(() => [
          m(c(dt), null, {
            default: C(() => [
              m(c(ve), { value: "memories" }, {
                default: C(() => [
                  r[1] || (r[1] = N("Memories ", -1)),
                  c(n).status.value ? (l(), z(c(X), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "secondary",
                    value: String(c(n).status.value.counts.current)
                  }, null, 8, ["value"])) : O("", !0)
                ]),
                _: 1
              }),
              m(c(ve), { value: "conflicts" }, {
                default: C(() => [
                  r[2] || (r[2] = N("Conflicts ", -1)),
                  c(n).conflicts.value.length ? (l(), z(c(X), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "warn",
                    value: String(c(n).conflicts.value.length)
                  }, null, 8, ["value"])) : O("", !0)
                ]),
                _: 1
              }),
              m(c(ve), { value: "activity" }, {
                default: C(() => [
                  r[3] || (r[3] = N("Activity ", -1)),
                  s.value ? (l(), z(c(X), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "danger",
                    value: `${s.value} failed`
                  }, null, 8, ["value"])) : O("", !0)
                ]),
                _: 1
              }),
              m(c(ve), { value: "settings" }, {
                default: C(() => [...r[4] || (r[4] = [
                  N("Settings", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          }),
          c(n).error.value ? (l(), z(c(We), {
            key: 0,
            severity: "error",
            class: "mm-error"
          }, {
            default: C(() => [
              N(S(c(n).error.value), 1)
            ]),
            _: 1
          })) : O("", !0),
          m(c(ct), null, {
            default: C(() => [
              m(c(me), { value: "memories" }, {
                default: C(() => [
                  m(ds, { memory: c(n) }, null, 8, ["memory"])
                ]),
                _: 1
              }),
              m(c(me), { value: "conflicts" }, {
                default: C(() => [
                  m(di, { memory: c(n) }, null, 8, ["memory"])
                ]),
                _: 1
              }),
              m(c(me), { value: "activity" }, {
                default: C(() => [
                  m(Ls, {
                    runs: c(n).status.value?.runs || []
                  }, null, 8, ["runs"])
                ]),
                _: 1
              }),
              m(c(me), { value: "settings" }, {
                default: C(() => [
                  m(ms, { memory: c(n) }, null, 8, ["memory"])
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
}), As = Qt(zs, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
xt(import.meta.url, As);
//# sourceMappingURL=memory_kb.js.map
