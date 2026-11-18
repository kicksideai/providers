import { defineComponent as Ne, openBlock as l, createElementBlock as u, normalizeClass as H, createElementVNode as s, ref as d, computed as r, watch as oe, onUnmounted as He, onMounted as Ke, createVNode as w, unref as S, toDisplayString as b, Fragment as j, renderList as _e, createCommentVNode as c, createTextVNode as h, createBlock as Xe, withDirectives as Je, vModelText as We, withCtx as ke } from "vue";
import { Icon as T } from "@iconify/vue";
import { api as we, host as Ye, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as Ge, u as Ze } from "./wc-runtime-f54Bo-yJ.js";
import { D as G, _ as Ce, a as et, r as Ee } from "./queryMode-D9gMlIJK.js";
const tt = ["disabled", "aria-checked"], Q = /* @__PURE__ */ Ne({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(v, { emit: p }) {
    const C = p;
    return (g, m) => (l(), u("button", {
      type: "button",
      class: H(["cx-switch", { on: v.modelValue }]),
      disabled: v.disabled,
      role: "switch",
      "aria-checked": v.modelValue,
      onClick: m[0] || (m[0] = ($) => C("update:modelValue", !v.modelValue))
    }, [...m[1] || (m[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, tt));
  }
}), st = 24, nt = 60;
function Me(v, p) {
  return v.trim().length <= st && (p || "").trim().length <= nt;
}
const Ve = 3e3, at = 3e4, lt = { resummarize: "documents", reembed: "nodes" };
function Ae(v, p) {
  return v?.response?.data?.error || v?.message || p;
}
function qe(v) {
  Ye.handleError(v?.response?.status === 401 ? "auth-expired" : "other", v);
}
function ut(v) {
  const p = d({ resummarize: null, reembed: null }), C = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), m = d("");
  function $(a) {
    return C.value[a] || p.value[a]?.in_flight === !0;
  }
  const P = r(() => $("resummarize") || $("reembed"));
  let R = !1, E = 0, k = null;
  function f(a) {
    return !R && a === E;
  }
  function _() {
    k !== null && (clearTimeout(k), k = null);
  }
  function L(a, y) {
    _(), f(a) && (k = setTimeout(() => {
      V(a, y);
    }, y));
  }
  async function V(a, y = Ve) {
    _();
    const o = v();
    if (!(!o || !f(a))) {
      try {
        const { data: i } = await we.get(`/api/v1/kb10/${o}/maintenance`);
        if (!f(a)) return;
        if (!i?.success) throw new Error(i?.error || "could not read maintenance status");
        p.value = {
          resummarize: i.resummarize ?? null,
          reembed: i.reembed ?? null
        }, m.value = "";
      } catch (i) {
        if (!f(a)) return;
        m.value = Ae(i, "could not read maintenance status"), qe(i), L(a, Math.min(y * 2, at));
        return;
      }
      P.value && L(a, Ve);
    }
  }
  function q() {
    const a = ++E;
    _(), p.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, m.value = "", v() && V(a);
  }
  async function z(a) {
    const y = v();
    if (!y || P.value) return;
    const o = E;
    C.value = { ...C.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: i } = await we.post(`/api/v1/kb10/${y}/${a}`);
      if (!f(o)) return;
      if (!i?.success) throw new Error(i?.error || "could not start the run");
      i.run && (p.value = { ...p.value, [a]: i.run });
    } catch (i) {
      if (!f(o)) return;
      g.value = { ...g.value, [a]: Ae(i, "could not start the run") }, qe(i);
      return;
    } finally {
      f(o) && (C.value = { ...C.value, [a]: !1 });
    }
    V(o);
  }
  function N(a) {
    const y = g.value[a];
    if (y) return { text: y, tone: "err" };
    if (C.value[a]) return { text: "Starting…", tone: "" };
    const o = p.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${lt[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return oe(v, q, { immediate: !0 }), He(() => {
    R = !0, _();
  }), { runs: p, statusError: m, running: $, anyBusy: P, start: z, statusLine: N };
}
const ot = { class: "cx" }, rt = { class: "cx-group" }, it = { class: "cx-group-h" }, dt = { class: "cx-field" }, ct = {
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
}, _t = { class: "cx-sub" }, kt = { class: "cx-sub-h" }, wt = { class: "cx-sub-t" }, St = { class: "st-hint" }, Ct = {
  key: 1,
  class: "cx-req"
}, Et = { class: "cx-row" }, Mt = { class: "cx-field" }, Vt = ["value"], At = { class: "cx-field" }, qt = ["value"], Nt = {
  key: 0,
  class: "cx-field"
}, $t = { class: "cx-label" }, Lt = ["value"], It = {
  key: 0,
  class: "st-hint"
}, Rt = {
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
}, Ot = { class: "cx-sub" }, Ut = { class: "cx-sub-h" }, jt = {
  key: 0,
  class: "cx-field"
}, Tt = ["value"], Qt = { class: "cx-group" }, Ht = { class: "cx-group-h" }, Kt = { class: "cx-field" }, Xt = ["value"], Jt = {
  key: 0,
  class: "st-hint"
}, Wt = { class: "cx-toggle" }, Yt = { class: "cx-toggle" }, Gt = {
  key: 0,
  class: "st-hint"
}, Zt = {
  key: 1,
  class: "cx-err"
}, es = {
  key: 2,
  class: "cx-field"
}, ts = { class: "cx-row" }, ss = { class: "cx-field" }, ns = ["value"], as = {
  key: 0,
  class: "cx-field"
}, ls = ["value"], us = {
  key: 3,
  class: "cx-field"
}, os = ["selected"], rs = {
  key: 4,
  class: "cx-toggle"
}, is = { class: "cx-field" }, ds = ["value"], cs = {
  key: 0,
  class: "cx-group"
}, ms = { class: "cx-group-h" }, vs = { class: "cx-lead" }, ps = {
  key: 0,
  class: "cx-err"
}, gs = { class: "cx-maint-row" }, fs = "class:embed", ks = /* @__PURE__ */ Ne({
  __name: "KbCreateConfig",
  setup(v) {
    const p = Ge(), C = Ze(), g = r(() => p.value.config || {}), m = r(() => !!g.value.edit), $ = r(() => m.value && g.value.id || ""), P = r(() => g.value.kb_type || ""), R = r(() => P.value !== "document"), E = d(""), k = d(!0), f = d(""), _ = d(""), L = d(""), V = d(""), q = d(!1), z = d(G), N = d({}), a = d(""), y = d(!1), o = d(!1), i = d(!1), K = d(25), Z = r(() => g.value.config?.tuning), X = d(""), F = d(null), A = d("built-in"), B = d("");
    function $e(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      B.value = n[0] || "";
    }
    const J = r(() => {
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
    ], ee = r(() => J.value.filter((t) => !Le.includes(t.key)));
    function I(t, e) {
      const n = J.value.find((x) => x.key === t)?.default;
      return Ee(e, typeof n == "string" ? n : G);
    }
    const Ie = r(() => ee.value.filter((t) => t.format === "textarea")), re = r(() => ee.value.filter((t) => t.format !== "textarea")), D = r(() => J.value.find((t) => t.key === "summary_prompt")), M = r(() => J.value.find((t) => t.key === "summary_max_chars")), Re = r(() => {
      const t = M.value;
      return t ? `${t.label || t.key} characters` : "";
    }), W = r(() => M.value?.minimum ?? 0), te = r(() => M.value?.maximum), ze = r(() => {
      const t = M.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), se = r(() => {
      const t = V.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = te.value;
      return e < W.value || n !== void 0 && e > n ? null : e;
    }), ie = r(() => {
      if (V.value.trim() === "" || se.value !== null) return "";
      const e = te.value;
      return e === void 0 ? `Summary length must be a whole number of ${W.value} characters or more.` : `Summary length must be a whole number between ${W.value} and ${e} characters.`;
    });
    function Be() {
      const t = g.value.config || {};
      E.value = g.value.embedding_model || fs, f.value = I("summary_model", t.summary_model), _.value = I("chunk_enrichment_model", t.chunk_enrichment_model), k.value = R.value || !!(f.value || _.value), L.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", V.value = m.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", q.value = t.embed_images === !0, z.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : G;
      const e = {};
      for (const ue of ee.value) {
        const he = t[ue.key];
        e[ue.key] = he !== void 0 ? he : ue.default;
      }
      N.value = e;
      const n = t.analysis_model ?? (m.value ? !1 : I("analysis_model", void 0));
      a.value = Ee(n, ""), y.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", i.value = t.self_tuning === !0, K.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, X.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const x = Number(t.max_retrieval_iterations);
      F.value = Number.isFinite(x) && x > 0 ? x : null, A.value = t.query_driver === "agentic" ? "agentic" : "built-in", B.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function Pe() {
      const t = { ...N.value };
      return t.summary_model = k.value && (f.value || !1), t.chunk_enrichment_model = k.value && (_.value || !1), t.summary_prompt = L.value.trim(), se.value !== null && (t.summary_max_chars = se.value), t.embed_images = q.value, (m.value || q.value) && (t.image_caption_model = z.value || G), et(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = i.value, (m.value || i.value) && (t.self_tuning_query_interval = K.value), t.enable_reranking = y.value, t.extra_prompt = X.value.trim(), (m.value || A.value === "agentic") && F.value && (t.max_retrieval_iterations = F.value), t.query_driver = A.value, (m.value || A.value === "agentic" && B.value) && (t.query_agent = B.value), t;
    }
    function O(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Fe(t) {
      E.value = O(t);
    }
    function De(t) {
      f.value = I("summary_model", O(t));
    }
    function Oe(t) {
      _.value = I("chunk_enrichment_model", O(t));
    }
    function Ue(t) {
      t && !f.value && !_.value && (f.value = I("summary_model", void 0), _.value = I("chunk_enrichment_model", void 0)), k.value = t;
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
    const U = r(Pe), Y = d({}), me = r(() => Object.fromEntries(Object.entries(U.value).filter(
      ([t, e]) => !Object.is(e, Y.value[t])
    ))), ve = r(() => Object.keys(me.value).length > 0 || Object.keys(Y.value).some((t) => !(t in U.value)));
    function pe() {
      C("config-changed", { embedding_model: E.value, config: m.value ? me.value : U.value });
    }
    const {
      statusError: ge,
      running: fe,
      anyBusy: je,
      start: Te,
      statusLine: ye
    } = ut(() => $.value), Qe = r(() => !!$.value), ne = r(() => je.value || ve.value), ae = r(() => ye("resummarize")), le = r(() => ye("reembed"));
    function be(t) {
      ne.value || Te(t);
    }
    function xe() {
      Be(), Y.value = U.value, pe();
    }
    return oe(() => p.value.config, xe), oe([E, U], pe), Ke(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), xe();
    }), (t, e) => (l(), u("div", ot, [
      s("div", rt, [
        s("div", it, [
          w(S(T), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", dt, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          m.value ? (l(), u("div", ct, [
            w(S(T), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", mt, b(E.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), u("wc-model-picker", {
            key: 1,
            value: E.value,
            capability: "embed",
            onSelect: Fe
          }, null, 40, vt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        re.value.length ? (l(), u("div", pt, [
          (l(!0), u(j, null, _e(re.value, (n) => (l(), u("label", {
            key: n.key,
            class: H(["cx-field", { "cx-span": !S(Me)(n.label || n.key, n.description) }])
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
            n.description ? (l(), u("p", yt, b(n.description), 1)) : c("", !0)
          ], 2))), 128))
        ])) : c("", !0),
        (l(!0), u(j, null, _e(Ie.value, (n) => (l(), u("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", bt, b(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(ce(n.key) ?? ""),
            onInput: (x) => de(n, x.target.value)
          }, null, 40, xt),
          n.description ? (l(), u("p", ht, b(n.description), 1)) : c("", !0)
        ]))), 128)),
        s("div", _t, [
          s("div", kt, [
            s("span", wt, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", St, [
                e[18] || (e[18] = h(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                R.value ? (l(), u(j, { key: 0 }, [
                  h(" Required — the concept graph is built from these models.")
                ], 64)) : c("", !0)
              ])
            ]),
            R.value ? (l(), u("span", Ct, "Required")) : (l(), Xe(Q, {
              key: 0,
              "model-value": k.value,
              "onUpdate:modelValue": Ue,
              "aria-label": "Contextual embedding"
            }, null, 8, ["model-value"]))
          ]),
          k.value ? (l(), u(j, { key: 0 }, [
            s("div", Et, [
              s("div", Mt, [
                e[20] || (e[20] = s("span", { class: "cx-label" }, "Summary model", -1)),
                s("wc-model-picker", {
                  value: f.value,
                  capability: "generate",
                  onSelect: De
                }, null, 40, Vt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", At, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: _.value,
                  capability: "generate",
                  onSelect: Oe
                }, null, 40, qt),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            D.value ? (l(), u("label", Nt, [
              s("span", $t, [
                h(b(D.value.label || D.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: L.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => L.value = n.target.value)
              }, null, 40, Lt),
              D.value.description ? (l(), u("p", It, b(D.value.description), 1)) : c("", !0)
            ])) : c("", !0),
            M.value ? (l(), u("div", Rt, [
              s("label", {
                class: H(["cx-field", { "cx-span": !S(Me)(Re.value, M.value.description) }])
              }, [
                s("span", zt, [
                  h(b(M.value.label || M.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: W.value,
                  max: te.value,
                  placeholder: ze.value,
                  value: V.value,
                  onInput: e[1] || (e[1] = (n) => V.value = n.target.value)
                }, null, 40, Bt),
                ie.value ? (l(), u("p", Pt, b(ie.value), 1)) : M.value.description ? (l(), u("p", Ft, b(M.value.description), 1)) : c("", !0)
              ], 2)
            ])) : c("", !0)
          ], 64)) : (l(), u("p", Dt, [
            w(S(T), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[26] || (e[26] = h("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        s("div", Ot, [
          s("div", Ut, [
            e[27] || (e[27] = s("span", { class: "cx-sub-t" }, [
              s("span", { class: "cx-label" }, "Embed images"),
              s("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            w(Q, {
              modelValue: q.value,
              "onUpdate:modelValue": e[2] || (e[2] = (n) => q.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          q.value ? (l(), u("div", jt, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: z.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => z.value = O(n))
            }, null, 40, Tt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : c("", !0)
        ])
      ]),
      s("div", Qt, [
        s("div", Ht, [
          w(S(T), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Search and Ask", -1))
        ]),
        s("div", Kt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Search analysis model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => a.value = O(n))
          }, null, 40, Xt),
          a.value ? c("", !0) : (l(), u("p", Jt, "Search returns direct matches."))
        ]),
        s("label", Wt, [
          w(Q, {
            modelValue: o.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[33] || (e[33] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Uses the Search analysis model to generate a short hypothetical answer before embedding each question.")
          ], -1))
        ]),
        s("label", Yt, [
          w(Q, {
            modelValue: i.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => i.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (l(), u("p", Gt, "Last tuning: " + b(Z.value.applied_at) + ". " + b(Z.value.rationale), 1)) : c("", !0),
        (o.value || i.value) && !a.value ? (l(), u("p", Zt, "Select a query analysis model for retrieval optimization.")) : c("", !0),
        i.value ? (l(), u("label", es, [
          e[35] || (e[35] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Je(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[7] || (e[7] = (n) => K.value = n)
          }, null, 512), [
            [
              We,
              K.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[36] || (e[36] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : c("", !0),
        s("div", ts, [
          s("label", ss, [
            e[38] || (e[38] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: A.value,
              onChange: e[8] || (e[8] = (n) => A.value = n.target.value)
            }, [...e[37] || (e[37] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, ns),
            e[39] || (e[39] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          A.value === "agentic" ? (l(), u("label", as, [
            e[40] || (e[40] = s("span", { class: "cx-label" }, "Max rounds", -1)),
            s("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: F.value ?? "",
              onInput: e[9] || (e[9] = (n) => F.value = Number(n.target.value) || null)
            }, null, 40, ls),
            e[41] || (e[41] = s("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : c("", !0)
        ]),
        A.value === "agentic" ? (l(), u("div", us, [
          e[42] || (e[42] = s("span", { class: "cx-label" }, [
            h("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: B.value ? JSON.stringify([B.value]) : "[]",
            onChange: $e
          }, null, 40, os),
          e[43] || (e[43] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : c("", !0),
        A.value !== "agentic" ? (l(), u("label", rs, [
          w(Q, {
            modelValue: y.value,
            "onUpdate:modelValue": e[10] || (e[10] = (n) => y.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[44] || (e[44] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : c("", !0),
        s("label", is, [
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
          }, null, 40, ds),
          e[46] || (e[46] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      Qe.value ? (l(), u("div", cs, [
        s("div", ms, [
          w(S(T), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[47] || (e[47] = s("span", null, "Maintenance", -1))
        ]),
        s("p", vs, [
          e[48] || (e[48] = h(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          ve.value ? (l(), u(j, { key: 0 }, [
            h("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : c("", !0)
        ]),
        S(ge) ? (l(), u("p", ps, b(S(ge)), 1)) : c("", !0),
        s("div", gs, [
          w(Ce, {
            variant: "soft",
            small: "",
            disabled: ne.value || !Y.value.summary_model,
            loading: S(fe)("resummarize"),
            onClick: e[12] || (e[12] = (n) => be("resummarize"))
          }, {
            default: ke(() => [...e[49] || (e[49] = [
              h("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          w(Ce, {
            variant: "soft",
            small: "",
            disabled: ne.value,
            loading: S(fe)("reembed"),
            onClick: e[13] || (e[13] = (n) => be("reembed"))
          }, {
            default: ke(() => [...e[50] || (e[50] = [
              h("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        ae.value.text ? (l(), u("p", {
          key: 1,
          class: H(["cx-maint-status", ae.value.tone])
        }, [
          e[51] || (e[51] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          h(b(ae.value.text), 1)
        ], 2)) : c("", !0),
        le.value.text ? (l(), u("p", {
          key: 2,
          class: H(["cx-maint-status", le.value.tone])
        }, [
          e[52] || (e[52] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          h(b(le.value.text), 1)
        ], 2)) : c("", !0)
      ])) : c("", !0)
    ]));
  }
});
export {
  ks as default
};
//# sourceMappingURL=KbCreateConfig-D7Bs3wOG.js.map
