import { ref as b, computed as $, onBeforeUnmount as ie, watch as A, defineComponent as re, openBlock as u, createElementBlock as m, createElementVNode as c, createTextVNode as D, toDisplayString as y, createCommentVNode as T, renderSlot as he, createBlock as Y, Transition as be, withCtx as z, withModifiers as ye, normalizeClass as ae, createVNode as h, unref as e, nextTick as de, Fragment as le, renderList as se, onMounted as ge } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as oe, host as ue, loadByTagName as _e } from "@wippy-fe/proxy";
import { a as we, u as $e } from "./wc-runtime-f54Bo-yJ.js";
import { c as xe, E as ce, i as ve, s as Ce, a as Te, _ as te, u as De, b as Ee, n as ne, d as Se, e as Ne, f as Le, g as Me, h as Oe, j as Ie, k as Pe, l as Be, m as Re, o as Ve, p as Xe } from "./AddPanel.vue_vue_type_script_setup_true_lang--444HnbT.js";
import { _ as fe, c as je } from "./queryMode-B1MoVAIk.js";
const me = {
  "text/markdown": "MD",
  "text/plain": "TXT",
  "text/html": "HTML",
  "text/csv": "CSV",
  "application/json": "JSON",
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX"
};
function Ue(o) {
  const l = o.content_type || "";
  if (me[l]) return me[l];
  const g = o.metadata || {}, d = String(g.filename || g.source_url || g.title || ""), p = d.lastIndexOf(".");
  if (p > 0 && p < d.length - 1) {
    const f = d.slice(p + 1).split(/[?#]/)[0];
    if (f.length <= 5) return f.toUpperCase();
  }
  return g.source_url ? "URL" : l.startsWith("image/") ? "IMG" : "DOC";
}
function pe(o) {
  const l = o.content_type || "";
  return (o.metadata || {}).source_url ? "tabler:world" : l === "application/pdf" ? "tabler:file-type-pdf" : l === "text/markdown" ? "tabler:markdown" : l === "text/csv" || l.includes("spreadsheet") || l.includes("excel") ? "tabler:table" : l === "application/json" ? "tabler:json" : l.includes("word") || l.includes("document") ? "tabler:file-text" : l.includes("presentation") || l.includes("powerpoint") ? "tabler:presentation" : l === "text/html" ? "tabler:file-code" : l.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function ke(o) {
  if (!o) return "";
  const l = new Date(o), g = l.getTime();
  if (Number.isNaN(g)) return "";
  const d = Date.now() - g, p = Math.round(d / 1e3);
  if (p < 45) return "just now";
  const f = Math.round(p / 60);
  if (f < 60) return `${f}m ago`;
  const k = Math.round(f / 60);
  if (k < 24) return `${k}h ago`;
  const x = Math.round(k / 24);
  return x < 7 ? `${x}d ago` : l.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function qe(o) {
  if (!o) return "";
  const l = new Date(o);
  return Number.isNaN(l.getTime()) ? "" : l.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ze(o, l = {}) {
  const g = b(!1), d = b(""), p = b([]), f = b(0), k = b(50), x = b(0), E = $(() => Math.max(1, Math.ceil(x.value / k.value))), L = $(() => f.value > 0), I = $(() => f.value < E.value - 1), C = b({}), R = 2e4, S = /* @__PURE__ */ new Map();
  function V(r) {
    const s = { ...C.value };
    delete s[r], C.value = s;
    const t = S.get(r);
    t && (clearTimeout(t), S.delete(r));
  }
  const U = /* @__PURE__ */ new Set(["concept", "edge", "chunk", "summary"]);
  function H(r) {
    return Date.parse(r.updated_at || r.created_at || "") || 0;
  }
  function K(r) {
    const s = /* @__PURE__ */ new Map(), t = [];
    for (const n of r) {
      const a = xe(n);
      if (!a) {
        t.push(n);
        continue;
      }
      const i = s.get(a);
      if (i === void 0) {
        s.set(a, t.length), t.push(n);
        continue;
      }
      H(n) >= H(t[i]) && (t[i] = n);
    }
    return t;
  }
  const Z = $(() => K(p.value.filter((r) => !U.has(r.node_type || ""))));
  function F(r) {
    return Z.value.find((s) => s.id === r);
  }
  let N = 0;
  async function P() {
    const r = o();
    if (!r) return;
    const s = ++N;
    g.value = !0, d.value = "";
    try {
      const t = f.value * k.value, { data: n } = await oe.get(`/api/v1/kb10/${r}/browse?limit=${k.value}&offset=${t}`);
      if (s !== N || o() !== r) return;
      if (!n?.success) {
        d.value = n?.error && ve(n.error) ? ce : n?.error || "";
        return;
      }
      p.value = n.nodes || [], x.value = Number(n.total) || 0;
    } catch (t) {
      if (s !== N) return;
      const n = t?.response?.data?.error || t?.message || "could not load contents";
      d.value = ve(n) ? ce : n, ue.handleError(t?.response?.status === 401 ? "auth-expired" : "other", t);
    } finally {
      s === N && (g.value = !1);
    }
  }
  function W(r) {
    const s = Math.max(0, Math.min(r, E.value - 1));
    s !== f.value && (f.value = s, P());
  }
  function J() {
    I.value && W(f.value + 1);
  }
  function _() {
    L.value && W(f.value - 1);
  }
  async function X(r) {
    const s = o();
    if (!s || C.value[r.id]) return !1;
    const t = Te(r);
    if (!t)
      return d.value = "This document has no durable source identity and cannot be deleted here.", !1;
    C.value = { ...C.value, [r.id]: !0 };
    let n = !1;
    try {
      const { data: a } = await oe.delete(`/api/v1/knowledge/${s}/content`, { data: t });
      a?.success ? (n = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = a?.error || "could not queue delete";
    } catch (a) {
      d.value = a?.response?.data?.error || a?.message || "could not queue delete", ue.handleError(a?.response?.status === 401 ? "auth-expired" : "other", a);
    } finally {
      if (!n)
        V(r.id);
      else {
        const a = r.id;
        S.set(a, setTimeout(() => {
          C.value[a] && (V(a), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, R));
      }
    }
    return n;
  }
  function q() {
    const r = Object.keys(C.value);
    if (r.length === 0) return;
    const s = new Set(p.value.map((n) => n.id)), t = r.filter((n) => !s.has(n));
    if (t.length) {
      for (const n of t) V(n);
      Object.keys(C.value).length || (d.value = ""), l.onChanged?.();
    }
  }
  let j = !1, B = !1;
  async function M() {
    if (j) {
      B = !0;
      return;
    }
    j = !0;
    try {
      do
        B = !1, await P(), q();
      while (B);
    } finally {
      j = !1;
    }
  }
  let w = null, Q = 0;
  function G(r) {
    const s = ++Q;
    if (w && (w(), w = null), !r) return;
    const t = Ce(r, () => {
      M();
    });
    if (s !== Q) {
      t && t();
      return;
    }
    w = t;
  }
  return ie(() => {
    Q++, N++, w && w(), S.forEach((r) => clearTimeout(r)), S.clear();
  }), A(o, (r) => {
    f.value = 0, x.value = 0, P(), G(r);
  }, { immediate: !0 }), {
    loading: g,
    notice: d,
    nodes: p,
    documents: Z,
    deleting: C,
    load: P,
    reload: P,
    remove: X,
    findDoc: F,
    page: f,
    pageSize: k,
    total: x,
    pageCount: E,
    hasPrev: L,
    hasNext: I,
    next: J,
    prev: _,
    goToPage: W
  };
}
const Ae = { class: "kx-railhead" }, Ke = { class: "kx-railhead-title" }, Ge = { key: 0 }, He = { class: "kx-railhead-acts" }, Fe = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(o) {
    return (l, g) => (u(), m("div", Ae, [
      c("span", Ke, [
        D(y(o.title), 1),
        o.count !== void 0 ? (u(), m("b", Ge, y(o.count), 1)) : T("", !0)
      ]),
      c("div", He, [
        he(l.$slots, "actions")
      ])
    ]));
  }
}), We = ["aria-label"], Je = { class: "kx-modal-h" }, Qe = { class: "kx-modal-h-ico" }, Ye = { class: "kx-modal-h-text" }, Ze = { class: "kx-modal-h-title" }, et = {
  key: 0,
  class: "kx-modal-h-sub"
}, tt = { class: "kx-modal-body" }, nt = { class: "kx-modal-foot" }, at = /* @__PURE__ */ re({
  __name: "KbConfirm",
  props: {
    open: { type: Boolean },
    title: {},
    subtitle: {},
    icon: { default: "tabler:alert-circle" },
    danger: { type: Boolean },
    busy: { type: Boolean },
    confirmLabel: { default: "Confirm" },
    cancelLabel: { default: "Cancel" }
  },
  emits: ["confirm", "cancel"],
  setup(o, { emit: l }) {
    const g = o, d = l;
    function p(f) {
      f.key === "Escape" && !g.busy && d("cancel");
    }
    return A(() => g.open, (f) => {
      f ? window.addEventListener("keydown", p) : window.removeEventListener("keydown", p);
    }), ie(() => window.removeEventListener("keydown", p)), (f, k) => (u(), Y(be, { name: "kx-modal" }, {
      default: z(() => [
        o.open ? (u(), m("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: k[3] || (k[3] = ye((x) => !o.busy && d("cancel"), ["self"]))
        }, [
          c("div", {
            class: ae(["kx-modal", { danger: o.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": o.title
          }, [
            c("div", Je, [
              c("span", Qe, [
                h(e(O), {
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              c("span", Ye, [
                c("span", Ze, y(o.title), 1),
                o.subtitle ? (u(), m("span", et, y(o.subtitle), 1)) : T("", !0)
              ]),
              h(te, {
                icon: "tabler:x",
                label: "Close",
                disabled: o.busy,
                onClick: k[0] || (k[0] = (x) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            c("div", tt, [
              he(f.$slots, "default")
            ]),
            c("div", nt, [
              h(fe, {
                variant: "ghost",
                disabled: o.busy,
                onClick: k[1] || (k[1] = (x) => d("cancel"))
              }, {
                default: z(() => [
                  D(y(o.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              h(fe, {
                variant: o.danger ? "danger" : "primary",
                loading: o.busy,
                disabled: o.busy,
                onClick: k[2] || (k[2] = (x) => d("confirm"))
              }, {
                default: z(() => [
                  D(y(o.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, We)
        ])) : T("", !0)
      ]),
      _: 3
    }));
  }
}), lt = { class: "dr" }, ot = { class: "dr-head" }, st = { class: "dr-badge" }, it = { class: "dr-head-body" }, rt = { class: "dr-head-top" }, ut = { class: "dr-title" }, dt = { class: "dr-facts" }, ct = {
  key: 0,
  class: "dr-fact"
}, vt = {
  key: 1,
  class: "dr-fact"
}, ft = ["title"], mt = ["href"], ht = {
  key: 0,
  class: "dr-skel"
}, pt = {
  key: 1,
  class: "dr-state err"
}, kt = {
  key: 0,
  class: "dr-doc"
}, bt = { class: "dr-doc-main" }, yt = ["content-type", "source", "filename"], gt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, _t = ["aria-expanded"], wt = {
  key: 3,
  class: "dr-state"
}, $t = {
  key: 1,
  class: "dr-chunks"
}, xt = {
  key: 0,
  class: "dr-state"
}, Ct = ["aria-expanded", "onClick"], Tt = { class: "dr-chunk-n" }, Dt = { class: "dr-chunk-label" }, Et = {
  key: 0,
  class: "dr-chunk-cx"
}, St = 720, Nt = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(o) {
    const l = o, g = b(!1), d = b(""), p = b(""), f = b(""), k = b([]), x = b(0), E = b(""), L = b("read"), I = b(!1), C = b({});
    function R(s) {
      return String((s.metadata || {}).contextual_prefix || "");
    }
    const S = $(() => l.node.metadata || {}), V = $(() => S.value.source_url), U = $(() => f.value || l.node.content_type || "text/markdown"), H = $(() => String(S.value.original_mime_type || S.value.source_mime || "")), K = $(() => De(S.value) ? Ee(H.value || l.node.content_type || "") : !1), Z = $(() => `/api/v1/kb10/${l.kbId}/nodes/${l.node.id}/source`), F = $(() => String(S.value.filename || S.value.original_filename || "")), N = $(() => p.value ? p.value : k.value.map((s) => s.content).filter(Boolean).join(`

`)), P = $(() => {
      const s = N.value.trim();
      return s ? s.split(/\s+/).length : 0;
    });
    function W() {
      K.value && (I.value = !I.value);
    }
    const J = b(null), _ = b(!1), X = b(!1);
    function q() {
      const s = J.value;
      if (!s) {
        X.value = !1;
        return;
      }
      X.value = s.scrollHeight - St > 24;
    }
    let j = null;
    function B() {
      j?.disconnect();
      const s = J.value;
      s && (j = new ResizeObserver(() => q()), j.observe(s), de(q));
    }
    const M = $(() => X.value && !_.value);
    let w = 0;
    async function Q() {
      if (!l.kbId || !l.node?.id) return;
      const s = ++w;
      g.value = !0, d.value = "", p.value = "", f.value = "", k.value = [], x.value = 0, E.value = "", L.value = "read", C.value = {}, _.value = !1, X.value = !1;
      try {
        const [{ data: t }, { data: n }, { data: a }] = await Promise.all([
          oe.get(`/api/v1/kb10/${l.kbId}/browse?node_id=${l.node.id}`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=chunk&include_content=true&limit=200`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (s !== w) return;
        if (t?.success && t.node && (p.value = String(t.node.content || ""), f.value = String(t.node.content_type || "")), n?.success) {
          if (!Number.isInteger(n.total) || n.total < 0) throw new Error("Invalid chunk total");
          x.value = n.total;
          const i = n.nodes;
          if (k.value = i.filter((v) => v.node_type === "chunk").sort((v, ee) => Number((v.metadata || {}).index ?? (v.metadata || {}).chunk_index ?? 0) - Number((ee.metadata || {}).index ?? (ee.metadata || {}).chunk_index ?? 0)), !a?.success) throw new Error(a?.error || "could not load summary");
          E.value = a.nodes[0]?.content || "", p.value || (p.value = E.value || l.node.content || "");
        }
        !t?.success && !n?.success && (d.value = t?.error || n?.error || "could not load document");
      } catch (t) {
        if (s !== w) return;
        d.value = t?.response?.data?.error || t?.message || "could not load document", ue.handleError(t?.response?.status === 401 ? "auth-expired" : "other", t);
      } finally {
        s === w && (g.value = !1);
      }
    }
    const G = $(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: x.value || void 0 }
    ]);
    function r(s) {
      C.value = { ...C.value, [s.id]: !C.value[s.id] };
    }
    return A([N, L, g], () => {
      L.value === "read" && !g.value && de(B);
    }), A(K, (s) => {
      s || (I.value = !1);
    }), A(() => l.node?.id, () => Q(), { immediate: !0 }), ie(() => {
      j?.disconnect();
    }), (s, t) => (u(), m("div", lt, [
      c("header", ot, [
        c("span", st, [
          h(e(O), {
            icon: e(pe)(o.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        c("div", it, [
          c("div", rt, [
            c("h2", ut, y(e(ne)(o.node)), 1),
            K.value ? (u(), Y(e(Se), {
              key: 0,
              class: ae(["dr-orig-btn", { on: I.value }]),
              label: I.value ? "Hide original" : "View original",
              onOpen: W
            }, null, 8, ["class", "label"])) : T("", !0)
          ]),
          c("div", dt, [
            x.value ? (u(), m("span", ct, [
              h(e(O), { icon: "tabler:layout-grid" }),
              D(y(x.value.toLocaleString()) + " chunks", 1)
            ])) : T("", !0),
            P.value ? (u(), m("span", vt, [
              h(e(O), { icon: "tabler:align-left" }),
              D(y(P.value.toLocaleString()) + " words", 1)
            ])) : T("", !0),
            o.node.created_at ? (u(), m("span", {
              key: 2,
              class: "dr-fact",
              title: e(qe)(o.node.created_at)
            }, [
              h(e(O), { icon: "tabler:clock" }),
              D(y(e(ke)(o.node.created_at)), 1)
            ], 8, ft)) : T("", !0),
            V.value ? (u(), m("a", {
              key: 3,
              class: "dr-fact link",
              href: V.value,
              target: "_blank",
              rel: "noopener"
            }, [
              h(e(O), { icon: "tabler:external-link" }),
              t[3] || (t[3] = D("Source", -1))
            ], 8, mt)) : T("", !0)
          ])
        ])
      ]),
      h(e(Ne), {
        tabs: G.value,
        active: L.value,
        onSelect: t[0] || (t[0] = (n) => L.value = n)
      }, null, 8, ["tabs", "active"]),
      g.value ? (u(), m("div", ht, [
        (u(), m(le, null, se(6, (n) => c("div", {
          key: n,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (u(), m("div", pt, [
        h(e(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        D(" " + y(d.value), 1)
      ])) : (u(), m(le, { key: 2 }, [
        L.value === "read" ? (u(), m("div", kt, [
          c("div", bt, [
            E.value ? (u(), Y(e(Le), {
              key: 0,
              text: E.value
            }, null, 8, ["text"])) : T("", !0),
            N.value ? (u(), m("div", {
              key: 1,
              class: ae(["dr-clamp", { clamped: M.value }])
            }, [
              c("div", {
                ref_key: "bodyRef",
                ref: J,
                class: "dr-clamp-inner"
              }, [
                c("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": U.value,
                  source: N.value,
                  filename: F.value
                }, null, 8, yt)
              ], 512),
              M.value ? (u(), m("div", gt)) : T("", !0)
            ], 2)) : T("", !0),
            X.value ? (u(), m("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": _.value,
              onClick: t[1] || (t[1] = (n) => _.value = !_.value)
            }, [
              h(e(O), {
                icon: _.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              D(" " + y(_.value ? "Show less" : "Show more"), 1)
            ], 8, _t)) : T("", !0),
            N.value ? T("", !0) : (u(), m("div", wt, [
              h(e(O), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              t[4] || (t[4] = D(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (u(), m("div", $t, [
          k.value.length ? T("", !0) : (u(), m("div", xt, [
            h(e(O), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            t[5] || (t[5] = D(" This document has no chunks.", -1))
          ])),
          (u(!0), m(le, null, se(k.value, (n, a) => (u(), m("div", {
            key: n.id,
            class: ae(["dr-chunk", { open: C.value[n.id] }])
          }, [
            c("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!C.value[n.id],
              onClick: (i) => r(n)
            }, [
              c("span", Tt, y(a + 1), 1),
              c("span", Dt, "Chunk " + y(a + 1), 1),
              h(e(O), {
                class: "dr-chunk-chev",
                icon: C.value[n.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Ct),
            R(n) ? (u(), m("p", Et, [
              h(e(O), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              c("span", null, y(R(n)), 1)
            ])) : T("", !0),
            c("p", {
              class: ae(["dr-chunk-body", { clamp: !C.value[n.id] }])
            }, y(n.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      h(e(Me), {
        contained: "",
        open: I.value && K.value,
        title: F.value || "Original",
        "content-type": H.value || o.node.content_type || "",
        "source-url": Z.value,
        filename: F.value,
        onClose: t[2] || (t[2] = (n) => I.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Lt = { class: "kb-page kd" }, Mt = { class: "kd-filter" }, Ot = {
  class: "kd-list",
  "aria-label": "Documents"
}, It = {
  key: 0,
  class: "kd-list-skel"
}, Pt = ["onClick"], Bt = { class: "kd-row-ic" }, Rt = { class: "kd-row-main" }, Vt = { class: "kd-row-title" }, Xt = { class: "kd-row-sub" }, jt = {
  key: 1,
  class: "kd-list-empty"
}, Ut = {
  key: 0,
  class: "kd-pager"
}, qt = { class: "kd-pager-label" }, zt = { class: "kx-main-scroll kd-reader" }, At = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(o) {
    const l = we(), g = $e(), d = $(() => l.value.config?.kb_id || ""), p = $(() => l.value.config?.route || "");
    let f = !1;
    const {
      loading: k,
      notice: x,
      documents: E,
      deleting: L,
      reload: I,
      remove: C,
      findDoc: R,
      page: S,
      pageSize: V,
      total: U,
      hasPrev: H,
      hasNext: K,
      next: Z,
      prev: F
    } = ze(() => d.value), N = b(""), P = $(() => {
      const a = N.value.trim().toLowerCase();
      return a ? E.value.filter((i) => ne(i).toLowerCase().includes(a)) : E.value;
    }), W = $(() => U.value === 0 ? 0 : S.value * V.value + 1), J = $(() => Math.min((S.value + 1) * V.value, U.value)), _ = b(""), X = $(() => R(_.value) || null), q = b(!1);
    async function j() {
      if (!d.value) {
        q.value = !1;
        return;
      }
      try {
        const { data: a } = await oe.get(`/api/v1/knowledge/${d.value}`), i = a?.config || {};
        q.value = je(i);
      } catch {
        q.value = !1;
      }
    }
    A(d, j, { immediate: !0 });
    const B = b(!1), M = b(!1), w = b(null), Q = $(() => !!w.value && !!L.value[w.value.id]);
    function G(a) {
      const i = _.value !== a.id;
      _.value = a.id, i && !f && g("navigate", a.id);
    }
    function r(a) {
      const i = R(a);
      i && (G(i), M.value = !1);
    }
    function s(a) {
      w.value = a;
    }
    async function t() {
      const a = w.value;
      if (!a) return;
      await C(a) && (_.value === a.id && (_.value = ""), w.value = null);
    }
    function n(a) {
      a.key === "Escape" && M.value && (M.value = !1);
    }
    return ge(() => {
      window.addEventListener("keydown", n), _e("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", n)), A(E, (a) => {
      if (!a.length) {
        _.value && !R(_.value) && (_.value = "");
        return;
      }
      if (_.value && R(_.value)) return;
      const v = (p.value ? a.find((ee) => ee.id === p.value) : null) || a[0];
      if (v) {
        f = !0;
        try {
          G(v);
        } finally {
          f = !1;
        }
      }
    }), A(d, () => {
      _.value = "";
    }), A(p, (a) => {
      if (!a || a === _.value) return;
      const i = R(a);
      if (i) {
        f = !0;
        try {
          G(i);
        } finally {
          f = !1;
        }
      }
    }), (a, i) => (u(), m("div", Lt, [
      e(x) ? (u(), Y(e(Oe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: z(() => [
          D(y(e(x)), 1)
        ]),
        _: 1
      })) : T("", !0),
      h(e(Ie), null, {
        rail: z(() => [
          h(e(Fe), {
            title: "Documents",
            count: e(U)
          }, {
            actions: z(() => [
              h(e(te), {
                icon: "tabler:search",
                label: "Search",
                active: M.value,
                onClick: i[0] || (i[0] = (v) => M.value = !M.value)
              }, null, 8, ["active"]),
              h(e(te), {
                icon: "tabler:plus",
                label: "Add document",
                active: B.value,
                onClick: i[1] || (i[1] = (v) => B.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          c("div", Mt, [
            h(e(Re), {
              modelValue: N.value,
              "onUpdate:modelValue": i[2] || (i[2] = (v) => N.value = v),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          c("nav", Ot, [
            e(k) && !e(E).length ? (u(), m("div", It, [
              (u(), m(le, null, se(6, (v) => c("div", {
                key: v,
                class: "kd-skel-row"
              })), 64))
            ])) : T("", !0),
            (u(!0), m(le, null, se(P.value, (v) => (u(), m("button", {
              key: v.id,
              class: ae(["kd-row", { on: _.value === v.id }]),
              onClick: (ee) => G(v)
            }, [
              c("span", Bt, [
                h(e(O), {
                  icon: e(pe)(v),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              c("span", Rt, [
                c("span", Vt, y(e(ne)(v)), 1),
                c("span", Xt, [
                  D(y(e(Ue)(v)), 1),
                  v.created_at ? (u(), m(le, { key: 0 }, [
                    D(" · " + y(e(ke)(v.created_at)), 1)
                  ], 64)) : T("", !0)
                ])
              ]),
              h(e(te), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(ne)(v)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(L)[v.id],
                disabled: !!e(L)[v.id],
                onClick: (ee) => s(v)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, Pt))), 128)),
            !e(k) && !P.value.length ? (u(), m("div", jt, y(e(E).length ? "No documents match." : "No documents yet — add one with +."), 1)) : T("", !0)
          ]),
          e(U) > e(V) ? (u(), m("div", Ut, [
            h(e(te), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(H),
              onClick: e(F)
            }, null, 8, ["disabled", "onClick"]),
            c("span", qt, y(W.value) + "–" + y(J.value) + " of " + y(e(U)), 1),
            h(e(te), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(K),
              onClick: e(Z)
            }, null, 8, ["disabled", "onClick"])
          ])) : T("", !0)
        ]),
        default: z(() => [
          c("div", zt, [
            M.value ? (u(), Y(e(Pe), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: q.value,
              onOpen: i[3] || (i[3] = (v) => v.parent_id && r(v.parent_id)),
              onClose: i[4] || (i[4] = (v) => M.value = !1)
            }, null, 8, ["kb-id", "ask"])) : X.value ? (u(), Y(Nt, {
              key: 1,
              "kb-id": d.value,
              node: X.value
            }, null, 8, ["kb-id", "node"])) : (u(), Y(Be, {
              key: 2,
              class: "kd-empty",
              icon: "tabler:files",
              title: "Select a document",
              hint: "Pick a document from the list to read it here.",
              tone: "muted"
            }))
          ])
        ]),
        _: 1
      }),
      h(e(Ve), {
        open: B.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: i[6] || (i[6] = (v) => B.value = !1)
      }, {
        default: z(() => [
          h(Xe, {
            "kb-id": d.value,
            noun: "document",
            onChanged: i[5] || (i[5] = (v) => {
              B.value = !1, e(I)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      h(e(at), {
        open: !!w.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: w.value ? e(ne)(w.value) : "",
        "confirm-label": "Delete",
        busy: Q.value,
        onCancel: i[7] || (i[7] = (v) => w.value = null),
        onConfirm: t
      }, {
        default: z(() => [
          i[8] || (i[8] = D(" Remove ", -1)),
          c("strong", null, y(w.value ? e(ne)(w.value) : ""), 1),
          i[9] || (i[9] = D(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Qt = {
  rootComponent: At
};
export {
  Qt as mountConfig
};
//# sourceMappingURL=document-mount-hgDftATX.js.map
