import { defineComponent as H, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as he, normalizeClass as q, createVNode as x, unref as l, withKeys as Pe, createCommentVNode as A, Fragment as te, renderList as oe, createBlock as be, createTextVNode as R, toDisplayString as y, watch as de, onBeforeUnmount as ke, Transition as Me, withCtx as Ae, withModifiers as ye, ref as U, computed as z, isRef as Se, nextTick as qe, onMounted as Ie, withDirectives as pe, vModelText as xe, vModelSelect as Ve } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as Y, host as ue } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function so(e) {
  return Ue(e.metadata, e.id);
}
function fe(e) {
  return Ue(e.metadata, "");
}
function J(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function P(e) {
  return typeof e == "string" ? e.trim() : "";
}
function ze(e) {
  const o = J(e.metadata), t = J(o.source_ref);
  let a = P(t.external_id) || P(o.external_id);
  const n = P(t.external_version) || P(o.external_version);
  let s = P(t.upload_id) || P(o.upload_id), p = P(t.source_url) || P(t.url) || P(o.source_url);
  const b = P(t.reference_component_id) || P(t.component_id) || P(o.reference_component_id), O = Object.keys(J(t.reference_context)).length ? J(t.reference_context) : Object.keys(J(t.context)).length ? J(t.context) : J(o.reference_context);
  if (!s && a.startsWith("upload:") && (s = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && s && (a = `upload:${s}`), !a && p && (a = `url:${p}`), !a) return null;
  const m = { ...t };
  delete m.thread_id, delete m.thread_event_id, delete m.thread_event_seq, b && !P(m.reference_component_id) && (m.reference_component_id = b), Object.keys(O).length && Object.keys(J(m.reference_context)).length === 0 && (m.reference_context = O), a && Object.keys(m).length && !P(m.external_id) && (m.external_id = a);
  const v = Object.keys(m).length > 0;
  return {
    external_id: a,
    external_version: n || void 0,
    upload_id: s || void 0,
    source_url: p || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id,
      source_ref: v ? m : void 0
    },
    source_ref: v ? m : void 0
  };
}
function ao(e) {
  const o = ze(e), t = o ? P(o.external_id) : "";
  if (!t) return null;
  const a = J(e.metadata), n = J(a.source_ref);
  return `${P(n.external_source) || P(a.external_source)}\0${t}`;
}
function we(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const je = /engine .*not installed|no .*engine|unavailable/i;
function lo(e) {
  return je.test(e || "");
}
const io = "This knowledge base's engine is not installed; its contents are unavailable.", le = {
  root: { fill: "#6366f1", stroke: "#4f46e5" },
  topic: { fill: "#8b5cf6", stroke: "#7c3aed" },
  technology: { fill: "#06b6d4", stroke: "#0891b2" },
  person: { fill: "#3b82f6", stroke: "#2563eb" },
  organization: { fill: "#f59e0b", stroke: "#d97706" },
  location: { fill: "#10b981", stroke: "#059669" },
  event: { fill: "#ef4444", stroke: "#dc2626" },
  process: { fill: "#14b8a6", stroke: "#0d9488" },
  product: { fill: "#f97316", stroke: "#ea580c" },
  document: { fill: "#94a3b8", stroke: "#64748b" }
};
function ro(e) {
  if (e.node_type === "document") return le.document;
  if (e.is_root) return le.root;
  const o = (e.concept_type || "").toLowerCase();
  return le[o] || le.topic;
}
const Ke = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, me = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function Ge(e) {
  return e < me.length ? me[e] : Math.round((me[0] + (e - me.length + 1) * 137.508) % 360);
}
function ve(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Ce = 34, Ee = 88, We = 78, He = 38;
function co(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), a = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && a.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const S = /* @__PURE__ */ new Set();
    let I = u, N = 0;
    for (; !S.has(I); ) {
      S.add(I);
      const L = a.get(I);
      if (L === void 0 || n(L)) return { branch: I, depth: N };
      I = L, N++;
    }
    return { branch: I, depth: N };
  }
  const p = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const S = s(u.id);
    p.set(u.id, S), b.set(S.branch, Math.max(b.get(S.branch) ?? 0, S.depth));
  }
  const O = [...new Set([...p.values()].map((u) => u.branch))].sort((u, S) => (t.get(u)?.label || "").localeCompare(t.get(S)?.label || "")), m = /* @__PURE__ */ new Map();
  O.forEach((u, S) => m.set(u, Ge(S)));
  const v = (u, S, I) => u + (S - u) * I, T = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      T.set(u.id, { ...le.root });
      continue;
    }
    const S = p.get(u.id);
    if (!S) {
      T.set(u.id, { ...le.topic });
      continue;
    }
    const I = m.get(S.branch) ?? 220, N = Math.min(Math.max(b.get(S.branch) ?? 0, 1), 4), L = Math.min(1, S.depth / N);
    if (u.node_type === "document") {
      const k = Math.min(84, v(Ce, Ee, L) + 6);
      T.set(u.id, { fill: ve(I, 32, k), stroke: ve(I, 32, Math.max(50, k - 14)) });
    } else {
      const k = v(Ce, Ee, L), D = v(We, He, L);
      T.set(u.id, { fill: ve(I, D, k), stroke: ve(I, D, Math.max(28, k - 17)) });
    }
  }
  return T;
}
const Xe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function uo(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const v of e) t.set(v.id, v);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const v of o) {
    if (!Xe.has(v.edge_type || "") || !t.has(v.from_node_id) || !t.has(v.to_node_id)) continue;
    const T = a.get(v.to_node_id) || [];
    T.push(v.from_node_id), a.set(v.to_node_id, T), n.add(v.from_node_id);
  }
  const s = (v, T) => (t.get(v)?.label || "").localeCompare(t.get(T)?.label || "");
  function p(v, T, u) {
    const S = t.get(v);
    if (!S || u.has(v)) return null;
    u.add(v);
    const I = (a.get(v) || []).slice().sort(s), N = [];
    for (const L of I) {
      const k = p(L, T + 1, u);
      k && N.push(k);
    }
    return { concept: S, children: N, depth: T };
  }
  const b = e.filter((v) => v.is_root || !n.has(v.id)).map((v) => v.id).sort(s), O = /* @__PURE__ */ new Set(), m = [];
  for (const v of b) {
    const T = p(v, 0, O);
    T && m.push(T);
  }
  for (const v of e)
    if (!O.has(v.id)) {
      const T = p(v.id, 0, O);
      T && m.push(T);
    }
  return m;
}
function po(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const p of n.children) a(p, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: o, parentOf: t };
}
function fo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, a) => t.isFolder !== a.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(a.concept.label || a.concept.id)) : [];
}
function Je(e, o, t) {
  const a = [], n = /* @__PURE__ */ new Set();
  let s = e;
  for (; s && !n.has(s); ) {
    n.add(s);
    const p = o.get(s);
    if (!p) break;
    a.unshift(p.concept), s = t.get(s);
  }
  return a;
}
function mo(e, o, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const s of o.values()) {
    if (!(s.concept.label || s.concept.id).toLowerCase().includes(a)) continue;
    const b = Je(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: b.slice(0, -1) });
  }
  return n.sort((s, p) => s.isFolder !== p.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(p.concept.label || p.concept.id)).slice(0, 200);
}
function vo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const Qe = {
  technology: "tabler:cpu",
  person: "tabler:user",
  organization: "tabler:building",
  location: "tabler:map-pin",
  event: "tabler:calendar-event",
  process: "tabler:route",
  product: "tabler:package",
  topic: "tabler:bookmark"
};
function ho(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Qe[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function Ye(e, o) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !a.has(n.from_node_id) && (a.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function _o(e, o) {
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.from_node_id === e && !a.has(n.to_node_id) && (a.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function bo(e, o, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set();
  for (const s of o) {
    if (s.edge_type !== "subtopic_of" || s.to_node_id !== e.id || n.has(s.from_node_id)) continue;
    const p = t.get(s.from_node_id);
    p && (n.add(s.from_node_id), a.push(p));
  }
  return a.sort((s, p) => (s.label || "").localeCompare(p.label || ""));
}
function ko(e, o, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), s = new Set(Ye(e, o));
  for (const p of o) {
    if (p.edge_type === "subtopic_of" || p.edge_type === "categorized_as") continue;
    let b = "";
    if (p.from_node_id === e.id) b = p.to_node_id;
    else if (p.to_node_id === e.id) b = p.from_node_id;
    else continue;
    if (!b || n.has(b) || s.has(b)) continue;
    const O = t.get(b);
    O && (n.add(b), a.push({ concept: O, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
  }
  return a;
}
function yo(e, o) {
  let t = 0;
  for (const a of o)
    a.edge_type === "subtopic_of" && a.to_node_id === e && t++;
  return t;
}
const Ze = ["image/", "audio/", "video/"], et = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/sql",
  "application/xhtml+xml",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/vnd.oasis.opendocument.presentation"
]);
function go(e) {
  const o = (e || "").toLowerCase();
  return Ze.some((t) => o.startsWith(t)) || et.has(o);
}
function xo(e) {
  const o = e || {}, t = o.source_ref && typeof o.source_ref == "object" ? o.source_ref : {}, a = t.upload_id || o.upload_id;
  if (typeof a == "string" && a.trim()) return a.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof o.external_id == "string" && o.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function re(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function tt(e, o) {
  if (!o) return null;
  const t = re(e) ? e : {}, a = [
    t,
    re(t.data) ? t.data : null,
    re(t.payload) ? t.payload : null,
    re(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
    if (n.event !== "component.meta.changed") continue;
    const s = String(n.component_id || ""), p = String(t.topic || n.topic || "");
    if (!(s && s !== o) && !(!s && p !== `component.${o}`))
      return {
        event: "component.meta.changed",
        component_id: s || o,
        meta: re(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function nt(e, o) {
  if (!e) return null;
  const t = Oe(`component.${e}`, (a) => {
    const n = tt(a, e);
    n && o(n);
  });
  return typeof t == "function" ? t : null;
}
const ot = { class: "kx-shell" }, st = { class: "kx-rail" }, at = { class: "kx-main" }, wo = /* @__PURE__ */ H({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", ot, [
      r("aside", st, [
        he(o.$slots, "rail")
      ]),
      r("main", at, [
        he(o.$slots, "default")
      ])
    ]));
  }
}), lt = ["aria-label", "title", "disabled"], _e = /* @__PURE__ */ H({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    variant: { default: "plain" },
    size: { default: "md" },
    spin: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("button", {
      class: q(["kx-iconbtn", [
        e.variant === "bordered" && "bordered",
        e.variant === "danger" && "danger",
        e.size === "sm" && "sm",
        e.size === "lg" && "lg",
        e.active && "on"
      ]]),
      "aria-label": e.label,
      title: e.label,
      disabled: e.disabled,
      onClick: n[0] || (n[0] = (s) => t("click"))
    }, [
      x(l(C), {
        icon: e.icon,
        class: q(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, lt));
  }
}), it = { class: "kx-search" }, rt = ["value", "placeholder"], Te = /* @__PURE__ */ H({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", it, [
      x(l(C), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      r("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder || "Search…",
        onInput: n[0] || (n[0] = (s) => t("update:modelValue", s.target.value)),
        onKeyup: n[1] || (n[1] = Pe((s) => t("enter"), ["enter"]))
      }, null, 40, rt),
      e.modelValue ? (c(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (s) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        x(l(C), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : A("", !0)
    ]));
  }
}), ct = {
  class: "tb",
  role: "tablist"
}, ut = ["aria-selected", "onClick"], dt = {
  key: 1,
  class: "kx-count"
}, $o = /* @__PURE__ */ H({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", ct, [
      (c(!0), d(te, null, oe(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: q(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (p) => t("select", s.id)
      }, [
        s.icon ? (c(), be(l(C), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        R(" " + y(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", dt, y(s.count), 1)) : A("", !0)
      ], 10, ut))), 128))
    ]));
  }
}), So = /* @__PURE__ */ H({
  __name: "KbNotice",
  props: {
    tone: { default: "info" },
    icon: {}
  },
  setup(e) {
    const o = e, t = o.icon || {
      info: "tabler:info-circle",
      warn: "tabler:alert-triangle",
      error: "tabler:alert-circle",
      help: "tabler:bulb"
    }[o.tone];
    return (a, n) => (c(), d("div", {
      class: q(["kx-notice", e.tone])
    }, [
      x(l(C), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        he(a.$slots, "default")
      ])
    ], 2));
  }
}), pt = ["aria-label"], ft = { class: "kx-drawer-h" }, mt = { class: "kx-drawer-title" }, vt = { class: "kx-drawer-b" }, Co = /* @__PURE__ */ H({
  __name: "KbDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: o }) {
    const t = e, a = o;
    function n(s) {
      s.key === "Escape" && a("close");
    }
    return de(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), ke(() => window.removeEventListener("keydown", n)), (s, p) => (c(), be(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: p[1] || (p[1] = ye((b) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", ft, [
              r("span", mt, [
                x(l(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                R(y(e.title), 1)
              ]),
              x(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (b) => a("close"))
              })
            ]),
            r("div", vt, [
              he(s.$slots, "default")
            ])
          ], 8, pt)
        ])) : A("", !0)
      ]),
      _: 3
    }));
  }
});
function ht(e) {
  const o = U(""), t = U([]), a = U(""), n = U(""), s = U(null), p = U(!1), b = U(""), O = U(!1);
  let m = null;
  function v() {
    m && (clearTimeout(m), m = null), o.value = "", t.value = [], a.value = "", n.value = "", s.value = null, O.value = !1, b.value = "";
  }
  async function T(I = 20) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], O.value = !1;
      return;
    }
    p.value = !0, b.value = "", s.value = null, n.value = "", O.value = !0;
    try {
      const { data: k } = await Y.get(`/api/v1/kb10/${N}/search?q=${encodeURIComponent(L)}&limit=${I}`);
      k?.success ? (t.value = k.results || [], a.value = "", s.value = k.retrieval?.analysis?.status === "unavailable" ? k.retrieval.analysis : null) : b.value = k?.error || "search failed";
    } catch (k) {
      b.value = k?.response?.data?.error || k?.message || "search error", ue.handleError(k?.response?.status === 401 ? "auth-expired" : "other", k);
    } finally {
      p.value = !1;
    }
  }
  async function u(I = 8) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], a.value = "", O.value = !1;
      return;
    }
    p.value = !0, b.value = "", s.value = null, a.value = "", n.value = "", O.value = !0;
    try {
      const { data: k } = await Y.post(`/api/v1/knowledge/${N}/ask`, { query: L, limit: I });
      k?.success ? (t.value = k.results || [], k.mode === "query" ? n.value = k.answer : a.value = String(k.answer || "")) : b.value = k?.error || "ask failed";
    } catch (k) {
      const D = k?.response?.data;
      b.value = D?.error || k?.message || "ask error", ue.handleError(k?.response?.status === 401 ? "auth-expired" : "other", k);
    } finally {
      p.value = !1;
    }
  }
  function S(I = 300) {
    if (m && clearTimeout(m), !o.value.trim()) {
      t.value = [], O.value = !1;
      return;
    }
    m = setTimeout(() => T(), I);
  }
  return ke(() => {
    m && clearTimeout(m);
  }), { query: o, results: t, answer: a, queryNotice: n, analysisUnavailable: s, loading: p, error: b, performed: O, run: T, ask: u, runDebounced: S, clear: v };
}
function $e(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const _t = {
  key: 0,
  class: "kc-search-pop"
}, bt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, kt = {
  key: 1,
  class: "kc-search-state err"
}, yt = {
  key: 2,
  class: "kc-search-hits"
}, gt = ["onMousedown"], xt = { class: "kc-search-hit-h" }, wt = {
  key: 0,
  class: "kc-search-r-doc"
}, $t = { class: "kc-search-hit-kind" }, St = {
  key: 1,
  class: "kc-search-hit-score"
}, Ct = { class: "kc-search-hit-body" }, Et = {
  key: 3,
  class: "kc-search-state"
}, Tt = {
  key: 4,
  class: "kc-search-state"
}, Mt = {
  key: 1,
  class: "kc-search-panel"
}, At = { class: "kc-search-bar" }, It = {
  key: 0,
  class: "kc-search-modes"
}, Ot = { class: "kc-search-field" }, Ut = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Lt = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Nt = {
  key: 2,
  class: "kc-search-err"
}, Ft = {
  key: 3,
  class: "kc-search-skel"
}, Dt = {
  key: 0,
  class: "kc-ans"
}, Bt = { class: "kc-ans-h" }, Rt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, qt = { class: "kc-search-results" }, Vt = {
  key: 0,
  class: "kc-search-results-h"
}, zt = ["onClick"], jt = { class: "kc-search-r-h" }, Kt = {
  key: 0,
  class: "kc-search-r-doc"
}, Gt = { class: "kc-search-hit-kind" }, Wt = {
  key: 1,
  class: "kc-search-r-llm"
}, Ht = {
  key: 2,
  class: "kc-search-hit-score"
}, Xt = { class: "kc-search-r-body" }, Jt = {
  key: 0,
  class: "kc-search-r-open"
}, Qt = {
  key: 5,
  class: "kc-search-zero"
}, Yt = {
  key: 6,
  class: "kc-search-zero"
}, Zt = { class: "kc-search-zero-t" }, Eo = /* @__PURE__ */ H({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, a = o, { query: n, results: s, answer: p, queryNotice: b, analysisUnavailable: O, loading: m, error: v, performed: T, run: u, ask: S, runDebounced: I, clear: N } = ht(() => t.kbId), L = U("search"), k = U(!1), D = U(""), j = z(() => t.layout === "panel" && t.ask && L.value === "ask"), V = z(() => j.value && !b.value), se = z(() => m.value ? "tabler:hourglass" : j.value ? "tabler:sparkles" : "tabler:arrow-right"), Q = z(() => s.value[0]), ne = z(() => V.value ? s.value.slice(1) : s.value), ae = z(() => t.layout === "rail" && k.value && n.value.trim() !== "" && (m.value || T.value || !!v.value));
    function X() {
      n.value.trim() && (D.value = n.value.trim(), j.value ? S(8) : u(20));
    }
    function W() {
      t.layout === "rail" && I(300);
    }
    function Z(K) {
      L.value = K, T.value && n.value.trim() && X();
    }
    function ee(K) {
      a("open", K), t.layout === "rail" && (N(), k.value = !1);
    }
    return (K, g) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: g[2] || (g[2] = (w) => k.value = !0),
      onFocusout: g[3] || (g[3] = (w) => k.value = !1)
    }, [
      x(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          g[0] || (g[0] = (w) => Se(n) ? n.value = w : null),
          W
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: g[1] || (g[1] = (w) => l(u)(20)),
        onClear: l(N)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ae.value ? (c(), d("div", _t, [
        l(O) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + y(l(O).model) + ".", 1)) : A("", !0),
        l(v) ? (c(), d("div", kt, [
          x(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, y(l(v)), 1)
        ])) : l(s).length ? (c(), d("div", yt, [
          (c(!0), d(te, null, oe(l(s), (w) => (c(), d("button", {
            key: w.id,
            class: "kc-search-hit",
            onMousedown: ye((ie) => ee(w), ["prevent"])
          }, [
            r("span", xt, [
              l(fe)(w) ? (c(), d("span", wt, [
                x(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(y(l(fe)(w)), 1)
              ])) : A("", !0),
              r("span", $t, y(w.node_type || "result"), 1),
              w.similarity != null ? (c(), d("span", St, y(l($e)(w.similarity)), 1)) : A("", !0)
            ]),
            r("span", Ct, y(l(we)(w.content, 160)), 1)
          ], 40, gt))), 128))
        ])) : l(T) && !l(m) ? (c(), d("div", Et, [
          x(l(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          g[9] || (g[9] = r("span", null, "No passages matched.", -1))
        ])) : l(m) ? (c(), d("div", Tt, [
          x(l(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          g[10] || (g[10] = r("span", null, "Searching…", -1))
        ])) : A("", !0)
      ])) : A("", !0)
    ], 32)) : (c(), d("div", Mt, [
      r("div", At, [
        e.ask ? (c(), d("div", It, [
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "search" }]),
            onClick: g[4] || (g[4] = (w) => Z("search"))
          }, [
            x(l(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            g[11] || (g[11] = R(" Search ", -1))
          ], 2),
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: g[5] || (g[5] = (w) => Z("ask"))
          }, [
            x(l(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            g[12] || (g[12] = R(" Ask ", -1))
          ], 2)
        ])) : A("", !0),
        r("div", Ot, [
          x(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": g[6] || (g[6] = (w) => Se(n) ? n.value = w : null),
            placeholder: j.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: X
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        x(_e, {
          icon: se.value,
          label: j.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(m),
          disabled: !l(n).trim() || l(m),
          onClick: X
        }, null, 8, ["icon", "label", "active", "disabled"]),
        x(_e, {
          icon: "tabler:x",
          label: "Close search",
          onClick: g[7] || (g[7] = (w) => a("close"))
        })
      ]),
      l(O) ? (c(), d("p", Ut, "Showing direct matches. No model is assigned to " + y(l(O).model) + ".", 1)) : A("", !0),
      l(b) ? (c(), d("p", Lt, y(l(b)), 1)) : A("", !0),
      l(v) ? (c(), d("div", Nt, [
        x(l(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, y(l(v)), 1)
      ])) : A("", !0),
      l(m) ? (c(), d("div", Ft, [
        (c(), d(te, null, oe(3, (w) => r("div", {
          key: w,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(s).length ? (c(), d(te, { key: 4 }, [
        V.value ? (c(), d("div", Dt, [
          r("div", Bt, [
            x(l(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            R(" " + y(l(p) ? "Answer" : "Best match") + ' for "' + y(D.value) + '"', 1)
          ]),
          r("p", Rt, y(l(p) || l(we)(Q.value?.content, 700)), 1),
          Q.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: g[8] || (g[8] = (w) => ee(Q.value))
          }, [
            x(l(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            g[13] || (g[13] = R(" Open source document ", -1)),
            Q.value?.similarity != null ? (c(), d("span", Pt, y(l($e)(Q.value?.similarity)), 1)) : A("", !0)
          ])) : A("", !0)
        ])) : A("", !0),
        r("div", qt, [
          V.value && ne.value.length ? (c(), d("div", Vt, "Sources")) : A("", !0),
          (c(!0), d(te, null, oe(ne.value, (w) => (c(), d("button", {
            key: w.id,
            class: q(["kc-search-result", { link: !!w.parent_id }]),
            onClick: (ie) => ee(w)
          }, [
            r("div", jt, [
              l(fe)(w) ? (c(), d("span", Kt, [
                x(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(y(l(fe)(w)), 1)
              ])) : A("", !0),
              r("span", Gt, y(w.node_type || "passage"), 1),
              w.llm_score != null ? (c(), d("span", Wt, "Relevance " + y(Math.round(w.llm_score)), 1)) : A("", !0),
              w.similarity != null ? (c(), d("span", Ht, y(l($e)(w.similarity)), 1)) : A("", !0)
            ]),
            r("p", Xt, y(l(we)(w.content, 360)), 1),
            w.parent_id ? (c(), d("span", Jt, [
              x(l(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              g[14] || (g[14] = R(" Open document", -1))
            ])) : A("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : l(T) ? (c(), d("div", Qt, [
        x(l(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        g[15] || (g[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        g[16] || (g[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Yt, [
        x(l(C), {
          icon: j.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Zt, y(j.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), en = ["aria-label"], tn = { class: "kc-orig-h" }, nn = { class: "kc-orig-title" }, on = { class: "kc-orig-title-t" }, sn = { class: "kc-orig-b" }, an = ["content-type", "source-url", "filename"], To = /* @__PURE__ */ H({
  __name: "OriginalOverlay",
  props: {
    open: { type: Boolean },
    title: {},
    contentType: {},
    sourceUrl: {},
    filename: {},
    contained: { type: Boolean, default: !1 }
  },
  emits: ["close"],
  setup(e, { emit: o }) {
    const t = e, a = o, n = U(null);
    function s() {
      if (t.contained) return;
      const u = n.value;
      u && u.requestFullscreen && !document.fullscreenElement && u.requestFullscreen().catch(() => {
      });
    }
    function p() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function b(u) {
      u.key === "Escape" && a("close");
    }
    function O() {
      t.open && !document.fullscreenElement && a("close");
    }
    de(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", b), qe(s)) : (window.removeEventListener("keydown", b), p());
    });
    const m = U(""), v = U("");
    async function T() {
      if (m.value = "", v.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await Y.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (m.value = u.url, v.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return de(() => [t.open, t.sourceUrl], T, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", O);
    }), ke(() => {
      document.removeEventListener("fullscreenchange", O), window.removeEventListener("keydown", b), p();
    }), (u, S) => (c(), be(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: q(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: S[1] || (S[1] = ye((I) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", tn, [
              r("span", nn, [
                x(l(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", on, y(e.title), 1)
              ]),
              x(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: S[0] || (S[0] = (I) => a("close"))
              })
            ]),
            r("div", sn, [
              m.value ? (c(), d("wc-resource-view", {
                key: m.value,
                class: "kc-orig-rv",
                "content-type": v.value || e.contentType,
                "source-url": m.value,
                filename: e.filename
              }, null, 8, an)) : A("", !0)
            ])
          ], 8, en)
        ], 2)) : A("", !0)
      ]),
      _: 1
    }));
  }
}), Mo = /* @__PURE__ */ H({
  __name: "ViewOriginalButton",
  props: {
    label: {}
  },
  emits: ["open"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (s) => t("open"))
    }, [
      x(l(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, y(e.label || "View original"), 1)
    ]));
  }
}), ln = { class: "kc-docsum" }, rn = { class: "kc-docsum-h" }, Ao = /* @__PURE__ */ H({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = U(!1), a = z(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", ln, [
      r("div", rn, [
        x(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        R(" " + y(e.label), 1)
      ]),
      r("p", {
        class: q(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, y(e.text), 3),
      a.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (p) => t.value = !t.value)
      }, y(t.value ? "Show less" : "Show more"), 1)) : A("", !0)
    ]));
  }
}), cn = { class: "kx-empty kx-empty-spacious" }, un = { class: "kx-empty-title" }, dn = {
  key: 0,
  class: "kx-empty-sub"
}, Io = /* @__PURE__ */ H({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {},
    tone: {}
  },
  emits: ["cta"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", cn, [
      r("div", {
        class: q(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        x(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", un, y(e.title), 1),
      e.hint ? (c(), d("div", dn, y(e.hint), 1)) : A("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), be(l(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        R(" " + y(e.cta), 1)
      ])) : A("", !0)
    ]));
  }
}), Le = /* @__PURE__ */ new Set([
  "pdf",
  "docx",
  "doc",
  "pptx",
  "ppt",
  "xlsx",
  "xls",
  "rtf",
  "odt",
  "ods",
  "odp",
  "epub"
]), Ne = /* @__PURE__ */ new Set([
  "txt",
  "md",
  "markdown",
  "html",
  "htm",
  "css",
  "js",
  "json",
  "xml",
  "py",
  "lua",
  "rb",
  "php",
  "java",
  "c",
  "cpp",
  "cs",
  "go",
  "sh",
  "bat",
  "ps1",
  "yml",
  "yaml",
  "toml",
  "sql",
  "csv",
  "tsv"
]), Fe = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/epub+zip"
]), De = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), pn = [
  ...Array.from(Le),
  ...Array.from(Ne)
].map((e) => `.${e}`), fn = [
  ...pn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Fe)
].join(","), mn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function vn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function hn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Fe.has(o) || De.has(o)) return !0;
  const t = vn(e.name);
  return Le.has(t) || Ne.has(t);
}
const ce = ["uploading", "processing"];
function _n(e, o) {
  const t = U([]), a = U(!1), n = U(""), s = U("");
  let p = 0;
  const b = (i) => `${i}${++p}`, O = z(() => a.value || t.value.some((i) => ce.includes(i.status)));
  function m() {
    n.value = "", s.value = "";
  }
  function v() {
    t.value = t.value.filter((i) => ce.includes(i.status));
  }
  function T(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function u(i, f) {
    t.value = t.value.map((_) => _.key === i ? { ..._, ...f } : _);
  }
  const S = [];
  function I() {
    for (const i of S.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) S.push(setTimeout(() => o(), i));
  }
  function N() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), I();
  }
  function L(i) {
    const f = t.value.find((_) => _.key === i);
    !f || f.status === "done" || (u(i, { status: "done" }), N());
  }
  function k(i, f) {
    t.value = [...t.value, { key: b("q"), name: i, uuid: f, status: "done" }], N();
  }
  const D = /* @__PURE__ */ new Map(), j = [];
  function V(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function se(i) {
    const f = V(i) ? i : {};
    return String(f.topic || "");
  }
  function Q(i) {
    const f = V(i) ? i : {}, _ = [
      f,
      V(f.data) ? f.data : null,
      V(f.payload) ? f.payload : null,
      V(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const M of _)
      if (typeof M.uuid == "string" && typeof M.status == "string") return M;
    return {};
  }
  function ne(i, f, _) {
    const M = t.value.find((F) => F.uuid === i && ce.includes(F.status));
    if (!M) return;
    const B = String(f || "");
    B === "error" || B === "failed" ? u(M.key, { status: "error", error: String(_ || "File processing failed") }) : B === "completed" ? L(M.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(M.key, { status: "processing" });
  }
  function ae(i, f) {
    const _ = Q(f);
    _.uuid === i && ne(i, _.status, _.error);
  }
  function X(i) {
    const f = `upload:${i}`;
    if (D.has(f)) return;
    const _ = Oe("@message", (M) => {
      se(M) === f && ae(i, M);
    });
    typeof _ == "function" && D.set(f, _);
  }
  async function W(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ce.includes(f.status))))
      try {
        const { data: f } = await Y.get(`/api/v1/uploads/${encodeURIComponent(i)}`), _ = V(f?.upload) ? f.upload : V(f) ? f : {};
        ne(i, _.status, _.error || _.error_details);
      } catch {
      }
  }
  function Z(i) {
    W(i);
    for (const f of [1500, 5e3, 15e3])
      j.push(setTimeout(() => {
        W(i);
      }, f));
  }
  function ee(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const _ = String(f.last_error || "Embedding failed");
      for (const M of t.value) ce.includes(M.status) && u(M.key, { status: "error", error: _ });
      s.value = _;
    }
  }
  let K = null, g = 0;
  function w(i) {
    const f = ++g;
    if (K && (K(), K = null), !i) return;
    const _ = nt(i, ee);
    if (f !== g) {
      _ && _();
      return;
    }
    K = _;
  }
  de(() => e(), (i) => {
    w(i);
  }, { immediate: !0 }), ke(() => {
    for (const i of S.splice(0)) clearTimeout(i);
    for (const i of j.splice(0)) clearTimeout(i);
    g++, K && K();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ie(i, f, _) {
    try {
      const { data: M } = await Y.post(`/api/v1/knowledge/${_}/upload-token`);
      if (!M?.success || !M.upload_token) {
        u(i, { status: "error", error: M?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", f), B.append("upload_token", M.upload_token);
      const { data: F } = await Y.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (F?.success && F.uuid) {
        const G = String(F.uuid);
        u(i, { uuid: G, externalId: `upload:${G}`, status: "processing" }), X(G), Z(G);
      } else
        u(i, { status: "error", error: F?.error || "Upload failed" });
    } catch (M) {
      u(i, { status: "error", error: M?.response?.data?.error || M?.message || "Upload error" }), ue.handleError(M?.response?.status === 401 ? "auth-expired" : "other", M);
    }
  }
  function E(i) {
    const f = e();
    if (f) {
      m();
      for (const _ of Array.from(i)) {
        if (!hn(_)) {
          s.value = mn;
          continue;
        }
        const M = b("f");
        t.value = [...t.value, { key: M, name: _.name, status: "uploading" }], ie(M, _, f);
      }
    }
  }
  function h(i) {
    E([i]);
  }
  async function $(i = 100, f = 0) {
    const { data: _ } = await Y.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), B = (Array.isArray(_?.uploads) ? _.uploads : []).map((F) => ({
      uuid: String(F.uuid),
      filename: String(F.filename || F.meta && F.meta.filename || F.uuid),
      mime_type: F.mime_type,
      size: F.size,
      status: F.status,
      created_at: F.created_at
    }));
    return { uploads: B, total: Number(_?.meta?.total ?? B.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      m(), a.value = !0;
      try {
        const { data: _ } = await Y.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((G) => G.uuid)
        }), M = Array.isArray(_?.results) ? _.results : [], B = (G) => i.find((Re) => Re.uuid === G)?.name || G;
        let F = !1;
        for (const G of M)
          G?.success && (F = !0, k(B(String(G.upload_id)), String(G.upload_id)));
        F || (s.value = _?.error || "Could not ingest the selected uploads");
      } catch (_) {
        s.value = _?.response?.data?.error || _?.message || "Ingest error", ue.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(i, f, _) {
    const M = e();
    if (!(!i.trim() || !M)) {
      m(), a.value = !0;
      try {
        const B = f.trim() ? { title: f.trim() } : void 0, { data: F } = await Y.post(`/api/v1/knowledge/${M}/ingest`, { content: i, content_type: _, metadata: B });
        F?.success ? k(f.trim() || "Pasted text") : s.value = F?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", ue.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: O,
    okMsg: z(() => n.value),
    errMsg: z(() => s.value),
    reset: m,
    clearItems: v,
    removeItem: T,
    uploadFile: h,
    uploadFiles: E,
    listMyUploads: $,
    ingestExistingUploads: ge,
    ingestText: Be
  };
}
const bn = { class: "ap" }, kn = {
  class: "ap-modes",
  role: "tablist"
}, yn = ["aria-selected", "onClick"], gn = {
  key: 0,
  class: "ap-msg err"
}, xn = {
  key: 1,
  class: "ap-pane"
}, wn = ["accept"], $n = {
  key: 2,
  class: "ap-pane"
}, Sn = { class: "ap-uploads-bar" }, Cn = ["disabled"], En = {
  key: 0,
  class: "ap-uploads-state"
}, Tn = {
  key: 1,
  class: "ap-uploads-state err"
}, Mn = {
  key: 2,
  class: "ap-uploads-state"
}, An = {
  key: 3,
  class: "ap-uploads"
}, In = ["aria-pressed", "onClick"], On = { class: "ap-upload-main" }, Un = { class: "ap-upload-name" }, Ln = { class: "ap-upload-meta" }, Nn = {
  key: 0,
  class: "mono"
}, Fn = { key: 1 }, Dn = {
  key: 3,
  class: "ap-pane"
}, Bn = { class: "ap-form" }, Rn = { class: "ap-grid2" }, Pn = { class: "ap-field" }, qn = ["placeholder"], Vn = { class: "ap-field" }, zn = { class: "ap-field" }, jn = { class: "ap-label-row" }, Kn = {
  key: 0,
  class: "ap-count"
}, Gn = ["placeholder"], Wn = { class: "ap-actions" }, Hn = { class: "ap-hint" }, Xn = ["disabled"], Jn = {
  key: 4,
  class: "ap-items"
}, Qn = { class: "ap-items-h" }, Yn = { class: "ap-items-list" }, Zn = { class: "ap-item-name" }, eo = { class: "ap-item-status" }, Oo = /* @__PURE__ */ H({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, a = o, n = _n(() => t.kbId, () => a("changed")), s = U("file"), p = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], b = z(() => t.noun || "content");
    function O(E) {
      n.reset(), s.value = E, E === "uploads" && se();
    }
    const m = U(null), v = U(!1);
    function T() {
      m.value?.click();
    }
    function u(E) {
      const h = E.target.files;
      h?.length && n.uploadFiles(h), m.value && (m.value.value = "");
    }
    function S(E) {
      E.preventDefault(), v.value = !1;
      const h = E.dataTransfer?.files;
      h?.length && n.uploadFiles(h);
    }
    const I = U([]), N = U(!1), L = U(""), k = U(""), D = U({}), j = z(() => {
      const E = k.value.trim().toLowerCase();
      return E ? I.value.filter((h) => h.filename.toLowerCase().includes(E)) : I.value;
    }), V = z(() => Object.values(D.value).filter(Boolean).length);
    async function se() {
      N.value = !0, L.value = "";
      try {
        const { uploads: E } = await n.listMyUploads(200, 0);
        I.value = E;
      } catch (E) {
        L.value = E?.message || "Could not load your uploads";
      } finally {
        N.value = !1;
      }
    }
    function Q(E) {
      D.value = { ...D.value, [E]: !D.value[E] };
    }
    async function ne() {
      const E = I.value.filter((h) => D.value[h.uuid]).map((h) => ({ uuid: h.uuid, name: h.filename }));
      E.length && (await n.ingestExistingUploads(E), n.errMsg.value || (D.value = {}));
    }
    function ae(E) {
      return !E || E <= 0 ? "" : E < 1024 ? `${E} B` : E < 1024 * 1024 ? `${(E / 1024).toFixed(0)} KB` : `${(E / 1024 / 1024).toFixed(1)} MB`;
    }
    const X = U(""), W = U(""), Z = U("text/plain"), ee = z(() => W.value.length);
    async function K() {
      W.value.trim() && (await n.ingestText(W.value, X.value, Z.value), n.errMsg.value || (W.value = "", X.value = ""));
    }
    const g = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function w(E) {
      return E === "done" ? "tabler:circle-check" : E === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ie = z(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && se();
    }), de(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (E, h) => (c(), d("div", bn, [
      r("div", kn, [
        (c(), d(te, null, oe(p, ($) => r("button", {
          key: $.id,
          class: q(["ap-mode", { on: s.value === $.id }]),
          role: "tab",
          "aria-selected": s.value === $.id,
          onClick: (ge) => O($.id)
        }, [
          x(l(C), {
            icon: $.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, y($.label), 1)
        ], 10, yn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", gn, [
        x(l(C), { icon: "tabler:alert-circle" }),
        R(y(l(n).errMsg.value), 1)
      ])) : A("", !0),
      s.value === "file" ? (c(), d("section", xn, [
        r("input", {
          ref_key: "fileInput",
          ref: m,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(fn),
          onChange: u
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: q(["ap-drop", { over: v.value }]),
          onClick: T,
          onDragover: h[0] || (h[0] = ye(($) => v.value = !0, ["prevent"])),
          onDragleave: h[1] || (h[1] = ($) => v.value = !1),
          onDrop: S
        }, [
          x(l(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          h[7] || (h[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          h[8] || (h[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", $n, [
        r("div", Sn, [
          pe(r("input", {
            "onUpdate:modelValue": h[2] || (h[2] = ($) => k.value = $),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, k.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !V.value || l(n).busy.value,
            onClick: ne
          }, [
            x(l(C), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: q(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            R(" " + y(V.value ? `Add ${V.value} selected` : "Add selected"), 1)
          ], 8, Cn)
        ]),
        N.value ? (c(), d("div", En, [
          x(l(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          h[9] || (h[9] = R(" Loading your uploads…", -1))
        ])) : L.value ? (c(), d("div", Tn, [
          x(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          R(" " + y(L.value), 1)
        ])) : j.value.length ? (c(), d("ul", An, [
          (c(!0), d(te, null, oe(j.value, ($) => (c(), d("li", {
            key: $.uuid
          }, [
            r("button", {
              type: "button",
              class: q(["ap-upload", { on: D.value[$.uuid] }]),
              "aria-pressed": !!D.value[$.uuid],
              onClick: (ge) => Q($.uuid)
            }, [
              x(l(C), {
                class: "ap-upload-check",
                icon: D.value[$.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              x(l(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", On, [
                r("span", Un, y($.filename), 1),
                r("span", Ln, [
                  $.mime_type ? (c(), d("span", Nn, y($.mime_type), 1)) : A("", !0),
                  ae($.size) ? (c(), d("span", Fn, y(ae($.size)), 1)) : A("", !0)
                ])
              ])
            ], 10, In)
          ]))), 128))
        ])) : (c(), d("div", Mn, [
          x(l(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          h[10] || (h[10] = R(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Dn, [
        r("div", Bn, [
          r("div", Rn, [
            r("div", Pn, [
              h[11] || (h[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                R("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              pe(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": h[3] || (h[3] = ($) => X.value = $),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${b.value} a title`,
                autocomplete: "off"
              }, null, 8, qn), [
                [xe, X.value]
              ])
            ]),
            r("div", Vn, [
              h[13] || (h[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              pe(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": h[4] || (h[4] = ($) => Z.value = $),
                class: "ap-input"
              }, [...h[12] || (h[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [Ve, Z.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", jn, [
              h[14] || (h[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              ee.value ? (c(), d("span", Kn, y(ee.value.toLocaleString()) + " chars", 1)) : A("", !0)
            ]),
            pe(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": h[5] || (h[5] = ($) => W.value = $),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${b.value} to add to this knowledge base…`
            }, null, 8, Gn), [
              [xe, W.value]
            ])
          ]),
          r("div", Wn, [
            r("span", Hn, [
              x(l(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              h[15] || (h[15] = R(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !W.value.trim() || l(n).busy.value,
              onClick: K
            }, [
              x(l(C), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: q(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              R(" " + y(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Xn)
          ])
        ])
      ])),
      ie.value ? (c(), d("div", Jn, [
        r("div", Qn, [
          h[16] || (h[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? A("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: h[6] || (h[6] = ($) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Yn, [
          (c(!0), d(te, null, oe(l(n).items.value, ($) => (c(), d("li", {
            key: $.key,
            class: q(["ap-item", $.status])
          }, [
            x(l(C), {
              class: q(["ap-item-ic", ["uploading", "processing", "embedding"].includes($.status) && "spin"]),
              icon: w($.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Zn, y($.name), 1),
            r("span", eo, y($.error || g[$.status]), 1)
          ], 2))), 128))
        ])
      ])) : A("", !0)
    ]));
  }
});
export {
  po as A,
  Je as B,
  fo as C,
  mo as D,
  io as E,
  we as F,
  Ke as G,
  _o as H,
  co as I,
  le as N,
  _e as _,
  ze as a,
  go as b,
  ao as c,
  Mo as d,
  $o as e,
  Ao as f,
  To as g,
  So as h,
  lo as i,
  wo as j,
  Eo as k,
  Io as l,
  Te as m,
  so as n,
  Co as o,
  Oo as p,
  Ye as q,
  bo as r,
  nt as s,
  ko as t,
  xo as u,
  ro as v,
  ho as w,
  yo as x,
  vo as y,
  uo as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-D0Y8qoSm.js.map
