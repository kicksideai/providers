import { defineComponent as G, openBlock as c, createElementBlock as d, createElementVNode as r, renderSlot as he, normalizeClass as R, createVNode as w, unref as l, withKeys as qe, createCommentVNode as I, Fragment as te, renderList as ne, createBlock as be, createTextVNode as P, toDisplayString as x, watch as ue, onBeforeUnmount as ye, Transition as Oe, withCtx as Ie, withModifiers as ke, ref as U, computed as q, isRef as Ce, nextTick as ze, onMounted as Ue, withDirectives as de, vModelText as we, vModelSelect as je } from "vue";
import { Icon as S } from "@iconify/vue";
import { on as Le, api as Q, host as ce } from "@wippy-fe/proxy";
function Ne(e, o = "") {
  const t = e || {};
  return t.label || t.title || t.source_ref?.title || t.filename || t.original_filename || t.source_url || o;
}
function lo(e) {
  return Ne(e.metadata, e.id);
}
function pe(e) {
  return Ne(e.metadata, "");
}
function ee(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function W(e) {
  return typeof e == "string" ? e.trim() : "";
}
const Ee = /^[\t\n\v\f\r ]$/;
function fe(e) {
  if (typeof e != "string") return "";
  let o = 0, t = e.length;
  for (; o < t && Ee.test(e[o]); ) o++;
  for (; t > o && Ee.test(e[t - 1]); ) t--;
  return e.slice(o, t);
}
function Ke(e) {
  const o = ee(e.metadata), t = ee(o.source_ref);
  let a = fe(o.external_id) || fe(t.external_id);
  const n = fe(o.external_source) || fe(t.external_source), s = W(t.external_version) || W(o.external_version);
  let f = W(t.upload_id) || W(o.upload_id), _ = W(t.source_url) || W(t.url) || W(o.source_url);
  const C = W(t.reference_component_id) || W(t.component_id) || W(o.reference_component_id), M = Object.keys(ee(t.reference_context)).length ? ee(t.reference_context) : Object.keys(ee(t.context)).length ? ee(t.context) : ee(o.reference_context);
  if (!f && a.startsWith("upload:") && (f = a.slice(7)), !_ && a.startsWith("url:") && (_ = a.slice(4)), !a && f && (a = `upload:${f}`), !a && _ && (a = `url:${_}`), !a) return null;
  const p = { ...t };
  delete p.thread_id, delete p.thread_event_id, delete p.thread_event_seq;
  const T = typeof t.thread_id == "string" && t.thread_id ? t.thread_id : o.thread_id;
  n && (p.document_identity = {
    external_source: n,
    external_id: a,
    ...typeof T == "string" && T !== "" ? { lineage: T } : {}
  }, delete p.external_version), C && !W(p.reference_component_id) && (p.reference_component_id = C), Object.keys(M).length && Object.keys(ee(p.reference_context)).length === 0 && (p.reference_context = M), a && Object.keys(p).length && !W(p.external_id) && (p.external_id = a);
  const u = Object.keys(p).length > 0;
  return {
    external_id: a,
    external_version: n ? void 0 : s || void 0,
    upload_id: f || void 0,
    source_url: _ || void 0,
    metadata: {
      title: o.title || o.filename || o.source_url,
      node_id: e.id,
      source_ref: u ? p : void 0
    },
    source_ref: u ? p : void 0
  };
}
function io(e) {
  const o = Ke(e);
  if (!o) return null;
  const t = o.source_ref?.document_identity;
  return JSON.stringify([t?.lineage || "", t?.external_source || "", o.external_id]);
}
function $e(e, o) {
  return e ? e.length > o ? e.slice(0, o).trimEnd() + "…" : e : "";
}
const We = /engine .*not installed|no .*engine|unavailable/i;
function ro(e) {
  return We.test(e || "");
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
}, me = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15];
function He(e) {
  return e < me.length ? me[e] : Math.round((me[0] + (e - me.length + 1) * 137.508) % 360);
}
function ve(e, o, t) {
  return `hsl(${e} ${o}% ${t}%)`;
}
const Te = 34, Me = 88, Xe = 78, Je = 38;
function po(e, o) {
  const t = new Map(e.map((u) => [u.id, u])), a = /* @__PURE__ */ new Map();
  for (const u of o)
    u.edge_type !== "subtopic_of" && u.edge_type !== "categorized_as" || t.has(u.from_node_id) && t.has(u.to_node_id) && a.set(u.from_node_id, u.to_node_id);
  const n = (u) => !!t.get(u)?.is_root;
  function s(u) {
    const k = /* @__PURE__ */ new Set();
    let A = u, L = 0;
    for (; !k.has(A); ) {
      k.add(A);
      const b = a.get(A);
      if (b === void 0 || n(b)) return { branch: A, depth: L };
      A = b, L++;
    }
    return { branch: A, depth: L };
  }
  const f = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) continue;
    const k = s(u.id);
    f.set(u.id, k), _.set(k.branch, Math.max(_.get(k.branch) ?? 0, k.depth));
  }
  const C = [...new Set([...f.values()].map((u) => u.branch))].sort((u, k) => (t.get(u)?.label || "").localeCompare(t.get(k)?.label || "")), M = /* @__PURE__ */ new Map();
  C.forEach((u, k) => M.set(u, He(k)));
  const p = (u, k, A) => u + (k - u) * A, T = /* @__PURE__ */ new Map();
  for (const u of e) {
    if (u.is_root) {
      T.set(u.id, { ...ae.root });
      continue;
    }
    const k = f.get(u.id);
    if (!k) {
      T.set(u.id, { ...ae.topic });
      continue;
    }
    const A = M.get(k.branch) ?? 220, L = Math.min(Math.max(_.get(k.branch) ?? 0, 1), 4), b = Math.min(1, k.depth / L);
    if (u.node_type === "document") {
      const F = Math.min(84, p(Te, Me, b) + 6);
      T.set(u.id, { fill: ve(A, 32, F), stroke: ve(A, 32, Math.max(50, F - 14)) });
    } else {
      const F = p(Te, Me, b), D = p(Xe, Je, b);
      T.set(u.id, { fill: ve(A, D, F), stroke: ve(A, D, Math.max(28, F - 17)) });
    }
  }
  return T;
}
const Qe = /* @__PURE__ */ new Set(["subtopic_of", "categorized_as"]);
function fo(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const p of e) t.set(p.id, p);
  const a = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const p of o) {
    if (!Qe.has(p.edge_type || "") || !t.has(p.from_node_id) || !t.has(p.to_node_id)) continue;
    const T = a.get(p.to_node_id) || [];
    T.push(p.from_node_id), a.set(p.to_node_id, T), n.add(p.from_node_id);
  }
  const s = (p, T) => (t.get(p)?.label || "").localeCompare(t.get(T)?.label || "");
  function f(p, T, u) {
    const k = t.get(p);
    if (!k || u.has(p)) return null;
    u.add(p);
    const A = (a.get(p) || []).slice().sort(s), L = [];
    for (const b of A) {
      const F = f(b, T + 1, u);
      F && L.push(F);
    }
    return { concept: k, children: L, depth: T };
  }
  const _ = e.filter((p) => p.is_root || !n.has(p.id)).map((p) => p.id).sort(s), C = /* @__PURE__ */ new Set(), M = [];
  for (const p of _) {
    const T = f(p, 0, C);
    T && M.push(T);
  }
  for (const p of e)
    if (!C.has(p.id)) {
      const T = f(p.id, 0, C);
      T && M.push(T);
    }
  return M;
}
function mo(e) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), a = (n, s) => {
    o.set(n.concept.id, n), s && t.set(n.concept.id, s);
    for (const f of n.children) a(f, n.concept.id);
  };
  for (const n of e) a(n, null);
  return { byId: o, parentOf: t };
}
function vo(e) {
  return e ? e.children.map((t) => ({
    concept: t.concept,
    isFolder: t.children.length > 0,
    childCount: t.children.length
  })).sort((t, a) => t.isFolder !== a.isFolder ? t.isFolder ? -1 : 1 : (t.concept.label || t.concept.id).localeCompare(a.concept.label || a.concept.id)) : [];
}
function Ye(e, o, t) {
  const a = [], n = /* @__PURE__ */ new Set();
  let s = e;
  for (; s && !n.has(s); ) {
    n.add(s);
    const f = o.get(s);
    if (!f) break;
    a.unshift(f.concept), s = t.get(s);
  }
  return a;
}
function ho(e, o, t) {
  const a = e.trim().toLowerCase();
  if (!a) return [];
  const n = [];
  for (const s of o.values()) {
    if (!(s.concept.label || s.concept.id).toLowerCase().includes(a)) continue;
    const _ = Ye(s.concept.id, o, t);
    n.push({ concept: s.concept, isFolder: s.children.length > 0, path: _.slice(0, -1) });
  }
  return n.sort((s, f) => s.isFolder !== f.isFolder ? s.isFolder ? -1 : 1 : (s.concept.label || s.concept.id).localeCompare(f.concept.label || f.concept.id)).slice(0, 200);
}
function _o(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : "tabler:point-filled";
}
const Ze = {
  technology: "tabler:cpu",
  person: "tabler:user",
  organization: "tabler:building",
  location: "tabler:map-pin",
  event: "tabler:calendar-event",
  process: "tabler:route",
  product: "tabler:package",
  topic: "tabler:bookmark"
};
function bo(e) {
  return e.node_type === "document" ? "tabler:file-text" : e.is_root ? "tabler:hierarchy-2" : Ze[(e.concept_type || "").toLowerCase()] || "tabler:folder";
}
function et(e, o) {
  if (!e) return [];
  if (e.node_type === "document") return [e.id];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const n of o)
    n.edge_type === "categorized_as" && n.to_node_id === e.id && !a.has(n.from_node_id) && (a.add(n.from_node_id), t.push(n.from_node_id));
  return t;
}
function yo(e, o) {
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
    const f = t.get(s.from_node_id);
    f && (n.add(s.from_node_id), a.push(f));
  }
  return a.sort((s, f) => (s.label || "").localeCompare(f.label || ""));
}
function go(e, o, t) {
  if (!e) return [];
  const a = [], n = /* @__PURE__ */ new Set(), s = new Set(et(e, o));
  for (const f of o) {
    if (f.edge_type === "subtopic_of" || f.edge_type === "categorized_as") continue;
    let _ = "";
    if (f.from_node_id === e.id) _ = f.to_node_id;
    else if (f.to_node_id === e.id) _ = f.from_node_id;
    else continue;
    if (!_ || n.has(_) || s.has(_)) continue;
    const C = t.get(_);
    C && (n.add(_), a.push({ concept: C, label: Ge[f.edge_type || ""] || f.edge_type || "related" }));
  }
  return a;
}
function xo(e, o) {
  let t = 0;
  for (const a of o)
    a.edge_type === "subtopic_of" && a.to_node_id === e && t++;
  return t;
}
const tt = ["image/", "audio/", "video/"], nt = /* @__PURE__ */ new Set([
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
function wo(e) {
  const o = (e || "").toLowerCase();
  return tt.some((t) => o.startsWith(t)) || nt.has(o);
}
function $o(e) {
  const o = e || {}, t = o.source_ref && typeof o.source_ref == "object" ? o.source_ref : {}, a = t.upload_id || o.upload_id;
  if (typeof a == "string" && a.trim()) return a.trim();
  const n = typeof t.external_id == "string" && t.external_id || typeof o.external_id == "string" && o.external_id || "";
  return n.startsWith("upload:") ? n.slice(7) : "";
}
function ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ot(e, o) {
  if (!o) return null;
  const t = ie(e) ? e : {}, a = [
    t,
    ie(t.data) ? t.data : null,
    ie(t.payload) ? t.payload : null,
    ie(t.detail) ? t.detail : null
  ].filter(Boolean);
  for (const n of a) {
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
function st(e, o) {
  if (!e) return null;
  const t = Le(`component.${e}`, (a) => {
    const n = ot(a, e);
    n && o(n);
  });
  return typeof t == "function" ? t : null;
}
const at = { class: "kx-shell" }, lt = { class: "kx-rail" }, it = { class: "kx-main" }, So = /* @__PURE__ */ G({
  __name: "KbShell",
  setup(e) {
    return (o, t) => (c(), d("div", at, [
      r("aside", lt, [
        he(o.$slots, "rail")
      ]),
      r("main", it, [
        he(o.$slots, "default")
      ])
    ]));
  }
}), rt = ["aria-label", "title", "disabled"], _e = /* @__PURE__ */ G({
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
      w(l(S), {
        icon: e.icon,
        class: R(e.spin && "spin"),
        "aria-hidden": "true"
      }, null, 8, ["icon", "class"])
    ], 10, rt));
  }
}), ct = { class: "kx-search" }, ut = ["value", "placeholder"], Ae = /* @__PURE__ */ G({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue", "enter", "clear"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", ct, [
      w(l(S), {
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
      }, null, 40, ut),
      e.modelValue ? (c(), d("button", {
        key: 0,
        class: "kx-search-clear",
        "aria-label": "Clear",
        onClick: n[2] || (n[2] = (s) => {
          t("update:modelValue", ""), t("clear");
        })
      }, [
        w(l(S), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : I("", !0)
    ]));
  }
}), dt = {
  class: "tb",
  role: "tablist"
}, pt = ["aria-selected", "onClick"], ft = {
  key: 1,
  class: "kx-count"
}, Co = /* @__PURE__ */ G({
  __name: "KbTabs",
  props: {
    tabs: {},
    active: {}
  },
  emits: ["select"],
  setup(e, { emit: o }) {
    const t = o;
    return (a, n) => (c(), d("div", dt, [
      (c(!0), d(te, null, ne(e.tabs, (s) => (c(), d("button", {
        key: s.id,
        class: R(["tb-tab", { on: e.active === s.id }]),
        role: "tab",
        "aria-selected": e.active === s.id,
        onClick: (f) => t("select", s.id)
      }, [
        s.icon ? (c(), be(l(S), {
          key: 0,
          icon: s.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        P(" " + x(s.label) + " ", 1),
        s.count !== void 0 ? (c(), d("span", ft, x(s.count), 1)) : I("", !0)
      ], 10, pt))), 128))
    ]));
  }
}), Eo = /* @__PURE__ */ G({
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
      class: R(["kx-notice", e.tone])
    }, [
      w(l(S), {
        icon: l(t),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      r("span", null, [
        he(a.$slots, "default")
      ])
    ], 2));
  }
}), mt = ["aria-label"], vt = { class: "kx-drawer-h" }, ht = { class: "kx-drawer-title" }, _t = { class: "kx-drawer-b" }, To = /* @__PURE__ */ G({
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
    }), ye(() => window.removeEventListener("keydown", n)), (s, f) => (c(), be(Oe, { name: "kx-drawer" }, {
      default: Ie(() => [
        e.open ? (c(), d("div", {
          key: 0,
          class: "kx-drawer-mask",
          onClick: f[1] || (f[1] = ke((_) => a("close"), ["self"]))
        }, [
          r("aside", {
            class: "kx-drawer",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("div", vt, [
              r("span", ht, [
                w(l(S), {
                  icon: e.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(x(e.title), 1)
              ]),
              w(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: f[0] || (f[0] = (_) => a("close"))
              })
            ]),
            r("div", _t, [
              he(s.$slots, "default")
            ])
          ], 8, mt)
        ])) : I("", !0)
      ]),
      _: 3
    }));
  }
});
function bt(e) {
  const o = U(""), t = U([]), a = U(""), n = U(null), s = U(!1), f = U(""), _ = U(!1);
  let C = null;
  function M() {
    C && (clearTimeout(C), C = null), o.value = "", t.value = [], a.value = "", n.value = null, _.value = !1, f.value = "";
  }
  async function p(k = 20) {
    const A = e(), L = o.value.trim();
    if (!L || !A) {
      t.value = [], _.value = !1;
      return;
    }
    s.value = !0, f.value = "", n.value = null, _.value = !0;
    try {
      const { data: b } = await Q.get(`/api/v1/kb10/${A}/search?q=${encodeURIComponent(L)}&limit=${k}`);
      b?.success ? (t.value = b.results || [], a.value = "", n.value = b.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null) : f.value = b?.error || "search failed";
    } catch (b) {
      f.value = b?.response?.data?.error || b?.message || "search error", ce.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      s.value = !1;
    }
  }
  async function T(k = 8) {
    const A = e(), L = o.value.trim();
    if (!L || !A) {
      t.value = [], a.value = "", _.value = !1;
      return;
    }
    s.value = !0, f.value = "", n.value = null, a.value = "", _.value = !0;
    try {
      const { data: b } = await Q.post(`/api/v1/knowledge/${A}/ask`, { query: L, limit: k });
      b?.success ? (t.value = b.results || [], a.value = String(b.answer || "")) : (n.value = b?.retrieval?.analysis?.status === "unavailable" ? b.retrieval.analysis : null, f.value = b?.error || "ask failed");
    } catch (b) {
      const F = b?.response?.data;
      n.value = F?.retrieval?.analysis?.status === "unavailable" ? F.retrieval.analysis : null, f.value = F?.error || b?.message || "ask error", ce.handleError(b?.response?.status === 401 ? "auth-expired" : "other", b);
    } finally {
      s.value = !1;
    }
  }
  function u(k = 300) {
    if (C && clearTimeout(C), !o.value.trim()) {
      t.value = [], _.value = !1;
      return;
    }
    C = setTimeout(() => p(), k);
  }
  return ye(() => {
    C && clearTimeout(C);
  }), { query: o, results: t, answer: a, analysisUnavailable: n, loading: s, error: f, performed: _, run: p, ask: T, runDebounced: u, clear: M };
}
function Se(e) {
  return e == null ? "" : `${Math.round(e * 100)}%`;
}
const yt = {
  key: 0,
  class: "kc-search-pop"
}, kt = {
  key: 0,
  class: "kc-search-state",
  role: "status"
}, gt = {
  key: 1,
  class: "kc-search-state err"
}, xt = {
  key: 2,
  class: "kc-search-hits"
}, wt = ["onMousedown"], $t = { class: "kc-search-hit-h" }, St = {
  key: 0,
  class: "kc-search-r-doc"
}, Ct = { class: "kc-search-hit-kind" }, Et = {
  key: 1,
  class: "kc-search-hit-score"
}, Tt = { class: "kc-search-hit-body" }, Mt = {
  key: 3,
  class: "kc-search-state"
}, At = {
  key: 4,
  class: "kc-search-state"
}, Ot = {
  key: 1,
  class: "kc-search-panel"
}, It = { class: "kc-search-bar" }, Ut = {
  key: 0,
  class: "kc-search-modes"
}, Lt = { class: "kc-search-field" }, Nt = {
  key: 0,
  class: "kc-search-state"
}, Ft = {
  key: 1,
  class: "kc-search-state",
  role: "status"
}, Dt = {
  key: 2,
  class: "kc-search-err"
}, Bt = {
  key: 3,
  class: "kc-search-skel"
}, Pt = {
  key: 0,
  class: "kc-ans"
}, Rt = { class: "kc-ans-h" }, Vt = { class: "kc-ans-body" }, qt = {
  key: 0,
  class: "kc-ans-sim"
}, zt = { class: "kc-search-results" }, jt = {
  key: 0,
  class: "kc-search-results-h"
}, Kt = ["onClick"], Wt = { class: "kc-search-r-h" }, Gt = {
  key: 0,
  class: "kc-search-r-doc"
}, Ht = { class: "kc-search-hit-kind" }, Xt = {
  key: 1,
  class: "kc-search-r-llm"
}, Jt = {
  key: 2,
  class: "kc-search-hit-score"
}, Qt = { class: "kc-search-r-body" }, Yt = {
  key: 0,
  class: "kc-search-r-open"
}, Zt = {
  key: 5,
  class: "kc-search-zero"
}, en = {
  key: 6,
  class: "kc-search-zero"
}, tn = { class: "kc-search-zero-t" }, Mo = /* @__PURE__ */ G({
  __name: "KbSearch",
  props: {
    kbId: {},
    layout: { default: "panel" },
    ask: { type: Boolean },
    placeholder: {}
  },
  emits: ["open", "close"],
  setup(e, { emit: o }) {
    const t = e, a = o, { query: n, results: s, answer: f, analysisUnavailable: _, loading: C, error: M, performed: p, run: T, ask: u, runDebounced: k, clear: A } = bt(() => t.kbId), L = U("search"), b = U(!1), F = U(""), D = q(() => t.ask && !_.value), V = q(() => t.layout === "panel" && D.value && L.value === "ask"), z = q(() => C.value ? "tabler:hourglass" : V.value ? "tabler:sparkles" : "tabler:arrow-right"), H = q(() => s.value[0]), oe = q(() => V.value ? s.value.slice(1) : s.value), se = q(() => t.layout === "rail" && b.value && n.value.trim() !== "" && (C.value || p.value || !!M.value));
    function Y() {
      n.value.trim() && (F.value = n.value.trim(), V.value ? u(8) : T(20));
    }
    function Z() {
      t.layout === "rail" && k(300);
    }
    function j(J) {
      L.value = J, p.value && n.value.trim() && Y();
    }
    function X(J) {
      a("open", J), t.layout === "rail" && (A(), b.value = !1);
    }
    return (J, y) => e.layout === "rail" ? (c(), d("div", {
      key: 0,
      class: "kc-search-rail",
      onFocusin: y[2] || (y[2] = (g) => b.value = !0),
      onFocusout: y[3] || (y[3] = (g) => b.value = !1)
    }, [
      w(Ae, {
        modelValue: l(n),
        "onUpdate:modelValue": [
          y[0] || (y[0] = (g) => Ce(n) ? n.value = g : null),
          Z
        ],
        placeholder: e.placeholder || "Search…",
        onEnter: y[1] || (y[1] = (g) => l(T)(20)),
        onClear: l(A)
      }, null, 8, ["modelValue", "placeholder", "onClear"]),
      se.value ? (c(), d("div", yt, [
        l(_) ? (c(), d("p", kt, "Showing direct matches. No model is assigned to " + x(l(_).model) + ".", 1)) : I("", !0),
        l(M) ? (c(), d("div", gt, [
          w(l(S), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          r("span", null, x(l(M)), 1)
        ])) : l(s).length ? (c(), d("div", xt, [
          (c(!0), d(te, null, ne(l(s), (g) => (c(), d("button", {
            key: g.id,
            class: "kc-search-hit",
            onMousedown: ke((le) => X(g), ["prevent"])
          }, [
            r("span", $t, [
              l(pe)(g) ? (c(), d("span", St, [
                w(l(S), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(x(l(pe)(g)), 1)
              ])) : I("", !0),
              r("span", Ct, x(g.node_type || "result"), 1),
              g.similarity != null ? (c(), d("span", Et, x(l(Se)(g.similarity)), 1)) : I("", !0)
            ]),
            r("span", Tt, x(l($e)(g.content, 160)), 1)
          ], 40, wt))), 128))
        ])) : l(p) && !l(C) ? (c(), d("div", Mt, [
          w(l(S), {
            icon: "tabler:search-off",
            "aria-hidden": "true"
          }),
          y[9] || (y[9] = r("span", null, "No passages matched.", -1))
        ])) : l(C) ? (c(), d("div", At, [
          w(l(S), {
            icon: "tabler:hourglass",
            class: "kc-search-busy-ico",
            "aria-hidden": "true"
          }),
          y[10] || (y[10] = r("span", null, "Searching…", -1))
        ])) : I("", !0)
      ])) : I("", !0)
    ], 32)) : (c(), d("div", Ot, [
      r("div", It, [
        D.value ? (c(), d("div", Ut, [
          r("button", {
            class: R(["kc-search-mode", { on: L.value === "search" }]),
            onClick: y[4] || (y[4] = (g) => j("search"))
          }, [
            w(l(S), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            y[11] || (y[11] = P(" Search ", -1))
          ], 2),
          r("button", {
            class: R(["kc-search-mode", { on: L.value === "ask" }]),
            onClick: y[5] || (y[5] = (g) => j("ask"))
          }, [
            w(l(S), {
              icon: "tabler:message-question",
              "aria-hidden": "true"
            }),
            y[12] || (y[12] = P(" Ask ", -1))
          ], 2)
        ])) : I("", !0),
        r("div", Lt, [
          w(Ae, {
            modelValue: l(n),
            "onUpdate:modelValue": y[6] || (y[6] = (g) => Ce(n) ? n.value = g : null),
            placeholder: V.value ? "Ask this knowledge base a question…" : "Search every indexed passage…",
            onEnter: Y
          }, null, 8, ["modelValue", "placeholder"])
        ]),
        w(_e, {
          icon: z.value,
          label: V.value ? "Ask" : "Search",
          variant: "bordered",
          active: l(C),
          disabled: !l(n).trim() || l(C),
          onClick: Y
        }, null, 8, ["icon", "label", "active", "disabled"]),
        w(_e, {
          icon: "tabler:x",
          label: "Close search",
          onClick: y[7] || (y[7] = (g) => a("close"))
        })
      ]),
      t.ask ? I("", !0) : (c(), d("p", Nt, "Select an Answer model in knowledge base settings to enable Ask.")),
      l(_) ? (c(), d("p", Ft, "Showing direct matches. No model is assigned to " + x(l(_).model) + ".", 1)) : I("", !0),
      l(M) ? (c(), d("div", Dt, [
        w(l(S), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, x(l(M)), 1)
      ])) : I("", !0),
      l(C) ? (c(), d("div", Bt, [
        (c(), d(te, null, ne(3, (g) => r("div", {
          key: g,
          class: "kc-search-skel-row"
        })), 64))
      ])) : l(s).length ? (c(), d(te, { key: 4 }, [
        V.value ? (c(), d("div", Pt, [
          r("div", Rt, [
            w(l(S), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            P(" " + x(l(f) ? "Answer" : "Best match") + ' for "' + x(F.value) + '"', 1)
          ]),
          r("p", Vt, x(l(f) || l($e)(H.value?.content, 700)), 1),
          H.value?.parent_id ? (c(), d("button", {
            key: 0,
            class: "kc-ans-src",
            onClick: y[8] || (y[8] = (g) => X(H.value))
          }, [
            w(l(S), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            y[13] || (y[13] = P(" Open source document ", -1)),
            H.value?.similarity != null ? (c(), d("span", qt, x(l(Se)(H.value?.similarity)), 1)) : I("", !0)
          ])) : I("", !0)
        ])) : I("", !0),
        r("div", zt, [
          V.value && oe.value.length ? (c(), d("div", jt, "Sources")) : I("", !0),
          (c(!0), d(te, null, ne(oe.value, (g) => (c(), d("button", {
            key: g.id,
            class: R(["kc-search-result", { link: !!g.parent_id }]),
            onClick: (le) => X(g)
          }, [
            r("div", Wt, [
              l(pe)(g) ? (c(), d("span", Gt, [
                w(l(S), {
                  icon: "tabler:file-text",
                  "aria-hidden": "true"
                }),
                P(x(l(pe)(g)), 1)
              ])) : I("", !0),
              r("span", Ht, x(g.node_type || "passage"), 1),
              g.llm_score != null ? (c(), d("span", Xt, "Relevance " + x(Math.round(g.llm_score)), 1)) : I("", !0),
              g.similarity != null ? (c(), d("span", Jt, x(l(Se)(g.similarity)), 1)) : I("", !0)
            ]),
            r("p", Qt, x(l($e)(g.content, 360)), 1),
            g.parent_id ? (c(), d("span", Yt, [
              w(l(S), {
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              }),
              y[14] || (y[14] = P(" Open document", -1))
            ])) : I("", !0)
          ], 10, Kt))), 128))
        ])
      ], 64)) : l(p) ? (c(), d("div", Zt, [
        w(l(S), {
          icon: "tabler:search-off",
          "aria-hidden": "true"
        }),
        y[15] || (y[15] = r("div", { class: "kc-search-zero-t" }, "No matches", -1)),
        y[16] || (y[16] = r("div", { class: "kc-search-zero-s" }, "Try different terms or rephrase your question.", -1))
      ])) : (c(), d("div", en, [
        w(l(S), {
          icon: V.value ? "tabler:message-question" : "tabler:search",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        r("div", tn, x(V.value ? "Ask your knowledge base" : "Search your knowledge base"), 1)
      ]))
    ]));
  }
}), nn = ["aria-label"], on = { class: "kc-orig-h" }, sn = { class: "kc-orig-title" }, an = { class: "kc-orig-title-t" }, ln = { class: "kc-orig-b" }, rn = ["content-type", "source-url", "filename"], Ao = /* @__PURE__ */ G({
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
    function f() {
      document.fullscreenElement && document.exitFullscreen().catch(() => {
      });
    }
    function _(u) {
      u.key === "Escape" && a("close");
    }
    function C() {
      t.open && !document.fullscreenElement && a("close");
    }
    ue(() => t.open, (u) => {
      u ? (window.addEventListener("keydown", _), ze(s)) : (window.removeEventListener("keydown", _), f());
    });
    const M = U(""), p = U("");
    async function T() {
      if (M.value = "", p.value = "", !(!t.open || !t.sourceUrl))
        try {
          const { data: u } = await Q.get(t.sourceUrl);
          u?.success && typeof u.url == "string" && (M.value = u.url, p.value = typeof u.content_type == "string" ? u.content_type : "");
        } catch {
        }
    }
    return ue(() => [t.open, t.sourceUrl], T, { immediate: !0 }), Ue(() => {
      t.contained || document.addEventListener("fullscreenchange", C);
    }), ye(() => {
      document.removeEventListener("fullscreenchange", C), window.removeEventListener("keydown", _), f();
    }), (u, k) => (c(), be(Oe, { name: "kc-orig" }, {
      default: Ie(() => [
        e.open ? (c(), d("div", {
          key: 0,
          ref_key: "maskRef",
          ref: n,
          class: R(["kc-orig-mask", { "kc-orig-contained": e.contained }]),
          onClick: k[1] || (k[1] = ke((A) => a("close"), ["self"]))
        }, [
          r("section", {
            class: "kc-orig",
            role: "dialog",
            "aria-label": e.title
          }, [
            r("header", on, [
              r("span", sn, [
                w(l(S), {
                  icon: "tabler:file-search",
                  "aria-hidden": "true"
                }),
                r("span", an, x(e.title), 1)
              ]),
              w(_e, {
                icon: "tabler:x",
                label: "Close",
                onClick: k[0] || (k[0] = (A) => a("close"))
              })
            ]),
            r("div", ln, [
              M.value ? (c(), d("wc-resource-view", {
                key: M.value,
                class: "kc-orig-rv",
                "content-type": p.value || e.contentType,
                "source-url": M.value,
                filename: e.filename
              }, null, 8, rn)) : I("", !0)
            ])
          ], 8, nn)
        ], 2)) : I("", !0)
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
    return (a, n) => (c(), d("button", {
      type: "button",
      class: "kx-btn kx-btn-ghost sm",
      onClick: n[0] || (n[0] = (s) => t("open"))
    }, [
      w(l(S), {
        icon: "tabler:file-search",
        "aria-hidden": "true"
      }),
      r("span", null, x(e.label || "View original"), 1)
    ]));
  }
}), cn = { class: "kc-docsum" }, un = { class: "kc-docsum-h" }, Io = /* @__PURE__ */ G({
  __name: "KbSummary",
  props: {
    text: {},
    label: { default: "Summary" },
    icon: { default: "tabler:file-description" },
    collapsible: { type: Boolean }
  },
  setup(e) {
    const o = e, t = U(!1), a = q(() => o.collapsible === !0 && o.text.length > 320);
    return (n, s) => (c(), d("section", cn, [
      r("div", un, [
        w(l(S), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        P(" " + x(e.label), 1)
      ]),
      r("p", {
        class: R(["kc-docsum-b", { clamp: a.value && !t.value }])
      }, x(e.text), 3),
      a.value ? (c(), d("button", {
        key: 0,
        class: "kc-docsum-more",
        type: "button",
        onClick: s[0] || (s[0] = (f) => t.value = !t.value)
      }, x(t.value ? "Show less" : "Show more"), 1)) : I("", !0)
    ]));
  }
}), dn = { class: "kx-empty kx-empty-spacious" }, pn = { class: "kx-empty-title" }, fn = {
  key: 0,
  class: "kx-empty-sub"
}, Uo = /* @__PURE__ */ G({
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
    return (a, n) => (c(), d("div", dn, [
      r("div", {
        class: R(["kx-empty-ico", e.tone === "muted" ? "muted" : "primary"])
      }, [
        w(l(S), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 2),
      r("div", pn, x(e.title), 1),
      e.hint ? (c(), d("div", fn, x(e.hint), 1)) : I("", !0),
      e.cta ? (c(), d("button", {
        key: 1,
        class: "kx-btn kx-btn-primary kx-empty-cta",
        onClick: n[0] || (n[0] = (s) => t("cta"))
      }, [
        e.ctaIcon ? (c(), be(l(S), {
          key: 0,
          icon: e.ctaIcon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : I("", !0),
        P(" " + x(e.cta), 1)
      ])) : I("", !0)
    ]));
  }
}), Fe = /* @__PURE__ */ new Set([
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
]), De = /* @__PURE__ */ new Set([
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
]), Be = /* @__PURE__ */ new Set([
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
]), Pe = /* @__PURE__ */ new Set([
  "application/json",
  "application/javascript",
  "application/xml"
]), mn = [
  ...Array.from(Fe),
  ...Array.from(De)
].map((e) => `.${e}`), vn = [
  ...mn,
  "text/*",
  ...Array.from(Pe),
  ...Array.from(Be)
].join(","), hn = "This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.";
function _n(e) {
  const o = String(e || "").toLowerCase().split("/").pop() || "", t = o.lastIndexOf(".");
  return t >= 0 ? o.slice(t + 1) : "";
}
function bn(e) {
  const o = String(e.type || "").toLowerCase();
  if (o.startsWith("text/") || Be.has(o) || Pe.has(o)) return !0;
  const t = _n(e.name);
  return Fe.has(t) || De.has(t);
}
const re = ["uploading", "processing"];
function yn(e, o) {
  const t = U([]), a = U(!1), n = U(""), s = U("");
  let f = 0;
  const _ = (i) => `${i}${++f}`, C = q(() => a.value || t.value.some((i) => re.includes(i.status)));
  function M() {
    n.value = "", s.value = "";
  }
  function p() {
    t.value = t.value.filter((i) => re.includes(i.status));
  }
  function T(i) {
    t.value = t.value.filter((m) => m.key !== i);
  }
  function u(i, m) {
    t.value = t.value.map((h) => h.key === i ? { ...h, ...m } : h);
  }
  const k = [];
  function A() {
    for (const i of k.splice(0)) clearTimeout(i);
    for (const i of [2500, 8e3, 2e4]) k.push(setTimeout(() => o(), i));
  }
  function L() {
    const i = t.value.filter((m) => m.status === "done").length;
    n.value = i > 1 ? `Added ${i} items to the library.` : "Added to the library.", o(), A();
  }
  function b(i) {
    const m = t.value.find((h) => h.key === i);
    !m || m.status === "done" || (u(i, { status: "done" }), L());
  }
  function F(i, m) {
    t.value = [...t.value, { key: _("q"), name: i, uuid: m, status: "done" }], L();
  }
  const D = /* @__PURE__ */ new Map(), V = [];
  function z(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function H(i) {
    const m = z(i) ? i : {};
    return String(m.topic || "");
  }
  function oe(i) {
    const m = z(i) ? i : {}, h = [
      m,
      z(m.data) ? m.data : null,
      z(m.payload) ? m.payload : null,
      z(m.detail) ? m.detail : null
    ].filter(Boolean);
    for (const O of h)
      if (typeof O.uuid == "string" && typeof O.status == "string") return O;
    return {};
  }
  function se(i, m, h) {
    const O = t.value.find((N) => N.uuid === i && re.includes(N.status));
    if (!O) return;
    const B = String(m || "");
    B === "error" || B === "failed" ? u(O.key, { status: "error", error: String(h || "File processing failed") }) : B === "completed" ? b(O.key) : ["pending", "uploaded", "queued", "processing"].includes(B) && u(O.key, { status: "processing" });
  }
  function Y(i, m) {
    const h = oe(m);
    h.uuid === i && se(i, h.status, h.error);
  }
  function Z(i) {
    const m = `upload:${i}`;
    if (D.has(m)) return;
    const h = Le("@message", (O) => {
      H(O) === m && Y(i, O);
    });
    typeof h == "function" && D.set(m, h);
  }
  async function j(i) {
    if (!(!i || !t.value.some((m) => m.uuid === i && re.includes(m.status))))
      try {
        const { data: m } = await Q.get(`/api/v1/uploads/${encodeURIComponent(i)}`), h = z(m?.upload) ? m.upload : z(m) ? m : {};
        se(i, h.status, h.error || h.error_details);
      } catch {
      }
  }
  function X(i) {
    j(i);
    for (const m of [1500, 5e3, 15e3])
      V.push(setTimeout(() => {
        j(i);
      }, m));
  }
  function J(i) {
    const m = i.meta || {};
    if (String(m.status || "") === "error") {
      const h = String(m.last_error || "Embedding failed");
      for (const O of t.value) re.includes(O.status) && u(O.key, { status: "error", error: h });
      s.value = h;
    }
  }
  let y = null, g = 0;
  function le(i) {
    const m = ++g;
    if (y && (y(), y = null), !i) return;
    const h = st(i, J);
    if (m !== g) {
      h && h();
      return;
    }
    y = h;
  }
  ue(() => e(), (i) => {
    le(i);
  }, { immediate: !0 }), ye(() => {
    for (const i of k.splice(0)) clearTimeout(i);
    for (const i of V.splice(0)) clearTimeout(i);
    g++, y && y();
    for (const i of D.values()) i();
    D.clear();
  });
  async function ge(i, m, h) {
    try {
      const { data: O } = await Q.post(`/api/v1/knowledge/${h}/upload-token`);
      if (!O?.success || !O.upload_token) {
        u(i, { status: "error", error: O?.error || "Could not get an upload token" });
        return;
      }
      const B = new FormData();
      B.append("file", m), B.append("upload_token", O.upload_token);
      const { data: N } = await Q.post("/api/v1/uploads", B, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (N?.success && N.uuid) {
        const K = String(N.uuid);
        u(i, { uuid: K, externalId: `upload:${K}`, status: "processing" }), Z(K), X(K);
      } else
        u(i, { status: "error", error: N?.error || "Upload failed" });
    } catch (O) {
      u(i, { status: "error", error: O?.response?.data?.error || O?.message || "Upload error" }), ce.handleError(O?.response?.status === 401 ? "auth-expired" : "other", O);
    }
  }
  function E(i) {
    const m = e();
    if (m) {
      M();
      for (const h of Array.from(i)) {
        if (!bn(h)) {
          s.value = hn;
          continue;
        }
        const O = _("f");
        t.value = [...t.value, { key: O, name: h.name, status: "uploading" }], ge(O, h, m);
      }
    }
  }
  function v(i) {
    E([i]);
  }
  async function $(i = 100, m = 0) {
    const { data: h } = await Q.get(`/api/v1/uploads/list?limit=${i}&offset=${m}`), B = (Array.isArray(h?.uploads) ? h.uploads : []).map((N) => ({
      uuid: String(N.uuid),
      filename: String(N.filename || N.meta && N.meta.filename || N.uuid),
      mime_type: N.mime_type,
      size: N.size,
      status: N.status,
      created_at: N.created_at
    }));
    return { uploads: B, total: Number(h?.meta?.total ?? B.length) };
  }
  async function xe(i) {
    const m = e();
    if (!(!m || !i.length)) {
      M(), a.value = !0;
      try {
        const { data: h } = await Q.post(`/api/v1/knowledge/${m}/ingest-upload`, {
          upload_ids: i.map((K) => K.uuid)
        }), O = Array.isArray(h?.results) ? h.results : [], B = (K) => i.find((Ve) => Ve.uuid === K)?.name || K;
        let N = !1;
        for (const K of O)
          K?.success && (N = !0, F(B(String(K.upload_id)), String(K.upload_id)));
        N || (s.value = h?.error || "Could not ingest the selected uploads");
      } catch (h) {
        s.value = h?.response?.data?.error || h?.message || "Ingest error", ce.handleError(h?.response?.status === 401 ? "auth-expired" : "other", h);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Re(i, m, h) {
    const O = e();
    if (!(!i.trim() || !O)) {
      M(), a.value = !0;
      try {
        const B = m.trim() ? { title: m.trim() } : void 0, { data: N } = await Q.post(`/api/v1/knowledge/${O}/ingest`, { content: i, content_type: h, metadata: B });
        N?.success ? F(m.trim() || "Pasted text") : s.value = N?.error || "Ingestion failed";
      } catch (B) {
        s.value = B?.response?.data?.error || B?.message || "Ingestion error", ce.handleError(B?.response?.status === 401 ? "auth-expired" : "other", B);
      } finally {
        a.value = !1;
      }
    }
  }
  return {
    items: t,
    busy: C,
    okMsg: q(() => n.value),
    errMsg: q(() => s.value),
    reset: M,
    clearItems: p,
    removeItem: T,
    uploadFile: v,
    uploadFiles: E,
    listMyUploads: $,
    ingestExistingUploads: xe,
    ingestText: Re
  };
}
const kn = { class: "ap" }, gn = {
  class: "ap-modes",
  role: "tablist"
}, xn = ["aria-selected", "onClick"], wn = {
  key: 0,
  class: "ap-msg err"
}, $n = {
  key: 1,
  class: "ap-pane"
}, Sn = ["accept"], Cn = {
  key: 2,
  class: "ap-pane"
}, En = { class: "ap-uploads-bar" }, Tn = ["disabled"], Mn = {
  key: 0,
  class: "ap-uploads-state"
}, An = {
  key: 1,
  class: "ap-uploads-state err"
}, On = {
  key: 2,
  class: "ap-uploads-state"
}, In = {
  key: 3,
  class: "ap-uploads"
}, Un = ["aria-pressed", "onClick"], Ln = { class: "ap-upload-main" }, Nn = { class: "ap-upload-name" }, Fn = { class: "ap-upload-meta" }, Dn = {
  key: 0,
  class: "mono"
}, Bn = { key: 1 }, Pn = {
  key: 3,
  class: "ap-pane"
}, Rn = { class: "ap-form" }, Vn = { class: "ap-grid2" }, qn = { class: "ap-field" }, zn = ["placeholder"], jn = { class: "ap-field" }, Kn = { class: "ap-field" }, Wn = { class: "ap-label-row" }, Gn = {
  key: 0,
  class: "ap-count"
}, Hn = ["placeholder"], Xn = { class: "ap-actions" }, Jn = { class: "ap-hint" }, Qn = ["disabled"], Yn = {
  key: 4,
  class: "ap-items"
}, Zn = { class: "ap-items-h" }, eo = { class: "ap-items-list" }, to = { class: "ap-item-name" }, no = { class: "ap-item-status" }, Lo = /* @__PURE__ */ G({
  __name: "AddPanel",
  props: {
    kbId: {},
    noun: {}
  },
  emits: ["changed"],
  setup(e, { emit: o }) {
    const t = e, a = o, n = yn(() => t.kbId, () => a("changed")), s = U("file"), f = [
      { id: "file", label: "Upload files", icon: "tabler:cloud-upload" },
      { id: "text", label: "Paste text", icon: "tabler:text-plus" },
      { id: "uploads", label: "My uploads", icon: "tabler:folder" }
    ], _ = q(() => t.noun || "content");
    function C(E) {
      n.reset(), s.value = E, E === "uploads" && H();
    }
    const M = U(null), p = U(!1);
    function T() {
      M.value?.click();
    }
    function u(E) {
      const v = E.target.files;
      v?.length && n.uploadFiles(v), M.value && (M.value.value = "");
    }
    function k(E) {
      E.preventDefault(), p.value = !1;
      const v = E.dataTransfer?.files;
      v?.length && n.uploadFiles(v);
    }
    const A = U([]), L = U(!1), b = U(""), F = U(""), D = U({}), V = q(() => {
      const E = F.value.trim().toLowerCase();
      return E ? A.value.filter((v) => v.filename.toLowerCase().includes(E)) : A.value;
    }), z = q(() => Object.values(D.value).filter(Boolean).length);
    async function H() {
      L.value = !0, b.value = "";
      try {
        const { uploads: E } = await n.listMyUploads(200, 0);
        A.value = E;
      } catch (E) {
        b.value = E?.message || "Could not load your uploads";
      } finally {
        L.value = !1;
      }
    }
    function oe(E) {
      D.value = { ...D.value, [E]: !D.value[E] };
    }
    async function se() {
      const E = A.value.filter((v) => D.value[v.uuid]).map((v) => ({ uuid: v.uuid, name: v.filename }));
      E.length && (await n.ingestExistingUploads(E), n.errMsg.value || (D.value = {}));
    }
    function Y(E) {
      return !E || E <= 0 ? "" : E < 1024 ? `${E} B` : E < 1024 * 1024 ? `${(E / 1024).toFixed(0)} KB` : `${(E / 1024 / 1024).toFixed(1)} MB`;
    }
    const Z = U(""), j = U(""), X = U("text/plain"), J = q(() => j.value.length);
    async function y() {
      j.value.trim() && (await n.ingestText(j.value, Z.value, X.value), n.errMsg.value || (j.value = "", Z.value = ""));
    }
    const g = {
      uploading: "Uploading…",
      processing: "Processing…",
      done: "Added",
      error: "Failed"
    };
    function le(E) {
      return E === "done" ? "tabler:circle-check" : E === "error" ? "tabler:alert-circle" : "tabler:loader-2";
    }
    const ge = q(() => n.items.value.length > 0);
    return Ue(() => {
      s.value === "uploads" && H();
    }), ue(() => t.kbId, () => {
      n.clearItems(), n.reset();
    }), (E, v) => (c(), d("div", kn, [
      r("div", gn, [
        (c(), d(te, null, ne(f, ($) => r("button", {
          key: $.id,
          class: R(["ap-mode", { on: s.value === $.id }]),
          role: "tab",
          "aria-selected": s.value === $.id,
          onClick: (xe) => C($.id)
        }, [
          w(l(S), {
            icon: $.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          r("span", null, x($.label), 1)
        ], 10, xn)), 64))
      ]),
      l(n).errMsg.value ? (c(), d("div", wn, [
        w(l(S), { icon: "tabler:alert-circle" }),
        P(x(l(n).errMsg.value), 1)
      ])) : I("", !0),
      s.value === "file" ? (c(), d("section", $n, [
        r("input", {
          ref_key: "fileInput",
          ref: M,
          type: "file",
          class: "ap-file",
          multiple: "",
          accept: l(vn),
          onChange: u
        }, null, 40, Sn),
        r("button", {
          type: "button",
          class: R(["ap-drop", { over: p.value }]),
          onClick: T,
          onDragover: v[0] || (v[0] = ke(($) => p.value = !0, ["prevent"])),
          onDragleave: v[1] || (v[1] = ($) => p.value = !1),
          onDrop: k
        }, [
          w(l(S), {
            icon: "tabler:cloud-upload",
            class: "ap-drop-ico",
            "aria-hidden": "true"
          }),
          v[7] || (v[7] = r("span", { class: "ap-drop-t" }, "Drop files or click to browse", -1)),
          v[8] || (v[8] = r("span", { class: "ap-drop-s" }, "Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.", -1))
        ], 34)
      ])) : s.value === "uploads" ? (c(), d("section", Cn, [
        r("div", En, [
          de(r("input", {
            "onUpdate:modelValue": v[2] || (v[2] = ($) => F.value = $),
            class: "ap-input",
            type: "text",
            placeholder: "Filter your uploads…",
            autocomplete: "off"
          }, null, 512), [
            [we, F.value]
          ]),
          r("button", {
            class: "ap-submit",
            disabled: !z.value || l(n).busy.value,
            onClick: se
          }, [
            w(l(S), {
              icon: l(n).busy.value ? "tabler:loader-2" : "tabler:plus",
              class: R(l(n).busy.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            P(" " + x(z.value ? `Add ${z.value} selected` : "Add selected"), 1)
          ], 8, Tn)
        ]),
        L.value ? (c(), d("div", Mn, [
          w(l(S), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[9] || (v[9] = P(" Loading your uploads…", -1))
        ])) : b.value ? (c(), d("div", An, [
          w(l(S), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          P(" " + x(b.value), 1)
        ])) : V.value.length ? (c(), d("ul", In, [
          (c(!0), d(te, null, ne(V.value, ($) => (c(), d("li", {
            key: $.uuid
          }, [
            r("button", {
              type: "button",
              class: R(["ap-upload", { on: D.value[$.uuid] }]),
              "aria-pressed": !!D.value[$.uuid],
              onClick: (xe) => oe($.uuid)
            }, [
              w(l(S), {
                class: "ap-upload-check",
                icon: D.value[$.uuid] ? "tabler:square-check" : "tabler:square",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              w(l(S), {
                class: "ap-upload-ico",
                icon: "tabler:file-text",
                "aria-hidden": "true"
              }),
              r("span", Ln, [
                r("span", Nn, x($.filename), 1),
                r("span", Fn, [
                  $.mime_type ? (c(), d("span", Dn, x($.mime_type), 1)) : I("", !0),
                  Y($.size) ? (c(), d("span", Bn, x(Y($.size)), 1)) : I("", !0)
                ])
              ])
            ], 10, Un)
          ]))), 128))
        ])) : (c(), d("div", On, [
          w(l(S), {
            icon: "tabler:folder-off",
            "aria-hidden": "true"
          }),
          v[10] || (v[10] = P(" No uploads found.", -1))
        ]))
      ])) : (c(), d("section", Pn, [
        r("div", Rn, [
          r("div", Vn, [
            r("div", qn, [
              v[11] || (v[11] = r("label", {
                class: "ap-label",
                for: "ap-title"
              }, [
                P("Title "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              de(r("input", {
                id: "ap-title",
                "onUpdate:modelValue": v[3] || (v[3] = ($) => Z.value = $),
                class: "ap-input",
                type: "text",
                placeholder: `Give this ${_.value} a title`,
                autocomplete: "off"
              }, null, 8, zn), [
                [we, Z.value]
              ])
            ]),
            r("div", jn, [
              v[13] || (v[13] = r("label", {
                class: "ap-label",
                for: "ap-format"
              }, "Format", -1)),
              de(r("select", {
                id: "ap-format",
                "onUpdate:modelValue": v[4] || (v[4] = ($) => X.value = $),
                class: "ap-input"
              }, [...v[12] || (v[12] = [
                r("option", { value: "text/plain" }, "Plain text", -1),
                r("option", { value: "text/markdown" }, "Markdown", -1),
                r("option", { value: "text/html" }, "HTML", -1)
              ])], 512), [
                [je, X.value]
              ])
            ])
          ]),
          r("div", Kn, [
            r("div", Wn, [
              v[14] || (v[14] = r("label", {
                class: "ap-label",
                for: "ap-content"
              }, "Content", -1)),
              J.value ? (c(), d("span", Gn, x(J.value.toLocaleString()) + " chars", 1)) : I("", !0)
            ]),
            de(r("textarea", {
              id: "ap-content",
              "onUpdate:modelValue": v[5] || (v[5] = ($) => j.value = $),
              class: "ap-textarea",
              rows: "12",
              placeholder: `Paste or write the ${_.value} to add to this knowledge base…`
            }, null, 8, Hn), [
              [we, j.value]
            ])
          ]),
          r("div", Xn, [
            r("span", Jn, [
              w(l(S), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v[15] || (v[15] = P(" Content is chunked and embedded automatically.", -1))
            ]),
            r("button", {
              class: "ap-submit",
              disabled: !j.value.trim() || l(n).busy.value,
              onClick: y
            }, [
              w(l(S), {
                icon: l(n).busy.value ? "tabler:loader-2" : "tabler:upload",
                class: R(l(n).busy.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              P(" " + x(l(n).busy.value ? "Adding…" : "Add to knowledge base"), 1)
            ], 8, Qn)
          ])
        ])
      ])),
      ge.value ? (c(), d("div", Yn, [
        r("div", Zn, [
          v[16] || (v[16] = r("span", null, "Progress", -1)),
          l(n).busy.value ? I("", !0) : (c(), d("button", {
            key: 0,
            class: "ap-items-clear",
            onClick: v[6] || (v[6] = ($) => l(n).clearItems())
          }, "Clear done"))
        ]),
        r("ul", eo, [
          (c(!0), d(te, null, ne(l(n).items.value, ($) => (c(), d("li", {
            key: $.key,
            class: R(["ap-item", $.status])
          }, [
            w(l(S), {
              class: R(["ap-item-ic", ["uploading", "processing", "embedding"].includes($.status) && "spin"]),
              icon: le($.status),
              "aria-hidden": "true"
            }, null, 8, ["class", "icon"]),
            r("span", to, x($.name), 1),
            r("span", no, x($.error || g[$.status]), 1)
          ], 2))), 128))
        ])
      ])) : I("", !0)
    ]));
  }
});
export {
  mo as A,
  Ye as B,
  vo as C,
  ho as D,
  co as E,
  $e as F,
  Ge as G,
  yo as H,
  po as I,
  ae as N,
  _e as _,
  Ke as a,
  wo as b,
  io as c,
  Oo as d,
  Co as e,
  Io as f,
  Ao as g,
  Eo as h,
  ro as i,
  So as j,
  Mo as k,
  Uo as l,
  Ae as m,
  lo as n,
  To as o,
  Lo as p,
  et as q,
  ko as r,
  st as s,
  go as t,
  $o as u,
  uo as v,
  bo as w,
  xo as x,
  _o as y,
  fo as z
};
//# sourceMappingURL=AddPanel.vue_vue_type_script_setup_true_lang--444HnbT.js.map
