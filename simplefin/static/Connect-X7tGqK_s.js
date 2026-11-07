import { defineComponent as V, ref as d, computed as g, openBlock as s, createElementBlock as a, withModifiers as $, createElementVNode as t, createStaticVNode as U, toDisplayString as i, createTextVNode as h, createCommentVNode as u, withDirectives as S, vModelText as T, vModelDynamic as j, Fragment as A, renderList as H } from "vue";
import { api as b } from "@wippy-fe/proxy";
import { a as P, u as G } from "./wc-runtime-CNDpK4lj.js";
const W = { class: "sf-intro" }, Z = { class: "sf-intro-text" }, q = {
  key: 0,
  class: "sf-steps"
}, z = {
  key: 1,
  class: "sf-field"
}, O = {
  key: 2,
  class: "sf-field"
}, Y = { class: "sf-secret" }, J = ["type"], K = ["aria-label"], Q = {
  key: 3,
  class: "sf-note"
}, X = {
  key: 4,
  class: "sf-feedback error",
  role: "alert"
}, ee = {
  key: 5,
  class: "sf-feedback success",
  role: "status"
}, te = { style: { flex: "1", "min-width": "0" } }, ne = {
  key: 0,
  class: "sf-accounts"
}, oe = { class: "sf-account-name" }, se = { class: "sf-account-balance" }, ae = ["disabled"], ie = {
  key: 0,
  class: "sf-spinner",
  "aria-hidden": "true"
}, le = "kickside.simplefin.connection:simplefin_connection", re = "https://bridge.simplefin.org", ve = /* @__PURE__ */ V({
  __name: "Connect",
  setup(ue) {
    const I = P(), w = G(), k = d("SimpleFIN"), p = d(""), v = d(!1), f = d(!1), c = d(""), l = d(null), r = d("");
    function x() {
      w("connection-saved", { success: !0, component_id: r.value });
    }
    const y = g(() => String(I.value.componentId ?? "")), m = g(() => y.value !== ""), C = g(() => f.value ? m.value ? "Claiming new token…" : "Claiming token…" : m.value ? "Claim and replace credential" : "Claim and connect");
    function _(n) {
      const e = n?.response;
      return e?.data?.error ? e.data.error : n instanceof Error ? n.message : String(n);
    }
    function N() {
      return p.value.trim() ? "" : "Paste the setup token from SimpleFIN Bridge.";
    }
    async function F(n) {
      const { data: e } = await b.post(`/api/v1/connections/${encodeURIComponent(n)}/discover_resources`, {});
      if (!e?.success) throw new Error(e?.error || "The connection was created but its accounts could not be listed.");
      l.value = Array.isArray(e.resources) ? e.resources : [];
    }
    async function M() {
      const { data: n } = await b.post("/api/v1/connections", {
        impl_id: le,
        name: k.value.trim() || "SimpleFIN",
        private_context: { setup_token: p.value.trim() },
        validate: !0
      });
      if (!n?.success) throw new Error(n?.error || "SimpleFIN did not accept the setup token.");
      return String(n.component_id);
    }
    async function B() {
      const { data: n } = await b.put(`/api/v1/simplefin/connections/${encodeURIComponent(y.value)}`, {
        setup_token: p.value.trim(),
        name: k.value.trim() || void 0
      });
      if (!n?.success) throw new Error(n?.error || "SimpleFIN did not accept the new setup token.");
      return String(n.component_id || y.value);
    }
    async function R() {
      if (c.value = N(), l.value = null, r.value = "", !c.value) {
        f.value = !0;
        try {
          const n = m.value ? await B() : await M();
          r.value = n, await F(n), p.value = "";
        } catch (n) {
          c.value = _(n), w("connection-saved", { success: !1, error: c.value });
        } finally {
          f.value = !1;
        }
      }
    }
    function E(n) {
      return n.metadata?.account_name || n.name;
    }
    function L(n) {
      return n.metadata?.org?.name || n.metadata?.org?.domain || "";
    }
    function D(n) {
      const e = n.metadata;
      if (!e?.balance) return n.description || "";
      const o = Number(e.balance);
      return `${Number.isFinite(o) ? o.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : e.balance} ${e.currency || ""}`.trim();
    }
    return (n, e) => (s(), a("form", {
      class: "sf",
      "aria-label": "SimpleFIN connection",
      onSubmit: $(R, ["prevent"])
    }, [
      t("div", W, [
        e[5] || (e[5] = U('<div class="sf-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6"></path><path d="M5 10v8"></path><path d="M10 10v8"></path><path d="M14 10v8"></path><path d="M19 10v8"></path><path d="M3 20h18"></path></svg></div>', 1)),
        t("div", Z, [
          t("strong", null, i(m.value ? "Replace the SimpleFIN credential" : "Connect your bank feed through SimpleFIN"), 1),
          e[4] || (e[4] = t("small", null, "SimpleFIN Bridge links your banks once and hands out a one-time setup token. The token is claimed on the server and never stored; only the access it unlocks is kept, privately, on this connection.", -1))
        ])
      ]),
      r.value ? u("", !0) : (s(), a("ol", q, [
        t("li", null, [
          e[6] || (e[6] = h("Sign in at ", -1)),
          t("a", {
            href: re,
            target: "_blank",
            rel: "noopener"
          }, "bridge.simplefin.org"),
          e[7] || (e[7] = h(" and link your institutions.", -1))
        ]),
        e[8] || (e[8] = t("li", null, "Under My Account, Apps, create a new app and copy the setup token it shows once.", -1)),
        e[9] || (e[9] = t("li", null, "Paste it below. Claiming takes a moment; then your accounts appear here.", -1))
      ])),
      !m.value && !r.value ? (s(), a("label", z, [
        e[10] || (e[10] = t("span", null, "Connection name", -1)),
        S(t("input", {
          "onUpdate:modelValue": e[0] || (e[0] = (o) => k.value = o),
          class: "sf-input",
          autocomplete: "off",
          placeholder: "SimpleFIN"
        }, null, 512), [
          [T, k.value]
        ])
      ])) : u("", !0),
      r.value ? u("", !0) : (s(), a("label", O, [
        e[11] || (e[11] = t("span", null, [
          h("Setup token "),
          t("em", null, "Required")
        ], -1)),
        t("span", Y, [
          S(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (o) => p.value = o),
            class: "sf-input",
            type: v.value ? "text" : "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0v…",
            onInput: e[2] || (e[2] = (o) => c.value = "")
          }, null, 40, J), [
            [j, p.value]
          ]),
          t("button", {
            type: "button",
            class: "sf-reveal",
            "aria-label": v.value ? "Hide token" : "Show token",
            onClick: e[3] || (e[3] = (o) => v.value = !v.value)
          }, i(v.value ? "Hide" : "Show"), 9, K)
        ]),
        e[12] || (e[12] = t("small", null, "A setup token works exactly once. If it was already used, create a new one at the bridge.", -1))
      ])),
      r.value ? u("", !0) : (s(), a("p", Q, [...e[13] || (e[13] = [
        t("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          t("rect", {
            x: "5",
            y: "11",
            width: "14",
            height: "10",
            rx: "2"
          }),
          t("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" })
        ], -1),
        t("span", null, "Read-only. SimpleFIN cannot move money, and the credential stays in this connection's private context, never in agent prompts.", -1)
      ])])),
      c.value ? (s(), a("div", X, [
        e[15] || (e[15] = t("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          t("circle", {
            cx: "12",
            cy: "12",
            r: "9"
          }),
          t("path", { d: "M12 8v4" }),
          t("path", { d: "M12 16h.01" })
        ], -1)),
        t("div", null, [
          e[14] || (e[14] = t("strong", null, "Could not connect", -1)),
          t("small", null, i(c.value), 1)
        ])
      ])) : u("", !0),
      l.value ? (s(), a("div", ee, [
        e[16] || (e[16] = t("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2.2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          t("path", { d: "M5 12l5 5 9-10" })
        ], -1)),
        t("div", te, [
          t("strong", null, i(m.value ? "Credential replaced" : "Connected"), 1),
          t("small", null, i(l.value.length === 0 ? "The bridge shares no accounts yet. Link an institution at bridge.simplefin.org and adjust which accounts it shares." : `${l.value.length} account${l.value.length === 1 ? "" : "s"} shared by the bridge. Sources and the SimpleFIN Reader trait can use this connection now.`), 1),
          l.value.length ? (s(), a("ul", ne, [
            (s(!0), a(A, null, H(l.value, (o) => (s(), a("li", {
              key: o.id,
              class: "sf-account"
            }, [
              t("div", oe, [
                t("span", null, i(E(o)), 1),
                t("small", null, i(L(o)), 1)
              ]),
              t("span", se, i(D(o)), 1)
            ]))), 128))
          ])) : u("", !0)
        ])
      ])) : u("", !0),
      r.value ? (s(), a("button", {
        key: 6,
        class: "sf-submit",
        type: "button",
        onClick: x
      }, "Done")) : (s(), a("button", {
        key: 7,
        class: "sf-submit",
        type: "submit",
        disabled: f.value
      }, [
        f.value ? (s(), a("span", ie)) : u("", !0),
        h(" " + i(C.value), 1)
      ], 8, ae))
    ], 32));
  }
});
export {
  ve as default
};
//# sourceMappingURL=Connect-X7tGqK_s.js.map
