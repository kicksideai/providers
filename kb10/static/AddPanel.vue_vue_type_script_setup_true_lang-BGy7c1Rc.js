import { defineComponent as G, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as me, normalizeClass as R, createVNode as $, unref as a, withKeys as Re, createCommentVNode as M, Fragment as Z, renderList as ee, createBlock as he, createTextVNode as P, toDisplayString as w, watch as ce, onBeforeUnmount as be, Transition as Me, withCtx as Ae, withModifiers as _e, ref as U, computed as z, isRef as xe, nextTick as qe, onMounted as Ie, withDirectives as ue, vModelText as ge, vModelSelect as ze } from "vue";
import { Icon as S } from "@iconify/vue";
import { on as Oe, api as J, host as re } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function oo(e) {
  return Ue(e.metadata, e.id);
}
function de(e) {
  return Ue(e.metadata, "");
}
function Se(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function ae(e) {
  return typeof e == "string" ? e.trim() : "";
}
function so(e) {
  const o = Se(e.metadata), t = { ...Se(o.source_ref) };
  return delete t.thread_id, delete t.thread_event_id, delete t.thread_event_seq, delete t.external_version, {
    external_id: e.external_id || o.external_id || t.external_id || e.id,
    upload_id: ae(t.upload_id) || ae(o.upload_id) || void 0,
    source_url: ae(t.source_url) || ae(t.url) || ae(o.source_url) || void 0,
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
const lo = "This knowledge base's engine is not installed; its contents are unavailable.", oe = {
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
  if (e.node_type === "document") return oe.document;
  if (e.is_root) return oe.root;
  const o = (e.concept_type || "").toLowerCase();
  return oe[o] || oe.topic;
}
const Ke = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, pe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function je(e) {
  return e < pe.length ? pe[e] : Math.round((pe[0] + (e - pe.length + 1) * 137.508) % 360);
}
function fe(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Ce = 34, Ee = 88, Ge = 78, We = 38;
function ro(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), l = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && l.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const y = /* @__PURE__ */ new Set();
    let E = u, L = 0;
    for (; !y.has(E); ) {
      y.add(E);
      const b = l.get(E);
      if (b === void 0 || n(b)) return { branch: E, depth: L };
      E = b, L++;
    }
    return { branch: E, depth: L };
  }
  const p = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const y = s(u.id);
    p.set(u.id, y), k.set(y.branch, Math.max(k.get(y.branch) ?? 0, y.depth));
  }
  const A = [...new Set([...p.values()].map((u) => u.branch))].sort((u, y) => (t.get(u)?.label || "").localeCompare(t.get(y)?.label || "")), I = /* @__PURE__ */ new Map();
  A.forEach((u, y) => I.set(u, je(y)));
  const m = (u, y, E) => u + (y - u) * E, O = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      O.set(u.id, { ...oe.root });
      continue;
    }
    const y = p.get(u.id);
    if (!y) {
      O.set(u.id, { ...oe.topic });
      continue;
    }
    const E = I.get(y.branch) ?? 220, L = Math.min(Math.max(k.get(y.branch) ?? 0, 1), 4), b = Math.min(1, y.depth / L);
    if (u.node_type === "document") {
      const N = Math.min(84, m(Ce, Ee, b) + 6);
      O.set(u.id, { fill: fe(E, 32, N), stroke: fe(E, 32, Math.max(50, N - 14)) });
    } else {
      const N = m(Ce, Ee, b), D = m(Ge, We, b);
      O.set(u.id, { fill: fe(E, D, N), stroke: fe(E, D, Math.max(28, N - 17)) });
    }
  }
  return O;
}
const He = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function co(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of o) {
    if (!He.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const O = l.get(m.to_node_id) || [];
    O.push(m.from_node_id), l.set(m.to_node_id, O), n.add(m.from_node_id);
  }
  const s = (m, O) => (t.get(m)?.label || "").localeCompare(t.get(O)?.label || "");
  function p(m, O, u) {
    const y = t.get(m);
    if (!y || u.has(m)) return null;
    u.add(m);
    const E = (l.get(m) || []).slice().sort(s), L = [];
    for (const b of E) {
      const N = p(b, O + 1, u);
      N && L.push(N);
    }
    return { concept: y, children: L, depth: O };
  }
  const k = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(s), A = /* @__PURE__ */ new Set(), I = [];
  for (const m of k) {
    const O = p(m, 0, A);
    O && I.push(O);
  }
  for (const m of e)
    if (!A.has(m.id)) {
      const O = p(m.id, 0, A);
      O && I.push(O);
    }
  return I;
}
function uo(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), l = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const p of n.children) l(p, n.concept.id);
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
    const p = o.get(s);
    if (!p) break;
    l.unshift(p.concept), s = t.get(s);
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
  return n.sort((s, p) => s.isFolder !== p.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(p.concept.label || p.concept.id)).slice(0, 200);
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
    const p = t.get(s.from_node_id);
    p && (n.add(s.from_node_id), l.push(p));
  }
  return l.sort((s, p) => (s.label || "").localeCompare(p.label || ""));
}
function _o(e, o, t) {
  if (!e) return [];
  const l = [], n = /* @__PURE__ */ new Set(), s = new Set(Qe(e, o));
  for (const p of o) {
    if (p.edge_type === "subtopic_of" || p.edge_type === "categorized_as") continue;
    let k = "";
    if (p.from_node_id === e.id) k = p.to_node_id;
    else if (p.to_node_id === e.id) k = p.from_node_id;
    else continue;
    if (!k || n.has(k) || s.has(k)) continue;
    const A = t.get(k);
    A && (n.add(k), l.push({ concept: A, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
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
function le(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function et(e, o) {
  if (!o) return null;
  const t = le(e) ? e : {}, l = [
    t,
    le(t.data) ? t.data : null,
    le(t.payload) ? t.payload : null,
    le(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of l) {
    if (n.event !== "component.meta.changed") continue;
    const s = String(n.component_id || ""), p = String(t.topic || n.topic || "");
    if (!(s && s !== o) && !(!s && p !== `component.${o}`))
      return {
        event: "component.meta.changed",
        component_id: s || o,
        meta: le(n.meta) ? n.meta : {},
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
const nt = { class: "kx-shell" }, ot = { class: "kx-rail" }, st = { class: "kx-main" }, wo = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", nt, [
      r("aside", ot, [
        me(o.$slots, "rail")
      ]),
      r("main", st, [
        me(o.$slots, "default")
      ])
    ]));
  }
}), at = ["aria-label", "title", "disabled"], ve = /* @__PURE__ */ G({
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
      class: R(["kx-iconbtn", [
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
      $(a(S), {
        icon: e.icon,
        class: R(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, at));
  }
}), lt = { class: "kx-search" }, it = ["value", "placeholder"], Te = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", lt, [
      $(a(S), {
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
        onKeyup: n[1] || (n[1] = Re((s) => t("enter"), ["enter"]))
      }, null, 40, it),
      e.modelValue ? (c(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (s) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        $(a(S), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : M("", !0)
    ]));
  }
}), rt = {
  class: "tb",
  role: "tablist"
}, ct = ["aria-selected", "onClick"], ut = {
  key: 1,
  class: "kx-count"
}, $o = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (l, n) => (c(), d("div", rt, [
      (c(!0), d(Z, null, ee(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: R(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (p) => t("select", s.id)
      }, [
        s.icon ? (c(), he(a(S), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : M("", !0),
        P(" " + w(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", ut, w(s.count), 1)) : M("", !0)
      ], 10, ct))), 128))
    ]));
  }
}), xo = /* @__PURE__ */ G({
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
      class: R(["kx-notice", e.tone])
    }, [
      $(a(S), {
        icon: a(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        me(l.$slots, "default")
      ])
    ], 2));
  }
}), dt = ["aria-label"], pt = { class: "kx-drawer-h" }, ft = { class: "kx-drawer-title" }, mt = { class: "kx-drawer-b" }, So = /* @__PURE__ */ G({
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
    return ce(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), be(() => window.removeEventListener("keydown", n)), (s, p) => (c(), he(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: p[1] || (p[1] = _e((k) => l("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", pt, [
              r("span", ft, [
                $(a(S), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(w(e.title), 1)
              ]),
              $(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (k) => l("close"))
              })
            ]),
            r("div", mt, [
              me(s.$slots, "default")
            ])
          ], 8, dt)
        ])) : M("", !0)
      ]),
      _: 3
    }));
  }
});
function vt(e) {
  const o = U(""), t = U([]), l = U(""), n = U(null), s = U(!1), p = U(""), k = U(!1);
  let A = null;
  function I() {
    A && (clearTimeout(A), A = null), o.value = "", t.value = [], l.value = "", n.value = null, k.value = !1, p.value = "";
  }
  async function m(y = 20) {
    const E = e(), L = o.value.trim();
    if (!L || !E) {
      t.value = [], k.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, k.value = !0;
    try {
      const { data: b } = await J.get(`/api/v1/kb10/${E}/search?q=${encodeURIComponent(L)}&limit=${y}`);
      b?.success ? (t.value = b.results || [], l.value = "", n.value = b.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null) : p.value = b?.error || "search failed";
    } catch (b) {
      p.value = b?.response?.data?.error || b?.message || "search error", re.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      s.value = !1;
    }
  }
  async function O(y = 8) {
    const E = e(), L = o.value.trim();
    if (!L || !E) {
      t.value = [], l.value = "", k.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, l.value = "", k.value = !0;
    try {
      const { data: b } = await J.post(`/api/v1/knowledge/${E}/ask`, { query: L, limit: y });
      b?.success ? (t.value = b.results || [], l.value = String(b.answer || "")) : (n.value = b?.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null, p.value = b?.error || "ask failed");
    } catch (b) {
      const N = b?.response?.data;
      n.value = N?.retrieval?.analysis?.status === "unavailable" ? N.retrieval.analysis : null, p.value = N?.error || b?.message || "ask error", re.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      s.value = !1;
    }
  }
  function u(y = 300) {
    if (A && clearTimeout(A), !o.value.trim()) {
      t.value = [], k.value = !1;
      return;
    }
    A = setTimeout(() => m(), y);
  }
  return be(() => {
    A && clearTimeout(A);
  }), { query: o, results: t, answer: l, analysisUnavailable: n, loading: s, error: p, performed: k, run: m, ask: O, runDebounced: u, clear: I };
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
  class: "kc-search-state"
}, Ut = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Lt = {
  key: 2,
  class: "kc-search-err"
}, Ft = {
  key: 3,
  class: "kc-search-skel"
}, Nt = {
  key: 0,
  class: "kc-ans"
}, Dt = { class: "kc-ans-h" }, Bt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, Rt = { class: "kc-search-results" }, qt = {
  key: 0,
  class: "kc-search-results-h"
}, zt = ["onClick"], Vt = { class: "kc-search-r-h" }, Kt = {
  key: 0,
  class: "kc-search-r-doc"
}, jt = { class: "kc-search-hit-kind" }, Gt = {
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
}, Yt = { class: "kc-search-zero-t" }, Co = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, l = o, { query: n, results: s, answer: p, analysisUnavailable: k, loading: A, error: I, performed: m, run: O, ask: u, runDebounced: y, clear: E } = vt(() => t.kbId), L = U("search"), b = U(!1), N = U(""), D = z(() => t.ask && !k.value), q = z(() => t.layout === "panel" && D.value && L.value === "ask"), V = z(() => A.value ? "tabler:hourglass" : q.value ? "tabler:sparkles" : "tabler:arrow-right"), W = z(() => s.value[0]), te = z(() => q.value ? s.value.slice(1) : s.value), ne = z(() => t.layout === "rail" && b.value && n.value.trim() !== "" && (A.value || m.value || !!I.value));
    function Q() {
      n.value.trim() && (N.value = n.value.trim(), q.value ? u(8) : O(20));
    }
    function Y() {
      t.layout === "rail" && y(300);
    }
    function K(X) {
      L.value = X, m.value && n.value.trim() && Q();
    }
    function H(X) {
      l("open", X), t.layout === "rail" && (E(), b.value = !1);
    }
    return (X, _) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: _[2] || (_[2] = (g) => b.value = !0),
      onFocusout: _[3] || (_[3] = (g) => b.value = !1)
    }, [
      $(Te, {
        modelValue: a(n),
        "onUpdate:modelValue": [
          _[0] || (_[0] = (g) => xe(n) ? n.value = g : null),
          Y
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: _[1] || (_[1] = (g) => a(O)(20)),
        onClear: a(E)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ne.value ? (c(), d("div", ht, [
        a(k) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + w(a(k).model) + ".", 1)) : M("", !0),
        a(I) ? (c(), d("div", _t, [
          $(a(S), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, w(a(I)), 1)
        ])) : a(s).length ? (c(), d("div", kt, [
          (c(!0), d(Z, null, ee(a(s), (g) => (c(), d("button", {
            key: g.id,
            class: "kc-search-hit",
            onMousedown: _e((se) => H(g), ["prevent"])
          }, [
            r("span", gt, [
              a(de)(g) ? (c(), d("span", wt, [
                $(a(S), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(w(a(de)(g)), 1)
              ])) : M("", !0),
              r("span", $t, w(g.node_type || "result"), 1),
              g.similarity != null ? (c(), d("span", xt, w(a($e)(g.similarity)), 1)) : M("", !0)
            ]),
            r("span", St, w(a(we)(g.content, 160)), 1)
          ], 40, yt))), 128))
        ])) : a(m) && !a(A) ? (c(), d("div", Ct, [
          $(a(S), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          _[9] || (_[9] = r("span", null, "No passages matched.", -1))
        ])) : a(A) ? (c(), d("div", Et, [
          $(a(S), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          _[10] || (_[10] = r("span", null, "Searching…", -1))
        ])) : M("", !0)
      ])) : M("", !0)
    ], 32)) : (c(), d("div", Tt, [
      r("div", Mt, [
        D.value ? (c(), d("div", At, [
          r("button", {
            class: R(["kc-search-mode", { on: L.value === "search" }]),
            onClick: _[4] || (_[4] = (g) => K("search"))
          }, [
            $(a(S), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            _[11] || (_[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: R(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: _[5] || (_[5] = (g) => K("ask"))
          }, [
            $(a(S), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            _[12] || (_[12] = P(" Ask ", -1))
          ], 2)
        ])) : M("", !0),
        r("div", It, [
          $(Te, {
            modelValue: a(n),
            "onUpdate:modelValue": _[6] || (_[6] = (g) => xe(n) ? n.value = g : null),
            placeholder: q.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Q
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        $(ve, {
          icon: V.value,
          label: q.value ? "Ask" : "Search",
          variant: "bordered",
          active: a(A),
          disabled: !a(n).trim() || a(A),
          onClick: Q
        }, null, 8, ["icon", "label", "active", "disabled"]),
        $(ve, {
          icon: "tabler:x",
          label: "Close search",
          onClick: _[7] || (_[7] = (g) => l("close"))
        })
      ]),
      t.ask ? M("", !0) : (c(), d("p", Ot, "Select an Answer model in knowledge base settings to enable Ask.")),
      a(k) ? (c(), d("p", Ut, "Showing direct matches. No model is assigned to " + w(a(k).model) + ".", 1)) : M("", !0),
      a(I) ? (c(), d("div", Lt, [
        $(a(S), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, w(a(I)), 1)
      ])) : M("", !0),
      a(A) ? (c(), d("div", Ft, [
        (c(), d(Z, null, ee(3, (g) => r("div", {
          key: g,
          class: "kc-search-skel-row"
        })), 64))
      ])) : a(s).length ? (c(), d(Z, { key: 4 }, [
        q.value ? (c(), d("div", Nt, [
          r("div", Dt, [
            $(a(S), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + w(a(p) ? "Answer" : "Best match") + ' for "' + w(N.value) + '"', 1)
          ]),
          r("p", Bt, w(a(p) || a(we)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: _[8] || (_[8] = (g) => H(W.value))
          }, [
            $(a(S), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            _[13] || (_[13] = P(" Open source document ", -1)),
            W.value?.similarity != null ? (c(), d("span", Pt, w(a($e)(W.value?.similarity)), 1)) : M("", !0)
          ])) : M("", !0)
        ])) : M("", !0),
        r("div", Rt, [
          q.value && te.value.length ? (c(), d("div", qt, "Sources")) : M("", !0),
          (c(!0), d(Z, null, ee(te.value, (g) => (c(), d("button", {
            key: g.id,
            class: R(["kc-search-result", { link: !!g.parent_id }]),
            onClick: (se) => H(g)
          }, [
            r("div", Vt, [
              a(de)(g) ? (c(), d("span", Kt, [
                $(a(S), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(w(a(de)(g)), 1)
              ])) : M("", !0),
              r("span", jt, w(g.node_type || "passage"), 1),
              g.llm_score != null ? (c(), d("span", Gt, "Relevance " + w(Math.round(g.llm_score)), 1)) : M("", !0),
              g.similarity != null ? (c(), d("span", Wt, w(a($e)(g.similarity)), 1)) : M("", !0)
            ]),
            r("p", Ht, w(a(we)(g.content, 360)), 1),
            g.parent_id ? (c(), d("span", Xt, [
              $(a(S), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              _[14] || (_[14] = P(" Open document", -1))
            ])) : M("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : a(m) ? (c(), d("div", Jt, [
        $(a(S), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        _[15] || (_[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        _[16] || (_[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Qt, [
        $(a(S), {
          icon: q.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Yt, w(q.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), Zt = ["aria-label"], en = { class: "kc-orig-h" }, tn = { class: "kc-orig-title" }, nn = { class: "kc-orig-title-t" }, on = { class: "kc-orig-b" }, sn = ["content-type", "source-url", "filename"], Eo = /* @__PURE__ */ G({
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
    const t = e, l = o, n = U(null);
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
      u.key === "Escape" && l("close");
    }
    function A() {
      t.open && !document.fullscreenElement && l("close");
    }
    ce(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", k), qe(s)) : (window.removeEventListener("keydown", k), p());
    });
    const I = U(""), m = U("");
    async function O() {
      if (I.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await J.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (I.value = u.url, m.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return ce(() => [t.open, t.sourceUrl], O, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", A);
    }), be(() => {
      document.removeEventListener("fullscreenchange", A), window.removeEventListener("keydown", k), p();
    }), (u, y) => (c(), he(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: R(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: y[1] || (y[1] = _e((E) => l("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", en, [
              r("span", tn, [
                $(a(S), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", nn, w(e.title), 1)
              ]),
              $(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: y[0] || (y[0] = (E) => l("close"))
              })
            ]),
            r("div", on, [
              I.value ? (c(), d("wc-resource-view", {
                key: I.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": I.value,
                filename: e.filename
              }, null, 8, sn)) : M("", !0)
            ])
          ], 8, Zt)
        ], 2)) : M("", !0)
      ]),
      _: 1
    }));
  }
}), To = /* @__PURE__ */ G({
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
      $(a(S), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, w(e.label || "View original"), 1)
    ]));
  }
}), an = { class: "kc-docsum" }, ln = { class: "kc-docsum-h" }, Mo = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = U(!1), l = z(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", an, [
      r("div", ln, [
        $(a(S), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + w(e.label), 1)
      ]),
      r("p", {
        class: R(["kc-docsum-b", { clamp: l.value && !t.value }])
      }, w(e.text), 3),
      l.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (p) => t.value = !t.value)
      }, w(t.value ? "Show less" : "Show more"), 1)) : M("", !0)
    ]));
  }
}), rn = { class: "kx-empty kx-empty-spacious" }, cn = { class: "kx-empty-title" }, un = {
  key: 0,
  class: "kx-empty-sub"
}, Ao = /* @__PURE__ */ G({
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
        class: R(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        $(a(S), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", cn, w(e.title), 1),
      e.hint ? (c(), d("div", un, w(e.hint), 1)) : M("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), he(a(S), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : M("", !0),
        P(" " + w(e.cta), 1)
      ])) : M("", !0)
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
]), dn = [
  ...Array.from(Le),
  ...Array.from(Fe)
].map((e) => `.${e}`), pn = [
  ...dn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Ne)
].join(","), fn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function mn(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function vn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Ne.has(o) || De.has(o)) return !0;
  const t = mn(e.name);
  return Le.has(t) || Fe.has(t);
}
const ie = ["uploading", "processing"];
function hn(e, o) {
  const t = U([]), l = U(!1), n = U(""), s = U("");
  let p = 0;
  const k = (i) => `${i}${++p}`, A = z(() => l.value || t.value.some((i) => ie.includes(i.status)));
  function I() {
    n.value = "", s.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => ie.includes(i.status));
  }
  function O(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function u(i, f) {
    t.value = t.value.map((h) => h.key === i ? { ...h, ...f } : h);
  }
  const y = [];
  function E() {
    for (const i of y.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) y.push(setTimeout(() => o(), i));
  }
  function L() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), E();
  }
  function b(i) {
    const f = t.value.find((h) => h.key === i);
    !f || f.status === "done" || (u(i, { status: "done" }), L());
  }
  function N(i, f) {
    t.value = [...t.value, { key: k("q"), name: i, uuid: f, status: "done" }], L();
  }
  const D = /* @__PURE__ */ new Map(), q = [];
  function V(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function W(i) {
    const f = V(i) ? i : {};
    return String(f.topic || "");
  }
  function te(i) {
    const f = V(i) ? i : {}, h = [
      f,
      V(f.data) ? f.data : null,
      V(f.payload) ? f.payload : null,
      V(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const T of h)
      if (typeof T.uuid == "string" && typeof T.status == "string") return T;
    return {};
  }
  function ne(i, f, h) {
    const T = t.value.find((F) => F.uuid === i && ie.includes(F.status));
    if (!T) return;
    const B = String(f || "");
    B === "error" || B === "failed" ? u(T.key, { status: "error", error: String(h || "File processing failed") }) : B === "completed" ? b(T.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(T.key, { status: "processing" });
  }
  function Q(i, f) {
    const h = te(f);
    h.uuid === i && ne(i, h.status, h.error);
  }
  function Y(i) {
    const f = `upload:${i}`;
    if (D.has(f)) return;
    const h = Oe("@message", (T) => {
      W(T) === f && Q(i, T);
    });
    typeof h == "function" && D.set(f, h);
  }
  async function K(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ie.includes(f.status))))
      try {
        const { data: f } = await J.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = V(f?.upload) ? f.upload : V(f) ? f : {};
        ne(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function H(i) {
    K(i);
    for (const f of [1500, 5e3, 15e3])
      q.push(setTimeout(() => {
        K(i);
      }, f));
  }
  function X(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const h = String(f.last_error || "Embedding failed");
      for (const T of t.value) ie.includes(T.status) && u(T.key, { status: "error", error: h });
      s.value = h;
    }
  }
  let _ = null, g = 0;
  function se(i) {
    const f = ++g;
    if (_ && (_(), _ = null), !i) return;
    const h = tt(i, X);
    if (f !== g) {
      h && h();
      return;
    }
    _ = h;
  }
  ce(() => e(), (i) => {
    se(i);
  }, { immediate: !0 }), be(() => {
    for (const i of y.splice(0)) clearTimeout(i);
    for (const i of q.splice(0)) clearTimeout(i);
    g++, _ && _();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ke(i, f, h) {
    try {
      const { data: T } = await J.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!T?.success || !T.upload_token) {
        u(i, { status: "error", error: T?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", f), B.append("upload_token", T.upload_token);
      const { data: F } = await J.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (F?.success && F.uuid) {
        const j = String(F.uuid);
        u(i, { uuid: j, externalId: `upload:${j}`, status: "processing" }), Y(j), H(j);
      } else
        u(i, { status: "error", error: F?.error || "Upload failed" });
    } catch (T) {
      u(i, { status: "error", error: T?.response?.data?.error || T?.message || "Upload error" }), re.handleError(T?.response?.status === 401 ? "auth-expired" : "other", T);
    }
  }
  function C(i) {
    const f = e();
    if (f) {
      I();
      for (const h of Array.from(i)) {
        if (!vn(h)) {
          s.value = fn;
          continue;
        }
        const T = k("f");
        t.value = [...t.value, { key: T, name: h.name, status: "uploading" }], ke(T, h, f);
      }
    }
  }
  function v(i) {
    C([i]);
  }
  async function x(i = 100, f = 0) {
    const { data: h } = await J.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), B = (Array.isArray(h?.uploads) ? h.uploads : []).map((F) => ({
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
    const f = e();
    if (!(!f || !i.length)) {
      I(), l.value = !0;
      try {
        const { data: h } = await J.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((j) => j.uuid)
        }), T = Array.isArray(h?.results) ? h.results : [], B = (j) => i.find((Pe) => Pe.uuid === j)?.name || j;
        let F = !1;
        for (const j of T)
          j?.success && (F = !0, N(B(String(j.upload_id)), String(j.upload_id)));
        F || (s.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        s.value = h?.response?.data?.error || h?.message || "Ingest error", re.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        l.value = !1;
      }
    }
  }
  async function Be(i, f, h) {
    const T = e();
    if (!(!i.trim() || !T)) {
      I(), l.value = !0;
      try {
        const B = f.trim() ? { title: f.trim() } : void 0, { data: F } = await J.post(`/api/v1/knowledge/${T}/ingest`, { content: i, content_type: h, metadata: B });
        F?.success ? N(f.trim() || "Pasted text") : s.value = F?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", re.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        l.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: A,
    okMsg: z(() => n.value),
    errMsg: z(() => s.value),
    reset: I,
    clearItems: m,
    removeItem: O,
    uploadFile: v,
    uploadFiles: C,
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
}, Fn = { key: 1 }, Nn = {
  key: 3,
  class: "ap-pane"
}, Dn = { class: "ap-form" }, Bn = { class: "ap-grid2" }, Pn = { class: "ap-field" }, Rn = ["placeholder"], qn = { class: "ap-field" }, zn = { class: "ap-field" }, Vn = { class: "ap-label-row" }, Kn = {
  key: 0,
  class: "ap-count"
}, jn = ["placeholder"], Gn = { class: "ap-actions" }, Wn = { class: "ap-hint" }, Hn = ["disabled"], Xn = {
  key: 4,
  class: "ap-items"
}, Jn = { class: "ap-items-h" }, Qn = { class: "ap-items-list" }, Yn = { class: "ap-item-name" }, Zn = { class: "ap-item-status" }, Io = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, l = o, n = hn(() => t.kbId, () => l("changed")), s = U("file"), p = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], k = z(() => t.noun || "content");
    function A(C) {
      n.reset(), s.value = C, C === "uploads" && W();
    }
    const I = U(null), m = U(!1);
    function O() {
      I.value?.click();
    }
    function u(C) {
      const v = C.target.files;
      v?.length && n.uploadFiles(v), I.value && (I.value.value = "");
    }
    function y(C) {
      C.preventDefault(), m.value = !1;
      const v = C.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const E = U([]), L = U(!1), b = U(""), N = U(""), D = U({}), q = z(() => {
      const C = N.value.trim().toLowerCase();
      return C ? E.value.filter((v) => v.filename.toLowerCase().includes(C)) : E.value;
    }), V = z(() => Object.values(D.value).filter(Boolean).length);
    async function W() {
      L.value = !0, b.value = "";
      try {
        const { uploads: C } = await n.listMyUploads(200, 0);
        E.value = C;
      } catch (C) {
        b.value = C?.message || "Could not load your uploads";
      } finally {
        L.value = !1;
      }
    }
    function te(C) {
      D.value = { ...D.value, [C]: !D.value[C] };
    }
    async function ne() {
      const C = E.value.filter((v) => D.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      C.length && (await n.ingestExistingUploads(C), n.errMsg.value || (D.value = {}));
    }
    function Q(C) {
      return !C || C <= 0 ? "" : C < 1024 ? `${C} B` : C < 1024 * 1024 ? `${(C / 1024).toFixed(0)} KB` : `${(C / 1024 / 1024).toFixed(1)} MB`;
    }
    const Y = U(""), K = U(""), H = U("text/plain"), X = z(() => K.value.length);
    async function _() {
      K.value.trim() && (await n.ingestText(K.value, Y.value, H.value), n.errMsg.value || (K.value = "", Y.value = ""));
    }
    const g = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function se(C) {
      return C === "done" ? "tabler:circle-check" : C === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ke = z(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && W();
    }), ce(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (C, v) => (c(), d("div", bn, [
      r("div", _n, [
        (c(), d(Z, null, ee(p, (x) => r("button", {
          key: x.id,
          class: R(["ap-mode", { on: s.value === x.id }]),
          role: "tab",
          "aria-selected": s.value === x.id,
          onClick: (ye) => A(x.id)
        }, [
          $(a(S), {
            icon: x.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, w(x.label), 1)
        ], 10, kn)), 64))
      ]),
      a(n).errMsg.value ? (c(), d("div", yn, [
        $(a(S), { icon: "tabler:alert-circle" }),
        P(w(a(n).errMsg.value), 1)
      ])) : M("", !0),
      s.value === "file" ? (c(), d("section", gn, [
        r("input", {
          ref_key: "fileInput",
          ref: I,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: a(pn),
          onChange: u
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: R(["ap-drop", { over: m.value }]),
          onClick: O,
          onDragover: v[0] || (v[0] = _e((x) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (x) => m.value = !1),
          onDrop: y
        }, [
          $(a(S), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", $n, [
        r("div", xn, [
          ue(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (x) => N.value = x),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [ge, N.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !V.value || a(n).busy.value,
            onClick: ne
          }, [
            $(a(S), {
              icon: a(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: R(a(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + w(V.value ? `Add ${V.value} selected` : "Add selected"), 1)
          ], 8, Sn)
        ]),
        L.value ? (c(), d("div", Cn, [
          $(a(S), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = P(" Loading your uploads…", -1))
        ])) : b.value ? (c(), d("div", En, [
          $(a(S), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + w(b.value), 1)
        ])) : q.value.length ? (c(), d("ul", Mn, [
          (c(!0), d(Z, null, ee(q.value, (x) => (c(), d("li", {
            key: x.uuid
          }, [
            r("button", {
              type: "button",
              class: R(["ap-upload", { on: D.value[x.uuid] }]),
              "aria-pressed": !!D.value[x.uuid],
              onClick: (ye) => te(x.uuid)
            }, [
              $(a(S), {
                class: "ap-upload-check",
                icon: D.value[x.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $(a(S), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", In, [
                r("span", On, w(x.filename), 1),
                r("span", Un, [
                  x.mime_type ? (c(), d("span", Ln, w(x.mime_type), 1)) : M("", !0),
                  Q(x.size) ? (c(), d("span", Fn, w(Q(x.size)), 1)) : M("", !0)
                ])
              ])
            ], 10, An)
          ]))), 128))
        ])) : (c(), d("div", Tn, [
          $(a(S), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = P(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Nn, [
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
              ue(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (x) => Y.value = x),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${k.value} a title`,
                autocomplete: "off"
              }, null, 8, Rn), [
                [ge, Y.value]
              ])
            ]),
            r("div", qn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              ue(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (x) => H.value = x),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [ze, H.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", Vn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              X.value ? (c(), d("span", Kn, w(X.value.toLocaleString()) + " chars", 1)) : M("", !0)
            ]),
            ue(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (x) => K.value = x),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${k.value} to add to this knowledge base…`
            }, null, 8, jn), [
              [ge, K.value]
            ])
          ]),
          r("div", Gn, [
            r("span", Wn, [
              $(a(S), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !K.value.trim() || a(n).busy.value,
              onClick: _
            }, [
              $(a(S), {
                icon: a(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: R(a(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + w(a(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Hn)
          ])
        ])
      ])),
      ke.value ? (c(), d("div", Xn, [
        r("div", Jn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          a(n).busy.value ? M("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = (x) => a(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Qn, [
          (c(!0), d(Z, null, ee(a(n).items.value, (x) => (c(), d("li", {
            key: x.key,
            class: R(["ap-item", x.status])
          }, [
            $(a(S), {
              class: R(["ap-item-ic", ["uploading", "processing", "embedding"].includes(x.status) && "spin"]),
              icon: se(x.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Yn, w(x.name), 1),
            r("span", Zn, w(x.error || g[x.status]), 1)
          ], 2))), 128))
        ])
      ])) : M("", !0)
    ]));
  }
});
export {
  Xe as A,
  po as B,
  fo as C,
  we as D,
  lo as E,
  Ke as F,
  ho as G,
  ro as H,
  oe as N,
  ve as _,
  yo as a,
  To as b,
  so as c,
  $o as d,
  Mo as e,
  Eo as f,
  xo as g,
  wo as h,
  ao as i,
  Co as j,
  Ao as k,
  Te as l,
  So as m,
  oo as n,
  Io as o,
  Qe as p,
  bo as q,
  _o as r,
  tt as s,
  io as t,
  go as u,
  vo as v,
  ko as w,
  mo as x,
  co as y,
  uo as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang-BGy7c1Rc.js.map
