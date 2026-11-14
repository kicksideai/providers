import { defineComponent as D, ref as d, watch as I, computed as S, openBlock as o, createElementBlock as s, createElementVNode as l, toDisplayString as r, createCommentVNode as c, createTextVNode as z, withDirectives as x, Fragment as P, renderList as M, vModelSelect as A, vModelText as E, normalizeClass as F } from "vue";
import { api as N } from "@wippy-fe/proxy";
import { a as j, u as G } from "./wc-runtime-CNDpK4lj.js";
const H = { class: "mcp picker" }, J = { class: "picker-head" }, K = {
  key: 0,
  class: "count"
}, O = { class: "field" }, Q = ["disabled"], W = { value: "" }, X = ["value"], Y = {
  key: 0,
  class: "connection-state"
}, Z = ["disabled"], ee = { class: "field" }, le = {
  key: 1,
  class: "catalog"
}, te = { class: "catalog-head" }, ne = { key: 0 }, oe = { class: "catalog-actions" }, se = ["disabled"], ae = ["disabled"], ie = {
  key: 0,
  class: "search"
}, ue = {
  key: 1,
  class: "loading-list",
  "aria-live": "polite"
}, re = {
  key: 2,
  class: "tool-list"
}, de = ["checked", "onChange"], ve = { class: "tool-copy" }, ce = {
  key: 3,
  class: "empty"
}, pe = {
  key: 4,
  class: "empty"
}, me = {
  key: 2,
  class: "empty connection-empty"
}, ge = {
  key: 3,
  class: "feedback error",
  role: "alert"
}, ke = /* @__PURE__ */ D({
  __name: "Picker",
  setup(he) {
    const T = j(), R = G(), _ = d([]), u = d([]), v = d(""), a = d([]), y = d("mcp"), p = d(""), h = d(!0), f = d(!1), m = d(""), k = d(void 0);
    I(() => T.value.config, (t) => {
      v.value = t?.connection_id || "", k.value = t?.selected_tools, a.value = t?.selected_tools || [], y.value = t?.tool_prefix || "mcp";
    }, { immediate: !0 });
    const V = S(() => _.value.find((t) => t.component_id === v.value)), b = S(() => {
      const t = p.value.trim().toLowerCase();
      return t ? u.value.filter((e) => (e.name + " " + e.description).toLowerCase().includes(t)) : u.value;
    }), C = S(() => new Set(a.value)), L = S(() => u.value.length > 0 && u.value.every((t) => C.value.has(t.id)));
    function g() {
      R("config-changed", { connection_id: v.value || void 0, selected_tools: a.value, tool_prefix: y.value.trim() || "mcp" });
    }
    function U(t) {
      a.value = C.value.has(t) ? a.value.filter((e) => e !== t) : [...a.value, t], g();
    }
    function $() {
      a.value = [.../* @__PURE__ */ new Set([...a.value, ...b.value.map((t) => t.id)])], g();
    }
    function q() {
      a.value = [], g();
    }
    async function w(t = !1) {
      if (u.value = [], p.value = "", !v.value) {
        a.value = [], g();
        return;
      }
      f.value = !0, m.value = "";
      try {
        const { data: e } = await N.post(`/api/v1/connections/${encodeURIComponent(v.value)}/discover_resources`, {});
        if (!e?.success) throw new Error(e?.error || "Tool discovery failed");
        u.value = (e.resources || []).filter((i) => i.selectable).map((i) => ({ id: String(i.id), name: String(i.name || i.id), description: String(i.description || "No description provided.") }));
        const n = new Set(u.value.map((i) => i.id));
        a.value = t && k.value !== void 0 ? k.value.filter((i) => n.has(i)) : u.value.map((i) => i.id), g();
      } catch (e) {
        m.value = e instanceof Error ? e.message : String(e);
      } finally {
        f.value = !1;
      }
    }
    async function B() {
      h.value = !0;
      try {
        const { data: t } = await N.get("/api/v1/connections?provider=mcp_remote&limit=100");
        _.value = t?.connections || [], v.value && await w(!0);
      } catch (t) {
        m.value = t instanceof Error ? t.message : String(t);
      } finally {
        h.value = !1;
      }
    }
    return B(), (t, e) => (o(), s("div", H, [
      l("header", J, [
        e[5] || (e[5] = l("span", null, [
          l("strong", null, "Remote MCP tools"),
          l("small", null, "Choose the tools this agent may see and call.")
        ], -1)),
        a.value.length ? (o(), s("span", K, r(a.value.length) + " selected", 1)) : c("", !0)
      ]),
      l("label", O, [
        e[6] || (e[6] = l("span", null, [
          z("MCP connection "),
          l("em", null, "Required")
        ], -1)),
        x(l("select", {
          "onUpdate:modelValue": e[0] || (e[0] = (n) => v.value = n),
          disabled: h.value,
          onChange: e[1] || (e[1] = (n) => {
            k.value = void 0, w(!1);
          })
        }, [
          l("option", W, r(h.value ? "Loading connections…" : "Select a connection"), 1),
          (o(!0), s(P, null, M(_.value, (n) => (o(), s("option", {
            key: n.component_id,
            value: n.component_id
          }, r(n.name || n.component_id), 9, X))), 128))
        ], 40, Q), [
          [A, v.value]
        ])
      ]),
      V.value ? (o(), s("div", Y, [
        e[7] || (e[7] = l("span", { class: "live-dot" }, null, -1)),
        l("span", null, r(V.value.name || "MCP server"), 1),
        e[8] || (e[8] = l("small", null, "Session starts on demand", -1)),
        l("button", {
          type: "button",
          disabled: f.value,
          onClick: e[2] || (e[2] = (n) => w(!0))
        }, "Refresh", 8, Z)
      ])) : c("", !0),
      l("label", ee, [
        e[9] || (e[9] = l("span", null, "Tool name prefix", -1)),
        x(l("input", {
          "onUpdate:modelValue": e[3] || (e[3] = (n) => y.value = n),
          maxlength: "24",
          placeholder: "mcp",
          onChange: g
        }, null, 544), [
          [E, y.value]
        ]),
        e[10] || (e[10] = l("small", null, "Prevents names from colliding with the agent's other tools.", -1))
      ]),
      v.value ? (o(), s("section", le, [
        l("div", te, [
          l("span", null, [
            e[11] || (e[11] = l("strong", null, "Allowed tools", -1)),
            u.value.length ? (o(), s("small", ne, r(a.value.length) + " of " + r(u.value.length), 1)) : c("", !0)
          ]),
          l("span", oe, [
            l("button", {
              type: "button",
              disabled: L.value,
              onClick: $
            }, "Select " + r(p.value ? "matches" : "all"), 9, se),
            l("button", {
              type: "button",
              disabled: !a.value.length,
              onClick: q
            }, "Clear", 8, ae)
          ])
        ]),
        u.value.length ? (o(), s("label", ie, [
          e[12] || (e[12] = l("span", { "aria-hidden": "true" }, "⌕", -1)),
          x(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (n) => p.value = n),
            type: "search",
            placeholder: "Search tools",
            "aria-label": "Search MCP tools"
          }, null, 512), [
            [E, p.value]
          ]),
          l("kbd", null, r(b.value.length), 1)
        ])) : c("", !0),
        f.value ? (o(), s("div", ue, [
          (o(), s(P, null, M(4, (n) => l("span", { key: n })), 64))
        ])) : b.value.length ? (o(), s("div", re, [
          (o(!0), s(P, null, M(b.value, (n) => (o(), s("label", {
            key: n.id,
            class: F(["tool-row", { selected: C.value.has(n.id) }])
          }, [
            l("input", {
              type: "checkbox",
              checked: C.value.has(n.id),
              onChange: (i) => U(n.id)
            }, null, 40, de),
            e[13] || (e[13] = l("span", { class: "checkmark" }, "✓", -1)),
            l("span", ve, [
              l("strong", null, r(n.name), 1),
              l("small", null, r(n.description), 1)
            ])
          ], 2))), 128))
        ])) : u.value.length ? (o(), s("div", ce, "No tools match “" + r(p.value) + "”.", 1)) : !f.value && !m.value ? (o(), s("div", pe, "This server did not expose any tools.")) : c("", !0)
      ])) : c("", !0),
      !_.value.length && !h.value ? (o(), s("div", me, [...e[14] || (e[14] = [
        l("strong", null, "No Remote MCP connections", -1),
        l("small", null, "Create one from Connections, then return here.", -1)
      ])])) : c("", !0),
      m.value ? (o(), s("div", ge, [
        e[16] || (e[16] = l("span", null, "!", -1)),
        l("div", null, [
          e[15] || (e[15] = l("strong", null, "Could not load tools", -1)),
          l("small", null, r(m.value), 1)
        ])
      ])) : c("", !0)
    ]));
  }
});
export {
  ke as default
};
