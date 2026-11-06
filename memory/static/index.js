import { mergeProps as W, openBlock as v, createElementBlock as f, createBlock as N, resolveDynamicComponent as et, createCommentVNode as O, renderSlot as Z, createElementVNode as u, toDisplayString as $, defineComponent as Y, computed as R, Fragment as D, createVNode as x, unref as d, createTextVNode as j, renderList as F, normalizeClass as U, resolveDirective as tt, withDirectives as Ue, resolveComponent as nt, createSlots as ot, withCtx as te, ref as I, watch as q, onUnmounted as at, withModifiers as ze, onBeforeUnmount as lt, Transition as it, nextTick as Oe, vShow as rt } from "vue";
import { Icon as V } from "@iconify/vue";
import { on as st, define as ut } from "@wippy-fe/proxy";
import { F as dt, d as ct, n as mt, N as Ae, S as ee, B as H, f as fe, g as ge, i as Le, h as vt, l as pt, P as de, C as ft, Q as gt, j as be, T as Ve, R as Ie, v as bt, k as yt, K as ht, W as kt, U as _t, s as Ee, o as ye, q as ce, r as $t, e as le, t as wt, w as St, u as xt, a as Tt, b as Ct, m as Pt } from "./types-Dpmtmezp.js";
import { B as he, s as Ot, f as xe, c as Ke, u as At, a as Lt, d as ke } from "./useWidget-ASETQ9fG.js";
import { m as J, a as Te, h as Be, u as Vt, _ as It } from "./usePaged-AO2JiKTb.js";
var me = {};
function Et(e = "pui_id_") {
  return Object.hasOwn(me, e) || (me[e] = 0), me[e]++, `${e}${me[e]}`;
}
function ie(e) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ie(e);
}
function je(e, t) {
  return Rt(e) || Dt(e, t) || jt(e, t) || Bt();
}
function Bt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jt(e, t) {
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
function Dt(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var l, o, a, s, i = [], r = !0, m = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(r = (l = a.call(n)).done) && (i.push(l.value), i.length !== t); r = !0) ;
    } catch (b) {
      m = !0, o = b;
    } finally {
      try {
        if (!r && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (m) throw o;
      }
    }
    return i;
  }
}
function Rt(e) {
  if (Array.isArray(e)) return e;
}
function Re(e, t) {
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
    t % 2 ? Re(Object(n), !0).forEach(function(l) {
      _e(e, l, n[l]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Re(Object(n)).forEach(function(l) {
      Object.defineProperty(e, l, Object.getOwnPropertyDescriptor(n, l));
    });
  }
  return e;
}
function _e(e, t, n) {
  return (t = Mt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mt(e) {
  var t = Nt(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function Nt(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ie(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var P = {
  _getMeta: function() {
    return [Le(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], vt(Le(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var l, o, a;
    return (l = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || l === void 0 ? void 0 : l.config;
  },
  _getOptionValue: dt,
  _getPTValue: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, r = function() {
      var A = P._getOptionValue.apply(P, arguments);
      return fe(A) || ft(A) ? {
        class: A
      } : A;
    }, m = ((t = l.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = l.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, b = m.mergeSections, p = b === void 0 ? !0 : b, _ = m.mergeProps, y = _ === void 0 ? !1 : _, g = i ? P._useDefaultPT(l, l.defaultPT(), r, a, s) : void 0, w = P._usePT(l, P._getPT(o, l.$name), r, a, L(L({}, s), {}, {
      global: g || {}
    })), T = P._getPTDatasets(l, a);
    return p || !p && w ? y ? P._mergeProps(l, y, g, w, T) : L(L(L({}, g), w), T) : L(L({}, w), T);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = "data-pc-";
    return L(L({}, n === "root" && _e({}, "".concat(l, "name"), ge(t.$name))), {}, _e({}, "".concat(l, "section"), ge(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var i, r = l ? l(s) : s, m = ge(n);
      return (i = r?.[m]) !== null && i !== void 0 ? i : r;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(T) {
      return l(T, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var i, r = n._usept || ((i = t.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, m = r.mergeSections, b = m === void 0 ? !0 : m, p = r.mergeProps, _ = p === void 0 ? !1 : p, y = s(n.originalValue), g = s(n.value);
      return y === void 0 && g === void 0 ? void 0 : fe(g) ? g : fe(y) ? y : b || !b && g ? _ ? P._mergeProps(t, _, y, g) : L(L({}, y), g) : g;
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
        var s, i, r = ((s = o.$style) === null || s === void 0 || (i = s.getCommonTheme) === null || i === void 0 ? void 0 : i.call(s)) || {}, m = r.primitive, b = r.semantic, p = r.global, _ = r.style;
        H.load(m?.css, L({
          name: "primitive-variables"
        }, a)), H.load(b?.css, L({
          name: "semantic-variables"
        }, a)), H.load(p?.css, L({
          name: "global-variables"
        }, a)), H.loadStyle(L({
          name: "global-style"
        }, a), _), ee.setLoadedStyleName("common");
      }
      if (!ee.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (l = o.$style) !== null && l !== void 0 && l.name) {
        var y, g, w, T, B = ((y = o.$style) === null || y === void 0 || (g = y.getDirectiveTheme) === null || g === void 0 ? void 0 : g.call(y)) || {}, A = B.css, k = B.style;
        (w = o.$style) === null || w === void 0 || w.load(A, L({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (T = o.$style) === null || T === void 0 || T.loadStyle(L({
          name: "".concat(o.$style.name, "-style")
        }, a), k), ee.setLoadedStyleName(o.$style.name);
      }
      if (!ee.isStyleNameLoaded("layer-order")) {
        var c, C, K = (c = o.$style) === null || c === void 0 || (C = c.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(c);
        H.load(K, L({
          name: "layer-order",
          first: !0
        }, a)), ee.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = t.preset();
    if (l && t.$attrSelector) {
      var o, a, s, i = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, l, "[".concat(t.$attrSelector, "]"))) || {}, r = i.css, m = (s = t.$style) === null || s === void 0 ? void 0 : s.load(r, L({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = m.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    he.clearLoadedStyleNames(), Ae.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Ae.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, l, o, a, s) {
    var i, r, m = "on".concat(mt(n)), b = P._getConfig(o, a), p = l?.$instance, _ = P._usePT(p, P._getPT(o == null || (i = o.value) === null || i === void 0 ? void 0 : i.pt, t), P._getOptionValue, "hooks.".concat(m)), y = P._useDefaultPT(p, b == null || (r = b.pt) === null || r === void 0 || (r = r.directives) === null || r === void 0 ? void 0 : r[t], P._getOptionValue, "hooks.".concat(m)), g = {
      el: l,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    _?.(p, g), y?.(p, g);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, l = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      l[o - 2] = arguments[o];
    return ct(t) ? t.apply(void 0, l) : W.apply(void 0, l);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = function(i, r, m, b, p) {
      var _, y, g, w;
      r._$instances = r._$instances || {};
      var T = P._getConfig(m, b), B = r._$instances[t] || {}, A = pt(B) ? L(L({}, n), n?.methods) : {};
      r._$instances[t] = L(L({}, B), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: r,
        $binding: m,
        $modifiers: m?.modifiers,
        $value: m?.value,
        $el: B.$el || r || void 0,
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
        $primevueConfig: T,
        $attrSelector: (_ = r.$pd) === null || _ === void 0 || (_ = _[t]) === null || _ === void 0 ? void 0 : _.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return P._getPT(T?.pt, void 0, function(c) {
            var C;
            return c == null || (C = c.directives) === null || C === void 0 ? void 0 : C[t];
          });
        },
        isUnstyled: function() {
          var c, C;
          return ((c = r._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.unstyled) !== void 0 ? (C = r._$instances[t]) === null || C === void 0 || (C = C.$binding) === null || C === void 0 || (C = C.value) === null || C === void 0 ? void 0 : C.unstyled : T?.unstyled;
        },
        theme: function() {
          var c;
          return (c = r._$instances[t]) === null || c === void 0 || (c = c.$primevueConfig) === null || c === void 0 ? void 0 : c.theme;
        },
        preset: function() {
          var c;
          return (c = r._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.dt;
        },
        /* instance's methods */
        ptm: function() {
          var c, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", K = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return P._getPTValue(r._$instances[t], (c = r._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.pt, C, L({}, K));
        },
        ptmo: function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", K = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P._getPTValue(r._$instances[t], c, C, K, !1);
        },
        cx: function() {
          var c, C, K = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", ne = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (c = r._$instances[t]) !== null && c !== void 0 && c.isUnstyled() ? void 0 : P._getOptionValue((C = r._$instances[t]) === null || C === void 0 || (C = C.$style) === null || C === void 0 ? void 0 : C.classes, K, L({}, ne));
        },
        sx: function() {
          var c, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", K = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, ne = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return K ? P._getOptionValue((c = r._$instances[t]) === null || c === void 0 || (c = c.$style) === null || c === void 0 ? void 0 : c.inlineStyles, C, L({}, ne)) : void 0;
        }
      }, A), r.$instance = r._$instances[t], (y = (g = r.$instance)[i]) === null || y === void 0 || y.call(g, r, m, b, p), r["$".concat(t)] = r.$instance, P._hook(t, i, r, m, b, p), r.$pd || (r.$pd = {}), r.$pd[t] = L(L({}, (w = r.$pd) === null || w === void 0 ? void 0 : w[t]), {}, {
        name: t,
        instance: r._$instances[t]
      });
    }, o = function(i) {
      var r, m, b, p = i._$instances[t], _ = p?.watch, y = function(T) {
        var B, A = T.newValue, k = T.oldValue;
        return _ == null || (B = _.config) === null || B === void 0 ? void 0 : B.call(p, A, k);
      }, g = function(T) {
        var B, A = T.newValue, k = T.oldValue;
        return _ == null || (B = _["config.ripple"]) === null || B === void 0 ? void 0 : B.call(p, A, k);
      };
      p.$watchersCallback = {
        config: y,
        "config.ripple": g
      }, _ == null || (r = _.config) === null || r === void 0 || r.call(p, p?.$primevueConfig), de.on("config:change", y), _ == null || (m = _["config.ripple"]) === null || m === void 0 || m.call(p, p == null || (b = p.$primevueConfig) === null || b === void 0 ? void 0 : b.ripple), de.on("config:ripple:change", g);
    }, a = function(i) {
      var r = i._$instances[t].$watchersCallback;
      r && (de.off("config:change", r.config), de.off("config:ripple:change", r["config.ripple"]), i._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(i, r, m, b) {
        i.$pd || (i.$pd = {}), i.$pd[t] = {
          name: t,
          attrSelector: Et("pd")
        }, l("created", i, r, m, b);
      },
      beforeMount: function(i, r, m, b) {
        var p;
        P._loadStyles((p = i.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, m), l("beforeMount", i, r, m, b), o(i);
      },
      mounted: function(i, r, m, b) {
        var p;
        P._loadStyles((p = i.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, m), l("mounted", i, r, m, b);
      },
      beforeUpdate: function(i, r, m, b) {
        l("beforeUpdate", i, r, m, b);
      },
      updated: function(i, r, m, b) {
        var p;
        P._loadStyles((p = i.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, m), l("updated", i, r, m, b);
      },
      beforeUnmount: function(i, r, m, b) {
        var p;
        a(i), P._removeThemeListeners((p = i.$pd[t]) === null || p === void 0 ? void 0 : p.instance), l("beforeUnmount", i, r, m, b);
      },
      unmounted: function(i, r, m, b) {
        var p;
        (p = i.$pd[t]) === null || p === void 0 || (p = p.instance) === null || p === void 0 || (p = p.scopedStyleEl) === null || p === void 0 || (p = p.value) === null || p === void 0 || p.remove(), l("unmounted", i, r, m, b);
      }
    };
  },
  extend: function() {
    var t = P._getMeta.apply(P, arguments), n = je(t, 2), l = n[0], o = n[1];
    return L({
      extend: function() {
        var s = P._getMeta.apply(P, arguments), i = je(s, 2), r = i[0], m = i[1];
        return P.extend(r, L(L(L({}, o), o?.methods), m));
      }
    }, P._extend(l, o));
  }
}, Ut = `
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
`, zt = {
  root: "p-ink"
}, Kt = H.extend({
  name: "ripple-directive",
  style: Ut,
  classes: zt
}), Wt = P.extend({
  style: Kt
});
function re(e) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, re(e);
}
function Ft(e) {
  return Yt(e) || Jt(e) || qt(e) || Ht();
}
function Ht() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qt(e, t) {
  if (e) {
    if (typeof e == "string") return $e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $e(e, t) : void 0;
  }
}
function Jt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Yt(e) {
  if (Array.isArray(e)) return $e(e);
}
function $e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Me(e, t, n) {
  return (t = Gt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gt(e) {
  var t = Qt(e, "string");
  return re(t) == "symbol" ? t : t + "";
}
function Qt(e, t) {
  if (re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (re(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var We = Wt.extend("ripple", {
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
      n || (n = _t("span", Me(Me({
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
          var a = Math.max(bt(l), yt(l));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = ht(l), i = t.pageX - s.left + document.body.scrollTop - Ie(o) / 2, r = t.pageY - s.top + document.body.scrollLeft - Ve(o) / 2;
        o.style.top = r + "px", o.style.left = i + "px", !this.isUnstyled() && kt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && be(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && be(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ft(t.children).find(function(n) {
        return gt(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Xt = `
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
`, Zt = {
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
}, en = H.extend({
  name: "tag",
  style: Xt,
  classes: Zt
}), tn = {
  name: "BaseTag",
  extends: Ot,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: en,
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
function nn(e, t, n) {
  return (t = on(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function on(e) {
  var t = an(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function an(e, t) {
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
  extends: tn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return xe(nn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ln = ["data-p"];
function rn(e, t, n, l, o, a) {
  return v(), f("span", W({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), N(et(e.$slots.icon), W({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), f("span", W({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : O("", !0), e.value != null || e.$slots.default ? Z(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", W({
      class: e.cx("label")
    }, e.ptm("label")), $(e.value), 17)];
  }) : O("", !0)], 16, ln);
}
Ce.render = rn;
const X = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, sn = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function G(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
const un = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function dn(e) {
  return un[e];
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
}, cn = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Fe(e) {
  return cn[e] ?? "secondary";
}
function He(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function ve(e) {
  const t = He(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const mn = [
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
  for (const [a, s] of mn)
    if (Math.abs(l) >= s) return o.format(Math.round(l / s), a);
  return "just now";
}
const vn = { class: "mm-view-head" }, pn = { class: "mm-view-title" }, fn = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, gn = { class: "kx-empty-ico" }, bn = {
  key: 1,
  class: "mm-runs"
}, yn = { class: "mm-run-main" }, hn = { class: "mm-run-t" }, kn = ["title"], _n = {
  key: 0,
  class: "mm-run-err"
}, $n = {
  key: 0,
  class: "mm-muted"
}, wn = { key: 1 }, Sn = { class: "mm-value" }, xn = /* @__PURE__ */ Y({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = R(() => t.memory.status.value?.runs || []);
    function l(a) {
      return a.run_type === "consolidate" ? "Consolidation" : a.run_type === "reembed" ? "Re-embedding" : a.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function o(a) {
      const s = a.stats || {}, i = [
        s.added ? `${s.added} new` : "",
        s.superseded ? `${s.superseded} updated` : "",
        s.conflicted ? `${s.conflicted} contested` : "",
        s.rejected ? `${s.rejected} rejected` : ""
      ].filter(Boolean);
      return i.length ? i.join(" · ") : a.status === "succeeded" ? "No changes" : "";
    }
    return (a, s) => (v(), f(D, null, [
      u("header", vn, [
        u("h2", pn, [
          x(d(V), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = j("Activity", -1))
        ]),
        s[1] || (s[1] = u("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (v(), f("ol", bn, [
        (v(!0), f(D, null, F(n.value, (i) => (v(), f("li", {
          key: i.id,
          class: U(["mm-run", i.status])
        }, [
          u("div", yn, [
            u("span", hn, $(l(i)), 1),
            u("span", {
              class: "mm-muted",
              title: d(ve)(i.finished_at || i.started_at || i.created_at)
            }, [
              j($(d(Q)(i.finished_at || i.started_at || i.created_at)), 1),
              o(i) ? (v(), f(D, { key: 0 }, [
                j(" · " + $(o(i)), 1)
              ], 64)) : O("", !0)
            ], 8, kn),
            i.last_error ? (v(), f("span", _n, $(i.last_error), 1)) : O("", !0),
            i.status === "failed" ? (v(), f(D, { key: 1 }, [
              i.to_event_id ? (v(), f("span", $n, "Range: " + $(i.from_event_id || "Beginning") + " → " + $(i.to_event_id), 1)) : O("", !0),
              i.model_output !== void 0 ? (v(), f("details", wn, [
                s[4] || (s[4] = u("summary", null, "Rejected model output", -1)),
                u("pre", Sn, $(JSON.stringify(i.model_output, null, 2)), 1)
              ])) : O("", !0)
            ], 64)) : O("", !0)
          ]),
          i.status !== "succeeded" ? (v(), N(d(Ce), {
            key: 0,
            class: "kx-tag-sm",
            severity: d(Fe)(i.status),
            value: d(we)[i.status]
          }, null, 8, ["severity", "value"])) : O("", !0)
        ], 2))), 128))
      ])) : (v(), f("div", fn, [
        u("span", gn, [
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
var Tn = `
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
`, Cn = {
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
}, Pn = H.extend({
  name: "togglebutton",
  style: Tn,
  classes: Cn
}), On = {
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
  style: Pn,
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
function An(e, t, n) {
  return (t = Ln(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ln(e) {
  var t = Vn(e, "string");
  return ue(t) == "symbol" ? t : t + "";
}
function Vn(e, t) {
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
  extends: On,
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
      return xe(An({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: We
  }
}, In = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], En = ["data-p"];
function Bn(e, t, n, l, o, a) {
  var s = tt("ripple");
  return Ue((v(), f("button", W({
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
  }), [u("span", W({
    class: e.cx("content")
  }, a.getPTOptions("content"), {
    "data-p": a.dataP
  }), [Z(e.$slots, "default", {}, function() {
    return [Z(e.$slots, "icon", {
      value: e.d_value,
      class: U(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (v(), f("span", W({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, a.getPTOptions("icon")), null, 16)) : O("", !0)];
    }), u("span", W({
      class: e.cx("label")
    }, a.getPTOptions("label")), $(a.label), 17)];
  })], 16, En)], 16, In)), [[s]]);
}
qe.render = Bn;
var jn = `
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
`, Dn = {
  root: function(t) {
    var n = t.props, l = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": l.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, Rn = H.extend({
  name: "selectbutton",
  style: jn,
  classes: Dn
}), Mn = {
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
  style: Rn,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Nn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Je(e)) || t) {
      n && (e = n);
      var l = 0, o = function() {
      };
      return { s: o, n: function() {
        return l >= e.length ? { done: !0 } : { done: !1, value: e[l++] };
      }, e: function(m) {
        throw m;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, s = !0, i = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var m = n.next();
    return s = m.done, m;
  }, e: function(m) {
    i = !0, a = m;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (i) throw a;
    }
  } };
}
function Un(e) {
  return Wn(e) || Kn(e) || Je(e) || zn();
}
function zn() {
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
function Kn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Wn(e) {
  if (Array.isArray(e)) return Se(e);
}
function Se(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
var Pe = {
  name: "SelectButton",
  extends: Mn,
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
        var a = this.isSelected(n), s = this.getOptionValue(n), i;
        if (this.multiple)
          if (a) {
            if (i = this.d_value.filter(function(r) {
              return !ye(r, s, o.equalityKey);
            }), !this.allowEmpty && i.length === 0) return;
          } else
            i = this.d_value ? [].concat(Un(this.d_value), [s]) : [s];
        else {
          if (a && !this.allowEmpty) return;
          i = a ? null : s;
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
          var o = Nn(this.d_value), a;
          try {
            for (o.s(); !(a = o.n()).done; ) {
              var s = a.value;
              if (ye(s, l, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (i) {
            o.e(i);
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
}, Fn = ["aria-labelledby", "data-p"];
function Hn(e, t, n, l, o, a) {
  var s = nt("ToggleButton");
  return v(), f("div", W({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [(v(!0), f(D, null, F(e.options, function(i, r) {
    return v(), N(s, {
      key: a.getOptionRenderKey(i),
      modelValue: a.isSelected(i),
      onLabel: a.getOptionLabel(i),
      offLabel: a.getOptionLabel(i),
      disabled: e.disabled || a.isOptionDisabled(i),
      unstyled: e.unstyled,
      size: e.size,
      readonly: a.isOptionReadonly(i),
      onChange: function(b) {
        return a.onOptionSelect(b, i, r);
      },
      pt: e.ptm("pcToggleButton")
    }, ot({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: te(function() {
        return [Z(e.$slots, "option", {
          option: i,
          index: r
        }, function() {
          return [u("span", W({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), $(a.getOptionLabel(i)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Fn);
}
Pe.render = Hn;
function qn(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Ne(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Jn(e) {
  const t = R(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = I(null), l = I(""), o = I(!1), a = I(0);
  let s = 0;
  async function i() {
    const b = ++s;
    if (!e.value) return !1;
    try {
      const p = await J(e.value).status();
      return b !== s ? !1 : (n.value = p, l.value = "", a.value++, !0);
    } catch (p) {
      return b === s && (l.value = le(p)), !1;
    }
  }
  async function r(b) {
    o.value = !0, l.value = "";
    try {
      return await b(), await i();
    } catch (p) {
      return l.value = le(p), !1;
    } finally {
      o.value = !1;
    }
  }
  let m = null;
  return q(e, (b) => {
    if (m && m(), m = null, s++, n.value = null, l.value = "", !b) return;
    const p = st(`component.${b}`, () => {
      i();
    });
    m = typeof p == "function" ? p : null, i();
  }, { immediate: !0 }), at(() => {
    m && m();
  }), $t(async () => {
    await i();
  }), { memoryId: e, base: t, status: n, error: l, busy: o, revision: a, act: r };
}
const Yn = { class: "mm-field" }, Gn = { class: "mm-hint" }, Qn = { class: "mm-field" }, Xn = ["selected"], Zn = {
  key: 1,
  class: "kx-notice error"
}, eo = { class: "mm-field" }, to = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, no = {
  key: 1,
  class: "mm-hint"
}, oo = {
  key: 2,
  class: "kx-notice error"
}, ao = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, lo = ["onClick"], io = { class: "mm-field" }, ro = { class: "mm-form-foot" }, so = ["disabled"], uo = /* @__PURE__ */ Y({
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
    ], a = I("rule"), s = I(""), i = I(""), r = I(""), m = At("wc-agent-picker"), b = R(() => o.find((A) => A.value === a.value)?.hint || ""), p = R(() => qn(i.value)), _ = R(() => i.value && !Ne(p.value) ? "Use a short topic of letters, digits and spaces." : ""), y = R(() => !!s.value && Ne(p.value) && !!r.value.trim()), g = Te(
      () => n.memory.memoryId.value ? [n.memory.memoryId.value, a.value] : null,
      (A) => J(n.memory.memoryId.value).topics({ kind: a.value, offset: A }),
      n.memory.revision
    ), w = R(() => g.rows.value.map((A) => A.key).filter((A) => A !== p.value).slice(0, 8));
    q(a, () => {
      i.value = "";
    });
    function T(A) {
      const k = wt(A).selected;
      s.value = String((Array.isArray(k) ? k : [])[0] || "");
    }
    async function B() {
      if (!y.value) return;
      let A = null;
      await n.memory.act(async () => {
        A = await J(n.memory.memoryId.value).create({
          kind: a.value,
          scope_family: "agent",
          scope_id: s.value,
          key: p.value,
          value: r.value.trim(),
          content: r.value.trim()
        });
      }) && A !== null && l("added", A);
    }
    return (A, k) => (v(), f("form", {
      class: "mm-form",
      onSubmit: ze(B, ["prevent"])
    }, [
      u("div", Yn, [
        k[3] || (k[3] = u("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        x(d(Pe), {
          modelValue: a.value,
          "onUpdate:modelValue": k[0] || (k[0] = (c) => a.value = c),
          options: o,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        u("span", Gn, [
          x(d(V), {
            icon: d(X)[a.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          j($(b.value), 1)
        ])
      ]),
      u("div", Qn, [
        k[4] || (k[4] = u("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        d(m).ready.value ? (v(), f("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: s.value ? JSON.stringify([s.value]) : "[]",
          onChange: T
        }, null, 40, Xn)) : d(m).failed.value ? (v(), f("div", Zn, "The agent picker could not load: " + $(d(m).failed.value), 1)) : O("", !0)
      ]),
      u("div", eo, [
        k[5] || (k[5] = u("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        x(d(Lt), {
          id: "add_topic",
          modelValue: i.value,
          "onUpdate:modelValue": k[1] || (k[1] = (c) => i.value = c),
          placeholder: "e.g. response style",
          invalid: !!_.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        _.value ? (v(), f("span", to, $(_.value), 1)) : (v(), f("span", no, "What this is about, not what it says. A topic that already exists gets a new version.")),
        d(g).error.value ? (v(), f("div", oo, $(d(g).error.value), 1)) : O("", !0),
        w.value.length ? (v(), f("div", ao, [
          (v(!0), f(D, null, F(w.value, (c) => (v(), f("button", {
            key: c,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (C) => i.value = d(G)(c)
          }, $(d(G)(c)), 9, lo))), 128))
        ])) : O("", !0)
      ]),
      u("div", io, [
        k[6] || (k[6] = u("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        x(d(ke), {
          id: "add_text",
          modelValue: r.value,
          "onUpdate:modelValue": k[2] || (k[2] = (c) => r.value = c),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      u("div", ro, [
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
          k[7] || (k[7] = j("Add to memory ", -1))
        ], 8, so)
      ])
    ], 32));
  }
}), co = { class: "mm-view-head" }, mo = { class: "mm-view-title" }, vo = {
  key: 0,
  class: "kx-notice error"
}, po = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, fo = { class: "kx-empty-ico" }, go = ["aria-label"], bo = { class: "mm-card-h" }, yo = { class: "kx-chip" }, ho = { class: "mm-option-main" }, ko = { class: "mm-option-t" }, _o = { class: "mm-muted" }, $o = ["disabled", "onClick"], wo = ["disabled"], So = /* @__PURE__ */ Y({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = Te(() => t.memory.memoryId.value || null, (o) => J(t.memory.memoryId.value).conflicts(o), t.memory.revision);
    function l(o, a) {
      t.memory.act(() => J(t.memory.memoryId.value).resolve(o.group_id, a.id));
    }
    return (o, a) => (v(), f(D, null, [
      u("header", co, [
        u("h2", mo, [
          x(d(V), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          a[1] || (a[1] = j("Conflicts", -1))
        ]),
        a[2] || (a[2] = u("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      d(n).error.value ? (v(), f("div", vo, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(d(n).error.value), 1)
      ])) : !d(n).loading.value && !d(n).rows.value.length ? (v(), f("div", po, [
        u("span", fo, [
          x(d(V), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        a[3] || (a[3] = u("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        a[4] || (a[4] = u("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : O("", !0),
      (v(!0), f(D, null, F(d(n).rows.value, (s) => (v(), f("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${d(G)(s.items[0].key)}`
      }, [
        u("div", bo, [
          u("span", yo, $(d(X)[s.items[0].kind].label), 1),
          j($(d(G)(s.items[0].key)), 1)
        ]),
        (v(!0), f(D, null, F(s.items, (i) => (v(), f("div", {
          key: i.id,
          class: "mm-option"
        }, [
          u("div", ho, [
            u("span", ko, $(i.content), 1),
            u("span", _o, $(d(Q)(i.valid_at)) + " · " + $(d(dn)(i.source)), 1)
          ]),
          u("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (r) => l(s, i)
          }, [
            x(d(V), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            a[5] || (a[5] = j("Keep this ", -1))
          ], 8, $o)
        ]))), 128))
      ], 8, go))), 128)),
      d(n).next.value !== null ? (v(), f("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: d(n).loading.value,
        onClick: a[0] || (a[0] = //@ts-ignore
        (...s) => d(n).more && d(n).more(...s))
      }, "Show more conflicts", 8, wo)) : O("", !0)
    ], 64));
  }
}), xo = ["aria-label", "title", "aria-pressed", "disabled"], pe = /* @__PURE__ */ Y({
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
    return (l, o) => (v(), f("button", {
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
    ], 10, xo));
  }
}), Ye = /* @__PURE__ */ Y({
  __name: "AccessibleOverlay",
  props: {
    open: { type: Boolean },
    kind: {},
    dismissible: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = I(null);
    let a = null;
    const s = /* @__PURE__ */ new Map();
    function i(y) {
      const g = y.getRootNode(), w = g instanceof ShadowRoot ? g.activeElement : document.activeElement;
      return w instanceof HTMLElement ? w : null;
    }
    function r(y) {
      let g = y;
      for (; g; ) {
        const w = g.parentNode;
        if (!(w instanceof HTMLElement || w instanceof ShadowRoot)) break;
        for (const T of Array.from(w.children))
          T instanceof HTMLElement && T !== g && !s.has(T) && (s.set(T, T.inert), T.inert = !0);
        g = w instanceof ShadowRoot ? w.host : w;
      }
    }
    function m() {
      for (const [y, g] of s) y.inert = g;
      s.clear();
    }
    function b() {
      return o.value ? Array.from(o.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((y) => !y.hasAttribute("disabled")) : [];
    }
    function p(y) {
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
      const w = g[0], T = o.value ? i(o.value) : null, B = g.indexOf(T || w), A = g[(B + (y.shiftKey ? -1 : 1) + g.length) % g.length];
      y.preventDefault(), A.focus();
    }
    async function _(y) {
      if (y) {
        if (await Oe(), !o.value) return;
        a = i(o.value), r(o.value), (o.value.querySelector("[data-overlay-initial]") || b()[0])?.focus();
        return;
      }
      m();
      const g = a;
      a = null, await Oe(), g?.focus();
    }
    return q(() => n.open, (y) => {
      _(y);
    }, { immediate: !0 }), lt(() => {
      m(), a?.focus(), a = null;
    }), (y, g) => (v(), N(it, {
      name: e.kind === "drawer" ? "kx-drawer" : "kx-modal"
    }, {
      default: te(() => [
        e.open ? (v(), f("div", {
          key: 0,
          ref_key: "overlay",
          ref: o,
          class: U(e.kind === "drawer" ? "kx-drawer-mask" : "kx-modal-mask"),
          onKeydown: p,
          onClick: g[0] || (g[0] = ze((w) => e.dismissible && l("close"), ["self"]))
        }, [
          Z(y.$slots, "default")
        ], 34)) : O("", !0)
      ]),
      _: 3
    }, 8, ["name"]));
  }
}), To = ["aria-label"], Co = { class: "kx-drawer-h" }, Po = { class: "kx-drawer-title" }, Oo = { class: "kx-drawer-b" }, Ao = /* @__PURE__ */ Y({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t;
    return (l, o) => (v(), N(Ye, {
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
          u("div", Co, [
            u("span", Po, [
              x(d(V), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              j($(e.title), 1)
            ]),
            x(pe, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              onClick: o[0] || (o[0] = (a) => n("close"))
            })
          ]),
          u("div", Oo, [
            Z(l.$slots, "default")
          ])
        ], 8, To)
      ]),
      _: 3
    }, 8, ["open"]));
  }
}), Lo = ["aria-label"], Vo = { class: "kx-modal-h" }, Io = { class: "kx-modal-h-ico" }, Eo = { class: "kx-modal-h-text" }, Bo = { class: "kx-modal-h-title" }, jo = {
  key: 0,
  class: "kx-modal-h-sub"
}, Do = { class: "kx-modal-body" }, Ro = { class: "kx-modal-foot" }, Mo = ["disabled"], No = ["disabled"], Uo = /* @__PURE__ */ Y({
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
    return (l, o) => (v(), N(Ye, {
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
          u("div", Vo, [
            u("span", Io, [
              x(d(V), {
                icon: e.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", Eo, [
              u("span", Bo, $(e.title), 1),
              e.subtitle ? (v(), f("span", jo, $(e.subtitle), 1)) : O("", !0)
            ]),
            x(pe, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              disabled: e.busy,
              onClick: o[0] || (o[0] = (a) => n("cancel"))
            }, null, 8, ["disabled"])
          ]),
          u("div", Do, [
            Z(l.$slots, "default")
          ]),
          u("div", Ro, [
            u("button", {
              type: "button",
              class: "kx-btn kx-btn-ghost",
              disabled: e.busy,
              onClick: o[1] || (o[1] = (a) => n("cancel"))
            }, "Cancel", 8, Mo),
            u("button", {
              type: "button",
              class: U(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
              disabled: e.busy,
              onClick: o[2] || (o[2] = (a) => n("confirm"))
            }, [
              e.busy ? (v(), N(d(V), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : O("", !0),
              j($(e.confirmLabel), 1)
            ], 10, No)
          ])
        ], 10, Lo)
      ]),
      _: 3
    }, 8, ["open", "dismissible"]));
  }
}), zo = {
  key: 0,
  class: "kx-notice error"
}, Ko = {
  key: 1,
  class: "mm-skel-reader"
}, Wo = {
  key: 2,
  class: "mm-reader"
}, Fo = { class: "mm-head" }, Ho = { class: "mm-head-body" }, qo = { class: "mm-head-top" }, Jo = { class: "kx-chip" }, Yo = { class: "mm-topic" }, Go = { class: "mm-head-acts" }, Qo = ["disabled"], Xo = ["disabled"], Zo = ["disabled"], ea = {
  key: 0,
  class: "mm-edit"
}, ta = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, na = { class: "mm-edit-acts" }, oa = ["disabled"], aa = {
  key: 1,
  class: "mm-title"
}, la = { class: "mm-facts" }, ia = {
  key: 0,
  class: "mm-fact"
}, ra = ["title"], sa = ["title"], ua = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-claim-value"
}, da = {
  key: 0,
  class: "mm-value-fields"
}, ca = {
  key: 1,
  class: "mm-value"
}, ma = {
  key: 1,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, va = { class: "mm-timeline" }, pa = { class: "mm-tl-body" }, fa = { class: "mm-tl-t" }, ga = { class: "mm-tl-s" }, ba = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, ya = {
  key: 0,
  class: "mm-muted"
}, ha = {
  key: 1,
  class: "mm-sources"
}, ka = { class: "mm-source-body" }, _a = { class: "mm-source-head" }, $a = ["title"], wa = {
  key: 0,
  class: "mm-quote"
}, Sa = ["onClick"], xa = { class: "mm-source-topic" }, Ta = ["onClick"], Ca = /* @__PURE__ */ Y({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(e, { emit: t }) {
    const n = e, l = t, o = I(null), a = I([]), s = I(null), i = I([]), r = I(""), m = I(null), b = I(null), p = I(""), _ = I(!1), y = R(() => o.value ? X[o.value.kind] : null), g = R(() => o.value ? X[o.value.kind].icon : "tabler:brain"), w = R(() => o.value?.status === "current" || o.value?.status === "conflict"), T = R(() => o.value?.kind === "plan" && St(o.value.value) ? o.value.value : null), B = R(() => o.value?.value === void 0 ? "" : JSON.stringify(o.value.value, null, 2));
    let A = 0;
    async function k(E = 0, h) {
      const S = ++A;
      try {
        const M = await J(n.memory.memoryId.value).item(n.itemId, E, h);
        if (S !== A) return;
        if (!E) {
          const oe = M.item;
          if (oe.status === "forgotten") {
            l("gone");
            return;
          }
          o.value = oe, i.value = M.provenance;
        }
        const z = M.versions;
        a.value = E ? [...a.value, ...z.rows] : z.rows, s.value = z.next, r.value = "";
      } catch (M) {
        if (S !== A) return;
        Be(M) === 404 ? l("gone") : r.value = le(M);
      }
    }
    q(() => n.itemId, () => {
      o.value = null, a.value = [], m.value = null, b.value = null, p.value = "", _.value = !1, k();
    }, { immediate: !0 });
    async function c() {
      const E = ++A, h = a.value.length;
      try {
        let S = 0, M = null;
        const z = [];
        let oe = !0;
        do {
          const Ze = Math.min(100, Math.max(1, h - z.length)), ae = await J(n.memory.memoryId.value).item(n.itemId, S, Ze);
          if (E !== A) return;
          if (oe) {
            if (ae.item.status === "forgotten") {
              l("gone");
              return;
            }
            o.value = ae.item, i.value = ae.provenance, oe = !1;
          }
          z.push(...ae.versions.rows), M = ae.versions.next, S = M ?? 0;
        } while (z.length < h && M !== null);
        a.value = z, s.value = M, r.value = "";
      } catch (S) {
        E === A && (Be(S) === 404 ? l("gone") : r.value = le(S));
      }
    }
    q(n.memory.revision, () => {
      c();
    });
    function C(E) {
      return n.memory.act(() => J(n.memory.memoryId.value).act(n.itemId, E));
    }
    async function K() {
      const E = (m.value || "").trim();
      if (!E || !o.value) return;
      let h;
      if (b.value !== null)
        try {
          h = JSON.parse(b.value);
        } catch {
          p.value = "Claim value must be valid JSON.";
          return;
        }
      await n.memory.act(async () => {
        const M = b.value === null ? { content: E } : { content: E, value: h }, z = await J(n.memory.memoryId.value).edit(n.itemId, M);
        z && z !== n.itemId && l("replaced", z);
      }) && (m.value = null, b.value = null, p.value = "");
    }
    function ne() {
      o.value && (m.value = o.value.content, b.value = o.value.value === void 0 ? null : JSON.stringify(o.value.value, null, 2), p.value = "");
    }
    async function Ge() {
      await C("forget") && (_.value = !1, l("gone"));
    }
    function Qe(E) {
      return E.host_kind === "item" ? "tabler:brain" : E.host_kind === "content" ? "tabler:file-text" : E.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function Xe(E) {
      if (E.line) {
        if (E.line.role === "tool") return "Tool result";
        if (E.line.role === "document") return "Document";
        const h = E.line.author;
        return h?.kind === "user" ? "They said" : h?.kind === "system" ? "Workflow input" : h?.kind === "agent" ? o.value?.scope_family === "agent" && o.value.scope_id === h.id ? "The agent said" : `Task from ${h.id || "an agent"}` : "Message";
      }
      return E.host_kind === "item" ? E.memory ? "From the memory" : "From a memory that is no longer kept" : E.host_kind === "content" ? "A document" : E.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (E, h) => (v(), f(D, null, [
      r.value ? (v(), f("div", zo, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(r.value), 1)
      ])) : o.value ? (v(), f("article", Wo, [
        u("header", Fo, [
          u("span", {
            class: U(["mm-head-ic", y.value?.tone])
          }, [
            x(d(V), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          u("div", Ho, [
            u("div", qo, [
              u("span", Jo, $(y.value?.label), 1),
              u("span", Yo, $(d(G)(o.value.key)), 1),
              o.value.status !== "current" ? (v(), N(d(Ce), {
                key: 0,
                class: "kx-tag-sm",
                severity: d(Fe)(o.value.status),
                value: d(we)[o.value.status]
              }, null, 8, ["severity", "value"])) : O("", !0),
              u("span", Go, [
                w.value && m.value === null ? (v(), f("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: ne
                }, [
                  x(d(V), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  h[8] || (h[8] = j("Edit ", -1))
                ])) : O("", !0),
                w.value ? (v(), f("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: h[0] || (h[0] = (S) => C("archive"))
                }, [
                  x(d(V), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  h[9] || (h[9] = j("Archive ", -1))
                ], 8, Qo)) : O("", !0),
                o.value.status === "archived" ? (v(), f("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: h[1] || (h[1] = (S) => C("restore"))
                }, [
                  x(d(V), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  h[10] || (h[10] = j("Restore ", -1))
                ], 8, Xo)) : O("", !0),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: h[2] || (h[2] = (S) => _.value = !0)
                }, [
                  x(d(V), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  h[11] || (h[11] = j("Forget ", -1))
                ], 8, Zo)
              ])
            ]),
            m.value !== null ? (v(), f("div", ea, [
              h[14] || (h[14] = u("label", {
                class: "mm-label",
                for: "memory_content"
              }, "Display text", -1)),
              x(d(ke), {
                id: "memory_content",
                modelValue: m.value,
                "onUpdate:modelValue": h[3] || (h[3] = (S) => m.value = S),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              b.value !== null ? (v(), f(D, { key: 0 }, [
                h[12] || (h[12] = u("label", {
                  class: "mm-label",
                  for: "memory_value"
                }, "Claim value", -1)),
                x(d(ke), {
                  id: "memory_value",
                  modelValue: b.value,
                  "onUpdate:modelValue": h[4] || (h[4] = (S) => b.value = S),
                  "auto-resize": "",
                  rows: "5",
                  "aria-label": "Claim value"
                }, null, 8, ["modelValue"]),
                p.value ? (v(), f("span", ta, $(p.value), 1)) : O("", !0)
              ], 64)) : O("", !0),
              u("div", na, [
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !m.value.trim(),
                  onClick: K
                }, [
                  x(d(V), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  h[13] || (h[13] = j("Save ", -1))
                ], 8, oa),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: h[5] || (h[5] = (S) => {
                    m.value = null, b.value = null, p.value = "";
                  })
                }, "Cancel")
              ])
            ])) : (v(), f("h2", aa, $(o.value.content), 1)),
            u("div", la, [
              o.value.scope_family === "agent" ? (v(), f("span", ia, [
                x(d(V), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                h[15] || (h[15] = j("About the agent itself", -1))
              ])) : O("", !0),
              u("span", {
                class: "mm-fact",
                title: d(ve)(o.value.valid_at)
              }, [
                x(d(V), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                j("True since " + $(d(Q)(o.value.valid_at)), 1)
              ], 8, ra),
              o.value.invalid_at ? (v(), f("span", {
                key: 1,
                class: "mm-fact",
                title: d(ve)(o.value.invalid_at)
              }, [
                x(d(V), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                j("Until " + $(d(Q)(o.value.invalid_at)), 1)
              ], 8, sa)) : O("", !0)
            ])
          ])
        ]),
        m.value === null && o.value.value !== void 0 ? (v(), f("section", ua, [
          h[19] || (h[19] = u("h3", {
            id: "mm-claim-value",
            class: "mm-sec-h"
          }, "Claim value", -1)),
          T.value ? (v(), f("dl", da, [
            u("div", null, [
              h[16] || (h[16] = u("dt", null, "Details", -1)),
              u("dd", null, $(T.value.details), 1)
            ]),
            u("div", null, [
              h[17] || (h[17] = u("dt", null, "Next step", -1)),
              u("dd", null, $(T.value.next_step), 1)
            ]),
            u("div", null, [
              h[18] || (h[18] = u("dt", null, "Status", -1)),
              u("dd", null, $(T.value.status === "done" ? "Done" : T.value.status), 1)
            ])
          ])) : (v(), f("pre", ca, $(B.value), 1))
        ])) : O("", !0),
        a.value.length > 1 || s.value !== null ? (v(), f("section", ma, [
          h[21] || (h[21] = u("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          u("ol", va, [
            (v(!0), f(D, null, F(a.value, (S) => (v(), f("li", {
              key: S.id,
              class: U({ now: S.id === o.value.id, past: S.status !== "current" })
            }, [
              h[20] || (h[20] = u("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              u("span", pa, [
                u("span", fa, $(S.content), 1),
                u("span", ga, [
                  j("v" + $(S.version) + " · " + $(d(Q)(S.valid_at)), 1),
                  S.status !== "current" ? (v(), f(D, { key: 0 }, [
                    j(" · " + $(d(we)[S.status]), 1)
                  ], 64)) : O("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (v(), f("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: h[6] || (h[6] = (S) => k(s.value))
          }, "Show older versions")) : O("", !0)
        ])) : O("", !0),
        u("section", ba, [
          h[23] || (h[23] = u("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          i.value.length ? (v(), f("ul", ha, [
            (v(!0), f(D, null, F(i.value, (S) => (v(), f("li", {
              key: S.host_kind + S.host_id + S.event_id,
              class: "mm-source"
            }, [
              x(d(V), {
                class: "mm-source-ic",
                icon: Qe(S),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              u("div", ka, [
                u("div", _a, [
                  u("span", null, $(Xe(S)), 1),
                  S.line?.created_at || S.recorded_at ? (v(), f("span", {
                    key: 0,
                    class: "mm-muted",
                    title: d(ve)(S.line?.created_at || S.recorded_at || "")
                  }, $(d(Q)(S.line?.created_at || S.recorded_at || "")), 9, $a)) : O("", !0)
                ]),
                S.line ? (v(), f("blockquote", wa, $(S.line.text), 1)) : O("", !0),
                S.memory ? (v(), f("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (M) => l("open", S.memory.id)
                }, [
                  u("span", xa, $(d(G)(S.memory.key)), 1),
                  u("span", null, $(S.memory.content), 1)
                ], 8, Sa)) : O("", !0),
                S.host_kind === "session" ? (v(), f("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (M) => l("conversation", S.host_id)
                }, [
                  x(d(V), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  h[22] || (h[22] = j("Open conversation ", -1))
                ], 8, Ta)) : O("", !0)
              ])
            ]))), 128))
          ])) : (v(), f("p", ya, $(o.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (v(), f("div", Ko, [
        (v(), f(D, null, F(4, (S) => u("div", {
          key: S,
          class: "mm-skel-line"
        })), 64))
      ])),
      x(Uo, {
        open: _.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: o.value ? d(G)(o.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: h[7] || (h[7] = (S) => _.value = !1),
        onConfirm: Ge
      }, {
        default: te(() => [...h[24] || (h[24] = [
          j(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), Pa = { class: "mm-rail-tools" }, Oa = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, Aa = {
  key: 0,
  class: "mm-skel"
}, La = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Va = {
  key: 2,
  class: "mm-rail-empty"
}, Ia = ["aria-expanded", "onClick"], Ea = { class: "kx-railsec-t" }, Ba = { class: "kx-railsec-b" }, ja = ["aria-current", "onClick"], Da = { class: "mm-row-main" }, Ra = { class: "mm-row-t" }, Ma = { class: "mm-row-s" }, Na = ["disabled"], Ua = /* @__PURE__ */ Y({
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
    ], a = I("current"), s = I(""), i = Vt(s, 250, (_) => _.trim()), r = Te(() => n.memory.memoryId.value ? [n.memory.memoryId.value, a.value, i.value] : null, (_) => J(n.memory.memoryId.value).items({ status: a.value, query: i.value, offset: _ }), n.memory.revision);
    q([a, i], () => {
      l("filtered"), l("status-change", a.value);
    });
    const m = I({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), b = R(() => sn.map((_) => ({ ..._, items: r.rows.value.filter((y) => X[y.kind].group === _.id) })).filter((_) => _.items.length)), p = R(() => i.value ? "No memories match this search." : a.value === "superseded" ? "No earlier versions yet." : a.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (_, y) => (v(), f(D, null, [
      u("div", Pa, [
        x(It, {
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
      u("nav", Oa, [
        d(r).loading.value && !d(r).rows.value.length ? (v(), f("div", Aa, [
          (v(), f(D, null, F(6, (g) => u("div", {
            key: g,
            class: "mm-skel-row"
          })), 64))
        ])) : d(r).error.value ? (v(), f("div", La, [
          x(d(V), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          u("span", null, $(d(r).error.value), 1)
        ])) : d(r).rows.value.length ? O("", !0) : (v(), f("div", Va, $(p.value), 1)),
        (v(!0), f(D, null, F(b.value, (g) => (v(), f("div", {
          key: g.id,
          class: U(["kx-railsec", { closed: m.value[g.id] }])
        }, [
          u("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !m.value[g.id],
            onClick: (w) => m.value[g.id] = !m.value[g.id]
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
            u("span", Ea, $(g.title), 1)
          ], 8, Ia),
          Ue(u("div", Ba, [
            (v(!0), f(D, null, F(g.items, (w) => (v(), f("button", {
              key: w.id,
              type: "button",
              class: U(["mm-row", { on: e.selectedId === w.id }]),
              "aria-current": e.selectedId === w.id ? "true" : void 0,
              onClick: (T) => l("select", w)
            }, [
              u("span", {
                class: U(["mm-row-ic", d(X)[w.kind].tone])
              }, [
                x(d(V), {
                  icon: d(X)[w.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              u("span", Da, [
                u("span", Ra, $(w.content), 1),
                u("span", Ma, $(d(G)(w.key)) + " · " + $(d(Q)(w.valid_at)), 1)
              ])
            ], 10, ja))), 128))
          ], 512), [
            [rt, !m.value[g.id]]
          ])
        ], 2))), 128)),
        d(r).next.value !== null ? (v(), f("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: d(r).loading.value,
          onClick: y[2] || (y[2] = //@ts-ignore
          (...g) => d(r).more && d(r).more(...g))
        }, [
          d(r).loading.value ? (v(), N(d(V), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : O("", !0),
          y[3] || (y[3] = j("Show more ", -1))
        ], 8, Na)) : O("", !0)
      ])
    ], 64));
  }
}), za = {
  key: 0,
  class: "kx-notice error"
}, Ka = {
  key: 1,
  class: "mm-page"
}, Wa = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Fa = { class: "kx-shell" }, Ha = { class: "kx-rail" }, qa = { class: "kx-railhead" }, Ja = { class: "kx-railhead-title" }, Ya = { key: 0 }, Ga = { class: "kx-railhead-acts" }, Qa = { class: "kx-main" }, Xa = { class: "kx-main-scroll mm-main" }, Za = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, el = { class: "kx-empty-ico" }, tl = /* @__PURE__ */ Y({
  __name: "MemoryManage",
  setup(e) {
    const t = xt(), n = Tt(), l = I(""), o = I({});
    q(() => t.value.config, (k) => {
      try {
        o.value = Ct(k), l.value = "";
      } catch (c) {
        l.value = le(c);
      }
    }, { immediate: !0 });
    const a = Jn(R(() => String(o.value.kb_id || ""))), s = I("item"), i = I(String(o.value.route || "")), r = I(!1), m = I("current"), b = R(() => a.status.value?.counts[m.value]), p = R(() => a.status.value?.counts.conflict_groups || 0), _ = R(() => (a.status.value?.runs || []).filter((k) => k.status === "failed").length);
    q(() => o.value.route, (k) => {
      const c = typeof k == "string" ? k : "";
      c !== i.value && (y = !0, i.value = c, c && (s.value = "item"));
    }), q(a.memoryId, () => {
      i.value = "", s.value = "item";
    });
    let y = !1;
    q(i, (k) => {
      if (y) {
        y = !1;
        return;
      }
      n("navigate", k || "");
    });
    function g(k) {
      n("kickside-chat-open", { kind: "session", sessionId: k });
    }
    function w(k) {
      s.value = "item", k !== i.value && (i.value = k);
    }
    function T(k) {
      w(k.id);
    }
    function B(k) {
      s.value = s.value === k ? "item" : k;
    }
    function A(k) {
      r.value = !1, k && w(k);
    }
    return (k, c) => l.value ? (v(), f("div", za, $(l.value), 1)) : (v(), f("div", Ka, [
      d(a).error.value ? (v(), f("div", Wa, [
        x(d(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(d(a).error.value), 1)
      ])) : O("", !0),
      u("div", Fa, [
        u("aside", Ha, [
          u("div", qa, [
            u("span", Ja, [
              c[7] || (c[7] = j("Memories", -1)),
              b.value !== void 0 ? (v(), f("b", Ya, $(b.value), 1)) : O("", !0)
            ]),
            u("div", Ga, [
              x(pe, {
                icon: "tabler:activity",
                label: _.value ? `Activity, ${_.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: c[0] || (c[0] = (C) => B("activity"))
              }, null, 8, ["label", "active"]),
              x(pe, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: c[1] || (c[1] = (C) => r.value = !0)
              })
            ])
          ]),
          p.value ? (v(), f("button", {
            key: 0,
            type: "button",
            class: U(["mm-conflict-bar", { on: s.value === "conflicts" }]),
            onClick: c[2] || (c[2] = (C) => B("conflicts"))
          }, [
            x(d(V), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            u("span", null, $(p.value === 1 ? "1 conflict to resolve" : `${p.value} conflicts to resolve`), 1),
            x(d(V), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : O("", !0),
          x(Ua, {
            memory: d(a),
            "selected-id": s.value === "item" ? i.value : "",
            onSelect: T,
            onFiltered: c[3] || (c[3] = (C) => i.value = ""),
            onStatusChange: c[4] || (c[4] = (C) => m.value = C)
          }, null, 8, ["memory", "selected-id"])
        ]),
        u("main", Qa, [
          u("div", Xa, [
            s.value === "conflicts" ? (v(), N(So, {
              key: 0,
              memory: d(a)
            }, null, 8, ["memory"])) : s.value === "activity" ? (v(), N(xn, {
              key: 1,
              memory: d(a)
            }, null, 8, ["memory"])) : i.value ? (v(), N(Ca, {
              key: i.value,
              memory: d(a),
              "item-id": i.value,
              onReplaced: w,
              onOpen: w,
              onConversation: g,
              onGone: c[5] || (c[5] = (C) => i.value = "")
            }, null, 8, ["memory", "item-id"])) : (v(), f("div", Za, [
              u("span", el, [
                x(d(V), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              c[8] || (c[8] = u("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              c[9] || (c[9] = u("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      x(Ao, {
        open: r.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: c[6] || (c[6] = (C) => r.value = !1)
      }, {
        default: te(() => [
          r.value ? (v(), N(uo, {
            key: 0,
            memory: d(a),
            onAdded: A
          }, null, 8, ["memory"])) : O("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), nl = Pt(tl, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
ut(import.meta.url, nl);
//# sourceMappingURL=index.js.map
