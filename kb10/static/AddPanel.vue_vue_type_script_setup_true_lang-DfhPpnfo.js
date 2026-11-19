import { defineComponent as G, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as ke, normalizeClass as q, createVNode as g, unref as a, withKeys as ze, createCommentVNode as A, Fragment as ee, renderList as oe, createBlock as ye, createTextVNode as R, toDisplayString as y, watch as pe, onBeforeUnmount as ge, Transition as Oe, withCtx as Ue, withModifiers as we, ref as O, computed as z, isRef as Ee, nextTick as Ve, onMounted as Le, withDirectives as me, vModelText as $e, vModelSelect as je } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Ne, api as Q, host as de } from "@wippy-fe/proxy";
function Fe(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function lo(e) {
  return Fe(e.metadata, e.id);
}
function ve(e) {
  return Fe(e.metadata, "");
}
function Te(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function re(e) {
  return typeof e == "string" ? e.trim() : "";
}
function io(e) {
  const o = Te(e.metadata), t = { ...Te(o.source_ref) };
  return delete t.thread_id, delete t.thread_event_id, delete t.thread_event_seq, delete t.external_version, {
    external_id: e.external_id || o.external_id || t.external_id || e.id,
    upload_id: re(t.upload_id) || re(o.upload_id) || void 0,
    source_url: re(t.source_url) || re(t.url) || re(o.source_url) || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id
    },
    source_ref: Object.keys(t).length ? t : void 0
  };
}
function xe(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const Ke = /engine .*not installed|no .*engine|unavailable/i;
function ro(e) {
  return Ke.test(e || "");
}
const co = "This knowledge base's engine is not installed; its contents are unavailable.", ae = {
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
function uo(e) {
  if (e.node_type === "document") return ae.document;
  if (e.is_root) return ae.root;
  const o = (e.concept_type || "").toLowerCase();
  return ae[o] || ae.topic;
}
const Ge = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, he = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function We(e) {
  return e < he.length ? he[e] : Math.round((he[0] + (e - he.length + 1) * 137.508) % 360);
}
function be(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Me = 34, Ie = 88, He = 78, Xe = 38;
function po(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), l = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && l.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const E = /* @__PURE__ */ new Set();
    let I = u, N = 0;
    for (; !E.has(I); ) {
      E.add(I);
      const L = l.get(I);
      if (L === void 0 || n(L)) return { branch: I, depth: N };
      I = L, N++;
    }
    return { branch: I, depth: N };
  }
  const f = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const E = s(u.id);
    f.set(u.id, E), w.set(E.branch, Math.max(w.get(E.branch) ?? 0, E.depth));
  }
  const U = [...new Set([...f.values()].map((u) => u.branch))].sort((u, E) => (t.get(u)?.label || "").localeCompare(t.get(E)?.label || "")), x = /* @__PURE__ */ new Map();
  U.forEach((u, E) => x.set(u, We(E)));
  const v = (u, E, I) => u + (E - u) * I, T = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      T.set(u.id, { ...ae.root });
      continue;
    }
    const E = f.get(u.id);
    if (!E) {
      T.set(u.id, { ...ae.topic });
      continue;
    }
    const I = x.get(E.branch) ?? 220, N = Math.min(Math.max(w.get(E.branch) ?? 0, 1), 4), L = Math.min(1, E.depth / N);
    if (u.node_type === "document") {
      const b = Math.min(84, v(Me, Ie, L) + 6);
      T.set(u.id, { fill: be(I, 32, b), stroke: be(I, 32, Math.max(50, b - 14)) });
    } else {
      const b = v(Me, Ie, L), F = v(He, Xe, L);
      T.set(u.id, { fill: be(I, F, b), stroke: be(I, F, Math.max(28, b - 17)) });
    }
  }
  return T;
}
const Je = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function fo(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const v of e) t.set(v.id, v);
  const l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const v of o) {
    if (!Je.has(v.edge_type || "") || !t.has(v.from_node_id) || !t.has(v.to_node_id)) continue;
    const T = l.get(v.to_node_id) || [];
    T.push(v.from_node_id), l.set(v.to_node_id, T), n.add(v.from_node_id);
  }
  const s = (v, T) => (t.get(v)?.label || "").localeCompare(t.get(T)?.label || "");
  function f(v, T, u) {
    const E = t.get(v);
    if (!E || u.has(v)) return null;
    u.add(v);
    const I = (l.get(v) || []).slice().sort(s), N = [];
    for (const L of I) {
      const b = f(L, T + 1, u);
      b && N.push(b);
    }
    return { concept: E, children: N, depth: T };
  }
  const w = e.filter((v) => v.is_root || !n.has(v.id)).map((v) => v.id).sort(s), U = /* @__PURE__ */ new Set(), x = [];
  for (const v of w) {
    const T = f(v, 0, U);
    T && x.push(T);
  }
  for (const v of e)
    if (!U.has(v.id)) {
      const T = f(v.id, 0, U);
      T && x.push(T);
    }
  return x;
}
function mo(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), l = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const f of n.children) l(f, n.concept.id);
  };
  for (const n of e) l(n, null);
  return { byId: o, parentOf: t };
}
function vo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, l) => t.isFolder !== l.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(l.concept.label || l.concept.id)) : [];
}
function Qe(e, o, t) {
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
function ho(e, o, t) {
  const l = e.trim().toLowerCase();
  if (!l) return [];
  const n = [];
  for (const s of o.values()) {
    if (!(s.concept.label || s.concept.id).toLowerCase().includes(l)) continue;
    const w = Qe(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: w.slice(0, -1) });
  }
  return n.sort((s, f) => s.isFolder !== f.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(f.concept.label || f.concept.id)).slice(0, 200);
}
function bo(e) {
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
function ko(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Ye[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function Ze(e, o) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !l.has(n.from_node_id) && (l.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function _o(e, o) {
  const t = [], l = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.from_node_id === e && !l.has(n.to_node_id) && (l.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function yo(e, o, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set();
  for (const s of o) {
    if (s.edge_type !== "subtopic_of" || s.to_node_id !== e.id || n.has(s.from_node_id)) continue;
    const f = t.get(s.from_node_id);
    f && (n.add(s.from_node_id), l.push(f));
  }
  return l.sort((s, f) => (s.label || "").localeCompare(f.label || ""));
}
function go(e, o, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set(), s = new Set(Ze(e, o));
  for (const f of o) {
    if (f.edge_type === "subtopic_of" || f.edge_type === "categorized_as") continue;
    let w = "";
    if (f.from_node_id === e.id) w = f.to_node_id;
    else if (f.to_node_id === e.id) w = f.from_node_id;
    else continue;
    if (!w || n.has(w) || s.has(w)) continue;
    const U = t.get(w);
    U && (n.add(w), l.push({ concept: U, label: Ge[f.edge_type || ""] || f.edge_type || "related" }));
  }
  return l;
}
function wo(e, o) {
  let t = 0;
  for (const l of o)
    l.edge_type === "subtopic_of" && l.to_node_id === e && t++;
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
function $o(e) {
  const o = (e || "").toLowerCase();
  return et.some((t) => o.startsWith(t)) || tt.has(o);
}
function xo(e) {
  const o = e || {}, t = o.source_ref && typeof o.source_ref == "object" ? o.source_ref : {}, l = t.upload_id || o.upload_id;
  if (typeof l == "string" && l.trim()) return l.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof o.external_id == "string" && o.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ce(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function nt(e, o) {
  if (!o) return null;
  const t = ce(e) ? e : {}, l = [
    t,
    ce(t.data) ? t.data : null,
    ce(t.payload) ? t.payload : null,
    ce(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of l) {
    if (n.event !== "component.meta.changed") continue;
    const s = String(n.component_id || ""), f = String(t.topic || n.topic || "");
    if (!(s && s !== o) && !(!s && f !== `component.${o}`))
      return {
        event: "component.meta.changed",
        component_id: s || o,
        meta: ce(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function ot(e, o) {
  if (!e) return null;
  const t = Ne(`component.${e}`, (l) => {
    const n = nt(l, e);
    n && o(n);
  });
  return typeof t == "function" ? t : null;
}
function So(e) {
  if (typeof e != "object" || !e) return "";
  const { count: o, truncated: t } = e;
  if (typeof o != "number" || !Number.isSafeInteger(o) || o < 0) return "";
  if (o === 0) return t === !0 ? "Indexing — waiting count unknown" : "";
  const l = o > 100 || t === !0;
  return `Indexing — ${`${Math.min(o, 100)}${l ? "+" : ""}`} ${o === 1 && !l ? "change" : "changes"} waiting`;
}
const st = { class: "kx-shell" }, at = { class: "kx-rail" }, lt = { class: "kx-main" }, Co = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", st, [
      r("aside", at, [
        ke(o.$slots, "rail")
      ]),
      r("main", lt, [
        ke(o.$slots, "default")
      ])
    ]));
  }
}), it = ["aria-label", "title", "disabled"], _e = /* @__PURE__ */ G({
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
    ], 10, it));
  }
}), rt = { class: "kx-search" }, ct = ["value", "placeholder"], Ae = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", rt, [
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
        onKeyup: n[1] || (n[1] = ze((s) => t("enter"), ["enter"]))
      }, null, 40, ct),
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
      ])) : A("", !0)
    ]));
  }
}), ut = {
  class: "tb",
  role: "tablist"
}, dt = ["aria-selected", "onClick"], pt = {
  key: 1,
  class: "kx-count"
}, Eo = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", ut, [
      (c(!0), d(ee, null, oe(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: q(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (f) => t("select", s.id)
      }, [
        s.icon ? (c(), ye(a(C), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        R(" " + y(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", pt, y(s.count), 1)) : A("", !0)
      ], 10, dt))), 128))
    ]));
  }
}), To = /* @__PURE__ */ G({
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
        ke(l.$slots, "default")
      ])
    ], 2));
  }
}), ft = ["aria-label"], mt = { class: "kx-drawer-h" }, vt = { class: "kx-drawer-title" }, ht = { class: "kx-drawer-b" }, Mo = /* @__PURE__ */ G({
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
    return pe(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), ge(() => window.removeEventListener("keydown", n)), (s, f) => (c(), ye(Oe, { name: "kx-drawer" }, {
      default: Ue(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: f[1] || (f[1] = we((w) => l("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", mt, [
              r("span", vt, [
                g(a(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                R(y(e.title), 1)
              ]),
              g(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: f[0] || (f[0] = (w) => l("close"))
              })
            ]),
            r("div", ht, [
              ke(s.$slots, "default")
            ])
          ], 8, ft)
        ])) : A("", !0)
      ]),
      _: 3
    }));
  }
});
function bt(e) {
  const o = O(""), t = O([]), l = O(""), n = O(""), s = O(null), f = O(!1), w = O(""), U = O(!1);
  let x = null;
  function v() {
    x && (clearTimeout(x), x = null), o.value = "", t.value = [], l.value = "", n.value = "", s.value = null, U.value = !1, w.value = "";
  }
  async function T(I = 20) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], U.value = !1;
      return;
    }
    f.value = !0, w.value = "", s.value = null, n.value = "", U.value = !0;
    try {
      const { data: b } = await Q.get(`/api/v1/kb10/${N}/search?q=${encodeURIComponent(L)}&limit=${I}`);
      b?.success ? (t.value = b.results || [], l.value = "", s.value = b.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null) : w.value = b?.error || "search failed";
    } catch (b) {
      w.value = b?.response?.data?.error || b?.message || "search error", de.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      f.value = !1;
    }
  }
  async function u(I = 8) {
    const N = e(), L = o.value.trim();
    if (!L || !N) {
      t.value = [], l.value = "", U.value = !1;
      return;
    }
    f.value = !0, w.value = "", s.value = null, l.value = "", n.value = "", U.value = !0;
    try {
      const { data: b } = await Q.post(`/api/v1/knowledge/${N}/ask`, { query: L, limit: I });
      b?.success ? (t.value = b.results || [], b.mode === "query" ? n.value = b.answer : l.value = String(b.answer || "")) : w.value = b?.error || "ask failed";
    } catch (b) {
      const F = b?.response?.data;
      w.value = F?.error || b?.message || "ask error", de.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      f.value = !1;
    }
  }
  function E(I = 300) {
    if (x && clearTimeout(x), !o.value.trim()) {
      t.value = [], U.value = !1;
      return;
    }
    x = setTimeout(() => T(), I);
  }
  return ge(() => {
    x && clearTimeout(x);
  }), { query: o, results: t, answer: l, queryNotice: n, analysisUnavailable: s, loading: f, error: w, performed: U, run: T, ask: u, runDebounced: E, clear: v };
}
function Se(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const kt = {
  key: 0,
  class: "kc-search-pop"
}, _t = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, yt = {
  key: 1,
  class: "kc-search-state err"
}, gt = {
  key: 2,
  class: "kc-search-hits"
}, wt = ["onMousedown"], $t = { class: "kc-search-hit-h" }, xt = {
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
}, It = {
  key: 1,
  class: "kc-search-panel"
}, At = { class: "kc-search-bar" }, Ot = {
  key: 0,
  class: "kc-search-modes"
}, Ut = { class: "kc-search-field" }, Lt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
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
}, Rt = { class: "kc-ans-h" }, qt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, zt = { class: "kc-search-results" }, Vt = {
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
}, en = { class: "kc-search-zero-t" }, Io = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, l = o, { query: n, results: s, answer: f, queryNotice: w, analysisUnavailable: U, loading: x, error: v, performed: T, run: u, ask: E, runDebounced: I, clear: N } = bt(() => t.kbId), L = O("search"), b = O(!1), F = O(""), P = z(() => t.layout === "panel" && t.ask && L.value === "ask"), V = z(() => P.value && !w.value), Y = z(() => x.value ? "tabler:hourglass" : P.value ? "tabler:sparkles" : "tabler:arrow-right"), W = z(() => s.value[0]), te = z(() => V.value ? s.value.slice(1) : s.value), se = z(() => t.layout === "rail" && b.value && n.value.trim() !== "" && (x.value || T.value || !!v.value));
    function Z() {
      n.value.trim() && (F.value = n.value.trim(), P.value ? E(8) : u(20));
    }
    function X() {
      t.layout === "rail" && I(300);
    }
    function K(j) {
      L.value = j, T.value && n.value.trim() && Z();
    }
    function J(j) {
      l("open", j), t.layout === "rail" && (N(), b.value = !1);
    }
    return (j, $) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: $[2] || ($[2] = (S) => b.value = !0),
      onFocusout: $[3] || ($[3] = (S) => b.value = !1)
    }, [
      g(Ae, {
        modelValue: a(n),
        "onUpdate:modelValue": [
          $[0] || ($[0] = (S) => Ee(n) ? n.value = S : null),
          X
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: $[1] || ($[1] = (S) => a(u)(20)),
        onClear: a(N)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      se.value ? (c(), d("div", kt, [
        a(U) ? (c(), d("p", _t, "Showing direct matches. No model is assigned to " + y(a(U).model) + ".", 1)) : A("", !0),
        a(v) ? (c(), d("div", yt, [
          g(a(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, y(a(v)), 1)
        ])) : a(s).length ? (c(), d("div", gt, [
          (c(!0), d(ee, null, oe(a(s), (S) => (c(), d("button", {
            key: S.id,
            class: "kc-search-hit",
            onMousedown: we((le) => J(S), ["prevent"])
          }, [
            r("span", $t, [
              a(ve)(S) ? (c(), d("span", xt, [
                g(a(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(y(a(ve)(S)), 1)
              ])) : A("", !0),
              r("span", St, y(S.node_type || "result"), 1),
              S.similarity != null ? (c(), d("span", Ct, y(a(Se)(S.similarity)), 1)) : A("", !0)
            ]),
            r("span", Et, y(a(xe)(S.content, 160)), 1)
          ], 40, wt))), 128))
        ])) : a(T) && !a(x) ? (c(), d("div", Tt, [
          g(a(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          $[9] || ($[9] = r("span", null, "No passages matched.", -1))
        ])) : a(x) ? (c(), d("div", Mt, [
          g(a(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          $[10] || ($[10] = r("span", null, "Searching…", -1))
        ])) : A("", !0)
      ])) : A("", !0)
    ], 32)) : (c(), d("div", It, [
      r("div", At, [
        e.ask ? (c(), d("div", Ot, [
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "search" }]),
            onClick: $[4] || ($[4] = (S) => K("search"))
          }, [
            g(a(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            $[11] || ($[11] = R(" Search ", -1))
          ], 2),
          r("button", {
            class: q(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: $[5] || ($[5] = (S) => K("ask"))
          }, [
            g(a(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            $[12] || ($[12] = R(" Ask ", -1))
          ], 2)
        ])) : A("", !0),
        r("div", Ut, [
          g(Ae, {
            modelValue: a(n),
            "onUpdate:modelValue": $[6] || ($[6] = (S) => Ee(n) ? n.value = S : null),
            placeholder: P.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Z
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        g(_e, {
          icon: Y.value,
          label: P.value ? "Ask" : "Search",
          variant: "bordered",
          active: a(x),
          disabled: !a(n).trim() || a(x),
          onClick: Z
        }, null, 8, ["icon", "label", "active", "disabled"]),
        g(_e, {
          icon: "tabler:x",
          label: "Close search",
          onClick: $[7] || ($[7] = (S) => l("close"))
        })
      ]),
      a(U) ? (c(), d("p", Lt, "Showing direct matches. No model is assigned to " + y(a(U).model) + ".", 1)) : A("", !0),
      a(w) ? (c(), d("p", Nt, y(a(w)), 1)) : A("", !0),
      a(v) ? (c(), d("div", Ft, [
        g(a(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, y(a(v)), 1)
      ])) : a(x) ? (c(), d("div", Dt, [
        (c(), d(ee, null, oe(3, (S) => r("div", {
          key: S,
          class: "kc-search-skel-row"
        })), 64))
      ])) : a(s).length ? (c(), d(ee, { key: 4 }, [
        V.value ? (c(), d("div", Bt, [
          r("div", Rt, [
            g(a(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            R(" " + y(a(f) ? "Answer" : "Best match") + ' for "' + y(F.value) + '"', 1)
          ]),
          r("p", qt, y(a(f) || a(xe)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: $[8] || ($[8] = (S) => J(W.value))
          }, [
            g(a(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            $[13] || ($[13] = R(" Open source document ", -1)),
            W.value?.similarity != null ? (c(), d("span", Pt, y(a(Se)(W.value?.similarity)), 1)) : A("", !0)
          ])) : A("", !0)
        ])) : A("", !0),
        r("div", zt, [
          V.value && te.value.length ? (c(), d("div", Vt, "Sources")) : A("", !0),
          (c(!0), d(ee, null, oe(te.value, (S) => (c(), d("button", {
            key: S.id,
            class: q(["kc-search-result", { link: !!S.parent_id }]),
            onClick: (le) => J(S)
          }, [
            r("div", Kt, [
              a(ve)(S) ? (c(), d("span", Gt, [
                g(a(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                R(y(a(ve)(S)), 1)
              ])) : A("", !0),
              r("span", Wt, y(S.node_type || "passage"), 1),
              S.llm_score != null ? (c(), d("span", Ht, "Relevance " + y(Math.round(S.llm_score)), 1)) : A("", !0),
              S.similarity != null ? (c(), d("span", Xt, y(a(Se)(S.similarity)), 1)) : A("", !0)
            ]),
            r("p", Jt, y(a(xe)(S.content, 360)), 1),
            S.parent_id ? (c(), d("span", Qt, [
              g(a(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              $[14] || ($[14] = R(" Open document", -1))
            ])) : A("", !0)
          ], 10, jt))), 128))
        ])
      ], 64)) : a(T) ? (c(), d("div", Yt, [
        g(a(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        $[15] || ($[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        $[16] || ($[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Zt, [
        g(a(C), {
          icon: P.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", en, y(P.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), tn = ["aria-label"], nn = { class: "kc-orig-h" }, on = { class: "kc-orig-title" }, sn = { class: "kc-orig-title-t" }, an = { class: "kc-orig-b" }, ln = ["content-type", "source-url", "filename"], Ao = /* @__PURE__ */ G({
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
    function w(u) {
      u.key === "Escape" && l("close");
    }
    function U() {
      t.open && !document.fullscreenElement && l("close");
    }
    pe(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", w), Ve(s)) : (window.removeEventListener("keydown", w), f());
    });
    const x = O(""), v = O("");
    async function T() {
      if (x.value = "", v.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await Q.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (x.value = u.url, v.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return pe(() => [t.open, t.sourceUrl], T, { immediate: !0 }), Le(() => {
      t.contained || document.addEventListener("fullscreenchange", U);
    }), ge(() => {
      document.removeEventListener("fullscreenchange", U), window.removeEventListener("keydown", w), f();
    }), (u, E) => (c(), ye(Oe, { name: "kc-orig" }, {
      default: Ue(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: q(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: E[1] || (E[1] = we((I) => l("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", nn, [
              r("span", on, [
                g(a(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", sn, y(e.title), 1)
              ]),
              g(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: E[0] || (E[0] = (I) => l("close"))
              })
            ]),
            r("div", an, [
              x.value ? (c(), d("wc-resource-view", {
                key: x.value,
                class: "kc-orig-rv",
                "content-type": v.value || e.contentType,
                "source-url": x.value,
                filename: e.filename
              }, null, 8, ln)) : A("", !0)
            ])
          ], 8, tn)
        ], 2)) : A("", !0)
      ]),
      _: 1
    }));
  }
}), Oo = /* @__PURE__ */ G({
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
      r("span", null, y(e.label || "View original"), 1)
    ]));
  }
}), rn = { class: "kc-docsum" }, cn = { class: "kc-docsum-h" }, Uo = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = O(!1), l = z(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", rn, [
      r("div", cn, [
        g(a(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        R(" " + y(e.label), 1)
      ]),
      r("p", {
        class: q(["kc-docsum-b", { clamp: l.value && !t.value }])
      }, y(e.text), 3),
      l.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (f) => t.value = !t.value)
      }, y(t.value ? "Show less" : "Show more"), 1)) : A("", !0)
    ]));
  }
}), un = { class: "kx-empty kx-empty-spacious" }, dn = { class: "kx-empty-title" }, pn = {
  key: 0,
  class: "kx-empty-sub"
}, Lo = /* @__PURE__ */ G({
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
    return (l, n) => (c(), d("div", un, [
      r("div", {
        class: q(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        g(a(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", dn, y(e.title), 1),
      e.hint ? (c(), d("div", pn, y(e.hint), 1)) : A("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), ye(a(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        R(" " + y(e.cta), 1)
      ])) : A("", !0)
    ]));
  }
}), De = /* @__PURE__ */ new Set([
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
]), Be = /* @__PURE__ */ new Set([
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
]), Re = /* @__PURE__ */ new Set([
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
]), qe = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), fn = [
  ...Array.from(De),
  ...Array.from(Be)
].map((e) => `.${e}`), mn = [
  ...fn,
  "text/*",
  ...Array.from(qe),
  ...Array.from(Re)
].join(","), vn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function hn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function bn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Re.has(o) || qe.has(o)) return !0;
  const t = hn(e.name);
  return De.has(t) || Be.has(t);
}
const ue = ["uploading", "processing"];
function kn(e, o) {
  const t = O([]), l = O(!1), n = O(""), s = O("");
  let f = 0;
  const w = (i) => `${i}${++f}`, U = z(() => l.value || t.value.some((i) => ue.includes(i.status)));
  function x() {
    n.value = "", s.value = "";
  }
  function v() {
    t.value = t.value.filter((i) => ue.includes(i.status));
  }
  function T(i) {
    t.value = t.value.filter((p) => p.key !== i);
  }
  function u(i, p) {
    t.value = t.value.map((k) => k.key === i ? { ...k, ...p } : k);
  }
  const E = [];
  function I() {
    for (const i of E.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) E.push(setTimeout(() => o(), i));
  }
  function N() {
    const i = t.value.filter((p) => p.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), I();
  }
  function L(i) {
    const p = t.value.find((k) => k.key === i);
    !p || p.status === "done" || (u(i, { status: "done" }), N());
  }
  function b(i, p) {
    t.value = [...t.value, { key: w("q"), name: i, uuid: p, status: "done" }], N();
  }
  const F = /* @__PURE__ */ new Map(), P = [];
  function V(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function Y(i) {
    const p = V(i) ? i : {};
    return String(p.topic || "");
  }
  function W(i) {
    const p = V(i) ? i : {}, k = [
      p,
      V(p.data) ? p.data : null,
      V(p.payload) ? p.payload : null,
      V(p.detail) ? p.detail : null
    ].filter(Boolean);
    for (const _ of k)
      if (typeof _.uuid == "string" && typeof _.status == "string") return _;
    return {};
  }
  function te(i, p, k) {
    const _ = t.value.find((D) => D.uuid === i && ue.includes(D.status));
    if (!_) return;
    const B = String(p || "");
    B === "error" || B === "failed" ? u(_.key, { status: "error", error: String(k || "File processing failed") }) : B === "completed" ? L(_.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(_.key, { status: "processing" });
  }
  function se(i, p) {
    const k = W(p);
    k.uuid === i && te(i, k.status, k.error);
  }
  function Z(i) {
    const p = `upload:${i}`;
    if (F.has(p)) return;
    const k = Ne("@message", (_) => {
      Y(_) === p && se(i, _);
    });
    typeof k == "function" && F.set(p, k);
  }
  async function X(i) {
    if (!(!i || !t.value.some((p) => p.uuid === i && ue.includes(p.status))))
      try {
        const { data: p } = await Q.get(`/api/v1/uploads/${encodeURIComponent(i)}`), k = V(p?.upload) ? p.upload : V(p) ? p : {};
        te(i, k.status, k.error || k.error_details);
      } catch {
      }
  }
  function K(i) {
    X(i);
    for (const p of [1500, 5e3, 15e3])
      P.push(setTimeout(() => {
        X(i);
      }, p));
  }
  function J(i) {
    const p = i.meta || {};
    if (String(p.status || "") === "error") {
      const k = String(p.last_error || "Embedding failed");
      for (const _ of t.value) ue.includes(_.status) && u(_.key, { status: "error", error: k });
      s.value = k;
    }
  }
  let j = null, $ = 0;
  function S(i) {
    const p = ++$;
    if (j && (j(), j = null), !i) return;
    const k = ot(i, J);
    if (p !== $) {
      k && k();
      return;
    }
    j = k;
  }
  pe(() => e(), (i) => {
    S(i);
  }, { immediate: !0 }), ge(() => {
    for (const i of E.splice(0)) clearTimeout(i);
    for (const i of P.splice(0)) clearTimeout(i);
    $++, j && j();
    for (const i of F.values()) i();
    F.clear();
  });
  async function le(i, p, k) {
    try {
      const { data: _ } = await Q.post(`/api/v1/knowledge/${k}/upload-token`);
      if (!_?.success || !_.upload_token) {
        u(i, { status: "error", error: _?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", p), B.append("upload_token", _.upload_token);
      const { data: D } = await Q.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (D?.success && D.uuid) {
        const ne = String(D.uuid);
        u(i, { uuid: ne, externalId: `upload:${ne}`, status: "processing" }), Z(ne), K(ne);
      } else
        u(i, { status: "error", error: D?.error || "Upload failed" });
    } catch (_) {
      u(i, { status: "error", error: _?.response?.data?.error || _?.message || "Upload error" }), de.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
    }
  }
  function fe(i) {
    const p = e();
    if (p) {
      x();
      for (const k of Array.from(i)) {
        if (!bn(k)) {
          s.value = vn;
          continue;
        }
        const _ = w("f");
        t.value = [...t.value, { key: _, name: k.name, status: "uploading" }], le(_, k, p);
      }
    }
  }
  function M(i) {
    fe([i]);
  }
  async function m(i = 100, p = 0) {
    const { data: k } = await Q.get(`/api/v1/uploads/list?limit=${i}&offset=${p}`), B = (Array.isArray(k?.uploads) ? k.uploads : []).map((D) => ({
      uuid: String(D.uuid),
      filename: String(D.filename || D.meta && D.meta.filename || D.uuid),
      mime_type: D.mime_type,
      size: D.size,
      status: D.status,
      created_at: D.created_at
    }));
    return { uploads: B, total: Number(k?.meta?.total ?? B.length) };
  }
  async function h(i, p) {
    const k = e();
    if (!(!k || !i.length)) {
      x(), l.value = !0;
      try {
        const { data: _ } = await Q.post(`/api/v1/knowledge/${k}/ingest-upload`, {
          upload_ids: i.map((H) => H.uuid),
          ...p ? { reingest: !0 } : {}
        }, p ? { headers: { "Idempotency-Key": p } } : void 0);
        if (p && _?.reingest !== !0) {
          s.value = "Re-ingest requires an updated Knowledge service";
          return;
        }
        const B = Array.isArray(_?.results) ? _.results : [], D = (H) => i.find((Pe) => Pe.uuid === H)?.name || H;
        let ne = !1;
        for (const H of B)
          H?.success && (ne = !0, b(D(String(H.upload_id)), String(H.upload_id)));
        const Ce = p ? B.find((H) => H?.success === !1) : void 0;
        (Ce || !ne) && (s.value = Ce?.error || _?.error || "Could not ingest the selected uploads");
      } catch (_) {
        s.value = _?.response?.data?.error || _?.message || "Ingest error", de.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
      } finally {
        l.value = !1;
      }
    }
  }
  async function ie(i, p, k) {
    const _ = e();
    if (!(!i.trim() || !_)) {
      x(), l.value = !0;
      try {
        const B = p.trim() ? { title: p.trim() } : void 0, { data: D } = await Q.post(`/api/v1/knowledge/${_}/ingest`, { content: i, content_type: k, metadata: B });
        D?.success ? b(p.trim() || "Pasted text") : s.value = D?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", de.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
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
    reset: x,
    clearItems: v,
    removeItem: T,
    uploadFile: M,
    uploadFiles: fe,
    listMyUploads: m,
    ingestExistingUploads: h,
    ingestText: ie
  };
}
const _n = { class: "ap" }, yn = {
  class: "ap-modes",
  role: "tablist"
}, gn = ["aria-selected", "onClick"], wn = {
  key: 0,
  class: "ap-msg err"
}, $n = {
  key: 1,
  class: "ap-pane"
}, xn = ["accept"], Sn = {
  key: 2,
  class: "ap-pane"
}, Cn = { class: "ap-uploads-bar" }, En = ["disabled"], Tn = ["disabled"], Mn = {
  key: 0,
  class: "ap-uploads-state"
}, In = {
  key: 1,
  class: "ap-uploads-state err"
}, An = {
  key: 2,
  class: "ap-uploads-state"
}, On = {
  key: 3,
  class: "ap-uploads"
}, Un = ["aria-pressed", "onClick"], Ln = { class: "ap-upload-main" }, Nn = { class: "ap-upload-name" }, Fn = { class: "ap-upload-meta" }, Dn = {
  key: 0,
  class: "mono"
}, Bn = { key: 1 }, Rn = {
  key: 3,
  class: "ap-pane"
}, qn = { class: "ap-form" }, Pn = { class: "ap-grid2" }, zn = { class: "ap-field" }, Vn = ["placeholder"], jn = { class: "ap-field" }, Kn = { class: "ap-field" }, Gn = { class: "ap-label-row" }, Wn = {
  key: 0,
  class: "ap-count"
}, Hn = ["placeholder"], Xn = { class: "ap-actions" }, Jn = { class: "ap-hint" }, Qn = ["disabled"], Yn = {
  key: 4,
  class: "ap-items"
}, Zn = { class: "ap-items-h" }, eo = { class: "ap-items-list" }, to = { class: "ap-item-name" }, no = { class: "ap-item-status" }, No = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, l = o, n = kn(() => t.kbId, () => l("changed")), s = O("file"), f = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], w = z(() => t.noun || "content");
    function U(M) {
      n.reset(), s.value = M, M === "uploads" && W();
    }
    const x = O(null), v = O(!1);
    function T() {
      x.value?.click();
    }
    function u(M) {
      const m = M.target.files;
      m?.length && n.uploadFiles(m), x.value && (x.value.value = "");
    }
    function E(M) {
      M.preventDefault(), v.value = !1;
      const m = M.dataTransfer?.files;
      m?.length && n.uploadFiles(m);
    }
    const I = O([]), N = O(!1), L = O(""), b = O(""), F = O({}), P = O(), V = z(() => {
      const M = b.value.trim().toLowerCase();
      return M ? I.value.filter((m) => m.filename.toLowerCase().includes(M)) : I.value;
    }), Y = z(() => Object.values(F.value).filter(Boolean).length);
    async function W() {
      N.value = !0, L.value = "";
      try {
        const { uploads: M } = await n.listMyUploads(200, 0);
        I.value = M;
      } catch (M) {
        L.value = M?.message || "Could not load your uploads";
      } finally {
        N.value = !1;
      }
    }
    function te(M) {
      F.value = { ...F.value, [M]: !F.value[M] };
    }
    async function se(M = !1) {
      const m = I.value.filter((h) => F.value[h.uuid]).map((h) => ({ uuid: h.uuid, name: h.filename }));
      if (m.length) {
        if (M) {
          const h = JSON.stringify([t.kbId, ...m.map(({ uuid: ie }) => ie)]);
          P.value?.selection !== h && (P.value = { selection: h, key: crypto.randomUUID() }), await n.ingestExistingUploads(m, P.value.key);
        } else
          await n.ingestExistingUploads(m);
        n.errMsg.value || (F.value = {}, P.value = void 0);
      }
    }
    function Z(M) {
      return !M || M <= 0 ? "" : M < 1024 ? `${M} B` : M < 1024 * 1024 ? `${(M / 1024).toFixed(0)} KB` : `${(M / 1024 / 1024).toFixed(1)} MB`;
    }
    const X = O(""), K = O(""), J = O("text/plain"), j = z(() => K.value.length);
    async function $() {
      K.value.trim() && (await n.ingestText(K.value, X.value, J.value), n.errMsg.value || (K.value = "", X.value = ""));
    }
    const S = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function le(M) {
      return M === "done" ? "tabler:circle-check" : M === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const fe = z(() => n.items.value.length > 0);
    return Le(() => {
      s.value === "uploads" && W();
    }), pe(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (M, m) => (c(), d("div", _n, [
      r("div", yn, [
        (c(), d(ee, null, oe(f, (h) => r("button", {
          key: h.id,
          class: q(["ap-mode", { on: s.value === h.id }]),
          role: "tab",
          "aria-selected": s.value === h.id,
          onClick: (ie) => U(h.id)
        }, [
          g(a(C), {
            icon: h.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, y(h.label), 1)
        ], 10, gn)), 64))
      ]),
      a(n).errMsg.value ? (c(), d("div", wn, [
        g(a(C), { icon: "tabler:alert-circle" }),
        R(y(a(n).errMsg.value), 1)
      ])) : A("", !0),
      s.value === "file" ? (c(), d("section", $n, [
        r("input", {
          ref_key: "fileInput",
          ref: x,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: a(mn),
          onChange: u
        }, null, 40, xn),
        r("button", {
          type: "button",
          class: q(["ap-drop", { over: v.value }]),
          onClick: T,
          onDragover: m[0] || (m[0] = we((h) => v.value = !0, ["prevent"])),
          onDragleave: m[1] || (m[1] = (h) => v.value = !1),
          onDrop: E
        }, [
          g(a(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          m[9] || (m[9] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          m[10] || (m[10] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", Sn, [
        r("div", Cn, [
          me(r("input", {
            "onUpdate:modelValue": m[2] || (m[2] = (h) => b.value = h),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [$e, b.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !Y.value || a(n).busy.value,
            onClick: m[3] || (m[3] = (h) => se())
          }, [
            g(a(C), {
              icon: a(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: q(a(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            R(" " + y(Y.value ? `Add ${Y.value} selected` : "Add selected"), 1)
          ], 8, En),
          r("button", {
            class: "ap-submit",
            disabled: !Y.value || a(n).busy.value,
            onClick: m[4] || (m[4] = (h) => se(!0))
          }, [
            g(a(C), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            m[11] || (m[11] = R(" Re-ingest selected ", -1))
          ], 8, Tn)
        ]),
        N.value ? (c(), d("div", Mn, [
          g(a(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          m[12] || (m[12] = R(" Loading your uploads…", -1))
        ])) : L.value ? (c(), d("div", In, [
          g(a(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          R(" " + y(L.value), 1)
        ])) : V.value.length ? (c(), d("ul", On, [
          (c(!0), d(ee, null, oe(V.value, (h) => (c(), d("li", {
            key: h.uuid
          }, [
            r("button", {
              type: "button",
              class: q(["ap-upload", { on: F.value[h.uuid] }]),
              "aria-pressed": !!F.value[h.uuid],
              onClick: (ie) => te(h.uuid)
            }, [
              g(a(C), {
                class: "ap-upload-check",
                icon: F.value[h.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g(a(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Ln, [
                r("span", Nn, y(h.filename), 1),
                r("span", Fn, [
                  h.mime_type ? (c(), d("span", Dn, y(h.mime_type), 1)) : A("", !0),
                  Z(h.size) ? (c(), d("span", Bn, y(Z(h.size)), 1)) : A("", !0)
                ])
              ])
            ], 10, Un)
          ]))), 128))
        ])) : (c(), d("div", An, [
          g(a(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          m[13] || (m[13] = R(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Rn, [
        r("div", qn, [
          r("div", Pn, [
            r("div", zn, [
              m[14] || (m[14] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                R("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              me(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": m[5] || (m[5] = (h) => X.value = h),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${w.value} a title`,
                autocomplete: "off"
              }, null, 8, Vn), [
                [$e, X.value]
              ])
            ]),
            r("div", jn, [
              m[16] || (m[16] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              me(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": m[6] || (m[6] = (h) => J.value = h),
                class: "ap-input"
              }, [...m[15] || (m[15] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [je, J.value]
              ])
            ])
          ]),
          r("div", Kn, [
            r("div", Gn, [
              m[17] || (m[17] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              j.value ? (c(), d("span", Wn, y(j.value.toLocaleString()) + " chars", 1)) : A("", !0)
            ]),
            me(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": m[7] || (m[7] = (h) => K.value = h),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${w.value} to add to this knowledge base…`
            }, null, 8, Hn), [
              [$e, K.value]
            ])
          ]),
          r("div", Xn, [
            r("span", Jn, [
              g(a(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              m[18] || (m[18] = R(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !K.value.trim() || a(n).busy.value,
              onClick: $
            }, [
              g(a(C), {
                icon: a(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: q(a(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              R(" " + y(a(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Qn)
          ])
        ])
      ])),
      fe.value ? (c(), d("div", Yn, [
        r("div", Zn, [
          m[19] || (m[19] = r("span", null, "Progress", -1)),
          a(n).busy.value ? A("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: m[8] || (m[8] = (h) => a(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", eo, [
          (c(!0), d(ee, null, oe(a(n).items.value, (h) => (c(), d("li", {
            key: h.key,
            class: q(["ap-item", h.status])
          }, [
            g(a(C), {
              class: q(["ap-item-ic", ["uploading", "processing", "embedding"].includes(h.status) && "spin"]),
              icon: le(h.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", to, y(h.name), 1),
            r("span", no, y(h.error || S[h.status]), 1)
          ], 2))), 128))
        ])
      ])) : A("", !0)
    ]));
  }
});
export {
  mo as A,
  Qe as B,
  vo as C,
  ho as D,
  co as E,
  xe as F,
  Ge as G,
  _o as H,
  po as I,
  ae as N,
  _e as _,
  $o as a,
  Oo as b,
  io as c,
  Eo as d,
  Uo as e,
  So as f,
  Ao as g,
  To as h,
  ro as i,
  Co as j,
  Io as k,
  Lo as l,
  Ae as m,
  lo as n,
  Mo as o,
  No as p,
  Ze as q,
  yo as r,
  ot as s,
  go as t,
  xo as u,
  uo as v,
  ko as w,
  wo as x,
  bo as y,
  fo as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-DfhPpnfo.js.map
