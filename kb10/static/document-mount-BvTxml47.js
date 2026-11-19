import { ref as b, computed as C, onBeforeUnmount as ie, watch as F, defineComponent as re, openBlock as l, createElementBlock as v, createElementVNode as u, createTextVNode as D, toDisplayString as _, createCommentVNode as S, renderSlot as he, createBlock as Q, Transition as be, withCtx as H, withModifiers as ye, normalizeClass as ne, createVNode as f, unref as e, nextTick as de, Fragment as ae, renderList as se, onMounted as ge } from "vue";
import { Icon as P } from "@iconify/vue";
import { api as le, host as ue, loadByTagName as _e } from "@wippy-fe/proxy";
import { a as we, u as $e } from "./wc-runtime-f54Bo-yJ.js";
import { E as ce, i as ve, s as xe, c as Ce, _ as ee, u as Te, a as Ee, n as te, b as Se, d as De, e as Ne, f as Le, g as Me, h as Oe, j as Ie, k as Pe, l as Be, m as Re, o as Ve } from "./AddPanel.vue_vue_type_script_setup_true_lang-BGy7c1Rc.js";
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
function Xe(n) {
  const t = n.content_type || "";
  if (me[t]) return me[t];
  const w = n.metadata || {}, s = String(w.filename || w.source_url || w.title || ""), m = s.lastIndexOf(".");
  if (m > 0 && m < s.length - 1) {
    const c = s.slice(m + 1).split(/[?#]/)[0];
    if (c.length <= 5) return c.toUpperCase();
  }
  return w.source_url ? "URL" : t.startsWith("image/") ? "IMG" : "DOC";
}
function pe(n) {
  const t = n.content_type || "";
  return (n.metadata || {}).source_url ? "tabler:world" : t === "application/pdf" ? "tabler:file-type-pdf" : t === "text/markdown" ? "tabler:markdown" : t === "text/csv" || t.includes("spreadsheet") || t.includes("excel") ? "tabler:table" : t === "application/json" ? "tabler:json" : t.includes("word") || t.includes("document") ? "tabler:file-text" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:presentation" : t === "text/html" ? "tabler:file-code" : t.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function ke(n) {
  if (!n) return "";
  const t = new Date(n), w = t.getTime();
  if (Number.isNaN(w)) return "";
  const s = Date.now() - w, m = Math.round(s / 1e3);
  if (m < 45) return "just now";
  const c = Math.round(m / 60);
  if (c < 60) return `${c}m ago`;
  const h = Math.round(c / 60);
  if (h < 24) return `${h}h ago`;
  const T = Math.round(h / 24);
  return T < 7 ? `${T}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function qe(n) {
  if (!n) return "";
  const t = new Date(n);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ze(n, t = {}) {
  const w = b(!1), s = b(""), m = b([]), c = b(0), h = b(50), T = b(0), N = C(() => Math.max(1, Math.ceil(T.value / h.value))), M = C(() => c.value > 0), B = C(() => c.value < N.value - 1), E = b({}), q = 2e4, L = /* @__PURE__ */ new Map();
  function z(a) {
    const x = { ...E.value };
    delete x[a], E.value = x;
    const g = L.get(a);
    g && (clearTimeout(g), L.delete(a));
  }
  const A = m;
  function Y(a) {
    return A.value.find((x) => x.id === a);
  }
  let R = 0;
  async function U() {
    const a = n();
    if (!a) return;
    const x = ++R;
    w.value = !0, s.value = "";
    try {
      const g = c.value * h.value, { data: $ } = await le.get(`/api/v1/kb10/${a}/browse?node_type=document&limit=${h.value}&offset=${g}`);
      if (x !== R || n() !== a) return;
      if (!$?.success) {
        s.value = $?.error && ve($.error) ? ce : $?.error || "";
        return;
      }
      m.value = $.nodes || [], T.value = Number($.total) || 0;
    } catch (g) {
      if (x !== R) return;
      const $ = g?.response?.data?.error || g?.message || "could not load contents";
      s.value = ve($) ? ce : $, ue.handleError(g?.response?.status === 401 ? "auth-expired" : "other", g);
    } finally {
      x === R && (w.value = !1);
    }
  }
  function K(a) {
    const x = Math.max(0, Math.min(a, N.value - 1));
    x !== c.value && (c.value = x, U());
  }
  function j() {
    B.value && K(c.value + 1);
  }
  function W() {
    M.value && K(c.value - 1);
  }
  async function oe(a) {
    const x = n();
    if (!x || E.value[a.id]) return !1;
    const g = Ce(a);
    E.value = { ...E.value, [a.id]: !0 };
    let $ = !1;
    try {
      const { data: i } = await le.delete(`/api/v1/knowledge/${x}/content`, { data: g });
      i?.success ? ($ = !0, s.value = "Delete queued. The row clears once indexing catches up.") : s.value = i?.error || "could not queue delete";
    } catch (i) {
      s.value = i?.response?.data?.error || i?.message || "could not queue delete", ue.handleError(i?.response?.status === 401 ? "auth-expired" : "other", i);
    } finally {
      if (!$)
        z(a.id);
      else {
        const i = a.id;
        L.set(i, setTimeout(() => {
          E.value[i] && (z(i), s.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, q));
      }
    }
    return $;
  }
  function J() {
    const a = Object.keys(E.value);
    if (a.length === 0) return;
    const x = new Set(m.value.map(($) => $.id)), g = a.filter(($) => !x.has($));
    if (g.length) {
      for (const $ of g) z($);
      Object.keys(E.value).length || (s.value = ""), t.onChanged?.();
    }
  }
  let y = !1, V = !1;
  async function G() {
    if (y) {
      V = !0;
      return;
    }
    y = !0;
    try {
      do
        V = !1, await U(), J();
      while (V);
    } finally {
      y = !1;
    }
  }
  let O = null, X = 0;
  function I(a) {
    const x = ++X;
    if (O && (O(), O = null), !a) return;
    const g = xe(a, () => {
      G();
    });
    if (x !== X) {
      g && g();
      return;
    }
    O = g;
  }
  return ie(() => {
    X++, R++, O && O(), L.forEach((a) => clearTimeout(a)), L.clear();
  }), F(n, (a) => {
    c.value = 0, T.value = 0, U(), I(a);
  }, { immediate: !0 }), {
    loading: w,
    notice: s,
    nodes: m,
    documents: A,
    deleting: E,
    load: U,
    reload: U,
    remove: oe,
    findDoc: Y,
    page: c,
    pageSize: h,
    total: T,
    pageCount: N,
    hasPrev: M,
    hasNext: B,
    next: j,
    prev: W,
    goToPage: K
  };
}
const Ae = { class: "kx-railhead" }, Ue = { class: "kx-railhead-title" }, Ke = { key: 0 }, Ge = { class: "kx-railhead-acts" }, He = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(n) {
    return (t, w) => (l(), v("div", Ae, [
      u("span", Ue, [
        D(_(n.title), 1),
        n.count !== void 0 ? (l(), v("b", Ke, _(n.count), 1)) : S("", !0)
      ]),
      u("div", Ge, [
        he(t.$slots, "actions")
      ])
    ]));
  }
}), Fe = ["aria-label"], We = { class: "kx-modal-h" }, Je = { class: "kx-modal-h-ico" }, Qe = { class: "kx-modal-h-text" }, Ye = { class: "kx-modal-h-title" }, Ze = {
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
  setup(n, { emit: t }) {
    const w = n, s = t;
    function m(c) {
      c.key === "Escape" && !w.busy && s("cancel");
    }
    return F(() => w.open, (c) => {
      c ? window.addEventListener("keydown", m) : window.removeEventListener("keydown", m);
    }), ie(() => window.removeEventListener("keydown", m)), (c, h) => (l(), Q(be, { name: "kx-modal" }, {
      default: H(() => [
        n.open ? (l(), v("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: h[3] || (h[3] = ye((T) => !n.busy && s("cancel"), ["self"]))
        }, [
          u("div", {
            class: ne(["kx-modal", { danger: n.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": n.title
          }, [
            u("div", We, [
              u("span", Je, [
                f(e(P), {
                  icon: n.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", Qe, [
                u("span", Ye, _(n.title), 1),
                n.subtitle ? (l(), v("span", Ze, _(n.subtitle), 1)) : S("", !0)
              ]),
              f(ee, {
                icon: "tabler:x",
                label: "Close",
                disabled: n.busy,
                onClick: h[0] || (h[0] = (T) => s("cancel"))
              }, null, 8, ["disabled"])
            ]),
            u("div", et, [
              he(c.$slots, "default")
            ]),
            u("div", tt, [
              f(fe, {
                variant: "ghost",
                disabled: n.busy,
                onClick: h[1] || (h[1] = (T) => s("cancel"))
              }, {
                default: H(() => [
                  D(_(n.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(fe, {
                variant: n.danger ? "danger" : "primary",
                loading: n.busy,
                disabled: n.busy,
                onClick: h[2] || (h[2] = (T) => s("confirm"))
              }, {
                default: H(() => [
                  D(_(n.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, Fe)
        ])) : S("", !0)
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
}, $t = {
  key: 0,
  class: "dr-state"
}, xt = ["aria-expanded", "onClick"], Ct = { class: "dr-chunk-n" }, Tt = { class: "dr-chunk-label" }, Et = {
  key: 0,
  class: "dr-chunk-cx"
}, St = 720, Dt = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(n) {
    const t = n, w = b(!1), s = b(""), m = b(""), c = b(""), h = b([]), T = b(0), N = b(""), M = b("read"), B = b(!1), E = b({});
    function q(i) {
      return String((i.metadata || {}).contextual_prefix || "");
    }
    const L = C(() => t.node.metadata || {}), z = C(() => L.value.source_url), A = C(() => c.value || t.node.content_type || "text/markdown"), Y = C(() => String(L.value.original_mime_type || L.value.source_mime || "")), R = C(() => Te(L.value) ? Ee(Y.value || t.node.content_type || "") : !1), U = C(() => `/api/v1/kb10/${t.kbId}/nodes/${t.node.id}/source`), K = C(() => String(L.value.filename || L.value.original_filename || "")), j = C(() => m.value ? m.value : h.value.map((i) => i.content).filter(Boolean).join(`

`)), W = C(() => {
      const i = j.value.trim();
      return i ? i.split(/\s+/).length : 0;
    });
    function oe() {
      R.value && (B.value = !B.value);
    }
    const J = b(null), y = b(!1), V = b(!1);
    function G() {
      const i = J.value;
      if (!i) {
        V.value = !1;
        return;
      }
      V.value = i.scrollHeight - St > 24;
    }
    let O = null;
    function X() {
      O?.disconnect();
      const i = J.value;
      i && (O = new ResizeObserver(() => G()), O.observe(i), de(G));
    }
    const I = C(() => V.value && !y.value);
    let a = 0;
    async function x() {
      if (!t.kbId || !t.node?.id) return;
      const i = ++a;
      w.value = !0, s.value = "", m.value = "", c.value = "", h.value = [], T.value = 0, N.value = "", M.value = "read", E.value = {}, y.value = !1, V.value = !1;
      try {
        const [{ data: p }, { data: k }, { data: r }] = await Promise.all([
          le.get(`/api/v1/kb10/${t.kbId}/browse?node_id=${t.node.id}`),
          le.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=chunk&include_content=true&limit=200`),
          le.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (i !== a) return;
        if (p?.success && p.node && (m.value = String(p.node.content || ""), c.value = String(p.node.content_type || "")), k?.success) {
          if (!Number.isInteger(k.total) || k.total < 0) throw new Error("Invalid chunk total");
          T.value = k.total;
          const o = k.nodes;
          if (h.value = o.filter((d) => d.node_type === "chunk").sort((d, Z) => Number((d.metadata || {}).index ?? (d.metadata || {}).chunk_index ?? 0) - Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0)), !r?.success) throw new Error(r?.error || "could not load summary");
          N.value = r.nodes[0]?.content || "", m.value || (m.value = N.value || t.node.content || "");
        }
        !p?.success && !k?.success && (s.value = p?.error || k?.error || "could not load document");
      } catch (p) {
        if (i !== a) return;
        s.value = p?.response?.data?.error || p?.message || "could not load document", ue.handleError(p?.response?.status === 401 ? "auth-expired" : "other", p);
      } finally {
        i === a && (w.value = !1);
      }
    }
    const g = C(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: T.value || void 0 }
    ]);
    function $(i) {
      E.value = { ...E.value, [i.id]: !E.value[i.id] };
    }
    return F([j, M, w], () => {
      M.value === "read" && !w.value && de(X);
    }), F(R, (i) => {
      i || (B.value = !1);
    }), F(() => t.node?.id, () => x(), { immediate: !0 }), ie(() => {
      O?.disconnect();
    }), (i, p) => (l(), v("div", at, [
      u("header", lt, [
        u("span", ot, [
          f(e(P), {
            icon: e(pe)(n.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        u("div", st, [
          u("div", it, [
            u("h2", rt, _(e(te)(n.node)), 1),
            R.value ? (l(), Q(e(Se), {
              key: 0,
              class: ne(["dr-orig-btn", { on: B.value }]),
              label: B.value ? "Hide original" : "View original",
              onOpen: oe
            }, null, 8, ["class", "label"])) : S("", !0)
          ]),
          u("div", ut, [
            T.value ? (l(), v("span", dt, [
              f(e(P), { icon: "tabler:layout-grid" }),
              D(_(T.value.toLocaleString()) + " chunks", 1)
            ])) : S("", !0),
            W.value ? (l(), v("span", ct, [
              f(e(P), { icon: "tabler:align-left" }),
              D(_(W.value.toLocaleString()) + " words", 1)
            ])) : S("", !0),
            n.node.created_at ? (l(), v("span", {
              key: 2,
              class: "dr-fact",
              title: e(qe)(n.node.created_at)
            }, [
              f(e(P), { icon: "tabler:clock" }),
              D(_(e(ke)(n.node.created_at)), 1)
            ], 8, vt)) : S("", !0),
            z.value ? (l(), v("a", {
              key: 3,
              class: "dr-fact link",
              href: z.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(e(P), { icon: "tabler:external-link" }),
              p[3] || (p[3] = D("Source", -1))
            ], 8, ft)) : S("", !0)
          ])
        ])
      ]),
      f(e(De), {
        tabs: g.value,
        active: M.value,
        onSelect: p[0] || (p[0] = (k) => M.value = k)
      }, null, 8, ["tabs", "active"]),
      w.value ? (l(), v("div", mt, [
        (l(), v(ae, null, se(6, (k) => u("div", {
          key: k,
          class: "dr-skel-line"
        })), 64))
      ])) : s.value ? (l(), v("div", ht, [
        f(e(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        D(" " + _(s.value), 1)
      ])) : (l(), v(ae, { key: 2 }, [
        M.value === "read" ? (l(), v("div", pt, [
          u("div", kt, [
            N.value ? (l(), Q(e(Ne), {
              key: 0,
              text: N.value
            }, null, 8, ["text"])) : S("", !0),
            j.value ? (l(), v("div", {
              key: 1,
              class: ne(["dr-clamp", { clamped: I.value }])
            }, [
              u("div", {
                ref_key: "bodyRef",
                ref: J,
                class: "dr-clamp-inner"
              }, [
                u("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": A.value,
                  source: j.value,
                  filename: K.value
                }, null, 8, bt)
              ], 512),
              I.value ? (l(), v("div", yt)) : S("", !0)
            ], 2)) : S("", !0),
            V.value ? (l(), v("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": y.value,
              onClick: p[1] || (p[1] = (k) => y.value = !y.value)
            }, [
              f(e(P), {
                icon: y.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              D(" " + _(y.value ? "Show less" : "Show more"), 1)
            ], 8, gt)) : S("", !0),
            j.value ? S("", !0) : (l(), v("div", _t, [
              f(e(P), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              p[4] || (p[4] = D(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (l(), v("div", wt, [
          h.value.length ? S("", !0) : (l(), v("div", $t, [
            f(e(P), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            p[5] || (p[5] = D(" This document has no chunks.", -1))
          ])),
          (l(!0), v(ae, null, se(h.value, (k, r) => (l(), v("div", {
            key: k.id,
            class: ne(["dr-chunk", { open: E.value[k.id] }])
          }, [
            u("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!E.value[k.id],
              onClick: (o) => $(k)
            }, [
              u("span", Ct, _(r + 1), 1),
              u("span", Tt, "Chunk " + _(r + 1), 1),
              f(e(P), {
                class: "dr-chunk-chev",
                icon: E.value[k.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, xt),
            q(k) ? (l(), v("p", Et, [
              f(e(P), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              u("span", null, _(q(k)), 1)
            ])) : S("", !0),
            u("p", {
              class: ne(["dr-chunk-body", { clamp: !E.value[k.id] }])
            }, _(k.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(e(Le), {
        contained: "",
        open: B.value && R.value,
        title: K.value || "Original",
        "content-type": Y.value || n.node.content_type || "",
        "source-url": U.value,
        filename: K.value,
        onClose: p[2] || (p[2] = (k) => B.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Nt = { class: "kb-page kd" }, Lt = { class: "kd-filter" }, Mt = {
  class: "kd-list",
  "aria-label": "Documents"
}, Ot = {
  key: 0,
  class: "kd-list-skel"
}, It = ["onClick"], Pt = { class: "kd-row-ic" }, Bt = { class: "kd-row-main" }, Rt = { class: "kd-row-title" }, Vt = { class: "kd-row-sub" }, jt = {
  key: 1,
  class: "kd-list-empty"
}, Xt = {
  key: 0,
  class: "kd-pager"
}, qt = { class: "kd-pager-label" }, zt = { class: "kx-main-scroll kd-reader" }, At = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(n) {
    const t = we(), w = $e(), s = C(() => t.value.config?.kb_id || ""), m = C(() => t.value.config?.route || "");
    let c = !1;
    const {
      loading: h,
      notice: T,
      documents: N,
      deleting: M,
      reload: B,
      remove: E,
      findDoc: q,
      page: L,
      pageSize: z,
      total: A,
      hasPrev: Y,
      hasNext: R,
      next: U,
      prev: K
    } = ze(() => s.value), j = b(""), W = C(() => {
      const r = j.value.trim().toLowerCase();
      return r ? N.value.filter((o) => te(o).toLowerCase().includes(r)) : N.value;
    }), oe = C(() => A.value === 0 ? 0 : L.value * z.value + 1), J = C(() => Math.min((L.value + 1) * z.value, A.value)), y = b(""), V = C(() => q(y.value) || null), G = b(!1);
    async function O() {
      if (!s.value) {
        G.value = !1;
        return;
      }
      try {
        const { data: r } = await le.get(`/api/v1/knowledge/${s.value}`), o = r?.config || {};
        G.value = je(o);
      } catch {
        G.value = !1;
      }
    }
    F(s, O, { immediate: !0 });
    const X = b(!1), I = b(!1), a = b(null), x = C(() => !!a.value && !!M.value[a.value.id]);
    function g(r) {
      const o = y.value !== r.id;
      y.value = r.id, o && !c && w("navigate", r.id);
    }
    function $(r) {
      const o = q(r);
      o && (g(o), I.value = !1);
    }
    function i(r) {
      a.value = r;
    }
    async function p() {
      const r = a.value;
      if (!r) return;
      await E(r) && (y.value === r.id && (y.value = ""), a.value = null);
    }
    function k(r) {
      r.key === "Escape" && I.value && (I.value = !1);
    }
    return ge(() => {
      window.addEventListener("keydown", k), _e("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", k)), F(N, (r) => {
      if (!r.length) {
        y.value && !q(y.value) && (y.value = "");
        return;
      }
      if (y.value && q(y.value)) return;
      const d = (m.value ? r.find((Z) => Z.id === m.value) : null) || r[0];
      if (d) {
        c = !0;
        try {
          g(d);
        } finally {
          c = !1;
        }
      }
    }), F(s, () => {
      y.value = "";
    }), F(m, (r) => {
      if (!r || r === y.value) return;
      const o = q(r);
      if (o) {
        c = !0;
        try {
          g(o);
        } finally {
          c = !1;
        }
      }
    }), (r, o) => (l(), v("div", Nt, [
      e(T) ? (l(), Q(e(Me), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          D(_(e(T)), 1)
        ]),
        _: 1
      })) : S("", !0),
      f(e(Oe), null, {
        rail: H(() => [
          f(e(He), {
            title: "Documents",
            count: e(A)
          }, {
            actions: H(() => [
              f(e(ee), {
                icon: "tabler:search",
                label: "Search",
                active: I.value,
                onClick: o[0] || (o[0] = (d) => I.value = !I.value)
              }, null, 8, ["active"]),
              f(e(ee), {
                icon: "tabler:plus",
                label: "Add document",
                active: X.value,
                onClick: o[1] || (o[1] = (d) => X.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          u("div", Lt, [
            f(e(Be), {
              modelValue: j.value,
              "onUpdate:modelValue": o[2] || (o[2] = (d) => j.value = d),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          u("nav", Mt, [
            e(h) && !e(N).length ? (l(), v("div", Ot, [
              (l(), v(ae, null, se(6, (d) => u("div", {
                key: d,
                class: "kd-skel-row"
              })), 64))
            ])) : S("", !0),
            (l(!0), v(ae, null, se(W.value, (d) => (l(), v("button", {
              key: d.id,
              class: ne(["kd-row", { on: y.value === d.id }]),
              onClick: (Z) => g(d)
            }, [
              u("span", Pt, [
                f(e(P), {
                  icon: e(pe)(d),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", Bt, [
                u("span", Rt, _(e(te)(d)), 1),
                u("span", Vt, [
                  D(_(e(Xe)(d)), 1),
                  d.created_at ? (l(), v(ae, { key: 0 }, [
                    D(" · " + _(e(ke)(d.created_at)), 1)
                  ], 64)) : S("", !0)
                ])
              ]),
              f(e(ee), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(te)(d)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(M)[d.id],
                disabled: !!e(M)[d.id],
                onClick: (Z) => i(d)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, It))), 128)),
            !e(h) && !W.value.length ? (l(), v("div", jt, _(e(N).length ? "No documents match." : "No documents yet — add one with +."), 1)) : S("", !0)
          ]),
          e(A) > e(z) ? (l(), v("div", Xt, [
            f(e(ee), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(Y),
              onClick: e(K)
            }, null, 8, ["disabled", "onClick"]),
            u("span", qt, _(oe.value) + "–" + _(J.value) + " of " + _(e(A)), 1),
            f(e(ee), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(R),
              onClick: e(U)
            }, null, 8, ["disabled", "onClick"])
          ])) : S("", !0)
        ]),
        default: H(() => [
          u("div", zt, [
            I.value ? (l(), Q(e(Ie), {
              key: 0,
              "kb-id": s.value,
              layout: "panel",
              ask: G.value,
              onOpen: o[3] || (o[3] = (d) => d.parent_id && $(d.parent_id)),
              onClose: o[4] || (o[4] = (d) => I.value = !1)
            }, null, 8, ["kb-id", "ask"])) : V.value ? (l(), Q(Dt, {
              key: 1,
              "kb-id": s.value,
              node: V.value
            }, null, 8, ["kb-id", "node"])) : (l(), Q(Pe, {
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
      f(e(Re), {
        open: X.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: o[6] || (o[6] = (d) => X.value = !1)
      }, {
        default: H(() => [
          f(Ve, {
            "kb-id": s.value,
            noun: "document",
            onChanged: o[5] || (o[5] = (d) => {
              X.value = !1, e(B)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(e(nt), {
        open: !!a.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: a.value ? e(te)(a.value) : "",
        "confirm-label": "Delete",
        busy: x.value,
        onCancel: o[7] || (o[7] = (d) => a.value = null),
        onConfirm: p
      }, {
        default: H(() => [
          o[8] || (o[8] = D(" Remove ", -1)),
          u("strong", null, _(a.value ? e(te)(a.value) : ""), 1),
          o[9] || (o[9] = D(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Jt = {
  rootComponent: At
};
export {
  Jt as mountConfig
};
//# sourceMappingURL=document-mount-BvTxml47.js.map
