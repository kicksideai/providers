import { defineComponent as $, openBlock as h, createElementBlock as y, createVNode as b, unref as g, createElementVNode as C, createCommentVNode as E, ref as i, watch as V, computed as S, onUnmounted as T } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as w, on as N } from "@wippy-fe/proxy";
import { x as R, e as p, X as U } from "./types-yNEBYydW.js";
const B = { class: "kx-search" }, P = ["value", "placeholder", "aria-label"], M = /* @__PURE__ */ $({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: f }) {
    const s = f;
    return (t, a) => (h(), y("div", B, [
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
        onInput: a[0] || (a[0] = (r) => s("update:modelValue", r.target.value))
      }, null, 40, P),
      e.modelValue ? (h(), y("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: a[1] || (a[1] = (r) => s("update:modelValue", ""))
      }, [
        b(g(x), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : E("", !0)
    ]));
  }
});
function O(e) {
  const f = S(() => `/api/v1/memory/${encodeURIComponent(e.value)}`), s = i(null), t = i(""), a = i(!1), r = i(0);
  let c = 0;
  async function o() {
    const n = ++c;
    if (!e.value) return !1;
    try {
      const { data: l } = await w.get(`${f.value}/status`);
      return n !== c ? !1 : (s.value = l, t.value = "", r.value++, !0);
    } catch (l) {
      return n === c && (t.value = p(l)), !1;
    }
  }
  async function d(n) {
    a.value = !0, t.value = "";
    try {
      return await n(), await o();
    } catch (l) {
      return t.value = p(l), !1;
    } finally {
      a.value = !1;
    }
  }
  let u = null;
  return V(e, (n) => {
    if (u && u(), u = null, c++, s.value = null, t.value = "", !n) return;
    const l = N(`component.${n}`, () => {
      o();
    });
    u = typeof l == "function" ? l : null, o();
  }, { immediate: !0 }), T(() => {
    u && u();
  }), U(async () => {
    await o();
  }), { memoryId: e, base: f, status: s, error: t, busy: a, revision: r, act: d };
}
function X(e, f, s) {
  const t = i([]), a = i(null), r = i(!1), c = i("");
  let o = 0;
  async function d(u) {
    const n = e(), l = ++o;
    if (!n) {
      t.value = [], a.value = null, r.value = !1;
      return;
    }
    r.value = !0;
    try {
      const v = n.includes("?") ? "&" : "?", { data: k } = await w.get(u ? `${n}${v}offset=${u}` : n);
      if (l !== o) return;
      const m = R(k, f);
      t.value = u ? [...t.value, ...m.rows] : m.rows, a.value = m.next, c.value = "";
    } catch (v) {
      l === o && (c.value = p(v));
    } finally {
      l === o && (r.value = !1);
    }
  }
  return V([e, s], () => {
    d(0);
  }, { immediate: !0 }), {
    rows: t,
    next: a,
    loading: r,
    error: c,
    more: () => {
      a.value !== null && !r.value && d(a.value);
    }
  };
}
const _ = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function Y(e) {
  return _[e] || "secondary";
}
export {
  M as _,
  O as a,
  Y as s,
  X as u
};
//# sourceMappingURL=useMemory-DLBqiJmH.js.map
