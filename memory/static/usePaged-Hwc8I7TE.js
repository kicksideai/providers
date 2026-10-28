import { defineComponent as M, openBlock as b, createElementBlock as $, createVNode as k, unref as S, createElementVNode as R, createCommentVNode as U, ref as y, watch as x, onScopeDispose as A } from "vue";
import { Icon as E } from "@iconify/vue";
import { api as l } from "@wippy-fe/proxy";
import { x as f, e as C } from "./types-ClUwdCNm.js";
const I = { class: "kx-search" }, T = ["value", "placeholder", "aria-label"], K = /* @__PURE__ */ M({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: o }) {
    const t = o;
    return (n, r) => (b(), $("div", I, [
      k(S(E), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      R("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder,
        "aria-label": e.label,
        onInput: r[0] || (r[0] = (s) => t("update:modelValue", s.target.value))
      }, null, 40, T),
      e.modelValue ? (b(), $("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: r[1] || (r[1] = (s) => t("update:modelValue", ""))
      }, [
        k(S(E), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : U("", !0)
    ]));
  }
});
function V(e) {
  return `/api/v1/memory/${encodeURIComponent(e)}`;
}
function c(e) {
  if (!f(e)) throw new Error("Memory response is malformed");
  return e;
}
function Y(e) {
  if (!(!f(e) || !f(e.response) || typeof e.response.status != "number"))
    return e.response.status;
}
function i(e, o) {
  if (typeof e != "string") throw new Error(`Memory response has an invalid ${o}`);
  return e;
}
function m(e, o, t) {
  if (typeof e != "string" || !o.includes(e)) throw new Error(`Memory response has an invalid ${t}`);
  return e;
}
const N = ["identity", "rule", "profile_slot", "fact", "preference", "plan", "skill", "lesson"], P = ["current", "superseded", "conflict", "archived", "forgotten"], q = ["capture", "reflection", "owner"], L = ["derive", "consolidate", "reembed"], D = ["scheduled", "running", "succeeded", "failed", "rejected"];
function _(e) {
  if (!f(e)) throw new Error("Memory response has an invalid item");
  if (typeof e.version != "number" || !Number.isInteger(e.version)) throw new Error("Memory response has an invalid item version");
  return { id: i(e.id, "item"), kind: m(e.kind, N, "item kind"), scope_family: m(e.scope_family, ["agent", "owner"], "item scope_family"), scope_id: i(e.scope_id, "item scope_id"), key: i(e.key, "item key"), cardinality: m(e.cardinality, ["single", "multi"], "item cardinality"), content: i(e.content, "item content"), status: m(e.status, P, "item status"), version: e.version, valid_at: i(e.valid_at, "item valid_at"), invalid_at: typeof e.invalid_at == "string" || e.invalid_at === null ? e.invalid_at : void 0, recorded_at: i(e.recorded_at, "item recorded_at"), superseded_by: typeof e.superseded_by == "string" || e.superseded_by === null ? e.superseded_by : void 0, source: m(e.source, q, "item source") };
}
function O(e) {
  if (!f(e)) throw new Error("Memory response has an invalid run");
  return { id: i(e.id, "run"), run_type: m(e.run_type, L, "run type"), status: m(e.status, D, "run status"), created_at: i(e.created_at, "run created_at"), last_error: typeof e.last_error == "string" || e.last_error === null ? e.last_error : void 0, stats: f(e.stats) ? e.stats : void 0, host_kind: typeof e.host_kind == "string" ? e.host_kind : void 0, started_at: typeof e.started_at == "string" || e.started_at === null ? e.started_at : void 0, finished_at: typeof e.finished_at == "string" || e.finished_at === null ? e.finished_at : void 0 };
}
function w(e, o, t) {
  const n = c(e), r = n[o];
  if (!Array.isArray(r)) throw new Error(`Memory response is missing ${o}`);
  if (n.next_offset !== void 0 && (typeof n.next_offset != "number" || !Number.isInteger(n.next_offset) || n.next_offset < 0)) throw new Error("Memory response has an invalid next_offset");
  return { rows: r.map(t), next: typeof n.next_offset == "number" ? n.next_offset : null };
}
async function h(e, o, t) {
  const { data: n } = await l.get(e);
  return w(n, o, t);
}
async function G(e = "", o = 0) {
  const t = new URLSearchParams({ limit: "20" });
  return e && t.set("q", e), o && t.set("offset", String(o)), h(`/api/v1/memory?${t}`, "items", (n) => {
    const r = c(n);
    return { id: i(r.id, "memory"), name: i(r.name, "memory name"), description: typeof r.description == "string" ? r.description : void 0, item_count: typeof r.item_count == "number" ? r.item_count : void 0 };
  });
}
async function H(e) {
  const { data: o } = await l.get(`/api/v1/knowledge/${encodeURIComponent(e)}`), t = c(o);
  if (t.kb_type !== "memory" || typeof t.name != "string") throw new Error("Selected resource is not a memory");
  return { id: e, name: t.name };
}
function J(e) {
  const o = V(e);
  return {
    async status() {
      const { data: t } = await l.get(`${o}/status`), n = c(t);
      if (!f(n.counts) || !Array.isArray(n.runs)) throw new Error("Memory status response is malformed");
      const r = {};
      for (const [s, u] of Object.entries(n.counts)) {
        if (!["current", "superseded", "conflict", "archived", "forgotten", "total", "conflict_groups"].includes(s) || typeof u != "number" || u < 0) throw new Error("Memory response has an invalid count");
        r[s] = u;
      }
      return { counts: r, runs: n.runs.map(O) };
    },
    items(t) {
      const n = new URLSearchParams({ status: t.status, limit: "100" });
      return t.query && n.set("q", t.query), t.offset && n.set("offset", String(t.offset)), h(`${o}/items?${n}`, "items", _);
    },
    topics(t) {
      const n = new URLSearchParams({ scope_family: "agent", kind: t.kind });
      return t.offset && n.set("offset", String(t.offset)), h(`${o}/topics?${n}`, "topics", (r) => {
        const s = c(r);
        return { key: i(s.key, "topic key"), cardinality: m(s.cardinality, ["single", "multi"], "topic cardinality"), current_count: typeof s.current_count == "number" ? s.current_count : (() => {
          throw new Error("Memory response has an invalid topic count");
        })() };
      });
    },
    conflicts(t = 0) {
      return h(`${o}/conflicts${t ? `?offset=${t}` : ""}`, "groups", (n) => {
        const r = c(n);
        if (!Array.isArray(r.items) || !r.items.length) throw new Error("Memory response has an invalid conflict group");
        return { group_id: i(r.group_id, "conflict group"), items: r.items.map(_) };
      });
    },
    async item(t, n = 0, r) {
      const s = new URLSearchParams();
      n && s.set("offset", String(n)), r && s.set("limit", String(r));
      const { data: u } = await l.get(`${o}/items/${encodeURIComponent(t)}${s.size ? `?${s}` : ""}`), a = c(u);
      if (!f(a.item) || !Array.isArray(a.provenance)) throw new Error("Memory detail response is malformed");
      return { item: _(a.item), provenance: a.provenance.map((v) => {
        const d = c(v);
        return { host_kind: i(d.host_kind, "provenance host_kind"), host_id: i(d.host_id, "provenance host_id"), event_id: i(d.event_id, "provenance event_id"), recorded_at: typeof d.recorded_at == "string" ? d.recorded_at : void 0 };
      }), versions: w(a, "versions", _) };
    },
    async create(t) {
      const { data: n } = await l.post(`${o}/items`, t), r = c(n);
      if (typeof r.item_id != "string" || !r.item_id) throw new Error("Memory create response is missing item_id");
      return r.item_id;
    },
    async edit(t, n) {
      const { data: r } = await l.put(`${o}/items/${encodeURIComponent(t)}`, { content: n }), s = c(r);
      if (s.item_id !== void 0 && typeof s.item_id != "string") throw new Error("Memory edit response is malformed");
      return s.item_id;
    },
    act(t, n) {
      return l.post(`${o}/items/${encodeURIComponent(t)}/${n}`, {});
    },
    resolve(t, n) {
      return l.post(`${o}/conflicts/${encodeURIComponent(t)}/resolve`, { winner_id: n });
    }
  };
}
function Q(e, o, t = (n) => n) {
  const n = y(t(e.value));
  let r;
  return x(e, (s) => {
    clearTimeout(r), r = setTimeout(() => {
      n.value = t(s);
    }, o);
  }), A(() => clearTimeout(r)), n;
}
function W(e, o, t) {
  const n = y([]), r = y(null), s = y(!1), u = y("");
  let a = 0;
  async function v(d) {
    const g = ++a;
    if (e() === null) {
      n.value = [], r.value = null, s.value = !1;
      return;
    }
    s.value = !0;
    try {
      const p = await o(d);
      if (g !== a) return;
      n.value = d ? [...n.value, ...p.rows] : p.rows, r.value = p.next, u.value = "";
    } catch (p) {
      g === a && (u.value = C(p));
    } finally {
      g === a && (s.value = !1);
    }
  }
  return x(t ? [e, t] : [e], () => {
    v(0);
  }, { immediate: !0 }), { rows: n, next: r, loading: s, error: u, more: () => {
    r.value !== null && !s.value && v(r.value);
  } };
}
export {
  K as _,
  W as a,
  Y as h,
  G as l,
  J as m,
  H as r,
  Q as u
};
//# sourceMappingURL=usePaged-Hwc8I7TE.js.map
