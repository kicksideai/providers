import { defineComponent as Ft, ref as C, shallowRef as kt, onMounted as Nt, watch as Dt, onUnmounted as Mt, h as Z, nextTick as $t, hasInjectionContext as Ut, inject as G, effectScope as Ht, markRaw as Bt, createApp as zt } from "vue";
import { config as tt, addIcons as Wt, on as qt, applyThemeMode as L, host as Kt, hostCss as Qt, loadCss as Gt } from "@wippy-fe/proxy";
const mt = /^[a-z0-9]+(-[a-z0-9]+)*$/, D = (t, e, n, i = "") => {
  const s = t.split(":");
  if (t.slice(0, 1) === "@") {
    if (s.length < 2 || s.length > 3) return null;
    i = s.shift().slice(1);
  }
  if (s.length > 3 || !s.length) return null;
  if (s.length > 1) {
    const l = s.pop(), a = s.pop(), c = {
      provider: s.length > 0 ? s[0] : i,
      prefix: a,
      name: l
    };
    return e && !j(c) ? null : c;
  }
  const o = s[0], r = o.split("-");
  if (r.length > 1) {
    const l = {
      provider: i,
      prefix: r.shift(),
      name: r.join("-")
    };
    return e && !j(l) ? null : l;
  }
  if (n && i === "") {
    const l = {
      provider: i,
      prefix: "",
      name: o
    };
    return e && !j(l, n) ? null : l;
  }
  return null;
}, j = (t, e) => t ? !!((e && t.prefix === "" || t.prefix) && t.name) : !1;
function Yt(t, e) {
  const n = t.icons, i = t.aliases || /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  function o(r) {
    if (n[r]) return s[r] = [];
    if (!(r in s)) {
      s[r] = null;
      const l = i[r] && i[r].parent, a = l && o(l);
      a && (s[r] = [l].concat(a));
    }
    return s[r];
  }
  return Object.keys(n).concat(Object.keys(i)).forEach(o), s;
}
const bt = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), N = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), M = Object.freeze({
  ...bt,
  ...N
}), z = Object.freeze({
  ...M,
  body: "",
  hidden: !1
});
function Jt(t, e) {
  const n = {};
  !t.hFlip != !e.hFlip && (n.hFlip = !0), !t.vFlip != !e.vFlip && (n.vFlip = !0);
  const i = ((t.rotate || 0) + (e.rotate || 0)) % 4;
  return i && (n.rotate = i), n;
}
function et(t, e) {
  const n = Jt(t, e);
  for (const i in z) i in N ? i in t && !(i in n) && (n[i] = N[i]) : i in e ? n[i] = e[i] : i in t && (n[i] = t[i]);
  return n;
}
function Xt(t, e, n) {
  const i = t.icons, s = t.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function r(l) {
    o = et(i[l] || s[l], o);
  }
  return r(e), n.forEach(r), et(t, o);
}
function yt(t, e) {
  const n = [];
  if (typeof t != "object" || typeof t.icons != "object") return n;
  t.not_found instanceof Array && t.not_found.forEach((s) => {
    e(s, null), n.push(s);
  });
  const i = Yt(t);
  for (const s in i) {
    const o = i[s];
    o && (e(s, Xt(t, s, o)), n.push(s));
  }
  return n;
}
const Zt = {
  provider: "",
  aliases: {},
  not_found: {},
  ...bt
};
function U(t, e) {
  for (const n in e) if (n in t && typeof t[n] != typeof e[n]) return !1;
  return !0;
}
function vt(t) {
  if (typeof t != "object" || t === null) return null;
  const e = t;
  if (typeof e.prefix != "string" || !t.icons || typeof t.icons != "object" || !U(t, Zt)) return null;
  const n = e.icons;
  for (const s in n) {
    const o = n[s];
    if (!s || typeof o.body != "string" || !U(o, z)) return null;
  }
  const i = e.aliases || /* @__PURE__ */ Object.create(null);
  for (const s in i) {
    const o = i[s], r = o.parent;
    if (!s || typeof r != "string" || !n[r] && !i[r] || !U(o, z)) return null;
  }
  return e;
}
const nt = /* @__PURE__ */ Object.create(null);
function te(t, e) {
  return {
    provider: t,
    prefix: e,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function P(t, e) {
  const n = nt[t] || (nt[t] = /* @__PURE__ */ Object.create(null));
  return n[e] || (n[e] = te(t, e));
}
function _t(t, e) {
  return vt(e) ? yt(e, (n, i) => {
    i ? t.icons[n] = i : t.missing.add(n);
  }) : [];
}
function ee(t, e, n) {
  try {
    if (typeof n.body == "string")
      return t.icons[e] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let V = !1;
function wt(t) {
  return typeof t == "boolean" && (V = t), V;
}
function ne(t) {
  const e = typeof t == "string" ? D(t, !0, V) : t;
  if (e) {
    const n = P(e.provider, e.prefix), i = e.name;
    return n.icons[i] || (n.missing.has(i) ? null : void 0);
  }
}
function se(t, e) {
  const n = D(t, !0, V);
  if (!n) return !1;
  const i = P(n.provider, n.prefix);
  return e ? ee(i, n.name, e) : (i.missing.add(n.name), !0);
}
function Ct(t, e) {
  if (typeof t != "object") return !1;
  if (typeof e != "string" && (e = t.provider || ""), V && !e && !t.prefix) {
    let s = !1;
    return vt(t) && (t.prefix = "", yt(t, (o, r) => {
      se(o, r) && (s = !0);
    })), s;
  }
  const n = t.prefix;
  if (!j({
    prefix: n,
    name: "a"
  })) return !1;
  const i = P(e, n);
  return !!_t(i, t);
}
const St = Object.freeze({
  width: null,
  height: null
}), It = Object.freeze({
  ...St,
  ...N
}), ie = /(-?[0-9.]*[0-9]+[0-9.]*)/g, oe = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function st(t, e, n) {
  if (e === 1) return t;
  if (n = n || 100, typeof t == "number") return Math.ceil(t * e * n) / n;
  if (typeof t != "string") return t;
  const i = t.split(ie);
  if (i === null || !i.length) return t;
  const s = [];
  let o = i.shift(), r = oe.test(o);
  for (; ; ) {
    if (r) {
      const l = parseFloat(o);
      isNaN(l) ? s.push(o) : s.push(Math.ceil(l * e * n) / n);
    } else s.push(o);
    if (o = i.shift(), o === void 0) return s.join("");
    r = !r;
  }
}
function re(t, e = "defs") {
  let n = "";
  const i = t.indexOf("<" + e);
  for (; i >= 0; ) {
    const s = t.indexOf(">", i), o = t.indexOf("</" + e);
    if (s === -1 || o === -1) break;
    const r = t.indexOf(">", o);
    if (r === -1) break;
    n += t.slice(s + 1, o).trim(), t = t.slice(0, i).trim() + t.slice(r + 1);
  }
  return {
    defs: n,
    content: t
  };
}
function ce(t, e) {
  return t ? "<defs>" + t + "</defs>" + e : e;
}
function le(t, e, n) {
  const i = re(t);
  return ce(i.defs, e + i.content + n);
}
const ae = (t) => t === "unset" || t === "undefined" || t === "none";
function ue(t, e) {
  const n = {
    ...M,
    ...t
  }, i = {
    ...It,
    ...e
  }, s = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let o = n.body;
  [n, i].forEach((b) => {
    const h = [], x = b.hFlip, S = b.vFlip;
    let w = b.rotate;
    x ? S ? w += 2 : (h.push("translate(" + (s.width + s.left).toString() + " " + (0 - s.top).toString() + ")"), h.push("scale(-1 1)"), s.top = s.left = 0) : S && (h.push("translate(" + (0 - s.left).toString() + " " + (s.height + s.top).toString() + ")"), h.push("scale(1 -1)"), s.top = s.left = 0);
    let v;
    switch (w < 0 && (w -= Math.floor(w / 4) * 4), w = w % 4, w) {
      case 1:
        v = s.height / 2 + s.top, h.unshift("rotate(90 " + v.toString() + " " + v.toString() + ")");
        break;
      case 2:
        h.unshift("rotate(180 " + (s.width / 2 + s.left).toString() + " " + (s.height / 2 + s.top).toString() + ")");
        break;
      case 3:
        v = s.width / 2 + s.left, h.unshift("rotate(-90 " + v.toString() + " " + v.toString() + ")");
    }
    w % 2 === 1 && (s.left !== s.top && (v = s.left, s.left = s.top, s.top = v), s.width !== s.height && (v = s.width, s.width = s.height, s.height = v)), h.length && (o = le(o, '<g transform="' + h.join(" ") + '">', "</g>"));
  });
  const r = i.width, l = i.height, a = s.width, c = s.height;
  let u, f;
  r === null ? (f = l === null ? "1em" : l === "auto" ? c : l, u = st(f, a / c)) : (u = r === "auto" ? a : r, f = l === null ? st(u, c / a) : l === "auto" ? c : l);
  const p = {}, m = (b, h) => {
    ae(h) || (p[b] = h.toString());
  };
  m("width", u), m("height", f);
  const y = [
    s.left,
    s.top,
    a,
    c
  ];
  return p.viewBox = y.join(" "), {
    attributes: p,
    viewBox: y,
    body: o
  };
}
const fe = /\sid="(\S+)"/g, it = /* @__PURE__ */ new Map();
function he(t) {
  t = t.replace(/[0-9]+$/, "") || "a";
  const e = it.get(t) || 0;
  return it.set(t, e + 1), e ? `${t}${e}` : t;
}
function pe(t) {
  const e = [];
  let n;
  for (; n = fe.exec(t); ) e.push(n[1]);
  if (!e.length) return t;
  const i = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return e.forEach((s) => {
    const o = he(s), r = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp('([#;"])(' + r + ')([")]|\\.[a-z])', "g"), "$1" + o + i + "$3");
  }), t = t.replace(new RegExp(i, "g"), ""), t;
}
const W = /* @__PURE__ */ Object.create(null);
function de(t, e) {
  W[t] = e;
}
function q(t) {
  return W[t] || W[""];
}
function Y(t) {
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
const J = /* @__PURE__ */ Object.create(null), O = ["https://api.simplesvg.com", "https://api.unisvg.com"], F = [];
for (; O.length > 0; ) O.length === 1 || Math.random() > 0.5 ? F.push(O.shift()) : F.push(O.pop());
J[""] = Y({ resources: ["https://api.iconify.design"].concat(F) });
function ge(t, e) {
  const n = Y(e);
  return n === null ? !1 : (J[t] = n, !0);
}
function X(t) {
  return J[t];
}
const me = () => {
  let t;
  try {
    if (t = fetch, typeof t == "function") return t;
  } catch {
  }
};
let ot = me();
function be(t, e) {
  const n = X(t);
  if (!n) return 0;
  let i;
  if (!n.maxURL) i = 0;
  else {
    let s = 0;
    n.resources.forEach((r) => {
      s = Math.max(s, r.length);
    });
    const o = e + ".json?icons=";
    i = n.maxURL - s - n.path.length - o.length;
  }
  return i;
}
function ye(t) {
  return t === 404;
}
const ve = (t, e, n) => {
  const i = [], s = be(t, e), o = "icons";
  let r = {
    type: o,
    provider: t,
    prefix: e,
    icons: []
  }, l = 0;
  return n.forEach((a, c) => {
    l += a.length + 1, l >= s && c > 0 && (i.push(r), r = {
      type: o,
      provider: t,
      prefix: e,
      icons: []
    }, l = a.length), r.icons.push(a);
  }), i.push(r), i;
};
function _e(t) {
  if (typeof t == "string") {
    const e = X(t);
    if (e) return e.path;
  }
  return "/";
}
const we = (t, e, n) => {
  if (!ot) {
    n("abort", 424);
    return;
  }
  let i = _e(e.provider);
  switch (e.type) {
    case "icons": {
      const o = e.prefix, r = e.icons.join(","), l = new URLSearchParams({ icons: r });
      i += o + ".json?" + l.toString();
      break;
    }
    case "custom": {
      const o = e.uri;
      i += o.slice(0, 1) === "/" ? o.slice(1) : o;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let s = 503;
  ot(t + i).then((o) => {
    const r = o.status;
    if (r !== 200) {
      setTimeout(() => {
        n(ye(r) ? "abort" : "next", r);
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
}, Ce = {
  prepare: ve,
  send: we
};
function xt(t, e) {
  t.forEach((n) => {
    const i = n.loaderCallbacks;
    i && (n.loaderCallbacks = i.filter((s) => s.id !== e));
  });
}
function Se(t) {
  t.pendingCallbacksFlag || (t.pendingCallbacksFlag = !0, setTimeout(() => {
    t.pendingCallbacksFlag = !1;
    const e = t.loaderCallbacks ? t.loaderCallbacks.slice(0) : [];
    if (!e.length) return;
    let n = !1;
    const i = t.provider, s = t.prefix;
    e.forEach((o) => {
      const r = o.icons, l = r.pending.length;
      r.pending = r.pending.filter((a) => {
        if (a.prefix !== s) return !0;
        const c = a.name;
        if (t.icons[c]) r.loaded.push({
          provider: i,
          prefix: s,
          name: c
        });
        else if (t.missing.has(c)) r.missing.push({
          provider: i,
          prefix: s,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), r.pending.length !== l && (n || xt([t], o.id), o.callback(r.loaded.slice(0), r.missing.slice(0), r.pending.slice(0), o.abort));
    });
  }));
}
let Ie = 0;
function xe(t, e, n) {
  const i = Ie++, s = xt.bind(null, n, i);
  if (!e.pending.length) return s;
  const o = {
    id: i,
    icons: e,
    callback: t,
    abort: s
  };
  return n.forEach((r) => {
    (r.loaderCallbacks || (r.loaderCallbacks = [])).push(o);
  }), s;
}
function Ee(t) {
  const e = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  t.sort((s, o) => s.provider !== o.provider ? s.provider.localeCompare(o.provider) : s.prefix !== o.prefix ? s.prefix.localeCompare(o.prefix) : s.name.localeCompare(o.name));
  let i = {
    provider: "",
    prefix: "",
    name: ""
  };
  return t.forEach((s) => {
    if (i.name === s.name && i.prefix === s.prefix && i.provider === s.provider) return;
    i = s;
    const o = s.provider, r = s.prefix, l = s.name, a = n[o] || (n[o] = /* @__PURE__ */ Object.create(null)), c = a[r] || (a[r] = P(o, r));
    let u;
    l in c.icons ? u = e.loaded : r === "" || c.missing.has(l) ? u = e.missing : u = e.pending;
    const f = {
      provider: o,
      prefix: r,
      name: l
    };
    u.push(f);
  }), e;
}
function Pe(t, e = !0, n = !1) {
  const i = [];
  return t.forEach((s) => {
    const o = typeof s == "string" ? D(s, e, n) : s;
    o && i.push(o);
  }), i;
}
const Te = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function Oe(t, e, n, i) {
  const s = t.resources.length, o = t.random ? Math.floor(Math.random() * s) : t.index;
  let r;
  if (t.random) {
    let d = t.resources.slice(0);
    for (r = []; d.length > 1; ) {
      const _ = Math.floor(Math.random() * d.length);
      r.push(d[_]), d = d.slice(0, _).concat(d.slice(_ + 1));
    }
    r = r.concat(d);
  } else r = t.resources.slice(o).concat(t.resources.slice(0, o));
  const l = Date.now();
  let a = "pending", c = 0, u, f = null, p = [], m = [];
  typeof i == "function" && m.push(i);
  function y() {
    f && (clearTimeout(f), f = null);
  }
  function b() {
    a === "pending" && (a = "aborted"), y(), p.forEach((d) => {
      d.status === "pending" && (d.status = "aborted");
    }), p = [];
  }
  function h(d, _) {
    _ && (m = []), typeof d == "function" && m.push(d);
  }
  function x() {
    return {
      startTime: l,
      payload: e,
      status: a,
      queriesSent: c,
      queriesPending: p.length,
      subscribe: h,
      abort: b
    };
  }
  function S() {
    a = "failed", m.forEach((d) => {
      d(void 0, u);
    });
  }
  function w() {
    p.forEach((d) => {
      d.status === "pending" && (d.status = "aborted");
    }), p = [];
  }
  function v(d, _, T) {
    const A = _ !== "success";
    switch (p = p.filter((I) => I !== d), a) {
      case "pending":
        break;
      case "failed":
        if (A || !t.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (_ === "abort") {
      u = T, S();
      return;
    }
    if (A) {
      u = T, p.length || (r.length ? $() : S());
      return;
    }
    if (y(), w(), !t.random) {
      const I = t.resources.indexOf(d.resource);
      I !== -1 && I !== t.index && (t.index = I);
    }
    a = "completed", m.forEach((I) => {
      I(T);
    });
  }
  function $() {
    if (a !== "pending") return;
    y();
    const d = r.shift();
    if (d === void 0) {
      if (p.length) {
        f = setTimeout(() => {
          y(), a === "pending" && (w(), S());
        }, t.timeout);
        return;
      }
      S();
      return;
    }
    const _ = {
      status: "pending",
      resource: d,
      callback: (T, A) => {
        v(_, T, A);
      }
    };
    p.push(_), c++, f = setTimeout($, t.rotate), n(d, e, _.callback);
  }
  return setTimeout($), x;
}
function Et(t) {
  const e = {
    ...Te,
    ...t
  };
  let n = [];
  function i() {
    n = n.filter((r) => r().status === "pending");
  }
  function s(r, l, a) {
    const c = Oe(e, r, l, (u, f) => {
      i(), a && a(u, f);
    });
    return n.push(c), c;
  }
  function o(r) {
    return n.find((l) => r(l)) || null;
  }
  return {
    query: s,
    find: o,
    setIndex: (r) => {
      e.index = r;
    },
    getIndex: () => e.index,
    cleanup: i
  };
}
function rt() {
}
const H = /* @__PURE__ */ Object.create(null);
function Re(t) {
  if (!H[t]) {
    const e = X(t);
    if (!e) return;
    const n = {
      config: e,
      redundancy: Et(e)
    };
    H[t] = n;
  }
  return H[t];
}
function Ve(t, e, n) {
  let i, s;
  if (typeof t == "string") {
    const o = q(t);
    if (!o)
      return n(void 0, 424), rt;
    s = o.send;
    const r = Re(t);
    r && (i = r.redundancy);
  } else {
    const o = Y(t);
    if (o) {
      i = Et(o);
      const r = t.resources ? t.resources[0] : "", l = q(r);
      l && (s = l.send);
    }
  }
  return !i || !s ? (n(void 0, 424), rt) : i.query(e, s, n)().abort;
}
function ct() {
}
function Ae(t) {
  t.iconsLoaderFlag || (t.iconsLoaderFlag = !0, setTimeout(() => {
    t.iconsLoaderFlag = !1, Se(t);
  }));
}
function Le(t) {
  const e = [], n = [];
  return t.forEach((i) => {
    (i.match(mt) ? e : n).push(i);
  }), {
    valid: e,
    invalid: n
  };
}
function R(t, e, n) {
  function i() {
    const s = t.pendingIcons;
    e.forEach((o) => {
      s && s.delete(o), t.icons[o] || t.missing.add(o);
    });
  }
  if (n && typeof n == "object") try {
    if (!_t(t, n).length) {
      i();
      return;
    }
  } catch (s) {
    console.error(s);
  }
  i(), Ae(t);
}
function lt(t, e) {
  t instanceof Promise ? t.then((n) => {
    e(n);
  }).catch(() => {
    e(null);
  }) : e(t);
}
function je(t, e) {
  t.iconsToLoad ? t.iconsToLoad = t.iconsToLoad.concat(e).sort() : t.iconsToLoad = e, t.iconsQueueFlag || (t.iconsQueueFlag = !0, setTimeout(() => {
    t.iconsQueueFlag = !1;
    const { provider: n, prefix: i } = t, s = t.iconsToLoad;
    if (delete t.iconsToLoad, !s || !s.length) return;
    const o = t.loadIcon;
    if (t.loadIcons && (s.length > 1 || !o)) {
      lt(t.loadIcons(s, i, n), (c) => {
        R(t, s, c);
      });
      return;
    }
    if (o) {
      s.forEach((c) => {
        lt(o(c, i, n), (u) => {
          R(t, [c], u ? {
            prefix: i,
            icons: { [c]: u }
          } : null);
        });
      });
      return;
    }
    const { valid: r, invalid: l } = Le(s);
    if (l.length && R(t, l, null), !r.length) return;
    const a = i.match(mt) ? q(n) : null;
    if (!a) {
      R(t, r, null);
      return;
    }
    a.prepare(n, i, r).forEach((c) => {
      Ve(n, c, (u) => {
        R(t, c.icons, u);
      });
    });
  }));
}
const Fe = (t, e) => {
  const n = Pe(t, !0, wt()), i = Ee(n);
  if (!i.pending.length) {
    let a = !0;
    return e && setTimeout(() => {
      a && e(i.loaded, i.missing, i.pending, ct);
    }), () => {
      a = !1;
    };
  }
  const s = /* @__PURE__ */ Object.create(null), o = [];
  let r, l;
  return i.pending.forEach((a) => {
    const { provider: c, prefix: u } = a;
    if (u === l && c === r) return;
    r = c, l = u, o.push(P(c, u));
    const f = s[c] || (s[c] = /* @__PURE__ */ Object.create(null));
    f[u] || (f[u] = []);
  }), i.pending.forEach((a) => {
    const { provider: c, prefix: u, name: f } = a, p = P(c, u), m = p.pendingIcons || (p.pendingIcons = /* @__PURE__ */ new Set());
    m.has(f) || (m.add(f), s[c][u].push(f));
  }), o.forEach((a) => {
    const c = s[a.provider][a.prefix];
    c.length && je(a, c);
  }), e ? xe(e, i, o) : ct;
};
function ke(t, e) {
  const n = { ...t };
  for (const i in e) {
    const s = e[i], o = typeof s;
    i in St ? (s === null || s && (o === "string" || o === "number")) && (n[i] = s) : o === typeof n[i] && (n[i] = i === "rotate" ? s % 4 : s);
  }
  return n;
}
const Ne = /[\s,]+/;
function De(t, e) {
  e.split(Ne).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        t.hFlip = !0;
        break;
      case "vertical":
        t.vFlip = !0;
    }
  });
}
function Me(t, e = 0) {
  const n = t.replace(/^-?[0-9.]*/, "");
  function i(s) {
    for (; s < 0; ) s += 4;
    return s % 4;
  }
  if (n === "") {
    const s = parseInt(t);
    return isNaN(s) ? 0 : i(s);
  } else if (n !== t) {
    let s = 0;
    switch (n) {
      case "%":
        s = 25;
        break;
      case "deg":
        s = 90;
    }
    if (s) {
      let o = parseFloat(t.slice(0, t.length - n.length));
      return isNaN(o) ? 0 : (o = o / s, o % 1 === 0 ? i(o) : 0);
    }
  }
  return e;
}
function $e(t, e) {
  let n = t.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const i in e) n += " " + i + '="' + e[i] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + t + "</svg>";
}
function Ue(t) {
  return t.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function He(t) {
  return "data:image/svg+xml," + Ue(t);
}
function Be(t) {
  return 'url("' + He(t) + '")';
}
const at = {
  ...It,
  inline: !1
}, ze = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, We = {
  display: "inline-block"
}, K = {
  backgroundColor: "currentColor"
}, Pt = {
  backgroundColor: "transparent"
}, ut = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, ft = {
  webkitMask: K,
  mask: K,
  background: Pt
};
for (const t in ft) {
  const e = ft[t];
  for (const n in ut)
    e[t + n] = ut[n];
}
const k = {};
["horizontal", "vertical"].forEach((t) => {
  const e = t.slice(0, 1) + "Flip";
  k[t + "-flip"] = e, k[t.slice(0, 1) + "-flip"] = e, k[t + "Flip"] = e;
});
function ht(t) {
  return t + (t.match(/^[-0-9.]+$/) ? "px" : "");
}
const pt = (t, e) => {
  const n = ke(at, e), i = { ...ze }, s = e.mode || "svg", o = {}, r = e.style, l = typeof r == "object" && !(r instanceof Array) ? r : {};
  for (let b in e) {
    const h = e[b];
    if (h !== void 0)
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
          n[b] = h === !0 || h === "true" || h === 1;
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
          typeof h == "string" ? n[b] = Me(h) : typeof h == "number" && (n[b] = h);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          h !== !0 && h !== "true" && delete i["aria-hidden"];
          break;
        default: {
          const x = k[b];
          x ? (h === !0 || h === "true" || h === 1) && (n[x] = !0) : at[b] === void 0 && (i[b] = h);
        }
      }
  }
  typeof e.flip == "string" && De(n, e.flip);
  const a = ue(t, n), c = a.attributes;
  if (n.inline && (o.verticalAlign = "-0.125em"), s === "svg")
    return i.style = {
      ...o,
      ...l
    }, Object.assign(i, c), i.innerHTML = pe(a.body), Z("svg", i);
  const { body: u, width: f, height: p } = t, m = s === "mask" || (s === "bg" ? !1 : u.indexOf("currentColor") !== -1), y = $e(u, {
    ...c,
    width: f + "",
    height: p + ""
  });
  return i.style = {
    ...o,
    "--svg": Be(y),
    width: ht(c.width),
    height: ht(c.height),
    ...We,
    ...m ? K : Pt,
    ...l
  }, Z("span", i);
};
wt(!0);
de("", Ce);
if (typeof document < "u" && typeof window < "u") {
  const t = window;
  if (t.IconifyPreload !== void 0) {
    const e = t.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof e == "object" && e !== null && (e instanceof Array ? e : [e]).forEach((i) => {
      try {
        // Check if item is an object and not null/array
        (typeof i != "object" || i === null || i instanceof Array || // Check for 'icons' and 'prefix'
        typeof i.icons != "object" || typeof i.prefix != "string" || // Add icon set
        !Ct(i)) && console.error(n);
      } catch {
        console.error(n);
      }
    });
  }
  if (t.IconifyProviders !== void 0) {
    const e = t.IconifyProviders;
    if (typeof e == "object" && e !== null)
      for (let n in e) {
        const i = "IconifyProviders[" + n + "] is invalid.";
        try {
          const s = e[n];
          if (typeof s != "object" || !s || s.resources === void 0)
            continue;
          ge(n, s) || console.error(i);
        } catch {
          console.error(i);
        }
      }
  }
}
const qe = {
  ...M,
  body: ""
}, Cn = Ft((t, { emit: e }) => {
  const n = C(null);
  function i() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const s = C(!!t.ssr), o = C(""), r = kt(null);
  function l() {
    const c = t.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return o.value = "", {
        data: c
      };
    let u;
    if (typeof c != "string" || (u = D(c, !1, !0)) === null)
      return null;
    let f = ne(u);
    if (!f) {
      const y = n.value;
      return (!y || y.name !== c) && (f === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: Fe([u], a)
      }), null;
    }
    i(), o.value !== c && (o.value = c, $t(() => {
      e("load", c);
    }));
    const p = t.customise;
    if (p) {
      f = Object.assign({}, f);
      const y = p(f.body, u.name, u.prefix, u.provider);
      typeof y == "string" && (f.body = y);
    }
    const m = ["iconify"];
    return u.prefix !== "" && m.push("iconify--" + u.prefix), u.provider !== "" && m.push("iconify--" + u.provider), { data: f, classes: m };
  }
  function a() {
    const c = l();
    c ? c.data !== r.value?.data && (r.value = c) : r.value = null;
  }
  return s.value ? a() : Nt(() => {
    s.value = !0, a();
  }), Dt(() => t.icon, a), Mt(i), () => {
    const c = r.value;
    if (!c)
      return pt(qe, t);
    let u = t;
    return c.classes && (u = {
      ...t,
      class: c.classes.join(" ")
    }), pt({
      ...M,
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
var Q = "data-wippy-visible";
function dt(t) {
  const e = t.getAttribute(Q);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var Ke = Object.defineProperty, Qe = (t, e, n) => e in t ? Ke(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, g = (t, e, n) => Qe(t, typeof e != "symbol" ? e + "" : e, n), Ge = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ye = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function gt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function Je(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [i, s] of Object.entries(n)) {
        if ((i === "@light" || i === "@dark") && s && typeof s == "object") {
          for (const [r, l] of Object.entries(s)) {
            const a = typeof l == "string" ? gt(r) : null;
            a && e.add(a);
          }
          continue;
        }
        const o = typeof s == "string" ? gt(i) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function Xe(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Ye} {
${e}
}`;
}
function Ze(t, e) {
  const n = Xe(e);
  n && Tt(t, n, "@wippy-fe/css-variables-bridge");
}
function tn(t, e) {
  const i = (e ?? Ge).map(async (s) => {
    const o = Qt[s];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${s}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Gt(o);
    } catch (r) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${s}" (${o}):`, r), null;
    }
  });
  return Promise.all(i).then((s) => {
    for (const o of s) {
      if (!o)
        continue;
      const r = document.createElement("style");
      r.textContent = o, r.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(r);
    }
  });
}
function en(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Tt(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const s = new CSSStyleSheet();
    s.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, s];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", n), i.textContent = e, t.appendChild(i);
}
function nn(t, e) {
  Tt(t, e, "@wippy-fe/custom-css");
}
function Ot(t) {
  return t.__wippyHost ?? null;
}
function sn(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function on(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const i = Number.parseFloat(e);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(e, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(e);
        return n.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function B(t, e) {
  const n = {}, i = [];
  for (const [s, o] of Object.entries(e.properties)) {
    const r = t.getAttribute(s), l = sn(s);
    if (r === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const a = on(s, r, o);
    a.error ? i.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: i };
}
var rn = class {
  constructor(t, e) {
    g(this, "_props"), g(this, "_errors"), g(this, "_content"), g(this, "_hostVisibility"), g(this, "_propsListeners", /* @__PURE__ */ new Set()), g(this, "_contentListeners", /* @__PURE__ */ new Set()), g(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), g(this, "_disposed", !1), g(this, "_emitToDom"), g(this, "props"), g(this, "events"), g(this, "content"), g(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
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
    }, this.content = t.hasContent ? {
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
}, cn = class extends HTMLElement {
  constructor() {
    super(), g(this, "_internals"), g(this, "_contentObserver", null), g(this, "_initialized", !1), g(this, "_container", null), g(this, "_reactive", null), g(this, "_lastProps", null), g(this, "_lastErrors", []), g(this, "_lastContent", null), g(this, "_themeUnsub", null), g(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = dt(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...n, Q])];
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
    return Ot(this);
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
      let n, i;
      if (this._lastProps !== null)
        n = this._lastProps, i = this._lastErrors;
      else {
        const o = B(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), n = o.props, i = o.errors, this._lastProps = n, this._lastErrors = i;
      }
      const s = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = s), this._reactive = new rn(
        { props: n, errors: i, content: s, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(n), t.inlineCss && en(n, t.inlineCss);
        try {
          const c = tt?.theming, u = Je(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Ze(n, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const c = tt?.theming, u = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            u && nn(n, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && tn(n, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const a = t.containerClasses ?? [];
        a.length > 0 && i.classList.add(...a), n.appendChild(i), this._container = i, Wt(Ct);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = qt("@theme", (a) => this._applyTheme(a)));
      const { props: s, errors: o } = B(this, t.propsSchema);
      t.validateProps && o.push(...t.validateProps(s));
      const r = s;
      this._lastProps = r, this._lastErrors = o;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(t.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, i, r, o, l, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(t = Kt.getThemeMode?.()) {
    L(t, this), this._container && L(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), L("auto", this), this._container && L("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === Q) {
      const l = this._hostVisible, a = dt(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const i = this.constructor.wippyConfig, { props: s, errors: o } = B(this, i.propsSchema);
    i.validateProps && o.push(...i.validateProps(s));
    const r = s;
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
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function ln(t) {
  return t.__wippyHostBus ?? null;
}
function an(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Rt;
const Vt = (t) => Rt = t, un = () => Ut() && G(At) || Rt, At = (
  /* istanbul ignore next */
  Symbol()
);
function fn() {
  const t = Ht(!0), e = t.run(() => C({}));
  let n = [], i = [];
  const s = Bt({
    install(o) {
      Vt(s), s._a = o, o.provide(At, s), o.config.globalProperties.$pinia = s, i.forEach((r) => n.push(r)), i = [];
    },
    use(o) {
      return this._a ? n.push(o) : i.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return s;
}
var hn = Object.defineProperty, pn = (t, e, n) => e in t ? hn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, E = (t, e, n) => pn(t, typeof e != "symbol" ? e + "" : e, n), Lt = /* @__PURE__ */ Symbol("wippy:emit"), jt = /* @__PURE__ */ Symbol("wippy:props"), dn = /* @__PURE__ */ Symbol("wippy:props_error"), gn = /* @__PURE__ */ Symbol("wippy:content"), mn = /* @__PURE__ */ Symbol("wippy:panel-id"), bn = /* @__PURE__ */ Symbol("wippy:layout-bus"), yn = /* @__PURE__ */ Symbol("wippy:host"), vn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Sn() {
  const t = G(jt);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function In() {
  const t = G(Lt);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var xn = class extends cn {
  constructor() {
    super(...arguments), E(this, "_vueApp", null), E(this, "_propsRef", C({})), E(this, "_errorsRef", C([])), E(this, "_contentRef", C(null)), E(this, "_hostVisibilityRef", C(null)), E(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, i, s, o) {
    const r = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = i, this._contentRef.value = s ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of i)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, u) => {
      this._propsRef.value = c, this._errorsRef.value = [...u];
      for (const f of u)
        this.emitEvent("invalid", { message: f });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const a = (c) => {
      if (l.signal.aborted)
        return;
      const u = un(), f = zt(c.rootComponent);
      this._vueApp = f;
      const p = fn();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          p.use(m);
      if (f.use(p), c.plugins)
        for (const m of c.plugins)
          f.use(m);
      f.provide(jt, this._propsRef), f.provide(dn, this._errorsRef), f.provide(Lt, this.emitEvent.bind(this)), f.provide(gn, this._contentRef), f.provide(vn, this._hostVisibilityRef), f.provide(mn, an(this)), f.provide(bn, ln(this)), f.provide(yn, Ot(this)), c.providers && c.providers(f, this), f.mount(e), u && Vt(u);
    };
    if (r.rootComponent)
      a(r);
    else if (r.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), e.appendChild(c), r.lazyConfig().then((u) => {
        l.signal.aborted || (c.remove(), a(u));
      }).catch((u) => {
        if (l.signal.aborted)
          return;
        const f = u instanceof Error ? u.message : String(u), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", f), c.replaceWith(p), this.emitEvent("error", { message: f });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
export {
  Cn as I,
  xn as W,
  Sn as a,
  In as u
};
//# sourceMappingURL=wc-runtime-CWzMpxrl.js.map
