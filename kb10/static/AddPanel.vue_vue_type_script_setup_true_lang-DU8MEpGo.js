import { defineComponent as W, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as he, normalizeClass as V, createVNode as g, unref as l, withKeys as Pe, createCommentVNode as T, Fragment as te, renderList as ae, createBlock as be, createTextVNode as P, toDisplayString as y, watch as de, onBeforeUnmount as ke, Transition as Me, withCtx as Ae, withModifiers as ye, ref as U, computed as z, isRef as Se, nextTick as qe, onMounted as Ie, withDirectives as pe, vModelText as xe, vModelSelect as Ve } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as Oe, api as Q, host as ue } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function ao(e) {
  return Ue(e.metadata, e.id);
}
function fe(e) {
  return Ue(e.metadata, "");
}
function J(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function q(e) {
  return typeof e == "string" ? e.trim() : "";
}
function ze(e) {
  const o = J(e.metadata), t = J(o.source_ref);
  let a = q(t.external_id) || q(o.external_id);
  const n = q(t.external_version) || q(o.external_version);
  let s = q(t.upload_id) || q(o.upload_id), p = q(t.source_url) || q(t.url) || q(o.source_url);
  const k = q(t.reference_component_id) || q(t.component_id) || q(o.reference_component_id), I = Object.keys(J(t.reference_context)).length ? J(t.reference_context) : Object.keys(J(t.context)).length ? J(t.context) : J(o.reference_context);
  if (!s && a.startsWith("upload:") && (s = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && s && (a = `upload:${s}`), !a && p && (a = `url:${p}`), !a) return null;
  const m = { ...t };
  delete m.thread_id, delete m.thread_event_id, delete m.thread_event_seq, k && !q(m.reference_component_id) && (m.reference_component_id = k), Object.keys(I).length && Object.keys(J(m.reference_context)).length === 0 && (m.reference_context = I), a && Object.keys(m).length && !q(m.external_id) && (m.external_id = a);
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
function lo(e) {
  const o = ze(e), t = o ? q(o.external_id) : "";
  if (!t) return null;
  const a = J(e.metadata), n = J(a.source_ref);
  return `${q(n.external_source) || q(a.external_source)}\0${t}`;
}
function we(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const je = /engine .*not installed|no .*engine|unavailable/i;
function io(e) {
  return je.test(e || "");
}
const ro = "This knowledge base's engine is not installed; its contents are unavailable.", le = {
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
function co(e) {
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
function uo(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), a = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && a.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const C = /* @__PURE__ */ new Set();
    let O = u, N = 0;
    for (; !C.has(O); ) {
      C.add(O);
      const L = a.get(O);
      if (L === void 0 || n(L)) return { branch: O, depth: N };
      O = L, N++;
    }
    return { branch: O, depth: N };
  }
  const p = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const C = s(u.id);
    p.set(u.id, C), k.set(C.branch, Math.max(k.get(C.branch) ?? 0, C.depth));
  }
  const I = [...new Set([...p.values()].map((u) => u.branch))].sort((u, C) => (t.get(u)?.label || "").localeCompare(t.get(C)?.label || "")), m = /* @__PURE__ */ new Map();
  I.forEach((u, C) => m.set(u, Ge(C)));
  const v = (u, C, O) => u + (C - u) * O, M = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      M.set(u.id, { ...le.root });
      continue;
    }
    const C = p.get(u.id);
    if (!C) {
      M.set(u.id, { ...le.topic });
      continue;
    }
    const O = m.get(C.branch) ?? 220, N = Math.min(Math.max(k.get(C.branch) ?? 0, 1), 4), L = Math.min(1, C.depth / N);
    if (u.node_type === "document") {
      const b = Math.min(84, v(Ce, Ee, L) + 6);
      M.set(u.id, { fill: ve(O, 32, b), stroke: ve(O, 32, Math.max(50, b - 14)) });
    } else {
      const b = v(Ce, Ee, L), F = v(We, He, L);
      M.set(u.id, { fill: ve(O, F, b), stroke: ve(O, F, Math.max(28, b - 17)) });
    }
  }
  return M;
}
const Xe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function po(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const v of e) t.set(v.id, v);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const v of o) {
    if (!Xe.has(v.edge_type || "") || !t.has(v.from_node_id) || !t.has(v.to_node_id)) continue;
    const M = a.get(v.to_node_id) || [];
    M.push(v.from_node_id), a.set(v.to_node_id, M), n.add(v.from_node_id);
  }
  const s = (v, M) => (t.get(v)?.label || "").localeCompare(t.get(M)?.label || "");
  function p(v, M, u) {
    const C = t.get(v);
    if (!C || u.has(v)) return null;
    u.add(v);
    const O = (a.get(v) || []).slice().sort(s), N = [];
    for (const L of O) {
      const b = p(L, M + 1, u);
      b && N.push(b);
    }
    return { concept: C, children: N, depth: M };
  }
  const k = e.filter((v) => v.is_root || !n.has(v.id)).map((v) => v.id).sort(s), I = /* @__PURE__ */ new Set(), m = [];
  for (const v of k) {
    const M = p(v, 0, I);
    M && m.push(M);
  }
  for (const v of e)
    if (!I.has(v.id)) {
      const M = p(v.id, 0, I);
      M && m.push(M);
    }
  return m;
}
function fo(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const p of n.children) a(p, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: o, parentOf: t };
}
function mo(e) {
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
function vo(e, o, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const s of o.values()) {
    if (!(s.concept.label || s.concept.id).toLowerCase().includes(a)) continue;
    const k = Je(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: k.slice(0, -1) });
  }
  return n.sort((s, p) => s.isFolder !== p.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(p.concept.label || p.concept.id)).slice(0, 200);
}
function ho(e) {
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
function _o(e) {
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
function bo(e, o) {
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.from_node_id === e && !a.has(n.to_node_id) && (a.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function ko(e, o, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set();
  for (const s of o) {
    if (s.edge_type !== "subtopic_of" || s.to_node_id !== e.id || n.has(s.from_node_id)) continue;
    const p = t.get(s.from_node_id);
    p && (n.add(s.from_node_id), a.push(p));
  }
  return a.sort((s, p) => (s.label || "").localeCompare(p.label || ""));
}
function yo(e, o, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), s = new Set(Ye(e, o));
  for (const p of o) {
    if (p.edge_type === "subtopic_of" || p.edge_type === "categorized_as") continue;
    let k = "";
    if (p.from_node_id === e.id) k = p.to_node_id;
    else if (p.to_node_id === e.id) k = p.from_node_id;
    else continue;
    if (!k || n.has(k) || s.has(k)) continue;
    const I = t.get(k);
    I && (n.add(k), a.push({ concept: I, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
  }
  return a;
}
function go(e, o) {
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
function xo(e) {
  const o = (e || "").toLowerCase();
  return Ze.some((t) => o.startsWith(t)) || et.has(o);
}
function wo(e) {
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
const ot = { class: "kx-shell" }, st = { class: "kx-rail" }, at = { class: "kx-main" }, $o = /* @__PURE__ */ W({
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
}), lt = ["aria-label", "title", "disabled"], _e = /* @__PURE__ */ W({
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
      class: V(["kx-iconbtn", [
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
      g(l(E), {
        icon: e.icon,
        class: V(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, lt));
  }
}), it = { class: "kx-search" }, rt = ["value", "placeholder"], Te = /* @__PURE__ */ W({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", it, [
      g(l(E), {
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
        g(l(E), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : T("", !0)
    ]));
  }
}), ct = {
  class: "tb",
  role: "tablist"
}, ut = ["aria-selected", "onClick"], dt = {
  key: 1,
  class: "kx-count"
}, So = /* @__PURE__ */ W({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", ct, [
      (c(!0), d(te, null, ae(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: V(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (p) => t("select", s.id)
      }, [
        s.icon ? (c(), be(l(E), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : T("", !0),
        P(" " + y(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", dt, y(s.count), 1)) : T("", !0)
      ], 10, ut))), 128))
    ]));
  }
}), Co = /* @__PURE__ */ W({
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
      class: V(["kx-notice", e.tone])
    }, [
      g(l(E), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        he(a.$slots, "default")
      ])
    ], 2));
  }
}), pt = ["aria-label"], ft = { class: "kx-drawer-h" }, mt = { class: "kx-drawer-title" }, vt = { class: "kx-drawer-b" }, Eo = /* @__PURE__ */ W({
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
          onClick: p[1] || (p[1] = ye((k) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", ft, [
              r("span", mt, [
                g(l(E), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(y(e.title), 1)
              ]),
              g(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (k) => a("close"))
              })
            ]),
            r("div", vt, [
              he(s.$slots, "default")
            ])
          ], 8, pt)
        ])) : T("", !0)
      ]),
      _: 3
    }));
  }
});
function ht(e) {
  const o = U(""), t = U([]), a = U(""), n = U(""), s = U(null), p = U(!1), k = U(""), I = U(!1);
  let m = null;
  function v() {
    m && (clearTimeout(m), m = null), o.value = "", t.value = [], a.value = "", n.value = "", s.value = null, I.value = !1, k.value = "";
  }
  async function M(O = 20) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], I.value = !1;
      return;
    }
    p.value = !0, k.value = "", s.value = null, n.value = "", I.value = !0;
    try {
      const { data: b } = await Q.get(`/api/v1/kb10/${N}/search?q=${encodeURIComponent(L)}&limit=${O}`);
      b?.success ? (t.value = b.results || [], a.value = "", s.value = b.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null) : k.value = b?.error || "search failed";
    } catch (b) {
      k.value = b?.response?.data?.error || b?.message || "search error", ue.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      p.value = !1;
    }
  }
  async function u(O = 8) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], a.value = "", I.value = !1;
      return;
    }
    p.value = !0, k.value = "", s.value = null, a.value = "", n.value = "", I.value = !0;
    try {
      const { data: b } = await Q.post(`/api/v1/knowledge/${N}/ask`, { query: L, limit: O });
      b?.success ? (t.value = b.results || [], b.mode === "query" ? n.value = b.answer : a.value = String(b.answer || "")) : (s.value = b?.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null, k.value = b?.error || "ask failed");
    } catch (b) {
      const F = b?.response?.data;
      s.value = F?.retrieval?.analysis?.status === "unavailable" ? F.retrieval.analysis : null, k.value = F?.error || b?.message || "ask error", ue.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      p.value = !1;
    }
  }
  function C(O = 300) {
    if (m && clearTimeout(m), !o.value.trim()) {
      t.value = [], I.value = !1;
      return;
    }
    m = setTimeout(() => M(), O);
  }
  return ke(() => {
    m && clearTimeout(m);
  }), { query: o, results: t, answer: a, queryNotice: n, analysisUnavailable: s, loading: p, error: k, performed: I, run: M, ask: u, runDebounced: C, clear: v };
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
  class: "kc-search-state"
}, Lt = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Nt = {
  key: 2,
  class: "kc-search-state",
  role: "status"
}, Ft = {
  key: 3,
  class: "kc-search-err"
}, Dt = {
  key: 4,
  class: "kc-search-skel"
}, Bt = {
  key: 0,
  class: "kc-ans"
}, Rt = { class: "kc-ans-h" }, Pt = { class: "kc-ans-body" }, qt = {
  key: 0,
  class: "kc-ans-sim"
}, Vt = { class: "kc-search-results" }, zt = {
  key: 0,
  class: "kc-search-results-h"
}, jt = ["onClick"], Kt = { class: "kc-search-r-h" }, Gt = {
  key: 0,
  class: "kc-search-r-doc"
}, Wt = { class: "kc-search-hit-kind" }, Ht = {
  key: 1,
  class: "kc-search-r-llm"
}, Xt = {
  key: 2,
  class: "kc-search-hit-score"
}, Jt = { class: "kc-search-r-body" }, Qt = {
  key: 0,
  class: "kc-search-r-open"
}, Yt = {
  key: 6,
  class: "kc-search-zero"
}, Zt = {
  key: 7,
  class: "kc-search-zero"
}, en = { class: "kc-search-zero-t" }, To = /* @__PURE__ */ W({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, a = o, { query: n, results: s, answer: p, queryNotice: k, analysisUnavailable: I, loading: m, error: v, performed: M, run: u, ask: C, runDebounced: O, clear: N } = ht(() => t.kbId), L = U("search"), b = U(!1), F = U(""), Y = z(() => t.ask && !I.value), R = z(() => t.layout === "panel" && Y.value && L.value === "ask"), Z = z(() => R.value && !k.value), ie = z(() => m.value ? "tabler:hourglass" : R.value ? "tabler:sparkles" : "tabler:arrow-right"), H = z(() => s.value[0]), ne = z(() => Z.value ? s.value.slice(1) : s.value), ee = z(() => t.layout === "rail" && b.value && n.value.trim() !== "" && (m.value || M.value || !!v.value));
    function j() {
      n.value.trim() && (F.value = n.value.trim(), R.value ? C(8) : u(20));
    }
    function oe() {
      t.layout === "rail" && O(300);
    }
    function se(X) {
      L.value = X, M.value && n.value.trim() && j();
    }
    function G(X) {
      a("open", X), t.layout === "rail" && (N(), b.value = !1);
    }
    return (X, x) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: x[2] || (x[2] = (w) => b.value = !0),
      onFocusout: x[3] || (x[3] = (w) => b.value = !1)
    }, [
      g(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          x[0] || (x[0] = (w) => Se(n) ? n.value = w : null),
          oe
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: x[1] || (x[1] = (w) => l(u)(20)),
        onClear: l(N)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ee.value ? (c(), d("div", _t, [
        l(I) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + y(l(I).model) + ".", 1)) : T("", !0),
        l(v) ? (c(), d("div", kt, [
          g(l(E), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, y(l(v)), 1)
        ])) : l(s).length ? (c(), d("div", yt, [
          (c(!0), d(te, null, ae(l(s), (w) => (c(), d("button", {
            key: w.id,
            class: "kc-search-hit",
            onMousedown: ye((S) => G(w), ["prevent"])
          }, [
            r("span", xt, [
              l(fe)(w) ? (c(), d("span", wt, [
                g(l(E), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(y(l(fe)(w)), 1)
              ])) : T("", !0),
              r("span", $t, y(w.node_type || "result"), 1),
              w.similarity != null ? (c(), d("span", St, y(l($e)(w.similarity)), 1)) : T("", !0)
            ]),
            r("span", Ct, y(l(we)(w.content, 160)), 1)
          ], 40, gt))), 128))
        ])) : l(M) && !l(m) ? (c(), d("div", Et, [
          g(l(E), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          x[9] || (x[9] = r("span", null, "No passages matched.", -1))
        ])) : l(m) ? (c(), d("div", Tt, [
          g(l(E), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          x[10] || (x[10] = r("span", null, "Searching…", -1))
        ])) : T("", !0)
      ])) : T("", !0)
    ], 32)) : (c(), d("div", Mt, [
      r("div", At, [
        Y.value ? (c(), d("div", It, [
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "search" }]),
            onClick: x[4] || (x[4] = (w) => se("search"))
          }, [
            g(l(E), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            x[11] || (x[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: x[5] || (x[5] = (w) => se("ask"))
          }, [
            g(l(E), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            x[12] || (x[12] = P(" Ask ", -1))
          ], 2)
        ])) : T("", !0),
        r("div", Ot, [
          g(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": x[6] || (x[6] = (w) => Se(n) ? n.value = w : null),
            placeholder: R.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: j
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        g(_e, {
          icon: ie.value,
          label: R.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(m),
          disabled: !l(n).trim() || l(m),
          onClick: j
        }, null, 8, ["icon", "label", "active", "disabled"]),
        g(_e, {
          icon: "tabler:x",
          label: "Close search",
          onClick: x[7] || (x[7] = (w) => a("close"))
        })
      ]),
      t.ask ? T("", !0) : (c(), d("p", Ut, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(I) ? (c(), d("p", Lt, "Showing direct matches. No model is assigned to " + y(l(I).model) + ".", 1)) : T("", !0),
      l(k) ? (c(), d("p", Nt, y(l(k)), 1)) : T("", !0),
      l(v) ? (c(), d("div", Ft, [
        g(l(E), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, y(l(v)), 1)
      ])) : T("", !0),
      l(m) ? (c(), d("div", Dt, [
        (c(), d(te, null, ae(3, (w) => r("div", {
          key: w,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(s).length ? (c(), d(te, { key: 5 }, [
        Z.value ? (c(), d("div", Bt, [
          r("div", Rt, [
            g(l(E), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + y(l(p) ? "Answer" : "Best match") + ' for "' + y(F.value) + '"', 1)
          ]),
          r("p", Pt, y(l(p) || l(we)(H.value?.content, 700)), 1),
          H.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: x[8] || (x[8] = (w) => G(H.value))
          }, [
            g(l(E), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            x[13] || (x[13] = P(" Open source document ", -1)),
            H.value?.similarity != null ? (c(), d("span", qt, y(l($e)(H.value?.similarity)), 1)) : T("", !0)
          ])) : T("", !0)
        ])) : T("", !0),
        r("div", Vt, [
          Z.value && ne.value.length ? (c(), d("div", zt, "Sources")) : T("", !0),
          (c(!0), d(te, null, ae(ne.value, (w) => (c(), d("button", {
            key: w.id,
            class: V(["kc-search-result", { link: !!w.parent_id }]),
            onClick: (S) => G(w)
          }, [
            r("div", Kt, [
              l(fe)(w) ? (c(), d("span", Gt, [
                g(l(E), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(y(l(fe)(w)), 1)
              ])) : T("", !0),
              r("span", Wt, y(w.node_type || "passage"), 1),
              w.llm_score != null ? (c(), d("span", Ht, "Relevance " + y(Math.round(w.llm_score)), 1)) : T("", !0),
              w.similarity != null ? (c(), d("span", Xt, y(l($e)(w.similarity)), 1)) : T("", !0)
            ]),
            r("p", Jt, y(l(we)(w.content, 360)), 1),
            w.parent_id ? (c(), d("span", Qt, [
              g(l(E), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              x[14] || (x[14] = P(" Open document", -1))
            ])) : T("", !0)
          ], 10, jt))), 128))
        ])
      ], 64)) : l(M) ? (c(), d("div", Yt, [
        g(l(E), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        x[15] || (x[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        x[16] || (x[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Zt, [
        g(l(E), {
          icon: R.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", en, y(R.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), tn = ["aria-label"], nn = { class: "kc-orig-h" }, on = { class: "kc-orig-title" }, sn = { class: "kc-orig-title-t" }, an = { class: "kc-orig-b" }, ln = ["content-type", "source-url", "filename"], Mo = /* @__PURE__ */ W({
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
    function k(u) {
      u.key === "Escape" && a("close");
    }
    function I() {
      t.open && !document.fullscreenElement && a("close");
    }
    de(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", k), qe(s)) : (window.removeEventListener("keydown", k), p());
    });
    const m = U(""), v = U("");
    async function M() {
      if (m.value = "", v.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await Q.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (m.value = u.url, v.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return de(() => [t.open, t.sourceUrl], M, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", I);
    }), ke(() => {
      document.removeEventListener("fullscreenchange", I), window.removeEventListener("keydown", k), p();
    }), (u, C) => (c(), be(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: V(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: C[1] || (C[1] = ye((O) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", nn, [
              r("span", on, [
                g(l(E), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", sn, y(e.title), 1)
              ]),
              g(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: C[0] || (C[0] = (O) => a("close"))
              })
            ]),
            r("div", an, [
              m.value ? (c(), d("wc-resource-view", {
                key: m.value,
                class: "kc-orig-rv",
                "content-type": v.value || e.contentType,
                "source-url": m.value,
                filename: e.filename
              }, null, 8, ln)) : T("", !0)
            ])
          ], 8, tn)
        ], 2)) : T("", !0)
      ]),
      _: 1
    }));
  }
}), Ao = /* @__PURE__ */ W({
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
      g(l(E), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, y(e.label || "View original"), 1)
    ]));
  }
}), rn = { class: "kc-docsum" }, cn = { class: "kc-docsum-h" }, Io = /* @__PURE__ */ W({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = U(!1), a = z(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", rn, [
      r("div", cn, [
        g(l(E), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + y(e.label), 1)
      ]),
      r("p", {
        class: V(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, y(e.text), 3),
      a.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (p) => t.value = !t.value)
      }, y(t.value ? "Show less" : "Show more"), 1)) : T("", !0)
    ]));
  }
}), un = { class: "kx-empty kx-empty-spacious" }, dn = { class: "kx-empty-title" }, pn = {
  key: 0,
  class: "kx-empty-sub"
}, Oo = /* @__PURE__ */ W({
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
    return (a, n) => (c(), d("div", un, [
      r("div", {
        class: V(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        g(l(E), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", dn, y(e.title), 1),
      e.hint ? (c(), d("div", pn, y(e.hint), 1)) : T("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), be(l(E), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : T("", !0),
        P(" " + y(e.cta), 1)
      ])) : T("", !0)
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
]), fn = [
  ...Array.from(Le),
  ...Array.from(Ne)
].map((e) => `.${e}`), mn = [
  ...fn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Fe)
].join(","), vn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function hn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function _n(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Fe.has(o) || De.has(o)) return !0;
  const t = hn(e.name);
  return Le.has(t) || Ne.has(t);
}
const ce = ["uploading", "processing"];
function bn(e, o) {
  const t = U([]), a = U(!1), n = U(""), s = U("");
  let p = 0;
  const k = (i) => `${i}${++p}`, I = z(() => a.value || t.value.some((i) => ce.includes(i.status)));
  function m() {
    n.value = "", s.value = "";
  }
  function v() {
    t.value = t.value.filter((i) => ce.includes(i.status));
  }
  function M(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function u(i, f) {
    t.value = t.value.map((_) => _.key === i ? { ..._, ...f } : _);
  }
  const C = [];
  function O() {
    for (const i of C.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) C.push(setTimeout(() => o(), i));
  }
  function N() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), O();
  }
  function L(i) {
    const f = t.value.find((_) => _.key === i);
    !f || f.status === "done" || (u(i, { status: "done" }), N());
  }
  function b(i, f) {
    t.value = [...t.value, { key: k("q"), name: i, uuid: f, status: "done" }], N();
  }
  const F = /* @__PURE__ */ new Map(), Y = [];
  function R(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function Z(i) {
    const f = R(i) ? i : {};
    return String(f.topic || "");
  }
  function ie(i) {
    const f = R(i) ? i : {}, _ = [
      f,
      R(f.data) ? f.data : null,
      R(f.payload) ? f.payload : null,
      R(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const A of _)
      if (typeof A.uuid == "string" && typeof A.status == "string") return A;
    return {};
  }
  function H(i, f, _) {
    const A = t.value.find((D) => D.uuid === i && ce.includes(D.status));
    if (!A) return;
    const B = String(f || "");
    B === "error" || B === "failed" ? u(A.key, { status: "error", error: String(_ || "File processing failed") }) : B === "completed" ? L(A.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(A.key, { status: "processing" });
  }
  function ne(i, f) {
    const _ = ie(f);
    _.uuid === i && H(i, _.status, _.error);
  }
  function ee(i) {
    const f = `upload:${i}`;
    if (F.has(f)) return;
    const _ = Oe("@message", (A) => {
      Z(A) === f && ne(i, A);
    });
    typeof _ == "function" && F.set(f, _);
  }
  async function j(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ce.includes(f.status))))
      try {
        const { data: f } = await Q.get(`/api/v1/uploads/${encodeURIComponent(i)}`), _ = R(f?.upload) ? f.upload : R(f) ? f : {};
        H(i, _.status, _.error || _.error_details);
      } catch {
      }
  }
  function oe(i) {
    j(i);
    for (const f of [1500, 5e3, 15e3])
      Y.push(setTimeout(() => {
        j(i);
      }, f));
  }
  function se(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const _ = String(f.last_error || "Embedding failed");
      for (const A of t.value) ce.includes(A.status) && u(A.key, { status: "error", error: _ });
      s.value = _;
    }
  }
  let G = null, X = 0;
  function x(i) {
    const f = ++X;
    if (G && (G(), G = null), !i) return;
    const _ = nt(i, se);
    if (f !== X) {
      _ && _();
      return;
    }
    G = _;
  }
  de(() => e(), (i) => {
    x(i);
  }, { immediate: !0 }), ke(() => {
    for (const i of C.splice(0)) clearTimeout(i);
    for (const i of Y.splice(0)) clearTimeout(i);
    X++, G && G();
    for (const i of F.values()) i();
    F.clear();
  });
  async function w(i, f, _) {
    try {
      const { data: A } = await Q.post(`/api/v1/knowledge/${_}/upload-token`);
      if (!A?.success || !A.upload_token) {
        u(i, { status: "error", error: A?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", f), B.append("upload_token", A.upload_token);
      const { data: D } = await Q.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (D?.success && D.uuid) {
        const K = String(D.uuid);
        u(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), ee(K), oe(K);
      } else
        u(i, { status: "error", error: D?.error || "Upload failed" });
    } catch (A) {
      u(i, { status: "error", error: A?.response?.data?.error || A?.message || "Upload error" }), ue.handleError(A?.response?.status === 401 ? "auth-expired" : "other", A);
    }
  }
  function S(i) {
    const f = e();
    if (f) {
      m();
      for (const _ of Array.from(i)) {
        if (!_n(_)) {
          s.value = vn;
          continue;
        }
        const A = k("f");
        t.value = [...t.value, { key: A, name: _.name, status: "uploading" }], w(A, _, f);
      }
    }
  }
  function h(i) {
    S([i]);
  }
  async function $(i = 100, f = 0) {
    const { data: _ } = await Q.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), B = (Array.isArray(_?.uploads) ? _.uploads : []).map((D) => ({
      uuid: String(D.uuid),
      filename: String(D.filename || D.meta && D.meta.filename || D.uuid),
      mime_type: D.mime_type,
      size: D.size,
      status: D.status,
      created_at: D.created_at
    }));
    return { uploads: B, total: Number(_?.meta?.total ?? B.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      m(), a.value = !0;
      try {
        const { data: _ } = await Q.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), A = Array.isArray(_?.results) ? _.results : [], B = (K) => i.find((Re) => Re.uuid === K)?.name || K;
        let D = !1;
        for (const K of A)
          K?.success && (D = !0, b(B(String(K.upload_id)), String(K.upload_id)));
        D || (s.value = _?.error || "Could not ingest the selected uploads");
      } catch (_) {
        s.value = _?.response?.data?.error || _?.message || "Ingest error", ue.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(i, f, _) {
    const A = e();
    if (!(!i.trim() || !A)) {
      m(), a.value = !0;
      try {
        const B = f.trim() ? { title: f.trim() } : void 0, { data: D } = await Q.post(`/api/v1/knowledge/${A}/ingest`, { content: i, content_type: _, metadata: B });
        D?.success ? b(f.trim() || "Pasted text") : s.value = D?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", ue.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: I,
    okMsg: z(() => n.value),
    errMsg: z(() => s.value),
    reset: m,
    clearItems: v,
    removeItem: M,
    uploadFile: h,
    uploadFiles: S,
    listMyUploads: $,
    ingestExistingUploads: ge,
    ingestText: Be
  };
}
const kn = { class: "ap" }, yn = {
  class: "ap-modes",
  role: "tablist"
}, gn = ["aria-selected", "onClick"], xn = {
  key: 0,
  class: "ap-msg err"
}, wn = {
  key: 1,
  class: "ap-pane"
}, $n = ["accept"], Sn = {
  key: 2,
  class: "ap-pane"
}, Cn = { class: "ap-uploads-bar" }, En = ["disabled"], Tn = {
  key: 0,
  class: "ap-uploads-state"
}, Mn = {
  key: 1,
  class: "ap-uploads-state err"
}, An = {
  key: 2,
  class: "ap-uploads-state"
}, In = {
  key: 3,
  class: "ap-uploads"
}, On = ["aria-pressed", "onClick"], Un = { class: "ap-upload-main" }, Ln = { class: "ap-upload-name" }, Nn = { class: "ap-upload-meta" }, Fn = {
  key: 0,
  class: "mono"
}, Dn = { key: 1 }, Bn = {
  key: 3,
  class: "ap-pane"
}, Rn = { class: "ap-form" }, Pn = { class: "ap-grid2" }, qn = { class: "ap-field" }, Vn = ["placeholder"], zn = { class: "ap-field" }, jn = { class: "ap-field" }, Kn = { class: "ap-label-row" }, Gn = {
  key: 0,
  class: "ap-count"
}, Wn = ["placeholder"], Hn = { class: "ap-actions" }, Xn = { class: "ap-hint" }, Jn = ["disabled"], Qn = {
  key: 4,
  class: "ap-items"
}, Yn = { class: "ap-items-h" }, Zn = { class: "ap-items-list" }, eo = { class: "ap-item-name" }, to = { class: "ap-item-status" }, Uo = /* @__PURE__ */ W({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, a = o, n = bn(() => t.kbId, () => a("changed")), s = U("file"), p = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], k = z(() => t.noun || "content");
    function I(S) {
      n.reset(), s.value = S, S === "uploads" && Z();
    }
    const m = U(null), v = U(!1);
    function M() {
      m.value?.click();
    }
    function u(S) {
      const h = S.target.files;
      h?.length && n.uploadFiles(h), m.value && (m.value.value = "");
    }
    function C(S) {
      S.preventDefault(), v.value = !1;
      const h = S.dataTransfer?.files;
      h?.length && n.uploadFiles(h);
    }
    const O = U([]), N = U(!1), L = U(""), b = U(""), F = U({}), Y = z(() => {
      const S = b.value.trim().toLowerCase();
      return S ? O.value.filter((h) => h.filename.toLowerCase().includes(S)) : O.value;
    }), R = z(() => Object.values(F.value).filter(Boolean).length);
    async function Z() {
      N.value = !0, L.value = "";
      try {
        const { uploads: S } = await n.listMyUploads(200, 0);
        O.value = S;
      } catch (S) {
        L.value = S?.message || "Could not load your uploads";
      } finally {
        N.value = !1;
      }
    }
    function ie(S) {
      F.value = { ...F.value, [S]: !F.value[S] };
    }
    async function H() {
      const S = O.value.filter((h) => F.value[h.uuid]).map((h) => ({ uuid: h.uuid, name: h.filename }));
      S.length && (await n.ingestExistingUploads(S), n.errMsg.value || (F.value = {}));
    }
    function ne(S) {
      return !S || S <= 0 ? "" : S < 1024 ? `${S} B` : S < 1024 * 1024 ? `${(S / 1024).toFixed(0)} KB` : `${(S / 1024 / 1024).toFixed(1)} MB`;
    }
    const ee = U(""), j = U(""), oe = U("text/plain"), se = z(() => j.value.length);
    async function G() {
      j.value.trim() && (await n.ingestText(j.value, ee.value, oe.value), n.errMsg.value || (j.value = "", ee.value = ""));
    }
    const X = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function x(S) {
      return S === "done" ? "tabler:circle-check" : S === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const w = z(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && Z();
    }), de(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (S, h) => (c(), d("div", kn, [
      r("div", yn, [
        (c(), d(te, null, ae(p, ($) => r("button", {
          key: $.id,
          class: V(["ap-mode", { on: s.value === $.id }]),
          role: "tab",
          "aria-selected": s.value === $.id,
          onClick: (ge) => I($.id)
        }, [
          g(l(E), {
            icon: $.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, y($.label), 1)
        ], 10, gn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", xn, [
        g(l(E), { icon: "tabler:alert-circle" }),
        P(y(l(n).errMsg.value), 1)
      ])) : T("", !0),
      s.value === "file" ? (c(), d("section", wn, [
        r("input", {
          ref_key: "fileInput",
          ref: m,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(mn),
          onChange: u
        }, null, 40, $n),
        r("button", {
          type: "button",
          class: V(["ap-drop", { over: v.value }]),
          onClick: M,
          onDragover: h[0] || (h[0] = ye(($) => v.value = !0, ["prevent"])),
          onDragleave: h[1] || (h[1] = ($) => v.value = !1),
          onDrop: C
        }, [
          g(l(E), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          h[7] || (h[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          h[8] || (h[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", Sn, [
        r("div", Cn, [
          pe(r("input", {
            "onUpdate:modelValue": h[2] || (h[2] = ($) => b.value = $),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, b.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !R.value || l(n).busy.value,
            onClick: H
          }, [
            g(l(E), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: V(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + y(R.value ? `Add ${R.value} selected` : "Add selected"), 1)
          ], 8, En)
        ]),
        N.value ? (c(), d("div", Tn, [
          g(l(E), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          h[9] || (h[9] = P(" Loading your uploads…", -1))
        ])) : L.value ? (c(), d("div", Mn, [
          g(l(E), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + y(L.value), 1)
        ])) : Y.value.length ? (c(), d("ul", In, [
          (c(!0), d(te, null, ae(Y.value, ($) => (c(), d("li", {
            key: $.uuid
          }, [
            r("button", {
              type: "button",
              class: V(["ap-upload", { on: F.value[$.uuid] }]),
              "aria-pressed": !!F.value[$.uuid],
              onClick: (ge) => ie($.uuid)
            }, [
              g(l(E), {
                class: "ap-upload-check",
                icon: F.value[$.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g(l(E), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Un, [
                r("span", Ln, y($.filename), 1),
                r("span", Nn, [
                  $.mime_type ? (c(), d("span", Fn, y($.mime_type), 1)) : T("", !0),
                  ne($.size) ? (c(), d("span", Dn, y(ne($.size)), 1)) : T("", !0)
                ])
              ])
            ], 10, On)
          ]))), 128))
        ])) : (c(), d("div", An, [
          g(l(E), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          h[10] || (h[10] = P(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Bn, [
        r("div", Rn, [
          r("div", Pn, [
            r("div", qn, [
              h[11] || (h[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                P("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              pe(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": h[3] || (h[3] = ($) => ee.value = $),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${k.value} a title`,
                autocomplete: "off"
              }, null, 8, Vn), [
                [xe, ee.value]
              ])
            ]),
            r("div", zn, [
              h[13] || (h[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              pe(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": h[4] || (h[4] = ($) => oe.value = $),
                class: "ap-input"
              }, [...h[12] || (h[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [Ve, oe.value]
              ])
            ])
          ]),
          r("div", jn, [
            r("div", Kn, [
              h[14] || (h[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              se.value ? (c(), d("span", Gn, y(se.value.toLocaleString()) + " chars", 1)) : T("", !0)
            ]),
            pe(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": h[5] || (h[5] = ($) => j.value = $),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${k.value} to add to this knowledge base…`
            }, null, 8, Wn), [
              [xe, j.value]
            ])
          ]),
          r("div", Hn, [
            r("span", Xn, [
              g(l(E), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              h[15] || (h[15] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !j.value.trim() || l(n).busy.value,
              onClick: G
            }, [
              g(l(E), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: V(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + y(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Jn)
          ])
        ])
      ])),
      w.value ? (c(), d("div", Qn, [
        r("div", Yn, [
          h[16] || (h[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? T("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: h[6] || (h[6] = ($) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Zn, [
          (c(!0), d(te, null, ae(l(n).items.value, ($) => (c(), d("li", {
            key: $.key,
            class: V(["ap-item", $.status])
          }, [
            g(l(E), {
              class: V(["ap-item-ic", ["uploading", "processing", "embedding"].includes($.status) && "spin"]),
              icon: x($.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", eo, y($.name), 1),
            r("span", to, y($.error || X[$.status]), 1)
          ], 2))), 128))
        ])
      ])) : T("", !0)
    ]));
  }
});
export {
  fo as A,
  Je as B,
  mo as C,
  vo as D,
  ro as E,
  we as F,
  Ke as G,
  bo as H,
  uo as I,
  le as N,
  _e as _,
  ze as a,
  xo as b,
  lo as c,
  Ao as d,
  So as e,
  Io as f,
  Mo as g,
  Co as h,
  io as i,
  $o as j,
  To as k,
  Oo as l,
  Te as m,
  ao as n,
  Eo as o,
  Uo as p,
  Ye as q,
  ko as r,
  nt as s,
  yo as t,
  wo as u,
  co as v,
  _o as w,
  go as x,
  ho as y,
  po as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-DU8MEpGo.js.map
