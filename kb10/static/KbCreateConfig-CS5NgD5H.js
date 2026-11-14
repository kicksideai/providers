import { defineComponent as Ne, openBlock as l, createElementBlock as r, normalizeClass as J, createElementVNode as s, ref as d, computed as u, watch as re, onUnmounted as Ue, onMounted as He, createVNode as k, unref as w, toDisplayString as f, Fragment as H, renderList as _e, createCommentVNode as c, createTextVNode as x, createBlock as Qe, withDirectives as Xe, vModelText as Je, withCtx as ke } from "vue";
import { Icon as Q } from "@iconify/vue";
import { api as we, host as Ke, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as je, u as Ge } from "./wc-runtime-CNDpK4lj.js";
import { _ as Ee, a as We } from "./queryMode-B1MoVAIk.js";
const Ye = ["disabled", "aria-checked"], X = /* @__PURE__ */ Ne({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(m, { emit: v }) {
    const S = v;
    return (g, y) => (l(), r("button", {
      type: "button",
      class: J(["cx-switch", { on: m.modelValue }]),
      disabled: m.disabled,
      role: "switch",
      "aria-checked": m.modelValue,
      onClick: y[0] || (y[0] = (R) => S("update:modelValue", !m.modelValue))
    }, [...y[1] || (y[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, Ye));
  }
}), Ze = 24, et = 60;
function Ve(m, v) {
  return m.trim().length <= Ze && (v || "").trim().length <= et;
}
const Ce = 3e3, tt = 3e4, st = { resummarize: "documents", reembed: "nodes" };
function Ae(m, v) {
  return m?.response?.data?.error || m?.message || v;
}
function Me(m) {
  Ke.handleError(m?.response?.status === 401 ? "auth-expired" : "other", m);
}
function nt(m) {
  const v = d({ resummarize: null, reembed: null }), S = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), y = d("");
  function R(a) {
    return S.value[a] || v.value[a]?.in_flight === !0;
  }
  const F = u(() => R("resummarize") || R("reembed"));
  let B = !1, E = 0, h = null;
  function b(a) {
    return !B && a === E;
  }
  function V() {
    h !== null && (clearTimeout(h), h = null);
  }
  function $(a, p) {
    V(), b(a) && (h = setTimeout(() => {
      C(a, p);
    }, p));
  }
  async function C(a, p = Ce) {
    V();
    const o = m();
    if (!(!o || !b(a))) {
      try {
        const { data: i } = await we.get(`/api/v1/kb10/${o}/maintenance`);
        if (!b(a)) return;
        if (!i?.success) throw new Error(i?.error || "could not read maintenance status");
        v.value = {
          resummarize: i.resummarize ?? null,
          reembed: i.reembed ?? null
        }, y.value = "";
      } catch (i) {
        if (!b(a)) return;
        y.value = Ae(i, "could not read maintenance status"), Me(i), $(a, Math.min(p * 2, tt));
        return;
      }
      F.value && $(a, Ce);
    }
  }
  function L() {
    const a = ++E;
    V(), v.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, y.value = "", m() && C(a);
  }
  async function I(a) {
    const p = m();
    if (!p || F.value) return;
    const o = E;
    S.value = { ...S.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: i } = await we.post(`/api/v1/kb10/${p}/${a}`);
      if (!b(o)) return;
      if (!i?.success) throw new Error(i?.error || "could not start the run");
      i.run && (v.value = { ...v.value, [a]: i.run });
    } catch (i) {
      if (!b(o)) return;
      g.value = { ...g.value, [a]: Ae(i, "could not start the run") }, Me(i);
      return;
    } finally {
      b(o) && (S.value = { ...S.value, [a]: !1 });
    }
    C(o);
  }
  function N(a) {
    const p = g.value[a];
    if (p) return { text: p, tone: "err" };
    if (S.value[a]) return { text: "Starting…", tone: "" };
    const o = v.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${st[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return re(m, L, { immediate: !0 }), Ue(() => {
    B = !0, V();
  }), { runs: v, statusError: y, running: R, anyBusy: F, start: I, statusLine: N };
}
const at = { class: "cx" }, lt = { class: "cx-group" }, rt = { class: "cx-group-h" }, ot = { class: "cx-field" }, it = {
  key: 0,
  class: "cx-fixed"
}, ut = { class: "cx-fixed-v" }, dt = ["value"], ct = {
  key: 0,
  class: "cx-row"
}, mt = { class: "cx-label" }, vt = ["type", "min", "max", "step", "value", "onInput"], pt = {
  key: 0,
  class: "st-hint"
}, gt = { class: "cx-label" }, ft = ["value", "onInput"], yt = {
  key: 0,
  class: "st-hint"
}, bt = { class: "cx-sub" }, xt = { class: "cx-sub-h" }, ht = { class: "cx-sub-t" }, _t = { class: "st-hint" }, kt = {
  key: 1,
  class: "cx-req"
}, wt = { class: "cx-row" }, St = { class: "cx-field" }, Et = ["value"], Vt = { class: "cx-field" }, Ct = ["value"], At = {
  key: 0,
  class: "cx-field"
}, Mt = { class: "cx-label" }, Nt = ["value"], qt = {
  key: 0,
  class: "st-hint"
}, $t = {
  key: 1,
  class: "cx-row"
}, Lt = { class: "cx-label" }, Rt = ["min", "max", "placeholder", "value"], It = {
  key: 0,
  class: "cx-err"
}, zt = {
  key: 1,
  class: "st-hint"
}, Bt = {
  key: 1,
  class: "cx-hint"
}, Pt = { class: "cx-sub" }, Ft = { class: "cx-sub-h" }, Dt = {
  key: 0,
  class: "cx-field"
}, Ot = ["value"], Tt = { class: "cx-group" }, Ut = { class: "cx-group-h" }, Ht = { class: "cx-field" }, Qt = ["value"], Xt = { class: "cx-toggle" }, Jt = { class: "cx-toggle" }, Kt = {
  key: 0,
  class: "st-hint"
}, jt = {
  key: 1,
  class: "cx-err"
}, Gt = {
  key: 2,
  class: "cx-field"
}, Wt = { class: "cx-row" }, Yt = { class: "cx-field" }, Zt = ["value"], es = {
  key: 0,
  class: "cx-field"
}, ts = ["value"], ss = {
  key: 3,
  class: "cx-field"
}, ns = ["selected"], as = {
  key: 4,
  class: "cx-toggle"
}, ls = { class: "cx-field" }, rs = ["value"], os = {
  key: 0,
  class: "cx-group"
}, is = { class: "cx-group-h" }, us = { class: "cx-lead" }, ds = {
  key: 0,
  class: "cx-err"
}, cs = { class: "cx-maint-row" }, ms = "class:embed", q = "class:fast", bs = /* @__PURE__ */ Ne({
  __name: "KbCreateConfig",
  setup(m) {
    const v = je(), S = Ge(), g = u(() => v.value.config || {}), y = u(() => !!g.value.edit), R = u(() => y.value && g.value.id || ""), F = u(() => g.value.kb_type || ""), B = u(() => F.value !== "document"), E = d(""), h = d(!0), b = d(q), V = d(q), $ = d(""), C = d(""), L = d(!1), I = d(q), N = d({}), a = d(""), p = d(!1), o = d(!1), i = d(!1), D = d(25), j = u(() => g.value.config?.tuning), O = d(""), P = d(null), _ = d("built-in"), z = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      z.value = n[0] || "";
    }
    const G = u(() => {
      const e = g.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, M]) => ({ key: n, ...M })).sort((n, M) => (n.order ?? 100) - (M.order ?? 100) || n.key.localeCompare(M.key)) : [];
    }), $e = [
      "summary_prompt",
      "summary_max_chars",
      "analysis_model",
      "query_strategy",
      "self_tuning",
      "self_tuning_query_interval",
      "enable_reranking",
      "extra_prompt"
    ], W = u(() => G.value.filter((t) => !$e.includes(t.key))), Le = u(() => W.value.filter((t) => t.format === "textarea")), oe = u(() => W.value.filter((t) => t.format !== "textarea")), T = u(() => G.value.find((t) => t.key === "summary_prompt")), A = u(() => G.value.find((t) => t.key === "summary_max_chars")), Re = u(() => {
      const t = A.value;
      return t ? `${t.label || t.key} characters` : "";
    }), K = u(() => A.value?.minimum ?? 0), Y = u(() => A.value?.maximum), Ie = u(() => {
      const t = A.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), Z = u(() => {
      const t = C.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = Y.value;
      return e < K.value || n !== void 0 && e > n ? null : e;
    }), ie = u(() => {
      if (C.value.trim() === "" || Z.value !== null) return "";
      const e = Y.value;
      return e === void 0 ? `Summary length must be a whole number of ${K.value} characters or more.` : `Summary length must be a whole number between ${K.value} and ${e} characters.`;
    });
    function ze() {
      const t = g.value.config || {};
      E.value = g.value.embedding_model || ms;
      const e = typeof t.summary_model == "string" ? t.summary_model : "", n = typeof t.chunk_enrichment_model == "string" ? t.chunk_enrichment_model : "", M = t.summary_model !== void 0 || t.chunk_enrichment_model !== void 0;
      h.value = B.value ? !0 : M ? !!n : !0, b.value = e || q, V.value = n || q, $.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", C.value = y.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", L.value = t.embed_images === !0, I.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : q;
      const xe = {};
      for (const le of W.value) {
        const he = t[le.key];
        xe[le.key] = he !== void 0 ? he : le.default;
      }
      N.value = xe, a.value = (typeof t.retrieval_model == "string" ? t.retrieval_model : "") || (typeof t.analysis_model == "string" ? t.analysis_model : ""), p.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", i.value = t.self_tuning === !0, D.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, O.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const ae = Number(t.max_retrieval_iterations);
      P.value = Number.isFinite(ae) && ae > 0 ? ae : null, _.value = t.query_driver === "agentic" ? "agentic" : "built-in", z.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ee() {
      const t = { ...N.value };
      return h.value ? (t.summary_model = b.value || q, t.chunk_enrichment_model = V.value || q, t.summary_prompt = $.value.trim(), Z.value !== null ? t.summary_max_chars = Z.value : delete t.summary_max_chars) : (delete t.summary_model, delete t.chunk_enrichment_model, delete t.summary_prompt, delete t.summary_max_chars), L.value ? (t.embed_images = !0, t.image_caption_model = I.value || q) : (t.embed_images = !1, delete t.image_caption_model), We(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = i.value, i.value && (t.self_tuning_query_interval = D.value), t.enable_reranking = p.value && _.value !== "agentic", t.extra_prompt = O.value.trim(), _.value === "agentic" && P.value && (t.max_retrieval_iterations = P.value), t.query_driver = _.value, _.value === "agentic" && z.value ? t.query_agent = z.value : delete t.query_agent, t;
    }
    function ue() {
      S("config-changed", { embedding_model: E.value, config: ee() });
    }
    function U(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Be(t) {
      E.value = U(t);
    }
    function Pe(t) {
      b.value = U(t);
    }
    function Fe(t) {
      V.value = U(t);
    }
    function de(t, e) {
      if (t.type === "integer") {
        const n = Number.parseInt(e, 10);
        N.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else if (t.type === "number") {
        const n = Number.parseFloat(e);
        N.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else
        N.value[t.key] = e;
    }
    function ce(t) {
      const e = N.value[t];
      return e == null ? "" : String(e);
    }
    const me = d(""), ve = u(() => JSON.stringify(ee()) !== me.value), {
      statusError: pe,
      running: ge,
      anyBusy: De,
      start: Oe,
      statusLine: fe
    } = nt(() => R.value), Te = u(() => !!R.value), te = u(() => De.value || ve.value), se = u(() => fe("resummarize")), ne = u(() => fe("reembed"));
    function ye(t) {
      te.value || Oe(t);
    }
    function be() {
      ze(), me.value = JSON.stringify(ee()), ue();
    }
    return re(() => v.value.config, be), re([E, h, b, V, $, C, L, I, N, a, p, o, i, D, O, P, _, z], ue, { deep: !0 }), He(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), be();
    }), (t, e) => (l(), r("div", at, [
      s("div", lt, [
        s("div", rt, [
          k(w(Q), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[15] || (e[15] = s("span", null, "Indexing", -1))
        ]),
        e[31] || (e[31] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", ot, [
          e[17] || (e[17] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          y.value ? (l(), r("div", it, [
            k(w(Q), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", ut, f(E.value || "—"), 1),
            e[16] || (e[16] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: E.value,
            capability: "embed",
            onSelect: Be
          }, null, 40, dt)),
          e[18] || (e[18] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        oe.value.length ? (l(), r("div", ct, [
          (l(!0), r(H, null, _e(oe.value, (n) => (l(), r("label", {
            key: n.key,
            class: J(["cx-field", { "cx-span": !w(Ve)(n.label || n.key, n.description) }])
          }, [
            s("span", mt, f(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: ce(n.key),
              onInput: (M) => de(n, M.target.value)
            }, null, 40, vt),
            n.description ? (l(), r("p", pt, f(n.description), 1)) : c("", !0)
          ], 2))), 128))
        ])) : c("", !0),
        (l(!0), r(H, null, _e(Le.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", gt, f(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (M) => de(n, M.target.value)
          }, null, 40, ft),
          n.description ? (l(), r("p", yt, f(n.description), 1)) : c("", !0)
        ]))), 128)),
        s("div", bt, [
          s("div", xt, [
            s("span", ht, [
              e[20] || (e[20] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", _t, [
                e[19] || (e[19] = x(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                B.value ? (l(), r(H, { key: 0 }, [
                  x(" Required — the concept graph is built from these models.")
                ], 64)) : c("", !0)
              ])
            ]),
            B.value ? (l(), r("span", kt, "Required")) : (l(), Qe(X, {
              key: 0,
              modelValue: h.value,
              "onUpdate:modelValue": e[0] || (e[0] = (n) => h.value = n),
              "aria-label": "Contextual embedding"
            }, null, 8, ["modelValue"]))
          ]),
          h.value ? (l(), r(H, { key: 0 }, [
            s("div", wt, [
              s("div", St, [
                e[21] || (e[21] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: b.value,
                  capability: "generate",
                  onSelect: Pe
                }, null, 40, Et),
                e[22] || (e[22] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Vt, [
                e[23] || (e[23] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: V.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, Ct),
                e[24] || (e[24] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            T.value ? (l(), r("label", At, [
              s("span", Mt, [
                x(f(T.value.label || T.value.key) + " ", 1),
                e[25] || (e[25] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: $.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[1] || (e[1] = (n) => $.value = n.target.value)
              }, null, 40, Nt),
              T.value.description ? (l(), r("p", qt, f(T.value.description), 1)) : c("", !0)
            ])) : c("", !0),
            A.value ? (l(), r("div", $t, [
              s("label", {
                class: J(["cx-field", { "cx-span": !w(Ve)(Re.value, A.value.description) }])
              }, [
                s("span", Lt, [
                  x(f(A.value.label || A.value.key) + " ", 1),
                  e[26] || (e[26] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: K.value,
                  max: Y.value,
                  placeholder: Ie.value,
                  value: C.value,
                  onInput: e[2] || (e[2] = (n) => C.value = n.target.value)
                }, null, 40, Rt),
                ie.value ? (l(), r("p", It, f(ie.value), 1)) : A.value.description ? (l(), r("p", zt, f(A.value.description), 1)) : c("", !0)
              ], 2)
            ])) : c("", !0)
          ], 64)) : (l(), r("p", Bt, [
            k(w(Q), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[27] || (e[27] = x("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Pt, [
          s("div", Ft, [
            e[28] || (e[28] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            k(X, {
              modelValue: L.value,
              "onUpdate:modelValue": e[3] || (e[3] = (n) => L.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          L.value ? (l(), r("div", Dt, [
            e[29] || (e[29] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: I.value,
              capability: "vision",
              onSelect: e[4] || (e[4] = (n) => I.value = U(n))
            }, null, 40, Ot),
            e[30] || (e[30] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : c("", !0)
        ])
      ]),
      s("div", Tt, [
        s("div", Ut, [
          k(w(Q), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[32] || (e[32] = s("span", null, "Ask", -1))
        ]),
        e[49] || (e[49] = s("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        s("div", Ht, [
          e[33] || (e[33] = s("span", { class: "cx-label" }, "Answer model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[5] || (e[5] = (n) => a.value = U(n))
          }, null, 40, Qt),
          e[34] || (e[34] = s("p", { class: "st-hint" }, "Reads the retrieved passages and writes the answer. Leave empty to return passages only — plain vector search, no generated answer.", -1))
        ]),
        s("label", Xt, [
          k(X, {
            modelValue: o.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[35] || (e[35] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        s("label", Jt, [
          k(X, {
            modelValue: i.value,
            "onUpdate:modelValue": e[7] || (e[7] = (n) => i.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[36] || (e[36] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        j.value?.applied_at ? (l(), r("p", Kt, "Last tuning: " + f(j.value.applied_at) + ". " + f(j.value.rationale), 1)) : c("", !0),
        (o.value || i.value) && !a.value ? (l(), r("p", jt, "Select an answer model for retrieval optimization.")) : c("", !0),
        i.value ? (l(), r("label", Gt, [
          e[37] || (e[37] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Xe(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[8] || (e[8] = (n) => D.value = n)
          }, null, 512), [
            [
              Je,
              D.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[38] || (e[38] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : c("", !0),
        s("div", Wt, [
          s("label", Yt, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: _.value,
              onChange: e[9] || (e[9] = (n) => _.value = n.target.value)
            }, [...e[39] || (e[39] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, Zt),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          _.value === "agentic" ? (l(), r("label", es, [
            e[42] || (e[42] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: P.value ?? "",
              onInput: e[10] || (e[10] = (n) => P.value = Number(n.target.value) || null)
            }, null, 40, ts),
            e[43] || (e[43] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : c("", !0)
        ]),
        _.value === "agentic" ? (l(), r("div", ss, [
          e[44] || (e[44] = s("span", { class: "cx-label" }, [
            x("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: z.value ? JSON.stringify([z.value]) : "[]",
            onChange: qe
          }, null, 40, ns),
          e[45] || (e[45] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : c("", !0),
        _.value !== "agentic" ? (l(), r("label", as, [
          k(X, {
            modelValue: p.value,
            "onUpdate:modelValue": e[11] || (e[11] = (n) => p.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[46] || (e[46] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : c("", !0),
        s("label", ls, [
          e[47] || (e[47] = s("span", { class: "cx-label" }, [
            x("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: O.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[12] || (e[12] = (n) => O.value = n.target.value)
          }, null, 40, rs),
          e[48] || (e[48] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Te.value ? (l(), r("div", os, [
        s("div", is, [
          k(w(Q), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[50] || (e[50] = s("span", null, "Maintenance", -1))
        ]),
        s("p", us, [
          e[51] || (e[51] = x(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), r(H, { key: 0 }, [
            x("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : c("", !0)
        ]),
        w(pe) ? (l(), r("p", ds, f(w(pe)), 1)) : c("", !0),
        s("div", cs, [
          k(Ee, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: w(ge)("resummarize"),
            onClick: e[13] || (e[13] = (n) => ye("resummarize"))
          }, {
            default: ke(() => [...e[52] || (e[52] = [
              x("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          k(Ee, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: w(ge)("reembed"),
            onClick: e[14] || (e[14] = (n) => ye("reembed"))
          }, {
            default: ke(() => [...e[53] || (e[53] = [
              x("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        se.value.text ? (l(), r("p", {
          key: 1,
          class: J(["cx-maint-status", se.value.tone])
        }, [
          e[54] || (e[54] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          x(f(se.value.text), 1)
        ], 2)) : c("", !0),
        ne.value.text ? (l(), r("p", {
          key: 2,
          class: J(["cx-maint-status", ne.value.tone])
        }, [
          e[55] || (e[55] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          x(f(ne.value.text), 1)
        ], 2)) : c("", !0)
      ])) : c("", !0)
    ]));
  }
});
export {
  bs as default
};
//# sourceMappingURL=KbCreateConfig-CS5NgD5H.js.map
