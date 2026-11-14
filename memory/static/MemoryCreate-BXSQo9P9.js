import { defineComponent as V, unref as b, openBlock as t, createElementBlock as l, toDisplayString as h, computed as $, createElementVNode as p, createCommentVNode as w, createVNode as T, createBlock as g, Fragment as C, renderList as E, createTextVNode as N, renderSlot as I, normalizeClass as M, ref as x, watch as W, withCtx as j } from "vue";
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
}, R = {
  key: 2,
  class: "mm-picker-pending",
  "aria-hidden": "true"
}, U = /* @__PURE__ */ V({
  __name: "ModelPicker",
  props: {
    value: {},
    capability: {},
    labelledBy: {}
  },
  emits: ["select"],
  setup(e, { emit: y }) {
    const v = y, i = q("wc-model-picker");
    function n(d) {
      const a = d instanceof CustomEvent ? d.detail : void 0;
      typeof a == "string" && a && v("select", a);
    }
    return (d, a) => b(i).ready.value ? (t(), l("wc-model-picker", {
      key: 0,
      "aria-labelledby": e.labelledBy,
      value: e.value,
      capability: e.capability,
      onSelect: n
    }, null, 40, K)) : b(i).failed.value ? (t(), l("div", Q, "The model picker could not load: " + h(b(i).failed.value), 1)) : (t(), l("div", R));
  }
}), X = {
  key: 0,
  class: "mm-toggle"
}, Y = { class: "mm-field" }, Z = { class: "mm-label" }, ee = {
  key: 0,
  class: "mm-hint"
}, te = {
  key: 1,
  class: "mm-field"
}, ae = ["id"], le = ["id", "for"], ie = {
  key: 6,
  class: "mm-hint"
}, ne = /* @__PURE__ */ V({
  __name: "ConfigField",
  props: {
    name: {},
    field: {},
    value: {}
  },
  emits: ["update"],
  setup(e, { emit: y }) {
    const v = e, i = y, n = $(() => v.field.title || v.name);
    return (d, a) => e.field.type === "boolean" ? (t(), l("div", X, [
      p("span", Y, [
        p("span", Z, h(n.value), 1),
        e.field.description ? (t(), l("span", ee, h(e.field.description), 1)) : w("", !0)
      ]),
      T(b(L), {
        "model-value": e.value === !0,
        "aria-label": n.value,
        "onUpdate:modelValue": a[0] || (a[0] = (s) => i("update", s))
      }, null, 8, ["model-value", "aria-label"])
    ])) : (t(), l("div", te, [
      e.field.web_component ? (t(), l("span", {
        key: 0,
        id: `${e.name}_label`,
        class: "mm-label"
      }, h(n.value), 9, ae)) : (t(), l("label", {
        key: 1,
        id: `${e.name}_label`,
        class: "mm-label",
        for: e.name
      }, h(n.value), 9, le)),
      e.field.web_component === "wc-model-picker" ? (t(), g(U, {
        key: 2,
        "labelled-by": `${e.name}_label`,
        value: String(e.value || ""),
        capability: "generate",
        onSelect: a[1] || (a[1] = (s) => i("update", s))
      }, null, 8, ["labelled-by", "value"])) : e.field.type === "integer" || e.field.type === "number" ? (t(), g(b(P), {
        key: 3,
        "input-id": e.name,
        "model-value": typeof e.value == "number" ? e.value : null,
        min: e.field.minimum,
        max: e.field.maximum,
        "max-fraction-digits": e.field.type === "integer" ? 0 : 6,
        "onUpdate:modelValue": a[2] || (a[2] = (s) => i("update", s ?? void 0))
      }, null, 8, ["input-id", "model-value", "min", "max", "max-fraction-digits"])) : e.field.format === "textarea" ? (t(), g(b(H), {
        key: 4,
        id: e.name,
        "model-value": String(e.value ?? ""),
        "auto-resize": "",
        "onUpdate:modelValue": a[3] || (a[3] = (s) => i("update", s))
      }, null, 8, ["id", "model-value"])) : (t(), g(b(D), {
        key: 5,
        id: e.name,
        "model-value": String(e.value ?? ""),
        "onUpdate:modelValue": a[4] || (a[4] = (s) => i("update", s))
      }, null, 8, ["id", "model-value"])),
      e.field.description ? (t(), l("span", ie, h(e.field.description), 1)) : w("", !0)
    ]));
  }
}), oe = { class: "mm-sections" }, se = { class: "mm-section-h" }, de = { class: "mm-section-hint" }, me = { class: "mm-grid" }, ce = /* @__PURE__ */ V({
  __name: "ConfigFields",
  props: {
    schema: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: y }) {
    const v = e, i = y, n = {
      models: { title: "Models", icon: "tabler:cpu", hint: "Which models read conversations and decide what changes in the memory." },
      learning: { title: "What it learns", icon: "tabler:school", hint: "What agents that use this memory capture into it." },
      recall: { title: "What agents see", icon: "tabler:eye", hint: "How much of the memory goes into an agent's instructions and each step." },
      upkeep: { title: "Upkeep", icon: "tabler:refresh", hint: "Background work that keeps the memory tidy." }
    }, d = $(() => {
      const u = Object.entries(v.schema.properties || {}).sort((o, c) => (o[1].order ?? 1e3) - (c[1].order ?? 1e3)), f = [];
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
      i("update:modelValue", { ...v.modelValue, [u]: f });
    }
    return (u, f) => (t(), l("div", oe, [
      (t(!0), l(C, null, E(d.value, (o) => (t(), l("section", {
        key: o.id,
        class: "mm-section"
      }, [
        n[o.id] ? (t(), l(C, { key: 0 }, [
          p("h3", se, [
            T(b(O), {
              icon: n[o.id].icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            N(h(n[o.id].title), 1)
          ]),
          p("p", de, h(n[o.id].hint), 1)
        ], 64)) : w("", !0),
        p("div", me, [
          I(u.$slots, `before-${o.id}`),
          (t(!0), l(C, null, E(o.fields, ([c, m]) => (t(), g(ne, {
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
}), re = {
  key: 0,
  class: "kx-notice error"
}, ue = { class: "mm-field wide" }, fe = {
  key: 0,
  class: "mm-hint"
}, he = {
  key: 2,
  class: "mm-hint"
}, Ce = /* @__PURE__ */ V({
  __name: "MemoryCreate",
  setup(e) {
    const y = F(), v = z(), i = x(""), n = x({}), d = x("class:embed"), a = x({});
    W(() => y.value.config, (m) => {
      try {
        const r = A(m), k = r.config;
        if (!k || typeof k != "object") throw new Error("Memory create schema must supply object properties");
        const _ = G(k.config_schema), S = { ...k, config_schema: _ };
        n.value = { ...r, config: S };
        const { config_schema: ve, ...B } = S;
        a.value = { ...B }, d.value = n.value.embedding_model || "class:embed", i.value = "", f();
      } catch (r) {
        i.value = J(r);
      }
    }, { immediate: !0 });
    const s = $(() => !!n.value.edit), u = $(() => n.value.config?.config_schema);
    function f() {
      v("config-changed", { embedding_model: d.value, config: { ...a.value } });
    }
    function o(m) {
      d.value = m, f();
    }
    function c(m) {
      a.value = m, f();
    }
    return (m, r) => i.value ? (t(), l("div", re, h(i.value), 1)) : (t(), g(ce, {
      key: 1,
      schema: u.value,
      "model-value": a.value,
      "onUpdate:modelValue": c
    }, {
      "before-models": j(() => [
        p("div", ue, [
          r[0] || (r[0] = p("span", {
            id: "embedding_label",
            class: "mm-label"
          }, "Embedding model", -1)),
          s.value ? (t(), l("span", fe, h(d.value) + ", fixed when the memory was created.", 1)) : (t(), g(U, {
            key: 1,
            "labelled-by": "embedding_label",
            value: d.value,
            capability: "embed",
            onSelect: o
          }, null, 8, ["value"])),
          s.value ? w("", !0) : (t(), l("span", he, "Turns memories into vectors for search. It cannot change after the memory is created."))
        ])
      ]),
      _: 1
    }, 8, ["schema", "model-value"]));
  }
});
export {
  Ce as default
};
//# sourceMappingURL=MemoryCreate-BXSQo9P9.js.map
