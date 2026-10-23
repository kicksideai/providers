import { _ as Ke, u as Ft, a as Nt, d as At, W as Bt, c as Ut } from "./styles-CpBFKx7r.js";
import { defineComponent as Ce, openBlock as t, createElementBlock as r, toDisplayString as N, createElementVNode as a, createVNode as $, unref as v, createCommentVNode as R, ref as O, computed as S, watch as ue, onMounted as lt, createBlock as le, normalizeClass as we, Fragment as te, renderList as ge, createTextVNode as se, normalizeStyle as $e, withModifiers as Se, withDirectives as Le, vModelText as Ge, vModelSelect as ct, withCtx as me, onBeforeUnmount as Ze, onUnmounted as Pt, nextTick as at, createStaticVNode as Wt, Transition as Xe, vModelCheckbox as Vt } from "vue";
import { loadByTagName as it, api as Ie, host as Be, define as jt } from "@wippy-fe/proxy";
import { r as Ht, t as Xt, v as Yt, d as mt, e as Kt, f as kt, w as Te, x as rt, y as ot, g as wt, u as yt, b as _t, _ as Oe, z as dt, A as $t, B as Gt, C as Zt, D as Qt, F as Jt, j as Ct, k as It, l as Mt, o as Ye, p as zt, G as qt, H as ut, I as en, N as pt, J as tn, h as gt, E as xt, i as vt, s as nn, q as on } from "./package-CMfeD3ol.js";
import { Icon as P } from "@iconify/vue";
const an = { class: "kc-count" }, rn = /* @__PURE__ */ Ce({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(i) {
    return (d, e) => (t(), r("span", an, N(i.value), 1));
  }
}), ln = { class: "kc-loading" }, sn = { class: "kc-loading-inner" }, cn = { key: 0 }, dn = /* @__PURE__ */ Ce({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(i) {
    return (d, e) => (t(), r("div", ln, [
      a("div", sn, [
        $(v(P), {
          icon: i.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        i.label ? (t(), r("span", cn, N(i.label), 1)) : R("", !0)
      ])
    ]));
  }
}), un = {
  key: 0,
  class: "wr"
}, pn = {
  key: 0,
  class: "wr-head"
}, gn = {
  key: 0,
  class: "wr-title-row"
}, xn = { class: "wr-title" }, vn = {
  key: 1,
  class: "wr-lede"
}, fn = {
  key: 1,
  class: "wr-state"
}, bn = {
  key: 2,
  class: "wr-state err"
}, hn = {
  key: 1,
  class: "wr-doc"
}, mn = {
  key: 0,
  class: "wr-doc-head"
}, kn = { class: "wr-doc-sep" }, wn = ["aria-expanded", "onClick"], yn = ["source"], _n = {
  key: 3,
  class: "wr-prov"
}, $n = { class: "wr-prov-k" }, Cn = ["href"], In = {
  key: 1,
  class: "wr-prov-v"
}, Mn = {
  key: 4,
  class: "wr-doc-rule"
}, zn = {
  key: 2,
  class: "wr-chunks"
}, Sn = {
  key: 0,
  class: "wr-doc-sep"
}, Rn = ["aria-expanded", "onClick"], On = { class: "wr-chunk-n" }, Tn = { class: "wr-chunk-label" }, En = {
  key: 0,
  class: "wr-chunk-cx"
}, Dn = {
  key: 3,
  class: "wr-grid"
}, Ln = ["onClick"], Fn = { class: "wr-card-top" }, Nn = { class: "wr-card-ic" }, An = { class: "wr-card-name" }, Bn = {
  key: 0,
  class: "wr-card-desc"
}, Un = { class: "wr-card-meta" }, Pn = { key: 0 }, Wn = { key: 1 }, Vn = { key: 2 }, jn = {
  key: 4,
  class: "wr-state muted"
}, Hn = {
  key: 5,
  class: "wr-foot"
}, Xn = {
  key: 0,
  class: "wr-foot-group"
}, Yn = { class: "wr-foot-links" }, Kn = ["onClick"], Gn = {
  key: 1,
  class: "wr-foot-group"
}, Zn = { class: "wr-foot-links" }, Qn = ["onClick"], Jn = { class: "wr-foot-kind" }, qn = /* @__PURE__ */ Ce({
  __name: "WikiReader",
  props: {
    kbId: {},
    concept: {},
    edges: {},
    conceptsById: {}
  },
  emits: ["navigate"],
  setup(i, { emit: d }) {
    const e = i, o = d;
    function p(s) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(s)}/source`;
    }
    const c = O(!1), I = O(""), h = O([]), m = O([]), C = O({}), F = O("rendered"), z = O(null), D = S(() => m.value.reduce((s, w) => s + w.chunks.length, 0)), B = S(() => {
      const s = /* @__PURE__ */ new Map();
      for (const w of m.value) w.summary && s.set(w.id, w.summary);
      return s;
    }), G = S(() => D.value > 0 || m.value.some((s) => s.summary));
    function K(s) {
      C.value = { ...C.value, [s]: !C.value[s] };
    }
    const E = O({}), j = S(() => h.value.length > 1);
    function b(s) {
      return !j.value || !!E.value[s];
    }
    function u(s) {
      E.value = { ...E.value, [s]: !E.value[s] };
    }
    ue(h, () => {
      E.value = {};
    });
    const _ = S(() => Ht(e.concept, e.edges)), T = S(() => Xt(e.concept, e.edges, e.conceptsById)), W = S(() => Yt(e.concept, e.edges, e.conceptsById)), J = S(() => h.value.length > 0), ae = S(() => {
      const s = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return G.value && s.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: D.value || void 0 }), s;
    });
    function ce(s) {
      return s.metadata?.original_mime_type || s.metadata?.source_mime || "";
    }
    function A(s) {
      const w = ce(s);
      return yt(s.metadata) && _t(w) ? { contentType: w, sourceUrl: p(s.id) } : w === "application/pdf" ? { contentType: "application/pdf", sourceUrl: p(s.id) } : null;
    }
    function k(s) {
      if (z.value?.id === s.id) {
        z.value = null;
        return;
      }
      const w = A(s);
      w && (z.value = { id: s.id, contentType: w.contentType, sourceUrl: w.sourceUrl, title: s.title });
    }
    const V = S(() => h.value.find((s) => A(s)) || null), fe = S(() => !!V.value), xe = S(() => !!V.value && z.value?.id === V.value.id);
    function be(s) {
      const w = s.metadata || {}, f = w.filename || w.original_filename, U = w.source_url, H = w.page ?? w.page_number, q = H != null && H !== "";
      if (!f && !U && !q) return [];
      const Z = [], Re = w.original_mime_type || w.source_mime;
      return f && Z.push({ key: "filename", label: "File", value: String(f) }), Re && Z.push({ key: "mime", label: "Type", value: String(Re) }), U && Z.push({ key: "source", label: "Source", value: String(U), href: String(U) }), q && Z.push({ key: "page", label: "Page", value: String(H) }), Z;
    }
    async function ye(s) {
      const { data: w } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(s)}`);
      if (!w?.success || !w.node) return null;
      const f = w.node, U = f.content || "";
      if (!U.trim()) return null;
      const H = f.metadata || {}, q = H.title || H.filename || H.source_url || e.conceptsById.get(s)?.label || "Document";
      return { id: s, title: q, content: U, contentType: f.content_type || "text/markdown", metadata: H };
    }
    lt(() => {
      it("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function L(s, w) {
      try {
        const { data: f } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(s)}&include_content=true&limit=200`);
        if (!f?.success) return null;
        const U = f.nodes || [], H = U.filter((Z) => Z.node_type === "chunk").sort((Z, Re) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((Re.metadata || {}).index ?? (Re.metadata || {}).chunk_index ?? 0)).map((Z) => ({ id: Z.id, content: String(Z.content || ""), prefix: String((Z.metadata || {}).contextual_prefix || "") })), q = String((U.find((Z) => Z.node_type === "summary") || {}).content || "");
        return !H.length && !q ? null : { id: s, title: w, summary: q, chunks: H };
      } catch {
        return null;
      }
    }
    let oe = 0;
    async function ne() {
      const s = e.concept, w = ++oe;
      if (h.value = [], m.value = [], C.value = {}, I.value = "", F.value = "rendered", !s || !e.kbId) return;
      const f = _.value;
      if (f.length) {
        c.value = !0;
        try {
          const U = await Promise.all(f.map((q) => ye(q).catch(() => null)));
          if (w !== oe) return;
          h.value = U.filter((q) => q != null), !h.value.length && f.length && (I.value = "The source for this page could not be loaded.");
          const H = await Promise.all(h.value.map((q) => L(q.id, q.title)));
          if (w !== oe) return;
          m.value = H.filter((q) => q != null);
        } catch (U) {
          if (w !== oe) return;
          I.value = U?.response?.data?.error || U?.message || "could not load this page";
        } finally {
          w === oe && (c.value = !1);
        }
      }
    }
    return ue(() => [e.concept?.id, e.kbId], () => ne(), { immediate: !0 }), ue(() => e.concept?.id, () => {
      z.value = null;
    }), (s, w) => i.concept ? (t(), r("article", un, [
      !i.concept.is_root || i.concept.description ? (t(), r("header", pn, [
        i.concept.is_root ? R("", !0) : (t(), r("div", gn, [
          a("h1", xn, N(i.concept.label || i.concept.id), 1),
          V.value ? (t(), le(v(mt), {
            key: 0,
            class: we(["wr-orig-btn", { on: xe.value }]),
            label: xe.value ? "Hide original" : "View original",
            onOpen: w[0] || (w[0] = (f) => k(V.value))
          }, null, 8, ["class", "label"])) : R("", !0)
        ])),
        i.concept.description ? (t(), r("p", vn, N(i.concept.description), 1)) : R("", !0)
      ])) : R("", !0),
      c.value ? (t(), r("div", fn, [
        $(v(P), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        w[3] || (w[3] = a("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), r("div", bn, [
        $(v(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, N(I.value), 1)
      ])) : (t(), r(te, { key: 3 }, [
        J.value && (fe.value || G.value) ? (t(), le(v(Kt), {
          key: 0,
          tabs: ae.value,
          active: F.value,
          onSelect: w[1] || (w[1] = (f) => F.value = f)
        }, null, 8, ["tabs", "active"])) : R("", !0),
        J.value && F.value === "rendered" ? (t(), r("div", hn, [
          (t(!0), r(te, null, ge(h.value, (f, U) => (t(), r("section", {
            key: f.id,
            class: "wr-doc-page"
          }, [
            h.value.length > 1 ? (t(), r("div", mn, [
              a("span", kn, N(f.title), 1),
              a("button", {
                type: "button",
                class: "wr-doc-toggle",
                "aria-expanded": b(f.id),
                onClick: (H) => u(f.id)
              }, [
                $(v(P), {
                  icon: b(f.id) ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                se(" " + N(b(f.id) ? "Collapse" : "Read"), 1)
              ], 8, wn)
            ])) : R("", !0),
            B.value.get(f.id) ? (t(), le(v(kt), {
              key: 1,
              text: B.value.get(f.id)
            }, null, 8, ["text"])) : R("", !0),
            b(f.id) ? (t(), r("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: f.content
            }, null, 8, yn)) : R("", !0),
            b(f.id) && be(f).length ? (t(), r("div", _n, [
              (t(!0), r(te, null, ge(be(f), (H) => (t(), r("div", {
                key: H.key,
                class: "wr-prov-row"
              }, [
                a("span", $n, N(H.label), 1),
                H.href ? (t(), r("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: H.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, N(H.value), 9, Cn)) : (t(), r("span", In, N(H.value), 1))
              ]))), 128))
            ])) : R("", !0),
            U < h.value.length - 1 ? (t(), r("hr", Mn)) : R("", !0)
          ]))), 128))
        ])) : J.value && F.value === "chunks" ? (t(), r("div", zn, [
          (t(!0), r(te, null, ge(m.value, (f) => (t(), r("section", {
            key: f.id,
            class: "wr-chunks-doc"
          }, [
            m.value.length > 1 ? (t(), r("div", Sn, N(f.title), 1)) : R("", !0),
            (t(!0), r(te, null, ge(f.chunks, (U, H) => (t(), r("div", {
              key: U.id,
              class: we(["wr-chunk", { open: C.value[U.id] }])
            }, [
              a("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!C.value[U.id],
                onClick: (q) => K(U.id)
              }, [
                a("span", On, N(H + 1), 1),
                a("span", Tn, "Chunk " + N(H + 1), 1),
                $(v(P), {
                  class: "wr-chunk-chev",
                  icon: C.value[U.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Rn),
              U.prefix ? (t(), r("p", En, [
                $(v(P), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                a("span", null, N(U.prefix), 1)
              ])) : R("", !0),
              a("p", {
                class: we(["wr-chunk-body", { clamp: !C.value[U.id] }])
              }, N(U.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : T.value.length ? (t(), r("div", Dn, [
          (t(!0), r(te, null, ge(T.value, (f) => (t(), r("button", {
            key: f.id,
            class: "wr-card",
            style: $e({ "--c": v(Te)(f).fill }),
            onClick: (U) => o("navigate", f)
          }, [
            a("span", Fn, [
              a("span", Nn, [
                $(v(P), {
                  icon: v(rt)(f),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(v(P), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            a("span", An, N(f.label || f.id), 1),
            f.description ? (t(), r("span", Bn, N(f.description), 1)) : R("", !0),
            a("span", Un, [
              f.document_count ? (t(), r("span", Pn, N(f.document_count) + " " + N(f.document_count === 1 ? "page" : "pages"), 1)) : R("", !0),
              v(ot)(f.id, i.edges) ? (t(), r("span", Wn, N(v(ot)(f.id, i.edges)) + " subtopics", 1)) : R("", !0),
              !f.document_count && !v(ot)(f.id, i.edges) ? (t(), r("span", Vn, "empty")) : R("", !0)
            ])
          ], 12, Ln))), 128))
        ])) : (t(), r("div", jn, [
          $(v(P), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          w[4] || (w[4] = a("span", null, "This page has no content yet.", -1))
        ])),
        W.value.length || J.value && T.value.length ? (t(), r("footer", Hn, [
          J.value && T.value.length ? (t(), r("div", Xn, [
            w[5] || (w[5] = a("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            a("div", Yn, [
              (t(!0), r(te, null, ge(T.value, (f) => (t(), r("button", {
                key: f.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", f)
              }, [
                a("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: v(Te)(f).fill })
                }, null, 4),
                se(N(f.label || f.id), 1)
              ], 8, Kn))), 128))
            ])
          ])) : R("", !0),
          W.value.length ? (t(), r("div", Gn, [
            w[6] || (w[6] = a("span", { class: "wr-foot-h" }, "Related", -1)),
            a("div", Zn, [
              (t(!0), r(te, null, ge(W.value, (f) => (t(), r("button", {
                key: f.concept.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", f.concept)
              }, [
                a("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: v(Te)(f.concept).fill })
                }, null, 4),
                se(N(f.concept.label || f.concept.id) + " ", 1),
                a("span", Jn, N(f.label), 1)
              ], 8, Qn))), 128))
            ])
          ])) : R("", !0)
        ])) : R("", !0)
      ], 64)),
      $(v(wt), {
        contained: "",
        open: !!z.value,
        title: z.value?.title || i.concept?.label || "",
        "content-type": z.value?.contentType || "",
        "source-url": z.value?.sourceUrl || "",
        onClose: w[2] || (w[2] = (f) => z.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : R("", !0);
  }
}), eo = { class: "wk-tax-h" }, to = ["value"], no = {
  key: 2,
  class: "wk-tax-del"
}, oo = { class: "wk-tax-counts" }, ao = ["value"], io = {
  key: 3,
  class: "wk-tax-err"
}, ro = { class: "wk-tax-foot" }, St = /* @__PURE__ */ Ce({
  __name: "TaxonomyForm",
  props: {
    kbId: {},
    mode: {},
    target: {},
    concepts: {},
    edges: {}
  },
  emits: ["saved", "close"],
  setup(i, { emit: d }) {
    const e = i, o = d, p = O(""), c = O(""), I = O(""), h = O(""), m = O(!1), C = O(""), F = S(() => {
      const u = /* @__PURE__ */ new Map();
      for (const _ of e.concepts) u.set(_.id, _);
      return u;
    }), z = S(() => {
      const u = /* @__PURE__ */ new Map();
      for (const _ of e.edges)
        (_.edge_type === "subtopic_of" || _.edge_type === "categorized_as") && F.value.has(_.from_node_id) && F.value.has(_.to_node_id) && u.set(_.from_node_id, _.to_node_id);
      return u;
    }), D = S(() => ({ add: "Add child concept", rename: "Rename", move: "Move to", delete: "Delete" })[e.mode] || ""), B = S(() => e.concepts.filter((u) => u.node_type !== "document"));
    function G(u, _) {
      let T = u;
      const W = /* @__PURE__ */ new Set();
      for (; T && !W.has(T); ) {
        if (T === _) return !0;
        W.add(T), T = z.value.get(T);
      }
      return !1;
    }
    const K = S(() => {
      const u = e.target;
      return u ? B.value.filter((_) => _.id !== u.id && !G(_.id, u.id)) : B.value;
    }), E = S(() => {
      const u = e.target;
      if (!u) return { childCount: 0, documentCount: 0, empty: !0 };
      let _ = 0, T = 0;
      for (const W of e.edges)
        W.to_node_id === u.id && (W.edge_type === "subtopic_of" && (_ += 1), W.edge_type === "categorized_as" && (T += 1));
      return { childCount: _, documentCount: T, empty: _ === 0 && T === 0 };
    }), j = S(() => {
      const u = e.target;
      return m.value ? !1 : e.mode === "add" ? p.value.trim() !== "" : !u || u.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? p.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== u.id : e.mode === "delete" ? E.value.empty || h.value !== "" : !1;
    });
    ue(() => [e.mode, e.target], () => {
      const u = e.target;
      p.value = e.mode === "rename" && u?.label || "", c.value = e.mode === "rename" && u?.description || "", I.value = u && z.value.get(u.id) || "", h.value = "", C.value = "";
    }, { immediate: !0 });
    async function b() {
      const u = e.target, _ = e.kbId;
      if (!(!_ || !j.value)) {
        m.value = !0, C.value = "";
        try {
          let T = u?.id || "";
          if (e.mode === "add") {
            const { data: W } = await Ie.post(`/api/v1/kb10/${_}/concepts`, {
              label: p.value.trim(),
              description: c.value.trim(),
              parent_id: u?.id
            });
            if (!W?.success) throw new Error(W?.error || "create failed");
            T = W.node_id || T;
          } else if (e.mode === "rename" && u) {
            const { data: W } = await Ie.patch(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(u.id)}`, {
              label: p.value.trim(),
              description: c.value.trim()
            });
            if (!W?.success) throw new Error(W?.error || "update failed");
            T = u.id;
          } else if (e.mode === "move" && u) {
            const { data: W } = await Ie.put(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(u.id)}/parent`, {
              parent_id: I.value
            });
            if (!W?.success) throw new Error(W?.error || "move failed");
            T = u.id;
          } else if (e.mode === "delete" && u) {
            const W = h.value ? { reassign_to_concept_id: h.value } : {}, { data: J } = await Ie.delete(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(u.id)}`, { data: W });
            if (!J?.success) throw new Error(J?.error || "delete failed");
            T = h.value || z.value.get(u.id) || "";
          }
          o("saved", T);
        } catch (T) {
          C.value = T?.response?.data?.error || T?.message || "taxonomy update failed", Be.handleError(T?.response?.status === 401 ? "auth-expired" : "other", T);
        } finally {
          m.value = !1;
        }
      }
    }
    return (u, _) => (t(), r("form", {
      class: "wk-tax",
      onSubmit: Se(b, ["prevent"])
    }, [
      a("div", eo, [
        a("span", null, N(D.value), 1),
        $(v(Oe), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: _[0] || (_[0] = (T) => o("close"))
        })
      ]),
      i.mode === "add" || i.mode === "rename" ? (t(), r(te, { key: 0 }, [
        Le(a("input", {
          "onUpdate:modelValue": _[1] || (_[1] = (T) => p.value = T),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ge, p.value]
        ]),
        Le(a("textarea", {
          "onUpdate:modelValue": _[2] || (_[2] = (T) => c.value = T),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ge, c.value]
        ])
      ], 64)) : R("", !0),
      i.mode === "move" ? Le((t(), r("select", {
        key: 1,
        "onUpdate:modelValue": _[3] || (_[3] = (T) => I.value = T),
        class: "wk-tax-input"
      }, [
        _[6] || (_[6] = a("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), r(te, null, ge(K.value, (T) => (t(), r("option", {
          key: T.id,
          value: T.id
        }, N(T.label || T.id), 9, to))), 128))
      ], 512)), [
        [ct, I.value]
      ]) : R("", !0),
      i.mode === "delete" ? (t(), r("div", no, [
        a("div", oo, [
          a("span", null, [
            $(v(P), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            se(N(E.value.childCount) + " subtopics", 1)
          ]),
          a("span", null, [
            $(v(P), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            se(N(E.value.documentCount) + " pages", 1)
          ])
        ]),
        E.value.empty ? R("", !0) : Le((t(), r("select", {
          key: 0,
          "onUpdate:modelValue": _[4] || (_[4] = (T) => h.value = T),
          class: "wk-tax-input"
        }, [
          _[7] || (_[7] = a("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), r(te, null, ge(K.value, (T) => (t(), r("option", {
            key: T.id,
            value: T.id
          }, N(T.label || T.id), 9, ao))), 128))
        ], 512)), [
          [ct, h.value]
        ])
      ])) : R("", !0),
      C.value ? (t(), r("div", io, [
        $(v(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, N(C.value), 1)
      ])) : R("", !0),
      a("div", ro, [
        $(v(Ke), {
          variant: "ghost",
          small: "",
          disabled: m.value,
          onClick: _[5] || (_[5] = (T) => o("close"))
        }, {
          default: me(() => [..._[8] || (_[8] = [
            se("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(v(Ke), {
          type: "submit",
          small: "",
          variant: i.mode === "delete" ? "danger" : "primary",
          loading: m.value,
          disabled: !j.value
        }, {
          default: me(() => [
            se(N(i.mode === "delete" ? "Delete" : "Save"), 1)
          ]),
          _: 1
        }, 8, ["variant", "loading", "disabled"])
      ])
    ], 32));
  }
}), lo = { class: "wn" }, so = {
  key: 0,
  class: "wn-folder"
}, co = ["title"], uo = {
  key: 1,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Search results"
}, po = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], go = { class: "wn-item-text" }, xo = { class: "wn-label" }, vo = {
  key: 0,
  class: "wn-path"
}, fo = {
  key: 0,
  class: "wn-path-sep"
}, bo = ["onClick"], ho = {
  key: 0,
  class: "wn-empty"
}, mo = {
  key: 2,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Folder contents"
}, ko = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], wo = { class: "wn-label" }, yo = {
  key: 0,
  class: "wn-count"
}, _o = ["onClick"], $o = {
  key: 0,
  class: "wn-empty"
}, Co = /* @__PURE__ */ Ce({
  __name: "WikiNav",
  props: {
    crumbs: {},
    entries: {},
    selectedId: {},
    query: {},
    results: {}
  },
  emits: ["open", "enter", "up", "context"],
  setup(i, { emit: d }) {
    const e = i, o = d;
    function p(E, j) {
      const b = E.currentTarget.getBoundingClientRect();
      o("context", { concept: j, x: b.right, y: b.bottom });
    }
    function c(E, j) {
      o("context", { concept: j, x: E.clientX, y: E.clientY });
    }
    const I = S(() => e.query.trim().length > 0), h = S(() => e.crumbs.length > 1), m = S(() => e.crumbs[e.crumbs.length - 1] || null);
    function C(E) {
      return E.label || (E.node_type === "document" ? "Untitled page" : E.id);
    }
    function F(E) {
      E.isFolder ? o("enter", E.concept) : o("open", E.concept);
    }
    function z(E) {
      E.isFolder ? o("enter", E.concept) : o("open", E.concept);
    }
    const D = O(""), B = S(() => I.value ? e.results : e.entries);
    function G(E) {
      const j = B.value;
      return (j.find((u) => u.concept.id === D.value) || j.find((u) => u.concept.id === e.selectedId) || j[0])?.concept.id === E ? 0 : -1;
    }
    function K(E, j) {
      if (E.target !== E.currentTarget) return;
      if (E.key === "Enter" || E.key === " ") {
        E.preventDefault(), j.isFolder ? o("enter", j.concept) : o("open", j.concept);
        return;
      }
      const b = E.currentTarget, u = Array.from(b.parentElement.querySelectorAll('[role="option"]')), _ = u.indexOf(b);
      let T;
      switch (E.key) {
        case "ArrowDown":
          T = Math.min(_ + 1, u.length - 1);
          break;
        case "ArrowUp":
          T = Math.max(_ - 1, 0);
          break;
        case "Home":
          T = 0;
          break;
        case "End":
          T = u.length - 1;
          break;
        default:
          return;
      }
      E.preventDefault(), u[T]?.focus();
    }
    return (E, j) => (t(), r("div", lo, [
      !I.value && m.value ? (t(), r("div", so, [
        h.value ? (t(), r("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: j[0] || (j[0] = (b) => o("up"))
        }, [
          $(v(P), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : R("", !0),
        a("span", {
          class: "wn-folder-name",
          title: C(m.value)
        }, N(C(m.value)), 9, co)
      ])) : R("", !0),
      I.value ? (t(), r("ul", uo, [
        (t(!0), r(te, null, ge(i.results, (b) => (t(), r("li", {
          key: b.concept.id,
          class: we(["wn-item", { active: b.concept.id === i.selectedId, folder: b.isFolder }]),
          role: "option",
          tabindex: G(b.concept.id),
          onFocus: (u) => D.value = b.concept.id,
          onKeydown: (u) => K(u, b),
          "aria-selected": b.concept.id === i.selectedId,
          onClick: (u) => z(b),
          onContextmenu: Se((u) => c(u, b.concept), ["prevent"])
        }, [
          a("span", {
            class: "wn-ico",
            style: $e({ color: v(Te)(b.concept).fill })
          }, [
            $(v(P), {
              icon: b.isFolder ? v(rt)(b.concept) : v(dt)(b.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          a("span", go, [
            a("span", xo, N(C(b.concept)), 1),
            b.path.length ? (t(), r("span", vo, [
              (t(!0), r(te, null, ge(b.path, (u, _) => (t(), r(te, {
                key: u.id
              }, [
                _ ? (t(), r("span", fo, "/")) : R("", !0),
                se(N(u.label || u.id), 1)
              ], 64))), 128))
            ])) : R("", !0)
          ]),
          a("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((u) => p(u, b.concept), ["stop"])
          }, [
            $(v(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, bo),
          b.isFolder ? (t(), le(v(P), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, po))), 128)),
        i.results.length ? R("", !0) : (t(), r("li", ho, "No matches."))
      ])) : (t(), r("ul", mo, [
        (t(!0), r(te, null, ge(i.entries, (b) => (t(), r("li", {
          key: b.concept.id,
          class: we(["wn-item", { active: b.concept.id === i.selectedId, folder: b.isFolder }]),
          role: "option",
          tabindex: G(b.concept.id),
          onFocus: (u) => D.value = b.concept.id,
          onKeydown: (u) => K(u, b),
          "aria-selected": b.concept.id === i.selectedId,
          onClick: (u) => F(b),
          onContextmenu: Se((u) => c(u, b.concept), ["prevent"])
        }, [
          a("span", {
            class: "wn-ico",
            style: $e({ color: v(Te)(b.concept).fill })
          }, [
            $(v(P), {
              icon: b.isFolder ? v(rt)(b.concept) : v(dt)(b.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          a("span", wo, N(C(b.concept)), 1),
          b.isFolder ? (t(), r("span", yo, N(b.childCount), 1)) : R("", !0),
          a("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((u) => p(u, b.concept), ["stop"])
          }, [
            $(v(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, _o),
          b.isFolder ? (t(), le(v(P), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, ko))), 128)),
        i.entries.length ? R("", !0) : (t(), r("li", $o, "This level is empty."))
      ]))
    ]));
  }
}), Io = { class: "cn" }, Mo = { class: "wn-filter" }, zo = {
  class: "kc-rail-body",
  "aria-label": "Contents"
}, Rt = /* @__PURE__ */ Ce({
  __name: "ConceptNavRail",
  props: {
    concepts: {},
    edges: {},
    selectedId: {}
  },
  emits: ["select", "context"],
  setup(i, { emit: d }) {
    const e = i, o = d, p = S(() => $t(e.concepts, e.edges)), c = S(() => Gt(p.value)), I = O(""), h = O(""), m = S(() => c.value.byId.get(I.value)), C = S(() => I.value ? Zt(I.value, c.value.byId, c.value.parentOf) : []), F = S(() => Qt(m.value)), z = S(() => Jt(h.value, c.value.byId, c.value.parentOf));
    function D(b) {
      const u = c.value.byId.get(b);
      if (u && u.children.length) return b;
      const _ = c.value.parentOf.get(b);
      return _ || p.value[0]?.concept.id || b;
    }
    function B() {
      return p.value[0]?.concept.id || "";
    }
    function G(b) {
      const u = b ? D(b) : I.value || B();
      u && u !== I.value && (I.value = u);
    }
    function K(b) {
      I.value = b.id, h.value = "", o("select", b.id);
    }
    function E(b) {
      o("select", b.id);
    }
    function j() {
      const b = c.value.parentOf.get(I.value);
      b && (I.value = b, o("select", b));
    }
    return ue(() => e.selectedId, (b) => G(b), { immediate: !0 }), ue([() => c.value, I], () => {
      if (I.value && c.value.byId.has(I.value)) return;
      const b = e.selectedId ? D(e.selectedId) : B();
      b && (I.value = b);
    }, { immediate: !0 }), (b, u) => (t(), r("div", Io, [
      a("div", Mo, [
        $(v(P), {
          class: "wn-filter-ic",
          icon: "tabler:filter-search",
          "aria-hidden": "true"
        }),
        Le(a("input", {
          "onUpdate:modelValue": u[0] || (u[0] = (_) => h.value = _),
          class: "wn-filter-input",
          type: "text",
          placeholder: "Filter topics & pages…",
          "aria-label": "Filter the contents"
        }, null, 512), [
          [Ge, h.value]
        ]),
        h.value ? (t(), r("button", {
          key: 0,
          class: "wn-filter-x",
          "aria-label": "Clear filter",
          onClick: u[1] || (u[1] = (_) => h.value = "")
        }, [
          $(v(P), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : R("", !0)
      ]),
      a("nav", zo, [
        $(Co, {
          crumbs: C.value,
          entries: F.value,
          "selected-id": i.selectedId,
          query: h.value,
          results: z.value,
          onOpen: E,
          onEnter: K,
          onUp: j,
          onContext: u[2] || (u[2] = (_) => o("context", _))
        }, null, 8, ["crumbs", "entries", "selected-id", "query", "results"])
      ])
    ]));
  }
}), So = {
  key: 0,
  class: "kb-menu-title"
}, Ro = {
  key: 0,
  class: "kb-menu-sep",
  role: "separator"
}, Oo = ["disabled", "onClick"], Ot = /* @__PURE__ */ Ce({
  __name: "NodeMenu",
  props: {
    open: { type: Boolean },
    x: {},
    y: {},
    title: {},
    items: {}
  },
  emits: ["pick", "close"],
  setup(i, { emit: d }) {
    const e = i, o = d, p = S(() => {
      const m = e.items.filter((B) => !B.divider).length, C = e.items.filter((B) => B.divider).length, F = (e.title ? 30 : 0) + 10 + m * 34 + C * 9, z = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), D = Math.max(8, Math.min(e.y, window.innerHeight - F - 8));
      return { left: `${z}px`, top: `${D}px`, width: "224px" };
    });
    function c(h) {
      h.key === "Escape" && o("close");
    }
    lt(() => window.addEventListener("keydown", c)), Ze(() => window.removeEventListener("keydown", c));
    function I(h) {
      h.disabled || h.divider || (o("pick", h.id), o("close"));
    }
    return (h, m) => i.open ? (t(), r("div", {
      key: 0,
      class: "kb-menu-backdrop",
      onMousedown: m[2] || (m[2] = (C) => o("close")),
      onContextmenu: m[3] || (m[3] = Se((C) => o("close"), ["prevent"])),
      onWheel: m[4] || (m[4] = Se((C) => o("close"), ["prevent"]))
    }, [
      a("div", {
        class: "kb-menu",
        style: $e(p.value),
        role: "menu",
        onMousedown: m[0] || (m[0] = Se(() => {
        }, ["stop"])),
        onContextmenu: m[1] || (m[1] = Se(() => {
        }, ["prevent", "stop"]))
      }, [
        i.title ? (t(), r("div", So, N(i.title), 1)) : R("", !0),
        (t(!0), r(te, null, ge(i.items, (C, F) => (t(), r(te, {
          key: C.id + ":" + F
        }, [
          C.divider ? (t(), r("div", Ro)) : (t(), r("button", {
            key: 1,
            class: we(["kb-menu-item", { danger: C.danger, disabled: C.disabled }]),
            disabled: C.disabled,
            role: "menuitem",
            onClick: (z) => I(C)
          }, [
            C.icon ? (t(), le(v(P), {
              key: 0,
              icon: C.icon,
              class: "kb-menu-ic",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : R("", !0),
            a("span", null, N(C.label), 1)
          ], 10, Oo))
        ], 64))), 128))
      ], 36)
    ], 32)) : R("", !0);
  }
}), Tt = "kb10:wiki:navWidth", To = 220, Eo = 560;
function Et(i) {
  return Math.max(To, Math.min(Eo, i));
}
function Do() {
  const i = Number(localStorage.getItem(Tt));
  return Number.isFinite(i) && i > 0 ? Et(i) : 300;
}
function Dt() {
  const i = O(Do()), d = O(null), e = O(!1);
  function o(I) {
    const h = d.value;
    if (!h) return;
    const m = h.getBoundingClientRect();
    i.value = Et(I.clientX - m.left);
  }
  function p() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", p), localStorage.setItem(Tt, String(Math.round(i.value)));
  }
  function c(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", p);
  }
  return Ze(p), { navWidth: i, railRef: d, navDragging: e, onStart: c };
}
const Lo = { class: "kb-railtop" }, Fo = { class: "kb-railtop-acts" }, No = {
  key: 0,
  class: "kc-main-scroll"
}, Ao = {
  key: 1,
  class: "kc-main-scroll wk-doc-inner"
}, Bo = {
  key: 0,
  class: "wk-pagebar"
}, Uo = {
  key: 0,
  class: "wk-crumbs",
  "aria-label": "Wiki path"
}, Po = ["onClick"], Wo = {
  key: 1,
  class: "wk-tools"
}, Vo = /* @__PURE__ */ Ce({
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
  setup(i, { emit: d }) {
    const e = i, o = d, { navWidth: p, railRef: c, navDragging: I, onStart: h } = Dt(), m = S(() => {
      const A = /* @__PURE__ */ new Map();
      for (const k of e.concepts) A.set(k.id, k);
      return A;
    }), C = S(() => e.selectedId && m.value.get(e.selectedId) || null), F = S(() => !!C.value && C.value.node_type !== "document"), z = S(() => {
      const A = /* @__PURE__ */ new Map();
      for (const k of e.edges)
        (k.edge_type === "subtopic_of" || k.edge_type === "categorized_as") && m.value.has(k.from_node_id) && m.value.has(k.to_node_id) && A.set(k.from_node_id, k.to_node_id);
      return A;
    }), D = S(() => {
      const A = [];
      let k = e.selectedId;
      const V = /* @__PURE__ */ new Set();
      for (; k && !V.has(k); ) {
        V.add(k);
        const fe = m.value.get(k);
        if (!fe) break;
        A.unshift(fe), k = z.value.get(k);
      }
      return A.slice(0, -1).filter((fe) => !fe.is_root);
    }), B = O({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), G = S(() => {
      const A = B.value.concept;
      return A ? A.node_type === "document" ? [{ id: "open", label: "Open", icon: "tabler:arrow-right" }] : [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!A.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!A.is_root }
      ] : [];
    });
    function K(A) {
      B.value = { open: !0, x: A.x, y: A.y, concept: A.concept };
    }
    const E = O(null);
    function j() {
      if (!C.value) return;
      const k = E.value?.$el?.getBoundingClientRect();
      B.value = { open: !0, x: k ? k.right : 0, y: k ? k.bottom : 0, concept: C.value };
    }
    const b = O(""), u = O(null);
    function _(A) {
      const k = B.value.concept;
      if (k) {
        if (A === "open") {
          o("select", k.id);
          return;
        }
        u.value = k, b.value = A;
      }
    }
    function T(A) {
      b.value = "", A && o("select", A), o("changed");
    }
    const W = O(!1);
    function J(A) {
      const k = m.value.get(A.id) || (A.parent_id ? m.value.get(A.parent_id) : null);
      k && o("select", k.id), W.value = !1;
    }
    const ae = O("");
    function ce() {
      ae.value = "", o("changed");
    }
    return (A, k) => (t(), r("div", {
      ref_key: "railRef",
      ref: c,
      class: we(["wk", { "wk-dragging": v(I) }]),
      style: $e({ "--kb-nav-w": v(p) + "px" })
    }, [
      i.concepts.length ? (t(), le(v(Ct), { key: 0 }, {
        rail: me(() => [
          a("div", Lo, [
            a("div", Fo, [
              $(v(Oe), {
                icon: "tabler:search",
                label: "Search",
                active: W.value,
                onClick: k[0] || (k[0] = (V) => W.value = !W.value)
              }, null, 8, ["active"]),
              $(v(Oe), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: k[1] || (k[1] = (V) => ae.value = "add")
              }),
              $(v(Oe), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: i.loading,
                spin: i.loading,
                onClick: k[2] || (k[2] = (V) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Rt, {
            concepts: i.concepts,
            edges: i.edges,
            "selected-id": i.selectedId,
            onSelect: k[3] || (k[3] = (V) => o("select", V)),
            onContext: K
          }, null, 8, ["concepts", "edges", "selected-id"]),
          a("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: k[4] || (k[4] = //@ts-ignore
            (...V) => v(h) && v(h)(...V))
          }, [...k[11] || (k[11] = [
            a("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: me(() => [
          W.value ? (t(), r("div", No, [
            $(v(It), {
              "kb-id": i.kbId,
              layout: "panel",
              ask: i.canAnswer,
              placeholder: "Search this wiki…",
              onOpen: J,
              onClose: k[5] || (k[5] = (V) => W.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), r("div", Ao, [
            D.value.length || F.value ? (t(), r("div", Bo, [
              D.value.length ? (t(), r("nav", Uo, [
                (t(!0), r(te, null, ge(D.value, (V, fe) => (t(), r(te, {
                  key: V.id
                }, [
                  fe ? (t(), le(v(P), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : R("", !0),
                  a("button", {
                    class: "wk-crumb",
                    onClick: (xe) => o("select", V.id)
                  }, N(V.label || V.id), 9, Po)
                ], 64))), 128))
              ])) : R("", !0),
              F.value ? (t(), r("div", Wo, [
                $(v(Oe), {
                  ref_key: "structBtnRef",
                  ref: E,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!b.value,
                  onClick: j
                }, null, 8, ["active"])
              ])) : R("", !0)
            ])) : R("", !0),
            b.value ? (t(), le(St, {
              key: 1,
              "kb-id": i.kbId,
              mode: b.value,
              target: u.value,
              concepts: i.concepts,
              edges: i.edges,
              onSaved: T,
              onClose: k[6] || (k[6] = (V) => b.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0),
            $(qn, {
              "kb-id": i.kbId,
              concept: C.value,
              edges: i.edges,
              "concepts-by-id": m.value,
              onNavigate: k[7] || (k[7] = (V) => o("select", V.id))
            }, null, 8, ["kb-id", "concept", "edges", "concepts-by-id"])
          ]))
        ]),
        _: 1
      })) : (t(), le(Mt, {
        key: 1,
        icon: "tabler:book-2",
        title: "This wiki is empty",
        hint: "Add pages to grow it — concepts, their subtopics, and the links between them appear here as a navigable documentation tree.",
        cta: "Add the first page",
        "cta-icon": "tabler:plus",
        onCta: k[8] || (k[8] = (V) => ae.value = "add")
      })),
      $(v(Ye), {
        open: ae.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: k[9] || (k[9] = (V) => ae.value = "")
      }, {
        default: me(() => [
          $(zt, {
            "kb-id": i.kbId,
            noun: "page",
            onChanged: ce
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(Ot, {
        open: B.value.open,
        x: B.value.x,
        y: B.value.y,
        items: G.value,
        onPick: _,
        onClose: k[10] || (k[10] = (V) => B.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), jo = 0.81, ft = 144;
class Ho {
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
  constructor(d, e, o, p, c) {
    this.nodes = d, this.links = e, this.width = o, this.height = p, this.charge = c;
  }
  // One integration step. Returns true while still cooling.
  tick() {
    this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay;
    const d = this.alpha;
    return this.applyCharge(d), this.applyLinks(d), this.applyCenter(d), this.applyCollide(), this.integrate(), this.alpha >= this.alphaMin || this.alphaTarget > 0;
  }
  // ── Barnes-Hut many-body repulsion (O(n log n)) ──────────────────────────
  applyCharge(d) {
    const e = this.nodes, o = e.length;
    if (o < 2) return;
    let p = 1 / 0, c = 1 / 0, I = -1 / 0, h = -1 / 0;
    for (let z = 0; z < o; z++) {
      const D = e[z];
      D.x < p && (p = D.x), D.x > I && (I = D.x), D.y < c && (c = D.y), D.y > h && (h = D.y);
    }
    const m = Math.max(I - p, h - c, 1) + 1, C = { x0: p, y0: c, x1: p + m, y1: c + m, mass: 0, cx: 0, cy: 0, node: null, kids: null };
    for (let z = 0; z < o; z++) this.insert(C, e[z]);
    this.computeMass(C);
    const F = this.charge * d;
    for (let z = 0; z < o; z++) this.repel(e[z], C, F);
  }
  // Insert p into the subtree rooted at q, subdividing leaves as needed.
  insert(d, e) {
    for (; d.kids; ) d = this.kid(d, e);
    if (d.node === null) {
      d.node = e;
      return;
    }
    if (d.node === e) return;
    d.node.x === e.x && d.node.y === e.y && (e.x += (Math.random() - 0.5) * 0.5, e.y += (Math.random() - 0.5) * 0.5);
    const o = d.node;
    d.node = null, d.kids = [null, null, null, null], this.insert(this.kid(d, o), o), this.insert(this.kid(d, e), e);
  }
  // Return the child quad of q containing point p, creating it on demand.
  kid(d, e) {
    const o = (d.x0 + d.x1) / 2, p = (d.y0 + d.y1) / 2, c = e.x >= o, I = e.y >= p, h = (I ? 2 : 0) + (c ? 1 : 0);
    let m = d.kids[h];
    return m || (m = {
      x0: c ? o : d.x0,
      x1: c ? d.x1 : o,
      y0: I ? p : d.y0,
      y1: I ? d.y1 : p,
      mass: 0,
      cx: 0,
      cy: 0,
      node: null,
      kids: null
    }, d.kids[h] = m), m;
  }
  computeMass(d) {
    if (!d.kids) {
      d.node && (d.mass = 1, d.cx = d.node.x, d.cy = d.node.y);
      return;
    }
    let e = 0, o = 0, p = 0;
    for (const c of d.kids)
      c && (this.computeMass(c), c.mass !== 0 && (e += c.mass, o += c.cx * c.mass, p += c.cy * c.mass));
    d.mass = e, e > 0 && (d.cx = o / e, d.cy = p / e);
  }
  repel(d, e, o) {
    if (e.mass === 0 || e.node === d) return;
    let p = e.cx - d.x, c = e.cy - d.y, I = p * p + c * c;
    I === 0 && (p = (Math.random() - 0.5) * 0.01, c = (Math.random() - 0.5) * 0.01, I = p * p + c * c);
    const h = e.x1 - e.x0;
    if (!e.kids || h * h / I < jo) {
      const m = I < ft ? ft : I, C = Math.sqrt(I), F = o * e.mass / m;
      d.vx -= p / C * F, d.vy -= c / C * F;
      return;
    }
    for (const m of e.kids) m && this.repel(d, m, o);
  }
  applyLinks(d) {
    for (const e of this.links) {
      const o = this.nodes[e.source], p = this.nodes[e.target];
      if (!o || !p) continue;
      const c = p.x - o.x, I = p.y - o.y, h = Math.sqrt(c * c + I * I) || 1e-6, m = (h - e.distance) / h * d * e.strength, C = c * m, F = I * m;
      o.vx += C * 0.5, o.vy += F * 0.5, p.vx -= C * 0.5, p.vy -= F * 0.5;
    }
  }
  applyCenter(d) {
    const e = this.width / 2, o = this.height / 2;
    for (const p of this.nodes)
      p.vx += (e - p.x) * this.centerStrength * d, p.vy += (o - p.y) * this.centerStrength * d;
  }
  // ── Collision via uniform spatial grid (O(n) average) ────────────────────
  applyCollide() {
    const d = this.nodes, e = d.length;
    if (e < 2) return;
    let o = 0;
    for (let h = 0; h < e; h++) d[h].radius > o && (o = d[h].radius);
    const p = o * 2 + 52, c = /* @__PURE__ */ new Map(), I = (h, m) => h * 73856093 ^ m * 19349663;
    for (let h = 0; h < e; h++) {
      const m = Math.floor(d[h].x / p), C = Math.floor(d[h].y / p), F = I(m, C), z = c.get(F);
      z ? z.push(h) : c.set(F, [h]);
    }
    for (let h = 0; h < e; h++) {
      const m = d[h], C = Math.floor(m.x / p), F = Math.floor(m.y / p);
      for (let z = -1; z <= 1; z++) for (let D = -1; D <= 1; D++) {
        const B = c.get(I(C + z, F + D));
        if (B)
          for (const G of B) {
            if (G <= h) continue;
            const K = d[G], E = K.x - m.x, j = K.y - m.y, b = m.radius + K.radius + 44, u = E * E + j * j;
            if (u < b * b && u > 0) {
              const _ = Math.sqrt(u), T = (b - _) / _ * 0.5, W = E * T, J = j * T;
              m.x -= W, m.y -= J, K.x += W, K.y += J;
            }
          }
      }
    }
  }
  integrate() {
    const d = this.width / 2, e = this.height / 2, o = Math.max(this.width, this.height) * 2 + 1500, p = this.maxVelocity * (1 + this.alpha * 8);
    for (const c of this.nodes)
      c.fx != null ? (c.x = c.fx, c.vx = 0) : (c.vx *= this.velocityDecay, c.vx > p ? c.vx = p : c.vx < -p && (c.vx = -p), c.x += c.vx), c.fy != null ? (c.y = c.fy, c.vy = 0) : (c.vy *= this.velocityDecay, c.vy > p ? c.vy = p : c.vy < -p && (c.vy = -p), c.y += c.vy), Number.isFinite(c.x) || (c.x = d, c.vx = 0), Number.isFinite(c.y) || (c.y = e, c.vy = 0), c.x = Math.max(d - o, Math.min(d + o, c.x)), c.y = Math.max(e - o, Math.min(e + o, c.y));
  }
  // A final, spring-free separation pass: run the collision grid repeatedly to push
  // apart any residual node overlap the cooled simulation left behind. Independent of
  // alpha and with nothing pulling nodes back together, so even a dense seed/cluster
  // ends up cleanly spaced. Cheap (O(n) per iteration).
  resolveOverlaps(d = 60) {
    for (let e = 0; e < d; e++) this.applyCollide();
  }
  // Re-energize the layout to a one-off alpha that then cools to alphaTarget.
  reheat(d = 0.3) {
    this.alpha < d && (this.alpha = d), this.alphaTarget = 0;
  }
  // Hold the layout gently "warm" at a low alpha — used during a drag so only a
  // light, continuous relaxation follows the cursor instead of a full reheat that
  // shakes the whole graph. Pair with settle() on release to cool back down.
  warm(d = 0.1) {
    this.alphaTarget = d, this.alpha < d && (this.alpha = d);
  }
  // Stop holding warm and let the layout cool to rest.
  settle() {
    this.alphaTarget = 0;
  }
}
const Xo = ["transform"], Yo = { class: "gx-links" }, Ko = ["d"], Go = { class: "gx-nodes" }, Zo = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Qo = ["r"], Jo = ["fill", "stroke"], qo = ["r", "fill", "stroke", "stroke-width"], ea = ["cx", "cy"], ta = ["x", "y"], na = ["y"], oa = /* @__PURE__ */ Ce({
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
  setup(i, { expose: d, emit: e }) {
    const o = i;
    function p(x) {
      return !o.visibleIds || o.visibleIds.has(x);
    }
    function c(x) {
      return o.colors?.get(x.id) || Te(x);
    }
    const I = e, h = O(null), m = O(null), C = O(0), F = O(0), z = O(1), D = O(!1);
    ue(z, (x) => I("scale", x));
    const B = O([]), G = O([]);
    let K = null, E = null, j = 0, b = "";
    const u = /* @__PURE__ */ new Map(), _ = O(null), T = S(() => o.concepts.length > 220), W = S(() => {
      if (o.highlightIds.size) return new Set(o.highlightIds);
      if (_.value) {
        const x = /* @__PURE__ */ new Set([_.value]);
        for (const M of G.value)
          M.from === _.value && x.add(M.to), M.to === _.value && x.add(M.from);
        return x;
      }
      return null;
    });
    function J(x) {
      if (x.node_type === "document") return 8;
      if (x.is_root) return 22;
      const M = (x.edge_count || 0) + (x.document_count || 0);
      return Math.max(11, Math.min(24, 11 + M * 2));
    }
    function ae() {
      const x = m.value?.getBoundingClientRect();
      return { w: x?.width || 900, h: x?.height || 640 };
    }
    function ce() {
      return o.concepts.map((x) => x.id).join("|");
    }
    function A(x, M) {
      const y = o.concepts, X = new Map(y.map((g) => [g.id, g])), ee = /* @__PURE__ */ new Map(), Y = /* @__PURE__ */ new Set();
      for (const g of o.edges) {
        if (g.edge_type !== "subtopic_of" && g.edge_type !== "categorized_as" || !X.has(g.from_node_id) || !X.has(g.to_node_id)) continue;
        const Q = ee.get(g.to_node_id) || [];
        Q.push(g.from_node_id), ee.set(g.to_node_id, Q), Y.add(g.from_node_id);
      }
      const he = y.filter((g) => g.is_root || !Y.has(g.id)).map((g) => g.id), pe = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Set(), re = (g) => {
        const Q = pe.get(g);
        if (Q !== void 0) return Q;
        if (ke.has(g)) return 1;
        ke.add(g);
        const ie = ee.get(g) || [];
        let ve = ie.length ? 0 : 1;
        for (const De of ie) ve += re(De);
        return ve = Math.max(1, ve), pe.set(g, ve), ve;
      };
      for (const g of he) re(g);
      const de = 150, _e = /* @__PURE__ */ new Map(), ze = /* @__PURE__ */ new Set(), Ne = /* @__PURE__ */ new Set();
      let Ae = 0;
      const l = (g, Q, ie, ve) => {
        if (Ne.has(g)) return;
        Ne.add(g), ze.add(g);
        const De = (ie + ve) / 2, We = Q * de, st = Ae++ * 2.399963;
        _e.set(g, { x: x + We * Math.cos(De) + Math.cos(st) * 4, y: M + We * Math.sin(De) + Math.sin(st) * 4 });
        const tt = ee.get(g) || [];
        if (!tt.length) return;
        const Lt = tt.reduce((je, He) => je + re(He), 0) || 1;
        let nt = ie;
        for (const je of tt) {
          const He = (ve - ie) * (re(je) / Lt);
          l(je, Q + 1, nt, nt + He), nt += He;
        }
      };
      if (he.length === 1)
        l(he[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const g = he.reduce((ie, ve) => ie + re(ve), 0) || 1;
        let Q = -Math.PI / 2;
        for (const ie of he) {
          const ve = Math.PI * 2 * (re(ie) / g);
          l(ie, 1, Q, Q + ve), Q += ve;
        }
      }
      const n = y.filter((g) => !ze.has(g.id));
      if (n.length) {
        let g = de;
        for (const Q of _e.values()) {
          const ie = Math.hypot(Q.x - x, Q.y - M);
          ie > g && (g = ie);
        }
        n.forEach((Q, ie) => {
          const ve = ie / n.length * Math.PI * 2;
          _e.set(Q.id, { x: x + (g + de) * Math.cos(ve), y: M + (g + de) * Math.sin(ve) });
        });
      }
      return _e;
    }
    function k() {
      const { w: x, h: M } = ae(), y = x / 2, X = M / 2, ee = o.concepts, Y = ee.length, he = A(y, X);
      if (Y < 3) return he;
      const pe = /* @__PURE__ */ new Map();
      ee.forEach((l, n) => pe.set(l.id, n));
      const ke = ee.map((l) => {
        const n = he.get(l.id) || { x: y, y: X };
        return { id: l.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: J(l) };
      }), re = Y > 250 ? 150 : 120, de = Y > 250 ? -1100 : -700, _e = o.edges.filter((l) => pe.has(l.from_node_id) && pe.has(l.to_node_id)).map((l) => ({
        source: pe.get(l.from_node_id),
        target: pe.get(l.to_node_id),
        distance: l.edge_type === "subtopic_of" ? re * 0.8 : re,
        strength: l.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), ze = new Ho(ke, _e, x, M, de), Ne = Y > 600 ? 70 : Y > 250 ? 110 : 150;
      for (let l = 0; l < Ne; l++) ze.tick();
      ze.resolveOverlaps(Y > 600 ? 50 : 80);
      const Ae = /* @__PURE__ */ new Map();
      for (const l of ke) Ae.set(l.id, { x: l.x, y: l.y });
      return Ae;
    }
    function V(x) {
      const { w: M, h: y } = ae();
      if ((M < 2 || y < 2) && j < 60) {
        j++, requestAnimationFrame(() => V(x));
        return;
      }
      j = 0;
      const X = k();
      u.clear();
      for (const [ee, Y] of X) u.set(ee, Y);
      be(), x && (ye(), requestAnimationFrame(() => ye())), D.value = !0;
    }
    function fe() {
      b = ce(), V(!0);
    }
    function xe() {
      if (!o.concepts.length) {
        B.value = [], G.value = [], D.value = !1, b = "", u.clear();
        return;
      }
      const x = ce();
      if (x === b) {
        be();
        return;
      }
      const M = !b;
      b = x, at(() => V(M));
    }
    function be() {
      B.value = o.concepts.filter((x) => p(x.id)).map((x) => {
        const M = u.get(x.id) || { x: 0, y: 0 };
        return { id: x.id, x: M.x, y: M.y, radius: J(x), concept: x, isDoc: x.node_type === "document" };
      }), G.value = o.edges.filter((x) => u.has(x.from_node_id) && u.has(x.to_node_id) && p(x.from_node_id) && p(x.to_node_id)).map((x) => {
        const M = u.get(x.from_node_id), y = u.get(x.to_node_id), X = (M.x + y.x) / 2, ee = (M.y + y.y) / 2, Y = y.x - M.x, he = y.y - M.y, pe = Math.hypot(Y, he) || 1, ke = Math.min(28, pe * 0.12), re = X - he / pe * ke, de = ee + Y / pe * ke;
        return {
          id: x.id,
          path: `M${M.x},${M.y} Q${re},${de} ${y.x},${y.y}`,
          edge_type: x.edge_type || "",
          from: x.from_node_id,
          to: x.to_node_id
        };
      });
    }
    function ye() {
      if (!u.size) return;
      const { w: x, h: M } = ae();
      let y = 1 / 0, X = 1 / 0, ee = -1 / 0, Y = -1 / 0;
      for (const de of o.concepts) {
        if (!p(de.id)) continue;
        const _e = u.get(de.id);
        if (!_e) continue;
        const ze = J(de);
        y = Math.min(y, _e.x - ze), X = Math.min(X, _e.y - ze), ee = Math.max(ee, _e.x + ze), Y = Math.max(Y, _e.y + ze);
      }
      if (!Number.isFinite(y)) return;
      const he = Math.max(64, Math.min(x, M) * 0.12);
      y -= he, X -= he, ee += he, Y += he;
      const pe = Math.max(ee - y, 1), ke = Math.max(Y - X, 1), re = Math.max(0.25, Math.min(x / pe, M / ke, 1.25));
      z.value = re, C.value = (x - pe * re) / 2 - y * re, F.value = (M - ke * re) / 2 - X * re;
    }
    function L(x) {
      const M = u.get(x);
      if (!M) return;
      const { w: y, h: X } = ae(), ee = Math.max(z.value, 1.1);
      z.value = ee, C.value = y / 2 - M.x * ee, F.value = X / 2 - M.y * ee;
    }
    let oe = !1, ne = !1, s = { x: 0, y: 0, tx: 0, ty: 0 };
    function w(x) {
      x.preventDefault();
      const M = h.value.getBoundingClientRect(), y = x.clientX - M.left, X = x.clientY - M.top, ee = x.deltaY < 0 ? 1.12 : 1 / 1.12, Y = Math.max(0.1, Math.min(6, z.value * ee));
      C.value = y - (y - C.value) * (Y / z.value), F.value = X - (X - F.value) * (Y / z.value), z.value = Y;
    }
    function f(x) {
      x.button === 0 && (oe = !0, ne = !1, s = { x: x.clientX, y: x.clientY, tx: C.value, ty: F.value }, window.addEventListener("mousemove", U), window.addEventListener("mouseup", H));
    }
    function U(x) {
      oe && (Math.abs(x.clientX - s.x) + Math.abs(x.clientY - s.y) > 3 && (ne = !0), C.value = s.tx + (x.clientX - s.x), F.value = s.ty + (x.clientY - s.y));
    }
    function H() {
      oe && !ne && I("select", null), oe = !1, window.removeEventListener("mousemove", U), window.removeEventListener("mouseup", H);
    }
    let q = null, Z = !1, Re = 0, Ue = 0;
    function Qe(x, M) {
      x.button === 0 && (x.stopPropagation(), u.has(M) && (q = M, Z = !1, Re = x.clientX, Ue = x.clientY, window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", Fe)));
    }
    function Pe(x) {
      if (!q || !h.value) return;
      if (!Z) {
        const ee = x.clientX - Re, Y = x.clientY - Ue;
        if (ee * ee + Y * Y < 9) return;
        Z = !0;
      }
      const M = h.value.getBoundingClientRect(), y = (x.clientX - M.left - C.value) / z.value, X = (x.clientY - M.top - F.value) / z.value;
      Number.isFinite(y) && Number.isFinite(X) && (u.set(q, { x: y, y: X }), be());
    }
    let Me = 0;
    function Fe() {
      const x = q, M = Z;
      if (q = null, window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Fe), M || !x) return;
      const y = Date.now();
      if (y - Me < 350) {
        Me = 0;
        return;
      }
      Me = y, I("select", o.selectedId === x ? null : x);
    }
    function Je(x) {
      const { w: M, h: y } = ae(), X = Math.max(0.1, Math.min(6, z.value * x));
      C.value = M / 2 - (M / 2 - C.value) * (X / z.value), F.value = y / 2 - (y / 2 - F.value) * (X / z.value), z.value = X;
    }
    function qe(x) {
      return !!W.value && !W.value.has(x);
    }
    function Ee(x) {
      const M = ["gx-link"];
      x.edge_type === "subtopic_of" ? M.push("subtopic") : M.push("categorized");
      const y = W.value;
      return y && (y.has(x.from) && y.has(x.to) ? M.push("lit") : M.push("faded")), M;
    }
    function et(x) {
      return !T.value || x.concept.is_root || x.id === o.selectedId || x.id === _.value;
    }
    return ue(
      () => [o.concepts, o.edges],
      () => xe(),
      { immediate: !0, deep: !1 }
    ), ue(() => o.visibleIds, () => {
      b && be();
    }), ue(m, (x) => {
      x && !K && (K = new ResizeObserver(() => {
        o.concepts.length && (E && clearTimeout(E), E = setTimeout(() => {
          b && ye();
        }, 120));
      }), K.observe(x)), x && o.concepts.length && !b && xe();
    }), Pt(() => {
      K?.disconnect(), E && clearTimeout(E), H(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Fe);
    }), d({ fit: ye, focus: L, zoomBy: Je, relayout: fe }), (x, M) => (t(), r("div", {
      ref_key: "containerRef",
      ref: m,
      class: "gx-canvas"
    }, [
      (t(), r("svg", {
        ref_key: "svgRef",
        ref: h,
        class: "gx-svg",
        onWheel: w,
        onMousedown: f,
        onContextmenu: M[1] || (M[1] = Se(() => {
        }, ["prevent"]))
      }, [
        M[2] || (M[2] = a("defs", null, [
          a("pattern", {
            id: "gx-grid",
            width: "26",
            height: "26",
            patternUnits: "userSpaceOnUse"
          }, [
            a("circle", {
              cx: "1",
              cy: "1",
              r: "1",
              class: "gx-grid-dot"
            })
          ])
        ], -1)),
        M[3] || (M[3] = a("rect", {
          class: "gx-grid-bg",
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
          fill: "url(#gx-grid)"
        }, null, -1)),
        a("g", {
          transform: `translate(${C.value},${F.value}) scale(${z.value})`,
          style: $e({ opacity: D.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          a("g", Yo, [
            (t(!0), r(te, null, ge(G.value, (y) => (t(), r("path", {
              key: y.id,
              d: y.path,
              class: we(Ee(y))
            }, null, 10, Ko))), 128))
          ]),
          a("g", Go, [
            (t(!0), r(te, null, ge(B.value, (y) => (t(), r("g", {
              key: y.id,
              transform: `translate(${y.x},${y.y})`,
              class: we(["gx-node", { dim: qe(y.id), sel: y.id === i.selectedId, hov: y.id === _.value }]),
              onMousedown: (X) => Qe(X, y.id),
              onMouseenter: (X) => _.value = y.id,
              onMouseleave: M[0] || (M[0] = (X) => _.value = null),
              onContextmenu: Se((X) => I("node-context", { id: y.id, x: X.clientX, y: X.clientY }), ["prevent", "stop"]),
              onDblclick: Se((X) => I("node-dblclick", y.id), ["stop"])
            }, [
              y.id === i.selectedId ? (t(), r("circle", {
                key: 0,
                r: y.radius + 7,
                class: "gx-halo",
                style: $e({ stroke: c(y.concept).fill })
              }, null, 12, Qo)) : R("", !0),
              y.isDoc ? (t(), r("rect", {
                key: 1,
                x: -8,
                y: -6,
                width: "16",
                height: "12",
                rx: "3",
                fill: c(y.concept).fill,
                stroke: c(y.concept).stroke,
                "stroke-width": "1.5",
                class: "gx-shape"
              }, null, 8, Jo)) : (t(), r("circle", {
                key: 2,
                r: y.radius,
                fill: c(y.concept).fill,
                stroke: c(y.concept).stroke,
                "stroke-width": y.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, qo)),
              !y.isDoc && (y.concept.document_count || 0) > 0 ? (t(), r(te, { key: 3 }, [
                a("circle", {
                  cx: y.radius * 0.72,
                  cy: -y.radius * 0.72,
                  r: "7.5",
                  class: "gx-badge-bg"
                }, null, 8, ea),
                a("text", {
                  x: y.radius * 0.72,
                  y: -y.radius * 0.72,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  class: "gx-badge-txt"
                }, N(y.concept.document_count), 9, ta)
              ], 64)) : R("", !0),
              et(y) ? (t(), r("text", {
                key: 4,
                y: y.isDoc ? 20 : y.radius + 15,
                "text-anchor": "middle",
                class: we(["gx-label", { root: y.concept.is_root }])
              }, N(v(qt)(y.concept.label, y.isDoc ? 26 : 24)), 11, na)) : R("", !0)
            ], 42, Zo))), 128))
          ])
        ], 12, Xo)
      ], 544))
    ], 512));
  }
}), aa = { class: "gx-ins-id" }, ia = { class: "gx-ins-name" }, ra = { class: "gx-ins-body" }, la = { class: "gx-ins-stats" }, sa = {
  key: 0,
  class: "gx-stat"
}, ca = {
  key: 1,
  class: "gx-stat"
}, da = {
  key: 1,
  class: "gx-rel-group"
}, ua = { class: "gx-rel-title" }, pa = { class: "kc-refs" }, ga = ["onClick"], xa = { class: "kc-ref-label" }, va = {
  key: 0,
  class: "gx-rel-group"
}, fa = { class: "gx-rel-title" }, ba = ["onClick"], ha = { class: "gx-rel-kind" }, ma = { class: "gx-rel-label" }, ka = {
  key: 1,
  class: "gx-rel-group"
}, wa = { class: "gx-rel-title" }, ya = ["onClick"], _a = { class: "gx-rel-kind" }, $a = { class: "gx-rel-label" }, Ca = {
  key: 3,
  class: "gx-ins-loading"
}, Ia = {
  key: 4,
  class: "gx-ins-content"
}, Ma = {
  key: 0,
  class: "gx-ins-doc-t"
}, za = ["content-type", "source"], Sa = {
  key: 0,
  class: "gx-ins-clamp-fade",
  "aria-hidden": "true"
}, Ra = ["aria-expanded"], Oa = {
  key: 5,
  class: "gx-ins-empty"
}, bt = "kb10:inspect:width", Ta = 320, Ea = 860, Da = 560, La = /* @__PURE__ */ Ce({
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
  setup(i, { emit: d }) {
    const e = i, o = d, p = S(() => e.colorOf?.(e.concept.id) || Te(e.concept).fill);
    function c(s) {
      return e.colorOf?.(s) || Te({}).fill;
    }
    const I = S(() => e.concept.node_type === "document"), h = S(() => e.edges.filter((s) => s.from_node_id === e.concept.id).map((s) => ({ id: s.id, kind: ut[s.edge_type || ""] || s.edge_type || "related", otherId: s.to_node_id, label: s.to_label || e.labelOf(s.to_node_id) }))), m = S(() => e.edges.filter((s) => s.to_node_id === e.concept.id).map((s) => ({ id: s.id, kind: ut[s.edge_type || ""] || s.edge_type || "related", otherId: s.from_node_id, label: s.from_label || e.labelOf(s.from_node_id) }))), C = S(() => h.value.length + m.value.length), F = S(() => I.value ? en(e.concept.id, e.edges).map((s) => ({ id: s.id, label: s.label || e.labelOf(s.id) })) : []), z = S(() => {
      if (I.value) return [e.concept.id];
      const s = [];
      for (const w of e.edges)
        w.edge_type === "categorized_as" && w.to_node_id === e.concept.id && s.push(w.from_node_id);
      return s;
    }), D = O(!1), B = O([]), G = O(""), K = S(() => B.value.find((s) => _t(s.origMime)) || null), E = S(() => G.value ? { text: G.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function j(s) {
      try {
        const { data: w } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(s)}`);
        if (!w?.success || !w.node) return null;
        const f = w.node, U = String(f.content || "");
        if (!U.trim()) return null;
        const H = f.metadata || {}, q = String(H.original_mime_type || H.source_mime || ""), Z = !!yt(H);
        return {
          id: s,
          title: H.title || H.filename || H.original_filename || e.labelOf(s),
          content: U,
          contentType: f.content_type || "text/markdown",
          origMime: Z ? q : "",
          sourceUrl: `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(s)}/source`
        };
      } catch {
        return null;
      }
    }
    async function b(s) {
      try {
        const { data: w } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(s)}&include_content=true&limit=200`);
        if (!w?.success) return "";
        const f = w.nodes?.find((U) => U.node_type === "summary");
        return String(f?.content || "");
      } catch {
        return "";
      }
    }
    let u = 0;
    async function _() {
      const s = ++u;
      B.value = [], G.value = "", xe.value = !1, be.value = !1;
      const w = z.value;
      if (w.length) {
        D.value = !0;
        try {
          const f = await Promise.all(w.map(j));
          if (s !== u) return;
          if (B.value = f.filter((U) => U != null), I.value) {
            const U = await b(e.concept.id);
            if (s !== u) return;
            G.value = U;
          }
        } finally {
          s === u && (D.value = !1);
        }
      }
    }
    ue(K, (s) => {
      o("original-available", s ? { contentType: s.origMime, sourceUrl: s.sourceUrl, title: s.title } : null);
    }, { immediate: !0 });
    function T(s) {
      return Math.max(Ta, Math.min(Ea, s));
    }
    function W() {
      const s = Number(localStorage.getItem(bt));
      return Number.isFinite(s) && s > 0 ? T(s) : 430;
    }
    const J = O(W()), ae = O(null), ce = O(!1);
    function A(s) {
      const w = ae.value;
      if (!w) return;
      const f = w.getBoundingClientRect();
      J.value = T(f.right - s.clientX);
    }
    function k() {
      ce.value = !1, window.removeEventListener("pointermove", A), window.removeEventListener("pointerup", k), localStorage.setItem(bt, String(Math.round(J.value)));
    }
    function V(s) {
      s.preventDefault(), ce.value = !0, window.addEventListener("pointermove", A), window.addEventListener("pointerup", k);
    }
    const fe = O(null), xe = O(!1), be = O(!1);
    function ye() {
      const s = fe.value;
      if (!s) {
        be.value = !1;
        return;
      }
      be.value = s.scrollHeight - Da > 24;
    }
    let L = null;
    function oe() {
      L?.disconnect();
      const s = fe.value;
      s && (L = new ResizeObserver(() => ye()), L.observe(s), at(ye));
    }
    const ne = S(() => be.value && !xe.value);
    return ue([B, D], () => {
      D.value || at(oe);
    }), ue(() => e.concept.id, _, { immediate: !0 }), Ze(() => {
      L?.disconnect(), k();
    }), (s, w) => (t(), r("aside", {
      ref_key: "asideRef",
      ref: ae,
      class: we(["gx-inspect", { dragging: ce.value }]),
      style: $e({ width: J.value + "px" })
    }, [
      a("div", {
        class: "gx-ins-resizer",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize inspector",
        onPointerdown: V
      }, [...w[3] || (w[3] = [
        a("span", { class: "gx-ins-resizer-grip" }, null, -1)
      ])], 32),
      a("header", {
        class: "gx-ins-h",
        style: $e({ "--accent": p.value })
      }, [
        w[4] || (w[4] = a("span", { class: "gx-ins-dot" }, null, -1)),
        a("div", aa, [
          a("h3", ia, N(i.concept.label), 1),
          K.value ? (t(), le(v(mt), {
            key: 0,
            class: we(["gx-ins-orig-btn", { on: i.originalOpen }]),
            label: i.originalOpen ? "Hide original" : "View original",
            onOpen: w[0] || (w[0] = (f) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : R("", !0)
        ]),
        a("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: w[1] || (w[1] = (f) => o("close"))
        }, [
          $(v(P), { icon: "tabler:x" })
        ])
      ], 4),
      a("div", ra, [
        a("div", la, [
          i.concept.document_count ? (t(), r("div", sa, [
            $(v(P), { icon: "tabler:files" }),
            a("span", null, N(i.concept.document_count) + " linked", 1)
          ])) : R("", !0),
          C.value ? (t(), r("div", ca, [
            $(v(P), { icon: "tabler:arrows-split-2" }),
            w[5] || (w[5] = a("span", null, "relations", -1)),
            $(v(rn), { value: C.value }, null, 8, ["value"])
          ])) : R("", !0)
        ]),
        E.value ? (t(), le(v(kt), {
          key: i.concept.id,
          icon: E.value.icon,
          label: E.value.label,
          text: E.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : R("", !0),
        F.value.length ? (t(), r("section", da, [
          a("div", ua, [
            $(v(P), { icon: "tabler:link" }),
            w[6] || (w[6] = se("Filed under", -1))
          ]),
          a("div", pa, [
            (t(!0), r(te, null, ge(F.value, (f) => (t(), r("button", {
              key: f.id,
              class: "kc-ref",
              onClick: (U) => o("select", f.id)
            }, [
              a("span", {
                class: "kc-ref-dot",
                style: $e({ background: c(f.id) })
              }, null, 4),
              a("span", xa, N(f.label), 1),
              $(v(P), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, ga))), 128))
          ])
        ])) : R("", !0),
        I.value ? R("", !0) : (t(), r(te, { key: 2 }, [
          h.value.length ? (t(), r("section", va, [
            a("div", fa, [
              $(v(P), { icon: "tabler:arrow-up-right" }),
              w[7] || (w[7] = se("Relates to", -1))
            ]),
            (t(!0), r(te, null, ge(h.value, (f) => (t(), r("button", {
              key: f.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", f.otherId)
            }, [
              a("span", ha, N(f.kind), 1),
              a("span", ma, N(f.label), 1),
              $(v(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, ba))), 128))
          ])) : R("", !0),
          m.value.length ? (t(), r("section", ka, [
            a("div", wa, [
              $(v(P), { icon: "tabler:arrow-down-left" }),
              w[8] || (w[8] = se("Referenced by", -1))
            ]),
            (t(!0), r(te, null, ge(m.value, (f) => (t(), r("button", {
              key: f.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", f.otherId)
            }, [
              a("span", _a, N(f.kind), 1),
              a("span", $a, N(f.label), 1),
              $(v(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, ya))), 128))
          ])) : R("", !0)
        ], 64)),
        D.value ? (t(), r("div", Ca, [
          $(v(P), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          w[9] || (w[9] = a("span", null, "Loading content…", -1))
        ])) : B.value.length ? (t(), r("section", Ia, [
          a("div", {
            class: we(["gx-ins-clamp", { clamped: ne.value }])
          }, [
            a("div", {
              ref_key: "contentRef",
              ref: fe,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), r(te, null, ge(B.value, (f) => (t(), r("div", {
                key: f.id,
                class: "gx-ins-doc"
              }, [
                B.value.length > 1 ? (t(), r("div", Ma, N(f.title), 1)) : R("", !0),
                a("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": f.contentType,
                  source: f.content
                }, null, 8, za)
              ]))), 128))
            ], 512),
            ne.value ? (t(), r("div", Sa)) : R("", !0)
          ], 2),
          be.value ? (t(), r("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": xe.value,
            onClick: w[2] || (w[2] = (f) => xe.value = !xe.value)
          }, [
            $(v(P), {
              icon: xe.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            se(" " + N(xe.value ? "Show less" : "Show more"), 1)
          ], 8, Ra)) : R("", !0)
        ])) : R("", !0),
        !D.value && !E.value && !B.value.length && !F.value.length && !h.value.length && !m.value.length ? (t(), r("div", Oa, [
          $(v(P), { icon: "tabler:circle-dashed" }),
          w[10] || (w[10] = a("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : R("", !0)
      ])
    ], 6));
  }
}), Fa = ["aria-label", "aria-expanded", "title"], Na = { key: 0 }, Aa = {
  key: 0,
  class: "gx-legend-body"
}, Ba = { class: "gx-legend-row" }, Ua = { class: "gx-legend-row" }, Pa = /* @__PURE__ */ Ce({
  __name: "GraphLegend",
  setup(i) {
    const d = O(!1);
    return (e, o) => (t(), r("div", {
      class: we(["gx-legend", { collapsed: !d.value }])
    }, [
      a("button", {
        type: "button",
        class: "gx-legend-toggle",
        "aria-label": d.value ? "Hide legend" : "Show legend",
        "aria-expanded": d.value,
        title: d.value ? "Hide legend" : "Show legend",
        onClick: o[0] || (o[0] = (p) => d.value = !d.value)
      }, [
        $(v(P), {
          icon: d.value ? "tabler:chevron-down" : "tabler:list-details"
        }, null, 8, ["icon"]),
        d.value ? R("", !0) : (t(), r("span", Na, "Legend"))
      ], 8, Fa),
      d.value ? (t(), r("div", Aa, [
        o[3] || (o[3] = a("div", { class: "gx-legend-row" }, [
          a("span", { class: "gx-legend-mark gx-legend-cluster" }),
          se(" Color = topic cluster ")
        ], -1)),
        a("div", Ba, [
          a("span", {
            class: "gx-legend-mark",
            style: $e({ background: v(pt).root.fill })
          }, null, 4),
          o[1] || (o[1] = se(" Root concept ", -1))
        ]),
        a("div", Ua, [
          a("span", {
            class: "gx-legend-mark doc",
            style: $e({ background: v(pt).document.fill })
          }, null, 4),
          o[2] || (o[2] = se(" Source document ", -1))
        ]),
        o[4] || (o[4] = Wt('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : R("", !0)
    ], 2));
  }
}), Wa = { class: "gx-controls" }, Va = { class: "gx-ctrl-read" }, ja = /* @__PURE__ */ Ce({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(i, { emit: d }) {
    const e = d;
    return (o, p) => (t(), r("div", Wa, [
      a("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: p[0] || (p[0] = (c) => e("zoom-in"))
      }, [
        $(v(P), { icon: "tabler:plus" })
      ]),
      a("div", Va, N(Math.round(i.scale * 100)) + "%", 1),
      a("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom out",
        "aria-label": "Zoom out",
        onClick: p[1] || (p[1] = (c) => e("zoom-out"))
      }, [
        $(v(P), { icon: "tabler:minus" })
      ]),
      a("button", {
        class: "gx-ctrl fit",
        type: "button",
        title: "Fit to view",
        "aria-label": "Fit to view",
        onClick: p[2] || (p[2] = (c) => e("fit"))
      }, [
        $(v(P), { icon: "tabler:focus-centered" })
      ])
    ]));
  }
}), Ha = { class: "gx-display" }, Xa = ["title"], Ya = ["max", "value"], Ka = { class: "gx-display-lvl" }, Ga = { class: "gx-display-lvl-max" }, Za = ["aria-checked", "title"], Qa = /* @__PURE__ */ Ce({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(i, { emit: d }) {
    const e = d;
    return (o, p) => (t(), r("div", Ha, [
      i.maxLevel > 1 ? (t(), r("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${i.level} of ${i.maxLevel} levels`
      }, [
        $(v(P), {
          class: "gx-display-ic",
          icon: "tabler:stack-2",
          "aria-hidden": "true"
        }),
        a("input", {
          class: "gx-range",
          type: "range",
          min: "1",
          max: i.maxLevel,
          value: i.level,
          "aria-label": "Graph depth",
          onInput: p[0] || (p[0] = (c) => e("update:level", Number(c.target.value)))
        }, null, 40, Ya),
        a("span", Ka, [
          se(N(i.level), 1),
          a("span", Ga, "/" + N(i.maxLevel), 1)
        ]),
        p[3] || (p[3] = a("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Xa)) : R("", !0),
      a("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": i.conceptsOnly,
        title: i.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: p[1] || (p[1] = (c) => e("toggle-concepts"))
      }, [
        $(v(P), {
          icon: i.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        p[5] || (p[5] = a("span", { class: "gx-display-label" }, "Concepts only", -1)),
        a("span", {
          class: we(["gx-display-sw", { on: i.conceptsOnly }])
        }, [...p[4] || (p[4] = [
          a("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Za),
      i.hiddenCount || i.focused || i.level < i.maxLevel ? (t(), r(te, { key: 1 }, [
        p[7] || (p[7] = a("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1)),
        a("button", {
          class: "gx-display-reset",
          title: "Show every node and clear branch isolation",
          onClick: p[2] || (p[2] = (c) => e("reset"))
        }, [
          $(v(P), {
            icon: "tabler:arrow-back-up",
            "aria-hidden": "true"
          }),
          p[6] || (p[6] = a("span", null, "Reset", -1))
        ])
      ], 64)) : R("", !0)
    ]));
  }
});
function Ve(i) {
  return i !== null && typeof i == "object" && !Array.isArray(i);
}
function ht(i) {
  const d = Ve(i) ? i : { message: String(i) }, e = d.response, o = Ve(e) && e.status === 401 ? "auth-expired" : "other";
  Be.handleError(o, d);
}
const Ja = { class: "kb-railtop" }, qa = { class: "kb-railtop-acts" }, ei = {
  key: 0,
  class: "kc-main-scroll"
}, ti = {
  key: 1,
  class: "gx-canvas-wrap"
}, ni = { class: "gx-botleft" }, oi = {
  key: 0,
  class: "gx-focusbar"
}, ai = ["title"], ii = { class: "gx-focusbar-name" }, ri = {
  key: 0,
  class: "gx-sparse"
}, li = { class: "gx-treat" }, si = { class: "gx-treat-check" }, ci = { class: "ap-field" }, di = ["value"], ui = { class: "ap-field" }, pi = { class: "gx-treat-actions" }, gi = /* @__PURE__ */ Ce({
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
  setup(i, { emit: d }) {
    const e = i, o = d, { navWidth: p, railRef: c, navDragging: I, onStart: h } = Dt(), m = O(null), C = O(1), F = /* @__PURE__ */ new Set(), z = S(() => {
      const l = /* @__PURE__ */ new Map();
      for (const n of e.concepts) l.set(n.id, n);
      return l;
    }), D = S(() => e.selectedId && z.value.get(e.selectedId) || null), B = S(() => {
      const l = /* @__PURE__ */ new Map();
      for (const n of e.concepts) l.set(n.id, n.label || n.id.slice(0, 8));
      return l;
    });
    function G(l) {
      return B.value.get(l) || l.slice(0, 8);
    }
    const K = S(() => tn(e.concepts, e.edges));
    function E(l) {
      return K.value.get(l)?.fill || Te({}).fill;
    }
    const j = S(() => {
      const l = /* @__PURE__ */ new Map();
      for (const n of e.edges)
        (n.edge_type === "subtopic_of" || n.edge_type === "categorized_as") && z.value.has(n.from_node_id) && z.value.has(n.to_node_id) && l.set(n.from_node_id, n.to_node_id);
      return l;
    }), b = S(() => {
      const l = /* @__PURE__ */ new Map();
      for (const n of e.edges) {
        if (n.from_node_id === n.to_node_id) continue;
        const g = l.get(n.to_node_id) || [];
        g.push(n.from_node_id), l.set(n.to_node_id, g);
      }
      return l;
    });
    function u(l) {
      const n = /* @__PURE__ */ new Set([l]), g = [l];
      for (; g.length; ) {
        const Q = g.pop();
        for (const ie of b.value.get(Q) || [])
          n.has(ie) || (n.add(ie), g.push(ie));
      }
      return n;
    }
    const _ = S(() => {
      const l = /* @__PURE__ */ new Map(), n = j.value, g = (Q, ie) => {
        const ve = l.get(Q);
        if (ve !== void 0) return ve;
        const De = n.get(Q);
        if (De === void 0 || ie.has(Q))
          return l.set(Q, 0), 0;
        ie.add(Q);
        const We = g(De, ie) + 1;
        return l.set(Q, We), We;
      };
      for (const Q of e.concepts) g(Q.id, /* @__PURE__ */ new Set());
      return l;
    }), T = S(() => k.value ? _.value.get(k.value) ?? 0 : 0);
    function W(l) {
      return (_.value.get(l) ?? 0) - T.value;
    }
    const J = S(() => {
      let l = 1;
      const n = L.value;
      for (const g of e.concepts) {
        if (n && !n.has(g.id)) continue;
        const Q = W(g.id);
        Q > l && (l = Q);
      }
      return l;
    }), ae = O(99), ce = S(() => Math.min(ae.value, J.value)), A = O(/* @__PURE__ */ new Set()), k = O(null), V = O(!1);
    function fe(l) {
      ae.value = l;
    }
    function xe(l) {
      const n = new Set(A.value);
      n.add(l), A.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function be(l) {
      const n = new Set(A.value);
      for (const g of u(l)) n.add(g);
      A.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const ye = S(() => k.value && e.concepts.find((l) => l.id === k.value) || null), L = S(() => k.value ? u(k.value) : null);
    function oe(l) {
      k.value = k.value === l ? null : l, k.value && o("select", l);
    }
    function ne(l) {
      k.value = l, o("select", l);
    }
    function s() {
      if (!k.value) return;
      const l = j.value.get(k.value);
      l && z.value.has(l) && !z.value.get(l)?.is_root ? (k.value = l, o("select", l)) : k.value = null;
    }
    const w = S(() => {
      if (!k.value) return "";
      const l = j.value.get(k.value), n = l ? z.value.get(l) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function f() {
      k.value = null;
    }
    function U() {
      A.value = /* @__PURE__ */ new Set(), k.value = null, ae.value = 99, V.value = !1;
    }
    ue(k, () => {
      ae.value = 99;
    });
    const H = S(() => {
      const l = L.value;
      if (!l && !V.value && !A.value.size && ce.value >= J.value) return null;
      const n = /* @__PURE__ */ new Set();
      for (const g of e.concepts)
        l && !l.has(g.id) || W(g.id) > ce.value || V.value && g.node_type === "document" || A.value.has(g.id) || n.add(g.id);
      return n;
    });
    function q(l) {
      o("select", l), m.value?.focus(l);
    }
    const Z = O({
      open: !1,
      x: 0,
      y: 0,
      concept: null
    }), Re = S(() => {
      const l = Z.value.concept;
      if (!l) return [];
      const n = [
        { id: "open", label: "Open", icon: "tabler:arrow-right" },
        { id: "isolate", label: k.value === l.id ? "Clear isolation" : "Isolate branch", icon: "tabler:focus-2" },
        { id: "hide", label: "Hide node", icon: "tabler:eye-off" },
        { id: "hide-branch", label: "Hide branch", icon: "tabler:binary-tree" }
      ];
      return l.node_type !== "document" && n.push(
        { id: "sep", divider: !0 },
        { id: "add", label: "Add child", icon: "tabler:plus" },
        { id: "rename", label: "Rename", icon: "tabler:pencil" },
        { id: "move", label: "Move to…", icon: "tabler:arrow-up-right", disabled: !!l.is_root },
        { id: "delete", label: "Delete", icon: "tabler:trash", danger: !0, disabled: !!l.is_root }
      ), n;
    });
    function Ue(l, n, g) {
      Z.value = { open: !0, x: n, y: g, concept: l };
    }
    function Qe(l) {
      const n = z.value.get(l.id);
      n && Ue(n, l.x, l.y);
    }
    function Pe(l) {
      const n = Z.value.concept;
      if (n)
        switch (l) {
          case "open":
            q(n.id);
            break;
          case "isolate":
            oe(n.id);
            break;
          case "hide":
            xe(n.id);
            break;
          case "hide-branch":
            be(n.id);
            break;
          default:
            Fe.value = n, Me.value = l;
            break;
        }
    }
    const Me = O(""), Fe = O(null), Je = S(() => ({ add: "Add child concept", rename: "Rename concept", move: "Move concept", delete: "Delete concept" })[Me.value] || "");
    function qe(l) {
      Me.value = "", l && o("select", l), o("changed");
    }
    const Ee = O(!1);
    function et(l) {
      Ee.value = !1;
      const n = l.parent_id || l.id;
      n && e.concepts.some((g) => g.id === n) && q(n);
    }
    const x = S(() => e.selectedId ? e.edges.filter((l) => l.from_node_id === e.selectedId || l.to_node_id === e.selectedId) : []), M = O(null), y = O(null);
    ue(() => e.selectedId, () => {
      M.value = null, y.value = null;
    });
    function X() {
      if (M.value) {
        M.value = null;
        return;
      }
      y.value && (M.value = y.value);
    }
    const ee = S(() => e.concepts.length > 0 && e.concepts.length < 2), Y = O(null);
    function he() {
      o("changed");
    }
    const pe = O(!1), ke = O("class:fast"), re = O(""), de = O(!1);
    async function _e() {
      if (e.kbId)
        try {
          const { data: l } = await Ie.get(`/api/v1/knowledge/${e.kbId}`);
          if (!Ve(l)) return;
          const n = Ve(l.knowledge_base) && l.knowledge_base.config || l.config, g = Ve(n) ? n : {};
          pe.value = g.treatment_enabled === !0, typeof g.treatment_model == "string" && g.treatment_model && (ke.value = g.treatment_model), typeof g.treatment_prompt == "string" && (re.value = g.treatment_prompt);
        } catch {
        }
    }
    async function ze() {
      if (!(!e.kbId || de.value)) {
        de.value = !0;
        try {
          await Ie.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: pe.value,
            treatment_model: ke.value,
            treatment_prompt: re.value
          } });
          try {
            Be?.toast?.("Treatment settings saved");
          } catch {
          }
        } catch (l) {
          try {
            ht(l);
          } catch {
          }
        } finally {
          de.value = !1;
        }
      }
    }
    async function Ne() {
      if (!(!e.kbId || de.value)) {
        de.value = !0;
        try {
          await Ie.post(`/api/v1/knowledge/${e.kbId}/treatment`, {});
          try {
            Be?.toast?.("Treatment started — duplicate concepts will be merged.");
          } catch {
          }
        } catch (l) {
          try {
            ht(l);
          } catch {
          }
        } finally {
          de.value = !1;
        }
      }
    }
    function Ae(l) {
      const n = l && (l.detail ?? (l.target && l.target.value));
      typeof n == "string" && n && (ke.value = n);
    }
    return lt(() => {
      it("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), it("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), _e();
    }), ue(() => e.kbId, () => {
      A.value = /* @__PURE__ */ new Set(), k.value = null, ae.value = 99, V.value = !1, _e();
    }), (l, n) => (t(), r("div", {
      ref_key: "railRef",
      ref: c,
      class: we(["gx", { "wk-dragging": v(I) }]),
      style: $e({ "--kb-nav-w": v(p) + "px" })
    }, [
      i.concepts.length ? (t(), le(v(Ct), { key: 0 }, {
        rail: me(() => [
          a("div", Ja, [
            a("div", qa, [
              $(v(Oe), {
                icon: "tabler:search",
                label: "Search",
                active: Ee.value,
                onClick: n[0] || (n[0] = (g) => Ee.value = !Ee.value)
              }, null, 8, ["active"]),
              $(v(Oe), {
                icon: "tabler:plus",
                label: "Add content",
                active: Y.value === "add",
                onClick: n[1] || (n[1] = (g) => Y.value = "add")
              }, null, 8, ["active"]),
              $(v(Oe), {
                icon: "tabler:wand",
                label: "Treatment",
                active: Y.value === "treatment",
                onClick: n[2] || (n[2] = (g) => Y.value = "treatment")
              }, null, 8, ["active"]),
              $(v(Oe), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: i.loading,
                spin: i.loading,
                onClick: n[3] || (n[3] = (g) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Rt, {
            concepts: i.concepts,
            edges: i.edges,
            "selected-id": i.selectedId,
            onSelect: q,
            onContext: n[4] || (n[4] = (g) => Ue(g.concept, g.x, g.y))
          }, null, 8, ["concepts", "edges", "selected-id"]),
          a("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: n[5] || (n[5] = //@ts-ignore
            (...g) => v(h) && v(h)(...g))
          }, [...n[26] || (n[26] = [
            a("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: me(() => [
          Ee.value ? (t(), r("div", ei, [
            $(v(It), {
              "kb-id": i.kbId,
              layout: "panel",
              ask: i.canAnswer,
              onOpen: et,
              onClose: n[6] || (n[6] = (g) => Ee.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), r("div", ti, [
            $(oa, {
              ref_key: "canvasRef",
              ref: m,
              concepts: i.concepts,
              edges: i.edges,
              "visible-ids": H.value,
              colors: K.value,
              "selected-id": i.selectedId || null,
              "highlight-ids": v(F),
              onSelect: n[7] || (n[7] = (g) => o("select", g || "")),
              onScale: n[8] || (n[8] = (g) => C.value = g),
              onNodeContext: Qe,
              onNodeDblclick: ne
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            a("div", ni, [
              $(Pa),
              $(Qa, {
                level: ce.value,
                "max-level": J.value,
                "concepts-only": V.value,
                "hidden-count": A.value.size,
                focused: !!k.value,
                "onUpdate:level": fe,
                onToggleConcepts: n[9] || (n[9] = (g) => V.value = !V.value),
                onReset: U
              }, null, 8, ["level", "max-level", "concepts-only", "hidden-count", "focused"])
            ]),
            $(ja, {
              scale: C.value,
              onZoomIn: n[10] || (n[10] = (g) => m.value?.zoomBy(1.25)),
              onZoomOut: n[11] || (n[11] = (g) => m.value?.zoomBy(0.8)),
              onFit: n[12] || (n[12] = (g) => m.value?.fit())
            }, null, 8, ["scale"]),
            $(Xe, { name: "gx-ins-fade" }, {
              default: me(() => [
                ye.value ? (t(), r("div", oi, [
                  a("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${w.value}`,
                    onClick: s
                  }, [
                    $(v(P), {
                      icon: "tabler:arrow-up",
                      "aria-hidden": "true"
                    })
                  ], 8, ai),
                  $(v(P), {
                    class: "gx-focusbar-ic",
                    icon: "tabler:focus-2",
                    "aria-hidden": "true"
                  }),
                  a("span", ii, N(ye.value.label || "concept"), 1),
                  a("button", {
                    class: "gx-focusbar-x",
                    title: "Show the whole graph",
                    onClick: f
                  }, [
                    $(v(P), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ])
                ])) : R("", !0)
              ]),
              _: 1
            }),
            $(Xe, { name: "gx-ins-fade" }, {
              default: me(() => [
                D.value ? (t(), le(La, {
                  key: 0,
                  "kb-id": i.kbId,
                  concept: D.value,
                  edges: x.value,
                  "label-of": G,
                  "color-of": E,
                  "original-open": !!M.value,
                  onSelect: n[13] || (n[13] = (g) => q(g)),
                  onClose: n[14] || (n[14] = (g) => o("select", "")),
                  onOriginalAvailable: n[15] || (n[15] = (g) => y.value = g),
                  onToggleOriginal: X
                }, null, 8, ["kb-id", "concept", "edges", "original-open"])) : R("", !0)
              ]),
              _: 1
            }),
            $(Xe, { name: "gx-ins-fade" }, {
              default: me(() => [
                ee.value ? (t(), r("div", ri, [
                  $(v(P), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = a("span", null, "Add more content to grow the graph.", -1)),
                  a("button", {
                    class: "gx-sparse-cta",
                    onClick: n[16] || (n[16] = (g) => Y.value = "add")
                  }, [
                    $(v(P), {
                      icon: "tabler:plus",
                      "aria-hidden": "true"
                    }),
                    n[27] || (n[27] = se(" Add content ", -1))
                  ])
                ])) : R("", !0)
              ]),
              _: 1
            })
          ]))
        ]),
        _: 1
      })) : (t(), le(Mt, {
        key: 1,
        icon: "tabler:topology-star-3",
        title: "No concepts yet",
        hint: "Add documents to start building the concept graph — relationships are extracted automatically.",
        cta: "Add content",
        "cta-icon": "tabler:plus",
        onCta: n[17] || (n[17] = (g) => Y.value = "add")
      })),
      $(v(Ye), {
        open: Y.value === "add",
        title: "Add content",
        icon: "tabler:plus",
        onClose: n[18] || (n[18] = (g) => Y.value = null)
      }, {
        default: me(() => [
          $(zt, {
            "kb-id": i.kbId,
            noun: "document",
            onChanged: he
          }, null, 8, ["kb-id"])
        ]),
        _: 1
      }, 8, ["open"]),
      $(v(Ye), {
        open: Y.value === "treatment",
        title: "Concept treatment",
        icon: "tabler:wand",
        onClose: n[21] || (n[21] = (g) => Y.value = null)
      }, {
        default: me(() => [
          a("div", li, [
            a("label", si, [
              Le(a("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (g) => pe.value = g)
              }, null, 512), [
                [Vt, pe.value]
              ]),
              n[29] || (n[29] = a("span", null, "Auto-merge duplicate concepts after each ingest", -1))
            ]),
            a("div", ci, [
              n[30] || (n[30] = a("span", { class: "ap-label" }, "Model", -1)),
              a("wc-model-picker", {
                value: ke.value,
                capability: "generate",
                onSelect: Ae
              }, null, 40, di)
            ]),
            a("div", ui, [
              n[31] || (n[31] = a("span", { class: "ap-label" }, [
                se("Prompt "),
                a("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Le(a("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (g) => re.value = g),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for the treatment agent…"
              }, null, 512), [
                [Ge, re.value]
              ])
            ]),
            a("div", pi, [
              $(v(Ke), {
                variant: "soft",
                disabled: de.value,
                onClick: ze
              }, {
                default: me(() => [...n[32] || (n[32] = [
                  se("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(v(Ke), {
                variant: "primary",
                disabled: de.value,
                onClick: Ne
              }, {
                default: me(() => [...n[33] || (n[33] = [
                  se("Run now", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n[34] || (n[34] = a("p", { class: "gx-treat-hint" }, "Merges duplicate / near-duplicate concept nodes. Runs automatically after ingest when enabled, or on demand here.", -1))
          ])
        ]),
        _: 1
      }, 8, ["open"]),
      $(v(Ye), {
        open: !!Me.value,
        title: Je.value,
        icon: "tabler:sitemap",
        onClose: n[23] || (n[23] = (g) => Me.value = "")
      }, {
        default: me(() => [
          Me.value ? (t(), le(St, {
            key: 0,
            "kb-id": i.kbId,
            mode: Me.value,
            target: Fe.value,
            concepts: i.concepts,
            edges: i.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (g) => Me.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(v(wt), {
        contained: "",
        open: !!M.value,
        title: M.value?.title || D.value?.label || "",
        "content-type": M.value?.contentType || "",
        "source-url": M.value?.sourceUrl || "",
        onClose: n[24] || (n[24] = (g) => M.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"]),
      $(Ot, {
        open: Z.value.open,
        x: Z.value.x,
        y: Z.value.y,
        items: Re.value,
        onPick: Pe,
        onClose: n[25] || (n[25] = (g) => Z.value.open = !1)
      }, null, 8, ["open", "x", "y", "items"])
    ], 6));
  }
}), xi = { class: "kb-page" }, vi = ["disabled"], fi = "kb10:wiki:view", bi = /* @__PURE__ */ Ce({
  __name: "KbWiki",
  setup(i) {
    const d = Ft(), e = Nt(), o = S(() => d.value.config?.kb_id || ""), p = S(() => d.value.config?.route || "");
    let c = !1;
    function I() {
      const L = d.value.config?.view;
      return L === "graph" || L === "wiki" ? L : localStorage.getItem(fi) === "graph" ? "graph" : "wiki";
    }
    const h = O(I());
    ue(() => d.value.config?.view, (L) => {
      (L === "graph" || L === "wiki") && L !== h.value && (h.value = L);
    });
    const m = O(!1), C = O(""), F = O([]), z = O([]), D = O(""), B = O(!1), G = O(null), K = O(!1), E = S(() => {
      const L = G.value;
      return L ? L.error ? `Graph enrichment failed: ${L.error}` : L.agent_missing ? L.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), j = S(() => !!G.value?.error);
    async function b() {
      if (!(!o.value || K.value)) {
        K.value = !0;
        try {
          await Ie.post(`/api/v1/kb10/${o.value}/enrichment`), G.value = null;
        } catch (L) {
          Be.handleError(L?.response?.status === 401 ? "auth-expired" : "other", L);
        } finally {
          K.value = !1;
        }
      }
    }
    const u = S(() => {
      const L = /* @__PURE__ */ new Map();
      for (const oe of F.value) L.set(oe.id, oe);
      return L;
    }), _ = S(() => $t(F.value, z.value)[0]?.concept.id || "");
    async function T() {
      if (!o.value) {
        B.value = !1;
        return;
      }
      try {
        const { data: L } = await Ie.get(`/api/v1/knowledge/${o.value}`), oe = L?.config || L?.knowledge_base?.config || {};
        B.value = At(oe);
      } catch {
        B.value = !1;
      }
    }
    let W = 0;
    async function J(L = !1) {
      if (!o.value) return;
      const oe = ++W;
      L || (m.value = !0), C.value = "";
      try {
        const { data: ne } = await Ie.get(`/api/v1/kb10/${o.value}/graph`);
        if (oe !== W) return;
        if (ne?.success) {
          F.value = ne.nodes || [], z.value = ne.edges || [];
          const s = ne.enrichment || {};
          G.value = s.error || s.agent_missing ? s : null, D.value && !u.value.has(D.value) && (D.value = ""), D.value || (p.value && u.value.has(p.value) ? ae(p.value) : h.value === "wiki" && _.value && (c = !0, D.value = _.value, c = !1));
        } else
          C.value = ne?.error && vt(ne.error) ? xt : ne?.error || "";
      } catch (ne) {
        if (oe !== W) return;
        const s = ne?.response?.data?.error || ne?.message || "could not load the knowledge base";
        C.value = vt(s) ? xt : s, Be.handleError(ne?.response?.status === 401 ? "auth-expired" : "other", ne);
      } finally {
        oe === W && !L && (m.value = !1);
      }
    }
    function ae(L) {
      if ((L || "") !== (D.value || "")) {
        if (!L) {
          D.value = "";
          return;
        }
        u.value.has(L) && (c = !0, D.value = L, c = !1);
      }
    }
    ue(D, (L) => {
      c || e("navigate", L || "");
    }), ue(p, (L) => ae(L));
    let ce = null;
    function A() {
      ce && clearTimeout(ce), ce = setTimeout(() => {
        ce = null, J(!0);
      }, 400);
    }
    let k = null, V = 0;
    function fe(L) {
      const oe = ++V;
      if (k && (k(), k = null), !L) return;
      const ne = nn(L, () => A());
      if (oe !== V) {
        ne && ne();
        return;
      }
      k = ne;
    }
    Ze(() => {
      V++, ce && clearTimeout(ce), k && k();
    }), ue(h, (L) => {
      L === "wiki" && !D.value && _.value && (c = !0, D.value = _.value, c = !1);
    }), ue(o, (L) => {
      D.value = "", J(), T(), fe(L);
    }, { immediate: !0 });
    function xe(L) {
      L !== D.value && (D.value = L);
    }
    function be() {
      o.value && e("kb-changed", { kb_id: o.value }), J(!0);
    }
    function ye() {
      J();
    }
    return (L, oe) => (t(), r("div", xi, [
      C.value ? (t(), le(v(gt), {
        key: 0,
        tone: "info"
      }, {
        default: me(() => [
          se(N(C.value), 1)
        ]),
        _: 1
      })) : R("", !0),
      E.value ? (t(), le(v(gt), {
        key: 1,
        tone: "warn"
      }, {
        default: me(() => [
          se(N(E.value) + " ", 1),
          j.value ? (t(), r("button", {
            key: 0,
            type: "button",
            class: "kc-notice-action",
            disabled: K.value,
            onClick: b
          }, N(K.value ? "Retrying…" : "Retry"), 9, vi)) : R("", !0)
        ]),
        _: 1
      })) : R("", !0),
      m.value && !F.value.length ? (t(), le(v(dn), {
        key: 2,
        icon: h.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: h.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), le(Xe, {
        key: 3,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: me(() => [
          h.value === "wiki" ? (t(), le(Vo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: F.value,
            edges: z.value,
            "selected-id": D.value,
            "can-answer": B.value,
            loading: m.value,
            onSelect: xe,
            onChanged: be,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"])) : (t(), le(gi, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: F.value,
            edges: z.value,
            "selected-id": D.value,
            "can-answer": B.value,
            loading: m.value,
            onSelect: xe,
            onChanged: be,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"]))
        ]),
        _: 1
      }))
    ]));
  }
}), hi = ":host{display:block;height:100%;min-height:0}.wk{display:flex;flex-direction:column;gap:0;height:100%;min-height:calc(100vh - 96px)}.wk .kc-rail{position:relative}.wk.wk-dragging{user-select:none}.wk.wk-dragging *{cursor:col-resize!important}.wn-resizer{position:absolute;z-index:3;top:0;right:-6px;bottom:0;width:12px;cursor:col-resize;touch-action:none;display:flex;align-items:center;justify-content:center}.wn-resizer-grip{width:3px;height:56px;border-radius:999px;background:var(--kb-border);transition:background .14s}.wn-resizer:hover .wn-resizer-grip,.wk.wk-dragging .wn-resizer-grip{background:var(--kb-primary)}.wn-filter{flex:none;display:flex;align-items:center;gap:6px;margin:8px 8px 4px;padding:0 9px;height:var(--kb-ctl-sm);border-radius:var(--kb-r);background:var(--kb-bg);border:1px solid var(--kb-border);transition:border-color .14s,box-shadow .14s}.wn-filter:focus-within{border-color:var(--kb-primary);box-shadow:var(--kb-ring)}.wn-filter-ic{width:14px;height:14px;flex:none;color:var(--kb-faint)}.wn-filter-input{flex:1;min-width:0;border:none;background:none;outline:none;font:inherit;font-size:12.5px;color:var(--kb-text)}.wn-filter-input::placeholder{color:var(--kb-faint)}.wn-filter-x{flex:none;display:inline-flex;width:18px;height:18px;border:none;border-radius:8px;background:transparent;color:var(--kb-faint);cursor:pointer}.wn-filter-x:hover{color:var(--kb-text);background:var(--kb-surface)}.wn-filter-x svg{width:13px;height:13px}.wn{display:flex;flex-direction:column;gap:4px;min-width:0}.wn-folder{display:flex;align-items:center;gap:6px;min-width:0;padding:2px 2px 6px}.wn-up{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:var(--kb-r-sm);border:1px solid var(--kb-border);background:var(--kb-surface);color:var(--kb-muted);cursor:pointer;transition:background .12s,color .12s,border-color .12s}.wn-up:hover{background:var(--kb-surface-2);color:var(--kb-text);border-color:var(--kb-border-strong)}.wn-up svg{width:14px;height:14px}.wn-folder-name{min-width:0;flex:1;font-size:12px;font-weight:700;color:var(--kb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}.wn-item{position:relative;display:flex;align-items:center;gap:8px;padding:0 8px;min-height:var(--kb-row);border-radius:var(--kb-r);min-width:0;cursor:pointer;transition:background .12s,color .12s}.wn-item:hover{background:var(--kb-surface-2)}.wn-item.active{background:color-mix(in srgb,var(--kb-primary) 12%,transparent);box-shadow:inset 2px 0 0 var(--kb-primary)}.wn-item.active .wn-label{color:var(--kb-primary);font-weight:700}.wn-ico{display:inline-flex;flex:none}.wn-ico svg{width:16px;height:16px}.wn-item-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;padding:5px 0}.wn-label{flex:1;min-width:0;font-size:12.5px;font-weight:550;color:var(--kb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-item-text .wn-label{flex:none}.wn-item:not(.folder) .wn-label{font-weight:500;color:var(--kb-muted)}.wn-path{font-size:10.5px;color:var(--kb-faint);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-path-sep{padding:0 4px;opacity:.6}.wn-count{flex:none;min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--kb-surface-2);color:var(--kb-faint)}.wn-item.active .wn-count{background:color-mix(in srgb,var(--kb-primary) 18%,transparent);color:var(--kb-primary)}.wn-go{flex:none;width:15px;height:15px;color:var(--kb-faint);transition:color .12s,transform .12s}.wn-item.folder:hover .wn-go{color:var(--kb-muted);transform:translate(1px)}.wn-empty{padding:14px 10px;font-size:12px;color:var(--kb-faint);text-align:center}.wk-doc-inner{max-width:1280px}.wr-doc,.wr-foot,.wr-lede,.wk-tax{max-width:var(--kb-measure)}.wk-pagebar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:24px;margin-bottom:-4px}.wk-pagebar .wk-crumbs{flex:1}.wk-pagebar .wk-tools{flex:none}.wk-crumbs{display:flex;align-items:center;gap:1px;min-width:0;flex-wrap:nowrap;overflow:hidden}.wk-crumb{flex:0 1 auto;min-width:0;height:24px;padding:0 7px;border-radius:var(--kb-r-sm);font:inherit;font-size:12px;font-weight:600;cursor:pointer;background:transparent;border:none;color:var(--kb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .12s,color .12s}.wk-crumb:hover{background:var(--kb-surface-2);color:var(--kb-text)}.wk-crumb-sep{width:13px;height:13px;color:var(--kb-faint);flex:none}.wr{display:flex;flex-direction:column;gap:18px;min-width:0}.wr-head{display:flex;flex-direction:column;gap:9px}.wr-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--kb-muted)}.wr-eyebrow-dot{width:9px;height:9px;border-radius:50%;flex:none}.wr-title-row{display:flex;align-items:flex-start;gap:14px}.wr-title{margin:0;flex:1;min-width:0;font-size:27px;font-weight:800;line-height:1.15;letter-spacing:-.02em;color:var(--kb-text)}.wr-lede{margin:0;font-size:15px;line-height:1.6;color:var(--kb-muted)}.wr-state{display:flex;align-items:center;gap:9px;padding:40px 20px;justify-content:center;font-size:13px;color:var(--kb-muted)}.wr-state.err{color:var(--kb-danger)}.wr-state svg{width:17px;height:17px}.wr-state .spin.big{width:22px;height:22px}.wr-doc{display:flex;flex-direction:column;gap:8px}.wr-doc-page{display:flex;flex-direction:column;gap:12px;min-width:0}.wr-doc-head{display:flex;align-items:center;gap:10px;min-width:0}.wr-orig-btn{margin-left:auto;flex:none}.wr-orig-btn.on{border-color:var(--kb-primary);color:var(--kb-primary);background:var(--kb-primary-soft)}.wr-doc-toggle{flex:none;display:inline-flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;padding:3px 9px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;background:var(--kb-surface-2);border:1px solid var(--kb-border);color:var(--kb-text)}.wr-doc-toggle:hover{border-color:var(--kb-primary);color:var(--kb-primary)}.wr-doc-toggle svg{width:14px;height:14px}.wr-doc-sep{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--kb-faint);padding-bottom:4px;border-bottom:1px solid var(--kb-border)}.wr-rv{display:block;min-width:0}.wr-doc-rule{border:none;border-top:1px solid var(--kb-border);margin:12px 0}.wr-chunks{display:flex;flex-direction:column;gap:16px;max-width:var(--kb-measure)}.wr-chunks-doc{display:flex;flex-direction:column;gap:10px}.wr-chunk{padding:12px 14px;border-radius:var(--kb-r-card);border:1px solid var(--kb-border);background:var(--kb-surface);cursor:pointer;transition:border-color .14s}.wr-chunk:hover{border-color:var(--kb-border-strong)}.wr-chunk-h{width:100%;border:0;padding:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px}.wr-chunk-n{width:22px;height:22px;flex:none;display:grid;place-items:center;border-radius:6px;font-size:11px;font-weight:700;background:var(--kb-surface-2);color:var(--kb-muted);font-variant-numeric:tabular-nums}.wr-chunk-label{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--kb-muted)}.wr-chunk-chev{width:16px;height:16px;margin-left:auto;color:var(--kb-faint)}.wr-chunk-cx{display:flex;align-items:flex-start;gap:7px;margin:9px 0 0;padding:8px 10px;border-radius:8px;font-size:11.5px;line-height:1.5;font-style:italic;background:color-mix(in srgb,var(--kb-primary) 6%,transparent);color:var(--kb-muted)}.wr-chunk-cx svg{width:13px;height:13px;flex:none;margin-top:2px;color:var(--kb-primary)}.wr-chunk-body{margin:10px 0 0;font-size:12.5px;line-height:1.65;color:var(--kb-muted);white-space:pre-wrap}.wr-chunk-body.clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.wr-prov{display:flex;flex-wrap:wrap;gap:6px 18px;padding:12px 14px;border-radius:var(--kb-r-card);background:var(--kb-surface);border:1px solid var(--kb-border)}.wr-prov-row{display:inline-flex;align-items:baseline;gap:7px;min-width:0;font-size:12px}.wr-prov-k{font-weight:700;color:var(--kb-faint);text-transform:uppercase;letter-spacing:.03em;font-size:10px}.wr-prov-v{color:var(--kb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:360px}a.wr-prov-v{color:var(--kb-primary);text-decoration:none}a.wr-prov-v:hover{text-decoration:underline}.wr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.wr-card{display:flex;flex-direction:column;gap:7px;padding:14px;border-radius:var(--kb-r-card);cursor:pointer;text-align:left;background:var(--kb-surface);border:1px solid var(--kb-border);transition:border-color .14s,box-shadow .14s,transform .14s}.wr-card:hover{border-color:color-mix(in srgb,var(--c, var(--kb-primary)) 45%,var(--kb-border));box-shadow:0 4px 16px color-mix(in srgb,var(--p-text-color) 8%,transparent);transform:translateY(-1px)}.wr-card-top{display:flex;align-items:center;justify-content:space-between}.wr-card-ic{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--c, var(--kb-primary)) 16%,transparent);color:var(--c, var(--kb-primary))}.wr-card-ic svg{width:16px;height:16px}.wr-card-go{width:15px;height:15px;color:var(--kb-faint);opacity:0;transition:opacity .14s}.wr-card:hover .wr-card-go{opacity:1}.wr-card-name{font-size:14px;font-weight:700;color:var(--kb-text)}.wr-card-desc{font-size:12.5px;line-height:1.5;color:var(--kb-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.wr-card-meta{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;color:var(--kb-faint);margin-top:2px}.wk-tools{display:inline-flex;gap:4px;flex:none}.wk-tax{display:flex;flex-direction:column;gap:9px;padding:14px;border-radius:var(--kb-r-card);background:var(--kb-surface);border:1px solid var(--kb-border)}.wk-tax-h{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:700;color:var(--kb-text)}.wk-tax-input,.wk-tax-textarea{width:100%;font:inherit;font-size:13px;color:var(--kb-text);background:var(--kb-bg);border:1px solid var(--kb-border);border-radius:var(--kb-r);transition:border-color .14s,box-shadow .14s}.wk-tax-input{height:var(--kb-ctl);padding:0 11px}.wk-tax-textarea{padding:8px 11px;resize:vertical;min-height:56px;line-height:1.5}.wk-tax-input:focus,.wk-tax-textarea:focus{outline:none;border-color:var(--kb-primary);box-shadow:var(--kb-ring)}.wk-tax-del{display:flex;flex-direction:column;gap:9px}.wk-tax-counts{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:11.5px;color:var(--kb-muted)}.wk-tax-counts span{display:inline-flex;align-items:center;gap:5px}.wk-tax-counts svg{width:13px;height:13px;color:var(--kb-faint)}.wk-tax-err{display:flex;align-items:flex-start;gap:6px;font-size:12px;color:var(--kb-danger)}.wk-tax-err svg{width:14px;height:14px;flex:none;margin-top:1px}.wk-tax-foot{display:flex;justify-content:flex-end;gap:7px}.wr-foot{display:flex;flex-direction:column;gap:14px;margin-top:8px;padding-top:18px;border-top:1px solid var(--kb-border)}.wr-foot-group{display:flex;flex-direction:column;gap:8px}.wr-foot-h{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--kb-faint)}.wr-foot-links{display:flex;flex-wrap:wrap;gap:6px}.wr-foot-link{display:inline-flex;align-items:center;gap:7px;height:var(--kb-ctl-sm);padding:0 11px;border-radius:999px;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;background:var(--kb-surface);color:var(--kb-text);border:1px solid var(--kb-border);transition:border-color .14s,background .14s}.wr-foot-link:hover{background:var(--kb-surface-2);border-color:var(--kb-border-strong)}.wr-foot-dot{width:8px;height:8px;border-radius:50%;flex:none}.wr-foot-kind{font-size:9.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--kb-faint)}@media(max-width:760px){.wk-doc-inner{padding:20px 22px 64px}.wr-grid{grid-template-columns:1fr}.wr-prov-v{max-width:100%}.wn-resizer{display:none}}@media(prefers-reduced-motion:reduce){.wr-card,.wn-row,.wr-foot-link{transition:none}}.kb-view-sep{width:1px;align-self:stretch;margin:4px 2px;background:var(--kc-border)}.wn-kebab{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;background:transparent;border-radius:var(--kb-r-sm);cursor:pointer;color:var(--kb-faint);opacity:0;transition:opacity .12s,background .12s,color .12s}.wn-item:hover .wn-kebab{opacity:.7}.wn-kebab:hover{background:var(--kb-surface-2);color:var(--kb-text);opacity:1}.wn-kebab svg{width:15px;height:15px}", mi = ":host{display:block;height:100%;min-height:0}.gx{--gx-glass: color-mix(in srgb, var(--p-content-background) 82%, transparent);--gx-glass-border: color-mix(in srgb, var(--p-text-color) 12%, transparent);--gx-shadow: 0 8px 30px -12px color-mix(in srgb, var(--p-text-color) 30%, transparent);display:flex;flex-direction:column;gap:0;height:100%;min-height:calc(100vh - 96px)}.gx-notice{margin:12px 16px 0}.gx-rail-search{padding:10px}.gx-list{display:flex;flex-direction:column;gap:1px}.gx-row{display:flex;align-items:center;gap:9px;height:var(--kb-row);padding:0 8px;border-radius:var(--kb-r);min-width:0;cursor:pointer;text-align:left;background:transparent;border:none;font:inherit;transition:background .12s}.gx-row:hover{background:var(--kb-surface-2)}.gx-row.on{background:color-mix(in srgb,var(--kb-primary) 12%,transparent);box-shadow:inset 2px 0 0 var(--kb-primary)}.gx-row-dot{width:10px;height:10px;border-radius:50%;flex:none}.gx-row-label{flex:1;min-width:0;font-size:12.5px;font-weight:550;color:var(--kb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-row.on .gx-row-label{color:var(--kb-primary);font-weight:700}.gx-row-deg{flex:none;min-width:18px;padding:1px 6px;border-radius:999px;font-size:10.5px;font-weight:700;text-align:center;color:var(--kb-faint);background:var(--kb-surface-2)}.gx-row.on .gx-row-deg{color:var(--kb-primary);background:color-mix(in srgb,var(--kb-primary) 14%,transparent)}.gx-row-hide{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:var(--kb-r-sm);cursor:pointer;color:var(--kb-faint);opacity:0;transition:opacity .12s,background .12s,color .12s}.gx-row:hover .gx-row-hide{opacity:.6}.gx-row-hide:hover{background:var(--kb-surface-2);color:var(--kb-text);opacity:1}.gx-row-hide svg{width:15px;height:15px}.gx-row.hidden{opacity:.45}.gx-row.hidden .gx-row-hide{opacity:.8}.gx-hidden-chip{position:absolute;z-index:6;left:50%;bottom:16px;transform:translate(-50%);display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;font-weight:600;color:var(--kb-text);cursor:pointer}.gx-hidden-chip:hover{background:var(--kb-surface-2)}.gx-hidden-chip svg{width:15px;height:15px;color:var(--kb-primary)}.gx-focus-chip.raised{bottom:58px}.gx-focus-chip-label{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-row.focus .gx-row-dot{box-shadow:0 0 0 2px var(--kb-primary)}.gx-tw{flex:none;width:18px;height:var(--kb-row);display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--kb-faint);cursor:pointer;padding:0;border-radius:var(--kb-r)}.gx-tw:hover{color:var(--kb-text);background:var(--kb-surface-2)}.gx-tw--leaf{cursor:default}.gx-list-empty{padding:14px 10px;font-size:12.5px;color:var(--kb-faint)}.gx-canvas-wrap{position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--p-primary-color) 7%,transparent),transparent 60%),var(--p-content-background)}.gx-canvas{position:absolute;inset:0}.gx-svg{width:100%;height:100%;display:block;cursor:grab;touch-action:none}.gx-svg:active{cursor:grabbing}.gx-grid-bg{pointer-events:none}.gx-grid-dot{fill:color-mix(in srgb,var(--p-text-color) 14%,transparent)}.gx-links{pointer-events:none}.gx-link{fill:none;stroke:var(--kb-border-strong);stroke-width:1.5;transition:opacity .18s,stroke .18s}.gx-link.subtopic{stroke:var(--p-help-400);stroke-width:2;opacity:.55}.gx-link.categorized{stroke-dasharray:4 4;opacity:.4}.gx-link.lit{opacity:.95;stroke-width:2.5}.gx-link.faded{opacity:.07}.gx-node{cursor:pointer;transition:opacity .18s}.gx-node.dim{opacity:.22}.gx-shape{transition:stroke-width .15s,filter .15s}.gx-node.hov .gx-shape{stroke-width:3.5;filter:drop-shadow(0 0 6px color-mix(in srgb,var(--p-text-color) 30%,transparent))}.gx-node.sel .gx-shape{stroke:var(--kb-text);stroke-width:3.5}.gx-halo{fill:none;stroke-width:2;opacity:.5;animation:gx-halo 1.8s ease-in-out infinite}@keyframes gx-halo{0%,to{opacity:.25}50%{opacity:.6}}.gx-badge-bg{fill:var(--p-content-background);stroke:var(--kb-border-strong);stroke-width:1}.gx-badge-txt{font-size:8.5px;font-weight:700;fill:var(--kb-text);pointer-events:none}.gx-label{font-size:10.5px;font-weight:600;fill:var(--kb-muted);pointer-events:none;paint-order:stroke;stroke:var(--p-content-background);stroke-width:3px;stroke-linejoin:round}.gx-label.root{font-size:12.5px;font-weight:700;fill:var(--kb-text)}.gx-node.sel .gx-label,.gx-node.hov .gx-label{fill:var(--kb-text)}.gx-legend{position:absolute;z-index:5;left:16px;bottom:16px;border-radius:14px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);overflow:hidden}.gx-legend.collapsed{border-radius:999px}.gx-legend-toggle{display:flex;align-items:center;gap:6px;width:100%;padding:8px 12px;cursor:pointer;background:none;border:none;color:var(--kb-muted);font:inherit;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}.gx-legend.collapsed .gx-legend-toggle{padding:9px 14px}.gx-legend-toggle:hover{color:var(--kb-text)}.gx-legend-toggle svg{width:14px;height:14px}.gx-legend-body{display:flex;flex-direction:column;gap:7px;padding:2px 14px 12px}.gx-legend-row{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--kb-muted);white-space:nowrap}.gx-legend-mark{width:11px;height:11px;border-radius:50%;flex:none}.gx-legend-mark.doc{width:12px;height:9px;border-radius:2px}.gx-legend-cluster{background:conic-gradient(#885ad8,#5ab0d8,#d88c5a,#5ad888,#d85a73,#885ad8)}.gx-legend-sep{height:1px;background:var(--gx-glass-border);margin:1px 0}.gx-legend-line{width:18px;flex:none}.gx-legend-line.subtopic{border-top:2px solid var(--p-help-400)}.gx-legend-line.categorized{border-top:1px dashed var(--kb-border-strong)}.gx-controls{position:absolute;z-index:5;right:16px;bottom:16px;display:flex;flex-direction:column;align-items:stretch;gap:2px;padding:5px;border-radius:8px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow)}.gx-ctrl{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;cursor:pointer;background:transparent;border:none;color:var(--kb-muted);transition:background .14s,color .14s}.gx-ctrl:hover{background:var(--kb-surface-2);color:var(--kb-text)}.gx-ctrl.fit{margin-top:3px;border-top:1px solid var(--gx-glass-border);border-radius:0 0 8px 8px}.gx-ctrl svg{width:17px;height:17px}.gx-ctrl-read{text-align:center;font-size:10px;font-weight:700;color:var(--kb-faint);padding:1px 0;font-variant-numeric:tabular-nums}.gx-inspect{position:absolute;z-index:7;top:16px;right:16px;bottom:16px;width:430px;max-width:calc(100% - 32px);display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--p-content-background) 96%,transparent);backdrop-filter:blur(18px);border:1px solid var(--gx-glass-border);box-shadow:0 18px 50px -20px color-mix(in srgb,var(--p-text-color) 45%,transparent)}.gx-inspect.dragging{user-select:none}.gx-ins-resizer{position:absolute;z-index:2;top:0;left:0;bottom:0;width:12px;cursor:col-resize;touch-action:none;display:flex;align-items:center;justify-content:flex-start}.gx-ins-resizer-grip{width:3px;height:56px;border-radius:999px;background:var(--kb-border);transition:background .14s}.gx-ins-resizer:hover .gx-ins-resizer-grip,.gx-inspect.dragging .gx-ins-resizer-grip{background:var(--kb-primary)}.gx-ins-h{display:flex;align-items:flex-start;gap:10px;padding:14px 14px 13px;border-bottom:1px solid var(--kb-border);background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 12%,transparent),transparent)}.gx-ins-dot{width:10px;height:10px;border-radius:50%;flex:none;margin-top:4px;background:var(--accent);box-shadow:0 0 10px var(--accent)}.gx-ins-id{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.gx-ins-name{margin:0;flex:1;min-width:0;font-size:15px;font-weight:700;line-height:1.3;color:var(--kb-text);word-break:break-word}.gx-ins-orig-btn{flex:none}.gx-ins-orig-btn.on{border-color:var(--kb-primary);color:var(--kb-primary);background:var(--kb-primary-soft)}.gx-ins-x{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;cursor:pointer;background:transparent;border:none;color:var(--kb-muted);transition:background .14s,color .14s}.gx-ins-x:hover{background:var(--kb-surface-2);color:var(--kb-text)}.gx-ins-x svg{width:16px;height:16px}.gx-ins-body{flex:1;min-height:0;overflow-y:auto;padding:13px 16px 18px}.gx-ins-body .kc-docsum{margin-bottom:14px}.gx-ins-body .kc-refs{margin-bottom:4px}.gx-ins-loading{display:flex;align-items:center;gap:8px;padding:14px 2px;font-size:12.5px;color:var(--kb-muted)}.gx-ins-loading svg{width:16px;height:16px}.gx-ins-content{margin-top:14px;padding-top:14px;border-top:1px solid var(--kb-border)}.gx-ins-doc+.gx-ins-doc{margin-top:18px;padding-top:16px;border-top:1px solid var(--kb-border)}.gx-ins-doc-t{font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--kb-faint);margin-bottom:8px}.gx-ins-rv{display:block}.gx-ins-doc-orig{margin-bottom:10px}.gx-ins-clamp{position:relative}.gx-ins-clamp.clamped .gx-ins-clamp-inner{max-height:560px;overflow:hidden}.gx-ins-clamp-fade{position:absolute;left:0;right:0;bottom:0;height:88px;pointer-events:none;background:linear-gradient(to bottom,transparent,var(--p-content-background) 92%)}.gx-ins-more{margin-top:10px;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;background:var(--kb-surface);color:var(--kb-text);border:1px solid var(--kb-border);transition:border-color .14s,background .14s}.gx-ins-more:hover{border-color:var(--kb-primary);color:var(--kb-primary)}.gx-ins-more svg{width:15px;height:15px}.gx-inspect .kc-ref{border-radius:8px}.gx-ins-stats{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:11px}.gx-stat{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:var(--kb-r-sm);font-size:11px;font-weight:600;background:var(--kb-surface-2);color:var(--kb-muted)}.gx-stat svg{width:13px;height:13px}.gx-rel-group{margin-top:14px}.gx-rel-title{display:flex;align-items:center;gap:6px;margin-bottom:7px;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--kb-faint)}.gx-rel-title svg{width:13px;height:13px}.gx-rel-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 9px;margin-bottom:4px;border-radius:8px;cursor:pointer;background:var(--kb-surface);border:1px solid var(--kb-border);text-align:left;font:inherit;transition:background .13s,border-color .13s}.gx-rel-item:hover{background:var(--kb-surface-2);border-color:var(--kb-border-strong)}.gx-rel-kind{flex:none;font-size:9px;font-weight:700;padding:2px 7px;border-radius:var(--kb-r-sm);background:var(--kb-primary-soft);color:var(--kb-primary)}.gx-rel-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--kb-text)}.gx-rel-go{flex:none;width:14px;height:14px;color:var(--kb-faint)}.gx-ins-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:28px 10px;text-align:center;color:var(--kb-faint);font-size:12px}.gx-ins-empty svg{width:26px;height:26px}@media(max-width:640px){.gx-inspect{left:16px;right:16px;width:auto!important;top:auto;height:50%;max-width:calc(100vw - 32px)}.gx-ins-resizer{display:none}.gx-legend{max-width:calc(100vw - 32px);bottom:64px}.gx-legend-row{white-space:normal}.gx-sparse{max-width:calc(100vw - 32px);white-space:normal}}.gx-sparse{position:absolute;z-index:5;left:50%;bottom:18px;transform:translate(-50%);display:inline-flex;align-items:center;gap:9px;padding:7px 7px 7px 14px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font-size:12px;color:var(--kb-muted);white-space:nowrap}.gx-sparse>svg{width:15px;height:15px;color:var(--p-success-500)}.gx-sparse-cta{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border-radius:999px;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;background:var(--kb-primary);color:var(--p-primary-contrast-color);border:none}.gx-sparse-cta:hover{filter:brightness(1.07)}.gx-sparse-cta svg{width:13px;height:13px}.gx-ins-fade-enter-active,.gx-ins-fade-leave-active{transition:opacity .2s ease,transform .2s ease}.gx-ins-fade-enter-from,.gx-ins-fade-leave-to{opacity:0;transform:translate(8px)}.gx-treat{display:flex;flex-direction:column;gap:12px;padding:10px 12px}.gx-treat-check{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--kb-text);cursor:pointer}.gx-treat-check input{width:15px;height:15px;accent-color:var(--kb-primary);cursor:pointer}.gx-treat .ap-textarea{min-height:76px}.gx-treat-actions{display:flex;gap:8px}.gx-treat-actions .kc-btn{flex:1}.gx-treat-hint{margin:0;font-size:11px;line-height:1.5;color:var(--kb-muted)}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}.gx-row-kebab{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--kb-r-sm);cursor:pointer;color:var(--kb-faint);opacity:0;transition:opacity .12s,background .12s,color .12s}.gx-row:hover .gx-row-kebab{opacity:.7}.gx-row-kebab:hover{background:var(--kb-surface-2);color:var(--kb-text);opacity:1}.gx-row-kebab svg{width:15px;height:15px}.gx-treerow{display:flex;align-items:center;gap:1px}.gx-treerow .gx-row{flex:1;min-width:0}.gx-row--flat{padding-left:8px}.gx-drill{display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:2px 4px 8px;margin-bottom:4px;border-bottom:1px solid var(--kb-border)}.gx-drill-home,.gx-drill-crumb{display:inline-flex;align-items:center;gap:4px;max-width:132px;border:none;background:transparent;border-radius:var(--kb-r-sm);cursor:pointer;padding:2px 5px;font:inherit;font-size:11.5px;font-weight:600;color:var(--kb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-drill-home svg{width:14px;height:14px}.gx-drill-home:hover,.gx-drill-crumb:hover{background:var(--kb-surface-2);color:var(--kb-text)}.gx-drill-crumb.last{color:var(--kb-text);font-weight:700}.gx-drill-sep{width:12px;height:12px;color:var(--kb-faint);flex:none}.gx-botleft{position:absolute;z-index:5;left:16px;bottom:16px;display:flex;align-items:center;gap:8px}.gx-botleft .gx-legend{position:static;left:auto;bottom:auto}.gx-display{display:flex;align-items:center;gap:11px;padding:6px 13px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;color:var(--kb-text)}.gx-display-row,.gx-display-reset{display:inline-flex;align-items:center;gap:7px;padding:0;border:none;background:transparent;font:inherit;font-size:12px;font-weight:600;color:var(--kb-text);cursor:pointer}.gx-display-row:hover,.gx-display-reset{color:var(--kb-primary)}.gx-display-reset:hover{filter:brightness(1.1)}.gx-display-div{width:1px;height:18px;background:var(--gx-glass-border);flex:none}.gx-display-ic{width:15px;height:15px;color:var(--kb-muted);flex:none}.gx-display-label{white-space:nowrap}.gx-display-sw{position:relative;width:30px;height:17px;border-radius:999px;background:var(--kb-border-strong);transition:background .15s;flex:none}.gx-display-sw.on{background:var(--kb-primary)}.gx-display-knob{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;transition:transform .15s}.gx-display-sw.on .gx-display-knob{transform:translate(13px)}.gx-display-reset svg{width:15px;height:15px}.gx-display-count{margin-left:6px;padding:1px 7px;border-radius:999px;background:var(--kb-surface-2);font-size:10.5px;font-weight:700;color:var(--kb-muted)}.gx-display-slider{display:inline-flex;align-items:center;gap:8px}.gx-range{-webkit-appearance:none;appearance:none;width:108px;height:4px;border-radius:999px;background:var(--kb-border-strong);outline:none;cursor:pointer}.gx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--kb-primary);border:2px solid var(--kb-bg);cursor:pointer}.gx-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--kb-primary);border:2px solid var(--kb-bg);cursor:pointer}.gx-display-lvl{font:inherit;font-size:11.5px;font-weight:700;color:var(--kb-text);min-width:28px;text-align:right}.gx-display-lvl-max{color:var(--kb-faint);font-weight:600}.gx-focusbar{position:absolute;z-index:6;left:50%;bottom:16px;transform:translate(-50%);display:inline-flex;align-items:center;gap:8px;padding:5px 6px 5px 5px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;font-weight:650;color:var(--kb-text)}.gx-focusbar-up,.gx-focusbar-x{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:none;border-radius:50%;background:transparent;color:var(--kb-muted);cursor:pointer;transition:background .12s,color .12s}.gx-focusbar-up{background:color-mix(in srgb,var(--kb-primary) 14%,transparent);color:var(--kb-primary)}.gx-focusbar-up:hover{background:color-mix(in srgb,var(--kb-primary) 24%,transparent)}.gx-focusbar-x:hover{background:var(--kb-surface-2);color:var(--kb-text)}.gx-focusbar-up svg,.gx-focusbar-x svg{width:16px;height:16px}.gx-focusbar-ic{width:15px;height:15px;color:var(--kb-primary)}.gx-focusbar-name{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
class ki extends Bt {
  static get wippyConfig() {
    return {
      propsSchema: on.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Ut + hi + mi
    };
  }
  static get vueConfig() {
    return { rootComponent: bi };
  }
}
jt(import.meta.url, ki);
//# sourceMappingURL=wiki.js.map
