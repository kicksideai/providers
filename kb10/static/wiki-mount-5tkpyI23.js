import { defineComponent as Ce, openBlock as t, createElementBlock as s, toDisplayString as F, createElementVNode as l, createVNode as $, unref as g, createCommentVNode as R, ref as E, computed as O, watch as de, onMounted as ct, createBlock as se, normalizeClass as we, Fragment as ne, renderList as fe, createTextVNode as ae, normalizeStyle as $e, withModifiers as Re, withDirectives as Fe, vModelText as Ge, vModelSelect as ut, withCtx as he, onBeforeUnmount as Ze, onUnmounted as Nt, nextTick as st, createStaticVNode as Ut, Transition as Ye, vModelCheckbox as Bt } from "vue";
import { loadByTagName as at, api as Ie, host as ze } from "@wippy-fe/proxy";
import { a as zt, u as At } from "./wc-runtime-f54Bo-yJ.js";
import { q as Pt, r as Vt, t as Wt, b as bt, d as Ht, e as kt, v as Ee, w as it, x as ot, g as xt, u as wt, a as _t, _ as Te, y as dt, z as $t, A as Xt, B as Yt, C as Kt, D as Gt, j as Ct, k as It, l as Mt, o as Ke, p as St, F as jt, G as vt, H as Zt, N as ft, I as Qt, h as lt, f as Jt, E as pt, i as gt, s as qt } from "./AddPanel.vue_vue_type_script_setup_true_lang-Ciul35dt.js";
import { Icon as P } from "@iconify/vue";
import { _ as je } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const en = { class: "kx-count" }, tn = /* @__PURE__ */ Ce({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(a) {
    return (u, e) => (t(), s("span", en, F(a.value), 1));
  }
}), nn = { class: "kx-loading kx-loading-centered" }, on = { class: "kx-loading-inner" }, ln = { key: 0 }, sn = /* @__PURE__ */ Ce({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(a) {
    return (u, e) => (t(), s("div", nn, [
      l("div", on, [
        $(g(P), {
          icon: a.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        a.label ? (t(), s("span", ln, F(a.label), 1)) : R("", !0)
      ])
    ]));
  }
}), an = {
  key: 0,
  class: "wr"
}, cn = {
  key: 0,
  class: "wr-head"
}, rn = {
  key: 0,
  class: "wr-title-row"
}, un = { class: "wr-title" }, dn = {
  key: 1,
  class: "wr-lede"
}, vn = {
  key: 1,
  class: "wr-state"
}, fn = {
  key: 2,
  class: "wr-state err"
}, pn = {
  key: 1,
  class: "wr-doc"
}, gn = {
  key: 0,
  class: "wr-doc-head"
}, mn = { class: "wr-doc-sep" }, hn = ["aria-expanded", "onClick"], yn = ["source"], bn = {
  key: 3,
  class: "wr-prov"
}, kn = { class: "wr-prov-k" }, xn = ["href"], wn = {
  key: 1,
  class: "wr-prov-v"
}, _n = {
  key: 4,
  class: "wr-doc-rule"
}, $n = {
  key: 2,
  class: "wr-chunks"
}, Cn = {
  key: 0,
  class: "wr-doc-sep"
}, In = ["aria-expanded", "onClick"], Mn = { class: "wr-chunk-n" }, Sn = { class: "wr-chunk-label" }, Rn = {
  key: 0,
  class: "wr-chunk-cx"
}, On = {
  key: 3,
  class: "wr-grid"
}, Tn = ["onClick"], En = { class: "wr-card-top" }, Dn = { class: "wr-card-ic" }, Ln = { class: "wr-card-name" }, Fn = {
  key: 0,
  class: "wr-card-desc"
}, Nn = { class: "wr-card-meta" }, Un = { key: 0 }, Bn = { key: 1 }, zn = { key: 2 }, An = {
  key: 4,
  class: "wr-state muted"
}, Pn = {
  key: 5,
  class: "wr-foot"
}, Vn = {
  key: 0,
  class: "wr-foot-group"
}, Wn = { class: "wr-foot-links" }, Hn = ["onClick"], Xn = {
  key: 1,
  class: "wr-foot-group"
}, Yn = { class: "wr-foot-links" }, Kn = ["onClick"], Gn = { class: "wr-foot-kind" }, jn = /* @__PURE__ */ Ce({
  __name: "WikiReader",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    conceptsById: {}
  },
  emits: ["navigate"],
  setup(a, { emit: u }) {
    const e = a, o = u;
    function v(c) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(c)}/source`;
    }
    const r = E(!1), I = E(""), y = E([]), b = E([]), C = E({}), B = E("rendered"), M = E(null), z = O(() => b.value.reduce((c, k) => c + k.chunks.length, 0)), L = O(() => {
      const c = /* @__PURE__ */ new Map();
      for (const k of b.value) k.summary && c.set(k.id, k.summary);
      return c;
    }), j = O(() => z.value > 0 || b.value.some((c) => c.summary));
    function G(c) {
      C.value = { ...C.value, [c]: !C.value[c] };
    }
    const D = E({}), H = O(() => y.value.length > 1);
    function h(c) {
      return !H.value || !!D.value[c];
    }
    function d(c) {
      D.value = { ...D.value, [c]: !D.value[c] };
    }
    de(y, () => {
      D.value = {};
    });
    const _ = O(() => Pt(e.concept, e.edges)), T = O(() => Vt(e.concept, e.edges, e.conceptsById)), V = O(() => Wt(e.concept, e.edges, e.conceptsById)), ee = O(() => y.value.length > 0), q = O(() => {
      const c = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return j.value && c.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: z.value || void 0 }), c;
    });
    function ke(c) {
      return c.metadata?.original_mime_type || c.metadata?.source_mime || "";
    }
    function N(c) {
      const k = ke(c);
      return wt(c.metadata) && _t(k) ? { contentType: k, sourceUrl: v(c.id) } : k === "application/pdf" ? { contentType: "application/pdf", sourceUrl: v(c.id) } : null;
    }
    function x(c) {
      if (M.value?.id === c.id) {
        M.value = null;
        return;
      }
      const k = N(c);
      k && (M.value = { id: c.id, contentType: k.contentType, sourceUrl: k.sourceUrl, title: c.title });
    }
    const W = O(() => y.value.find((c) => N(c)) || null), pe = O(() => !!W.value), ge = O(() => !!W.value && M.value?.id === W.value.id);
    function ye(c) {
      const k = c.metadata || {}, m = k.filename || k.original_filename, A = k.source_url, X = k.page ?? k.page_number, J = X != null && X !== "";
      if (!m && !A && !J) return [];
      const Z = [], Oe = k.original_mime_type || k.source_mime;
      return m && Z.push({ key: "filename", label: "File", value: String(m) }), Oe && Z.push({ key: "mime", label: "Type", value: String(Oe) }), A && Z.push({ key: "source", label: "Source", value: String(A), href: String(A) }), J && Z.push({ key: "page", label: "Page", value: String(X) }), Z;
    }
    async function U(c) {
      const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(c)}`);
      if (!k?.success || !k.node) return null;
      const m = k.node, A = m.content || "";
      if (!A.trim()) return null;
      const X = m.metadata || {}, J = X.title || X.filename || X.source_url || e.conceptsById.get(c)?.label || "Document";
      return { id: c, title: J, content: A, contentType: m.content_type || "text/markdown", metadata: X };
    }
    ct(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function re(c, k) {
      try {
        const { data: m } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(c)}&include_content=true&limit=200`);
        if (!m?.success) return null;
        const A = m.nodes || [], X = A.filter((Z) => Z.node_type === "chunk").sort((Z, Oe) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((Oe.metadata || {}).index ?? (Oe.metadata || {}).chunk_index ?? 0)).map((Z) => ({ id: Z.id, content: String(Z.content || ""), prefix: String((Z.metadata || {}).contextual_prefix || "") })), J = String((A.find((Z) => Z.node_type === "summary") || {}).content || "");
        return !X.length && !J ? null : { id: c, title: k, summary: J, chunks: X };
      } catch {
        return null;
      }
    }
    let ie = 0;
    async function oe() {
      const c = e.concept, k = ++ie;
      if (y.value = [], b.value = [], C.value = {}, I.value = "", B.value = "rendered", !c || !e.kbId) return;
      const m = _.value;
      if (m.length) {
        r.value = !0;
        try {
          const A = await Promise.all(m.map((J) => U(J).catch(() => null)));
          if (k !== ie) return;
          y.value = A.filter((J) => J != null), !y.value.length && m.length && (I.value = "The source for this page could not be loaded.");
          const X = await Promise.all(y.value.map((J) => re(J.id, J.title)));
          if (k !== ie) return;
          b.value = X.filter((J) => J != null);
        } catch (A) {
          if (k !== ie) return;
          I.value = A?.response?.data?.error || A?.message || "could not load this page";
        } finally {
          k === ie && (r.value = !1);
        }
      }
    }
    return de(() => [e.concept?.id, e.kbId], () => oe(), { immediate: !0 }), de(() => e.concept?.id, () => {
      M.value = null;
    }), (c, k) => a.concept ? (t(), s("article", an, [
      !a.concept.is_root || a.concept.description ? (t(), s("header", cn, [
        a.concept.is_root ? R("", !0) : (t(), s("div", rn, [
          l("h1", un, F(a.concept.label || a.concept.id), 1),
          W.value ? (t(), se(g(bt), {
            key: 0,
            class: we(["wr-orig-btn", { on: ge.value }]),
            label: ge.value ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (m) => x(W.value))
          }, null, 8, ["class", "label"])) : R("", !0)
        ])),
        a.concept.description ? (t(), s("p", dn, F(a.concept.description), 1)) : R("", !0)
      ])) : R("", !0),
      r.value ? (t(), s("div", vn, [
        $(g(P), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        k[3] || (k[3] = l("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), s("div", fn, [
        $(g(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, F(I.value), 1)
      ])) : (t(), s(ne, { key: 3 }, [
        ee.value && (pe.value || j.value) ? (t(), se(g(Ht), {
          key: 0,
          tabs: q.value,
          active: B.value,
          onSelect: k[1] || (k[1] = (m) => B.value = m)
        }, null, 8, ["tabs", "active"])) : R("", !0),
        ee.value && B.value === "rendered" ? (t(), s("div", pn, [
          (t(!0), s(ne, null, fe(y.value, (m, A) => (t(), s("section", {
            key: m.id,
            class: "wr-doc-page"
          }, [
            y.value.length > 1 ? (t(), s("div", gn, [
              l("span", mn, F(m.title), 1),
              l("button", {
                type: "button",
                class: "wr-doc-toggle",
                "aria-expanded": h(m.id),
                onClick: (X) => d(m.id)
              }, [
                $(g(P), {
                  icon: h(m.id) ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                ae(" " + F(h(m.id) ? "Collapse" : "Read"), 1)
              ], 8, hn)
            ])) : R("", !0),
            L.value.get(m.id) ? (t(), se(g(kt), {
              key: 1,
              text: L.value.get(m.id)
            }, null, 8, ["text"])) : R("", !0),
            h(m.id) ? (t(), s("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: m.content
            }, null, 8, yn)) : R("", !0),
            h(m.id) && ye(m).length ? (t(), s("div", bn, [
              (t(!0), s(ne, null, fe(ye(m), (X) => (t(), s("div", {
                key: X.key,
                class: "wr-prov-row"
              }, [
                l("span", kn, F(X.label), 1),
                X.href ? (t(), s("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: X.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, F(X.value), 9, xn)) : (t(), s("span", wn, F(X.value), 1))
              ]))), 128))
            ])) : R("", !0),
            A < y.value.length - 1 ? (t(), s("hr", _n)) : R("", !0)
          ]))), 128))
        ])) : ee.value && B.value === "chunks" ? (t(), s("div", $n, [
          (t(!0), s(ne, null, fe(b.value, (m) => (t(), s("section", {
            key: m.id,
            class: "wr-chunks-doc"
          }, [
            b.value.length > 1 ? (t(), s("div", Cn, F(m.title), 1)) : R("", !0),
            (t(!0), s(ne, null, fe(m.chunks, (A, X) => (t(), s("div", {
              key: A.id,
              class: we(["wr-chunk", { open: C.value[A.id] }])
            }, [
              l("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!C.value[A.id],
                onClick: (J) => G(A.id)
              }, [
                l("span", Mn, F(X + 1), 1),
                l("span", Sn, "Chunk " + F(X + 1), 1),
                $(g(P), {
                  class: "wr-chunk-chev",
                  icon: C.value[A.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, In),
              A.prefix ? (t(), s("p", Rn, [
                $(g(P), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                l("span", null, F(A.prefix), 1)
              ])) : R("", !0),
              l("p", {
                class: we(["wr-chunk-body", { clamp: !C.value[A.id] }])
              }, F(A.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : T.value.length ? (t(), s("div", On, [
          (t(!0), s(ne, null, fe(T.value, (m) => (t(), s("button", {
            key: m.id,
            class: "wr-card",
            style: $e({ "--c": g(Ee)(m).fill }),
            onClick: (A) => o("navigate", m)
          }, [
            l("span", En, [
              l("span", Dn, [
                $(g(P), {
                  icon: g(it)(m),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(g(P), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            l("span", Ln, F(m.label || m.id), 1),
            m.description ? (t(), s("span", Fn, F(m.description), 1)) : R("", !0),
            l("span", Nn, [
              m.document_count ? (t(), s("span", Un, F(m.document_count) + " " + F(m.document_count === 1 ? "page" : "pages"), 1)) : R("", !0),
              g(ot)(m.id, a.edges) ? (t(), s("span", Bn, F(g(ot)(m.id, a.edges)) + " subtopics", 1)) : R("", !0),
              !m.document_count && !g(ot)(m.id, a.edges) ? (t(), s("span", zn, "empty")) : R("", !0)
            ])
          ], 12, Tn))), 128))
        ])) : (t(), s("div", An, [
          $(g(P), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          k[4] || (k[4] = l("span", null, "This page has no content yet.", -1))
        ])),
        V.value.length || ee.value && T.value.length ? (t(), s("footer", Pn, [
          ee.value && T.value.length ? (t(), s("div", Vn, [
            k[5] || (k[5] = l("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            l("div", Wn, [
              (t(!0), s(ne, null, fe(T.value, (m) => (t(), s("button", {
                key: m.id,
                class: "wr-foot-link",
                onClick: (A) => o("navigate", m)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: g(Ee)(m).fill })
                }, null, 4),
                ae(F(m.label || m.id), 1)
              ], 8, Hn))), 128))
            ])
          ])) : R("", !0),
          V.value.length ? (t(), s("div", Xn, [
            k[6] || (k[6] = l("span", { class: "wr-foot-h" }, "Related", -1)),
            l("div", Yn, [
              (t(!0), s(ne, null, fe(V.value, (m) => (t(), s("button", {
                key: m.concept.id,
                class: "wr-foot-link",
                onClick: (A) => o("navigate", m.concept)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: g(Ee)(m.concept).fill })
                }, null, 4),
                ae(F(m.concept.label || m.concept.id) + " ", 1),
                l("span", Gn, F(m.label), 1)
              ], 8, Kn))), 128))
            ])
          ])) : R("", !0)
        ])) : R("", !0)
      ], 64)),
      $(g(xt), {
        contained: "",
        open: !!M.value,
        title: M.value?.title || a.concept?.label || "",
        "content-type": M.value?.contentType || "",
        "source-url": M.value?.sourceUrl || "",
        onClose: k[2] || (k[2] = (m) => M.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : R("", !0);
  }
}), Zn = { class: "wk-tax-h" }, Qn = ["value"], Jn = {
  key: 2,
  class: "wk-tax-del"
}, qn = { class: "wk-tax-counts" }, eo = ["value"], to = {
  key: 3,
  class: "wk-tax-err"
}, no = { class: "wk-tax-foot" }, Rt = /* @__PURE__ */ Ce({
  __name: "TaxonomyForm",
  props: {
    kbId: {},
    mode: {},
    target: {},
    concepts: {},
    edges: {}
  },
  emits: ["saved", "close"],
  setup(a, { emit: u }) {
    const e = a, o = u, v = E(""), r = E(""), I = E(""), y = E(""), b = E(!1), C = E(""), B = O(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.concepts) d.set(_.id, _);
      return d;
    }), M = O(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.edges)
        (_.edge_type === "subtopic_of" || _.edge_type === "categorized_as") && B.value.has(_.from_node_id) && B.value.has(_.to_node_id) && d.set(_.from_node_id, _.to_node_id);
      return d;
    }), z = O(() => ({ add: "Add child concept", rename: "Rename", move: "Move to", delete: "Delete" })[e.mode] || ""), L = O(() => e.concepts.filter((d) => d.node_type !== "document"));
    function j(d, _) {
      let T = d;
      const V = /* @__PURE__ */ new Set();
      for (; T && !V.has(T); ) {
        if (T === _) return !0;
        V.add(T), T = M.value.get(T);
      }
      return !1;
    }
    const G = O(() => {
      const d = e.target;
      return d ? L.value.filter((_) => _.id !== d.id && !j(_.id, d.id)) : L.value;
    }), D = O(() => {
      const d = e.target;
      if (!d) return { childCount: 0, documentCount: 0, empty: !0 };
      let _ = 0, T = 0;
      for (const V of e.edges)
        V.to_node_id === d.id && (V.edge_type === "subtopic_of" && (_ += 1), V.edge_type === "categorized_as" && (T += 1));
      return { childCount: _, documentCount: T, empty: _ === 0 && T === 0 };
    }), H = O(() => {
      const d = e.target;
      return b.value ? !1 : e.mode === "add" ? v.value.trim() !== "" : !d || d.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? v.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== d.id : e.mode === "delete" ? D.value.empty || y.value !== "" : !1;
    });
    de(() => [e.mode, e.target], () => {
      const d = e.target;
      v.value = e.mode === "rename" && d?.label || "", r.value = e.mode === "rename" && d?.description || "", I.value = d && M.value.get(d.id) || "", y.value = "", C.value = "";
    }, { immediate: !0 });
    async function h() {
      const d = e.target, _ = e.kbId;
      if (!(!_ || !H.value)) {
        b.value = !0, C.value = "";
        try {
          let T = d?.id || "";
          if (e.mode === "add") {
            const { data: V } = await Ie.post(`/api/v1/kb10/${_}/concepts`, {
              label: v.value.trim(),
              description: r.value.trim(),
              parent_id: d?.id
            });
            if (!V?.success) throw new Error(V?.error || "create failed");
            T = V.node_id || T;
          } else if (e.mode === "rename" && d) {
            const { data: V } = await Ie.patch(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, {
              label: v.value.trim(),
              description: r.value.trim()
            });
            if (!V?.success) throw new Error(V?.error || "update failed");
            T = d.id;
          } else if (e.mode === "move" && d) {
            const { data: V } = await Ie.put(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}/parent`, {
              parent_id: I.value
            });
            if (!V?.success) throw new Error(V?.error || "move failed");
            T = d.id;
          } else if (e.mode === "delete" && d) {
            const V = y.value ? { reassign_to_concept_id: y.value } : {}, { data: ee } = await Ie.delete(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, { data: V });
            if (!ee?.success) throw new Error(ee?.error || "delete failed");
            T = y.value || M.value.get(d.id) || "";
          }
          o("saved", T);
        } catch (T) {
          C.value = T?.response?.data?.error || T?.message || "taxonomy update failed", ze.handleError(T?.response?.status === 401 ? "auth-expired" : "other", T);
        } finally {
          b.value = !1;
        }
      }
    }
    return (d, _) => (t(), s("form", {
      class: "wk-tax",
      onSubmit: Re(h, ["prevent"])
    }, [
      l("div", Zn, [
        l("span", null, F(z.value), 1),
        $(g(Te), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: _[0] || (_[0] = (T) => o("close"))
        })
      ]),
      a.mode === "add" || a.mode === "rename" ? (t(), s(ne, { key: 0 }, [
        Fe(l("input", {
          "onUpdate:modelValue": _[1] || (_[1] = (T) => v.value = T),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ge, v.value]
        ]),
        Fe(l("textarea", {
          "onUpdate:modelValue": _[2] || (_[2] = (T) => r.value = T),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ge, r.value]
        ])
      ], 64)) : R("", !0),
      a.mode === "move" ? Fe((t(), s("select", {
        key: 1,
        "onUpdate:modelValue": _[3] || (_[3] = (T) => I.value = T),
        class: "wk-tax-input"
      }, [
        _[6] || (_[6] = l("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), s(ne, null, fe(G.value, (T) => (t(), s("option", {
          key: T.id,
          value: T.id
        }, F(T.label || T.id), 9, Qn))), 128))
      ], 512)), [
        [ut, I.value]
      ]) : R("", !0),
      a.mode === "delete" ? (t(), s("div", Jn, [
        l("div", qn, [
          l("span", null, [
            $(g(P), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            ae(F(D.value.childCount) + " subtopics", 1)
          ]),
          l("span", null, [
            $(g(P), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            ae(F(D.value.documentCount) + " pages", 1)
          ])
        ]),
        D.value.empty ? R("", !0) : Fe((t(), s("select", {
          key: 0,
          "onUpdate:modelValue": _[4] || (_[4] = (T) => y.value = T),
          class: "wk-tax-input"
        }, [
          _[7] || (_[7] = l("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), s(ne, null, fe(G.value, (T) => (t(), s("option", {
            key: T.id,
            value: T.id
          }, F(T.label || T.id), 9, eo))), 128))
        ], 512)), [
          [ut, y.value]
        ])
      ])) : R("", !0),
      C.value ? (t(), s("div", to, [
        $(g(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, F(C.value), 1)
      ])) : R("", !0),
      l("div", no, [
        $(g(je), {
          variant: "ghost",
          small: "",
          disabled: b.value,
          onClick: _[5] || (_[5] = (T) => o("close"))
        }, {
          default: he(() => [..._[8] || (_[8] = [
            ae("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(g(je), {
          type: "submit",
          small: "",
          variant: a.mode === "delete" ? "danger" : "primary",
          loading: b.value,
          disabled: !H.value
        }, {
          default: he(() => [
            ae(F(a.mode === "delete" ? "Delete" : "Save"), 1)
          ]),
          _: 1
        }, 8, ["variant", "loading", "disabled"])
      ])
    ], 32));
  }
}), oo = { class: "wn" }, lo = {
  key: 0,
  class: "wn-folder"
}, so = ["title"], ao = {
  key: 1,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Search results"
}, io = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], co = { class: "wn-item-text" }, ro = { class: "wn-label" }, uo = {
  key: 0,
  class: "wn-path"
}, vo = {
  key: 0,
  class: "wn-path-sep"
}, fo = ["onClick"], po = {
  key: 0,
  class: "wn-empty"
}, go = {
  key: 2,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Folder contents"
}, mo = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], ho = { class: "wn-label" }, yo = {
  key: 0,
  class: "wn-count"
}, bo = ["onClick"], ko = {
  key: 0,
  class: "wn-empty"
}, xo = /* @__PURE__ */ Ce({
  __name: "WikiNav",
  props: {
    crumbs: {},
    entries: {},
    selectedId: {},
    query: {},
    results: {}
  },
  emits: ["open", "enter", "up", "context"],
  setup(a, { emit: u }) {
    const e = a, o = u;
    function v(D, H) {
      const h = D.currentTarget.getBoundingClientRect();
      o("context", { concept: H, x: h.right, y: h.bottom });
    }
    function r(D, H) {
      o("context", { concept: H, x: D.clientX, y: D.clientY });
    }
    const I = O(() => e.query.trim().length > 0), y = O(() => e.crumbs.length > 1), b = O(() => e.crumbs[e.crumbs.length - 1] || null);
    function C(D) {
      return D.label || (D.node_type === "document" ? "Untitled page" : D.id);
    }
    function B(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    function M(D) {
      D.isFolder ? o("enter", D.concept) : o("open", D.concept);
    }
    const z = E(""), L = O(() => I.value ? e.results : e.entries);
    function j(D) {
      const H = L.value;
      return (H.find((d) => d.concept.id === z.value) || H.find((d) => d.concept.id === e.selectedId) || H[0])?.concept.id === D ? 0 : -1;
    }
    function G(D, H) {
      if (D.target !== D.currentTarget) return;
      if (D.key === "Enter" || D.key === " ") {
        D.preventDefault(), H.isFolder ? o("enter", H.concept) : o("open", H.concept);
        return;
      }
      const h = D.currentTarget, d = Array.from(h.parentElement.querySelectorAll('[role="option"]')), _ = d.indexOf(h);
      let T;
      switch (D.key) {
        case "ArrowDown":
          T = Math.min(_ + 1, d.length - 1);
          break;
        case "ArrowUp":
          T = Math.max(_ - 1, 0);
          break;
        case "Home":
          T = 0;
          break;
        case "End":
          T = d.length - 1;
          break;
        default:
          return;
      }
      D.preventDefault(), d[T]?.focus();
    }
    return (D, H) => (t(), s("div", oo, [
      !I.value && b.value ? (t(), s("div", lo, [
        y.value ? (t(), s("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: H[0] || (H[0] = (h) => o("up"))
        }, [
          $(g(P), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : R("", !0),
        l("span", {
          class: "wn-folder-name",
          title: C(b.value)
        }, F(C(b.value)), 9, so)
      ])) : R("", !0),
      I.value ? (t(), s("ul", ao, [
        (t(!0), s(ne, null, fe(a.results, (h) => (t(), s("li", {
          key: h.concept.id,
          class: we(["wn-item", { active: h.concept.id === a.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: j(h.concept.id),
          onFocus: (d) => z.value = h.concept.id,
          onKeydown: (d) => G(d, h),
          "aria-selected": h.concept.id === a.selectedId,
          onClick: (d) => M(h),
          onContextmenu: Re((d) => r(d, h.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: $e({ color: g(Ee)(h.concept).fill })
          }, [
            $(g(P), {
              icon: h.isFolder ? g(it)(h.concept) : g(dt)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", co, [
            l("span", ro, F(C(h.concept)), 1),
            h.path.length ? (t(), s("span", uo, [
              (t(!0), s(ne, null, fe(h.path, (d, _) => (t(), s(ne, {
                key: d.id
              }, [
                _ ? (t(), s("span", vo, "/")) : R("", !0),
                ae(F(d.label || d.id), 1)
              ], 64))), 128))
            ])) : R("", !0)
          ]),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Re((d) => v(d, h.concept), ["stop"])
          }, [
            $(g(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, fo),
          h.isFolder ? (t(), se(g(P), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, io))), 128)),
        a.results.length ? R("", !0) : (t(), s("li", po, "No matches."))
      ])) : (t(), s("ul", go, [
        (t(!0), s(ne, null, fe(a.entries, (h) => (t(), s("li", {
          key: h.concept.id,
          class: we(["wn-item", { active: h.concept.id === a.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: j(h.concept.id),
          onFocus: (d) => z.value = h.concept.id,
          onKeydown: (d) => G(d, h),
          "aria-selected": h.concept.id === a.selectedId,
          onClick: (d) => B(h),
          onContextmenu: Re((d) => r(d, h.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: $e({ color: g(Ee)(h.concept).fill })
          }, [
            $(g(P), {
              icon: h.isFolder ? g(it)(h.concept) : g(dt)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", ho, F(C(h.concept)), 1),
          h.isFolder ? (t(), s("span", yo, F(h.childCount), 1)) : R("", !0),
          l("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Re((d) => v(d, h.concept), ["stop"])
          }, [
            $(g(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, bo),
          h.isFolder ? (t(), se(g(P), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, mo))), 128)),
        a.entries.length ? R("", !0) : (t(), s("li", ko, "This level is empty."))
      ]))
    ]));
  }
}), wo = { class: "cn" }, _o = { class: "wn-filter" }, $o = {
  class: "kx-rail-body",
  "aria-label": "Contents"
}, Ot = /* @__PURE__ */ Ce({
  __name: "ConceptNavRail",
  props: {
    concepts: {},
    edges: {},
    selectedId: {}
  },
  emits: ["select", "context"],
  setup(a, { emit: u }) {
    const e = a, o = u, v = O(() => $t(e.concepts, e.edges)), r = O(() => Xt(v.value)), I = E(""), y = E(""), b = O(() => r.value.byId.get(I.value)), C = O(() => I.value ? Yt(I.value, r.value.byId, r.value.parentOf) : []), B = O(() => Kt(b.value)), M = O(() => Gt(y.value, r.value.byId, r.value.parentOf));
    function z(h) {
      const d = r.value.byId.get(h);
      if (d && d.children.length) return h;
      const _ = r.value.parentOf.get(h);
      return _ || v.value[0]?.concept.id || h;
    }
    function L() {
      return v.value[0]?.concept.id || "";
    }
    function j(h) {
      const d = h ? z(h) : I.value || L();
      d && d !== I.value && (I.value = d);
    }
    function G(h) {
      I.value = h.id, y.value = "", o("select", h.id);
    }
    function D(h) {
      o("select", h.id);
    }
    function H() {
      const h = r.value.parentOf.get(I.value);
      h && (I.value = h, o("select", h));
    }
    return de(() => e.selectedId, (h) => j(h), { immediate: !0 }), de([() => r.value, I], () => {
      if (I.value && r.value.byId.has(I.value)) return;
      const h = e.selectedId ? z(e.selectedId) : L();
      h && (I.value = h);
    }, { immediate: !0 }), (h, d) => (t(), s("div", wo, [
      l("div", _o, [
        $(g(P), {
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
          $(g(P), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : R("", !0)
      ]),
      l("nav", $o, [
        $(xo, {
          crumbs: C.value,
          entries: B.value,
          "selected-id": a.selectedId,
          query: y.value,
          results: M.value,
          onOpen: D,
          onEnter: G,
          onUp: H,
          onContext: d[2] || (d[2] = (_) => o("context", _))
        }, null, 8, ["crumbs", "entries", "selected-id", "query", "results"])
      ])
    ]));
  }
}), Co = {
  key: 0,
  class: "kb-menu-title"
}, Io = {
  key: 0,
  class: "kb-menu-sep",
  role: "separator"
}, Mo = ["disabled", "onClick"], Tt = /* @__PURE__ */ Ce({
  __name: "NodeMenu",
  props: {
    open: { type: Boolean },
    x: {},
    y: {},
    title: {},
    items: {}
  },
  emits: ["pick", "close"],
  setup(a, { emit: u }) {
    const e = a, o = u, v = O(() => {
      const b = e.items.filter((L) => !L.divider).length, C = e.items.filter((L) => L.divider).length, B = (e.title ? 30 : 0) + 10 + b * 34 + C * 9, M = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), z = Math.max(8, Math.min(e.y, window.innerHeight - B - 8));
      return { left: `${M}px`, top: `${z}px`, width: "224px" };
    });
    function r(y) {
      y.key === "Escape" && o("close");
    }
    ct(() => window.addEventListener("keydown", r)), Ze(() => window.removeEventListener("keydown", r));
    function I(y) {
      y.disabled || y.divider || (o("pick", y.id), o("close"));
    }
    return (y, b) => a.open ? (t(), s("div", {
      key: 0,
      class: "kb-menu-backdrop",
      onMousedown: b[2] || (b[2] = (C) => o("close")),
      onContextmenu: b[3] || (b[3] = Re((C) => o("close"), ["prevent"])),
      onWheel: b[4] || (b[4] = Re((C) => o("close"), ["prevent"]))
    }, [
      l("div", {
        class: "kb-menu",
        style: $e(v.value),
        role: "menu",
        onMousedown: b[0] || (b[0] = Re(() => {
        }, ["stop"])),
        onContextmenu: b[1] || (b[1] = Re(() => {
        }, ["prevent", "stop"]))
      }, [
        a.title ? (t(), s("div", Co, F(a.title), 1)) : R("", !0),
        (t(!0), s(ne, null, fe(a.items, (C, B) => (t(), s(ne, {
          key: C.id + ":" + B
        }, [
          C.divider ? (t(), s("div", Io)) : (t(), s("button", {
            key: 1,
            class: we(["kb-menu-item", { danger: C.danger, disabled: C.disabled }]),
            disabled: C.disabled,
            role: "menuitem",
            onClick: (M) => I(C)
          }, [
            C.icon ? (t(), se(g(P), {
              key: 0,
              icon: C.icon,
              class: "kb-menu-ic",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : R("", !0),
            l("span", null, F(C.label), 1)
          ], 10, Mo))
        ], 64))), 128))
      ], 36)
    ], 32)) : R("", !0);
  }
}), Et = "kb10:wiki:navWidth", So = 220, Ro = 560;
function Dt(a) {
  return Math.max(So, Math.min(Ro, a));
}
function Oo() {
  const a = Number(localStorage.getItem(Et));
  return Number.isFinite(a) && a > 0 ? Dt(a) : 300;
}
function Lt() {
  const a = E(Oo()), u = E(null), e = E(!1);
  function o(I) {
    const y = u.value;
    if (!y) return;
    const b = y.getBoundingClientRect();
    a.value = Dt(I.clientX - b.left);
  }
  function v() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", v), localStorage.setItem(Et, String(Math.round(a.value)));
  }
  function r(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", v);
  }
  return Ze(v), { navWidth: a, railRef: u, navDragging: e, onStart: r };
}
const To = { class: "kb-railtop" }, Eo = { class: "kb-railtop-acts" }, Do = {
  key: 0,
  class: "kx-main-scroll"
}, Lo = {
  key: 1,
  class: "kx-main-scroll wk-doc-inner"
}, Fo = {
  key: 0,
  class: "wk-pagebar"
}, No = {
  key: 0,
  class: "wk-crumbs",
  "aria-label": "Wiki path"
}, Uo = ["onClick"], Bo = {
  key: 1,
  class: "wk-tools"
}, zo = /* @__PURE__ */ Ce({
  __name: "WikiView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(a, { emit: u }) {
    const e = a, o = u, { navWidth: v, railRef: r, navDragging: I, onStart: y } = Lt(), b = O(() => {
      const N = /* @__PURE__ */ new Map();
      for (const x of e.concepts) N.set(x.id, x);
      return N;
    }), C = O(() => e.selectedId && b.value.get(e.selectedId) || null), B = O(() => !!C.value && C.value.node_type !== "document"), M = O(() => {
      const N = /* @__PURE__ */ new Map();
      for (const x of e.edges)
        (x.edge_type === "subtopic_of" || x.edge_type === "categorized_as") && b.value.has(x.from_node_id) && b.value.has(x.to_node_id) && N.set(x.from_node_id, x.to_node_id);
      return N;
    }), z = O(() => {
      const N = [];
      let x = e.selectedId;
      const W = /* @__PURE__ */ new Set();
      for (; x && !W.has(x); ) {
        W.add(x);
        const pe = b.value.get(x);
        if (!pe) break;
        N.unshift(pe), x = M.value.get(x);
      }
      return N.slice(0, -1).filter((pe) => !pe.is_root);
    }), L = E({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), j = O(() => {
      const N = L.value.concept;
      return N ? N.node_type === "document" ? [{ id: "open", label: "Open", icon: "tabler:arrow-right" }] : [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!N.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!N.is_root }
      ] : [];
    });
    function G(N) {
      L.value = { open: !0, x: N.x, y: N.y, concept: N.concept };
    }
    const D = E(null);
    function H() {
      if (!C.value) return;
      const x = D.value?.$el?.getBoundingClientRect();
      L.value = { open: !0, x: x ? x.right : 0, y: x ? x.bottom : 0, concept: C.value };
    }
    const h = E(""), d = E(null);
    function _(N) {
      const x = L.value.concept;
      if (x) {
        if (N === "open") {
          o("select", x.id);
          return;
        }
        d.value = x, h.value = N;
      }
    }
    function T(N) {
      h.value = "", N && o("select", N), o("changed");
    }
    const V = E(!1);
    function ee(N) {
      const x = b.value.get(N.id) || (N.parent_id ? b.value.get(N.parent_id) : null);
      x && o("select", x.id), V.value = !1;
    }
    const q = E("");
    function ke(N) {
      N && (q.value = ""), o("changed");
    }
    return (N, x) => (t(), s("div", {
      ref_key: "railRef",
      ref: r,
      class: we(["wk", { "wk-dragging": g(I) }]),
      style: $e({ "--kx-rail-width": g(v) + "px" })
    }, [
      a.concepts.length ? (t(), se(g(Ct), { key: 0 }, {
        rail: he(() => [
          l("div", To, [
            l("div", Eo, [
              $(g(Te), {
                icon: "tabler:search",
                label: "Search",
                active: V.value,
                onClick: x[0] || (x[0] = (W) => V.value = !V.value)
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: x[1] || (x[1] = (W) => q.value = "add")
              }),
              $(g(Te), {
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
            onContext: G
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: x[4] || (x[4] = //@ts-ignore
            (...W) => g(y) && g(y)(...W))
          }, [...x[11] || (x[11] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: he(() => [
          V.value ? (t(), s("div", Do, [
            $(g(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: "",
              placeholder: "Search this wiki…",
              onOpen: ee,
              onClose: x[5] || (x[5] = (W) => V.value = !1)
            }, null, 8, ["kb-id"])
          ])) : (t(), s("div", Lo, [
            z.value.length || B.value ? (t(), s("div", Fo, [
              z.value.length ? (t(), s("nav", No, [
                (t(!0), s(ne, null, fe(z.value, (W, pe) => (t(), s(ne, {
                  key: W.id
                }, [
                  pe ? (t(), se(g(P), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : R("", !0),
                  l("button", {
                    class: "wk-crumb",
                    onClick: (ge) => o("select", W.id)
                  }, F(W.label || W.id), 9, Uo)
                ], 64))), 128))
              ])) : R("", !0),
              B.value ? (t(), s("div", Bo, [
                $(g(Te), {
                  ref_key: "structBtnRef",
                  ref: D,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!h.value,
                  onClick: H
                }, null, 8, ["active"])
              ])) : R("", !0)
            ])) : R("", !0),
            h.value ? (t(), se(Rt, {
              key: 1,
              "kb-id": a.kbId,
              mode: h.value,
              target: d.value,
              concepts: a.concepts,
              edges: a.edges,
              onSaved: T,
              onClose: x[6] || (x[6] = (W) => h.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0),
            $(jn, {
              "kb-id": a.kbId,
              concept: C.value,
              edges: a.edges,
              "concepts-by-id": b.value,
              onNavigate: x[7] || (x[7] = (W) => o("select", W.id))
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
        onCta: x[8] || (x[8] = (W) => q.value = "add")
      })),
      $(g(Ke), {
        open: q.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: x[9] || (x[9] = (W) => q.value = "")
      }, {
        default: he(() => [
          $(St, {
            "kb-id": a.kbId,
            noun: "page",
            onChanged: ke
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(Tt, {
        open: L.value.open,
        x: L.value.x,
        y: L.value.y,
        items: j.value,
        onPick: _,
        onClose: x[10] || (x[10] = (W) => L.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), Ao = 0.81, mt = 144;
class Po {
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
  constructor(u, e, o, v, r) {
    this.nodes = u, this.links = e, this.width = o, this.height = v, this.charge = r;
  }
  // One integration step. Returns true while still cooling.
  tick() {
    this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay;
    const u = this.alpha;
    return this.applyCharge(u), this.applyLinks(u), this.applyCenter(u), this.applyCollide(), this.integrate(), this.alpha >= this.alphaMin || this.alphaTarget > 0;
  }
  // ── Barnes-Hut many-body repulsion (O(n log n)) ──────────────────────────
  applyCharge(u) {
    const e = this.nodes, o = e.length;
    if (o < 2) return;
    let v = 1 / 0, r = 1 / 0, I = -1 / 0, y = -1 / 0;
    for (let M = 0; M < o; M++) {
      const z = e[M];
      z.x < v && (v = z.x), z.x > I && (I = z.x), z.y < r && (r = z.y), z.y > y && (y = z.y);
    }
    const b = Math.max(I - v, y - r, 1) + 1, C = { x0: v, y0: r, x1: v + b, y1: r + b, mass: 0, cx: 0, cy: 0, node: null, kids: null };
    for (let M = 0; M < o; M++) this.insert(C, e[M]);
    this.computeMass(C);
    const B = this.charge * u;
    for (let M = 0; M < o; M++) this.repel(e[M], C, B);
  }
  // Insert p into the subtree rooted at q, subdividing leaves as needed.
  insert(u, e) {
    for (; u.kids; ) u = this.kid(u, e);
    if (u.node === null) {
      u.node = e;
      return;
    }
    if (u.node === e) return;
    u.node.x === e.x && u.node.y === e.y && (e.x += (Math.random() - 0.5) * 0.5, e.y += (Math.random() - 0.5) * 0.5);
    const o = u.node;
    u.node = null, u.kids = [null, null, null, null], this.insert(this.kid(u, o), o), this.insert(this.kid(u, e), e);
  }
  // Return the child quad of q containing point p, creating it on demand.
  kid(u, e) {
    const o = (u.x0 + u.x1) / 2, v = (u.y0 + u.y1) / 2, r = e.x >= o, I = e.y >= v, y = (I ? 2 : 0) + (r ? 1 : 0);
    let b = u.kids[y];
    return b || (b = {
      x0: r ? o : u.x0,
      x1: r ? u.x1 : o,
      y0: I ? v : u.y0,
      y1: I ? u.y1 : v,
      mass: 0,
      cx: 0,
      cy: 0,
      node: null,
      kids: null
    }, u.kids[y] = b), b;
  }
  computeMass(u) {
    if (!u.kids) {
      u.node && (u.mass = 1, u.cx = u.node.x, u.cy = u.node.y);
      return;
    }
    let e = 0, o = 0, v = 0;
    for (const r of u.kids)
      r && (this.computeMass(r), r.mass !== 0 && (e += r.mass, o += r.cx * r.mass, v += r.cy * r.mass));
    u.mass = e, e > 0 && (u.cx = o / e, u.cy = v / e);
  }
  repel(u, e, o) {
    if (e.mass === 0 || e.node === u) return;
    let v = e.cx - u.x, r = e.cy - u.y, I = v * v + r * r;
    I === 0 && (v = (Math.random() - 0.5) * 0.01, r = (Math.random() - 0.5) * 0.01, I = v * v + r * r);
    const y = e.x1 - e.x0;
    if (!e.kids || y * y / I < Ao) {
      const b = I < mt ? mt : I, C = Math.sqrt(I), B = o * e.mass / b;
      u.vx -= v / C * B, u.vy -= r / C * B;
      return;
    }
    for (const b of e.kids) b && this.repel(u, b, o);
  }
  applyLinks(u) {
    for (const e of this.links) {
      const o = this.nodes[e.source], v = this.nodes[e.target];
      if (!o || !v) continue;
      const r = v.x - o.x, I = v.y - o.y, y = Math.sqrt(r * r + I * I) || 1e-6, b = (y - e.distance) / y * u * e.strength, C = r * b, B = I * b;
      o.vx += C * 0.5, o.vy += B * 0.5, v.vx -= C * 0.5, v.vy -= B * 0.5;
    }
  }
  applyCenter(u) {
    const e = this.width / 2, o = this.height / 2;
    for (const v of this.nodes)
      v.vx += (e - v.x) * this.centerStrength * u, v.vy += (o - v.y) * this.centerStrength * u;
  }
  // ── Collision via uniform spatial grid (O(n) average) ────────────────────
  applyCollide() {
    const u = this.nodes, e = u.length;
    if (e < 2) return;
    let o = 0;
    for (let y = 0; y < e; y++) u[y].radius > o && (o = u[y].radius);
    const v = o * 2 + 52, r = /* @__PURE__ */ new Map(), I = (y, b) => y * 73856093 ^ b * 19349663;
    for (let y = 0; y < e; y++) {
      const b = Math.floor(u[y].x / v), C = Math.floor(u[y].y / v), B = I(b, C), M = r.get(B);
      M ? M.push(y) : r.set(B, [y]);
    }
    for (let y = 0; y < e; y++) {
      const b = u[y], C = Math.floor(b.x / v), B = Math.floor(b.y / v);
      for (let M = -1; M <= 1; M++) for (let z = -1; z <= 1; z++) {
        const L = r.get(I(C + M, B + z));
        if (L)
          for (const j of L) {
            if (j <= y) continue;
            const G = u[j], D = G.x - b.x, H = G.y - b.y, h = b.radius + G.radius + 44, d = D * D + H * H;
            if (d < h * h && d > 0) {
              const _ = Math.sqrt(d), T = (h - _) / _ * 0.5, V = D * T, ee = H * T;
              b.x -= V, b.y -= ee, G.x += V, G.y += ee;
            }
          }
      }
    }
  }
  integrate() {
    const u = this.width / 2, e = this.height / 2, o = Math.max(this.width, this.height) * 2 + 1500, v = this.maxVelocity * (1 + this.alpha * 8);
    for (const r of this.nodes)
      r.fx != null ? (r.x = r.fx, r.vx = 0) : (r.vx *= this.velocityDecay, r.vx > v ? r.vx = v : r.vx < -v && (r.vx = -v), r.x += r.vx), r.fy != null ? (r.y = r.fy, r.vy = 0) : (r.vy *= this.velocityDecay, r.vy > v ? r.vy = v : r.vy < -v && (r.vy = -v), r.y += r.vy), Number.isFinite(r.x) || (r.x = u, r.vx = 0), Number.isFinite(r.y) || (r.y = e, r.vy = 0), r.x = Math.max(u - o, Math.min(u + o, r.x)), r.y = Math.max(e - o, Math.min(e + o, r.y));
  }
  // A final, spring-free separation pass: run the collision grid repeatedly to push
  // apart any residual node overlap the cooled simulation left behind. Independent of
  // alpha and with nothing pulling nodes back together, so even a dense seed/cluster
  // ends up cleanly spaced. Cheap (O(n) per iteration).
  resolveOverlaps(u = 60) {
    for (let e = 0; e < u; e++) this.applyCollide();
  }
  // Re-energize the layout to a one-off alpha that then cools to alphaTarget.
  reheat(u = 0.3) {
    this.alpha < u && (this.alpha = u), this.alphaTarget = 0;
  }
  // Hold the layout gently "warm" at a low alpha — used during a drag so only a
  // light, continuous relaxation follows the cursor instead of a full reheat that
  // shakes the whole graph. Pair with settle() on release to cool back down.
  warm(u = 0.1) {
    this.alphaTarget = u, this.alpha < u && (this.alpha = u);
  }
  // Stop holding warm and let the layout cool to rest.
  settle() {
    this.alphaTarget = 0;
  }
}
const Vo = ["transform"], Wo = { class: "gx-links" }, Ho = ["d"], Xo = { class: "gx-nodes" }, Yo = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Ko = ["r"], Go = ["fill", "stroke"], jo = ["r", "fill", "stroke", "stroke-width"], Zo = ["cx", "cy"], Qo = ["x", "y"], Jo = ["y"], qo = /* @__PURE__ */ Ce({
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
  setup(a, { expose: u, emit: e }) {
    const o = a;
    function v(p) {
      return !o.visibleIds || o.visibleIds.has(p);
    }
    function r(p) {
      return o.colors?.get(p.id) || Ee(p);
    }
    const I = e, y = E(null), b = E(null), C = E(0), B = E(0), M = E(1), z = E(!1);
    de(M, (p) => I("scale", p));
    const L = E([]), j = E([]);
    let G = null, D = null, H = 0, h = "";
    const d = /* @__PURE__ */ new Map(), _ = E(null), T = O(() => o.concepts.length > 220), V = O(() => {
      if (o.highlightIds.size) return new Set(o.highlightIds);
      if (_.value) {
        const p = /* @__PURE__ */ new Set([_.value]);
        for (const S of j.value)
          S.from === _.value && p.add(S.to), S.to === _.value && p.add(S.from);
        return p;
      }
      return null;
    });
    function ee(p) {
      if (p.node_type === "document") return 8;
      if (p.is_root) return 22;
      const S = (p.edge_count || 0) + (p.document_count || 0);
      return Math.max(11, Math.min(24, 11 + S * 2));
    }
    function q() {
      const p = b.value?.getBoundingClientRect();
      return { w: p?.width || 900, h: p?.height || 640 };
    }
    function ke() {
      return o.concepts.map((p) => p.id).join("|");
    }
    function N(p, S) {
      const w = o.concepts, Y = new Map(w.map((f) => [f.id, f])), te = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Set();
      for (const f of o.edges) {
        if (f.edge_type !== "subtopic_of" && f.edge_type !== "categorized_as" || !Y.has(f.from_node_id) || !Y.has(f.to_node_id)) continue;
        const Q = te.get(f.to_node_id) || [];
        Q.push(f.from_node_id), te.set(f.to_node_id, Q), K.add(f.from_node_id);
      }
      const be = w.filter((f) => f.is_root || !K.has(f.id)).map((f) => f.id), ve = /* @__PURE__ */ new Map(), xe = /* @__PURE__ */ new Set(), ce = (f) => {
        const Q = ve.get(f);
        if (Q !== void 0) return Q;
        if (xe.has(f)) return 1;
        xe.add(f);
        const le = te.get(f) || [];
        let me = le.length ? 0 : 1;
        for (const Le of le) me += ce(Le);
        return me = Math.max(1, me), ve.set(f, me), me;
      };
      for (const f of be) ce(f);
      const ue = 150, _e = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Set(), Ue = /* @__PURE__ */ new Set();
      let Be = 0;
      const i = (f, Q, le, me) => {
        if (Ue.has(f)) return;
        Ue.add(f), Se.add(f);
        const Le = (le + me) / 2, Ve = Q * ue, rt = Be++ * 2.399963;
        _e.set(f, { x: p + Ve * Math.cos(Le) + Math.cos(rt) * 4, y: S + Ve * Math.sin(Le) + Math.sin(rt) * 4 });
        const tt = te.get(f) || [];
        if (!tt.length) return;
        const Ft = tt.reduce((He, Xe) => He + ce(Xe), 0) || 1;
        let nt = le;
        for (const He of tt) {
          const Xe = (me - le) * (ce(He) / Ft);
          i(He, Q + 1, nt, nt + Xe), nt += Xe;
        }
      };
      if (be.length === 1)
        i(be[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const f = be.reduce((le, me) => le + ce(me), 0) || 1;
        let Q = -Math.PI / 2;
        for (const le of be) {
          const me = Math.PI * 2 * (ce(le) / f);
          i(le, 1, Q, Q + me), Q += me;
        }
      }
      const n = w.filter((f) => !Se.has(f.id));
      if (n.length) {
        let f = ue;
        for (const Q of _e.values()) {
          const le = Math.hypot(Q.x - p, Q.y - S);
          le > f && (f = le);
        }
        n.forEach((Q, le) => {
          const me = le / n.length * Math.PI * 2;
          _e.set(Q.id, { x: p + (f + ue) * Math.cos(me), y: S + (f + ue) * Math.sin(me) });
        });
      }
      return _e;
    }
    function x() {
      const { w: p, h: S } = q(), w = p / 2, Y = S / 2, te = o.concepts, K = te.length, be = N(w, Y);
      if (K < 3) return be;
      const ve = /* @__PURE__ */ new Map();
      te.forEach((i, n) => ve.set(i.id, n));
      const xe = te.map((i) => {
        const n = be.get(i.id) || { x: w, y: Y };
        return { id: i.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: ee(i) };
      }), ce = K > 250 ? 150 : 120, ue = K > 250 ? -1100 : -700, _e = o.edges.filter((i) => ve.has(i.from_node_id) && ve.has(i.to_node_id)).map((i) => ({
        source: ve.get(i.from_node_id),
        target: ve.get(i.to_node_id),
        distance: i.edge_type === "subtopic_of" ? ce * 0.8 : ce,
        strength: i.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), Se = new Po(xe, _e, p, S, ue), Ue = K > 600 ? 70 : K > 250 ? 110 : 150;
      for (let i = 0; i < Ue; i++) Se.tick();
      Se.resolveOverlaps(K > 600 ? 50 : 80);
      const Be = /* @__PURE__ */ new Map();
      for (const i of xe) Be.set(i.id, { x: i.x, y: i.y });
      return Be;
    }
    function W(p) {
      const { w: S, h: w } = q();
      if ((S < 2 || w < 2) && H < 60) {
        H++, requestAnimationFrame(() => W(p));
        return;
      }
      H = 0;
      const Y = x();
      d.clear();
      for (const [te, K] of Y) d.set(te, K);
      ye(), p && (U(), requestAnimationFrame(() => U())), z.value = !0;
    }
    function pe() {
      h = ke(), W(!0);
    }
    function ge() {
      if (!o.concepts.length) {
        L.value = [], j.value = [], z.value = !1, h = "", d.clear();
        return;
      }
      const p = ke();
      if (p === h) {
        ye();
        return;
      }
      const S = !h;
      h = p, st(() => W(S));
    }
    function ye() {
      L.value = o.concepts.filter((p) => v(p.id)).map((p) => {
        const S = d.get(p.id) || { x: 0, y: 0 };
        return { id: p.id, x: S.x, y: S.y, radius: ee(p), concept: p, isDoc: p.node_type === "document" };
      }), j.value = o.edges.filter((p) => d.has(p.from_node_id) && d.has(p.to_node_id) && v(p.from_node_id) && v(p.to_node_id)).map((p) => {
        const S = d.get(p.from_node_id), w = d.get(p.to_node_id), Y = (S.x + w.x) / 2, te = (S.y + w.y) / 2, K = w.x - S.x, be = w.y - S.y, ve = Math.hypot(K, be) || 1, xe = Math.min(28, ve * 0.12), ce = Y - be / ve * xe, ue = te + K / ve * xe;
        return {
          id: p.id,
          path: `M${S.x},${S.y} Q${ce},${ue} ${w.x},${w.y}`,
          edge_type: p.edge_type || "",
          from: p.from_node_id,
          to: p.to_node_id
        };
      });
    }
    function U() {
      if (!d.size) return;
      const { w: p, h: S } = q();
      let w = 1 / 0, Y = 1 / 0, te = -1 / 0, K = -1 / 0;
      for (const ue of o.concepts) {
        if (!v(ue.id)) continue;
        const _e = d.get(ue.id);
        if (!_e) continue;
        const Se = ee(ue);
        w = Math.min(w, _e.x - Se), Y = Math.min(Y, _e.y - Se), te = Math.max(te, _e.x + Se), K = Math.max(K, _e.y + Se);
      }
      if (!Number.isFinite(w)) return;
      const be = Math.max(64, Math.min(p, S) * 0.12);
      w -= be, Y -= be, te += be, K += be;
      const ve = Math.max(te - w, 1), xe = Math.max(K - Y, 1), ce = Math.max(0.25, Math.min(p / ve, S / xe, 1.25));
      M.value = ce, C.value = (p - ve * ce) / 2 - w * ce, B.value = (S - xe * ce) / 2 - Y * ce;
    }
    function re(p) {
      const S = d.get(p);
      if (!S) return;
      const { w, h: Y } = q(), te = Math.max(M.value, 1.1);
      M.value = te, C.value = w / 2 - S.x * te, B.value = Y / 2 - S.y * te;
    }
    let ie = !1, oe = !1, c = { x: 0, y: 0, tx: 0, ty: 0 };
    function k(p) {
      p.preventDefault();
      const S = y.value.getBoundingClientRect(), w = p.clientX - S.left, Y = p.clientY - S.top, te = p.deltaY < 0 ? 1.12 : 1 / 1.12, K = Math.max(0.1, Math.min(6, M.value * te));
      C.value = w - (w - C.value) * (K / M.value), B.value = Y - (Y - B.value) * (K / M.value), M.value = K;
    }
    function m(p) {
      p.button === 0 && (ie = !0, oe = !1, c = { x: p.clientX, y: p.clientY, tx: C.value, ty: B.value }, window.addEventListener("mousemove", A), window.addEventListener("mouseup", X));
    }
    function A(p) {
      ie && (Math.abs(p.clientX - c.x) + Math.abs(p.clientY - c.y) > 3 && (oe = !0), C.value = c.tx + (p.clientX - c.x), B.value = c.ty + (p.clientY - c.y));
    }
    function X() {
      ie && !oe && I("select", null), ie = !1, window.removeEventListener("mousemove", A), window.removeEventListener("mouseup", X);
    }
    let J = null, Z = !1, Oe = 0, Ae = 0;
    function Qe(p, S) {
      p.button === 0 && (p.stopPropagation(), d.has(S) && (J = S, Z = !1, Oe = p.clientX, Ae = p.clientY, window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", Ne)));
    }
    function Pe(p) {
      if (!J || !y.value) return;
      if (!Z) {
        const te = p.clientX - Oe, K = p.clientY - Ae;
        if (te * te + K * K < 9) return;
        Z = !0;
      }
      const S = y.value.getBoundingClientRect(), w = (p.clientX - S.left - C.value) / M.value, Y = (p.clientY - S.top - B.value) / M.value;
      Number.isFinite(w) && Number.isFinite(Y) && (d.set(J, { x: w, y: Y }), ye());
    }
    let Me = 0;
    function Ne() {
      const p = J, S = Z;
      if (J = null, window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne), S || !p) return;
      const w = Date.now();
      if (w - Me < 350) {
        Me = 0;
        return;
      }
      Me = w, I("select", o.selectedId === p ? null : p);
    }
    function Je(p) {
      const { w: S, h: w } = q(), Y = Math.max(0.1, Math.min(6, M.value * p));
      C.value = S / 2 - (S / 2 - C.value) * (Y / M.value), B.value = w / 2 - (w / 2 - B.value) * (Y / M.value), M.value = Y;
    }
    function qe(p) {
      return !!V.value && !V.value.has(p);
    }
    function De(p) {
      const S = ["gx-link"];
      p.edge_type === "subtopic_of" ? S.push("subtopic") : S.push("categorized");
      const w = V.value;
      return w && (w.has(p.from) && w.has(p.to) ? S.push("lit") : S.push("faded")), S;
    }
    function et(p) {
      return !T.value || p.concept.is_root || p.id === o.selectedId || p.id === _.value;
    }
    return de(
      () => [o.concepts, o.edges],
      () => ge(),
      { immediate: !0, deep: !1 }
    ), de(() => o.visibleIds, () => {
      h && ye();
    }), de(b, (p) => {
      p && !G && (G = new ResizeObserver(() => {
        o.concepts.length && (D && clearTimeout(D), D = setTimeout(() => {
          h && U();
        }, 120));
      }), G.observe(p)), p && o.concepts.length && !h && ge();
    }), Nt(() => {
      G?.disconnect(), D && clearTimeout(D), X(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne);
    }), u({ fit: U, focus: re, zoomBy: Je, relayout: pe }), (p, S) => (t(), s("div", {
      ref_key: "containerRef",
      ref: b,
      class: "gx-canvas"
    }, [
      (t(), s("svg", {
        ref_key: "svgRef",
        ref: y,
        class: "gx-svg",
        onWheel: k,
        onMousedown: m,
        onContextmenu: S[1] || (S[1] = Re(() => {
        }, ["prevent"]))
      }, [
        S[2] || (S[2] = l("defs", null, [
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
        S[3] || (S[3] = l("rect", {
          class: "gx-grid-bg",
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
          fill: "url(#gx-grid)"
        }, null, -1)),
        l("g", {
          transform: `translate(${C.value},${B.value}) scale(${M.value})`,
          style: $e({ opacity: z.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          l("g", Wo, [
            (t(!0), s(ne, null, fe(j.value, (w) => (t(), s("path", {
              key: w.id,
              d: w.path,
              class: we(De(w))
            }, null, 10, Ho))), 128))
          ]),
          l("g", Xo, [
            (t(!0), s(ne, null, fe(L.value, (w) => (t(), s("g", {
              key: w.id,
              transform: `translate(${w.x},${w.y})`,
              class: we(["gx-node", { dim: qe(w.id), sel: w.id === a.selectedId, hov: w.id === _.value }]),
              onMousedown: (Y) => Qe(Y, w.id),
              onMouseenter: (Y) => _.value = w.id,
              onMouseleave: S[0] || (S[0] = (Y) => _.value = null),
              onContextmenu: Re((Y) => I("node-context", { id: w.id, x: Y.clientX, y: Y.clientY }), ["prevent", "stop"]),
              onDblclick: Re((Y) => I("node-dblclick", w.id), ["stop"])
            }, [
              w.id === a.selectedId ? (t(), s("circle", {
                key: 0,
                r: w.radius + 7,
                class: "gx-halo",
                style: $e({ stroke: r(w.concept).fill })
              }, null, 12, Ko)) : R("", !0),
              w.isDoc ? (t(), s("rect", {
                key: 1,
                x: -8,
                y: -6,
                width: "16",
                height: "12",
                rx: "3",
                fill: r(w.concept).fill,
                stroke: r(w.concept).stroke,
                "stroke-width": "1.5",
                class: "gx-shape"
              }, null, 8, Go)) : (t(), s("circle", {
                key: 2,
                r: w.radius,
                fill: r(w.concept).fill,
                stroke: r(w.concept).stroke,
                "stroke-width": w.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, jo)),
              !w.isDoc && (w.concept.document_count || 0) > 0 ? (t(), s(ne, { key: 3 }, [
                l("circle", {
                  cx: w.radius * 0.72,
                  cy: -w.radius * 0.72,
                  r: "7.5",
                  class: "gx-badge-bg"
                }, null, 8, Zo),
                l("text", {
                  x: w.radius * 0.72,
                  y: -w.radius * 0.72,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  class: "gx-badge-txt"
                }, F(w.concept.document_count), 9, Qo)
              ], 64)) : R("", !0),
              et(w) ? (t(), s("text", {
                key: 4,
                y: w.isDoc ? 20 : w.radius + 15,
                "text-anchor": "middle",
                class: we(["gx-label", { root: w.concept.is_root }])
              }, F(g(jt)(w.concept.label, w.isDoc ? 26 : 24)), 11, Jo)) : R("", !0)
            ], 42, Yo))), 128))
          ])
        ], 12, Vo)
      ], 544))
    ], 512));
  }
}), el = { class: "gx-ins-id" }, tl = { class: "gx-ins-name" }, nl = { class: "gx-ins-body" }, ol = { class: "gx-ins-stats" }, ll = {
  key: 0,
  class: "gx-stat"
}, sl = {
  key: 1,
  class: "gx-stat"
}, al = {
  key: 1,
  class: "gx-rel-group"
}, il = { class: "gx-rel-title" }, cl = { class: "kc-refs" }, rl = ["onClick"], ul = { class: "kc-ref-label" }, dl = {
  key: 0,
  class: "gx-rel-group"
}, vl = { class: "gx-rel-title" }, fl = ["onClick"], pl = { class: "gx-rel-kind" }, gl = { class: "gx-rel-label" }, ml = {
  key: 1,
  class: "gx-rel-group"
}, hl = { class: "gx-rel-title" }, yl = ["onClick"], bl = { class: "gx-rel-kind" }, kl = { class: "gx-rel-label" }, xl = {
  key: 3,
  class: "gx-ins-loading"
}, wl = {
  key: 4,
  class: "gx-ins-content"
}, _l = {
  key: 0,
  class: "gx-ins-doc-t"
}, $l = ["content-type", "source"], Cl = {
  key: 0,
  class: "gx-ins-clamp-fade",
  "aria-hidden": "true"
}, Il = ["aria-expanded"], Ml = {
  key: 5,
  class: "gx-ins-empty"
}, ht = "kb10:inspect:width", Sl = 320, Rl = 860, Ol = 560, Tl = /* @__PURE__ */ Ce({
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
  setup(a, { emit: u }) {
    const e = a, o = u, v = O(() => e.colorOf?.(e.concept.id) || Ee(e.concept).fill);
    function r(c) {
      return e.colorOf?.(c) || Ee({}).fill;
    }
    const I = O(() => e.concept.node_type === "document"), y = O(() => e.edges.filter((c) => c.from_node_id === e.concept.id).map((c) => ({ id: c.id, kind: vt[c.edge_type || ""] || c.edge_type || "related", otherId: c.to_node_id, label: c.to_label || e.labelOf(c.to_node_id) }))), b = O(() => e.edges.filter((c) => c.to_node_id === e.concept.id).map((c) => ({ id: c.id, kind: vt[c.edge_type || ""] || c.edge_type || "related", otherId: c.from_node_id, label: c.from_label || e.labelOf(c.from_node_id) }))), C = O(() => y.value.length + b.value.length), B = O(() => I.value ? Zt(e.concept.id, e.edges).map((c) => ({ id: c.id, label: c.label || e.labelOf(c.id) })) : []), M = O(() => {
      if (I.value) return [e.concept.id];
      const c = [];
      for (const k of e.edges)
        k.edge_type === "categorized_as" && k.to_node_id === e.concept.id && c.push(k.from_node_id);
      return c;
    }), z = E(!1), L = E([]), j = E(""), G = O(() => L.value.find((c) => _t(c.origMime)) || null), D = O(() => j.value ? { text: j.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function H(c) {
      try {
        const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(c)}`);
        if (!k?.success || !k.node) return null;
        const m = k.node, A = String(m.content || "");
        if (!A.trim()) return null;
        const X = m.metadata || {}, J = String(X.original_mime_type || X.source_mime || ""), Z = !!wt(X);
        return {
          id: c,
          title: X.title || X.filename || X.original_filename || e.labelOf(c),
          content: A,
          contentType: m.content_type || "text/markdown",
          origMime: Z ? J : "",
          sourceUrl: `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(c)}/source`
        };
      } catch {
        return null;
      }
    }
    async function h(c) {
      try {
        const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(c)}&include_content=true&limit=200`);
        if (!k?.success) return "";
        const m = k.nodes?.find((A) => A.node_type === "summary");
        return String(m?.content || "");
      } catch {
        return "";
      }
    }
    let d = 0;
    async function _() {
      const c = ++d;
      L.value = [], j.value = "", ge.value = !1, ye.value = !1;
      const k = M.value;
      if (k.length) {
        z.value = !0;
        try {
          const m = await Promise.all(k.map(H));
          if (c !== d) return;
          if (L.value = m.filter((A) => A != null), I.value) {
            const A = await h(e.concept.id);
            if (c !== d) return;
            j.value = A;
          }
        } finally {
          c === d && (z.value = !1);
        }
      }
    }
    de(G, (c) => {
      o("original-available", c ? { contentType: c.origMime, sourceUrl: c.sourceUrl, title: c.title } : null);
    }, { immediate: !0 });
    function T(c) {
      return Math.max(Sl, Math.min(Rl, c));
    }
    function V() {
      const c = Number(localStorage.getItem(ht));
      return Number.isFinite(c) && c > 0 ? T(c) : 430;
    }
    const ee = E(V()), q = E(null), ke = E(!1);
    function N(c) {
      const k = q.value;
      if (!k) return;
      const m = k.getBoundingClientRect();
      ee.value = T(m.right - c.clientX);
    }
    function x() {
      ke.value = !1, window.removeEventListener("pointermove", N), window.removeEventListener("pointerup", x), localStorage.setItem(ht, String(Math.round(ee.value)));
    }
    function W(c) {
      c.preventDefault(), ke.value = !0, window.addEventListener("pointermove", N), window.addEventListener("pointerup", x);
    }
    const pe = E(null), ge = E(!1), ye = E(!1);
    function U() {
      const c = pe.value;
      if (!c) {
        ye.value = !1;
        return;
      }
      ye.value = c.scrollHeight - Ol > 24;
    }
    let re = null;
    function ie() {
      re?.disconnect();
      const c = pe.value;
      c && (re = new ResizeObserver(() => U()), re.observe(c), st(U));
    }
    const oe = O(() => ye.value && !ge.value);
    return de([L, z], () => {
      z.value || st(ie);
    }), de(() => e.concept.id, _, { immediate: !0 }), Ze(() => {
      re?.disconnect(), x();
    }), (c, k) => (t(), s("aside", {
      ref_key: "asideRef",
      ref: q,
      class: we(["gx-inspect", { dragging: ke.value }]),
      style: $e({ width: ee.value + "px" })
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
        style: $e({ "--accent": v.value })
      }, [
        k[4] || (k[4] = l("span", { class: "gx-ins-dot" }, null, -1)),
        l("div", el, [
          l("h3", tl, F(a.concept.label), 1),
          G.value ? (t(), se(g(bt), {
            key: 0,
            class: we(["gx-ins-orig-btn", { on: a.originalOpen }]),
            label: a.originalOpen ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (m) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : R("", !0)
        ]),
        l("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: k[1] || (k[1] = (m) => o("close"))
        }, [
          $(g(P), { icon: "tabler:x" })
        ])
      ], 4),
      l("div", nl, [
        l("div", ol, [
          a.concept.document_count ? (t(), s("div", ll, [
            $(g(P), { icon: "tabler:files" }),
            l("span", null, F(a.concept.document_count) + " linked", 1)
          ])) : R("", !0),
          C.value ? (t(), s("div", sl, [
            $(g(P), { icon: "tabler:arrows-split-2" }),
            k[5] || (k[5] = l("span", null, "relations", -1)),
            $(g(tn), { value: C.value }, null, 8, ["value"])
          ])) : R("", !0)
        ]),
        D.value ? (t(), se(g(kt), {
          key: a.concept.id,
          icon: D.value.icon,
          label: D.value.label,
          text: D.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : R("", !0),
        B.value.length ? (t(), s("section", al, [
          l("div", il, [
            $(g(P), { icon: "tabler:link" }),
            k[6] || (k[6] = ae("Filed under", -1))
          ]),
          l("div", cl, [
            (t(!0), s(ne, null, fe(B.value, (m) => (t(), s("button", {
              key: m.id,
              class: "kc-ref",
              onClick: (A) => o("select", m.id)
            }, [
              l("span", {
                class: "kc-ref-dot",
                style: $e({ background: r(m.id) })
              }, null, 4),
              l("span", ul, F(m.label), 1),
              $(g(P), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, rl))), 128))
          ])
        ])) : R("", !0),
        I.value ? R("", !0) : (t(), s(ne, { key: 2 }, [
          y.value.length ? (t(), s("section", dl, [
            l("div", vl, [
              $(g(P), { icon: "tabler:arrow-up-right" }),
              k[7] || (k[7] = ae("Relates to", -1))
            ]),
            (t(!0), s(ne, null, fe(y.value, (m) => (t(), s("button", {
              key: m.id,
              class: "gx-rel-item",
              onClick: (A) => o("select", m.otherId)
            }, [
              l("span", pl, F(m.kind), 1),
              l("span", gl, F(m.label), 1),
              $(g(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, fl))), 128))
          ])) : R("", !0),
          b.value.length ? (t(), s("section", ml, [
            l("div", hl, [
              $(g(P), { icon: "tabler:arrow-down-left" }),
              k[8] || (k[8] = ae("Referenced by", -1))
            ]),
            (t(!0), s(ne, null, fe(b.value, (m) => (t(), s("button", {
              key: m.id,
              class: "gx-rel-item",
              onClick: (A) => o("select", m.otherId)
            }, [
              l("span", bl, F(m.kind), 1),
              l("span", kl, F(m.label), 1),
              $(g(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, yl))), 128))
          ])) : R("", !0)
        ], 64)),
        z.value ? (t(), s("div", xl, [
          $(g(P), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = l("span", null, "Loading content…", -1))
        ])) : L.value.length ? (t(), s("section", wl, [
          l("div", {
            class: we(["gx-ins-clamp", { clamped: oe.value }])
          }, [
            l("div", {
              ref_key: "contentRef",
              ref: pe,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), s(ne, null, fe(L.value, (m) => (t(), s("div", {
                key: m.id,
                class: "gx-ins-doc"
              }, [
                L.value.length > 1 ? (t(), s("div", _l, F(m.title), 1)) : R("", !0),
                l("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": m.contentType,
                  source: m.content
                }, null, 8, $l)
              ]))), 128))
            ], 512),
            oe.value ? (t(), s("div", Cl)) : R("", !0)
          ], 2),
          ye.value ? (t(), s("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": ge.value,
            onClick: k[2] || (k[2] = (m) => ge.value = !ge.value)
          }, [
            $(g(P), {
              icon: ge.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ae(" " + F(ge.value ? "Show less" : "Show more"), 1)
          ], 8, Il)) : R("", !0)
        ])) : R("", !0),
        !z.value && !D.value && !L.value.length && !B.value.length && !y.value.length && !b.value.length ? (t(), s("div", Ml, [
          $(g(P), { icon: "tabler:circle-dashed" }),
          k[10] || (k[10] = l("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : R("", !0)
      ])
    ], 6));
  }
}), El = ["aria-label", "aria-expanded", "title"], Dl = { key: 0 }, Ll = {
  key: 0,
  class: "gx-legend-body"
}, Fl = { class: "gx-legend-row" }, Nl = { class: "gx-legend-row" }, Ul = /* @__PURE__ */ Ce({
  __name: "GraphLegend",
  setup(a) {
    const u = E(!1);
    return (e, o) => (t(), s("div", {
      class: we(["gx-legend", { collapsed: !u.value }])
    }, [
      l("button", {
        type: "button",
        class: "gx-legend-toggle",
        "aria-label": u.value ? "Hide legend" : "Show legend",
        "aria-expanded": u.value,
        title: u.value ? "Hide legend" : "Show legend",
        onClick: o[0] || (o[0] = (v) => u.value = !u.value)
      }, [
        $(g(P), {
          icon: u.value ? "tabler:chevron-down" : "tabler:list-details"
        }, null, 8, ["icon"]),
        u.value ? R("", !0) : (t(), s("span", Dl, "Legend"))
      ], 8, El),
      u.value ? (t(), s("div", Ll, [
        o[3] || (o[3] = l("div", { class: "gx-legend-row" }, [
          l("span", { class: "gx-legend-mark gx-legend-cluster" }),
          ae(" Color = topic cluster ")
        ], -1)),
        l("div", Fl, [
          l("span", {
            class: "gx-legend-mark",
            style: $e({ background: g(ft).root.fill })
          }, null, 4),
          o[1] || (o[1] = ae(" Root concept ", -1))
        ]),
        l("div", Nl, [
          l("span", {
            class: "gx-legend-mark doc",
            style: $e({ background: g(ft).document.fill })
          }, null, 4),
          o[2] || (o[2] = ae(" Source document ", -1))
        ]),
        o[4] || (o[4] = Ut('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : R("", !0)
    ], 2));
  }
}), Bl = { class: "gx-controls" }, zl = { class: "gx-ctrl-read" }, Al = /* @__PURE__ */ Ce({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(a, { emit: u }) {
    const e = u;
    return (o, v) => (t(), s("div", Bl, [
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: v[0] || (v[0] = (r) => e("zoom-in"))
      }, [
        $(g(P), { icon: "tabler:plus" })
      ]),
      l("div", zl, F(Math.round(a.scale * 100)) + "%", 1),
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom out",
        "aria-label": "Zoom out",
        onClick: v[1] || (v[1] = (r) => e("zoom-out"))
      }, [
        $(g(P), { icon: "tabler:minus" })
      ]),
      l("button", {
        class: "gx-ctrl fit",
        type: "button",
        title: "Fit to view",
        "aria-label": "Fit to view",
        onClick: v[2] || (v[2] = (r) => e("fit"))
      }, [
        $(g(P), { icon: "tabler:focus-centered" })
      ])
    ]));
  }
}), Pl = { class: "gx-display" }, Vl = ["title"], Wl = ["max", "value"], Hl = { class: "gx-display-lvl" }, Xl = { class: "gx-display-lvl-max" }, Yl = ["aria-checked", "title"], Kl = /* @__PURE__ */ Ce({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(a, { emit: u }) {
    const e = u;
    return (o, v) => (t(), s("div", Pl, [
      a.maxLevel > 1 ? (t(), s("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${a.level} of ${a.maxLevel} levels`
      }, [
        $(g(P), {
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
          onInput: v[0] || (v[0] = (r) => e("update:level", Number(r.target.value)))
        }, null, 40, Wl),
        l("span", Hl, [
          ae(F(a.level), 1),
          l("span", Xl, "/" + F(a.maxLevel), 1)
        ]),
        v[3] || (v[3] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Vl)) : R("", !0),
      l("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": a.conceptsOnly,
        title: a.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: v[1] || (v[1] = (r) => e("toggle-concepts"))
      }, [
        $(g(P), {
          icon: a.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        v[5] || (v[5] = l("span", { class: "gx-display-label" }, "Concepts only", -1)),
        l("span", {
          class: we(["gx-display-sw", { on: a.conceptsOnly }])
        }, [...v[4] || (v[4] = [
          l("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Yl),
      a.hiddenCount || a.focused || a.level < a.maxLevel ? (t(), s(ne, { key: 1 }, [
        v[7] || (v[7] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1)),
        l("button", {
          class: "gx-display-reset",
          title: "Show every node and clear branch isolation",
          onClick: v[2] || (v[2] = (r) => e("reset"))
        }, [
          $(g(P), {
            icon: "tabler:arrow-back-up",
            "aria-hidden": "true"
          }),
          v[6] || (v[6] = l("span", null, "Reset", -1))
        ])
      ], 64)) : R("", !0)
    ]));
  }
});
function We(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function yt(a) {
  const u = We(a) ? a : { message: String(a) }, e = u.response, o = We(e) && e.status === 401 ? "auth-expired" : "other";
  ze.handleError(o, u);
}
const Gl = { class: "kb-railtop" }, jl = { class: "kb-railtop-acts" }, Zl = {
  key: 0,
  class: "kx-main-scroll"
}, Ql = {
  key: 1,
  class: "gx-canvas-wrap"
}, Jl = { class: "gx-botleft" }, ql = {
  key: 0,
  class: "gx-focusbar"
}, es = ["title"], ts = { class: "gx-focusbar-name" }, ns = {
  key: 0,
  class: "gx-sparse"
}, os = { class: "gx-treat" }, ls = { class: "gx-treat-check" }, ss = { class: "ap-field" }, as = ["value"], is = { class: "ap-field" }, cs = { class: "gx-treat-actions" }, rs = /* @__PURE__ */ Ce({
  __name: "GraphView",
  props: {
    kbId: {},
    concepts: {},
    edges: {},
    selectedId: {},
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(a, { emit: u }) {
    const e = a, o = u, { navWidth: v, railRef: r, navDragging: I, onStart: y } = Lt(), b = E(null), C = E(1), B = /* @__PURE__ */ new Set(), M = O(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n);
      return i;
    }), z = O(() => e.selectedId && M.value.get(e.selectedId) || null), L = O(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n.label || n.id.slice(0, 8));
      return i;
    });
    function j(i) {
      return L.value.get(i) || i.slice(0, 8);
    }
    const G = O(() => Qt(e.concepts, e.edges));
    function D(i) {
      return G.value.get(i)?.fill || Ee({}).fill;
    }
    const H = O(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.edges)
        (n.edge_type === "subtopic_of" || n.edge_type === "categorized_as") && M.value.has(n.from_node_id) && M.value.has(n.to_node_id) && i.set(n.from_node_id, n.to_node_id);
      return i;
    }), h = O(() => {
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
        const Q = f.pop();
        for (const le of h.value.get(Q) || [])
          n.has(le) || (n.add(le), f.push(le));
      }
      return n;
    }
    const _ = O(() => {
      const i = /* @__PURE__ */ new Map(), n = H.value, f = (Q, le) => {
        const me = i.get(Q);
        if (me !== void 0) return me;
        const Le = n.get(Q);
        if (Le === void 0 || le.has(Q))
          return i.set(Q, 0), 0;
        le.add(Q);
        const Ve = f(Le, le) + 1;
        return i.set(Q, Ve), Ve;
      };
      for (const Q of e.concepts) f(Q.id, /* @__PURE__ */ new Set());
      return i;
    }), T = O(() => x.value ? _.value.get(x.value) ?? 0 : 0);
    function V(i) {
      return (_.value.get(i) ?? 0) - T.value;
    }
    const ee = O(() => {
      let i = 1;
      const n = re.value;
      for (const f of e.concepts) {
        if (n && !n.has(f.id)) continue;
        const Q = V(f.id);
        Q > i && (i = Q);
      }
      return i;
    }), q = E(99), ke = O(() => Math.min(q.value, ee.value)), N = E(/* @__PURE__ */ new Set()), x = E(null), W = E(!1);
    function pe(i) {
      q.value = i;
    }
    function ge(i) {
      const n = new Set(N.value);
      n.add(i), N.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function ye(i) {
      const n = new Set(N.value);
      for (const f of d(i)) n.add(f);
      N.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const U = O(() => x.value && e.concepts.find((i) => i.id === x.value) || null), re = O(() => x.value ? d(x.value) : null);
    function ie(i) {
      x.value = x.value === i ? null : i, x.value && o("select", i);
    }
    function oe(i) {
      x.value = i, o("select", i);
    }
    function c() {
      if (!x.value) return;
      const i = H.value.get(x.value);
      i && M.value.has(i) && !M.value.get(i)?.is_root ? (x.value = i, o("select", i)) : x.value = null;
    }
    const k = O(() => {
      if (!x.value) return "";
      const i = H.value.get(x.value), n = i ? M.value.get(i) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function m() {
      x.value = null;
    }
    function A() {
      N.value = /* @__PURE__ */ new Set(), x.value = null, q.value = 99, W.value = !1;
    }
    de(x, () => {
      q.value = 99;
    });
    const X = O(() => {
      const i = re.value;
      if (!i && !W.value && !N.value.size && ke.value >= ee.value) return null;
      const n = /* @__PURE__ */ new Set();
      for (const f of e.concepts)
        i && !i.has(f.id) || V(f.id) > ke.value || W.value && f.node_type === "document" || N.value.has(f.id) || n.add(f.id);
      return n;
    });
    function J(i) {
      o("select", i), b.value?.focus(i);
    }
    const Z = E({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), Oe = O(() => {
      const i = Z.value.concept;
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
      Z.value = { open: !0, x: n, y: f, concept: i };
    }
    function Qe(i) {
      const n = M.value.get(i.id);
      n && Ae(n, i.x, i.y);
    }
    function Pe(i) {
      const n = Z.value.concept;
      if (n)
        switch (i) {
          case "open":
            J(n.id);
            break;
          case "isolate":
            ie(n.id);
            break;
          case "hide":
            ge(n.id);
            break;
          case "hide-branch":
            ye(n.id);
            break;
          default:
            Ne.value = n, Me.value = i;
            break;
        }
    }
    const Me = E(""), Ne = E(null), Je = O(() => ({ add: "Add child concept", rename: "Rename concept", move: "Move concept", delete: "Delete concept" })[Me.value] || "");
    function qe(i) {
      Me.value = "", i && o("select", i), o("changed");
    }
    const De = E(!1);
    function et(i) {
      De.value = !1;
      const n = i.parent_id || i.id;
      n && e.concepts.some((f) => f.id === n) && J(n);
    }
    const p = O(() => e.selectedId ? e.edges.filter((i) => i.from_node_id === e.selectedId || i.to_node_id === e.selectedId) : []), S = E(null), w = E(null);
    de(() => e.selectedId, () => {
      S.value = null, w.value = null;
    });
    function Y() {
      if (S.value) {
        S.value = null;
        return;
      }
      w.value && (S.value = w.value);
    }
    const te = O(() => e.concepts.length > 0 && e.concepts.length < 2), K = E(null);
    function be() {
      o("changed");
    }
    const ve = E(!1), xe = E("class:fast"), ce = E(""), ue = E(!1);
    async function _e() {
      if (e.kbId)
        try {
          const { data: i } = await Ie.get(`/api/v1/knowledge/${e.kbId}`);
          if (!We(i)) return;
          const n = We(i.knowledge_base) && i.knowledge_base.config || i.config, f = We(n) ? n : {};
          ve.value = f.treatment_enabled === !0, typeof f.treatment_model == "string" && f.treatment_model && (xe.value = f.treatment_model), typeof f.treatment_prompt == "string" && (ce.value = f.treatment_prompt);
        } catch {
        }
    }
    async function Se() {
      if (!(!e.kbId || ue.value)) {
        ue.value = !0;
        try {
          await Ie.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: ve.value,
            treatment_model: xe.value,
            treatment_prompt: ce.value
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
          ue.value = !1;
        }
      }
    }
    async function Ue() {
      if (!(!e.kbId || ue.value)) {
        ue.value = !0;
        try {
          await Ie.post(`/api/v1/knowledge/${e.kbId}/treatment`, {});
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
          ue.value = !1;
        }
      }
    }
    function Be(i) {
      const n = i && (i.detail ?? (i.target && i.target.value));
      typeof n == "string" && n && (xe.value = n);
    }
    return ct(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), at("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), _e();
    }), de(() => e.kbId, () => {
      N.value = /* @__PURE__ */ new Set(), x.value = null, q.value = 99, W.value = !1, _e();
    }), (i, n) => (t(), s("div", {
      ref_key: "railRef",
      ref: r,
      class: we(["gx", { "wk-dragging": g(I) }]),
      style: $e({ "--kx-rail-width": g(v) + "px" })
    }, [
      a.concepts.length ? (t(), se(g(Ct), { key: 0 }, {
        rail: he(() => [
          l("div", Gl, [
            l("div", jl, [
              $(g(Te), {
                icon: "tabler:search",
                label: "Search",
                active: De.value,
                onClick: n[0] || (n[0] = (f) => De.value = !De.value)
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:plus",
                label: "Add content",
                active: K.value === "add",
                onClick: n[1] || (n[1] = (f) => K.value = "add")
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:wand",
                label: "Merge duplicate concepts",
                active: K.value === "treatment",
                onClick: n[2] || (n[2] = (f) => K.value = "treatment")
              }, null, 8, ["active"]),
              $(g(Te), {
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
            onSelect: J,
            onContext: n[4] || (n[4] = (f) => Ae(f.concept, f.x, f.y))
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: n[5] || (n[5] = //@ts-ignore
            (...f) => g(y) && g(y)(...f))
          }, [...n[26] || (n[26] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: he(() => [
          De.value ? (t(), s("div", Zl, [
            $(g(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: "",
              onOpen: et,
              onClose: n[6] || (n[6] = (f) => De.value = !1)
            }, null, 8, ["kb-id"])
          ])) : (t(), s("div", Ql, [
            $(qo, {
              ref_key: "canvasRef",
              ref: b,
              concepts: a.concepts,
              edges: a.edges,
              "visible-ids": X.value,
              colors: G.value,
              "selected-id": a.selectedId || null,
              "highlight-ids": g(B),
              onSelect: n[7] || (n[7] = (f) => o("select", f || "")),
              onScale: n[8] || (n[8] = (f) => C.value = f),
              onNodeContext: Qe,
              onNodeDblclick: oe
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            l("div", Jl, [
              $(Ul),
              $(Kl, {
                level: ke.value,
                "max-level": ee.value,
                "concepts-only": W.value,
                "hidden-count": N.value.size,
                focused: !!x.value,
                "onUpdate:level": pe,
                onToggleConcepts: n[9] || (n[9] = (f) => W.value = !W.value),
                onReset: A
              }, null, 8, ["level", "max-level", "concepts-only", "hidden-count", "focused"])
            ]),
            $(Al, {
              scale: C.value,
              onZoomIn: n[10] || (n[10] = (f) => b.value?.zoomBy(1.25)),
              onZoomOut: n[11] || (n[11] = (f) => b.value?.zoomBy(0.8)),
              onFit: n[12] || (n[12] = (f) => b.value?.fit())
            }, null, 8, ["scale"]),
            $(Ye, { name: "gx-ins-fade" }, {
              default: he(() => [
                U.value ? (t(), s("div", ql, [
                  l("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${k.value}`,
                    onClick: c
                  }, [
                    $(g(P), {
                      icon: "tabler:arrow-up",
                      "aria-hidden": "true"
                    })
                  ], 8, es),
                  $(g(P), {
                    class: "gx-focusbar-ic",
                    icon: "tabler:focus-2",
                    "aria-hidden": "true"
                  }),
                  l("span", ts, F(U.value.label || "concept"), 1),
                  l("button", {
                    class: "gx-focusbar-x",
                    title: "Show the whole graph",
                    onClick: m
                  }, [
                    $(g(P), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ])
                ])) : R("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: he(() => [
                z.value ? (t(), se(Tl, {
                  key: 0,
                  "kb-id": a.kbId,
                  concept: z.value,
                  edges: p.value,
                  "label-of": j,
                  "color-of": D,
                  "original-open": !!S.value,
                  onSelect: n[13] || (n[13] = (f) => J(f)),
                  onClose: n[14] || (n[14] = (f) => o("select", "")),
                  onOriginalAvailable: n[15] || (n[15] = (f) => w.value = f),
                  onToggleOriginal: Y
                }, null, 8, ["kb-id", "concept", "edges", "original-open"])) : R("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: he(() => [
                te.value ? (t(), s("div", ns, [
                  $(g(P), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = l("span", null, "Add more content to grow the graph.", -1)),
                  l("button", {
                    class: "gx-sparse-cta",
                    onClick: n[16] || (n[16] = (f) => K.value = "add")
                  }, [
                    $(g(P), {
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
        onCta: n[17] || (n[17] = (f) => K.value = "add")
      })),
      $(g(Ke), {
        open: K.value === "add",
        title: "Add content",
        icon: "tabler:plus",
        onClose: n[18] || (n[18] = (f) => K.value = null)
      }, {
        default: he(() => [
          $(St, {
            "kb-id": a.kbId,
            noun: "document",
            onChanged: be
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(g(Ke), {
        open: K.value === "treatment",
        title: "Merge duplicate concepts",
        icon: "tabler:wand",
        onClose: n[21] || (n[21] = (f) => K.value = null)
      }, {
        default: he(() => [
          l("div", os, [
            l("label", ls, [
              Fe(l("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (f) => ve.value = f)
              }, null, 512), [
                [Bt, ve.value]
              ]),
              n[29] || (n[29] = l("span", null, "Automatically merge duplicate concepts after adding content", -1))
            ]),
            l("div", ss, [
              n[30] || (n[30] = l("span", { class: "ap-label" }, "Model", -1)),
              l("wc-model-picker", {
                value: xe.value,
                capability: "generate",
                onSelect: Be
              }, null, 40, as)
            ]),
            l("div", is, [
              n[31] || (n[31] = l("span", { class: "ap-label" }, [
                ae("Prompt "),
                l("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Fe(l("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (f) => ce.value = f),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for merging duplicate concepts…"
              }, null, 512), [
                [Ge, ce.value]
              ])
            ]),
            l("div", cs, [
              $(g(je), {
                variant: "soft",
                disabled: ue.value,
                onClick: Se
              }, {
                default: he(() => [...n[32] || (n[32] = [
                  ae("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(g(je), {
                variant: "primary",
                disabled: ue.value,
                onClick: Ue
              }, {
                default: he(() => [...n[33] || (n[33] = [
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
      $(g(Ke), {
        open: !!Me.value,
        title: Je.value,
        icon: "tabler:sitemap",
        onClose: n[23] || (n[23] = (f) => Me.value = "")
      }, {
        default: he(() => [
          Me.value ? (t(), se(Rt, {
            key: 0,
            "kb-id": a.kbId,
            mode: Me.value,
            target: Ne.value,
            concepts: a.concepts,
            edges: a.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (f) => Me.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(g(xt), {
        contained: "",
        open: !!S.value,
        title: S.value?.title || z.value?.label || "",
        "content-type": S.value?.contentType || "",
        "source-url": S.value?.sourceUrl || "",
        onClose: n[24] || (n[24] = (f) => S.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"]),
      $(Tt, {
        open: Z.value.open,
        x: Z.value.x,
        y: Z.value.y,
        items: Oe.value,
        onPick: Pe,
        onClose: n[25] || (n[25] = (f) => Z.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), us = { class: "kb-page" }, ds = ["disabled"], vs = "kb10:wiki:view", fs = /* @__PURE__ */ Ce({
  __name: "KbWiki",
  setup(a) {
    const u = zt(), e = At(), o = O(() => u.value.config?.kb_id || ""), v = O(() => u.value.config?.route || "");
    let r = !1;
    function I() {
      const U = u.value.config?.view;
      return U === "graph" || U === "wiki" ? U : localStorage.getItem(vs) === "graph" ? "graph" : "wiki";
    }
    const y = E(I());
    de(() => u.value.config?.view, (U) => {
      (U === "graph" || U === "wiki") && U !== y.value && (y.value = U);
    });
    const b = E(!1), C = E(""), B = E(""), M = E([]), z = E([]), L = E(""), j = E(null), G = E(!1), D = O(() => {
      const U = j.value;
      return U ? U.error ? `Graph enrichment failed: ${U.error}` : U.agent_missing ? U.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), H = O(() => !!j.value?.error);
    async function h() {
      if (!(!o.value || G.value)) {
        G.value = !0;
        try {
          await Ie.post(`/api/v1/kb10/${o.value}/enrichment`), j.value = null;
        } catch (U) {
          ze.handleError(U?.response?.status === 401 ? "auth-expired" : "other", U);
        } finally {
          G.value = !1;
        }
      }
    }
    const d = O(() => {
      const U = /* @__PURE__ */ new Map();
      for (const re of M.value) U.set(re.id, re);
      return U;
    }), _ = O(() => $t(M.value, z.value)[0]?.concept.id || "");
    let T = 0;
    async function V(U = !1) {
      const re = o.value;
      if (!re) return;
      const ie = ++T;
      U || (b.value = !0), C.value = "";
      try {
        const { data: oe } = await Ie.get(`/api/v1/kb10/${re}/graph?include_indexing=true`);
        if (ie !== T || o.value !== re) return;
        if (oe?.success) {
          M.value = oe.nodes || [], z.value = oe.edges || [], B.value = Jt(oe.pending_source);
          const c = oe.enrichment || {};
          j.value = c.error || c.agent_missing ? c : null, L.value && !d.value.has(L.value) && (L.value = ""), L.value || (v.value && d.value.has(v.value) ? ee(v.value) : y.value === "wiki" && _.value && (r = !0, L.value = _.value, r = !1));
        } else
          C.value = oe?.error && gt(oe.error) ? pt : oe?.error || "";
      } catch (oe) {
        if (ie !== T) return;
        const c = oe?.response?.data?.error || oe?.message || "could not load the knowledge base";
        C.value = gt(c) ? pt : c, ze.handleError(oe?.response?.status === 401 ? "auth-expired" : "other", oe);
      } finally {
        ie === T && !U && (b.value = !1);
      }
    }
    function ee(U) {
      if ((U || "") !== (L.value || "")) {
        if (!U) {
          L.value = "";
          return;
        }
        d.value.has(U) && (r = !0, L.value = U, r = !1);
      }
    }
    de(L, (U) => {
      r || e("navigate", U || "");
    }), de(v, (U) => ee(U));
    let q = null;
    function ke() {
      q && clearTimeout(q), q = setTimeout(() => {
        q = null, V(!0);
      }, 400);
    }
    let N = null, x = 0;
    function W(U) {
      const re = ++x;
      if (N && (N(), N = null), !U) return;
      const ie = qt(U, () => ke());
      if (re !== x) {
        ie && ie();
        return;
      }
      N = ie;
    }
    Ze(() => {
      x++, q && clearTimeout(q), N && N();
    }), de(y, (U) => {
      U === "wiki" && !L.value && _.value && (r = !0, L.value = _.value, r = !1);
    }), de(o, (U) => {
      L.value = "", B.value = "", V(), W(U);
    }, { immediate: !0 });
    function pe(U) {
      U !== L.value && (L.value = U);
    }
    function ge() {
      o.value && e("kb-changed", { kb_id: o.value }), V(!0);
    }
    function ye() {
      V();
    }
    return (U, re) => (t(), s("div", us, [
      C.value ? (t(), se(g(lt), {
        key: 0,
        tone: "info"
      }, {
        default: he(() => [
          ae(F(C.value), 1)
        ]),
        _: 1
      })) : R("", !0),
      B.value ? (t(), se(g(lt), {
        key: 1,
        role: "status"
      }, {
        default: he(() => [
          ae(F(B.value), 1)
        ]),
        _: 1
      })) : R("", !0),
      D.value ? (t(), se(g(lt), {
        key: 2,
        tone: "warn"
      }, {
        default: he(() => [
          ae(F(D.value) + " ", 1),
          H.value ? (t(), s("button", {
            key: 0,
            type: "button",
            class: "kx-notice-action",
            disabled: G.value,
            onClick: h
          }, F(G.value ? "Retrying…" : "Retry"), 9, ds)) : R("", !0)
        ]),
        _: 1
      })) : R("", !0),
      b.value && !M.value.length ? (t(), se(g(sn), {
        key: 3,
        icon: y.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: y.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), se(Ye, {
        key: 4,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: he(() => [
          y.value === "wiki" ? (t(), se(zo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: M.value,
            edges: z.value,
            "selected-id": L.value,
            loading: b.value,
            onSelect: pe,
            onChanged: ge,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "loading"])) : (t(), se(rs, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: M.value,
            edges: z.value,
            "selected-id": L.value,
            loading: b.value,
            onSelect: pe,
            onChanged: ge,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "loading"]))
        ]),
        _: 1
      }))
    ]));
  }
}), ks = {
  rootComponent: fs
};
export {
  ks as mountConfig
};
