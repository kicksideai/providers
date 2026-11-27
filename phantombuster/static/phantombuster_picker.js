import { defineComponent as kt, ref as E, shallowRef as Jt, onMounted as It, watch as Pt, onUnmounted as Xt, h as rt, nextTick as Zt, hasInjectionContext as te, inject as nt, effectScope as ee, markRaw as ne, createApp as ie, computed as ct, openBlock as A, createElementBlock as O, createElementVNode as q, normalizeClass as se, toDisplayString as K, createCommentVNode as F } from "vue";
import { config as at, addIcons as oe, on as re, applyThemeMode as N, host as ce, hostCss as ae, loadCss as le, loadByTagName as ue, api as fe, define as pe } from "@wippy-fe/proxy";
const Tt = /^[a-z0-9]+(-[a-z0-9]+)*$/, U = (t, e, n, s = "") => {
  const i = t.split(":");
  if (t.slice(0, 1) === "@") {
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
    return e && !M(c) ? null : c;
  }
  const o = i[0], r = o.split("-");
  if (r.length > 1) {
    const a = {
      provider: s,
      prefix: r.shift(),
      name: r.join("-")
    };
    return e && !M(a) ? null : a;
  }
  if (n && s === "") {
    const a = {
      provider: s,
      prefix: "",
      name: o
    };
    return e && !M(a, n) ? null : a;
  }
  return null;
}, M = (t, e) => t ? !!((e && t.prefix === "" || t.prefix) && t.name) : !1;
function he(t, e) {
  const n = t.icons, s = t.aliases || /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  function o(r) {
    if (n[r]) return i[r] = [];
    if (!(r in i)) {
      i[r] = null;
      const a = s[r] && s[r].parent, l = a && o(a);
      l && (i[r] = [a].concat(l));
    }
    return i[r];
  }
  return Object.keys(n).concat(Object.keys(s)).forEach(o), i;
}
const At = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), H = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), W = Object.freeze({
  ...At,
  ...H
}), J = Object.freeze({
  ...W,
  body: "",
  hidden: !1
});
function de(t, e) {
  const n = {};
  !t.hFlip != !e.hFlip && (n.hFlip = !0), !t.vFlip != !e.vFlip && (n.vFlip = !0);
  const s = ((t.rotate || 0) + (e.rotate || 0)) % 4;
  return s && (n.rotate = s), n;
}
function lt(t, e) {
  const n = de(t, e);
  for (const s in J) s in H ? s in t && !(s in n) && (n[s] = H[s]) : s in e ? n[s] = e[s] : s in t && (n[s] = t[s]);
  return n;
}
function me(t, e, n) {
  const s = t.icons, i = t.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function r(a) {
    o = lt(s[a] || i[a], o);
  }
  return r(e), n.forEach(r), lt(t, o);
}
function Ot(t, e) {
  const n = [];
  if (typeof t != "object" || typeof t.icons != "object") return n;
  t.not_found instanceof Array && t.not_found.forEach((i) => {
    e(i, null), n.push(i);
  });
  const s = he(t);
  for (const i in s) {
    const o = s[i];
    o && (e(i, me(t, i, o)), n.push(i));
  }
  return n;
}
const ge = {
  provider: "",
  aliases: {},
  not_found: {},
  ...At
};
function Q(t, e) {
  for (const n in e) if (n in t && typeof t[n] != typeof e[n]) return !1;
  return !0;
}
function Vt(t) {
  if (typeof t != "object" || t === null) return null;
  const e = t;
  if (typeof e.prefix != "string" || !t.icons || typeof t.icons != "object" || !Q(t, ge)) return null;
  const n = e.icons;
  for (const i in n) {
    const o = n[i];
    if (!i || typeof o.body != "string" || !Q(o, J)) return null;
  }
  const s = e.aliases || /* @__PURE__ */ Object.create(null);
  for (const i in s) {
    const o = s[i], r = o.parent;
    if (!i || typeof r != "string" || !n[r] && !s[r] || !Q(o, J)) return null;
  }
  return e;
}
const ut = /* @__PURE__ */ Object.create(null);
function ye(t, e) {
  return {
    provider: t,
    prefix: e,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function P(t, e) {
  const n = ut[t] || (ut[t] = /* @__PURE__ */ Object.create(null));
  return n[e] || (n[e] = ye(t, e));
}
function Lt(t, e) {
  return Vt(e) ? Ot(e, (n, s) => {
    s ? t.icons[n] = s : t.missing.add(n);
  }) : [];
}
function be(t, e, n) {
  try {
    if (typeof n.body == "string")
      return t.icons[e] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let R = !1;
function Rt(t) {
  return typeof t == "boolean" && (R = t), R;
}
function ve(t) {
  const e = typeof t == "string" ? U(t, !0, R) : t;
  if (e) {
    const n = P(e.provider, e.prefix), s = e.name;
    return n.icons[s] || (n.missing.has(s) ? null : void 0);
  }
}
function _e(t, e) {
  const n = U(t, !0, R);
  if (!n) return !1;
  const s = P(n.provider, n.prefix);
  return e ? be(s, n.name, e) : (s.missing.add(n.name), !0);
}
function jt(t, e) {
  if (typeof t != "object") return !1;
  if (typeof e != "string" && (e = t.provider || ""), R && !e && !t.prefix) {
    let i = !1;
    return Vt(t) && (t.prefix = "", Ot(t, (o, r) => {
      _e(o, r) && (i = !0);
    })), i;
  }
  const n = t.prefix;
  if (!M({
    prefix: n,
    name: "a"
  })) return !1;
  const s = P(e, n);
  return !!Lt(s, t);
}
const Ft = Object.freeze({
  width: null,
  height: null
}), Nt = Object.freeze({
  ...Ft,
  ...H
}), we = /(-?[0-9.]*[0-9]+[0-9.]*)/g, Ce = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function ft(t, e, n) {
  if (e === 1) return t;
  if (n = n || 100, typeof t == "number") return Math.ceil(t * e * n) / n;
  if (typeof t != "string") return t;
  const s = t.split(we);
  if (s === null || !s.length) return t;
  const i = [];
  let o = s.shift(), r = Ce.test(o);
  for (; ; ) {
    if (r) {
      const a = parseFloat(o);
      isNaN(a) ? i.push(o) : i.push(Math.ceil(a * e * n) / n);
    } else i.push(o);
    if (o = s.shift(), o === void 0) return i.join("");
    r = !r;
  }
}
function Se(t, e = "defs") {
  let n = "";
  const s = t.indexOf("<" + e);
  for (; s >= 0; ) {
    const i = t.indexOf(">", s), o = t.indexOf("</" + e);
    if (i === -1 || o === -1) break;
    const r = t.indexOf(">", o);
    if (r === -1) break;
    n += t.slice(i + 1, o).trim(), t = t.slice(0, s).trim() + t.slice(r + 1);
  }
  return {
    defs: n,
    content: t
  };
}
function xe(t, e) {
  return t ? "<defs>" + t + "</defs>" + e : e;
}
function Ee(t, e, n) {
  const s = Se(t);
  return xe(s.defs, e + s.content + n);
}
const ke = (t) => t === "unset" || t === "undefined" || t === "none";
function Ie(t, e) {
  const n = {
    ...W,
    ...t
  }, s = {
    ...Nt,
    ...e
  }, i = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let o = n.body;
  [n, s].forEach((y) => {
    const f = [], m = y.hFlip, C = y.vFlip;
    let _ = y.rotate;
    m ? C ? _ += 2 : (f.push("translate(" + (i.width + i.left).toString() + " " + (0 - i.top).toString() + ")"), f.push("scale(-1 1)"), i.top = i.left = 0) : C && (f.push("translate(" + (0 - i.left).toString() + " " + (i.height + i.top).toString() + ")"), f.push("scale(1 -1)"), i.top = i.left = 0);
    let x;
    switch (_ < 0 && (_ -= Math.floor(_ / 4) * 4), _ = _ % 4, _) {
      case 1:
        x = i.height / 2 + i.top, f.unshift("rotate(90 " + x.toString() + " " + x.toString() + ")");
        break;
      case 2:
        f.unshift("rotate(180 " + (i.width / 2 + i.left).toString() + " " + (i.height / 2 + i.top).toString() + ")");
        break;
      case 3:
        x = i.width / 2 + i.left, f.unshift("rotate(-90 " + x.toString() + " " + x.toString() + ")");
    }
    _ % 2 === 1 && (i.left !== i.top && (x = i.left, i.left = i.top, i.top = x), i.width !== i.height && (x = i.width, i.width = i.height, i.height = x)), f.length && (o = Ee(o, '<g transform="' + f.join(" ") + '">', "</g>"));
  });
  const r = s.width, a = s.height, l = i.width, c = i.height;
  let p, u;
  r === null ? (u = a === null ? "1em" : a === "auto" ? c : a, p = ft(u, l / c)) : (p = r === "auto" ? l : r, u = a === null ? ft(p, c / l) : a === "auto" ? c : a);
  const d = {}, h = (y, f) => {
    ke(f) || (d[y] = f.toString());
  };
  h("width", p), h("height", u);
  const b = [
    i.left,
    i.top,
    l,
    c
  ];
  return d.viewBox = b.join(" "), {
    attributes: d,
    viewBox: b,
    body: o
  };
}
const Pe = /\sid="(\S+)"/g, pt = /* @__PURE__ */ new Map();
function Te(t) {
  t = t.replace(/[0-9]+$/, "") || "a";
  const e = pt.get(t) || 0;
  return pt.set(t, e + 1), e ? `${t}${e}` : t;
}
function Ae(t) {
  const e = [];
  let n;
  for (; n = Pe.exec(t); ) e.push(n[1]);
  if (!e.length) return t;
  const s = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return e.forEach((i) => {
    const o = Te(i), r = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp('([#;"])(' + r + ')([")]|\\.[a-z])', "g"), "$1" + o + s + "$3");
  }), t = t.replace(new RegExp(s, "g"), ""), t;
}
const X = /* @__PURE__ */ Object.create(null);
function Oe(t, e) {
  X[t] = e;
}
function Z(t) {
  return X[t] || X[""];
}
function it(t) {
  let e;
  if (typeof t.resources == "string") e = [t.resources];
  else if (e = t.resources, !(e instanceof Array) || !e.length) return null;
  return {
    resources: e,
    path: t.path || "/",
    maxURL: t.maxURL || 500,
    rotate: t.rotate || 750,
    timeout: t.timeout || 5e3,
    random: t.random === !0,
    index: t.index || 0,
    dataAfterTimeout: t.dataAfterTimeout !== !1
  };
}
const st = /* @__PURE__ */ Object.create(null), V = ["https://api.simplesvg.com", "https://api.unisvg.com"], D = [];
for (; V.length > 0; ) V.length === 1 || Math.random() > 0.5 ? D.push(V.shift()) : D.push(V.pop());
st[""] = it({ resources: ["https://api.iconify.design"].concat(D) });
function Ve(t, e) {
  const n = it(e);
  return n === null ? !1 : (st[t] = n, !0);
}
function ot(t) {
  return st[t];
}
const Le = () => {
  let t;
  try {
    if (t = fetch, typeof t == "function") return t;
  } catch {
  }
};
let ht = Le();
function Re(t, e) {
  const n = ot(t);
  if (!n) return 0;
  let s;
  if (!n.maxURL) s = 0;
  else {
    let i = 0;
    n.resources.forEach((r) => {
      i = Math.max(i, r.length);
    });
    const o = e + ".json?icons=";
    s = n.maxURL - i - n.path.length - o.length;
  }
  return s;
}
function je(t) {
  return t === 404;
}
const Fe = (t, e, n) => {
  const s = [], i = Re(t, e), o = "icons";
  let r = {
    type: o,
    provider: t,
    prefix: e,
    icons: []
  }, a = 0;
  return n.forEach((l, c) => {
    a += l.length + 1, a >= i && c > 0 && (s.push(r), r = {
      type: o,
      provider: t,
      prefix: e,
      icons: []
    }, a = l.length), r.icons.push(l);
  }), s.push(r), s;
};
function Ne(t) {
  if (typeof t == "string") {
    const e = ot(t);
    if (e) return e.path;
  }
  return "/";
}
const ze = (t, e, n) => {
  if (!ht) {
    n("abort", 424);
    return;
  }
  let s = Ne(e.provider);
  switch (e.type) {
    case "icons": {
      const o = e.prefix, r = e.icons.join(","), a = new URLSearchParams({ icons: r });
      s += o + ".json?" + a.toString();
      break;
    }
    case "custom": {
      const o = e.uri;
      s += o.slice(0, 1) === "/" ? o.slice(1) : o;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let i = 503;
  ht(t + s).then((o) => {
    const r = o.status;
    if (r !== 200) {
      setTimeout(() => {
        n(je(r) ? "abort" : "next", r);
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
}, Me = {
  prepare: Fe,
  send: ze
};
function zt(t, e) {
  t.forEach((n) => {
    const s = n.loaderCallbacks;
    s && (n.loaderCallbacks = s.filter((i) => i.id !== e));
  });
}
function De(t) {
  t.pendingCallbacksFlag || (t.pendingCallbacksFlag = !0, setTimeout(() => {
    t.pendingCallbacksFlag = !1;
    const e = t.loaderCallbacks ? t.loaderCallbacks.slice(0) : [];
    if (!e.length) return;
    let n = !1;
    const s = t.provider, i = t.prefix;
    e.forEach((o) => {
      const r = o.icons, a = r.pending.length;
      r.pending = r.pending.filter((l) => {
        if (l.prefix !== i) return !0;
        const c = l.name;
        if (t.icons[c]) r.loaded.push({
          provider: s,
          prefix: i,
          name: c
        });
        else if (t.missing.has(c)) r.missing.push({
          provider: s,
          prefix: i,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), r.pending.length !== a && (n || zt([t], o.id), o.callback(r.loaded.slice(0), r.missing.slice(0), r.pending.slice(0), o.abort));
    });
  }));
}
let Be = 0;
function $e(t, e, n) {
  const s = Be++, i = zt.bind(null, n, s);
  if (!e.pending.length) return i;
  const o = {
    id: s,
    icons: e,
    callback: t,
    abort: i
  };
  return n.forEach((r) => {
    (r.loaderCallbacks || (r.loaderCallbacks = [])).push(o);
  }), i;
}
function He(t) {
  const e = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  t.sort((i, o) => i.provider !== o.provider ? i.provider.localeCompare(o.provider) : i.prefix !== o.prefix ? i.prefix.localeCompare(o.prefix) : i.name.localeCompare(o.name));
  let s = {
    provider: "",
    prefix: "",
    name: ""
  };
  return t.forEach((i) => {
    if (s.name === i.name && s.prefix === i.prefix && s.provider === i.provider) return;
    s = i;
    const o = i.provider, r = i.prefix, a = i.name, l = n[o] || (n[o] = /* @__PURE__ */ Object.create(null)), c = l[r] || (l[r] = P(o, r));
    let p;
    a in c.icons ? p = e.loaded : r === "" || c.missing.has(a) ? p = e.missing : p = e.pending;
    const u = {
      provider: o,
      prefix: r,
      name: a
    };
    p.push(u);
  }), e;
}
function Ue(t, e = !0, n = !1) {
  const s = [];
  return t.forEach((i) => {
    const o = typeof i == "string" ? U(i, e, n) : i;
    o && s.push(o);
  }), s;
}
const We = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function qe(t, e, n, s) {
  const i = t.resources.length, o = t.random ? Math.floor(Math.random() * i) : t.index;
  let r;
  if (t.random) {
    let g = t.resources.slice(0);
    for (r = []; g.length > 1; ) {
      const S = Math.floor(Math.random() * g.length);
      r.push(g[S]), g = g.slice(0, S).concat(g.slice(S + 1));
    }
    r = r.concat(g);
  } else r = t.resources.slice(o).concat(t.resources.slice(0, o));
  const a = Date.now();
  let l = "pending", c = 0, p, u = null, d = [], h = [];
  typeof s == "function" && h.push(s);
  function b() {
    u && (clearTimeout(u), u = null);
  }
  function y() {
    l === "pending" && (l = "aborted"), b(), d.forEach((g) => {
      g.status === "pending" && (g.status = "aborted");
    }), d = [];
  }
  function f(g, S) {
    S && (h = []), typeof g == "function" && h.push(g);
  }
  function m() {
    return {
      startTime: a,
      payload: e,
      status: l,
      queriesSent: c,
      queriesPending: d.length,
      subscribe: f,
      abort: y
    };
  }
  function C() {
    l = "failed", h.forEach((g) => {
      g(void 0, p);
    });
  }
  function _() {
    d.forEach((g) => {
      g.status === "pending" && (g.status = "aborted");
    }), d = [];
  }
  function x(g, S, T) {
    const j = S !== "success";
    switch (d = d.filter((I) => I !== g), l) {
      case "pending":
        break;
      case "failed":
        if (j || !t.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (S === "abort") {
      p = T, C();
      return;
    }
    if (j) {
      p = T, d.length || (r.length ? w() : C());
      return;
    }
    if (b(), _(), !t.random) {
      const I = t.resources.indexOf(g.resource);
      I !== -1 && I !== t.index && (t.index = I);
    }
    l = "completed", h.forEach((I) => {
      I(T);
    });
  }
  function w() {
    if (l !== "pending") return;
    b();
    const g = r.shift();
    if (g === void 0) {
      if (d.length) {
        u = setTimeout(() => {
          b(), l === "pending" && (_(), C());
        }, t.timeout);
        return;
      }
      C();
      return;
    }
    const S = {
      status: "pending",
      resource: g,
      callback: (T, j) => {
        x(S, T, j);
      }
    };
    d.push(S), c++, u = setTimeout(w, t.rotate), n(g, e, S.callback);
  }
  return setTimeout(w), m;
}
function Mt(t) {
  const e = {
    ...We,
    ...t
  };
  let n = [];
  function s() {
    n = n.filter((r) => r().status === "pending");
  }
  function i(r, a, l) {
    const c = qe(e, r, a, (p, u) => {
      s(), l && l(p, u);
    });
    return n.push(c), c;
  }
  function o(r) {
    return n.find((a) => r(a)) || null;
  }
  return {
    query: i,
    find: o,
    setIndex: (r) => {
      e.index = r;
    },
    getIndex: () => e.index,
    cleanup: s
  };
}
function dt() {
}
const G = /* @__PURE__ */ Object.create(null);
function Ke(t) {
  if (!G[t]) {
    const e = ot(t);
    if (!e) return;
    const n = {
      config: e,
      redundancy: Mt(e)
    };
    G[t] = n;
  }
  return G[t];
}
function Qe(t, e, n) {
  let s, i;
  if (typeof t == "string") {
    const o = Z(t);
    if (!o)
      return n(void 0, 424), dt;
    i = o.send;
    const r = Ke(t);
    r && (s = r.redundancy);
  } else {
    const o = it(t);
    if (o) {
      s = Mt(o);
      const r = t.resources ? t.resources[0] : "", a = Z(r);
      a && (i = a.send);
    }
  }
  return !s || !i ? (n(void 0, 424), dt) : s.query(e, i, n)().abort;
}
function mt() {
}
function Ge(t) {
  t.iconsLoaderFlag || (t.iconsLoaderFlag = !0, setTimeout(() => {
    t.iconsLoaderFlag = !1, De(t);
  }));
}
function Ye(t) {
  const e = [], n = [];
  return t.forEach((s) => {
    (s.match(Tt) ? e : n).push(s);
  }), {
    valid: e,
    invalid: n
  };
}
function L(t, e, n) {
  function s() {
    const i = t.pendingIcons;
    e.forEach((o) => {
      i && i.delete(o), t.icons[o] || t.missing.add(o);
    });
  }
  if (n && typeof n == "object") try {
    if (!Lt(t, n).length) {
      s();
      return;
    }
  } catch (i) {
    console.error(i);
  }
  s(), Ge(t);
}
function gt(t, e) {
  t instanceof Promise ? t.then((n) => {
    e(n);
  }).catch(() => {
    e(null);
  }) : e(t);
}
function Je(t, e) {
  t.iconsToLoad ? t.iconsToLoad = t.iconsToLoad.concat(e).sort() : t.iconsToLoad = e, t.iconsQueueFlag || (t.iconsQueueFlag = !0, setTimeout(() => {
    t.iconsQueueFlag = !1;
    const { provider: n, prefix: s } = t, i = t.iconsToLoad;
    if (delete t.iconsToLoad, !i || !i.length) return;
    const o = t.loadIcon;
    if (t.loadIcons && (i.length > 1 || !o)) {
      gt(t.loadIcons(i, s, n), (c) => {
        L(t, i, c);
      });
      return;
    }
    if (o) {
      i.forEach((c) => {
        gt(o(c, s, n), (p) => {
          L(t, [c], p ? {
            prefix: s,
            icons: { [c]: p }
          } : null);
        });
      });
      return;
    }
    const { valid: r, invalid: a } = Ye(i);
    if (a.length && L(t, a, null), !r.length) return;
    const l = s.match(Tt) ? Z(n) : null;
    if (!l) {
      L(t, r, null);
      return;
    }
    l.prepare(n, s, r).forEach((c) => {
      Qe(n, c, (p) => {
        L(t, c.icons, p);
      });
    });
  }));
}
const Xe = (t, e) => {
  const n = Ue(t, !0, Rt()), s = He(n);
  if (!s.pending.length) {
    let l = !0;
    return e && setTimeout(() => {
      l && e(s.loaded, s.missing, s.pending, mt);
    }), () => {
      l = !1;
    };
  }
  const i = /* @__PURE__ */ Object.create(null), o = [];
  let r, a;
  return s.pending.forEach((l) => {
    const { provider: c, prefix: p } = l;
    if (p === a && c === r) return;
    r = c, a = p, o.push(P(c, p));
    const u = i[c] || (i[c] = /* @__PURE__ */ Object.create(null));
    u[p] || (u[p] = []);
  }), s.pending.forEach((l) => {
    const { provider: c, prefix: p, name: u } = l, d = P(c, p), h = d.pendingIcons || (d.pendingIcons = /* @__PURE__ */ new Set());
    h.has(u) || (h.add(u), i[c][p].push(u));
  }), o.forEach((l) => {
    const c = i[l.provider][l.prefix];
    c.length && Je(l, c);
  }), e ? $e(e, s, o) : mt;
};
function Ze(t, e) {
  const n = { ...t };
  for (const s in e) {
    const i = e[s], o = typeof i;
    s in Ft ? (i === null || i && (o === "string" || o === "number")) && (n[s] = i) : o === typeof n[s] && (n[s] = s === "rotate" ? i % 4 : i);
  }
  return n;
}
const tn = /[\s,]+/;
function en(t, e) {
  e.split(tn).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        t.hFlip = !0;
        break;
      case "vertical":
        t.vFlip = !0;
    }
  });
}
function nn(t, e = 0) {
  const n = t.replace(/^-?[0-9.]*/, "");
  function s(i) {
    for (; i < 0; ) i += 4;
    return i % 4;
  }
  if (n === "") {
    const i = parseInt(t);
    return isNaN(i) ? 0 : s(i);
  } else if (n !== t) {
    let i = 0;
    switch (n) {
      case "%":
        i = 25;
        break;
      case "deg":
        i = 90;
    }
    if (i) {
      let o = parseFloat(t.slice(0, t.length - n.length));
      return isNaN(o) ? 0 : (o = o / i, o % 1 === 0 ? s(o) : 0);
    }
  }
  return e;
}
function sn(t, e) {
  let n = t.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const s in e) n += " " + s + '="' + e[s] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + t + "</svg>";
}
function on(t) {
  return t.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function rn(t) {
  return "data:image/svg+xml," + on(t);
}
function cn(t) {
  return 'url("' + rn(t) + '")';
}
const yt = {
  ...Nt,
  inline: !1
}, an = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, ln = {
  display: "inline-block"
}, tt = {
  backgroundColor: "currentColor"
}, Dt = {
  backgroundColor: "transparent"
}, bt = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, vt = {
  webkitMask: tt,
  mask: tt,
  background: Dt
};
for (const t in vt) {
  const e = vt[t];
  for (const n in bt)
    e[t + n] = bt[n];
}
const B = {};
["horizontal", "vertical"].forEach((t) => {
  const e = t.slice(0, 1) + "Flip";
  B[t + "-flip"] = e, B[t.slice(0, 1) + "-flip"] = e, B[t + "Flip"] = e;
});
function _t(t) {
  return t + (t.match(/^[-0-9.]+$/) ? "px" : "");
}
const wt = (t, e) => {
  const n = Ze(yt, e), s = { ...an }, i = e.mode || "svg", o = {}, r = e.style, a = typeof r == "object" && !(r instanceof Array) ? r : {};
  for (let y in e) {
    const f = e[y];
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
          typeof f == "string" ? n[y] = nn(f) : typeof f == "number" && (n[y] = f);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          f !== !0 && f !== "true" && delete s["aria-hidden"];
          break;
        default: {
          const m = B[y];
          m ? (f === !0 || f === "true" || f === 1) && (n[m] = !0) : yt[y] === void 0 && (s[y] = f);
        }
      }
  }
  typeof e.flip == "string" && en(n, e.flip);
  const l = Ie(t, n), c = l.attributes;
  if (n.inline && (o.verticalAlign = "-0.125em"), i === "svg")
    return s.style = {
      ...o,
      ...a
    }, Object.assign(s, c), s.innerHTML = Ae(l.body), rt("svg", s);
  const { body: p, width: u, height: d } = t, h = i === "mask" || (i === "bg" ? !1 : p.indexOf("currentColor") !== -1), b = sn(p, {
    ...c,
    width: u + "",
    height: d + ""
  });
  return s.style = {
    ...o,
    "--svg": cn(b),
    width: _t(c.width),
    height: _t(c.height),
    ...ln,
    ...h ? tt : Dt,
    ...a
  }, rt("span", s);
};
Rt(!0);
Oe("", Me);
if (typeof document < "u" && typeof window < "u") {
  const t = window;
  if (t.IconifyPreload !== void 0) {
    const e = t.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof e == "object" && e !== null && (e instanceof Array ? e : [e]).forEach((s) => {
      try {
        // Check if item is an object and not null/array
        (typeof s != "object" || s === null || s instanceof Array || // Check for 'icons' and 'prefix'
        typeof s.icons != "object" || typeof s.prefix != "string" || // Add icon set
        !jt(s)) && console.error(n);
      } catch {
        console.error(n);
      }
    });
  }
  if (t.IconifyProviders !== void 0) {
    const e = t.IconifyProviders;
    if (typeof e == "object" && e !== null)
      for (let n in e) {
        const s = "IconifyProviders[" + n + "] is invalid.";
        try {
          const i = e[n];
          if (typeof i != "object" || !i || i.resources === void 0)
            continue;
          Ve(n, i) || console.error(s);
        } catch {
          console.error(s);
        }
      }
  }
}
const un = {
  ...W,
  body: ""
};
kt((t, { emit: e }) => {
  const n = E(null);
  function s() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const i = E(!!t.ssr), o = E(""), r = Jt(null);
  function a() {
    const c = t.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return o.value = "", {
        data: c
      };
    let p;
    if (typeof c != "string" || (p = U(c, !1, !0)) === null)
      return null;
    let u = ve(p);
    if (!u) {
      const b = n.value;
      return (!b || b.name !== c) && (u === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: Xe([p], l)
      }), null;
    }
    s(), o.value !== c && (o.value = c, Zt(() => {
      e("load", c);
    }));
    const d = t.customise;
    if (d) {
      u = Object.assign({}, u);
      const b = d(u.body, p.name, p.prefix, p.provider);
      typeof b == "string" && (u.body = b);
    }
    const h = ["iconify"];
    return p.prefix !== "" && h.push("iconify--" + p.prefix), p.provider !== "" && h.push("iconify--" + p.provider), { data: u, classes: h };
  }
  function l() {
    const c = a();
    c ? c.data !== r.value?.data && (r.value = c) : r.value = null;
  }
  return i.value ? l() : It(() => {
    i.value = !0, l();
  }), Pt(() => t.icon, l), Xt(s), () => {
    const c = r.value;
    if (!c)
      return wt(un, t);
    let p = t;
    return c.classes && (p = {
      ...t,
      class: c.classes.join(" ")
    }), wt({
      ...W,
      ...c.data
    }, p);
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
var et = "data-wippy-visible";
function Ct(t) {
  const e = t.getAttribute(et);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var fn = Object.defineProperty, Bt = (t) => {
  throw TypeError(t);
}, pn = (t, e, n) => e in t ? fn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, v = (t, e, n) => pn(t, typeof e != "symbol" ? e + "" : e, n), $t = (t, e, n) => e.has(t) || Bt("Cannot " + n), hn = (t, e, n) => ($t(t, e, "read from private field"), n ? n.call(t) : e.get(t)), dn = (t, e, n) => e.has(t) ? Bt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), mn = (t, e, n, s) => ($t(t, e, "write to private field"), e.set(t, n), n), gn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function St(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function bn(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [s, i] of Object.entries(n)) {
        if ((s === "@light" || s === "@dark") && i && typeof i == "object") {
          for (const [r, a] of Object.entries(i)) {
            const l = typeof a == "string" ? St(r) : null;
            l && e.add(l);
          }
          continue;
        }
        const o = typeof i == "string" ? St(s) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function vn(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${yn} {
${e}
}`;
}
function _n(t, e) {
  const n = vn(e);
  n && Ht(t, n, "@wippy-fe/css-variables-bridge");
}
function wn(t, e) {
  const s = (e ?? gn).map(async (i) => {
    const o = ae[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await le(o);
    } catch (r) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${o}):`, r), null;
    }
  });
  return Promise.all(s).then((i) => {
    for (const o of i) {
      if (!o)
        continue;
      const r = document.createElement("style");
      r.textContent = o, r.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(r);
    }
  });
}
function Cn(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Ht(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", n), s.textContent = e, t.appendChild(s);
}
function Sn(t, e) {
  Ht(t, e, "@wippy-fe/custom-css");
}
function Ut(t) {
  return t.__wippyHost ?? null;
}
function xn(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function En(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const s = Number.parseFloat(e);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: s };
    }
    case "integer": {
      const s = Number.parseInt(e, 10);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: s };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const s = JSON.parse(e);
        return n.type === "array" && !Array.isArray(s) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: s };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function Y(t, e) {
  const n = {}, s = [];
  for (const [i, o] of Object.entries(e.properties)) {
    const r = t.getAttribute(i), a = xn(i);
    if (r === null) {
      o.default !== void 0 && (n[a] = o.default);
      continue;
    }
    const l = En(i, r, o);
    l.error ? s.push(l.error) : n[a] = l.value;
  }
  return { props: n, errors: s };
}
var kn = class {
  constructor(t, e) {
    v(this, "_props"), v(this, "_errors"), v(this, "_content"), v(this, "_hostVisibility"), v(this, "_propsListeners", /* @__PURE__ */ new Set()), v(this, "_contentListeners", /* @__PURE__ */ new Set()), v(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), v(this, "_disposed", !1), v(this, "_emitToDom"), v(this, "props"), v(this, "events"), v(this, "content"), v(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
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
    }, this.content = t.hasContent ? {
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
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const n of this._propsListeners)
        n(t, e);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const e of this._contentListeners)
        e(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, e) {
    if (!(this._disposed || t === e)) {
      this._hostVisibility = t;
      for (const n of this._hostVisibilityListeners)
        n(t, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), e?.immediate && t(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const n = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, $, In = class extends HTMLElement {
  constructor() {
    super(), v(this, "_internals"), v(this, "_contentObserver", null), v(this, "_initialized", !1), v(this, "_container", null), dn(this, $, null), v(this, "_attachment", 0), v(this, "_reactive", null), v(this, "_lastProps", null), v(this, "_lastErrors", []), v(this, "_lastContent", null), v(this, "_themeUnsub", null), v(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ct(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), n = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...n, et])];
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
    return Ut(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, e) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      detail: e
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
      const t = this.constructor.wippyConfig, e = !!t.contentTemplate;
      let n, s;
      if (this._lastProps !== null)
        n = this._lastProps, s = this._lastErrors;
      else {
        const o = Y(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), n = o.props, s = o.errors, this._lastProps = n, this._lastErrors = s;
      }
      const i = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new kn(
        { props: n, errors: s, content: i, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const t = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, n = this._initialized, s = hn(this, $) ?? mn(this, $, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let i;
      if (this._container)
        i = this._container;
      else {
        if (this.onInit(s), t !== this._attachment)
          return;
        e.inlineCss && Cn(s, e.inlineCss);
        try {
          const p = at?.theming, u = bn(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          _n(s, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const p = at?.theming, u = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            u && Sn(s, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && wn(s, e.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, oe(jt);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = re("@theme", (c) => this._applyTheme(c)));
      const { props: o, errors: r } = Y(this, e.propsSchema);
      e.validateProps && r.push(...e.validateProps(o));
      const a = o;
      this._lastProps = a, this._lastErrors = r;
      let l = null;
      if (e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, a, r, l, n), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
    } catch (e) {
      if (t !== this._attachment || (this.onError(e), t !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(t = ce.getThemeMode?.()) {
    N(t, this), this._container && N(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), N("auto", this), this._container && N("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === et) {
      const a = this._hostVisible, l = Ct(this);
      if (l === a)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, a), this.onHostVisibilityChanged(l, a));
      return;
    }
    const s = this.constructor.wippyConfig, { props: i, errors: o } = Y(this, s.propsSchema);
    s.validateProps && o.push(...s.validateProps(i));
    const r = i;
    this._lastProps = r, this._lastErrors = o, this._reactive?.notifyProps(r, o), this.onPropsChanged(r, o);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(t) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(t) {
    console.error(`${this.constructor.name} initialization failed:`, t);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(t, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, e) {
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
  _extractContent(t) {
    const e = this.querySelector(`template[data-type="${t}"]`);
    return e ? e.content.textContent?.trim() || e.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
$ = /* @__PURE__ */ new WeakMap();
function Pn(t) {
  return t.__wippyHostBus ?? null;
}
function Tn(t) {
  return t.dataset.wippyPanelId ?? null;
}
let Wt;
const qt = (t) => Wt = t, An = () => te() && nt(Kt) || Wt, Kt = (
  /* istanbul ignore next */
  Symbol()
);
function On() {
  const t = ee(!0), e = t.run(() => E({}));
  let n = [], s = [];
  const i = ne({
    install(o) {
      qt(i), i._a = o, o.provide(Kt, i), o.config.globalProperties.$pinia = i, s.forEach((r) => n.push(r)), s = [];
    },
    use(o) {
      return this._a ? n.push(o) : s.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var Vn = Object.defineProperty, Ln = (t, e, n) => e in t ? Vn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, k = (t, e, n) => Ln(t, typeof e != "symbol" ? e + "" : e, n);
function xt(t, e, n) {
  const s = t.createElement("div"), i = n ? e.failed : e.loading;
  s.dataset.lazyState = n ? "failed" : "loading", s.setAttribute("role", n ? "alert" : "status"), s.setAttribute("aria-label", i), s.style.cssText = "display:grid;place-items:center;text-align:center;";
  const o = e.surface === "page";
  if (s.style.cssText += o ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    s.style.color = "var(--p-danger-500, currentColor)", s.textContent = !o && e.iconOnly ? "⚠" : i, !o && e.iconOnly && (s.title = i);
  else {
    const r = t.createElement("style");
    r.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const a = t.createElement("span");
    a.dataset.wippySpinner = "", a.setAttribute("aria-hidden", "true"), a.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", a.style.fontSize = o ? "2rem" : "1em", s.append(r, a);
  }
  return s;
}
var Qt = /* @__PURE__ */ Symbol("wippy:emit"), Gt = /* @__PURE__ */ Symbol("wippy:props"), Rn = /* @__PURE__ */ Symbol("wippy:props_error"), jn = /* @__PURE__ */ Symbol("wippy:content"), Fn = /* @__PURE__ */ Symbol("wippy:panel-id"), Nn = /* @__PURE__ */ Symbol("wippy:layout-bus"), zn = /* @__PURE__ */ Symbol("wippy:host"), Mn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Dn() {
  const t = nt(Gt);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Bn() {
  const t = nt(Qt);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var z = /* @__PURE__ */ new WeakMap();
function Et(t, e) {
  const n = z.get(t);
  if (n)
    return n;
  const s = Promise.resolve().then(e);
  return z.set(t, s), s.catch(() => {
    z.get(t) === s && z.delete(t);
  }), s;
}
var $n = class extends In {
  constructor() {
    super(...arguments), k(this, "_vueApp", null), k(this, "_mountingApp", !1), k(this, "_mountState", "idle"), k(this, "_feedback", null), k(this, "_propsRef", E({})), k(this, "_errorsRef", E([])), k(this, "_contentRef", E(null)), k(this, "_hostVisibilityRef", E(null)), k(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const t = this.vueConfig;
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await Et(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, n, s, i, o) {
    const r = this.constructor, a = r.vueConfig, l = new AbortController();
    this._bridgeAbort = l;
    const c = () => !l.signal.aborted && this._bridgeAbort === l;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = s, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of s)
      if (this.emitEvent("invalid", { message: u }), !c())
        return;
    this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const h of d)
        this.emitEvent("invalid", { message: h });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const p = (u) => {
      if (!c())
        return;
      const d = An(), h = ie(u.rootComponent);
      let b = !1, y = !1, f, m;
      this._mountingApp = !0;
      try {
        const C = On();
        if (u.piniaPlugins)
          for (const _ of u.piniaPlugins)
            C.use(_);
        h.use(C);
        for (const _ of u.plugins ?? [])
          h.use(_);
        if (h.provide(Gt, this._propsRef), h.provide(Rn, this._errorsRef), h.provide(Qt, this.emitEvent.bind(this)), h.provide(jn, this._contentRef), h.provide(Mn, this._hostVisibilityRef), h.provide(Fn, Tn(this)), h.provide(Nn, Pn(this)), h.provide(zn, Ut(this)), u.providers?.(h, this), !c())
          return;
        if (m = h.config.errorHandler, a.mountLifecycle && (h.config.errorHandler = (_, x, w) => {
          y || (f = _), y = !0, m?.(_, x, w);
        }), h.mount(e), b = !0, y)
          throw f;
        c() && (this._vueApp = h);
      } finally {
        a.mountLifecycle && b && (h.config.errorHandler = m);
        try {
          b && (y || !c()) && h.unmount();
        } finally {
          qt(d), this._mountingApp = !1;
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
            p(a);
          } catch (u) {
            c() && (this._mountState = "failed", this.emitEvent("error", { message: u instanceof Error ? u.message : String(u), error: u }));
          }
        });
        return;
      }
      try {
        p(a);
      } catch (u) {
        if (c())
          throw this._mountState = "failed", u;
      }
    } else if (a.lazyConfig) {
      const u = e.ownerDocument, d = a.lazyUi;
      d?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let h = !1, b, y;
      const f = () => {
        clearTimeout(b), clearTimeout(y), this._feedback?.remove(), this._feedback = null;
      };
      l.signal.addEventListener("abort", f, { once: !0 });
      const m = () => {
        if (!c() || h)
          return;
        const w = d ? xt(u, d, !1) : u.createElement("wippy-loading");
        w.setAttribute("no-bg", ""), this._feedback = w, e.appendChild(w);
      }, C = (w) => {
        if (!c())
          return;
        h = !0, f(), this._mountState = "failed";
        const g = d?.failed ?? (w instanceof Error ? w.message : String(w)), S = d ? xt(u, d, !0) : u.createElement("wippy-error");
        d || (S.setAttribute("title", "Failed to load"), S.setAttribute("message", g)), this._feedback = S, e.appendChild(S), this.emitEvent("error", d ? { message: g, error: w } : { message: g });
      }, _ = d?.delay ?? (d?.surface === "compact" ? 200 : 0);
      _ > 0 ? b = setTimeout(m, _) : m(), d && (y = setTimeout(() => C(new Error("The component did not load in time.")), d.timeout ?? 3e4)), (a.mountLifecycle ? Et(r, a.lazyConfig) : a.lazyConfig()).then((w) => {
        !c() || h || (h = !0, f(), p(w));
      }, (w) => {
        h || C(w);
      }).catch(C);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
};
const Hn = { class: "pbpick" }, Un = { class: "pbpick-field" }, Wn = ["value"], qn = {
  key: 1,
  class: "pbpick-hint"
}, Kn = {
  key: 2,
  class: "pbpick-error",
  role: "alert"
}, Qn = {
  key: 3,
  class: "pbpick-error"
}, Gn = /* @__PURE__ */ kt({
  __name: "PhantomBusterPicker",
  setup(t) {
    const e = Dn(), n = Bn(), s = E([]), i = E(""), o = E(!1), r = E(""), a = E(""), l = ct(
      () => s.value.find((f) => p(f) === i.value)
    ), c = ct(
      () => JSON.stringify({ connection_id: i.value })
    );
    function p(f) {
      return f.component_id;
    }
    Pt(
      () => e.value.config,
      (f) => {
        i.value = f?.connection_id || "";
      },
      { immediate: !0 }
    );
    function u(f) {
      if (!f) return "";
      const m = String(f.connection_state || f.status || "").toLowerCase(), C = Number(f.expires_at || 0);
      return C > 0 && C <= Math.floor(Date.now() / 1e3) ? "expired" : m === "authenticated" || m === "active" || m === "connected" ? "connected" : m || "unknown";
    }
    function d(f) {
      const m = u(f);
      return m ? m === "connected" ? "Connected" : m === "expired" ? "Expired" : m === "needs_reauth" || m === "reauth_required" ? "Reconnect required" : m === "disabled" ? "Disabled" : m === "unknown" ? "Unknown" : m.replace(/_/g, " ") : "";
    }
    function h() {
      n("config-changed", { connection_id: i.value || void 0 });
    }
    function b(f) {
      const m = f.detail;
      i.value = m?.connection_id || "", h();
    }
    async function y() {
      o.value = !0, r.value = "";
      try {
        const { data: f } = await fe.get(
          "/api/v1/connections?provider=phantombuster&limit=100"
        );
        s.value = f?.connections ?? [];
      } catch (f) {
        r.value = f instanceof Error ? f.message : String(f);
      } finally {
        o.value = !1;
      }
    }
    return It(async () => {
      try {
        await ue("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (f) {
        a.value = f instanceof Error ? f.message : "Connection picker unavailable";
      }
      await y();
    }), (f, m) => (A(), O("div", Hn, [
      q("label", Un, [
        m[0] || (m[0] = q("span", null, "PhantomBuster connection", -1)),
        q("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "phantombuster",
          "reply-only": "false",
          placeholder: "Auto-select default",
          value: c.value,
          onChange: b
        }, null, 40, Wn)
      ]),
      l.value ? (A(), O("div", {
        key: 0,
        class: se(["pbpick-meta", `state-${u(l.value)}`])
      }, K(d(l.value)), 3)) : F("", !0),
      !s.value.length && !o.value ? (A(), O("p", qn, " No PhantomBuster connection yet. ")) : F("", !0),
      a.value ? (A(), O("p", Kn, " Connection picker unavailable: " + K(a.value), 1)) : F("", !0),
      r.value ? (A(), O("p", Qn, K(r.value), 1)) : F("", !0)
    ]));
  }
}), Yn = ".pbpick{display:grid;gap:8px;color:var(--p-text-color);background:var(--p-content-background);font:inherit}.pbpick-field{display:grid;gap:6px}.pbpick-field span{color:var(--p-text-muted-color);font-size:12px;font-weight:600}.pbpick wc-connection-picker{display:block;width:100%;min-height:36px}.pbpick-meta,.pbpick-hint,.pbpick-error{font-size:12px}.pbpick-meta{color:var(--p-success-600, var(--p-success-500))}.pbpick-meta.state-expired,.pbpick-meta.state-needs_reauth,.pbpick-meta.state-reauth_required{color:var(--p-warn-600, var(--p-warn-500))}.pbpick-hint{color:var(--p-text-muted-color)}.pbpick-error{color:var(--p-danger-600, var(--p-danger-500))}", Jn = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Trait context with optional connection_id.", properties: { connection_id: { type: "string" } }, additionalProperties: !1 } } } }, Xn = {
  wippy: Jn
};
class Yt extends $n {
  static get wippyConfig() {
    return {
      propsSchema: Xn.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Yn
    };
  }
  static get vueConfig() {
    return { rootComponent: Gn };
  }
}
async function ei() {
  return Yt;
}
pe(import.meta.url, Yt);
export {
  ei as webComponent
};
//# sourceMappingURL=phantombuster_picker.js.map
