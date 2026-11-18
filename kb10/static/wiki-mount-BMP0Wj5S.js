import { defineComponent as $e, openBlock as t, createElementBlock as a, toDisplayString as F, createElementVNode as l, createVNode as $, unref as m, createCommentVNode as R, ref as T, computed as O, watch as re, onMounted as ct, createBlock as se, normalizeClass as ke, Fragment as ee, renderList as ve, createTextVNode as ae, normalizeStyle as _e, withModifiers as Re, withDirectives as Fe, vModelText as Ge, vModelSelect as ut, withCtx as ge, onBeforeUnmount as Ze, onUnmounted as Nt, nextTick as st, createStaticVNode as At, Transition as Ye, vModelCheckbox as Bt } from "vue";
import { loadByTagName as at, api as Ie, host as Ue } from "@wippy-fe/proxy";
import { a as Ut, u as zt } from "./wc-runtime-f54Bo-yJ.js";
import { r as Pt, t as Vt, v as Wt, d as bt, e as Ht, f as kt, w as Ee, x as it, y as ot, g as xt, u as wt, b as _t, _ as Te, z as dt, A as $t, B as Xt, C as Yt, D as Kt, F as Gt, k as Ct, l as It, m as Mt, p as Ke, q as St, G as jt, H as vt, I as Zt, N as ft, J as Qt, h as Jt, j as lt, E as pt, i as gt, s as qt } from "./AddPanel.vue_vue_type_script_setup_true_lang-CXZFt2Ha.js";
import { Icon as z } from "@iconify/vue";
import { _ as je, c as en } from "./queryMode-B1MoVAIk.js";
const tn = { class: "kx-count" }, nn = /* @__PURE__ */ $e({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(s) {
    return (r, e) => (t(), a("span", tn, F(s.value), 1));
  }
}), on = { class: "kx-loading kx-loading-centered" }, ln = { class: "kx-loading-inner" }, sn = { key: 0 }, an = /* @__PURE__ */ $e({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(s) {
    return (r, e) => (t(), a("div", on, [
      l("div", ln, [
        $(m(z), {
          icon: s.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        s.label ? (t(), a("span", sn, F(s.label), 1)) : R("", !0)
      ])
    ]));
  }
}), cn = {
  key: 0,
  class: "wr"
}, rn = {
  key: 0,
  class: "wr-head"
}, un = {
  key: 0,
  class: "wr-title-row"
}, dn = { class: "wr-title" }, vn = {
  key: 1,
  class: "wr-lede"
}, fn = {
  key: 1,
  class: "wr-state"
}, pn = {
  key: 2,
  class: "wr-state err"
}, gn = {
  key: 1,
  class: "wr-doc"
}, mn = {
  key: 0,
  class: "wr-doc-head"
}, hn = { class: "wr-doc-sep" }, yn = ["aria-expanded", "onClick"], bn = ["source"], kn = {
  key: 3,
  class: "wr-prov"
}, xn = { class: "wr-prov-k" }, wn = ["href"], _n = {
  key: 1,
  class: "wr-prov-v"
}, $n = {
  key: 4,
  class: "wr-doc-rule"
}, Cn = {
  key: 2,
  class: "wr-chunks"
}, In = {
  key: 0,
  class: "wr-doc-sep"
}, Mn = ["aria-expanded", "onClick"], Sn = { class: "wr-chunk-n" }, Rn = { class: "wr-chunk-label" }, On = {
  key: 0,
  class: "wr-chunk-cx"
}, Tn = {
  key: 3,
  class: "wr-grid"
}, En = ["onClick"], Dn = { class: "wr-card-top" }, Ln = { class: "wr-card-ic" }, Fn = { class: "wr-card-name" }, Nn = {
  key: 0,
  class: "wr-card-desc"
}, An = { class: "wr-card-meta" }, Bn = { key: 0 }, Un = { key: 1 }, zn = { key: 2 }, Pn = {
  key: 4,
  class: "wr-state muted"
}, Vn = {
  key: 5,
  class: "wr-foot"
}, Wn = {
  key: 0,
  class: "wr-foot-group"
}, Hn = { class: "wr-foot-links" }, Xn = ["onClick"], Yn = {
  key: 1,
  class: "wr-foot-group"
}, Kn = { class: "wr-foot-links" }, Gn = ["onClick"], jn = { class: "wr-foot-kind" }, Zn = /* @__PURE__ */ $e({
  __name: "WikiReader",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    conceptsById: {}
  },
  emits: ["navigate"],
  setup(s, { emit: r }) {
    const e = s, o = r;
    function f(i) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(i)}/source`;
    }
    const u = T(!1), I = T(""), b = T([]), x = T([]), _ = T({}), N = T("rendered"), S = T(null), A = O(() => x.value.reduce((i, p) => i + p.chunks.length, 0)), P = O(() => {
      const i = /* @__PURE__ */ new Map();
      for (const p of x.value) p.summary && i.set(p.id, p.summary);
      return i;
    }), W = O(() => A.value > 0 || x.value.some((i) => i.summary));
    function j(i) {
      _.value = { ..._.value, [i]: !_.value[i] };
    }
    const D = T({}), H = O(() => b.value.length > 1);
    function y(i) {
      return !H.value || !!D.value[i];
    }
    function d(i) {
      D.value = { ...D.value, [i]: !D.value[i] };
    }
    re(b, () => {
      D.value = {};
    });
    const C = O(() => Pt(e.concept, e.edges)), E = O(() => Vt(e.concept, e.edges, e.conceptsById)), V = O(() => Wt(e.concept, e.edges, e.conceptsById)), te = O(() => b.value.length > 0), ne = O(() => {
      const i = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return W.value && i.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: A.value || void 0 }), i;
    });
    function fe(i) {
      return i.metadata?.original_mime_type || i.metadata?.source_mime || "";
    }
    function B(i) {
      const p = fe(i);
      return wt(i.metadata) && _t(p) ? { contentType: p, sourceUrl: f(i.id) } : p === "application/pdf" ? { contentType: "application/pdf", sourceUrl: f(i.id) } : null;
    }
    function k(i) {
      if (S.value?.id === i.id) {
        S.value = null;
        return;
      }
      const p = B(i);
      p && (S.value = { id: i.id, contentType: p.contentType, sourceUrl: p.sourceUrl, title: i.title });
    }
    const X = O(() => b.value.find((i) => B(i)) || null), le = O(() => !!X.value), ue = O(() => !!X.value && S.value?.id === X.value.id);
    function he(i) {
      const p = i.metadata || {}, v = p.filename || p.original_filename, U = p.source_url, Y = p.page ?? p.page_number, J = Y != null && Y !== "";
      if (!v && !U && !J) return [];
      const Z = [], Oe = p.original_mime_type || p.source_mime;
      return v && Z.push({ key: "filename", label: "File", value: String(v) }), Oe && Z.push({ key: "mime", label: "Type", value: String(Oe) }), U && Z.push({ key: "source", label: "Source", value: String(U), href: String(U) }), J && Z.push({ key: "page", label: "Page", value: String(Y) }), Z;
    }
    async function xe(i) {
      const { data: p } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(i)}`);
      if (!p?.success || !p.node) return null;
      const v = p.node, U = v.content || "";
      if (!U.trim()) return null;
      const Y = v.metadata || {}, J = Y.title || Y.filename || Y.source_url || e.conceptsById.get(i)?.label || "Document";
      return { id: i, title: J, content: U, contentType: v.content_type || "text/markdown", metadata: Y };
    }
    ct(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function Ce(i, p) {
      try {
        const { data: v } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(i)}&include_content=true&limit=200`);
        if (!v?.success) return null;
        const U = v.nodes || [], Y = U.filter((Z) => Z.node_type === "chunk").sort((Z, Oe) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((Oe.metadata || {}).index ?? (Oe.metadata || {}).chunk_index ?? 0)).map((Z) => ({ id: Z.id, content: String(Z.content || ""), prefix: String((Z.metadata || {}).contextual_prefix || "") })), J = String((U.find((Z) => Z.node_type === "summary") || {}).content || "");
        return !Y.length && !J ? null : { id: i, title: p, summary: J, chunks: Y };
      } catch {
        return null;
      }
    }
    let ye = 0;
    async function L() {
      const i = e.concept, p = ++ye;
      if (b.value = [], x.value = [], _.value = {}, I.value = "", N.value = "rendered", !i || !e.kbId) return;
      const v = C.value;
      if (v.length) {
        u.value = !0;
        try {
          const U = await Promise.all(v.map((J) => xe(J).catch(() => null)));
          if (p !== ye) return;
          b.value = U.filter((J) => J != null), !b.value.length && v.length && (I.value = "The source for this page could not be loaded.");
          const Y = await Promise.all(b.value.map((J) => Ce(J.id, J.title)));
          if (p !== ye) return;
          x.value = Y.filter((J) => J != null);
        } catch (U) {
          if (p !== ye) return;
          I.value = U?.response?.data?.error || U?.message || "could not load this page";
        } finally {
          p === ye && (u.value = !1);
        }
      }
    }
    return re(() => [e.concept?.id, e.kbId], () => L(), { immediate: !0 }), re(() => e.concept?.id, () => {
      S.value = null;
    }), (i, p) => s.concept ? (t(), a("article", cn, [
      !s.concept.is_root || s.concept.description ? (t(), a("header", rn, [
        s.concept.is_root ? R("", !0) : (t(), a("div", un, [
          l("h1", dn, F(s.concept.label || s.concept.id), 1),
          X.value ? (t(), se(m(bt), {
            key: 0,
            class: ke(["wr-orig-btn", { on: ue.value }]),
            label: ue.value ? "Hide original" : "View original",
            onOpen: p[0] || (p[0] = (v) => k(X.value))
          }, null, 8, ["class", "label"])) : R("", !0)
        ])),
        s.concept.description ? (t(), a("p", vn, F(s.concept.description), 1)) : R("", !0)
      ])) : R("", !0),
      u.value ? (t(), a("div", fn, [
        $(m(z), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        p[3] || (p[3] = l("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), a("div", pn, [
        $(m(z), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, F(I.value), 1)
      ])) : (t(), a(ee, { key: 3 }, [
        te.value && (le.value || W.value) ? (t(), se(m(Ht), {
          key: 0,
          tabs: ne.value,
          active: N.value,
          onSelect: p[1] || (p[1] = (v) => N.value = v)
        }, null, 8, ["tabs", "active"])) : R("", !0),
        te.value && N.value === "rendered" ? (t(), a("div", gn, [
          (t(!0), a(ee, null, ve(b.value, (v, U) => (t(), a("section", {
            key: v.id,
            class: "wr-doc-page"
          }, [
            b.value.length > 1 ? (t(), a("div", mn, [
              l("span", hn, F(v.title), 1),
              l("button", {
                type: "button",
                class: "wr-doc-toggle",
                "aria-expanded": y(v.id),
                onClick: (Y) => d(v.id)
              }, [
                $(m(z), {
                  icon: y(v.id) ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                ae(" " + F(y(v.id) ? "Collapse" : "Read"), 1)
              ], 8, yn)
            ])) : R("", !0),
            P.value.get(v.id) ? (t(), se(m(kt), {
              key: 1,
              text: P.value.get(v.id)
            }, null, 8, ["text"])) : R("", !0),
            y(v.id) ? (t(), a("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: v.content
            }, null, 8, bn)) : R("", !0),
            y(v.id) && he(v).length ? (t(), a("div", kn, [
              (t(!0), a(ee, null, ve(he(v), (Y) => (t(), a("div", {
                key: Y.key,
                class: "wr-prov-row"
              }, [
                l("span", xn, F(Y.label), 1),
                Y.href ? (t(), a("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: Y.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, F(Y.value), 9, wn)) : (t(), a("span", _n, F(Y.value), 1))
              ]))), 128))
            ])) : R("", !0),
            U < b.value.length - 1 ? (t(), a("hr", $n)) : R("", !0)
          ]))), 128))
        ])) : te.value && N.value === "chunks" ? (t(), a("div", Cn, [
          (t(!0), a(ee, null, ve(x.value, (v) => (t(), a("section", {
            key: v.id,
            class: "wr-chunks-doc"
          }, [
            x.value.length > 1 ? (t(), a("div", In, F(v.title), 1)) : R("", !0),
            (t(!0), a(ee, null, ve(v.chunks, (U, Y) => (t(), a("div", {
              key: U.id,
              class: ke(["wr-chunk", { open: _.value[U.id] }])
            }, [
              l("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!_.value[U.id],
                onClick: (J) => j(U.id)
              }, [
                l("span", Sn, F(Y + 1), 1),
                l("span", Rn, "Chunk " + F(Y + 1), 1),
                $(m(z), {
                  class: "wr-chunk-chev",
                  icon: _.value[U.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Mn),
              U.prefix ? (t(), a("p", On, [
                $(m(z), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                l("span", null, F(U.prefix), 1)
              ])) : R("", !0),
              l("p", {
                class: ke(["wr-chunk-body", { clamp: !_.value[U.id] }])
              }, F(U.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : E.value.length ? (t(), a("div", Tn, [
          (t(!0), a(ee, null, ve(E.value, (v) => (t(), a("button", {
            key: v.id,
            class: "wr-card",
            style: _e({ "--c": m(Ee)(v).fill }),
            onClick: (U) => o("navigate", v)
          }, [
            l("span", Dn, [
              l("span", Ln, [
                $(m(z), {
                  icon: m(it)(v),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(m(z), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            l("span", Fn, F(v.label || v.id), 1),
            v.description ? (t(), a("span", Nn, F(v.description), 1)) : R("", !0),
            l("span", An, [
              v.document_count ? (t(), a("span", Bn, F(v.document_count) + " " + F(v.document_count === 1 ? "page" : "pages"), 1)) : R("", !0),
              m(ot)(v.id, s.edges) ? (t(), a("span", Un, F(m(ot)(v.id, s.edges)) + " subtopics", 1)) : R("", !0),
              !v.document_count && !m(ot)(v.id, s.edges) ? (t(), a("span", zn, "empty")) : R("", !0)
            ])
          ], 12, En))), 128))
        ])) : (t(), a("div", Pn, [
          $(m(z), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          p[4] || (p[4] = l("span", null, "This page has no content yet.", -1))
        ])),
        V.value.length || te.value && E.value.length ? (t(), a("footer", Vn, [
          te.value && E.value.length ? (t(), a("div", Wn, [
            p[5] || (p[5] = l("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            l("div", Hn, [
              (t(!0), a(ee, null, ve(E.value, (v) => (t(), a("button", {
                key: v.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", v)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: _e({ background: m(Ee)(v).fill })
                }, null, 4),
                ae(F(v.label || v.id), 1)
              ], 8, Xn))), 128))
            ])
          ])) : R("", !0),
          V.value.length ? (t(), a("div", Yn, [
            p[6] || (p[6] = l("span", { class: "wr-foot-h" }, "Related", -1)),
            l("div", Kn, [
              (t(!0), a(ee, null, ve(V.value, (v) => (t(), a("button", {
                key: v.concept.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", v.concept)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: _e({ background: m(Ee)(v.concept).fill })
                }, null, 4),
                ae(F(v.concept.label || v.concept.id) + " ", 1),
                l("span", jn, F(v.label), 1)
              ], 8, Gn))), 128))
            ])
          ])) : R("", !0)
        ])) : R("", !0)
      ], 64)),
      $(m(xt), {
        contained: "",
        open: !!S.value,
        title: S.value?.title || s.concept?.label || "",
        "content-type": S.value?.contentType || "",
        "source-url": S.value?.sourceUrl || "",
        onClose: p[2] || (p[2] = (v) => S.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : R("", !0);
  }
}), Qn = { class: "wk-tax-h" }, Jn = ["value"], qn = {
  key: 2,
  class: "wk-tax-del"
}, eo = { class: "wk-tax-counts" }, to = ["value"], no = {
  key: 3,
  class: "wk-tax-err"
}, oo = { class: "wk-tax-foot" }, Rt = /* @__PURE__ */ $e({
  __name: "TaxonomyForm",
  props: {
    kbId: {},
    mode: {},
    target: {},
    concepts: {},
    edges: {}
  },
  emits: ["saved", "close"],
  setup(s, { emit: r }) {
    const e = s, o = r, f = T(""), u = T(""), I = T(""), b = T(""), x = T(!1), _ = T(""), N = O(() => {
      const d = /* @__PURE__ */ new Map();
      for (const C of e.concepts) d.set(C.id, C);
      return d;
    }), S = O(() => {
      const d = /* @__PURE__ */ new Map();
      for (const C of e.edges)
        (C.edge_type === "subtopic_of" || C.edge_type === "categorized_as") && N.value.has(C.from_node_id) && N.value.has(C.to_node_id) && d.set(C.from_node_id, C.to_node_id);
      return d;
    }), A = O(() => ({ add: "Add child concept", rename: "Rename", move: "Move to", delete: "Delete" })[e.mode] || ""), P = O(() => e.concepts.filter((d) => d.node_type !== "document"));
    function W(d, C) {
      let E = d;
      const V = /* @__PURE__ */ new Set();
      for (; E && !V.has(E); ) {
        if (E === C) return !0;
        V.add(E), E = S.value.get(E);
      }
      return !1;
    }
    const j = O(() => {
      const d = e.target;
      return d ? P.value.filter((C) => C.id !== d.id && !W(C.id, d.id)) : P.value;
    }), D = O(() => {
      const d = e.target;
      if (!d) return { childCount: 0, documentCount: 0, empty: !0 };
      let C = 0, E = 0;
      for (const V of e.edges)
        V.to_node_id === d.id && (V.edge_type === "subtopic_of" && (C += 1), V.edge_type === "categorized_as" && (E += 1));
      return { childCount: C, documentCount: E, empty: C === 0 && E === 0 };
    }), H = O(() => {
      const d = e.target;
      return x.value ? !1 : e.mode === "add" ? f.value.trim() !== "" : !d || d.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? f.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== d.id : e.mode === "delete" ? D.value.empty || b.value !== "" : !1;
    });
    re(() => [e.mode, e.target], () => {
      const d = e.target;
      f.value = e.mode === "rename" && d?.label || "", u.value = e.mode === "rename" && d?.description || "", I.value = d && S.value.get(d.id) || "", b.value = "", _.value = "";
    }, { immediate: !0 });
    async function y() {
      const d = e.target, C = e.kbId;
      if (!(!C || !H.value)) {
        x.value = !0, _.value = "";
        try {
          let E = d?.id || "";
          if (e.mode === "add") {
            const { data: V } = await Ie.post(`/api/v1/kb10/${C}/concepts`, {
              label: f.value.trim(),
              description: u.value.trim(),
              parent_id: d?.id
            });
            if (!V?.success) throw new Error(V?.error || "create failed");
            E = V.node_id || E;
          } else if (e.mode === "rename" && d) {
            const { data: V } = await Ie.patch(`/api/v1/kb10/${C}/concepts/${encodeURIComponent(d.id)}`, {
              label: f.value.trim(),
              description: u.value.trim()
            });
            if (!V?.success) throw new Error(V?.error || "update failed");
            E = d.id;
          } else if (e.mode === "move" && d) {
            const { data: V } = await Ie.put(`/api/v1/kb10/${C}/concepts/${encodeURIComponent(d.id)}/parent`, {
              parent_id: I.value
            });
            if (!V?.success) throw new Error(V?.error || "move failed");
            E = d.id;
          } else if (e.mode === "delete" && d) {
            const V = b.value ? { reassign_to_concept_id: b.value } : {}, { data: te } = await Ie.delete(`/api/v1/kb10/${C}/concepts/${encodeURIComponent(d.id)}`, { data: V });
            if (!te?.success) throw new Error(te?.error || "delete failed");
            E = b.value || S.value.get(d.id) || "";
          }
          o("saved", E);
        } catch (E) {
          _.value = E?.response?.data?.error || E?.message || "taxonomy update failed", Ue.handleError(E?.response?.status === 401 ? "auth-expired" : "other", E);
        } finally {
          x.value = !1;
        }
      }
    }
    return (d, C) => (t(), a("form", {
      class: "wk-tax",
      onSubmit: Re(y, ["prevent"])
    }, [
      l("div", Qn, [
        l("span", null, F(A.value), 1),
        $(m(Te), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: C[0] || (C[0] = (E) => o("close"))
        })
      ]),
      s.mode === "add" || s.mode === "rename" ? (t(), a(ee, { key: 0 }, [
        Fe(l("input", {
          "onUpdate:modelValue": C[1] || (C[1] = (E) => f.value = E),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ge, f.value]
        ]),
        Fe(l("textarea", {
          "onUpdate:modelValue": C[2] || (C[2] = (E) => u.value = E),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ge, u.value]
        ])
      ], 64)) : R("", !0),
      s.mode === "move" ? Fe((t(), a("select", {
        key: 1,
        "onUpdate:modelValue": C[3] || (C[3] = (E) => I.value = E),
        class: "wk-tax-input"
      }, [
        C[6] || (C[6] = l("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), a(ee, null, ve(j.value, (E) => (t(), a("option", {
          key: E.id,
          value: E.id
        }, F(E.label || E.id), 9, Jn))), 128))
      ], 512)), [
        [ut, I.value]
      ]) : R("", !0),
      s.mode === "delete" ? (t(), a("div", qn, [
        l("div", eo, [
          l("span", null, [
            $(m(z), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            ae(F(D.value.childCount) + " subtopics", 1)
          ]),
          l("span", null, [
            $(m(z), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            ae(F(D.value.documentCount) + " pages", 1)
          ])
        ]),
        D.value.empty ? R("", !0) : Fe((t(), a("select", {
          key: 0,
          "onUpdate:modelValue": C[4] || (C[4] = (E) => b.value = E),
          class: "wk-tax-input"
        }, [
          C[7] || (C[7] = l("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), a(ee, null, ve(j.value, (E) => (t(), a("option", {
            key: E.id,
            value: E.id
          }, F(E.label || E.id), 9, to))), 128))
        ], 512)), [
          [ut, b.value]
        ])
      ])) : R("", !0),
      _.value ? (t(), a("div", no, [
        $(m(z), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, F(_.value), 1)
      ])) : R("", !0),
      l("div", oo, [
        $(m(je), {
          variant: "ghost",
          small: "",
          disabled: x.value,
          onClick: C[5] || (C[5] = (E) => o("close"))
        }, {
          default: ge(() => [...C[8] || (C[8] = [
            ae("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(m(je), {
          type: "submit",
          small: "",
          variant: s.mode === "delete" ? "danger" : "primary",
          loading: x.value,
          disabled: !H.value
        }, {
          default: ge(() => [
            ae(F(s.mode === "delete" ? "Delete" : "Save"), 1)
          ]),
          _: 1
        }, 8, ["variant", "loading", "disabled"])
      ])
    ], 32));
  }
}), lo = { class: "wn" }, so = {
  key: 0,
  class: "wn-folder"
}, ao = ["title"], io = {
  key: 1,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Search results"
}, co = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], ro = { class: "wn-item-text" }, uo = { class: "wn-label" }, vo = {
  key: 0,
  class: "wn-path"
}, fo = {
  key: 0,
  class: "wn-path-sep"
}, po = ["onClick"], go = {
  key: 0,
  class: "wn-empty"
}, mo = {
  key: 2,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Folder contents"
}, ho = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], yo = { class: "wn-label" }, bo = {
  key: 0,
  class: "wn-count"
}, ko = ["onClick"], xo = {
  key: 0,
  class: "wn-empty"
}, wo = /* @__PURE__ */ $e({
  __name: "WikiNav",
  props: {
    crumbs: {},
    entries: {},
    selectedId: {},
    query: {},
    results: {}
  },
  emits: ["open", "enter", "up", "context"],
  setup(s, { emit: r }) {
    const e = s, o = r;
    function f(D, H) {
      const y = D.currentTarget.getBoundingClientRect();
      o("context", { concept: H, x: y.right, y: y.bottom });
    }
    function u(D, H) {
      o("context", { concept: H, x: D.clientX, y: D.clientY });
    }
    const I = O(() => e.query.trim().length > 0), b = O(() => e.crumbs.length > 1), x = O(() => e.crumbs[e.crumbs.length - 1] || null);
    function _(D) {
      return D.label || (D.node_type === "document" ? "Untitled page" : D.id);
    }
    function N(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    function S(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    const A = T(""), P = O(() => I.value ? e.results : e.entries);
    function W(D) {
      const H = P.value;
      return (H.find((d) => d.concept.id === A.value) || H.find((d) => d.concept.id === e.selectedId) || H[0])?.concept.id === D ? 0 : -1;
    }
    function j(D, H) {
      if (D.target !== D.currentTarget) return;
      if (D.key === "Enter" || D.key === " ") {
        D.preventDefault(), H.isFolder ? o("enter", H.concept) : o("open", H.concept);
        return;
      }
      const y = D.currentTarget, d = Array.from(y.parentElement.querySelectorAll('[role="option"]')), C = d.indexOf(y);
      let E;
      switch (D.key) {
        case "ArrowDown":
          E = Math.min(C + 1, d.length - 1);
          break;
        case "ArrowUp":
          E = Math.max(C - 1, 0);
          break;
        case "Home":
          E = 0;
          break;
        case "End":
          E = d.length - 1;
          break;
        default:
          return;
      }
      D.preventDefault(), d[E]?.focus();
    }
    return (D, H) => (t(), a("div", lo, [
      !I.value && x.value ? (t(), a("div", so, [
        b.value ? (t(), a("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: H[0] || (H[0] = (y) => o("up"))
        }, [
          $(m(z), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : R("", !0),
        l("span", {
          class: "wn-folder-name",
          title: _(x.value)
        }, F(_(x.value)), 9, ao)
      ])) : R("", !0),
      I.value ? (t(), a("ul", io, [
        (t(!0), a(ee, null, ve(s.results, (y) => (t(), a("li", {
          key: y.concept.id,
          class: ke(["wn-item", { active: y.concept.id === s.selectedId, folder: y.isFolder }]),
          role: "option",
          tabindex: W(y.concept.id),
          onFocus: (d) => A.value = y.concept.id,
          onKeydown: (d) => j(d, y),
          "aria-selected": y.concept.id === s.selectedId,
          onClick: (d) => S(y),
          onContextmenu: Re((d) => u(d, y.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: _e({ color: m(Ee)(y.concept).fill })
          }, [
            $(m(z), {
              icon: y.isFolder ? m(it)(y.concept) : m(dt)(y.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", ro, [
            l("span", uo, F(_(y.concept)), 1),
            y.path.length ? (t(), a("span", vo, [
              (t(!0), a(ee, null, ve(y.path, (d, C) => (t(), a(ee, {
                key: d.id
              }, [
                C ? (t(), a("span", fo, "/")) : R("", !0),
                ae(F(d.label || d.id), 1)
              ], 64))), 128))
            ])) : R("", !0)
          ]),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Re((d) => f(d, y.concept), ["stop"])
          }, [
            $(m(z), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, po),
          y.isFolder ? (t(), se(m(z), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, co))), 128)),
        s.results.length ? R("", !0) : (t(), a("li", go, "No matches."))
      ])) : (t(), a("ul", mo, [
        (t(!0), a(ee, null, ve(s.entries, (y) => (t(), a("li", {
          key: y.concept.id,
          class: ke(["wn-item", { active: y.concept.id === s.selectedId, folder: y.isFolder }]),
          role: "option",
          tabindex: W(y.concept.id),
          onFocus: (d) => A.value = y.concept.id,
          onKeydown: (d) => j(d, y),
          "aria-selected": y.concept.id === s.selectedId,
          onClick: (d) => N(y),
          onContextmenu: Re((d) => u(d, y.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: _e({ color: m(Ee)(y.concept).fill })
          }, [
            $(m(z), {
              icon: y.isFolder ? m(it)(y.concept) : m(dt)(y.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", yo, F(_(y.concept)), 1),
          y.isFolder ? (t(), a("span", bo, F(y.childCount), 1)) : R("", !0),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Re((d) => f(d, y.concept), ["stop"])
          }, [
            $(m(z), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, ko),
          y.isFolder ? (t(), se(m(z), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, ho))), 128)),
        s.entries.length ? R("", !0) : (t(), a("li", xo, "This level is empty."))
      ]))
    ]));
  }
}), _o = { class: "cn" }, $o = { class: "wn-filter" }, Co = {
  class: "kx-rail-body",
  "aria-label": "Contents"
}, Ot = /* @__PURE__ */ $e({
  __name: "ConceptNavRail",
  props: {
    concepts: {},
    edges: {},
    selectedId: {}
  },
  emits: ["select", "context"],
  setup(s, { emit: r }) {
    const e = s, o = r, f = O(() => $t(e.concepts, e.edges)), u = O(() => Xt(f.value)), I = T(""), b = T(""), x = O(() => u.value.byId.get(I.value)), _ = O(() => I.value ? Yt(I.value, u.value.byId, u.value.parentOf) : []), N = O(() => Kt(x.value)), S = O(() => Gt(b.value, u.value.byId, u.value.parentOf));
    function A(y) {
      const d = u.value.byId.get(y);
      if (d && d.children.length) return y;
      const C = u.value.parentOf.get(y);
      return C || f.value[0]?.concept.id || y;
    }
    function P() {
      return f.value[0]?.concept.id || "";
    }
    function W(y) {
      const d = y ? A(y) : I.value || P();
      d && d !== I.value && (I.value = d);
    }
    function j(y) {
      I.value = y.id, b.value = "", o("select", y.id);
    }
    function D(y) {
      o("select", y.id);
    }
    function H() {
      const y = u.value.parentOf.get(I.value);
      y && (I.value = y, o("select", y));
    }
    return re(() => e.selectedId, (y) => W(y), { immediate: !0 }), re([() => u.value, I], () => {
      if (I.value && u.value.byId.has(I.value)) return;
      const y = e.selectedId ? A(e.selectedId) : P();
      y && (I.value = y);
    }, { immediate: !0 }), (y, d) => (t(), a("div", _o, [
      l("div", $o, [
        $(m(z), {
          class: "wn-filter-ic",
          icon: "tabler:filter-search",
          "aria-hidden": "true"
        }),
        Fe(l("input", {
          "onUpdate:modelValue": d[0] || (d[0] = (C) => b.value = C),
          class: "wn-filter-input",
          type: "text",
          placeholder: "Filter topics & pages…",
          "aria-label": "Filter the contents"
        }, null, 512), [
          [Ge, b.value]
        ]),
        b.value ? (t(), a("button", {
          key: 0,
          class: "wn-filter-x",
          "aria-label": "Clear filter",
          onClick: d[1] || (d[1] = (C) => b.value = "")
        }, [
          $(m(z), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : R("", !0)
      ]),
      l("nav", Co, [
        $(wo, {
          crumbs: _.value,
          entries: N.value,
          "selected-id": s.selectedId,
          query: b.value,
          results: S.value,
          onOpen: D,
          onEnter: j,
          onUp: H,
          onContext: d[2] || (d[2] = (C) => o("context", C))
        }, null, 8, ["crumbs", "entries", "selected-id", "query", "results"])
      ])
    ]));
  }
}), Io = {
  key: 0,
  class: "kb-menu-title"
}, Mo = {
  key: 0,
  class: "kb-menu-sep",
  role: "separator"
}, So = ["disabled", "onClick"], Tt = /* @__PURE__ */ $e({
  __name: "NodeMenu",
  props: {
    open: { type: Boolean },
    x: {},
    y: {},
    title: {},
    items: {}
  },
  emits: ["pick", "close"],
  setup(s, { emit: r }) {
    const e = s, o = r, f = O(() => {
      const x = e.items.filter((P) => !P.divider).length, _ = e.items.filter((P) => P.divider).length, N = (e.title ? 30 : 0) + 10 + x * 34 + _ * 9, S = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), A = Math.max(8, Math.min(e.y, window.innerHeight - N - 8));
      return { left: `${S}px`, top: `${A}px`, width: "224px" };
    });
    function u(b) {
      b.key === "Escape" && o("close");
    }
    ct(() => window.addEventListener("keydown", u)), Ze(() => window.removeEventListener("keydown", u));
    function I(b) {
      b.disabled || b.divider || (o("pick", b.id), o("close"));
    }
    return (b, x) => s.open ? (t(), a("div", {
      key: 0,
      class: "kb-menu-backdrop",
      onMousedown: x[2] || (x[2] = (_) => o("close")),
      onContextmenu: x[3] || (x[3] = Re((_) => o("close"), ["prevent"])),
      onWheel: x[4] || (x[4] = Re((_) => o("close"), ["prevent"]))
    }, [
      l("div", {
        class: "kb-menu",
        style: _e(f.value),
        role: "menu",
        onMousedown: x[0] || (x[0] = Re(() => {
        }, ["stop"])),
        onContextmenu: x[1] || (x[1] = Re(() => {
        }, ["prevent", "stop"]))
      }, [
        s.title ? (t(), a("div", Io, F(s.title), 1)) : R("", !0),
        (t(!0), a(ee, null, ve(s.items, (_, N) => (t(), a(ee, {
          key: _.id + ":" + N
        }, [
          _.divider ? (t(), a("div", Mo)) : (t(), a("button", {
            key: 1,
            class: ke(["kb-menu-item", { danger: _.danger, disabled: _.disabled }]),
            disabled: _.disabled,
            role: "menuitem",
            onClick: (S) => I(_)
          }, [
            _.icon ? (t(), se(m(z), {
              key: 0,
              icon: _.icon,
              class: "kb-menu-ic",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : R("", !0),
            l("span", null, F(_.label), 1)
          ], 10, So))
        ], 64))), 128))
      ], 36)
    ], 32)) : R("", !0);
  }
}), Et = "kb10:wiki:navWidth", Ro = 220, Oo = 560;
function Dt(s) {
  return Math.max(Ro, Math.min(Oo, s));
}
function To() {
  const s = Number(localStorage.getItem(Et));
  return Number.isFinite(s) && s > 0 ? Dt(s) : 300;
}
function Lt() {
  const s = T(To()), r = T(null), e = T(!1);
  function o(I) {
    const b = r.value;
    if (!b) return;
    const x = b.getBoundingClientRect();
    s.value = Dt(I.clientX - x.left);
  }
  function f() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", f), localStorage.setItem(Et, String(Math.round(s.value)));
  }
  function u(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", f);
  }
  return Ze(f), { navWidth: s, railRef: r, navDragging: e, onStart: u };
}
const Eo = { class: "kb-railtop" }, Do = { class: "kb-railtop-acts" }, Lo = {
  key: 0,
  class: "kx-main-scroll"
}, Fo = {
  key: 1,
  class: "kx-main-scroll wk-doc-inner"
}, No = {
  key: 0,
  class: "wk-pagebar"
}, Ao = {
  key: 0,
  class: "wk-crumbs",
  "aria-label": "Wiki path"
}, Bo = ["onClick"], Uo = {
  key: 1,
  class: "wk-tools"
}, zo = /* @__PURE__ */ $e({
  __name: "WikiView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    canAnswer: { type: Boolean },
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(s, { emit: r }) {
    const e = s, o = r, { navWidth: f, railRef: u, navDragging: I, onStart: b } = Lt(), x = O(() => {
      const B = /* @__PURE__ */ new Map();
      for (const k of e.concepts) B.set(k.id, k);
      return B;
    }), _ = O(() => e.selectedId && x.value.get(e.selectedId) || null), N = O(() => !!_.value && _.value.node_type !== "document"), S = O(() => {
      const B = /* @__PURE__ */ new Map();
      for (const k of e.edges)
        (k.edge_type === "subtopic_of" || k.edge_type === "categorized_as") && x.value.has(k.from_node_id) && x.value.has(k.to_node_id) && B.set(k.from_node_id, k.to_node_id);
      return B;
    }), A = O(() => {
      const B = [];
      let k = e.selectedId;
      const X = /* @__PURE__ */ new Set();
      for (; k && !X.has(k); ) {
        X.add(k);
        const le = x.value.get(k);
        if (!le) break;
        B.unshift(le), k = S.value.get(k);
      }
      return B.slice(0, -1).filter((le) => !le.is_root);
    }), P = T({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), W = O(() => {
      const B = P.value.concept;
      return B ? B.node_type === "document" ? [{ id: "open", label: "Open", icon: "tabler:arrow-right" }] : [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!B.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!B.is_root }
      ] : [];
    });
    function j(B) {
      P.value = { open: !0, x: B.x, y: B.y, concept: B.concept };
    }
    const D = T(null);
    function H() {
      if (!_.value) return;
      const k = D.value?.$el?.getBoundingClientRect();
      P.value = { open: !0, x: k ? k.right : 0, y: k ? k.bottom : 0, concept: _.value };
    }
    const y = T(""), d = T(null);
    function C(B) {
      const k = P.value.concept;
      if (k) {
        if (B === "open") {
          o("select", k.id);
          return;
        }
        d.value = k, y.value = B;
      }
    }
    function E(B) {
      y.value = "", B && o("select", B), o("changed");
    }
    const V = T(!1);
    function te(B) {
      const k = x.value.get(B.id) || (B.parent_id ? x.value.get(B.parent_id) : null);
      k && o("select", k.id), V.value = !1;
    }
    const ne = T("");
    function fe() {
      ne.value = "", o("changed");
    }
    return (B, k) => (t(), a("div", {
      ref_key: "railRef",
      ref: u,
      class: ke(["wk", { "wk-dragging": m(I) }]),
      style: _e({ "--kx-rail-width": m(f) + "px" })
    }, [
      s.concepts.length ? (t(), se(m(Ct), { key: 0 }, {
        rail: ge(() => [
          l("div", Eo, [
            l("div", Do, [
              $(m(Te), {
                icon: "tabler:search",
                label: "Search",
                active: V.value,
                onClick: k[0] || (k[0] = (X) => V.value = !V.value)
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: k[1] || (k[1] = (X) => ne.value = "add")
              }),
              $(m(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: s.loading,
                spin: s.loading,
                onClick: k[2] || (k[2] = (X) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: s.concepts,
            edges: s.edges,
            "selected-id": s.selectedId,
            onSelect: k[3] || (k[3] = (X) => o("select", X)),
            onContext: j
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: k[4] || (k[4] = //@ts-ignore
            (...X) => m(b) && m(b)(...X))
          }, [...k[11] || (k[11] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: ge(() => [
          V.value ? (t(), a("div", Lo, [
            $(m(It), {
              "kb-id": s.kbId,
              layout: "panel",
              ask: s.canAnswer,
              placeholder: "Search this wiki…",
              onOpen: te,
              onClose: k[5] || (k[5] = (X) => V.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), a("div", Fo, [
            A.value.length || N.value ? (t(), a("div", No, [
              A.value.length ? (t(), a("nav", Ao, [
                (t(!0), a(ee, null, ve(A.value, (X, le) => (t(), a(ee, {
                  key: X.id
                }, [
                  le ? (t(), se(m(z), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : R("", !0),
                  l("button", {
                    class: "wk-crumb",
                    onClick: (ue) => o("select", X.id)
                  }, F(X.label || X.id), 9, Bo)
                ], 64))), 128))
              ])) : R("", !0),
              N.value ? (t(), a("div", Uo, [
                $(m(Te), {
                  ref_key: "structBtnRef",
                  ref: D,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!y.value,
                  onClick: H
                }, null, 8, ["active"])
              ])) : R("", !0)
            ])) : R("", !0),
            y.value ? (t(), se(Rt, {
              key: 1,
              "kb-id": s.kbId,
              mode: y.value,
              target: d.value,
              concepts: s.concepts,
              edges: s.edges,
              onSaved: E,
              onClose: k[6] || (k[6] = (X) => y.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0),
            $(Zn, {
              "kb-id": s.kbId,
              concept: _.value,
              edges: s.edges,
              "concepts-by-id": x.value,
              onNavigate: k[7] || (k[7] = (X) => o("select", X.id))
            }, null, 8, ["kb-id", "concept", "edges", "concepts-by-id"])
          ]))
        ]),
        _: 1
      })) : (t(), se(Mt, {
        key: 1,
        icon: "tabler:book-2",
        title: "This wiki is empty",
        hint: "Add pages to grow it — concepts, their subtopics, and the links between them appear here as a navigable documentation tree.",
        cta: "Add the first page",
        "cta-icon": "tabler:plus",
        onCta: k[8] || (k[8] = (X) => ne.value = "add")
      })),
      $(m(Ke), {
        open: ne.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: k[9] || (k[9] = (X) => ne.value = "")
      }, {
        default: ge(() => [
          $(St, {
            "kb-id": s.kbId,
            noun: "page",
            onChanged: fe
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(Tt, {
        open: P.value.open,
        x: P.value.x,
        y: P.value.y,
        items: W.value,
        onPick: C,
        onClose: k[10] || (k[10] = (X) => P.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), Po = 0.81, mt = 144;
class Vo {
  nodes;
  links;
  width;
  height;
  alpha = 1;
  alphaMin = 1e-3;
  // Cool over ~360 ticks; the full cool runs so the layout reaches a relaxed state.
  alphaDecay = 1 - Math.pow(1e-3, 1 / 360);
  alphaTarget = 0;
  velocityDecay = 0.6;
  charge;
  // Gentle gravity: just enough to keep the graph cohesive. Higher values crush
  // nodes into a dense blob and fight the repulsion that gives the graph room.
  centerStrength = 0.015;
  // Hard cap on per-tick displacement. Without it, a node deep in a dense cluster
  // can absorb a large repulsion impulse and teleport off-screen on a single tick
  // (the "jumping behind the screen" during a drag) — clamping keeps motion bounded
  // and the layout legible while still letting nodes ease into place.
  maxVelocity = 35;
  constructor(r, e, o, f, u) {
    this.nodes = r, this.links = e, this.width = o, this.height = f, this.charge = u;
  }
  // One integration step. Returns true while still cooling.
  tick() {
    this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay;
    const r = this.alpha;
    return this.applyCharge(r), this.applyLinks(r), this.applyCenter(r), this.applyCollide(), this.integrate(), this.alpha >= this.alphaMin || this.alphaTarget > 0;
  }
  // ── Barnes-Hut many-body repulsion (O(n log n)) ──────────────────────────
  applyCharge(r) {
    const e = this.nodes, o = e.length;
    if (o < 2) return;
    let f = 1 / 0, u = 1 / 0, I = -1 / 0, b = -1 / 0;
    for (let S = 0; S < o; S++) {
      const A = e[S];
      A.x < f && (f = A.x), A.x > I && (I = A.x), A.y < u && (u = A.y), A.y > b && (b = A.y);
    }
    const x = Math.max(I - f, b - u, 1) + 1, _ = { x0: f, y0: u, x1: f + x, y1: u + x, mass: 0, cx: 0, cy: 0, node: null, kids: null };
    for (let S = 0; S < o; S++) this.insert(_, e[S]);
    this.computeMass(_);
    const N = this.charge * r;
    for (let S = 0; S < o; S++) this.repel(e[S], _, N);
  }
  // Insert p into the subtree rooted at q, subdividing leaves as needed.
  insert(r, e) {
    for (; r.kids; ) r = this.kid(r, e);
    if (r.node === null) {
      r.node = e;
      return;
    }
    if (r.node === e) return;
    r.node.x === e.x && r.node.y === e.y && (e.x += (Math.random() - 0.5) * 0.5, e.y += (Math.random() - 0.5) * 0.5);
    const o = r.node;
    r.node = null, r.kids = [null, null, null, null], this.insert(this.kid(r, o), o), this.insert(this.kid(r, e), e);
  }
  // Return the child quad of q containing point p, creating it on demand.
  kid(r, e) {
    const o = (r.x0 + r.x1) / 2, f = (r.y0 + r.y1) / 2, u = e.x >= o, I = e.y >= f, b = (I ? 2 : 0) + (u ? 1 : 0);
    let x = r.kids[b];
    return x || (x = {
      x0: u ? o : r.x0,
      x1: u ? r.x1 : o,
      y0: I ? f : r.y0,
      y1: I ? r.y1 : f,
      mass: 0,
      cx: 0,
      cy: 0,
      node: null,
      kids: null
    }, r.kids[b] = x), x;
  }
  computeMass(r) {
    if (!r.kids) {
      r.node && (r.mass = 1, r.cx = r.node.x, r.cy = r.node.y);
      return;
    }
    let e = 0, o = 0, f = 0;
    for (const u of r.kids)
      u && (this.computeMass(u), u.mass !== 0 && (e += u.mass, o += u.cx * u.mass, f += u.cy * u.mass));
    r.mass = e, e > 0 && (r.cx = o / e, r.cy = f / e);
  }
  repel(r, e, o) {
    if (e.mass === 0 || e.node === r) return;
    let f = e.cx - r.x, u = e.cy - r.y, I = f * f + u * u;
    I === 0 && (f = (Math.random() - 0.5) * 0.01, u = (Math.random() - 0.5) * 0.01, I = f * f + u * u);
    const b = e.x1 - e.x0;
    if (!e.kids || b * b / I < Po) {
      const x = I < mt ? mt : I, _ = Math.sqrt(I), N = o * e.mass / x;
      r.vx -= f / _ * N, r.vy -= u / _ * N;
      return;
    }
    for (const x of e.kids) x && this.repel(r, x, o);
  }
  applyLinks(r) {
    for (const e of this.links) {
      const o = this.nodes[e.source], f = this.nodes[e.target];
      if (!o || !f) continue;
      const u = f.x - o.x, I = f.y - o.y, b = Math.sqrt(u * u + I * I) || 1e-6, x = (b - e.distance) / b * r * e.strength, _ = u * x, N = I * x;
      o.vx += _ * 0.5, o.vy += N * 0.5, f.vx -= _ * 0.5, f.vy -= N * 0.5;
    }
  }
  applyCenter(r) {
    const e = this.width / 2, o = this.height / 2;
    for (const f of this.nodes)
      f.vx += (e - f.x) * this.centerStrength * r, f.vy += (o - f.y) * this.centerStrength * r;
  }
  // ── Collision via uniform spatial grid (O(n) average) ────────────────────
  applyCollide() {
    const r = this.nodes, e = r.length;
    if (e < 2) return;
    let o = 0;
    for (let b = 0; b < e; b++) r[b].radius > o && (o = r[b].radius);
    const f = o * 2 + 52, u = /* @__PURE__ */ new Map(), I = (b, x) => b * 73856093 ^ x * 19349663;
    for (let b = 0; b < e; b++) {
      const x = Math.floor(r[b].x / f), _ = Math.floor(r[b].y / f), N = I(x, _), S = u.get(N);
      S ? S.push(b) : u.set(N, [b]);
    }
    for (let b = 0; b < e; b++) {
      const x = r[b], _ = Math.floor(x.x / f), N = Math.floor(x.y / f);
      for (let S = -1; S <= 1; S++) for (let A = -1; A <= 1; A++) {
        const P = u.get(I(_ + S, N + A));
        if (P)
          for (const W of P) {
            if (W <= b) continue;
            const j = r[W], D = j.x - x.x, H = j.y - x.y, y = x.radius + j.radius + 44, d = D * D + H * H;
            if (d < y * y && d > 0) {
              const C = Math.sqrt(d), E = (y - C) / C * 0.5, V = D * E, te = H * E;
              x.x -= V, x.y -= te, j.x += V, j.y += te;
            }
          }
      }
    }
  }
  integrate() {
    const r = this.width / 2, e = this.height / 2, o = Math.max(this.width, this.height) * 2 + 1500, f = this.maxVelocity * (1 + this.alpha * 8);
    for (const u of this.nodes)
      u.fx != null ? (u.x = u.fx, u.vx = 0) : (u.vx *= this.velocityDecay, u.vx > f ? u.vx = f : u.vx < -f && (u.vx = -f), u.x += u.vx), u.fy != null ? (u.y = u.fy, u.vy = 0) : (u.vy *= this.velocityDecay, u.vy > f ? u.vy = f : u.vy < -f && (u.vy = -f), u.y += u.vy), Number.isFinite(u.x) || (u.x = r, u.vx = 0), Number.isFinite(u.y) || (u.y = e, u.vy = 0), u.x = Math.max(r - o, Math.min(r + o, u.x)), u.y = Math.max(e - o, Math.min(e + o, u.y));
  }
  // A final, spring-free separation pass: run the collision grid repeatedly to push
  // apart any residual node overlap the cooled simulation left behind. Independent of
  // alpha and with nothing pulling nodes back together, so even a dense seed/cluster
  // ends up cleanly spaced. Cheap (O(n) per iteration).
  resolveOverlaps(r = 60) {
    for (let e = 0; e < r; e++) this.applyCollide();
  }
  // Re-energize the layout to a one-off alpha that then cools to alphaTarget.
  reheat(r = 0.3) {
    this.alpha < r && (this.alpha = r), this.alphaTarget = 0;
  }
  // Hold the layout gently "warm" at a low alpha — used during a drag so only a
  // light, continuous relaxation follows the cursor instead of a full reheat that
  // shakes the whole graph. Pair with settle() on release to cool back down.
  warm(r = 0.1) {
    this.alphaTarget = r, this.alpha < r && (this.alpha = r);
  }
  // Stop holding warm and let the layout cool to rest.
  settle() {
    this.alphaTarget = 0;
  }
}
const Wo = ["transform"], Ho = { class: "gx-links" }, Xo = ["d"], Yo = { class: "gx-nodes" }, Ko = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Go = ["r"], jo = ["fill", "stroke"], Zo = ["r", "fill", "stroke", "stroke-width"], Qo = ["cx", "cy"], Jo = ["x", "y"], qo = ["y"], el = /* @__PURE__ */ $e({
  __name: "GraphCanvas",
  props: {
    concepts: {},
    edges: {},
    selectedId: {},
    highlightIds: {},
    visibleIds: {},
    colors: {}
  },
  emits: ["select", "scale", "node-context", "node-dblclick"],
  setup(s, { expose: r, emit: e }) {
    const o = s;
    function f(h) {
      return !o.visibleIds || o.visibleIds.has(h);
    }
    function u(h) {
      return o.colors?.get(h.id) || Ee(h);
    }
    const I = e, b = T(null), x = T(null), _ = T(0), N = T(0), S = T(1), A = T(!1);
    re(S, (h) => I("scale", h));
    const P = T([]), W = T([]);
    let j = null, D = null, H = 0, y = "";
    const d = /* @__PURE__ */ new Map(), C = T(null), E = O(() => o.concepts.length > 220), V = O(() => {
      if (o.highlightIds.size) return new Set(o.highlightIds);
      if (C.value) {
        const h = /* @__PURE__ */ new Set([C.value]);
        for (const M of W.value)
          M.from === C.value && h.add(M.to), M.to === C.value && h.add(M.from);
        return h;
      }
      return null;
    });
    function te(h) {
      if (h.node_type === "document") return 8;
      if (h.is_root) return 22;
      const M = (h.edge_count || 0) + (h.document_count || 0);
      return Math.max(11, Math.min(24, 11 + M * 2));
    }
    function ne() {
      const h = x.value?.getBoundingClientRect();
      return { w: h?.width || 900, h: h?.height || 640 };
    }
    function fe() {
      return o.concepts.map((h) => h.id).join("|");
    }
    function B(h, M) {
      const w = o.concepts, K = new Map(w.map((g) => [g.id, g])), q = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
      for (const g of o.edges) {
        if (g.edge_type !== "subtopic_of" && g.edge_type !== "categorized_as" || !K.has(g.from_node_id) || !K.has(g.to_node_id)) continue;
        const Q = q.get(g.to_node_id) || [];
        Q.push(g.from_node_id), q.set(g.to_node_id, Q), G.add(g.from_node_id);
      }
      const me = w.filter((g) => g.is_root || !G.has(g.id)).map((g) => g.id), de = /* @__PURE__ */ new Map(), be = /* @__PURE__ */ new Set(), ie = (g) => {
        const Q = de.get(g);
        if (Q !== void 0) return Q;
        if (be.has(g)) return 1;
        be.add(g);
        const oe = q.get(g) || [];
        let pe = oe.length ? 0 : 1;
        for (const Le of oe) pe += ie(Le);
        return pe = Math.max(1, pe), de.set(g, pe), pe;
      };
      for (const g of me) ie(g);
      const ce = 150, we = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Set(), Ae = /* @__PURE__ */ new Set();
      let Be = 0;
      const c = (g, Q, oe, pe) => {
        if (Ae.has(g)) return;
        Ae.add(g), Se.add(g);
        const Le = (oe + pe) / 2, Ve = Q * ce, rt = Be++ * 2.399963;
        we.set(g, { x: h + Ve * Math.cos(Le) + Math.cos(rt) * 4, y: M + Ve * Math.sin(Le) + Math.sin(rt) * 4 });
        const tt = q.get(g) || [];
        if (!tt.length) return;
        const Ft = tt.reduce((He, Xe) => He + ie(Xe), 0) || 1;
        let nt = oe;
        for (const He of tt) {
          const Xe = (pe - oe) * (ie(He) / Ft);
          c(He, Q + 1, nt, nt + Xe), nt += Xe;
        }
      };
      if (me.length === 1)
        c(me[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const g = me.reduce((oe, pe) => oe + ie(pe), 0) || 1;
        let Q = -Math.PI / 2;
        for (const oe of me) {
          const pe = Math.PI * 2 * (ie(oe) / g);
          c(oe, 1, Q, Q + pe), Q += pe;
        }
      }
      const n = w.filter((g) => !Se.has(g.id));
      if (n.length) {
        let g = ce;
        for (const Q of we.values()) {
          const oe = Math.hypot(Q.x - h, Q.y - M);
          oe > g && (g = oe);
        }
        n.forEach((Q, oe) => {
          const pe = oe / n.length * Math.PI * 2;
          we.set(Q.id, { x: h + (g + ce) * Math.cos(pe), y: M + (g + ce) * Math.sin(pe) });
        });
      }
      return we;
    }
    function k() {
      const { w: h, h: M } = ne(), w = h / 2, K = M / 2, q = o.concepts, G = q.length, me = B(w, K);
      if (G < 3) return me;
      const de = /* @__PURE__ */ new Map();
      q.forEach((c, n) => de.set(c.id, n));
      const be = q.map((c) => {
        const n = me.get(c.id) || { x: w, y: K };
        return { id: c.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: te(c) };
      }), ie = G > 250 ? 150 : 120, ce = G > 250 ? -1100 : -700, we = o.edges.filter((c) => de.has(c.from_node_id) && de.has(c.to_node_id)).map((c) => ({
        source: de.get(c.from_node_id),
        target: de.get(c.to_node_id),
        distance: c.edge_type === "subtopic_of" ? ie * 0.8 : ie,
        strength: c.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), Se = new Vo(be, we, h, M, ce), Ae = G > 600 ? 70 : G > 250 ? 110 : 150;
      for (let c = 0; c < Ae; c++) Se.tick();
      Se.resolveOverlaps(G > 600 ? 50 : 80);
      const Be = /* @__PURE__ */ new Map();
      for (const c of be) Be.set(c.id, { x: c.x, y: c.y });
      return Be;
    }
    function X(h) {
      const { w: M, h: w } = ne();
      if ((M < 2 || w < 2) && H < 60) {
        H++, requestAnimationFrame(() => X(h));
        return;
      }
      H = 0;
      const K = k();
      d.clear();
      for (const [q, G] of K) d.set(q, G);
      he(), h && (xe(), requestAnimationFrame(() => xe())), A.value = !0;
    }
    function le() {
      y = fe(), X(!0);
    }
    function ue() {
      if (!o.concepts.length) {
        P.value = [], W.value = [], A.value = !1, y = "", d.clear();
        return;
      }
      const h = fe();
      if (h === y) {
        he();
        return;
      }
      const M = !y;
      y = h, st(() => X(M));
    }
    function he() {
      P.value = o.concepts.filter((h) => f(h.id)).map((h) => {
        const M = d.get(h.id) || { x: 0, y: 0 };
        return { id: h.id, x: M.x, y: M.y, radius: te(h), concept: h, isDoc: h.node_type === "document" };
      }), W.value = o.edges.filter((h) => d.has(h.from_node_id) && d.has(h.to_node_id) && f(h.from_node_id) && f(h.to_node_id)).map((h) => {
        const M = d.get(h.from_node_id), w = d.get(h.to_node_id), K = (M.x + w.x) / 2, q = (M.y + w.y) / 2, G = w.x - M.x, me = w.y - M.y, de = Math.hypot(G, me) || 1, be = Math.min(28, de * 0.12), ie = K - me / de * be, ce = q + G / de * be;
        return {
          id: h.id,
          path: `M${M.x},${M.y} Q${ie},${ce} ${w.x},${w.y}`,
          edge_type: h.edge_type || "",
          from: h.from_node_id,
          to: h.to_node_id
        };
      });
    }
    function xe() {
      if (!d.size) return;
      const { w: h, h: M } = ne();
      let w = 1 / 0, K = 1 / 0, q = -1 / 0, G = -1 / 0;
      for (const ce of o.concepts) {
        if (!f(ce.id)) continue;
        const we = d.get(ce.id);
        if (!we) continue;
        const Se = te(ce);
        w = Math.min(w, we.x - Se), K = Math.min(K, we.y - Se), q = Math.max(q, we.x + Se), G = Math.max(G, we.y + Se);
      }
      if (!Number.isFinite(w)) return;
      const me = Math.max(64, Math.min(h, M) * 0.12);
      w -= me, K -= me, q += me, G += me;
      const de = Math.max(q - w, 1), be = Math.max(G - K, 1), ie = Math.max(0.25, Math.min(h / de, M / be, 1.25));
      S.value = ie, _.value = (h - de * ie) / 2 - w * ie, N.value = (M - be * ie) / 2 - K * ie;
    }
    function Ce(h) {
      const M = d.get(h);
      if (!M) return;
      const { w, h: K } = ne(), q = Math.max(S.value, 1.1);
      S.value = q, _.value = w / 2 - M.x * q, N.value = K / 2 - M.y * q;
    }
    let ye = !1, L = !1, i = { x: 0, y: 0, tx: 0, ty: 0 };
    function p(h) {
      h.preventDefault();
      const M = b.value.getBoundingClientRect(), w = h.clientX - M.left, K = h.clientY - M.top, q = h.deltaY < 0 ? 1.12 : 1 / 1.12, G = Math.max(0.1, Math.min(6, S.value * q));
      _.value = w - (w - _.value) * (G / S.value), N.value = K - (K - N.value) * (G / S.value), S.value = G;
    }
    function v(h) {
      h.button === 0 && (ye = !0, L = !1, i = { x: h.clientX, y: h.clientY, tx: _.value, ty: N.value }, window.addEventListener("mousemove", U), window.addEventListener("mouseup", Y));
    }
    function U(h) {
      ye && (Math.abs(h.clientX - i.x) + Math.abs(h.clientY - i.y) > 3 && (L = !0), _.value = i.tx + (h.clientX - i.x), N.value = i.ty + (h.clientY - i.y));
    }
    function Y() {
      ye && !L && I("select", null), ye = !1, window.removeEventListener("mousemove", U), window.removeEventListener("mouseup", Y);
    }
    let J = null, Z = !1, Oe = 0, ze = 0;
    function Qe(h, M) {
      h.button === 0 && (h.stopPropagation(), d.has(M) && (J = M, Z = !1, Oe = h.clientX, ze = h.clientY, window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", Ne)));
    }
    function Pe(h) {
      if (!J || !b.value) return;
      if (!Z) {
        const q = h.clientX - Oe, G = h.clientY - ze;
        if (q * q + G * G < 9) return;
        Z = !0;
      }
      const M = b.value.getBoundingClientRect(), w = (h.clientX - M.left - _.value) / S.value, K = (h.clientY - M.top - N.value) / S.value;
      Number.isFinite(w) && Number.isFinite(K) && (d.set(J, { x: w, y: K }), he());
    }
    let Me = 0;
    function Ne() {
      const h = J, M = Z;
      if (J = null, window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne), M || !h) return;
      const w = Date.now();
      if (w - Me < 350) {
        Me = 0;
        return;
      }
      Me = w, I("select", o.selectedId === h ? null : h);
    }
    function Je(h) {
      const { w: M, h: w } = ne(), K = Math.max(0.1, Math.min(6, S.value * h));
      _.value = M / 2 - (M / 2 - _.value) * (K / S.value), N.value = w / 2 - (w / 2 - N.value) * (K / S.value), S.value = K;
    }
    function qe(h) {
      return !!V.value && !V.value.has(h);
    }
    function De(h) {
      const M = ["gx-link"];
      h.edge_type === "subtopic_of" ? M.push("subtopic") : M.push("categorized");
      const w = V.value;
      return w && (w.has(h.from) && w.has(h.to) ? M.push("lit") : M.push("faded")), M;
    }
    function et(h) {
      return !E.value || h.concept.is_root || h.id === o.selectedId || h.id === C.value;
    }
    return re(
      () => [o.concepts, o.edges],
      () => ue(),
      { immediate: !0, deep: !1 }
    ), re(() => o.visibleIds, () => {
      y && he();
    }), re(x, (h) => {
      h && !j && (j = new ResizeObserver(() => {
        o.concepts.length && (D && clearTimeout(D), D = setTimeout(() => {
          y && xe();
        }, 120));
      }), j.observe(h)), h && o.concepts.length && !y && ue();
    }), Nt(() => {
      j?.disconnect(), D && clearTimeout(D), Y(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne);
    }), r({ fit: xe, focus: Ce, zoomBy: Je, relayout: le }), (h, M) => (t(), a("div", {
      ref_key: "containerRef",
      ref: x,
      class: "gx-canvas"
    }, [
      (t(), a("svg", {
        ref_key: "svgRef",
        ref: b,
        class: "gx-svg",
        onWheel: p,
        onMousedown: v,
        onContextmenu: M[1] || (M[1] = Re(() => {
        }, ["prevent"]))
      }, [
        M[2] || (M[2] = l("defs", null, [
          l("pattern", {
            id: "gx-grid",
            width: "26",
            height: "26",
            patternUnits: "userSpaceOnUse"
          }, [
            l("circle", {
              cx: "1",
              cy: "1",
              r: "1",
              class: "gx-grid-dot"
            })
          ])
        ], -1)),
        M[3] || (M[3] = l("rect", {
          class: "gx-grid-bg",
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
          fill: "url(#gx-grid)"
        }, null, -1)),
        l("g", {
          transform: `translate(${_.value},${N.value}) scale(${S.value})`,
          style: _e({ opacity: A.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          l("g", Ho, [
            (t(!0), a(ee, null, ve(W.value, (w) => (t(), a("path", {
              key: w.id,
              d: w.path,
              class: ke(De(w))
            }, null, 10, Xo))), 128))
          ]),
          l("g", Yo, [
            (t(!0), a(ee, null, ve(P.value, (w) => (t(), a("g", {
              key: w.id,
              transform: `translate(${w.x},${w.y})`,
              class: ke(["gx-node", { dim: qe(w.id), sel: w.id === s.selectedId, hov: w.id === C.value }]),
              onMousedown: (K) => Qe(K, w.id),
              onMouseenter: (K) => C.value = w.id,
              onMouseleave: M[0] || (M[0] = (K) => C.value = null),
              onContextmenu: Re((K) => I("node-context", { id: w.id, x: K.clientX, y: K.clientY }), ["prevent", "stop"]),
              onDblclick: Re((K) => I("node-dblclick", w.id), ["stop"])
            }, [
              w.id === s.selectedId ? (t(), a("circle", {
                key: 0,
                r: w.radius + 7,
                class: "gx-halo",
                style: _e({ stroke: u(w.concept).fill })
              }, null, 12, Go)) : R("", !0),
              w.isDoc ? (t(), a("rect", {
                key: 1,
                x: -8,
                y: -6,
                width: "16",
                height: "12",
                rx: "3",
                fill: u(w.concept).fill,
                stroke: u(w.concept).stroke,
                "stroke-width": "1.5",
                class: "gx-shape"
              }, null, 8, jo)) : (t(), a("circle", {
                key: 2,
                r: w.radius,
                fill: u(w.concept).fill,
                stroke: u(w.concept).stroke,
                "stroke-width": w.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, Zo)),
              !w.isDoc && (w.concept.document_count || 0) > 0 ? (t(), a(ee, { key: 3 }, [
                l("circle", {
                  cx: w.radius * 0.72,
                  cy: -w.radius * 0.72,
                  r: "7.5",
                  class: "gx-badge-bg"
                }, null, 8, Qo),
                l("text", {
                  x: w.radius * 0.72,
                  y: -w.radius * 0.72,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  class: "gx-badge-txt"
                }, F(w.concept.document_count), 9, Jo)
              ], 64)) : R("", !0),
              et(w) ? (t(), a("text", {
                key: 4,
                y: w.isDoc ? 20 : w.radius + 15,
                "text-anchor": "middle",
                class: ke(["gx-label", { root: w.concept.is_root }])
              }, F(m(jt)(w.concept.label, w.isDoc ? 26 : 24)), 11, qo)) : R("", !0)
            ], 42, Ko))), 128))
          ])
        ], 12, Wo)
      ], 544))
    ], 512));
  }
}), tl = { class: "gx-ins-id" }, nl = { class: "gx-ins-name" }, ol = { class: "gx-ins-body" }, ll = { class: "gx-ins-stats" }, sl = {
  key: 0,
  class: "gx-stat"
}, al = {
  key: 1,
  class: "gx-stat"
}, il = {
  key: 1,
  class: "gx-rel-group"
}, cl = { class: "gx-rel-title" }, rl = { class: "kc-refs" }, ul = ["onClick"], dl = { class: "kc-ref-label" }, vl = {
  key: 0,
  class: "gx-rel-group"
}, fl = { class: "gx-rel-title" }, pl = ["onClick"], gl = { class: "gx-rel-kind" }, ml = { class: "gx-rel-label" }, hl = {
  key: 1,
  class: "gx-rel-group"
}, yl = { class: "gx-rel-title" }, bl = ["onClick"], kl = { class: "gx-rel-kind" }, xl = { class: "gx-rel-label" }, wl = {
  key: 3,
  class: "gx-ins-loading"
}, _l = {
  key: 4,
  class: "gx-ins-content"
}, $l = {
  key: 0,
  class: "gx-ins-doc-t"
}, Cl = ["content-type", "source"], Il = {
  key: 0,
  class: "gx-ins-clamp-fade",
  "aria-hidden": "true"
}, Ml = ["aria-expanded"], Sl = {
  key: 5,
  class: "gx-ins-empty"
}, ht = "kb10:inspect:width", Rl = 320, Ol = 860, Tl = 560, El = /* @__PURE__ */ $e({
  __name: "GraphInspector",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    labelOf: { type: Function },
    colorOf: { type: Function },
    originalOpen: { type: Boolean }
  },
  emits: ["select", "close", "original-available", "toggle-original"],
  setup(s, { emit: r }) {
    const e = s, o = r, f = O(() => e.colorOf?.(e.concept.id) || Ee(e.concept).fill);
    function u(i) {
      return e.colorOf?.(i) || Ee({}).fill;
    }
    const I = O(() => e.concept.node_type === "document"), b = O(() => e.edges.filter((i) => i.from_node_id === e.concept.id).map((i) => ({ id: i.id, kind: vt[i.edge_type || ""] || i.edge_type || "related", otherId: i.to_node_id, label: i.to_label || e.labelOf(i.to_node_id) }))), x = O(() => e.edges.filter((i) => i.to_node_id === e.concept.id).map((i) => ({ id: i.id, kind: vt[i.edge_type || ""] || i.edge_type || "related", otherId: i.from_node_id, label: i.from_label || e.labelOf(i.from_node_id) }))), _ = O(() => b.value.length + x.value.length), N = O(() => I.value ? Zt(e.concept.id, e.edges).map((i) => ({ id: i.id, label: i.label || e.labelOf(i.id) })) : []), S = O(() => {
      if (I.value) return [e.concept.id];
      const i = [];
      for (const p of e.edges)
        p.edge_type === "categorized_as" && p.to_node_id === e.concept.id && i.push(p.from_node_id);
      return i;
    }), A = T(!1), P = T([]), W = T(""), j = O(() => P.value.find((i) => _t(i.origMime)) || null), D = O(() => W.value ? { text: W.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function H(i) {
      try {
        const { data: p } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(i)}`);
        if (!p?.success || !p.node) return null;
        const v = p.node, U = String(v.content || "");
        if (!U.trim()) return null;
        const Y = v.metadata || {}, J = String(Y.original_mime_type || Y.source_mime || ""), Z = !!wt(Y);
        return {
          id: i,
          title: Y.title || Y.filename || Y.original_filename || e.labelOf(i),
          content: U,
          contentType: v.content_type || "text/markdown",
          origMime: Z ? J : "",
          sourceUrl: `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(i)}/source`
        };
      } catch {
        return null;
      }
    }
    async function y(i) {
      try {
        const { data: p } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(i)}&include_content=true&limit=200`);
        if (!p?.success) return "";
        const v = p.nodes?.find((U) => U.node_type === "summary");
        return String(v?.content || "");
      } catch {
        return "";
      }
    }
    let d = 0;
    async function C() {
      const i = ++d;
      P.value = [], W.value = "", ue.value = !1, he.value = !1;
      const p = S.value;
      if (p.length) {
        A.value = !0;
        try {
          const v = await Promise.all(p.map(H));
          if (i !== d) return;
          if (P.value = v.filter((U) => U != null), I.value) {
            const U = await y(e.concept.id);
            if (i !== d) return;
            W.value = U;
          }
        } finally {
          i === d && (A.value = !1);
        }
      }
    }
    re(j, (i) => {
      o("original-available", i ? { contentType: i.origMime, sourceUrl: i.sourceUrl, title: i.title } : null);
    }, { immediate: !0 });
    function E(i) {
      return Math.max(Rl, Math.min(Ol, i));
    }
    function V() {
      const i = Number(localStorage.getItem(ht));
      return Number.isFinite(i) && i > 0 ? E(i) : 430;
    }
    const te = T(V()), ne = T(null), fe = T(!1);
    function B(i) {
      const p = ne.value;
      if (!p) return;
      const v = p.getBoundingClientRect();
      te.value = E(v.right - i.clientX);
    }
    function k() {
      fe.value = !1, window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", k), localStorage.setItem(ht, String(Math.round(te.value)));
    }
    function X(i) {
      i.preventDefault(), fe.value = !0, window.addEventListener("pointermove", B), window.addEventListener("pointerup", k);
    }
    const le = T(null), ue = T(!1), he = T(!1);
    function xe() {
      const i = le.value;
      if (!i) {
        he.value = !1;
        return;
      }
      he.value = i.scrollHeight - Tl > 24;
    }
    let Ce = null;
    function ye() {
      Ce?.disconnect();
      const i = le.value;
      i && (Ce = new ResizeObserver(() => xe()), Ce.observe(i), st(xe));
    }
    const L = O(() => he.value && !ue.value);
    return re([P, A], () => {
      A.value || st(ye);
    }), re(() => e.concept.id, C, { immediate: !0 }), Ze(() => {
      Ce?.disconnect(), k();
    }), (i, p) => (t(), a("aside", {
      ref_key: "asideRef",
      ref: ne,
      class: ke(["gx-inspect", { dragging: fe.value }]),
      style: _e({ width: te.value + "px" })
    }, [
      l("div", {
        class: "gx-ins-resizer",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize inspector",
        onPointerdown: X
      }, [...p[3] || (p[3] = [
        l("span", { class: "gx-ins-resizer-grip" }, null, -1)
      ])], 32),
      l("header", {
        class: "gx-ins-h",
        style: _e({ "--accent": f.value })
      }, [
        p[4] || (p[4] = l("span", { class: "gx-ins-dot" }, null, -1)),
        l("div", tl, [
          l("h3", nl, F(s.concept.label), 1),
          j.value ? (t(), se(m(bt), {
            key: 0,
            class: ke(["gx-ins-orig-btn", { on: s.originalOpen }]),
            label: s.originalOpen ? "Hide original" : "View original",
            onOpen: p[0] || (p[0] = (v) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : R("", !0)
        ]),
        l("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: p[1] || (p[1] = (v) => o("close"))
        }, [
          $(m(z), { icon: "tabler:x" })
        ])
      ], 4),
      l("div", ol, [
        l("div", ll, [
          s.concept.document_count ? (t(), a("div", sl, [
            $(m(z), { icon: "tabler:files" }),
            l("span", null, F(s.concept.document_count) + " linked", 1)
          ])) : R("", !0),
          _.value ? (t(), a("div", al, [
            $(m(z), { icon: "tabler:arrows-split-2" }),
            p[5] || (p[5] = l("span", null, "relations", -1)),
            $(m(nn), { value: _.value }, null, 8, ["value"])
          ])) : R("", !0)
        ]),
        D.value ? (t(), se(m(kt), {
          key: s.concept.id,
          icon: D.value.icon,
          label: D.value.label,
          text: D.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : R("", !0),
        N.value.length ? (t(), a("section", il, [
          l("div", cl, [
            $(m(z), { icon: "tabler:link" }),
            p[6] || (p[6] = ae("Filed under", -1))
          ]),
          l("div", rl, [
            (t(!0), a(ee, null, ve(N.value, (v) => (t(), a("button", {
              key: v.id,
              class: "kc-ref",
              onClick: (U) => o("select", v.id)
            }, [
              l("span", {
                class: "kc-ref-dot",
                style: _e({ background: u(v.id) })
              }, null, 4),
              l("span", dl, F(v.label), 1),
              $(m(z), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, ul))), 128))
          ])
        ])) : R("", !0),
        I.value ? R("", !0) : (t(), a(ee, { key: 2 }, [
          b.value.length ? (t(), a("section", vl, [
            l("div", fl, [
              $(m(z), { icon: "tabler:arrow-up-right" }),
              p[7] || (p[7] = ae("Relates to", -1))
            ]),
            (t(!0), a(ee, null, ve(b.value, (v) => (t(), a("button", {
              key: v.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", v.otherId)
            }, [
              l("span", gl, F(v.kind), 1),
              l("span", ml, F(v.label), 1),
              $(m(z), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, pl))), 128))
          ])) : R("", !0),
          x.value.length ? (t(), a("section", hl, [
            l("div", yl, [
              $(m(z), { icon: "tabler:arrow-down-left" }),
              p[8] || (p[8] = ae("Referenced by", -1))
            ]),
            (t(!0), a(ee, null, ve(x.value, (v) => (t(), a("button", {
              key: v.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", v.otherId)
            }, [
              l("span", kl, F(v.kind), 1),
              l("span", xl, F(v.label), 1),
              $(m(z), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, bl))), 128))
          ])) : R("", !0)
        ], 64)),
        A.value ? (t(), a("div", wl, [
          $(m(z), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          p[9] || (p[9] = l("span", null, "Loading content…", -1))
        ])) : P.value.length ? (t(), a("section", _l, [
          l("div", {
            class: ke(["gx-ins-clamp", { clamped: L.value }])
          }, [
            l("div", {
              ref_key: "contentRef",
              ref: le,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), a(ee, null, ve(P.value, (v) => (t(), a("div", {
                key: v.id,
                class: "gx-ins-doc"
              }, [
                P.value.length > 1 ? (t(), a("div", $l, F(v.title), 1)) : R("", !0),
                l("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": v.contentType,
                  source: v.content
                }, null, 8, Cl)
              ]))), 128))
            ], 512),
            L.value ? (t(), a("div", Il)) : R("", !0)
          ], 2),
          he.value ? (t(), a("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": ue.value,
            onClick: p[2] || (p[2] = (v) => ue.value = !ue.value)
          }, [
            $(m(z), {
              icon: ue.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ae(" " + F(ue.value ? "Show less" : "Show more"), 1)
          ], 8, Ml)) : R("", !0)
        ])) : R("", !0),
        !A.value && !D.value && !P.value.length && !N.value.length && !b.value.length && !x.value.length ? (t(), a("div", Sl, [
          $(m(z), { icon: "tabler:circle-dashed" }),
          p[10] || (p[10] = l("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : R("", !0)
      ])
    ], 6));
  }
}), Dl = ["aria-label", "aria-expanded", "title"], Ll = { key: 0 }, Fl = {
  key: 0,
  class: "gx-legend-body"
}, Nl = { class: "gx-legend-row" }, Al = { class: "gx-legend-row" }, Bl = /* @__PURE__ */ $e({
  __name: "GraphLegend",
  setup(s) {
    const r = T(!1);
    return (e, o) => (t(), a("div", {
      class: ke(["gx-legend", { collapsed: !r.value }])
    }, [
      l("button", {
        type: "button",
        class: "gx-legend-toggle",
        "aria-label": r.value ? "Hide legend" : "Show legend",
        "aria-expanded": r.value,
        title: r.value ? "Hide legend" : "Show legend",
        onClick: o[0] || (o[0] = (f) => r.value = !r.value)
      }, [
        $(m(z), {
          icon: r.value ? "tabler:chevron-down" : "tabler:list-details"
        }, null, 8, ["icon"]),
        r.value ? R("", !0) : (t(), a("span", Ll, "Legend"))
      ], 8, Dl),
      r.value ? (t(), a("div", Fl, [
        o[3] || (o[3] = l("div", { class: "gx-legend-row" }, [
          l("span", { class: "gx-legend-mark gx-legend-cluster" }),
          ae(" Color = topic cluster ")
        ], -1)),
        l("div", Nl, [
          l("span", {
            class: "gx-legend-mark",
            style: _e({ background: m(ft).root.fill })
          }, null, 4),
          o[1] || (o[1] = ae(" Root concept ", -1))
        ]),
        l("div", Al, [
          l("span", {
            class: "gx-legend-mark doc",
            style: _e({ background: m(ft).document.fill })
          }, null, 4),
          o[2] || (o[2] = ae(" Source document ", -1))
        ]),
        o[4] || (o[4] = At('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : R("", !0)
    ], 2));
  }
}), Ul = { class: "gx-controls" }, zl = { class: "gx-ctrl-read" }, Pl = /* @__PURE__ */ $e({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(s, { emit: r }) {
    const e = r;
    return (o, f) => (t(), a("div", Ul, [
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: f[0] || (f[0] = (u) => e("zoom-in"))
      }, [
        $(m(z), { icon: "tabler:plus" })
      ]),
      l("div", zl, F(Math.round(s.scale * 100)) + "%", 1),
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom out",
        "aria-label": "Zoom out",
        onClick: f[1] || (f[1] = (u) => e("zoom-out"))
      }, [
        $(m(z), { icon: "tabler:minus" })
      ]),
      l("button", {
        class: "gx-ctrl fit",
        type: "button",
        title: "Fit to view",
        "aria-label": "Fit to view",
        onClick: f[2] || (f[2] = (u) => e("fit"))
      }, [
        $(m(z), { icon: "tabler:focus-centered" })
      ])
    ]));
  }
}), Vl = { class: "gx-display" }, Wl = ["title"], Hl = ["max", "value"], Xl = { class: "gx-display-lvl" }, Yl = { class: "gx-display-lvl-max" }, Kl = ["aria-checked", "title"], Gl = /* @__PURE__ */ $e({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(s, { emit: r }) {
    const e = r;
    return (o, f) => (t(), a("div", Vl, [
      s.maxLevel > 1 ? (t(), a("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${s.level} of ${s.maxLevel} levels`
      }, [
        $(m(z), {
          class: "gx-display-ic",
          icon: "tabler:stack-2",
          "aria-hidden": "true"
        }),
        l("input", {
          class: "gx-range",
          type: "range",
          min: "1",
          max: s.maxLevel,
          value: s.level,
          "aria-label": "Graph depth",
          onInput: f[0] || (f[0] = (u) => e("update:level", Number(u.target.value)))
        }, null, 40, Hl),
        l("span", Xl, [
          ae(F(s.level), 1),
          l("span", Yl, "/" + F(s.maxLevel), 1)
        ]),
        f[3] || (f[3] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Wl)) : R("", !0),
      l("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": s.conceptsOnly,
        title: s.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: f[1] || (f[1] = (u) => e("toggle-concepts"))
      }, [
        $(m(z), {
          icon: s.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        f[5] || (f[5] = l("span", { class: "gx-display-label" }, "Concepts only", -1)),
        l("span", {
          class: ke(["gx-display-sw", { on: s.conceptsOnly }])
        }, [...f[4] || (f[4] = [
          l("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Kl),
      s.hiddenCount || s.focused || s.level < s.maxLevel ? (t(), a(ee, { key: 1 }, [
        f[7] || (f[7] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1)),
        l("button", {
          class: "gx-display-reset",
          title: "Show every node and clear branch isolation",
          onClick: f[2] || (f[2] = (u) => e("reset"))
        }, [
          $(m(z), {
            icon: "tabler:arrow-back-up",
            "aria-hidden": "true"
          }),
          f[6] || (f[6] = l("span", null, "Reset", -1))
        ])
      ], 64)) : R("", !0)
    ]));
  }
});
function We(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function yt(s) {
  const r = We(s) ? s : { message: String(s) }, e = r.response, o = We(e) && e.status === 401 ? "auth-expired" : "other";
  Ue.handleError(o, r);
}
const jl = { class: "kb-railtop" }, Zl = { class: "kb-railtop-acts" }, Ql = {
  key: 0,
  class: "kx-main-scroll"
}, Jl = {
  key: 1,
  class: "gx-canvas-wrap"
}, ql = { class: "gx-botleft" }, es = {
  key: 0,
  class: "gx-focusbar"
}, ts = ["title"], ns = { class: "gx-focusbar-name" }, os = {
  key: 0,
  class: "gx-sparse"
}, ls = { class: "gx-treat" }, ss = { class: "gx-treat-check" }, as = { class: "ap-field" }, is = ["value"], cs = { class: "ap-field" }, rs = { class: "gx-treat-actions" }, us = /* @__PURE__ */ $e({
  __name: "GraphView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    canAnswer: { type: Boolean },
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(s, { emit: r }) {
    const e = s, o = r, { navWidth: f, railRef: u, navDragging: I, onStart: b } = Lt(), x = T(null), _ = T(1), N = /* @__PURE__ */ new Set(), S = O(() => {
      const c = /* @__PURE__ */ new Map();
      for (const n of e.concepts) c.set(n.id, n);
      return c;
    }), A = O(() => e.selectedId && S.value.get(e.selectedId) || null), P = O(() => {
      const c = /* @__PURE__ */ new Map();
      for (const n of e.concepts) c.set(n.id, n.label || n.id.slice(0, 8));
      return c;
    });
    function W(c) {
      return P.value.get(c) || c.slice(0, 8);
    }
    const j = O(() => Qt(e.concepts, e.edges));
    function D(c) {
      return j.value.get(c)?.fill || Ee({}).fill;
    }
    const H = O(() => {
      const c = /* @__PURE__ */ new Map();
      for (const n of e.edges)
        (n.edge_type === "subtopic_of" || n.edge_type === "categorized_as") && S.value.has(n.from_node_id) && S.value.has(n.to_node_id) && c.set(n.from_node_id, n.to_node_id);
      return c;
    }), y = O(() => {
      const c = /* @__PURE__ */ new Map();
      for (const n of e.edges) {
        if (n.from_node_id === n.to_node_id) continue;
        const g = c.get(n.to_node_id) || [];
        g.push(n.from_node_id), c.set(n.to_node_id, g);
      }
      return c;
    });
    function d(c) {
      const n = /* @__PURE__ */ new Set([c]), g = [c];
      for (; g.length; ) {
        const Q = g.pop();
        for (const oe of y.value.get(Q) || [])
          n.has(oe) || (n.add(oe), g.push(oe));
      }
      return n;
    }
    const C = O(() => {
      const c = /* @__PURE__ */ new Map(), n = H.value, g = (Q, oe) => {
        const pe = c.get(Q);
        if (pe !== void 0) return pe;
        const Le = n.get(Q);
        if (Le === void 0 || oe.has(Q))
          return c.set(Q, 0), 0;
        oe.add(Q);
        const Ve = g(Le, oe) + 1;
        return c.set(Q, Ve), Ve;
      };
      for (const Q of e.concepts) g(Q.id, /* @__PURE__ */ new Set());
      return c;
    }), E = O(() => k.value ? C.value.get(k.value) ?? 0 : 0);
    function V(c) {
      return (C.value.get(c) ?? 0) - E.value;
    }
    const te = O(() => {
      let c = 1;
      const n = Ce.value;
      for (const g of e.concepts) {
        if (n && !n.has(g.id)) continue;
        const Q = V(g.id);
        Q > c && (c = Q);
      }
      return c;
    }), ne = T(99), fe = O(() => Math.min(ne.value, te.value)), B = T(/* @__PURE__ */ new Set()), k = T(null), X = T(!1);
    function le(c) {
      ne.value = c;
    }
    function ue(c) {
      const n = new Set(B.value);
      n.add(c), B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function he(c) {
      const n = new Set(B.value);
      for (const g of d(c)) n.add(g);
      B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const xe = O(() => k.value && e.concepts.find((c) => c.id === k.value) || null), Ce = O(() => k.value ? d(k.value) : null);
    function ye(c) {
      k.value = k.value === c ? null : c, k.value && o("select", c);
    }
    function L(c) {
      k.value = c, o("select", c);
    }
    function i() {
      if (!k.value) return;
      const c = H.value.get(k.value);
      c && S.value.has(c) && !S.value.get(c)?.is_root ? (k.value = c, o("select", c)) : k.value = null;
    }
    const p = O(() => {
      if (!k.value) return "";
      const c = H.value.get(k.value), n = c ? S.value.get(c) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function v() {
      k.value = null;
    }
    function U() {
      B.value = /* @__PURE__ */ new Set(), k.value = null, ne.value = 99, X.value = !1;
    }
    re(k, () => {
      ne.value = 99;
    });
    const Y = O(() => {
      const c = Ce.value;
      if (!c && !X.value && !B.value.size && fe.value >= te.value) return null;
      const n = /* @__PURE__ */ new Set();
      for (const g of e.concepts)
        c && !c.has(g.id) || V(g.id) > fe.value || X.value && g.node_type === "document" || B.value.has(g.id) || n.add(g.id);
      return n;
    });
    function J(c) {
      o("select", c), x.value?.focus(c);
    }
    const Z = T({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), Oe = O(() => {
      const c = Z.value.concept;
      if (!c) return [];
      const n = [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "isolate", label: k.value === c.id ? "Clear isolation" : "Isolate branch", icon: "tabler:focus-2" },
        { id: "hide", label: "Hide node", icon: "tabler:eye-off" },
        { id: "hide-branch", label: "Hide branch", icon: "tabler:binary-tree" }
      ];
      return c.node_type !== "document" && n.push(
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!c.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!c.is_root }
      ), n;
    });
    function ze(c, n, g) {
      Z.value = { open: !0, x: n, y: g, concept: c };
    }
    function Qe(c) {
      const n = S.value.get(c.id);
      n && ze(n, c.x, c.y);
    }
    function Pe(c) {
      const n = Z.value.concept;
      if (n)
        switch (c) {
          case "open":
            J(n.id);
            break;
          case "isolate":
            ye(n.id);
            break;
          case "hide":
            ue(n.id);
            break;
          case "hide-branch":
            he(n.id);
            break;
          default:
            Ne.value = n, Me.value = c;
            break;
        }
    }
    const Me = T(""), Ne = T(null), Je = O(() => ({ add: "Add child concept", rename: "Rename concept", move: "Move concept", delete: "Delete concept" })[Me.value] || "");
    function qe(c) {
      Me.value = "", c && o("select", c), o("changed");
    }
    const De = T(!1);
    function et(c) {
      De.value = !1;
      const n = c.parent_id || c.id;
      n && e.concepts.some((g) => g.id === n) && J(n);
    }
    const h = O(() => e.selectedId ? e.edges.filter((c) => c.from_node_id === e.selectedId || c.to_node_id === e.selectedId) : []), M = T(null), w = T(null);
    re(() => e.selectedId, () => {
      M.value = null, w.value = null;
    });
    function K() {
      if (M.value) {
        M.value = null;
        return;
      }
      w.value && (M.value = w.value);
    }
    const q = O(() => e.concepts.length > 0 && e.concepts.length < 2), G = T(null);
    function me() {
      o("changed");
    }
    const de = T(!1), be = T("class:fast"), ie = T(""), ce = T(!1);
    async function we() {
      if (e.kbId)
        try {
          const { data: c } = await Ie.get(`/api/v1/knowledge/${e.kbId}`);
          if (!We(c)) return;
          const n = We(c.knowledge_base) && c.knowledge_base.config || c.config, g = We(n) ? n : {};
          de.value = g.treatment_enabled === !0, typeof g.treatment_model == "string" && g.treatment_model && (be.value = g.treatment_model), typeof g.treatment_prompt == "string" && (ie.value = g.treatment_prompt);
        } catch {
        }
    }
    async function Se() {
      if (!(!e.kbId || ce.value)) {
        ce.value = !0;
        try {
          await Ie.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: de.value,
            treatment_model: be.value,
            treatment_prompt: ie.value
          } });
          try {
            Ue?.toast?.("Merge settings saved");
          } catch {
          }
        } catch (c) {
          try {
            yt(c);
          } catch {
          }
        } finally {
          ce.value = !1;
        }
      }
    }
    async function Ae() {
      if (!(!e.kbId || ce.value)) {
        ce.value = !0;
        try {
          await Ie.post(`/api/v1/knowledge/${e.kbId}/treatment`, {});
          try {
            Ue?.toast?.("Merge started — duplicate concepts will be merged.");
          } catch {
          }
        } catch (c) {
          try {
            yt(c);
          } catch {
          }
        } finally {
          ce.value = !1;
        }
      }
    }
    function Be(c) {
      const n = c && (c.detail ?? (c.target && c.target.value));
      typeof n == "string" && n && (be.value = n);
    }
    return ct(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), at("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), we();
    }), re(() => e.kbId, () => {
      B.value = /* @__PURE__ */ new Set(), k.value = null, ne.value = 99, X.value = !1, we();
    }), (c, n) => (t(), a("div", {
      ref_key: "railRef",
      ref: u,
      class: ke(["gx", { "wk-dragging": m(I) }]),
      style: _e({ "--kx-rail-width": m(f) + "px" })
    }, [
      s.concepts.length ? (t(), se(m(Ct), { key: 0 }, {
        rail: ge(() => [
          l("div", jl, [
            l("div", Zl, [
              $(m(Te), {
                icon: "tabler:search",
                label: "Search",
                active: De.value,
                onClick: n[0] || (n[0] = (g) => De.value = !De.value)
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:plus",
                label: "Add content",
                active: G.value === "add",
                onClick: n[1] || (n[1] = (g) => G.value = "add")
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:wand",
                label: "Merge duplicate concepts",
                active: G.value === "treatment",
                onClick: n[2] || (n[2] = (g) => G.value = "treatment")
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: s.loading,
                spin: s.loading,
                onClick: n[3] || (n[3] = (g) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: s.concepts,
            edges: s.edges,
            "selected-id": s.selectedId,
            onSelect: J,
            onContext: n[4] || (n[4] = (g) => ze(g.concept, g.x, g.y))
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: n[5] || (n[5] = //@ts-ignore
            (...g) => m(b) && m(b)(...g))
          }, [...n[26] || (n[26] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: ge(() => [
          De.value ? (t(), a("div", Ql, [
            $(m(It), {
              "kb-id": s.kbId,
              layout: "panel",
              ask: s.canAnswer,
              onOpen: et,
              onClose: n[6] || (n[6] = (g) => De.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), a("div", Jl, [
            $(el, {
              ref_key: "canvasRef",
              ref: x,
              concepts: s.concepts,
              edges: s.edges,
              "visible-ids": Y.value,
              colors: j.value,
              "selected-id": s.selectedId || null,
              "highlight-ids": m(N),
              onSelect: n[7] || (n[7] = (g) => o("select", g || "")),
              onScale: n[8] || (n[8] = (g) => _.value = g),
              onNodeContext: Qe,
              onNodeDblclick: L
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            l("div", ql, [
              $(Bl),
              $(Gl, {
                level: fe.value,
                "max-level": te.value,
                "concepts-only": X.value,
                "hidden-count": B.value.size,
                focused: !!k.value,
                "onUpdate:level": le,
                onToggleConcepts: n[9] || (n[9] = (g) => X.value = !X.value),
                onReset: U
              }, null, 8, ["level", "max-level", "concepts-only", "hidden-count", "focused"])
            ]),
            $(Pl, {
              scale: _.value,
              onZoomIn: n[10] || (n[10] = (g) => x.value?.zoomBy(1.25)),
              onZoomOut: n[11] || (n[11] = (g) => x.value?.zoomBy(0.8)),
              onFit: n[12] || (n[12] = (g) => x.value?.fit())
            }, null, 8, ["scale"]),
            $(Ye, { name: "gx-ins-fade" }, {
              default: ge(() => [
                xe.value ? (t(), a("div", es, [
                  l("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${p.value}`,
                    onClick: i
                  }, [
                    $(m(z), {
                      icon: "tabler:arrow-up",
                      "aria-hidden": "true"
                    })
                  ], 8, ts),
                  $(m(z), {
                    class: "gx-focusbar-ic",
                    icon: "tabler:focus-2",
                    "aria-hidden": "true"
                  }),
                  l("span", ns, F(xe.value.label || "concept"), 1),
                  l("button", {
                    class: "gx-focusbar-x",
                    title: "Show the whole graph",
                    onClick: v
                  }, [
                    $(m(z), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ])
                ])) : R("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: ge(() => [
                A.value ? (t(), se(El, {
                  key: 0,
                  "kb-id": s.kbId,
                  concept: A.value,
                  edges: h.value,
                  "label-of": W,
                  "color-of": D,
                  "original-open": !!M.value,
                  onSelect: n[13] || (n[13] = (g) => J(g)),
                  onClose: n[14] || (n[14] = (g) => o("select", "")),
                  onOriginalAvailable: n[15] || (n[15] = (g) => w.value = g),
                  onToggleOriginal: K
                }, null, 8, ["kb-id", "concept", "edges", "original-open"])) : R("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: ge(() => [
                q.value ? (t(), a("div", os, [
                  $(m(z), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = l("span", null, "Add more content to grow the graph.", -1)),
                  l("button", {
                    class: "gx-sparse-cta",
                    onClick: n[16] || (n[16] = (g) => G.value = "add")
                  }, [
                    $(m(z), {
                      icon: "tabler:plus",
                      "aria-hidden": "true"
                    }),
                    n[27] || (n[27] = ae(" Add content ", -1))
                  ])
                ])) : R("", !0)
              ]),
              _: 1
            })
          ]))
        ]),
        _: 1
      })) : (t(), se(Mt, {
        key: 1,
        icon: "tabler:topology-star-3",
        title: "No concepts yet",
        hint: "Add documents to start building the concept graph — relationships are extracted automatically.",
        cta: "Add content",
        "cta-icon": "tabler:plus",
        onCta: n[17] || (n[17] = (g) => G.value = "add")
      })),
      $(m(Ke), {
        open: G.value === "add",
        title: "Add content",
        icon: "tabler:plus",
        onClose: n[18] || (n[18] = (g) => G.value = null)
      }, {
        default: ge(() => [
          $(St, {
            "kb-id": s.kbId,
            noun: "document",
            onChanged: me
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(m(Ke), {
        open: G.value === "treatment",
        title: "Merge duplicate concepts",
        icon: "tabler:wand",
        onClose: n[21] || (n[21] = (g) => G.value = null)
      }, {
        default: ge(() => [
          l("div", ls, [
            l("label", ss, [
              Fe(l("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (g) => de.value = g)
              }, null, 512), [
                [Bt, de.value]
              ]),
              n[29] || (n[29] = l("span", null, "Automatically merge duplicate concepts after adding content", -1))
            ]),
            l("div", as, [
              n[30] || (n[30] = l("span", { class: "ap-label" }, "Model", -1)),
              l("wc-model-picker", {
                value: be.value,
                capability: "generate",
                onSelect: Be
              }, null, 40, is)
            ]),
            l("div", cs, [
              n[31] || (n[31] = l("span", { class: "ap-label" }, [
                ae("Prompt "),
                l("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Fe(l("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (g) => ie.value = g),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for merging duplicate concepts…"
              }, null, 512), [
                [Ge, ie.value]
              ])
            ]),
            l("div", rs, [
              $(m(je), {
                variant: "soft",
                disabled: ce.value,
                onClick: Se
              }, {
                default: ge(() => [...n[32] || (n[32] = [
                  ae("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(m(je), {
                variant: "primary",
                disabled: ce.value,
                onClick: Ae
              }, {
                default: ge(() => [...n[33] || (n[33] = [
                  ae("Run now", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n[34] || (n[34] = l("p", { class: "gx-treat-hint" }, "Merges concepts with the same or very similar meanings. Run it here, or enable automatic merging after adding content.", -1))
          ])
        ]),
        _: 1
      }, 8, ["open"]),
      $(m(Ke), {
        open: !!Me.value,
        title: Je.value,
        icon: "tabler:sitemap",
        onClose: n[23] || (n[23] = (g) => Me.value = "")
      }, {
        default: ge(() => [
          Me.value ? (t(), se(Rt, {
            key: 0,
            "kb-id": s.kbId,
            mode: Me.value,
            target: Ne.value,
            concepts: s.concepts,
            edges: s.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (g) => Me.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(m(xt), {
        contained: "",
        open: !!M.value,
        title: M.value?.title || A.value?.label || "",
        "content-type": M.value?.contentType || "",
        "source-url": M.value?.sourceUrl || "",
        onClose: n[24] || (n[24] = (g) => M.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"]),
      $(Tt, {
        open: Z.value.open,
        x: Z.value.x,
        y: Z.value.y,
        items: Oe.value,
        onPick: Pe,
        onClose: n[25] || (n[25] = (g) => Z.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), ds = { class: "kb-page" }, vs = ["disabled"], fs = "kb10:wiki:view", ps = /* @__PURE__ */ $e({
  __name: "KbWiki",
  setup(s) {
    const r = Ut(), e = zt(), o = O(() => r.value.config?.kb_id || ""), { indexingNotice: f, onMeta: u } = Jt(() => o.value), I = O(() => r.value.config?.route || "");
    let b = !1;
    function x() {
      const L = r.value.config?.view;
      return L === "graph" || L === "wiki" ? L : localStorage.getItem(fs) === "graph" ? "graph" : "wiki";
    }
    const _ = T(x());
    re(() => r.value.config?.view, (L) => {
      (L === "graph" || L === "wiki") && L !== _.value && (_.value = L);
    });
    const N = T(!1), S = T(""), A = T([]), P = T([]), W = T(""), j = T(!1), D = T(null), H = T(!1), y = O(() => {
      const L = D.value;
      return L ? L.error ? `Graph enrichment failed: ${L.error}` : L.agent_missing ? L.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), d = O(() => !!D.value?.error);
    async function C() {
      if (!(!o.value || H.value)) {
        H.value = !0;
        try {
          await Ie.post(`/api/v1/kb10/${o.value}/enrichment`), D.value = null;
        } catch (L) {
          Ue.handleError(L?.response?.status === 401 ? "auth-expired" : "other", L);
        } finally {
          H.value = !1;
        }
      }
    }
    const E = O(() => {
      const L = /* @__PURE__ */ new Map();
      for (const i of A.value) L.set(i.id, i);
      return L;
    }), V = O(() => $t(A.value, P.value)[0]?.concept.id || "");
    async function te() {
      if (!o.value) {
        j.value = !1;
        return;
      }
      try {
        const { data: L } = await Ie.get(`/api/v1/knowledge/${o.value}`), i = L?.config || L?.knowledge_base?.config || {};
        j.value = en(i);
      } catch {
        j.value = !1;
      }
    }
    let ne = 0;
    async function fe(L = !1) {
      if (!o.value) return;
      const i = ++ne;
      L || (N.value = !0), S.value = "";
      try {
        const { data: p } = await Ie.get(`/api/v1/kb10/${o.value}/graph`);
        if (i !== ne) return;
        if (p?.success) {
          A.value = p.nodes || [], P.value = p.edges || [];
          const v = p.enrichment || {};
          D.value = v.error || v.agent_missing ? v : null, W.value && !E.value.has(W.value) && (W.value = ""), W.value || (I.value && E.value.has(I.value) ? B(I.value) : _.value === "wiki" && V.value && (b = !0, W.value = V.value, b = !1));
        } else
          S.value = p?.error && gt(p.error) ? pt : p?.error || "";
      } catch (p) {
        if (i !== ne) return;
        const v = p?.response?.data?.error || p?.message || "could not load the knowledge base";
        S.value = gt(v) ? pt : v, Ue.handleError(p?.response?.status === 401 ? "auth-expired" : "other", p);
      } finally {
        i === ne && !L && (N.value = !1);
      }
    }
    function B(L) {
      if ((L || "") !== (W.value || "")) {
        if (!L) {
          W.value = "";
          return;
        }
        E.value.has(L) && (b = !0, W.value = L, b = !1);
      }
    }
    re(W, (L) => {
      b || e("navigate", L || "");
    }), re(I, (L) => B(L));
    let k = null;
    function X() {
      k && clearTimeout(k), k = setTimeout(() => {
        k = null, fe(!0);
      }, 400);
    }
    let le = null, ue = 0;
    function he(L) {
      const i = ++ue;
      if (le && (le(), le = null), !L) return;
      const p = qt(L, (v) => {
        u(v), X();
      });
      if (i !== ue) {
        p && p();
        return;
      }
      le = p;
    }
    Ze(() => {
      ue++, k && clearTimeout(k), le && le();
    }), re(_, (L) => {
      L === "wiki" && !W.value && V.value && (b = !0, W.value = V.value, b = !1);
    }), re(o, (L) => {
      W.value = "", fe(), te(), he(L);
    }, { immediate: !0 });
    function xe(L) {
      L !== W.value && (W.value = L);
    }
    function Ce() {
      o.value && e("kb-changed", { kb_id: o.value }), fe(!0);
    }
    function ye() {
      fe();
    }
    return (L, i) => (t(), a("div", ds, [
      S.value ? (t(), se(m(lt), {
        key: 0,
        tone: "info"
      }, {
        default: ge(() => [
          ae(F(S.value), 1)
        ]),
        _: 1
      })) : R("", !0),
      m(f) ? (t(), se(m(lt), {
        key: 1,
        role: "status"
      }, {
        default: ge(() => [
          ae(F(m(f)), 1)
        ]),
        _: 1
      })) : R("", !0),
      y.value ? (t(), se(m(lt), {
        key: 2,
        tone: "warn"
      }, {
        default: ge(() => [
          ae(F(y.value) + " ", 1),
          d.value ? (t(), a("button", {
            key: 0,
            type: "button",
            class: "kx-notice-action",
            disabled: H.value,
            onClick: C
          }, F(H.value ? "Retrying…" : "Retry"), 9, vs)) : R("", !0)
        ]),
        _: 1
      })) : R("", !0),
      N.value && !A.value.length ? (t(), se(m(an), {
        key: 3,
        icon: _.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: _.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), se(Ye, {
        key: 4,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: ge(() => [
          _.value === "wiki" ? (t(), se(zo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: A.value,
            edges: P.value,
            "selected-id": W.value,
            "can-answer": j.value,
            loading: N.value,
            onSelect: xe,
            onChanged: Ce,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"])) : (t(), se(us, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: A.value,
            edges: P.value,
            "selected-id": W.value,
            "can-answer": j.value,
            loading: N.value,
            onSelect: xe,
            onChanged: Ce,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"]))
        ]),
        _: 1
      }))
    ]));
  }
}), xs = {
  rootComponent: ps
};
export {
  xs as mountConfig
};
//# sourceMappingURL=wiki-mount-BMP0Wj5S.js.map
