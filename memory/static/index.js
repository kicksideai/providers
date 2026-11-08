import { mergeProps as F, openBlock as v, createElementBlock as p, createBlock as R, resolveDynamicComponent as Ze, createCommentVNode as A, renderSlot as Z, createElementVNode as u, toDisplayString as S, defineComponent as G, computed as N, Fragment as D, createVNode as x, unref as d, createTextVNode as j, renderList as K, normalizeClass as U, resolveDirective as et, withDirectives as Ue, resolveComponent as tt, createSlots as nt, withCtx as te, ref as E, watch as q, onUnmounted as ot, withModifiers as ze, onBeforeUnmount as at, Transition as lt, nextTick as Ae, vShow as rt } from "vue";
import { Icon as V } from "@iconify/vue";
import { on as it, define as st } from "@wippy-fe/proxy";
import { F as ut, d as dt, n as ct, N as Oe, S as ee, B as H, f as pe, g as ge, i as Le, h as mt, l as vt, P as de, C as ft, Q as pt, j as be, T as Ve, R as Ie, v as gt, k as bt, K as yt, W as ht, U as kt, s as Ee, o as ye, q as ce, r as $t, e as le, t as _t, u as wt, a as St, b as xt, m as Tt } from "./types-L1we9MvF.js";
import { B as he, s as Ct, f as xe, c as Ke, u as Pt, a as At, d as ke } from "./useWidget-IcUGuSRe.js";
import { m as J, a as Te, h as Be, u as Ot, _ as Lt } from "./usePaged-D9CKT1GU.js";
var me = {};
function Vt(e = "pui_id_") {
  return Object.hasOwn(me, e) || (me[e] = 0), me[e]++, `${e}${me[e]}`;
}
function re(e) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, re(e);
}
function je(e, t) {
  return jt(e) || Bt(e, t) || Et(e, t) || It();
}
function It() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Et(e, t) {
  if (e) {
    if (typeof e == "string") return De(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? De(e, t) : void 0;
  }
}
function De(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Bt(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var l, o, a, s, r = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (l = a.call(n)).done) && (r.push(l.value), r.length !== t); i = !0) ;
    } catch (b) {
      c = !0, o = b;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return r;
  }
}
function jt(e) {
  if (Array.isArray(e)) return e;
}
function Me(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    t && (l = l.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, l);
  }
  return n;
}
function L(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Me(Object(n), !0).forEach(function(l) {
      $e(e, l, n[l]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Me(Object(n)).forEach(function(l) {
      Object.defineProperty(e, l, Object.getOwnPropertyDescriptor(n, l));
    });
  }
  return e;
}
function $e(e, t, n) {
  return (t = Dt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Dt(e) {
  var t = Mt(e, "string");
  return re(t) == "symbol" ? t : t + "";
}
function Mt(e, t) {
  if (re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (re(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var P = {
  _getMeta: function() {
    return [Le(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], mt(Le(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var l, o, a;
    return (l = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || l === void 0 ? void 0 : l.config;
  },
  _getOptionValue: ut,
  _getPTValue: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, r = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = P._getOptionValue.apply(P, arguments);
      return pe(O) || ft(O) ? {
        class: O
      } : O;
    }, c = ((t = l.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = l.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, b = c.mergeSections, f = b === void 0 ? !0 : b, $ = c.mergeProps, y = $ === void 0 ? !1 : $, g = r ? P._useDefaultPT(l, l.defaultPT(), i, a, s) : void 0, w = P._usePT(l, P._getPT(o, l.$name), i, a, L(L({}, s), {}, {
      global: g || {}
    })), C = P._getPTDatasets(l, a);
    return f || !f && w ? y ? P._mergeProps(l, y, g, w, C) : L(L(L({}, g), w), C) : L(L({}, w), C);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = "data-pc-";
    return L(L({}, n === "root" && $e({}, "".concat(l, "name"), ge(t.$name))), {}, $e({}, "".concat(l, "section"), ge(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var r, i = l ? l(s) : s, c = ge(n);
      return (r = i?.[c]) !== null && r !== void 0 ? r : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(C) {
      return l(C, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var r, i = n._usept || ((r = t.$primevueConfig) === null || r === void 0 ? void 0 : r.ptOptions) || {}, c = i.mergeSections, b = c === void 0 ? !0 : c, f = i.mergeProps, $ = f === void 0 ? !1 : f, y = s(n.originalValue), g = s(n.value);
      return y === void 0 && g === void 0 ? void 0 : pe(g) ? g : pe(y) ? y : b || !b && g ? $ ? P._mergeProps(t, $, y, g) : L(L({}, y), g) : g;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return P._usePT(t, n, l, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = P._getConfig(l, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    P._loadCoreStyles(n, s), P._loadThemeStyles(n, s), P._loadScopedThemeStyles(n, s), P._removeThemeListeners(n), n.$loadStyles = function() {
      return P._loadThemeStyles(n, s);
    }, P._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!he.isStyleNameLoaded((t = l.$style) === null || t === void 0 ? void 0 : t.name) && (n = l.$style) !== null && n !== void 0 && n.name) {
      var a;
      H.loadCSS(o), (a = l.$style) === null || a === void 0 || a.loadCSS(o), he.setLoadedStyleName(l.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, l, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!ee.isStyleNameLoaded("common")) {
        var s, r, i = ((s = o.$style) === null || s === void 0 || (r = s.getCommonTheme) === null || r === void 0 ? void 0 : r.call(s)) || {}, c = i.primitive, b = i.semantic, f = i.global, $ = i.style;
        H.load(c?.css, L({
          name: "primitive-variables"
        }, a)), H.load(b?.css, L({
          name: "semantic-variables"
        }, a)), H.load(f?.css, L({
          name: "global-variables"
        }, a)), H.loadStyle(L({
          name: "global-style"
        }, a), $), ee.setLoadedStyleName("common");
      }
      if (!ee.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (l = o.$style) !== null && l !== void 0 && l.name) {
        var y, g, w, C, I = ((y = o.$style) === null || y === void 0 || (g = y.getDirectiveTheme) === null || g === void 0 ? void 0 : g.call(y)) || {}, O = I.css, h = I.style;
        (w = o.$style) === null || w === void 0 || w.load(O, L({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (C = o.$style) === null || C === void 0 || C.loadStyle(L({
          name: "".concat(o.$style.name, "-style")
        }, a), h), ee.setLoadedStyleName(o.$style.name);
      }
      if (!ee.isStyleNameLoaded("layer-order")) {
        var m, T, W = (m = o.$style) === null || m === void 0 || (T = m.getLayerOrderThemeCSS) === null || T === void 0 ? void 0 : T.call(m);
        H.load(W, L({
          name: "layer-order",
          first: !0
        }, a)), ee.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = t.preset();
    if (l && t.$attrSelector) {
      var o, a, s, r = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, l, "[".concat(t.$attrSelector, "]"))) || {}, i = r.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, L({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    he.clearLoadedStyleNames(), Oe.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Oe.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, l, o, a, s) {
    var r, i, c = "on".concat(ct(n)), b = P._getConfig(o, a), f = l?.$instance, $ = P._usePT(f, P._getPT(o == null || (r = o.value) === null || r === void 0 ? void 0 : r.pt, t), P._getOptionValue, "hooks.".concat(c)), y = P._useDefaultPT(f, b == null || (i = b.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], P._getOptionValue, "hooks.".concat(c)), g = {
      el: l,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    $?.(f, g), y?.(f, g);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, l = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      l[o - 2] = arguments[o];
    return dt(t) ? t.apply(void 0, l) : F.apply(void 0, l);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = function(r, i, c, b, f) {
      var $, y, g, w;
      i._$instances = i._$instances || {};
      var C = P._getConfig(c, b), I = i._$instances[t] || {}, O = vt(I) ? L(L({}, n), n?.methods) : {};
      i._$instances[t] = L(L({}, I), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: I.$el || i || void 0,
        $style: L({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: C,
        $attrSelector: ($ = i.$pd) === null || $ === void 0 || ($ = $[t]) === null || $ === void 0 ? void 0 : $.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return P._getPT(C?.pt, void 0, function(m) {
            var T;
            return m == null || (T = m.directives) === null || T === void 0 ? void 0 : T[t];
          });
        },
        isUnstyled: function() {
          var m, T;
          return ((m = i._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? (T = i._$instances[t]) === null || T === void 0 || (T = T.$binding) === null || T === void 0 || (T = T.value) === null || T === void 0 ? void 0 : T.unstyled : C?.unstyled;
        },
        theme: function() {
          var m;
          return (m = i._$instances[t]) === null || m === void 0 || (m = m.$primevueConfig) === null || m === void 0 ? void 0 : m.theme;
        },
        preset: function() {
          var m;
          return (m = i._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.dt;
        },
        /* instance's methods */
        ptm: function() {
          var m, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return P._getPTValue(i._$instances[t], (m = i._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, T, L({}, W));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", W = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P._getPTValue(i._$instances[t], m, T, W, !1);
        },
        cx: function() {
          var m, T, W = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", ne = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = i._$instances[t]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : P._getOptionValue((T = i._$instances[t]) === null || T === void 0 || (T = T.$style) === null || T === void 0 ? void 0 : T.classes, W, L({}, ne));
        },
        sx: function() {
          var m, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, ne = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return W ? P._getOptionValue((m = i._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, T, L({}, ne)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (y = (g = i.$instance)[r]) === null || y === void 0 || y.call(g, i, c, b, f), i["$".concat(t)] = i.$instance, P._hook(t, r, i, c, b, f), i.$pd || (i.$pd = {}), i.$pd[t] = L(L({}, (w = i.$pd) === null || w === void 0 ? void 0 : w[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(r) {
      var i, c, b, f = r._$instances[t], $ = f?.watch, y = function(C) {
        var I, O = C.newValue, h = C.oldValue;
        return $ == null || (I = $.config) === null || I === void 0 ? void 0 : I.call(f, O, h);
      }, g = function(C) {
        var I, O = C.newValue, h = C.oldValue;
        return $ == null || (I = $["config.ripple"]) === null || I === void 0 ? void 0 : I.call(f, O, h);
      };
      f.$watchersCallback = {
        config: y,
        "config.ripple": g
      }, $ == null || (i = $.config) === null || i === void 0 || i.call(f, f?.$primevueConfig), de.on("config:change", y), $ == null || (c = $["config.ripple"]) === null || c === void 0 || c.call(f, f == null || (b = f.$primevueConfig) === null || b === void 0 ? void 0 : b.ripple), de.on("config:ripple:change", g);
    }, a = function(r) {
      var i = r._$instances[t].$watchersCallback;
      i && (de.off("config:change", i.config), de.off("config:ripple:change", i["config.ripple"]), r._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(r, i, c, b) {
        r.$pd || (r.$pd = {}), r.$pd[t] = {
          name: t,
          attrSelector: Vt("pd")
        }, l("created", r, i, c, b);
      },
      beforeMount: function(r, i, c, b) {
        var f;
        P._loadStyles((f = r.$pd[t]) === null || f === void 0 ? void 0 : f.instance, i, c), l("beforeMount", r, i, c, b), o(r);
      },
      mounted: function(r, i, c, b) {
        var f;
        P._loadStyles((f = r.$pd[t]) === null || f === void 0 ? void 0 : f.instance, i, c), l("mounted", r, i, c, b);
      },
      beforeUpdate: function(r, i, c, b) {
        l("beforeUpdate", r, i, c, b);
      },
      updated: function(r, i, c, b) {
        var f;
        P._loadStyles((f = r.$pd[t]) === null || f === void 0 ? void 0 : f.instance, i, c), l("updated", r, i, c, b);
      },
      beforeUnmount: function(r, i, c, b) {
        var f;
        a(r), P._removeThemeListeners((f = r.$pd[t]) === null || f === void 0 ? void 0 : f.instance), l("beforeUnmount", r, i, c, b);
      },
      unmounted: function(r, i, c, b) {
        var f;
        (f = r.$pd[t]) === null || f === void 0 || (f = f.instance) === null || f === void 0 || (f = f.scopedStyleEl) === null || f === void 0 || (f = f.value) === null || f === void 0 || f.remove(), l("unmounted", r, i, c, b);
      }
    };
  },
  extend: function() {
    var t = P._getMeta.apply(P, arguments), n = je(t, 2), l = n[0], o = n[1];
    return L({
      extend: function() {
        var s = P._getMeta.apply(P, arguments), r = je(s, 2), i = r[0], c = r[1];
        return P.extend(i, L(L(L({}, o), o?.methods), c));
      }
    }, P._extend(l, o));
  }
}, Nt = `
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
`, Rt = {
  root: "p-ink"
}, Ut = H.extend({
  name: "ripple-directive",
  style: Nt,
  classes: Rt
}), zt = P.extend({
  style: Ut
});
function ie(e) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ie(e);
}
function Kt(e) {
  return qt(e) || Ht(e) || Ft(e) || Wt();
}
function Wt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ft(e, t) {
  if (e) {
    if (typeof e == "string") return _e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _e(e, t) : void 0;
  }
}
function Ht(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qt(e) {
  if (Array.isArray(e)) return _e(e);
}
function _e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Ne(e, t, n) {
  return (t = Jt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Jt(e) {
  var t = Yt(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function Yt(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ie(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var We = zt.extend("ripple", {
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
      n || (n = kt("span", Ne(Ne({
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
      var n = this, l = t.currentTarget, o = this.getInk(l);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && be(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Ve(o) && !Ie(o)) {
          var a = Math.max(gt(l), bt(l));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = yt(l), r = t.pageX - s.left + document.body.scrollTop - Ie(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - Ve(o) / 2;
        o.style.top = i + "px", o.style.left = r + "px", !this.isUnstyled() && ht(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && be(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && be(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Kt(t.children).find(function(n) {
        return pt(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Gt = `
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
`, Qt = {
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
}, Xt = H.extend({
  name: "tag",
  style: Gt,
  classes: Qt
}), Zt = {
  name: "BaseTag",
  extends: Ct,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Xt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function se(e) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, se(e);
}
function en(e, t, n) {
  return (t = tn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function tn(e) {
  var t = nn(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function nn(e, t) {
  if (se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (se(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ce = {
  name: "Tag",
  extends: Zt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return xe(en({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, on = ["data-p"];
function an(e, t, n, l, o, a) {
  return v(), p("span", F({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), R(Ze(e.$slots.icon), F({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), p("span", F({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : A("", !0), e.value != null || e.$slots.default ? Z(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", F({
      class: e.cx("label")
    }, e.ptm("label")), S(e.value), 17)];
  }) : A("", !0)], 16, on);
}
Ce.render = an;
const X = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, ln = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function Y(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
function rn(e, t) {
  if (e === void 0) return [];
  const n = [];
  function l(o, a) {
    if (o !== null && typeof o == "object") {
      const r = Array.isArray(o) ? o.map((i, c) => [String(c + 1), i]) : Object.entries(o);
      if (r.length) {
        for (const [i, c] of r) l(c, [...a, Y(i)]);
        return;
      }
    }
    const s = o === null ? "Not set" : typeof o == "object" ? "None" : typeof o == "boolean" ? o ? "Yes" : "No" : String(o);
    n.push({ label: a.length ? a.join(" · ") : Y(t), text: s });
  }
  return l(e, []), n;
}
const sn = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function un(e) {
  return sn[e];
}
const we = {
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
}, dn = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Fe(e) {
  return dn[e] ?? "secondary";
}
function He(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function ve(e) {
  const t = He(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const cn = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function Q(e, t = Date.now()) {
  const n = He(e);
  if (!Number.isFinite(n)) return "";
  const l = Math.round((n - t) / 1e3), o = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [a, s] of cn)
    if (Math.abs(l) >= s) return o.format(Math.round(l / s), a);
  return "just now";
}
const mn = { class: "mm-view-head" }, vn = { class: "mm-view-title" }, fn = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, pn = { class: "kx-empty-ico" }, gn = {
  key: 1,
  class: "mm-runs"
}, bn = { class: "mm-run-main" }, yn = { class: "mm-run-t" }, hn = ["title"], kn = {
  key: 0,
  class: "mm-run-err"
}, $n = /* @__PURE__ */ G({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = N(() => t.memory.status.value?.runs || []);
    function l(a) {
      return a.run_type === "consolidate" ? "Consolidation" : a.run_type === "reembed" ? "Re-embedding" : a.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function o(a) {
      const s = a.stats || {}, r = [
        s.added ? `${s.added} new` : "",
        s.superseded ? `${s.superseded} updated` : "",
        s.conflicted ? `${s.conflicted} contested` : "",
        s.rejected ? `${s.rejected} rejected` : ""
      ].filter(Boolean);
      return r.length ? r.join(" · ") : a.status === "succeeded" ? "No changes" : "";
    }
    return (a, s) => (v(), p(D, null, [
      u("header", mn, [
        u("h2", vn, [
          x(d(V), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = j("Activity", -1))
        ]),
        s[1] || (s[1] = u("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (v(), p("ol", gn, [
        (v(!0), p(D, null, K(n.value, (r) => (v(), p("li", {
          key: r.id,
          class: U(["mm-run", r.status])
        }, [
          u("div", bn, [
            u("span", yn, S(l(r)), 1),
            u("span", {
              class: "mm-muted",
              title: d(ve)(r.finished_at || r.started_at || r.created_at)
            }, [
              j(S(d(Q)(r.finished_at || r.started_at || r.created_at)), 1),
              o(r) ? (v(), p(D, { key: 0 }, [
                j(" · " + S(o(r)), 1)
              ], 64)) : A("", !0)
            ], 8, hn),
            r.last_error ? (v(), p("span", kn, S(r.last_error), 1)) : A("", !0)
          ]),
          r.status !== "succeeded" ? (v(), R(d(Ce), {
            key: 0,
            class: "kx-tag-sm",
            severity: d(Fe)(r.status),
            value: d(we)[r.status]
          }, null, 8, ["severity", "value"])) : A("", !0)
        ], 2))), 128))
      ])) : (v(), p("div", fn, [
        u("span", pn, [
          x(d(V), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        s[2] || (s[2] = u("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        s[3] || (s[3] = u("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
var _n = `
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
`, wn = {
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
}, Sn = H.extend({
  name: "togglebutton",
  style: _n,
  classes: wn
}), xn = {
  name: "BaseToggleButton",
  extends: Ke,
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
  style: Sn,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function ue(e) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ue(e);
}
function Tn(e, t, n) {
  return (t = Cn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Cn(e) {
  var t = Pn(e, "string");
  return ue(t) == "symbol" ? t : t + "";
}
function Pn(e, t) {
  if (ue(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ue(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qe = {
  name: "ToggleButton",
  extends: xn,
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
      return Ee(this.onLabel) && Ee(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return xe(Tn({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: We
  }
}, An = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], On = ["data-p"];
function Ln(e, t, n, l, o, a) {
  var s = et("ripple");
  return Ue((v(), p("button", F({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: t[0] || (t[0] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    })
  }, a.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": a.active,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [u("span", F({
    class: e.cx("content")
  }, a.getPTOptions("content"), {
    "data-p": a.dataP
  }), [Z(e.$slots, "default", {}, function() {
    return [Z(e.$slots, "icon", {
      value: e.d_value,
      class: U(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (v(), p("span", F({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, a.getPTOptions("icon")), null, 16)) : A("", !0)];
    }), u("span", F({
      class: e.cx("label")
    }, a.getPTOptions("label")), S(a.label), 17)];
  })], 16, On)], 16, An)), [[s]]);
}
qe.render = Ln;
var Vn = `
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
`, In = {
  root: function(t) {
    var n = t.props, l = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": l.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, En = H.extend({
  name: "selectbutton",
  style: Vn,
  classes: In
}), Bn = {
  name: "BaseSelectButton",
  extends: Ke,
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
  style: En,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function jn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Je(e)) || t) {
      n && (e = n);
      var l = 0, o = function() {
      };
      return { s: o, n: function() {
        return l >= e.length ? { done: !0 } : { done: !1, value: e[l++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, s = !0, r = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    r = !0, a = c;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (r) throw a;
    }
  } };
}
function Dn(e) {
  return Rn(e) || Nn(e) || Je(e) || Mn();
}
function Mn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Je(e, t) {
  if (e) {
    if (typeof e == "string") return Se(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Se(e, t) : void 0;
  }
}
function Nn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Rn(e) {
  if (Array.isArray(e)) return Se(e);
}
function Se(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
var Pe = {
  name: "SelectButton",
  extends: Bn,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? ce(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? ce(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? ce(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? ce(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, l) {
      var o = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var a = this.isSelected(n), s = this.getOptionValue(n), r;
        if (this.multiple)
          if (a) {
            if (r = this.d_value.filter(function(i) {
              return !ye(i, s, o.equalityKey);
            }), !this.allowEmpty && r.length === 0) return;
          } else
            r = this.d_value ? [].concat(Dn(this.d_value), [s]) : [s];
        else {
          if (a && !this.allowEmpty) return;
          r = a ? null : s;
        }
        this.writeValue(r, t), this.$emit("change", {
          originalEvent: t,
          value: r
        });
      }
    },
    isSelected: function(t) {
      var n = !1, l = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var o = jn(this.d_value), a;
          try {
            for (o.s(); !(a = o.n()).done; ) {
              var s = a.value;
              if (ye(s, l, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (r) {
            o.e(r);
          } finally {
            o.f();
          }
        }
      } else
        n = ye(this.d_value, l, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return xe({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: We
  },
  components: {
    ToggleButton: qe
  }
}, Un = ["aria-labelledby", "data-p"];
function zn(e, t, n, l, o, a) {
  var s = tt("ToggleButton");
  return v(), p("div", F({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [(v(!0), p(D, null, K(e.options, function(r, i) {
    return v(), R(s, {
      key: a.getOptionRenderKey(r),
      modelValue: a.isSelected(r),
      onLabel: a.getOptionLabel(r),
      offLabel: a.getOptionLabel(r),
      disabled: e.disabled || a.isOptionDisabled(r),
      unstyled: e.unstyled,
      size: e.size,
      readonly: a.isOptionReadonly(r),
      onChange: function(b) {
        return a.onOptionSelect(b, r, i);
      },
      pt: e.ptm("pcToggleButton")
    }, nt({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: te(function() {
        return [Z(e.$slots, "option", {
          option: r,
          index: i
        }, function() {
          return [u("span", F({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), S(a.getOptionLabel(r)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Un);
}
Pe.render = zn;
function Kn(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Re(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Wn(e) {
  const t = N(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = E(null), l = E(""), o = E(!1), a = E(0);
  let s = 0;
  async function r() {
    const b = ++s;
    if (!e.value) return !1;
    try {
      const f = await J(e.value).status();
      return b !== s ? !1 : (n.value = f, l.value = "", a.value++, !0);
    } catch (f) {
      return b === s && (l.value = le(f)), !1;
    }
  }
  async function i(b) {
    o.value = !0, l.value = "";
    try {
      return await b(), await r();
    } catch (f) {
      return l.value = le(f), !1;
    } finally {
      o.value = !1;
    }
  }
  let c = null;
  return q(e, (b) => {
    if (c && c(), c = null, s++, n.value = null, l.value = "", !b) return;
    const f = it(`component.${b}`, () => {
      r();
    });
    c = typeof f == "function" ? f : null, r();
  }, { immediate: !0 }), ot(() => {
    c && c();
  }), $t(async () => {
    await r();
  }), { memoryId: e, base: t, status: n, error: l, busy: o, revision: a, act: i };
}
const Fn = { class: "mm-field" }, Hn = { class: "mm-hint" }, qn = { class: "mm-field" }, Jn = ["selected"], Yn = {
  key: 1,
  class: "kx-notice error"
}, Gn = { class: "mm-field" }, Qn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Xn = {
  key: 1,
  class: "mm-hint"
}, Zn = {
  key: 2,
  class: "kx-notice error"
}, eo = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, to = ["onClick"], no = { class: "mm-field" }, oo = { class: "mm-form-foot" }, ao = ["disabled"], lo = /* @__PURE__ */ G({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], a = E("rule"), s = E(""), r = E(""), i = E(""), c = Pt("wc-agent-picker"), b = N(() => o.find((O) => O.value === a.value)?.hint || ""), f = N(() => Kn(r.value)), $ = N(() => r.value && !Re(f.value) ? "Use a short topic of letters, digits and spaces." : ""), y = N(() => !!s.value && Re(f.value) && !!i.value.trim()), g = Te(
      () => n.memory.memoryId.value ? [n.memory.memoryId.value, a.value] : null,
      (O) => J(n.memory.memoryId.value).topics({ kind: a.value, offset: O }),
      n.memory.revision
    ), w = N(() => g.rows.value.map((O) => O.key).filter((O) => O !== f.value).slice(0, 8));
    q(a, () => {
      r.value = "";
    });
    function C(O) {
      const h = _t(O).selected;
      s.value = String((Array.isArray(h) ? h : [])[0] || "");
    }
    async function I() {
      if (!y.value) return;
      let O = null;
      await n.memory.act(async () => {
        O = await J(n.memory.memoryId.value).create({
          kind: a.value,
          scope_family: "agent",
          scope_id: s.value,
          key: f.value,
          value: i.value.trim(),
          content: i.value.trim()
        });
      }) && O !== null && l("added", O);
    }
    return (O, h) => (v(), p("form", {
      class: "mm-form",
      onSubmit: ze(I, ["prevent"])
    }, [
      u("div", Fn, [
        h[3] || (h[3] = u("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        x(d(Pe), {
          modelValue: a.value,
          "onUpdate:modelValue": h[0] || (h[0] = (m) => a.value = m),
          options: o,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        u("span", Hn, [
          x(d(V), {
            icon: d(X)[a.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          j(S(b.value), 1)
        ])
      ]),
      u("div", qn, [
        h[4] || (h[4] = u("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        d(c).ready.value ? (v(), p("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: s.value ? JSON.stringify([s.value]) : "[]",
          onChange: C
        }, null, 40, Jn)) : d(c).failed.value ? (v(), p("div", Yn, "The agent picker could not load: " + S(d(c).failed.value), 1)) : A("", !0)
      ]),
      u("div", Gn, [
        h[5] || (h[5] = u("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        x(d(At), {
          id: "add_topic",
          modelValue: r.value,
          "onUpdate:modelValue": h[1] || (h[1] = (m) => r.value = m),
          placeholder: "e.g. response style",
          invalid: !!$.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        $.value ? (v(), p("span", Qn, S($.value), 1)) : (v(), p("span", Xn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        d(g).error.value ? (v(), p("div", Zn, S(d(g).error.value), 1)) : A("", !0),
        w.value.length ? (v(), p("div", eo, [
          (v(!0), p(D, null, K(w.value, (m) => (v(), p("button", {
            key: m,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (T) => r.value = d(Y)(m)
          }, S(d(Y)(m)), 9, to))), 128))
        ])) : A("", !0)
      ]),
      u("div", no, [
        h[6] || (h[6] = u("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        x(d(ke), {
          id: "add_text",
          modelValue: i.value,
          "onUpdate:modelValue": h[2] || (h[2] = (m) => i.value = m),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      u("div", oo, [
        u("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !y.value
        }, [
          x(d(V), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: U({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          h[7] || (h[7] = j("Add to memory ", -1))
        ], 8, ao)
      ])
    ], 32));
  }
}), ro = { class: "mm-view-head" }, io = { class: "mm-view-title" }, so = {
  key: 0,
  class: "kx-notice error"
}, uo = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, co = { class: "kx-empty-ico" }, mo = ["aria-label"], vo = { class: "mm-card-h" }, fo = { class: "kx-chip" }, po = { class: "mm-option-main" }, go = { class: "mm-option-t" }, bo = { class: "mm-muted" }, yo = ["disabled", "onClick"], ho = ["disabled"], ko = /* @__PURE__ */ G({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = Te(() => t.memory.memoryId.value || null, (o) => J(t.memory.memoryId.value).conflicts(o), t.memory.revision);
    function l(o, a) {
      t.memory.act(() => J(t.memory.memoryId.value).resolve(o.group_id, a.id));
    }
    return (o, a) => (v(), p(D, null, [
      u("header", ro, [
        u("h2", io, [
          x(d(V), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          a[1] || (a[1] = j("Conflicts", -1))
        ]),
        a[2] || (a[2] = u("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      d(n).error.value ? (v(), p("div", so, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, S(d(n).error.value), 1)
      ])) : !d(n).loading.value && !d(n).rows.value.length ? (v(), p("div", uo, [
        u("span", co, [
          x(d(V), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        a[3] || (a[3] = u("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        a[4] || (a[4] = u("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : A("", !0),
      (v(!0), p(D, null, K(d(n).rows.value, (s) => (v(), p("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${d(Y)(s.items[0].key)}`
      }, [
        u("div", vo, [
          u("span", fo, S(d(X)[s.items[0].kind].label), 1),
          j(S(d(Y)(s.items[0].key)), 1)
        ]),
        (v(!0), p(D, null, K(s.items, (r) => (v(), p("div", {
          key: r.id,
          class: "mm-option"
        }, [
          u("div", po, [
            u("span", go, S(r.content), 1),
            u("span", bo, S(d(Q)(r.valid_at)) + " · " + S(d(un)(r.source)), 1)
          ]),
          u("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (i) => l(s, r)
          }, [
            x(d(V), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            a[5] || (a[5] = j("Keep this ", -1))
          ], 8, yo)
        ]))), 128))
      ], 8, mo))), 128)),
      d(n).next.value !== null ? (v(), p("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: d(n).loading.value,
        onClick: a[0] || (a[0] = //@ts-ignore
        (...s) => d(n).more && d(n).more(...s))
      }, "Show more conflicts", 8, ho)) : A("", !0)
    ], 64));
  }
}), $o = ["aria-label", "title", "aria-pressed", "disabled"], fe = /* @__PURE__ */ G({
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
    return (l, o) => (v(), p("button", {
      type: "button",
      class: U(["kx-iconbtn", { on: e.active }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: o[0] || (o[0] = (a) => n("click"))
    }, [
      x(d(V), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, $o));
  }
}), Ye = /* @__PURE__ */ G({
  __name: "AccessibleOverlay",
  props: {
    open: { type: Boolean },
    kind: {},
    dismissible: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = E(null);
    let a = null;
    const s = /* @__PURE__ */ new Map();
    function r(y) {
      const g = y.getRootNode(), w = g instanceof ShadowRoot ? g.activeElement : document.activeElement;
      return w instanceof HTMLElement ? w : null;
    }
    function i(y) {
      let g = y;
      for (; g; ) {
        const w = g.parentNode;
        if (!(w instanceof HTMLElement || w instanceof ShadowRoot)) break;
        for (const C of Array.from(w.children))
          C instanceof HTMLElement && C !== g && !s.has(C) && (s.set(C, C.inert), C.inert = !0);
        g = w instanceof ShadowRoot ? w.host : w;
      }
    }
    function c() {
      for (const [y, g] of s) y.inert = g;
      s.clear();
    }
    function b() {
      return o.value ? Array.from(o.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((y) => !y.hasAttribute("disabled")) : [];
    }
    function f(y) {
      if (y.key === "Escape" && n.dismissible) {
        y.preventDefault(), l("close");
        return;
      }
      if (y.key !== "Tab") return;
      const g = b();
      if (!g.length) {
        y.preventDefault();
        return;
      }
      const w = g[0], C = o.value ? r(o.value) : null, I = g.indexOf(C || w), O = g[(I + (y.shiftKey ? -1 : 1) + g.length) % g.length];
      y.preventDefault(), O.focus();
    }
    async function $(y) {
      if (y) {
        if (await Ae(), !o.value) return;
        a = r(o.value), i(o.value), (o.value.querySelector("[data-overlay-initial]") || b()[0])?.focus();
        return;
      }
      c();
      const g = a;
      a = null, await Ae(), g?.focus();
    }
    return q(() => n.open, (y) => {
      $(y);
    }, { immediate: !0 }), at(() => {
      c(), a?.focus(), a = null;
    }), (y, g) => (v(), R(lt, {
      name: e.kind === "drawer" ? "kx-drawer" : "kx-modal"
    }, {
      default: te(() => [
        e.open ? (v(), p("div", {
          key: 0,
          ref_key: "overlay",
          ref: o,
          class: U(e.kind === "drawer" ? "kx-drawer-mask" : "kx-modal-mask"),
          onKeydown: f,
          onClick: g[0] || (g[0] = ze((w) => e.dismissible && l("close"), ["self"]))
        }, [
          Z(y.$slots, "default")
        ], 34)) : A("", !0)
      ]),
      _: 3
    }, 8, ["name"]));
  }
}), _o = ["aria-label"], wo = { class: "kx-drawer-h" }, So = { class: "kx-drawer-title" }, xo = { class: "kx-drawer-b" }, To = /* @__PURE__ */ G({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t;
    return (l, o) => (v(), R(Ye, {
      open: e.open,
      kind: "drawer",
      onClose: o[1] || (o[1] = (a) => n("close"))
    }, {
      default: te(() => [
        u("aside", {
          class: "kx-drawer",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": e.title
        }, [
          u("div", wo, [
            u("span", So, [
              x(d(V), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              j(S(e.title), 1)
            ]),
            x(fe, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              onClick: o[0] || (o[0] = (a) => n("close"))
            })
          ]),
          u("div", xo, [
            Z(l.$slots, "default")
          ])
        ], 8, _o)
      ]),
      _: 3
    }, 8, ["open"]));
  }
}), Co = ["aria-label"], Po = { class: "kx-modal-h" }, Ao = { class: "kx-modal-h-ico" }, Oo = { class: "kx-modal-h-text" }, Lo = { class: "kx-modal-h-title" }, Vo = {
  key: 0,
  class: "kx-modal-h-sub"
}, Io = { class: "kx-modal-body" }, Eo = { class: "kx-modal-foot" }, Bo = ["disabled"], jo = ["disabled"], Do = /* @__PURE__ */ G({
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
    return (l, o) => (v(), R(Ye, {
      open: e.open,
      kind: "dialog",
      dismissible: !e.busy,
      onClose: o[3] || (o[3] = (a) => n("cancel"))
    }, {
      default: te(() => [
        u("div", {
          class: U(["kx-modal", { danger: e.danger }]),
          role: "alertdialog",
          "aria-modal": "true",
          "aria-label": e.title
        }, [
          u("div", Po, [
            u("span", Ao, [
              x(d(V), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", Oo, [
              u("span", Lo, S(e.title), 1),
              e.subtitle ? (v(), p("span", Vo, S(e.subtitle), 1)) : A("", !0)
            ]),
            x(fe, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              disabled: e.busy,
              onClick: o[0] || (o[0] = (a) => n("cancel"))
            }, null, 8, ["disabled"])
          ]),
          u("div", Io, [
            Z(l.$slots, "default")
          ]),
          u("div", Eo, [
            u("button", {
              type: "button",
              class: "kx-btn kx-btn-ghost",
              disabled: e.busy,
              onClick: o[1] || (o[1] = (a) => n("cancel"))
            }, "Cancel", 8, Bo),
            u("button", {
              type: "button",
              class: U(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
              disabled: e.busy,
              onClick: o[2] || (o[2] = (a) => n("confirm"))
            }, [
              e.busy ? (v(), R(d(V), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : A("", !0),
              j(S(e.confirmLabel), 1)
            ], 10, jo)
          ])
        ], 10, Co)
      ]),
      _: 3
    }, 8, ["open", "dismissible"]));
  }
}), Mo = {
  key: 0,
  class: "kx-notice error"
}, No = {
  key: 1,
  class: "mm-skel-reader"
}, Ro = {
  key: 2,
  class: "mm-reader"
}, Uo = { class: "mm-head" }, zo = { class: "mm-head-body" }, Ko = { class: "mm-head-top" }, Wo = { class: "kx-chip" }, Fo = { class: "mm-topic" }, Ho = { class: "mm-head-acts" }, qo = ["disabled"], Jo = ["disabled"], Yo = ["disabled"], Go = {
  key: 0,
  class: "mm-edit"
}, Qo = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Xo = { class: "mm-edit-acts" }, Zo = ["disabled"], ea = {
  key: 1,
  class: "mm-title"
}, ta = { class: "mm-facts" }, na = {
  key: 0,
  class: "mm-fact"
}, oa = ["title"], aa = ["title"], la = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-details"
}, ra = { class: "mm-value-fields" }, ia = {
  key: 1,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, sa = { class: "mm-timeline" }, ua = { class: "mm-tl-body" }, da = { class: "mm-tl-t" }, ca = { class: "mm-tl-s" }, ma = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, va = {
  key: 0,
  class: "mm-muted"
}, fa = {
  key: 1,
  class: "mm-sources"
}, pa = { class: "mm-source-body" }, ga = { class: "mm-source-head" }, ba = ["title"], ya = {
  key: 0,
  class: "mm-quote"
}, ha = ["onClick"], ka = { class: "mm-source-topic" }, $a = ["onClick"], _a = /* @__PURE__ */ G({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = E(null), a = E([]), s = E(null), r = E([]), i = E(""), c = E(null), b = E(null), f = E(""), $ = E(!1), y = N(() => o.value ? X[o.value.kind] : null), g = N(() => o.value ? X[o.value.kind].icon : "tabler:brain"), w = N(() => o.value?.status === "current" || o.value?.status === "conflict"), C = N(() => o.value ? rn(o.value.value, o.value.key) : []);
    let I = 0;
    async function O(B = 0, k) {
      const _ = ++I;
      try {
        const M = await J(n.memory.memoryId.value).item(n.itemId, B, k);
        if (_ !== I) return;
        if (!B) {
          const oe = M.item;
          if (oe.status === "forgotten") {
            l("gone");
            return;
          }
          o.value = oe, r.value = M.provenance;
        }
        const z = M.versions;
        a.value = B ? [...a.value, ...z.rows] : z.rows, s.value = z.next, i.value = "";
      } catch (M) {
        if (_ !== I) return;
        Be(M) === 404 ? l("gone") : i.value = le(M);
      }
    }
    q(() => n.itemId, () => {
      o.value = null, a.value = [], c.value = null, b.value = null, f.value = "", $.value = !1, O();
    }, { immediate: !0 });
    async function h() {
      const B = ++I, k = a.value.length;
      try {
        let _ = 0, M = null;
        const z = [];
        let oe = !0;
        do {
          const Xe = Math.min(100, Math.max(1, k - z.length)), ae = await J(n.memory.memoryId.value).item(n.itemId, _, Xe);
          if (B !== I) return;
          if (oe) {
            if (ae.item.status === "forgotten") {
              l("gone");
              return;
            }
            o.value = ae.item, r.value = ae.provenance, oe = !1;
          }
          z.push(...ae.versions.rows), M = ae.versions.next, _ = M ?? 0;
        } while (z.length < k && M !== null);
        a.value = z, s.value = M, i.value = "";
      } catch (_) {
        B === I && (Be(_) === 404 ? l("gone") : i.value = le(_));
      }
    }
    q(n.memory.revision, () => {
      h();
    });
    function m(B) {
      return n.memory.act(() => J(n.memory.memoryId.value).act(n.itemId, B));
    }
    async function T() {
      const B = (c.value || "").trim();
      if (!B || !o.value) return;
      let k;
      if (b.value !== null)
        try {
          k = JSON.parse(b.value);
        } catch {
          f.value = "Details must be valid JSON.";
          return;
        }
      await n.memory.act(async () => {
        const M = b.value === null ? { content: B } : { content: B, value: k }, z = await J(n.memory.memoryId.value).edit(n.itemId, M);
        z && z !== n.itemId && l("replaced", z);
      }) && (c.value = null, b.value = null, f.value = "");
    }
    function W() {
      o.value && (c.value = o.value.content, b.value = o.value.value === void 0 ? null : JSON.stringify(o.value.value, null, 2), f.value = "");
    }
    async function ne() {
      await m("forget") && ($.value = !1, l("gone"));
    }
    function Ge(B) {
      return B.host_kind === "item" ? "tabler:brain" : B.host_kind === "content" ? "tabler:file-text" : B.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function Qe(B) {
      if (B.line) {
        if (B.line.role === "tool") return "Tool result";
        if (B.line.role === "document") return "Document";
        const k = B.line.author;
        return k?.kind === "user" ? "They said" : k?.kind === "system" ? "Workflow input" : k?.kind === "agent" ? o.value?.scope_family === "agent" && o.value.scope_id === k.id ? "The agent said" : `Task from ${k.id || "an agent"}` : "Message";
      }
      return B.host_kind === "item" ? B.memory ? "From the memory" : "From a memory that is no longer kept" : B.host_kind === "content" ? "A document" : B.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (B, k) => (v(), p(D, null, [
      i.value ? (v(), p("div", Mo, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, S(i.value), 1)
      ])) : o.value ? (v(), p("article", Ro, [
        u("header", Uo, [
          u("span", {
            class: U(["mm-head-ic", y.value?.tone])
          }, [
            x(d(V), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          u("div", zo, [
            u("div", Ko, [
              u("span", Wo, S(y.value?.label), 1),
              u("span", Fo, S(d(Y)(o.value.key)), 1),
              o.value.status !== "current" ? (v(), R(d(Ce), {
                key: 0,
                class: "kx-tag-sm",
                severity: d(Fe)(o.value.status),
                value: d(we)[o.value.status]
              }, null, 8, ["severity", "value"])) : A("", !0),
              u("span", Ho, [
                w.value && c.value === null ? (v(), p("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: W
                }, [
                  x(d(V), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  k[8] || (k[8] = j("Edit ", -1))
                ])) : A("", !0),
                w.value ? (v(), p("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: k[0] || (k[0] = (_) => m("archive"))
                }, [
                  x(d(V), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  k[9] || (k[9] = j("Archive ", -1))
                ], 8, qo)) : A("", !0),
                o.value.status === "archived" ? (v(), p("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: k[1] || (k[1] = (_) => m("restore"))
                }, [
                  x(d(V), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  k[10] || (k[10] = j("Restore ", -1))
                ], 8, Jo)) : A("", !0),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: k[2] || (k[2] = (_) => $.value = !0)
                }, [
                  x(d(V), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  k[11] || (k[11] = j("Forget ", -1))
                ], 8, Yo)
              ])
            ]),
            c.value !== null ? (v(), p("div", Go, [
              k[14] || (k[14] = u("label", {
                class: "mm-label",
                for: "memory_content"
              }, "Memory text", -1)),
              x(d(ke), {
                id: "memory_content",
                modelValue: c.value,
                "onUpdate:modelValue": k[3] || (k[3] = (_) => c.value = _),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              b.value !== null ? (v(), p(D, { key: 0 }, [
                k[12] || (k[12] = u("label", {
                  class: "mm-label",
                  for: "memory_value"
                }, "Details", -1)),
                x(d(ke), {
                  id: "memory_value",
                  modelValue: b.value,
                  "onUpdate:modelValue": k[4] || (k[4] = (_) => b.value = _),
                  "auto-resize": "",
                  rows: "5",
                  "aria-label": "Details"
                }, null, 8, ["modelValue"]),
                f.value ? (v(), p("span", Qo, S(f.value), 1)) : A("", !0)
              ], 64)) : A("", !0),
              u("div", Xo, [
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !c.value.trim(),
                  onClick: T
                }, [
                  x(d(V), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  k[13] || (k[13] = j("Save ", -1))
                ], 8, Zo),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: k[5] || (k[5] = (_) => {
                    c.value = null, b.value = null, f.value = "";
                  })
                }, "Cancel")
              ])
            ])) : (v(), p("h2", ea, S(o.value.content), 1)),
            u("div", ta, [
              o.value.scope_family === "agent" ? (v(), p("span", na, [
                x(d(V), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                k[15] || (k[15] = j("About the agent itself", -1))
              ])) : A("", !0),
              u("span", {
                class: "mm-fact",
                title: d(ve)(o.value.valid_at)
              }, [
                x(d(V), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                j("True since " + S(d(Q)(o.value.valid_at)), 1)
              ], 8, oa),
              o.value.invalid_at ? (v(), p("span", {
                key: 1,
                class: "mm-fact",
                title: d(ve)(o.value.invalid_at)
              }, [
                x(d(V), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                j("Until " + S(d(Q)(o.value.invalid_at)), 1)
              ], 8, aa)) : A("", !0)
            ])
          ])
        ]),
        c.value === null && C.value.length ? (v(), p("section", la, [
          k[16] || (k[16] = u("h3", {
            id: "mm-details",
            class: "mm-sec-h"
          }, "Details", -1)),
          u("dl", ra, [
            (v(!0), p(D, null, K(C.value, (_, M) => (v(), p("div", { key: M }, [
              u("dt", null, S(_.label), 1),
              u("dd", null, S(_.text), 1)
            ]))), 128))
          ])
        ])) : A("", !0),
        a.value.length > 1 || s.value !== null ? (v(), p("section", ia, [
          k[18] || (k[18] = u("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          u("ol", sa, [
            (v(!0), p(D, null, K(a.value, (_) => (v(), p("li", {
              key: _.id,
              class: U({ now: _.id === o.value.id, past: _.status !== "current" })
            }, [
              k[17] || (k[17] = u("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              u("span", ua, [
                u("span", da, S(_.content), 1),
                u("span", ca, [
                  j("v" + S(_.version) + " · " + S(d(Q)(_.valid_at)), 1),
                  _.status !== "current" ? (v(), p(D, { key: 0 }, [
                    j(" · " + S(d(we)[_.status]), 1)
                  ], 64)) : A("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (v(), p("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: k[6] || (k[6] = (_) => O(s.value))
          }, "Show older versions")) : A("", !0)
        ])) : A("", !0),
        u("section", ma, [
          k[20] || (k[20] = u("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          r.value.length ? (v(), p("ul", fa, [
            (v(!0), p(D, null, K(r.value, (_) => (v(), p("li", {
              key: _.host_kind + _.host_id + _.event_id,
              class: "mm-source"
            }, [
              x(d(V), {
                class: "mm-source-ic",
                icon: Ge(_),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              u("div", pa, [
                u("div", ga, [
                  u("span", null, S(Qe(_)), 1),
                  _.line?.created_at || _.recorded_at ? (v(), p("span", {
                    key: 0,
                    class: "mm-muted",
                    title: d(ve)(_.line?.created_at || _.recorded_at || "")
                  }, S(d(Q)(_.line?.created_at || _.recorded_at || "")), 9, ba)) : A("", !0)
                ]),
                _.line ? (v(), p("blockquote", ya, S(_.line.text), 1)) : A("", !0),
                _.memory ? (v(), p("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (M) => l("open", _.memory.id)
                }, [
                  u("span", ka, S(d(Y)(_.memory.key)), 1),
                  u("span", null, S(_.memory.content), 1)
                ], 8, ha)) : A("", !0),
                _.host_kind === "session" ? (v(), p("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (M) => l("conversation", _.host_id)
                }, [
                  x(d(V), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  k[19] || (k[19] = j("Open conversation ", -1))
                ], 8, $a)) : A("", !0)
              ])
            ]))), 128))
          ])) : (v(), p("p", va, S(o.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (v(), p("div", No, [
        (v(), p(D, null, K(4, (_) => u("div", {
          key: _,
          class: "mm-skel-line"
        })), 64))
      ])),
      x(Do, {
        open: $.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: o.value ? d(Y)(o.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: k[7] || (k[7] = (_) => $.value = !1),
        onConfirm: ne
      }, {
        default: te(() => [...k[21] || (k[21] = [
          j(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), wa = { class: "mm-rail-tools" }, Sa = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, xa = {
  key: 0,
  class: "mm-skel"
}, Ta = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Ca = {
  key: 2,
  class: "mm-rail-empty"
}, Pa = ["aria-expanded", "onClick"], Aa = { class: "kx-railsec-t" }, Oa = { class: "kx-railsec-b" }, La = ["aria-current", "onClick"], Va = { class: "mm-row-main" }, Ia = { class: "mm-row-t" }, Ea = { class: "mm-row-s" }, Ba = ["disabled"], ja = /* @__PURE__ */ G({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], a = E("current"), s = E(""), r = Ot(s, 250, ($) => $.trim()), i = Te(() => n.memory.memoryId.value ? [n.memory.memoryId.value, a.value, r.value] : null, ($) => J(n.memory.memoryId.value).items({ status: a.value, query: r.value, offset: $ }), n.memory.revision);
    q([a, r], () => {
      l("filtered"), l("status-change", a.value);
    });
    const c = E({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), b = N(() => ln.map(($) => ({ ...$, items: i.rows.value.filter((y) => X[y.kind].group === $.id) })).filter(($) => $.items.length)), f = N(() => r.value ? "No memories match this search." : a.value === "superseded" ? "No earlier versions yet." : a.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return ($, y) => (v(), p(D, null, [
      u("div", wa, [
        x(Lt, {
          modelValue: s.value,
          "onUpdate:modelValue": y[0] || (y[0] = (g) => s.value = g),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        x(d(Pe), {
          modelValue: a.value,
          "onUpdate:modelValue": y[1] || (y[1] = (g) => a.value = g),
          class: "mm-views",
          options: o,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      u("nav", Sa, [
        d(i).loading.value && !d(i).rows.value.length ? (v(), p("div", xa, [
          (v(), p(D, null, K(6, (g) => u("div", {
            key: g,
            class: "mm-skel-row"
          })), 64))
        ])) : d(i).error.value ? (v(), p("div", Ta, [
          x(d(V), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          u("span", null, S(d(i).error.value), 1)
        ])) : d(i).rows.value.length ? A("", !0) : (v(), p("div", Ca, S(f.value), 1)),
        (v(!0), p(D, null, K(b.value, (g) => (v(), p("div", {
          key: g.id,
          class: U(["kx-railsec", { closed: c.value[g.id] }])
        }, [
          u("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !c.value[g.id],
            onClick: (w) => c.value[g.id] = !c.value[g.id]
          }, [
            x(d(V), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            x(d(V), {
              class: "kx-railsec-ic",
              icon: g.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            u("span", Aa, S(g.title), 1)
          ], 8, Pa),
          Ue(u("div", Oa, [
            (v(!0), p(D, null, K(g.items, (w) => (v(), p("button", {
              key: w.id,
              type: "button",
              class: U(["mm-row", { on: e.selectedId === w.id }]),
              "aria-current": e.selectedId === w.id ? "true" : void 0,
              onClick: (C) => l("select", w)
            }, [
              u("span", {
                class: U(["mm-row-ic", d(X)[w.kind].tone])
              }, [
                x(d(V), {
                  icon: d(X)[w.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              u("span", Va, [
                u("span", Ia, S(w.content), 1),
                u("span", Ea, S(d(Y)(w.key)) + " · " + S(d(Q)(w.valid_at)), 1)
              ])
            ], 10, La))), 128))
          ], 512), [
            [rt, !c.value[g.id]]
          ])
        ], 2))), 128)),
        d(i).next.value !== null ? (v(), p("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: d(i).loading.value,
          onClick: y[2] || (y[2] = //@ts-ignore
          (...g) => d(i).more && d(i).more(...g))
        }, [
          d(i).loading.value ? (v(), R(d(V), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : A("", !0),
          y[3] || (y[3] = j("Show more ", -1))
        ], 8, Ba)) : A("", !0)
      ])
    ], 64));
  }
}), Da = {
  key: 0,
  class: "kx-notice error"
}, Ma = {
  key: 1,
  class: "mm-page"
}, Na = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Ra = { class: "kx-shell" }, Ua = { class: "kx-rail" }, za = { class: "kx-railhead" }, Ka = { class: "kx-railhead-title" }, Wa = { key: 0 }, Fa = { class: "kx-railhead-acts" }, Ha = { class: "kx-main" }, qa = { class: "kx-main-scroll mm-main" }, Ja = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, Ya = { class: "kx-empty-ico" }, Ga = /* @__PURE__ */ G({
  __name: "MemoryManage",
  setup(e) {
    const t = wt(), n = St(), l = E(""), o = E({});
    q(() => t.value.config, (h) => {
      try {
        o.value = xt(h), l.value = "";
      } catch (m) {
        l.value = le(m);
      }
    }, { immediate: !0 });
    const a = Wn(N(() => String(o.value.kb_id || ""))), s = E("item"), r = E(String(o.value.route || "")), i = E(!1), c = E("current"), b = N(() => a.status.value?.counts[c.value]), f = N(() => a.status.value?.counts.conflict_groups || 0), $ = N(() => (a.status.value?.runs || []).filter((h) => h.status === "failed").length);
    q(() => o.value.route, (h) => {
      const m = typeof h == "string" ? h : "";
      m !== r.value && (y = !0, r.value = m, m && (s.value = "item"));
    }), q(a.memoryId, () => {
      r.value = "", s.value = "item";
    });
    let y = !1;
    q(r, (h) => {
      if (y) {
        y = !1;
        return;
      }
      n("navigate", h || "");
    });
    function g(h) {
      n("kickside-chat-open", { kind: "session", sessionId: h });
    }
    function w(h) {
      s.value = "item", h !== r.value && (r.value = h);
    }
    function C(h) {
      w(h.id);
    }
    function I(h) {
      s.value = s.value === h ? "item" : h;
    }
    function O(h) {
      i.value = !1, h && w(h);
    }
    return (h, m) => l.value ? (v(), p("div", Da, S(l.value), 1)) : (v(), p("div", Ma, [
      d(a).error.value ? (v(), p("div", Na, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, S(d(a).error.value), 1)
      ])) : A("", !0),
      u("div", Ra, [
        u("aside", Ua, [
          u("div", za, [
            u("span", Ka, [
              m[7] || (m[7] = j("Memories", -1)),
              b.value !== void 0 ? (v(), p("b", Wa, S(b.value), 1)) : A("", !0)
            ]),
            u("div", Fa, [
              x(fe, {
                icon: "tabler:activity",
                label: $.value ? `Activity, ${$.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: m[0] || (m[0] = (T) => I("activity"))
              }, null, 8, ["label", "active"]),
              x(fe, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: m[1] || (m[1] = (T) => i.value = !0)
              })
            ])
          ]),
          f.value ? (v(), p("button", {
            key: 0,
            type: "button",
            class: U(["mm-conflict-bar", { on: s.value === "conflicts" }]),
            onClick: m[2] || (m[2] = (T) => I("conflicts"))
          }, [
            x(d(V), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            u("span", null, S(f.value === 1 ? "1 conflict to resolve" : `${f.value} conflicts to resolve`), 1),
            x(d(V), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : A("", !0),
          x(ja, {
            memory: d(a),
            "selected-id": s.value === "item" ? r.value : "",
            onSelect: C,
            onFiltered: m[3] || (m[3] = (T) => r.value = ""),
            onStatusChange: m[4] || (m[4] = (T) => c.value = T)
          }, null, 8, ["memory", "selected-id"])
        ]),
        u("main", Ha, [
          u("div", qa, [
            s.value === "conflicts" ? (v(), R(ko, {
              key: 0,
              memory: d(a)
            }, null, 8, ["memory"])) : s.value === "activity" ? (v(), R($n, {
              key: 1,
              memory: d(a)
            }, null, 8, ["memory"])) : r.value ? (v(), R(_a, {
              key: r.value,
              memory: d(a),
              "item-id": r.value,
              onReplaced: w,
              onOpen: w,
              onConversation: g,
              onGone: m[5] || (m[5] = (T) => r.value = "")
            }, null, 8, ["memory", "item-id"])) : (v(), p("div", Ja, [
              u("span", Ya, [
                x(d(V), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              m[8] || (m[8] = u("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              m[9] || (m[9] = u("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      x(To, {
        open: i.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: m[6] || (m[6] = (T) => i.value = !1)
      }, {
        default: te(() => [
          i.value ? (v(), R(lo, {
            key: 0,
            memory: d(a),
            onAdded: O
          }, null, 8, ["memory"])) : A("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), Qa = Tt(Ga, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
st(import.meta.url, Qa);
//# sourceMappingURL=index.js.map
