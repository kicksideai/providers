import { defineComponent as qe, openBlock as l, createElementBlock as r, normalizeClass as X, createElementVNode as t, ref as i, computed as o, watch as oe, onUnmounted as Te, onMounted as He, createVNode as k, unref as w, toDisplayString as y, Fragment as H, renderList as _e, createCommentVNode as c, createTextVNode as x, createBlock as Qe, withDirectives as Ke, vModelText as Xe, withCtx as ke } from "vue";
import { Icon as Q } from "@iconify/vue";
import { api as we, host as Ge, loadByTagName as Se } from "@wippy-fe/proxy";
import { a as Je, u as We } from "./wc-runtime-f54Bo-yJ.js";
import { D as ee, _ as Ce, a as Ye, r as Ze } from "./queryMode-D9gMlIJK.js";
const et = ["disabled", "aria-checked"], K = /* @__PURE__ */ qe({
  __name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(m, { emit: p }) {
    const S = p;
    return (b, v) => (l(), r("button", {
      type: "button",
      class: X(["cx-switch", { on: m.modelValue }]),
      disabled: m.disabled,
      role: "switch",
      "aria-checked": m.modelValue,
      onClick: v[0] || (v[0] = ($) => S("update:modelValue", !m.modelValue))
    }, [...v[1] || (v[1] = [
      t("span", { class: "cx-switch-knob" }, null, -1)
    ])], 10, et));
  }
}), tt = 24, st = 60;
function Ee(m, p) {
  return m.trim().length <= tt && (p || "").trim().length <= st;
}
const Me = 3e3, nt = 3e4, at = { resummarize: "documents", reembed: "nodes" };
function Ve(m, p) {
  return m?.response?.data?.error || m?.message || p;
}
function Ae(m) {
  Ge.handleError(m?.response?.status === 401 ? "auth-expired" : "other", m);
}
function lt(m) {
  const p = i({ resummarize: null, reembed: null }), S = i({ resummarize: !1, reembed: !1 }), b = i({ resummarize: "", reembed: "" }), v = i("");
  function $(a) {
    return S.value[a] || p.value[a]?.in_flight === !0;
  }
  const F = o(() => $("resummarize") || $("reembed"));
  let I = !1, C = 0, h = null;
  function _(a) {
    return !I && a === C;
  }
  function M() {
    h !== null && (clearTimeout(h), h = null);
  }
  function A(a, g) {
    M(), _(a) && (h = setTimeout(() => {
      q(a, g);
    }, g));
  }
  async function q(a, g = Me) {
    M();
    const u = m();
    if (!(!u || !_(a))) {
      try {
        const { data: d } = await we.get(`/api/v1/kb10/${u}/maintenance`);
        if (!_(a)) return;
        if (!d?.success) throw new Error(d?.error || "could not read maintenance status");
        p.value = {
          resummarize: d.resummarize ?? null,
          reembed: d.reembed ?? null
        }, v.value = "";
      } catch (d) {
        if (!_(a)) return;
        v.value = Ve(d, "could not read maintenance status"), Ae(d), A(a, Math.min(g * 2, nt));
        return;
      }
      F.value && A(a, Me);
    }
  }
  function L() {
    const a = ++C;
    M(), p.value = { resummarize: null, reembed: null }, b.value = { resummarize: "", reembed: "" }, v.value = "", m() && q(a);
  }
  async function N(a) {
    const g = m();
    if (!g || F.value) return;
    const u = C;
    S.value = { ...S.value, [a]: !0 }, b.value = { ...b.value, [a]: "" };
    try {
      const { data: d } = await we.post(`/api/v1/kb10/${g}/${a}`);
      if (!_(u)) return;
      if (!d?.success) throw new Error(d?.error || "could not start the run");
      d.run && (p.value = { ...p.value, [a]: d.run });
    } catch (d) {
      if (!_(u)) return;
      b.value = { ...b.value, [a]: Ve(d, "could not start the run") }, Ae(d);
      return;
    } finally {
      _(u) && (S.value = { ...S.value, [a]: !1 });
    }
    q(u);
  }
  function z(a) {
    const g = b.value[a];
    if (g) return { text: g, tone: "err" };
    if (S.value[a]) return { text: "Starting…", tone: "" };
    const u = p.value[a];
    return u ? u.in_flight ? u.status === "scheduled" ? { text: "Scheduled — the run starts shortly", tone: "" } : u.total > 0 ? { text: `${u.scanned} of ${u.total} ${at[a]}…`, tone: "" } : { text: "Running…", tone: "" } : u.stale ? { text: "This run stopped reporting — start it again.", tone: "err" } : u.status === "failed" ? { text: u.last_error || "The run failed.", tone: "err" } : u.status === "succeeded" ? a === "reembed" ? { text: `${u.embedded} vectors re-embedded, ${u.scanned} scanned`, tone: "ok" } : {
      text: `${u.resummarized} summaries regenerated, ${u.chunks_reenriched} chunks re-situated, ${u.documents_skipped} documents skipped, ${u.chunks_failed} chunks failed`,
      tone: "ok"
    } : { text: "", tone: "" } : { text: "", tone: "" };
  }
  return oe(m, L, { immediate: !0 }), Te(() => {
    I = !0, M();
  }), { runs: p, statusError: v, running: $, anyBusy: F, start: N, statusLine: z };
}
const rt = { class: "cx" }, ut = { class: "cx-group" }, ot = { class: "cx-group-h" }, it = { class: "cx-field" }, dt = {
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
}, Ct = { class: "cx-row" }, Et = { class: "cx-field" }, Mt = ["value"], Vt = { class: "cx-field" }, At = ["value"], qt = {
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
}, ls = ["selected"], rs = {
  key: 4,
  class: "cx-toggle"
}, us = { class: "cx-field" }, os = ["value"], is = {
  key: 0,
  class: "cx-group"
}, ds = { class: "cx-group-h" }, cs = { class: "cx-lead" }, ms = {
  key: 0,
  class: "cx-err"
}, vs = { class: "cx-maint-row" }, ps = "class:embed", hs = /* @__PURE__ */ qe({
  __name: "KbCreateConfig",
  setup(m) {
    const p = Je(), S = We(), b = o(() => p.value.config || {}), v = o(() => !!b.value.edit), $ = o(() => v.value && b.value.id || ""), F = o(() => b.value.kb_type || ""), I = o(() => F.value !== "document"), C = i(""), h = i(!0), _ = i(!0), M = i(""), A = i(""), q = i(""), L = i(""), N = i(!1), z = i(ee), a = i({}), g = i(""), u = i(!1), d = i(!1), R = i(!1), G = i(25), te = o(() => b.value.config?.tuning), J = i(""), O = i(null), V = i("built-in"), B = i("");
    function Ne(s) {
      const e = s.detail, n = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      B.value = n[0] || "";
    }
    const W = o(() => {
      const e = b.value.config?.config_schema?.properties;
      return e ? Object.entries(e).map(([n, f]) => ({ key: n, ...f })).sort((n, f) => (n.order ?? 100) - (f.order ?? 100) || n.key.localeCompare(f.key)) : [];
    }), $e = [
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
    ], se = o(() => W.value.filter((s) => !$e.includes(s.key)));
    function P(s, e) {
      const n = W.value.find((f) => f.key === s)?.default;
      return Ze(e, typeof n == "string" ? n : ee);
    }
    const Le = o(() => se.value.filter((s) => s.format === "textarea")), ie = o(() => se.value.filter((s) => s.format !== "textarea")), D = o(() => W.value.find((s) => s.key === "summary_prompt")), E = o(() => W.value.find((s) => s.key === "summary_max_chars")), Re = o(() => {
      const s = E.value;
      return s ? `${s.label || s.key} characters` : "";
    }), Y = o(() => E.value?.minimum ?? 0), ne = o(() => E.value?.maximum), Ie = o(() => {
      const s = E.value?.default;
      return typeof s == "number" ? String(s) : "";
    }), ae = o(() => {
      const s = L.value.trim();
      if (s === "") return null;
      const e = Number(s);
      if (!Number.isInteger(e)) return null;
      const n = ne.value;
      return e < Y.value || n !== void 0 && e > n ? null : e;
    }), de = o(() => {
      if (L.value.trim() === "" || ae.value !== null) return "";
      const e = ne.value;
      return e === void 0 ? `Summary length must be a whole number of ${Y.value} characters or more.` : `Summary length must be a whole number between ${Y.value} and ${e} characters.`;
    });
    function ze() {
      const s = b.value.config || {};
      C.value = b.value.embedding_model || ps, M.value = P("summary_model", s.summary_model), A.value = P("chunk_enrichment_model", s.chunk_enrichment_model), _.value = I.value || !!A.value, h.value = _.value, q.value = typeof s.summary_prompt == "string" ? s.summary_prompt : "", L.value = v.value && typeof s.summary_max_chars == "number" ? String(s.summary_max_chars) : "", N.value = s.embed_images === !0, z.value = typeof s.image_caption_model == "string" && s.image_caption_model ? s.image_caption_model : ee;
      const e = {};
      for (const f of se.value) {
        const T = s[f.key];
        e[f.key] = T !== void 0 ? T : f.default;
      }
      a.value = e, g.value = P("analysis_model", s.analysis_model), u.value = s.enable_reranking === !0, d.value = s.query_strategy === "hyde", R.value = s.self_tuning === !0, G.value = typeof s.self_tuning_query_interval == "number" ? s.self_tuning_query_interval : 25, J.value = typeof s.extra_prompt == "string" ? s.extra_prompt : "";
      const n = Number(s.max_retrieval_iterations);
      O.value = Number.isFinite(n) && n > 0 ? n : null, V.value = s.query_driver === "agentic" ? "agentic" : "built-in", B.value = typeof s.query_agent == "string" ? s.query_agent : "";
    }
    function Be() {
      const s = { ...a.value }, e = h.value !== _.value;
      function n(f, T) {
        return e ? h.value && P(f, T) : T || !1;
      }
      return s.summary_model = n("summary_model", M.value), s.chunk_enrichment_model = n("chunk_enrichment_model", A.value), s.summary_prompt = q.value.trim(), ae.value !== null && (s.summary_max_chars = ae.value), s.embed_images = N.value, (v.value || N.value) && (s.image_caption_model = z.value || ee), Ye(s, g.value), s.query_strategy = d.value ? "hyde" : "plain", s.self_tuning = R.value, (v.value || R.value) && (s.self_tuning_query_interval = G.value), s.enable_reranking = u.value, s.extra_prompt = J.value.trim(), (v.value || V.value === "agentic") && O.value && (s.max_retrieval_iterations = O.value), s.query_driver = V.value, (v.value || V.value === "agentic" && B.value) && (s.query_agent = B.value), s;
    }
    function U(s) {
      const e = s.detail;
      return typeof e == "string" ? e : e && typeof e == "object" && "value" in e ? String(e.value) : "";
    }
    function Pe(s) {
      C.value = U(s);
    }
    function Fe(s) {
      M.value = P("summary_model", U(s));
    }
    function Oe(s) {
      A.value = P("chunk_enrichment_model", U(s));
    }
    function ce(s, e) {
      if (s.type === "integer") {
        const n = Number.parseInt(e, 10);
        a.value[s.key] = Number.isNaN(n) ? void 0 : n;
      } else if (s.type === "number") {
        const n = Number.parseFloat(e);
        a.value[s.key] = Number.isNaN(n) ? void 0 : n;
      } else
        a.value[s.key] = e;
    }
    function me(s) {
      const e = a.value[s];
      return e == null ? "" : String(e);
    }
    const j = o(Be), Z = i({}), ve = o(() => Object.fromEntries(Object.entries(j.value).filter(
      ([s, e]) => !Object.is(e, Z.value[s])
    ))), pe = o(() => Object.keys(ve.value).length > 0 || Object.keys(Z.value).some((s) => !(s in j.value)));
    function ge() {
      S("config-changed", { embedding_model: C.value, config: v.value ? ve.value : j.value });
    }
    const {
      statusError: fe,
      running: be,
      anyBusy: De,
      start: Ue,
      statusLine: ye
    } = lt(() => $.value), je = o(() => !!$.value), le = o(() => De.value || pe.value), re = o(() => ye("resummarize")), ue = o(() => ye("reembed"));
    function xe(s) {
      le.value || Ue(s);
    }
    function he() {
      ze(), Z.value = j.value, ge();
    }
    return oe(() => p.value.config, he), oe([C, j], ge), He(() => {
      Se("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Se("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), he();
    }), (s, e) => (l(), r("div", rt, [
      t("div", ut, [
        t("div", ot, [
          k(w(Q), {
            icon: "tabler:vector",
            "aria-hidden": "true"
          }),
          e[15] || (e[15] = t("span", null, "Indexing", -1))
        ]),
        e[31] || (e[31] = t("p", { class: "cx-lead" }, "How documents are turned into vectors when they enter this knowledge base.", -1)),
        t("div", it, [
          e[17] || (e[17] = t("span", { class: "cx-label" }, "Embedding model", -1)),
          v.value ? (l(), r("div", dt, [
            k(w(Q), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            t("span", ct, y(C.value || "—"), 1),
            e[16] || (e[16] = t("span", { class: "st-hint" }, "fixed after creation", -1))
          ])) : (l(), r("wc-model-picker", {
            key: 1,
            value: C.value,
            capability: "embed",
            onSelect: Pe
          }, null, 40, mt)),
          e[18] || (e[18] = t("p", { class: "st-hint" }, "Documents are embedded with this model so they can be retrieved by meaning.", -1))
        ]),
        ie.value.length ? (l(), r("div", vt, [
          (l(!0), r(H, null, _e(ie.value, (n) => (l(), r("label", {
            key: n.key,
            class: X(["cx-field", { "cx-span": !w(Ee)(n.label || n.key, n.description) }])
          }, [
            t("span", pt, y(n.label || n.key), 1),
            t("input", {
              class: "cx-input",
              type: n.type === "integer" || n.type === "number" ? "number" : "text",
              min: n.minimum,
              max: n.maximum,
              step: n.type === "integer" ? 1 : void 0,
              value: me(n.key),
              onInput: (f) => ce(n, f.target.value)
            }, null, 40, gt),
            n.description ? (l(), r("p", ft, y(n.description), 1)) : c("", !0)
          ], 2))), 128))
        ])) : c("", !0),
        (l(!0), r(H, null, _e(Le.value, (n) => (l(), r("label", {
          key: n.key,
          class: "cx-field"
        }, [
          t("span", bt, y(n.label || n.key), 1),
          t("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: String(me(n.key) ?? ""),
            onInput: (f) => ce(n, f.target.value)
          }, null, 40, yt),
          n.description ? (l(), r("p", xt, y(n.description), 1)) : c("", !0)
        ]))), 128)),
        t("div", ht, [
          t("div", _t, [
            t("span", kt, [
              e[20] || (e[20] = t("span", { class: "cx-label" }, "Contextual embedding", -1)),
              t("span", wt, [
                e[19] || (e[19] = x(" Adds a short document summary and per-chunk context before embedding, so retrieval understands each chunk in the context of its whole document. ", -1)),
                I.value ? (l(), r(H, { key: 0 }, [
                  x(" Required — the concept graph is built from these models.")
                ], 64)) : c("", !0)
              ])
            ]),
            I.value ? (l(), r("span", St, "Required")) : (l(), Qe(K, {
              key: 0,
              modelValue: h.value,
              "onUpdate:modelValue": e[0] || (e[0] = (n) => h.value = n),
              "aria-label": "Contextual embedding"
            }, null, 8, ["modelValue"]))
          ]),
          h.value ? (l(), r(H, { key: 0 }, [
            t("div", Ct, [
              t("div", Et, [
                e[21] || (e[21] = t("span", { class: "cx-label" }, "Summary model", -1)),
                t("wc-model-picker", {
                  value: M.value,
                  capability: "generate",
                  onSelect: Fe
                }, null, 40, Mt),
                e[22] || (e[22] = t("p", { class: "st-hint" }, "Summarises each document before chunking.", -1))
              ]),
              t("div", Vt, [
                e[23] || (e[23] = t("span", { class: "cx-label" }, "Chunk enrichment model", -1)),
                t("wc-model-picker", {
                  value: A.value,
                  capability: "generate",
                  onSelect: Oe
                }, null, 40, At),
                e[24] || (e[24] = t("p", { class: "st-hint" }, "Adds context to each chunk.", -1))
              ])
            ]),
            D.value ? (l(), r("label", qt, [
              t("span", Nt, [
                x(y(D.value.label || D.value.key) + " ", 1),
                e[25] || (e[25] = t("span", { class: "cx-opt" }, "optional", -1))
              ]),
              t("textarea", {
                class: "cx-input cx-textarea",
                rows: "3",
                value: q.value,
                placeholder: "e.g. Lead with the customer's stated goal, then the decisions and dates.",
                onInput: e[1] || (e[1] = (n) => q.value = n.target.value)
              }, null, 40, $t),
              D.value.description ? (l(), r("p", Lt, y(D.value.description), 1)) : c("", !0)
            ])) : c("", !0),
            E.value ? (l(), r("div", Rt, [
              t("label", {
                class: X(["cx-field", { "cx-span": !w(Ee)(Re.value, E.value.description) }])
              }, [
                t("span", It, [
                  x(y(E.value.label || E.value.key) + " ", 1),
                  e[26] || (e[26] = t("span", { class: "cx-opt" }, "characters", -1))
                ]),
                t("input", {
                  class: "cx-input",
                  type: "number",
                  min: Y.value,
                  max: ne.value,
                  placeholder: Ie.value,
                  value: L.value,
                  onInput: e[2] || (e[2] = (n) => L.value = n.target.value)
                }, null, 40, zt),
                de.value ? (l(), r("p", Bt, y(de.value), 1)) : E.value.description ? (l(), r("p", Pt, y(E.value.description), 1)) : c("", !0)
              ], 2)
            ])) : c("", !0)
          ], 64)) : (l(), r("p", Ft, [
            k(w(Q), {
              icon: "tabler:circle-dot",
              "aria-hidden": "true"
            }),
            e[27] || (e[27] = x("Plain embedding — chunks are embedded as-is.", -1))
          ]))
        ]),
        t("div", Ot, [
          t("div", Dt, [
            e[28] || (e[28] = t("span", { class: "cx-sub-t" }, [
              t("span", { class: "cx-label" }, "Embed images"),
              t("span", { class: "st-hint" }, " Captions diagrams and figures from your documents and embeds them alongside the text, so a search returns the relevant image as well as the prose around it. ")
            ], -1)),
            k(K, {
              modelValue: N.value,
              "onUpdate:modelValue": e[3] || (e[3] = (n) => N.value = n),
              "aria-label": "Embed images"
            }, null, 8, ["modelValue"])
          ]),
          N.value ? (l(), r("div", Ut, [
            e[29] || (e[29] = t("span", { class: "cx-label" }, "Caption model", -1)),
            t("wc-model-picker", {
              value: z.value,
              capability: "vision",
              onSelect: e[4] || (e[4] = (n) => z.value = U(n))
            }, null, 40, jt),
            e[30] || (e[30] = t("p", { class: "st-hint" }, "Describes each image in the context of its section.", -1))
          ])) : c("", !0)
        ])
      ]),
      t("div", Tt, [
        t("div", Ht, [
          k(w(Q), {
            icon: "tabler:message-2",
            "aria-hidden": "true"
          }),
          e[32] || (e[32] = t("span", null, "Ask", -1))
        ]),
        e[49] || (e[49] = t("p", { class: "cx-lead" }, "How this knowledge base answers questions on the Ask tab.", -1)),
        t("div", Qt, [
          e[33] || (e[33] = t("span", { class: "cx-label" }, "Answer model", -1)),
          t("wc-model-picker", {
            value: g.value,
            capability: "generate",
            onSelect: e[5] || (e[5] = (n) => g.value = U(n))
          }, null, 40, Kt),
          e[34] || (e[34] = t("p", { class: "st-hint" }, "Reads the retrieved passages and writes the answer. Leave empty to return passages only — plain vector search, no generated answer.", -1))
        ]),
        t("label", Xt, [
          k(K, {
            modelValue: d.value,
            "onUpdate:modelValue": e[6] || (e[6] = (n) => d.value = n),
            "aria-label": "Hypothetical answer retrieval"
          }, null, 8, ["modelValue"]),
          e[35] || (e[35] = t("span", null, [
            t("span", { class: "cx-label" }, "Hypothetical answer retrieval"),
            t("span", { class: "st-hint" }, "Generates a short hypothetical answer with the selected answer model before embedding each question. Off uses the raw question.")
          ], -1))
        ]),
        t("label", Gt, [
          k(K, {
            modelValue: R.value,
            "onUpdate:modelValue": e[7] || (e[7] = (n) => R.value = n),
            "aria-label": "Autonomous retrieval tuning"
          }, null, 8, ["modelValue"]),
          e[36] || (e[36] = t("span", null, [
            t("span", { class: "cx-label" }, "Autonomous retrieval tuning"),
            t("span", { class: "st-hint" }, "Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.")
          ], -1))
        ]),
        te.value?.applied_at ? (l(), r("p", Jt, "Last tuning: " + y(te.value.applied_at) + ". " + y(te.value.rationale), 1)) : c("", !0),
        (d.value || R.value) && !g.value ? (l(), r("p", Wt, "Select an answer model for retrieval optimization.")) : c("", !0),
        R.value ? (l(), r("label", Yt, [
          e[37] || (e[37] = t("span", { class: "cx-label" }, "Tuning interval", -1)),
          Ke(t("input", {
            class: "cx-input",
            type: "number",
            min: "5",
            max: "500",
            step: "1",
            "onUpdate:modelValue": e[8] || (e[8] = (n) => G.value = n)
          }, null, 512), [
            [
              Xe,
              G.value,
              void 0,
              { number: !0 }
            ]
          ]),
          e[38] || (e[38] = t("p", { class: "st-hint" }, "Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.", -1))
        ])) : c("", !0),
        t("div", Zt, [
          t("label", es, [
            e[40] || (e[40] = t("span", { class: "cx-label" }, "Mode", -1)),
            t("select", {
              class: "cx-input",
              value: V.value,
              onChange: e[9] || (e[9] = (n) => V.value = n.target.value)
            }, [...e[39] || (e[39] = [
              t("option", { value: "built-in" }, "Single-shot", -1),
              t("option", { value: "agentic" }, "Agentic", -1)
            ])], 40, ts),
            e[41] || (e[41] = t("p", { class: "st-hint" }, "Single-shot answers in one pass. Agentic works in rounds.", -1))
          ]),
          V.value === "agentic" ? (l(), r("label", ss, [
            e[42] || (e[42] = t("span", { class: "cx-label" }, "Max rounds", -1)),
            t("input", {
              class: "cx-input",
              type: "number",
              min: "1",
              max: "40",
              placeholder: "20",
              value: O.value ?? "",
              onInput: e[10] || (e[10] = (n) => O.value = Number(n.target.value) || null)
            }, null, 40, ns),
            e[43] || (e[43] = t("p", { class: "st-hint" }, "Retrieve-and-reason rounds before answering. Default 20.", -1))
          ])) : c("", !0)
        ]),
        V.value === "agentic" ? (l(), r("div", as, [
          e[44] || (e[44] = t("span", { class: "cx-label" }, [
            x("Query agent "),
            t("span", { class: "cx-opt" }, "optional")
          ], -1)),
          t("wc-agent-picker", {
            multi: "false",
            placeholder: "Built-in Q&A agent",
            selected: B.value ? JSON.stringify([B.value]) : "[]",
            onChange: Ne
          }, null, 40, ls),
          e[45] || (e[45] = t("p", { class: "st-hint" }, "Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&A agent.", -1))
        ])) : c("", !0),
        V.value !== "agentic" ? (l(), r("label", rs, [
          k(K, {
            modelValue: u.value,
            "onUpdate:modelValue": e[11] || (e[11] = (n) => u.value = n),
            "aria-label": "Rerank results"
          }, null, 8, ["modelValue"]),
          e[46] || (e[46] = t("span", null, [
            t("span", { class: "cx-label" }, "Rerank results"),
            t("span", { class: "st-hint" }, "A second LLM pass re-orders retrieved passages by relevance before answering.")
          ], -1))
        ])) : c("", !0),
        t("label", us, [
          e[47] || (e[47] = t("span", { class: "cx-label" }, [
            x("Instructions "),
            t("span", { class: "cx-opt" }, "optional")
          ], -1)),
          t("textarea", {
            class: "cx-input cx-textarea",
            rows: "3",
            value: J.value,
            placeholder: "e.g. Always check the Architecture Overview doc before answering.",
            onInput: e[12] || (e[12] = (n) => J.value = n.target.value)
          }, null, 40, os),
          e[48] || (e[48] = t("p", { class: "st-hint" }, "Standing guidance applied to retrieval and answering on every question.", -1))
        ])
      ]),
      je.value ? (l(), r("div", is, [
        t("div", ds, [
          k(w(Q), {
            icon: "tabler:refresh",
            "aria-hidden": "true"
          }),
          e[50] || (e[50] = t("span", null, "Maintenance", -1))
        ]),
        t("p", cs, [
          e[51] || (e[51] = x(" Rewrite the summaries or vectors this knowledge base already holds, under its saved settings. ", -1)),
          pe.value ? (l(), r(H, { key: 0 }, [
            x("Save your changes first — a run uses the saved settings, not the ones in this form.")
          ], 64)) : c("", !0)
        ]),
        w(fe) ? (l(), r("p", ms, y(w(fe)), 1)) : c("", !0),
        t("div", vs, [
          k(Ce, {
            variant: "soft",
            small: "",
            disabled: le.value || !Z.value.summary_model,
            loading: w(be)("resummarize"),
            onClick: e[13] || (e[13] = (n) => xe("resummarize"))
          }, {
            default: ke(() => [...e[52] || (e[52] = [
              x("Regenerate summaries", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"]),
          k(Ce, {
            variant: "soft",
            small: "",
            disabled: le.value,
            loading: w(be)("reembed"),
            onClick: e[14] || (e[14] = (n) => xe("reembed"))
          }, {
            default: ke(() => [...e[53] || (e[53] = [
              x("Re-embed vectors", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        re.value.text ? (l(), r("p", {
          key: 1,
          class: X(["cx-maint-status", re.value.tone])
        }, [
          e[54] || (e[54] = t("span", { class: "cx-maint-what" }, "Summaries", -1)),
          x(y(re.value.text), 1)
        ], 2)) : c("", !0),
        ue.value.text ? (l(), r("p", {
          key: 2,
          class: X(["cx-maint-status", ue.value.tone])
        }, [
          e[55] || (e[55] = t("span", { class: "cx-maint-what" }, "Vectors", -1)),
          x(y(ue.value.text), 1)
        ], 2)) : c("", !0)
      ])) : c("", !0)
    ]));
  }
});
export {
  hs as default
};
//# sourceMappingURL=KbCreateConfig-ImZ_17vm.js.map
