import { ref as p, computed as $, onBeforeUnmount as se, watch as H, defineComponent as ie, openBlock as o, createElementBlock as v, createElementVNode as r, createTextVNode as N, toDisplayString as k, createCommentVNode as E, renderSlot as he, createBlock as J, Transition as be, withCtx as A, withModifiers as ye, normalizeClass as te, createVNode as f, unref as t, nextTick as de, Fragment as ne, renderList as oe, onMounted as ge } from "vue";
import { Icon as I } from "@iconify/vue";
import { api as le, host as re, loadByTagName as _e } from "@wippy-fe/proxy";
import { a as we, u as $e } from "./wc-runtime-f54Bo-yJ.js";
import { E as ce, i as ve, s as xe, c as Ce, _ as Z, u as Te, a as Ee, n as ee, b as Se, d as De, e as Ne, f as Le, g as Me, h as Oe, j as Ie, k as Pe, l as Be, m as Re, o as Ve } from "./AddPanel.vue_vue_type_script_setup_true_lang-BVwoVIls.js";
import { _ as fe } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
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
function je(l) {
  const a = l.content_type || "";
  if (me[a]) return me[a];
  const b = l.metadata || {}, d = String(b.filename || b.source_url || b.title || ""), m = d.lastIndexOf(".");
  if (m > 0 && m < d.length - 1) {
    const c = d.slice(m + 1).split(/[?#]/)[0];
    if (c.length <= 5) return c.toUpperCase();
  }
  return b.source_url ? "URL" : a.startsWith("image/") ? "IMG" : "DOC";
}
function pe(l) {
  const a = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : a === "application/pdf" ? "tabler:file-type-pdf" : a === "text/markdown" ? "tabler:markdown" : a === "text/csv" || a.includes("spreadsheet") || a.includes("excel") ? "tabler:table" : a === "application/json" ? "tabler:json" : a.includes("word") || a.includes("document") ? "tabler:file-text" : a.includes("presentation") || a.includes("powerpoint") ? "tabler:presentation" : a === "text/html" ? "tabler:file-code" : a.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function ke(l) {
  if (!l) return "";
  const a = new Date(l), b = a.getTime();
  if (Number.isNaN(b)) return "";
  const d = Date.now() - b, m = Math.round(d / 1e3);
  if (m < 45) return "just now";
  const c = Math.round(m / 60);
  if (c < 60) return `${c}m ago`;
  const h = Math.round(c / 60);
  if (h < 24) return `${h}h ago`;
  const x = Math.round(h / 24);
  return x < 7 ? `${x}d ago` : a.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function Xe(l) {
  if (!l) return "";
  const a = new Date(l);
  return Number.isNaN(a.getTime()) ? "" : a.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function qe(l, a = {}) {
  const b = p(!1), d = p(""), m = p([]), c = p(0), h = p(50), x = p(0), L = $(() => Math.max(1, Math.ceil(x.value / h.value))), S = $(() => c.value > 0), P = $(() => c.value < L.value - 1), C = p({}), q = 2e4, M = /* @__PURE__ */ new Map();
  function V(s) {
    const _ = { ...C.value };
    delete _[s], C.value = _;
    const w = M.get(s);
    w && (clearTimeout(w), M.delete(s));
  }
  const j = m;
  function Q(s) {
    return j.value.find((_) => _.id === s);
  }
  let B = 0;
  async function z() {
    const s = l();
    if (!s) return;
    const _ = ++B;
    b.value = !0, d.value = "";
    try {
      const w = c.value * h.value, { data: g } = await le.get(`/api/v1/kb10/${s}/browse?node_type=document&limit=${h.value}&offset=${w}`);
      if (_ !== B || l() !== s) return;
      if (!g?.success) {
        d.value = g?.error && ve(g.error) ? ce : g?.error || "";
        return;
      }
      m.value = g.nodes || [], x.value = Number(g.total) || 0;
    } catch (w) {
      if (_ !== B) return;
      const g = w?.response?.data?.error || w?.message || "could not load contents";
      d.value = ve(g) ? ce : g, re.handleError(w?.response?.status === 401 ? "auth-expired" : "other", w);
    } finally {
      _ === B && (b.value = !1);
    }
  }
  function U(s) {
    const _ = Math.max(0, Math.min(s, L.value - 1));
    _ !== c.value && (c.value = _, z());
  }
  function R() {
    P.value && U(c.value + 1);
  }
  function F() {
    S.value && U(c.value - 1);
  }
  async function ae(s) {
    const _ = l();
    if (!_ || C.value[s.id]) return !1;
    const w = Ce(s);
    C.value = { ...C.value, [s.id]: !0 };
    let g = !1;
    try {
      const { data: i } = await le.delete(`/api/v1/knowledge/${_}/content`, { data: w });
      i?.success ? (g = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = i?.error || "could not queue delete";
    } catch (i) {
      d.value = i?.response?.data?.error || i?.message || "could not queue delete", re.handleError(i?.response?.status === 401 ? "auth-expired" : "other", i);
    } finally {
      if (!g)
        V(s.id);
      else {
        const i = s.id;
        M.set(i, setTimeout(() => {
          C.value[i] && (V(i), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, q));
      }
    }
    return g;
  }
  function G() {
    const s = Object.keys(C.value);
    if (s.length === 0) return;
    const _ = new Set(m.value.map((g) => g.id)), w = s.filter((g) => !_.has(g));
    if (w.length) {
      for (const g of w) V(g);
      Object.keys(C.value).length || (d.value = ""), a.onChanged?.();
    }
  }
  let y = !1, O = !1;
  async function X() {
    if (y) {
      O = !0;
      return;
    }
    y = !0;
    try {
      do
        O = !1, await z(), G();
      while (O);
    } finally {
      y = !1;
    }
  }
  let T = null, D = 0;
  function Y(s) {
    const _ = ++D;
    if (T && (T(), T = null), !s) return;
    const w = xe(s, () => {
      X();
    });
    if (_ !== D) {
      w && w();
      return;
    }
    T = w;
  }
  return se(() => {
    D++, B++, T && T(), M.forEach((s) => clearTimeout(s)), M.clear();
  }), H(l, (s) => {
    c.value = 0, x.value = 0, z(), Y(s);
  }, { immediate: !0 }), {
    loading: b,
    notice: d,
    nodes: m,
    documents: j,
    deleting: C,
    load: z,
    reload: z,
    remove: ae,
    findDoc: Q,
    page: c,
    pageSize: h,
    total: x,
    pageCount: L,
    hasPrev: S,
    hasNext: P,
    next: R,
    prev: F,
    goToPage: U
  };
}
const ze = { class: "kx-railhead" }, Ue = { class: "kx-railhead-title" }, Ae = { key: 0 }, Ke = { class: "kx-railhead-acts" }, He = /* @__PURE__ */ ie({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (a, b) => (o(), v("div", ze, [
      r("span", Ue, [
        N(k(l.title), 1),
        l.count !== void 0 ? (o(), v("b", Ae, k(l.count), 1)) : E("", !0)
      ]),
      r("div", Ke, [
        he(a.$slots, "actions")
      ])
    ]));
  }
}), Fe = ["aria-label"], Ge = { class: "kx-modal-h" }, We = { class: "kx-modal-h-ico" }, Je = { class: "kx-modal-h-text" }, Qe = { class: "kx-modal-h-title" }, Ye = {
  key: 0,
  class: "kx-modal-h-sub"
}, Ze = { class: "kx-modal-body" }, et = { class: "kx-modal-foot" }, tt = /* @__PURE__ */ ie({
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
  setup(l, { emit: a }) {
    const b = l, d = a;
    function m(c) {
      c.key === "Escape" && !b.busy && d("cancel");
    }
    return H(() => b.open, (c) => {
      c ? window.addEventListener("keydown", m) : window.removeEventListener("keydown", m);
    }), se(() => window.removeEventListener("keydown", m)), (c, h) => (o(), J(be, { name: "kx-modal" }, {
      default: A(() => [
        l.open ? (o(), v("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: h[3] || (h[3] = ye((x) => !l.busy && d("cancel"), ["self"]))
        }, [
          r("div", {
            class: te(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            r("div", Ge, [
              r("span", We, [
                f(t(I), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", Je, [
                r("span", Qe, k(l.title), 1),
                l.subtitle ? (o(), v("span", Ye, k(l.subtitle), 1)) : E("", !0)
              ]),
              f(Z, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: h[0] || (h[0] = (x) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            r("div", Ze, [
              he(c.$slots, "default")
            ]),
            r("div", et, [
              f(fe, {
                variant: "ghost",
                disabled: l.busy,
                onClick: h[1] || (h[1] = (x) => d("cancel"))
              }, {
                default: A(() => [
                  N(k(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(fe, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: h[2] || (h[2] = (x) => d("confirm"))
              }, {
                default: A(() => [
                  N(k(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, Fe)
        ])) : E("", !0)
      ]),
      _: 3
    }));
  }
}), nt = { class: "dr" }, at = { class: "dr-head" }, lt = { class: "dr-badge" }, ot = { class: "dr-head-body" }, st = { class: "dr-head-top" }, it = { class: "dr-title" }, rt = { class: "dr-facts" }, ut = {
  key: 0,
  class: "dr-fact"
}, dt = {
  key: 1,
  class: "dr-fact"
}, ct = ["title"], vt = ["href"], ft = {
  key: 0,
  class: "dr-skel"
}, mt = {
  key: 1,
  class: "dr-state err"
}, ht = {
  key: 0,
  class: "dr-doc"
}, pt = { class: "dr-doc-main" }, kt = ["content-type", "source", "filename"], bt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, yt = ["aria-expanded"], gt = {
  key: 3,
  class: "dr-state"
}, _t = {
  key: 1,
  class: "dr-chunks"
}, wt = {
  key: 0,
  class: "dr-state"
}, $t = ["aria-expanded", "onClick"], xt = { class: "dr-chunk-n" }, Ct = { class: "dr-chunk-label" }, Tt = {
  key: 0,
  class: "dr-chunk-cx"
}, Et = 720, St = /* @__PURE__ */ ie({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const a = l, b = p(!1), d = p(""), m = p(""), c = p(""), h = p([]), x = p(0), L = p(""), S = p("read"), P = p(!1), C = p({});
    function q(i) {
      return String((i.metadata || {}).contextual_prefix || "");
    }
    const M = $(() => a.node.metadata || {}), V = $(() => M.value.source_url), j = $(() => c.value || a.node.content_type || "text/markdown"), Q = $(() => String(M.value.original_mime_type || M.value.source_mime || "")), B = $(() => Te(M.value) ? Ee(Q.value || a.node.content_type || "") : !1), z = $(() => `/api/v1/kb10/${a.kbId}/nodes/${a.node.id}/source`), U = $(() => String(M.value.filename || M.value.original_filename || "")), R = $(() => m.value ? m.value : h.value.map((i) => i.content).filter(Boolean).join(`

`)), F = $(() => {
      const i = R.value.trim();
      return i ? i.split(/\s+/).length : 0;
    });
    function ae() {
      B.value && (P.value = !P.value);
    }
    const G = p(null), y = p(!1), O = p(!1);
    function X() {
      const i = G.value;
      if (!i) {
        O.value = !1;
        return;
      }
      O.value = i.scrollHeight - Et > 24;
    }
    let T = null;
    function D() {
      T?.disconnect();
      const i = G.value;
      i && (T = new ResizeObserver(() => X()), T.observe(i), de(X));
    }
    const Y = $(() => O.value && !y.value);
    let s = 0;
    async function _() {
      if (!a.kbId || !a.node?.id) return;
      const i = ++s;
      b.value = !0, d.value = "", m.value = "", c.value = "", h.value = [], x.value = 0, L.value = "", S.value = "read", C.value = {}, y.value = !1, O.value = !1;
      try {
        const [{ data: n }, { data: e }, { data: u }] = await Promise.all([
          le.get(`/api/v1/kb10/${a.kbId}/browse?node_id=${a.node.id}`),
          le.get(`/api/v1/kb10/${a.kbId}/browse?parent_id=${a.node.id}&node_type=chunk&include_content=true&limit=200`),
          le.get(`/api/v1/kb10/${a.kbId}/browse?parent_id=${a.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (i !== s) return;
        if (n?.success && n.node && (m.value = String(n.node.content || ""), c.value = String(n.node.content_type || "")), e?.success) {
          if (!Number.isInteger(e.total) || e.total < 0) throw new Error("Invalid chunk total");
          x.value = e.total;
          const W = e.nodes;
          if (h.value = W.filter((K) => K.node_type === "chunk").sort((K, ue) => Number((K.metadata || {}).index ?? (K.metadata || {}).chunk_index ?? 0) - Number((ue.metadata || {}).index ?? (ue.metadata || {}).chunk_index ?? 0)), !u?.success) throw new Error(u?.error || "could not load summary");
          L.value = u.nodes[0]?.content || "", m.value || (m.value = L.value || a.node.content || "");
        }
        !n?.success && !e?.success && (d.value = n?.error || e?.error || "could not load document");
      } catch (n) {
        if (i !== s) return;
        d.value = n?.response?.data?.error || n?.message || "could not load document", re.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
      } finally {
        i === s && (b.value = !1);
      }
    }
    const w = $(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: x.value || void 0 }
    ]);
    function g(i) {
      C.value = { ...C.value, [i.id]: !C.value[i.id] };
    }
    return H([R, S, b], () => {
      S.value === "read" && !b.value && de(D);
    }), H(B, (i) => {
      i || (P.value = !1);
    }), H(() => a.node?.id, () => _(), { immediate: !0 }), se(() => {
      T?.disconnect();
    }), (i, n) => (o(), v("div", nt, [
      r("header", at, [
        r("span", lt, [
          f(t(I), {
            icon: t(pe)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        r("div", ot, [
          r("div", st, [
            r("h2", it, k(t(ee)(l.node)), 1),
            B.value ? (o(), J(t(Se), {
              key: 0,
              class: te(["dr-orig-btn", { on: P.value }]),
              label: P.value ? "Hide original" : "View original",
              onOpen: ae
            }, null, 8, ["class", "label"])) : E("", !0)
          ]),
          r("div", rt, [
            x.value ? (o(), v("span", ut, [
              f(t(I), { icon: "tabler:layout-grid" }),
              N(k(x.value.toLocaleString()) + " chunks", 1)
            ])) : E("", !0),
            F.value ? (o(), v("span", dt, [
              f(t(I), { icon: "tabler:align-left" }),
              N(k(F.value.toLocaleString()) + " words", 1)
            ])) : E("", !0),
            l.node.created_at ? (o(), v("span", {
              key: 2,
              class: "dr-fact",
              title: t(Xe)(l.node.created_at)
            }, [
              f(t(I), { icon: "tabler:clock" }),
              N(k(t(ke)(l.node.created_at)), 1)
            ], 8, ct)) : E("", !0),
            V.value ? (o(), v("a", {
              key: 3,
              class: "dr-fact link",
              href: V.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(t(I), { icon: "tabler:external-link" }),
              n[3] || (n[3] = N("Source", -1))
            ], 8, vt)) : E("", !0)
          ])
        ])
      ]),
      f(t(De), {
        tabs: w.value,
        active: S.value,
        onSelect: n[0] || (n[0] = (e) => S.value = e)
      }, null, 8, ["tabs", "active"]),
      b.value ? (o(), v("div", ft, [
        (o(), v(ne, null, oe(6, (e) => r("div", {
          key: e,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (o(), v("div", mt, [
        f(t(I), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        N(" " + k(d.value), 1)
      ])) : (o(), v(ne, { key: 2 }, [
        S.value === "read" ? (o(), v("div", ht, [
          r("div", pt, [
            L.value ? (o(), J(t(Ne), {
              key: 0,
              text: L.value
            }, null, 8, ["text"])) : E("", !0),
            R.value ? (o(), v("div", {
              key: 1,
              class: te(["dr-clamp", { clamped: Y.value }])
            }, [
              r("div", {
                ref_key: "bodyRef",
                ref: G,
                class: "dr-clamp-inner"
              }, [
                r("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": j.value,
                  source: R.value,
                  filename: U.value
                }, null, 8, kt)
              ], 512),
              Y.value ? (o(), v("div", bt)) : E("", !0)
            ], 2)) : E("", !0),
            O.value ? (o(), v("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": y.value,
              onClick: n[1] || (n[1] = (e) => y.value = !y.value)
            }, [
              f(t(I), {
                icon: y.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(" " + k(y.value ? "Show less" : "Show more"), 1)
            ], 8, yt)) : E("", !0),
            R.value ? E("", !0) : (o(), v("div", gt, [
              f(t(I), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              n[4] || (n[4] = N(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (o(), v("div", _t, [
          h.value.length ? E("", !0) : (o(), v("div", wt, [
            f(t(I), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            n[5] || (n[5] = N(" This document has no chunks.", -1))
          ])),
          (o(!0), v(ne, null, oe(h.value, (e, u) => (o(), v("div", {
            key: e.id,
            class: te(["dr-chunk", { open: C.value[e.id] }])
          }, [
            r("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!C.value[e.id],
              onClick: (W) => g(e)
            }, [
              r("span", xt, k(u + 1), 1),
              r("span", Ct, "Chunk " + k(u + 1), 1),
              f(t(I), {
                class: "dr-chunk-chev",
                icon: C.value[e.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, $t),
            q(e) ? (o(), v("p", Tt, [
              f(t(I), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              r("span", null, k(q(e)), 1)
            ])) : E("", !0),
            r("p", {
              class: te(["dr-chunk-body", { clamp: !C.value[e.id] }])
            }, k(e.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(t(Le), {
        contained: "",
        open: P.value && B.value,
        title: U.value || "Original",
        "content-type": Q.value || l.node.content_type || "",
        "source-url": z.value,
        filename: U.value,
        onClose: n[2] || (n[2] = (e) => P.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Dt = { class: "kb-page kd" }, Nt = { class: "kd-filter" }, Lt = {
  class: "kd-list",
  "aria-label": "Documents"
}, Mt = {
  key: 0,
  class: "kd-list-skel"
}, Ot = ["disabled", "onClick"], It = { class: "kd-row-ic" }, Pt = { class: "kd-row-main" }, Bt = { class: "kd-row-title" }, Rt = { class: "kd-row-sub" }, Vt = {
  key: 1,
  class: "kd-list-empty"
}, jt = {
  key: 0,
  class: "kd-pager"
}, Xt = { class: "kd-pager-label" }, qt = { class: "kx-main-scroll kd-reader" }, zt = /* @__PURE__ */ ie({
  __name: "KbDocument",
  setup(l) {
    const a = we(), b = $e(), d = $(() => a.value.config?.kb_id || ""), m = $(() => a.value.config?.route || "");
    let c = !1;
    const {
      loading: h,
      notice: x,
      documents: L,
      deleting: S,
      reload: P,
      remove: C,
      findDoc: q,
      page: M,
      pageSize: V,
      total: j,
      hasPrev: Q,
      hasNext: B,
      next: z,
      prev: U
    } = qe(() => d.value), R = p(""), F = $(() => {
      const n = R.value.trim().toLowerCase();
      return n ? L.value.filter((e) => ee(e).toLowerCase().includes(n)) : L.value;
    }), ae = $(() => j.value === 0 ? 0 : M.value * V.value + 1), G = $(() => Math.min((M.value + 1) * V.value, j.value)), y = p(""), O = $(() => S.value[y.value] ? null : q(y.value) || null), X = p(!1), T = p(!1), D = p(null), Y = $(() => !!D.value && !!S.value[D.value.id]);
    function s(n) {
      if (S.value[n.id]) return;
      const e = y.value !== n.id;
      y.value = n.id, e && !c && b("navigate", n.id);
    }
    function _(n) {
      const e = q(n);
      e && (s(e), T.value = !1);
    }
    function w(n) {
      D.value = n;
    }
    async function g() {
      const n = D.value;
      if (!n) return;
      await C(n) && (y.value === n.id && (y.value = ""), D.value = null);
    }
    function i(n) {
      n.key === "Escape" && T.value && (T.value = !1);
    }
    return ge(() => {
      window.addEventListener("keydown", i), _e("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), se(() => window.removeEventListener("keydown", i)), H(L, (n) => {
      if (O.value) return;
      const e = n.filter((K) => !S.value[K.id]), W = (m.value ? e.find((K) => K.id === m.value) : null) || e[0];
      if (W) {
        c = !0;
        try {
          s(W);
        } finally {
          c = !1;
        }
      } else q(y.value) || (y.value = "");
    }), H(d, () => {
      y.value = "";
    }), H(m, (n) => {
      if (!n || n === y.value) return;
      const e = q(n);
      if (e) {
        c = !0;
        try {
          s(e);
        } finally {
          c = !1;
        }
      }
    }), (n, e) => (o(), v("div", Dt, [
      t(x) ? (o(), J(t(Me), {
        key: 0,
        class: "kd-notice"
      }, {
        default: A(() => [
          N(k(t(x)), 1)
        ]),
        _: 1
      })) : E("", !0),
      f(t(Oe), null, {
        rail: A(() => [
          f(t(He), {
            title: "Documents",
            count: t(j)
          }, {
            actions: A(() => [
              f(t(Z), {
                icon: "tabler:search",
                label: "Search",
                active: T.value,
                onClick: e[0] || (e[0] = (u) => T.value = !T.value)
              }, null, 8, ["active"]),
              f(t(Z), {
                icon: "tabler:plus",
                label: "Add document",
                active: X.value,
                onClick: e[1] || (e[1] = (u) => X.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          r("div", Nt, [
            f(t(Be), {
              modelValue: R.value,
              "onUpdate:modelValue": e[2] || (e[2] = (u) => R.value = u),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          r("nav", Lt, [
            t(h) && !t(L).length ? (o(), v("div", Mt, [
              (o(), v(ne, null, oe(6, (u) => r("div", {
                key: u,
                class: "kd-skel-row"
              })), 64))
            ])) : E("", !0),
            (o(!0), v(ne, null, oe(F.value, (u) => (o(), v("div", {
              key: u.id,
              class: te(["kd-row", { on: y.value === u.id }])
            }, [
              r("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!t(S)[u.id],
                onClick: (W) => s(u)
              }, [
                r("span", It, [
                  f(t(I), {
                    icon: t(pe)(u),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("span", Pt, [
                  r("span", Bt, k(t(ee)(u)), 1),
                  r("span", Rt, [
                    N(k(t(je)(u)), 1),
                    u.created_at ? (o(), v(ne, { key: 0 }, [
                      N(" · " + k(t(ke)(u.created_at)), 1)
                    ], 64)) : E("", !0)
                  ])
                ])
              ], 8, Ot),
              f(t(Z), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${t(ee)(u)}`,
                variant: "danger",
                size: "sm",
                spin: !!t(S)[u.id],
                disabled: !!t(S)[u.id],
                onClick: (W) => w(u)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !t(h) && !F.value.length ? (o(), v("div", Vt, k(t(L).length ? "No documents match." : "No documents yet — add one with +."), 1)) : E("", !0)
          ]),
          t(j) > t(V) ? (o(), v("div", jt, [
            f(t(Z), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !t(Q),
              onClick: t(U)
            }, null, 8, ["disabled", "onClick"]),
            r("span", Xt, k(ae.value) + "–" + k(G.value) + " of " + k(t(j)), 1),
            f(t(Z), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !t(B),
              onClick: t(z)
            }, null, 8, ["disabled", "onClick"])
          ])) : E("", !0)
        ]),
        default: A(() => [
          r("div", qt, [
            T.value ? (o(), J(t(Ie), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: "",
              onOpen: e[3] || (e[3] = (u) => u.parent_id && _(u.parent_id)),
              onClose: e[4] || (e[4] = (u) => T.value = !1)
            }, null, 8, ["kb-id"])) : O.value ? (o(), J(St, {
              key: 1,
              "kb-id": d.value,
              node: O.value
            }, null, 8, ["kb-id", "node"])) : (o(), J(Pe, {
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
      f(t(Re), {
        open: X.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: e[6] || (e[6] = (u) => X.value = !1)
      }, {
        default: A(() => [
          f(Ve, {
            "kb-id": d.value,
            noun: "document",
            onChanged: e[5] || (e[5] = (u) => {
              X.value = !1, t(P)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(t(tt), {
        open: !!D.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: D.value ? t(ee)(D.value) : "",
        "confirm-label": "Delete",
        busy: Y.value,
        onCancel: e[7] || (e[7] = (u) => D.value = null),
        onConfirm: g
      }, {
        default: A(() => [
          e[8] || (e[8] = N(" Remove ", -1)),
          r("strong", null, k(D.value ? t(ee)(D.value) : ""), 1),
          e[9] || (e[9] = N(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Wt = {
  rootComponent: zt
};
export {
  Wt as mountConfig
};
//# sourceMappingURL=document-mount-CuE5SrxV.js.map
