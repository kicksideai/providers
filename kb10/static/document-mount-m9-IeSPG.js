import { ref as m, computed as _, onBeforeUnmount as ie, watch as F, defineComponent as re, openBlock as r, createElementBlock as v, createElementVNode as d, createTextVNode as S, toDisplayString as b, createCommentVNode as C, renderSlot as ke, createBlock as Q, Transition as ge, withCtx as H, withModifiers as _e, normalizeClass as te, createVNode as f, unref as a, nextTick as ce, Fragment as ne, renderList as se, onMounted as we } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as ae, host as ue, loadByTagName as xe } from "@wippy-fe/proxy";
import { a as $e, u as Ce } from "./wc-runtime-CNDpK4lj.js";
import { c as Ee, E as ve, i as fe, s as Se, a as me, _ as Z, u as Te, b as De, n as ee, d as Ne, e as Le, f as Me, g as Ie, h as Oe, j as Pe, k as Be, l as Re, m as je, o as Ve, p as Xe } from "./AddPanel.vue_vue_type_script_setup_true_lang-Dq6kbAZP.js";
import { _ as he, c as Ue } from "./queryMode-B1MoVAIk.js";
const pe = {
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
function qe(i) {
  const s = i.content_type || "";
  if (pe[s]) return pe[s];
  const y = i.metadata || {}, u = String(y.filename || y.source_url || y.title || ""), k = u.lastIndexOf(".");
  if (k > 0 && k < u.length - 1) {
    const c = u.slice(k + 1).split(/[?#]/)[0];
    if (c.length <= 5) return c.toUpperCase();
  }
  return y.source_url ? "URL" : s.startsWith("image/") ? "IMG" : "DOC";
}
function be(i) {
  const s = i.content_type || "";
  return (i.metadata || {}).source_url ? "tabler:world" : s === "application/pdf" ? "tabler:file-type-pdf" : s === "text/markdown" ? "tabler:markdown" : s === "text/csv" || s.includes("spreadsheet") || s.includes("excel") ? "tabler:table" : s === "application/json" ? "tabler:json" : s.includes("word") || s.includes("document") ? "tabler:file-text" : s.includes("presentation") || s.includes("powerpoint") ? "tabler:presentation" : s === "text/html" ? "tabler:file-code" : s.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function ye(i) {
  if (!i) return "";
  const s = new Date(i), y = s.getTime();
  if (Number.isNaN(y)) return "";
  const u = Date.now() - y, k = Math.round(u / 1e3);
  if (k < 45) return "just now";
  const c = Math.round(k / 60);
  if (c < 60) return `${c}m ago`;
  const h = Math.round(c / 60);
  if (h < 24) return `${h}h ago`;
  const w = Math.round(h / 24);
  return w < 7 ? `${w}d ago` : s.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function ze(i) {
  if (!i) return "";
  const s = new Date(i);
  return Number.isNaN(s.getTime()) ? "" : s.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ae(i, s = {}) {
  const y = m(!1), u = m(""), k = m([]), c = m(0), h = m(50), w = m(0), T = _(() => Math.max(1, Math.ceil(w.value / h.value))), L = _(() => c.value > 0), P = _(() => c.value < T.value - 1), x = m({}), E = m({}), B = 2e4, N = /* @__PURE__ */ new Map();
  function V(e) {
    const o = { ...x.value };
    delete o[e], x.value = o;
    const n = { ...E.value };
    delete n[e], E.value = n;
    const t = N.get(e);
    t && (clearTimeout(t), N.delete(e));
  }
  const Y = /* @__PURE__ */ new Set(["concept", "edge", "chunk", "summary"]);
  function U(e) {
    return Date.parse(e.updated_at || e.created_at || "") || 0;
  }
  function le(e) {
    const o = /* @__PURE__ */ new Map(), n = [];
    for (const t of e) {
      const l = Ee(t);
      if (!l) {
        n.push(t);
        continue;
      }
      const I = o.get(l);
      if (I === void 0) {
        o.set(l, n.length), n.push(t);
        continue;
      }
      U(t) >= U(n[I]) && (n[I] = t);
    }
    return n;
  }
  const q = _(() => le(k.value.filter((e) => !Y.has(e.node_type || ""))));
  function R(e) {
    return q.value.find((o) => o.id === e);
  }
  let j = 0;
  async function z() {
    const e = i();
    if (!e) return;
    const o = ++j;
    y.value = !0, u.value = "";
    try {
      const n = c.value * h.value, { data: t } = await ae.get(`/api/v1/kb10/${e}/browse?limit=${h.value}&offset=${n}`);
      if (o !== j || i() !== e) return;
      if (!t?.success) {
        u.value = t?.error && fe(t.error) ? ve : t?.error || "";
        return;
      }
      k.value = t.nodes || [], w.value = Number(t.total) || 0;
    } catch (n) {
      if (o !== j) return;
      const t = n?.response?.data?.error || n?.message || "could not load contents";
      u.value = fe(t) ? ve : t, ue.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
    } finally {
      o === j && (y.value = !1);
    }
  }
  function A(e) {
    const o = Math.max(0, Math.min(e, T.value - 1));
    o !== c.value && (c.value = o, z());
  }
  function g() {
    P.value && A(c.value + 1);
  }
  function X() {
    L.value && A(c.value - 1);
  }
  async function K(e) {
    const o = i();
    if (!o || x.value[e.id]) return !1;
    const n = me(e);
    if (!n)
      return u.value = "This document has no durable source identity and cannot be deleted here.", !1;
    x.value = { ...x.value, [e.id]: !0 }, E.value = { ...E.value, [e.id]: String(n.external_id || "") };
    let t = !1;
    try {
      const { data: l } = await ae.delete(`/api/v1/knowledge/${o}/content`, { data: n });
      l?.success ? (t = !0, u.value = "Delete queued. The row clears once indexing catches up.") : u.value = l?.error || "could not queue delete";
    } catch (l) {
      u.value = l?.response?.data?.error || l?.message || "could not queue delete", ue.handleError(l?.response?.status === 401 ? "auth-expired" : "other", l);
    } finally {
      if (!t)
        V(e.id);
      else {
        const l = e.id;
        N.set(l, setTimeout(() => {
          x.value[l] && (V(l), u.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, B));
      }
    }
    return t;
  }
  function W(e) {
    return String(me(e)?.external_id || "");
  }
  function G() {
    if (Object.keys(E.value).length === 0) return;
    const e = new Set(q.value.map(W).filter(Boolean)), o = { ...x.value }, n = { ...E.value };
    let t = !1;
    for (const [l, I] of Object.entries(E.value))
      if (I && !e.has(I)) {
        delete o[l], delete n[l];
        const de = N.get(l);
        de && (clearTimeout(de), N.delete(l)), t = !0;
      }
    t && (x.value = o, E.value = n, Object.keys(o).length || (u.value = ""), s.onChanged?.());
  }
  let D = !1, $ = !1;
  async function oe() {
    if (D) {
      $ = !0;
      return;
    }
    D = !0;
    try {
      do
        $ = !1, await z(), G();
      while ($);
    } finally {
      D = !1;
    }
  }
  let M = null, J = 0;
  function p(e) {
    const o = ++J;
    if (M && (M(), M = null), !e) return;
    const n = Se(e, () => {
      oe();
    });
    if (o !== J) {
      n && n();
      return;
    }
    M = n;
  }
  return ie(() => {
    J++, j++, M && M(), N.forEach((e) => clearTimeout(e)), N.clear();
  }), F(i, (e) => {
    c.value = 0, w.value = 0, z(), p(e);
  }, { immediate: !0 }), {
    loading: y,
    notice: u,
    nodes: k,
    documents: q,
    deleting: x,
    load: z,
    reload: z,
    remove: K,
    findDoc: R,
    page: c,
    pageSize: h,
    total: w,
    pageCount: T,
    hasPrev: L,
    hasNext: P,
    next: g,
    prev: X,
    goToPage: A
  };
}
const Ke = { class: "kx-railhead" }, Ge = { class: "kx-railhead-title" }, He = { key: 0 }, Fe = { class: "kx-railhead-acts" }, We = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(i) {
    return (s, y) => (r(), v("div", Ke, [
      d("span", Ge, [
        S(b(i.title), 1),
        i.count !== void 0 ? (r(), v("b", He, b(i.count), 1)) : C("", !0)
      ]),
      d("div", Fe, [
        ke(s.$slots, "actions")
      ])
    ]));
  }
}), Je = ["aria-label"], Qe = { class: "kx-modal-h" }, Ye = { class: "kx-modal-h-ico" }, Ze = { class: "kx-modal-h-text" }, et = { class: "kx-modal-h-title" }, tt = {
  key: 0,
  class: "kx-modal-h-sub"
}, nt = { class: "kx-modal-body" }, at = { class: "kx-modal-foot" }, lt = /* @__PURE__ */ re({
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
  setup(i, { emit: s }) {
    const y = i, u = s;
    function k(c) {
      c.key === "Escape" && !y.busy && u("cancel");
    }
    return F(() => y.open, (c) => {
      c ? window.addEventListener("keydown", k) : window.removeEventListener("keydown", k);
    }), ie(() => window.removeEventListener("keydown", k)), (c, h) => (r(), Q(ge, { name: "kx-modal" }, {
      default: H(() => [
        i.open ? (r(), v("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: h[3] || (h[3] = _e((w) => !i.busy && u("cancel"), ["self"]))
        }, [
          d("div", {
            class: te(["kx-modal", { danger: i.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": i.title
          }, [
            d("div", Qe, [
              d("span", Ye, [
                f(a(O), {
                  icon: i.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", Ze, [
                d("span", et, b(i.title), 1),
                i.subtitle ? (r(), v("span", tt, b(i.subtitle), 1)) : C("", !0)
              ]),
              f(Z, {
                icon: "tabler:x",
                label: "Close",
                disabled: i.busy,
                onClick: h[0] || (h[0] = (w) => u("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", nt, [
              ke(c.$slots, "default")
            ]),
            d("div", at, [
              f(he, {
                variant: "ghost",
                disabled: i.busy,
                onClick: h[1] || (h[1] = (w) => u("cancel"))
              }, {
                default: H(() => [
                  S(b(i.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(he, {
                variant: i.danger ? "danger" : "primary",
                loading: i.busy,
                disabled: i.busy,
                onClick: h[2] || (h[2] = (w) => u("confirm"))
              }, {
                default: H(() => [
                  S(b(i.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, Je)
        ])) : C("", !0)
      ]),
      _: 3
    }));
  }
}), ot = { class: "dr" }, st = { class: "dr-head" }, it = { class: "dr-badge" }, rt = { class: "dr-head-body" }, ut = { class: "dr-head-top" }, dt = { class: "dr-title" }, ct = { class: "dr-facts" }, vt = {
  key: 0,
  class: "dr-fact"
}, ft = {
  key: 1,
  class: "dr-fact"
}, mt = ["title"], ht = ["href"], pt = {
  key: 0,
  class: "dr-skel"
}, kt = {
  key: 1,
  class: "dr-state err"
}, bt = {
  key: 0,
  class: "dr-doc"
}, yt = { class: "dr-doc-main" }, gt = ["content-type", "source", "filename"], _t = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, wt = ["aria-expanded"], xt = {
  key: 3,
  class: "dr-state"
}, $t = {
  key: 1,
  class: "dr-chunks"
}, Ct = {
  key: 0,
  class: "dr-state"
}, Et = ["aria-expanded", "onClick"], St = { class: "dr-chunk-n" }, Tt = { class: "dr-chunk-label" }, Dt = {
  key: 0,
  class: "dr-chunk-cx"
}, Nt = 720, Lt = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(i) {
    const s = i, y = m(!1), u = m(""), k = m(""), c = m(""), h = m([]), w = m(0), T = m(""), L = m("read"), P = m(!1), x = m({});
    function E(p) {
      return String((p.metadata || {}).contextual_prefix || "");
    }
    const B = _(() => s.node.metadata || {}), N = _(() => B.value.source_url), V = _(() => c.value || s.node.content_type || "text/markdown"), Y = _(() => String(B.value.original_mime_type || B.value.source_mime || "")), U = _(() => Te(B.value) ? De(Y.value || s.node.content_type || "") : !1), le = _(() => `/api/v1/kb10/${s.kbId}/nodes/${s.node.id}/source`), q = _(() => String(B.value.filename || B.value.original_filename || "")), R = _(() => k.value ? k.value : h.value.map((p) => p.content).filter(Boolean).join(`

`)), j = _(() => {
      const p = R.value.trim();
      return p ? p.split(/\s+/).length : 0;
    });
    function z() {
      U.value && (P.value = !P.value);
    }
    const A = m(null), g = m(!1), X = m(!1);
    function K() {
      const p = A.value;
      if (!p) {
        X.value = !1;
        return;
      }
      X.value = p.scrollHeight - Nt > 24;
    }
    let W = null;
    function G() {
      W?.disconnect();
      const p = A.value;
      p && (W = new ResizeObserver(() => K()), W.observe(p), ce(K));
    }
    const D = _(() => X.value && !g.value);
    let $ = 0;
    async function oe() {
      if (!s.kbId || !s.node?.id) return;
      const p = ++$;
      y.value = !0, u.value = "", k.value = "", c.value = "", h.value = [], w.value = 0, T.value = "", L.value = "read", x.value = {}, g.value = !1, X.value = !1;
      try {
        const [{ data: e }, { data: o }, { data: n }] = await Promise.all([
          ae.get(`/api/v1/kb10/${s.kbId}/browse?node_id=${s.node.id}`),
          ae.get(`/api/v1/kb10/${s.kbId}/browse?parent_id=${s.node.id}&node_type=chunk&include_content=true&limit=200`),
          ae.get(`/api/v1/kb10/${s.kbId}/browse?parent_id=${s.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (p !== $) return;
        if (e?.success && e.node && (k.value = String(e.node.content || ""), c.value = String(e.node.content_type || "")), o?.success) {
          if (!Number.isInteger(o.total) || o.total < 0) throw new Error("Invalid chunk total");
          w.value = o.total;
          const t = o.nodes;
          if (h.value = t.filter((l) => l.node_type === "chunk").sort((l, I) => Number((l.metadata || {}).index ?? (l.metadata || {}).chunk_index ?? 0) - Number((I.metadata || {}).index ?? (I.metadata || {}).chunk_index ?? 0)), !n?.success) throw new Error(n?.error || "could not load summary");
          T.value = n.nodes[0]?.content || "", k.value || (k.value = T.value || s.node.content || "");
        }
        !e?.success && !o?.success && (u.value = e?.error || o?.error || "could not load document");
      } catch (e) {
        if (p !== $) return;
        u.value = e?.response?.data?.error || e?.message || "could not load document", ue.handleError(e?.response?.status === 401 ? "auth-expired" : "other", e);
      } finally {
        p === $ && (y.value = !1);
      }
    }
    const M = _(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: w.value || void 0 }
    ]);
    function J(p) {
      x.value = { ...x.value, [p.id]: !x.value[p.id] };
    }
    return F([R, L, y], () => {
      L.value === "read" && !y.value && ce(G);
    }), F(U, (p) => {
      p || (P.value = !1);
    }), F(() => s.node?.id, () => oe(), { immediate: !0 }), ie(() => {
      W?.disconnect();
    }), (p, e) => (r(), v("div", ot, [
      d("header", st, [
        d("span", it, [
          f(a(O), {
            icon: a(be)(i.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        d("div", rt, [
          d("div", ut, [
            d("h2", dt, b(a(ee)(i.node)), 1),
            U.value ? (r(), Q(a(Ne), {
              key: 0,
              class: te(["dr-orig-btn", { on: P.value }]),
              label: P.value ? "Hide original" : "View original",
              onOpen: z
            }, null, 8, ["class", "label"])) : C("", !0)
          ]),
          d("div", ct, [
            w.value ? (r(), v("span", vt, [
              f(a(O), { icon: "tabler:layout-grid" }),
              S(b(w.value.toLocaleString()) + " chunks", 1)
            ])) : C("", !0),
            j.value ? (r(), v("span", ft, [
              f(a(O), { icon: "tabler:align-left" }),
              S(b(j.value.toLocaleString()) + " words", 1)
            ])) : C("", !0),
            i.node.created_at ? (r(), v("span", {
              key: 2,
              class: "dr-fact",
              title: a(ze)(i.node.created_at)
            }, [
              f(a(O), { icon: "tabler:clock" }),
              S(b(a(ye)(i.node.created_at)), 1)
            ], 8, mt)) : C("", !0),
            N.value ? (r(), v("a", {
              key: 3,
              class: "dr-fact link",
              href: N.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(a(O), { icon: "tabler:external-link" }),
              e[3] || (e[3] = S("Source", -1))
            ], 8, ht)) : C("", !0)
          ])
        ])
      ]),
      f(a(Le), {
        tabs: M.value,
        active: L.value,
        onSelect: e[0] || (e[0] = (o) => L.value = o)
      }, null, 8, ["tabs", "active"]),
      y.value ? (r(), v("div", pt, [
        (r(), v(ne, null, se(6, (o) => d("div", {
          key: o,
          class: "dr-skel-line"
        })), 64))
      ])) : u.value ? (r(), v("div", kt, [
        f(a(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        S(" " + b(u.value), 1)
      ])) : (r(), v(ne, { key: 2 }, [
        L.value === "read" ? (r(), v("div", bt, [
          d("div", yt, [
            T.value ? (r(), Q(a(Me), {
              key: 0,
              text: T.value
            }, null, 8, ["text"])) : C("", !0),
            R.value ? (r(), v("div", {
              key: 1,
              class: te(["dr-clamp", { clamped: D.value }])
            }, [
              d("div", {
                ref_key: "bodyRef",
                ref: A,
                class: "dr-clamp-inner"
              }, [
                d("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": V.value,
                  source: R.value,
                  filename: q.value
                }, null, 8, gt)
              ], 512),
              D.value ? (r(), v("div", _t)) : C("", !0)
            ], 2)) : C("", !0),
            X.value ? (r(), v("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": g.value,
              onClick: e[1] || (e[1] = (o) => g.value = !g.value)
            }, [
              f(a(O), {
                icon: g.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              S(" " + b(g.value ? "Show less" : "Show more"), 1)
            ], 8, wt)) : C("", !0),
            R.value ? C("", !0) : (r(), v("div", xt, [
              f(a(O), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              e[4] || (e[4] = S(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (r(), v("div", $t, [
          h.value.length ? C("", !0) : (r(), v("div", Ct, [
            f(a(O), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = S(" This document has no chunks.", -1))
          ])),
          (r(!0), v(ne, null, se(h.value, (o, n) => (r(), v("div", {
            key: o.id,
            class: te(["dr-chunk", { open: x.value[o.id] }])
          }, [
            d("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!x.value[o.id],
              onClick: (t) => J(o)
            }, [
              d("span", St, b(n + 1), 1),
              d("span", Tt, "Chunk " + b(n + 1), 1),
              f(a(O), {
                class: "dr-chunk-chev",
                icon: x.value[o.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Et),
            E(o) ? (r(), v("p", Dt, [
              f(a(O), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              d("span", null, b(E(o)), 1)
            ])) : C("", !0),
            d("p", {
              class: te(["dr-chunk-body", { clamp: !x.value[o.id] }])
            }, b(o.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(a(Ie), {
        contained: "",
        open: P.value && U.value,
        title: q.value || "Original",
        "content-type": Y.value || i.node.content_type || "",
        "source-url": le.value,
        filename: q.value,
        onClose: e[2] || (e[2] = (o) => P.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Mt = { class: "kb-page kd" }, It = { class: "kd-filter" }, Ot = {
  class: "kd-list",
  "aria-label": "Documents"
}, Pt = {
  key: 0,
  class: "kd-list-skel"
}, Bt = ["onClick"], Rt = { class: "kd-row-ic" }, jt = { class: "kd-row-main" }, Vt = { class: "kd-row-title" }, Xt = { class: "kd-row-sub" }, Ut = {
  key: 1,
  class: "kd-list-empty"
}, qt = {
  key: 0,
  class: "kd-pager"
}, zt = { class: "kd-pager-label" }, At = { class: "kx-main-scroll kd-reader" }, Kt = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(i) {
    const s = $e(), y = Ce(), u = _(() => s.value.config?.kb_id || ""), k = _(() => s.value.config?.route || "");
    let c = !1;
    const {
      loading: h,
      notice: w,
      documents: T,
      deleting: L,
      reload: P,
      remove: x,
      findDoc: E,
      page: B,
      pageSize: N,
      total: V,
      hasPrev: Y,
      hasNext: U,
      next: le,
      prev: q
    } = Ae(() => u.value), R = m(""), j = _(() => {
      const n = R.value.trim().toLowerCase();
      return n ? T.value.filter((t) => ee(t).toLowerCase().includes(n)) : T.value;
    }), z = _(() => V.value === 0 ? 0 : B.value * N.value + 1), A = _(() => Math.min((B.value + 1) * N.value, V.value)), g = m(""), X = _(() => E(g.value) || null), K = m(!1);
    async function W() {
      if (!u.value) {
        K.value = !1;
        return;
      }
      try {
        const { data: n } = await ae.get(`/api/v1/knowledge/${u.value}`), t = n?.config || {};
        K.value = Ue(t);
      } catch {
        K.value = !1;
      }
    }
    F(u, W, { immediate: !0 });
    const G = m(!1), D = m(!1), $ = m(null), oe = _(() => !!$.value && !!L.value[$.value.id]);
    function M(n) {
      const t = g.value !== n.id;
      g.value = n.id, t && !c && y("navigate", n.id);
    }
    function J(n) {
      const t = E(n);
      t && (M(t), D.value = !1);
    }
    function p(n) {
      $.value = n;
    }
    async function e() {
      const n = $.value;
      if (!n) return;
      await x(n) && (g.value === n.id && (g.value = ""), $.value = null);
    }
    function o(n) {
      n.key === "Escape" && D.value && (D.value = !1);
    }
    return we(() => {
      window.addEventListener("keydown", o), xe("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", o)), F(T, (n) => {
      if (!n.length) {
        g.value && !E(g.value) && (g.value = "");
        return;
      }
      if (g.value && E(g.value)) return;
      const l = (k.value ? n.find((I) => I.id === k.value) : null) || n[0];
      if (l) {
        c = !0;
        try {
          M(l);
        } finally {
          c = !1;
        }
      }
    }), F(u, () => {
      g.value = "";
    }), F(k, (n) => {
      if (!n || n === g.value) return;
      const t = E(n);
      if (t) {
        c = !0;
        try {
          M(t);
        } finally {
          c = !1;
        }
      }
    }), (n, t) => (r(), v("div", Mt, [
      a(w) ? (r(), Q(a(Oe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: H(() => [
          S(b(a(w)), 1)
        ]),
        _: 1
      })) : C("", !0),
      f(a(Pe), null, {
        rail: H(() => [
          f(a(We), {
            title: "Documents",
            count: a(V)
          }, {
            actions: H(() => [
              f(a(Z), {
                icon: "tabler:search",
                label: "Search",
                active: D.value,
                onClick: t[0] || (t[0] = (l) => D.value = !D.value)
              }, null, 8, ["active"]),
              f(a(Z), {
                icon: "tabler:plus",
                label: "Add document",
                active: G.value,
                onClick: t[1] || (t[1] = (l) => G.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          d("div", It, [
            f(a(je), {
              modelValue: R.value,
              "onUpdate:modelValue": t[2] || (t[2] = (l) => R.value = l),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          d("nav", Ot, [
            a(h) && !a(T).length ? (r(), v("div", Pt, [
              (r(), v(ne, null, se(6, (l) => d("div", {
                key: l,
                class: "kd-skel-row"
              })), 64))
            ])) : C("", !0),
            (r(!0), v(ne, null, se(j.value, (l) => (r(), v("button", {
              key: l.id,
              class: te(["kd-row", { on: g.value === l.id }]),
              onClick: (I) => M(l)
            }, [
              d("span", Rt, [
                f(a(O), {
                  icon: a(be)(l),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", jt, [
                d("span", Vt, b(a(ee)(l)), 1),
                d("span", Xt, [
                  S(b(a(qe)(l)), 1),
                  l.created_at ? (r(), v(ne, { key: 0 }, [
                    S(" · " + b(a(ye)(l.created_at)), 1)
                  ], 64)) : C("", !0)
                ])
              ]),
              f(a(Z), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${a(ee)(l)}`,
                variant: "danger",
                size: "sm",
                spin: !!a(L)[l.id],
                disabled: !!a(L)[l.id],
                onClick: (I) => p(l)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, Bt))), 128)),
            !a(h) && !j.value.length ? (r(), v("div", Ut, b(a(T).length ? "No documents match." : "No documents yet — add one with +."), 1)) : C("", !0)
          ]),
          a(V) > a(N) ? (r(), v("div", qt, [
            f(a(Z), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !a(Y),
              onClick: a(q)
            }, null, 8, ["disabled", "onClick"]),
            d("span", zt, b(z.value) + "–" + b(A.value) + " of " + b(a(V)), 1),
            f(a(Z), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !a(U),
              onClick: a(le)
            }, null, 8, ["disabled", "onClick"])
          ])) : C("", !0)
        ]),
        default: H(() => [
          d("div", At, [
            D.value ? (r(), Q(a(Be), {
              key: 0,
              "kb-id": u.value,
              layout: "panel",
              ask: K.value,
              onOpen: t[3] || (t[3] = (l) => l.parent_id && J(l.parent_id)),
              onClose: t[4] || (t[4] = (l) => D.value = !1)
            }, null, 8, ["kb-id", "ask"])) : X.value ? (r(), Q(Lt, {
              key: 1,
              "kb-id": u.value,
              node: X.value
            }, null, 8, ["kb-id", "node"])) : (r(), Q(Re, {
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
      f(a(Ve), {
        open: G.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: t[6] || (t[6] = (l) => G.value = !1)
      }, {
        default: H(() => [
          f(Xe, {
            "kb-id": u.value,
            noun: "document",
            onChanged: t[5] || (t[5] = (l) => {
              G.value = !1, a(P)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(a(lt), {
        open: !!$.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: $.value ? a(ee)($.value) : "",
        "confirm-label": "Delete",
        busy: oe.value,
        onCancel: t[7] || (t[7] = (l) => $.value = null),
        onConfirm: e
      }, {
        default: H(() => [
          t[8] || (t[8] = S(" Remove ", -1)),
          d("strong", null, b($.value ? a(ee)($.value) : ""), 1),
          t[9] || (t[9] = S(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Yt = {
  rootComponent: Kt
};
export {
  Yt as mountConfig
};
//# sourceMappingURL=document-mount-m9-IeSPG.js.map
