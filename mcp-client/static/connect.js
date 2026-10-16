import { u as $, a as q, W as N, c as L, p as z } from "./package-BizXH5l7.js";
import { defineComponent as B, ref as l, computed as M, openBlock as r, createElementBlock as i, withModifiers as D, createElementVNode as t, withDirectives as c, vModelText as w, createTextVNode as u, Fragment as K, renderList as O, normalizeClass as W, toDisplayString as d, vModelDynamic as T, createCommentVNode as m } from "vue";
import { api as A, define as X } from "@wippy-fe/proxy";
const F = {
  class: "section",
  "aria-labelledby": "mcp-server-heading"
}, j = { class: "field" }, G = { class: "field" }, J = {
  class: "section",
  "aria-labelledby": "mcp-auth-heading"
}, Q = {
  class: "auth-grid",
  role: "radiogroup",
  "aria-label": "Authentication method"
}, Y = ["aria-checked", "onClick"], Z = {
  key: 0,
  class: "field secret-field"
}, ee = { class: "secret-wrap" }, te = ["type"], ne = ["aria-label"], le = {
  key: 1,
  class: "header-pair"
}, oe = { class: "field" }, se = { class: "field secret-field" }, ae = { class: "secret-wrap" }, re = ["type"], ie = ["aria-expanded"], ue = {
  key: 0,
  class: "advanced"
}, de = { class: "field" }, pe = {
  key: 1,
  class: "feedback error",
  role: "alert"
}, ve = {
  key: 2,
  class: "feedback success",
  role: "status"
}, ce = ["disabled"], me = {
  key: 0,
  class: "spinner"
}, fe = /* @__PURE__ */ B({
  __name: "Connect",
  setup(E) {
    const S = $(), x = q(), P = l("Remote MCP"), f = l(""), o = l("none"), k = l(""), C = l("X-API-Key"), h = l(""), V = l("2025-11-25"), a = l(!1), y = l(!1), b = l(!1), p = l(""), v = l(null), g = M(() => S.value.componentId || ""), R = M(() => b.value ? "Verifying connection…" : g.value ? "Verify and reconnect" : "Verify and connect");
    function U(s) {
      o.value = s, p.value = "", v.value = null;
    }
    function H() {
      if (!f.value.trim()) return "Enter the MCP server endpoint.";
      try {
        const s = new URL(f.value.trim());
        if (!["http:", "https:"].includes(s.protocol)) return "The endpoint must use HTTP or HTTPS.";
      } catch {
        return "Enter a valid MCP endpoint URL.";
      }
      return o.value === "bearer" && !k.value.trim() ? "Enter the access token." : o.value === "header" && (!C.value.trim() || !h.value.trim()) ? "Enter both the API-key header and value." : "";
    }
    function I() {
      return {
        auth_type: o.value,
        endpoint_url: f.value.trim(),
        bearer_token: o.value === "bearer" ? k.value.trim() : "",
        header_name: o.value === "header" ? C.value.trim() : "",
        header_value: o.value === "header" ? h.value.trim() : "",
        protocol_version: V.value.trim() || "2025-11-25"
      };
    }
    async function _() {
      if (p.value = H(), v.value = null, !p.value) {
        b.value = !0;
        try {
          const s = { name: P.value.trim() || "Remote MCP", private_context: I() }, n = (g.value ? await A.put(`/api/v1/mcp-client/connections/${encodeURIComponent(g.value)}`, s) : await A.post("/api/v1/connections", { impl_id: "kickside.mcp_client:remote_connection", ...s, validate: !0 })).data;
          if (!n?.success) throw new Error(n?.error || "The server could not be verified.");
          v.value = { toolCount: Number(n.tool_count ?? 0) }, x("connection-saved", { success: !0, component_id: n.component_id || g.value });
        } catch (s) {
          p.value = s instanceof Error ? s.message : String(s), x("connection-saved", { success: !1, error: p.value });
        } finally {
          b.value = !1;
        }
      }
    }
    return (s, e) => (r(), i("form", {
      class: "mcp connect",
      "aria-label": "Remote MCP connection",
      onSubmit: D(_, ["prevent"])
    }, [
      t("section", F, [
        e[13] || (e[13] = t("div", {
          id: "mcp-server-heading",
          class: "section-title"
        }, "Server details", -1)),
        t("label", j, [
          e[10] || (e[10] = t("span", null, "Connection name", -1)),
          c(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (n) => P.value = n),
            autocomplete: "off",
            placeholder: "Engineering tools"
          }, null, 512), [
            [w, P.value]
          ])
        ]),
        t("label", G, [
          e[11] || (e[11] = t("span", null, [
            u("Streamable HTTP endpoint "),
            t("em", null, "Required")
          ], -1)),
          c(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (n) => f.value = n),
            type: "url",
            inputmode: "url",
            autocomplete: "url",
            placeholder: "https://mcp.example.com/mcp",
            onInput: e[2] || (e[2] = (n) => v.value = null)
          }, null, 544), [
            [w, f.value]
          ]),
          e[12] || (e[12] = t("small", null, "The exact MCP endpoint, not the provider homepage.", -1))
        ])
      ]),
      t("section", J, [
        e[19] || (e[19] = t("div", {
          id: "mcp-auth-heading",
          class: "section-title"
        }, "Authentication", -1)),
        t("div", Q, [
          (r(), i(K, null, O([["none", "No authentication", "Public or network-protected"], ["bearer", "Access token", "OAuth or bearer token"], ["header", "API key", "Custom request header"]], (n) => t("button", {
            key: n[0],
            type: "button",
            class: W(["auth-card", { active: o.value === n[0] }]),
            role: "radio",
            "aria-checked": o.value === n[0],
            onClick: (be) => U(n[0])
          }, [
            e[14] || (e[14] = t("span", { class: "radio-dot" }, null, -1)),
            t("strong", null, d(n[1]), 1),
            t("small", null, d(n[2]), 1)
          ], 10, Y)), 64))
        ]),
        o.value === "bearer" ? (r(), i("label", Z, [
          e[15] || (e[15] = t("span", null, [
            u("Access token "),
            t("em", null, "Required")
          ], -1)),
          t("span", ee, [
            c(t("input", {
              "onUpdate:modelValue": e[3] || (e[3] = (n) => k.value = n),
              type: a.value ? "text" : "password",
              autocomplete: "new-password",
              placeholder: "Paste a token issued for this MCP server"
            }, null, 8, te), [
              [T, k.value]
            ]),
            t("button", {
              type: "button",
              class: "reveal",
              "aria-label": a.value ? "Hide token" : "Show token",
              onClick: e[4] || (e[4] = (n) => a.value = !a.value)
            }, d(a.value ? "Hide" : "Show"), 9, ne)
          ]),
          e[16] || (e[16] = t("small", null, [
            u("Sent as "),
            t("code", null, "Authorization: Bearer"),
            u(" on every MCP request.")
          ], -1))
        ])) : m("", !0),
        o.value === "header" ? (r(), i("div", le, [
          t("label", oe, [
            e[17] || (e[17] = t("span", null, [
              u("Header name "),
              t("em", null, "Required")
            ], -1)),
            c(t("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (n) => C.value = n),
              autocomplete: "off",
              placeholder: "X-API-Key"
            }, null, 512), [
              [w, C.value]
            ])
          ]),
          t("label", se, [
            e[18] || (e[18] = t("span", null, [
              u("Header value "),
              t("em", null, "Required")
            ], -1)),
            t("span", ae, [
              c(t("input", {
                "onUpdate:modelValue": e[6] || (e[6] = (n) => h.value = n),
                type: a.value ? "text" : "password",
                autocomplete: "new-password"
              }, null, 8, re), [
                [T, h.value]
              ]),
              t("button", {
                type: "button",
                class: "reveal",
                onClick: e[7] || (e[7] = (n) => a.value = !a.value)
              }, d(a.value ? "Hide" : "Show"), 1)
            ])
          ])
        ])) : m("", !0),
        e[20] || (e[20] = t("p", { class: "security-note" }, [
          t("span", { "aria-hidden": "true" }, "◆"),
          u(" Credentials stay in the connection's private component context and never enter agent prompts.")
        ], -1))
      ]),
      t("button", {
        type: "button",
        class: "advanced-toggle",
        "aria-expanded": y.value,
        onClick: e[8] || (e[8] = (n) => y.value = !y.value)
      }, [
        e[21] || (e[21] = t("span", null, "Advanced protocol settings", -1)),
        t("span", null, d(y.value ? "−" : "+"), 1)
      ], 8, ie),
      y.value ? (r(), i("section", ue, [
        t("label", de, [
          e[22] || (e[22] = t("span", null, "MCP protocol version", -1)),
          c(t("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (n) => V.value = n),
            autocomplete: "off"
          }, null, 512), [
            [w, V.value]
          ]),
          e[23] || (e[23] = t("small", null, "The server may negotiate another supported version during initialization.", -1))
        ])
      ])) : m("", !0),
      p.value ? (r(), i("div", pe, [
        e[25] || (e[25] = t("span", null, "!", -1)),
        t("div", null, [
          e[24] || (e[24] = t("strong", null, "Connection failed", -1)),
          t("small", null, d(p.value), 1)
        ])
      ])) : m("", !0),
      v.value ? (r(), i("div", ve, [
        e[27] || (e[27] = t("span", null, "✓", -1)),
        t("div", null, [
          e[26] || (e[26] = t("strong", null, "Connection verified", -1)),
          t("small", null, d(v.value.toolCount ? `${v.value.toolCount} tools discovered and ready.` : "The MCP handshake completed successfully."), 1)
        ])
      ])) : m("", !0),
      e[28] || (e[28] = t("p", { class: "footnote" }, "A worker starts only while this connection is in use.", -1)),
      t("button", {
        class: "primary",
        type: "submit",
        disabled: b.value
      }, [
        b.value ? (r(), i("span", me)) : m("", !0),
        u(d(R.value), 1)
      ], 8, ce)
    ], 32));
  }
});
class ye extends N {
  static get wippyConfig() {
    return {
      propsSchema: z.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: L
    };
  }
  static get vueConfig() {
    return { rootComponent: fe };
  }
}
X(import.meta.url, ye);
//# sourceMappingURL=connect.js.map
