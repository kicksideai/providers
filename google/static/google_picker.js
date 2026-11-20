import { defineComponent as Ie, ref as E, shallowRef as Je, onMounted as Pe, watch as ke, onUnmounted as Xe, h as oe, nextTick as Ze, hasInjectionContext as et, inject as ne, effectScope as tt, markRaw as nt, createApp as it, computed as ce, openBlock as k, createElementBlock as T, createElementVNode as N, normalizeClass as st, toDisplayString as z, createCommentVNode as L } from "vue";
import { config as ae, addIcons as rt, on as ot, applyThemeMode as M, host as ct, hostCss as at, loadCss as lt, loadByTagName as ut, api as ft, define as pt } from "@wippy-fe/proxy";
const Te = /^[a-z0-9]+(-[a-z0-9]+)*$/, q = (e, t, n, s = "") => {
  const i = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (i.length < 2 || i.length > 3) return null;
    s = i.shift().slice(1);
  }
  if (i.length > 3 || !i.length) return null;
  if (i.length > 1) {
    const a = i.pop(), l = i.pop(), c = {
      provider: i.length > 0 ? i[0] : s,
      prefix: l,
      name: a
    };
    return t && !$(c) ? null : c;
  }
  const r = i[0], o = r.split("-");
  if (o.length > 1) {
    const a = {
      provider: s,
      prefix: o.shift(),
      name: o.join("-")
    };
    return t && !$(a) ? null : a;
  }
  if (n && s === "") {
    const a = {
      provider: s,
      prefix: "",
      name: r
    };
    return t && !$(a, n) ? null : a;
  }
  return null;
}, $ = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function ht(e, t) {
  const n = e.icons, s = e.aliases || /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  function r(o) {
    if (n[o]) return i[o] = [];
    if (!(o in i)) {
      i[o] = null;
      const a = s[o] && s[o].parent, l = a && r(a);
      l && (i[o] = [a].concat(l));
    }
    return i[o];
  }
  return Object.keys(n).concat(Object.keys(s)).forEach(r), i;
}
const Ae = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), W = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), G = Object.freeze({
  ...Ae,
  ...W
}), J = Object.freeze({
  ...G,
  body: "",
  hidden: !1
});
function dt(e, t) {
  const n = {};
  !e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0);
  const s = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return s && (n.rotate = s), n;
}
function le(e, t) {
  const n = dt(e, t);
  for (const s in J) s in W ? s in e && !(s in n) && (n[s] = W[s]) : s in t ? n[s] = t[s] : s in e && (n[s] = e[s]);
  return n;
}
function mt(e, t, n) {
  const s = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null);
  let r = {};
  function o(a) {
    r = le(s[a] || i[a], r);
  }
  return o(t), n.forEach(o), le(e, r);
}
function Oe(e, t) {
  const n = [];
  if (typeof e != "object" || typeof e.icons != "object") return n;
  e.not_found instanceof Array && e.not_found.forEach((i) => {
    t(i, null), n.push(i);
  });
  const s = ht(e);
  for (const i in s) {
    const r = s[i];
    r && (t(i, mt(e, i, r)), n.push(i));
  }
  return n;
}
const gt = {
  provider: "",
  aliases: {},
  not_found: {},
  ...Ae
};
function K(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function Le(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !K(e, gt)) return null;
  const n = t.icons;
  for (const i in n) {
    const r = n[i];
    if (!i || typeof r.body != "string" || !K(r, J)) return null;
  }
  const s = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const i in s) {
    const r = s[i], o = r.parent;
    if (!i || typeof o != "string" || !n[o] && !s[o] || !K(r, J)) return null;
  }
  return t;
}
const ue = /* @__PURE__ */ Object.create(null);
function yt(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function A(e, t) {
  const n = ue[e] || (ue[e] = /* @__PURE__ */ Object.create(null));
  return n[t] || (n[t] = yt(e, t));
}
function Ve(e, t) {
  return Le(t) ? Oe(t, (n, s) => {
    s ? e.icons[n] = s : e.missing.add(n);
  }) : [];
}
function bt(e, t, n) {
  try {
    if (typeof n.body == "string")
      return e.icons[t] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let j = !1;
function Re(e) {
  return typeof e == "boolean" && (j = e), j;
}
function vt(e) {
  const t = typeof e == "string" ? q(e, !0, j) : e;
  if (t) {
    const n = A(t.provider, t.prefix), s = t.name;
    return n.icons[s] || (n.missing.has(s) ? null : void 0);
  }
}
function _t(e, t) {
  const n = q(e, !0, j);
  if (!n) return !1;
  const s = A(n.provider, n.prefix);
  return t ? bt(s, n.name, t) : (s.missing.add(n.name), !0);
}
function je(e, t) {
  if (typeof e != "object") return !1;
  if (typeof t != "string" && (t = e.provider || ""), j && !t && !e.prefix) {
    let i = !1;
    return Le(e) && (e.prefix = "", Oe(e, (r, o) => {
      _t(r, o) && (i = !0);
    })), i;
  }
  const n = e.prefix;
  if (!$({
    prefix: n,
    name: "a"
  })) return !1;
  const s = A(t, n);
  return !!Ve(s, e);
}
const Fe = Object.freeze({
  width: null,
  height: null
}), Ne = Object.freeze({
  ...Fe,
  ...W
}), wt = /(-?[0-9.]*[0-9]+[0-9.]*)/g, Ct = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function fe(e, t, n) {
  if (t === 1) return e;
  if (n = n || 100, typeof e == "number") return Math.ceil(e * t * n) / n;
  if (typeof e != "string") return e;
  const s = e.split(wt);
  if (s === null || !s.length) return e;
  const i = [];
  let r = s.shift(), o = Ct.test(r);
  for (; ; ) {
    if (o) {
      const a = parseFloat(r);
      isNaN(a) ? i.push(r) : i.push(Math.ceil(a * t * n) / n);
    } else i.push(r);
    if (r = s.shift(), r === void 0) return i.join("");
    o = !o;
  }
}
function St(e, t = "defs") {
  let n = "";
  const s = e.indexOf("<" + t);
  for (; s >= 0; ) {
    const i = e.indexOf(">", s), r = e.indexOf("</" + t);
    if (i === -1 || r === -1) break;
    const o = e.indexOf(">", r);
    if (o === -1) break;
    n += e.slice(i + 1, r).trim(), e = e.slice(0, s).trim() + e.slice(o + 1);
  }
  return {
    defs: n,
    content: e
  };
}
function xt(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function Et(e, t, n) {
  const s = St(e);
  return xt(s.defs, t + s.content + n);
}
const It = (e) => e === "unset" || e === "undefined" || e === "none";
function Pt(e, t) {
  const n = {
    ...G,
    ...e
  }, s = {
    ...Ne,
    ...t
  }, i = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let r = n.body;
  [n, s].forEach((b) => {
    const g = [], x = b.hFlip, p = b.vFlip;
    let h = b.rotate;
    x ? p ? h += 2 : (g.push("translate(" + (i.width + i.left).toString() + " " + (0 - i.top).toString() + ")"), g.push("scale(-1 1)"), i.top = i.left = 0) : p && (g.push("translate(" + (0 - i.left).toString() + " " + (i.height + i.top).toString() + ")"), g.push("scale(1 -1)"), i.top = i.left = 0);
    let w;
    switch (h < 0 && (h -= Math.floor(h / 4) * 4), h = h % 4, h) {
      case 1:
        w = i.height / 2 + i.top, g.unshift("rotate(90 " + w.toString() + " " + w.toString() + ")");
        break;
      case 2:
        g.unshift("rotate(180 " + (i.width / 2 + i.left).toString() + " " + (i.height / 2 + i.top).toString() + ")");
        break;
      case 3:
        w = i.width / 2 + i.left, g.unshift("rotate(-90 " + w.toString() + " " + w.toString() + ")");
    }
    h % 2 === 1 && (i.left !== i.top && (w = i.left, i.left = i.top, i.top = w), i.width !== i.height && (w = i.width, i.width = i.height, i.height = w)), g.length && (r = Et(r, '<g transform="' + g.join(" ") + '">', "</g>"));
  });
  const o = s.width, a = s.height, l = i.width, c = i.height;
  let f, u;
  o === null ? (u = a === null ? "1em" : a === "auto" ? c : a, f = fe(u, l / c)) : (f = o === "auto" ? l : o, u = a === null ? fe(f, c / l) : a === "auto" ? c : a);
  const m = {}, d = (b, g) => {
    It(g) || (m[b] = g.toString());
  };
  d("width", f), d("height", u);
  const v = [
    i.left,
    i.top,
    l,
    c
  ];
  return m.viewBox = v.join(" "), {
    attributes: m,
    viewBox: v,
    body: r
  };
}
const kt = /\sid="(\S+)"/g, pe = /* @__PURE__ */ new Map();
function Tt(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = pe.get(e) || 0;
  return pe.set(e, t + 1), t ? `${e}${t}` : e;
}
function At(e) {
  const t = [];
  let n;
  for (; n = kt.exec(e); ) t.push(n[1]);
  if (!t.length) return e;
  const s = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((i) => {
    const r = Tt(i), o = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + o + ')([")]|\\.[a-z])', "g"), "$1" + r + s + "$3");
  }), e = e.replace(new RegExp(s, "g"), ""), e;
}
const X = /* @__PURE__ */ Object.create(null);
function Ot(e, t) {
  X[e] = t;
}
function Z(e) {
  return X[e] || X[""];
}
function ie(e) {
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
const se = /* @__PURE__ */ Object.create(null), V = ["https://api.simplesvg.com", "https://api.unisvg.com"], B = [];
for (; V.length > 0; ) V.length === 1 || Math.random() > 0.5 ? B.push(V.shift()) : B.push(V.pop());
se[""] = ie({ resources: ["https://api.iconify.design"].concat(B) });
function Lt(e, t) {
  const n = ie(t);
  return n === null ? !1 : (se[e] = n, !0);
}
function re(e) {
  return se[e];
}
const Vt = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function") return e;
  } catch {
  }
};
let he = Vt();
function Rt(e, t) {
  const n = re(e);
  if (!n) return 0;
  let s;
  if (!n.maxURL) s = 0;
  else {
    let i = 0;
    n.resources.forEach((o) => {
      i = Math.max(i, o.length);
    });
    const r = t + ".json?icons=";
    s = n.maxURL - i - n.path.length - r.length;
  }
  return s;
}
function jt(e) {
  return e === 404;
}
const Ft = (e, t, n) => {
  const s = [], i = Rt(e, t), r = "icons";
  let o = {
    type: r,
    provider: e,
    prefix: t,
    icons: []
  }, a = 0;
  return n.forEach((l, c) => {
    a += l.length + 1, a >= i && c > 0 && (s.push(o), o = {
      type: r,
      provider: e,
      prefix: t,
      icons: []
    }, a = l.length), o.icons.push(l);
  }), s.push(o), s;
};
function Nt(e) {
  if (typeof e == "string") {
    const t = re(e);
    if (t) return t.path;
  }
  return "/";
}
const zt = (e, t, n) => {
  if (!he) {
    n("abort", 424);
    return;
  }
  let s = Nt(t.provider);
  switch (t.type) {
    case "icons": {
      const r = t.prefix, o = t.icons.join(","), a = new URLSearchParams({ icons: o });
      s += r + ".json?" + a.toString();
      break;
    }
    case "custom": {
      const r = t.uri;
      s += r.slice(0, 1) === "/" ? r.slice(1) : r;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let i = 503;
  he(e + s).then((r) => {
    const o = r.status;
    if (o !== 200) {
      setTimeout(() => {
        n(jt(o) ? "abort" : "next", o);
      });
      return;
    }
    return i = 501, r.json();
  }).then((r) => {
    if (typeof r != "object" || r === null) {
      setTimeout(() => {
        r === 404 ? n("abort", r) : n("next", i);
      });
      return;
    }
    setTimeout(() => {
      n("success", r);
    });
  }).catch(() => {
    n("next", i);
  });
}, Mt = {
  prepare: Ft,
  send: zt
};
function ze(e, t) {
  e.forEach((n) => {
    const s = n.loaderCallbacks;
    s && (n.loaderCallbacks = s.filter((i) => i.id !== t));
  });
}
function Dt(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length) return;
    let n = !1;
    const s = e.provider, i = e.prefix;
    t.forEach((r) => {
      const o = r.icons, a = o.pending.length;
      o.pending = o.pending.filter((l) => {
        if (l.prefix !== i) return !0;
        const c = l.name;
        if (e.icons[c]) o.loaded.push({
          provider: s,
          prefix: i,
          name: c
        });
        else if (e.missing.has(c)) o.missing.push({
          provider: s,
          prefix: i,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), o.pending.length !== a && (n || ze([e], r.id), r.callback(o.loaded.slice(0), o.missing.slice(0), o.pending.slice(0), r.abort));
    });
  }));
}
let $t = 0;
function Bt(e, t, n) {
  const s = $t++, i = ze.bind(null, n, s);
  if (!t.pending.length) return i;
  const r = {
    id: s,
    icons: t,
    callback: e,
    abort: i
  };
  return n.forEach((o) => {
    (o.loaderCallbacks || (o.loaderCallbacks = [])).push(r);
  }), i;
}
function Ut(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  e.sort((i, r) => i.provider !== r.provider ? i.provider.localeCompare(r.provider) : i.prefix !== r.prefix ? i.prefix.localeCompare(r.prefix) : i.name.localeCompare(r.name));
  let s = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((i) => {
    if (s.name === i.name && s.prefix === i.prefix && s.provider === i.provider) return;
    s = i;
    const r = i.provider, o = i.prefix, a = i.name, l = n[r] || (n[r] = /* @__PURE__ */ Object.create(null)), c = l[o] || (l[o] = A(r, o));
    let f;
    a in c.icons ? f = t.loaded : o === "" || c.missing.has(a) ? f = t.missing : f = t.pending;
    const u = {
      provider: r,
      prefix: o,
      name: a
    };
    f.push(u);
  }), t;
}
function Ht(e, t = !0, n = !1) {
  const s = [];
  return e.forEach((i) => {
    const r = typeof i == "string" ? q(i, t, n) : i;
    r && s.push(r);
  }), s;
}
const Wt = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function qt(e, t, n, s) {
  const i = e.resources.length, r = e.random ? Math.floor(Math.random() * i) : e.index;
  let o;
  if (e.random) {
    let y = e.resources.slice(0);
    for (o = []; y.length > 1; ) {
      const S = Math.floor(Math.random() * y.length);
      o.push(y[S]), y = y.slice(0, S).concat(y.slice(S + 1));
    }
    o = o.concat(y);
  } else o = e.resources.slice(r).concat(e.resources.slice(0, r));
  const a = Date.now();
  let l = "pending", c = 0, f, u = null, m = [], d = [];
  typeof s == "function" && d.push(s);
  function v() {
    u && (clearTimeout(u), u = null);
  }
  function b() {
    l === "pending" && (l = "aborted"), v(), m.forEach((y) => {
      y.status === "pending" && (y.status = "aborted");
    }), m = [];
  }
  function g(y, S) {
    S && (d = []), typeof y == "function" && d.push(y);
  }
  function x() {
    return {
      startTime: a,
      payload: t,
      status: l,
      queriesSent: c,
      queriesPending: m.length,
      subscribe: g,
      abort: b
    };
  }
  function p() {
    l = "failed", d.forEach((y) => {
      y(void 0, f);
    });
  }
  function h() {
    m.forEach((y) => {
      y.status === "pending" && (y.status = "aborted");
    }), m = [];
  }
  function w(y, S, O) {
    const F = S !== "success";
    switch (m = m.filter((P) => P !== y), l) {
      case "pending":
        break;
      case "failed":
        if (F || !e.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (S === "abort") {
      f = O, p();
      return;
    }
    if (F) {
      f = O, m.length || (o.length ? C() : p());
      return;
    }
    if (v(), h(), !e.random) {
      const P = e.resources.indexOf(y.resource);
      P !== -1 && P !== e.index && (e.index = P);
    }
    l = "completed", d.forEach((P) => {
      P(O);
    });
  }
  function C() {
    if (l !== "pending") return;
    v();
    const y = o.shift();
    if (y === void 0) {
      if (m.length) {
        u = setTimeout(() => {
          v(), l === "pending" && (h(), p());
        }, e.timeout);
        return;
      }
      p();
      return;
    }
    const S = {
      status: "pending",
      resource: y,
      callback: (O, F) => {
        w(S, O, F);
      }
    };
    m.push(S), c++, u = setTimeout(C, e.rotate), n(y, t, S.callback);
  }
  return setTimeout(C), x;
}
function Me(e) {
  const t = {
    ...Wt,
    ...e
  };
  let n = [];
  function s() {
    n = n.filter((o) => o().status === "pending");
  }
  function i(o, a, l) {
    const c = qt(t, o, a, (f, u) => {
      s(), l && l(f, u);
    });
    return n.push(c), c;
  }
  function r(o) {
    return n.find((a) => o(a)) || null;
  }
  return {
    query: i,
    find: r,
    setIndex: (o) => {
      t.index = o;
    },
    getIndex: () => t.index,
    cleanup: s
  };
}
function de() {
}
const Q = /* @__PURE__ */ Object.create(null);
function Gt(e) {
  if (!Q[e]) {
    const t = re(e);
    if (!t) return;
    const n = {
      config: t,
      redundancy: Me(t)
    };
    Q[e] = n;
  }
  return Q[e];
}
function Kt(e, t, n) {
  let s, i;
  if (typeof e == "string") {
    const r = Z(e);
    if (!r)
      return n(void 0, 424), de;
    i = r.send;
    const o = Gt(e);
    o && (s = o.redundancy);
  } else {
    const r = ie(e);
    if (r) {
      s = Me(r);
      const o = e.resources ? e.resources[0] : "", a = Z(o);
      a && (i = a.send);
    }
  }
  return !s || !i ? (n(void 0, 424), de) : s.query(t, i, n)().abort;
}
function me() {
}
function Qt(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, Dt(e);
  }));
}
function Yt(e) {
  const t = [], n = [];
  return e.forEach((s) => {
    (s.match(Te) ? t : n).push(s);
  }), {
    valid: t,
    invalid: n
  };
}
function R(e, t, n) {
  function s() {
    const i = e.pendingIcons;
    t.forEach((r) => {
      i && i.delete(r), e.icons[r] || e.missing.add(r);
    });
  }
  if (n && typeof n == "object") try {
    if (!Ve(e, n).length) {
      s();
      return;
    }
  } catch (i) {
    console.error(i);
  }
  s(), Qt(e);
}
function ge(e, t) {
  e instanceof Promise ? e.then((n) => {
    t(n);
  }).catch(() => {
    t(null);
  }) : t(e);
}
function Jt(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: n, prefix: s } = e, i = e.iconsToLoad;
    if (delete e.iconsToLoad, !i || !i.length) return;
    const r = e.loadIcon;
    if (e.loadIcons && (i.length > 1 || !r)) {
      ge(e.loadIcons(i, s, n), (c) => {
        R(e, i, c);
      });
      return;
    }
    if (r) {
      i.forEach((c) => {
        ge(r(c, s, n), (f) => {
          R(e, [c], f ? {
            prefix: s,
            icons: { [c]: f }
          } : null);
        });
      });
      return;
    }
    const { valid: o, invalid: a } = Yt(i);
    if (a.length && R(e, a, null), !o.length) return;
    const l = s.match(Te) ? Z(n) : null;
    if (!l) {
      R(e, o, null);
      return;
    }
    l.prepare(n, s, o).forEach((c) => {
      Kt(n, c, (f) => {
        R(e, c.icons, f);
      });
    });
  }));
}
const Xt = (e, t) => {
  const n = Ht(e, !0, Re()), s = Ut(n);
  if (!s.pending.length) {
    let l = !0;
    return t && setTimeout(() => {
      l && t(s.loaded, s.missing, s.pending, me);
    }), () => {
      l = !1;
    };
  }
  const i = /* @__PURE__ */ Object.create(null), r = [];
  let o, a;
  return s.pending.forEach((l) => {
    const { provider: c, prefix: f } = l;
    if (f === a && c === o) return;
    o = c, a = f, r.push(A(c, f));
    const u = i[c] || (i[c] = /* @__PURE__ */ Object.create(null));
    u[f] || (u[f] = []);
  }), s.pending.forEach((l) => {
    const { provider: c, prefix: f, name: u } = l, m = A(c, f), d = m.pendingIcons || (m.pendingIcons = /* @__PURE__ */ new Set());
    d.has(u) || (d.add(u), i[c][f].push(u));
  }), r.forEach((l) => {
    const c = i[l.provider][l.prefix];
    c.length && Jt(l, c);
  }), t ? Bt(t, s, r) : me;
};
function Zt(e, t) {
  const n = { ...e };
  for (const s in t) {
    const i = t[s], r = typeof i;
    s in Fe ? (i === null || i && (r === "string" || r === "number")) && (n[s] = i) : r === typeof n[s] && (n[s] = s === "rotate" ? i % 4 : i);
  }
  return n;
}
const en = /[\s,]+/;
function tn(e, t) {
  t.split(en).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function nn(e, t = 0) {
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
      let r = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(r) ? 0 : (r = r / i, r % 1 === 0 ? s(r) : 0);
    }
  }
  return t;
}
function sn(e, t) {
  let n = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const s in t) n += " " + s + '="' + t[s] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
}
function rn(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function on(e) {
  return "data:image/svg+xml," + rn(e);
}
function cn(e) {
  return 'url("' + on(e) + '")';
}
const ye = {
  ...Ne,
  inline: !1
}, an = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, ln = {
  display: "inline-block"
}, ee = {
  backgroundColor: "currentColor"
}, De = {
  backgroundColor: "transparent"
}, be = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, ve = {
  webkitMask: ee,
  mask: ee,
  background: De
};
for (const e in ve) {
  const t = ve[e];
  for (const n in be)
    t[e + n] = be[n];
}
const U = {};
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  U[e + "-flip"] = t, U[e.slice(0, 1) + "-flip"] = t, U[e + "Flip"] = t;
});
function _e(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const we = (e, t) => {
  const n = Zt(ye, t), s = { ...an }, i = t.mode || "svg", r = {}, o = t.style, a = typeof o == "object" && !(o instanceof Array) ? o : {};
  for (let b in t) {
    const g = t[b];
    if (g !== void 0)
      switch (b) {
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
          n[b] = g === !0 || g === "true" || g === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          r.color = g;
          break;
        // Rotation as string
        case "rotate":
          typeof g == "string" ? n[b] = nn(g) : typeof g == "number" && (n[b] = g);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          g !== !0 && g !== "true" && delete s["aria-hidden"];
          break;
        default: {
          const x = U[b];
          x ? (g === !0 || g === "true" || g === 1) && (n[x] = !0) : ye[b] === void 0 && (s[b] = g);
        }
      }
  }
  typeof t.flip == "string" && tn(n, t.flip);
  const l = Pt(e, n), c = l.attributes;
  if (n.inline && (r.verticalAlign = "-0.125em"), i === "svg")
    return s.style = {
      ...r,
      ...a
    }, Object.assign(s, c), s.innerHTML = At(l.body), oe("svg", s);
  const { body: f, width: u, height: m } = e, d = i === "mask" || (i === "bg" ? !1 : f.indexOf("currentColor") !== -1), v = sn(f, {
    ...c,
    width: u + "",
    height: m + ""
  });
  return s.style = {
    ...r,
    "--svg": cn(v),
    width: _e(c.width),
    height: _e(c.height),
    ...ln,
    ...d ? ee : De,
    ...a
  }, oe("span", s);
};
Re(!0);
Ot("", Mt);
if (typeof document < "u" && typeof window < "u") {
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((s) => {
      try {
        // Check if item is an object and not null/array
        (typeof s != "object" || s === null || s instanceof Array || // Check for 'icons' and 'prefix'
        typeof s.icons != "object" || typeof s.prefix != "string" || // Add icon set
        !je(s)) && console.error(n);
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
          Lt(n, i) || console.error(s);
        } catch {
          console.error(s);
        }
      }
  }
}
const un = {
  ...G,
  body: ""
};
Ie((e, { emit: t }) => {
  const n = E(null);
  function s() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const i = E(!!e.ssr), r = E(""), o = Je(null);
  function a() {
    const c = e.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return r.value = "", {
        data: c
      };
    let f;
    if (typeof c != "string" || (f = q(c, !1, !0)) === null)
      return null;
    let u = vt(f);
    if (!u) {
      const v = n.value;
      return (!v || v.name !== c) && (u === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: Xt([f], l)
      }), null;
    }
    s(), r.value !== c && (r.value = c, Ze(() => {
      t("load", c);
    }));
    const m = e.customise;
    if (m) {
      u = Object.assign({}, u);
      const v = m(u.body, f.name, f.prefix, f.provider);
      typeof v == "string" && (u.body = v);
    }
    const d = ["iconify"];
    return f.prefix !== "" && d.push("iconify--" + f.prefix), f.provider !== "" && d.push("iconify--" + f.provider), { data: u, classes: d };
  }
  function l() {
    const c = a();
    c ? c.data !== o.value?.data && (o.value = c) : o.value = null;
  }
  return i.value ? l() : Pe(() => {
    i.value = !0, l();
  }), ke(() => e.icon, l), Xe(s), () => {
    const c = o.value;
    if (!c)
      return we(un, e);
    let f = e;
    return c.classes && (f = {
      ...e,
      class: c.classes.join(" ")
    }), we({
      ...G,
      ...c.data
    }, f);
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
var te = "data-wippy-visible";
function Ce(e) {
  const t = e.getAttribute(te);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var fn = Object.defineProperty, $e = (e) => {
  throw TypeError(e);
}, pn = (e, t, n) => t in e ? fn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, _ = (e, t, n) => pn(e, typeof t != "symbol" ? t + "" : t, n), Be = (e, t, n) => t.has(e) || $e("Cannot " + n), hn = (e, t, n) => (Be(e, t, "read from private field"), n ? n.call(e) : t.get(e)), dn = (e, t, n) => t.has(e) ? $e("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), mn = (e, t, n, s) => (Be(e, t, "write to private field"), t.set(e, n), n), gn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Se(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function bn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [s, i] of Object.entries(n)) {
        if ((s === "@light" || s === "@dark") && i && typeof i == "object") {
          for (const [o, a] of Object.entries(i)) {
            const l = typeof a == "string" ? Se(o) : null;
            l && t.add(l);
          }
          continue;
        }
        const r = typeof i == "string" ? Se(s) : null;
        r && t.add(r);
      }
  return [...t].sort();
}
function vn(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${yn} {
${t}
}`;
}
function _n(e, t) {
  const n = vn(t);
  n && Ue(e, n, "@wippy-fe/css-variables-bridge");
}
function wn(e, t) {
  const s = (t ?? gn).map(async (i) => {
    const r = at[i];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await lt(r);
    } catch (o) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${r}):`, o), null;
    }
  });
  return Promise.all(s).then((i) => {
    for (const r of i) {
      if (!r)
        continue;
      const o = document.createElement("style");
      o.textContent = r, o.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(o);
    }
  });
}
function Cn(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ue(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, i];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", n), s.textContent = t, e.appendChild(s);
}
function Sn(e, t) {
  Ue(e, t, "@wippy-fe/custom-css");
}
function He(e) {
  return e.__wippyHost ?? null;
}
function xn(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function En(e, t, n) {
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
function Y(e, t) {
  const n = {}, s = [];
  for (const [i, r] of Object.entries(t.properties)) {
    const o = e.getAttribute(i), a = xn(i);
    if (o === null) {
      r.default !== void 0 && (n[a] = r.default);
      continue;
    }
    const l = En(i, o, r);
    l.error ? s.push(l.error) : n[a] = l.value;
  }
  return { props: n, errors: s };
}
var In = class {
  constructor(e, t) {
    _(this, "_props"), _(this, "_errors"), _(this, "_content"), _(this, "_hostVisibility"), _(this, "_propsListeners", /* @__PURE__ */ new Set()), _(this, "_contentListeners", /* @__PURE__ */ new Set()), _(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), _(this, "_disposed", !1), _(this, "_emitToDom"), _(this, "props"), _(this, "events"), _(this, "content"), _(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, H, Pn = class extends HTMLElement {
  constructor() {
    super(), _(this, "_internals"), _(this, "_contentObserver", null), _(this, "_initialized", !1), _(this, "_container", null), dn(this, H, null), _(this, "_attachment", 0), _(this, "_reactive", null), _(this, "_lastProps", null), _(this, "_lastErrors", []), _(this, "_lastContent", null), _(this, "_themeUnsub", null), _(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ce(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, te])];
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
    return He(this);
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
        const r = Y(this, e.propsSchema);
        e.validateProps && r.errors.push(...e.validateProps(r.props)), n = r.props, s = r.errors, this._lastProps = n, this._lastErrors = s;
      }
      const i = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = i), this._reactive = new In(
        { props: n, errors: s, content: i, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const e = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, n = this._initialized, s = hn(this, H) ?? mn(this, H, this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" }));
      let i;
      if (this._container)
        i = this._container;
      else {
        if (this.onInit(s), e !== this._attachment)
          return;
        t.inlineCss && Cn(s, t.inlineCss);
        try {
          const f = ae?.theming, u = bn(
            f?.global?.cssVariables,
            f?.children?.cssVariables
          );
          _n(s, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const f = ae?.theming, u = [f?.global?.customCSS, f?.children?.customCSS].filter(Boolean).join(`
`);
            u && Sn(s, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && wn(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = t.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, rt(je);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ot("@theme", (c) => this._applyTheme(c)));
      const { props: r, errors: o } = Y(this, t.propsSchema);
      t.validateProps && o.push(...t.validateProps(r));
      const a = r;
      this._lastProps = a, this._lastErrors = o;
      let l = null;
      if (t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(t.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, a, o, l, n), e !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), e === this._attachment && this.emitEvent("load");
    } catch (t) {
      if (e !== this._attachment || (this.onError(t), e !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: t instanceof Error ? t.message : String(t),
        error: t
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
  _applyTheme(e = ct.getThemeMode?.()) {
    M(e, this), this._container && M(e, this._container);
  }
  disconnectedCallback() {
    const e = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), M("auto", this), this._container && M("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), e === this._attachment && (this.emitEvent("unload"), e === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === te) {
      const a = this._hostVisible, l = Ce(this);
      if (l === a)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, a), this.onHostVisibilityChanged(l, a));
      return;
    }
    const s = this.constructor.wippyConfig, { props: i, errors: r } = Y(this, s.propsSchema);
    s.validateProps && r.push(...s.validateProps(i));
    const o = i;
    this._lastProps = o, this._lastErrors = r, this._reactive?.notifyProps(o, r), this.onPropsChanged(o, r);
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
   *
   * A template keeps its children in one of two places. Parsed HTML (page
   * markup, `innerHTML`) puts them in `template.content`, a DocumentFragment.
   * DOM APIs add them as the template element's own child nodes and leave
   * `template.content` empty: that is how a Vue SFC sets
   * `<template data-type="...">{{ text }}</template>`. The content fragment is
   * read first, then the element's own children. Only text is returned, never
   * markup, in both cases.
   */
  _extractContent(e) {
    const t = this.querySelector(`template[data-type="${e}"]`);
    return t ? t.content.textContent?.trim() || t.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
H = /* @__PURE__ */ new WeakMap();
function kn(e) {
  return e.__wippyHostBus ?? null;
}
function Tn(e) {
  return e.dataset.wippyPanelId ?? null;
}
let We;
const qe = (e) => We = e, An = () => et() && ne(Ge) || We, Ge = (
  /* istanbul ignore next */
  Symbol()
);
function On() {
  const e = tt(!0), t = e.run(() => E({}));
  let n = [], s = [];
  const i = nt({
    install(r) {
      qe(i), i._a = r, r.provide(Ge, i), r.config.globalProperties.$pinia = i, s.forEach((o) => n.push(o)), s = [];
    },
    use(r) {
      return this._a ? n.push(r) : s.push(r), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return i;
}
var Ln = Object.defineProperty, Vn = (e, t, n) => t in e ? Ln(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, I = (e, t, n) => Vn(e, typeof t != "symbol" ? t + "" : t, n);
function xe(e, t, n) {
  const s = e.createElement("div"), i = n ? t.failed : t.loading;
  s.dataset.lazyState = n ? "failed" : "loading", s.setAttribute("role", n ? "alert" : "status"), s.setAttribute("aria-label", i), s.style.cssText = "display:grid;place-items:center;text-align:center;";
  const r = t.surface === "page";
  if (s.style.cssText += r ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    s.style.color = "var(--p-danger-500, currentColor)", s.textContent = !r && t.iconOnly ? "⚠" : i, !r && t.iconOnly && (s.title = i);
  else {
    const o = e.createElement("style");
    o.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const a = e.createElement("span");
    a.dataset.wippySpinner = "", a.setAttribute("aria-hidden", "true"), a.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", a.style.fontSize = r ? "2rem" : "1em", s.append(o, a);
  }
  return s;
}
var Ke = /* @__PURE__ */ Symbol("wippy:emit"), Qe = /* @__PURE__ */ Symbol("wippy:props"), Rn = /* @__PURE__ */ Symbol("wippy:props_error"), jn = /* @__PURE__ */ Symbol("wippy:content"), Fn = /* @__PURE__ */ Symbol("wippy:panel-id"), Nn = /* @__PURE__ */ Symbol("wippy:layout-bus"), zn = /* @__PURE__ */ Symbol("wippy:host"), Mn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Dn() {
  const e = ne(Qe);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function $n() {
  const e = ne(Ke);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var D = /* @__PURE__ */ new WeakMap();
function Ee(e, t) {
  const n = D.get(e);
  if (n)
    return n;
  const s = Promise.resolve().then(t);
  return D.set(e, s), s.catch(() => {
    D.get(e) === s && D.delete(e);
  }), s;
}
var Bn = class extends Pn {
  constructor() {
    super(...arguments), I(this, "_vueApp", null), I(this, "_mountingApp", !1), I(this, "_mountState", "idle"), I(this, "_feedback", null), I(this, "_propsRef", E({})), I(this, "_errorsRef", E([])), I(this, "_contentRef", E(null)), I(this, "_hostVisibilityRef", E(null)), I(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const e = this.vueConfig;
    e.mountLifecycle && !e.rootComponent && e.lazyConfig && await Ee(this, e.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(e, t, n, s, i, r) {
    const o = this.constructor, a = o.vueConfig, l = new AbortController();
    this._bridgeAbort = l;
    const c = () => !l.signal.aborted && this._bridgeAbort === l;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = s, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of s)
      if (this.emitEvent("invalid", { message: u }), !c())
        return;
    this.reactive.props.subscribe((u, m) => {
      this._propsRef.value = u, this._errorsRef.value = [...m];
      for (const d of m)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const f = (u) => {
      if (!c())
        return;
      const m = An(), d = it(u.rootComponent);
      let v = !1, b = !1, g, x;
      this._mountingApp = !0;
      try {
        const p = On();
        if (u.piniaPlugins)
          for (const h of u.piniaPlugins)
            p.use(h);
        d.use(p);
        for (const h of u.plugins ?? [])
          d.use(h);
        if (d.provide(Qe, this._propsRef), d.provide(Rn, this._errorsRef), d.provide(Ke, this.emitEvent.bind(this)), d.provide(jn, this._contentRef), d.provide(Mn, this._hostVisibilityRef), d.provide(Fn, Tn(this)), d.provide(Nn, kn(this)), d.provide(zn, He(this)), u.providers?.(d, this), !c())
          return;
        if (x = d.config.errorHandler, a.mountLifecycle && (d.config.errorHandler = (h, w, C) => {
          b || (g = h), b = !0, x?.(h, w, C);
        }), d.mount(t), v = !0, b)
          throw g;
        c() && (this._vueApp = d);
      } finally {
        a.mountLifecycle && v && (d.config.errorHandler = x);
        try {
          v && (b || !c()) && d.unmount();
        } finally {
          qe(m), this._mountingApp = !1;
        }
      }
      a.mountLifecycle && queueMicrotask(() => {
        c() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (a.rootComponent) {
      if (this._mountingApp && a.mountLifecycle) {
        queueMicrotask(() => {
          try {
            f(a);
          } catch (u) {
            c() && (this._mountState = "failed", this.emitEvent("error", { message: u instanceof Error ? u.message : String(u), error: u }));
          }
        });
        return;
      }
      try {
        f(a);
      } catch (u) {
        if (c())
          throw this._mountState = "failed", u;
      }
    } else if (a.lazyConfig) {
      const u = t.ownerDocument, m = a.lazyUi;
      m?.surface === "page" && (t.style.blockSize = "100%", t.style.minBlockSize = "0");
      let d = !1, v, b;
      const g = () => {
        clearTimeout(v), clearTimeout(b), this._feedback?.remove(), this._feedback = null;
      };
      l.signal.addEventListener("abort", g, { once: !0 });
      const x = () => {
        if (!c() || d)
          return;
        const C = m ? xe(u, m, !1) : u.createElement("wippy-loading");
        C.setAttribute("no-bg", ""), this._feedback = C, t.appendChild(C);
      }, p = (C) => {
        if (!c())
          return;
        d = !0, g(), this._mountState = "failed";
        const y = m?.failed ?? (C instanceof Error ? C.message : String(C)), S = m ? xe(u, m, !0) : u.createElement("wippy-error");
        m || (S.setAttribute("title", "Failed to load"), S.setAttribute("message", y)), this._feedback = S, t.appendChild(S), this.emitEvent("error", m ? { message: y, error: C } : { message: y });
      }, h = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      h > 0 ? v = setTimeout(x, h) : x(), m && (b = setTimeout(() => p(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (a.mountLifecycle ? Ee(o, a.lazyConfig) : a.lazyConfig()).then((C) => {
        !c() || d || (d = !0, g(), f(C));
      }, (C) => {
        d || p(C);
      }).catch(p);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const e = this._vueApp;
    this._vueApp = null, e?.unmount();
  }
};
const Un = { class: "gpick" }, Hn = { class: "gfield" }, Wn = ["value"], qn = { key: 0 }, Gn = {
  key: 1,
  class: "ghint"
}, Kn = {
  key: 2,
  class: "gerr",
  role: "alert"
}, Qn = {
  key: 3,
  class: "gerr"
}, Yn = /* @__PURE__ */ Ie({
  __name: "GooglePicker",
  setup(e) {
    const t = Dn(), n = $n(), s = E([]), i = E(""), r = E(!1), o = E(""), a = E("");
    ke(
      () => t.value.config,
      (p) => {
        i.value = p?.connection_id || "";
      },
      { immediate: !0 }
    );
    const l = ce(
      () => s.value.find((p) => p.component_id === i.value)
    ), c = ce(
      () => JSON.stringify({ connection_id: i.value })
    );
    function f(p) {
      if (!p) return "";
      const h = String(p.connection_state || p.status || "").toLowerCase(), w = Number(p.expires_at || 0);
      return w > 0 && w <= Math.floor(Date.now() / 1e3) ? "expired" : h === "authenticated" || h === "active" || h === "connected" ? "connected" : h || "unknown";
    }
    function u(p) {
      const h = f(p);
      return h ? h === "connected" ? "Connected" : h === "expired" ? "Token expired" : h === "needs_reauth" || h === "reauth_required" ? "Reconnect required" : h === "disabled" ? "Disabled" : h === "unknown" ? "Unknown" : h.replace(/_/g, " ") : "";
    }
    function m(p) {
      return p?.scopes_granted ? Array.isArray(p.scopes_granted) ? p.scopes_granted : String(p.scopes_granted).split(/\s+/).filter(Boolean) : [];
    }
    function d(p) {
      return p === "openid" ? "Sign in" : p.includes("/auth/gmail") ? "Gmail" : p.includes("/auth/drive") ? "Drive" : p.includes("/auth/calendar") ? "Calendar" : p.includes("/auth/documents") ? "Docs" : p.includes("/auth/spreadsheets") ? "Sheets" : p.includes("/auth/presentations") ? "Slides" : p.includes("/auth/contacts") ? "Contacts" : p.includes("/auth/analytics") ? "Analytics" : p.includes("/auth/userinfo.email") ? "Email" : p.includes("/auth/userinfo.profile") ? "Profile" : p.replace(/^https:\/\/www\.googleapis\.com\/auth\//, "");
    }
    function v(p) {
      const h = [...new Set(m(p).map(d))], w = h.length || Number(p?.scope_count || 0);
      if (!w) return "";
      if (!h.length) return `${w} scope${w === 1 ? "" : "s"}`;
      const C = h.slice(0, 4).join(", "), y = h.length > 4 ? ` +${h.length - 4}` : "";
      return `${C}${y}`;
    }
    function b() {
      n("config-changed", { connection_id: i.value || void 0 });
    }
    function g(p) {
      const h = p.detail;
      i.value = h?.connection_id || "", b();
    }
    async function x() {
      r.value = !0, o.value = "";
      try {
        const { data: p } = await ft.get(
          "/api/v1/connections?provider=google&limit=100"
        );
        s.value = p?.connections ?? [];
      } catch (p) {
        o.value = p instanceof Error ? p.message : String(p);
      } finally {
        r.value = !1;
      }
    }
    return Pe(async () => {
      try {
        await ut("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (p) {
        a.value = p instanceof Error ? p.message : "Connection picker unavailable";
      }
      await x();
    }), (p, h) => (k(), T("div", Un, [
      N("label", Hn, [
        h[0] || (h[0] = N("span", null, "Google connection", -1)),
        N("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "google",
          "reply-only": "false",
          placeholder: "Auto-select default",
          value: c.value,
          onChange: g
        }, null, 40, Wn)
      ]),
      l.value ? (k(), T("div", {
        key: 0,
        class: st(["gmeta", `state-${f(l.value)}`])
      }, [
        N("span", null, z(u(l.value)), 1),
        v(l.value) ? (k(), T("span", qn, " · " + z(v(l.value)), 1)) : L("", !0)
      ], 2)) : L("", !0),
      !s.value.length && !r.value ? (k(), T("p", Gn, " No Google connection yet. ")) : L("", !0),
      a.value ? (k(), T("p", Kn, " Connection picker unavailable: " + z(a.value), 1)) : L("", !0),
      o.value ? (k(), T("p", Qn, z(o.value), 1)) : L("", !0)
    ]));
  }
}), Jn = ".gpick{display:grid;gap:8px;color:var(--p-text-color);font:13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.gfield{display:grid;gap:6px}.gfield span{font-size:12px;font-weight:650;color:var(--p-text-muted-color)}.gfield wc-connection-picker{display:block;width:100%;min-height:36px}.gmeta{width:fit-content;border-radius:6px;padding:4px 8px;font-size:12px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.gmeta.state-connected{color:var(--p-success-600);background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.gmeta.state-expired,.gmeta.state-needs_reauth,.gmeta.state-reauth_required{color:var(--p-danger-600);background:color-mix(in srgb,var(--p-danger-500) 12%,transparent)}.ghint,.gerr{margin:0;font-size:12px}.ghint{color:var(--p-text-muted-color)}.gerr{color:var(--p-danger-600)}", Xn = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Trait context with optional connection_id.", properties: { connection_id: { type: "string" } } } } } }, Zn = {
  wippy: Xn
};
class Ye extends Bn {
  static get wippyConfig() {
    return {
      propsSchema: Zn.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Jn
    };
  }
  static get vueConfig() {
    return { rootComponent: Yn };
  }
}
async function ni() {
  return Ye;
}
pt(import.meta.url, Ye);
export {
  ni as webComponent
};
//# sourceMappingURL=google_picker.js.map
