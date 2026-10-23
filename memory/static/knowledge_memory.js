import { u as Q, a as X, W as Y } from "./index-CyCydJaQ.js";
import { defineComponent as Z, ref as r, computed as T, watch as ee, onMounted as te, openBlock as f, createElementBlock as y, createElementVNode as o, toDisplayString as oe, withDirectives as d, vModelCheckbox as K, createTextVNode as p, vModelText as x } from "vue";
import { loadByTagName as D, define as le } from "@wippy-fe/proxy";
import "@iconify/vue";
function w(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function P(a) {
  return Array.isArray(a) && a.every((t) => typeof t == "string");
}
function M(a) {
  return typeof a == "string" ? a : void 0;
}
function C(a) {
  return typeof a == "number" && Number.isFinite(a) ? a : void 0;
}
const ne = { class: "km" }, ae = { class: "field" }, ie = { "data-kb-picker": "" }, re = ["config"], se = ["value"], ce = { class: "hint" }, de = { class: "switches" }, pe = { class: "check" }, ue = { class: "check" }, me = { class: "row" }, _e = { class: "field" }, ke = { class: "field" }, ve = { "data-model-picker": "" }, he = ["value"], ge = ["value"], be = { style: { display: "grid", gap: "10px", "margin-top": "10px" } }, fe = { class: "field" }, ye = { class: "field" }, xe = {
  class: "row",
  style: { "margin-top": "10px" }
}, we = { class: "field" }, Ce = { class: "field" }, Se = /* @__PURE__ */ Z({
  __name: "legacy-memory",
  setup(a) {
    const t = {
      read_enabled: !0,
      write_enabled: !0,
      token_threshold: 64e3,
      checkpoint_model: "class:fast",
      checkpoint_prompt: "",
      recall_prompt: "",
      recall_limit: 5,
      recall_max_chars: 4e3
    }, j = Q(), L = X(), E = r({}), S = r({}), c = r([]), m = r(t.read_enabled), _ = r(t.write_enabled), k = r(String(t.token_threshold)), u = r(t.checkpoint_model), v = r(t.checkpoint_prompt), h = r(t.recall_prompt), g = r(String(t.recall_limit)), b = r(String(t.recall_max_chars)), U = r(!1), N = r(!1), B = T(() => JSON.stringify({ kb_ids: c.value })), A = T(() => u.value || t.checkpoint_model), O = T(
      () => c.value.length ? `${c.value.length} selected; the first selected base is the write target.` : "Select a knowledge base to enable recall and optional writes."
    );
    function V(l, e) {
      const n = Number(l);
      return Number.isFinite(n) && n > 0 ? n : e;
    }
    function R(l) {
      if (l == null || l === "") return;
      let e;
      if (typeof l == "string")
        try {
          e = JSON.parse(l);
        } catch {
          z();
          return;
        }
      else if (typeof l == "object")
        e = l;
      else
        return;
      if (!w(e)) return;
      const n = w(e.context) ? e.context : {}, i = { ...n, ...e }, F = w(e.agent_options) ? e.agent_options : {}, I = w(F.checkpoint) ? F.checkpoint : {}, { context: Ie, agent_options: Te, ...G } = e;
      E.value = { ...n, ...G }, S.value = { ...I }, c.value = P(i.kb_ids) ? i.kb_ids : typeof i.kb_id == "string" && i.kb_id ? [i.kb_id] : [], m.value = i.read_enabled !== !1, _.value = i.write_enabled !== !1, u.value = M(i.checkpoint_model) || M(I.model) || t.checkpoint_model, v.value = M(i.checkpoint_prompt) || "", h.value = M(i.recall_prompt) || "", k.value = String(C(I.token_threshold) ?? C(i.token_threshold) ?? t.token_threshold), g.value = String(C(i.recall_limit) || t.recall_limit), b.value = String(C(i.recall_max_chars) || t.recall_max_chars);
    }
    function z() {
      E.value = {}, S.value = {}, c.value = [], m.value = t.read_enabled, _.value = t.write_enabled, k.value = String(t.token_threshold), u.value = t.checkpoint_model, v.value = t.checkpoint_prompt, h.value = t.recall_prompt, g.value = String(t.recall_limit), b.value = String(t.recall_max_chars);
    }
    function J() {
      const l = u.value || t.checkpoint_model, e = {
        ...E.value,
        kb_ids: [...c.value],
        read_enabled: m.value,
        write_enabled: _.value,
        checkpoint_model: l,
        checkpoint_prompt: v.value,
        recall_prompt: h.value,
        recall_limit: V(g.value, t.recall_limit),
        recall_max_chars: V(b.value, t.recall_max_chars)
      };
      return {
        context: e,
        agent_options: {
          checkpoint: {
            ...S.value,
            token_threshold: V(k.value, t.token_threshold),
            model: e.checkpoint_model,
            max_tokens: C(S.value.max_tokens) ?? 1e3
          }
        }
      };
    }
    function s() {
      L("config-changed", J());
    }
    function H(l) {
      const e = l instanceof CustomEvent ? l.detail : void 0;
      c.value = w(e) && P(e.kb_ids) ? e.kb_ids : [], s();
    }
    function W(l) {
      if (!(l.target instanceof HTMLInputElement)) return;
      const e = l.target.value;
      c.value = e ? [e] : [], s();
    }
    function $(l) {
      const e = l instanceof CustomEvent ? l.detail : void 0;
      u.value = typeof e == "string" && e || t.checkpoint_model, s();
    }
    function q(l) {
      if (!(l.target instanceof HTMLInputElement)) return;
      const e = l.target.value;
      u.value = e || t.checkpoint_model, s();
    }
    return ee(() => j.value.config, R, { immediate: !0, deep: !0 }), te(async () => {
      try {
        customElements.get("wc-kb-picker") || await D("wc-kb-picker", { timeoutMs: 8e3 });
      } catch {
        U.value = !0;
      }
      try {
        customElements.get("wc-model-picker") || await D("wc-model-picker", { timeoutMs: 8e3 });
      } catch {
        N.value = !0;
      }
    }), (l, e) => (f(), y("div", ne, [
      o("div", ae, [
        e[7] || (e[7] = o("span", { id: "legacy_memory_kbs" }, "Memory knowledge bases", -1)),
        o("div", ie, [
          U.value ? (f(), y("input", {
            key: 1,
            "aria-label": "Memory knowledge base ID",
            name: "kb_id_fallback",
            placeholder: "Knowledge base id",
            value: c.value[0] || "",
            onInput: W
          }, null, 40, se)) : (f(), y("wc-kb-picker", {
            key: 0,
            "aria-labelledby": "legacy_memory_kbs",
            config: B.value,
            onConfigChanged: H
          }, null, 40, re))
        ]),
        o("span", ce, oe(O.value), 1)
      ]),
      o("div", de, [
        o("label", pe, [
          d(o("input", {
            name: "read_enabled",
            type: "checkbox",
            "onUpdate:modelValue": e[0] || (e[0] = (n) => m.value = n),
            onChange: s
          }, null, 544), [
            [K, m.value]
          ]),
          e[8] || (e[8] = p(" Inject memory on activation ", -1))
        ]),
        o("label", ue, [
          d(o("input", {
            name: "write_enabled",
            type: "checkbox",
            "onUpdate:modelValue": e[1] || (e[1] = (n) => _.value = n),
            onChange: s
          }, null, 544), [
            [K, _.value]
          ]),
          e[9] || (e[9] = p(" Persist checkpoints to memory ", -1))
        ])
      ]),
      o("div", me, [
        o("label", _e, [
          e[10] || (e[10] = p("Checkpoint after tokens ", -1)),
          d(o("input", {
            name: "token_threshold",
            type: "number",
            min: "200",
            max: "200000",
            step: "100",
            "onUpdate:modelValue": e[2] || (e[2] = (n) => k.value = n),
            onInput: s
          }, null, 544), [
            [x, k.value]
          ])
        ]),
        o("div", ke, [
          e[11] || (e[11] = o("span", { id: "legacy_checkpoint_model" }, "Checkpoint model", -1)),
          o("div", ve, [
            N.value ? (f(), y("input", {
              key: 1,
              "aria-label": "Checkpoint model",
              name: "model_fallback",
              placeholder: "class:fast",
              value: A.value,
              onInput: q
            }, null, 40, ge)) : (f(), y("wc-model-picker", {
              key: 0,
              "aria-labelledby": "legacy_checkpoint_model",
              value: A.value,
              onSelect: $
            }, null, 40, he))
          ])
        ])
      ]),
      o("details", null, [
        e[16] || (e[16] = o("summary", null, "Advanced", -1)),
        o("div", be, [
          o("label", fe, [
            e[12] || (e[12] = p("Memory write instructions ", -1)),
            d(o("textarea", {
              name: "checkpoint_prompt",
              placeholder: "Store relevant details for future conversations. Do not store literal assistant answers.",
              "onUpdate:modelValue": e[3] || (e[3] = (n) => v.value = n),
              onInput: s
            }, null, 544), [
              [x, v.value]
            ])
          ]),
          o("label", ye, [
            e[13] || (e[13] = p("Recall guidance ", -1)),
            d(o("textarea", {
              name: "recall_prompt",
              placeholder: "Long-term memory may be incomplete or inaccurate; use it as advisory context.",
              "onUpdate:modelValue": e[4] || (e[4] = (n) => h.value = n),
              onInput: s
            }, null, 544), [
              [x, h.value]
            ])
          ])
        ]),
        o("div", xe, [
          o("label", we, [
            e[14] || (e[14] = p("Recall results ", -1)),
            d(o("input", {
              name: "recall_limit",
              type: "number",
              min: "1",
              max: "20",
              "onUpdate:modelValue": e[5] || (e[5] = (n) => g.value = n),
              onInput: s
            }, null, 544), [
              [x, g.value]
            ])
          ]),
          o("label", Ce, [
            e[15] || (e[15] = p("Recall budget ", -1)),
            d(o("input", {
              name: "recall_max_chars",
              type: "number",
              min: "500",
              max: "20000",
              step: "500",
              "onUpdate:modelValue": e[6] || (e[6] = (n) => b.value = n),
              onInput: s
            }, null, 544), [
              [x, b.value]
            ])
          ])
        ])
      ])
    ]));
  }
}), Me = ":host{display:block;color:var(--p-text-color, #172033);font:13px/1.4 Inter,system-ui,sans-serif}.km{display:grid;gap:12px}.field{display:grid;gap:6px;font-weight:600}.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:end}.switches{display:flex;flex-wrap:wrap;gap:8px 14px}.check{display:inline-flex;align-items:center;gap:7px;font-weight:600}.check input{width:16px;height:16px;margin:0;accent-color:var(--p-primary-color, #2563eb)}input,textarea{width:100%;box-sizing:border-box;border:1px solid var(--p-content-border-color, #d0d7e2);border-radius:6px;padding:8px 10px;background:var(--p-inputtext-background, #fff);color:inherit;font:inherit}textarea{min-height:78px;resize:vertical}details{border-top:1px solid var(--p-content-border-color, #e2e8f0);padding-top:10px}summary{cursor:pointer;color:var(--p-text-muted-color, #64748b);font-weight:600}.hint{color:var(--p-text-muted-color, #64748b);font-size:12px;font-weight:400}@media(max-width:560px){.row{grid-template-columns:1fr}}", Ee = { type: "object", properties: { config: { type: "object", description: "Existing KB memory context and checkpoint policy." } } };
class Ve extends Y {
  static get wippyConfig() {
    return {
      propsSchema: Ee,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Me
    };
  }
  static get vueConfig() {
    return { rootComponent: Se };
  }
}
le(import.meta.url, Ve);
//# sourceMappingURL=knowledge_memory.js.map
