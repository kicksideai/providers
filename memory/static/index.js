import { u as C, a as E, _ as S, W as A } from "./MmSwitch.vue_vue_type_script_setup_true_lang-CAQfcCan.js";
import { defineComponent as V, ref as n, computed as j, watch as M, onMounted as N, openBlock as d, createElementBlock as m, createElementVNode as s, toDisplayString as K, createCommentVNode as O, createVNode as T } from "vue";
import { loadByTagName as B, define as I } from "@wippy-fe/proxy";
import "@iconify/vue";
const P = { class: "km" }, R = { class: "field" }, Y = ["config"], z = {
  key: 1,
  class: "error"
}, J = { class: "toggle" }, U = /* @__PURE__ */ V({
  __name: "knowledge-memory",
  setup(g) {
    const y = ["kb_ids", "write_kb_id", "memory_id", "write_enabled"], b = C(), h = E(), i = n(""), a = n(!0), u = n({}), l = n(!!customElements.get("wc-kb-picker")), c = n(""), k = j(() => JSON.stringify({ kb_ids: i.value ? [i.value] : [] }));
    function p(e) {
      return e && typeof e == "object" && !Array.isArray(e) ? e : {};
    }
    function v(e) {
      let t = e;
      if (typeof e == "string")
        try {
          t = JSON.parse(e);
        } catch {
          return;
        }
      const r = p(t), o = { ...p(r.context), ...r };
      delete o.context, delete o.agent_options;
      const w = Array.isArray(o.kb_ids) ? o.kb_ids : [];
      i.value = String(o.memory_id || o.write_kb_id || w[0] || ""), a.value = o.write_enabled !== !1, u.value = Object.fromEntries(Object.entries(o).filter(([x]) => !y.includes(x)));
    }
    function f() {
      h("config-changed", { context: { ...u.value, memory_id: i.value, write_enabled: a.value } });
    }
    function _(e) {
      const t = p(e instanceof CustomEvent ? e.detail : void 0), r = Array.isArray(t.kb_ids) ? t.kb_ids : [];
      i.value = String(r[r.length - 1] || ""), f();
    }
    return M(() => b.value.config, v, { immediate: !0, deep: !0 }), N(async () => {
      if (!l.value)
        try {
          await B("wc-kb-picker", { timeoutMs: 8e3 }), l.value = !0;
        } catch (e) {
          c.value = e instanceof Error ? e.message : String(e);
        }
    }), (e, t) => (d(), m("div", P, [
      s("div", R, [
        t[1] || (t[1] = s("span", null, "Memory", -1)),
        l.value ? (d(), m("wc-kb-picker", {
          key: 0,
          config: k.value,
          onConfigChanged: _
        }, null, 40, Y)) : c.value ? (d(), m("span", z, "The knowledge base picker could not load: " + K(c.value), 1)) : O("", !0),
        t[2] || (t[2] = s("span", { class: "hint" }, "Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.", -1))
      ]),
      s("div", J, [
        t[3] || (t[3] = s("span", null, "Remember conversations", -1)),
        T(S, {
          label: "Remember conversations",
          modelValue: a.value,
          "onUpdate:modelValue": [
            t[0] || (t[0] = (r) => a.value = r),
            f
          ]
        }, null, 8, ["modelValue"])
      ])
    ]));
  }
}), W = ":host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 Inter,system-ui,sans-serif}.km{display:grid;gap:12px;height:100%;overflow-y:auto}.field{display:grid;gap:6px;font-weight:600}.toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:600}.hint{color:var(--p-text-muted-color);font-size:12px;font-weight:400}.error{color:var(--p-danger-500);font-size:12px;font-weight:400}.mm-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid color-mix(in srgb,var(--p-text-color) 18%,transparent);border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 16%,transparent);cursor:pointer}.mm-switch.on{background:var(--p-primary-color);border-color:var(--p-primary-color)}.mm-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.mm-switch.on .mm-switch-knob{left:19px}.mm-switch:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}", D = { props: { type: "object", properties: { config: { type: "object", description: "Trait context { memory_ids, write_enabled, read_enabled, recall_limit, checkpoint_model } and agent_options.checkpoint policy.", default: {} } } } }, G = {
  wippy: D
};
class L extends A {
  static get wippyConfig() {
    return {
      propsSchema: G.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: W
    };
  }
  static get vueConfig() {
    return { rootComponent: U };
  }
}
I(import.meta.url, L);
//# sourceMappingURL=index.js.map
