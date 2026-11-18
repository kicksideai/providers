import { defineComponent as Ve, openBlock as l, createElementBlock as r, normalizeClass as Q, createElementVNode as s, ref as d, computed as i, watch as re, onUnmounted as Te, onMounted as He, createVNode as S, unref as A, toDisplayString as y, Fragment as j, renderList as he, createCommentVNode as v, createTextVNode as _, createBlock as Qe, withDirectives as Ke, vModelText as Xe, withCtx as _e } from "vue";
import { Icon as T } from "@iconify/vue";
import { api as ke, host as Ge, loadByTagName as we } from "@wippy-fe/proxy";
import { a as Je, u as We } from "./wc-runtime-f54Bo-yJ.js";
import { _ as Se } from "./KbButton.vue_vue_type_script_setup_true_lang-tUNGjhRC.js";
const Ye = ["disabled", "aria-checked"], H = /* @__PURE__ */ Ve({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(u, { emit: m }) {
    const x = m;
    return (g, p) => (l(), r("button", {
      type: "button",
      class: Q(["cx-switch", { on: u.modelValue }]),
      disabled: u.disabled,
      role: "switch",
      "aria-checked": u.modelValue,
      onClick: p[0] || (p[0] = ($) => x("update:modelValue", !u.modelValue))
    }, [...p[1] || (p[1] = [
      s("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, Ye));
  }
});
function Ze(u) {
  return typeof u == "string" ? u.trim() : "";
}
function et(u, m) {
  const x = Ze(m);
  if (x) {
    u.retrieval_model = x, u.analysis_model = x;
    return;
  }
  delete u.retrieval_model, u.analysis_model = !1;
}
const K = "class:fast";
function tt(u, m = K) {
  return u == null || u === "" ? m : typeof u == "string" && u.trim() ? u : "";
}
const st = 24, nt = 60;
function Ae(u, m) {
  return u.trim().length <= st && (m || "").trim().length <= nt;
}
const Ce = 3e3, at = 3e4, lt = { resummarize: "documents", reembed: "nodes" };
function Ee(u, m) {
  return u?.response?.data?.error || u?.message || m;
}
function Me(u) {
  Ge.handleError(u?.response?.status === 401 ? "auth-expired" : "other", u);
}
function rt(u) {
  const m = d({ resummarize: null, reembed: null }), x = d({ resummarize: !1, reembed: !1 }), g = d({ resummarize: "", reembed: "" }), p = d("");
  function $(a) {
    return x.value[a] || m.value[a]?.in_flight === !0;
  }
  const z = i(() => $("resummarize") || $("reembed"));
  let I = !1, C = 0, w = null;
  function f(a) {
    return !I && a === C;
  }
  function k() {
    w !== null && (clearTimeout(w), w = null);
  }
  function L(a, b) {
    k(), f(a) && (w = setTimeout(() => {
      M(a, b);
    }, b));
  }
  async function M(a, b = Ce) {
    k();
    const o = u();
    if (!(!o || !f(a))) {
      try {
        const { data: c } = await ke.get(`/api/v1/kb10/${o}/maintenance`);
        if (!f(a)) return;
        if (!c?.success) throw new Error(c?.error || "could not read maintenance status");
        m.value = {
          resummarize: c.resummarize ?? null,
          reembed: c.reembed ?? null
        }, p.value = "";
      } catch (c) {
        if (!f(a)) return;
        p.value = Ee(c, "could not read maintenance status"), Me(c), L(a, Math.min(b * 2, at));
        return;
      }
      z.value && L(a, Ce);
    }
  }
  function q() {
    const a = ++C;
    k(), m.value = { resummarize: null, reembed: null }, g.value = { resummarize: "", reembed: "" }, p.value = "", u() && M(a);
  }
  async function B(a) {
    const b = u();
    if (!b || z.value) return;
    const o = C;
    x.value = { ...x.value, [a]: !0 }, g.value = { ...g.value, [a]: "" };
    try {
      const { data: c } = await ke.post(`/api/v1/kb10/${b}/${a}`);
      if (!f(o)) return;
      if (!c?.success) throw new Error(c?.error || "could not start the run");
      c.run && (m.value = { ...m.value, [a]: c.run });
    } catch (c) {
      if (!f(o)) return;
      g.value = { ...g.value, [a]: Ee(c, "could not start the run") }, Me(c);
      return;
    } finally {
      f(o) && (x.value = { ...x.value, [a]: !1 });
    }
    M(o);
  }
  function N(a) {
    const b = g.value[a];
    if (b) return { text: b, tone: "err" };
    if (x.value[a]) return { text: "Starting…", tone: "" };
    const o = m.value[a];
    return o ? o.in_flight ? o.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : o.total > 0 ? { text: `${o.scanned} of ${o.total} ${lt[a]}…`, tone: "" } : { text: "Running…", tone: "" } : o.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : o.status === "failed" ? { text: o.last_error || "The run failed.", tone: "err" } : o.status === "succeeded" ? a === "reembed" ? { text: `${o.embedded} vectors re-embedded, ${o.scanned} scanned`, tone: "ok" } : {
      text: `${o.resummarized} summaries regenerated, ${o.chunks_reenriched} chunks re-situated, ${o.documents_skipped} documents skipped, ${o.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return re(u, q, { immediate: !0 }), Te(() => {
    I = !0, k();
  }), { runs: m, statusError: p, running: $, anyBusy: z, start: B, statusLine: N };
}
const ut = { class: "cx" }, ot = { class: "cx-group" }, it = { class: "cx-group-h" }, dt = { class: "cx-field" }, ct = {
  key: 0,
  class: "cx-fixed"
}, mt = { class: "cx-fixed-v" }, vt = ["value"], pt = {
  key: 0,
  class: "cx-row"
}, gt = { class: "cx-label" }, ft = ["type", "min", "max", "step", "value", "onInput"], bt = {
  key: 0,
  class: "st-hint"
}, yt = { class: "cx-label" }, xt = ["value", "onInput"], ht = {
  key: 0,
  class: "st-hint"
}, _t = { class: "cx-sub" }, kt = { class: "cx-sub-h" }, wt = { class: "cx-sub-t" }, St = { class: "st-hint" }, At = {
  key: 1,
  class: "cx-req"
}, Ct = { class: "cx-row" }, Et = { class: "cx-field" }, Mt = ["value"], Vt = { class: "cx-field" }, qt = ["value"], Nt = {
  key: 0,
  class: "cx-field"
}, $t = { class: "cx-label" }, Lt = ["value"], Rt = {
  key: 0,
  class: "st-hint"
}, It = {
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
}, Tt = ["value"], Ht = { class: "cx-group" }, Qt = { class: "cx-group-h" }, Kt = { class: "cx-field" }, Xt = ["value"], Gt = {
  key: 0,
  class: "st-hint"
}, Jt = {
  key: 1,
  class: "st-hint"
}, Wt = { class: "cx-toggle" }, Yt = { class: "cx-toggle" }, Zt = {
  key: 0,
  class: "st-hint"
}, es = {
  key: 1,
  class: "cx-field"
}, ts = { class: "cx-row" }, ss = { class: "cx-field" }, ns = ["value"], as = {
  key: 0,
  class: "cx-field"
}, ls = ["value"], rs = {
  key: 2,
  class: "cx-field"
}, us = ["selected"], os = {
  key: 3,
  class: "cx-toggle"
}, is = { class: "cx-field" }, ds = ["value"], cs = {
  key: 0,
  class: "cx-group"
}, ms = { class: "cx-group-h" }, vs = { class: "cx-lead" }, ps = {
  key: 0,
  class: "cx-err"
}, gs = { class: "cx-maint-row" }, fs = "class:embed", ks = /* @__PURE__ */ Ve({
  __name: "KbCreateConfig",
  setup(u) {
    const m = Je(), x = We(), g = i(() => m.value.config || {}), p = i(() => !!g.value.edit), $ = i(() => p.value && g.value.id || ""), z = i(() => g.value.kb_type || ""), I = i(() => z.value !== "document"), C = d(""), w = d(!0), f = d(""), k = d(""), L = d(""), M = d(""), q = d(!1), B = d(K), N = d({}), a = d(""), b = d(!1), o = d(!1), c = d(!1), X = d(25), Z = i(() => g.value.config?.tuning), G = d(""), F = d(null), V = d("built-in"), P = d("");
    function qe(t) {
      const e = t.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      P.value = n[0] || "";
    }
    const J = i(() => {
      const e = g.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, h]) => ({ key: n, ...h })).sort((n, h) => (n.order ?? 100) - (h.order ?? 100) || n.key.localeCompare(h.key)) : [];
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
    ], ee = i(() => J.value.filter((t) => !Ne.includes(t.key)));
    function R(t, e) {
      const n = J.value.find((h) => h.key === t)?.default;
      return tt(e, typeof n == "string" ? n : K);
    }
    const $e = i(() => ee.value.filter((t) => t.format === "textarea")), ue = i(() => ee.value.filter((t) => t.format !== "textarea")), O = i(() => J.value.find((t) => t.key === "summary_prompt")), E = i(() => J.value.find((t) => t.key === "summary_max_chars")), Le = i(() => {
      const t = E.value;
      return t ? `${t.label || t.key} characters` : "";
    }), W = i(() => E.value?.minimum ?? 0), te = i(() => E.value?.maximum), Re = i(() => {
      const t = E.value?.default;
      return typeof t == "number" ? String(t) : "";
    }), se = i(() => {
      const t = M.value.trim();
      if (t === "") return null;
      const e = Number(t);
      if (!Number.isInteger(e)) return null;
      const n = te.value;
      return e < W.value || n !== void 0 && e > n ? null : e;
    }), oe = i(() => {
      if (M.value.trim() === "" || se.value !== null) return "";
      const e = te.value;
      return e === void 0 ? `Summary length must be a whole number of ${W.value} characters or more.` : `Summary length must be a whole number between ${W.value} and ${e} characters.`;
    });
    function Ie() {
      const t = g.value.config || {};
      C.value = g.value.embedding_model || fs, f.value = R("summary_model", t.summary_model), k.value = R("chunk_enrichment_model", t.chunk_enrichment_model), w.value = I.value || !!(f.value || k.value), L.value = typeof t.summary_prompt == "string" ? t.summary_prompt : "", M.value = p.value && typeof t.summary_max_chars == "number" ? String(t.summary_max_chars) : "", q.value = t.embed_images === !0, B.value = typeof t.image_caption_model == "string" && t.image_caption_model ? t.image_caption_model : K;
      const e = {};
      for (const h of ee.value) {
        const xe = t[h.key];
        e[h.key] = xe !== void 0 ? xe : h.default;
      }
      N.value = e, a.value = R("analysis_model", t.analysis_model), b.value = t.enable_reranking === !0, o.value = t.query_strategy === "hyde", c.value = t.self_tuning === !0, X.value = typeof t.self_tuning_query_interval == "number" ? t.self_tuning_query_interval : 25, G.value = typeof t.extra_prompt == "string" ? t.extra_prompt : "";
      const n = Number(t.max_retrieval_iterations);
      F.value = Number.isFinite(n) && n > 0 ? n : null, V.value = t.query_driver === "agentic" ? "agentic" : "built-in", P.value = typeof t.query_agent == "string" ? t.query_agent : "";
    }
    function Be() {
      const t = { ...N.value };
      return t.summary_model = w.value && (f.value || !1), t.chunk_enrichment_model = w.value && (k.value || !1), t.summary_prompt = L.value.trim(), se.value !== null && (t.summary_max_chars = se.value), t.embed_images = q.value, (p.value || q.value) && (t.image_caption_model = B.value || K), et(t, a.value), t.query_strategy = o.value ? "hyde" : "plain", t.self_tuning = c.value, (p.value || c.value) && (t.self_tuning_query_interval = X.value), t.enable_reranking = b.value, t.extra_prompt = G.value.trim(), (p.value || V.value === "agentic") && F.value && (t.max_retrieval_iterations = F.value), t.query_driver = V.value, (p.value || V.value === "agentic" && P.value) && (t.query_agent = P.value), t;
    }
    function D(t) {
      const e = t.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Pe(t) {
      C.value = D(t);
    }
    function ze(t) {
      f.value = R("summary_model", D(t));
    }
    function Fe(t) {
      k.value = R("chunk_enrichment_model", D(t));
    }
    function Oe(t) {
      t && !f.value && !k.value && (f.value = R("summary_model", void 0), k.value = R("chunk_enrichment_model", void 0)), w.value = t;
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
    const U = i(Be), Y = d({}), ce = i(() => Object.fromEntries(Object.entries(U.value).filter(
      ([t, e]) => !Object.is(e, Y.value[t])
    ))), me = i(() => Object.keys(ce.value).length > 0 || Object.keys(Y.value).some((t) => !(t in U.value)));
    function ve() {
      x("config-changed", { embedding_model: C.value, config: p.value ? ce.value : U.value });
    }
    const {
      statusError: pe,
      running: ge,
      anyBusy: De,
      start: Ue,
      statusLine: fe
    } = rt(() => $.value), je = i(() => !!$.value), ne = i(() => De.value || me.value), ae = i(() => fe("resummarize")), le = i(() => fe("reembed"));
    function be(t) {
      ne.value || Ue(t);
    }
    function ye() {
      Ie(), Y.value = U.value, ve();
    }
    return re(() => m.value.config, ye), re([C, U], ve), He(() => {
      we("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), we("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), ye();
    }), (t, e) => (l(), r("div", ut, [
      s("div", ot, [
        s("div", it, [
          S(A(T), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[14] || (e[14] = s("span", null, "Indexing", -1))
        ]),
        e[30] || (e[30] = s("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        s("div", dt, [
          e[16] || (e[16] = s("span", { class: "cx-label" }, "Embedding model", -1)),
          p.value ? (l(), r("div", ct, [
            S(A(T), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            s("span", mt, y(C.value || "—"), 1),
            e[15] || (e[15] = s("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: C.value,
            capability: "embed",
            onSelect: Pe
          }, null, 40, vt)),
          e[17] || (e[17] = s("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        ue.value.length ? (l(), r("div", pt, [
          (l(!0), r(j, null, he(ue.value, (n) => (l(), r("label", {
            key: n.key,
            class: Q(["cx-field", { "cx-span": !A(Ae)(n.label || n.key, n.description) }])
          }, [
            s("span", gt, y(n.label || n.key), 1),
            s("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: de(n.key),
              onInput: (h) => ie(n, h.target.value)
            }, null, 40, ft),
            n.description ? (l(), r("p", bt, y(n.description), 1)) : v("", !0)
          ], 2))), 128))
        ])) : v("", !0),
        (l(!0), r(j, null, he($e.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          s("span", yt, y(n.label || n.key), 1),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(de(n.key) ?? ""),
            onInput: (h) => ie(n, h.target.value)
          }, null, 40, xt),
          n.description ? (l(), r("p", ht, y(n.description), 1)) : v("", !0)
        ]))), 128)),
        s("div", _t, [
          s("div", kt, [
            s("span", wt, [
              e[19] || (e[19] = s("span", { class: "cx-label" }, "Contextual embedding", -1)),
              s("span", St, [
                e[18] || (e[18] = _(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                I.value ? (l(), r(j, { key: 0 }, [
                  _(" Required — the concept graph is built from these models.")
                ], 64)) : v("", !0)
              ])
            ]),
            I.value ? (l(), r("span", At, "Required")) : (l(), Qe(H, {
              key: 0,
              "model-value": w.value,
              "onUpdate:modelValue": Oe,
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
                  onSelect: ze
                }, null, 40, Mt),
                e[21] || (e[21] = s("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              s("div", Vt, [
                e[22] || (e[22] = s("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                s("wc-model-picker", {
                  value: k.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, qt),
                e[23] || (e[23] = s("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            O.value ? (l(), r("label", Nt, [
              s("span", $t, [
                _(y(O.value.label || O.value.key) + " ", 1),
                e[24] || (e[24] = s("span", { class: "cx-opt" }, "optional", -1))
              ]),
              s("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: L.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[0] || (e[0] = (n) => L.value = n.target.value)
              }, null, 40, Lt),
              O.value.description ? (l(), r("p", Rt, y(O.value.description), 1)) : v("", !0)
            ])) : v("", !0),
            E.value ? (l(), r("div", It, [
              s("label", {
                class: Q(["cx-field", { "cx-span": !A(Ae)(Le.value, E.value.description) }])
              }, [
                s("span", Bt, [
                  _(y(E.value.label || E.value.key) + " ", 1),
                  e[25] || (e[25] = s("span", { class: "cx-opt" }, "characters", -1))
                ]),
                s("input", {
                  class: "cx-input",
                  type: "number",
                  min: W.value,
                  max: te.value,
                  placeholder: Re.value,
                  value: M.value,
                  onInput: e[1] || (e[1] = (n) => M.value = n.target.value)
                }, null, 40, Pt),
                oe.value ? (l(), r("p", zt, y(oe.value), 1)) : E.value.description ? (l(), r("p", Ft, y(E.value.description), 1)) : v("", !0)
              ], 2)
            ])) : v("", !0)
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
            S(H, {
              modelValue: q.value,
              "onUpdate:modelValue": e[2] || (e[2] = (n) => q.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          q.value ? (l(), r("div", jt, [
            e[28] || (e[28] = s("span", { class: "cx-label" }, "Caption model", -1)),
            s("wc-model-picker", {
              value: B.value,
              capability: "vision",
              onSelect: e[3] || (e[3] = (n) => B.value = D(n))
            }, null, 40, Tt),
            e[29] || (e[29] = s("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : v("", !0)
        ])
      ]),
      s("div", Ht, [
        s("div", Qt, [
          S(A(T), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[31] || (e[31] = s("span", null, "Ask", -1))
        ]),
        e[47] || (e[47] = s("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        s("div", Kt, [
          e[32] || (e[32] = s("span", { class: "cx-label" }, "Answer model", -1)),
          s("wc-model-picker", {
            value: a.value,
            capability: "generate",
            onSelect: e[4] || (e[4] = (n) => a.value = D(n))
          }, null, 40, Xt),
          a.value ? (l(), r("p", Gt, "Reads the retrieved passages and writes the answer. Unset models use Fast.")) : (l(), r("p", Jt, "Answers are disabled. Ask returns matching passages."))
        ]),
        s("label", Wt, [
          S(H, {
            modelValue: o.value,
            "onUpdate:modelValue": e[5] || (e[5] = (n) => o.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[33] || (e[33] = s("span", null, [
            s("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            s("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        s("label", Yt, [
          S(H, {
            modelValue: c.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => c.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[34] || (e[34] = s("span", null, [
            s("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            s("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        Z.value?.applied_at ? (l(), r("p", Zt, "Last tuning: " + y(Z.value.applied_at) + ". " + y(Z.value.rationale), 1)) : v("", !0),
        c.value ? (l(), r("label", es, [
          e[35] || (e[35] = s("span", { class: "cx-label" }, "Tuning interval", -1)),
          Ke(s("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[7] || (e[7] = (n) => X.value = n)
          }, null, 512), [
            [
              Xe,
              X.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[36] || (e[36] = s("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : v("", !0),
        s("div", ts, [
          s("label", ss, [
            e[38] || (e[38] = s("span", { class: "cx-label" }, "Mode", -1)),
            s("select", {
              class: "cx-input",
              value: V.value,
              onChange: e[8] || (e[8] = (n) => V.value = n.target.value)
            }, [...e[37] || (e[37] = [
              s("option", { value: "built-in" }, "Single-shot", -1),
              s("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, ns),
            e[39] || (e[39] = s("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          V.value === "agentic" ? (l(), r("label", as, [
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
          ])) : v("", !0)
        ]),
        V.value === "agentic" ? (l(), r("div", rs, [
          e[42] || (e[42] = s("span", { class: "cx-label" }, [
            _("Query agent "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: P.value ? JSON.stringify([P.value]) : "[]",
            onChange: qe
          }, null, 40, us),
          e[43] || (e[43] = s("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : v("", !0),
        V.value !== "agentic" ? (l(), r("label", os, [
          S(H, {
            modelValue: b.value,
            "onUpdate:modelValue": e[10] || (e[10] = (n) => b.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[44] || (e[44] = s("span", null, [
            s("span", { class: "cx-label" }, "Rerank results"),
            s("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : v("", !0),
        s("label", is, [
          e[45] || (e[45] = s("span", { class: "cx-label" }, [
            _("Instructions "),
            s("span", { class: "cx-opt" }, "optional")
          ], -1)),
          s("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: G.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[11] || (e[11] = (n) => G.value = n.target.value)
          }, null, 40, ds),
          e[46] || (e[46] = s("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      je.value ? (l(), r("div", cs, [
        s("div", ms, [
          S(A(T), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[48] || (e[48] = s("span", null, "Maintenance", -1))
        ]),
        s("p", vs, [
          e[49] || (e[49] = _(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          me.value ? (l(), r(j, { key: 0 }, [
            _("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : v("", !0)
        ]),
        A(pe) ? (l(), r("p", ps, y(A(pe)), 1)) : v("", !0),
        s("div", gs, [
          S(Se, {
            variant: "soft",
            small: "",
            disabled: ne.value || !Y.value.summary_model,
            loading: A(ge)("resummarize"),
            onClick: e[12] || (e[12] = (n) => be("resummarize"))
          }, {
            default: _e(() => [...e[50] || (e[50] = [
              _("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          S(Se, {
            variant: "soft",
            small: "",
            disabled: ne.value,
            loading: A(ge)("reembed"),
            onClick: e[13] || (e[13] = (n) => be("reembed"))
          }, {
            default: _e(() => [...e[51] || (e[51] = [
              _("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        ae.value.text ? (l(), r("p", {
          key: 1,
          class: Q(["cx-maint-status", ae.value.tone])
        }, [
          e[52] || (e[52] = s("span", { class: "cx-maint-what" }, "Summaries", -1)),
          _(y(ae.value.text), 1)
        ], 2)) : v("", !0),
        le.value.text ? (l(), r("p", {
          key: 2,
          class: Q(["cx-maint-status", le.value.tone])
        }, [
          e[53] || (e[53] = s("span", { class: "cx-maint-what" }, "Vectors", -1)),
          _(y(le.value.text), 1)
        ], 2)) : v("", !0)
      ])) : v("", !0)
    ]));
  }
});
export {
  ks as default
};
//# sourceMappingURL=KbCreateConfig-D-c3eGCM.js.map
