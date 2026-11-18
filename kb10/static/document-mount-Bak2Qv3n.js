import { ref as k, computed as x, onBeforeUnmount as re, watch as F, defineComponent as ue, openBlock as i, createElementBlock as m, createElementVNode as d, createTextVNode as T, toDisplayString as y, createCommentVNode as $, renderSlot as ye, createBlock as Y, Transition as we, withCtx as U, withModifiers as xe, normalizeClass as ae, createVNode as p, unref as t, nextTick as ve, Fragment as le, renderList as ie, onMounted as $e } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as oe, host as ce, loadByTagName as Ce } from "@wippy-fe/proxy";
import { a as Ee, u as Se } from "./wc-runtime-f54Bo-yJ.js";
import { c as Te, E as fe, i as me, s as De, a as he, _ as te, u as Me, b as Ne, n as ne, d as Le, e as Ie, f as Oe, g as Pe, h as Be, j as pe, k as Re, l as je, m as Ve, o as Xe, p as qe, q as Ke } from "./AddPanel.vue_vue_type_script_setup_true_lang-CXZFt2Ha.js";
import { _ as ke, c as Ue } from "./queryMode-B1MoVAIk.js";
const be = {
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
function ze(o) {
  const l = o.content_type || "";
  if (be[l]) return be[l];
  const _ = o.metadata || {}, r = String(_.filename || _.source_url || _.title || ""), g = r.lastIndexOf(".");
  if (g > 0 && g < r.length - 1) {
    const v = r.slice(g + 1).split(/[?#]/)[0];
    if (v.length <= 5) return v.toUpperCase();
  }
  return _.source_url ? "URL" : l.startsWith("image/") ? "IMG" : "DOC";
}
function ge(o) {
  const l = o.content_type || "";
  return (o.metadata || {}).source_url ? "tabler:world" : l === "application/pdf" ? "tabler:file-type-pdf" : l === "text/markdown" ? "tabler:markdown" : l === "text/csv" || l.includes("spreadsheet") || l.includes("excel") ? "tabler:table" : l === "application/json" ? "tabler:json" : l.includes("word") || l.includes("document") ? "tabler:file-text" : l.includes("presentation") || l.includes("powerpoint") ? "tabler:presentation" : l === "text/html" ? "tabler:file-code" : l.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function _e(o) {
  if (!o) return "";
  const l = new Date(o), _ = l.getTime();
  if (Number.isNaN(_)) return "";
  const r = Date.now() - _, g = Math.round(r / 1e3);
  if (g < 45) return "just now";
  const v = Math.round(g / 60);
  if (v < 60) return `${v}m ago`;
  const b = Math.round(v / 60);
  if (b < 24) return `${b}h ago`;
  const E = Math.round(b / 24);
  return E < 7 ? `${E}d ago` : l.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function Ae(o) {
  if (!o) return "";
  const l = new Date(o);
  return Number.isNaN(l.getTime()) ? "" : l.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ge(o, l = {}) {
  const _ = k(!1), r = k(""), g = k([]), v = k(0), b = k(50), E = k(0), P = x(() => Math.max(1, Math.ceil(E.value / b.value))), B = x(() => v.value > 0), D = x(() => v.value < P.value - 1), w = k({}), L = k({}), X = 2e4, M = /* @__PURE__ */ new Map();
  function Z(e) {
    const a = { ...w.value };
    delete a[e], w.value = a;
    const u = { ...L.value };
    delete u[e], L.value = u;
    const c = M.get(e);
    c && (clearTimeout(c), M.delete(e));
  }
  const W = /* @__PURE__ */ new Set(["concept", "edge", "chunk", "summary"]);
  function I(e) {
    return Date.parse(e.updated_at || e.created_at || "") || 0;
  }
  function se(e) {
    const a = /* @__PURE__ */ new Map(), u = [];
    for (const c of e) {
      const n = Te(c);
      if (!n) {
        u.push(c);
        continue;
      }
      const s = a.get(n);
      if (s === void 0) {
        a.set(n, u.length), u.push(c);
        continue;
      }
      I(c) >= I(u[s]) && (u[s] = c);
    }
    return u;
  }
  const z = x(() => se(g.value.filter((e) => !W.has(e.node_type || ""))));
  function A(e) {
    return z.value.find((a) => a.id === e);
  }
  let q = 0;
  async function j() {
    const e = o();
    if (!e) return;
    const a = ++q;
    _.value = !0, r.value = "";
    try {
      const u = v.value * b.value, { data: c } = await oe.get(`/api/v1/kb10/${e}/browse?limit=${b.value}&offset=${u}`);
      if (a !== q || o() !== e) return;
      if (!c?.success) {
        r.value = c?.error && me(c.error) ? fe : c?.error || "";
        return;
      }
      g.value = c.nodes || [], E.value = Number(c.total) || 0;
    } catch (u) {
      if (a !== q) return;
      const c = u?.response?.data?.error || u?.message || "could not load contents";
      r.value = me(c) ? fe : c, ce.handleError(u?.response?.status === 401 ? "auth-expired" : "other", u);
    } finally {
      a === q && (_.value = !1);
    }
  }
  function K(e) {
    const a = Math.max(0, Math.min(e, P.value - 1));
    a !== v.value && (v.value = a, j());
  }
  function V() {
    D.value && K(v.value + 1);
  }
  function G() {
    B.value && K(v.value - 1);
  }
  async function S(e) {
    const a = o();
    if (!a || w.value[e.id]) return !1;
    const u = he(e);
    if (!u)
      return r.value = "This document has no durable source identity and cannot be deleted here.", !1;
    w.value = { ...w.value, [e.id]: !0 }, L.value = { ...L.value, [e.id]: String(u.external_id || "") };
    let c = !1;
    try {
      const { data: n } = await oe.delete(`/api/v1/knowledge/${a}/content`, { data: u });
      n?.success ? (c = !0, r.value = "Delete queued. The row clears once indexing catches up.") : r.value = n?.error || "could not queue delete";
    } catch (n) {
      r.value = n?.response?.data?.error || n?.message || "could not queue delete", ce.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
    } finally {
      if (!c)
        Z(e.id);
      else {
        const n = e.id;
        M.set(n, setTimeout(() => {
          w.value[n] && (Z(n), r.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, X));
      }
    }
    return c;
  }
  function H(e) {
    return String(he(e)?.external_id || "");
  }
  function J() {
    if (Object.keys(L.value).length === 0) return;
    const e = new Set(z.value.map(H).filter(Boolean)), a = { ...w.value }, u = { ...L.value };
    let c = !1;
    for (const [n, s] of Object.entries(L.value))
      if (s && !e.has(s)) {
        delete a[n], delete u[n];
        const f = M.get(n);
        f && (clearTimeout(f), M.delete(n)), c = !0;
      }
    c && (w.value = a, L.value = u, Object.keys(a).length || (r.value = ""), l.onChanged?.());
  }
  let Q = !1, N = !1;
  async function R() {
    if (Q) {
      N = !0;
      return;
    }
    Q = !0;
    try {
      do
        N = !1, await j(), J();
      while (N);
    } finally {
      Q = !1;
    }
  }
  let C = null, ee = 0;
  function h(e) {
    const a = ++ee;
    if (C && (C(), C = null), !e) return;
    const u = De(e, (c) => {
      l.onMeta?.(c), R();
    });
    if (a !== ee) {
      u && u();
      return;
    }
    C = u;
  }
  return re(() => {
    ee++, q++, C && C(), M.forEach((e) => clearTimeout(e)), M.clear();
  }), F(o, (e) => {
    v.value = 0, E.value = 0, j(), h(e);
  }, { immediate: !0 }), {
    loading: _,
    notice: r,
    nodes: g,
    documents: z,
    deleting: w,
    load: j,
    reload: j,
    remove: S,
    findDoc: A,
    page: v,
    pageSize: b,
    total: E,
    pageCount: P,
    hasPrev: B,
    hasNext: D,
    next: V,
    prev: G,
    goToPage: K
  };
}
const He = { class: "kx-railhead" }, Fe = { class: "kx-railhead-title" }, We = { key: 0 }, Je = { class: "kx-railhead-acts" }, Qe = /* @__PURE__ */ ue({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(o) {
    return (l, _) => (i(), m("div", He, [
      d("span", Fe, [
        T(y(o.title), 1),
        o.count !== void 0 ? (i(), m("b", We, y(o.count), 1)) : $("", !0)
      ]),
      d("div", Je, [
        ye(l.$slots, "actions")
      ])
    ]));
  }
}), Ye = ["aria-label"], Ze = { class: "kx-modal-h" }, et = { class: "kx-modal-h-ico" }, tt = { class: "kx-modal-h-text" }, nt = { class: "kx-modal-h-title" }, at = {
  key: 0,
  class: "kx-modal-h-sub"
}, lt = { class: "kx-modal-body" }, ot = { class: "kx-modal-foot" }, st = /* @__PURE__ */ ue({
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
  setup(o, { emit: l }) {
    const _ = o, r = l;
    function g(v) {
      v.key === "Escape" && !_.busy && r("cancel");
    }
    return F(() => _.open, (v) => {
      v ? window.addEventListener("keydown", g) : window.removeEventListener("keydown", g);
    }), re(() => window.removeEventListener("keydown", g)), (v, b) => (i(), Y(we, { name: "kx-modal" }, {
      default: U(() => [
        o.open ? (i(), m("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: b[3] || (b[3] = xe((E) => !o.busy && r("cancel"), ["self"]))
        }, [
          d("div", {
            class: ae(["kx-modal", { danger: o.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": o.title
          }, [
            d("div", Ze, [
              d("span", et, [
                p(t(O), {
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", tt, [
                d("span", nt, y(o.title), 1),
                o.subtitle ? (i(), m("span", at, y(o.subtitle), 1)) : $("", !0)
              ]),
              p(te, {
                icon: "tabler:x",
                label: "Close",
                disabled: o.busy,
                onClick: b[0] || (b[0] = (E) => r("cancel"))
              }, null, 8, ["disabled"])
            ]),
            d("div", lt, [
              ye(v.$slots, "default")
            ]),
            d("div", ot, [
              p(ke, {
                variant: "ghost",
                disabled: o.busy,
                onClick: b[1] || (b[1] = (E) => r("cancel"))
              }, {
                default: U(() => [
                  T(y(o.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              p(ke, {
                variant: o.danger ? "danger" : "primary",
                loading: o.busy,
                disabled: o.busy,
                onClick: b[2] || (b[2] = (E) => r("confirm"))
              }, {
                default: U(() => [
                  T(y(o.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, Ye)
        ])) : $("", !0)
      ]),
      _: 3
    }));
  }
}), it = { class: "dr" }, rt = { class: "dr-head" }, ut = { class: "dr-badge" }, dt = { class: "dr-head-body" }, ct = { class: "dr-head-top" }, vt = { class: "dr-title" }, ft = { class: "dr-facts" }, mt = {
  key: 0,
  class: "dr-fact"
}, ht = {
  key: 1,
  class: "dr-fact"
}, pt = ["title"], kt = ["href"], bt = {
  key: 0,
  class: "dr-skel"
}, yt = {
  key: 1,
  class: "dr-state err"
}, gt = {
  key: 0,
  class: "dr-doc"
}, _t = { class: "dr-doc-main" }, wt = ["content-type", "source", "filename"], xt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, $t = ["aria-expanded"], Ct = {
  key: 3,
  class: "dr-state"
}, Et = {
  key: 1,
  class: "dr-chunks"
}, St = {
  key: 0,
  class: "dr-state"
}, Tt = ["aria-expanded", "onClick"], Dt = { class: "dr-chunk-n" }, Mt = { class: "dr-chunk-label" }, Nt = {
  key: 0,
  class: "dr-chunk-cx"
}, Lt = 720, It = /* @__PURE__ */ ue({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(o) {
    const l = o, _ = k(!1), r = k(""), g = k(""), v = k(""), b = k([]), E = k(0), P = k(""), B = k("read"), D = k(!1), w = k({});
    function L(h) {
      return String((h.metadata || {}).contextual_prefix || "");
    }
    const X = x(() => l.node.metadata || {}), M = x(() => X.value.source_url), Z = x(() => v.value || l.node.content_type || "text/markdown"), W = x(() => String(X.value.original_mime_type || X.value.source_mime || "")), I = x(() => Me(X.value) ? Ne(W.value || l.node.content_type || "") : !1), se = x(() => `/api/v1/kb10/${l.kbId}/nodes/${l.node.id}/source`), z = x(() => String(X.value.filename || X.value.original_filename || "")), A = x(() => g.value ? g.value : b.value.map((h) => h.content).filter(Boolean).join(`

`)), q = x(() => {
      const h = A.value.trim();
      return h ? h.split(/\s+/).length : 0;
    });
    function j() {
      I.value && (D.value = !D.value);
    }
    const K = k(null), V = k(!1), G = k(!1);
    function S() {
      const h = K.value;
      if (!h) {
        G.value = !1;
        return;
      }
      G.value = h.scrollHeight - Lt > 24;
    }
    let H = null;
    function J() {
      H?.disconnect();
      const h = K.value;
      h && (H = new ResizeObserver(() => S()), H.observe(h), ve(S));
    }
    const Q = x(() => G.value && !V.value);
    let N = 0;
    async function R() {
      if (!l.kbId || !l.node?.id) return;
      const h = ++N;
      _.value = !0, r.value = "", g.value = "", v.value = "", b.value = [], E.value = 0, P.value = "", B.value = "read", w.value = {}, V.value = !1, G.value = !1;
      try {
        const [{ data: e }, { data: a }, { data: u }] = await Promise.all([
          oe.get(`/api/v1/kb10/${l.kbId}/browse?node_id=${l.node.id}`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=chunk&include_content=true&limit=200`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (h !== N) return;
        if (e?.success && e.node && (g.value = String(e.node.content || ""), v.value = String(e.node.content_type || "")), a?.success) {
          if (!Number.isInteger(a.total) || a.total < 0) throw new Error("Invalid chunk total");
          E.value = a.total;
          const c = a.nodes;
          if (b.value = c.filter((n) => n.node_type === "chunk").sort((n, s) => Number((n.metadata || {}).index ?? (n.metadata || {}).chunk_index ?? 0) - Number((s.metadata || {}).index ?? (s.metadata || {}).chunk_index ?? 0)), !u?.success) throw new Error(u?.error || "could not load summary");
          P.value = u.nodes[0]?.content || "", g.value || (g.value = P.value || l.node.content || "");
        }
        !e?.success && !a?.success && (r.value = e?.error || a?.error || "could not load document");
      } catch (e) {
        if (h !== N) return;
        r.value = e?.response?.data?.error || e?.message || "could not load document", ce.handleError(e?.response?.status === 401 ? "auth-expired" : "other", e);
      } finally {
        h === N && (_.value = !1);
      }
    }
    const C = x(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: E.value || void 0 }
    ]);
    function ee(h) {
      w.value = { ...w.value, [h.id]: !w.value[h.id] };
    }
    return F([A, B, _], () => {
      B.value === "read" && !_.value && ve(J);
    }), F(I, (h) => {
      h || (D.value = !1);
    }), F(() => l.node?.id, () => R(), { immediate: !0 }), re(() => {
      H?.disconnect();
    }), (h, e) => (i(), m("div", it, [
      d("header", rt, [
        d("span", ut, [
          p(t(O), {
            icon: t(ge)(o.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        d("div", dt, [
          d("div", ct, [
            d("h2", vt, y(t(ne)(o.node)), 1),
            I.value ? (i(), Y(t(Le), {
              key: 0,
              class: ae(["dr-orig-btn", { on: D.value }]),
              label: D.value ? "Hide original" : "View original",
              onOpen: j
            }, null, 8, ["class", "label"])) : $("", !0)
          ]),
          d("div", ft, [
            E.value ? (i(), m("span", mt, [
              p(t(O), { icon: "tabler:layout-grid" }),
              T(y(E.value.toLocaleString()) + " chunks", 1)
            ])) : $("", !0),
            q.value ? (i(), m("span", ht, [
              p(t(O), { icon: "tabler:align-left" }),
              T(y(q.value.toLocaleString()) + " words", 1)
            ])) : $("", !0),
            o.node.created_at ? (i(), m("span", {
              key: 2,
              class: "dr-fact",
              title: t(Ae)(o.node.created_at)
            }, [
              p(t(O), { icon: "tabler:clock" }),
              T(y(t(_e)(o.node.created_at)), 1)
            ], 8, pt)) : $("", !0),
            M.value ? (i(), m("a", {
              key: 3,
              class: "dr-fact link",
              href: M.value,
              target: "_blank",
              rel: "noopener"
            }, [
              p(t(O), { icon: "tabler:external-link" }),
              e[3] || (e[3] = T("Source", -1))
            ], 8, kt)) : $("", !0)
          ])
        ])
      ]),
      p(t(Ie), {
        tabs: C.value,
        active: B.value,
        onSelect: e[0] || (e[0] = (a) => B.value = a)
      }, null, 8, ["tabs", "active"]),
      _.value ? (i(), m("div", bt, [
        (i(), m(le, null, ie(6, (a) => d("div", {
          key: a,
          class: "dr-skel-line"
        })), 64))
      ])) : r.value ? (i(), m("div", yt, [
        p(t(O), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        T(" " + y(r.value), 1)
      ])) : (i(), m(le, { key: 2 }, [
        B.value === "read" ? (i(), m("div", gt, [
          d("div", _t, [
            P.value ? (i(), Y(t(Oe), {
              key: 0,
              text: P.value
            }, null, 8, ["text"])) : $("", !0),
            A.value ? (i(), m("div", {
              key: 1,
              class: ae(["dr-clamp", { clamped: Q.value }])
            }, [
              d("div", {
                ref_key: "bodyRef",
                ref: K,
                class: "dr-clamp-inner"
              }, [
                d("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": Z.value,
                  source: A.value,
                  filename: z.value
                }, null, 8, wt)
              ], 512),
              Q.value ? (i(), m("div", xt)) : $("", !0)
            ], 2)) : $("", !0),
            G.value ? (i(), m("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": V.value,
              onClick: e[1] || (e[1] = (a) => V.value = !V.value)
            }, [
              p(t(O), {
                icon: V.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              T(" " + y(V.value ? "Show less" : "Show more"), 1)
            ], 8, $t)) : $("", !0),
            A.value ? $("", !0) : (i(), m("div", Ct, [
              p(t(O), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              e[4] || (e[4] = T(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (i(), m("div", Et, [
          b.value.length ? $("", !0) : (i(), m("div", St, [
            p(t(O), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = T(" This document has no chunks.", -1))
          ])),
          (i(!0), m(le, null, ie(b.value, (a, u) => (i(), m("div", {
            key: a.id,
            class: ae(["dr-chunk", { open: w.value[a.id] }])
          }, [
            d("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!w.value[a.id],
              onClick: (c) => ee(a)
            }, [
              d("span", Dt, y(u + 1), 1),
              d("span", Mt, "Chunk " + y(u + 1), 1),
              p(t(O), {
                class: "dr-chunk-chev",
                icon: w.value[a.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Tt),
            L(a) ? (i(), m("p", Nt, [
              p(t(O), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              d("span", null, y(L(a)), 1)
            ])) : $("", !0),
            d("p", {
              class: ae(["dr-chunk-body", { clamp: !w.value[a.id] }])
            }, y(a.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      p(t(Pe), {
        contained: "",
        open: D.value && I.value,
        title: z.value || "Original",
        "content-type": W.value || o.node.content_type || "",
        "source-url": se.value,
        filename: z.value,
        onClose: e[2] || (e[2] = (a) => D.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Ot = { class: "kb-page kd" }, Pt = { class: "kd-filter" }, Bt = {
  class: "kd-list",
  "aria-label": "Documents"
}, Rt = {
  key: 0,
  class: "kd-list-skel"
}, jt = ["onClick"], Vt = { class: "kd-row-ic" }, Xt = { class: "kd-row-main" }, qt = { class: "kd-row-title" }, Kt = { class: "kd-row-sub" }, Ut = {
  key: 1,
  class: "kd-list-empty"
}, zt = {
  key: 0,
  class: "kd-pager"
}, At = { class: "kd-pager-label" }, Gt = { class: "kx-main-scroll kd-reader" }, Ht = /* @__PURE__ */ ue({
  __name: "KbDocument",
  setup(o) {
    const l = Ee(), _ = Se(), r = x(() => l.value.config?.kb_id || ""), g = x(() => l.value.config?.route || "");
    let v = !1;
    const { indexingNotice: b, onMeta: E } = Be(() => r.value), {
      loading: P,
      notice: B,
      documents: D,
      deleting: w,
      reload: L,
      remove: X,
      findDoc: M,
      page: Z,
      pageSize: W,
      total: I,
      hasPrev: se,
      hasNext: z,
      next: A,
      prev: q
    } = Ge(() => r.value, { onMeta: E }), j = k(""), K = x(() => {
      const n = j.value.trim().toLowerCase();
      return n ? D.value.filter((s) => ne(s).toLowerCase().includes(n)) : D.value;
    }), V = x(() => I.value === 0 ? 0 : Z.value * W.value + 1), G = x(() => Math.min((Z.value + 1) * W.value, I.value)), S = k(""), H = x(() => M(S.value) || null), J = k(!1);
    async function Q() {
      if (!r.value) {
        J.value = !1;
        return;
      }
      try {
        const { data: n } = await oe.get(`/api/v1/knowledge/${r.value}`), s = n?.config || {};
        J.value = Ue(s);
      } catch {
        J.value = !1;
      }
    }
    F(r, Q, { immediate: !0 });
    const N = k(!1), R = k(!1), C = k(null), ee = x(() => !!C.value && !!w.value[C.value.id]);
    function h(n) {
      const s = S.value !== n.id;
      S.value = n.id, s && !v && _("navigate", n.id);
    }
    function e(n) {
      const s = M(n);
      s && (h(s), R.value = !1);
    }
    function a(n) {
      C.value = n;
    }
    async function u() {
      const n = C.value;
      if (!n) return;
      await X(n) && (S.value === n.id && (S.value = ""), C.value = null);
    }
    function c(n) {
      n.key === "Escape" && R.value && (R.value = !1);
    }
    return $e(() => {
      window.addEventListener("keydown", c), Ce("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), re(() => window.removeEventListener("keydown", c)), F(D, (n) => {
      if (!n.length) {
        S.value && !M(S.value) && (S.value = "");
        return;
      }
      if (S.value && M(S.value)) return;
      const f = (g.value ? n.find((de) => de.id === g.value) : null) || n[0];
      if (f) {
        v = !0;
        try {
          h(f);
        } finally {
          v = !1;
        }
      }
    }), F(r, () => {
      S.value = "";
    }), F(g, (n) => {
      if (!n || n === S.value) return;
      const s = M(n);
      if (s) {
        v = !0;
        try {
          h(s);
        } finally {
          v = !1;
        }
      }
    }), (n, s) => (i(), m("div", Ot, [
      t(B) ? (i(), Y(t(pe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: U(() => [
          T(y(t(B)), 1)
        ]),
        _: 1
      })) : $("", !0),
      t(b) ? (i(), Y(t(pe), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: U(() => [
          T(y(t(b)), 1)
        ]),
        _: 1
      })) : $("", !0),
      p(t(Re), null, {
        rail: U(() => [
          p(t(Qe), {
            title: "Documents",
            count: t(I)
          }, {
            actions: U(() => [
              p(t(te), {
                icon: "tabler:search",
                label: "Search",
                active: R.value,
                onClick: s[0] || (s[0] = (f) => R.value = !R.value)
              }, null, 8, ["active"]),
              p(t(te), {
                icon: "tabler:plus",
                label: "Add document",
                active: N.value,
                onClick: s[1] || (s[1] = (f) => N.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          d("div", Pt, [
            p(t(Xe), {
              modelValue: j.value,
              "onUpdate:modelValue": s[2] || (s[2] = (f) => j.value = f),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          d("nav", Bt, [
            t(P) && !t(D).length ? (i(), m("div", Rt, [
              (i(), m(le, null, ie(6, (f) => d("div", {
                key: f,
                class: "kd-skel-row"
              })), 64))
            ])) : $("", !0),
            (i(!0), m(le, null, ie(K.value, (f) => (i(), m("button", {
              key: f.id,
              class: ae(["kd-row", { on: S.value === f.id }]),
              onClick: (de) => h(f)
            }, [
              d("span", Vt, [
                p(t(O), {
                  icon: t(ge)(f),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              d("span", Xt, [
                d("span", qt, y(t(ne)(f)), 1),
                d("span", Kt, [
                  T(y(t(ze)(f)), 1),
                  f.created_at ? (i(), m(le, { key: 0 }, [
                    T(" · " + y(t(_e)(f.created_at)), 1)
                  ], 64)) : $("", !0)
                ])
              ]),
              p(t(te), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${t(ne)(f)}`,
                variant: "danger",
                size: "sm",
                spin: !!t(w)[f.id],
                disabled: !!t(w)[f.id],
                onClick: (de) => a(f)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, jt))), 128)),
            !t(P) && !K.value.length ? (i(), m("div", Ut, y(t(D).length ? "No documents match." : "No documents yet — add one with +."), 1)) : $("", !0)
          ]),
          t(I) > t(W) ? (i(), m("div", zt, [
            p(t(te), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !t(se),
              onClick: t(q)
            }, null, 8, ["disabled", "onClick"]),
            d("span", At, y(V.value) + "–" + y(G.value) + " of " + y(t(I)), 1),
            p(t(te), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !t(z),
              onClick: t(A)
            }, null, 8, ["disabled", "onClick"])
          ])) : $("", !0)
        ]),
        default: U(() => [
          d("div", Gt, [
            R.value ? (i(), Y(t(je), {
              key: 0,
              "kb-id": r.value,
              layout: "panel",
              ask: J.value,
              onOpen: s[3] || (s[3] = (f) => f.parent_id && e(f.parent_id)),
              onClose: s[4] || (s[4] = (f) => R.value = !1)
            }, null, 8, ["kb-id", "ask"])) : H.value ? (i(), Y(It, {
              key: 1,
              "kb-id": r.value,
              node: H.value
            }, null, 8, ["kb-id", "node"])) : (i(), Y(Ve, {
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
      p(t(qe), {
        open: N.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: s[6] || (s[6] = (f) => N.value = !1)
      }, {
        default: U(() => [
          p(Ke, {
            "kb-id": r.value,
            noun: "document",
            onChanged: s[5] || (s[5] = (f) => {
              N.value = !1, t(L)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      p(t(st), {
        open: !!C.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: C.value ? t(ne)(C.value) : "",
        "confirm-label": "Delete",
        busy: ee.value,
        onCancel: s[7] || (s[7] = (f) => C.value = null),
        onConfirm: u
      }, {
        default: U(() => [
          s[8] || (s[8] = T(" Remove ", -1)),
          d("strong", null, y(C.value ? t(ne)(C.value) : ""), 1),
          s[9] || (s[9] = T(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), en = {
  rootComponent: Ht
};
export {
  en as mountConfig
};
//# sourceMappingURL=document-mount-Bak2Qv3n.js.map
