import { defineComponent as Ce, openBlock as t, createElementBlock as a, toDisplayString as A, createElementVNode as l, createVNode as $, unref as g, createCommentVNode as O, ref as T, computed as R, watch as de, onMounted as it, createBlock as ie, normalizeClass as xe, Fragment as te, renderList as fe, createTextVNode as ce, normalizeStyle as $e, withModifiers as Re, withDirectives as Fe, vModelText as Ke, vModelSelect as rt, withCtx as be, onBeforeUnmount as Ze, onUnmounted as Nt, nextTick as lt, createStaticVNode as At, Transition as Ye, vModelCheckbox as Bt } from "vue";
import { loadByTagName as st, api as Ie, host as Ue } from "@wippy-fe/proxy";
import { a as Ut, u as zt } from "./wc-runtime-CNDpK4lj.js";
import { q as Pt, r as Vt, t as Wt, d as bt, e as Ht, f as kt, v as Ee, w as at, x as ot, g as xt, u as wt, b as _t, _ as Te, y as ut, z as $t, A as Xt, B as Yt, C as Gt, D as Kt, j as Ct, k as It, l as Mt, o as Ge, p as St, F as jt, G as dt, H as Zt, N as vt, I as Qt, h as ft, E as pt, i as gt, s as Jt } from "./AddPanel.vue_vue_type_script_setup_true_lang-DRjgek6J.js";
import { Icon as P } from "@iconify/vue";
import { _ as je, c as qt } from "./queryMode-B1MoVAIk.js";
const en = { class: "kx-count" }, tn = /* @__PURE__ */ Ce({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(s) {
    return (u, e) => (t(), a("span", en, A(s.value), 1));
  }
}), nn = { class: "kx-loading kx-loading-centered" }, on = { class: "kx-loading-inner" }, ln = { key: 0 }, sn = /* @__PURE__ */ Ce({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(s) {
    return (u, e) => (t(), a("div", nn, [
      l("div", on, [
        $(g(P), {
          icon: s.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        s.label ? (t(), a("span", ln, A(s.label), 1)) : O("", !0)
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
}, Nn = { class: "wr-card-meta" }, An = { key: 0 }, Bn = { key: 1 }, Un = { key: 2 }, zn = {
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
}, Yn = { class: "wr-foot-links" }, Gn = ["onClick"], Kn = { class: "wr-foot-kind" }, jn = /* @__PURE__ */ Ce({
  __name: "WikiReader",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    conceptsById: {}
  },
  emits: ["navigate"],
  setup(s, { emit: u }) {
    const e = s, o = u;
    function v(c) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(c)}/source`;
    }
    const r = T(!1), I = T(""), y = T([]), b = T([]), C = T({}), N = T("rendered"), S = T(null), L = R(() => b.value.reduce((c, x) => c + x.chunks.length, 0)), U = R(() => {
      const c = /* @__PURE__ */ new Map();
      for (const x of b.value) x.summary && c.set(x.id, x.summary);
      return c;
    }), j = R(() => L.value > 0 || b.value.some((c) => c.summary));
    function K(c) {
      C.value = { ...C.value, [c]: !C.value[c] };
    }
    const D = T({}), H = R(() => y.value.length > 1);
    function h(c) {
      return !H.value || !!D.value[c];
    }
    function d(c) {
      D.value = { ...D.value, [c]: !D.value[c] };
    }
    de(y, () => {
      D.value = {};
    });
    const _ = R(() => Pt(e.concept, e.edges)), E = R(() => Vt(e.concept, e.edges, e.conceptsById)), V = R(() => Wt(e.concept, e.edges, e.conceptsById)), J = R(() => y.value.length > 0), le = R(() => {
      const c = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return j.value && c.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: L.value || void 0 }), c;
    });
    function re(c) {
      return c.metadata?.original_mime_type || c.metadata?.source_mime || "";
    }
    function B(c) {
      const x = re(c);
      return wt(c.metadata) && _t(x) ? { contentType: x, sourceUrl: v(c.id) } : x === "application/pdf" ? { contentType: "application/pdf", sourceUrl: v(c.id) } : null;
    }
    function k(c) {
      if (S.value?.id === c.id) {
        S.value = null;
        return;
      }
      const x = B(c);
      x && (S.value = { id: c.id, contentType: x.contentType, sourceUrl: x.sourceUrl, title: c.title });
    }
    const W = R(() => y.value.find((c) => B(c)) || null), me = R(() => !!W.value), pe = R(() => !!W.value && S.value?.id === W.value.id);
    function he(c) {
      const x = c.metadata || {}, m = x.filename || x.original_filename, z = x.source_url, X = x.page ?? x.page_number, q = X != null && X !== "";
      if (!m && !z && !q) return [];
      const Z = [], Oe = x.original_mime_type || x.source_mime;
      return m && Z.push({ key: "filename", label: "File", value: String(m) }), Oe && Z.push({ key: "mime", label: "Type", value: String(Oe) }), z && Z.push({ key: "source", label: "Source", value: String(z), href: String(z) }), q && Z.push({ key: "page", label: "Page", value: String(X) }), Z;
    }
    async function we(c) {
      const { data: x } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(c)}`);
      if (!x?.success || !x.node) return null;
      const m = x.node, z = m.content || "";
      if (!z.trim()) return null;
      const X = m.metadata || {}, q = X.title || X.filename || X.source_url || e.conceptsById.get(c)?.label || "Document";
      return { id: c, title: q, content: z, contentType: m.content_type || "text/markdown", metadata: X };
    }
    it(() => {
      st("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function F(c, x) {
      try {
        const { data: m } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(c)}&include_content=true&limit=200`);
        if (!m?.success) return null;
        const z = m.nodes || [], X = z.filter((Z) => Z.node_type === "chunk").sort((Z, Oe) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((Oe.metadata || {}).index ?? (Oe.metadata || {}).chunk_index ?? 0)).map((Z) => ({ id: Z.id, content: String(Z.content || ""), prefix: String((Z.metadata || {}).contextual_prefix || "") })), q = String((z.find((Z) => Z.node_type === "summary") || {}).content || "");
        return !X.length && !q ? null : { id: c, title: x, summary: q, chunks: X };
      } catch {
        return null;
      }
    }
    let oe = 0;
    async function ne() {
      const c = e.concept, x = ++oe;
      if (y.value = [], b.value = [], C.value = {}, I.value = "", N.value = "rendered", !c || !e.kbId) return;
      const m = _.value;
      if (m.length) {
        r.value = !0;
        try {
          const z = await Promise.all(m.map((q) => we(q).catch(() => null)));
          if (x !== oe) return;
          y.value = z.filter((q) => q != null), !y.value.length && m.length && (I.value = "The source for this page could not be loaded.");
          const X = await Promise.all(y.value.map((q) => F(q.id, q.title)));
          if (x !== oe) return;
          b.value = X.filter((q) => q != null);
        } catch (z) {
          if (x !== oe) return;
          I.value = z?.response?.data?.error || z?.message || "could not load this page";
        } finally {
          x === oe && (r.value = !1);
        }
      }
    }
    return de(() => [e.concept?.id, e.kbId], () => ne(), { immediate: !0 }), de(() => e.concept?.id, () => {
      S.value = null;
    }), (c, x) => s.concept ? (t(), a("article", an, [
      !s.concept.is_root || s.concept.description ? (t(), a("header", cn, [
        s.concept.is_root ? O("", !0) : (t(), a("div", rn, [
          l("h1", un, A(s.concept.label || s.concept.id), 1),
          W.value ? (t(), ie(g(bt), {
            key: 0,
            class: xe(["wr-orig-btn", { on: pe.value }]),
            label: pe.value ? "Hide original" : "View original",
            onOpen: x[0] || (x[0] = (m) => k(W.value))
          }, null, 8, ["class", "label"])) : O("", !0)
        ])),
        s.concept.description ? (t(), a("p", dn, A(s.concept.description), 1)) : O("", !0)
      ])) : O("", !0),
      r.value ? (t(), a("div", vn, [
        $(g(P), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        x[3] || (x[3] = l("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), a("div", fn, [
        $(g(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, A(I.value), 1)
      ])) : (t(), a(te, { key: 3 }, [
        J.value && (me.value || j.value) ? (t(), ie(g(Ht), {
          key: 0,
          tabs: le.value,
          active: N.value,
          onSelect: x[1] || (x[1] = (m) => N.value = m)
        }, null, 8, ["tabs", "active"])) : O("", !0),
        J.value && N.value === "rendered" ? (t(), a("div", pn, [
          (t(!0), a(te, null, fe(y.value, (m, z) => (t(), a("section", {
            key: m.id,
            class: "wr-doc-page"
          }, [
            y.value.length > 1 ? (t(), a("div", gn, [
              l("span", mn, A(m.title), 1),
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
                ce(" " + A(h(m.id) ? "Collapse" : "Read"), 1)
              ], 8, hn)
            ])) : O("", !0),
            U.value.get(m.id) ? (t(), ie(g(kt), {
              key: 1,
              text: U.value.get(m.id)
            }, null, 8, ["text"])) : O("", !0),
            h(m.id) ? (t(), a("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: m.content
            }, null, 8, yn)) : O("", !0),
            h(m.id) && he(m).length ? (t(), a("div", bn, [
              (t(!0), a(te, null, fe(he(m), (X) => (t(), a("div", {
                key: X.key,
                class: "wr-prov-row"
              }, [
                l("span", kn, A(X.label), 1),
                X.href ? (t(), a("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: X.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, A(X.value), 9, xn)) : (t(), a("span", wn, A(X.value), 1))
              ]))), 128))
            ])) : O("", !0),
            z < y.value.length - 1 ? (t(), a("hr", _n)) : O("", !0)
          ]))), 128))
        ])) : J.value && N.value === "chunks" ? (t(), a("div", $n, [
          (t(!0), a(te, null, fe(b.value, (m) => (t(), a("section", {
            key: m.id,
            class: "wr-chunks-doc"
          }, [
            b.value.length > 1 ? (t(), a("div", Cn, A(m.title), 1)) : O("", !0),
            (t(!0), a(te, null, fe(m.chunks, (z, X) => (t(), a("div", {
              key: z.id,
              class: xe(["wr-chunk", { open: C.value[z.id] }])
            }, [
              l("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!C.value[z.id],
                onClick: (q) => K(z.id)
              }, [
                l("span", Mn, A(X + 1), 1),
                l("span", Sn, "Chunk " + A(X + 1), 1),
                $(g(P), {
                  class: "wr-chunk-chev",
                  icon: C.value[z.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, In),
              z.prefix ? (t(), a("p", Rn, [
                $(g(P), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                l("span", null, A(z.prefix), 1)
              ])) : O("", !0),
              l("p", {
                class: xe(["wr-chunk-body", { clamp: !C.value[z.id] }])
              }, A(z.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : E.value.length ? (t(), a("div", On, [
          (t(!0), a(te, null, fe(E.value, (m) => (t(), a("button", {
            key: m.id,
            class: "wr-card",
            style: $e({ "--c": g(Ee)(m).fill }),
            onClick: (z) => o("navigate", m)
          }, [
            l("span", En, [
              l("span", Dn, [
                $(g(P), {
                  icon: g(at)(m),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(g(P), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            l("span", Ln, A(m.label || m.id), 1),
            m.description ? (t(), a("span", Fn, A(m.description), 1)) : O("", !0),
            l("span", Nn, [
              m.document_count ? (t(), a("span", An, A(m.document_count) + " " + A(m.document_count === 1 ? "page" : "pages"), 1)) : O("", !0),
              g(ot)(m.id, s.edges) ? (t(), a("span", Bn, A(g(ot)(m.id, s.edges)) + " subtopics", 1)) : O("", !0),
              !m.document_count && !g(ot)(m.id, s.edges) ? (t(), a("span", Un, "empty")) : O("", !0)
            ])
          ], 12, Tn))), 128))
        ])) : (t(), a("div", zn, [
          $(g(P), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          x[4] || (x[4] = l("span", null, "This page has no content yet.", -1))
        ])),
        V.value.length || J.value && E.value.length ? (t(), a("footer", Pn, [
          J.value && E.value.length ? (t(), a("div", Vn, [
            x[5] || (x[5] = l("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            l("div", Wn, [
              (t(!0), a(te, null, fe(E.value, (m) => (t(), a("button", {
                key: m.id,
                class: "wr-foot-link",
                onClick: (z) => o("navigate", m)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: g(Ee)(m).fill })
                }, null, 4),
                ce(A(m.label || m.id), 1)
              ], 8, Hn))), 128))
            ])
          ])) : O("", !0),
          V.value.length ? (t(), a("div", Xn, [
            x[6] || (x[6] = l("span", { class: "wr-foot-h" }, "Related", -1)),
            l("div", Yn, [
              (t(!0), a(te, null, fe(V.value, (m) => (t(), a("button", {
                key: m.concept.id,
                class: "wr-foot-link",
                onClick: (z) => o("navigate", m.concept)
              }, [
                l("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: g(Ee)(m.concept).fill })
                }, null, 4),
                ce(A(m.concept.label || m.concept.id) + " ", 1),
                l("span", Kn, A(m.label), 1)
              ], 8, Gn))), 128))
            ])
          ])) : O("", !0)
        ])) : O("", !0)
      ], 64)),
      $(g(xt), {
        contained: "",
        open: !!S.value,
        title: S.value?.title || s.concept?.label || "",
        "content-type": S.value?.contentType || "",
        "source-url": S.value?.sourceUrl || "",
        onClose: x[2] || (x[2] = (m) => S.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : O("", !0);
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
  setup(s, { emit: u }) {
    const e = s, o = u, v = T(""), r = T(""), I = T(""), y = T(""), b = T(!1), C = T(""), N = R(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.concepts) d.set(_.id, _);
      return d;
    }), S = R(() => {
      const d = /* @__PURE__ */ new Map();
      for (const _ of e.edges)
        (_.edge_type === "subtopic_of" || _.edge_type === "categorized_as") && N.value.has(_.from_node_id) && N.value.has(_.to_node_id) && d.set(_.from_node_id, _.to_node_id);
      return d;
    }), L = R(() => ({ add: "Add child concept", rename: "Rename", move: "Move to", delete: "Delete" })[e.mode] || ""), U = R(() => e.concepts.filter((d) => d.node_type !== "document"));
    function j(d, _) {
      let E = d;
      const V = /* @__PURE__ */ new Set();
      for (; E && !V.has(E); ) {
        if (E === _) return !0;
        V.add(E), E = S.value.get(E);
      }
      return !1;
    }
    const K = R(() => {
      const d = e.target;
      return d ? U.value.filter((_) => _.id !== d.id && !j(_.id, d.id)) : U.value;
    }), D = R(() => {
      const d = e.target;
      if (!d) return { childCount: 0, documentCount: 0, empty: !0 };
      let _ = 0, E = 0;
      for (const V of e.edges)
        V.to_node_id === d.id && (V.edge_type === "subtopic_of" && (_ += 1), V.edge_type === "categorized_as" && (E += 1));
      return { childCount: _, documentCount: E, empty: _ === 0 && E === 0 };
    }), H = R(() => {
      const d = e.target;
      return b.value ? !1 : e.mode === "add" ? v.value.trim() !== "" : !d || d.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? v.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== d.id : e.mode === "delete" ? D.value.empty || y.value !== "" : !1;
    });
    de(() => [e.mode, e.target], () => {
      const d = e.target;
      v.value = e.mode === "rename" && d?.label || "", r.value = e.mode === "rename" && d?.description || "", I.value = d && S.value.get(d.id) || "", y.value = "", C.value = "";
    }, { immediate: !0 });
    async function h() {
      const d = e.target, _ = e.kbId;
      if (!(!_ || !H.value)) {
        b.value = !0, C.value = "";
        try {
          let E = d?.id || "";
          if (e.mode === "add") {
            const { data: V } = await Ie.post(`/api/v1/kb10/${_}/concepts`, {
              label: v.value.trim(),
              description: r.value.trim(),
              parent_id: d?.id
            });
            if (!V?.success) throw new Error(V?.error || "create failed");
            E = V.node_id || E;
          } else if (e.mode === "rename" && d) {
            const { data: V } = await Ie.patch(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, {
              label: v.value.trim(),
              description: r.value.trim()
            });
            if (!V?.success) throw new Error(V?.error || "update failed");
            E = d.id;
          } else if (e.mode === "move" && d) {
            const { data: V } = await Ie.put(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}/parent`, {
              parent_id: I.value
            });
            if (!V?.success) throw new Error(V?.error || "move failed");
            E = d.id;
          } else if (e.mode === "delete" && d) {
            const V = y.value ? { reassign_to_concept_id: y.value } : {}, { data: J } = await Ie.delete(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(d.id)}`, { data: V });
            if (!J?.success) throw new Error(J?.error || "delete failed");
            E = y.value || S.value.get(d.id) || "";
          }
          o("saved", E);
        } catch (E) {
          C.value = E?.response?.data?.error || E?.message || "taxonomy update failed", Ue.handleError(E?.response?.status === 401 ? "auth-expired" : "other", E);
        } finally {
          b.value = !1;
        }
      }
    }
    return (d, _) => (t(), a("form", {
      class: "wk-tax",
      onSubmit: Re(h, ["prevent"])
    }, [
      l("div", Zn, [
        l("span", null, A(L.value), 1),
        $(g(Te), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: _[0] || (_[0] = (E) => o("close"))
        })
      ]),
      s.mode === "add" || s.mode === "rename" ? (t(), a(te, { key: 0 }, [
        Fe(l("input", {
          "onUpdate:modelValue": _[1] || (_[1] = (E) => v.value = E),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ke, v.value]
        ]),
        Fe(l("textarea", {
          "onUpdate:modelValue": _[2] || (_[2] = (E) => r.value = E),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ke, r.value]
        ])
      ], 64)) : O("", !0),
      s.mode === "move" ? Fe((t(), a("select", {
        key: 1,
        "onUpdate:modelValue": _[3] || (_[3] = (E) => I.value = E),
        class: "wk-tax-input"
      }, [
        _[6] || (_[6] = l("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), a(te, null, fe(K.value, (E) => (t(), a("option", {
          key: E.id,
          value: E.id
        }, A(E.label || E.id), 9, Qn))), 128))
      ], 512)), [
        [rt, I.value]
      ]) : O("", !0),
      s.mode === "delete" ? (t(), a("div", Jn, [
        l("div", qn, [
          l("span", null, [
            $(g(P), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            ce(A(D.value.childCount) + " subtopics", 1)
          ]),
          l("span", null, [
            $(g(P), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            ce(A(D.value.documentCount) + " pages", 1)
          ])
        ]),
        D.value.empty ? O("", !0) : Fe((t(), a("select", {
          key: 0,
          "onUpdate:modelValue": _[4] || (_[4] = (E) => y.value = E),
          class: "wk-tax-input"
        }, [
          _[7] || (_[7] = l("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), a(te, null, fe(K.value, (E) => (t(), a("option", {
            key: E.id,
            value: E.id
          }, A(E.label || E.id), 9, eo))), 128))
        ], 512)), [
          [rt, y.value]
        ])
      ])) : O("", !0),
      C.value ? (t(), a("div", to, [
        $(g(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        l("span", null, A(C.value), 1)
      ])) : O("", !0),
      l("div", no, [
        $(g(je), {
          variant: "ghost",
          small: "",
          disabled: b.value,
          onClick: _[5] || (_[5] = (E) => o("close"))
        }, {
          default: be(() => [..._[8] || (_[8] = [
            ce("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(g(je), {
          type: "submit",
          small: "",
          variant: s.mode === "delete" ? "danger" : "primary",
          loading: b.value,
          disabled: !H.value
        }, {
          default: be(() => [
            ce(A(s.mode === "delete" ? "Delete" : "Save"), 1)
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
  setup(s, { emit: u }) {
    const e = s, o = u;
    function v(D, H) {
      const h = D.currentTarget.getBoundingClientRect();
      o("context", { concept: H, x: h.right, y: h.bottom });
    }
    function r(D, H) {
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
    const L = T(""), U = R(() => I.value ? e.results : e.entries);
    function j(D) {
      const H = U.value;
      return (H.find((d) => d.concept.id === L.value) || H.find((d) => d.concept.id === e.selectedId) || H[0])?.concept.id === D ? 0 : -1;
    }
    function K(D, H) {
      if (D.target !== D.currentTarget) return;
      if (D.key === "Enter" || D.key === " ") {
        D.preventDefault(), H.isFolder ? o("enter", H.concept) : o("open", H.concept);
        return;
      }
      const h = D.currentTarget, d = Array.from(h.parentElement.querySelectorAll('[role="option"]')), _ = d.indexOf(h);
      let E;
      switch (D.key) {
        case "ArrowDown":
          E = Math.min(_ + 1, d.length - 1);
          break;
        case "ArrowUp":
          E = Math.max(_ - 1, 0);
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
    return (D, H) => (t(), a("div", oo, [
      !I.value && b.value ? (t(), a("div", lo, [
        y.value ? (t(), a("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: H[0] || (H[0] = (h) => o("up"))
        }, [
          $(g(P), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : O("", !0),
        l("span", {
          class: "wn-folder-name",
          title: C(b.value)
        }, A(C(b.value)), 9, so)
      ])) : O("", !0),
      I.value ? (t(), a("ul", ao, [
        (t(!0), a(te, null, fe(s.results, (h) => (t(), a("li", {
          key: h.concept.id,
          class: xe(["wn-item", { active: h.concept.id === s.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: j(h.concept.id),
          onFocus: (d) => L.value = h.concept.id,
          onKeydown: (d) => K(d, h),
          "aria-selected": h.concept.id === s.selectedId,
          onClick: (d) => S(h),
          onContextmenu: Re((d) => r(d, h.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: $e({ color: g(Ee)(h.concept).fill })
          }, [
            $(g(P), {
              icon: h.isFolder ? g(at)(h.concept) : g(ut)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", co, [
            l("span", ro, A(C(h.concept)), 1),
            h.path.length ? (t(), a("span", uo, [
              (t(!0), a(te, null, fe(h.path, (d, _) => (t(), a(te, {
                key: d.id
              }, [
                _ ? (t(), a("span", vo, "/")) : O("", !0),
                ce(A(d.label || d.id), 1)
              ], 64))), 128))
            ])) : O("", !0)
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
          h.isFolder ? (t(), ie(g(P), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : O("", !0)
        ], 42, io))), 128)),
        s.results.length ? O("", !0) : (t(), a("li", po, "No matches."))
      ])) : (t(), a("ul", go, [
        (t(!0), a(te, null, fe(s.entries, (h) => (t(), a("li", {
          key: h.concept.id,
          class: xe(["wn-item", { active: h.concept.id === s.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: j(h.concept.id),
          onFocus: (d) => L.value = h.concept.id,
          onKeydown: (d) => K(d, h),
          "aria-selected": h.concept.id === s.selectedId,
          onClick: (d) => N(h),
          onContextmenu: Re((d) => r(d, h.concept), ["prevent"])
        }, [
          l("span", {
            class: "wn-ico",
            style: $e({ color: g(Ee)(h.concept).fill })
          }, [
            $(g(P), {
              icon: h.isFolder ? g(at)(h.concept) : g(ut)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          l("span", ho, A(C(h.concept)), 1),
          h.isFolder ? (t(), a("span", yo, A(h.childCount), 1)) : O("", !0),
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
          h.isFolder ? (t(), ie(g(P), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : O("", !0)
        ], 42, mo))), 128)),
        s.entries.length ? O("", !0) : (t(), a("li", ko, "This level is empty."))
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
  setup(s, { emit: u }) {
    const e = s, o = u, v = R(() => $t(e.concepts, e.edges)), r = R(() => Xt(v.value)), I = T(""), y = T(""), b = R(() => r.value.byId.get(I.value)), C = R(() => I.value ? Yt(I.value, r.value.byId, r.value.parentOf) : []), N = R(() => Gt(b.value)), S = R(() => Kt(y.value, r.value.byId, r.value.parentOf));
    function L(h) {
      const d = r.value.byId.get(h);
      if (d && d.children.length) return h;
      const _ = r.value.parentOf.get(h);
      return _ || v.value[0]?.concept.id || h;
    }
    function U() {
      return v.value[0]?.concept.id || "";
    }
    function j(h) {
      const d = h ? L(h) : I.value || U();
      d && d !== I.value && (I.value = d);
    }
    function K(h) {
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
      const h = e.selectedId ? L(e.selectedId) : U();
      h && (I.value = h);
    }, { immediate: !0 }), (h, d) => (t(), a("div", wo, [
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
          [Ke, y.value]
        ]),
        y.value ? (t(), a("button", {
          key: 0,
          class: "wn-filter-x",
          "aria-label": "Clear filter",
          onClick: d[1] || (d[1] = (_) => y.value = "")
        }, [
          $(g(P), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : O("", !0)
      ]),
      l("nav", $o, [
        $(xo, {
          crumbs: C.value,
          entries: N.value,
          "selected-id": s.selectedId,
          query: y.value,
          results: S.value,
          onOpen: D,
          onEnter: K,
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
  setup(s, { emit: u }) {
    const e = s, o = u, v = R(() => {
      const b = e.items.filter((U) => !U.divider).length, C = e.items.filter((U) => U.divider).length, N = (e.title ? 30 : 0) + 10 + b * 34 + C * 9, S = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), L = Math.max(8, Math.min(e.y, window.innerHeight - N - 8));
      return { left: `${S}px`, top: `${L}px`, width: "224px" };
    });
    function r(y) {
      y.key === "Escape" && o("close");
    }
    it(() => window.addEventListener("keydown", r)), Ze(() => window.removeEventListener("keydown", r));
    function I(y) {
      y.disabled || y.divider || (o("pick", y.id), o("close"));
    }
    return (y, b) => s.open ? (t(), a("div", {
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
        s.title ? (t(), a("div", Co, A(s.title), 1)) : O("", !0),
        (t(!0), a(te, null, fe(s.items, (C, N) => (t(), a(te, {
          key: C.id + ":" + N
        }, [
          C.divider ? (t(), a("div", Io)) : (t(), a("button", {
            key: 1,
            class: xe(["kb-menu-item", { danger: C.danger, disabled: C.disabled }]),
            disabled: C.disabled,
            role: "menuitem",
            onClick: (S) => I(C)
          }, [
            C.icon ? (t(), ie(g(P), {
              key: 0,
              icon: C.icon,
              class: "kb-menu-ic",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : O("", !0),
            l("span", null, A(C.label), 1)
          ], 10, Mo))
        ], 64))), 128))
      ], 36)
    ], 32)) : O("", !0);
  }
}), Et = "kb10:wiki:navWidth", So = 220, Ro = 560;
function Dt(s) {
  return Math.max(So, Math.min(Ro, s));
}
function Oo() {
  const s = Number(localStorage.getItem(Et));
  return Number.isFinite(s) && s > 0 ? Dt(s) : 300;
}
function Lt() {
  const s = T(Oo()), u = T(null), e = T(!1);
  function o(I) {
    const y = u.value;
    if (!y) return;
    const b = y.getBoundingClientRect();
    s.value = Dt(I.clientX - b.left);
  }
  function v() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", v), localStorage.setItem(Et, String(Math.round(s.value)));
  }
  function r(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", v);
  }
  return Ze(v), { navWidth: s, railRef: u, navDragging: e, onStart: r };
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
}, Ao = ["onClick"], Bo = {
  key: 1,
  class: "wk-tools"
}, Uo = /* @__PURE__ */ Ce({
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
  setup(s, { emit: u }) {
    const e = s, o = u, { navWidth: v, railRef: r, navDragging: I, onStart: y } = Lt(), b = R(() => {
      const B = /* @__PURE__ */ new Map();
      for (const k of e.concepts) B.set(k.id, k);
      return B;
    }), C = R(() => e.selectedId && b.value.get(e.selectedId) || null), N = R(() => !!C.value && C.value.node_type !== "document"), S = R(() => {
      const B = /* @__PURE__ */ new Map();
      for (const k of e.edges)
        (k.edge_type === "subtopic_of" || k.edge_type === "categorized_as") && b.value.has(k.from_node_id) && b.value.has(k.to_node_id) && B.set(k.from_node_id, k.to_node_id);
      return B;
    }), L = R(() => {
      const B = [];
      let k = e.selectedId;
      const W = /* @__PURE__ */ new Set();
      for (; k && !W.has(k); ) {
        W.add(k);
        const me = b.value.get(k);
        if (!me) break;
        B.unshift(me), k = S.value.get(k);
      }
      return B.slice(0, -1).filter((me) => !me.is_root);
    }), U = T({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), j = R(() => {
      const B = U.value.concept;
      return B ? B.node_type === "document" ? [{ id: "open", label: "Open", icon: "tabler:arrow-right" }] : [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!B.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!B.is_root }
      ] : [];
    });
    function K(B) {
      U.value = { open: !0, x: B.x, y: B.y, concept: B.concept };
    }
    const D = T(null);
    function H() {
      if (!C.value) return;
      const k = D.value?.$el?.getBoundingClientRect();
      U.value = { open: !0, x: k ? k.right : 0, y: k ? k.bottom : 0, concept: C.value };
    }
    const h = T(""), d = T(null);
    function _(B) {
      const k = U.value.concept;
      if (k) {
        if (B === "open") {
          o("select", k.id);
          return;
        }
        d.value = k, h.value = B;
      }
    }
    function E(B) {
      h.value = "", B && o("select", B), o("changed");
    }
    const V = T(!1);
    function J(B) {
      const k = b.value.get(B.id) || (B.parent_id ? b.value.get(B.parent_id) : null);
      k && o("select", k.id), V.value = !1;
    }
    const le = T("");
    function re() {
      le.value = "", o("changed");
    }
    return (B, k) => (t(), a("div", {
      ref_key: "railRef",
      ref: r,
      class: xe(["wk", { "wk-dragging": g(I) }]),
      style: $e({ "--kx-rail-width": g(v) + "px" })
    }, [
      s.concepts.length ? (t(), ie(g(Ct), { key: 0 }, {
        rail: be(() => [
          l("div", To, [
            l("div", Eo, [
              $(g(Te), {
                icon: "tabler:search",
                label: "Search",
                active: V.value,
                onClick: k[0] || (k[0] = (W) => V.value = !V.value)
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: k[1] || (k[1] = (W) => le.value = "add")
              }),
              $(g(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: s.loading,
                spin: s.loading,
                onClick: k[2] || (k[2] = (W) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: s.concepts,
            edges: s.edges,
            "selected-id": s.selectedId,
            onSelect: k[3] || (k[3] = (W) => o("select", W)),
            onContext: K
          }, null, 8, ["concepts", "edges", "selected-id"]),
          l("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: k[4] || (k[4] = //@ts-ignore
            (...W) => g(y) && g(y)(...W))
          }, [...k[11] || (k[11] = [
            l("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: be(() => [
          V.value ? (t(), a("div", Do, [
            $(g(It), {
              "kb-id": s.kbId,
              layout: "panel",
              ask: s.canAnswer,
              placeholder: "Search this wiki…",
              onOpen: J,
              onClose: k[5] || (k[5] = (W) => V.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), a("div", Lo, [
            L.value.length || N.value ? (t(), a("div", Fo, [
              L.value.length ? (t(), a("nav", No, [
                (t(!0), a(te, null, fe(L.value, (W, me) => (t(), a(te, {
                  key: W.id
                }, [
                  me ? (t(), ie(g(P), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : O("", !0),
                  l("button", {
                    class: "wk-crumb",
                    onClick: (pe) => o("select", W.id)
                  }, A(W.label || W.id), 9, Ao)
                ], 64))), 128))
              ])) : O("", !0),
              N.value ? (t(), a("div", Bo, [
                $(g(Te), {
                  ref_key: "structBtnRef",
                  ref: D,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!h.value,
                  onClick: H
                }, null, 8, ["active"])
              ])) : O("", !0)
            ])) : O("", !0),
            h.value ? (t(), ie(Rt, {
              key: 1,
              "kb-id": s.kbId,
              mode: h.value,
              target: d.value,
              concepts: s.concepts,
              edges: s.edges,
              onSaved: E,
              onClose: k[6] || (k[6] = (W) => h.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : O("", !0),
            $(jn, {
              "kb-id": s.kbId,
              concept: C.value,
              edges: s.edges,
              "concepts-by-id": b.value,
              onNavigate: k[7] || (k[7] = (W) => o("select", W.id))
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
        onCta: k[8] || (k[8] = (W) => le.value = "add")
      })),
      $(g(Ge), {
        open: le.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: k[9] || (k[9] = (W) => le.value = "")
      }, {
        default: be(() => [
          $(St, {
            "kb-id": s.kbId,
            noun: "page",
            onChanged: re
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(Tt, {
        open: U.value.open,
        x: U.value.x,
        y: U.value.y,
        items: j.value,
        onPick: _,
        onClose: k[10] || (k[10] = (W) => U.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), zo = 0.81, mt = 144;
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
    for (let S = 0; S < o; S++) {
      const L = e[S];
      L.x < v && (v = L.x), L.x > I && (I = L.x), L.y < r && (r = L.y), L.y > y && (y = L.y);
    }
    const b = Math.max(I - v, y - r, 1) + 1, C = { x0: v, y0: r, x1: v + b, y1: r + b, mass: 0, cx: 0, cy: 0, node: null, kids: null };
    for (let S = 0; S < o; S++) this.insert(C, e[S]);
    this.computeMass(C);
    const N = this.charge * u;
    for (let S = 0; S < o; S++) this.repel(e[S], C, N);
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
    if (!e.kids || y * y / I < zo) {
      const b = I < mt ? mt : I, C = Math.sqrt(I), N = o * e.mass / b;
      u.vx -= v / C * N, u.vy -= r / C * N;
      return;
    }
    for (const b of e.kids) b && this.repel(u, b, o);
  }
  applyLinks(u) {
    for (const e of this.links) {
      const o = this.nodes[e.source], v = this.nodes[e.target];
      if (!o || !v) continue;
      const r = v.x - o.x, I = v.y - o.y, y = Math.sqrt(r * r + I * I) || 1e-6, b = (y - e.distance) / y * u * e.strength, C = r * b, N = I * b;
      o.vx += C * 0.5, o.vy += N * 0.5, v.vx -= C * 0.5, v.vy -= N * 0.5;
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
      const b = Math.floor(u[y].x / v), C = Math.floor(u[y].y / v), N = I(b, C), S = r.get(N);
      S ? S.push(y) : r.set(N, [y]);
    }
    for (let y = 0; y < e; y++) {
      const b = u[y], C = Math.floor(b.x / v), N = Math.floor(b.y / v);
      for (let S = -1; S <= 1; S++) for (let L = -1; L <= 1; L++) {
        const U = r.get(I(C + S, N + L));
        if (U)
          for (const j of U) {
            if (j <= y) continue;
            const K = u[j], D = K.x - b.x, H = K.y - b.y, h = b.radius + K.radius + 44, d = D * D + H * H;
            if (d < h * h && d > 0) {
              const _ = Math.sqrt(d), E = (h - _) / _ * 0.5, V = D * E, J = H * E;
              b.x -= V, b.y -= J, K.x += V, K.y += J;
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
const Vo = ["transform"], Wo = { class: "gx-links" }, Ho = ["d"], Xo = { class: "gx-nodes" }, Yo = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Go = ["r"], Ko = ["fill", "stroke"], jo = ["r", "fill", "stroke", "stroke-width"], Zo = ["cx", "cy"], Qo = ["x", "y"], Jo = ["y"], qo = /* @__PURE__ */ Ce({
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
  setup(s, { expose: u, emit: e }) {
    const o = s;
    function v(p) {
      return !o.visibleIds || o.visibleIds.has(p);
    }
    function r(p) {
      return o.colors?.get(p.id) || Ee(p);
    }
    const I = e, y = T(null), b = T(null), C = T(0), N = T(0), S = T(1), L = T(!1);
    de(S, (p) => I("scale", p));
    const U = T([]), j = T([]);
    let K = null, D = null, H = 0, h = "";
    const d = /* @__PURE__ */ new Map(), _ = T(null), E = R(() => o.concepts.length > 220), V = R(() => {
      if (o.highlightIds.size) return new Set(o.highlightIds);
      if (_.value) {
        const p = /* @__PURE__ */ new Set([_.value]);
        for (const M of j.value)
          M.from === _.value && p.add(M.to), M.to === _.value && p.add(M.from);
        return p;
      }
      return null;
    });
    function J(p) {
      if (p.node_type === "document") return 8;
      if (p.is_root) return 22;
      const M = (p.edge_count || 0) + (p.document_count || 0);
      return Math.max(11, Math.min(24, 11 + M * 2));
    }
    function le() {
      const p = b.value?.getBoundingClientRect();
      return { w: p?.width || 900, h: p?.height || 640 };
    }
    function re() {
      return o.concepts.map((p) => p.id).join("|");
    }
    function B(p, M) {
      const w = o.concepts, Y = new Map(w.map((f) => [f.id, f])), ee = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
      for (const f of o.edges) {
        if (f.edge_type !== "subtopic_of" && f.edge_type !== "categorized_as" || !Y.has(f.from_node_id) || !Y.has(f.to_node_id)) continue;
        const Q = ee.get(f.to_node_id) || [];
        Q.push(f.from_node_id), ee.set(f.to_node_id, Q), G.add(f.from_node_id);
      }
      const ye = w.filter((f) => f.is_root || !G.has(f.id)).map((f) => f.id), ve = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Set(), ae = (f) => {
        const Q = ve.get(f);
        if (Q !== void 0) return Q;
        if (ke.has(f)) return 1;
        ke.add(f);
        const se = ee.get(f) || [];
        let ge = se.length ? 0 : 1;
        for (const Le of se) ge += ae(Le);
        return ge = Math.max(1, ge), ve.set(f, ge), ge;
      };
      for (const f of ye) ae(f);
      const ue = 150, _e = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Set(), Ae = /* @__PURE__ */ new Set();
      let Be = 0;
      const i = (f, Q, se, ge) => {
        if (Ae.has(f)) return;
        Ae.add(f), Se.add(f);
        const Le = (se + ge) / 2, Ve = Q * ue, ct = Be++ * 2.399963;
        _e.set(f, { x: p + Ve * Math.cos(Le) + Math.cos(ct) * 4, y: M + Ve * Math.sin(Le) + Math.sin(ct) * 4 });
        const tt = ee.get(f) || [];
        if (!tt.length) return;
        const Ft = tt.reduce((He, Xe) => He + ae(Xe), 0) || 1;
        let nt = se;
        for (const He of tt) {
          const Xe = (ge - se) * (ae(He) / Ft);
          i(He, Q + 1, nt, nt + Xe), nt += Xe;
        }
      };
      if (ye.length === 1)
        i(ye[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const f = ye.reduce((se, ge) => se + ae(ge), 0) || 1;
        let Q = -Math.PI / 2;
        for (const se of ye) {
          const ge = Math.PI * 2 * (ae(se) / f);
          i(se, 1, Q, Q + ge), Q += ge;
        }
      }
      const n = w.filter((f) => !Se.has(f.id));
      if (n.length) {
        let f = ue;
        for (const Q of _e.values()) {
          const se = Math.hypot(Q.x - p, Q.y - M);
          se > f && (f = se);
        }
        n.forEach((Q, se) => {
          const ge = se / n.length * Math.PI * 2;
          _e.set(Q.id, { x: p + (f + ue) * Math.cos(ge), y: M + (f + ue) * Math.sin(ge) });
        });
      }
      return _e;
    }
    function k() {
      const { w: p, h: M } = le(), w = p / 2, Y = M / 2, ee = o.concepts, G = ee.length, ye = B(w, Y);
      if (G < 3) return ye;
      const ve = /* @__PURE__ */ new Map();
      ee.forEach((i, n) => ve.set(i.id, n));
      const ke = ee.map((i) => {
        const n = ye.get(i.id) || { x: w, y: Y };
        return { id: i.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: J(i) };
      }), ae = G > 250 ? 150 : 120, ue = G > 250 ? -1100 : -700, _e = o.edges.filter((i) => ve.has(i.from_node_id) && ve.has(i.to_node_id)).map((i) => ({
        source: ve.get(i.from_node_id),
        target: ve.get(i.to_node_id),
        distance: i.edge_type === "subtopic_of" ? ae * 0.8 : ae,
        strength: i.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), Se = new Po(ke, _e, p, M, ue), Ae = G > 600 ? 70 : G > 250 ? 110 : 150;
      for (let i = 0; i < Ae; i++) Se.tick();
      Se.resolveOverlaps(G > 600 ? 50 : 80);
      const Be = /* @__PURE__ */ new Map();
      for (const i of ke) Be.set(i.id, { x: i.x, y: i.y });
      return Be;
    }
    function W(p) {
      const { w: M, h: w } = le();
      if ((M < 2 || w < 2) && H < 60) {
        H++, requestAnimationFrame(() => W(p));
        return;
      }
      H = 0;
      const Y = k();
      d.clear();
      for (const [ee, G] of Y) d.set(ee, G);
      he(), p && (we(), requestAnimationFrame(() => we())), L.value = !0;
    }
    function me() {
      h = re(), W(!0);
    }
    function pe() {
      if (!o.concepts.length) {
        U.value = [], j.value = [], L.value = !1, h = "", d.clear();
        return;
      }
      const p = re();
      if (p === h) {
        he();
        return;
      }
      const M = !h;
      h = p, lt(() => W(M));
    }
    function he() {
      U.value = o.concepts.filter((p) => v(p.id)).map((p) => {
        const M = d.get(p.id) || { x: 0, y: 0 };
        return { id: p.id, x: M.x, y: M.y, radius: J(p), concept: p, isDoc: p.node_type === "document" };
      }), j.value = o.edges.filter((p) => d.has(p.from_node_id) && d.has(p.to_node_id) && v(p.from_node_id) && v(p.to_node_id)).map((p) => {
        const M = d.get(p.from_node_id), w = d.get(p.to_node_id), Y = (M.x + w.x) / 2, ee = (M.y + w.y) / 2, G = w.x - M.x, ye = w.y - M.y, ve = Math.hypot(G, ye) || 1, ke = Math.min(28, ve * 0.12), ae = Y - ye / ve * ke, ue = ee + G / ve * ke;
        return {
          id: p.id,
          path: `M${M.x},${M.y} Q${ae},${ue} ${w.x},${w.y}`,
          edge_type: p.edge_type || "",
          from: p.from_node_id,
          to: p.to_node_id
        };
      });
    }
    function we() {
      if (!d.size) return;
      const { w: p, h: M } = le();
      let w = 1 / 0, Y = 1 / 0, ee = -1 / 0, G = -1 / 0;
      for (const ue of o.concepts) {
        if (!v(ue.id)) continue;
        const _e = d.get(ue.id);
        if (!_e) continue;
        const Se = J(ue);
        w = Math.min(w, _e.x - Se), Y = Math.min(Y, _e.y - Se), ee = Math.max(ee, _e.x + Se), G = Math.max(G, _e.y + Se);
      }
      if (!Number.isFinite(w)) return;
      const ye = Math.max(64, Math.min(p, M) * 0.12);
      w -= ye, Y -= ye, ee += ye, G += ye;
      const ve = Math.max(ee - w, 1), ke = Math.max(G - Y, 1), ae = Math.max(0.25, Math.min(p / ve, M / ke, 1.25));
      S.value = ae, C.value = (p - ve * ae) / 2 - w * ae, N.value = (M - ke * ae) / 2 - Y * ae;
    }
    function F(p) {
      const M = d.get(p);
      if (!M) return;
      const { w, h: Y } = le(), ee = Math.max(S.value, 1.1);
      S.value = ee, C.value = w / 2 - M.x * ee, N.value = Y / 2 - M.y * ee;
    }
    let oe = !1, ne = !1, c = { x: 0, y: 0, tx: 0, ty: 0 };
    function x(p) {
      p.preventDefault();
      const M = y.value.getBoundingClientRect(), w = p.clientX - M.left, Y = p.clientY - M.top, ee = p.deltaY < 0 ? 1.12 : 1 / 1.12, G = Math.max(0.1, Math.min(6, S.value * ee));
      C.value = w - (w - C.value) * (G / S.value), N.value = Y - (Y - N.value) * (G / S.value), S.value = G;
    }
    function m(p) {
      p.button === 0 && (oe = !0, ne = !1, c = { x: p.clientX, y: p.clientY, tx: C.value, ty: N.value }, window.addEventListener("mousemove", z), window.addEventListener("mouseup", X));
    }
    function z(p) {
      oe && (Math.abs(p.clientX - c.x) + Math.abs(p.clientY - c.y) > 3 && (ne = !0), C.value = c.tx + (p.clientX - c.x), N.value = c.ty + (p.clientY - c.y));
    }
    function X() {
      oe && !ne && I("select", null), oe = !1, window.removeEventListener("mousemove", z), window.removeEventListener("mouseup", X);
    }
    let q = null, Z = !1, Oe = 0, ze = 0;
    function Qe(p, M) {
      p.button === 0 && (p.stopPropagation(), d.has(M) && (q = M, Z = !1, Oe = p.clientX, ze = p.clientY, window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", Ne)));
    }
    function Pe(p) {
      if (!q || !y.value) return;
      if (!Z) {
        const ee = p.clientX - Oe, G = p.clientY - ze;
        if (ee * ee + G * G < 9) return;
        Z = !0;
      }
      const M = y.value.getBoundingClientRect(), w = (p.clientX - M.left - C.value) / S.value, Y = (p.clientY - M.top - N.value) / S.value;
      Number.isFinite(w) && Number.isFinite(Y) && (d.set(q, { x: w, y: Y }), he());
    }
    let Me = 0;
    function Ne() {
      const p = q, M = Z;
      if (q = null, window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne), M || !p) return;
      const w = Date.now();
      if (w - Me < 350) {
        Me = 0;
        return;
      }
      Me = w, I("select", o.selectedId === p ? null : p);
    }
    function Je(p) {
      const { w: M, h: w } = le(), Y = Math.max(0.1, Math.min(6, S.value * p));
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
      return !E.value || p.concept.is_root || p.id === o.selectedId || p.id === _.value;
    }
    return de(
      () => [o.concepts, o.edges],
      () => pe(),
      { immediate: !0, deep: !1 }
    ), de(() => o.visibleIds, () => {
      h && he();
    }), de(b, (p) => {
      p && !K && (K = new ResizeObserver(() => {
        o.concepts.length && (D && clearTimeout(D), D = setTimeout(() => {
          h && we();
        }, 120));
      }), K.observe(p)), p && o.concepts.length && !h && pe();
    }), Nt(() => {
      K?.disconnect(), D && clearTimeout(D), X(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Ne);
    }), u({ fit: we, focus: F, zoomBy: Je, relayout: me }), (p, M) => (t(), a("div", {
      ref_key: "containerRef",
      ref: b,
      class: "gx-canvas"
    }, [
      (t(), a("svg", {
        ref_key: "svgRef",
        ref: y,
        class: "gx-svg",
        onWheel: x,
        onMousedown: m,
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
          transform: `translate(${C.value},${N.value}) scale(${S.value})`,
          style: $e({ opacity: L.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          l("g", Wo, [
            (t(!0), a(te, null, fe(j.value, (w) => (t(), a("path", {
              key: w.id,
              d: w.path,
              class: xe(De(w))
            }, null, 10, Ho))), 128))
          ]),
          l("g", Xo, [
            (t(!0), a(te, null, fe(U.value, (w) => (t(), a("g", {
              key: w.id,
              transform: `translate(${w.x},${w.y})`,
              class: xe(["gx-node", { dim: qe(w.id), sel: w.id === s.selectedId, hov: w.id === _.value }]),
              onMousedown: (Y) => Qe(Y, w.id),
              onMouseenter: (Y) => _.value = w.id,
              onMouseleave: M[0] || (M[0] = (Y) => _.value = null),
              onContextmenu: Re((Y) => I("node-context", { id: w.id, x: Y.clientX, y: Y.clientY }), ["prevent", "stop"]),
              onDblclick: Re((Y) => I("node-dblclick", w.id), ["stop"])
            }, [
              w.id === s.selectedId ? (t(), a("circle", {
                key: 0,
                r: w.radius + 7,
                class: "gx-halo",
                style: $e({ stroke: r(w.concept).fill })
              }, null, 12, Go)) : O("", !0),
              w.isDoc ? (t(), a("rect", {
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
              }, null, 8, Ko)) : (t(), a("circle", {
                key: 2,
                r: w.radius,
                fill: r(w.concept).fill,
                stroke: r(w.concept).stroke,
                "stroke-width": w.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, jo)),
              !w.isDoc && (w.concept.document_count || 0) > 0 ? (t(), a(te, { key: 3 }, [
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
                }, A(w.concept.document_count), 9, Qo)
              ], 64)) : O("", !0),
              et(w) ? (t(), a("text", {
                key: 4,
                y: w.isDoc ? 20 : w.radius + 15,
                "text-anchor": "middle",
                class: xe(["gx-label", { root: w.concept.is_root }])
              }, A(g(jt)(w.concept.label, w.isDoc ? 26 : 24)), 11, Jo)) : O("", !0)
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
  setup(s, { emit: u }) {
    const e = s, o = u, v = R(() => e.colorOf?.(e.concept.id) || Ee(e.concept).fill);
    function r(c) {
      return e.colorOf?.(c) || Ee({}).fill;
    }
    const I = R(() => e.concept.node_type === "document"), y = R(() => e.edges.filter((c) => c.from_node_id === e.concept.id).map((c) => ({ id: c.id, kind: dt[c.edge_type || ""] || c.edge_type || "related", otherId: c.to_node_id, label: c.to_label || e.labelOf(c.to_node_id) }))), b = R(() => e.edges.filter((c) => c.to_node_id === e.concept.id).map((c) => ({ id: c.id, kind: dt[c.edge_type || ""] || c.edge_type || "related", otherId: c.from_node_id, label: c.from_label || e.labelOf(c.from_node_id) }))), C = R(() => y.value.length + b.value.length), N = R(() => I.value ? Zt(e.concept.id, e.edges).map((c) => ({ id: c.id, label: c.label || e.labelOf(c.id) })) : []), S = R(() => {
      if (I.value) return [e.concept.id];
      const c = [];
      for (const x of e.edges)
        x.edge_type === "categorized_as" && x.to_node_id === e.concept.id && c.push(x.from_node_id);
      return c;
    }), L = T(!1), U = T([]), j = T(""), K = R(() => U.value.find((c) => _t(c.origMime)) || null), D = R(() => j.value ? { text: j.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function H(c) {
      try {
        const { data: x } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(c)}`);
        if (!x?.success || !x.node) return null;
        const m = x.node, z = String(m.content || "");
        if (!z.trim()) return null;
        const X = m.metadata || {}, q = String(X.original_mime_type || X.source_mime || ""), Z = !!wt(X);
        return {
          id: c,
          title: X.title || X.filename || X.original_filename || e.labelOf(c),
          content: z,
          contentType: m.content_type || "text/markdown",
          origMime: Z ? q : "",
          sourceUrl: `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(c)}/source`
        };
      } catch {
        return null;
      }
    }
    async function h(c) {
      try {
        const { data: x } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(c)}&include_content=true&limit=200`);
        if (!x?.success) return "";
        const m = x.nodes?.find((z) => z.node_type === "summary");
        return String(m?.content || "");
      } catch {
        return "";
      }
    }
    let d = 0;
    async function _() {
      const c = ++d;
      U.value = [], j.value = "", pe.value = !1, he.value = !1;
      const x = S.value;
      if (x.length) {
        L.value = !0;
        try {
          const m = await Promise.all(x.map(H));
          if (c !== d) return;
          if (U.value = m.filter((z) => z != null), I.value) {
            const z = await h(e.concept.id);
            if (c !== d) return;
            j.value = z;
          }
        } finally {
          c === d && (L.value = !1);
        }
      }
    }
    de(K, (c) => {
      o("original-available", c ? { contentType: c.origMime, sourceUrl: c.sourceUrl, title: c.title } : null);
    }, { immediate: !0 });
    function E(c) {
      return Math.max(Sl, Math.min(Rl, c));
    }
    function V() {
      const c = Number(localStorage.getItem(ht));
      return Number.isFinite(c) && c > 0 ? E(c) : 430;
    }
    const J = T(V()), le = T(null), re = T(!1);
    function B(c) {
      const x = le.value;
      if (!x) return;
      const m = x.getBoundingClientRect();
      J.value = E(m.right - c.clientX);
    }
    function k() {
      re.value = !1, window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", k), localStorage.setItem(ht, String(Math.round(J.value)));
    }
    function W(c) {
      c.preventDefault(), re.value = !0, window.addEventListener("pointermove", B), window.addEventListener("pointerup", k);
    }
    const me = T(null), pe = T(!1), he = T(!1);
    function we() {
      const c = me.value;
      if (!c) {
        he.value = !1;
        return;
      }
      he.value = c.scrollHeight - Ol > 24;
    }
    let F = null;
    function oe() {
      F?.disconnect();
      const c = me.value;
      c && (F = new ResizeObserver(() => we()), F.observe(c), lt(we));
    }
    const ne = R(() => he.value && !pe.value);
    return de([U, L], () => {
      L.value || lt(oe);
    }), de(() => e.concept.id, _, { immediate: !0 }), Ze(() => {
      F?.disconnect(), k();
    }), (c, x) => (t(), a("aside", {
      ref_key: "asideRef",
      ref: le,
      class: xe(["gx-inspect", { dragging: re.value }]),
      style: $e({ width: J.value + "px" })
    }, [
      l("div", {
        class: "gx-ins-resizer",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize inspector",
        onPointerdown: W
      }, [...x[3] || (x[3] = [
        l("span", { class: "gx-ins-resizer-grip" }, null, -1)
      ])], 32),
      l("header", {
        class: "gx-ins-h",
        style: $e({ "--accent": v.value })
      }, [
        x[4] || (x[4] = l("span", { class: "gx-ins-dot" }, null, -1)),
        l("div", el, [
          l("h3", tl, A(s.concept.label), 1),
          K.value ? (t(), ie(g(bt), {
            key: 0,
            class: xe(["gx-ins-orig-btn", { on: s.originalOpen }]),
            label: s.originalOpen ? "Hide original" : "View original",
            onOpen: x[0] || (x[0] = (m) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : O("", !0)
        ]),
        l("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: x[1] || (x[1] = (m) => o("close"))
        }, [
          $(g(P), { icon: "tabler:x" })
        ])
      ], 4),
      l("div", nl, [
        l("div", ol, [
          s.concept.document_count ? (t(), a("div", ll, [
            $(g(P), { icon: "tabler:files" }),
            l("span", null, A(s.concept.document_count) + " linked", 1)
          ])) : O("", !0),
          C.value ? (t(), a("div", sl, [
            $(g(P), { icon: "tabler:arrows-split-2" }),
            x[5] || (x[5] = l("span", null, "relations", -1)),
            $(g(tn), { value: C.value }, null, 8, ["value"])
          ])) : O("", !0)
        ]),
        D.value ? (t(), ie(g(kt), {
          key: s.concept.id,
          icon: D.value.icon,
          label: D.value.label,
          text: D.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : O("", !0),
        N.value.length ? (t(), a("section", al, [
          l("div", il, [
            $(g(P), { icon: "tabler:link" }),
            x[6] || (x[6] = ce("Filed under", -1))
          ]),
          l("div", cl, [
            (t(!0), a(te, null, fe(N.value, (m) => (t(), a("button", {
              key: m.id,
              class: "kc-ref",
              onClick: (z) => o("select", m.id)
            }, [
              l("span", {
                class: "kc-ref-dot",
                style: $e({ background: r(m.id) })
              }, null, 4),
              l("span", ul, A(m.label), 1),
              $(g(P), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, rl))), 128))
          ])
        ])) : O("", !0),
        I.value ? O("", !0) : (t(), a(te, { key: 2 }, [
          y.value.length ? (t(), a("section", dl, [
            l("div", vl, [
              $(g(P), { icon: "tabler:arrow-up-right" }),
              x[7] || (x[7] = ce("Relates to", -1))
            ]),
            (t(!0), a(te, null, fe(y.value, (m) => (t(), a("button", {
              key: m.id,
              class: "gx-rel-item",
              onClick: (z) => o("select", m.otherId)
            }, [
              l("span", pl, A(m.kind), 1),
              l("span", gl, A(m.label), 1),
              $(g(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, fl))), 128))
          ])) : O("", !0),
          b.value.length ? (t(), a("section", ml, [
            l("div", hl, [
              $(g(P), { icon: "tabler:arrow-down-left" }),
              x[8] || (x[8] = ce("Referenced by", -1))
            ]),
            (t(!0), a(te, null, fe(b.value, (m) => (t(), a("button", {
              key: m.id,
              class: "gx-rel-item",
              onClick: (z) => o("select", m.otherId)
            }, [
              l("span", bl, A(m.kind), 1),
              l("span", kl, A(m.label), 1),
              $(g(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, yl))), 128))
          ])) : O("", !0)
        ], 64)),
        L.value ? (t(), a("div", xl, [
          $(g(P), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          x[9] || (x[9] = l("span", null, "Loading content…", -1))
        ])) : U.value.length ? (t(), a("section", wl, [
          l("div", {
            class: xe(["gx-ins-clamp", { clamped: ne.value }])
          }, [
            l("div", {
              ref_key: "contentRef",
              ref: me,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), a(te, null, fe(U.value, (m) => (t(), a("div", {
                key: m.id,
                class: "gx-ins-doc"
              }, [
                U.value.length > 1 ? (t(), a("div", _l, A(m.title), 1)) : O("", !0),
                l("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": m.contentType,
                  source: m.content
                }, null, 8, $l)
              ]))), 128))
            ], 512),
            ne.value ? (t(), a("div", Cl)) : O("", !0)
          ], 2),
          he.value ? (t(), a("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": pe.value,
            onClick: x[2] || (x[2] = (m) => pe.value = !pe.value)
          }, [
            $(g(P), {
              icon: pe.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce(" " + A(pe.value ? "Show less" : "Show more"), 1)
          ], 8, Il)) : O("", !0)
        ])) : O("", !0),
        !L.value && !D.value && !U.value.length && !N.value.length && !y.value.length && !b.value.length ? (t(), a("div", Ml, [
          $(g(P), { icon: "tabler:circle-dashed" }),
          x[10] || (x[10] = l("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : O("", !0)
      ])
    ], 6));
  }
}), El = ["aria-label", "aria-expanded", "title"], Dl = { key: 0 }, Ll = {
  key: 0,
  class: "gx-legend-body"
}, Fl = { class: "gx-legend-row" }, Nl = { class: "gx-legend-row" }, Al = /* @__PURE__ */ Ce({
  __name: "GraphLegend",
  setup(s) {
    const u = T(!1);
    return (e, o) => (t(), a("div", {
      class: xe(["gx-legend", { collapsed: !u.value }])
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
        u.value ? O("", !0) : (t(), a("span", Dl, "Legend"))
      ], 8, El),
      u.value ? (t(), a("div", Ll, [
        o[3] || (o[3] = l("div", { class: "gx-legend-row" }, [
          l("span", { class: "gx-legend-mark gx-legend-cluster" }),
          ce(" Color = topic cluster ")
        ], -1)),
        l("div", Fl, [
          l("span", {
            class: "gx-legend-mark",
            style: $e({ background: g(vt).root.fill })
          }, null, 4),
          o[1] || (o[1] = ce(" Root concept ", -1))
        ]),
        l("div", Nl, [
          l("span", {
            class: "gx-legend-mark doc",
            style: $e({ background: g(vt).document.fill })
          }, null, 4),
          o[2] || (o[2] = ce(" Source document ", -1))
        ]),
        o[4] || (o[4] = At('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : O("", !0)
    ], 2));
  }
}), Bl = { class: "gx-controls" }, Ul = { class: "gx-ctrl-read" }, zl = /* @__PURE__ */ Ce({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(s, { emit: u }) {
    const e = u;
    return (o, v) => (t(), a("div", Bl, [
      l("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: v[0] || (v[0] = (r) => e("zoom-in"))
      }, [
        $(g(P), { icon: "tabler:plus" })
      ]),
      l("div", Ul, A(Math.round(s.scale * 100)) + "%", 1),
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
}), Pl = { class: "gx-display" }, Vl = ["title"], Wl = ["max", "value"], Hl = { class: "gx-display-lvl" }, Xl = { class: "gx-display-lvl-max" }, Yl = ["aria-checked", "title"], Gl = /* @__PURE__ */ Ce({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(s, { emit: u }) {
    const e = u;
    return (o, v) => (t(), a("div", Pl, [
      s.maxLevel > 1 ? (t(), a("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${s.level} of ${s.maxLevel} levels`
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
          max: s.maxLevel,
          value: s.level,
          "aria-label": "Graph depth",
          onInput: v[0] || (v[0] = (r) => e("update:level", Number(r.target.value)))
        }, null, 40, Wl),
        l("span", Hl, [
          ce(A(s.level), 1),
          l("span", Xl, "/" + A(s.maxLevel), 1)
        ]),
        v[3] || (v[3] = l("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Vl)) : O("", !0),
      l("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": s.conceptsOnly,
        title: s.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: v[1] || (v[1] = (r) => e("toggle-concepts"))
      }, [
        $(g(P), {
          icon: s.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        v[5] || (v[5] = l("span", { class: "gx-display-label" }, "Concepts only", -1)),
        l("span", {
          class: xe(["gx-display-sw", { on: s.conceptsOnly }])
        }, [...v[4] || (v[4] = [
          l("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Yl),
      s.hiddenCount || s.focused || s.level < s.maxLevel ? (t(), a(te, { key: 1 }, [
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
      ], 64)) : O("", !0)
    ]));
  }
});
function We(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function yt(s) {
  const u = We(s) ? s : { message: String(s) }, e = u.response, o = We(e) && e.status === 401 ? "auth-expired" : "other";
  Ue.handleError(o, u);
}
const Kl = { class: "kb-railtop" }, jl = { class: "kb-railtop-acts" }, Zl = {
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
    canAnswer: { type: Boolean },
    loading: { type: Boolean }
  },
  emits: ["select", "changed", "reload"],
  setup(s, { emit: u }) {
    const e = s, o = u, { navWidth: v, railRef: r, navDragging: I, onStart: y } = Lt(), b = T(null), C = T(1), N = /* @__PURE__ */ new Set(), S = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n);
      return i;
    }), L = R(() => e.selectedId && S.value.get(e.selectedId) || null), U = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.concepts) i.set(n.id, n.label || n.id.slice(0, 8));
      return i;
    });
    function j(i) {
      return U.value.get(i) || i.slice(0, 8);
    }
    const K = R(() => Qt(e.concepts, e.edges));
    function D(i) {
      return K.value.get(i)?.fill || Ee({}).fill;
    }
    const H = R(() => {
      const i = /* @__PURE__ */ new Map();
      for (const n of e.edges)
        (n.edge_type === "subtopic_of" || n.edge_type === "categorized_as") && S.value.has(n.from_node_id) && S.value.has(n.to_node_id) && i.set(n.from_node_id, n.to_node_id);
      return i;
    }), h = R(() => {
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
        for (const se of h.value.get(Q) || [])
          n.has(se) || (n.add(se), f.push(se));
      }
      return n;
    }
    const _ = R(() => {
      const i = /* @__PURE__ */ new Map(), n = H.value, f = (Q, se) => {
        const ge = i.get(Q);
        if (ge !== void 0) return ge;
        const Le = n.get(Q);
        if (Le === void 0 || se.has(Q))
          return i.set(Q, 0), 0;
        se.add(Q);
        const Ve = f(Le, se) + 1;
        return i.set(Q, Ve), Ve;
      };
      for (const Q of e.concepts) f(Q.id, /* @__PURE__ */ new Set());
      return i;
    }), E = R(() => k.value ? _.value.get(k.value) ?? 0 : 0);
    function V(i) {
      return (_.value.get(i) ?? 0) - E.value;
    }
    const J = R(() => {
      let i = 1;
      const n = F.value;
      for (const f of e.concepts) {
        if (n && !n.has(f.id)) continue;
        const Q = V(f.id);
        Q > i && (i = Q);
      }
      return i;
    }), le = T(99), re = R(() => Math.min(le.value, J.value)), B = T(/* @__PURE__ */ new Set()), k = T(null), W = T(!1);
    function me(i) {
      le.value = i;
    }
    function pe(i) {
      const n = new Set(B.value);
      n.add(i), B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function he(i) {
      const n = new Set(B.value);
      for (const f of d(i)) n.add(f);
      B.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const we = R(() => k.value && e.concepts.find((i) => i.id === k.value) || null), F = R(() => k.value ? d(k.value) : null);
    function oe(i) {
      k.value = k.value === i ? null : i, k.value && o("select", i);
    }
    function ne(i) {
      k.value = i, o("select", i);
    }
    function c() {
      if (!k.value) return;
      const i = H.value.get(k.value);
      i && S.value.has(i) && !S.value.get(i)?.is_root ? (k.value = i, o("select", i)) : k.value = null;
    }
    const x = R(() => {
      if (!k.value) return "";
      const i = H.value.get(k.value), n = i ? S.value.get(i) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function m() {
      k.value = null;
    }
    function z() {
      B.value = /* @__PURE__ */ new Set(), k.value = null, le.value = 99, W.value = !1;
    }
    de(k, () => {
      le.value = 99;
    });
    const X = R(() => {
      const i = F.value;
      if (!i && !W.value && !B.value.size && re.value >= J.value) return null;
      const n = /* @__PURE__ */ new Set();
      for (const f of e.concepts)
        i && !i.has(f.id) || V(f.id) > re.value || W.value && f.node_type === "document" || B.value.has(f.id) || n.add(f.id);
      return n;
    });
    function q(i) {
      o("select", i), b.value?.focus(i);
    }
    const Z = T({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), Oe = R(() => {
      const i = Z.value.concept;
      if (!i) return [];
      const n = [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "isolate", label: k.value === i.id ? "Clear isolation" : "Isolate branch", icon: "tabler:focus-2" },
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
    function ze(i, n, f) {
      Z.value = { open: !0, x: n, y: f, concept: i };
    }
    function Qe(i) {
      const n = S.value.get(i.id);
      n && ze(n, i.x, i.y);
    }
    function Pe(i) {
      const n = Z.value.concept;
      if (n)
        switch (i) {
          case "open":
            q(n.id);
            break;
          case "isolate":
            oe(n.id);
            break;
          case "hide":
            pe(n.id);
            break;
          case "hide-branch":
            he(n.id);
            break;
          default:
            Ne.value = n, Me.value = i;
            break;
        }
    }
    const Me = T(""), Ne = T(null), Je = R(() => ({ add: "Add child concept", rename: "Rename concept", move: "Move concept", delete: "Delete concept" })[Me.value] || "");
    function qe(i) {
      Me.value = "", i && o("select", i), o("changed");
    }
    const De = T(!1);
    function et(i) {
      De.value = !1;
      const n = i.parent_id || i.id;
      n && e.concepts.some((f) => f.id === n) && q(n);
    }
    const p = R(() => e.selectedId ? e.edges.filter((i) => i.from_node_id === e.selectedId || i.to_node_id === e.selectedId) : []), M = T(null), w = T(null);
    de(() => e.selectedId, () => {
      M.value = null, w.value = null;
    });
    function Y() {
      if (M.value) {
        M.value = null;
        return;
      }
      w.value && (M.value = w.value);
    }
    const ee = R(() => e.concepts.length > 0 && e.concepts.length < 2), G = T(null);
    function ye() {
      o("changed");
    }
    const ve = T(!1), ke = T("class:fast"), ae = T(""), ue = T(!1);
    async function _e() {
      if (e.kbId)
        try {
          const { data: i } = await Ie.get(`/api/v1/knowledge/${e.kbId}`);
          if (!We(i)) return;
          const n = We(i.knowledge_base) && i.knowledge_base.config || i.config, f = We(n) ? n : {};
          ve.value = f.treatment_enabled === !0, typeof f.treatment_model == "string" && f.treatment_model && (ke.value = f.treatment_model), typeof f.treatment_prompt == "string" && (ae.value = f.treatment_prompt);
        } catch {
        }
    }
    async function Se() {
      if (!(!e.kbId || ue.value)) {
        ue.value = !0;
        try {
          await Ie.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: ve.value,
            treatment_model: ke.value,
            treatment_prompt: ae.value
          } });
          try {
            Ue?.toast?.("Treatment settings saved");
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
    async function Ae() {
      if (!(!e.kbId || ue.value)) {
        ue.value = !0;
        try {
          await Ie.post(`/api/v1/knowledge/${e.kbId}/treatment`, {});
          try {
            Ue?.toast?.("Treatment started — duplicate concepts will be merged.");
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
      typeof n == "string" && n && (ke.value = n);
    }
    return it(() => {
      st("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), st("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), _e();
    }), de(() => e.kbId, () => {
      B.value = /* @__PURE__ */ new Set(), k.value = null, le.value = 99, W.value = !1, _e();
    }), (i, n) => (t(), a("div", {
      ref_key: "railRef",
      ref: r,
      class: xe(["gx", { "wk-dragging": g(I) }]),
      style: $e({ "--kx-rail-width": g(v) + "px" })
    }, [
      s.concepts.length ? (t(), ie(g(Ct), { key: 0 }, {
        rail: be(() => [
          l("div", Kl, [
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
                active: G.value === "add",
                onClick: n[1] || (n[1] = (f) => G.value = "add")
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:wand",
                label: "Treatment",
                active: G.value === "treatment",
                onClick: n[2] || (n[2] = (f) => G.value = "treatment")
              }, null, 8, ["active"]),
              $(g(Te), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: s.loading,
                spin: s.loading,
                onClick: n[3] || (n[3] = (f) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Ot, {
            concepts: s.concepts,
            edges: s.edges,
            "selected-id": s.selectedId,
            onSelect: q,
            onContext: n[4] || (n[4] = (f) => ze(f.concept, f.x, f.y))
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
        default: be(() => [
          De.value ? (t(), a("div", Zl, [
            $(g(It), {
              "kb-id": s.kbId,
              layout: "panel",
              ask: s.canAnswer,
              onOpen: et,
              onClose: n[6] || (n[6] = (f) => De.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), a("div", Ql, [
            $(qo, {
              ref_key: "canvasRef",
              ref: b,
              concepts: s.concepts,
              edges: s.edges,
              "visible-ids": X.value,
              colors: K.value,
              "selected-id": s.selectedId || null,
              "highlight-ids": g(N),
              onSelect: n[7] || (n[7] = (f) => o("select", f || "")),
              onScale: n[8] || (n[8] = (f) => C.value = f),
              onNodeContext: Qe,
              onNodeDblclick: ne
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            l("div", Jl, [
              $(Al),
              $(Gl, {
                level: re.value,
                "max-level": J.value,
                "concepts-only": W.value,
                "hidden-count": B.value.size,
                focused: !!k.value,
                "onUpdate:level": me,
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
                we.value ? (t(), a("div", ql, [
                  l("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${x.value}`,
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
                  l("span", ts, A(we.value.label || "concept"), 1),
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
                ])) : O("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: be(() => [
                L.value ? (t(), ie(Tl, {
                  key: 0,
                  "kb-id": s.kbId,
                  concept: L.value,
                  edges: p.value,
                  "label-of": j,
                  "color-of": D,
                  "original-open": !!M.value,
                  onSelect: n[13] || (n[13] = (f) => q(f)),
                  onClose: n[14] || (n[14] = (f) => o("select", "")),
                  onOriginalAvailable: n[15] || (n[15] = (f) => w.value = f),
                  onToggleOriginal: Y
                }, null, 8, ["kb-id", "concept", "edges", "original-open"])) : O("", !0)
              ]),
              _: 1
            }),
            $(Ye, { name: "gx-ins-fade" }, {
              default: be(() => [
                ee.value ? (t(), a("div", ns, [
                  $(g(P), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = l("span", null, "Add more content to grow the graph.", -1)),
                  l("button", {
                    class: "gx-sparse-cta",
                    onClick: n[16] || (n[16] = (f) => G.value = "add")
                  }, [
                    $(g(P), {
                      icon: "tabler:plus",
                      "aria-hidden": "true"
                    }),
                    n[27] || (n[27] = ce(" Add content ", -1))
                  ])
                ])) : O("", !0)
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
        onCta: n[17] || (n[17] = (f) => G.value = "add")
      })),
      $(g(Ge), {
        open: G.value === "add",
        title: "Add content",
        icon: "tabler:plus",
        onClose: n[18] || (n[18] = (f) => G.value = null)
      }, {
        default: be(() => [
          $(St, {
            "kb-id": s.kbId,
            noun: "document",
            onChanged: ye
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(g(Ge), {
        open: G.value === "treatment",
        title: "Concept treatment",
        icon: "tabler:wand",
        onClose: n[21] || (n[21] = (f) => G.value = null)
      }, {
        default: be(() => [
          l("div", os, [
            l("label", ls, [
              Fe(l("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (f) => ve.value = f)
              }, null, 512), [
                [Bt, ve.value]
              ]),
              n[29] || (n[29] = l("span", null, "Auto-merge duplicate concepts after each ingest", -1))
            ]),
            l("div", ss, [
              n[30] || (n[30] = l("span", { class: "ap-label" }, "Model", -1)),
              l("wc-model-picker", {
                value: ke.value,
                capability: "generate",
                onSelect: Be
              }, null, 40, as)
            ]),
            l("div", is, [
              n[31] || (n[31] = l("span", { class: "ap-label" }, [
                ce("Prompt "),
                l("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Fe(l("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (f) => ae.value = f),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for the treatment agent…"
              }, null, 512), [
                [Ke, ae.value]
              ])
            ]),
            l("div", cs, [
              $(g(je), {
                variant: "soft",
                disabled: ue.value,
                onClick: Se
              }, {
                default: be(() => [...n[32] || (n[32] = [
                  ce("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(g(je), {
                variant: "primary",
                disabled: ue.value,
                onClick: Ae
              }, {
                default: be(() => [...n[33] || (n[33] = [
                  ce("Run now", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n[34] || (n[34] = l("p", { class: "gx-treat-hint" }, "Merges duplicate / near-duplicate concept nodes. Runs automatically after ingest when enabled, or on demand here.", -1))
          ])
        ]),
        _: 1
      }, 8, ["open"]),
      $(g(Ge), {
        open: !!Me.value,
        title: Je.value,
        icon: "tabler:sitemap",
        onClose: n[23] || (n[23] = (f) => Me.value = "")
      }, {
        default: be(() => [
          Me.value ? (t(), ie(Rt, {
            key: 0,
            "kb-id": s.kbId,
            mode: Me.value,
            target: Ne.value,
            concepts: s.concepts,
            edges: s.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (f) => Me.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : O("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(g(xt), {
        contained: "",
        open: !!M.value,
        title: M.value?.title || L.value?.label || "",
        "content-type": M.value?.contentType || "",
        "source-url": M.value?.sourceUrl || "",
        onClose: n[24] || (n[24] = (f) => M.value = null)
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
  setup(s) {
    const u = Ut(), e = zt(), o = R(() => u.value.config?.kb_id || ""), v = R(() => u.value.config?.route || "");
    let r = !1;
    function I() {
      const F = u.value.config?.view;
      return F === "graph" || F === "wiki" ? F : localStorage.getItem(vs) === "graph" ? "graph" : "wiki";
    }
    const y = T(I());
    de(() => u.value.config?.view, (F) => {
      (F === "graph" || F === "wiki") && F !== y.value && (y.value = F);
    });
    const b = T(!1), C = T(""), N = T([]), S = T([]), L = T(""), U = T(!1), j = T(null), K = T(!1), D = R(() => {
      const F = j.value;
      return F ? F.error ? `Graph enrichment failed: ${F.error}` : F.agent_missing ? F.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), H = R(() => !!j.value?.error);
    async function h() {
      if (!(!o.value || K.value)) {
        K.value = !0;
        try {
          await Ie.post(`/api/v1/kb10/${o.value}/enrichment`), j.value = null;
        } catch (F) {
          Ue.handleError(F?.response?.status === 401 ? "auth-expired" : "other", F);
        } finally {
          K.value = !1;
        }
      }
    }
    const d = R(() => {
      const F = /* @__PURE__ */ new Map();
      for (const oe of N.value) F.set(oe.id, oe);
      return F;
    }), _ = R(() => $t(N.value, S.value)[0]?.concept.id || "");
    async function E() {
      if (!o.value) {
        U.value = !1;
        return;
      }
      try {
        const { data: F } = await Ie.get(`/api/v1/knowledge/${o.value}`), oe = F?.config || F?.knowledge_base?.config || {};
        U.value = qt(oe);
      } catch {
        U.value = !1;
      }
    }
    let V = 0;
    async function J(F = !1) {
      if (!o.value) return;
      const oe = ++V;
      F || (b.value = !0), C.value = "";
      try {
        const { data: ne } = await Ie.get(`/api/v1/kb10/${o.value}/graph`);
        if (oe !== V) return;
        if (ne?.success) {
          N.value = ne.nodes || [], S.value = ne.edges || [];
          const c = ne.enrichment || {};
          j.value = c.error || c.agent_missing ? c : null, L.value && !d.value.has(L.value) && (L.value = ""), L.value || (v.value && d.value.has(v.value) ? le(v.value) : y.value === "wiki" && _.value && (r = !0, L.value = _.value, r = !1));
        } else
          C.value = ne?.error && gt(ne.error) ? pt : ne?.error || "";
      } catch (ne) {
        if (oe !== V) return;
        const c = ne?.response?.data?.error || ne?.message || "could not load the knowledge base";
        C.value = gt(c) ? pt : c, Ue.handleError(ne?.response?.status === 401 ? "auth-expired" : "other", ne);
      } finally {
        oe === V && !F && (b.value = !1);
      }
    }
    function le(F) {
      if ((F || "") !== (L.value || "")) {
        if (!F) {
          L.value = "";
          return;
        }
        d.value.has(F) && (r = !0, L.value = F, r = !1);
      }
    }
    de(L, (F) => {
      r || e("navigate", F || "");
    }), de(v, (F) => le(F));
    let re = null;
    function B() {
      re && clearTimeout(re), re = setTimeout(() => {
        re = null, J(!0);
      }, 400);
    }
    let k = null, W = 0;
    function me(F) {
      const oe = ++W;
      if (k && (k(), k = null), !F) return;
      const ne = Jt(F, () => B());
      if (oe !== W) {
        ne && ne();
        return;
      }
      k = ne;
    }
    Ze(() => {
      W++, re && clearTimeout(re), k && k();
    }), de(y, (F) => {
      F === "wiki" && !L.value && _.value && (r = !0, L.value = _.value, r = !1);
    }), de(o, (F) => {
      L.value = "", J(), E(), me(F);
    }, { immediate: !0 });
    function pe(F) {
      F !== L.value && (L.value = F);
    }
    function he() {
      o.value && e("kb-changed", { kb_id: o.value }), J(!0);
    }
    function we() {
      J();
    }
    return (F, oe) => (t(), a("div", us, [
      C.value ? (t(), ie(g(ft), {
        key: 0,
        tone: "info"
      }, {
        default: be(() => [
          ce(A(C.value), 1)
        ]),
        _: 1
      })) : O("", !0),
      D.value ? (t(), ie(g(ft), {
        key: 1,
        tone: "warn"
      }, {
        default: be(() => [
          ce(A(D.value) + " ", 1),
          H.value ? (t(), a("button", {
            key: 0,
            type: "button",
            class: "kx-notice-action",
            disabled: K.value,
            onClick: h
          }, A(K.value ? "Retrying…" : "Retry"), 9, ds)) : O("", !0)
        ]),
        _: 1
      })) : O("", !0),
      b.value && !N.value.length ? (t(), ie(g(sn), {
        key: 2,
        icon: y.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: y.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), ie(Ye, {
        key: 3,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: be(() => [
          y.value === "wiki" ? (t(), ie(Uo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: N.value,
            edges: S.value,
            "selected-id": L.value,
            "can-answer": U.value,
            loading: b.value,
            onSelect: pe,
            onChanged: he,
            onReload: we
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"])) : (t(), ie(rs, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: N.value,
            edges: S.value,
            "selected-id": L.value,
            "can-answer": U.value,
            loading: b.value,
            onSelect: pe,
            onChanged: he,
            onReload: we
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"]))
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
//# sourceMappingURL=wiki-mount--uxD0T_I.js.map
