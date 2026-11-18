import { defineComponent as $e, openBlock as l, createElementBlock as u, normalizeClass as H, createElementVNode as s, ref as d, computed as i, watch as re, onUnmounted as He, onMounted as Ke, createVNode as S, unref as C, toDisplayString as b, Fragment as j, renderList as _e, createCommentVNode as p, createTextVNode as _, createBlock as Xe, withDirectives as Je, vModelText as We, withCtx as ke } from "vue";
import { Icon as T } from "@iconify/vue";
import { api as we, host as Ye, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as Ge, u as Ze } from "./wc-runtime-f54Bo-yJ.js";
import { _ as Ce } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const et = ["disabled", "aria-checked"], Q = /* @__PURE__ */ $e({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(r, { emit: m }) {
    const x = m;
    return (g, v) => (l(), u("button", {
      type: "button",
      class: H(["cx-switch", { on: r.modelValue }]),
      disabled: r.disabled,
      role: "switch",
      "aria-checked": r.modelValue,
      onClick: v[0] || (v[0] = (q) => x("update:modelValue", !r.modelValue))
    }, [...v[1] || (v[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, et));
  }
});
function tt(r) {
  return typeof r == "string" ? r.trim() : "";
}
function st(r, m) {
  const x = tt(m);
  if (x) {
    r.retrieval_model = x, r.analysis_model = x;
    return;
  }
  delete r.retrieval_model, r.analysis_model = !1;
}
const K = "class:fast";
function Ee(r, m = K) {
  return r == null || r === "" ? m : typeof r == "string" && r.trim() ? r : "";
}
const nt = 24, at = 60;
function Me(r, m) {
  return r.trim().length <= nt && (m || "").trim().length <= at;
}
const Ae = 3e3, lt = 3e4, ut = { resummarize: "documents", reembed: "nodes" };
function Ve(r, m) {
  return r?.response?.data?.error || r?.message || m;
}
function Ne(r) {
  Ye.handleError(r?.response?.status === 401 ? "auth-expired" : "other", r);
}
function rt(r) {
  const m = d({ resummarize: null, reembed: null }), x = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), v = d("");
  function q(a) {
    return x.value[a] || m.value[a]?.in_flight === !0;
  }
  const z = i(() => q("resummarize") || q("reembed"));
  let R = !1, E = 0, w = null;
  function f(a) {
    return !R && a === E;
  }
  function k() {
    w !== null && (clearTimeout(w), w = null);
  }
  function L(a, y) {
    k(), f(a) && (w = setTimeout(() => {
      A(a, y);
    }, y));
  }
  async function A(a, y = Ae) {
    k();
    const o = r();
    if (!(!o || !f(a))) {
      try {
        const { data: c } = await we.get(`/api/v1/kb10/${o}/maintenance`);
        if (!f(a)) return;
        if (!c?.success) throw new Error(c?.error || "could not read maintenance status");
        m.value = {
          resummarize: c.resummarize ?? null,
          reembed: c.reembed ?? null
        }, v.value = "";
      } catch (c) {
        if (!f(a)) return;
        v.value = Ve(c, "could not read maintenance status"), Ne(c), L(a, Math.min(y * 2, lt));
        return;
      }
      z.value && L(a, Ae);
    }
  }
  function N() {
    const a = ++E;
    k(), m.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, v.value = "", r() && A(a);
  }
  async function B(a) {
    const y = r();
    if (!y || z.value) return;
    const o = E;
    x.value = { ...x.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: c } = await we.post(`/api/v1/kb10/${y}/${a}`);
      if (!f(o)) return;
      if (!c?.success) throw new Error(c?.error || "could not start the run");
      c.run && (m.value = { ...m.value, [a]: c.run });
    } catch (c) {
      if (!f(o)) return;
      g.value = { ...g.value, [a]: Ve(c, "could not start the run") }, Ne(c);
      return;
    } finally {
      f(o) && (x.value = { ...x.value, [a]: !1 });
    }
    A(o);
  }
  function $(a) {
    const y = g.value[a];
    if (y) return { text: y, tone: "err" };
    if (x.value[a]) return { text: "Starting…", tone: "" };
    const o = m.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${ut[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return re(r, N, { immediate: !0 }), He(() => {
    R = !0, k();
  }), { runs: m, statusError: v, running: q, anyBusy: z, start: B, statusLine: $ };
}
const ot = { class: "cx" }, it = { class: "cx-group" }, dt = { class: "cx-group-h" }, ct = { class: "cx-field" }, mt = {
  key: 0,
  class: "cx-fixed"
}, vt = { class: "cx-fixed-v" }, pt = ["value"], gt = {
  key: 0,
  class: "cx-row"
}, ft = { class: "cx-label" }, yt = ["type", "min", "max", "step", "value", "onInput"], bt = {
  key: 0,
  class: "st-hint"
}, xt = { class: "cx-label" }, ht = ["value", "onInput"], _t = {
  key: 0,
  class: "st-hint"
}, kt = { class: "cx-sub" }, wt = { class: "cx-sub-h" }, St = { class: "cx-sub-t" }, Ct = { class: "st-hint" }, Et = {
  key: 1,
  class: "cx-req"
}, Mt = { class: "cx-row" }, At = { class: "cx-field" }, Vt = ["value"], Nt = { class: "cx-field" }, $t = ["value"], qt = {
  key: 0,
  class: "cx-field"
}, Lt = { class: "cx-label" }, It = ["value"], Rt = {
  key: 0,
  class: "st-hint"
}, Bt = {
  key: 1,
  class: "cx-row"
}, Pt = { class: "cx-label" }, zt = ["min", "max", "placeholder", "value"], Ft = {
  key: 0,
  class: "cx-err"
}, Ot = {
  key: 1,
  class: "st-hint"
}, Dt = {
  key: 1,
  class: "cx-hint"
}, Ut = { class: "cx-sub" }, jt = { class: "cx-sub-h" }, Tt = {
  key: 0,
  class: "cx-field"
}, Qt = ["value"], Ht = { class: "cx-group" }, Kt = { class: "cx-group-h" }, Xt = { class: "cx-field" }, Jt = ["value"], Wt = {
  key: 0,
  class: "st-hint"
}, Yt = {
  key: 1,
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
}, us = ["value"], rs = {
  key: 2,
  class: "cx-field"
}, os = ["selected"], is = {
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
  setup(r) {
    const m = Ge(), x = Ze(), g = i(() => m.value.config || {}), v = i(() => !!g.value.edit), q = i(() => v.value && g.value.id || ""), z = i(() => g.value.kb_type || ""), R = i(() => z.value !== "document"), E = d(""), w = d(!0), f = d(""), k = d(""), L = d(""), A = d(""), N = d(!1), B = d(K), $ = d({}), a = d(""), y = d(!1), o = d(!1), c = d(!1), X = d(25), Z = i(() => g.value.config?.tuning), J = d(""), F = d(null), V = d("built-in"), P = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      P.value = n[0] || "";
    }
    const W = i(() => {
      const e = g.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, h]) => ({ key: n, ...h })).sort((n, h) => (n.order ?? 100) - (h.order ?? 100) || n.key.localeCompare(h.key)) : [];
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
    ], ee = i(() => W.value.filter((t) => !Le.includes(t.key)));
    function I(t, e) {
      const n = W.value.find((h) => h.key === t)?.default;
      return Ee(e, typeof n == "string" ? n : K);
    }
    const Ie = i(() => ee.value.filter((t) => t.format === "textarea")), oe = i(() => ee.value.filter((t) => t.format !== "textarea")), O = i(() => W.value.find((t) => t.key === "summary_prompt")), M = i(() => W.value.find((t) => t.key === "summary_max_chars")), Re = i(() => {
      const t = M.value;
      return t ? `${t.label || t.key} characters` : "";
    }), Y = i(() => M.value?.minimum ?? 0), te = i(() => M.value?.maximum), Be = i(() => {
      const t = M.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), se = i(() => {
      const t = A.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = te.value;
      return e < Y.value || n !== void 0 && e > n ? null : e;
    }), ie = i(() => {
      if (A.value.trim() === "" || se.value !== null) return "";
      const e = te.value;
      return e === void 0 ? `Summary length must be a whole number of ${Y.value} characters or more.` : `Summary length must be a whole number between ${Y.value} and ${e} characters.`;
    });
    function Pe() {
      const t = g.value.config || {};
      E.value = g.value.embedding_model || ys, f.value = I("summary_model", t.summary_model), k.value = I("chunk_enrichment_model", t.chunk_enrichment_model), w.value = R.value || !!(f.value || k.value), L.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", A.value = v.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", N.value = t.embed_images === !0, B.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : K;
      const e = {};
      for (const ue of ee.value) {
        const he = t[ue.key];
        e[ue.key] = he !== void 0 ? he : ue.default;
      }
      $.value = e;
      const n = t.analysis_model ?? (v.value ? !1 : I("analysis_model", void 0));
      a.value = Ee(n, ""), y.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", c.value = t.self_tuning === !0, X.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, J.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const h = Number(t.max_retrieval_iterations);
      F.value = Number.isFinite(h) && h > 0 ? h : null, V.value = t.query_driver === "agentic" ? "agentic" : "built-in", P.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function ze() {
      const t = { ...$.value };
      return t.summary_model = w.value && (f.value || !1), t.chunk_enrichment_model = w.value && (k.value || !1), t.summary_prompt = L.value.trim(), se.value !== null && (t.summary_max_chars = se.value), t.embed_images = N.value, (v.value || N.value) && (t.image_caption_model = B.value || K), st(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = c.value, (v.value || c.value) && (t.self_tuning_query_interval = X.value), t.enable_reranking = y.value, t.extra_prompt = J.value.trim(), (v.value || V.value === "agentic") && F.value && (t.max_retrieval_iterations = F.value), t.query_driver = V.value, (v.value || V.value === "agentic" && P.value) && (t.query_agent = P.value), t;
    }
    function D(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Fe(t) {
      E.value = D(t);
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
    const U = i(ze), G = d({}), me = i(() => Object.fromEntries(Object.entries(U.value).filter(
      ([t, e]) => !Object.is(e, G.value[t])
    ))), ve = i(() => Object.keys(me.value).length > 0 || Object.keys(G.value).some((t) => !(t in U.value)));
    function pe() {
      x("config-changed", { embedding_model: E.value, config: v.value ? me.value : U.value });
    }
    const {
      statusError: ge,
      running: fe,
      anyBusy: je,
      start: Te,
      statusLine: ye
    } = rt(() => q.value), Qe = i(() => !!q.value), ne = i(() => je.value || ve.value), ae = i(() => ye("resummarize")), le = i(() => ye("reembed"));
    function be(t) {
      ne.value || Te(t);
    }
    function xe() {
      Pe(), G.value = U.value, pe();
    }
    return re(() => m.value.config, xe), re([E, U], pe), Ke(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), xe();
    }), (t, e) => (l(), u("div", ot, [
      s("div", it, [
        s("div", dt, [
          S(C(T), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", ct, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          v.value ? (l(), u("div", mt, [
            S(C(T), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", vt, b(E.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), u("wc-model-picker", {
            key: 1,
            value: E.value,
            capability: "embed",
            onSelect: Fe
          }, null, 40, pt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        oe.value.length ? (l(), u("div", gt, [
          (l(!0), u(j, null, _e(oe.value, (n) => (l(), u("label", {
            key: n.key,
            class: H(["cx-field", { "cx-span": !C(Me)(n.label || n.key, n.description) }])
          }, [
            s("span", ft, b(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: ce(n.key),
              onInput: (h) => de(n, h.target.value)
            }, null, 40, yt),
            n.description ? (l(), u("p", bt, b(n.description), 1)) : p("", !0)
          ], 2))), 128))
        ])) : p("", !0),
        (l(!0), u(j, null, _e(Ie.value, (n) => (l(), u("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", xt, b(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (h) => de(n, h.target.value)
          }, null, 40, ht),
          n.description ? (l(), u("p", _t, b(n.description), 1)) : p("", !0)
        ]))), 128)),
        s("div", kt, [
          s("div", wt, [
            s("span", St, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", Ct, [
                e[18] || (e[18] = _(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                R.value ? (l(), u(j, { key: 0 }, [
                  _(" Required — the concept graph is built from these models.")
                ], 64)) : p("", !0)
              ])
            ]),
            R.value ? (l(), u("span", Et, "Required")) : (l(), Xe(Q, {
              key: 0,
              "model-value": w.value,
              "onUpdate:modelValue": Ue,
              "aria-label": "Contextual embedding"
            }, null, 8, ["model-value"]))
          ]),
          w.value ? (l(), u(j, { key: 0 }, [
            s("div", Mt, [
              s("div", At, [
                e[20] || (e[20] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: f.value,
                  capability: "generate",
                  onSelect: Oe
                }, null, 40, Vt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Nt, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: k.value,
                  capability: "generate",
                  onSelect: De
                }, null, 40, $t),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            O.value ? (l(), u("label", qt, [
              s("span", Lt, [
                _(b(O.value.label || O.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: L.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => L.value = n.target.value)
              }, null, 40, It),
              O.value.description ? (l(), u("p", Rt, b(O.value.description), 1)) : p("", !0)
            ])) : p("", !0),
            M.value ? (l(), u("div", Bt, [
              s("label", {
                class: H(["cx-field", { "cx-span": !C(Me)(Re.value, M.value.description) }])
              }, [
                s("span", Pt, [
                  _(b(M.value.label || M.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: Y.value,
                  max: te.value,
                  placeholder: Be.value,
                  value: A.value,
                  onInput: e[1] || (e[1] = (n) => A.value = n.target.value)
                }, null, 40, zt),
                ie.value ? (l(), u("p", Ft, b(ie.value), 1)) : M.value.description ? (l(), u("p", Ot, b(M.value.description), 1)) : p("", !0)
              ], 2)
            ])) : p("", !0)
          ], 64)) : (l(), u("p", Dt, [
            S(C(T), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[26] || (e[26] = _("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Ut, [
          s("div", jt, [
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
          N.value ? (l(), u("div", Tt, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: B.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => B.value = D(n))
            }, null, 40, Qt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : p("", !0)
        ])
      ]),
      s("div", Ht, [
        s("div", Kt, [
          S(C(T), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Search and Ask", -1))
        ]),
        s("div", Xt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Search analysis model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => a.value = D(n))
          }, null, 40, Jt),
          a.value ? (l(), u("p", Wt, "Ask uses the selected model to write answers.")) : (l(), u("p", Yt, "Search returns direct matches. Ask uses Fast when available."))
        ]),
        s("label", Gt, [
          S(Q, {
            modelValue: o.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[33] || (e[33] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Uses the Search analysis model to generate a short hypothetical answer before embedding each question.")
          ], -1))
        ]),
        s("label", Zt, [
          S(Q, {
            modelValue: c.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => c.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (l(), u("p", es, "Last tuning: " + b(Z.value.applied_at) + ". " + b(Z.value.rationale), 1)) : p("", !0),
        c.value ? (l(), u("label", ts, [
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
          V.value === "agentic" ? (l(), u("label", ls, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: F.value ?? "",
              onInput: e[9] || (e[9] = (n) => F.value = Number(n.target.value) || null)
            }, null, 40, us),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : p("", !0)
        ]),
        V.value === "agentic" ? (l(), u("div", rs, [
          e[42] || (e[42] = s("span", { class: "cx-label" }, [
            _("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: P.value ? JSON.stringify([P.value]) : "[]",
            onChange: qe
          }, null, 40, os),
          e[43] || (e[43] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : p("", !0),
        V.value !== "agentic" ? (l(), u("label", is, [
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
      Qe.value ? (l(), u("div", ms, [
        s("div", vs, [
          S(C(T), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[47] || (e[47] = s("span", null, "Maintenance", -1))
        ]),
        s("p", ps, [
          e[48] || (e[48] = _(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), u(j, { key: 0 }, [
            _("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : p("", !0)
        ]),
        C(ge) ? (l(), u("p", gs, b(C(ge)), 1)) : p("", !0),
        s("div", fs, [
          S(Ce, {
            variant: "soft",
            small: "",
            disabled: ne.value || !G.value.summary_model,
            loading: C(fe)("resummarize"),
            onClick: e[12] || (e[12] = (n) => be("resummarize"))
          }, {
            default: ke(() => [...e[49] || (e[49] = [
              _("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          S(Ce, {
            variant: "soft",
            small: "",
            disabled: ne.value,
            loading: C(fe)("reembed"),
            onClick: e[13] || (e[13] = (n) => be("reembed"))
          }, {
            default: ke(() => [...e[50] || (e[50] = [
              _("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        ae.value.text ? (l(), u("p", {
          key: 1,
          class: H(["cx-maint-status", ae.value.tone])
        }, [
          e[51] || (e[51] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          _(b(ae.value.text), 1)
        ], 2)) : p("", !0),
        le.value.text ? (l(), u("p", {
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
//# sourceMappingURL=KbCreateConfig-WCodUrmo.js.map
