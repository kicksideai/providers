import { defineComponent as G, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as me, normalizeClass as q, createVNode as w, unref as l, withKeys as Pe, createCommentVNode as I, Fragment as Y, renderList as ne, createBlock as he, createTextVNode as B, toDisplayString as x, watch as ce, onBeforeUnmount as _e, Transition as Me, withCtx as Ae, withModifiers as be, ref as U, computed as j, isRef as Se, nextTick as Ve, onMounted as Ie, withDirectives as ue, vModelText as xe, vModelSelect as qe } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as J, host as re } from "@wippy-fe/proxy";
function Ue(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function ao(e) {
  return Ue(e.metadata, e.id);
}
function de(e) {
  return Ue(e.metadata, "");
}
function H(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function V(e) {
  return typeof e == "string" ? e.trim() : "";
}
function ze(e) {
  const o = H(e.metadata), t = H(o.source_ref);
  let a = V(t.external_id) || V(o.external_id);
  const n = V(t.external_version) || V(o.external_version);
  let s = V(t.upload_id) || V(o.upload_id), p = V(t.source_url) || V(t.url) || V(o.source_url);
  const b = V(t.reference_component_id) || V(t.component_id) || V(o.reference_component_id), E = Object.keys(H(t.reference_context)).length ? H(t.reference_context) : Object.keys(H(t.context)).length ? H(t.context) : H(o.reference_context);
  if (!s && a.startsWith("upload:") && (s = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && s && (a = `upload:${s}`), !a && p && (a = `url:${p}`), !a) return null;
  const _ = { ...t };
  delete _.thread_id, delete _.thread_event_id, delete _.thread_event_seq, b && !V(_.reference_component_id) && (_.reference_component_id = b), Object.keys(E).length && Object.keys(H(_.reference_context)).length === 0 && (_.reference_context = E), a && Object.keys(_).length && !V(_.external_id) && (_.external_id = a);
  const m = Object.keys(_).length > 0;
  return {
    external_id: a,
    external_version: n || void 0,
    upload_id: s || void 0,
    source_url: p || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id,
      source_ref: m ? _ : void 0
    },
    source_ref: m ? _ : void 0
  };
}
function lo(e) {
  const o = ze(e), t = o ? V(o.external_id) : "";
  if (!t) return null;
  const a = H(e.metadata), n = H(a.source_ref);
  return `${V(n.external_source) || V(a.external_source)}\0${t}`;
}
function we(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const je = /engine .*not installed|no .*engine|unavailable/i;
function io(e) {
  return je.test(e || "");
}
const ro = "This knowledge base's engine is not installed; its contents are unavailable.", se = {
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
  if (e.node_type === "document") return se.document;
  if (e.is_root) return se.root;
  const o = (e.concept_type || "").toLowerCase();
  return se[o] || se.topic;
}
const Ke = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, pe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function Ge(e) {
  return e < pe.length ? pe[e] : Math.round((pe[0] + (e - pe.length + 1) * 137.508) % 360);
}
function fe(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Ce = 34, Ee = 88, We = 78, He = 38;
function uo(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), a = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && a.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const g = /* @__PURE__ */ new Set();
    let M = u, F = 0;
    for (; !g.has(M); ) {
      g.add(M);
      const y = a.get(M);
      if (y === void 0 || n(y)) return { branch: M, depth: F };
      M = y, F++;
    }
    return { branch: M, depth: F };
  }
  const p = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const g = s(u.id);
    p.set(u.id, g), b.set(g.branch, Math.max(b.get(g.branch) ?? 0, g.depth));
  }
  const E = [...new Set([...p.values()].map((u) => u.branch))].sort((u, g) => (t.get(u)?.label || "").localeCompare(t.get(g)?.label || "")), _ = /* @__PURE__ */ new Map();
  E.forEach((u, g) => _.set(u, Ge(g)));
  const m = (u, g, M) => u + (g - u) * M, O = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      O.set(u.id, { ...se.root });
      continue;
    }
    const g = p.get(u.id);
    if (!g) {
      O.set(u.id, { ...se.topic });
      continue;
    }
    const M = _.get(g.branch) ?? 220, F = Math.min(Math.max(b.get(g.branch) ?? 0, 1), 4), y = Math.min(1, g.depth / F);
    if (u.node_type === "document") {
      const R = Math.min(84, m(Ce, Ee, y) + 6);
      O.set(u.id, { fill: fe(M, 32, R), stroke: fe(M, 32, Math.max(50, R - 14)) });
    } else {
      const R = m(Ce, Ee, y), L = m(We, He, y);
      O.set(u.id, { fill: fe(M, L, R), stroke: fe(M, L, Math.max(28, R - 17)) });
    }
  }
  return O;
}
const Xe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function po(e, o) {
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
    const M = (a.get(m) || []).slice().sort(s), F = [];
    for (const y of M) {
      const R = p(y, O + 1, u);
      R && F.push(R);
    }
    return { concept: g, children: F, depth: O };
  }
  const b = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(s), E = /* @__PURE__ */ new Set(), _ = [];
  for (const m of b) {
    const O = p(m, 0, E);
    O && _.push(O);
  }
  for (const m of e)
    if (!E.has(m.id)) {
      const O = p(m.id, 0, E);
      O && _.push(O);
    }
  return _;
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
    const b = Je(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: b.slice(0, -1) });
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
    let b = "";
    if (p.from_node_id === e.id) b = p.to_node_id;
    else if (p.to_node_id === e.id) b = p.from_node_id;
    else continue;
    if (!b || n.has(b) || s.has(b)) continue;
    const E = t.get(b);
    E && (n.add(b), a.push({ concept: E, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
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
function le(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function tt(e, o) {
  if (!o) return null;
  const t = le(e) ? e : {}, a = [
    t,
    le(t.data) ? t.data : null,
    le(t.payload) ? t.payload : null,
    le(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
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
function nt(e, o) {
  if (!e) return null;
  const t = Oe(`component.${e}`, (a) => {
    const n = tt(a, e);
    n && o(n);
  });
  return typeof t == "function" ? t : null;
}
const ot = { class: "kx-shell" }, st = { class: "kx-rail" }, at = { class: "kx-main" }, $o = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", ot, [
      r("aside", st, [
        me(o.$slots, "rail")
      ]),
      r("main", at, [
        me(o.$slots, "default")
      ])
    ]));
  }
}), lt = ["aria-label", "title", "disabled"], ve = /* @__PURE__ */ G({
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
      w(l(C), {
        icon: e.icon,
        class: q(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, lt));
  }
}), it = { class: "kx-search" }, rt = ["value", "placeholder"], Te = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", it, [
      w(l(C), {
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
        w(l(C), {
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
}, So = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", ct, [
      (c(!0), d(Y, null, ne(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: q(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (p) => t("select", s.id)
      }, [
        s.icon ? (c(), he(l(C), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        B(" " + x(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", dt, x(s.count), 1)) : I("", !0)
      ], 10, ut))), 128))
    ]));
  }
}), Co = /* @__PURE__ */ G({
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
      w(l(C), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        me(a.$slots, "default")
      ])
    ], 2));
  }
}), pt = ["aria-label"], ft = { class: "kx-drawer-h" }, mt = { class: "kx-drawer-title" }, vt = { class: "kx-drawer-b" }, Eo = /* @__PURE__ */ G({
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
    return ce(() => t.open, (s) => {
      s ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), _e(() => window.removeEventListener("keydown", n)), (s, p) => (c(), he(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: p[1] || (p[1] = be((b) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", ft, [
              r("span", mt, [
                w(l(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                B(x(e.title), 1)
              ]),
              w(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (b) => a("close"))
              })
            ]),
            r("div", vt, [
              me(s.$slots, "default")
            ])
          ], 8, pt)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
});
function ht(e) {
  const o = U(""), t = U([]), a = U(""), n = U(null), s = U(!1), p = U(""), b = U(!1);
  let E = null;
  function _() {
    E && (clearTimeout(E), E = null), o.value = "", t.value = [], a.value = "", n.value = null, b.value = !1, p.value = "";
  }
  async function m(g = 20) {
    const M = e(), F = o.value.trim();
    if (!F || !M) {
      t.value = [], b.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, b.value = !0;
    try {
      const { data: y } = await J.get(`/api/v1/kb10/${M}/search?q=${encodeURIComponent(F)}&limit=${g}`);
      y?.success ? (t.value = y.results || [], a.value = "", n.value = y.retrieval?.analysis?.status === "unavailable" ? y.retrieval.analysis : null) : p.value = y?.error || "search failed";
    } catch (y) {
      p.value = y?.response?.data?.error || y?.message || "search error", re.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      s.value = !1;
    }
  }
  async function O(g = 8) {
    const M = e(), F = o.value.trim();
    if (!F || !M) {
      t.value = [], a.value = "", b.value = !1;
      return;
    }
    s.value = !0, p.value = "", n.value = null, a.value = "", b.value = !0;
    try {
      const { data: y } = await J.post(`/api/v1/knowledge/${M}/ask`, { query: F, limit: g });
      y?.success ? (t.value = y.results || [], a.value = String(y.answer || "")) : p.value = y?.error || "ask failed";
    } catch (y) {
      p.value = y?.response?.data?.error || y?.message || "ask error", re.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      s.value = !1;
    }
  }
  function u(g = 300) {
    if (E && clearTimeout(E), !o.value.trim()) {
      t.value = [], b.value = !1;
      return;
    }
    E = setTimeout(() => m(), g);
  }
  return _e(() => {
    E && clearTimeout(E);
  }), { query: o, results: t, answer: a, analysisUnavailable: n, loading: s, error: p, performed: b, run: m, ask: O, runDebounced: u, clear: _ };
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
}, Zt = { class: "kc-search-zero-t" }, To = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, a = o, { query: n, results: s, answer: p, analysisUnavailable: b, loading: E, error: _, performed: m, run: O, ask: u, runDebounced: g, clear: M } = ht(() => t.kbId), F = U("search"), y = U(!1), R = U(""), L = j(() => t.layout === "panel" && t.ask && F.value === "ask"), Z = j(() => E.value ? "tabler:hourglass" : L.value ? "tabler:sparkles" : "tabler:arrow-right"), P = j(() => s.value[0]), ee = j(() => L.value ? s.value.slice(1) : s.value), ae = j(() => t.layout === "rail" && y.value && n.value.trim() !== "" && (E.value || m.value || !!_.value));
    function Q() {
      n.value.trim() && (R.value = n.value.trim(), L.value ? u(8) : O(20));
    }
    function oe() {
      t.layout === "rail" && g(300);
    }
    function X(W) {
      F.value = W, m.value && n.value.trim() && Q();
    }
    function z(W) {
      a("open", W), t.layout === "rail" && (M(), y.value = !1);
    }
    return (W, $) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: $[2] || ($[2] = (k) => y.value = !0),
      onFocusout: $[3] || ($[3] = (k) => y.value = !1)
    }, [
      w(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          $[0] || ($[0] = (k) => Se(n) ? n.value = k : null),
          oe
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: $[1] || ($[1] = (k) => l(O)(20)),
        onClear: l(M)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ae.value ? (c(), d("div", _t, [
        l(b) ? (c(), d("p", bt, "Showing direct matches. No model is assigned to " + x(l(b).model) + ".", 1)) : I("", !0),
        l(_) ? (c(), d("div", kt, [
          w(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, x(l(_)), 1)
        ])) : l(s).length ? (c(), d("div", yt, [
          (c(!0), d(Y, null, ne(l(s), (k) => (c(), d("button", {
            key: k.id,
            class: "kc-search-hit",
            onMousedown: be((te) => z(k), ["prevent"])
          }, [
            r("span", xt, [
              l(de)(k) ? (c(), d("span", wt, [
                w(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(l(de)(k)), 1)
              ])) : I("", !0),
              r("span", $t, x(k.node_type || "result"), 1),
              k.similarity != null ? (c(), d("span", St, x(l($e)(k.similarity)), 1)) : I("", !0)
            ]),
            r("span", Ct, x(l(we)(k.content, 160)), 1)
          ], 40, gt))), 128))
        ])) : l(m) && !l(E) ? (c(), d("div", Et, [
          w(l(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          $[9] || ($[9] = r("span", null, "No passages matched.", -1))
        ])) : l(E) ? (c(), d("div", Tt, [
          w(l(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          $[10] || ($[10] = r("span", null, "Searching…", -1))
        ])) : I("", !0)
      ])) : I("", !0)
    ], 32)) : (c(), d("div", Mt, [
      r("div", At, [
        e.ask ? (c(), d("div", It, [
          r("button", {
            class: q(["kc-search-mode", { on: F.value === "search" }]),
            onClick: $[4] || ($[4] = (k) => X("search"))
          }, [
            w(l(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            $[11] || ($[11] = B(" Search ", -1))
          ], 2),
          r("button", {
            class: q(["kc-search-mode", { on: F.value === "ask" }]),
            onClick: $[5] || ($[5] = (k) => X("ask"))
          }, [
            w(l(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            $[12] || ($[12] = B(" Ask ", -1))
          ], 2)
        ])) : I("", !0),
        r("div", Ot, [
          w(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": $[6] || ($[6] = (k) => Se(n) ? n.value = k : null),
            placeholder: L.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Q
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        w(ve, {
          icon: Z.value,
          label: L.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(E),
          disabled: !l(n).trim() || l(E),
          onClick: Q
        }, null, 8, ["icon", "label", "active", "disabled"]),
        w(ve, {
          icon: "tabler:x",
          label: "Close search",
          onClick: $[7] || ($[7] = (k) => a("close"))
        })
      ]),
      t.ask ? I("", !0) : (c(), d("p", Ut, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(b) ? (c(), d("p", Lt, "Showing direct matches. No model is assigned to " + x(l(b).model) + ".", 1)) : I("", !0),
      l(_) ? (c(), d("div", Ft, [
        w(l(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, x(l(_)), 1)
      ])) : I("", !0),
      l(E) ? (c(), d("div", Nt, [
        (c(), d(Y, null, ne(3, (k) => r("div", {
          key: k,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(s).length ? (c(), d(Y, { key: 4 }, [
        L.value ? (c(), d("div", Dt, [
          r("div", Bt, [
            w(l(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            B(" " + x(l(p) ? "Answer" : "Best match") + ' for "' + x(R.value) + '"', 1)
          ]),
          r("p", Rt, x(l(p) || l(we)(P.value?.content, 700)), 1),
          P.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: $[8] || ($[8] = (k) => z(P.value))
          }, [
            w(l(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            $[13] || ($[13] = B(" Open source document ", -1)),
            P.value?.similarity != null ? (c(), d("span", Pt, x(l($e)(P.value?.similarity)), 1)) : I("", !0)
          ])) : I("", !0)
        ])) : I("", !0),
        r("div", Vt, [
          L.value && ee.value.length ? (c(), d("div", qt, "Sources")) : I("", !0),
          (c(!0), d(Y, null, ne(ee.value, (k) => (c(), d("button", {
            key: k.id,
            class: q(["kc-search-result", { link: !!k.parent_id }]),
            onClick: (te) => z(k)
          }, [
            r("div", jt, [
              l(de)(k) ? (c(), d("span", Kt, [
                w(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(l(de)(k)), 1)
              ])) : I("", !0),
              r("span", Gt, x(k.node_type || "passage"), 1),
              k.llm_score != null ? (c(), d("span", Wt, "Relevance " + x(Math.round(k.llm_score)), 1)) : I("", !0),
              k.similarity != null ? (c(), d("span", Ht, x(l($e)(k.similarity)), 1)) : I("", !0)
            ]),
            r("p", Xt, x(l(we)(k.content, 360)), 1),
            k.parent_id ? (c(), d("span", Jt, [
              w(l(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              $[14] || ($[14] = B(" Open document", -1))
            ])) : I("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : l(m) ? (c(), d("div", Qt, [
        w(l(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        $[15] || ($[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        $[16] || ($[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", Yt, [
        w(l(C), {
          icon: L.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Zt, x(L.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), en = ["aria-label"], tn = { class: "kc-orig-h" }, nn = { class: "kc-orig-title" }, on = { class: "kc-orig-title-t" }, sn = { class: "kc-orig-b" }, an = ["content-type", "source-url", "filename"], Mo = /* @__PURE__ */ G({
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
    function E() {
      t.open && !document.fullscreenElement && a("close");
    }
    ce(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", b), Ve(s)) : (window.removeEventListener("keydown", b), p());
    });
    const _ = U(""), m = U("");
    async function O() {
      if (_.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await J.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (_.value = u.url, m.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return ce(() => [t.open, t.sourceUrl], O, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", E);
    }), _e(() => {
      document.removeEventListener("fullscreenchange", E), window.removeEventListener("keydown", b), p();
    }), (u, g) => (c(), he(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: q(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: g[1] || (g[1] = be((M) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", tn, [
              r("span", nn, [
                w(l(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", on, x(e.title), 1)
              ]),
              w(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: g[0] || (g[0] = (M) => a("close"))
              })
            ]),
            r("div", sn, [
              _.value ? (c(), d("wc-resource-view", {
                key: _.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": _.value,
                filename: e.filename
              }, null, 8, an)) : I("", !0)
            ])
          ], 8, en)
        ], 2)) : I("", !0)
      ]),
      _: 1
    }));
  }
}), Ao = /* @__PURE__ */ G({
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
      w(l(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, x(e.label || "View original"), 1)
    ]));
  }
}), ln = { class: "kc-docsum" }, rn = { class: "kc-docsum-h" }, Io = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = U(!1), a = j(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", ln, [
      r("div", rn, [
        w(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        B(" " + x(e.label), 1)
      ]),
      r("p", {
        class: q(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, x(e.text), 3),
      a.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (p) => t.value = !t.value)
      }, x(t.value ? "Show less" : "Show more"), 1)) : I("", !0)
    ]));
  }
}), cn = { class: "kx-empty kx-empty-spacious" }, un = { class: "kx-empty-title" }, dn = {
  key: 0,
  class: "kx-empty-sub"
}, Oo = /* @__PURE__ */ G({
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
        w(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", un, x(e.title), 1),
      e.hint ? (c(), d("div", dn, x(e.hint), 1)) : I("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), he(l(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        B(" " + x(e.cta), 1)
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
const ie = ["uploading", "processing"];
function _n(e, o) {
  const t = U([]), a = U(!1), n = U(""), s = U("");
  let p = 0;
  const b = (i) => `${i}${++p}`, E = j(() => a.value || t.value.some((i) => ie.includes(i.status)));
  function _() {
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
  const g = [];
  function M() {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) g.push(setTimeout(() => o(), i));
  }
  function F() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), M();
  }
  function y(i) {
    const f = t.value.find((h) => h.key === i);
    !f || f.status === "done" || (u(i, { status: "done" }), F());
  }
  function R(i, f) {
    t.value = [...t.value, { key: b("q"), name: i, uuid: f, status: "done" }], F();
  }
  const L = /* @__PURE__ */ new Map(), Z = [];
  function P(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function ee(i) {
    const f = P(i) ? i : {};
    return String(f.topic || "");
  }
  function ae(i) {
    const f = P(i) ? i : {}, h = [
      f,
      P(f.data) ? f.data : null,
      P(f.payload) ? f.payload : null,
      P(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const A of h)
      if (typeof A.uuid == "string" && typeof A.status == "string") return A;
    return {};
  }
  function Q(i, f, h) {
    const A = t.value.find((N) => N.uuid === i && ie.includes(N.status));
    if (!A) return;
    const D = String(f || "");
    D === "error" || D === "failed" ? u(A.key, { status: "error", error: String(h || "File processing failed") }) : D === "completed" ? y(A.key) : ["pending", "uploaded", "queued", "processing"].includes(D) && u(A.key, { status: "processing" });
  }
  function oe(i, f) {
    const h = ae(f);
    h.uuid === i && Q(i, h.status, h.error);
  }
  function X(i) {
    const f = `upload:${i}`;
    if (L.has(f)) return;
    const h = Oe("@message", (A) => {
      ee(A) === f && oe(i, A);
    });
    typeof h == "function" && L.set(f, h);
  }
  async function z(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ie.includes(f.status))))
      try {
        const { data: f } = await J.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = P(f?.upload) ? f.upload : P(f) ? f : {};
        Q(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function W(i) {
    z(i);
    for (const f of [1500, 5e3, 15e3])
      Z.push(setTimeout(() => {
        z(i);
      }, f));
  }
  function $(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const h = String(f.last_error || "Embedding failed");
      for (const A of t.value) ie.includes(A.status) && u(A.key, { status: "error", error: h });
      s.value = h;
    }
  }
  let k = null, te = 0;
  function ke(i) {
    const f = ++te;
    if (k && (k(), k = null), !i) return;
    const h = nt(i, $);
    if (f !== te) {
      h && h();
      return;
    }
    k = h;
  }
  ce(() => e(), (i) => {
    ke(i);
  }, { immediate: !0 }), _e(() => {
    for (const i of g.splice(0)) clearTimeout(i);
    for (const i of Z.splice(0)) clearTimeout(i);
    te++, k && k();
    for (const i of L.values()) i();
    L.clear();
  });
  async function ye(i, f, h) {
    try {
      const { data: A } = await J.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!A?.success || !A.upload_token) {
        u(i, { status: "error", error: A?.error || "Could not get an upload token" });
        return;
      }
      const D = new FormData();
      D.append("file", f), D.append("upload_token", A.upload_token);
      const { data: N } = await J.post("/api/v1/uploads", D, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (N?.success && N.uuid) {
        const K = String(N.uuid);
        u(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), X(K), W(K);
      } else
        u(i, { status: "error", error: N?.error || "Upload failed" });
    } catch (A) {
      u(i, { status: "error", error: A?.response?.data?.error || A?.message || "Upload error" }), re.handleError(A?.response?.status === 401 ? "auth-expired" : "other", A);
    }
  }
  function T(i) {
    const f = e();
    if (f) {
      _();
      for (const h of Array.from(i)) {
        if (!hn(h)) {
          s.value = mn;
          continue;
        }
        const A = b("f");
        t.value = [...t.value, { key: A, name: h.name, status: "uploading" }], ye(A, h, f);
      }
    }
  }
  function v(i) {
    T([i]);
  }
  async function S(i = 100, f = 0) {
    const { data: h } = await J.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), D = (Array.isArray(h?.uploads) ? h.uploads : []).map((N) => ({
      uuid: String(N.uuid),
      filename: String(N.filename || N.meta && N.meta.filename || N.uuid),
      mime_type: N.mime_type,
      size: N.size,
      status: N.status,
      created_at: N.created_at
    }));
    return { uploads: D, total: Number(h?.meta?.total ?? D.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      _(), a.value = !0;
      try {
        const { data: h } = await J.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), A = Array.isArray(h?.results) ? h.results : [], D = (K) => i.find((Re) => Re.uuid === K)?.name || K;
        let N = !1;
        for (const K of A)
          K?.success && (N = !0, R(D(String(K.upload_id)), String(K.upload_id)));
        N || (s.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        s.value = h?.response?.data?.error || h?.message || "Ingest error", re.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(i, f, h) {
    const A = e();
    if (!(!i.trim() || !A)) {
      _(), a.value = !0;
      try {
        const D = f.trim() ? { title: f.trim() } : void 0, { data: N } = await J.post(`/api/v1/knowledge/${A}/ingest`, { content: i, content_type: h, metadata: D });
        N?.success ? R(f.trim() || "Pasted text") : s.value = N?.error || "Ingestion failed";
      } catch (D) {
        s.value = D?.response?.data?.error || D?.message || "Ingestion error", re.handleError(D?.response?.status === 401 ? "auth-expired" : "other", D);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: E,
    okMsg: j(() => n.value),
    errMsg: j(() => s.value),
    reset: _,
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
}, Qn = { class: "ap-items-h" }, Yn = { class: "ap-items-list" }, Zn = { class: "ap-item-name" }, eo = { class: "ap-item-status" }, Uo = /* @__PURE__ */ G({
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
    ], b = j(() => t.noun || "content");
    function E(T) {
      n.reset(), s.value = T, T === "uploads" && ee();
    }
    const _ = U(null), m = U(!1);
    function O() {
      _.value?.click();
    }
    function u(T) {
      const v = T.target.files;
      v?.length && n.uploadFiles(v), _.value && (_.value.value = "");
    }
    function g(T) {
      T.preventDefault(), m.value = !1;
      const v = T.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const M = U([]), F = U(!1), y = U(""), R = U(""), L = U({}), Z = j(() => {
      const T = R.value.trim().toLowerCase();
      return T ? M.value.filter((v) => v.filename.toLowerCase().includes(T)) : M.value;
    }), P = j(() => Object.values(L.value).filter(Boolean).length);
    async function ee() {
      F.value = !0, y.value = "";
      try {
        const { uploads: T } = await n.listMyUploads(200, 0);
        M.value = T;
      } catch (T) {
        y.value = T?.message || "Could not load your uploads";
      } finally {
        F.value = !1;
      }
    }
    function ae(T) {
      L.value = { ...L.value, [T]: !L.value[T] };
    }
    async function Q() {
      const T = M.value.filter((v) => L.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      T.length && (await n.ingestExistingUploads(T), n.errMsg.value || (L.value = {}));
    }
    function oe(T) {
      return !T || T <= 0 ? "" : T < 1024 ? `${T} B` : T < 1024 * 1024 ? `${(T / 1024).toFixed(0)} KB` : `${(T / 1024 / 1024).toFixed(1)} MB`;
    }
    const X = U(""), z = U(""), W = U("text/plain"), $ = j(() => z.value.length);
    async function k() {
      z.value.trim() && (await n.ingestText(z.value, X.value, W.value), n.errMsg.value || (z.value = "", X.value = ""));
    }
    const te = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function ke(T) {
      return T === "done" ? "tabler:circle-check" : T === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ye = j(() => n.items.value.length > 0);
    return Ie(() => {
      s.value === "uploads" && ee();
    }), ce(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (T, v) => (c(), d("div", bn, [
      r("div", kn, [
        (c(), d(Y, null, ne(p, (S) => r("button", {
          key: S.id,
          class: q(["ap-mode", { on: s.value === S.id }]),
          role: "tab",
          "aria-selected": s.value === S.id,
          onClick: (ge) => E(S.id)
        }, [
          w(l(C), {
            icon: S.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, x(S.label), 1)
        ], 10, yn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", gn, [
        w(l(C), { icon: "tabler:alert-circle" }),
        B(x(l(n).errMsg.value), 1)
      ])) : I("", !0),
      s.value === "file" ? (c(), d("section", xn, [
        r("input", {
          ref_key: "fileInput",
          ref: _,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(fn),
          onChange: u
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: q(["ap-drop", { over: m.value }]),
          onClick: O,
          onDragover: v[0] || (v[0] = be((S) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (S) => m.value = !1),
          onDrop: g
        }, [
          w(l(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", $n, [
        r("div", Sn, [
          ue(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (S) => R.value = S),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, R.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !P.value || l(n).busy.value,
            onClick: Q
          }, [
            w(l(C), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: q(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + x(P.value ? `Add ${P.value} selected` : "Add selected"), 1)
          ], 8, Cn)
        ]),
        F.value ? (c(), d("div", En, [
          w(l(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = B(" Loading your uploads…", -1))
        ])) : y.value ? (c(), d("div", Tn, [
          w(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          B(" " + x(y.value), 1)
        ])) : Z.value.length ? (c(), d("ul", An, [
          (c(!0), d(Y, null, ne(Z.value, (S) => (c(), d("li", {
            key: S.uuid
          }, [
            r("button", {
              type: "button",
              class: q(["ap-upload", { on: L.value[S.uuid] }]),
              "aria-pressed": !!L.value[S.uuid],
              onClick: (ge) => ae(S.uuid)
            }, [
              w(l(C), {
                class: "ap-upload-check",
                icon: L.value[S.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              w(l(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", On, [
                r("span", Un, x(S.filename), 1),
                r("span", Ln, [
                  S.mime_type ? (c(), d("span", Fn, x(S.mime_type), 1)) : I("", !0),
                  oe(S.size) ? (c(), d("span", Nn, x(oe(S.size)), 1)) : I("", !0)
                ])
              ])
            ], 10, In)
          ]))), 128))
        ])) : (c(), d("div", Mn, [
          w(l(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = B(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Dn, [
        r("div", Bn, [
          r("div", Rn, [
            r("div", Pn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                B("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              ue(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (S) => X.value = S),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${b.value} a title`,
                autocomplete: "off"
              }, null, 8, Vn), [
                [xe, X.value]
              ])
            ]),
            r("div", qn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              ue(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (S) => W.value = S),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [qe, W.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", jn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              $.value ? (c(), d("span", Kn, x($.value.toLocaleString()) + " chars", 1)) : I("", !0)
            ]),
            ue(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (S) => z.value = S),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${b.value} to add to this knowledge base…`
            }, null, 8, Gn), [
              [xe, z.value]
            ])
          ]),
          r("div", Wn, [
            r("span", Hn, [
              w(l(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = B(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !z.value.trim() || l(n).busy.value,
              onClick: k
            }, [
              w(l(C), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: q(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              B(" " + x(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
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
          (c(!0), d(Y, null, ne(l(n).items.value, (S) => (c(), d("li", {
            key: S.key,
            class: q(["ap-item", S.status])
          }, [
            w(l(C), {
              class: q(["ap-item-ic", ["uploading", "processing", "embedding"].includes(S.status) && "spin"]),
              icon: ke(S.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Zn, x(S.name), 1),
            r("span", eo, x(S.error || te[S.status]), 1)
          ], 2))), 128))
        ])
      ])) : I("", !0)
    ]));
  }
}), to = { props: { type: "object", properties: { config: { type: "object", description: "KB detail context: { kb_id: string }", default: {} } } } }, Lo = {
  wippy: to
};
export {
  po as A,
  fo as B,
  Je as C,
  mo as D,
  ro as E,
  vo as F,
  we as G,
  Ke as H,
  bo as I,
  uo as J,
  se as N,
  ve as _,
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
  Lo as q,
  Ye as r,
  nt as s,
  ko as t,
  wo as u,
  yo as v,
  co as w,
  _o as x,
  go as y,
  ho as z
};
//# sourceMappingURL=package-CQBcol1J.js.map
