import { defineComponent as Ie, openBlock as a, createElementBlock as o, normalizeClass as H, createElementVNode as s, ref as d, computed as i, watch as ue, onUnmounted as Je, onMounted as We, createVNode as k, unref as w, toDisplayString as g, Fragment as U, renderList as Se, createCommentVNode as m, createTextVNode as h, createBlock as Ye, withDirectives as Ge, vModelText as Ze, withCtx as Ce } from "vue";
import { Icon as j } from "@iconify/vue";
import { api as Ee, host as et, loadByTagName as Me } from "@wippy-fe/proxy";
import { u as tt, a as st } from "./wc-runtime-CuuaQDIp.js";
import { _ as Ae } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const nt = ["disabled", "aria-checked"], T = /* @__PURE__ */ Ie({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(u, { emit: v }) {
    const S = v;
    return (p, y) => (a(), o("button", {
      type: "button",
      class: H(["cx-switch", { on: u.modelValue }]),
      disabled: u.disabled,
      role: "switch",
      "aria-checked": u.modelValue,
      onClick: y[0] || (y[0] = (N) => S("update:modelValue", !u.modelValue))
    }, [...y[1] || (y[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, nt));
  }
}), Q = "class:fast";
function Ve(u, v = Q) {
  return u == null || u === "" ? v : typeof u == "string" && u.trim() ? u : "";
}
const at = 24, lt = 60;
function Ne(u, v) {
  return u.trim().length <= at && (v || "").trim().length <= lt;
}
const $e = 3e3, ot = 3e4, rt = { resummarize: "documents", reembed: "nodes" };
function qe(u, v) {
  return u?.response?.data?.error || u?.message || v;
}
function Le(u) {
  et.handleError(u?.response?.status === 401 ? "auth-expired" : "other", u);
}
function it(u) {
  const v = d({ resummarize: null, reembed: null }), S = d({ resummarize: !1, reembed: !1 }), p = d({ resummarize: "", reembed: "" }), y = d("");
  function N(l) {
    return S.value[l] || v.value[l]?.in_flight === !0;
  }
  const P = i(() => N("resummarize") || N("reembed"));
  let I = !1, C = 0, _ = null;
  function x(l) {
    return !I && l === C;
  }
  function E() {
    _ !== null && (clearTimeout(_), _ = null);
  }
  function $(l, f) {
    E(), x(l) && (_ = setTimeout(() => {
      A(l, f);
    }, f));
  }
  async function A(l, f = $e) {
    E();
    const r = u();
    if (!(!r || !x(l))) {
      try {
        const { data: c } = await Ee.get(`/api/v1/kb10/${r}/maintenance`);
        if (!x(l)) return;
        if (!c?.success) throw new Error(c?.error || "could not read maintenance status");
        v.value = {
          resummarize: c.resummarize ?? null,
          reembed: c.reembed ?? null
        }, y.value = "";
      } catch (c) {
        if (!x(l)) return;
        y.value = qe(c, "could not read maintenance status"), Le(c), $(l, Math.min(f * 2, ot));
        return;
      }
      P.value && $(l, $e);
    }
  }
  function q() {
    const l = ++C;
    E(), v.value = { resummarize: null, reembed: null }, p.value = { resummarize: "", reembed: "" }, y.value = "", u() && A(l);
  }
  async function R(l) {
    const f = u();
    if (!f || P.value) return;
    const r = C;
    S.value = { ...S.value, [l]: !0 }, p.value = { ...p.value, [l]: "" };
    try {
      const { data: c } = await Ee.post(`/api/v1/kb10/${f}/${l}`);
      if (!x(r)) return;
      if (!c?.success) throw new Error(c?.error || "could not start the run");
      c.run && (v.value = { ...v.value, [l]: c.run });
    } catch (c) {
      if (!x(r)) return;
      p.value = { ...p.value, [l]: qe(c, "could not start the run") }, Le(c);
      return;
    } finally {
      x(r) && (S.value = { ...S.value, [l]: !1 });
    }
    A(r);
  }
  function V(l) {
    const f = p.value[l];
    if (f) return { text: f, tone: "err" };
    if (S.value[l]) return { text: "Starting…", tone: "" };
    const r = v.value[l];
    return r ? r.in_flight ? r.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : r.total > 0 ? { text: `${r.scanned} of ${r.total} ${rt[l]}…`, tone: "" } : { text: "Running…", tone: "" } : r.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : r.status === "failed" ? { text: r.last_error || "The run failed.", tone: "err" } : r.status === "succeeded" ? l === "reembed" ? { text: `${r.embedded} vectors re-embedded, ${r.scanned} scanned`, tone: "ok" } : {
      text: `${r.resummarized} summaries regenerated, ${r.chunks_reenriched} chunks re-situated, ${r.documents_skipped} documents skipped, ${r.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return ue(u, q, { immediate: !0 }), Je(() => {
    I = !0, E();
  }), { runs: v, statusError: y, running: N, anyBusy: P, start: R, statusLine: V };
}
const ut = { class: "cx" }, dt = { class: "cx-group" }, ct = { class: "cx-group-h" }, mt = { class: "cx-field" }, vt = {
  key: 0,
  class: "cx-fixed"
}, pt = { class: "cx-fixed-v" }, gt = ["value"], ft = {
  key: 0,
  class: "cx-row"
}, bt = { class: "cx-label" }, yt = ["type", "min", "max", "step", "value", "onInput"], xt = {
  key: 0,
  class: "st-hint"
}, ht = { class: "cx-label" }, _t = ["value", "onInput"], kt = {
  key: 0,
  class: "st-hint"
}, wt = { class: "cx-sub" }, St = { class: "cx-sub-h" }, Ct = { class: "cx-sub-t" }, Et = { class: "st-hint" }, Mt = {
  key: 1,
  class: "cx-req"
}, At = { class: "cx-row" }, Vt = { class: "cx-field" }, Nt = ["value"], $t = { class: "cx-field" }, qt = ["value"], Lt = {
  key: 0,
  class: "cx-field"
}, It = { class: "cx-label" }, Rt = ["value"], Bt = {
  key: 0,
  class: "st-hint"
}, Pt = {
  key: 1,
  class: "cx-row"
}, zt = { class: "cx-label" }, Ft = ["min", "max", "placeholder", "value"], Dt = {
  key: 0,
  class: "cx-err"
}, Ot = {
  key: 1,
  class: "st-hint"
}, Ut = {
  key: 1,
  class: "cx-hint"
}, jt = { class: "cx-sub" }, Tt = { class: "cx-sub-h" }, Ht = {
  key: 0,
  class: "cx-field"
}, Qt = ["value"], Kt = { class: "cx-group" }, Xt = { class: "cx-group-h" }, Jt = { class: "cx-field" }, Wt = ["value"], Yt = {
  key: 0,
  class: "st-hint"
}, Gt = {
  key: 1,
  class: "st-hint"
}, Zt = { class: "cx-toggle" }, es = { class: "cx-toggle" }, ts = {
  key: 0,
  class: "st-hint"
}, ss = {
  key: 1,
  class: "st-hint"
}, ns = {
  key: 2,
  class: "cx-field"
}, as = { class: "cx-row" }, ls = { class: "cx-field" }, os = ["value"], rs = {
  key: 0,
  class: "cx-field"
}, is = ["value"], us = {
  key: 3,
  class: "cx-field"
}, ds = ["selected"], cs = {
  key: 4,
  class: "cx-toggle"
}, ms = { class: "cx-field" }, vs = ["value"], ps = {
  key: 0,
  class: "cx-group"
}, gs = { class: "cx-group-h" }, fs = { class: "cx-lead" }, bs = {
  key: 0,
  class: "cx-err"
}, ys = { class: "cx-maint-row" }, xs = "class:embed", Cs = /* @__PURE__ */ Ie({
  __name: "KbCreateConfig",
  setup(u) {
    const v = tt(), S = st(), p = i(() => v.value.config || {}), y = i(() => !!p.value.edit), N = i(() => y.value && p.value.id || ""), P = i(() => p.value.kb_type || ""), I = i(() => P.value !== "document"), C = d(""), _ = d(!0), x = d(), E = d(), $ = d(""), A = d(""), q = d(!1), R = d(Q), V = d({}), l = d(), f = i(() => Ve(l.value, "")), r = d(!1), c = d(!1), B = d(!1), K = d(25), Z = i(() => p.value.config?.tuning), X = d(""), z = d(null), L = d("built-in"), F = d("");
    function Re(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      F.value = n[0] || "";
    }
    const J = i(() => {
      const e = p.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, b]) => ({ key: n, ...b })).sort((n, b) => (n.order ?? 100) - (b.order ?? 100) || n.key.localeCompare(b.key)) : [];
    }), Be = [
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
    ], ee = i(() => J.value.filter((t) => !Be.includes(t.key)));
    function de(t, e) {
      const n = J.value.find((b) => b.key === t)?.default;
      return Ve(e, typeof n == "string" ? n : Q);
    }
    const te = i(() => de("summary_model", x.value)), se = i(() => de("chunk_enrichment_model", E.value));
    function ne(t) {
      if (typeof t == "string" || t === !1) return t;
    }
    const Pe = i(() => ee.value.filter((t) => t.format === "textarea")), ce = i(() => ee.value.filter((t) => t.format !== "textarea")), D = i(() => J.value.find((t) => t.key === "summary_prompt")), M = i(() => J.value.find((t) => t.key === "summary_max_chars")), ze = i(() => {
      const t = M.value;
      return t ? `${t.label || t.key} characters` : "";
    }), W = i(() => M.value?.minimum ?? 0), ae = i(() => M.value?.maximum), Fe = i(() => {
      const t = M.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), le = i(() => {
      const t = A.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = ae.value;
      return e < W.value || n !== void 0 && e > n ? null : e;
    }), me = i(() => {
      if (A.value.trim() === "" || le.value !== null) return "";
      const e = ae.value;
      return e === void 0 ? `Summary length must be a whole number of ${W.value} characters or more.` : `Summary length must be a whole number between ${W.value} and ${e} characters.`;
    });
    function De() {
      const t = p.value.config || {};
      C.value = p.value.embedding_model || xs, x.value = ne(t.summary_model), E.value = ne(t.chunk_enrichment_model), _.value = I.value || !!(te.value || se.value), $.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", A.value = y.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", q.value = t.embed_images === !0, R.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : Q;
      const e = {};
      for (const b of ee.value) {
        const we = t[b.key];
        e[b.key] = we !== void 0 ? we : b.default;
      }
      V.value = e, l.value = ne(t.analysis_model), r.value = t.enable_reranking === !0, c.value = t.query_strategy === "hyde", B.value = t.self_tuning === !0, K.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, X.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const n = Number(t.max_retrieval_iterations);
      z.value = Number.isFinite(n) && n > 0 ? n : null, L.value = t.query_driver === "agentic" ? "agentic" : "built-in", F.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function Oe() {
      const t = { ...V.value };
      return t.summary_model = _.value ? x.value : !1, t.chunk_enrichment_model = _.value ? E.value : !1, t.summary_prompt = $.value.trim(), le.value !== null && (t.summary_max_chars = le.value), t.embed_images = q.value, t.image_caption_model = R.value || Q, t.analysis_model = l.value, t.query_strategy = c.value ? "hyde" : "plain", t.self_tuning = B.value, t.self_tuning_query_interval = K.value, t.enable_reranking = r.value, t.extra_prompt = X.value.trim(), z.value && (t.max_retrieval_iterations = z.value), t.query_driver = L.value, t.query_agent = F.value, t;
    }
    function O(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Ue(t) {
      C.value = O(t);
    }
    function je(t) {
      x.value = O(t);
    }
    function Te(t) {
      E.value = O(t);
    }
    function He(t) {
      t && !te.value && !se.value && (x.value = "", E.value = ""), _.value = t;
    }
    function ve(t, e) {
      if (t.type === "integer") {
        const n = Number.parseInt(e, 10);
        V.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else if (t.type === "number") {
        const n = Number.parseFloat(e);
        V.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else
        V.value[t.key] = e;
    }
    function pe(t) {
      const e = V.value[t];
      return e == null ? "" : String(e);
    }
    const Y = i(Oe), G = d({}), ge = i(() => Object.fromEntries(Object.entries(Y.value).filter(
      ([t, e]) => e !== void 0 && !Object.is(e, G.value[t])
    ))), fe = i(() => Object.keys(ge.value).length > 0 || Object.keys(G.value).some((t) => !(t in Y.value)));
    function be() {
      S("config-changed", { embedding_model: C.value, config: ge.value });
    }
    const {
      statusError: ye,
      running: xe,
      anyBusy: Qe,
      start: Ke,
      statusLine: he
    } = it(() => N.value), Xe = i(() => !!N.value), oe = i(() => Qe.value || fe.value), re = i(() => he("resummarize")), ie = i(() => he("reembed"));
    function _e(t) {
      oe.value || Ke(t);
    }
    function ke() {
      De(), G.value = Y.value, be();
    }
    return ue(() => v.value.config, ke), ue([C, Y], be), We(() => {
      Me("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Me("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), ke();
    }), (t, e) => (a(), o("div", ut, [
      s("div", dt, [
        s("div", ct, [
          k(w(j), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", mt, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          y.value ? (a(), o("div", vt, [
            k(w(j), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", pt, g(C.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (a(), o("wc-model-picker", {
            key: 1,
            value: C.value,
            capability: "embed",
            onSelect: Ue
          }, null, 40, gt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        ce.value.length ? (a(), o("div", ft, [
          (a(!0), o(U, null, Se(ce.value, (n) => (a(), o("label", {
            key: n.key,
            class: H(["cx-field", { "cx-span": !w(Ne)(n.label || n.key, n.description) }])
          }, [
            s("span", bt, g(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: pe(n.key),
              onInput: (b) => ve(n, b.target.value)
            }, null, 40, yt),
            n.description ? (a(), o("p", xt, g(n.description), 1)) : m("", !0)
          ], 2))), 128))
        ])) : m("", !0),
        (a(!0), o(U, null, Se(Pe.value, (n) => (a(), o("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", ht, g(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(pe(n.key) ?? ""),
            onInput: (b) => ve(n, b.target.value)
          }, null, 40, _t),
          n.description ? (a(), o("p", kt, g(n.description), 1)) : m("", !0)
        ]))), 128)),
        s("div", wt, [
          s("div", St, [
            s("span", Ct, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", Et, [
                e[18] || (e[18] = h(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                I.value ? (a(), o(U, { key: 0 }, [
                  h(" Required — the concept graph is built from these models.")
                ], 64)) : m("", !0)
              ])
            ]),
            I.value ? (a(), o("span", Mt, "Required")) : (a(), Ye(T, {
              key: 0,
              "model-value": _.value,
              "onUpdate:modelValue": He,
              "aria-label": "Contextual embedding"
            }, null, 8, ["model-value"]))
          ]),
          _.value ? (a(), o(U, { key: 0 }, [
            s("div", At, [
              s("div", Vt, [
                e[20] || (e[20] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: te.value,
                  capability: "generate",
                  onSelect: je
                }, null, 40, Nt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", $t, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: se.value,
                  capability: "generate",
                  onSelect: Te
                }, null, 40, qt),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            D.value ? (a(), o("label", Lt, [
              s("span", It, [
                h(g(D.value.label || D.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: $.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => $.value = n.target.value)
              }, null, 40, Rt),
              D.value.description ? (a(), o("p", Bt, g(D.value.description), 1)) : m("", !0)
            ])) : m("", !0),
            M.value ? (a(), o("div", Pt, [
              s("label", {
                class: H(["cx-field", { "cx-span": !w(Ne)(ze.value, M.value.description) }])
              }, [
                s("span", zt, [
                  h(g(M.value.label || M.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: W.value,
                  max: ae.value,
                  placeholder: Fe.value,
                  value: A.value,
                  onInput: e[1] || (e[1] = (n) => A.value = n.target.value)
                }, null, 40, Ft),
                me.value ? (a(), o("p", Dt, g(me.value), 1)) : M.value.description ? (a(), o("p", Ot, g(M.value.description), 1)) : m("", !0)
              ], 2)
            ])) : m("", !0)
          ], 64)) : (a(), o("p", Ut, [
            k(w(j), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[26] || (e[26] = h("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", jt, [
          s("div", Tt, [
            e[27] || (e[27] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            k(T, {
              modelValue: q.value,
              "onUpdate:modelValue": e[2] || (e[2] = (n) => q.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          q.value ? (a(), o("div", Ht, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: R.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => R.value = O(n))
            }, null, 40, Qt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : m("", !0)
        ])
      ]),
      s("div", Kt, [
        s("div", Xt, [
          k(w(j), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Search and Ask", -1))
        ]),
        s("div", Jt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Search analysis model", -1)),
          s("wc-model-picker", {
            value: f.value,
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => l.value = O(n).trim() || !1)
          }, null, 40, Wt),
          l.value === !1 ? (a(), o("p", Yt, "Answers are disabled. Ask returns matching passages.")) : f.value ? m("", !0) : (a(), o("p", Gt, "Search returns direct matches. Ask uses Fast when available."))
        ]),
        s("label", Zt, [
          k(T, {
            modelValue: c.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => c.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[33] || (e[33] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Uses the Search analysis model to generate a short hypothetical answer before embedding each question.")
          ], -1))
        ]),
        s("label", es, [
          k(T, {
            modelValue: B.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => B.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (a(), o("p", ts, "Last tuning: " + g(Z.value.applied_at) + ". " + g(Z.value.rationale), 1)) : m("", !0),
        (c.value || B.value) && !f.value ? (a(), o("p", ss, "HyDE and tuning stay off until a Search analysis model is available.")) : m("", !0),
        B.value ? (a(), o("label", ns, [
          e[35] || (e[35] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Ge(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[7] || (e[7] = (n) => K.value = n)
          }, null, 512), [
            [
              Ze,
              K.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[36] || (e[36] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : m("", !0),
        s("div", as, [
          s("label", ls, [
            e[38] || (e[38] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: L.value,
              onChange: e[8] || (e[8] = (n) => L.value = n.target.value)
            }, [...e[37] || (e[37] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, os),
            e[39] || (e[39] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          L.value === "agentic" ? (a(), o("label", rs, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: z.value ?? "",
              onInput: e[9] || (e[9] = (n) => z.value = Number(n.target.value) || null)
            }, null, 40, is),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : m("", !0)
        ]),
        L.value === "agentic" ? (a(), o("div", us, [
          e[42] || (e[42] = s("span", { class: "cx-label" }, [
            h("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: F.value ? JSON.stringify([F.value]) : "[]",
            onChange: Re
          }, null, 40, ds),
          e[43] || (e[43] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : m("", !0),
        L.value !== "agentic" ? (a(), o("label", cs, [
          k(T, {
            modelValue: r.value,
            "onUpdate:modelValue": e[10] || (e[10] = (n) => r.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[44] || (e[44] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : m("", !0),
        s("label", ms, [
          e[45] || (e[45] = s("span", { class: "cx-label" }, [
            h("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: X.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[11] || (e[11] = (n) => X.value = n.target.value)
          }, null, 40, vs),
          e[46] || (e[46] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Xe.value ? (a(), o("div", ps, [
        s("div", gs, [
          k(w(j), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[47] || (e[47] = s("span", null, "Maintenance", -1))
        ]),
        s("p", fs, [
          e[48] || (e[48] = h(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          fe.value ? (a(), o(U, { key: 0 }, [
            h("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : m("", !0)
        ]),
        w(ye) ? (a(), o("p", bs, g(w(ye)), 1)) : m("", !0),
        s("div", ys, [
          k(Ae, {
            variant: "soft",
            small: "",
            disabled: oe.value || !G.value.summary_model,
            loading: w(xe)("resummarize"),
            onClick: e[12] || (e[12] = (n) => _e("resummarize"))
          }, {
            default: Ce(() => [...e[49] || (e[49] = [
              h("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          k(Ae, {
            variant: "soft",
            small: "",
            disabled: oe.value,
            loading: w(xe)("reembed"),
            onClick: e[13] || (e[13] = (n) => _e("reembed"))
          }, {
            default: Ce(() => [...e[50] || (e[50] = [
              h("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        re.value.text ? (a(), o("p", {
          key: 1,
          class: H(["cx-maint-status", re.value.tone])
        }, [
          e[51] || (e[51] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          h(g(re.value.text), 1)
        ], 2)) : m("", !0),
        ie.value.text ? (a(), o("p", {
          key: 2,
          class: H(["cx-maint-status", ie.value.tone])
        }, [
          e[52] || (e[52] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          h(g(ie.value.text), 1)
        ], 2)) : m("", !0)
      ])) : m("", !0)
    ]));
  }
});
export {
  Cs as default
};
//# sourceMappingURL=KbCreateConfig-BhQl0o6H.js.map
