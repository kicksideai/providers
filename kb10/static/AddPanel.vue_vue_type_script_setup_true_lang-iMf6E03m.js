import { defineComponent as W, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as ve, normalizeClass as V, createVNode as $, unref as l, withKeys as Pe, createCommentVNode as I, Fragment as te, renderList as ne, createBlock as _e, createTextVNode as R, toDisplayString as w, watch as ue, onBeforeUnmount as be, Transition as Me, withCtx as Ae, withModifiers as ke, ref as U, computed as z, isRef as Se, nextTick as Ve, onMounted as Ie, withDirectives as de, vModelText as xe, vModelSelect as qe } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as Y, host as ce } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function so(e) {
  return Ue(e.metadata, e.id);
}
function pe(e) {
  return Ue(e.metadata, "");
}
function X(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function P(e) {
  return typeof e == "string" ? e.trim() : "";
}
function ze(e) {
  const o = X(e.metadata), t = X(o.source_ref);
  let a = P(t.external_id) || P(o.external_id);
  const n = P(t.external_version) || P(o.external_version);
  let s = P(t.upload_id) || P(o.upload_id), p = P(t.source_url) || P(t.url) || P(o.source_url);
  const _ = P(t.reference_component_id) || P(t.component_id) || P(o.reference_component_id), E = Object.keys(X(t.reference_context)).length ? X(t.reference_context) : Object.keys(X(t.context)).length ? X(t.context) : X(o.reference_context);
  if (!s && a.startsWith("upload:") && (s = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && s && (a = `upload:${s}`), !a && p && (a = `url:${p}`), !a) return null;
  const b = { ...t };
  delete b.thread_id, delete b.thread_event_id, delete b.thread_event_seq, _ && !P(b.reference_component_id) && (b.reference_component_id = _), Object.keys(E).length && Object.keys(X(b.reference_context)).length === 0 && (b.reference_context = E), a && Object.keys(b).length && !P(b.external_id) && (b.external_id = a);
  const m = Object.keys(b).length > 0;
  return {
    external_id: a,
    external_version: n || void 0,
    upload_id: s || void 0,
    source_url: p || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id,
      source_ref: m ? b : void 0
    },
    source_ref: m ? b : void 0
  };
}
function ao(e) {
  const o = ze(e), t = o ? P(o.external_id) : "";
  if (!t) return null;
  const a = X(e.metadata), n = X(a.source_ref);
  return `${P(n.external_source) || P(a.external_source)}\0${t}`;
}
function we(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const je = /engine .*not installed|no .*engine|unavailable/i;
function lo(e) {
  return je.test(e || "");
}
const io = "This knowledge base's engine is not installed; its contents are unavailable.", ae = {
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
  if (e.node_type === "document") return ae.document;
  if (e.is_root) return ae.root;
  const o = (e.concept_type || "").toLowerCase();
  return ae[o] || ae.topic;
}
const Ke = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, fe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function Ge(e) {
  return e < fe.length ? fe[e] : Math.round((fe[0] + (e - fe.length + 1) * 137.508) % 360);
}
function me(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Ce = 34, Ee = 88, We = 78, He = 38;
function co(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), a = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && a.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const g = /* @__PURE__ */ new Set();
    let M = u, L = 0;
    for (; !g.has(M); ) {
      g.add(M);
      const k = a.get(M);
      if (k === void 0 || n(k)) return { branch: M, depth: L };
      M = k, L++;
    }
    return { branch: M, depth: L };
  }
  const p = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const g = s(u.id);
    p.set(u.id, g), _.set(g.branch, Math.max(_.get(g.branch) ?? 0, g.depth));
  }
  const E = [...new Set([...p.values()].map((u) => u.branch))].sort((u, g) => (t.get(u)?.label || "").localeCompare(t.get(g)?.label || "")), b = /* @__PURE__ */ new Map();
  E.forEach((u, g) => b.set(u, Ge(g)));
  const m = (u, g, M) => u + (g - u) * M, O = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      O.set(u.id, { ...ae.root });
      continue;
    }
    const g = p.get(u.id);
    if (!g) {
      O.set(u.id, { ...ae.topic });
      continue;
    }
    const M = b.get(g.branch) ?? 220, L = Math.min(Math.max(_.get(g.branch) ?? 0, 1), 4), k = Math.min(1, g.depth / L);
    if (u.node_type === "document") {
      const N = Math.min(84, m(Ce, Ee, k) + 6);
      O.set(u.id, { fill: me(M, 32, N), stroke: me(M, 32, Math.max(50, N - 14)) });
    } else {
      const N = m(Ce, Ee, k), D = m(We, He, k);
      O.set(u.id, { fill: me(M, D, N), stroke: me(M, D, Math.max(28, N - 17)) });
    }
  }
  return O;
}
const Xe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function uo(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of o) {
    if (!Xe.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const O = a.get(m.to_node_id) || [];
    O.push(m.from_node_id), a.set(m.to_node_id, O), n.add(m.from_node_id);
  }
  const s = (m, O) => (t.get(m)?.label || "").localeCompare(t.get(O)?.label || "");
  function p(m, O, u) {
    const g = t.get(m);
    if (!g || u.has(m)) return null;
    u.add(m);
    const M = (a.get(m) || []).slice().sort(s), L = [];
    for (const k of M) {
      const N = p(k, O + 1, u);
      N && L.push(N);
    }
    return { concept: g, children: L, depth: O };
  }
  const _ = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(s), E = /* @__PURE__ */ new Set(), b = [];
  for (const m of _) {
    const O = p(m, 0, E);
    O && b.push(O);
  }
  for (const m of e)
    if (!E.has(m.id)) {
      const O = p(m.id, 0, E);
      O && b.push(O);
    }
  return b;
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
    const _ = Je(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: _.slice(0, -1) });
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
    let _ = "";
    if (p.from_node_id === e.id) _ = p.to_node_id;
    else if (p.to_node_id === e.id) _ = p.from_node_id;
    else continue;
    if (!_ || n.has(_) || s.has(_)) continue;
    const E = t.get(_);
    E && (n.add(_), a.push({ concept: E, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
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
function ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function tt(e, o) {
  if (!o) return null;
  const t = ie(e) ? e : {}, a = [
    t,
    ie(t.data) ? t.data : null,
    ie(t.payload) ? t.payload : null,
    ie(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
    if (n.event !== "component.meta.changed") continue;
    const s = String(n.component_id || ""), p = String(t.topic || n.topic || "");
    if (!(s && s !== o) && !(!s && p !== `component.${o}`))
      return {
        event: "component.meta.changed",
        component_id: s || o,
        meta: ie(n.meta) ? n.meta : {},
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
const ot = { class: "kx-shell" }, st = { class: "kx-rail" }, at = { class: "kx-main" }, wo = /* @__PURE__ */ W({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", ot, [
      r("aside", st, [
        ve(o.$slots, "rail")
      ]),
      r("main", at, [
        ve(o.$slots, "default")
      ])
    ]));
  }
}), lt = ["aria-label", "title", "disabled"], he = /* @__PURE__ */ W({
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
      $(l(C), {
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
      $(l(C), {
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
        $(l(C), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : I("", !0)
    ]));
  }
}), ct = {
  class: "tb",
  role: "tablist"
}, ut = ["aria-selected", "onClick"], dt = {
  key: 1,
  class: "kx-count"
}, $o = /* @__PURE__ */ W({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", ct, [
      (c(!0), d(te, null, ne(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: V(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (p) => t("select", s.id)
      }, [
        s.icon ? (c(), _e(l(C), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        R(" " + w(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", dt, w(s.count), 1)) : I("", !0)
      ], 10, ut))), 128))
    ]));
  }
}), So = /* @__PURE__ */ W({
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
      $(l(C), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ve(a.$slots, "default")
      ])
    ], 2));
  }
}), pt = ["aria-label"], ft = { class: "kx-drawer-h" }, mt = { class: "kx-drawer-title" }, vt = { class: "kx-drawer-b" }, Co = /* @__PURE__ */ W({
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
    return ue(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), be(() => window.removeEventListener("keydown", n)), (s, p) => (c(), _e(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: p[1] || (p[1] = ke((_) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", ft, [
              r("span", mt, [
                $(l(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                R(w(e.title), 1)
              ]),
              $(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (_) => a("close"))
              })
            ]),
            r("div", vt, [
              ve(s.$slots, "default")
            ])
          ], 8, pt)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
});
function ht(e) {
  const o = U(""), t = U([]), a = U(""), n = U(null), s = U(!1), p = U(""), _ = U(!1);
  let E = null;
  function b() {
    E && (clearTimeout(E), E = null), o.value = "", t.value = [], a.value = "", n.value = null, _.value = !1, p.value = "";
  }
  async function m(g = 20) {
    const M = e(), L = o.value.trim();
    if (!L || !M) {
      t.value = [], _.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, _.value = !0;
    try {
      const { data: k } = await Y.get(`/api/v1/kb10/${M}/search?q=${encodeURIComponent(L)}&limit=${g}`);
      k?.success ? (t.value = k.results || [], a.value = "", n.value = k.retrieval?.analysis?.status === "unavailable" ? k.retrieval.analysis : null) : p.value = k?.error || "search failed";
    } catch (k) {
      p.value = k?.response?.data?.error || k?.message || "search error", ce.handleError(k?.response?.status === 401 ? "auth-expired" : "other", k);
    } finally {
      s.value = !1;
    }
  }
  async function O(g = 8) {
    const M = e(), L = o.value.trim();
    if (!L || !M) {
      t.value = [], a.value = "", _.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, a.value = "", _.value = !0;
    try {
      const { data: k } = await Y.post(`/api/v1/knowledge/${M}/ask`, { query: L, limit: g });
      k?.success ? (t.value = k.results || [], a.value = String(k.answer || "")) : (n.value = k?.retrieval?.analysis?.status === "unavailable" ? k.retrieval.analysis : null, p.value = k?.error || "ask failed");
    } catch (k) {
      const N = k?.response?.data;
      n.value = N?.retrieval?.analysis?.status === "unavailable" ? N.retrieval.analysis : null, p.value = N?.error || k?.message || "ask error", ce.handleError(k?.response?.status === 401 ? "auth-expired" : "other", k);
    } finally {
      s.value = !1;
    }
  }
  function u(g = 300) {
    if (E && clearTimeout(E), !o.value.trim()) {
      t.value = [], _.value = !1;
      return;
    }
    E = setTimeout(() => m(), g);
  }
  return be(() => {
    E && clearTimeout(E);
  }), { query: o, results: t, answer: a, analysisUnavailable: n, loading: s, error: p, performed: _, run: m, ask: O, runDebounced: u, clear: b };
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
}, Ft = {
  key: 2,
  class: "kc-search-err"
}, Nt = {
  key: 3,
  class: "kc-search-skel"
}, Dt = {
  key: 0,
  class: "kc-ans"
}, Bt = { class: "kc-ans-h" }, Rt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, Vt = { class: "kc-search-results" }, qt = {
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
}, Zt = { class: "kc-search-zero-t" }, Eo = /* @__PURE__ */ W({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, a = o, { query: n, results: s, answer: p, analysisUnavailable: _, loading: E, error: b, performed: m, run: O, ask: u, runDebounced: g, clear: M } = ht(() => t.kbId), L = U("search"), k = U(!1), N = U(""), D = z(() => t.ask && !_.value), q = z(() => t.layout === "panel" && D.value && L.value === "ask"), j = z(() => E.value ? "tabler:hourglass" : q.value ? "tabler:sparkles" : "tabler:arrow-right"), H = z(() => s.value[0]), oe = z(() => q.value ? s.value.slice(1) : s.value), se = z(() => t.layout === "rail" && k.value && n.value.trim() !== "" && (E.value || m.value || !!b.value));
    function Z() {
      n.value.trim() && (N.value = n.value.trim(), q.value ? u(8) : O(20));
    }
    function ee() {
      t.layout === "rail" && g(300);
    }
    function K(Q) {
      L.value = Q, m.value && n.value.trim() && Z();
    }
    function J(Q) {
      a("open", Q), t.layout === "rail" && (M(), k.value = !1);
    }
    return (Q, y) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: y[2] || (y[2] = (x) => k.value = !0),
      onFocusout: y[3] || (y[3] = (x) => k.value = !1)
    }, [
      $(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          y[0] || (y[0] = (x) => Se(n) ? n.value = x : null),
          ee
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: y[1] || (y[1] = (x) => l(O)(20)),
        onClear: l(M)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      se.value ? (c(), d("div", _t, [
        l(_) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + w(l(_).model) + ".", 1)) : I("", !0),
        l(b) ? (c(), d("div", kt, [
          $(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, w(l(b)), 1)
        ])) : l(s).length ? (c(), d("div", yt, [
          (c(!0), d(te, null, ne(l(s), (x) => (c(), d("button", {
            key: x.id,
            class: "kc-search-hit",
            onMousedown: ke((le) => J(x), ["prevent"])
          }, [
            r("span", xt, [
              l(pe)(x) ? (c(), d("span", wt, [
                $(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(w(l(pe)(x)), 1)
              ])) : I("", !0),
              r("span", $t, w(x.node_type || "result"), 1),
              x.similarity != null ? (c(), d("span", St, w(l($e)(x.similarity)), 1)) : I("", !0)
            ]),
            r("span", Ct, w(l(we)(x.content, 160)), 1)
          ], 40, gt))), 128))
        ])) : l(m) && !l(E) ? (c(), d("div", Et, [
          $(l(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          y[9] || (y[9] = r("span", null, "No passages matched.", -1))
        ])) : l(E) ? (c(), d("div", Tt, [
          $(l(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          y[10] || (y[10] = r("span", null, "Searching…", -1))
        ])) : I("", !0)
      ])) : I("", !0)
    ], 32)) : (c(), d("div", Mt, [
      r("div", At, [
        D.value ? (c(), d("div", It, [
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "search" }]),
            onClick: y[4] || (y[4] = (x) => K("search"))
          }, [
            $(l(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            y[11] || (y[11] = R(" Search ", -1))
          ], 2),
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: y[5] || (y[5] = (x) => K("ask"))
          }, [
            $(l(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            y[12] || (y[12] = R(" Ask ", -1))
          ], 2)
        ])) : I("", !0),
        r("div", Ot, [
          $(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": y[6] || (y[6] = (x) => Se(n) ? n.value = x : null),
            placeholder: q.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Z
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        $(he, {
          icon: j.value,
          label: q.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(E),
          disabled: !l(n).trim() || l(E),
          onClick: Z
        }, null, 8, ["icon", "label", "active", "disabled"]),
        $(he, {
          icon: "tabler:x",
          label: "Close search",
          onClick: y[7] || (y[7] = (x) => a("close"))
        })
      ]),
      t.ask ? I("", !0) : (c(), d("p", Ut, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(_) ? (c(), d("p", Lt, "Showing direct matches. No model is assigned to " + w(l(_).model) + ".", 1)) : I("", !0),
      l(b) ? (c(), d("div", Ft, [
        $(l(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, w(l(b)), 1)
      ])) : I("", !0),
      l(E) ? (c(), d("div", Nt, [
        (c(), d(te, null, ne(3, (x) => r("div", {
          key: x,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(s).length ? (c(), d(te, { key: 4 }, [
        q.value ? (c(), d("div", Dt, [
          r("div", Bt, [
            $(l(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            R(" " + w(l(p) ? "Answer" : "Best match") + ' for "' + w(N.value) + '"', 1)
          ]),
          r("p", Rt, w(l(p) || l(we)(H.value?.content, 700)), 1),
          H.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: y[8] || (y[8] = (x) => J(H.value))
          }, [
            $(l(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            y[13] || (y[13] = R(" Open source document ", -1)),
            H.value?.similarity != null ? (c(), d("span", Pt, w(l($e)(H.value?.similarity)), 1)) : I("", !0)
          ])) : I("", !0)
        ])) : I("", !0),
        r("div", Vt, [
          q.value && oe.value.length ? (c(), d("div", qt, "Sources")) : I("", !0),
          (c(!0), d(te, null, ne(oe.value, (x) => (c(), d("button", {
            key: x.id,
            class: V(["kc-search-result", { link: !!x.parent_id }]),
            onClick: (le) => J(x)
          }, [
            r("div", jt, [
              l(pe)(x) ? (c(), d("span", Kt, [
                $(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(w(l(pe)(x)), 1)
              ])) : I("", !0),
              r("span", Gt, w(x.node_type || "passage"), 1),
              x.llm_score != null ? (c(), d("span", Wt, "Relevance " + w(Math.round(x.llm_score)), 1)) : I("", !0),
              x.similarity != null ? (c(), d("span", Ht, w(l($e)(x.similarity)), 1)) : I("", !0)
            ]),
            r("p", Xt, w(l(we)(x.content, 360)), 1),
            x.parent_id ? (c(), d("span", Jt, [
              $(l(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              y[14] || (y[14] = R(" Open document", -1))
            ])) : I("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : l(m) ? (c(), d("div", Qt, [
        $(l(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        y[15] || (y[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        y[16] || (y[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Yt, [
        $(l(C), {
          icon: q.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Zt, w(q.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), en = ["aria-label"], tn = { class: "kc-orig-h" }, nn = { class: "kc-orig-title" }, on = { class: "kc-orig-title-t" }, sn = { class: "kc-orig-b" }, an = ["content-type", "source-url", "filename"], To = /* @__PURE__ */ W({
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
    function _(u) {
      u.key === "Escape" && a("close");
    }
    function E() {
      t.open && !document.fullscreenElement && a("close");
    }
    ue(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", _), Ve(s)) : (window.removeEventListener("keydown", _), p());
    });
    const b = U(""), m = U("");
    async function O() {
      if (b.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await Y.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (b.value = u.url, m.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return ue(() => [t.open, t.sourceUrl], O, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", E);
    }), be(() => {
      document.removeEventListener("fullscreenchange", E), window.removeEventListener("keydown", _), p();
    }), (u, g) => (c(), _e(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: V(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: g[1] || (g[1] = ke((M) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", tn, [
              r("span", nn, [
                $(l(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", on, w(e.title), 1)
              ]),
              $(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: g[0] || (g[0] = (M) => a("close"))
              })
            ]),
            r("div", sn, [
              b.value ? (c(), d("wc-resource-view", {
                key: b.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": b.value,
                filename: e.filename
              }, null, 8, an)) : I("", !0)
            ])
          ], 8, en)
        ], 2)) : I("", !0)
      ]),
      _: 1
    }));
  }
}), Mo = /* @__PURE__ */ W({
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
      $(l(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, w(e.label || "View original"), 1)
    ]));
  }
}), ln = { class: "kc-docsum" }, rn = { class: "kc-docsum-h" }, Ao = /* @__PURE__ */ W({
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
        $(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        R(" " + w(e.label), 1)
      ]),
      r("p", {
        class: V(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, w(e.text), 3),
      a.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (p) => t.value = !t.value)
      }, w(t.value ? "Show less" : "Show more"), 1)) : I("", !0)
    ]));
  }
}), cn = { class: "kx-empty kx-empty-spacious" }, un = { class: "kx-empty-title" }, dn = {
  key: 0,
  class: "kx-empty-sub"
}, Io = /* @__PURE__ */ W({
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
        class: V(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        $(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", un, w(e.title), 1),
      e.hint ? (c(), d("div", dn, w(e.hint), 1)) : I("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), _e(l(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        R(" " + w(e.cta), 1)
      ])) : I("", !0)
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
]), Fe = /* @__PURE__ */ new Set([
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
]), Ne = /* @__PURE__ */ new Set([
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
  ...Array.from(Fe)
].map((e) => `.${e}`), fn = [
  ...pn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Ne)
].join(","), mn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function vn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function hn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Ne.has(o) || De.has(o)) return !0;
  const t = vn(e.name);
  return Le.has(t) || Fe.has(t);
}
const re = ["uploading", "processing"];
function _n(e, o) {
  const t = U([]), a = U(!1), n = U(""), s = U("");
  let p = 0;
  const _ = (i) => `${i}${++p}`, E = z(() => a.value || t.value.some((i) => re.includes(i.status)));
  function b() {
    n.value = "", s.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => re.includes(i.status));
  }
  function O(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function u(i, f) {
    t.value = t.value.map((h) => h.key === i ? { ...h, ...f } : h);
  }
  const g = [];
  function M() {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) g.push(setTimeout(() => o(), i));
  }
  function L() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), M();
  }
  function k(i) {
    const f = t.value.find((h) => h.key === i);
    !f || f.status === "done" || (u(i, { status: "done" }), L());
  }
  function N(i, f) {
    t.value = [...t.value, { key: _("q"), name: i, uuid: f, status: "done" }], L();
  }
  const D = /* @__PURE__ */ new Map(), q = [];
  function j(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function H(i) {
    const f = j(i) ? i : {};
    return String(f.topic || "");
  }
  function oe(i) {
    const f = j(i) ? i : {}, h = [
      f,
      j(f.data) ? f.data : null,
      j(f.payload) ? f.payload : null,
      j(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const A of h)
      if (typeof A.uuid == "string" && typeof A.status == "string") return A;
    return {};
  }
  function se(i, f, h) {
    const A = t.value.find((F) => F.uuid === i && re.includes(F.status));
    if (!A) return;
    const B = String(f || "");
    B === "error" || B === "failed" ? u(A.key, { status: "error", error: String(h || "File processing failed") }) : B === "completed" ? k(A.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(A.key, { status: "processing" });
  }
  function Z(i, f) {
    const h = oe(f);
    h.uuid === i && se(i, h.status, h.error);
  }
  function ee(i) {
    const f = `upload:${i}`;
    if (D.has(f)) return;
    const h = Oe("@message", (A) => {
      H(A) === f && Z(i, A);
    });
    typeof h == "function" && D.set(f, h);
  }
  async function K(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && re.includes(f.status))))
      try {
        const { data: f } = await Y.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = j(f?.upload) ? f.upload : j(f) ? f : {};
        se(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function J(i) {
    K(i);
    for (const f of [1500, 5e3, 15e3])
      q.push(setTimeout(() => {
        K(i);
      }, f));
  }
  function Q(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const h = String(f.last_error || "Embedding failed");
      for (const A of t.value) re.includes(A.status) && u(A.key, { status: "error", error: h });
      s.value = h;
    }
  }
  let y = null, x = 0;
  function le(i) {
    const f = ++x;
    if (y && (y(), y = null), !i) return;
    const h = nt(i, Q);
    if (f !== x) {
      h && h();
      return;
    }
    y = h;
  }
  ue(() => e(), (i) => {
    le(i);
  }, { immediate: !0 }), be(() => {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of q.splice(0)) clearTimeout(i);
    x++, y && y();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ye(i, f, h) {
    try {
      const { data: A } = await Y.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!A?.success || !A.upload_token) {
        u(i, { status: "error", error: A?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", f), B.append("upload_token", A.upload_token);
      const { data: F } = await Y.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (F?.success && F.uuid) {
        const G = String(F.uuid);
        u(i, { uuid: G, externalId: `upload:${G}`, status: "processing" }), ee(G), J(G);
      } else
        u(i, { status: "error", error: F?.error || "Upload failed" });
    } catch (A) {
      u(i, { status: "error", error: A?.response?.data?.error || A?.message || "Upload error" }), ce.handleError(A?.response?.status === 401 ? "auth-expired" : "other", A);
    }
  }
  function T(i) {
    const f = e();
    if (f) {
      b();
      for (const h of Array.from(i)) {
        if (!hn(h)) {
          s.value = mn;
          continue;
        }
        const A = _("f");
        t.value = [...t.value, { key: A, name: h.name, status: "uploading" }], ye(A, h, f);
      }
    }
  }
  function v(i) {
    T([i]);
  }
  async function S(i = 100, f = 0) {
    const { data: h } = await Y.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), B = (Array.isArray(h?.uploads) ? h.uploads : []).map((F) => ({
      uuid: String(F.uuid),
      filename: String(F.filename || F.meta && F.meta.filename || F.uuid),
      mime_type: F.mime_type,
      size: F.size,
      status: F.status,
      created_at: F.created_at
    }));
    return { uploads: B, total: Number(h?.meta?.total ?? B.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      b(), a.value = !0;
      try {
        const { data: h } = await Y.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((G) => G.uuid)
        }), A = Array.isArray(h?.results) ? h.results : [], B = (G) => i.find((Re) => Re.uuid === G)?.name || G;
        let F = !1;
        for (const G of A)
          G?.success && (F = !0, N(B(String(G.upload_id)), String(G.upload_id)));
        F || (s.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        s.value = h?.response?.data?.error || h?.message || "Ingest error", ce.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(i, f, h) {
    const A = e();
    if (!(!i.trim() || !A)) {
      b(), a.value = !0;
      try {
        const B = f.trim() ? { title: f.trim() } : void 0, { data: F } = await Y.post(`/api/v1/knowledge/${A}/ingest`, { content: i, content_type: h, metadata: B });
        F?.success ? N(f.trim() || "Pasted text") : s.value = F?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", ce.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: E,
    okMsg: z(() => n.value),
    errMsg: z(() => s.value),
    reset: b,
    clearItems: m,
    removeItem: O,
    uploadFile: v,
    uploadFiles: T,
    listMyUploads: S,
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
}, In = ["aria-pressed", "onClick"], On = { class: "ap-upload-main" }, Un = { class: "ap-upload-name" }, Ln = { class: "ap-upload-meta" }, Fn = {
  key: 0,
  class: "mono"
}, Nn = { key: 1 }, Dn = {
  key: 3,
  class: "ap-pane"
}, Bn = { class: "ap-form" }, Rn = { class: "ap-grid2" }, Pn = { class: "ap-field" }, Vn = ["placeholder"], qn = { class: "ap-field" }, zn = { class: "ap-field" }, jn = { class: "ap-label-row" }, Kn = {
  key: 0,
  class: "ap-count"
}, Gn = ["placeholder"], Wn = { class: "ap-actions" }, Hn = { class: "ap-hint" }, Xn = ["disabled"], Jn = {
  key: 4,
  class: "ap-items"
}, Qn = { class: "ap-items-h" }, Yn = { class: "ap-items-list" }, Zn = { class: "ap-item-name" }, eo = { class: "ap-item-status" }, Oo = /* @__PURE__ */ W({
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
    ], _ = z(() => t.noun || "content");
    function E(T) {
      n.reset(), s.value = T, T === "uploads" && H();
    }
    const b = U(null), m = U(!1);
    function O() {
      b.value?.click();
    }
    function u(T) {
      const v = T.target.files;
      v?.length && n.uploadFiles(v), b.value && (b.value.value = "");
    }
    function g(T) {
      T.preventDefault(), m.value = !1;
      const v = T.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const M = U([]), L = U(!1), k = U(""), N = U(""), D = U({}), q = z(() => {
      const T = N.value.trim().toLowerCase();
      return T ? M.value.filter((v) => v.filename.toLowerCase().includes(T)) : M.value;
    }), j = z(() => Object.values(D.value).filter(Boolean).length);
    async function H() {
      L.value = !0, k.value = "";
      try {
        const { uploads: T } = await n.listMyUploads(200, 0);
        M.value = T;
      } catch (T) {
        k.value = T?.message || "Could not load your uploads";
      } finally {
        L.value = !1;
      }
    }
    function oe(T) {
      D.value = { ...D.value, [T]: !D.value[T] };
    }
    async function se() {
      const T = M.value.filter((v) => D.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      T.length && (await n.ingestExistingUploads(T), n.errMsg.value || (D.value = {}));
    }
    function Z(T) {
      return !T || T <= 0 ? "" : T < 1024 ? `${T} B` : T < 1024 * 1024 ? `${(T / 1024).toFixed(0)} KB` : `${(T / 1024 / 1024).toFixed(1)} MB`;
    }
    const ee = U(""), K = U(""), J = U("text/plain"), Q = z(() => K.value.length);
    async function y() {
      K.value.trim() && (await n.ingestText(K.value, ee.value, J.value), n.errMsg.value || (K.value = "", ee.value = ""));
    }
    const x = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function le(T) {
      return T === "done" ? "tabler:circle-check" : T === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ye = z(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && H();
    }), ue(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (T, v) => (c(), d("div", bn, [
      r("div", kn, [
        (c(), d(te, null, ne(p, (S) => r("button", {
          key: S.id,
          class: V(["ap-mode", { on: s.value === S.id }]),
          role: "tab",
          "aria-selected": s.value === S.id,
          onClick: (ge) => E(S.id)
        }, [
          $(l(C), {
            icon: S.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, w(S.label), 1)
        ], 10, yn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", gn, [
        $(l(C), { icon: "tabler:alert-circle" }),
        R(w(l(n).errMsg.value), 1)
      ])) : I("", !0),
      s.value === "file" ? (c(), d("section", xn, [
        r("input", {
          ref_key: "fileInput",
          ref: b,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(fn),
          onChange: u
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: V(["ap-drop", { over: m.value }]),
          onClick: O,
          onDragover: v[0] || (v[0] = ke((S) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (S) => m.value = !1),
          onDrop: g
        }, [
          $(l(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", $n, [
        r("div", Sn, [
          de(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (S) => N.value = S),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, N.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !j.value || l(n).busy.value,
            onClick: se
          }, [
            $(l(C), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: V(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            R(" " + w(j.value ? `Add ${j.value} selected` : "Add selected"), 1)
          ], 8, Cn)
        ]),
        L.value ? (c(), d("div", En, [
          $(l(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = R(" Loading your uploads…", -1))
        ])) : k.value ? (c(), d("div", Tn, [
          $(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          R(" " + w(k.value), 1)
        ])) : q.value.length ? (c(), d("ul", An, [
          (c(!0), d(te, null, ne(q.value, (S) => (c(), d("li", {
            key: S.uuid
          }, [
            r("button", {
              type: "button",
              class: V(["ap-upload", { on: D.value[S.uuid] }]),
              "aria-pressed": !!D.value[S.uuid],
              onClick: (ge) => oe(S.uuid)
            }, [
              $(l(C), {
                class: "ap-upload-check",
                icon: D.value[S.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $(l(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", On, [
                r("span", Un, w(S.filename), 1),
                r("span", Ln, [
                  S.mime_type ? (c(), d("span", Fn, w(S.mime_type), 1)) : I("", !0),
                  Z(S.size) ? (c(), d("span", Nn, w(Z(S.size)), 1)) : I("", !0)
                ])
              ])
            ], 10, In)
          ]))), 128))
        ])) : (c(), d("div", Mn, [
          $(l(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = R(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Dn, [
        r("div", Bn, [
          r("div", Rn, [
            r("div", Pn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                R("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              de(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (S) => ee.value = S),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${_.value} a title`,
                autocomplete: "off"
              }, null, 8, Vn), [
                [xe, ee.value]
              ])
            ]),
            r("div", qn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              de(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (S) => J.value = S),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [qe, J.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", jn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              Q.value ? (c(), d("span", Kn, w(Q.value.toLocaleString()) + " chars", 1)) : I("", !0)
            ]),
            de(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (S) => K.value = S),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${_.value} to add to this knowledge base…`
            }, null, 8, Gn), [
              [xe, K.value]
            ])
          ]),
          r("div", Wn, [
            r("span", Hn, [
              $(l(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = R(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !K.value.trim() || l(n).busy.value,
              onClick: y
            }, [
              $(l(C), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: V(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              R(" " + w(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Xn)
          ])
        ])
      ])),
      ye.value ? (c(), d("div", Jn, [
        r("div", Qn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? I("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = (S) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Yn, [
          (c(!0), d(te, null, ne(l(n).items.value, (S) => (c(), d("li", {
            key: S.key,
            class: V(["ap-item", S.status])
          }, [
            $(l(C), {
              class: V(["ap-item-ic", ["uploading", "processing", "embedding"].includes(S.status) && "spin"]),
              icon: le(S.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Zn, w(S.name), 1),
            r("span", eo, w(S.error || x[S.status]), 1)
          ], 2))), 128))
        ])
      ])) : I("", !0)
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
  ae as N,
  he as _,
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
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-iMf6E03m.js.map
