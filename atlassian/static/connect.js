import { u as J, a as Y, W as Q, s as X } from "./styles-CFY21Xvp.js";
import { defineComponent as Z, ref as s, computed as j, onUnmounted as ee, openBlock as d, createElementBlock as v, createElementVNode as n, normalizeClass as M, withDirectives as f, vModelText as g, toDisplayString as O, createCommentVNode as q, vModelSelect as te, Fragment as ne } from "vue";
import { api as B, define as oe } from "@wippy-fe/proxy";
import "@iconify/vue";
const ae = { class: "atl" }, le = { class: "atl-tabs" }, se = { class: "atl-field" }, ie = {
  key: 0,
  class: "atl-pane"
}, re = ["disabled"], ue = {
  key: 0,
  class: "atl-warn"
}, ce = {
  key: 1,
  class: "atl-pane"
}, pe = { class: "atl-field" }, de = { class: "atl-field" }, ve = { class: "atl-field" }, fe = { class: "atl-field" }, me = {
  key: 1,
  class: "atl-field"
}, ye = ["disabled"], ke = {
  key: 2,
  class: "atl-error"
}, ge = "kickside.atlassian.connection:atlassian_connection", he = /* @__PURE__ */ Z({
  __name: "Connect",
  setup(R) {
    const K = J(), h = Y(), W = [
      "read:me",
      "offline_access",
      "read:jira-work",
      "write:jira-work",
      "read:jira-user",
      "read:confluence-content.all",
      "write:confluence-content"
    ], m = s("oauth"), a = s(!1), r = s(""), u = s("");
    let l = null, b = null, c = "", p = "", w = !1, C = 0, E = !1;
    const U = s(""), A = s(""), y = s("cloud"), _ = s(""), P = s(""), S = s(""), T = j(() => K.value.componentId || ""), z = j(() => U.value.trim() || "Atlassian");
    function i(t) {
      r.value = t, a.value = !1;
    }
    function I(t) {
      if (t)
        try {
          t.close();
        } catch {
        }
    }
    function x(t = !1) {
      b && (clearInterval(b), b = null), w && (window.removeEventListener("message", V), w = !1), t && I(l), l = null;
    }
    function k(t = !0) {
      C += 1, x(t), c = "", p = "", u.value = "";
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
    function V(t) {
      const e = t.data;
      if (!(!e || e.type !== "oauth_result") && !(!l || t.source !== l) && !(!c || t.origin !== c) && !(!p || e.state_token !== p))
        if (x(!0), c = "", p = "", u.value = "", a.value = !1, e.success)
          r.value = "", h("oauth-result", { success: !0 });
        else {
          const o = e.error || "Atlassian authorization failed";
          r.value = o, h("oauth-result", { success: !1, error: o });
        }
    }
    function L() {
      w || (window.addEventListener("message", V), w = !0), b = setInterval(() => {
        let t = !1;
        try {
          t = !l || l.closed;
        } catch {
          t = !1;
        }
        if (!t) return;
        x(), c = "", p = "", u.value = "", a.value = !1;
        const e = "Atlassian authorization was cancelled before completion";
        r.value = e, h("oauth-result", { success: !1, error: e });
      }, 600);
    }
    async function F() {
      k();
      const t = C;
      r.value = "", a.value = !0, l = window.open("about:blank", "oauth_atlassian", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      try {
        const e = { name: z.value, scopes: W };
        T.value && (e.component_id = T.value);
        const { data: o } = await B.post("/api/v1/oauth/providers/atlassian/init", e);
        if (E || t !== C) return;
        if (!o?.success || !o.authorization_url)
          return k(), i(o?.error || "Could not start Atlassian sign-in");
        const D = $(o.redirect_uri), N = typeof o.state_token == "string" ? o.state_token : "";
        if (!D || !N)
          return k(), i("OAuth response did not include a valid callback identity");
        c = D, p = N, l && !l.closed ? (L(), l.location.href = o.authorization_url) : (l = null, u.value = o.authorization_url, a.value = !1);
      } catch (e) {
        if (E || t !== C) return;
        k(), i(e instanceof Error ? e.message : String(e));
      }
    }
    function G() {
      if (!u.value || !c || !p) return;
      a.value = !0;
      const t = window.open(
        u.value,
        "oauth_atlassian",
        "width=520,height=680,menubar=no,toolbar=no,location=no,status=no"
      );
      if (!t || t.closed)
        return I(t), a.value = !1, i("Popup blocked — allow popups and retry");
      x(!0), l = t, u.value = "", L();
    }
    ee(() => {
      E = !0, k(), a.value = !1;
    });
    async function H() {
      if (r.value = "", !A.value.trim()) return i("Site URL is required");
      const t = { site_url: A.value.trim(), deployment: y.value };
      if (y.value === "server") {
        if (!S.value.trim()) return i("Personal access token is required");
        t.personal_access_token = S.value.trim();
      } else {
        if (!_.value.trim() || !P.value.trim()) return i("Email and API token are required");
        t.email = _.value.trim(), t.api_token = P.value.trim();
      }
      a.value = !0;
      try {
        const { data: e } = await B.post("/api/v1/connections", {
          impl_id: ge,
          name: z.value,
          private_context: t
        });
        if (!e || e.success === !1) return i(e?.error || "Could not save connection");
        a.value = !1, h("connection-saved", { success: !0 });
      } catch (e) {
        i(e instanceof Error ? e.message : String(e));
      }
    }
    return (t, e) => (d(), v("div", ae, [
      n("div", le, [
        n("button", {
          class: M(["atl-tab", { on: m.value === "oauth" }]),
          onClick: e[0] || (e[0] = (o) => m.value = "oauth")
        }, "Sign in with Atlassian", 2),
        n("button", {
          class: M(["atl-tab", { on: m.value === "credential" }]),
          onClick: e[1] || (e[1] = (o) => m.value = "credential")
        }, "API token / PAT", 2)
      ]),
      n("label", se, [
        e[8] || (e[8] = n("span", null, "Connection name", -1)),
        f(n("input", {
          "onUpdate:modelValue": e[2] || (e[2] = (o) => U.value = o),
          type: "text",
          placeholder: "Atlassian"
        }, null, 512), [
          [g, U.value]
        ])
      ]),
      m.value === "oauth" ? (d(), v("div", ie, [
        e[10] || (e[10] = n("p", { class: "atl-hint" }, "Authorize KickSide to access your Atlassian Jira and Confluence. Opens a secure Atlassian sign-in window.", -1)),
        n("button", {
          class: "atl-primary",
          disabled: a.value,
          onClick: F
        }, O(a.value ? "Connecting…" : "Connect Atlassian"), 9, re),
        u.value ? (d(), v("div", ue, [
          e[9] || (e[9] = n("span", null, "Your browser blocked the popup.", -1)),
          n("button", {
            type: "button",
            onClick: G
          }, "Open authorization")
        ])) : q("", !0)
      ])) : (d(), v("div", ce, [
        n("label", pe, [
          e[11] || (e[11] = n("span", null, "Site URL", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (o) => A.value = o),
            type: "text",
            placeholder: "https://your-org.atlassian.net"
          }, null, 512), [
            [g, A.value]
          ])
        ]),
        n("label", de, [
          e[13] || (e[13] = n("span", null, "Deployment", -1)),
          f(n("select", {
            "onUpdate:modelValue": e[4] || (e[4] = (o) => y.value = o)
          }, [...e[12] || (e[12] = [
            n("option", { value: "cloud" }, "Cloud (email + API token)", -1),
            n("option", { value: "server" }, "Server / Data Center (PAT)", -1)
          ])], 512), [
            [te, y.value]
          ])
        ]),
        y.value === "cloud" ? (d(), v(ne, { key: 0 }, [
          n("label", ve, [
            e[14] || (e[14] = n("span", null, "Account email", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (o) => _.value = o),
              type: "email",
              placeholder: "you@example.com"
            }, null, 512), [
              [g, _.value]
            ])
          ]),
          n("label", fe, [
            e[15] || (e[15] = n("span", null, "API token", -1)),
            f(n("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (o) => P.value = o),
              type: "password",
              placeholder: "Atlassian API token"
            }, null, 512), [
              [g, P.value]
            ])
          ])
        ], 64)) : (d(), v("label", me, [
          e[16] || (e[16] = n("span", null, "Personal access token", -1)),
          f(n("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (o) => S.value = o),
            type: "password",
            placeholder: "Server/DC PAT"
          }, null, 512), [
            [g, S.value]
          ])
        ])),
        n("button", {
          class: "atl-primary",
          disabled: a.value,
          onClick: H
        }, O(a.value ? "Saving…" : "Save connection"), 9, ye)
      ])),
      r.value ? (d(), v("p", ke, O(r.value), 1)) : q("", !0)
    ]));
  }
}), be = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (atlassian)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, we = {
  wippy: be
};
class Ce extends Q {
  static get wippyConfig() {
    return {
      propsSchema: we.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: X
    };
  }
  static get vueConfig() {
    return { rootComponent: he };
  }
}
oe(import.meta.url, Ce);
//# sourceMappingURL=connect.js.map
