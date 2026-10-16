import { u as J, a as Y, W as Q, s as X, p as Z } from "./package-BLKW-MpW.js";
import { defineComponent as ee, ref as s, computed as M, onUnmounted as te, openBlock as d, createElementBlock as v, createElementVNode as n, normalizeClass as j, withDirectives as f, vModelText as h, toDisplayString as O, createCommentVNode as q, vModelSelect as ne, Fragment as ae } from "vue";
import { api as B, define as oe } from "@wippy-fe/proxy";
import "@iconify/vue";
const le = { class: "atl" }, se = { class: "atl-tabs" }, ie = { class: "atl-field" }, ue = {
  key: 0,
  class: "atl-pane"
}, re = ["disabled"], ce = {
  key: 0,
  class: "atl-warn"
}, pe = {
  key: 1,
  class: "atl-pane"
}, de = { class: "atl-field" }, ve = { class: "atl-field" }, fe = { class: "atl-field" }, me = { class: "atl-field" }, ke = {
  key: 1,
  class: "atl-field"
}, ye = ["disabled"], he = {
  key: 2,
  class: "atl-error"
}, be = "kickside.atlassian.connection:atlassian_connection", ge = /* @__PURE__ */ ee({
  __name: "Connect",
  setup(R) {
    const K = J(), b = Y(), W = [
      "read:me",
      "offline_access",
      "read:jira-work",
      "write:jira-work",
      "read:jira-user",
      "read:confluence-content.all",
      "write:confluence-content"
    ], m = s("oauth"), o = s(!1), u = s(""), r = s("");
    let l = null, g = null, c = "", p = "", w = !1, C = 0, x = !1;
    const E = s(""), A = s(""), k = s("cloud"), _ = s(""), P = s(""), S = s(""), T = M(() => K.value.componentId || ""), I = M(() => E.value.trim() || "Atlassian");
    function i(t) {
      u.value = t, o.value = !1;
    }
    function V(t) {
      if (t)
        try {
          t.close();
        } catch {
        }
    }
    function U(t = !1) {
      g && (clearInterval(g), g = null), w && (window.removeEventListener("message", z), w = !1), t && V(l), l = null;
    }
    function y(t = !0) {
      C += 1, U(t), c = "", p = "", r.value = "";
    }
    function $(t) {
      if (typeof t != "string" || !t) return "";
      try {
        const e = new URL(t, window.location.href);
        return e.protocol === "http:" || e.protocol === "https:" ? e.origin : "";
      } catch {
        return "";
      }
    }
    function z(t) {
      const e = t.data;
      if (!(!e || e.type !== "oauth_result") && !(!l || t.source !== l) && !(!c || t.origin !== c) && !(!p || e.state_token !== p))
        if (U(!0), c = "", p = "", r.value = "", o.value = !1, e.success)
          u.value = "", b("oauth-result", { success: !0 });
        else {
          const a = e.error || "Atlassian authorization failed";
          u.value = a, b("oauth-result", { success: !1, error: a });
        }
    }
    function L() {
      w || (window.addEventListener("message", z), w = !0), g = setInterval(() => {
        let t = !1;
        try {
          t = !l || l.closed;
        } catch {
          t = !1;
        }
        if (!t) return;
        U(), c = "", p = "", r.value = "", o.value = !1;
        const e = "Atlassian authorization was cancelled before completion";
        u.value = e, b("oauth-result", { success: !1, error: e });
      }, 600);
    }
    async function F() {
      y();
      const t = C;
      u.value = "", o.value = !0, l = window.open("about:blank", "oauth_atlassian", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      try {
        const e = { name: I.value, scopes: W };
        T.value && (e.component_id = T.value);
        const { data: a } = await B.post("/api/v1/oauth/providers/atlassian/init", e);
        if (x || t !== C) return;
        if (!a?.success || !a.authorization_url)
          return y(), i(a?.error || "Could not start Atlassian sign-in");
        const D = $(a.redirect_uri), N = typeof a.state_token == "string" ? a.state_token : "";
        if (!D || !N)
          return y(), i("OAuth response did not include a valid callback identity");
        c = D, p = N, l && !l.closed ? (L(), l.location.href = a.authorization_url) : (l = null, r.value = a.authorization_url, o.value = !1);
      } catch (e) {
        if (x || t !== C) return;
        y(), i(e instanceof Error ? e.message : String(e));
      }
    }
    function G() {
      if (!r.value || !c || !p) return;
      o.value = !0;
      const t = window.open(
        r.value,
        "oauth_atlassian",
        "width=520,height=680,menubar=no,toolbar=no,location=no,status=no"
      );
      if (!t || t.closed)
        return V(t), o.value = !1, i("Popup blocked — allow popups and retry");
      U(!0), l = t, r.value = "", L();
    }
    te(() => {
      x = !0, y(), o.value = !1;
    });
    async function H() {
      if (u.value = "", !A.value.trim()) return i("Site URL is required");
      const t = { site_url: A.value.trim(), deployment: k.value };
      if (k.value === "server") {
        if (!S.value.trim()) return i("Personal access token is required");
        t.personal_access_token = S.value.trim();
      } else {
        if (!_.value.trim() || !P.value.trim()) return i("Email and API token are required");
        t.email = _.value.trim(), t.api_token = P.value.trim();
      }
      o.value = !0;
      try {
        const { data: e } = await B.post("/api/v1/connections", {
          impl_id: be,
          name: I.value,
          private_context: t
        });
        if (!e || e.success === !1) return i(e?.error || "Could not save connection");
        o.value = !1, b("connection-saved", { success: !0 });
      } catch (e) {
        i(e instanceof Error ? e.message : String(e));
      }
    }
    return (t, e) => (d(), v("div", le, [
      n("div", se, [
        n("button", {
          class: j(["atl-tab", { on: m.value === "oauth" }]),
          onClick: e[0] || (e[0] = (a) => m.value = "oauth")
        }, "Sign in with Atlassian", 2),
        n("button", {
          class: j(["atl-tab", { on: m.value === "credential" }]),
          onClick: e[1] || (e[1] = (a) => m.value = "credential")
        }, "API token / PAT", 2)
      ]),
      n("label", ie, [
        e[8] || (e[8] = n("span", null, "Connection name", -1)),
        f(n("input", {
          "onUpdate:modelValue": e[2] || (e[2] = (a) => E.value = a),
          type: "text",
          placeholder: "Atlassian"
        }, null, 512), [
          [h, E.value]
        ])
      ]),
      m.value === "oauth" ? (d(), v("div", ue, [
        e[10] || (e[10] = n("p", { class: "atl-hint" }, "Authorize KickSide to access your Atlassian Jira and Confluence. Opens a secure Atlassian sign-in window.", -1)),
        n("button", {
          class: "atl-primary",
          disabled: o.value,
          onClick: F
        }, O(o.value ? "Connecting…" : "Connect Atlassian"), 9, re),
        r.value ? (d(), v("div", ce, [
          e[9] || (e[9] = n("span", null, "Your browser blocked the popup.", -1)),
          n("button", {
            type: "button",
            onClick: G
          }, "Open authorization")
        ])) : q("", !0)
      ])) : (d(), v("div", pe, [
        n("label", de, [
          e[11] || (e[11] = n("span", null, "Site URL", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (a) => A.value = a),
            type: "text",
            placeholder: "https://your-org.atlassian.net"
          }, null, 512), [
            [h, A.value]
          ])
        ]),
        n("label", ve, [
          e[13] || (e[13] = n("span", null, "Deployment", -1)),
          f(n("select", {
            "onUpdate:modelValue": e[4] || (e[4] = (a) => k.value = a)
          }, [...e[12] || (e[12] = [
            n("option", { value: "cloud" }, "Cloud (email + API token)", -1),
            n("option", { value: "server" }, "Server / Data Center (PAT)", -1)
          ])], 512), [
            [ne, k.value]
          ])
        ]),
        k.value === "cloud" ? (d(), v(ae, { key: 0 }, [
          n("label", fe, [
            e[14] || (e[14] = n("span", null, "Account email", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (a) => _.value = a),
              type: "email",
              placeholder: "you@example.com"
            }, null, 512), [
              [h, _.value]
            ])
          ]),
          n("label", me, [
            e[15] || (e[15] = n("span", null, "API token", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (a) => P.value = a),
              type: "password",
              placeholder: "Atlassian API token"
            }, null, 512), [
              [h, P.value]
            ])
          ])
        ], 64)) : (d(), v("label", ke, [
          e[16] || (e[16] = n("span", null, "Personal access token", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (a) => S.value = a),
            type: "password",
            placeholder: "Server/DC PAT"
          }, null, 512), [
            [h, S.value]
          ])
        ])),
        n("button", {
          class: "atl-primary",
          disabled: o.value,
          onClick: H
        }, O(o.value ? "Saving…" : "Save connection"), 9, ye)
      ])),
      u.value ? (d(), v("p", he, O(u.value), 1)) : q("", !0)
    ]));
  }
});
class we extends Q {
  static get wippyConfig() {
    return {
      propsSchema: Z.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: X
    };
  }
  static get vueConfig() {
    return { rootComponent: ge };
  }
}
oe(import.meta.url, we);
//# sourceMappingURL=connect.js.map
