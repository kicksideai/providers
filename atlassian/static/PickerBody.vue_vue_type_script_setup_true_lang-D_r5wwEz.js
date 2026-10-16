import { defineComponent as U, computed as _, ref as s, watch as D, openBlock as a, createElementBlock as l, createElementVNode as i, withDirectives as C, toDisplayString as c, Fragment as j, renderList as w, vModelSelect as S, createTextVNode as I, createCommentVNode as y } from "vue";
import { api as V } from "@wippy-fe/proxy";
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
  setup(b, { emit: L }) {
    const r = b, N = L, x = _(() => r.kind === "jira" ? "jira_project" : "confluence_space"), k = _(() => r.kind === "jira" ? "project_key" : "space_key"), A = _(() => r.kind === "jira" ? "Project" : "Space"), m = s([]), d = s([]), t = s(""), u = s(""), v = s(!1), f = s(!1), p = s("");
    function B(e) {
      t.value = e?.connection_id || "", u.value = e && e[k.value] || "";
    }
    D(() => r.config, (e) => B(e), { immediate: !0 });
    function g() {
      const e = { connection_id: t.value || void 0 };
      u.value && (e[k.value] = u.value), N("change", e);
    }
    async function E() {
      v.value = !0, p.value = "";
      try {
        const { data: e } = await V.get("/api/v1/connections?provider=atlassian");
        m.value = e && e.connections || [];
      } catch (e) {
        p.value = e instanceof Error ? e.message : String(e);
      } finally {
        v.value = !1;
      }
    }
    async function h() {
      if (d.value = [], !!t.value) {
        f.value = !0;
        try {
          const { data: e } = await V.post(`/api/v1/connections/${encodeURIComponent(t.value)}/discover_resources`, {}), o = e && e.resources || [];
          d.value = o.filter((n) => n.type === x.value);
        } catch {
          d.value = [];
        } finally {
          f.value = !1;
        }
      }
    }
    function R() {
      u.value = "", g(), h();
    }
    return E().then(() => {
      t.value && h();
    }), (e, o) => (a(), l("div", P, [
      i("label", T, [
        o[2] || (o[2] = i("span", null, "Atlassian connection", -1)),
        C(i("select", {
          "onUpdate:modelValue": o[0] || (o[0] = (n) => t.value = n),
          onChange: R
        }, [
          i("option", F, c(v.value ? "Loading…" : "Select a connection"), 1),
          (a(!0), l(j, null, w(m.value, (n) => (a(), l("option", {
            key: n.component_id,
            value: n.component_id
          }, c(n.name || n.component_id), 9, K))), 128))
        ], 544), [
          [S, t.value]
        ])
      ]),
      t.value ? (a(), l("label", M, [
        i("span", null, [
          I(c(A.value) + " ", 1),
          o[3] || (o[3] = i("em", null, "(optional — pin to scope this trait)", -1))
        ]),
        C(i("select", {
          "onUpdate:modelValue": o[1] || (o[1] = (n) => u.value = n),
          onChange: g
        }, [
          i("option", $, c(f.value ? "Loading…" : "Any (account-wide)"), 1),
          (a(!0), l(j, null, w(d.value, (n) => (a(), l("option", {
            key: n.id || n.key,
            value: n.key
          }, c(n.name || n.key) + " (" + c(n.key) + ")", 9, q))), 128))
        ], 544), [
          [S, u.value]
        ])
      ])) : y("", !0),
      !m.value.length && !v.value ? (a(), l("p", z, " No Atlassian connection yet — add one from the Connections page first. ")) : y("", !0),
      p.value ? (a(), l("p", G, c(p.value), 1)) : y("", !0)
    ]));
  }
});
export {
  O as _
};
//# sourceMappingURL=PickerBody.vue_vue_type_script_setup_true_lang-D_r5wwEz.js.map
