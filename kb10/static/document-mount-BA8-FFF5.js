import { ref as k, computed as w, onBeforeUnmount as me, watch as ne, defineComponent as pe, openBlock as o, createElementBlock as f, createElementVNode as v, createTextVNode as N, toDisplayString as b, createCommentVNode as _, renderSlot as $e, createBlock as K, Transition as Ie, withCtx as A, withModifiers as De, normalizeClass as de, createVNode as h, unref as e, nextTick as ye, Fragment as te, renderList as fe, onMounted as Re } from "vue";
import { Icon as B } from "@iconify/vue";
import { api as se, host as ke, loadByTagName as Le } from "@wippy-fe/proxy";
import { a as Me, u as Oe } from "./wc-runtime-f54Bo-yJ.js";
import { E as ge, i as _e, f as Pe, s as Be, c as qe, _ as oe, u as Ue, a as Ve, n as ie, b as je, d as Ce, e as ze, g as Xe, h as he, j as Fe, k as Ke, l as Ae, m as He, o as We, p as Ge } from "./AddPanel.vue_vue_type_script_setup_true_lang-HKgspD4a.js";
import { _ as xe } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const we = {
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
function Je(a) {
  const t = a.content_type || "";
  if (we[t]) return we[t];
  const x = a.metadata || {}, d = String(x.filename || x.source_url || x.title || ""), $ = d.lastIndexOf(".");
  if ($ > 0 && $ < d.length - 1) {
    const y = d.slice($ + 1).split(/[?#]/)[0];
    if (y.length <= 5) return y.toUpperCase();
  }
  return x.source_url ? "URL" : t.startsWith("image/") ? "IMG" : "DOC";
}
function Ne(a) {
  const t = a.content_type || "";
  return (a.metadata || {}).source_url ? "tabler:world" : t === "application/pdf" ? "tabler:file-type-pdf" : t === "text/markdown" ? "tabler:markdown" : t === "text/csv" || t.includes("spreadsheet") || t.includes("excel") ? "tabler:table" : t === "application/json" ? "tabler:json" : t.includes("word") || t.includes("document") ? "tabler:file-text" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:presentation" : t === "text/html" ? "tabler:file-code" : t.startsWith("image/") ? "tabler:photo" : "tabler:file-text";
}
function Te(a) {
  if (!a) return "";
  const t = new Date(a), x = t.getTime();
  if (Number.isNaN(x)) return "";
  const d = Date.now() - x, $ = Math.round(d / 1e3);
  if ($ < 45) return "just now";
  const y = Math.round($ / 60);
  if (y < 60) return `${y}m ago`;
  const m = Math.round(y / 60);
  if (m < 24) return `${m}h ago`;
  const g = Math.round(m / 24);
  return g < 7 ? `${g}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function Qe(a) {
  if (!a) return "";
  const t = new Date(a);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Ye = 400;
function Ze(a, t = {}) {
  const x = k(!1), d = k(""), $ = k(""), y = k([]), m = k(0), g = k(50), z = k(0), q = w(() => Math.max(1, Math.ceil(z.value / g.value))), U = w(() => m.value > 0), O = w(() => m.value < q.value - 1), R = k({}), T = 2e4, E = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
  function ee(i) {
    const c = { ...R.value };
    delete c[i], R.value = c;
    const r = E.get(i);
    r && (clearTimeout(r), E.delete(i)), G.delete(i);
  }
  const X = y;
  function ae(i) {
    return X.value.find((c) => c.id === i);
  }
  let P = 0;
  async function V() {
    const i = a();
    if (!i) return;
    const c = ++P;
    x.value = !0, d.value = "";
    try {
      const r = m.value * g.value, n = t.includeIndexing ? "&include_indexing=true" : "", l = t.scope?.(), W = l ? `scope=${l}` : "node_type=document", { data: M } = await se.get(`/api/v1/kb10/${i}/browse?${W}&limit=${g.value}&offset=${r}${n}`);
      if (c !== P || a() !== i) return;
      if (!M?.success) {
        d.value = M?.error && _e(M.error) ? ge : M?.error || "";
        return;
      }
      return y.value = M.nodes || [], z.value = Number(M.total) || 0, $.value = Pe(M.pending_source), !0;
    } catch (r) {
      if (c !== P) return;
      const n = r?.response?.data?.error || r?.message || "could not load contents";
      d.value = _e(n) ? ge : n, ke.handleError(r?.response?.status === 401 ? "auth-expired" : "other", r);
    } finally {
      c === P && (x.value = !1);
    }
  }
  function J(i) {
    const c = Math.max(0, Math.min(i, q.value - 1));
    c !== m.value && (m.value = c, C(), V());
  }
  function Q() {
    O.value && J(m.value + 1);
  }
  function re() {
    U.value && J(m.value - 1);
  }
  async function ce(i) {
    const c = a();
    if (!c || R.value[i.id]) return !1;
    const r = qe(i);
    G.set(i.id, { kbId: c, scope: t.scope?.() }), R.value = { ...R.value, [i.id]: !0 };
    let n = !1;
    try {
      const { data: l } = await se.delete(`/api/v1/knowledge/${c}/content`, { data: r });
      l?.success ? (n = !0, d.value = "Delete queued. The row clears once indexing catches up.") : d.value = l?.error || "could not queue delete";
    } catch (l) {
      d.value = l?.response?.data?.error || l?.message || "could not queue delete", ke.handleError(l?.response?.status === 401 ? "auth-expired" : "other", l);
    } finally {
      if (!n)
        ee(i.id);
      else {
        const l = i.id;
        E.set(l, setTimeout(() => {
          R.value[l] && (ee(l), d.value = "Delete is taking longer than expected — refresh to verify, then retry if it is still listed.");
        }, T));
      }
    }
    return n;
  }
  function H() {
    const i = Object.keys(R.value);
    if (i.length === 0) return;
    const c = new Set(y.value.map((n) => n.id)), r = i.filter((n) => {
      const l = G.get(n);
      return l?.kbId === a() && l.scope === t.scope?.() && !c.has(n);
    });
    if (r.length) {
      for (const n of r) ee(n);
      Object.keys(R.value).length || (d.value = ""), t.onChanged?.();
    }
  }
  let I, F = !1, Y = !1;
  function C() {
    I !== void 0 && clearTimeout(I), I = void 0, Y = !1;
  }
  function D() {
    if (a()) {
      if (F) {
        Y = !0;
        return;
      }
      I === void 0 && (I = setTimeout(async () => {
        I = void 0, F = !0;
        try {
          await V() && H();
        } finally {
          F = !1;
          const i = Y;
          Y = !1, i && D();
        }
      }, Ye));
    }
  }
  let j = null, L = 0;
  function Z(i) {
    const c = ++L;
    if (j && (j(), j = null), !i) return;
    const r = Be(i, () => {
      c === L && D();
    });
    if (c !== L) {
      r && r();
      return;
    }
    j = r;
  }
  return me(() => {
    L++, C(), P++, j && j(), E.forEach((i) => clearTimeout(i)), E.clear();
  }), ne([a, () => t.scope?.()], ([i], [c]) => {
    C(), m.value = 0, z.value = 0, y.value = [], $.value = "", V(), i !== c && Z(i);
  }, { immediate: !0 }), {
    loading: x,
    notice: d,
    indexingNotice: $,
    nodes: y,
    documents: X,
    deleting: R,
    load: V,
    reload: V,
    remove: ce,
    findDoc: ae,
    page: m,
    pageSize: g,
    total: z,
    pageCount: q,
    hasPrev: U,
    hasNext: O,
    next: Q,
    prev: re,
    goToPage: J,
    scheduleRefresh: D
  };
}
const et = { class: "kx-railhead" }, tt = { class: "kx-railhead-title" }, nt = { key: 0 }, at = { class: "kx-railhead-acts" }, lt = /* @__PURE__ */ pe({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(a) {
    return (t, x) => (o(), f("div", et, [
      v("span", tt, [
        N(b(a.title), 1),
        a.count !== void 0 ? (o(), f("b", nt, b(a.count), 1)) : _("", !0)
      ]),
      v("div", at, [
        $e(t.$slots, "actions")
      ])
    ]));
  }
}), ot = ["aria-label"], it = { class: "kx-modal-h" }, st = { class: "kx-modal-h-ico" }, rt = { class: "kx-modal-h-text" }, ut = { class: "kx-modal-h-title" }, dt = {
  key: 0,
  class: "kx-modal-h-sub"
}, ct = { class: "kx-modal-body" }, vt = { class: "kx-modal-foot" }, ft = /* @__PURE__ */ pe({
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
  setup(a, { emit: t }) {
    const x = a, d = t;
    function $(y) {
      y.key === "Escape" && !x.busy && d("cancel");
    }
    return ne(() => x.open, (y) => {
      y ? window.addEventListener("keydown", $) : window.removeEventListener("keydown", $);
    }), me(() => window.removeEventListener("keydown", $)), (y, m) => (o(), K(Ie, { name: "kx-modal" }, {
      default: A(() => [
        a.open ? (o(), f("div", {
          key: 0,
          class: "kx-modal-mask",
          onClick: m[3] || (m[3] = De((g) => !a.busy && d("cancel"), ["self"]))
        }, [
          v("div", {
            class: de(["kx-modal", { danger: a.danger }]),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": a.title
          }, [
            v("div", it, [
              v("span", st, [
                h(e(B), {
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              v("span", rt, [
                v("span", ut, b(a.title), 1),
                a.subtitle ? (o(), f("span", dt, b(a.subtitle), 1)) : _("", !0)
              ]),
              h(oe, {
                icon: "tabler:x",
                label: "Close",
                disabled: a.busy,
                onClick: m[0] || (m[0] = (g) => d("cancel"))
              }, null, 8, ["disabled"])
            ]),
            v("div", ct, [
              $e(y.$slots, "default")
            ]),
            v("div", vt, [
              h(xe, {
                variant: "ghost",
                disabled: a.busy,
                onClick: m[1] || (m[1] = (g) => d("cancel"))
              }, {
                default: A(() => [
                  N(b(a.cancelLabel), 1)
                ]),
                _: 1
              }, 8, ["disabled"]),
              h(xe, {
                variant: a.danger ? "danger" : "primary",
                loading: a.busy,
                disabled: a.busy,
                onClick: m[2] || (m[2] = (g) => d("confirm"))
              }, {
                default: A(() => [
                  N(b(a.confirmLabel), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading", "disabled"])
            ])
          ], 10, ot)
        ])) : _("", !0)
      ]),
      _: 3
    }));
  }
}), mt = { class: "dr" }, pt = { class: "dr-head" }, ht = { class: "dr-badge" }, kt = { class: "dr-head-body" }, bt = { class: "dr-head-top" }, yt = { class: "dr-title" }, gt = { class: "dr-facts" }, _t = {
  key: 0,
  class: "dr-fact"
}, xt = {
  key: 1,
  class: "dr-fact"
}, wt = ["title"], $t = ["href"], Ct = {
  key: 0,
  class: "dr-state err",
  role: "status"
}, Nt = { key: 0 }, Tt = {
  key: 1,
  class: "dr-skel"
}, St = {
  key: 2,
  class: "dr-state err"
}, Et = {
  key: 0,
  class: "dr-doc"
}, It = { class: "dr-doc-main" }, Dt = ["content-type", "source", "filename"], Rt = {
  key: 0,
  class: "dr-clamp-fade",
  "aria-hidden": "true"
}, Lt = ["aria-expanded"], Mt = {
  key: 3,
  class: "dr-state"
}, Ot = {
  key: 1,
  class: "dr-chunks"
}, Pt = {
  key: 0,
  class: "dr-state"
}, Bt = ["aria-expanded", "onClick"], qt = { class: "dr-chunk-n" }, Ut = { class: "dr-chunk-label" }, Vt = {
  key: 0,
  class: "dr-chunk-cx"
}, jt = 720, zt = /* @__PURE__ */ pe({
  __name: "DocReader",
  props: {
    kbId: {},
    node: {}
  },
  setup(a) {
    const t = a, x = k(!1), d = k(""), $ = k(""), y = k(""), m = k([]), g = k(0), z = k(""), q = k("read"), U = k(!1), O = k({});
    function R(r) {
      return String((r.metadata || {}).contextual_prefix || "");
    }
    const T = w(() => t.node.metadata || {}), E = w(() => T.value.status === "failed"), G = w(() => typeof T.value.error == "string" ? T.value.error.trim() : ""), ee = w(() => T.value.source_url), X = w(() => y.value || t.node.content_type || "text/markdown"), ae = w(() => String(T.value.original_mime_type || T.value.source_mime || "")), P = w(() => Ue(T.value) ? Ve(ae.value || t.node.content_type || "") : !1), V = w(() => `/api/v1/kb10/${t.kbId}/nodes/${t.node.id}/source`), J = w(() => String(T.value.filename || T.value.original_filename || "")), Q = w(() => $.value ? $.value : m.value.map((r) => r.content).filter(Boolean).join(`

`)), re = w(() => {
      const r = Q.value.trim();
      return r ? r.split(/\s+/).length : 0;
    });
    function ce() {
      P.value && (U.value = !U.value);
    }
    const H = k(null), I = k(!1), F = k(!1);
    function Y() {
      const r = H.value;
      if (!r) {
        F.value = !1;
        return;
      }
      F.value = r.scrollHeight - jt > 24;
    }
    let C = null;
    function D() {
      C?.disconnect();
      const r = H.value;
      r && (C = new ResizeObserver(() => Y()), C.observe(r), ye(Y));
    }
    const j = w(() => F.value && !I.value);
    let L = 0;
    async function Z() {
      if (!t.kbId || !t.node?.id) return;
      const r = ++L;
      x.value = !0, d.value = "", $.value = "", y.value = "", m.value = [], g.value = 0, z.value = "", q.value = "read", O.value = {}, I.value = !1, F.value = !1;
      try {
        const [{ data: n }, { data: l }, { data: W }] = await Promise.all([
          se.get(`/api/v1/kb10/${t.kbId}/browse?node_id=${t.node.id}`),
          se.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=chunk&include_content=true&limit=200`),
          se.get(`/api/v1/kb10/${t.kbId}/browse?parent_id=${t.node.id}&node_type=summary&include_content=true&limit=1`)
        ]);
        if (r !== L) return;
        if (n?.success && n.node && ($.value = String(n.node.content || ""), y.value = String(n.node.content_type || "")), l?.success) {
          if (!Number.isInteger(l.total) || l.total < 0) throw new Error("Invalid chunk total");
          g.value = l.total;
          const M = l.nodes;
          if (m.value = M.filter((ue) => ue.node_type === "chunk").sort((ue, ve) => Number((ue.metadata || {}).index ?? (ue.metadata || {}).chunk_index ?? 0) - Number((ve.metadata || {}).index ?? (ve.metadata || {}).chunk_index ?? 0)), !W?.success) throw new Error(W?.error || "could not load summary");
          z.value = W.nodes[0]?.content || "", $.value || ($.value = z.value || t.node.content || "");
        }
        !n?.success && !l?.success && (d.value = n?.error || l?.error || "could not load document");
      } catch (n) {
        if (r !== L) return;
        d.value = n?.response?.data?.error || n?.message || "could not load document", ke.handleError(n?.response?.status === 401 ? "auth-expired" : "other", n);
      } finally {
        r === L && (x.value = !1);
      }
    }
    const i = w(() => [
      { id: "read", label: "Read", icon: "tabler:book-2" },
      { id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: g.value || void 0 }
    ]);
    function c(r) {
      O.value = { ...O.value, [r.id]: !O.value[r.id] };
    }
    return ne([Q, q, x], () => {
      q.value === "read" && !x.value && ye(D);
    }), ne(P, (r) => {
      r || (U.value = !1);
    }), ne(() => t.node?.id, () => Z(), { immediate: !0 }), me(() => {
      C?.disconnect();
    }), (r, n) => (o(), f("div", mt, [
      v("header", pt, [
        v("span", ht, [
          h(e(B), {
            icon: e(Ne)(a.node),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        v("div", kt, [
          v("div", bt, [
            v("h2", yt, b(e(ie)(a.node)), 1),
            P.value ? (o(), K(e(je), {
              key: 0,
              class: de(["dr-orig-btn", { on: U.value }]),
              label: U.value ? "Hide original" : "View original",
              onOpen: ce
            }, null, 8, ["class", "label"])) : _("", !0)
          ]),
          v("div", gt, [
            g.value ? (o(), f("span", _t, [
              h(e(B), { icon: "tabler:layout-grid" }),
              N(b(g.value.toLocaleString()) + " chunks", 1)
            ])) : _("", !0),
            re.value ? (o(), f("span", xt, [
              h(e(B), { icon: "tabler:align-left" }),
              N(b(re.value.toLocaleString()) + " words", 1)
            ])) : _("", !0),
            a.node.created_at ? (o(), f("span", {
              key: 2,
              class: "dr-fact",
              title: e(Qe)(a.node.created_at)
            }, [
              h(e(B), { icon: "tabler:clock" }),
              N(b(e(Te)(a.node.created_at)), 1)
            ], 8, wt)) : _("", !0),
            ee.value ? (o(), f("a", {
              key: 3,
              class: "dr-fact link",
              href: ee.value,
              target: "_blank",
              rel: "noopener"
            }, [
              h(e(B), { icon: "tabler:external-link" }),
              n[3] || (n[3] = N("Source", -1))
            ], 8, $t)) : _("", !0)
          ])
        ])
      ]),
      E.value ? (o(), f("div", Ct, [
        h(e(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        v("span", null, [
          n[4] || (n[4] = N("Indexing failed", -1)),
          G.value ? (o(), f("span", Nt, ": " + b(G.value), 1)) : _("", !0)
        ])
      ])) : _("", !0),
      h(e(Ce), {
        tabs: i.value,
        active: q.value,
        onSelect: n[0] || (n[0] = (l) => q.value = l)
      }, null, 8, ["tabs", "active"]),
      x.value ? (o(), f("div", Tt, [
        (o(), f(te, null, fe(6, (l) => v("div", {
          key: l,
          class: "dr-skel-line"
        })), 64))
      ])) : d.value ? (o(), f("div", St, [
        h(e(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        N(" " + b(d.value), 1)
      ])) : (o(), f(te, { key: 3 }, [
        q.value === "read" ? (o(), f("div", Et, [
          v("div", It, [
            z.value ? (o(), K(e(ze), {
              key: 0,
              text: z.value
            }, null, 8, ["text"])) : _("", !0),
            Q.value ? (o(), f("div", {
              key: 1,
              class: de(["dr-clamp", { clamped: j.value }])
            }, [
              v("div", {
                ref_key: "bodyRef",
                ref: H,
                class: "dr-clamp-inner"
              }, [
                v("wc-resource-view", {
                  class: "dr-rv",
                  "content-type": X.value,
                  source: Q.value,
                  filename: J.value
                }, null, 8, Dt)
              ], 512),
              j.value ? (o(), f("div", Rt)) : _("", !0)
            ], 2)) : _("", !0),
            F.value ? (o(), f("button", {
              key: 2,
              type: "button",
              class: "dr-more",
              "aria-expanded": I.value,
              onClick: n[1] || (n[1] = (l) => I.value = !I.value)
            }, [
              h(e(B), {
                icon: I.value ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(" " + b(I.value ? "Show less" : "Show more"), 1)
            ], 8, Lt)) : _("", !0),
            !Q.value && !E.value ? (o(), f("div", Mt, [
              h(e(B), {
                icon: "tabler:file-off",
                "aria-hidden": "true"
              }),
              n[5] || (n[5] = N(" No readable content was indexed for this document.", -1))
            ])) : _("", !0)
          ])
        ])) : (o(), f("div", Ot, [
          m.value.length ? _("", !0) : (o(), f("div", Pt, [
            h(e(B), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            n[6] || (n[6] = N(" This document has no chunks.", -1))
          ])),
          (o(!0), f(te, null, fe(m.value, (l, W) => (o(), f("div", {
            key: l.id,
            class: de(["dr-chunk", { open: O.value[l.id] }])
          }, [
            v("button", {
              type: "button",
              class: "dr-chunk-h",
              "aria-expanded": !!O.value[l.id],
              onClick: (M) => c(l)
            }, [
              v("span", qt, b(W + 1), 1),
              v("span", Ut, "Chunk " + b(W + 1), 1),
              h(e(B), {
                class: "dr-chunk-chev",
                icon: O.value[l.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 8, Bt),
            R(l) ? (o(), f("p", Vt, [
              h(e(B), {
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              }),
              v("span", null, b(R(l)), 1)
            ])) : _("", !0),
            v("p", {
              class: de(["dr-chunk-body", { clamp: !O.value[l.id] }])
            }, b(l.content), 3)
          ], 2))), 128))
        ]))
      ], 64)),
      h(e(Xe), {
        contained: "",
        open: U.value && P.value,
        title: J.value || "Original",
        "content-type": ae.value || a.node.content_type || "",
        "source-url": V.value,
        filename: J.value,
        onClose: n[2] || (n[2] = (l) => U.value = !1)
      }, null, 8, ["open", "title", "content-type", "source-url", "filename"])
    ]));
  }
}), Xt = { class: "kb-page kd" }, Ft = { class: "kd-filter" }, Kt = ["aria-label"], At = {
  key: 0,
  class: "kd-list-skel"
}, Ht = ["disabled", "onClick"], Wt = { class: "kd-row-ic" }, Gt = { class: "kd-row-main" }, Jt = { class: "kd-row-title" }, Qt = { class: "kd-row-sub" }, Yt = {
  key: 1,
  class: "kd-list-empty"
}, Zt = {
  key: 0,
  class: "kd-pager"
}, en = { class: "kd-pager-label" }, tn = { class: "kx-main-scroll kd-reader" }, nn = /* @__PURE__ */ pe({
  __name: "KbDocument",
  setup(a) {
    const t = Me(), x = Oe(), d = w(() => t.value.config?.kb_id || ""), $ = w(() => t.value.config?.route || "");
    let y = "", m = !1;
    const g = k("documents"), z = [
      { id: "documents", label: "Documents" },
      { id: "failures", label: "Indexing failures" }
    ], q = w(() => g.value === "documents" ? "Documents" : "Indexing failures"), {
      loading: U,
      notice: O,
      indexingNotice: R,
      documents: T,
      deleting: E,
      scheduleRefresh: G,
      remove: ee,
      findDoc: X,
      page: ae,
      pageSize: P,
      total: V,
      hasPrev: J,
      hasNext: Q,
      next: re,
      prev: ce
    } = Ze(() => d.value, { includeIndexing: !0, scope: () => g.value }), H = k(""), I = w(() => {
      const p = H.value.trim().toLowerCase();
      return p ? T.value.filter((s) => ie(s).toLowerCase().includes(p)) : T.value;
    }), F = w(() => V.value === 0 ? 0 : ae.value * P.value + 1), Y = w(() => Math.min((ae.value + 1) * P.value, V.value)), C = k(""), D = k(null), j = w(() => E.value[C.value] ? null : X(C.value) || (D.value?.id === C.value ? D.value : null));
    let L = 0;
    const Z = k(!1), i = k(!1), c = k(null), r = w(() => !!c.value && !!E.value[c.value.id]), n = k(""), l = k({});
    async function W(p) {
      const s = d.value, u = p.retry_source_event_id;
      if (!(!s || !u || l.value[u])) {
        l.value[u] = !0, n.value = "";
        try {
          const { data: S } = await se.post(`/api/v1/knowledge/${encodeURIComponent(s)}/retry-source`, {
            node_id: p.id,
            failed_event_id: u
          });
          if (s !== d.value) return;
          if (!S?.success) throw new Error(S?.error || "Could not retry indexing");
          n.value = "Indexing retry requested.", G();
        } catch (S) {
          if (s !== d.value) return;
          n.value = S?.response?.data?.error || S?.message || "Could not retry indexing";
        } finally {
          s === d.value && delete l.value[u];
        }
      }
    }
    function M(p) {
      if (E.value[p.id]) return;
      const s = C.value !== p.id;
      C.value = p.id, s && !m && (y = p.id, x("navigate", p.id));
    }
    function ue(p) {
      const s = X(p);
      s && (M(s), i.value = !1);
    }
    function ve(p) {
      p !== g.value && (L++, i.value = !1, n.value = "", C.value = "", D.value = null, H.value = "", g.value = p === "failures" ? "failures" : "documents");
    }
    function Se(p) {
      c.value = p;
    }
    async function Ee() {
      const p = c.value;
      if (!p) return;
      await ee(p) && (C.value === p.id && (C.value = ""), D.value?.id === p.id && (D.value = null), y === p.id && (L++, y = "", x("navigate", "")), c.value = null);
    }
    function be(p) {
      p.key === "Escape" && i.value && (i.value = !1);
    }
    return Re(() => {
      window.addEventListener("keydown", be), Le("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), me(() => {
      L++, window.removeEventListener("keydown", be);
    }), ne(T, (p) => {
      if (D.value && X(D.value.id) && (D.value = null), j.value) return;
      const s = p.filter((le) => !E.value[le.id]), S = s.find((le) => le.id === y) || s[0];
      if (S) {
        m = !0;
        try {
          M(S);
        } finally {
          m = !1;
        }
      } else X(C.value) || (C.value = "");
    }), ne(d, () => {
      C.value = "", n.value = "", l.value = {};
    }), ne([d, $], async ([p, s]) => {
      y = s;
      const u = ++L;
      if (D.value?.id !== s && (D.value = null), !p || !s || s === C.value) return;
      let S = X(s);
      if (!S)
        try {
          const { data: le } = await se.get(`/api/v1/kb10/${p}/browse?node_id=${encodeURIComponent(s)}`);
          if (u !== L || le?.node?.node_type !== "document" || le.node.parent_id) return;
          S = le.node;
        } catch {
          return;
        }
      ve(S.metadata?.status === "failed" ? "failures" : "documents"), D.value = X(S.id) ? null : S, m = !0;
      try {
        M(S);
      } finally {
        m = !1;
      }
    }, { immediate: !0 }), (p, s) => (o(), f("div", Xt, [
      e(O) ? (o(), K(e(he), {
        key: 0,
        class: "kd-notice"
      }, {
        default: A(() => [
          N(b(e(O)), 1)
        ]),
        _: 1
      })) : _("", !0),
      e(R) ? (o(), K(e(he), {
        key: 1,
        class: "kd-notice",
        role: "status"
      }, {
        default: A(() => [
          N(b(e(R)), 1)
        ]),
        _: 1
      })) : _("", !0),
      n.value ? (o(), K(e(he), {
        key: 2,
        class: "kd-notice",
        role: "status"
      }, {
        default: A(() => [
          N(b(n.value), 1)
        ]),
        _: 1
      })) : _("", !0),
      h(e(Fe), null, {
        rail: A(() => [
          h(e(lt), {
            title: q.value,
            count: e(V)
          }, {
            actions: A(() => [
              g.value === "documents" ? (o(), K(e(oe), {
                key: 0,
                icon: "tabler:search",
                label: "Search",
                active: i.value,
                onClick: s[0] || (s[0] = (u) => i.value = !i.value)
              }, null, 8, ["active"])) : _("", !0),
              h(e(oe), {
                icon: "tabler:plus",
                label: "Add document",
                active: Z.value,
                onClick: s[1] || (s[1] = (u) => Z.value = !0)
              }, null, 8, ["active"])
            ]),
            _: 1
          }, 8, ["title", "count"]),
          h(e(Ce), {
            tabs: z,
            active: g.value,
            onSelect: ve
          }, null, 8, ["active"]),
          v("div", Ft, [
            h(e(He), {
              modelValue: H.value,
              "onUpdate:modelValue": s[2] || (s[2] = (u) => H.value = u),
              placeholder: g.value === "failures" ? "Filter indexing failures…" : "Filter documents…"
            }, null, 8, ["modelValue", "placeholder"])
          ]),
          v("nav", {
            class: "kd-list",
            "aria-label": q.value
          }, [
            e(U) && !e(T).length ? (o(), f("div", At, [
              (o(), f(te, null, fe(6, (u) => v("div", {
                key: u,
                class: "kd-skel-row"
              })), 64))
            ])) : _("", !0),
            (o(!0), f(te, null, fe(I.value, (u) => (o(), f("div", {
              key: u.id,
              class: de(["kd-row", { on: C.value === u.id }])
            }, [
              v("button", {
                class: "kd-row-select",
                type: "button",
                disabled: !!e(E)[u.id],
                onClick: (S) => M(u)
              }, [
                v("span", Wt, [
                  h(e(B), {
                    icon: e(Ne)(u),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                v("span", Gt, [
                  v("span", Jt, b(e(ie)(u)), 1),
                  v("span", Qt, [
                    N(b(e(Je)(u)), 1),
                    u.created_at ? (o(), f(te, { key: 0 }, [
                      N(" · " + b(e(Te)(u.created_at)), 1)
                    ], 64)) : _("", !0)
                  ])
                ])
              ], 8, Ht),
              u.retry_source_event_id ? (o(), K(e(oe), {
                key: 0,
                icon: "tabler:refresh",
                label: `Retry indexing ${e(ie)(u)}`,
                size: "sm",
                spin: !!l.value[u.retry_source_event_id],
                disabled: !!l.value[u.retry_source_event_id] || !!e(E)[u.id],
                onClick: (S) => W(u)
              }, null, 8, ["label", "spin", "disabled", "onClick"])) : _("", !0),
              h(e(oe), {
                class: "kd-row-del",
                icon: "tabler:trash",
                label: `Delete ${e(ie)(u)}`,
                variant: "danger",
                size: "sm",
                spin: !!e(E)[u.id],
                disabled: !!e(E)[u.id],
                onClick: (S) => Se(u)
              }, null, 8, ["label", "spin", "disabled", "onClick"])
            ], 2))), 128)),
            !e(U) && !I.value.length ? (o(), f("div", Yt, [
              g.value === "failures" ? (o(), f(te, { key: 0 }, [
                N(b(e(T).length ? "No indexing failures match." : "No indexing failures."), 1)
              ], 64)) : (o(), f(te, { key: 1 }, [
                N(b(e(T).length ? "No documents match." : "No documents yet — add one with +."), 1)
              ], 64))
            ])) : _("", !0)
          ], 8, Kt),
          e(V) > e(P) ? (o(), f("div", Zt, [
            h(e(oe), {
              icon: "tabler:chevron-left",
              label: "Previous page",
              size: "sm",
              disabled: !e(J),
              onClick: e(ce)
            }, null, 8, ["disabled", "onClick"]),
            v("span", en, b(F.value) + "–" + b(Y.value) + " of " + b(e(V)), 1),
            h(e(oe), {
              icon: "tabler:chevron-right",
              label: "Next page",
              size: "sm",
              disabled: !e(Q),
              onClick: e(re)
            }, null, 8, ["disabled", "onClick"])
          ])) : _("", !0)
        ]),
        default: A(() => [
          v("div", tn, [
            i.value ? (o(), K(e(Ke), {
              key: 0,
              "kb-id": d.value,
              layout: "panel",
              ask: "",
              onOpen: s[3] || (s[3] = (u) => u.parent_id && ue(u.parent_id)),
              onClose: s[4] || (s[4] = (u) => i.value = !1)
            }, null, 8, ["kb-id"])) : j.value ? (o(), K(zt, {
              key: 1,
              "kb-id": d.value,
              node: j.value
            }, null, 8, ["kb-id", "node"])) : (o(), K(Ae, {
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
      h(e(We), {
        open: Z.value,
        title: "Add to library",
        icon: "tabler:plus",
        onClose: s[6] || (s[6] = (u) => Z.value = !1)
      }, {
        default: A(() => [
          h(Ge, {
            "kb-id": d.value,
            noun: "document",
            onChanged: s[5] || (s[5] = (u) => {
              u && (Z.value = !1), e(G)();
            })
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      h(e(ft), {
        open: !!c.value,
        danger: "",
        icon: "tabler:trash",
        title: "Delete document",
        subtitle: c.value ? e(ie)(c.value) : "",
        "confirm-label": "Delete",
        busy: r.value,
        onCancel: s[7] || (s[7] = (u) => c.value = null),
        onConfirm: Ee
      }, {
        default: A(() => [
          s[8] || (s[8] = N(" Remove ", -1)),
          v("strong", null, b(c.value ? e(ie)(c.value) : ""), 1),
          s[9] || (s[9] = N(" from this library? It and its indexed chunks are deleted; the change applies once indexing catches up. ", -1))
        ]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ]));
  }
}), dn = {
  rootComponent: nn
};
export {
  dn as mountConfig
};
