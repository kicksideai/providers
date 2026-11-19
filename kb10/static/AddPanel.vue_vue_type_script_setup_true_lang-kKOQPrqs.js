import { defineComponent as W, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as ve, normalizeClass as q, createVNode as g, unref as a, withKeys as qe, createCommentVNode as I, Fragment as Z, renderList as te, createBlock as be, createTextVNode as P, toDisplayString as _, watch as ue, onBeforeUnmount as _e, Transition as Me, withCtx as Ae, withModifiers as ke, ref as O, computed as z, isRef as xe, nextTick as Re, onMounted as Ie, withDirectives as de, vModelText as ge, vModelSelect as ze } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as J, host as ce } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function oo(e) {
  return Ue(e.metadata, e.id);
}
function pe(e) {
  return Ue(e.metadata, "");
}
function Se(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function le(e) {
  return typeof e == "string" ? e.trim() : "";
}
function so(e) {
  const o = Se(e.metadata), t = { ...Se(o.source_ref) };
  return delete t.thread_id, delete t.thread_event_id, delete t.thread_event_seq, delete t.external_version, {
    external_id: e.external_id || o.external_id || t.external_id || e.id,
    upload_id: le(t.upload_id) || le(o.upload_id) || void 0,
    source_url: le(t.source_url) || le(t.url) || le(o.source_url) || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id
    },
    source_ref: Object.keys(t).length ? t : void 0
  };
}
function we(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const Ve = /engine .*not installed|no .*engine|unavailable/i;
function ao(e) {
  return Ve.test(e || "");
}
const lo = "This knowledge base's engine is not installed; its contents are unavailable.", se = {
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
function io(e) {
  if (e.node_type === "document") return se.document;
  if (e.is_root) return se.root;
  const o = (e.concept_type || "").toLowerCase();
  return se[o] || se.topic;
}
const je = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, fe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function Ke(e) {
  return e < fe.length ? fe[e] : Math.round((fe[0] + (e - fe.length + 1) * 137.508) % 360);
}
function me(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Ce = 34, Ee = 88, Ge = 78, We = 38;
function ro(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), l = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && l.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const S = /* @__PURE__ */ new Set();
    let A = u, N = 0;
    for (; !S.has(A); ) {
      S.add(A);
      const L = l.get(A);
      if (L === void 0 || n(L)) return { branch: A, depth: N };
      A = L, N++;
    }
    return { branch: A, depth: N };
  }
  const f = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const S = s(u.id);
    f.set(u.id, S), k.set(S.branch, Math.max(k.get(S.branch) ?? 0, S.depth));
  }
  const U = [...new Set([...f.values()].map((u) => u.branch))].sort((u, S) => (t.get(u)?.label || "").localeCompare(t.get(S)?.label || "")), w = /* @__PURE__ */ new Map();
  U.forEach((u, S) => w.set(u, Ke(S)));
  const m = (u, S, A) => u + (S - u) * A, T = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      T.set(u.id, { ...se.root });
      continue;
    }
    const S = f.get(u.id);
    if (!S) {
      T.set(u.id, { ...se.topic });
      continue;
    }
    const A = w.get(S.branch) ?? 220, N = Math.min(Math.max(k.get(S.branch) ?? 0, 1), 4), L = Math.min(1, S.depth / N);
    if (u.node_type === "document") {
      const b = Math.min(84, m(Ce, Ee, L) + 6);
      T.set(u.id, { fill: me(A, 32, b), stroke: me(A, 32, Math.max(50, b - 14)) });
    } else {
      const b = m(Ce, Ee, L), D = m(Ge, We, L);
      T.set(u.id, { fill: me(A, D, b), stroke: me(A, D, Math.max(28, b - 17)) });
    }
  }
  return T;
}
const He = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function co(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of o) {
    if (!He.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const T = l.get(m.to_node_id) || [];
    T.push(m.from_node_id), l.set(m.to_node_id, T), n.add(m.from_node_id);
  }
  const s = (m, T) => (t.get(m)?.label || "").localeCompare(t.get(T)?.label || "");
  function f(m, T, u) {
    const S = t.get(m);
    if (!S || u.has(m)) return null;
    u.add(m);
    const A = (l.get(m) || []).slice().sort(s), N = [];
    for (const L of A) {
      const b = f(L, T + 1, u);
      b && N.push(b);
    }
    return { concept: S, children: N, depth: T };
  }
  const k = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(s), U = /* @__PURE__ */ new Set(), w = [];
  for (const m of k) {
    const T = f(m, 0, U);
    T && w.push(T);
  }
  for (const m of e)
    if (!U.has(m.id)) {
      const T = f(m.id, 0, U);
      T && w.push(T);
    }
  return w;
}
function uo(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), l = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const f of n.children) l(f, n.concept.id);
  };
  for (const n of e) l(n, null);
  return { byId: o, parentOf: t };
}
function po(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, l) => t.isFolder !== l.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(l.concept.label || l.concept.id)) : [];
}
function Xe(e, o, t) {
  const l = [], n = /* @__PURE__ */ new Set();
  let s = e;
  for (; s && !n.has(s); ) {
    n.add(s);
    const f = o.get(s);
    if (!f) break;
    l.unshift(f.concept), s = t.get(s);
  }
  return l;
}
function fo(e, o, t) {
  const l = e.trim().toLowerCase();
  if (!l) return [];
  const n = [];
  for (const s of o.values()) {
    if (!(s.concept.label || s.concept.id).toLowerCase().includes(l)) continue;
    const k = Xe(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: k.slice(0, -1) });
  }
  return n.sort((s, f) => s.isFolder !== f.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(f.concept.label || f.concept.id)).slice(0, 200);
}
function mo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const Je = {
  technology: "tabler:cpu",
  person: "tabler:user",
  organization: "tabler:building",
  location: "tabler:map-pin",
  event: "tabler:calendar-event",
  process: "tabler:route",
  product: "tabler:package",
  topic: "tabler:bookmark"
};
function vo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Je[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function Qe(e, o) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !l.has(n.from_node_id) && (l.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function ho(e, o) {
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.from_node_id === e && !l.has(n.to_node_id) && (l.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function bo(e, o, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set();
  for (const s of o) {
    if (s.edge_type !== "subtopic_of" || s.to_node_id !== e.id || n.has(s.from_node_id)) continue;
    const f = t.get(s.from_node_id);
    f && (n.add(s.from_node_id), l.push(f));
  }
  return l.sort((s, f) => (s.label || "").localeCompare(f.label || ""));
}
function _o(e, o, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set(), s = new Set(Qe(e, o));
  for (const f of o) {
    if (f.edge_type === "subtopic_of" || f.edge_type === "categorized_as") continue;
    let k = "";
    if (f.from_node_id === e.id) k = f.to_node_id;
    else if (f.to_node_id === e.id) k = f.from_node_id;
    else continue;
    if (!k || n.has(k) || s.has(k)) continue;
    const U = t.get(k);
    U && (n.add(k), l.push({ concept: U, label: je[f.edge_type || ""] || f.edge_type || "related" }));
  }
  return l;
}
function ko(e, o) {
  let t = 0;
  for (const l of o)
    l.edge_type === "subtopic_of" && l.to_node_id === e && t++;
  return t;
}
const Ye = ["image/", "audio/", "video/"], Ze = /* @__PURE__ */ new Set([
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
function yo(e) {
  const o = (e || "").toLowerCase();
  return Ye.some((t) => o.startsWith(t)) || Ze.has(o);
}
function go(e) {
  const o = e || {}, t = o.source_ref && typeof o.source_ref == "object" ? o.source_ref : {}, l = t.upload_id || o.upload_id;
  if (typeof l == "string" && l.trim()) return l.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof o.external_id == "string" && o.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function et(e, o) {
  if (!o) return null;
  const t = ie(e) ? e : {}, l = [
    t,
    ie(t.data) ? t.data : null,
    ie(t.payload) ? t.payload : null,
    ie(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of l) {
    if (n.event !== "component.meta.changed") continue;
    const s = String(n.component_id || ""), f = String(t.topic || n.topic || "");
    if (!(s && s !== o) && !(!s && f !== `component.${o}`))
      return {
        event: "component.meta.changed",
        component_id: s || o,
        meta: ie(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function tt(e, o) {
  if (!e) return null;
  const t = Oe(`component.${e}`, (l) => {
    const n = et(l, e);
    n && o(n);
  });
  return typeof t == "function" ? t : null;
}
function wo(e) {
  if (typeof e != "object" || !e) return "";
  const { count: o, truncated: t } = e;
  if (typeof o != "number" || !Number.isSafeInteger(o) || o < 0) return "";
  if (o === 0) return t === !0 ? "Indexing — waiting count unknown" : "";
  const l = o > 100 || t === !0;
  return `Indexing — ${`${Math.min(o, 100)}${l ? "+" : ""}`} ${o === 1 && !l ? "change" : "changes"} waiting`;
}
const nt = { class: "kx-shell" }, ot = { class: "kx-rail" }, st = { class: "kx-main" }, $o = /* @__PURE__ */ W({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", nt, [
      r("aside", ot, [
        ve(o.$slots, "rail")
      ]),
      r("main", st, [
        ve(o.$slots, "default")
      ])
    ]));
  }
}), at = ["aria-label", "title", "disabled"], he = /* @__PURE__ */ W({
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
    return (l, n) => (c(), d("button", {
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
      g(a(C), {
        icon: e.icon,
        class: q(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, at));
  }
}), lt = { class: "kx-search" }, it = ["value", "placeholder"], Te = /* @__PURE__ */ W({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", lt, [
      g(a(C), {
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
        onKeyup: n[1] || (n[1] = qe((s) => t("enter"), ["enter"]))
      }, null, 40, it),
      e.modelValue ? (c(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (s) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        g(a(C), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : I("", !0)
    ]));
  }
}), rt = {
  class: "tb",
  role: "tablist"
}, ct = ["aria-selected", "onClick"], ut = {
  key: 1,
  class: "kx-count"
}, xo = /* @__PURE__ */ W({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", rt, [
      (c(!0), d(Z, null, te(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: q(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (f) => t("select", s.id)
      }, [
        s.icon ? (c(), be(a(C), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        P(" " + _(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", ut, _(s.count), 1)) : I("", !0)
      ], 10, ct))), 128))
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
    return (l, n) => (c(), d("div", {
      class: q(["kx-notice", e.tone])
    }, [
      g(a(C), {
        icon: a(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ve(l.$slots, "default")
      ])
    ], 2));
  }
}), dt = ["aria-label"], pt = { class: "kx-drawer-h" }, ft = { class: "kx-drawer-title" }, mt = { class: "kx-drawer-b" }, Co = /* @__PURE__ */ W({
  __name: "KbDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: o }) {
    const t = e, l = o;
    function n(s) {
      s.key === "Escape" && l("close");
    }
    return ue(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), _e(() => window.removeEventListener("keydown", n)), (s, f) => (c(), be(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: f[1] || (f[1] = ke((k) => l("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", pt, [
              r("span", ft, [
                g(a(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(_(e.title), 1)
              ]),
              g(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: f[0] || (f[0] = (k) => l("close"))
              })
            ]),
            r("div", mt, [
              ve(s.$slots, "default")
            ])
          ], 8, dt)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
});
function vt(e) {
  const o = O(""), t = O([]), l = O(""), n = O(""), s = O(null), f = O(!1), k = O(""), U = O(!1);
  let w = null;
  function m() {
    w && (clearTimeout(w), w = null), o.value = "", t.value = [], l.value = "", n.value = "", s.value = null, U.value = !1, k.value = "";
  }
  async function T(A = 20) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], U.value = !1;
      return;
    }
    f.value = !0, k.value = "", s.value = null, n.value = "", U.value = !0;
    try {
      const { data: b } = await J.get(`/api/v1/kb10/${N}/search?q=${encodeURIComponent(L)}&limit=${A}`);
      b?.success ? (t.value = b.results || [], l.value = "", s.value = b.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null) : k.value = b?.error || "search failed";
    } catch (b) {
      k.value = b?.response?.data?.error || b?.message || "search error", ce.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      f.value = !1;
    }
  }
  async function u(A = 8) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], l.value = "", U.value = !1;
      return;
    }
    f.value = !0, k.value = "", s.value = null, l.value = "", n.value = "", U.value = !0;
    try {
      const { data: b } = await J.post(`/api/v1/knowledge/${N}/ask`, { query: L, limit: A });
      b?.success ? (t.value = b.results || [], b.mode === "query" ? n.value = b.answer : l.value = String(b.answer || "")) : k.value = b?.error || "ask failed";
    } catch (b) {
      const D = b?.response?.data;
      k.value = D?.error || b?.message || "ask error", ce.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      f.value = !1;
    }
  }
  function S(A = 300) {
    if (w && clearTimeout(w), !o.value.trim()) {
      t.value = [], U.value = !1;
      return;
    }
    w = setTimeout(() => T(), A);
  }
  return _e(() => {
    w && clearTimeout(w);
  }), { query: o, results: t, answer: l, queryNotice: n, analysisUnavailable: s, loading: f, error: k, performed: U, run: T, ask: u, runDebounced: S, clear: m };
}
function $e(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const ht = {
  key: 0,
  class: "kc-search-pop"
}, bt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, _t = {
  key: 1,
  class: "kc-search-state err"
}, kt = {
  key: 2,
  class: "kc-search-hits"
}, yt = ["onMousedown"], gt = { class: "kc-search-hit-h" }, wt = {
  key: 0,
  class: "kc-search-r-doc"
}, $t = { class: "kc-search-hit-kind" }, xt = {
  key: 1,
  class: "kc-search-hit-score"
}, St = { class: "kc-search-hit-body" }, Ct = {
  key: 3,
  class: "kc-search-state"
}, Et = {
  key: 4,
  class: "kc-search-state"
}, Tt = {
  key: 1,
  class: "kc-search-panel"
}, Mt = { class: "kc-search-bar" }, At = {
  key: 0,
  class: "kc-search-modes"
}, It = { class: "kc-search-field" }, Ot = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Ut = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Lt = {
  key: 2,
  class: "kc-search-err"
}, Nt = {
  key: 3,
  class: "kc-search-skel"
}, Ft = {
  key: 0,
  class: "kc-ans"
}, Dt = { class: "kc-ans-h" }, Bt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, qt = { class: "kc-search-results" }, Rt = {
  key: 0,
  class: "kc-search-results-h"
}, zt = ["onClick"], Vt = { class: "kc-search-r-h" }, jt = {
  key: 0,
  class: "kc-search-r-doc"
}, Kt = { class: "kc-search-hit-kind" }, Gt = {
  key: 1,
  class: "kc-search-r-llm"
}, Wt = {
  key: 2,
  class: "kc-search-hit-score"
}, Ht = { class: "kc-search-r-body" }, Xt = {
  key: 0,
  class: "kc-search-r-open"
}, Jt = {
  key: 5,
  class: "kc-search-zero"
}, Qt = {
  key: 6,
  class: "kc-search-zero"
}, Yt = { class: "kc-search-zero-t" }, Eo = /* @__PURE__ */ W({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, l = o, { query: n, results: s, answer: f, queryNotice: k, analysisUnavailable: U, loading: w, error: m, performed: T, run: u, ask: S, runDebounced: A, clear: N } = vt(() => t.kbId), L = O("search"), b = O(!1), D = O(""), V = z(() => t.layout === "panel" && t.ask && L.value === "ask"), R = z(() => V.value && !k.value), ne = z(() => w.value ? "tabler:hourglass" : V.value ? "tabler:sparkles" : "tabler:arrow-right"), X = z(() => s.value[0]), ee = z(() => R.value ? s.value.slice(1) : s.value), oe = z(() => t.layout === "rail" && b.value && n.value.trim() !== "" && (w.value || T.value || !!m.value));
    function H() {
      n.value.trim() && (D.value = n.value.trim(), V.value ? S(8) : u(20));
    }
    function G() {
      t.layout === "rail" && A(300);
    }
    function Q(j) {
      L.value = j, T.value && n.value.trim() && H();
    }
    function Y(j) {
      l("open", j), t.layout === "rail" && (N(), b.value = !1);
    }
    return (j, y) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: y[2] || (y[2] = ($) => b.value = !0),
      onFocusout: y[3] || (y[3] = ($) => b.value = !1)
    }, [
      g(Te, {
        modelValue: a(n),
        "onUpdate:modelValue": [
          y[0] || (y[0] = ($) => xe(n) ? n.value = $ : null),
          G
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: y[1] || (y[1] = ($) => a(u)(20)),
        onClear: a(N)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      oe.value ? (c(), d("div", ht, [
        a(U) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + _(a(U).model) + ".", 1)) : I("", !0),
        a(m) ? (c(), d("div", _t, [
          g(a(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, _(a(m)), 1)
        ])) : a(s).length ? (c(), d("div", kt, [
          (c(!0), d(Z, null, te(a(s), ($) => (c(), d("button", {
            key: $.id,
            class: "kc-search-hit",
            onMousedown: ke((ae) => Y($), ["prevent"])
          }, [
            r("span", gt, [
              a(pe)($) ? (c(), d("span", wt, [
                g(a(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(_(a(pe)($)), 1)
              ])) : I("", !0),
              r("span", $t, _($.node_type || "result"), 1),
              $.similarity != null ? (c(), d("span", xt, _(a($e)($.similarity)), 1)) : I("", !0)
            ]),
            r("span", St, _(a(we)($.content, 160)), 1)
          ], 40, yt))), 128))
        ])) : a(T) && !a(w) ? (c(), d("div", Ct, [
          g(a(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          y[9] || (y[9] = r("span", null, "No passages matched.", -1))
        ])) : a(w) ? (c(), d("div", Et, [
          g(a(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          y[10] || (y[10] = r("span", null, "Searching…", -1))
        ])) : I("", !0)
      ])) : I("", !0)
    ], 32)) : (c(), d("div", Tt, [
      r("div", Mt, [
        e.ask ? (c(), d("div", At, [
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "search" }]),
            onClick: y[4] || (y[4] = ($) => Q("search"))
          }, [
            g(a(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            y[11] || (y[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: y[5] || (y[5] = ($) => Q("ask"))
          }, [
            g(a(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            y[12] || (y[12] = P(" Ask ", -1))
          ], 2)
        ])) : I("", !0),
        r("div", It, [
          g(Te, {
            modelValue: a(n),
            "onUpdate:modelValue": y[6] || (y[6] = ($) => xe(n) ? n.value = $ : null),
            placeholder: V.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: H
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        g(he, {
          icon: ne.value,
          label: V.value ? "Ask" : "Search",
          variant: "bordered",
          active: a(w),
          disabled: !a(n).trim() || a(w),
          onClick: H
        }, null, 8, ["icon", "label", "active", "disabled"]),
        g(he, {
          icon: "tabler:x",
          label: "Close search",
          onClick: y[7] || (y[7] = ($) => l("close"))
        })
      ]),
      a(U) ? (c(), d("p", Ot, "Showing direct matches. No model is assigned to " + _(a(U).model) + ".", 1)) : I("", !0),
      a(k) ? (c(), d("p", Ut, _(a(k)), 1)) : I("", !0),
      a(m) ? (c(), d("div", Lt, [
        g(a(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, _(a(m)), 1)
      ])) : a(w) ? (c(), d("div", Nt, [
        (c(), d(Z, null, te(3, ($) => r("div", {
          key: $,
          class: "kc-search-skel-row"
        })), 64))
      ])) : a(s).length ? (c(), d(Z, { key: 4 }, [
        R.value ? (c(), d("div", Ft, [
          r("div", Dt, [
            g(a(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + _(a(f) ? "Answer" : "Best match") + ' for "' + _(D.value) + '"', 1)
          ]),
          r("p", Bt, _(a(f) || a(we)(X.value?.content, 700)), 1),
          X.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: y[8] || (y[8] = ($) => Y(X.value))
          }, [
            g(a(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            y[13] || (y[13] = P(" Open source document ", -1)),
            X.value?.similarity != null ? (c(), d("span", Pt, _(a($e)(X.value?.similarity)), 1)) : I("", !0)
          ])) : I("", !0)
        ])) : I("", !0),
        r("div", qt, [
          R.value && ee.value.length ? (c(), d("div", Rt, "Sources")) : I("", !0),
          (c(!0), d(Z, null, te(ee.value, ($) => (c(), d("button", {
            key: $.id,
            class: q(["kc-search-result", { link: !!$.parent_id }]),
            onClick: (ae) => Y($)
          }, [
            r("div", Vt, [
              a(pe)($) ? (c(), d("span", jt, [
                g(a(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(_(a(pe)($)), 1)
              ])) : I("", !0),
              r("span", Kt, _($.node_type || "passage"), 1),
              $.llm_score != null ? (c(), d("span", Gt, "Relevance " + _(Math.round($.llm_score)), 1)) : I("", !0),
              $.similarity != null ? (c(), d("span", Wt, _(a($e)($.similarity)), 1)) : I("", !0)
            ]),
            r("p", Ht, _(a(we)($.content, 360)), 1),
            $.parent_id ? (c(), d("span", Xt, [
              g(a(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              y[14] || (y[14] = P(" Open document", -1))
            ])) : I("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : a(T) ? (c(), d("div", Jt, [
        g(a(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        y[15] || (y[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        y[16] || (y[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Qt, [
        g(a(C), {
          icon: V.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Yt, _(V.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), Zt = ["aria-label"], en = { class: "kc-orig-h" }, tn = { class: "kc-orig-title" }, nn = { class: "kc-orig-title-t" }, on = { class: "kc-orig-b" }, sn = ["content-type", "source-url", "filename"], To = /* @__PURE__ */ W({
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
    const t = e, l = o, n = O(null);
    function s() {
      if (t.contained) return;
      const u = n.value;
      u && u.requestFullscreen && !document.fullscreenElement && u.requestFullscreen().catch(() => {
      });
    }
    function f() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function k(u) {
      u.key === "Escape" && l("close");
    }
    function U() {
      t.open && !document.fullscreenElement && l("close");
    }
    ue(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", k), Re(s)) : (window.removeEventListener("keydown", k), f());
    });
    const w = O(""), m = O("");
    async function T() {
      if (w.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await J.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (w.value = u.url, m.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return ue(() => [t.open, t.sourceUrl], T, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", U);
    }), _e(() => {
      document.removeEventListener("fullscreenchange", U), window.removeEventListener("keydown", k), f();
    }), (u, S) => (c(), be(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: q(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: S[1] || (S[1] = ke((A) => l("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", en, [
              r("span", tn, [
                g(a(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", nn, _(e.title), 1)
              ]),
              g(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: S[0] || (S[0] = (A) => l("close"))
              })
            ]),
            r("div", on, [
              w.value ? (c(), d("wc-resource-view", {
                key: w.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": w.value,
                filename: e.filename
              }, null, 8, sn)) : I("", !0)
            ])
          ], 8, Zt)
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
    return (l, n) => (c(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (s) => t("open"))
    }, [
      g(a(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, _(e.label || "View original"), 1)
    ]));
  }
}), an = { class: "kc-docsum" }, ln = { class: "kc-docsum-h" }, Ao = /* @__PURE__ */ W({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = O(!1), l = z(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", an, [
      r("div", ln, [
        g(a(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + _(e.label), 1)
      ]),
      r("p", {
        class: q(["kc-docsum-b", { clamp: l.value && !t.value }])
      }, _(e.text), 3),
      l.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (f) => t.value = !t.value)
      }, _(t.value ? "Show less" : "Show more"), 1)) : I("", !0)
    ]));
  }
}), rn = { class: "kx-empty kx-empty-spacious" }, cn = { class: "kx-empty-title" }, un = {
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
    return (l, n) => (c(), d("div", rn, [
      r("div", {
        class: q(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        g(a(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", cn, _(e.title), 1),
      e.hint ? (c(), d("div", un, _(e.hint), 1)) : I("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), be(a(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        P(" " + _(e.cta), 1)
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
]), dn = [
  ...Array.from(Le),
  ...Array.from(Ne)
].map((e) => `.${e}`), pn = [
  ...dn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Fe)
].join(","), fn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function mn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function vn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Fe.has(o) || De.has(o)) return !0;
  const t = mn(e.name);
  return Le.has(t) || Ne.has(t);
}
const re = ["uploading", "processing"];
function hn(e, o) {
  const t = O([]), l = O(!1), n = O(""), s = O("");
  let f = 0;
  const k = (i) => `${i}${++f}`, U = z(() => l.value || t.value.some((i) => re.includes(i.status)));
  function w() {
    n.value = "", s.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => re.includes(i.status));
  }
  function T(i) {
    t.value = t.value.filter((p) => p.key !== i);
  }
  function u(i, p) {
    t.value = t.value.map((h) => h.key === i ? { ...h, ...p } : h);
  }
  const S = [];
  function A() {
    for (const i of S.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) S.push(setTimeout(() => o(), i));
  }
  function N() {
    const i = t.value.filter((p) => p.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), A();
  }
  function L(i) {
    const p = t.value.find((h) => h.key === i);
    !p || p.status === "done" || (u(i, { status: "done" }), N());
  }
  function b(i, p) {
    t.value = [...t.value, { key: k("q"), name: i, uuid: p, status: "done" }], N();
  }
  const D = /* @__PURE__ */ new Map(), V = [];
  function R(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function ne(i) {
    const p = R(i) ? i : {};
    return String(p.topic || "");
  }
  function X(i) {
    const p = R(i) ? i : {}, h = [
      p,
      R(p.data) ? p.data : null,
      R(p.payload) ? p.payload : null,
      R(p.detail) ? p.detail : null
    ].filter(Boolean);
    for (const M of h)
      if (typeof M.uuid == "string" && typeof M.status == "string") return M;
    return {};
  }
  function ee(i, p, h) {
    const M = t.value.find((F) => F.uuid === i && re.includes(F.status));
    if (!M) return;
    const B = String(p || "");
    B === "error" || B === "failed" ? u(M.key, { status: "error", error: String(h || "File processing failed") }) : B === "completed" ? L(M.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(M.key, { status: "processing" });
  }
  function oe(i, p) {
    const h = X(p);
    h.uuid === i && ee(i, h.status, h.error);
  }
  function H(i) {
    const p = `upload:${i}`;
    if (D.has(p)) return;
    const h = Oe("@message", (M) => {
      ne(M) === p && oe(i, M);
    });
    typeof h == "function" && D.set(p, h);
  }
  async function G(i) {
    if (!(!i || !t.value.some((p) => p.uuid === i && re.includes(p.status))))
      try {
        const { data: p } = await J.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = R(p?.upload) ? p.upload : R(p) ? p : {};
        ee(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function Q(i) {
    G(i);
    for (const p of [1500, 5e3, 15e3])
      V.push(setTimeout(() => {
        G(i);
      }, p));
  }
  function Y(i) {
    const p = i.meta || {};
    if (String(p.status || "") === "error") {
      const h = String(p.last_error || "Embedding failed");
      for (const M of t.value) re.includes(M.status) && u(M.key, { status: "error", error: h });
      s.value = h;
    }
  }
  let j = null, y = 0;
  function $(i) {
    const p = ++y;
    if (j && (j(), j = null), !i) return;
    const h = tt(i, Y);
    if (p !== y) {
      h && h();
      return;
    }
    j = h;
  }
  ue(() => e(), (i) => {
    $(i);
  }, { immediate: !0 }), _e(() => {
    for (const i of S.splice(0)) clearTimeout(i);
    for (const i of V.splice(0)) clearTimeout(i);
    y++, j && j();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ae(i, p, h) {
    try {
      const { data: M } = await J.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!M?.success || !M.upload_token) {
        u(i, { status: "error", error: M?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", p), B.append("upload_token", M.upload_token);
      const { data: F } = await J.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (F?.success && F.uuid) {
        const K = String(F.uuid);
        u(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), H(K), Q(K);
      } else
        u(i, { status: "error", error: F?.error || "Upload failed" });
    } catch (M) {
      u(i, { status: "error", error: M?.response?.data?.error || M?.message || "Upload error" }), ce.handleError(M?.response?.status === 401 ? "auth-expired" : "other", M);
    }
  }
  function E(i) {
    const p = e();
    if (p) {
      w();
      for (const h of Array.from(i)) {
        if (!vn(h)) {
          s.value = fn;
          continue;
        }
        const M = k("f");
        t.value = [...t.value, { key: M, name: h.name, status: "uploading" }], ae(M, h, p);
      }
    }
  }
  function v(i) {
    E([i]);
  }
  async function x(i = 100, p = 0) {
    const { data: h } = await J.get(`/api/v1/uploads/list?limit=${i}&offset=${p}`), B = (Array.isArray(h?.uploads) ? h.uploads : []).map((F) => ({
      uuid: String(F.uuid),
      filename: String(F.filename || F.meta && F.meta.filename || F.uuid),
      mime_type: F.mime_type,
      size: F.size,
      status: F.status,
      created_at: F.created_at
    }));
    return { uploads: B, total: Number(h?.meta?.total ?? B.length) };
  }
  async function ye(i) {
    const p = e();
    if (!(!p || !i.length)) {
      w(), l.value = !0;
      try {
        const { data: h } = await J.post(`/api/v1/knowledge/${p}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), M = Array.isArray(h?.results) ? h.results : [], B = (K) => i.find((Pe) => Pe.uuid === K)?.name || K;
        let F = !1;
        for (const K of M)
          K?.success && (F = !0, b(B(String(K.upload_id)), String(K.upload_id)));
        F || (s.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        s.value = h?.response?.data?.error || h?.message || "Ingest error", ce.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        l.value = !1;
      }
    }
  }
  async function Be(i, p, h) {
    const M = e();
    if (!(!i.trim() || !M)) {
      w(), l.value = !0;
      try {
        const B = p.trim() ? { title: p.trim() } : void 0, { data: F } = await J.post(`/api/v1/knowledge/${M}/ingest`, { content: i, content_type: h, metadata: B });
        F?.success ? b(p.trim() || "Pasted text") : s.value = F?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", ce.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        l.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: U,
    okMsg: z(() => n.value),
    errMsg: z(() => s.value),
    reset: w,
    clearItems: m,
    removeItem: T,
    uploadFile: v,
    uploadFiles: E,
    listMyUploads: x,
    ingestExistingUploads: ye,
    ingestText: Be
  };
}
const bn = { class: "ap" }, _n = {
  class: "ap-modes",
  role: "tablist"
}, kn = ["aria-selected", "onClick"], yn = {
  key: 0,
  class: "ap-msg err"
}, gn = {
  key: 1,
  class: "ap-pane"
}, wn = ["accept"], $n = {
  key: 2,
  class: "ap-pane"
}, xn = { class: "ap-uploads-bar" }, Sn = ["disabled"], Cn = {
  key: 0,
  class: "ap-uploads-state"
}, En = {
  key: 1,
  class: "ap-uploads-state err"
}, Tn = {
  key: 2,
  class: "ap-uploads-state"
}, Mn = {
  key: 3,
  class: "ap-uploads"
}, An = ["aria-pressed", "onClick"], In = { class: "ap-upload-main" }, On = { class: "ap-upload-name" }, Un = { class: "ap-upload-meta" }, Ln = {
  key: 0,
  class: "mono"
}, Nn = { key: 1 }, Fn = {
  key: 3,
  class: "ap-pane"
}, Dn = { class: "ap-form" }, Bn = { class: "ap-grid2" }, Pn = { class: "ap-field" }, qn = ["placeholder"], Rn = { class: "ap-field" }, zn = { class: "ap-field" }, Vn = { class: "ap-label-row" }, jn = {
  key: 0,
  class: "ap-count"
}, Kn = ["placeholder"], Gn = { class: "ap-actions" }, Wn = { class: "ap-hint" }, Hn = ["disabled"], Xn = {
  key: 4,
  class: "ap-items"
}, Jn = { class: "ap-items-h" }, Qn = { class: "ap-items-list" }, Yn = { class: "ap-item-name" }, Zn = { class: "ap-item-status" }, Oo = /* @__PURE__ */ W({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, l = o, n = hn(() => t.kbId, () => l("changed")), s = O("file"), f = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], k = z(() => t.noun || "content");
    function U(E) {
      n.reset(), s.value = E, E === "uploads" && ne();
    }
    const w = O(null), m = O(!1);
    function T() {
      w.value?.click();
    }
    function u(E) {
      const v = E.target.files;
      v?.length && n.uploadFiles(v), w.value && (w.value.value = "");
    }
    function S(E) {
      E.preventDefault(), m.value = !1;
      const v = E.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const A = O([]), N = O(!1), L = O(""), b = O(""), D = O({}), V = z(() => {
      const E = b.value.trim().toLowerCase();
      return E ? A.value.filter((v) => v.filename.toLowerCase().includes(E)) : A.value;
    }), R = z(() => Object.values(D.value).filter(Boolean).length);
    async function ne() {
      N.value = !0, L.value = "";
      try {
        const { uploads: E } = await n.listMyUploads(200, 0);
        A.value = E;
      } catch (E) {
        L.value = E?.message || "Could not load your uploads";
      } finally {
        N.value = !1;
      }
    }
    function X(E) {
      D.value = { ...D.value, [E]: !D.value[E] };
    }
    async function ee() {
      const E = A.value.filter((v) => D.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      E.length && (await n.ingestExistingUploads(E), n.errMsg.value || (D.value = {}));
    }
    function oe(E) {
      return !E || E <= 0 ? "" : E < 1024 ? `${E} B` : E < 1024 * 1024 ? `${(E / 1024).toFixed(0)} KB` : `${(E / 1024 / 1024).toFixed(1)} MB`;
    }
    const H = O(""), G = O(""), Q = O("text/plain"), Y = z(() => G.value.length);
    async function j() {
      G.value.trim() && (await n.ingestText(G.value, H.value, Q.value), n.errMsg.value || (G.value = "", H.value = ""));
    }
    const y = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function $(E) {
      return E === "done" ? "tabler:circle-check" : E === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ae = z(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && ne();
    }), ue(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (E, v) => (c(), d("div", bn, [
      r("div", _n, [
        (c(), d(Z, null, te(f, (x) => r("button", {
          key: x.id,
          class: q(["ap-mode", { on: s.value === x.id }]),
          role: "tab",
          "aria-selected": s.value === x.id,
          onClick: (ye) => U(x.id)
        }, [
          g(a(C), {
            icon: x.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, _(x.label), 1)
        ], 10, kn)), 64))
      ]),
      a(n).errMsg.value ? (c(), d("div", yn, [
        g(a(C), { icon: "tabler:alert-circle" }),
        P(_(a(n).errMsg.value), 1)
      ])) : I("", !0),
      s.value === "file" ? (c(), d("section", gn, [
        r("input", {
          ref_key: "fileInput",
          ref: w,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: a(pn),
          onChange: u
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: q(["ap-drop", { over: m.value }]),
          onClick: T,
          onDragover: v[0] || (v[0] = ke((x) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (x) => m.value = !1),
          onDrop: S
        }, [
          g(a(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", $n, [
        r("div", xn, [
          de(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (x) => b.value = x),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [ge, b.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !R.value || a(n).busy.value,
            onClick: ee
          }, [
            g(a(C), {
              icon: a(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: q(a(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + _(R.value ? `Add ${R.value} selected` : "Add selected"), 1)
          ], 8, Sn)
        ]),
        N.value ? (c(), d("div", Cn, [
          g(a(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = P(" Loading your uploads…", -1))
        ])) : L.value ? (c(), d("div", En, [
          g(a(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + _(L.value), 1)
        ])) : V.value.length ? (c(), d("ul", Mn, [
          (c(!0), d(Z, null, te(V.value, (x) => (c(), d("li", {
            key: x.uuid
          }, [
            r("button", {
              type: "button",
              class: q(["ap-upload", { on: D.value[x.uuid] }]),
              "aria-pressed": !!D.value[x.uuid],
              onClick: (ye) => X(x.uuid)
            }, [
              g(a(C), {
                class: "ap-upload-check",
                icon: D.value[x.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g(a(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", In, [
                r("span", On, _(x.filename), 1),
                r("span", Un, [
                  x.mime_type ? (c(), d("span", Ln, _(x.mime_type), 1)) : I("", !0),
                  oe(x.size) ? (c(), d("span", Nn, _(oe(x.size)), 1)) : I("", !0)
                ])
              ])
            ], 10, An)
          ]))), 128))
        ])) : (c(), d("div", Tn, [
          g(a(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = P(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Fn, [
        r("div", Dn, [
          r("div", Bn, [
            r("div", Pn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                P("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              de(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (x) => H.value = x),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${k.value} a title`,
                autocomplete: "off"
              }, null, 8, qn), [
                [ge, H.value]
              ])
            ]),
            r("div", Rn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              de(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (x) => Q.value = x),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [ze, Q.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", Vn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              Y.value ? (c(), d("span", jn, _(Y.value.toLocaleString()) + " chars", 1)) : I("", !0)
            ]),
            de(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (x) => G.value = x),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${k.value} to add to this knowledge base…`
            }, null, 8, Kn), [
              [ge, G.value]
            ])
          ]),
          r("div", Gn, [
            r("span", Wn, [
              g(a(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !G.value.trim() || a(n).busy.value,
              onClick: j
            }, [
              g(a(C), {
                icon: a(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: q(a(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + _(a(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Hn)
          ])
        ])
      ])),
      ae.value ? (c(), d("div", Xn, [
        r("div", Jn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          a(n).busy.value ? I("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = (x) => a(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Qn, [
          (c(!0), d(Z, null, te(a(n).items.value, (x) => (c(), d("li", {
            key: x.key,
            class: q(["ap-item", x.status])
          }, [
            g(a(C), {
              class: q(["ap-item-ic", ["uploading", "processing", "embedding"].includes(x.status) && "spin"]),
              icon: $(x.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Yn, _(x.name), 1),
            r("span", Zn, _(x.error || y[x.status]), 1)
          ], 2))), 128))
        ])
      ])) : I("", !0)
    ]));
  }
});
export {
  uo as A,
  Xe as B,
  po as C,
  fo as D,
  lo as E,
  we as F,
  je as G,
  ho as H,
  ro as I,
  se as N,
  he as _,
  yo as a,
  Mo as b,
  so as c,
  xo as d,
  Ao as e,
  wo as f,
  To as g,
  So as h,
  ao as i,
  $o as j,
  Eo as k,
  Io as l,
  Te as m,
  oo as n,
  Co as o,
  Oo as p,
  Qe as q,
  bo as r,
  tt as s,
  _o as t,
  go as u,
  io as v,
  vo as w,
  ko as x,
  mo as y,
  co as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-kKOQPrqs.js.map
