import { defineComponent as r, openBlock as t, createElementBlock as s, normalizeClass as m, createBlock as a, unref as l, createCommentVNode as u, createElementVNode as b, renderSlot as k } from "vue";
import { Icon as o } from "@iconify/vue";
const y = ["type", "disabled"], C = /* @__PURE__ */ r({
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
  setup(e, { emit: i }) {
    const c = i;
    return (d, n) => (t(), s("button", {
      class: m(["kx-btn", [`kx-btn-${e.variant}`, e.small && "sm"]]),
      type: e.type,
      disabled: e.disabled,
      onClick: n[0] || (n[0] = (f) => c("click"))
    }, [
      e.loading ? (t(), a(l(o), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : e.icon ? (t(), a(l(o), {
        key: 1,
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : u("", !0),
      b("span", null, [
        k(d.$slots, "default")
      ])
    ], 10, y));
  }
});
export {
  C as _
};
