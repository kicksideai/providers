import { defineComponent as K, ref as s, computed as M, onUnmounted as Y, openBlock as p, createElementBlock as v, createElementVNode as n, normalizeClass as j, withDirectives as f, vModelText as b, toDisplayString as E, createCommentVNode as q, vModelSelect as Q, Fragment as W } from "vue";
import { u as X, a as Z } from "./wc-runtime-h8e5VJvv.js";
import { api as B } from "@wippy-fe/proxy";
const ee = { class: "atl" }, te = { class: "atl-tabs" }, ne = { class: "atl-field" }, ae = {
  key: 0,
  class: "atl-pane"
}, le = ["disabled"], oe = {
  key: 0,
  class: "atl-warn"
}, se = {
  key: 1,
  class: "atl-pane"
}, ie = { class: "atl-field" }, ue = { class: "atl-field" }, re = { class: "atl-field" }, ce = { class: "atl-field" }, de = {
  key: 1,
  class: "atl-field"
}, pe = ["disabled"], ve = {
  key: 2,
  class: "atl-error"
}, fe = "kickside.atlassian.connection:atlassian_connection", he = /* @__PURE__ */ K({
  __name: "Connect",
  setup(me) {
    const R = X(), h = Z(), $ = [
      "read:me",
      "offline_access",
      "read:jira-work",
      "write:jira-work",
      "read:jira-user",
      "read:confluence-content.all",
      "write:confluence-content"
    ], m = s("oauth"), l = s(!1), u = s(""), r = s("");
    let o = null, w = null, c = "", d = "", g = !1, A = 0, x = !1;
    const O = s(""), _ = s(""), k = s("cloud"), C = s(""), P = s(""), S = s(""), I = M(() => R.value.componentId || ""), T = M(() => O.value.trim() || "Atlassian");
    function i(t) {
      u.value = t, l.value = !1;
    }
    function z(t) {
      if (t)
        try {
          t.close();
        } catch {
        }
    }
    function U(t = !1) {
      w && (clearInterval(w), w = null), g && (window.removeEventListener("message", V), g = !1), t && z(o), o = null;
    }
    function y(t = !0) {
      A += 1, U(t), c = "", d = "", r.value = "";
    }
    function F(t) {
      if (typeof t != "string" || !t) return "";
      try {
        const e = new URL(t, window.location.href);
        return e.protocol === "http:" || e.protocol === "https:" ? e.origin : "";
      } catch {
        return "";
      }
    }
    function V(t) {
      const e = t.data;
      if (!(!e || e.type !== "oauth_result") && !(!o || t.source !== o) && !(!c || t.origin !== c) && !(!d || e.state_token !== d))
        if (U(!0), c = "", d = "", r.value = "", l.value = !1, e.success)
          u.value = "", h("oauth-result", { success: !0 });
        else {
          const a = e.error || "Atlassian authorization failed";
          u.value = a, h("oauth-result", { success: !1, error: a });
        }
    }
    function L() {
      g || (window.addEventListener("message", V), g = !0), w = setInterval(() => {
        let t = !1;
        try {
          t = !o || o.closed;
        } catch {
          t = !1;
        }
        if (!t) return;
        U(), c = "", d = "", r.value = "", l.value = !1;
        const e = "Atlassian authorization was cancelled before completion";
        u.value = e, h("oauth-result", { success: !1, error: e });
      }, 600);
    }
    async function G() {
      y();
      const t = A;
      u.value = "", l.value = !0, o = window.open("about:blank", "oauth_atlassian", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      try {
        const e = { name: T.value, scopes: $ };
        I.value && (e.component_id = I.value);
        const { data: a } = await B.post("/api/v1/oauth/providers/atlassian/init", e);
        if (x || t !== A) return;
        if (!a?.success || !a.authorization_url)
          return y(), i(a?.error || "Could not start Atlassian sign-in");
        const D = F(a.redirect_uri), N = typeof a.state_token == "string" ? a.state_token : "";
        if (!D || !N)
          return y(), i("OAuth response did not include a valid callback identity");
        c = D, d = N, o && !o.closed ? (L(), o.location.href = a.authorization_url) : (o = null, r.value = a.authorization_url, l.value = !1);
      } catch (e) {
        if (x || t !== A) return;
        y(), i(e instanceof Error ? e.message : String(e));
      }
    }
    function H() {
      if (!r.value || !c || !d) return;
      l.value = !0;
      const t = window.open(
        r.value,
        "oauth_atlassian",
        "width=520,height=680,menubar=no,toolbar=no,location=no,status=no"
      );
      if (!t || t.closed)
        return z(t), l.value = !1, i("Popup blocked — allow popups and retry");
      U(!0), o = t, r.value = "", L();
    }
    Y(() => {
      x = !0, y(), l.value = !1;
    });
    async function J() {
      if (u.value = "", !_.value.trim()) return i("Site URL is required");
      const t = { site_url: _.value.trim(), deployment: k.value };
      if (k.value === "server") {
        if (!S.value.trim()) return i("Personal access token is required");
        t.personal_access_token = S.value.trim();
      } else {
        if (!C.value.trim() || !P.value.trim()) return i("Email and API token are required");
        t.email = C.value.trim(), t.api_token = P.value.trim();
      }
      l.value = !0;
      try {
        const { data: e } = await B.post("/api/v1/connections", {
          impl_id: fe,
          name: T.value,
          private_context: t
        });
        if (!e || e.success === !1) return i(e?.error || "Could not save connection");
        l.value = !1, h("connection-saved", { success: !0 });
      } catch (e) {
        i(e instanceof Error ? e.message : String(e));
      }
    }
    return (t, e) => (p(), v("div", ee, [
      n("div", te, [
        n("button", {
          class: j(["atl-tab", { on: m.value === "oauth" }]),
          onClick: e[0] || (e[0] = (a) => m.value = "oauth")
        }, "Sign in with Atlassian", 2),
        n("button", {
          class: j(["atl-tab", { on: m.value === "credential" }]),
          onClick: e[1] || (e[1] = (a) => m.value = "credential")
        }, "API token / PAT", 2)
      ]),
      n("label", ne, [
        e[8] || (e[8] = n("span", null, "Connection name", -1)),
        f(n("input", {
          "onUpdate:modelValue": e[2] || (e[2] = (a) => O.value = a),
          type: "text",
          placeholder: "Atlassian"
        }, null, 512), [
          [b, O.value]
        ])
      ]),
      m.value === "oauth" ? (p(), v("div", ae, [
        e[10] || (e[10] = n("p", { class: "atl-hint" }, "Authorize KickSide to access your Atlassian Jira and Confluence. Opens a secure Atlassian sign-in window.", -1)),
        n("button", {
          class: "atl-primary",
          disabled: l.value,
          onClick: G
        }, E(l.value ? "Connecting…" : "Connect Atlassian"), 9, le),
        r.value ? (p(), v("div", oe, [
          e[9] || (e[9] = n("span", null, "Your browser blocked the popup.", -1)),
          n("button", {
            type: "button",
            onClick: H
          }, "Open authorization")
        ])) : q("", !0)
      ])) : (p(), v("div", se, [
        n("label", ie, [
          e[11] || (e[11] = n("span", null, "Site URL", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (a) => _.value = a),
            type: "text",
            placeholder: "https://your-org.atlassian.net"
          }, null, 512), [
            [b, _.value]
          ])
        ]),
        n("label", ue, [
          e[13] || (e[13] = n("span", null, "Deployment", -1)),
          f(n("select", {
            "onUpdate:modelValue": e[4] || (e[4] = (a) => k.value = a)
          }, [...e[12] || (e[12] = [
            n("option", { value: "cloud" }, "Cloud (email + API token)", -1),
            n("option", { value: "server" }, "Server / Data Center (PAT)", -1)
          ])], 512), [
            [Q, k.value]
          ])
        ]),
        k.value === "cloud" ? (p(), v(W, { key: 0 }, [
          n("label", re, [
            e[14] || (e[14] = n("span", null, "Account email", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (a) => C.value = a),
              type: "email",
              placeholder: "you@example.com"
            }, null, 512), [
              [b, C.value]
            ])
          ]),
          n("label", ce, [
            e[15] || (e[15] = n("span", null, "API token", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (a) => P.value = a),
              type: "password",
              placeholder: "Atlassian API token"
            }, null, 512), [
              [b, P.value]
            ])
          ])
        ], 64)) : (p(), v("label", de, [
          e[16] || (e[16] = n("span", null, "Personal access token", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (a) => S.value = a),
            type: "password",
            placeholder: "Server/DC PAT"
          }, null, 512), [
            [b, S.value]
          ])
        ])),
        n("button", {
          class: "atl-primary",
          disabled: l.value,
          onClick: J
        }, E(l.value ? "Saving…" : "Save connection"), 9, pe)
      ])),
      u.value ? (p(), v("p", ve, E(u.value), 1)) : q("", !0)
    ]));
  }
});
export {
  he as default
};
//# sourceMappingURL=Connect-MIbchh-w.js.map
