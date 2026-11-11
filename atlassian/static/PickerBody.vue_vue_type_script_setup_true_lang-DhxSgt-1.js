import { defineComponent as U, computed as f, ref as c, watch as D, openBlock as a, createElementBlock as l, createElementVNode as i, withDirectives as j, toDisplayString as s, Fragment as w, renderList as b, vModelSelect as L, createTextVNode as I, createCommentVNode as y } from "vue";
import { api as S } from "@wippy-fe/proxy";
const P = { class: "atl-pick" }, T = { class: "atl-field" }, F = { value: "" }, K = ["value"], M = {
  key: 0,
  class: "atl-field"
}, $ = { value: "" }, q = ["value"], z = {
  key: 1,
  class: "atl-hint"
}, G = {
  key: 2,
  class: "atl-error"
}, O = /* @__PURE__ */ U({
  __name: "PickerBody",
  props: {
    kind: {},
    config: {}
  },
  emits: ["change"],
  setup(V, { emit: N }) {
    const r = V, x = N, A = f(() => r.kind === "jira" ? "jira_project" : "confluence_space"), h = f(() => r.kind === "jira" ? "project_key" : "space_key"), k = f(() => r.kind === "jira" ? "Project" : "Space"), m = c([]), d = c([]), o = c(""), u = c(""), v = c(!1), _ = c(!1), p = c("");
    function B(e) {
      o.value = e?.connection_id || "", u.value = e && e[h.value] || "";
    }
    D(() => r.config, (e) => B(e), { immediate: !0 });
    function g() {
      const e = { connection_id: o.value || void 0 };
      u.value && (e[h.value] = u.value), x("change", e);
    }
    async function E() {
      v.value = !0, p.value = "";
      try {
        const { data: e } = await S.get("/api/v1/connections?provider=atlassian");
        m.value = e && e.connections || [];
      } catch (e) {
        p.value = e instanceof Error ? e.message : String(e);
      } finally {
        v.value = !1;
      }
    }
    async function C() {
      if (d.value = [], !!o.value) {
        _.value = !0;
        try {
          const { data: e } = await S.post(`/api/v1/connections/${encodeURIComponent(o.value)}/discover_resources`, {}), t = e && e.resources || [];
          d.value = t.filter((n) => n.type === A.value);
        } catch {
          d.value = [];
        } finally {
          _.value = !1;
        }
      }
    }
    function R() {
      u.value = "", g(), C();
    }
    return E().then(() => {
      o.value && C();
    }), (e, t) => (a(), l("div", P, [
      i("label", T, [
        t[2] || (t[2] = i("span", null, "Atlassian connection", -1)),
        j(i("select", {
          "onUpdate:modelValue": t[0] || (t[0] = (n) => o.value = n),
          onChange: R
        }, [
          i("option", F, s(v.value ? "Loading…" : "Select a connection"), 1),
          (a(!0), l(w, null, b(m.value, (n) => (a(), l("option", {
            key: n.component_id,
            value: n.component_id
          }, s(n.name || n.component_id), 9, K))), 128))
        ], 544), [
          [L, o.value]
        ])
      ]),
      o.value ? (a(), l("label", M, [
        i("span", null, [
          I(s(k.value) + " ", 1),
          i("em", null, "(optional — limit this capability to one " + s(k.value.toLowerCase()) + ")", 1)
        ]),
        j(i("select", {
          "onUpdate:modelValue": t[1] || (t[1] = (n) => u.value = n),
          onChange: g
        }, [
          i("option", $, s(_.value ? "Loading…" : "Any (account-wide)"), 1),
          (a(!0), l(w, null, b(d.value, (n) => (a(), l("option", {
            key: n.id || n.key,
            value: n.key
          }, s(n.name || n.key) + " (" + s(n.key) + ")", 9, q))), 128))
        ], 544), [
          [L, u.value]
        ])
      ])) : y("", !0),
      !m.value.length && !v.value ? (a(), l("p", z, " No Atlassian connection yet — add one from the Connections page first. ")) : y("", !0),
      p.value ? (a(), l("p", G, s(p.value), 1)) : y("", !0)
    ]));
  }
});
export {
  O as _
};
//# sourceMappingURL=PickerBody.vue_vue_type_script_setup_true_lang-DhxSgt-1.js.map
