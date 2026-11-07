import { defineComponent as M, ref as a, computed as C, watch as A, onMounted as O, openBlock as u, createElementBlock as d, createElementVNode as s, createVNode as B, unref as I, toDisplayString as f, createCommentVNode as m } from "vue";
import { a as T, u as x } from "./wc-runtime-CNDpK4lj.js";
import { loadByTagName as D, api as j } from "@wippy-fe/proxy";
import L from "primevue/select";
const P = { class: "hs" }, U = { class: "hs-field" }, $ = ["value"], G = { class: "hs-field" }, J = { class: "hs-summary" }, X = {
  key: 0,
  class: "hs-hint"
}, Y = {
  key: 1,
  class: "hs-error",
  role: "alert"
}, q = {
  key: 2,
  class: "hs-error"
}, z = 240, ee = /* @__PURE__ */ M({
  __name: "HubSpotPicker",
  setup(F) {
    const S = T(), k = x(), b = a([]), l = a([]), c = a(""), n = a("contacts"), v = a(!1), r = a(!1), t = a(""), p = a(""), E = C(() => l.value.find((o) => o.id === n.value)?.name || n.value), R = C(
      () => JSON.stringify({ connection_id: c.value })
    );
    function w(e) {
      c.value = e?.connection_id || "", n.value = e?.object_type || "contacts";
    }
    A(
      () => S.value.config,
      (e) => w(e),
      { immediate: !0 }
    );
    function y() {
      k("config-changed", {
        connection_id: c.value || void 0,
        object_type: n.value || void 0
      });
    }
    async function H() {
      v.value = !0, t.value = "";
      try {
        const { data: e } = await j.get("/api/v1/connections?provider=hubspot");
        b.value = e && e.connections || [];
      } catch (e) {
        t.value = e instanceof Error ? e.message : String(e);
      } finally {
        v.value = !1;
      }
    }
    async function h() {
      if (l.value = [], !!c.value) {
        r.value = !0, t.value = "";
        try {
          const { data: e } = await j.post(
            `/api/v1/connections/${encodeURIComponent(c.value)}/discover_resources`,
            {}
          ), o = e && typeof e == "object" ? e : null;
          if (o?.success === !1) {
            const i = typeof o.error == "string" ? o.error.trim().slice(0, z) : "";
            t.value = i ? `HubSpot object discovery failed: ${i}` : "HubSpot object discovery failed";
            return;
          }
          const g = (Array.isArray(o?.resources) ? o.resources : []).filter((i) => i.type === "hubspot_object" && i.id);
          if (!g.length) {
            t.value = "HubSpot object discovery returned no readable objects";
            return;
          }
          l.value = g, l.value.some((i) => i.id === n.value) || (n.value = l.value[0]?.id || n.value);
        } catch (e) {
          l.value = [], t.value = e instanceof Error ? e.message : "HubSpot object discovery failed";
        } finally {
          r.value = !1;
        }
      }
    }
    function N(e) {
      const o = e.detail;
      c.value = o?.connection_id || "", y(), h();
    }
    function V() {
      y();
    }
    return O(async () => {
      try {
        await D("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (e) {
        p.value = e instanceof Error ? e.message : "Connection picker unavailable";
      }
      await H(), c.value && await h();
    }), (e, o) => (u(), d("div", P, [
      s("label", U, [
        o[1] || (o[1] = s("span", null, "HubSpot connection", -1)),
        s("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "hubspot",
          "reply-only": "false",
          placeholder: "Select a connection",
          value: R.value,
          onChange: N
        }, null, 40, $)
      ]),
      s("label", G, [
        o[2] || (o[2] = s("span", null, "CRM object", -1)),
        B(I(L), {
          modelValue: n.value,
          "onUpdate:modelValue": o[0] || (o[0] = (_) => n.value = _),
          options: l.value,
          "option-label": "name",
          "option-value": "id",
          loading: r.value,
          "aria-label": "CRM object",
          onChange: V
        }, null, 8, ["modelValue", "options", "loading"])
      ]),
      s("div", J, [
        o[3] || (o[3] = s("span", { class: "hs-dot" }, null, -1)),
        s("span", null, f(r.value ? "Loading objects..." : E.value), 1)
      ]),
      !b.value.length && !v.value ? (u(), d("p", X, " No HubSpot connection yet. Add one from the Connections page first. ")) : m("", !0),
      p.value ? (u(), d("p", Y, " Connection picker unavailable: " + f(p.value), 1)) : m("", !0),
      t.value ? (u(), d("p", q, f(t.value), 1)) : m("", !0)
    ]));
  }
});
export {
  ee as default
};
//# sourceMappingURL=HubSpotPicker-BcIlDVKp.js.map
