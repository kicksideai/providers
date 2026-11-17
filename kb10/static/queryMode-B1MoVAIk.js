import { defineComponent as c, openBlock as l, createElementBlock as m, normalizeClass as u, createBlock as o, unref as i, createCommentVNode as y, createElementVNode as f, renderSlot as b } from "vue";
import { Icon as r } from "@iconify/vue";
const k = ["type", "disabled"], x = /* @__PURE__ */ c({
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
  setup(e, { emit: n }) {
    const t = n;
    return (d, a) => (l(), m("button", {
      class: u(["kx-btn", [`kx-btn-${e.variant}`, e.small && "sm"]]),
      type: e.type,
      disabled: e.disabled,
      onClick: a[0] || (a[0] = (B) => t("click"))
    }, [
      e.loading ? (l(), o(i(r), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : e.icon ? (l(), o(i(r), {
        key: 1,
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : y("", !0),
      f("span", null, [
        b(d.$slots, "default")
      ])
    ], 10, k));
  }
});
function s(e) {
  return typeof e == "string" ? e.trim() : "";
}
function p(e) {
  return s(e.analysis_model);
}
function $(e) {
  return p(e) !== "";
}
function h(e, n) {
  const t = s(n);
  if (t) {
    e.retrieval_model = t, e.analysis_model = t;
    return;
  }
  delete e.retrieval_model, e.analysis_model = !1;
}
export {
  x as _,
  h as a,
  $ as c
};
//# sourceMappingURL=queryMode-B1MoVAIk.js.map
