import { openBlock as u, createElementBlock as h, mergeProps as b, createElementVNode as c, renderSlot as C, resolveComponent as Z, Fragment as j, renderList as X, createCommentVNode as S, createVNode as y, resolveDirective as Ee, createTextVNode as oe, toDisplayString as k, normalizeClass as te, createBlock as B, resolveDynamicComponent as ue, withCtx as $, Transition as Ft, normalizeProps as Mt, createSlots as lt, withDirectives as me, withModifiers as Kt, vShow as Et, defineComponent as Dt, computed as Oe, ref as E, watch as et, onUnmounted as Rt, onMounted as Ht, unref as m } from "vue";
import { Icon as G } from "@iconify/vue";
import { on as jt, loadByTagName as Nt, api as Y, define as _t } from "@wippy-fe/proxy";
import { A as Ut, c as Wt, d as we, B as q, e as ae, z as ye, f as Ke, R as re, T as be, g as Gt, h as qt, i as Be, j as se, k as ve, F as Zt, M as tt, l as ge, n as Yt, o as Q, Y as Jt, I as Qt, v as dt, D as Xt, S as en, L as tn, p as nn, $ as on, J as sn, q as ee, r as ut, Q as Pe, C as an, K as Fe, V as nt, u as rn, t as ln, s as dn, m as un } from "./index-0-zpYODo.js";
import { s as ct, b as pt, c as cn, K as fe, e as Me, d as J, f as it, a as pn, i as he } from "./memoryTypes-B2QaFCPR.js";
function fn() {
  let t = [], e = (a, d, l = 999) => {
    let v = s(a, d, l), g = v.value + (v.key === a ? 0 : l) + 1;
    return t.push({ key: a, value: g }), g;
  }, n = (a) => {
    t = t.filter((d) => d.value !== a);
  }, o = (a, d) => s(a).value, s = (a, d, l = 0) => [...t].reverse().find((v) => !0) || { key: a, value: l }, i = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: i, set: (a, d, l) => {
    d && (d.style.zIndex = String(e(a, !0, l)));
  }, clear: (a) => {
    a && (n(i(a)), a.style.zIndex = "");
  }, getCurrent: (a) => o(a) };
}
var Ne = fn();
function $e(t) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, $e(t);
}
function hn(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function bn(t, e) {
  for (var n = 0; n < e.length; n++) {
    var o = e[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, gn(o.key), o);
  }
}
function vn(t, e, n) {
  return e && bn(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function gn(t) {
  var e = mn(t, "string");
  return $e(e) == "symbol" ? e : e + "";
}
function mn(t, e) {
  if ($e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if ($e(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var yn = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    hn(this, t), this.element = e, this.listener = n;
  }
  return vn(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Ut(this.element);
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
})(), wn = Wt(), ft = {
  name: "BlankIcon",
  extends: we
};
function In(t) {
  return Cn(t) || Sn(t) || On(t) || kn();
}
function kn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function On(t, e) {
  if (t) {
    if (typeof t == "string") return _e(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _e(t, e) : void 0;
  }
}
function Sn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Cn(t) {
  if (Array.isArray(t)) return _e(t);
}
function _e(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ln(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), In(e[0] || (e[0] = [c("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
ft.render = Ln;
var ht = {
  name: "CheckIcon",
  extends: we
};
function $n(t) {
  return xn(t) || An(t) || zn(t) || Tn();
}
function Tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zn(t, e) {
  if (t) {
    if (typeof t == "string") return Ue(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ue(t, e) : void 0;
  }
}
function An(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xn(t) {
  if (Array.isArray(t)) return Ue(t);
}
function Ue(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Bn(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), $n(e[0] || (e[0] = [c("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ht.render = Bn;
var bt = {
  name: "ChevronDownIcon",
  extends: we
};
function Vn(t) {
  return Kn(t) || Mn(t) || Fn(t) || Pn();
}
function Pn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fn(t, e) {
  if (t) {
    if (typeof t == "string") return We(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? We(t, e) : void 0;
  }
}
function Mn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Kn(t) {
  if (Array.isArray(t)) return We(t);
}
function We(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function En(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Vn(e[0] || (e[0] = [c("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
bt.render = En;
var vt = {
  name: "SearchIcon",
  extends: we
};
function Dn(t) {
  return Nn(t) || jn(t) || Hn(t) || Rn();
}
function Rn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hn(t, e) {
  if (t) {
    if (typeof t == "string") return Ge(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ge(t, e) : void 0;
  }
}
function jn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Nn(t) {
  if (Array.isArray(t)) return Ge(t);
}
function Ge(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function _n(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Dn(e[0] || (e[0] = [c("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
vt.render = _n;
var Un = `
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
`, Wn = {
  root: "p-iconfield"
}, Gn = q.extend({
  name: "iconfield",
  style: Un,
  classes: Wn
}), qn = {
  name: "BaseIconField",
  extends: ae,
  style: Gn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, gt = {
  name: "IconField",
  extends: qn,
  inheritAttrs: !1
};
function Zn(t, e, n, o, s, i) {
  return u(), h("div", b({
    class: t.cx("root")
  }, t.ptmi("root")), [C(t.$slots, "default")], 16);
}
gt.render = Zn;
var Yn = {
  root: "p-inputicon"
}, Jn = q.extend({
  name: "inputicon",
  classes: Yn
}), Qn = {
  name: "BaseInputIcon",
  extends: ae,
  style: Jn,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, mt = {
  name: "InputIcon",
  extends: Qn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Xn(t, e, n, o, s, i) {
  return u(), h("span", b({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [C(t.$slots, "default")], 16);
}
mt.render = Xn;
var ei = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, ti = `
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
`, ot = q.extend({
  name: "virtualscroller",
  css: ti,
  style: ei
}), ni = {
  name: "BaseVirtualScroller",
  extends: ae,
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
  style: ot,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    ot.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function st(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Se(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? st(Object(n), !0).forEach(function(o) {
      yt(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : st(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function yt(t, e, n) {
  return (e = ii(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ii(t) {
  var e = oi(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function oi(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Te(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wt = {
  name: "VirtualScroller",
  extends: ni,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
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
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
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
      Ke(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = re(this.element), this.defaultHeight = be(this.element), this.defaultContentWidth = re(this.content), this.defaultContentHeight = be(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", s = this.isBoth(), i = this.isHorizontal(), a = s ? e.every(function(L) {
        return L > -1;
      }) : e > -1;
      if (a) {
        var d = this.first, l = this.element, v = l.scrollTop, g = v === void 0 ? 0 : v, I = l.scrollLeft, O = I === void 0 ? 0 : I, A = this.calculateNumItems(), V = A.numToleratedItems, M = this.getContentPosition(), T = this.itemSize, P = function() {
          var z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, _ = arguments.length > 1 ? arguments[1] : void 0;
          return z <= _ ? 0 : z;
        }, K = function(z, _, U) {
          return z * _ + U;
        }, F = function() {
          var z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: z,
            top: _,
            behavior: o
          });
        }, w = s ? {
          rows: 0,
          cols: 0
        } : 0, D = !1, R = !1;
        s ? (w = {
          rows: P(e[0], V[0]),
          cols: P(e[1], V[1])
        }, F(K(w.cols, T[1], M.left), K(w.rows, T[0], M.top)), R = this.lastScrollPos.top !== g || this.lastScrollPos.left !== O, D = w.rows !== d.rows || w.cols !== d.cols) : (w = P(e, V), i ? F(K(w, T, M.left), g) : F(O, K(w, T, M.top)), R = this.lastScrollPos !== (i ? O : g), D = w !== d), this.isRangeChanged = D, R && (this.first = w);
      }
    },
    scrollInView: function(e, n) {
      var o = this, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), a = this.isHorizontal(), d = i ? e.every(function(T) {
          return T > -1;
        }) : e > -1;
        if (d) {
          var l = this.getRenderedRange(), v = l.first, g = l.viewport, I = function() {
            var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, K = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: P,
              top: K,
              behavior: s
            });
          }, O = n === "to-start", A = n === "to-end";
          if (O) {
            if (i)
              g.first.rows - v.rows > e[0] ? I(g.first.cols * this.itemSize[1], (g.first.rows - 1) * this.itemSize[0]) : g.first.cols - v.cols > e[1] && I((g.first.cols - 1) * this.itemSize[1], g.first.rows * this.itemSize[0]);
            else if (g.first - v > e) {
              var V = (g.first - 1) * this.itemSize;
              a ? I(V, 0) : I(0, V);
            }
          } else if (A) {
            if (i)
              g.last.rows - v.rows <= e[0] + 1 ? I(g.first.cols * this.itemSize[1], (g.first.rows + 1) * this.itemSize[0]) : g.last.cols - v.cols <= e[1] + 1 && I((g.first.cols + 1) * this.itemSize[1], g.first.rows * this.itemSize[0]);
            else if (g.last - v <= e + 1) {
              var M = (g.first + 1) * this.itemSize;
              a ? I(M, 0) : I(0, M);
            }
          }
        }
      } else
        this.scrollToIndex(e, s);
    },
    getRenderedRange: function() {
      var e = function(I, O) {
        return Math.floor(I / (O || I));
      }, n = this.first, o = 0;
      if (this.element) {
        var s = this.isBoth(), i = this.isHorizontal(), a = this.element, d = a.scrollTop, l = a.scrollLeft;
        if (s)
          n = {
            rows: e(d, this.itemSize[0]),
            cols: e(l, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var v = i ? l : d;
          n = e(v, this.itemSize), o = n + this.numItemsInViewport;
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
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, s = this.getContentPosition(), i = this.element ? this.element.offsetWidth - s.left : 0, a = this.element ? this.element.offsetHeight - s.top : 0, d = function(O, A) {
        return Math.ceil(O / (A || O));
      }, l = function(O) {
        return Math.ceil(O / 2);
      }, v = e ? {
        rows: d(a, o[0]),
        cols: d(i, o[1])
      } : d(n ? i : a, o), g = this.d_numToleratedItems || (e ? [l(v.rows), l(v.cols)] : l(v));
      return {
        numItemsInViewport: v,
        numToleratedItems: g
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, s = this.calculateNumItems(), i = s.numItemsInViewport, a = s.numToleratedItems, d = function(g, I, O) {
        var A = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(g + I + (g < O ? 2 : 3) * O, A);
      }, l = n ? {
        rows: d(o.rows, i.rows, a[0]),
        cols: d(o.cols, i.cols, a[1], !0)
      } : d(o, i, a);
      this.last = l, this.numItemsInViewport = i, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var v;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : l, ((v = e.items) === null || v === void 0 ? void 0 : v.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), s = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [re(e.element), be(e.element)], a = i[0], d = i[1];
          (n || o) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || s) && (e.element.style.height = d < e.defaultHeight ? d + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, s = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(s ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), s = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
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
      var e = this;
      if (this.element) {
        var n = this.isBoth(), o = this.isHorizontal(), s = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || s.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || s.offsetHeight, "px"), d = function(v, g) {
          return e.element.style[v] = g;
        };
        n || o ? (d("height", a), d("width", i)) : d("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), i = this.getContentPosition(), a = function(l, v, g) {
          var I = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Se(Se({}, e.spacerStyle), yt({}, "".concat(l), (v || []).length * g + I + "px"));
        };
        o ? (a("height", n, this.itemSize[0], i.y), a("width", this.columns || n[1], this.itemSize[1], i.x)) : s ? a("width", this.columns || n, this.itemSize, i.x) : a("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), s = this.isHorizontal(), i = e ? e.first : this.first, a = function(g, I) {
          return g * I;
        }, d = function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Se(Se({}, n.contentStyle), {
            transform: "translate3d(".concat(g, "px, ").concat(I, "px, 0)")
          });
        };
        if (o)
          d(a(i.cols, this.itemSize[1]), a(i.rows, this.itemSize[0]));
        else {
          var l = a(i, this.itemSize);
          s ? d(l, 0) : d(0, l);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, s = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), d = function(x, N) {
        return x ? x > N ? x - N : x : 0;
      }, l = function(x, N) {
        return Math.floor(x / (N || x));
      }, v = function(x, N, W, le, H, ne) {
        return x <= H ? H : ne ? W - le - H : N + H - 1;
      }, g = function(x, N, W, le, H, ne, ce, De) {
        if (x <= ne) return 0;
        var Ie = Math.max(0, ce ? x < N ? W : x - ne : x > N ? W : x - 2 * ne), Ve = n.getLast(Ie, De);
        return Ie > Ve ? Ve - H : Ie;
      }, I = function(x, N, W, le, H, ne) {
        var ce = N + le + 2 * H;
        return x >= H && (ce += H + 1), n.getLast(ce, ne);
      }, O = d(o.scrollTop, a.top), A = d(o.scrollLeft, a.left), V = s ? {
        rows: 0,
        cols: 0
      } : 0, M = this.last, T = !1, P = this.lastScrollPos;
      if (s) {
        var K = this.lastScrollPos.top <= O, F = this.lastScrollPos.left <= A;
        if (!this.appendOnly || this.appendOnly && (K || F)) {
          var w = {
            rows: l(O, this.itemSize[0]),
            cols: l(A, this.itemSize[1])
          }, D = {
            rows: v(w.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], K),
            cols: v(w.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], F)
          };
          V = {
            rows: g(w.rows, D.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], K),
            cols: g(w.cols, D.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], F, !0)
          }, M = {
            rows: I(w.rows, V.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: I(w.cols, V.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, T = V.rows !== this.first.rows || M.rows !== this.last.rows || V.cols !== this.first.cols || M.cols !== this.last.cols || this.isRangeChanged, P = {
            top: O,
            left: A
          };
        }
      } else {
        var R = i ? A : O, L = this.lastScrollPos <= R;
        if (!this.appendOnly || this.appendOnly && L) {
          var z = l(R, this.itemSize), _ = v(z, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, L);
          V = g(z, _, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, L), M = I(z, V, this.last, this.numItemsInViewport, this.d_numToleratedItems), T = V !== this.first || M !== this.last || this.isRangeChanged, P = R;
        }
      }
      return {
        first: V,
        last: M,
        isRangeChanged: T,
        scrollPos: P
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, s = n.last, i = n.isRangeChanged, a = n.scrollPos;
      if (i) {
        var d = {
          first: o,
          last: s
        };
        if (this.setContentPosition(d), this.first = o, this.last = s, this.lastScrollPos = a, this.$emit("scroll-index-change", d), this.lazy && this.isPageChanged(o)) {
          var l, v, g = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((l = this.items) === null || l === void 0 ? void 0 : l.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : s, ((v = this.items) === null || v === void 0 ? void 0 : v.length) || 0)
          }, I = this.lazyLoadState.first !== g.first || this.lazyLoadState.last !== g.last;
          I && this.$emit("lazy-load", g), this.lazyLoadState = g;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), s = o.isRangeChanged, i = s || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (Ke(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), s = e.isHorizontal(), i = [re(e.element), be(e.element)], a = i[0], d = i[1], l = a !== e.defaultWidth, v = d !== e.defaultHeight, g = n ? l || v : s ? l : o ? v : !1;
          g && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = d, e.defaultContentWidth = re(e.content), e.defaultContentHeight = be(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return Se({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || ye(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
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
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: ct
  }
}, si = ["tabindex"];
function ai(t, e, n, o, s, i) {
  var a = Z("SpinnerIcon");
  return t.disabled ? (u(), h(j, {
    key: 1
  }, [C(t.$slots, "default"), C(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (u(), h("div", b({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [C(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: s.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: s.spacerStyle,
    contentStyle: s.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [c("div", b({
      ref: i.contentRef,
      class: i.contentClass,
      style: s.contentStyle
    }, t.ptm("content")), [(u(!0), h(j, null, X(i.loadedItems, function(d, l) {
      return C(t.$slots, "item", {
        key: l,
        item: d,
        options: i.getOptions(l)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (u(), h("div", b({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: s.spacerStyle
  }, t.ptm("spacer")), null, 16)) : S("", !0), !t.loaderDisabled && t.showLoader && s.d_loading ? (u(), h("div", b({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (u(!0), h(j, {
    key: 0
  }, X(s.loaderArr, function(d, l) {
    return C(t.$slots, "loader", {
      key: l,
      options: i.getLoaderOptions(l, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : S("", !0), C(t.$slots, "loadingicon", {}, function() {
    return [y(a, b({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : S("", !0)], 16, si));
}
wt.render = ai;
var ri = `
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
`, li = {
  root: function(e) {
    var n = e.instance, o = e.props, s = e.state;
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
  label: function(e) {
    var n, o = e.instance, s = e.props;
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
  option: function(e) {
    var n = e.instance, o = e.props, s = e.state, i = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": s.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, di = q.extend({
  name: "select",
  style: ri,
  classes: li
}), ui = {
  name: "BaseSelect",
  extends: cn,
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
  style: di,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function ze(t) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ze(t);
}
function ci(t) {
  return bi(t) || hi(t) || fi(t) || pi();
}
function pi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fi(t, e) {
  if (t) {
    if (typeof t == "string") return qe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qe(t, e) : void 0;
  }
}
function hi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function bi(t) {
  if (Array.isArray(t)) return qe(t);
}
function qe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function at(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function rt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? at(Object(n), !0).forEach(function(o) {
      de(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : at(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function de(t, e, n) {
  return (e = vi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function vi(t) {
  var e = gi(t, "string");
  return ze(e) == "symbol" ? e : e + "";
}
function gi(t, e) {
  if (ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var It = {
  name: "Select",
  extends: ui,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Ne.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? ee(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? ee(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? ee(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, o, s) {
      return this.ptm(s, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? ee(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return ee(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return ee(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && Q(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && Q(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, s;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (s = n.formField).onBlur) === null || o === void 0 || o.call(s, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (on())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var o = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !o && sn(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && Q(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && ve(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? nn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Q(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? tn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Q(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var s = this.getOptionValue(n);
        this.updateModel(e, s), o && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      wn.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var s = o.value.length;
          o.setSelectionRange(s, s), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (Q(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      Ne.set("overlay", e, this.$primevue.config.zIndex.overlay), en(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Q(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Q(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      Ne.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Qt(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = dt(this.$el) + "px", Xt(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new yn(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Jt() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Ke(n) && (this.labelClickListener = function() {
          Q(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Ke(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Yt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return ve(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return ge(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return tt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(s) {
        return n.isValidOption(s);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? tt(this.visibleOptions.slice(0, e), function(s) {
        return n.isValidOption(s);
      }) : -1;
      return o > -1 ? o : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var s = -1, i = !1;
      return ve(this.searchValue) && (s = this.visibleOptions.findIndex(function(a) {
        return o.isOptionExactMatched(a);
      }), s === -1 && (s = this.visibleOptions.findIndex(function(a) {
        return o.isOptionStartsWith(a);
      })), s !== -1 && (i = !0), s === -1 && this.focusedOptionIndex === -1 && (s = this.findFirstFocusedOptionIndex()), s !== -1 && this.changeFocusedOptionIndex(e, s)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, s = ye(e.list, 'li[id="'.concat(o, '"]'));
        s ? s.scrollIntoView && s.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(o, s, i) {
        o.push({
          optionGroup: s,
          group: !0,
          index: i
        });
        var a = n.getOptionGroupChildren(s);
        return a && a.forEach(function(d) {
          return o.push(d);
        }), o;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var o = Zt.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var s = this.options || [], i = [];
          return s.forEach(function(a) {
            var d = e.getOptionGroupChildren(a), l = d.filter(function(v) {
              return o.includes(v);
            });
            l.length > 0 && i.push(rt(rt({}, a), {}, de({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", ci(l))));
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
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return ve(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return se(de({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return se(de(de({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return se(de({}, this.size, this.size));
    },
    overlayDataP: function() {
      return se(de({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: Be
  },
  components: {
    InputText: pt,
    VirtualScroller: wt,
    Portal: qt,
    InputIcon: mt,
    IconField: gt,
    TimesIcon: Gt,
    ChevronDownIcon: bt,
    SpinnerIcon: ct,
    SearchIcon: vt,
    CheckIcon: ht,
    BlankIcon: ft
  }
}, mi = ["id", "data-p"], yi = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], wi = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Ii = ["data-p"], ki = ["id"], Oi = ["id"], Si = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Ci(t, e, n, o, s, i) {
  var a = Z("SpinnerIcon"), d = Z("InputText"), l = Z("SearchIcon"), v = Z("InputIcon"), g = Z("IconField"), I = Z("CheckIcon"), O = Z("BlankIcon"), A = Z("VirtualScroller"), V = Z("Portal"), M = Ee("ripple");
  return u(), h("div", b({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (u(), h("input", b({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: i.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": s.overlayVisible,
    "aria-controls": s.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), null, 16, yi)) : (u(), h("span", b({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": s.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), [C(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var T;
    return [oe(k(i.label === "p-emptylabel" ? " " : (T = i.label) !== null && T !== void 0 ? T : "empty"), 1)];
  })], 16, wi)), i.isClearIconVisible ? C(t.$slots, "clearicon", {
    key: 2,
    class: te(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(u(), B(ue(t.clearIcon ? "i" : "TimesIcon"), b({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : S("", !0), c("div", b({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? C(t.$slots, "loadingicon", {
    key: 0,
    class: te(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (u(), h("span", b({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (u(), B(a, b({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : C(t.$slots, "dropdownicon", {
    key: 1,
    class: te(t.cx("dropdownIcon"))
  }, function() {
    return [(u(), B(ue(t.dropdownIcon ? "span" : "ChevronDownIcon"), b({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), y(V, {
    appendTo: t.appendTo
  }, {
    default: $(function() {
      return [y(Ft, b({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: $(function() {
          return [s.overlayVisible ? (u(), h("div", b({
            key: 0,
            ref: i.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, t.ptm("overlay")), [c("span", b({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), C(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (u(), h("div", b({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [y(g, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: $(function() {
              return [y(d, {
                ref: "filterInput",
                type: "text",
                value: s.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: te(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), y(v, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: $(function() {
                  return [C(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (u(), h("span", b({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (u(), B(l, Mt(b({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), c("span", b({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), k(i.filterResultMessageText), 17)], 16)) : S("", !0), c("div", b({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [y(A, b({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), lt({
            content: $(function(T) {
              var P = T.styleClass, K = T.contentRef, F = T.items, w = T.getItemOptions, D = T.contentStyle, R = T.itemSize;
              return [c("ul", b({
                ref: function(z) {
                  return i.listRef(z, K);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), P],
                style: D,
                role: "listbox"
              }, t.ptm("list")), [(u(!0), h(j, null, X(F, function(L, z) {
                return u(), h(j, {
                  key: i.getOptionRenderKey(L, i.getOptionIndex(z, w))
                }, [i.isOptionGroup(L) ? (u(), h("li", b({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(z, w),
                  style: {
                    height: R ? R + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [C(t.$slots, "optiongroup", {
                  option: L.optionGroup,
                  index: i.getOptionIndex(z, w)
                }, function() {
                  return [c("span", b({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), k(i.getOptionGroupLabel(L.optionGroup)), 17)];
                })], 16, Oi)) : me((u(), h("li", b({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(z, w),
                  class: t.cx("option", {
                    option: L,
                    focusedOption: i.getOptionIndex(z, w)
                  }),
                  style: {
                    height: R ? R + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(L),
                  "aria-selected": i.isSelected(L),
                  "aria-disabled": i.isOptionDisabled(L),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(z, w)),
                  onMousedown: function(U) {
                    return i.onOptionSelect(U, L);
                  },
                  onMousemove: function(U) {
                    return i.onOptionMouseMove(U, i.getOptionIndex(z, w));
                  },
                  onClick: e[8] || (e[8] = Kt(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(L),
                  "data-p-focused": s.focusedOptionIndex === i.getOptionIndex(z, w),
                  "data-p-disabled": i.isOptionDisabled(L)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(L, w, z, "option")), [t.checkmark ? (u(), h(j, {
                  key: 0
                }, [i.isSelected(L) ? (u(), B(I, b({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (u(), B(O, b({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : S("", !0), C(t.$slots, "option", {
                  option: L,
                  selected: i.isSelected(L),
                  index: i.getOptionIndex(z, w)
                }, function() {
                  return [c("span", b({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), k(i.getOptionLabel(L)), 17)];
                })], 16, Si)), [[M]])], 64);
              }), 128)), s.filterValue && (!F || F && F.length === 0) ? (u(), h("li", b({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [C(t.$slots, "emptyfilter", {}, function() {
                return [oe(k(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (u(), h("li", b({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [C(t.$slots, "empty", {}, function() {
                return [oe(k(i.emptyMessageText), 1)];
              })], 16)) : S("", !0)], 16, ki)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: $(function(T) {
              var P = T.options;
              return [C(t.$slots, "loader", {
                options: P
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), C(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (u(), h("span", b({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), k(i.emptyMessageText), 17)) : S("", !0), c("span", b({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), k(i.selectedMessageText), 17), c("span", b({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Ii)) : S("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, mi);
}
It.render = Ci;
var Li = `
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
`, $i = {
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
}, Ti = q.extend({
  name: "togglebutton",
  style: Li,
  classes: $i
}), zi = {
  name: "BaseToggleButton",
  extends: ut,
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
  style: Ti,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function Ae(t) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ae(t);
}
function Ai(t, e, n) {
  return (e = xi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function xi(t) {
  var e = Bi(t, "string");
  return Ae(e) == "symbol" ? e : e + "";
}
function Bi(t, e) {
  if (Ae(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var kt = {
  name: "ToggleButton",
  extends: zi,
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
      return ve(this.onLabel) && ve(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return se(Ai({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: Be
  }
}, Vi = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Pi = ["data-p"];
function Fi(t, e, n, o, s, i) {
  var a = Ee("ripple");
  return me((u(), h("button", b({
    type: "button",
    class: t.cx("root"),
    tabindex: t.tabindex,
    disabled: t.disabled,
    "aria-pressed": t.d_value,
    onClick: e[0] || (e[0] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    })
  }, i.getPTOptions("root"), {
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "data-p-checked": i.active,
    "data-p-disabled": t.disabled,
    "data-p": i.dataP
  }), [c("span", b({
    class: t.cx("content")
  }, i.getPTOptions("content"), {
    "data-p": i.dataP
  }), [C(t.$slots, "default", {}, function() {
    return [C(t.$slots, "icon", {
      value: t.d_value,
      class: te(t.cx("icon"))
    }, function() {
      return [t.onIcon || t.offIcon ? (u(), h("span", b({
        key: 0,
        class: [t.cx("icon"), t.d_value ? t.onIcon : t.offIcon]
      }, i.getPTOptions("icon")), null, 16)) : S("", !0)];
    }), c("span", b({
      class: t.cx("label")
    }, i.getPTOptions("label")), k(i.label), 17)];
  })], 16, Pi)], 16, Vi)), [[a]]);
}
kt.render = Fi;
var Mi = `
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
`, Ki = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, Ei = q.extend({
  name: "selectbutton",
  style: Mi,
  classes: Ki
}), Di = {
  name: "BaseSelectButton",
  extends: ut,
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
  style: Ei,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Ri(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Ot(t)) || e) {
      n && (t = n);
      var o = 0, s = function() {
      };
      return { s, n: function() {
        return o >= t.length ? { done: !0 } : { done: !1, value: t[o++] };
      }, e: function(v) {
        throw v;
      }, f: s };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, a = !0, d = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var v = n.next();
    return a = v.done, v;
  }, e: function(v) {
    d = !0, i = v;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (d) throw i;
    }
  } };
}
function Hi(t) {
  return _i(t) || Ni(t) || Ot(t) || ji();
}
function ji() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ot(t, e) {
  if (t) {
    if (typeof t == "string") return Ze(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(t, e) : void 0;
  }
}
function Ni(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function _i(t) {
  if (Array.isArray(t)) return Ze(t);
}
function Ze(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
var Ye = {
  name: "SelectButton",
  extends: Di,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(e) {
      return this.optionLabel ? ee(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? ee(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e) {
      return this.dataKey ? ee(e, this.dataKey) : this.getOptionLabel(e);
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? ee(e, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(e) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(e);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(e, n, o) {
      var s = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var i = this.isSelected(n), a = this.getOptionValue(n), d;
        if (this.multiple)
          if (i) {
            if (d = this.d_value.filter(function(l) {
              return !ge(l, a, s.equalityKey);
            }), !this.allowEmpty && d.length === 0) return;
          } else
            d = this.d_value ? [].concat(Hi(this.d_value), [a]) : [a];
        else {
          if (i && !this.allowEmpty) return;
          d = i ? null : a;
        }
        this.writeValue(d, e), this.$emit("change", {
          originalEvent: e,
          value: d
        });
      }
    },
    isSelected: function(e) {
      var n = !1, o = this.getOptionValue(e);
      if (this.multiple) {
        if (this.d_value) {
          var s = Ri(this.d_value), i;
          try {
            for (s.s(); !(i = s.n()).done; ) {
              var a = i.value;
              if (ge(a, o, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (d) {
            s.e(d);
          } finally {
            s.f();
          }
        }
      } else
        n = ge(this.d_value, o, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return se({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: Be
  },
  components: {
    ToggleButton: kt
  }
}, Ui = ["aria-labelledby", "data-p"];
function Wi(t, e, n, o, s, i) {
  var a = Z("ToggleButton");
  return u(), h("div", b({
    class: t.cx("root"),
    role: "group",
    "aria-labelledby": t.ariaLabelledby
  }, t.ptmi("root"), {
    "data-p": i.dataP
  }), [(u(!0), h(j, null, X(t.options, function(d, l) {
    return u(), B(a, {
      key: i.getOptionRenderKey(d),
      modelValue: i.isSelected(d),
      onLabel: i.getOptionLabel(d),
      offLabel: i.getOptionLabel(d),
      disabled: t.disabled || i.isOptionDisabled(d),
      unstyled: t.unstyled,
      size: t.size,
      readonly: i.isOptionReadonly(d),
      onChange: function(g) {
        return i.onOptionSelect(g, d, l);
      },
      pt: t.ptm("pcToggleButton")
    }, lt({
      _: 2
    }, [t.$slots.option ? {
      name: "default",
      fn: $(function() {
        return [C(t.$slots, "option", {
          option: d,
          index: l
        }, function() {
          return [c("span", b({
            ref_for: !0
          }, t.ptm("pcToggleButton").label), k(i.getOptionLabel(d)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Ui);
}
Ye.render = Wi;
var Gi = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": o.disabled
    }];
  }
}, qi = q.extend({
  name: "tab",
  classes: Gi
}), Zi = {
  name: "BaseTab",
  extends: ae,
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
  style: qi,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Ce = {
  name: "Tab",
  extends: Zi,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(e) {
      switch (e.code) {
        case "ArrowRight":
          this.onArrowRightKey(e);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(e);
          break;
        case "Home":
          this.onHomeKey(e);
          break;
        case "End":
          this.onEndKey(e);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(e);
          break;
      }
    },
    onArrowRightKey: function(e) {
      var n = this.findNextTab(e.currentTarget);
      n ? this.changeFocusedTab(e, n) : this.onHomeKey(e), e.preventDefault();
    },
    onArrowLeftKey: function(e) {
      var n = this.findPrevTab(e.currentTarget);
      n ? this.changeFocusedTab(e, n) : this.onEndKey(e), e.preventDefault();
    },
    onHomeKey: function(e) {
      var n = this.findFirstTab();
      this.changeFocusedTab(e, n), e.preventDefault();
    },
    onEndKey: function(e) {
      var n = this.findLastTab();
      this.changeFocusedTab(e, n), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.findLastTab()), e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(this.findFirstTab()), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.changeActiveValue();
    },
    findNextTab: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = n ? e : e.nextElementSibling;
      return o ? Pe(o, "data-p-disabled") || Pe(o, "data-pc-section") === "activebar" ? this.findNextTab(o) : ye(o, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = n ? e : e.previousElementSibling;
      return o ? Pe(o, "data-p-disabled") || Pe(o, "data-pc-section") === "activebar" ? this.findPrevTab(o) : ye(o, '[data-pc-name="tab"]') : null;
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
    changeFocusedTab: function(e, n) {
      Q(n), this.scrollInView(n);
    },
    scrollInView: function(e) {
      var n;
      e == null || (n = e.scrollIntoView) === null || n === void 0 || n.call(e, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var e;
      return ge((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.d_value, this.value);
    },
    id: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return b(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return se({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Be
  }
};
function Yi(t, e, n, o, s, i) {
  var a = Ee("ripple");
  return t.asChild ? C(t.$slots, "default", {
    key: 1,
    dataP: i.dataP,
    class: te(t.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs,
    onClick: i.onClick
  }) : me((u(), B(ue(t.as), b({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP,
    onClick: i.onClick
  }, i.attrs), {
    default: $(function() {
      return [C(t.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[a]]);
}
Ce.render = Yi;
var St = {
  name: "ChevronLeftIcon",
  extends: we
};
function Ji(t) {
  return to(t) || eo(t) || Xi(t) || Qi();
}
function Qi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xi(t, e) {
  if (t) {
    if (typeof t == "string") return Je(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Je(t, e) : void 0;
  }
}
function eo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function to(t) {
  if (Array.isArray(t)) return Je(t);
}
function Je(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function no(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ji(e[0] || (e[0] = [c("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
St.render = no;
var Ct = {
  name: "ChevronRightIcon",
  extends: we
};
function io(t) {
  return ro(t) || ao(t) || so(t) || oo();
}
function oo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function so(t, e) {
  if (t) {
    if (typeof t == "string") return Qe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(t, e) : void 0;
  }
}
function ao(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ro(t) {
  if (Array.isArray(t)) return Qe(t);
}
function Qe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function lo(t, e, n, o, s, i) {
  return u(), h("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), io(e[0] || (e[0] = [c("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ct.render = lo;
var uo = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, co = q.extend({
  name: "tablist",
  classes: uo
}), po = {
  name: "BaseTabList",
  extends: ae,
  props: {},
  style: co,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, Lt = {
  name: "TabList",
  extends: po,
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
    showNavigators: function(e) {
      e ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var e = this;
    setTimeout(function() {
      e.updateInkBar(), e.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(e) {
      this.showNavigators && this.updateButtonState(), e.preventDefault();
    },
    onPrevButtonClick: function() {
      var e = this.$refs.content, n = this.getVisibleButtonWidths(), o = re(e) - n, s = Math.abs(e.scrollLeft), i = o * 0.8, a = s - i, d = Math.max(a, 0);
      e.scrollLeft = nt(e) ? -1 * d : d;
    },
    onNextButtonClick: function() {
      var e = this.$refs.content, n = this.getVisibleButtonWidths(), o = re(e) - n, s = Math.abs(e.scrollLeft), i = o * 0.8, a = s + i, d = e.scrollWidth - o, l = Math.min(a, d);
      e.scrollLeft = nt(e) ? -1 * l : l;
    },
    bindResizeObserver: function() {
      var e = this;
      this.resizeObserver = new ResizeObserver(function() {
        return e.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var e;
      (e = this.resizeObserver) === null || e === void 0 || e.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var e = this;
      this.unbindInkBarObserver();
      var n = this.$refs.content, o = ye(n, '[data-pc-name="tab"][data-p-active="true"]');
      o && (this.inkBarObserver = new ResizeObserver(function() {
        return e.updateInkBar();
      }), this.inkBarObserver.observe(o));
    },
    unbindInkBarObserver: function() {
      var e;
      (e = this.inkBarObserver) === null || e === void 0 || e.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var e = this.$refs, n = e.content, o = e.inkbar, s = e.tabs;
      if (o) {
        var i = ye(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (o.style.height = an(i) + "px", o.style.top = Fe(i).top - Fe(s).top + "px") : (o.style.width = dt(i) + "px", o.style.left = Fe(i).left - Fe(s).left + "px");
      }
    },
    updateButtonState: function() {
      var e = this.$refs, n = e.list, o = e.content, s = o.scrollTop, i = o.scrollWidth, a = o.scrollHeight, d = o.offsetWidth, l = o.offsetHeight, v = Math.abs(o.scrollLeft), g = [re(o), be(o)], I = g[0], O = g[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = s !== 0, this.isNextButtonEnabled = n.offsetHeight >= l && parseInt(s) !== a - O) : (this.isPrevButtonEnabled = v !== 0, this.isNextButtonEnabled = n.offsetWidth >= d && parseInt(v) !== i - I);
    },
    getVisibleButtonWidths: function() {
      var e = this.$refs, n = e.prevButton, o = e.nextButton, s = 0;
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
      return se({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: St,
    ChevronRightIcon: Ct
  },
  directives: {
    ripple: Be
  }
}, fo = ["data-p"], ho = ["aria-label", "tabindex"], bo = ["data-p"], vo = ["aria-orientation"], go = ["aria-label", "tabindex"];
function mo(t, e, n, o, s, i) {
  var a = Ee("ripple");
  return u(), h("div", b({
    ref: "list",
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [i.showNavigators && s.isPrevButtonEnabled ? me((u(), h("button", b({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: t.cx("prevButton"),
    "aria-label": i.prevButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: e[0] || (e[0] = function() {
      return i.onPrevButtonClick && i.onPrevButtonClick.apply(i, arguments);
    })
  }, t.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(u(), B(ue(i.templates.previcon || "ChevronLeftIcon"), b({
    "aria-hidden": "true"
  }, t.ptm("prevIcon")), null, 16))], 16, ho)), [[a]]) : S("", !0), c("div", b({
    ref: "content",
    class: t.cx("content"),
    onScroll: e[1] || (e[1] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    }),
    "data-p": i.dataP
  }, t.ptm("content")), [c("div", b({
    ref: "tabs",
    class: t.cx("tabList"),
    role: "tablist",
    "aria-orientation": i.$pcTabs.orientation || "horizontal"
  }, t.ptm("tabList")), [C(t.$slots, "default"), c("span", b({
    ref: "inkbar",
    class: t.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, t.ptm("activeBar")), null, 16)], 16, vo)], 16, bo), i.showNavigators && s.isNextButtonEnabled ? me((u(), h("button", b({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: t.cx("nextButton"),
    "aria-label": i.nextButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: e[2] || (e[2] = function() {
      return i.onNextButtonClick && i.onNextButtonClick.apply(i, arguments);
    })
  }, t.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(u(), B(ue(i.templates.nexticon || "ChevronRightIcon"), b({
    "aria-hidden": "true"
  }, t.ptm("nextIcon")), null, 16))], 16, go)), [[a]]) : S("", !0)], 16, fo);
}
Lt.render = mo;
var yo = {
  root: function(e) {
    var n = e.instance;
    return ["p-tabpanel", {
      "p-tabpanel-active": n.active
    }];
  }
}, wo = q.extend({
  name: "tabpanel",
  classes: yo
}), Io = {
  name: "BaseTabPanel",
  extends: ae,
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
  style: wo,
  provide: function() {
    return {
      $pcTabPanel: this,
      $parentInstance: this
    };
  }
}, Le = {
  name: "TabPanel",
  extends: Io,
  inheritAttrs: !1,
  inject: ["$pcTabs"],
  computed: {
    active: function() {
      var e;
      return ge((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.d_value, this.value);
    },
    id: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tabpanel_").concat(this.value);
    },
    ariaLabelledby: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tab_").concat(this.value);
    },
    attrs: function() {
      return b(this.a11yAttrs, this.ptmi("root", this.ptParams));
    },
    a11yAttrs: function() {
      var e;
      return {
        id: this.id,
        tabindex: (e = this.$pcTabs) === null || e === void 0 ? void 0 : e.tabindex,
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
function ko(t, e, n, o, s, i) {
  var a, d;
  return i.$pcTabs ? (u(), h(j, {
    key: 1
  }, [t.asChild ? C(t.$slots, "default", {
    key: 1,
    class: te(t.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs
  }) : (u(), h(j, {
    key: 0
  }, [!((a = i.$pcTabs) !== null && a !== void 0 && a.lazy) || i.active ? me((u(), B(ue(t.as), b({
    key: 0,
    class: t.cx("root")
  }, i.attrs), {
    default: $(function() {
      return [C(t.$slots, "default")];
    }),
    _: 3
  }, 16, ["class"])), [[Et, (d = i.$pcTabs) !== null && d !== void 0 && d.lazy ? !0 : i.active]]) : S("", !0)], 64))], 64)) : C(t.$slots, "default", {
    key: 0
  });
}
Le.render = ko;
var Oo = {
  root: "p-tabpanels"
}, So = q.extend({
  name: "tabpanels",
  classes: Oo
}), Co = {
  name: "BaseTabPanels",
  extends: ae,
  props: {},
  style: So,
  provide: function() {
    return {
      $pcTabPanels: this,
      $parentInstance: this
    };
  }
}, $t = {
  name: "TabPanels",
  extends: Co,
  inheritAttrs: !1
};
function Lo(t, e, n, o, s, i) {
  return u(), h("div", b({
    class: t.cx("root"),
    role: "presentation"
  }, t.ptmi("root")), [C(t.$slots, "default")], 16);
}
$t.render = Lo;
var $o = `
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
`, To = {
  root: function(e) {
    var n = e.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, zo = q.extend({
  name: "tabs",
  style: $o,
  classes: To
}), Ao = {
  name: "BaseTabs",
  extends: ae,
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
  style: zo,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, Tt = {
  name: "Tabs",
  extends: Ao,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(e) {
      this.d_value = e;
    }
  },
  methods: {
    updateValue: function(e) {
      this.d_value !== e && (this.d_value = e, this.$emit("update:value", e));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function xo(t, e, n, o, s, i) {
  return u(), h("div", b({
    class: t.cx("root")
  }, t.ptmi("root")), [C(t.$slots, "default")], 16);
}
Tt.render = xo;
var Bo = `
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
`, Vo = {
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
}, Po = q.extend({
  name: "tag",
  style: Bo,
  classes: Vo
}), Fo = {
  name: "BaseTag",
  extends: ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Po,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function xe(t) {
  "@babel/helpers - typeof";
  return xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, xe(t);
}
function Mo(t, e, n) {
  return (e = Ko(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ko(t) {
  var e = Eo(t, "string");
  return xe(e) == "symbol" ? e : e + "";
}
function Eo(t, e) {
  if (xe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ie = {
  name: "Tag",
  extends: Fo,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return se(Mo({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Do = ["data-p"];
function Ro(t, e, n, o, s, i) {
  return u(), h("span", b({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (u(), B(ue(t.$slots.icon), b({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (u(), h("span", b({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : S("", !0), t.value != null || t.$slots.default ? C(t.$slots, "default", {
    key: 2
  }, function() {
    return [c("span", b({
      class: t.cx("label")
    }, t.ptm("label")), k(t.value), 17)];
  }) : S("", !0)], 16, Do);
}
ie.render = Ro;
const Ho = { class: "mm-page" }, jo = { class: "mm-filters" }, No = { class: "mm-panel" }, _o = {
  key: 0,
  class: "kx-loading"
}, Uo = {
  key: 1,
  class: "kx-empty"
}, Wo = { class: "kx-empty-ico" }, Go = ["onClick"], qo = { class: "mm-row-t" }, Zo = { class: "mm-row-s" }, Yo = {
  key: 0,
  class: "mm-panel"
}, Jo = { class: "mm-panel-b" }, Qo = { class: "mm-field" }, Xo = ["selected"], es = { class: "mm-field" }, ts = { class: "mm-field" }, ns = { class: "mm-actions" }, is = {
  key: 1,
  class: "mm-panel"
}, os = { class: "mm-panel-h" }, ss = { class: "mm-panel-b" }, as = { class: "mm-actions" }, rs = {
  key: 1,
  class: "mm-row-t"
}, ls = { class: "mm-dl" }, ds = { class: "mm-actions" }, us = {
  key: 2,
  class: "mm-hint"
}, cs = { class: "mm-panel" }, ps = {
  key: 0,
  class: "kx-empty"
}, fs = { class: "kx-empty-ico" }, hs = { class: "mm-row-t" }, bs = { class: "mm-row-s" }, vs = { class: "mm-panel" }, gs = {
  key: 0,
  class: "kx-empty"
}, ms = { class: "kx-empty-ico" }, ys = { class: "mm-row-t" }, ws = { class: "mm-row-s" }, Is = { key: 0 }, ks = { key: 1 }, Os = { key: 2 }, Ss = {
  key: 0,
  class: "mm-row-s mm-row-err"
}, Cs = { class: "mm-panel" }, Ls = { class: "mm-panel-b" }, $s = { class: "mm-actions" }, Ts = { class: "mm-hint" }, zs = /* @__PURE__ */ Dt({
  __name: "MemoryManage",
  setup(t) {
    const e = rn(), n = Oe(() => {
      const p = e.value.config;
      if (typeof p == "string")
        try {
          return String(JSON.parse(p).kb_id || "");
        } catch {
          return "";
        }
      return String(p?.kb_id || "");
    }), o = Oe(() => `/api/v1/memory/${encodeURIComponent(n.value)}`), s = E("memories"), i = E(null), a = E([]), d = E([]), l = E(null), v = E([]), g = E([]), I = E(!1), O = E(""), A = E(""), V = Object.keys(fe).map((p) => ({ value: p, label: fe[p] })), M = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier versions" },
      { value: "forgotten", label: "Forgotten" }
    ], T = ["identity", "rule", "skill", "lesson"].map((p) => ({ value: p, label: fe[p] })), P = E(null), K = E("current"), F = E(!1), w = E({ kind: "rule", scope_id: "", key: "", content: "" }), D = E(""), R = E({}), L = E("");
    async function z() {
      const { data: p } = await Y.get(`${o.value}/status`);
      i.value = p, R.value = { ...i.value?.config || {} };
    }
    async function _() {
      const p = new URLSearchParams({ limit: "200" });
      P.value && p.set("kind", P.value), K.value && p.set("status", K.value);
      const { data: r } = await Y.get(`${o.value}/items?${p.toString()}`);
      a.value = he(r) && Array.isArray(r.items) ? r.items : [], l.value && !a.value.some((f) => f.id === l.value?.id) && (l.value = null);
    }
    async function U() {
      const { data: p } = await Y.get(`${o.value}/conflicts`);
      d.value = he(p) && Array.isArray(p.groups) ? p.groups : [];
    }
    let x = 0;
    async function N() {
      if (!n.value) return;
      const p = ++x;
      I.value = !0;
      try {
        await Promise.all([z(), _(), U()]), l.value && await le(l.value), p === x && (O.value = "");
      } catch (r) {
        p === x && (O.value = Me(r));
      } finally {
        p === x && (I.value = !1);
      }
    }
    let W = null;
    et(n, (p) => {
      if (W && W(), W = null, !p) return;
      const r = jt(`component.${p}`, () => {
        N();
      });
      W = typeof r == "function" ? r : null;
    }, { immediate: !0 }), Rt(() => {
      W && W();
    }), ln(N), et([P, K], () => {
      _().catch((p) => {
        O.value = Me(p);
      });
    });
    async function le(p) {
      l.value = p, D.value = "";
      const { data: r } = await Y.get(`${o.value}/items/${encodeURIComponent(p.id)}`);
      he(r) && (he(r.item) && (l.value = r.item), v.value = Array.isArray(r.provenance) ? r.provenance : [], g.value = Array.isArray(r.versions) ? r.versions : []);
    }
    async function H(p, r) {
      A.value = p, O.value = "";
      try {
        await r(), await N();
      } catch (f) {
        O.value = Me(f);
      } finally {
        A.value = "";
      }
    }
    function ne(p) {
      H("forget", () => Y.post(`${o.value}/items/${encodeURIComponent(p.id)}/forget`, { reason: "forgotten in the memory page" }));
    }
    function ce(p) {
      H("restore", () => Y.post(`${o.value}/items/${encodeURIComponent(p.id)}/restore`, {}));
    }
    function De(p) {
      const r = D.value.trim();
      r && H("edit", async () => {
        const { data: f } = await Y.put(`${o.value}/items/${encodeURIComponent(p.id)}`, { content: r, value: r });
        he(f) && typeof f.item_id == "string" && (l.value = { ...p, id: f.item_id });
      });
    }
    function Ie() {
      const p = w.value;
      !p.content.trim() || !p.scope_id.trim() || H("create", async () => {
        await Y.post(`${o.value}/items`, {
          kind: p.kind,
          scope_family: "agent",
          scope_id: p.scope_id.trim(),
          key: p.key.trim() || p.content.trim(),
          content: p.content.trim()
        }), w.value = { ...p, key: "", content: "" }, F.value = !1;
      });
    }
    function Ve(p, r) {
      H("resolve", () => Y.post(`${o.value}/conflicts/${encodeURIComponent(p.group_id)}/resolve`, { winner_id: r.id }));
    }
    function zt() {
      H("settings", async () => {
        await Y.put(`/api/v1/knowledge/${encodeURIComponent(n.value)}`, { config: R.value }), L.value = "Saved.";
      });
    }
    const At = Oe(() => !!l.value && (l.value.kind === "identity" || l.value.kind === "rule") && l.value.status === "current"), Re = Oe(() => i.value?.runs || []), Xe = Oe(() => Re.value.filter((p) => p.status === "failed").length), xt = { current: "success", conflict: "warn", failed: "danger" };
    function He(p) {
      return xt[p] || "secondary";
    }
    function Bt(p) {
      return p.scope_family === "agent" ? "agent" : p.scope_family === "owner" ? "person" : p.scope_family;
    }
    function Vt(p) {
      return p.run_type === "consolidate" ? "Consolidation" : p.run_type === "reembed" ? "Re-embedding" : p.host_kind === "content" ? "Learned from content" : "Learned from a conversation";
    }
    function Pt(p) {
      const r = p instanceof CustomEvent && he(p.detail) ? p.detail : {}, f = Array.isArray(r.selected) ? r.selected : [];
      w.value.scope_id = String(f[0] || "");
    }
    const je = E(!!customElements.get("wc-agent-picker"));
    Ht(async () => {
      if (!je.value)
        try {
          await Nt("wc-agent-picker", { timeoutMs: 8e3 }), je.value = !0;
        } catch (p) {
          O.value = `The agent picker could not load: ${Me(p)}`;
        }
    });
    function ke(p) {
      if (!p) return "";
      const r = Date.parse(p.includes("T") ? p : p.replace(" ", "T") + "Z");
      return Number.isFinite(r) ? new Date(r).toLocaleString() : p;
    }
    return (p, r) => (u(), h("div", Ho, [
      y(m(Tt), {
        value: s.value,
        "onUpdate:value": r[14] || (r[14] = (f) => s.value = f)
      }, {
        default: $(() => [
          y(m(Lt), null, {
            default: $(() => [
              y(m(Ce), { value: "memories" }, {
                default: $(() => [
                  r[15] || (r[15] = oe("Memories ", -1)),
                  i.value ? (u(), B(m(ie), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "secondary",
                    value: String(i.value.counts.current)
                  }, null, 8, ["value"])) : S("", !0)
                ]),
                _: 1
              }),
              y(m(Ce), { value: "conflicts" }, {
                default: $(() => [
                  r[16] || (r[16] = oe("Conflicts ", -1)),
                  d.value.length ? (u(), B(m(ie), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "warn",
                    value: String(d.value.length)
                  }, null, 8, ["value"])) : S("", !0)
                ]),
                _: 1
              }),
              y(m(Ce), { value: "activity" }, {
                default: $(() => [
                  r[17] || (r[17] = oe("Activity ", -1)),
                  Xe.value ? (u(), B(m(ie), {
                    key: 0,
                    class: "kx-tag-sm",
                    severity: "danger",
                    value: `${Xe.value} failed`
                  }, null, 8, ["value"])) : S("", !0)
                ]),
                _: 1
              }),
              y(m(Ce), { value: "settings" }, {
                default: $(() => [...r[18] || (r[18] = [
                  oe("Settings", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          }),
          O.value ? (u(), B(m(dn), {
            key: 0,
            severity: "error",
            class: "mm-filters"
          }, {
            default: $(() => [
              oe(k(O.value), 1)
            ]),
            _: 1
          })) : S("", !0),
          y(m($t), null, {
            default: $(() => [
              y(m(Le), { value: "memories" }, {
                default: $(() => [
                  c("div", jo, [
                    y(m(Ye), {
                      modelValue: K.value,
                      "onUpdate:modelValue": r[0] || (r[0] = (f) => K.value = f),
                      options: M,
                      "option-label": "label",
                      "option-value": "value",
                      "allow-empty": !1,
                      size: "small"
                    }, null, 8, ["modelValue"]),
                    y(m(It), {
                      modelValue: P.value,
                      "onUpdate:modelValue": r[1] || (r[1] = (f) => P.value = f),
                      options: m(V),
                      "option-label": "label",
                      "option-value": "value",
                      size: "small",
                      placeholder: "All kinds",
                      "show-clear": "",
                      "aria-label": "Kind"
                    }, null, 8, ["modelValue", "options"]),
                    F.value ? S("", !0) : (u(), B(m(J), {
                      key: 0,
                      label: "Add identity or rule",
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      onClick: r[2] || (r[2] = (f) => {
                        F.value = !0, l.value = null;
                      })
                    }, {
                      icon: $(() => [
                        y(m(G), { icon: "tabler:plus" })
                      ]),
                      _: 1
                    }))
                  ]),
                  c("div", {
                    class: te(["mm-split", { solo: !F.value && !l.value }])
                  }, [
                    c("div", No, [
                      I.value && !a.value.length ? (u(), h("div", _o, [
                        y(m(G), {
                          icon: "tabler:loader-2",
                          class: "spin"
                        }),
                        r[19] || (r[19] = oe("Loading memories", -1))
                      ])) : a.value.length ? (u(!0), h(j, { key: 2 }, X(a.value, (f) => (u(), h("button", {
                        key: f.id,
                        class: te(["mm-row", { on: l.value?.id === f.id }]),
                        onClick: (pe) => le(f)
                      }, [
                        c("span", null, [
                          c("span", qo, k(f.content), 1),
                          c("span", Zo, [
                            y(m(ie), {
                              class: "kx-tag-sm",
                              severity: "secondary",
                              value: m(fe)[f.kind]
                            }, null, 8, ["value"]),
                            c("span", null, k(Bt(f)) + " · " + k(f.key) + " · v" + k(f.version), 1)
                          ])
                        ])
                      ], 10, Go))), 128)) : (u(), h("div", Uo, [
                        c("span", Wo, [
                          y(m(G), { icon: "tabler:brain" })
                        ]),
                        r[20] || (r[20] = c("p", { class: "kx-empty-title" }, "Nothing here yet", -1)),
                        r[21] || (r[21] = c("p", { class: "kx-empty-sub" }, "Memories appear as agents talk with people, or add the agent's identity and rules yourself.", -1))
                      ]))
                    ]),
                    F.value ? (u(), h("div", Yo, [
                      r[26] || (r[26] = c("div", { class: "mm-panel-h" }, "Add identity or rule", -1)),
                      c("div", Jo, [
                        r[25] || (r[25] = c("span", { class: "mm-hint" }, "Identity and rules are part of the agent's instructions in every conversation.", -1)),
                        y(m(Ye), {
                          modelValue: w.value.kind,
                          "onUpdate:modelValue": r[3] || (r[3] = (f) => w.value.kind = f),
                          options: m(T),
                          "option-label": "label",
                          "option-value": "value",
                          "allow-empty": !1,
                          size: "small"
                        }, null, 8, ["modelValue", "options"]),
                        c("div", Qo, [
                          r[22] || (r[22] = c("span", { class: "mm-label" }, "Agent", -1)),
                          je.value ? (u(), h("wc-agent-picker", {
                            key: 0,
                            multi: "false",
                            placeholder: "Pick the agent",
                            selected: w.value.scope_id ? JSON.stringify([w.value.scope_id]) : "[]",
                            onChange: Pt
                          }, null, 40, Xo)) : S("", !0)
                        ]),
                        c("div", es, [
                          r[23] || (r[23] = c("label", {
                            class: "mm-label",
                            for: "draft_key"
                          }, "Topic", -1)),
                          y(m(pt), {
                            id: "draft_key",
                            modelValue: w.value.key,
                            "onUpdate:modelValue": r[4] || (r[4] = (f) => w.value.key = f),
                            placeholder: "e.g. tone"
                          }, null, 8, ["modelValue"])
                        ]),
                        c("div", ts, [
                          r[24] || (r[24] = c("label", {
                            class: "mm-label",
                            for: "draft_content"
                          }, "Text", -1)),
                          y(m(it), {
                            id: "draft_content",
                            modelValue: w.value.content,
                            "onUpdate:modelValue": r[5] || (r[5] = (f) => w.value.content = f),
                            "auto-resize": "",
                            placeholder: "e.g. Answer in short bullet points."
                          }, null, 8, ["modelValue"])
                        ]),
                        c("div", ns, [
                          y(m(J), {
                            label: "Add",
                            size: "small",
                            disabled: !!A.value || !w.value.content.trim() || !w.value.scope_id.trim(),
                            onClick: Ie
                          }, {
                            icon: $(() => [
                              y(m(G), { icon: "tabler:plus" })
                            ]),
                            _: 1
                          }, 8, ["disabled"]),
                          y(m(J), {
                            label: "Cancel",
                            size: "small",
                            severity: "secondary",
                            text: "",
                            onClick: r[6] || (r[6] = (f) => F.value = !1)
                          })
                        ])
                      ])
                    ])) : l.value ? (u(), h("div", is, [
                      c("div", os, [
                        c("span", null, k(m(fe)[l.value.kind]) + " · " + k(l.value.key), 1),
                        y(m(ie), {
                          class: "kx-tag-sm",
                          severity: He(l.value.status),
                          value: l.value.status
                        }, null, 8, ["severity", "value"])
                      ]),
                      c("div", ss, [
                        D.value ? (u(), h(j, { key: 0 }, [
                          y(m(it), {
                            modelValue: D.value,
                            "onUpdate:modelValue": r[7] || (r[7] = (f) => D.value = f),
                            "auto-resize": "",
                            "aria-label": "Memory text"
                          }, null, 8, ["modelValue"]),
                          c("div", as, [
                            y(m(J), {
                              label: "Save new version",
                              size: "small",
                              disabled: !!A.value,
                              onClick: r[8] || (r[8] = (f) => De(l.value))
                            }, {
                              icon: $(() => [
                                y(m(G), { icon: "tabler:check" })
                              ]),
                              _: 1
                            }, 8, ["disabled"]),
                            y(m(J), {
                              label: "Cancel",
                              size: "small",
                              severity: "secondary",
                              text: "",
                              onClick: r[9] || (r[9] = (f) => D.value = "")
                            })
                          ])
                        ], 64)) : (u(), h("div", rs, k(l.value.content), 1)),
                        c("dl", ls, [
                          r[28] || (r[28] = c("dt", null, "About", -1)),
                          c("dd", null, k(l.value.scope_family === "agent" ? `agent ${l.value.scope_id}` : "the person who said it"), 1),
                          r[29] || (r[29] = c("dt", null, "True since", -1)),
                          c("dd", null, k(ke(l.value.valid_at)), 1),
                          l.value.invalid_at ? (u(), h(j, { key: 0 }, [
                            r[27] || (r[27] = c("dt", null, "Until", -1)),
                            c("dd", null, k(ke(l.value.invalid_at)), 1)
                          ], 64)) : S("", !0),
                          r[30] || (r[30] = c("dt", null, "Learned", -1)),
                          c("dd", null, k(ke(l.value.recorded_at)) + " · " + k(l.value.source), 1)
                        ]),
                        c("div", ds, [
                          At.value && !D.value ? (u(), B(m(J), {
                            key: 0,
                            label: "Edit",
                            size: "small",
                            severity: "secondary",
                            outlined: "",
                            onClick: r[10] || (r[10] = (f) => D.value = l.value.content)
                          }, {
                            icon: $(() => [
                              y(m(G), { icon: "tabler:pencil" })
                            ]),
                            _: 1
                          })) : S("", !0),
                          l.value.status !== "forgotten" ? (u(), B(m(J), {
                            key: 1,
                            label: "Forget",
                            size: "small",
                            severity: "danger",
                            outlined: "",
                            disabled: !!A.value,
                            onClick: r[11] || (r[11] = (f) => ne(l.value))
                          }, {
                            icon: $(() => [
                              y(m(G), { icon: "tabler:eye-off" })
                            ]),
                            _: 1
                          }, 8, ["disabled"])) : (u(), B(m(J), {
                            key: 2,
                            label: "Restore",
                            size: "small",
                            severity: "secondary",
                            outlined: "",
                            disabled: !!A.value,
                            onClick: r[12] || (r[12] = (f) => ce(l.value))
                          }, {
                            icon: $(() => [
                              y(m(G), { icon: "tabler:restore" })
                            ]),
                            _: 1
                          }, 8, ["disabled"]))
                        ]),
                        r[31] || (r[31] = c("p", { class: "mm-h" }, "Versions", -1)),
                        (u(!0), h(j, null, X(g.value, (f) => (u(), h("div", {
                          key: f.id,
                          class: te(["mm-version", { past: f.status !== "current" }])
                        }, [
                          y(m(ie), {
                            class: "kx-tag-sm",
                            severity: He(f.status),
                            value: `v${f.version}`
                          }, null, 8, ["severity", "value"]),
                          c("span", null, k(f.content), 1)
                        ], 2))), 128)),
                        r[32] || (r[32] = c("p", { class: "mm-h" }, "Seen in", -1)),
                        v.value.length ? S("", !0) : (u(), h("span", us, "Added by a person or by consolidation.")),
                        (u(!0), h(j, null, X(v.value, (f) => (u(), h("span", {
                          key: f.host_kind + f.host_id + f.event_id,
                          class: "mm-hint"
                        }, k(f.host_kind) + " " + k(f.host_id) + " · message " + k(f.event_id), 1))), 128))
                      ])
                    ])) : S("", !0)
                  ], 2)
                ]),
                _: 1
              }),
              y(m(Le), { value: "conflicts" }, {
                default: $(() => [
                  c("div", cs, [
                    d.value.length ? S("", !0) : (u(), h("div", ps, [
                      c("span", fs, [
                        y(m(G), { icon: "tabler:circle-check" })
                      ]),
                      r[33] || (r[33] = c("p", { class: "kx-empty-title" }, "No conflicts", -1)),
                      r[34] || (r[34] = c("p", { class: "kx-empty-sub" }, "When two memories contradict each other, they wait here for you to keep the right one.", -1))
                    ])),
                    (u(!0), h(j, null, X(d.value, (f) => (u(), h("div", {
                      key: f.group_id,
                      class: "mm-conflict"
                    }, [
                      r[35] || (r[35] = c("span", { class: "mm-hint" }, "These memories contradict each other. Keep the one that is right; the others become earlier versions.", -1)),
                      (u(!0), h(j, null, X(f.items, (pe) => (u(), h("div", {
                        key: pe.id,
                        class: "mm-option"
                      }, [
                        c("div", null, [
                          c("div", hs, k(pe.content), 1),
                          c("div", bs, [
                            y(m(ie), {
                              class: "kx-tag-sm",
                              severity: "secondary",
                              value: m(fe)[pe.kind]
                            }, null, 8, ["value"]),
                            c("span", null, k(ke(pe.valid_at)), 1)
                          ])
                        ]),
                        y(m(J), {
                          label: "Keep this",
                          size: "small",
                          disabled: !!A.value,
                          onClick: (xs) => Ve(f, pe)
                        }, {
                          icon: $(() => [
                            y(m(G), { icon: "tabler:check" })
                          ]),
                          _: 1
                        }, 8, ["disabled", "onClick"])
                      ]))), 128))
                    ]))), 128))
                  ])
                ]),
                _: 1
              }),
              y(m(Le), { value: "activity" }, {
                default: $(() => [
                  c("div", vs, [
                    Re.value.length ? S("", !0) : (u(), h("div", gs, [
                      c("span", ms, [
                        y(m(G), { icon: "tabler:activity" })
                      ]),
                      r[36] || (r[36] = c("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
                      r[37] || (r[37] = c("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, the run shows here.", -1))
                    ])),
                    (u(!0), h(j, null, X(Re.value, (f) => (u(), h("div", {
                      key: f.id,
                      class: "mm-row"
                    }, [
                      c("span", null, [
                        c("span", ys, k(Vt(f)), 1),
                        c("span", ws, [
                          c("span", null, k(ke(f.finished_at || f.started_at || f.created_at)), 1),
                          f.stats?.added ? (u(), h("span", Is, "+" + k(f.stats.added) + " new", 1)) : S("", !0),
                          f.stats?.superseded ? (u(), h("span", ks, k(f.stats.superseded) + " updated", 1)) : S("", !0),
                          f.stats?.conflicted ? (u(), h("span", Os, k(f.stats.conflicted) + " contested", 1)) : S("", !0)
                        ]),
                        f.last_error ? (u(), h("span", Ss, k(f.last_error), 1)) : S("", !0)
                      ]),
                      f.status !== "succeeded" ? (u(), B(m(ie), {
                        key: 0,
                        class: "kx-tag-sm",
                        severity: He(f.status),
                        value: f.status
                      }, null, 8, ["severity", "value"])) : S("", !0)
                    ]))), 128))
                  ])
                ]),
                _: 1
              }),
              y(m(Le), { value: "settings" }, {
                default: $(() => [
                  c("div", Cs, [
                    c("div", Ls, [
                      i.value ? (u(), B(pn, {
                        key: 0,
                        schema: i.value.config_schema,
                        modelValue: R.value,
                        "onUpdate:modelValue": r[13] || (r[13] = (f) => R.value = f)
                      }, null, 8, ["schema", "modelValue"])) : S("", !0),
                      c("div", $s, [
                        y(m(J), {
                          label: "Save settings",
                          size: "small",
                          disabled: !!A.value,
                          onClick: zt
                        }, {
                          icon: $(() => [
                            y(m(G), { icon: "tabler:device-floppy" })
                          ]),
                          _: 1
                        }, 8, ["disabled"]),
                        c("span", Ts, k(L.value), 1)
                      ])
                    ])
                  ])
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
}), As = un(zs, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
_t(import.meta.url, As);
//# sourceMappingURL=memory_kb.js.map
