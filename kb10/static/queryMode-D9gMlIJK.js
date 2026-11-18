import { defineComponent as d, openBlock as l, createElementBlock as c, normalizeClass as m, createBlock as o, unref as r, createCommentVNode as u, createElementVNode as y, renderSlot as f } from "vue";
import { Icon as i } from "@iconify/vue";
const b = ["type", "disabled"], D = /* @__PURE__ */ d({
  __name: "KbButton",
  props: {
    variant: { default: "primary" },
    icon: {},
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean },
    type: { default: "button" }
  },
  emits: ["click"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, a) => (l(), c("button", {
      class: m(["kx-btn", [`kx-btn-${e.variant}`, e.small && "sm"]]),
      type: e.type,
      disabled: e.disabled,
      onClick: a[0] || (a[0] = (E) => n("click"))
    }, [
      e.loading ? (l(), o(r(i), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : e.icon ? (l(), o(r(i), {
        key: 1,
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : u("", !0),
      y("span", null, [
        f(s.$slots, "default")
      ])
    ], 10, b));
  }
}), k = "class:fast";
function p(e, t = k) {
  return e == null || e === "" ? t : typeof e == "string" && e.trim() ? e : "";
}
function B(e) {
  return typeof e == "string" ? e.trim() : "";
}
function C(e) {
  return p(e.analysis_model);
}
function $(e) {
  return C(e) !== "";
}
function h(e, t) {
  const n = B(t);
  if (n) {
    e.retrieval_model = n, e.analysis_model = n;
    return;
  }
  delete e.retrieval_model, e.analysis_model = !1;
}
export {
  k as D,
  D as _,
  h as a,
  $ as c,
  p as r
};
//# sourceMappingURL=queryMode-D9gMlIJK.js.map
