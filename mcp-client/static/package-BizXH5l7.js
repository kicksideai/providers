import { defineComponent as Le, ref as _, shallowRef as ze, onMounted as Fe, watch as Ne, onUnmounted as Me, h as Z, nextTick as De, hasInjectionContext as $e, inject as Y, effectScope as Ue, markRaw as He, createApp as Be } from "vue";
import { config as ee, addIcons as We, on as qe, applyThemeMode as A, host as Ke, hostCss as Qe, loadCss as Ye } from "@wippy-fe/proxy";
const ge = /^[a-z0-9]+(-[a-z0-9]+)*$/, N = (e, t, n, i = "") => {
  const r = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (r.length < 2 || r.length > 3) return null;
    i = r.shift().slice(1);
  }
  if (r.length > 3 || !r.length) return null;
  if (r.length > 1) {
    const c = r.pop(), l = r.pop(), a = {
      provider: r.length > 0 ? r[0] : i,
      prefix: l,
      name: c
    };
    return t && !j(a) ? null : a;
  }
  const o = r[0], s = o.split("-");
  if (s.length > 1) {
    const c = {
      provider: i,
      prefix: s.shift(),
      name: s.join("-")
    };
    return t && !j(c) ? null : c;
  }
  if (n && i === "") {
    const c = {
      provider: i,
      prefix: "",
      name: o
    };
    return t && !j(c, n) ? null : c;
  }
  return null;
}, j = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function Ge(e, t) {
  const n = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null);
  function o(s) {
    if (n[s]) return r[s] = [];
    if (!(s in r)) {
      r[s] = null;
      const c = i[s] && i[s].parent, l = c && o(c);
      l && (r[s] = [c].concat(l));
    }
    return r[s];
  }
  return Object.keys(n).concat(Object.keys(i)).forEach(o), r;
}
const be = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), F = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), M = Object.freeze({
  ...be,
  ...F
}), B = Object.freeze({
  ...M,
  body: "",
  hidden: !1
});
function Je(e, t) {
  const n = {};
  !e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0);
  const i = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return i && (n.rotate = i), n;
}
function te(e, t) {
  const n = Je(e, t);
  for (const i in B) i in F ? i in e && !(i in n) && (n[i] = F[i]) : i in t ? n[i] = t[i] : i in e && (n[i] = e[i]);
  return n;
}
function Xe(e, t, n) {
  const i = e.icons, r = e.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function s(c) {
    o = te(i[c] || r[c], o);
  }
  return s(t), n.forEach(s), te(e, o);
}
function xe(e, t) {
  const n = [];
  if (typeof e != "object" || typeof e.icons != "object") return n;
  e.not_found instanceof Array && e.not_found.forEach((r) => {
    t(r, null), n.push(r);
  });
  const i = Ge(e);
  for (const r in i) {
    const o = i[r];
    o && (t(r, Xe(e, r, o)), n.push(r));
  }
  return n;
}
const Ze = {
  provider: "",
  aliases: {},
  not_found: {},
  ...be
};
function $(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function ye(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !$(e, Ze)) return null;
  const n = t.icons;
  for (const r in n) {
    const o = n[r];
    if (!r || typeof o.body != "string" || !$(o, B)) return null;
  }
  const i = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const r in i) {
    const o = i[r], s = o.parent;
    if (!r || typeof s != "string" || !n[s] && !i[s] || !$(o, B)) return null;
  }
  return t;
}
const ne = /* @__PURE__ */ Object.create(null);
function et(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function E(e, t) {
  const n = ne[e] || (ne[e] = /* @__PURE__ */ Object.create(null));
  return n[t] || (n[t] = et(e, t));
}
function ve(e, t) {
  return ye(t) ? xe(t, (n, i) => {
    i ? e.icons[n] = i : e.missing.add(n);
  }) : [];
}
function tt(e, t, n) {
  try {
    if (typeof n.body == "string")
      return e.icons[t] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let R = !1;
function we(e) {
  return typeof e == "boolean" && (R = e), R;
}
function nt(e) {
  const t = typeof e == "string" ? N(e, !0, R) : e;
  if (t) {
    const n = E(t.provider, t.prefix), i = t.name;
    return n.icons[i] || (n.missing.has(i) ? null : void 0);
  }
}
function rt(e, t) {
  const n = N(e, !0, R);
  if (!n) return !1;
  const i = E(n.provider, n.prefix);
  return t ? tt(i, n.name, t) : (i.missing.add(n.name), !0);
}
function _e(e, t) {
  if (typeof e != "object") return !1;
  if (typeof t != "string" && (t = e.provider || ""), R && !t && !e.prefix) {
    let r = !1;
    return ye(e) && (e.prefix = "", xe(e, (o, s) => {
      rt(o, s) && (r = !0);
    })), r;
  }
  const n = e.prefix;
  if (!j({
    prefix: n,
    name: "a"
  })) return !1;
  const i = E(t, n);
  return !!ve(i, e);
}
const Ce = Object.freeze({
  width: null,
  height: null
}), Se = Object.freeze({
  ...Ce,
  ...F
}), it = /(-?[0-9.]*[0-9]+[0-9.]*)/g, ot = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function re(e, t, n) {
  if (t === 1) return e;
  if (n = n || 100, typeof e == "number") return Math.ceil(e * t * n) / n;
  if (typeof e != "string") return e;
  const i = e.split(it);
  if (i === null || !i.length) return e;
  const r = [];
  let o = i.shift(), s = ot.test(o);
  for (; ; ) {
    if (s) {
      const c = parseFloat(o);
      isNaN(c) ? r.push(o) : r.push(Math.ceil(c * t * n) / n);
    } else r.push(o);
    if (o = i.shift(), o === void 0) return r.join("");
    s = !s;
  }
}
function st(e, t = "defs") {
  let n = "";
  const i = e.indexOf("<" + t);
  for (; i >= 0; ) {
    const r = e.indexOf(">", i), o = e.indexOf("</" + t);
    if (r === -1 || o === -1) break;
    const s = e.indexOf(">", o);
    if (s === -1) break;
    n += e.slice(r + 1, o).trim(), e = e.slice(0, i).trim() + e.slice(s + 1);
  }
  return {
    defs: n,
    content: e
  };
}
function at(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function ct(e, t, n) {
  const i = st(e);
  return at(i.defs, t + i.content + n);
}
const lt = (e) => e === "unset" || e === "undefined" || e === "none";
function pt(e, t) {
  const n = {
    ...M,
    ...e
  }, i = {
    ...Se,
    ...t
  }, r = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let o = n.body;
  [n, i].forEach((b) => {
    const d = [], k = b.hFlip, C = b.vFlip;
    let w = b.rotate;
    k ? C ? w += 2 : (d.push("translate(" + (r.width + r.left).toString() + " " + (0 - r.top).toString() + ")"), d.push("scale(-1 1)"), r.top = r.left = 0) : C && (d.push("translate(" + (0 - r.left).toString() + " " + (r.height + r.top).toString() + ")"), d.push("scale(1 -1)"), r.top = r.left = 0);
    let y;
    switch (w < 0 && (w -= Math.floor(w / 4) * 4), w = w % 4, w) {
      case 1:
        y = r.height / 2 + r.top, d.unshift("rotate(90 " + y.toString() + " " + y.toString() + ")");
        break;
      case 2:
        d.unshift("rotate(180 " + (r.width / 2 + r.left).toString() + " " + (r.height / 2 + r.top).toString() + ")");
        break;
      case 3:
        y = r.width / 2 + r.left, d.unshift("rotate(-90 " + y.toString() + " " + y.toString() + ")");
    }
    w % 2 === 1 && (r.left !== r.top && (y = r.left, r.left = r.top, r.top = y), r.width !== r.height && (y = r.width, r.width = r.height, r.height = y)), d.length && (o = ct(o, '<g transform="' + d.join(" ") + '">', "</g>"));
  });
  const s = i.width, c = i.height, l = r.width, a = r.height;
  let p, u;
  s === null ? (u = c === null ? "1em" : c === "auto" ? a : c, p = re(u, l / a)) : (p = s === "auto" ? l : s, u = c === null ? re(p, a / l) : c === "auto" ? a : c);
  const f = {}, g = (b, d) => {
    lt(d) || (f[b] = d.toString());
  };
  g("width", p), g("height", u);
  const x = [
    r.left,
    r.top,
    l,
    a
  ];
  return f.viewBox = x.join(" "), {
    attributes: f,
    viewBox: x,
    body: o
  };
}
const ut = /\sid="(\S+)"/g, ie = /* @__PURE__ */ new Map();
function dt(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = ie.get(e) || 0;
  return ie.set(e, t + 1), t ? `${e}${t}` : e;
}
function ft(e) {
  const t = [];
  let n;
  for (; n = ut.exec(e); ) t.push(n[1]);
  if (!t.length) return e;
  const i = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((r) => {
    const o = dt(r), s = r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + s + ')([")]|\\.[a-z])', "g"), "$1" + o + i + "$3");
  }), e = e.replace(new RegExp(i, "g"), ""), e;
}
const W = /* @__PURE__ */ Object.create(null);
function ht(e, t) {
  W[e] = t;
}
function q(e) {
  return W[e] || W[""];
}
function G(e) {
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
const J = /* @__PURE__ */ Object.create(null), T = ["https://api.simplesvg.com", "https://api.unisvg.com"], L = [];
for (; T.length > 0; ) T.length === 1 || Math.random() > 0.5 ? L.push(T.shift()) : L.push(T.pop());
J[""] = G({ resources: ["https://api.iconify.design"].concat(L) });
function mt(e, t) {
  const n = G(t);
  return n === null ? !1 : (J[e] = n, !0);
}
function X(e) {
  return J[e];
}
const gt = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function") return e;
  } catch {
  }
};
let oe = gt();
function bt(e, t) {
  const n = X(e);
  if (!n) return 0;
  let i;
  if (!n.maxURL) i = 0;
  else {
    let r = 0;
    n.resources.forEach((s) => {
      r = Math.max(r, s.length);
    });
    const o = t + ".json?icons=";
    i = n.maxURL - r - n.path.length - o.length;
  }
  return i;
}
function xt(e) {
  return e === 404;
}
const yt = (e, t, n) => {
  const i = [], r = bt(e, t), o = "icons";
  let s = {
    type: o,
    provider: e,
    prefix: t,
    icons: []
  }, c = 0;
  return n.forEach((l, a) => {
    c += l.length + 1, c >= r && a > 0 && (i.push(s), s = {
      type: o,
      provider: e,
      prefix: t,
      icons: []
    }, c = l.length), s.icons.push(l);
  }), i.push(s), i;
};
function vt(e) {
  if (typeof e == "string") {
    const t = X(e);
    if (t) return t.path;
  }
  return "/";
}
const wt = (e, t, n) => {
  if (!oe) {
    n("abort", 424);
    return;
  }
  let i = vt(t.provider);
  switch (t.type) {
    case "icons": {
      const o = t.prefix, s = t.icons.join(","), c = new URLSearchParams({ icons: s });
      i += o + ".json?" + c.toString();
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
  let r = 503;
  oe(e + i).then((o) => {
    const s = o.status;
    if (s !== 200) {
      setTimeout(() => {
        n(xt(s) ? "abort" : "next", s);
      });
      return;
    }
    return r = 501, o.json();
  }).then((o) => {
    if (typeof o != "object" || o === null) {
      setTimeout(() => {
        o === 404 ? n("abort", o) : n("next", r);
      });
      return;
    }
    setTimeout(() => {
      n("success", o);
    });
  }).catch(() => {
    n("next", r);
  });
}, _t = {
  prepare: yt,
  send: wt
};
function ke(e, t) {
  e.forEach((n) => {
    const i = n.loaderCallbacks;
    i && (n.loaderCallbacks = i.filter((r) => r.id !== t));
  });
}
function Ct(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length) return;
    let n = !1;
    const i = e.provider, r = e.prefix;
    t.forEach((o) => {
      const s = o.icons, c = s.pending.length;
      s.pending = s.pending.filter((l) => {
        if (l.prefix !== r) return !0;
        const a = l.name;
        if (e.icons[a]) s.loaded.push({
          provider: i,
          prefix: r,
          name: a
        });
        else if (e.missing.has(a)) s.missing.push({
          provider: i,
          prefix: r,
          name: a
        });
        else
          return n = !0, !0;
        return !1;
      }), s.pending.length !== c && (n || ke([e], o.id), o.callback(s.loaded.slice(0), s.missing.slice(0), s.pending.slice(0), o.abort));
    });
  }));
}
let St = 0;
function kt(e, t, n) {
  const i = St++, r = ke.bind(null, n, i);
  if (!t.pending.length) return r;
  const o = {
    id: i,
    icons: t,
    callback: e,
    abort: r
  };
  return n.forEach((s) => {
    (s.loaderCallbacks || (s.loaderCallbacks = [])).push(o);
  }), r;
}
function It(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  e.sort((r, o) => r.provider !== o.provider ? r.provider.localeCompare(o.provider) : r.prefix !== o.prefix ? r.prefix.localeCompare(o.prefix) : r.name.localeCompare(o.name));
  let i = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((r) => {
    if (i.name === r.name && i.prefix === r.prefix && i.provider === r.provider) return;
    i = r;
    const o = r.provider, s = r.prefix, c = r.name, l = n[o] || (n[o] = /* @__PURE__ */ Object.create(null)), a = l[s] || (l[s] = E(o, s));
    let p;
    c in a.icons ? p = t.loaded : s === "" || a.missing.has(c) ? p = t.missing : p = t.pending;
    const u = {
      provider: o,
      prefix: s,
      name: c
    };
    p.push(u);
  }), t;
}
function Et(e, t = !0, n = !1) {
  const i = [];
  return e.forEach((r) => {
    const o = typeof r == "string" ? N(r, t, n) : r;
    o && i.push(o);
  }), i;
}
const Pt = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function Tt(e, t, n, i) {
  const r = e.resources.length, o = e.random ? Math.floor(Math.random() * r) : e.index;
  let s;
  if (e.random) {
    let h = e.resources.slice(0);
    for (s = []; h.length > 1; ) {
      const v = Math.floor(Math.random() * h.length);
      s.push(h[v]), h = h.slice(0, v).concat(h.slice(v + 1));
    }
    s = s.concat(h);
  } else s = e.resources.slice(o).concat(e.resources.slice(0, o));
  const c = Date.now();
  let l = "pending", a = 0, p, u = null, f = [], g = [];
  typeof i == "function" && g.push(i);
  function x() {
    u && (clearTimeout(u), u = null);
  }
  function b() {
    l === "pending" && (l = "aborted"), x(), f.forEach((h) => {
      h.status === "pending" && (h.status = "aborted");
    }), f = [];
  }
  function d(h, v) {
    v && (g = []), typeof h == "function" && g.push(h);
  }
  function k() {
    return {
      startTime: c,
      payload: t,
      status: l,
      queriesSent: a,
      queriesPending: f.length,
      subscribe: d,
      abort: b
    };
  }
  function C() {
    l = "failed", g.forEach((h) => {
      h(void 0, p);
    });
  }
  function w() {
    f.forEach((h) => {
      h.status === "pending" && (h.status = "aborted");
    }), f = [];
  }
  function y(h, v, P) {
    const V = v !== "success";
    switch (f = f.filter((S) => S !== h), l) {
      case "pending":
        break;
      case "failed":
        if (V || !e.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (v === "abort") {
      p = P, C();
      return;
    }
    if (V) {
      p = P, f.length || (s.length ? D() : C());
      return;
    }
    if (x(), w(), !e.random) {
      const S = e.resources.indexOf(h.resource);
      S !== -1 && S !== e.index && (e.index = S);
    }
    l = "completed", g.forEach((S) => {
      S(P);
    });
  }
  function D() {
    if (l !== "pending") return;
    x();
    const h = s.shift();
    if (h === void 0) {
      if (f.length) {
        u = setTimeout(() => {
          x(), l === "pending" && (w(), C());
        }, e.timeout);
        return;
      }
      C();
      return;
    }
    const v = {
      status: "pending",
      resource: h,
      callback: (P, V) => {
        y(v, P, V);
      }
    };
    f.push(v), a++, u = setTimeout(D, e.rotate), n(h, t, v.callback);
  }
  return setTimeout(D), k;
}
function Ie(e) {
  const t = {
    ...Pt,
    ...e
  };
  let n = [];
  function i() {
    n = n.filter((s) => s().status === "pending");
  }
  function r(s, c, l) {
    const a = Tt(t, s, c, (p, u) => {
      i(), l && l(p, u);
    });
    return n.push(a), a;
  }
  function o(s) {
    return n.find((c) => s(c)) || null;
  }
  return {
    query: r,
    find: o,
    setIndex: (s) => {
      t.index = s;
    },
    getIndex: () => t.index,
    cleanup: i
  };
}
function se() {
}
const U = /* @__PURE__ */ Object.create(null);
function Ot(e) {
  if (!U[e]) {
    const t = X(e);
    if (!t) return;
    const n = {
      config: t,
      redundancy: Ie(t)
    };
    U[e] = n;
  }
  return U[e];
}
function Rt(e, t, n) {
  let i, r;
  if (typeof e == "string") {
    const o = q(e);
    if (!o)
      return n(void 0, 424), se;
    r = o.send;
    const s = Ot(e);
    s && (i = s.redundancy);
  } else {
    const o = G(e);
    if (o) {
      i = Ie(o);
      const s = e.resources ? e.resources[0] : "", c = q(s);
      c && (r = c.send);
    }
  }
  return !i || !r ? (n(void 0, 424), se) : i.query(t, r, n)().abort;
}
function ae() {
}
function Vt(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, Ct(e);
  }));
}
function At(e) {
  const t = [], n = [];
  return e.forEach((i) => {
    (i.match(ge) ? t : n).push(i);
  }), {
    valid: t,
    invalid: n
  };
}
function O(e, t, n) {
  function i() {
    const r = e.pendingIcons;
    t.forEach((o) => {
      r && r.delete(o), e.icons[o] || e.missing.add(o);
    });
  }
  if (n && typeof n == "object") try {
    if (!ve(e, n).length) {
      i();
      return;
    }
  } catch (r) {
    console.error(r);
  }
  i(), Vt(e);
}
function ce(e, t) {
  e instanceof Promise ? e.then((n) => {
    t(n);
  }).catch(() => {
    t(null);
  }) : t(e);
}
function jt(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: n, prefix: i } = e, r = e.iconsToLoad;
    if (delete e.iconsToLoad, !r || !r.length) return;
    const o = e.loadIcon;
    if (e.loadIcons && (r.length > 1 || !o)) {
      ce(e.loadIcons(r, i, n), (a) => {
        O(e, r, a);
      });
      return;
    }
    if (o) {
      r.forEach((a) => {
        ce(o(a, i, n), (p) => {
          O(e, [a], p ? {
            prefix: i,
            icons: { [a]: p }
          } : null);
        });
      });
      return;
    }
    const { valid: s, invalid: c } = At(r);
    if (c.length && O(e, c, null), !s.length) return;
    const l = i.match(ge) ? q(n) : null;
    if (!l) {
      O(e, s, null);
      return;
    }
    l.prepare(n, i, s).forEach((a) => {
      Rt(n, a, (p) => {
        O(e, a.icons, p);
      });
    });
  }));
}
const Lt = (e, t) => {
  const n = Et(e, !0, we()), i = It(n);
  if (!i.pending.length) {
    let l = !0;
    return t && setTimeout(() => {
      l && t(i.loaded, i.missing, i.pending, ae);
    }), () => {
      l = !1;
    };
  }
  const r = /* @__PURE__ */ Object.create(null), o = [];
  let s, c;
  return i.pending.forEach((l) => {
    const { provider: a, prefix: p } = l;
    if (p === c && a === s) return;
    s = a, c = p, o.push(E(a, p));
    const u = r[a] || (r[a] = /* @__PURE__ */ Object.create(null));
    u[p] || (u[p] = []);
  }), i.pending.forEach((l) => {
    const { provider: a, prefix: p, name: u } = l, f = E(a, p), g = f.pendingIcons || (f.pendingIcons = /* @__PURE__ */ new Set());
    g.has(u) || (g.add(u), r[a][p].push(u));
  }), o.forEach((l) => {
    const a = r[l.provider][l.prefix];
    a.length && jt(l, a);
  }), t ? kt(t, i, o) : ae;
};
function zt(e, t) {
  const n = { ...e };
  for (const i in t) {
    const r = t[i], o = typeof r;
    i in Ce ? (r === null || r && (o === "string" || o === "number")) && (n[i] = r) : o === typeof n[i] && (n[i] = i === "rotate" ? r % 4 : r);
  }
  return n;
}
const Ft = /[\s,]+/;
function Nt(e, t) {
  t.split(Ft).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function Mt(e, t = 0) {
  const n = e.replace(/^-?[0-9.]*/, "");
  function i(r) {
    for (; r < 0; ) r += 4;
    return r % 4;
  }
  if (n === "") {
    const r = parseInt(e);
    return isNaN(r) ? 0 : i(r);
  } else if (n !== e) {
    let r = 0;
    switch (n) {
      case "%":
        r = 25;
        break;
      case "deg":
        r = 90;
    }
    if (r) {
      let o = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(o) ? 0 : (o = o / r, o % 1 === 0 ? i(o) : 0);
    }
  }
  return t;
}
function Dt(e, t) {
  let n = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const i in t) n += " " + i + '="' + t[i] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
}
function $t(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function Ut(e) {
  return "data:image/svg+xml," + $t(e);
}
function Ht(e) {
  return 'url("' + Ut(e) + '")';
}
const le = {
  ...Se,
  inline: !1
}, Bt = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, Wt = {
  display: "inline-block"
}, K = {
  backgroundColor: "currentColor"
}, Ee = {
  backgroundColor: "transparent"
}, pe = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, ue = {
  webkitMask: K,
  mask: K,
  background: Ee
};
for (const e in ue) {
  const t = ue[e];
  for (const n in pe)
    t[e + n] = pe[n];
}
const z = {};
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  z[e + "-flip"] = t, z[e.slice(0, 1) + "-flip"] = t, z[e + "Flip"] = t;
});
function de(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const fe = (e, t) => {
  const n = zt(le, t), i = { ...Bt }, r = t.mode || "svg", o = {}, s = t.style, c = typeof s == "object" && !(s instanceof Array) ? s : {};
  for (let b in t) {
    const d = t[b];
    if (d !== void 0)
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
          n[b] = d === !0 || d === "true" || d === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          o.color = d;
          break;
        // Rotation as string
        case "rotate":
          typeof d == "string" ? n[b] = Mt(d) : typeof d == "number" && (n[b] = d);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          d !== !0 && d !== "true" && delete i["aria-hidden"];
          break;
        default: {
          const k = z[b];
          k ? (d === !0 || d === "true" || d === 1) && (n[k] = !0) : le[b] === void 0 && (i[b] = d);
        }
      }
  }
  typeof t.flip == "string" && Nt(n, t.flip);
  const l = pt(e, n), a = l.attributes;
  if (n.inline && (o.verticalAlign = "-0.125em"), r === "svg")
    return i.style = {
      ...o,
      ...c
    }, Object.assign(i, a), i.innerHTML = ft(l.body), Z("svg", i);
  const { body: p, width: u, height: f } = e, g = r === "mask" || (r === "bg" ? !1 : p.indexOf("currentColor") !== -1), x = Dt(p, {
    ...a,
    width: u + "",
    height: f + ""
  });
  return i.style = {
    ...o,
    "--svg": Ht(x),
    width: de(a.width),
    height: de(a.height),
    ...Wt,
    ...g ? K : Ee,
    ...c
  }, Z("span", i);
};
we(!0);
ht("", _t);
if (typeof document < "u" && typeof window < "u") {
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((i) => {
      try {
        // Check if item is an object and not null/array
        (typeof i != "object" || i === null || i instanceof Array || // Check for 'icons' and 'prefix'
        typeof i.icons != "object" || typeof i.prefix != "string" || // Add icon set
        !_e(i)) && console.error(n);
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
          const r = t[n];
          if (typeof r != "object" || !r || r.resources === void 0)
            continue;
          mt(n, r) || console.error(i);
        } catch {
          console.error(i);
        }
      }
  }
}
const qt = {
  ...M,
  body: ""
};
Le((e, { emit: t }) => {
  const n = _(null);
  function i() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const r = _(!!e.ssr), o = _(""), s = ze(null);
  function c() {
    const a = e.icon;
    if (typeof a == "object" && a !== null && typeof a.body == "string")
      return o.value = "", {
        data: a
      };
    let p;
    if (typeof a != "string" || (p = N(a, !1, !0)) === null)
      return null;
    let u = nt(p);
    if (!u) {
      const x = n.value;
      return (!x || x.name !== a) && (u === null ? n.value = {
        name: a
      } : n.value = {
        name: a,
        abort: Lt([p], l)
      }), null;
    }
    i(), o.value !== a && (o.value = a, De(() => {
      t("load", a);
    }));
    const f = e.customise;
    if (f) {
      u = Object.assign({}, u);
      const x = f(u.body, p.name, p.prefix, p.provider);
      typeof x == "string" && (u.body = x);
    }
    const g = ["iconify"];
    return p.prefix !== "" && g.push("iconify--" + p.prefix), p.provider !== "" && g.push("iconify--" + p.provider), { data: u, classes: g };
  }
  function l() {
    const a = c();
    a ? a.data !== s.value?.data && (s.value = a) : s.value = null;
  }
  return r.value ? l() : Fe(() => {
    r.value = !0, l();
  }), Ne(() => e.icon, l), Me(i), () => {
    const a = s.value;
    if (!a)
      return fe(qt, e);
    let p = e;
    return a.classes && (p = {
      ...e,
      class: a.classes.join(" ")
    }), fe({
      ...M,
      ...a.data
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
var Q = "data-wippy-visible";
function he(e) {
  const t = e.getAttribute(Q);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Kt = Object.defineProperty, Qt = (e, t, n) => t in e ? Kt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, m = (e, t, n) => Qt(e, typeof t != "symbol" ? t + "" : t, n), Yt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Gt = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function me(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Jt(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [i, r] of Object.entries(n)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [s, c] of Object.entries(r)) {
            const l = typeof c == "string" ? me(s) : null;
            l && t.add(l);
          }
          continue;
        }
        const o = typeof r == "string" ? me(i) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function Xt(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Gt} {
${t}
}`;
}
function Zt(e, t) {
  const n = Xt(t);
  n && Pe(e, n, "@wippy-fe/css-variables-bridge");
}
function en(e, t) {
  const i = (t ?? Yt).map(async (r) => {
    const o = Qe[r];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Ye(o);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${o}):`, s), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const o of r) {
      if (!o)
        continue;
      const s = document.createElement("style");
      s.textContent = o, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function tn(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Pe(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", n), i.textContent = t, e.appendChild(i);
}
function nn(e, t) {
  Pe(e, t, "@wippy-fe/custom-css");
}
function Te(e) {
  return e.__wippyHost ?? null;
}
function rn(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function on(e, t, n) {
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
function H(e, t) {
  const n = {}, i = [];
  for (const [r, o] of Object.entries(t.properties)) {
    const s = e.getAttribute(r), c = rn(r);
    if (s === null) {
      o.default !== void 0 && (n[c] = o.default);
      continue;
    }
    const l = on(r, s, o);
    l.error ? i.push(l.error) : n[c] = l.value;
  }
  return { props: n, errors: i };
}
var sn = class {
  constructor(e, t) {
    m(this, "_props"), m(this, "_errors"), m(this, "_content"), m(this, "_hostVisibility"), m(this, "_propsListeners", /* @__PURE__ */ new Set()), m(this, "_contentListeners", /* @__PURE__ */ new Set()), m(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), m(this, "_disposed", !1), m(this, "_emitToDom"), m(this, "props"), m(this, "events"), m(this, "content"), m(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(i, r) {
        return n._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        n._disposed || n._emitToDom(i, r);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(i, r) {
        return n._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(i, r) {
        return n._subscribeHostVisibility(i, r);
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
}, an = class extends HTMLElement {
  constructor() {
    super(), m(this, "_internals"), m(this, "_contentObserver", null), m(this, "_initialized", !1), m(this, "_container", null), m(this, "_reactive", null), m(this, "_lastProps", null), m(this, "_lastErrors", []), m(this, "_lastContent", null), m(this, "_themeUnsub", null), m(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = he(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Q])];
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
    return Te(this);
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
        const o = H(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, i = o.errors, this._lastProps = n, this._lastErrors = i;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new sn(
        { props: n, errors: i, content: r, hasContent: t, hostVisibility: this._hostVisible },
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
        this.onInit(n), e.inlineCss && tn(n, e.inlineCss);
        try {
          const a = ee?.theming, p = Jt(
            a?.global?.cssVariables,
            a?.children?.cssVariables
          );
          Zt(n, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const a = ee?.theming, p = [a?.global?.customCSS, a?.children?.customCSS].filter(Boolean).join(`
`);
            p && nn(n, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && en(n, e.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const l = e.containerClasses ?? [];
        l.length > 0 && i.classList.add(...l), n.appendChild(i), this._container = i, We(_e);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = qe("@theme", (l) => this._applyTheme(l)));
      const { props: r, errors: o } = H(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(r));
      const s = r;
      this._lastProps = s, this._lastErrors = o;
      let c = null;
      e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(e.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, i, s, o, c, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ke.getThemeMode?.()) {
    A(e, this), this._container && A(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), A("auto", this), this._container && A("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Q) {
      const c = this._hostVisible, l = he(this);
      if (l === c)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, c), this.onHostVisibilityChanged(l, c));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: o } = H(this, i.propsSchema);
    i.validateProps && o.push(...i.validateProps(r));
    const s = r;
    this._lastProps = s, this._lastErrors = o, this._reactive?.notifyProps(s, o), this.onPropsChanged(s, o);
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
function cn(e) {
  return e.__wippyHostBus ?? null;
}
function ln(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Oe;
const Re = (e) => Oe = e, pn = () => $e() && Y(Ve) || Oe, Ve = (
  /* istanbul ignore next */
  Symbol()
);
function un() {
  const e = Ue(!0), t = e.run(() => _({}));
  let n = [], i = [];
  const r = He({
    install(o) {
      Re(r), r._a = o, o.provide(Ve, r), o.config.globalProperties.$pinia = r, i.forEach((s) => n.push(s)), i = [];
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
  return r;
}
var dn = Object.defineProperty, fn = (e, t, n) => t in e ? dn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, I = (e, t, n) => fn(e, typeof t != "symbol" ? t + "" : t, n), Ae = /* @__PURE__ */ Symbol("wippy:emit"), je = /* @__PURE__ */ Symbol("wippy:props"), hn = /* @__PURE__ */ Symbol("wippy:props_error"), mn = /* @__PURE__ */ Symbol("wippy:content"), gn = /* @__PURE__ */ Symbol("wippy:panel-id"), bn = /* @__PURE__ */ Symbol("wippy:layout-bus"), xn = /* @__PURE__ */ Symbol("wippy:host"), yn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Cn() {
  const e = Y(je);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Sn() {
  const e = Y(Ae);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var kn = class extends an {
  constructor() {
    super(...arguments), I(this, "_vueApp", null), I(this, "_propsRef", _({})), I(this, "_errorsRef", _([])), I(this, "_contentRef", _(null)), I(this, "_hostVisibilityRef", _(null)), I(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, i, r, o) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const a of i)
      this.emitEvent("invalid", { message: a });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((a, p) => {
      this._propsRef.value = a, this._errorsRef.value = [...p];
      for (const u of p)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((a) => {
      this._contentRef.value = a;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((a) => {
      this._hostVisibilityRef.value = a;
    }, { signal: c.signal });
    const l = (a) => {
      if (c.signal.aborted)
        return;
      const p = pn(), u = Be(a.rootComponent);
      this._vueApp = u;
      const f = un();
      if (a.piniaPlugins)
        for (const g of a.piniaPlugins)
          f.use(g);
      if (u.use(f), a.plugins)
        for (const g of a.plugins)
          u.use(g);
      u.provide(je, this._propsRef), u.provide(hn, this._errorsRef), u.provide(Ae, this.emitEvent.bind(this)), u.provide(mn, this._contentRef), u.provide(yn, this._hostVisibilityRef), u.provide(gn, ln(this)), u.provide(bn, cn(this)), u.provide(xn, Te(this)), a.providers && a.providers(u, this), u.mount(t), p && Re(p);
    };
    if (s.rootComponent)
      l(s);
    else if (s.lazyConfig) {
      const a = document.createElement("wippy-loading");
      a.setAttribute("no-bg", ""), t.appendChild(a), s.lazyConfig().then((p) => {
        c.signal.aborted || (a.remove(), l(p));
      }).catch((p) => {
        if (c.signal.aborted)
          return;
        const u = p instanceof Error ? p.message : String(p), f = document.createElement("wippy-error");
        f.setAttribute("title", "Failed to load"), f.setAttribute("message", u), a.replaceWith(f), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const In = ':host{display:block;color-scheme:light dark;--mc-bg:var(--p-content-background,#fff);--mc-surface:color-mix(in srgb,var(--p-text-color,#111827) 3.5%,var(--mc-bg));--mc-surface-2:color-mix(in srgb,var(--p-text-color,#111827) 6%,var(--mc-bg));--mc-border:var(--p-content-border-color,#dfe3e8);--mc-text:var(--p-text-color,#111827);--mc-muted:var(--p-text-muted-color,#667085);--mc-primary:var(--p-primary-color,#6366f1);--mc-primary-text:var(--p-primary-contrast-color,#fff);--mc-danger:var(--p-danger-color,#ef4444);--mc-success:var(--p-success-color,#22c55e);font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--mc-text)}*{box-sizing:border-box}.mcp{display:flex;flex-direction:column;gap:16px;font-size:13px}.intro,.picker-head{display:flex;align-items:center;gap:12px;padding-bottom:15px;border-bottom:1px solid var(--mc-border)}.intro>span:last-child,.picker-head>span:first-child{display:flex;min-width:0;flex:1;flex-direction:column;gap:3px}.intro strong,.picker-head strong{font-size:14px;line-height:1.3}.intro small,.picker-head small,.field small,.tool-copy small,.empty small{color:var(--mc-muted);font-size:11.5px;line-height:1.45}.brand-mark{position:relative;display:grid;width:38px;height:38px;flex:none;place-items:center;border:1px solid color-mix(in srgb,var(--mc-primary) 28%,var(--mc-border));border-radius:10px;background:color-mix(in srgb,var(--mc-primary) 10%,var(--mc-bg))}.brand-mark i{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--mc-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--mc-primary) 14%,transparent)}.brand-mark i:nth-child(1){transform:translate(-8px,5px)}.brand-mark i:nth-child(2){transform:translate(8px,5px)}.brand-mark i:nth-child(3){transform:translateY(-8px)}.brand-mark:after,.brand-mark:before{content:"";position:absolute;width:16px;height:1px;background:color-mix(in srgb,var(--mc-primary) 65%,transparent);transform-origin:left}.brand-mark:before{transform:translate(-7px,-3px) rotate(34deg)}.brand-mark:after{transform:translate(1px,6px) rotate(-34deg)}.section{display:flex;flex-direction:column;gap:12px}.section-title{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}.section-title b{order:-1;display:grid;width:19px;height:19px;place-items:center;border-radius:50%;background:var(--mc-surface-2);color:var(--mc-muted);font-size:10px}.field{display:flex;flex-direction:column;gap:6px}.field>span:first-child{display:flex;align-items:center;justify-content:space-between;font-weight:600}.field em{font-size:9px;font-style:normal;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--mc-muted)}input,select{width:100%;min-height:38px;padding:8px 10px;border:1px solid var(--mc-border);border-radius:7px;outline:none;background:var(--mc-bg);color:var(--mc-text);font:inherit;transition:border-color .15s,box-shadow .15s}input::placeholder{color:color-mix(in srgb,var(--mc-muted) 70%,transparent)}input:hover,select:hover{border-color:color-mix(in srgb,var(--mc-muted) 75%,var(--mc-border))}input:focus,select:focus{border-color:var(--mc-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--mc-primary) 15%,transparent)}code,kbd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.auth-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.auth-card{position:relative;display:flex;min-width:0;flex-direction:column;gap:3px;padding:10px 9px 10px 27px;text-align:left;border:1px solid var(--mc-border);border-radius:8px;background:var(--mc-bg);color:var(--mc-text);cursor:pointer}.auth-card:hover{background:var(--mc-surface)}.auth-card.active{border-color:var(--mc-primary);background:color-mix(in srgb,var(--mc-primary) 7%,var(--mc-bg));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--mc-primary) 30%,transparent)}.auth-card strong{overflow:hidden;text-overflow:ellipsis;font-size:11.5px;white-space:nowrap}.auth-card small{overflow:hidden;text-overflow:ellipsis;color:var(--mc-muted);font-size:9.5px;white-space:nowrap}.radio-dot{position:absolute;top:12px;left:9px;width:11px;height:11px;border:1px solid var(--mc-border);border-radius:50%}.active .radio-dot{border:3px solid var(--mc-primary);background:var(--mc-bg)}.header-pair{display:grid;grid-template-columns:2fr 3fr;gap:8px}.secret-wrap{position:relative;display:block}.secret-wrap input{padding-right:53px}.reveal{position:absolute;top:50%;right:5px;min-height:27px;padding:3px 7px;transform:translateY(-50%);border:0;border-radius:5px;background:var(--mc-surface-2);color:var(--mc-muted);font-size:10px;cursor:pointer}.security-note{display:flex;align-items:flex-start;gap:8px;margin:0;padding:9px 10px;border-radius:7px;background:var(--mc-surface);color:var(--mc-muted);font-size:10.5px;line-height:1.4}.security-note span{color:var(--mc-primary);font-size:8px}.advanced-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;padding:9px 0;border:0;border-top:1px solid var(--mc-border);border-bottom:1px solid var(--mc-border);background:transparent;color:var(--mc-muted);font:inherit;font-weight:600;cursor:pointer}.advanced{padding:3px 0}.feedback{display:flex;align-items:flex-start;gap:9px;padding:10px;border:1px solid;border-radius:8px}.feedback>span{display:grid;width:19px;height:19px;flex:none;place-items:center;border-radius:50%;color:#fff;font-weight:800}.feedback>div{display:flex;flex-direction:column;gap:2px}.feedback strong{font-size:11.5px}.feedback small{font-size:10.5px;line-height:1.4}.feedback.error{border-color:color-mix(in srgb,var(--mc-danger) 35%,var(--mc-border));background:color-mix(in srgb,var(--mc-danger) 7%,var(--mc-bg))}.feedback.error>span{background:var(--mc-danger)}.feedback.success{border-color:color-mix(in srgb,var(--mc-success) 35%,var(--mc-border));background:color-mix(in srgb,var(--mc-success) 7%,var(--mc-bg))}.feedback.success>span{background:var(--mc-success)}footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:2px}.footnote{color:var(--mc-muted);font-size:9.5px}.primary{display:inline-flex;min-height:38px;align-items:center;justify-content:center;gap:7px;padding:8px 14px;border:0;border-radius:7px;background:var(--mc-primary);color:var(--mc-primary-text);font:inherit;font-weight:650;cursor:pointer;box-shadow:0 1px 2px color-mix(in srgb,var(--mc-text) 15%,transparent)}.primary:hover{filter:brightness(1.04)}.primary:disabled{opacity:.65;cursor:wait}.spinner{width:12px;height:12px;border:2px solid color-mix(in srgb,var(--mc-primary-text) 40%,transparent);border-top-color:var(--mc-primary-text);border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.count{padding:3px 7px;border-radius:999px;background:color-mix(in srgb,var(--mc-primary) 11%,var(--mc-bg));color:var(--mc-primary);font-size:10px;font-weight:700}.connection-state{display:flex;align-items:center;gap:7px;margin-top:-7px;padding:8px 10px;border:1px solid var(--mc-border);border-radius:7px;background:var(--mc-surface)}.connection-state>span:nth-child(2){overflow:hidden;flex:1;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.connection-state small{color:var(--mc-muted);font-size:9.5px}.connection-state button,.catalog-actions button{padding:3px 6px;border:0;background:transparent;color:var(--mc-primary);font:inherit;font-size:10px;font-weight:650;cursor:pointer}.connection-state button:disabled,.catalog-actions button:disabled{opacity:.4}.live-dot{width:7px;height:7px;border-radius:50%;background:var(--mc-success);box-shadow:0 0 0 3px color-mix(in srgb,var(--mc-success) 14%,transparent)}.catalog{overflow:hidden;border:1px solid var(--mc-border);border-radius:9px}.catalog-head{display:flex;align-items:center;justify-content:space-between;padding:10px 11px;border-bottom:1px solid var(--mc-border);background:var(--mc-surface)}.catalog-head>span:first-child{display:flex;align-items:baseline;gap:6px}.catalog-head strong{font-size:11.5px}.catalog-head small{color:var(--mc-muted);font-size:9.5px}.catalog-actions{display:flex;gap:2px}.search{display:flex;align-items:center;gap:7px;margin:9px;padding:0 9px;border:1px solid var(--mc-border);border-radius:7px}.search:focus-within{border-color:var(--mc-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--mc-primary) 12%,transparent)}.search>span{color:var(--mc-muted);font-size:16px}.search input{min-height:34px;padding:6px 0;border:0;box-shadow:none}.search kbd{padding:2px 5px;border-radius:4px;background:var(--mc-surface-2);color:var(--mc-muted);font-size:9px}.tool-list{max-height:290px;overflow:auto;padding:0 5px 6px}.tool-row{display:flex;align-items:flex-start;gap:9px;padding:9px 7px;border-radius:7px;cursor:pointer}.tool-row:hover{background:var(--mc-surface)}.tool-row.selected{background:color-mix(in srgb,var(--mc-primary) 5%,var(--mc-bg))}.tool-row>input{position:absolute;width:1px;height:1px;opacity:0}.checkmark{display:grid;width:16px;height:16px;flex:none;place-items:center;margin-top:1px;border:1px solid var(--mc-border);border-radius:4px;color:transparent;font-size:10px;font-weight:800}.selected .checkmark{border-color:var(--mc-primary);background:var(--mc-primary);color:var(--mc-primary-text)}.tool-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:2px}.tool-copy strong{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px}.tool-copy small{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2}.empty{display:flex;flex-direction:column;align-items:center;gap:3px;padding:24px 12px;text-align:center;color:var(--mc-muted);font-size:11px}.connection-empty{border:1px dashed var(--mc-border);border-radius:9px}.loading-list{display:flex;flex-direction:column;gap:8px;padding:8px}.loading-list span{height:43px;border-radius:6px;background:linear-gradient(90deg,var(--mc-surface) 25%,var(--mc-surface-2) 45%,var(--mc-surface) 65%);background-size:300% 100%;animation:shimmer 1.3s infinite}@keyframes shimmer{to{background-position:-150% 0}}@media(max-width:520px){.auth-grid{grid-template-columns:1fr}.auth-card small{white-space:normal}.header-pair{grid-template-columns:1fr}.connection-state small,.footnote{display:none}footer{justify-content:flex-end}}@media(prefers-reduced-motion:reduce){.spinner,.loading-list span{animation:none}}@media(prefers-color-scheme:dark){:host{--mc-primary-text:#fff}}.connect{gap:14px}.connect .section{gap:12px}.connect .section+.section{padding-top:2px}.connect .section-title{display:block;color:var(--mc-text);font-size:12.5px;font-weight:600;letter-spacing:0;text-transform:none}.connect .field{gap:5px}.connect .field>span:first-child{font-size:12.5px}.connect .field em{color:var(--mc-muted);font-size:11.5px;font-weight:400;letter-spacing:0;text-transform:none}.connect input,.connect select{height:36px;min-height:36px;padding:0 10px;border-radius:8px}.connect .footnote{margin:-2px 0 0;color:var(--mc-muted);font-size:11.5px;line-height:1.4}.connect .primary{width:100%;min-height:38px;border-radius:8px;font-weight:600;box-shadow:none}@media(max-width:520px){.connect .footnote{display:block}}', vn = { props: { type: "object", properties: { "provider-id": { type: "string", default: "", description: "MCP provider identifier whose connection form and tool catalog should be displayed." }, "component-id": { type: "string", default: "", description: "Existing connection component identifier; leave empty while creating a connection." }, config: { type: "object", default: {}, description: "Current MCP endpoint and authentication configuration supplied by the host." } } } }, En = {
  wippy: vn
};
export {
  kn as W,
  Sn as a,
  In as c,
  En as p,
  Cn as u
};
//# sourceMappingURL=package-BizXH5l7.js.map
