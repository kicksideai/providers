import { defineComponent as Ce, ref as _, shallowRef as He, onMounted as Se, watch as xe, onUnmounted as We, h as se, nextTick as qe, hasInjectionContext as Ke, inject as ee, effectScope as Qe, markRaw as Ge, createApp as Ye, computed as oe, openBlock as T, createElementBlock as V, createElementVNode as H, normalizeClass as Je, toDisplayString as W, createCommentVNode as j } from "vue";
import { config as re, addIcons as Xe, on as Ze, applyThemeMode as F, host as et, hostCss as tt, loadCss as nt, loadByTagName as it, api as st, define as ot } from "@wippy-fe/proxy";
const Ee = /^[a-z0-9]+(-[a-z0-9]+)*$/, $ = (e, t, n, s = "") => {
  const i = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (i.length < 2 || i.length > 3) return null;
    s = i.shift().slice(1);
  }
  if (i.length > 3 || !i.length) return null;
  if (i.length > 1) {
    const l = i.pop(), a = i.pop(), c = {
      provider: i.length > 0 ? i[0] : s,
      prefix: a,
      name: l
    };
    return t && !N(c) ? null : c;
  }
  const o = i[0], r = o.split("-");
  if (r.length > 1) {
    const l = {
      provider: s,
      prefix: r.shift(),
      name: r.join("-")
    };
    return t && !N(l) ? null : l;
  }
  if (n && s === "") {
    const l = {
      provider: s,
      prefix: "",
      name: o
    };
    return t && !N(l, n) ? null : l;
  }
  return null;
}, N = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function rt(e, t) {
  const n = e.icons, s = e.aliases || /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  function o(r) {
    if (n[r]) return i[r] = [];
    if (!(r in i)) {
      i[r] = null;
      const l = s[r] && s[r].parent, a = l && o(l);
      a && (i[r] = [l].concat(a));
    }
    return i[r];
  }
  return Object.keys(n).concat(Object.keys(s)).forEach(o), i;
}
const Ie = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), B = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), U = Object.freeze({
  ...Ie,
  ...B
}), G = Object.freeze({
  ...U,
  body: "",
  hidden: !1
});
function ct(e, t) {
  const n = {};
  !e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0);
  const s = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return s && (n.rotate = s), n;
}
function ce(e, t) {
  const n = ct(e, t);
  for (const s in G) s in B ? s in e && !(s in n) && (n[s] = B[s]) : s in t ? n[s] = t[s] : s in e && (n[s] = e[s]);
  return n;
}
function lt(e, t, n) {
  const s = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function r(l) {
    o = ce(s[l] || i[l], o);
  }
  return r(t), n.forEach(r), ce(e, o);
}
function Pe(e, t) {
  const n = [];
  if (typeof e != "object" || typeof e.icons != "object") return n;
  e.not_found instanceof Array && e.not_found.forEach((i) => {
    t(i, null), n.push(i);
  });
  const s = rt(e);
  for (const i in s) {
    const o = s[i];
    o && (t(i, lt(e, i, o)), n.push(i));
  }
  return n;
}
const at = {
  provider: "",
  aliases: {},
  not_found: {},
  ...Ie
};
function q(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function ke(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !q(e, at)) return null;
  const n = t.icons;
  for (const i in n) {
    const o = n[i];
    if (!i || typeof o.body != "string" || !q(o, G)) return null;
  }
  const s = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const i in s) {
    const o = s[i], r = o.parent;
    if (!i || typeof r != "string" || !n[r] && !s[r] || !q(o, G)) return null;
  }
  return t;
}
const le = /* @__PURE__ */ Object.create(null);
function ut(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function P(e, t) {
  const n = le[e] || (le[e] = /* @__PURE__ */ Object.create(null));
  return n[t] || (n[t] = ut(e, t));
}
function Te(e, t) {
  return ke(t) ? Pe(t, (n, s) => {
    s ? e.icons[n] = s : e.missing.add(n);
  }) : [];
}
function ft(e, t, n) {
  try {
    if (typeof n.body == "string")
      return e.icons[t] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let R = !1;
function Ve(e) {
  return typeof e == "boolean" && (R = e), R;
}
function pt(e) {
  const t = typeof e == "string" ? $(e, !0, R) : e;
  if (t) {
    const n = P(t.provider, t.prefix), s = t.name;
    return n.icons[s] || (n.missing.has(s) ? null : void 0);
  }
}
function ht(e, t) {
  const n = $(e, !0, R);
  if (!n) return !1;
  const s = P(n.provider, n.prefix);
  return t ? ft(s, n.name, t) : (s.missing.add(n.name), !0);
}
function Oe(e, t) {
  if (typeof e != "object") return !1;
  if (typeof t != "string" && (t = e.provider || ""), R && !t && !e.prefix) {
    let i = !1;
    return ke(e) && (e.prefix = "", Pe(e, (o, r) => {
      ht(o, r) && (i = !0);
    })), i;
  }
  const n = e.prefix;
  if (!N({
    prefix: n,
    name: "a"
  })) return !1;
  const s = P(t, n);
  return !!Te(s, e);
}
const Ae = Object.freeze({
  width: null,
  height: null
}), Re = Object.freeze({
  ...Ae,
  ...B
}), dt = /(-?[0-9.]*[0-9]+[0-9.]*)/g, mt = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function ae(e, t, n) {
  if (t === 1) return e;
  if (n = n || 100, typeof e == "number") return Math.ceil(e * t * n) / n;
  if (typeof e != "string") return e;
  const s = e.split(dt);
  if (s === null || !s.length) return e;
  const i = [];
  let o = s.shift(), r = mt.test(o);
  for (; ; ) {
    if (r) {
      const l = parseFloat(o);
      isNaN(l) ? i.push(o) : i.push(Math.ceil(l * t * n) / n);
    } else i.push(o);
    if (o = s.shift(), o === void 0) return i.join("");
    r = !r;
  }
}
function gt(e, t = "defs") {
  let n = "";
  const s = e.indexOf("<" + t);
  for (; s >= 0; ) {
    const i = e.indexOf(">", s), o = e.indexOf("</" + t);
    if (i === -1 || o === -1) break;
    const r = e.indexOf(">", o);
    if (r === -1) break;
    n += e.slice(i + 1, o).trim(), e = e.slice(0, s).trim() + e.slice(r + 1);
  }
  return {
    defs: n,
    content: e
  };
}
function bt(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function yt(e, t, n) {
  const s = gt(e);
  return bt(s.defs, t + s.content + n);
}
const vt = (e) => e === "unset" || e === "undefined" || e === "none";
function _t(e, t) {
  const n = {
    ...U,
    ...e
  }, s = {
    ...Re,
    ...t
  }, i = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let o = n.body;
  [n, s].forEach((y) => {
    const f = [], d = y.hFlip, x = y.vFlip;
    let S = y.rotate;
    d ? x ? S += 2 : (f.push("translate(" + (i.width + i.left).toString() + " " + (0 - i.top).toString() + ")"), f.push("scale(-1 1)"), i.top = i.left = 0) : x && (f.push("translate(" + (0 - i.left).toString() + " " + (i.height + i.top).toString() + ")"), f.push("scale(1 -1)"), i.top = i.left = 0);
    let w;
    switch (S < 0 && (S -= Math.floor(S / 4) * 4), S = S % 4, S) {
      case 1:
        w = i.height / 2 + i.top, f.unshift("rotate(90 " + w.toString() + " " + w.toString() + ")");
        break;
      case 2:
        f.unshift("rotate(180 " + (i.width / 2 + i.left).toString() + " " + (i.height / 2 + i.top).toString() + ")");
        break;
      case 3:
        w = i.width / 2 + i.left, f.unshift("rotate(-90 " + w.toString() + " " + w.toString() + ")");
    }
    S % 2 === 1 && (i.left !== i.top && (w = i.left, i.left = i.top, i.top = w), i.width !== i.height && (w = i.width, i.width = i.height, i.height = w)), f.length && (o = yt(o, '<g transform="' + f.join(" ") + '">', "</g>"));
  });
  const r = s.width, l = s.height, a = i.width, c = i.height;
  let u, p;
  r === null ? (p = l === null ? "1em" : l === "auto" ? c : l, u = ae(p, a / c)) : (u = r === "auto" ? a : r, p = l === null ? ae(u, c / a) : l === "auto" ? c : l);
  const h = {}, g = (y, f) => {
    vt(f) || (h[y] = f.toString());
  };
  g("width", u), g("height", p);
  const v = [
    i.left,
    i.top,
    a,
    c
  ];
  return h.viewBox = v.join(" "), {
    attributes: h,
    viewBox: v,
    body: o
  };
}
const wt = /\sid="(\S+)"/g, ue = /* @__PURE__ */ new Map();
function Ct(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = ue.get(e) || 0;
  return ue.set(e, t + 1), t ? `${e}${t}` : e;
}
function St(e) {
  const t = [];
  let n;
  for (; n = wt.exec(e); ) t.push(n[1]);
  if (!t.length) return e;
  const s = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((i) => {
    const o = Ct(i), r = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + r + ')([")]|\\.[a-z])', "g"), "$1" + o + s + "$3");
  }), e = e.replace(new RegExp(s, "g"), ""), e;
}
const Y = /* @__PURE__ */ Object.create(null);
function xt(e, t) {
  Y[e] = t;
}
function J(e) {
  return Y[e] || Y[""];
}
function te(e) {
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
const ne = /* @__PURE__ */ Object.create(null), O = ["https://api.simplesvg.com", "https://api.unisvg.com"], D = [];
for (; O.length > 0; ) O.length === 1 || Math.random() > 0.5 ? D.push(O.shift()) : D.push(O.pop());
ne[""] = te({ resources: ["https://api.iconify.design"].concat(D) });
function Et(e, t) {
  const n = te(t);
  return n === null ? !1 : (ne[e] = n, !0);
}
function ie(e) {
  return ne[e];
}
const It = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function") return e;
  } catch {
  }
};
let fe = It();
function Pt(e, t) {
  const n = ie(e);
  if (!n) return 0;
  let s;
  if (!n.maxURL) s = 0;
  else {
    let i = 0;
    n.resources.forEach((r) => {
      i = Math.max(i, r.length);
    });
    const o = t + ".json?icons=";
    s = n.maxURL - i - n.path.length - o.length;
  }
  return s;
}
function kt(e) {
  return e === 404;
}
const Tt = (e, t, n) => {
  const s = [], i = Pt(e, t), o = "icons";
  let r = {
    type: o,
    provider: e,
    prefix: t,
    icons: []
  }, l = 0;
  return n.forEach((a, c) => {
    l += a.length + 1, l >= i && c > 0 && (s.push(r), r = {
      type: o,
      provider: e,
      prefix: t,
      icons: []
    }, l = a.length), r.icons.push(a);
  }), s.push(r), s;
};
function Vt(e) {
  if (typeof e == "string") {
    const t = ie(e);
    if (t) return t.path;
  }
  return "/";
}
const Ot = (e, t, n) => {
  if (!fe) {
    n("abort", 424);
    return;
  }
  let s = Vt(t.provider);
  switch (t.type) {
    case "icons": {
      const o = t.prefix, r = t.icons.join(","), l = new URLSearchParams({ icons: r });
      s += o + ".json?" + l.toString();
      break;
    }
    case "custom": {
      const o = t.uri;
      s += o.slice(0, 1) === "/" ? o.slice(1) : o;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let i = 503;
  fe(e + s).then((o) => {
    const r = o.status;
    if (r !== 200) {
      setTimeout(() => {
        n(kt(r) ? "abort" : "next", r);
      });
      return;
    }
    return i = 501, o.json();
  }).then((o) => {
    if (typeof o != "object" || o === null) {
      setTimeout(() => {
        o === 404 ? n("abort", o) : n("next", i);
      });
      return;
    }
    setTimeout(() => {
      n("success", o);
    });
  }).catch(() => {
    n("next", i);
  });
}, At = {
  prepare: Tt,
  send: Ot
};
function Le(e, t) {
  e.forEach((n) => {
    const s = n.loaderCallbacks;
    s && (n.loaderCallbacks = s.filter((i) => i.id !== t));
  });
}
function Rt(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length) return;
    let n = !1;
    const s = e.provider, i = e.prefix;
    t.forEach((o) => {
      const r = o.icons, l = r.pending.length;
      r.pending = r.pending.filter((a) => {
        if (a.prefix !== i) return !0;
        const c = a.name;
        if (e.icons[c]) r.loaded.push({
          provider: s,
          prefix: i,
          name: c
        });
        else if (e.missing.has(c)) r.missing.push({
          provider: s,
          prefix: i,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), r.pending.length !== l && (n || Le([e], o.id), o.callback(r.loaded.slice(0), r.missing.slice(0), r.pending.slice(0), o.abort));
    });
  }));
}
let Lt = 0;
function jt(e, t, n) {
  const s = Lt++, i = Le.bind(null, n, s);
  if (!t.pending.length) return i;
  const o = {
    id: s,
    icons: t,
    callback: e,
    abort: i
  };
  return n.forEach((r) => {
    (r.loaderCallbacks || (r.loaderCallbacks = [])).push(o);
  }), i;
}
function Ft(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  e.sort((i, o) => i.provider !== o.provider ? i.provider.localeCompare(o.provider) : i.prefix !== o.prefix ? i.prefix.localeCompare(o.prefix) : i.name.localeCompare(o.name));
  let s = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((i) => {
    if (s.name === i.name && s.prefix === i.prefix && s.provider === i.provider) return;
    s = i;
    const o = i.provider, r = i.prefix, l = i.name, a = n[o] || (n[o] = /* @__PURE__ */ Object.create(null)), c = a[r] || (a[r] = P(o, r));
    let u;
    l in c.icons ? u = t.loaded : r === "" || c.missing.has(l) ? u = t.missing : u = t.pending;
    const p = {
      provider: o,
      prefix: r,
      name: l
    };
    u.push(p);
  }), t;
}
function Nt(e, t = !0, n = !1) {
  const s = [];
  return e.forEach((i) => {
    const o = typeof i == "string" ? $(i, t, n) : i;
    o && s.push(o);
  }), s;
}
const Dt = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function Mt(e, t, n, s) {
  const i = e.resources.length, o = e.random ? Math.floor(Math.random() * i) : e.index;
  let r;
  if (e.random) {
    let m = e.resources.slice(0);
    for (r = []; m.length > 1; ) {
      const C = Math.floor(Math.random() * m.length);
      r.push(m[C]), m = m.slice(0, C).concat(m.slice(C + 1));
    }
    r = r.concat(m);
  } else r = e.resources.slice(o).concat(e.resources.slice(0, o));
  const l = Date.now();
  let a = "pending", c = 0, u, p = null, h = [], g = [];
  typeof s == "function" && g.push(s);
  function v() {
    p && (clearTimeout(p), p = null);
  }
  function y() {
    a === "pending" && (a = "aborted"), v(), h.forEach((m) => {
      m.status === "pending" && (m.status = "aborted");
    }), h = [];
  }
  function f(m, C) {
    C && (g = []), typeof m == "function" && g.push(m);
  }
  function d() {
    return {
      startTime: l,
      payload: t,
      status: a,
      queriesSent: c,
      queriesPending: h.length,
      subscribe: f,
      abort: y
    };
  }
  function x() {
    a = "failed", g.forEach((m) => {
      m(void 0, u);
    });
  }
  function S() {
    h.forEach((m) => {
      m.status === "pending" && (m.status = "aborted");
    }), h = [];
  }
  function w(m, C, k) {
    const L = C !== "success";
    switch (h = h.filter((E) => E !== m), a) {
      case "pending":
        break;
      case "failed":
        if (L || !e.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (C === "abort") {
      u = k, x();
      return;
    }
    if (L) {
      u = k, h.length || (r.length ? z() : x());
      return;
    }
    if (v(), S(), !e.random) {
      const E = e.resources.indexOf(m.resource);
      E !== -1 && E !== e.index && (e.index = E);
    }
    a = "completed", g.forEach((E) => {
      E(k);
    });
  }
  function z() {
    if (a !== "pending") return;
    v();
    const m = r.shift();
    if (m === void 0) {
      if (h.length) {
        p = setTimeout(() => {
          v(), a === "pending" && (S(), x());
        }, e.timeout);
        return;
      }
      x();
      return;
    }
    const C = {
      status: "pending",
      resource: m,
      callback: (k, L) => {
        w(C, k, L);
      }
    };
    h.push(C), c++, p = setTimeout(z, e.rotate), n(m, t, C.callback);
  }
  return setTimeout(z), d;
}
function je(e) {
  const t = {
    ...Dt,
    ...e
  };
  let n = [];
  function s() {
    n = n.filter((r) => r().status === "pending");
  }
  function i(r, l, a) {
    const c = Mt(t, r, l, (u, p) => {
      s(), a && a(u, p);
    });
    return n.push(c), c;
  }
  function o(r) {
    return n.find((l) => r(l)) || null;
  }
  return {
    query: i,
    find: o,
    setIndex: (r) => {
      t.index = r;
    },
    getIndex: () => t.index,
    cleanup: s
  };
}
function pe() {
}
const K = /* @__PURE__ */ Object.create(null);
function Bt(e) {
  if (!K[e]) {
    const t = ie(e);
    if (!t) return;
    const n = {
      config: t,
      redundancy: je(t)
    };
    K[e] = n;
  }
  return K[e];
}
function $t(e, t, n) {
  let s, i;
  if (typeof e == "string") {
    const o = J(e);
    if (!o)
      return n(void 0, 424), pe;
    i = o.send;
    const r = Bt(e);
    r && (s = r.redundancy);
  } else {
    const o = te(e);
    if (o) {
      s = je(o);
      const r = e.resources ? e.resources[0] : "", l = J(r);
      l && (i = l.send);
    }
  }
  return !s || !i ? (n(void 0, 424), pe) : s.query(t, i, n)().abort;
}
function he() {
}
function Ut(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, Rt(e);
  }));
}
function zt(e) {
  const t = [], n = [];
  return e.forEach((s) => {
    (s.match(Ee) ? t : n).push(s);
  }), {
    valid: t,
    invalid: n
  };
}
function A(e, t, n) {
  function s() {
    const i = e.pendingIcons;
    t.forEach((o) => {
      i && i.delete(o), e.icons[o] || e.missing.add(o);
    });
  }
  if (n && typeof n == "object") try {
    if (!Te(e, n).length) {
      s();
      return;
    }
  } catch (i) {
    console.error(i);
  }
  s(), Ut(e);
}
function de(e, t) {
  e instanceof Promise ? e.then((n) => {
    t(n);
  }).catch(() => {
    t(null);
  }) : t(e);
}
function Ht(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: n, prefix: s } = e, i = e.iconsToLoad;
    if (delete e.iconsToLoad, !i || !i.length) return;
    const o = e.loadIcon;
    if (e.loadIcons && (i.length > 1 || !o)) {
      de(e.loadIcons(i, s, n), (c) => {
        A(e, i, c);
      });
      return;
    }
    if (o) {
      i.forEach((c) => {
        de(o(c, s, n), (u) => {
          A(e, [c], u ? {
            prefix: s,
            icons: { [c]: u }
          } : null);
        });
      });
      return;
    }
    const { valid: r, invalid: l } = zt(i);
    if (l.length && A(e, l, null), !r.length) return;
    const a = s.match(Ee) ? J(n) : null;
    if (!a) {
      A(e, r, null);
      return;
    }
    a.prepare(n, s, r).forEach((c) => {
      $t(n, c, (u) => {
        A(e, c.icons, u);
      });
    });
  }));
}
const Wt = (e, t) => {
  const n = Nt(e, !0, Ve()), s = Ft(n);
  if (!s.pending.length) {
    let a = !0;
    return t && setTimeout(() => {
      a && t(s.loaded, s.missing, s.pending, he);
    }), () => {
      a = !1;
    };
  }
  const i = /* @__PURE__ */ Object.create(null), o = [];
  let r, l;
  return s.pending.forEach((a) => {
    const { provider: c, prefix: u } = a;
    if (u === l && c === r) return;
    r = c, l = u, o.push(P(c, u));
    const p = i[c] || (i[c] = /* @__PURE__ */ Object.create(null));
    p[u] || (p[u] = []);
  }), s.pending.forEach((a) => {
    const { provider: c, prefix: u, name: p } = a, h = P(c, u), g = h.pendingIcons || (h.pendingIcons = /* @__PURE__ */ new Set());
    g.has(p) || (g.add(p), i[c][u].push(p));
  }), o.forEach((a) => {
    const c = i[a.provider][a.prefix];
    c.length && Ht(a, c);
  }), t ? jt(t, s, o) : he;
};
function qt(e, t) {
  const n = { ...e };
  for (const s in t) {
    const i = t[s], o = typeof i;
    s in Ae ? (i === null || i && (o === "string" || o === "number")) && (n[s] = i) : o === typeof n[s] && (n[s] = s === "rotate" ? i % 4 : i);
  }
  return n;
}
const Kt = /[\s,]+/;
function Qt(e, t) {
  t.split(Kt).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function Gt(e, t = 0) {
  const n = e.replace(/^-?[0-9.]*/, "");
  function s(i) {
    for (; i < 0; ) i += 4;
    return i % 4;
  }
  if (n === "") {
    const i = parseInt(e);
    return isNaN(i) ? 0 : s(i);
  } else if (n !== e) {
    let i = 0;
    switch (n) {
      case "%":
        i = 25;
        break;
      case "deg":
        i = 90;
    }
    if (i) {
      let o = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(o) ? 0 : (o = o / i, o % 1 === 0 ? s(o) : 0);
    }
  }
  return t;
}
function Yt(e, t) {
  let n = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const s in t) n += " " + s + '="' + t[s] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
}
function Jt(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function Xt(e) {
  return "data:image/svg+xml," + Jt(e);
}
function Zt(e) {
  return 'url("' + Xt(e) + '")';
}
const me = {
  ...Re,
  inline: !1
}, en = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, tn = {
  display: "inline-block"
}, X = {
  backgroundColor: "currentColor"
}, Fe = {
  backgroundColor: "transparent"
}, ge = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, be = {
  webkitMask: X,
  mask: X,
  background: Fe
};
for (const e in be) {
  const t = be[e];
  for (const n in ge)
    t[e + n] = ge[n];
}
const M = {};
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  M[e + "-flip"] = t, M[e.slice(0, 1) + "-flip"] = t, M[e + "Flip"] = t;
});
function ye(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const ve = (e, t) => {
  const n = qt(me, t), s = { ...en }, i = t.mode || "svg", o = {}, r = t.style, l = typeof r == "object" && !(r instanceof Array) ? r : {};
  for (let y in t) {
    const f = t[y];
    if (f !== void 0)
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
          n[y] = f === !0 || f === "true" || f === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          o.color = f;
          break;
        // Rotation as string
        case "rotate":
          typeof f == "string" ? n[y] = Gt(f) : typeof f == "number" && (n[y] = f);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          f !== !0 && f !== "true" && delete s["aria-hidden"];
          break;
        default: {
          const d = M[y];
          d ? (f === !0 || f === "true" || f === 1) && (n[d] = !0) : me[y] === void 0 && (s[y] = f);
        }
      }
  }
  typeof t.flip == "string" && Qt(n, t.flip);
  const a = _t(e, n), c = a.attributes;
  if (n.inline && (o.verticalAlign = "-0.125em"), i === "svg")
    return s.style = {
      ...o,
      ...l
    }, Object.assign(s, c), s.innerHTML = St(a.body), se("svg", s);
  const { body: u, width: p, height: h } = e, g = i === "mask" || (i === "bg" ? !1 : u.indexOf("currentColor") !== -1), v = Yt(u, {
    ...c,
    width: p + "",
    height: h + ""
  });
  return s.style = {
    ...o,
    "--svg": Zt(v),
    width: ye(c.width),
    height: ye(c.height),
    ...tn,
    ...g ? X : Fe,
    ...l
  }, se("span", s);
};
Ve(!0);
xt("", At);
if (typeof document < "u" && typeof window < "u") {
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((s) => {
      try {
        // Check if item is an object and not null/array
        (typeof s != "object" || s === null || s instanceof Array || // Check for 'icons' and 'prefix'
        typeof s.icons != "object" || typeof s.prefix != "string" || // Add icon set
        !Oe(s)) && console.error(n);
      } catch {
        console.error(n);
      }
    });
  }
  if (e.IconifyProviders !== void 0) {
    const t = e.IconifyProviders;
    if (typeof t == "object" && t !== null)
      for (let n in t) {
        const s = "IconifyProviders[" + n + "] is invalid.";
        try {
          const i = t[n];
          if (typeof i != "object" || !i || i.resources === void 0)
            continue;
          Et(n, i) || console.error(s);
        } catch {
          console.error(s);
        }
      }
  }
}
const nn = {
  ...U,
  body: ""
};
Ce((e, { emit: t }) => {
  const n = _(null);
  function s() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const i = _(!!e.ssr), o = _(""), r = He(null);
  function l() {
    const c = e.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return o.value = "", {
        data: c
      };
    let u;
    if (typeof c != "string" || (u = $(c, !1, !0)) === null)
      return null;
    let p = pt(u);
    if (!p) {
      const v = n.value;
      return (!v || v.name !== c) && (p === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: Wt([u], a)
      }), null;
    }
    s(), o.value !== c && (o.value = c, qe(() => {
      t("load", c);
    }));
    const h = e.customise;
    if (h) {
      p = Object.assign({}, p);
      const v = h(p.body, u.name, u.prefix, u.provider);
      typeof v == "string" && (p.body = v);
    }
    const g = ["iconify"];
    return u.prefix !== "" && g.push("iconify--" + u.prefix), u.provider !== "" && g.push("iconify--" + u.provider), { data: p, classes: g };
  }
  function a() {
    const c = l();
    c ? c.data !== r.value?.data && (r.value = c) : r.value = null;
  }
  return i.value ? a() : Se(() => {
    i.value = !0, a();
  }), xe(() => e.icon, a), We(s), () => {
    const c = r.value;
    if (!c)
      return ve(nn, e);
    let u = e;
    return c.classes && (u = {
      ...e,
      class: c.classes.join(" ")
    }), ve({
      ...U,
      ...c.data
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
var Z = "data-wippy-visible";
function _e(e) {
  const t = e.getAttribute(Z);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var sn = Object.defineProperty, on = (e, t, n) => t in e ? sn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, b = (e, t, n) => on(e, typeof t != "symbol" ? t + "" : t, n), rn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], cn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function we(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function ln(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [s, i] of Object.entries(n)) {
        if ((s === "@light" || s === "@dark") && i && typeof i == "object") {
          for (const [r, l] of Object.entries(i)) {
            const a = typeof l == "string" ? we(r) : null;
            a && t.add(a);
          }
          continue;
        }
        const o = typeof i == "string" ? we(s) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function an(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${cn} {
${t}
}`;
}
function un(e, t) {
  const n = an(t);
  n && Ne(e, n, "@wippy-fe/css-variables-bridge");
}
function fn(e, t) {
  const s = (t ?? rn).map(async (i) => {
    const o = tt[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await nt(o);
    } catch (r) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${o}):`, r), null;
    }
  });
  return Promise.all(s).then((i) => {
    for (const o of i) {
      if (!o)
        continue;
      const r = document.createElement("style");
      r.textContent = o, r.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(r);
    }
  });
}
function pn(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ne(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, i];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", n), s.textContent = t, e.appendChild(s);
}
function hn(e, t) {
  Ne(e, t, "@wippy-fe/custom-css");
}
function De(e) {
  return e.__wippyHost ?? null;
}
function dn(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function mn(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const s = Number.parseFloat(t);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: s };
    }
    case "integer": {
      const s = Number.parseInt(t, 10);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: s };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const s = JSON.parse(t);
        return n.type === "array" && !Array.isArray(s) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: s };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Q(e, t) {
  const n = {}, s = [];
  for (const [i, o] of Object.entries(t.properties)) {
    const r = e.getAttribute(i), l = dn(i);
    if (r === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const a = mn(i, r, o);
    a.error ? s.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: s };
}
var gn = class {
  constructor(e, t) {
    b(this, "_props"), b(this, "_errors"), b(this, "_content"), b(this, "_hostVisibility"), b(this, "_propsListeners", /* @__PURE__ */ new Set()), b(this, "_contentListeners", /* @__PURE__ */ new Set()), b(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), b(this, "_disposed", !1), b(this, "_emitToDom"), b(this, "props"), b(this, "events"), b(this, "content"), b(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(s, i) {
        return n._subscribeProps(s, i);
      }
    }, this.events = {
      emit(s, i) {
        n._disposed || n._emitToDom(s, i);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(s, i) {
        return n._subscribeContent(s, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(s, i) {
        return n._subscribeHostVisibility(s, i);
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
}, bn = class extends HTMLElement {
  constructor() {
    super(), b(this, "_internals"), b(this, "_contentObserver", null), b(this, "_initialized", !1), b(this, "_container", null), b(this, "_reactive", null), b(this, "_lastProps", null), b(this, "_lastErrors", []), b(this, "_lastContent", null), b(this, "_themeUnsub", null), b(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = _e(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Z])];
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
    return De(this);
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
      let n, s;
      if (this._lastProps !== null)
        n = this._lastProps, s = this._lastErrors;
      else {
        const o = Q(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, s = o.errors, this._lastProps = n, this._lastErrors = s;
      }
      const i = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = i), this._reactive = new gn(
        { props: n, errors: s, content: i, hasContent: t, hostVisibility: this._hostVisible },
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
      let s;
      if (t)
        s = this._container;
      else {
        this.onInit(n), e.inlineCss && pn(n, e.inlineCss);
        try {
          const c = re?.theming, u = ln(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          un(n, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = re?.theming, u = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            u && hn(n, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && fn(n, e.hostCssKeys), s = document.createElement("div"), s.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && s.classList.add(...a), n.appendChild(s), this._container = s, Xe(Oe);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Ze("@theme", (a) => this._applyTheme(a)));
      const { props: i, errors: o } = Q(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(i));
      const r = i;
      this._lastProps = r, this._lastErrors = o;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, s, r, o, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = et.getThemeMode?.()) {
    F(e, this), this._container && F(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), F("auto", this), this._container && F("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Z) {
      const l = this._hostVisible, a = _e(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const s = this.constructor.wippyConfig, { props: i, errors: o } = Q(this, s.propsSchema);
    s.validateProps && o.push(...s.validateProps(i));
    const r = i;
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
function yn(e) {
  return e.__wippyHostBus ?? null;
}
function vn(e) {
  return e.dataset.wippyPanelId ?? null;
}
let Me;
const Be = (e) => Me = e, _n = () => Ke() && ee($e) || Me, $e = (
  /* istanbul ignore next */
  Symbol()
);
function wn() {
  const e = Qe(!0), t = e.run(() => _({}));
  let n = [], s = [];
  const i = Ge({
    install(o) {
      Be(i), i._a = o, o.provide($e, i), o.config.globalProperties.$pinia = i, s.forEach((r) => n.push(r)), s = [];
    },
    use(o) {
      return this._a ? n.push(o) : s.push(o), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return i;
}
var Cn = Object.defineProperty, Sn = (e, t, n) => t in e ? Cn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, I = (e, t, n) => Sn(e, typeof t != "symbol" ? t + "" : t, n), Ue = /* @__PURE__ */ Symbol("wippy:emit"), ze = /* @__PURE__ */ Symbol("wippy:props"), xn = /* @__PURE__ */ Symbol("wippy:props_error"), En = /* @__PURE__ */ Symbol("wippy:content"), In = /* @__PURE__ */ Symbol("wippy:panel-id"), Pn = /* @__PURE__ */ Symbol("wippy:layout-bus"), kn = /* @__PURE__ */ Symbol("wippy:host"), Tn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Vn() {
  const e = ee(ze);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function On() {
  const e = ee(Ue);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var An = class extends bn {
  constructor() {
    super(...arguments), I(this, "_vueApp", null), I(this, "_propsRef", _({})), I(this, "_errorsRef", _([])), I(this, "_contentRef", _(null)), I(this, "_hostVisibilityRef", _(null)), I(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, s, i, o) {
    const r = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = s, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of s)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, u) => {
      this._propsRef.value = c, this._errorsRef.value = [...u];
      for (const p of u)
        this.emitEvent("invalid", { message: p });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const a = (c) => {
      if (l.signal.aborted)
        return;
      const u = _n(), p = Ye(c.rootComponent);
      this._vueApp = p;
      const h = wn();
      if (c.piniaPlugins)
        for (const g of c.piniaPlugins)
          h.use(g);
      if (p.use(h), c.plugins)
        for (const g of c.plugins)
          p.use(g);
      p.provide(ze, this._propsRef), p.provide(xn, this._errorsRef), p.provide(Ue, this.emitEvent.bind(this)), p.provide(En, this._contentRef), p.provide(Tn, this._hostVisibilityRef), p.provide(In, vn(this)), p.provide(Pn, yn(this)), p.provide(kn, De(this)), c.providers && c.providers(p, this), p.mount(t), u && Be(u);
    };
    if (r.rootComponent)
      a(r);
    else if (r.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), r.lazyConfig().then((u) => {
        l.signal.aborted || (c.remove(), a(u));
      }).catch((u) => {
        if (l.signal.aborted)
          return;
        const p = u instanceof Error ? u.message : String(u), h = document.createElement("wippy-error");
        h.setAttribute("title", "Failed to load"), h.setAttribute("message", p), c.replaceWith(h), this.emitEvent("error", { message: p });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Rn = { class: "pbpick" }, Ln = { class: "pbpick-field" }, jn = ["value"], Fn = {
  key: 1,
  class: "pbpick-hint"
}, Nn = {
  key: 2,
  class: "pbpick-error",
  role: "alert"
}, Dn = {
  key: 3,
  class: "pbpick-error"
}, Mn = /* @__PURE__ */ Ce({
  __name: "PhantomBusterPicker",
  setup(e) {
    const t = Vn(), n = On(), s = _([]), i = _(""), o = _(!1), r = _(""), l = _(""), a = oe(
      () => s.value.find((f) => u(f) === i.value)
    ), c = oe(
      () => JSON.stringify({ connection_id: i.value })
    );
    function u(f) {
      return f.component_id;
    }
    xe(
      () => t.value.config,
      (f) => {
        i.value = f?.connection_id || "";
      },
      { immediate: !0 }
    );
    function p(f) {
      if (!f) return "";
      const d = String(f.connection_state || f.status || "").toLowerCase(), x = Number(f.expires_at || 0);
      return x > 0 && x <= Math.floor(Date.now() / 1e3) ? "expired" : d === "authenticated" || d === "active" || d === "connected" ? "connected" : d || "unknown";
    }
    function h(f) {
      const d = p(f);
      return d ? d === "connected" ? "Connected" : d === "expired" ? "Expired" : d === "needs_reauth" || d === "reauth_required" ? "Reconnect required" : d === "disabled" ? "Disabled" : d === "unknown" ? "Unknown" : d.replace(/_/g, " ") : "";
    }
    function g() {
      n("config-changed", { connection_id: i.value || void 0 });
    }
    function v(f) {
      const d = f.detail;
      i.value = d?.connection_id || "", g();
    }
    async function y() {
      o.value = !0, r.value = "";
      try {
        const { data: f } = await st.get(
          "/api/v1/connections?provider=phantombuster&limit=100"
        );
        s.value = f?.connections ?? [];
      } catch (f) {
        r.value = f instanceof Error ? f.message : String(f);
      } finally {
        o.value = !1;
      }
    }
    return Se(async () => {
      try {
        await it("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (f) {
        l.value = f instanceof Error ? f.message : "Connection picker unavailable";
      }
      await y();
    }), (f, d) => (T(), V("div", Rn, [
      H("label", Ln, [
        d[0] || (d[0] = H("span", null, "PhantomBuster connection", -1)),
        H("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "phantombuster",
          "reply-only": "false",
          placeholder: "Auto-select default",
          value: c.value,
          onChange: v
        }, null, 40, jn)
      ]),
      a.value ? (T(), V("div", {
        key: 0,
        class: Je(["pbpick-meta", `state-${p(a.value)}`])
      }, W(h(a.value)), 3)) : j("", !0),
      !s.value.length && !o.value ? (T(), V("p", Fn, " No PhantomBuster connection yet. ")) : j("", !0),
      l.value ? (T(), V("p", Nn, " Connection picker unavailable: " + W(l.value), 1)) : j("", !0),
      r.value ? (T(), V("p", Dn, W(r.value), 1)) : j("", !0)
    ]));
  }
}), Bn = ".pbpick{display:grid;gap:8px;color:var(--p-text-color);background:var(--p-content-background);font:inherit}.pbpick-field{display:grid;gap:6px}.pbpick-field span{color:var(--p-text-muted-color);font-size:12px;font-weight:600}.pbpick wc-connection-picker{display:block;width:100%}.pbpick-meta,.pbpick-hint,.pbpick-error{font-size:12px}.pbpick-meta{color:var(--p-success-600, var(--p-success-500))}.pbpick-meta.state-expired,.pbpick-meta.state-needs_reauth,.pbpick-meta.state-reauth_required{color:var(--p-warn-600, var(--p-warn-500))}.pbpick-hint{color:var(--p-text-muted-color)}.pbpick-error{color:var(--p-danger-600, var(--p-danger-500))}", $n = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Trait context with optional connection_id.", properties: { connection_id: { type: "string" } }, additionalProperties: !1 } } } }, Un = {
  wippy: $n
};
class zn extends An {
  static get wippyConfig() {
    return {
      propsSchema: Un.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Bn
    };
  }
  static get vueConfig() {
    return { rootComponent: Mn };
  }
}
ot(import.meta.url, zn);
//# sourceMappingURL=phantombuster_picker.js.map
