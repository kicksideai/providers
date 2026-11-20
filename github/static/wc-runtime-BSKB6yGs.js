import { defineComponent as $t, ref as I, shallowRef as Ht, onMounted as Ut, watch as Bt, onUnmounted as Wt, h as et, nextTick as qt, hasInjectionContext as Kt, inject as J, effectScope as Qt, markRaw as Gt, createApp as Yt } from "vue";
import { config as nt, addIcons as Jt, on as Xt, applyThemeMode as R, host as Zt, hostCss as te, loadCss as ee } from "@wippy-fe/proxy";
const vt = /^[a-z0-9]+(-[a-z0-9]+)*$/, $ = (t, e, n, s = "") => {
  const i = t.split(":");
  if (t.slice(0, 1) === "@") {
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
    return e && !j(c) ? null : c;
  }
  const r = i[0], o = r.split("-");
  if (o.length > 1) {
    const l = {
      provider: s,
      prefix: o.shift(),
      name: o.join("-")
    };
    return e && !j(l) ? null : l;
  }
  if (n && s === "") {
    const l = {
      provider: s,
      prefix: "",
      name: r
    };
    return e && !j(l, n) ? null : l;
  }
  return null;
}, j = (t, e) => t ? !!((e && t.prefix === "" || t.prefix) && t.name) : !1;
function ne(t, e) {
  const n = t.icons, s = t.aliases || /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  function r(o) {
    if (n[o]) return i[o] = [];
    if (!(o in i)) {
      i[o] = null;
      const l = s[o] && s[o].parent, a = l && r(l);
      a && (i[o] = [l].concat(a));
    }
    return i[o];
  }
  return Object.keys(n).concat(Object.keys(s)).forEach(r), i;
}
const wt = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), D = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), H = Object.freeze({
  ...wt,
  ...D
}), q = Object.freeze({
  ...H,
  body: "",
  hidden: !1
});
function ie(t, e) {
  const n = {};
  !t.hFlip != !e.hFlip && (n.hFlip = !0), !t.vFlip != !e.vFlip && (n.vFlip = !0);
  const s = ((t.rotate || 0) + (e.rotate || 0)) % 4;
  return s && (n.rotate = s), n;
}
function it(t, e) {
  const n = ie(t, e);
  for (const s in q) s in D ? s in t && !(s in n) && (n[s] = D[s]) : s in e ? n[s] = e[s] : s in t && (n[s] = t[s]);
  return n;
}
function se(t, e, n) {
  const s = t.icons, i = t.aliases || /* @__PURE__ */ Object.create(null);
  let r = {};
  function o(l) {
    r = it(s[l] || i[l], r);
  }
  return o(e), n.forEach(o), it(t, r);
}
function Ct(t, e) {
  const n = [];
  if (typeof t != "object" || typeof t.icons != "object") return n;
  t.not_found instanceof Array && t.not_found.forEach((i) => {
    e(i, null), n.push(i);
  });
  const s = ne(t);
  for (const i in s) {
    const r = s[i];
    r && (e(i, se(t, i, r)), n.push(i));
  }
  return n;
}
const re = {
  provider: "",
  aliases: {},
  not_found: {},
  ...wt
};
function U(t, e) {
  for (const n in e) if (n in t && typeof t[n] != typeof e[n]) return !1;
  return !0;
}
function St(t) {
  if (typeof t != "object" || t === null) return null;
  const e = t;
  if (typeof e.prefix != "string" || !t.icons || typeof t.icons != "object" || !U(t, re)) return null;
  const n = e.icons;
  for (const i in n) {
    const r = n[i];
    if (!i || typeof r.body != "string" || !U(r, q)) return null;
  }
  const s = e.aliases || /* @__PURE__ */ Object.create(null);
  for (const i in s) {
    const r = s[i], o = r.parent;
    if (!i || typeof o != "string" || !n[o] && !s[o] || !U(r, q)) return null;
  }
  return e;
}
const st = /* @__PURE__ */ Object.create(null);
function oe(t, e) {
  return {
    provider: t,
    prefix: e,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function T(t, e) {
  const n = st[t] || (st[t] = /* @__PURE__ */ Object.create(null));
  return n[e] || (n[e] = oe(t, e));
}
function xt(t, e) {
  return St(e) ? Ct(e, (n, s) => {
    s ? t.icons[n] = s : t.missing.add(n);
  }) : [];
}
function ce(t, e, n) {
  try {
    if (typeof n.body == "string")
      return t.icons[e] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let L = !1;
function Et(t) {
  return typeof t == "boolean" && (L = t), L;
}
function le(t) {
  const e = typeof t == "string" ? $(t, !0, L) : t;
  if (e) {
    const n = T(e.provider, e.prefix), s = e.name;
    return n.icons[s] || (n.missing.has(s) ? null : void 0);
  }
}
function ae(t, e) {
  const n = $(t, !0, L);
  if (!n) return !1;
  const s = T(n.provider, n.prefix);
  return e ? ce(s, n.name, e) : (s.missing.add(n.name), !0);
}
function It(t, e) {
  if (typeof t != "object") return !1;
  if (typeof e != "string" && (e = t.provider || ""), L && !e && !t.prefix) {
    let i = !1;
    return St(t) && (t.prefix = "", Ct(t, (r, o) => {
      ae(r, o) && (i = !0);
    })), i;
  }
  const n = t.prefix;
  if (!j({
    prefix: n,
    name: "a"
  })) return !1;
  const s = T(e, n);
  return !!xt(s, t);
}
const Pt = Object.freeze({
  width: null,
  height: null
}), Tt = Object.freeze({
  ...Pt,
  ...D
}), ue = /(-?[0-9.]*[0-9]+[0-9.]*)/g, fe = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function rt(t, e, n) {
  if (e === 1) return t;
  if (n = n || 100, typeof t == "number") return Math.ceil(t * e * n) / n;
  if (typeof t != "string") return t;
  const s = t.split(ue);
  if (s === null || !s.length) return t;
  const i = [];
  let r = s.shift(), o = fe.test(r);
  for (; ; ) {
    if (o) {
      const l = parseFloat(r);
      isNaN(l) ? i.push(r) : i.push(Math.ceil(l * e * n) / n);
    } else i.push(r);
    if (r = s.shift(), r === void 0) return i.join("");
    o = !o;
  }
}
function he(t, e = "defs") {
  let n = "";
  const s = t.indexOf("<" + e);
  for (; s >= 0; ) {
    const i = t.indexOf(">", s), r = t.indexOf("</" + e);
    if (i === -1 || r === -1) break;
    const o = t.indexOf(">", r);
    if (o === -1) break;
    n += t.slice(i + 1, r).trim(), t = t.slice(0, s).trim() + t.slice(o + 1);
  }
  return {
    defs: n,
    content: t
  };
}
function pe(t, e) {
  return t ? "<defs>" + t + "</defs>" + e : e;
}
function de(t, e, n) {
  const s = he(t);
  return pe(s.defs, e + s.content + n);
}
const me = (t) => t === "unset" || t === "undefined" || t === "none";
function ge(t, e) {
  const n = {
    ...H,
    ...t
  }, s = {
    ...Tt,
    ...e
  }, i = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let r = n.body;
  [n, s].forEach((g) => {
    const d = [], x = g.hFlip, S = g.vFlip;
    let _ = g.rotate;
    x ? S ? _ += 2 : (d.push("translate(" + (i.width + i.left).toString() + " " + (0 - i.top).toString() + ")"), d.push("scale(-1 1)"), i.top = i.left = 0) : S && (d.push("translate(" + (0 - i.left).toString() + " " + (i.height + i.top).toString() + ")"), d.push("scale(1 -1)"), i.top = i.left = 0);
    let C;
    switch (_ < 0 && (_ -= Math.floor(_ / 4) * 4), _ = _ % 4, _) {
      case 1:
        C = i.height / 2 + i.top, d.unshift("rotate(90 " + C.toString() + " " + C.toString() + ")");
        break;
      case 2:
        d.unshift("rotate(180 " + (i.width / 2 + i.left).toString() + " " + (i.height / 2 + i.top).toString() + ")");
        break;
      case 3:
        C = i.width / 2 + i.left, d.unshift("rotate(-90 " + C.toString() + " " + C.toString() + ")");
    }
    _ % 2 === 1 && (i.left !== i.top && (C = i.left, i.left = i.top, i.top = C), i.width !== i.height && (C = i.width, i.width = i.height, i.height = C)), d.length && (r = de(r, '<g transform="' + d.join(" ") + '">', "</g>"));
  });
  const o = s.width, l = s.height, a = i.width, c = i.height;
  let f, u;
  o === null ? (u = l === null ? "1em" : l === "auto" ? c : l, f = rt(u, a / c)) : (f = o === "auto" ? a : o, u = l === null ? rt(f, c / a) : l === "auto" ? c : l);
  const p = {}, h = (g, d) => {
    me(d) || (p[g] = d.toString());
  };
  h("width", f), h("height", u);
  const b = [
    i.left,
    i.top,
    a,
    c
  ];
  return p.viewBox = b.join(" "), {
    attributes: p,
    viewBox: b,
    body: r
  };
}
const ye = /\sid="(\S+)"/g, ot = /* @__PURE__ */ new Map();
function be(t) {
  t = t.replace(/[0-9]+$/, "") || "a";
  const e = ot.get(t) || 0;
  return ot.set(t, e + 1), e ? `${t}${e}` : t;
}
function _e(t) {
  const e = [];
  let n;
  for (; n = ye.exec(t); ) e.push(n[1]);
  if (!e.length) return t;
  const s = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return e.forEach((i) => {
    const r = be(i), o = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp('([#;"])(' + o + ')([")]|\\.[a-z])', "g"), "$1" + r + s + "$3");
  }), t = t.replace(new RegExp(s, "g"), ""), t;
}
const K = /* @__PURE__ */ Object.create(null);
function ve(t, e) {
  K[t] = e;
}
function Q(t) {
  return K[t] || K[""];
}
function X(t) {
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
const Z = /* @__PURE__ */ Object.create(null), O = ["https://api.simplesvg.com", "https://api.unisvg.com"], z = [];
for (; O.length > 0; ) O.length === 1 || Math.random() > 0.5 ? z.push(O.shift()) : z.push(O.pop());
Z[""] = X({ resources: ["https://api.iconify.design"].concat(z) });
function we(t, e) {
  const n = X(e);
  return n === null ? !1 : (Z[t] = n, !0);
}
function tt(t) {
  return Z[t];
}
const Ce = () => {
  let t;
  try {
    if (t = fetch, typeof t == "function") return t;
  } catch {
  }
};
let ct = Ce();
function Se(t, e) {
  const n = tt(t);
  if (!n) return 0;
  let s;
  if (!n.maxURL) s = 0;
  else {
    let i = 0;
    n.resources.forEach((o) => {
      i = Math.max(i, o.length);
    });
    const r = e + ".json?icons=";
    s = n.maxURL - i - n.path.length - r.length;
  }
  return s;
}
function xe(t) {
  return t === 404;
}
const Ee = (t, e, n) => {
  const s = [], i = Se(t, e), r = "icons";
  let o = {
    type: r,
    provider: t,
    prefix: e,
    icons: []
  }, l = 0;
  return n.forEach((a, c) => {
    l += a.length + 1, l >= i && c > 0 && (s.push(o), o = {
      type: r,
      provider: t,
      prefix: e,
      icons: []
    }, l = a.length), o.icons.push(a);
  }), s.push(o), s;
};
function Ie(t) {
  if (typeof t == "string") {
    const e = tt(t);
    if (e) return e.path;
  }
  return "/";
}
const Pe = (t, e, n) => {
  if (!ct) {
    n("abort", 424);
    return;
  }
  let s = Ie(e.provider);
  switch (e.type) {
    case "icons": {
      const r = e.prefix, o = e.icons.join(","), l = new URLSearchParams({ icons: o });
      s += r + ".json?" + l.toString();
      break;
    }
    case "custom": {
      const r = e.uri;
      s += r.slice(0, 1) === "/" ? r.slice(1) : r;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let i = 503;
  ct(t + s).then((r) => {
    const o = r.status;
    if (o !== 200) {
      setTimeout(() => {
        n(xe(o) ? "abort" : "next", o);
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
}, Te = {
  prepare: Ee,
  send: Pe
};
function At(t, e) {
  t.forEach((n) => {
    const s = n.loaderCallbacks;
    s && (n.loaderCallbacks = s.filter((i) => i.id !== e));
  });
}
function Ae(t) {
  t.pendingCallbacksFlag || (t.pendingCallbacksFlag = !0, setTimeout(() => {
    t.pendingCallbacksFlag = !1;
    const e = t.loaderCallbacks ? t.loaderCallbacks.slice(0) : [];
    if (!e.length) return;
    let n = !1;
    const s = t.provider, i = t.prefix;
    e.forEach((r) => {
      const o = r.icons, l = o.pending.length;
      o.pending = o.pending.filter((a) => {
        if (a.prefix !== i) return !0;
        const c = a.name;
        if (t.icons[c]) o.loaded.push({
          provider: s,
          prefix: i,
          name: c
        });
        else if (t.missing.has(c)) o.missing.push({
          provider: s,
          prefix: i,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), o.pending.length !== l && (n || At([t], r.id), r.callback(o.loaded.slice(0), o.missing.slice(0), o.pending.slice(0), r.abort));
    });
  }));
}
let Oe = 0;
function ke(t, e, n) {
  const s = Oe++, i = At.bind(null, n, s);
  if (!e.pending.length) return i;
  const r = {
    id: s,
    icons: e,
    callback: t,
    abort: i
  };
  return n.forEach((o) => {
    (o.loaderCallbacks || (o.loaderCallbacks = [])).push(r);
  }), i;
}
function Le(t) {
  const e = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  t.sort((i, r) => i.provider !== r.provider ? i.provider.localeCompare(r.provider) : i.prefix !== r.prefix ? i.prefix.localeCompare(r.prefix) : i.name.localeCompare(r.name));
  let s = {
    provider: "",
    prefix: "",
    name: ""
  };
  return t.forEach((i) => {
    if (s.name === i.name && s.prefix === i.prefix && s.provider === i.provider) return;
    s = i;
    const r = i.provider, o = i.prefix, l = i.name, a = n[r] || (n[r] = /* @__PURE__ */ Object.create(null)), c = a[o] || (a[o] = T(r, o));
    let f;
    l in c.icons ? f = e.loaded : o === "" || c.missing.has(l) ? f = e.missing : f = e.pending;
    const u = {
      provider: r,
      prefix: o,
      name: l
    };
    f.push(u);
  }), e;
}
function Ve(t, e = !0, n = !1) {
  const s = [];
  return t.forEach((i) => {
    const r = typeof i == "string" ? $(i, e, n) : i;
    r && s.push(r);
  }), s;
}
const Re = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function Fe(t, e, n, s) {
  const i = t.resources.length, r = t.random ? Math.floor(Math.random() * i) : t.index;
  let o;
  if (t.random) {
    let m = t.resources.slice(0);
    for (o = []; m.length > 1; ) {
      const w = Math.floor(Math.random() * m.length);
      o.push(m[w]), m = m.slice(0, w).concat(m.slice(w + 1));
    }
    o = o.concat(m);
  } else o = t.resources.slice(r).concat(t.resources.slice(0, r));
  const l = Date.now();
  let a = "pending", c = 0, f, u = null, p = [], h = [];
  typeof s == "function" && h.push(s);
  function b() {
    u && (clearTimeout(u), u = null);
  }
  function g() {
    a === "pending" && (a = "aborted"), b(), p.forEach((m) => {
      m.status === "pending" && (m.status = "aborted");
    }), p = [];
  }
  function d(m, w) {
    w && (h = []), typeof m == "function" && h.push(m);
  }
  function x() {
    return {
      startTime: l,
      payload: e,
      status: a,
      queriesSent: c,
      queriesPending: p.length,
      subscribe: d,
      abort: g
    };
  }
  function S() {
    a = "failed", h.forEach((m) => {
      m(void 0, f);
    });
  }
  function _() {
    p.forEach((m) => {
      m.status === "pending" && (m.status = "aborted");
    }), p = [];
  }
  function C(m, w, A) {
    const V = w !== "success";
    switch (p = p.filter((P) => P !== m), a) {
      case "pending":
        break;
      case "failed":
        if (V || !t.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (w === "abort") {
      f = A, S();
      return;
    }
    if (V) {
      f = A, p.length || (o.length ? v() : S());
      return;
    }
    if (b(), _(), !t.random) {
      const P = t.resources.indexOf(m.resource);
      P !== -1 && P !== t.index && (t.index = P);
    }
    a = "completed", h.forEach((P) => {
      P(A);
    });
  }
  function v() {
    if (a !== "pending") return;
    b();
    const m = o.shift();
    if (m === void 0) {
      if (p.length) {
        u = setTimeout(() => {
          b(), a === "pending" && (_(), S());
        }, t.timeout);
        return;
      }
      S();
      return;
    }
    const w = {
      status: "pending",
      resource: m,
      callback: (A, V) => {
        C(w, A, V);
      }
    };
    p.push(w), c++, u = setTimeout(v, t.rotate), n(m, e, w.callback);
  }
  return setTimeout(v), x;
}
function Ot(t) {
  const e = {
    ...Re,
    ...t
  };
  let n = [];
  function s() {
    n = n.filter((o) => o().status === "pending");
  }
  function i(o, l, a) {
    const c = Fe(e, o, l, (f, u) => {
      s(), a && a(f, u);
    });
    return n.push(c), c;
  }
  function r(o) {
    return n.find((l) => o(l)) || null;
  }
  return {
    query: i,
    find: r,
    setIndex: (o) => {
      e.index = o;
    },
    getIndex: () => e.index,
    cleanup: s
  };
}
function lt() {
}
const B = /* @__PURE__ */ Object.create(null);
function je(t) {
  if (!B[t]) {
    const e = tt(t);
    if (!e) return;
    const n = {
      config: e,
      redundancy: Ot(e)
    };
    B[t] = n;
  }
  return B[t];
}
function ze(t, e, n) {
  let s, i;
  if (typeof t == "string") {
    const r = Q(t);
    if (!r)
      return n(void 0, 424), lt;
    i = r.send;
    const o = je(t);
    o && (s = o.redundancy);
  } else {
    const r = X(t);
    if (r) {
      s = Ot(r);
      const o = t.resources ? t.resources[0] : "", l = Q(o);
      l && (i = l.send);
    }
  }
  return !s || !i ? (n(void 0, 424), lt) : s.query(e, i, n)().abort;
}
function at() {
}
function Ne(t) {
  t.iconsLoaderFlag || (t.iconsLoaderFlag = !0, setTimeout(() => {
    t.iconsLoaderFlag = !1, Ae(t);
  }));
}
function Me(t) {
  const e = [], n = [];
  return t.forEach((s) => {
    (s.match(vt) ? e : n).push(s);
  }), {
    valid: e,
    invalid: n
  };
}
function k(t, e, n) {
  function s() {
    const i = t.pendingIcons;
    e.forEach((r) => {
      i && i.delete(r), t.icons[r] || t.missing.add(r);
    });
  }
  if (n && typeof n == "object") try {
    if (!xt(t, n).length) {
      s();
      return;
    }
  } catch (i) {
    console.error(i);
  }
  s(), Ne(t);
}
function ut(t, e) {
  t instanceof Promise ? t.then((n) => {
    e(n);
  }).catch(() => {
    e(null);
  }) : e(t);
}
function De(t, e) {
  t.iconsToLoad ? t.iconsToLoad = t.iconsToLoad.concat(e).sort() : t.iconsToLoad = e, t.iconsQueueFlag || (t.iconsQueueFlag = !0, setTimeout(() => {
    t.iconsQueueFlag = !1;
    const { provider: n, prefix: s } = t, i = t.iconsToLoad;
    if (delete t.iconsToLoad, !i || !i.length) return;
    const r = t.loadIcon;
    if (t.loadIcons && (i.length > 1 || !r)) {
      ut(t.loadIcons(i, s, n), (c) => {
        k(t, i, c);
      });
      return;
    }
    if (r) {
      i.forEach((c) => {
        ut(r(c, s, n), (f) => {
          k(t, [c], f ? {
            prefix: s,
            icons: { [c]: f }
          } : null);
        });
      });
      return;
    }
    const { valid: o, invalid: l } = Me(i);
    if (l.length && k(t, l, null), !o.length) return;
    const a = s.match(vt) ? Q(n) : null;
    if (!a) {
      k(t, o, null);
      return;
    }
    a.prepare(n, s, o).forEach((c) => {
      ze(n, c, (f) => {
        k(t, c.icons, f);
      });
    });
  }));
}
const $e = (t, e) => {
  const n = Ve(t, !0, Et()), s = Le(n);
  if (!s.pending.length) {
    let a = !0;
    return e && setTimeout(() => {
      a && e(s.loaded, s.missing, s.pending, at);
    }), () => {
      a = !1;
    };
  }
  const i = /* @__PURE__ */ Object.create(null), r = [];
  let o, l;
  return s.pending.forEach((a) => {
    const { provider: c, prefix: f } = a;
    if (f === l && c === o) return;
    o = c, l = f, r.push(T(c, f));
    const u = i[c] || (i[c] = /* @__PURE__ */ Object.create(null));
    u[f] || (u[f] = []);
  }), s.pending.forEach((a) => {
    const { provider: c, prefix: f, name: u } = a, p = T(c, f), h = p.pendingIcons || (p.pendingIcons = /* @__PURE__ */ new Set());
    h.has(u) || (h.add(u), i[c][f].push(u));
  }), r.forEach((a) => {
    const c = i[a.provider][a.prefix];
    c.length && De(a, c);
  }), e ? ke(e, s, r) : at;
};
function He(t, e) {
  const n = { ...t };
  for (const s in e) {
    const i = e[s], r = typeof i;
    s in Pt ? (i === null || i && (r === "string" || r === "number")) && (n[s] = i) : r === typeof n[s] && (n[s] = s === "rotate" ? i % 4 : i);
  }
  return n;
}
const Ue = /[\s,]+/;
function Be(t, e) {
  e.split(Ue).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        t.hFlip = !0;
        break;
      case "vertical":
        t.vFlip = !0;
    }
  });
}
function We(t, e = 0) {
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
      let r = parseFloat(t.slice(0, t.length - n.length));
      return isNaN(r) ? 0 : (r = r / i, r % 1 === 0 ? s(r) : 0);
    }
  }
  return e;
}
function qe(t, e) {
  let n = t.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const s in e) n += " " + s + '="' + e[s] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + t + "</svg>";
}
function Ke(t) {
  return t.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function Qe(t) {
  return "data:image/svg+xml," + Ke(t);
}
function Ge(t) {
  return 'url("' + Qe(t) + '")';
}
const ft = {
  ...Tt,
  inline: !1
}, Ye = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, Je = {
  display: "inline-block"
}, G = {
  backgroundColor: "currentColor"
}, kt = {
  backgroundColor: "transparent"
}, ht = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, pt = {
  webkitMask: G,
  mask: G,
  background: kt
};
for (const t in pt) {
  const e = pt[t];
  for (const n in ht)
    e[t + n] = ht[n];
}
const N = {};
["horizontal", "vertical"].forEach((t) => {
  const e = t.slice(0, 1) + "Flip";
  N[t + "-flip"] = e, N[t.slice(0, 1) + "-flip"] = e, N[t + "Flip"] = e;
});
function dt(t) {
  return t + (t.match(/^[-0-9.]+$/) ? "px" : "");
}
const mt = (t, e) => {
  const n = He(ft, e), s = { ...Ye }, i = e.mode || "svg", r = {}, o = e.style, l = typeof o == "object" && !(o instanceof Array) ? o : {};
  for (let g in e) {
    const d = e[g];
    if (d !== void 0)
      switch (g) {
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
          n[g] = d === !0 || d === "true" || d === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          r.color = d;
          break;
        // Rotation as string
        case "rotate":
          typeof d == "string" ? n[g] = We(d) : typeof d == "number" && (n[g] = d);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          d !== !0 && d !== "true" && delete s["aria-hidden"];
          break;
        default: {
          const x = N[g];
          x ? (d === !0 || d === "true" || d === 1) && (n[x] = !0) : ft[g] === void 0 && (s[g] = d);
        }
      }
  }
  typeof e.flip == "string" && Be(n, e.flip);
  const a = ge(t, n), c = a.attributes;
  if (n.inline && (r.verticalAlign = "-0.125em"), i === "svg")
    return s.style = {
      ...r,
      ...l
    }, Object.assign(s, c), s.innerHTML = _e(a.body), et("svg", s);
  const { body: f, width: u, height: p } = t, h = i === "mask" || (i === "bg" ? !1 : f.indexOf("currentColor") !== -1), b = qe(f, {
    ...c,
    width: u + "",
    height: p + ""
  });
  return s.style = {
    ...r,
    "--svg": Ge(b),
    width: dt(c.width),
    height: dt(c.height),
    ...Je,
    ...h ? G : kt,
    ...l
  }, et("span", s);
};
Et(!0);
ve("", Te);
if (typeof document < "u" && typeof window < "u") {
  const t = window;
  if (t.IconifyPreload !== void 0) {
    const e = t.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof e == "object" && e !== null && (e instanceof Array ? e : [e]).forEach((s) => {
      try {
        // Check if item is an object and not null/array
        (typeof s != "object" || s === null || s instanceof Array || // Check for 'icons' and 'prefix'
        typeof s.icons != "object" || typeof s.prefix != "string" || // Add icon set
        !It(s)) && console.error(n);
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
          we(n, i) || console.error(s);
        } catch {
          console.error(s);
        }
      }
  }
}
const Xe = {
  ...H,
  body: ""
};
$t((t, { emit: e }) => {
  const n = I(null);
  function s() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const i = I(!!t.ssr), r = I(""), o = Ht(null);
  function l() {
    const c = t.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return r.value = "", {
        data: c
      };
    let f;
    if (typeof c != "string" || (f = $(c, !1, !0)) === null)
      return null;
    let u = le(f);
    if (!u) {
      const b = n.value;
      return (!b || b.name !== c) && (u === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: $e([f], a)
      }), null;
    }
    s(), r.value !== c && (r.value = c, qt(() => {
      e("load", c);
    }));
    const p = t.customise;
    if (p) {
      u = Object.assign({}, u);
      const b = p(u.body, f.name, f.prefix, f.provider);
      typeof b == "string" && (u.body = b);
    }
    const h = ["iconify"];
    return f.prefix !== "" && h.push("iconify--" + f.prefix), f.provider !== "" && h.push("iconify--" + f.provider), { data: u, classes: h };
  }
  function a() {
    const c = l();
    c ? c.data !== o.value?.data && (o.value = c) : o.value = null;
  }
  return i.value ? a() : Ut(() => {
    i.value = !0, a();
  }), Bt(() => t.icon, a), Wt(s), () => {
    const c = o.value;
    if (!c)
      return mt(Xe, t);
    let f = t;
    return c.classes && (f = {
      ...t,
      class: c.classes.join(" ")
    }), mt({
      ...H,
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
var Y = "data-wippy-visible";
function gt(t) {
  const e = t.getAttribute(Y);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var Ze = Object.defineProperty, Lt = (t) => {
  throw TypeError(t);
}, tn = (t, e, n) => e in t ? Ze(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, y = (t, e, n) => tn(t, typeof e != "symbol" ? e + "" : e, n), Vt = (t, e, n) => e.has(t) || Lt("Cannot " + n), en = (t, e, n) => (Vt(t, e, "read from private field"), n ? n.call(t) : e.get(t)), nn = (t, e, n) => e.has(t) ? Lt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), sn = (t, e, n, s) => (Vt(t, e, "write to private field"), e.set(t, n), n), rn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], on = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function yt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function cn(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [s, i] of Object.entries(n)) {
        if ((s === "@light" || s === "@dark") && i && typeof i == "object") {
          for (const [o, l] of Object.entries(i)) {
            const a = typeof l == "string" ? yt(o) : null;
            a && e.add(a);
          }
          continue;
        }
        const r = typeof i == "string" ? yt(s) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function ln(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${on} {
${e}
}`;
}
function an(t, e) {
  const n = ln(e);
  n && Rt(t, n, "@wippy-fe/css-variables-bridge");
}
function un(t, e) {
  const s = (e ?? rn).map(async (i) => {
    const r = te[i];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await ee(r);
    } catch (o) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${r}):`, o), null;
    }
  });
  return Promise.all(s).then((i) => {
    for (const r of i) {
      if (!r)
        continue;
      const o = document.createElement("style");
      o.textContent = r, o.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(o);
    }
  });
}
function fn(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Rt(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", n), s.textContent = e, t.appendChild(s);
}
function hn(t, e) {
  Rt(t, e, "@wippy-fe/custom-css");
}
function Ft(t) {
  return t.__wippyHost ?? null;
}
function pn(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function dn(t, e, n) {
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
function W(t, e) {
  const n = {}, s = [];
  for (const [i, r] of Object.entries(e.properties)) {
    const o = t.getAttribute(i), l = pn(i);
    if (o === null) {
      r.default !== void 0 && (n[l] = r.default);
      continue;
    }
    const a = dn(i, o, r);
    a.error ? s.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: s };
}
var mn = class {
  constructor(t, e) {
    y(this, "_props"), y(this, "_errors"), y(this, "_content"), y(this, "_hostVisibility"), y(this, "_propsListeners", /* @__PURE__ */ new Set()), y(this, "_contentListeners", /* @__PURE__ */ new Set()), y(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), y(this, "_disposed", !1), y(this, "_emitToDom"), y(this, "props"), y(this, "events"), y(this, "content"), y(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
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
}, M, gn = class extends HTMLElement {
  constructor() {
    super(), y(this, "_internals"), y(this, "_contentObserver", null), y(this, "_initialized", !1), y(this, "_container", null), nn(this, M, null), y(this, "_attachment", 0), y(this, "_reactive", null), y(this, "_lastProps", null), y(this, "_lastErrors", []), y(this, "_lastContent", null), y(this, "_themeUnsub", null), y(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = gt(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...n, Y])];
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
    return Ft(this);
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
        const r = W(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), n = r.props, s = r.errors, this._lastProps = n, this._lastErrors = s;
      }
      const i = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new mn(
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
      const e = this.constructor.wippyConfig, n = this._initialized, s = en(this, M) ?? sn(this, M, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let i;
      if (this._container)
        i = this._container;
      else {
        if (this.onInit(s), t !== this._attachment)
          return;
        e.inlineCss && fn(s, e.inlineCss);
        try {
          const f = nt?.theming, u = cn(
            f?.global?.cssVariables,
            f?.children?.cssVariables
          );
          an(s, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const f = nt?.theming, u = [f?.global?.customCSS, f?.children?.customCSS].filter(Boolean).join(`
`);
            u && hn(s, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && un(s, e.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, Jt(It);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Xt("@theme", (c) => this._applyTheme(c)));
      const { props: r, errors: o } = W(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(r));
      const l = r;
      this._lastProps = l, this._lastErrors = o;
      let a = null;
      if (e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, l, o, a, n), t !== this._attachment)
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
  _applyTheme(t = Zt.getThemeMode?.()) {
    R(t, this), this._container && R(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), R("auto", this), this._container && R("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === Y) {
      const l = this._hostVisible, a = gt(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const s = this.constructor.wippyConfig, { props: i, errors: r } = W(this, s.propsSchema);
    s.validateProps && r.push(...s.validateProps(i));
    const o = i;
    this._lastProps = o, this._lastErrors = r, this._reactive?.notifyProps(o, r), this.onPropsChanged(o, r);
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
M = /* @__PURE__ */ new WeakMap();
function yn(t) {
  return t.__wippyHostBus ?? null;
}
function bn(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let jt;
const zt = (t) => jt = t, _n = () => Kt() && J(Nt) || jt, Nt = (
  /* istanbul ignore next */
  Symbol()
);
function vn() {
  const t = Qt(!0), e = t.run(() => I({}));
  let n = [], s = [];
  const i = Gt({
    install(r) {
      zt(i), i._a = r, r.provide(Nt, i), r.config.globalProperties.$pinia = i, s.forEach((o) => n.push(o)), s = [];
    },
    use(r) {
      return this._a ? n.push(r) : s.push(r), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var wn = Object.defineProperty, Cn = (t, e, n) => e in t ? wn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, E = (t, e, n) => Cn(t, typeof e != "symbol" ? e + "" : e, n);
function kn(t, e) {
  return { lazyConfig: t, mountLifecycle: !0, lazyUi: e };
}
function bt(t, e, n) {
  const s = t.createElement("div"), i = n ? e.failed : e.loading;
  s.dataset.lazyState = n ? "failed" : "loading", s.setAttribute("role", n ? "alert" : "status"), s.setAttribute("aria-label", i), s.style.cssText = "display:grid;place-items:center;text-align:center;";
  const r = e.surface === "page";
  if (s.style.cssText += r ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    s.style.color = "var(--p-danger-500, currentColor)", s.textContent = !r && e.iconOnly ? "⚠" : i, !r && e.iconOnly && (s.title = i);
  else {
    const o = t.createElement("style");
    o.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const l = t.createElement("span");
    l.dataset.wippySpinner = "", l.setAttribute("aria-hidden", "true"), l.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", l.style.fontSize = r ? "2rem" : "1em", s.append(o, l);
  }
  return s;
}
var Mt = /* @__PURE__ */ Symbol("wippy:emit"), Dt = /* @__PURE__ */ Symbol("wippy:props"), Sn = /* @__PURE__ */ Symbol("wippy:props_error"), xn = /* @__PURE__ */ Symbol("wippy:content"), En = /* @__PURE__ */ Symbol("wippy:panel-id"), In = /* @__PURE__ */ Symbol("wippy:layout-bus"), Pn = /* @__PURE__ */ Symbol("wippy:host"), Tn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ln() {
  const t = J(Dt);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Vn() {
  const t = J(Mt);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var F = /* @__PURE__ */ new WeakMap();
function _t(t, e) {
  const n = F.get(t);
  if (n)
    return n;
  const s = Promise.resolve().then(e);
  return F.set(t, s), s.catch(() => {
    F.get(t) === s && F.delete(t);
  }), s;
}
var Rn = class extends gn {
  constructor() {
    super(...arguments), E(this, "_vueApp", null), E(this, "_mountingApp", !1), E(this, "_mountState", "idle"), E(this, "_feedback", null), E(this, "_propsRef", I({})), E(this, "_errorsRef", I([])), E(this, "_contentRef", I(null)), E(this, "_hostVisibilityRef", I(null)), E(this, "_bridgeAbort", null);
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
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await _t(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, n, s, i, r) {
    const o = this.constructor, l = o.vueConfig, a = new AbortController();
    this._bridgeAbort = a;
    const c = () => !a.signal.aborted && this._bridgeAbort === a;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = s, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of s)
      if (this.emitEvent("invalid", { message: u }), !c())
        return;
    this.reactive.props.subscribe((u, p) => {
      this._propsRef.value = u, this._errorsRef.value = [...p];
      for (const h of p)
        this.emitEvent("invalid", { message: h });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: a.signal });
    const f = (u) => {
      if (!c())
        return;
      const p = _n(), h = Yt(u.rootComponent);
      let b = !1, g = !1, d, x;
      this._mountingApp = !0;
      try {
        const S = vn();
        if (u.piniaPlugins)
          for (const _ of u.piniaPlugins)
            S.use(_);
        h.use(S);
        for (const _ of u.plugins ?? [])
          h.use(_);
        if (h.provide(Dt, this._propsRef), h.provide(Sn, this._errorsRef), h.provide(Mt, this.emitEvent.bind(this)), h.provide(xn, this._contentRef), h.provide(Tn, this._hostVisibilityRef), h.provide(En, bn(this)), h.provide(In, yn(this)), h.provide(Pn, Ft(this)), u.providers?.(h, this), !c())
          return;
        if (x = h.config.errorHandler, l.mountLifecycle && (h.config.errorHandler = (_, C, v) => {
          g || (d = _), g = !0, x?.(_, C, v);
        }), h.mount(e), b = !0, g)
          throw d;
        c() && (this._vueApp = h);
      } finally {
        l.mountLifecycle && b && (h.config.errorHandler = x);
        try {
          b && (g || !c()) && h.unmount();
        } finally {
          zt(p), this._mountingApp = !1;
        }
      }
      l.mountLifecycle && queueMicrotask(() => {
        c() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (l.rootComponent) {
      if (this._mountingApp && l.mountLifecycle) {
        queueMicrotask(() => {
          try {
            f(l);
          } catch (u) {
            c() && (this._mountState = "failed", this.emitEvent("error", { message: u instanceof Error ? u.message : String(u), error: u }));
          }
        });
        return;
      }
      try {
        f(l);
      } catch (u) {
        if (c())
          throw this._mountState = "failed", u;
      }
    } else if (l.lazyConfig) {
      const u = e.ownerDocument, p = l.lazyUi;
      p?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let h = !1, b, g;
      const d = () => {
        clearTimeout(b), clearTimeout(g), this._feedback?.remove(), this._feedback = null;
      };
      a.signal.addEventListener("abort", d, { once: !0 });
      const x = () => {
        if (!c() || h)
          return;
        const v = p ? bt(u, p, !1) : u.createElement("wippy-loading");
        v.setAttribute("no-bg", ""), this._feedback = v, e.appendChild(v);
      }, S = (v) => {
        if (!c())
          return;
        h = !0, d(), this._mountState = "failed";
        const m = p?.failed ?? (v instanceof Error ? v.message : String(v)), w = p ? bt(u, p, !0) : u.createElement("wippy-error");
        p || (w.setAttribute("title", "Failed to load"), w.setAttribute("message", m)), this._feedback = w, e.appendChild(w), this.emitEvent("error", p ? { message: m, error: v } : { message: m });
      }, _ = p?.delay ?? (p?.surface === "compact" ? 200 : 0);
      _ > 0 ? b = setTimeout(x, _) : x(), p && (g = setTimeout(() => S(new Error("The component did not load in time.")), p.timeout ?? 3e4)), (l.mountLifecycle ? _t(o, l.lazyConfig) : l.lazyConfig()).then((v) => {
        !c() || h || (h = !0, d(), f(v));
      }, (v) => {
        h || S(v);
      }).catch(S);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
};
export {
  Rn as W,
  Vn as a,
  kn as l,
  Ln as u
};
//# sourceMappingURL=wc-runtime-BSKB6yGs.js.map
