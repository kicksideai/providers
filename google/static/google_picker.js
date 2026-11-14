import { u as B, a as D, W as G } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as P, ref as s, watch as T, computed as h, onMounted as M, openBlock as o, createElementBlock as r, createElementVNode as u, normalizeClass as V, toDisplayString as p, createCommentVNode as c } from "vue";
import { loadByTagName as j, api as q, define as U } from "@wippy-fe/proxy";
import "@iconify/vue";
const I = { class: "gpick" }, L = { class: "gfield" }, W = ["value"], F = { key: 0 }, J = {
  key: 1,
  class: "ghint"
}, K = {
  key: 2,
  class: "gerr",
  role: "alert"
}, O = {
  key: 3,
  class: "gerr"
}, R = /* @__PURE__ */ P({
  __name: "GooglePicker",
  setup(y) {
    const x = B(), k = D(), d = s([]), i = s(""), g = s(!1), l = s(""), f = s("");
    T(
      () => x.value.config,
      (e) => {
        i.value = e?.connection_id || "";
      },
      { immediate: !0 }
    );
    const a = h(
      () => d.value.find((e) => e.component_id === i.value)
    ), w = h(
      () => JSON.stringify({ connection_id: i.value })
    );
    function m(e) {
      if (!e) return "";
      const t = String(e.connection_state || e.status || "").toLowerCase(), n = Number(e.expires_at || 0);
      return n > 0 && n <= Math.floor(Date.now() / 1e3) ? "expired" : t === "authenticated" || t === "active" || t === "connected" ? "connected" : t || "unknown";
    }
    function b(e) {
      const t = m(e);
      return t ? t === "connected" ? "Connected" : t === "expired" ? "Token expired" : t === "needs_reauth" || t === "reauth_required" ? "Reconnect required" : t === "disabled" ? "Disabled" : t === "unknown" ? "Unknown" : t.replace(/_/g, " ") : "";
    }
    function C(e) {
      return e?.scopes_granted ? Array.isArray(e.scopes_granted) ? e.scopes_granted : String(e.scopes_granted).split(/\s+/).filter(Boolean) : [];
    }
    function S(e) {
      return e === "openid" ? "Sign in" : e.includes("/auth/gmail") ? "Gmail" : e.includes("/auth/drive") ? "Drive" : e.includes("/auth/calendar") ? "Calendar" : e.includes("/auth/documents") ? "Docs" : e.includes("/auth/spreadsheets") ? "Sheets" : e.includes("/auth/presentations") ? "Slides" : e.includes("/auth/contacts") ? "Contacts" : e.includes("/auth/analytics") ? "Analytics" : e.includes("/auth/userinfo.email") ? "Email" : e.includes("/auth/userinfo.profile") ? "Profile" : e.replace(/^https:\/\/www\.googleapis\.com\/auth\//, "");
    }
    function v(e) {
      const t = [...new Set(C(e).map(S))], n = t.length || Number(e?.scope_count || 0);
      if (!n) return "";
      if (!t.length) return `${n} scope${n === 1 ? "" : "s"}`;
      const z = t.slice(0, 4).join(", "), A = t.length > 4 ? ` +${t.length - 4}` : "";
      return `${z}${A}`;
    }
    function E() {
      k("config-changed", { connection_id: i.value || void 0 });
    }
    function N(e) {
      const t = e.detail;
      i.value = t?.connection_id || "", E();
    }
    async function $() {
      g.value = !0, l.value = "";
      try {
        const { data: e } = await q.get(
          "/api/v1/connections?provider=google&limit=100"
        );
        d.value = e?.connections ?? [];
      } catch (e) {
        l.value = e instanceof Error ? e.message : String(e);
      } finally {
        g.value = !1;
      }
    }
    return M(async () => {
      try {
        await j("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (e) {
        f.value = e instanceof Error ? e.message : "Connection picker unavailable";
      }
      await $();
    }), (e, t) => (o(), r("div", I, [
      u("label", L, [
        t[0] || (t[0] = u("span", null, "Google connection", -1)),
        u("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "google",
          "reply-only": "false",
          placeholder: "Auto-select default",
          value: w.value,
          onChange: N
        }, null, 40, W)
      ]),
      a.value ? (o(), r("div", {
        key: 0,
        class: V(["gmeta", `state-${m(a.value)}`])
      }, [
        u("span", null, p(b(a.value)), 1),
        v(a.value) ? (o(), r("span", F, " · " + p(v(a.value)), 1)) : c("", !0)
      ], 2)) : c("", !0),
      !d.value.length && !g.value ? (o(), r("p", J, " No Google connection yet. ")) : c("", !0),
      f.value ? (o(), r("p", K, " Connection picker unavailable: " + p(f.value), 1)) : c("", !0),
      l.value ? (o(), r("p", O, p(l.value), 1)) : c("", !0)
    ]));
  }
}), H = ".gpick{display:grid;gap:8px;color:var(--p-text-color);font:13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.gfield{display:grid;gap:6px}.gfield span{font-size:12px;font-weight:650;color:var(--p-text-muted-color)}.gfield wc-connection-picker{display:block;width:100%;min-height:36px}.gmeta{width:fit-content;border-radius:6px;padding:4px 8px;font-size:12px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.gmeta.state-connected{color:var(--p-success-600);background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.gmeta.state-expired,.gmeta.state-needs_reauth,.gmeta.state-reauth_required{color:var(--p-danger-600);background:color-mix(in srgb,var(--p-danger-500) 12%,transparent)}.ghint,.gerr{margin:0;font-size:12px}.ghint{color:var(--p-text-muted-color)}.gerr{color:var(--p-danger-600)}", Q = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Trait context with optional connection_id.", properties: { connection_id: { type: "string" } } } } } }, X = {
  wippy: Q
};
class _ extends G {
  static get wippyConfig() {
    return {
      propsSchema: X.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: H
    };
  }
  static get vueConfig() {
    return { rootComponent: R };
  }
}
async function ne() {
  return _;
}
U(import.meta.url, _);
export {
  ne as webComponent
};
//# sourceMappingURL=google_picker.js.map
