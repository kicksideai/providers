import { defineComponent as A, openBlock as k, createElementBlock as b, createVNode as x, unref as S, createElementVNode as C, createCommentVNode as I, ref as p, watch as M, onScopeDispose as T } from "vue";
import { Icon as E } from "@iconify/vue";
import { api as l } from "@wippy-fe/proxy";
import { i as m, e as V } from "./types-DQ01_s6c.js";
const N = { class: "kx-search" }, P = ["value", "placeholder", "aria-label"], $ = /* @__PURE__ */ A({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: r }) {
    const n = r;
    return (t, o) => (k(), b("div", N, [
      x(S(E), {
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
        onInput: o[0] || (o[0] = (i) => n("update:modelValue", i.target.value))
      }, null, 40, P),
      e.modelValue ? (k(), b("button", {
        key: 0,
        type: "button",
        class: "kx-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (i) => n("update:modelValue", ""))
      }, [
        x(S(E), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : I("", !0)
    ]));
  }
});
function q(e) {
  return "/api/v1/memory/".concat(encodeURIComponent(e));
}
function a(e) {
  if (!m(e)) throw new Error("Memory response is malformed");
  return e;
}
function G(e) {
  if (!(!m(e) || !m(e.response) || typeof e.response.status != "number"))
    return e.response.status;
}
function s(e, r) {
  if (typeof e != "string") throw new Error("Memory response has an invalid ".concat(r));
  return e;
}
function c(e, r, n) {
  if (typeof e != "string" || !r.includes(e)) throw new Error("Memory response has an invalid ".concat(n));
  return e;
}
const R = ["identity", "rule", "profile_slot", "fact", "preference", "plan", "skill", "lesson"], w = ["current", "superseded", "conflict", "archived", "forgotten"], L = ["capture", "reflection", "owner"], D = ["derive", "consolidate", "reembed"], O = ["scheduled", "running", "succeeded", "failed", "rejected", "cancelled"];
function y(e) {
  if (!m(e)) throw new Error("Memory response has an invalid item");
  if (typeof e.version != "number" || !Number.isInteger(e.version)) throw new Error("Memory response has an invalid item version");
  return { id: s(e.id, "item"), kind: c(e.kind, R, "item kind"), scope_family: c(e.scope_family, ["agent", "owner"], "item scope_family"), scope_id: s(e.scope_id, "item scope_id"), key: s(e.key, "item key"), cardinality: c(e.cardinality, ["single", "multi"], "item cardinality"), content: s(e.content, "item content"), value: e.value, status: c(e.status, w, "item status"), version: e.version, valid_at: s(e.valid_at, "item valid_at"), invalid_at: typeof e.invalid_at == "string" || e.invalid_at === null ? e.invalid_at : void 0, recorded_at: s(e.recorded_at, "item recorded_at"), superseded_by: typeof e.superseded_by == "string" || e.superseded_by === null ? e.superseded_by : void 0, source: c(e.source, L, "item source") };
}
function j(e) {
  const r = a(e), n = { host_kind: s(r.host_kind, "provenance host_kind"), host_id: s(r.host_id, "provenance host_id"), event_id: s(r.event_id, "provenance event_id"), recorded_at: typeof r.recorded_at == "string" ? r.recorded_at : void 0 };
  if (r.line !== void 0) {
    const t = a(r.line);
    if (n.line = { role: c(t.role, ["user", "assistant", "tool", "document"], "source line role"), text: s(t.text, "source line text"), created_at: typeof t.created_at == "string" ? t.created_at : void 0 }, t.author !== void 0) {
      const o = a(t.author);
      n.line.author = { kind: c(o.kind, ["user", "agent", "system", "unknown", "document"], "source author kind"), id: o.id === void 0 ? void 0 : s(o.id, "source author id") };
    }
  }
  if (r.memory !== void 0) {
    const t = a(r.memory);
    n.memory = { id: s(t.id, "source memory"), kind: c(t.kind, R, "source memory kind"), key: s(t.key, "source memory key"), content: s(t.content, "source memory content"), status: c(t.status, w, "source memory status") };
  }
  return n;
}
function B(e) {
  if (!m(e)) throw new Error("Memory response has an invalid run");
  return { id: s(e.id, "run"), run_type: c(e.run_type, D, "run type"), status: c(e.status, O, "run status"), created_at: s(e.created_at, "run created_at"), last_error: typeof e.last_error == "string" || e.last_error === null ? e.last_error : void 0, stats: m(e.stats) ? e.stats : void 0, host_kind: typeof e.host_kind == "string" ? e.host_kind : void 0, from_event_id: typeof e.from_event_id == "string" ? e.from_event_id : void 0, to_event_id: typeof e.to_event_id == "string" ? e.to_event_id : void 0, model_output: e.model_output, started_at: typeof e.started_at == "string" || e.started_at === null ? e.started_at : void 0, finished_at: typeof e.finished_at == "string" || e.finished_at === null ? e.finished_at : void 0 };
}
function U(e, r, n) {
  const t = a(e), o = t[r];
  if (!Array.isArray(o)) throw new Error("Memory response is missing ".concat(r));
  if (t.next_offset !== void 0 && (typeof t.next_offset != "number" || !Number.isInteger(t.next_offset) || t.next_offset < 0)) throw new Error("Memory response has an invalid next_offset");
  return { rows: o.map(n), next: typeof t.next_offset == "number" ? t.next_offset : null };
}
async function v(e, r, n) {
  const { data: t } = await l.get(e);
  return U(t, r, n);
}
async function H(e = "", r = 0) {
  const n = new URLSearchParams({ limit: "20" });
  return e && n.set("q", e), r && n.set("offset", String(r)), v("/api/v1/memory?".concat(n), "items", (t) => {
    const o = a(t);
    return { id: s(o.id, "memory"), name: s(o.name, "memory name"), description: typeof o.description == "string" ? o.description : void 0, item_count: typeof o.item_count == "number" ? o.item_count : void 0 };
  });
}
async function J(e) {
  const { data: r } = await l.get("/api/v1/knowledge/".concat(encodeURIComponent(e))), n = a(r);
  if (n.kb_type !== "memory" || typeof n.name != "string") throw new Error("Selected resource is not a memory");
  return { id: e, name: n.name };
}
function Q(e) {
  const r = q(e);
  return {
    async status() {
      const { data: n } = await l.get("".concat(r, "/status")), t = a(n);
      if (!m(t.counts) || !Array.isArray(t.runs)) throw new Error("Memory status response is malformed");
      const o = {};
      for (const [i, d] of Object.entries(t.counts)) {
        if (!["current", "superseded", "conflict", "archived", "forgotten", "total", "conflict_groups"].includes(i) || typeof d != "number" || d < 0) throw new Error("Memory response has an invalid count");
        o[i] = d;
      }
      return { counts: o, runs: t.runs.map(B) };
    },
    items(n) {
      const t = new URLSearchParams({ status: n.status, limit: "100" });
      return n.query && t.set("q", n.query), n.offset && t.set("offset", String(n.offset)), v("".concat(r, "/items?").concat(t), "items", y);
    },
    topics(n) {
      const t = new URLSearchParams({ scope_family: "agent", kind: n.kind });
      return n.offset && t.set("offset", String(n.offset)), v("".concat(r, "/topics?").concat(t), "topics", (o) => {
        const i = a(o);
        return { key: s(i.key, "topic key"), cardinality: c(i.cardinality, ["single", "multi"], "topic cardinality"), current_count: typeof i.current_count == "number" ? i.current_count : (() => {
          throw new Error("Memory response has an invalid topic count");
        })() };
      });
    },
    conflicts(n = 0) {
      return v("".concat(r, "/conflicts").concat(n ? "?offset=".concat(n) : ""), "groups", (t) => {
        const o = a(t);
        if (!Array.isArray(o.items) || !o.items.length) throw new Error("Memory response has an invalid conflict group");
        return { group_id: s(o.group_id, "conflict group"), items: o.items.map(y) };
      });
    },
    async item(n, t = 0, o) {
      const i = new URLSearchParams();
      t && i.set("offset", String(t)), o && i.set("limit", String(o));
      const { data: d } = await l.get("".concat(r, "/items/").concat(encodeURIComponent(n)).concat(i.size ? "?".concat(i) : "")), u = a(d);
      if (!m(u.item) || !Array.isArray(u.provenance)) throw new Error("Memory detail response is malformed");
      return { item: y(u.item), provenance: u.provenance.map(j), versions: U(u, "versions", y) };
    },
    async create(n) {
      const { data: t } = await l.post("".concat(r, "/items"), n), o = a(t);
      if (typeof o.item_id != "string" || !o.item_id) throw new Error("Memory create response is missing item_id");
      return o.item_id;
    },
    async edit(n, t) {
      const { data: o } = await l.put("".concat(r, "/items/").concat(encodeURIComponent(n)), t), i = a(o);
      if (i.item_id !== void 0 && typeof i.item_id != "string") throw new Error("Memory edit response is malformed");
      return i.item_id;
    },
    act(n, t) {
      return l.post("".concat(r, "/items/").concat(encodeURIComponent(n), "/").concat(t), {});
    },
    resolve(n, t) {
      return l.post("".concat(r, "/conflicts/").concat(encodeURIComponent(n), "/resolve"), { winner_id: t });
    }
  };
}
function W(e, r, n = (t) => t) {
  const t = p(n(e.value));
  let o;
  return M(e, (i) => {
    clearTimeout(o), o = setTimeout(() => {
      t.value = n(i);
    }, r);
  }), T(() => clearTimeout(o)), t;
}
function X(e, r, n) {
  const t = p([]), o = p(null), i = p(!1), d = p("");
  let u = 0;
  async function h(g) {
    const _ = ++u;
    if (e() === null) {
      t.value = [], o.value = null, i.value = !1;
      return;
    }
    i.value = !0;
    try {
      const f = await r(g);
      if (_ !== u) return;
      t.value = g ? [...t.value, ...f.rows] : f.rows, o.value = f.next, d.value = "";
    } catch (f) {
      _ === u && (d.value = V(f));
    } finally {
      _ === u && (i.value = !1);
    }
  }
  return M(n ? [e, n] : [e], () => {
    h(0);
  }, { immediate: !0 }), { rows: t, next: o, loading: i, error: d, more: () => {
    o.value !== null && !i.value && h(o.value);
  } };
}
export {
  $ as _,
  X as a,
  G as h,
  H as l,
  Q as m,
  J as r,
  W as u
};
//# sourceMappingURL=usePaged-BxR1AKIL.js.map
