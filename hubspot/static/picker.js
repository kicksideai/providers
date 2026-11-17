import { W as p, P as d, u as c } from "./wc-runtime-D250RObL.js";
import { Icon as i } from "@iconify/vue";
import { defineAsyncComponent as l, defineComponent as u, h as o, onMounted as h } from "vue";
import { define as m } from "@wippy-fe/proxy";
const f = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", g = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function x(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function y(t, e, r) {
  const n = r();
  h(() => n("error", { message: t, error: e }));
}
function v(t, e, r) {
  return l({
    loader: t,
    loadingComponent: {
      render: () => o("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: "".concat(a, "color:var(--p-text-muted-color);")
      }, o("span", { style: "display:inline-flex;", onVnodeMounted: x }, o(i, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: u({
      props: { error: { type: Error, required: !0 } },
      setup(n) {
        return y(e.failed, n.error, r), () => o("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: "".concat(a, "color:var(--p-danger-500);")
        }, e.iconOnly ? [o(i, { icon: "tabler:alert-circle", "aria-hidden": "true" }), o("span", { style: g }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: f,
    suspensible: !1
  });
}
const b = ":host,.hs{--hs-bg: var(--p-content-background);--hs-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--hs-border: var(--p-content-border-color);--hs-text: var(--p-text-color);--hs-muted: var(--p-text-muted-color);--hs-primary: var(--p-primary-color);--hs-danger: var(--p-danger-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--hs-text)}.hs{display:flex;flex-direction:column;gap:12px}.hs-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.hs-field>span{color:var(--hs-muted)}.hs-field wc-connection-picker,.hs-field .p-select{width:100%}.hs-field wc-connection-picker{display:block;min-height:36px}.hs-field .p-select{padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-bg);color:var(--hs-text);font-size:14px}.hs-hint{margin:0;font-size:13px;color:var(--hs-muted)}.hs-error{margin:0;font-size:13px;color:var(--hs-danger)}.hs-summary{display:flex;gap:8px;align-items:center;min-height:24px;padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-surface);font-size:13px}.hs-dot{width:8px;height:8px;border-radius:999px;background:var(--hs-primary);flex:0 0 auto}:host>div:empty,:host>div:has(>[data-lazy-state]){min-height:190px}", C = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Current source/sink config containing connection_id and object_type." } } } }, k = {
  wippy: C
}, w = v(
  () => import("./HubSpotPicker-BqkSDniE.js"),
  {
    loading: "Loading HubSpot picker…",
    failed: "Could not load the HubSpot picker. Reload the page to try again."
  },
  c
);
class s extends p {
  static get wippyConfig() {
    return {
      propsSchema: k.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: b
    };
  }
  static get vueConfig() {
    return { rootComponent: w, plugins: [d] };
  }
}
async function M() {
  return s;
}
m(import.meta.url, s);
export {
  M as webComponent
};
//# sourceMappingURL=picker.js.map
