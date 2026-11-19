import { ref as p, computed as $, onBeforeUnmount as ie, watch as Q, defineComponent as re, openBlock as i, createElementBlock as v, createElementVNode as r, createTextVNode as S, toDisplayString as k, createCommentVNode as x, renderSlot as pe, createBlock as J, Transition as ye, withCtx as U, withModifiers as ge, normalizeClass as ae, createVNode as m, unref as e, nextTick as de, Fragment as le, renderList as se, onMounted as _e } from "vue";
import { Icon as P } from "@iconify/vue";
import { api as oe, host as ue, loadByTagName as we } from "@wippy-fe/proxy";
import { a as xe, u as $e } from "./wc-runtime-f54Bo-yJ.js";
import { E as ce, i as ve, f as Ce, s as Ne, c as Te, _ as te, u as Ee, a as Se, n as ne, b as De, d as Le, e as Me, g as Ie, h as fe, j as Oe, k as Pe, l as Be, m as Re, o as Ve, p as je } from "./AddPanel.vue_vue_type_script_setup_true_lang-DfhPpnfo.js";
import { _ as me } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const he = {
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
function Xe(l) {
  const t = l.content_type || "";
  if (he[t]) return he[t];
  const y = l.metadata || {}, d = String(y.filename || y.source_url || y.title || ""), b = d.lastIndexOf(".");
  if (b > 0 && b < d.length - 1) {
    const h = d.slice(b + 1).split(/[?#]/)[0];
    if (h.length <= 5) return h.toUpperCase();
  }
  return y.source_url ? "URL" : t.startsWith("image/") ? "IMG" : "DOC";
}
function ke(l) {
  const t = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : t === "application/pdf" ? "tabler:file-type-pdf" : t === "text/markdown" ? "tabler:markdown" : t === "text/csv" || t.includes("spreadsheet") || t.includes("excel") ? "tabler:table" : t === "application/json" ? "tabler:json" : t.includes("word") || t.includes("document") ? "tabler:file-text" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:presentation" : t === "text/html" ? "tabler:file-code" : t.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function be(l) {
  if (!l) return "";
  const t = new Date(l), y = t.getTime();
  if (Number.isNaN(y)) return "";
  const d = Date.now() - y, b = Math.round(d / 1e3);
  if (b < 45) return "just now";
  const h = Math.round(b / 60);
  if (h < 60) return `${h}m ago`;
  const c = Math.round(h / 60);
  if (c < 24) return `${c}h ago`;
  const C = Math.round(c / 24);
  return C < 7 ? `${C}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function qe(l) {
  if (!l) return "";
  const t = new Date(l);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ze(l, t = {}) {
  const y = p(!1), d = p(""), b = p(""), h = p([]), c = p(0), C = p(50), M = p(0), D = $(() => Math.max(1, Math.ceil(M.value / C.value))), N = $(() => c.value > 0), I = $(() => c.value < D.value - 1), L = p({}), O = 2e4, R = /* @__PURE__ */ new Map();
  function A(u) {
    const g = { ...L.value };
    delete g[u], L.value = g;
    const _ = R.get(u);
    _ && (clearTimeout(_), R.delete(u));
  }
  const V = h;
  function F(u) {
    return V.value.find((g) => g.id === u);
  }
  let K = 0;
  async function j() {
    const u = l();
    if (!u) return;
    const g = ++K;
    y.value = !0, d.value = "";
    try {
      const _ = c.value * C.value, s = t.includeIndexing ? "&include_indexing=true" : "", { data: a } = await oe.get(`/api/v1/kb10/${u}/browse?node_type=document&limit=${C.value}&offset=${_}${s}`);
      if (g !== K || l() !== u) return;
      if (!a?.success) {
        d.value = a?.error && ve(a.error) ? ce : a?.error || "";
        return;
      }
      h.value = a.nodes || [], M.value = Number(a.total) || 0, b.value = Ce(a.pending_source);
    } catch (_) {
      if (g !== K) return;
      const s = _?.response?.data?.error || _?.message || "could not load contents";
      d.value = ve(s) ? ce : s, ue.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
    } finally {
      g === K && (y.value = !1);
    }
  }
  function X(u) {
    const g = Math.max(0, Math.min(u, D.value - 1));
    g !== c.value && (c.value = g, j());
  }
  function G() {
    I.value && X(c.value + 1);
  }
  function Z() {
    N.value && X(c.value - 1);
  }
  async function Y(u) {
    const g = l();
    if (!g || L.value[u.id]) return !1;
    const _ = Te(u);
    L.value = { ...L.value, [u.id]: !0 };
    let s = !1;
    try {
      const { data: a } = await oe.delete(`/api/v1/knowledge/${g}/content`, { data: _ });
      a?.success ? (s = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = a?.error || "could not queue delete";
    } catch (a) {
      d.value = a?.response?.data?.error || a?.message || "could not queue delete", ue.handleError(a?.response?.status === 401 ? "auth-expired" : "other", a);
    } finally {
      if (!s)
        A(u.id);
      else {
        const a = u.id;
        R.set(a, setTimeout(() => {
          L.value[a] && (A(a), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, O));
      }
    }
    return s;
  }
  function q() {
    const u = Object.keys(L.value);
    if (u.length === 0) return;
    const g = new Set(h.value.map((s) => s.id)), _ = u.filter((s) => !g.has(s));
    if (_.length) {
      for (const s of _) A(s);
      Object.keys(L.value).length || (d.value = ""), t.onChanged?.();
    }
  }
  let w = !1, z = !1;
  async function B() {
    if (w) {
      z = !0;
      return;
    }
    w = !0;
    try {
      do
        z = !1, await j(), q();
      while (z);
    } finally {
      w = !1;
    }
  }
  let E = null, T = 0;
  function W(u) {
    const g = ++T;
    if (E && (E(), E = null), !u) return;
    const _ = Ne(u, () => {
      B();
    });
    if (g !== T) {
      _ && _();
      return;
    }
    E = _;
  }
  return ie(() => {
    T++, K++, E && E(), R.forEach((u) => clearTimeout(u)), R.clear();
  }), Q(l, (u) => {
    c.value = 0, M.value = 0, b.value = "", j(), W(u);
  }, { immediate: !0 }), {
    loading: y,
    notice: d,
    indexingNotice: b,
    nodes: h,
    documents: V,
    deleting: L,
    load: j,
    reload: j,
    remove: Y,
    findDoc: F,
    page: c,
    pageSize: C,
    total: M,
    pageCount: D,
    hasPrev: N,
    hasNext: I,
    next: G,
    prev: Z,
    goToPage: X
  };
}
const Ue = { class: "kx-railhead" }, Ae = { class: "kx-railhead-title" }, Ke = { key: 0 }, He = { class: "kx-railhead-acts" }, Fe = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (t, y) => (i(), v("div", Ue, [
      r("span", Ae, [
        S(k(l.title), 1),
        l.count !== void 0 ? (i(), v("b", Ke, k(l.count), 1)) : x("", !0)
      ]),
      r("div", He, [
        pe(t.$slots, "actions")
      ])
    ]));
  }
}), Ge = ["aria-label"], We = { class: "kx-modal-h" }, Je = { class: "kx-modal-h-ico" }, Qe = { class: "kx-modal-h-text" }, Ye = { class: "kx-modal-h-title" }, Ze = {
  key: 0,
  class: "kx-modal-h-sub"
}, et = { class: "kx-modal-body" }, tt = { class: "kx-modal-foot" }, nt = /* @__PURE__ */ re({
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
  setup(l, { emit: t }) {
    const y = l, d = t;
    function b(h) {
      h.key === "Escape" && !y.busy && d("cancel");
    }
    return Q(() => y.open, (h) => {
      h ? window.addEventListener("keydown", b) : window.removeEventListener("keydown", b);
    }), ie(() => window.removeEventListener("keydown", b)), (h, c) => (i(), J(ye, { name: "kx-modal" }, {
      default: U(() => [
        l.open ? (i(), v("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: c[3] || (c[3] = ge((C) => !l.busy && d("cancel"), ["self"]))
        }, [
          r("div", {
            class: ae(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            r("div", We, [
              r("span", Je, [
                m(e(P), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", Qe, [
                r("span", Ye, k(l.title), 1),
                l.subtitle ? (i(), v("span", Ze, k(l.subtitle), 1)) : x("", !0)
              ]),
              m(te, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: c[0] || (c[0] = (C) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            r("div", et, [
              pe(h.$slots, "default")
            ]),
            r("div", tt, [
              m(me, {
                variant: "ghost",
                disabled: l.busy,
                onClick: c[1] || (c[1] = (C) => d("cancel"))
              }, {
                default: U(() => [
                  S(k(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              m(me, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: c[2] || (c[2] = (C) => d("confirm"))
              }, {
                default: U(() => [
                  S(k(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, Ge)
        ])) : x("", !0)
      ]),
      _: 3
    }));
  }
}), at = { class: "dr" }, lt = { class: "dr-head" }, ot = { class: "dr-badge" }, st = { class: "dr-head-body" }, it = { class: "dr-head-top" }, rt = { class: "dr-title" }, ut = { class: "dr-facts" }, dt = {
  key: 0,
  class: "dr-fact"
}, ct = {
  key: 1,
  class: "dr-fact"
}, vt = ["title"], ft = ["href"], mt = {
  key: 0,
  class: "dr-skel"
}, ht = {
  key: 1,
  class: "dr-state err"
}, pt = {
  key: 0,
  class: "dr-doc"
}, kt = { class: "dr-doc-main" }, bt = ["content-type", "source", "filename"], yt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, gt = ["aria-expanded"], _t = {
  key: 3,
  class: "dr-state"
}, wt = {
  key: 1,
  class: "dr-chunks"
}, xt = {
  key: 0,
  class: "dr-state"
}, $t = ["aria-expanded", "onClick"], Ct = { class: "dr-chunk-n" }, Nt = { class: "dr-chunk-label" }, Tt = {
  key: 0,
  class: "dr-chunk-cx"
}, Et = 720, St = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const t = l, y = p(!1), d = p(""), b = p(""), h = p(""), c = p([]), C = p(0), M = p(""), D = p("read"), N = p(!1), I = p({});
    function L(s) {
      return String((s.metadata || {}).contextual_prefix || "");
    }
    const O = $(() => t.node.metadata || {}), R = $(() => O.value.source_url), A = $(() => h.value || t.node.content_type || "text/markdown"), V = $(() => String(O.value.original_mime_type || O.value.source_mime || "")), F = $(() => Ee(O.value) ? Se(V.value || t.node.content_type || "") : !1), K = $(() => `/api/v1/kb10/${t.kbId}/nodes/${t.node.id}/source`), j = $(() => String(O.value.filename || O.value.original_filename || "")), X = $(() => b.value ? b.value : c.value.map((s) => s.content).filter(Boolean).join(`

`)), G = $(() => {
      const s = X.value.trim();
      return s ? s.split(/\s+/).length : 0;
    });
    function Z() {
      F.value && (N.value = !N.value);
    }
    const Y = p(null), q = p(!1), w = p(!1);
    function z() {
      const s = Y.value;
      if (!s) {
        w.value = !1;
        return;
      }
      w.value = s.scrollHeight - Et > 24;
    }
    let B = null;
    function E() {
      B?.disconnect();
      const s = Y.value;
      s && (B = new ResizeObserver(() => z()), B.observe(s), de(z));
    }
    const T = $(() => w.value && !q.value);
    let W = 0;
    async function u() {
      if (!t.kbId || !t.node?.id) return;
      const s = ++W;
      y.value = !0, d.value = "", b.value = "", h.value = "", c.value = [], C.value = 0, M.value = "", D.value = "read", I.value = {}, q.value = !1, w.value = !1;
      try {
        const [{ data: a }, { data: n }, { data: o }] = await Promise.all([
          oe.get(`/api/v1/kb10/${t.kbId}/browse?node_id=${t.node.id}`),
          oe.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=chunk&include_content=true&limit=200`),
          oe.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (s !== W) return;
        if (a?.success && a.node && (b.value = String(a.node.content || ""), h.value = String(a.node.content_type || "")), n?.success) {
          if (!Number.isInteger(n.total) || n.total < 0) throw new Error("Invalid chunk total");
          C.value = n.total;
          const f = n.nodes;
          if (c.value = f.filter((H) => H.node_type === "chunk").sort((H, ee) => Number((H.metadata || {}).index ?? (H.metadata || {}).chunk_index ?? 0) - Number((ee.metadata || {}).index ?? (ee.metadata || {}).chunk_index ?? 0)), !o?.success) throw new Error(o?.error || "could not load summary");
          M.value = o.nodes[0]?.content || "", b.value || (b.value = M.value || t.node.content || "");
        }
        !a?.success && !n?.success && (d.value = a?.error || n?.error || "could not load document");
      } catch (a) {
        if (s !== W) return;
        d.value = a?.response?.data?.error || a?.message || "could not load document", ue.handleError(a?.response?.status === 401 ? "auth-expired" : "other", a);
      } finally {
        s === W && (y.value = !1);
      }
    }
    const g = $(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: C.value || void 0 }
    ]);
    function _(s) {
      I.value = { ...I.value, [s.id]: !I.value[s.id] };
    }
    return Q([X, D, y], () => {
      D.value === "read" && !y.value && de(E);
    }), Q(F, (s) => {
      s || (N.value = !1);
    }), Q(() => t.node?.id, () => u(), { immediate: !0 }), ie(() => {
      B?.disconnect();
    }), (s, a) => (i(), v("div", at, [
      r("header", lt, [
        r("span", ot, [
          m(e(P), {
            icon: e(ke)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        r("div", st, [
          r("div", it, [
            r("h2", rt, k(e(ne)(l.node)), 1),
            F.value ? (i(), J(e(De), {
              key: 0,
              class: ae(["dr-orig-btn", { on: N.value }]),
              label: N.value ? "Hide original" : "View original",
              onOpen: Z
            }, null, 8, ["class", "label"])) : x("", !0)
          ]),
          r("div", ut, [
            C.value ? (i(), v("span", dt, [
              m(e(P), { icon: "tabler:layout-grid" }),
              S(k(C.value.toLocaleString()) + " chunks", 1)
            ])) : x("", !0),
            G.value ? (i(), v("span", ct, [
              m(e(P), { icon: "tabler:align-left" }),
              S(k(G.value.toLocaleString()) + " words", 1)
            ])) : x("", !0),
            l.node.created_at ? (i(), v("span", {
              key: 2,
              class: "dr-fact",
              title: e(qe)(l.node.created_at)
            }, [
              m(e(P), { icon: "tabler:clock" }),
              S(k(e(be)(l.node.created_at)), 1)
            ], 8, vt)) : x("", !0),
            R.value ? (i(), v("a", {
              key: 3,
              class: "dr-fact link",
              href: R.value,
              target: "_blank",
              rel: "noopener"
            }, [
              m(e(P), { icon: "tabler:external-link" }),
              a[3] || (a[3] = S("Source", -1))
            ], 8, ft)) : x("", !0)
          ])
        ])
      ]),
      m(e(Le), {
        tabs: g.value,
        active: D.value,
        onSelect: a[0] || (a[0] = (n) => D.value = n)
      }, null, 8, ["tabs", "active"]),
      y.value ? (i(), v("div", mt, [
        (i(), v(le, null, se(6, (n) => r("div", {
          key: n,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (i(), v("div", ht, [
        m(e(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        S(" " + k(d.value), 1)
      ])) : (i(), v(le, { key: 2 }, [
        D.value === "read" ? (i(), v("div", pt, [
          r("div", kt, [
            M.value ? (i(), J(e(Me), {
              key: 0,
              text: M.value
            }, null, 8, ["text"])) : x("", !0),
            X.value ? (i(), v("div", {
              key: 1,
              class: ae(["dr-clamp", { clamped: T.value }])
            }, [
              r("div", {
                ref_key: "bodyRef",
                ref: Y,
                class: "dr-clamp-inner"
              }, [
                r("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": A.value,
                  source: X.value,
                  filename: j.value
                }, null, 8, bt)
              ], 512),
              T.value ? (i(), v("div", yt)) : x("", !0)
            ], 2)) : x("", !0),
            w.value ? (i(), v("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": q.value,
              onClick: a[1] || (a[1] = (n) => q.value = !q.value)
            }, [
              m(e(P), {
                icon: q.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              S(" " + k(q.value ? "Show less" : "Show more"), 1)
            ], 8, gt)) : x("", !0),
            X.value ? x("", !0) : (i(), v("div", _t, [
              m(e(P), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              a[4] || (a[4] = S(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (i(), v("div", wt, [
          c.value.length ? x("", !0) : (i(), v("div", xt, [
            m(e(P), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            a[5] || (a[5] = S(" This document has no chunks.", -1))
          ])),
          (i(!0), v(le, null, se(c.value, (n, o) => (i(), v("div", {
            key: n.id,
            class: ae(["dr-chunk", { open: I.value[n.id] }])
          }, [
            r("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!I.value[n.id],
              onClick: (f) => _(n)
            }, [
              r("span", Ct, k(o + 1), 1),
              r("span", Nt, "Chunk " + k(o + 1), 1),
              m(e(P), {
                class: "dr-chunk-chev",
                icon: I.value[n.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, $t),
            L(n) ? (i(), v("p", Tt, [
              m(e(P), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              r("span", null, k(L(n)), 1)
            ])) : x("", !0),
            r("p", {
              class: ae(["dr-chunk-body", { clamp: !I.value[n.id] }])
            }, k(n.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      m(e(Ie), {
        contained: "",
        open: N.value && F.value,
        title: j.value || "Original",
        "content-type": V.value || l.node.content_type || "",
        "source-url": K.value,
        filename: j.value,
        onClose: a[2] || (a[2] = (n) => N.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Dt = { class: "kb-page kd" }, Lt = { class: "kd-filter" }, Mt = {
  class: "kd-list",
  "aria-label": "Documents"
}, It = {
  key: 0,
  class: "kd-list-skel"
}, Ot = ["disabled", "onClick"], Pt = { class: "kd-row-ic" }, Bt = { class: "kd-row-main" }, Rt = { class: "kd-row-title" }, Vt = { class: "kd-row-sub" }, jt = {
  key: 1,
  class: "kd-list-empty"
}, Xt = {
  key: 0,
  class: "kd-pager"
}, qt = { class: "kd-pager-label" }, zt = { class: "kx-main-scroll kd-reader" }, Ut = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(l) {
    const t = xe(), y = $e(), d = $(() => t.value.config?.kb_id || ""), b = $(() => t.value.config?.route || "");
    let h = !1;
    const {
      loading: c,
      notice: C,
      indexingNotice: M,
      documents: D,
      deleting: N,
      reload: I,
      remove: L,
      findDoc: O,
      page: R,
      pageSize: A,
      total: V,
      hasPrev: F,
      hasNext: K,
      next: j,
      prev: X
    } = ze(() => d.value, { includeIndexing: !0 }), G = p(""), Z = $(() => {
      const n = G.value.trim().toLowerCase();
      return n ? D.value.filter((o) => ne(o).toLowerCase().includes(n)) : D.value;
    }), Y = $(() => V.value === 0 ? 0 : R.value * A.value + 1), q = $(() => Math.min((R.value + 1) * A.value, V.value)), w = p(""), z = $(() => N.value[w.value] ? null : O(w.value) || null), B = p(!1), E = p(!1), T = p(null), W = $(() => !!T.value && !!N.value[T.value.id]);
    function u(n) {
      if (N.value[n.id]) return;
      const o = w.value !== n.id;
      w.value = n.id, o && !h && y("navigate", n.id);
    }
    function g(n) {
      const o = O(n);
      o && (u(o), E.value = !1);
    }
    function _(n) {
      T.value = n;
    }
    async function s() {
      const n = T.value;
      if (!n) return;
      await L(n) && (w.value === n.id && (w.value = ""), T.value = null);
    }
    function a(n) {
      n.key === "Escape" && E.value && (E.value = !1);
    }
    return _e(() => {
      window.addEventListener("keydown", a), we("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", a)), Q(D, (n) => {
      if (z.value) return;
      const o = n.filter((ee) => !N.value[ee.id]), H = (b.value ? o.find((ee) => ee.id === b.value) : null) || o[0];
      if (H) {
        h = !0;
        try {
          u(H);
        } finally {
          h = !1;
        }
      } else O(w.value) || (w.value = "");
    }), Q(d, () => {
      w.value = "";
    }), Q(b, (n) => {
      if (!n || n === w.value) return;
      const o = O(n);
      if (o) {
        h = !0;
        try {
          u(o);
        } finally {
          h = !1;
        }
      }
    }), (n, o) => (i(), v("div", Dt, [
      e(C) ? (i(), J(e(fe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: U(() => [
          S(k(e(C)), 1)
        ]),
        _: 1
      })) : x("", !0),
      e(M) ? (i(), J(e(fe), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: U(() => [
          S(k(e(M)), 1)
        ]),
        _: 1
      })) : x("", !0),
      m(e(Oe), null, {
        rail: U(() => [
          m(e(Fe), {
            title: "Documents",
            count: e(V)
          }, {
            actions: U(() => [
              m(e(te), {
                icon: "tabler:search",
                label: "Search",
                active: E.value,
                onClick: o[0] || (o[0] = (f) => E.value = !E.value)
              }, null, 8, ["active"]),
              m(e(te), {
                icon: "tabler:plus",
                label: "Add document",
                active: B.value,
                onClick: o[1] || (o[1] = (f) => B.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          r("div", Lt, [
            m(e(Re), {
              modelValue: G.value,
              "onUpdate:modelValue": o[2] || (o[2] = (f) => G.value = f),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          r("nav", Mt, [
            e(c) && !e(D).length ? (i(), v("div", It, [
              (i(), v(le, null, se(6, (f) => r("div", {
                key: f,
                class: "kd-skel-row"
              })), 64))
            ])) : x("", !0),
            (i(!0), v(le, null, se(Z.value, (f) => (i(), v("div", {
              key: f.id,
              class: ae(["kd-row", { on: w.value === f.id }])
            }, [
              r("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(N)[f.id],
                onClick: (H) => u(f)
              }, [
                r("span", Pt, [
                  m(e(P), {
                    icon: e(ke)(f),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("span", Bt, [
                  r("span", Rt, k(e(ne)(f)), 1),
                  r("span", Vt, [
                    S(k(e(Xe)(f)), 1),
                    f.created_at ? (i(), v(le, { key: 0 }, [
                      S(" · " + k(e(be)(f.created_at)), 1)
                    ], 64)) : x("", !0)
                  ])
                ])
              ], 8, Ot),
              m(e(te), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(ne)(f)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(N)[f.id],
                disabled: !!e(N)[f.id],
                onClick: (H) => _(f)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(c) && !Z.value.length ? (i(), v("div", jt, k(e(D).length ? "No documents match." : "No documents yet — add one with +."), 1)) : x("", !0)
          ]),
          e(V) > e(A) ? (i(), v("div", Xt, [
            m(e(te), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(F),
              onClick: e(X)
            }, null, 8, ["disabled", "onClick"]),
            r("span", qt, k(Y.value) + "–" + k(q.value) + " of " + k(e(V)), 1),
            m(e(te), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(K),
              onClick: e(j)
            }, null, 8, ["disabled", "onClick"])
          ])) : x("", !0)
        ]),
        default: U(() => [
          r("div", zt, [
            E.value ? (i(), J(e(Pe), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: "",
              onOpen: o[3] || (o[3] = (f) => f.parent_id && g(f.parent_id)),
              onClose: o[4] || (o[4] = (f) => E.value = !1)
            }, null, 8, ["kb-id"])) : z.value ? (i(), J(St, {
              key: 1,
              "kb-id": d.value,
              node: z.value
            }, null, 8, ["kb-id", "node"])) : (i(), J(Be, {
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
      m(e(Ve), {
        open: B.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: o[6] || (o[6] = (f) => B.value = !1)
      }, {
        default: U(() => [
          m(je, {
            "kb-id": d.value,
            noun: "document",
            onChanged: o[5] || (o[5] = (f) => {
              B.value = !1, e(I)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      m(e(nt), {
        open: !!T.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: T.value ? e(ne)(T.value) : "",
        "confirm-label": "Delete",
        busy: W.value,
        onCancel: o[7] || (o[7] = (f) => T.value = null),
        onConfirm: s
      }, {
        default: U(() => [
          o[8] || (o[8] = S(" Remove ", -1)),
          r("strong", null, k(T.value ? e(ne)(T.value) : ""), 1),
          o[9] || (o[9] = S(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Jt = {
  rootComponent: Ut
};
export {
  Jt as mountConfig
};
//# sourceMappingURL=document-mount-cwJGVDno.js.map
