import { defineComponent as G, openBlock as u, createElementBlock as d, createElementVNode as r, renderSlot as ve, normalizeClass as z, createVNode as g, unref as l, withKeys as ze, createCommentVNode as A, Fragment as Y, renderList as te, createBlock as _e, createTextVNode as B, toDisplayString as x, watch as ue, onBeforeUnmount as be, Transition as Me, withCtx as Ae, withModifiers as ke, ref as O, computed as j, isRef as Se, nextTick as Ve, onMounted as Ie, withDirectives as de, vModelText as we, vModelSelect as qe } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as J, host as ce } from "@wippy-fe/proxy";
function Le(e, s = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || s;
}
function so(e) {
  return Le(e.metadata, e.id);
}
function pe(e) {
  return Le(e.metadata, "");
}
function X(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function R(e) {
  return typeof e == "string" ? e.trim() : "";
}
function je(e) {
  const s = X(e.metadata), t = X(s.source_ref);
  let a = R(t.external_id) || R(s.external_id);
  const n = R(t.external_version) || R(s.external_version);
  let o = R(t.upload_id) || R(s.upload_id), p = R(t.source_url) || R(t.url) || R(s.source_url);
  const _ = R(t.reference_component_id) || R(t.component_id) || R(s.reference_component_id), U = Object.keys(X(t.reference_context)).length ? X(t.reference_context) : Object.keys(X(t.context)).length ? X(t.context) : X(s.reference_context);
  if (!o && a.startsWith("upload:") && (o = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && o && (a = `upload:${o}`), !a && p && (a = `url:${p}`), !a) return null;
  const b = { ...t };
  delete b.thread_id, delete b.thread_event_id, delete b.thread_event_seq, _ && !R(b.reference_component_id) && (b.reference_component_id = _), Object.keys(U).length && Object.keys(X(b.reference_context)).length === 0 && (b.reference_context = U), a && Object.keys(b).length && !R(b.external_id) && (b.external_id = a);
  const m = Object.keys(b).length > 0;
  return {
    external_id: a,
    external_version: n || void 0,
    upload_id: o || void 0,
    source_url: p || void 0,
    metadata: {
      title: s.title || s.filename || s.source_url,
      node_id: e.id,
      source_ref: m ? b : void 0
    },
    source_ref: m ? b : void 0
  };
}
function ao(e) {
  const s = je(e), t = s ? R(s.external_id) : "";
  if (!t) return null;
  const a = X(e.metadata), n = X(a.source_ref);
  return `${R(n.external_source) || R(a.external_source)}\0${t}`;
}
function $e(e, s) {
  return e ? e.length > s ? e.slice(0, s).trimEnd() + "…" : e : "";
}
const Ke = /engine .*not installed|no .*engine|unavailable/i;
function lo(e) {
  return Ke.test(e || "");
}
const io = "This knowledge base's engine is not installed; its contents are unavailable.", se = {
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
  if (e.node_type === "document") return se.document;
  if (e.is_root) return se.root;
  const s = (e.concept_type || "").toLowerCase();
  return se[s] || se.topic;
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
function co(e, s) {
  const t = new Map(e.map((c) => [c.id, c])), a = /* @__PURE__ */ new Map();
  for (const c of s)
    c.edge_type !== "subtopic_of" && c.edge_type !== "categorized_as" || t.has(c.from_node_id) && t.has(c.to_node_id) && a.set(c.from_node_id, c.to_node_id);
  const n = (c) => !!t.get(c)?.is_root;
  function o(c) {
    const y = /* @__PURE__ */ new Set();
    let E = c, w = 0;
    for (; !y.has(E); ) {
      y.add(E);
      const D = a.get(E);
      if (D === void 0 || n(D)) return { branch: E, depth: w };
      E = D, w++;
    }
    return { branch: E, depth: w };
  }
  const p = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
  for (const c of e) {
    if (c.is_root) continue;
    const y = o(c.id);
    p.set(c.id, y), _.set(y.branch, Math.max(_.get(y.branch) ?? 0, y.depth));
  }
  const U = [...new Set([...p.values()].map((c) => c.branch))].sort((c, y) => (t.get(c)?.label || "").localeCompare(t.get(y)?.label || "")), b = /* @__PURE__ */ new Map();
  U.forEach((c, y) => b.set(c, We(y)));
  const m = (c, y, E) => c + (y - c) * E, I = /* @__PURE__ */ new Map();
  for (const c of e) {
    if (c.is_root) {
      I.set(c.id, { ...se.root });
      continue;
    }
    const y = p.get(c.id);
    if (!y) {
      I.set(c.id, { ...se.topic });
      continue;
    }
    const E = b.get(y.branch) ?? 220, w = Math.min(Math.max(_.get(y.branch) ?? 0, 1), 4), D = Math.min(1, y.depth / w);
    if (c.node_type === "document") {
      const F = Math.min(84, m(Ce, Ee, D) + 6);
      I.set(c.id, { fill: me(E, 32, F), stroke: me(E, 32, Math.max(50, F - 14)) });
    } else {
      const F = m(Ce, Ee, D), P = m(He, Xe, D);
      I.set(c.id, { fill: me(E, P, F), stroke: me(E, P, Math.max(28, F - 17)) });
    }
  }
  return I;
}
const Je = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function uo(e, s) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of s) {
    if (!Je.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const I = a.get(m.to_node_id) || [];
    I.push(m.from_node_id), a.set(m.to_node_id, I), n.add(m.from_node_id);
  }
  const o = (m, I) => (t.get(m)?.label || "").localeCompare(t.get(I)?.label || "");
  function p(m, I, c) {
    const y = t.get(m);
    if (!y || c.has(m)) return null;
    c.add(m);
    const E = (a.get(m) || []).slice().sort(o), w = [];
    for (const D of E) {
      const F = p(D, I + 1, c);
      F && w.push(F);
    }
    return { concept: y, children: w, depth: I };
  }
  const _ = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(o), U = /* @__PURE__ */ new Set(), b = [];
  for (const m of _) {
    const I = p(m, 0, U);
    I && b.push(I);
  }
  for (const m of e)
    if (!U.has(m.id)) {
      const I = p(m.id, 0, U);
      I && b.push(I);
    }
  return b;
}
function po(e) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, o) => {
    s.set(n.concept.id, n), o && t.set(n.concept.id, o);
    for (const p of n.children) a(p, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: s, parentOf: t };
}
function fo(e) {
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
    const p = s.get(o);
    if (!p) break;
    a.unshift(p.concept), o = t.get(o);
  }
  return a;
}
function mo(e, s, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const o of s.values()) {
    if (!(o.concept.label || o.concept.id).toLowerCase().includes(a)) continue;
    const _ = Qe(o.concept.id, s, t);
    n.push({ concept: o.concept, isFolder: o.children.length > 0, path: _.slice(0, -1) });
  }
  return n.sort((o, p) => o.isFolder !== p.isFolder ? o.isFolder ? -1 : 1 : (o.concept.label || o.concept.id).localeCompare(p.concept.label || p.concept.id)).slice(0, 200);
}
function vo(e) {
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
function ho(e) {
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
function _o(e, s) {
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.from_node_id === e && !a.has(n.to_node_id) && (a.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function bo(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set();
  for (const o of s) {
    if (o.edge_type !== "subtopic_of" || o.to_node_id !== e.id || n.has(o.from_node_id)) continue;
    const p = t.get(o.from_node_id);
    p && (n.add(o.from_node_id), a.push(p));
  }
  return a.sort((o, p) => (o.label || "").localeCompare(p.label || ""));
}
function ko(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), o = new Set(Ze(e, s));
  for (const p of s) {
    if (p.edge_type === "subtopic_of" || p.edge_type === "categorized_as") continue;
    let _ = "";
    if (p.from_node_id === e.id) _ = p.to_node_id;
    else if (p.to_node_id === e.id) _ = p.from_node_id;
    else continue;
    if (!_ || n.has(_) || o.has(_)) continue;
    const U = t.get(_);
    U && (n.add(_), a.push({ concept: U, label: Ge[p.edge_type || ""] || p.edge_type || "related" }));
  }
  return a;
}
function yo(e, s) {
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
function go(e) {
  const s = (e || "").toLowerCase();
  return et.some((t) => s.startsWith(t)) || tt.has(s);
}
function wo(e) {
  const s = e || {}, t = s.source_ref && typeof s.source_ref == "object" ? s.source_ref : {}, a = t.upload_id || s.upload_id;
  if (typeof a == "string" && a.trim()) return a.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof s.external_id == "string" && s.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function nt(e, s) {
  if (!s) return null;
  const t = ie(e) ? e : {}, a = [
    t,
    ie(t.data) ? t.data : null,
    ie(t.payload) ? t.payload : null,
    ie(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
    if (n.event !== "component.meta.changed") continue;
    const o = String(n.component_id || ""), p = String(t.topic || n.topic || "");
    if (!(o && o !== s) && !(!o && p !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: o || s,
        meta: ie(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function ot(e, s) {
  if (!e) return null;
  const t = Oe(`component.${e}`, (a) => {
    const n = nt(a, e);
    n && s(n);
  });
  return typeof t == "function" ? t : null;
}
const st = { class: "kc-shell" }, at = { class: "kc-rail" }, lt = { class: "kc-main" }, $o = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (s, t) => (u(), d("div", st, [
      r("aside", at, [
        ve(s.$slots, "rail")
      ]),
      r("main", lt, [
        ve(s.$slots, "default")
      ])
    ]));
  }
}), it = ["aria-label", "title", "disabled"], he = /* @__PURE__ */ G({
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
    return (a, n) => (u(), d("button", {
      class: z(["kc-iconbtn", [
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
      g(l(C), {
        icon: e.icon,
        class: z(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, it));
  }
}), rt = { class: "kc-search" }, ct = ["value", "placeholder"], Te = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("div", rt, [
      g(l(C), {
        class: "kc-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      r("input", {
        class: "kc-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder || "Search…",
        onInput: n[0] || (n[0] = (o) => t("update:modelValue", o.target.value)),
        onKeyup: n[1] || (n[1] = ze((o) => t("enter"), ["enter"]))
      }, null, 40, ct),
      e.modelValue ? (u(), d("button", {
        key: 0,
        class: "kc-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (o) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        g(l(C), {
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
  class: "kc-count"
}, xo = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("div", ut, [
      (u(!0), d(Y, null, te(e.tabs, (o) => (u(), d("button", {
        key: o.id,
        class: z(["tb-tab", { on: e.active === o.id }]),
        role: "tab",
        "aria-selected": e.active === o.id,
        onClick: (p) => t("select", o.id)
      }, [
        o.icon ? (u(), _e(l(C), {
          key: 0,
          icon: o.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        B(" " + x(o.label) + " ", 1),
        o.count !== void 0 ? (u(), d("span", pt, x(o.count), 1)) : A("", !0)
      ], 10, dt))), 128))
    ]));
  }
}), So = /* @__PURE__ */ G({
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
    return (a, n) => (u(), d("div", {
      class: z(["kc-notice", e.tone])
    }, [
      g(l(C), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        ve(a.$slots, "default")
      ])
    ], 2));
  }
}), ft = ["aria-label"], mt = { class: "kc-drawer-h" }, vt = { class: "kc-drawer-title" }, ht = { class: "kc-drawer-b" }, Co = /* @__PURE__ */ G({
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
    return ue(() => t.open, (o) => {
      o ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), be(() => window.removeEventListener("keydown", n)), (o, p) => (u(), _e(Me, { name: "kc-drawer" }, {
      default: Ae(() => [
        e.open ? (u(), d("div", {
          key: 0,
          class: "kc-drawer-mask",
          onClick: p[1] || (p[1] = ke((_) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kc-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", mt, [
              r("span", vt, [
                g(l(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                B(x(e.title), 1)
              ]),
              g(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (_) => a("close"))
              })
            ]),
            r("div", ht, [
              ve(o.$slots, "default")
            ])
          ], 8, ft)
        ])) : A("", !0)
      ]),
      _: 3
    }));
  }
});
function _t(e) {
  const s = O(""), t = O([]), a = O(""), n = O(!1), o = O(""), p = O(!1);
  let _ = null;
  function U() {
    _ && (clearTimeout(_), _ = null), s.value = "", t.value = [], a.value = "", p.value = !1, o.value = "";
  }
  async function b(c = 20) {
    const y = e(), E = s.value.trim();
    if (!E || !y) {
      t.value = [], p.value = !1;
      return;
    }
    n.value = !0, o.value = "", p.value = !0;
    try {
      const { data: w } = await J.get(`/api/v1/kb10/${y}/search?q=${encodeURIComponent(E)}&limit=${c}`);
      w?.success ? (t.value = w.results || [], a.value = "") : o.value = w?.error || "search failed";
    } catch (w) {
      o.value = w?.response?.data?.error || w?.message || "search error", ce.handleError(w?.response?.status === 401 ? "auth-expired" : "other", w);
    } finally {
      n.value = !1;
    }
  }
  async function m(c = 8) {
    const y = e(), E = s.value.trim();
    if (!E || !y) {
      t.value = [], a.value = "", p.value = !1;
      return;
    }
    n.value = !0, o.value = "", a.value = "", p.value = !0;
    try {
      const { data: w } = await J.post(`/api/v1/knowledge/${y}/ask`, { query: E, limit: c });
      w?.success ? (t.value = w.results || [], a.value = String(w.answer || "")) : o.value = w?.error || "ask failed";
    } catch (w) {
      o.value = w?.response?.data?.error || w?.message || "ask error", ce.handleError(w?.response?.status === 401 ? "auth-expired" : "other", w);
    } finally {
      n.value = !1;
    }
  }
  function I(c = 300) {
    if (_ && clearTimeout(_), !s.value.trim()) {
      t.value = [], p.value = !1;
      return;
    }
    _ = setTimeout(() => b(), c);
  }
  return be(() => {
    _ && clearTimeout(_);
  }), { query: s, results: t, answer: a, loading: n, error: o, performed: p, run: b, ask: m, runDebounced: I, clear: U };
}
function xe(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const bt = {
  key: 0,
  class: "kc-search-pop"
}, kt = {
  key: 0,
  class: "kc-search-state err"
}, yt = {
  key: 1,
  class: "kc-search-hits"
}, gt = ["onMousedown"], wt = { class: "kc-search-hit-h" }, $t = {
  key: 0,
  class: "kc-search-r-doc"
}, xt = { class: "kc-search-hit-kind" }, St = {
  key: 1,
  class: "kc-search-hit-score"
}, Ct = { class: "kc-search-hit-body" }, Et = {
  key: 2,
  class: "kc-search-state"
}, Tt = {
  key: 3,
  class: "kc-search-state"
}, Mt = {
  key: 1,
  class: "kc-search-panel"
}, At = { class: "kc-search-bar" }, It = {
  key: 0,
  class: "kc-search-modes"
}, Ot = { class: "kc-search-field" }, Lt = {
  key: 0,
  class: "kc-search-state"
}, Ut = {
  key: 1,
  class: "kc-search-err"
}, Ft = {
  key: 2,
  class: "kc-search-skel"
}, Nt = {
  key: 0,
  class: "kc-ans"
}, Dt = { class: "kc-ans-h" }, Bt = { class: "kc-ans-body" }, Pt = {
  key: 0,
  class: "kc-ans-sim"
}, Rt = { class: "kc-search-results" }, zt = {
  key: 0,
  class: "kc-search-results-h"
}, Vt = ["onClick"], qt = { class: "kc-search-r-h" }, jt = {
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
  key: 4,
  class: "kc-search-zero"
}, Qt = {
  key: 5,
  class: "kc-search-zero"
}, Yt = { class: "kc-search-zero-t" }, Eo = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, { query: n, results: o, answer: p, loading: _, error: U, performed: b, run: m, ask: I, runDebounced: c, clear: y } = _t(() => t.kbId), E = O("search"), w = O(!1), D = O(""), F = j(() => t.layout === "panel" && t.ask && E.value === "ask"), P = j(() => _.value ? "tabler:hourglass" : F.value ? "tabler:sparkles" : "tabler:arrow-right"), W = j(() => o.value[0]), V = j(() => F.value ? o.value.slice(1) : o.value), ne = j(() => t.layout === "rail" && w.value && n.value.trim() !== "" && (_.value || b.value || !!U.value));
    function Z() {
      n.value.trim() && (D.value = n.value.trim(), F.value ? I(8) : m(20));
    }
    function oe() {
      t.layout === "rail" && c(300);
    }
    function ee(q) {
      E.value = q, b.value && n.value.trim() && Z();
    }
    function H(q) {
      a("open", q), t.layout === "rail" && (y(), w.value = !1);
    }
    return (q, k) => e.layout === "rail" ? (u(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: k[2] || (k[2] = ($) => w.value = !0),
      onFocusout: k[3] || (k[3] = ($) => w.value = !1)
    }, [
      g(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          k[0] || (k[0] = ($) => Se(n) ? n.value = $ : null),
          oe
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: k[1] || (k[1] = ($) => l(m)(20)),
        onClear: l(y)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ne.value ? (u(), d("div", bt, [
        l(U) ? (u(), d("div", kt, [
          g(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, x(l(U)), 1)
        ])) : l(o).length ? (u(), d("div", yt, [
          (u(!0), d(Y, null, te(l(o), ($) => (u(), d("button", {
            key: $.id,
            class: "kc-search-hit",
            onMousedown: ke((ae) => H($), ["prevent"])
          }, [
            r("span", wt, [
              l(pe)($) ? (u(), d("span", $t, [
                g(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(l(pe)($)), 1)
              ])) : A("", !0),
              r("span", xt, x($.node_type || "result"), 1),
              $.similarity != null ? (u(), d("span", St, x(l(xe)($.similarity)), 1)) : A("", !0)
            ]),
            r("span", Ct, x(l($e)($.content, 160)), 1)
          ], 40, gt))), 128))
        ])) : l(b) && !l(_) ? (u(), d("div", Et, [
          g(l(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = r("span", null, "No passages matched.", -1))
        ])) : l(_) ? (u(), d("div", Tt, [
          g(l(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          k[10] || (k[10] = r("span", null, "Searching…", -1))
        ])) : A("", !0)
      ])) : A("", !0)
    ], 32)) : (u(), d("div", Mt, [
      r("div", At, [
        e.ask ? (u(), d("div", It, [
          r("button", {
            class: z(["kc-search-mode", { on: E.value === "search" }]),
            onClick: k[4] || (k[4] = ($) => ee("search"))
          }, [
            g(l(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            k[11] || (k[11] = B(" Search ", -1))
          ], 2),
          r("button", {
            class: z(["kc-search-mode", { on: E.value === "ask" }]),
            onClick: k[5] || (k[5] = ($) => ee("ask"))
          }, [
            g(l(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            k[12] || (k[12] = B(" Ask ", -1))
          ], 2)
        ])) : A("", !0),
        r("div", Ot, [
          g(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": k[6] || (k[6] = ($) => Se(n) ? n.value = $ : null),
            placeholder: F.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Z
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        g(he, {
          icon: P.value,
          label: F.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(_),
          disabled: !l(n).trim() || l(_),
          onClick: Z
        }, null, 8, ["icon", "label", "active", "disabled"]),
        g(he, {
          icon: "tabler:x",
          label: "Close search",
          onClick: k[7] || (k[7] = ($) => a("close"))
        })
      ]),
      t.ask ? A("", !0) : (u(), d("p", Lt, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(U) ? (u(), d("div", Ut, [
        g(l(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, x(l(U)), 1)
      ])) : A("", !0),
      l(_) ? (u(), d("div", Ft, [
        (u(), d(Y, null, te(3, ($) => r("div", {
          key: $,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(o).length ? (u(), d(Y, { key: 3 }, [
        F.value ? (u(), d("div", Nt, [
          r("div", Dt, [
            g(l(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            B(" " + x(l(p) ? "Answer" : "Best match") + ' for "' + x(D.value) + '"', 1)
          ]),
          r("p", Bt, x(l(p) || l($e)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (u(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: k[8] || (k[8] = ($) => H(W.value))
          }, [
            g(l(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            k[13] || (k[13] = B(" Open source document ", -1)),
            W.value?.similarity != null ? (u(), d("span", Pt, x(l(xe)(W.value?.similarity)), 1)) : A("", !0)
          ])) : A("", !0)
        ])) : A("", !0),
        r("div", Rt, [
          F.value && V.value.length ? (u(), d("div", zt, "Sources")) : A("", !0),
          (u(!0), d(Y, null, te(V.value, ($) => (u(), d("button", {
            key: $.id,
            class: z(["kc-search-result", { link: !!$.parent_id }]),
            onClick: (ae) => H($)
          }, [
            r("div", qt, [
              l(pe)($) ? (u(), d("span", jt, [
                g(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                B(x(l(pe)($)), 1)
              ])) : A("", !0),
              r("span", Kt, x($.node_type || "passage"), 1),
              $.llm_score != null ? (u(), d("span", Gt, "LLM " + x(Math.round($.llm_score)), 1)) : A("", !0),
              $.similarity != null ? (u(), d("span", Wt, x(l(xe)($.similarity)), 1)) : A("", !0)
            ]),
            r("p", Ht, x(l($e)($.content, 360)), 1),
            $.parent_id ? (u(), d("span", Xt, [
              g(l(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              k[14] || (k[14] = B(" Open document", -1))
            ])) : A("", !0)
          ], 10, Vt))), 128))
        ])
      ], 64)) : l(b) ? (u(), d("div", Jt, [
        g(l(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        k[15] || (k[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        k[16] || (k[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (u(), d("div", Qt, [
        g(l(C), {
          icon: F.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Yt, x(F.value ? "Ask your knowledge base" : "Search your knowledge base"), 1),
        k[17] || (k[17] = r("div", { class: "kc-search-zero-s" }, "Two-stage vector + LLM retrieval across every indexed passage.", -1))
      ]))
    ]));
  }
}), Zt = ["aria-label"], en = { class: "kc-orig-h" }, tn = { class: "kc-orig-title" }, nn = { class: "kc-orig-title-t" }, on = { class: "kc-orig-b" }, sn = ["content-type", "source-url", "filename"], To = /* @__PURE__ */ G({
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
    const t = e, a = s, n = O(null);
    function o() {
      if (t.contained) return;
      const c = n.value;
      c && c.requestFullscreen && !document.fullscreenElement && c.requestFullscreen().catch(() => {
      });
    }
    function p() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function _(c) {
      c.key === "Escape" && a("close");
    }
    function U() {
      t.open && !document.fullscreenElement && a("close");
    }
    ue(() => t.open, (c) => {
      c ? (window.addEventListener("keydown", _), Ve(o)) : (window.removeEventListener("keydown", _), p());
    });
    const b = O(""), m = O("");
    async function I() {
      if (b.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: c } = await J.get(t.sourceUrl);
          c?.success && typeof c.url == "string" && (b.value = c.url, m.value = typeof c.content_type == "string" ? c.content_type : "");
        } catch {
        }
    }
    return ue(() => [t.open, t.sourceUrl], I, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", U);
    }), be(() => {
      document.removeEventListener("fullscreenchange", U), window.removeEventListener("keydown", _), p();
    }), (c, y) => (u(), _e(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (u(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: z(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: y[1] || (y[1] = ke((E) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", en, [
              r("span", tn, [
                g(l(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", nn, x(e.title), 1)
              ]),
              g(he, {
                icon: "tabler:x",
                label: "Close",
                onClick: y[0] || (y[0] = (E) => a("close"))
              })
            ]),
            r("div", on, [
              b.value ? (u(), d("wc-resource-view", {
                key: b.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": b.value,
                filename: e.filename
              }, null, 8, sn)) : A("", !0)
            ])
          ], 8, Zt)
        ], 2)) : A("", !0)
      ]),
      _: 1
    }));
  }
}), Mo = /* @__PURE__ */ G({
  __name: "ViewOriginalButton",
  props: {
    label: {}
  },
  emits: ["open"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("button", {
      type: "button",
      class: "kc-btn kc-btn-ghost sm",
      onClick: n[0] || (n[0] = (o) => t("open"))
    }, [
      g(l(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, x(e.label || "View original"), 1)
    ]));
  }
}), an = { class: "kc-docsum" }, ln = { class: "kc-docsum-h" }, Ao = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const s = e, t = O(!1), a = j(() => s.collapsible === !0 && s.text.length > 320);
    return (n, o) => (u(), d("section", an, [
      r("div", ln, [
        g(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        B(" " + x(e.label), 1)
      ]),
      r("p", {
        class: z(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, x(e.text), 3),
      a.value ? (u(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: o[0] || (o[0] = (p) => t.value = !t.value)
      }, x(t.value ? "Show less" : "Show more"), 1)) : A("", !0)
    ]));
  }
}), rn = { class: "es" }, cn = { class: "es-t" }, un = {
  key: 0,
  class: "es-s"
}, Io = /* @__PURE__ */ G({
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
    return (a, n) => (u(), d("div", rn, [
      r("div", {
        class: z(["es-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        g(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", cn, x(e.title), 1),
      e.hint ? (u(), d("div", un, x(e.hint), 1)) : A("", !0),
      e.cta ? (u(), d("button", {
        key: 1,
        class: "es-cta",
        onClick: n[0] || (n[0] = (o) => t("cta"))
      }, [
        e.ctaIcon ? (u(), _e(l(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        B(" " + x(e.cta), 1)
      ])) : A("", !0)
    ]));
  }
}), Ue = /* @__PURE__ */ new Set([
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
  ...Array.from(Ue),
  ...Array.from(Fe)
].map((e) => `.${e}`), pn = [
  ...dn,
  "text/*",
  ...Array.from(De),
  ...Array.from(Ne)
].join(","), fn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function mn(e) {
  const s = String(e || "").toLowerCase().split("/").pop() || "", t = s.lastIndexOf(".");
  return t >= 0 ? s.slice(t + 1) : "";
}
function vn(e) {
  const s = String(e.type || "").toLowerCase();
  if (s.startsWith("text/") || Ne.has(s) || De.has(s)) return !0;
  const t = mn(e.name);
  return Ue.has(t) || Fe.has(t);
}
const re = ["uploading", "processing"];
function hn(e, s) {
  const t = O([]), a = O(!1), n = O(""), o = O("");
  let p = 0;
  const _ = (i) => `${i}${++p}`, U = j(() => a.value || t.value.some((i) => re.includes(i.status)));
  function b() {
    n.value = "", o.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => re.includes(i.status));
  }
  function I(i) {
    t.value = t.value.filter((f) => f.key !== i);
  }
  function c(i, f) {
    t.value = t.value.map((h) => h.key === i ? { ...h, ...f } : h);
  }
  const y = [];
  function E() {
    for (const i of y.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) y.push(setTimeout(() => s(), i));
  }
  function w() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", s(), E();
  }
  function D(i) {
    const f = t.value.find((h) => h.key === i);
    !f || f.status === "done" || (c(i, { status: "done" }), w());
  }
  function F(i, f) {
    t.value = [...t.value, { key: _("q"), name: i, uuid: f, status: "done" }], w();
  }
  const P = /* @__PURE__ */ new Map(), W = [];
  function V(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function ne(i) {
    const f = V(i) ? i : {};
    return String(f.topic || "");
  }
  function Z(i) {
    const f = V(i) ? i : {}, h = [
      f,
      V(f.data) ? f.data : null,
      V(f.payload) ? f.payload : null,
      V(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const M of h)
      if (M.event === "kickside.uploads.events:upload.status.changed") return M;
    return {};
  }
  function oe(i, f, h) {
    const M = t.value.find((L) => L.uuid === i && re.includes(L.status));
    if (!M) return;
    const N = String(f || "");
    N === "error" || N === "failed" ? c(M.key, { status: "error", error: String(h || "File processing failed") }) : N === "completed" ? D(M.key) : ["pending", "uploaded", "queued", "processing"].includes(N) && c(M.key, { status: "processing" });
  }
  function ee(i) {
    const f = Z(i), h = String(f.upload_id || f.uuid || "");
    h && oe(h, f.status, f.error);
  }
  function H(i, f) {
    const h = i || `upload:${f}`;
    if (!h || P.has(h)) return;
    const M = Oe("@message", (N) => {
      const L = ne(N);
      i && L && L !== i || ee(N);
    });
    typeof M == "function" && P.set(h, M);
  }
  function q(i) {
    const f = String(i || "");
    return f ? `component.${f}.events` : "";
  }
  async function k(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && re.includes(f.status))))
      try {
        const { data: f } = await J.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = V(f?.upload) ? f.upload : V(f) ? f : {};
        oe(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function $(i) {
    k(i);
    for (const f of [1500, 5e3, 15e3])
      W.push(setTimeout(() => {
        k(i);
      }, f));
  }
  function ae(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const h = String(f.last_error || "Embedding failed");
      for (const M of t.value) re.includes(M.status) && c(M.key, { status: "error", error: h });
      o.value = h;
    }
  }
  let Q = null, le = 0;
  function ye(i) {
    const f = ++le;
    if (Q && (Q(), Q = null), !i) return;
    const h = ot(i, ae);
    if (f !== le) {
      h && h();
      return;
    }
    Q = h;
  }
  ue(() => e(), (i) => {
    ye(i);
  }, { immediate: !0 }), be(() => {
    for (const i of y.splice(0)) clearTimeout(i);
    for (const i of W.splice(0)) clearTimeout(i);
    le++, Q && Q();
    for (const i of P.values()) i();
    P.clear();
  });
  async function T(i, f, h) {
    try {
      const { data: M } = await J.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!M?.success || !M.upload_token) {
        c(i, { status: "error", error: M?.error || "Could not get an upload token" });
        return;
      }
      const N = new FormData();
      N.append("file", f), N.append("upload_token", M.upload_token);
      const { data: L } = await J.post("/api/v1/uploads", N, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (L?.success && L.uuid) {
        const K = String(L.uuid);
        c(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), H(q(L.component_id), K), $(K);
      } else
        c(i, { status: "error", error: L?.error || "Upload failed" });
    } catch (M) {
      c(i, { status: "error", error: M?.response?.data?.error || M?.message || "Upload error" }), ce.handleError(M?.response?.status === 401 ? "auth-expired" : "other", M);
    }
  }
  function v(i) {
    const f = e();
    if (f) {
      b();
      for (const h of Array.from(i)) {
        if (!vn(h)) {
          o.value = fn;
          continue;
        }
        const M = _("f");
        t.value = [...t.value, { key: M, name: h.name, status: "uploading" }], T(M, h, f);
      }
    }
  }
  function S(i) {
    v([i]);
  }
  async function ge(i = 100, f = 0) {
    const { data: h } = await J.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), N = (Array.isArray(h?.uploads) ? h.uploads : []).map((L) => ({
      uuid: String(L.uuid),
      filename: String(L.filename || L.meta && L.meta.filename || L.uuid),
      mime_type: L.mime_type,
      size: L.size,
      status: L.status,
      created_at: L.created_at
    }));
    return { uploads: N, total: Number(h?.meta?.total ?? N.length) };
  }
  async function Be(i) {
    const f = e();
    if (!(!f || !i.length)) {
      b(), a.value = !0;
      try {
        const { data: h } = await J.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), M = Array.isArray(h?.results) ? h.results : [], N = (K) => i.find((Re) => Re.uuid === K)?.name || K;
        let L = !1;
        for (const K of M)
          K?.success && (L = !0, F(N(String(K.upload_id)), String(K.upload_id)));
        L || (o.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        o.value = h?.response?.data?.error || h?.message || "Ingest error", ce.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Pe(i, f, h) {
    const M = e();
    if (!(!i.trim() || !M)) {
      b(), a.value = !0;
      try {
        const N = f.trim() ? { title: f.trim() } : void 0, { data: L } = await J.post(`/api/v1/knowledge/${M}/ingest`, { content: i, content_type: h, metadata: N });
        L?.success ? F(f.trim() || "Pasted text") : o.value = L?.error || "Ingestion failed";
      } catch (N) {
        o.value = N?.response?.data?.error || N?.message || "Ingestion error", ce.handleError(N?.response?.status === 401 ? "auth-expired" : "other", N);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: U,
    okMsg: j(() => n.value),
    errMsg: j(() => o.value),
    reset: b,
    clearItems: m,
    removeItem: I,
    uploadFile: S,
    uploadFiles: v,
    listMyUploads: ge,
    ingestExistingUploads: Be,
    ingestText: Pe
  };
}
const _n = { class: "ap" }, bn = {
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
}, An = ["onClick"], In = { class: "ap-upload-main" }, On = { class: "ap-upload-name" }, Ln = { class: "ap-upload-meta" }, Un = {
  key: 0,
  class: "mono"
}, Fn = { key: 1 }, Nn = {
  key: 3,
  class: "ap-pane"
}, Dn = { class: "ap-form" }, Bn = { class: "ap-grid2" }, Pn = { class: "ap-field" }, Rn = ["placeholder"], zn = { class: "ap-field" }, Vn = { class: "ap-field" }, qn = { class: "ap-label-row" }, jn = {
  key: 0,
  class: "ap-count"
}, Kn = ["placeholder"], Gn = { class: "ap-actions" }, Wn = { class: "ap-hint" }, Hn = ["disabled"], Xn = {
  key: 4,
  class: "ap-items"
}, Jn = { class: "ap-items-h" }, Qn = { class: "ap-items-list" }, Yn = { class: "ap-item-name" }, Zn = { class: "ap-item-status" }, Oo = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: s }) {
    const t = e, a = s, n = hn(() => t.kbId, () => a("changed")), o = O("file"), p = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], _ = j(() => t.noun || "content");
    function U(T) {
      n.reset(), o.value = T, T === "uploads" && ne();
    }
    const b = O(null), m = O(!1);
    function I() {
      b.value?.click();
    }
    function c(T) {
      const v = T.target.files;
      v?.length && n.uploadFiles(v), b.value && (b.value.value = "");
    }
    function y(T) {
      T.preventDefault(), m.value = !1;
      const v = T.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const E = O([]), w = O(!1), D = O(""), F = O(""), P = O({}), W = j(() => {
      const T = F.value.trim().toLowerCase();
      return T ? E.value.filter((v) => v.filename.toLowerCase().includes(T)) : E.value;
    }), V = j(() => Object.values(P.value).filter(Boolean).length);
    async function ne() {
      w.value = !0, D.value = "";
      try {
        const { uploads: T } = await n.listMyUploads(200, 0);
        E.value = T;
      } catch (T) {
        D.value = T?.message || "Could not load your uploads";
      } finally {
        w.value = !1;
      }
    }
    function Z(T) {
      P.value = { ...P.value, [T]: !P.value[T] };
    }
    async function oe() {
      const T = E.value.filter((v) => P.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      T.length && (await n.ingestExistingUploads(T), n.errMsg.value || (P.value = {}));
    }
    function ee(T) {
      return !T || T <= 0 ? "" : T < 1024 ? `${T} B` : T < 1024 * 1024 ? `${(T / 1024).toFixed(0)} KB` : `${(T / 1024 / 1024).toFixed(1)} MB`;
    }
    const H = O(""), q = O(""), k = O("text/plain"), $ = j(() => q.value.length);
    async function ae() {
      q.value.trim() && (await n.ingestText(q.value, H.value, k.value), n.errMsg.value || (q.value = "", H.value = ""));
    }
    const Q = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function le(T) {
      return T === "done" ? "tabler:circle-check" : T === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ye = j(() => n.items.value.length > 0);
    return Ie(() => {
      o.value === "uploads" && ne();
    }), ue(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (T, v) => (u(), d("div", _n, [
      r("div", bn, [
        (u(), d(Y, null, te(p, (S) => r("button", {
          key: S.id,
          class: z(["ap-mode", { on: o.value === S.id }]),
          role: "tab",
          "aria-selected": o.value === S.id,
          onClick: (ge) => U(S.id)
        }, [
          g(l(C), {
            icon: S.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, x(S.label), 1)
        ], 10, kn)), 64))
      ]),
      l(n).errMsg.value ? (u(), d("div", yn, [
        g(l(C), { icon: "tabler:alert-circle" }),
        B(x(l(n).errMsg.value), 1)
      ])) : A("", !0),
      o.value === "file" ? (u(), d("section", gn, [
        r("input", {
          ref_key: "fileInput",
          ref: b,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(pn),
          onChange: c
        }, null, 40, wn),
        r("button", {
          type: "button",
          class: z(["ap-drop", { over: m.value }]),
          onClick: I,
          onDragover: v[0] || (v[0] = ke((S) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = (S) => m.value = !1),
          onDrop: y
        }, [
          g(l(C), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : o.value === "uploads" ? (u(), d("section", $n, [
        r("div", xn, [
          de(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = (S) => F.value = S),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [we, F.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !V.value || l(n).busy.value,
            onClick: oe
          }, [
            g(l(C), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: z(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + x(V.value ? `Add ${V.value} selected` : "Add selected"), 1)
          ], 8, Sn)
        ]),
        w.value ? (u(), d("div", Cn, [
          g(l(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = B(" Loading your uploads…", -1))
        ])) : D.value ? (u(), d("div", En, [
          g(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          B(" " + x(D.value), 1)
        ])) : W.value.length ? (u(), d("ul", Mn, [
          (u(!0), d(Y, null, te(W.value, (S) => (u(), d("li", {
            key: S.uuid,
            class: z(["ap-upload", { on: P.value[S.uuid] }]),
            onClick: (ge) => Z(S.uuid)
          }, [
            g(l(C), {
              class: "ap-upload-check",
              icon: P.value[S.uuid] ? "tabler:square-check" : "tabler:square",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            g(l(C), {
              class: "ap-upload-ico",
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            r("span", In, [
              r("span", On, x(S.filename), 1),
              r("span", Ln, [
                S.mime_type ? (u(), d("span", Un, x(S.mime_type), 1)) : A("", !0),
                ee(S.size) ? (u(), d("span", Fn, x(ee(S.size)), 1)) : A("", !0)
              ])
            ])
          ], 10, An))), 128))
        ])) : (u(), d("div", Tn, [
          g(l(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = B(" No uploads found.", -1))
        ]))
      ])) : (u(), d("section", Nn, [
        r("div", Dn, [
          r("div", Bn, [
            r("div", Pn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                B("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              de(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = (S) => H.value = S),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${_.value} a title`,
                autocomplete: "off"
              }, null, 8, Rn), [
                [we, H.value]
              ])
            ]),
            r("div", zn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              de(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = (S) => k.value = S),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [qe, k.value]
              ])
            ])
          ]),
          r("div", Vn, [
            r("div", qn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              $.value ? (u(), d("span", jn, x($.value.toLocaleString()) + " chars", 1)) : A("", !0)
            ]),
            de(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = (S) => q.value = S),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${_.value} to add to this knowledge base…`
            }, null, 8, Kn), [
              [we, q.value]
            ])
          ]),
          r("div", Gn, [
            r("span", Wn, [
              g(l(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = B(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !q.value.trim() || l(n).busy.value,
              onClick: ae
            }, [
              g(l(C), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: z(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              B(" " + x(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Hn)
          ])
        ])
      ])),
      ye.value ? (u(), d("div", Xn, [
        r("div", Jn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? A("", !0) : (u(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = (S) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Qn, [
          (u(!0), d(Y, null, te(l(n).items.value, (S) => (u(), d("li", {
            key: S.key,
            class: z(["ap-item", S.status])
          }, [
            g(l(C), {
              class: z(["ap-item-ic", ["uploading", "processing", "embedding"].includes(S.status) && "spin"]),
              icon: le(S.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Yn, x(S.name), 1),
            r("span", Zn, x(S.error || Q[S.status]), 1)
          ], 2))), 128))
        ])
      ])) : A("", !0)
    ]));
  }
}), eo = { props: { type: "object", properties: { config: { type: "object", description: "KB detail context: { kb_id: string }", default: {} } } } }, Lo = {
  wippy: eo
};
export {
  uo as A,
  po as B,
  Qe as C,
  fo as D,
  io as E,
  mo as F,
  $e as G,
  Ge as H,
  _o as I,
  co as J,
  se as N,
  he as _,
  je as a,
  go as b,
  ao as c,
  Mo as d,
  xo as e,
  Ao as f,
  To as g,
  So as h,
  lo as i,
  $o as j,
  Eo as k,
  Io as l,
  Te as m,
  so as n,
  Co as o,
  Oo as p,
  Lo as q,
  Ze as r,
  ot as s,
  bo as t,
  wo as u,
  ko as v,
  ro as w,
  ho as x,
  yo as y,
  vo as z
};
//# sourceMappingURL=package-C_BpCnAM.js.map
