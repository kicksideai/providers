import { defineComponent as Ve, openBlock as l, createElementBlock as u, normalizeClass as Q, createElementVNode as s, ref as d, computed as o, watch as ue, onUnmounted as Te, onMounted as He, createVNode as w, unref as S, toDisplayString as y, Fragment as j, renderList as he, createCommentVNode as c, createTextVNode as h, createBlock as Qe, withDirectives as Ke, vModelText as Xe, withCtx as _e } from "vue";
import { Icon as T } from "@iconify/vue";
import { api as ke, host as Ge, loadByTagName as we } from "@wippy-fe/proxy";
import { a as Je, u as We } from "./wc-runtime-f54Bo-yJ.js";
import { D as Y, _ as Se, a as Ye, r as Ze } from "./queryMode-D9gMlIJK.js";
const et = ["disabled", "aria-checked"], H = /* @__PURE__ */ Ve({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(m, { emit: p }) {
    const C = p;
    return (g, v) => (l(), u("button", {
      type: "button",
      class: Q(["cx-switch", { on: m.modelValue }]),
      disabled: m.disabled,
      role: "switch",
      "aria-checked": m.modelValue,
      onClick: v[0] || (v[0] = ($) => C("update:modelValue", !m.modelValue))
    }, [...v[1] || (v[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, et));
  }
}), tt = 24, st = 60;
function Ce(m, p) {
  return m.trim().length <= tt && (p || "").trim().length <= st;
}
const Ee = 3e3, nt = 3e4, at = { resummarize: "documents", reembed: "nodes" };
function Me(m, p) {
  return m?.response?.data?.error || m?.message || p;
}
function Ae(m) {
  Ge.handleError(m?.response?.status === 401 ? "auth-expired" : "other", m);
}
function lt(m) {
  const p = d({ resummarize: null, reembed: null }), C = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), v = d("");
  function $(a) {
    return C.value[a] || p.value[a]?.in_flight === !0;
  }
  const P = o(() => $("resummarize") || $("reembed"));
  let I = !1, E = 0, k = null;
  function f(a) {
    return !I && a === E;
  }
  function _() {
    k !== null && (clearTimeout(k), k = null);
  }
  function L(a, b) {
    _(), f(a) && (k = setTimeout(() => {
      A(a, b);
    }, b));
  }
  async function A(a, b = Ee) {
    _();
    const r = m();
    if (!(!r || !f(a))) {
      try {
        const { data: i } = await ke.get(`/api/v1/kb10/${r}/maintenance`);
        if (!f(a)) return;
        if (!i?.success) throw new Error(i?.error || "could not read maintenance status");
        p.value = {
          resummarize: i.resummarize ?? null,
          reembed: i.reembed ?? null
        }, v.value = "";
      } catch (i) {
        if (!f(a)) return;
        v.value = Me(i, "could not read maintenance status"), Ae(i), L(a, Math.min(b * 2, nt));
        return;
      }
      P.value && L(a, Ee);
    }
  }
  function q() {
    const a = ++E;
    _(), p.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, v.value = "", m() && A(a);
  }
  async function z(a) {
    const b = m();
    if (!b || P.value) return;
    const r = E;
    C.value = { ...C.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: i } = await ke.post(`/api/v1/kb10/${b}/${a}`);
      if (!f(r)) return;
      if (!i?.success) throw new Error(i?.error || "could not start the run");
      i.run && (p.value = { ...p.value, [a]: i.run });
    } catch (i) {
      if (!f(r)) return;
      g.value = { ...g.value, [a]: Me(i, "could not start the run") }, Ae(i);
      return;
    } finally {
      f(r) && (C.value = { ...C.value, [a]: !1 });
    }
    A(r);
  }
  function N(a) {
    const b = g.value[a];
    if (b) return { text: b, tone: "err" };
    if (C.value[a]) return { text: "Starting…", tone: "" };
    const r = p.value[a];
    return r ? r.in_flight ? r.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : r.total > 0 ? { text: `${r.scanned} of ${r.total} ${at[a]}…`, tone: "" } : { text: "Running…", tone: "" } : r.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : r.status === "failed" ? { text: r.last_error || "The run failed.", tone: "err" } : r.status === "succeeded" ? a === "reembed" ? { text: `${r.embedded} vectors re-embedded, ${r.scanned} scanned`, tone: "ok" } : {
      text: `${r.resummarized} summaries regenerated, ${r.chunks_reenriched} chunks re-situated, ${r.documents_skipped} documents skipped, ${r.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return ue(m, q, { immediate: !0 }), Te(() => {
    I = !0, _();
  }), { runs: p, statusError: v, running: $, anyBusy: P, start: z, statusLine: N };
}
const ut = { class: "cx" }, rt = { class: "cx-group" }, ot = { class: "cx-group-h" }, it = { class: "cx-field" }, dt = {
  key: 0,
  class: "cx-fixed"
}, ct = { class: "cx-fixed-v" }, mt = ["value"], vt = {
  key: 0,
  class: "cx-row"
}, pt = { class: "cx-label" }, gt = ["type", "min", "max", "step", "value", "onInput"], ft = {
  key: 0,
  class: "st-hint"
}, bt = { class: "cx-label" }, yt = ["value", "onInput"], xt = {
  key: 0,
  class: "st-hint"
}, ht = { class: "cx-sub" }, _t = { class: "cx-sub-h" }, kt = { class: "cx-sub-t" }, wt = { class: "st-hint" }, St = {
  key: 1,
  class: "cx-req"
}, Ct = { class: "cx-row" }, Et = { class: "cx-field" }, Mt = ["value"], At = { class: "cx-field" }, Vt = ["value"], qt = {
  key: 0,
  class: "cx-field"
}, Nt = { class: "cx-label" }, $t = ["value"], Lt = {
  key: 0,
  class: "st-hint"
}, Rt = {
  key: 1,
  class: "cx-row"
}, It = { class: "cx-label" }, zt = ["min", "max", "placeholder", "value"], Bt = {
  key: 0,
  class: "cx-err"
}, Pt = {
  key: 1,
  class: "st-hint"
}, Ft = {
  key: 1,
  class: "cx-hint"
}, Ot = { class: "cx-sub" }, Dt = { class: "cx-sub-h" }, Ut = {
  key: 0,
  class: "cx-field"
}, jt = ["value"], Tt = { class: "cx-group" }, Ht = { class: "cx-group-h" }, Qt = { class: "cx-field" }, Kt = ["value"], Xt = { class: "cx-toggle" }, Gt = { class: "cx-toggle" }, Jt = {
  key: 0,
  class: "st-hint"
}, Wt = {
  key: 1,
  class: "cx-err"
}, Yt = {
  key: 2,
  class: "cx-field"
}, Zt = { class: "cx-row" }, es = { class: "cx-field" }, ts = ["value"], ss = {
  key: 0,
  class: "cx-field"
}, ns = ["value"], as = {
  key: 3,
  class: "cx-field"
}, ls = ["selected"], us = {
  key: 4,
  class: "cx-toggle"
}, rs = { class: "cx-field" }, os = ["value"], is = {
  key: 0,
  class: "cx-group"
}, ds = { class: "cx-group-h" }, cs = { class: "cx-lead" }, ms = {
  key: 0,
  class: "cx-err"
}, vs = { class: "cx-maint-row" }, ps = "class:embed", hs = /* @__PURE__ */ Ve({
  __name: "KbCreateConfig",
  setup(m) {
    const p = Je(), C = We(), g = o(() => p.value.config || {}), v = o(() => !!g.value.edit), $ = o(() => v.value && g.value.id || ""), P = o(() => g.value.kb_type || ""), I = o(() => P.value !== "document"), E = d(""), k = d(!0), f = d(""), _ = d(""), L = d(""), A = d(""), q = d(!1), z = d(Y), N = d({}), a = d(""), b = d(!1), r = d(!1), i = d(!1), K = d(25), Z = o(() => g.value.config?.tuning), X = d(""), F = d(null), V = d("built-in"), B = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      B.value = n[0] || "";
    }
    const G = o(() => {
      const e = g.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, x]) => ({ key: n, ...x })).sort((n, x) => (n.order ?? 100) - (x.order ?? 100) || n.key.localeCompare(x.key)) : [];
    }), Ne = [
      "summary_model",
      "chunk_enrichment_model",
      "summary_prompt",
      "summary_max_chars",
      "analysis_model",
      "query_strategy",
      "self_tuning",
      "self_tuning_query_interval",
      "enable_reranking",
      "extra_prompt"
    ], ee = o(() => G.value.filter((t) => !Ne.includes(t.key)));
    function R(t, e) {
      const n = G.value.find((x) => x.key === t)?.default;
      return Ze(e, typeof n == "string" ? n : Y);
    }
    const $e = o(() => ee.value.filter((t) => t.format === "textarea")), re = o(() => ee.value.filter((t) => t.format !== "textarea")), O = o(() => G.value.find((t) => t.key === "summary_prompt")), M = o(() => G.value.find((t) => t.key === "summary_max_chars")), Le = o(() => {
      const t = M.value;
      return t ? `${t.label || t.key} characters` : "";
    }), J = o(() => M.value?.minimum ?? 0), te = o(() => M.value?.maximum), Re = o(() => {
      const t = M.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), se = o(() => {
      const t = A.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = te.value;
      return e < J.value || n !== void 0 && e > n ? null : e;
    }), oe = o(() => {
      if (A.value.trim() === "" || se.value !== null) return "";
      const e = te.value;
      return e === void 0 ? `Summary length must be a whole number of ${J.value} characters or more.` : `Summary length must be a whole number between ${J.value} and ${e} characters.`;
    });
    function Ie() {
      const t = g.value.config || {};
      E.value = g.value.embedding_model || ps, f.value = R("summary_model", t.summary_model), _.value = R("chunk_enrichment_model", t.chunk_enrichment_model), k.value = I.value || !!(f.value || _.value), L.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", A.value = v.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", q.value = t.embed_images === !0, z.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : Y;
      const e = {};
      for (const x of ee.value) {
        const xe = t[x.key];
        e[x.key] = xe !== void 0 ? xe : x.default;
      }
      N.value = e, a.value = R("analysis_model", t.analysis_model), b.value = t.enable_reranking === !0, r.value = t.query_strategy === "hyde", i.value = t.self_tuning === !0, K.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, X.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const n = Number(t.max_retrieval_iterations);
      F.value = Number.isFinite(n) && n > 0 ? n : null, V.value = t.query_driver === "agentic" ? "agentic" : "built-in", B.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ze() {
      const t = { ...N.value };
      return t.summary_model = k.value && (f.value || !1), t.chunk_enrichment_model = k.value && (_.value || !1), t.summary_prompt = L.value.trim(), se.value !== null && (t.summary_max_chars = se.value), t.embed_images = q.value, (v.value || q.value) && (t.image_caption_model = z.value || Y), Ye(t, a.value), t.query_strategy = r.value ? "hyde" : "plain", t.self_tuning = i.value, (v.value || i.value) && (t.self_tuning_query_interval = K.value), t.enable_reranking = b.value, t.extra_prompt = X.value.trim(), (v.value || V.value === "agentic") && F.value && (t.max_retrieval_iterations = F.value), t.query_driver = V.value, (v.value || V.value === "agentic" && B.value) && (t.query_agent = B.value), t;
    }
    function D(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Be(t) {
      E.value = D(t);
    }
    function Pe(t) {
      f.value = R("summary_model", D(t));
    }
    function Fe(t) {
      _.value = R("chunk_enrichment_model", D(t));
    }
    function Oe(t) {
      t && !f.value && !_.value && (f.value = R("summary_model", void 0), _.value = R("chunk_enrichment_model", void 0)), k.value = t;
    }
    function ie(t, e) {
      if (t.type === "integer") {
        const n = Number.parseInt(e, 10);
        N.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else if (t.type === "number") {
        const n = Number.parseFloat(e);
        N.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else
        N.value[t.key] = e;
    }
    function de(t) {
      const e = N.value[t];
      return e == null ? "" : String(e);
    }
    const U = o(ze), W = d({}), ce = o(() => Object.fromEntries(Object.entries(U.value).filter(
      ([t, e]) => !Object.is(e, W.value[t])
    ))), me = o(() => Object.keys(ce.value).length > 0 || Object.keys(W.value).some((t) => !(t in U.value)));
    function ve() {
      C("config-changed", { embedding_model: E.value, config: v.value ? ce.value : U.value });
    }
    const {
      statusError: pe,
      running: ge,
      anyBusy: De,
      start: Ue,
      statusLine: fe
    } = lt(() => $.value), je = o(() => !!$.value), ne = o(() => De.value || me.value), ae = o(() => fe("resummarize")), le = o(() => fe("reembed"));
    function be(t) {
      ne.value || Ue(t);
    }
    function ye() {
      Ie(), W.value = U.value, ve();
    }
    return ue(() => p.value.config, ye), ue([E, U], ve), He(() => {
      we("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), we("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), ye();
    }), (t, e) => (l(), u("div", ut, [
      s("div", rt, [
        s("div", ot, [
          w(S(T), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", it, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          v.value ? (l(), u("div", dt, [
            w(S(T), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", ct, y(E.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), u("wc-model-picker", {
            key: 1,
            value: E.value,
            capability: "embed",
            onSelect: Be
          }, null, 40, mt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        re.value.length ? (l(), u("div", vt, [
          (l(!0), u(j, null, he(re.value, (n) => (l(), u("label", {
            key: n.key,
            class: Q(["cx-field", { "cx-span": !S(Ce)(n.label || n.key, n.description) }])
          }, [
            s("span", pt, y(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: de(n.key),
              onInput: (x) => ie(n, x.target.value)
            }, null, 40, gt),
            n.description ? (l(), u("p", ft, y(n.description), 1)) : c("", !0)
          ], 2))), 128))
        ])) : c("", !0),
        (l(!0), u(j, null, he($e.value, (n) => (l(), u("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", bt, y(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(de(n.key) ?? ""),
            onInput: (x) => ie(n, x.target.value)
          }, null, 40, yt),
          n.description ? (l(), u("p", xt, y(n.description), 1)) : c("", !0)
        ]))), 128)),
        s("div", ht, [
          s("div", _t, [
            s("span", kt, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", wt, [
                e[18] || (e[18] = h(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                I.value ? (l(), u(j, { key: 0 }, [
                  h(" Required — the concept graph is built from these models.")
                ], 64)) : c("", !0)
              ])
            ]),
            I.value ? (l(), u("span", St, "Required")) : (l(), Qe(H, {
              key: 0,
              "model-value": k.value,
              "onUpdate:modelValue": Oe,
              "aria-label": "Contextual embedding"
            }, null, 8, ["model-value"]))
          ]),
          k.value ? (l(), u(j, { key: 0 }, [
            s("div", Ct, [
              s("div", Et, [
                e[20] || (e[20] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: f.value,
                  capability: "generate",
                  onSelect: Pe
                }, null, 40, Mt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", At, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: _.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, Vt),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            O.value ? (l(), u("label", qt, [
              s("span", Nt, [
                h(y(O.value.label || O.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: L.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => L.value = n.target.value)
              }, null, 40, $t),
              O.value.description ? (l(), u("p", Lt, y(O.value.description), 1)) : c("", !0)
            ])) : c("", !0),
            M.value ? (l(), u("div", Rt, [
              s("label", {
                class: Q(["cx-field", { "cx-span": !S(Ce)(Le.value, M.value.description) }])
              }, [
                s("span", It, [
                  h(y(M.value.label || M.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: J.value,
                  max: te.value,
                  placeholder: Re.value,
                  value: A.value,
                  onInput: e[1] || (e[1] = (n) => A.value = n.target.value)
                }, null, 40, zt),
                oe.value ? (l(), u("p", Bt, y(oe.value), 1)) : M.value.description ? (l(), u("p", Pt, y(M.value.description), 1)) : c("", !0)
              ], 2)
            ])) : c("", !0)
          ], 64)) : (l(), u("p", Ft, [
            w(S(T), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[26] || (e[26] = h("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Ot, [
          s("div", Dt, [
            e[27] || (e[27] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            w(H, {
              modelValue: q.value,
              "onUpdate:modelValue": e[2] || (e[2] = (n) => q.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          q.value ? (l(), u("div", Ut, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: z.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => z.value = D(n))
            }, null, 40, jt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : c("", !0)
        ])
      ]),
      s("div", Tt, [
        s("div", Ht, [
          w(S(T), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Ask", -1))
        ]),
        e[48] || (e[48] = s("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        s("div", Qt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Answer model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => a.value = D(n))
          }, null, 40, Kt),
          e[33] || (e[33] = s("p", { class: "st-hint" }, "Reads the retrieved passages and writes the answer. Leave empty to return passages only — plain vector search, no generated answer.", -1))
        ]),
        s("label", Xt, [
          w(H, {
            modelValue: r.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => r.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        s("label", Gt, [
          w(H, {
            modelValue: i.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => i.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[35] || (e[35] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (l(), u("p", Jt, "Last tuning: " + y(Z.value.applied_at) + ". " + y(Z.value.rationale), 1)) : c("", !0),
        (r.value || i.value) && !a.value ? (l(), u("p", Wt, "Select an answer model for retrieval optimization.")) : c("", !0),
        i.value ? (l(), u("label", Yt, [
          e[36] || (e[36] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Ke(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[7] || (e[7] = (n) => K.value = n)
          }, null, 512), [
            [
              Xe,
              K.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[37] || (e[37] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : c("", !0),
        s("div", Zt, [
          s("label", es, [
            e[39] || (e[39] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: V.value,
              onChange: e[8] || (e[8] = (n) => V.value = n.target.value)
            }, [...e[38] || (e[38] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, ts),
            e[40] || (e[40] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          V.value === "agentic" ? (l(), u("label", ss, [
            e[41] || (e[41] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: F.value ?? "",
              onInput: e[9] || (e[9] = (n) => F.value = Number(n.target.value) || null)
            }, null, 40, ns),
            e[42] || (e[42] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : c("", !0)
        ]),
        V.value === "agentic" ? (l(), u("div", as, [
          e[43] || (e[43] = s("span", { class: "cx-label" }, [
            h("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: B.value ? JSON.stringify([B.value]) : "[]",
            onChange: qe
          }, null, 40, ls),
          e[44] || (e[44] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : c("", !0),
        V.value !== "agentic" ? (l(), u("label", us, [
          w(H, {
            modelValue: b.value,
            "onUpdate:modelValue": e[10] || (e[10] = (n) => b.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[45] || (e[45] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : c("", !0),
        s("label", rs, [
          e[46] || (e[46] = s("span", { class: "cx-label" }, [
            h("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: X.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[11] || (e[11] = (n) => X.value = n.target.value)
          }, null, 40, os),
          e[47] || (e[47] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      je.value ? (l(), u("div", is, [
        s("div", ds, [
          w(S(T), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[49] || (e[49] = s("span", null, "Maintenance", -1))
        ]),
        s("p", cs, [
          e[50] || (e[50] = h(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          me.value ? (l(), u(j, { key: 0 }, [
            h("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : c("", !0)
        ]),
        S(pe) ? (l(), u("p", ms, y(S(pe)), 1)) : c("", !0),
        s("div", vs, [
          w(Se, {
            variant: "soft",
            small: "",
            disabled: ne.value || !W.value.summary_model,
            loading: S(ge)("resummarize"),
            onClick: e[12] || (e[12] = (n) => be("resummarize"))
          }, {
            default: _e(() => [...e[51] || (e[51] = [
              h("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          w(Se, {
            variant: "soft",
            small: "",
            disabled: ne.value,
            loading: S(ge)("reembed"),
            onClick: e[13] || (e[13] = (n) => be("reembed"))
          }, {
            default: _e(() => [...e[52] || (e[52] = [
              h("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        ae.value.text ? (l(), u("p", {
          key: 1,
          class: Q(["cx-maint-status", ae.value.tone])
        }, [
          e[53] || (e[53] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          h(y(ae.value.text), 1)
        ], 2)) : c("", !0),
        le.value.text ? (l(), u("p", {
          key: 2,
          class: Q(["cx-maint-status", le.value.tone])
        }, [
          e[54] || (e[54] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          h(y(le.value.text), 1)
        ], 2)) : c("", !0)
      ])) : c("", !0)
    ]));
  }
});
export {
  hs as default
};
//# sourceMappingURL=KbCreateConfig-DdQS0DYc.js.map
