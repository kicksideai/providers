import { defineComponent as E, openBlock as $, createElementBlock as b, createVNode as x, unref as k, createElementVNode as I, createCommentVNode as R, ref as c, watch as _, onScopeDispose as S } from "vue";
import { Icon as C } from "@iconify/vue";
import { api as i } from "@wippy-fe/proxy";
import { x as m, y as h, e as U } from "./types-CkAlvrJt.js";
const M = { class: "kx-search" }, A = ["value", "placeholder", "aria-label"], z = /* @__PURE__ */ E({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: a }) {
    const e = a;
    return (r, n) => ($(), b("div", M, [
      x(k(C), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      I("input", {
        class: "kx-search-input",
        type: "text",
        value: t.modelValue,
        placeholder: t.placeholder,
        "aria-label": t.label,
        onInput: n[0] || (n[0] = (o) => e("update:modelValue", o.target.value))
      }, null, 40, A),
      t.modelValue ? ($(), b("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: n[1] || (n[1] = (o) => e("update:modelValue", ""))
      }, [
        x(k(C), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : R("", !0)
    ]));
  }
});
function P(t) {
  return `/api/v1/memory/${encodeURIComponent(t)}`;
}
function l(t) {
  if (!m(t)) throw new Error("Memory response is malformed");
  return t;
}
function F(t) {
  if (!(!m(t) || !m(t.response) || typeof t.response.status != "number"))
    return t.response.status;
}
async function w(t, a) {
  const { data: e } = await i.get(t);
  return h(e, a);
}
async function L(t) {
  const { data: a } = await i.get(`/api/v1/knowledge/${encodeURIComponent(t)}`), e = l(a);
  if (e.kb_type !== "memory" || typeof e.name != "string") throw new Error("Selected resource is not a memory");
  return { id: t, name: e.name };
}
function O(t) {
  const a = P(t);
  return {
    async status() {
      const { data: e } = await i.get(`${a}/status`), r = l(e);
      if (!m(r.counts) || !Array.isArray(r.runs)) throw new Error("Memory status response is malformed");
      return { counts: r.counts, runs: r.runs };
    },
    items(e) {
      return w(e, "items");
    },
    topics(e) {
      return w(e, "topics");
    },
    conflicts(e) {
      return w(e, "groups");
    },
    async item(e, r = 0, n) {
      const o = new URLSearchParams();
      r && o.set("offset", String(r)), n && o.set("limit", String(n));
      const { data: u } = await i.get(`${a}/items/${encodeURIComponent(e)}${o.size ? `?${o}` : ""}`), s = l(u);
      if (!m(s.item) || !Array.isArray(s.provenance)) throw new Error("Memory detail response is malformed");
      return { item: s.item, provenance: s.provenance, versions: h(s, "versions") };
    },
    async create(e) {
      const { data: r } = await i.post(`${a}/items`, e), n = l(r);
      if (typeof n.item_id != "string" || !n.item_id) throw new Error("Memory create response is missing item_id");
      return n.item_id;
    },
    async edit(e, r) {
      const { data: n } = await i.put(`${a}/items/${encodeURIComponent(e)}`, { content: r }), o = l(n);
      if (o.item_id !== void 0 && typeof o.item_id != "string") throw new Error("Memory edit response is malformed");
      return o.item_id;
    },
    act(e, r) {
      return i.post(`${a}/items/${encodeURIComponent(e)}/${r}`, {});
    },
    resolve(e, r) {
      return i.post(`${a}/conflicts/${encodeURIComponent(e)}/resolve`, { winner_id: r });
    }
  };
}
function j(t, a, e = (r) => r) {
  const r = c(e(t.value));
  let n;
  return _(t, (o) => {
    clearTimeout(n), n = setTimeout(() => {
      r.value = e(o);
    }, a);
  }), S(() => clearTimeout(n)), r;
}
function q(t, a, e) {
  const r = c([]), n = c(null), o = c(!1), u = c("");
  let s = 0;
  async function g(p) {
    const d = t(), f = ++s;
    if (!d) {
      r.value = [], n.value = null, o.value = !1;
      return;
    }
    o.value = !0;
    try {
      const v = d.includes("?") ? "&" : "?", { data: V } = await i.get(p ? `${d}${v}offset=${p}` : d);
      if (f !== s) return;
      const y = h(V, a);
      r.value = p ? [...r.value, ...y.rows] : y.rows, n.value = y.next, u.value = "";
    } catch (v) {
      f === s && (u.value = U(v));
    } finally {
      f === s && (o.value = !1);
    }
  }
  return _(e ? [t, e] : [t], () => {
    g(0);
  }, { immediate: !0 }), { rows: r, next: n, loading: o, error: u, more: () => {
    n.value !== null && !o.value && g(n.value);
  } };
}
export {
  z as _,
  q as a,
  F as h,
  O as m,
  L as r,
  j as u
};
//# sourceMappingURL=usePaged-DiPI-biL.js.map
