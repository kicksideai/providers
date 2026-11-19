import { ref as h, computed as $, onBeforeUnmount as ve, watch as te, defineComponent as fe, openBlock as i, createElementBlock as c, createElementVNode as r, createTextVNode as N, toDisplayString as b, createCommentVNode as x, renderSlot as we, createBlock as J, Transition as Ne, withCtx as H, withModifiers as Se, normalizeClass as re, createVNode as m, unref as t, nextTick as he, Fragment as ee, renderList as ce, onMounted as Ee } from "vue";
import { Icon as B } from "@iconify/vue";
import { api as ue, host as me, loadByTagName as De } from "@wippy-fe/proxy";
import { a as Ie, u as Le } from "./wc-runtime-f54Bo-yJ.js";
import { E as ke, i as be, f as Me, s as Oe, c as Re, _ as ie, u as Pe, a as Be, n as se, b as qe, d as xe, e as Ve, g as je, h as ge, j as Ue, k as Xe, l as ze, m as Ke, o as Ae, p as Fe } from "./AddPanel.vue_vue_type_script_setup_true_lang-Ciul35dt.js";
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
function He(l) {
  const a = l.content_type || "";
  if (_e[a]) return _e[a];
  const y = l.metadata || {}, u = String(y.filename || y.source_url || y.title || ""), _ = u.lastIndexOf(".");
  if (_ > 0 && _ < u.length - 1) {
    const p = u.slice(_ + 1).split(/[?#]/)[0];
    if (p.length <= 5) return p.toUpperCase();
  }
  return y.source_url ? "URL" : a.startsWith("image/") ? "IMG" : "DOC";
}
function $e(l) {
  const a = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : a === "application/pdf" ? "tabler:file-type-pdf" : a === "text/markdown" ? "tabler:markdown" : a === "text/csv" || a.includes("spreadsheet") || a.includes("excel") ? "tabler:table" : a === "application/json" ? "tabler:json" : a.includes("word") || a.includes("document") ? "tabler:file-text" : a.includes("presentation") || a.includes("powerpoint") ? "tabler:presentation" : a === "text/html" ? "tabler:file-code" : a.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Ce(l) {
  if (!l) return "";
  const a = new Date(l), y = a.getTime();
  if (Number.isNaN(y)) return "";
  const u = Date.now() - y, _ = Math.round(u / 1e3);
  if (_ < 45) return "just now";
  const p = Math.round(_ / 60);
  if (p < 60) return `${p}m ago`;
  const d = Math.round(p / 60);
  if (d < 24) return `${d}h ago`;
  const g = Math.round(d / 24);
  return g < 7 ? `${g}d ago` : a.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function We(l) {
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
const Ge = 400;
function Je(l, a = {}) {
  const y = h(!1), u = h(""), _ = h(""), p = h([]), d = h(0), g = h(50), q = h(0), O = $(() => Math.max(1, Math.ceil(q.value / g.value))), R = $(() => d.value > 0), L = $(() => d.value < O.value - 1), D = h({}), I = 2e4, E = /* @__PURE__ */ new Map(), ne = /* @__PURE__ */ new Map();
  function Q(e) {
    const n = { ...D.value };
    delete n[e], D.value = n;
    const o = E.get(e);
    o && (clearTimeout(o), E.delete(e)), ne.delete(e);
  }
  const M = p;
  function oe(e) {
    return M.value.find((n) => n.id === e);
  }
  let P = 0;
  async function S() {
    const e = l();
    if (!e) return;
    const n = ++P;
    y.value = !0, u.value = "";
    try {
      const o = d.value * g.value, k = a.includeIndexing ? "&include_indexing=true" : "", w = a.scope?.(), G = w ? `scope=${w}` : "node_type=document", { data: z } = await ue.get(`/api/v1/kb10/${e}/browse?${G}&limit=${g.value}&offset=${o}${k}`);
      if (n !== P || l() !== e) return;
      if (!z?.success) {
        u.value = z?.error && be(z.error) ? ke : z?.error || "";
        return;
      }
      return p.value = z.nodes || [], q.value = Number(z.total) || 0, _.value = Me(z.pending_source), !0;
    } catch (o) {
      if (n !== P) return;
      const k = o?.response?.data?.error || o?.message || "could not load contents";
      u.value = be(k) ? ke : k, me.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
    } finally {
      n === P && (y.value = !1);
    }
  }
  function Y(e) {
    const n = Math.max(0, Math.min(e, O.value - 1));
    n !== d.value && (d.value = n, C(), S());
  }
  function de() {
    L.value && Y(d.value + 1);
  }
  function ae() {
    R.value && Y(d.value - 1);
  }
  async function K(e) {
    const n = l();
    if (!n || D.value[e.id]) return !1;
    const o = Re(e);
    ne.set(e.id, { kbId: n, scope: a.scope?.() }), D.value = { ...D.value, [e.id]: !0 };
    let k = !1;
    try {
      const { data: w } = await ue.delete(`/api/v1/knowledge/${n}/content`, { data: o });
      w?.success ? (k = !0, u.value = "Delete queued. The row clears once indexing catches up.") : u.value = w?.error || "could not queue delete";
    } catch (w) {
      u.value = w?.response?.data?.error || w?.message || "could not queue delete", me.handleError(w?.response?.status === 401 ? "auth-expired" : "other", w);
    } finally {
      if (!k)
        Q(e.id);
      else {
        const w = e.id;
        E.set(w, setTimeout(() => {
          D.value[w] && (Q(w), u.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, I));
      }
    }
    return k;
  }
  function V() {
    const e = Object.keys(D.value);
    if (e.length === 0) return;
    const n = new Set(p.value.map((k) => k.id)), o = e.filter((k) => {
      const w = ne.get(k);
      return w?.kbId === l() && w.scope === a.scope?.() && !n.has(k);
    });
    if (o.length) {
      for (const k of o) Q(k);
      Object.keys(D.value).length || (u.value = ""), a.onChanged?.();
    }
  }
  let j, F = !1, Z = !1;
  function C() {
    j !== void 0 && clearTimeout(j), j = void 0, Z = !1;
  }
  function T() {
    if (l()) {
      if (F) {
        Z = !0;
        return;
      }
      j === void 0 && (j = setTimeout(async () => {
        j = void 0, F = !0;
        try {
          await S() && V();
        } finally {
          F = !1;
          const e = Z;
          Z = !1, e && T();
        }
      }, Ge));
    }
  }
  let U = null, X = 0;
  function W(e) {
    const n = ++X;
    if (U && (U(), U = null), !e) return;
    const o = Oe(e, () => {
      n === X && T();
    });
    if (n !== X) {
      o && o();
      return;
    }
    U = o;
  }
  return ve(() => {
    X++, C(), P++, U && U(), E.forEach((e) => clearTimeout(e)), E.clear();
  }), te([l, () => a.scope?.()], ([e], [n]) => {
    C(), d.value = 0, q.value = 0, p.value = [], _.value = "", S(), e !== n && W(e);
  }, { immediate: !0 }), {
    loading: y,
    notice: u,
    indexingNotice: _,
    nodes: p,
    documents: M,
    deleting: D,
    load: S,
    reload: S,
    remove: K,
    findDoc: oe,
    page: d,
    pageSize: g,
    total: q,
    pageCount: O,
    hasPrev: R,
    hasNext: L,
    next: de,
    prev: ae,
    goToPage: Y,
    scheduleRefresh: T
  };
}
const Qe = { class: "kx-railhead" }, Ye = { class: "kx-railhead-title" }, Ze = { key: 0 }, et = { class: "kx-railhead-acts" }, tt = /* @__PURE__ */ fe({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (a, y) => (i(), c("div", Qe, [
      r("span", Ye, [
        N(b(l.title), 1),
        l.count !== void 0 ? (i(), c("b", Ze, b(l.count), 1)) : x("", !0)
      ]),
      r("div", et, [
        we(a.$slots, "actions")
      ])
    ]));
  }
}), nt = ["aria-label"], at = { class: "kx-modal-h" }, lt = { class: "kx-modal-h-ico" }, ot = { class: "kx-modal-h-text" }, it = { class: "kx-modal-h-title" }, st = {
  key: 0,
  class: "kx-modal-h-sub"
}, rt = { class: "kx-modal-body" }, ut = { class: "kx-modal-foot" }, dt = /* @__PURE__ */ fe({
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
    const y = l, u = a;
    function _(p) {
      p.key === "Escape" && !y.busy && u("cancel");
    }
    return te(() => y.open, (p) => {
      p ? window.addEventListener("keydown", _) : window.removeEventListener("keydown", _);
    }), ve(() => window.removeEventListener("keydown", _)), (p, d) => (i(), J(Ne, { name: "kx-modal" }, {
      default: H(() => [
        l.open ? (i(), c("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: d[3] || (d[3] = Se((g) => !l.busy && u("cancel"), ["self"]))
        }, [
          r("div", {
            class: re(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            r("div", at, [
              r("span", lt, [
                m(t(B), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", ot, [
                r("span", it, b(l.title), 1),
                l.subtitle ? (i(), c("span", st, b(l.subtitle), 1)) : x("", !0)
              ]),
              m(ie, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: d[0] || (d[0] = (g) => u("cancel"))
              }, null, 8, ["disabled"])
            ]),
            r("div", rt, [
              we(p.$slots, "default")
            ]),
            r("div", ut, [
              m(ye, {
                variant: "ghost",
                disabled: l.busy,
                onClick: d[1] || (d[1] = (g) => u("cancel"))
              }, {
                default: H(() => [
                  N(b(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              m(ye, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: d[2] || (d[2] = (g) => u("confirm"))
              }, {
                default: H(() => [
                  N(b(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, nt)
        ])) : x("", !0)
      ]),
      _: 3
    }));
  }
}), ct = { class: "dr" }, vt = { class: "dr-head" }, ft = { class: "dr-badge" }, mt = { class: "dr-head-body" }, pt = { class: "dr-head-top" }, ht = { class: "dr-title" }, kt = { class: "dr-facts" }, bt = {
  key: 0,
  class: "dr-fact"
}, gt = {
  key: 1,
  class: "dr-fact"
}, yt = ["title"], _t = ["href"], wt = {
  key: 0,
  class: "dr-skel"
}, xt = {
  key: 1,
  class: "dr-state err"
}, $t = {
  key: 0,
  class: "dr-doc"
}, Ct = { class: "dr-doc-main" }, Tt = ["content-type", "source", "filename"], Nt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, St = ["aria-expanded"], Et = {
  key: 3,
  class: "dr-state"
}, Dt = {
  key: 1,
  class: "dr-chunks"
}, It = {
  key: 0,
  class: "dr-state"
}, Lt = ["aria-expanded", "onClick"], Mt = { class: "dr-chunk-n" }, Ot = { class: "dr-chunk-label" }, Rt = {
  key: 0,
  class: "dr-chunk-cx"
}, Pt = 720, Bt = /* @__PURE__ */ fe({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const a = l, y = h(!1), u = h(""), _ = h(""), p = h(""), d = h([]), g = h(0), q = h(""), O = h("read"), R = h(!1), L = h({});
    function D(e) {
      return String((e.metadata || {}).contextual_prefix || "");
    }
    const I = $(() => a.node.metadata || {}), E = $(() => I.value.source_url), ne = $(() => p.value || a.node.content_type || "text/markdown"), Q = $(() => String(I.value.original_mime_type || I.value.source_mime || "")), M = $(() => Pe(I.value) ? Be(Q.value || a.node.content_type || "") : !1), oe = $(() => `/api/v1/kb10/${a.kbId}/nodes/${a.node.id}/source`), P = $(() => String(I.value.filename || I.value.original_filename || "")), S = $(() => _.value ? _.value : d.value.map((e) => e.content).filter(Boolean).join(`

`)), Y = $(() => {
      const e = S.value.trim();
      return e ? e.split(/\s+/).length : 0;
    });
    function de() {
      M.value && (R.value = !R.value);
    }
    const ae = h(null), K = h(!1), V = h(!1);
    function j() {
      const e = ae.value;
      if (!e) {
        V.value = !1;
        return;
      }
      V.value = e.scrollHeight - Pt > 24;
    }
    let F = null;
    function Z() {
      F?.disconnect();
      const e = ae.value;
      e && (F = new ResizeObserver(() => j()), F.observe(e), he(j));
    }
    const C = $(() => V.value && !K.value);
    let T = 0;
    async function U() {
      if (!a.kbId || !a.node?.id) return;
      const e = ++T;
      y.value = !0, u.value = "", _.value = "", p.value = "", d.value = [], g.value = 0, q.value = "", O.value = "read", L.value = {}, K.value = !1, V.value = !1;
      try {
        const [{ data: n }, { data: o }, { data: k }] = await Promise.all([
          ue.get(`/api/v1/kb10/${a.kbId}/browse?node_id=${a.node.id}`),
          ue.get(`/api/v1/kb10/${a.kbId}/browse?parent_id=${a.node.id}&node_type=chunk&include_content=true&limit=200`),
          ue.get(`/api/v1/kb10/${a.kbId}/browse?parent_id=${a.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (e !== T) return;
        if (n?.success && n.node && (_.value = String(n.node.content || ""), p.value = String(n.node.content_type || "")), o?.success) {
          if (!Number.isInteger(o.total) || o.total < 0) throw new Error("Invalid chunk total");
          g.value = o.total;
          const w = o.nodes;
          if (d.value = w.filter((G) => G.node_type === "chunk").sort((G, z) => Number((G.metadata || {}).index ?? (G.metadata || {}).chunk_index ?? 0) - Number((z.metadata || {}).index ?? (z.metadata || {}).chunk_index ?? 0)), !k?.success) throw new Error(k?.error || "could not load summary");
          q.value = k.nodes[0]?.content || "", _.value || (_.value = q.value || a.node.content || "");
        }
        !n?.success && !o?.success && (u.value = n?.error || o?.error || "could not load document");
      } catch (n) {
        if (e !== T) return;
        u.value = n?.response?.data?.error || n?.message || "could not load document", me.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
      } finally {
        e === T && (y.value = !1);
      }
    }
    const X = $(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: g.value || void 0 }
    ]);
    function W(e) {
      L.value = { ...L.value, [e.id]: !L.value[e.id] };
    }
    return te([S, O, y], () => {
      O.value === "read" && !y.value && he(Z);
    }), te(M, (e) => {
      e || (R.value = !1);
    }), te(() => a.node?.id, () => U(), { immediate: !0 }), ve(() => {
      F?.disconnect();
    }), (e, n) => (i(), c("div", ct, [
      r("header", vt, [
        r("span", ft, [
          m(t(B), {
            icon: t($e)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        r("div", mt, [
          r("div", pt, [
            r("h2", ht, b(t(se)(l.node)), 1),
            M.value ? (i(), J(t(qe), {
              key: 0,
              class: re(["dr-orig-btn", { on: R.value }]),
              label: R.value ? "Hide original" : "View original",
              onOpen: de
            }, null, 8, ["class", "label"])) : x("", !0)
          ]),
          r("div", kt, [
            g.value ? (i(), c("span", bt, [
              m(t(B), { icon: "tabler:layout-grid" }),
              N(b(g.value.toLocaleString()) + " chunks", 1)
            ])) : x("", !0),
            Y.value ? (i(), c("span", gt, [
              m(t(B), { icon: "tabler:align-left" }),
              N(b(Y.value.toLocaleString()) + " words", 1)
            ])) : x("", !0),
            l.node.created_at ? (i(), c("span", {
              key: 2,
              class: "dr-fact",
              title: t(We)(l.node.created_at)
            }, [
              m(t(B), { icon: "tabler:clock" }),
              N(b(t(Ce)(l.node.created_at)), 1)
            ], 8, yt)) : x("", !0),
            E.value ? (i(), c("a", {
              key: 3,
              class: "dr-fact link",
              href: E.value,
              target: "_blank",
              rel: "noopener"
            }, [
              m(t(B), { icon: "tabler:external-link" }),
              n[3] || (n[3] = N("Source", -1))
            ], 8, _t)) : x("", !0)
          ])
        ])
      ]),
      m(t(xe), {
        tabs: X.value,
        active: O.value,
        onSelect: n[0] || (n[0] = (o) => O.value = o)
      }, null, 8, ["tabs", "active"]),
      y.value ? (i(), c("div", wt, [
        (i(), c(ee, null, ce(6, (o) => r("div", {
          key: o,
          class: "dr-skel-line"
        })), 64))
      ])) : u.value ? (i(), c("div", xt, [
        m(t(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        N(" " + b(u.value), 1)
      ])) : (i(), c(ee, { key: 2 }, [
        O.value === "read" ? (i(), c("div", $t, [
          r("div", Ct, [
            q.value ? (i(), J(t(Ve), {
              key: 0,
              text: q.value
            }, null, 8, ["text"])) : x("", !0),
            S.value ? (i(), c("div", {
              key: 1,
              class: re(["dr-clamp", { clamped: C.value }])
            }, [
              r("div", {
                ref_key: "bodyRef",
                ref: ae,
                class: "dr-clamp-inner"
              }, [
                r("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": ne.value,
                  source: S.value,
                  filename: P.value
                }, null, 8, Tt)
              ], 512),
              C.value ? (i(), c("div", Nt)) : x("", !0)
            ], 2)) : x("", !0),
            V.value ? (i(), c("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": K.value,
              onClick: n[1] || (n[1] = (o) => K.value = !K.value)
            }, [
              m(t(B), {
                icon: K.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(" " + b(K.value ? "Show less" : "Show more"), 1)
            ], 8, St)) : x("", !0),
            S.value ? x("", !0) : (i(), c("div", Et, [
              m(t(B), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              n[4] || (n[4] = N(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (i(), c("div", Dt, [
          d.value.length ? x("", !0) : (i(), c("div", It, [
            m(t(B), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            n[5] || (n[5] = N(" This document has no chunks.", -1))
          ])),
          (i(!0), c(ee, null, ce(d.value, (o, k) => (i(), c("div", {
            key: o.id,
            class: re(["dr-chunk", { open: L.value[o.id] }])
          }, [
            r("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!L.value[o.id],
              onClick: (w) => W(o)
            }, [
              r("span", Mt, b(k + 1), 1),
              r("span", Ot, "Chunk " + b(k + 1), 1),
              m(t(B), {
                class: "dr-chunk-chev",
                icon: L.value[o.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Lt),
            D(o) ? (i(), c("p", Rt, [
              m(t(B), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              r("span", null, b(D(o)), 1)
            ])) : x("", !0),
            r("p", {
              class: re(["dr-chunk-body", { clamp: !L.value[o.id] }])
            }, b(o.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      m(t(je), {
        contained: "",
        open: R.value && M.value,
        title: P.value || "Original",
        "content-type": Q.value || l.node.content_type || "",
        "source-url": oe.value,
        filename: P.value,
        onClose: n[2] || (n[2] = (o) => R.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), qt = { class: "kb-page kd" }, Vt = { class: "kd-filter" }, jt = ["aria-label"], Ut = {
  key: 0,
  class: "kd-list-skel"
}, Xt = ["disabled", "onClick"], zt = { class: "kd-row-ic" }, Kt = { class: "kd-row-main" }, At = { class: "kd-row-title" }, Ft = { class: "kd-row-sub" }, Ht = {
  key: 1,
  class: "kd-list-empty"
}, Wt = {
  key: 0,
  class: "kd-pager"
}, Gt = { class: "kd-pager-label" }, Jt = { class: "kx-main-scroll kd-reader" }, Qt = /* @__PURE__ */ fe({
  __name: "KbDocument",
  setup(l) {
    const a = Ie(), y = Le(), u = $(() => a.value.config?.kb_id || ""), _ = $(() => a.value.config?.route || "");
    let p = "", d = !1;
    const g = h("documents"), q = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], O = $(() => g.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: R,
      notice: L,
      indexingNotice: D,
      documents: I,
      deleting: E,
      scheduleRefresh: ne,
      remove: Q,
      findDoc: M,
      page: oe,
      pageSize: P,
      total: S,
      hasPrev: Y,
      hasNext: de,
      next: ae,
      prev: K
    } = Je(() => u.value, { includeIndexing: !0, scope: () => g.value }), V = h(""), j = $(() => {
      const f = V.value.trim().toLowerCase();
      return f ? I.value.filter((s) => se(s).toLowerCase().includes(f)) : I.value;
    }), F = $(() => S.value === 0 ? 0 : oe.value * P.value + 1), Z = $(() => Math.min((oe.value + 1) * P.value, S.value)), C = h(""), T = h(null), U = $(() => E.value[C.value] ? null : M(C.value) || (T.value?.id === C.value ? T.value : null));
    let X = 0;
    const W = h(!1), e = h(!1), n = h(null), o = $(() => !!n.value && !!E.value[n.value.id]);
    function k(f) {
      if (E.value[f.id]) return;
      const s = C.value !== f.id;
      C.value = f.id, s && !d && (p = f.id, y("navigate", f.id));
    }
    function w(f) {
      const s = M(f);
      s && (k(s), e.value = !1);
    }
    function G(f) {
      f !== g.value && (X++, e.value = !1, C.value = "", T.value = null, V.value = "", g.value = f === "failures" ? "failures" : "documents");
    }
    function z(f) {
      n.value = f;
    }
    async function Te() {
      const f = n.value;
      if (!f) return;
      await Q(f) && (C.value === f.id && (C.value = ""), T.value?.id === f.id && (T.value = null), p === f.id && (X++, p = "", y("navigate", "")), n.value = null);
    }
    function pe(f) {
      f.key === "Escape" && e.value && (e.value = !1);
    }
    return Ee(() => {
      window.addEventListener("keydown", pe), De("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ve(() => {
      X++, window.removeEventListener("keydown", pe);
    }), te(I, (f) => {
      if (T.value && M(T.value.id) && (T.value = null), U.value) return;
      const s = f.filter((le) => !E.value[le.id]), A = s.find((le) => le.id === p) || s[0];
      if (A) {
        d = !0;
        try {
          k(A);
        } finally {
          d = !1;
        }
      } else M(C.value) || (C.value = "");
    }), te(u, () => {
      C.value = "";
    }), te([u, _], async ([f, s]) => {
      p = s;
      const v = ++X;
      if (T.value?.id !== s && (T.value = null), !f || !s || s === C.value) return;
      let A = M(s);
      if (!A)
        try {
          const { data: le } = await ue.get(`/api/v1/kb10/${f}/browse?node_id=${encodeURIComponent(s)}`);
          if (v !== X || le?.node?.node_type !== "document" || le.node.parent_id) return;
          A = le.node;
        } catch {
          return;
        }
      G(A.metadata?.status === "failed" ? "failures" : "documents"), T.value = M(A.id) ? null : A, d = !0;
      try {
        k(A);
      } finally {
        d = !1;
      }
    }, { immediate: !0 }), (f, s) => (i(), c("div", qt, [
      t(L) ? (i(), J(t(ge), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          N(b(t(L)), 1)
        ]),
        _: 1
      })) : x("", !0),
      t(D) ? (i(), J(t(ge), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: H(() => [
          N(b(t(D)), 1)
        ]),
        _: 1
      })) : x("", !0),
      m(t(Ue), null, {
        rail: H(() => [
          m(t(tt), {
            title: O.value,
            count: t(S)
          }, {
            actions: H(() => [
              g.value === "documents" ? (i(), J(t(ie), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: e.value,
                onClick: s[0] || (s[0] = (v) => e.value = !e.value)
              }, null, 8, ["active"])) : x("", !0),
              m(t(ie), {
                icon: "tabler:plus",
                label: "Add document",
                active: W.value,
                onClick: s[1] || (s[1] = (v) => W.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          m(t(xe), {
            tabs: q,
            active: g.value,
            onSelect: G
          }, null, 8, ["active"]),
          r("div", Vt, [
            m(t(Ke), {
              modelValue: V.value,
              "onUpdate:modelValue": s[2] || (s[2] = (v) => V.value = v),
              placeholder: g.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          r("nav", {
            class: "kd-list",
            "aria-label": O.value
          }, [
            t(R) && !t(I).length ? (i(), c("div", Ut, [
              (i(), c(ee, null, ce(6, (v) => r("div", {
                key: v,
                class: "kd-skel-row"
              })), 64))
            ])) : x("", !0),
            (i(!0), c(ee, null, ce(j.value, (v) => (i(), c("div", {
              key: v.id,
              class: re(["kd-row", { on: C.value === v.id }])
            }, [
              r("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!t(E)[v.id],
                onClick: (A) => k(v)
              }, [
                r("span", zt, [
                  m(t(B), {
                    icon: t($e)(v),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("span", Kt, [
                  r("span", At, b(t(se)(v)), 1),
                  r("span", Ft, [
                    N(b(t(He)(v)), 1),
                    v.created_at ? (i(), c(ee, { key: 0 }, [
                      N(" · " + b(t(Ce)(v.created_at)), 1)
                    ], 64)) : x("", !0)
                  ])
                ])
              ], 8, Xt),
              m(t(ie), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${t(se)(v)}`,
                variant: "danger",
                size: "sm",
                spin: !!t(E)[v.id],
                disabled: !!t(E)[v.id],
                onClick: (A) => z(v)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !t(R) && !j.value.length ? (i(), c("div", Ht, [
              g.value === "failures" ? (i(), c(ee, { key: 0 }, [
                N(b(t(I).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : (i(), c(ee, { key: 1 }, [
                N(b(t(I).length ? "No documents match." : "No documents yet — add one with +."), 1)
              ], 64))
            ])) : x("", !0)
          ], 8, jt),
          t(S) > t(P) ? (i(), c("div", Wt, [
            m(t(ie), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !t(Y),
              onClick: t(K)
            }, null, 8, ["disabled", "onClick"]),
            r("span", Gt, b(F.value) + "–" + b(Z.value) + " of " + b(t(S)), 1),
            m(t(ie), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !t(de),
              onClick: t(ae)
            }, null, 8, ["disabled", "onClick"])
          ])) : x("", !0)
        ]),
        default: H(() => [
          r("div", Jt, [
            e.value ? (i(), J(t(Xe), {
              key: 0,
              "kb-id": u.value,
              layout: "panel",
              ask: "",
              onOpen: s[3] || (s[3] = (v) => v.parent_id && w(v.parent_id)),
              onClose: s[4] || (s[4] = (v) => e.value = !1)
            }, null, 8, ["kb-id"])) : U.value ? (i(), J(Bt, {
              key: 1,
              "kb-id": u.value,
              node: U.value
            }, null, 8, ["kb-id", "node"])) : (i(), J(ze, {
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
      m(t(Ae), {
        open: W.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: s[6] || (s[6] = (v) => W.value = !1)
      }, {
        default: H(() => [
          m(Fe, {
            "kb-id": u.value,
            noun: "document",
            onChanged: s[5] || (s[5] = (v) => {
              v && (W.value = !1), t(ne)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      m(t(dt), {
        open: !!n.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: n.value ? t(se)(n.value) : "",
        "confirm-label": "Delete",
        busy: o.value,
        onCancel: s[7] || (s[7] = (v) => n.value = null),
        onConfirm: Te
      }, {
        default: H(() => [
          s[8] || (s[8] = N(" Remove ", -1)),
          r("strong", null, b(n.value ? t(se)(n.value) : ""), 1),
          s[9] || (s[9] = N(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), ln = {
  rootComponent: Qt
};
export {
  ln as mountConfig
};
//# sourceMappingURL=document-mount-BkX63fJr.js.map
