import { ref as b, computed as C, onBeforeUnmount as ie, watch as F, defineComponent as re, openBlock as o, createElementBlock as v, createElementVNode as r, createTextVNode as N, toDisplayString as g, createCommentVNode as S, renderSlot as pe, createBlock as Y, Transition as ye, withCtx as H, withModifiers as ge, normalizeClass as ne, createVNode as f, unref as e, nextTick as ce, Fragment as ae, renderList as se, onMounted as _e } from "vue";
import { Icon as B } from "@iconify/vue";
import { api as le, host as de, loadByTagName as we } from "@wippy-fe/proxy";
import { a as $e, u as xe } from "./wc-runtime-f54Bo-yJ.js";
import { E as ve, i as fe, s as Ce, c as Te, _ as ee, u as Ee, a as Se, n as te, b as De, d as Ne, e as Le, f as Me, g as Oe, h as Ie, j as Pe, k as Be, l as Re, m as Ve, o as je } from "./AddPanel.vue_vue_type_script_setup_true_lang-BGy7c1Rc.js";
import { _ as me, c as Xe } from "./queryMode-B1MoVAIk.js";
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
function qe(n) {
  const t = n.content_type || "";
  if (he[t]) return he[t];
  const _ = n.metadata || {}, s = String(_.filename || _.source_url || _.title || ""), m = s.lastIndexOf(".");
  if (m > 0 && m < s.length - 1) {
    const d = s.slice(m + 1).split(/[?#]/)[0];
    if (d.length <= 5) return d.toUpperCase();
  }
  return _.source_url ? "URL" : t.startsWith("image/") ? "IMG" : "DOC";
}
function ke(n) {
  const t = n.content_type || "";
  return (n.metadata || {}).source_url ? "tabler:world" : t === "application/pdf" ? "tabler:file-type-pdf" : t === "text/markdown" ? "tabler:markdown" : t === "text/csv" || t.includes("spreadsheet") || t.includes("excel") ? "tabler:table" : t === "application/json" ? "tabler:json" : t.includes("word") || t.includes("document") ? "tabler:file-text" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:presentation" : t === "text/html" ? "tabler:file-code" : t.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function be(n) {
  if (!n) return "";
  const t = new Date(n), _ = t.getTime();
  if (Number.isNaN(_)) return "";
  const s = Date.now() - _, m = Math.round(s / 1e3);
  if (m < 45) return "just now";
  const d = Math.round(m / 60);
  if (d < 60) return `${d}m ago`;
  const h = Math.round(d / 60);
  if (h < 24) return `${h}h ago`;
  const T = Math.round(h / 24);
  return T < 7 ? `${T}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function ze(n) {
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
function Ae(n, t = {}) {
  const _ = b(!1), s = b(""), m = b([]), d = b(0), h = b(50), T = b(0), L = C(() => Math.max(1, Math.ceil(T.value / h.value))), D = C(() => d.value > 0), R = C(() => d.value < L.value - 1), E = b({}), A = 2e4, M = /* @__PURE__ */ new Map();
  function q(a) {
    const x = { ...E.value };
    delete x[a], E.value = x;
    const y = M.get(a);
    y && (clearTimeout(y), M.delete(a));
  }
  const z = m;
  function Z(a) {
    return z.value.find((x) => x.id === a);
  }
  let V = 0;
  async function U() {
    const a = n();
    if (!a) return;
    const x = ++V;
    _.value = !0, s.value = "";
    try {
      const y = d.value * h.value, { data: $ } = await le.get(`/api/v1/kb10/${a}/browse?node_type=document&limit=${h.value}&offset=${y}`);
      if (x !== V || n() !== a) return;
      if (!$?.success) {
        s.value = $?.error && fe($.error) ? ve : $?.error || "";
        return;
      }
      m.value = $.nodes || [], T.value = Number($.total) || 0;
    } catch (y) {
      if (x !== V) return;
      const $ = y?.response?.data?.error || y?.message || "could not load contents";
      s.value = fe($) ? ve : $, de.handleError(y?.response?.status === 401 ? "auth-expired" : "other", y);
    } finally {
      x === V && (_.value = !1);
    }
  }
  function K(a) {
    const x = Math.max(0, Math.min(a, L.value - 1));
    x !== d.value && (d.value = x, U());
  }
  function j() {
    R.value && K(d.value + 1);
  }
  function W() {
    D.value && K(d.value - 1);
  }
  async function oe(a) {
    const x = n();
    if (!x || E.value[a.id]) return !1;
    const y = Te(a);
    E.value = { ...E.value, [a.id]: !0 };
    let $ = !1;
    try {
      const { data: i } = await le.delete(`/api/v1/knowledge/${x}/content`, { data: y });
      i?.success ? ($ = !0, s.value = "Delete queued. The row clears once indexing catches up.") : s.value = i?.error || "could not queue delete";
    } catch (i) {
      s.value = i?.response?.data?.error || i?.message || "could not queue delete", de.handleError(i?.response?.status === 401 ? "auth-expired" : "other", i);
    } finally {
      if (!$)
        q(a.id);
      else {
        const i = a.id;
        M.set(i, setTimeout(() => {
          E.value[i] && (q(i), s.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, A));
      }
    }
    return $;
  }
  function J() {
    const a = Object.keys(E.value);
    if (a.length === 0) return;
    const x = new Set(m.value.map(($) => $.id)), y = a.filter(($) => !x.has($));
    if (y.length) {
      for (const $ of y) q($);
      Object.keys(E.value).length || (s.value = ""), t.onChanged?.();
    }
  }
  let w = !1, O = !1;
  async function G() {
    if (w) {
      O = !0;
      return;
    }
    w = !0;
    try {
      do
        O = !1, await U(), J();
      while (O);
    } finally {
      w = !1;
    }
  }
  let I = null, X = 0;
  function P(a) {
    const x = ++X;
    if (I && (I(), I = null), !a) return;
    const y = Ce(a, () => {
      G();
    });
    if (x !== X) {
      y && y();
      return;
    }
    I = y;
  }
  return ie(() => {
    X++, V++, I && I(), M.forEach((a) => clearTimeout(a)), M.clear();
  }), F(n, (a) => {
    d.value = 0, T.value = 0, U(), P(a);
  }, { immediate: !0 }), {
    loading: _,
    notice: s,
    nodes: m,
    documents: z,
    deleting: E,
    load: U,
    reload: U,
    remove: oe,
    findDoc: Z,
    page: d,
    pageSize: h,
    total: T,
    pageCount: L,
    hasPrev: D,
    hasNext: R,
    next: j,
    prev: W,
    goToPage: K
  };
}
const Ue = { class: "kx-railhead" }, Ke = { class: "kx-railhead-title" }, Ge = { key: 0 }, He = { class: "kx-railhead-acts" }, Fe = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(n) {
    return (t, _) => (o(), v("div", Ue, [
      r("span", Ke, [
        N(g(n.title), 1),
        n.count !== void 0 ? (o(), v("b", Ge, g(n.count), 1)) : S("", !0)
      ]),
      r("div", He, [
        pe(t.$slots, "actions")
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
  setup(n, { emit: t }) {
    const _ = n, s = t;
    function m(d) {
      d.key === "Escape" && !_.busy && s("cancel");
    }
    return F(() => _.open, (d) => {
      d ? window.addEventListener("keydown", m) : window.removeEventListener("keydown", m);
    }), ie(() => window.removeEventListener("keydown", m)), (d, h) => (o(), Y(ye, { name: "kx-modal" }, {
      default: H(() => [
        n.open ? (o(), v("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: h[3] || (h[3] = ge((T) => !n.busy && s("cancel"), ["self"]))
        }, [
          r("div", {
            class: ne(["kx-modal", { danger: n.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": n.title
          }, [
            r("div", Je, [
              r("span", Qe, [
                f(e(B), {
                  icon: n.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", Ye, [
                r("span", Ze, g(n.title), 1),
                n.subtitle ? (o(), v("span", et, g(n.subtitle), 1)) : S("", !0)
              ]),
              f(ee, {
                icon: "tabler:x",
                label: "Close",
                disabled: n.busy,
                onClick: h[0] || (h[0] = (T) => s("cancel"))
              }, null, 8, ["disabled"])
            ]),
            r("div", tt, [
              pe(d.$slots, "default")
            ]),
            r("div", nt, [
              f(me, {
                variant: "ghost",
                disabled: n.busy,
                onClick: h[1] || (h[1] = (T) => s("cancel"))
              }, {
                default: H(() => [
                  N(g(n.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(me, {
                variant: n.danger ? "danger" : "primary",
                loading: n.busy,
                disabled: n.busy,
                onClick: h[2] || (h[2] = (T) => s("confirm"))
              }, {
                default: H(() => [
                  N(g(n.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, We)
        ])) : S("", !0)
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
}, Ct = ["aria-expanded", "onClick"], Tt = { class: "dr-chunk-n" }, Et = { class: "dr-chunk-label" }, St = {
  key: 0,
  class: "dr-chunk-cx"
}, Dt = 720, Nt = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(n) {
    const t = n, _ = b(!1), s = b(""), m = b(""), d = b(""), h = b([]), T = b(0), L = b(""), D = b("read"), R = b(!1), E = b({});
    function A(i) {
      return String((i.metadata || {}).contextual_prefix || "");
    }
    const M = C(() => t.node.metadata || {}), q = C(() => M.value.source_url), z = C(() => d.value || t.node.content_type || "text/markdown"), Z = C(() => String(M.value.original_mime_type || M.value.source_mime || "")), V = C(() => Ee(M.value) ? Se(Z.value || t.node.content_type || "") : !1), U = C(() => `/api/v1/kb10/${t.kbId}/nodes/${t.node.id}/source`), K = C(() => String(M.value.filename || M.value.original_filename || "")), j = C(() => m.value ? m.value : h.value.map((i) => i.content).filter(Boolean).join(`

`)), W = C(() => {
      const i = j.value.trim();
      return i ? i.split(/\s+/).length : 0;
    });
    function oe() {
      V.value && (R.value = !R.value);
    }
    const J = b(null), w = b(!1), O = b(!1);
    function G() {
      const i = J.value;
      if (!i) {
        O.value = !1;
        return;
      }
      O.value = i.scrollHeight - Dt > 24;
    }
    let I = null;
    function X() {
      I?.disconnect();
      const i = J.value;
      i && (I = new ResizeObserver(() => G()), I.observe(i), ce(G));
    }
    const P = C(() => O.value && !w.value);
    let a = 0;
    async function x() {
      if (!t.kbId || !t.node?.id) return;
      const i = ++a;
      _.value = !0, s.value = "", m.value = "", d.value = "", h.value = [], T.value = 0, L.value = "", D.value = "read", E.value = {}, w.value = !1, O.value = !1;
      try {
        const [{ data: p }, { data: k }, { data: u }] = await Promise.all([
          le.get(`/api/v1/kb10/${t.kbId}/browse?node_id=${t.node.id}`),
          le.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=chunk&include_content=true&limit=200`),
          le.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (i !== a) return;
        if (p?.success && p.node && (m.value = String(p.node.content || ""), d.value = String(p.node.content_type || "")), k?.success) {
          if (!Number.isInteger(k.total) || k.total < 0) throw new Error("Invalid chunk total");
          T.value = k.total;
          const l = k.nodes;
          if (h.value = l.filter((c) => c.node_type === "chunk").sort((c, Q) => Number((c.metadata || {}).index ?? (c.metadata || {}).chunk_index ?? 0) - Number((Q.metadata || {}).index ?? (Q.metadata || {}).chunk_index ?? 0)), !u?.success) throw new Error(u?.error || "could not load summary");
          L.value = u.nodes[0]?.content || "", m.value || (m.value = L.value || t.node.content || "");
        }
        !p?.success && !k?.success && (s.value = p?.error || k?.error || "could not load document");
      } catch (p) {
        if (i !== a) return;
        s.value = p?.response?.data?.error || p?.message || "could not load document", de.handleError(p?.response?.status === 401 ? "auth-expired" : "other", p);
      } finally {
        i === a && (_.value = !1);
      }
    }
    const y = C(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: T.value || void 0 }
    ]);
    function $(i) {
      E.value = { ...E.value, [i.id]: !E.value[i.id] };
    }
    return F([j, D, _], () => {
      D.value === "read" && !_.value && ce(X);
    }), F(V, (i) => {
      i || (R.value = !1);
    }), F(() => t.node?.id, () => x(), { immediate: !0 }), ie(() => {
      I?.disconnect();
    }), (i, p) => (o(), v("div", lt, [
      r("header", ot, [
        r("span", st, [
          f(e(B), {
            icon: e(ke)(n.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        r("div", it, [
          r("div", rt, [
            r("h2", ut, g(e(te)(n.node)), 1),
            V.value ? (o(), Y(e(De), {
              key: 0,
              class: ne(["dr-orig-btn", { on: R.value }]),
              label: R.value ? "Hide original" : "View original",
              onOpen: oe
            }, null, 8, ["class", "label"])) : S("", !0)
          ]),
          r("div", dt, [
            T.value ? (o(), v("span", ct, [
              f(e(B), { icon: "tabler:layout-grid" }),
              N(g(T.value.toLocaleString()) + " chunks", 1)
            ])) : S("", !0),
            W.value ? (o(), v("span", vt, [
              f(e(B), { icon: "tabler:align-left" }),
              N(g(W.value.toLocaleString()) + " words", 1)
            ])) : S("", !0),
            n.node.created_at ? (o(), v("span", {
              key: 2,
              class: "dr-fact",
              title: e(ze)(n.node.created_at)
            }, [
              f(e(B), { icon: "tabler:clock" }),
              N(g(e(be)(n.node.created_at)), 1)
            ], 8, ft)) : S("", !0),
            q.value ? (o(), v("a", {
              key: 3,
              class: "dr-fact link",
              href: q.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(e(B), { icon: "tabler:external-link" }),
              p[3] || (p[3] = N("Source", -1))
            ], 8, mt)) : S("", !0)
          ])
        ])
      ]),
      f(e(Ne), {
        tabs: y.value,
        active: D.value,
        onSelect: p[0] || (p[0] = (k) => D.value = k)
      }, null, 8, ["tabs", "active"]),
      _.value ? (o(), v("div", ht, [
        (o(), v(ae, null, se(6, (k) => r("div", {
          key: k,
          class: "dr-skel-line"
        })), 64))
      ])) : s.value ? (o(), v("div", pt, [
        f(e(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        N(" " + g(s.value), 1)
      ])) : (o(), v(ae, { key: 2 }, [
        D.value === "read" ? (o(), v("div", kt, [
          r("div", bt, [
            L.value ? (o(), Y(e(Le), {
              key: 0,
              text: L.value
            }, null, 8, ["text"])) : S("", !0),
            j.value ? (o(), v("div", {
              key: 1,
              class: ne(["dr-clamp", { clamped: P.value }])
            }, [
              r("div", {
                ref_key: "bodyRef",
                ref: J,
                class: "dr-clamp-inner"
              }, [
                r("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": z.value,
                  source: j.value,
                  filename: K.value
                }, null, 8, yt)
              ], 512),
              P.value ? (o(), v("div", gt)) : S("", !0)
            ], 2)) : S("", !0),
            O.value ? (o(), v("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": w.value,
              onClick: p[1] || (p[1] = (k) => w.value = !w.value)
            }, [
              f(e(B), {
                icon: w.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(" " + g(w.value ? "Show less" : "Show more"), 1)
            ], 8, _t)) : S("", !0),
            j.value ? S("", !0) : (o(), v("div", wt, [
              f(e(B), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              p[4] || (p[4] = N(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (o(), v("div", $t, [
          h.value.length ? S("", !0) : (o(), v("div", xt, [
            f(e(B), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            p[5] || (p[5] = N(" This document has no chunks.", -1))
          ])),
          (o(!0), v(ae, null, se(h.value, (k, u) => (o(), v("div", {
            key: k.id,
            class: ne(["dr-chunk", { open: E.value[k.id] }])
          }, [
            r("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!E.value[k.id],
              onClick: (l) => $(k)
            }, [
              r("span", Tt, g(u + 1), 1),
              r("span", Et, "Chunk " + g(u + 1), 1),
              f(e(B), {
                class: "dr-chunk-chev",
                icon: E.value[k.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Ct),
            A(k) ? (o(), v("p", St, [
              f(e(B), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              r("span", null, g(A(k)), 1)
            ])) : S("", !0),
            r("p", {
              class: ne(["dr-chunk-body", { clamp: !E.value[k.id] }])
            }, g(k.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(e(Me), {
        contained: "",
        open: R.value && V.value,
        title: K.value || "Original",
        "content-type": Z.value || n.node.content_type || "",
        "source-url": U.value,
        filename: K.value,
        onClose: p[2] || (p[2] = (k) => R.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Lt = { class: "kb-page kd" }, Mt = { class: "kd-filter" }, Ot = {
  class: "kd-list",
  "aria-label": "Documents"
}, It = {
  key: 0,
  class: "kd-list-skel"
}, Pt = ["disabled", "onClick"], Bt = { class: "kd-row-ic" }, Rt = { class: "kd-row-main" }, Vt = { class: "kd-row-title" }, jt = { class: "kd-row-sub" }, Xt = {
  key: 1,
  class: "kd-list-empty"
}, qt = {
  key: 0,
  class: "kd-pager"
}, zt = { class: "kd-pager-label" }, At = { class: "kx-main-scroll kd-reader" }, Ut = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(n) {
    const t = $e(), _ = xe(), s = C(() => t.value.config?.kb_id || ""), m = C(() => t.value.config?.route || "");
    let d = !1;
    const {
      loading: h,
      notice: T,
      documents: L,
      deleting: D,
      reload: R,
      remove: E,
      findDoc: A,
      page: M,
      pageSize: q,
      total: z,
      hasPrev: Z,
      hasNext: V,
      next: U,
      prev: K
    } = Ae(() => s.value), j = b(""), W = C(() => {
      const u = j.value.trim().toLowerCase();
      return u ? L.value.filter((l) => te(l).toLowerCase().includes(u)) : L.value;
    }), oe = C(() => z.value === 0 ? 0 : M.value * q.value + 1), J = C(() => Math.min((M.value + 1) * q.value, z.value)), w = b(""), O = C(() => D.value[w.value] ? null : A(w.value) || null), G = b(!1);
    async function I() {
      if (!s.value) {
        G.value = !1;
        return;
      }
      try {
        const { data: u } = await le.get(`/api/v1/knowledge/${s.value}`), l = u?.config || {};
        G.value = Xe(l);
      } catch {
        G.value = !1;
      }
    }
    F(s, I, { immediate: !0 });
    const X = b(!1), P = b(!1), a = b(null), x = C(() => !!a.value && !!D.value[a.value.id]);
    function y(u) {
      if (D.value[u.id]) return;
      const l = w.value !== u.id;
      w.value = u.id, l && !d && _("navigate", u.id);
    }
    function $(u) {
      const l = A(u);
      l && (y(l), P.value = !1);
    }
    function i(u) {
      a.value = u;
    }
    async function p() {
      const u = a.value;
      if (!u) return;
      await E(u) && (w.value === u.id && (w.value = ""), a.value = null);
    }
    function k(u) {
      u.key === "Escape" && P.value && (P.value = !1);
    }
    return _e(() => {
      window.addEventListener("keydown", k), we("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", k)), F(L, (u) => {
      if (O.value) return;
      const l = u.filter((ue) => !D.value[ue.id]), Q = (m.value ? l.find((ue) => ue.id === m.value) : null) || l[0];
      if (Q) {
        d = !0;
        try {
          y(Q);
        } finally {
          d = !1;
        }
      } else A(w.value) || (w.value = "");
    }), F(s, () => {
      w.value = "";
    }), F(m, (u) => {
      if (!u || u === w.value) return;
      const l = A(u);
      if (l) {
        d = !0;
        try {
          y(l);
        } finally {
          d = !1;
        }
      }
    }), (u, l) => (o(), v("div", Lt, [
      e(T) ? (o(), Y(e(Oe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          N(g(e(T)), 1)
        ]),
        _: 1
      })) : S("", !0),
      f(e(Ie), null, {
        rail: H(() => [
          f(e(Fe), {
            title: "Documents",
            count: e(z)
          }, {
            actions: H(() => [
              f(e(ee), {
                icon: "tabler:search",
                label: "Search",
                active: P.value,
                onClick: l[0] || (l[0] = (c) => P.value = !P.value)
              }, null, 8, ["active"]),
              f(e(ee), {
                icon: "tabler:plus",
                label: "Add document",
                active: X.value,
                onClick: l[1] || (l[1] = (c) => X.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          r("div", Mt, [
            f(e(Re), {
              modelValue: j.value,
              "onUpdate:modelValue": l[2] || (l[2] = (c) => j.value = c),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          r("nav", Ot, [
            e(h) && !e(L).length ? (o(), v("div", It, [
              (o(), v(ae, null, se(6, (c) => r("div", {
                key: c,
                class: "kd-skel-row"
              })), 64))
            ])) : S("", !0),
            (o(!0), v(ae, null, se(W.value, (c) => (o(), v("div", {
              key: c.id,
              class: ne(["kd-row", { on: w.value === c.id }])
            }, [
              r("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(D)[c.id],
                onClick: (Q) => y(c)
              }, [
                r("span", Bt, [
                  f(e(B), {
                    icon: e(ke)(c),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("span", Rt, [
                  r("span", Vt, g(e(te)(c)), 1),
                  r("span", jt, [
                    N(g(e(qe)(c)), 1),
                    c.created_at ? (o(), v(ae, { key: 0 }, [
                      N(" · " + g(e(be)(c.created_at)), 1)
                    ], 64)) : S("", !0)
                  ])
                ])
              ], 8, Pt),
              f(e(ee), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(te)(c)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(D)[c.id],
                disabled: !!e(D)[c.id],
                onClick: (Q) => i(c)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(h) && !W.value.length ? (o(), v("div", Xt, g(e(L).length ? "No documents match." : "No documents yet — add one with +."), 1)) : S("", !0)
          ]),
          e(z) > e(q) ? (o(), v("div", qt, [
            f(e(ee), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(Z),
              onClick: e(K)
            }, null, 8, ["disabled", "onClick"]),
            r("span", zt, g(oe.value) + "–" + g(J.value) + " of " + g(e(z)), 1),
            f(e(ee), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(V),
              onClick: e(U)
            }, null, 8, ["disabled", "onClick"])
          ])) : S("", !0)
        ]),
        default: H(() => [
          r("div", At, [
            P.value ? (o(), Y(e(Pe), {
              key: 0,
              "kb-id": s.value,
              layout: "panel",
              ask: G.value,
              onOpen: l[3] || (l[3] = (c) => c.parent_id && $(c.parent_id)),
              onClose: l[4] || (l[4] = (c) => P.value = !1)
            }, null, 8, ["kb-id", "ask"])) : O.value ? (o(), Y(Nt, {
              key: 1,
              "kb-id": s.value,
              node: O.value
            }, null, 8, ["kb-id", "node"])) : (o(), Y(Be, {
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
      f(e(Ve), {
        open: X.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: l[6] || (l[6] = (c) => X.value = !1)
      }, {
        default: H(() => [
          f(je, {
            "kb-id": s.value,
            noun: "document",
            onChanged: l[5] || (l[5] = (c) => {
              X.value = !1, e(R)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(e(at), {
        open: !!a.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: a.value ? e(te)(a.value) : "",
        "confirm-label": "Delete",
        busy: x.value,
        onCancel: l[7] || (l[7] = (c) => a.value = null),
        onConfirm: p
      }, {
        default: H(() => [
          l[8] || (l[8] = N(" Remove ", -1)),
          r("strong", null, g(a.value ? e(te)(a.value) : ""), 1),
          l[9] || (l[9] = N(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Qt = {
  rootComponent: Ut
};
export {
  Qt as mountConfig
};
//# sourceMappingURL=document-mount-a4aHJo2O.js.map
