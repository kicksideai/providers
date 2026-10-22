import { defineComponent as S, ref as k, onMounted as N, openBlock as r, createElementBlock as o, toDisplayString as n, createCommentVNode as c, computed as y, Fragment as h, renderList as V, createElementVNode as s, createVNode as v } from "vue";
import { _ as I } from "./MmSwitch.vue_vue_type_script_setup_true_lang-CAQfcCan.js";
import { loadByTagName as j } from "@wippy-fe/proxy";
const E = ["value", "capability"], C = {
  key: 1,
  class: "mm-notice error"
}, z = /* @__PURE__ */ S({
  __name: "ModelPicker",
  props: {
    value: {},
    capability: {}
  },
  emits: ["select"],
  setup(a, { emit: d }) {
    const b = d, x = k(!!customElements.get("wc-model-picker")), g = k("");
    N(async () => {
      if (!x.value)
        try {
          await j("wc-model-picker", { timeoutMs: 8e3 }), x.value = !0;
        } catch (l) {
          g.value = l instanceof Error ? l.message : String(l);
        }
    });
    function f(l) {
      const i = l instanceof CustomEvent ? l.detail : void 0;
      typeof i == "string" && i && b("select", i);
    }
    return (l, i) => x.value ? (r(), o("wc-model-picker", {
      key: 0,
      value: a.value,
      capability: a.capability,
      onSelect: f
    }, null, 40, E)) : g.value ? (r(), o("div", C, "The model picker could not load: " + n(g.value), 1)) : c("", !0);
  }
}), M = { class: "mm-pane" }, B = {
  key: 0,
  class: "mm-toggle"
}, F = { class: "mm-field" }, L = { class: "mm-label" }, T = {
  key: 0,
  class: "mm-hint"
}, U = {
  key: 1,
  class: "mm-field"
}, $ = { class: "mm-label" }, A = {
  key: 0,
  class: "mm-hint"
}, D = {
  key: 2,
  class: "mm-field"
}, K = { class: "mm-label" }, P = ["name", "min", "max", "step", "value", "onInput"], O = {
  key: 0,
  class: "mm-hint"
}, R = {
  key: 3,
  class: "mm-field"
}, Y = { class: "mm-label" }, q = ["name", "value", "onInput"], G = ["name", "value", "onInput"], H = {
  key: 2,
  class: "mm-hint"
}, J = {
  key: 0,
  class: "mm-more"
}, Q = { class: "mm-pane" }, W = {
  key: 0,
  class: "mm-toggle"
}, X = { class: "mm-field" }, Z = { class: "mm-label" }, tt = {
  key: 0,
  class: "mm-hint"
}, et = {
  key: 1,
  class: "mm-field"
}, rt = { class: "mm-label" }, ot = {
  key: 0,
  class: "mm-hint"
}, at = {
  key: 2,
  class: "mm-field"
}, mt = { class: "mm-label" }, nt = ["name", "min", "max", "step", "value", "onInput"], it = {
  key: 0,
  class: "mm-hint"
}, st = {
  key: 3,
  class: "mm-field"
}, lt = { class: "mm-label" }, pt = ["name", "value", "onInput"], ct = ["name", "value", "onInput"], dt = {
  key: 2,
  class: "mm-hint"
}, bt = /* @__PURE__ */ S({
  __name: "ConfigFields",
  props: {
    schema: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(a, { emit: d }) {
    const b = a, x = d, g = y(() => Object.entries(b.schema.properties || {}).sort((p, u) => (p[1].order ?? 1e3) - (u[1].order ?? 1e3))), f = y(() => g.value.filter(([, p]) => p.group !== "advanced")), l = y(() => g.value.filter(([, p]) => p.group === "advanced"));
    function i(p, u) {
      x("update:modelValue", { ...b.modelValue, [p]: u });
    }
    function _(p, u, e) {
      const t = e.target.value;
      if (t === "") return;
      const m = Number(t);
      Number.isFinite(m) && i(p, u.type === "integer" ? Math.round(m) : m);
    }
    return (p, u) => (r(), o("div", M, [
      (r(!0), o(h, null, V(f.value, ([e, t]) => (r(), o(h, { key: e }, [
        t.type === "boolean" ? (r(), o("div", B, [
          s("div", F, [
            s("span", L, n(t.title || e), 1),
            t.description ? (r(), o("span", T, n(t.description), 1)) : c("", !0)
          ]),
          v(I, {
            label: t.title || e,
            "model-value": a.modelValue[e] === !0,
            "onUpdate:modelValue": (m) => i(e, m)
          }, null, 8, ["label", "model-value", "onUpdate:modelValue"])
        ])) : t.web_component === "wc-model-picker" ? (r(), o("div", U, [
          s("span", $, n(t.title || e), 1),
          v(z, {
            value: String(a.modelValue[e] || ""),
            capability: "generate",
            onSelect: (m) => i(e, m)
          }, null, 8, ["value", "onSelect"]),
          t.description ? (r(), o("span", A, n(t.description), 1)) : c("", !0)
        ])) : t.type === "integer" || t.type === "number" ? (r(), o("label", D, [
          s("span", K, n(t.title || e), 1),
          s("input", {
            class: "mm-input",
            type: "number",
            name: e,
            min: t.minimum,
            max: t.maximum,
            step: t.type === "integer" ? 1 : "any",
            value: a.modelValue[e],
            onInput: (m) => _(e, t, m)
          }, null, 40, P),
          t.description ? (r(), o("span", O, n(t.description), 1)) : c("", !0)
        ])) : (r(), o("label", R, [
          s("span", Y, n(t.title || e), 1),
          t.format === "textarea" ? (r(), o("textarea", {
            key: 0,
            class: "mm-textarea",
            name: e,
            value: String(a.modelValue[e] ?? ""),
            onInput: (m) => i(e, m.target.value)
          }, null, 40, q)) : (r(), o("input", {
            key: 1,
            class: "mm-input",
            name: e,
            value: String(a.modelValue[e] ?? ""),
            onInput: (m) => i(e, m.target.value)
          }, null, 40, G)),
          t.description ? (r(), o("span", H, n(t.description), 1)) : c("", !0)
        ]))
      ], 64))), 128)),
      l.value.length ? (r(), o("details", J, [
        u[0] || (u[0] = s("summary", null, "More settings", -1)),
        s("div", Q, [
          (r(!0), o(h, null, V(l.value, ([e, t]) => (r(), o(h, { key: e }, [
            t.type === "boolean" ? (r(), o("div", W, [
              s("div", X, [
                s("span", Z, n(t.title || e), 1),
                t.description ? (r(), o("span", tt, n(t.description), 1)) : c("", !0)
              ]),
              v(I, {
                label: t.title || e,
                "model-value": a.modelValue[e] === !0,
                "onUpdate:modelValue": (m) => i(e, m)
              }, null, 8, ["label", "model-value", "onUpdate:modelValue"])
            ])) : t.web_component === "wc-model-picker" ? (r(), o("div", et, [
              s("span", rt, n(t.title || e), 1),
              v(z, {
                value: String(a.modelValue[e] || ""),
                capability: "generate",
                onSelect: (m) => i(e, m)
              }, null, 8, ["value", "onSelect"]),
              t.description ? (r(), o("span", ot, n(t.description), 1)) : c("", !0)
            ])) : t.type === "integer" || t.type === "number" ? (r(), o("label", at, [
              s("span", mt, n(t.title || e), 1),
              s("input", {
                class: "mm-input",
                type: "number",
                name: e,
                min: t.minimum,
                max: t.maximum,
                step: t.type === "integer" ? 1 : "any",
                value: a.modelValue[e],
                onInput: (m) => _(e, t, m)
              }, null, 40, nt),
              t.description ? (r(), o("span", it, n(t.description), 1)) : c("", !0)
            ])) : (r(), o("label", st, [
              s("span", lt, n(t.title || e), 1),
              t.format === "textarea" ? (r(), o("textarea", {
                key: 0,
                class: "mm-textarea",
                name: e,
                value: String(a.modelValue[e] ?? ""),
                onInput: (m) => i(e, m.target.value)
              }, null, 40, pt)) : (r(), o("input", {
                key: 1,
                class: "mm-input",
                name: e,
                value: String(a.modelValue[e] ?? ""),
                onInput: (m) => i(e, m.target.value)
              }, null, 40, ct)),
              t.description ? (r(), o("span", dt, n(t.description), 1)) : c("", !0)
            ]))
          ], 64))), 128))
        ])
      ])) : c("", !0)
    ]));
  }
}), ht = {
  identity: "Identity",
  rule: "Rule",
  profile_slot: "Profile",
  fact: "Fact",
  preference: "Preference",
  skill: "Skill",
  lesson: "Lesson"
}, vt = {
  identity: "tabler:id-badge-2",
  rule: "tabler:list-check",
  profile_slot: "tabler:user",
  fact: "tabler:bulb",
  preference: "tabler:heart",
  skill: "tabler:tool",
  lesson: "tabler:school"
};
function w(a) {
  return a !== null && typeof a == "object" && !Array.isArray(a);
}
function ft(a) {
  if (w(a)) {
    const d = a.response;
    if (w(d) && w(d.data) && typeof d.data.error == "string") return d.data.error;
    if (typeof a.message == "string") return a.message;
  }
  return String(a);
}
const yt = ":host{--mm-bg: var(--p-content-background);--mm-surface: color-mix(in srgb, var(--p-text-color) 4%, var(--p-content-background));--mm-surface-2: color-mix(in srgb, var(--p-text-color) 8%, var(--p-content-background));--mm-border: var(--p-content-border-color);--mm-border-strong: color-mix(in srgb, var(--p-text-color) 18%, transparent);--mm-text: var(--p-text-color);--mm-muted: var(--p-text-muted-color);--mm-primary: var(--p-primary-color);--mm-primary-soft: color-mix(in srgb, var(--p-primary-color) 14%, transparent);--mm-danger: var(--p-danger-500);--mm-warn: var(--p-warn-500);--mm-ring: 0 0 0 3px color-mix(in srgb, var(--p-primary-color) 18%, transparent);display:block;height:100%;min-height:0;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.45;color:var(--mm-text)}:host>div{height:100%;min-height:0}.mm-page{height:100%;min-height:0;overflow-y:auto;box-sizing:border-box;padding:20px 24px 32px;display:flex;flex-direction:column;gap:16px}.mm-pane{display:grid;gap:14px}.mm-stats{display:flex;flex-wrap:wrap;gap:10px}.mm-stat{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--mm-border);border-radius:14px;background:var(--mm-surface);min-width:120px}.mm-stat-ico{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--mm-primary-soft);color:var(--mm-primary)}.mm-stat-ico.warn{background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--mm-warn)}.mm-stat-ico svg{width:17px;height:17px}.mm-stat-n{font-size:17px;font-weight:700}.mm-stat-l{font-size:11.5px;color:var(--mm-muted)}.mm-tabs{display:flex;gap:2px;border-bottom:1px solid var(--mm-border);flex-wrap:wrap}.mm-tab{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--mm-muted);font:inherit;font-weight:600;cursor:pointer}.mm-tab:hover{color:var(--mm-text)}.mm-tab.on{color:var(--mm-primary);border-bottom-color:var(--mm-primary)}.mm-tab svg{width:15px;height:15px}.mm-tab:focus-visible,.mm-btn:focus-visible,.mm-row:focus-visible,.mm-switch:focus-visible,.mm-chip-btn:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.mm-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.mm-chip-btn{height:28px;padding:0 11px;border-radius:6px;border:1px solid var(--mm-border);background:transparent;color:var(--mm-muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.mm-chip-btn:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-chip-btn.on{background:var(--mm-primary-soft);color:var(--mm-primary);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.mm-sep{width:1px;height:20px;background:var(--mm-border);margin:0 4px}.mm-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:start}.mm-split>.mm-card+.mm-card{position:sticky;top:0;max-height:calc(100vh - 40px);overflow-y:auto}@media(max-width:860px){.mm-split{grid-template-columns:1fr}.mm-split>.mm-card+.mm-card{position:static;max-height:none}}.mm-card{border:1px solid var(--mm-border);border-radius:14px;background:var(--mm-bg);overflow:hidden}.mm-card-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--mm-border);font-weight:700}.mm-card-b{padding:14px;display:grid;gap:10px}.mm-list{display:flex;flex-direction:column}.mm-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 14px;border:none;border-bottom:1px solid var(--mm-border);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.mm-row:last-child{border-bottom:none}.mm-row:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-row.on{background:var(--mm-primary-soft)}.mm-row-t{font-weight:600;overflow-wrap:anywhere}.mm-row-s{color:var(--mm-muted);font-size:12px;display:flex;flex-wrap:wrap;gap:6px;margin-top:3px}.mm-row-ico{width:28px;height:28px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--mm-surface-2);color:var(--mm-muted)}.mm-row-ico svg{width:15px;height:15px}.mm-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:6px;font-size:11px;font-weight:600;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--mm-muted)}.mm-chip.current{background:var(--mm-primary-soft);color:var(--mm-primary)}.mm-chip.conflict{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--mm-warn)}.mm-chip.failed{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--mm-danger)}.mm-chip.forgotten,.mm-chip.superseded{text-decoration:none}.mm-dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 12px;font-size:12.5px}.mm-dl dt{color:var(--mm-muted)}.mm-dl dd{margin:0;overflow-wrap:anywhere}.mm-h{font-size:12px;font-weight:700;color:var(--mm-muted);text-transform:uppercase;letter-spacing:.04em;margin:4px 0 0}.mm-version{display:flex;gap:8px;align-items:baseline;font-size:12.5px}.mm-version.past{color:var(--mm-muted)}.mm-actions{display:flex;flex-wrap:wrap;gap:8px}.mm-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;border:1px solid transparent;font:inherit;font-weight:600;cursor:pointer}.mm-btn svg{width:15px;height:15px}.mm-btn.primary{background:var(--mm-primary);color:var(--p-primary-contrast-color)}.mm-btn.ghost{background:transparent;color:var(--mm-text);border-color:var(--mm-border)}.mm-btn.ghost:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.mm-btn.danger{background:transparent;color:var(--mm-danger);border-color:color-mix(in srgb,var(--p-danger-500) 40%,transparent)}.mm-btn:disabled{opacity:.55;cursor:not-allowed}.mm-field{display:grid;gap:6px}.mm-label{font-weight:600}.mm-hint{color:var(--mm-muted);font-size:12px}.mm-input,.mm-textarea,.mm-select{width:100%;box-sizing:border-box;border:1px solid var(--mm-border);border-radius:8px;padding:7px 10px;background:var(--p-inputtext-background, var(--mm-bg));color:inherit;font:inherit}.mm-textarea{min-height:72px;resize:vertical}.mm-input:focus,.mm-textarea:focus,.mm-select:focus{outline:none;border-color:var(--mm-primary);box-shadow:var(--mm-ring)}.mm-select-sm{width:auto;height:28px;padding:0 8px;font-size:12px}.mm-more summary{cursor:pointer;color:var(--mm-muted);font-weight:600}.mm-more[open] summary{margin-bottom:12px}.mm-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:560px){.mm-select-sm{width:auto;height:28px;padding:0 8px;font-size:12px}.mm-more summary{cursor:pointer;color:var(--mm-muted);font-weight:600}.mm-more[open] summary{margin-bottom:12px}.mm-grid2{grid-template-columns:1fr}}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}.mm-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid var(--mm-border-strong);border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 16%,transparent);cursor:pointer}.mm-switch.on{background:var(--mm-primary);border-color:var(--mm-primary)}.mm-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.mm-switch.on .mm-switch-knob{left:19px}.mm-notice{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--mm-surface-2);color:var(--mm-muted)}.mm-notice.error{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--mm-danger)}.mm-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.mm-empty{padding:40px 20px;text-align:center;color:var(--mm-muted);display:grid;gap:6px;justify-items:center}.mm-empty svg{width:26px;height:26px}.mm-conflict{display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--mm-border)}.mm-conflict:last-child{border-bottom:none}.mm-option{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--mm-border);border-radius:10px}.spin{animation:mm-spin 1s linear infinite}@keyframes mm-spin{to{transform:rotate(360deg)}}";
export {
  ht as K,
  z as _,
  bt as a,
  vt as b,
  ft as e,
  w as i,
  yt as s
};
//# sourceMappingURL=memory-DSw53YZr.js.map
