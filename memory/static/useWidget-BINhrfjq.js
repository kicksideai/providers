import { mergeProps as S, openBlock as k, createElementBlock as O, createElementVNode as ce, resolveComponent as ve, resolveDirective as be, createBlock as R, Transition as he, withCtx as ye, renderSlot as V, normalizeClass as $e, resolveDynamicComponent as xe, createCommentVNode as N, withDirectives as we, ref as Z, onMounted as Se } from "vue";
import { B as P, d as pe, l as me, F as _e, j as ke, n as Pe, N as G, o as W, S as j, q as H, r as K, t as J, v as Te, P as B, C as Oe, Q as je, w as F, T as ee, R as ne, x as ze, y as Ce, K as Ie, W as Ae, U as Ee, c as Le, f as Y, e as De } from "./types-BgQdoNlH.js";
import { loadByTagName as Ve } from "@wippy-fe/proxy";
var M = {};
function Be(n = "pui_id_") {
  return Object.hasOwn(M, n) || (M[n] = 0), M[n]++, `${n}${M[n]}`;
}
var Me = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, Ue = P.extend({
  name: "baseicon",
  css: Me
});
function z(n) {
  "@babel/helpers - typeof";
  return z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, z(n);
}
function te(n, e) {
  var t = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function oe(n) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2 ? te(Object(t), !0).forEach(function(o) {
      Re(n, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(t)) : te(Object(t)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return n;
}
function Re(n, e, t) {
  return (e = Ne(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function Ne(n) {
  var e = We(n, "string");
  return z(e) == "symbol" ? e : e + "";
}
function We(n, e) {
  if (z(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var He = {
  name: "BaseIcon",
  extends: pe,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: Ue,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = me(this.label);
      return oe(oe({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function C(n) {
  "@babel/helpers - typeof";
  return C = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, C(n);
}
function re(n, e) {
  return Qe(n) || qe(n, e) || Fe(n, e) || Ke();
}
function Ke() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fe(n, e) {
  if (n) {
    if (typeof n == "string") return ae(n, e);
    var t = {}.toString.call(n).slice(8, -1);
    return t === "Object" && n.constructor && (t = n.constructor.name), t === "Map" || t === "Set" ? Array.from(n) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? ae(n, e) : void 0;
  }
}
function ae(n, e) {
  (e == null || e > n.length) && (e = n.length);
  for (var t = 0, o = Array(e); t < e; t++) o[t] = n[t];
  return o;
}
function qe(n, e) {
  var t = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
  if (t != null) {
    var o, r, i, c, s = [], a = !0, d = !1;
    try {
      if (i = (t = t.call(n)).next, e !== 0) for (; !(a = (o = i.call(t)).done) && (s.push(o.value), s.length !== e); a = !0) ;
    } catch (m) {
      d = !0, r = m;
    } finally {
      try {
        if (!a && t.return != null && (c = t.return(), Object(c) !== c)) return;
      } finally {
        if (d) throw r;
      }
    }
    return s;
  }
}
function Qe(n) {
  if (Array.isArray(n)) return n;
}
function ie(n, e) {
  var t = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function g(n) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ie(Object(t), !0).forEach(function(o) {
      q(n, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(t)) : ie(Object(t)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return n;
}
function q(n, e, t) {
  return (e = Xe(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function Xe(n) {
  var e = Ye(n, "string");
  return C(e) == "symbol" ? e : e + "";
}
function Ye(n, e) {
  if (C(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (C(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var p = {
  _getMeta: function() {
    return [J(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Te(J(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, t) {
    var o, r, i;
    return (o = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (t == null || (i = t.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: _e,
  _getPTValue: function() {
    var e, t, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var _ = p._getOptionValue.apply(p, arguments);
      return H(_) || Oe(_) ? {
        class: _
      } : _;
    }, d = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((t = o.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, m = d.mergeSections, l = m === void 0 ? !0 : m, f = d.mergeProps, b = f === void 0 ? !1 : f, h = s ? p._useDefaultPT(o, o.defaultPT(), a, i, c) : void 0, x = p._usePT(o, p._getPT(r, o.$name), a, i, g(g({}, c), {}, {
      global: h || {}
    })), y = p._getPTDatasets(o, i);
    return l || !l && x ? b ? p._mergeProps(o, b, h, x, y) : g(g(g({}, h), x), y) : g(g({}, x), y);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return g(g({}, t === "root" && q({}, "".concat(o, "name"), K(e.$name))), {}, q({}, "".concat(o, "section"), K(t)));
  },
  _getPT: function(e) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(c) {
      var s, a = o ? o(c) : c, d = K(t);
      return (s = a?.[d]) !== null && s !== void 0 ? s : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, c = function(y) {
      return o(y, r, i);
    };
    if (t && Object.hasOwn(t, "_usept")) {
      var s, a = t._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, d = a.mergeSections, m = d === void 0 ? !0 : d, l = a.mergeProps, f = l === void 0 ? !1 : l, b = c(t.originalValue), h = c(t.value);
      return b === void 0 && h === void 0 ? void 0 : H(h) ? h : H(b) ? b : m || !m && h ? f ? p._mergeProps(e, f, b, h) : g(g({}, b), h) : h;
    }
    return c(t);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return p._usePT(e, t, o, r, i);
  },
  _loadStyles: function() {
    var e, t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = p._getConfig(o, r), c = {
      nonce: i == null || (e = i.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    p._loadCoreStyles(t, c), p._loadThemeStyles(t, c), p._loadScopedThemeStyles(t, c), p._removeThemeListeners(t), t.$loadStyles = function() {
      return p._loadThemeStyles(t, c);
    }, p._themeChangeListener(t.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, t, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!W.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (t = o.$style) !== null && t !== void 0 && t.name) {
      var i;
      P.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), W.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, t, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!j.isStyleNameLoaded("common")) {
        var c, s, a = ((c = r.$style) === null || c === void 0 || (s = c.getCommonTheme) === null || s === void 0 ? void 0 : s.call(c)) || {}, d = a.primitive, m = a.semantic, l = a.global, f = a.style;
        P.load(d?.css, g({
          name: "primitive-variables"
        }, i)), P.load(m?.css, g({
          name: "semantic-variables"
        }, i)), P.load(l?.css, g({
          name: "global-variables"
        }, i)), P.loadStyle(g({
          name: "global-style"
        }, i), f), j.setLoadedStyleName("common");
      }
      if (!j.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var b, h, x, y, w = ((b = r.$style) === null || b === void 0 || (h = b.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(b)) || {}, _ = w.css, $ = w.style;
        (x = r.$style) === null || x === void 0 || x.load(_, g({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (y = r.$style) === null || y === void 0 || y.loadStyle(g({
          name: "".concat(r.$style.name, "-style")
        }, i), $), j.setLoadedStyleName(r.$style.name);
      }
      if (!j.isStyleNameLoaded("layer-order")) {
        var u, v, T = (u = r.$style) === null || u === void 0 || (v = u.getLayerOrderThemeCSS) === null || v === void 0 ? void 0 : v.call(u);
        P.load(T, g({
          name: "layer-order",
          first: !0
        }, i)), j.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var r, i, c, s = ((r = e.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(e.$attrSelector, "]"))) || {}, a = s.css, d = (c = e.$style) === null || c === void 0 ? void 0 : c.load(a, g({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, t));
      e.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    W.clearLoadedStyleNames(), G.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    G.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, t, o, r, i, c) {
    var s, a, d = "on".concat(Pe(t)), m = p._getConfig(r, i), l = o?.$instance, f = p._usePT(l, p._getPT(r == null || (s = r.value) === null || s === void 0 ? void 0 : s.pt, e), p._getOptionValue, "hooks.".concat(d)), b = p._useDefaultPT(l, m == null || (a = m.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], p._getOptionValue, "hooks.".concat(d)), h = {
      el: o,
      binding: r,
      vnode: i,
      prevVnode: c
    };
    f?.(l, h), b?.(l, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, t = arguments.length, o = new Array(t > 2 ? t - 2 : 0), r = 2; r < t; r++)
      o[r - 2] = arguments[r];
    return ke(e) ? e.apply(void 0, o) : S.apply(void 0, o);
  },
  _extend: function(e) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(s, a, d, m, l) {
      var f, b, h, x;
      a._$instances = a._$instances || {};
      var y = p._getConfig(d, m), w = a._$instances[e] || {}, _ = me(w) ? g(g({}, t), t?.methods) : {};
      a._$instances[e] = g(g({}, w), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: w.$el || a || void 0,
        $style: g({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, t?.style),
        $primevueConfig: y,
        $attrSelector: (f = a.$pd) === null || f === void 0 || (f = f[e]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return p._getPT(y?.pt, void 0, function(u) {
            var v;
            return u == null || (v = u.directives) === null || v === void 0 ? void 0 : v[e];
          });
        },
        isUnstyled: function() {
          var u, v;
          return ((u = a._$instances[e]) === null || u === void 0 || (u = u.$binding) === null || u === void 0 || (u = u.value) === null || u === void 0 ? void 0 : u.unstyled) !== void 0 ? (v = a._$instances[e]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.unstyled : y?.unstyled;
        },
        theme: function() {
          var u;
          return (u = a._$instances[e]) === null || u === void 0 || (u = u.$primevueConfig) === null || u === void 0 ? void 0 : u.theme;
        },
        preset: function() {
          var u;
          return (u = a._$instances[e]) === null || u === void 0 || (u = u.$binding) === null || u === void 0 || (u = u.value) === null || u === void 0 ? void 0 : u.dt;
        },
        /* instance's methods */
        ptm: function() {
          var u, v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return p._getPTValue(a._$instances[e], (u = a._$instances[e]) === null || u === void 0 || (u = u.$binding) === null || u === void 0 || (u = u.value) === null || u === void 0 ? void 0 : u.pt, v, g({}, T));
        },
        ptmo: function() {
          var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, v = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", T = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return p._getPTValue(a._$instances[e], u, v, T, !1);
        },
        cx: function() {
          var u, v, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", U = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (u = a._$instances[e]) !== null && u !== void 0 && u.isUnstyled() ? void 0 : p._getOptionValue((v = a._$instances[e]) === null || v === void 0 || (v = v.$style) === null || v === void 0 ? void 0 : v.classes, T, g({}, U));
        },
        sx: function() {
          var u, v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, U = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T ? p._getOptionValue((u = a._$instances[e]) === null || u === void 0 || (u = u.$style) === null || u === void 0 ? void 0 : u.inlineStyles, v, g({}, U)) : void 0;
        }
      }, _), a.$instance = a._$instances[e], (b = (h = a.$instance)[s]) === null || b === void 0 || b.call(h, a, d, m, l), a["$".concat(e)] = a.$instance, p._hook(e, s, a, d, m, l), a.$pd || (a.$pd = {}), a.$pd[e] = g(g({}, (x = a.$pd) === null || x === void 0 ? void 0 : x[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, r = function(s) {
      var a, d, m, l = s._$instances[e], f = l?.watch, b = function(y) {
        var w, _ = y.newValue, $ = y.oldValue;
        return f == null || (w = f.config) === null || w === void 0 ? void 0 : w.call(l, _, $);
      }, h = function(y) {
        var w, _ = y.newValue, $ = y.oldValue;
        return f == null || (w = f["config.ripple"]) === null || w === void 0 ? void 0 : w.call(l, _, $);
      };
      l.$watchersCallback = {
        config: b,
        "config.ripple": h
      }, f == null || (a = f.config) === null || a === void 0 || a.call(l, l?.$primevueConfig), B.on("config:change", b), f == null || (d = f["config.ripple"]) === null || d === void 0 || d.call(l, l == null || (m = l.$primevueConfig) === null || m === void 0 ? void 0 : m.ripple), B.on("config:ripple:change", h);
    }, i = function(s) {
      var a = s._$instances[e].$watchersCallback;
      a && (B.off("config:change", a.config), B.off("config:ripple:change", a["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, d, m) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: Be("pd")
        }, o("created", s, a, d, m);
      },
      beforeMount: function(s, a, d, m) {
        var l;
        p._loadStyles((l = s.$pd[e]) === null || l === void 0 ? void 0 : l.instance, a, d), o("beforeMount", s, a, d, m), r(s);
      },
      mounted: function(s, a, d, m) {
        var l;
        p._loadStyles((l = s.$pd[e]) === null || l === void 0 ? void 0 : l.instance, a, d), o("mounted", s, a, d, m);
      },
      beforeUpdate: function(s, a, d, m) {
        o("beforeUpdate", s, a, d, m);
      },
      updated: function(s, a, d, m) {
        var l;
        p._loadStyles((l = s.$pd[e]) === null || l === void 0 ? void 0 : l.instance, a, d), o("updated", s, a, d, m);
      },
      beforeUnmount: function(s, a, d, m) {
        var l;
        i(s), p._removeThemeListeners((l = s.$pd[e]) === null || l === void 0 ? void 0 : l.instance), o("beforeUnmount", s, a, d, m);
      },
      unmounted: function(s, a, d, m) {
        var l;
        (l = s.$pd[e]) === null || l === void 0 || (l = l.instance) === null || l === void 0 || (l = l.scopedStyleEl) === null || l === void 0 || (l = l.value) === null || l === void 0 || l.remove(), o("unmounted", s, a, d, m);
      }
    };
  },
  extend: function() {
    var e = p._getMeta.apply(p, arguments), t = re(e, 2), o = t[0], r = t[1];
    return g({
      extend: function() {
        var c = p._getMeta.apply(p, arguments), s = re(c, 2), a = s[0], d = s[1];
        return p.extend(a, g(g(g({}, r), r?.methods), d));
      }
    }, p._extend(o, r));
  }
}, Ze = `
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
`, Ge = {
  root: "p-ink"
}, Je = P.extend({
  name: "ripple-directive",
  style: Ze,
  classes: Ge
}), en = p.extend({
  style: Je
});
function I(n) {
  "@babel/helpers - typeof";
  return I = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, I(n);
}
function nn(n) {
  return an(n) || rn(n) || on(n) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function on(n, e) {
  if (n) {
    if (typeof n == "string") return Q(n, e);
    var t = {}.toString.call(n).slice(8, -1);
    return t === "Object" && n.constructor && (t = n.constructor.name), t === "Map" || t === "Set" ? Array.from(n) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Q(n, e) : void 0;
  }
}
function rn(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function an(n) {
  if (Array.isArray(n)) return Q(n);
}
function Q(n, e) {
  (e == null || e > n.length) && (e = n.length);
  for (var t = 0, o = Array(e); t < e; t++) o[t] = n[t];
  return o;
}
function se(n, e, t) {
  return (e = sn(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function sn(n) {
  var e = ln(n, "string");
  return I(e) == "symbol" ? e : e + "";
}
function ln(n, e) {
  if (I(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (I(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var un = en.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var t = this.getInk(e);
      t || (t = Ee("span", se(se({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(t), this.$el = t);
    },
    remove: function(e) {
      var t = this.getInk(e);
      t && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), t.removeEventListener("animationend", this.onAnimationEnd), t.remove());
    },
    onMouseDown: function(e) {
      var t = this, o = e.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && F(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !ee(r) && !ne(r)) {
          var i = Math.max(ze(o), Ce(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var c = Ie(o), s = e.pageX - c.left + document.body.scrollTop - ne(r) / 2, a = e.pageY - c.top + document.body.scrollLeft - ee(r) / 2;
        r.style.top = a + "px", r.style.left = s + "px", !this.isUnstyled() && Ae(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!t.isUnstyled() && F(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && F(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? nn(e.children).find(function(t) {
        return je(t, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), ge = {
  name: "TimesIcon",
  extends: He
};
function dn(n) {
  return gn(n) || mn(n) || pn(n) || cn();
}
function cn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pn(n, e) {
  if (n) {
    if (typeof n == "string") return X(n, e);
    var t = {}.toString.call(n).slice(8, -1);
    return t === "Object" && n.constructor && (t = n.constructor.name), t === "Map" || t === "Set" ? Array.from(n) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? X(n, e) : void 0;
  }
}
function mn(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function gn(n) {
  if (Array.isArray(n)) return X(n);
}
function X(n, e) {
  (e == null || e > n.length) && (e = n.length);
  for (var t = 0, o = Array(e); t < e; t++) o[t] = n[t];
  return o;
}
function fn(n, e, t, o, r, i) {
  return k(), O("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, n.pti()), dn(e[0] || (e[0] = [ce("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ge.render = fn;
var fe = {
  name: "BaseInput",
  extends: Le,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, vn = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, bn = {
  root: function(e) {
    var t = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": t.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": t.$invalid,
      "p-variant-filled": t.$variant === "filled",
      "p-inputtext-fluid": t.$fluid
    }];
  }
}, hn = P.extend({
  name: "inputtext",
  style: vn,
  classes: bn
}), yn = {
  name: "BaseInputText",
  extends: fe,
  style: hn,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function A(n) {
  "@babel/helpers - typeof";
  return A = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, A(n);
}
function $n(n, e, t) {
  return (e = xn(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function xn(n) {
  var e = wn(n, "string");
  return A(e) == "symbol" ? e : e + "";
}
function wn(n, e) {
  if (A(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (A(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var Sn = {
  name: "InputText",
  extends: yn,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return S(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Y($n({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, _n = ["value", "name", "disabled", "aria-invalid", "data-p"];
function kn(n, e, t, o, r, i) {
  return k(), O("input", S({
    type: "text",
    class: n.cx("root"),
    value: n.d_value,
    name: n.name,
    disabled: n.disabled,
    "aria-invalid": n.$invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, _n);
}
Sn.render = kn;
var Pn = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, Tn = {
  root: function(e) {
    var t = e.instance, o = e.props;
    return ["p-textarea p-component", {
      "p-filled": t.$filled,
      "p-textarea-resizable ": o.autoResize,
      "p-textarea-sm p-inputfield-sm": o.size === "small",
      "p-textarea-lg p-inputfield-lg": o.size === "large",
      "p-invalid": t.$invalid,
      "p-variant-filled": t.$variant === "filled",
      "p-textarea-fluid": t.$fluid
    }];
  }
}, On = P.extend({
  name: "textarea",
  style: Pn,
  classes: Tn
}), jn = {
  name: "BaseTextarea",
  extends: fe,
  props: {
    autoResize: Boolean
  },
  style: On,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function E(n) {
  "@babel/helpers - typeof";
  return E = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, E(n);
}
function zn(n, e, t) {
  return (e = Cn(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function Cn(n) {
  var e = In(n, "string");
  return E(e) == "symbol" ? e : e + "";
}
function In(n, e) {
  if (E(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (E(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var An = {
  name: "Textarea",
  extends: jn,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var e = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        e.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var e = this.$el.style.height, t = parseInt(e) || 0, o = this.$el.scrollHeight, r = !t || o > t, i = t && o < t;
        i ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : r && (this.$el.style.height = "".concat(o, "px"));
      }
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return S(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Y(zn({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, En = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Ln(n, e, t, o, r, i) {
  return k(), O("textarea", S({
    class: n.cx("root"),
    value: n.d_value,
    name: n.name,
    disabled: n.disabled,
    "aria-invalid": n.invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, En);
}
An.render = Ln;
var Dn = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, Vn = {
  root: function(e) {
    var t = e.props;
    return ["p-message p-component p-message-" + t.severity, {
      "p-message-outlined": t.variant === "outlined",
      "p-message-simple": t.variant === "simple",
      "p-message-sm": t.size === "small",
      "p-message-lg": t.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, Bn = P.extend({
  name: "message",
  style: Dn,
  classes: Vn
}), Mn = {
  name: "BaseMessage",
  extends: pe,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: Bn,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function L(n) {
  "@babel/helpers - typeof";
  return L = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, L(n);
}
function le(n, e, t) {
  return (e = Un(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function Un(n) {
  var e = Rn(n, "string");
  return L(e) == "symbol" ? e : e + "";
}
function Rn(n, e) {
  if (L(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (L(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var Nn = {
  name: "Message",
  extends: Mn,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var e = this;
    this.life && setTimeout(function() {
      e.visible = !1, e.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(e) {
      this.visible = !1, this.$emit("close", e);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return Y(le(le({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: un
  },
  components: {
    TimesIcon: ge
  }
};
function D(n) {
  "@babel/helpers - typeof";
  return D = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, D(n);
}
function ue(n, e) {
  var t = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function de(n) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ue(Object(t), !0).forEach(function(o) {
      Wn(n, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(t)) : ue(Object(t)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return n;
}
function Wn(n, e, t) {
  return (e = Hn(e)) in n ? Object.defineProperty(n, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = t, n;
}
function Hn(n) {
  var e = Kn(n, "string");
  return D(e) == "symbol" ? e : e + "";
}
function Kn(n, e) {
  if (D(n) != "object" || !n) return n;
  var t = n[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(n, e);
    if (D(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var Fn = ["data-p"], qn = ["data-p"], Qn = ["data-p"], Xn = ["aria-label", "data-p"], Yn = ["data-p"];
function Zn(n, e, t, o, r, i) {
  var c = ve("TimesIcon"), s = be("ripple");
  return k(), R(he, S({
    name: "p-message",
    appear: ""
  }, n.ptmi("transition")), {
    default: ye(function() {
      return [r.visible ? (k(), O("div", S({
        key: 0,
        class: n.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": i.dataP
      }, n.ptm("root")), [ce("div", S({
        class: n.cx("contentWrapper")
      }, n.ptm("contentWrapper")), [n.$slots.container ? V(n.$slots, "container", {
        key: 0,
        closeCallback: i.close
      }) : (k(), O("div", S({
        key: 1,
        class: n.cx("content"),
        "data-p": i.dataP
      }, n.ptm("content")), [V(n.$slots, "icon", {
        class: $e(n.cx("icon"))
      }, function() {
        return [(k(), R(xe(n.icon ? "span" : null), S({
          class: [n.cx("icon"), n.icon],
          "data-p": i.dataP
        }, n.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), n.$slots.default ? (k(), O("div", S({
        key: 0,
        class: n.cx("text"),
        "data-p": i.dataP
      }, n.ptm("text")), [V(n.$slots, "default")], 16, Qn)) : N("", !0), n.closable ? we((k(), O("button", S({
        key: 1,
        class: n.cx("closeButton"),
        "aria-label": i.closeAriaLabel,
        type: "button",
        onClick: e[0] || (e[0] = function(a) {
          return i.close(a);
        }),
        "data-p": i.dataP
      }, de(de({}, n.closeButtonProps), n.ptm("closeButton"))), [V(n.$slots, "closeicon", {}, function() {
        return [n.closeIcon ? (k(), O("i", S({
          key: 0,
          class: [n.cx("closeIcon"), n.closeIcon],
          "data-p": i.dataP
        }, n.ptm("closeIcon")), null, 16, Yn)) : (k(), R(c, S({
          key: 1,
          class: [n.cx("closeIcon"), n.closeIcon],
          "data-p": i.dataP
        }, n.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Xn)), [[s]]) : N("", !0)], 16, qn))], 16)], 16, Fn)) : N("", !0)];
    }),
    _: 3
  }, 16);
}
Nn.render = Zn;
function nt(n) {
  const e = Z(!!customElements.get(n)), t = Z("");
  return Se(async () => {
    if (!e.value)
      try {
        await Ve(n, { timeoutMs: 8e3 }), e.value = !0;
      } catch (o) {
        t.value = De(o);
      }
  }), { ready: e, failed: t };
}
export {
  un as R,
  ge as a,
  Sn as b,
  fe as c,
  Nn as d,
  An as e,
  He as s,
  nt as u
};
//# sourceMappingURL=useWidget-BINhrfjq.js.map
