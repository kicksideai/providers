import { defineComponent as k, openBlock as h, createElementBlock as y, createVNode as g, unref as b, createElementVNode as C, createCommentVNode as E, ref as c, watch as V, computed as S, onUnmounted as T } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as w, on as N } from "@wippy-fe/proxy";
import { z as R, e as p, A as U } from "./types-CLfIEQjM.js";
const A = { class: "kx-search" }, B = ["value", "placeholder", "aria-label"], I = /* @__PURE__ */ k({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: f }) {
    const s = f;
    return (l, t) => (h(), y("div", A, [
      g(b(x), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      C("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder,
        "aria-label": e.label,
        onInput: t[0] || (t[0] = (r) => s("update:modelValue", r.target.value))
      }, null, 40, B),
      e.modelValue ? (h(), y("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: t[1] || (t[1] = (r) => s("update:modelValue", ""))
      }, [
        g(b(x), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : E("", !0)
    ]));
  }
});
function M(e) {
  const f = S(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), s = c(null), l = c(""), t = c(!1), r = c(0);
  let i = 0;
  async function u() {
    if (!e.value) return;
    const a = ++i;
    try {
      const { data: n } = await w.get(`${f.value}/status`);
      if (a !== i) return;
      s.value = n, r.value++;
    } catch (n) {
      a === i && (l.value = p(n));
    }
  }
  async function d(a) {
    t.value = !0, l.value = "";
    try {
      return await a(), await u(), !0;
    } catch (n) {
      return l.value = p(n), !1;
    } finally {
      t.value = !1;
    }
  }
  let o = null;
  return V(e, (a) => {
    if (o && o(), o = null, s.value = null, !a) return;
    const n = N(`component.${a}`, () => {
      u();
    });
    o = typeof n == "function" ? n : null, u();
  }, { immediate: !0 }), T(() => {
    o && o();
  }), U(u), { kbId: e, base: f, status: s, error: l, busy: t, revision: r, act: d };
}
function O(e, f, s) {
  const l = c([]), t = c(null), r = c(!1), i = c("");
  let u = 0;
  async function d(o) {
    const a = e(), n = ++u;
    if (!a) {
      l.value = [], t.value = null, r.value = !1;
      return;
    }
    r.value = !0;
    try {
      const v = a.includes("?") ? "&" : "?", { data: $ } = await w.get(o ? `${a}${v}offset=${o}` : a);
      if (n !== u) return;
      const m = R($, f);
      l.value = o ? [...l.value, ...m.rows] : m.rows, t.value = m.next, i.value = "";
    } catch (v) {
      n === u && (i.value = p(v));
    } finally {
      n === u && (r.value = !1);
    }
  }
  return V([e, s], () => {
    d(0);
  }, { immediate: !0 }), {
    rows: l,
    next: t,
    loading: r,
    error: i,
    more: () => {
      t.value !== null && !r.value && d(t.value);
    }
  };
}
const P = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Y(e) {
  return P[e] || "secondary";
}
export {
  I as _,
  M as a,
  Y as s,
  O as u
};
//# sourceMappingURL=useMemory-DzBogiMW.js.map
