import { ref as p, computed as x, onBeforeUnmount as ve, watch as te, defineComponent as fe, openBlock as i, createElementBlock as c, createElementVNode as u, createTextVNode as N, toDisplayString as h, createCommentVNode as w, renderSlot as we, createBlock as Q, Transition as Te, withCtx as J, withModifiers as Ne, normalizeClass as re, createVNode as f, unref as t, nextTick as he, Fragment as ee, renderList as ce, onMounted as Se } from "vue";
import { Icon as j } from "@iconify/vue";
import { api as ue, host as me, loadByTagName as Ee } from "@wippy-fe/proxy";
import { a as De, u as Ie } from "./wc-runtime-f54Bo-yJ.js";
import { E as ke, i as be, f as Le, s as Me, c as Oe, _ as ie, u as Re, a as Pe, n as se, b as Be, d as xe, e as qe, g as Ve, h as ge, j as je, k as Ue, l as Xe, m as ze, o as Ke, p as Ae } from "./AddPanel.vue_vue_type_script_setup_true_lang-Ciul35dt.js";
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
function Fe(l) {
  const n = l.content_type || "";
  if (_e[n]) return _e[n];
  const g = l.metadata || {}, d = String(g.filename || g.source_url || g.title || ""), b = d.lastIndexOf(".");
  if (b > 0 && b < d.length - 1) {
    const m = d.slice(b + 1).split(/[?#]/)[0];
    if (m.length <= 5) return m.toUpperCase();
  }
  return g.source_url ? "URL" : n.startsWith("image/") ? "IMG" : "DOC";
}
function $e(l) {
  const n = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : n === "application/pdf" ? "tabler:file-type-pdf" : n === "text/markdown" ? "tabler:markdown" : n === "text/csv" || n.includes("spreadsheet") || n.includes("excel") ? "tabler:table" : n === "application/json" ? "tabler:json" : n.includes("word") || n.includes("document") ? "tabler:file-text" : n.includes("presentation") || n.includes("powerpoint") ? "tabler:presentation" : n === "text/html" ? "tabler:file-code" : n.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Ce(l) {
  if (!l) return "";
  const n = new Date(l), g = n.getTime();
  if (Number.isNaN(g)) return "";
  const d = Date.now() - g, b = Math.round(d / 1e3);
  if (b < 45) return "just now";
  const m = Math.round(b / 60);
  if (m < 60) return `${m}m ago`;
  const s = Math.round(m / 60);
  if (s < 24) return `${s}h ago`;
  const C = Math.round(s / 24);
  return C < 7 ? `${C}d ago` : n.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function He(l) {
  if (!l) return "";
  const n = new Date(l);
  return Number.isNaN(n.getTime()) ? "" : n.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const We = 400;
function Ge(l, n = {}) {
  const g = p(!1), d = p(""), b = p(""), m = p([]), s = p(0), C = p(50), M = p(0), O = x(() => Math.max(1, Math.ceil(M.value / C.value))), R = x(() => s.value > 0), I = x(() => s.value < O.value - 1), T = p({}), S = 2e4, F = /* @__PURE__ */ new Map(), ne = /* @__PURE__ */ new Map();
  function P(e) {
    const a = { ...T.value };
    delete a[e], T.value = a;
    const o = F.get(e);
    o && (clearTimeout(o), F.delete(e)), ne.delete(e);
  }
  const H = m;
  function ae(e) {
    return H.value.find((a) => a.id === e);
  }
  let D = 0;
  async function B() {
    const e = l();
    if (!e) return;
    const a = ++D;
    g.value = !0, d.value = "";
    try {
      const o = s.value * C.value, y = n.includeIndexing ? "&include_indexing=true" : "", _ = n.scope?.(), Z = _ ? `scope=${_}` : "node_type=document", { data: z } = await ue.get(`/api/v1/kb10/${e}/browse?${Z}&limit=${C.value}&offset=${o}${y}`);
      if (a !== D || l() !== e) return;
      if (!z?.success) {
        d.value = z?.error && be(z.error) ? ke : z?.error || "";
        return;
      }
      return m.value = z.nodes || [], M.value = Number(z.total) || 0, b.value = Le(z.pending_source), !0;
    } catch (o) {
      if (a !== D) return;
      const y = o?.response?.data?.error || o?.message || "could not load contents";
      d.value = be(y) ? ke : y, me.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
    } finally {
      a === D && (g.value = !1);
    }
  }
  function Y(e) {
    const a = Math.max(0, Math.min(e, O.value - 1));
    a !== s.value && (s.value = a, E(), B());
  }
  function de() {
    I.value && Y(s.value + 1);
  }
  function le() {
    R.value && Y(s.value - 1);
  }
  async function L(e) {
    const a = l();
    if (!a || T.value[e.id]) return !1;
    const o = Oe(e);
    ne.set(e.id, { kbId: a, scope: n.scope?.() }), T.value = { ...T.value, [e.id]: !0 };
    let y = !1;
    try {
      const { data: _ } = await ue.delete(`/api/v1/knowledge/${a}/content`, { data: o });
      _?.success ? (y = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = _?.error || "could not queue delete";
    } catch (_) {
      d.value = _?.response?.data?.error || _?.message || "could not queue delete", me.handleError(_?.response?.status === 401 ? "auth-expired" : "other", _);
    } finally {
      if (!y)
        P(e.id);
      else {
        const _ = e.id;
        F.set(_, setTimeout(() => {
          T.value[_] && (P(_), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, S));
      }
    }
    return y;
  }
  function W() {
    const e = Object.keys(T.value);
    if (e.length === 0) return;
    const a = new Set(m.value.map((y) => y.id)), o = e.filter((y) => {
      const _ = ne.get(y);
      return _?.kbId === l() && _.scope === n.scope?.() && !a.has(y);
    });
    if (o.length) {
      for (const y of o) P(y);
      Object.keys(T.value).length || (d.value = ""), n.onChanged?.();
    }
  }
  let K, G = !1, $ = !1;
  function E() {
    K !== void 0 && clearTimeout(K), K = void 0, $ = !1;
  }
  function U() {
    if (l()) {
      if (G) {
        $ = !0;
        return;
      }
      K === void 0 && (K = setTimeout(async () => {
        K = void 0, G = !0;
        try {
          await B() && W();
        } finally {
          G = !1;
          const e = $;
          $ = !1, e && U();
        }
      }, We));
    }
  }
  let q = null, X = 0;
  function V(e) {
    const a = ++X;
    if (q && (q(), q = null), !e) return;
    const o = Me(e, () => {
      a === X && U();
    });
    if (a !== X) {
      o && o();
      return;
    }
    q = o;
  }
  return ve(() => {
    X++, E(), D++, q && q(), F.forEach((e) => clearTimeout(e)), F.clear();
  }), te([l, () => n.scope?.()], ([e], [a]) => {
    E(), s.value = 0, M.value = 0, m.value = [], b.value = "", B(), e !== a && V(e);
  }, { immediate: !0 }), {
    loading: g,
    notice: d,
    indexingNotice: b,
    nodes: m,
    documents: H,
    deleting: T,
    load: B,
    reload: B,
    remove: L,
    findDoc: ae,
    page: s,
    pageSize: C,
    total: M,
    pageCount: O,
    hasPrev: R,
    hasNext: I,
    next: de,
    prev: le,
    goToPage: Y,
    scheduleRefresh: U
  };
}
const Je = { class: "kx-railhead" }, Qe = { class: "kx-railhead-title" }, Ye = { key: 0 }, Ze = { class: "kx-railhead-acts" }, et = /* @__PURE__ */ fe({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (n, g) => (i(), c("div", Je, [
      u("span", Qe, [
        N(h(l.title), 1),
        l.count !== void 0 ? (i(), c("b", Ye, h(l.count), 1)) : w("", !0)
      ]),
      u("div", Ze, [
        we(n.$slots, "actions")
      ])
    ]));
  }
}), tt = ["aria-label"], nt = { class: "kx-modal-h" }, at = { class: "kx-modal-h-ico" }, lt = { class: "kx-modal-h-text" }, ot = { class: "kx-modal-h-title" }, it = {
  key: 0,
  class: "kx-modal-h-sub"
}, st = { class: "kx-modal-body" }, rt = { class: "kx-modal-foot" }, ut = /* @__PURE__ */ fe({
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
  setup(l, { emit: n }) {
    const g = l, d = n;
    function b(m) {
      m.key === "Escape" && !g.busy && d("cancel");
    }
    return te(() => g.open, (m) => {
      m ? window.addEventListener("keydown", b) : window.removeEventListener("keydown", b);
    }), ve(() => window.removeEventListener("keydown", b)), (m, s) => (i(), Q(Te, { name: "kx-modal" }, {
      default: J(() => [
        l.open ? (i(), c("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: s[3] || (s[3] = Ne((C) => !l.busy && d("cancel"), ["self"]))
        }, [
          u("div", {
            class: re(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            u("div", nt, [
              u("span", at, [
                f(t(j), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", lt, [
                u("span", ot, h(l.title), 1),
                l.subtitle ? (i(), c("span", it, h(l.subtitle), 1)) : w("", !0)
              ]),
              f(ie, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: s[0] || (s[0] = (C) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            u("div", st, [
              we(m.$slots, "default")
            ]),
            u("div", rt, [
              f(ye, {
                variant: "ghost",
                disabled: l.busy,
                onClick: s[1] || (s[1] = (C) => d("cancel"))
              }, {
                default: J(() => [
                  N(h(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(ye, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: s[2] || (s[2] = (C) => d("confirm"))
              }, {
                default: J(() => [
                  N(h(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, tt)
        ])) : w("", !0)
      ]),
      _: 3
    }));
  }
}), dt = { class: "dr" }, ct = { class: "dr-head" }, vt = { class: "dr-badge" }, ft = { class: "dr-head-body" }, mt = { class: "dr-head-top" }, pt = { class: "dr-title" }, ht = { class: "dr-facts" }, kt = {
  key: 0,
  class: "dr-fact"
}, bt = {
  key: 1,
  class: "dr-fact"
}, gt = ["title"], yt = ["href"], _t = {
  key: 0,
  class: "dr-skel"
}, wt = {
  key: 1,
  class: "dr-state err"
}, xt = {
  key: 0,
  class: "dr-doc"
}, $t = { class: "dr-doc-main" }, Ct = ["content-type", "source", "filename"], Tt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Nt = ["aria-expanded"], St = {
  key: 3,
  class: "dr-state"
}, Et = {
  key: 1,
  class: "dr-chunks"
}, Dt = {
  key: 0,
  class: "dr-state"
}, It = ["aria-expanded", "onClick"], Lt = { class: "dr-chunk-n" }, Mt = { class: "dr-chunk-label" }, Ot = {
  key: 0,
  class: "dr-chunk-cx"
}, Rt = 720, Pt = /* @__PURE__ */ fe({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const n = l, g = p(!1), d = p(""), b = p(""), m = p(""), s = p([]), C = p(0), M = p(""), O = p("read"), R = p(!1), I = p({});
    function T(e) {
      return String((e.metadata || {}).contextual_prefix || "");
    }
    const S = x(() => n.node.metadata || {}), F = x(() => S.value.source_url), ne = x(() => m.value || n.node.content_type || "text/markdown"), P = x(() => String(S.value.original_mime_type || S.value.source_mime || "")), H = x(() => Re(S.value) ? Pe(P.value || n.node.content_type || "") : !1), ae = x(() => `/api/v1/kb10/${n.kbId}/nodes/${n.node.id}/source`), D = x(() => String(S.value.filename || S.value.original_filename || "")), B = x(() => b.value ? b.value : s.value.map((e) => e.content).filter(Boolean).join(`

`)), Y = x(() => {
      const e = B.value.trim();
      return e ? e.split(/\s+/).length : 0;
    });
    function de() {
      H.value && (R.value = !R.value);
    }
    const le = p(null), L = p(!1), W = p(!1);
    function K() {
      const e = le.value;
      if (!e) {
        W.value = !1;
        return;
      }
      W.value = e.scrollHeight - Rt > 24;
    }
    let G = null;
    function $() {
      G?.disconnect();
      const e = le.value;
      e && (G = new ResizeObserver(() => K()), G.observe(e), he(K));
    }
    const E = x(() => W.value && !L.value);
    let U = 0;
    async function q() {
      if (!n.kbId || !n.node?.id) return;
      const e = ++U;
      g.value = !0, d.value = "", b.value = "", m.value = "", s.value = [], C.value = 0, M.value = "", O.value = "read", I.value = {}, L.value = !1, W.value = !1;
      try {
        const [{ data: a }, { data: o }, { data: y }] = await Promise.all([
          ue.get(`/api/v1/kb10/${n.kbId}/browse?node_id=${n.node.id}`),
          ue.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=chunk&include_content=true&limit=200`),
          ue.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (e !== U) return;
        if (a?.success && a.node && (b.value = String(a.node.content || ""), m.value = String(a.node.content_type || "")), o?.success) {
          if (!Number.isInteger(o.total) || o.total < 0) throw new Error("Invalid chunk total");
          C.value = o.total;
          const _ = o.nodes;
          if (s.value = _.filter((Z) => Z.node_type === "chunk").sort((Z, z) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((z.metadata || {}).index ?? (z.metadata || {}).chunk_index ?? 0)), !y?.success) throw new Error(y?.error || "could not load summary");
          M.value = y.nodes[0]?.content || "", b.value || (b.value = M.value || n.node.content || "");
        }
        !a?.success && !o?.success && (d.value = a?.error || o?.error || "could not load document");
      } catch (a) {
        if (e !== U) return;
        d.value = a?.response?.data?.error || a?.message || "could not load document", me.handleError(a?.response?.status === 401 ? "auth-expired" : "other", a);
      } finally {
        e === U && (g.value = !1);
      }
    }
    const X = x(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: C.value || void 0 }
    ]);
    function V(e) {
      I.value = { ...I.value, [e.id]: !I.value[e.id] };
    }
    return te([B, O, g], () => {
      O.value === "read" && !g.value && he($);
    }), te(H, (e) => {
      e || (R.value = !1);
    }), te(() => n.node?.id, () => q(), { immediate: !0 }), ve(() => {
      G?.disconnect();
    }), (e, a) => (i(), c("div", dt, [
      u("header", ct, [
        u("span", vt, [
          f(t(j), {
            icon: t($e)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        u("div", ft, [
          u("div", mt, [
            u("h2", pt, h(t(se)(l.node)), 1),
            H.value ? (i(), Q(t(Be), {
              key: 0,
              class: re(["dr-orig-btn", { on: R.value }]),
              label: R.value ? "Hide original" : "View original",
              onOpen: de
            }, null, 8, ["class", "label"])) : w("", !0)
          ]),
          u("div", ht, [
            C.value ? (i(), c("span", kt, [
              f(t(j), { icon: "tabler:layout-grid" }),
              N(h(C.value.toLocaleString()) + " chunks", 1)
            ])) : w("", !0),
            Y.value ? (i(), c("span", bt, [
              f(t(j), { icon: "tabler:align-left" }),
              N(h(Y.value.toLocaleString()) + " words", 1)
            ])) : w("", !0),
            l.node.created_at ? (i(), c("span", {
              key: 2,
              class: "dr-fact",
              title: t(He)(l.node.created_at)
            }, [
              f(t(j), { icon: "tabler:clock" }),
              N(h(t(Ce)(l.node.created_at)), 1)
            ], 8, gt)) : w("", !0),
            F.value ? (i(), c("a", {
              key: 3,
              class: "dr-fact link",
              href: F.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(t(j), { icon: "tabler:external-link" }),
              a[3] || (a[3] = N("Source", -1))
            ], 8, yt)) : w("", !0)
          ])
        ])
      ]),
      f(t(xe), {
        tabs: X.value,
        active: O.value,
        onSelect: a[0] || (a[0] = (o) => O.value = o)
      }, null, 8, ["tabs", "active"]),
      g.value ? (i(), c("div", _t, [
        (i(), c(ee, null, ce(6, (o) => u("div", {
          key: o,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (i(), c("div", wt, [
        f(t(j), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        N(" " + h(d.value), 1)
      ])) : (i(), c(ee, { key: 2 }, [
        O.value === "read" ? (i(), c("div", xt, [
          u("div", $t, [
            M.value ? (i(), Q(t(qe), {
              key: 0,
              text: M.value
            }, null, 8, ["text"])) : w("", !0),
            B.value ? (i(), c("div", {
              key: 1,
              class: re(["dr-clamp", { clamped: E.value }])
            }, [
              u("div", {
                ref_key: "bodyRef",
                ref: le,
                class: "dr-clamp-inner"
              }, [
                u("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": ne.value,
                  source: B.value,
                  filename: D.value
                }, null, 8, Ct)
              ], 512),
              E.value ? (i(), c("div", Tt)) : w("", !0)
            ], 2)) : w("", !0),
            W.value ? (i(), c("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": L.value,
              onClick: a[1] || (a[1] = (o) => L.value = !L.value)
            }, [
              f(t(j), {
                icon: L.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(" " + h(L.value ? "Show less" : "Show more"), 1)
            ], 8, Nt)) : w("", !0),
            B.value ? w("", !0) : (i(), c("div", St, [
              f(t(j), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              a[4] || (a[4] = N(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (i(), c("div", Et, [
          s.value.length ? w("", !0) : (i(), c("div", Dt, [
            f(t(j), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            a[5] || (a[5] = N(" This document has no chunks.", -1))
          ])),
          (i(!0), c(ee, null, ce(s.value, (o, y) => (i(), c("div", {
            key: o.id,
            class: re(["dr-chunk", { open: I.value[o.id] }])
          }, [
            u("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!I.value[o.id],
              onClick: (_) => V(o)
            }, [
              u("span", Lt, h(y + 1), 1),
              u("span", Mt, "Chunk " + h(y + 1), 1),
              f(t(j), {
                class: "dr-chunk-chev",
                icon: I.value[o.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, It),
            T(o) ? (i(), c("p", Ot, [
              f(t(j), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              u("span", null, h(T(o)), 1)
            ])) : w("", !0),
            u("p", {
              class: re(["dr-chunk-body", { clamp: !I.value[o.id] }])
            }, h(o.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(t(Ve), {
        contained: "",
        open: R.value && H.value,
        title: D.value || "Original",
        "content-type": P.value || l.node.content_type || "",
        "source-url": ae.value,
        filename: D.value,
        onClose: a[2] || (a[2] = (o) => R.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Bt = { class: "kb-page kd" }, qt = { class: "kd-filter" }, Vt = ["aria-label"], jt = {
  key: 0,
  class: "kd-list-skel"
}, Ut = ["disabled", "onClick"], Xt = { class: "kd-row-ic" }, zt = { class: "kd-row-main" }, Kt = { class: "kd-row-title" }, At = { class: "kd-row-sub" }, Ft = {
  key: 1,
  class: "kd-list-empty"
}, Ht = {
  key: 0,
  class: "kd-pager"
}, Wt = { class: "kd-pager-label" }, Gt = { class: "kx-main-scroll kd-reader" }, Jt = /* @__PURE__ */ fe({
  __name: "KbDocument",
  setup(l) {
    const n = De(), g = Ie(), d = x(() => n.value.config?.kb_id || ""), b = x(() => n.value.config?.route || "");
    let m = !1;
    const s = p("documents"), C = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], M = x(() => s.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: O,
      notice: R,
      indexingNotice: I,
      documents: T,
      deleting: S,
      scheduleRefresh: F,
      remove: ne,
      findDoc: P,
      page: H,
      pageSize: ae,
      total: D,
      hasPrev: B,
      hasNext: Y,
      next: de,
      prev: le
    } = Ge(() => d.value, { includeIndexing: !0, scope: () => s.value }), L = p(""), W = x(() => {
      const k = L.value.trim().toLowerCase();
      return k ? T.value.filter((r) => se(r).toLowerCase().includes(k)) : T.value;
    }), K = x(() => D.value === 0 ? 0 : H.value * ae.value + 1), G = x(() => Math.min((H.value + 1) * ae.value, D.value)), $ = p(""), E = p(null), U = x(() => S.value[$.value] ? null : P($.value) || (E.value?.id === $.value ? E.value : null));
    let q = 0;
    const X = p(!1), V = p(!1), e = p(null), a = x(() => !!e.value && !!S.value[e.value.id]);
    function o(k) {
      if (S.value[k.id]) return;
      const r = $.value !== k.id;
      $.value = k.id, r && !m && g("navigate", k.id);
    }
    function y(k) {
      const r = P(k);
      r && (o(r), V.value = !1);
    }
    function _(k) {
      k !== s.value && (q++, V.value = !1, $.value = "", E.value = null, L.value = "", s.value = k === "failures" ? "failures" : "documents");
    }
    function Z(k) {
      e.value = k;
    }
    async function z() {
      const k = e.value;
      if (!k) return;
      await ne(k) && ($.value === k.id && ($.value = ""), e.value = null);
    }
    function pe(k) {
      k.key === "Escape" && V.value && (V.value = !1);
    }
    return Se(() => {
      window.addEventListener("keydown", pe), Ee("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ve(() => {
      q++, window.removeEventListener("keydown", pe);
    }), te(T, (k) => {
      if (E.value && P(E.value.id) && (E.value = null), U.value) return;
      const r = k.filter((oe) => !S.value[oe.id]), A = (b.value ? r.find((oe) => oe.id === b.value) : null) || r[0];
      if (A) {
        m = !0;
        try {
          o(A);
        } finally {
          m = !1;
        }
      } else P($.value) || ($.value = "");
    }), te(d, () => {
      $.value = "";
    }), te([d, b], async ([k, r]) => {
      const v = ++q;
      if (E.value?.id !== r && (E.value = null), !k || !r || r === $.value) return;
      let A = P(r);
      if (!A)
        try {
          const { data: oe } = await ue.get(`/api/v1/kb10/${k}/browse?node_id=${encodeURIComponent(r)}`);
          if (v !== q || oe?.node?.node_type !== "document" || oe.node.parent_id) return;
          A = oe.node;
        } catch {
          return;
        }
      _(A.metadata?.status === "failed" ? "failures" : "documents"), E.value = P(A.id) ? null : A, m = !0;
      try {
        o(A);
      } finally {
        m = !1;
      }
    }, { immediate: !0 }), (k, r) => (i(), c("div", Bt, [
      t(R) ? (i(), Q(t(ge), {
        key: 0,
        class: "kd-notice"
      }, {
        default: J(() => [
          N(h(t(R)), 1)
        ]),
        _: 1
      })) : w("", !0),
      t(I) ? (i(), Q(t(ge), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: J(() => [
          N(h(t(I)), 1)
        ]),
        _: 1
      })) : w("", !0),
      f(t(je), null, {
        rail: J(() => [
          f(t(et), {
            title: M.value,
            count: t(D)
          }, {
            actions: J(() => [
              s.value === "documents" ? (i(), Q(t(ie), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: V.value,
                onClick: r[0] || (r[0] = (v) => V.value = !V.value)
              }, null, 8, ["active"])) : w("", !0),
              f(t(ie), {
                icon: "tabler:plus",
                label: "Add document",
                active: X.value,
                onClick: r[1] || (r[1] = (v) => X.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          f(t(xe), {
            tabs: C,
            active: s.value,
            onSelect: _
          }, null, 8, ["active"]),
          u("div", qt, [
            f(t(ze), {
              modelValue: L.value,
              "onUpdate:modelValue": r[2] || (r[2] = (v) => L.value = v),
              placeholder: s.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          u("nav", {
            class: "kd-list",
            "aria-label": M.value
          }, [
            t(O) && !t(T).length ? (i(), c("div", jt, [
              (i(), c(ee, null, ce(6, (v) => u("div", {
                key: v,
                class: "kd-skel-row"
              })), 64))
            ])) : w("", !0),
            (i(!0), c(ee, null, ce(W.value, (v) => (i(), c("div", {
              key: v.id,
              class: re(["kd-row", { on: $.value === v.id }])
            }, [
              u("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!t(S)[v.id],
                onClick: (A) => o(v)
              }, [
                u("span", Xt, [
                  f(t(j), {
                    icon: t($e)(v),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                u("span", zt, [
                  u("span", Kt, h(t(se)(v)), 1),
                  u("span", At, [
                    N(h(t(Fe)(v)), 1),
                    v.created_at ? (i(), c(ee, { key: 0 }, [
                      N(" · " + h(t(Ce)(v.created_at)), 1)
                    ], 64)) : w("", !0)
                  ])
                ])
              ], 8, Ut),
              f(t(ie), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${t(se)(v)}`,
                variant: "danger",
                size: "sm",
                spin: !!t(S)[v.id],
                disabled: !!t(S)[v.id],
                onClick: (A) => Z(v)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !t(O) && !W.value.length ? (i(), c("div", Ft, [
              s.value === "failures" ? (i(), c(ee, { key: 0 }, [
                N(h(t(T).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : (i(), c(ee, { key: 1 }, [
                N(h(t(T).length ? "No documents match." : "No documents yet — add one with +."), 1)
              ], 64))
            ])) : w("", !0)
          ], 8, Vt),
          t(D) > t(ae) ? (i(), c("div", Ht, [
            f(t(ie), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !t(B),
              onClick: t(le)
            }, null, 8, ["disabled", "onClick"]),
            u("span", Wt, h(K.value) + "–" + h(G.value) + " of " + h(t(D)), 1),
            f(t(ie), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !t(Y),
              onClick: t(de)
            }, null, 8, ["disabled", "onClick"])
          ])) : w("", !0)
        ]),
        default: J(() => [
          u("div", Gt, [
            V.value ? (i(), Q(t(Ue), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: "",
              onOpen: r[3] || (r[3] = (v) => v.parent_id && y(v.parent_id)),
              onClose: r[4] || (r[4] = (v) => V.value = !1)
            }, null, 8, ["kb-id"])) : U.value ? (i(), Q(Pt, {
              key: 1,
              "kb-id": d.value,
              node: U.value
            }, null, 8, ["kb-id", "node"])) : (i(), Q(Xe, {
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
      f(t(Ke), {
        open: X.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: r[6] || (r[6] = (v) => X.value = !1)
      }, {
        default: J(() => [
          f(Ae, {
            "kb-id": d.value,
            noun: "document",
            onChanged: r[5] || (r[5] = (v) => {
              v && (X.value = !1), t(F)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(t(ut), {
        open: !!e.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: e.value ? t(se)(e.value) : "",
        "confirm-label": "Delete",
        busy: a.value,
        onCancel: r[7] || (r[7] = (v) => e.value = null),
        onConfirm: z
      }, {
        default: J(() => [
          r[8] || (r[8] = N(" Remove ", -1)),
          u("strong", null, h(e.value ? t(se)(e.value) : ""), 1),
          r[9] || (r[9] = N(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), an = {
  rootComponent: Jt
};
export {
  an as mountConfig
};
//# sourceMappingURL=document-mount-W32lRziU.js.map
