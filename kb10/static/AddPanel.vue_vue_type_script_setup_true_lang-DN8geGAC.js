import { ref as U, computed as q, watch as ie, defineComponent as W, openBlock as c, createElementBlock as p, createElementVNode as r, renderSlot as ve, normalizeClass as V, createVNode as $, unref as l, withKeys as Ve, createCommentVNode as I, Fragment as te, renderList as ne, createBlock as _e, createTextVNode as R, toDisplayString as w, onBeforeUnmount as be, Transition as Ae, withCtx as Ie, withModifiers as ye, isRef as Se, nextTick as qe, onMounted as Oe, withDirectives as de, vModelText as xe, vModelSelect as ze } from "vue";
import { on as Ue, api as J, host as le } from "@wippy-fe/proxy";
import { Icon as E } from "@iconify/vue";
function Le(e, s = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || s;
}
function ao(e) {
  return Le(e.metadata, e.id);
}
function pe(e) {
  return Le(e.metadata, "");
}
function X(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function P(e) {
  return typeof e == "string" ? e.trim() : "";
}
function je(e) {
  const s = X(e.metadata), t = X(s.source_ref);
  let a = P(t.external_id) || P(s.external_id);
  const n = P(t.external_version) || P(s.external_version);
  let o = P(t.upload_id) || P(s.upload_id), u = P(t.source_url) || P(t.url) || P(s.source_url);
  const b = P(t.reference_component_id) || P(t.component_id) || P(s.reference_component_id), S = Object.keys(X(t.reference_context)).length ? X(t.reference_context) : Object.keys(X(t.context)).length ? X(t.context) : X(s.reference_context);
  if (!o && a.startsWith("upload:") && (o = a.slice(7)), !u && a.startsWith("url:") && (u = a.slice(4)), !a && o && (a = `upload:${o}`), !a && u && (a = `url:${u}`), !a) return null;
  const h = { ...t };
  delete h.thread_id, delete h.thread_event_id, delete h.thread_event_seq, b && !P(h.reference_component_id) && (h.reference_component_id = b), Object.keys(S).length && Object.keys(X(h.reference_context)).length === 0 && (h.reference_context = S), a && Object.keys(h).length && !P(h.external_id) && (h.external_id = a);
  const m = Object.keys(h).length > 0;
  return {
    external_id: a,
    external_version: n || void 0,
    upload_id: o || void 0,
    source_url: u || void 0,
    metadata: {
      title: s.title || s.filename || s.source_url,
      node_id: e.id,
      source_ref: m ? h : void 0
    },
    source_ref: m ? h : void 0
  };
}
function lo(e) {
  const s = je(e), t = s ? P(s.external_id) : "";
  if (!t) return null;
  const a = X(e.metadata), n = X(a.source_ref);
  return `${P(n.external_source) || P(a.external_source)}\0${t}`;
}
function we(e, s) {
  return e ? e.length > s ? e.slice(0, s).trimEnd() + "…" : e : "";
}
const Ke = /engine .*not installed|no .*engine|unavailable/i;
function io(e) {
  return Ke.test(e || "");
}
const ro = "This knowledge base's engine is not installed; its contents are unavailable.", ae = {
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
  if (e.node_type === "document") return ae.document;
  if (e.is_root) return ae.root;
  const s = (e.concept_type || "").toLowerCase();
  return ae[s] || ae.topic;
}
const Ge = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, fe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function We(e) {
  return e < fe.length ? fe[e] : Math.round((fe[0] + (e - fe.length + 1) * 137.508) % 360);
}
function me(e, s, t) {
  return `hsl(${e} ${s}% ${t}%)`;
}
const Ce = 34, Ee = 88, He = 78, Xe = 38;
function uo(e, s) {
  const t = new Map(e.map((d) => [d.id, d])), a = /* @__PURE__ */ new Map();
  for (const d of s)
    d.edge_type !== "subtopic_of" && d.edge_type !== "categorized_as" || t.has(d.from_node_id) && t.has(d.to_node_id) && a.set(d.from_node_id, d.to_node_id);
  const n = (d) => !!t.get(d)?.is_root;
  function o(d) {
    const g = /* @__PURE__ */ new Set();
    let M = d, L = 0;
    for (; !g.has(M); ) {
      g.add(M);
      const y = a.get(M);
      if (y === void 0 || n(y)) return { branch: M, depth: L };
      M = y, L++;
    }
    return { branch: M, depth: L };
  }
  const u = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  for (const d of e) {
    if (d.is_root) continue;
    const g = o(d.id);
    u.set(d.id, g), b.set(g.branch, Math.max(b.get(g.branch) ?? 0, g.depth));
  }
  const S = [...new Set([...u.values()].map((d) => d.branch))].sort((d, g) => (t.get(d)?.label || "").localeCompare(t.get(g)?.label || "")), h = /* @__PURE__ */ new Map();
  S.forEach((d, g) => h.set(d, We(g)));
  const m = (d, g, M) => d + (g - d) * M, O = /* @__PURE__ */ new Map();
  for (const d of e) {
    if (d.is_root) {
      O.set(d.id, { ...ae.root });
      continue;
    }
    const g = u.get(d.id);
    if (!g) {
      O.set(d.id, { ...ae.topic });
      continue;
    }
    const M = h.get(g.branch) ?? 220, L = Math.min(Math.max(b.get(g.branch) ?? 0, 1), 4), y = Math.min(1, g.depth / L);
    if (d.node_type === "document") {
      const F = Math.min(84, m(Ce, Ee, y) + 6);
      O.set(d.id, { fill: me(M, 32, F), stroke: me(M, 32, Math.max(50, F - 14)) });
    } else {
      const F = m(Ce, Ee, y), D = m(He, Xe, y);
      O.set(d.id, { fill: me(M, D, F), stroke: me(M, D, Math.max(28, F - 17)) });
    }
  }
  return O;
}
const Je = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function po(e, s) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of s) {
    if (!Je.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const O = a.get(m.to_node_id) || [];
    O.push(m.from_node_id), a.set(m.to_node_id, O), n.add(m.from_node_id);
  }
  const o = (m, O) => (t.get(m)?.label || "").localeCompare(t.get(O)?.label || "");
  function u(m, O, d) {
    const g = t.get(m);
    if (!g || d.has(m)) return null;
    d.add(m);
    const M = (a.get(m) || []).slice().sort(o), L = [];
    for (const y of M) {
      const F = u(y, O + 1, d);
      F && L.push(F);
    }
    return { concept: g, children: L, depth: O };
  }
  const b = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(o), S = /* @__PURE__ */ new Set(), h = [];
  for (const m of b) {
    const O = u(m, 0, S);
    O && h.push(O);
  }
  for (const m of e)
    if (!S.has(m.id)) {
      const O = u(m.id, 0, S);
      O && h.push(O);
    }
  return h;
}
function fo(e) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, o) => {
    s.set(n.concept.id, n), o && t.set(n.concept.id, o);
    for (const u of n.children) a(u, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: s, parentOf: t };
}
function mo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, a) => t.isFolder !== a.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(a.concept.label || a.concept.id)) : [];
}
function Qe(e, s, t) {
  const a = [], n = /* @__PURE__ */ new Set();
  let o = e;
  for (; o && !n.has(o); ) {
    n.add(o);
    const u = s.get(o);
    if (!u) break;
    a.unshift(u.concept), o = t.get(o);
  }
  return a;
}
function vo(e, s, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const o of s.values()) {
    if (!(o.concept.label || o.concept.id).toLowerCase().includes(a)) continue;
    const b = Qe(o.concept.id, s, t);
    n.push({ concept: o.concept, isFolder: o.children.length > 0, path: b.slice(0, -1) });
  }
  return n.sort((o, u) => o.isFolder !== u.isFolder ? o.isFolder ? -1 : 1 : (o.concept.label || o.concept.id).localeCompare(u.concept.label || u.concept.id)).slice(0, 200);
}
function ho(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const Ye = {
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
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Ye[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function Ze(e, s) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !a.has(n.from_node_id) && (a.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function bo(e, s) {
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.from_node_id === e && !a.has(n.to_node_id) && (a.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function yo(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set();
  for (const o of s) {
    if (o.edge_type !== "subtopic_of" || o.to_node_id !== e.id || n.has(o.from_node_id)) continue;
    const u = t.get(o.from_node_id);
    u && (n.add(o.from_node_id), a.push(u));
  }
  return a.sort((o, u) => (o.label || "").localeCompare(u.label || ""));
}
function ko(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), o = new Set(Ze(e, s));
  for (const u of s) {
    if (u.edge_type === "subtopic_of" || u.edge_type === "categorized_as") continue;
    let b = "";
    if (u.from_node_id === e.id) b = u.to_node_id;
    else if (u.to_node_id === e.id) b = u.from_node_id;
    else continue;
    if (!b || n.has(b) || o.has(b)) continue;
    const S = t.get(b);
    S && (n.add(b), a.push({ concept: S, label: Ge[u.edge_type || ""] || u.edge_type || "related" }));
  }
  return a;
}
function go(e, s) {
  let t = 0;
  for (const a of s)
    a.edge_type === "subtopic_of" && a.to_node_id === e && t++;
  return t;
}
const et = ["image/", "audio/", "video/"], tt = /* @__PURE__ */ new Set([
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
  const s = (e || "").toLowerCase();
  return et.some((t) => s.startsWith(t)) || tt.has(s);
}
function wo(e) {
  const s = e || {}, t = s.source_ref && typeof s.source_ref == "object" ? s.source_ref : {}, a = t.upload_id || s.upload_id;
  if (typeof a == "string" && a.trim()) return a.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof s.external_id == "string" && s.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ce(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function nt(e, s) {
  if (!s) return null;
  const t = ce(e) ? e : {}, a = [
    t,
    ce(t.data) ? t.data : null,
    ce(t.payload) ? t.payload : null,
    ce(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
    if (n.event !== "component.meta.changed") continue;
    const o = String(n.component_id || ""), u = String(t.topic || n.topic || "");
    if (!(o && o !== s) && !(!o && u !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: o || s,
        meta: ce(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function ot(e, s) {
  if (!e) return null;
  const t = Ue(`component.${e}`, (a) => {
    const n = nt(a, e);
    n && s(n);
  });
  return typeof t == "function" ? t : null;
}
function Te(e) {
  if (typeof e != "number" && (typeof e != "string" || !e.trim())) return null;
  const s = Number(e);
  return Number.isSafeInteger(s) && s >= 0 ? s : null;
}
function $o(e) {
  const s = U(null), t = q(() => {
    const o = s.value;
    return o ? `Indexing ${o === 1 ? "document" : "documents"} — ${o} waiting` : "";
  });
  let a = 0;
  function n(o) {
    if (o.component_id !== e()) return;
    const u = Te(o.meta.pending_source_count);
    u === null && !o.deleted.includes("pending_source_count") || (a++, s.value = u);
  }
  return ie(e, async (o, u, b) => {
    if (s.value = null, !o) return;
    const S = ++a;
    b(() => {
      a++;
    });
    try {
      const { data: h } = await J.get(`/api/v1/components/${o}`);
      S === a && o === e() && (s.value = Te(h?.meta?.pending_source_count));
    } catch (h) {
      if (S === a && o === e()) {
        const m = h;
        le.handleError(m.response?.status === 401 ? "auth-expired" : "other", m);
      }
    }
  }, { immediate: !0 }), { pending: s, indexingNotice: t, onMeta: n };
}
const st = { class: "kx-shell" }, at = { class: "kx-rail" }, lt = { class: "kx-main" }, So = /* @__PURE__ */ W({
  __name: "KbShell",
  setup(e) {
    return (s, t) => (c(), p("div", st, [
      r("aside", at, [
        ve(s.$slots, "rail")
      ]),
      r("main", lt, [
        ve(s.$slots, "default")
      ])
    ]));
  }
}), it = ["aria-label", "title", "disabled"], he = /* @__PURE__ */ W({
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (c(), p("button", {
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
      onClick: n[0] || (n[0] = (o) => t("click"))
    }, [
      $(l(E), {
        icon: e.icon,
        class: V(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, it));
  }
}), rt = { class: "kx-search" }, ct = ["value", "placeholder"], Me = /* @__PURE__ */ W({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (c(), p("div", rt, [
      $(l(E), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      r("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder || "Search…",
        onInput: n[0] || (n[0] = (o) => t("update:modelValue", o.target.value)),
        onKeyup: n[1] || (n[1] = Ve((o) => t("enter"), ["enter"]))
      }, null, 40, ct),
      e.modelValue ? (c(), p("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (o) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        $(l(E), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : I("", !0)
    ]));
  }
}), ut = {
  class: "tb",
  role: "tablist"
}, dt = ["aria-selected", "onClick"], pt = {
  key: 1,
  class: "kx-count"
}, Co = /* @__PURE__ */ W({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (c(), p("div", ut, [
      (c(!0), p(te, null, ne(e.tabs, (o) => (c(), p("button", {
        key: o.id,
        class: V(["tb-tab", { on: e.active === o.id }]),
        role: "tab",
        "aria-selected": e.active === o.id,
        onClick: (u) => t("select", o.id)
      }, [
        o.icon ? (c(), _e(l(E), {
          key: 0,
          icon: o.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        R(" " + w(o.label) + " ", 1),
        o.count !== void 0 ? (c(), p("span", pt, w(o.count), 1)) : I("", !0)
      ], 10, dt))), 128))
    ]));
  }
}), Eo = /* @__PURE__ */ W({
  __name: "KbNotice",
  props: {
    tone: { default: "info" },
    icon: {}
  },
  setup(e) {
    const s = e, t = s.icon || {
      info: "tabler:info-circle",
      warn: "tabler:alert-triangle",
      error: "tabler:alert-circle",
      help: "tabler:bulb"
    }[s.tone];
    return (a, n) => (c(), p("div", {
      class: V(["kx-notice", e.tone])
    }, [
      $(l(E), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ve(a.$slots, "default")
      ])
    ], 2));
  }
}), ft = ["aria-label"], mt = { class: "kx-drawer-h" }, vt = { class: "kx-drawer-title" }, ht = { class: "kx-drawer-b" }, To = /* @__PURE__ */ W({
  __name: "KbDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: s }) {
    const t = e, a = s;
    function n(o) {
      o.key === "Escape" && a("close");
    }
    return ie(() => t.open, (o) => {
      o ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), be(() => window.removeEventListener("keydown", n)), (o, u) => (c(), _e(Ae, { name: "kx-drawer" }, {
      default: Ie(() => [
        e.open ? (c(), p("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: u[1] || (u[1] = ye((b) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", mt, [
              r("span", vt, [
                $(l(E), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                R(w(e.title), 1)
              ]),
              $(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: u[0] || (u[0] = (b) => a("close"))
              })
            ]),
            r("div", ht, [
              ve(o.$slots, "default")
            ])
          ], 8, ft)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
});
function _t(e) {
  const s = U(""), t = U([]), a = U(""), n = U(null), o = U(!1), u = U(""), b = U(!1);
  let S = null;
  function h() {
    S && (clearTimeout(S), S = null), s.value = "", t.value = [], a.value = "", n.value = null, b.value = !1, u.value = "";
  }
  async function m(g = 20) {
    const M = e(), L = s.value.trim();
    if (!L || !M) {
      t.value = [], b.value = !1;
      return;
    }
    o.value = !0, u.value = "", n.value = null, b.value = !0;
    try {
      const { data: y } = await J.get(`/api/v1/kb10/${M}/search?q=${encodeURIComponent(L)}&limit=${g}`);
      y?.success ? (t.value = y.results || [], a.value = "", n.value = y.retrieval?.analysis?.status === "unavailable" ? y.retrieval.analysis : null) : u.value = y?.error || "search failed";
    } catch (y) {
      u.value = y?.response?.data?.error || y?.message || "search error", le.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      o.value = !1;
    }
  }
  async function O(g = 8) {
    const M = e(), L = s.value.trim();
    if (!L || !M) {
      t.value = [], a.value = "", b.value = !1;
      return;
    }
    o.value = !0, u.value = "", n.value = null, a.value = "", b.value = !0;
    try {
      const { data: y } = await J.post(`/api/v1/knowledge/${M}/ask`, { query: L, limit: g });
      y?.success ? (t.value = y.results || [], a.value = String(y.answer || "")) : (n.value = y?.retrieval?.analysis?.status === "unavailable" ? y.retrieval.analysis : null, u.value = y?.error || "ask failed");
    } catch (y) {
      const F = y?.response?.data;
      n.value = F?.retrieval?.analysis?.status === "unavailable" ? F.retrieval.analysis : null, u.value = F?.error || y?.message || "ask error", le.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      o.value = !1;
    }
  }
  function d(g = 300) {
    if (S && clearTimeout(S), !s.value.trim()) {
      t.value = [], b.value = !1;
      return;
    }
    S = setTimeout(() => m(), g);
  }
  return be(() => {
    S && clearTimeout(S);
  }), { query: s, results: t, answer: a, analysisUnavailable: n, loading: o, error: u, performed: b, run: m, ask: O, runDebounced: d, clear: h };
}
function $e(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const bt = {
  key: 0,
  class: "kc-search-pop"
}, yt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, kt = {
  key: 1,
  class: "kc-search-state err"
}, gt = {
  key: 2,
  class: "kc-search-hits"
}, xt = ["onMousedown"], wt = { class: "kc-search-hit-h" }, $t = {
  key: 0,
  class: "kc-search-r-doc"
}, St = { class: "kc-search-hit-kind" }, Ct = {
  key: 1,
  class: "kc-search-hit-score"
}, Et = { class: "kc-search-hit-body" }, Tt = {
  key: 3,
  class: "kc-search-state"
}, Mt = {
  key: 4,
  class: "kc-search-state"
}, At = {
  key: 1,
  class: "kc-search-panel"
}, It = { class: "kc-search-bar" }, Ot = {
  key: 0,
  class: "kc-search-modes"
}, Ut = { class: "kc-search-field" }, Lt = {
  key: 0,
  class: "kc-search-state"
}, Nt = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Ft = {
  key: 2,
  class: "kc-search-err"
}, Dt = {
  key: 3,
  class: "kc-search-skel"
}, Bt = {
  key: 0,
  class: "kc-ans"
}, Rt = { class: "kc-ans-h" }, Pt = { class: "kc-ans-body" }, Vt = {
  key: 0,
  class: "kc-ans-sim"
}, qt = { class: "kc-search-results" }, zt = {
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
  key: 5,
  class: "kc-search-zero"
}, Zt = {
  key: 6,
  class: "kc-search-zero"
}, en = { class: "kc-search-zero-t" }, Mo = /* @__PURE__ */ W({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, { query: n, results: o, answer: u, analysisUnavailable: b, loading: S, error: h, performed: m, run: O, ask: d, runDebounced: g, clear: M } = _t(() => t.kbId), L = U("search"), y = U(!1), F = U(""), D = q(() => t.ask && !b.value), z = q(() => t.layout === "panel" && D.value && L.value === "ask"), j = q(() => S.value ? "tabler:hourglass" : z.value ? "tabler:sparkles" : "tabler:arrow-right"), H = q(() => o.value[0]), oe = q(() => z.value ? o.value.slice(1) : o.value), se = q(() => t.layout === "rail" && y.value && n.value.trim() !== "" && (S.value || m.value || !!h.value));
    function Z() {
      n.value.trim() && (F.value = n.value.trim(), z.value ? d(8) : O(20));
    }
    function ee() {
      t.layout === "rail" && g(300);
    }
    function K(Y) {
      L.value = Y, m.value && n.value.trim() && Z();
    }
    function Q(Y) {
      a("open", Y), t.layout === "rail" && (M(), y.value = !1);
    }
    return (Y, k) => e.layout === "rail" ? (c(), p("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: k[2] || (k[2] = (x) => y.value = !0),
      onFocusout: k[3] || (k[3] = (x) => y.value = !1)
    }, [
      $(Me, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          k[0] || (k[0] = (x) => Se(n) ? n.value = x : null),
          ee
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: k[1] || (k[1] = (x) => l(O)(20)),
        onClear: l(M)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      se.value ? (c(), p("div", bt, [
        l(b) ? (c(), p("p", yt, "Showing direct matches. No model is assigned to " + w(l(b).model) + ".", 1)) : I("", !0),
        l(h) ? (c(), p("div", kt, [
          $(l(E), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, w(l(h)), 1)
        ])) : l(o).length ? (c(), p("div", gt, [
          (c(!0), p(te, null, ne(l(o), (x) => (c(), p("button", {
            key: x.id,
            class: "kc-search-hit",
            onMousedown: ye((re) => Q(x), ["prevent"])
          }, [
            r("span", wt, [
              l(pe)(x) ? (c(), p("span", $t, [
                $(l(E), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(w(l(pe)(x)), 1)
              ])) : I("", !0),
              r("span", St, w(x.node_type || "result"), 1),
              x.similarity != null ? (c(), p("span", Ct, w(l($e)(x.similarity)), 1)) : I("", !0)
            ]),
            r("span", Et, w(l(we)(x.content, 160)), 1)
          ], 40, xt))), 128))
        ])) : l(m) && !l(S) ? (c(), p("div", Tt, [
          $(l(E), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = r("span", null, "No passages matched.", -1))
        ])) : l(S) ? (c(), p("div", Mt, [
          $(l(E), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          k[10] || (k[10] = r("span", null, "Searching…", -1))
        ])) : I("", !0)
      ])) : I("", !0)
    ], 32)) : (c(), p("div", At, [
      r("div", It, [
        D.value ? (c(), p("div", Ot, [
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "search" }]),
            onClick: k[4] || (k[4] = (x) => K("search"))
          }, [
            $(l(E), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            k[11] || (k[11] = R(" Search ", -1))
          ], 2),
          r("button", {
            class: V(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: k[5] || (k[5] = (x) => K("ask"))
          }, [
            $(l(E), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            k[12] || (k[12] = R(" Ask ", -1))
          ], 2)
        ])) : I("", !0),
        r("div", Ut, [
          $(Me, {
            modelValue: l(n),
            "onUpdate:modelValue": k[6] || (k[6] = (x) => Se(n) ? n.value = x : null),
            placeholder: z.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Z
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        $(he, {
          icon: j.value,
          label: z.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(S),
          disabled: !l(n).trim() || l(S),
          onClick: Z
        }, null, 8, ["icon", "label", "active", "disabled"]),
        $(he, {
          icon: "tabler:x",
          label: "Close search",
          onClick: k[7] || (k[7] = (x) => a("close"))
        })
      ]),
      t.ask ? I("", !0) : (c(), p("p", Lt, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(b) ? (c(), p("p", Nt, "Showing direct matches. No model is assigned to " + w(l(b).model) + ".", 1)) : I("", !0),
      l(h) ? (c(), p("div", Ft, [
        $(l(E), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, w(l(h)), 1)
      ])) : I("", !0),
      l(S) ? (c(), p("div", Dt, [
        (c(), p(te, null, ne(3, (x) => r("div", {
          key: x,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(o).length ? (c(), p(te, { key: 4 }, [
        z.value ? (c(), p("div", Bt, [
          r("div", Rt, [
            $(l(E), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            R(" " + w(l(u) ? "Answer" : "Best match") + ' for "' + w(F.value) + '"', 1)
          ]),
          r("p", Pt, w(l(u) || l(we)(H.value?.content, 700)), 1),
          H.value?.parent_id ? (c(), p("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: k[8] || (k[8] = (x) => Q(H.value))
          }, [
            $(l(E), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            k[13] || (k[13] = R(" Open source document ", -1)),
            H.value?.similarity != null ? (c(), p("span", Vt, w(l($e)(H.value?.similarity)), 1)) : I("", !0)
          ])) : I("", !0)
        ])) : I("", !0),
        r("div", qt, [
          z.value && oe.value.length ? (c(), p("div", zt, "Sources")) : I("", !0),
          (c(!0), p(te, null, ne(oe.value, (x) => (c(), p("button", {
            key: x.id,
            class: V(["kc-search-result", { link: !!x.parent_id }]),
            onClick: (re) => Q(x)
          }, [
            r("div", Kt, [
              l(pe)(x) ? (c(), p("span", Gt, [
                $(l(E), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(w(l(pe)(x)), 1)
              ])) : I("", !0),
              r("span", Wt, w(x.node_type || "passage"), 1),
              x.llm_score != null ? (c(), p("span", Ht, "Relevance " + w(Math.round(x.llm_score)), 1)) : I("", !0),
              x.similarity != null ? (c(), p("span", Xt, w(l($e)(x.similarity)), 1)) : I("", !0)
            ]),
            r("p", Jt, w(l(we)(x.content, 360)), 1),
            x.parent_id ? (c(), p("span", Qt, [
              $(l(E), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              k[14] || (k[14] = R(" Open document", -1))
            ])) : I("", !0)
          ], 10, jt))), 128))
        ])
      ], 64)) : l(m) ? (c(), p("div", Yt, [
        $(l(E), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        k[15] || (k[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        k[16] || (k[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), p("div", Zt, [
        $(l(E), {
          icon: z.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", en, w(z.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), tn = ["aria-label"], nn = { class: "kc-orig-h" }, on = { class: "kc-orig-title" }, sn = { class: "kc-orig-title-t" }, an = { class: "kc-orig-b" }, ln = ["content-type", "source-url", "filename"], Ao = /* @__PURE__ */ W({
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
  setup(e, { emit: s }) {
    const t = e, a = s, n = U(null);
    function o() {
      if (t.contained) return;
      const d = n.value;
      d && d.requestFullscreen && !document.fullscreenElement && d.requestFullscreen().catch(() => {
      });
    }
    function u() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function b(d) {
      d.key === "Escape" && a("close");
    }
    function S() {
      t.open && !document.fullscreenElement && a("close");
    }
    ie(() => t.open, (d) => {
      d ? (window.addEventListener("keydown", b), qe(o)) : (window.removeEventListener("keydown", b), u());
    });
    const h = U(""), m = U("");
    async function O() {
      if (h.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: d } = await J.get(t.sourceUrl);
          d?.success && typeof d.url == "string" && (h.value = d.url, m.value = typeof d.content_type == "string" ? d.content_type : "");
        } catch {
        }
    }
    return ie(() => [t.open, t.sourceUrl], O, { immediate: !0 }), Oe(() => {
      t.contained || document.addEventListener("fullscreenchange", S);
    }), be(() => {
      document.removeEventListener("fullscreenchange", S), window.removeEventListener("keydown", b), u();
    }), (d, g) => (c(), _e(Ae, { name: "kc-orig" }, {
      default: Ie(() => [
        e.open ? (c(), p("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: V(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: g[1] || (g[1] = ye((M) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", nn, [
              r("span", on, [
                $(l(E), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", sn, w(e.title), 1)
              ]),
              $(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: g[0] || (g[0] = (M) => a("close"))
              })
            ]),
            r("div", an, [
              h.value ? (c(), p("wc-resource-view", {
                key: h.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": h.value,
                filename: e.filename
              }, null, 8, ln)) : I("", !0)
            ])
          ], 8, tn)
        ], 2)) : I("", !0)
      ]),
      _: 1
    }));
  }
}), Io = /* @__PURE__ */ W({
  __name: "ViewOriginalButton",
  props: {
    label: {}
  },
  emits: ["open"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (c(), p("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (o) => t("open"))
    }, [
      $(l(E), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, w(e.label || "View original"), 1)
    ]));
  }
}), rn = { class: "kc-docsum" }, cn = { class: "kc-docsum-h" }, Oo = /* @__PURE__ */ W({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const s = e, t = U(!1), a = q(() => s.collapsible === !0 && s.text.length > 320);
    return (n, o) => (c(), p("section", rn, [
      r("div", cn, [
        $(l(E), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        R(" " + w(e.label), 1)
      ]),
      r("p", {
        class: V(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, w(e.text), 3),
      a.value ? (c(), p("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: o[0] || (o[0] = (u) => t.value = !t.value)
      }, w(t.value ? "Show less" : "Show more"), 1)) : I("", !0)
    ]));
  }
}), un = { class: "kx-empty kx-empty-spacious" }, dn = { class: "kx-empty-title" }, pn = {
  key: 0,
  class: "kx-empty-sub"
}, Uo = /* @__PURE__ */ W({
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (c(), p("div", un, [
      r("div", {
        class: V(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        $(l(E), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", dn, w(e.title), 1),
      e.hint ? (c(), p("div", pn, w(e.hint), 1)) : I("", !0),
      e.cta ? (c(), p("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (o) => t("cta"))
      }, [
        e.ctaIcon ? (c(), _e(l(E), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        R(" " + w(e.cta), 1)
      ])) : I("", !0)
    ]));
  }
}), Ne = /* @__PURE__ */ new Set([
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
]), De = /* @__PURE__ */ new Set([
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
]), Be = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), fn = [
  ...Array.from(Ne),
  ...Array.from(Fe)
].map((e) => `.${e}`), mn = [
  ...fn,
  "text/*",
  ...Array.from(Be),
  ...Array.from(De)
].join(","), vn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function hn(e) {
  const s = String(e || "").toLowerCase().split("/").pop() || "", t = s.lastIndexOf(".");
  return t >= 0 ? s.slice(t + 1) : "";
}
function _n(e) {
  const s = String(e.type || "").toLowerCase();
  if (s.startsWith("text/") || De.has(s) || Be.has(s)) return !0;
  const t = hn(e.name);
  return Ne.has(t) || Fe.has(t);
}
const ue = ["uploading", "processing"];
function bn(e, s) {
  const t = U([]), a = U(!1), n = U(""), o = U("");
  let u = 0;
  const b = (i) => `${i}${++u}`, S = q(() => a.value || t.value.some((i) => ue.includes(i.status)));
  function h() {
    n.value = "", o.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => ue.includes(i.status));
  }
  function O(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function d(i, f) {
    t.value = t.value.map((_) => _.key === i ? { ..._, ...f } : _);
  }
  const g = [];
  function M() {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) g.push(setTimeout(() => s(), i));
  }
  function L() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", s(), M();
  }
  function y(i) {
    const f = t.value.find((_) => _.key === i);
    !f || f.status === "done" || (d(i, { status: "done" }), L());
  }
  function F(i, f) {
    t.value = [...t.value, { key: b("q"), name: i, uuid: f, status: "done" }], L();
  }
  const D = /* @__PURE__ */ new Map(), z = [];
  function j(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function H(i) {
    const f = j(i) ? i : {};
    return String(f.topic || "");
  }
  function oe(i) {
    const f = j(i) ? i : {}, _ = [
      f,
      j(f.data) ? f.data : null,
      j(f.payload) ? f.payload : null,
      j(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const A of _)
      if (typeof A.uuid == "string" && typeof A.status == "string") return A;
    return {};
  }
  function se(i, f, _) {
    const A = t.value.find((N) => N.uuid === i && ue.includes(N.status));
    if (!A) return;
    const B = String(f || "");
    B === "error" || B === "failed" ? d(A.key, { status: "error", error: String(_ || "File processing failed") }) : B === "completed" ? y(A.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && d(A.key, { status: "processing" });
  }
  function Z(i, f) {
    const _ = oe(f);
    _.uuid === i && se(i, _.status, _.error);
  }
  function ee(i) {
    const f = `upload:${i}`;
    if (D.has(f)) return;
    const _ = Ue("@message", (A) => {
      H(A) === f && Z(i, A);
    });
    typeof _ == "function" && D.set(f, _);
  }
  async function K(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ue.includes(f.status))))
      try {
        const { data: f } = await J.get(`/api/v1/uploads/${encodeURIComponent(i)}`), _ = j(f?.upload) ? f.upload : j(f) ? f : {};
        se(i, _.status, _.error || _.error_details);
      } catch {
      }
  }
  function Q(i) {
    K(i);
    for (const f of [1500, 5e3, 15e3])
      z.push(setTimeout(() => {
        K(i);
      }, f));
  }
  function Y(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const _ = String(f.last_error || "Embedding failed");
      for (const A of t.value) ue.includes(A.status) && d(A.key, { status: "error", error: _ });
      o.value = _;
    }
  }
  let k = null, x = 0;
  function re(i) {
    const f = ++x;
    if (k && (k(), k = null), !i) return;
    const _ = ot(i, Y);
    if (f !== x) {
      _ && _();
      return;
    }
    k = _;
  }
  ie(() => e(), (i) => {
    re(i);
  }, { immediate: !0 }), be(() => {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of z.splice(0)) clearTimeout(i);
    x++, k && k();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ke(i, f, _) {
    try {
      const { data: A } = await J.post(`/api/v1/knowledge/${_}/upload-token`);
      if (!A?.success || !A.upload_token) {
        d(i, { status: "error", error: A?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", f), B.append("upload_token", A.upload_token);
      const { data: N } = await J.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (N?.success && N.uuid) {
        const G = String(N.uuid);
        d(i, { uuid: G, externalId: `upload:${G}`, status: "processing" }), ee(G), Q(G);
      } else
        d(i, { status: "error", error: N?.error || "Upload failed" });
    } catch (A) {
      d(i, { status: "error", error: A?.response?.data?.error || A?.message || "Upload error" }), le.handleError(A?.response?.status === 401 ? "auth-expired" : "other", A);
    }
  }
  function T(i) {
    const f = e();
    if (f) {
      h();
      for (const _ of Array.from(i)) {
        if (!_n(_)) {
          o.value = vn;
          continue;
        }
        const A = b("f");
        t.value = [...t.value, { key: A, name: _.name, status: "uploading" }], ke(A, _, f);
      }
    }
  }
  function v(i) {
    T([i]);
  }
  async function C(i = 100, f = 0) {
    const { data: _ } = await J.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), B = (Array.isArray(_?.uploads) ? _.uploads : []).map((N) => ({
      uuid: String(N.uuid),
      filename: String(N.filename || N.meta && N.meta.filename || N.uuid),
      mime_type: N.mime_type,
      size: N.size,
      status: N.status,
      created_at: N.created_at
    }));
    return { uploads: B, total: Number(_?.meta?.total ?? B.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      h(), a.value = !0;
      try {
        const { data: _ } = await J.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((G) => G.uuid)
        }), A = Array.isArray(_?.results) ? _.results : [], B = (G) => i.find((Pe) => Pe.uuid === G)?.name || G;
        let N = !1;
        for (const G of A)
          G?.success && (N = !0, F(B(String(G.upload_id)), String(G.upload_id)));
        N || (o.value = _?.error || "Could not ingest the selected uploads");
      } catch (_) {
        o.value = _?.response?.data?.error || _?.message || "Ingest error", le.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Re(i, f, _) {
    const A = e();
    if (!(!i.trim() || !A)) {
      h(), a.value = !0;
      try {
        const B = f.trim() ? { title: f.trim() } : void 0, { data: N } = await J.post(`/api/v1/knowledge/${A}/ingest`, { content: i, content_type: _, metadata: B });
        N?.success ? F(f.trim() || "Pasted text") : o.value = N?.error || "Ingestion failed";
      } catch (B) {
        o.value = B?.response?.data?.error || B?.message || "Ingestion error", le.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: S,
    okMsg: q(() => n.value),
    errMsg: q(() => o.value),
    reset: h,
    clearItems: m,
    removeItem: O,
    uploadFile: v,
    uploadFiles: T,
    listMyUploads: C,
    ingestExistingUploads: ge,
    ingestText: Re
  };
}
const yn = { class: "ap" }, kn = {
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
}, Rn = { class: "ap-form" }, Pn = { class: "ap-grid2" }, Vn = { class: "ap-field" }, qn = ["placeholder"], zn = { class: "ap-field" }, jn = { class: "ap-field" }, Kn = { class: "ap-label-row" }, Gn = {
  key: 0,
  class: "ap-count"
}, Wn = ["placeholder"], Hn = { class: "ap-actions" }, Xn = { class: "ap-hint" }, Jn = ["disabled"], Qn = {
  key: 4,
  class: "ap-items"
}, Yn = { class: "ap-items-h" }, Zn = { class: "ap-items-list" }, eo = { class: "ap-item-name" }, to = { class: "ap-item-status" }, Lo = /* @__PURE__ */ W({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: s }) {
    const t = e, a = s, n = bn(() => t.kbId, () => a("changed")), o = U("file"), u = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], b = q(() => t.noun || "content");
    function S(T) {
      n.reset(), o.value = T, T === "uploads" && H();
    }
    const h = U(null), m = U(!1);
    function O() {
      h.value?.click();
    }
    function d(T) {
      const v = T.target.files;
      v?.length && n.uploadFiles(v), h.value && (h.value.value = "");
    }
    function g(T) {
      T.preventDefault(), m.value = !1;
      const v = T.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const M = U([]), L = U(!1), y = U(""), F = U(""), D = U({}), z = q(() => {
      const T = F.value.trim().toLowerCase();
      return T ? M.value.filter((v) => v.filename.toLowerCase().includes(T)) : M.value;
    }), j = q(() => Object.values(D.value).filter(Boolean).length);
    async function H() {
      L.value = !0, y.value = "";
      try {
        const { uploads: T } = await n.listMyUploads(200, 0);
        M.value = T;
      } catch (T) {
        y.value = T?.message || "Could not load your uploads";
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
    const ee = U(""), K = U(""), Q = U("text/plain"), Y = q(() => K.value.length);
    async function k() {
      K.value.trim() && (await n.ingestText(K.value, ee.value, Q.value), n.errMsg.value || (K.value = "", ee.value = ""));
    }
    const x = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function re(T) {
      return T === "done" ? "tabler:circle-check" : T === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ke = q(() => n.items.value.length > 0);
    return Oe(() => {
      o.value === "uploads" && H();
    }), ie(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (T, v) => (c(), p("div", yn, [
      r("div", kn, [
        (c(), p(te, null, ne(u, (C) => r("button", {
          key: C.id,
          class: V(["ap-mode", { on: o.value === C.id }]),
          role: "tab",
          "aria-selected": o.value === C.id,
          onClick: (ge) => S(C.id)
        }, [
          $(l(E), {
            icon: C.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, w(C.label), 1)
        ], 10, gn)), 64))
      ]),
      l(n).errMsg.value ? (c(), p("div", xn, [
        $(l(E), { icon: "tabler:alert-circle" }),
        R(w(l(n).errMsg.value), 1)
      ])) : I("", !0),
      o.value === "file" ? (c(), p("section", wn, [
        r("input", {
          ref_key: "fileInput",
          ref: h,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(mn),
          onChange: d
        }, null, 40, $n),
        r("button", {
          type: "button",
          class: V(["ap-drop", { over: m.value }]),
          onClick: O,
          onDragover: v[0] || (v[0] = ye((C) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (C) => m.value = !1),
          onDrop: g
        }, [
          $(l(E), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : o.value === "uploads" ? (c(), p("section", Sn, [
        r("div", Cn, [
          de(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (C) => F.value = C),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, F.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !j.value || l(n).busy.value,
            onClick: se
          }, [
            $(l(E), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: V(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            R(" " + w(j.value ? `Add ${j.value} selected` : "Add selected"), 1)
          ], 8, En)
        ]),
        L.value ? (c(), p("div", Tn, [
          $(l(E), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = R(" Loading your uploads…", -1))
        ])) : y.value ? (c(), p("div", Mn, [
          $(l(E), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          R(" " + w(y.value), 1)
        ])) : z.value.length ? (c(), p("ul", In, [
          (c(!0), p(te, null, ne(z.value, (C) => (c(), p("li", {
            key: C.uuid
          }, [
            r("button", {
              type: "button",
              class: V(["ap-upload", { on: D.value[C.uuid] }]),
              "aria-pressed": !!D.value[C.uuid],
              onClick: (ge) => oe(C.uuid)
            }, [
              $(l(E), {
                class: "ap-upload-check",
                icon: D.value[C.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $(l(E), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Un, [
                r("span", Ln, w(C.filename), 1),
                r("span", Nn, [
                  C.mime_type ? (c(), p("span", Fn, w(C.mime_type), 1)) : I("", !0),
                  Z(C.size) ? (c(), p("span", Dn, w(Z(C.size)), 1)) : I("", !0)
                ])
              ])
            ], 10, On)
          ]))), 128))
        ])) : (c(), p("div", An, [
          $(l(E), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = R(" No uploads found.", -1))
        ]))
      ])) : (c(), p("section", Bn, [
        r("div", Rn, [
          r("div", Pn, [
            r("div", Vn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                R("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              de(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (C) => ee.value = C),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${b.value} a title`,
                autocomplete: "off"
              }, null, 8, qn), [
                [xe, ee.value]
              ])
            ]),
            r("div", zn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              de(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (C) => Q.value = C),
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
          r("div", jn, [
            r("div", Kn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              Y.value ? (c(), p("span", Gn, w(Y.value.toLocaleString()) + " chars", 1)) : I("", !0)
            ]),
            de(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (C) => K.value = C),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${b.value} to add to this knowledge base…`
            }, null, 8, Wn), [
              [xe, K.value]
            ])
          ]),
          r("div", Hn, [
            r("span", Xn, [
              $(l(E), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = R(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !K.value.trim() || l(n).busy.value,
              onClick: k
            }, [
              $(l(E), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: V(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              R(" " + w(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Jn)
          ])
        ])
      ])),
      ke.value ? (c(), p("div", Qn, [
        r("div", Yn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? I("", !0) : (c(), p("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = (C) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Zn, [
          (c(!0), p(te, null, ne(l(n).items.value, (C) => (c(), p("li", {
            key: C.key,
            class: V(["ap-item", C.status])
          }, [
            $(l(E), {
              class: V(["ap-item-ic", ["uploading", "processing", "embedding"].includes(C.status) && "spin"]),
              icon: re(C.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", eo, w(C.name), 1),
            r("span", to, w(C.error || x[C.status]), 1)
          ], 2))), 128))
        ])
      ])) : I("", !0)
    ]));
  }
});
export {
  po as A,
  fo as B,
  Qe as C,
  mo as D,
  ro as E,
  vo as F,
  we as G,
  Ge as H,
  bo as I,
  uo as J,
  ae as N,
  he as _,
  je as a,
  xo as b,
  lo as c,
  Io as d,
  Co as e,
  Oo as f,
  Ao as g,
  $o as h,
  io as i,
  Eo as j,
  So as k,
  Mo as l,
  Uo as m,
  ao as n,
  Me as o,
  To as p,
  Lo as q,
  Ze as r,
  ot as s,
  yo as t,
  wo as u,
  ko as v,
  co as w,
  _o as x,
  go as y,
  ho as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-DN8geGAC.js.map
