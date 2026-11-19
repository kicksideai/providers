import { defineComponent as $e, openBlock as t, createElementBlock as s, toDisplayString as U, createElementVNode as l, createVNode as $, unref as m, createCommentVNode as T, ref as E, computed as R, watch as ve, onMounted as it, createBlock as ie, normalizeClass as xe, Fragment as ne, renderList as pe, createTextVNode as ce, normalizeStyle as _e, withModifiers as Se, withDirectives as Fe, vModelText as Ge, vModelSelect as rt, withCtx as be, onBeforeUnmount as Ze, onUnmounted as Nt, nextTick as lt, createStaticVNode as Ut, Transition as Ye, vModelCheckbox as Bt } from "vue";
import { loadByTagName as st, api as Ce, host as ze } from "@wippy-fe/proxy";
import { a as zt, u as At } from "./wc-runtime-f54Bo-yJ.js";
import { p as Pt, q as Vt, r as Wt, b as bt, d as Ht, e as kt, t as Ee, v as at, w as ot, f as xt, u as wt, a as _t, _ as Te, x as ut, y as $t, z as Xt, A as Yt, B as Kt, C as Gt, h as Ct, j as It, k as Mt, m as Ke, o as St, D as jt, F as dt, G as Zt, N as vt, H as Qt, g as ft, E as pt, i as gt, s as Jt } from "./AddPanel.vue_vue_type_script_setup_true_lang-xyhmMxIV.js";
import { Icon as A } from "@iconify/vue";
import { _ as je } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const qt = { class: "kx-count" }, en = /* @__PURE__ */ $e({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(a) {
    return (r, e) => (t(), s("span", qt, U(a.value), 1));
  }
}), tn = { class: "kx-loading kx-loading-centered" }, nn = { class: "kx-loading-inner" }, on = { key: 0 }, ln = /* @__PURE__ */ $e({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(a) {
    return (r, e) => (t(), s("div", tn, [
      l("div", nn, [
        $(m(A), {
          icon: a.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        a.label ? (t(), s("span", on, U(a.label), 1)) : T("", !0)
      ])
    ]));
  }
}), sn = {
  key: 0,
  class: "wr"
}, an = {
  key: 0,
  class: "wr-head"
}, cn = {
  key: 0,
  class: "wr-title-row"
}, rn = { class: "wr-title" }, un = {
  key: 1,
  class: "wr-lede"
}, dn = {
  key: 1,
  class: "wr-state"
}, vn = {
  key: 2,
  class: "wr-state err"
}, fn = {
  key: 1,
  class: "wr-doc"
}, pn = {
  key: 0,
  class: "wr-doc-head"
}, gn = { class: "wr-doc-sep" }, mn = ["aria-expanded", "onClick"], hn = ["source"], yn = {
  key: 3,
  class: "wr-prov"
}, bn = { class: "wr-prov-k" }, kn = ["href"], xn = {
  key: 1,
  class: "wr-prov-v"
}, wn = {
  key: 4,
  class: "wr-doc-rule"
}, _n = {
  key: 2,
  class: "wr-chunks"
}, $n = {
  key: 0,
  class: "wr-doc-sep"
}, Cn = ["aria-expanded", "onClick"], In = { class: "wr-chunk-n" }, Mn = { class: "wr-chunk-label" }, Sn = {
  key: 0,
  class: "wr-chunk-cx"
}, Rn = {
  key: 3,
  class: "wr-grid"
}, On = ["onClick"], Tn = { class: "wr-card-top" }, En = { class: "wr-card-ic" }, Dn = { class: "wr-card-name" }, Ln = {
  key: 0,
  class: "wr-card-desc"
}, Fn = { class: "wr-card-meta" }, Nn = { key: 0 }, Un = { key: 1 }, Bn = { key: 2 }, zn = {
  key: 4,
  class: "wr-state muted"
}, An = {
  key: 5,
  class: "wr-foot"
}, Pn = {
  key: 0,
  class: "wr-foot-group"
}, Vn = { class: "wr-foot-links" }, Wn = ["onClick"], Hn = {
  key: 1,
  class: "wr-foot-group"
}, Xn = { class: "wr-foot-links" }, Yn = ["onClick"], Kn = { class: "wr-foot-kind" }, Gn = /* @__PURE__ */ $e({
  __name: "WikiReader",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    conceptsById: {}
  },
  emits: ["navigate"],
  setup(a, { emit: r }) {
    const e = a, o = r;
    function v(u) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(u)}/source`;
    }
    const c = E(!1), I = E(""), y = E([]), b = E([]), C = E({}), N = E("rendered"), S = E(null), L = R(() => b.value.reduce((u, k) => u + k.chunks.length, 0)), P = R(() => {
      const u = /* @__PURE__ */ new Map();
      for (const k of b.value) k.summary && u.set(k.id, k.summary);
      return u;
    }), G = R(() => L.value > 0 || b.value.some((u) => u.summary));
    function Z(u) {
      C.value = { ...C.value, [u]: !C.value[u] };
    }
    const D = E({}), H = R(() => y.value.length > 1);
    function g(u) {
      return !H.value || !!D.value[u];
    }
    function d(u) {
      D.value = { ...D.value, [u]: !D.value[u] };
    }
    ve(y, () => {
      D.value = {};
    });
    const _ = R(() => Pt(e.concept, e.edges)), O = R(() => Vt(e.concept, e.edges, e.conceptsById)), V = R(() => Wt(e.concept, e.edges, e.conceptsById)), j = R(() => y.value.length > 0), oe = R(() => {
      const u = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return G.value && u.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: L.value || void 0 }), u;
    });
    function re(u) {
      return u.metadata?.original_mime_type || u.metadata?.source_mime || "";
    }
    function B(u) {
      const k = re(u);
      return wt(u.metadata) && _t(k) ? { contentType: k, sourceUrl: v(u.id) } : k === "application/pdf" ? { contentType: "application/pdf", sourceUrl: v(u.id) } : null;
    }
    function x(u) {
      if (S.value?.id === u.id) {
        S.value = null;
        return;
      }
      const k = B(u);
      k && (S.value = { id: u.id, contentType: k.contentType, sourceUrl: k.sourceUrl, title: u.title });
    }
    const W = R(() => y.value.find((u) => B(u)) || null), ge = R(() => !!W.value), me = R(() => !!W.value && S.value?.id === W.value.id);
    function F(u) {
      const k = u.metadata || {}, h = k.filename || k.original_filename, z = k.source_url, X = k.page ?? k.page_number, q = X != null && X !== "";
      if (!h && !z && !q) return [];
      const Q = [], Oe = k.original_mime_type || k.source_mime;
      return h && Q.push({ key: "filename", label: "File", value: String(h) }), Oe && Q.push({ key: "mime", label: "Type", value: String(Oe) }), z && Q.push({ key: "source", label: "Source", value: String(z), href: String(z) }), q && Q.push({ key: "page", label: "Page", value: String(X) }), Q;
    }
    async function se(u) {
      const { data: k } = await Ce.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(u)}`);
      if (!k?.success || !k.node) return null;
      const h = k.node, z = h.content || "";
      if (!z.trim()) return null;
      const X = h.metadata || {}, q = X.title || X.filename || X.source_url || e.conceptsById.get(u)?.label || "Document";
      return { id: u, title: q, content: z, contentType: h.content_type || "text/markdown", metadata: X };
    }
    it(() => {
      st("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function ee(u, k) {
      try {
        const { data: h } = await Ce.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(u)}&include_content=true&limit=200`);
        if (!h?.success) return null;
        const z = h.nodes || [], X = z.filter((Q) => Q.node_type === "chunk").sort((Q, Oe) => Number((Q.metadata || {}).index ?? (Q.metadata || {}).chunk_index ?? 0) - Number((Oe.metadata || {}).index ?? (Oe.metadata || {}).chunk_index ?? 0)).map((Q) => ({ id: Q.id, content: String(Q.content || ""), prefix: String((Q.metadata || {}).contextual_prefix || "") })), q = String((z.find((Q) => Q.node_type === "summary") || {}).content || "");
        return !X.length && !q ? null : { id: u, title: k, summary: q, chunks: X };
      } catch {
        return null;
      }
    }
    let ue = 0;
    async function Re() {
      const u = e.concept, k = ++ue;
      if (y.value = [], b.value = [], C.value = {}, I.value = "", N.value = "rendered", !u || !e.kbId) return;
      const h = _.value;
      if (h.length) {
        c.value = !0;
        try {
          const z = await Promise.all(h.map((q) => se(q).catch(() => null)));
          if (k !== ue) return;
          y.value = z.filter((q) => q != null), !y.value.length && h.length && (I.value = "The source for this page could not be loaded.");
          const X = await Promise.all(y.value.map((q) => ee(q.id, q.title)));
          if (k !== ue) return;
          b.value = X.filter((q) => q != null);
        } catch (z) {
          if (k !== ue) return;
          I.value = z?.response?.data?.error || z?.message || "could not load this page";
        } finally {
          k === ue && (c.value = !1);
        }
      }
    }
    return ve(() => [e.concept?.id, e.kbId], () => Re(), { immediate: !0 }), ve(() => e.concept?.id, () => {
      S.value = null;
    }), (u, k) => a.concept ? (t(), s("article", sn, [
      !a.concept.is_root || a.concept.description ? (t(), s("header", an, [
        a.concept.is_root ? T("", !0) : (t(), s("div", cn, [
          l("h1", rn, U(a.concept.label || a.concept.id), 1),
          W.value ? (t(), ie(m(bt), {
            key: 0,
            class: xe(["wr-orig-btn", { on: me.value }]),
            label: me.value ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (h) => x(W.value))
          }, null, 8, ["class", "label"])) : T("", !0)
        ])),
        a.concept.description ? (t(), s("p", un, U(a.concept.description), 1)) : T("", !0)
      ])) : T("", !0),
      c.value ? (t(), s("div", dn, [
        $(m(A), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        k[3] || (k[3] = l("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), s("div", vn, [
        $(m(A), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, U(I.value), 1)
      ])) : (t(), s(ne, { key: 3 }, [
        j.value && (ge.value || G.value) ? (t(), ie(m(Ht), {
          key: 0,
          tabs: oe.value,
          active: N.value,
          onSelect: k[1] || (k[1] = (h) => N.value = h)
        }, null, 8, ["tabs", "active"])) : T("", !0),
        j.value && N.value === "rendered" ? (t(), s("div", fn, [
          (t(!0), s(ne, null, pe(y.value, (h, z) => (t(), s("section", {
            key: h.id,
            class: "wr-doc-page"
          }, [
            y.value.length > 1 ? (t(), s("div", pn, [
              l("span", gn, U(h.title), 1),
              l("button", {
                type: "button",
                class: "wr-doc-toggle",
                "aria-expanded": g(h.id),
                onClick: (X) => d(h.id)
              }, [
                $(m(A), {
                  icon: g(h.id) ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                ce(" " + U(g(h.id) ? "Collapse" : "Read"), 1)
              ], 8, mn)
            ])) : T("", !0),
            P.value.get(h.id) ? (t(), ie(m(kt), {
              key: 1,
              text: P.value.get(h.id)
            }, null, 8, ["text"])) : T("", !0),
            g(h.id) ? (t(), s("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: h.content
            }, null, 8, hn)) : T("", !0),
            g(h.id) && F(h).length ? (t(), s("div", yn, [
              (t(!0), s(ne, null, pe(F(h), (X) => (t(), s("div", {
                key: X.key,
                class: "wr-prov-row"
              }, [
                l("span", bn, U(X.label), 1),
                X.href ? (t(), s("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: X.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, U(X.value), 9, kn)) : (t(), s("span", xn, U(X.value), 1))
              ]))), 128))
            ])) : T("", !0),
            z < y.value.length - 1 ? (t(), s("hr", wn)) : T("", !0)
          ]))), 128))
        ])) : j.value && N.value === "chunks" ? (t(), s("div", _n, [
          (t(!0), s(ne, null, pe(b.value, (h) => (t(), s("section", {
            key: h.id,
            class: "wr-chunks-doc"
          }, [
            b.value.length > 1 ? (t(), s("div", $n, U(h.title), 1)) : T("", !0),
            (t(!0), s(ne, null, pe(h.chunks, (z, X) => (t(), s("div", {
              key: z.id,
              class: xe(["wr-chunk", { open: C.value[z.id] }])
            }, [
              l("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!C.value[z.id],
                onClick: (q) => Z(z.id)
              }, [
                l("span", In, U(X + 1), 1),
                l("span", Mn, "Chunk " + U(X + 1), 1),
                $(m(A), {
                  class: "wr-chunk-chev",
                  icon: C.value[z.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Cn),
              z.prefix ? (t(), s("p", Sn, [
                $(m(A), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                l("span", null, U(z.prefix), 1)
              ])) : T("", !0),
              l("p", {
                class: xe(["wr-chunk-body", { clamp: !C.value[z.id] }])
              }, U(z.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : O.value.length ? (t(), s("div", Rn, [
          (t(!0), s(ne, null, pe(O.value, (h) => (t(), s("button", {
            key: h.id,
            class: "wr-card",
            style: _e({ "--c": m(Ee)(h).fill }),
            onClick: (z) => o("navigate", h)
          }, [
            l("span", Tn, [
              l("span", En, [
                $(m(A), {
                  icon: m(at)(h),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(m(A), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            l("span", Dn, U(h.label || h.id), 1),
            h.description ? (t(), s("span", Ln, U(h.description), 1)) : T("", !0),
            l("span", Fn, [
              h.document_count ? (t(), s("span", Nn, U(h.document_count) + " " + U(h.document_count === 1 ? "page" : "pages"), 1)) : T("", !0),
              m(ot)(h.id, a.edges) ? (t(), s("span", Un, U(m(ot)(h.id, a.edges)) + " subtopics", 1)) : T("", !0),
              !h.document_count && !m(ot)(h.id, a.edges) ? (t(), s("span", Bn, "empty")) : T("", !0)
            ])
          ], 12, On))), 128))
        ])) : (t(), s("div", zn, [
          $(m(A), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          k[4] || (k[4] = l("span", null, "This page has no content yet.", -1))
        ])),
        V.value.length || j.value && O.value.length ? (t(), s("footer", An, [
          j.value && O.value.length ? (t(), s("div", Pn, [
            k[5] || (k[5] = l("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            l("div", Vn, [
              (t(!0), s(ne, null, pe(O.value, (h) => (t(), s("button", {
                key: h.id,
                class: "wr-foot-link",
                onClick: (z) => o("navigate", h)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: _e({ background: m(Ee)(h).fill })
                }, null, 4),
                ce(U(h.label || h.id), 1)
              ], 8, Wn))), 128))
            ])
          ])) : T("", !0),
          V.value.length ? (t(), s("div", Hn, [
            k[6] || (k[6] = l("span", { class: "wr-foot-h" }, "Related", -1)),
            l("div", Xn, [
              (t(!0), s(ne, null, pe(V.value, (h) => (t(), s("button", {
                key: h.concept.id,
                class: "wr-foot-link",
                onClick: (z) => o("navigate", h.concept)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: _e({ background: m(Ee)(h.concept).fill })
                }, null, 4),
                ce(U(h.concept.label || h.concept.id) + " ", 1),
                l("span", Kn, U(h.label), 1)
              ], 8, Yn))), 128))
            ])
          ])) : T("", !0)
        ])) : T("", !0)
      ], 64)),
      $(m(xt), {
        contained: "",
        open: !!S.value,
        title: S.value?.title || a.concept?.label || "",
        "content-type": S.value?.contentType || "",
        "source-url": S.value?.sourceUrl || "",
        onClose: k[2] || (k[2] = (h) => S.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : T("", !0);
  }
}), jn = { class: "wk-tax-h" }, Zn = ["value"], Qn = {
  key: 2,
  class: "wk-tax-del"
}, Jn = { class: "wk-tax-counts" }, qn = ["value"], eo = {
  key: 3,
  class: "wk-tax-err"
}, to = { class: "wk-tax-foot" }, Rt = /* @__PURE__ */ $e({
  __name: "TaxonomyForm",
  props: {
    kbId: {},
    mode: {},
    target: {},
    concepts: {},
    edges: {}
  },
  emits: ["saved", "close"],
  setup(a, { emit: r }) {
    const e = a, o = r, v = E(""), c = E(""), I = E(""), y = E(""), b = E(!1), C = E(""), N = R(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.concepts) d.set(_.id, _);
      return d;
    }), S = R(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.edges)
        (_.edge_type === "subtopic_of" || _.edge_type === "categorized_as") && N.value.has(_.from_node_id) && N.value.has(_.to_node_id) && d.set(_.from_node_id, _.to_node_id);
      return d;
    }), L = R(() => ({ add: "Add child concept", rename: "Rename", move: "Move to", delete: "Delete" })[e.mode] || ""), P = R(() => e.concepts.filter((d) => d.node_type !== "document"));
    function G(d, _) {
      let O = d;
      const V = /* @__PURE__ */ new Set();
      for (; O && !V.has(O); ) {
        if (O === _) return !0;
        V.add(O), O = S.value.get(O);
      }
      return !1;
    }
    const Z = R(() => {
      const d = e.target;
      return d ? P.value.filter((_) => _.id !== d.id && !G(_.id, d.id)) : P.value;
    }), D = R(() => {
      const d = e.target;
      if (!d) return { childCount: 0, documentCount: 0, empty: !0 };
      let _ = 0, O = 0;
      for (const V of e.edges)
        V.to_node_id === d.id && (V.edge_type === "subtopic_of" && (_ += 1), V.edge_type === "categorized_as" && (O += 1));
      return { childCount: _, documentCount: O, empty: _ === 0 && O === 0 };
    }), H = R(() => {
      const d = e.target;
      return b.value ? !1 : e.mode === "add" ? v.value.trim() !== "" : !d || d.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? v.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== d.id : e.mode === "delete" ? D.value.empty || y.value !== "" : !1;
    });
    ve(() => [e.mode, e.target], () => {
      const d = e.target;
      v.value = e.mode === "rename" && d?.label || "", c.value = e.mode === "rename" && d?.description || "", I.value = d && S.value.get(d.id) || "", y.value = "", C.value = "";
    }, { immediate: !0 });
    async function g() {
      const d = e.target, _ = e.kbId;
      if (!(!_ || !H.value)) {
        b.value = !0, C.value = "";
        try {
          let O = d?.id || "";
          if (e.mode === "add") {
            const { data: V } = await Ce.post(`/api/v1/kb10/${_}/concepts`, {
              label: v.value.trim(),
              description: c.value.trim(),
              parent_id: d?.id
            });
            if (!V?.success) throw new Error(V?.error || "create failed");
            O = V.node_id || O;
          } else if (e.mode === "rename" && d) {
            const { data: V } = await Ce.patch(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, {
              label: v.value.trim(),
              description: c.value.trim()
            });
            if (!V?.success) throw new Error(V?.error || "update failed");
            O = d.id;
          } else if (e.mode === "move" && d) {
            const { data: V } = await Ce.put(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}/parent`, {
              parent_id: I.value
            });
            if (!V?.success) throw new Error(V?.error || "move failed");
            O = d.id;
          } else if (e.mode === "delete" && d) {
            const V = y.value ? { reassign_to_concept_id: y.value } : {}, { data: j } = await Ce.delete(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, { data: V });
            if (!j?.success) throw new Error(j?.error || "delete failed");
            O = y.value || S.value.get(d.id) || "";
          }
          o("saved", O);
        } catch (O) {
          C.value = O?.response?.data?.error || O?.message || "taxonomy update failed", ze.handleError(O?.response?.status === 401 ? "auth-expired" : "other", O);
        } finally {
          b.value = !1;
        }
      }
    }
    return (d, _) => (t(), s("form", {
      class: "wk-tax",
      onSubmit: Se(g, ["prevent"])
    }, [
      l("div", jn, [
        l("span", null, U(L.value), 1),
        $(m(Te), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: _[0] || (_[0] = (O) => o("close"))
        })
      ]),
      a.mode === "add" || a.mode === "rename" ? (t(), s(ne, { key: 0 }, [
        Fe(l("input", {
          "onUpdate:modelValue": _[1] || (_[1] = (O) => v.value = O),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ge, v.value]
        ]),
        Fe(l("textarea", {
          "onUpdate:modelValue": _[2] || (_[2] = (O) => c.value = O),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ge, c.value]
        ])
      ], 64)) : T("", !0),
      a.mode === "move" ? Fe((t(), s("select", {
        key: 1,
        "onUpdate:modelValue": _[3] || (_[3] = (O) => I.value = O),
        class: "wk-tax-input"
      }, [
        _[6] || (_[6] = l("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), s(ne, null, pe(Z.value, (O) => (t(), s("option", {
          key: O.id,
          value: O.id
        }, U(O.label || O.id), 9, Zn))), 128))
      ], 512)), [
        [rt, I.value]
      ]) : T("", !0),
      a.mode === "delete" ? (t(), s("div", Qn, [
        l("div", Jn, [
          l("span", null, [
            $(m(A), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            ce(U(D.value.childCount) + " subtopics", 1)
          ]),
          l("span", null, [
            $(m(A), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            ce(U(D.value.documentCount) + " pages", 1)
          ])
        ]),
        D.value.empty ? T("", !0) : Fe((t(), s("select", {
          key: 0,
          "onUpdate:modelValue": _[4] || (_[4] = (O) => y.value = O),
          class: "wk-tax-input"
        }, [
          _[7] || (_[7] = l("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), s(ne, null, pe(Z.value, (O) => (t(), s("option", {
            key: O.id,
            value: O.id
          }, U(O.label || O.id), 9, qn))), 128))
        ], 512)), [
          [rt, y.value]
        ])
      ])) : T("", !0),
      C.value ? (t(), s("div", eo, [
        $(m(A), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, U(C.value), 1)
      ])) : T("", !0),
      l("div", to, [
        $(m(je), {
          variant: "ghost",
          small: "",
          disabled: b.value,
          onClick: _[5] || (_[5] = (O) => o("close"))
        }, {
          default: be(() => [..._[8] || (_[8] = [
            ce("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(m(je), {
          type: "submit",
          small: "",
          variant: a.mode === "delete" ? "danger" : "primary",
          loading: b.value,
          disabled: !H.value
        }, {
          default: be(() => [
            ce(U(a.mode === "delete" ? "Delete" : "Save"), 1)
          ]),
          _: 1
        }, 8, ["variant", "loading", "disabled"])
      ])
    ], 32));
  }
}), no = { class: "wn" }, oo = {
  key: 0,
  class: "wn-folder"
}, lo = ["title"], so = {
  key: 1,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Search results"
}, ao = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], io = { class: "wn-item-text" }, co = { class: "wn-label" }, ro = {
  key: 0,
  class: "wn-path"
}, uo = {
  key: 0,
  class: "wn-path-sep"
}, vo = ["onClick"], fo = {
  key: 0,
  class: "wn-empty"
}, po = {
  key: 2,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Folder contents"
}, go = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], mo = { class: "wn-label" }, ho = {
  key: 0,
  class: "wn-count"
}, yo = ["onClick"], bo = {
  key: 0,
  class: "wn-empty"
}, ko = /* @__PURE__ */ $e({
  __name: "WikiNav",
  props: {
    crumbs: {},
    entries: {},
    selectedId: {},
    query: {},
    results: {}
  },
  emits: ["open", "enter", "up", "context"],
  setup(a, { emit: r }) {
    const e = a, o = r;
    function v(D, H) {
      const g = D.currentTarget.getBoundingClientRect();
      o("context", { concept: H, x: g.right, y: g.bottom });
    }
    function c(D, H) {
      o("context", { concept: H, x: D.clientX, y: D.clientY });
    }
    const I = R(() => e.query.trim().length > 0), y = R(() => e.crumbs.length > 1), b = R(() => e.crumbs[e.crumbs.length - 1] || null);
    function C(D) {
      return D.label || (D.node_type === "document" ? "Untitled page" : D.id);
    }
    function N(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    function S(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    const L = E(""), P = R(() => I.value ? e.results : e.entries);
    function G(D) {
      const H = P.value;
      return (H.find((d) => d.concept.id === L.value) || H.find((d) => d.concept.id === e.selectedId) || H[0])?.concept.id === D ? 0 : -1;
    }
    function Z(D, H) {
      if (D.target !== D.currentTarget) return;
      if (D.key === "Enter" || D.key === " ") {
        D.preventDefault(), H.isFolder ? o("enter", H.concept) : o("open", H.concept);
        return;
      }
      const g = D.currentTarget, d = Array.from(g.parentElement.querySelectorAll('[role="option"]')), _ = d.indexOf(g);
      let O;
      switch (D.key) {
        case "ArrowDown":
          O = Math.min(_ + 1, d.length - 1);
          break;
        case "ArrowUp":
          O = Math.max(_ - 1, 0);
          break;
        case "Home":
          O = 0;
          break;
        case "End":
          O = d.length - 1;
          break;
        default:
          return;
      }
      D.preventDefault(), d[O]?.focus();
    }
    return (D, H) => (t(), s("div", no, [
      !I.value && b.value ? (t(), s("div", oo, [
        y.value ? (t(), s("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: H[0] || (H[0] = (g) => o("up"))
        }, [
          $(m(A), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : T("", !0),
        l("span", {
          class: "wn-folder-name",
          title: C(b.value)
        }, U(C(b.value)), 9, lo)
      ])) : T("", !0),
      I.value ? (t(), s("ul", so, [
        (t(!0), s(ne, null, pe(a.results, (g) => (t(), s("li", {
          key: g.concept.id,
          class: xe(["wn-item", { active: g.concept.id === a.selectedId, folder: g.isFolder }]),
          role: "option",
          tabindex: G(g.concept.id),
          onFocus: (d) => L.value = g.concept.id,
          onKeydown: (d) => Z(d, g),
          "aria-selected": g.concept.id === a.selectedId,
          onClick: (d) => S(g),
          onContextmenu: Se((d) => c(d, g.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: _e({ color: m(Ee)(g.concept).fill })
          }, [
            $(m(A), {
              icon: g.isFolder ? m(at)(g.concept) : m(ut)(g.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", io, [
            l("span", co, U(C(g.concept)), 1),
            g.path.length ? (t(), s("span", ro, [
              (t(!0), s(ne, null, pe(g.path, (d, _) => (t(), s(ne, {
                key: d.id
              }, [
                _ ? (t(), s("span", uo, "/")) : T("", !0),
                ce(U(d.label || d.id), 1)
              ], 64))), 128))
            ])) : T("", !0)
          ]),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((d) => v(d, g.concept), ["stop"])
          }, [
            $(m(A), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, vo),
          g.isFolder ? (t(), ie(m(A), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : T("", !0)
        ], 42, ao))), 128)),
        a.results.length ? T("", !0) : (t(), s("li", fo, "No matches."))
      ])) : (t(), s("ul", po, [
        (t(!0), s(ne, null, pe(a.entries, (g) => (t(), s("li", {
          key: g.concept.id,
          class: xe(["wn-item", { active: g.concept.id === a.selectedId, folder: g.isFolder }]),
          role: "option",
          tabindex: G(g.concept.id),
          onFocus: (d) => L.value = g.concept.id,
          onKeydown: (d) => Z(d, g),
          "aria-selected": g.concept.id === a.selectedId,
          onClick: (d) => N(g),
          onContextmenu: Se((d) => c(d, g.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: _e({ color: m(Ee)(g.concept).fill })
          }, [
            $(m(A), {
              icon: g.isFolder ? m(at)(g.concept) : m(ut)(g.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", mo, U(C(g.concept)), 1),
          g.isFolder ? (t(), s("span", ho, U(g.childCount), 1)) : T("", !0),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((d) => v(d, g.concept), ["stop"])
          }, [
            $(m(A), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, yo),
          g.isFolder ? (t(), ie(m(A), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : T("", !0)
        ], 42, go))), 128)),
        a.entries.length ? T("", !0) : (t(), s("li", bo, "This level is empty."))
      ]))
    ]));
  }
}), xo = { class: "cn" }, wo = { class: "wn-filter" }, _o = {
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
  setup(a, { emit: r }) {
    const e = a, o = r, v = R(() => $t(e.concepts, e.edges)), c = R(() => Xt(v.value)), I = E(""), y = E(""), b = R(() => c.value.byId.get(I.value)), C = R(() => I.value ? Yt(I.value, c.value.byId, c.value.parentOf) : []), N = R(() => Kt(b.value)), S = R(() => Gt(y.value, c.value.byId, c.value.parentOf));
    function L(g) {
      const d = c.value.byId.get(g);
      if (d && d.children.length) return g;
      const _ = c.value.parentOf.get(g);
      return _ || v.value[0]?.concept.id || g;
    }
    function P() {
      return v.value[0]?.concept.id || "";
    }
    function G(g) {
      const d = g ? L(g) : I.value || P();
      d && d !== I.value && (I.value = d);
    }
    function Z(g) {
      I.value = g.id, y.value = "", o("select", g.id);
    }
    function D(g) {
      o("select", g.id);
    }
    function H() {
      const g = c.value.parentOf.get(I.value);
      g && (I.value = g, o("select", g));
    }
    return ve(() => e.selectedId, (g) => G(g), { immediate: !0 }), ve([() => c.value, I], () => {
      if (I.value && c.value.byId.has(I.value)) return;
      const g = e.selectedId ? L(e.selectedId) : P();
      g && (I.value = g);
    }, { immediate: !0 }), (g, d) => (t(), s("div", xo, [
      l("div", wo, [
        $(m(A), {
          class: "wn-filter-ic",
          icon: "tabler:filter-search",
          "aria-hidden": "true"
        }),
        Fe(l("input", {
          "onUpdate:modelValue": d[0] || (d[0] = (_) => y.value = _),
          class: "wn-filter-input",
          type: "text",
          placeholder: "Filter topics & pages…",
          "aria-label": "Filter the contents"
        }, null, 512), [
          [Ge, y.value]
        ]),
        y.value ? (t(), s("button", {
          key: 0,
          class: "wn-filter-x",
          "aria-label": "Clear filter",
          onClick: d[1] || (d[1] = (_) => y.value = "")
        }, [
          $(m(A), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : T("", !0)
      ]),
      l("nav", _o, [
        $(ko, {
          crumbs: C.value,
          entries: N.value,
          "selected-id": a.selectedId,
          query: y.value,
          results: S.value,
          onOpen: D,
          onEnter: Z,
          onUp: H,
          onContext: d[2] || (d[2] = (_) => o("context", _))
        }, null, 8, ["crumbs", "entries", "selected-id", "query", "results"])
      ])
    ]));
  }
}), $o = {
  key: 0,
  class: "kb-menu-title"
}, Co = {
  key: 0,
  class: "kb-menu-sep",
  role: "separator"
}, Io = ["disabled", "onClick"], Tt = /* @__PURE__ */ $e({
  __name: "NodeMenu",
  props: {
    open: { type: Boolean },
    x: {},
    y: {},
    title: {},
    items: {}
  },
  emits: ["pick", "close"],
  setup(a, { emit: r }) {
    const e = a, o = r, v = R(() => {
      const b = e.items.filter((P) => !P.divider).length, C = e.items.filter((P) => P.divider).length, N = (e.title ? 30 : 0) + 10 + b * 34 + C * 9, S = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), L = Math.max(8, Math.min(e.y, window.innerHeight - N - 8));
      return { left: `${S}px`, top: `${L}px`, width: "224px" };
    });
    function c(y) {
      y.key === "Escape" && o("close");
    }
    it(() => window.addEventListener("keydown", c)), Ze(() => window.removeEventListener("keydown", c));
    function I(y) {
      y.disabled || y.divider || (o("pick", y.id), o("close"));
    }
    return (y, b) => a.open ? (t(), s("div", {
      key: 0,
      class: "kb-menu-backdrop",
      onMousedown: b[2] || (b[2] = (C) => o("close")),
      onContextmenu: b[3] || (b[3] = Se((C) => o("close"), ["prevent"])),
      onWheel: b[4] || (b[4] = Se((C) => o("close"), ["prevent"]))
    }, [
      l("div", {
        class: "kb-menu",
        style: _e(v.value),
        role: "menu",
        onMousedown: b[0] || (b[0] = Se(() => {
        }, ["stop"])),
        onContextmenu: b[1] || (b[1] = Se(() => {
        }, ["prevent", "stop"]))
      }, [
        a.title ? (t(), s("div", $o, U(a.title), 1)) : T("", !0),
        (t(!0), s(ne, null, pe(a.items, (C, N) => (t(), s(ne, {
          key: C.id + ":" + N
        }, [
          C.divider ? (t(), s("div", Co)) : (t(), s("button", {
            key: 1,
            class: xe(["kb-menu-item", { danger: C.danger, disabled: C.disabled }]),
            disabled: C.disabled,
            role: "menuitem",
            onClick: (S) => I(C)
          }, [
            C.icon ? (t(), ie(m(A), {
              key: 0,
              icon: C.icon,
              class: "kb-menu-ic",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : T("", !0),
            l("span", null, U(C.label), 1)
          ], 10, Io))
        ], 64))), 128))
      ], 36)
    ], 32)) : T("", !0);
  }
}), Et = "kb10:wiki:navWidth", Mo = 220, So = 560;
function Dt(a) {
  return Math.max(Mo, Math.min(So, a));
}
function Ro() {
  const a = Number(localStorage.getItem(Et));
  return Number.isFinite(a) && a > 0 ? Dt(a) : 300;
}
function Lt() {
  const a = E(Ro()), r = E(null), e = E(!1);
  function o(I) {
    const y = r.value;
    if (!y) return;
    const b = y.getBoundingClientRect();
    a.value = Dt(I.clientX - b.left);
  }
  function v() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", v), localStorage.setItem(Et, String(Math.round(a.value)));
  }
  function c(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", v);
  }
  return Ze(v), { navWidth: a, railRef: r, navDragging: e, onStart: c };
}
const Oo = { class: "kb-railtop" }, To = { class: "kb-railtop-acts" }, Eo = {
  key: 0,
  class: "kx-main-scroll"
}, Do = {
  key: 1,
  class: "kx-main-scroll wk-doc-inner"
}, Lo = {
  key: 0,
  class: "wk-pagebar"
}, Fo = {
  key: 0,
  class: "wk-crumbs",
  "aria-label": "Wiki path"
}, No = ["onClick"], Uo = {
  key: 1,
  class: "wk-tools"
}, Bo = /* @__PURE__ */ $e({
  __name: "WikiView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(a, { emit: r }) {
    const e = a, o = r, { navWidth: v, railRef: c, navDragging: I, onStart: y } = Lt(), b = R(() => {
      const B = /* @__PURE__ */ new Map();
      for (const x of e.concepts) B.set(x.id, x);
      return B;
    }), C = R(() => e.selectedId && b.value.get(e.selectedId) || null), N = R(() => !!C.value && C.value.node_type !== "document"), S = R(() => {
      const B = /* @__PURE__ */ new Map();
      for (const x of e.edges)
        (x.edge_type === "subtopic_of" || x.edge_type === "categorized_as") && b.value.has(x.from_node_id) && b.value.has(x.to_node_id) && B.set(x.from_node_id, x.to_node_id);
      return B;
    }), L = R(() => {
      const B = [];
      let x = e.selectedId;
      const W = /* @__PURE__ */ new Set();
      for (; x && !W.has(x); ) {
        W.add(x);
        const ge = b.value.get(x);
        if (!ge) break;
        B.unshift(ge), x = S.value.get(x);
      }
      return B.slice(0, -1).filter((ge) => !ge.is_root);
    }), P = E({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), G = R(() => {
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
    function Z(B) {
      P.value = { open: !0, x: B.x, y: B.y, concept: B.concept };
    }
    const D = E(null);
    function H() {
      if (!C.value) return;
      const x = D.value?.$el?.getBoundingClientRect();
      P.value = { open: !0, x: x ? x.right : 0, y: x ? x.bottom : 0, concept: C.value };
    }
    const g = E(""), d = E(null);
    function _(B) {
      const x = P.value.concept;
      if (x) {
        if (B === "open") {
          o("select", x.id);
          return;
        }
        d.value = x, g.value = B;
      }
    }
    function O(B) {
      g.value = "", B && o("select", B), o("changed");
    }
    const V = E(!1);
    function j(B) {
      const x = b.value.get(B.id) || (B.parent_id ? b.value.get(B.parent_id) : null);
      x && o("select", x.id), V.value = !1;
    }
    const oe = E("");
    function re() {
      oe.value = "", o("changed");
    }
    return (B, x) => (t(), s("div", {
      ref_key: "railRef",
      ref: c,
      class: xe(["wk", { "wk-dragging": m(I) }]),
      style: _e({ "--kx-rail-width": m(v) + "px" })
    }, [
      a.concepts.length ? (t(), ie(m(Ct), { key: 0 }, {
        rail: be(() => [
          l("div", Oo, [
            l("div", To, [
              $(m(Te), {
                icon: "tabler:search",
                label: "Search",
                active: V.value,
                onClick: x[0] || (x[0] = (W) => V.value = !V.value)
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: x[1] || (x[1] = (W) => oe.value = "add")
              }),
              $(m(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: a.loading,
                spin: a.loading,
                onClick: x[2] || (x[2] = (W) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: a.concepts,
            edges: a.edges,
            "selected-id": a.selectedId,
            onSelect: x[3] || (x[3] = (W) => o("select", W)),
            onContext: Z
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: x[4] || (x[4] = //@ts-ignore
            (...W) => m(y) && m(y)(...W))
          }, [...x[11] || (x[11] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: be(() => [
          V.value ? (t(), s("div", Eo, [
            $(m(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: "",
              placeholder: "Search this wiki…",
              onOpen: j,
              onClose: x[5] || (x[5] = (W) => V.value = !1)
            }, null, 8, ["kb-id"])
          ])) : (t(), s("div", Do, [
            L.value.length || N.value ? (t(), s("div", Lo, [
              L.value.length ? (t(), s("nav", Fo, [
                (t(!0), s(ne, null, pe(L.value, (W, ge) => (t(), s(ne, {
                  key: W.id
                }, [
                  ge ? (t(), ie(m(A), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : T("", !0),
                  l("button", {
                    class: "wk-crumb",
                    onClick: (me) => o("select", W.id)
                  }, U(W.label || W.id), 9, No)
                ], 64))), 128))
              ])) : T("", !0),
              N.value ? (t(), s("div", Uo, [
                $(m(Te), {
                  ref_key: "structBtnRef",
                  ref: D,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!g.value,
                  onClick: H
                }, null, 8, ["active"])
              ])) : T("", !0)
            ])) : T("", !0),
            g.value ? (t(), ie(Rt, {
              key: 1,
              "kb-id": a.kbId,
              mode: g.value,
              target: d.value,
              concepts: a.concepts,
              edges: a.edges,
              onSaved: O,
              onClose: x[6] || (x[6] = (W) => g.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : T("", !0),
            $(Gn, {
              "kb-id": a.kbId,
              concept: C.value,
              edges: a.edges,
              "concepts-by-id": b.value,
              onNavigate: x[7] || (x[7] = (W) => o("select", W.id))
            }, null, 8, ["kb-id", "concept", "edges", "concepts-by-id"])
          ]))
        ]),
        _: 1
      })) : (t(), ie(Mt, {
        key: 1,
        icon: "tabler:book-2",
        title: "This wiki is empty",
        hint: "Add pages to grow it — concepts, their subtopics, and the links between them appear here as a navigable documentation tree.",
        cta: "Add the first page",
        "cta-icon": "tabler:plus",
        onCta: x[8] || (x[8] = (W) => oe.value = "add")
      })),
      $(m(Ke), {
        open: oe.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: x[9] || (x[9] = (W) => oe.value = "")
      }, {
        default: be(() => [
          $(St, {
            "kb-id": a.kbId,
            noun: "page",
            onChanged: re
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(Tt, {
        open: P.value.open,
        x: P.value.x,
        y: P.value.y,
        items: G.value,
        onPick: _,
        onClose: x[10] || (x[10] = (W) => P.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), zo = 0.81, mt = 144;
class Ao {
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
  constructor(r, e, o, v, c) {
    this.nodes = r, this.links = e, this.width = o, this.height = v, this.charge = c;
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
    let v = 1 / 0, c = 1 / 0, I = -1 / 0, y = -1 / 0;
    for (let S = 0; S < o; S++) {
      const L = e[S];
      L.x < v && (v = L.x), L.x > I && (I = L.x), L.y < c && (c = L.y), L.y > y && (y = L.y);
    }
    const b = Math.max(I - v, y - c, 1) + 1, C = { x0: v, y0: c, x1: v + b, y1: c + b, mass: 0, cx: 0, cy: 0, node: null, kids: null };
    for (let S = 0; S < o; S++) this.insert(C, e[S]);
    this.computeMass(C);
    const N = this.charge * r;
    for (let S = 0; S < o; S++) this.repel(e[S], C, N);
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
    const o = (r.x0 + r.x1) / 2, v = (r.y0 + r.y1) / 2, c = e.x >= o, I = e.y >= v, y = (I ? 2 : 0) + (c ? 1 : 0);
    let b = r.kids[y];
    return b || (b = {
      x0: c ? o : r.x0,
      x1: c ? r.x1 : o,
      y0: I ? v : r.y0,
      y1: I ? r.y1 : v,
      mass: 0,
      cx: 0,
      cy: 0,
      node: null,
      kids: null
    }, r.kids[y] = b), b;
  }
  computeMass(r) {
    if (!r.kids) {
      r.node && (r.mass = 1, r.cx = r.node.x, r.cy = r.node.y);
      return;
    }
    let e = 0, o = 0, v = 0;
    for (const c of r.kids)
      c && (this.computeMass(c), c.mass !== 0 && (e += c.mass, o += c.cx * c.mass, v += c.cy * c.mass));
    r.mass = e, e > 0 && (r.cx = o / e, r.cy = v / e);
  }
  repel(r, e, o) {
    if (e.mass === 0 || e.node === r) return;
    let v = e.cx - r.x, c = e.cy - r.y, I = v * v + c * c;
    I === 0 && (v = (Math.random() - 0.5) * 0.01, c = (Math.random() - 0.5) * 0.01, I = v * v + c * c);
    const y = e.x1 - e.x0;
    if (!e.kids || y * y / I < zo) {
      const b = I < mt ? mt : I, C = Math.sqrt(I), N = o * e.mass / b;
      r.vx -= v / C * N, r.vy -= c / C * N;
      return;
    }
    for (const b of e.kids) b && this.repel(r, b, o);
  }
  applyLinks(r) {
    for (const e of this.links) {
      const o = this.nodes[e.source], v = this.nodes[e.target];
      if (!o || !v) continue;
      const c = v.x - o.x, I = v.y - o.y, y = Math.sqrt(c * c + I * I) || 1e-6, b = (y - e.distance) / y * r * e.strength, C = c * b, N = I * b;
      o.vx += C * 0.5, o.vy += N * 0.5, v.vx -= C * 0.5, v.vy -= N * 0.5;
    }
  }
  applyCenter(r) {
    const e = this.width / 2, o = this.height / 2;
    for (const v of this.nodes)
      v.vx += (e - v.x) * this.centerStrength * r, v.vy += (o - v.y) * this.centerStrength * r;
  }
  // ── Collision via uniform spatial grid (O(n) average) ────────────────────
  applyCollide() {
    const r = this.nodes, e = r.length;
    if (e < 2) return;
    let o = 0;
    for (let y = 0; y < e; y++) r[y].radius > o && (o = r[y].radius);
    const v = o * 2 + 52, c = /* @__PURE__ */ new Map(), I = (y, b) => y * 73856093 ^ b * 19349663;
    for (let y = 0; y < e; y++) {
      const b = Math.floor(r[y].x / v), C = Math.floor(r[y].y / v), N = I(b, C), S = c.get(N);
      S ? S.push(y) : c.set(N, [y]);
    }
    for (let y = 0; y < e; y++) {
      const b = r[y], C = Math.floor(b.x / v), N = Math.floor(b.y / v);
      for (let S = -1; S <= 1; S++) for (let L = -1; L <= 1; L++) {
        const P = c.get(I(C + S, N + L));
        if (P)
          for (const G of P) {
            if (G <= y) continue;
            const Z = r[G], D = Z.x - b.x, H = Z.y - b.y, g = b.radius + Z.radius + 44, d = D * D + H * H;
            if (d < g * g && d > 0) {
              const _ = Math.sqrt(d), O = (g - _) / _ * 0.5, V = D * O, j = H * O;
              b.x -= V, b.y -= j, Z.x += V, Z.y += j;
            }
          }
      }
    }
  }
  integrate() {
    const r = this.width / 2, e = this.height / 2, o = Math.max(this.width, this.height) * 2 + 1500, v = this.maxVelocity * (1 + this.alpha * 8);
    for (const c of this.nodes)
      c.fx != null ? (c.x = c.fx, c.vx = 0) : (c.vx *= this.velocityDecay, c.vx > v ? c.vx = v : c.vx < -v && (c.vx = -v), c.x += c.vx), c.fy != null ? (c.y = c.fy, c.vy = 0) : (c.vy *= this.velocityDecay, c.vy > v ? c.vy = v : c.vy < -v && (c.vy = -v), c.y += c.vy), Number.isFinite(c.x) || (c.x = r, c.vx = 0), Number.isFinite(c.y) || (c.y = e, c.vy = 0), c.x = Math.max(r - o, Math.min(r + o, c.x)), c.y = Math.max(e - o, Math.min(e + o, c.y));
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
const Po = ["transform"], Vo = { class: "gx-links" }, Wo = ["d"], Ho = { class: "gx-nodes" }, Xo = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Yo = ["r"], Ko = ["fill", "stroke"], Go = ["r", "fill", "stroke", "stroke-width"], jo = ["cx", "cy"], Zo = ["x", "y"], Qo = ["y"], Jo = /* @__PURE__ */ $e({
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
  setup(a, { expose: r, emit: e }) {
    const o = a;
    function v(p) {
      return !o.visibleIds || o.visibleIds.has(p);
    }
    function c(p) {
      return o.colors?.get(p.id) || Ee(p);
    }
    const I = e, y = E(null), b = E(null), C = E(0), N = E(0), S = E(1), L = E(!1);
    ve(S, (p) => I("scale", p));
    const P = E([]), G = E([]);
    let Z = null, D = null, H = 0, g = "";
    const d = /* @__PURE__ */ new Map(), _ = E(null), O = R(() => o.concepts.length > 220), V = R(() => {
      if (o.highlightIds.size) return new Set(o.highlightIds);
      if (_.value) {
        const p = /* @__PURE__ */ new Set([_.value]);
        for (const M of G.value)
          M.from === _.value && p.add(M.to), M.to === _.value && p.add(M.from);
        return p;
      }
      return null;
    });
    function j(p) {
      if (p.node_type === "document") return 8;
      if (p.is_root) return 22;
      const M = (p.edge_count || 0) + (p.document_count || 0);
      return Math.max(11, Math.min(24, 11 + M * 2));
    }
    function oe() {
      const p = b.value?.getBoundingClientRect();
      return { w: p?.width || 900, h: p?.height || 640 };
    }
    function re() {
      return o.concepts.map((p) => p.id).join("|");
    }
    function B(p, M) {
      const w = o.concepts, Y = new Map(w.map((f) => [f.id, f])), te = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Set();
      for (const f of o.edges) {
        if (f.edge_type !== "subtopic_of" && f.edge_type !== "categorized_as" || !Y.has(f.from_node_id) || !Y.has(f.to_node_id)) continue;
        const J = te.get(f.to_node_id) || [];
        J.push(f.from_node_id), te.set(f.to_node_id, J), K.add(f.from_node_id);
      }
      const ye = w.filter((f) => f.is_root || !K.has(f.id)).map((f) => f.id), fe = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Set(), ae = (f) => {
        const J = fe.get(f);
        if (J !== void 0) return J;
        if (ke.has(f)) return 1;
        ke.add(f);
        const le = te.get(f) || [];
        let he = le.length ? 0 : 1;
        for (const Le of le) he += ae(Le);
        return he = Math.max(1, he), fe.set(f, he), he;
      };
      for (const f of ye) ae(f);
      const de = 150, we = /* @__PURE__ */ new Map(), Me = /* @__PURE__ */ new Set(), Ue = /* @__PURE__ */ new Set();
      let Be = 0;
      const i = (f, J, le, he) => {
        if (Ue.has(f)) return;
        Ue.add(f), Me.add(f);
        const Le = (le + he) / 2, Ve = J * de, ct = Be++ * 2.399963;
        we.set(f, { x: p + Ve * Math.cos(Le) + Math.cos(ct) * 4, y: M + Ve * Math.sin(Le) + Math.sin(ct) * 4 });
        const tt = te.get(f) || [];
        if (!tt.length) return;
        const Ft = tt.reduce((He, Xe) => He + ae(Xe), 0) || 1;
        let nt = le;
        for (const He of tt) {
          const Xe = (he - le) * (ae(He) / Ft);
          i(He, J + 1, nt, nt + Xe), nt += Xe;
        }
      };
      if (ye.length === 1)
        i(ye[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const f = ye.reduce((le, he) => le + ae(he), 0) || 1;
        let J = -Math.PI / 2;
        for (const le of ye) {
          const he = Math.PI * 2 * (ae(le) / f);
          i(le, 1, J, J + he), J += he;
        }
      }
      const n = w.filter((f) => !Me.has(f.id));
      if (n.length) {
        let f = de;
        for (const J of we.values()) {
          const le = Math.hypot(J.x - p, J.y - M);
          le > f && (f = le);
        }
        n.forEach((J, le) => {
          const he = le / n.length * Math.PI * 2;
          we.set(J.id, { x: p + (f + de) * Math.cos(he), y: M + (f + de) * Math.sin(he) });
        });
      }
      return we;
    }
    function x() {
      const { w: p, h: M } = oe(), w = p / 2, Y = M / 2, te = o.concepts, K = te.length, ye = B(w, Y);
      if (K < 3) return ye;
      const fe = /* @__PURE__ */ new Map();
      te.forEach((i, n) => fe.set(i.id, n));
      const ke = te.map((i) => {
        const n = ye.get(i.id) || { x: w, y: Y };
        return { id: i.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: j(i) };
      }), ae = K > 250 ? 150 : 120, de = K > 250 ? -1100 : -700, we = o.edges.filter((i) => fe.has(i.from_node_id) && fe.has(i.to_node_id)).map((i) => ({
        source: fe.get(i.from_node_id),
        target: fe.get(i.to_node_id),
        distance: i.edge_type === "subtopic_of" ? ae * 0.8 : ae,
        strength: i.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), Me = new Ao(ke, we, p, M, de), Ue = K > 600 ? 70 : K > 250 ? 110 : 150;
      for (let i = 0; i < Ue; i++) Me.tick();
      Me.resolveOverlaps(K > 600 ? 50 : 80);
      const Be = /* @__PURE__ */ new Map();
      for (const i of ke) Be.set(i.id, { x: i.x, y: i.y });
      return Be;
    }
    function W(p) {
      const { w: M, h: w } = oe();
      if ((M < 2 || w < 2) && H < 60) {
        H++, requestAnimationFrame(() => W(p));
        return;
      }
      H = 0;
      const Y = x();
      d.clear();
      for (const [te, K] of Y) d.set(te, K);
      F(), p && (se(), requestAnimationFrame(() => se())), L.value = !0;
    }
    function ge() {
      g = re(), W(!0);
    }
    function me() {
      if (!o.concepts.length) {
        P.value = [], G.value = [], L.value = !1, g = "", d.clear();
        return;
      }
      const p = re();
      if (p === g) {
        F();
        return;
      }
      const M = !g;
      g = p, lt(() => W(M));
    }
    function F() {
      P.value = o.concepts.filter((p) => v(p.id)).map((p) => {
        const M = d.get(p.id) || { x: 0, y: 0 };
        return { id: p.id, x: M.x, y: M.y, radius: j(p), concept: p, isDoc: p.node_type === "document" };
      }), G.value = o.edges.filter((p) => d.has(p.from_node_id) && d.has(p.to_node_id) && v(p.from_node_id) && v(p.to_node_id)).map((p) => {
        const M = d.get(p.from_node_id), w = d.get(p.to_node_id), Y = (M.x + w.x) / 2, te = (M.y + w.y) / 2, K = w.x - M.x, ye = w.y - M.y, fe = Math.hypot(K, ye) || 1, ke = Math.min(28, fe * 0.12), ae = Y - ye / fe * ke, de = te + K / fe * ke;
        return {
          id: p.id,
          path: `M${M.x},${M.y} Q${ae},${de} ${w.x},${w.y}`,
          edge_type: p.edge_type || "",
          from: p.from_node_id,
          to: p.to_node_id
        };
      });
    }
    function se() {
      if (!d.size) return;
      const { w: p, h: M } = oe();
      let w = 1 / 0, Y = 1 / 0, te = -1 / 0, K = -1 / 0;
      for (const de of o.concepts) {
        if (!v(de.id)) continue;
        const we = d.get(de.id);
        if (!we) continue;
        const Me = j(de);
        w = Math.min(w, we.x - Me), Y = Math.min(Y, we.y - Me), te = Math.max(te, we.x + Me), K = Math.max(K, we.y + Me);
      }
      if (!Number.isFinite(w)) return;
      const ye = Math.max(64, Math.min(p, M) * 0.12);
      w -= ye, Y -= ye, te += ye, K += ye;
      const fe = Math.max(te - w, 1), ke = Math.max(K - Y, 1), ae = Math.max(0.25, Math.min(p / fe, M / ke, 1.25));
      S.value = ae, C.value = (p - fe * ae) / 2 - w * ae, N.value = (M - ke * ae) / 2 - Y * ae;
    }
    function ee(p) {
      const M = d.get(p);
      if (!M) return;
      const { w, h: Y } = oe(), te = Math.max(S.value, 1.1);
      S.value = te, C.value = w / 2 - M.x * te, N.value = Y / 2 - M.y * te;
    }
    let ue = !1, Re = !1, u = { x: 0, y: 0, tx: 0, ty: 0 };
    function k(p) {
      p.preventDefault();
      const M = y.value.getBoundingClientRect(), w = p.clientX - M.left, Y = p.clientY - M.top, te = p.deltaY < 0 ? 1.12 : 1 / 1.12, K = Math.max(0.1, Math.min(6, S.value * te));
      C.value = w - (w - C.value) * (K / S.value), N.value = Y - (Y - N.value) * (K / S.value), S.value = K;
    }
    function h(p) {
      p.button === 0 && (ue = !0, Re = !1, u = { x: p.clientX, y: p.clientY, tx: C.value, ty: N.value }, window.addEventListener("mousemove", z), window.addEventListener("mouseup", X));
    }
    function z(p) {
      ue && (Math.abs(p.clientX - u.x) + Math.abs(p.clientY - u.y) > 3 && (Re = !0), C.value = u.tx + (p.clientX - u.x), N.value = u.ty + (p.clientY - u.y));
    }
    function X() {
      ue && !Re && I("select", null), ue = !1, window.removeEventListener("mousemove", z), window.removeEventListener("mouseup", X);
    }
    let q = null, Q = !1, Oe = 0, Ae = 0;
    function Qe(p, M) {
      p.button === 0 && (p.stopPropagation(), d.has(M) && (q = M, Q = !1, Oe = p.clientX, Ae = p.clientY, window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", Ne)));
    }
    function Pe(p) {
      if (!q || !y.value) return;
      if (!Q) {
        const te = p.clientX - Oe, K = p.clientY - Ae;
        if (te * te + K * K < 9) return;
        Q = !0;
      }
      const M = y.value.getBoundingClientRect(), w = (p.clientX - M.left - C.value) / S.value, Y = (p.clientY - M.top - N.value) / S.value;
      Number.isFinite(w) && Number.isFinite(Y) && (d.set(q, { x: w, y: Y }), F());
    }
    let Ie = 0;
    function Ne() {
      const p = q, M = Q;
      if (q = null, window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne), M || !p) return;
      const w = Date.now();
      if (w - Ie < 350) {
        Ie = 0;
        return;
      }
      Ie = w, I("select", o.selectedId === p ? null : p);
    }
    function Je(p) {
      const { w: M, h: w } = oe(), Y = Math.max(0.1, Math.min(6, S.value * p));
      C.value = M / 2 - (M / 2 - C.value) * (Y / S.value), N.value = w / 2 - (w / 2 - N.value) * (Y / S.value), S.value = Y;
    }
    function qe(p) {
      return !!V.value && !V.value.has(p);
    }
    function De(p) {
      const M = ["gx-link"];
      p.edge_type === "subtopic_of" ? M.push("subtopic") : M.push("categorized");
      const w = V.value;
      return w && (w.has(p.from) && w.has(p.to) ? M.push("lit") : M.push("faded")), M;
    }
    function et(p) {
      return !O.value || p.concept.is_root || p.id === o.selectedId || p.id === _.value;
    }
    return ve(
      () => [o.concepts, o.edges],
      () => me(),
      { immediate: !0, deep: !1 }
    ), ve(() => o.visibleIds, () => {
      g && F();
    }), ve(b, (p) => {
      p && !Z && (Z = new ResizeObserver(() => {
        o.concepts.length && (D && clearTimeout(D), D = setTimeout(() => {
          g && se();
        }, 120));
      }), Z.observe(p)), p && o.concepts.length && !g && me();
    }), Nt(() => {
      Z?.disconnect(), D && clearTimeout(D), X(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne);
    }), r({ fit: se, focus: ee, zoomBy: Je, relayout: ge }), (p, M) => (t(), s("div", {
      ref_key: "containerRef",
      ref: b,
      class: "gx-canvas"
    }, [
      (t(), s("svg", {
        ref_key: "svgRef",
        ref: y,
        class: "gx-svg",
        onWheel: k,
        onMousedown: h,
        onContextmenu: M[1] || (M[1] = Se(() => {
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
          transform: `translate(${C.value},${N.value}) scale(${S.value})`,
          style: _e({ opacity: L.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          l("g", Vo, [
            (t(!0), s(ne, null, pe(G.value, (w) => (t(), s("path", {
              key: w.id,
              d: w.path,
              class: xe(De(w))
            }, null, 10, Wo))), 128))
          ]),
          l("g", Ho, [
            (t(!0), s(ne, null, pe(P.value, (w) => (t(), s("g", {
              key: w.id,
              transform: `translate(${w.x},${w.y})`,
              class: xe(["gx-node", { dim: qe(w.id), sel: w.id === a.selectedId, hov: w.id === _.value }]),
              onMousedown: (Y) => Qe(Y, w.id),
              onMouseenter: (Y) => _.value = w.id,
              onMouseleave: M[0] || (M[0] = (Y) => _.value = null),
              onContextmenu: Se((Y) => I("node-context", { id: w.id, x: Y.clientX, y: Y.clientY }), ["prevent", "stop"]),
              onDblclick: Se((Y) => I("node-dblclick", w.id), ["stop"])
            }, [
              w.id === a.selectedId ? (t(), s("circle", {
                key: 0,
                r: w.radius + 7,
                class: "gx-halo",
                style: _e({ stroke: c(w.concept).fill })
              }, null, 12, Yo)) : T("", !0),
              w.isDoc ? (t(), s("rect", {
                key: 1,
                x: -8,
                y: -6,
                width: "16",
                height: "12",
                rx: "3",
                fill: c(w.concept).fill,
                stroke: c(w.concept).stroke,
                "stroke-width": "1.5",
                class: "gx-shape"
              }, null, 8, Ko)) : (t(), s("circle", {
                key: 2,
                r: w.radius,
                fill: c(w.concept).fill,
                stroke: c(w.concept).stroke,
                "stroke-width": w.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, Go)),
              !w.isDoc && (w.concept.document_count || 0) > 0 ? (t(), s(ne, { key: 3 }, [
                l("circle", {
                  cx: w.radius * 0.72,
                  cy: -w.radius * 0.72,
                  r: "7.5",
                  class: "gx-badge-bg"
                }, null, 8, jo),
                l("text", {
                  x: w.radius * 0.72,
                  y: -w.radius * 0.72,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  class: "gx-badge-txt"
                }, U(w.concept.document_count), 9, Zo)
              ], 64)) : T("", !0),
              et(w) ? (t(), s("text", {
                key: 4,
                y: w.isDoc ? 20 : w.radius + 15,
                "text-anchor": "middle",
                class: xe(["gx-label", { root: w.concept.is_root }])
              }, U(m(jt)(w.concept.label, w.isDoc ? 26 : 24)), 11, Qo)) : T("", !0)
            ], 42, Xo))), 128))
          ])
        ], 12, Po)
      ], 544))
    ], 512));
  }
}), qo = { class: "gx-ins-id" }, el = { class: "gx-ins-name" }, tl = { class: "gx-ins-body" }, nl = { class: "gx-ins-stats" }, ol = {
  key: 0,
  class: "gx-stat"
}, ll = {
  key: 1,
  class: "gx-stat"
}, sl = {
  key: 1,
  class: "gx-rel-group"
}, al = { class: "gx-rel-title" }, il = { class: "kc-refs" }, cl = ["onClick"], rl = { class: "kc-ref-label" }, ul = {
  key: 0,
  class: "gx-rel-group"
}, dl = { class: "gx-rel-title" }, vl = ["onClick"], fl = { class: "gx-rel-kind" }, pl = { class: "gx-rel-label" }, gl = {
  key: 1,
  class: "gx-rel-group"
}, ml = { class: "gx-rel-title" }, hl = ["onClick"], yl = { class: "gx-rel-kind" }, bl = { class: "gx-rel-label" }, kl = {
  key: 3,
  class: "gx-ins-loading"
}, xl = {
  key: 4,
  class: "gx-ins-content"
}, wl = {
  key: 0,
  class: "gx-ins-doc-t"
}, _l = ["content-type", "source"], $l = {
  key: 0,
  class: "gx-ins-clamp-fade",
  "aria-hidden": "true"
}, Cl = ["aria-expanded"], Il = {
  key: 5,
  class: "gx-ins-empty"
}, ht = "kb10:inspect:width", Ml = 320, Sl = 860, Rl = 560, Ol = /* @__PURE__ */ $e({
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
  setup(a, { emit: r }) {
    const e = a, o = r, v = R(() => e.colorOf?.(e.concept.id) || Ee(e.concept).fill);
    function c(u) {
      return e.colorOf?.(u) || Ee({}).fill;
    }
    const I = R(() => e.concept.node_type === "document"), y = R(() => e.edges.filter((u) => u.from_node_id === e.concept.id).map((u) => ({ id: u.id, kind: dt[u.edge_type || ""] || u.edge_type || "related", otherId: u.to_node_id, label: u.to_label || e.labelOf(u.to_node_id) }))), b = R(() => e.edges.filter((u) => u.to_node_id === e.concept.id).map((u) => ({ id: u.id, kind: dt[u.edge_type || ""] || u.edge_type || "related", otherId: u.from_node_id, label: u.from_label || e.labelOf(u.from_node_id) }))), C = R(() => y.value.length + b.value.length), N = R(() => I.value ? Zt(e.concept.id, e.edges).map((u) => ({ id: u.id, label: u.label || e.labelOf(u.id) })) : []), S = R(() => {
      if (I.value) return [e.concept.id];
      const u = [];
      for (const k of e.edges)
        k.edge_type === "categorized_as" && k.to_node_id === e.concept.id && u.push(k.from_node_id);
      return u;
    }), L = E(!1), P = E([]), G = E(""), Z = R(() => P.value.find((u) => _t(u.origMime)) || null), D = R(() => G.value ? { text: G.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function H(u) {
      try {
        const { data: k } = await Ce.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(u)}`);
        if (!k?.success || !k.node) return null;
        const h = k.node, z = String(h.content || "");
        if (!z.trim()) return null;
        const X = h.metadata || {}, q = String(X.original_mime_type || X.source_mime || ""), Q = !!wt(X);
        return {
          id: u,
          title: X.title || X.filename || X.original_filename || e.labelOf(u),
          content: z,
          contentType: h.content_type || "text/markdown",
          origMime: Q ? q : "",
          sourceUrl: `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(u)}/source`
        };
      } catch {
        return null;
      }
    }
    async function g(u) {
      try {
        const { data: k } = await Ce.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(u)}&include_content=true&limit=200`);
        if (!k?.success) return "";
        const h = k.nodes?.find((z) => z.node_type === "summary");
        return String(h?.content || "");
      } catch {
        return "";
      }
    }
    let d = 0;
    async function _() {
      const u = ++d;
      P.value = [], G.value = "", me.value = !1, F.value = !1;
      const k = S.value;
      if (k.length) {
        L.value = !0;
        try {
          const h = await Promise.all(k.map(H));
          if (u !== d) return;
          if (P.value = h.filter((z) => z != null), I.value) {
            const z = await g(e.concept.id);
            if (u !== d) return;
            G.value = z;
          }
        } finally {
          u === d && (L.value = !1);
        }
      }
    }
    ve(Z, (u) => {
      o("original-available", u ? { contentType: u.origMime, sourceUrl: u.sourceUrl, title: u.title } : null);
    }, { immediate: !0 });
    function O(u) {
      return Math.max(Ml, Math.min(Sl, u));
    }
    function V() {
      const u = Number(localStorage.getItem(ht));
      return Number.isFinite(u) && u > 0 ? O(u) : 430;
    }
    const j = E(V()), oe = E(null), re = E(!1);
    function B(u) {
      const k = oe.value;
      if (!k) return;
      const h = k.getBoundingClientRect();
      j.value = O(h.right - u.clientX);
    }
    function x() {
      re.value = !1, window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", x), localStorage.setItem(ht, String(Math.round(j.value)));
    }
    function W(u) {
      u.preventDefault(), re.value = !0, window.addEventListener("pointermove", B), window.addEventListener("pointerup", x);
    }
    const ge = E(null), me = E(!1), F = E(!1);
    function se() {
      const u = ge.value;
      if (!u) {
        F.value = !1;
        return;
      }
      F.value = u.scrollHeight - Rl > 24;
    }
    let ee = null;
    function ue() {
      ee?.disconnect();
      const u = ge.value;
      u && (ee = new ResizeObserver(() => se()), ee.observe(u), lt(se));
    }
    const Re = R(() => F.value && !me.value);
    return ve([P, L], () => {
      L.value || lt(ue);
    }), ve(() => e.concept.id, _, { immediate: !0 }), Ze(() => {
      ee?.disconnect(), x();
    }), (u, k) => (t(), s("aside", {
      ref_key: "asideRef",
      ref: oe,
      class: xe(["gx-inspect", { dragging: re.value }]),
      style: _e({ width: j.value + "px" })
    }, [
      l("div", {
        class: "gx-ins-resizer",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize inspector",
        onPointerdown: W
      }, [...k[3] || (k[3] = [
        l("span", { class: "gx-ins-resizer-grip" }, null, -1)
      ])], 32),
      l("header", {
        class: "gx-ins-h",
        style: _e({ "--accent": v.value })
      }, [
        k[4] || (k[4] = l("span", { class: "gx-ins-dot" }, null, -1)),
        l("div", qo, [
          l("h3", el, U(a.concept.label), 1),
          Z.value ? (t(), ie(m(bt), {
            key: 0,
            class: xe(["gx-ins-orig-btn", { on: a.originalOpen }]),
            label: a.originalOpen ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (h) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : T("", !0)
        ]),
        l("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: k[1] || (k[1] = (h) => o("close"))
        }, [
          $(m(A), { icon: "tabler:x" })
        ])
      ], 4),
      l("div", tl, [
        l("div", nl, [
          a.concept.document_count ? (t(), s("div", ol, [
            $(m(A), { icon: "tabler:files" }),
            l("span", null, U(a.concept.document_count) + " linked", 1)
          ])) : T("", !0),
          C.value ? (t(), s("div", ll, [
            $(m(A), { icon: "tabler:arrows-split-2" }),
            k[5] || (k[5] = l("span", null, "relations", -1)),
            $(m(en), { value: C.value }, null, 8, ["value"])
          ])) : T("", !0)
        ]),
        D.value ? (t(), ie(m(kt), {
          key: a.concept.id,
          icon: D.value.icon,
          label: D.value.label,
          text: D.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : T("", !0),
        N.value.length ? (t(), s("section", sl, [
          l("div", al, [
            $(m(A), { icon: "tabler:link" }),
            k[6] || (k[6] = ce("Filed under", -1))
          ]),
          l("div", il, [
            (t(!0), s(ne, null, pe(N.value, (h) => (t(), s("button", {
              key: h.id,
              class: "kc-ref",
              onClick: (z) => o("select", h.id)
            }, [
              l("span", {
                class: "kc-ref-dot",
                style: _e({ background: c(h.id) })
              }, null, 4),
              l("span", rl, U(h.label), 1),
              $(m(A), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, cl))), 128))
          ])
        ])) : T("", !0),
        I.value ? T("", !0) : (t(), s(ne, { key: 2 }, [
          y.value.length ? (t(), s("section", ul, [
            l("div", dl, [
              $(m(A), { icon: "tabler:arrow-up-right" }),
              k[7] || (k[7] = ce("Relates to", -1))
            ]),
            (t(!0), s(ne, null, pe(y.value, (h) => (t(), s("button", {
              key: h.id,
              class: "gx-rel-item",
              onClick: (z) => o("select", h.otherId)
            }, [
              l("span", fl, U(h.kind), 1),
              l("span", pl, U(h.label), 1),
              $(m(A), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, vl))), 128))
          ])) : T("", !0),
          b.value.length ? (t(), s("section", gl, [
            l("div", ml, [
              $(m(A), { icon: "tabler:arrow-down-left" }),
              k[8] || (k[8] = ce("Referenced by", -1))
            ]),
            (t(!0), s(ne, null, pe(b.value, (h) => (t(), s("button", {
              key: h.id,
              class: "gx-rel-item",
              onClick: (z) => o("select", h.otherId)
            }, [
              l("span", yl, U(h.kind), 1),
              l("span", bl, U(h.label), 1),
              $(m(A), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, hl))), 128))
          ])) : T("", !0)
        ], 64)),
        L.value ? (t(), s("div", kl, [
          $(m(A), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = l("span", null, "Loading content…", -1))
        ])) : P.value.length ? (t(), s("section", xl, [
          l("div", {
            class: xe(["gx-ins-clamp", { clamped: Re.value }])
          }, [
            l("div", {
              ref_key: "contentRef",
              ref: ge,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), s(ne, null, pe(P.value, (h) => (t(), s("div", {
                key: h.id,
                class: "gx-ins-doc"
              }, [
                P.value.length > 1 ? (t(), s("div", wl, U(h.title), 1)) : T("", !0),
                l("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": h.contentType,
                  source: h.content
                }, null, 8, _l)
              ]))), 128))
            ], 512),
            Re.value ? (t(), s("div", $l)) : T("", !0)
          ], 2),
          F.value ? (t(), s("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": me.value,
            onClick: k[2] || (k[2] = (h) => me.value = !me.value)
          }, [
            $(m(A), {
              icon: me.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce(" " + U(me.value ? "Show less" : "Show more"), 1)
          ], 8, Cl)) : T("", !0)
        ])) : T("", !0),
        !L.value && !D.value && !P.value.length && !N.value.length && !y.value.length && !b.value.length ? (t(), s("div", Il, [
          $(m(A), { icon: "tabler:circle-dashed" }),
          k[10] || (k[10] = l("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : T("", !0)
      ])
    ], 6));
  }
}), Tl = ["aria-label", "aria-expanded", "title"], El = { key: 0 }, Dl = {
  key: 0,
  class: "gx-legend-body"
}, Ll = { class: "gx-legend-row" }, Fl = { class: "gx-legend-row" }, Nl = /* @__PURE__ */ $e({
  __name: "GraphLegend",
  setup(a) {
    const r = E(!1);
    return (e, o) => (t(), s("div", {
      class: xe(["gx-legend", { collapsed: !r.value }])
    }, [
      l("button", {
        type: "button",
        class: "gx-legend-toggle",
        "aria-label": r.value ? "Hide legend" : "Show legend",
        "aria-expanded": r.value,
        title: r.value ? "Hide legend" : "Show legend",
        onClick: o[0] || (o[0] = (v) => r.value = !r.value)
      }, [
        $(m(A), {
          icon: r.value ? "tabler:chevron-down" : "tabler:list-details"
        }, null, 8, ["icon"]),
        r.value ? T("", !0) : (t(), s("span", El, "Legend"))
      ], 8, Tl),
      r.value ? (t(), s("div", Dl, [
        o[3] || (o[3] = l("div", { class: "gx-legend-row" }, [
          l("span", { class: "gx-legend-mark gx-legend-cluster" }),
          ce(" Color = topic cluster ")
        ], -1)),
        l("div", Ll, [
          l("span", {
            class: "gx-legend-mark",
            style: _e({ background: m(vt).root.fill })
          }, null, 4),
          o[1] || (o[1] = ce(" Root concept ", -1))
        ]),
        l("div", Fl, [
          l("span", {
            class: "gx-legend-mark doc",
            style: _e({ background: m(vt).document.fill })
          }, null, 4),
          o[2] || (o[2] = ce(" Source document ", -1))
        ]),
        o[4] || (o[4] = Ut('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : T("", !0)
    ], 2));
  }
}), Ul = { class: "gx-controls" }, Bl = { class: "gx-ctrl-read" }, zl = /* @__PURE__ */ $e({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(a, { emit: r }) {
    const e = r;
    return (o, v) => (t(), s("div", Ul, [
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: v[0] || (v[0] = (c) => e("zoom-in"))
      }, [
        $(m(A), { icon: "tabler:plus" })
      ]),
      l("div", Bl, U(Math.round(a.scale * 100)) + "%", 1),
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom out",
        "aria-label": "Zoom out",
        onClick: v[1] || (v[1] = (c) => e("zoom-out"))
      }, [
        $(m(A), { icon: "tabler:minus" })
      ]),
      l("button", {
        class: "gx-ctrl fit",
        type: "button",
        title: "Fit to view",
        "aria-label": "Fit to view",
        onClick: v[2] || (v[2] = (c) => e("fit"))
      }, [
        $(m(A), { icon: "tabler:focus-centered" })
      ])
    ]));
  }
}), Al = { class: "gx-display" }, Pl = ["title"], Vl = ["max", "value"], Wl = { class: "gx-display-lvl" }, Hl = { class: "gx-display-lvl-max" }, Xl = ["aria-checked", "title"], Yl = /* @__PURE__ */ $e({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(a, { emit: r }) {
    const e = r;
    return (o, v) => (t(), s("div", Al, [
      a.maxLevel > 1 ? (t(), s("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${a.level} of ${a.maxLevel} levels`
      }, [
        $(m(A), {
          class: "gx-display-ic",
          icon: "tabler:stack-2",
          "aria-hidden": "true"
        }),
        l("input", {
          class: "gx-range",
          type: "range",
          min: "1",
          max: a.maxLevel,
          value: a.level,
          "aria-label": "Graph depth",
          onInput: v[0] || (v[0] = (c) => e("update:level", Number(c.target.value)))
        }, null, 40, Vl),
        l("span", Wl, [
          ce(U(a.level), 1),
          l("span", Hl, "/" + U(a.maxLevel), 1)
        ]),
        v[3] || (v[3] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Pl)) : T("", !0),
      l("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": a.conceptsOnly,
        title: a.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: v[1] || (v[1] = (c) => e("toggle-concepts"))
      }, [
        $(m(A), {
          icon: a.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        v[5] || (v[5] = l("span", { class: "gx-display-label" }, "Concepts only", -1)),
        l("span", {
          class: xe(["gx-display-sw", { on: a.conceptsOnly }])
        }, [...v[4] || (v[4] = [
          l("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Xl),
      a.hiddenCount || a.focused || a.level < a.maxLevel ? (t(), s(ne, { key: 1 }, [
        v[7] || (v[7] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1)),
        l("button", {
          class: "gx-display-reset",
          title: "Show every node and clear branch isolation",
          onClick: v[2] || (v[2] = (c) => e("reset"))
        }, [
          $(m(A), {
            icon: "tabler:arrow-back-up",
            "aria-hidden": "true"
          }),
          v[6] || (v[6] = l("span", null, "Reset", -1))
        ])
      ], 64)) : T("", !0)
    ]));
  }
});
function We(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function yt(a) {
  const r = We(a) ? a : { message: String(a) }, e = r.response, o = We(e) && e.status === 401 ? "auth-expired" : "other";
  ze.handleError(o, r);
}
const Kl = { class: "kb-railtop" }, Gl = { class: "kb-railtop-acts" }, jl = {
  key: 0,
  class: "kx-main-scroll"
}, Zl = {
  key: 1,
  class: "gx-canvas-wrap"
}, Ql = { class: "gx-botleft" }, Jl = {
  key: 0,
  class: "gx-focusbar"
}, ql = ["title"], es = { class: "gx-focusbar-name" }, ts = {
  key: 0,
  class: "gx-sparse"
}, ns = { class: "gx-treat" }, os = { class: "gx-treat-check" }, ls = { class: "ap-field" }, ss = ["value"], as = { class: "ap-field" }, is = { class: "gx-treat-actions" }, cs = /* @__PURE__ */ $e({
  __name: "GraphView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(a, { emit: r }) {
    const e = a, o = r, { navWidth: v, railRef: c, navDragging: I, onStart: y } = Lt(), b = E(null), C = E(1), N = /* @__PURE__ */ new Set(), S = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n);
      return i;
    }), L = R(() => e.selectedId && S.value.get(e.selectedId) || null), P = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n.label || n.id.slice(0, 8));
      return i;
    });
    function G(i) {
      return P.value.get(i) || i.slice(0, 8);
    }
    const Z = R(() => Qt(e.concepts, e.edges));
    function D(i) {
      return Z.value.get(i)?.fill || Ee({}).fill;
    }
    const H = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.edges)
        (n.edge_type === "subtopic_of" || n.edge_type === "categorized_as") && S.value.has(n.from_node_id) && S.value.has(n.to_node_id) && i.set(n.from_node_id, n.to_node_id);
      return i;
    }), g = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.edges) {
        if (n.from_node_id === n.to_node_id) continue;
        const f = i.get(n.to_node_id) || [];
        f.push(n.from_node_id), i.set(n.to_node_id, f);
      }
      return i;
    });
    function d(i) {
      const n = /* @__PURE__ */ new Set([i]), f = [i];
      for (; f.length; ) {
        const J = f.pop();
        for (const le of g.value.get(J) || [])
          n.has(le) || (n.add(le), f.push(le));
      }
      return n;
    }
    const _ = R(() => {
      const i = /* @__PURE__ */ new Map(), n = H.value, f = (J, le) => {
        const he = i.get(J);
        if (he !== void 0) return he;
        const Le = n.get(J);
        if (Le === void 0 || le.has(J))
          return i.set(J, 0), 0;
        le.add(J);
        const Ve = f(Le, le) + 1;
        return i.set(J, Ve), Ve;
      };
      for (const J of e.concepts) f(J.id, /* @__PURE__ */ new Set());
      return i;
    }), O = R(() => x.value ? _.value.get(x.value) ?? 0 : 0);
    function V(i) {
      return (_.value.get(i) ?? 0) - O.value;
    }
    const j = R(() => {
      let i = 1;
      const n = ee.value;
      for (const f of e.concepts) {
        if (n && !n.has(f.id)) continue;
        const J = V(f.id);
        J > i && (i = J);
      }
      return i;
    }), oe = E(99), re = R(() => Math.min(oe.value, j.value)), B = E(/* @__PURE__ */ new Set()), x = E(null), W = E(!1);
    function ge(i) {
      oe.value = i;
    }
    function me(i) {
      const n = new Set(B.value);
      n.add(i), B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function F(i) {
      const n = new Set(B.value);
      for (const f of d(i)) n.add(f);
      B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const se = R(() => x.value && e.concepts.find((i) => i.id === x.value) || null), ee = R(() => x.value ? d(x.value) : null);
    function ue(i) {
      x.value = x.value === i ? null : i, x.value && o("select", i);
    }
    function Re(i) {
      x.value = i, o("select", i);
    }
    function u() {
      if (!x.value) return;
      const i = H.value.get(x.value);
      i && S.value.has(i) && !S.value.get(i)?.is_root ? (x.value = i, o("select", i)) : x.value = null;
    }
    const k = R(() => {
      if (!x.value) return "";
      const i = H.value.get(x.value), n = i ? S.value.get(i) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function h() {
      x.value = null;
    }
    function z() {
      B.value = /* @__PURE__ */ new Set(), x.value = null, oe.value = 99, W.value = !1;
    }
    ve(x, () => {
      oe.value = 99;
    });
    const X = R(() => {
      const i = ee.value;
      if (!i && !W.value && !B.value.size && re.value >= j.value) return null;
      const n = /* @__PURE__ */ new Set();
      for (const f of e.concepts)
        i && !i.has(f.id) || V(f.id) > re.value || W.value && f.node_type === "document" || B.value.has(f.id) || n.add(f.id);
      return n;
    });
    function q(i) {
      o("select", i), b.value?.focus(i);
    }
    const Q = E({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), Oe = R(() => {
      const i = Q.value.concept;
      if (!i) return [];
      const n = [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "isolate", label: x.value === i.id ? "Clear isolation" : "Isolate branch", icon: "tabler:focus-2" },
        { id: "hide", label: "Hide node", icon: "tabler:eye-off" },
        { id: "hide-branch", label: "Hide branch", icon: "tabler:binary-tree" }
      ];
      return i.node_type !== "document" && n.push(
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!i.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!i.is_root }
      ), n;
    });
    function Ae(i, n, f) {
      Q.value = { open: !0, x: n, y: f, concept: i };
    }
    function Qe(i) {
      const n = S.value.get(i.id);
      n && Ae(n, i.x, i.y);
    }
    function Pe(i) {
      const n = Q.value.concept;
      if (n)
        switch (i) {
          case "open":
            q(n.id);
            break;
          case "isolate":
            ue(n.id);
            break;
          case "hide":
            me(n.id);
            break;
          case "hide-branch":
            F(n.id);
            break;
          default:
            Ne.value = n, Ie.value = i;
            break;
        }
    }
    const Ie = E(""), Ne = E(null), Je = R(() => ({ add: "Add child concept", rename: "Rename concept", move: "Move concept", delete: "Delete concept" })[Ie.value] || "");
    function qe(i) {
      Ie.value = "", i && o("select", i), o("changed");
    }
    const De = E(!1);
    function et(i) {
      De.value = !1;
      const n = i.parent_id || i.id;
      n && e.concepts.some((f) => f.id === n) && q(n);
    }
    const p = R(() => e.selectedId ? e.edges.filter((i) => i.from_node_id === e.selectedId || i.to_node_id === e.selectedId) : []), M = E(null), w = E(null);
    ve(() => e.selectedId, () => {
      M.value = null, w.value = null;
    });
    function Y() {
      if (M.value) {
        M.value = null;
        return;
      }
      w.value && (M.value = w.value);
    }
    const te = R(() => e.concepts.length > 0 && e.concepts.length < 2), K = E(null);
    function ye() {
      o("changed");
    }
    const fe = E(!1), ke = E("class:fast"), ae = E(""), de = E(!1);
    async function we() {
      if (e.kbId)
        try {
          const { data: i } = await Ce.get(`/api/v1/knowledge/${e.kbId}`);
          if (!We(i)) return;
          const n = We(i.knowledge_base) && i.knowledge_base.config || i.config, f = We(n) ? n : {};
          fe.value = f.treatment_enabled === !0, typeof f.treatment_model == "string" && f.treatment_model && (ke.value = f.treatment_model), typeof f.treatment_prompt == "string" && (ae.value = f.treatment_prompt);
        } catch {
        }
    }
    async function Me() {
      if (!(!e.kbId || de.value)) {
        de.value = !0;
        try {
          await Ce.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: fe.value,
            treatment_model: ke.value,
            treatment_prompt: ae.value
          } });
          try {
            ze?.toast?.("Merge settings saved");
          } catch {
          }
        } catch (i) {
          try {
            yt(i);
          } catch {
          }
        } finally {
          de.value = !1;
        }
      }
    }
    async function Ue() {
      if (!(!e.kbId || de.value)) {
        de.value = !0;
        try {
          await Ce.post(`/api/v1/knowledge/${e.kbId}/treatment`, {});
          try {
            ze?.toast?.("Merge started — duplicate concepts will be merged.");
          } catch {
          }
        } catch (i) {
          try {
            yt(i);
          } catch {
          }
        } finally {
          de.value = !1;
        }
      }
    }
    function Be(i) {
      const n = i && (i.detail ?? (i.target && i.target.value));
      typeof n == "string" && n && (ke.value = n);
    }
    return it(() => {
      st("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), st("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), we();
    }), ve(() => e.kbId, () => {
      B.value = /* @__PURE__ */ new Set(), x.value = null, oe.value = 99, W.value = !1, we();
    }), (i, n) => (t(), s("div", {
      ref_key: "railRef",
      ref: c,
      class: xe(["gx", { "wk-dragging": m(I) }]),
      style: _e({ "--kx-rail-width": m(v) + "px" })
    }, [
      a.concepts.length ? (t(), ie(m(Ct), { key: 0 }, {
        rail: be(() => [
          l("div", Kl, [
            l("div", Gl, [
              $(m(Te), {
                icon: "tabler:search",
                label: "Search",
                active: De.value,
                onClick: n[0] || (n[0] = (f) => De.value = !De.value)
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:plus",
                label: "Add content",
                active: K.value === "add",
                onClick: n[1] || (n[1] = (f) => K.value = "add")
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:wand",
                label: "Merge duplicate concepts",
                active: K.value === "treatment",
                onClick: n[2] || (n[2] = (f) => K.value = "treatment")
              }, null, 8, ["active"]),
              $(m(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: a.loading,
                spin: a.loading,
                onClick: n[3] || (n[3] = (f) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: a.concepts,
            edges: a.edges,
            "selected-id": a.selectedId,
            onSelect: q,
            onContext: n[4] || (n[4] = (f) => Ae(f.concept, f.x, f.y))
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: n[5] || (n[5] = //@ts-ignore
            (...f) => m(y) && m(y)(...f))
          }, [...n[26] || (n[26] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: be(() => [
          De.value ? (t(), s("div", jl, [
            $(m(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: "",
              onOpen: et,
              onClose: n[6] || (n[6] = (f) => De.value = !1)
            }, null, 8, ["kb-id"])
          ])) : (t(), s("div", Zl, [
            $(Jo, {
              ref_key: "canvasRef",
              ref: b,
              concepts: a.concepts,
              edges: a.edges,
              "visible-ids": X.value,
              colors: Z.value,
              "selected-id": a.selectedId || null,
              "highlight-ids": m(N),
              onSelect: n[7] || (n[7] = (f) => o("select", f || "")),
              onScale: n[8] || (n[8] = (f) => C.value = f),
              onNodeContext: Qe,
              onNodeDblclick: Re
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            l("div", Ql, [
              $(Nl),
              $(Yl, {
                level: re.value,
                "max-level": j.value,
                "concepts-only": W.value,
                "hidden-count": B.value.size,
                focused: !!x.value,
                "onUpdate:level": ge,
                onToggleConcepts: n[9] || (n[9] = (f) => W.value = !W.value),
                onReset: z
              }, null, 8, ["level", "max-level", "concepts-only", "hidden-count", "focused"])
            ]),
            $(zl, {
              scale: C.value,
              onZoomIn: n[10] || (n[10] = (f) => b.value?.zoomBy(1.25)),
              onZoomOut: n[11] || (n[11] = (f) => b.value?.zoomBy(0.8)),
              onFit: n[12] || (n[12] = (f) => b.value?.fit())
            }, null, 8, ["scale"]),
            $(Ye, { name: "gx-ins-fade" }, {
              default: be(() => [
                se.value ? (t(), s("div", Jl, [
                  l("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${k.value}`,
                    onClick: u
                  }, [
                    $(m(A), {
                      icon: "tabler:arrow-up",
                      "aria-hidden": "true"
                    })
                  ], 8, ql),
                  $(m(A), {
                    class: "gx-focusbar-ic",
                    icon: "tabler:focus-2",
                    "aria-hidden": "true"
                  }),
                  l("span", es, U(se.value.label || "concept"), 1),
                  l("button", {
                    class: "gx-focusbar-x",
                    title: "Show the whole graph",
                    onClick: h
                  }, [
                    $(m(A), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ])
                ])) : T("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: be(() => [
                L.value ? (t(), ie(Ol, {
                  key: 0,
                  "kb-id": a.kbId,
                  concept: L.value,
                  edges: p.value,
                  "label-of": G,
                  "color-of": D,
                  "original-open": !!M.value,
                  onSelect: n[13] || (n[13] = (f) => q(f)),
                  onClose: n[14] || (n[14] = (f) => o("select", "")),
                  onOriginalAvailable: n[15] || (n[15] = (f) => w.value = f),
                  onToggleOriginal: Y
                }, null, 8, ["kb-id", "concept", "edges", "original-open"])) : T("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: be(() => [
                te.value ? (t(), s("div", ts, [
                  $(m(A), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = l("span", null, "Add more content to grow the graph.", -1)),
                  l("button", {
                    class: "gx-sparse-cta",
                    onClick: n[16] || (n[16] = (f) => K.value = "add")
                  }, [
                    $(m(A), {
                      icon: "tabler:plus",
                      "aria-hidden": "true"
                    }),
                    n[27] || (n[27] = ce(" Add content ", -1))
                  ])
                ])) : T("", !0)
              ]),
              _: 1
            })
          ]))
        ]),
        _: 1
      })) : (t(), ie(Mt, {
        key: 1,
        icon: "tabler:topology-star-3",
        title: "No concepts yet",
        hint: "Add documents to start building the concept graph — relationships are extracted automatically.",
        cta: "Add content",
        "cta-icon": "tabler:plus",
        onCta: n[17] || (n[17] = (f) => K.value = "add")
      })),
      $(m(Ke), {
        open: K.value === "add",
        title: "Add content",
        icon: "tabler:plus",
        onClose: n[18] || (n[18] = (f) => K.value = null)
      }, {
        default: be(() => [
          $(St, {
            "kb-id": a.kbId,
            noun: "document",
            onChanged: ye
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(m(Ke), {
        open: K.value === "treatment",
        title: "Merge duplicate concepts",
        icon: "tabler:wand",
        onClose: n[21] || (n[21] = (f) => K.value = null)
      }, {
        default: be(() => [
          l("div", ns, [
            l("label", os, [
              Fe(l("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (f) => fe.value = f)
              }, null, 512), [
                [Bt, fe.value]
              ]),
              n[29] || (n[29] = l("span", null, "Automatically merge duplicate concepts after adding content", -1))
            ]),
            l("div", ls, [
              n[30] || (n[30] = l("span", { class: "ap-label" }, "Model", -1)),
              l("wc-model-picker", {
                value: ke.value,
                capability: "generate",
                onSelect: Be
              }, null, 40, ss)
            ]),
            l("div", as, [
              n[31] || (n[31] = l("span", { class: "ap-label" }, [
                ce("Prompt "),
                l("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Fe(l("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (f) => ae.value = f),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for merging duplicate concepts…"
              }, null, 512), [
                [Ge, ae.value]
              ])
            ]),
            l("div", is, [
              $(m(je), {
                variant: "soft",
                disabled: de.value,
                onClick: Me
              }, {
                default: be(() => [...n[32] || (n[32] = [
                  ce("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(m(je), {
                variant: "primary",
                disabled: de.value,
                onClick: Ue
              }, {
                default: be(() => [...n[33] || (n[33] = [
                  ce("Run now", -1)
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
        open: !!Ie.value,
        title: Je.value,
        icon: "tabler:sitemap",
        onClose: n[23] || (n[23] = (f) => Ie.value = "")
      }, {
        default: be(() => [
          Ie.value ? (t(), ie(Rt, {
            key: 0,
            "kb-id": a.kbId,
            mode: Ie.value,
            target: Ne.value,
            concepts: a.concepts,
            edges: a.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (f) => Ie.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : T("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(m(xt), {
        contained: "",
        open: !!M.value,
        title: M.value?.title || L.value?.label || "",
        "content-type": M.value?.contentType || "",
        "source-url": M.value?.sourceUrl || "",
        onClose: n[24] || (n[24] = (f) => M.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"]),
      $(Tt, {
        open: Q.value.open,
        x: Q.value.x,
        y: Q.value.y,
        items: Oe.value,
        onPick: Pe,
        onClose: n[25] || (n[25] = (f) => Q.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), rs = { class: "kb-page" }, us = ["disabled"], ds = "kb10:wiki:view", vs = /* @__PURE__ */ $e({
  __name: "KbWiki",
  setup(a) {
    const r = zt(), e = At(), o = R(() => r.value.config?.kb_id || ""), v = R(() => r.value.config?.route || "");
    let c = !1;
    function I() {
      const F = r.value.config?.view;
      return F === "graph" || F === "wiki" ? F : localStorage.getItem(ds) === "graph" ? "graph" : "wiki";
    }
    const y = E(I());
    ve(() => r.value.config?.view, (F) => {
      (F === "graph" || F === "wiki") && F !== y.value && (y.value = F);
    });
    const b = E(!1), C = E(""), N = E([]), S = E([]), L = E(""), P = E(null), G = E(!1), Z = R(() => {
      const F = P.value;
      return F ? F.error ? `Graph enrichment failed: ${F.error}` : F.agent_missing ? F.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), D = R(() => !!P.value?.error);
    async function H() {
      if (!(!o.value || G.value)) {
        G.value = !0;
        try {
          await Ce.post(`/api/v1/kb10/${o.value}/enrichment`), P.value = null;
        } catch (F) {
          ze.handleError(F?.response?.status === 401 ? "auth-expired" : "other", F);
        } finally {
          G.value = !1;
        }
      }
    }
    const g = R(() => {
      const F = /* @__PURE__ */ new Map();
      for (const se of N.value) F.set(se.id, se);
      return F;
    }), d = R(() => $t(N.value, S.value)[0]?.concept.id || "");
    let _ = 0;
    async function O(F = !1) {
      if (!o.value) return;
      const se = ++_;
      F || (b.value = !0), C.value = "";
      try {
        const { data: ee } = await Ce.get(`/api/v1/kb10/${o.value}/graph`);
        if (se !== _) return;
        if (ee?.success) {
          N.value = ee.nodes || [], S.value = ee.edges || [];
          const ue = ee.enrichment || {};
          P.value = ue.error || ue.agent_missing ? ue : null, L.value && !g.value.has(L.value) && (L.value = ""), L.value || (v.value && g.value.has(v.value) ? V(v.value) : y.value === "wiki" && d.value && (c = !0, L.value = d.value, c = !1));
        } else
          C.value = ee?.error && gt(ee.error) ? pt : ee?.error || "";
      } catch (ee) {
        if (se !== _) return;
        const ue = ee?.response?.data?.error || ee?.message || "could not load the knowledge base";
        C.value = gt(ue) ? pt : ue, ze.handleError(ee?.response?.status === 401 ? "auth-expired" : "other", ee);
      } finally {
        se === _ && !F && (b.value = !1);
      }
    }
    function V(F) {
      if ((F || "") !== (L.value || "")) {
        if (!F) {
          L.value = "";
          return;
        }
        g.value.has(F) && (c = !0, L.value = F, c = !1);
      }
    }
    ve(L, (F) => {
      c || e("navigate", F || "");
    }), ve(v, (F) => V(F));
    let j = null;
    function oe() {
      j && clearTimeout(j), j = setTimeout(() => {
        j = null, O(!0);
      }, 400);
    }
    let re = null, B = 0;
    function x(F) {
      const se = ++B;
      if (re && (re(), re = null), !F) return;
      const ee = Jt(F, () => oe());
      if (se !== B) {
        ee && ee();
        return;
      }
      re = ee;
    }
    Ze(() => {
      B++, j && clearTimeout(j), re && re();
    }), ve(y, (F) => {
      F === "wiki" && !L.value && d.value && (c = !0, L.value = d.value, c = !1);
    }), ve(o, (F) => {
      L.value = "", O(), x(F);
    }, { immediate: !0 });
    function W(F) {
      F !== L.value && (L.value = F);
    }
    function ge() {
      o.value && e("kb-changed", { kb_id: o.value }), O(!0);
    }
    function me() {
      O();
    }
    return (F, se) => (t(), s("div", rs, [
      C.value ? (t(), ie(m(ft), {
        key: 0,
        tone: "info"
      }, {
        default: be(() => [
          ce(U(C.value), 1)
        ]),
        _: 1
      })) : T("", !0),
      Z.value ? (t(), ie(m(ft), {
        key: 1,
        tone: "warn"
      }, {
        default: be(() => [
          ce(U(Z.value) + " ", 1),
          D.value ? (t(), s("button", {
            key: 0,
            type: "button",
            class: "kx-notice-action",
            disabled: G.value,
            onClick: H
          }, U(G.value ? "Retrying…" : "Retry"), 9, us)) : T("", !0)
        ]),
        _: 1
      })) : T("", !0),
      b.value && !N.value.length ? (t(), ie(m(ln), {
        key: 2,
        icon: y.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: y.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), ie(Ye, {
        key: 3,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: be(() => [
          y.value === "wiki" ? (t(), ie(Bo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: N.value,
            edges: S.value,
            "selected-id": L.value,
            loading: b.value,
            onSelect: W,
            onChanged: ge,
            onReload: me
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "loading"])) : (t(), ie(cs, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: N.value,
            edges: S.value,
            "selected-id": L.value,
            loading: b.value,
            onSelect: W,
            onChanged: ge,
            onReload: me
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "loading"]))
        ]),
        _: 1
      }))
    ]));
  }
}), bs = {
  rootComponent: vs
};
export {
  bs as mountConfig
};
//# sourceMappingURL=wiki-mount-DaOJ-9nz.js.map
