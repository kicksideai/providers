import { defineComponent as Y, ref as s, computed as U, watch as Z, onMounted as ee, openBlock as u, createElementBlock as p, createElementVNode as t, toDisplayString as te, withDirectives as m, vModelCheckbox as P, createTextVNode as _, vModelText as C } from "vue";
import "@iconify/vue";
import { loadByTagName as j, define as oe } from "@wippy-fe/proxy";
import { u as le, a as ne, m as ae } from "./element-Cn2qOarc.js";
function v(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function A(a) {
  return Array.isArray(a) && a.every((o) => typeof o == "string");
}
function S(a) {
  return typeof a == "string" ? a : void 0;
}
function M(a) {
  return typeof a == "number" && Number.isFinite(a) ? a : void 0;
}
const ie = { class: "km" }, se = { class: "field" }, re = ["config"], ce = {
  key: 1,
  role: "alert"
}, de = { class: "field" }, ue = { "data-kb-picker": "" }, pe = ["config"], me = ["value"], _e = { class: "hint" }, ke = { class: "switches" }, ve = { class: "check" }, be = { class: "check" }, ye = { class: "row" }, he = { class: "field" }, fe = { class: "field" }, ge = { "data-model-picker": "" }, we = ["value"], xe = ["value"], Ce = { style: { display: "grid", gap: "10px", "margin-top": "10px" } }, Se = { class: "field" }, Me = { class: "field" }, Ee = {
  class: "row",
  style: { "margin-top": "10px" }
}, Ie = { class: "field" }, Ve = { class: "field" }, Te = /* @__PURE__ */ Y({
  __name: "knowledge-memory",
  setup(a) {
    const o = {
      read_enabled: !0,
      write_enabled: !0,
      token_threshold: 64e3,
      checkpoint_model: "class:fast",
      checkpoint_prompt: "",
      recall_prompt: "",
      recall_limit: 5,
      recall_max_chars: 4e3
    }, K = le(), O = ne(), E = s({}), I = s({}), c = s([]), d = s(""), b = s(o.read_enabled), y = s(o.write_enabled), h = s(String(o.token_threshold)), k = s(o.checkpoint_model), f = s(o.checkpoint_prompt), g = s(o.recall_prompt), w = s(String(o.recall_limit)), x = s(String(o.recall_max_chars)), V = s(!1), D = s(!1), J = U(() => JSON.stringify({ kb_ids: c.value })), F = U(() => k.value || o.checkpoint_model), R = U(
      () => c.value.length ? `${c.value.length} selected; the first selected base is the write target.` : "Select a knowledge base to enable recall and optional writes."
    );
    function T(l, e) {
      const n = Number(l);
      return Number.isFinite(n) && n > 0 ? n : e;
    }
    function B(l) {
      if (l == null || l === "") return;
      let e;
      if (typeof l == "string")
        try {
          e = JSON.parse(l);
        } catch {
          H();
          return;
        }
      else if (typeof l == "object")
        e = l;
      else
        return;
      if (!v(e)) return;
      const n = v(e.context) ? e.context : {}, i = { ...n, ...e }, L = v(e.agent_options) ? e.agent_options : {}, N = v(L.checkpoint) ? L.checkpoint : {}, { context: De, agent_options: Fe, ...X } = e;
      E.value = { ...n, ...X }, I.value = { ...N }, d.value = S(i.memory_id) || "", c.value = A(i.kb_ids) ? i.kb_ids : typeof i.kb_id == "string" && i.kb_id ? [i.kb_id] : [], b.value = i.read_enabled !== !1, y.value = i.write_enabled !== !1, k.value = S(i.checkpoint_model) || S(N.model) || o.checkpoint_model, f.value = S(i.checkpoint_prompt) || "", g.value = S(i.recall_prompt) || "", h.value = String(M(N.token_threshold) ?? M(i.token_threshold) ?? o.token_threshold), w.value = String(M(i.recall_limit) || o.recall_limit), x.value = String(M(i.recall_max_chars) || o.recall_max_chars);
    }
    function H() {
      E.value = {}, I.value = {}, d.value = "", c.value = [], b.value = o.read_enabled, y.value = o.write_enabled, h.value = String(o.token_threshold), k.value = o.checkpoint_model, f.value = o.checkpoint_prompt, g.value = o.recall_prompt, w.value = String(o.recall_limit), x.value = String(o.recall_max_chars);
    }
    function $() {
      const l = k.value || o.checkpoint_model, e = {
        ...E.value,
        ...d.value || "memory_id" in E.value ? { memory_id: d.value } : {},
        kb_ids: [...c.value],
        read_enabled: b.value,
        write_enabled: y.value,
        checkpoint_model: l,
        checkpoint_prompt: f.value,
        recall_prompt: g.value,
        recall_limit: T(w.value, o.recall_limit),
        recall_max_chars: T(x.value, o.recall_max_chars)
      };
      return {
        context: e,
        agent_options: {
          checkpoint: {
            ...I.value,
            token_threshold: T(h.value, o.token_threshold),
            model: e.checkpoint_model,
            max_tokens: M(I.value.max_tokens) ?? 1e3
          }
        }
      };
    }
    function r() {
      O("config-changed", $());
    }
    function q(l) {
      const e = l instanceof CustomEvent ? l.detail : void 0, n = v(e) && A(e.kb_ids) ? e.kb_ids : [];
      d.value = n.at(-1) || "", r();
    }
    function z(l) {
      const e = l instanceof CustomEvent ? l.detail : void 0;
      c.value = v(e) && A(e.kb_ids) ? e.kb_ids : [], r();
    }
    function G(l) {
      if (!(l.target instanceof HTMLInputElement)) return;
      const e = l.target.value;
      c.value = e ? [e] : [], r();
    }
    function Q(l) {
      const e = l instanceof CustomEvent ? l.detail : void 0;
      k.value = typeof e == "string" && e || o.checkpoint_model, r();
    }
    function W(l) {
      if (!(l.target instanceof HTMLInputElement)) return;
      const e = l.target.value;
      k.value = e || o.checkpoint_model, r();
    }
    return Z(() => K.value.config, B, { immediate: !0, deep: !0 }), ee(async () => {
      try {
        customElements.get("wc-kb-picker") || await j("wc-kb-picker", { timeoutMs: 8e3 });
      } catch {
        V.value = !0;
      }
      try {
        customElements.get("wc-model-picker") || await j("wc-model-picker", { timeoutMs: 8e3 });
      } catch {
        D.value = !0;
      }
    }), (l, e) => (u(), p("div", ie, [
      t("div", se, [
        e[7] || (e[7] = t("span", { id: "typed_memory" }, "Typed memory", -1)),
        V.value ? (u(), p("span", ce, "The knowledge base picker cannot load.")) : (u(), p("wc-kb-picker", {
          key: 0,
          "aria-labelledby": "typed_memory",
          config: JSON.stringify({ kb_ids: d.value ? [d.value] : [] }),
          onConfigChanged: q
        }, null, 40, re)),
        e[8] || (e[8] = t("span", { class: "hint" }, "Select a Memory knowledge base for typed capture and recall. Leave empty to use document knowledge bases.", -1))
      ]),
      t("div", de, [
        e[9] || (e[9] = t("span", { id: "legacy_memory_kbs" }, "Document knowledge bases", -1)),
        t("div", ue, [
          V.value ? (u(), p("input", {
            key: 1,
            "aria-label": "Memory knowledge base ID",
            name: "kb_id_fallback",
            placeholder: "Knowledge base id",
            value: c.value[0] || "",
            onInput: G
          }, null, 40, me)) : (u(), p("wc-kb-picker", {
            key: 0,
            "aria-labelledby": "legacy_memory_kbs",
            config: J.value,
            onConfigChanged: z
          }, null, 40, pe))
        ]),
        t("span", _e, te(R.value), 1)
      ]),
      t("div", ke, [
        t("label", ve, [
          m(t("input", {
            name: "read_enabled",
            type: "checkbox",
            "onUpdate:modelValue": e[0] || (e[0] = (n) => b.value = n),
            onChange: r
          }, null, 544), [
            [P, b.value]
          ]),
          e[10] || (e[10] = _(" Inject memory on activation ", -1))
        ]),
        t("label", be, [
          m(t("input", {
            name: "write_enabled",
            type: "checkbox",
            "onUpdate:modelValue": e[1] || (e[1] = (n) => y.value = n),
            onChange: r
          }, null, 544), [
            [P, y.value]
          ]),
          e[11] || (e[11] = _(" Persist checkpoints to memory ", -1))
        ])
      ]),
      t("div", ye, [
        t("label", he, [
          e[12] || (e[12] = _("Checkpoint after tokens ", -1)),
          m(t("input", {
            name: "token_threshold",
            type: "number",
            min: "200",
            max: "200000",
            step: "100",
            "onUpdate:modelValue": e[2] || (e[2] = (n) => h.value = n),
            onInput: r
          }, null, 544), [
            [C, h.value]
          ])
        ]),
        t("div", fe, [
          e[13] || (e[13] = t("span", { id: "legacy_checkpoint_model" }, "Checkpoint model", -1)),
          t("div", ge, [
            D.value ? (u(), p("input", {
              key: 1,
              "aria-label": "Checkpoint model",
              name: "model_fallback",
              placeholder: "class:fast",
              value: F.value,
              onInput: W
            }, null, 40, xe)) : (u(), p("wc-model-picker", {
              key: 0,
              "aria-labelledby": "legacy_checkpoint_model",
              value: F.value,
              onSelect: Q
            }, null, 40, we))
          ])
        ])
      ]),
      t("details", null, [
        e[18] || (e[18] = t("summary", null, "Advanced", -1)),
        t("div", Ce, [
          t("label", Se, [
            e[14] || (e[14] = _("Memory write instructions ", -1)),
            m(t("textarea", {
              name: "checkpoint_prompt",
              placeholder: "Store relevant details for future conversations. Do not store literal assistant answers.",
              "onUpdate:modelValue": e[3] || (e[3] = (n) => f.value = n),
              onInput: r
            }, null, 544), [
              [C, f.value]
            ])
          ]),
          t("label", Me, [
            e[15] || (e[15] = _("Recall guidance ", -1)),
            m(t("textarea", {
              name: "recall_prompt",
              placeholder: "Long-term memory may be incomplete or inaccurate; use it as advisory context.",
              "onUpdate:modelValue": e[4] || (e[4] = (n) => g.value = n),
              onInput: r
            }, null, 544), [
              [C, g.value]
            ])
          ])
        ]),
        t("div", Ee, [
          t("label", Ie, [
            e[16] || (e[16] = _("Recall results ", -1)),
            m(t("input", {
              name: "recall_limit",
              type: "number",
              min: "1",
              max: "20",
              "onUpdate:modelValue": e[5] || (e[5] = (n) => w.value = n),
              onInput: r
            }, null, 544), [
              [C, w.value]
            ])
          ]),
          t("label", Ve, [
            e[17] || (e[17] = _("Recall budget ", -1)),
            m(t("input", {
              name: "recall_max_chars",
              type: "number",
              min: "500",
              max: "20000",
              step: "500",
              "onUpdate:modelValue": e[6] || (e[6] = (n) => x.value = n),
              onInput: r
            }, null, 544), [
              [C, x.value]
            ])
          ])
        ])
      ])
    ]));
  }
}), Ne = { props: { type: "object", properties: { config: { type: "object", description: "Memory trait context. memory_id selects typed storage; kb_ids and write_kb_id retain document storage and checkpoint settings.", default: {} } } } }, Ue = {
  wippy: Ne
}, Ae = ae(Te, Ue.wippy.props);
oe(import.meta.url, Ae);
//# sourceMappingURL=knowledge_memory.js.map
