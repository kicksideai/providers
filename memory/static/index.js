import { mergeProps as U, openBlock as p, createElementBlock as g, createBlock as D, resolveDynamicComponent as Fe, createCommentVNode as L, renderSlot as J, createElementVNode as d, toDisplayString as _, defineComponent as W, computed as j, Fragment as B, createVNode as x, unref as u, createTextVNode as V, renderList as N, normalizeClass as R, resolveDirective as He, withDirectives as Ee, resolveComponent as qe, createSlots as Ye, withCtx as ne, ref as I, watch as M, onUnmounted as Ge, withModifiers as ye, onBeforeUnmount as Be, Transition as je, nextTick as Je, vShow as Qe } from "vue";
import { Icon as P } from "@iconify/vue";
import { on as Xe, define as Ze } from "@wippy-fe/proxy";
import { F as et, d as tt, n as nt, N as Se, S as Y, B as K, f as ue, g as de, i as xe, h as ot, l as at, P as oe, C as lt, Q as it, j as ce, T as Te, R as Ce, v as rt, k as st, K as ut, W as dt, U as ct, s as Pe, o as me, q as ae, r as mt, e as ie, t as vt, u as pt, a as gt, b as ft, m as bt } from "./types-CkAlvrJt.js";
import { B as ve, s as yt, f as he, c as De, u as ht, a as kt, d as Re } from "./useWidget-g7eM-AnE.js";
import { m as G, a as ke, h as $t, u as _t, _ as wt } from "./usePaged-DiPI-biL.js";
var le = {};
function St(e = "pui_id_") {
  return Object.hasOwn(le, e) || (le[e] = 0), le[e]++, `${e}${le[e]}`;
}
function X(e) {
  "@babel/helpers - typeof";
  return X = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, X(e);
}
function Oe(e, t) {
  return Pt(e) || Ct(e, t) || Tt(e, t) || xt();
}
function xt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Tt(e, t) {
  if (e) {
    if (typeof e == "string") return Ae(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ae(e, t) : void 0;
  }
}
function Ae(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Ct(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var i, a, o, s, l = [], r = !0, c = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(r = (i = o.call(n)).done) && (l.push(i.value), l.length !== t); r = !0) ;
    } catch (y) {
      c = !0, a = y;
    } finally {
      try {
        if (!r && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw a;
      }
    }
    return l;
  }
}
function Pt(e) {
  if (Array.isArray(e)) return e;
}
function Le(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function A(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Le(Object(n), !0).forEach(function(i) {
      pe(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Le(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function pe(e, t, n) {
  return (t = Ot(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ot(e) {
  var t = At(e, "string");
  return X(t) == "symbol" ? t : t + "";
}
function At(e, t) {
  if (X(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (X(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var T = {
  _getMeta: function() {
    return [xe(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ot(xe(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var i, a, o;
    return (i = (t == null || (a = t.instance) === null || a === void 0 ? void 0 : a.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || i === void 0 ? void 0 : i.config;
  },
  _getOptionValue: et,
  _getPTValue: function() {
    var t, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, r = function() {
      var $ = T._getOptionValue.apply(T, arguments);
      return ue($) || lt($) ? {
        class: $
      } : $;
    }, c = ((t = i.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = i.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, y = c.mergeSections, v = y === void 0 ? !0 : y, k = c.mergeProps, w = k === void 0 ? !1 : k, h = l ? T._useDefaultPT(i, i.defaultPT(), r, o, s) : void 0, C = T._usePT(i, T._getPT(a, i.$name), r, o, A(A({}, s), {}, {
      global: h || {}
    })), O = T._getPTDatasets(i, o);
    return v || !v && C ? w ? T._mergeProps(i, w, h, C, O) : A(A(A({}, h), C), O) : A(A({}, C), O);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = "data-pc-";
    return A(A({}, n === "root" && pe({}, "".concat(i, "name"), de(t.$name))), {}, pe({}, "".concat(i, "section"), de(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
      var l, r = i ? i(s) : s, c = de(n);
      return (l = r?.[c]) !== null && l !== void 0 ? l : r;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: a(t.originalValue),
      value: a(t.value)
    } : a(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(O) {
      return i(O, a, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, r = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, c = r.mergeSections, y = c === void 0 ? !0 : c, v = r.mergeProps, k = v === void 0 ? !1 : v, w = s(n.originalValue), h = s(n.value);
      return w === void 0 && h === void 0 ? void 0 : ue(h) ? h : ue(w) ? w : y || !y && h ? k ? T._mergeProps(t, k, w, h) : A(A({}, w), h) : h;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return T._usePT(t, n, i, a, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0, a = arguments.length > 2 ? arguments[2] : void 0, o = T._getConfig(i, a), s = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    T._loadCoreStyles(n, s), T._loadThemeStyles(n, s), T._loadScopedThemeStyles(n, s), T._removeThemeListeners(n), n.$loadStyles = function() {
      return T._loadThemeStyles(n, s);
    }, T._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!ve.isStyleNameLoaded((t = i.$style) === null || t === void 0 ? void 0 : t.name) && (n = i.$style) !== null && n !== void 0 && n.name) {
      var o;
      K.loadCSS(a), (o = i.$style) === null || o === void 0 || o.loadCSS(a), ve.setLoadedStyleName(i.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, i, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(a != null && a.isUnstyled() || (a == null || (t = a.theme) === null || t === void 0 ? void 0 : t.call(a)) === "none")) {
      if (!Y.isStyleNameLoaded("common")) {
        var s, l, r = ((s = a.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, c = r.primitive, y = r.semantic, v = r.global, k = r.style;
        K.load(c?.css, A({
          name: "primitive-variables"
        }, o)), K.load(y?.css, A({
          name: "semantic-variables"
        }, o)), K.load(v?.css, A({
          name: "global-variables"
        }, o)), K.loadStyle(A({
          name: "global-style"
        }, o), k), Y.setLoadedStyleName("common");
      }
      if (!Y.isStyleNameLoaded((n = a.$style) === null || n === void 0 ? void 0 : n.name) && (i = a.$style) !== null && i !== void 0 && i.name) {
        var w, h, C, O, E = ((w = a.$style) === null || w === void 0 || (h = w.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(w)) || {}, $ = E.css, b = E.style;
        (C = a.$style) === null || C === void 0 || C.load($, A({
          name: "".concat(a.$style.name, "-variables")
        }, o)), (O = a.$style) === null || O === void 0 || O.loadStyle(A({
          name: "".concat(a.$style.name, "-style")
        }, o), b), Y.setLoadedStyleName(a.$style.name);
      }
      if (!Y.isStyleNameLoaded("layer-order")) {
        var m, f, S = (m = a.$style) === null || m === void 0 || (f = m.getLayerOrderThemeCSS) === null || f === void 0 ? void 0 : f.call(m);
        K.load(S, A({
          name: "layer-order",
          first: !0
        }, o)), Y.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = t.preset();
    if (i && t.$attrSelector) {
      var a, o, s, l = ((a = t.$style) === null || a === void 0 || (o = a.getPresetTheme) === null || o === void 0 ? void 0 : o.call(a, i, "[".concat(t.$attrSelector, "]"))) || {}, r = l.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(r, A({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    ve.clearLoadedStyleNames(), Se.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Se.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, i, a, o, s) {
    var l, r, c = "on".concat(nt(n)), y = T._getConfig(a, o), v = i?.$instance, k = T._usePT(v, T._getPT(a == null || (l = a.value) === null || l === void 0 ? void 0 : l.pt, t), T._getOptionValue, "hooks.".concat(c)), w = T._useDefaultPT(v, y == null || (r = y.pt) === null || r === void 0 || (r = r.directives) === null || r === void 0 ? void 0 : r[t], T._getOptionValue, "hooks.".concat(c)), h = {
      el: i,
      binding: a,
      vnode: o,
      prevVnode: s
    };
    k?.(v, h), w?.(v, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      i[a - 2] = arguments[a];
    return tt(t) ? t.apply(void 0, i) : U.apply(void 0, i);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = function(l, r, c, y, v) {
      var k, w, h, C;
      r._$instances = r._$instances || {};
      var O = T._getConfig(c, y), E = r._$instances[t] || {}, $ = at(E) ? A(A({}, n), n?.methods) : {};
      r._$instances[t] = A(A({}, E), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: r,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: E.$el || r || void 0,
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
        $primevueConfig: O,
        $attrSelector: (k = r.$pd) === null || k === void 0 || (k = k[t]) === null || k === void 0 ? void 0 : k.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return T._getPT(O?.pt, void 0, function(m) {
            var f;
            return m == null || (f = m.directives) === null || f === void 0 ? void 0 : f[t];
          });
        },
        isUnstyled: function() {
          var m, f;
          return ((m = r._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? (f = r._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled : O?.unstyled;
        },
        theme: function() {
          var m;
          return (m = r._$instances[t]) === null || m === void 0 || (m = m.$primevueConfig) === null || m === void 0 ? void 0 : m.theme;
        },
        preset: function() {
          var m;
          return (m = r._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.dt;
        },
        /* instance's methods */
        ptm: function() {
          var m, f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return T._getPTValue(r._$instances[t], (m = r._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, f, A({}, S));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", S = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T._getPTValue(r._$instances[t], m, f, S, !1);
        },
        cx: function() {
          var m, f, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = r._$instances[t]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : T._getOptionValue((f = r._$instances[t]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.classes, S, A({}, z));
        },
        sx: function() {
          var m, f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S ? T._getOptionValue((m = r._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, f, A({}, z)) : void 0;
        }
      }, $), r.$instance = r._$instances[t], (w = (h = r.$instance)[l]) === null || w === void 0 || w.call(h, r, c, y, v), r["$".concat(t)] = r.$instance, T._hook(t, l, r, c, y, v), r.$pd || (r.$pd = {}), r.$pd[t] = A(A({}, (C = r.$pd) === null || C === void 0 ? void 0 : C[t]), {}, {
        name: t,
        instance: r._$instances[t]
      });
    }, a = function(l) {
      var r, c, y, v = l._$instances[t], k = v?.watch, w = function(O) {
        var E, $ = O.newValue, b = O.oldValue;
        return k == null || (E = k.config) === null || E === void 0 ? void 0 : E.call(v, $, b);
      }, h = function(O) {
        var E, $ = O.newValue, b = O.oldValue;
        return k == null || (E = k["config.ripple"]) === null || E === void 0 ? void 0 : E.call(v, $, b);
      };
      v.$watchersCallback = {
        config: w,
        "config.ripple": h
      }, k == null || (r = k.config) === null || r === void 0 || r.call(v, v?.$primevueConfig), oe.on("config:change", w), k == null || (c = k["config.ripple"]) === null || c === void 0 || c.call(v, v == null || (y = v.$primevueConfig) === null || y === void 0 ? void 0 : y.ripple), oe.on("config:ripple:change", h);
    }, o = function(l) {
      var r = l._$instances[t].$watchersCallback;
      r && (oe.off("config:change", r.config), oe.off("config:ripple:change", r["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, r, c, y) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: St("pd")
        }, i("created", l, r, c, y);
      },
      beforeMount: function(l, r, c, y) {
        var v;
        T._loadStyles((v = l.$pd[t]) === null || v === void 0 ? void 0 : v.instance, r, c), i("beforeMount", l, r, c, y), a(l);
      },
      mounted: function(l, r, c, y) {
        var v;
        T._loadStyles((v = l.$pd[t]) === null || v === void 0 ? void 0 : v.instance, r, c), i("mounted", l, r, c, y);
      },
      beforeUpdate: function(l, r, c, y) {
        i("beforeUpdate", l, r, c, y);
      },
      updated: function(l, r, c, y) {
        var v;
        T._loadStyles((v = l.$pd[t]) === null || v === void 0 ? void 0 : v.instance, r, c), i("updated", l, r, c, y);
      },
      beforeUnmount: function(l, r, c, y) {
        var v;
        o(l), T._removeThemeListeners((v = l.$pd[t]) === null || v === void 0 ? void 0 : v.instance), i("beforeUnmount", l, r, c, y);
      },
      unmounted: function(l, r, c, y) {
        var v;
        (v = l.$pd[t]) === null || v === void 0 || (v = v.instance) === null || v === void 0 || (v = v.scopedStyleEl) === null || v === void 0 || (v = v.value) === null || v === void 0 || v.remove(), i("unmounted", l, r, c, y);
      }
    };
  },
  extend: function() {
    var t = T._getMeta.apply(T, arguments), n = Oe(t, 2), i = n[0], a = n[1];
    return A({
      extend: function() {
        var s = T._getMeta.apply(T, arguments), l = Oe(s, 2), r = l[0], c = l[1];
        return T.extend(r, A(A(A({}, a), a?.methods), c));
      }
    }, T._extend(i, a));
  }
}, Lt = `
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
`, Vt = {
  root: "p-ink"
}, It = K.extend({
  name: "ripple-directive",
  style: Lt,
  classes: Vt
}), Et = T.extend({
  style: It
});
function Z(e) {
  "@babel/helpers - typeof";
  return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Z(e);
}
function Bt(e) {
  return Ut(e) || Rt(e) || Dt(e) || jt();
}
function jt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dt(e, t) {
  if (e) {
    if (typeof e == "string") return ge(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ge(e, t) : void 0;
  }
}
function Rt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ut(e) {
  if (Array.isArray(e)) return ge(e);
}
function ge(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Ve(e, t, n) {
  return (t = Mt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mt(e) {
  var t = Nt(e, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function Nt(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Z(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ue = Et.extend("ripple", {
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
      n || (n = ct("span", Ve(Ve({
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
      var n = this, i = t.currentTarget, a = this.getInk(i);
      if (!(!a || getComputedStyle(a, null).display === "none")) {
        if (!this.isUnstyled() && ce(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"), !Te(a) && !Ce(a)) {
          var o = Math.max(rt(i), st(i));
          a.style.height = o + "px", a.style.width = o + "px";
        }
        var s = ut(i), l = t.pageX - s.left + document.body.scrollTop - Ce(a) / 2, r = t.pageY - s.top + document.body.scrollLeft - Te(a) / 2;
        a.style.top = r + "px", a.style.left = l + "px", !this.isUnstyled() && dt(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          a && (!n.isUnstyled() && ce(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ce(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Bt(t.children).find(function(n) {
        return it(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), zt = `
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
`, Kt = {
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
}, Wt = K.extend({
  name: "tag",
  style: zt,
  classes: Kt
}), Ft = {
  name: "BaseTag",
  extends: yt,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Wt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ee(e) {
  "@babel/helpers - typeof";
  return ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ee(e);
}
function Ht(e, t, n) {
  return (t = qt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qt(e) {
  var t = Yt(e, "string");
  return ee(t) == "symbol" ? t : t + "";
}
function Yt(e, t) {
  if (ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (ee(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $e = {
  name: "Tag",
  extends: Ft,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return he(Ht({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Gt = ["data-p"];
function Jt(e, t, n, i, a, o) {
  return p(), g("span", U({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (p(), D(Fe(e.$slots.icon), U({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (p(), g("span", U({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : L("", !0), e.value != null || e.$slots.default ? J(e.$slots, "default", {
    key: 2
  }, function() {
    return [d("span", U({
      class: e.cx("label")
    }, e.ptm("label")), _(e.value), 17)];
  }) : L("", !0)], 16, Gt);
}
$e.render = Jt;
const H = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, Qt = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function q(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
function Xt(e) {
  return e.scope_family === "agent" ? "The agent" : "A person it talked with";
}
const Zt = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function Me(e) {
  return Zt[e];
}
const fe = {
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
}, en = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Ne(e) {
  return en[e] ?? "secondary";
}
function ze(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function Q(e) {
  const t = ze(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const tn = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function F(e, t = Date.now()) {
  const n = ze(e);
  if (!Number.isFinite(n)) return "";
  const i = Math.round((n - t) / 1e3), a = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, s] of tn)
    if (Math.abs(i) >= s) return a.format(Math.round(i / s), o);
  return "just now";
}
const nn = { class: "mm-view-head" }, on = { class: "mm-view-title" }, an = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, ln = { class: "kx-empty-ico" }, rn = {
  key: 1,
  class: "mm-runs"
}, sn = { class: "mm-run-main" }, un = { class: "mm-run-t" }, dn = ["title"], cn = {
  key: 0,
  class: "mm-run-err"
}, mn = /* @__PURE__ */ W({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = j(() => t.memory.status.value?.runs || []);
    function i(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function a(o) {
      const s = o.stats || {}, l = [
        s.added ? `${s.added} new` : "",
        s.superseded ? `${s.superseded} updated` : "",
        s.conflicted ? `${s.conflicted} contested` : "",
        s.rejected ? `${s.rejected} rejected` : ""
      ].filter(Boolean);
      return l.length ? l.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, s) => (p(), g(B, null, [
      d("header", nn, [
        d("h2", on, [
          x(u(P), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = V("Activity", -1))
        ]),
        s[1] || (s[1] = d("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (p(), g("ol", rn, [
        (p(!0), g(B, null, N(n.value, (l) => (p(), g("li", {
          key: l.id,
          class: R(["mm-run", l.status])
        }, [
          d("div", sn, [
            d("span", un, _(i(l)), 1),
            d("span", {
              class: "mm-muted",
              title: u(Q)(l.finished_at || l.started_at || l.created_at)
            }, [
              V(_(u(F)(l.finished_at || l.started_at || l.created_at)), 1),
              a(l) ? (p(), g(B, { key: 0 }, [
                V(" · " + _(a(l)), 1)
              ], 64)) : L("", !0)
            ], 8, dn),
            l.last_error ? (p(), g("span", cn, _(l.last_error), 1)) : L("", !0)
          ]),
          l.status !== "succeeded" ? (p(), D(u($e), {
            key: 0,
            class: "kx-tag-sm",
            severity: u(Ne)(l.status),
            value: u(fe)[l.status]
          }, null, 8, ["severity", "value"])) : L("", !0)
        ], 2))), 128))
      ])) : (p(), g("div", an, [
        d("span", ln, [
          x(u(P), {
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
var vn = `
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
`, pn = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": i.fluid,
      "p-togglebutton-sm p-inputfield-sm": i.size === "small",
      "p-togglebutton-lg p-inputfield-lg": i.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, gn = K.extend({
  name: "togglebutton",
  style: vn,
  classes: pn
}), fn = {
  name: "BaseToggleButton",
  extends: De,
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
  style: gn,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function te(e) {
  "@babel/helpers - typeof";
  return te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, te(e);
}
function bn(e, t, n) {
  return (t = yn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function yn(e) {
  var t = hn(e, "string");
  return te(t) == "symbol" ? t : t + "";
}
function hn(e, t) {
  if (te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (te(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ke = {
  name: "ToggleButton",
  extends: fn,
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
      var n, i;
      (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i, t);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return Pe(this.onLabel) && Pe(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return he(bn({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: Ue
  }
}, kn = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], $n = ["data-p"];
function _n(e, t, n, i, a, o) {
  var s = He("ripple");
  return Ee((p(), g("button", U({
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
  }), [d("span", U({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [J(e.$slots, "default", {}, function() {
    return [J(e.$slots, "icon", {
      value: e.d_value,
      class: R(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (p(), g("span", U({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : L("", !0)];
    }), d("span", U({
      class: e.cx("label")
    }, o.getPTOptions("label")), _(o.label), 17)];
  })], 16, $n)], 16, kn)), [[s]]);
}
Ke.render = _n;
var wn = `
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
`, Sn = {
  root: function(t) {
    var n = t.props, i = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": i.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, xn = K.extend({
  name: "selectbutton",
  style: wn,
  classes: Sn
}), Tn = {
  name: "BaseSelectButton",
  extends: De,
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
  style: xn,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Cn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = We(e)) || t) {
      n && (e = n);
      var i = 0, a = function() {
      };
      return { s: a, n: function() {
        return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
      }, e: function(c) {
        throw c;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    l = !0, o = c;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function Pn(e) {
  return Ln(e) || An(e) || We(e) || On();
}
function On() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function We(e, t) {
  if (e) {
    if (typeof e == "string") return be(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? be(e, t) : void 0;
  }
}
function An(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ln(e) {
  if (Array.isArray(e)) return be(e);
}
function be(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
var _e = {
  name: "SelectButton",
  extends: Tn,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? ae(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? ae(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? ae(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? ae(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, i) {
      var a = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var o = this.isSelected(n), s = this.getOptionValue(n), l;
        if (this.multiple)
          if (o) {
            if (l = this.d_value.filter(function(r) {
              return !me(r, s, a.equalityKey);
            }), !this.allowEmpty && l.length === 0) return;
          } else
            l = this.d_value ? [].concat(Pn(this.d_value), [s]) : [s];
        else {
          if (o && !this.allowEmpty) return;
          l = o ? null : s;
        }
        this.writeValue(l, t), this.$emit("change", {
          originalEvent: t,
          value: l
        });
      }
    },
    isSelected: function(t) {
      var n = !1, i = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var a = Cn(this.d_value), o;
          try {
            for (a.s(); !(o = a.n()).done; ) {
              var s = o.value;
              if (me(s, i, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (l) {
            a.e(l);
          } finally {
            a.f();
          }
        }
      } else
        n = me(this.d_value, i, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return he({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: Ue
  },
  components: {
    ToggleButton: Ke
  }
}, Vn = ["aria-labelledby", "data-p"];
function In(e, t, n, i, a, o) {
  var s = qe("ToggleButton");
  return p(), g("div", U({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(p(!0), g(B, null, N(e.options, function(l, r) {
    return p(), D(s, {
      key: o.getOptionRenderKey(l),
      modelValue: o.isSelected(l),
      onLabel: o.getOptionLabel(l),
      offLabel: o.getOptionLabel(l),
      disabled: e.disabled || o.isOptionDisabled(l),
      unstyled: e.unstyled,
      size: e.size,
      readonly: o.isOptionReadonly(l),
      onChange: function(y) {
        return o.onOptionSelect(y, l, r);
      },
      pt: e.ptm("pcToggleButton")
    }, Ye({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: ne(function() {
        return [J(e.$slots, "option", {
          option: l,
          index: r
        }, function() {
          return [d("span", U({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), _(o.getOptionLabel(l)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Vn);
}
_e.render = In;
function En(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Ie(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Bn(e) {
  const t = j(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = I(null), i = I(""), a = I(!1), o = I(0);
  let s = 0;
  async function l() {
    const y = ++s;
    if (!e.value) return !1;
    try {
      const v = await G(e.value).status();
      return y !== s ? !1 : (n.value = v, i.value = "", o.value++, !0);
    } catch (v) {
      return y === s && (i.value = ie(v)), !1;
    }
  }
  async function r(y) {
    a.value = !0, i.value = "";
    try {
      return await y(), await l();
    } catch (v) {
      return i.value = ie(v), !1;
    } finally {
      a.value = !1;
    }
  }
  let c = null;
  return M(e, (y) => {
    if (c && c(), c = null, s++, n.value = null, i.value = "", !y) return;
    const v = Xe(`component.${y}`, () => {
      l();
    });
    c = typeof v == "function" ? v : null, l();
  }, { immediate: !0 }), Ge(() => {
    c && c();
  }), mt(async () => {
    await l();
  }), { memoryId: e, base: t, status: n, error: i, busy: a, revision: o, act: r };
}
const jn = { class: "mm-field" }, Dn = { class: "mm-hint" }, Rn = { class: "mm-field" }, Un = ["selected"], Mn = {
  key: 1,
  class: "kx-notice error"
}, Nn = { class: "mm-field" }, zn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, Kn = {
  key: 1,
  class: "mm-hint"
}, Wn = {
  key: 2,
  class: "kx-notice error"
}, Fn = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, Hn = ["onClick"], qn = { class: "mm-field" }, Yn = { class: "mm-form-foot" }, Gn = ["disabled"], Jn = /* @__PURE__ */ W({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(e, { emit: t }) {
    const n = e, i = t, a = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = I("rule"), s = I(""), l = I(""), r = I(""), c = ht("wc-agent-picker"), y = j(() => a.find(($) => $.value === o.value)?.hint || ""), v = j(() => En(l.value)), k = j(() => l.value && !Ie(v.value) ? "Use a short topic of letters, digits and spaces." : ""), w = j(() => !!s.value && Ie(v.value) && !!r.value.trim()), h = ke(
      () => n.memory.memoryId.value ? `${n.memory.base.value}/topics?scope_family=agent&kind=${o.value}` : null,
      "topics",
      n.memory.revision
    ), C = j(() => h.rows.value.map(($) => $.key).filter(($) => $ !== v.value).slice(0, 8));
    M(o, () => {
      l.value = "";
    });
    function O($) {
      const b = vt($).selected;
      s.value = String((Array.isArray(b) ? b : [])[0] || "");
    }
    async function E() {
      if (!w.value) return;
      let $ = null;
      await n.memory.act(async () => {
        $ = await G(n.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: s.value,
          key: v.value,
          value: r.value.trim(),
          content: r.value.trim()
        });
      }) && $ !== null && i("added", $);
    }
    return ($, b) => (p(), g("form", {
      class: "mm-form",
      onSubmit: ye(E, ["prevent"])
    }, [
      d("div", jn, [
        b[3] || (b[3] = d("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        x(u(_e), {
          modelValue: o.value,
          "onUpdate:modelValue": b[0] || (b[0] = (m) => o.value = m),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        d("span", Dn, [
          x(u(P), {
            icon: u(H)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          V(_(y.value), 1)
        ])
      ]),
      d("div", Rn, [
        b[4] || (b[4] = d("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        u(c).ready.value ? (p(), g("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: s.value ? JSON.stringify([s.value]) : "[]",
          onChange: O
        }, null, 40, Un)) : u(c).failed.value ? (p(), g("div", Mn, "The agent picker could not load: " + _(u(c).failed.value), 1)) : L("", !0)
      ]),
      d("div", Nn, [
        b[5] || (b[5] = d("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        x(u(kt), {
          id: "add_topic",
          modelValue: l.value,
          "onUpdate:modelValue": b[1] || (b[1] = (m) => l.value = m),
          placeholder: "e.g. response style",
          invalid: !!k.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        k.value ? (p(), g("span", zn, _(k.value), 1)) : (p(), g("span", Kn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        u(h).error.value ? (p(), g("div", Wn, _(u(h).error.value), 1)) : L("", !0),
        C.value.length ? (p(), g("div", Fn, [
          (p(!0), g(B, null, N(C.value, (m) => (p(), g("button", {
            key: m,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (f) => l.value = u(q)(m)
          }, _(u(q)(m)), 9, Hn))), 128))
        ])) : L("", !0)
      ]),
      d("div", qn, [
        b[6] || (b[6] = d("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        x(u(Re), {
          id: "add_text",
          modelValue: r.value,
          "onUpdate:modelValue": b[2] || (b[2] = (m) => r.value = m),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      d("div", Yn, [
        d("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !w.value
        }, [
          x(u(P), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: R({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          b[7] || (b[7] = V("Add to memory ", -1))
        ], 8, Gn)
      ])
    ], 32));
  }
}), Qn = { class: "mm-view-head" }, Xn = { class: "mm-view-title" }, Zn = {
  key: 0,
  class: "kx-notice error"
}, eo = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, to = { class: "kx-empty-ico" }, no = ["aria-label"], oo = { class: "mm-card-h" }, ao = { class: "kx-chip" }, lo = { class: "mm-option-main" }, io = { class: "mm-option-t" }, ro = { class: "mm-muted" }, so = ["disabled", "onClick"], uo = ["disabled"], co = /* @__PURE__ */ W({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = ke(() => t.memory.memoryId.value ? `${t.memory.base.value}/conflicts` : null, "groups", t.memory.revision);
    function i(a, o) {
      t.memory.act(() => G(t.memory.memoryId.value).resolve(a.group_id, o.id));
    }
    return (a, o) => (p(), g(B, null, [
      d("header", Qn, [
        d("h2", Xn, [
          x(u(P), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = V("Conflicts", -1))
        ]),
        o[2] || (o[2] = d("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      u(n).error.value ? (p(), g("div", Zn, [
        x(u(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, _(u(n).error.value), 1)
      ])) : !u(n).loading.value && !u(n).rows.value.length ? (p(), g("div", eo, [
        d("span", to, [
          x(u(P), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = d("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = d("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : L("", !0),
      (p(!0), g(B, null, N(u(n).rows.value, (s) => (p(), g("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${u(q)(s.items[0].key)}`
      }, [
        d("div", oo, [
          d("span", ao, _(u(H)[s.items[0].kind].label), 1),
          V(_(u(q)(s.items[0].key)), 1)
        ]),
        (p(!0), g(B, null, N(s.items, (l) => (p(), g("div", {
          key: l.id,
          class: "mm-option"
        }, [
          d("div", lo, [
            d("span", io, _(l.content), 1),
            d("span", ro, _(u(F)(l.valid_at)) + " · " + _(u(Me)(l.source)), 1)
          ]),
          d("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (r) => i(s, l)
          }, [
            x(u(P), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = V("Keep this ", -1))
          ], 8, so)
        ]))), 128))
      ], 8, no))), 128)),
      u(n).next.value !== null ? (p(), g("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: u(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...s) => u(n).more && u(n).more(...s))
      }, "Show more conflicts", 8, uo)) : L("", !0)
    ], 64));
  }
}), mo = ["aria-label", "title", "aria-pressed", "disabled"], re = /* @__PURE__ */ W({
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
    return (i, a) => (p(), g("button", {
      type: "button",
      class: R(["kx-iconbtn", { on: e.active }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: a[0] || (a[0] = (o) => n("click"))
    }, [
      x(u(P), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, mo));
  }
}), vo = ["aria-label"], po = { class: "kx-drawer-h" }, go = { class: "kx-drawer-title" }, fo = { class: "kx-drawer-b" }, bo = /* @__PURE__ */ W({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t;
    function a(o) {
      o.key === "Escape" && i("close");
    }
    return M(() => n.open, (o) => {
      o ? window.addEventListener("keydown", a) : window.removeEventListener("keydown", a);
    }), Be(() => window.removeEventListener("keydown", a)), (o, s) => (p(), D(je, { name: "kx-drawer" }, {
      default: ne(() => [
        e.open ? (p(), g("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: s[1] || (s[1] = ye((l) => i("close"), ["self"]))
        }, [
          d("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            d("div", po, [
              d("span", go, [
                x(u(P), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                V(_(e.title), 1)
              ]),
              x(re, {
                icon: "tabler:x",
                label: "Close",
                onClick: s[0] || (s[0] = (l) => i("close"))
              })
            ]),
            d("div", fo, [
              J(o.$slots, "default")
            ])
          ], 8, vo)
        ])) : L("", !0)
      ]),
      _: 3
    }));
  }
}), yo = ["aria-label"], ho = { class: "kx-modal-h" }, ko = { class: "kx-modal-h-ico" }, $o = { class: "kx-modal-h-text" }, _o = { class: "kx-modal-h-title" }, wo = {
  key: 0,
  class: "kx-modal-h-sub"
}, So = { class: "kx-modal-body" }, xo = { class: "kx-modal-foot" }, To = ["disabled"], Co = ["disabled"], Po = /* @__PURE__ */ W({
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
    function i(s) {
      s.key === "Escape" && !a.busy && n("cancel");
    }
    const a = e, o = I(null);
    return M(() => a.open, async (s) => {
      s ? (window.addEventListener("keydown", i), await Je(), o.value?.focus()) : window.removeEventListener("keydown", i);
    }, { immediate: !0 }), Be(() => window.removeEventListener("keydown", i)), (s, l) => (p(), D(je, { name: "kx-modal" }, {
      default: ne(() => [
        e.open ? (p(), g("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: l[3] || (l[3] = ye((r) => !e.busy && n("cancel"), ["self"]))
        }, [
          d("div", {
            class: R(["kx-modal", { danger: e.danger }]),
            role: "alertdialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            d("div", ho, [
              d("span", ko, [
                x(u(P), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", $o, [
                d("span", _o, _(e.title), 1),
                e.subtitle ? (p(), g("span", wo, _(e.subtitle), 1)) : L("", !0)
              ]),
              x(re, {
                icon: "tabler:x",
                label: "Close",
                disabled: e.busy,
                onClick: l[0] || (l[0] = (r) => n("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", So, [
              J(s.$slots, "default")
            ]),
            d("div", xo, [
              d("button", {
                ref_key: "cancelButton",
                ref: o,
                type: "button",
                class: "kx-btn kx-btn-ghost",
                disabled: e.busy,
                onClick: l[1] || (l[1] = (r) => n("cancel"))
              }, "Cancel", 8, To),
              d("button", {
                type: "button",
                class: R(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
                disabled: e.busy,
                onClick: l[2] || (l[2] = (r) => n("confirm"))
              }, [
                e.busy ? (p(), D(u(P), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : L("", !0),
                V(_(e.confirmLabel), 1)
              ], 10, Co)
            ])
          ], 10, yo)
        ])) : L("", !0)
      ]),
      _: 3
    }));
  }
}), Oo = {
  key: 0,
  class: "kx-notice error"
}, Ao = {
  key: 1,
  class: "mm-skel-reader"
}, Lo = {
  key: 2,
  class: "mm-reader"
}, Vo = { class: "mm-head" }, Io = { class: "mm-head-body" }, Eo = { class: "mm-head-top" }, Bo = { class: "kx-chip" }, jo = { class: "mm-topic" }, Do = { class: "mm-head-acts" }, Ro = ["disabled"], Uo = ["disabled"], Mo = ["disabled"], No = {
  key: 0,
  class: "mm-edit"
}, zo = { class: "mm-edit-acts" }, Ko = ["disabled"], Wo = {
  key: 1,
  class: "mm-title"
}, Fo = { class: "mm-facts" }, Ho = { class: "mm-fact" }, qo = ["title"], Yo = ["title"], Go = ["title"], Jo = { class: "mm-fact" }, Qo = {
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, Xo = { class: "mm-timeline" }, Zo = { class: "mm-tl-body" }, ea = { class: "mm-tl-t" }, ta = { class: "mm-tl-s" }, na = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, oa = {
  key: 0,
  class: "mm-muted"
}, aa = {
  key: 1,
  class: "mm-sources"
}, la = ["title"], ia = /* @__PURE__ */ W({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone"],
  setup(e, { emit: t }) {
    const n = e, i = t, a = I(null), o = I([]), s = I(null), l = I([]), r = I(""), c = I(null), y = I(!1), v = j(() => a.value ? H[a.value.kind] : null), k = j(() => a.value ? H[a.value.kind].icon : "tabler:brain"), w = j(() => a.value?.status === "current" || a.value?.status === "conflict");
    let h = 0;
    async function C(m = 0, f) {
      const S = ++h;
      try {
        const z = await G(n.memory.memoryId.value).item(n.itemId, m, f);
        if (S !== h) return;
        if (!m) {
          const we = z.item;
          if (we.status === "forgotten") {
            i("gone");
            return;
          }
          a.value = we, l.value = z.provenance;
        }
        const se = z.versions;
        o.value = m ? [...o.value, ...se.rows] : se.rows, s.value = se.next, r.value = "";
      } catch (z) {
        if (S !== h) return;
        $t(z) === 404 ? i("gone") : r.value = ie(z);
      }
    }
    M(() => n.itemId, () => {
      a.value = null, o.value = [], c.value = null, y.value = !1, C();
    }, { immediate: !0 }), M(n.memory.revision, () => {
      C(0, Math.max(50, o.value.length));
    });
    function O(m) {
      return n.memory.act(() => G(n.memory.memoryId.value).act(n.itemId, m));
    }
    async function E() {
      const m = (c.value || "").trim();
      if (!m || !a.value) return;
      await n.memory.act(async () => {
        const S = await G(n.memory.memoryId.value).edit(n.itemId, m);
        S && S !== n.itemId && i("replaced", S);
      }) && (c.value = null);
    }
    async function $() {
      await O("forget") && (y.value = !1, i("gone"));
    }
    function b(m) {
      return m.host_kind === "session" ? { label: "Conversation", icon: "tabler:message-circle" } : m.host_kind === "dataflow" ? { label: "Workflow run", icon: "tabler:route" } : m.host_kind === "content" ? { label: "Document", icon: "tabler:file-text" } : { label: m.host_kind, icon: "tabler:database" };
    }
    return (m, f) => (p(), g(B, null, [
      r.value ? (p(), g("div", Oo, [
        x(u(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, _(r.value), 1)
      ])) : a.value ? (p(), g("article", Lo, [
        d("header", Vo, [
          d("span", {
            class: R(["mm-head-ic", v.value?.tone])
          }, [
            x(u(P), {
              icon: k.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          d("div", Io, [
            d("div", Eo, [
              d("span", Bo, _(v.value?.label), 1),
              d("span", jo, _(u(q)(a.value.key)), 1),
              a.value.status !== "current" ? (p(), D(u($e), {
                key: 0,
                class: "kx-tag-sm",
                severity: u(Ne)(a.value.status),
                value: u(fe)[a.value.status]
              }, null, 8, ["severity", "value"])) : L("", !0),
              d("span", Do, [
                w.value && c.value === null ? (p(), g("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[0] || (f[0] = (S) => c.value = a.value.content)
                }, [
                  x(u(P), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  f[8] || (f[8] = V("Edit ", -1))
                ])) : L("", !0),
                w.value ? (p(), g("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: f[1] || (f[1] = (S) => O("archive"))
                }, [
                  x(u(P), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  f[9] || (f[9] = V("Archive ", -1))
                ], 8, Ro)) : L("", !0),
                a.value.status === "archived" ? (p(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: f[2] || (f[2] = (S) => O("restore"))
                }, [
                  x(u(P), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  f[10] || (f[10] = V("Restore ", -1))
                ], 8, Uo)) : L("", !0),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: f[3] || (f[3] = (S) => y.value = !0)
                }, [
                  x(u(P), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  f[11] || (f[11] = V("Forget ", -1))
                ], 8, Mo)
              ])
            ]),
            c.value !== null ? (p(), g("div", No, [
              x(u(Re), {
                modelValue: c.value,
                "onUpdate:modelValue": f[4] || (f[4] = (S) => c.value = S),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              d("div", zo, [
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !c.value.trim(),
                  onClick: E
                }, [
                  x(u(P), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  f[12] || (f[12] = V("Save text ", -1))
                ], 8, Ko),
                d("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: f[5] || (f[5] = (S) => c.value = null)
                }, "Cancel")
              ])
            ])) : (p(), g("h2", Wo, _(a.value.content), 1)),
            d("div", Fo, [
              d("span", Ho, [
                x(u(P), {
                  icon: "tabler:user-circle",
                  "aria-hidden": "true"
                }),
                V(_(u(Xt)(a.value)), 1)
              ]),
              d("span", {
                class: "mm-fact",
                title: u(Q)(a.value.valid_at)
              }, [
                x(u(P), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                V("True since " + _(u(F)(a.value.valid_at)), 1)
              ], 8, qo),
              a.value.invalid_at ? (p(), g("span", {
                key: 0,
                class: "mm-fact",
                title: u(Q)(a.value.invalid_at)
              }, [
                x(u(P), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                V("Until " + _(u(F)(a.value.invalid_at)), 1)
              ], 8, Yo)) : L("", !0),
              d("span", {
                class: "mm-fact",
                title: u(Q)(a.value.recorded_at)
              }, [
                x(u(P), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                V(_(u(Me)(a.value.source)), 1)
              ], 8, Go),
              d("span", Jo, [
                x(u(P), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                V(_(a.value.cardinality === "single" ? "One value at a time" : "Can hold several values"), 1)
              ])
            ])
          ])
        ]),
        d("section", Qo, [
          f[14] || (f[14] = d("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          d("ol", Xo, [
            (p(!0), g(B, null, N(o.value, (S) => (p(), g("li", {
              key: S.id,
              class: R({ now: S.id === a.value.id, past: S.status !== "current" })
            }, [
              f[13] || (f[13] = d("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              d("span", Zo, [
                d("span", ea, _(S.content), 1),
                d("span", ta, [
                  V("v" + _(S.version) + " · " + _(u(F)(S.valid_at)), 1),
                  S.status !== "current" ? (p(), g(B, { key: 0 }, [
                    V(" · " + _(u(fe)[S.status]), 1)
                  ], 64)) : L("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (p(), g("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: f[6] || (f[6] = (S) => C(s.value))
          }, "Show older versions")) : L("", !0)
        ]),
        d("section", na, [
          f[15] || (f[15] = d("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          l.value.length ? (p(), g("ul", aa, [
            (p(!0), g(B, null, N(l.value, (S) => (p(), g("li", {
              key: S.host_kind + S.host_id + S.event_id
            }, [
              x(u(P), {
                icon: b(S).icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              d("span", null, _(b(S).label), 1),
              S.recorded_at ? (p(), g("span", {
                key: 0,
                class: "mm-muted",
                title: u(Q)(S.recorded_at)
              }, _(u(F)(S.recorded_at)), 9, la)) : L("", !0)
            ]))), 128))
          ])) : (p(), g("p", oa, _(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (p(), g("div", Ao, [
        (p(), g(B, null, N(4, (S) => d("div", {
          key: S,
          class: "mm-skel-line"
        })), 64))
      ])),
      x(Po, {
        open: y.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? u(q)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: f[7] || (f[7] = (S) => y.value = !1),
        onConfirm: $
      }, {
        default: ne(() => [...f[16] || (f[16] = [
          V(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), ra = { class: "mm-rail-tools" }, sa = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, ua = {
  key: 0,
  class: "mm-skel"
}, da = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, ca = {
  key: 2,
  class: "mm-rail-empty"
}, ma = ["aria-expanded", "onClick"], va = { class: "kx-railsec-t" }, pa = { class: "kx-railsec-b" }, ga = ["aria-current", "onClick"], fa = { class: "mm-row-main" }, ba = { class: "mm-row-t" }, ya = { class: "mm-row-s" }, ha = ["disabled"], ka = /* @__PURE__ */ W({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(e, { emit: t }) {
    const n = e, i = t, a = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = I("current"), s = I(""), l = _t(s, 250, (k) => k.trim()), r = ke(() => {
      if (!n.memory.memoryId.value) return null;
      const k = new URLSearchParams({ status: o.value, limit: "100" });
      return l.value && k.set("q", l.value), `${n.memory.base.value}/items?${k.toString()}`;
    }, "items", n.memory.revision);
    M([o, l], () => {
      i("filtered"), i("status-change", o.value);
    }, { immediate: !0 });
    const c = I({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), y = j(() => Qt.map((k) => ({ ...k, items: r.rows.value.filter((w) => H[w.kind].group === k.id) })).filter((k) => k.items.length)), v = j(() => l.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (k, w) => (p(), g(B, null, [
      d("div", ra, [
        x(wt, {
          modelValue: s.value,
          "onUpdate:modelValue": w[0] || (w[0] = (h) => s.value = h),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        x(u(_e), {
          modelValue: o.value,
          "onUpdate:modelValue": w[1] || (w[1] = (h) => o.value = h),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      d("nav", sa, [
        u(r).loading.value && !u(r).rows.value.length ? (p(), g("div", ua, [
          (p(), g(B, null, N(6, (h) => d("div", {
            key: h,
            class: "mm-skel-row"
          })), 64))
        ])) : u(r).error.value ? (p(), g("div", da, [
          x(u(P), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          d("span", null, _(u(r).error.value), 1)
        ])) : u(r).rows.value.length ? L("", !0) : (p(), g("div", ca, _(v.value), 1)),
        (p(!0), g(B, null, N(y.value, (h) => (p(), g("div", {
          key: h.id,
          class: R(["kx-railsec", { closed: c.value[h.id] }])
        }, [
          d("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !c.value[h.id],
            onClick: (C) => c.value[h.id] = !c.value[h.id]
          }, [
            x(u(P), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            x(u(P), {
              class: "kx-railsec-ic",
              icon: h.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", va, _(h.title), 1)
          ], 8, ma),
          Ee(d("div", pa, [
            (p(!0), g(B, null, N(h.items, (C) => (p(), g("button", {
              key: C.id,
              type: "button",
              class: R(["mm-row", { on: e.selectedId === C.id }]),
              "aria-current": e.selectedId === C.id ? "true" : void 0,
              onClick: (O) => i("select", C)
            }, [
              d("span", {
                class: R(["mm-row-ic", u(H)[C.kind].tone])
              }, [
                x(u(P), {
                  icon: u(H)[C.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              d("span", fa, [
                d("span", ba, _(C.content), 1),
                d("span", ya, _(u(q)(C.key)) + " · " + _(u(F)(C.valid_at)), 1)
              ])
            ], 10, ga))), 128))
          ], 512), [
            [Qe, !c.value[h.id]]
          ])
        ], 2))), 128)),
        u(r).next.value !== null ? (p(), g("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: u(r).loading.value,
          onClick: w[2] || (w[2] = //@ts-ignore
          (...h) => u(r).more && u(r).more(...h))
        }, [
          u(r).loading.value ? (p(), D(u(P), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : L("", !0),
          w[3] || (w[3] = V("Show more ", -1))
        ], 8, ha)) : L("", !0)
      ])
    ], 64));
  }
}), $a = {
  key: 0,
  class: "kx-notice error"
}, _a = {
  key: 1,
  class: "mm-page"
}, wa = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Sa = { class: "kx-shell" }, xa = { class: "kx-rail" }, Ta = { class: "kx-railhead" }, Ca = { class: "kx-railhead-title" }, Pa = { key: 0 }, Oa = { class: "kx-railhead-acts" }, Aa = { class: "kx-main" }, La = { class: "kx-main-scroll mm-main" }, Va = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, Ia = { class: "kx-empty-ico" }, Ea = /* @__PURE__ */ W({
  __name: "MemoryManage",
  setup(e) {
    const t = pt(), n = gt(), i = I(""), a = I({});
    M(() => t.value.config, ($) => {
      try {
        a.value = ft($), i.value = "";
      } catch (b) {
        i.value = ie(b);
      }
    }, { immediate: !0 });
    const o = Bn(j(() => String(a.value.kb_id || ""))), s = I("item"), l = I(String(a.value.route || "")), r = I(!1), c = I("current"), y = j(() => o.status.value?.counts[c.value]), v = j(() => o.status.value?.counts.conflict_groups || 0), k = j(() => (o.status.value?.runs || []).filter(($) => $.status === "failed").length);
    M(() => a.value.route, ($) => {
      const b = typeof $ == "string" ? $ : "";
      b !== l.value && (w = !0, l.value = b, b && (s.value = "item"));
    }), M(o.memoryId, () => {
      l.value = "", s.value = "item";
    });
    let w = !1;
    M(l, ($) => {
      if (w) {
        w = !1;
        return;
      }
      n("navigate", $ || "");
    });
    function h($) {
      s.value = "item", $ !== l.value && (l.value = $);
    }
    function C($) {
      h($.id);
    }
    function O($) {
      s.value = s.value === $ ? "item" : $;
    }
    function E($) {
      r.value = !1, $ && h($);
    }
    return ($, b) => i.value ? (p(), g("div", $a, _(i.value), 1)) : (p(), g("div", _a, [
      u(o).error.value ? (p(), g("div", wa, [
        x(u(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, _(u(o).error.value), 1)
      ])) : L("", !0),
      d("div", Sa, [
        d("aside", xa, [
          d("div", Ta, [
            d("span", Ca, [
              b[7] || (b[7] = V("Memories", -1)),
              y.value !== void 0 ? (p(), g("b", Pa, _(y.value), 1)) : L("", !0)
            ]),
            d("div", Oa, [
              x(re, {
                icon: "tabler:activity",
                label: k.value ? `Activity, ${k.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: b[0] || (b[0] = (m) => O("activity"))
              }, null, 8, ["label", "active"]),
              x(re, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: b[1] || (b[1] = (m) => r.value = !0)
              })
            ])
          ]),
          v.value ? (p(), g("button", {
            key: 0,
            type: "button",
            class: R(["mm-conflict-bar", { on: s.value === "conflicts" }]),
            onClick: b[2] || (b[2] = (m) => O("conflicts"))
          }, [
            x(u(P), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            d("span", null, _(v.value === 1 ? "1 conflict to resolve" : `${v.value} conflicts to resolve`), 1),
            x(u(P), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : L("", !0),
          x(ka, {
            memory: u(o),
            "selected-id": s.value === "item" ? l.value : "",
            onSelect: C,
            onFiltered: b[3] || (b[3] = (m) => l.value = ""),
            onStatusChange: b[4] || (b[4] = (m) => c.value = m)
          }, null, 8, ["memory", "selected-id"])
        ]),
        d("main", Aa, [
          d("div", La, [
            s.value === "conflicts" ? (p(), D(co, {
              key: 0,
              memory: u(o)
            }, null, 8, ["memory"])) : s.value === "activity" ? (p(), D(mn, {
              key: 1,
              memory: u(o)
            }, null, 8, ["memory"])) : l.value ? (p(), D(ia, {
              key: l.value,
              memory: u(o),
              "item-id": l.value,
              onReplaced: h,
              onGone: b[5] || (b[5] = (m) => l.value = "")
            }, null, 8, ["memory", "item-id"])) : (p(), g("div", Va, [
              d("span", Ia, [
                x(u(P), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              b[8] || (b[8] = d("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              b[9] || (b[9] = d("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      x(bo, {
        open: r.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: b[6] || (b[6] = (m) => r.value = !1)
      }, {
        default: ne(() => [
          r.value ? (p(), D(Jn, {
            key: 0,
            memory: u(o),
            onAdded: E
          }, null, 8, ["memory"])) : L("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), Ba = bt(Ea, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
Ze(import.meta.url, Ba);
//# sourceMappingURL=index.js.map
