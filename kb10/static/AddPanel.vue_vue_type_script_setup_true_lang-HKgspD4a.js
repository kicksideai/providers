import { defineComponent as G, openBlock as u, createElementBlock as d, createElementVNode as r, renderSlot as ke, normalizeClass as z, createVNode as C, unref as i, withKeys as st, createCommentVNode as U, Fragment as le, renderList as pe, createBlock as $e, createTextVNode as B, toDisplayString as x, watch as he, onBeforeUnmount as xe, Transition as Ke, withCtx as je, withModifiers as Ce, ref as F, computed as V, isRef as Re, nextTick as at, onMounted as Ge, withDirectives as be, vModelText as Me, vModelSelect as it } from "vue";
import { Icon as M } from "@iconify/vue";
import { on as We, api as X, host as de } from "@wippy-fe/proxy";
function He(e, s = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || s;
}
function Co(e) {
  const s = e.metadata;
  if (s?.status === "failed") {
    const t = oe(s.source_title) || oe(s.filename) || oe(s.original_filename) || oe(s.source_url);
    if (t) return t;
  }
  return He(e.metadata, e.id);
}
function _e(e) {
  return He(e.metadata, "");
}
function De(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function oe(e) {
  return typeof e == "string" ? e.trim() : "";
}
function So(e) {
  const s = De(e.metadata), t = { ...De(s.source_ref) };
  return delete t.thread_id, delete t.thread_event_id, delete t.thread_event_seq, delete t.external_version, {
    external_id: e.external_id || s.external_id || t.external_id || e.id,
    upload_id: oe(t.upload_id) || oe(s.upload_id) || void 0,
    source_url: oe(t.source_url) || oe(t.url) || oe(s.source_url) || void 0,
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
function Eo(e) {
  return lt.test(e || "");
}
const To = "This knowledge base's engine is not installed; its contents are unavailable.", fe = {
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
function Mo(e) {
  if (e.node_type === "document") return fe.document;
  if (e.is_root) return fe.root;
  const s = (e.concept_type || "").toLowerCase();
  return fe[s] || fe.topic;
}
const rt = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, ye = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function ct(e) {
  return e < ye.length ? ye[e] : Math.round((ye[0] + (e - ye.length + 1) * 137.508) % 360);
}
function ge(e, s, t) {
  return `hsl(${e} ${s}% ${t}%)`;
}
const Pe = 34, Be = 88, ut = 78, dt = 38;
function Ao(e, s) {
  const t = new Map(e.map((p) => [p.id, p])), l = /* @__PURE__ */ new Map();
  for (const p of s)
    p.edge_type !== "subtopic_of" && p.edge_type !== "categorized_as" || t.has(p.from_node_id) && t.has(p.to_node_id) && l.set(p.from_node_id, p.to_node_id);
  const n = (p) => !!t.get(p)?.is_root;
  function a(p) {
    const O = /* @__PURE__ */ new Set();
    let I = p, N = 0;
    for (; !O.has(I); ) {
      O.add(I);
      const L = l.get(I);
      if (L === void 0 || n(L)) return { branch: I, depth: N };
      I = L, N++;
    }
    return { branch: I, depth: N };
  }
  const v = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map();
  for (const p of e) {
    if (p.is_root) continue;
    const O = a(p.id);
    v.set(p.id, O), S.set(O.branch, Math.max(S.get(O.branch) ?? 0, O.depth));
  }
  const A = [...new Set([...v.values()].map((p) => p.branch))].sort((p, O) => (t.get(p)?.label || "").localeCompare(t.get(O)?.label || "")), k = /* @__PURE__ */ new Map();
  A.forEach((p, O) => k.set(p, ct(O)));
  const b = (p, O, I) => p + (O - p) * I, w = /* @__PURE__ */ new Map();
  for (const p of e) {
    if (p.is_root) {
      w.set(p.id, { ...fe.root });
      continue;
    }
    const O = v.get(p.id);
    if (!O) {
      w.set(p.id, { ...fe.topic });
      continue;
    }
    const I = k.get(O.branch) ?? 220, N = Math.min(Math.max(S.get(O.branch) ?? 0, 1), 4), L = Math.min(1, O.depth / N);
    if (p.node_type === "document") {
      const y = Math.min(84, b(Pe, Be, L) + 6);
      w.set(p.id, { fill: ge(I, 32, y), stroke: ge(I, 32, Math.max(50, y - 14)) });
    } else {
      const y = b(Pe, Be, L), R = b(ut, dt, L);
      w.set(p.id, { fill: ge(I, R, y), stroke: ge(I, R, Math.max(28, y - 17)) });
    }
  }
  return w;
}
const pt = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function Io(e, s) {
  const t = /* @__PURE__ */ new Map();
  for (const b of e) t.set(b.id, b);
  const l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const b of s) {
    if (!pt.has(b.edge_type || "") || !t.has(b.from_node_id) || !t.has(b.to_node_id)) continue;
    const w = l.get(b.to_node_id) || [];
    w.push(b.from_node_id), l.set(b.to_node_id, w), n.add(b.from_node_id);
  }
  const a = (b, w) => (t.get(b)?.label || "").localeCompare(t.get(w)?.label || "");
  function v(b, w, p) {
    const O = t.get(b);
    if (!O || p.has(b)) return null;
    p.add(b);
    const I = (l.get(b) || []).slice().sort(a), N = [];
    for (const L of I) {
      const y = v(L, w + 1, p);
      y && N.push(y);
    }
    return { concept: O, children: N, depth: w };
  }
  const S = e.filter((b) => b.is_root || !n.has(b.id)).map((b) => b.id).sort(a), A = /* @__PURE__ */ new Set(), k = [];
  for (const b of S) {
    const w = v(b, 0, A);
    w && k.push(w);
  }
  for (const b of e)
    if (!A.has(b.id)) {
      const w = v(b.id, 0, A);
      w && k.push(w);
    }
  return k;
}
function Oo(e) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), l = (n, a) => {
    s.set(n.concept.id, n), a && t.set(n.concept.id, a);
    for (const v of n.children) l(v, n.concept.id);
  };
  for (const n of e) l(n, null);
  return { byId: s, parentOf: t };
}
function Uo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, l) => t.isFolder !== l.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(l.concept.label || l.concept.id)) : [];
}
function ft(e, s, t) {
  const l = [], n = /* @__PURE__ */ new Set();
  let a = e;
  for (; a && !n.has(a); ) {
    n.add(a);
    const v = s.get(a);
    if (!v) break;
    l.unshift(v.concept), a = t.get(a);
  }
  return l;
}
function Fo(e, s, t) {
  const l = e.trim().toLowerCase();
  if (!l) return [];
  const n = [];
  for (const a of s.values()) {
    if (!(a.concept.label || a.concept.id).toLowerCase().includes(l)) continue;
    const S = ft(a.concept.id, s, t);
    n.push({ concept: a.concept, isFolder: a.children.length > 0, path: S.slice(0, -1) });
  }
  return n.sort((a, v) => a.isFolder !== v.isFolder ? a.isFolder ? -1 : 1 : (a.concept.label || a.concept.id).localeCompare(v.concept.label || v.concept.id)).slice(0, 200);
}
function Lo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const mt = {
  technology: "tabler:cpu",
  person: "tabler:user",
  organization: "tabler:building",
  location: "tabler:map-pin",
  event: "tabler:calendar-event",
  process: "tabler:route",
  product: "tabler:package",
  topic: "tabler:bookmark"
};
function No(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : mt[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function vt(e, s) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !l.has(n.from_node_id) && (l.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function Ro(e, s) {
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.from_node_id === e && !l.has(n.to_node_id) && (l.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function Do(e, s, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set();
  for (const a of s) {
    if (a.edge_type !== "subtopic_of" || a.to_node_id !== e.id || n.has(a.from_node_id)) continue;
    const v = t.get(a.from_node_id);
    v && (n.add(a.from_node_id), l.push(v));
  }
  return l.sort((a, v) => (a.label || "").localeCompare(v.label || ""));
}
function Po(e, s, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set(), a = new Set(vt(e, s));
  for (const v of s) {
    if (v.edge_type === "subtopic_of" || v.edge_type === "categorized_as") continue;
    let S = "";
    if (v.from_node_id === e.id) S = v.to_node_id;
    else if (v.to_node_id === e.id) S = v.from_node_id;
    else continue;
    if (!S || n.has(S) || a.has(S)) continue;
    const A = t.get(S);
    A && (n.add(S), l.push({ concept: A, label: rt[v.edge_type || ""] || v.edge_type || "related" }));
  }
  return l;
}
function Bo(e, s) {
  let t = 0;
  for (const l of s)
    l.edge_type === "subtopic_of" && l.to_node_id === e && t++;
  return t;
}
const ht = ["image/", "audio/", "video/"], bt = /* @__PURE__ */ new Set([
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
function qo(e) {
  const s = (e || "").toLowerCase();
  return ht.some((t) => s.startsWith(t)) || bt.has(s);
}
function zo(e) {
  const s = e || {}, t = s.source_ref && typeof s.source_ref == "object" ? s.source_ref : {}, l = t.upload_id || s.upload_id;
  if (typeof l == "string" && l.trim()) return l.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof s.external_id == "string" && s.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ve(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function _t(e, s) {
  if (!s) return null;
  const t = ve(e) ? e : {}, l = [
    t,
    ve(t.data) ? t.data : null,
    ve(t.payload) ? t.payload : null,
    ve(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of l) {
    if (n.event !== "component.meta.changed") continue;
    const a = String(n.component_id || ""), v = String(t.topic || n.topic || "");
    if (!(a && a !== s) && !(!a && v !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: a || s,
        meta: ve(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function yt(e, s) {
  if (!e) return null;
  const t = We(`component.${e}`, (l) => {
    const n = _t(l, e);
    n && s(n);
  });
  return typeof t == "function" ? t : null;
}
function Vo(e) {
  if (typeof e != "object" || !e) return "";
  const { count: s, truncated: t } = e;
  if (typeof s != "number" || !Number.isSafeInteger(s) || s < 0) return "";
  if (s === 0) return t === !0 ? "Indexing — waiting count unknown" : "";
  const l = s > 100 || t === !0;
  return `Indexing — ${`${Math.min(s, 100)}${l ? "+" : ""}`} ${s === 1 && !l ? "change" : "changes"} waiting`;
}
const gt = { class: "kx-shell" }, kt = { class: "kx-rail" }, wt = { class: "kx-main" }, Ko = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (s, t) => (u(), d("div", gt, [
      r("aside", kt, [
        ke(s.$slots, "rail")
      ]),
      r("main", wt, [
        ke(s.$slots, "default")
      ])
    ]));
  }
}), $t = ["aria-label", "title", "disabled"], we = /* @__PURE__ */ G({
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
    return (l, n) => (u(), d("button", {
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
      C(i(M), {
        icon: e.icon,
        class: z(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, $t));
  }
}), xt = { class: "kx-search" }, Ct = ["value", "placeholder"], qe = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: s }) {
    const t = s;
    return (l, n) => (u(), d("div", xt, [
      C(i(M), {
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
        onKeyup: n[1] || (n[1] = st((a) => t("enter"), ["enter"]))
      }, null, 40, Ct),
      e.modelValue ? (u(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (a) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        C(i(M), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : U("", !0)
    ]));
  }
}), St = {
  class: "tb",
  role: "tablist"
}, Et = ["aria-selected", "onClick"], Tt = {
  key: 1,
  class: "kx-count"
}, jo = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = s;
    return (l, n) => (u(), d("div", St, [
      (u(!0), d(le, null, pe(e.tabs, (a) => (u(), d("button", {
        key: a.id,
        class: z(["tb-tab", { on: e.active === a.id }]),
        role: "tab",
        "aria-selected": e.active === a.id,
        onClick: (v) => t("select", a.id)
      }, [
        a.icon ? (u(), $e(i(M), {
          key: 0,
          icon: a.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : U("", !0),
        B(" " + x(a.label) + " ", 1),
        a.count !== void 0 ? (u(), d("span", Tt, x(a.count), 1)) : U("", !0)
      ], 10, Et))), 128))
    ]));
  }
}), Go = /* @__PURE__ */ G({
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
    return (l, n) => (u(), d("div", {
      class: z(["kx-notice", e.tone])
    }, [
      C(i(M), {
        icon: i(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ke(l.$slots, "default")
      ])
    ], 2));
  }
}), Mt = ["aria-label"], At = { class: "kx-drawer-h" }, It = { class: "kx-drawer-title" }, Ot = { class: "kx-drawer-b" }, Wo = /* @__PURE__ */ G({
  __name: "KbDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(e, { emit: s }) {
    const t = e, l = s;
    function n(a) {
      a.key === "Escape" && l("close");
    }
    return he(() => t.open, (a) => {
      a ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), xe(() => window.removeEventListener("keydown", n)), (a, v) => (u(), $e(Ke, { name: "kx-drawer" }, {
      default: je(() => [
        e.open ? (u(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: v[1] || (v[1] = Ce((S) => l("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", At, [
              r("span", It, [
                C(i(M), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                B(x(e.title), 1)
              ]),
              C(we, {
                icon: "tabler:x",
                label: "Close",
                onClick: v[0] || (v[0] = (S) => l("close"))
              })
            ]),
            r("div", Ot, [
              ke(a.$slots, "default")
            ])
          ], 8, Mt)
        ])) : U("", !0)
      ]),
      _: 3
    }));
  }
});
function Ut(e) {
  const s = F(""), t = F([]), l = F(""), n = F(""), a = F(null), v = F(!1), S = F(""), A = F(!1);
  let k = null;
  function b() {
    k && (clearTimeout(k), k = null), s.value = "", t.value = [], l.value = "", n.value = "", a.value = null, A.value = !1, S.value = "";
  }
  async function w(I = 20) {
    const N = e(), L = s.value.trim();
    if (!L || !N) {
      t.value = [], A.value = !1;
      return;
    }
    v.value = !0, S.value = "", a.value = null, n.value = "", A.value = !0;
    try {
      const { data: y } = await X.get(`/api/v1/kb10/${N}/search?q=${encodeURIComponent(L)}&limit=${I}`);
      y?.success ? (t.value = y.results || [], l.value = "", a.value = y.retrieval?.analysis?.status === "unavailable" ? y.retrieval.analysis : null) : S.value = y?.error || "search failed";
    } catch (y) {
      S.value = y?.response?.data?.error || y?.message || "search error", de.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      v.value = !1;
    }
  }
  async function p(I = 8) {
    const N = e(), L = s.value.trim();
    if (!L || !N) {
      t.value = [], l.value = "", A.value = !1;
      return;
    }
    v.value = !0, S.value = "", a.value = null, l.value = "", n.value = "", A.value = !0;
    try {
      const { data: y } = await X.post(`/api/v1/knowledge/${N}/ask`, { query: L, limit: I });
      y?.success ? (t.value = y.results || [], y.mode === "query" ? n.value = y.answer : l.value = String(y.answer || "")) : S.value = y?.error || "ask failed";
    } catch (y) {
      const R = y?.response?.data;
      S.value = R?.error || y?.message || "ask error", de.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      v.value = !1;
    }
  }
  function O(I = 300) {
    if (k && clearTimeout(k), !s.value.trim()) {
      t.value = [], A.value = !1;
      return;
    }
    k = setTimeout(() => w(), I);
  }
  return xe(() => {
    k && clearTimeout(k);
  }), { query: s, results: t, answer: l, queryNotice: n, analysisUnavailable: a, loading: v, error: S, performed: A, run: w, ask: p, runDebounced: O, clear: b };
}
function Ie(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const Ft = {
  key: 0,
  class: "kc-search-pop"
}, Lt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Nt = {
  key: 1,
  class: "kc-search-state err"
}, Rt = {
  key: 2,
  class: "kc-search-hits"
}, Dt = ["onMousedown"], Pt = { class: "kc-search-hit-h" }, Bt = {
  key: 0,
  class: "kc-search-r-doc"
}, qt = { class: "kc-search-hit-kind" }, zt = {
  key: 1,
  class: "kc-search-hit-score"
}, Vt = { class: "kc-search-hit-body" }, Kt = {
  key: 3,
  class: "kc-search-state"
}, jt = {
  key: 4,
  class: "kc-search-state"
}, Gt = {
  key: 1,
  class: "kc-search-panel"
}, Wt = { class: "kc-search-bar" }, Ht = {
  key: 0,
  class: "kc-search-modes"
}, Xt = { class: "kc-search-field" }, Jt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, Qt = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Yt = {
  key: 2,
  class: "kc-search-err"
}, Zt = {
  key: 3,
  class: "kc-search-skel"
}, en = {
  key: 0,
  class: "kc-ans"
}, tn = { class: "kc-ans-h" }, nn = { class: "kc-ans-body" }, on = {
  key: 0,
  class: "kc-ans-sim"
}, sn = { class: "kc-search-results" }, an = {
  key: 0,
  class: "kc-search-results-h"
}, ln = ["onClick"], rn = { class: "kc-search-r-h" }, cn = {
  key: 0,
  class: "kc-search-r-doc"
}, un = { class: "kc-search-hit-kind" }, dn = {
  key: 1,
  class: "kc-search-r-llm"
}, pn = {
  key: 2,
  class: "kc-search-hit-score"
}, fn = { class: "kc-search-r-body" }, mn = {
  key: 0,
  class: "kc-search-r-open"
}, vn = {
  key: 5,
  class: "kc-search-zero"
}, hn = {
  key: 6,
  class: "kc-search-zero"
}, bn = { class: "kc-search-zero-t" }, Ho = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: s }) {
    const t = e, l = s, { query: n, results: a, answer: v, queryNotice: S, analysisUnavailable: A, loading: k, error: b, performed: w, run: p, ask: O, runDebounced: I, clear: N } = Ut(() => t.kbId), L = F("search"), y = F(!1), R = F(""), K = V(() => t.layout === "panel" && t.ask && L.value === "ask"), J = V(() => K.value && !S.value), Q = V(() => k.value ? "tabler:hourglass" : K.value ? "tabler:sparkles" : "tabler:arrow-right"), W = V(() => a.value[0]), re = V(() => J.value ? a.value.slice(1) : a.value), H = V(() => t.layout === "rail" && y.value && n.value.trim() !== "" && (k.value || w.value || !!b.value));
    function se() {
      n.value.trim() && (R.value = n.value.trim(), K.value ? O(8) : p(20));
    }
    function Y() {
      t.layout === "rail" && I(300);
    }
    function P(ee) {
      L.value = ee, w.value && n.value.trim() && se();
    }
    function Z(ee) {
      l("open", ee), t.layout === "rail" && (N(), y.value = !1);
    }
    return (ee, $) => e.layout === "rail" ? (u(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: $[2] || ($[2] = (E) => y.value = !0),
      onFocusout: $[3] || ($[3] = (E) => y.value = !1)
    }, [
      C(qe, {
        modelValue: i(n),
        "onUpdate:modelValue": [
          $[0] || ($[0] = (E) => Re(n) ? n.value = E : null),
          Y
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: $[1] || ($[1] = (E) => i(p)(20)),
        onClear: i(N)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      H.value ? (u(), d("div", Ft, [
        i(A) ? (u(), d("p", Lt, "Showing direct matches. No model is assigned to " + x(i(A).model) + ".", 1)) : U("", !0),
        i(b) ? (u(), d("div", Nt, [
          C(i(M), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, x(i(b)), 1)
        ])) : i(a).length ? (u(), d("div", Rt, [
          (u(!0), d(le, null, pe(i(a), (E) => (u(), d("button", {
            key: E.id,
            class: "kc-search-hit",
            onMousedown: Ce((ce) => Z(E), ["prevent"])
          }, [
            r("span", Pt, [
              i(_e)(E) ? (u(), d("span", Bt, [
                C(i(M), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(i(_e)(E)), 1)
              ])) : U("", !0),
              r("span", qt, x(E.node_type || "result"), 1),
              E.similarity != null ? (u(), d("span", zt, x(i(Ie)(E.similarity)), 1)) : U("", !0)
            ]),
            r("span", Vt, x(i(Ae)(E.content, 160)), 1)
          ], 40, Dt))), 128))
        ])) : i(w) && !i(k) ? (u(), d("div", Kt, [
          C(i(M), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          $[9] || ($[9] = r("span", null, "No passages matched.", -1))
        ])) : i(k) ? (u(), d("div", jt, [
          C(i(M), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          $[10] || ($[10] = r("span", null, "Searching…", -1))
        ])) : U("", !0)
      ])) : U("", !0)
    ], 32)) : (u(), d("div", Gt, [
      r("div", Wt, [
        e.ask ? (u(), d("div", Ht, [
          r("button", {
            class: z(["kc-search-mode", { on: L.value === "search" }]),
            onClick: $[4] || ($[4] = (E) => P("search"))
          }, [
            C(i(M), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            $[11] || ($[11] = B(" Search ", -1))
          ], 2),
          r("button", {
            class: z(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: $[5] || ($[5] = (E) => P("ask"))
          }, [
            C(i(M), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            $[12] || ($[12] = B(" Ask ", -1))
          ], 2)
        ])) : U("", !0),
        r("div", Xt, [
          C(qe, {
            modelValue: i(n),
            "onUpdate:modelValue": $[6] || ($[6] = (E) => Re(n) ? n.value = E : null),
            placeholder: K.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: se
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        C(we, {
          icon: Q.value,
          label: K.value ? "Ask" : "Search",
          variant: "bordered",
          active: i(k),
          disabled: !i(n).trim() || i(k),
          onClick: se
        }, null, 8, ["icon", "label", "active", "disabled"]),
        C(we, {
          icon: "tabler:x",
          label: "Close search",
          onClick: $[7] || ($[7] = (E) => l("close"))
        })
      ]),
      i(A) ? (u(), d("p", Jt, "Showing direct matches. No model is assigned to " + x(i(A).model) + ".", 1)) : U("", !0),
      i(S) ? (u(), d("p", Qt, x(i(S)), 1)) : U("", !0),
      i(b) ? (u(), d("div", Yt, [
        C(i(M), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, x(i(b)), 1)
      ])) : i(k) ? (u(), d("div", Zt, [
        (u(), d(le, null, pe(3, (E) => r("div", {
          key: E,
          class: "kc-search-skel-row"
        })), 64))
      ])) : i(a).length ? (u(), d(le, { key: 4 }, [
        J.value ? (u(), d("div", en, [
          r("div", tn, [
            C(i(M), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            B(" " + x(i(v) ? "Answer" : "Best match") + ' for "' + x(R.value) + '"', 1)
          ]),
          r("p", nn, x(i(v) || i(Ae)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (u(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: $[8] || ($[8] = (E) => Z(W.value))
          }, [
            C(i(M), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            $[13] || ($[13] = B(" Open source document ", -1)),
            W.value?.similarity != null ? (u(), d("span", on, x(i(Ie)(W.value?.similarity)), 1)) : U("", !0)
          ])) : U("", !0)
        ])) : U("", !0),
        r("div", sn, [
          J.value && re.value.length ? (u(), d("div", an, "Sources")) : U("", !0),
          (u(!0), d(le, null, pe(re.value, (E) => (u(), d("button", {
            key: E.id,
            class: z(["kc-search-result", { link: !!E.parent_id }]),
            onClick: (ce) => Z(E)
          }, [
            r("div", rn, [
              i(_e)(E) ? (u(), d("span", cn, [
                C(i(M), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(i(_e)(E)), 1)
              ])) : U("", !0),
              r("span", un, x(E.node_type || "passage"), 1),
              E.llm_score != null ? (u(), d("span", dn, "Relevance " + x(Math.round(E.llm_score)), 1)) : U("", !0),
              E.similarity != null ? (u(), d("span", pn, x(i(Ie)(E.similarity)), 1)) : U("", !0)
            ]),
            r("p", fn, x(i(Ae)(E.content, 360)), 1),
            E.parent_id ? (u(), d("span", mn, [
              C(i(M), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              $[14] || ($[14] = B(" Open document", -1))
            ])) : U("", !0)
          ], 10, ln))), 128))
        ])
      ], 64)) : i(w) ? (u(), d("div", vn, [
        C(i(M), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        $[15] || ($[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        $[16] || ($[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (u(), d("div", hn, [
        C(i(M), {
          icon: K.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", bn, x(K.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), _n = ["aria-label"], yn = { class: "kc-orig-h" }, gn = { class: "kc-orig-title" }, kn = { class: "kc-orig-title-t" }, wn = { class: "kc-orig-b" }, $n = ["content-type", "source-url", "filename"], Xo = /* @__PURE__ */ G({
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
    const t = e, l = s, n = F(null);
    function a() {
      if (t.contained) return;
      const p = n.value;
      p && p.requestFullscreen && !document.fullscreenElement && p.requestFullscreen().catch(() => {
      });
    }
    function v() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function S(p) {
      p.key === "Escape" && l("close");
    }
    function A() {
      t.open && !document.fullscreenElement && l("close");
    }
    he(() => t.open, (p) => {
      p ? (window.addEventListener("keydown", S), at(a)) : (window.removeEventListener("keydown", S), v());
    });
    const k = F(""), b = F("");
    async function w() {
      if (k.value = "", b.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: p } = await X.get(t.sourceUrl);
          p?.success && typeof p.url == "string" && (k.value = p.url, b.value = typeof p.content_type == "string" ? p.content_type : "");
        } catch {
        }
    }
    return he(() => [t.open, t.sourceUrl], w, { immediate: !0 }), Ge(() => {
      t.contained || document.addEventListener("fullscreenchange", A);
    }), xe(() => {
      document.removeEventListener("fullscreenchange", A), window.removeEventListener("keydown", S), v();
    }), (p, O) => (u(), $e(Ke, { name: "kc-orig" }, {
      default: je(() => [
        e.open ? (u(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: z(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: O[1] || (O[1] = Ce((I) => l("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", yn, [
              r("span", gn, [
                C(i(M), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", kn, x(e.title), 1)
              ]),
              C(we, {
                icon: "tabler:x",
                label: "Close",
                onClick: O[0] || (O[0] = (I) => l("close"))
              })
            ]),
            r("div", wn, [
              k.value ? (u(), d("wc-resource-view", {
                key: k.value,
                class: "kc-orig-rv",
                "content-type": b.value || e.contentType,
                "source-url": k.value,
                filename: e.filename
              }, null, 8, $n)) : U("", !0)
            ])
          ], 8, _n)
        ], 2)) : U("", !0)
      ]),
      _: 1
    }));
  }
}), Jo = /* @__PURE__ */ G({
  __name: "ViewOriginalButton",
  props: {
    label: {}
  },
  emits: ["open"],
  setup(e, { emit: s }) {
    const t = s;
    return (l, n) => (u(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (a) => t("open"))
    }, [
      C(i(M), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, x(e.label || "View original"), 1)
    ]));
  }
}), xn = { class: "kc-docsum" }, Cn = { class: "kc-docsum-h" }, Qo = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const s = e, t = F(!1), l = V(() => s.collapsible === !0 && s.text.length > 320);
    return (n, a) => (u(), d("section", xn, [
      r("div", Cn, [
        C(i(M), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        B(" " + x(e.label), 1)
      ]),
      r("p", {
        class: z(["kc-docsum-b", { clamp: l.value && !t.value }])
      }, x(e.text), 3),
      l.value ? (u(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: a[0] || (a[0] = (v) => t.value = !t.value)
      }, x(t.value ? "Show less" : "Show more"), 1)) : U("", !0)
    ]));
  }
}), Sn = { class: "kx-empty kx-empty-spacious" }, En = { class: "kx-empty-title" }, Tn = {
  key: 0,
  class: "kx-empty-sub"
}, Yo = /* @__PURE__ */ G({
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
    return (l, n) => (u(), d("div", Sn, [
      r("div", {
        class: z(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        C(i(M), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", En, x(e.title), 1),
      e.hint ? (u(), d("div", Tn, x(e.hint), 1)) : U("", !0),
      e.cta ? (u(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (a) => t("cta"))
      }, [
        e.ctaIcon ? (u(), $e(i(M), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : U("", !0),
        B(" " + x(e.cta), 1)
      ])) : U("", !0)
    ]));
  }
}), Xe = /* @__PURE__ */ new Set([
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
]), Je = /* @__PURE__ */ new Set([
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
]), Qe = /* @__PURE__ */ new Set([
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
]), Ye = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), Mn = [
  ...Array.from(Xe),
  ...Array.from(Je)
].map((e) => `.${e}`), An = [
  ...Mn,
  "text/*",
  ...Array.from(Ye),
  ...Array.from(Qe)
].join(","), In = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function On(e) {
  const s = String(e || "").toLowerCase().split("/").pop() || "", t = s.lastIndexOf(".");
  return t >= 0 ? s.slice(t + 1) : "";
}
function Un(e) {
  const s = String(e.type || "").toLowerCase();
  if (s.startsWith("text/") || Qe.has(s) || Ye.has(s)) return !0;
  const t = On(e.name);
  return Xe.has(t) || Je.has(t);
}
const ze = ["uploading", "processing", "retrying"], Ve = ["error", "failed", "enqueue_failed"], Fn = ["pending", "uploaded", "queued", "processing"], Oe = "Upload could not be confirmed. Retry this file to continue.";
function Ln(e, s) {
  const t = F([]), l = F(!1), n = F(""), a = F("");
  let v = 0;
  const S = (o) => `${o}${++v}`, A = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), b = [];
  let w, p = !1;
  const O = V(() => l.value || t.value.some((o) => ze.includes(o.status)));
  function I() {
    n.value = "", a.value = "";
  }
  function N() {
    A.clear();
    for (const o of k.values()) o();
    w !== void 0 && clearTimeout(w), w = void 0, p = !1;
    for (const o of b.splice(0)) clearTimeout(o);
    t.value = [];
  }
  function L() {
    t.value = t.value.filter((o) => o.status !== "done");
  }
  function y(o, c) {
    t.value = t.value.map((f) => f.key === o ? { ...f, ...c } : f);
  }
  function R(o) {
    return t.value.find((c) => c.key === o && c.targetKb === e());
  }
  function K(o) {
    return o.status === "error" && o.targetKb === e() && !o.needsFileSelection && (!!o.uuid || A.has(o.key));
  }
  function J() {
    for (const o of b.splice(0)) clearTimeout(o);
    for (const o of [2500, 8e3, 2e4]) b.push(setTimeout(() => s(!1), o));
  }
  function Q() {
    const o = t.value.filter((c) => c.status === "done").length;
    n.value = o > 1 ? `Added ${o} items to the library.` : "Added to the library.";
  }
  function W() {
    return t.value.some((o) => o.targetKb && ze.includes(o.status));
  }
  function re() {
    !p || W() || (p = !1, w !== void 0 && clearTimeout(w), w = void 0, s(!1), J());
  }
  function H(o, c, f = !1) {
    R(o) && (y(o, { status: "error", error: c, needsFileSelection: f }), re());
  }
  function se(o) {
    const c = t.value.find((f) => f.key === o);
    !c || c.status === "done" || (y(o, { status: "done", error: void 0 }), Q(), p = !0, W() && w === void 0 && (w = setTimeout(() => {
      w = void 0, s(!1);
    }, 2500)), re());
  }
  function Y(o, c) {
    t.value = [...t.value, { key: S("q"), name: o, uuid: c, status: "done" }], Q(), s(!0), J();
  }
  function P(o) {
    return !!o && typeof o == "object" && !Array.isArray(o);
  }
  function Z(o) {
    const c = P(o) ? o : {};
    return String(c.topic || "");
  }
  function ee(o) {
    const c = P(o) ? o : {}, f = [
      c,
      P(c.data) ? c.data : null,
      P(c.payload) ? c.payload : null,
      P(c.detail) ? c.detail : null
    ].filter(Boolean);
    for (const h of f)
      if (typeof h.uuid == "string" && typeof h.status == "string") return h;
    return {};
  }
  function $(o, c) {
    if (!P(o)) return c;
    const f = o.details;
    return (P(f) ? [f.details, f.message, f.error, o.error] : [f, o.error]).find((T) => typeof T == "string" && !!T.trim()) || c;
  }
  function E(o) {
    return `/api/v1/uploads/${encodeURIComponent(o)}`;
  }
  async function ce(o) {
    try {
      const { data: c } = await X.get(E(o)), f = P(c?.upload) ? c.upload : P(c) ? c : {};
      if (f.uuid !== o || typeof f.status != "string") throw new Error(Oe);
      return f;
    } catch (c) {
      if (c?.response?.status === 404) return;
      throw c;
    }
  }
  function ue(o, c, f, h = !1) {
    if (!R(o)) return;
    A.delete(o), k.get(o)?.(), y(o, { status: "processing", error: void 0, needsFileSelection: !1 });
    const T = `upload:${c}`, D = [];
    let ae, ne = h;
    function q() {
      k.delete(o), ae?.();
      for (const j of D) clearTimeout(j);
    }
    function me(j, ie = !1) {
      if (k.get(o) !== q || !R(o)) return;
      const Te = String(j.status);
      Fn.includes(Te) && (ne = !1), Ve.includes(Te) && (!ne || ie) ? (q(), H(o, String(j.error || j.error_details || "File processing failed"))) : Te === "completed" && (q(), se(o));
    }
    async function Ee(j = !1) {
      try {
        const ie = await ce(c);
        ie && me(ie, j);
      } catch {
      }
    }
    if (k.set(o, q), f && me(f), !k.has(o)) return;
    const Ne = We("@message", (j) => {
      if (Z(j) !== T) return;
      const ie = ee(j);
      ie.uuid === c && (h && ie.status !== "completed" ? Ee() : me(ie));
    });
    typeof Ne == "function" && (ae = Ne), f || Ee();
    for (const j of [1500, 5e3, 15e3]) D.push(setTimeout(() => {
      Ee(j === 15e3);
    }, j));
  }
  function Se(o) {
    const c = o.meta || {};
    String(c.status || "") === "error" && (a.value = String(c.last_error || "Embedding failed"));
  }
  let g = null, m = 0;
  function _(o) {
    const c = ++m;
    if (g && (g(), g = null), !o) return;
    const f = yt(o, Se);
    if (c !== m) {
      f && f();
      return;
    }
    g = f;
  }
  he(() => e(), (o) => {
    _(o);
  }, { immediate: !0 }), xe(() => {
    N(), m++, g && g();
  });
  async function te(o, c, f, h = !1) {
    try {
      const T = await ce(c);
      if (T) {
        ue(o, c, T);
        return;
      }
    } catch {
    }
    H(o, f, h);
  }
  async function Ue(o, c, f, h) {
    y(o, { status: "uploading", error: void 0 });
    try {
      const T = new FormData();
      T.append("file", f), T.append("upload_token", h);
      const { data: D } = await X.post("/api/v1/uploads", T, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      D?.success && D.uuid === c ? ue(o, c) : await te(o, c, $(D, Oe));
    } catch (T) {
      const D = T?.response?.data, ae = T?.response?.status, ne = ae === 400, q = $(D, T?.message || "Upload failed");
      ne && A.delete(o), await te(
        o,
        c,
        ne ? `${q}. Select this file again to start a new upload.` : q,
        ne
      ), ae === 401 && de.handleError("auth-expired", T);
    }
  }
  async function Fe(o, c) {
    const f = A.get(o);
    if (f)
      try {
        const { data: h } = await X.post(`/api/v1/knowledge/${encodeURIComponent(c)}/upload-token`);
        if (!R(o)) return;
        if (!h?.success || typeof h.upload_token != "string" || !h.upload_token || typeof h.upload_id != "string" || !h.upload_id) {
          H(o, $(h, "Could not get an upload token and file ID"));
          return;
        }
        f.token = h.upload_token, y(o, { uuid: h.upload_id }), await Ue(o, h.upload_id, f.file, h.upload_token);
      } catch (h) {
        H(o, $(h?.response?.data, h?.message || "Could not get an upload token")), h?.response?.status === 401 && de.handleError("auth-expired", h);
      }
  }
  async function Ze(o) {
    const c = R(o);
    if (!c?.targetKb || !K(c)) return;
    const f = c.uuid;
    if (!f) {
      y(o, { status: "uploading", error: void 0 }), await Fe(o, c.targetKb);
      return;
    }
    y(o, { status: "retrying", error: void 0 });
    try {
      const h = await ce(f);
      if (!R(o)) return;
      if (h)
        if (!Ve.includes(String(h.status)))
          ue(o, f, h);
        else {
          A.delete(o);
          const { data: T } = await X.post(`${E(f)}/retry`);
          T?.success && T.upload_id === f ? ue(o, f, void 0, !0) : await te(o, f, T?.error || "Could not retry file processing");
        }
      else {
        const T = A.get(o);
        T?.token ? await Ue(o, f, T.file, T.token) : H(o, "Upload not found. Select this file again to start a new upload.", !0);
      }
    } catch (h) {
      await te(o, f, h?.response?.data?.error || Oe), h?.response?.status === 401 && de.handleError("auth-expired", h);
    }
  }
  function Le(o) {
    const c = e();
    if (c) {
      I();
      for (const f of Array.from(o)) {
        if (!Un(f)) {
          a.value = In;
          continue;
        }
        const h = S("f");
        A.set(h, { file: f }), t.value = [...t.value, { key: h, name: f.name, targetKb: c, status: "uploading" }], Fe(h, c);
      }
    }
  }
  function et(o) {
    Le([o]);
  }
  async function tt(o = 100, c = 0) {
    const { data: f } = await X.get(`/api/v1/uploads/list?limit=${o}&offset=${c}`), T = (Array.isArray(f?.uploads) ? f.uploads : []).map((D) => ({
      uuid: String(D.uuid),
      filename: String(D.filename || D.meta && D.meta.filename || D.uuid),
      mime_type: D.mime_type,
      size: D.size,
      status: D.status,
      created_at: D.created_at
    }));
    return { uploads: T, total: Number(f?.meta?.total ?? T.length) };
  }
  async function nt(o, c) {
    const f = e();
    if (!(!f || !o.length)) {
      I(), l.value = !0;
      try {
        const { data: h } = await X.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: o.map((q) => q.uuid),
          ...c ? { reingest: !0 } : {}
        }, c ? { headers: { "Idempotency-Key": c } } : void 0);
        if (c && h?.reingest !== !0) {
          a.value = "Re-ingest requires an updated Knowledge service";
          return;
        }
        const T = Array.isArray(h?.results) ? h.results : [], D = (q) => o.find((me) => me.uuid === q)?.name || q;
        let ae = !1;
        for (const q of T)
          q?.success && (ae = !0, Y(D(String(q.upload_id)), String(q.upload_id)));
        const ne = c ? T.find((q) => q?.success === !1) : void 0;
        (ne || !ae) && (a.value = ne?.error || h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        a.value = h?.response?.data?.error || h?.message || "Ingest error", de.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        l.value = !1;
      }
    }
  }
  async function ot(o, c, f) {
    const h = e();
    if (!(!o.trim() || !h)) {
      I(), l.value = !0;
      try {
        const T = c.trim() ? { title: c.trim() } : void 0, { data: D } = await X.post(`/api/v1/knowledge/${h}/ingest`, { content: o, content_type: f, metadata: T });
        D?.success ? Y(c.trim() || "Pasted text") : a.value = D?.error || "Ingestion failed";
      } catch (T) {
        a.value = T?.response?.data?.error || T?.message || "Ingestion error", de.handleError(T?.response?.status === 401 ? "auth-expired" : "other", T);
      } finally {
        l.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: O,
    okMsg: V(() => n.value),
    errMsg: V(() => a.value),
    reset: I,
    clearItems: N,
    clearDone: L,
    uploadFile: et,
    uploadFiles: Le,
    canRetry: K,
    retryFile: Ze,
    listMyUploads: tt,
    ingestExistingUploads: nt,
    ingestText: ot
  };
}
const Nn = { class: "ap" }, Rn = {
  class: "ap-modes",
  role: "tablist"
}, Dn = ["aria-selected", "onClick"], Pn = {
  key: 0,
  class: "ap-msg err"
}, Bn = {
  key: 1,
  class: "ap-pane"
}, qn = ["accept"], zn = {
  key: 2,
  class: "ap-pane"
}, Vn = { class: "ap-uploads-bar" }, Kn = ["disabled"], jn = ["disabled"], Gn = {
  key: 0,
  class: "ap-uploads-state"
}, Wn = {
  key: 1,
  class: "ap-uploads-state err"
}, Hn = {
  key: 2,
  class: "ap-uploads-state"
}, Xn = {
  key: 3,
  class: "ap-uploads"
}, Jn = ["aria-pressed", "onClick"], Qn = { class: "ap-upload-main" }, Yn = { class: "ap-upload-name" }, Zn = { class: "ap-upload-meta" }, eo = {
  key: 0,
  class: "mono"
}, to = { key: 1 }, no = {
  key: 3,
  class: "ap-pane"
}, oo = { class: "ap-form" }, so = { class: "ap-grid2" }, ao = { class: "ap-field" }, io = ["placeholder"], lo = { class: "ap-field" }, ro = { class: "ap-field" }, co = { class: "ap-label-row" }, uo = {
  key: 0,
  class: "ap-count"
}, po = ["placeholder"], fo = { class: "ap-actions" }, mo = { class: "ap-hint" }, vo = ["disabled"], ho = {
  key: 4,
  class: "ap-items"
}, bo = { class: "ap-items-h" }, _o = { class: "ap-items-list" }, yo = ["title"], go = { class: "ap-item-status" }, ko = ["aria-label", "onClick"], Zo = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: s }) {
    const t = e, l = s, n = Ln(() => t.kbId, (g) => l("changed", g)), a = F("file"), v = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], S = V(() => t.noun || "content");
    function A(g) {
      n.reset(), a.value = g, g === "uploads" && W();
    }
    const k = F(null), b = F(!1);
    function w() {
      k.value?.click();
    }
    function p(g) {
      const m = g.target.files;
      m?.length && n.uploadFiles(m), k.value && (k.value.value = "");
    }
    function O(g) {
      g.preventDefault(), b.value = !1;
      const m = g.dataTransfer?.files;
      m?.length && n.uploadFiles(m);
    }
    const I = F([]), N = F(!1), L = F(""), y = F(""), R = F({}), K = F(), J = V(() => {
      const g = y.value.trim().toLowerCase();
      return g ? I.value.filter((m) => m.filename.toLowerCase().includes(g)) : I.value;
    }), Q = V(() => Object.values(R.value).filter(Boolean).length);
    async function W() {
      N.value = !0, L.value = "";
      try {
        const { uploads: g } = await n.listMyUploads(200, 0);
        I.value = g;
      } catch (g) {
        L.value = g?.message || "Could not load your uploads";
      } finally {
        N.value = !1;
      }
    }
    function re(g) {
      R.value = { ...R.value, [g]: !R.value[g] };
    }
    async function H(g = !1) {
      const m = I.value.filter((_) => R.value[_.uuid]).map((_) => ({ uuid: _.uuid, name: _.filename }));
      if (m.length) {
        if (g) {
          const _ = JSON.stringify([t.kbId, ...m.map(({ uuid: te }) => te)]);
          K.value?.selection !== _ && (K.value = { selection: _, key: crypto.randomUUID() }), await n.ingestExistingUploads(m, K.value.key);
        } else
          await n.ingestExistingUploads(m);
        n.errMsg.value || (R.value = {}, K.value = void 0);
      }
    }
    function se(g) {
      return !g || g <= 0 ? "" : g < 1024 ? `${g} B` : g < 1024 * 1024 ? `${(g / 1024).toFixed(0)} KB` : `${(g / 1024 / 1024).toFixed(1)} MB`;
    }
    const Y = F(""), P = F(""), Z = F("text/plain"), ee = V(() => P.value.length);
    async function $() {
      P.value.trim() && (await n.ingestText(P.value, Y.value, Z.value), n.errMsg.value || (P.value = "", Y.value = ""));
    }
    const E = {
      uploading: "Uploading…",
      processing: "Processing…",
      retrying: "Retrying…",
      done: "Added",
      error: "Failed"
    };
    function ce(g) {
      return g === "done" ? "tabler:circle-check" : g === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ue = V(() => [
      ...n.items.value.filter((g) => g.status === "error"),
      ...n.items.value.filter((g) => g.status !== "error")
    ]), Se = V(() => n.items.value.some((g) => g.status === "done"));
    return Ge(() => {
      a.value === "uploads" && W();
    }), he(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (g, m) => (u(), d("div", Nn, [
      r("div", Rn, [
        (u(), d(le, null, pe(v, (_) => r("button", {
          key: _.id,
          class: z(["ap-mode", { on: a.value === _.id }]),
          role: "tab",
          "aria-selected": a.value === _.id,
          onClick: (te) => A(_.id)
        }, [
          C(i(M), {
            icon: _.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, x(_.label), 1)
        ], 10, Dn)), 64))
      ]),
      i(n).errMsg.value ? (u(), d("div", Pn, [
        C(i(M), { icon: "tabler:alert-circle" }),
        B(x(i(n).errMsg.value), 1)
      ])) : U("", !0),
      a.value === "file" ? (u(), d("section", Bn, [
        r("input", {
          ref_key: "fileInput",
          ref: k,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: i(An),
          onChange: p
        }, null, 40, qn),
        r("button", {
          type: "button",
          class: z(["ap-drop", { over: b.value }]),
          onClick: w,
          onDragover: m[0] || (m[0] = Ce((_) => b.value = !0, ["prevent"])),
          onDragleave: m[1] || (m[1] = (_) => b.value = !1),
          onDrop: O
        }, [
          C(i(M), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          m[9] || (m[9] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          m[10] || (m[10] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : a.value === "uploads" ? (u(), d("section", zn, [
        r("div", Vn, [
          be(r("input", {
            "onUpdate:modelValue": m[2] || (m[2] = (_) => y.value = _),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [Me, y.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !Q.value || i(n).busy.value,
            onClick: m[3] || (m[3] = (_) => H())
          }, [
            C(i(M), {
              icon: i(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: z(i(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + x(Q.value ? `Add ${Q.value} selected` : "Add selected"), 1)
          ], 8, Kn),
          r("button", {
            class: "ap-submit",
            disabled: !Q.value || i(n).busy.value,
            onClick: m[4] || (m[4] = (_) => H(!0))
          }, [
            C(i(M), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            m[11] || (m[11] = B(" Re-ingest selected ", -1))
          ], 8, jn)
        ]),
        N.value ? (u(), d("div", Gn, [
          C(i(M), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          m[12] || (m[12] = B(" Loading your uploads…", -1))
        ])) : L.value ? (u(), d("div", Wn, [
          C(i(M), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          B(" " + x(L.value), 1)
        ])) : J.value.length ? (u(), d("ul", Xn, [
          (u(!0), d(le, null, pe(J.value, (_) => (u(), d("li", {
            key: _.uuid
          }, [
            r("button", {
              type: "button",
              class: z(["ap-upload", { on: R.value[_.uuid] }]),
              "aria-pressed": !!R.value[_.uuid],
              onClick: (te) => re(_.uuid)
            }, [
              C(i(M), {
                class: "ap-upload-check",
                icon: R.value[_.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              C(i(M), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Qn, [
                r("span", Yn, x(_.filename), 1),
                r("span", Zn, [
                  _.mime_type ? (u(), d("span", eo, x(_.mime_type), 1)) : U("", !0),
                  se(_.size) ? (u(), d("span", to, x(se(_.size)), 1)) : U("", !0)
                ])
              ])
            ], 10, Jn)
          ]))), 128))
        ])) : (u(), d("div", Hn, [
          C(i(M), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          m[13] || (m[13] = B(" No uploads found.", -1))
        ]))
      ])) : (u(), d("section", no, [
        r("div", oo, [
          r("div", so, [
            r("div", ao, [
              m[14] || (m[14] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                B("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              be(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": m[5] || (m[5] = (_) => Y.value = _),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${S.value} a title`,
                autocomplete: "off"
              }, null, 8, io), [
                [Me, Y.value]
              ])
            ]),
            r("div", lo, [
              m[16] || (m[16] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              be(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": m[6] || (m[6] = (_) => Z.value = _),
                class: "ap-input"
              }, [...m[15] || (m[15] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [it, Z.value]
              ])
            ])
          ]),
          r("div", ro, [
            r("div", co, [
              m[17] || (m[17] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              ee.value ? (u(), d("span", uo, x(ee.value.toLocaleString()) + " chars", 1)) : U("", !0)
            ]),
            be(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": m[7] || (m[7] = (_) => P.value = _),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${S.value} to add to this knowledge base…`
            }, null, 8, po), [
              [Me, P.value]
            ])
          ]),
          r("div", fo, [
            r("span", mo, [
              C(i(M), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              m[18] || (m[18] = B(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !P.value.trim() || i(n).busy.value,
              onClick: $
            }, [
              C(i(M), {
                icon: i(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: z(i(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              B(" " + x(i(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, vo)
          ])
        ])
      ])),
      ue.value.length ? (u(), d("div", ho, [
        r("div", bo, [
          m[19] || (m[19] = r("span", null, "Progress", -1)),
          Se.value && !i(n).busy.value ? (u(), d("button", {
            key: 0,
            type: "button",
            class: "ap-items-clear",
            onClick: m[8] || (m[8] = (_) => i(n).clearDone())
          }, "Clear done")) : U("", !0)
        ]),
        r("ul", _o, [
          (u(!0), d(le, null, pe(ue.value, (_) => (u(), d("li", {
            key: _.key,
            class: z(["ap-item", _.status])
          }, [
            C(i(M), {
              class: z(["ap-item-ic", !["done", "error"].includes(_.status) && "spin"]),
              icon: ce(_.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", {
              class: "ap-item-name",
              title: _.name
            }, x(_.name), 9, yo),
            r("span", go, x(_.error || E[_.status]), 1),
            i(n).canRetry(_) ? (u(), d("button", {
              key: 0,
              type: "button",
              class: "ap-items-clear ap-item-retry",
              "aria-label": `Retry ${_.name}`,
              onClick: (te) => i(n).retryFile(_.key)
            }, "Retry", 8, ko)) : U("", !0)
          ], 2))), 128))
        ])
      ])) : U("", !0)
    ]));
  }
});
export {
  Oo as A,
  ft as B,
  Uo as C,
  Fo as D,
  To as E,
  Ae as F,
  rt as G,
  Ro as H,
  Ao as I,
  fe as N,
  we as _,
  qo as a,
  Jo as b,
  So as c,
  jo as d,
  Qo as e,
  Vo as f,
  Xo as g,
  Go as h,
  Eo as i,
  Ko as j,
  Ho as k,
  Yo as l,
  qe as m,
  Co as n,
  Wo as o,
  Zo as p,
  vt as q,
  Do as r,
  yt as s,
  Po as t,
  zo as u,
  Mo as v,
  No as w,
  Bo as x,
  Lo as y,
  Io as z
};
