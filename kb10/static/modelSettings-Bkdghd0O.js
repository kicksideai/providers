import { defineComponent as c, openBlock as n, createElementBlock as d, normalizeClass as m, createBlock as l, unref as a, createCommentVNode as u, createElementVNode as f, renderSlot as y } from "vue";
import { Icon as i } from "@iconify/vue";
const b = ["type", "disabled"], E = /* @__PURE__ */ c({
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
    const r = t;
    return (s, o) => (n(), d("button", {
      class: m(["kx-btn", [`kx-btn-${e.variant}`, e.small && "sm"]]),
      type: e.type,
      disabled: e.disabled,
      onClick: o[0] || (o[0] = (B) => r("click"))
    }, [
      e.loading ? (n(), l(a(i), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : e.icon ? (n(), l(a(i), {
        key: 1,
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : u("", !0),
      f("span", null, [
        y(s.$slots, "default")
      ])
    ], 10, b));
  }
}), k = "class:fast";
function g(e, t = k) {
  return e == null || e === "" ? t : typeof e == "string" && e.trim() ? e : "";
}
export {
  k as D,
  E as _,
  g as r
};
//# sourceMappingURL=modelSettings-Bkdghd0O.js.map
