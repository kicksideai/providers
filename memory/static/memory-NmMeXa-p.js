import { defineComponent as y, computed as w, openBlock as a, createElementBlock as m, Fragment as u, renderList as _, createElementVNode as l, toDisplayString as n, createCommentVNode as c, createVNode as b } from "vue";
import { b as k, _ as V } from "./ModelPicker.vue_vue_type_script_setup_true_lang-BXa7KiZU.js";
const z = { class: "mm-pane" }, I = {
  key: 0,
  class: "mm-toggle"
}, N = { class: "mm-field" }, S = { class: "mm-label" }, j = {
  key: 0,
  class: "mm-hint"
}, C = {
  key: 1,
  class: "mm-field"
}, F = { class: "mm-label" }, L = {
  key: 0,
  class: "mm-hint"
}, A = {
  key: 2,
  class: "mm-field"
}, B = { class: "mm-label" }, D = ["name", "min", "max", "step", "value", "onInput"], E = {
  key: 0,
  class: "mm-hint"
}, K = {
  key: 3,
  class: "mm-field"
}, O = { class: "mm-label" }, P = ["name", "value", "onInput"], R = ["name", "value", "onInput"], T = {
  key: 2,
  class: "mm-hint"
}, M = /* @__PURE__ */ y({
  __name: "ConfigFields",
  props: {
    schema: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: i }) {
    const x = e, h = i, f = w(() => Object.entries(x.schema.properties || {}).sort((s, p) => (s[1].order ?? 1e3) - (p[1].order ?? 1e3)));
    function d(s, p) {
      h("update:modelValue", { ...x.modelValue, [s]: p });
    }
    function v(s, p, t) {
      const r = t.target.value;
      if (r === "") return;
      const o = Number(r);
      Number.isFinite(o) && d(s, p.type === "integer" ? Math.round(o) : o);
    }
    return (s, p) => (a(), m("div", z, [
      (a(!0), m(u, null, _(f.value, ([t, r]) => (a(), m(u, { key: t }, [
        r.type === "boolean" ? (a(), m("div", I, [
          l("div", N, [
            l("span", S, n(r.title || t), 1),
            r.description ? (a(), m("span", j, n(r.description), 1)) : c("", !0)
          ]),
          b(k, {
            label: r.title || t,
            "model-value": e.modelValue[t] === !0,
            "onUpdate:modelValue": (o) => d(t, o)
          }, null, 8, ["label", "model-value", "onUpdate:modelValue"])
        ])) : r.web_component === "wc-model-picker" ? (a(), m("div", C, [
          l("span", F, n(r.title || t), 1),
          b(V, {
            value: String(e.modelValue[t] || ""),
            capability: "generate",
            onSelect: (o) => d(t, o)
          }, null, 8, ["value", "onSelect"]),
          r.description ? (a(), m("span", L, n(r.description), 1)) : c("", !0)
        ])) : r.type === "integer" || r.type === "number" ? (a(), m("label", A, [
          l("span", B, n(r.title || t), 1),
          l("input", {
            class: "mm-input",
            type: "number",
            name: t,
            min: r.minimum,
            max: r.maximum,
            step: r.type === "integer" ? 1 : "any",
            value: e.modelValue[t],
            onInput: (o) => v(t, r, o)
          }, null, 40, D),
          r.description ? (a(), m("span", E, n(r.description), 1)) : c("", !0)
        ])) : (a(), m("label", K, [
          l("span", O, n(r.title || t), 1),
          r.format === "textarea" ? (a(), m("textarea", {
            key: 0,
            class: "mm-textarea",
            name: t,
            value: String(e.modelValue[t] ?? ""),
            onInput: (o) => d(t, o.target.value)
          }, null, 40, P)) : (a(), m("input", {
            key: 1,
            class: "mm-input",
            name: t,
            value: String(e.modelValue[t] ?? ""),
            onInput: (o) => d(t, o.target.value)
          }, null, 40, R)),
          r.description ? (a(), m("span", T, n(r.description), 1)) : c("", !0)
        ]))
      ], 64))), 128))
    ]));
  }
}), Y = {
  identity: "Identity",
  rule: "Rule",
  profile_slot: "Profile",
  fact: "Fact",
  preference: "Preference",
  skill: "Skill",
  lesson: "Lesson"
}, q = {
  identity: "tabler:id-badge-2",
  rule: "tabler:list-check",
  profile_slot: "tabler:user",
  fact: "tabler:bulb",
  preference: "tabler:heart",
  skill: "tabler:tool",
  lesson: "tabler:school"
};
function g(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function G(e) {
  if (g(e)) {
    const i = e.response;
    if (g(i) && g(i.data) && typeof i.data.error == "string") return i.data.error;
    if (typeof e.message == "string") return e.message;
  }
  return String(e);
}
const H = ":host{--mm-bg: var(--p-content-background);--mm-surface: color-mix(in srgb, var(--p-text-color) 4%, var(--p-content-background));--mm-surface-2: color-mix(in srgb, var(--p-text-color) 8%, var(--p-content-background));--mm-border: var(--p-content-border-color);--mm-border-strong: color-mix(in srgb, var(--p-text-color) 18%, transparent);--mm-text: var(--p-text-color);--mm-muted: var(--p-text-muted-color);--mm-primary: var(--p-primary-color);--mm-primary-soft: color-mix(in srgb, var(--p-primary-color) 14%, transparent);--mm-danger: var(--p-danger-500);--mm-warn: var(--p-warn-500);--mm-ring: 0 0 0 3px color-mix(in srgb, var(--p-primary-color) 18%, transparent);display:block;height:100%;min-height:0;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.45;color:var(--mm-text)}:host>div{height:100%;min-height:0}.mm-page{height:100%;min-height:0;overflow-y:auto;box-sizing:border-box;padding:20px 24px 32px;display:flex;flex-direction:column;gap:16px}.mm-pane{display:grid;gap:14px}.mm-stats{display:flex;flex-wrap:wrap;gap:10px}.mm-stat{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--mm-border);border-radius:14px;background:var(--mm-surface);min-width:120px}.mm-stat-ico{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--mm-primary-soft);color:var(--mm-primary)}.mm-stat-ico.warn{background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--mm-warn)}.mm-stat-ico svg{width:17px;height:17px}.mm-stat-n{font-size:17px;font-weight:700}.mm-stat-l{font-size:11.5px;color:var(--mm-muted)}.mm-tabs{display:flex;gap:2px;border-bottom:1px solid var(--mm-border);flex-wrap:wrap}.mm-tab{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--mm-muted);font:inherit;font-weight:600;cursor:pointer}.mm-tab:hover{color:var(--mm-text)}.mm-tab.on{color:var(--mm-primary);border-bottom-color:var(--mm-primary)}.mm-tab svg{width:15px;height:15px}.mm-tab:focus-visible,.mm-btn:focus-visible,.mm-row:focus-visible,.mm-switch:focus-visible,.mm-chip-btn:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.mm-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.mm-chip-btn{height:28px;padding:0 11px;border-radius:6px;border:1px solid var(--mm-border);background:transparent;color:var(--mm-muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.mm-chip-btn:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-chip-btn.on{background:var(--mm-primary-soft);color:var(--mm-primary);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.mm-sep{width:1px;height:20px;background:var(--mm-border);margin:0 4px}.mm-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:start}.mm-split>.mm-card+.mm-card{position:sticky;top:0;max-height:calc(100vh - 40px);overflow-y:auto}@media(max-width:860px){.mm-split{grid-template-columns:1fr}.mm-split>.mm-card+.mm-card{position:static;max-height:none}}.mm-card{border:1px solid var(--mm-border);border-radius:14px;background:var(--mm-bg);overflow:hidden}.mm-card-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--mm-border);font-weight:700}.mm-card-b{padding:14px;display:grid;gap:10px}.mm-list{display:flex;flex-direction:column}.mm-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 14px;border:none;border-bottom:1px solid var(--mm-border);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.mm-row:last-child{border-bottom:none}.mm-row:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-row.on{background:var(--mm-primary-soft)}.mm-row-t{font-weight:600;overflow-wrap:anywhere}.mm-row-s{color:var(--mm-muted);font-size:12px;display:flex;flex-wrap:wrap;gap:6px;margin-top:3px}.mm-row-ico{width:28px;height:28px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--mm-surface-2);color:var(--mm-muted)}.mm-row-ico svg{width:15px;height:15px}.mm-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:6px;font-size:11px;font-weight:600;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--mm-muted)}.mm-chip.current{background:var(--mm-primary-soft);color:var(--mm-primary)}.mm-chip.conflict{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--mm-warn)}.mm-chip.failed{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--mm-danger)}.mm-chip.forgotten,.mm-chip.superseded{text-decoration:none}.mm-dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 12px;font-size:12.5px}.mm-dl dt{color:var(--mm-muted)}.mm-dl dd{margin:0;overflow-wrap:anywhere}.mm-h{font-size:12px;font-weight:700;color:var(--mm-muted);text-transform:uppercase;letter-spacing:.04em;margin:4px 0 0}.mm-version{display:flex;gap:8px;align-items:baseline;font-size:12.5px}.mm-version.past{color:var(--mm-muted)}.mm-actions{display:flex;flex-wrap:wrap;gap:8px}.mm-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;border:1px solid transparent;font:inherit;font-weight:600;cursor:pointer}.mm-btn svg{width:15px;height:15px}.mm-btn.primary{background:var(--mm-primary);color:var(--p-primary-contrast-color)}.mm-btn.ghost{background:transparent;color:var(--mm-text);border-color:var(--mm-border)}.mm-btn.ghost:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-btn.danger{background:transparent;color:var(--mm-danger);border-color:color-mix(in srgb,var(--p-danger-500) 40%,transparent)}.mm-btn:disabled{opacity:.55;cursor:not-allowed}.mm-field{display:grid;gap:6px}.mm-label{font-weight:600}.mm-hint{color:var(--mm-muted);font-size:12px}.mm-input,.mm-textarea,.mm-select{width:100%;box-sizing:border-box;border:1px solid var(--mm-border);border-radius:8px;padding:7px 10px;background:var(--p-inputtext-background, var(--mm-bg));color:inherit;font:inherit}.mm-textarea{min-height:72px;resize:vertical}.mm-input:focus,.mm-textarea:focus,.mm-select:focus{outline:none;border-color:var(--mm-primary);box-shadow:var(--mm-ring)}.mm-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:560px){.mm-grid2{grid-template-columns:1fr}}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}.mm-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid var(--mm-border-strong);border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 16%,transparent);cursor:pointer}.mm-switch.on{background:var(--mm-primary);border-color:var(--mm-primary)}.mm-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.mm-switch.on .mm-switch-knob{left:19px}.mm-notice{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--mm-surface-2);color:var(--mm-muted)}.mm-notice.error{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--mm-danger)}.mm-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.mm-empty{padding:40px 20px;text-align:center;color:var(--mm-muted);display:grid;gap:6px;justify-items:center}.mm-empty svg{width:26px;height:26px}.mm-conflict{display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--mm-border)}.mm-conflict:last-child{border-bottom:none}.mm-option{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--mm-border);border-radius:10px}.spin{animation:mm-spin 1s linear infinite}@keyframes mm-spin{to{transform:rotate(360deg)}}";
export {
  Y as K,
  M as _,
  q as a,
  G as e,
  g as i,
  H as s
};
//# sourceMappingURL=memory-NmMeXa-p.js.map
