import { defineComponent as G, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as ke, normalizeClass as z, createVNode as $, unref as l, withKeys as ot, createCommentVNode as U, Fragment as ie, renderList as de, createBlock as $e, createTextVNode as P, toDisplayString as w, watch as he, onBeforeUnmount as xe, Transition as Ve, withCtx as Ke, withModifiers as Ce, ref as F, computed as V, isRef as Ne, nextTick as st, onMounted as je, withDirectives as be, vModelText as Me, vModelSelect as at } from "vue";
import { Icon as T } from "@iconify/vue";
import { on as Ge, api as J, host as ue } from "@wippy-fe/proxy";
function We(e, s = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || s;
}
function xo(e) {
  return We(e.metadata, e.id);
}
function _e(e) {
  return We(e.metadata, "");
}
function Re(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function me(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Co(e) {
  const s = Re(e.metadata), t = { ...Re(s.source_ref) };
  return delete t.thread_id, delete t.thread_event_id, delete t.thread_event_seq, delete t.external_version, {
    external_id: e.external_id || s.external_id || t.external_id || e.id,
    upload_id: me(t.upload_id) || me(s.upload_id) || void 0,
    source_url: me(t.source_url) || me(t.url) || me(s.source_url) || void 0,
    metadata: {
      title: s.title || s.filename || s.source_url,
      node_id: e.id
    },
    source_ref: Object.keys(t).length ? t : void 0
  };
}
function Ae(e, s) {
  return e ? e.length > s ? e.slice(0, s).trimEnd() + "…" : e : "";
}
const lt = /engine .*not installed|no .*engine|unavailable/i;
function So(e) {
  return lt.test(e || "");
}
const Eo = "This knowledge base's engine is not installed; its contents are unavailable.", pe = {
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
function To(e) {
  if (e.node_type === "document") return pe.document;
  if (e.is_root) return pe.root;
  const s = (e.concept_type || "").toLowerCase();
  return pe[s] || pe.topic;
}
const it = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, ye = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function rt(e) {
  return e < ye.length ? ye[e] : Math.round((ye[0] + (e - ye.length + 1) * 137.508) % 360);
}
function ge(e, s, t) {
  return `hsl(${e} ${s}% ${t}%)`;
}
const De = 34, Pe = 88, ct = 78, ut = 38;
function Mo(e, s) {
  const t = new Map(e.map((p) => [p.id, p])), i = /* @__PURE__ */ new Map();
  for (const p of s)
    p.edge_type !== "subtopic_of" && p.edge_type !== "categorized_as" || t.has(p.from_node_id) && t.has(p.to_node_id) && i.set(p.from_node_id, p.to_node_id);
  const n = (p) => !!t.get(p)?.is_root;
  function a(p) {
    const I = /* @__PURE__ */ new Set();
    let A = p, R = 0;
    for (; !I.has(A); ) {
      I.add(A);
      const L = i.get(A);
      if (L === void 0 || n(L)) return { branch: A, depth: R };
      A = L, R++;
    }
    return { branch: A, depth: R };
  }
  const f = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
  for (const p of e) {
    if (p.is_root) continue;
    const I = a(p.id);
    f.set(p.id, I), x.set(I.branch, Math.max(x.get(I.branch) ?? 0, I.depth));
  }
  const M = [...new Set([...f.values()].map((p) => p.branch))].sort((p, I) => (t.get(p)?.label || "").localeCompare(t.get(I)?.label || "")), g = /* @__PURE__ */ new Map();
  M.forEach((p, I) => g.set(p, rt(I)));
  const h = (p, I, A) => p + (I - p) * A, k = /* @__PURE__ */ new Map();
  for (const p of e) {
    if (p.is_root) {
      k.set(p.id, { ...pe.root });
      continue;
    }
    const I = f.get(p.id);
    if (!I) {
      k.set(p.id, { ...pe.topic });
      continue;
    }
    const A = g.get(I.branch) ?? 220, R = Math.min(Math.max(x.get(I.branch) ?? 0, 1), 4), L = Math.min(1, I.depth / R);
    if (p.node_type === "document") {
      const y = Math.min(84, h(De, Pe, L) + 6);
      k.set(p.id, { fill: ge(A, 32, y), stroke: ge(A, 32, Math.max(50, y - 14)) });
    } else {
      const y = h(De, Pe, L), D = h(ct, ut, L);
      k.set(p.id, { fill: ge(A, D, y), stroke: ge(A, D, Math.max(28, y - 17)) });
    }
  }
  return k;
}
const dt = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function Ao(e, s) {
  const t = /* @__PURE__ */ new Map();
  for (const h of e) t.set(h.id, h);
  const i = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const h of s) {
    if (!dt.has(h.edge_type || "") || !t.has(h.from_node_id) || !t.has(h.to_node_id)) continue;
    const k = i.get(h.to_node_id) || [];
    k.push(h.from_node_id), i.set(h.to_node_id, k), n.add(h.from_node_id);
  }
  const a = (h, k) => (t.get(h)?.label || "").localeCompare(t.get(k)?.label || "");
  function f(h, k, p) {
    const I = t.get(h);
    if (!I || p.has(h)) return null;
    p.add(h);
    const A = (i.get(h) || []).slice().sort(a), R = [];
    for (const L of A) {
      const y = f(L, k + 1, p);
      y && R.push(y);
    }
    return { concept: I, children: R, depth: k };
  }
  const x = e.filter((h) => h.is_root || !n.has(h.id)).map((h) => h.id).sort(a), M = /* @__PURE__ */ new Set(), g = [];
  for (const h of x) {
    const k = f(h, 0, M);
    k && g.push(k);
  }
  for (const h of e)
    if (!M.has(h.id)) {
      const k = f(h.id, 0, M);
      k && g.push(k);
    }
  return g;
}
function Io(e) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), i = (n, a) => {
    s.set(n.concept.id, n), a && t.set(n.concept.id, a);
    for (const f of n.children) i(f, n.concept.id);
  };
  for (const n of e) i(n, null);
  return { byId: s, parentOf: t };
}
function Oo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, i) => t.isFolder !== i.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(i.concept.label || i.concept.id)) : [];
}
function pt(e, s, t) {
  const i = [], n = /* @__PURE__ */ new Set();
  let a = e;
  for (; a && !n.has(a); ) {
    n.add(a);
    const f = s.get(a);
    if (!f) break;
    i.unshift(f.concept), a = t.get(a);
  }
  return i;
}
function Uo(e, s, t) {
  const i = e.trim().toLowerCase();
  if (!i) return [];
  const n = [];
  for (const a of s.values()) {
    if (!(a.concept.label || a.concept.id).toLowerCase().includes(i)) continue;
    const x = pt(a.concept.id, s, t);
    n.push({ concept: a.concept, isFolder: a.children.length > 0, path: x.slice(0, -1) });
  }
  return n.sort((a, f) => a.isFolder !== f.isFolder ? a.isFolder ? -1 : 1 : (a.concept.label || a.concept.id).localeCompare(f.concept.label || f.concept.id)).slice(0, 200);
}
function Fo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const ft = {
  technology: "tabler:cpu",
  person: "tabler:user",
  organization: "tabler:building",
  location: "tabler:map-pin",
  event: "tabler:calendar-event",
  process: "tabler:route",
  product: "tabler:package",
  topic: "tabler:bookmark"
};
function Lo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : ft[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function mt(e, s) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], i = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !i.has(n.from_node_id) && (i.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function No(e, s) {
  const t = [], i = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.from_node_id === e && !i.has(n.to_node_id) && (i.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function Ro(e, s, t) {
  if (!e) return [];
  const i = [], n = /* @__PURE__ */ new Set();
  for (const a of s) {
    if (a.edge_type !== "subtopic_of" || a.to_node_id !== e.id || n.has(a.from_node_id)) continue;
    const f = t.get(a.from_node_id);
    f && (n.add(a.from_node_id), i.push(f));
  }
  return i.sort((a, f) => (a.label || "").localeCompare(f.label || ""));
}
function Do(e, s, t) {
  if (!e) return [];
  const i = [], n = /* @__PURE__ */ new Set(), a = new Set(mt(e, s));
  for (const f of s) {
    if (f.edge_type === "subtopic_of" || f.edge_type === "categorized_as") continue;
    let x = "";
    if (f.from_node_id === e.id) x = f.to_node_id;
    else if (f.to_node_id === e.id) x = f.from_node_id;
    else continue;
    if (!x || n.has(x) || a.has(x)) continue;
    const M = t.get(x);
    M && (n.add(x), i.push({ concept: M, label: it[f.edge_type || ""] || f.edge_type || "related" }));
  }
  return i;
}
function Po(e, s) {
  let t = 0;
  for (const i of s)
    i.edge_type === "subtopic_of" && i.to_node_id === e && t++;
  return t;
}
const vt = ["image/", "audio/", "video/"], ht = /* @__PURE__ */ new Set([
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
function Bo(e) {
  const s = (e || "").toLowerCase();
  return vt.some((t) => s.startsWith(t)) || ht.has(s);
}
function qo(e) {
  const s = e || {}, t = s.source_ref && typeof s.source_ref == "object" ? s.source_ref : {}, i = t.upload_id || s.upload_id;
  if (typeof i == "string" && i.trim()) return i.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof s.external_id == "string" && s.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ve(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function bt(e, s) {
  if (!s) return null;
  const t = ve(e) ? e : {}, i = [
    t,
    ve(t.data) ? t.data : null,
    ve(t.payload) ? t.payload : null,
    ve(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of i) {
    if (n.event !== "component.meta.changed") continue;
    const a = String(n.component_id || ""), f = String(t.topic || n.topic || "");
    if (!(a && a !== s) && !(!a && f !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: a || s,
        meta: ve(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function _t(e, s) {
  if (!e) return null;
  const t = Ge(`component.${e}`, (i) => {
    const n = bt(i, e);
    n && s(n);
  });
  return typeof t == "function" ? t : null;
}
function zo(e) {
  if (typeof e != "object" || !e) return "";
  const { count: s, truncated: t } = e;
  if (typeof s != "number" || !Number.isSafeInteger(s) || s < 0) return "";
  if (s === 0) return t === !0 ? "Indexing — waiting count unknown" : "";
  const i = s > 100 || t === !0;
  return `Indexing — ${`${Math.min(s, 100)}${i ? "+" : ""}`} ${s === 1 && !i ? "change" : "changes"} waiting`;
}
const yt = { class: "kx-shell" }, gt = { class: "kx-rail" }, kt = { class: "kx-main" }, Vo = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (s, t) => (c(), d("div", yt, [
      r("aside", gt, [
        ke(s.$slots, "rail")
      ]),
      r("main", kt, [
        ke(s.$slots, "default")
      ])
    ]));
  }
}), wt = ["aria-label", "title", "disabled"], we = /* @__PURE__ */ G({
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
    return (i, n) => (c(), d("button", {
      class: z(["kx-iconbtn", [
        e.variant === "bordered" && "bordered",
        e.variant === "danger" && "danger",
        e.size === "sm" && "sm",
        e.size === "lg" && "lg",
        e.active && "on"
      ]]),
      "aria-label": e.label,
      title: e.label,
      disabled: e.disabled,
      onClick: n[0] || (n[0] = (a) => t("click"))
    }, [
      $(l(T), {
        icon: e.icon,
        class: z(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, wt));
  }
}), $t = { class: "kx-search" }, xt = ["value", "placeholder"], Be = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: s }) {
    const t = s;
    return (i, n) => (c(), d("div", $t, [
      $(l(T), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      r("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder || "Search…",
        onInput: n[0] || (n[0] = (a) => t("update:modelValue", a.target.value)),
        onKeyup: n[1] || (n[1] = ot((a) => t("enter"), ["enter"]))
      }, null, 40, xt),
      e.modelValue ? (c(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (a) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        $(l(T), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : U("", !0)
    ]));
  }
}), Ct = {
  class: "tb",
  role: "tablist"
}, St = ["aria-selected", "onClick"], Et = {
  key: 1,
  class: "kx-count"
}, Ko = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = s;
    return (i, n) => (c(), d("div", Ct, [
      (c(!0), d(ie, null, de(e.tabs, (a) => (c(), d("button", {
        key: a.id,
        class: z(["tb-tab", { on: e.active === a.id }]),
        role: "tab",
        "aria-selected": e.active === a.id,
        onClick: (f) => t("select", a.id)
      }, [
        a.icon ? (c(), $e(l(T), {
          key: 0,
          icon: a.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : U("", !0),
        P(" " + w(a.label) + " ", 1),
        a.count !== void 0 ? (c(), d("span", Et, w(a.count), 1)) : U("", !0)
      ], 10, St))), 128))
    ]));
  }
}), jo = /* @__PURE__ */ G({
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
    return (i, n) => (c(), d("div", {
      class: z(["kx-notice", e.tone])
    }, [
      $(l(T), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ke(i.$slots, "default")
      ])
    ], 2));
  }
}), Tt = ["aria-label"], Mt = { class: "kx-drawer-h" }, At = { class: "kx-drawer-title" }, It = { class: "kx-drawer-b" }, Go = /* @__PURE__ */ G({
  __name: "KbDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: s }) {
    const t = e, i = s;
    function n(a) {
      a.key === "Escape" && i("close");
    }
    return he(() => t.open, (a) => {
      a ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), xe(() => window.removeEventListener("keydown", n)), (a, f) => (c(), $e(Ve, { name: "kx-drawer" }, {
      default: Ke(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: f[1] || (f[1] = Ce((x) => i("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", Mt, [
              r("span", At, [
                $(l(T), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(w(e.title), 1)
              ]),
              $(we, {
                icon: "tabler:x",
                label: "Close",
                onClick: f[0] || (f[0] = (x) => i("close"))
              })
            ]),
            r("div", It, [
              ke(a.$slots, "default")
            ])
          ], 8, Tt)
        ])) : U("", !0)
      ]),
      _: 3
    }));
  }
});
function Ot(e) {
  const s = F(""), t = F([]), i = F(""), n = F(""), a = F(null), f = F(!1), x = F(""), M = F(!1);
  let g = null;
  function h() {
    g && (clearTimeout(g), g = null), s.value = "", t.value = [], i.value = "", n.value = "", a.value = null, M.value = !1, x.value = "";
  }
  async function k(A = 20) {
    const R = e(), L = s.value.trim();
    if (!L || !R) {
      t.value = [], M.value = !1;
      return;
    }
    f.value = !0, x.value = "", a.value = null, n.value = "", M.value = !0;
    try {
      const { data: y } = await J.get(`/api/v1/kb10/${R}/search?q=${encodeURIComponent(L)}&limit=${A}`);
      y?.success ? (t.value = y.results || [], i.value = "", a.value = y.retrieval?.analysis?.status === "unavailable" ? y.retrieval.analysis : null) : x.value = y?.error || "search failed";
    } catch (y) {
      x.value = y?.response?.data?.error || y?.message || "search error", ue.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      f.value = !1;
    }
  }
  async function p(A = 8) {
    const R = e(), L = s.value.trim();
    if (!L || !R) {
      t.value = [], i.value = "", M.value = !1;
      return;
    }
    f.value = !0, x.value = "", a.value = null, i.value = "", n.value = "", M.value = !0;
    try {
      const { data: y } = await J.post(`/api/v1/knowledge/${R}/ask`, { query: L, limit: A });
      y?.success ? (t.value = y.results || [], y.mode === "query" ? n.value = y.answer : i.value = String(y.answer || "")) : x.value = y?.error || "ask failed";
    } catch (y) {
      const D = y?.response?.data;
      x.value = D?.error || y?.message || "ask error", ue.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      f.value = !1;
    }
  }
  function I(A = 300) {
    if (g && clearTimeout(g), !s.value.trim()) {
      t.value = [], M.value = !1;
      return;
    }
    g = setTimeout(() => k(), A);
  }
  return xe(() => {
    g && clearTimeout(g);
  }), { query: s, results: t, answer: i, queryNotice: n, analysisUnavailable: a, loading: f, error: x, performed: M, run: k, ask: p, runDebounced: I, clear: h };
}
function Ie(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const Ut = {
  key: 0,
  class: "kc-search-pop"
}, Ft = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Lt = {
  key: 1,
  class: "kc-search-state err"
}, Nt = {
  key: 2,
  class: "kc-search-hits"
}, Rt = ["onMousedown"], Dt = { class: "kc-search-hit-h" }, Pt = {
  key: 0,
  class: "kc-search-r-doc"
}, Bt = { class: "kc-search-hit-kind" }, qt = {
  key: 1,
  class: "kc-search-hit-score"
}, zt = { class: "kc-search-hit-body" }, Vt = {
  key: 3,
  class: "kc-search-state"
}, Kt = {
  key: 4,
  class: "kc-search-state"
}, jt = {
  key: 1,
  class: "kc-search-panel"
}, Gt = { class: "kc-search-bar" }, Wt = {
  key: 0,
  class: "kc-search-modes"
}, Ht = { class: "kc-search-field" }, Xt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Jt = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Qt = {
  key: 2,
  class: "kc-search-err"
}, Yt = {
  key: 3,
  class: "kc-search-skel"
}, Zt = {
  key: 0,
  class: "kc-ans"
}, en = { class: "kc-ans-h" }, tn = { class: "kc-ans-body" }, nn = {
  key: 0,
  class: "kc-ans-sim"
}, on = { class: "kc-search-results" }, sn = {
  key: 0,
  class: "kc-search-results-h"
}, an = ["onClick"], ln = { class: "kc-search-r-h" }, rn = {
  key: 0,
  class: "kc-search-r-doc"
}, cn = { class: "kc-search-hit-kind" }, un = {
  key: 1,
  class: "kc-search-r-llm"
}, dn = {
  key: 2,
  class: "kc-search-hit-score"
}, pn = { class: "kc-search-r-body" }, fn = {
  key: 0,
  class: "kc-search-r-open"
}, mn = {
  key: 5,
  class: "kc-search-zero"
}, vn = {
  key: 6,
  class: "kc-search-zero"
}, hn = { class: "kc-search-zero-t" }, Wo = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: s }) {
    const t = e, i = s, { query: n, results: a, answer: f, queryNotice: x, analysisUnavailable: M, loading: g, error: h, performed: k, run: p, ask: I, runDebounced: A, clear: R } = Ot(() => t.kbId), L = F("search"), y = F(!1), D = F(""), K = V(() => t.layout === "panel" && t.ask && L.value === "ask"), Q = V(() => K.value && !x.value), Y = V(() => g.value ? "tabler:hourglass" : K.value ? "tabler:sparkles" : "tabler:arrow-right"), W = V(() => a.value[0]), re = V(() => Q.value ? a.value.slice(1) : a.value), H = V(() => t.layout === "rail" && y.value && n.value.trim() !== "" && (g.value || k.value || !!h.value));
    function oe() {
      n.value.trim() && (D.value = n.value.trim(), K.value ? I(8) : p(20));
    }
    function Z() {
      t.layout === "rail" && A(300);
    }
    function B(te) {
      L.value = te, k.value && n.value.trim() && oe();
    }
    function ee(te) {
      i("open", te), t.layout === "rail" && (R(), y.value = !1);
    }
    return (te, S) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: S[2] || (S[2] = (C) => y.value = !0),
      onFocusout: S[3] || (S[3] = (C) => y.value = !1)
    }, [
      $(Be, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          S[0] || (S[0] = (C) => Ne(n) ? n.value = C : null),
          Z
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: S[1] || (S[1] = (C) => l(p)(20)),
        onClear: l(R)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      H.value ? (c(), d("div", Ut, [
        l(M) ? (c(), d("p", Ft, "Showing direct matches. No model is assigned to " + w(l(M).model) + ".", 1)) : U("", !0),
        l(h) ? (c(), d("div", Lt, [
          $(l(T), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, w(l(h)), 1)
        ])) : l(a).length ? (c(), d("div", Nt, [
          (c(!0), d(ie, null, de(l(a), (C) => (c(), d("button", {
            key: C.id,
            class: "kc-search-hit",
            onMousedown: Ce((se) => ee(C), ["prevent"])
          }, [
            r("span", Dt, [
              l(_e)(C) ? (c(), d("span", Pt, [
                $(l(T), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(w(l(_e)(C)), 1)
              ])) : U("", !0),
              r("span", Bt, w(C.node_type || "result"), 1),
              C.similarity != null ? (c(), d("span", qt, w(l(Ie)(C.similarity)), 1)) : U("", !0)
            ]),
            r("span", zt, w(l(Ae)(C.content, 160)), 1)
          ], 40, Rt))), 128))
        ])) : l(k) && !l(g) ? (c(), d("div", Vt, [
          $(l(T), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          S[9] || (S[9] = r("span", null, "No passages matched.", -1))
        ])) : l(g) ? (c(), d("div", Kt, [
          $(l(T), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          S[10] || (S[10] = r("span", null, "Searching…", -1))
        ])) : U("", !0)
      ])) : U("", !0)
    ], 32)) : (c(), d("div", jt, [
      r("div", Gt, [
        e.ask ? (c(), d("div", Wt, [
          r("button", {
            class: z(["kc-search-mode", { on: L.value === "search" }]),
            onClick: S[4] || (S[4] = (C) => B("search"))
          }, [
            $(l(T), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            S[11] || (S[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: z(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: S[5] || (S[5] = (C) => B("ask"))
          }, [
            $(l(T), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            S[12] || (S[12] = P(" Ask ", -1))
          ], 2)
        ])) : U("", !0),
        r("div", Ht, [
          $(Be, {
            modelValue: l(n),
            "onUpdate:modelValue": S[6] || (S[6] = (C) => Ne(n) ? n.value = C : null),
            placeholder: K.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: oe
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        $(we, {
          icon: Y.value,
          label: K.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(g),
          disabled: !l(n).trim() || l(g),
          onClick: oe
        }, null, 8, ["icon", "label", "active", "disabled"]),
        $(we, {
          icon: "tabler:x",
          label: "Close search",
          onClick: S[7] || (S[7] = (C) => i("close"))
        })
      ]),
      l(M) ? (c(), d("p", Xt, "Showing direct matches. No model is assigned to " + w(l(M).model) + ".", 1)) : U("", !0),
      l(x) ? (c(), d("p", Jt, w(l(x)), 1)) : U("", !0),
      l(h) ? (c(), d("div", Qt, [
        $(l(T), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, w(l(h)), 1)
      ])) : l(g) ? (c(), d("div", Yt, [
        (c(), d(ie, null, de(3, (C) => r("div", {
          key: C,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(a).length ? (c(), d(ie, { key: 4 }, [
        Q.value ? (c(), d("div", Zt, [
          r("div", en, [
            $(l(T), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + w(l(f) ? "Answer" : "Best match") + ' for "' + w(D.value) + '"', 1)
          ]),
          r("p", tn, w(l(f) || l(Ae)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: S[8] || (S[8] = (C) => ee(W.value))
          }, [
            $(l(T), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            S[13] || (S[13] = P(" Open source document ", -1)),
            W.value?.similarity != null ? (c(), d("span", nn, w(l(Ie)(W.value?.similarity)), 1)) : U("", !0)
          ])) : U("", !0)
        ])) : U("", !0),
        r("div", on, [
          Q.value && re.value.length ? (c(), d("div", sn, "Sources")) : U("", !0),
          (c(!0), d(ie, null, de(re.value, (C) => (c(), d("button", {
            key: C.id,
            class: z(["kc-search-result", { link: !!C.parent_id }]),
            onClick: (se) => ee(C)
          }, [
            r("div", ln, [
              l(_e)(C) ? (c(), d("span", rn, [
                $(l(T), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(w(l(_e)(C)), 1)
              ])) : U("", !0),
              r("span", cn, w(C.node_type || "passage"), 1),
              C.llm_score != null ? (c(), d("span", un, "Relevance " + w(Math.round(C.llm_score)), 1)) : U("", !0),
              C.similarity != null ? (c(), d("span", dn, w(l(Ie)(C.similarity)), 1)) : U("", !0)
            ]),
            r("p", pn, w(l(Ae)(C.content, 360)), 1),
            C.parent_id ? (c(), d("span", fn, [
              $(l(T), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              S[14] || (S[14] = P(" Open document", -1))
            ])) : U("", !0)
          ], 10, an))), 128))
        ])
      ], 64)) : l(k) ? (c(), d("div", mn, [
        $(l(T), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        S[15] || (S[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        S[16] || (S[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", vn, [
        $(l(T), {
          icon: K.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", hn, w(K.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), bn = ["aria-label"], _n = { class: "kc-orig-h" }, yn = { class: "kc-orig-title" }, gn = { class: "kc-orig-title-t" }, kn = { class: "kc-orig-b" }, wn = ["content-type", "source-url", "filename"], Ho = /* @__PURE__ */ G({
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
    const t = e, i = s, n = F(null);
    function a() {
      if (t.contained) return;
      const p = n.value;
      p && p.requestFullscreen && !document.fullscreenElement && p.requestFullscreen().catch(() => {
      });
    }
    function f() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function x(p) {
      p.key === "Escape" && i("close");
    }
    function M() {
      t.open && !document.fullscreenElement && i("close");
    }
    he(() => t.open, (p) => {
      p ? (window.addEventListener("keydown", x), st(a)) : (window.removeEventListener("keydown", x), f());
    });
    const g = F(""), h = F("");
    async function k() {
      if (g.value = "", h.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: p } = await J.get(t.sourceUrl);
          p?.success && typeof p.url == "string" && (g.value = p.url, h.value = typeof p.content_type == "string" ? p.content_type : "");
        } catch {
        }
    }
    return he(() => [t.open, t.sourceUrl], k, { immediate: !0 }), je(() => {
      t.contained || document.addEventListener("fullscreenchange", M);
    }), xe(() => {
      document.removeEventListener("fullscreenchange", M), window.removeEventListener("keydown", x), f();
    }), (p, I) => (c(), $e(Ve, { name: "kc-orig" }, {
      default: Ke(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: z(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: I[1] || (I[1] = Ce((A) => i("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", _n, [
              r("span", yn, [
                $(l(T), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", gn, w(e.title), 1)
              ]),
              $(we, {
                icon: "tabler:x",
                label: "Close",
                onClick: I[0] || (I[0] = (A) => i("close"))
              })
            ]),
            r("div", kn, [
              g.value ? (c(), d("wc-resource-view", {
                key: g.value,
                class: "kc-orig-rv",
                "content-type": h.value || e.contentType,
                "source-url": g.value,
                filename: e.filename
              }, null, 8, wn)) : U("", !0)
            ])
          ], 8, bn)
        ], 2)) : U("", !0)
      ]),
      _: 1
    }));
  }
}), Xo = /* @__PURE__ */ G({
  __name: "ViewOriginalButton",
  props: {
    label: {}
  },
  emits: ["open"],
  setup(e, { emit: s }) {
    const t = s;
    return (i, n) => (c(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (a) => t("open"))
    }, [
      $(l(T), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, w(e.label || "View original"), 1)
    ]));
  }
}), $n = { class: "kc-docsum" }, xn = { class: "kc-docsum-h" }, Jo = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const s = e, t = F(!1), i = V(() => s.collapsible === !0 && s.text.length > 320);
    return (n, a) => (c(), d("section", $n, [
      r("div", xn, [
        $(l(T), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + w(e.label), 1)
      ]),
      r("p", {
        class: z(["kc-docsum-b", { clamp: i.value && !t.value }])
      }, w(e.text), 3),
      i.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: a[0] || (a[0] = (f) => t.value = !t.value)
      }, w(t.value ? "Show less" : "Show more"), 1)) : U("", !0)
    ]));
  }
}), Cn = { class: "kx-empty kx-empty-spacious" }, Sn = { class: "kx-empty-title" }, En = {
  key: 0,
  class: "kx-empty-sub"
}, Qo = /* @__PURE__ */ G({
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
    return (i, n) => (c(), d("div", Cn, [
      r("div", {
        class: z(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        $(l(T), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", Sn, w(e.title), 1),
      e.hint ? (c(), d("div", En, w(e.hint), 1)) : U("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (a) => t("cta"))
      }, [
        e.ctaIcon ? (c(), $e(l(T), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : U("", !0),
        P(" " + w(e.cta), 1)
      ])) : U("", !0)
    ]));
  }
}), He = /* @__PURE__ */ new Set([
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
]), Xe = /* @__PURE__ */ new Set([
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
]), Je = /* @__PURE__ */ new Set([
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
]), Qe = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), Tn = [
  ...Array.from(He),
  ...Array.from(Xe)
].map((e) => `.${e}`), Mn = [
  ...Tn,
  "text/*",
  ...Array.from(Qe),
  ...Array.from(Je)
].join(","), An = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function In(e) {
  const s = String(e || "").toLowerCase().split("/").pop() || "", t = s.lastIndexOf(".");
  return t >= 0 ? s.slice(t + 1) : "";
}
function On(e) {
  const s = String(e.type || "").toLowerCase();
  if (s.startsWith("text/") || Je.has(s) || Qe.has(s)) return !0;
  const t = In(e.name);
  return He.has(t) || Xe.has(t);
}
const qe = ["uploading", "processing", "retrying"], ze = ["error", "failed", "enqueue_failed"], Un = ["pending", "uploaded", "queued", "processing"], Oe = "Upload could not be confirmed. Retry this file to continue.";
function Fn(e, s) {
  const t = F([]), i = F(!1), n = F(""), a = F("");
  let f = 0;
  const x = (o) => `${o}${++f}`, M = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), h = [];
  let k, p = !1;
  const I = V(() => i.value || t.value.some((o) => qe.includes(o.status)));
  function A() {
    n.value = "", a.value = "";
  }
  function R() {
    M.clear();
    for (const o of g.values()) o();
    k !== void 0 && clearTimeout(k), k = void 0, p = !1;
    for (const o of h.splice(0)) clearTimeout(o);
    t.value = [];
  }
  function L() {
    t.value = t.value.filter((o) => o.status !== "done");
  }
  function y(o, u) {
    t.value = t.value.map((b) => b.key === o ? { ...b, ...u } : b);
  }
  function D(o) {
    return t.value.find((u) => u.key === o && u.targetKb === e());
  }
  function K(o) {
    return o.status === "error" && o.targetKb === e() && !o.needsFileSelection && (!!o.uuid || M.has(o.key));
  }
  function Q() {
    for (const o of h.splice(0)) clearTimeout(o);
    for (const o of [2500, 8e3, 2e4]) h.push(setTimeout(() => s(!1), o));
  }
  function Y() {
    const o = t.value.filter((u) => u.status === "done").length;
    n.value = o > 1 ? `Added ${o} items to the library.` : "Added to the library.";
  }
  function W() {
    return t.value.some((o) => o.targetKb && qe.includes(o.status));
  }
  function re() {
    !p || W() || (p = !1, k !== void 0 && clearTimeout(k), k = void 0, s(!1), Q());
  }
  function H(o, u, b = !1) {
    D(o) && (y(o, { status: "error", error: u, needsFileSelection: b }), re());
  }
  function oe(o) {
    const u = t.value.find((b) => b.key === o);
    !u || u.status === "done" || (y(o, { status: "done", error: void 0 }), Y(), p = !0, W() && k === void 0 && (k = setTimeout(() => {
      k = void 0, s(!1);
    }, 2500)), re());
  }
  function Z(o, u) {
    t.value = [...t.value, { key: x("q"), name: o, uuid: u, status: "done" }], Y(), s(!0), Q();
  }
  function B(o) {
    return !!o && typeof o == "object" && !Array.isArray(o);
  }
  function ee(o) {
    const u = B(o) ? o : {};
    return String(u.topic || "");
  }
  function te(o) {
    const u = B(o) ? o : {}, b = [
      u,
      B(u.data) ? u.data : null,
      B(u.payload) ? u.payload : null,
      B(u.detail) ? u.detail : null
    ].filter(Boolean);
    for (const _ of b)
      if (typeof _.uuid == "string" && typeof _.status == "string") return _;
    return {};
  }
  function S(o) {
    return `/api/v1/uploads/${encodeURIComponent(o)}`;
  }
  async function C(o) {
    try {
      const { data: u } = await J.get(S(o)), b = B(u?.upload) ? u.upload : B(u) ? u : {};
      if (b.uuid !== o || typeof b.status != "string") throw new Error(Oe);
      return b;
    } catch (u) {
      if (u?.response?.status === 404) return;
      throw u;
    }
  }
  function se(o, u, b, _ = !1) {
    if (!D(o)) return;
    M.delete(o), g.get(o)?.(), y(o, { status: "processing", error: void 0, needsFileSelection: !1 });
    const O = `upload:${u}`, N = [];
    let ne, X = _;
    function q() {
      g.delete(o), ne?.();
      for (const j of N) clearTimeout(j);
    }
    function fe(j, le = !1) {
      if (g.get(o) !== q || !D(o)) return;
      const Te = String(j.status);
      Un.includes(Te) && (X = !1), ze.includes(Te) && (!X || le) ? (q(), H(o, String(j.error || j.error_details || "File processing failed"))) : Te === "completed" && (q(), oe(o));
    }
    async function Ee(j = !1) {
      try {
        const le = await C(u);
        le && fe(le, j);
      } catch {
      }
    }
    if (g.set(o, q), b && fe(b), !g.has(o)) return;
    const Le = Ge("@message", (j) => {
      if (ee(j) !== O) return;
      const le = te(j);
      le.uuid === u && (_ && le.status !== "completed" ? Ee() : fe(le));
    });
    typeof Le == "function" && (ne = Le), b || Ee();
    for (const j of [1500, 5e3, 15e3]) N.push(setTimeout(() => {
      Ee(j === 15e3);
    }, j));
  }
  function Se(o) {
    const u = o.meta || {};
    String(u.status || "") === "error" && (a.value = String(u.last_error || "Embedding failed"));
  }
  let ae = null, E = 0;
  function m(o) {
    const u = ++E;
    if (ae && (ae(), ae = null), !o) return;
    const b = _t(o, Se);
    if (u !== E) {
      b && b();
      return;
    }
    ae = b;
  }
  he(() => e(), (o) => {
    m(o);
  }, { immediate: !0 }), xe(() => {
    R(), E++, ae && ae();
  });
  async function v(o, u, b, _ = !1) {
    try {
      const O = await C(u);
      if (O) {
        se(o, u, O);
        return;
      }
    } catch {
    }
    H(o, b, _);
  }
  async function ce(o, u, b, _) {
    y(o, { status: "uploading", error: void 0 });
    try {
      const O = new FormData();
      O.append("file", b), O.append("upload_token", _);
      const { data: N } = await J.post("/api/v1/uploads", O, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      N?.success && N.uuid === u ? se(o, u) : await v(o, u, N?.error || Oe);
    } catch (O) {
      const N = O?.response?.data, ne = O?.response?.status, X = ne === 400, q = (X || ne === 409) && typeof N?.details == "string" && N.details.trim() ? N.details : N?.error || O?.message || "Upload failed";
      X && M.delete(o), await v(
        o,
        u,
        X ? `${q}. Select this file again to start a new upload.` : q,
        X
      ), ne === 401 && ue.handleError("auth-expired", O);
    }
  }
  async function Ue(o, u) {
    const b = M.get(o);
    if (b)
      try {
        const { data: _ } = await J.post(`/api/v1/knowledge/${encodeURIComponent(u)}/upload-token`);
        if (!D(o)) return;
        if (!_?.success || typeof _.upload_token != "string" || !_.upload_token || typeof _.upload_id != "string" || !_.upload_id) {
          H(o, _?.error || "Could not get an upload token and file ID");
          return;
        }
        b.token = _.upload_token, y(o, { uuid: _.upload_id }), await ce(o, _.upload_id, b.file, _.upload_token);
      } catch (_) {
        H(o, _?.response?.data?.error || _?.message || "Could not get an upload token"), _?.response?.status === 401 && ue.handleError("auth-expired", _);
      }
  }
  async function Ye(o) {
    const u = D(o);
    if (!u?.targetKb || !K(u)) return;
    const b = u.uuid;
    if (!b) {
      y(o, { status: "uploading", error: void 0 }), await Ue(o, u.targetKb);
      return;
    }
    y(o, { status: "retrying", error: void 0 });
    try {
      const _ = await C(b);
      if (!D(o)) return;
      if (_)
        if (!ze.includes(String(_.status)))
          se(o, b, _);
        else {
          M.delete(o);
          const { data: O } = await J.post(`${S(b)}/retry`);
          O?.success && O.upload_id === b ? se(o, b, void 0, !0) : await v(o, b, O?.error || "Could not retry file processing");
        }
      else {
        const O = M.get(o);
        O?.token ? await ce(o, b, O.file, O.token) : H(o, "Upload not found. Select this file again to start a new upload.", !0);
      }
    } catch (_) {
      await v(o, b, _?.response?.data?.error || Oe), _?.response?.status === 401 && ue.handleError("auth-expired", _);
    }
  }
  function Fe(o) {
    const u = e();
    if (u) {
      A();
      for (const b of Array.from(o)) {
        if (!On(b)) {
          a.value = An;
          continue;
        }
        const _ = x("f");
        M.set(_, { file: b }), t.value = [...t.value, { key: _, name: b.name, targetKb: u, status: "uploading" }], Ue(_, u);
      }
    }
  }
  function Ze(o) {
    Fe([o]);
  }
  async function et(o = 100, u = 0) {
    const { data: b } = await J.get(`/api/v1/uploads/list?limit=${o}&offset=${u}`), O = (Array.isArray(b?.uploads) ? b.uploads : []).map((N) => ({
      uuid: String(N.uuid),
      filename: String(N.filename || N.meta && N.meta.filename || N.uuid),
      mime_type: N.mime_type,
      size: N.size,
      status: N.status,
      created_at: N.created_at
    }));
    return { uploads: O, total: Number(b?.meta?.total ?? O.length) };
  }
  async function tt(o, u) {
    const b = e();
    if (!(!b || !o.length)) {
      A(), i.value = !0;
      try {
        const { data: _ } = await J.post(`/api/v1/knowledge/${b}/ingest-upload`, {
          upload_ids: o.map((q) => q.uuid),
          ...u ? { reingest: !0 } : {}
        }, u ? { headers: { "Idempotency-Key": u } } : void 0);
        if (u && _?.reingest !== !0) {
          a.value = "Re-ingest requires an updated Knowledge service";
          return;
        }
        const O = Array.isArray(_?.results) ? _.results : [], N = (q) => o.find((fe) => fe.uuid === q)?.name || q;
        let ne = !1;
        for (const q of O)
          q?.success && (ne = !0, Z(N(String(q.upload_id)), String(q.upload_id)));
        const X = u ? O.find((q) => q?.success === !1) : void 0;
        (X || !ne) && (a.value = X?.error || _?.error || "Could not ingest the selected uploads");
      } catch (_) {
        a.value = _?.response?.data?.error || _?.message || "Ingest error", ue.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
      } finally {
        i.value = !1;
      }
    }
  }
  async function nt(o, u, b) {
    const _ = e();
    if (!(!o.trim() || !_)) {
      A(), i.value = !0;
      try {
        const O = u.trim() ? { title: u.trim() } : void 0, { data: N } = await J.post(`/api/v1/knowledge/${_}/ingest`, { content: o, content_type: b, metadata: O });
        N?.success ? Z(u.trim() || "Pasted text") : a.value = N?.error || "Ingestion failed";
      } catch (O) {
        a.value = O?.response?.data?.error || O?.message || "Ingestion error", ue.handleError(O?.response?.status === 401 ? "auth-expired" : "other", O);
      } finally {
        i.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: I,
    okMsg: V(() => n.value),
    errMsg: V(() => a.value),
    reset: A,
    clearItems: R,
    clearDone: L,
    uploadFile: Ze,
    uploadFiles: Fe,
    canRetry: K,
    retryFile: Ye,
    listMyUploads: et,
    ingestExistingUploads: tt,
    ingestText: nt
  };
}
const Ln = { class: "ap" }, Nn = {
  class: "ap-modes",
  role: "tablist"
}, Rn = ["aria-selected", "onClick"], Dn = {
  key: 0,
  class: "ap-msg err"
}, Pn = {
  key: 1,
  class: "ap-pane"
}, Bn = ["accept"], qn = {
  key: 2,
  class: "ap-pane"
}, zn = { class: "ap-uploads-bar" }, Vn = ["disabled"], Kn = ["disabled"], jn = {
  key: 0,
  class: "ap-uploads-state"
}, Gn = {
  key: 1,
  class: "ap-uploads-state err"
}, Wn = {
  key: 2,
  class: "ap-uploads-state"
}, Hn = {
  key: 3,
  class: "ap-uploads"
}, Xn = ["aria-pressed", "onClick"], Jn = { class: "ap-upload-main" }, Qn = { class: "ap-upload-name" }, Yn = { class: "ap-upload-meta" }, Zn = {
  key: 0,
  class: "mono"
}, eo = { key: 1 }, to = {
  key: 3,
  class: "ap-pane"
}, no = { class: "ap-form" }, oo = { class: "ap-grid2" }, so = { class: "ap-field" }, ao = ["placeholder"], lo = { class: "ap-field" }, io = { class: "ap-field" }, ro = { class: "ap-label-row" }, co = {
  key: 0,
  class: "ap-count"
}, uo = ["placeholder"], po = { class: "ap-actions" }, fo = { class: "ap-hint" }, mo = ["disabled"], vo = {
  key: 4,
  class: "ap-items"
}, ho = { class: "ap-items-h" }, bo = { class: "ap-items-list" }, _o = ["title"], yo = { class: "ap-item-status" }, go = ["aria-label", "onClick"], Yo = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: s }) {
    const t = e, i = s, n = Fn(() => t.kbId, (E) => i("changed", E)), a = F("file"), f = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], x = V(() => t.noun || "content");
    function M(E) {
      n.reset(), a.value = E, E === "uploads" && W();
    }
    const g = F(null), h = F(!1);
    function k() {
      g.value?.click();
    }
    function p(E) {
      const m = E.target.files;
      m?.length && n.uploadFiles(m), g.value && (g.value.value = "");
    }
    function I(E) {
      E.preventDefault(), h.value = !1;
      const m = E.dataTransfer?.files;
      m?.length && n.uploadFiles(m);
    }
    const A = F([]), R = F(!1), L = F(""), y = F(""), D = F({}), K = F(), Q = V(() => {
      const E = y.value.trim().toLowerCase();
      return E ? A.value.filter((m) => m.filename.toLowerCase().includes(E)) : A.value;
    }), Y = V(() => Object.values(D.value).filter(Boolean).length);
    async function W() {
      R.value = !0, L.value = "";
      try {
        const { uploads: E } = await n.listMyUploads(200, 0);
        A.value = E;
      } catch (E) {
        L.value = E?.message || "Could not load your uploads";
      } finally {
        R.value = !1;
      }
    }
    function re(E) {
      D.value = { ...D.value, [E]: !D.value[E] };
    }
    async function H(E = !1) {
      const m = A.value.filter((v) => D.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      if (m.length) {
        if (E) {
          const v = JSON.stringify([t.kbId, ...m.map(({ uuid: ce }) => ce)]);
          K.value?.selection !== v && (K.value = { selection: v, key: crypto.randomUUID() }), await n.ingestExistingUploads(m, K.value.key);
        } else
          await n.ingestExistingUploads(m);
        n.errMsg.value || (D.value = {}, K.value = void 0);
      }
    }
    function oe(E) {
      return !E || E <= 0 ? "" : E < 1024 ? `${E} B` : E < 1024 * 1024 ? `${(E / 1024).toFixed(0)} KB` : `${(E / 1024 / 1024).toFixed(1)} MB`;
    }
    const Z = F(""), B = F(""), ee = F("text/plain"), te = V(() => B.value.length);
    async function S() {
      B.value.trim() && (await n.ingestText(B.value, Z.value, ee.value), n.errMsg.value || (B.value = "", Z.value = ""));
    }
    const C = {
      uploading: "Uploading…",
      processing: "Processing…",
      retrying: "Retrying…",
      done: "Added",
      error: "Failed"
    };
    function se(E) {
      return E === "done" ? "tabler:circle-check" : E === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const Se = V(() => n.items.value.length > 0), ae = V(() => n.items.value.some((E) => E.status === "done"));
    return je(() => {
      a.value === "uploads" && W();
    }), he(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (E, m) => (c(), d("div", Ln, [
      r("div", Nn, [
        (c(), d(ie, null, de(f, (v) => r("button", {
          key: v.id,
          class: z(["ap-mode", { on: a.value === v.id }]),
          role: "tab",
          "aria-selected": a.value === v.id,
          onClick: (ce) => M(v.id)
        }, [
          $(l(T), {
            icon: v.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, w(v.label), 1)
        ], 10, Rn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", Dn, [
        $(l(T), { icon: "tabler:alert-circle" }),
        P(w(l(n).errMsg.value), 1)
      ])) : U("", !0),
      a.value === "file" ? (c(), d("section", Pn, [
        r("input", {
          ref_key: "fileInput",
          ref: g,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(Mn),
          onChange: p
        }, null, 40, Bn),
        r("button", {
          type: "button",
          class: z(["ap-drop", { over: h.value }]),
          onClick: k,
          onDragover: m[0] || (m[0] = Ce((v) => h.value = !0, ["prevent"])),
          onDragleave: m[1] || (m[1] = (v) => h.value = !1),
          onDrop: I
        }, [
          $(l(T), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          m[9] || (m[9] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          m[10] || (m[10] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : a.value === "uploads" ? (c(), d("section", qn, [
        r("div", zn, [
          be(r("input", {
            "onUpdate:modelValue": m[2] || (m[2] = (v) => y.value = v),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [Me, y.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !Y.value || l(n).busy.value,
            onClick: m[3] || (m[3] = (v) => H())
          }, [
            $(l(T), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: z(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + w(Y.value ? `Add ${Y.value} selected` : "Add selected"), 1)
          ], 8, Vn),
          r("button", {
            class: "ap-submit",
            disabled: !Y.value || l(n).busy.value,
            onClick: m[4] || (m[4] = (v) => H(!0))
          }, [
            $(l(T), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            m[11] || (m[11] = P(" Re-ingest selected ", -1))
          ], 8, Kn)
        ]),
        R.value ? (c(), d("div", jn, [
          $(l(T), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          m[12] || (m[12] = P(" Loading your uploads…", -1))
        ])) : L.value ? (c(), d("div", Gn, [
          $(l(T), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + w(L.value), 1)
        ])) : Q.value.length ? (c(), d("ul", Hn, [
          (c(!0), d(ie, null, de(Q.value, (v) => (c(), d("li", {
            key: v.uuid
          }, [
            r("button", {
              type: "button",
              class: z(["ap-upload", { on: D.value[v.uuid] }]),
              "aria-pressed": !!D.value[v.uuid],
              onClick: (ce) => re(v.uuid)
            }, [
              $(l(T), {
                class: "ap-upload-check",
                icon: D.value[v.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $(l(T), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Jn, [
                r("span", Qn, w(v.filename), 1),
                r("span", Yn, [
                  v.mime_type ? (c(), d("span", Zn, w(v.mime_type), 1)) : U("", !0),
                  oe(v.size) ? (c(), d("span", eo, w(oe(v.size)), 1)) : U("", !0)
                ])
              ])
            ], 10, Xn)
          ]))), 128))
        ])) : (c(), d("div", Wn, [
          $(l(T), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          m[13] || (m[13] = P(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", to, [
        r("div", no, [
          r("div", oo, [
            r("div", so, [
              m[14] || (m[14] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                P("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              be(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": m[5] || (m[5] = (v) => Z.value = v),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${x.value} a title`,
                autocomplete: "off"
              }, null, 8, ao), [
                [Me, Z.value]
              ])
            ]),
            r("div", lo, [
              m[16] || (m[16] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              be(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": m[6] || (m[6] = (v) => ee.value = v),
                class: "ap-input"
              }, [...m[15] || (m[15] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [at, ee.value]
              ])
            ])
          ]),
          r("div", io, [
            r("div", ro, [
              m[17] || (m[17] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              te.value ? (c(), d("span", co, w(te.value.toLocaleString()) + " chars", 1)) : U("", !0)
            ]),
            be(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": m[7] || (m[7] = (v) => B.value = v),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${x.value} to add to this knowledge base…`
            }, null, 8, uo), [
              [Me, B.value]
            ])
          ]),
          r("div", po, [
            r("span", fo, [
              $(l(T), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              m[18] || (m[18] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !B.value.trim() || l(n).busy.value,
              onClick: S
            }, [
              $(l(T), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: z(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + w(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, mo)
          ])
        ])
      ])),
      Se.value ? (c(), d("div", vo, [
        r("div", ho, [
          m[19] || (m[19] = r("span", null, "Progress", -1)),
          ae.value && !l(n).busy.value ? (c(), d("button", {
            key: 0,
            type: "button",
            class: "ap-items-clear",
            onClick: m[8] || (m[8] = (v) => l(n).clearDone())
          }, "Clear done")) : U("", !0)
        ]),
        r("ul", bo, [
          (c(!0), d(ie, null, de(l(n).items.value, (v) => (c(), d("li", {
            key: v.key,
            class: z(["ap-item", v.status])
          }, [
            $(l(T), {
              class: z(["ap-item-ic", !["done", "error"].includes(v.status) && "spin"]),
              icon: se(v.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", {
              class: "ap-item-name",
              title: v.name
            }, w(v.name), 9, _o),
            r("span", yo, w(v.error || C[v.status]), 1),
            l(n).canRetry(v) ? (c(), d("button", {
              key: 0,
              type: "button",
              class: "ap-items-clear ap-item-retry",
              "aria-label": `Retry ${v.name}`,
              onClick: (ce) => l(n).retryFile(v.key)
            }, "Retry", 8, go)) : U("", !0)
          ], 2))), 128))
        ])
      ])) : U("", !0)
    ]));
  }
});
export {
  Io as A,
  pt as B,
  Oo as C,
  Uo as D,
  Eo as E,
  Ae as F,
  it as G,
  No as H,
  Mo as I,
  pe as N,
  we as _,
  Bo as a,
  Xo as b,
  Co as c,
  Ko as d,
  Jo as e,
  zo as f,
  Ho as g,
  jo as h,
  So as i,
  Vo as j,
  Wo as k,
  Qo as l,
  Be as m,
  xo as n,
  Go as o,
  Yo as p,
  mt as q,
  Ro as r,
  _t as s,
  Do as t,
  qo as u,
  To as v,
  Lo as w,
  Po as x,
  Fo as y,
  Ao as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-U0Aq1ezl.js.map
