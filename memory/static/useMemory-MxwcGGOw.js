import { defineComponent as $, openBlock as h, createElementBlock as y, createVNode as b, unref as g, createElementVNode as C, createCommentVNode as E, ref as c, watch as V, computed as S, onUnmounted as T } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as w, on as N } from "@wippy-fe/proxy";
import { z as R, e as p, A as U } from "./types-BfEeI96r.js";
const A = { class: "kx-search" }, B = ["value", "placeholder", "aria-label"], I = /* @__PURE__ */ $({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: f }) {
    const s = f;
    return (r, t) => (h(), y("div", A, [
      b(g(x), {
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
        onInput: t[0] || (t[0] = (l) => s("update:modelValue", l.target.value))
      }, null, 40, B),
      e.modelValue ? (h(), y("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: t[1] || (t[1] = (l) => s("update:modelValue", ""))
      }, [
        b(g(x), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : E("", !0)
    ]));
  }
});
function M(e) {
  const f = S(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), s = c(null), r = c(""), t = c(!1), l = c(0);
  let i = 0;
  async function o() {
    if (!e.value) return;
    const a = ++i;
    try {
      const { data: n } = await w.get(`${f.value}/status`);
      if (a !== i) return;
      s.value = n, l.value++;
    } catch (n) {
      a === i && (r.value = p(n));
    }
  }
  async function d(a) {
    t.value = !0, r.value = "";
    try {
      return await a(), await o(), !0;
    } catch (n) {
      return r.value = p(n), !1;
    } finally {
      t.value = !1;
    }
  }
  let u = null;
  return V(e, (a) => {
    if (u && u(), u = null, s.value = null, !a) return;
    const n = N(`component.${a}`, () => {
      o();
    });
    u = typeof n == "function" ? n : null, o();
  }, { immediate: !0 }), T(() => {
    u && u();
  }), U(o), { memoryId: e, base: f, status: s, error: r, busy: t, revision: l, act: d };
}
function O(e, f, s) {
  const r = c([]), t = c(null), l = c(!1), i = c("");
  let o = 0;
  async function d(u) {
    const a = e(), n = ++o;
    if (!a) {
      r.value = [], t.value = null, l.value = !1;
      return;
    }
    l.value = !0;
    try {
      const v = a.includes("?") ? "&" : "?", { data: k } = await w.get(u ? `${a}${v}offset=${u}` : a);
      if (n !== o) return;
      const m = R(k, f);
      r.value = u ? [...r.value, ...m.rows] : m.rows, t.value = m.next, i.value = "";
    } catch (v) {
      n === o && (i.value = p(v));
    } finally {
      n === o && (l.value = !1);
    }
  }
  return V([e, s], () => {
    d(0);
  }, { immediate: !0 }), {
    rows: r,
    next: t,
    loading: l,
    error: i,
    more: () => {
      t.value !== null && !l.value && d(t.value);
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
//# sourceMappingURL=useMemory-MxwcGGOw.js.map
