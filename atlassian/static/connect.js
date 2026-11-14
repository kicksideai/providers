import { W as p, a as d } from "./wc-runtime-h8e5VJvv.js";
import { Icon as r } from "@iconify/vue";
import { defineAsyncComponent as l, defineComponent as c, h as n, onMounted as m } from "vue";
import { s as u } from "./styles-CV5852_Q.js";
import { define as f } from "@wippy-fe/proxy";
const y = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", g = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function h(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function C(t, e, o) {
  const i = o();
  m(() => i("error", { message: t, error: e }));
}
function w(t, e, o) {
  return l({
    loader: t,
    loadingComponent: {
      render: () => n("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, n("span", { style: "display:inline-flex;", onVnodeMounted: h }, n(r, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: c({
      props: { error: { type: Error, required: !0 } },
      setup(i) {
        return C(e.failed, i.error, o), () => n("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [n(r, { icon: "tabler:alert-circle", "aria-hidden": "true" }), n("span", { style: g }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: y,
    suspensible: !1
  });
}
const x = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (atlassian)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, v = {
  wippy: x
}, z = w(
  () => import("./Connect-MIbchh-w.js"),
  { loading: "Loading Atlassian connection…", failed: "Could not load the Atlassian connection form. Reload the page to try again." },
  d
);
class s extends p {
  static get wippyConfig() {
    return {
      propsSchema: v.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: u
    };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
async function k() {
  return s;
}
f(import.meta.url, s);
export {
  k as webComponent
};
//# sourceMappingURL=connect.js.map
