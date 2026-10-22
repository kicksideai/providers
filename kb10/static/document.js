import { _ as ue, u as ke, a as ye, d as we, W as _e, c as $e } from "./styles-6KkAYkXp.js";
import { ref as v, computed as y, onBeforeUnmount as ie, watch as H, defineComponent as se, openBlock as s, createElementBlock as p, createElementVNode as c, createTextVNode as S, toDisplayString as g, createCommentVNode as C, renderSlot as he, createBlock as Q, Transition as Ce, withCtx as G, withModifiers as Ee, normalizeClass as te, createVNode as f, unref as a, nextTick as pe, Fragment as ne, renderList as le, onMounted as Se } from "vue";
import { Icon as I } from "@iconify/vue";
import { api as ae, host as de, loadByTagName as De, define as Te } from "@wippy-fe/proxy";
import { c as Me, E as fe, i as ve, s as Ne, a as me, _ as Z, u as Le, b as ze, n as ee, d as Ie, e as Oe, f as Be, g as Pe, h as Re, j as je, k as Ve, l as Ke, m as Ue, o as Xe, p as qe, q as Ae } from "./package-CNcWGLZ-.js";
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
function Fe(l) {
  const i = l.content_type || "";
  if (xe[i]) return xe[i];
  const b = l.metadata || {}, d = String(b.filename || b.source_url || b.title || ""), h = d.lastIndexOf(".");
  if (h > 0 && h < d.length - 1) {
    const u = d.slice(h + 1).split(/[?#]/)[0];
    if (u.length <= 5) return u.toUpperCase();
  }
  return b.source_url ? "URL" : i.startsWith("image/") ? "IMG" : "DOC";
}
function ge(l) {
  const i = l.content_type || "";
  return (l.metadata || {}).source_url ? "tabler:world" : i === "application/pdf" ? "tabler:file-type-pdf" : i === "text/markdown" ? "tabler:markdown" : i === "text/csv" || i.includes("spreadsheet") || i.includes("excel") ? "tabler:table" : i === "application/json" ? "tabler:json" : i.includes("word") || i.includes("document") ? "tabler:file-text" : i.includes("presentation") || i.includes("powerpoint") ? "tabler:presentation" : i === "text/html" ? "tabler:file-code" : i.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function be(l) {
  if (!l) return "";
  const i = new Date(l), b = i.getTime();
  if (Number.isNaN(b)) return "";
  const d = Date.now() - b, h = Math.round(d / 1e3);
  if (h < 45) return "just now";
  const u = Math.round(h / 60);
  if (u < 60) return `${u}m ago`;
  const m = Math.round(u / 60);
  if (m < 24) return `${m}h ago`;
  const w = Math.round(m / 24);
  return w < 7 ? `${w}d ago` : i.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function Ge(l) {
  if (!l) return "";
  const i = new Date(l);
  return Number.isNaN(i.getTime()) ? "" : i.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function He(l, i = {}) {
  const b = v(!1), d = v(""), h = v([]), u = v(0), m = v(50), w = v(0), D = y(() => Math.max(1, Math.ceil(w.value / m.value))), N = y(() => u.value > 0), O = y(() => u.value < D.value - 1), _ = v({}), E = v({}), B = 2e4, M = /* @__PURE__ */ new Map();
  function j(e) {
    const r = { ..._.value };
    delete r[e], _.value = r;
    const n = { ...E.value };
    delete n[e], E.value = n;
    const t = M.get(e);
    t && (clearTimeout(t), M.delete(e));
  }
  const Y = /* @__PURE__ */ new Set(["concept", "edge", "chunk", "summary"]);
  function K(e) {
    return Date.parse(e.updated_at || e.created_at || "") || 0;
  }
  function oe(e) {
    const r = /* @__PURE__ */ new Map(), n = [];
    for (const t of e) {
      const o = Me(t);
      if (!o) {
        n.push(t);
        continue;
      }
      const z = r.get(o);
      if (z === void 0) {
        r.set(o, n.length), n.push(t);
        continue;
      }
      K(t) >= K(n[z]) && (n[z] = t);
    }
    return n;
  }
  const U = y(() => oe(h.value.filter((e) => !Y.has(e.node_type || ""))));
  function P(e) {
    return U.value.find((r) => r.id === e);
  }
  let R = 0;
  async function X() {
    const e = l();
    if (!e) return;
    const r = ++R;
    b.value = !0, d.value = "";
    try {
      const n = u.value * m.value, { data: t } = await ae.get(`/api/v1/kb10/${e}/browse?limit=${m.value}&offset=${n}`);
      if (r !== R || l() !== e) return;
      if (!t?.success) {
        d.value = t?.error && ve(t.error) ? fe : t?.error || "";
        return;
      }
      h.value = t.nodes || [], w.value = Number(t.total) || 0;
    } catch (n) {
      if (r !== R) return;
      const t = n?.response?.data?.error || n?.message || "could not load contents";
      d.value = ve(t) ? fe : t, de.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
    } finally {
      r === R && (b.value = !1);
    }
  }
  function q(e) {
    const r = Math.max(0, Math.min(e, D.value - 1));
    r !== u.value && (u.value = r, X());
  }
  function k() {
    O.value && q(u.value + 1);
  }
  function V() {
    N.value && q(u.value - 1);
  }
  async function A(e) {
    const r = l();
    if (!r || _.value[e.id]) return !1;
    const n = me(e);
    if (!n)
      return d.value = "This document has no durable source identity and cannot be deleted here.", !1;
    _.value = { ..._.value, [e.id]: !0 }, E.value = { ...E.value, [e.id]: String(n.external_id || "") };
    let t = !1;
    try {
      const { data: o } = await ae.delete(`/api/v1/knowledge/${r}/content`, { data: n });
      o?.success ? (t = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = o?.error || "could not queue delete";
    } catch (o) {
      d.value = o?.response?.data?.error || o?.message || "could not queue delete", de.handleError(o?.response?.status === 401 ? "auth-expired" : "other", o);
    } finally {
      if (!t)
        j(e.id);
      else {
        const o = e.id;
        M.set(o, setTimeout(() => {
          _.value[o] && (j(o), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, B));
      }
    }
    return t;
  }
  function W(e) {
    return String(me(e)?.external_id || "");
  }
  function F() {
    if (Object.keys(E.value).length === 0) return;
    const e = new Set(U.value.map(W).filter(Boolean)), r = { ..._.value }, n = { ...E.value };
    let t = !1;
    for (const [o, z] of Object.entries(E.value))
      if (z && !e.has(z)) {
        delete r[o], delete n[o];
        const ce = M.get(o);
        ce && (clearTimeout(ce), M.delete(o)), t = !0;
      }
    t && (_.value = r, E.value = n, Object.keys(r).length || (d.value = ""), i.onChanged?.());
  }
  let T = !1, $ = !1;
  async function re() {
    if (T) {
      $ = !0;
      return;
    }
    T = !0;
    try {
      do
        $ = !1, await X(), F();
      while ($);
    } finally {
      T = !1;
    }
  }
  let L = null, J = 0;
  function x(e) {
    const r = ++J;
    if (L && (L(), L = null), !e) return;
    const n = Ne(e, () => {
      re();
    });
    if (r !== J) {
      n && n();
      return;
    }
    L = n;
  }
  return ie(() => {
    J++, R++, L && L(), M.forEach((e) => clearTimeout(e)), M.clear();
  }), H(l, (e) => {
    u.value = 0, w.value = 0, X(), x(e);
  }, { immediate: !0 }), {
    loading: b,
    notice: d,
    nodes: h,
    documents: U,
    deleting: _,
    load: X,
    reload: X,
    remove: A,
    findDoc: P,
    page: u,
    pageSize: m,
    total: w,
    pageCount: D,
    hasPrev: N,
    hasNext: O,
    next: k,
    prev: V,
    goToPage: q
  };
}
const We = { class: "kx-railhead" }, Je = { class: "kx-railhead-title" }, Qe = { key: 0 }, Ye = { class: "kx-railhead-acts" }, Ze = /* @__PURE__ */ se({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(l) {
    return (i, b) => (s(), p("div", We, [
      c("span", Je, [
        S(g(l.title), 1),
        l.count !== void 0 ? (s(), p("b", Qe, g(l.count), 1)) : C("", !0)
      ]),
      c("div", Ye, [
        he(i.$slots, "actions")
      ])
    ]));
  }
}), et = ["aria-label"], tt = { class: "kx-modal-h" }, nt = { class: "kx-modal-h-ico" }, at = { class: "kx-modal-h-text" }, ot = { class: "kx-modal-h-title" }, rt = {
  key: 0,
  class: "kx-modal-h-sub"
}, lt = { class: "kx-modal-body" }, it = { class: "kx-modal-foot" }, st = /* @__PURE__ */ se({
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
  setup(l, { emit: i }) {
    const b = l, d = i;
    function h(u) {
      u.key === "Escape" && !b.busy && d("cancel");
    }
    return H(() => b.open, (u) => {
      u ? window.addEventListener("keydown", h) : window.removeEventListener("keydown", h);
    }), ie(() => window.removeEventListener("keydown", h)), (u, m) => (s(), Q(Ce, { name: "kx-modal" }, {
      default: G(() => [
        l.open ? (s(), p("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: m[3] || (m[3] = Ee((w) => !l.busy && d("cancel"), ["self"]))
        }, [
          c("div", {
            class: te(["kx-modal", { danger: l.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": l.title
          }, [
            c("div", tt, [
              c("span", nt, [
                f(a(I), {
                  icon: l.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              c("span", at, [
                c("span", ot, g(l.title), 1),
                l.subtitle ? (s(), p("span", rt, g(l.subtitle), 1)) : C("", !0)
              ]),
              f(Z, {
                icon: "tabler:x",
                label: "Close",
                disabled: l.busy,
                onClick: m[0] || (m[0] = (w) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            c("div", lt, [
              he(u.$slots, "default")
            ]),
            c("div", it, [
              f(ue, {
                variant: "ghost",
                disabled: l.busy,
                onClick: m[1] || (m[1] = (w) => d("cancel"))
              }, {
                default: G(() => [
                  S(g(l.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              f(ue, {
                variant: l.danger ? "danger" : "primary",
                loading: l.busy,
                disabled: l.busy,
                onClick: m[2] || (m[2] = (w) => d("confirm"))
              }, {
                default: G(() => [
                  S(g(l.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, et)
        ])) : C("", !0)
      ]),
      _: 3
    }));
  }
}), dt = { class: "dr" }, ct = { class: "dr-head" }, ut = { class: "dr-badge" }, pt = { class: "dr-head-body" }, ft = { class: "dr-head-top" }, vt = { class: "dr-title" }, mt = { class: "dr-facts" }, xt = {
  key: 0,
  class: "dr-fact"
}, ht = {
  key: 1,
  class: "dr-fact"
}, gt = ["title"], bt = ["href"], kt = {
  key: 0,
  class: "dr-skel"
}, yt = {
  key: 1,
  class: "dr-state err"
}, wt = {
  key: 0,
  class: "dr-doc"
}, _t = { class: "dr-doc-main" }, $t = ["content-type", "source", "filename"], Ct = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Et = ["aria-expanded"], St = {
  key: 3,
  class: "dr-state"
}, Dt = {
  key: 1,
  class: "dr-chunks"
}, Tt = {
  key: 0,
  class: "dr-state"
}, Mt = ["aria-expanded", "onClick"], Nt = { class: "dr-chunk-n" }, Lt = { class: "dr-chunk-label" }, zt = {
  key: 0,
  class: "dr-chunk-cx"
}, It = 720, Ot = /* @__PURE__ */ se({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(l) {
    const i = l, b = v(!1), d = v(""), h = v(""), u = v(""), m = v([]), w = v(0), D = v(""), N = v("read"), O = v(!1), _ = v({});
    function E(x) {
      return String((x.metadata || {}).contextual_prefix || "");
    }
    const B = y(() => i.node.metadata || {}), M = y(() => B.value.source_url), j = y(() => u.value || i.node.content_type || "text/markdown"), Y = y(() => String(B.value.original_mime_type || B.value.source_mime || "")), K = y(() => Le(B.value) ? ze(Y.value || i.node.content_type || "") : !1), oe = y(() => `/api/v1/kb10/${i.kbId}/nodes/${i.node.id}/source`), U = y(() => String(B.value.filename || B.value.original_filename || "")), P = y(() => h.value ? h.value : m.value.map((x) => x.content).filter(Boolean).join(`

`)), R = y(() => {
      const x = P.value.trim();
      return x ? x.split(/\s+/).length : 0;
    });
    function X() {
      K.value && (O.value = !O.value);
    }
    const q = v(null), k = v(!1), V = v(!1);
    function A() {
      const x = q.value;
      if (!x) {
        V.value = !1;
        return;
      }
      V.value = x.scrollHeight - It > 24;
    }
    let W = null;
    function F() {
      W?.disconnect();
      const x = q.value;
      x && (W = new ResizeObserver(() => A()), W.observe(x), pe(A));
    }
    const T = y(() => V.value && !k.value);
    let $ = 0;
    async function re() {
      if (!i.kbId || !i.node?.id) return;
      const x = ++$;
      b.value = !0, d.value = "", h.value = "", u.value = "", m.value = [], w.value = 0, D.value = "", N.value = "read", _.value = {}, k.value = !1, V.value = !1;
      try {
        const [{ data: e }, { data: r }, { data: n }] = await Promise.all([
          ae.get(`/api/v1/kb10/${i.kbId}/browse?node_id=${i.node.id}`),
          ae.get(`/api/v1/kb10/${i.kbId}/browse?parent_id=${i.node.id}&node_type=chunk&include_content=true&limit=200`),
          ae.get(`/api/v1/kb10/${i.kbId}/browse?parent_id=${i.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (x !== $) return;
        if (e?.success && e.node && (h.value = String(e.node.content || ""), u.value = String(e.node.content_type || "")), r?.success) {
          if (!Number.isInteger(r.total) || r.total < 0) throw new Error("Invalid chunk total");
          w.value = r.total;
          const t = r.nodes;
          if (m.value = t.filter((o) => o.node_type === "chunk").sort((o, z) => Number((o.metadata || {}).index ?? (o.metadata || {}).chunk_index ?? 0) - Number((z.metadata || {}).index ?? (z.metadata || {}).chunk_index ?? 0)), !n?.success) throw new Error(n?.error || "could not load summary");
          D.value = n.nodes[0]?.content || "", h.value || (h.value = D.value || i.node.content || "");
        }
        !e?.success && !r?.success && (d.value = e?.error || r?.error || "could not load document");
      } catch (e) {
        if (x !== $) return;
        d.value = e?.response?.data?.error || e?.message || "could not load document", de.handleError(e?.response?.status === 401 ? "auth-expired" : "other", e);
      } finally {
        x === $ && (b.value = !1);
      }
    }
    const L = y(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: w.value || void 0 }
    ]);
    function J(x) {
      _.value = { ..._.value, [x.id]: !_.value[x.id] };
    }
    return H([P, N, b], () => {
      N.value === "read" && !b.value && pe(F);
    }), H(K, (x) => {
      x || (O.value = !1);
    }), H(() => i.node?.id, () => re(), { immediate: !0 }), ie(() => {
      W?.disconnect();
    }), (x, e) => (s(), p("div", dt, [
      c("header", ct, [
        c("span", ut, [
          f(a(I), {
            icon: a(ge)(l.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        c("div", pt, [
          c("div", ft, [
            c("h2", vt, g(a(ee)(l.node)), 1),
            K.value ? (s(), Q(a(Ie), {
              key: 0,
              class: te(["dr-orig-btn", { on: O.value }]),
              label: O.value ? "Hide original" : "View original",
              onOpen: X
            }, null, 8, ["class", "label"])) : C("", !0)
          ]),
          c("div", mt, [
            w.value ? (s(), p("span", xt, [
              f(a(I), { icon: "tabler:layout-grid" }),
              S(g(w.value.toLocaleString()) + " chunks", 1)
            ])) : C("", !0),
            R.value ? (s(), p("span", ht, [
              f(a(I), { icon: "tabler:align-left" }),
              S(g(R.value.toLocaleString()) + " words", 1)
            ])) : C("", !0),
            l.node.created_at ? (s(), p("span", {
              key: 2,
              class: "dr-fact",
              title: a(Ge)(l.node.created_at)
            }, [
              f(a(I), { icon: "tabler:clock" }),
              S(g(a(be)(l.node.created_at)), 1)
            ], 8, gt)) : C("", !0),
            M.value ? (s(), p("a", {
              key: 3,
              class: "dr-fact link",
              href: M.value,
              target: "_blank",
              rel: "noopener"
            }, [
              f(a(I), { icon: "tabler:external-link" }),
              e[3] || (e[3] = S("Source", -1))
            ], 8, bt)) : C("", !0)
          ])
        ])
      ]),
      f(a(Oe), {
        tabs: L.value,
        active: N.value,
        onSelect: e[0] || (e[0] = (r) => N.value = r)
      }, null, 8, ["tabs", "active"]),
      b.value ? (s(), p("div", kt, [
        (s(), p(ne, null, le(6, (r) => c("div", {
          key: r,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (s(), p("div", yt, [
        f(a(I), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        S(" " + g(d.value), 1)
      ])) : (s(), p(ne, { key: 2 }, [
        N.value === "read" ? (s(), p("div", wt, [
          c("div", _t, [
            D.value ? (s(), Q(a(Be), {
              key: 0,
              text: D.value
            }, null, 8, ["text"])) : C("", !0),
            P.value ? (s(), p("div", {
              key: 1,
              class: te(["dr-clamp", { clamped: T.value }])
            }, [
              c("div", {
                ref_key: "bodyRef",
                ref: q,
                class: "dr-clamp-inner"
              }, [
                c("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": j.value,
                  source: P.value,
                  filename: U.value
                }, null, 8, $t)
              ], 512),
              T.value ? (s(), p("div", Ct)) : C("", !0)
            ], 2)) : C("", !0),
            V.value ? (s(), p("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": k.value,
              onClick: e[1] || (e[1] = (r) => k.value = !k.value)
            }, [
              f(a(I), {
                icon: k.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              S(" " + g(k.value ? "Show less" : "Show more"), 1)
            ], 8, Et)) : C("", !0),
            P.value ? C("", !0) : (s(), p("div", St, [
              f(a(I), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              e[4] || (e[4] = S(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (s(), p("div", Dt, [
          m.value.length ? C("", !0) : (s(), p("div", Tt, [
            f(a(I), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = S(" This document has no chunks.", -1))
          ])),
          (s(!0), p(ne, null, le(m.value, (r, n) => (s(), p("div", {
            key: r.id,
            class: te(["dr-chunk", { open: _.value[r.id] }])
          }, [
            c("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!_.value[r.id],
              onClick: (t) => J(r)
            }, [
              c("span", Nt, g(n + 1), 1),
              c("span", Lt, "Chunk " + g(n + 1), 1),
              f(a(I), {
                class: "dr-chunk-chev",
                icon: _.value[r.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Mt),
            E(r) ? (s(), p("p", zt, [
              f(a(I), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              c("span", null, g(E(r)), 1)
            ])) : C("", !0),
            c("p", {
              class: te(["dr-chunk-body", { clamp: !_.value[r.id] }])
            }, g(r.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      f(a(Pe), {
        contained: "",
        open: O.value && K.value,
        title: U.value || "Original",
        "content-type": Y.value || l.node.content_type || "",
        "source-url": oe.value,
        filename: U.value,
        onClose: e[2] || (e[2] = (r) => O.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Bt = { class: "kb-page kd" }, Pt = { class: "kd-filter" }, Rt = {
  class: "kd-list",
  "aria-label": "Documents"
}, jt = {
  key: 0,
  class: "kd-list-skel"
}, Vt = ["onClick"], Kt = { class: "kd-row-ic" }, Ut = { class: "kd-row-main" }, Xt = { class: "kd-row-title" }, qt = { class: "kd-row-sub" }, At = {
  key: 1,
  class: "kd-list-empty"
}, Ft = {
  key: 0,
  class: "kd-pager"
}, Gt = { class: "kd-pager-label" }, Ht = { class: "kx-main-scroll kd-reader" }, Wt = /* @__PURE__ */ se({
  __name: "KbDocument",
  setup(l) {
    const i = ke(), b = ye(), d = y(() => i.value.config?.kb_id || ""), h = y(() => i.value.config?.route || "");
    let u = !1;
    const {
      loading: m,
      notice: w,
      documents: D,
      deleting: N,
      reload: O,
      remove: _,
      findDoc: E,
      page: B,
      pageSize: M,
      total: j,
      hasPrev: Y,
      hasNext: K,
      next: oe,
      prev: U
    } = He(() => d.value), P = v(""), R = y(() => {
      const n = P.value.trim().toLowerCase();
      return n ? D.value.filter((t) => ee(t).toLowerCase().includes(n)) : D.value;
    }), X = y(() => j.value === 0 ? 0 : B.value * M.value + 1), q = y(() => Math.min((B.value + 1) * M.value, j.value)), k = v(""), V = y(() => E(k.value) || null), A = v(!1);
    async function W() {
      if (!d.value) {
        A.value = !1;
        return;
      }
      try {
        const { data: n } = await ae.get(`/api/v1/knowledge/${d.value}`), t = n?.config || {};
        A.value = we(t);
      } catch {
        A.value = !1;
      }
    }
    H(d, W, { immediate: !0 });
    const F = v(!1), T = v(!1), $ = v(null), re = y(() => !!$.value && !!N.value[$.value.id]);
    function L(n) {
      const t = k.value !== n.id;
      k.value = n.id, t && !u && b("navigate", n.id);
    }
    function J(n) {
      const t = E(n);
      t && (L(t), T.value = !1);
    }
    function x(n) {
      $.value = n;
    }
    async function e() {
      const n = $.value;
      if (!n) return;
      await _(n) && (k.value === n.id && (k.value = ""), $.value = null);
    }
    function r(n) {
      n.key === "Escape" && T.value && (T.value = !1);
    }
    return Se(() => {
      window.addEventListener("keydown", r), De("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", r)), H(D, (n) => {
      if (!n.length) {
        k.value && !E(k.value) && (k.value = "");
        return;
      }
      if (k.value && E(k.value)) return;
      const o = (h.value ? n.find((z) => z.id === h.value) : null) || n[0];
      if (o) {
        u = !0;
        try {
          L(o);
        } finally {
          u = !1;
        }
      }
    }), H(d, () => {
      k.value = "";
    }), H(h, (n) => {
      if (!n || n === k.value) return;
      const t = E(n);
      if (t) {
        u = !0;
        try {
          L(t);
        } finally {
          u = !1;
        }
      }
    }), (n, t) => (s(), p("div", Bt, [
      a(w) ? (s(), Q(a(Re), {
        key: 0,
        class: "kd-notice"
      }, {
        default: G(() => [
          S(g(a(w)), 1)
        ]),
        _: 1
      })) : C("", !0),
      f(a(je), null, {
        rail: G(() => [
          f(a(Ze), {
            title: "Documents",
            count: a(j)
          }, {
            actions: G(() => [
              f(a(Z), {
                icon: "tabler:search",
                label: "Search",
                active: T.value,
                onClick: t[0] || (t[0] = (o) => T.value = !T.value)
              }, null, 8, ["active"]),
              f(a(Z), {
                icon: "tabler:plus",
                label: "Add document",
                active: F.value,
                onClick: t[1] || (t[1] = (o) => F.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          c("div", Pt, [
            f(a(Ue), {
              modelValue: P.value,
              "onUpdate:modelValue": t[2] || (t[2] = (o) => P.value = o),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          c("nav", Rt, [
            a(m) && !a(D).length ? (s(), p("div", jt, [
              (s(), p(ne, null, le(6, (o) => c("div", {
                key: o,
                class: "kd-skel-row"
              })), 64))
            ])) : C("", !0),
            (s(!0), p(ne, null, le(R.value, (o) => (s(), p("button", {
              key: o.id,
              class: te(["kd-row", { on: k.value === o.id }]),
              onClick: (z) => L(o)
            }, [
              c("span", Kt, [
                f(a(I), {
                  icon: a(ge)(o),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              c("span", Ut, [
                c("span", Xt, g(a(ee)(o)), 1),
                c("span", qt, [
                  S(g(a(Fe)(o)), 1),
                  o.created_at ? (s(), p(ne, { key: 0 }, [
                    S(" · " + g(a(be)(o.created_at)), 1)
                  ], 64)) : C("", !0)
                ])
              ]),
              f(a(Z), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${a(ee)(o)}`,
                variant: "danger",
                size: "sm",
                spin: !!a(N)[o.id],
                disabled: !!a(N)[o.id],
                onClick: (z) => x(o)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, Vt))), 128)),
            !a(m) && !R.value.length ? (s(), p("div", At, g(a(D).length ? "No documents match." : "No documents yet — add one with +."), 1)) : C("", !0)
          ]),
          a(j) > a(M) ? (s(), p("div", Ft, [
            f(a(Z), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !a(Y),
              onClick: a(U)
            }, null, 8, ["disabled", "onClick"]),
            c("span", Gt, g(X.value) + "–" + g(q.value) + " of " + g(a(j)), 1),
            f(a(Z), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !a(K),
              onClick: a(oe)
            }, null, 8, ["disabled", "onClick"])
          ])) : C("", !0)
        ]),
        default: G(() => [
          c("div", Ht, [
            T.value ? (s(), Q(a(Ve), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: A.value,
              onOpen: t[3] || (t[3] = (o) => o.parent_id && J(o.parent_id)),
              onClose: t[4] || (t[4] = (o) => T.value = !1)
            }, null, 8, ["kb-id", "ask"])) : V.value ? (s(), Q(Ot, {
              key: 1,
              "kb-id": d.value,
              node: V.value
            }, null, 8, ["kb-id", "node"])) : (s(), Q(Ke, {
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
      f(a(Xe), {
        open: F.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: t[6] || (t[6] = (o) => F.value = !1)
      }, {
        default: G(() => [
          f(qe, {
            "kb-id": d.value,
            noun: "document",
            onChanged: t[5] || (t[5] = (o) => {
              F.value = !1, a(O)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      f(a(st), {
        open: !!$.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: $.value ? a(ee)($.value) : "",
        "confirm-label": "Delete",
        busy: re.value,
        onCancel: t[7] || (t[7] = (o) => $.value = null),
        onConfirm: e
      }, {
        default: G(() => [
          t[8] || (t[8] = S(" Remove ", -1)),
          c("strong", null, g($.value ? a(ee)($.value) : ""), 1),
          t[9] || (t[9] = S(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Jt = ".kx-doc{--doc-radius: 14px;gap:18px;padding:6px 20px 20px}.dr{display:flex;flex-direction:column;gap:18px}.dr-head{display:flex;align-items:flex-start;gap:16px}.dr-badge{width:52px;height:60px;flex-shrink:0;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border:1px solid color-mix(in srgb,var(--p-primary-color) 22%,transparent)}.dr-badge svg{width:24px;height:24px}.dr-badge .dr-badge-t{background:transparent;border-color:transparent;padding:0;color:inherit}.dr-head-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}.dr-head-top{display:flex;align-items:flex-start;gap:14px}.dr-title{margin:0;flex:1;min-width:0;font-size:21px;font-weight:700;line-height:1.25;color:var(--p-text-color);letter-spacing:-.01em}.dr-orig-btn{flex:none}.dr-orig-btn.on{border-color:var(--p-primary-color);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.dr-facts{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.dr-fact{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--p-text-muted-color);text-decoration:none}button.dr-fact{appearance:none;background:none;border:0;margin:0;padding:0;font-family:inherit;line-height:inherit;cursor:pointer}.dr-fact svg{width:14px;height:14px}.dr-fact.link{color:var(--p-primary-color);font-weight:600}.dr-fact.link:hover{text-decoration:underline}.dr-chip{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:9px;font-weight:600;padding:2px 6px;border-radius:6px;background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.dr-paper{max-width:720px;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:var(--doc-radius);padding:28px 32px}.dr-prose{margin:0;font-size:14.5px;line-height:1.75;color:var(--p-text-color);white-space:pre-wrap}.dr-state{display:flex;align-items:center;gap:8px;padding:28px 8px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);font-size:13px;font-style:italic}.dr-state svg{width:16px;height:16px}.dr-state.err{color:var(--p-danger-500);font-style:normal}.dr-skel{display:flex;flex-direction:column;gap:12px;max-width:720px}.dr-skel-line{height:14px;border-radius:6px;background:var(--kx-surface-2);position:relative;overflow:hidden}.dr-skel-line:nth-child(2n){width:92%}.dr-skel-line:nth-child(3n){width:78%}.dr-chunks{display:flex;flex-direction:column;gap:10px;max-width:760px}.dr-cx-note{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:10px;font-size:12px;line-height:1.45;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border:1px solid color-mix(in srgb,var(--p-primary-color) 26%,transparent)}.dr-cx-note svg{width:15px;height:15px;flex:none;margin-top:1px}.dr-chunk-cx{display:flex;align-items:flex-start;gap:7px;margin:9px 0 0;padding:8px 10px;border-radius:8px;font-size:11.5px;line-height:1.5;font-style:italic;background:color-mix(in srgb,var(--p-primary-color) 6%,transparent);color:var(--p-text-muted-color)}.dr-chunk-cx svg{width:13px;height:13px;flex:none;margin-top:2px;color:var(--p-primary-color)}.dr-chunk{cursor:pointer;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:14px;padding:14px 16px;transition:border-color .14s,box-shadow .14s}.dr-chunk:hover{border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.dr-chunk.open{box-shadow:0 2px 10px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.dr-chunk-h{width:100%;border:0;padding:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px}.dr-chunk-n{width:24px;height:24px;flex-shrink:0;border-radius:6px;display:grid;place-items:center;font-size:11px;font-weight:800;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.dr-chunk-label{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.dr-chunk-chev{width:16px;height:16px;margin-left:auto;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.dr-chunk-body{margin:10px 0 0;font-size:12.5px;line-height:1.65;color:var(--p-text-muted-color);white-space:pre-wrap}.dr-chunk-body.clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}:host{display:block;height:100%;min-height:0}.kd{height:100%;min-height:calc(100vh - 96px);display:flex;flex-direction:column;gap:0;padding:0}.kd-notice{margin:12px 16px 0}.kd-filter{padding:10px}.kd-list{flex:1;min-height:0;overflow-y:auto;padding:4px 8px 12px}.kd-row{position:relative;display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:7px 8px;border-radius:8px;cursor:pointer;border:none;background:transparent;font:inherit;transition:background .12s}.kd-row:hover{background:var(--kx-surface-2)}.kd-row.on{background:var(--wk-trail, color-mix(in srgb, var(--p-primary-color) 9%, transparent));box-shadow:inset 2px 0 0 var(--p-primary-color)}.kd-row.on .kd-row-title{color:var(--p-primary-color);font-weight:700}.kd-row-ic{width:28px;height:28px;flex:none;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--p-primary-color) 11%,transparent);color:var(--p-primary-color)}.kd-row-ic svg{width:16px;height:16px}.kd-row-main{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.kd-row-title{font-size:12.8px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kd-row-sub{font-size:10.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kd-row-del{flex:none;opacity:0;transition:opacity .12s}.kd-row:hover .kd-row-del,.kd-row-del:disabled{opacity:1}.kd-pager{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-top:1px solid var(--p-content-border-color, var(--kx-surface-2))}.kd-pager-label{font-size:11.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);white-space:nowrap}.kd-list-empty{padding:24px 12px;text-align:center;font-size:12.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kd-list-skel{display:flex;flex-direction:column;gap:6px;padding:6px}.kd-skel-row{height:42px;border-radius:8px;background:var(--kx-surface-2);animation:kd-pulse 1.3s ease-in-out infinite}@keyframes kd-pulse{0%,to{opacity:.5}50%{opacity:1}}.kd-reader{display:flex;flex-direction:column;min-height:0}.kd-empty{margin:auto 0}.dr{max-width:1100px}.dr-doc{margin-top:18px;display:flex;flex-direction:column;gap:14px}.dr-rv{display:block}.dr-clamp{position:relative}.dr-clamp.clamped{max-height:720px;overflow:hidden}.dr-clamp-fade{position:absolute;left:0;right:0;bottom:0;height:96px;pointer-events:none;background:linear-gradient(to bottom,transparent,var(--p-content-background) 92%)}.dr-more{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:var(--kx-control-height-sm, 30px);padding:0 14px;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;background:var(--kx-surface-2);color:var(--p-text-color);border:1px solid var(--p-content-border-color);transition:border-color .14s,background .14s}.dr-more:hover{border-color:var(--p-primary-color);color:var(--p-primary-color)}.dr-more svg{width:15px;height:15px}.dr-doc-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:14px}@media(max-width:760px){.dr-paper{padding:18px 16px}.dr-chunks,.dr-skel{max-width:100%}}", Qt = $e + Jt;
class Yt extends _e {
  static get wippyConfig() {
    return {
      propsSchema: Ae.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Qt
    };
  }
  static get vueConfig() {
    return { rootComponent: Wt };
  }
}
Te(import.meta.url, Yt);
//# sourceMappingURL=document.js.map
