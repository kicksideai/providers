import { W as Fn } from "./index-CyCydJaQ.js";
import { ref as pe, readonly as Rn, getCurrentInstance as ut, onMounted as Yt, nextTick as zn, watch as ge, reactive as Bn, renderSlot as U, openBlock as V, createBlock as Ve, Teleport as qt, createCommentVNode as ve, useId as Wn, mergeProps as P, h as Un, createElementBlock as re, createElementVNode as ye, resolveComponent as Hn, resolveDirective as Kn, Transition as Yn, withCtx as qn, normalizeClass as Gn, resolveDynamicComponent as Qn, withDirectives as Jn } from "vue";
import { loadByTagName as Zn } from "@wippy-fe/proxy";
var Xn = Object.defineProperty, dt = Object.getOwnPropertySymbols, er = Object.prototype.hasOwnProperty, tr = Object.prototype.propertyIsEnumerable, pt = (t, e, n) => e in t ? Xn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, nr = (t, e) => {
  for (var n in e || (e = {})) er.call(e, n) && pt(t, n, e[n]);
  if (dt) for (var n of dt(e)) tr.call(e, n) && pt(t, n, e[n]);
  return t;
};
function Ae(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Ke(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), o = Array.isArray(e), a, l, s;
  if (r && o) {
    if (l = t.length, l != e.length) return !1;
    for (a = l; a-- !== 0; ) if (!Ke(t[a], e[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = t instanceof Date, c = e instanceof Date;
  if (i != c) return !1;
  if (i && c) return t.getTime() == e.getTime();
  let u = t instanceof RegExp, d = e instanceof RegExp;
  if (u != d) return !1;
  if (u && d) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (l = p.length, l !== Object.keys(e).length) return !1;
  for (a = l; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[a])) return !1;
  for (a = l; a-- !== 0; ) if (s = p[a], !Ke(t[s], e[s], n)) return !1;
  return !0;
}
function rr(t, e) {
  return Ke(t, e);
}
function Be(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function k(t) {
  return !Ae(t);
}
function Ye(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (k(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (Be(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let o = 0, a = n.length; o < a; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function or(t, e, n) {
  return n ? Ye(t, n) === Ye(e, n) : rr(t, e);
}
function z(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Gt(t = {}, e = {}) {
  let n = nr({}, t);
  return Object.keys(e).forEach((r) => {
    let o = r;
    z(e[o]) && o in t && z(t[o]) ? n[o] = Gt(t[o], e[o]) : n[o] = e[o];
  }), n;
}
function ar(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : Gt(e, n), {});
}
function Ea(t, e) {
  let n = -1;
  if (k(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function E(t, ...e) {
  return Be(t) ? t(...e) : t;
}
function L(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function R(t) {
  return L(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function rt(t, e = "", n = {}) {
  let r = R(e).split("."), o = r.shift();
  if (o) {
    if (z(t)) {
      let a = Object.keys(t).find((l) => R(l) === o) || "";
      return rt(E(t[a], n), r.join("."), n);
    }
    return;
  }
  return E(t, n);
}
function Qt(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function ir(t) {
  return k(t) && !isNaN(t);
}
function Na(t = "") {
  return k(t) && t.length === 1 && !!t.match(/\S| /);
}
function oe(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function sr(...t) {
  return ar(...t);
}
function be(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function D(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function lr(t) {
  return L(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Jt(t) {
  return L(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Zt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    t.clear();
  } };
}
function ot(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") e.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [ot(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        e = a.length ? e.concat(a.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function cr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function ur(t, e) {
  if (t && e) {
    let n = (r) => {
      cr(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function We(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function qe(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Xt(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], o = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = o.width || t.offsetWidth, e.height = o.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function en() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], o = t.innerWidth || n.clientWidth || r.clientWidth, a = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: a };
}
function Ge(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function dr() {
  let t = document.documentElement;
  return (window.pageXOffset || Ge(t)) - (t.clientLeft || 0);
}
function pr() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function mr(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function Da(t, e, n = !0) {
  var r, o, a, l;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xt(t), i = s.height, c = s.width, u = e.offsetHeight, d = e.offsetWidth, p = e.getBoundingClientRect(), m = pr(), f = dr(), v = en(), h, y, w = "top";
    p.top + u + i > v.height ? (h = p.top + m - i, w = "bottom", h < 0 && (h = m)) : h = u + p.top + m, p.left + c > v.width ? y = Math.max(0, p.left + f + d - c) : y = p.left + f, mr(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = h + "px", t.style.transformOrigin = w, n && (t.style.marginTop = w === "bottom" ? `calc(${(o = (r = qe(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (l = (a = qe(/-anchor-gutter$/)) == null ? void 0 : a.value) != null ? l : "");
  }
}
function Ia(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function fr(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Va(t, e, n = !0, r = void 0) {
  var o;
  if (t) {
    let a = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xt(t), l = e.offsetHeight, s = e.getBoundingClientRect(), i = en(), c, u, d = r ?? "top";
    if (!r && s.top + l + a.height > i.height ? (c = -1 * a.height, d = "bottom", s.top + c < 0 && (c = -1 * s.top)) : c = l, a.width > i.width ? u = s.left * -1 : s.left + a.width > i.width ? u = (s.left + a.width - i.width) * -1 : u = 0, t.style.top = c + "px", t.style.insetInlineStart = u + "px", t.style.transformOrigin = d, n) {
      let p = (o = qe(/-anchor-gutter$/)) == null ? void 0 : o.value;
      t.style.marginTop = d === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function tn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function gr(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && tn(t));
}
function me(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Ma() {
  if (window.getSelection) {
    let t = window.getSelection() || {};
    t.empty ? t.empty() : t.removeAllRanges && t.rangeCount > 0 && t.getRangeAt(0).getClientRects().length > 0 && t.removeAllRanges();
  }
}
function Me(t, e = {}) {
  if (me(t)) {
    let n = (r, o) => {
      var a, l;
      let s = (a = t?.$attrs) != null && a[r] ? [(l = t?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((i, c) => {
        if (c != null) {
          let u = typeof c;
          if (u === "string" || u === "number") i.push(c);
          else if (u === "object") {
            let d = Array.isArray(c) ? n(r, c) : Object.entries(c).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            i = d.length ? i.concat(d.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, s);
    };
    Object.entries(e).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? t.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Me(t, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = o), t.setAttribute(r, o));
      }
    });
  }
}
function hr(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return Me(r, e), r.append(...n), r;
  }
}
function vr(t, e) {
  return me(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function nn(t, e) {
  return me(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function Fa(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function yr(t, e) {
  if (me(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function rn(t, e = "") {
  let n = vr(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Ra(t, e) {
  let n = rn(t, e);
  return n.length > 0 ? n[0] : null;
}
function mt(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function za(t, e) {
  let n = rn(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function br(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Ge(document.documentElement) || Ge(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function wr(t, e) {
  return t ? t.offsetHeight : 0;
}
function on(t, e = []) {
  let n = tn(t);
  return n === null ? e : on(n, e.concat([n]));
}
function Ba(t) {
  let e = [];
  if (t) {
    let n = on(t), r = /(auto|scroll)/, o = (a) => {
      try {
        let l = window.getComputedStyle(a, null);
        return r.test(l.getPropertyValue("overflow")) || r.test(l.getPropertyValue("overflowX")) || r.test(l.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let a of n) {
      let l = a.nodeType === 1 && a.dataset.scrollselectors;
      if (l) {
        let s = l.split(",");
        for (let i of s) {
          let c = nn(a, i);
          c && o(c) && e.push(c);
        }
      }
      a.nodeType !== 9 && o(a) && e.push(a);
    }
  }
  return e;
}
function Wa() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function ft(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function Ua() {
  return /(android)/i.test(navigator.userAgent);
}
function an() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ha(t) {
  return !!(t && t.offsetParent != null);
}
function Ka() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function xr(t, e = "", n) {
  me(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Ee = {};
function Sr(t = "pui_id_") {
  return Object.hasOwn(Ee, t) || (Ee[t] = 0), Ee[t]++, `${t}${Ee[t]}`;
}
var $r = Object.defineProperty, kr = Object.defineProperties, _r = Object.getOwnPropertyDescriptors, Fe = Object.getOwnPropertySymbols, sn = Object.prototype.hasOwnProperty, ln = Object.prototype.propertyIsEnumerable, gt = (t, e, n) => e in t ? $r(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, M = (t, e) => {
  for (var n in e || (e = {})) sn.call(e, n) && gt(t, n, e[n]);
  if (Fe) for (var n of Fe(e)) ln.call(e, n) && gt(t, n, e[n]);
  return t;
}, Ue = (t, e) => kr(t, _r(e)), W = (t, e) => {
  var n = {};
  for (var r in t) sn.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && Fe) for (var r of Fe(t)) e.indexOf(r) < 0 && ln.call(t, r) && (n[r] = t[r]);
  return n;
}, Tr = Zt(), j = Tr, xe = /{([^}]*)}/g, cn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, un = /var\([^)]+\)/g;
function ht(t) {
  return L(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function Or(t) {
  return z(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function Pr(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Qe(t = "", e = "") {
  return Pr(`${L(t, !1) && L(e, !1) ? `${t}-` : t}${e}`);
}
function dn(t = "", e = "") {
  return `--${Qe(t, e)}`;
}
function Cr(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function pn(t, e = "", n = "", r = [], o) {
  if (L(t)) {
    let a = t.trim();
    if (Cr(a)) return;
    if (oe(a, xe)) {
      let l = a.replaceAll(xe, (s) => {
        let i = s.replace(/{|}/g, "").split(".").filter((c) => !r.some((u) => oe(c, u)));
        return `var(${dn(n, Jt(i.join("-")))}${k(o) ? `, ${o}` : ""})`;
      });
      return oe(l.replace(un, "0"), cn) ? `calc(${l})` : l;
    }
    return a;
  } else if (ir(t)) return t;
}
function jr(t, e, n) {
  L(e, !1) && t.push(`${e}:${n};`);
}
function ue(t, e) {
  return t ? `${t}{${e}}` : "";
}
function mn(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(l, s) {
    let i = [], c = 0, u = "", d = null, p = 0;
    for (; c <= l.length; ) {
      let m = l[c];
      if ((m === '"' || m === "'" || m === "`") && l[c - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && p++, m === ")" && p--, (m === "," || c === l.length) && p === 0)) {
        let f = u.trim();
        f.startsWith("dt(") ? i.push(mn(f, s)) : i.push(r(f)), u = "", c++;
        continue;
      }
      m !== void 0 && (u += m), c++;
    }
    return i;
  }
  function r(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let o = [], a = [];
  for (let l = 0; l < t.length; l++) if (t[l] === "d" && t.slice(l, l + 3) === "dt(") a.push(l), l += 2;
  else if (t[l] === ")" && a.length > 0) {
    let s = a.pop();
    a.length === 0 && o.push([s, l]);
  }
  if (!o.length) return t;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, i] = o[l], c = t.slice(s + 3, i), u = n(c, e), d = e(...u);
    t = t.slice(0, s) + d + t.slice(i + 1);
  }
  return t;
}
var ae = (...t) => Ar(_.getTheme(), ...t), Ar = (t = {}, e, n, r) => {
  if (e) {
    let { variable: o, options: a } = _.defaults || {}, { prefix: l, transform: s } = t?.options || a || {}, i = oe(e, xe) ? e : `{${e}}`;
    return r === "value" || Ae(r) && s === "strict" ? _.getTokenValue(e) : pn(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function Ne(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, o, a) => {
      var l;
      return r + o + ((l = E(e[a], { dt: ae })) != null ? l : "");
    }, "");
    return mn(n, ae);
  }
  return E(t, { dt: ae });
}
function Lr(t, e = {}) {
  let n = _.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = e, l = [], s = [], i = [{ node: t, path: r }];
  for (; i.length; ) {
    let { node: u, path: d } = i.pop();
    for (let p in u) {
      let m = u[p], f = Or(m), v = oe(p, a) ? Qe(d) : Qe(d, Jt(p));
      if (z(f)) i.push({ node: f, path: v });
      else {
        let h = dn(v), y = pn(f, v, r, [a]);
        jr(s, h, y);
        let w = v;
        r && w.startsWith(r + "-") && (w = w.slice(r.length + 1)), l.push(w.replace(/-/g, "."));
      }
    }
  }
  let c = s.join("");
  return { value: s, tokens: l, declarations: c, css: ue(o, c) };
}
var I = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var r;
    return (r = e.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Lr(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var a, l, s, i, c, u, d;
  let { preset: p, options: m } = e, f, v, h, y, w, T, g;
  if (k(p) && m.transform !== "strict") {
    let { primitive: x, semantic: C, extend: N } = p, H = C || {}, { colorScheme: K } = H, J = W(H, ["colorScheme"]), Y = N || {}, { colorScheme: Z } = Y, X = W(Y, ["colorScheme"]), q = K || {}, { dark: ee } = q, ie = W(q, ["dark"]), te = Z || {}, { dark: se } = te, le = W(te, ["dark"]), B = k(x) ? this._toVariables({ primitive: x }, m) : {}, F = k(J) ? this._toVariables({ semantic: J }, m) : {}, ne = k(ie) ? this._toVariables({ light: ie }, m) : {}, Le = k(ee) ? this._toVariables({ dark: ee }, m) : {}, ce = k(X) ? this._toVariables({ semantic: X }, m) : {}, lt = k(le) ? this._toVariables({ light: le }, m) : {}, ct = k(se) ? this._toVariables({ dark: se }, m) : {}, [xn, Sn] = [(a = B.declarations) != null ? a : "", B.tokens], [$n, kn] = [(l = F.declarations) != null ? l : "", F.tokens || []], [_n, Tn] = [(s = ne.declarations) != null ? s : "", ne.tokens || []], [On, Pn] = [(i = Le.declarations) != null ? i : "", Le.tokens || []], [Cn, jn] = [(c = ce.declarations) != null ? c : "", ce.tokens || []], [An, Ln] = [(u = lt.declarations) != null ? u : "", lt.tokens || []], [En, Nn] = [(d = ct.declarations) != null ? d : "", ct.tokens || []];
    f = this.transformCSS(t, xn, "light", "variable", m, r, o), v = Sn;
    let Dn = this.transformCSS(t, `${$n}${_n}`, "light", "variable", m, r, o), In = this.transformCSS(t, `${On}`, "dark", "variable", m, r, o);
    h = `${Dn}${In}`, y = [.../* @__PURE__ */ new Set([...kn, ...Tn, ...Pn])];
    let Vn = this.transformCSS(t, `${Cn}${An}color-scheme:light`, "light", "variable", m, r, o), Mn = this.transformCSS(t, `${En}color-scheme:dark`, "dark", "variable", m, r, o);
    w = `${Vn}${Mn}`, T = [.../* @__PURE__ */ new Set([...jn, ...Ln, ...Nn])], g = E(p.css, { dt: ae });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: h, tokens: y }, global: { css: w, tokens: T }, style: g };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: o, defaults: a, selector: l }) {
  var s, i, c;
  let u, d, p;
  if (k(e) && n.transform !== "strict") {
    let m = t.replace("-directive", ""), f = e, { colorScheme: v, extend: h, css: y } = f, w = W(f, ["colorScheme", "extend", "css"]), T = h || {}, { colorScheme: g } = T, x = W(T, ["colorScheme"]), C = v || {}, { dark: N } = C, H = W(C, ["dark"]), K = g || {}, { dark: J } = K, Y = W(K, ["dark"]), Z = k(w) ? this._toVariables({ [m]: M(M({}, w), x) }, n) : {}, X = k(H) ? this._toVariables({ [m]: M(M({}, H), Y) }, n) : {}, q = k(N) ? this._toVariables({ [m]: M(M({}, N), J) }, n) : {}, [ee, ie] = [(s = Z.declarations) != null ? s : "", Z.tokens || []], [te, se] = [(i = X.declarations) != null ? i : "", X.tokens || []], [le, B] = [(c = q.declarations) != null ? c : "", q.tokens || []], F = this.transformCSS(m, `${ee}${te}`, "light", "variable", n, o, a, l), ne = this.transformCSS(m, le, "dark", "variable", n, o, a, l);
    u = `${F}${ne}`, d = [.../* @__PURE__ */ new Set([...ie, ...se, ...B])], p = E(y, { dt: ae });
  }
  return { css: u, tokens: d, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: l, options: s } = e, i = (a = l?.components) == null ? void 0 : a[t];
  return this.getPreset({ name: t, preset: i, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var a, l;
  let s = t.replace("-directive", ""), { preset: i, options: c } = e, u = ((a = i?.components) == null ? void 0 : a[s]) || ((l = i?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: u, options: c, params: n, set: r, defaults: o });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: o } = e;
  return o ? `@layer ${E(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let l = this.getCommon({ name: t, theme: e, params: n, set: o, defaults: a }), s = Object.entries(r).reduce((i, [c, u]) => i.push(`${c}="${u}"`) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [c, u]) => {
    if (z(u) && Object.hasOwn(u, "css")) {
      let d = be(u.css), p = `${c}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${d}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var l;
  let s = { name: t, theme: e, params: n, set: o, defaults: a }, i = (l = t.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, c = Object.entries(r).reduce((u, [d, p]) => u.push(`${d}="${p}"`) && u, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${c}>${be(i)}</style>` : "";
}, createTokens(t = {}, e, n = "", r = "", o = {}) {
  let a = function(s, i = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: i, value: void 0 };
    c.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let u = this.value;
    if (typeof this.value == "string" && xe.test(this.value)) {
      let d = this.value.trim().replace(xe, (p) => {
        var m;
        let f = p.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let h = v.computed(s, i, c);
        return Array.isArray(h) && h.length === 2 ? `light-dark(${h[0].value},${h[1].value})` : (m = h?.value) != null ? m : "__UNRESOLVED__";
      });
      u = cn.test(d.replace(un, "0")) ? `calc(${d})` : d;
    }
    return Ae(i.binding) && delete i.binding, c.pop(), { colorScheme: s, path: this.path, paths: i, value: u.includes("__UNRESOLVED__") ? void 0 : u };
  }, l = (s, i, c) => {
    Object.entries(s).forEach(([u, d]) => {
      let p = oe(u, e.variable.excludedKeyRegex) ? i : i ? `${i}.${ht(u)}` : ht(u), m = c ? `${c}.${u}` : u;
      z(d) ? l(d, p, m) : (o[p] || (o[p] = { paths: [], computed: (f, v = {}, h = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, v.binding, h);
        if (f && f !== "none") for (let y = 0; y < o[p].paths.length; y++) {
          let w = o[p].paths[y];
          if (w.scheme === f) return w.computed(f, v.binding, h);
        }
        return o[p].paths.map((y) => y.computed(y.scheme, v[y.scheme], h));
      } }), o[p].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return l(t, n, r), o;
}, getTokenValue(t, e, n) {
  var r;
  let o = ((s) => s.split(".").filter((i) => !oe(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), a = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = t[o]) == null ? void 0 : r.computed(a)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, i) => {
    let c = i, { colorScheme: u } = c, d = W(c, ["colorScheme"]);
    return s[u] = d, s;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? ue(k(e) ? `${t}${e},${t} ${e}` : t, r) : ue(t, ue(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, o = {}, a, l, s) {
  if (k(e)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let c = this.getColorSchemeOption(o, l);
      e = n === "dark" ? c.reduce((u, { type: d, selector: p }) => (k(p) && (u += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, s, d, e)), u), "") : ue(s ?? ":root,:host", e);
    }
    if (i) {
      let c = { name: "primeui" };
      z(i) && (c.name = E(i.name, { name: t, type: r })), k(c.name) && (e = ue(`@layer ${c.name}`, e), a?.layerNames(c.name));
    }
    return e;
  }
  return "";
} }, _ = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Ue(M({}, e), { options: M(M({}, this.defaults.options), e.options) }), this._tokens = I.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), j.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Ue(M({}, this.theme), { preset: t }), this._tokens = I.createTokens(t, this.defaults), this.clearLoadedStyleNames(), j.emit("preset:change", t), j.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Ue(M({}, this.theme), { options: t }), this.clearLoadedStyleNames(), j.emit("options:change", t), j.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return I.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return I.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let o = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPreset(o);
}, getLayerOrderCSS(t = "") {
  return I.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return I.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return I.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return I.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), j.emit(`theme:${e}:load`, t), !this._loadingStyles.size && j.emit("theme:load"));
} }, A = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function vt(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Er(t)) || e) {
      n && (t = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, l = !0, s = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var c = n.next();
    return l = c.done, c;
  }, e: function(c) {
    s = !0, a = c;
  }, f: function() {
    try {
      l || n.return == null || n.return();
    } finally {
      if (s) throw a;
    }
  } };
}
function Er(t, e) {
  if (t) {
    if (typeof t == "string") return yt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yt(t, e) : void 0;
  }
}
function yt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Ya = {
  filter: function(e, n, r, o, a) {
    var l = [];
    if (!e)
      return l;
    var s = vt(e), i;
    try {
      for (s.s(); !(i = s.n()).done; ) {
        var c = i.value;
        if (typeof c == "string") {
          if (this.filters[o](c, r, a)) {
            l.push(c);
            continue;
          }
        } else {
          var u = vt(n), d;
          try {
            for (u.s(); !(d = u.n()).done; ) {
              var p = d.value, m = Ye(c, p);
              if (this.filters[o](m, r, a)) {
                l.push(c);
                break;
              }
            }
          } catch (f) {
            u.e(f);
          } finally {
            u.f();
          }
        }
      }
    } catch (f) {
      s.e(f);
    } finally {
      s.f();
    }
    return l;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = D(n.toString()).toLocaleLowerCase(r), a = D(e.toString()).toLocaleLowerCase(r);
      return a.slice(0, o.length) === o;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = D(n.toString()).toLocaleLowerCase(r), a = D(e.toString()).toLocaleLowerCase(r);
      return a.indexOf(o) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = D(n.toString()).toLocaleLowerCase(r), a = D(e.toString()).toLocaleLowerCase(r);
      return a.indexOf(o) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = D(n.toString()).toLocaleLowerCase(r), a = D(e.toString()).toLocaleLowerCase(r);
      return a.indexOf(o, a.length - o.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : D(e.toString()).toLocaleLowerCase(r) == D(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : D(e.toString()).toLocaleLowerCase(r) != D(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (or(e, n[r]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
}, Nr = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function Se(t) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Se(t);
}
function bt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function wt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? bt(Object(n), !0).forEach(function(r) {
      Dr(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : bt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Dr(t, e, n) {
  return (e = Ir(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ir(t) {
  var e = Vr(t, "string");
  return Se(e) == "symbol" ? e : e + "";
}
function Vr(t, e) {
  if (Se(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Mr(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  ut() && ut().components ? Yt(t) : e ? t() : zn(t);
}
var Fr = 0;
function Rr(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = pe(!1), r = pe(t), o = pe(null), a = an() ? window.document : void 0, l = e.document, s = l === void 0 ? a : l, i = e.immediate, c = i === void 0 ? !0 : i, u = e.manual, d = u === void 0 ? !1 : u, p = e.name, m = p === void 0 ? "style_".concat(++Fr) : p, f = e.id, v = f === void 0 ? void 0 : f, h = e.media, y = h === void 0 ? void 0 : h, w = e.nonce, T = w === void 0 ? void 0 : w, g = e.first, x = g === void 0 ? !1 : g, C = e.onMounted, N = C === void 0 ? void 0 : C, H = e.onUpdated, K = H === void 0 ? void 0 : H, J = e.onLoad, Y = J === void 0 ? void 0 : J, Z = e.props, X = Z === void 0 ? {} : Z, q = function() {
  }, ee = function(se) {
    var le = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var B = wt(wt({}, X), le), F = B.name || m, ne = B.id || v, Le = B.nonce || T;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(F, '"]')) || s.getElementById(ne) || s.createElement("style"), o.value.isConnected || (r.value = se || t, Me(o.value, {
        type: "text/css",
        id: ne,
        media: y,
        nonce: Le
      }), x ? s.head.prepend(o.value) : s.head.appendChild(o.value), xr(o.value, "data-primevue-style-id", F), Me(o.value, B), o.value.onload = function(ce) {
        return Y?.(ce, {
          name: F
        });
      }, N?.(F)), !n.value && (q = ge(r, function(ce) {
        o.value.textContent = ce, K?.(F);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ie = function() {
    !s || !n.value || (q(), gr(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return c && !d && Mr(ee), {
    id: v,
    name: m,
    el: o,
    css: r,
    unload: ie,
    load: ee,
    isLoaded: Rn(n)
  };
}
function $e(t) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, $e(t);
}
var xt, St, $t, kt;
function _t(t, e) {
  return Ur(t) || Wr(t, e) || Br(t, e) || zr();
}
function zr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Br(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Wr(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(t)).next, e !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== e); i = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function Ur(t) {
  if (Array.isArray(t)) return t;
}
function Ot(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function He(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Hr(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Hr(t, e, n) {
  return (e = Kr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Kr(t) {
  var e = Yr(t, "string");
  return $e(e) == "symbol" ? e : e + "";
}
function Yr(t, e) {
  if ($e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function De(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var qr = function(e) {
  var n = e.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, Gr = {}, Qr = {}, O = {
  name: "base",
  css: qr,
  style: Nr,
  classes: Gr,
  inlineStyles: Qr,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(Ne(xt || (xt = De(["", ""])), e));
    return k(o) ? Rr(be(o), He({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return _.transformCSS(n.name || e.name, "".concat(o).concat(Ne(St || (St = De(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return _.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return _.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return _.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return _.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return _.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = E(this.css, {
        dt: ae
      }) || "", o = be(Ne($t || ($t = De(["", "", ""])), r, e)), a = Object.entries(n).reduce(function(l, s) {
        var i = _t(s, 2), c = i[0], u = i[1];
        return l.push("".concat(c, '="').concat(u, '"')) && l;
      }, []).join(" ");
      return k(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return _.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [_.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = Ne(kt || (kt = De(["", ""])), E(this.style, {
        dt: ae
      })), l = be(_.transformCSS(o, a)), s = Object.entries(n).reduce(function(i, c) {
        var u = _t(c, 2), d = u[0], p = u[1];
        return i.push("".concat(d, '="').concat(p, '"')) && i;
      }, []).join(" ");
      k(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return He(He({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, Q = Zt();
function ke(t) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ke(t);
}
function Pt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ie(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Pt(Object(n), !0).forEach(function(r) {
      Jr(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Pt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Jr(t, e, n) {
  return (e = Zr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Zr(t) {
  var e = Xr(t, "string");
  return ke(e) == "symbol" ? e : e + "";
}
function Xr(t, e) {
  if (ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ke(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var eo = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [A.STARTS_WITH, A.CONTAINS, A.NOT_CONTAINS, A.ENDS_WITH, A.EQUALS, A.NOT_EQUALS],
    numeric: [A.EQUALS, A.NOT_EQUALS, A.LESS_THAN, A.LESS_THAN_OR_EQUAL_TO, A.GREATER_THAN, A.GREATER_THAN_OR_EQUAL_TO],
    date: [A.DATE_IS, A.DATE_IS_NOT, A.DATE_BEFORE, A.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, to = Symbol();
function no(t, e) {
  var n = {
    config: Bn(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(to, n), ro(), oo(t, n), n;
}
var de = [];
function ro() {
  j.clear(), de.forEach(function(t) {
    return t?.();
  }), de = [];
}
function oo(t, e) {
  var n = pe(!1), r = function() {
    var c;
    if (((c = e.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !_.isStyleNameLoaded("common")) {
      var u, d, p = ((u = O.getCommonTheme) === null || u === void 0 ? void 0 : u.call(O)) || {}, m = p.primitive, f = p.semantic, v = p.global, h = p.style, y = {
        nonce: (d = e.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      O.load(m?.css, Ie({
        name: "primitive-variables"
      }, y)), O.load(f?.css, Ie({
        name: "semantic-variables"
      }, y)), O.load(v?.css, Ie({
        name: "global-variables"
      }, y)), O.loadStyle(Ie({
        name: "global-style"
      }, y), h), _.setLoadedStyleName("common");
    }
  };
  j.on("theme:change", function(i) {
    n.value || (t.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ge(e.config, function(i, c) {
    Q.emit("config:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ge(function() {
    return e.config.ripple;
  }, function(i, c) {
    Q.emit("config:ripple:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = ge(function() {
    return e.config.theme;
  }, function(i, c) {
    n.value || _.setTheme(i), e.config.unstyled || r(), n.value = !1, Q.emit("config:theme:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ge(function() {
    return e.config.unstyled;
  }, function(i, c) {
    !i && e.config.theme && r(), Q.emit("config:unstyled:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  de.push(o), de.push(a), de.push(l), de.push(s);
}
var ao = {
  install: function(e, n) {
    var r = sr(eo, n);
    no(e, r);
  }
}, fn = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = an();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function io(t, e, n, r, o, a) {
  return a.inline ? U(t.$slots, "default", {
    key: 0
  }) : o.mounted ? (V(), Ve(qt, {
    key: 1,
    to: n.appendTo
  }, [U(t.$slots, "default")], 8, ["to"])) : ve("", !0);
}
fn.render = io;
var G = {
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
function so() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Wn();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var Ct = O.extend({
  name: "common"
});
function _e(t) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, _e(t);
}
function lo(t) {
  return vn(t) || co(t) || hn(t) || gn();
}
function co(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fe(t, e) {
  return vn(t) || uo(t, e) || hn(t, e) || gn();
}
function gn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hn(t, e) {
  if (t) {
    if (typeof t == "string") return Je(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Je(t, e) : void 0;
  }
}
function Je(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function uo(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== e); i = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function vn(t) {
  if (Array.isArray(t)) return t;
}
function jt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function S(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? jt(Object(n), !0).forEach(function(r) {
      he(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : jt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function he(t, e, n) {
  return (e = po(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function po(t) {
  var e = mo(t, "string");
  return _e(e) == "symbol" ? e : e + "";
}
function mo(t, e) {
  if (_e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var at = {
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
        j.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        j.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, r, o, a, l, s, i, c, u, d, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var v = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, h = v ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (u = y || h) === null || u === void 0 || (u = u[this.$.type.name]) === null || u === void 0 || (u = u.hooks) === null || u === void 0 || (d = u.onBeforeCreate) === null || d === void 0 || d.call(u), this.$attrSelector = so(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = nn(me(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = S({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), r?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Be(e) ? e.apply(void 0, r) : P.apply(void 0, r);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !G.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ct.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      k(e) && O.load(e, S({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!_.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = a.primitive, s = a.semantic, i = a.global, c = a.style;
          O.load(l?.css, S({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(s?.css, S({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(i?.css, S({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle(S({
            name: "global-style"
          }, this.$styleOptions), c), _.setLoadedStyleName("common");
        }
        if (!_.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var u, d, p, m, f = ((u = this.$style) === null || u === void 0 || (d = u.getComponentTheme) === null || d === void 0 ? void 0 : d.call(u)) || {}, v = f.css, h = f.style;
          (p = this.$style) === null || p === void 0 || p.load(v, S({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(S({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), h), _.setLoadedStyleName(this.$style.name);
        }
        if (!_.isStyleNameLoaded("layer-order")) {
          var y, w, T = (y = this.$style) === null || y === void 0 || (w = y.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(y);
          O.load(T, S({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), _.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, S({
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
      G.clearLoadedStyleNames(), j.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      j.off("theme:change", this._loadCoreStyles), j.off("theme:change", this._load), j.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return rt(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, i = s.mergeSections, c = i === void 0 ? !0 : i, u = s.mergeProps, d = u === void 0 ? !1 : u, p = a ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, S(S({}, o), {}, {
        global: p || {}
      })), f = this._getPTDatasets(r);
      return c || !c && m ? d ? this._mergeProps(d, p, m, f) : S(S(S({}, p), m), f) : S(S({}, m), f);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return P(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && k((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && S(S({}, r === "root" && S(S(he({}, "".concat(o, "name"), R(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && he({}, "".concat(o, "extend"), R(this.$.type.name))), {}, he({}, "".concat(this.$attrSelector), ""))), {}, he({}, "".concat(o, "section"), R(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return L(e) || Qt(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var i, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, u = o ? o(s) : s, d = R(r), p = R(n.$name);
        return (i = c ? d !== p ? u?.[d] : void 0 : u?.[d]) !== null && i !== void 0 ? i : u;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: a(e.originalValue),
        value: a(e.value)
      } : a(e, !0);
    },
    _usePT: function(e, n, r, o) {
      var a = function(v) {
        return n(v, r, o);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, s = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = s.mergeSections, c = i === void 0 ? !0 : i, u = s.mergeProps, d = u === void 0 ? !1 : u, p = a(e.originalValue), m = a(e.value);
        return p === void 0 && m === void 0 ? void 0 : L(m) ? m : L(p) ? p : c || !c && m ? d ? this._mergeProps(d, p, m) : S(S({}, p), m) : m;
      }
      return a(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, S(S({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = P(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((e = o.id) !== null && e !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, S({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, S(S({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, e, S(S({}, this.$params), r)), a = this._getOptionValue(Ct.inlineStyles, e, S(S({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return E(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, S({}, n.$params)) || E(r, S({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = fe(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return S(S({
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
        var n = fe(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = fe(n, 2), o = r[0], a = r[1], l = o.split(":"), s = lo(l), i = Je(s).slice(1);
        return i?.reduce(function(c, u, d, p) {
          return !c[u] && (c[u] = d === p.length - 1 ? a : {}), c[u];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = fe(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = fe(n, 2), o = r[0], a = r[1];
        return e[o] = a, e;
      }, {});
    }
  }
}, fo = `
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
`, go = O.extend({
  name: "baseicon",
  css: fo
});
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function At(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Lt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? At(Object(n), !0).forEach(function(r) {
      ho(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : At(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ho(t, e, n) {
  return (e = vo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function vo(t) {
  var e = yo(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function yo(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var bo = {
  name: "BaseIcon",
  extends: at,
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
  style: go,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Ae(this.label);
      return Lt(Lt({}, !this.isUnstyled && {
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
function Oe(t) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Oe(t);
}
function Et(t, e) {
  return $o(t) || So(t, e) || xo(t, e) || wo();
}
function wo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xo(t, e) {
  if (t) {
    if (typeof t == "string") return Nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(t, e) : void 0;
  }
}
function Nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function So(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(t)).next, e !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== e); i = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function $o(t) {
  if (Array.isArray(t)) return t;
}
function Dt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function $(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Dt(Object(n), !0).forEach(function(r) {
      Ze(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Dt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ze(t, e, n) {
  return (e = ko(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ko(t) {
  var e = _o(t, "string");
  return Oe(e) == "symbol" ? e : e + "";
}
function _o(t, e) {
  if (Oe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Oe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var b = {
  _getMeta: function() {
    return [z(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], E(z(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, o, a;
    return (r = (e == null || (o = e.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: rt,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var w = b._getOptionValue.apply(b, arguments);
      return L(w) || Qt(w) ? {
        class: w
      } : w;
    }, c = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, u = c.mergeSections, d = u === void 0 ? !0 : u, p = c.mergeProps, m = p === void 0 ? !1 : p, f = s ? b._useDefaultPT(r, r.defaultPT(), i, a, l) : void 0, v = b._usePT(r, b._getPT(o, r.$name), i, a, $($({}, l), {}, {
      global: f || {}
    })), h = b._getPTDatasets(r, a);
    return d || !d && v ? m ? b._mergeProps(r, m, f, v, h) : $($($({}, f), v), h) : $($({}, v), h);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return $($({}, n === "root" && Ze({}, "".concat(r, "name"), R(e.$name))), {}, Ze({}, "".concat(r, "section"), R(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, i = r ? r(l) : l, c = R(n);
      return (s = i?.[c]) !== null && s !== void 0 ? s : i;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: o(e.originalValue),
      value: o(e.value)
    } : o(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(h) {
      return r(h, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, i = n._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, c = i.mergeSections, u = c === void 0 ? !0 : c, d = i.mergeProps, p = d === void 0 ? !1 : d, m = l(n.originalValue), f = l(n.value);
      return m === void 0 && f === void 0 ? void 0 : L(f) ? f : L(m) ? m : u || !u && f ? p ? b._mergeProps(e, p, m, f) : $($({}, m), f) : f;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(e, n, r, o, a);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = b._getConfig(r, o), l = {
      nonce: a == null || (e = a.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    b._loadCoreStyles(n, l), b._loadThemeStyles(n, l), b._loadScopedThemeStyles(n, l), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, l);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      O.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), G.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (e = o.theme) === null || e === void 0 ? void 0 : e.call(o)) === "none")) {
      if (!_.isStyleNameLoaded("common")) {
        var l, s, i = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, c = i.primitive, u = i.semantic, d = i.global, p = i.style;
        O.load(c?.css, $({
          name: "primitive-variables"
        }, a)), O.load(u?.css, $({
          name: "semantic-variables"
        }, a)), O.load(d?.css, $({
          name: "global-variables"
        }, a)), O.loadStyle($({
          name: "global-style"
        }, a), p), _.setLoadedStyleName("common");
      }
      if (!_.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, f, v, h, y = ((m = o.$style) === null || m === void 0 || (f = m.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(m)) || {}, w = y.css, T = y.style;
        (v = o.$style) === null || v === void 0 || v.load(w, $({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (h = o.$style) === null || h === void 0 || h.loadStyle($({
          name: "".concat(o.$style.name, "-style")
        }, a), T), _.setLoadedStyleName(o.$style.name);
      }
      if (!_.isStyleNameLoaded("layer-order")) {
        var g, x, C = (g = o.$style) === null || g === void 0 || (x = g.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(g);
        O.load(C, $({
          name: "layer-order",
          first: !0
        }, a)), _.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var o, a, l, s = ((o = e.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(e.$attrSelector, "]"))) || {}, i = s.css, c = (l = e.$style) === null || l === void 0 ? void 0 : l.load(i, $({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), j.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    j.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, o, a, l) {
    var s, i, c = "on".concat(lr(n)), u = b._getConfig(o, a), d = r?.$instance, p = b._usePT(d, b._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, e), b._getOptionValue, "hooks.".concat(c)), m = b._useDefaultPT(d, u == null || (i = u.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[e], b._getOptionValue, "hooks.".concat(c)), f = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: l
    };
    p?.(d, f), m?.(d, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Be(e) ? e.apply(void 0, r) : P.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, i, c, u, d) {
      var p, m, f, v;
      i._$instances = i._$instances || {};
      var h = b._getConfig(c, u), y = i._$instances[e] || {}, w = Ae(y) ? $($({}, n), n?.methods) : {};
      i._$instances[e] = $($({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: y.$el || i || void 0,
        $style: $({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: h,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(h?.pt, void 0, function(g) {
            var x;
            return g == null || (x = g.directives) === null || x === void 0 ? void 0 : x[e];
          });
        },
        isUnstyled: function() {
          var g, x;
          return ((g = i._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (x = i._$instances[e]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.unstyled : h?.unstyled;
        },
        theme: function() {
          var g;
          return (g = i._$instances[e]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = i._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(i._$instances[e], (g = i._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, x, $({}, C));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", C = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(i._$instances[e], g, x, C, !1);
        },
        cx: function() {
          var g, x, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = i._$instances[e]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : b._getOptionValue((x = i._$instances[e]) === null || x === void 0 || (x = x.$style) === null || x === void 0 ? void 0 : x.classes, C, $({}, N));
        },
        sx: function() {
          var g, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, N = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return C ? b._getOptionValue((g = i._$instances[e]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, x, $({}, N)) : void 0;
        }
      }, w), i.$instance = i._$instances[e], (m = (f = i.$instance)[s]) === null || m === void 0 || m.call(f, i, c, u, d), i["$".concat(e)] = i.$instance, b._hook(e, s, i, c, u, d), i.$pd || (i.$pd = {}), i.$pd[e] = $($({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: i._$instances[e]
      });
    }, o = function(s) {
      var i, c, u, d = s._$instances[e], p = d?.watch, m = function(h) {
        var y, w = h.newValue, T = h.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(d, w, T);
      }, f = function(h) {
        var y, w = h.newValue, T = h.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, w, T);
      };
      d.$watchersCallback = {
        config: m,
        "config.ripple": f
      }, p == null || (i = p.config) === null || i === void 0 || i.call(d, d?.$primevueConfig), Q.on("config:change", m), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(d, d == null || (u = d.$primevueConfig) === null || u === void 0 ? void 0 : u.ripple), Q.on("config:ripple:change", f);
    }, a = function(s) {
      var i = s._$instances[e].$watchersCallback;
      i && (Q.off("config:change", i.config), Q.off("config:ripple:change", i["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, i, c, u) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: Sr("pd")
        }, r("created", s, i, c, u);
      },
      beforeMount: function(s, i, c, u) {
        var d;
        b._loadStyles((d = s.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, c), r("beforeMount", s, i, c, u), o(s);
      },
      mounted: function(s, i, c, u) {
        var d;
        b._loadStyles((d = s.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, c), r("mounted", s, i, c, u);
      },
      beforeUpdate: function(s, i, c, u) {
        r("beforeUpdate", s, i, c, u);
      },
      updated: function(s, i, c, u) {
        var d;
        b._loadStyles((d = s.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, c), r("updated", s, i, c, u);
      },
      beforeUnmount: function(s, i, c, u) {
        var d;
        a(s), b._removeThemeListeners((d = s.$pd[e]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", s, i, c, u);
      },
      unmounted: function(s, i, c, u) {
        var d;
        (d = s.$pd[e]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", s, i, c, u);
      }
    };
  },
  extend: function() {
    var e = b._getMeta.apply(b, arguments), n = Et(e, 2), r = n[0], o = n[1];
    return $({
      extend: function() {
        var l = b._getMeta.apply(b, arguments), s = Et(l, 2), i = s[0], c = s[1];
        return b.extend(i, $($($({}, o), o?.methods), c));
      }
    }, b._extend(r, o));
  }
}, To = `
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
`, Oo = {
  root: "p-ink"
}, Po = O.extend({
  name: "ripple-directive",
  style: To,
  classes: Oo
}), Co = b.extend({
  style: Po
});
function Pe(t) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Pe(t);
}
function jo(t) {
  return No(t) || Eo(t) || Lo(t) || Ao();
}
function Ao() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Lo(t, e) {
  if (t) {
    if (typeof t == "string") return Xe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(t, e) : void 0;
  }
}
function Eo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function No(t) {
  if (Array.isArray(t)) return Xe(t);
}
function Xe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function It(t, e, n) {
  return (e = Do(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Do(t) {
  var e = Io(t, "string");
  return Pe(e) == "symbol" ? e : e + "";
}
function Io(t, e) {
  if (Pe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Pe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Vo = Co.extend("ripple", {
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
      var n = this.getInk(e);
      n || (n = hr("span", It(It({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, r = e.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && We(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !mt(o) && !ft(o)) {
          var a = Math.max(fr(r), wr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var l = br(r), s = e.pageX - l.left + document.body.scrollTop - ft(o) / 2, i = e.pageY - l.top + document.body.scrollLeft - mt(o) / 2;
        o.style.top = i + "px", o.style.left = s + "px", !this.isUnstyled() && ur(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && We(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && We(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? jo(e.children).find(function(n) {
        return yr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Mo = "data-wippy-overlay-layer";
function yn() {
  return typeof window < "u" && typeof window.document < "u";
}
function bn() {
  return yn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Fo() {
  return bn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Ro = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let zo = 0;
const Re = /* @__PURE__ */ new WeakMap();
function Vt(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Bo(t, e) {
  if (!Ro.test(t.className))
    return;
  const n = t.style.cssText;
  Vt(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!Re.has(t)) {
    const r = new MutationObserver(() => {
      const o = t.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Vt(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), Re.set(t, r);
  }
}
function it(t) {
  const e = Re.get(t);
  e && (e.disconnect(), Re.delete(t));
}
function Wo(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function et(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const ze = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new WeakMap();
let Mt = !1, tt = !1;
function Uo() {
  tt = !1;
  for (const t of ze) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && it(e);
      ze.delete(t), st.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && et(t);
  }
}
function Ft() {
  tt || (tt = !0, requestAnimationFrame(Uo));
}
function Ho(t) {
  const e = document.createElement("div");
  e.setAttribute(Mo, "");
  const n = bn();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  et(e);
  const r = new MutationObserver((o) => {
    const a = e.__wippyAnchorName;
    for (const l of o) {
      if (a)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && Bo(s, a);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && it(s);
    }
    e.isConnected && e.childElementCount > 0 && et(e);
  });
  return r.observe(e, { childList: !0 }), st.set(e, r), ze.add(e), Mt || (Mt = !0, window.addEventListener("scroll", Ft, { capture: !0, passive: !0 }), window.addEventListener("resize", Ft, { passive: !0 })), e;
}
function Rt(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Ho(t.hostRoot), Fo())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++zo}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function zt(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && it(e);
    ze.delete(t.layer), st.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Bt = !1;
function Ko() {
  if (Bt)
    return;
  Bt = !0;
  const t = fn;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    yn() && (this.hostRoot = Wo(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Rt(this), this.$watch("inline", (e) => {
      e ? zt(this) : Rt(this);
    })));
  }, t.render = function() {
    return this.inline ? U(this.$slots, "default", { key: 0 }) : this.mounted ? Un(qt, { key: 1, to: this.resolvedTarget || document.body }, [
      U(this.$slots, "default")
    ]) : ve("", !0);
  }, t.unmounted = function() {
    zt(this);
  };
}
const Yo = {
  install: (t) => {
    Ko(), t.use(ao, { theme: "none" });
  }
}, qo = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.mm-stack{display:grid;gap:14px;align-content:start}.mm-field{display:grid;gap:6px}.mm-label{font-weight:600}.mm-hint{color:var(--p-text-muted-color);font-size:12px}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}.mm-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.mm-confirm{margin-top:8px}.mm-page{height:100%;min-height:0;overflow-y:auto;padding:12px 24px 32px}.mm-error{margin:14px 0}.mm-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0}.mm-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:start}.mm-split.solo{grid-template-columns:minmax(0,1fr)}.mm-split>.mm-panel+.mm-panel{position:sticky;top:0}@media(max-width:860px){.mm-split{grid-template-columns:1fr}.mm-split>.mm-panel+.mm-panel{position:static}}.mm-panel{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);overflow:hidden}.mm-panel-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--p-content-border-color);font-weight:700}.mm-panel-b{padding:14px;display:grid;gap:10px}.mm-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;padding:11px 14px;border:none;border-bottom:1px solid var(--p-content-border-color);background:transparent;color:inherit;font:inherit;text-align:left}.mm-row:last-child{border-bottom:none}button.mm-row{cursor:pointer}button.mm-row:hover{background:var(--kx-overlay-hover)}.mm-row.on{background:var(--kx-wash-primary)}.mm-row-t{font-weight:600;overflow-wrap:anywhere}.mm-row-s{color:var(--p-text-muted-color);font-size:12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:3px}.mm-row-err{color:var(--p-danger-600, var(--p-danger-500))}.mm-dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 12px;margin:0;font-size:12.5px}.mm-dl dt{color:var(--p-text-muted-color)}.mm-dl dd{margin:0;overflow-wrap:anywhere}.mm-h{font-size:12px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:4px 0 0}.mm-version{display:flex;gap:8px;align-items:baseline;font-size:12.5px}.mm-version.past{color:var(--p-text-muted-color)}.mm-conflict{display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--p-content-border-color)}.mm-conflict:last-child{border-bottom:none}.mm-option{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10)}';
function qa(t, e) {
  return class extends Fn {
    static get wippyConfig() {
      return { propsSchema: e, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: qo };
    }
    static get vueConfig() {
      return { rootComponent: t, plugins: [Yo] };
    }
  };
}
var wn = {
  name: "TimesIcon",
  extends: bo
};
function Go(t) {
  return Xo(t) || Zo(t) || Jo(t) || Qo();
}
function Qo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jo(t, e) {
  if (t) {
    if (typeof t == "string") return nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(t, e) : void 0;
  }
}
function Zo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Xo(t) {
  if (Array.isArray(t)) return nt(t);
}
function nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ea(t, e, n, r, o, a) {
  return V(), re("svg", P({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Go(e[0] || (e[0] = [ye("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wn.render = ea;
var ta = {
  name: "BaseEditableHolder",
  extends: at,
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, e)) || {};
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
      var r, o;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (r = (o = this.formField).onChange) === null || r === void 0 || r.call(o, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
        n[r] = arguments[r];
      return n.find(k);
    }
  },
  computed: {
    $filled: function() {
      return k(this.d_value);
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
}, na = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, ra = {
  root: {
    position: "relative"
  }
}, oa = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, aa = O.extend({
  name: "toggleswitch",
  style: na,
  classes: oa,
  inlineStyles: ra
}), ia = {
  name: "BaseToggleSwitch",
  extends: ta,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
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
    }
  },
  style: aa,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, sa = {
  name: "ToggleSwitch",
  extends: ia,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return ot({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, la = ["data-p-checked", "data-p-disabled", "data-p"], ca = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], ua = ["data-p"], da = ["data-p"];
function pa(t, e, n, r, o, a) {
  return V(), re("div", P({
    class: t.cx("root"),
    style: t.sx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": t.disabled,
    "data-p": a.dataP
  }), [ye("input", P({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: a.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": a.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    })
  }, a.getPTOptions("input")), null, 16, ca), ye("div", P({
    class: t.cx("slider")
  }, a.getPTOptions("slider"), {
    "data-p": a.dataP
  }), [ye("div", P({
    class: t.cx("handle")
  }, a.getPTOptions("handle"), {
    "data-p": a.dataP
  }), [U(t.$slots, "handle", {
    checked: a.checked
  })], 16, da)], 16, ua)], 16, la);
}
sa.render = pa;
var ma = `
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
`, fa = {
  root: function(e) {
    var n = e.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, ga = O.extend({
  name: "message",
  style: ma,
  classes: fa
}), ha = {
  name: "BaseMessage",
  extends: at,
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
  style: ga,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Ce(t) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ce(t);
}
function Wt(t, e, n) {
  return (e = va(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function va(t) {
  var e = ya(t, "string");
  return Ce(e) == "symbol" ? e : e + "";
}
function ya(t, e) {
  if (Ce(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ba = {
  name: "Message",
  extends: ha,
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
      return ot(Wt(Wt({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Vo
  },
  components: {
    TimesIcon: wn
  }
};
function je(t) {
  "@babel/helpers - typeof";
  return je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, je(t);
}
function Ut(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ht(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ut(Object(n), !0).forEach(function(r) {
      wa(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ut(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function wa(t, e, n) {
  return (e = xa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function xa(t) {
  var e = Sa(t, "string");
  return je(e) == "symbol" ? e : e + "";
}
function Sa(t, e) {
  if (je(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var $a = ["data-p"], ka = ["data-p"], _a = ["data-p"], Ta = ["aria-label", "data-p"], Oa = ["data-p"];
function Pa(t, e, n, r, o, a) {
  var l = Hn("TimesIcon"), s = Kn("ripple");
  return V(), Ve(Yn, P({
    name: "p-message",
    appear: ""
  }, t.ptmi("transition")), {
    default: qn(function() {
      return [o.visible ? (V(), re("div", P({
        key: 0,
        class: t.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, t.ptm("root")), [ye("div", P({
        class: t.cx("contentWrapper")
      }, t.ptm("contentWrapper")), [t.$slots.container ? U(t.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (V(), re("div", P({
        key: 1,
        class: t.cx("content"),
        "data-p": a.dataP
      }, t.ptm("content")), [U(t.$slots, "icon", {
        class: Gn(t.cx("icon"))
      }, function() {
        return [(V(), Ve(Qn(t.icon ? "span" : null), P({
          class: [t.cx("icon"), t.icon],
          "data-p": a.dataP
        }, t.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), t.$slots.default ? (V(), re("div", P({
        key: 0,
        class: t.cx("text"),
        "data-p": a.dataP
      }, t.ptm("text")), [U(t.$slots, "default")], 16, _a)) : ve("", !0), t.closable ? Jn((V(), re("button", P({
        key: 1,
        class: t.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: e[0] || (e[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, Ht(Ht({}, t.closeButtonProps), t.ptm("closeButton"))), [U(t.$slots, "closeicon", {}, function() {
        return [t.closeIcon ? (V(), re("i", P({
          key: 0,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": a.dataP
        }, t.ptm("closeIcon")), null, 16, Oa)) : (V(), Ve(l, P({
          key: 1,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": a.dataP
        }, t.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ta)), [[s]]) : ve("", !0)], 16, ka))], 16)], 16, $a)) : ve("", !0)];
    }),
    _: 3
  }, 16);
}
ba.render = Pa;
const Kt = {
  identity: "Identity",
  rule: "Rule",
  profile_slot: "Profile",
  fact: "Fact",
  preference: "Preference",
  skill: "Skill",
  lesson: "Lesson"
};
function we(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Ca(t) {
  if (we(t)) {
    const e = t.response;
    if (we(e) && we(e.data) && typeof e.data.error == "string") return e.data.error;
    if (typeof t.message == "string") return t.message;
  }
  return String(t);
}
function Ga(t = Object.keys(Kt)) {
  return t.map((e) => ({ value: e, label: Kt[e] }));
}
function Qa(t) {
  return t instanceof CustomEvent && we(t.detail) ? t.detail : {};
}
function Ja(t) {
  if (typeof t == "string")
    try {
      t = JSON.parse(t);
    } catch {
      return {};
    }
  return we(t) ? t : {};
}
function Za(t) {
  const e = pe(!!customElements.get(t)), n = pe("");
  return Yt(async () => {
    if (!e.value)
      try {
        await Zn(t, { timeoutMs: 8e3 }), e.value = !0;
      } catch (r) {
        n.value = Ca(r);
      }
  }), { ready: e, failed: n };
}
export {
  Ua as $,
  Ba as A,
  O as B,
  wr as C,
  Da as D,
  Ga as E,
  Ya as F,
  Ae as G,
  Ma as H,
  Va as I,
  Na as J,
  br as K,
  za as L,
  Ea as M,
  Wa as N,
  yr as Q,
  Vo as R,
  Ia as S,
  mt as T,
  mr as V,
  Ka as Y,
  sa as a,
  Zt as b,
  at as c,
  Fa as d,
  Qa as e,
  ot as f,
  bo as g,
  ft as h,
  we as i,
  Ca as j,
  or as k,
  Kt as l,
  qa as m,
  Ha as n,
  wn as o,
  Ja as p,
  fn as q,
  k as r,
  ba as s,
  rn as t,
  Za as u,
  fr as v,
  Ra as w,
  Ye as x,
  ta as y,
  nn as z
};
//# sourceMappingURL=useWidget-DS0_L3EF.js.map
