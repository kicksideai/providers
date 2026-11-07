import { W as d, u as s } from "./wc-runtime-CNDpK4lj.js";
import { Icon as n } from "@iconify/vue";
import { defineAsyncComponent as g, defineComponent as c, h as o, onMounted as l } from "vue";
import { define as h } from "@wippy-fe/proxy";
const u = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", m = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function x(e) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || e.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function f(e, r, t) {
  const i = t();
  l(() => i("error", { message: e, error: r }));
}
function y(e, r, t) {
  return g({
    loader: e,
    loadingComponent: {
      render: () => o("span", {
        role: "status",
        "aria-label": r.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, o("span", { style: "display:inline-flex;", onVnodeMounted: x }, o(n, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: c({
      props: { error: { type: Error, required: !0 } },
      setup(i) {
        return f(r.failed, i.error, t), () => o("span", {
          role: "alert",
          title: r.iconOnly ? r.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, r.iconOnly ? [o(n, { icon: "tabler:alert-circle", "aria-hidden": "true" }), o("span", { style: m }, r.failed)] : r.failed);
      }
    }),
    delay: 200,
    timeout: u,
    suspensible: !1
  });
}
const b = ":host,.gh{--gh-bg: var(--p-content-background);--gh-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--gh-border: var(--p-content-border-color);--gh-text: var(--p-text-color);--gh-muted: var(--p-text-muted-color);--gh-primary: var(--p-primary-color);--gh-primary-text: var(--p-primary-contrast-color);--gh-danger: var(--p-danger-500);--gh-warn: var(--p-warn-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--gh-text)}.gh{display:flex;flex-direction:column;gap:14px}.gh-tabs{display:flex;gap:6px}.gh-tab{flex:1;padding:8px 10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);color:var(--gh-muted);font-size:13px;cursor:pointer}.gh-tab.on{background:var(--gh-surface);color:var(--gh-text);border-color:var(--gh-primary)}.gh-pane,.gh-pick{display:flex;flex-direction:column;gap:12px}.gh-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.gh-field>span{color:var(--gh-muted)}.gh-field input{padding:8px 10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);color:var(--gh-text);font-size:14px}.gh-hint,.gh-error{margin:0;font-size:13px}.gh-hint{color:var(--gh-muted)}.gh-error{color:var(--gh-danger)}.gh-choice{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;padding:10px;border:1px solid var(--gh-border);border-radius:8px;background:var(--gh-bg);cursor:pointer}.gh-choice:has(input:checked){border-color:var(--gh-primary);background:var(--gh-surface)}.gh-choice input,.gh-check input{margin-top:2px}.gh-choice span{display:flex;flex-direction:column;gap:2px}.gh-choice strong{font-size:13px;font-weight:700}.gh-choice em{color:var(--gh-muted);font-size:12px;font-style:normal}.gh-check{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;color:var(--gh-muted);font-size:13px}.gh-primary{padding:9px 14px;border:none;border-radius:8px;background:var(--gh-primary);color:var(--gh-primary-text);font-size:14px;font-weight:600;cursor:pointer}.gh-primary:disabled,.gh-tab:disabled,.gh-field input:disabled{opacity:.6;cursor:default}.gh-warn{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid color-mix(in srgb,var(--gh-warn) 45%,var(--gh-border));border-radius:8px;color:var(--gh-text);font-size:13px}.gh-warn button{border:1px solid var(--gh-border);border-radius:6px;background:var(--gh-bg);color:var(--gh-text);font-size:12px;padding:5px 8px}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}:host>div:empty,:host>div:has(>[role=status]){min-height:240px}", v = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (github)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, w = {
  wippy: v
}, k = y(
  () => import("./Connect-B1SOaBIs.js"),
  { loading: "Loading GitHub connection…", failed: "Could not load the GitHub connection form. Reload the page to try again." },
  s
);
class p extends d {
  static get wippyConfig() {
    return {
      propsSchema: w.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: b
    };
  }
  static get vueConfig() {
    return { rootComponent: k };
  }
}
async function j() {
  return p;
}
h(import.meta.url, p);
export {
  j as webComponent
};
//# sourceMappingURL=connect.js.map
