import { defineComponent as G, openBlock as u, createElementBlock as d, createElementVNode as r, renderSlot as me, normalizeClass as z, createVNode as g, unref as l, withKeys as Re, createCommentVNode as A, Fragment as Y, renderList as te, createBlock as he, createTextVNode as P, toDisplayString as S, watch as ce, onBeforeUnmount as _e, Transition as Me, withCtx as Ae, withModifiers as be, ref as O, computed as j, isRef as Se, nextTick as ze, onMounted as Ie, withDirectives as ue, vModelText as xe, vModelSelect as Ve } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as Oe, api as Q, host as re } from "@wippy-fe/proxy";
function Le(e, s = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || s;
}
function oo(e) {
  return Le(e.metadata, e.id);
}
function de(e) {
  return Le(e.metadata, "");
}
function J(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function R(e) {
  return typeof e == "string" ? e.trim() : "";
}
function qe(e) {
  const s = J(e.metadata), t = J(s.source_ref);
  let a = R(t.external_id) || R(s.external_id);
  const n = R(t.external_version) || R(s.external_version);
  let o = R(t.upload_id) || R(s.upload_id), p = R(t.source_url) || R(t.url) || R(s.source_url);
  const _ = R(t.reference_component_id) || R(t.component_id) || R(s.reference_component_id), L = Object.keys(J(t.reference_context)).length ? J(t.reference_context) : Object.keys(J(t.context)).length ? J(t.context) : J(s.reference_context);
  if (!o && a.startsWith("upload:") && (o = a.slice(7)), !p && a.startsWith("url:") && (p = a.slice(4)), !a && o && (a = `upload:${o}`), !a && p && (a = `url:${p}`), !a) return null;
  const b = { ...t };
  delete b.thread_id, delete b.thread_event_id, delete b.thread_event_seq, _ && !R(b.reference_component_id) && (b.reference_component_id = _), Object.keys(L).length && Object.keys(J(b.reference_context)).length === 0 && (b.reference_context = L), a && Object.keys(b).length && !R(b.external_id) && (b.external_id = a);
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
function so(e) {
  const s = qe(e), t = s ? R(s.external_id) : "";
  if (!t) return null;
  const a = J(e.metadata), n = J(a.source_ref);
  return `${R(n.external_source) || R(a.external_source)}\0${t}`;
}
function we(e, s) {
  return e ? e.length > s ? e.slice(0, s).trimEnd() + "…" : e : "";
}
const je = /engine .*not installed|no .*engine|unavailable/i;
function ao(e) {
  return je.test(e || "");
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
  const s = (e.concept_type || "").toLowerCase();
  return se[s] || se.topic;
}
const Ke = {
  subtopic_of: "subtopic",
  categorized_as: "in"
}, pe = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function Ge(e) {
  return e < pe.length ? pe[e] : Math.round((pe[0] + (e - pe.length + 1) * 137.508) % 360);
}
function fe(e, s, t) {
  return `hsl(${e} ${s}% ${t}%)`;
}
const Ce = 34, Ee = 88, We = 78, He = 38;
function ro(e, s) {
  const t = new Map(e.map((c) => [c.id, c])), a = /* @__PURE__ */ new Map();
  for (const c of s)
    c.edge_type !== "subtopic_of" && c.edge_type !== "categorized_as" || t.has(c.from_node_id) && t.has(c.to_node_id) && a.set(c.from_node_id, c.to_node_id);
  const n = (c) => !!t.get(c)?.is_root;
  function o(c) {
    const y = /* @__PURE__ */ new Set();
    let E = c, x = 0;
    for (; !y.has(E); ) {
      y.add(E);
      const D = a.get(E);
      if (D === void 0 || n(D)) return { branch: E, depth: x };
      E = D, x++;
    }
    return { branch: E, depth: x };
  }
  const p = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
  for (const c of e) {
    if (c.is_root) continue;
    const y = o(c.id);
    p.set(c.id, y), _.set(y.branch, Math.max(_.get(y.branch) ?? 0, y.depth));
  }
  const L = [...new Set([...p.values()].map((c) => c.branch))].sort((c, y) => (t.get(c)?.label || "").localeCompare(t.get(y)?.label || "")), b = /* @__PURE__ */ new Map();
  L.forEach((c, y) => b.set(c, Ge(y)));
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
    const E = b.get(y.branch) ?? 220, x = Math.min(Math.max(_.get(y.branch) ?? 0, 1), 4), D = Math.min(1, y.depth / x);
    if (c.node_type === "document") {
      const U = Math.min(84, m(Ce, Ee, D) + 6);
      I.set(c.id, { fill: fe(E, 32, U), stroke: fe(E, 32, Math.max(50, U - 14)) });
    } else {
      const U = m(Ce, Ee, D), B = m(We, He, D);
      I.set(c.id, { fill: fe(E, B, U), stroke: fe(E, B, Math.max(28, U - 17)) });
    }
  }
  return I;
}
const Xe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function co(e, s) {
  const t = /* @__PURE__ */ new Map();
  for (const m of e) t.set(m.id, m);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const m of s) {
    if (!Xe.has(m.edge_type || "") || !t.has(m.from_node_id) || !t.has(m.to_node_id)) continue;
    const I = a.get(m.to_node_id) || [];
    I.push(m.from_node_id), a.set(m.to_node_id, I), n.add(m.from_node_id);
  }
  const o = (m, I) => (t.get(m)?.label || "").localeCompare(t.get(I)?.label || "");
  function p(m, I, c) {
    const y = t.get(m);
    if (!y || c.has(m)) return null;
    c.add(m);
    const E = (a.get(m) || []).slice().sort(o), x = [];
    for (const D of E) {
      const U = p(D, I + 1, c);
      U && x.push(U);
    }
    return { concept: y, children: x, depth: I };
  }
  const _ = e.filter((m) => m.is_root || !n.has(m.id)).map((m) => m.id).sort(o), L = /* @__PURE__ */ new Set(), b = [];
  for (const m of _) {
    const I = p(m, 0, L);
    I && b.push(I);
  }
  for (const m of e)
    if (!L.has(m.id)) {
      const I = p(m.id, 0, L);
      I && b.push(I);
    }
  return b;
}
function uo(e) {
  const s = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, o) => {
    s.set(n.concept.id, n), o && t.set(n.concept.id, o);
    for (const p of n.children) a(p, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: s, parentOf: t };
}
function po(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, a) => t.isFolder !== a.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(a.concept.label || a.concept.id)) : [];
}
function Je(e, s, t) {
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
function fo(e, s, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const o of s.values()) {
    if (!(o.concept.label || o.concept.id).toLowerCase().includes(a)) continue;
    const _ = Je(o.concept.id, s, t);
    n.push({ concept: o.concept, isFolder: o.children.length > 0, path: _.slice(0, -1) });
  }
  return n.sort((o, p) => o.isFolder !== p.isFolder ? o.isFolder ? -1 : 1 : (o.concept.label || o.concept.id).localeCompare(p.concept.label || p.concept.id)).slice(0, 200);
}
function mo(e) {
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
function vo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Qe[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function Ye(e, s) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !a.has(n.from_node_id) && (a.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function ho(e, s) {
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of s)
    n.edge_type === "categorized_as" && n.from_node_id === e && !a.has(n.to_node_id) && (a.add(n.to_node_id), t.push({ id: n.to_node_id, label: n.to_label || "" }));
  return t;
}
function _o(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set();
  for (const o of s) {
    if (o.edge_type !== "subtopic_of" || o.to_node_id !== e.id || n.has(o.from_node_id)) continue;
    const p = t.get(o.from_node_id);
    p && (n.add(o.from_node_id), a.push(p));
  }
  return a.sort((o, p) => (o.label || "").localeCompare(p.label || ""));
}
function bo(e, s, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), o = new Set(Ye(e, s));
  for (const p of s) {
    if (p.edge_type === "subtopic_of" || p.edge_type === "categorized_as") continue;
    let _ = "";
    if (p.from_node_id === e.id) _ = p.to_node_id;
    else if (p.to_node_id === e.id) _ = p.from_node_id;
    else continue;
    if (!_ || n.has(_) || o.has(_)) continue;
    const L = t.get(_);
    L && (n.add(_), a.push({ concept: L, label: Ke[p.edge_type || ""] || p.edge_type || "related" }));
  }
  return a;
}
function ko(e, s) {
  let t = 0;
  for (const a of s)
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
function yo(e) {
  const s = (e || "").toLowerCase();
  return Ze.some((t) => s.startsWith(t)) || et.has(s);
}
function go(e) {
  const s = e || {}, t = s.source_ref && typeof s.source_ref == "object" ? s.source_ref : {}, a = t.upload_id || s.upload_id;
  if (typeof a == "string" && a.trim()) return a.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof s.external_id == "string" && s.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function le(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function tt(e, s) {
  if (!s) return null;
  const t = le(e) ? e : {}, a = [
    t,
    le(t.data) ? t.data : null,
    le(t.payload) ? t.payload : null,
    le(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
    if (n.event !== "component.meta.changed") continue;
    const o = String(n.component_id || ""), p = String(t.topic || n.topic || "");
    if (!(o && o !== s) && !(!o && p !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: o || s,
        meta: le(n.meta) ? n.meta : {},
        deleted: Array.isArray(n.deleted) ? n.deleted.map(String) : []
      };
  }
  return null;
}
function nt(e, s) {
  if (!e) return null;
  const t = Oe(`component.${e}`, (a) => {
    const n = tt(a, e);
    n && s(n);
  });
  return typeof t == "function" ? t : null;
}
const ot = { class: "kx-shell" }, st = { class: "kx-rail" }, at = { class: "kx-main" }, xo = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (s, t) => (u(), d("div", ot, [
      r("aside", st, [
        me(s.$slots, "rail")
      ]),
      r("main", at, [
        me(s.$slots, "default")
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("button", {
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
      onClick: n[0] || (n[0] = (o) => t("click"))
    }, [
      g(l(C), {
        icon: e.icon,
        class: z(e.spin && "spin"),
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("div", it, [
      g(l(C), {
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
        onKeyup: n[1] || (n[1] = Re((o) => t("enter"), ["enter"]))
      }, null, 40, rt),
      e.modelValue ? (u(), d("button", {
        key: 0,
        class: "kx-search-clear",
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
}), ct = {
  class: "tb",
  role: "tablist"
}, ut = ["aria-selected", "onClick"], dt = {
  key: 1,
  class: "kx-count"
}, wo = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("div", ct, [
      (u(!0), d(Y, null, te(e.tabs, (o) => (u(), d("button", {
        key: o.id,
        class: z(["tb-tab", { on: e.active === o.id }]),
        role: "tab",
        "aria-selected": e.active === o.id,
        onClick: (p) => t("select", o.id)
      }, [
        o.icon ? (u(), he(l(C), {
          key: 0,
          icon: o.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        P(" " + S(o.label) + " ", 1),
        o.count !== void 0 ? (u(), d("span", dt, S(o.count), 1)) : A("", !0)
      ], 10, ut))), 128))
    ]));
  }
}), $o = /* @__PURE__ */ G({
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
      class: z(["kx-notice", e.tone])
    }, [
      g(l(C), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        me(a.$slots, "default")
      ])
    ], 2));
  }
}), pt = ["aria-label"], ft = { class: "kx-drawer-h" }, mt = { class: "kx-drawer-title" }, vt = { class: "kx-drawer-b" }, So = /* @__PURE__ */ G({
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
    return ce(() => t.open, (o) => {
      o ? window.addEventListener("keydown", n) : window.removeEventListener("keydown", n);
    }), _e(() => window.removeEventListener("keydown", n)), (o, p) => (u(), he(Me, { name: "kx-drawer" }, {
      default: Ae(() => [
        e.open ? (u(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: p[1] || (p[1] = be((_) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", ft, [
              r("span", mt, [
                g(l(C), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(S(e.title), 1)
              ]),
              g(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: p[0] || (p[0] = (_) => a("close"))
              })
            ]),
            r("div", vt, [
              me(o.$slots, "default")
            ])
          ], 8, pt)
        ])) : A("", !0)
      ]),
      _: 3
    }));
  }
});
function ht(e) {
  const s = O(""), t = O([]), a = O(""), n = O(!1), o = O(""), p = O(!1);
  let _ = null;
  function L() {
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
      const { data: x } = await Q.get(`/api/v1/kb10/${y}/search?q=${encodeURIComponent(E)}&limit=${c}`);
      x?.success ? (t.value = x.results || [], a.value = "") : o.value = x?.error || "search failed";
    } catch (x) {
      o.value = x?.response?.data?.error || x?.message || "search error", re.handleError(x?.response?.status === 401 ? "auth-expired" : "other", x);
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
      const { data: x } = await Q.post(`/api/v1/knowledge/${y}/ask`, { query: E, limit: c });
      x?.success ? (t.value = x.results || [], a.value = String(x.answer || "")) : o.value = x?.error || "ask failed";
    } catch (x) {
      o.value = x?.response?.data?.error || x?.message || "ask error", re.handleError(x?.response?.status === 401 ? "auth-expired" : "other", x);
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
  return _e(() => {
    _ && clearTimeout(_);
  }), { query: s, results: t, answer: a, loading: n, error: o, performed: p, run: b, ask: m, runDebounced: I, clear: L };
}
function $e(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const _t = {
  key: 0,
  class: "kc-search-pop"
}, bt = {
  key: 0,
  class: "kc-search-state err"
}, kt = {
  key: 1,
  class: "kc-search-hits"
}, yt = ["onMousedown"], gt = { class: "kc-search-hit-h" }, xt = {
  key: 0,
  class: "kc-search-r-doc"
}, wt = { class: "kc-search-hit-kind" }, $t = {
  key: 1,
  class: "kc-search-hit-score"
}, St = { class: "kc-search-hit-body" }, Ct = {
  key: 2,
  class: "kc-search-state"
}, Et = {
  key: 3,
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
}, Lt = {
  key: 1,
  class: "kc-search-err"
}, Ut = {
  key: 2,
  class: "kc-search-skel"
}, Ft = {
  key: 0,
  class: "kc-ans"
}, Nt = { class: "kc-ans-h" }, Dt = { class: "kc-ans-body" }, Bt = {
  key: 0,
  class: "kc-ans-sim"
}, Pt = { class: "kc-search-results" }, Rt = {
  key: 0,
  class: "kc-search-results-h"
}, zt = ["onClick"], Vt = { class: "kc-search-r-h" }, qt = {
  key: 0,
  class: "kc-search-r-doc"
}, jt = { class: "kc-search-hit-kind" }, Kt = {
  key: 1,
  class: "kc-search-r-llm"
}, Gt = {
  key: 2,
  class: "kc-search-hit-score"
}, Wt = { class: "kc-search-r-body" }, Ht = {
  key: 0,
  class: "kc-search-r-open"
}, Xt = {
  key: 4,
  class: "kc-search-zero"
}, Jt = {
  key: 5,
  class: "kc-search-zero"
}, Qt = { class: "kc-search-zero-t" }, Co = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, { query: n, results: o, answer: p, loading: _, error: L, performed: b, run: m, ask: I, runDebounced: c, clear: y } = ht(() => t.kbId), E = O("search"), x = O(!1), D = O(""), U = j(() => t.layout === "panel" && t.ask && E.value === "ask"), B = j(() => _.value ? "tabler:hourglass" : U.value ? "tabler:sparkles" : "tabler:arrow-right"), W = j(() => o.value[0]), q = j(() => U.value ? o.value.slice(1) : o.value), ne = j(() => t.layout === "rail" && x.value && n.value.trim() !== "" && (_.value || b.value || !!L.value));
    function Z() {
      n.value.trim() && (D.value = n.value.trim(), U.value ? I(8) : m(20));
    }
    function oe() {
      t.layout === "rail" && c(300);
    }
    function ee(V) {
      E.value = V, b.value && n.value.trim() && Z();
    }
    function H(V) {
      a("open", V), t.layout === "rail" && (y(), x.value = !1);
    }
    return (V, k) => e.layout === "rail" ? (u(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: k[2] || (k[2] = (w) => x.value = !0),
      onFocusout: k[3] || (k[3] = (w) => x.value = !1)
    }, [
      g(Te, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          k[0] || (k[0] = (w) => Se(n) ? n.value = w : null),
          oe
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: k[1] || (k[1] = (w) => l(m)(20)),
        onClear: l(y)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      ne.value ? (u(), d("div", _t, [
        l(L) ? (u(), d("div", bt, [
          g(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, S(l(L)), 1)
        ])) : l(o).length ? (u(), d("div", kt, [
          (u(!0), d(Y, null, te(l(o), (w) => (u(), d("button", {
            key: w.id,
            class: "kc-search-hit",
            onMousedown: be((X) => H(w), ["prevent"])
          }, [
            r("span", gt, [
              l(de)(w) ? (u(), d("span", xt, [
                g(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(S(l(de)(w)), 1)
              ])) : A("", !0),
              r("span", wt, S(w.node_type || "result"), 1),
              w.similarity != null ? (u(), d("span", $t, S(l($e)(w.similarity)), 1)) : A("", !0)
            ]),
            r("span", St, S(l(we)(w.content, 160)), 1)
          ], 40, yt))), 128))
        ])) : l(b) && !l(_) ? (u(), d("div", Ct, [
          g(l(C), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = r("span", null, "No passages matched.", -1))
        ])) : l(_) ? (u(), d("div", Et, [
          g(l(C), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          k[10] || (k[10] = r("span", null, "Searching…", -1))
        ])) : A("", !0)
      ])) : A("", !0)
    ], 32)) : (u(), d("div", Tt, [
      r("div", Mt, [
        e.ask ? (u(), d("div", At, [
          r("button", {
            class: z(["kc-search-mode", { on: E.value === "search" }]),
            onClick: k[4] || (k[4] = (w) => ee("search"))
          }, [
            g(l(C), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            k[11] || (k[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: z(["kc-search-mode", { on: E.value === "ask" }]),
            onClick: k[5] || (k[5] = (w) => ee("ask"))
          }, [
            g(l(C), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            k[12] || (k[12] = P(" Ask ", -1))
          ], 2)
        ])) : A("", !0),
        r("div", It, [
          g(Te, {
            modelValue: l(n),
            "onUpdate:modelValue": k[6] || (k[6] = (w) => Se(n) ? n.value = w : null),
            placeholder: U.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Z
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        g(ve, {
          icon: B.value,
          label: U.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(_),
          disabled: !l(n).trim() || l(_),
          onClick: Z
        }, null, 8, ["icon", "label", "active", "disabled"]),
        g(ve, {
          icon: "tabler:x",
          label: "Close search",
          onClick: k[7] || (k[7] = (w) => a("close"))
        })
      ]),
      t.ask ? A("", !0) : (u(), d("p", Ot, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(L) ? (u(), d("div", Lt, [
        g(l(C), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, S(l(L)), 1)
      ])) : A("", !0),
      l(_) ? (u(), d("div", Ut, [
        (u(), d(Y, null, te(3, (w) => r("div", {
          key: w,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(o).length ? (u(), d(Y, { key: 3 }, [
        U.value ? (u(), d("div", Ft, [
          r("div", Nt, [
            g(l(C), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + S(l(p) ? "Answer" : "Best match") + ' for "' + S(D.value) + '"', 1)
          ]),
          r("p", Dt, S(l(p) || l(we)(W.value?.content, 700)), 1),
          W.value?.parent_id ? (u(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: k[8] || (k[8] = (w) => H(W.value))
          }, [
            g(l(C), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            k[13] || (k[13] = P(" Open source document ", -1)),
            W.value?.similarity != null ? (u(), d("span", Bt, S(l($e)(W.value?.similarity)), 1)) : A("", !0)
          ])) : A("", !0)
        ])) : A("", !0),
        r("div", Pt, [
          U.value && q.value.length ? (u(), d("div", Rt, "Sources")) : A("", !0),
          (u(!0), d(Y, null, te(q.value, (w) => (u(), d("button", {
            key: w.id,
            class: z(["kc-search-result", { link: !!w.parent_id }]),
            onClick: (X) => H(w)
          }, [
            r("div", Vt, [
              l(de)(w) ? (u(), d("span", qt, [
                g(l(C), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(S(l(de)(w)), 1)
              ])) : A("", !0),
              r("span", jt, S(w.node_type || "passage"), 1),
              w.llm_score != null ? (u(), d("span", Kt, "LLM " + S(Math.round(w.llm_score)), 1)) : A("", !0),
              w.similarity != null ? (u(), d("span", Gt, S(l($e)(w.similarity)), 1)) : A("", !0)
            ]),
            r("p", Wt, S(l(we)(w.content, 360)), 1),
            w.parent_id ? (u(), d("span", Ht, [
              g(l(C), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              k[14] || (k[14] = P(" Open document", -1))
            ])) : A("", !0)
          ], 10, zt))), 128))
        ])
      ], 64)) : l(b) ? (u(), d("div", Xt, [
        g(l(C), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        k[15] || (k[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        k[16] || (k[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (u(), d("div", Jt, [
        g(l(C), {
          icon: U.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", Qt, S(U.value ? "Ask your knowledge base" : "Search your knowledge base"), 1),
        k[17] || (k[17] = r("div", { class: "kc-search-zero-s" }, "Two-stage vector + LLM retrieval across every indexed passage.", -1))
      ]))
    ]));
  }
}), Yt = ["aria-label"], Zt = { class: "kc-orig-h" }, en = { class: "kc-orig-title" }, tn = { class: "kc-orig-title-t" }, nn = { class: "kc-orig-b" }, on = ["content-type", "source-url", "filename"], Eo = /* @__PURE__ */ G({
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
    function L() {
      t.open && !document.fullscreenElement && a("close");
    }
    ce(() => t.open, (c) => {
      c ? (window.addEventListener("keydown", _), ze(o)) : (window.removeEventListener("keydown", _), p());
    });
    const b = O(""), m = O("");
    async function I() {
      if (b.value = "", m.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: c } = await Q.get(t.sourceUrl);
          c?.success && typeof c.url == "string" && (b.value = c.url, m.value = typeof c.content_type == "string" ? c.content_type : "");
        } catch {
        }
    }
    return ce(() => [t.open, t.sourceUrl], I, { immediate: !0 }), Ie(() => {
      t.contained || document.addEventListener("fullscreenchange", L);
    }), _e(() => {
      document.removeEventListener("fullscreenchange", L), window.removeEventListener("keydown", _), p();
    }), (c, y) => (u(), he(Me, { name: "kc-orig" }, {
      default: Ae(() => [
        e.open ? (u(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: z(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: y[1] || (y[1] = be((E) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", Zt, [
              r("span", en, [
                g(l(C), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", tn, S(e.title), 1)
              ]),
              g(ve, {
                icon: "tabler:x",
                label: "Close",
                onClick: y[0] || (y[0] = (E) => a("close"))
              })
            ]),
            r("div", nn, [
              b.value ? (u(), d("wc-resource-view", {
                key: b.value,
                class: "kc-orig-rv",
                "content-type": m.value || e.contentType,
                "source-url": b.value,
                filename: e.filename
              }, null, 8, on)) : A("", !0)
            ])
          ], 8, Yt)
        ], 2)) : A("", !0)
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (o) => t("open"))
    }, [
      g(l(C), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, S(e.label || "View original"), 1)
    ]));
  }
}), sn = { class: "kc-docsum" }, an = { class: "kc-docsum-h" }, Mo = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const s = e, t = O(!1), a = j(() => s.collapsible === !0 && s.text.length > 320);
    return (n, o) => (u(), d("section", sn, [
      r("div", an, [
        g(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + S(e.label), 1)
      ]),
      r("p", {
        class: z(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, S(e.text), 3),
      a.value ? (u(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: o[0] || (o[0] = (p) => t.value = !t.value)
      }, S(t.value ? "Show less" : "Show more"), 1)) : A("", !0)
    ]));
  }
}), ln = { class: "kx-empty kx-empty-spacious" }, rn = { class: "kx-empty-title" }, cn = {
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
  setup(e, { emit: s }) {
    const t = s;
    return (a, n) => (u(), d("div", ln, [
      r("div", {
        class: z(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        g(l(C), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", rn, S(e.title), 1),
      e.hint ? (u(), d("div", cn, S(e.hint), 1)) : A("", !0),
      e.cta ? (u(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (o) => t("cta"))
      }, [
        e.ctaIcon ? (u(), he(l(C), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        P(" " + S(e.cta), 1)
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
]), un = [
  ...Array.from(Ue),
  ...Array.from(Fe)
].map((e) => `.${e}`), dn = [
  ...un,
  "text/*",
  ...Array.from(De),
  ...Array.from(Ne)
].join(","), pn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function fn(e) {
  const s = String(e || "").toLowerCase().split("/").pop() || "", t = s.lastIndexOf(".");
  return t >= 0 ? s.slice(t + 1) : "";
}
function mn(e) {
  const s = String(e.type || "").toLowerCase();
  if (s.startsWith("text/") || Ne.has(s) || De.has(s)) return !0;
  const t = fn(e.name);
  return Ue.has(t) || Fe.has(t);
}
const ie = ["uploading", "processing"];
function vn(e, s) {
  const t = O([]), a = O(!1), n = O(""), o = O("");
  let p = 0;
  const _ = (i) => `${i}${++p}`, L = j(() => a.value || t.value.some((i) => ie.includes(i.status)));
  function b() {
    n.value = "", o.value = "";
  }
  function m() {
    t.value = t.value.filter((i) => ie.includes(i.status));
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
  function x() {
    const i = t.value.filter((f) => f.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", s(), E();
  }
  function D(i) {
    const f = t.value.find((h) => h.key === i);
    !f || f.status === "done" || (c(i, { status: "done" }), x());
  }
  function U(i, f) {
    t.value = [...t.value, { key: _("q"), name: i, uuid: f, status: "done" }], x();
  }
  const B = /* @__PURE__ */ new Map(), W = [];
  function q(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function ne(i) {
    const f = q(i) ? i : {};
    return String(f.topic || "");
  }
  function Z(i) {
    const f = q(i) ? i : {}, h = [
      f,
      q(f.data) ? f.data : null,
      q(f.payload) ? f.payload : null,
      q(f.detail) ? f.detail : null
    ].filter(Boolean);
    for (const M of h)
      if (typeof M.uuid == "string" && typeof M.status == "string") return M;
    return {};
  }
  function oe(i, f, h) {
    const M = t.value.find((F) => F.uuid === i && ie.includes(F.status));
    if (!M) return;
    const N = String(f || "");
    N === "error" || N === "failed" ? c(M.key, { status: "error", error: String(h || "File processing failed") }) : N === "completed" ? D(M.key) : ["pending", "uploaded", "queued", "processing"].includes(N) && c(M.key, { status: "processing" });
  }
  function ee(i, f) {
    const h = Z(f);
    h.uuid === i && oe(i, h.status, h.error);
  }
  function H(i) {
    const f = `upload:${i}`;
    if (B.has(f)) return;
    const h = Oe("@message", (M) => {
      ne(M) === f && ee(i, M);
    });
    typeof h == "function" && B.set(f, h);
  }
  async function V(i) {
    if (!(!i || !t.value.some((f) => f.uuid === i && ie.includes(f.status))))
      try {
        const { data: f } = await Q.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = q(f?.upload) ? f.upload : q(f) ? f : {};
        oe(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function k(i) {
    V(i);
    for (const f of [1500, 5e3, 15e3])
      W.push(setTimeout(() => {
        V(i);
      }, f));
  }
  function w(i) {
    const f = i.meta || {};
    if (String(f.status || "") === "error") {
      const h = String(f.last_error || "Embedding failed");
      for (const M of t.value) ie.includes(M.status) && c(M.key, { status: "error", error: h });
      o.value = h;
    }
  }
  let X = null, ae = 0;
  function ke(i) {
    const f = ++ae;
    if (X && (X(), X = null), !i) return;
    const h = nt(i, w);
    if (f !== ae) {
      h && h();
      return;
    }
    X = h;
  }
  ce(() => e(), (i) => {
    ke(i);
  }, { immediate: !0 }), _e(() => {
    for (const i of y.splice(0)) clearTimeout(i);
    for (const i of W.splice(0)) clearTimeout(i);
    ae++, X && X();
    for (const i of B.values()) i();
    B.clear();
  });
  async function ye(i, f, h) {
    try {
      const { data: M } = await Q.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!M?.success || !M.upload_token) {
        c(i, { status: "error", error: M?.error || "Could not get an upload token" });
        return;
      }
      const N = new FormData();
      N.append("file", f), N.append("upload_token", M.upload_token);
      const { data: F } = await Q.post("/api/v1/uploads", N, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (F?.success && F.uuid) {
        const K = String(F.uuid);
        c(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), H(K), k(K);
      } else
        c(i, { status: "error", error: F?.error || "Upload failed" });
    } catch (M) {
      c(i, { status: "error", error: M?.response?.data?.error || M?.message || "Upload error" }), re.handleError(M?.response?.status === 401 ? "auth-expired" : "other", M);
    }
  }
  function T(i) {
    const f = e();
    if (f) {
      b();
      for (const h of Array.from(i)) {
        if (!mn(h)) {
          o.value = pn;
          continue;
        }
        const M = _("f");
        t.value = [...t.value, { key: M, name: h.name, status: "uploading" }], ye(M, h, f);
      }
    }
  }
  function v(i) {
    T([i]);
  }
  async function $(i = 100, f = 0) {
    const { data: h } = await Q.get(`/api/v1/uploads/list?limit=${i}&offset=${f}`), N = (Array.isArray(h?.uploads) ? h.uploads : []).map((F) => ({
      uuid: String(F.uuid),
      filename: String(F.filename || F.meta && F.meta.filename || F.uuid),
      mime_type: F.mime_type,
      size: F.size,
      status: F.status,
      created_at: F.created_at
    }));
    return { uploads: N, total: Number(h?.meta?.total ?? N.length) };
  }
  async function ge(i) {
    const f = e();
    if (!(!f || !i.length)) {
      b(), a.value = !0;
      try {
        const { data: h } = await Q.post(`/api/v1/knowledge/${f}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), M = Array.isArray(h?.results) ? h.results : [], N = (K) => i.find((Pe) => Pe.uuid === K)?.name || K;
        let F = !1;
        for (const K of M)
          K?.success && (F = !0, U(N(String(K.upload_id)), String(K.upload_id)));
        F || (o.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        o.value = h?.response?.data?.error || h?.message || "Ingest error", re.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(i, f, h) {
    const M = e();
    if (!(!i.trim() || !M)) {
      b(), a.value = !0;
      try {
        const N = f.trim() ? { title: f.trim() } : void 0, { data: F } = await Q.post(`/api/v1/knowledge/${M}/ingest`, { content: i, content_type: h, metadata: N });
        F?.success ? U(f.trim() || "Pasted text") : o.value = F?.error || "Ingestion failed";
      } catch (N) {
        o.value = N?.response?.data?.error || N?.message || "Ingestion error", re.handleError(N?.response?.status === 401 ? "auth-expired" : "other", N);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: L,
    okMsg: j(() => n.value),
    errMsg: j(() => o.value),
    reset: b,
    clearItems: m,
    removeItem: I,
    uploadFile: v,
    uploadFiles: T,
    listMyUploads: $,
    ingestExistingUploads: ge,
    ingestText: Be
  };
}
const hn = { class: "ap" }, _n = {
  class: "ap-modes",
  role: "tablist"
}, bn = ["aria-selected", "onClick"], kn = {
  key: 0,
  class: "ap-msg err"
}, yn = {
  key: 1,
  class: "ap-pane"
}, gn = ["accept"], xn = {
  key: 2,
  class: "ap-pane"
}, wn = { class: "ap-uploads-bar" }, $n = ["disabled"], Sn = {
  key: 0,
  class: "ap-uploads-state"
}, Cn = {
  key: 1,
  class: "ap-uploads-state err"
}, En = {
  key: 2,
  class: "ap-uploads-state"
}, Tn = {
  key: 3,
  class: "ap-uploads"
}, Mn = ["aria-pressed", "onClick"], An = { class: "ap-upload-main" }, In = { class: "ap-upload-name" }, On = { class: "ap-upload-meta" }, Ln = {
  key: 0,
  class: "mono"
}, Un = { key: 1 }, Fn = {
  key: 3,
  class: "ap-pane"
}, Nn = { class: "ap-form" }, Dn = { class: "ap-grid2" }, Bn = { class: "ap-field" }, Pn = ["placeholder"], Rn = { class: "ap-field" }, zn = { class: "ap-field" }, Vn = { class: "ap-label-row" }, qn = {
  key: 0,
  class: "ap-count"
}, jn = ["placeholder"], Kn = { class: "ap-actions" }, Gn = { class: "ap-hint" }, Wn = ["disabled"], Hn = {
  key: 4,
  class: "ap-items"
}, Xn = { class: "ap-items-h" }, Jn = { class: "ap-items-list" }, Qn = { class: "ap-item-name" }, Yn = { class: "ap-item-status" }, Io = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: s }) {
    const t = e, a = s, n = vn(() => t.kbId, () => a("changed")), o = O("file"), p = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], _ = j(() => t.noun || "content");
    function L(T) {
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
    const E = O([]), x = O(!1), D = O(""), U = O(""), B = O({}), W = j(() => {
      const T = U.value.trim().toLowerCase();
      return T ? E.value.filter((v) => v.filename.toLowerCase().includes(T)) : E.value;
    }), q = j(() => Object.values(B.value).filter(Boolean).length);
    async function ne() {
      x.value = !0, D.value = "";
      try {
        const { uploads: T } = await n.listMyUploads(200, 0);
        E.value = T;
      } catch (T) {
        D.value = T?.message || "Could not load your uploads";
      } finally {
        x.value = !1;
      }
    }
    function Z(T) {
      B.value = { ...B.value, [T]: !B.value[T] };
    }
    async function oe() {
      const T = E.value.filter((v) => B.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      T.length && (await n.ingestExistingUploads(T), n.errMsg.value || (B.value = {}));
    }
    function ee(T) {
      return !T || T <= 0 ? "" : T < 1024 ? `${T} B` : T < 1024 * 1024 ? `${(T / 1024).toFixed(0)} KB` : `${(T / 1024 / 1024).toFixed(1)} MB`;
    }
    const H = O(""), V = O(""), k = O("text/plain"), w = j(() => V.value.length);
    async function X() {
      V.value.trim() && (await n.ingestText(V.value, H.value, k.value), n.errMsg.value || (V.value = "", H.value = ""));
    }
    const ae = {
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
      o.value === "uploads" && ne();
    }), ce(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (T, v) => (u(), d("div", hn, [
      r("div", _n, [
        (u(), d(Y, null, te(p, ($) => r("button", {
          key: $.id,
          class: z(["ap-mode", { on: o.value === $.id }]),
          role: "tab",
          "aria-selected": o.value === $.id,
          onClick: (ge) => L($.id)
        }, [
          g(l(C), {
            icon: $.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, S($.label), 1)
        ], 10, bn)), 64))
      ]),
      l(n).errMsg.value ? (u(), d("div", kn, [
        g(l(C), { icon: "tabler:alert-circle" }),
        P(S(l(n).errMsg.value), 1)
      ])) : A("", !0),
      o.value === "file" ? (u(), d("section", yn, [
        r("input", {
          ref_key: "fileInput",
          ref: b,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(dn),
          onChange: c
        }, null, 40, gn),
        r("button", {
          type: "button",
          class: z(["ap-drop", { over: m.value }]),
          onClick: I,
          onDragover: v[0] || (v[0] = be(($) => m.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = ($) => m.value = !1),
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
      ])) : o.value === "uploads" ? (u(), d("section", xn, [
        r("div", wn, [
          ue(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = ($) => U.value = $),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [xe, U.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !q.value || l(n).busy.value,
            onClick: oe
          }, [
            g(l(C), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: z(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + S(q.value ? `Add ${q.value} selected` : "Add selected"), 1)
          ], 8, $n)
        ]),
        x.value ? (u(), d("div", Sn, [
          g(l(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = P(" Loading your uploads…", -1))
        ])) : D.value ? (u(), d("div", Cn, [
          g(l(C), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + S(D.value), 1)
        ])) : W.value.length ? (u(), d("ul", Tn, [
          (u(!0), d(Y, null, te(W.value, ($) => (u(), d("li", {
            key: $.uuid
          }, [
            r("button", {
              type: "button",
              class: z(["ap-upload", { on: B.value[$.uuid] }]),
              "aria-pressed": !!B.value[$.uuid],
              onClick: (ge) => Z($.uuid)
            }, [
              g(l(C), {
                class: "ap-upload-check",
                icon: B.value[$.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g(l(C), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", An, [
                r("span", In, S($.filename), 1),
                r("span", On, [
                  $.mime_type ? (u(), d("span", Ln, S($.mime_type), 1)) : A("", !0),
                  ee($.size) ? (u(), d("span", Un, S(ee($.size)), 1)) : A("", !0)
                ])
              ])
            ], 10, Mn)
          ]))), 128))
        ])) : (u(), d("div", En, [
          g(l(C), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = P(" No uploads found.", -1))
        ]))
      ])) : (u(), d("section", Fn, [
        r("div", Nn, [
          r("div", Dn, [
            r("div", Bn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                P("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              ue(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = ($) => H.value = $),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${_.value} a title`,
                autocomplete: "off"
              }, null, 8, Pn), [
                [xe, H.value]
              ])
            ]),
            r("div", Rn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              ue(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = ($) => k.value = $),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [Ve, k.value]
              ])
            ])
          ]),
          r("div", zn, [
            r("div", Vn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              w.value ? (u(), d("span", qn, S(w.value.toLocaleString()) + " chars", 1)) : A("", !0)
            ]),
            ue(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = ($) => V.value = $),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${_.value} to add to this knowledge base…`
            }, null, 8, jn), [
              [xe, V.value]
            ])
          ]),
          r("div", Kn, [
            r("span", Gn, [
              g(l(C), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !V.value.trim() || l(n).busy.value,
              onClick: X
            }, [
              g(l(C), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: z(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + S(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Wn)
          ])
        ])
      ])),
      ye.value ? (u(), d("div", Hn, [
        r("div", Xn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? A("", !0) : (u(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = ($) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", Jn, [
          (u(!0), d(Y, null, te(l(n).items.value, ($) => (u(), d("li", {
            key: $.key,
            class: z(["ap-item", $.status])
          }, [
            g(l(C), {
              class: z(["ap-item-ic", ["uploading", "processing", "embedding"].includes($.status) && "spin"]),
              icon: ke($.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", Qn, S($.name), 1),
            r("span", Yn, S($.error || ae[$.status]), 1)
          ], 2))), 128))
        ])
      ])) : A("", !0)
    ]));
  }
}), Zn = { props: { type: "object", properties: { config: { type: "object", description: "KB detail context: { kb_id: string }", default: {} } } } }, Oo = {
  wippy: Zn
};
export {
  co as A,
  uo as B,
  Je as C,
  po as D,
  lo as E,
  fo as F,
  we as G,
  Ke as H,
  ho as I,
  ro as J,
  se as N,
  ve as _,
  qe as a,
  yo as b,
  so as c,
  To as d,
  wo as e,
  Mo as f,
  Eo as g,
  $o as h,
  ao as i,
  xo as j,
  Co as k,
  Ao as l,
  Te as m,
  oo as n,
  So as o,
  Io as p,
  Oo as q,
  Ye as r,
  nt as s,
  _o as t,
  go as u,
  bo as v,
  io as w,
  vo as x,
  ko as y,
  mo as z
};
//# sourceMappingURL=package-DvVPJ2qE.js.map
