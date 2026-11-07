import { defineComponent as Q, ref as u, computed as H, onUnmounted as W, openBlock as b, createElementBlock as f, createElementVNode as o, normalizeClass as M, withDirectives as m, vModelText as N, vModelRadio as R, vModelCheckbox as X, toDisplayString as O, createCommentVNode as K, withKeys as Z, withModifiers as ee } from "vue";
import { a as te, u as oe } from "./wc-runtime-CNDpK4lj.js";
import { api as B } from "@wippy-fe/proxy";
const ne = { class: "gh" }, se = { class: "gh-tabs" }, ae = ["disabled"], le = ["disabled"], ie = { class: "gh-field" }, ue = ["disabled"], re = {
  key: 0,
  class: "gh-pane"
}, ce = {
  class: "gh-pick",
  role: "radiogroup",
  "aria-label": "Repository access"
}, de = { class: "gh-choice" }, pe = ["disabled"], ve = { class: "gh-choice" }, he = ["disabled"], be = { class: "gh-check" }, fe = ["disabled"], me = ["disabled"], ge = {
  key: 0,
  class: "gh-warn"
}, _e = {
  key: 1,
  class: "gh-pane"
}, ke = { class: "gh-field" }, ye = ["disabled", "onKeydown"], we = ["disabled"], Ce = {
  key: 2,
  class: "gh-error"
}, Pe = "kickside.github.connection:github_connection", Se = /* @__PURE__ */ Q({
  __name: "Connect",
  setup(Ge) {
    const S = te(), g = oe(), D = ["read:user", "user:email"], p = u("oauth"), s = u(!1), l = u(""), i = u(""), C = u(""), v = u("public_repo"), P = u(!1), G = u("");
    let a = null, _ = null, r = "", c = "", k = !1, y = 0, A = !1;
    const $ = H(() => S.value.providerId || "github"), x = H(() => S.value.componentId || ""), U = H(() => C.value.trim() || "GitHub");
    function d(t) {
      l.value = t, s.value = !1;
    }
    function q() {
      const t = [...D, v.value];
      return P.value && t.push("read:org"), t;
    }
    function z(t) {
      if (t)
        try {
          t.close();
        } catch {
        }
    }
    function w(t = !1) {
      _ && (clearInterval(_), _ = null), k && (window.removeEventListener("message", E), k = !1), t && z(a), a = null;
    }
    function E(t) {
      const e = t.data;
      if (!(!e || e.type !== "oauth_result") && !(!a || t.source !== a) && !(!r || t.origin !== r) && !(!c || e.state_token !== c))
        if (w(!0), r = "", c = "", s.value = !1, i.value = "", e.success)
          l.value = "", g("oauth-result", { success: !0 });
        else {
          const n = e.error || "GitHub authorization failed";
          l.value = n, g("oauth-result", { success: !1, error: n });
        }
    }
    function F() {
      _ = setInterval(() => {
        let t = !1;
        try {
          t = !a || a.closed;
        } catch {
          t = !1;
        }
        if (!t) return;
        w(), r = "", c = "", s.value = !1, i.value = "";
        const e = "GitHub authorization was cancelled before completion";
        l.value = e, g("oauth-result", { success: !1, error: e });
      }, 800);
    }
    function I() {
      k || (window.addEventListener("message", E), k = !0), F();
    }
    function h(t = !0) {
      y += 1, w(t), r = "", c = "", i.value = "";
    }
    function Y(t) {
      if (typeof t != "string" || !t) return "";
      try {
        const e = new URL(t, window.location.href);
        return e.protocol === "http:" || e.protocol === "https:" ? e.origin : "";
      } catch {
        return "";
      }
    }
    async function j() {
      h();
      const t = y;
      l.value = "", s.value = !0, a = window.open("about:blank", "oauth_github", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      try {
        const e = { name: U.value, scopes: q() };
        x.value && (e.component_id = x.value);
        const { data: n } = await B.post(`/api/v1/oauth/providers/${encodeURIComponent($.value)}/init`, e);
        if (A || t !== y) return;
        if (!n?.success || !n.authorization_url)
          return h(), d(n?.error || "Could not start GitHub sign-in");
        const V = Y(n.redirect_uri), L = typeof n.state_token == "string" ? n.state_token : "";
        if (!V || !L)
          return h(), d("OAuth response did not include a valid callback identity");
        r = V, c = L, a && !a.closed ? (I(), a.location.href = n.authorization_url) : (a = null, i.value = n.authorization_url, s.value = !1);
      } catch (e) {
        if (A || t !== y) return;
        h(), d(e instanceof Error ? e.message : String(e));
      }
    }
    function J() {
      if (!i.value || !r || !c) return;
      s.value = !0;
      const t = window.open(i.value, "oauth_github", "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
      if (!t || t.closed)
        return z(t), s.value = !1, d("Popup blocked - allow popups and retry");
      w(!0), a = t, i.value = "", I();
    }
    async function T() {
      l.value = "";
      const t = G.value.trim();
      if (!t) return d("Personal access token is required");
      s.value = !0;
      try {
        const { data: e } = await B.post("/api/v1/connections", {
          impl_id: Pe,
          name: U.value,
          private_context: { token: t },
          validate: !0
        });
        if (!e || e.success === !1) return d(e?.error || "Could not save GitHub connection");
        s.value = !1, g("connection-saved", { success: !0 });
      } catch (e) {
        d(e instanceof Error ? e.message : String(e));
      }
    }
    return W(() => {
      A = !0, h(), s.value = !1;
    }), (t, e) => (b(), f("div", ne, [
      o("div", se, [
        o("button", {
          type: "button",
          class: M(["gh-tab", { on: p.value === "oauth" }]),
          disabled: s.value,
          onClick: e[0] || (e[0] = (n) => p.value = "oauth")
        }, "GitHub OAuth", 10, ae),
        o("button", {
          type: "button",
          class: M(["gh-tab", { on: p.value === "pat" }]),
          disabled: s.value,
          onClick: e[1] || (e[1] = (n) => p.value = "pat")
        }, "Personal access token", 10, le)
      ]),
      o("label", ie, [
        e[7] || (e[7] = o("span", null, "Connection name", -1)),
        m(o("input", {
          "onUpdate:modelValue": e[2] || (e[2] = (n) => C.value = n),
          type: "text",
          placeholder: "GitHub",
          disabled: s.value
        }, null, 8, ue), [
          [N, C.value]
        ])
      ]),
      p.value === "oauth" ? (b(), f("div", re, [
        e[12] || (e[12] = o("p", { class: "gh-hint" }, "Authorize KickSide with a GitHub OAuth App. This is the preferred path for repository agents and automations.", -1)),
        o("div", ce, [
          o("label", de, [
            m(o("input", {
              "onUpdate:modelValue": e[3] || (e[3] = (n) => v.value = n),
              type: "radio",
              value: "public_repo",
              disabled: s.value
            }, null, 8, pe), [
              [R, v.value]
            ]),
            e[8] || (e[8] = o("span", null, [
              o("strong", null, "Public repositories"),
              o("em", null, "Use GitHub's public_repo scope.")
            ], -1))
          ]),
          o("label", ve, [
            m(o("input", {
              "onUpdate:modelValue": e[4] || (e[4] = (n) => v.value = n),
              type: "radio",
              value: "repo",
              disabled: s.value
            }, null, 8, he), [
              [R, v.value]
            ]),
            e[9] || (e[9] = o("span", null, [
              o("strong", null, "Private and public repositories"),
              o("em", null, "Use GitHub's broader repo scope.")
            ], -1))
          ])
        ]),
        o("label", be, [
          m(o("input", {
            "onUpdate:modelValue": e[5] || (e[5] = (n) => P.value = n),
            type: "checkbox",
            disabled: s.value
          }, null, 8, fe), [
            [X, P.value]
          ]),
          e[10] || (e[10] = o("span", null, "Read organization membership when repository access depends on teams.", -1))
        ]),
        o("button", {
          class: "gh-primary",
          type: "button",
          disabled: s.value,
          onClick: j
        }, O(s.value ? "Connecting..." : "Sign in with GitHub"), 9, me),
        i.value ? (b(), f("div", ge, [
          e[11] || (e[11] = o("span", null, "Your browser blocked the popup.", -1)),
          o("button", {
            type: "button",
            onClick: J
          }, "Open authorization")
        ])) : K("", !0)
      ])) : (b(), f("div", _e, [
        e[14] || (e[14] = o("p", { class: "gh-hint" }, "Use a fine-grained or classic GitHub token only when OAuth is unavailable. The token is stored in the connection private context.", -1)),
        o("label", ke, [
          e[13] || (e[13] = o("span", null, "Personal access token", -1)),
          m(o("input", {
            "onUpdate:modelValue": e[6] || (e[6] = (n) => G.value = n),
            type: "password",
            placeholder: "github_pat_...",
            disabled: s.value,
            onKeydown: Z(ee(T, ["prevent"]), ["enter"])
          }, null, 40, ye), [
            [N, G.value]
          ])
        ]),
        o("button", {
          class: "gh-primary",
          type: "button",
          disabled: s.value,
          onClick: T
        }, O(s.value ? "Saving..." : "Save token connection"), 9, we)
      ])),
      l.value ? (b(), f("p", Ce, O(l.value), 1)) : K("", !0)
    ]));
  }
});
export {
  Se as default
};
//# sourceMappingURL=Connect-B1SOaBIs.js.map
