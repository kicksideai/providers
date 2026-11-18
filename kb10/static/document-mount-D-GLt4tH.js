import { ref as h, computed as _, onBeforeUnmount as ie, watch as W, defineComponent as re, openBlock as s, createElementBlock as c, createElementVNode as r, createTextVNode as E, toDisplayString as b, createCommentVNode as $, renderSlot as ke, createBlock as Q, Transition as ge, withCtx as F, withModifiers as _e, normalizeClass as te, createVNode as v, unref as a, nextTick as ce, Fragment as ne, renderList as se, onMounted as we } from "vue";
import { Icon as I } from "@iconify/vue";
import { api as oe, host as ue, loadByTagName as xe } from "@wippy-fe/proxy";
import { a as $e, u as Ce } from "./wc-runtime-f54Bo-yJ.js";
import { c as Ee, E as ve, i as fe, s as Se, a as me, _ as Z, u as Te, b as De, n as ee, d as Ne, e as Le, f as Me, g as Ie, h as Oe, j as Pe, k as Be, l as Re, m as je, o as Ve, p as Xe } from "./AddPanel.vue_vue_type_script_setup_true_lang-DU8MEpGo.js";
import { _ as he } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
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
function Ue(o) {
  const l = o.content_type || "";
  if (pe[l]) return pe[l];
  const y = o.metadata || {}, i = String(y.filename || y.source_url || y.title || ""), p = i.lastIndexOf(".");
  if (p > 0 && p < i.length - 1) {
    const u = i.slice(p + 1).split(/[?#]/)[0];
    if (u.length <= 5) return u.toUpperCase();
  }
  return y.source_url ? "URL" : l.startsWith("image/") ? "IMG" : "DOC";
}
function be(o) {
  const l = o.content_type || "";
  return (o.metadata || {}).source_url ? "tabler:world" : l === "application/pdf" ? "tabler:file-type-pdf" : l === "text/markdown" ? "tabler:markdown" : l === "text/csv" || l.includes("spreadsheet") || l.includes("excel") ? "tabler:table" : l === "application/json" ? "tabler:json" : l.includes("word") || l.includes("document") ? "tabler:file-text" : l.includes("presentation") || l.includes("powerpoint") ? "tabler:presentation" : l === "text/html" ? "tabler:file-code" : l.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function ye(o) {
  if (!o) return "";
  const l = new Date(o), y = l.getTime();
  if (Number.isNaN(y)) return "";
  const i = Date.now() - y, p = Math.round(i / 1e3);
  if (p < 45) return "just now";
  const u = Math.round(p / 60);
  if (u < 60) return `${u}m ago`;
  const m = Math.round(u / 60);
  if (m < 24) return `${m}h ago`;
  const w = Math.round(m / 24);
  return w < 7 ? `${w}d ago` : l.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function qe(o) {
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
function ze(o, l = {}) {
  const y = h(!1), i = h(""), p = h([]), u = h(0), m = h(50), w = h(0), S = _(() => Math.max(1, Math.ceil(w.value / m.value))), L = _(() => u.value > 0), O = _(() => u.value < S.value - 1), x = h({}), C = h({}), P = 2e4, N = /* @__PURE__ */ new Map();
  function j(e) {
    const t = { ...x.value };
    delete t[e], x.value = t;
    const n = { ...C.value };
    delete n[e], C.value = n;
    const d = N.get(e);
    d && (clearTimeout(d), N.delete(e));
  }
  const Y = /* @__PURE__ */ new Set(["concept", "edge", "chunk", "summary"]);
  function q(e) {
    return Date.parse(e.updated_at || e.created_at || "") || 0;
  }
  function ae(e) {
    const t = /* @__PURE__ */ new Map(), n = [];
    for (const d of e) {
      const k = Ee(d);
      if (!k) {
        n.push(d);
        continue;
      }
      const H = t.get(k);
      if (H === void 0) {
        t.set(k, n.length), n.push(d);
        continue;
      }
      q(d) >= q(n[H]) && (n[H] = d);
    }
    return n;
  }
  const z = _(() => ae(p.value.filter((e) => !Y.has(e.node_type || ""))));
  function B(e) {
    return z.value.find((t) => t.id === e);
  }
  let R = 0;
  async function K() {
    const e = o();
    if (!e) return;
    const t = ++R;
    y.value = !0, i.value = "";
    try {
      const n = u.value * m.value, { data: d } = await oe.get(`/api/v1/kb10/${e}/browse?limit=${m.value}&offset=${n}`);
      if (t !== R || o() !== e) return;
      if (!d?.success) {
        i.value = d?.error && fe(d.error) ? ve : d?.error || "";
        return;
      }
      p.value = d.nodes || [], w.value = Number(d.total) || 0;
    } catch (n) {
      if (t !== R) return;
      const d = n?.response?.data?.error || n?.message || "could not load contents";
      i.value = fe(d) ? ve : d, ue.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
    } finally {
      t === R && (y.value = !1);
    }
  }
  function A(e) {
    const t = Math.max(0, Math.min(e, S.value - 1));
    t !== u.value && (u.value = t, K());
  }
  function g() {
    O.value && A(u.value + 1);
  }
  function V() {
    L.value && A(u.value - 1);
  }
  async function X(e) {
    const t = o();
    if (!t || x.value[e.id]) return !1;
    const n = me(e);
    if (!n)
      return i.value = "This document has no durable source identity and cannot be deleted here.", !1;
    x.value = { ...x.value, [e.id]: !0 }, C.value = { ...C.value, [e.id]: String(n.external_id || "") };
    let d = !1;
    try {
      const { data: k } = await oe.delete(`/api/v1/knowledge/${t}/content`, { data: n });
      k?.success ? (d = !0, i.value = "Delete queued. The row clears once indexing catches up.") : i.value = k?.error || "could not queue delete";
    } catch (k) {
      i.value = k?.response?.data?.error || k?.message || "could not queue delete", ue.handleError(k?.response?.status === 401 ? "auth-expired" : "other", k);
    } finally {
      if (!d)
        j(e.id);
      else {
        const k = e.id;
        N.set(k, setTimeout(() => {
          x.value[k] && (j(k), i.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, P));
      }
    }
    return d;
  }
  function T(e) {
    return String(me(e)?.external_id || "");
  }
  function D() {
    if (Object.keys(C.value).length === 0) return;
    const e = new Set(z.value.map(T).filter(Boolean)), t = { ...x.value }, n = { ...C.value };
    let d = !1;
    for (const [k, H] of Object.entries(C.value))
      if (H && !e.has(H)) {
        delete t[k], delete n[k];
        const de = N.get(k);
        de && (clearTimeout(de), N.delete(k)), d = !0;
      }
    d && (x.value = t, C.value = n, Object.keys(t).length || (i.value = ""), l.onChanged?.());
  }
  let G = !1, M = !1;
  async function le() {
    if (G) {
      M = !0;
      return;
    }
    G = !0;
    try {
      do
        M = !1, await K(), D();
      while (M);
    } finally {
      G = !1;
    }
  }
  let U = null, J = 0;
  function f(e) {
    const t = ++J;
    if (U && (U(), U = null), !e) return;
    const n = Se(e, () => {
      le();
    });
    if (t !== J) {
      n && n();
      return;
    }
    U = n;
  }
  return ie(() => {
    J++, R++, U && U(), N.forEach((e) => clearTimeout(e)), N.clear();
  }), W(o, (e) => {
    u.value = 0, w.value = 0, K(), f(e);
  }, { immediate: !0 }), {
    loading: y,
    notice: i,
    nodes: p,
    documents: z,
    deleting: x,
    load: K,
    reload: K,
    remove: X,
    findDoc: B,
    page: u,
    pageSize: m,
    total: w,
    pageCount: S,
    hasPrev: L,
    hasNext: O,
    next: g,
    prev: V,
    goToPage: A
  };
}
const Ke = { class: "kx-railhead" }, Ae = { class: "kx-railhead-title" }, He = { key: 0 }, Fe = { class: "kx-railhead-acts" }, Ge = /* @__PURE__ */ re({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(o) {
    return (l, y) => (s(), c("div", Ke, [
      r("span", Ae, [
        E(b(o.title), 1),
        o.count !== void 0 ? (s(), c("b", He, b(o.count), 1)) : $("", !0)
      ]),
      r("div", Fe, [
        ke(l.$slots, "actions")
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
  setup(o, { emit: l }) {
    const y = o, i = l;
    function p(u) {
      u.key === "Escape" && !y.busy && i("cancel");
    }
    return W(() => y.open, (u) => {
      u ? window.addEventListener("keydown", p) : window.removeEventListener("keydown", p);
    }), ie(() => window.removeEventListener("keydown", p)), (u, m) => (s(), Q(ge, { name: "kx-modal" }, {
      default: F(() => [
        o.open ? (s(), c("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: m[3] || (m[3] = _e((w) => !o.busy && i("cancel"), ["self"]))
        }, [
          r("div", {
            class: te(["kx-modal", { danger: o.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": o.title
          }, [
            r("div", Je, [
              r("span", Qe, [
                v(a(I), {
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", Ye, [
                r("span", Ze, b(o.title), 1),
                o.subtitle ? (s(), c("span", et, b(o.subtitle), 1)) : $("", !0)
              ]),
              v(Z, {
                icon: "tabler:x",
                label: "Close",
                disabled: o.busy,
                onClick: m[0] || (m[0] = (w) => i("cancel"))
              }, null, 8, ["disabled"])
            ]),
            r("div", tt, [
              ke(u.$slots, "default")
            ]),
            r("div", nt, [
              v(he, {
                variant: "ghost",
                disabled: o.busy,
                onClick: m[1] || (m[1] = (w) => i("cancel"))
              }, {
                default: F(() => [
                  E(b(o.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              v(he, {
                variant: o.danger ? "danger" : "primary",
                loading: o.busy,
                disabled: o.busy,
                onClick: m[2] || (m[2] = (w) => i("confirm"))
              }, {
                default: F(() => [
                  E(b(o.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, We)
        ])) : $("", !0)
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
}, xt = {
  key: 1,
  class: "dr-chunks"
}, $t = {
  key: 0,
  class: "dr-state"
}, Ct = ["aria-expanded", "onClick"], Et = { class: "dr-chunk-n" }, St = { class: "dr-chunk-label" }, Tt = {
  key: 0,
  class: "dr-chunk-cx"
}, Dt = 720, Nt = /* @__PURE__ */ re({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(o) {
    const l = o, y = h(!1), i = h(""), p = h(""), u = h(""), m = h([]), w = h(0), S = h(""), L = h("read"), O = h(!1), x = h({});
    function C(f) {
      return String((f.metadata || {}).contextual_prefix || "");
    }
    const P = _(() => l.node.metadata || {}), N = _(() => P.value.source_url), j = _(() => u.value || l.node.content_type || "text/markdown"), Y = _(() => String(P.value.original_mime_type || P.value.source_mime || "")), q = _(() => Te(P.value) ? De(Y.value || l.node.content_type || "") : !1), ae = _(() => `/api/v1/kb10/${l.kbId}/nodes/${l.node.id}/source`), z = _(() => String(P.value.filename || P.value.original_filename || "")), B = _(() => p.value ? p.value : m.value.map((f) => f.content).filter(Boolean).join(`

`)), R = _(() => {
      const f = B.value.trim();
      return f ? f.split(/\s+/).length : 0;
    });
    function K() {
      q.value && (O.value = !O.value);
    }
    const A = h(null), g = h(!1), V = h(!1);
    function X() {
      const f = A.value;
      if (!f) {
        V.value = !1;
        return;
      }
      V.value = f.scrollHeight - Dt > 24;
    }
    let T = null;
    function D() {
      T?.disconnect();
      const f = A.value;
      f && (T = new ResizeObserver(() => X()), T.observe(f), ce(X));
    }
    const G = _(() => V.value && !g.value);
    let M = 0;
    async function le() {
      if (!l.kbId || !l.node?.id) return;
      const f = ++M;
      y.value = !0, i.value = "", p.value = "", u.value = "", m.value = [], w.value = 0, S.value = "", L.value = "read", x.value = {}, g.value = !1, V.value = !1;
      try {
        const [{ data: e }, { data: t }, { data: n }] = await Promise.all([
          oe.get(`/api/v1/kb10/${l.kbId}/browse?node_id=${l.node.id}`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=chunk&include_content=true&limit=200`),
          oe.get(`/api/v1/kb10/${l.kbId}/browse?parent_id=${l.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (f !== M) return;
        if (e?.success && e.node && (p.value = String(e.node.content || ""), u.value = String(e.node.content_type || "")), t?.success) {
          if (!Number.isInteger(t.total) || t.total < 0) throw new Error("Invalid chunk total");
          w.value = t.total;
          const d = t.nodes;
          if (m.value = d.filter((k) => k.node_type === "chunk").sort((k, H) => Number((k.metadata || {}).index ?? (k.metadata || {}).chunk_index ?? 0) - Number((H.metadata || {}).index ?? (H.metadata || {}).chunk_index ?? 0)), !n?.success) throw new Error(n?.error || "could not load summary");
          S.value = n.nodes[0]?.content || "", p.value || (p.value = S.value || l.node.content || "");
        }
        !e?.success && !t?.success && (i.value = e?.error || t?.error || "could not load document");
      } catch (e) {
        if (f !== M) return;
        i.value = e?.response?.data?.error || e?.message || "could not load document", ue.handleError(e?.response?.status === 401 ? "auth-expired" : "other", e);
      } finally {
        f === M && (y.value = !1);
      }
    }
    const U = _(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: w.value || void 0 }
    ]);
    function J(f) {
      x.value = { ...x.value, [f.id]: !x.value[f.id] };
    }
    return W([B, L, y], () => {
      L.value === "read" && !y.value && ce(D);
    }), W(q, (f) => {
      f || (O.value = !1);
    }), W(() => l.node?.id, () => le(), { immediate: !0 }), ie(() => {
      T?.disconnect();
    }), (f, e) => (s(), c("div", lt, [
      r("header", ot, [
        r("span", st, [
          v(a(I), {
            icon: a(be)(o.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        r("div", it, [
          r("div", rt, [
            r("h2", ut, b(a(ee)(o.node)), 1),
            q.value ? (s(), Q(a(Ne), {
              key: 0,
              class: te(["dr-orig-btn", { on: O.value }]),
              label: O.value ? "Hide original" : "View original",
              onOpen: K
            }, null, 8, ["class", "label"])) : $("", !0)
          ]),
          r("div", dt, [
            w.value ? (s(), c("span", ct, [
              v(a(I), { icon: "tabler:layout-grid" }),
              E(b(w.value.toLocaleString()) + " chunks", 1)
            ])) : $("", !0),
            R.value ? (s(), c("span", vt, [
              v(a(I), { icon: "tabler:align-left" }),
              E(b(R.value.toLocaleString()) + " words", 1)
            ])) : $("", !0),
            o.node.created_at ? (s(), c("span", {
              key: 2,
              class: "dr-fact",
              title: a(qe)(o.node.created_at)
            }, [
              v(a(I), { icon: "tabler:clock" }),
              E(b(a(ye)(o.node.created_at)), 1)
            ], 8, ft)) : $("", !0),
            N.value ? (s(), c("a", {
              key: 3,
              class: "dr-fact link",
              href: N.value,
              target: "_blank",
              rel: "noopener"
            }, [
              v(a(I), { icon: "tabler:external-link" }),
              e[3] || (e[3] = E("Source", -1))
            ], 8, mt)) : $("", !0)
          ])
        ])
      ]),
      v(a(Le), {
        tabs: U.value,
        active: L.value,
        onSelect: e[0] || (e[0] = (t) => L.value = t)
      }, null, 8, ["tabs", "active"]),
      y.value ? (s(), c("div", ht, [
        (s(), c(ne, null, se(6, (t) => r("div", {
          key: t,
          class: "dr-skel-line"
        })), 64))
      ])) : i.value ? (s(), c("div", pt, [
        v(a(I), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        E(" " + b(i.value), 1)
      ])) : (s(), c(ne, { key: 2 }, [
        L.value === "read" ? (s(), c("div", kt, [
          r("div", bt, [
            S.value ? (s(), Q(a(Me), {
              key: 0,
              text: S.value
            }, null, 8, ["text"])) : $("", !0),
            B.value ? (s(), c("div", {
              key: 1,
              class: te(["dr-clamp", { clamped: G.value }])
            }, [
              r("div", {
                ref_key: "bodyRef",
                ref: A,
                class: "dr-clamp-inner"
              }, [
                r("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": j.value,
                  source: B.value,
                  filename: z.value
                }, null, 8, yt)
              ], 512),
              G.value ? (s(), c("div", gt)) : $("", !0)
            ], 2)) : $("", !0),
            V.value ? (s(), c("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": g.value,
              onClick: e[1] || (e[1] = (t) => g.value = !g.value)
            }, [
              v(a(I), {
                icon: g.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              E(" " + b(g.value ? "Show less" : "Show more"), 1)
            ], 8, _t)) : $("", !0),
            B.value ? $("", !0) : (s(), c("div", wt, [
              v(a(I), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              e[4] || (e[4] = E(" No readable content was indexed for this document.", -1))
            ]))
          ])
        ])) : (s(), c("div", xt, [
          m.value.length ? $("", !0) : (s(), c("div", $t, [
            v(a(I), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            e[5] || (e[5] = E(" This document has no chunks.", -1))
          ])),
          (s(!0), c(ne, null, se(m.value, (t, n) => (s(), c("div", {
            key: t.id,
            class: te(["dr-chunk", { open: x.value[t.id] }])
          }, [
            r("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!x.value[t.id],
              onClick: (d) => J(t)
            }, [
              r("span", Et, b(n + 1), 1),
              r("span", St, "Chunk " + b(n + 1), 1),
              v(a(I), {
                class: "dr-chunk-chev",
                icon: x.value[t.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Ct),
            C(t) ? (s(), c("p", Tt, [
              v(a(I), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              r("span", null, b(C(t)), 1)
            ])) : $("", !0),
            r("p", {
              class: te(["dr-chunk-body", { clamp: !x.value[t.id] }])
            }, b(t.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      v(a(Ie), {
        contained: "",
        open: O.value && q.value,
        title: z.value || "Original",
        "content-type": Y.value || o.node.content_type || "",
        "source-url": ae.value,
        filename: z.value,
        onClose: e[2] || (e[2] = (t) => O.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Lt = { class: "kb-page kd" }, Mt = { class: "kd-filter" }, It = {
  class: "kd-list",
  "aria-label": "Documents"
}, Ot = {
  key: 0,
  class: "kd-list-skel"
}, Pt = ["onClick"], Bt = { class: "kd-row-ic" }, Rt = { class: "kd-row-main" }, jt = { class: "kd-row-title" }, Vt = { class: "kd-row-sub" }, Xt = {
  key: 1,
  class: "kd-list-empty"
}, Ut = {
  key: 0,
  class: "kd-pager"
}, qt = { class: "kd-pager-label" }, zt = { class: "kx-main-scroll kd-reader" }, Kt = /* @__PURE__ */ re({
  __name: "KbDocument",
  setup(o) {
    const l = $e(), y = Ce(), i = _(() => l.value.config?.kb_id || ""), p = _(() => l.value.config?.route || "");
    let u = !1;
    const {
      loading: m,
      notice: w,
      documents: S,
      deleting: L,
      reload: O,
      remove: x,
      findDoc: C,
      page: P,
      pageSize: N,
      total: j,
      hasPrev: Y,
      hasNext: q,
      next: ae,
      prev: z
    } = ze(() => i.value), B = h(""), R = _(() => {
      const e = B.value.trim().toLowerCase();
      return e ? S.value.filter((t) => ee(t).toLowerCase().includes(e)) : S.value;
    }), K = _(() => j.value === 0 ? 0 : P.value * N.value + 1), A = _(() => Math.min((P.value + 1) * N.value, j.value)), g = h(""), V = _(() => C(g.value) || null), X = h(!1), T = h(!1), D = h(null), G = _(() => !!D.value && !!L.value[D.value.id]);
    function M(e) {
      const t = g.value !== e.id;
      g.value = e.id, t && !u && y("navigate", e.id);
    }
    function le(e) {
      const t = C(e);
      t && (M(t), T.value = !1);
    }
    function U(e) {
      D.value = e;
    }
    async function J() {
      const e = D.value;
      if (!e) return;
      await x(e) && (g.value === e.id && (g.value = ""), D.value = null);
    }
    function f(e) {
      e.key === "Escape" && T.value && (T.value = !1);
    }
    return we(() => {
      window.addEventListener("keydown", f), xe("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), ie(() => window.removeEventListener("keydown", f)), W(S, (e) => {
      if (!e.length) {
        g.value && !C(g.value) && (g.value = "");
        return;
      }
      if (g.value && C(g.value)) return;
      const n = (p.value ? e.find((d) => d.id === p.value) : null) || e[0];
      if (n) {
        u = !0;
        try {
          M(n);
        } finally {
          u = !1;
        }
      }
    }), W(i, () => {
      g.value = "";
    }), W(p, (e) => {
      if (!e || e === g.value) return;
      const t = C(e);
      if (t) {
        u = !0;
        try {
          M(t);
        } finally {
          u = !1;
        }
      }
    }), (e, t) => (s(), c("div", Lt, [
      a(w) ? (s(), Q(a(Oe), {
        key: 0,
        class: "kd-notice"
      }, {
        default: F(() => [
          E(b(a(w)), 1)
        ]),
        _: 1
      })) : $("", !0),
      v(a(Pe), null, {
        rail: F(() => [
          v(a(Ge), {
            title: "Documents",
            count: a(j)
          }, {
            actions: F(() => [
              v(a(Z), {
                icon: "tabler:search",
                label: "Search",
                active: T.value,
                onClick: t[0] || (t[0] = (n) => T.value = !T.value)
              }, null, 8, ["active"]),
              v(a(Z), {
                icon: "tabler:plus",
                label: "Add document",
                active: X.value,
                onClick: t[1] || (t[1] = (n) => X.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["count"]),
          r("div", Mt, [
            v(a(je), {
              modelValue: B.value,
              "onUpdate:modelValue": t[2] || (t[2] = (n) => B.value = n),
              placeholder: "Filter documents…"
            }, null, 8, ["modelValue"])
          ]),
          r("nav", It, [
            a(m) && !a(S).length ? (s(), c("div", Ot, [
              (s(), c(ne, null, se(6, (n) => r("div", {
                key: n,
                class: "kd-skel-row"
              })), 64))
            ])) : $("", !0),
            (s(!0), c(ne, null, se(R.value, (n) => (s(), c("button", {
              key: n.id,
              class: te(["kd-row", { on: g.value === n.id }]),
              onClick: (d) => M(n)
            }, [
              r("span", Bt, [
                v(a(I), {
                  icon: a(be)(n),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("span", Rt, [
                r("span", jt, b(a(ee)(n)), 1),
                r("span", Vt, [
                  E(b(a(Ue)(n)), 1),
                  n.created_at ? (s(), c(ne, { key: 0 }, [
                    E(" · " + b(a(ye)(n.created_at)), 1)
                  ], 64)) : $("", !0)
                ])
              ]),
              v(a(Z), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${a(ee)(n)}`,
                variant: "danger",
                size: "sm",
                spin: !!a(L)[n.id],
                disabled: !!a(L)[n.id],
                onClick: (d) => U(n)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 10, Pt))), 128)),
            !a(m) && !R.value.length ? (s(), c("div", Xt, b(a(S).length ? "No documents match." : "No documents yet — add one with +."), 1)) : $("", !0)
          ]),
          a(j) > a(N) ? (s(), c("div", Ut, [
            v(a(Z), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !a(Y),
              onClick: a(z)
            }, null, 8, ["disabled", "onClick"]),
            r("span", qt, b(K.value) + "–" + b(A.value) + " of " + b(a(j)), 1),
            v(a(Z), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !a(q),
              onClick: a(ae)
            }, null, 8, ["disabled", "onClick"])
          ])) : $("", !0)
        ]),
        default: F(() => [
          r("div", zt, [
            T.value ? (s(), Q(a(Be), {
              key: 0,
              "kb-id": i.value,
              layout: "panel",
              ask: "",
              onOpen: t[3] || (t[3] = (n) => n.parent_id && le(n.parent_id)),
              onClose: t[4] || (t[4] = (n) => T.value = !1)
            }, null, 8, ["kb-id"])) : V.value ? (s(), Q(Nt, {
              key: 1,
              "kb-id": i.value,
              node: V.value
            }, null, 8, ["kb-id", "node"])) : (s(), Q(Re, {
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
      v(a(Ve), {
        open: X.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: t[6] || (t[6] = (n) => X.value = !1)
      }, {
        default: F(() => [
          v(Xe, {
            "kb-id": i.value,
            noun: "document",
            onChanged: t[5] || (t[5] = (n) => {
              X.value = !1, a(O)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      v(a(at), {
        open: !!D.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: D.value ? a(ee)(D.value) : "",
        "confirm-label": "Delete",
        busy: G.value,
        onCancel: t[7] || (t[7] = (n) => D.value = null),
        onConfirm: J
      }, {
        default: F(() => [
          t[8] || (t[8] = E(" Remove ", -1)),
          r("strong", null, b(D.value ? a(ee)(D.value) : ""), 1),
          t[9] || (t[9] = E(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), Qt = {
  rootComponent: Kt
};
export {
  Qt as mountConfig
};
//# sourceMappingURL=document-mount-D-GLt4tH.js.map
