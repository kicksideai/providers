import { mergeProps as N, openBlock as v, createElementBlock as g, createBlock as M, resolveDynamicComponent as Ge, createCommentVNode as I, renderSlot as X, createElementVNode as d, toDisplayString as w, defineComponent as H, computed as D, Fragment as j, createVNode as T, unref as u, createTextVNode as V, renderList as K, normalizeClass as R, resolveDirective as Je, withDirectives as De, resolveComponent as Qe, createSlots as Xe, withCtx as re, ref as E, watch as z, onUnmounted as Ze, withModifiers as $e, onBeforeUnmount as Me, Transition as Re, nextTick as et, vShow as tt } from "vue";
import { Icon as O } from "@iconify/vue";
import { on as nt, define as ot } from "@wippy-fe/proxy";
import { F as at, d as lt, n as it, N as Te, S as Q, B as W, f as me, g as ve, i as Ce, h as rt, l as st, P as se, C as ut, Q as dt, j as pe, T as Pe, R as Oe, v as ct, k as mt, K as vt, W as pt, U as gt, s as Ae, o as ge, q as ue, r as ft, e as ne, t as bt, u as yt, a as ht, b as kt, m as $t } from "./types-ClUwdCNm.js";
import { B as fe, s as _t, f as _e, c as Ue, u as wt, a as St, d as Ne } from "./useWidget-i33BV3A3.js";
import { m as F, a as we, h as Le, u as xt, _ as Tt } from "./usePaged-Hwc8I7TE.js";
var de = {};
function Ct(e = "pui_id_") {
  return Object.hasOwn(de, e) || (de[e] = 0), de[e]++, `${e}${de[e]}`;
}
function oe(e) {
  "@babel/helpers - typeof";
  return oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, oe(e);
}
function Ie(e, t) {
  return Lt(e) || At(e, t) || Ot(e, t) || Pt();
}
function Pt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ot(e, t) {
  if (e) {
    if (typeof e == "string") return Ve(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ve(e, t) : void 0;
  }
}
function Ve(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function At(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var l, a, o, s, i = [], r = !0, c = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(r = (l = o.call(n)).done) && (i.push(l.value), i.length !== t); r = !0) ;
    } catch (b) {
      c = !0, a = b;
    } finally {
      try {
        if (!r && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw a;
      }
    }
    return i;
  }
}
function Lt(e) {
  if (Array.isArray(e)) return e;
}
function Ee(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    t && (l = l.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, l);
  }
  return n;
}
function A(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ee(Object(n), !0).forEach(function(l) {
      be(e, l, n[l]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ee(Object(n)).forEach(function(l) {
      Object.defineProperty(e, l, Object.getOwnPropertyDescriptor(n, l));
    });
  }
  return e;
}
function be(e, t, n) {
  return (t = It(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function It(e) {
  var t = Vt(e, "string");
  return oe(t) == "symbol" ? t : t + "";
}
function Vt(e, t) {
  if (oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (oe(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var C = {
  _getMeta: function() {
    return [Ce(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], rt(Ce(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var l, a, o;
    return (l = (t == null || (a = t.instance) === null || a === void 0 ? void 0 : a.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || l === void 0 ? void 0 : l.config;
  },
  _getOptionValue: at,
  _getPTValue: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, r = function() {
      var k = C._getOptionValue.apply(C, arguments);
      return me(k) || ut(k) ? {
        class: k
      } : k;
    }, c = ((t = l.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = l.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, b = c.mergeSections, m = b === void 0 ? !0 : b, h = c.mergeProps, S = h === void 0 ? !1 : h, y = i ? C._useDefaultPT(l, l.defaultPT(), r, o, s) : void 0, P = C._usePT(l, C._getPT(a, l.$name), r, o, A(A({}, s), {}, {
      global: y || {}
    })), L = C._getPTDatasets(l, o);
    return m || !m && P ? S ? C._mergeProps(l, S, y, P, L) : A(A(A({}, y), P), L) : A(A({}, P), L);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = "data-pc-";
    return A(A({}, n === "root" && be({}, "".concat(l, "name"), ve(t.$name))), {}, be({}, "".concat(l, "section"), ve(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
      var i, r = l ? l(s) : s, c = ve(n);
      return (i = r?.[c]) !== null && i !== void 0 ? i : r;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: a(t.originalValue),
      value: a(t.value)
    } : a(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(L) {
      return l(L, a, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var i, r = n._usept || ((i = t.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, c = r.mergeSections, b = c === void 0 ? !0 : c, m = r.mergeProps, h = m === void 0 ? !1 : m, S = s(n.originalValue), y = s(n.value);
      return S === void 0 && y === void 0 ? void 0 : me(y) ? y : me(S) ? S : b || !b && y ? h ? C._mergeProps(t, h, S, y) : A(A({}, S), y) : y;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return C._usePT(t, n, l, a, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = arguments.length > 1 ? arguments[1] : void 0, a = arguments.length > 2 ? arguments[2] : void 0, o = C._getConfig(l, a), s = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    C._loadCoreStyles(n, s), C._loadThemeStyles(n, s), C._loadScopedThemeStyles(n, s), C._removeThemeListeners(n), n.$loadStyles = function() {
      return C._loadThemeStyles(n, s);
    }, C._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!fe.isStyleNameLoaded((t = l.$style) === null || t === void 0 ? void 0 : t.name) && (n = l.$style) !== null && n !== void 0 && n.name) {
      var o;
      W.loadCSS(a), (o = l.$style) === null || o === void 0 || o.loadCSS(a), fe.setLoadedStyleName(l.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, l, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(a != null && a.isUnstyled() || (a == null || (t = a.theme) === null || t === void 0 ? void 0 : t.call(a)) === "none")) {
      if (!Q.isStyleNameLoaded("common")) {
        var s, i, r = ((s = a.$style) === null || s === void 0 || (i = s.getCommonTheme) === null || i === void 0 ? void 0 : i.call(s)) || {}, c = r.primitive, b = r.semantic, m = r.global, h = r.style;
        W.load(c?.css, A({
          name: "primitive-variables"
        }, o)), W.load(b?.css, A({
          name: "semantic-variables"
        }, o)), W.load(m?.css, A({
          name: "global-variables"
        }, o)), W.loadStyle(A({
          name: "global-style"
        }, o), h), Q.setLoadedStyleName("common");
      }
      if (!Q.isStyleNameLoaded((n = a.$style) === null || n === void 0 ? void 0 : n.name) && (l = a.$style) !== null && l !== void 0 && l.name) {
        var S, y, P, L, B = ((S = a.$style) === null || S === void 0 || (y = S.getDirectiveTheme) === null || y === void 0 ? void 0 : y.call(S)) || {}, k = B.css, f = B.style;
        (P = a.$style) === null || P === void 0 || P.load(k, A({
          name: "".concat(a.$style.name, "-variables")
        }, o)), (L = a.$style) === null || L === void 0 || L.loadStyle(A({
          name: "".concat(a.$style.name, "-style")
        }, o), f), Q.setLoadedStyleName(a.$style.name);
      }
      if (!Q.isStyleNameLoaded("layer-order")) {
        var p, _, $ = (p = a.$style) === null || p === void 0 || (_ = p.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(p);
        W.load($, A({
          name: "layer-order",
          first: !0
        }, o)), Q.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = t.preset();
    if (l && t.$attrSelector) {
      var a, o, s, i = ((a = t.$style) === null || a === void 0 || (o = a.getPresetTheme) === null || o === void 0 ? void 0 : o.call(a, l, "[".concat(t.$attrSelector, "]"))) || {}, r = i.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(r, A({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    fe.clearLoadedStyleNames(), Te.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Te.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, l, a, o, s) {
    var i, r, c = "on".concat(it(n)), b = C._getConfig(a, o), m = l?.$instance, h = C._usePT(m, C._getPT(a == null || (i = a.value) === null || i === void 0 ? void 0 : i.pt, t), C._getOptionValue, "hooks.".concat(c)), S = C._useDefaultPT(m, b == null || (r = b.pt) === null || r === void 0 || (r = r.directives) === null || r === void 0 ? void 0 : r[t], C._getOptionValue, "hooks.".concat(c)), y = {
      el: l,
      binding: a,
      vnode: o,
      prevVnode: s
    };
    h?.(m, y), S?.(m, y);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, l = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      l[a - 2] = arguments[a];
    return lt(t) ? t.apply(void 0, l) : N.apply(void 0, l);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = function(i, r, c, b, m) {
      var h, S, y, P;
      r._$instances = r._$instances || {};
      var L = C._getConfig(c, b), B = r._$instances[t] || {}, k = st(B) ? A(A({}, n), n?.methods) : {};
      r._$instances[t] = A(A({}, B), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: r,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: B.$el || r || void 0,
        $style: A({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: L,
        $attrSelector: (h = r.$pd) === null || h === void 0 || (h = h[t]) === null || h === void 0 ? void 0 : h.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return C._getPT(L?.pt, void 0, function(p) {
            var _;
            return p == null || (_ = p.directives) === null || _ === void 0 ? void 0 : _[t];
          });
        },
        isUnstyled: function() {
          var p, _;
          return ((p = r._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.unstyled) !== void 0 ? (_ = r._$instances[t]) === null || _ === void 0 || (_ = _.$binding) === null || _ === void 0 || (_ = _.value) === null || _ === void 0 ? void 0 : _.unstyled : L?.unstyled;
        },
        theme: function() {
          var p;
          return (p = r._$instances[t]) === null || p === void 0 || (p = p.$primevueConfig) === null || p === void 0 ? void 0 : p.theme;
        },
        preset: function() {
          var p;
          return (p = r._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.dt;
        },
        /* instance's methods */
        ptm: function() {
          var p, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return C._getPTValue(r._$instances[t], (p = r._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.pt, _, A({}, $));
        },
        ptmo: function() {
          var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return C._getPTValue(r._$instances[t], p, _, $, !1);
        },
        cx: function() {
          var p, _, $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (p = r._$instances[t]) !== null && p !== void 0 && p.isUnstyled() ? void 0 : C._getOptionValue((_ = r._$instances[t]) === null || _ === void 0 || (_ = _.$style) === null || _ === void 0 ? void 0 : _.classes, $, A({}, x));
        },
        sx: function() {
          var p, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, x = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return $ ? C._getOptionValue((p = r._$instances[t]) === null || p === void 0 || (p = p.$style) === null || p === void 0 ? void 0 : p.inlineStyles, _, A({}, x)) : void 0;
        }
      }, k), r.$instance = r._$instances[t], (S = (y = r.$instance)[i]) === null || S === void 0 || S.call(y, r, c, b, m), r["$".concat(t)] = r.$instance, C._hook(t, i, r, c, b, m), r.$pd || (r.$pd = {}), r.$pd[t] = A(A({}, (P = r.$pd) === null || P === void 0 ? void 0 : P[t]), {}, {
        name: t,
        instance: r._$instances[t]
      });
    }, a = function(i) {
      var r, c, b, m = i._$instances[t], h = m?.watch, S = function(L) {
        var B, k = L.newValue, f = L.oldValue;
        return h == null || (B = h.config) === null || B === void 0 ? void 0 : B.call(m, k, f);
      }, y = function(L) {
        var B, k = L.newValue, f = L.oldValue;
        return h == null || (B = h["config.ripple"]) === null || B === void 0 ? void 0 : B.call(m, k, f);
      };
      m.$watchersCallback = {
        config: S,
        "config.ripple": y
      }, h == null || (r = h.config) === null || r === void 0 || r.call(m, m?.$primevueConfig), se.on("config:change", S), h == null || (c = h["config.ripple"]) === null || c === void 0 || c.call(m, m == null || (b = m.$primevueConfig) === null || b === void 0 ? void 0 : b.ripple), se.on("config:ripple:change", y);
    }, o = function(i) {
      var r = i._$instances[t].$watchersCallback;
      r && (se.off("config:change", r.config), se.off("config:ripple:change", r["config.ripple"]), i._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(i, r, c, b) {
        i.$pd || (i.$pd = {}), i.$pd[t] = {
          name: t,
          attrSelector: Ct("pd")
        }, l("created", i, r, c, b);
      },
      beforeMount: function(i, r, c, b) {
        var m;
        C._loadStyles((m = i.$pd[t]) === null || m === void 0 ? void 0 : m.instance, r, c), l("beforeMount", i, r, c, b), a(i);
      },
      mounted: function(i, r, c, b) {
        var m;
        C._loadStyles((m = i.$pd[t]) === null || m === void 0 ? void 0 : m.instance, r, c), l("mounted", i, r, c, b);
      },
      beforeUpdate: function(i, r, c, b) {
        l("beforeUpdate", i, r, c, b);
      },
      updated: function(i, r, c, b) {
        var m;
        C._loadStyles((m = i.$pd[t]) === null || m === void 0 ? void 0 : m.instance, r, c), l("updated", i, r, c, b);
      },
      beforeUnmount: function(i, r, c, b) {
        var m;
        o(i), C._removeThemeListeners((m = i.$pd[t]) === null || m === void 0 ? void 0 : m.instance), l("beforeUnmount", i, r, c, b);
      },
      unmounted: function(i, r, c, b) {
        var m;
        (m = i.$pd[t]) === null || m === void 0 || (m = m.instance) === null || m === void 0 || (m = m.scopedStyleEl) === null || m === void 0 || (m = m.value) === null || m === void 0 || m.remove(), l("unmounted", i, r, c, b);
      }
    };
  },
  extend: function() {
    var t = C._getMeta.apply(C, arguments), n = Ie(t, 2), l = n[0], a = n[1];
    return A({
      extend: function() {
        var s = C._getMeta.apply(C, arguments), i = Ie(s, 2), r = i[0], c = i[1];
        return C.extend(r, A(A(A({}, a), a?.methods), c));
      }
    }, C._extend(l, a));
  }
}, Et = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, Bt = {
  root: "p-ink"
}, jt = W.extend({
  name: "ripple-directive",
  style: Et,
  classes: Bt
}), Dt = C.extend({
  style: jt
});
function ae(e) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ae(e);
}
function Mt(e) {
  return zt(e) || Nt(e) || Ut(e) || Rt();
}
function Rt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ut(e, t) {
  if (e) {
    if (typeof e == "string") return ye(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ye(e, t) : void 0;
  }
}
function Nt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zt(e) {
  if (Array.isArray(e)) return ye(e);
}
function ye(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Be(e, t, n) {
  return (t = Kt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Kt(e) {
  var t = Wt(e, "string");
  return ae(t) == "symbol" ? t : t + "";
}
function Wt(e, t) {
  if (ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ae(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ze = Dt.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var n = this.getInk(t);
      n || (n = gt("span", Be(Be({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, l = t.currentTarget, a = this.getInk(l);
      if (!(!a || getComputedStyle(a, null).display === "none")) {
        if (!this.isUnstyled() && pe(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"), !Pe(a) && !Oe(a)) {
          var o = Math.max(ct(l), mt(l));
          a.style.height = o + "px", a.style.width = o + "px";
        }
        var s = vt(l), i = t.pageX - s.left + document.body.scrollTop - Oe(a) / 2, r = t.pageY - s.top + document.body.scrollLeft - Pe(a) / 2;
        a.style.top = r + "px", a.style.left = i + "px", !this.isUnstyled() && pt(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          a && (!n.isUnstyled() && pe(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && pe(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Mt(t.children).find(function(n) {
        return dt(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Ft = `
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
`, Ht = {
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
}, qt = W.extend({
  name: "tag",
  style: Ft,
  classes: Ht
}), Yt = {
  name: "BaseTag",
  extends: _t,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: qt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function le(e) {
  "@babel/helpers - typeof";
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, le(e);
}
function Gt(e, t, n) {
  return (t = Jt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Jt(e) {
  var t = Qt(e, "string");
  return le(t) == "symbol" ? t : t + "";
}
function Qt(e, t) {
  if (le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (le(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Se = {
  name: "Tag",
  extends: Yt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return _e(Gt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Xt = ["data-p"];
function Zt(e, t, n, l, a, o) {
  return v(), g("span", N({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), M(Ge(e.$slots.icon), N({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), g("span", N({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : I("", !0), e.value != null || e.$slots.default ? X(e.$slots, "default", {
    key: 2
  }, function() {
    return [d("span", N({
      class: e.cx("label")
    }, e.ptm("label")), w(e.value), 17)];
  }) : I("", !0)], 16, Xt);
}
Se.render = Zt;
const G = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, en = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function J(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
function tn(e) {
  return e.scope_family === "agent" ? "The agent" : "A person it talked with";
}
const nn = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function Ke(e) {
  return nn[e];
}
const he = {
  current: "Current",
  superseded: "Earlier",
  conflict: "Conflict",
  archived: "Archived",
  forgotten: "Forgotten",
  scheduled: "Scheduled",
  running: "Running",
  succeeded: "Completed",
  failed: "Failed",
  rejected: "Rejected"
}, on = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function We(e) {
  return on[e] ?? "secondary";
}
function Fe(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function te(e) {
  const t = Fe(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const an = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function Y(e, t = Date.now()) {
  const n = Fe(e);
  if (!Number.isFinite(n)) return "";
  const l = Math.round((n - t) / 1e3), a = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, s] of an)
    if (Math.abs(l) >= s) return a.format(Math.round(l / s), o);
  return "just now";
}
const ln = { class: "mm-view-head" }, rn = { class: "mm-view-title" }, sn = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, un = { class: "kx-empty-ico" }, dn = {
  key: 1,
  class: "mm-runs"
}, cn = { class: "mm-run-main" }, mn = { class: "mm-run-t" }, vn = ["title"], pn = {
  key: 0,
  class: "mm-run-err"
}, gn = /* @__PURE__ */ H({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = D(() => t.memory.status.value?.runs || []);
    function l(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function a(o) {
      const s = o.stats || {}, i = [
        s.added ? `${s.added} new` : "",
        s.superseded ? `${s.superseded} updated` : "",
        s.conflicted ? `${s.conflicted} contested` : "",
        s.rejected ? `${s.rejected} rejected` : ""
      ].filter(Boolean);
      return i.length ? i.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, s) => (v(), g(j, null, [
      d("header", ln, [
        d("h2", rn, [
          T(u(O), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = V("Activity", -1))
        ]),
        s[1] || (s[1] = d("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (v(), g("ol", dn, [
        (v(!0), g(j, null, K(n.value, (i) => (v(), g("li", {
          key: i.id,
          class: R(["mm-run", i.status])
        }, [
          d("div", cn, [
            d("span", mn, w(l(i)), 1),
            d("span", {
              class: "mm-muted",
              title: u(te)(i.finished_at || i.started_at || i.created_at)
            }, [
              V(w(u(Y)(i.finished_at || i.started_at || i.created_at)), 1),
              a(i) ? (v(), g(j, { key: 0 }, [
                V(" · " + w(a(i)), 1)
              ], 64)) : I("", !0)
            ], 8, vn),
            i.last_error ? (v(), g("span", pn, w(i.last_error), 1)) : I("", !0)
          ]),
          i.status !== "succeeded" ? (v(), M(u(Se), {
            key: 0,
            class: "kx-tag-sm",
            severity: u(We)(i.status),
            value: u(he)[i.status]
          }, null, 8, ["severity", "value"])) : I("", !0)
        ], 2))), 128))
      ])) : (v(), g("div", sn, [
        d("span", un, [
          T(u(O), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        s[2] || (s[2] = d("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        s[3] || (s[3] = d("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
var fn = `
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
`, bn = {
  root: function(t) {
    var n = t.instance, l = t.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": l.fluid,
      "p-togglebutton-sm p-inputfield-sm": l.size === "small",
      "p-togglebutton-lg p-inputfield-lg": l.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, yn = W.extend({
  name: "togglebutton",
  style: fn,
  classes: bn
}), hn = {
  name: "BaseToggleButton",
  extends: Ue,
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
  style: yn,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function ie(e) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ie(e);
}
function kn(e, t, n) {
  return (t = $n(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $n(e) {
  var t = _n(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function _n(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ie(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var He = {
  name: "ToggleButton",
  extends: hn,
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
      var n, l;
      (n = (l = this.formField).onBlur) === null || n === void 0 || n.call(l, t);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return Ae(this.onLabel) && Ae(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return _e(kn({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ze
  }
}, wn = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Sn = ["data-p"];
function xn(e, t, n, l, a, o) {
  var s = Je("ripple");
  return De((v(), g("button", N({
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
  }), [d("span", N({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [X(e.$slots, "default", {}, function() {
    return [X(e.$slots, "icon", {
      value: e.d_value,
      class: R(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (v(), g("span", N({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : I("", !0)];
    }), d("span", N({
      class: e.cx("label")
    }, o.getPTOptions("label")), w(o.label), 17)];
  })], 16, Sn)], 16, wn)), [[s]]);
}
He.render = xn;
var Tn = `
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
`, Cn = {
  root: function(t) {
    var n = t.props, l = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": l.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, Pn = W.extend({
  name: "selectbutton",
  style: Tn,
  classes: Cn
}), On = {
  name: "BaseSelectButton",
  extends: Ue,
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
  style: Pn,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function An(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = qe(e)) || t) {
      n && (e = n);
      var l = 0, a = function() {
      };
      return { s: a, n: function() {
        return l >= e.length ? { done: !0 } : { done: !1, value: e[l++] };
      }, e: function(c) {
        throw c;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, i = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    i = !0, o = c;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (i) throw o;
    }
  } };
}
function Ln(e) {
  return En(e) || Vn(e) || qe(e) || In();
}
function In() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qe(e, t) {
  if (e) {
    if (typeof e == "string") return ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ke(e, t) : void 0;
  }
}
function Vn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function En(e) {
  if (Array.isArray(e)) return ke(e);
}
function ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
var xe = {
  name: "SelectButton",
  extends: On,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? ue(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? ue(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? ue(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? ue(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, l) {
      var a = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var o = this.isSelected(n), s = this.getOptionValue(n), i;
        if (this.multiple)
          if (o) {
            if (i = this.d_value.filter(function(r) {
              return !ge(r, s, a.equalityKey);
            }), !this.allowEmpty && i.length === 0) return;
          } else
            i = this.d_value ? [].concat(Ln(this.d_value), [s]) : [s];
        else {
          if (o && !this.allowEmpty) return;
          i = o ? null : s;
        }
        this.writeValue(i, t), this.$emit("change", {
          originalEvent: t,
          value: i
        });
      }
    },
    isSelected: function(t) {
      var n = !1, l = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var a = An(this.d_value), o;
          try {
            for (a.s(); !(o = a.n()).done; ) {
              var s = o.value;
              if (ge(s, l, this.equalityKey)) {
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
        n = ge(this.d_value, l, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return _e({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ze
  },
  components: {
    ToggleButton: He
  }
}, Bn = ["aria-labelledby", "data-p"];
function jn(e, t, n, l, a, o) {
  var s = Qe("ToggleButton");
  return v(), g("div", N({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(v(!0), g(j, null, K(e.options, function(i, r) {
    return v(), M(s, {
      key: o.getOptionRenderKey(i),
      modelValue: o.isSelected(i),
      onLabel: o.getOptionLabel(i),
      offLabel: o.getOptionLabel(i),
      disabled: e.disabled || o.isOptionDisabled(i),
      unstyled: e.unstyled,
      size: e.size,
      readonly: o.isOptionReadonly(i),
      onChange: function(b) {
        return o.onOptionSelect(b, i, r);
      },
      pt: e.ptm("pcToggleButton")
    }, Xe({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: re(function() {
        return [X(e.$slots, "option", {
          option: i,
          index: r
        }, function() {
          return [d("span", N({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), w(o.getOptionLabel(i)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Bn);
}
xe.render = jn;
function Dn(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function je(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Mn(e) {
  const t = D(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = E(null), l = E(""), a = E(!1), o = E(0);
  let s = 0;
  async function i() {
    const b = ++s;
    if (!e.value) return !1;
    try {
      const m = await F(e.value).status();
      return b !== s ? !1 : (n.value = m, l.value = "", o.value++, !0);
    } catch (m) {
      return b === s && (l.value = ne(m)), !1;
    }
  }
  async function r(b) {
    a.value = !0, l.value = "";
    try {
      return await b(), await i();
    } catch (m) {
      return l.value = ne(m), !1;
    } finally {
      a.value = !1;
    }
  }
  let c = null;
  return z(e, (b) => {
    if (c && c(), c = null, s++, n.value = null, l.value = "", !b) return;
    const m = nt(`component.${b}`, () => {
      i();
    });
    c = typeof m == "function" ? m : null, i();
  }, { immediate: !0 }), Ze(() => {
    c && c();
  }), ft(async () => {
    await i();
  }), { memoryId: e, base: t, status: n, error: l, busy: a, revision: o, act: r };
}
const Rn = { class: "mm-field" }, Un = { class: "mm-hint" }, Nn = { class: "mm-field" }, zn = ["selected"], Kn = {
  key: 1,
  class: "kx-notice error"
}, Wn = { class: "mm-field" }, Fn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Hn = {
  key: 1,
  class: "mm-hint"
}, qn = {
  key: 2,
  class: "kx-notice error"
}, Yn = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, Gn = ["onClick"], Jn = { class: "mm-field" }, Qn = { class: "mm-form-foot" }, Xn = ["disabled"], Zn = /* @__PURE__ */ H({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = E("rule"), s = E(""), i = E(""), r = E(""), c = wt("wc-agent-picker"), b = D(() => a.find((k) => k.value === o.value)?.hint || ""), m = D(() => Dn(i.value)), h = D(() => i.value && !je(m.value) ? "Use a short topic of letters, digits and spaces." : ""), S = D(() => !!s.value && je(m.value) && !!r.value.trim()), y = we(
      () => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value] : null,
      (k) => F(n.memory.memoryId.value).topics({ kind: o.value, offset: k }),
      n.memory.revision
    ), P = D(() => y.rows.value.map((k) => k.key).filter((k) => k !== m.value).slice(0, 8));
    z(o, () => {
      i.value = "";
    });
    function L(k) {
      const f = bt(k).selected;
      s.value = String((Array.isArray(f) ? f : [])[0] || "");
    }
    async function B() {
      if (!S.value) return;
      let k = null;
      await n.memory.act(async () => {
        k = await F(n.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: s.value,
          key: m.value,
          value: r.value.trim(),
          content: r.value.trim()
        });
      }) && k !== null && l("added", k);
    }
    return (k, f) => (v(), g("form", {
      class: "mm-form",
      onSubmit: $e(B, ["prevent"])
    }, [
      d("div", Rn, [
        f[3] || (f[3] = d("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        T(u(xe), {
          modelValue: o.value,
          "onUpdate:modelValue": f[0] || (f[0] = (p) => o.value = p),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        d("span", Un, [
          T(u(O), {
            icon: u(G)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          V(w(b.value), 1)
        ])
      ]),
      d("div", Nn, [
        f[4] || (f[4] = d("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        u(c).ready.value ? (v(), g("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: s.value ? JSON.stringify([s.value]) : "[]",
          onChange: L
        }, null, 40, zn)) : u(c).failed.value ? (v(), g("div", Kn, "The agent picker could not load: " + w(u(c).failed.value), 1)) : I("", !0)
      ]),
      d("div", Wn, [
        f[5] || (f[5] = d("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        T(u(St), {
          id: "add_topic",
          modelValue: i.value,
          "onUpdate:modelValue": f[1] || (f[1] = (p) => i.value = p),
          placeholder: "e.g. response style",
          invalid: !!h.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        h.value ? (v(), g("span", Fn, w(h.value), 1)) : (v(), g("span", Hn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        u(y).error.value ? (v(), g("div", qn, w(u(y).error.value), 1)) : I("", !0),
        P.value.length ? (v(), g("div", Yn, [
          (v(!0), g(j, null, K(P.value, (p) => (v(), g("button", {
            key: p,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (_) => i.value = u(J)(p)
          }, w(u(J)(p)), 9, Gn))), 128))
        ])) : I("", !0)
      ]),
      d("div", Jn, [
        f[6] || (f[6] = d("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        T(u(Ne), {
          id: "add_text",
          modelValue: r.value,
          "onUpdate:modelValue": f[2] || (f[2] = (p) => r.value = p),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      d("div", Qn, [
        d("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !S.value
        }, [
          T(u(O), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: R({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          f[7] || (f[7] = V("Add to memory ", -1))
        ], 8, Xn)
      ])
    ], 32));
  }
}), eo = { class: "mm-view-head" }, to = { class: "mm-view-title" }, no = {
  key: 0,
  class: "kx-notice error"
}, oo = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, ao = { class: "kx-empty-ico" }, lo = ["aria-label"], io = { class: "mm-card-h" }, ro = { class: "kx-chip" }, so = { class: "mm-option-main" }, uo = { class: "mm-option-t" }, co = { class: "mm-muted" }, mo = ["disabled", "onClick"], vo = ["disabled"], po = /* @__PURE__ */ H({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = we(() => t.memory.memoryId.value || null, (a) => F(t.memory.memoryId.value).conflicts(a), t.memory.revision);
    function l(a, o) {
      t.memory.act(() => F(t.memory.memoryId.value).resolve(a.group_id, o.id));
    }
    return (a, o) => (v(), g(j, null, [
      d("header", eo, [
        d("h2", to, [
          T(u(O), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = V("Conflicts", -1))
        ]),
        o[2] || (o[2] = d("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      u(n).error.value ? (v(), g("div", no, [
        T(u(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, w(u(n).error.value), 1)
      ])) : !u(n).loading.value && !u(n).rows.value.length ? (v(), g("div", oo, [
        d("span", ao, [
          T(u(O), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = d("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = d("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : I("", !0),
      (v(!0), g(j, null, K(u(n).rows.value, (s) => (v(), g("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${u(J)(s.items[0].key)}`
      }, [
        d("div", io, [
          d("span", ro, w(u(G)[s.items[0].kind].label), 1),
          V(w(u(J)(s.items[0].key)), 1)
        ]),
        (v(!0), g(j, null, K(s.items, (i) => (v(), g("div", {
          key: i.id,
          class: "mm-option"
        }, [
          d("div", so, [
            d("span", uo, w(i.content), 1),
            d("span", co, w(u(Y)(i.valid_at)) + " · " + w(u(Ke)(i.source)), 1)
          ]),
          d("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (r) => l(s, i)
          }, [
            T(u(O), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = V("Keep this ", -1))
          ], 8, mo)
        ]))), 128))
      ], 8, lo))), 128)),
      u(n).next.value !== null ? (v(), g("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: u(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...s) => u(n).more && u(n).more(...s))
      }, "Show more conflicts", 8, vo)) : I("", !0)
    ], 64));
  }
}), go = ["aria-label", "title", "aria-pressed", "disabled"], ce = /* @__PURE__ */ H({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: t }) {
    const n = t;
    return (l, a) => (v(), g("button", {
      type: "button",
      class: R(["kx-iconbtn", { on: e.active }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: a[0] || (a[0] = (o) => n("click"))
    }, [
      T(u(O), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, go));
  }
}), fo = ["aria-label"], bo = { class: "kx-drawer-h" }, yo = { class: "kx-drawer-title" }, ho = { class: "kx-drawer-b" }, ko = /* @__PURE__ */ H({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, l = t;
    function a(o) {
      o.key === "Escape" && l("close");
    }
    return z(() => n.open, (o) => {
      o ? window.addEventListener("keydown", a) : window.removeEventListener("keydown", a);
    }), Me(() => window.removeEventListener("keydown", a)), (o, s) => (v(), M(Re, { name: "kx-drawer" }, {
      default: re(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: s[1] || (s[1] = $e((i) => l("close"), ["self"]))
        }, [
          d("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            d("div", bo, [
              d("span", yo, [
                T(u(O), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                V(w(e.title), 1)
              ]),
              T(ce, {
                icon: "tabler:x",
                label: "Close",
                onClick: s[0] || (s[0] = (i) => l("close"))
              })
            ]),
            d("div", ho, [
              X(o.$slots, "default")
            ])
          ], 8, fo)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
}), $o = ["aria-label"], _o = { class: "kx-modal-h" }, wo = { class: "kx-modal-h-ico" }, So = { class: "kx-modal-h-text" }, xo = { class: "kx-modal-h-title" }, To = {
  key: 0,
  class: "kx-modal-h-sub"
}, Co = { class: "kx-modal-body" }, Po = { class: "kx-modal-foot" }, Oo = ["disabled"], Ao = ["disabled"], Lo = /* @__PURE__ */ H({
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
    const n = t;
    function l(s) {
      s.key === "Escape" && !a.busy && n("cancel");
    }
    const a = e, o = E(null);
    return z(() => a.open, async (s) => {
      s ? (window.addEventListener("keydown", l), await et(), o.value?.focus()) : window.removeEventListener("keydown", l);
    }, { immediate: !0 }), Me(() => window.removeEventListener("keydown", l)), (s, i) => (v(), M(Re, { name: "kx-modal" }, {
      default: re(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: i[3] || (i[3] = $e((r) => !e.busy && n("cancel"), ["self"]))
        }, [
          d("div", {
            class: R(["kx-modal", { danger: e.danger }]),
            role: "alertdialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            d("div", _o, [
              d("span", wo, [
                T(u(O), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", So, [
                d("span", xo, w(e.title), 1),
                e.subtitle ? (v(), g("span", To, w(e.subtitle), 1)) : I("", !0)
              ]),
              T(ce, {
                icon: "tabler:x",
                label: "Close",
                disabled: e.busy,
                onClick: i[0] || (i[0] = (r) => n("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", Co, [
              X(s.$slots, "default")
            ]),
            d("div", Po, [
              d("button", {
                ref_key: "cancelButton",
                ref: o,
                type: "button",
                class: "kx-btn kx-btn-ghost",
                disabled: e.busy,
                onClick: i[1] || (i[1] = (r) => n("cancel"))
              }, "Cancel", 8, Oo),
              d("button", {
                type: "button",
                class: R(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
                disabled: e.busy,
                onClick: i[2] || (i[2] = (r) => n("confirm"))
              }, [
                e.busy ? (v(), M(u(O), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : I("", !0),
                V(w(e.confirmLabel), 1)
              ], 10, Ao)
            ])
          ], 10, $o)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
}), Io = {
  key: 0,
  class: "kx-notice error"
}, Vo = {
  key: 1,
  class: "mm-skel-reader"
}, Eo = {
  key: 2,
  class: "mm-reader"
}, Bo = { class: "mm-head" }, jo = { class: "mm-head-body" }, Do = { class: "mm-head-top" }, Mo = { class: "kx-chip" }, Ro = { class: "mm-topic" }, Uo = { class: "mm-head-acts" }, No = ["disabled"], zo = ["disabled"], Ko = ["disabled"], Wo = {
  key: 0,
  class: "mm-edit"
}, Fo = { class: "mm-edit-acts" }, Ho = ["disabled"], qo = {
  key: 1,
  class: "mm-title"
}, Yo = { class: "mm-facts" }, Go = { class: "mm-fact" }, Jo = ["title"], Qo = ["title"], Xo = ["title"], Zo = { class: "mm-fact" }, ea = {
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, ta = { class: "mm-timeline" }, na = { class: "mm-tl-body" }, oa = { class: "mm-tl-t" }, aa = { class: "mm-tl-s" }, la = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, ia = {
  key: 0,
  class: "mm-muted"
}, ra = {
  key: 1,
  class: "mm-sources"
}, sa = ["title"], ua = /* @__PURE__ */ H({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = E(null), o = E([]), s = E(null), i = E([]), r = E(""), c = E(null), b = E(!1), m = D(() => a.value ? G[a.value.kind] : null), h = D(() => a.value ? G[a.value.kind].icon : "tabler:brain"), S = D(() => a.value?.status === "current" || a.value?.status === "conflict");
    let y = 0;
    async function P(_ = 0, $) {
      const x = ++y;
      try {
        const U = await F(n.memory.memoryId.value).item(n.itemId, _, $);
        if (x !== y) return;
        if (!_) {
          const Z = U.item;
          if (Z.status === "forgotten") {
            l("gone");
            return;
          }
          a.value = Z, i.value = U.provenance;
        }
        const q = U.versions;
        o.value = _ ? [...o.value, ...q.rows] : q.rows, s.value = q.next, r.value = "";
      } catch (U) {
        if (x !== y) return;
        Le(U) === 404 ? l("gone") : r.value = ne(U);
      }
    }
    z(() => n.itemId, () => {
      a.value = null, o.value = [], c.value = null, b.value = !1, P();
    }, { immediate: !0 });
    async function L() {
      const _ = ++y, $ = o.value.length;
      try {
        let x = 0, U = null;
        const q = [];
        let Z = !0;
        do {
          const Ye = Math.min(100, Math.max(1, $ - q.length)), ee = await F(n.memory.memoryId.value).item(n.itemId, x, Ye);
          if (_ !== y) return;
          if (Z) {
            if (ee.item.status === "forgotten") {
              l("gone");
              return;
            }
            a.value = ee.item, i.value = ee.provenance, Z = !1;
          }
          q.push(...ee.versions.rows), U = ee.versions.next, x = U ?? 0;
        } while (q.length < $ && U !== null);
        o.value = q, s.value = U, r.value = "";
      } catch (x) {
        _ === y && (Le(x) === 404 ? l("gone") : r.value = ne(x));
      }
    }
    z(n.memory.revision, () => {
      L();
    });
    function B(_) {
      return n.memory.act(() => F(n.memory.memoryId.value).act(n.itemId, _));
    }
    async function k() {
      const _ = (c.value || "").trim();
      if (!_ || !a.value) return;
      await n.memory.act(async () => {
        const x = await F(n.memory.memoryId.value).edit(n.itemId, _);
        x && x !== n.itemId && l("replaced", x);
      }) && (c.value = null);
    }
    async function f() {
      await B("forget") && (b.value = !1, l("gone"));
    }
    function p(_) {
      return _.host_kind === "session" ? { label: "Conversation", icon: "tabler:message-circle" } : _.host_kind === "dataflow" ? { label: "Workflow run", icon: "tabler:route" } : _.host_kind === "content" ? { label: "Document", icon: "tabler:file-text" } : { label: _.host_kind, icon: "tabler:database" };
    }
    return (_, $) => (v(), g(j, null, [
      r.value ? (v(), g("div", Io, [
        T(u(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, w(r.value), 1)
      ])) : a.value ? (v(), g("article", Eo, [
        d("header", Bo, [
          d("span", {
            class: R(["mm-head-ic", m.value?.tone])
          }, [
            T(u(O), {
              icon: h.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          d("div", jo, [
            d("div", Do, [
              d("span", Mo, w(m.value?.label), 1),
              d("span", Ro, w(u(J)(a.value.key)), 1),
              a.value.status !== "current" ? (v(), M(u(Se), {
                key: 0,
                class: "kx-tag-sm",
                severity: u(We)(a.value.status),
                value: u(he)[a.value.status]
              }, null, 8, ["severity", "value"])) : I("", !0),
              d("span", Uo, [
                S.value && c.value === null ? (v(), g("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: $[0] || ($[0] = (x) => c.value = a.value.content)
                }, [
                  T(u(O), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  $[8] || ($[8] = V("Edit ", -1))
                ])) : I("", !0),
                S.value ? (v(), g("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: $[1] || ($[1] = (x) => B("archive"))
                }, [
                  T(u(O), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  $[9] || ($[9] = V("Archive ", -1))
                ], 8, No)) : I("", !0),
                a.value.status === "archived" ? (v(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: $[2] || ($[2] = (x) => B("restore"))
                }, [
                  T(u(O), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  $[10] || ($[10] = V("Restore ", -1))
                ], 8, zo)) : I("", !0),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: $[3] || ($[3] = (x) => b.value = !0)
                }, [
                  T(u(O), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  $[11] || ($[11] = V("Forget ", -1))
                ], 8, Ko)
              ])
            ]),
            c.value !== null ? (v(), g("div", Wo, [
              T(u(Ne), {
                modelValue: c.value,
                "onUpdate:modelValue": $[4] || ($[4] = (x) => c.value = x),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              d("div", Fo, [
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !c.value.trim(),
                  onClick: k
                }, [
                  T(u(O), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  $[12] || ($[12] = V("Save text ", -1))
                ], 8, Ho),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: $[5] || ($[5] = (x) => c.value = null)
                }, "Cancel")
              ])
            ])) : (v(), g("h2", qo, w(a.value.content), 1)),
            d("div", Yo, [
              d("span", Go, [
                T(u(O), {
                  icon: "tabler:user-circle",
                  "aria-hidden": "true"
                }),
                V(w(u(tn)(a.value)), 1)
              ]),
              d("span", {
                class: "mm-fact",
                title: u(te)(a.value.valid_at)
              }, [
                T(u(O), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                V("True since " + w(u(Y)(a.value.valid_at)), 1)
              ], 8, Jo),
              a.value.invalid_at ? (v(), g("span", {
                key: 0,
                class: "mm-fact",
                title: u(te)(a.value.invalid_at)
              }, [
                T(u(O), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                V("Until " + w(u(Y)(a.value.invalid_at)), 1)
              ], 8, Qo)) : I("", !0),
              d("span", {
                class: "mm-fact",
                title: u(te)(a.value.recorded_at)
              }, [
                T(u(O), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                V(w(u(Ke)(a.value.source)), 1)
              ], 8, Xo),
              d("span", Zo, [
                T(u(O), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                V(w(a.value.cardinality === "single" ? "One value at a time" : "Can hold several values"), 1)
              ])
            ])
          ])
        ]),
        d("section", ea, [
          $[14] || ($[14] = d("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          d("ol", ta, [
            (v(!0), g(j, null, K(o.value, (x) => (v(), g("li", {
              key: x.id,
              class: R({ now: x.id === a.value.id, past: x.status !== "current" })
            }, [
              $[13] || ($[13] = d("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              d("span", na, [
                d("span", oa, w(x.content), 1),
                d("span", aa, [
                  V("v" + w(x.version) + " · " + w(u(Y)(x.valid_at)), 1),
                  x.status !== "current" ? (v(), g(j, { key: 0 }, [
                    V(" · " + w(u(he)[x.status]), 1)
                  ], 64)) : I("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (v(), g("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: $[6] || ($[6] = (x) => P(s.value))
          }, "Show older versions")) : I("", !0)
        ]),
        d("section", la, [
          $[15] || ($[15] = d("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          i.value.length ? (v(), g("ul", ra, [
            (v(!0), g(j, null, K(i.value, (x) => (v(), g("li", {
              key: x.host_kind + x.host_id + x.event_id
            }, [
              T(u(O), {
                icon: p(x).icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              d("span", null, w(p(x).label), 1),
              x.recorded_at ? (v(), g("span", {
                key: 0,
                class: "mm-muted",
                title: u(te)(x.recorded_at)
              }, w(u(Y)(x.recorded_at)), 9, sa)) : I("", !0)
            ]))), 128))
          ])) : (v(), g("p", ia, w(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (v(), g("div", Vo, [
        (v(), g(j, null, K(4, (x) => d("div", {
          key: x,
          class: "mm-skel-line"
        })), 64))
      ])),
      T(Lo, {
        open: b.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? u(J)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: $[7] || ($[7] = (x) => b.value = !1),
        onConfirm: f
      }, {
        default: re(() => [...$[16] || ($[16] = [
          V(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), da = { class: "mm-rail-tools" }, ca = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, ma = {
  key: 0,
  class: "mm-skel"
}, va = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, pa = {
  key: 2,
  class: "mm-rail-empty"
}, ga = ["aria-expanded", "onClick"], fa = { class: "kx-railsec-t" }, ba = { class: "kx-railsec-b" }, ya = ["aria-current", "onClick"], ha = { class: "mm-row-main" }, ka = { class: "mm-row-t" }, $a = { class: "mm-row-s" }, _a = ["disabled"], wa = /* @__PURE__ */ H({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = E("current"), s = E(""), i = xt(s, 250, (h) => h.trim()), r = we(() => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value, i.value] : null, (h) => F(n.memory.memoryId.value).items({ status: o.value, query: i.value, offset: h }), n.memory.revision);
    z([o, i], () => {
      l("filtered"), l("status-change", o.value);
    });
    const c = E({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), b = D(() => en.map((h) => ({ ...h, items: r.rows.value.filter((S) => G[S.kind].group === h.id) })).filter((h) => h.items.length)), m = D(() => i.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (h, S) => (v(), g(j, null, [
      d("div", da, [
        T(Tt, {
          modelValue: s.value,
          "onUpdate:modelValue": S[0] || (S[0] = (y) => s.value = y),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        T(u(xe), {
          modelValue: o.value,
          "onUpdate:modelValue": S[1] || (S[1] = (y) => o.value = y),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      d("nav", ca, [
        u(r).loading.value && !u(r).rows.value.length ? (v(), g("div", ma, [
          (v(), g(j, null, K(6, (y) => d("div", {
            key: y,
            class: "mm-skel-row"
          })), 64))
        ])) : u(r).error.value ? (v(), g("div", va, [
          T(u(O), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          d("span", null, w(u(r).error.value), 1)
        ])) : u(r).rows.value.length ? I("", !0) : (v(), g("div", pa, w(m.value), 1)),
        (v(!0), g(j, null, K(b.value, (y) => (v(), g("div", {
          key: y.id,
          class: R(["kx-railsec", { closed: c.value[y.id] }])
        }, [
          d("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !c.value[y.id],
            onClick: (P) => c.value[y.id] = !c.value[y.id]
          }, [
            T(u(O), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            T(u(O), {
              class: "kx-railsec-ic",
              icon: y.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", fa, w(y.title), 1)
          ], 8, ga),
          De(d("div", ba, [
            (v(!0), g(j, null, K(y.items, (P) => (v(), g("button", {
              key: P.id,
              type: "button",
              class: R(["mm-row", { on: e.selectedId === P.id }]),
              "aria-current": e.selectedId === P.id ? "true" : void 0,
              onClick: (L) => l("select", P)
            }, [
              d("span", {
                class: R(["mm-row-ic", u(G)[P.kind].tone])
              }, [
                T(u(O), {
                  icon: u(G)[P.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              d("span", ha, [
                d("span", ka, w(P.content), 1),
                d("span", $a, w(u(J)(P.key)) + " · " + w(u(Y)(P.valid_at)), 1)
              ])
            ], 10, ya))), 128))
          ], 512), [
            [tt, !c.value[y.id]]
          ])
        ], 2))), 128)),
        u(r).next.value !== null ? (v(), g("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: u(r).loading.value,
          onClick: S[2] || (S[2] = //@ts-ignore
          (...y) => u(r).more && u(r).more(...y))
        }, [
          u(r).loading.value ? (v(), M(u(O), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : I("", !0),
          S[3] || (S[3] = V("Show more ", -1))
        ], 8, _a)) : I("", !0)
      ])
    ], 64));
  }
}), Sa = {
  key: 0,
  class: "kx-notice error"
}, xa = {
  key: 1,
  class: "mm-page"
}, Ta = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Ca = { class: "kx-shell" }, Pa = { class: "kx-rail" }, Oa = { class: "kx-railhead" }, Aa = { class: "kx-railhead-title" }, La = { key: 0 }, Ia = { class: "kx-railhead-acts" }, Va = { class: "kx-main" }, Ea = { class: "kx-main-scroll mm-main" }, Ba = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, ja = { class: "kx-empty-ico" }, Da = /* @__PURE__ */ H({
  __name: "MemoryManage",
  setup(e) {
    const t = yt(), n = ht(), l = E(""), a = E({});
    z(() => t.value.config, (k) => {
      try {
        a.value = kt(k), l.value = "";
      } catch (f) {
        l.value = ne(f);
      }
    }, { immediate: !0 });
    const o = Mn(D(() => String(a.value.kb_id || ""))), s = E("item"), i = E(String(a.value.route || "")), r = E(!1), c = E("current"), b = D(() => o.status.value?.counts[c.value]), m = D(() => o.status.value?.counts.conflict_groups || 0), h = D(() => (o.status.value?.runs || []).filter((k) => k.status === "failed").length);
    z(() => a.value.route, (k) => {
      const f = typeof k == "string" ? k : "";
      f !== i.value && (S = !0, i.value = f, f && (s.value = "item"));
    }), z(o.memoryId, () => {
      i.value = "", s.value = "item";
    });
    let S = !1;
    z(i, (k) => {
      if (S) {
        S = !1;
        return;
      }
      n("navigate", k || "");
    });
    function y(k) {
      s.value = "item", k !== i.value && (i.value = k);
    }
    function P(k) {
      y(k.id);
    }
    function L(k) {
      s.value = s.value === k ? "item" : k;
    }
    function B(k) {
      r.value = !1, k && y(k);
    }
    return (k, f) => l.value ? (v(), g("div", Sa, w(l.value), 1)) : (v(), g("div", xa, [
      u(o).error.value ? (v(), g("div", Ta, [
        T(u(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, w(u(o).error.value), 1)
      ])) : I("", !0),
      d("div", Ca, [
        d("aside", Pa, [
          d("div", Oa, [
            d("span", Aa, [
              f[7] || (f[7] = V("Memories", -1)),
              b.value !== void 0 ? (v(), g("b", La, w(b.value), 1)) : I("", !0)
            ]),
            d("div", Ia, [
              T(ce, {
                icon: "tabler:activity",
                label: h.value ? `Activity, ${h.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: f[0] || (f[0] = (p) => L("activity"))
              }, null, 8, ["label", "active"]),
              T(ce, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: f[1] || (f[1] = (p) => r.value = !0)
              })
            ])
          ]),
          m.value ? (v(), g("button", {
            key: 0,
            type: "button",
            class: R(["mm-conflict-bar", { on: s.value === "conflicts" }]),
            onClick: f[2] || (f[2] = (p) => L("conflicts"))
          }, [
            T(u(O), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            d("span", null, w(m.value === 1 ? "1 conflict to resolve" : `${m.value} conflicts to resolve`), 1),
            T(u(O), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : I("", !0),
          T(wa, {
            memory: u(o),
            "selected-id": s.value === "item" ? i.value : "",
            onSelect: P,
            onFiltered: f[3] || (f[3] = (p) => i.value = ""),
            onStatusChange: f[4] || (f[4] = (p) => c.value = p)
          }, null, 8, ["memory", "selected-id"])
        ]),
        d("main", Va, [
          d("div", Ea, [
            s.value === "conflicts" ? (v(), M(po, {
              key: 0,
              memory: u(o)
            }, null, 8, ["memory"])) : s.value === "activity" ? (v(), M(gn, {
              key: 1,
              memory: u(o)
            }, null, 8, ["memory"])) : i.value ? (v(), M(ua, {
              key: i.value,
              memory: u(o),
              "item-id": i.value,
              onReplaced: y,
              onGone: f[5] || (f[5] = (p) => i.value = "")
            }, null, 8, ["memory", "item-id"])) : (v(), g("div", Ba, [
              d("span", ja, [
                T(u(O), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              f[8] || (f[8] = d("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              f[9] || (f[9] = d("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      T(ko, {
        open: r.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: f[6] || (f[6] = (p) => r.value = !1)
      }, {
        default: re(() => [
          r.value ? (v(), M(Zn, {
            key: 0,
            memory: u(o),
            onAdded: B
          }, null, 8, ["memory"])) : I("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), Ma = $t(Da, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
ot(import.meta.url, Ma);
//# sourceMappingURL=index.js.map
