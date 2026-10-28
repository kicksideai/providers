import { openBlock as c, createElementBlock as h, mergeProps as g, createElementVNode as v, resolveComponent as q, createVNode as F, normalizeStyle as de, normalizeClass as R, renderSlot as w, createCommentVNode as $, toHandlers as V, createBlock as y, resolveDynamicComponent as A, defineComponent as U, unref as C, withCtx as ne, createTextVNode as ie, toDisplayString as x, computed as L, Fragment as O, renderList as Z, ref as E, watch as J } from "vue";
import { Icon as pe } from "@iconify/vue";
import { define as me } from "@wippy-fe/proxy";
import { B as fe, f as he, p as be, M as Q, l as X, s as Y, u as ge, a as ye, b as ve, i as T, e as we, m as Ie } from "./types-yNEBYydW.js";
import { s as re, a as $e, b as ae, c as Ce, u as xe, d as Se, e as Be } from "./useWidget-CvUXiKK3.js";
import { s as De } from "./index-Bu08HCpl.js";
var ue = {
  name: "AngleDownIcon",
  extends: re
};
function ke(t) {
  return Ae(t) || Ve(t) || Pe(t) || Me();
}
function Me() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pe(t, e) {
  if (t) {
    if (typeof t == "string") return j(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? j(t, e) : void 0;
  }
}
function Ve(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ae(t) {
  if (Array.isArray(t)) return j(t);
}
function j(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Ee(t, e, n, i, a, r) {
  return c(), h("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ke(e[0] || (e[0] = [v("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ue.render = Ee;
var se = {
  name: "AngleUpIcon",
  extends: re
};
function Te(t) {
  return Ne(t) || Ue(t) || Le(t) || Fe();
}
function Fe() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Le(t, e) {
  if (t) {
    if (typeof t == "string") return z(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? z(t, e) : void 0;
  }
}
function Ue(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ne(t) {
  if (Array.isArray(t)) return z(t);
}
function z(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Oe(t, e, n, i, a, r) {
  return c(), h("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Te(e[0] || (e[0] = [v("path", {
    d: "M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
se.render = Oe;
var Re = `
    .p-inputnumber {
        display: inline-flex;
        position: relative;
    }

    .p-inputnumber-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: pointer;
        background: dt('inputnumber.button.background');
        color: dt('inputnumber.button.color');
        width: dt('inputnumber.button.width');
        transition:
            background dt('inputnumber.transition.duration'),
            color dt('inputnumber.transition.duration'),
            border-color dt('inputnumber.transition.duration'),
            outline-color dt('inputnumber.transition.duration');
    }

    .p-inputnumber-button:disabled {
        cursor: auto;
    }

    .p-inputnumber-button:not(:disabled):hover {
        background: dt('inputnumber.button.hover.background');
        color: dt('inputnumber.button.hover.color');
    }

    .p-inputnumber-button:not(:disabled):active {
        background: dt('inputnumber.button.active.background');
        color: dt('inputnumber.button.active.color');
    }

    .p-inputnumber-stacked .p-inputnumber-button {
        position: relative;
        flex: 1 1 auto;
        border: 0 none;
    }

    .p-inputnumber-stacked .p-inputnumber-button-group {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset-block-start: 1px;
        inset-inline-end: 1px;
        height: calc(100% - 2px);
        z-index: 1;
    }

    .p-inputnumber-stacked .p-inputnumber-increment-button {
        padding: 0;
        border-start-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-decrement-button {
        padding: 0;
        border-end-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-horizontal .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-increment-button {
        order: 3;
        border-start-end-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        border-inline-start: 0 none;
    }

    .p-inputnumber-horizontal .p-inputnumber-input {
        order: 2;
        border-radius: 0;
    }

    .p-inputnumber-horizontal .p-inputnumber-decrement-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-inline-end: 0 none;
    }

    .p-floatlabel:has(.p-inputnumber-horizontal) label {
        margin-inline-start: dt('inputnumber.button.width');
    }

    .p-inputnumber-vertical {
        flex-direction: column;
    }

    .p-inputnumber-vertical .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
        padding: dt('inputnumber.button.vertical.padding');
    }

    .p-inputnumber-vertical .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-increment-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-start-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-end: 0 none;
    }

    .p-inputnumber-vertical .p-inputnumber-input {
        order: 2;
        border-radius: 0;
        text-align: center;
    }

    .p-inputnumber-vertical .p-inputnumber-decrement-button {
        order: 3;
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-start: 0 none;
    }

    .p-inputnumber-input {
        flex: 1 1 auto;
    }

    .p-inputnumber-fluid {
        width: 100%;
    }

    .p-inputnumber-fluid .p-inputnumber-input {
        width: 1%;
    }

    .p-inputnumber-fluid.p-inputnumber-vertical .p-inputnumber-input {
        width: 100%;
    }

    .p-inputnumber:has(.p-inputtext-sm) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-inputnumber:has(.p-inputtext-lg) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-inputnumber-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    .p-inputnumber:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-stacked .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-stacked:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + (dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-horizontal .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }
`, je = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputnumber p-component p-inputwrapper", {
      "p-invalid": n.$invalid,
      "p-inputwrapper-filled": n.$filled || i.allowEmpty === !1,
      "p-inputwrapper-focus": n.focused,
      "p-inputnumber-stacked": i.showButtons && i.buttonLayout === "stacked",
      "p-inputnumber-horizontal": i.showButtons && i.buttonLayout === "horizontal",
      "p-inputnumber-vertical": i.showButtons && i.buttonLayout === "vertical",
      "p-inputnumber-fluid": n.$fluid
    }];
  },
  pcInputText: "p-inputnumber-input",
  clearIcon: "p-inputnumber-clear-icon",
  buttonGroup: "p-inputnumber-button-group",
  incrementButton: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": i.showButtons && i.max !== null && n.maxBoundry()
    }];
  },
  decrementButton: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": i.showButtons && i.min !== null && n.minBoundry()
    }];
  }
}, ze = fe.extend({
  name: "inputnumber",
  style: Re,
  classes: je
}), Ke = {
  name: "BaseInputNumber",
  extends: Ce,
  props: {
    format: {
      type: Boolean,
      default: !0
    },
    showButtons: {
      type: Boolean,
      default: !1
    },
    buttonLayout: {
      type: String,
      default: "stacked"
    },
    incrementButtonClass: {
      type: String,
      default: null
    },
    decrementButtonClass: {
      type: String,
      default: null
    },
    incrementButtonIcon: {
      type: String,
      default: void 0
    },
    incrementIcon: {
      type: String,
      default: void 0
    },
    decrementButtonIcon: {
      type: String,
      default: void 0
    },
    decrementIcon: {
      type: String,
      default: void 0
    },
    locale: {
      type: String,
      default: void 0
    },
    localeMatcher: {
      type: String,
      default: void 0
    },
    mode: {
      type: String,
      default: "decimal"
    },
    prefix: {
      type: String,
      default: null
    },
    suffix: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      default: void 0
    },
    currencyDisplay: {
      type: String,
      default: void 0
    },
    useGrouping: {
      type: Boolean,
      default: !0
    },
    minFractionDigits: {
      type: Number,
      default: void 0
    },
    maxFractionDigits: {
      type: Number,
      default: void 0
    },
    roundingMode: {
      type: String,
      default: "halfExpand",
      validator: function(e) {
        return ["ceil", "floor", "expand", "trunc", "halfCeil", "halfFloor", "halfExpand", "halfTrunc", "halfEven"].includes(e);
      }
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    step: {
      type: Number,
      default: 1
    },
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    highlightOnFocus: {
      type: Boolean,
      default: !1
    },
    showClear: {
      type: Boolean,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    placeholder: {
      type: String,
      default: null
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
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: !1
    }
  },
  style: ze,
  provide: function() {
    return {
      $pcInputNumber: this,
      $parentInstance: this
    };
  }
};
function D(t) {
  "@babel/helpers - typeof";
  return D = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, D(t);
}
function ee(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(a) {
      return Object.getOwnPropertyDescriptor(t, a).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function te(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ee(Object(n), !0).forEach(function(i) {
      K(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ee(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function K(t, e, n) {
  return (e = _e(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _e(t) {
  var e = We(t, "string");
  return D(e) == "symbol" ? e : e + "";
}
function We(t, e) {
  if (D(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (D(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Ge(t) {
  return Je(t) || Ze(t) || qe(t) || He();
}
function He() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qe(t, e) {
  if (t) {
    if (typeof t == "string") return _(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _(t, e) : void 0;
  }
}
function Ze(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Je(t) {
  if (Array.isArray(t)) return _(t);
}
function _(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
var oe = {
  name: "InputNumber",
  extends: Ke,
  inheritAttrs: !1,
  emits: ["input", "focus", "blur"],
  inject: {
    $pcFluid: {
      default: null
    }
  },
  numberFormat: null,
  _numeral: null,
  _decimal: null,
  _group: null,
  _minusSign: null,
  _currency: null,
  _suffix: null,
  _prefix: null,
  _index: null,
  groupChar: "",
  isSpecialChar: null,
  prefixChar: null,
  suffixChar: null,
  timer: null,
  data: function() {
    return {
      // @deprecated
      d_modelValue: this.d_value,
      focused: !1
    };
  },
  watch: {
    d_value: {
      immediate: !0,
      handler: function(e) {
        var n;
        this.d_modelValue = e, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = X(e) ? "none" : "block");
      }
    },
    locale: function(e, n) {
      this.updateConstructParser(e, n);
    },
    localeMatcher: function(e, n) {
      this.updateConstructParser(e, n);
    },
    mode: function(e, n) {
      this.updateConstructParser(e, n);
    },
    currency: function(e, n) {
      this.updateConstructParser(e, n);
    },
    currencyDisplay: function(e, n) {
      this.updateConstructParser(e, n);
    },
    useGrouping: function(e, n) {
      this.updateConstructParser(e, n);
    },
    minFractionDigits: function(e, n) {
      this.updateConstructParser(e, n);
    },
    maxFractionDigits: function(e, n) {
      this.updateConstructParser(e, n);
    },
    suffix: function(e, n) {
      this.updateConstructParser(e, n);
    },
    prefix: function(e, n) {
      this.updateConstructParser(e, n);
    }
  },
  created: function() {
    this.constructParser();
  },
  mounted: function() {
    var e;
    (e = this.$refs.clearIcon) !== null && e !== void 0 && (e = e.$el) !== null && e !== void 0 && e.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
  },
  methods: {
    getOptions: function() {
      return {
        localeMatcher: this.localeMatcher,
        style: this.mode,
        currency: this.currency,
        currencyDisplay: this.currencyDisplay,
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFractionDigits,
        maximumFractionDigits: this.maxFractionDigits,
        roundingMode: this.roundingMode
      };
    },
    constructParser: function() {
      this.numberFormat = new Intl.NumberFormat(this.locale, this.getOptions());
      var e = Ge(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), n = new Map(e.map(function(i, a) {
        return [i, a];
      }));
      this._numeral = new RegExp("[".concat(e.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(i) {
        return n.get(i);
      };
    },
    updateConstructParser: function(e, n) {
      e !== n && this.constructParser();
    },
    escapeRegExp: function(e) {
      return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var e = new Intl.NumberFormat(this.locale, te(te({}, this.getOptions()), {}, {
        useGrouping: !1
      })), n = e.format(1.1);
      return n === e.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(n.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
    },
    getGroupingExpression: function() {
      var e = new Intl.NumberFormat(this.locale, {
        useGrouping: !0
      });
      return this.groupChar = e.format(1e6).trim().replace(this._numeral, "").charAt(0), new RegExp("[".concat(this.groupChar, "]"), "g");
    },
    getMinusSignExpression: function() {
      var e = new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      });
      return new RegExp("[".concat(e.format(-1).trim().replace(this._numeral, ""), "]"), "g");
    },
    getCurrencyExpression: function() {
      if (this.currency) {
        var e = new Intl.NumberFormat(this.locale, {
          style: "currency",
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        return new RegExp("[".concat(e.format(1).replace(/\s/g, "").replace(this._numeral, "").replace(this._group, ""), "]"), "g");
      }
      return new RegExp("[]", "g");
    },
    getPrefixExpression: function() {
      if (this.prefix)
        this.prefixChar = this.prefix;
      else {
        var e = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay
        });
        this.prefixChar = e.format(1).split("1")[0];
      }
      return new RegExp("".concat(this.escapeRegExp(this.prefixChar || "")), "g");
    },
    getSuffixExpression: function() {
      if (this.suffix)
        this.suffixChar = this.suffix;
      else {
        var e = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        this.suffixChar = e.format(1).split("1")[1];
      }
      return new RegExp("".concat(this.escapeRegExp(this.suffixChar || "")), "g");
    },
    formatValue: function(e) {
      if (e != null) {
        if (e === "-")
          return e;
        if (this.format) {
          var n = new Intl.NumberFormat(this.locale, this.getOptions()), i = n.format(e);
          return this.prefix && (i = this.prefix + i), this.suffix && (i = i + this.suffix), i;
        }
        return e.toString();
      }
      return "";
    },
    parseValue: function(e) {
      var n = e.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (n) {
        if (n === "-")
          return n;
        var i = +n;
        return isNaN(i) ? null : i;
      }
      return null;
    },
    repeat: function(e, n, i) {
      var a = this;
      if (!this.readonly) {
        var r = n || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          a.repeat(e, 40, i);
        }, r), this.spin(e, i);
      }
    },
    addWithPrecision: function(e, n) {
      var i = e.toString(), a = n.toString(), r = i.includes(".") ? i.split(".")[1].length : 0, u = a.includes(".") ? a.split(".")[1].length : 0, s = Math.max(r, u), d = Math.pow(10, s);
      return Math.round((e + n) * d) / d;
    },
    spin: function(e, n) {
      if (this.$refs.input) {
        var i = this.step * n, a = this.parseValue(this.$refs.input.$el.value) || 0, r = this.validateValue(this.addWithPrecision(a, i));
        this.updateInput(r, null, "spin"), this.updateModel(e, r), this.handleOnInput(e, a, r);
      }
    },
    onUpButtonMouseDown: function(e) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(e, null, 1), e.preventDefault());
    },
    onUpButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyDown: function(e) {
      (e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter") && this.repeat(e, null, 1);
    },
    onDownButtonMouseDown: function(e) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(e, null, -1), e.preventDefault());
    },
    onDownButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyDown: function(e) {
      (e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter") && this.repeat(e, null, -1);
    },
    onUserInput: function() {
      this.isSpecialChar && (this.$refs.input.$el.value = this.lastValue), this.isSpecialChar = !1;
    },
    onInputKeyDown: function(e) {
      if (!this.readonly && !e.isComposing) {
        if (e.altKey || e.ctrlKey || e.metaKey) {
          this.isSpecialChar = !0, this.lastValue = this.$refs.input.$el.value;
          return;
        }
        this.lastValue = e.target.value;
        var n = e.target.selectionStart, i = e.target.selectionEnd, a = i - n, r = e.target.value, u = null, s = e.code || e.key;
        switch (s) {
          case "ArrowUp":
            this.spin(e, 1), e.preventDefault();
            break;
          case "ArrowDown":
            this.spin(e, -1), e.preventDefault();
            break;
          case "ArrowLeft":
            if (a > 1) {
              var d = this.isNumeralChar(r.charAt(n)) ? n + 1 : n + 2;
              this.$refs.input.$el.setSelectionRange(d, d);
            } else this.isNumeralChar(r.charAt(n - 1)) || e.preventDefault();
            break;
          case "ArrowRight":
            if (a > 1) {
              var p = i - 1;
              this.$refs.input.$el.setSelectionRange(p, p);
            } else this.isNumeralChar(r.charAt(n)) || e.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            u = this.validateValue(this.parseValue(r)), this.$refs.input.$el.value = this.formatValue(u), this.$refs.input.$el.setAttribute("aria-valuenow", u), this.updateModel(e, u);
            break;
          case "Backspace": {
            if (e.preventDefault(), n === i) {
              n >= r.length && this.suffixChar !== null && (n = r.length - this.suffixChar.length, this.$refs.input.$el.setSelectionRange(n, n));
              var m = r.charAt(n - 1), f = this.getDecimalCharIndexes(r), o = f.decimalCharIndex, l = f.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(m)) {
                var b = this.getDecimalLength(r);
                if (this._group.test(m))
                  this._group.lastIndex = 0, u = r.slice(0, n - 2) + r.slice(n - 1);
                else if (this._decimal.test(m))
                  this._decimal.lastIndex = 0, b ? this.$refs.input.$el.setSelectionRange(n - 1, n - 1) : u = r.slice(0, n - 1) + r.slice(n);
                else if (o > 0 && n > o) {
                  var S = this.isDecimalMode() && (this.minFractionDigits || 0) < b ? "" : "0";
                  u = r.slice(0, n - 1) + S + r.slice(n);
                } else l === 1 ? (u = r.slice(0, n - 1) + "0" + r.slice(n), u = this.parseValue(u) > 0 ? u : "") : u = r.slice(0, n - 1) + r.slice(n);
              }
              this.updateValue(e, u, null, "delete-single");
            } else
              u = this.deleteRange(r, n, i), this.updateValue(e, u, null, "delete-range");
            break;
          }
          case "Delete":
            if (e.preventDefault(), n === i) {
              var B = r.charAt(n), I = this.getDecimalCharIndexes(r), k = I.decimalCharIndex, M = I.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(B)) {
                var P = this.getDecimalLength(r);
                if (this._group.test(B))
                  this._group.lastIndex = 0, u = r.slice(0, n) + r.slice(n + 2);
                else if (this._decimal.test(B))
                  this._decimal.lastIndex = 0, P ? this.$refs.input.$el.setSelectionRange(n + 1, n + 1) : u = r.slice(0, n) + r.slice(n + 1);
                else if (k > 0 && n > k) {
                  var N = this.isDecimalMode() && (this.minFractionDigits || 0) < P ? "" : "0";
                  u = r.slice(0, n) + N + r.slice(n + 1);
                } else M === 1 ? (u = r.slice(0, n) + "0" + r.slice(n + 1), u = this.parseValue(u) > 0 ? u : "") : u = r.slice(0, n) + r.slice(n + 1);
              }
              this.updateValue(e, u, null, "delete-back-single");
            } else
              u = this.deleteRange(r, n, i), this.updateValue(e, u, null, "delete-range");
            break;
          case "Home":
            e.preventDefault(), Y(this.min) && this.updateModel(e, this.min);
            break;
          case "End":
            e.preventDefault(), Y(this.max) && this.updateModel(e, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(e) {
      if (!this.readonly) {
        var n = e.key, i = this.isDecimalSign(n), a = this.isMinusSign(n);
        e.code !== "Enter" && e.preventDefault(), (Number(n) >= 0 && Number(n) <= 9 || a || i) && this.insert(e, n, {
          isDecimalSign: i,
          isMinusSign: a
        });
      }
    },
    onPaste: function(e) {
      if (!(this.readonly || this.disabled)) {
        e.preventDefault();
        var n = (e.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(n)) && n) {
          var i = this.parseValue(n);
          i != null && this.insert(e, i.toString());
        }
      }
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.$refs.input.$el.focus();
    },
    allowMinusSign: function() {
      return this.min === null || this.min < 0;
    },
    isMinusSign: function(e) {
      return this._minusSign.test(e) || e === "-" ? (this._minusSign.lastIndex = 0, !0) : !1;
    },
    isDecimalSign: function(e) {
      var n;
      return (n = this.locale) !== null && n !== void 0 && n.includes("fr") && [".", ","].includes(e) || this._decimal.test(e) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(e) {
      var n = e.search(this._decimal);
      this._decimal.lastIndex = 0;
      var i = e.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), a = i.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: n,
        decimalCharIndexWithoutPrefix: a
      };
    },
    getCharIndexes: function(e) {
      var n = e.search(this._decimal);
      this._decimal.lastIndex = 0;
      var i = e.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var a = e.search(this._suffix);
      this._suffix.lastIndex = 0;
      var r = e.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: n,
        minusCharIndex: i,
        suffixCharIndex: a,
        currencyCharIndex: r
      };
    },
    insert: function(e, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, a = n.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && a !== -1)) {
        var r = this.$refs.input.$el.selectionStart, u = this.$refs.input.$el.selectionEnd, s = this.$refs.input.$el.value.trim(), d = this.getCharIndexes(s), p = d.decimalCharIndex, m = d.minusCharIndex, f = d.suffixCharIndex, o = d.currencyCharIndex, l;
        if (i.isMinusSign) {
          var b = m === -1;
          (r === 0 || r === o + 1) && (l = s, (b || u !== 0) && (l = this.insertText(s, n, 0, u)), this.updateValue(e, l, n, "insert"));
        } else if (i.isDecimalSign)
          p > 0 && r === p ? this.updateValue(e, s, n, "insert") : p > r && p < u ? (l = this.insertText(s, n, r, u), this.updateValue(e, l, n, "insert")) : p === -1 && this.maxFractionDigits && (l = this.insertText(s, n, r, u), this.updateValue(e, l, n, "insert"));
        else {
          var S = this.numberFormat.resolvedOptions().maximumFractionDigits, B = r !== u ? "range-insert" : "insert";
          if (p > 0 && r > p) {
            if (r + n.length - (p + 1) <= S) {
              var I = o >= r ? o - 1 : f >= r ? f : s.length;
              l = s.slice(0, r) + n + s.slice(r + n.length, I) + s.slice(I), this.updateValue(e, l, n, B);
            }
          } else
            l = this.insertText(s, n, r, u), this.updateValue(e, l, n, B);
        }
      }
    },
    insertText: function(e, n, i, a) {
      var r = n === "." ? n : n.split(".");
      if (r.length === 2) {
        var u = e.slice(i, a).search(this._decimal);
        return this._decimal.lastIndex = 0, u > 0 ? e.slice(0, i) + this.formatValue(n) + e.slice(a) : this.formatValue(n) || e;
      } else return a - i === e.length ? this.formatValue(n) : i === 0 ? n + e.slice(a) : a === e.length ? e.slice(0, i) + n : e.slice(0, i) + n + e.slice(a);
    },
    deleteRange: function(e, n, i) {
      var a;
      return i - n === e.length ? a = "" : n === 0 ? a = e.slice(i) : i === e.length ? a = e.slice(0, n) : a = e.slice(0, n) + e.slice(i), a;
    },
    initCursor: function() {
      var e = this.$refs.input.$el.selectionStart, n = this.$refs.input.$el.value, i = n.length, a = null, r = (this.prefixChar || "").length;
      n = n.replace(this._prefix, ""), e = e - r;
      var u = n.charAt(e);
      if (this.isNumeralChar(u))
        return e + r;
      for (var s = e - 1; s >= 0; )
        if (u = n.charAt(s), this.isNumeralChar(u)) {
          a = s + r;
          break;
        } else
          s--;
      if (a !== null)
        this.$refs.input.$el.setSelectionRange(a + 1, a + 1);
      else {
        for (s = e; s < i; )
          if (u = n.charAt(s), this.isNumeralChar(u)) {
            a = s + r;
            break;
          } else
            s++;
        a !== null && this.$refs.input.$el.setSelectionRange(a, a);
      }
      return a || 0;
    },
    onInputClick: function() {
      var e = this.$refs.input.$el.value;
      !this.readonly && e !== Q() && this.initCursor();
    },
    isNumeralChar: function(e) {
      return e.length === 1 && (this._numeral.test(e) || this._decimal.test(e) || this._group.test(e) || this._minusSign.test(e)) ? (this.resetRegex(), !0) : !1;
    },
    resetRegex: function() {
      this._numeral.lastIndex = 0, this._decimal.lastIndex = 0, this._group.lastIndex = 0, this._minusSign.lastIndex = 0;
    },
    updateValue: function(e, n, i, a) {
      var r = this.$refs.input.$el.value, u = null;
      n != null && (u = this.parseValue(n), u = !u && !this.allowEmpty ? 0 : u, this.updateInput(u, i, a, n), this.handleOnInput(e, r, u));
    },
    handleOnInput: function(e, n, i) {
      if (this.isValueChanged(n, i)) {
        var a, r;
        this.$emit("input", {
          originalEvent: e,
          value: i,
          formattedValue: n
        }), (a = (r = this.formField).onInput) === null || a === void 0 || a.call(r, {
          originalEvent: e,
          value: i
        });
      }
    },
    isValueChanged: function(e, n) {
      if (n === null && e !== null)
        return !0;
      if (n != null) {
        var i = typeof e == "string" ? this.parseValue(e) : e;
        return n !== i;
      }
      return !1;
    },
    validateValue: function(e) {
      return e === "-" || e == null ? null : this.min != null && e < this.min ? this.min : this.max != null && e > this.max ? this.max : e;
    },
    updateInput: function(e, n, i, a) {
      var r;
      n = n || "";
      var u = this.$refs.input.$el.value, s = this.formatValue(e), d = u.length;
      if (s !== a && (s = this.concatValues(s, a)), d === 0) {
        this.$refs.input.$el.value = s, this.$refs.input.$el.setSelectionRange(0, 0);
        var p = this.initCursor(), m = p + n.length;
        this.$refs.input.$el.setSelectionRange(m, m);
      } else {
        var f = this.$refs.input.$el.selectionStart, o = this.$refs.input.$el.selectionEnd;
        this.$refs.input.$el.value = s;
        var l = s.length;
        if (i === "range-insert") {
          var b = this.parseValue((u || "").slice(0, f)), S = b !== null ? b.toString() : "", B = S.split("").join("(".concat(this.groupChar, ")?")), I = new RegExp(B, "g");
          I.test(s);
          var k = n.split("").join("(".concat(this.groupChar, ")?")), M = new RegExp(k, "g");
          M.test(s.slice(I.lastIndex)), o = I.lastIndex + M.lastIndex, this.$refs.input.$el.setSelectionRange(o, o);
        } else if (l === d)
          i === "insert" || i === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(o + 1, o + 1) : i === "delete-single" ? this.$refs.input.$el.setSelectionRange(o - 1, o - 1) : (i === "delete-range" || i === "spin") && this.$refs.input.$el.setSelectionRange(o, o);
        else if (i === "delete-back-single") {
          var P = u.charAt(o - 1), N = u.charAt(o), W = d - l, G = this._group.test(N);
          G && W === 1 ? o += 1 : !G && this.isNumeralChar(P) && (o += -1 * W + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(o, o);
        } else if (u === "-" && i === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var ce = this.initCursor(), H = ce + n.length + 1;
          this.$refs.input.$el.setSelectionRange(H, H);
        } else
          o = o + (l - d), this.$refs.input.$el.setSelectionRange(o, o);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", e), (r = this.$refs.clearIcon) !== null && r !== void 0 && (r = r.$el) !== null && r !== void 0 && r.style && (this.$refs.clearIcon.$el.style.display = X(s) ? "none" : "block");
    },
    concatValues: function(e, n) {
      if (e && n) {
        var i = n.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? i !== -1 ? e.replace(this.suffixChar, "").split(this._decimal)[0] + n.replace(this.suffixChar, "").slice(i) + this.suffixChar : e : i !== -1 ? e.split(this._decimal)[0] + n.slice(i) : e;
      }
      return e;
    },
    getDecimalLength: function(e) {
      if (e) {
        var n = e.split(this._decimal);
        if (n.length === 2)
          return n[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(e, n) {
      this.writeValue(n, e);
    },
    onInputFocus: function(e) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== Q() && this.highlightOnFocus && e.target.select(), this.$emit("focus", e);
    },
    onInputBlur: function(e) {
      var n, i;
      this.focused = !1;
      var a = e.target, r = this.validateValue(this.parseValue(a.value));
      this.$emit("blur", {
        originalEvent: e,
        value: a.value
      }), (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i, e), a.value = this.formatValue(r), a.setAttribute("aria-valuenow", r), this.updateModel(e, r), !this.disabled && !this.readonly && this.highlightOnFocus && be();
    },
    clearTimer: function() {
      this.timer && clearTimeout(this.timer);
    },
    maxBoundry: function() {
      return this.d_value >= this.max;
    },
    minBoundry: function() {
      return this.d_value <= this.min;
    }
  },
  computed: {
    upButtonListeners: function() {
      var e = this;
      return {
        mousedown: function(i) {
          return e.onUpButtonMouseDown(i);
        },
        mouseup: function(i) {
          return e.onUpButtonMouseUp(i);
        },
        mouseleave: function(i) {
          return e.onUpButtonMouseLeave(i);
        },
        keydown: function(i) {
          return e.onUpButtonKeyDown(i);
        },
        keyup: function(i) {
          return e.onUpButtonKeyUp(i);
        }
      };
    },
    downButtonListeners: function() {
      var e = this;
      return {
        mousedown: function(i) {
          return e.onDownButtonMouseDown(i);
        },
        mouseup: function(i) {
          return e.onDownButtonMouseUp(i);
        },
        mouseleave: function(i) {
          return e.onDownButtonMouseLeave(i);
        },
        keydown: function(i) {
          return e.onDownButtonKeyDown(i);
        },
        keyup: function(i) {
          return e.onDownButtonKeyUp(i);
        }
      };
    },
    formattedValue: function() {
      var e = !this.d_value && !this.allowEmpty ? 0 : this.d_value;
      return this.formatValue(e);
    },
    getFormatter: function() {
      return this.numberFormat;
    },
    dataP: function() {
      return he(K(K({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: ae,
    AngleUpIcon: se,
    AngleDownIcon: ue,
    TimesIcon: $e
  }
}, Qe = ["data-p"], Xe = ["data-p"], Ye = ["disabled", "data-p"], et = ["disabled", "data-p"], tt = ["disabled", "data-p"], nt = ["disabled", "data-p"];
function it(t, e, n, i, a, r) {
  var u = q("InputText"), s = q("TimesIcon");
  return c(), h("span", g({
    class: t.cx("root")
  }, t.ptmi("root"), {
    "data-p": r.dataP
  }), [F(u, {
    ref: "input",
    id: t.inputId,
    name: t.$formName,
    role: "spinbutton",
    class: R([t.cx("pcInputText"), t.inputClass]),
    style: de(t.inputStyle),
    defaultValue: r.formattedValue,
    "aria-valuemin": t.min,
    "aria-valuemax": t.max,
    "aria-valuenow": t.d_value,
    inputmode: t.mode === "decimal" && !t.minFractionDigits ? "numeric" : "decimal",
    disabled: t.disabled,
    readonly: t.readonly,
    placeholder: t.placeholder,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    required: t.required,
    size: t.size,
    invalid: t.invalid,
    variant: t.variant,
    onInput: r.onUserInput,
    onKeydown: r.onInputKeyDown,
    onKeypress: r.onInputKeyPress,
    onPaste: r.onPaste,
    onClick: r.onInputClick,
    onFocus: r.onInputFocus,
    onBlur: r.onInputBlur,
    pt: t.ptm("pcInputText"),
    unstyled: t.unstyled,
    "data-p": r.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), t.showClear && t.buttonLayout !== "vertical" ? w(t.$slots, "clearicon", {
    key: 0,
    class: R(t.cx("clearIcon")),
    clearCallback: r.onClearClick
  }, function() {
    return [F(s, g({
      ref: "clearIcon",
      class: [t.cx("clearIcon")],
      onClick: r.onClearClick
    }, t.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : $("", !0), t.showButtons && t.buttonLayout === "stacked" ? (c(), h("span", g({
    key: 1,
    class: t.cx("buttonGroup")
  }, t.ptm("buttonGroup"), {
    "data-p": r.dataP
  }), [w(t.$slots, "incrementbutton", {
    listeners: r.upButtonListeners
  }, function() {
    return [v("button", g({
      class: [t.cx("incrementButton"), t.incrementButtonClass]
    }, V(r.upButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("incrementButton"), {
      "data-p": r.dataP
    }), [w(t.$slots, t.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(c(), y(A(t.incrementIcon || t.incrementButtonIcon ? "span" : "AngleUpIcon"), g({
        class: [t.incrementIcon, t.incrementButtonIcon]
      }, t.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, Ye)];
  }), w(t.$slots, "decrementbutton", {
    listeners: r.downButtonListeners
  }, function() {
    return [v("button", g({
      class: [t.cx("decrementButton"), t.decrementButtonClass]
    }, V(r.downButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("decrementButton"), {
      "data-p": r.dataP
    }), [w(t.$slots, t.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(c(), y(A(t.decrementIcon || t.decrementButtonIcon ? "span" : "AngleDownIcon"), g({
        class: [t.decrementIcon, t.decrementButtonIcon]
      }, t.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, et)];
  })], 16, Xe)) : $("", !0), w(t.$slots, "incrementbutton", {
    listeners: r.upButtonListeners
  }, function() {
    return [t.showButtons && t.buttonLayout !== "stacked" ? (c(), h("button", g({
      key: 0,
      class: [t.cx("incrementButton"), t.incrementButtonClass]
    }, V(r.upButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("incrementButton"), {
      "data-p": r.dataP
    }), [w(t.$slots, t.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(c(), y(A(t.incrementIcon || t.incrementButtonIcon ? "span" : "AngleUpIcon"), g({
        class: [t.incrementIcon, t.incrementButtonIcon]
      }, t.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, tt)) : $("", !0)];
  }), w(t.$slots, "decrementbutton", {
    listeners: r.downButtonListeners
  }, function() {
    return [t.showButtons && t.buttonLayout !== "stacked" ? (c(), h("button", g({
      key: 0,
      class: [t.cx("decrementButton"), t.decrementButtonClass]
    }, V(r.downButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("decrementButton"), {
      "data-p": r.dataP
    }), [w(t.$slots, t.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(c(), y(A(t.decrementIcon || t.decrementButtonIcon ? "span" : "AngleDownIcon"), g({
        class: [t.decrementIcon, t.decrementButtonIcon]
      }, t.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, nt)) : $("", !0)];
  })], 16, Qe);
}
oe.render = it;
const rt = ["aria-labelledby", "value", "capability"], le = /* @__PURE__ */ U({
  __name: "ModelPicker",
  props: {
    value: {},
    capability: {},
    labelledBy: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const n = e, i = xe("wc-model-picker");
    function a(r) {
      const u = r instanceof CustomEvent ? r.detail : void 0;
      typeof u == "string" && u && n("select", u);
    }
    return (r, u) => C(i).ready.value ? (c(), h("wc-model-picker", {
      key: 0,
      "aria-labelledby": t.labelledBy,
      value: t.value,
      capability: t.capability,
      onSelect: a
    }, null, 40, rt)) : C(i).failed.value ? (c(), y(C(Se), {
      key: 1,
      severity: "error",
      size: "small"
    }, {
      default: ne(() => [
        ie("The model picker could not load: " + x(C(i).failed.value), 1)
      ]),
      _: 1
    })) : $("", !0);
  }
}), at = {
  key: 0,
  class: "mm-toggle"
}, ut = { class: "mm-field" }, st = { class: "mm-label" }, ot = {
  key: 0,
  class: "mm-hint"
}, lt = {
  key: 1,
  class: "mm-field"
}, ct = ["id", "for"], dt = {
  key: 4,
  class: "mm-hint"
}, pt = /* @__PURE__ */ U({
  __name: "ConfigField",
  props: {
    name: {},
    field: {},
    value: {}
  },
  emits: ["update"],
  setup(t, { emit: e }) {
    const n = t, i = e, a = L(() => n.field.title || n.name);
    return (r, u) => t.field.type === "boolean" ? (c(), h("div", at, [
      v("span", ut, [
        v("span", st, x(a.value), 1),
        t.field.description ? (c(), h("span", ot, x(t.field.description), 1)) : $("", !0)
      ]),
      F(C(De), {
        "model-value": t.value === !0,
        "aria-label": a.value,
        "onUpdate:modelValue": u[0] || (u[0] = (s) => i("update", s))
      }, null, 8, ["model-value", "aria-label"])
    ])) : (c(), h("div", lt, [
      v("label", {
        id: `${t.name}_label`,
        class: "mm-label",
        for: t.name
      }, x(a.value), 9, ct),
      t.field.web_component === "wc-model-picker" ? (c(), y(le, {
        key: 0,
        "labelled-by": `${t.name}_label`,
        value: String(t.value || ""),
        capability: "generate",
        onSelect: u[1] || (u[1] = (s) => i("update", s))
      }, null, 8, ["labelled-by", "value"])) : t.field.type === "integer" || t.field.type === "number" ? (c(), y(C(oe), {
        key: 1,
        "input-id": t.name,
        "model-value": typeof t.value == "number" ? t.value : null,
        min: t.field.minimum,
        max: t.field.maximum,
        "max-fraction-digits": t.field.type === "integer" ? 0 : 6,
        "onUpdate:modelValue": u[2] || (u[2] = (s) => s !== null && i("update", s))
      }, null, 8, ["input-id", "model-value", "min", "max", "max-fraction-digits"])) : t.field.format === "textarea" ? (c(), y(C(Be), {
        key: 2,
        id: t.name,
        "model-value": String(t.value ?? ""),
        "auto-resize": "",
        "onUpdate:modelValue": u[3] || (u[3] = (s) => i("update", s))
      }, null, 8, ["id", "model-value"])) : (c(), y(C(ae), {
        key: 3,
        id: t.name,
        "model-value": String(t.value ?? ""),
        "onUpdate:modelValue": u[4] || (u[4] = (s) => i("update", s))
      }, null, 8, ["id", "model-value"])),
      t.field.description ? (c(), h("span", dt, x(t.field.description), 1)) : $("", !0)
    ]));
  }
}), mt = { class: "mm-sections" }, ft = { class: "mm-section-h" }, ht = { class: "mm-section-hint" }, bt = { class: "mm-grid" }, gt = /* @__PURE__ */ U({
  __name: "ConfigFields",
  props: {
    schema: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, i = e, a = {
      models: { title: "Models", icon: "tabler:cpu", hint: "Which models read conversations and decide what changes in the memory." },
      learning: { title: "What it learns", icon: "tabler:school", hint: "What agents that use this memory capture into it." },
      recall: { title: "What agents see", icon: "tabler:eye", hint: "How much of the memory goes into an agent's instructions and each step." },
      upkeep: { title: "Upkeep", icon: "tabler:refresh", hint: "Background work that keeps the memory tidy." }
    }, r = L(() => {
      const d = Object.entries(n.schema.properties || {}).sort((m, f) => (m[1].order ?? 1e3) - (f[1].order ?? 1e3)), p = [];
      for (const m of d) {
        const f = m[1].section || "other", o = p.find((l) => l.id === f);
        o ? o.fields.push(m) : p.push({ id: f, fields: [m] });
      }
      return p;
    });
    function u(d) {
      return d.type === "boolean" || d.format === "textarea";
    }
    function s(d, p) {
      i("update:modelValue", { ...n.modelValue, [d]: p });
    }
    return (d, p) => (c(), h("div", mt, [
      (c(!0), h(O, null, Z(r.value, (m) => (c(), h("section", {
        key: m.id,
        class: "mm-section"
      }, [
        a[m.id] ? (c(), h(O, { key: 0 }, [
          v("h3", ft, [
            F(C(pe), {
              icon: a[m.id].icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ie(x(a[m.id].title), 1)
          ]),
          v("p", ht, x(a[m.id].hint), 1)
        ], 64)) : $("", !0),
        v("div", bt, [
          w(d.$slots, `before-${m.id}`),
          (c(!0), h(O, null, Z(m.fields, ([f, o]) => (c(), y(pt, {
            key: f,
            class: R({ wide: u(o) }),
            name: f,
            field: o,
            value: t.modelValue[f],
            onUpdate: (l) => s(f, l)
          }, null, 8, ["class", "name", "field", "value", "onUpdate"]))), 128))
        ])
      ]))), 128))
    ]));
  }
}), yt = {
  key: 0,
  class: "kx-notice error"
}, vt = { class: "mm-field wide" }, wt = {
  key: 0,
  class: "mm-hint"
}, It = {
  key: 2,
  class: "mm-hint"
}, $t = /* @__PURE__ */ U({
  __name: "MemoryCreate",
  setup(t) {
    const e = ge(), n = ye(), i = E(""), a = E({});
    J(() => e.value.config, (o) => {
      try {
        const l = ve(o), b = T(l.config) ? l.config.config_schema : void 0;
        if (!T(b) || b.type !== "object" || !T(b.properties) || !Object.keys(b.properties).length || Object.values(b.properties).some((S) => !T(S) || !["string", "integer", "number", "boolean"].includes(String(S.type))))
          throw new Error("Memory create schema must supply object properties");
        a.value = l, i.value = "";
      } catch (l) {
        i.value = we(l);
      }
    }, { immediate: !0 });
    const r = L(() => !!a.value.edit), u = L(() => a.value.config.config_schema), s = E("class:embed"), d = E({});
    J(a, (o) => {
      const { config_schema: l, ...b } = o.config || {};
      d.value = { ...b }, o.embedding_model && (s.value = o.embedding_model), p();
    }, { immediate: !0 });
    function p() {
      n("config-changed", { embedding_model: s.value, config: { ...d.value } });
    }
    function m(o) {
      s.value = o, p();
    }
    function f(o) {
      d.value = o, p();
    }
    return (o, l) => i.value ? (c(), h("div", yt, x(i.value), 1)) : (c(), y(gt, {
      key: 1,
      schema: u.value,
      "model-value": d.value,
      "onUpdate:modelValue": f
    }, {
      "before-models": ne(() => [
        v("div", vt, [
          l[0] || (l[0] = v("span", {
            id: "embedding_label",
            class: "mm-label"
          }, "Embedding model", -1)),
          r.value ? (c(), h("span", wt, x(s.value) + ", fixed when the memory was created.", 1)) : (c(), y(le, {
            key: 1,
            "labelled-by": "embedding_label",
            value: s.value,
            capability: "embed",
            onSelect: m
          }, null, 8, ["value"])),
          r.value ? $("", !0) : (c(), h("span", It, "Turns memories into vectors for search. It cannot change after the memory is created."))
        ])
      ]),
      _: 1
    }, 8, ["schema", "model-value"]));
  }
}), Ct = Ie($t, {
  type: "object",
  properties: {
    config: { type: "object", description: "Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }" }
  }
});
me(import.meta.url, Ct);
//# sourceMappingURL=memory_create.js.map
