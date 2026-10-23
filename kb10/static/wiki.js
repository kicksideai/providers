import { _ as Ke, u as Ft, a as Nt, d as At, W as Bt, c as Ut } from "./styles-r2_gRByf.js";
import { defineComponent as Ce, openBlock as t, createElementBlock as i, toDisplayString as N, createElementVNode as r, createVNode as $, unref as v, createCommentVNode as R, ref as O, computed as S, watch as ue, onMounted as lt, createBlock as le, normalizeClass as ke, Fragment as te, renderList as ge, createTextVNode as se, normalizeStyle as $e, withModifiers as Se, withDirectives as Le, vModelText as Ge, vModelSelect as ct, withCtx as be, onBeforeUnmount as Ze, onUnmounted as Pt, nextTick as rt, createStaticVNode as Wt, Transition as Xe, vModelCheckbox as Vt } from "vue";
import { loadByTagName as at, api as Ie, host as Be, define as jt } from "@wippy-fe/proxy";
import { r as Ht, t as Xt, v as Yt, d as bt, e as Kt, f as wt, w as Te, x as it, y as ot, g as kt, u as yt, b as _t, _ as Oe, z as dt, A as $t, B as Gt, C as Zt, D as Qt, F as Jt, j as Ct, k as It, l as Mt, o as Ye, p as zt, G as qt, H as ut, I as en, N as pt, J as tn, h as gt, E as xt, i as vt, s as nn, q as on } from "./package-CNcWGLZ-.js";
import { Icon as P } from "@iconify/vue";
const rn = { class: "kx-count" }, an = /* @__PURE__ */ Ce({
  __name: "CountPill",
  props: {
    value: {}
  },
  setup(a) {
    return (d, e) => (t(), i("span", rn, N(a.value), 1));
  }
}), ln = { class: "kx-loading kx-loading-centered" }, sn = { class: "kx-loading-inner" }, cn = { key: 0 }, dn = /* @__PURE__ */ Ce({
  __name: "KbLoading",
  props: {
    icon: { default: "tabler:loader-2" },
    label: {}
  },
  setup(a) {
    return (d, e) => (t(), i("div", ln, [
      r("div", sn, [
        $(v(P), {
          icon: a.icon,
          class: "spin",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        a.label ? (t(), i("span", cn, N(a.label), 1)) : R("", !0)
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
}, hn = {
  key: 2,
  class: "wr-state err"
}, mn = {
  key: 1,
  class: "wr-doc"
}, bn = {
  key: 0,
  class: "wr-doc-head"
}, wn = { class: "wr-doc-sep" }, kn = ["aria-expanded", "onClick"], yn = ["source"], _n = {
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
  setup(a, { emit: d }) {
    const e = a, o = d;
    function p(s) {
      return `/api/v1/kb10/${e.kbId}/nodes/${encodeURIComponent(s)}/source`;
    }
    const c = O(!1), I = O(""), m = O([]), b = O([]), C = O({}), F = O("rendered"), z = O(null), D = S(() => b.value.reduce((s, k) => s + k.chunks.length, 0)), B = S(() => {
      const s = /* @__PURE__ */ new Map();
      for (const k of b.value) k.summary && s.set(k.id, k.summary);
      return s;
    }), G = S(() => D.value > 0 || b.value.some((s) => s.summary));
    function K(s) {
      C.value = { ...C.value, [s]: !C.value[s] };
    }
    const E = O({}), j = S(() => m.value.length > 1);
    function h(s) {
      return !j.value || !!E.value[s];
    }
    function u(s) {
      E.value = { ...E.value, [s]: !E.value[s] };
    }
    ue(m, () => {
      E.value = {};
    });
    const _ = S(() => Ht(e.concept, e.edges)), T = S(() => Xt(e.concept, e.edges, e.conceptsById)), W = S(() => Yt(e.concept, e.edges, e.conceptsById)), J = S(() => m.value.length > 0), re = S(() => {
      const s = [{ id: "rendered", label: "Rendered", icon: "tabler:article" }];
      return G.value && s.push({ id: "chunks", label: "Chunks", icon: "tabler:layout-grid", count: D.value || void 0 }), s;
    });
    function ce(s) {
      return s.metadata?.original_mime_type || s.metadata?.source_mime || "";
    }
    function A(s) {
      const k = ce(s);
      return yt(s.metadata) && _t(k) ? { contentType: k, sourceUrl: p(s.id) } : k === "application/pdf" ? { contentType: "application/pdf", sourceUrl: p(s.id) } : null;
    }
    function w(s) {
      if (z.value?.id === s.id) {
        z.value = null;
        return;
      }
      const k = A(s);
      k && (z.value = { id: s.id, contentType: k.contentType, sourceUrl: k.sourceUrl, title: s.title });
    }
    const V = S(() => m.value.find((s) => A(s)) || null), fe = S(() => !!V.value), xe = S(() => !!V.value && z.value?.id === V.value.id);
    function he(s) {
      const k = s.metadata || {}, f = k.filename || k.original_filename, U = k.source_url, H = k.page ?? k.page_number, q = H != null && H !== "";
      if (!f && !U && !q) return [];
      const Z = [], Re = k.original_mime_type || k.source_mime;
      return f && Z.push({ key: "filename", label: "File", value: String(f) }), Re && Z.push({ key: "mime", label: "Type", value: String(Re) }), U && Z.push({ key: "source", label: "Source", value: String(U), href: String(U) }), q && Z.push({ key: "page", label: "Page", value: String(H) }), Z;
    }
    async function ye(s) {
      const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(s)}`);
      if (!k?.success || !k.node) return null;
      const f = k.node, U = f.content || "";
      if (!U.trim()) return null;
      const H = f.metadata || {}, q = H.title || H.filename || H.source_url || e.conceptsById.get(s)?.label || "Document";
      return { id: s, title: q, content: U, contentType: f.content_type || "text/markdown", metadata: H };
    }
    lt(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    });
    async function L(s, k) {
      try {
        const { data: f } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(s)}&include_content=true&limit=200`);
        if (!f?.success) return null;
        const U = f.nodes || [], H = U.filter((Z) => Z.node_type === "chunk").sort((Z, Re) => Number((Z.metadata || {}).index ?? (Z.metadata || {}).chunk_index ?? 0) - Number((Re.metadata || {}).index ?? (Re.metadata || {}).chunk_index ?? 0)).map((Z) => ({ id: Z.id, content: String(Z.content || ""), prefix: String((Z.metadata || {}).contextual_prefix || "") })), q = String((U.find((Z) => Z.node_type === "summary") || {}).content || "");
        return !H.length && !q ? null : { id: s, title: k, summary: q, chunks: H };
      } catch {
        return null;
      }
    }
    let oe = 0;
    async function ne() {
      const s = e.concept, k = ++oe;
      if (m.value = [], b.value = [], C.value = {}, I.value = "", F.value = "rendered", !s || !e.kbId) return;
      const f = _.value;
      if (f.length) {
        c.value = !0;
        try {
          const U = await Promise.all(f.map((q) => ye(q).catch(() => null)));
          if (k !== oe) return;
          m.value = U.filter((q) => q != null), !m.value.length && f.length && (I.value = "The source for this page could not be loaded.");
          const H = await Promise.all(m.value.map((q) => L(q.id, q.title)));
          if (k !== oe) return;
          b.value = H.filter((q) => q != null);
        } catch (U) {
          if (k !== oe) return;
          I.value = U?.response?.data?.error || U?.message || "could not load this page";
        } finally {
          k === oe && (c.value = !1);
        }
      }
    }
    return ue(() => [e.concept?.id, e.kbId], () => ne(), { immediate: !0 }), ue(() => e.concept?.id, () => {
      z.value = null;
    }), (s, k) => a.concept ? (t(), i("article", un, [
      !a.concept.is_root || a.concept.description ? (t(), i("header", pn, [
        a.concept.is_root ? R("", !0) : (t(), i("div", gn, [
          r("h1", xn, N(a.concept.label || a.concept.id), 1),
          V.value ? (t(), le(v(bt), {
            key: 0,
            class: ke(["wr-orig-btn", { on: xe.value }]),
            label: xe.value ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (f) => w(V.value))
          }, null, 8, ["class", "label"])) : R("", !0)
        ])),
        a.concept.description ? (t(), i("p", vn, N(a.concept.description), 1)) : R("", !0)
      ])) : R("", !0),
      c.value ? (t(), i("div", fn, [
        $(v(P), {
          icon: "tabler:loader-2",
          class: "spin big",
          "aria-hidden": "true"
        }),
        k[3] || (k[3] = r("span", null, "Loading page…", -1))
      ])) : I.value ? (t(), i("div", hn, [
        $(v(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, N(I.value), 1)
      ])) : (t(), i(te, { key: 3 }, [
        J.value && (fe.value || G.value) ? (t(), le(v(Kt), {
          key: 0,
          tabs: re.value,
          active: F.value,
          onSelect: k[1] || (k[1] = (f) => F.value = f)
        }, null, 8, ["tabs", "active"])) : R("", !0),
        J.value && F.value === "rendered" ? (t(), i("div", mn, [
          (t(!0), i(te, null, ge(m.value, (f, U) => (t(), i("section", {
            key: f.id,
            class: "wr-doc-page"
          }, [
            m.value.length > 1 ? (t(), i("div", bn, [
              r("span", wn, N(f.title), 1),
              r("button", {
                type: "button",
                class: "wr-doc-toggle",
                "aria-expanded": h(f.id),
                onClick: (H) => u(f.id)
              }, [
                $(v(P), {
                  icon: h(f.id) ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                se(" " + N(h(f.id) ? "Collapse" : "Read"), 1)
              ], 8, kn)
            ])) : R("", !0),
            B.value.get(f.id) ? (t(), le(v(wt), {
              key: 1,
              text: B.value.get(f.id)
            }, null, 8, ["text"])) : R("", !0),
            h(f.id) ? (t(), i("wc-resource-view", {
              key: 2,
              class: "wr-rv",
              "content-type": "text/markdown",
              source: f.content
            }, null, 8, yn)) : R("", !0),
            h(f.id) && he(f).length ? (t(), i("div", _n, [
              (t(!0), i(te, null, ge(he(f), (H) => (t(), i("div", {
                key: H.key,
                class: "wr-prov-row"
              }, [
                r("span", $n, N(H.label), 1),
                H.href ? (t(), i("a", {
                  key: 0,
                  class: "wr-prov-v",
                  href: H.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, N(H.value), 9, Cn)) : (t(), i("span", In, N(H.value), 1))
              ]))), 128))
            ])) : R("", !0),
            U < m.value.length - 1 ? (t(), i("hr", Mn)) : R("", !0)
          ]))), 128))
        ])) : J.value && F.value === "chunks" ? (t(), i("div", zn, [
          (t(!0), i(te, null, ge(b.value, (f) => (t(), i("section", {
            key: f.id,
            class: "wr-chunks-doc"
          }, [
            b.value.length > 1 ? (t(), i("div", Sn, N(f.title), 1)) : R("", !0),
            (t(!0), i(te, null, ge(f.chunks, (U, H) => (t(), i("div", {
              key: U.id,
              class: ke(["wr-chunk", { open: C.value[U.id] }])
            }, [
              r("button", {
                type: "button",
                class: "wr-chunk-h",
                "aria-expanded": !!C.value[U.id],
                onClick: (q) => K(U.id)
              }, [
                r("span", On, N(H + 1), 1),
                r("span", Tn, "Chunk " + N(H + 1), 1),
                $(v(P), {
                  class: "wr-chunk-chev",
                  icon: C.value[U.id] ? "tabler:chevron-up" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Rn),
              U.prefix ? (t(), i("p", En, [
                $(v(P), {
                  icon: "tabler:sparkles",
                  "aria-hidden": "true"
                }),
                r("span", null, N(U.prefix), 1)
              ])) : R("", !0),
              r("p", {
                class: ke(["wr-chunk-body", { clamp: !C.value[U.id] }])
              }, N(U.content), 3)
            ], 2))), 128))
          ]))), 128))
        ])) : T.value.length ? (t(), i("div", Dn, [
          (t(!0), i(te, null, ge(T.value, (f) => (t(), i("button", {
            key: f.id,
            class: "wr-card",
            style: $e({ "--c": v(Te)(f).fill }),
            onClick: (U) => o("navigate", f)
          }, [
            r("span", Fn, [
              r("span", Nn, [
                $(v(P), {
                  icon: v(it)(f),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              $(v(P), {
                class: "wr-card-go",
                icon: "tabler:arrow-up-right",
                "aria-hidden": "true"
              })
            ]),
            r("span", An, N(f.label || f.id), 1),
            f.description ? (t(), i("span", Bn, N(f.description), 1)) : R("", !0),
            r("span", Un, [
              f.document_count ? (t(), i("span", Pn, N(f.document_count) + " " + N(f.document_count === 1 ? "page" : "pages"), 1)) : R("", !0),
              v(ot)(f.id, a.edges) ? (t(), i("span", Wn, N(v(ot)(f.id, a.edges)) + " subtopics", 1)) : R("", !0),
              !f.document_count && !v(ot)(f.id, a.edges) ? (t(), i("span", Vn, "empty")) : R("", !0)
            ])
          ], 12, Ln))), 128))
        ])) : (t(), i("div", jn, [
          $(v(P), {
            icon: "tabler:notebook-off",
            "aria-hidden": "true"
          }),
          k[4] || (k[4] = r("span", null, "This page has no content yet.", -1))
        ])),
        W.value.length || J.value && T.value.length ? (t(), i("footer", Hn, [
          J.value && T.value.length ? (t(), i("div", Xn, [
            k[5] || (k[5] = r("span", { class: "wr-foot-h" }, "Sub-pages", -1)),
            r("div", Yn, [
              (t(!0), i(te, null, ge(T.value, (f) => (t(), i("button", {
                key: f.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", f)
              }, [
                r("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: v(Te)(f).fill })
                }, null, 4),
                se(N(f.label || f.id), 1)
              ], 8, Kn))), 128))
            ])
          ])) : R("", !0),
          W.value.length ? (t(), i("div", Gn, [
            k[6] || (k[6] = r("span", { class: "wr-foot-h" }, "Related", -1)),
            r("div", Zn, [
              (t(!0), i(te, null, ge(W.value, (f) => (t(), i("button", {
                key: f.concept.id,
                class: "wr-foot-link",
                onClick: (U) => o("navigate", f.concept)
              }, [
                r("span", {
                  class: "wr-foot-dot",
                  style: $e({ background: v(Te)(f.concept).fill })
                }, null, 4),
                se(N(f.concept.label || f.concept.id) + " ", 1),
                r("span", Jn, N(f.label), 1)
              ], 8, Qn))), 128))
            ])
          ])) : R("", !0)
        ])) : R("", !0)
      ], 64)),
      $(v(kt), {
        contained: "",
        open: !!z.value,
        title: z.value?.title || a.concept?.label || "",
        "content-type": z.value?.contentType || "",
        "source-url": z.value?.sourceUrl || "",
        onClose: k[2] || (k[2] = (f) => z.value = null)
      }, null, 8, ["open", "title", "content-type", "source-url"])
    ])) : R("", !0);
  }
}), eo = { class: "wk-tax-h" }, to = ["value"], no = {
  key: 2,
  class: "wk-tax-del"
}, oo = { class: "wk-tax-counts" }, ro = ["value"], ao = {
  key: 3,
  class: "wk-tax-err"
}, io = { class: "wk-tax-foot" }, St = /* @__PURE__ */ Ce({
  __name: "TaxonomyForm",
  props: {
    kbId: {},
    mode: {},
    target: {},
    concepts: {},
    edges: {}
  },
  emits: ["saved", "close"],
  setup(a, { emit: d }) {
    const e = a, o = d, p = O(""), c = O(""), I = O(""), m = O(""), b = O(!1), C = O(""), F = S(() => {
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
      return b.value ? !1 : e.mode === "add" ? p.value.trim() !== "" : !u || u.is_root && (e.mode === "move" || e.mode === "delete") ? !1 : e.mode === "rename" ? p.value.trim() !== "" : e.mode === "move" ? I.value !== "" && I.value !== u.id : e.mode === "delete" ? E.value.empty || m.value !== "" : !1;
    });
    ue(() => [e.mode, e.target], () => {
      const u = e.target;
      p.value = e.mode === "rename" && u?.label || "", c.value = e.mode === "rename" && u?.description || "", I.value = u && z.value.get(u.id) || "", m.value = "", C.value = "";
    }, { immediate: !0 });
    async function h() {
      const u = e.target, _ = e.kbId;
      if (!(!_ || !j.value)) {
        b.value = !0, C.value = "";
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
            const W = m.value ? { reassign_to_concept_id: m.value } : {}, { data: J } = await Ie.delete(`/api/v1/kb10/${_}/concepts/${encodeURIComponent(u.id)}`, { data: W });
            if (!J?.success) throw new Error(J?.error || "delete failed");
            T = m.value || z.value.get(u.id) || "";
          }
          o("saved", T);
        } catch (T) {
          C.value = T?.response?.data?.error || T?.message || "taxonomy update failed", Be.handleError(T?.response?.status === 401 ? "auth-expired" : "other", T);
        } finally {
          b.value = !1;
        }
      }
    }
    return (u, _) => (t(), i("form", {
      class: "wk-tax",
      onSubmit: Se(h, ["prevent"])
    }, [
      r("div", eo, [
        r("span", null, N(D.value), 1),
        $(v(Oe), {
          icon: "tabler:x",
          label: "Close",
          size: "sm",
          onClick: _[0] || (_[0] = (T) => o("close"))
        })
      ]),
      a.mode === "add" || a.mode === "rename" ? (t(), i(te, { key: 0 }, [
        Le(r("input", {
          "onUpdate:modelValue": _[1] || (_[1] = (T) => p.value = T),
          class: "wk-tax-input",
          placeholder: "Label",
          maxlength: "120",
          autocomplete: "off"
        }, null, 512), [
          [Ge, p.value]
        ]),
        Le(r("textarea", {
          "onUpdate:modelValue": _[2] || (_[2] = (T) => c.value = T),
          class: "wk-tax-textarea",
          rows: "2",
          placeholder: "Description (optional)"
        }, null, 512), [
          [Ge, c.value]
        ])
      ], 64)) : R("", !0),
      a.mode === "move" ? Le((t(), i("select", {
        key: 1,
        "onUpdate:modelValue": _[3] || (_[3] = (T) => I.value = T),
        class: "wk-tax-input"
      }, [
        _[6] || (_[6] = r("option", {
          value: "",
          disabled: ""
        }, "Select a parent", -1)),
        (t(!0), i(te, null, ge(K.value, (T) => (t(), i("option", {
          key: T.id,
          value: T.id
        }, N(T.label || T.id), 9, to))), 128))
      ], 512)), [
        [ct, I.value]
      ]) : R("", !0),
      a.mode === "delete" ? (t(), i("div", no, [
        r("div", oo, [
          r("span", null, [
            $(v(P), {
              icon: "tabler:list-tree",
              "aria-hidden": "true"
            }),
            se(N(E.value.childCount) + " subtopics", 1)
          ]),
          r("span", null, [
            $(v(P), {
              icon: "tabler:file-text",
              "aria-hidden": "true"
            }),
            se(N(E.value.documentCount) + " pages", 1)
          ])
        ]),
        E.value.empty ? R("", !0) : Le((t(), i("select", {
          key: 0,
          "onUpdate:modelValue": _[4] || (_[4] = (T) => m.value = T),
          class: "wk-tax-input"
        }, [
          _[7] || (_[7] = r("option", {
            value: "",
            disabled: ""
          }, "Reassign contents to…", -1)),
          (t(!0), i(te, null, ge(K.value, (T) => (t(), i("option", {
            key: T.id,
            value: T.id
          }, N(T.label || T.id), 9, ro))), 128))
        ], 512)), [
          [ct, m.value]
        ])
      ])) : R("", !0),
      C.value ? (t(), i("div", ao, [
        $(v(P), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        r("span", null, N(C.value), 1)
      ])) : R("", !0),
      r("div", io, [
        $(v(Ke), {
          variant: "ghost",
          small: "",
          disabled: b.value,
          onClick: _[5] || (_[5] = (T) => o("close"))
        }, {
          default: be(() => [..._[8] || (_[8] = [
            se("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        $(v(Ke), {
          type: "submit",
          small: "",
          variant: a.mode === "delete" ? "danger" : "primary",
          loading: b.value,
          disabled: !j.value
        }, {
          default: be(() => [
            se(N(a.mode === "delete" ? "Delete" : "Save"), 1)
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
}, ho = ["onClick"], mo = {
  key: 0,
  class: "wn-empty"
}, bo = {
  key: 2,
  class: "wn-list",
  role: "listbox",
  "aria-label": "Folder contents"
}, wo = ["tabindex", "onFocus", "onKeydown", "aria-selected", "onClick", "onContextmenu"], ko = { class: "wn-label" }, yo = {
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
  setup(a, { emit: d }) {
    const e = a, o = d;
    function p(E, j) {
      const h = E.currentTarget.getBoundingClientRect();
      o("context", { concept: j, x: h.right, y: h.bottom });
    }
    function c(E, j) {
      o("context", { concept: j, x: E.clientX, y: E.clientY });
    }
    const I = S(() => e.query.trim().length > 0), m = S(() => e.crumbs.length > 1), b = S(() => e.crumbs[e.crumbs.length - 1] || null);
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
      const h = E.currentTarget, u = Array.from(h.parentElement.querySelectorAll('[role="option"]')), _ = u.indexOf(h);
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
    return (E, j) => (t(), i("div", lo, [
      !I.value && b.value ? (t(), i("div", so, [
        m.value ? (t(), i("button", {
          key: 0,
          class: "wn-up",
          "aria-label": "Up one level",
          onClick: j[0] || (j[0] = (h) => o("up"))
        }, [
          $(v(P), {
            icon: "tabler:corner-left-up",
            "aria-hidden": "true"
          })
        ])) : R("", !0),
        r("span", {
          class: "wn-folder-name",
          title: C(b.value)
        }, N(C(b.value)), 9, co)
      ])) : R("", !0),
      I.value ? (t(), i("ul", uo, [
        (t(!0), i(te, null, ge(a.results, (h) => (t(), i("li", {
          key: h.concept.id,
          class: ke(["wn-item", { active: h.concept.id === a.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: G(h.concept.id),
          onFocus: (u) => D.value = h.concept.id,
          onKeydown: (u) => K(u, h),
          "aria-selected": h.concept.id === a.selectedId,
          onClick: (u) => z(h),
          onContextmenu: Se((u) => c(u, h.concept), ["prevent"])
        }, [
          r("span", {
            class: "wn-ico",
            style: $e({ color: v(Te)(h.concept).fill })
          }, [
            $(v(P), {
              icon: h.isFolder ? v(it)(h.concept) : v(dt)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          r("span", go, [
            r("span", xo, N(C(h.concept)), 1),
            h.path.length ? (t(), i("span", vo, [
              (t(!0), i(te, null, ge(h.path, (u, _) => (t(), i(te, {
                key: u.id
              }, [
                _ ? (t(), i("span", fo, "/")) : R("", !0),
                se(N(u.label || u.id), 1)
              ], 64))), 128))
            ])) : R("", !0)
          ]),
          r("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((u) => p(u, h.concept), ["stop"])
          }, [
            $(v(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, ho),
          h.isFolder ? (t(), le(v(P), {
            key: 0,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, po))), 128)),
        a.results.length ? R("", !0) : (t(), i("li", mo, "No matches."))
      ])) : (t(), i("ul", bo, [
        (t(!0), i(te, null, ge(a.entries, (h) => (t(), i("li", {
          key: h.concept.id,
          class: ke(["wn-item", { active: h.concept.id === a.selectedId, folder: h.isFolder }]),
          role: "option",
          tabindex: G(h.concept.id),
          onFocus: (u) => D.value = h.concept.id,
          onKeydown: (u) => K(u, h),
          "aria-selected": h.concept.id === a.selectedId,
          onClick: (u) => F(h),
          onContextmenu: Se((u) => c(u, h.concept), ["prevent"])
        }, [
          r("span", {
            class: "wn-ico",
            style: $e({ color: v(Te)(h.concept).fill })
          }, [
            $(v(P), {
              icon: h.isFolder ? v(it)(h.concept) : v(dt)(h.concept),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 4),
          r("span", ko, N(C(h.concept)), 1),
          h.isFolder ? (t(), i("span", yo, N(h.childCount), 1)) : R("", !0),
          r("button", {
            class: "wn-kebab",
            "aria-label": "Concept actions",
            onClick: Se((u) => p(u, h.concept), ["stop"])
          }, [
            $(v(P), {
              icon: "tabler:dots-vertical",
              "aria-hidden": "true"
            })
          ], 8, _o),
          h.isFolder ? (t(), le(v(P), {
            key: 1,
            class: "wn-go",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })) : R("", !0)
        ], 42, wo))), 128)),
        a.entries.length ? R("", !0) : (t(), i("li", $o, "This level is empty."))
      ]))
    ]));
  }
}), Io = { class: "cn" }, Mo = { class: "wn-filter" }, zo = {
  class: "kx-rail-body",
  "aria-label": "Contents"
}, Rt = /* @__PURE__ */ Ce({
  __name: "ConceptNavRail",
  props: {
    concepts: {},
    edges: {},
    selectedId: {}
  },
  emits: ["select", "context"],
  setup(a, { emit: d }) {
    const e = a, o = d, p = S(() => $t(e.concepts, e.edges)), c = S(() => Gt(p.value)), I = O(""), m = O(""), b = S(() => c.value.byId.get(I.value)), C = S(() => I.value ? Zt(I.value, c.value.byId, c.value.parentOf) : []), F = S(() => Qt(b.value)), z = S(() => Jt(m.value, c.value.byId, c.value.parentOf));
    function D(h) {
      const u = c.value.byId.get(h);
      if (u && u.children.length) return h;
      const _ = c.value.parentOf.get(h);
      return _ || p.value[0]?.concept.id || h;
    }
    function B() {
      return p.value[0]?.concept.id || "";
    }
    function G(h) {
      const u = h ? D(h) : I.value || B();
      u && u !== I.value && (I.value = u);
    }
    function K(h) {
      I.value = h.id, m.value = "", o("select", h.id);
    }
    function E(h) {
      o("select", h.id);
    }
    function j() {
      const h = c.value.parentOf.get(I.value);
      h && (I.value = h, o("select", h));
    }
    return ue(() => e.selectedId, (h) => G(h), { immediate: !0 }), ue([() => c.value, I], () => {
      if (I.value && c.value.byId.has(I.value)) return;
      const h = e.selectedId ? D(e.selectedId) : B();
      h && (I.value = h);
    }, { immediate: !0 }), (h, u) => (t(), i("div", Io, [
      r("div", Mo, [
        $(v(P), {
          class: "wn-filter-ic",
          icon: "tabler:filter-search",
          "aria-hidden": "true"
        }),
        Le(r("input", {
          "onUpdate:modelValue": u[0] || (u[0] = (_) => m.value = _),
          class: "wn-filter-input",
          type: "text",
          placeholder: "Filter topics & pages…",
          "aria-label": "Filter the contents"
        }, null, 512), [
          [Ge, m.value]
        ]),
        m.value ? (t(), i("button", {
          key: 0,
          class: "wn-filter-x",
          "aria-label": "Clear filter",
          onClick: u[1] || (u[1] = (_) => m.value = "")
        }, [
          $(v(P), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : R("", !0)
      ]),
      r("nav", zo, [
        $(Co, {
          crumbs: C.value,
          entries: F.value,
          "selected-id": a.selectedId,
          query: m.value,
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
  setup(a, { emit: d }) {
    const e = a, o = d, p = S(() => {
      const b = e.items.filter((B) => !B.divider).length, C = e.items.filter((B) => B.divider).length, F = (e.title ? 30 : 0) + 10 + b * 34 + C * 9, z = Math.max(8, Math.min(e.x, window.innerWidth - 224 - 8)), D = Math.max(8, Math.min(e.y, window.innerHeight - F - 8));
      return { left: `${z}px`, top: `${D}px`, width: "224px" };
    });
    function c(m) {
      m.key === "Escape" && o("close");
    }
    lt(() => window.addEventListener("keydown", c)), Ze(() => window.removeEventListener("keydown", c));
    function I(m) {
      m.disabled || m.divider || (o("pick", m.id), o("close"));
    }
    return (m, b) => a.open ? (t(), i("div", {
      key: 0,
      class: "kb-menu-backdrop",
      onMousedown: b[2] || (b[2] = (C) => o("close")),
      onContextmenu: b[3] || (b[3] = Se((C) => o("close"), ["prevent"])),
      onWheel: b[4] || (b[4] = Se((C) => o("close"), ["prevent"]))
    }, [
      r("div", {
        class: "kb-menu",
        style: $e(p.value),
        role: "menu",
        onMousedown: b[0] || (b[0] = Se(() => {
        }, ["stop"])),
        onContextmenu: b[1] || (b[1] = Se(() => {
        }, ["prevent", "stop"]))
      }, [
        a.title ? (t(), i("div", So, N(a.title), 1)) : R("", !0),
        (t(!0), i(te, null, ge(a.items, (C, F) => (t(), i(te, {
          key: C.id + ":" + F
        }, [
          C.divider ? (t(), i("div", Ro)) : (t(), i("button", {
            key: 1,
            class: ke(["kb-menu-item", { danger: C.danger, disabled: C.disabled }]),
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
            r("span", null, N(C.label), 1)
          ], 10, Oo))
        ], 64))), 128))
      ], 36)
    ], 32)) : R("", !0);
  }
}), Tt = "kb10:wiki:navWidth", To = 220, Eo = 560;
function Et(a) {
  return Math.max(To, Math.min(Eo, a));
}
function Do() {
  const a = Number(localStorage.getItem(Tt));
  return Number.isFinite(a) && a > 0 ? Et(a) : 300;
}
function Dt() {
  const a = O(Do()), d = O(null), e = O(!1);
  function o(I) {
    const m = d.value;
    if (!m) return;
    const b = m.getBoundingClientRect();
    a.value = Et(I.clientX - b.left);
  }
  function p() {
    e.value = !1, window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", p), localStorage.setItem(Tt, String(Math.round(a.value)));
  }
  function c(I) {
    I.preventDefault(), e.value = !0, window.addEventListener("pointermove", o), window.addEventListener("pointerup", p);
  }
  return Ze(p), { navWidth: a, railRef: d, navDragging: e, onStart: c };
}
const Lo = { class: "kb-railtop" }, Fo = { class: "kb-railtop-acts" }, No = {
  key: 0,
  class: "kx-main-scroll"
}, Ao = {
  key: 1,
  class: "kx-main-scroll wk-doc-inner"
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
  setup(a, { emit: d }) {
    const e = a, o = d, { navWidth: p, railRef: c, navDragging: I, onStart: m } = Dt(), b = S(() => {
      const A = /* @__PURE__ */ new Map();
      for (const w of e.concepts) A.set(w.id, w);
      return A;
    }), C = S(() => e.selectedId && b.value.get(e.selectedId) || null), F = S(() => !!C.value && C.value.node_type !== "document"), z = S(() => {
      const A = /* @__PURE__ */ new Map();
      for (const w of e.edges)
        (w.edge_type === "subtopic_of" || w.edge_type === "categorized_as") && b.value.has(w.from_node_id) && b.value.has(w.to_node_id) && A.set(w.from_node_id, w.to_node_id);
      return A;
    }), D = S(() => {
      const A = [];
      let w = e.selectedId;
      const V = /* @__PURE__ */ new Set();
      for (; w && !V.has(w); ) {
        V.add(w);
        const fe = b.value.get(w);
        if (!fe) break;
        A.unshift(fe), w = z.value.get(w);
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
      const w = E.value?.$el?.getBoundingClientRect();
      B.value = { open: !0, x: w ? w.right : 0, y: w ? w.bottom : 0, concept: C.value };
    }
    const h = O(""), u = O(null);
    function _(A) {
      const w = B.value.concept;
      if (w) {
        if (A === "open") {
          o("select", w.id);
          return;
        }
        u.value = w, h.value = A;
      }
    }
    function T(A) {
      h.value = "", A && o("select", A), o("changed");
    }
    const W = O(!1);
    function J(A) {
      const w = b.value.get(A.id) || (A.parent_id ? b.value.get(A.parent_id) : null);
      w && o("select", w.id), W.value = !1;
    }
    const re = O("");
    function ce() {
      re.value = "", o("changed");
    }
    return (A, w) => (t(), i("div", {
      ref_key: "railRef",
      ref: c,
      class: ke(["wk", { "wk-dragging": v(I) }]),
      style: $e({ "--kx-rail-width": v(p) + "px" })
    }, [
      a.concepts.length ? (t(), le(v(Ct), { key: 0 }, {
        rail: be(() => [
          r("div", Lo, [
            r("div", Fo, [
              $(v(Oe), {
                icon: "tabler:search",
                label: "Search",
                active: W.value,
                onClick: w[0] || (w[0] = (V) => W.value = !W.value)
              }, null, 8, ["active"]),
              $(v(Oe), {
                icon: "tabler:plus",
                label: "Add page",
                onClick: w[1] || (w[1] = (V) => re.value = "add")
              }),
              $(v(Oe), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: a.loading,
                spin: a.loading,
                onClick: w[2] || (w[2] = (V) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Rt, {
            concepts: a.concepts,
            edges: a.edges,
            "selected-id": a.selectedId,
            onSelect: w[3] || (w[3] = (V) => o("select", V)),
            onContext: K
          }, null, 8, ["concepts", "edges", "selected-id"]),
          r("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: w[4] || (w[4] = //@ts-ignore
            (...V) => v(m) && v(m)(...V))
          }, [...w[11] || (w[11] = [
            r("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: be(() => [
          W.value ? (t(), i("div", No, [
            $(v(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: a.canAnswer,
              placeholder: "Search this wiki…",
              onOpen: J,
              onClose: w[5] || (w[5] = (V) => W.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), i("div", Ao, [
            D.value.length || F.value ? (t(), i("div", Bo, [
              D.value.length ? (t(), i("nav", Uo, [
                (t(!0), i(te, null, ge(D.value, (V, fe) => (t(), i(te, {
                  key: V.id
                }, [
                  fe ? (t(), le(v(P), {
                    key: 0,
                    class: "wk-crumb-sep",
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })) : R("", !0),
                  r("button", {
                    class: "wk-crumb",
                    onClick: (xe) => o("select", V.id)
                  }, N(V.label || V.id), 9, Po)
                ], 64))), 128))
              ])) : R("", !0),
              F.value ? (t(), i("div", Wo, [
                $(v(Oe), {
                  ref_key: "structBtnRef",
                  ref: E,
                  icon: "tabler:dots",
                  label: "Edit structure",
                  size: "sm",
                  active: !!h.value,
                  onClick: j
                }, null, 8, ["active"])
              ])) : R("", !0)
            ])) : R("", !0),
            h.value ? (t(), le(St, {
              key: 1,
              "kb-id": a.kbId,
              mode: h.value,
              target: u.value,
              concepts: a.concepts,
              edges: a.edges,
              onSaved: T,
              onClose: w[6] || (w[6] = (V) => h.value = "")
            }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0),
            $(qn, {
              "kb-id": a.kbId,
              concept: C.value,
              edges: a.edges,
              "concepts-by-id": b.value,
              onNavigate: w[7] || (w[7] = (V) => o("select", V.id))
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
        onCta: w[8] || (w[8] = (V) => re.value = "add")
      })),
      $(v(Ye), {
        open: re.value === "add",
        title: "Add a page",
        icon: "tabler:plus",
        onClose: w[9] || (w[9] = (V) => re.value = "")
      }, {
        default: be(() => [
          $(zt, {
            "kb-id": a.kbId,
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
        onClose: w[10] || (w[10] = (V) => B.value.open = !1)
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
    let p = 1 / 0, c = 1 / 0, I = -1 / 0, m = -1 / 0;
    for (let z = 0; z < o; z++) {
      const D = e[z];
      D.x < p && (p = D.x), D.x > I && (I = D.x), D.y < c && (c = D.y), D.y > m && (m = D.y);
    }
    const b = Math.max(I - p, m - c, 1) + 1, C = { x0: p, y0: c, x1: p + b, y1: c + b, mass: 0, cx: 0, cy: 0, node: null, kids: null };
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
    const o = (d.x0 + d.x1) / 2, p = (d.y0 + d.y1) / 2, c = e.x >= o, I = e.y >= p, m = (I ? 2 : 0) + (c ? 1 : 0);
    let b = d.kids[m];
    return b || (b = {
      x0: c ? o : d.x0,
      x1: c ? d.x1 : o,
      y0: I ? p : d.y0,
      y1: I ? d.y1 : p,
      mass: 0,
      cx: 0,
      cy: 0,
      node: null,
      kids: null
    }, d.kids[m] = b), b;
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
    const m = e.x1 - e.x0;
    if (!e.kids || m * m / I < jo) {
      const b = I < ft ? ft : I, C = Math.sqrt(I), F = o * e.mass / b;
      d.vx -= p / C * F, d.vy -= c / C * F;
      return;
    }
    for (const b of e.kids) b && this.repel(d, b, o);
  }
  applyLinks(d) {
    for (const e of this.links) {
      const o = this.nodes[e.source], p = this.nodes[e.target];
      if (!o || !p) continue;
      const c = p.x - o.x, I = p.y - o.y, m = Math.sqrt(c * c + I * I) || 1e-6, b = (m - e.distance) / m * d * e.strength, C = c * b, F = I * b;
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
    for (let m = 0; m < e; m++) d[m].radius > o && (o = d[m].radius);
    const p = o * 2 + 52, c = /* @__PURE__ */ new Map(), I = (m, b) => m * 73856093 ^ b * 19349663;
    for (let m = 0; m < e; m++) {
      const b = Math.floor(d[m].x / p), C = Math.floor(d[m].y / p), F = I(b, C), z = c.get(F);
      z ? z.push(m) : c.set(F, [m]);
    }
    for (let m = 0; m < e; m++) {
      const b = d[m], C = Math.floor(b.x / p), F = Math.floor(b.y / p);
      for (let z = -1; z <= 1; z++) for (let D = -1; D <= 1; D++) {
        const B = c.get(I(C + z, F + D));
        if (B)
          for (const G of B) {
            if (G <= m) continue;
            const K = d[G], E = K.x - b.x, j = K.y - b.y, h = b.radius + K.radius + 44, u = E * E + j * j;
            if (u < h * h && u > 0) {
              const _ = Math.sqrt(u), T = (h - _) / _ * 0.5, W = E * T, J = j * T;
              b.x -= W, b.y -= J, K.x += W, K.y += J;
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
const Xo = ["transform"], Yo = { class: "gx-links" }, Ko = ["d"], Go = { class: "gx-nodes" }, Zo = ["transform", "onMousedown", "onMouseenter", "onContextmenu", "onDblclick"], Qo = ["r"], Jo = ["fill", "stroke"], qo = ["r", "fill", "stroke", "stroke-width"], er = ["cx", "cy"], tr = ["x", "y"], nr = ["y"], or = /* @__PURE__ */ Ce({
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
  setup(a, { expose: d, emit: e }) {
    const o = a;
    function p(x) {
      return !o.visibleIds || o.visibleIds.has(x);
    }
    function c(x) {
      return o.colors?.get(x.id) || Te(x);
    }
    const I = e, m = O(null), b = O(null), C = O(0), F = O(0), z = O(1), D = O(!1);
    ue(z, (x) => I("scale", x));
    const B = O([]), G = O([]);
    let K = null, E = null, j = 0, h = "";
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
    function re() {
      const x = b.value?.getBoundingClientRect();
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
      const me = y.filter((g) => g.is_root || !Y.has(g.id)).map((g) => g.id), pe = /* @__PURE__ */ new Map(), we = /* @__PURE__ */ new Set(), ie = (g) => {
        const Q = pe.get(g);
        if (Q !== void 0) return Q;
        if (we.has(g)) return 1;
        we.add(g);
        const ae = ee.get(g) || [];
        let ve = ae.length ? 0 : 1;
        for (const De of ae) ve += ie(De);
        return ve = Math.max(1, ve), pe.set(g, ve), ve;
      };
      for (const g of me) ie(g);
      const de = 150, _e = /* @__PURE__ */ new Map(), ze = /* @__PURE__ */ new Set(), Ne = /* @__PURE__ */ new Set();
      let Ae = 0;
      const l = (g, Q, ae, ve) => {
        if (Ne.has(g)) return;
        Ne.add(g), ze.add(g);
        const De = (ae + ve) / 2, We = Q * de, st = Ae++ * 2.399963;
        _e.set(g, { x: x + We * Math.cos(De) + Math.cos(st) * 4, y: M + We * Math.sin(De) + Math.sin(st) * 4 });
        const tt = ee.get(g) || [];
        if (!tt.length) return;
        const Lt = tt.reduce((je, He) => je + ie(He), 0) || 1;
        let nt = ae;
        for (const je of tt) {
          const He = (ve - ae) * (ie(je) / Lt);
          l(je, Q + 1, nt, nt + He), nt += He;
        }
      };
      if (me.length === 1)
        l(me[0], 0, -Math.PI / 2, Math.PI * 1.5);
      else {
        const g = me.reduce((ae, ve) => ae + ie(ve), 0) || 1;
        let Q = -Math.PI / 2;
        for (const ae of me) {
          const ve = Math.PI * 2 * (ie(ae) / g);
          l(ae, 1, Q, Q + ve), Q += ve;
        }
      }
      const n = y.filter((g) => !ze.has(g.id));
      if (n.length) {
        let g = de;
        for (const Q of _e.values()) {
          const ae = Math.hypot(Q.x - x, Q.y - M);
          ae > g && (g = ae);
        }
        n.forEach((Q, ae) => {
          const ve = ae / n.length * Math.PI * 2;
          _e.set(Q.id, { x: x + (g + de) * Math.cos(ve), y: M + (g + de) * Math.sin(ve) });
        });
      }
      return _e;
    }
    function w() {
      const { w: x, h: M } = re(), y = x / 2, X = M / 2, ee = o.concepts, Y = ee.length, me = A(y, X);
      if (Y < 3) return me;
      const pe = /* @__PURE__ */ new Map();
      ee.forEach((l, n) => pe.set(l.id, n));
      const we = ee.map((l) => {
        const n = me.get(l.id) || { x: y, y: X };
        return { id: l.id, x: n.x, y: n.y, vx: 0, vy: 0, fx: null, fy: null, radius: J(l) };
      }), ie = Y > 250 ? 150 : 120, de = Y > 250 ? -1100 : -700, _e = o.edges.filter((l) => pe.has(l.from_node_id) && pe.has(l.to_node_id)).map((l) => ({
        source: pe.get(l.from_node_id),
        target: pe.get(l.to_node_id),
        distance: l.edge_type === "subtopic_of" ? ie * 0.8 : ie,
        strength: l.edge_type === "subtopic_of" ? 0.7 : 0.3
      })), ze = new Ho(we, _e, x, M, de), Ne = Y > 600 ? 70 : Y > 250 ? 110 : 150;
      for (let l = 0; l < Ne; l++) ze.tick();
      ze.resolveOverlaps(Y > 600 ? 50 : 80);
      const Ae = /* @__PURE__ */ new Map();
      for (const l of we) Ae.set(l.id, { x: l.x, y: l.y });
      return Ae;
    }
    function V(x) {
      const { w: M, h: y } = re();
      if ((M < 2 || y < 2) && j < 60) {
        j++, requestAnimationFrame(() => V(x));
        return;
      }
      j = 0;
      const X = w();
      u.clear();
      for (const [ee, Y] of X) u.set(ee, Y);
      he(), x && (ye(), requestAnimationFrame(() => ye())), D.value = !0;
    }
    function fe() {
      h = ce(), V(!0);
    }
    function xe() {
      if (!o.concepts.length) {
        B.value = [], G.value = [], D.value = !1, h = "", u.clear();
        return;
      }
      const x = ce();
      if (x === h) {
        he();
        return;
      }
      const M = !h;
      h = x, rt(() => V(M));
    }
    function he() {
      B.value = o.concepts.filter((x) => p(x.id)).map((x) => {
        const M = u.get(x.id) || { x: 0, y: 0 };
        return { id: x.id, x: M.x, y: M.y, radius: J(x), concept: x, isDoc: x.node_type === "document" };
      }), G.value = o.edges.filter((x) => u.has(x.from_node_id) && u.has(x.to_node_id) && p(x.from_node_id) && p(x.to_node_id)).map((x) => {
        const M = u.get(x.from_node_id), y = u.get(x.to_node_id), X = (M.x + y.x) / 2, ee = (M.y + y.y) / 2, Y = y.x - M.x, me = y.y - M.y, pe = Math.hypot(Y, me) || 1, we = Math.min(28, pe * 0.12), ie = X - me / pe * we, de = ee + Y / pe * we;
        return {
          id: x.id,
          path: `M${M.x},${M.y} Q${ie},${de} ${y.x},${y.y}`,
          edge_type: x.edge_type || "",
          from: x.from_node_id,
          to: x.to_node_id
        };
      });
    }
    function ye() {
      if (!u.size) return;
      const { w: x, h: M } = re();
      let y = 1 / 0, X = 1 / 0, ee = -1 / 0, Y = -1 / 0;
      for (const de of o.concepts) {
        if (!p(de.id)) continue;
        const _e = u.get(de.id);
        if (!_e) continue;
        const ze = J(de);
        y = Math.min(y, _e.x - ze), X = Math.min(X, _e.y - ze), ee = Math.max(ee, _e.x + ze), Y = Math.max(Y, _e.y + ze);
      }
      if (!Number.isFinite(y)) return;
      const me = Math.max(64, Math.min(x, M) * 0.12);
      y -= me, X -= me, ee += me, Y += me;
      const pe = Math.max(ee - y, 1), we = Math.max(Y - X, 1), ie = Math.max(0.25, Math.min(x / pe, M / we, 1.25));
      z.value = ie, C.value = (x - pe * ie) / 2 - y * ie, F.value = (M - we * ie) / 2 - X * ie;
    }
    function L(x) {
      const M = u.get(x);
      if (!M) return;
      const { w: y, h: X } = re(), ee = Math.max(z.value, 1.1);
      z.value = ee, C.value = y / 2 - M.x * ee, F.value = X / 2 - M.y * ee;
    }
    let oe = !1, ne = !1, s = { x: 0, y: 0, tx: 0, ty: 0 };
    function k(x) {
      x.preventDefault();
      const M = m.value.getBoundingClientRect(), y = x.clientX - M.left, X = x.clientY - M.top, ee = x.deltaY < 0 ? 1.12 : 1 / 1.12, Y = Math.max(0.1, Math.min(6, z.value * ee));
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
      if (!q || !m.value) return;
      if (!Z) {
        const ee = x.clientX - Re, Y = x.clientY - Ue;
        if (ee * ee + Y * Y < 9) return;
        Z = !0;
      }
      const M = m.value.getBoundingClientRect(), y = (x.clientX - M.left - C.value) / z.value, X = (x.clientY - M.top - F.value) / z.value;
      Number.isFinite(y) && Number.isFinite(X) && (u.set(q, { x: y, y: X }), he());
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
      const { w: M, h: y } = re(), X = Math.max(0.1, Math.min(6, z.value * x));
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
      h && he();
    }), ue(b, (x) => {
      x && !K && (K = new ResizeObserver(() => {
        o.concepts.length && (E && clearTimeout(E), E = setTimeout(() => {
          h && ye();
        }, 120));
      }), K.observe(x)), x && o.concepts.length && !h && xe();
    }), Pt(() => {
      K?.disconnect(), E && clearTimeout(E), H(), window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", Fe);
    }), d({ fit: ye, focus: L, zoomBy: Je, relayout: fe }), (x, M) => (t(), i("div", {
      ref_key: "containerRef",
      ref: b,
      class: "gx-canvas"
    }, [
      (t(), i("svg", {
        ref_key: "svgRef",
        ref: m,
        class: "gx-svg",
        onWheel: k,
        onMousedown: f,
        onContextmenu: M[1] || (M[1] = Se(() => {
        }, ["prevent"]))
      }, [
        M[2] || (M[2] = r("defs", null, [
          r("pattern", {
            id: "gx-grid",
            width: "26",
            height: "26",
            patternUnits: "userSpaceOnUse"
          }, [
            r("circle", {
              cx: "1",
              cy: "1",
              r: "1",
              class: "gx-grid-dot"
            })
          ])
        ], -1)),
        M[3] || (M[3] = r("rect", {
          class: "gx-grid-bg",
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
          fill: "url(#gx-grid)"
        }, null, -1)),
        r("g", {
          transform: `translate(${C.value},${F.value}) scale(${z.value})`,
          style: $e({ opacity: D.value ? 1 : 0, transition: "opacity .35s ease" })
        }, [
          r("g", Yo, [
            (t(!0), i(te, null, ge(G.value, (y) => (t(), i("path", {
              key: y.id,
              d: y.path,
              class: ke(Ee(y))
            }, null, 10, Ko))), 128))
          ]),
          r("g", Go, [
            (t(!0), i(te, null, ge(B.value, (y) => (t(), i("g", {
              key: y.id,
              transform: `translate(${y.x},${y.y})`,
              class: ke(["gx-node", { dim: qe(y.id), sel: y.id === a.selectedId, hov: y.id === _.value }]),
              onMousedown: (X) => Qe(X, y.id),
              onMouseenter: (X) => _.value = y.id,
              onMouseleave: M[0] || (M[0] = (X) => _.value = null),
              onContextmenu: Se((X) => I("node-context", { id: y.id, x: X.clientX, y: X.clientY }), ["prevent", "stop"]),
              onDblclick: Se((X) => I("node-dblclick", y.id), ["stop"])
            }, [
              y.id === a.selectedId ? (t(), i("circle", {
                key: 0,
                r: y.radius + 7,
                class: "gx-halo",
                style: $e({ stroke: c(y.concept).fill })
              }, null, 12, Qo)) : R("", !0),
              y.isDoc ? (t(), i("rect", {
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
              }, null, 8, Jo)) : (t(), i("circle", {
                key: 2,
                r: y.radius,
                fill: c(y.concept).fill,
                stroke: c(y.concept).stroke,
                "stroke-width": y.concept.is_root ? 3 : 2,
                class: "gx-shape"
              }, null, 8, qo)),
              !y.isDoc && (y.concept.document_count || 0) > 0 ? (t(), i(te, { key: 3 }, [
                r("circle", {
                  cx: y.radius * 0.72,
                  cy: -y.radius * 0.72,
                  r: "7.5",
                  class: "gx-badge-bg"
                }, null, 8, er),
                r("text", {
                  x: y.radius * 0.72,
                  y: -y.radius * 0.72,
                  "text-anchor": "middle",
                  "dominant-baseline": "central",
                  class: "gx-badge-txt"
                }, N(y.concept.document_count), 9, tr)
              ], 64)) : R("", !0),
              et(y) ? (t(), i("text", {
                key: 4,
                y: y.isDoc ? 20 : y.radius + 15,
                "text-anchor": "middle",
                class: ke(["gx-label", { root: y.concept.is_root }])
              }, N(v(qt)(y.concept.label, y.isDoc ? 26 : 24)), 11, nr)) : R("", !0)
            ], 42, Zo))), 128))
          ])
        ], 12, Xo)
      ], 544))
    ], 512));
  }
}), rr = { class: "gx-ins-id" }, ar = { class: "gx-ins-name" }, ir = { class: "gx-ins-body" }, lr = { class: "gx-ins-stats" }, sr = {
  key: 0,
  class: "gx-stat"
}, cr = {
  key: 1,
  class: "gx-stat"
}, dr = {
  key: 1,
  class: "gx-rel-group"
}, ur = { class: "gx-rel-title" }, pr = { class: "kc-refs" }, gr = ["onClick"], xr = { class: "kc-ref-label" }, vr = {
  key: 0,
  class: "gx-rel-group"
}, fr = { class: "gx-rel-title" }, hr = ["onClick"], mr = { class: "gx-rel-kind" }, br = { class: "gx-rel-label" }, wr = {
  key: 1,
  class: "gx-rel-group"
}, kr = { class: "gx-rel-title" }, yr = ["onClick"], _r = { class: "gx-rel-kind" }, $r = { class: "gx-rel-label" }, Cr = {
  key: 3,
  class: "gx-ins-loading"
}, Ir = {
  key: 4,
  class: "gx-ins-content"
}, Mr = {
  key: 0,
  class: "gx-ins-doc-t"
}, zr = ["content-type", "source"], Sr = {
  key: 0,
  class: "gx-ins-clamp-fade",
  "aria-hidden": "true"
}, Rr = ["aria-expanded"], Or = {
  key: 5,
  class: "gx-ins-empty"
}, ht = "kb10:inspect:width", Tr = 320, Er = 860, Dr = 560, Lr = /* @__PURE__ */ Ce({
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
  setup(a, { emit: d }) {
    const e = a, o = d, p = S(() => e.colorOf?.(e.concept.id) || Te(e.concept).fill);
    function c(s) {
      return e.colorOf?.(s) || Te({}).fill;
    }
    const I = S(() => e.concept.node_type === "document"), m = S(() => e.edges.filter((s) => s.from_node_id === e.concept.id).map((s) => ({ id: s.id, kind: ut[s.edge_type || ""] || s.edge_type || "related", otherId: s.to_node_id, label: s.to_label || e.labelOf(s.to_node_id) }))), b = S(() => e.edges.filter((s) => s.to_node_id === e.concept.id).map((s) => ({ id: s.id, kind: ut[s.edge_type || ""] || s.edge_type || "related", otherId: s.from_node_id, label: s.from_label || e.labelOf(s.from_node_id) }))), C = S(() => m.value.length + b.value.length), F = S(() => I.value ? en(e.concept.id, e.edges).map((s) => ({ id: s.id, label: s.label || e.labelOf(s.id) })) : []), z = S(() => {
      if (I.value) return [e.concept.id];
      const s = [];
      for (const k of e.edges)
        k.edge_type === "categorized_as" && k.to_node_id === e.concept.id && s.push(k.from_node_id);
      return s;
    }), D = O(!1), B = O([]), G = O(""), K = S(() => B.value.find((s) => _t(s.origMime)) || null), E = S(() => G.value ? { text: G.value, label: "Summary", icon: "tabler:file-description" } : e.concept.description ? { text: e.concept.description, label: "Description", icon: "tabler:align-left" } : null);
    async function j(s) {
      try {
        const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?node_id=${encodeURIComponent(s)}`);
        if (!k?.success || !k.node) return null;
        const f = k.node, U = String(f.content || "");
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
    async function h(s) {
      try {
        const { data: k } = await Ie.get(`/api/v1/kb10/${e.kbId}/browse?parent_id=${encodeURIComponent(s)}&include_content=true&limit=200`);
        if (!k?.success) return "";
        const f = k.nodes?.find((U) => U.node_type === "summary");
        return String(f?.content || "");
      } catch {
        return "";
      }
    }
    let u = 0;
    async function _() {
      const s = ++u;
      B.value = [], G.value = "", xe.value = !1, he.value = !1;
      const k = z.value;
      if (k.length) {
        D.value = !0;
        try {
          const f = await Promise.all(k.map(j));
          if (s !== u) return;
          if (B.value = f.filter((U) => U != null), I.value) {
            const U = await h(e.concept.id);
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
      return Math.max(Tr, Math.min(Er, s));
    }
    function W() {
      const s = Number(localStorage.getItem(ht));
      return Number.isFinite(s) && s > 0 ? T(s) : 430;
    }
    const J = O(W()), re = O(null), ce = O(!1);
    function A(s) {
      const k = re.value;
      if (!k) return;
      const f = k.getBoundingClientRect();
      J.value = T(f.right - s.clientX);
    }
    function w() {
      ce.value = !1, window.removeEventListener("pointermove", A), window.removeEventListener("pointerup", w), localStorage.setItem(ht, String(Math.round(J.value)));
    }
    function V(s) {
      s.preventDefault(), ce.value = !0, window.addEventListener("pointermove", A), window.addEventListener("pointerup", w);
    }
    const fe = O(null), xe = O(!1), he = O(!1);
    function ye() {
      const s = fe.value;
      if (!s) {
        he.value = !1;
        return;
      }
      he.value = s.scrollHeight - Dr > 24;
    }
    let L = null;
    function oe() {
      L?.disconnect();
      const s = fe.value;
      s && (L = new ResizeObserver(() => ye()), L.observe(s), rt(ye));
    }
    const ne = S(() => he.value && !xe.value);
    return ue([B, D], () => {
      D.value || rt(oe);
    }), ue(() => e.concept.id, _, { immediate: !0 }), Ze(() => {
      L?.disconnect(), w();
    }), (s, k) => (t(), i("aside", {
      ref_key: "asideRef",
      ref: re,
      class: ke(["gx-inspect", { dragging: ce.value }]),
      style: $e({ width: J.value + "px" })
    }, [
      r("div", {
        class: "gx-ins-resizer",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize inspector",
        onPointerdown: V
      }, [...k[3] || (k[3] = [
        r("span", { class: "gx-ins-resizer-grip" }, null, -1)
      ])], 32),
      r("header", {
        class: "gx-ins-h",
        style: $e({ "--accent": p.value })
      }, [
        k[4] || (k[4] = r("span", { class: "gx-ins-dot" }, null, -1)),
        r("div", rr, [
          r("h3", ar, N(a.concept.label), 1),
          K.value ? (t(), le(v(bt), {
            key: 0,
            class: ke(["gx-ins-orig-btn", { on: a.originalOpen }]),
            label: a.originalOpen ? "Hide original" : "View original",
            onOpen: k[0] || (k[0] = (f) => o("toggle-original"))
          }, null, 8, ["class", "label"])) : R("", !0)
        ]),
        r("button", {
          class: "gx-ins-x",
          "aria-label": "Close",
          onClick: k[1] || (k[1] = (f) => o("close"))
        }, [
          $(v(P), { icon: "tabler:x" })
        ])
      ], 4),
      r("div", ir, [
        r("div", lr, [
          a.concept.document_count ? (t(), i("div", sr, [
            $(v(P), { icon: "tabler:files" }),
            r("span", null, N(a.concept.document_count) + " linked", 1)
          ])) : R("", !0),
          C.value ? (t(), i("div", cr, [
            $(v(P), { icon: "tabler:arrows-split-2" }),
            k[5] || (k[5] = r("span", null, "relations", -1)),
            $(v(an), { value: C.value }, null, 8, ["value"])
          ])) : R("", !0)
        ]),
        E.value ? (t(), le(v(wt), {
          key: a.concept.id,
          icon: E.value.icon,
          label: E.value.label,
          text: E.value.text,
          collapsible: ""
        }, null, 8, ["icon", "label", "text"])) : R("", !0),
        F.value.length ? (t(), i("section", dr, [
          r("div", ur, [
            $(v(P), { icon: "tabler:link" }),
            k[6] || (k[6] = se("Filed under", -1))
          ]),
          r("div", pr, [
            (t(!0), i(te, null, ge(F.value, (f) => (t(), i("button", {
              key: f.id,
              class: "kc-ref",
              onClick: (U) => o("select", f.id)
            }, [
              r("span", {
                class: "kc-ref-dot",
                style: $e({ background: c(f.id) })
              }, null, 4),
              r("span", xr, N(f.label), 1),
              $(v(P), {
                class: "kc-ref-go",
                icon: "tabler:arrow-up-right"
              })
            ], 8, gr))), 128))
          ])
        ])) : R("", !0),
        I.value ? R("", !0) : (t(), i(te, { key: 2 }, [
          m.value.length ? (t(), i("section", vr, [
            r("div", fr, [
              $(v(P), { icon: "tabler:arrow-up-right" }),
              k[7] || (k[7] = se("Relates to", -1))
            ]),
            (t(!0), i(te, null, ge(m.value, (f) => (t(), i("button", {
              key: f.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", f.otherId)
            }, [
              r("span", mr, N(f.kind), 1),
              r("span", br, N(f.label), 1),
              $(v(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, hr))), 128))
          ])) : R("", !0),
          b.value.length ? (t(), i("section", wr, [
            r("div", kr, [
              $(v(P), { icon: "tabler:arrow-down-left" }),
              k[8] || (k[8] = se("Referenced by", -1))
            ]),
            (t(!0), i(te, null, ge(b.value, (f) => (t(), i("button", {
              key: f.id,
              class: "gx-rel-item",
              onClick: (U) => o("select", f.otherId)
            }, [
              r("span", _r, N(f.kind), 1),
              r("span", $r, N(f.label), 1),
              $(v(P), {
                class: "gx-rel-go",
                icon: "tabler:chevron-right"
              })
            ], 8, yr))), 128))
          ])) : R("", !0)
        ], 64)),
        D.value ? (t(), i("div", Cr, [
          $(v(P), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          k[9] || (k[9] = r("span", null, "Loading content…", -1))
        ])) : B.value.length ? (t(), i("section", Ir, [
          r("div", {
            class: ke(["gx-ins-clamp", { clamped: ne.value }])
          }, [
            r("div", {
              ref_key: "contentRef",
              ref: fe,
              class: "gx-ins-clamp-inner"
            }, [
              (t(!0), i(te, null, ge(B.value, (f) => (t(), i("div", {
                key: f.id,
                class: "gx-ins-doc"
              }, [
                B.value.length > 1 ? (t(), i("div", Mr, N(f.title), 1)) : R("", !0),
                r("wc-resource-view", {
                  class: "gx-ins-rv",
                  "content-type": f.contentType,
                  source: f.content
                }, null, 8, zr)
              ]))), 128))
            ], 512),
            ne.value ? (t(), i("div", Sr)) : R("", !0)
          ], 2),
          he.value ? (t(), i("button", {
            key: 0,
            type: "button",
            class: "gx-ins-more",
            "aria-expanded": xe.value,
            onClick: k[2] || (k[2] = (f) => xe.value = !xe.value)
          }, [
            $(v(P), {
              icon: xe.value ? "tabler:chevron-up" : "tabler:chevron-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            se(" " + N(xe.value ? "Show less" : "Show more"), 1)
          ], 8, Rr)) : R("", !0)
        ])) : R("", !0),
        !D.value && !E.value && !B.value.length && !F.value.length && !m.value.length && !b.value.length ? (t(), i("div", Or, [
          $(v(P), { icon: "tabler:circle-dashed" }),
          k[10] || (k[10] = r("span", null, "An isolated concept with no extracted relations or content yet.", -1))
        ])) : R("", !0)
      ])
    ], 6));
  }
}), Fr = ["aria-label", "aria-expanded", "title"], Nr = { key: 0 }, Ar = {
  key: 0,
  class: "gx-legend-body"
}, Br = { class: "gx-legend-row" }, Ur = { class: "gx-legend-row" }, Pr = /* @__PURE__ */ Ce({
  __name: "GraphLegend",
  setup(a) {
    const d = O(!1);
    return (e, o) => (t(), i("div", {
      class: ke(["gx-legend", { collapsed: !d.value }])
    }, [
      r("button", {
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
        d.value ? R("", !0) : (t(), i("span", Nr, "Legend"))
      ], 8, Fr),
      d.value ? (t(), i("div", Ar, [
        o[3] || (o[3] = r("div", { class: "gx-legend-row" }, [
          r("span", { class: "gx-legend-mark gx-legend-cluster" }),
          se(" Color = topic cluster ")
        ], -1)),
        r("div", Br, [
          r("span", {
            class: "gx-legend-mark",
            style: $e({ background: v(pt).root.fill })
          }, null, 4),
          o[1] || (o[1] = se(" Root concept ", -1))
        ]),
        r("div", Ur, [
          r("span", {
            class: "gx-legend-mark doc",
            style: $e({ background: v(pt).document.fill })
          }, null, 4),
          o[2] || (o[2] = se(" Source document ", -1))
        ]),
        o[4] || (o[4] = Wt('<div class="gx-legend-sep"></div><div class="gx-legend-row"><span class="gx-legend-line subtopic"></span>subtopic</div><div class="gx-legend-row"><span class="gx-legend-line categorized"></span>categorized</div>', 3))
      ])) : R("", !0)
    ], 2));
  }
}), Wr = { class: "gx-controls" }, Vr = { class: "gx-ctrl-read" }, jr = /* @__PURE__ */ Ce({
  __name: "GraphControls",
  props: {
    scale: {}
  },
  emits: ["zoom-in", "zoom-out", "fit"],
  setup(a, { emit: d }) {
    const e = d;
    return (o, p) => (t(), i("div", Wr, [
      r("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom in",
        "aria-label": "Zoom in",
        onClick: p[0] || (p[0] = (c) => e("zoom-in"))
      }, [
        $(v(P), { icon: "tabler:plus" })
      ]),
      r("div", Vr, N(Math.round(a.scale * 100)) + "%", 1),
      r("button", {
        class: "gx-ctrl",
        type: "button",
        title: "Zoom out",
        "aria-label": "Zoom out",
        onClick: p[1] || (p[1] = (c) => e("zoom-out"))
      }, [
        $(v(P), { icon: "tabler:minus" })
      ]),
      r("button", {
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
}), Hr = { class: "gx-display" }, Xr = ["title"], Yr = ["max", "value"], Kr = { class: "gx-display-lvl" }, Gr = { class: "gx-display-lvl-max" }, Zr = ["aria-checked", "title"], Qr = /* @__PURE__ */ Ce({
  __name: "GraphDisplayControls",
  props: {
    level: {},
    maxLevel: {},
    conceptsOnly: { type: Boolean },
    hiddenCount: {},
    focused: { type: Boolean }
  },
  emits: ["update:level", "toggle-concepts", "reset"],
  setup(a, { emit: d }) {
    const e = d;
    return (o, p) => (t(), i("div", Hr, [
      a.maxLevel > 1 ? (t(), i("div", {
        key: 0,
        class: "gx-display-slider",
        title: `Showing ${a.level} of ${a.maxLevel} levels`
      }, [
        $(v(P), {
          class: "gx-display-ic",
          icon: "tabler:stack-2",
          "aria-hidden": "true"
        }),
        r("input", {
          class: "gx-range",
          type: "range",
          min: "1",
          max: a.maxLevel,
          value: a.level,
          "aria-label": "Graph depth",
          onInput: p[0] || (p[0] = (c) => e("update:level", Number(c.target.value)))
        }, null, 40, Yr),
        r("span", Kr, [
          se(N(a.level), 1),
          r("span", Gr, "/" + N(a.maxLevel), 1)
        ]),
        p[3] || (p[3] = r("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1))
      ], 8, Xr)) : R("", !0),
      r("button", {
        class: "gx-display-row",
        role: "switch",
        "aria-checked": a.conceptsOnly,
        title: a.conceptsOnly ? "Show document nodes" : "Hide document nodes — concepts only",
        onClick: p[1] || (p[1] = (c) => e("toggle-concepts"))
      }, [
        $(v(P), {
          icon: a.conceptsOnly ? "tabler:files-off" : "tabler:files",
          class: "gx-display-ic",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        p[5] || (p[5] = r("span", { class: "gx-display-label" }, "Concepts only", -1)),
        r("span", {
          class: ke(["gx-display-sw", { on: a.conceptsOnly }])
        }, [...p[4] || (p[4] = [
          r("span", { class: "gx-display-knob" }, null, -1)
        ])], 2)
      ], 8, Zr),
      a.hiddenCount || a.focused || a.level < a.maxLevel ? (t(), i(te, { key: 1 }, [
        p[7] || (p[7] = r("span", {
          class: "gx-display-div",
          "aria-hidden": "true"
        }, null, -1)),
        r("button", {
          class: "gx-display-reset",
          title: "Show every node and clear branch isolation",
          onClick: p[2] || (p[2] = (c) => e("reset"))
        }, [
          $(v(P), {
            icon: "tabler:arrow-back-up",
            "aria-hidden": "true"
          }),
          p[6] || (p[6] = r("span", null, "Reset", -1))
        ])
      ], 64)) : R("", !0)
    ]));
  }
});
function Ve(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function mt(a) {
  const d = Ve(a) ? a : { message: String(a) }, e = d.response, o = Ve(e) && e.status === 401 ? "auth-expired" : "other";
  Be.handleError(o, d);
}
const Jr = { class: "kb-railtop" }, qr = { class: "kb-railtop-acts" }, ea = {
  key: 0,
  class: "kx-main-scroll"
}, ta = {
  key: 1,
  class: "gx-canvas-wrap"
}, na = { class: "gx-botleft" }, oa = {
  key: 0,
  class: "gx-focusbar"
}, ra = ["title"], aa = { class: "gx-focusbar-name" }, ia = {
  key: 0,
  class: "gx-sparse"
}, la = { class: "gx-treat" }, sa = { class: "gx-treat-check" }, ca = { class: "ap-field" }, da = ["value"], ua = { class: "ap-field" }, pa = { class: "gx-treat-actions" }, ga = /* @__PURE__ */ Ce({
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
  setup(a, { emit: d }) {
    const e = a, o = d, { navWidth: p, railRef: c, navDragging: I, onStart: m } = Dt(), b = O(null), C = O(1), F = /* @__PURE__ */ new Set(), z = S(() => {
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
    }), h = S(() => {
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
        for (const ae of h.value.get(Q) || [])
          n.has(ae) || (n.add(ae), g.push(ae));
      }
      return n;
    }
    const _ = S(() => {
      const l = /* @__PURE__ */ new Map(), n = j.value, g = (Q, ae) => {
        const ve = l.get(Q);
        if (ve !== void 0) return ve;
        const De = n.get(Q);
        if (De === void 0 || ae.has(Q))
          return l.set(Q, 0), 0;
        ae.add(Q);
        const We = g(De, ae) + 1;
        return l.set(Q, We), We;
      };
      for (const Q of e.concepts) g(Q.id, /* @__PURE__ */ new Set());
      return l;
    }), T = S(() => w.value ? _.value.get(w.value) ?? 0 : 0);
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
    }), re = O(99), ce = S(() => Math.min(re.value, J.value)), A = O(/* @__PURE__ */ new Set()), w = O(null), V = O(!1);
    function fe(l) {
      re.value = l;
    }
    function xe(l) {
      const n = new Set(A.value);
      n.add(l), A.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    function he(l) {
      const n = new Set(A.value);
      for (const g of u(l)) n.add(g);
      A.value = n, e.selectedId && n.has(e.selectedId) && o("select", "");
    }
    const ye = S(() => w.value && e.concepts.find((l) => l.id === w.value) || null), L = S(() => w.value ? u(w.value) : null);
    function oe(l) {
      w.value = w.value === l ? null : l, w.value && o("select", l);
    }
    function ne(l) {
      w.value = l, o("select", l);
    }
    function s() {
      if (!w.value) return;
      const l = j.value.get(w.value);
      l && z.value.has(l) && !z.value.get(l)?.is_root ? (w.value = l, o("select", l)) : w.value = null;
    }
    const k = S(() => {
      if (!w.value) return "";
      const l = j.value.get(w.value), n = l ? z.value.get(l) : null;
      return n && !n.is_root ? n.label || "parent" : "all";
    });
    function f() {
      w.value = null;
    }
    function U() {
      A.value = /* @__PURE__ */ new Set(), w.value = null, re.value = 99, V.value = !1;
    }
    ue(w, () => {
      re.value = 99;
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
      o("select", l), b.value?.focus(l);
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
        { id: "isolate", label: w.value === l.id ? "Clear isolation" : "Isolate branch", icon: "tabler:focus-2" },
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
            he(n.id);
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
    function me() {
      o("changed");
    }
    const pe = O(!1), we = O("class:fast"), ie = O(""), de = O(!1);
    async function _e() {
      if (e.kbId)
        try {
          const { data: l } = await Ie.get(`/api/v1/knowledge/${e.kbId}`);
          if (!Ve(l)) return;
          const n = Ve(l.knowledge_base) && l.knowledge_base.config || l.config, g = Ve(n) ? n : {};
          pe.value = g.treatment_enabled === !0, typeof g.treatment_model == "string" && g.treatment_model && (we.value = g.treatment_model), typeof g.treatment_prompt == "string" && (ie.value = g.treatment_prompt);
        } catch {
        }
    }
    async function ze() {
      if (!(!e.kbId || de.value)) {
        de.value = !0;
        try {
          await Ie.put(`/api/v1/knowledge/${e.kbId}`, { config: {
            treatment_enabled: pe.value,
            treatment_model: we.value,
            treatment_prompt: ie.value
          } });
          try {
            Be?.toast?.("Treatment settings saved");
          } catch {
          }
        } catch (l) {
          try {
            mt(l);
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
            mt(l);
          } catch {
          }
        } finally {
          de.value = !1;
        }
      }
    }
    function Ae(l) {
      const n = l && (l.detail ?? (l.target && l.target.value));
      typeof n == "string" && n && (we.value = n);
    }
    return lt(() => {
      at("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      }), at("wc-model-picker", { timeoutMs: 1e4 }).catch(() => {
      }), _e();
    }), ue(() => e.kbId, () => {
      A.value = /* @__PURE__ */ new Set(), w.value = null, re.value = 99, V.value = !1, _e();
    }), (l, n) => (t(), i("div", {
      ref_key: "railRef",
      ref: c,
      class: ke(["gx", { "wk-dragging": v(I) }]),
      style: $e({ "--kx-rail-width": v(p) + "px" })
    }, [
      a.concepts.length ? (t(), le(v(Ct), { key: 0 }, {
        rail: be(() => [
          r("div", Jr, [
            r("div", qr, [
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
                disabled: a.loading,
                spin: a.loading,
                onClick: n[3] || (n[3] = (g) => o("reload"))
              }, null, 8, ["disabled", "spin"])
            ])
          ]),
          $(Rt, {
            concepts: a.concepts,
            edges: a.edges,
            "selected-id": a.selectedId,
            onSelect: q,
            onContext: n[4] || (n[4] = (g) => Ue(g.concept, g.x, g.y))
          }, null, 8, ["concepts", "edges", "selected-id"]),
          r("div", {
            class: "wn-resizer",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Resize navigation",
            onPointerdown: n[5] || (n[5] = //@ts-ignore
            (...g) => v(m) && v(m)(...g))
          }, [...n[26] || (n[26] = [
            r("span", { class: "wn-resizer-grip" }, null, -1)
          ])], 32)
        ]),
        default: be(() => [
          Ee.value ? (t(), i("div", ea, [
            $(v(It), {
              "kb-id": a.kbId,
              layout: "panel",
              ask: a.canAnswer,
              onOpen: et,
              onClose: n[6] || (n[6] = (g) => Ee.value = !1)
            }, null, 8, ["kb-id", "ask"])
          ])) : (t(), i("div", ta, [
            $(or, {
              ref_key: "canvasRef",
              ref: b,
              concepts: a.concepts,
              edges: a.edges,
              "visible-ids": H.value,
              colors: K.value,
              "selected-id": a.selectedId || null,
              "highlight-ids": v(F),
              onSelect: n[7] || (n[7] = (g) => o("select", g || "")),
              onScale: n[8] || (n[8] = (g) => C.value = g),
              onNodeContext: Qe,
              onNodeDblclick: ne
            }, null, 8, ["concepts", "edges", "visible-ids", "colors", "selected-id", "highlight-ids"]),
            r("div", na, [
              $(Pr),
              $(Qr, {
                level: ce.value,
                "max-level": J.value,
                "concepts-only": V.value,
                "hidden-count": A.value.size,
                focused: !!w.value,
                "onUpdate:level": fe,
                onToggleConcepts: n[9] || (n[9] = (g) => V.value = !V.value),
                onReset: U
              }, null, 8, ["level", "max-level", "concepts-only", "hidden-count", "focused"])
            ]),
            $(jr, {
              scale: C.value,
              onZoomIn: n[10] || (n[10] = (g) => b.value?.zoomBy(1.25)),
              onZoomOut: n[11] || (n[11] = (g) => b.value?.zoomBy(0.8)),
              onFit: n[12] || (n[12] = (g) => b.value?.fit())
            }, null, 8, ["scale"]),
            $(Xe, { name: "gx-ins-fade" }, {
              default: be(() => [
                ye.value ? (t(), i("div", oa, [
                  r("button", {
                    class: "gx-focusbar-up",
                    title: `Back to ${k.value}`,
                    onClick: s
                  }, [
                    $(v(P), {
                      icon: "tabler:arrow-up",
                      "aria-hidden": "true"
                    })
                  ], 8, ra),
                  $(v(P), {
                    class: "gx-focusbar-ic",
                    icon: "tabler:focus-2",
                    "aria-hidden": "true"
                  }),
                  r("span", aa, N(ye.value.label || "concept"), 1),
                  r("button", {
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
              default: be(() => [
                D.value ? (t(), le(Lr, {
                  key: 0,
                  "kb-id": a.kbId,
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
              default: be(() => [
                ee.value ? (t(), i("div", ia, [
                  $(v(P), {
                    icon: "tabler:plant-2",
                    "aria-hidden": "true"
                  }),
                  n[28] || (n[28] = r("span", null, "Add more content to grow the graph.", -1)),
                  r("button", {
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
        default: be(() => [
          $(zt, {
            "kb-id": a.kbId,
            noun: "document",
            onChanged: me
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
        default: be(() => [
          r("div", la, [
            r("label", sa, [
              Le(r("input", {
                type: "checkbox",
                "onUpdate:modelValue": n[19] || (n[19] = (g) => pe.value = g)
              }, null, 512), [
                [Vt, pe.value]
              ]),
              n[29] || (n[29] = r("span", null, "Auto-merge duplicate concepts after each ingest", -1))
            ]),
            r("div", ca, [
              n[30] || (n[30] = r("span", { class: "ap-label" }, "Model", -1)),
              r("wc-model-picker", {
                value: we.value,
                capability: "generate",
                onSelect: Ae
              }, null, 40, da)
            ]),
            r("div", ua, [
              n[31] || (n[31] = r("span", { class: "ap-label" }, [
                se("Prompt "),
                r("span", { class: "ap-opt" }, "optional")
              ], -1)),
              Le(r("textarea", {
                "onUpdate:modelValue": n[20] || (n[20] = (g) => ie.value = g),
                rows: "3",
                class: "ap-textarea",
                placeholder: "Extra rules for the treatment agent…"
              }, null, 512), [
                [Ge, ie.value]
              ])
            ]),
            r("div", pa, [
              $(v(Ke), {
                variant: "soft",
                disabled: de.value,
                onClick: ze
              }, {
                default: be(() => [...n[32] || (n[32] = [
                  se("Save", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              $(v(Ke), {
                variant: "primary",
                disabled: de.value,
                onClick: Ne
              }, {
                default: be(() => [...n[33] || (n[33] = [
                  se("Run now", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n[34] || (n[34] = r("p", { class: "gx-treat-hint" }, "Merges duplicate / near-duplicate concept nodes. Runs automatically after ingest when enabled, or on demand here.", -1))
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
        default: be(() => [
          Me.value ? (t(), le(St, {
            key: 0,
            "kb-id": a.kbId,
            mode: Me.value,
            target: Fe.value,
            concepts: a.concepts,
            edges: a.edges,
            onSaved: qe,
            onClose: n[22] || (n[22] = (g) => Me.value = "")
          }, null, 8, ["kb-id", "mode", "target", "concepts", "edges"])) : R("", !0)
        ]),
        _: 1
      }, 8, ["open", "title"]),
      $(v(kt), {
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
}), xa = { class: "kb-page" }, va = ["disabled"], fa = "kb10:wiki:view", ha = /* @__PURE__ */ Ce({
  __name: "KbWiki",
  setup(a) {
    const d = Ft(), e = Nt(), o = S(() => d.value.config?.kb_id || ""), p = S(() => d.value.config?.route || "");
    let c = !1;
    function I() {
      const L = d.value.config?.view;
      return L === "graph" || L === "wiki" ? L : localStorage.getItem(fa) === "graph" ? "graph" : "wiki";
    }
    const m = O(I());
    ue(() => d.value.config?.view, (L) => {
      (L === "graph" || L === "wiki") && L !== m.value && (m.value = L);
    });
    const b = O(!1), C = O(""), F = O([]), z = O([]), D = O(""), B = O(!1), G = O(null), K = O(!1), E = S(() => {
      const L = G.value;
      return L ? L.error ? `Graph enrichment failed: ${L.error}` : L.agent_missing ? L.agent_error || "The configured enrichment agent is unavailable; documents fall back to default placement." : "" : "";
    }), j = S(() => !!G.value?.error);
    async function h() {
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
      L || (b.value = !0), C.value = "";
      try {
        const { data: ne } = await Ie.get(`/api/v1/kb10/${o.value}/graph`);
        if (oe !== W) return;
        if (ne?.success) {
          F.value = ne.nodes || [], z.value = ne.edges || [];
          const s = ne.enrichment || {};
          G.value = s.error || s.agent_missing ? s : null, D.value && !u.value.has(D.value) && (D.value = ""), D.value || (p.value && u.value.has(p.value) ? re(p.value) : m.value === "wiki" && _.value && (c = !0, D.value = _.value, c = !1));
        } else
          C.value = ne?.error && vt(ne.error) ? xt : ne?.error || "";
      } catch (ne) {
        if (oe !== W) return;
        const s = ne?.response?.data?.error || ne?.message || "could not load the knowledge base";
        C.value = vt(s) ? xt : s, Be.handleError(ne?.response?.status === 401 ? "auth-expired" : "other", ne);
      } finally {
        oe === W && !L && (b.value = !1);
      }
    }
    function re(L) {
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
    }), ue(p, (L) => re(L));
    let ce = null;
    function A() {
      ce && clearTimeout(ce), ce = setTimeout(() => {
        ce = null, J(!0);
      }, 400);
    }
    let w = null, V = 0;
    function fe(L) {
      const oe = ++V;
      if (w && (w(), w = null), !L) return;
      const ne = nn(L, () => A());
      if (oe !== V) {
        ne && ne();
        return;
      }
      w = ne;
    }
    Ze(() => {
      V++, ce && clearTimeout(ce), w && w();
    }), ue(m, (L) => {
      L === "wiki" && !D.value && _.value && (c = !0, D.value = _.value, c = !1);
    }), ue(o, (L) => {
      D.value = "", J(), T(), fe(L);
    }, { immediate: !0 });
    function xe(L) {
      L !== D.value && (D.value = L);
    }
    function he() {
      o.value && e("kb-changed", { kb_id: o.value }), J(!0);
    }
    function ye() {
      J();
    }
    return (L, oe) => (t(), i("div", xa, [
      C.value ? (t(), le(v(gt), {
        key: 0,
        tone: "info"
      }, {
        default: be(() => [
          se(N(C.value), 1)
        ]),
        _: 1
      })) : R("", !0),
      E.value ? (t(), le(v(gt), {
        key: 1,
        tone: "warn"
      }, {
        default: be(() => [
          se(N(E.value) + " ", 1),
          j.value ? (t(), i("button", {
            key: 0,
            type: "button",
            class: "kx-notice-action",
            disabled: K.value,
            onClick: h
          }, N(K.value ? "Retrying…" : "Retry"), 9, va)) : R("", !0)
        ]),
        _: 1
      })) : R("", !0),
      b.value && !F.value.length ? (t(), le(v(dn), {
        key: 2,
        icon: m.value === "graph" ? "tabler:topology-star-3" : void 0,
        label: m.value === "graph" ? "Building the concept graph…" : void 0
      }, null, 8, ["icon", "label"])) : (t(), le(Xe, {
        key: 3,
        name: "kb-fade",
        mode: "out-in"
      }, {
        default: be(() => [
          m.value === "wiki" ? (t(), le(Vo, {
            key: "wiki",
            class: "kb-view",
            "kb-id": o.value,
            concepts: F.value,
            edges: z.value,
            "selected-id": D.value,
            "can-answer": B.value,
            loading: b.value,
            onSelect: xe,
            onChanged: he,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"])) : (t(), le(ga, {
            key: "graph",
            class: "kb-view",
            "kb-id": o.value,
            concepts: F.value,
            edges: z.value,
            "selected-id": D.value,
            "can-answer": B.value,
            loading: b.value,
            onSelect: xe,
            onChanged: he,
            onReload: ye
          }, null, 8, ["kb-id", "concepts", "edges", "selected-id", "can-answer", "loading"]))
        ]),
        _: 1
      }))
    ]));
  }
}), ma = ":host{display:block;height:100%;min-height:0}.wk{display:flex;flex-direction:column;gap:0;height:100%;min-height:calc(100vh - 96px)}.wk .kx-rail{position:relative}.wk.wk-dragging{user-select:none}.wk.wk-dragging *{cursor:col-resize!important}.wn-resizer{position:absolute;z-index:3;top:0;right:-6px;bottom:0;width:12px;cursor:col-resize;touch-action:none;display:flex;align-items:center;justify-content:center}.wn-resizer-grip{width:3px;height:56px;border-radius:999px;background:var(--p-content-border-color);transition:background .14s}.wn-resizer:hover .wn-resizer-grip,.wk.wk-dragging .wn-resizer-grip{background:var(--p-primary-color)}.wn-filter{flex:none;display:flex;align-items:center;gap:6px;margin:8px 8px 4px;padding:0 9px;height:var(--kx-control-height-sm);border-radius:var(--kx-radius-8);background:var(--p-content-background);border:1px solid var(--p-content-border-color);transition:border-color .14s,box-shadow .14s}.wn-filter:focus-within{border-color:var(--p-primary-color);box-shadow:var(--p-focus-ring-shadow)}.wn-filter-ic{width:14px;height:14px;flex:none;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wn-filter-input{flex:1;min-width:0;border:none;background:none;outline:none;font:inherit;font-size:12.5px;color:var(--p-text-color)}.wn-filter-input::placeholder{color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wn-filter-x{flex:none;display:inline-flex;width:18px;height:18px;border:none;border-radius:8px;background:transparent;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);cursor:pointer}.wn-filter-x:hover{color:var(--p-text-color);background:var(--kx-surface-1)}.wn-filter-x svg{width:13px;height:13px}.wn{display:flex;flex-direction:column;gap:4px;min-width:0}.wn-folder{display:flex;align-items:center;gap:6px;min-width:0;padding:2px 2px 6px}.wn-up{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:var(--kx-radius-6);border:1px solid var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color);cursor:pointer;transition:background .12s,color .12s,border-color .12s}.wn-up:hover{background:var(--kx-surface-2);color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.wn-up svg{width:14px;height:14px}.wn-folder-name{min-width:0;flex:1;font-size:12px;font-weight:700;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}.wn-item{position:relative;display:flex;align-items:center;gap:8px;padding:0 8px;min-height:var(--kx-row-height);border-radius:var(--kx-radius-8);min-width:0;cursor:pointer;transition:background .12s,color .12s}.wn-item:hover{background:var(--kx-surface-2)}.wn-item.active{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);box-shadow:inset 2px 0 0 var(--p-primary-color)}.wn-item.active .wn-label{color:var(--p-primary-color);font-weight:700}.wn-ico{display:inline-flex;flex:none}.wn-ico svg{width:16px;height:16px}.wn-item-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;padding:5px 0}.wn-label{flex:1;min-width:0;font-size:12.5px;font-weight:550;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-item-text .wn-label{flex:none}.wn-item:not(.folder) .wn-label{font-weight:500;color:var(--p-text-muted-color)}.wn-path{font-size:10.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wn-path-sep{padding:0 4px;opacity:.6}.wn-count{flex:none;min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wn-item.active .wn-count{background:color-mix(in srgb,var(--p-primary-color) 18%,transparent);color:var(--p-primary-color)}.wn-go{flex:none;width:15px;height:15px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);transition:color .12s,transform .12s}.wn-item.folder:hover .wn-go{color:var(--p-text-muted-color);transform:translate(1px)}.wn-empty{padding:14px 10px;font-size:12px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);text-align:center}.wk-doc-inner{max-width:1280px}.wr-doc,.wr-foot,.wr-lede,.wk-tax{max-width:var(--kx-reading-measure)}.wk-pagebar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:24px;margin-bottom:-4px}.wk-pagebar .wk-crumbs{flex:1}.wk-pagebar .wk-tools{flex:none}.wk-crumbs{display:flex;align-items:center;gap:1px;min-width:0;flex-wrap:nowrap;overflow:hidden}.wk-crumb{flex:0 1 auto;min-width:0;height:24px;padding:0 7px;border-radius:var(--kx-radius-6);font:inherit;font-size:12px;font-weight:600;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .12s,color .12s}.wk-crumb:hover{background:var(--kx-surface-2);color:var(--p-text-color)}.wk-crumb-sep{width:13px;height:13px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);flex:none}.wr{display:flex;flex-direction:column;gap:18px;min-width:0}.wr-head{display:flex;flex-direction:column;gap:9px}.wr-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.wr-eyebrow-dot{width:9px;height:9px;border-radius:50%;flex:none}.wr-title-row{display:flex;align-items:flex-start;gap:14px}.wr-title{margin:0;flex:1;min-width:0;font-size:27px;font-weight:800;line-height:1.15;letter-spacing:-.02em;color:var(--p-text-color)}.wr-lede{margin:0;font-size:15px;line-height:1.6;color:var(--p-text-muted-color)}.wr-state{display:flex;align-items:center;gap:9px;padding:40px 20px;justify-content:center;font-size:13px;color:var(--p-text-muted-color)}.wr-state.err{color:var(--p-danger-500)}.wr-state svg{width:17px;height:17px}.wr-state .spin.big{width:22px;height:22px}.wr-doc{display:flex;flex-direction:column;gap:8px}.wr-doc-page{display:flex;flex-direction:column;gap:12px;min-width:0}.wr-doc-head{display:flex;align-items:center;gap:10px;min-width:0}.wr-orig-btn{margin-left:auto;flex:none}.wr-orig-btn.on{border-color:var(--p-primary-color);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.wr-doc-toggle{flex:none;display:inline-flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;padding:3px 9px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color);color:var(--p-text-color)}.wr-doc-toggle:hover{border-color:var(--p-primary-color);color:var(--p-primary-color)}.wr-doc-toggle svg{width:14px;height:14px}.wr-doc-sep{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);padding-bottom:4px;border-bottom:1px solid var(--p-content-border-color)}.wr-rv{display:block;min-width:0}.wr-doc-rule{border:none;border-top:1px solid var(--p-content-border-color);margin:12px 0}.wr-chunks{display:flex;flex-direction:column;gap:16px;max-width:var(--kx-reading-measure)}.wr-chunks-doc{display:flex;flex-direction:column;gap:10px}.wr-chunk{padding:12px 14px;border-radius:var(--kx-radius-14);border:1px solid var(--p-content-border-color);background:var(--kx-surface-1);cursor:pointer;transition:border-color .14s}.wr-chunk:hover{border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.wr-chunk-h{width:100%;border:0;padding:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px}.wr-chunk-n{width:22px;height:22px;flex:none;display:grid;place-items:center;border-radius:6px;font-size:11px;font-weight:700;background:var(--kx-surface-2);color:var(--p-text-muted-color);font-variant-numeric:tabular-nums}.wr-chunk-label{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.wr-chunk-chev{width:16px;height:16px;margin-left:auto;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wr-chunk-cx{display:flex;align-items:flex-start;gap:7px;margin:9px 0 0;padding:8px 10px;border-radius:8px;font-size:11.5px;line-height:1.5;font-style:italic;background:color-mix(in srgb,var(--p-primary-color) 6%,transparent);color:var(--p-text-muted-color)}.wr-chunk-cx svg{width:13px;height:13px;flex:none;margin-top:2px;color:var(--p-primary-color)}.wr-chunk-body{margin:10px 0 0;font-size:12.5px;line-height:1.65;color:var(--p-text-muted-color);white-space:pre-wrap}.wr-chunk-body.clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.wr-prov{display:flex;flex-wrap:wrap;gap:6px 18px;padding:12px 14px;border-radius:var(--kx-radius-14);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color)}.wr-prov-row{display:inline-flex;align-items:baseline;gap:7px;min-width:0;font-size:12px}.wr-prov-k{font-weight:700;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);text-transform:uppercase;letter-spacing:.03em;font-size:10px}.wr-prov-v{color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:360px}a.wr-prov-v{color:var(--p-primary-color);text-decoration:none}a.wr-prov-v:hover{text-decoration:underline}.wr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.wr-card{display:flex;flex-direction:column;gap:7px;padding:14px;border-radius:var(--kx-radius-14);cursor:pointer;text-align:left;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);transition:border-color .14s,box-shadow .14s,transform .14s}.wr-card:hover{border-color:color-mix(in srgb,var(--c, var(--p-primary-color)) 45%,var(--p-content-border-color));box-shadow:0 4px 16px color-mix(in srgb,var(--p-text-color) 8%,transparent);transform:translateY(-1px)}.wr-card-top{display:flex;align-items:center;justify-content:space-between}.wr-card-ic{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--c, var(--p-primary-color)) 16%,transparent);color:var(--c, var(--p-primary-color))}.wr-card-ic svg{width:16px;height:16px}.wr-card-go{width:15px;height:15px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);opacity:0;transition:opacity .14s}.wr-card:hover .wr-card-go{opacity:1}.wr-card-name{font-size:14px;font-weight:700;color:var(--p-text-color)}.wr-card-desc{font-size:12.5px;line-height:1.5;color:var(--p-text-muted-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.wr-card-meta{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin-top:2px}.wk-tools{display:inline-flex;gap:4px;flex:none}.wk-tax{display:flex;flex-direction:column;gap:9px;padding:14px;border-radius:var(--kx-radius-14);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color)}.wk-tax-h{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:700;color:var(--p-text-color)}.wk-tax-input,.wk-tax-textarea{width:100%;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.wk-tax-input{height:var(--kx-control-height);padding:0 11px}.wk-tax-textarea{padding:8px 11px;resize:vertical;min-height:56px;line-height:1.5}.wk-tax-input:focus,.wk-tax-textarea:focus{outline:none;border-color:var(--p-primary-color);box-shadow:var(--p-focus-ring-shadow)}.wk-tax-del{display:flex;flex-direction:column;gap:9px}.wk-tax-counts{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:11.5px;color:var(--p-text-muted-color)}.wk-tax-counts span{display:inline-flex;align-items:center;gap:5px}.wk-tax-counts svg{width:13px;height:13px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wk-tax-err{display:flex;align-items:flex-start;gap:6px;font-size:12px;color:var(--p-danger-500)}.wk-tax-err svg{width:14px;height:14px;flex:none;margin-top:1px}.wk-tax-foot{display:flex;justify-content:flex-end;gap:7px}.wr-foot{display:flex;flex-direction:column;gap:14px;margin-top:8px;padding-top:18px;border-top:1px solid var(--p-content-border-color)}.wr-foot-group{display:flex;flex-direction:column;gap:8px}.wr-foot-h{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.wr-foot-links{display:flex;flex-wrap:wrap;gap:6px}.wr-foot-link{display:inline-flex;align-items:center;gap:7px;height:var(--kx-control-height-sm);padding:0 11px;border-radius:999px;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;background:var(--kx-surface-1);color:var(--p-text-color);border:1px solid var(--p-content-border-color);transition:border-color .14s,background .14s}.wr-foot-link:hover{background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.wr-foot-dot{width:8px;height:8px;border-radius:50%;flex:none}.wr-foot-kind{font-size:9.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}@media(max-width:760px){.wk-doc-inner{padding:20px 22px 64px}.wr-grid{grid-template-columns:1fr}.wr-prov-v{max-width:100%}.wn-resizer{display:none}}@media(prefers-reduced-motion:reduce){.wr-card,.wn-row,.wr-foot-link{transition:none}}.kb-view-sep{width:1px;align-self:stretch;margin:4px 2px;background:var(--kc-border)}.wn-kebab{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;background:transparent;border-radius:var(--kx-radius-6);cursor:pointer;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);opacity:0;transition:opacity .12s,background .12s,color .12s}.wn-item:hover .wn-kebab{opacity:.7}.wn-kebab:hover{background:var(--kx-surface-2);color:var(--p-text-color);opacity:1}.wn-kebab svg{width:15px;height:15px}", ba = ":host{display:block;height:100%;min-height:0}.gx{--gx-glass: color-mix(in srgb, var(--p-content-background) 82%, transparent);--gx-glass-border: color-mix(in srgb, var(--p-text-color) 12%, transparent);--gx-shadow: 0 8px 30px -12px color-mix(in srgb, var(--p-text-color) 30%, transparent);display:flex;flex-direction:column;gap:0;height:100%;min-height:calc(100vh - 96px)}.gx-notice{margin:12px 16px 0}.gx-rail-search{padding:10px}.gx-list{display:flex;flex-direction:column;gap:1px}.gx-row{display:flex;align-items:center;gap:9px;height:var(--kx-row-height);padding:0 8px;border-radius:var(--kx-radius-8);min-width:0;cursor:pointer;text-align:left;background:transparent;border:none;font:inherit;transition:background .12s}.gx-row:hover{background:var(--kx-surface-2)}.gx-row.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);box-shadow:inset 2px 0 0 var(--p-primary-color)}.gx-row-dot{width:10px;height:10px;border-radius:50%;flex:none}.gx-row-label{flex:1;min-width:0;font-size:12.5px;font-weight:550;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-row.on .gx-row-label{color:var(--p-primary-color);font-weight:700}.gx-row-deg{flex:none;min-width:18px;padding:1px 6px;border-radius:999px;font-size:10.5px;font-weight:700;text-align:center;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);background:var(--kx-surface-2)}.gx-row.on .gx-row-deg{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.gx-row-hide{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:var(--kx-radius-6);cursor:pointer;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);opacity:0;transition:opacity .12s,background .12s,color .12s}.gx-row:hover .gx-row-hide{opacity:.6}.gx-row-hide:hover{background:var(--kx-surface-2);color:var(--p-text-color);opacity:1}.gx-row-hide svg{width:15px;height:15px}.gx-row.hidden{opacity:.45}.gx-row.hidden .gx-row-hide{opacity:.8}.gx-hidden-chip{position:absolute;z-index:6;left:50%;bottom:16px;transform:translate(-50%);display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;font-weight:600;color:var(--p-text-color);cursor:pointer}.gx-hidden-chip:hover{background:var(--kx-surface-2)}.gx-hidden-chip svg{width:15px;height:15px;color:var(--p-primary-color)}.gx-focus-chip.raised{bottom:58px}.gx-focus-chip-label{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-row.focus .gx-row-dot{box-shadow:0 0 0 2px var(--p-primary-color)}.gx-tw{flex:none;width:18px;height:var(--kx-row-height);display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);cursor:pointer;padding:0;border-radius:var(--kx-radius-8)}.gx-tw:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.gx-tw--leaf{cursor:default}.gx-list-empty{padding:14px 10px;font-size:12.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.gx-canvas-wrap{position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--p-primary-color) 7%,transparent),transparent 60%),var(--p-content-background)}.gx-canvas{position:absolute;inset:0}.gx-svg{width:100%;height:100%;display:block;cursor:grab;touch-action:none}.gx-svg:active{cursor:grabbing}.gx-grid-bg{pointer-events:none}.gx-grid-dot{fill:color-mix(in srgb,var(--p-text-color) 14%,transparent)}.gx-links{pointer-events:none}.gx-link{fill:none;stroke:color-mix(in srgb,var(--p-text-color) 18%,transparent);stroke-width:1.5;transition:opacity .18s,stroke .18s}.gx-link.subtopic{stroke:var(--p-help-400);stroke-width:2;opacity:.55}.gx-link.categorized{stroke-dasharray:4 4;opacity:.4}.gx-link.lit{opacity:.95;stroke-width:2.5}.gx-link.faded{opacity:.07}.gx-node{cursor:pointer;transition:opacity .18s}.gx-node.dim{opacity:.22}.gx-shape{transition:stroke-width .15s,filter .15s}.gx-node.hov .gx-shape{stroke-width:3.5;filter:drop-shadow(0 0 6px color-mix(in srgb,var(--p-text-color) 30%,transparent))}.gx-node.sel .gx-shape{stroke:var(--p-text-color);stroke-width:3.5}.gx-halo{fill:none;stroke-width:2;opacity:.5;animation:gx-halo 1.8s ease-in-out infinite}@keyframes gx-halo{0%,to{opacity:.25}50%{opacity:.6}}.gx-badge-bg{fill:var(--p-content-background);stroke:color-mix(in srgb,var(--p-text-color) 18%,transparent);stroke-width:1}.gx-badge-txt{font-size:8.5px;font-weight:700;fill:var(--p-text-color);pointer-events:none}.gx-label{font-size:10.5px;font-weight:600;fill:var(--p-text-muted-color);pointer-events:none;paint-order:stroke;stroke:var(--p-content-background);stroke-width:3px;stroke-linejoin:round}.gx-label.root{font-size:12.5px;font-weight:700;fill:var(--p-text-color)}.gx-node.sel .gx-label,.gx-node.hov .gx-label{fill:var(--p-text-color)}.gx-legend{position:absolute;z-index:5;left:16px;bottom:16px;border-radius:14px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);overflow:hidden}.gx-legend.collapsed{border-radius:999px}.gx-legend-toggle{display:flex;align-items:center;gap:6px;width:100%;padding:8px 12px;cursor:pointer;background:none;border:none;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}.gx-legend.collapsed .gx-legend-toggle{padding:9px 14px}.gx-legend-toggle:hover{color:var(--p-text-color)}.gx-legend-toggle svg{width:14px;height:14px}.gx-legend-body{display:flex;flex-direction:column;gap:7px;padding:2px 14px 12px}.gx-legend-row{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--p-text-muted-color);white-space:nowrap}.gx-legend-mark{width:11px;height:11px;border-radius:50%;flex:none}.gx-legend-mark.doc{width:12px;height:9px;border-radius:2px}.gx-legend-cluster{background:conic-gradient(#885ad8,#5ab0d8,#d88c5a,#5ad888,#d85a73,#885ad8)}.gx-legend-sep{height:1px;background:var(--gx-glass-border);margin:1px 0}.gx-legend-line{width:18px;flex:none}.gx-legend-line.subtopic{border-top:2px solid var(--p-help-400)}.gx-legend-line.categorized{border-top:1px dashed color-mix(in srgb,var(--p-text-color) 18%,transparent)}.gx-controls{position:absolute;z-index:5;right:16px;bottom:16px;display:flex;flex-direction:column;align-items:stretch;gap:2px;padding:5px;border-radius:8px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow)}.gx-ctrl{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color);transition:background .14s,color .14s}.gx-ctrl:hover{background:var(--kx-surface-2);color:var(--p-text-color)}.gx-ctrl.fit{margin-top:3px;border-top:1px solid var(--gx-glass-border);border-radius:0 0 8px 8px}.gx-ctrl svg{width:17px;height:17px}.gx-ctrl-read{text-align:center;font-size:10px;font-weight:700;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);padding:1px 0;font-variant-numeric:tabular-nums}.gx-inspect{position:absolute;z-index:7;top:16px;right:16px;bottom:16px;width:430px;max-width:calc(100% - 32px);display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--p-content-background) 96%,transparent);backdrop-filter:blur(18px);border:1px solid var(--gx-glass-border);box-shadow:0 18px 50px -20px color-mix(in srgb,var(--p-text-color) 45%,transparent)}.gx-inspect.dragging{user-select:none}.gx-ins-resizer{position:absolute;z-index:2;top:0;left:0;bottom:0;width:12px;cursor:col-resize;touch-action:none;display:flex;align-items:center;justify-content:flex-start}.gx-ins-resizer-grip{width:3px;height:56px;border-radius:999px;background:var(--p-content-border-color);transition:background .14s}.gx-ins-resizer:hover .gx-ins-resizer-grip,.gx-inspect.dragging .gx-ins-resizer-grip{background:var(--p-primary-color)}.gx-ins-h{display:flex;align-items:flex-start;gap:10px;padding:14px 14px 13px;border-bottom:1px solid var(--p-content-border-color);background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 12%,transparent),transparent)}.gx-ins-dot{width:10px;height:10px;border-radius:50%;flex:none;margin-top:4px;background:var(--accent);box-shadow:0 0 10px var(--accent)}.gx-ins-id{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.gx-ins-name{margin:0;flex:1;min-width:0;font-size:15px;font-weight:700;line-height:1.3;color:var(--p-text-color);word-break:break-word}.gx-ins-orig-btn{flex:none}.gx-ins-orig-btn.on{border-color:var(--p-primary-color);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.gx-ins-x{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color);transition:background .14s,color .14s}.gx-ins-x:hover{background:var(--kx-surface-2);color:var(--p-text-color)}.gx-ins-x svg{width:16px;height:16px}.gx-ins-body{flex:1;min-height:0;overflow-y:auto;padding:13px 16px 18px}.gx-ins-body .kc-docsum{margin-bottom:14px}.gx-ins-body .kc-refs{margin-bottom:4px}.gx-ins-loading{display:flex;align-items:center;gap:8px;padding:14px 2px;font-size:12.5px;color:var(--p-text-muted-color)}.gx-ins-loading svg{width:16px;height:16px}.gx-ins-content{margin-top:14px;padding-top:14px;border-top:1px solid var(--p-content-border-color)}.gx-ins-doc+.gx-ins-doc{margin-top:18px;padding-top:16px;border-top:1px solid var(--p-content-border-color)}.gx-ins-doc-t{font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin-bottom:8px}.gx-ins-rv{display:block}.gx-ins-doc-orig{margin-bottom:10px}.gx-ins-clamp{position:relative}.gx-ins-clamp.clamped .gx-ins-clamp-inner{max-height:560px;overflow:hidden}.gx-ins-clamp-fade{position:absolute;left:0;right:0;bottom:0;height:88px;pointer-events:none;background:linear-gradient(to bottom,transparent,var(--p-content-background) 92%)}.gx-ins-more{margin-top:10px;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;background:var(--kx-surface-1);color:var(--p-text-color);border:1px solid var(--p-content-border-color);transition:border-color .14s,background .14s}.gx-ins-more:hover{border-color:var(--p-primary-color);color:var(--p-primary-color)}.gx-ins-more svg{width:15px;height:15px}.gx-inspect .kc-ref{border-radius:8px}.gx-ins-stats{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:11px}.gx-stat{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:var(--kx-radius-6);font-size:11px;font-weight:600;background:var(--kx-surface-2);color:var(--p-text-muted-color)}.gx-stat svg{width:13px;height:13px}.gx-rel-group{margin-top:14px}.gx-rel-title{display:flex;align-items:center;gap:6px;margin-bottom:7px;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.gx-rel-title svg{width:13px;height:13px}.gx-rel-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 9px;margin-bottom:4px;border-radius:8px;cursor:pointer;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);text-align:left;font:inherit;transition:background .13s,border-color .13s}.gx-rel-item:hover{background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.gx-rel-kind{flex:none;font-size:9px;font-weight:700;padding:2px 7px;border-radius:var(--kx-radius-6);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.gx-rel-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--p-text-color)}.gx-rel-go{flex:none;width:14px;height:14px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.gx-ins-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:28px 10px;text-align:center;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);font-size:12px}.gx-ins-empty svg{width:26px;height:26px}@media(max-width:640px){.gx-inspect{left:16px;right:16px;width:auto!important;top:auto;height:50%;max-width:calc(100vw - 32px)}.gx-ins-resizer{display:none}.gx-legend{max-width:calc(100vw - 32px);bottom:64px}.gx-legend-row{white-space:normal}.gx-sparse{max-width:calc(100vw - 32px);white-space:normal}}.gx-sparse{position:absolute;z-index:5;left:50%;bottom:18px;transform:translate(-50%);display:inline-flex;align-items:center;gap:9px;padding:7px 7px 7px 14px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font-size:12px;color:var(--p-text-muted-color);white-space:nowrap}.gx-sparse>svg{width:15px;height:15px;color:var(--p-success-500)}.gx-sparse-cta{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border-radius:999px;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;background:var(--p-primary-color);color:var(--p-primary-contrast-color);border:none}.gx-sparse-cta:hover{filter:brightness(1.07)}.gx-sparse-cta svg{width:13px;height:13px}.gx-ins-fade-enter-active,.gx-ins-fade-leave-active{transition:opacity .2s ease,transform .2s ease}.gx-ins-fade-enter-from,.gx-ins-fade-leave-to{opacity:0;transform:translate(8px)}.gx-treat{display:flex;flex-direction:column;gap:12px;padding:10px 12px}.gx-treat-check{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--p-text-color);cursor:pointer}.gx-treat-check input{width:15px;height:15px;accent-color:var(--p-primary-color);cursor:pointer}.gx-treat .ap-textarea{min-height:76px}.gx-treat-actions{display:flex;gap:8px}.gx-treat-actions .kx-btn{flex:1}.gx-treat-hint{margin:0;font-size:11px;line-height:1.5;color:var(--p-text-muted-color)}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}.gx-row-kebab{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--kx-radius-6);cursor:pointer;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);opacity:0;transition:opacity .12s,background .12s,color .12s}.gx-row:hover .gx-row-kebab{opacity:.7}.gx-row-kebab:hover{background:var(--kx-surface-2);color:var(--p-text-color);opacity:1}.gx-row-kebab svg{width:15px;height:15px}.gx-treerow{display:flex;align-items:center;gap:1px}.gx-treerow .gx-row{flex:1;min-width:0}.gx-row--flat{padding-left:8px}.gx-drill{display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:2px 4px 8px;margin-bottom:4px;border-bottom:1px solid var(--p-content-border-color)}.gx-drill-home,.gx-drill-crumb{display:inline-flex;align-items:center;gap:4px;max-width:132px;border:none;background:transparent;border-radius:var(--kx-radius-6);cursor:pointer;padding:2px 5px;font:inherit;font-size:11.5px;font-weight:600;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gx-drill-home svg{width:14px;height:14px}.gx-drill-home:hover,.gx-drill-crumb:hover{background:var(--kx-surface-2);color:var(--p-text-color)}.gx-drill-crumb.last{color:var(--p-text-color);font-weight:700}.gx-drill-sep{width:12px;height:12px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);flex:none}.gx-botleft{position:absolute;z-index:5;left:16px;bottom:16px;display:flex;align-items:center;gap:8px}.gx-botleft .gx-legend{position:static;left:auto;bottom:auto}.gx-display{display:flex;align-items:center;gap:11px;padding:6px 13px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;color:var(--p-text-color)}.gx-display-row,.gx-display-reset{display:inline-flex;align-items:center;gap:7px;padding:0;border:none;background:transparent;font:inherit;font-size:12px;font-weight:600;color:var(--p-text-color);cursor:pointer}.gx-display-row:hover,.gx-display-reset{color:var(--p-primary-color)}.gx-display-reset:hover{filter:brightness(1.1)}.gx-display-div{width:1px;height:18px;background:var(--gx-glass-border);flex:none}.gx-display-ic{width:15px;height:15px;color:var(--p-text-muted-color);flex:none}.gx-display-label{white-space:nowrap}.gx-display-sw{position:relative;width:30px;height:17px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 18%,transparent);transition:background .15s;flex:none}.gx-display-sw.on{background:var(--p-primary-color)}.gx-display-knob{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;transition:transform .15s}.gx-display-sw.on .gx-display-knob{transform:translate(13px)}.gx-display-reset svg{width:15px;height:15px}.gx-display-count{margin-left:6px;padding:1px 7px;border-radius:999px;background:var(--kx-surface-2);font-size:10.5px;font-weight:700;color:var(--p-text-muted-color)}.gx-display-slider{display:inline-flex;align-items:center;gap:8px}.gx-range{-webkit-appearance:none;appearance:none;width:108px;height:4px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 18%,transparent);outline:none;cursor:pointer}.gx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--p-primary-color);border:2px solid var(--p-content-background);cursor:pointer}.gx-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--p-primary-color);border:2px solid var(--p-content-background);cursor:pointer}.gx-display-lvl{font:inherit;font-size:11.5px;font-weight:700;color:var(--p-text-color);min-width:28px;text-align:right}.gx-display-lvl-max{color:color-mix(in srgb,var(--p-text-color) 45%,transparent);font-weight:600}.gx-focusbar{position:absolute;z-index:6;left:50%;bottom:16px;transform:translate(-50%);display:inline-flex;align-items:center;gap:8px;padding:5px 6px 5px 5px;border-radius:999px;background:var(--gx-glass);backdrop-filter:blur(14px);border:1px solid var(--gx-glass-border);box-shadow:var(--gx-shadow);font:inherit;font-size:12px;font-weight:650;color:var(--p-text-color)}.gx-focusbar-up,.gx-focusbar-x{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:none;border-radius:50%;background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .12s,color .12s}.gx-focusbar-up{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.gx-focusbar-up:hover{background:color-mix(in srgb,var(--p-primary-color) 24%,transparent)}.gx-focusbar-x:hover{background:var(--kx-surface-2);color:var(--p-text-color)}.gx-focusbar-up svg,.gx-focusbar-x svg{width:16px;height:16px}.gx-focusbar-ic{width:15px;height:15px;color:var(--p-primary-color)}.gx-focusbar-name{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
class wa extends Bt {
  static get wippyConfig() {
    return {
      propsSchema: on.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Ut + ma + ba
    };
  }
  static get vueConfig() {
    return { rootComponent: ha };
  }
}
jt(import.meta.url, wa);
//# sourceMappingURL=wiki.js.map
