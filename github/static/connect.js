import { defineComponent as je, ref as C, shallowRef as rt, onMounted as lt, watch as at, onUnmounted as Fe, h as de, nextTick as ct, hasInjectionContext as ut, inject as oe, effectScope as pt, markRaw as ft, createApp as dt, computed as Q, openBlock as F, createElementBlock as N, createElementVNode as m, normalizeClass as he, withDirectives as z, vModelText as ge, vModelRadio as be, vModelCheckbox as ht, toDisplayString as Y, createCommentVNode as me, withKeys as gt, withModifiers as bt } from "vue";
import { config as ve, addIcons as mt, on as vt, applyThemeMode as D, host as yt, hostCss as _t, loadCss as xt, api as ye, define as wt } from "@wippy-fe/proxy";
const Ne = /^[a-z0-9]+(-[a-z0-9]+)*$/, W = (e, t, n, i = "") => {
  const s = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (s.length < 2 || s.length > 3) return null;
    i = s.shift().slice(1);
  }
  if (s.length > 3 || !s.length) return null;
  if (s.length > 1) {
    const a = s.pop(), c = s.pop(), l = {
      provider: s.length > 0 ? s[0] : i,
      prefix: c,
      name: a
    };
    return t && !$(l) ? null : l;
  }
  const o = s[0], r = o.split("-");
  if (r.length > 1) {
    const a = {
      provider: i,
      prefix: r.shift(),
      name: r.join("-")
    };
    return t && !$(a) ? null : a;
  }
  if (n && i === "") {
    const a = {
      provider: i,
      prefix: "",
      name: o
    };
    return t && !$(a, n) ? null : a;
  }
  return null;
}, $ = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function Ct(e, t) {
  const n = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  function o(r) {
    if (n[r]) return s[r] = [];
    if (!(r in s)) {
      s[r] = null;
      const a = i[r] && i[r].parent, c = a && o(a);
      c && (s[r] = [a].concat(c));
    }
    return s[r];
  }
  return Object.keys(n).concat(Object.keys(i)).forEach(o), s;
}
const ze = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), K = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), q = Object.freeze({
  ...ze,
  ...K
}), ee = Object.freeze({
  ...q,
  body: "",
  hidden: !1
});
function St(e, t) {
  const n = {};
  !e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0);
  const i = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return i && (n.rotate = i), n;
}
function _e(e, t) {
  const n = St(e, t);
  for (const i in ee) i in K ? i in e && !(i in n) && (n[i] = K[i]) : i in t ? n[i] = t[i] : i in e && (n[i] = e[i]);
  return n;
}
function It(e, t, n) {
  const i = e.icons, s = e.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function r(a) {
    o = _e(i[a] || s[a], o);
  }
  return r(t), n.forEach(r), _e(e, o);
}
function He(e, t) {
  const n = [];
  if (typeof e != "object" || typeof e.icons != "object") return n;
  e.not_found instanceof Array && e.not_found.forEach((s) => {
    t(s, null), n.push(s);
  });
  const i = Ct(e);
  for (const s in i) {
    const o = i[s];
    o && (t(s, It(e, s, o)), n.push(s));
  }
  return n;
}
const Et = {
  provider: "",
  aliases: {},
  not_found: {},
  ...ze
};
function J(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function Me(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !J(e, Et)) return null;
  const n = t.icons;
  for (const s in n) {
    const o = n[s];
    if (!s || typeof o.body != "string" || !J(o, ee)) return null;
  }
  const i = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const s in i) {
    const o = i[s], r = o.parent;
    if (!s || typeof r != "string" || !n[r] && !i[r] || !J(o, ee)) return null;
  }
  return t;
}
const xe = /* @__PURE__ */ Object.create(null);
function Pt(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function L(e, t) {
  const n = xe[e] || (xe[e] = /* @__PURE__ */ Object.create(null));
  return n[t] || (n[t] = Pt(e, t));
}
function Ue(e, t) {
  return Me(t) ? He(t, (n, i) => {
    i ? e.icons[n] = i : e.missing.add(n);
  }) : [];
}
function kt(e, t, n) {
  try {
    if (typeof n.body == "string")
      return e.icons[t] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let U = !1;
function De(e) {
  return typeof e == "boolean" && (U = e), U;
}
function Ot(e) {
  const t = typeof e == "string" ? W(e, !0, U) : e;
  if (t) {
    const n = L(t.provider, t.prefix), i = t.name;
    return n.icons[i] || (n.missing.has(i) ? null : void 0);
  }
}
function Tt(e, t) {
  const n = W(e, !0, U);
  if (!n) return !1;
  const i = L(n.provider, n.prefix);
  return t ? kt(i, n.name, t) : (i.missing.add(n.name), !0);
}
function $e(e, t) {
  if (typeof e != "object") return !1;
  if (typeof t != "string" && (t = e.provider || ""), U && !t && !e.prefix) {
    let s = !1;
    return Me(e) && (e.prefix = "", He(e, (o, r) => {
      Tt(o, r) && (s = !0);
    })), s;
  }
  const n = e.prefix;
  if (!$({
    prefix: n,
    name: "a"
  })) return !1;
  const i = L(t, n);
  return !!Ue(i, e);
}
const Be = Object.freeze({
  width: null,
  height: null
}), Ge = Object.freeze({
  ...Be,
  ...K
}), At = /(-?[0-9.]*[0-9]+[0-9.]*)/g, Vt = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function we(e, t, n) {
  if (t === 1) return e;
  if (n = n || 100, typeof e == "number") return Math.ceil(e * t * n) / n;
  if (typeof e != "string") return e;
  const i = e.split(At);
  if (i === null || !i.length) return e;
  const s = [];
  let o = i.shift(), r = Vt.test(o);
  for (; ; ) {
    if (r) {
      const a = parseFloat(o);
      isNaN(a) ? s.push(o) : s.push(Math.ceil(a * t * n) / n);
    } else s.push(o);
    if (o = i.shift(), o === void 0) return s.join("");
    r = !r;
  }
}
function Rt(e, t = "defs") {
  let n = "";
  const i = e.indexOf("<" + t);
  for (; i >= 0; ) {
    const s = e.indexOf(">", i), o = e.indexOf("</" + t);
    if (s === -1 || o === -1) break;
    const r = e.indexOf(">", o);
    if (r === -1) break;
    n += e.slice(s + 1, o).trim(), e = e.slice(0, i).trim() + e.slice(r + 1);
  }
  return {
    defs: n,
    content: e
  };
}
function Lt(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function jt(e, t, n) {
  const i = Rt(e);
  return Lt(i.defs, t + i.content + n);
}
const Ft = (e) => e === "unset" || e === "undefined" || e === "none";
function Nt(e, t) {
  const n = {
    ...q,
    ...e
  }, i = {
    ...Ge,
    ...t
  }, s = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let o = n.body;
  [n, i].forEach((y) => {
    const h = [], P = y.hFlip, k = y.vFlip;
    let E = y.rotate;
    P ? k ? E += 2 : (h.push("translate(" + (s.width + s.left).toString() + " " + (0 - s.top).toString() + ")"), h.push("scale(-1 1)"), s.top = s.left = 0) : k && (h.push("translate(" + (0 - s.left).toString() + " " + (s.height + s.top).toString() + ")"), h.push("scale(1 -1)"), s.top = s.left = 0);
    let S;
    switch (E < 0 && (E -= Math.floor(E / 4) * 4), E = E % 4, E) {
      case 1:
        S = s.height / 2 + s.top, h.unshift("rotate(90 " + S.toString() + " " + S.toString() + ")");
        break;
      case 2:
        h.unshift("rotate(180 " + (s.width / 2 + s.left).toString() + " " + (s.height / 2 + s.top).toString() + ")");
        break;
      case 3:
        S = s.width / 2 + s.left, h.unshift("rotate(-90 " + S.toString() + " " + S.toString() + ")");
    }
    E % 2 === 1 && (s.left !== s.top && (S = s.left, s.left = s.top, s.top = S), s.width !== s.height && (S = s.width, s.width = s.height, s.height = S)), h.length && (o = jt(o, '<g transform="' + h.join(" ") + '">', "</g>"));
  });
  const r = i.width, a = i.height, c = s.width, l = s.height;
  let u, f;
  r === null ? (f = a === null ? "1em" : a === "auto" ? l : a, u = we(f, c / l)) : (u = r === "auto" ? c : r, f = a === null ? we(u, l / c) : a === "auto" ? l : a);
  const d = {}, v = (y, h) => {
    Ft(h) || (d[y] = h.toString());
  };
  v("width", u), v("height", f);
  const _ = [
    s.left,
    s.top,
    c,
    l
  ];
  return d.viewBox = _.join(" "), {
    attributes: d,
    viewBox: _,
    body: o
  };
}
const zt = /\sid="(\S+)"/g, Ce = /* @__PURE__ */ new Map();
function Ht(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = Ce.get(e) || 0;
  return Ce.set(e, t + 1), t ? `${e}${t}` : e;
}
function Mt(e) {
  const t = [];
  let n;
  for (; n = zt.exec(e); ) t.push(n[1]);
  if (!t.length) return e;
  const i = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((s) => {
    const o = Ht(s), r = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + r + ')([")]|\\.[a-z])', "g"), "$1" + o + i + "$3");
  }), e = e.replace(new RegExp(i, "g"), ""), e;
}
const te = /* @__PURE__ */ Object.create(null);
function Ut(e, t) {
  te[e] = t;
}
function ne(e) {
  return te[e] || te[""];
}
function re(e) {
  let t;
  if (typeof e.resources == "string") t = [e.resources];
  else if (t = e.resources, !(t instanceof Array) || !t.length) return null;
  return {
    resources: t,
    path: e.path || "/",
    maxURL: e.maxURL || 500,
    rotate: e.rotate || 750,
    timeout: e.timeout || 5e3,
    random: e.random === !0,
    index: e.index || 0,
    dataAfterTimeout: e.dataAfterTimeout !== !1
  };
}
const le = /* @__PURE__ */ Object.create(null), H = ["https://api.simplesvg.com", "https://api.unisvg.com"], B = [];
for (; H.length > 0; ) H.length === 1 || Math.random() > 0.5 ? B.push(H.shift()) : B.push(H.pop());
le[""] = re({ resources: ["https://api.iconify.design"].concat(B) });
function Dt(e, t) {
  const n = re(t);
  return n === null ? !1 : (le[e] = n, !0);
}
function ae(e) {
  return le[e];
}
const $t = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function") return e;
  } catch {
  }
};
let Se = $t();
function Bt(e, t) {
  const n = ae(e);
  if (!n) return 0;
  let i;
  if (!n.maxURL) i = 0;
  else {
    let s = 0;
    n.resources.forEach((r) => {
      s = Math.max(s, r.length);
    });
    const o = t + ".json?icons=";
    i = n.maxURL - s - n.path.length - o.length;
  }
  return i;
}
function Gt(e) {
  return e === 404;
}
const Kt = (e, t, n) => {
  const i = [], s = Bt(e, t), o = "icons";
  let r = {
    type: o,
    provider: e,
    prefix: t,
    icons: []
  }, a = 0;
  return n.forEach((c, l) => {
    a += c.length + 1, a >= s && l > 0 && (i.push(r), r = {
      type: o,
      provider: e,
      prefix: t,
      icons: []
    }, a = c.length), r.icons.push(c);
  }), i.push(r), i;
};
function Wt(e) {
  if (typeof e == "string") {
    const t = ae(e);
    if (t) return t.path;
  }
  return "/";
}
const qt = (e, t, n) => {
  if (!Se) {
    n("abort", 424);
    return;
  }
  let i = Wt(t.provider);
  switch (t.type) {
    case "icons": {
      const o = t.prefix, r = t.icons.join(","), a = new URLSearchParams({ icons: r });
      i += o + ".json?" + a.toString();
      break;
    }
    case "custom": {
      const o = t.uri;
      i += o.slice(0, 1) === "/" ? o.slice(1) : o;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let s = 503;
  Se(e + i).then((o) => {
    const r = o.status;
    if (r !== 200) {
      setTimeout(() => {
        n(Gt(r) ? "abort" : "next", r);
      });
      return;
    }
    return s = 501, o.json();
  }).then((o) => {
    if (typeof o != "object" || o === null) {
      setTimeout(() => {
        o === 404 ? n("abort", o) : n("next", s);
      });
      return;
    }
    setTimeout(() => {
      n("success", o);
    });
  }).catch(() => {
    n("next", s);
  });
}, Qt = {
  prepare: Kt,
  send: qt
};
function Ke(e, t) {
  e.forEach((n) => {
    const i = n.loaderCallbacks;
    i && (n.loaderCallbacks = i.filter((s) => s.id !== t));
  });
}
function Yt(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length) return;
    let n = !1;
    const i = e.provider, s = e.prefix;
    t.forEach((o) => {
      const r = o.icons, a = r.pending.length;
      r.pending = r.pending.filter((c) => {
        if (c.prefix !== s) return !0;
        const l = c.name;
        if (e.icons[l]) r.loaded.push({
          provider: i,
          prefix: s,
          name: l
        });
        else if (e.missing.has(l)) r.missing.push({
          provider: i,
          prefix: s,
          name: l
        });
        else
          return n = !0, !0;
        return !1;
      }), r.pending.length !== a && (n || Ke([e], o.id), o.callback(r.loaded.slice(0), r.missing.slice(0), r.pending.slice(0), o.abort));
    });
  }));
}
let Jt = 0;
function Xt(e, t, n) {
  const i = Jt++, s = Ke.bind(null, n, i);
  if (!t.pending.length) return s;
  const o = {
    id: i,
    icons: t,
    callback: e,
    abort: s
  };
  return n.forEach((r) => {
    (r.loaderCallbacks || (r.loaderCallbacks = [])).push(o);
  }), s;
}
function Zt(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  e.sort((s, o) => s.provider !== o.provider ? s.provider.localeCompare(o.provider) : s.prefix !== o.prefix ? s.prefix.localeCompare(o.prefix) : s.name.localeCompare(o.name));
  let i = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((s) => {
    if (i.name === s.name && i.prefix === s.prefix && i.provider === s.provider) return;
    i = s;
    const o = s.provider, r = s.prefix, a = s.name, c = n[o] || (n[o] = /* @__PURE__ */ Object.create(null)), l = c[r] || (c[r] = L(o, r));
    let u;
    a in l.icons ? u = t.loaded : r === "" || l.missing.has(a) ? u = t.missing : u = t.pending;
    const f = {
      provider: o,
      prefix: r,
      name: a
    };
    u.push(f);
  }), t;
}
function en(e, t = !0, n = !1) {
  const i = [];
  return e.forEach((s) => {
    const o = typeof s == "string" ? W(s, t, n) : s;
    o && i.push(o);
  }), i;
}
const tn = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function nn(e, t, n, i) {
  const s = e.resources.length, o = e.random ? Math.floor(Math.random() * s) : e.index;
  let r;
  if (e.random) {
    let b = e.resources.slice(0);
    for (r = []; b.length > 1; ) {
      const I = Math.floor(Math.random() * b.length);
      r.push(b[I]), b = b.slice(0, I).concat(b.slice(I + 1));
    }
    r = r.concat(b);
  } else r = e.resources.slice(o).concat(e.resources.slice(0, o));
  const a = Date.now();
  let c = "pending", l = 0, u, f = null, d = [], v = [];
  typeof i == "function" && v.push(i);
  function _() {
    f && (clearTimeout(f), f = null);
  }
  function y() {
    c === "pending" && (c = "aborted"), _(), d.forEach((b) => {
      b.status === "pending" && (b.status = "aborted");
    }), d = [];
  }
  function h(b, I) {
    I && (v = []), typeof b == "function" && v.push(b);
  }
  function P() {
    return {
      startTime: a,
      payload: t,
      status: c,
      queriesSent: l,
      queriesPending: d.length,
      subscribe: h,
      abort: y
    };
  }
  function k() {
    c = "failed", v.forEach((b) => {
      b(void 0, u);
    });
  }
  function E() {
    d.forEach((b) => {
      b.status === "pending" && (b.status = "aborted");
    }), d = [];
  }
  function S(b, I, A) {
    const T = I !== "success";
    switch (d = d.filter((O) => O !== b), c) {
      case "pending":
        break;
      case "failed":
        if (T || !e.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (I === "abort") {
      u = A, k();
      return;
    }
    if (T) {
      u = A, d.length || (r.length ? V() : k());
      return;
    }
    if (_(), E(), !e.random) {
      const O = e.resources.indexOf(b.resource);
      O !== -1 && O !== e.index && (e.index = O);
    }
    c = "completed", v.forEach((O) => {
      O(A);
    });
  }
  function V() {
    if (c !== "pending") return;
    _();
    const b = r.shift();
    if (b === void 0) {
      if (d.length) {
        f = setTimeout(() => {
          _(), c === "pending" && (E(), k());
        }, e.timeout);
        return;
      }
      k();
      return;
    }
    const I = {
      status: "pending",
      resource: b,
      callback: (A, T) => {
        S(I, A, T);
      }
    };
    d.push(I), l++, f = setTimeout(V, e.rotate), n(b, t, I.callback);
  }
  return setTimeout(V), P;
}
function We(e) {
  const t = {
    ...tn,
    ...e
  };
  let n = [];
  function i() {
    n = n.filter((r) => r().status === "pending");
  }
  function s(r, a, c) {
    const l = nn(t, r, a, (u, f) => {
      i(), c && c(u, f);
    });
    return n.push(l), l;
  }
  function o(r) {
    return n.find((a) => r(a)) || null;
  }
  return {
    query: s,
    find: o,
    setIndex: (r) => {
      t.index = r;
    },
    getIndex: () => t.index,
    cleanup: i
  };
}
function Ie() {
}
const X = /* @__PURE__ */ Object.create(null);
function sn(e) {
  if (!X[e]) {
    const t = ae(e);
    if (!t) return;
    const n = {
      config: t,
      redundancy: We(t)
    };
    X[e] = n;
  }
  return X[e];
}
function on(e, t, n) {
  let i, s;
  if (typeof e == "string") {
    const o = ne(e);
    if (!o)
      return n(void 0, 424), Ie;
    s = o.send;
    const r = sn(e);
    r && (i = r.redundancy);
  } else {
    const o = re(e);
    if (o) {
      i = We(o);
      const r = e.resources ? e.resources[0] : "", a = ne(r);
      a && (s = a.send);
    }
  }
  return !i || !s ? (n(void 0, 424), Ie) : i.query(t, s, n)().abort;
}
function Ee() {
}
function rn(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, Yt(e);
  }));
}
function ln(e) {
  const t = [], n = [];
  return e.forEach((i) => {
    (i.match(Ne) ? t : n).push(i);
  }), {
    valid: t,
    invalid: n
  };
}
function M(e, t, n) {
  function i() {
    const s = e.pendingIcons;
    t.forEach((o) => {
      s && s.delete(o), e.icons[o] || e.missing.add(o);
    });
  }
  if (n && typeof n == "object") try {
    if (!Ue(e, n).length) {
      i();
      return;
    }
  } catch (s) {
    console.error(s);
  }
  i(), rn(e);
}
function Pe(e, t) {
  e instanceof Promise ? e.then((n) => {
    t(n);
  }).catch(() => {
    t(null);
  }) : t(e);
}
function an(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: n, prefix: i } = e, s = e.iconsToLoad;
    if (delete e.iconsToLoad, !s || !s.length) return;
    const o = e.loadIcon;
    if (e.loadIcons && (s.length > 1 || !o)) {
      Pe(e.loadIcons(s, i, n), (l) => {
        M(e, s, l);
      });
      return;
    }
    if (o) {
      s.forEach((l) => {
        Pe(o(l, i, n), (u) => {
          M(e, [l], u ? {
            prefix: i,
            icons: { [l]: u }
          } : null);
        });
      });
      return;
    }
    const { valid: r, invalid: a } = ln(s);
    if (a.length && M(e, a, null), !r.length) return;
    const c = i.match(Ne) ? ne(n) : null;
    if (!c) {
      M(e, r, null);
      return;
    }
    c.prepare(n, i, r).forEach((l) => {
      on(n, l, (u) => {
        M(e, l.icons, u);
      });
    });
  }));
}
const cn = (e, t) => {
  const n = en(e, !0, De()), i = Zt(n);
  if (!i.pending.length) {
    let c = !0;
    return t && setTimeout(() => {
      c && t(i.loaded, i.missing, i.pending, Ee);
    }), () => {
      c = !1;
    };
  }
  const s = /* @__PURE__ */ Object.create(null), o = [];
  let r, a;
  return i.pending.forEach((c) => {
    const { provider: l, prefix: u } = c;
    if (u === a && l === r) return;
    r = l, a = u, o.push(L(l, u));
    const f = s[l] || (s[l] = /* @__PURE__ */ Object.create(null));
    f[u] || (f[u] = []);
  }), i.pending.forEach((c) => {
    const { provider: l, prefix: u, name: f } = c, d = L(l, u), v = d.pendingIcons || (d.pendingIcons = /* @__PURE__ */ new Set());
    v.has(f) || (v.add(f), s[l][u].push(f));
  }), o.forEach((c) => {
    const l = s[c.provider][c.prefix];
    l.length && an(c, l);
  }), t ? Xt(t, i, o) : Ee;
};
function un(e, t) {
  const n = { ...e };
  for (const i in t) {
    const s = t[i], o = typeof s;
    i in Be ? (s === null || s && (o === "string" || o === "number")) && (n[i] = s) : o === typeof n[i] && (n[i] = i === "rotate" ? s % 4 : s);
  }
  return n;
}
const pn = /[\s,]+/;
function fn(e, t) {
  t.split(pn).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function dn(e, t = 0) {
  const n = e.replace(/^-?[0-9.]*/, "");
  function i(s) {
    for (; s < 0; ) s += 4;
    return s % 4;
  }
  if (n === "") {
    const s = parseInt(e);
    return isNaN(s) ? 0 : i(s);
  } else if (n !== e) {
    let s = 0;
    switch (n) {
      case "%":
        s = 25;
        break;
      case "deg":
        s = 90;
    }
    if (s) {
      let o = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(o) ? 0 : (o = o / s, o % 1 === 0 ? i(o) : 0);
    }
  }
  return t;
}
function hn(e, t) {
  let n = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const i in t) n += " " + i + '="' + t[i] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
}
function gn(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function bn(e) {
  return "data:image/svg+xml," + gn(e);
}
function mn(e) {
  return 'url("' + bn(e) + '")';
}
const ke = {
  ...Ge,
  inline: !1
}, vn = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, yn = {
  display: "inline-block"
}, se = {
  backgroundColor: "currentColor"
}, qe = {
  backgroundColor: "transparent"
}, Oe = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, Te = {
  webkitMask: se,
  mask: se,
  background: qe
};
for (const e in Te) {
  const t = Te[e];
  for (const n in Oe)
    t[e + n] = Oe[n];
}
const G = {};
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  G[e + "-flip"] = t, G[e.slice(0, 1) + "-flip"] = t, G[e + "Flip"] = t;
});
function Ae(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const Ve = (e, t) => {
  const n = un(ke, t), i = { ...vn }, s = t.mode || "svg", o = {}, r = t.style, a = typeof r == "object" && !(r instanceof Array) ? r : {};
  for (let y in t) {
    const h = t[y];
    if (h !== void 0)
      switch (y) {
        // Properties to ignore
        case "icon":
        case "style":
        case "onLoad":
        case "mode":
        case "ssr":
        case "customise":
          break;
        // Boolean attributes
        case "inline":
        case "hFlip":
        case "vFlip":
          n[y] = h === !0 || h === "true" || h === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          o.color = h;
          break;
        // Rotation as string
        case "rotate":
          typeof h == "string" ? n[y] = dn(h) : typeof h == "number" && (n[y] = h);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          h !== !0 && h !== "true" && delete i["aria-hidden"];
          break;
        default: {
          const P = G[y];
          P ? (h === !0 || h === "true" || h === 1) && (n[P] = !0) : ke[y] === void 0 && (i[y] = h);
        }
      }
  }
  typeof t.flip == "string" && fn(n, t.flip);
  const c = Nt(e, n), l = c.attributes;
  if (n.inline && (o.verticalAlign = "-0.125em"), s === "svg")
    return i.style = {
      ...o,
      ...a
    }, Object.assign(i, l), i.innerHTML = Mt(c.body), de("svg", i);
  const { body: u, width: f, height: d } = e, v = s === "mask" || (s === "bg" ? !1 : u.indexOf("currentColor") !== -1), _ = hn(u, {
    ...l,
    width: f + "",
    height: d + ""
  });
  return i.style = {
    ...o,
    "--svg": mn(_),
    width: Ae(l.width),
    height: Ae(l.height),
    ...yn,
    ...v ? se : qe,
    ...a
  }, de("span", i);
};
De(!0);
Ut("", Qt);
if (typeof document < "u" && typeof window < "u") {
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((i) => {
      try {
        // Check if item is an object and not null/array
        (typeof i != "object" || i === null || i instanceof Array || // Check for 'icons' and 'prefix'
        typeof i.icons != "object" || typeof i.prefix != "string" || // Add icon set
        !$e(i)) && console.error(n);
      } catch {
        console.error(n);
      }
    });
  }
  if (e.IconifyProviders !== void 0) {
    const t = e.IconifyProviders;
    if (typeof t == "object" && t !== null)
      for (let n in t) {
        const i = "IconifyProviders[" + n + "] is invalid.";
        try {
          const s = t[n];
          if (typeof s != "object" || !s || s.resources === void 0)
            continue;
          Dt(n, s) || console.error(i);
        } catch {
          console.error(i);
        }
      }
  }
}
const _n = {
  ...q,
  body: ""
};
je((e, { emit: t }) => {
  const n = C(null);
  function i() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const s = C(!!e.ssr), o = C(""), r = rt(null);
  function a() {
    const l = e.icon;
    if (typeof l == "object" && l !== null && typeof l.body == "string")
      return o.value = "", {
        data: l
      };
    let u;
    if (typeof l != "string" || (u = W(l, !1, !0)) === null)
      return null;
    let f = Ot(u);
    if (!f) {
      const _ = n.value;
      return (!_ || _.name !== l) && (f === null ? n.value = {
        name: l
      } : n.value = {
        name: l,
        abort: cn([u], c)
      }), null;
    }
    i(), o.value !== l && (o.value = l, ct(() => {
      t("load", l);
    }));
    const d = e.customise;
    if (d) {
      f = Object.assign({}, f);
      const _ = d(f.body, u.name, u.prefix, u.provider);
      typeof _ == "string" && (f.body = _);
    }
    const v = ["iconify"];
    return u.prefix !== "" && v.push("iconify--" + u.prefix), u.provider !== "" && v.push("iconify--" + u.provider), { data: f, classes: v };
  }
  function c() {
    const l = a();
    l ? l.data !== r.value?.data && (r.value = l) : r.value = null;
  }
  return s.value ? c() : lt(() => {
    s.value = !0, c();
  }), at(() => e.icon, c), Fe(i), () => {
    const l = r.value;
    if (!l)
      return Ve(_n, e);
    let u = e;
    return l.classes && (u = {
      ...e,
      class: l.classes.join(" ")
    }), Ve({
      ...q,
      ...l.data
    }, u);
  };
}, {
  props: {
    // Icon and render mode
    icon: { type: [String, Object], required: !0 },
    mode: { type: String },
    ssr: { type: Boolean },
    // Layout and style
    width: { type: [String, Number] },
    height: { type: [String, Number] },
    style: { type: [String, Object] },
    color: { type: String },
    inline: { type: Boolean },
    // Transformations
    rotate: { type: [Number, String] },
    hFlip: { type: Boolean },
    horizontalFlip: { type: Boolean },
    vFlip: { type: Boolean },
    verticalFlip: { type: Boolean },
    flip: { type: String },
    // Misc
    id: { type: String },
    ariaHidden: { type: [Boolean, String], default: void 0 },
    customise: { type: Function },
    title: { type: String }
  },
  emits: ["load"]
});
var ie = "data-wippy-visible";
function Re(e) {
  const t = e.getAttribute(ie);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var xn = Object.defineProperty, wn = (e, t, n) => t in e ? xn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, w = (e, t, n) => wn(e, typeof t != "symbol" ? t + "" : t, n), Cn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Sn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Le(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function In(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [i, s] of Object.entries(n)) {
        if ((i === "@light" || i === "@dark") && s && typeof s == "object") {
          for (const [r, a] of Object.entries(s)) {
            const c = typeof a == "string" ? Le(r) : null;
            c && t.add(c);
          }
          continue;
        }
        const o = typeof s == "string" ? Le(i) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function En(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Sn} {
${t}
}`;
}
function Pn(e, t) {
  const n = En(t);
  n && Qe(e, n, "@wippy-fe/css-variables-bridge");
}
function kn(e, t) {
  const i = (t ?? Cn).map(async (s) => {
    const o = _t[s];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${s}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await xt(o);
    } catch (r) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${s}" (${o}):`, r), null;
    }
  });
  return Promise.all(i).then((s) => {
    for (const o of s) {
      if (!o)
        continue;
      const r = document.createElement("style");
      r.textContent = o, r.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(r);
    }
  });
}
function On(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Qe(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const s = new CSSStyleSheet();
    s.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, s];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", n), i.textContent = t, e.appendChild(i);
}
function Tn(e, t) {
  Qe(e, t, "@wippy-fe/custom-css");
}
function Ye(e) {
  return e.__wippyHost ?? null;
}
function An(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Vn(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const i = Number.parseFloat(t);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(t, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(t);
        return n.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Z(e, t) {
  const n = {}, i = [];
  for (const [s, o] of Object.entries(t.properties)) {
    const r = e.getAttribute(s), a = An(s);
    if (r === null) {
      o.default !== void 0 && (n[a] = o.default);
      continue;
    }
    const c = Vn(s, r, o);
    c.error ? i.push(c.error) : n[a] = c.value;
  }
  return { props: n, errors: i };
}
var Rn = class {
  constructor(e, t) {
    w(this, "_props"), w(this, "_errors"), w(this, "_content"), w(this, "_hostVisibility"), w(this, "_propsListeners", /* @__PURE__ */ new Set()), w(this, "_contentListeners", /* @__PURE__ */ new Set()), w(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), w(this, "_disposed", !1), w(this, "_emitToDom"), w(this, "props"), w(this, "events"), w(this, "content"), w(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(i, s) {
        return n._subscribeProps(i, s);
      }
    }, this.events = {
      emit(i, s) {
        n._disposed || n._emitToDom(i, s);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(i, s) {
        return n._subscribeContent(i, s);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(i, s) {
        return n._subscribeHostVisibility(i, s);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const n of this._hostVisibilityListeners)
        n(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Ln = class extends HTMLElement {
  constructor() {
    super(), w(this, "_internals"), w(this, "_contentObserver", null), w(this, "_initialized", !1), w(this, "_container", null), w(this, "_reactive", null), w(this, "_lastProps", null), w(this, "_lastErrors", []), w(this, "_lastContent", null), w(this, "_themeUnsub", null), w(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Re(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, ie])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return Ye(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let n, i;
      if (this._lastProps !== null)
        n = this._lastProps, i = this._lastErrors;
      else {
        const o = Z(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, i = o.errors, this._lastProps = n, this._lastErrors = i;
      }
      const s = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = s), this._reactive = new Rn(
        { props: n, errors: i, content: s, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let i;
      if (t)
        i = this._container;
      else {
        this.onInit(n), e.inlineCss && On(n, e.inlineCss);
        try {
          const l = ve?.theming, u = In(
            l?.global?.cssVariables,
            l?.children?.cssVariables
          );
          Pn(n, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const l = ve?.theming, u = [l?.global?.customCSS, l?.children?.customCSS].filter(Boolean).join(`
`);
            u && Tn(n, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && kn(n, e.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), n.appendChild(i), this._container = i, mt($e);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = vt("@theme", (c) => this._applyTheme(c)));
      const { props: s, errors: o } = Z(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(s));
      const r = s;
      this._lastProps = r, this._lastErrors = o;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, i, r, o, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(e = yt.getThemeMode?.()) {
    D(e, this), this._container && D(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), D("auto", this), this._container && D("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === ie) {
      const a = this._hostVisible, c = Re(this);
      if (c === a)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, a), this.onHostVisibilityChanged(c, a));
      return;
    }
    const i = this.constructor.wippyConfig, { props: s, errors: o } = Z(this, i.propsSchema);
    i.validateProps && o.push(...i.validateProps(s));
    const r = s;
    this._lastProps = r, this._lastErrors = o, this._reactive?.notifyProps(r, o), this.onPropsChanged(r, o);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function jn(e) {
  return e.__wippyHostBus ?? null;
}
function Fn(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Je;
const Xe = (e) => Je = e, Nn = () => ut() && oe(Ze) || Je, Ze = (
  /* istanbul ignore next */
  Symbol()
);
function zn() {
  const e = pt(!0), t = e.run(() => C({}));
  let n = [], i = [];
  const s = ft({
    install(o) {
      Xe(s), s._a = o, o.provide(Ze, s), o.config.globalProperties.$pinia = s, i.forEach((r) => n.push(r)), i = [];
    },
    use(o) {
      return this._a ? n.push(o) : i.push(o), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return s;
}
var Hn = Object.defineProperty, Mn = (e, t, n) => t in e ? Hn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, R = (e, t, n) => Mn(e, typeof t != "symbol" ? t + "" : t, n), et = /* @__PURE__ */ Symbol("wippy:emit"), tt = /* @__PURE__ */ Symbol("wippy:props"), Un = /* @__PURE__ */ Symbol("wippy:props_error"), Dn = /* @__PURE__ */ Symbol("wippy:content"), $n = /* @__PURE__ */ Symbol("wippy:panel-id"), Bn = /* @__PURE__ */ Symbol("wippy:layout-bus"), Gn = /* @__PURE__ */ Symbol("wippy:host"), Kn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Wn() {
  const e = oe(tt);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function qn() {
  const e = oe(et);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var Qn = class extends Ln {
  constructor() {
    super(...arguments), R(this, "_vueApp", null), R(this, "_propsRef", C({})), R(this, "_errorsRef", C([])), R(this, "_contentRef", C(null)), R(this, "_hostVisibilityRef", C(null)), R(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, i, s, o) {
    const r = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = i, this._contentRef.value = s ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of i)
      this.emitEvent("invalid", { message: l });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((l, u) => {
      this._propsRef.value = l, this._errorsRef.value = [...u];
      for (const f of u)
        this.emitEvent("invalid", { message: f });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: a.signal });
    const c = (l) => {
      if (a.signal.aborted)
        return;
      const u = Nn(), f = dt(l.rootComponent);
      this._vueApp = f;
      const d = zn();
      if (l.piniaPlugins)
        for (const v of l.piniaPlugins)
          d.use(v);
      if (f.use(d), l.plugins)
        for (const v of l.plugins)
          f.use(v);
      f.provide(tt, this._propsRef), f.provide(Un, this._errorsRef), f.provide(et, this.emitEvent.bind(this)), f.provide(Dn, this._contentRef), f.provide(Kn, this._hostVisibilityRef), f.provide($n, Fn(this)), f.provide(Bn, jn(this)), f.provide(Gn, Ye(this)), l.providers && l.providers(f, this), f.mount(t), u && Xe(u);
    };
    if (r.rootComponent)
      c(r);
    else if (r.lazyConfig) {
      const l = document.createElement("wippy-loading");
      l.setAttribute("no-bg", ""), t.appendChild(l), r.lazyConfig().then((u) => {
        a.signal.aborted || (l.remove(), c(u));
      }).catch((u) => {
        if (a.signal.aborted)
          return;
        const f = u instanceof Error ? u.message : String(u), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", f), l.replaceWith(d), this.emitEvent("error", { message: f });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Yn = { class: "gh" }, Jn = { class: "gh-tabs" }, Xn = ["disabled"], Zn = ["disabled"], es = { class: "gh-field" }, ts = ["disabled"], ns = {
  key: 0,
  class: "gh-pane"
}, ss = {
  class: "gh-pick",
  role: "radiogroup",
  "aria-label": "Repository access"
}, is = { class: "gh-choice" }, os = ["disabled"], rs = { class: "gh-choice" }, ls = ["disabled"], as = { class: "gh-check" }, cs = ["disabled"], us = ["disabled"], ps = {
  key: 0,
  class: "gh-warn"
}, fs = {
  key: 1,
  class: "gh-pane"
}, ds = { class: "gh-field" }, hs = ["disabled", "onKeydown"], gs = ["disabled"], bs = {
  key: 2,
  class: "gh-error"
}, ms = "kickside.github.connection:github_connection", vs = /* @__PURE__ */ je({
  __name: "Connect",
  setup(e) {
    const t = Wn(), n = qn(), i = ["read:user", "user:email"], s = C("oauth"), o = C(!1), r = C(""), a = C(""), c = C(""), l = C("public_repo"), u = C(!1), f = C("");
    let d = null, v = null, _ = "", y = "", h = !1, P = 0, k = !1;
    const E = Q(() => t.value.providerId || "github"), S = Q(() => t.value.componentId || ""), V = Q(() => c.value.trim() || "GitHub");
    function b(g) {
      r.value = g, o.value = !1;
    }
    function I() {
      const g = [...i, l.value];
      return u.value && g.push("read:org"), g;
    }
    function A(g) {
      if (g)
        try {
          g.close();
        } catch {
        }
    }
    function T(g = !1) {
      v && (clearInterval(v), v = null), h && (window.removeEventListener("message", O), h = !1), g && A(d), d = null;
    }
    function O(g) {
      const p = g.data;
      if (!(!p || p.type !== "oauth_result") && !(!d || g.source !== d) && !(!_ || g.origin !== _) && !(!y || p.state_token !== y))
        if (T(!0), _ = "", y = "", o.value = !1, a.value = "", p.success)
          r.value = "", n("oauth-result", { success: !0 });
        else {
          const x = p.error || "GitHub authorization failed";
          r.value = x, n("oauth-result", { success: !1, error: x });
        }
    }
    function nt() {
      v = setInterval(() => {
        let g = !1;
        try {
          g = !d || d.closed;
        } catch {
          g = !1;
        }
        if (!g) return;
        T(), _ = "", y = "", o.value = !1, a.value = "";
        const p = "GitHub authorization was cancelled before completion";
        r.value = p, n("oauth-result", { success: !1, error: p });
      }, 800);
    }
    function ce() {
      h || (window.addEventListener("message", O), h = !0), nt();
    }
    function j(g = !0) {
      P += 1, T(g), _ = "", y = "", a.value = "";
    }
    function st(g) {
      if (typeof g != "string" || !g) return "";
      try {
        const p = new URL(g, window.location.href);
        return p.protocol === "http:" || p.protocol === "https:" ? p.origin : "";
      } catch {
        return "";
      }
    }
    async function it() {
      j();
      const g = P;
      r.value = "", o.value = !0, d = window.open("about:blank", "oauth_github", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      try {
        const p = { name: V.value, scopes: I() };
        S.value && (p.component_id = S.value);
        const { data: x } = await ye.post(`/api/v1/oauth/providers/${encodeURIComponent(E.value)}/init`, p);
        if (k || g !== P) return;
        if (!x?.success || !x.authorization_url)
          return j(), b(x?.error || "Could not start GitHub sign-in");
        const pe = st(x.redirect_uri), fe = typeof x.state_token == "string" ? x.state_token : "";
        if (!pe || !fe)
          return j(), b("OAuth response did not include a valid callback identity");
        _ = pe, y = fe, d && !d.closed ? (ce(), d.location.href = x.authorization_url) : (d = null, a.value = x.authorization_url, o.value = !1);
      } catch (p) {
        if (k || g !== P) return;
        j(), b(p instanceof Error ? p.message : String(p));
      }
    }
    function ot() {
      if (!a.value || !_ || !y) return;
      o.value = !0;
      const g = window.open(a.value, "oauth_github", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      if (!g || g.closed)
        return A(g), o.value = !1, b("Popup blocked - allow popups and retry");
      T(!0), d = g, a.value = "", ce();
    }
    async function ue() {
      r.value = "";
      const g = f.value.trim();
      if (!g) return b("Personal access token is required");
      o.value = !0;
      try {
        const { data: p } = await ye.post("/api/v1/connections", {
          impl_id: ms,
          name: V.value,
          private_context: { token: g },
          validate: !0
        });
        if (!p || p.success === !1) return b(p?.error || "Could not save GitHub connection");
        o.value = !1, n("connection-saved", { success: !0 });
      } catch (p) {
        b(p instanceof Error ? p.message : String(p));
      }
    }
    return Fe(() => {
      k = !0, j(), o.value = !1;
    }), (g, p) => (F(), N("div", Yn, [
      m("div", Jn, [
        m("button", {
          type: "button",
          class: he(["gh-tab", { on: s.value === "oauth" }]),
          disabled: o.value,
          onClick: p[0] || (p[0] = (x) => s.value = "oauth")
        }, "GitHub OAuth", 10, Xn),
        m("button", {
          type: "button",
          class: he(["gh-tab", { on: s.value === "pat" }]),
          disabled: o.value,
          onClick: p[1] || (p[1] = (x) => s.value = "pat")
        }, "Personal access token", 10, Zn)
      ]),
      m("label", es, [
        p[7] || (p[7] = m("span", null, "Connection name", -1)),
        z(m("input", {
          "onUpdate:modelValue": p[2] || (p[2] = (x) => c.value = x),
          type: "text",
          placeholder: "GitHub",
          disabled: o.value
        }, null, 8, ts), [
          [ge, c.value]
        ])
      ]),
      s.value === "oauth" ? (F(), N("div", ns, [
        p[12] || (p[12] = m("p", { class: "gh-hint" }, "Authorize KickSide with a GitHub OAuth App. This is the preferred path for repository agents and automations.", -1)),
        m("div", ss, [
          m("label", is, [
            z(m("input", {
              "onUpdate:modelValue": p[3] || (p[3] = (x) => l.value = x),
              type: "radio",
              value: "public_repo",
              disabled: o.value
            }, null, 8, os), [
              [be, l.value]
            ]),
            p[8] || (p[8] = m("span", null, [
              m("strong", null, "Public repositories"),
              m("em", null, "Use GitHub's public_repo scope.")
            ], -1))
          ]),
          m("label", rs, [
            z(m("input", {
              "onUpdate:modelValue": p[4] || (p[4] = (x) => l.value = x),
              type: "radio",
              value: "repo",
              disabled: o.value
            }, null, 8, ls), [
              [be, l.value]
            ]),
            p[9] || (p[9] = m("span", null, [
              m("strong", null, "Private and public repositories"),
              m("em", null, "Use GitHub's broader repo scope.")
            ], -1))
          ])
        ]),
        m("label", as, [
          z(m("input", {
            "onUpdate:modelValue": p[5] || (p[5] = (x) => u.value = x),
            type: "checkbox",
            disabled: o.value
          }, null, 8, cs), [
            [ht, u.value]
          ]),
          p[10] || (p[10] = m("span", null, "Read organization membership when repository access depends on teams.", -1))
        ]),
        m("button", {
          class: "gh-primary",
          type: "button",
          disabled: o.value,
          onClick: it
        }, Y(o.value ? "Connecting..." : "Sign in with GitHub"), 9, us),
        a.value ? (F(), N("div", ps, [
          p[11] || (p[11] = m("span", null, "Your browser blocked the popup.", -1)),
          m("button", {
            type: "button",
            onClick: ot
          }, "Open authorization")
        ])) : me("", !0)
      ])) : (F(), N("div", fs, [
        p[14] || (p[14] = m("p", { class: "gh-hint" }, "Use a fine-grained or classic GitHub token only when OAuth is unavailable. The token is stored in the connection private context.", -1)),
        m("label", ds, [
          p[13] || (p[13] = m("span", null, "Personal access token", -1)),
          z(m("input", {
            "onUpdate:modelValue": p[6] || (p[6] = (x) => f.value = x),
            type: "password",
            placeholder: "github_pat_...",
            disabled: o.value,
            onKeydown: gt(bt(ue, ["prevent"]), ["enter"])
          }, null, 40, hs), [
            [ge, f.value]
          ])
        ]),
        m("button", {
          class: "gh-primary",
          type: "button",
          disabled: o.value,
          onClick: ue
        }, Y(o.value ? "Saving..." : "Save token connection"), 9, gs)
      ])),
      r.value ? (F(), N("p", bs, Y(r.value), 1)) : me("", !0)
    ]));
  }
}), ys = ":host,.gh{--gh-bg: var(--p-content-background);--gh-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--gh-border: var(--p-content-border-color);--gh-text: var(--p-text-color);--gh-muted: var(--p-text-muted-color);--gh-primary: var(--p-primary-color);--gh-primary-text: var(--p-primary-contrast-color);--gh-danger: var(--p-danger-500);--gh-warn: var(--p-warn-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--gh-text)}.gh{display:flex;flex-direction:column;gap:14px}.gh-tabs{display:flex;gap:6px}.gh-tab{flex:1;padding:8px 10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);color:var(--gh-muted);font-size:13px;cursor:pointer}.gh-tab.on{background:var(--gh-surface);color:var(--gh-text);border-color:var(--gh-primary)}.gh-pane,.gh-pick{display:flex;flex-direction:column;gap:12px}.gh-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.gh-field>span{color:var(--gh-muted)}.gh-field input{padding:8px 10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);color:var(--gh-text);font-size:14px}.gh-hint,.gh-error{margin:0;font-size:13px}.gh-hint{color:var(--gh-muted)}.gh-error{color:var(--gh-danger)}.gh-choice{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;padding:10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);cursor:pointer}.gh-choice:has(input:checked){border-color:var(--gh-primary);background:var(--gh-surface)}.gh-choice input,.gh-check input{margin-top:2px}.gh-choice span{display:flex;flex-direction:column;gap:2px}.gh-choice strong{font-size:13px;font-weight:700}.gh-choice em{color:var(--gh-muted);font-size:12px;font-style:normal}.gh-check{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;color:var(--gh-muted);font-size:13px}.gh-primary{padding:9px 14px;border:none;border-radius:8px;background:var(--gh-primary);color:var(--gh-primary-text);font-size:14px;font-weight:600;cursor:pointer}.gh-primary:disabled,.gh-tab:disabled,.gh-field input:disabled{opacity:.6;cursor:default}.gh-warn{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid color-mix(in srgb,var(--gh-warn) 45%,var(--gh-border));border-radius:8px;color:var(--gh-text);font-size:13px}.gh-warn button{border:1px solid var(--gh-border);border-radius:6px;background:var(--gh-bg);color:var(--gh-text);font-size:12px;padding:5px 8px}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}", _s = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (github)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, xs = {
  wippy: _s
};
class ws extends Qn {
  static get wippyConfig() {
    return {
      propsSchema: xs.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: ys
    };
  }
  static get vueConfig() {
    return { rootComponent: vs };
  }
}
wt(import.meta.url, ws);
//# sourceMappingURL=connect.js.map
