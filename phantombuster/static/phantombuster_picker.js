import { u as B, a as N, W as S } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as V, ref as o, computed as k, watch as z, onMounted as q, openBlock as i, createElementBlock as r, createElementVNode as d, normalizeClass as D, toDisplayString as m, createCommentVNode as a } from "vue";
import { loadByTagName as M, api as T, define as j } from "@wippy-fe/proxy";
import "@iconify/vue";
const A = { class: "pbpick" }, L = { class: "pbpick-field" }, U = ["value"], W = {
  key: 1,
  class: "pbpick-hint"
}, I = {
  key: 2,
  class: "pbpick-error",
  role: "alert"
}, J = {
  key: 3,
  class: "pbpick-error"
}, K = /* @__PURE__ */ V({
  __name: "PhantomBusterPicker",
  setup(b) {
    const g = B(), _ = N(), s = o([]), n = o(""), p = o(!1), c = o(""), l = o(""), u = k(
      () => s.value.find((e) => w(e) === n.value)
    ), y = k(
      () => JSON.stringify({ connection_id: n.value })
    );
    function w(e) {
      return e.component_id;
    }
    z(
      () => g.value.config,
      (e) => {
        n.value = e?.connection_id || "";
      },
      { immediate: !0 }
    );
    function f(e) {
      if (!e) return "";
      const t = String(e.connection_state || e.status || "").toLowerCase(), v = Number(e.expires_at || 0);
      return v > 0 && v <= Math.floor(Date.now() / 1e3) ? "expired" : t === "authenticated" || t === "active" || t === "connected" ? "connected" : t || "unknown";
    }
    function x(e) {
      const t = f(e);
      return t ? t === "connected" ? "Connected" : t === "expired" ? "Expired" : t === "needs_reauth" || t === "reauth_required" ? "Reconnect required" : t === "disabled" ? "Disabled" : t === "unknown" ? "Unknown" : t.replace(/_/g, " ") : "";
    }
    function C() {
      _("config-changed", { connection_id: n.value || void 0 });
    }
    function E(e) {
      const t = e.detail;
      n.value = t?.connection_id || "", C();
    }
    async function P() {
      p.value = !0, c.value = "";
      try {
        const { data: e } = await T.get(
          "/api/v1/connections?provider=phantombuster&limit=100"
        );
        s.value = e?.connections ?? [];
      } catch (e) {
        c.value = e instanceof Error ? e.message : String(e);
      } finally {
        p.value = !1;
      }
    }
    return q(async () => {
      try {
        await M("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (e) {
        l.value = e instanceof Error ? e.message : "Connection picker unavailable";
      }
      await P();
    }), (e, t) => (i(), r("div", A, [
      d("label", L, [
        t[0] || (t[0] = d("span", null, "PhantomBuster connection", -1)),
        d("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "phantombuster",
          "reply-only": "false",
          placeholder: "Auto-select default",
          value: y.value,
          onChange: E
        }, null, 40, U)
      ]),
      u.value ? (i(), r("div", {
        key: 0,
        class: D(["pbpick-meta", `state-${f(u.value)}`])
      }, m(x(u.value)), 3)) : a("", !0),
      !s.value.length && !p.value ? (i(), r("p", W, " No PhantomBuster connection yet. ")) : a("", !0),
      l.value ? (i(), r("p", I, " Connection picker unavailable: " + m(l.value), 1)) : a("", !0),
      c.value ? (i(), r("p", J, m(c.value), 1)) : a("", !0)
    ]));
  }
}), O = ".pbpick{display:grid;gap:8px;color:var(--p-text-color);background:var(--p-content-background);font:inherit}.pbpick-field{display:grid;gap:6px}.pbpick-field span{color:var(--p-text-muted-color);font-size:12px;font-weight:600}.pbpick wc-connection-picker{display:block;width:100%;min-height:36px}.pbpick-meta,.pbpick-hint,.pbpick-error{font-size:12px}.pbpick-meta{color:var(--p-success-600, var(--p-success-500))}.pbpick-meta.state-expired,.pbpick-meta.state-needs_reauth,.pbpick-meta.state-reauth_required{color:var(--p-warn-600, var(--p-warn-500))}.pbpick-hint{color:var(--p-text-muted-color)}.pbpick-error{color:var(--p-danger-600, var(--p-danger-500))}", R = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Trait context with optional connection_id.", properties: { connection_id: { type: "string" } }, additionalProperties: !1 } } } }, $ = {
  wippy: R
};
class h extends S {
  static get wippyConfig() {
    return {
      propsSchema: $.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: O
    };
  }
  static get vueConfig() {
    return { rootComponent: K };
  }
}
async function X() {
  return h;
}
j(import.meta.url, h);
export {
  X as webComponent
};
//# sourceMappingURL=phantombuster_picker.js.map
