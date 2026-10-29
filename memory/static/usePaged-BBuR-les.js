import { defineComponent as U, openBlock as k, createElementBlock as b, createVNode as $, unref as x, createElementVNode as A, createCommentVNode as C, ref as p, watch as E, onScopeDispose as I } from "vue";
import { Icon as S } from "@iconify/vue";
import { api as l } from "@wippy-fe/proxy";
import { w as m, e as T } from "./types-Dpmtmezp.js";
const V = { class: "kx-search" }, N = ["value", "placeholder", "aria-label"], Y = /* @__PURE__ */ U({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: r }) {
    const n = r;
    return (t, o) => (k(), b("div", V, [
      $(x(S), {
        class: "kx-search-ico",
        icon: "tabler:search",
        "aria-hidden": "true"
      }),
      A("input", {
        class: "kx-search-input",
        type: "text",
        value: e.modelValue,
        placeholder: e.placeholder,
        "aria-label": e.label,
        onInput: o[0] || (o[0] = (s) => n("update:modelValue", s.target.value))
      }, null, 40, N),
      e.modelValue ? (k(), b("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (s) => n("update:modelValue", ""))
      }, [
        $(x(S), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : C("", !0)
    ]));
  }
});
function P(e) {
  return `/api/v1/memory/${encodeURIComponent(e)}`;
}
function a(e) {
  if (!m(e)) throw new Error("Memory response is malformed");
  return e;
}
function G(e) {
  if (!(!m(e) || !m(e.response) || typeof e.response.status != "number"))
    return e.response.status;
}
function i(e, r) {
  if (typeof e != "string") throw new Error(`Memory response has an invalid ${r}`);
  return e;
}
function c(e, r, n) {
  if (typeof e != "string" || !r.includes(e)) throw new Error(`Memory response has an invalid ${n}`);
  return e;
}
const w = ["identity", "rule", "profile_slot", "fact", "preference", "plan", "skill", "lesson"], M = ["current", "superseded", "conflict", "archived", "forgotten"], q = ["capture", "reflection", "owner"], L = ["derive", "consolidate", "reembed"], D = ["scheduled", "running", "succeeded", "failed", "rejected"];
function y(e) {
  if (!m(e)) throw new Error("Memory response has an invalid item");
  if (typeof e.version != "number" || !Number.isInteger(e.version)) throw new Error("Memory response has an invalid item version");
  return { id: i(e.id, "item"), kind: c(e.kind, w, "item kind"), scope_family: c(e.scope_family, ["agent", "owner"], "item scope_family"), scope_id: i(e.scope_id, "item scope_id"), key: i(e.key, "item key"), cardinality: c(e.cardinality, ["single", "multi"], "item cardinality"), content: i(e.content, "item content"), value: e.value, status: c(e.status, M, "item status"), version: e.version, valid_at: i(e.valid_at, "item valid_at"), invalid_at: typeof e.invalid_at == "string" || e.invalid_at === null ? e.invalid_at : void 0, recorded_at: i(e.recorded_at, "item recorded_at"), superseded_by: typeof e.superseded_by == "string" || e.superseded_by === null ? e.superseded_by : void 0, source: c(e.source, q, "item source") };
}
function O(e) {
  const r = a(e), n = { host_kind: i(r.host_kind, "provenance host_kind"), host_id: i(r.host_id, "provenance host_id"), event_id: i(r.event_id, "provenance event_id"), recorded_at: typeof r.recorded_at == "string" ? r.recorded_at : void 0 };
  if (r.line !== void 0) {
    const t = a(r.line);
    if (n.line = { role: c(t.role, ["user", "assistant", "tool", "document"], "source line role"), text: i(t.text, "source line text"), created_at: typeof t.created_at == "string" ? t.created_at : void 0 }, t.author !== void 0) {
      const o = a(t.author);
      n.line.author = { kind: c(o.kind, ["user", "agent", "system", "unknown", "document"], "source author kind"), id: o.id === void 0 ? void 0 : i(o.id, "source author id") };
    }
  }
  if (r.memory !== void 0) {
    const t = a(r.memory);
    n.memory = { id: i(t.id, "source memory"), kind: c(t.kind, w, "source memory kind"), key: i(t.key, "source memory key"), content: i(t.content, "source memory content"), status: c(t.status, M, "source memory status") };
  }
  return n;
}
function j(e) {
  if (!m(e)) throw new Error("Memory response has an invalid run");
  return { id: i(e.id, "run"), run_type: c(e.run_type, L, "run type"), status: c(e.status, D, "run status"), created_at: i(e.created_at, "run created_at"), last_error: typeof e.last_error == "string" || e.last_error === null ? e.last_error : void 0, stats: m(e.stats) ? e.stats : void 0, host_kind: typeof e.host_kind == "string" ? e.host_kind : void 0, started_at: typeof e.started_at == "string" || e.started_at === null ? e.started_at : void 0, finished_at: typeof e.finished_at == "string" || e.finished_at === null ? e.finished_at : void 0 };
}
function R(e, r, n) {
  const t = a(e), o = t[r];
  if (!Array.isArray(o)) throw new Error(`Memory response is missing ${r}`);
  if (t.next_offset !== void 0 && (typeof t.next_offset != "number" || !Number.isInteger(t.next_offset) || t.next_offset < 0)) throw new Error("Memory response has an invalid next_offset");
  return { rows: o.map(n), next: typeof t.next_offset == "number" ? t.next_offset : null };
}
async function v(e, r, n) {
  const { data: t } = await l.get(e);
  return R(t, r, n);
}
async function H(e = "", r = 0) {
  const n = new URLSearchParams({ limit: "20" });
  return e && n.set("q", e), r && n.set("offset", String(r)), v(`/api/v1/memory?${n}`, "items", (t) => {
    const o = a(t);
    return { id: i(o.id, "memory"), name: i(o.name, "memory name"), description: typeof o.description == "string" ? o.description : void 0, item_count: typeof o.item_count == "number" ? o.item_count : void 0 };
  });
}
async function J(e) {
  const { data: r } = await l.get(`/api/v1/knowledge/${encodeURIComponent(e)}`), n = a(r);
  if (n.kb_type !== "memory" || typeof n.name != "string") throw new Error("Selected resource is not a memory");
  return { id: e, name: n.name };
}
function Q(e) {
  const r = P(e);
  return {
    async status() {
      const { data: n } = await l.get(`${r}/status`), t = a(n);
      if (!m(t.counts) || !Array.isArray(t.runs)) throw new Error("Memory status response is malformed");
      const o = {};
      for (const [s, d] of Object.entries(t.counts)) {
        if (!["current", "superseded", "conflict", "archived", "forgotten", "total", "conflict_groups"].includes(s) || typeof d != "number" || d < 0) throw new Error("Memory response has an invalid count");
        o[s] = d;
      }
      return { counts: o, runs: t.runs.map(j) };
    },
    items(n) {
      const t = new URLSearchParams({ status: n.status, limit: "100" });
      return n.query && t.set("q", n.query), n.offset && t.set("offset", String(n.offset)), v(`${r}/items?${t}`, "items", y);
    },
    topics(n) {
      const t = new URLSearchParams({ scope_family: "agent", kind: n.kind });
      return n.offset && t.set("offset", String(n.offset)), v(`${r}/topics?${t}`, "topics", (o) => {
        const s = a(o);
        return { key: i(s.key, "topic key"), cardinality: c(s.cardinality, ["single", "multi"], "topic cardinality"), current_count: typeof s.current_count == "number" ? s.current_count : (() => {
          throw new Error("Memory response has an invalid topic count");
        })() };
      });
    },
    conflicts(n = 0) {
      return v(`${r}/conflicts${n ? `?offset=${n}` : ""}`, "groups", (t) => {
        const o = a(t);
        if (!Array.isArray(o.items) || !o.items.length) throw new Error("Memory response has an invalid conflict group");
        return { group_id: i(o.group_id, "conflict group"), items: o.items.map(y) };
      });
    },
    async item(n, t = 0, o) {
      const s = new URLSearchParams();
      t && s.set("offset", String(t)), o && s.set("limit", String(o));
      const { data: d } = await l.get(`${r}/items/${encodeURIComponent(n)}${s.size ? `?${s}` : ""}`), u = a(d);
      if (!m(u.item) || !Array.isArray(u.provenance)) throw new Error("Memory detail response is malformed");
      return { item: y(u.item), provenance: u.provenance.map(O), versions: R(u, "versions", y) };
    },
    async create(n) {
      const { data: t } = await l.post(`${r}/items`, n), o = a(t);
      if (typeof o.item_id != "string" || !o.item_id) throw new Error("Memory create response is missing item_id");
      return o.item_id;
    },
    async edit(n, t) {
      const { data: o } = await l.put(`${r}/items/${encodeURIComponent(n)}`, t), s = a(o);
      if (s.item_id !== void 0 && typeof s.item_id != "string") throw new Error("Memory edit response is malformed");
      return s.item_id;
    },
    act(n, t) {
      return l.post(`${r}/items/${encodeURIComponent(n)}/${t}`, {});
    },
    resolve(n, t) {
      return l.post(`${r}/conflicts/${encodeURIComponent(n)}/resolve`, { winner_id: t });
    }
  };
}
function W(e, r, n = (t) => t) {
  const t = p(n(e.value));
  let o;
  return E(e, (s) => {
    clearTimeout(o), o = setTimeout(() => {
      t.value = n(s);
    }, r);
  }), I(() => clearTimeout(o)), t;
}
function X(e, r, n) {
  const t = p([]), o = p(null), s = p(!1), d = p("");
  let u = 0;
  async function h(g) {
    const _ = ++u;
    if (e() === null) {
      t.value = [], o.value = null, s.value = !1;
      return;
    }
    s.value = !0;
    try {
      const f = await r(g);
      if (_ !== u) return;
      t.value = g ? [...t.value, ...f.rows] : f.rows, o.value = f.next, d.value = "";
    } catch (f) {
      _ === u && (d.value = T(f));
    } finally {
      _ === u && (s.value = !1);
    }
  }
  return E(n ? [e, n] : [e], () => {
    h(0);
  }, { immediate: !0 }), { rows: t, next: o, loading: s, error: d, more: () => {
    o.value !== null && !s.value && h(o.value);
  } };
}
export {
  Y as _,
  X as a,
  G as h,
  H as l,
  Q as m,
  J as r,
  W as u
};
//# sourceMappingURL=usePaged-BBuR-les.js.map
