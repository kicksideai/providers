import { u as Te, a as He, _ as _e, b as Qe, W as Ke, c as je } from "./styles-CH5LsqRe.js";
import { defineComponent as Ne, openBlock as l, createElementBlock as r, normalizeClass as j, createElementVNode as s, ref as d, computed as u, watch as re, onUnmounted as Xe, onMounted as Je, createVNode as k, unref as w, toDisplayString as f, Fragment as H, renderList as ke, createCommentVNode as c, createTextVNode as x, createBlock as We, withDirectives as Ge, vModelText as Ye, withCtx as we } from "vue";
import { Icon as Q } from "@iconify/vue";
import { api as Ce, host as Ze, loadByTagName as Se, define as et } from "@wippy-fe/proxy";
const tt = ["disabled", "aria-checked"], K = /* @__PURE__ */ Ne({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(m, { emit: v }) {
    const C = v;
    return (g, y) => (l(), r("button", {
      type: "button",
      class: j(["cx-switch", { on: m.modelValue }]),
      disabled: m.disabled,
      role: "switch",
      "aria-checked": m.modelValue,
      onClick: y[0] || (y[0] = (R) => C("update:modelValue", !m.modelValue))
    }, [...y[1] || (y[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, tt));
  }
}), st = 24, nt = 60;
function Ee(m, v) {
  return m.trim().length <= st && (v || "").trim().length <= nt;
}
const Ve = 3e3, at = 3e4, lt = { resummarize: "documents", reembed: "nodes" };
function Ae(m, v) {
  return m?.response?.data?.error || m?.message || v;
}
function Me(m) {
  Ze.handleError(m?.response?.status === 401 ? "auth-expired" : "other", m);
}
function rt(m) {
  const v = d({ resummarize: null, reembed: null }), C = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), y = d("");
  function R(a) {
    return C.value[a] || v.value[a]?.in_flight === !0;
  }
  const F = u(() => R("resummarize") || R("reembed"));
  let B = !1, S = 0, h = null;
  function b(a) {
    return !B && a === S;
  }
  function E() {
    h !== null && (clearTimeout(h), h = null);
  }
  function $(a, p) {
    E(), b(a) && (h = setTimeout(() => {
      V(a, p);
    }, p));
  }
  async function V(a, p = Ve) {
    E();
    const o = m();
    if (!(!o || !b(a))) {
      try {
        const { data: i } = await Ce.get(`/api/v1/kb10/${o}/maintenance`);
        if (!b(a)) return;
        if (!i?.success) throw new Error(i?.error || "could not read maintenance status");
        v.value = {
          resummarize: i.resummarize ?? null,
          reembed: i.reembed ?? null
        }, y.value = "";
      } catch (i) {
        if (!b(a)) return;
        y.value = Ae(i, "could not read maintenance status"), Me(i), $(a, Math.min(p * 2, at));
        return;
      }
      F.value && $(a, Ve);
    }
  }
  function L() {
    const a = ++S;
    E(), v.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, y.value = "", m() && V(a);
  }
  async function I(a) {
    const p = m();
    if (!p || F.value) return;
    const o = S;
    C.value = { ...C.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: i } = await Ce.post(`/api/v1/kb10/${p}/${a}`);
      if (!b(o)) return;
      if (!i?.success) throw new Error(i?.error || "could not start the run");
      i.run && (v.value = { ...v.value, [a]: i.run });
    } catch (i) {
      if (!b(o)) return;
      g.value = { ...g.value, [a]: Ae(i, "could not start the run") }, Me(i);
      return;
    } finally {
      b(o) && (C.value = { ...C.value, [a]: !1 });
    }
    V(o);
  }
  function N(a) {
    const p = g.value[a];
    if (p) return { text: p, tone: "err" };
    if (C.value[a]) return { text: "Starting…", tone: "" };
    const o = v.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${lt[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return re(m, L, { immediate: !0 }), Xe(() => {
    B = !0, E();
  }), { runs: v, statusError: y, running: R, anyBusy: F, start: I, statusLine: N };
}
const ot = { class: "cx" }, it = { class: "cx-group" }, ut = { class: "cx-group-h" }, dt = { class: "cx-field" }, ct = {
  key: 0,
  class: "cx-fixed"
}, mt = { class: "cx-fixed-v" }, vt = ["value"], pt = {
  key: 0,
  class: "cx-row"
}, gt = { class: "cx-label" }, ft = ["type", "min", "max", "step", "value", "onInput"], yt = {
  key: 0,
  class: "st-hint"
}, bt = { class: "cx-label" }, xt = ["value", "onInput"], ht = {
  key: 0,
  class: "st-hint"
}, _t = { class: "cx-sub" }, kt = { class: "cx-sub-h" }, wt = { class: "cx-sub-t" }, Ct = { class: "st-hint" }, St = {
  key: 1,
  class: "cx-req"
}, Et = { class: "cx-row" }, Vt = { class: "cx-field" }, At = ["value"], Mt = { class: "cx-field" }, Nt = ["value"], qt = {
  key: 0,
  class: "cx-field"
}, $t = { class: "cx-label" }, Lt = ["value"], Rt = {
  key: 0,
  class: "st-hint"
}, It = {
  key: 1,
  class: "cx-row"
}, zt = { class: "cx-label" }, Bt = ["min", "max", "placeholder", "value"], Pt = {
  key: 0,
  class: "cx-err"
}, Ft = {
  key: 1,
  class: "st-hint"
}, Dt = {
  key: 1,
  class: "cx-hint"
}, Ot = { class: "cx-sub" }, Ut = { class: "cx-sub-h" }, Tt = {
  key: 0,
  class: "cx-field"
}, Ht = ["value"], Qt = { class: "cx-group" }, Kt = { class: "cx-group-h" }, jt = { class: "cx-field" }, Xt = ["value"], Jt = { class: "cx-toggle" }, Wt = { class: "cx-toggle" }, Gt = {
  key: 0,
  class: "st-hint"
}, Yt = {
  key: 1,
  class: "cx-err"
}, Zt = {
  key: 2,
  class: "cx-field"
}, es = { class: "cx-row" }, ts = { class: "cx-field" }, ss = ["value"], ns = {
  key: 0,
  class: "cx-field"
}, as = ["value"], ls = {
  key: 3,
  class: "cx-field"
}, rs = ["selected"], os = {
  key: 4,
  class: "cx-toggle"
}, is = { class: "cx-field" }, us = ["value"], ds = {
  key: 0,
  class: "cx-group"
}, cs = { class: "cx-group-h" }, ms = { class: "cx-lead" }, vs = {
  key: 0,
  class: "cx-err"
}, ps = { class: "cx-maint-row" }, gs = "class:embed", q = "class:fast", fs = /* @__PURE__ */ Ne({
  __name: "KbCreateConfig",
  setup(m) {
    const v = Te(), C = He(), g = u(() => v.value.config || {}), y = u(() => !!g.value.edit), R = u(() => y.value && g.value.id || ""), F = u(() => g.value.kb_type || ""), B = u(() => F.value !== "document"), S = d(""), h = d(!0), b = d(q), E = d(q), $ = d(""), V = d(""), L = d(!1), I = d(q), N = d({}), a = d(""), p = d(!1), o = d(!1), i = d(!1), D = d(25), J = u(() => g.value.config?.tuning), O = d(""), P = d(null), _ = d("built-in"), z = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      z.value = n[0] || "";
    }
    const W = u(() => {
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
    ], G = u(() => W.value.filter((t) => !$e.includes(t.key))), Le = u(() => G.value.filter((t) => t.format === "textarea")), oe = u(() => G.value.filter((t) => t.format !== "textarea")), U = u(() => W.value.find((t) => t.key === "summary_prompt")), A = u(() => W.value.find((t) => t.key === "summary_max_chars")), Re = u(() => {
      const t = A.value;
      return t ? `${t.label || t.key} characters` : "";
    }), X = u(() => A.value?.minimum ?? 0), Y = u(() => A.value?.maximum), Ie = u(() => {
      const t = A.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), Z = u(() => {
      const t = V.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = Y.value;
      return e < X.value || n !== void 0 && e > n ? null : e;
    }), ie = u(() => {
      if (V.value.trim() === "" || Z.value !== null) return "";
      const e = Y.value;
      return e === void 0 ? `Summary length must be a whole number of ${X.value} characters or more.` : `Summary length must be a whole number between ${X.value} and ${e} characters.`;
    });
    function ze() {
      const t = g.value.config || {};
      S.value = g.value.embedding_model || gs;
      const e = typeof t.summary_model == "string" ? t.summary_model : "", n = typeof t.chunk_enrichment_model == "string" ? t.chunk_enrichment_model : "", M = t.summary_model !== void 0 || t.chunk_enrichment_model !== void 0;
      h.value = B.value ? !0 : M ? !!n : !0, b.value = e || q, E.value = n || q, $.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", V.value = y.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", L.value = t.embed_images === !0, I.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : q;
      const xe = {};
      for (const le of G.value) {
        const he = t[le.key];
        xe[le.key] = he !== void 0 ? he : le.default;
      }
      N.value = xe, a.value = (typeof t.retrieval_model == "string" ? t.retrieval_model : "") || (typeof t.analysis_model == "string" ? t.analysis_model : ""), p.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", i.value = t.self_tuning === !0, D.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, O.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const ae = Number(t.max_retrieval_iterations);
      P.value = Number.isFinite(ae) && ae > 0 ? ae : null, _.value = t.query_driver === "agentic" ? "agentic" : "built-in", z.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ee() {
      const t = { ...N.value };
      return h.value ? (t.summary_model = b.value || q, t.chunk_enrichment_model = E.value || q, t.summary_prompt = $.value.trim(), Z.value !== null ? t.summary_max_chars = Z.value : delete t.summary_max_chars) : (delete t.summary_model, delete t.chunk_enrichment_model, delete t.summary_prompt, delete t.summary_max_chars), L.value ? (t.embed_images = !0, t.image_caption_model = I.value || q) : (t.embed_images = !1, delete t.image_caption_model), Qe(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = i.value, i.value && (t.self_tuning_query_interval = D.value), t.enable_reranking = p.value && _.value !== "agentic", t.extra_prompt = O.value.trim(), _.value === "agentic" && P.value && (t.max_retrieval_iterations = P.value), t.query_driver = _.value, _.value === "agentic" && z.value ? t.query_agent = z.value : delete t.query_agent, t;
    }
    function ue() {
      C("config-changed", { embedding_model: S.value, config: ee() });
    }
    function T(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Be(t) {
      S.value = T(t);
    }
    function Pe(t) {
      b.value = T(t);
    }
    function Fe(t) {
      E.value = T(t);
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
    } = rt(() => R.value), Ue = u(() => !!R.value), te = u(() => De.value || ve.value), se = u(() => fe("resummarize")), ne = u(() => fe("reembed"));
    function ye(t) {
      te.value || Oe(t);
    }
    function be() {
      ze(), me.value = JSON.stringify(ee()), ue();
    }
    return re(() => v.value.config, be), re([S, h, b, E, $, V, L, I, N, a, p, o, i, D, O, P, _, z], ue, { deep: !0 }), Je(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), be();
    }), (t, e) => (l(), r("div", ot, [
      s("div", it, [
        s("div", ut, [
          k(w(Q), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[15] || (e[15] = s("span", null, "Indexing", -1))
        ]),
        e[31] || (e[31] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", dt, [
          e[17] || (e[17] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          y.value ? (l(), r("div", ct, [
            k(w(Q), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", mt, f(S.value || "—"), 1),
            e[16] || (e[16] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: S.value,
            capability: "embed",
            onSelect: Be
          }, null, 40, vt)),
          e[18] || (e[18] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        oe.value.length ? (l(), r("div", pt, [
          (l(!0), r(H, null, ke(oe.value, (n) => (l(), r("label", {
            key: n.key,
            class: j(["cx-field", { "cx-span": !w(Ee)(n.label || n.key, n.description) }])
          }, [
            s("span", gt, f(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: ce(n.key),
              onInput: (M) => de(n, M.target.value)
            }, null, 40, ft),
            n.description ? (l(), r("p", yt, f(n.description), 1)) : c("", !0)
          ], 2))), 128))
        ])) : c("", !0),
        (l(!0), r(H, null, ke(Le.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", bt, f(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (M) => de(n, M.target.value)
          }, null, 40, xt),
          n.description ? (l(), r("p", ht, f(n.description), 1)) : c("", !0)
        ]))), 128)),
        s("div", _t, [
          s("div", kt, [
            s("span", wt, [
              e[20] || (e[20] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", Ct, [
                e[19] || (e[19] = x(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                B.value ? (l(), r(H, { key: 0 }, [
                  x(" Required — the concept graph is built from these models.")
                ], 64)) : c("", !0)
              ])
            ]),
            B.value ? (l(), r("span", St, "Required")) : (l(), We(K, {
              key: 0,
              modelValue: h.value,
              "onUpdate:modelValue": e[0] || (e[0] = (n) => h.value = n),
              "aria-label": "Contextual embedding"
            }, null, 8, ["modelValue"]))
          ]),
          h.value ? (l(), r(H, { key: 0 }, [
            s("div", Et, [
              s("div", Vt, [
                e[21] || (e[21] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: b.value,
                  capability: "generate",
                  onSelect: Pe
                }, null, 40, At),
                e[22] || (e[22] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Mt, [
                e[23] || (e[23] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: E.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, Nt),
                e[24] || (e[24] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            U.value ? (l(), r("label", qt, [
              s("span", $t, [
                x(f(U.value.label || U.value.key) + " ", 1),
                e[25] || (e[25] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: $.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[1] || (e[1] = (n) => $.value = n.target.value)
              }, null, 40, Lt),
              U.value.description ? (l(), r("p", Rt, f(U.value.description), 1)) : c("", !0)
            ])) : c("", !0),
            A.value ? (l(), r("div", It, [
              s("label", {
                class: j(["cx-field", { "cx-span": !w(Ee)(Re.value, A.value.description) }])
              }, [
                s("span", zt, [
                  x(f(A.value.label || A.value.key) + " ", 1),
                  e[26] || (e[26] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: X.value,
                  max: Y.value,
                  placeholder: Ie.value,
                  value: V.value,
                  onInput: e[2] || (e[2] = (n) => V.value = n.target.value)
                }, null, 40, Bt),
                ie.value ? (l(), r("p", Pt, f(ie.value), 1)) : A.value.description ? (l(), r("p", Ft, f(A.value.description), 1)) : c("", !0)
              ], 2)
            ])) : c("", !0)
          ], 64)) : (l(), r("p", Dt, [
            k(w(Q), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[27] || (e[27] = x("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Ot, [
          s("div", Ut, [
            e[28] || (e[28] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            k(K, {
              modelValue: L.value,
              "onUpdate:modelValue": e[3] || (e[3] = (n) => L.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          L.value ? (l(), r("div", Tt, [
            e[29] || (e[29] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: I.value,
              capability: "vision",
              onSelect: e[4] || (e[4] = (n) => I.value = T(n))
            }, null, 40, Ht),
            e[30] || (e[30] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : c("", !0)
        ])
      ]),
      s("div", Qt, [
        s("div", Kt, [
          k(w(Q), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[32] || (e[32] = s("span", null, "Ask", -1))
        ]),
        e[49] || (e[49] = s("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        s("div", jt, [
          e[33] || (e[33] = s("span", { class: "cx-label" }, "Answer model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[5] || (e[5] = (n) => a.value = T(n))
          }, null, 40, Xt),
          e[34] || (e[34] = s("p", { class: "st-hint" }, "Reads the retrieved passages and writes the answer. Leave empty to return passages only — plain vector search, no generated answer.", -1))
        ]),
        s("label", Jt, [
          k(K, {
            modelValue: o.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[35] || (e[35] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        s("label", Wt, [
          k(K, {
            modelValue: i.value,
            "onUpdate:modelValue": e[7] || (e[7] = (n) => i.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[36] || (e[36] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        J.value?.applied_at ? (l(), r("p", Gt, "Last tuning: " + f(J.value.applied_at) + ". " + f(J.value.rationale), 1)) : c("", !0),
        (o.value || i.value) && !a.value ? (l(), r("p", Yt, "Select an answer model for retrieval optimization.")) : c("", !0),
        i.value ? (l(), r("label", Zt, [
          e[37] || (e[37] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Ge(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[8] || (e[8] = (n) => D.value = n)
          }, null, 512), [
            [
              Ye,
              D.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[38] || (e[38] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : c("", !0),
        s("div", es, [
          s("label", ts, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: _.value,
              onChange: e[9] || (e[9] = (n) => _.value = n.target.value)
            }, [...e[39] || (e[39] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, ss),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          _.value === "agentic" ? (l(), r("label", ns, [
            e[42] || (e[42] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: P.value ?? "",
              onInput: e[10] || (e[10] = (n) => P.value = Number(n.target.value) || null)
            }, null, 40, as),
            e[43] || (e[43] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : c("", !0)
        ]),
        _.value === "agentic" ? (l(), r("div", ls, [
          e[44] || (e[44] = s("span", { class: "cx-label" }, [
            x("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: z.value ? JSON.stringify([z.value]) : "[]",
            onChange: qe
          }, null, 40, rs),
          e[45] || (e[45] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : c("", !0),
        _.value !== "agentic" ? (l(), r("label", os, [
          k(K, {
            modelValue: p.value,
            "onUpdate:modelValue": e[11] || (e[11] = (n) => p.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[46] || (e[46] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : c("", !0),
        s("label", is, [
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
          }, null, 40, us),
          e[48] || (e[48] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Ue.value ? (l(), r("div", ds, [
        s("div", cs, [
          k(w(Q), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[50] || (e[50] = s("span", null, "Maintenance", -1))
        ]),
        s("p", ms, [
          e[51] || (e[51] = x(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), r(H, { key: 0 }, [
            x("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : c("", !0)
        ]),
        w(pe) ? (l(), r("p", vs, f(w(pe)), 1)) : c("", !0),
        s("div", ps, [
          k(_e, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: w(ge)("resummarize"),
            onClick: e[13] || (e[13] = (n) => ye("resummarize"))
          }, {
            default: we(() => [...e[52] || (e[52] = [
              x("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          k(_e, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: w(ge)("reembed"),
            onClick: e[14] || (e[14] = (n) => ye("reembed"))
          }, {
            default: we(() => [...e[53] || (e[53] = [
              x("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        se.value.text ? (l(), r("p", {
          key: 1,
          class: j(["cx-maint-status", se.value.tone])
        }, [
          e[54] || (e[54] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          x(f(se.value.text), 1)
        ], 2)) : c("", !0),
        ne.value.text ? (l(), r("p", {
          key: 2,
          class: j(["cx-maint-status", ne.value.tone])
        }, [
          e[55] || (e[55] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          x(f(ne.value.text), 1)
        ], 2)) : c("", !0)
      ])) : c("", !0)
    ]));
  }
}), ys = {
  type: "object",
  properties: {
    config: { type: "object", description: "Configuration context: { kb_type, id?, embedding_model?, config?, edit? }" }
  }
};
class bs extends Ke {
  static get wippyConfig() {
    return {
      propsSchema: ys,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: je
    };
  }
  static get vueConfig() {
    return { rootComponent: fs };
  }
}
et(import.meta.url, bs);
//# sourceMappingURL=create.js.map
