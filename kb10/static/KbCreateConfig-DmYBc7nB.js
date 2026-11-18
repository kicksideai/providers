import { defineComponent as Ne, openBlock as l, createElementBlock as r, normalizeClass as J, createElementVNode as s, ref as c, computed as d, watch as re, onUnmounted as Ue, onMounted as He, createVNode as w, unref as S, toDisplayString as f, Fragment as H, renderList as _e, createCommentVNode as m, createTextVNode as h, createBlock as Qe, withDirectives as Xe, vModelText as Je, withCtx as ke } from "vue";
import { Icon as Q } from "@iconify/vue";
import { api as we, host as Ke, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as je, u as Ge } from "./wc-runtime-f54Bo-yJ.js";
import { _ as Ee } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const We = ["disabled", "aria-checked"], X = /* @__PURE__ */ Ne({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(i, { emit: v }) {
    const y = v;
    return (g, b) => (l(), r("button", {
      type: "button",
      class: J(["cx-switch", { on: i.modelValue }]),
      disabled: i.disabled,
      role: "switch",
      "aria-checked": i.modelValue,
      onClick: b[0] || (b[0] = (R) => y("update:modelValue", !i.modelValue))
    }, [...b[1] || (b[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, We));
  }
});
function Ye(i) {
  return typeof i == "string" ? i.trim() : "";
}
function Ze(i, v) {
  const y = Ye(v);
  if (y) {
    i.retrieval_model = y, i.analysis_model = y;
    return;
  }
  delete i.retrieval_model, i.analysis_model = !1;
}
const et = 24, tt = 60;
function Ve(i, v) {
  return i.trim().length <= et && (v || "").trim().length <= tt;
}
const Ce = 3e3, st = 3e4, nt = { resummarize: "documents", reembed: "nodes" };
function Ae(i, v) {
  return i?.response?.data?.error || i?.message || v;
}
function Me(i) {
  Ke.handleError(i?.response?.status === 401 ? "auth-expired" : "other", i);
}
function at(i) {
  const v = c({ resummarize: null, reembed: null }), y = c({ resummarize: !1, reembed: !1 }), g = c({ resummarize: "", reembed: "" }), b = c("");
  function R(a) {
    return y.value[a] || v.value[a]?.in_flight === !0;
  }
  const F = d(() => R("resummarize") || R("reembed"));
  let B = !1, E = 0, _ = null;
  function x(a) {
    return !B && a === E;
  }
  function V() {
    _ !== null && (clearTimeout(_), _ = null);
  }
  function $(a, p) {
    V(), x(a) && (_ = setTimeout(() => {
      C(a, p);
    }, p));
  }
  async function C(a, p = Ce) {
    V();
    const o = i();
    if (!(!o || !x(a))) {
      try {
        const { data: u } = await we.get(`/api/v1/kb10/${o}/maintenance`);
        if (!x(a)) return;
        if (!u?.success) throw new Error(u?.error || "could not read maintenance status");
        v.value = {
          resummarize: u.resummarize ?? null,
          reembed: u.reembed ?? null
        }, b.value = "";
      } catch (u) {
        if (!x(a)) return;
        b.value = Ae(u, "could not read maintenance status"), Me(u), $(a, Math.min(p * 2, st));
        return;
      }
      F.value && $(a, Ce);
    }
  }
  function L() {
    const a = ++E;
    V(), v.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, b.value = "", i() && C(a);
  }
  async function I(a) {
    const p = i();
    if (!p || F.value) return;
    const o = E;
    y.value = { ...y.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: u } = await we.post(`/api/v1/kb10/${p}/${a}`);
      if (!x(o)) return;
      if (!u?.success) throw new Error(u?.error || "could not start the run");
      u.run && (v.value = { ...v.value, [a]: u.run });
    } catch (u) {
      if (!x(o)) return;
      g.value = { ...g.value, [a]: Ae(u, "could not start the run") }, Me(u);
      return;
    } finally {
      x(o) && (y.value = { ...y.value, [a]: !1 });
    }
    C(o);
  }
  function N(a) {
    const p = g.value[a];
    if (p) return { text: p, tone: "err" };
    if (y.value[a]) return { text: "Starting…", tone: "" };
    const o = v.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${nt[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return re(i, L, { immediate: !0 }), Ue(() => {
    B = !0, V();
  }), { runs: v, statusError: b, running: R, anyBusy: F, start: I, statusLine: N };
}
const lt = { class: "cx" }, rt = { class: "cx-group" }, ot = { class: "cx-group-h" }, it = { class: "cx-field" }, ut = {
  key: 0,
  class: "cx-fixed"
}, dt = { class: "cx-fixed-v" }, ct = ["value"], mt = {
  key: 0,
  class: "cx-row"
}, vt = { class: "cx-label" }, pt = ["type", "min", "max", "step", "value", "onInput"], gt = {
  key: 0,
  class: "st-hint"
}, ft = { class: "cx-label" }, yt = ["value", "onInput"], bt = {
  key: 0,
  class: "st-hint"
}, xt = { class: "cx-sub" }, ht = { class: "cx-sub-h" }, _t = { class: "cx-sub-t" }, kt = { class: "st-hint" }, wt = {
  key: 1,
  class: "cx-req"
}, St = { class: "cx-row" }, Et = { class: "cx-field" }, Vt = ["value"], Ct = { class: "cx-field" }, At = ["value"], Mt = {
  key: 0,
  class: "cx-field"
}, Nt = { class: "cx-label" }, qt = ["value"], $t = {
  key: 0,
  class: "st-hint"
}, Lt = {
  key: 1,
  class: "cx-row"
}, Rt = { class: "cx-label" }, It = ["min", "max", "placeholder", "value"], zt = {
  key: 0,
  class: "cx-err"
}, Bt = {
  key: 1,
  class: "st-hint"
}, Pt = {
  key: 1,
  class: "cx-hint"
}, Ft = { class: "cx-sub" }, Dt = { class: "cx-sub-h" }, Ot = {
  key: 0,
  class: "cx-field"
}, Tt = ["value"], Ut = { class: "cx-group" }, Ht = { class: "cx-group-h" }, Qt = { class: "cx-field" }, Xt = ["value"], Jt = { class: "cx-toggle" }, Kt = { class: "cx-toggle" }, jt = {
  key: 0,
  class: "st-hint"
}, Gt = {
  key: 1,
  class: "cx-err"
}, Wt = {
  key: 2,
  class: "cx-field"
}, Yt = { class: "cx-row" }, Zt = { class: "cx-field" }, es = ["value"], ts = {
  key: 0,
  class: "cx-field"
}, ss = ["value"], ns = {
  key: 3,
  class: "cx-field"
}, as = ["selected"], ls = {
  key: 4,
  class: "cx-toggle"
}, rs = { class: "cx-field" }, os = ["value"], is = {
  key: 0,
  class: "cx-group"
}, us = { class: "cx-group-h" }, ds = { class: "cx-lead" }, cs = {
  key: 0,
  class: "cx-err"
}, ms = { class: "cx-maint-row" }, vs = "class:embed", q = "class:fast", xs = /* @__PURE__ */ Ne({
  __name: "KbCreateConfig",
  setup(i) {
    const v = je(), y = Ge(), g = d(() => v.value.config || {}), b = d(() => !!g.value.edit), R = d(() => b.value && g.value.id || ""), F = d(() => g.value.kb_type || ""), B = d(() => F.value !== "document"), E = c(""), _ = c(!0), x = c(q), V = c(q), $ = c(""), C = c(""), L = c(!1), I = c(q), N = c({}), a = c(""), p = c(!1), o = c(!1), u = c(!1), D = c(25), j = d(() => g.value.config?.tuning), O = c(""), P = c(null), k = c("built-in"), z = c("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      z.value = n[0] || "";
    }
    const G = d(() => {
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
    ], W = d(() => G.value.filter((t) => !$e.includes(t.key))), Le = d(() => W.value.filter((t) => t.format === "textarea")), oe = d(() => W.value.filter((t) => t.format !== "textarea")), T = d(() => G.value.find((t) => t.key === "summary_prompt")), A = d(() => G.value.find((t) => t.key === "summary_max_chars")), Re = d(() => {
      const t = A.value;
      return t ? `${t.label || t.key} characters` : "";
    }), K = d(() => A.value?.minimum ?? 0), Y = d(() => A.value?.maximum), Ie = d(() => {
      const t = A.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), Z = d(() => {
      const t = C.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = Y.value;
      return e < K.value || n !== void 0 && e > n ? null : e;
    }), ie = d(() => {
      if (C.value.trim() === "" || Z.value !== null) return "";
      const e = Y.value;
      return e === void 0 ? `Summary length must be a whole number of ${K.value} characters or more.` : `Summary length must be a whole number between ${K.value} and ${e} characters.`;
    });
    function ze() {
      const t = g.value.config || {};
      E.value = g.value.embedding_model || vs;
      const e = typeof t.summary_model == "string" ? t.summary_model : "", n = typeof t.chunk_enrichment_model == "string" ? t.chunk_enrichment_model : "", M = t.summary_model !== void 0 || t.chunk_enrichment_model !== void 0;
      _.value = B.value ? !0 : M ? !!n : !0, x.value = e || q, V.value = n || q, $.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", C.value = b.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", L.value = t.embed_images === !0, I.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : q;
      const xe = {};
      for (const le of W.value) {
        const he = t[le.key];
        xe[le.key] = he !== void 0 ? he : le.default;
      }
      N.value = xe, a.value = (typeof t.retrieval_model == "string" ? t.retrieval_model : "") || (typeof t.analysis_model == "string" ? t.analysis_model : ""), p.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", u.value = t.self_tuning === !0, D.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, O.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const ae = Number(t.max_retrieval_iterations);
      P.value = Number.isFinite(ae) && ae > 0 ? ae : null, k.value = t.query_driver === "agentic" ? "agentic" : "built-in", z.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ee() {
      const t = { ...N.value };
      return _.value ? (t.summary_model = x.value || q, t.chunk_enrichment_model = V.value || q, t.summary_prompt = $.value.trim(), Z.value !== null ? t.summary_max_chars = Z.value : delete t.summary_max_chars) : (delete t.summary_model, delete t.chunk_enrichment_model, delete t.summary_prompt, delete t.summary_max_chars), L.value ? (t.embed_images = !0, t.image_caption_model = I.value || q) : (t.embed_images = !1, delete t.image_caption_model), Ze(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = u.value, u.value && (t.self_tuning_query_interval = D.value), t.enable_reranking = p.value && k.value !== "agentic", t.extra_prompt = O.value.trim(), k.value === "agentic" && P.value && (t.max_retrieval_iterations = P.value), t.query_driver = k.value, k.value === "agentic" && z.value ? t.query_agent = z.value : delete t.query_agent, t;
    }
    function ue() {
      y("config-changed", { embedding_model: E.value, config: ee() });
    }
    function U(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Be(t) {
      E.value = U(t);
    }
    function Pe(t) {
      x.value = U(t);
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
    const me = c(""), ve = d(() => JSON.stringify(ee()) !== me.value), {
      statusError: pe,
      running: ge,
      anyBusy: De,
      start: Oe,
      statusLine: fe
    } = at(() => R.value), Te = d(() => !!R.value), te = d(() => De.value || ve.value), se = d(() => fe("resummarize")), ne = d(() => fe("reembed"));
    function ye(t) {
      te.value || Oe(t);
    }
    function be() {
      ze(), me.value = JSON.stringify(ee()), ue();
    }
    return re(() => v.value.config, be), re([E, _, x, V, $, C, L, I, N, a, p, o, u, D, O, P, k, z], ue, { deep: !0 }), He(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), be();
    }), (t, e) => (l(), r("div", lt, [
      s("div", rt, [
        s("div", ot, [
          w(S(Q), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[15] || (e[15] = s("span", null, "Indexing", -1))
        ]),
        e[31] || (e[31] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", it, [
          e[17] || (e[17] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          b.value ? (l(), r("div", ut, [
            w(S(Q), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", dt, f(E.value || "—"), 1),
            e[16] || (e[16] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: E.value,
            capability: "embed",
            onSelect: Be
          }, null, 40, ct)),
          e[18] || (e[18] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        oe.value.length ? (l(), r("div", mt, [
          (l(!0), r(H, null, _e(oe.value, (n) => (l(), r("label", {
            key: n.key,
            class: J(["cx-field", { "cx-span": !S(Ve)(n.label || n.key, n.description) }])
          }, [
            s("span", vt, f(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: ce(n.key),
              onInput: (M) => de(n, M.target.value)
            }, null, 40, pt),
            n.description ? (l(), r("p", gt, f(n.description), 1)) : m("", !0)
          ], 2))), 128))
        ])) : m("", !0),
        (l(!0), r(H, null, _e(Le.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", ft, f(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (M) => de(n, M.target.value)
          }, null, 40, yt),
          n.description ? (l(), r("p", bt, f(n.description), 1)) : m("", !0)
        ]))), 128)),
        s("div", xt, [
          s("div", ht, [
            s("span", _t, [
              e[20] || (e[20] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", kt, [
                e[19] || (e[19] = h(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                B.value ? (l(), r(H, { key: 0 }, [
                  h(" Required — the concept graph is built from these models.")
                ], 64)) : m("", !0)
              ])
            ]),
            B.value ? (l(), r("span", wt, "Required")) : (l(), Qe(X, {
              key: 0,
              modelValue: _.value,
              "onUpdate:modelValue": e[0] || (e[0] = (n) => _.value = n),
              "aria-label": "Contextual embedding"
            }, null, 8, ["modelValue"]))
          ]),
          _.value ? (l(), r(H, { key: 0 }, [
            s("div", St, [
              s("div", Et, [
                e[21] || (e[21] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: x.value,
                  capability: "generate",
                  onSelect: Pe
                }, null, 40, Vt),
                e[22] || (e[22] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Ct, [
                e[23] || (e[23] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: V.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, At),
                e[24] || (e[24] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            T.value ? (l(), r("label", Mt, [
              s("span", Nt, [
                h(f(T.value.label || T.value.key) + " ", 1),
                e[25] || (e[25] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: $.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[1] || (e[1] = (n) => $.value = n.target.value)
              }, null, 40, qt),
              T.value.description ? (l(), r("p", $t, f(T.value.description), 1)) : m("", !0)
            ])) : m("", !0),
            A.value ? (l(), r("div", Lt, [
              s("label", {
                class: J(["cx-field", { "cx-span": !S(Ve)(Re.value, A.value.description) }])
              }, [
                s("span", Rt, [
                  h(f(A.value.label || A.value.key) + " ", 1),
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
                }, null, 40, It),
                ie.value ? (l(), r("p", zt, f(ie.value), 1)) : A.value.description ? (l(), r("p", Bt, f(A.value.description), 1)) : m("", !0)
              ], 2)
            ])) : m("", !0)
          ], 64)) : (l(), r("p", Pt, [
            w(S(Q), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[27] || (e[27] = h("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Ft, [
          s("div", Dt, [
            e[28] || (e[28] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            w(X, {
              modelValue: L.value,
              "onUpdate:modelValue": e[3] || (e[3] = (n) => L.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          L.value ? (l(), r("div", Ot, [
            e[29] || (e[29] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: I.value,
              capability: "vision",
              onSelect: e[4] || (e[4] = (n) => I.value = U(n))
            }, null, 40, Tt),
            e[30] || (e[30] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : m("", !0)
        ])
      ]),
      s("div", Ut, [
        s("div", Ht, [
          w(S(Q), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[32] || (e[32] = s("span", null, "Ask", -1))
        ]),
        e[49] || (e[49] = s("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        s("div", Qt, [
          e[33] || (e[33] = s("span", { class: "cx-label" }, "Answer model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[5] || (e[5] = (n) => a.value = U(n))
          }, null, 40, Xt),
          e[34] || (e[34] = s("p", { class: "st-hint" }, "Reads the retrieved passages and writes the answer. Leave empty to return passages only — plain vector search, no generated answer.", -1))
        ]),
        s("label", Jt, [
          w(X, {
            modelValue: o.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[35] || (e[35] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        s("label", Kt, [
          w(X, {
            modelValue: u.value,
            "onUpdate:modelValue": e[7] || (e[7] = (n) => u.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[36] || (e[36] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        j.value?.applied_at ? (l(), r("p", jt, "Last tuning: " + f(j.value.applied_at) + ". " + f(j.value.rationale), 1)) : m("", !0),
        (o.value || u.value) && !a.value ? (l(), r("p", Gt, "Select an answer model for retrieval optimization.")) : m("", !0),
        u.value ? (l(), r("label", Wt, [
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
        ])) : m("", !0),
        s("div", Yt, [
          s("label", Zt, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: k.value,
              onChange: e[9] || (e[9] = (n) => k.value = n.target.value)
            }, [...e[39] || (e[39] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, es),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          k.value === "agentic" ? (l(), r("label", ts, [
            e[42] || (e[42] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: P.value ?? "",
              onInput: e[10] || (e[10] = (n) => P.value = Number(n.target.value) || null)
            }, null, 40, ss),
            e[43] || (e[43] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : m("", !0)
        ]),
        k.value === "agentic" ? (l(), r("div", ns, [
          e[44] || (e[44] = s("span", { class: "cx-label" }, [
            h("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: z.value ? JSON.stringify([z.value]) : "[]",
            onChange: qe
          }, null, 40, as),
          e[45] || (e[45] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : m("", !0),
        k.value !== "agentic" ? (l(), r("label", ls, [
          w(X, {
            modelValue: p.value,
            "onUpdate:modelValue": e[11] || (e[11] = (n) => p.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[46] || (e[46] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : m("", !0),
        s("label", rs, [
          e[47] || (e[47] = s("span", { class: "cx-label" }, [
            h("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: O.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[12] || (e[12] = (n) => O.value = n.target.value)
          }, null, 40, os),
          e[48] || (e[48] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Te.value ? (l(), r("div", is, [
        s("div", us, [
          w(S(Q), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[50] || (e[50] = s("span", null, "Maintenance", -1))
        ]),
        s("p", ds, [
          e[51] || (e[51] = h(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), r(H, { key: 0 }, [
            h("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : m("", !0)
        ]),
        S(pe) ? (l(), r("p", cs, f(S(pe)), 1)) : m("", !0),
        s("div", ms, [
          w(Ee, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: S(ge)("resummarize"),
            onClick: e[13] || (e[13] = (n) => ye("resummarize"))
          }, {
            default: ke(() => [...e[52] || (e[52] = [
              h("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          w(Ee, {
            variant: "soft",
            small: "",
            disabled: te.value,
            loading: S(ge)("reembed"),
            onClick: e[14] || (e[14] = (n) => ye("reembed"))
          }, {
            default: ke(() => [...e[53] || (e[53] = [
              h("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        se.value.text ? (l(), r("p", {
          key: 1,
          class: J(["cx-maint-status", se.value.tone])
        }, [
          e[54] || (e[54] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          h(f(se.value.text), 1)
        ], 2)) : m("", !0),
        ne.value.text ? (l(), r("p", {
          key: 2,
          class: J(["cx-maint-status", ne.value.tone])
        }, [
          e[55] || (e[55] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          h(f(ne.value.text), 1)
        ], 2)) : m("", !0)
      ])) : m("", !0)
    ]));
  }
});
export {
  xs as default
};
//# sourceMappingURL=KbCreateConfig-DmYBc7nB.js.map
