import { mergeProps as z, openBlock as v, createElementBlock as g, createBlock as U, resolveDynamicComponent as Ge, createCommentVNode as P, renderSlot as Z, createElementVNode as u, toDisplayString as _, defineComponent as q, computed as M, Fragment as D, createVNode as S, unref as d, createTextVNode as j, renderList as W, normalizeClass as N, resolveDirective as Je, withDirectives as Me, resolveComponent as Qe, createSlots as Xe, withCtx as ie, ref as E, watch as K, onUnmounted as Ze, withModifiers as _e, onBeforeUnmount as Re, Transition as Ue, nextTick as et, vShow as tt } from "vue";
import { Icon as L } from "@iconify/vue";
import { on as nt, define as ot } from "@wippy-fe/proxy";
import { F as at, d as lt, n as rt, N as Ce, S as X, B as F, f as ve, g as pe, i as Pe, h as it, l as st, P as se, C as ut, Q as dt, j as ge, T as Ae, R as Oe, v as ct, k as mt, K as vt, W as pt, U as gt, s as Le, o as fe, q as ue, r as ft, e as ne, t as bt, u as yt, a as ht, b as kt, m as $t } from "./types-D3kJ2ulw.js";
import { B as be, s as _t, f as we, c as Ne, u as wt, a as St, d as ze } from "./useWidget-wVsuCND0.js";
import { m as H, a as Se, h as Ie, u as xt, _ as Tt } from "./usePaged-Co1PX6mr.js";
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
function Ve(e, t) {
  return Lt(e) || Ot(e, t) || At(e, t) || Pt();
}
function Pt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function At(e, t) {
  if (e) {
    if (typeof e == "string") return Ee(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ee(e, t) : void 0;
  }
}
function Ee(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function Ot(e, t) {
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
function Lt(e) {
  if (Array.isArray(e)) return e;
}
function Be(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    t && (l = l.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, l);
  }
  return n;
}
function O(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Be(Object(n), !0).forEach(function(l) {
      ye(e, l, n[l]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Be(Object(n)).forEach(function(l) {
      Object.defineProperty(e, l, Object.getOwnPropertyDescriptor(n, l));
    });
  }
  return e;
}
function ye(e, t, n) {
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
var T = {
  _getMeta: function() {
    return [Pe(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], it(Pe(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var l, a, o;
    return (l = (t == null || (a = t.instance) === null || a === void 0 ? void 0 : a.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || l === void 0 ? void 0 : l.config;
  },
  _getOptionValue: at,
  _getPTValue: function() {
    var t, n, l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, r = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var I = T._getOptionValue.apply(T, arguments);
      return ve(I) || ut(I) ? {
        class: I
      } : I;
    }, m = ((t = l.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = l.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, b = m.mergeSections, p = b === void 0 ? !0 : b, $ = m.mergeProps, w = $ === void 0 ? !1 : $, y = r ? T._useDefaultPT(l, l.defaultPT(), i, o, s) : void 0, C = T._usePT(l, T._getPT(a, l.$name), i, o, O(O({}, s), {}, {
      global: y || {}
    })), V = T._getPTDatasets(l, o);
    return p || !p && C ? w ? T._mergeProps(l, w, y, C, V) : O(O(O({}, y), C), V) : O(O({}, C), V);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = "data-pc-";
    return O(O({}, n === "root" && ye({}, "".concat(l, "name"), pe(t.$name))), {}, ye({}, "".concat(l, "section"), pe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", l = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
      var r, i = l ? l(s) : s, m = pe(n);
      return (r = i?.[m]) !== null && r !== void 0 ? r : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: a(t.originalValue),
      value: a(t.value)
    } : a(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(V) {
      return l(V, a, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var r, i = n._usept || ((r = t.$primevueConfig) === null || r === void 0 ? void 0 : r.ptOptions) || {}, m = i.mergeSections, b = m === void 0 ? !0 : m, p = i.mergeProps, $ = p === void 0 ? !1 : p, w = s(n.originalValue), y = s(n.value);
      return w === void 0 && y === void 0 ? void 0 : ve(y) ? y : ve(w) ? w : b || !b && y ? $ ? T._mergeProps(t, $, w, y) : O(O({}, w), y) : y;
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
    if (!be.isStyleNameLoaded((t = l.$style) === null || t === void 0 ? void 0 : t.name) && (n = l.$style) !== null && n !== void 0 && n.name) {
      var o;
      F.loadCSS(a), (o = l.$style) === null || o === void 0 || o.loadCSS(a), be.setLoadedStyleName(l.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, l, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(a != null && a.isUnstyled() || (a == null || (t = a.theme) === null || t === void 0 ? void 0 : t.call(a)) === "none")) {
      if (!X.isStyleNameLoaded("common")) {
        var s, r, i = ((s = a.$style) === null || s === void 0 || (r = s.getCommonTheme) === null || r === void 0 ? void 0 : r.call(s)) || {}, m = i.primitive, b = i.semantic, p = i.global, $ = i.style;
        F.load(m?.css, O({
          name: "primitive-variables"
        }, o)), F.load(b?.css, O({
          name: "semantic-variables"
        }, o)), F.load(p?.css, O({
          name: "global-variables"
        }, o)), F.loadStyle(O({
          name: "global-style"
        }, o), $), X.setLoadedStyleName("common");
      }
      if (!X.isStyleNameLoaded((n = a.$style) === null || n === void 0 ? void 0 : n.name) && (l = a.$style) !== null && l !== void 0 && l.name) {
        var w, y, C, V, B = ((w = a.$style) === null || w === void 0 || (y = w.getDirectiveTheme) === null || y === void 0 ? void 0 : y.call(w)) || {}, I = B.css, f = B.style;
        (C = a.$style) === null || C === void 0 || C.load(I, O({
          name: "".concat(a.$style.name, "-variables")
        }, o)), (V = a.$style) === null || V === void 0 || V.loadStyle(O({
          name: "".concat(a.$style.name, "-style")
        }, o), f), X.setLoadedStyleName(a.$style.name);
      }
      if (!X.isStyleNameLoaded("layer-order")) {
        var c, x, A = (c = a.$style) === null || c === void 0 || (x = c.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(c);
        F.load(A, O({
          name: "layer-order",
          first: !0
        }, o)), X.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, l = t.preset();
    if (l && t.$attrSelector) {
      var a, o, s, r = ((a = t.$style) === null || a === void 0 || (o = a.getPresetTheme) === null || o === void 0 ? void 0 : o.call(a, l, "[".concat(t.$attrSelector, "]"))) || {}, i = r.css, m = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, O({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = m.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    be.clearLoadedStyleNames(), Ce.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Ce.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, l, a, o, s) {
    var r, i, m = "on".concat(rt(n)), b = T._getConfig(a, o), p = l?.$instance, $ = T._usePT(p, T._getPT(a == null || (r = a.value) === null || r === void 0 ? void 0 : r.pt, t), T._getOptionValue, "hooks.".concat(m)), w = T._useDefaultPT(p, b == null || (i = b.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], T._getOptionValue, "hooks.".concat(m)), y = {
      el: l,
      binding: a,
      vnode: o,
      prevVnode: s
    };
    $?.(p, y), w?.(p, y);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, l = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      l[a - 2] = arguments[a];
    return lt(t) ? t.apply(void 0, l) : z.apply(void 0, l);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = function(r, i, m, b, p) {
      var $, w, y, C;
      i._$instances = i._$instances || {};
      var V = T._getConfig(m, b), B = i._$instances[t] || {}, I = st(B) ? O(O({}, n), n?.methods) : {};
      i._$instances[t] = O(O({}, B), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: m,
        $modifiers: m?.modifiers,
        $value: m?.value,
        $el: B.$el || i || void 0,
        $style: O({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: V,
        $attrSelector: ($ = i.$pd) === null || $ === void 0 || ($ = $[t]) === null || $ === void 0 ? void 0 : $.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return T._getPT(V?.pt, void 0, function(c) {
            var x;
            return c == null || (x = c.directives) === null || x === void 0 ? void 0 : x[t];
          });
        },
        isUnstyled: function() {
          var c, x;
          return ((c = i._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.unstyled) !== void 0 ? (x = i._$instances[t]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.unstyled : V?.unstyled;
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
          var c, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return T._getPTValue(i._$instances[t], (c = i._$instances[t]) === null || c === void 0 || (c = c.$binding) === null || c === void 0 || (c = c.value) === null || c === void 0 ? void 0 : c.pt, x, O({}, A));
        },
        ptmo: function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", A = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T._getPTValue(i._$instances[t], c, x, A, !1);
        },
        cx: function() {
          var c, x, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", h = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (c = i._$instances[t]) !== null && c !== void 0 && c.isUnstyled() ? void 0 : T._getOptionValue((x = i._$instances[t]) === null || x === void 0 || (x = x.$style) === null || x === void 0 ? void 0 : x.classes, A, O({}, h));
        },
        sx: function() {
          var c, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return A ? T._getOptionValue((c = i._$instances[t]) === null || c === void 0 || (c = c.$style) === null || c === void 0 ? void 0 : c.inlineStyles, x, O({}, h)) : void 0;
        }
      }, I), i.$instance = i._$instances[t], (w = (y = i.$instance)[r]) === null || w === void 0 || w.call(y, i, m, b, p), i["$".concat(t)] = i.$instance, T._hook(t, r, i, m, b, p), i.$pd || (i.$pd = {}), i.$pd[t] = O(O({}, (C = i.$pd) === null || C === void 0 ? void 0 : C[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, a = function(r) {
      var i, m, b, p = r._$instances[t], $ = p?.watch, w = function(V) {
        var B, I = V.newValue, f = V.oldValue;
        return $ == null || (B = $.config) === null || B === void 0 ? void 0 : B.call(p, I, f);
      }, y = function(V) {
        var B, I = V.newValue, f = V.oldValue;
        return $ == null || (B = $["config.ripple"]) === null || B === void 0 ? void 0 : B.call(p, I, f);
      };
      p.$watchersCallback = {
        config: w,
        "config.ripple": y
      }, $ == null || (i = $.config) === null || i === void 0 || i.call(p, p?.$primevueConfig), se.on("config:change", w), $ == null || (m = $["config.ripple"]) === null || m === void 0 || m.call(p, p == null || (b = p.$primevueConfig) === null || b === void 0 ? void 0 : b.ripple), se.on("config:ripple:change", y);
    }, o = function(r) {
      var i = r._$instances[t].$watchersCallback;
      i && (se.off("config:change", i.config), se.off("config:ripple:change", i["config.ripple"]), r._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(r, i, m, b) {
        r.$pd || (r.$pd = {}), r.$pd[t] = {
          name: t,
          attrSelector: Ct("pd")
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
    var t = T._getMeta.apply(T, arguments), n = Ve(t, 2), l = n[0], a = n[1];
    return O({
      extend: function() {
        var s = T._getMeta.apply(T, arguments), r = Ve(s, 2), i = r[0], m = r[1];
        return T.extend(i, O(O(O({}, a), a?.methods), m));
      }
    }, T._extend(l, a));
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
}, jt = F.extend({
  name: "ripple-directive",
  style: Et,
  classes: Bt
}), Dt = T.extend({
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
    if (typeof e == "string") return he(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? he(e, t) : void 0;
  }
}
function Nt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zt(e) {
  if (Array.isArray(e)) return he(e);
}
function he(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
function je(e, t, n) {
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
var Ke = Dt.extend("ripple", {
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
      n || (n = gt("span", je(je({
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
        if (!this.isUnstyled() && ge(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"), !Ae(a) && !Oe(a)) {
          var o = Math.max(ct(l), mt(l));
          a.style.height = o + "px", a.style.width = o + "px";
        }
        var s = vt(l), r = t.pageX - s.left + document.body.scrollTop - Oe(a) / 2, i = t.pageY - s.top + document.body.scrollLeft - Ae(a) / 2;
        a.style.top = i + "px", a.style.left = r + "px", !this.isUnstyled() && pt(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          a && (!n.isUnstyled() && ge(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ge(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
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
}, qt = F.extend({
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
var xe = {
  name: "Tag",
  extends: Yt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return we(Gt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Xt = ["data-p"];
function Zt(e, t, n, l, a, o) {
  return v(), g("span", z({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), U(Ge(e.$slots.icon), z({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), g("span", z({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : P("", !0), e.value != null || e.$slots.default ? Z(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", z({
      class: e.cx("label")
    }, e.ptm("label")), _(e.value), 17)];
  }) : P("", !0)], 16, Xt);
}
xe.render = Zt;
const Q = {
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
function G(e) {
  const t = e.replace(/[_\-.]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : e;
}
const tn = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function nn(e) {
  return tn[e];
}
const ke = {
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
function ce(e) {
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
function J(e, t = Date.now()) {
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
}, gn = /* @__PURE__ */ q({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = M(() => t.memory.status.value?.runs || []);
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
      u("header", ln, [
        u("h2", rn, [
          S(d(L), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          s[0] || (s[0] = j("Activity", -1))
        ]),
        s[1] || (s[1] = u("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      n.value.length ? (v(), g("ol", dn, [
        (v(!0), g(D, null, W(n.value, (r) => (v(), g("li", {
          key: r.id,
          class: N(["mm-run", r.status])
        }, [
          u("div", cn, [
            u("span", mn, _(l(r)), 1),
            u("span", {
              class: "mm-muted",
              title: d(ce)(r.finished_at || r.started_at || r.created_at)
            }, [
              j(_(d(J)(r.finished_at || r.started_at || r.created_at)), 1),
              a(r) ? (v(), g(D, { key: 0 }, [
                j(" · " + _(a(r)), 1)
              ], 64)) : P("", !0)
            ], 8, vn),
            r.last_error ? (v(), g("span", pn, _(r.last_error), 1)) : P("", !0)
          ]),
          r.status !== "succeeded" ? (v(), U(d(xe), {
            key: 0,
            class: "kx-tag-sm",
            severity: d(We)(r.status),
            value: d(ke)[r.status]
          }, null, 8, ["severity", "value"])) : P("", !0)
        ], 2))), 128))
      ])) : (v(), g("div", sn, [
        u("span", un, [
          S(d(L), {
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
}, yn = F.extend({
  name: "togglebutton",
  style: fn,
  classes: bn
}), hn = {
  name: "BaseToggleButton",
  extends: Ne,
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
function re(e) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, re(e);
}
function kn(e, t, n) {
  return (t = $n(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $n(e) {
  var t = _n(e, "string");
  return re(t) == "symbol" ? t : t + "";
}
function _n(e, t) {
  if (re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var l = n.call(e, t);
    if (re(l) != "object") return l;
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
      return Le(this.onLabel) && Le(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return we(kn({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: Ke
  }
}, wn = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Sn = ["data-p"];
function xn(e, t, n, l, a, o) {
  var s = Je("ripple");
  return Me((v(), g("button", z({
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
  }), [u("span", z({
    class: e.cx("content")
  }, o.getPTOptions("content"), {
    "data-p": o.dataP
  }), [Z(e.$slots, "default", {}, function() {
    return [Z(e.$slots, "icon", {
      value: e.d_value,
      class: N(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (v(), g("span", z({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, o.getPTOptions("icon")), null, 16)) : P("", !0)];
    }), u("span", z({
      class: e.cx("label")
    }, o.getPTOptions("label")), _(o.label), 17)];
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
}, Pn = F.extend({
  name: "selectbutton",
  style: Tn,
  classes: Cn
}), An = {
  name: "BaseSelectButton",
  extends: Ne,
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
function On(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = qe(e)) || t) {
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
function Ln(e) {
  return En(e) || Vn(e) || qe(e) || In();
}
function In() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qe(e, t) {
  if (e) {
    if (typeof e == "string") return $e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $e(e, t) : void 0;
  }
}
function Vn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function En(e) {
  if (Array.isArray(e)) return $e(e);
}
function $e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, l = Array(t); n < t; n++) l[n] = e[n];
  return l;
}
var Te = {
  name: "SelectButton",
  extends: An,
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
        var o = this.isSelected(n), s = this.getOptionValue(n), r;
        if (this.multiple)
          if (o) {
            if (r = this.d_value.filter(function(i) {
              return !fe(i, s, a.equalityKey);
            }), !this.allowEmpty && r.length === 0) return;
          } else
            r = this.d_value ? [].concat(Ln(this.d_value), [s]) : [s];
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
          var a = On(this.d_value), o;
          try {
            for (a.s(); !(o = a.n()).done; ) {
              var s = o.value;
              if (fe(s, l, this.equalityKey)) {
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
        n = fe(this.d_value, l, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return we({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: Ke
  },
  components: {
    ToggleButton: He
  }
}, Bn = ["aria-labelledby", "data-p"];
function jn(e, t, n, l, a, o) {
  var s = Qe("ToggleButton");
  return v(), g("div", z({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [(v(!0), g(D, null, W(e.options, function(r, i) {
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
    }, Xe({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: ie(function() {
        return [Z(e.$slots, "option", {
          option: r,
          index: i
        }, function() {
          return [u("span", z({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), _(o.getOptionLabel(r)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Bn);
}
Te.render = jn;
function Dn(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function De(e) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(e);
}
function Mn(e) {
  const t = M(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), n = E(null), l = E(""), a = E(!1), o = E(0);
  let s = 0;
  async function r() {
    const b = ++s;
    if (!e.value) return !1;
    try {
      const p = await H(e.value).status();
      return b !== s ? !1 : (n.value = p, l.value = "", o.value++, !0);
    } catch (p) {
      return b === s && (l.value = ne(p)), !1;
    }
  }
  async function i(b) {
    a.value = !0, l.value = "";
    try {
      return await b(), await r();
    } catch (p) {
      return l.value = ne(p), !1;
    } finally {
      a.value = !1;
    }
  }
  let m = null;
  return K(e, (b) => {
    if (m && m(), m = null, s++, n.value = null, l.value = "", !b) return;
    const p = nt(`component.${b}`, () => {
      r();
    });
    m = typeof p == "function" ? p : null, r();
  }, { immediate: !0 }), Ze(() => {
    m && m();
  }), ft(async () => {
    await r();
  }), { memoryId: e, base: t, status: n, error: l, busy: a, revision: o, act: i };
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
}, Gn = ["onClick"], Jn = { class: "mm-field" }, Qn = { class: "mm-form-foot" }, Xn = ["disabled"], Zn = /* @__PURE__ */ q({
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
    ], o = E("rule"), s = E(""), r = E(""), i = E(""), m = wt("wc-agent-picker"), b = M(() => a.find((I) => I.value === o.value)?.hint || ""), p = M(() => Dn(r.value)), $ = M(() => r.value && !De(p.value) ? "Use a short topic of letters, digits and spaces." : ""), w = M(() => !!s.value && De(p.value) && !!i.value.trim()), y = Se(
      () => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value] : null,
      (I) => H(n.memory.memoryId.value).topics({ kind: o.value, offset: I }),
      n.memory.revision
    ), C = M(() => y.rows.value.map((I) => I.key).filter((I) => I !== p.value).slice(0, 8));
    K(o, () => {
      r.value = "";
    });
    function V(I) {
      const f = bt(I).selected;
      s.value = String((Array.isArray(f) ? f : [])[0] || "");
    }
    async function B() {
      if (!w.value) return;
      let I = null;
      await n.memory.act(async () => {
        I = await H(n.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: s.value,
          key: p.value,
          value: i.value.trim(),
          content: i.value.trim()
        });
      }) && I !== null && l("added", I);
    }
    return (I, f) => (v(), g("form", {
      class: "mm-form",
      onSubmit: _e(B, ["prevent"])
    }, [
      u("div", Rn, [
        f[3] || (f[3] = u("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        S(d(Te), {
          modelValue: o.value,
          "onUpdate:modelValue": f[0] || (f[0] = (c) => o.value = c),
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        u("span", Un, [
          S(d(L), {
            icon: d(Q)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          j(_(b.value), 1)
        ])
      ]),
      u("div", Nn, [
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
          onChange: V
        }, null, 40, zn)) : d(m).failed.value ? (v(), g("div", Kn, "The agent picker could not load: " + _(d(m).failed.value), 1)) : P("", !0)
      ]),
      u("div", Wn, [
        f[5] || (f[5] = u("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        S(d(St), {
          id: "add_topic",
          modelValue: r.value,
          "onUpdate:modelValue": f[1] || (f[1] = (c) => r.value = c),
          placeholder: "e.g. response style",
          invalid: !!$.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        $.value ? (v(), g("span", Fn, _($.value), 1)) : (v(), g("span", Hn, "What this is about, not what it says. A topic that already exists gets a new version.")),
        d(y).error.value ? (v(), g("div", qn, _(d(y).error.value), 1)) : P("", !0),
        C.value.length ? (v(), g("div", Yn, [
          (v(!0), g(D, null, W(C.value, (c) => (v(), g("button", {
            key: c,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (x) => r.value = d(G)(c)
          }, _(d(G)(c)), 9, Gn))), 128))
        ])) : P("", !0)
      ]),
      u("div", Jn, [
        f[6] || (f[6] = u("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        S(d(ze), {
          id: "add_text",
          modelValue: i.value,
          "onUpdate:modelValue": f[2] || (f[2] = (c) => i.value = c),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      u("div", Qn, [
        u("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: e.memory.busy.value || !w.value
        }, [
          S(d(L), {
            icon: e.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: N({ spin: e.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          f[7] || (f[7] = j("Add to memory ", -1))
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
}, ao = { class: "kx-empty-ico" }, lo = ["aria-label"], ro = { class: "mm-card-h" }, io = { class: "kx-chip" }, so = { class: "mm-option-main" }, uo = { class: "mm-option-t" }, co = { class: "mm-muted" }, mo = ["disabled", "onClick"], vo = ["disabled"], po = /* @__PURE__ */ q({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(e) {
    const t = e, n = Se(() => t.memory.memoryId.value || null, (a) => H(t.memory.memoryId.value).conflicts(a), t.memory.revision);
    function l(a, o) {
      t.memory.act(() => H(t.memory.memoryId.value).resolve(a.group_id, o.id));
    }
    return (a, o) => (v(), g(D, null, [
      u("header", eo, [
        u("h2", to, [
          S(d(L), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = j("Conflicts", -1))
        ]),
        o[2] || (o[2] = u("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      d(n).error.value ? (v(), g("div", no, [
        S(d(L), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, _(d(n).error.value), 1)
      ])) : !d(n).loading.value && !d(n).rows.value.length ? (v(), g("div", oo, [
        u("span", ao, [
          S(d(L), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = u("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = u("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : P("", !0),
      (v(!0), g(D, null, W(d(n).rows.value, (s) => (v(), g("section", {
        key: s.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${d(G)(s.items[0].key)}`
      }, [
        u("div", ro, [
          u("span", io, _(d(Q)[s.items[0].kind].label), 1),
          j(_(d(G)(s.items[0].key)), 1)
        ]),
        (v(!0), g(D, null, W(s.items, (r) => (v(), g("div", {
          key: r.id,
          class: "mm-option"
        }, [
          u("div", so, [
            u("span", uo, _(r.content), 1),
            u("span", co, _(d(J)(r.valid_at)) + " · " + _(d(nn)(r.source)), 1)
          ]),
          u("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: e.memory.busy.value,
            onClick: (i) => l(s, r)
          }, [
            S(d(L), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = j("Keep this ", -1))
          ], 8, mo)
        ]))), 128))
      ], 8, lo))), 128)),
      d(n).next.value !== null ? (v(), g("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: d(n).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...s) => d(n).more && d(n).more(...s))
      }, "Show more conflicts", 8, vo)) : P("", !0)
    ], 64));
  }
}), go = ["aria-label", "title", "aria-pressed", "disabled"], me = /* @__PURE__ */ q({
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
      S(d(L), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, go));
  }
}), fo = ["aria-label"], bo = { class: "kx-drawer-h" }, yo = { class: "kx-drawer-title" }, ho = { class: "kx-drawer-b" }, ko = /* @__PURE__ */ q({
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
    return K(() => n.open, (o) => {
      o ? window.addEventListener("keydown", a) : window.removeEventListener("keydown", a);
    }), Re(() => window.removeEventListener("keydown", a)), (o, s) => (v(), U(Ue, { name: "kx-drawer" }, {
      default: ie(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: s[1] || (s[1] = _e((r) => l("close"), ["self"]))
        }, [
          u("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            u("div", bo, [
              u("span", yo, [
                S(d(L), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                j(_(e.title), 1)
              ]),
              S(me, {
                icon: "tabler:x",
                label: "Close",
                onClick: s[0] || (s[0] = (r) => l("close"))
              })
            ]),
            u("div", ho, [
              Z(o.$slots, "default")
            ])
          ], 8, fo)
        ])) : P("", !0)
      ]),
      _: 3
    }));
  }
}), $o = ["aria-label"], _o = { class: "kx-modal-h" }, wo = { class: "kx-modal-h-ico" }, So = { class: "kx-modal-h-text" }, xo = { class: "kx-modal-h-title" }, To = {
  key: 0,
  class: "kx-modal-h-sub"
}, Co = { class: "kx-modal-body" }, Po = { class: "kx-modal-foot" }, Ao = ["disabled"], Oo = ["disabled"], Lo = /* @__PURE__ */ q({
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
    return K(() => a.open, async (s) => {
      s ? (window.addEventListener("keydown", l), await et(), o.value?.focus()) : window.removeEventListener("keydown", l);
    }, { immediate: !0 }), Re(() => window.removeEventListener("keydown", l)), (s, r) => (v(), U(Ue, { name: "kx-modal" }, {
      default: ie(() => [
        e.open ? (v(), g("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: r[3] || (r[3] = _e((i) => !e.busy && n("cancel"), ["self"]))
        }, [
          u("div", {
            class: N(["kx-modal", { danger: e.danger }]),
            role: "alertdialog",
            "aria-modal": "true",
            "aria-label": e.title
          }, [
            u("div", _o, [
              u("span", wo, [
                S(d(L), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", So, [
                u("span", xo, _(e.title), 1),
                e.subtitle ? (v(), g("span", To, _(e.subtitle), 1)) : P("", !0)
              ]),
              S(me, {
                icon: "tabler:x",
                label: "Close",
                disabled: e.busy,
                onClick: r[0] || (r[0] = (i) => n("cancel"))
              }, null, 8, ["disabled"])
            ]),
            u("div", Co, [
              Z(s.$slots, "default")
            ]),
            u("div", Po, [
              u("button", {
                ref_key: "cancelButton",
                ref: o,
                type: "button",
                class: "kx-btn kx-btn-ghost",
                disabled: e.busy,
                onClick: r[1] || (r[1] = (i) => n("cancel"))
              }, "Cancel", 8, Ao),
              u("button", {
                type: "button",
                class: N(["kx-btn", e.danger ? "kx-btn-danger" : "kx-btn-primary"]),
                disabled: e.busy,
                onClick: r[2] || (r[2] = (i) => n("confirm"))
              }, [
                e.busy ? (v(), U(d(L), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : P("", !0),
                j(_(e.confirmLabel), 1)
              ], 10, Oo)
            ])
          ], 10, $o)
        ])) : P("", !0)
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
}, Yo = { class: "mm-facts" }, Go = {
  key: 0,
  class: "mm-fact"
}, Jo = ["title"], Qo = ["title"], Xo = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, Zo = { class: "mm-timeline" }, ea = { class: "mm-tl-body" }, ta = { class: "mm-tl-t" }, na = { class: "mm-tl-s" }, oa = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, aa = {
  key: 0,
  class: "mm-muted"
}, la = {
  key: 1,
  class: "mm-sources"
}, ra = { class: "mm-source-body" }, ia = { class: "mm-source-head" }, sa = ["title"], ua = {
  key: 0,
  class: "mm-quote"
}, da = ["onClick"], ca = { class: "mm-source-topic" }, ma = ["onClick"], va = /* @__PURE__ */ q({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = E(null), o = E([]), s = E(null), r = E([]), i = E(""), m = E(null), b = E(!1), p = M(() => a.value ? Q[a.value.kind] : null), $ = M(() => a.value ? Q[a.value.kind].icon : "tabler:brain"), w = M(() => a.value?.status === "current" || a.value?.status === "conflict");
    let y = 0;
    async function C(A = 0, h) {
      const k = ++y;
      try {
        const R = await H(n.memory.memoryId.value).item(n.itemId, A, h);
        if (k !== y) return;
        if (!A) {
          const ee = R.item;
          if (ee.status === "forgotten") {
            l("gone");
            return;
          }
          a.value = ee, r.value = R.provenance;
        }
        const Y = R.versions;
        o.value = A ? [...o.value, ...Y.rows] : Y.rows, s.value = Y.next, i.value = "";
      } catch (R) {
        if (k !== y) return;
        Ie(R) === 404 ? l("gone") : i.value = ne(R);
      }
    }
    K(() => n.itemId, () => {
      a.value = null, o.value = [], m.value = null, b.value = !1, C();
    }, { immediate: !0 });
    async function V() {
      const A = ++y, h = o.value.length;
      try {
        let k = 0, R = null;
        const Y = [];
        let ee = !0;
        do {
          const Ye = Math.min(100, Math.max(1, h - Y.length)), te = await H(n.memory.memoryId.value).item(n.itemId, k, Ye);
          if (A !== y) return;
          if (ee) {
            if (te.item.status === "forgotten") {
              l("gone");
              return;
            }
            a.value = te.item, r.value = te.provenance, ee = !1;
          }
          Y.push(...te.versions.rows), R = te.versions.next, k = R ?? 0;
        } while (Y.length < h && R !== null);
        o.value = Y, s.value = R, i.value = "";
      } catch (k) {
        A === y && (Ie(k) === 404 ? l("gone") : i.value = ne(k));
      }
    }
    K(n.memory.revision, () => {
      V();
    });
    function B(A) {
      return n.memory.act(() => H(n.memory.memoryId.value).act(n.itemId, A));
    }
    async function I() {
      const A = (m.value || "").trim();
      if (!A || !a.value) return;
      await n.memory.act(async () => {
        const k = await H(n.memory.memoryId.value).edit(n.itemId, A);
        k && k !== n.itemId && l("replaced", k);
      }) && (m.value = null);
    }
    async function f() {
      await B("forget") && (b.value = !1, l("gone"));
    }
    function c(A) {
      return A.host_kind === "item" ? "tabler:brain" : A.host_kind === "content" ? "tabler:file-text" : A.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function x(A) {
      if (A.line) {
        const h = A.line.author;
        return h?.kind === "user" ? "They said" : h?.kind === "system" ? "Workflow input" : h?.kind === "agent" ? a.value?.scope_family === "agent" && a.value.scope_id === h.id ? "The agent said" : `Task from ${h.id || "an agent"}` : "Message";
      }
      return A.host_kind === "item" ? A.memory ? "From the memory" : "From a memory that is no longer kept" : A.host_kind === "content" ? "A document" : A.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (A, h) => (v(), g(D, null, [
      i.value ? (v(), g("div", Io, [
        S(d(L), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, _(i.value), 1)
      ])) : a.value ? (v(), g("article", Eo, [
        u("header", Bo, [
          u("span", {
            class: N(["mm-head-ic", p.value?.tone])
          }, [
            S(d(L), {
              icon: $.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          u("div", jo, [
            u("div", Do, [
              u("span", Mo, _(p.value?.label), 1),
              u("span", Ro, _(d(G)(a.value.key)), 1),
              a.value.status !== "current" ? (v(), U(d(xe), {
                key: 0,
                class: "kx-tag-sm",
                severity: d(We)(a.value.status),
                value: d(ke)[a.value.status]
              }, null, 8, ["severity", "value"])) : P("", !0),
              u("span", Uo, [
                w.value && m.value === null ? (v(), g("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: h[0] || (h[0] = (k) => m.value = a.value.content)
                }, [
                  S(d(L), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  h[8] || (h[8] = j("Edit ", -1))
                ])) : P("", !0),
                w.value ? (v(), g("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: h[1] || (h[1] = (k) => B("archive"))
                }, [
                  S(d(L), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  h[9] || (h[9] = j("Archive ", -1))
                ], 8, No)) : P("", !0),
                a.value.status === "archived" ? (v(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: e.memory.busy.value,
                  onClick: h[2] || (h[2] = (k) => B("restore"))
                }, [
                  S(d(L), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  h[10] || (h[10] = j("Restore ", -1))
                ], 8, zo)) : P("", !0),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: e.memory.busy.value,
                  onClick: h[3] || (h[3] = (k) => b.value = !0)
                }, [
                  S(d(L), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  h[11] || (h[11] = j("Forget ", -1))
                ], 8, Ko)
              ])
            ]),
            m.value !== null ? (v(), g("div", Wo, [
              S(d(ze), {
                modelValue: m.value,
                "onUpdate:modelValue": h[4] || (h[4] = (k) => m.value = k),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              u("div", Fo, [
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: e.memory.busy.value || !m.value.trim(),
                  onClick: I
                }, [
                  S(d(L), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  h[12] || (h[12] = j("Save text ", -1))
                ], 8, Ho),
                u("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: h[5] || (h[5] = (k) => m.value = null)
                }, "Cancel")
              ])
            ])) : (v(), g("h2", qo, _(a.value.content), 1)),
            u("div", Yo, [
              a.value.scope_family === "agent" ? (v(), g("span", Go, [
                S(d(L), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                h[13] || (h[13] = j("About the agent itself", -1))
              ])) : P("", !0),
              u("span", {
                class: "mm-fact",
                title: d(ce)(a.value.valid_at)
              }, [
                S(d(L), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                j("True since " + _(d(J)(a.value.valid_at)), 1)
              ], 8, Jo),
              a.value.invalid_at ? (v(), g("span", {
                key: 1,
                class: "mm-fact",
                title: d(ce)(a.value.invalid_at)
              }, [
                S(d(L), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                j("Until " + _(d(J)(a.value.invalid_at)), 1)
              ], 8, Qo)) : P("", !0)
            ])
          ])
        ]),
        o.value.length > 1 || s.value !== null ? (v(), g("section", Xo, [
          h[15] || (h[15] = u("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          u("ol", Zo, [
            (v(!0), g(D, null, W(o.value, (k) => (v(), g("li", {
              key: k.id,
              class: N({ now: k.id === a.value.id, past: k.status !== "current" })
            }, [
              h[14] || (h[14] = u("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              u("span", ea, [
                u("span", ta, _(k.content), 1),
                u("span", na, [
                  j("v" + _(k.version) + " · " + _(d(J)(k.valid_at)), 1),
                  k.status !== "current" ? (v(), g(D, { key: 0 }, [
                    j(" · " + _(d(ke)[k.status]), 1)
                  ], 64)) : P("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          s.value !== null ? (v(), g("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: h[6] || (h[6] = (k) => C(s.value))
          }, "Show older versions")) : P("", !0)
        ])) : P("", !0),
        u("section", oa, [
          h[17] || (h[17] = u("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          r.value.length ? (v(), g("ul", la, [
            (v(!0), g(D, null, W(r.value, (k) => (v(), g("li", {
              key: k.host_kind + k.host_id + k.event_id,
              class: "mm-source"
            }, [
              S(d(L), {
                class: "mm-source-ic",
                icon: c(k),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              u("div", ra, [
                u("div", ia, [
                  u("span", null, _(x(k)), 1),
                  k.line?.created_at || k.recorded_at ? (v(), g("span", {
                    key: 0,
                    class: "mm-muted",
                    title: d(ce)(k.line?.created_at || k.recorded_at || "")
                  }, _(d(J)(k.line?.created_at || k.recorded_at || "")), 9, sa)) : P("", !0)
                ]),
                k.line ? (v(), g("blockquote", ua, _(k.line.text), 1)) : P("", !0),
                k.memory ? (v(), g("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (R) => l("open", k.memory.id)
                }, [
                  u("span", ca, _(d(G)(k.memory.key)), 1),
                  u("span", null, _(k.memory.content), 1)
                ], 8, da)) : P("", !0),
                k.host_kind === "session" ? (v(), g("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (R) => l("conversation", k.host_id)
                }, [
                  S(d(L), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  h[16] || (h[16] = j("Open conversation ", -1))
                ], 8, ma)) : P("", !0)
              ])
            ]))), 128))
          ])) : (v(), g("p", aa, _(a.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (v(), g("div", Vo, [
        (v(), g(D, null, W(4, (k) => u("div", {
          key: k,
          class: "mm-skel-line"
        })), 64))
      ])),
      S(Lo, {
        open: b.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: a.value ? d(G)(a.value.key) : "",
        "confirm-label": "Forget for good",
        busy: e.memory.busy.value,
        onCancel: h[7] || (h[7] = (k) => b.value = !1),
        onConfirm: f
      }, {
        default: ie(() => [...h[18] || (h[18] = [
          j(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), pa = { class: "mm-rail-tools" }, ga = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, fa = {
  key: 0,
  class: "mm-skel"
}, ba = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, ya = {
  key: 2,
  class: "mm-rail-empty"
}, ha = ["aria-expanded", "onClick"], ka = { class: "kx-railsec-t" }, $a = { class: "kx-railsec-b" }, _a = ["aria-current", "onClick"], wa = { class: "mm-row-main" }, Sa = { class: "mm-row-t" }, xa = { class: "mm-row-s" }, Ta = ["disabled"], Ca = /* @__PURE__ */ q({
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
    ], o = E("current"), s = E(""), r = xt(s, 250, ($) => $.trim()), i = Se(() => n.memory.memoryId.value ? [n.memory.memoryId.value, o.value, r.value] : null, ($) => H(n.memory.memoryId.value).items({ status: o.value, query: r.value, offset: $ }), n.memory.revision);
    K([o, r], () => {
      l("filtered"), l("status-change", o.value);
    });
    const m = E({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), b = M(() => en.map(($) => ({ ...$, items: i.rows.value.filter((w) => Q[w.kind].group === $.id) })).filter(($) => $.items.length)), p = M(() => r.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return ($, w) => (v(), g(D, null, [
      u("div", pa, [
        S(Tt, {
          modelValue: s.value,
          "onUpdate:modelValue": w[0] || (w[0] = (y) => s.value = y),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        S(d(Te), {
          modelValue: o.value,
          "onUpdate:modelValue": w[1] || (w[1] = (y) => o.value = y),
          class: "mm-views",
          options: a,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      u("nav", ga, [
        d(i).loading.value && !d(i).rows.value.length ? (v(), g("div", fa, [
          (v(), g(D, null, W(6, (y) => u("div", {
            key: y,
            class: "mm-skel-row"
          })), 64))
        ])) : d(i).error.value ? (v(), g("div", ba, [
          S(d(L), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          u("span", null, _(d(i).error.value), 1)
        ])) : d(i).rows.value.length ? P("", !0) : (v(), g("div", ya, _(p.value), 1)),
        (v(!0), g(D, null, W(b.value, (y) => (v(), g("div", {
          key: y.id,
          class: N(["kx-railsec", { closed: m.value[y.id] }])
        }, [
          u("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !m.value[y.id],
            onClick: (C) => m.value[y.id] = !m.value[y.id]
          }, [
            S(d(L), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            S(d(L), {
              class: "kx-railsec-ic",
              icon: y.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            u("span", ka, _(y.title), 1)
          ], 8, ha),
          Me(u("div", $a, [
            (v(!0), g(D, null, W(y.items, (C) => (v(), g("button", {
              key: C.id,
              type: "button",
              class: N(["mm-row", { on: e.selectedId === C.id }]),
              "aria-current": e.selectedId === C.id ? "true" : void 0,
              onClick: (V) => l("select", C)
            }, [
              u("span", {
                class: N(["mm-row-ic", d(Q)[C.kind].tone])
              }, [
                S(d(L), {
                  icon: d(Q)[C.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              u("span", wa, [
                u("span", Sa, _(C.content), 1),
                u("span", xa, _(d(G)(C.key)) + " · " + _(d(J)(C.valid_at)), 1)
              ])
            ], 10, _a))), 128))
          ], 512), [
            [tt, !m.value[y.id]]
          ])
        ], 2))), 128)),
        d(i).next.value !== null ? (v(), g("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: d(i).loading.value,
          onClick: w[2] || (w[2] = //@ts-ignore
          (...y) => d(i).more && d(i).more(...y))
        }, [
          d(i).loading.value ? (v(), U(d(L), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : P("", !0),
          w[3] || (w[3] = j("Show more ", -1))
        ], 8, Ta)) : P("", !0)
      ])
    ], 64));
  }
}), Pa = {
  key: 0,
  class: "kx-notice error"
}, Aa = {
  key: 1,
  class: "mm-page"
}, Oa = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, La = { class: "kx-shell" }, Ia = { class: "kx-rail" }, Va = { class: "kx-railhead" }, Ea = { class: "kx-railhead-title" }, Ba = { key: 0 }, ja = { class: "kx-railhead-acts" }, Da = { class: "kx-main" }, Ma = { class: "kx-main-scroll mm-main" }, Ra = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, Ua = { class: "kx-empty-ico" }, Na = /* @__PURE__ */ q({
  __name: "MemoryManage",
  setup(e) {
    const t = yt(), n = ht(), l = E(""), a = E({});
    K(() => t.value.config, (f) => {
      try {
        a.value = kt(f), l.value = "";
      } catch (c) {
        l.value = ne(c);
      }
    }, { immediate: !0 });
    const o = Mn(M(() => String(a.value.kb_id || ""))), s = E("item"), r = E(String(a.value.route || "")), i = E(!1), m = E("current"), b = M(() => o.status.value?.counts[m.value]), p = M(() => o.status.value?.counts.conflict_groups || 0), $ = M(() => (o.status.value?.runs || []).filter((f) => f.status === "failed").length);
    K(() => a.value.route, (f) => {
      const c = typeof f == "string" ? f : "";
      c !== r.value && (w = !0, r.value = c, c && (s.value = "item"));
    }), K(o.memoryId, () => {
      r.value = "", s.value = "item";
    });
    let w = !1;
    K(r, (f) => {
      if (w) {
        w = !1;
        return;
      }
      n("navigate", f || "");
    });
    function y(f) {
      n("kickside-chat-open", { kind: "session", sessionId: f });
    }
    function C(f) {
      s.value = "item", f !== r.value && (r.value = f);
    }
    function V(f) {
      C(f.id);
    }
    function B(f) {
      s.value = s.value === f ? "item" : f;
    }
    function I(f) {
      i.value = !1, f && C(f);
    }
    return (f, c) => l.value ? (v(), g("div", Pa, _(l.value), 1)) : (v(), g("div", Aa, [
      d(o).error.value ? (v(), g("div", Oa, [
        S(d(L), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, _(d(o).error.value), 1)
      ])) : P("", !0),
      u("div", La, [
        u("aside", Ia, [
          u("div", Va, [
            u("span", Ea, [
              c[7] || (c[7] = j("Memories", -1)),
              b.value !== void 0 ? (v(), g("b", Ba, _(b.value), 1)) : P("", !0)
            ]),
            u("div", ja, [
              S(me, {
                icon: "tabler:activity",
                label: $.value ? `Activity, ${$.value} failed` : "Activity",
                active: s.value === "activity",
                onClick: c[0] || (c[0] = (x) => B("activity"))
              }, null, 8, ["label", "active"]),
              S(me, {
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
            S(d(L), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            u("span", null, _(p.value === 1 ? "1 conflict to resolve" : `${p.value} conflicts to resolve`), 1),
            S(d(L), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : P("", !0),
          S(Ca, {
            memory: d(o),
            "selected-id": s.value === "item" ? r.value : "",
            onSelect: V,
            onFiltered: c[3] || (c[3] = (x) => r.value = ""),
            onStatusChange: c[4] || (c[4] = (x) => m.value = x)
          }, null, 8, ["memory", "selected-id"])
        ]),
        u("main", Da, [
          u("div", Ma, [
            s.value === "conflicts" ? (v(), U(po, {
              key: 0,
              memory: d(o)
            }, null, 8, ["memory"])) : s.value === "activity" ? (v(), U(gn, {
              key: 1,
              memory: d(o)
            }, null, 8, ["memory"])) : r.value ? (v(), U(va, {
              key: r.value,
              memory: d(o),
              "item-id": r.value,
              onReplaced: C,
              onOpen: C,
              onConversation: y,
              onGone: c[5] || (c[5] = (x) => r.value = "")
            }, null, 8, ["memory", "item-id"])) : (v(), g("div", Ra, [
              u("span", Ua, [
                S(d(L), {
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
      S(ko, {
        open: i.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: c[6] || (c[6] = (x) => i.value = !1)
      }, {
        default: ie(() => [
          i.value ? (v(), U(Zn, {
            key: 0,
            memory: d(o),
            onAdded: I
          }, null, 8, ["memory"])) : P("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), za = $t(Na, {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
});
ot(import.meta.url, za);
//# sourceMappingURL=index.js.map
