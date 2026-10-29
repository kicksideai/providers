import { mergeProps as K, openBlock as v, createElementBlock as g, createBlock as U, resolveDynamicComponent as Je, createCommentVNode as P, renderSlot as ee, createElementVNode as u, toDisplayString as $, defineComponent as Y, computed as R, Fragment as D, createVNode as S, unref as d, createTextVNode as j, renderList as F, normalizeClass as N, resolveDirective as Qe, withDirectives as Me, resolveComponent as Xe, createSlots as Ze, withCtx as se, ref as E, watch as W, onUnmounted as et, withModifiers as we, onBeforeUnmount as Ue, Transition as Ne, nextTick as tt, vShow as nt } from "vue";
import { Icon as O } from "@iconify/vue";
import { on as ot, define as at } from "@wippy-fe/proxy";
import { F as lt, d as rt, n as it, N as Pe, S as Z, B as H, f as pe, g as ge, i as Ae, h as st, l as ut, P as ue, C as dt, Q as ct, j as fe, T as Oe, R as Le, v as mt, k as vt, K as pt, W as gt, U as ft, s as Ie, o as be, q as de, r as bt, e as oe, t as yt, u as ht, a as kt, b as $t, m as _t } from "./types-D3kJ2ulw.js";
import { B as ye, s as wt, f as Se, c as ze, u as St, a as xt, d as Ke } from "./useWidget-wVsuCND0.js";
import { m as q, a as xe, h as Ve, u as Tt, _ as Ct } from "./usePaged-B6B3LhXE.js";
var ce = {};
function Pt(e = "pui_id_") {
  return Object.hasOwn(ce, e) || (ce[e] = 0), ce[e]++, `${e}${ce[e]}`;
}
function ae(e) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ae(e);
}
function Ee(e, t) {
  return It(e) || Lt(e, t) || Ot(e, t) || At();
}
function At() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ot(e, t) {
  if (e) {
    if (typeof e == "string") return Be(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Be(e, t) : void 0;
  }
}
function Be(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Lt(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var l, a, o, s, r = [], i = !0, m = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(i = (l = o.call(n)).done) && (r.push(l.value), r.length !== t); i = !0) ;
    } catch (b) {
      m = !0, a = b;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (m) throw a;
      }
    }
    return r;
  }
}
function It(e) {
  if (Array.isArray(e)) return e;
}
function je(e, t) {
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
    t % 2 ? je(Object(n), !0).forEach(function(l) {
      he(e, l, n[l]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : je(Object(n)).forEach(function(l) {
      Object.defineProperty(e, l, Object.getOwnPropertyDescriptor(n, l));
    });
  }
  return e;
}
function he(e, t, n) {
  return (t = Vt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Vt(e) {
  var t = Et(e, "string");
  return ae(t) == "symbol" ? t : t + "";
}
function Et(e, t) {
  if (ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ae(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var T = {
  _getMeta: function() {
    return [Ae(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], st(Ae(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var l, a, o;
    return (l = (t == null || (a = t.instance) === null || a === void 0 ? void 0 : a.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || l === void 0 ? void 0 : l.config;
  },
  _getOptionValue: lt,
  _getPTValue: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, r = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var L = T._getOptionValue.apply(T, arguments);
      return pe(L) || dt(L) ? {
        class: L
      } : L;
    }, m = ((t = l.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = l.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, b = m.mergeSections, p = b === void 0 ? !0 : b, k = m.mergeProps, _ = k === void 0 ? !1 : k, y = r ? T._useDefaultPT(l, l.defaultPT(), i, o, s) : void 0, C = T._usePT(l, T._getPT(a, l.$name), i, o, A(A({}, s), {}, {
      global: y || {}
    })), I = T._getPTDatasets(l, o);
    return p || !p && C ? _ ? T._mergeProps(l, _, y, C, I) : A(A(A({}, y), C), I) : A(A({}, C), I);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = "data-pc-";
    return A(A({}, n === "root" && he({}, "".concat(l, "name"), ge(t.$name))), {}, he({}, "".concat(l, "section"), ge(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
      var r, i = l ? l(s) : s, m = ge(n);
      return (r = i?.[m]) !== null && r !== void 0 ? r : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: a(t.originalValue),
      value: a(t.value)
    } : a(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(I) {
      return l(I, a, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var r, i = n._usept || ((r = t.$primevueConfig) === null || r === void 0 ? void 0 : r.ptOptions) || {}, m = i.mergeSections, b = m === void 0 ? !0 : m, p = i.mergeProps, k = p === void 0 ? !1 : p, _ = s(n.originalValue), y = s(n.value);
      return _ === void 0 && y === void 0 ? void 0 : pe(y) ? y : pe(_) ? _ : b || !b && y ? k ? T._mergeProps(t, k, _, y) : A(A({}, _), y) : y;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return T._usePT(t, n, l, a, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = arguments.length > 1 ? arguments[1] : void 0, a = arguments.length > 2 ? arguments[2] : void 0, o = T._getConfig(l, a), s = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    T._loadCoreStyles(n, s), T._loadThemeStyles(n, s), T._loadScopedThemeStyles(n, s), T._removeThemeListeners(n), n.$loadStyles = function() {
      return T._loadThemeStyles(n, s);
    }, T._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!ye.isStyleNameLoaded((t = l.$style) === null || t === void 0 ? void 0 : t.name) && (n = l.$style) !== null && n !== void 0 && n.name) {
      var o;
      H.loadCSS(a), (o = l.$style) === null || o === void 0 || o.loadCSS(a), ye.setLoadedStyleName(l.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, l, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(a != null && a.isUnstyled() || (a == null || (t = a.theme) === null || t === void 0 ? void 0 : t.call(a)) === "none")) {
      if (!Z.isStyleNameLoaded("common")) {
        var s, r, i = ((s = a.$style) === null || s === void 0 || (r = s.getCommonTheme) === null || r === void 0 ? void 0 : r.call(s)) || {}, m = i.primitive, b = i.semantic, p = i.global, k = i.style;
        H.load(m?.css, A({
          name: "primitive-variables"
        }, o)), H.load(b?.css, A({
          name: "semantic-variables"
        }, o)), H.load(p?.css, A({
          name: "global-variables"
        }, o)), H.loadStyle(A({
          name: "global-style"
        }, o), k), Z.setLoadedStyleName("common");
      }
      if (!Z.isStyleNameLoaded((n = a.$style) === null || n === void 0 ? void 0 : n.name) && (l = a.$style) !== null && l !== void 0 && l.name) {
        var _, y, C, I, B = ((_ = a.$style) === null || _ === void 0 || (y = _.getDirectiveTheme) === null || y === void 0 ? void 0 : y.call(_)) || {}, L = B.css, f = B.style;
        (C = a.$style) === null || C === void 0 || C.load(L, A({
          name: "".concat(a.$style.name, "-variables")
        }, o)), (I = a.$style) === null || I === void 0 || I.loadStyle(A({
          name: "".concat(a.$style.name, "-style")
        }, o), f), Z.setLoadedStyleName(a.$style.name);
      }
      if (!Z.isStyleNameLoaded("layer-order")) {
        var c, x, z = (c = a.$style) === null || c === void 0 || (x = c.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(c);
        H.load(z, A({
          name: "layer-order",
          first: !0
        }, o)), Z.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = t.preset();
    if (l && t.$attrSelector) {
      var a, o, s, r = ((a = t.$style) === null || a === void 0 || (o = a.getPresetTheme) === null || o === void 0 ? void 0 : o.call(a, l, "[".concat(t.$attrSelector, "]"))) || {}, i = r.css, m = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, A({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = m.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    ye.clearLoadedStyleNames(), Pe.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Pe.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, l, a, o, s) {
    var r, i, m = "on".concat(it(n)), b = T._getConfig(a, o), p = l?.$instance, k = T._usePT(p, T._getPT(a == null || (r = a.value) === null || r === void 0 ? void 0 : r.pt, t), T._getOptionValue, "hooks.".concat(m)), _ = T._useDefaultPT(p, b == null || (i = b.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], T._getOptionValue, "hooks.".concat(m)), y = {
      el: l,
      binding: a,
      vnode: o,
      prevVnode: s
    };
    k?.(p, y), _?.(p, y);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, l = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      l[a - 2] = arguments[a];
    return rt(t) ? t.apply(void 0, l) : K.apply(void 0, l);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = function(r, i, m, b, p) {
      var k, _, y, C;
      i._$instances = i._$instances || {};
      var I = T._getConfig(m, b), B = i._$instances[t] || {}, L = ut(B) ? A(A({}, n), n?.methods) : {};
      i._$instances[t] = A(A({}, B), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: m,
        $modifiers: m?.modifiers,
        $value: m?.value,
        $el: B.$el || i || void 0,
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
        $primevueConfig: I,
        $attrSelector: (k = i.$pd) === null || k === void 0 || (k = k[t]) === null || k === void 0 ? void 0 : k.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return T._getPT(I?.pt, void 0, function(c) {
            var x;
            return c == null || (x = c.directives) === null || x === void 0 ? void 0 : x[t];
          });
        },
        isUnstyled: function() {
          var c, x;
          return ((c = i._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.unstyled) !== void 0 ? (x = i._$instances[t]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.unstyled : I?.unstyled;
        },
        theme: function() {
          var c;
          return (c = i._$instances[t]) === null || c === void 0 || (c = c.$primevueConfig) === null || c === void 0 ? void 0 : c.theme;
        },
        preset: function() {
          var c;
          return (c = i._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.dt;
        },
        /* instance's methods */
        ptm: function() {
          var c, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return T._getPTValue(i._$instances[t], (c = i._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.pt, x, A({}, z));
        },
        ptmo: function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T._getPTValue(i._$instances[t], c, x, z, !1);
        },
        cx: function() {
          var c, x, z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (c = i._$instances[t]) !== null && c !== void 0 && c.isUnstyled() ? void 0 : T._getOptionValue((x = i._$instances[t]) === null || x === void 0 || (x = x.$style) === null || x === void 0 ? void 0 : x.classes, z, A({}, V));
        },
        sx: function() {
          var c, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, V = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return z ? T._getOptionValue((c = i._$instances[t]) === null || c === void 0 || (c = c.$style) === null || c === void 0 ? void 0 : c.inlineStyles, x, A({}, V)) : void 0;
        }
      }, L), i.$instance = i._$instances[t], (_ = (y = i.$instance)[r]) === null || _ === void 0 || _.call(y, i, m, b, p), i["$".concat(t)] = i.$instance, T._hook(t, r, i, m, b, p), i.$pd || (i.$pd = {}), i.$pd[t] = A(A({}, (C = i.$pd) === null || C === void 0 ? void 0 : C[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, a = function(r) {
      var i, m, b, p = r._$instances[t], k = p?.watch, _ = function(I) {
        var B, L = I.newValue, f = I.oldValue;
        return k == null || (B = k.config) === null || B === void 0 ? void 0 : B.call(p, L, f);
      }, y = function(I) {
        var B, L = I.newValue, f = I.oldValue;
        return k == null || (B = k["config.ripple"]) === null || B === void 0 ? void 0 : B.call(p, L, f);
      };
      p.$watchersCallback = {
        config: _,
        "config.ripple": y
      }, k == null || (i = k.config) === null || i === void 0 || i.call(p, p?.$primevueConfig), ue.on("config:change", _), k == null || (m = k["config.ripple"]) === null || m === void 0 || m.call(p, p == null || (b = p.$primevueConfig) === null || b === void 0 ? void 0 : b.ripple), ue.on("config:ripple:change", y);
    }, o = function(r) {
      var i = r._$instances[t].$watchersCallback;
      i && (ue.off("config:change", i.config), ue.off("config:ripple:change", i["config.ripple"]), r._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(r, i, m, b) {
        r.$pd || (r.$pd = {}), r.$pd[t] = {
          name: t,
          attrSelector: Pt("pd")
        }, l("created", r, i, m, b);
      },
      beforeMount: function(r, i, m, b) {
        var p;
        T._loadStyles((p = r.$pd[t]) === null || p === void 0 ? void 0 : p.instance, i, m), l("beforeMount", r, i, m, b), a(r);
      },
      mounted: function(r, i, m, b) {
        var p;
        T._loadStyles((p = r.$pd[t]) === null || p === void 0 ? void 0 : p.instance, i, m), l("mounted", r, i, m, b);
      },
      beforeUpdate: function(r, i, m, b) {
        l("beforeUpdate", r, i, m, b);
      },
      updated: function(r, i, m, b) {
        var p;
        T._loadStyles((p = r.$pd[t]) === null || p === void 0 ? void 0 : p.instance, i, m), l("updated", r, i, m, b);
      },
      beforeUnmount: function(r, i, m, b) {
        var p;
        o(r), T._removeThemeListeners((p = r.$pd[t]) === null || p === void 0 ? void 0 : p.instance), l("beforeUnmount", r, i, m, b);
      },
      unmounted: function(r, i, m, b) {
        var p;
        (p = r.$pd[t]) === null || p === void 0 || (p = p.instance) === null || p === void 0 || (p = p.scopedStyleEl) === null || p === void 0 || (p = p.value) === null || p === void 0 || p.remove(), l("unmounted", r, i, m, b);
      }
    };
  },
  extend: function() {
    var t = T._getMeta.apply(T, arguments), n = Ee(t, 2), l = n[0], a = n[1];
    return A({
      extend: function() {
        var s = T._getMeta.apply(T, arguments), r = Ee(s, 2), i = r[0], m = r[1];
        return T.extend(i, A(A(A({}, a), a?.methods), m));
      }
    }, T._extend(l, a));
  }
}, Bt = `
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
`, jt = {
  root: "p-ink"
}, Dt = H.extend({
  name: "ripple-directive",
  style: Bt,
  classes: jt
}), Rt = T.extend({
  style: Dt
});
function le(e) {
  "@babel/helpers - typeof";
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, le(e);
}
function Mt(e) {
  return Kt(e) || zt(e) || Nt(e) || Ut();
}
function Ut() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nt(e, t) {
  if (e) {
    if (typeof e == "string") return ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ke(e, t) : void 0;
  }
}
function zt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Kt(e) {
  if (Array.isArray(e)) return ke(e);
}
function ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function De(e, t, n) {
  return (t = Wt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wt(e) {
  var t = Ft(e, "string");
  return le(t) == "symbol" ? t : t + "";
}
function Ft(e, t) {
  if (le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (le(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var We = Rt.extend("ripple", {
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
      n || (n = ft("span", De(De({
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
        if (!this.isUnstyled() && fe(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"), !Oe(a) && !Le(a)) {
          var o = Math.max(mt(l), vt(l));
          a.style.height = o + "px", a.style.width = o + "px";
        }
        var s = pt(l), r = t.pageX - s.left + document.body.scrollTop - Le(a) / 2, i = t.pageY - s.top + document.body.scrollLeft - Oe(a) / 2;
        a.style.top = i + "px", a.style.left = r + "px", !this.isUnstyled() && gt(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          a && (!n.isUnstyled() && fe(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && fe(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Mt(t.children).find(function(n) {
        return ct(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Ht = `
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
`, qt = {
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
}, Yt = H.extend({
  name: "tag",
  style: Ht,
  classes: qt
}), Gt = {
  name: "BaseTag",
  extends: wt,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Yt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function re(e) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, re(e);
}
function Jt(e, t, n) {
  return (t = Qt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qt(e) {
  var t = Xt(e, "string");
  return re(t) == "symbol" ? t : t + "";
}
function Xt(e, t) {
  if (re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (re(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Te = {
  name: "Tag",
  extends: Gt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Se(Jt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Zt = ["data-p"];
function en(e, t, n, l, a, o) {
  return v(), g("span", K({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), U(Je(e.$slots.icon), K({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), g("span", K({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : P("", !0), e.value != null || e.$slots.default ? ee(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", K({
      class: e.cx("label")
    }, e.ptm("label")), $(e.value), 17)];
  }) : P("", !0)], 16, Zt);
}
Te.render = en;
const X = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, tn = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function J(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
const nn = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function on(e) {
  return nn[e];
}
const $e = {
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
}, an = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Fe(e) {
  return an[e] ?? "secondary";
}
function He(e) {
  return e ? Date.parse(e.includes("T") ? e : e.replace(" ", "T") + "Z") : NaN;
}
function me(e) {
  const t = He(e);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}
const ln = [
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
  const l = Math.round((n - t) / 1e3), a = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, s] of ln)
    if (Math.abs(l) >= s) return a.format(Math.round(l / s), o);
  return "just now";
}
const rn = { class: "mm-view-head" }, sn = { class: "mm-view-title" }, un = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, dn = { class: "kx-empty-ico" }, cn = {
  key: 1,
  class: "mm-runs"
}, mn = { class: "mm-run-main" }, vn = { class: "mm-run-t" }, pn = ["title"], gn = {
  key: 0,
  class: "mm-run-err"
}, fn = /* @__PURE__ */ Y({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = R(() => t.memory.status.value?.runs || []);
    function l(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function a(o) {
      const s = o.stats || {}, r = [
        s.added ? `${s.added} new` : "",
        s.superseded ? `${s.superseded} updated` : "",
        s.conflicted ? `${s.conflicted} contested` : "",
        s.rejected ? `${s.rejected} rejected` : ""
      ].filter(Boolean);
      return r.length ? r.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, s) => (v(), g(D, null, [
      u("header", rn, [
        u("h2", sn, [
          S(d(O), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = j("Activity", -1))
        ]),
        s[1] || (s[1] = u("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (v(), g("ol", cn, [
        (v(!0), g(D, null, F(n.value, (r) => (v(), g("li", {
          key: r.id,
          class: N(["mm-run", r.status])
        }, [
          u("div", mn, [
            u("span", vn, $(l(r)), 1),
            u("span", {
              class: "mm-muted",
              title: d(me)(r.finished_at || r.started_at || r.created_at)
            }, [
              j($(d(Q)(r.finished_at || r.started_at || r.created_at)), 1),
              a(r) ? (v(), g(D, { key: 0 }, [
                j(" · " + $(a(r)), 1)
              ], 64)) : P("", !0)
            ], 8, pn),
            r.last_error ? (v(), g("span", gn, $(r.last_error), 1)) : P("", !0)
          ]),
          r.status !== "succeeded" ? (v(), U(d(Te), {
            key: 0,
            class: "kx-tag-sm",
            severity: d(Fe)(r.status),
            value: d($e)[r.status]
          }, null, 8, ["severity", "value"])) : P("", !0)
        ], 2))), 128))
      ])) : (v(), g("div", un, [
        u("span", dn, [
          S(d(O), {
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
var bn = `
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
`, yn = {
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
}, hn = H.extend({
  name: "togglebutton",
  style: bn,
  classes: yn
}), kn = {
  name: "BaseToggleButton",
  extends: ze,
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
  style: hn,
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
function $n(e, t, n) {
  return (t = _n(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _n(e) {
  var t = wn(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function wn(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (ie(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qe = {
  name: "ToggleButton",
  extends: kn,
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
      return Ie(this.onLabel) && Ie(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return Se($n({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: We
  }
}, Sn = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], xn = ["data-p"];
function Tn(e, t, n, l, a, o) {
  var s = Qe("ripple");
  return Me((v(), g("button", K({
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
  }), [u("span", K({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [ee(e.$slots, "default", {}, function() {
    return [ee(e.$slots, "icon", {
      value: e.d_value,
      class: N(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (v(), g("span", K({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : P("", !0)];
    }), u("span", K({
      class: e.cx("label")
    }, o.getPTOptions("label")), $(o.label), 17)];
  })], 16, xn)], 16, Sn)), [[s]]);
}
qe.render = Tn;
var Cn = `
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
`, Pn = {
  root: function(t) {
    var n = t.props, l = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": l.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, An = H.extend({
  name: "selectbutton",
  style: Cn,
  classes: Pn
}), On = {
  name: "BaseSelectButton",
  extends: ze,
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
  style: An,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Ln(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Ye(e)) || t) {
      n && (e = n);
      var l = 0, a = function() {
      };
      return { s: a, n: function() {
        return l >= e.length ? { done: !0 } : { done: !1, value: e[l++] };
      }, e: function(m) {
        throw m;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, r = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var m = n.next();
    return s = m.done, m;
  }, e: function(m) {
    r = !0, o = m;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (r) throw o;
    }
  } };
}
function In(e) {
  return Bn(e) || En(e) || Ye(e) || Vn();
}
function Vn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ye(e, t) {
  if (e) {
    if (typeof e == "string") return _e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _e(e, t) : void 0;
  }
}
function En(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Bn(e) {
  if (Array.isArray(e)) return _e(e);
}
function _e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
var Ce = {
  name: "SelectButton",
  extends: On,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? de(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? de(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? de(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? de(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, l) {
      var a = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var o = this.isSelected(n), s = this.getOptionValue(n), r;
        if (this.multiple)
          if (o) {
            if (r = this.d_value.filter(function(i) {
              return !be(i, s, a.equalityKey);
            }), !this.allowEmpty && r.length === 0) return;
          } else
            r = this.d_value ? [].concat(In(this.d_value), [s]) : [s];
        else {
          if (o && !this.allowEmpty) return;
          r = o ? null : s;
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
          var a = Ln(this.d_value), o;
          try {
            for (a.s(); !(o = a.n()).done; ) {
              var s = o.value;
              if (be(s, l, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (r) {
            a.e(r);
          } finally {
            a.f();
          }
        }
      } else
        n = be(this.d_value, l, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return Se({
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
}, jn = ["aria-labelledby", "data-p"];
function Dn(e, t, n, l, a, o) {
  var s = Xe("ToggleButton");
  return v(), g("div", K({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(v(!0), g(D, null, F(e.options, function(r, i) {
    return v(), U(s, {
      key: o.getOptionRenderKey(r),
      modelValue: o.isSelected(r),
      onLabel: o.getOptionLabel(r),
      offLabel: o.getOptionLabel(r),
      disabled: e.disabled || o.isOptionDisabled(r),
      unstyled: e.unstyled,
      size: e.size,
      readonly: o.isOptionReadonly(r),
      onChange: function(b) {
        return o.onOptionSelect(b, r, i);
      },
      pt: e.ptm("pcToggleButton")
    }, Ze({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: se(function() {
        return [ee(e.$slots, "option", {
          option: r,
          index: i
        }, function() {
          return [u("span", K({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), $(o.getOptionLabel(r)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, jn);
}
Ce.render = Dn;
function Rn(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Re(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Mn(e) {
  const t = R(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = E(null), l = E(""), a = E(!1), o = E(0);
  let s = 0;
  async function r() {
    const b = ++s;
    if (!e.value) return !1;
    try {
      const p = await q(e.value).status();
      return b !== s ? !1 : (n.value = p, l.value = "", o.value++, !0);
    } catch (p) {
      return b === s && (l.value = oe(p)), !1;
    }
  }
  async function i(b) {
    a.value = !0, l.value = "";
    try {
      return await b(), await r();
    } catch (p) {
      return l.value = oe(p), !1;
    } finally {
      a.value = !1;
    }
  }
  let m = null;
  return W(e, (b) => {
    if (m && m(), m = null, s++, n.value = null, l.value = "", !b) return;
    const p = ot(`component.${b}`, () => {
      r();
    });
    m = typeof p == "function" ? p : null, r();
  }, { immediate: !0 }), et(() => {
    m && m();
  }), bt(async () => {
    await r();
  }), { memoryId: e, base: t, status: n, error: l, busy: a, revision: o, act: i };
}
const Un = { class: "mm-field" }, Nn = { class: "mm-hint" }, zn = { class: "mm-field" }, Kn = ["selected"], Wn = {
  key: 1,
  class: "kx-notice error"
}, Fn = { class: "mm-field" }, Hn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, qn = {
  key: 1,
  class: "mm-hint"
}, Yn = {
  key: 2,
  class: "kx-notice error"
}, Gn = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, Jn = ["onClick"], Qn = { class: "mm-field" }, Xn = { class: "mm-form-foot" }, Zn = ["disabled"], eo = /* @__PURE__ */ Y({
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
    ], o = E("rule"), s = E(""), r = E(""), i = E(""), m = St("wc-agent-picker"), b = R(() => a.find((L) => L.value === o.value)?.hint || ""), p = R(() => Rn(r.value)), k = R(() => r.value && !Re(p.value) ? "Use a short topic of letters, digits and spaces." : ""), _ = R(() => !!s.value && Re(p.value) && !!i.value.trim()), y = xe(
      () => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value] : null,
      (L) => q(n.memory.memoryId.value).topics({ kind: o.value, offset: L }),
      n.memory.revision
    ), C = R(() => y.rows.value.map((L) => L.key).filter((L) => L !== p.value).slice(0, 8));
    W(o, () => {
      r.value = "";
    });
    function I(L) {
      const f = yt(L).selected;
      s.value = String((Array.isArray(f) ? f : [])[0] || "");
    }
    async function B() {
      if (!_.value) return;
      let L = null;
      await n.memory.act(async () => {
        L = await q(n.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: s.value,
          key: p.value,
          value: i.value.trim(),
          content: i.value.trim()
        });
      }) && L !== null && l("added", L);
    }
    return (L, f) => (v(), g("form", {
      class: "mm-form",
      onSubmit: we(B, ["prevent"])
    }, [
      u("div", Un, [
        f[3] || (f[3] = u("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        S(d(Ce), {
          modelValue: o.value,
          "onUpdate:modelValue": f[0] || (f[0] = (c) => o.value = c),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        u("span", Nn, [
          S(d(O), {
            icon: d(X)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          j($(b.value), 1)
        ])
      ]),
      u("div", zn, [
        f[4] || (f[4] = u("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        d(m).ready.value ? (v(), g("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: s.value ? JSON.stringify([s.value]) : "[]",
          onChange: I
        }, null, 40, Kn)) : d(m).failed.value ? (v(), g("div", Wn, "The agent picker could not load: " + $(d(m).failed.value), 1)) : P("", !0)
      ]),
      u("div", Fn, [
        f[5] || (f[5] = u("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        S(d(xt), {
          id: "add_topic",
          modelValue: r.value,
          "onUpdate:modelValue": f[1] || (f[1] = (c) => r.value = c),
          placeholder: "e.g. response style",
          invalid: !!k.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        k.value ? (v(), g("span", Hn, $(k.value), 1)) : (v(), g("span", qn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        d(y).error.value ? (v(), g("div", Yn, $(d(y).error.value), 1)) : P("", !0),
        C.value.length ? (v(), g("div", Gn, [
          (v(!0), g(D, null, F(C.value, (c) => (v(), g("button", {
            key: c,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (x) => r.value = d(J)(c)
          }, $(d(J)(c)), 9, Jn))), 128))
        ])) : P("", !0)
      ]),
      u("div", Qn, [
        f[6] || (f[6] = u("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        S(d(Ke), {
          id: "add_text",
          modelValue: i.value,
          "onUpdate:modelValue": f[2] || (f[2] = (c) => i.value = c),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      u("div", Xn, [
        u("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !_.value
        }, [
          S(d(O), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: N({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          f[7] || (f[7] = j("Add to memory ", -1))
        ], 8, Zn)
      ])
    ], 32));
  }
}), to = { class: "mm-view-head" }, no = { class: "mm-view-title" }, oo = {
  key: 0,
  class: "kx-notice error"
}, ao = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, lo = { class: "kx-empty-ico" }, ro = ["aria-label"], io = { class: "mm-card-h" }, so = { class: "kx-chip" }, uo = { class: "mm-option-main" }, co = { class: "mm-option-t" }, mo = { class: "mm-muted" }, vo = ["disabled", "onClick"], po = ["disabled"], go = /* @__PURE__ */ Y({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = xe(() => t.memory.memoryId.value || null, (a) => q(t.memory.memoryId.value).conflicts(a), t.memory.revision);
    function l(a, o) {
      t.memory.act(() => q(t.memory.memoryId.value).resolve(a.group_id, o.id));
    }
    return (a, o) => (v(), g(D, null, [
      u("header", to, [
        u("h2", no, [
          S(d(O), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = j("Conflicts", -1))
        ]),
        o[2] || (o[2] = u("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      d(n).error.value ? (v(), g("div", oo, [
        S(d(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(d(n).error.value), 1)
      ])) : !d(n).loading.value && !d(n).rows.value.length ? (v(), g("div", ao, [
        u("span", lo, [
          S(d(O), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = u("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = u("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : P("", !0),
      (v(!0), g(D, null, F(d(n).rows.value, (s) => (v(), g("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${d(J)(s.items[0].key)}`
      }, [
        u("div", io, [
          u("span", so, $(d(X)[s.items[0].kind].label), 1),
          j($(d(J)(s.items[0].key)), 1)
        ]),
        (v(!0), g(D, null, F(s.items, (r) => (v(), g("div", {
          key: r.id,
          class: "mm-option"
        }, [
          u("div", uo, [
            u("span", co, $(r.content), 1),
            u("span", mo, $(d(Q)(r.valid_at)) + " · " + $(d(on)(r.source)), 1)
          ]),
          u("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (i) => l(s, r)
          }, [
            S(d(O), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = j("Keep this ", -1))
          ], 8, vo)
        ]))), 128))
      ], 8, ro))), 128)),
      d(n).next.value !== null ? (v(), g("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: d(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...s) => d(n).more && d(n).more(...s))
      }, "Show more conflicts", 8, po)) : P("", !0)
    ], 64));
  }
}), fo = ["aria-label", "title", "aria-pressed", "disabled"], ve = /* @__PURE__ */ Y({
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
      class: N(["kx-iconbtn", { on: e.active }]),
      "aria-label": e.label,
      title: e.label,
      "aria-pressed": e.active === void 0 ? void 0 : e.active,
      disabled: e.disabled,
      onClick: a[0] || (a[0] = (o) => n("click"))
    }, [
      S(d(O), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, fo));
  }
}), bo = ["aria-label"], yo = { class: "kx-drawer-h" }, ho = { class: "kx-drawer-title" }, ko = { class: "kx-drawer-b" }, $o = /* @__PURE__ */ Y({
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
    return W(() => n.open, (o) => {
      o ? window.addEventListener("keydown", a) : window.removeEventListener("keydown", a);
    }), Ue(() => window.removeEventListener("keydown", a)), (o, s) => (v(), U(Ne, { name: "kx-drawer" }, {
      default: se(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: s[1] || (s[1] = we((r) => l("close"), ["self"]))
        }, [
          u("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            u("div", yo, [
              u("span", ho, [
                S(d(O), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                j($(e.title), 1)
              ]),
              S(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: s[0] || (s[0] = (r) => l("close"))
              })
            ]),
            u("div", ko, [
              ee(o.$slots, "default")
            ])
          ], 8, bo)
        ])) : P("", !0)
      ]),
      _: 3
    }));
  }
}), _o = ["aria-label"], wo = { class: "kx-modal-h" }, So = { class: "kx-modal-h-ico" }, xo = { class: "kx-modal-h-text" }, To = { class: "kx-modal-h-title" }, Co = {
  key: 0,
  class: "kx-modal-h-sub"
}, Po = { class: "kx-modal-body" }, Ao = { class: "kx-modal-foot" }, Oo = ["disabled"], Lo = ["disabled"], Io = /* @__PURE__ */ Y({
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
    return W(() => a.open, async (s) => {
      s ? (window.addEventListener("keydown", l), await tt(), o.value?.focus()) : window.removeEventListener("keydown", l);
    }, { immediate: !0 }), Ue(() => window.removeEventListener("keydown", l)), (s, r) => (v(), U(Ne, { name: "kx-modal" }, {
      default: se(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: r[3] || (r[3] = we((i) => !e.busy && n("cancel"), ["self"]))
        }, [
          u("div", {
            class: N(["kx-modal", { danger: e.danger }]),
            role: "alertdialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            u("div", wo, [
              u("span", So, [
                S(d(O), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", xo, [
                u("span", To, $(e.title), 1),
                e.subtitle ? (v(), g("span", Co, $(e.subtitle), 1)) : P("", !0)
              ]),
              S(ve, {
                icon: "tabler:x",
                label: "Close",
                disabled: e.busy,
                onClick: r[0] || (r[0] = (i) => n("cancel"))
              }, null, 8, ["disabled"])
            ]),
            u("div", Po, [
              ee(s.$slots, "default")
            ]),
            u("div", Ao, [
              u("button", {
                ref_key: "cancelButton",
                ref: o,
                type: "button",
                class: "kx-btn kx-btn-ghost",
                disabled: e.busy,
                onClick: r[1] || (r[1] = (i) => n("cancel"))
              }, "Cancel", 8, Oo),
              u("button", {
                type: "button",
                class: N(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
                disabled: e.busy,
                onClick: r[2] || (r[2] = (i) => n("confirm"))
              }, [
                e.busy ? (v(), U(d(O), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : P("", !0),
                j($(e.confirmLabel), 1)
              ], 10, Lo)
            ])
          ], 10, _o)
        ])) : P("", !0)
      ]),
      _: 3
    }));
  }
}), Vo = {
  key: 0,
  class: "kx-notice error"
}, Eo = {
  key: 1,
  class: "mm-skel-reader"
}, Bo = {
  key: 2,
  class: "mm-reader"
}, jo = { class: "mm-head" }, Do = { class: "mm-head-body" }, Ro = { class: "mm-head-top" }, Mo = { class: "kx-chip" }, Uo = { class: "mm-topic" }, No = { class: "mm-head-acts" }, zo = ["disabled"], Ko = ["disabled"], Wo = ["disabled"], Fo = {
  key: 0,
  class: "mm-edit"
}, Ho = { class: "mm-edit-acts" }, qo = ["disabled"], Yo = {
  key: 1,
  class: "mm-title"
}, Go = { class: "mm-facts" }, Jo = {
  key: 0,
  class: "mm-fact"
}, Qo = ["title"], Xo = ["title"], Zo = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, ea = { class: "mm-timeline" }, ta = { class: "mm-tl-body" }, na = { class: "mm-tl-t" }, oa = { class: "mm-tl-s" }, aa = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, la = {
  key: 0,
  class: "mm-muted"
}, ra = {
  key: 1,
  class: "mm-sources"
}, ia = { class: "mm-source-body" }, sa = { class: "mm-source-head" }, ua = ["title"], da = {
  key: 0,
  class: "mm-quote"
}, ca = ["onClick"], ma = { class: "mm-source-topic" }, va = ["onClick"], pa = /* @__PURE__ */ Y({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = E(null), o = E([]), s = E(null), r = E([]), i = E(""), m = E(null), b = E(!1), p = R(() => a.value ? X[a.value.kind] : null), k = R(() => a.value ? X[a.value.kind].icon : "tabler:brain"), _ = R(() => a.value?.status === "current" || a.value?.status === "conflict");
    let y = 0;
    async function C(V = 0, w) {
      const h = ++y;
      try {
        const M = await q(n.memory.memoryId.value).item(n.itemId, V, w);
        if (h !== y) return;
        if (!V) {
          const te = M.item;
          if (te.status === "forgotten") {
            l("gone");
            return;
          }
          a.value = te, r.value = M.provenance;
        }
        const G = M.versions;
        o.value = V ? [...o.value, ...G.rows] : G.rows, s.value = G.next, i.value = "";
      } catch (M) {
        if (h !== y) return;
        Ve(M) === 404 ? l("gone") : i.value = oe(M);
      }
    }
    W(() => n.itemId, () => {
      a.value = null, o.value = [], m.value = null, b.value = !1, C();
    }, { immediate: !0 });
    async function I() {
      const V = ++y, w = o.value.length;
      try {
        let h = 0, M = null;
        const G = [];
        let te = !0;
        do {
          const Ge = Math.min(100, Math.max(1, w - G.length)), ne = await q(n.memory.memoryId.value).item(n.itemId, h, Ge);
          if (V !== y) return;
          if (te) {
            if (ne.item.status === "forgotten") {
              l("gone");
              return;
            }
            a.value = ne.item, r.value = ne.provenance, te = !1;
          }
          G.push(...ne.versions.rows), M = ne.versions.next, h = M ?? 0;
        } while (G.length < w && M !== null);
        o.value = G, s.value = M, i.value = "";
      } catch (h) {
        V === y && (Ve(h) === 404 ? l("gone") : i.value = oe(h));
      }
    }
    W(n.memory.revision, () => {
      I();
    });
    function B(V) {
      return n.memory.act(() => q(n.memory.memoryId.value).act(n.itemId, V));
    }
    async function L() {
      const V = (m.value || "").trim();
      if (!V || !a.value) return;
      await n.memory.act(async () => {
        const h = await q(n.memory.memoryId.value).edit(n.itemId, V);
        h && h !== n.itemId && l("replaced", h);
      }) && (m.value = null);
    }
    async function f() {
      await B("forget") && (b.value = !1, l("gone"));
    }
    const c = { user: "They said", assistant: "The agent said", tool: "Tool result" };
    function x(V) {
      return V.host_kind === "item" ? "tabler:brain" : V.host_kind === "content" ? "tabler:file-text" : V.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function z(V) {
      return V.line ? c[V.line.role] || "Message" : V.host_kind === "item" ? V.memory ? "From the memory" : "From a memory that is no longer kept" : V.host_kind === "content" ? "A document" : V.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (V, w) => (v(), g(D, null, [
      i.value ? (v(), g("div", Vo, [
        S(d(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(i.value), 1)
      ])) : a.value ? (v(), g("article", Bo, [
        u("header", jo, [
          u("span", {
            class: N(["mm-head-ic", p.value?.tone])
          }, [
            S(d(O), {
              icon: k.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          u("div", Do, [
            u("div", Ro, [
              u("span", Mo, $(p.value?.label), 1),
              u("span", Uo, $(d(J)(a.value.key)), 1),
              a.value.status !== "current" ? (v(), U(d(Te), {
                key: 0,
                class: "kx-tag-sm",
                severity: d(Fe)(a.value.status),
                value: d($e)[a.value.status]
              }, null, 8, ["severity", "value"])) : P("", !0),
              u("span", No, [
                _.value && m.value === null ? (v(), g("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: w[0] || (w[0] = (h) => m.value = a.value.content)
                }, [
                  S(d(O), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  w[8] || (w[8] = j("Edit ", -1))
                ])) : P("", !0),
                _.value ? (v(), g("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: w[1] || (w[1] = (h) => B("archive"))
                }, [
                  S(d(O), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  w[9] || (w[9] = j("Archive ", -1))
                ], 8, zo)) : P("", !0),
                a.value.status === "archived" ? (v(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: w[2] || (w[2] = (h) => B("restore"))
                }, [
                  S(d(O), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  w[10] || (w[10] = j("Restore ", -1))
                ], 8, Ko)) : P("", !0),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: w[3] || (w[3] = (h) => b.value = !0)
                }, [
                  S(d(O), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  w[11] || (w[11] = j("Forget ", -1))
                ], 8, Wo)
              ])
            ]),
            m.value !== null ? (v(), g("div", Fo, [
              S(d(Ke), {
                modelValue: m.value,
                "onUpdate:modelValue": w[4] || (w[4] = (h) => m.value = h),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              u("div", Ho, [
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !m.value.trim(),
                  onClick: L
                }, [
                  S(d(O), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  w[12] || (w[12] = j("Save text ", -1))
                ], 8, qo),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: w[5] || (w[5] = (h) => m.value = null)
                }, "Cancel")
              ])
            ])) : (v(), g("h2", Yo, $(a.value.content), 1)),
            u("div", Go, [
              a.value.scope_family === "agent" ? (v(), g("span", Jo, [
                S(d(O), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                w[13] || (w[13] = j("About the agent itself", -1))
              ])) : P("", !0),
              u("span", {
                class: "mm-fact",
                title: d(me)(a.value.valid_at)
              }, [
                S(d(O), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                j("True since " + $(d(Q)(a.value.valid_at)), 1)
              ], 8, Qo),
              a.value.invalid_at ? (v(), g("span", {
                key: 1,
                class: "mm-fact",
                title: d(me)(a.value.invalid_at)
              }, [
                S(d(O), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                j("Until " + $(d(Q)(a.value.invalid_at)), 1)
              ], 8, Xo)) : P("", !0)
            ])
          ])
        ]),
        o.value.length > 1 || s.value !== null ? (v(), g("section", Zo, [
          w[15] || (w[15] = u("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          u("ol", ea, [
            (v(!0), g(D, null, F(o.value, (h) => (v(), g("li", {
              key: h.id,
              class: N({ now: h.id === a.value.id, past: h.status !== "current" })
            }, [
              w[14] || (w[14] = u("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              u("span", ta, [
                u("span", na, $(h.content), 1),
                u("span", oa, [
                  j("v" + $(h.version) + " · " + $(d(Q)(h.valid_at)), 1),
                  h.status !== "current" ? (v(), g(D, { key: 0 }, [
                    j(" · " + $(d($e)[h.status]), 1)
                  ], 64)) : P("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (v(), g("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: w[6] || (w[6] = (h) => C(s.value))
          }, "Show older versions")) : P("", !0)
        ])) : P("", !0),
        u("section", aa, [
          w[17] || (w[17] = u("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          r.value.length ? (v(), g("ul", ra, [
            (v(!0), g(D, null, F(r.value, (h) => (v(), g("li", {
              key: h.host_kind + h.host_id + h.event_id,
              class: "mm-source"
            }, [
              S(d(O), {
                class: "mm-source-ic",
                icon: x(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              u("div", ia, [
                u("div", sa, [
                  u("span", null, $(z(h)), 1),
                  h.line?.created_at || h.recorded_at ? (v(), g("span", {
                    key: 0,
                    class: "mm-muted",
                    title: d(me)(h.line?.created_at || h.recorded_at || "")
                  }, $(d(Q)(h.line?.created_at || h.recorded_at || "")), 9, ua)) : P("", !0)
                ]),
                h.line ? (v(), g("blockquote", da, $(h.line.text), 1)) : P("", !0),
                h.memory ? (v(), g("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (M) => l("open", h.memory.id)
                }, [
                  u("span", ma, $(d(J)(h.memory.key)), 1),
                  u("span", null, $(h.memory.content), 1)
                ], 8, ca)) : P("", !0),
                h.host_kind === "session" ? (v(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (M) => l("conversation", h.host_id)
                }, [
                  S(d(O), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  w[16] || (w[16] = j("Open conversation ", -1))
                ], 8, va)) : P("", !0)
              ])
            ]))), 128))
          ])) : (v(), g("p", la, $(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (v(), g("div", Eo, [
        (v(), g(D, null, F(4, (h) => u("div", {
          key: h,
          class: "mm-skel-line"
        })), 64))
      ])),
      S(Io, {
        open: b.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? d(J)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: w[7] || (w[7] = (h) => b.value = !1),
        onConfirm: f
      }, {
        default: se(() => [...w[18] || (w[18] = [
          j(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), ga = { class: "mm-rail-tools" }, fa = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, ba = {
  key: 0,
  class: "mm-skel"
}, ya = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, ha = {
  key: 2,
  class: "mm-rail-empty"
}, ka = ["aria-expanded", "onClick"], $a = { class: "kx-railsec-t" }, _a = { class: "kx-railsec-b" }, wa = ["aria-current", "onClick"], Sa = { class: "mm-row-main" }, xa = { class: "mm-row-t" }, Ta = { class: "mm-row-s" }, Ca = ["disabled"], Pa = /* @__PURE__ */ Y({
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
    ], o = E("current"), s = E(""), r = Tt(s, 250, (k) => k.trim()), i = xe(() => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value, r.value] : null, (k) => q(n.memory.memoryId.value).items({ status: o.value, query: r.value, offset: k }), n.memory.revision);
    W([o, r], () => {
      l("filtered"), l("status-change", o.value);
    });
    const m = E({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), b = R(() => tn.map((k) => ({ ...k, items: i.rows.value.filter((_) => X[_.kind].group === k.id) })).filter((k) => k.items.length)), p = R(() => r.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (k, _) => (v(), g(D, null, [
      u("div", ga, [
        S(Ct, {
          modelValue: s.value,
          "onUpdate:modelValue": _[0] || (_[0] = (y) => s.value = y),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        S(d(Ce), {
          modelValue: o.value,
          "onUpdate:modelValue": _[1] || (_[1] = (y) => o.value = y),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      u("nav", fa, [
        d(i).loading.value && !d(i).rows.value.length ? (v(), g("div", ba, [
          (v(), g(D, null, F(6, (y) => u("div", {
            key: y,
            class: "mm-skel-row"
          })), 64))
        ])) : d(i).error.value ? (v(), g("div", ya, [
          S(d(O), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          u("span", null, $(d(i).error.value), 1)
        ])) : d(i).rows.value.length ? P("", !0) : (v(), g("div", ha, $(p.value), 1)),
        (v(!0), g(D, null, F(b.value, (y) => (v(), g("div", {
          key: y.id,
          class: N(["kx-railsec", { closed: m.value[y.id] }])
        }, [
          u("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !m.value[y.id],
            onClick: (C) => m.value[y.id] = !m.value[y.id]
          }, [
            S(d(O), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            S(d(O), {
              class: "kx-railsec-ic",
              icon: y.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            u("span", $a, $(y.title), 1)
          ], 8, ka),
          Me(u("div", _a, [
            (v(!0), g(D, null, F(y.items, (C) => (v(), g("button", {
              key: C.id,
              type: "button",
              class: N(["mm-row", { on: e.selectedId === C.id }]),
              "aria-current": e.selectedId === C.id ? "true" : void 0,
              onClick: (I) => l("select", C)
            }, [
              u("span", {
                class: N(["mm-row-ic", d(X)[C.kind].tone])
              }, [
                S(d(O), {
                  icon: d(X)[C.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              u("span", Sa, [
                u("span", xa, $(C.content), 1),
                u("span", Ta, $(d(J)(C.key)) + " · " + $(d(Q)(C.valid_at)), 1)
              ])
            ], 10, wa))), 128))
          ], 512), [
            [nt, !m.value[y.id]]
          ])
        ], 2))), 128)),
        d(i).next.value !== null ? (v(), g("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: d(i).loading.value,
          onClick: _[2] || (_[2] = //@ts-ignore
          (...y) => d(i).more && d(i).more(...y))
        }, [
          d(i).loading.value ? (v(), U(d(O), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : P("", !0),
          _[3] || (_[3] = j("Show more ", -1))
        ], 8, Ca)) : P("", !0)
      ])
    ], 64));
  }
}), Aa = {
  key: 0,
  class: "kx-notice error"
}, Oa = {
  key: 1,
  class: "mm-page"
}, La = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Ia = { class: "kx-shell" }, Va = { class: "kx-rail" }, Ea = { class: "kx-railhead" }, Ba = { class: "kx-railhead-title" }, ja = { key: 0 }, Da = { class: "kx-railhead-acts" }, Ra = { class: "kx-main" }, Ma = { class: "kx-main-scroll mm-main" }, Ua = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, Na = { class: "kx-empty-ico" }, za = /* @__PURE__ */ Y({
  __name: "MemoryManage",
  setup(e) {
    const t = ht(), n = kt(), l = E(""), a = E({});
    W(() => t.value.config, (f) => {
      try {
        a.value = $t(f), l.value = "";
      } catch (c) {
        l.value = oe(c);
      }
    }, { immediate: !0 });
    const o = Mn(R(() => String(a.value.kb_id || ""))), s = E("item"), r = E(String(a.value.route || "")), i = E(!1), m = E("current"), b = R(() => o.status.value?.counts[m.value]), p = R(() => o.status.value?.counts.conflict_groups || 0), k = R(() => (o.status.value?.runs || []).filter((f) => f.status === "failed").length);
    W(() => a.value.route, (f) => {
      const c = typeof f == "string" ? f : "";
      c !== r.value && (_ = !0, r.value = c, c && (s.value = "item"));
    }), W(o.memoryId, () => {
      r.value = "", s.value = "item";
    });
    let _ = !1;
    W(r, (f) => {
      if (_) {
        _ = !1;
        return;
      }
      n("navigate", f || "");
    });
    function y(f) {
      n("navigate", `/sessions/${encodeURIComponent(f)}`);
    }
    function C(f) {
      s.value = "item", f !== r.value && (r.value = f);
    }
    function I(f) {
      C(f.id);
    }
    function B(f) {
      s.value = s.value === f ? "item" : f;
    }
    function L(f) {
      i.value = !1, f && C(f);
    }
    return (f, c) => l.value ? (v(), g("div", Aa, $(l.value), 1)) : (v(), g("div", Oa, [
      d(o).error.value ? (v(), g("div", La, [
        S(d(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, $(d(o).error.value), 1)
      ])) : P("", !0),
      u("div", Ia, [
        u("aside", Va, [
          u("div", Ea, [
            u("span", Ba, [
              c[7] || (c[7] = j("Memories", -1)),
              b.value !== void 0 ? (v(), g("b", ja, $(b.value), 1)) : P("", !0)
            ]),
            u("div", Da, [
              S(ve, {
                icon: "tabler:activity",
                label: k.value ? `Activity, ${k.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: c[0] || (c[0] = (x) => B("activity"))
              }, null, 8, ["label", "active"]),
              S(ve, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: c[1] || (c[1] = (x) => i.value = !0)
              })
            ])
          ]),
          p.value ? (v(), g("button", {
            key: 0,
            type: "button",
            class: N(["mm-conflict-bar", { on: s.value === "conflicts" }]),
            onClick: c[2] || (c[2] = (x) => B("conflicts"))
          }, [
            S(d(O), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            u("span", null, $(p.value === 1 ? "1 conflict to resolve" : `${p.value} conflicts to resolve`), 1),
            S(d(O), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : P("", !0),
          S(Pa, {
            memory: d(o),
            "selected-id": s.value === "item" ? r.value : "",
            onSelect: I,
            onFiltered: c[3] || (c[3] = (x) => r.value = ""),
            onStatusChange: c[4] || (c[4] = (x) => m.value = x)
          }, null, 8, ["memory", "selected-id"])
        ]),
        u("main", Ra, [
          u("div", Ma, [
            s.value === "conflicts" ? (v(), U(go, {
              key: 0,
              memory: d(o)
            }, null, 8, ["memory"])) : s.value === "activity" ? (v(), U(fn, {
              key: 1,
              memory: d(o)
            }, null, 8, ["memory"])) : r.value ? (v(), U(pa, {
              key: r.value,
              memory: d(o),
              "item-id": r.value,
              onReplaced: C,
              onOpen: C,
              onConversation: y,
              onGone: c[5] || (c[5] = (x) => r.value = "")
            }, null, 8, ["memory", "item-id"])) : (v(), g("div", Ua, [
              u("span", Na, [
                S(d(O), {
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
      S($o, {
        open: i.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: c[6] || (c[6] = (x) => i.value = !1)
      }, {
        default: se(() => [
          i.value ? (v(), U(eo, {
            key: 0,
            memory: d(o),
            onAdded: L
          }, null, 8, ["memory"])) : P("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), Ka = _t(za, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
at(import.meta.url, Ka);
//# sourceMappingURL=index.js.map
