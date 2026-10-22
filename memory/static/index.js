import { u as J, a as L, b as S, _ as P, W as R } from "./ModelPicker.vue_vue_type_script_setup_true_lang-BXa7KiZU.js";
import { defineComponent as W, ref as s, computed as V, watch as $, onMounted as Y, openBlock as b, createElementBlock as k, createElementVNode as n, toDisplayString as E, createCommentVNode as q, createVNode as _, createTextVNode as M, withDirectives as N, vModelText as T } from "vue";
import { loadByTagName as G, define as H } from "@wippy-fe/proxy";
import "@iconify/vue";
function p(o) {
  return o !== null && typeof o == "object" && !Array.isArray(o);
}
function y(o) {
  return Array.isArray(o) && o.every((r) => typeof r == "string");
}
function A(o) {
  return typeof o == "string" ? o : void 0;
}
function U(o) {
  return typeof o == "number" && Number.isFinite(o) ? o : void 0;
}
const Q = { class: "km" }, X = { class: "field" }, Z = ["config"], ee = {
  key: 1,
  class: "error"
}, te = { class: "hint" }, oe = { class: "toggle" }, ne = { class: "toggle" }, re = { class: "row" }, ie = { class: "field" }, le = { class: "field" }, se = { class: "field" }, ae = /* @__PURE__ */ W({
  __name: "knowledge-memory",
  setup(o) {
    const r = {
      write_enabled: !0,
      read_enabled: !0,
      token_threshold: 64e3,
      checkpoint_model: "class:fast",
      recall_limit: 5
    }, z = J(), j = L(), d = s([]), m = s(r.write_enabled), u = s(r.read_enabled), g = s(String(r.token_threshold)), c = s(r.checkpoint_model), f = s(String(r.recall_limit)), h = s(!!customElements.get("wc-kb-picker")), v = s(""), B = V(() => JSON.stringify({ kb_ids: d.value })), I = V(() => d.value.length ? "The first memory receives captured conversations; all of them are searched." : "Choose Memory knowledge bases. Create one with + Knowledge Base, type Memory.");
    function x(t, e) {
      const i = Number(t);
      return Number.isFinite(i) && i > 0 ? i : e;
    }
    function K(t) {
      if (t == null || t === "") return;
      let e = t;
      if (typeof t == "string")
        try {
          e = JSON.parse(t);
        } catch {
          return;
        }
      if (!p(e)) return;
      const l = { ...p(e.context) ? e.context : {}, ...e }, w = p(e.agent_options) ? e.agent_options : {}, C = p(w.checkpoint) ? w.checkpoint : {};
      d.value = y(l.memory_ids) && l.memory_ids.length ? l.memory_ids : y(l.kb_ids) ? l.kb_ids : [], m.value = l.write_enabled !== !1, u.value = l.read_enabled !== !1, c.value = A(l.checkpoint_model) || A(C.model) || r.checkpoint_model, g.value = String(U(C.token_threshold) ?? r.token_threshold), f.value = String(U(l.recall_limit) || r.recall_limit);
    }
    function D() {
      return {
        context: {
          memory_ids: [...d.value],
          write_enabled: m.value,
          read_enabled: u.value,
          recall_limit: x(f.value, r.recall_limit),
          checkpoint_model: c.value || r.checkpoint_model
        },
        agent_options: {
          checkpoint: {
            token_threshold: x(g.value, r.token_threshold),
            model: c.value || r.checkpoint_model,
            max_tokens: 1e3
          }
        }
      };
    }
    function a() {
      j("config-changed", D());
    }
    function F(t) {
      const e = t instanceof CustomEvent ? t.detail : void 0;
      d.value = p(e) && y(e.kb_ids) ? e.kb_ids : [], a();
    }
    function O(t) {
      c.value = t, a();
    }
    return $(() => z.value.config, K, { immediate: !0, deep: !0 }), Y(async () => {
      if (!h.value)
        try {
          await G("wc-kb-picker", { timeoutMs: 8e3 }), h.value = !0;
        } catch (t) {
          v.value = t instanceof Error ? t.message : String(t);
        }
    }), (t, e) => (b(), k("div", Q, [
      n("div", X, [
        e[4] || (e[4] = n("span", null, "Memories", -1)),
        h.value ? (b(), k("wc-kb-picker", {
          key: 0,
          config: B.value,
          onConfigChanged: F
        }, null, 40, Z)) : v.value ? (b(), k("span", ee, "The knowledge base picker could not load: " + E(v.value), 1)) : q("", !0),
        n("span", te, E(I.value), 1)
      ]),
      n("div", oe, [
        e[5] || (e[5] = n("span", null, "Capture conversations into memory", -1)),
        _(S, {
          label: "Capture conversations into memory",
          modelValue: m.value,
          "onUpdate:modelValue": [
            e[0] || (e[0] = (i) => m.value = i),
            a
          ]
        }, null, 8, ["modelValue"])
      ]),
      n("div", ne, [
        e[6] || (e[6] = n("span", null, "SearchMemory tool", -1)),
        _(S, {
          label: "SearchMemory tool",
          modelValue: u.value,
          "onUpdate:modelValue": [
            e[1] || (e[1] = (i) => u.value = i),
            a
          ]
        }, null, 8, ["modelValue"])
      ]),
      n("div", re, [
        n("label", ie, [
          e[7] || (e[7] = M("Checkpoint after tokens ", -1)),
          N(n("input", {
            name: "token_threshold",
            type: "number",
            min: "200",
            max: "200000",
            step: "100",
            "onUpdate:modelValue": e[2] || (e[2] = (i) => g.value = i),
            onInput: a
          }, null, 544), [
            [T, g.value]
          ])
        ]),
        n("label", le, [
          e[8] || (e[8] = M("Search results ", -1)),
          N(n("input", {
            name: "recall_limit",
            type: "number",
            min: "1",
            max: "50",
            "onUpdate:modelValue": e[3] || (e[3] = (i) => f.value = i),
            onInput: a
          }, null, 544), [
            [T, f.value]
          ])
        ])
      ]),
      n("div", se, [
        e[9] || (e[9] = n("span", null, "Checkpoint model", -1)),
        _(P, {
          value: c.value,
          capability: "generate",
          onSelect: O
        }, null, 8, ["value"]),
        e[10] || (e[10] = n("span", { class: "hint" }, "Summarizes the conversation when the context is compacted.", -1))
      ])
    ]));
  }
}), de = ":host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 Inter,system-ui,sans-serif}.km{display:grid;gap:12px;height:100%;overflow-y:auto}.field{display:grid;gap:6px;font-weight:600}.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:end}.toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:600}input{width:100%;box-sizing:border-box;border:1px solid var(--p-content-border-color);border-radius:8px;padding:7px 10px;background:var(--p-inputtext-background, var(--p-content-background));color:inherit;font:inherit}.hint{color:var(--p-text-muted-color);font-size:12px;font-weight:400}.error{color:var(--p-danger-500);font-size:12px;font-weight:400}.mm-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid color-mix(in srgb,var(--p-text-color) 18%,transparent);border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 16%,transparent);cursor:pointer}.mm-switch.on{background:var(--p-primary-color);border-color:var(--p-primary-color)}.mm-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.mm-switch.on .mm-switch-knob{left:19px}.mm-switch:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.mm-notice.error{color:var(--p-danger-500);font-size:12px}@media(max-width:560px){.row{grid-template-columns:1fr}}", ce = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_ids, write_enabled, read_enabled, recall_limit, checkpoint_model } and agent_options.checkpoint policy.", default: {} } } } }, pe = {
  wippy: ce
};
class me extends R {
  static get wippyConfig() {
    return {
      propsSchema: pe.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: de
    };
  }
  static get vueConfig() {
    return { rootComponent: ae };
  }
}
H(import.meta.url, me);
//# sourceMappingURL=index.js.map
