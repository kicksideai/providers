import { ref as k, computed as x, onBeforeUnmount as ve, watch as Z, defineComponent as fe, openBlock as i, createElementBlock as f, createElementVNode as d, createTextVNode as T, toDisplayString as b, createCommentVNode as w, renderSlot as we, createBlock as G, Transition as Ne, withCtx as H, withModifiers as Te, normalizeClass as se, createVNode as p, unref as e, nextTick as he, Fragment as Y, renderList as ce, onMounted as Se } from "vue";
import { Icon as V } from "@iconify/vue";
import { api as re, host as me, loadByTagName as Ee } from "@wippy-fe/proxy";
import { a as De, u as Ie } from "./wc-runtime-f54Bo-yJ.js";
import { E as ke, i as be, f as Me, s as Le, c as Oe, _ as oe, u as Pe, a as Re, n as ie, b as Be, d as xe, e as qe, g as Ve, h as ge, j as je, k as Ue, l as Xe, m as ze, o as Ae, p as Ke } from "./AddPanel.vue_vue_type_script_setup_true_lang-U0Aq1ezl.js";
import { _ as ye } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const _e = {
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
function Fe(a) {
  const n = a.content_type || "";
  if (_e[n]) return _e[n];
  const _ = a.metadata || {}, c = String(_.filename || _.source_url || _.title || ""), y = c.lastIndexOf(".");
  if (y > 0 && y < c.length - 1) {
    const h = c.slice(y + 1).split(/[?#]/)[0];
    if (h.length <= 5) return h.toUpperCase();
  }
  return _.source_url ? "URL" : n.startsWith("image/") ? "IMG" : "DOC";
}
function $e(a) {
  const n = a.content_type || "";
  return (a.metadata || {}).source_url ? "tabler:world" : n === "application/pdf" ? "tabler:file-type-pdf" : n === "text/markdown" ? "tabler:markdown" : n === "text/csv" || n.includes("spreadsheet") || n.includes("excel") ? "tabler:table" : n === "application/json" ? "tabler:json" : n.includes("word") || n.includes("document") ? "tabler:file-text" : n.includes("presentation") || n.includes("powerpoint") ? "tabler:presentation" : n === "text/html" ? "tabler:file-code" : n.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Ce(a) {
  if (!a) return "";
  const n = new Date(a), _ = n.getTime();
  if (Number.isNaN(_)) return "";
  const c = Date.now() - _, y = Math.round(c / 1e3);
  if (y < 45) return "just now";
  const h = Math.round(y / 60);
  if (h < 60) return `${h}m ago`;
  const r = Math.round(h / 60);
  if (r < 24) return `${r}h ago`;
  const $ = Math.round(r / 24);
  return $ < 7 ? `${$}d ago` : n.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function He(a) {
  if (!a) return "";
  const n = new Date(a);
  return Number.isNaN(n.getTime()) ? "" : n.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ge(a, n = {}) {
  const _ = k(!1), c = k(""), y = k(""), h = k([]), r = k(0), $ = k(50), L = k(0), O = x(() => Math.max(1, Math.ceil(L.value / $.value))), P = x(() => r.value > 0), I = x(() => r.value < O.value - 1), C = k({}), E = 2e4, X = /* @__PURE__ */ new Map(), ee = /* @__PURE__ */ new Map();
  function R(s) {
    const v = { ...C.value };
    delete v[s], C.value = v;
    const t = X.get(s);
    t && (clearTimeout(t), X.delete(s)), ee.delete(s);
  }
  const z = h;
  function te(s) {
    return z.value.find((v) => v.id === s);
  }
  let D = 0;
  async function B() {
    const s = a();
    if (!s) return;
    const v = ++D;
    _.value = !0, c.value = "";
    try {
      const t = r.value * $.value, o = n.includeIndexing ? "&include_indexing=true" : "", l = n.scope?.(), F = l ? `scope=${l}` : "node_type=document", { data: q } = await re.get(`/api/v1/kb10/${s}/browse?${F}&limit=${$.value}&offset=${t}${o}`);
      if (v !== D || a() !== s) return;
      if (!q?.success) {
        c.value = q?.error && be(q.error) ? ke : q?.error || "";
        return;
      }
      return h.value = q.nodes || [], L.value = Number(q.total) || 0, y.value = Me(q.pending_source), !0;
    } catch (t) {
      if (v !== D) return;
      const o = t?.response?.data?.error || t?.message || "could not load contents";
      c.value = be(o) ? ke : o, me.handleError(t?.response?.status === 401 ? "auth-expired" : "other", t);
    } finally {
      v === D && (_.value = !1);
    }
  }
  function W(s) {
    const v = Math.max(0, Math.min(s, O.value - 1));
    v !== r.value && (r.value = v, B());
  }
  function ue() {
    I.value && W(r.value + 1);
  }
  function ne() {
    P.value && W(r.value - 1);
  }
  async function M(s) {
    const v = a();
    if (!v || C.value[s.id]) return !1;
    const t = Oe(s);
    ee.set(s.id, { kbId: v, scope: n.scope?.() }), C.value = { ...C.value, [s.id]: !0 };
    let o = !1;
    try {
      const { data: l } = await re.delete(`/api/v1/knowledge/${v}/content`, { data: t });
      l?.success ? (o = !0, c.value = "Delete queued. The row clears once indexing catches up.") : c.value = l?.error || "could not queue delete";
    } catch (l) {
      c.value = l?.response?.data?.error || l?.message || "could not queue delete", me.handleError(l?.response?.status === 401 ? "auth-expired" : "other", l);
    } finally {
      if (!o)
        R(s.id);
      else {
        const l = s.id;
        X.set(l, setTimeout(() => {
          C.value[l] && (R(l), c.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, E));
      }
    }
    return o;
  }
  function A() {
    const s = Object.keys(C.value);
    if (s.length === 0) return;
    const v = new Set(h.value.map((o) => o.id)), t = s.filter((o) => {
      const l = ee.get(o);
      return l?.kbId === a() && l.scope === n.scope?.() && !v.has(o);
    });
    if (t.length) {
      for (const o of t) R(o);
      Object.keys(C.value).length || (c.value = ""), n.onChanged?.();
    }
  }
  let J = !1, K = !1;
  async function S() {
    if (J) {
      K = !0;
      return;
    }
    J = !0;
    try {
      do
        K = !1, await B() && A();
      while (K);
    } finally {
      J = !1;
    }
  }
  let N = null, j = 0;
  function Q(s) {
    const v = ++j;
    if (N && (N(), N = null), !s) return;
    const t = Le(s, () => {
      S();
    });
    if (v !== j) {
      t && t();
      return;
    }
    N = t;
  }
  return ve(() => {
    j++, D++, N && N(), X.forEach((s) => clearTimeout(s)), X.clear();
  }), Z([a, () => n.scope?.()], ([s], [v]) => {
    r.value = 0, L.value = 0, h.value = [], y.value = "", B(), s !== v && Q(s);
  }, { immediate: !0 }), {
    loading: _,
    notice: c,
    indexingNotice: y,
    nodes: h,
    documents: z,
    deleting: C,
    load: B,
    reload: B,
    remove: M,
    findDoc: te,
    page: r,
    pageSize: $,
    total: L,
    pageCount: O,
    hasPrev: P,
    hasNext: I,
    next: ue,
    prev: ne,
    goToPage: W
  };
}
const We = { class: "kx-railhead" }, Je = { class: "kx-railhead-title" }, Qe = { key: 0 }, Ye = { class: "kx-railhead-acts" }, Ze = /* @__PURE__ */ fe({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(a) {
    return (n, _) => (i(), f("div", We, [
      d("span", Je, [
        T(b(a.title), 1),
        a.count !== void 0 ? (i(), f("b", Qe, b(a.count), 1)) : w("", !0)
      ]),
      d("div", Ye, [
        we(n.$slots, "actions")
      ])
    ]));
  }
}), et = ["aria-label"], tt = { class: "kx-modal-h" }, nt = { class: "kx-modal-h-ico" }, at = { class: "kx-modal-h-text" }, lt = { class: "kx-modal-h-title" }, ot = {
  key: 0,
  class: "kx-modal-h-sub"
}, it = { class: "kx-modal-body" }, st = { class: "kx-modal-foot" }, rt = /* @__PURE__ */ fe({
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
  setup(a, { emit: n }) {
    const _ = a, c = n;
    function y(h) {
      h.key === "Escape" && !_.busy && c("cancel");
    }
    return Z(() => _.open, (h) => {
      h ? window.addEventListener("keydown", y) : window.removeEventListener("keydown", y);
    }), ve(() => window.removeEventListener("keydown", y)), (h, r) => (i(), G(Ne, { name: "kx-modal" }, {
      default: H(() => [
        a.open ? (i(), f("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: r[3] || (r[3] = Te(($) => !a.busy && c("cancel"), ["self"]))
        }, [
          d("div", {
            class: se(["kx-modal", { danger: a.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": a.title
          }, [
            d("div", tt, [
              d("span", nt, [
                p(e(V), {
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", at, [
                d("span", lt, b(a.title), 1),
                a.subtitle ? (i(), f("span", ot, b(a.subtitle), 1)) : w("", !0)
              ]),
              p(oe, {
                icon: "tabler:x",
                label: "Close",
                disabled: a.busy,
                onClick: r[0] || (r[0] = ($) => c("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", it, [
              we(h.$slots, "default")
            ]),
            d("div", st, [
              p(ye, {
                variant: "ghost",
                disabled: a.busy,
                onClick: r[1] || (r[1] = ($) => c("cancel"))
              }, {
                default: H(() => [
                  T(b(a.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              p(ye, {
                variant: a.danger ? "danger" : "primary",
                loading: a.busy,
                disabled: a.busy,
                onClick: r[2] || (r[2] = ($) => c("confirm"))
              }, {
                default: H(() => [
                  T(b(a.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, et)
        ])) : w("", !0)
      ]),
      _: 3
    }));
  }
}), ut = { class: "dr" }, dt = { class: "dr-head" }, ct = { class: "dr-badge" }, vt = { class: "dr-head-body" }, ft = { class: "dr-head-top" }, mt = { class: "dr-title" }, pt = { class: "dr-facts" }, ht = {
  key: 0,
  class: "dr-fact"
}, kt = {
  key: 1,
  class: "dr-fact"
}, bt = ["title"], gt = ["href"], yt = {
  key: 0,
  class: "dr-skel"
}, _t = {
  key: 1,
  class: "dr-state err"
}, wt = {
  key: 0,
  class: "dr-doc"
}, xt = { class: "dr-doc-main" }, $t = ["content-type", "source", "filename"], Ct = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Nt = ["aria-expanded"], Tt = {
  key: 3,
  class: "dr-state"
}, St = {
  key: 1,
  class: "dr-chunks"
}, Et = {
  key: 0,
  class: "dr-state"
}, Dt = ["aria-expanded", "onClick"], It = { class: "dr-chunk-n" }, Mt = { class: "dr-chunk-label" }, Lt = {
  key: 0,
  class: "dr-chunk-cx"
}, Ot = 720, Pt = /* @__PURE__ */ fe({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(a) {
    const n = a, _ = k(!1), c = k(""), y = k(""), h = k(""), r = k([]), $ = k(0), L = k(""), O = k("read"), P = k(!1), I = k({});
    function C(t) {
      return String((t.metadata || {}).contextual_prefix || "");
    }
    const E = x(() => n.node.metadata || {}), X = x(() => E.value.source_url), ee = x(() => h.value || n.node.content_type || "text/markdown"), R = x(() => String(E.value.original_mime_type || E.value.source_mime || "")), z = x(() => Pe(E.value) ? Re(R.value || n.node.content_type || "") : !1), te = x(() => `/api/v1/kb10/${n.kbId}/nodes/${n.node.id}/source`), D = x(() => String(E.value.filename || E.value.original_filename || "")), B = x(() => y.value ? y.value : r.value.map((t) => t.content).filter(Boolean).join(`

`)), W = x(() => {
      const t = B.value.trim();
      return t ? t.split(/\s+/).length : 0;
    });
    function ue() {
      z.value && (P.value = !P.value);
    }
    const ne = k(null), M = k(!1), A = k(!1);
    function J() {
      const t = ne.value;
      if (!t) {
        A.value = !1;
        return;
      }
      A.value = t.scrollHeight - Ot > 24;
    }
    let K = null;
    function S() {
      K?.disconnect();
      const t = ne.value;
      t && (K = new ResizeObserver(() => J()), K.observe(t), he(J));
    }
    const N = x(() => A.value && !M.value);
    let j = 0;
    async function Q() {
      if (!n.kbId || !n.node?.id) return;
      const t = ++j;
      _.value = !0, c.value = "", y.value = "", h.value = "", r.value = [], $.value = 0, L.value = "", O.value = "read", I.value = {}, M.value = !1, A.value = !1;
      try {
        const [{ data: o }, { data: l }, { data: F }] = await Promise.all([
          re.get(`/api/v1/kb10/${n.kbId}/browse?node_id=${n.node.id}`),
          re.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=chunk&include_content=true&limit=200`),
          re.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (t !== j) return;
        if (o?.success && o.node && (y.value = String(o.node.content || ""), h.value = String(o.node.content_type || "")), l?.success) {
          if (!Number.isInteger(l.total) || l.total < 0) throw new Error("Invalid chunk total");
          $.value = l.total;
          const q = l.nodes;
          if (r.value = q.filter((le) => le.node_type === "chunk").sort((le, de) => Number((le.metadata || {}).index ?? (le.metadata || {}).chunk_index ?? 0) - Number((de.metadata || {}).index ?? (de.metadata || {}).chunk_index ?? 0)), !F?.success) throw new Error(F?.error || "could not load summary");
          L.value = F.nodes[0]?.content || "", y.value || (y.value = L.value || n.node.content || "");
        }
        !o?.success && !l?.success && (c.value = o?.error || l?.error || "could not load document");
      } catch (o) {
        if (t !== j) return;
        c.value = o?.response?.data?.error || o?.message || "could not load document", me.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
      } finally {
        t === j && (_.value = !1);
      }
    }
    const s = x(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: $.value || void 0 }
    ]);
    function v(t) {
      I.value = { ...I.value, [t.id]: !I.value[t.id] };
    }
    return Z([B, O, _], () => {
      O.value === "read" && !_.value && he(S);
    }), Z(z, (t) => {
      t || (P.value = !1);
    }), Z(() => n.node?.id, () => Q(), { immediate: !0 }), ve(() => {
      K?.disconnect();
    }), (t, o) => (i(), f("div", ut, [
      d("header", dt, [
        d("span", ct, [
          p(e(V), {
            icon: e($e)(a.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        d("div", vt, [
          d("div", ft, [
            d("h2", mt, b(e(ie)(a.node)), 1),
            z.value ? (i(), G(e(Be), {
              key: 0,
              class: se(["dr-orig-btn", { on: P.value }]),
              label: P.value ? "Hide original" : "View original",
              onOpen: ue
            }, null, 8, ["class", "label"])) : w("", !0)
          ]),
          d("div", pt, [
            $.value ? (i(), f("span", ht, [
              p(e(V), { icon: "tabler:layout-grid" }),
              T(b($.value.toLocaleString()) + " chunks", 1)
            ])) : w("", !0),
            W.value ? (i(), f("span", kt, [
              p(e(V), { icon: "tabler:align-left" }),
              T(b(W.value.toLocaleString()) + " words", 1)
            ])) : w("", !0),
            a.node.created_at ? (i(), f("span", {
              key: 2,
              class: "dr-fact",
              title: e(He)(a.node.created_at)
            }, [
              p(e(V), { icon: "tabler:clock" }),
              T(b(e(Ce)(a.node.created_at)), 1)
            ], 8, bt)) : w("", !0),
            X.value ? (i(), f("a", {
              key: 3,
              class: "dr-fact link",
              href: X.value,
              target: "_blank",
              rel: "noopener"
            }, [
              p(e(V), { icon: "tabler:external-link" }),
              o[3] || (o[3] = T("Source", -1))
            ], 8, gt)) : w("", !0)
          ])
        ])
      ]),
      p(e(xe), {
        tabs: s.value,
        active: O.value,
        onSelect: o[0] || (o[0] = (l) => O.value = l)
      }, null, 8, ["tabs", "active"]),
      _.value ? (i(), f("div", yt, [
        (i(), f(Y, null, ce(6, (l) => d("div", {
          key: l,
          class: "dr-skel-line"
        })), 64))
      ])) : c.value ? (i(), f("div", _t, [
        p(e(V), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        T(" " + b(c.value), 1)
      ])) : (i(), f(Y, { key: 2 }, [
        O.value === "read" ? (i(), f("div", wt, [
          d("div", xt, [
            L.value ? (i(), G(e(qe), {
              key: 0,
              text: L.value
            }, null, 8, ["text"])) : w("", !0),
            B.value ? (i(), f("div", {
              key: 1,
              class: se(["dr-clamp", { clamped: N.value }])
            }, [
              d("div", {
                ref_key: "bodyRef",
                ref: ne,
                class: "dr-clamp-inner"
              }, [
                d("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": ee.value,
                  source: B.value,
                  filename: D.value
                }, null, 8, $t)
              ], 512),
              N.value ? (i(), f("div", Ct)) : w("", !0)
            ], 2)) : w("", !0),
            A.value ? (i(), f("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": M.value,
              onClick: o[1] || (o[1] = (l) => M.value = !M.value)
            }, [
              p(e(V), {
                icon: M.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              T(" " + b(M.value ? "Show less" : "Show more"), 1)
            ], 8, Nt)) : w("", !0),
            B.value ? w("", !0) : (i(), f("div", Tt, [
              p(e(V), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              o[4] || (o[4] = T(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (i(), f("div", St, [
          r.value.length ? w("", !0) : (i(), f("div", Et, [
            p(e(V), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = T(" This document has no chunks.", -1))
          ])),
          (i(!0), f(Y, null, ce(r.value, (l, F) => (i(), f("div", {
            key: l.id,
            class: se(["dr-chunk", { open: I.value[l.id] }])
          }, [
            d("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!I.value[l.id],
              onClick: (q) => v(l)
            }, [
              d("span", It, b(F + 1), 1),
              d("span", Mt, "Chunk " + b(F + 1), 1),
              p(e(V), {
                class: "dr-chunk-chev",
                icon: I.value[l.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Dt),
            C(l) ? (i(), f("p", Lt, [
              p(e(V), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              d("span", null, b(C(l)), 1)
            ])) : w("", !0),
            d("p", {
              class: se(["dr-chunk-body", { clamp: !I.value[l.id] }])
            }, b(l.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      p(e(Ve), {
        contained: "",
        open: P.value && z.value,
        title: D.value || "Original",
        "content-type": R.value || a.node.content_type || "",
        "source-url": te.value,
        filename: D.value,
        onClose: o[2] || (o[2] = (l) => P.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Rt = { class: "kb-page kd" }, Bt = { class: "kd-filter" }, qt = ["aria-label"], Vt = {
  key: 0,
  class: "kd-list-skel"
}, jt = ["disabled", "onClick"], Ut = { class: "kd-row-ic" }, Xt = { class: "kd-row-main" }, zt = { class: "kd-row-title" }, At = { class: "kd-row-sub" }, Kt = {
  key: 1,
  class: "kd-list-empty"
}, Ft = {
  key: 0,
  class: "kd-pager"
}, Ht = { class: "kd-pager-label" }, Gt = { class: "kx-main-scroll kd-reader" }, Wt = /* @__PURE__ */ fe({
  __name: "KbDocument",
  setup(a) {
    const n = De(), _ = Ie(), c = x(() => n.value.config?.kb_id || ""), y = x(() => n.value.config?.route || "");
    let h = !1;
    const r = k("documents"), $ = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], L = x(() => r.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: O,
      notice: P,
      indexingNotice: I,
      documents: C,
      deleting: E,
      reload: X,
      remove: ee,
      findDoc: R,
      page: z,
      pageSize: te,
      total: D,
      hasPrev: B,
      hasNext: W,
      next: ue,
      prev: ne
    } = Ge(() => c.value, { includeIndexing: !0, scope: () => r.value }), M = k(""), A = x(() => {
      const g = M.value.trim().toLowerCase();
      return g ? C.value.filter((u) => ie(u).toLowerCase().includes(g)) : C.value;
    }), J = x(() => D.value === 0 ? 0 : z.value * te.value + 1), K = x(() => Math.min((z.value + 1) * te.value, D.value)), S = k(""), N = k(null), j = x(() => E.value[S.value] ? null : R(S.value) || (N.value?.id === S.value ? N.value : null));
    let Q = 0;
    const s = k(!1), v = k(!1), t = k(null), o = x(() => !!t.value && !!E.value[t.value.id]);
    function l(g) {
      if (E.value[g.id]) return;
      const u = S.value !== g.id;
      S.value = g.id, u && !h && _("navigate", g.id);
    }
    function F(g) {
      const u = R(g);
      u && (l(u), v.value = !1);
    }
    function q(g) {
      g !== r.value && (Q++, v.value = !1, S.value = "", N.value = null, M.value = "", r.value = g === "failures" ? "failures" : "documents");
    }
    function le(g) {
      t.value = g;
    }
    async function de() {
      const g = t.value;
      if (!g) return;
      await ee(g) && (S.value === g.id && (S.value = ""), t.value = null);
    }
    function pe(g) {
      g.key === "Escape" && v.value && (v.value = !1);
    }
    return Se(() => {
      window.addEventListener("keydown", pe), Ee("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ve(() => {
      Q++, window.removeEventListener("keydown", pe);
    }), Z(C, (g) => {
      if (N.value && R(N.value.id) && (N.value = null), j.value) return;
      const u = g.filter((ae) => !E.value[ae.id]), U = (y.value ? u.find((ae) => ae.id === y.value) : null) || u[0];
      if (U) {
        h = !0;
        try {
          l(U);
        } finally {
          h = !1;
        }
      } else R(S.value) || (S.value = "");
    }), Z(c, () => {
      S.value = "";
    }), Z([c, y], async ([g, u]) => {
      const m = ++Q;
      if (N.value?.id !== u && (N.value = null), !g || !u || u === S.value) return;
      let U = R(u);
      if (!U)
        try {
          const { data: ae } = await re.get(`/api/v1/kb10/${g}/browse?node_id=${encodeURIComponent(u)}`);
          if (m !== Q || ae?.node?.node_type !== "document" || ae.node.parent_id) return;
          U = ae.node;
        } catch {
          return;
        }
      q(U.metadata?.status === "failed" ? "failures" : "documents"), N.value = R(U.id) ? null : U, h = !0;
      try {
        l(U);
      } finally {
        h = !1;
      }
    }, { immediate: !0 }), (g, u) => (i(), f("div", Rt, [
      e(P) ? (i(), G(e(ge), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          T(b(e(P)), 1)
        ]),
        _: 1
      })) : w("", !0),
      e(I) ? (i(), G(e(ge), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: H(() => [
          T(b(e(I)), 1)
        ]),
        _: 1
      })) : w("", !0),
      p(e(je), null, {
        rail: H(() => [
          p(e(Ze), {
            title: L.value,
            count: e(D)
          }, {
            actions: H(() => [
              r.value === "documents" ? (i(), G(e(oe), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: v.value,
                onClick: u[0] || (u[0] = (m) => v.value = !v.value)
              }, null, 8, ["active"])) : w("", !0),
              p(e(oe), {
                icon: "tabler:plus",
                label: "Add document",
                active: s.value,
                onClick: u[1] || (u[1] = (m) => s.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          p(e(xe), {
            tabs: $,
            active: r.value,
            onSelect: q
          }, null, 8, ["active"]),
          d("div", Bt, [
            p(e(ze), {
              modelValue: M.value,
              "onUpdate:modelValue": u[2] || (u[2] = (m) => M.value = m),
              placeholder: r.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          d("nav", {
            class: "kd-list",
            "aria-label": L.value
          }, [
            e(O) && !e(C).length ? (i(), f("div", Vt, [
              (i(), f(Y, null, ce(6, (m) => d("div", {
                key: m,
                class: "kd-skel-row"
              })), 64))
            ])) : w("", !0),
            (i(!0), f(Y, null, ce(A.value, (m) => (i(), f("div", {
              key: m.id,
              class: se(["kd-row", { on: S.value === m.id }])
            }, [
              d("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(E)[m.id],
                onClick: (U) => l(m)
              }, [
                d("span", Ut, [
                  p(e(V), {
                    icon: e($e)(m),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                d("span", Xt, [
                  d("span", zt, b(e(ie)(m)), 1),
                  d("span", At, [
                    T(b(e(Fe)(m)), 1),
                    m.created_at ? (i(), f(Y, { key: 0 }, [
                      T(" · " + b(e(Ce)(m.created_at)), 1)
                    ], 64)) : w("", !0)
                  ])
                ])
              ], 8, jt),
              p(e(oe), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(ie)(m)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(E)[m.id],
                disabled: !!e(E)[m.id],
                onClick: (U) => le(m)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(O) && !A.value.length ? (i(), f("div", Kt, [
              r.value === "failures" ? (i(), f(Y, { key: 0 }, [
                T(b(e(C).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : (i(), f(Y, { key: 1 }, [
                T(b(e(C).length ? "No documents match." : "No documents yet — add one with +."), 1)
              ], 64))
            ])) : w("", !0)
          ], 8, qt),
          e(D) > e(te) ? (i(), f("div", Ft, [
            p(e(oe), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(B),
              onClick: e(ne)
            }, null, 8, ["disabled", "onClick"]),
            d("span", Ht, b(J.value) + "–" + b(K.value) + " of " + b(e(D)), 1),
            p(e(oe), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(W),
              onClick: e(ue)
            }, null, 8, ["disabled", "onClick"])
          ])) : w("", !0)
        ]),
        default: H(() => [
          d("div", Gt, [
            v.value ? (i(), G(e(Ue), {
              key: 0,
              "kb-id": c.value,
              layout: "panel",
              ask: "",
              onOpen: u[3] || (u[3] = (m) => m.parent_id && F(m.parent_id)),
              onClose: u[4] || (u[4] = (m) => v.value = !1)
            }, null, 8, ["kb-id"])) : j.value ? (i(), G(Pt, {
              key: 1,
              "kb-id": c.value,
              node: j.value
            }, null, 8, ["kb-id", "node"])) : (i(), G(Xe, {
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
      p(e(Ae), {
        open: s.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: u[6] || (u[6] = (m) => s.value = !1)
      }, {
        default: H(() => [
          p(Ke, {
            "kb-id": c.value,
            noun: "document",
            onChanged: u[5] || (u[5] = (m) => {
              m && (s.value = !1), e(X)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      p(e(rt), {
        open: !!t.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: t.value ? e(ie)(t.value) : "",
        "confirm-label": "Delete",
        busy: o.value,
        onCancel: u[7] || (u[7] = (m) => t.value = null),
        onConfirm: de
      }, {
        default: H(() => [
          u[8] || (u[8] = T(" Remove ", -1)),
          d("strong", null, b(t.value ? e(ie)(t.value) : ""), 1),
          u[9] || (u[9] = T(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), nn = {
  rootComponent: Wt
};
export {
  nn as mountConfig
};
//# sourceMappingURL=document-mount-B5qHThLw.js.map
