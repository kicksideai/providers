import { W as l, a as p } from "./wc-runtime-h8e5VJvv.js";
import { Icon as i } from "@iconify/vue";
import { defineAsyncComponent as d, defineComponent as c, h as n, onMounted as m } from "vue";
import { s as u, p as f } from "./package-IfJlDH1X.js";
import { define as y } from "@wippy-fe/proxy";
const h = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", g = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function C(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function x(t, e, o) {
  const r = o();
  m(() => r("error", { message: t, error: e }));
}
function w(t, e, o) {
  return d({
    loader: t,
    loadingComponent: {
      render: () => n("span", {
        role: "status",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, n("span", { style: "display:inline-flex;", onVnodeMounted: C }, n(i, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: c({
      props: { error: { type: Error, required: !0 } },
      setup(r) {
        return x(e.failed, r.error, o), () => n("span", {
          role: "alert",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [n(i, { icon: "tabler:alert-circle", "aria-hidden": "true" }), n("span", { style: g }, e.failed)] : e.failed);
      }
    }),
    delay: 200,
    timeout: h,
    suspensible: !1
  });
}
const v = w(
  () => import("./Connect-MIbchh-w.js"),
  { loading: "Loading Atlassian connection…", failed: "Could not load the Atlassian connection form. Reload the page to try again." },
  p
);
class s extends l {
  static get wippyConfig() {
    return {
      propsSchema: f.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: u
    };
  }
  static get vueConfig() {
    return { rootComponent: v };
  }
}
async function I() {
  return s;
}
y(import.meta.url, s);
export {
  I as webComponent
};
//# sourceMappingURL=connect.js.map
