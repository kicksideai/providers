import { u as I, a as W, W as z, c as A, p as F } from "./package-CpNTtmY2.js";
import { defineComponent as K, ref as d, watch as j, computed as S, openBlock as o, createElementBlock as s, createElementVNode as l, toDisplayString as r, createCommentVNode as v, createTextVNode as G, withDirectives as x, Fragment as E, renderList as P, vModelSelect as H, vModelText as M, normalizeClass as J } from "vue";
import { api as N, define as O } from "@wippy-fe/proxy";
const Q = { class: "mcp picker" }, X = { class: "picker-head" }, Y = {
  key: 0,
  class: "count"
}, Z = { class: "field" }, ee = ["disabled"], le = { value: "" }, te = ["value"], ne = {
  key: 0,
  class: "connection-state"
}, oe = ["disabled"], se = { class: "field" }, ae = {
  key: 1,
  class: "catalog"
}, ie = { class: "catalog-head" }, ue = { key: 0 }, re = { class: "catalog-actions" }, de = ["disabled"], ce = ["disabled"], ve = {
  key: 0,
  class: "search"
}, pe = {
  key: 1,
  class: "loading-list",
  "aria-live": "polite"
}, me = {
  key: 2,
  class: "tool-list"
}, ge = ["checked", "onChange"], he = { class: "tool-copy" }, fe = {
  key: 3,
  class: "empty"
}, ye = {
  key: 4,
  class: "empty"
}, _e = {
  key: 2,
  class: "empty connection-empty"
}, ke = {
  key: 3,
  class: "feedback error",
  role: "alert"
}, Ce = /* @__PURE__ */ K({
  __name: "Picker",
  setup(T) {
    const R = I(), U = W(), y = d([]), u = d([]), c = d(""), a = d([]), _ = d("mcp"), p = d(""), h = d(!0), f = d(!1), m = d(""), k = d(void 0);
    j(() => R.value.config, (t) => {
      c.value = t?.connection_id || "", k.value = t?.selected_tools, a.value = t?.selected_tools || [], _.value = t?.tool_prefix || "mcp";
    }, { immediate: !0 });
    const V = S(() => y.value.find((t) => t.component_id === c.value)), C = S(() => {
      const t = p.value.trim().toLowerCase();
      return t ? u.value.filter((e) => (e.name + " " + e.description).toLowerCase().includes(t)) : u.value;
    }), b = S(() => new Set(a.value)), L = S(() => u.value.length > 0 && u.value.every((t) => b.value.has(t.id)));
    function g() {
      U("config-changed", { connection_id: c.value || void 0, selected_tools: a.value, tool_prefix: _.value.trim() || "mcp" });
    }
    function $(t) {
      a.value = b.value.has(t) ? a.value.filter((e) => e !== t) : [...a.value, t], g();
    }
    function q() {
      a.value = [.../* @__PURE__ */ new Set([...a.value, ...C.value.map((t) => t.id)])], g();
    }
    function B() {
      a.value = [], g();
    }
    async function w(t = !1) {
      if (u.value = [], p.value = "", !c.value) {
        a.value = [], g();
        return;
      }
      f.value = !0, m.value = "";
      try {
        const { data: e } = await N.post(`/api/v1/connections/${encodeURIComponent(c.value)}/discover_resources`, {});
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
    async function D() {
      h.value = !0;
      try {
        const { data: t } = await N.get("/api/v1/connections?provider=mcp_remote&limit=100");
        y.value = t?.connections || [], c.value && await w(!0);
      } catch (t) {
        m.value = t instanceof Error ? t.message : String(t);
      } finally {
        h.value = !1;
      }
    }
    return D(), (t, e) => (o(), s("div", Q, [
      l("header", X, [
        e[5] || (e[5] = l("span", null, [
          l("strong", null, "Remote MCP tools"),
          l("small", null, "Choose the tools this agent may see and call.")
        ], -1)),
        a.value.length ? (o(), s("span", Y, r(a.value.length) + " selected", 1)) : v("", !0)
      ]),
      l("label", Z, [
        e[6] || (e[6] = l("span", null, [
          G("MCP connection "),
          l("em", null, "Required")
        ], -1)),
        x(l("select", {
          "onUpdate:modelValue": e[0] || (e[0] = (n) => c.value = n),
          disabled: h.value,
          onChange: e[1] || (e[1] = (n) => {
            k.value = void 0, w(!1);
          })
        }, [
          l("option", le, r(h.value ? "Loading connections…" : "Select a connection"), 1),
          (o(!0), s(E, null, P(y.value, (n) => (o(), s("option", {
            key: n.component_id,
            value: n.component_id
          }, r(n.name || n.component_id), 9, te))), 128))
        ], 40, ee), [
          [H, c.value]
        ])
      ]),
      V.value ? (o(), s("div", ne, [
        e[7] || (e[7] = l("span", { class: "live-dot" }, null, -1)),
        l("span", null, r(V.value.name || "MCP server"), 1),
        e[8] || (e[8] = l("small", null, "Session starts on demand", -1)),
        l("button", {
          type: "button",
          disabled: f.value,
          onClick: e[2] || (e[2] = (n) => w(!0))
        }, "Refresh", 8, oe)
      ])) : v("", !0),
      l("label", se, [
        e[9] || (e[9] = l("span", null, "Tool name prefix", -1)),
        x(l("input", {
          "onUpdate:modelValue": e[3] || (e[3] = (n) => _.value = n),
          maxlength: "24",
          placeholder: "mcp",
          onChange: g
        }, null, 544), [
          [M, _.value]
        ]),
        e[10] || (e[10] = l("small", null, "Prevents names from colliding with the agent's other tools.", -1))
      ]),
      c.value ? (o(), s("section", ae, [
        l("div", ie, [
          l("span", null, [
            e[11] || (e[11] = l("strong", null, "Allowed tools", -1)),
            u.value.length ? (o(), s("small", ue, r(a.value.length) + " of " + r(u.value.length), 1)) : v("", !0)
          ]),
          l("span", re, [
            l("button", {
              type: "button",
              disabled: L.value,
              onClick: q
            }, "Select " + r(p.value ? "matches" : "all"), 9, de),
            l("button", {
              type: "button",
              disabled: !a.value.length,
              onClick: B
            }, "Clear", 8, ce)
          ])
        ]),
        u.value.length ? (o(), s("label", ve, [
          e[12] || (e[12] = l("span", { "aria-hidden": "true" }, "⌕", -1)),
          x(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (n) => p.value = n),
            type: "search",
            placeholder: "Search tools",
            "aria-label": "Search MCP tools"
          }, null, 512), [
            [M, p.value]
          ]),
          l("kbd", null, r(C.value.length), 1)
        ])) : v("", !0),
        f.value ? (o(), s("div", pe, [
          (o(), s(E, null, P(4, (n) => l("span", { key: n })), 64))
        ])) : C.value.length ? (o(), s("div", me, [
          (o(!0), s(E, null, P(C.value, (n) => (o(), s("label", {
            key: n.id,
            class: J(["tool-row", { selected: b.value.has(n.id) }])
          }, [
            l("input", {
              type: "checkbox",
              checked: b.value.has(n.id),
              onChange: (i) => $(n.id)
            }, null, 40, ge),
            e[13] || (e[13] = l("span", { class: "checkmark" }, "✓", -1)),
            l("span", he, [
              l("strong", null, r(n.name), 1),
              l("small", null, r(n.description), 1)
            ])
          ], 2))), 128))
        ])) : u.value.length ? (o(), s("div", fe, "No tools match “" + r(p.value) + "”.", 1)) : !f.value && !m.value ? (o(), s("div", ye, "This server did not expose any tools.")) : v("", !0)
      ])) : v("", !0),
      !y.value.length && !h.value ? (o(), s("div", _e, [...e[14] || (e[14] = [
        l("strong", null, "No Remote MCP connections", -1),
        l("small", null, "Create one from Connections, then return here.", -1)
      ])])) : v("", !0),
      m.value ? (o(), s("div", ke, [
        e[16] || (e[16] = l("span", null, "!", -1)),
        l("div", null, [
          e[15] || (e[15] = l("strong", null, "Could not load tools", -1)),
          l("small", null, r(m.value), 1)
        ])
      ])) : v("", !0)
    ]));
  }
});
class be extends z {
  static get wippyConfig() {
    return {
      propsSchema: F.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: A
    };
  }
  static get vueConfig() {
    return { rootComponent: Ce };
  }
}
O(import.meta.url, be);
//# sourceMappingURL=picker.js.map
