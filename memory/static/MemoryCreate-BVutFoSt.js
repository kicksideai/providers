import { defineComponent as V, unref as b, openBlock as t, createElementBlock as n, toDisplayString as v, createCommentVNode as k, computed as $, createElementVNode as p, createVNode as T, createBlock as g, Fragment as C, renderList as E, createTextVNode as _, renderSlot as I, normalizeClass as M, ref as w, watch as W, withCtx as j } from "vue";
import { a as F, u as z } from "./wc-runtime-KO3cNuNo.js";
import { Icon as O } from "@iconify/vue";
import P from "primevue/inputnumber";
import D from "primevue/inputtext";
import H from "primevue/textarea";
import L from "primevue/toggleswitch";
import { u as q } from "./useWidget-OxU0xAVl.js";
import { p as A, a as G, e as J } from "./types-DQ01_s6c.js";
const K = ["aria-labelledby", "value", "capability"], Q = {
  key: 1,
  class: "kx-notice error"
}, U = /* @__PURE__ */ V({
  __name: "ModelPicker",
  props: {
    value: {},
    capability: {},
    labelledBy: {}
  },
  emits: ["select"],
  setup(e, { emit: y }) {
    const h = y, l = q("wc-model-picker");
    function i(d) {
      const a = d instanceof CustomEvent ? d.detail : void 0;
      typeof a == "string" && a && h("select", a);
    }
    return (d, a) => b(l).ready.value ? (t(), n("wc-model-picker", {
      key: 0,
      "aria-labelledby": e.labelledBy,
      value: e.value,
      capability: e.capability,
      onSelect: i
    }, null, 40, K)) : b(l).failed.value ? (t(), n("div", Q, "The model picker could not load: " + v(b(l).failed.value), 1)) : k("", !0);
  }
}), R = {
  key: 0,
  class: "mm-toggle"
}, X = { class: "mm-field" }, Y = { class: "mm-label" }, Z = {
  key: 0,
  class: "mm-hint"
}, ee = {
  key: 1,
  class: "mm-field"
}, te = ["id"], ae = ["id", "for"], le = {
  key: 6,
  class: "mm-hint"
}, ie = /* @__PURE__ */ V({
  __name: "ConfigField",
  props: {
    name: {},
    field: {},
    value: {}
  },
  emits: ["update"],
  setup(e, { emit: y }) {
    const h = e, l = y, i = $(() => h.field.title || h.name);
    return (d, a) => e.field.type === "boolean" ? (t(), n("div", R, [
      p("span", X, [
        p("span", Y, v(i.value), 1),
        e.field.description ? (t(), n("span", Z, v(e.field.description), 1)) : k("", !0)
      ]),
      T(b(L), {
        "model-value": e.value === !0,
        "aria-label": i.value,
        "onUpdate:modelValue": a[0] || (a[0] = (s) => l("update", s))
      }, null, 8, ["model-value", "aria-label"])
    ])) : (t(), n("div", ee, [
      e.field.web_component ? (t(), n("span", {
        key: 0,
        id: `${e.name}_label`,
        class: "mm-label"
      }, v(i.value), 9, te)) : (t(), n("label", {
        key: 1,
        id: `${e.name}_label`,
        class: "mm-label",
        for: e.name
      }, v(i.value), 9, ae)),
      e.field.web_component === "wc-model-picker" ? (t(), g(U, {
        key: 2,
        "labelled-by": `${e.name}_label`,
        value: String(e.value || ""),
        capability: "generate",
        onSelect: a[1] || (a[1] = (s) => l("update", s))
      }, null, 8, ["labelled-by", "value"])) : e.field.type === "integer" || e.field.type === "number" ? (t(), g(b(P), {
        key: 3,
        "input-id": e.name,
        "model-value": typeof e.value == "number" ? e.value : null,
        min: e.field.minimum,
        max: e.field.maximum,
        "max-fraction-digits": e.field.type === "integer" ? 0 : 6,
        "onUpdate:modelValue": a[2] || (a[2] = (s) => l("update", s ?? void 0))
      }, null, 8, ["input-id", "model-value", "min", "max", "max-fraction-digits"])) : e.field.format === "textarea" ? (t(), g(b(H), {
        key: 4,
        id: e.name,
        "model-value": String(e.value ?? ""),
        "auto-resize": "",
        "onUpdate:modelValue": a[3] || (a[3] = (s) => l("update", s))
      }, null, 8, ["id", "model-value"])) : (t(), g(b(D), {
        key: 5,
        id: e.name,
        "model-value": String(e.value ?? ""),
        "onUpdate:modelValue": a[4] || (a[4] = (s) => l("update", s))
      }, null, 8, ["id", "model-value"])),
      e.field.description ? (t(), n("span", le, v(e.field.description), 1)) : k("", !0)
    ]));
  }
}), ne = { class: "mm-sections" }, oe = { class: "mm-section-h" }, se = { class: "mm-section-hint" }, de = { class: "mm-grid" }, me = /* @__PURE__ */ V({
  __name: "ConfigFields",
  props: {
    schema: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: y }) {
    const h = e, l = y, i = {
      models: { title: "Models", icon: "tabler:cpu", hint: "Which models read conversations and decide what changes in the memory." },
      learning: { title: "What it learns", icon: "tabler:school", hint: "What agents that use this memory capture into it." },
      recall: { title: "What agents see", icon: "tabler:eye", hint: "How much of the memory goes into an agent's instructions and each step." },
      upkeep: { title: "Upkeep", icon: "tabler:refresh", hint: "Background work that keeps the memory tidy." }
    }, d = $(() => {
      const u = Object.entries(h.schema.properties || {}).sort((o, c) => (o[1].order ?? 1e3) - (c[1].order ?? 1e3)), f = [];
      for (const o of u) {
        const c = o[1].section || "other", m = f.find((r) => r.id === c);
        m ? m.fields.push(o) : f.push({ id: c, fields: [o] });
      }
      return f;
    });
    function a(u) {
      return u.type === "boolean" || u.format === "textarea";
    }
    function s(u, f) {
      l("update:modelValue", { ...h.modelValue, [u]: f });
    }
    return (u, f) => (t(), n("div", ne, [
      (t(!0), n(C, null, E(d.value, (o) => (t(), n("section", {
        key: o.id,
        class: "mm-section"
      }, [
        i[o.id] ? (t(), n(C, { key: 0 }, [
          p("h3", oe, [
            T(b(O), {
              icon: i[o.id].icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            _(v(i[o.id].title), 1)
          ]),
          p("p", se, v(i[o.id].hint), 1)
        ], 64)) : k("", !0),
        p("div", de, [
          I(u.$slots, `before-${o.id}`),
          (t(!0), n(C, null, E(o.fields, ([c, m]) => (t(), g(ie, {
            key: c,
            class: M({ wide: a(m) }),
            name: c,
            field: m,
            value: e.modelValue[c],
            onUpdate: (r) => s(c, r)
          }, null, 8, ["class", "name", "field", "value", "onUpdate"]))), 128))
        ])
      ]))), 128))
    ]));
  }
}), ce = {
  key: 0,
  class: "kx-notice error"
}, re = { class: "mm-field wide" }, ue = {
  key: 0,
  class: "mm-hint"
}, fe = {
  key: 2,
  class: "mm-hint"
}, Ve = /* @__PURE__ */ V({
  __name: "MemoryCreate",
  setup(e) {
    const y = F(), h = z(), l = w(""), i = w({}), d = w("class:embed"), a = w({});
    W(() => y.value.config, (m) => {
      try {
        const r = A(m), x = r.config;
        if (!x || typeof x != "object") throw new Error("Memory create schema must supply object properties");
        const B = G(x.config_schema), S = { ...x, config_schema: B };
        i.value = { ...r, config: S };
        const { config_schema: ve, ...N } = S;
        a.value = { ...N }, d.value = i.value.embedding_model || "class:embed", l.value = "", f();
      } catch (r) {
        l.value = J(r);
      }
    }, { immediate: !0 });
    const s = $(() => !!i.value.edit), u = $(() => i.value.config?.config_schema);
    function f() {
      h("config-changed", { embedding_model: d.value, config: { ...a.value } });
    }
    function o(m) {
      d.value = m, f();
    }
    function c(m) {
      a.value = m, f();
    }
    return (m, r) => l.value ? (t(), n("div", ce, v(l.value), 1)) : (t(), g(me, {
      key: 1,
      schema: u.value,
      "model-value": a.value,
      "onUpdate:modelValue": c
    }, {
      "before-models": j(() => [
        p("div", re, [
          r[0] || (r[0] = p("span", {
            id: "embedding_label",
            class: "mm-label"
          }, "Embedding model", -1)),
          s.value ? (t(), n("span", ue, v(d.value) + ", fixed when the memory was created.", 1)) : (t(), g(U, {
            key: 1,
            "labelled-by": "embedding_label",
            value: d.value,
            capability: "embed",
            onSelect: o
          }, null, 8, ["value"])),
          s.value ? k("", !0) : (t(), n("span", fe, "Turns memories into vectors for search. It cannot change after the memory is created."))
        ])
      ]),
      _: 1
    }, 8, ["schema", "model-value"]));
  }
});
export {
  Ve as default
};
//# sourceMappingURL=MemoryCreate-BVutFoSt.js.map
