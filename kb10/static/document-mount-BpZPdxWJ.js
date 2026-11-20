import { ref as b, computed as w, onBeforeUnmount as me, watch as ne, defineComponent as pe, openBlock as o, createElementBlock as c, createElementVNode as d, createTextVNode as T, toDisplayString as g, createCommentVNode as x, renderSlot as we, createBlock as Y, Transition as Ne, withCtx as H, withModifiers as Se, normalizeClass as ue, createVNode as p, unref as e, nextTick as ke, Fragment as te, renderList as fe, onMounted as Ee } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as de, host as he, loadByTagName as De } from "@wippy-fe/proxy";
import { a as Ie, u as Le } from "./wc-runtime-f54Bo-yJ.js";
import { E as be, i as ge, f as Me, s as Re, c as Oe, _ as se, u as Pe, a as Be, n as re, b as qe, d as $e, e as Ve, g as je, h as ye, j as Ue, k as Xe, l as ze, m as Fe, o as Ke, p as Ae } from "./AddPanel.vue_vue_type_script_setup_true_lang-HKgspD4a.js";
import { _ as _e } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const xe = {
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
function He(n) {
  const t = n.content_type || "";
  if (xe[t]) return xe[t];
  const _ = n.metadata || {}, v = String(_.filename || _.source_url || _.title || ""), $ = v.lastIndexOf(".");
  if ($ > 0 && $ < v.length - 1) {
    const k = v.slice($ + 1).split(/[?#]/)[0];
    if (k.length <= 5) return k.toUpperCase();
  }
  return _.source_url ? "URL" : t.startsWith("image/") ? "IMG" : "DOC";
}
function Ce(n) {
  const t = n.content_type || "";
  return (n.metadata || {}).source_url ? "tabler:world" : t === "application/pdf" ? "tabler:file-type-pdf" : t === "text/markdown" ? "tabler:markdown" : t === "text/csv" || t.includes("spreadsheet") || t.includes("excel") ? "tabler:table" : t === "application/json" ? "tabler:json" : t.includes("word") || t.includes("document") ? "tabler:file-text" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:presentation" : t === "text/html" ? "tabler:file-code" : t.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Te(n) {
  if (!n) return "";
  const t = new Date(n), _ = t.getTime();
  if (Number.isNaN(_)) return "";
  const v = Date.now() - _, $ = Math.round(v / 1e3);
  if ($ < 45) return "just now";
  const k = Math.round($ / 60);
  if (k < 60) return `${k}m ago`;
  const f = Math.round(k / 60);
  if (f < 24) return `${f}h ago`;
  const y = Math.round(f / 24);
  return y < 7 ? `${y}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function We(n) {
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
const Ge = 400;
function Je(n, t = {}) {
  const _ = b(!1), v = b(""), $ = b(""), k = b([]), f = b(0), y = b(50), j = b(0), P = w(() => Math.max(1, Math.ceil(j.value / y.value))), B = w(() => f.value > 0), M = w(() => f.value < P.value - 1), I = b({}), N = 2e4, D = /* @__PURE__ */ new Map(), Z = /* @__PURE__ */ new Map();
  function ee(l) {
    const u = { ...I.value };
    delete u[l], I.value = u;
    const i = D.get(l);
    i && (clearTimeout(i), D.delete(l)), Z.delete(l);
  }
  const X = k;
  function ae(l) {
    return X.value.find((u) => u.id === l);
  }
  let R = 0;
  async function q() {
    const l = n();
    if (!l) return;
    const u = ++R;
    _.value = !0, v.value = "";
    try {
      const i = f.value * y.value, a = t.includeIndexing ? "&include_indexing=true" : "", s = t.scope?.(), F = s ? `scope=${s}` : "node_type=document", { data: U } = await de.get(`/api/v1/kb10/${l}/browse?${F}&limit=${y.value}&offset=${i}${a}`);
      if (u !== R || n() !== l) return;
      if (!U?.success) {
        v.value = U?.error && ge(U.error) ? be : U?.error || "";
        return;
      }
      return k.value = U.nodes || [], j.value = Number(U.total) || 0, $.value = Me(U.pending_source), !0;
    } catch (i) {
      if (u !== R) return;
      const a = i?.response?.data?.error || i?.message || "could not load contents";
      v.value = ge(a) ? be : a, he.handleError(i?.response?.status === 401 ? "auth-expired" : "other", i);
    } finally {
      u === R && (_.value = !1);
    }
  }
  function W(l) {
    const u = Math.max(0, Math.min(l, P.value - 1));
    u !== f.value && (f.value = u, C(), q());
  }
  function G() {
    M.value && W(f.value + 1);
  }
  function oe() {
    B.value && W(f.value - 1);
  }
  async function ce(l) {
    const u = n();
    if (!u || I.value[l.id]) return !1;
    const i = Oe(l);
    Z.set(l.id, { kbId: u, scope: t.scope?.() }), I.value = { ...I.value, [l.id]: !0 };
    let a = !1;
    try {
      const { data: s } = await de.delete(`/api/v1/knowledge/${u}/content`, { data: i });
      s?.success ? (a = !0, v.value = "Delete queued. The row clears once indexing catches up.") : v.value = s?.error || "could not queue delete";
    } catch (s) {
      v.value = s?.response?.data?.error || s?.message || "could not queue delete", he.handleError(s?.response?.status === 401 ? "auth-expired" : "other", s);
    } finally {
      if (!a)
        ee(l.id);
      else {
        const s = l.id;
        D.set(s, setTimeout(() => {
          I.value[s] && (ee(s), v.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, N));
      }
    }
    return a;
  }
  function A() {
    const l = Object.keys(I.value);
    if (l.length === 0) return;
    const u = new Set(k.value.map((a) => a.id)), i = l.filter((a) => {
      const s = Z.get(a);
      return s?.kbId === n() && s.scope === t.scope?.() && !u.has(a);
    });
    if (i.length) {
      for (const a of i) ee(a);
      Object.keys(I.value).length || (v.value = ""), t.onChanged?.();
    }
  }
  let S, z = !1, J = !1;
  function C() {
    S !== void 0 && clearTimeout(S), S = void 0, J = !1;
  }
  function E() {
    if (n()) {
      if (z) {
        J = !0;
        return;
      }
      S === void 0 && (S = setTimeout(async () => {
        S = void 0, z = !0;
        try {
          await q() && A();
        } finally {
          z = !1;
          const l = J;
          J = !1, l && E();
        }
      }, Ge));
    }
  }
  let V = null, L = 0;
  function Q(l) {
    const u = ++L;
    if (V && (V(), V = null), !l) return;
    const i = Re(l, () => {
      u === L && E();
    });
    if (u !== L) {
      i && i();
      return;
    }
    V = i;
  }
  return me(() => {
    L++, C(), R++, V && V(), D.forEach((l) => clearTimeout(l)), D.clear();
  }), ne([n, () => t.scope?.()], ([l], [u]) => {
    C(), f.value = 0, j.value = 0, k.value = [], $.value = "", q(), l !== u && Q(l);
  }, { immediate: !0 }), {
    loading: _,
    notice: v,
    indexingNotice: $,
    nodes: k,
    documents: X,
    deleting: I,
    load: q,
    reload: q,
    remove: ce,
    findDoc: ae,
    page: f,
    pageSize: y,
    total: j,
    pageCount: P,
    hasPrev: B,
    hasNext: M,
    next: G,
    prev: oe,
    goToPage: W,
    scheduleRefresh: E
  };
}
const Qe = { class: "kx-railhead" }, Ye = { class: "kx-railhead-title" }, Ze = { key: 0 }, et = { class: "kx-railhead-acts" }, tt = /* @__PURE__ */ pe({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(n) {
    return (t, _) => (o(), c("div", Qe, [
      d("span", Ye, [
        T(g(n.title), 1),
        n.count !== void 0 ? (o(), c("b", Ze, g(n.count), 1)) : x("", !0)
      ]),
      d("div", et, [
        we(t.$slots, "actions")
      ])
    ]));
  }
}), nt = ["aria-label"], at = { class: "kx-modal-h" }, lt = { class: "kx-modal-h-ico" }, ot = { class: "kx-modal-h-text" }, it = { class: "kx-modal-h-title" }, st = {
  key: 0,
  class: "kx-modal-h-sub"
}, rt = { class: "kx-modal-body" }, ut = { class: "kx-modal-foot" }, dt = /* @__PURE__ */ pe({
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
    const _ = n, v = t;
    function $(k) {
      k.key === "Escape" && !_.busy && v("cancel");
    }
    return ne(() => _.open, (k) => {
      k ? window.addEventListener("keydown", $) : window.removeEventListener("keydown", $);
    }), me(() => window.removeEventListener("keydown", $)), (k, f) => (o(), Y(Ne, { name: "kx-modal" }, {
      default: H(() => [
        n.open ? (o(), c("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: f[3] || (f[3] = Se((y) => !n.busy && v("cancel"), ["self"]))
        }, [
          d("div", {
            class: ue(["kx-modal", { danger: n.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": n.title
          }, [
            d("div", at, [
              d("span", lt, [
                p(e(O), {
                  icon: n.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", ot, [
                d("span", it, g(n.title), 1),
                n.subtitle ? (o(), c("span", st, g(n.subtitle), 1)) : x("", !0)
              ]),
              p(se, {
                icon: "tabler:x",
                label: "Close",
                disabled: n.busy,
                onClick: f[0] || (f[0] = (y) => v("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", rt, [
              we(k.$slots, "default")
            ]),
            d("div", ut, [
              p(_e, {
                variant: "ghost",
                disabled: n.busy,
                onClick: f[1] || (f[1] = (y) => v("cancel"))
              }, {
                default: H(() => [
                  T(g(n.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              p(_e, {
                variant: n.danger ? "danger" : "primary",
                loading: n.busy,
                disabled: n.busy,
                onClick: f[2] || (f[2] = (y) => v("confirm"))
              }, {
                default: H(() => [
                  T(g(n.confirmLabel), 1)
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
}, yt = ["title"], _t = ["href"], xt = {
  key: 0,
  class: "dr-state err",
  role: "status"
}, wt = { key: 0 }, $t = {
  key: 1,
  class: "dr-skel"
}, Ct = {
  key: 2,
  class: "dr-state err"
}, Tt = {
  key: 0,
  class: "dr-doc"
}, Nt = { class: "dr-doc-main" }, St = ["content-type", "source", "filename"], Et = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Dt = ["aria-expanded"], It = {
  key: 3,
  class: "dr-state"
}, Lt = {
  key: 1,
  class: "dr-chunks"
}, Mt = {
  key: 0,
  class: "dr-state"
}, Rt = ["aria-expanded", "onClick"], Ot = { class: "dr-chunk-n" }, Pt = { class: "dr-chunk-label" }, Bt = {
  key: 0,
  class: "dr-chunk-cx"
}, qt = 720, Vt = /* @__PURE__ */ pe({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(n) {
    const t = n, _ = b(!1), v = b(""), $ = b(""), k = b(""), f = b([]), y = b(0), j = b(""), P = b("read"), B = b(!1), M = b({});
    function I(i) {
      return String((i.metadata || {}).contextual_prefix || "");
    }
    const N = w(() => t.node.metadata || {}), D = w(() => N.value.status === "failed"), Z = w(() => typeof N.value.error == "string" ? N.value.error.trim() : ""), ee = w(() => N.value.source_url), X = w(() => k.value || t.node.content_type || "text/markdown"), ae = w(() => String(N.value.original_mime_type || N.value.source_mime || "")), R = w(() => Pe(N.value) ? Be(ae.value || t.node.content_type || "") : !1), q = w(() => `/api/v1/kb10/${t.kbId}/nodes/${t.node.id}/source`), W = w(() => String(N.value.filename || N.value.original_filename || "")), G = w(() => $.value ? $.value : f.value.map((i) => i.content).filter(Boolean).join(`

`)), oe = w(() => {
      const i = G.value.trim();
      return i ? i.split(/\s+/).length : 0;
    });
    function ce() {
      R.value && (B.value = !B.value);
    }
    const A = b(null), S = b(!1), z = b(!1);
    function J() {
      const i = A.value;
      if (!i) {
        z.value = !1;
        return;
      }
      z.value = i.scrollHeight - qt > 24;
    }
    let C = null;
    function E() {
      C?.disconnect();
      const i = A.value;
      i && (C = new ResizeObserver(() => J()), C.observe(i), ke(J));
    }
    const V = w(() => z.value && !S.value);
    let L = 0;
    async function Q() {
      if (!t.kbId || !t.node?.id) return;
      const i = ++L;
      _.value = !0, v.value = "", $.value = "", k.value = "", f.value = [], y.value = 0, j.value = "", P.value = "read", M.value = {}, S.value = !1, z.value = !1;
      try {
        const [{ data: a }, { data: s }, { data: F }] = await Promise.all([
          de.get(`/api/v1/kb10/${t.kbId}/browse?node_id=${t.node.id}`),
          de.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=chunk&include_content=true&limit=200`),
          de.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (i !== L) return;
        if (a?.success && a.node && ($.value = String(a.node.content || ""), k.value = String(a.node.content_type || "")), s?.success) {
          if (!Number.isInteger(s.total) || s.total < 0) throw new Error("Invalid chunk total");
          y.value = s.total;
          const U = s.nodes;
          if (f.value = U.filter((ie) => ie.node_type === "chunk").sort((ie, ve) => Number((ie.metadata || {}).index ?? (ie.metadata || {}).chunk_index ?? 0) - Number((ve.metadata || {}).index ?? (ve.metadata || {}).chunk_index ?? 0)), !F?.success) throw new Error(F?.error || "could not load summary");
          j.value = F.nodes[0]?.content || "", $.value || ($.value = j.value || t.node.content || "");
        }
        !a?.success && !s?.success && (v.value = a?.error || s?.error || "could not load document");
      } catch (a) {
        if (i !== L) return;
        v.value = a?.response?.data?.error || a?.message || "could not load document", he.handleError(a?.response?.status === 401 ? "auth-expired" : "other", a);
      } finally {
        i === L && (_.value = !1);
      }
    }
    const l = w(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: y.value || void 0 }
    ]);
    function u(i) {
      M.value = { ...M.value, [i.id]: !M.value[i.id] };
    }
    return ne([G, P, _], () => {
      P.value === "read" && !_.value && ke(E);
    }), ne(R, (i) => {
      i || (B.value = !1);
    }), ne(() => t.node?.id, () => Q(), { immediate: !0 }), me(() => {
      C?.disconnect();
    }), (i, a) => (o(), c("div", ct, [
      d("header", vt, [
        d("span", ft, [
          p(e(O), {
            icon: e(Ce)(n.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        d("div", mt, [
          d("div", pt, [
            d("h2", ht, g(e(re)(n.node)), 1),
            R.value ? (o(), Y(e(qe), {
              key: 0,
              class: ue(["dr-orig-btn", { on: B.value }]),
              label: B.value ? "Hide original" : "View original",
              onOpen: ce
            }, null, 8, ["class", "label"])) : x("", !0)
          ]),
          d("div", kt, [
            y.value ? (o(), c("span", bt, [
              p(e(O), { icon: "tabler:layout-grid" }),
              T(g(y.value.toLocaleString()) + " chunks", 1)
            ])) : x("", !0),
            oe.value ? (o(), c("span", gt, [
              p(e(O), { icon: "tabler:align-left" }),
              T(g(oe.value.toLocaleString()) + " words", 1)
            ])) : x("", !0),
            n.node.created_at ? (o(), c("span", {
              key: 2,
              class: "dr-fact",
              title: e(We)(n.node.created_at)
            }, [
              p(e(O), { icon: "tabler:clock" }),
              T(g(e(Te)(n.node.created_at)), 1)
            ], 8, yt)) : x("", !0),
            ee.value ? (o(), c("a", {
              key: 3,
              class: "dr-fact link",
              href: ee.value,
              target: "_blank",
              rel: "noopener"
            }, [
              p(e(O), { icon: "tabler:external-link" }),
              a[3] || (a[3] = T("Source", -1))
            ], 8, _t)) : x("", !0)
          ])
        ])
      ]),
      D.value ? (o(), c("div", xt, [
        p(e(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        d("span", null, [
          a[4] || (a[4] = T("Indexing failed", -1)),
          Z.value ? (o(), c("span", wt, ": " + g(Z.value), 1)) : x("", !0)
        ])
      ])) : x("", !0),
      p(e($e), {
        tabs: l.value,
        active: P.value,
        onSelect: a[0] || (a[0] = (s) => P.value = s)
      }, null, 8, ["tabs", "active"]),
      _.value ? (o(), c("div", $t, [
        (o(), c(te, null, fe(6, (s) => d("div", {
          key: s,
          class: "dr-skel-line"
        })), 64))
      ])) : v.value ? (o(), c("div", Ct, [
        p(e(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        T(" " + g(v.value), 1)
      ])) : (o(), c(te, { key: 3 }, [
        P.value === "read" ? (o(), c("div", Tt, [
          d("div", Nt, [
            j.value ? (o(), Y(e(Ve), {
              key: 0,
              text: j.value
            }, null, 8, ["text"])) : x("", !0),
            G.value ? (o(), c("div", {
              key: 1,
              class: ue(["dr-clamp", { clamped: V.value }])
            }, [
              d("div", {
                ref_key: "bodyRef",
                ref: A,
                class: "dr-clamp-inner"
              }, [
                d("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": X.value,
                  source: G.value,
                  filename: W.value
                }, null, 8, St)
              ], 512),
              V.value ? (o(), c("div", Et)) : x("", !0)
            ], 2)) : x("", !0),
            z.value ? (o(), c("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": S.value,
              onClick: a[1] || (a[1] = (s) => S.value = !S.value)
            }, [
              p(e(O), {
                icon: S.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              T(" " + g(S.value ? "Show less" : "Show more"), 1)
            ], 8, Dt)) : x("", !0),
            !G.value && !D.value ? (o(), c("div", It, [
              p(e(O), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              a[5] || (a[5] = T(" No readable content was indexed for this document.", -1))
            ])) : x("", !0)
          ])
        ])) : (o(), c("div", Lt, [
          f.value.length ? x("", !0) : (o(), c("div", Mt, [
            p(e(O), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            a[6] || (a[6] = T(" This document has no chunks.", -1))
          ])),
          (o(!0), c(te, null, fe(f.value, (s, F) => (o(), c("div", {
            key: s.id,
            class: ue(["dr-chunk", { open: M.value[s.id] }])
          }, [
            d("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!M.value[s.id],
              onClick: (U) => u(s)
            }, [
              d("span", Ot, g(F + 1), 1),
              d("span", Pt, "Chunk " + g(F + 1), 1),
              p(e(O), {
                class: "dr-chunk-chev",
                icon: M.value[s.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Rt),
            I(s) ? (o(), c("p", Bt, [
              p(e(O), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              d("span", null, g(I(s)), 1)
            ])) : x("", !0),
            d("p", {
              class: ue(["dr-chunk-body", { clamp: !M.value[s.id] }])
            }, g(s.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      p(e(je), {
        contained: "",
        open: B.value && R.value,
        title: W.value || "Original",
        "content-type": ae.value || n.node.content_type || "",
        "source-url": q.value,
        filename: W.value,
        onClose: a[2] || (a[2] = (s) => B.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), jt = { class: "kb-page kd" }, Ut = { class: "kd-filter" }, Xt = ["aria-label"], zt = {
  key: 0,
  class: "kd-list-skel"
}, Ft = ["disabled", "onClick"], Kt = { class: "kd-row-ic" }, At = { class: "kd-row-main" }, Ht = { class: "kd-row-title" }, Wt = { class: "kd-row-sub" }, Gt = {
  key: 1,
  class: "kd-list-empty"
}, Jt = {
  key: 0,
  class: "kd-pager"
}, Qt = { class: "kd-pager-label" }, Yt = { class: "kx-main-scroll kd-reader" }, Zt = /* @__PURE__ */ pe({
  __name: "KbDocument",
  setup(n) {
    const t = Ie(), _ = Le(), v = w(() => t.value.config?.kb_id || ""), $ = w(() => t.value.config?.route || "");
    let k = "", f = !1;
    const y = b("documents"), j = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], P = w(() => y.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: B,
      notice: M,
      indexingNotice: I,
      documents: N,
      deleting: D,
      scheduleRefresh: Z,
      remove: ee,
      findDoc: X,
      page: ae,
      pageSize: R,
      total: q,
      hasPrev: W,
      hasNext: G,
      next: oe,
      prev: ce
    } = Je(() => v.value, { includeIndexing: !0, scope: () => y.value }), A = b(""), S = w(() => {
      const h = A.value.trim().toLowerCase();
      return h ? N.value.filter((r) => re(r).toLowerCase().includes(h)) : N.value;
    }), z = w(() => q.value === 0 ? 0 : ae.value * R.value + 1), J = w(() => Math.min((ae.value + 1) * R.value, q.value)), C = b(""), E = b(null), V = w(() => D.value[C.value] ? null : X(C.value) || (E.value?.id === C.value ? E.value : null));
    let L = 0;
    const Q = b(!1), l = b(!1), u = b(null), i = w(() => !!u.value && !!D.value[u.value.id]);
    function a(h) {
      if (D.value[h.id]) return;
      const r = C.value !== h.id;
      C.value = h.id, r && !f && (k = h.id, _("navigate", h.id));
    }
    function s(h) {
      const r = X(h);
      r && (a(r), l.value = !1);
    }
    function F(h) {
      h !== y.value && (L++, l.value = !1, C.value = "", E.value = null, A.value = "", y.value = h === "failures" ? "failures" : "documents");
    }
    function U(h) {
      u.value = h;
    }
    async function ie() {
      const h = u.value;
      if (!h) return;
      await ee(h) && (C.value === h.id && (C.value = ""), E.value?.id === h.id && (E.value = null), k === h.id && (L++, k = "", _("navigate", "")), u.value = null);
    }
    function ve(h) {
      h.key === "Escape" && l.value && (l.value = !1);
    }
    return Ee(() => {
      window.addEventListener("keydown", ve), De("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), me(() => {
      L++, window.removeEventListener("keydown", ve);
    }), ne(N, (h) => {
      if (E.value && X(E.value.id) && (E.value = null), V.value) return;
      const r = h.filter((le) => !D.value[le.id]), K = r.find((le) => le.id === k) || r[0];
      if (K) {
        f = !0;
        try {
          a(K);
        } finally {
          f = !1;
        }
      } else X(C.value) || (C.value = "");
    }), ne(v, () => {
      C.value = "";
    }), ne([v, $], async ([h, r]) => {
      k = r;
      const m = ++L;
      if (E.value?.id !== r && (E.value = null), !h || !r || r === C.value) return;
      let K = X(r);
      if (!K)
        try {
          const { data: le } = await de.get(`/api/v1/kb10/${h}/browse?node_id=${encodeURIComponent(r)}`);
          if (m !== L || le?.node?.node_type !== "document" || le.node.parent_id) return;
          K = le.node;
        } catch {
          return;
        }
      F(K.metadata?.status === "failed" ? "failures" : "documents"), E.value = X(K.id) ? null : K, f = !0;
      try {
        a(K);
      } finally {
        f = !1;
      }
    }, { immediate: !0 }), (h, r) => (o(), c("div", jt, [
      e(M) ? (o(), Y(e(ye), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          T(g(e(M)), 1)
        ]),
        _: 1
      })) : x("", !0),
      e(I) ? (o(), Y(e(ye), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: H(() => [
          T(g(e(I)), 1)
        ]),
        _: 1
      })) : x("", !0),
      p(e(Ue), null, {
        rail: H(() => [
          p(e(tt), {
            title: P.value,
            count: e(q)
          }, {
            actions: H(() => [
              y.value === "documents" ? (o(), Y(e(se), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: l.value,
                onClick: r[0] || (r[0] = (m) => l.value = !l.value)
              }, null, 8, ["active"])) : x("", !0),
              p(e(se), {
                icon: "tabler:plus",
                label: "Add document",
                active: Q.value,
                onClick: r[1] || (r[1] = (m) => Q.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          p(e($e), {
            tabs: j,
            active: y.value,
            onSelect: F
          }, null, 8, ["active"]),
          d("div", Ut, [
            p(e(Fe), {
              modelValue: A.value,
              "onUpdate:modelValue": r[2] || (r[2] = (m) => A.value = m),
              placeholder: y.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          d("nav", {
            class: "kd-list",
            "aria-label": P.value
          }, [
            e(B) && !e(N).length ? (o(), c("div", zt, [
              (o(), c(te, null, fe(6, (m) => d("div", {
                key: m,
                class: "kd-skel-row"
              })), 64))
            ])) : x("", !0),
            (o(!0), c(te, null, fe(S.value, (m) => (o(), c("div", {
              key: m.id,
              class: ue(["kd-row", { on: C.value === m.id }])
            }, [
              d("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(D)[m.id],
                onClick: (K) => a(m)
              }, [
                d("span", Kt, [
                  p(e(O), {
                    icon: e(Ce)(m),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                d("span", At, [
                  d("span", Ht, g(e(re)(m)), 1),
                  d("span", Wt, [
                    T(g(e(He)(m)), 1),
                    m.created_at ? (o(), c(te, { key: 0 }, [
                      T(" · " + g(e(Te)(m.created_at)), 1)
                    ], 64)) : x("", !0)
                  ])
                ])
              ], 8, Ft),
              p(e(se), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(re)(m)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(D)[m.id],
                disabled: !!e(D)[m.id],
                onClick: (K) => U(m)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(B) && !S.value.length ? (o(), c("div", Gt, [
              y.value === "failures" ? (o(), c(te, { key: 0 }, [
                T(g(e(N).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : (o(), c(te, { key: 1 }, [
                T(g(e(N).length ? "No documents match." : "No documents yet — add one with +."), 1)
              ], 64))
            ])) : x("", !0)
          ], 8, Xt),
          e(q) > e(R) ? (o(), c("div", Jt, [
            p(e(se), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(W),
              onClick: e(ce)
            }, null, 8, ["disabled", "onClick"]),
            d("span", Qt, g(z.value) + "–" + g(J.value) + " of " + g(e(q)), 1),
            p(e(se), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(G),
              onClick: e(oe)
            }, null, 8, ["disabled", "onClick"])
          ])) : x("", !0)
        ]),
        default: H(() => [
          d("div", Yt, [
            l.value ? (o(), Y(e(Xe), {
              key: 0,
              "kb-id": v.value,
              layout: "panel",
              ask: "",
              onOpen: r[3] || (r[3] = (m) => m.parent_id && s(m.parent_id)),
              onClose: r[4] || (r[4] = (m) => l.value = !1)
            }, null, 8, ["kb-id"])) : V.value ? (o(), Y(Vt, {
              key: 1,
              "kb-id": v.value,
              node: V.value
            }, null, 8, ["kb-id", "node"])) : (o(), Y(ze, {
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
      p(e(Ke), {
        open: Q.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: r[6] || (r[6] = (m) => Q.value = !1)
      }, {
        default: H(() => [
          p(Ae, {
            "kb-id": v.value,
            noun: "document",
            onChanged: r[5] || (r[5] = (m) => {
              m && (Q.value = !1), e(Z)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      p(e(dt), {
        open: !!u.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: u.value ? e(re)(u.value) : "",
        "confirm-label": "Delete",
        busy: i.value,
        onCancel: r[7] || (r[7] = (m) => u.value = null),
        onConfirm: ie
      }, {
        default: H(() => [
          r[8] || (r[8] = T(" Remove ", -1)),
          d("strong", null, g(u.value ? e(re)(u.value) : ""), 1),
          r[9] || (r[9] = T(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), sn = {
  rootComponent: Zt
};
export {
  sn as mountConfig
};
