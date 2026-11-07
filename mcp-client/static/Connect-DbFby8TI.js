import { defineComponent as B, ref as a, onBeforeUnmount as D, computed as R, openBlock as u, createElementBlock as d, withModifiers as K, createElementVNode as t, withDirectives as p, vModelText as A, createTextVNode as h, Fragment as I, renderList as F, normalizeClass as X, toDisplayString as w, createCommentVNode as b, vModelDynamic as q, vModelSelect as G } from "vue";
import { api as x } from "@wippy-fe/proxy";
import { a as J, u as Q } from "./wc-runtime-CNDpK4lj.js";
function W() {
  let U = () => {
  };
  async function z(T) {
    U();
    const r = window.open("about:blank", "_blank", "width=540,height=720");
    if (!r) throw new Error("Allow popups for KickSide and try signing in again.");
    let v = !1, o = () => {
    }, f, y;
    function P() {
      v = !0, f && window.removeEventListener("message", f), y && clearInterval(y), r?.close();
    }
    U = () => {
      P(), o(new Error("Authorization cancelled."));
    };
    try {
      const { data: s } = await x.post("/api/v1/oauth/providers/mcp_remote/init", T);
      if (v) throw new Error("Authorization cancelled.");
      if (!s?.success || !s.authorization_url || !s.state_token || !s.redirect_uri)
        throw new Error(s?.error || "The server could not start OAuth authorization.");
      const M = new URL(s.redirect_uri), k = new URL(s.authorization_url);
      if (!["https:", "http:"].includes(M.protocol) || !["https:", "http:"].includes(k.protocol))
        throw new Error("Invalid OAuth authorization response.");
      await new Promise((E, c) => {
        o = c, f = (l) => {
          l.source !== r || l.origin !== M.origin || l.data?.type !== "oauth_result" || l.data?.state_token !== s.state_token || (l.data.success === !0 ? E() : c(new Error(l.data.error || "Authorization was declined.")));
        }, window.addEventListener("message", f);
        const S = Date.now() + 3e5;
        y = setInterval(() => {
          r.closed ? c(new Error("Authorization window closed before completion.")) : Date.now() > S && c(new Error("Authorization timed out. Try signing in again."));
        }, 500), r.location.href = k.href;
      });
    } finally {
      P();
    }
  }
  return { start: z, cancel: () => U() };
}
const Y = {
  class: "section",
  "aria-labelledby": "mcp-server-heading"
}, Z = { class: "field" }, j = { class: "field" }, ee = {
  class: "section",
  "aria-labelledby": "mcp-auth-heading"
}, te = {
  class: "auth-grid",
  role: "radiogroup",
  "aria-label": "Authentication method"
}, ne = ["disabled", "aria-checked", "onClick"], oe = {
  key: 0,
  class: "footnote"
}, le = {
  key: 1,
  class: "field secret-field"
}, ae = { class: "secret-wrap" }, se = ["type"], ie = ["aria-label"], re = {
  key: 2,
  class: "header-pair"
}, ue = { class: "field" }, de = { class: "field secret-field" }, pe = { class: "secret-wrap" }, ve = ["type"], ce = ["aria-expanded"], me = {
  key: 0,
  class: "advanced"
}, fe = { class: "field" }, he = { class: "field" }, we = { class: "field" }, be = { class: "field" }, ye = { class: "field" }, ke = {
  key: 1,
  class: "feedback error",
  role: "alert"
}, ge = {
  key: 2,
  class: "feedback success",
  role: "status"
}, Ce = ["disabled"], Ae = {
  key: 0,
  class: "spinner"
}, Te = /* @__PURE__ */ B({
  __name: "Connect",
  setup(U) {
    const z = J(), T = Q(), r = a("Remote MCP"), v = a(""), o = a("oauth"), f = a(""), y = a(""), P = a("none"), s = a(""), M = W();
    D(() => M.cancel());
    const k = a(""), E = a("X-API-Key"), c = a(""), S = a("2025-11-25"), l = a(!1), V = a(!1), _ = a(!1), g = a(""), C = a(null), m = R(() => z.value.componentId || ""), L = R(() => _.value ? "Connecting…" : o.value === "oauth" ? m.value ? "Sign in again" : "Sign in with OAuth" : m.value ? "Verify and reconnect" : "Verify and connect");
    function H(i) {
      o.value = i, g.value = "", C.value = null;
    }
    function O() {
      if (!v.value.trim()) return "Enter the MCP server endpoint.";
      try {
        const i = new URL(v.value.trim());
        if (!["http:", "https:"].includes(i.protocol)) return "The endpoint must use HTTP or HTTPS.";
      } catch {
        return "Enter a valid MCP endpoint URL.";
      }
      return o.value === "bearer" && !k.value.trim() ? "Enter the access token." : o.value === "header" && (!E.value.trim() || !c.value.trim()) ? "Enter both the API-key header and value." : "";
    }
    function $() {
      return {
        auth_type: o.value,
        endpoint_url: v.value.trim(),
        bearer_token: o.value === "bearer" ? k.value.trim() : "",
        header_name: o.value === "header" ? E.value.trim() : "",
        header_value: o.value === "header" ? c.value.trim() : "",
        protocol_version: S.value.trim() || "2025-11-25"
      };
    }
    async function N() {
      if (g.value = O(), C.value = null, !g.value) {
        _.value = !0;
        try {
          if (o.value === "oauth") {
            await M.start({
              name: r.value.trim() || "Remote MCP",
              scopes: s.value.trim() ? s.value.trim().split(/\s+/) : [],
              ...m.value ? { component_id: m.value } : {},
              provider_options: {
                endpoint_url: v.value.trim(),
                protocol_version: S.value.trim(),
                client_id: f.value.trim(),
                client_secret: y.value,
                token_endpoint_auth_method: P.value
              }
            }), T("connection-saved", { success: !0, ...m.value ? { component_id: m.value } : {} });
            return;
          }
          const i = { name: r.value.trim() || "Remote MCP", private_context: $() }, n = (m.value ? await x.put(`/api/v1/mcp-client/connections/${encodeURIComponent(m.value)}`, i) : await x.post("/api/v1/connections", { impl_id: "kickside.mcp_client:remote_connection", ...i, validate: !0 })).data;
          if (!n?.success) throw new Error(n?.error || "The server could not be verified.");
          C.value = { toolCount: Number(n.tool_count ?? 0) }, T("connection-saved", { success: !0, component_id: n.component_id || m.value });
        } catch (i) {
          g.value = i instanceof Error ? i.message : String(i), T("connection-saved", { success: !1, error: g.value });
        } finally {
          _.value = !1;
        }
      }
    }
    return (i, e) => (u(), d("form", {
      class: "mcp connect",
      "aria-label": "Remote MCP connection",
      onSubmit: K(N, ["prevent"])
    }, [
      t("section", Y, [
        e[17] || (e[17] = t("div", {
          id: "mcp-server-heading",
          class: "section-title"
        }, "Server details", -1)),
        t("label", Z, [
          e[14] || (e[14] = t("span", null, "Connection name", -1)),
          p(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (n) => r.value = n),
            autocomplete: "off",
            placeholder: "Engineering tools"
          }, null, 512), [
            [A, r.value]
          ])
        ]),
        t("label", j, [
          e[15] || (e[15] = t("span", null, [
            h("Streamable HTTP endpoint "),
            t("em", null, "Required")
          ], -1)),
          p(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (n) => v.value = n),
            type: "url",
            inputmode: "url",
            autocomplete: "url",
            placeholder: "https://mcp.example.com/mcp",
            onInput: e[2] || (e[2] = (n) => C.value = null)
          }, null, 544), [
            [A, v.value]
          ]),
          e[16] || (e[16] = t("small", null, "The exact MCP endpoint, not the provider homepage.", -1))
        ])
      ]),
      t("section", ee, [
        e[23] || (e[23] = t("div", {
          id: "mcp-auth-heading",
          class: "section-title"
        }, "Authentication", -1)),
        t("div", te, [
          (u(), d(I, null, F([["oauth", "Sign in with OAuth", "Authorize your account"], ["none", "No authentication", "Public or network-protected"], ["bearer", "Access token", "Paste an existing bearer token"], ["header", "API key", "Custom request header"]], (n) => t("button", {
            key: n[0],
            type: "button",
            disabled: _.value,
            class: X(["auth-card", { active: o.value === n[0] }]),
            role: "radio",
            "aria-checked": o.value === n[0],
            onClick: (Pe) => H(n[0])
          }, [
            e[18] || (e[18] = t("span", { class: "radio-dot" }, null, -1)),
            t("strong", null, w(n[1]), 1),
            t("small", null, w(n[2]), 1)
          ], 10, ne)), 64))
        ]),
        o.value === "oauth" ? (u(), d("p", oe, "Sign in on the server’s authorization page and choose the access to grant. KickSide renews the connection automatically when supported.")) : b("", !0),
        o.value === "bearer" ? (u(), d("label", le, [
          e[19] || (e[19] = t("span", null, [
            h("Access token "),
            t("em", null, "Required")
          ], -1)),
          t("span", ae, [
            p(t("input", {
              "onUpdate:modelValue": e[3] || (e[3] = (n) => k.value = n),
              type: l.value ? "text" : "password",
              autocomplete: "new-password",
              placeholder: "Paste a token issued for this MCP server"
            }, null, 8, se), [
              [q, k.value]
            ]),
            t("button", {
              type: "button",
              class: "reveal",
              "aria-label": l.value ? "Hide token" : "Show token",
              onClick: e[4] || (e[4] = (n) => l.value = !l.value)
            }, w(l.value ? "Hide" : "Show"), 9, ie)
          ]),
          e[20] || (e[20] = t("small", null, [
            h("Sent as "),
            t("code", null, "Authorization: Bearer"),
            h(" on every MCP request.")
          ], -1))
        ])) : b("", !0),
        o.value === "header" ? (u(), d("div", re, [
          t("label", ue, [
            e[21] || (e[21] = t("span", null, [
              h("Header name "),
              t("em", null, "Required")
            ], -1)),
            p(t("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (n) => E.value = n),
              autocomplete: "off",
              placeholder: "X-API-Key"
            }, null, 512), [
              [A, E.value]
            ])
          ]),
          t("label", de, [
            e[22] || (e[22] = t("span", null, [
              h("Header value "),
              t("em", null, "Required")
            ], -1)),
            t("span", pe, [
              p(t("input", {
                "onUpdate:modelValue": e[6] || (e[6] = (n) => c.value = n),
                type: l.value ? "text" : "password",
                autocomplete: "new-password"
              }, null, 8, ve), [
                [q, c.value]
              ]),
              t("button", {
                type: "button",
                class: "reveal",
                onClick: e[7] || (e[7] = (n) => l.value = !l.value)
              }, w(l.value ? "Hide" : "Show"), 1)
            ])
          ])
        ])) : b("", !0),
        e[24] || (e[24] = t("p", { class: "security-note" }, [
          t("span", { "aria-hidden": "true" }, "◆"),
          h(" Credentials stay on the server and never enter agent prompts.")
        ], -1))
      ]),
      t("button", {
        type: "button",
        class: "advanced-toggle",
        "aria-expanded": V.value,
        onClick: e[8] || (e[8] = (n) => V.value = !V.value)
      }, [
        e[25] || (e[25] = t("span", null, "Advanced protocol settings", -1)),
        t("span", null, w(V.value ? "−" : "+"), 1)
      ], 8, ce),
      V.value ? (u(), d("section", me, [
        o.value === "oauth" ? (u(), d(I, { key: 0 }, [
          t("label", fe, [
            e[26] || (e[26] = t("span", null, "OAuth client id", -1)),
            p(t("input", {
              "onUpdate:modelValue": e[9] || (e[9] = (n) => f.value = n),
              autocomplete: "off"
            }, null, 512), [
              [A, f.value]
            ]),
            e[27] || (e[27] = t("small", null, "Leave blank for automatic client registration. Some services require a registered client.", -1))
          ]),
          t("label", he, [
            e[28] || (e[28] = t("span", null, "OAuth client secret", -1)),
            p(t("input", {
              "onUpdate:modelValue": e[10] || (e[10] = (n) => y.value = n),
              type: "password",
              autocomplete: "new-password"
            }, null, 512), [
              [A, y.value]
            ])
          ]),
          t("label", we, [
            e[30] || (e[30] = t("span", null, "Client authentication", -1)),
            p(t("select", {
              "onUpdate:modelValue": e[11] || (e[11] = (n) => P.value = n)
            }, [...e[29] || (e[29] = [
              t("option", { value: "none" }, "Public client (PKCE)", -1),
              t("option", { value: "client_secret_post" }, "Client secret in request body", -1),
              t("option", { value: "client_secret_basic" }, "Client secret with HTTP Basic", -1)
            ])], 512), [
              [G, P.value]
            ])
          ]),
          t("label", be, [
            e[31] || (e[31] = t("span", null, "Requested scopes", -1)),
            p(t("input", {
              "onUpdate:modelValue": e[12] || (e[12] = (n) => s.value = n),
              autocomplete: "off"
            }, null, 512), [
              [A, s.value]
            ]),
            e[32] || (e[32] = t("small", null, "Space-separated permissions. Leave blank to use the server’s requested permissions.", -1))
          ])
        ], 64)) : b("", !0),
        t("label", ye, [
          e[33] || (e[33] = t("span", null, "MCP protocol version", -1)),
          p(t("input", {
            "onUpdate:modelValue": e[13] || (e[13] = (n) => S.value = n),
            autocomplete: "off"
          }, null, 512), [
            [A, S.value]
          ]),
          e[34] || (e[34] = t("small", null, "The server may negotiate another supported version during initialization.", -1))
        ])
      ])) : b("", !0),
      g.value ? (u(), d("div", ke, [
        e[36] || (e[36] = t("span", null, "!", -1)),
        t("div", null, [
          e[35] || (e[35] = t("strong", null, "Connection failed", -1)),
          t("small", null, w(g.value), 1)
        ])
      ])) : b("", !0),
      C.value ? (u(), d("div", ge, [
        e[38] || (e[38] = t("span", null, "✓", -1)),
        t("div", null, [
          e[37] || (e[37] = t("strong", null, "Connection verified", -1)),
          t("small", null, w(C.value.toolCount ? `${C.value.toolCount} tools discovered and ready.` : "The MCP handshake completed successfully."), 1)
        ])
      ])) : b("", !0),
      e[39] || (e[39] = t("p", { class: "footnote" }, "A worker starts only while this connection is in use.", -1)),
      t("button", {
        class: "primary",
        type: "submit",
        disabled: _.value
      }, [
        _.value ? (u(), d("span", Ae)) : b("", !0),
        h(w(L.value), 1)
      ], 8, Ce)
    ], 32));
  }
});
export {
  Te as default
};
