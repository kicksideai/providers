import { useId as W, mergeProps as g, openBlock as A, createElementBlock as U, ref as z, onMounted as K } from "vue";
import { h as L, f as w, C as q, s as N, g as S, F as J, N as b, S as _, B as m, d as Q, z as X, x as Y, e as Z } from "./types-Dpmtmezp.js";
import { loadByTagName as ee } from "@wippy-fe/proxy";
function I(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let i = t[n];
      if (!i) continue;
      let r = typeof i;
      if (r === "string" || r === "number") e.push(i);
      else if (r === "object") {
        let a = Array.isArray(i) ? [I(...i)] : Object.entries(i).map(([u, s]) => s ? u : void 0);
        e = a.length ? e.concat(a.filter((u) => !!u)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
var x = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function te() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = W();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var E = m.extend({
  name: "common"
});
function O(t) {
  "@babel/helpers - typeof";
  return O = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, O(t);
}
function ne(t) {
  return G(t) || ie(t) || H(t) || D();
}
function ie(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function P(t, e) {
  return G(t) || re(t, e) || H(t, e) || D();
}
function D() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function H(t, e) {
  if (t) {
    if (typeof t == "string") return j(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? j(t, e) : void 0;
  }
}
function j(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function re(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, a, u, s = [], d = !0, f = !1;
    try {
      if (a = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        d = !1;
      } else for (; !(d = (i = a.call(n)).done) && (s.push(i.value), s.length !== e); d = !0) ;
    } catch (l) {
      f = !0, r = l;
    } finally {
      try {
        if (!d && n.return != null && (u = n.return(), Object(u) !== u)) return;
      } finally {
        if (f) throw r;
      }
    }
    return s;
  }
}
function G(t) {
  if (Array.isArray(t)) return t;
}
function B(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function o(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? B(Object(n), !0).forEach(function(i) {
      T(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : B(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function T(t, e, n) {
  return (e = ae(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ae(t) {
  var e = oe(t, "string");
  return O(e) == "symbol" ? e : e + "";
}
function oe(t, e) {
  if (O(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (O(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var le = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(e) {
        b.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var i = this;
        b.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return i._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, i, r, a, u, s, d, f, l, c, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, h = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, v = p ? (i = this.pt) === null || i === void 0 || (i = i.value) === null || i === void 0 ? void 0 : i[this.$.type.name] : this.pt;
    (r = v || h) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (a = r.onBeforeCreate) === null || a === void 0 || a.call(r);
    var y = (u = this.$primevueConfig) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u._usept, V = y ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, $ = y ? (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 || (d = d.pt) === null || d === void 0 ? void 0 : d.value : (f = this.$primevue) === null || f === void 0 || (f = f.config) === null || f === void 0 ? void 0 : f.pt;
    (l = $ || V) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (c = l.onBeforeCreate) === null || c === void 0 || c.call(l), this.$attrSelector = te(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = X(Y(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = o({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), i = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), i?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return Q(e) ? e.apply(void 0, i) : g.apply(void 0, i);
    },
    _load: function() {
      x.isStyleNameLoaded("base") || (m.loadCSS(this.$styleOptions), this._loadGlobalStyles(), x.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !x.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (E.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), x.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      N(e) && m.load(e, o({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!_.isStyleNameLoaded("common")) {
          var i, r, a = ((i = this.$style) === null || i === void 0 || (r = i.getCommonTheme) === null || r === void 0 ? void 0 : r.call(i)) || {}, u = a.primitive, s = a.semantic, d = a.global, f = a.style;
          m.load(u?.css, o({
            name: "primitive-variables"
          }, this.$styleOptions)), m.load(s?.css, o({
            name: "semantic-variables"
          }, this.$styleOptions)), m.load(d?.css, o({
            name: "global-variables"
          }, this.$styleOptions)), m.loadStyle(o({
            name: "global-style"
          }, this.$styleOptions), f), _.setLoadedStyleName("common");
        }
        if (!_.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var l, c, p, h, v = ((l = this.$style) === null || l === void 0 || (c = l.getComponentTheme) === null || c === void 0 ? void 0 : c.call(l)) || {}, y = v.css, V = v.style;
          (p = this.$style) === null || p === void 0 || p.load(y, o({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (h = this.$style) === null || h === void 0 || h.loadStyle(o({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), V), _.setLoadedStyleName(this.$style.name);
        }
        if (!_.isStyleNameLoaded("layer-order")) {
          var $, F, R = ($ = this.$style) === null || $ === void 0 || (F = $.getLayerOrderThemeCSS) === null || F === void 0 ? void 0 : F.call($);
          m.load(R, o({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), _.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, i, r, a = ((n = this.$style) === null || n === void 0 || (i = n.getPresetTheme) === null || i === void 0 ? void 0 : i.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, u = a.css, s = (r = this.$style) === null || r === void 0 ? void 0 : r.load(u, o({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      x.clearLoadedStyleNames(), b.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      b.off("theme:change", this._loadCoreStyles), b.off("theme:change", this._load), b.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return J(e, n, i);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, u = /./g.test(i) && !!r[i.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, d = s.mergeSections, f = d === void 0 ? !0 : d, l = s.mergeProps, c = l === void 0 ? !1 : l, p = a ? u ? this._useGlobalPT(this._getPTClassValue, i, r) : this._useDefaultPT(this._getPTClassValue, i, r) : void 0, h = u ? void 0 : this._getPTSelf(n, this._getPTClassValue, i, o(o({}, r), {}, {
        global: p || {}
      })), v = this._getPTDatasets(i);
      return f || !f && h ? c ? this._mergeProps(c, p, h, v) : o(o(o({}, p), h), v) : o(o({}, h), v);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return g(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(i)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(i))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", a = i === "root" && N((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return i !== "transition" && o(o({}, i === "root" && o(o(T({}, "".concat(r, "name"), S(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && T({}, "".concat(r, "extend"), S(this.$.type.name))), {}, T({}, "".concat(this.$attrSelector), ""))), {}, T({}, "".concat(r, "section"), S(i)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return w(e) || q(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var d, f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = r ? r(s) : s, c = S(i), p = S(n.$name);
        return (d = f ? c !== p ? l?.[c] : void 0 : l?.[c]) !== null && d !== void 0 ? d : l;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: a(e.originalValue),
        value: a(e.value)
      } : a(e, !0);
    },
    _usePT: function(e, n, i, r) {
      var a = function(y) {
        return n(y, i, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var u, s = e._usept || ((u = this.$primevueConfig) === null || u === void 0 ? void 0 : u.ptOptions) || {}, d = s.mergeSections, f = d === void 0 ? !0 : d, l = s.mergeProps, c = l === void 0 ? !1 : l, p = a(e.originalValue), h = a(e.value);
        return p === void 0 && h === void 0 ? void 0 : w(h) ? h : w(p) ? p : f || !f && h ? c ? this._mergeProps(c, p, h) : o(o({}, p), h) : h;
      }
      return a(e);
    },
    _useGlobalPT: function(e, n, i) {
      return this._usePT(this.globalPT, e, n, i);
    },
    _useDefaultPT: function(e, n, i) {
      return this._usePT(this.defaultPT, e, n, i);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, o(o({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = g(this.$_attrsWithoutPT, this.ptm(n, i));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, o({
        instance: this
      }, i), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, o(o({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, o(o({}, this.$params), i)), a = this._getOptionValue(E.inlineStyles, e, o(o({}, this.$params), i));
        return [a, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return L(i, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return n._getOptionValue(i, n.$name, o({}, n.$params)) || L(i, o({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(i) {
        var r = P(i, 1), a = r[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return o(o({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = P(e, 1), i = n[0];
        return i?.startsWith("pt:");
      }).reduce(function(e, n) {
        var i = P(n, 2), r = i[0], a = i[1], u = r.split(":"), s = ne(u), d = j(s).slice(1);
        return d?.reduce(function(f, l, c, p) {
          return !f[l] && (f[l] = c === p.length - 1 ? a : {}), f[l];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = P(e, 1), i = n[0];
        return !(i != null && i.startsWith("pt:"));
      }).reduce(function(e, n) {
        var i = P(n, 2), r = i[0], a = i[1];
        return e[r] = a, e;
      }, {});
    }
  }
}, se = {
  name: "BaseEditableHolder",
  extends: le,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var i, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (i = (r = this.formField).onChange) === null || i === void 0 || i.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), i = 0; i < e; i++)
        n[i] = arguments[i];
      return n.find(N);
    }
  },
  computed: {
    $filled: function() {
      return N(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, M = {
  name: "BaseInput",
  extends: se,
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
}, de = `
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
`, ue = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, fe = m.extend({
  name: "inputtext",
  style: de,
  classes: ue
}), pe = {
  name: "BaseInputText",
  extends: M,
  style: fe,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function C(t) {
  "@babel/helpers - typeof";
  return C = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, C(t);
}
function ce(t, e, n) {
  return (e = he(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function he(t) {
  var e = me(t, "string");
  return C(e) == "symbol" ? e : e + "";
}
function me(t, e) {
  if (C(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (C(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ve = {
  name: "InputText",
  extends: pe,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return g(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return I(ce({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ge = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ye(t, e, n, i, r, a) {
  return A(), U("input", g({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": a.dataP,
    onInput: e[0] || (e[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, ge);
}
ve.render = ye;
var $e = `
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
`, be = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": i.autoResize,
      "p-textarea-sm p-inputfield-sm": i.size === "small",
      "p-textarea-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, _e = m.extend({
  name: "textarea",
  style: $e,
  classes: be
}), Se = {
  name: "BaseTextarea",
  extends: M,
  props: {
    autoResize: Boolean
  },
  style: _e,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function k(t) {
  "@babel/helpers - typeof";
  return k = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, k(t);
}
function xe(t, e, n) {
  return (e = Pe(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Pe(t) {
  var e = Te(t, "string");
  return k(e) == "symbol" ? e : e + "";
}
function Te(t, e) {
  if (k(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (k(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Oe = {
  name: "Textarea",
  extends: Se,
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
        var e = this.$el.style.height, n = parseInt(e) || 0, i = this.$el.scrollHeight, r = !n || i > n, a = n && i < n;
        a ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : r && (this.$el.style.height = "".concat(i, "px"));
      }
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return g(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return I(xe({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ce = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ke(t, e, n, i, r, a) {
  return A(), U("textarea", g({
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.invalid || void 0,
    "data-p": a.dataP,
    onInput: e[0] || (e[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, Ce);
}
Oe.render = ke;
function we(t) {
  const e = z(!!customElements.get(t)), n = z("");
  return K(async () => {
    if (!e.value)
      try {
        await ee(t, { timeoutMs: 8e3 }), e.value = !0;
      } catch (i) {
        n.value = Z(i);
      }
  }), { ready: e, failed: n };
}
export {
  x as B,
  ve as a,
  M as b,
  se as c,
  Oe as d,
  I as f,
  le as s,
  we as u
};
//# sourceMappingURL=useWidget-ASETQ9fG.js.map
