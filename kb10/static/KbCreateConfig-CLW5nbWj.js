import { defineComponent as $e, openBlock as l, createElementBlock as r, normalizeClass as H, createElementVNode as s, ref as d, computed as o, watch as ue, onUnmounted as He, onMounted as Ke, createVNode as S, unref as A, toDisplayString as b, Fragment as j, renderList as _e, createCommentVNode as p, createTextVNode as _, createBlock as Xe, withDirectives as Je, vModelText as We, withCtx as ke } from "vue";
import { Icon as T } from "@iconify/vue";
import { api as we, host as Ye, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as Ge, u as Ze } from "./wc-runtime-f54Bo-yJ.js";
import { _ as Ae } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const et = ["disabled", "aria-checked"], Q = /* @__PURE__ */ $e({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(u, { emit: c }) {
    const h = c;
    return (g, v) => (l(), r("button", {
      type: "button",
      class: H(["cx-switch", { on: u.modelValue }]),
      disabled: u.disabled,
      role: "switch",
      "aria-checked": u.modelValue,
      onClick: v[0] || (v[0] = (q) => h("update:modelValue", !u.modelValue))
    }, [...v[1] || (v[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, et));
  }
});
function tt(u, c) {
  const h = c === !1 ? "" : c.trim();
  if (h) {
    u.retrieval_model = h, u.analysis_model = h;
    return;
  }
  delete u.retrieval_model, u.analysis_model = c === !1 ? !1 : "";
}
const K = "class:fast";
function Ce(u, c = K) {
  return u == null || u === "" ? c : typeof u == "string" && u.trim() ? u : "";
}
const st = 24, nt = 60;
function Ee(u, c) {
  return u.trim().length <= st && (c || "").trim().length <= nt;
}
const Me = 3e3, at = 3e4, lt = { resummarize: "documents", reembed: "nodes" };
function Ve(u, c) {
  return u?.response?.data?.error || u?.message || c;
}
function Ne(u) {
  Ye.handleError(u?.response?.status === 401 ? "auth-expired" : "other", u);
}
function rt(u) {
  const c = d({ resummarize: null, reembed: null }), h = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), v = d("");
  function q(a) {
    return h.value[a] || c.value[a]?.in_flight === !0;
  }
  const z = o(() => q("resummarize") || q("reembed"));
  let R = !1, C = 0, w = null;
  function f(a) {
    return !R && a === C;
  }
  function k() {
    w !== null && (clearTimeout(w), w = null);
  }
  function L(a, y) {
    k(), f(a) && (w = setTimeout(() => {
      M(a, y);
    }, y));
  }
  async function M(a, y = Me) {
    k();
    const i = u();
    if (!(!i || !f(a))) {
      try {
        const { data: m } = await we.get(`/api/v1/kb10/${i}/maintenance`);
        if (!f(a)) return;
        if (!m?.success) throw new Error(m?.error || "could not read maintenance status");
        c.value = {
          resummarize: m.resummarize ?? null,
          reembed: m.reembed ?? null
        }, v.value = "";
      } catch (m) {
        if (!f(a)) return;
        v.value = Ve(m, "could not read maintenance status"), Ne(m), L(a, Math.min(y * 2, at));
        return;
      }
      z.value && L(a, Me);
    }
  }
  function N() {
    const a = ++C;
    k(), c.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, v.value = "", u() && M(a);
  }
  async function B(a) {
    const y = u();
    if (!y || z.value) return;
    const i = C;
    h.value = { ...h.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: m } = await we.post(`/api/v1/kb10/${y}/${a}`);
      if (!f(i)) return;
      if (!m?.success) throw new Error(m?.error || "could not start the run");
      m.run && (c.value = { ...c.value, [a]: m.run });
    } catch (m) {
      if (!f(i)) return;
      g.value = { ...g.value, [a]: Ve(m, "could not start the run") }, Ne(m);
      return;
    } finally {
      f(i) && (h.value = { ...h.value, [a]: !1 });
    }
    M(i);
  }
  function $(a) {
    const y = g.value[a];
    if (y) return { text: y, tone: "err" };
    if (h.value[a]) return { text: "Starting…", tone: "" };
    const i = c.value[a];
    return i ? i.in_flight ? i.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : i.total > 0 ? { text: `${i.scanned} of ${i.total} ${lt[a]}…`, tone: "" } : { text: "Running…", tone: "" } : i.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : i.status === "failed" ? { text: i.last_error || "The run failed.", tone: "err" } : i.status === "succeeded" ? a === "reembed" ? { text: `${i.embedded} vectors re-embedded, ${i.scanned} scanned`, tone: "ok" } : {
      text: `${i.resummarized} summaries regenerated, ${i.chunks_reenriched} chunks re-situated, ${i.documents_skipped} documents skipped, ${i.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return ue(u, N, { immediate: !0 }), He(() => {
    R = !0, k();
  }), { runs: c, statusError: v, running: q, anyBusy: z, start: B, statusLine: $ };
}
const ut = { class: "cx" }, it = { class: "cx-group" }, ot = { class: "cx-group-h" }, dt = { class: "cx-field" }, ct = {
  key: 0,
  class: "cx-fixed"
}, mt = { class: "cx-fixed-v" }, vt = ["value"], pt = {
  key: 0,
  class: "cx-row"
}, gt = { class: "cx-label" }, ft = ["type", "min", "max", "step", "value", "onInput"], yt = {
  key: 0,
  class: "st-hint"
}, bt = { class: "cx-label" }, ht = ["value", "onInput"], xt = {
  key: 0,
  class: "st-hint"
}, _t = { class: "cx-sub" }, kt = { class: "cx-sub-h" }, wt = { class: "cx-sub-t" }, St = { class: "st-hint" }, At = {
  key: 1,
  class: "cx-req"
}, Ct = { class: "cx-row" }, Et = { class: "cx-field" }, Mt = ["value"], Vt = { class: "cx-field" }, Nt = ["value"], $t = {
  key: 0,
  class: "cx-field"
}, qt = { class: "cx-label" }, Lt = ["value"], It = {
  key: 0,
  class: "st-hint"
}, Rt = {
  key: 1,
  class: "cx-row"
}, Bt = { class: "cx-label" }, Pt = ["min", "max", "placeholder", "value"], zt = {
  key: 0,
  class: "cx-err"
}, Ft = {
  key: 1,
  class: "st-hint"
}, Ot = {
  key: 1,
  class: "cx-hint"
}, Dt = { class: "cx-sub" }, Ut = { class: "cx-sub-h" }, jt = {
  key: 0,
  class: "cx-field"
}, Tt = ["value"], Qt = { class: "cx-group" }, Ht = { class: "cx-group-h" }, Kt = { class: "cx-field" }, Xt = ["value"], Jt = {
  key: 0,
  class: "st-hint"
}, Wt = {
  key: 1,
  class: "st-hint"
}, Yt = {
  key: 2,
  class: "st-hint"
}, Gt = { class: "cx-toggle" }, Zt = { class: "cx-toggle" }, es = {
  key: 0,
  class: "st-hint"
}, ts = {
  key: 1,
  class: "cx-field"
}, ss = { class: "cx-row" }, ns = { class: "cx-field" }, as = ["value"], ls = {
  key: 0,
  class: "cx-field"
}, rs = ["value"], us = {
  key: 2,
  class: "cx-field"
}, is = ["selected"], os = {
  key: 3,
  class: "cx-toggle"
}, ds = { class: "cx-field" }, cs = ["value"], ms = {
  key: 0,
  class: "cx-group"
}, vs = { class: "cx-group-h" }, ps = { class: "cx-lead" }, gs = {
  key: 0,
  class: "cx-err"
}, fs = { class: "cx-maint-row" }, ys = "class:embed", ws = /* @__PURE__ */ $e({
  __name: "KbCreateConfig",
  setup(u) {
    const c = Ge(), h = Ze(), g = o(() => c.value.config || {}), v = o(() => !!g.value.edit), q = o(() => v.value && g.value.id || ""), z = o(() => g.value.kb_type || ""), R = o(() => z.value !== "document"), C = d(""), w = d(!0), f = d(""), k = d(""), L = d(""), M = d(""), N = d(!1), B = d(K), $ = d({}), a = d(""), y = d(!1), i = d(!1), m = d(!1), X = d(25), Z = o(() => g.value.config?.tuning), J = d(""), F = d(null), V = d("built-in"), P = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      P.value = n[0] || "";
    }
    const W = o(() => {
      const e = g.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, x]) => ({ key: n, ...x })).sort((n, x) => (n.order ?? 100) - (x.order ?? 100) || n.key.localeCompare(x.key)) : [];
    }), Le = [
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
    ], ee = o(() => W.value.filter((t) => !Le.includes(t.key)));
    function I(t, e) {
      const n = W.value.find((x) => x.key === t)?.default;
      return Ce(e, typeof n == "string" ? n : K);
    }
    const Ie = o(() => ee.value.filter((t) => t.format === "textarea")), ie = o(() => ee.value.filter((t) => t.format !== "textarea")), O = o(() => W.value.find((t) => t.key === "summary_prompt")), E = o(() => W.value.find((t) => t.key === "summary_max_chars")), Re = o(() => {
      const t = E.value;
      return t ? `${t.label || t.key} characters` : "";
    }), Y = o(() => E.value?.minimum ?? 0), te = o(() => E.value?.maximum), Be = o(() => {
      const t = E.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), se = o(() => {
      const t = M.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = te.value;
      return e < Y.value || n !== void 0 && e > n ? null : e;
    }), oe = o(() => {
      if (M.value.trim() === "" || se.value !== null) return "";
      const e = te.value;
      return e === void 0 ? `Summary length must be a whole number of ${Y.value} characters or more.` : `Summary length must be a whole number between ${Y.value} and ${e} characters.`;
    });
    function Pe() {
      const t = g.value.config || {};
      C.value = g.value.embedding_model || ys, f.value = I("summary_model", t.summary_model), k.value = I("chunk_enrichment_model", t.chunk_enrichment_model), w.value = R.value || !!(f.value || k.value), L.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", M.value = v.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", N.value = t.embed_images === !0, B.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : K;
      const e = {};
      for (const re of ee.value) {
        const xe = t[re.key];
        e[re.key] = xe !== void 0 ? xe : re.default;
      }
      $.value = e;
      const n = t.analysis_model ?? (v.value ? "" : I("analysis_model", void 0));
      a.value = n === !1 ? !1 : Ce(n, ""), y.value = t.enable_reranking === !0, i.value = t.query_strategy === "hyde", m.value = t.self_tuning === !0, X.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, J.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const x = Number(t.max_retrieval_iterations);
      F.value = Number.isFinite(x) && x > 0 ? x : null, V.value = t.query_driver === "agentic" ? "agentic" : "built-in", P.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ze() {
      const t = { ...$.value };
      return t.summary_model = w.value && (f.value || !1), t.chunk_enrichment_model = w.value && (k.value || !1), t.summary_prompt = L.value.trim(), se.value !== null && (t.summary_max_chars = se.value), t.embed_images = N.value, (v.value || N.value) && (t.image_caption_model = B.value || K), tt(t, a.value), t.query_strategy = i.value ? "hyde" : "plain", t.self_tuning = m.value, (v.value || m.value) && (t.self_tuning_query_interval = X.value), t.enable_reranking = y.value, t.extra_prompt = J.value.trim(), (v.value || V.value === "agentic") && F.value && (t.max_retrieval_iterations = F.value), t.query_driver = V.value, (v.value || V.value === "agentic" && P.value) && (t.query_agent = P.value), t;
    }
    function D(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Fe(t) {
      C.value = D(t);
    }
    function Oe(t) {
      f.value = I("summary_model", D(t));
    }
    function De(t) {
      k.value = I("chunk_enrichment_model", D(t));
    }
    function Ue(t) {
      t && !f.value && !k.value && (f.value = I("summary_model", void 0), k.value = I("chunk_enrichment_model", void 0)), w.value = t;
    }
    function de(t, e) {
      if (t.type === "integer") {
        const n = Number.parseInt(e, 10);
        $.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else if (t.type === "number") {
        const n = Number.parseFloat(e);
        $.value[t.key] = Number.isNaN(n) ? void 0 : n;
      } else
        $.value[t.key] = e;
    }
    function ce(t) {
      const e = $.value[t];
      return e == null ? "" : String(e);
    }
    const U = o(ze), G = d({}), me = o(() => Object.fromEntries(Object.entries(U.value).filter(
      ([t, e]) => !Object.is(e, G.value[t])
    ))), ve = o(() => Object.keys(me.value).length > 0 || Object.keys(G.value).some((t) => !(t in U.value)));
    function pe() {
      h("config-changed", { embedding_model: C.value, config: v.value ? me.value : U.value });
    }
    const {
      statusError: ge,
      running: fe,
      anyBusy: je,
      start: Te,
      statusLine: ye
    } = rt(() => q.value), Qe = o(() => !!q.value), ne = o(() => je.value || ve.value), ae = o(() => ye("resummarize")), le = o(() => ye("reembed"));
    function be(t) {
      ne.value || Te(t);
    }
    function he() {
      Pe(), G.value = U.value, pe();
    }
    return ue(() => c.value.config, he), ue([C, U], pe), Ke(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), he();
    }), (t, e) => (l(), r("div", ut, [
      s("div", it, [
        s("div", ot, [
          S(A(T), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", dt, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          v.value ? (l(), r("div", ct, [
            S(A(T), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", mt, b(C.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: C.value,
            capability: "embed",
            onSelect: Fe
          }, null, 40, vt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        ie.value.length ? (l(), r("div", pt, [
          (l(!0), r(j, null, _e(ie.value, (n) => (l(), r("label", {
            key: n.key,
            class: H(["cx-field", { "cx-span": !A(Ee)(n.label || n.key, n.description) }])
          }, [
            s("span", gt, b(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: ce(n.key),
              onInput: (x) => de(n, x.target.value)
            }, null, 40, ft),
            n.description ? (l(), r("p", yt, b(n.description), 1)) : p("", !0)
          ], 2))), 128))
        ])) : p("", !0),
        (l(!0), r(j, null, _e(Ie.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", bt, b(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (x) => de(n, x.target.value)
          }, null, 40, ht),
          n.description ? (l(), r("p", xt, b(n.description), 1)) : p("", !0)
        ]))), 128)),
        s("div", _t, [
          s("div", kt, [
            s("span", wt, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", St, [
                e[18] || (e[18] = _(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                R.value ? (l(), r(j, { key: 0 }, [
                  _(" Required — the concept graph is built from these models.")
                ], 64)) : p("", !0)
              ])
            ]),
            R.value ? (l(), r("span", At, "Required")) : (l(), Xe(Q, {
              key: 0,
              "model-value": w.value,
              "onUpdate:modelValue": Ue,
              "aria-label": "Contextual embedding"
            }, null, 8, ["model-value"]))
          ]),
          w.value ? (l(), r(j, { key: 0 }, [
            s("div", Ct, [
              s("div", Et, [
                e[20] || (e[20] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: f.value,
                  capability: "generate",
                  onSelect: Oe
                }, null, 40, Mt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Vt, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: k.value,
                  capability: "generate",
                  onSelect: De
                }, null, 40, Nt),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            O.value ? (l(), r("label", $t, [
              s("span", qt, [
                _(b(O.value.label || O.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: L.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => L.value = n.target.value)
              }, null, 40, Lt),
              O.value.description ? (l(), r("p", It, b(O.value.description), 1)) : p("", !0)
            ])) : p("", !0),
            E.value ? (l(), r("div", Rt, [
              s("label", {
                class: H(["cx-field", { "cx-span": !A(Ee)(Re.value, E.value.description) }])
              }, [
                s("span", Bt, [
                  _(b(E.value.label || E.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: Y.value,
                  max: te.value,
                  placeholder: Be.value,
                  value: M.value,
                  onInput: e[1] || (e[1] = (n) => M.value = n.target.value)
                }, null, 40, Pt),
                oe.value ? (l(), r("p", zt, b(oe.value), 1)) : E.value.description ? (l(), r("p", Ft, b(E.value.description), 1)) : p("", !0)
              ], 2)
            ])) : p("", !0)
          ], 64)) : (l(), r("p", Ot, [
            S(A(T), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[26] || (e[26] = _("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Dt, [
          s("div", Ut, [
            e[27] || (e[27] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            S(Q, {
              modelValue: N.value,
              "onUpdate:modelValue": e[2] || (e[2] = (n) => N.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          N.value ? (l(), r("div", jt, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: B.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => B.value = D(n))
            }, null, 40, Tt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : p("", !0)
        ])
      ]),
      s("div", Qt, [
        s("div", Ht, [
          S(A(T), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Search and Ask", -1))
        ]),
        s("div", Kt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Search analysis model", -1)),
          s("wc-model-picker", {
            value: a.value || "",
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => a.value = D(n).trim() || !1)
          }, null, 40, Xt),
          a.value === !1 ? (l(), r("p", Jt, "Answers are disabled. Ask returns matching passages.")) : a.value ? (l(), r("p", Wt, "Ask uses the selected model to write answers.")) : (l(), r("p", Yt, "Search returns direct matches. Ask uses Fast when available."))
        ]),
        s("label", Gt, [
          S(Q, {
            modelValue: i.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => i.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[33] || (e[33] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Uses the Search analysis model to generate a short hypothetical answer before embedding each question.")
          ], -1))
        ]),
        s("label", Zt, [
          S(Q, {
            modelValue: m.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => m.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (l(), r("p", es, "Last tuning: " + b(Z.value.applied_at) + ". " + b(Z.value.rationale), 1)) : p("", !0),
        m.value ? (l(), r("label", ts, [
          e[35] || (e[35] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Je(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[7] || (e[7] = (n) => X.value = n)
          }, null, 512), [
            [
              We,
              X.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[36] || (e[36] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : p("", !0),
        s("div", ss, [
          s("label", ns, [
            e[38] || (e[38] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: V.value,
              onChange: e[8] || (e[8] = (n) => V.value = n.target.value)
            }, [...e[37] || (e[37] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, as),
            e[39] || (e[39] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          V.value === "agentic" ? (l(), r("label", ls, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: F.value ?? "",
              onInput: e[9] || (e[9] = (n) => F.value = Number(n.target.value) || null)
            }, null, 40, rs),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : p("", !0)
        ]),
        V.value === "agentic" ? (l(), r("div", us, [
          e[42] || (e[42] = s("span", { class: "cx-label" }, [
            _("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: P.value ? JSON.stringify([P.value]) : "[]",
            onChange: qe
          }, null, 40, is),
          e[43] || (e[43] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : p("", !0),
        V.value !== "agentic" ? (l(), r("label", os, [
          S(Q, {
            modelValue: y.value,
            "onUpdate:modelValue": e[10] || (e[10] = (n) => y.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[44] || (e[44] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : p("", !0),
        s("label", ds, [
          e[45] || (e[45] = s("span", { class: "cx-label" }, [
            _("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: J.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[11] || (e[11] = (n) => J.value = n.target.value)
          }, null, 40, cs),
          e[46] || (e[46] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Qe.value ? (l(), r("div", ms, [
        s("div", vs, [
          S(A(T), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[47] || (e[47] = s("span", null, "Maintenance", -1))
        ]),
        s("p", ps, [
          e[48] || (e[48] = _(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), r(j, { key: 0 }, [
            _("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : p("", !0)
        ]),
        A(ge) ? (l(), r("p", gs, b(A(ge)), 1)) : p("", !0),
        s("div", fs, [
          S(Ae, {
            variant: "soft",
            small: "",
            disabled: ne.value || !G.value.summary_model,
            loading: A(fe)("resummarize"),
            onClick: e[12] || (e[12] = (n) => be("resummarize"))
          }, {
            default: ke(() => [...e[49] || (e[49] = [
              _("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          S(Ae, {
            variant: "soft",
            small: "",
            disabled: ne.value,
            loading: A(fe)("reembed"),
            onClick: e[13] || (e[13] = (n) => be("reembed"))
          }, {
            default: ke(() => [...e[50] || (e[50] = [
              _("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        ae.value.text ? (l(), r("p", {
          key: 1,
          class: H(["cx-maint-status", ae.value.tone])
        }, [
          e[51] || (e[51] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          _(b(ae.value.text), 1)
        ], 2)) : p("", !0),
        le.value.text ? (l(), r("p", {
          key: 2,
          class: H(["cx-maint-status", le.value.tone])
        }, [
          e[52] || (e[52] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          _(b(le.value.text), 1)
        ], 2)) : p("", !0)
      ])) : p("", !0)
    ]));
  }
});
export {
  ws as default
};
//# sourceMappingURL=KbCreateConfig-CLW5nbWj.js.map
