import { ref as k, computed as w, onBeforeUnmount as pe, watch as te, defineComponent as ke, openBlock as a, createElementBlock as c, createElementVNode as v, createTextVNode as $, toDisplayString as b, createCommentVNode as g, renderSlot as Ce, createBlock as X, Transition as De, withCtx as F, withModifiers as Re, normalizeClass as de, createVNode as y, unref as e, nextTick as ge, Fragment as J, renderList as me, onMounted as Le } from "vue";
import { Icon as U } from "@iconify/vue";
import { api as se, host as he, loadByTagName as Me } from "@wippy-fe/proxy";
import { u as Oe, a as Pe } from "./wc-runtime-CuuaQDIp.js";
import { E as _e, i as xe, f as Be, s as qe, c as Ue, _ as oe, u as Ve, a as je, n as ie, b as ze, d as Ne, e as Xe, g as Fe, h as fe, j as Ke, k as We, l as Ae, m as He, o as Ge, p as Je } from "./AddPanel.vue_vue_type_script_setup_true_lang-HKgspD4a.js";
import { _ as we } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const $e = {
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
function Qe(l) {
  const n = l.content_type || "";
  if ($e[n]) return $e[n];
  const x = l.metadata || {}, d = String(x.filename || x.source_url || x.title || ""), C = d.lastIndexOf(".");
  if (C > 0 && C < d.length - 1) {
    const _ = d.slice(C + 1).split(/[?#]/)[0];
    if (_.length <= 5) return _.toUpperCase();
  }
  return x.source_url ? "URL" : n.startsWith("image/") ? "IMG" : "DOC";
}
function Te(l) {
  const n = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : n === "application/pdf" ? "tabler:file-type-pdf" : n === "text/markdown" ? "tabler:markdown" : n === "text/csv" || n.includes("spreadsheet") || n.includes("excel") ? "tabler:table" : n === "application/json" ? "tabler:json" : n.includes("word") || n.includes("document") ? "tabler:file-text" : n.includes("presentation") || n.includes("powerpoint") ? "tabler:presentation" : n === "text/html" ? "tabler:file-code" : n.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Se(l) {
  if (!l) return "";
  const n = new Date(l), x = n.getTime();
  if (Number.isNaN(x)) return "";
  const d = Date.now() - x, C = Math.round(d / 1e3);
  if (C < 45) return "just now";
  const _ = Math.round(C / 60);
  if (_ < 60) return `${_}m ago`;
  const h = Math.round(_ / 60);
  if (h < 24) return `${h}h ago`;
  const m = Math.round(h / 24);
  return m < 7 ? `${m}d ago` : n.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function Ye(l) {
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
const Ze = 400;
function et(l, n = {}) {
  const x = k(!1), d = k(""), C = k(""), _ = k(!1), h = k([]), m = k(0), V = k(50), P = k(0), B = w(() => Math.max(1, Math.ceil(P.value / V.value))), R = w(() => m.value > 0), G = w(() => m.value < B.value - 1), N = k({}), K = 2e4, D = /* @__PURE__ */ new Map(), Q = /* @__PURE__ */ new Map();
  function ne(r) {
    const t = { ...N.value };
    delete t[r], N.value = t;
    const o = D.get(r);
    o && (clearTimeout(o), D.delete(r)), Q.delete(r);
  }
  const j = h;
  function Y(r) {
    return j.value.find((t) => t.id === r);
  }
  let W = 0;
  async function L() {
    const r = l();
    if (!r) return;
    const t = ++W;
    x.value = !0, d.value = "";
    try {
      const o = m.value * V.value, i = n.includeIndexing ? "&include_indexing=true" : "", p = n.scope?.(), ue = p ? `scope=${p}` : "node_type=document", { data: E } = await se.get(`/api/v1/kb10/${r}/browse?${ue}&limit=${V.value}&offset=${o}${i}`);
      if (t !== W || l() !== r) return;
      if (!E?.success) {
        d.value = E?.error && xe(E.error) ? _e : E?.error || "Could not load contents";
        return;
      }
      return h.value = E.nodes || [], P.value = Number(E.total) || 0, C.value = Be(E.pending_source), _.value = E.pending_source?.retrying === !0, !0;
    } catch (o) {
      if (t !== W) return;
      const i = o?.response?.data?.error || o?.message || "could not load contents";
      d.value = xe(i) ? _e : i, he.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
    } finally {
      t === W && (x.value = !1);
    }
  }
  function A(r) {
    const t = Math.max(0, Math.min(r, B.value - 1));
    t !== m.value && (m.value = t, T(), L());
  }
  function re() {
    G.value && A(m.value + 1);
  }
  function ce() {
    R.value && A(m.value - 1);
  }
  async function ae(r) {
    const t = l();
    if (!t || N.value[r.id]) return !1;
    const o = Ue(r);
    Q.set(r.id, { kbId: t, scope: n.scope?.() }), N.value = { ...N.value, [r.id]: !0 };
    let i = !1;
    try {
      const { data: p } = await se.delete(`/api/v1/knowledge/${t}/content`, { data: o });
      p?.success ? (i = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = p?.error || "could not queue delete";
    } catch (p) {
      d.value = p?.response?.data?.error || p?.message || "could not queue delete", he.handleError(p?.response?.status === 401 ? "auth-expired" : "other", p);
    } finally {
      if (!i)
        ne(r.id);
      else {
        const p = r.id;
        D.set(p, setTimeout(() => {
          N.value[p] && (ne(p), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, K));
      }
    }
    return i;
  }
  function q() {
    const r = Object.keys(N.value);
    if (r.length === 0) return;
    const t = new Set(h.value.map((i) => i.id)), o = r.filter((i) => {
      const p = Q.get(i);
      return p?.kbId === l() && p.scope === n.scope?.() && !t.has(i);
    });
    if (o.length) {
      for (const i of o) ne(i);
      Object.keys(N.value).length || (d.value = ""), n.onChanged?.();
    }
  }
  let M, ee = !1, H = !1;
  function T() {
    M !== void 0 && clearTimeout(M), M = void 0, H = !1;
  }
  function S() {
    if (l()) {
      if (ee) {
        H = !0;
        return;
      }
      M === void 0 && (M = setTimeout(async () => {
        M = void 0, ee = !0;
        try {
          await L() && q();
        } finally {
          ee = !1;
          const r = H;
          H = !1, r && S();
        }
      }, Ze));
    }
  }
  let O = null, z = 0;
  function Z(r) {
    const t = ++z;
    if (O && (O(), O = null), !r) return;
    const o = qe(r, () => {
      t === z && S();
    });
    if (t !== z) {
      o && o();
      return;
    }
    O = o;
  }
  return pe(() => {
    z++, T(), W++, O && O(), D.forEach((r) => clearTimeout(r)), D.clear();
  }), te([l, () => n.scope?.()], ([r], [t]) => {
    T(), m.value = 0, P.value = 0, h.value = [], C.value = "", _.value = !1, L(), r !== t && Z(r);
  }, { immediate: !0 }), {
    loading: x,
    notice: d,
    indexingNotice: C,
    indexingRetrying: _,
    nodes: h,
    documents: j,
    deleting: N,
    load: L,
    reload: L,
    remove: ae,
    findDoc: Y,
    page: m,
    pageSize: V,
    total: P,
    pageCount: B,
    hasPrev: R,
    hasNext: G,
    next: re,
    prev: ce,
    goToPage: A,
    scheduleRefresh: S
  };
}
const tt = { class: "kx-railhead" }, nt = { class: "kx-railhead-title" }, at = { key: 0 }, lt = { class: "kx-railhead-acts" }, ot = /* @__PURE__ */ ke({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (n, x) => (a(), c("div", tt, [
      v("span", nt, [
        $(b(l.title), 1),
        l.count !== void 0 ? (a(), c("b", at, b(l.count), 1)) : g("", !0)
      ]),
      v("div", lt, [
        Ce(n.$slots, "actions")
      ])
    ]));
  }
}), it = ["aria-label"], st = { class: "kx-modal-h" }, rt = { class: "kx-modal-h-ico" }, ut = { class: "kx-modal-h-text" }, dt = { class: "kx-modal-h-title" }, ct = {
  key: 0,
  class: "kx-modal-h-sub"
}, vt = { class: "kx-modal-body" }, ft = { class: "kx-modal-foot" }, mt = /* @__PURE__ */ ke({
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
    const x = l, d = n;
    function C(_) {
      _.key === "Escape" && !x.busy && d("cancel");
    }
    return te(() => x.open, (_) => {
      _ ? window.addEventListener("keydown", C) : window.removeEventListener("keydown", C);
    }), pe(() => window.removeEventListener("keydown", C)), (_, h) => (a(), X(De, { name: "kx-modal" }, {
      default: F(() => [
        l.open ? (a(), c("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: h[3] || (h[3] = Re((m) => !l.busy && d("cancel"), ["self"]))
        }, [
          v("div", {
            class: de(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            v("div", st, [
              v("span", rt, [
                y(e(U), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              v("span", ut, [
                v("span", dt, b(l.title), 1),
                l.subtitle ? (a(), c("span", ct, b(l.subtitle), 1)) : g("", !0)
              ]),
              y(oe, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: h[0] || (h[0] = (m) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            v("div", vt, [
              Ce(_.$slots, "default")
            ]),
            v("div", ft, [
              y(we, {
                variant: "ghost",
                disabled: l.busy,
                onClick: h[1] || (h[1] = (m) => d("cancel"))
              }, {
                default: F(() => [
                  $(b(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              y(we, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: h[2] || (h[2] = (m) => d("confirm"))
              }, {
                default: F(() => [
                  $(b(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, it)
        ])) : g("", !0)
      ]),
      _: 3
    }));
  }
}), pt = { class: "dr" }, kt = { class: "dr-head" }, ht = { class: "dr-badge" }, yt = { class: "dr-head-body" }, bt = { class: "dr-head-top" }, gt = { class: "dr-title" }, _t = { class: "dr-facts" }, xt = {
  key: 0,
  class: "dr-fact"
}, wt = {
  key: 1,
  class: "dr-fact"
}, $t = ["title"], Ct = ["href"], Nt = {
  key: 0,
  class: "dr-state err",
  role: "status"
}, Tt = { key: 0 }, St = {
  key: 1,
  class: "dr-skel"
}, Et = {
  key: 2,
  class: "dr-state err"
}, It = {
  key: 0,
  class: "dr-doc"
}, Dt = { class: "dr-doc-main" }, Rt = ["content-type", "source", "filename"], Lt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Mt = ["aria-expanded"], Ot = {
  key: 3,
  class: "dr-state"
}, Pt = {
  key: 1,
  class: "dr-chunks"
}, Bt = {
  key: 0,
  class: "dr-state"
}, qt = ["aria-expanded", "onClick"], Ut = { class: "dr-chunk-n" }, Vt = { class: "dr-chunk-label" }, jt = {
  key: 0,
  class: "dr-chunk-cx"
}, zt = 720, Xt = /* @__PURE__ */ ke({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const n = l, x = k(!1), d = k(""), C = k(""), _ = k(""), h = k([]), m = k(0), V = k(""), P = k("read"), B = k(!1), R = k({});
    function G(t) {
      return String((t.metadata || {}).contextual_prefix || "");
    }
    const N = w(() => n.node.metadata || {}), K = w(() => N.value.status === "failed"), D = w(() => typeof N.value.error == "string" ? N.value.error.trim() : ""), Q = w(() => N.value.source_url), ne = w(() => _.value || n.node.content_type || "text/markdown"), j = w(() => String(N.value.original_mime_type || N.value.source_mime || "")), Y = w(() => Ve(N.value) ? je(j.value || n.node.content_type || "") : !1), W = w(() => `/api/v1/kb10/${n.kbId}/nodes/${n.node.id}/source`), L = w(() => String(N.value.filename || N.value.original_filename || "")), A = w(() => C.value ? C.value : h.value.map((t) => t.content).filter(Boolean).join(`

`)), re = w(() => {
      const t = A.value.trim();
      return t ? t.split(/\s+/).length : 0;
    });
    function ce() {
      Y.value && (B.value = !B.value);
    }
    const ae = k(null), q = k(!1), M = k(!1);
    function ee() {
      const t = ae.value;
      if (!t) {
        M.value = !1;
        return;
      }
      M.value = t.scrollHeight - zt > 24;
    }
    let H = null;
    function T() {
      H?.disconnect();
      const t = ae.value;
      t && (H = new ResizeObserver(() => ee()), H.observe(t), ge(ee));
    }
    const S = w(() => M.value && !q.value);
    let O = 0;
    async function z() {
      if (!n.kbId || !n.node?.id) return;
      const t = ++O;
      x.value = !0, d.value = "", C.value = "", _.value = "", h.value = [], m.value = 0, V.value = "", P.value = "read", R.value = {}, q.value = !1, M.value = !1;
      try {
        const [{ data: o }, { data: i }, { data: p }] = await Promise.all([
          se.get(`/api/v1/kb10/${n.kbId}/browse?node_id=${n.node.id}`),
          se.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=chunk&include_content=true&limit=200`),
          se.get(`/api/v1/kb10/${n.kbId}/browse?parent_id=${n.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (t !== O) return;
        if (o?.success && o.node && (C.value = String(o.node.content || ""), _.value = String(o.node.content_type || "")), i?.success) {
          if (!Number.isInteger(i.total) || i.total < 0) throw new Error("Invalid chunk total");
          m.value = i.total;
          const ue = i.nodes;
          if (h.value = ue.filter((E) => E.node_type === "chunk").sort((E, ve) => Number((E.metadata || {}).index ?? (E.metadata || {}).chunk_index ?? 0) - Number((ve.metadata || {}).index ?? (ve.metadata || {}).chunk_index ?? 0)), !p?.success) throw new Error(p?.error || "could not load summary");
          V.value = p.nodes[0]?.content || "", C.value || (C.value = V.value || n.node.content || "");
        }
        !o?.success && !i?.success && (d.value = o?.error || i?.error || "could not load document");
      } catch (o) {
        if (t !== O) return;
        d.value = o?.response?.data?.error || o?.message || "could not load document", he.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
      } finally {
        t === O && (x.value = !1);
      }
    }
    const Z = w(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: m.value || void 0 }
    ]);
    function r(t) {
      R.value = { ...R.value, [t.id]: !R.value[t.id] };
    }
    return te([A, P, x], () => {
      P.value === "read" && !x.value && ge(T);
    }), te(Y, (t) => {
      t || (B.value = !1);
    }), te(() => n.node?.id, () => z(), { immediate: !0 }), pe(() => {
      H?.disconnect();
    }), (t, o) => (a(), c("div", pt, [
      v("header", kt, [
        v("span", ht, [
          y(e(U), {
            icon: e(Te)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        v("div", yt, [
          v("div", bt, [
            v("h2", gt, b(e(ie)(l.node)), 1),
            Y.value ? (a(), X(e(ze), {
              key: 0,
              class: de(["dr-orig-btn", { on: B.value }]),
              label: B.value ? "Hide original" : "View original",
              onOpen: ce
            }, null, 8, ["class", "label"])) : g("", !0)
          ]),
          v("div", _t, [
            m.value ? (a(), c("span", xt, [
              y(e(U), { icon: "tabler:layout-grid" }),
              $(b(m.value.toLocaleString()) + " chunks", 1)
            ])) : g("", !0),
            re.value ? (a(), c("span", wt, [
              y(e(U), { icon: "tabler:align-left" }),
              $(b(re.value.toLocaleString()) + " words", 1)
            ])) : g("", !0),
            l.node.created_at ? (a(), c("span", {
              key: 2,
              class: "dr-fact",
              title: e(Ye)(l.node.created_at)
            }, [
              y(e(U), { icon: "tabler:clock" }),
              $(b(e(Se)(l.node.created_at)), 1)
            ], 8, $t)) : g("", !0),
            Q.value ? (a(), c("a", {
              key: 3,
              class: "dr-fact link",
              href: Q.value,
              target: "_blank",
              rel: "noopener"
            }, [
              y(e(U), { icon: "tabler:external-link" }),
              o[3] || (o[3] = $("Source", -1))
            ], 8, Ct)) : g("", !0)
          ])
        ])
      ]),
      K.value ? (a(), c("div", Nt, [
        y(e(U), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        v("span", null, [
          o[4] || (o[4] = $("Indexing failed", -1)),
          D.value ? (a(), c("span", Tt, ": " + b(D.value), 1)) : g("", !0)
        ])
      ])) : g("", !0),
      y(e(Ne), {
        tabs: Z.value,
        active: P.value,
        onSelect: o[0] || (o[0] = (i) => P.value = i)
      }, null, 8, ["tabs", "active"]),
      x.value ? (a(), c("div", St, [
        (a(), c(J, null, me(6, (i) => v("div", {
          key: i,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (a(), c("div", Et, [
        y(e(U), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        $(" " + b(d.value), 1)
      ])) : (a(), c(J, { key: 3 }, [
        P.value === "read" ? (a(), c("div", It, [
          v("div", Dt, [
            V.value ? (a(), X(e(Xe), {
              key: 0,
              text: V.value
            }, null, 8, ["text"])) : g("", !0),
            A.value ? (a(), c("div", {
              key: 1,
              class: de(["dr-clamp", { clamped: S.value }])
            }, [
              v("div", {
                ref_key: "bodyRef",
                ref: ae,
                class: "dr-clamp-inner"
              }, [
                v("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": ne.value,
                  source: A.value,
                  filename: L.value
                }, null, 8, Rt)
              ], 512),
              S.value ? (a(), c("div", Lt)) : g("", !0)
            ], 2)) : g("", !0),
            M.value ? (a(), c("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": q.value,
              onClick: o[1] || (o[1] = (i) => q.value = !q.value)
            }, [
              y(e(U), {
                icon: q.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $(" " + b(q.value ? "Show less" : "Show more"), 1)
            ], 8, Mt)) : g("", !0),
            !A.value && !K.value ? (a(), c("div", Ot, [
              y(e(U), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              o[5] || (o[5] = $(" No readable content was indexed for this document.", -1))
            ])) : g("", !0)
          ])
        ])) : (a(), c("div", Pt, [
          h.value.length ? g("", !0) : (a(), c("div", Bt, [
            y(e(U), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            o[6] || (o[6] = $(" This document has no chunks.", -1))
          ])),
          (a(!0), c(J, null, me(h.value, (i, p) => (a(), c("div", {
            key: i.id,
            class: de(["dr-chunk", { open: R.value[i.id] }])
          }, [
            v("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!R.value[i.id],
              onClick: (ue) => r(i)
            }, [
              v("span", Ut, b(p + 1), 1),
              v("span", Vt, "Chunk " + b(p + 1), 1),
              y(e(U), {
                class: "dr-chunk-chev",
                icon: R.value[i.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, qt),
            G(i) ? (a(), c("p", jt, [
              y(e(U), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v("span", null, b(G(i)), 1)
            ])) : g("", !0),
            v("p", {
              class: de(["dr-chunk-body", { clamp: !R.value[i.id] }])
            }, b(i.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      y(e(Fe), {
        contained: "",
        open: B.value && Y.value,
        title: L.value || "Original",
        "content-type": j.value || l.node.content_type || "",
        "source-url": W.value,
        filename: L.value,
        onClose: o[2] || (o[2] = (i) => B.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Ft = { class: "kb-page kd" }, Kt = { class: "kd-filter" }, Wt = ["aria-label"], At = {
  key: 0,
  class: "kd-list-skel"
}, Ht = ["disabled", "onClick"], Gt = { class: "kd-row-ic" }, Jt = { class: "kd-row-main" }, Qt = { class: "kd-row-title" }, Yt = { class: "kd-row-sub" }, Zt = {
  key: 1,
  class: "kd-list-empty"
}, en = {
  key: 0,
  class: "kd-pager"
}, tn = { class: "kd-pager-label" }, nn = { class: "kx-main-scroll kd-reader" }, an = /* @__PURE__ */ ke({
  __name: "KbDocument",
  setup(l) {
    const n = Oe(), x = Pe(), d = w(() => n.value.config?.kb_id || ""), C = w(() => n.value.config?.route || "");
    let _ = "", h = !1;
    const m = k("documents"), V = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], P = w(() => m.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: B,
      notice: R,
      indexingNotice: G,
      indexingRetrying: N,
      documents: K,
      deleting: D,
      scheduleRefresh: Q,
      remove: ne,
      findDoc: j,
      page: Y,
      pageSize: W,
      total: L,
      hasPrev: A,
      hasNext: re,
      next: ce,
      prev: ae
    } = et(() => d.value, { includeIndexing: !0, scope: () => m.value }), q = k(""), M = w(() => {
      const f = q.value.trim().toLowerCase();
      return f ? K.value.filter((s) => ie(s).toLowerCase().includes(f)) : K.value;
    }), ee = w(() => L.value === 0 ? 0 : Y.value * W.value + 1), H = w(() => Math.min((Y.value + 1) * W.value, L.value)), T = k(""), S = k(null), O = w(() => D.value[T.value] ? null : j(T.value) || (S.value?.id === T.value ? S.value : null));
    let z = 0;
    const Z = k(!1), r = k(!1), t = k(null), o = w(() => !!t.value && !!D.value[t.value.id]), i = k(""), p = k({});
    async function ue(f) {
      const s = d.value, u = f.retry_source_event_id;
      if (!(!s || !u || p.value[u])) {
        p.value[u] = !0, i.value = "";
        try {
          const { data: I } = await se.post(`/api/v1/knowledge/${encodeURIComponent(s)}/retry-source`, {
            node_id: f.id,
            failed_event_id: u
          });
          if (s !== d.value) return;
          if (!I?.success) throw new Error(I?.error || "Could not retry indexing");
          i.value = "Indexing retry requested.", Q();
        } catch (I) {
          if (s !== d.value) return;
          i.value = I?.response?.data?.error || I?.message || "Could not retry indexing";
        } finally {
          s === d.value && delete p.value[u];
        }
      }
    }
    function E(f) {
      if (D.value[f.id]) return;
      const s = T.value !== f.id;
      T.value = f.id, s && !h && (_ = f.id, x("navigate", f.id));
    }
    function ve(f) {
      const s = j(f);
      s && (E(s), r.value = !1);
    }
    function ye(f) {
      f !== m.value && (z++, r.value = !1, i.value = "", T.value = "", S.value = null, q.value = "", m.value = f === "failures" ? "failures" : "documents");
    }
    function Ee(f) {
      t.value = f;
    }
    async function Ie() {
      const f = t.value;
      if (!f) return;
      await ne(f) && (T.value === f.id && (T.value = ""), S.value?.id === f.id && (S.value = null), _ === f.id && (z++, _ = "", x("navigate", "")), t.value = null);
    }
    function be(f) {
      f.key === "Escape" && r.value && (r.value = !1);
    }
    return Le(() => {
      window.addEventListener("keydown", be), Me("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), pe(() => {
      z++, window.removeEventListener("keydown", be);
    }), te(K, (f) => {
      if (S.value && j(S.value.id) && (S.value = null), O.value) return;
      const s = f.filter((le) => !D.value[le.id]), I = s.find((le) => le.id === _) || s[0];
      if (I) {
        h = !0;
        try {
          E(I);
        } finally {
          h = !1;
        }
      } else j(T.value) || (T.value = "");
    }), te(d, () => {
      T.value = "", i.value = "", p.value = {};
    }), te([d, C], async ([f, s]) => {
      _ = s;
      const u = ++z;
      if (S.value?.id !== s && (S.value = null), !f || !s || s === T.value) return;
      let I = j(s);
      if (!I)
        try {
          const { data: le } = await se.get(`/api/v1/kb10/${f}/browse?node_id=${encodeURIComponent(s)}`);
          if (u !== z || le?.node?.node_type !== "document" || le.node.parent_id) return;
          I = le.node;
        } catch {
          return;
        }
      ye(I.metadata?.status === "failed" ? "failures" : "documents"), S.value = j(I.id) ? null : I, h = !0;
      try {
        E(I);
      } finally {
        h = !1;
      }
    }, { immediate: !0 }), (f, s) => (a(), c("div", Ft, [
      e(R) ? (a(), X(e(fe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: F(() => [
          $(b(e(R)), 1)
        ]),
        _: 1
      })) : g("", !0),
      e(G) ? (a(), X(e(fe), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: F(() => [
          $(b(e(G)), 1)
        ]),
        _: 1
      })) : g("", !0),
      e(G) && e(N) ? (a(), X(e(fe), {
        key: 2,
        class: "kd-notice",
        role: "status"
      }, {
        default: F(() => [...s[8] || (s[8] = [
          $("Work is delayed and will retry automatically.", -1)
        ])]),
        _: 1
      })) : g("", !0),
      i.value ? (a(), X(e(fe), {
        key: 3,
        class: "kd-notice",
        role: "status"
      }, {
        default: F(() => [
          $(b(i.value), 1)
        ]),
        _: 1
      })) : g("", !0),
      y(e(Ke), null, {
        rail: F(() => [
          y(e(ot), {
            title: P.value,
            count: e(L)
          }, {
            actions: F(() => [
              m.value === "documents" ? (a(), X(e(oe), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: r.value,
                onClick: s[0] || (s[0] = (u) => r.value = !r.value)
              }, null, 8, ["active"])) : g("", !0),
              y(e(oe), {
                icon: "tabler:plus",
                label: "Add document",
                active: Z.value,
                onClick: s[1] || (s[1] = (u) => Z.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          y(e(Ne), {
            tabs: V,
            active: m.value,
            onSelect: ye
          }, null, 8, ["active"]),
          v("div", Kt, [
            y(e(He), {
              modelValue: q.value,
              "onUpdate:modelValue": s[2] || (s[2] = (u) => q.value = u),
              placeholder: m.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          v("nav", {
            class: "kd-list",
            "aria-label": P.value
          }, [
            e(B) && !e(K).length ? (a(), c("div", At, [
              (a(), c(J, null, me(6, (u) => v("div", {
                key: u,
                class: "kd-skel-row"
              })), 64))
            ])) : g("", !0),
            (a(!0), c(J, null, me(M.value, (u) => (a(), c("div", {
              key: u.id,
              class: de(["kd-row", { on: T.value === u.id }])
            }, [
              v("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(D)[u.id],
                onClick: (I) => E(u)
              }, [
                v("span", Gt, [
                  y(e(U), {
                    icon: e(Te)(u),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                v("span", Jt, [
                  v("span", Qt, b(e(ie)(u)), 1),
                  v("span", Yt, [
                    $(b(e(Qe)(u)), 1),
                    u.created_at ? (a(), c(J, { key: 0 }, [
                      $(" · " + b(e(Se)(u.created_at)), 1)
                    ], 64)) : g("", !0)
                  ])
                ])
              ], 8, Ht),
              u.retry_source_event_id ? (a(), X(e(oe), {
                key: 0,
                icon: "tabler:refresh",
                label: `Retry indexing ${e(ie)(u)}`,
                size: "sm",
                spin: !!p.value[u.retry_source_event_id],
                disabled: !!p.value[u.retry_source_event_id] || !!e(D)[u.id],
                onClick: (I) => ue(u)
              }, null, 8, ["label", "spin", "disabled", "onClick"])) : g("", !0),
              y(e(oe), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(ie)(u)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(D)[u.id],
                disabled: !!e(D)[u.id],
                onClick: (I) => Ee(u)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(B) && !e(R) && !M.value.length ? (a(), c("div", Zt, [
              m.value === "failures" ? (a(), c(J, { key: 0 }, [
                $(b(e(K).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : e(K).length ? (a(), c(J, { key: 1 }, [
                $("No documents match.")
              ], 64)) : e(G) ? (a(), c(J, { key: 2 }, [
                $("Documents appear here after indexing.")
              ], 64)) : (a(), c(J, { key: 3 }, [
                $("No documents yet.")
              ], 64))
            ])) : g("", !0)
          ], 8, Wt),
          e(L) > e(W) ? (a(), c("div", en, [
            y(e(oe), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(A),
              onClick: e(ae)
            }, null, 8, ["disabled", "onClick"]),
            v("span", tn, b(ee.value) + "–" + b(H.value) + " of " + b(e(L)), 1),
            y(e(oe), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(re),
              onClick: e(ce)
            }, null, 8, ["disabled", "onClick"])
          ])) : g("", !0)
        ]),
        default: F(() => [
          v("div", nn, [
            r.value ? (a(), X(e(We), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: "",
              onOpen: s[3] || (s[3] = (u) => u.parent_id && ve(u.parent_id)),
              onClose: s[4] || (s[4] = (u) => r.value = !1)
            }, null, 8, ["kb-id"])) : O.value ? (a(), X(Xt, {
              key: 1,
              "kb-id": d.value,
              node: O.value
            }, null, 8, ["kb-id", "node"])) : (a(), X(Ae, {
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
      y(e(Ge), {
        open: Z.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: s[6] || (s[6] = (u) => Z.value = !1)
      }, {
        default: F(() => [
          y(Je, {
            "kb-id": d.value,
            noun: "document",
            onChanged: s[5] || (s[5] = (u) => {
              u && (Z.value = !1), e(Q)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      y(e(mt), {
        open: !!t.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: t.value ? e(ie)(t.value) : "",
        "confirm-label": "Delete",
        busy: o.value,
        onCancel: s[7] || (s[7] = (u) => t.value = null),
        onConfirm: Ie
      }, {
        default: F(() => [
          s[9] || (s[9] = $(" Remove ", -1)),
          v("strong", null, b(t.value ? e(ie)(t.value) : ""), 1),
          s[10] || (s[10] = $(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), cn = {
  rootComponent: an
};
export {
  cn as mountConfig
};
