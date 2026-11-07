import { P as he } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as K, computed as M, openBlock as n, createElementBlock as o, Fragment as R, createElementVNode as e, createVNode as b, unref as t, createTextVNode as N, renderList as z, normalizeClass as D, toDisplayString as c, createCommentVNode as h, createBlock as F, ref as T, watch as O, onUnmounted as _e, withModifiers as ie, onBeforeUnmount as ge, Transition as xe, withCtx as Z, renderSlot as le, nextTick as ae, withDirectives as $e, vShow as we } from "vue";
import { Icon as w } from "@iconify/vue";
import { b as Ce, a as Se, u as Te } from "./wc-runtime-KO3cNuNo.js";
import re from "primevue/tag";
import Ae from "primevue/inputtext";
import ue from "primevue/selectbutton";
import ee from "primevue/textarea";
import { e as Y, b as Ie, i as Ve, p as Ne } from "./types-DQ01_s6c.js";
import { on as Ee } from "@wippy-fe/proxy";
import { m as P, a as ne, h as se, u as Re, _ as Me } from "./usePaged-DWrKufE-.js";
import { u as Be } from "./useWidget-OxU0xAVl.js";
const q = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, Le = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function W(a) {
  const x = a.replace(/[_\-.]+/g, " ").trim();
  return x ? x.charAt(0).toUpperCase() + x.slice(1) : a;
}
const Ue = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function De(a) {
  return Ue[a];
}
const te = {
  current: "Current",
  superseded: "Earlier",
  conflict: "Conflict",
  archived: "Archived",
  forgotten: "Forgotten",
  scheduled: "Scheduled",
  running: "Running",
  succeeded: "Completed",
  failed: "Failed",
  rejected: "Rejected",
  cancelled: "Cancelled"
}, Fe = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function de(a) {
  return Fe[a] ?? "secondary";
}
function ce(a) {
  return a ? Date.parse(a.includes("T") ? a : a.replace(" ", "T") + "Z") : NaN;
}
function Q(a) {
  const x = ce(a);
  return Number.isFinite(x) ? new Date(x).toLocaleString() : "";
}
const Oe = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function H(a, x = Date.now()) {
  const d = ce(a);
  if (!Number.isFinite(d)) return "";
  const f = Math.round((d - x) / 1e3), l = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [s, r] of Oe)
    if (Math.abs(f) >= r) return l.format(Math.round(f / r), s);
  return "just now";
}
const Pe = { class: "mm-view-head" }, ze = { class: "mm-view-title" }, Ke = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, je = { class: "kx-empty-ico" }, We = {
  key: 1,
  class: "mm-runs"
}, He = { class: "mm-run-main" }, qe = { class: "mm-run-t" }, Je = ["title"], Ge = {
  key: 0,
  class: "mm-run-err"
}, Ye = {
  key: 0,
  class: "mm-muted"
}, Ze = { key: 1 }, Qe = { class: "mm-value" }, Xe = /* @__PURE__ */ K({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(a) {
    const x = a, d = M(() => x.memory.status.value?.runs || []);
    function f(s) {
      return s.run_type === "consolidate" ? "Consolidation" : s.run_type === "reembed" ? "Re-embedding" : s.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function l(s) {
      const r = s.stats || {}, i = [
        r.added ? `${r.added} new` : "",
        r.superseded ? `${r.superseded} updated` : "",
        r.conflicted ? `${r.conflicted} contested` : "",
        r.rejected ? `${r.rejected} rejected` : ""
      ].filter(Boolean);
      return i.length ? i.join(" · ") : s.status === "succeeded" ? "No changes" : "";
    }
    return (s, r) => (n(), o(R, null, [
      e("header", Pe, [
        e("h2", ze, [
          b(t(w), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          r[0] || (r[0] = N("Activity", -1))
        ]),
        r[1] || (r[1] = e("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      d.value.length ? (n(), o("ol", We, [
        (n(!0), o(R, null, z(d.value, (i) => (n(), o("li", {
          key: i.id,
          class: D(["mm-run", i.status])
        }, [
          e("div", He, [
            e("span", qe, c(f(i)), 1),
            e("span", {
              class: "mm-muted",
              title: t(Q)(i.finished_at || i.started_at || i.created_at)
            }, [
              N(c(t(H)(i.finished_at || i.started_at || i.created_at)), 1),
              l(i) ? (n(), o(R, { key: 0 }, [
                N(" · " + c(l(i)), 1)
              ], 64)) : h("", !0)
            ], 8, Je),
            i.last_error ? (n(), o("span", Ge, c(i.last_error), 1)) : h("", !0),
            i.status === "failed" ? (n(), o(R, { key: 1 }, [
              i.to_event_id ? (n(), o("span", Ye, "Range: " + c(i.from_event_id || "Beginning") + " → " + c(i.to_event_id), 1)) : h("", !0),
              i.model_output !== void 0 ? (n(), o("details", Ze, [
                r[4] || (r[4] = e("summary", null, "Rejected model output", -1)),
                e("pre", Qe, c(JSON.stringify(i.model_output, null, 2)), 1)
              ])) : h("", !0)
            ], 64)) : h("", !0)
          ]),
          i.status !== "succeeded" ? (n(), F(t(re), {
            key: 0,
            class: "kx-tag-sm",
            severity: t(de)(i.status),
            value: t(te)[i.status]
          }, null, 8, ["severity", "value"])) : h("", !0)
        ], 2))), 128))
      ])) : (n(), o("div", Ke, [
        e("span", je, [
          b(t(w), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        r[2] || (r[2] = e("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        r[3] || (r[3] = e("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
function et(a) {
  return a.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function oe(a) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(a);
}
function tt(a) {
  const x = M(() => `/api/v1/memory/${encodeURIComponent(a.value)}`), d = T(null), f = T(""), l = T(!1), s = T(0);
  let r = 0;
  async function i() {
    const S = ++r;
    if (!a.value) return !1;
    try {
      const C = await P(a.value).status();
      return S !== r ? !1 : (d.value = C, f.value = "", s.value++, !0);
    } catch (C) {
      return S === r && (f.value = Y(C)), !1;
    }
  }
  async function _(S) {
    l.value = !0, f.value = "";
    try {
      return await S(), await i();
    } catch (C) {
      return f.value = Y(C), !1;
    } finally {
      l.value = !1;
    }
  }
  let $ = null;
  return O(a, (S) => {
    if ($ && $(), $ = null, r++, d.value = null, f.value = "", !S) return;
    const C = Ee(`component.${S}`, () => {
      i();
    });
    $ = typeof C == "function" ? C : null, i();
  }, { immediate: !0 }), _e(() => {
    $ && $();
  }), Ce(async () => {
    await i();
  }), { memoryId: a, base: x, status: d, error: f, busy: l, revision: s, act: _ };
}
const lt = { class: "mm-field" }, nt = { class: "mm-hint" }, at = { class: "mm-field" }, st = ["selected"], ot = {
  key: 1,
  class: "kx-notice error"
}, it = { class: "mm-field" }, rt = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, ut = {
  key: 1,
  class: "mm-hint"
}, dt = {
  key: 2,
  class: "kx-notice error"
}, ct = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, mt = ["onClick"], vt = { class: "mm-field" }, yt = { class: "mm-form-foot" }, bt = ["disabled"], ft = /* @__PURE__ */ K({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(a, { emit: x }) {
    const d = a, f = x, l = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], s = T("rule"), r = T(""), i = T(""), _ = T(""), $ = Be("wc-agent-picker"), S = M(() => l.find((I) => I.value === s.value)?.hint || ""), C = M(() => et(i.value)), V = M(() => i.value && !oe(C.value) ? "Use a short topic of letters, digits and spaces." : ""), p = M(() => !!r.value && oe(C.value) && !!_.value.trim()), v = ne(
      () => d.memory.memoryId.value ? [d.memory.memoryId.value, s.value] : null,
      (I) => P(d.memory.memoryId.value).topics({ kind: s.value, offset: I }),
      d.memory.revision
    ), g = M(() => v.rows.value.map((I) => I.key).filter((I) => I !== C.value).slice(0, 8));
    O(s, () => {
      i.value = "";
    });
    function E(I) {
      const y = Ie(I).selected;
      r.value = String((Array.isArray(y) ? y : [])[0] || "");
    }
    async function j() {
      if (!p.value) return;
      let I = null;
      await d.memory.act(async () => {
        I = await P(d.memory.memoryId.value).create({
          kind: s.value,
          scope_family: "agent",
          scope_id: r.value,
          key: C.value,
          value: _.value.trim(),
          content: _.value.trim()
        });
      }) && I !== null && f("added", I);
    }
    return (I, y) => (n(), o("form", {
      class: "mm-form",
      onSubmit: ie(j, ["prevent"])
    }, [
      e("div", lt, [
        y[3] || (y[3] = e("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        b(t(ue), {
          modelValue: s.value,
          "onUpdate:modelValue": y[0] || (y[0] = (k) => s.value = k),
          options: l,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        e("span", nt, [
          b(t(w), {
            icon: t(q)[s.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          N(c(S.value), 1)
        ])
      ]),
      e("div", at, [
        y[4] || (y[4] = e("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        t($).ready.value ? (n(), o("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: r.value ? JSON.stringify([r.value]) : "[]",
          onChange: E
        }, null, 40, st)) : t($).failed.value ? (n(), o("div", ot, "The agent picker could not load: " + c(t($).failed.value), 1)) : h("", !0)
      ]),
      e("div", it, [
        y[5] || (y[5] = e("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        b(t(Ae), {
          id: "add_topic",
          modelValue: i.value,
          "onUpdate:modelValue": y[1] || (y[1] = (k) => i.value = k),
          placeholder: "e.g. response style",
          invalid: !!V.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        V.value ? (n(), o("span", rt, c(V.value), 1)) : (n(), o("span", ut, "What this is about, not what it says. A topic that already exists gets a new version.")),
        t(v).error.value ? (n(), o("div", dt, c(t(v).error.value), 1)) : h("", !0),
        g.value.length ? (n(), o("div", ct, [
          (n(!0), o(R, null, z(g.value, (k) => (n(), o("button", {
            key: k,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (L) => i.value = t(W)(k)
          }, c(t(W)(k)), 9, mt))), 128))
        ])) : h("", !0)
      ]),
      e("div", vt, [
        y[6] || (y[6] = e("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        b(t(ee), {
          id: "add_text",
          modelValue: _.value,
          "onUpdate:modelValue": y[2] || (y[2] = (k) => _.value = k),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      e("div", yt, [
        e("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: a.memory.busy.value || !p.value
        }, [
          b(t(w), {
            icon: a.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: D({ spin: a.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          y[7] || (y[7] = N("Add to memory ", -1))
        ], 8, bt)
      ])
    ], 32));
  }
}), pt = { class: "mm-view-head" }, kt = { class: "mm-view-title" }, ht = {
  key: 0,
  class: "kx-notice error"
}, _t = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, gt = { class: "kx-empty-ico" }, xt = ["aria-label"], $t = { class: "mm-card-h" }, wt = { class: "kx-chip" }, Ct = { class: "mm-option-main" }, St = { class: "mm-option-t" }, Tt = { class: "mm-muted" }, At = ["disabled", "onClick"], It = ["disabled"], Vt = /* @__PURE__ */ K({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(a) {
    const x = a, d = ne(() => x.memory.memoryId.value || null, (l) => P(x.memory.memoryId.value).conflicts(l), x.memory.revision);
    function f(l, s) {
      x.memory.act(() => P(x.memory.memoryId.value).resolve(l.group_id, s.id));
    }
    return (l, s) => (n(), o(R, null, [
      e("header", pt, [
        e("h2", kt, [
          b(t(w), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          s[1] || (s[1] = N("Conflicts", -1))
        ]),
        s[2] || (s[2] = e("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      t(d).error.value ? (n(), o("div", ht, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, c(t(d).error.value), 1)
      ])) : !t(d).loading.value && !t(d).rows.value.length ? (n(), o("div", _t, [
        e("span", gt, [
          b(t(w), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        s[3] || (s[3] = e("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        s[4] || (s[4] = e("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : h("", !0),
      (n(!0), o(R, null, z(t(d).rows.value, (r) => (n(), o("section", {
        key: r.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${t(W)(r.items[0].key)}`
      }, [
        e("div", $t, [
          e("span", wt, c(t(q)[r.items[0].kind].label), 1),
          N(c(t(W)(r.items[0].key)), 1)
        ]),
        (n(!0), o(R, null, z(r.items, (i) => (n(), o("div", {
          key: i.id,
          class: "mm-option"
        }, [
          e("div", Ct, [
            e("span", St, c(i.content), 1),
            e("span", Tt, c(t(H)(i.valid_at)) + " · " + c(t(De)(i.source)), 1)
          ]),
          e("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: a.memory.busy.value,
            onClick: (_) => f(r, i)
          }, [
            b(t(w), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            s[5] || (s[5] = N("Keep this ", -1))
          ], 8, At)
        ]))), 128))
      ], 8, xt))), 128)),
      t(d).next.value !== null ? (n(), o("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: t(d).loading.value,
        onClick: s[0] || (s[0] = //@ts-ignore
        (...r) => t(d).more && t(d).more(...r))
      }, "Show more conflicts", 8, It)) : h("", !0)
    ], 64));
  }
}), Nt = ["aria-label", "title", "aria-pressed", "disabled"], X = /* @__PURE__ */ K({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["click"],
  setup(a, { emit: x }) {
    const d = x;
    return (f, l) => (n(), o("button", {
      type: "button",
      class: D(["kx-iconbtn", { on: a.active }]),
      "aria-label": a.label,
      title: a.label,
      "aria-pressed": a.active === void 0 ? void 0 : a.active,
      disabled: a.disabled,
      onClick: l[0] || (l[0] = (s) => d("click"))
    }, [
      b(t(w), {
        icon: a.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, Nt));
  }
}), me = /* @__PURE__ */ K({
  __name: "AccessibleOverlay",
  props: {
    open: { type: Boolean },
    kind: {},
    dismissible: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(a, { emit: x }) {
    const d = a, f = x, l = T(null);
    let s = null;
    const r = /* @__PURE__ */ new Map();
    function i(p) {
      const v = p.getRootNode(), g = v instanceof ShadowRoot ? v.activeElement : document.activeElement;
      return g instanceof HTMLElement ? g : null;
    }
    function _(p) {
      let v = p;
      for (; v; ) {
        const g = v.parentNode;
        if (!(g instanceof HTMLElement || g instanceof ShadowRoot)) break;
        for (const E of Array.from(g.children))
          E instanceof HTMLElement && E !== v && !r.has(E) && (r.set(E, E.inert), E.inert = !0);
        v = g instanceof ShadowRoot ? g.host : g;
      }
    }
    function $() {
      for (const [p, v] of r) p.inert = v;
      r.clear();
    }
    function S() {
      return l.value ? Array.from(l.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((p) => !p.hasAttribute("disabled")) : [];
    }
    function C(p) {
      if (p.key === "Escape" && d.dismissible) {
        p.preventDefault(), f("close");
        return;
      }
      if (p.key !== "Tab") return;
      const v = S();
      if (!v.length) {
        p.preventDefault();
        return;
      }
      const g = v[0], E = l.value ? i(l.value) : null, j = v.indexOf(E || g), I = v[(j + (p.shiftKey ? -1 : 1) + v.length) % v.length];
      p.preventDefault(), I.focus();
    }
    async function V(p) {
      if (p) {
        if (await ae(), !l.value) return;
        s = i(l.value), _(l.value), (l.value.querySelector("[data-overlay-initial]") || S()[0])?.focus();
        return;
      }
      $();
      const v = s;
      s = null, await ae(), v?.focus();
    }
    return O(() => d.open, (p) => {
      V(p);
    }, { immediate: !0 }), ge(() => {
      $(), s?.focus(), s = null;
    }), (p, v) => (n(), F(xe, {
      name: a.kind === "drawer" ? "kx-drawer" : "kx-modal"
    }, {
      default: Z(() => [
        a.open ? (n(), o("div", {
          key: 0,
          ref_key: "overlay",
          ref: l,
          class: D(a.kind === "drawer" ? "kx-drawer-mask" : "kx-modal-mask"),
          onKeydown: C,
          onClick: v[0] || (v[0] = ie((g) => a.dismissible && f("close"), ["self"]))
        }, [
          le(p.$slots, "default")
        ], 34)) : h("", !0)
      ]),
      _: 3
    }, 8, ["name"]));
  }
}), Et = ["aria-label"], Rt = { class: "kx-drawer-h" }, Mt = { class: "kx-drawer-title" }, Bt = { class: "kx-drawer-b" }, Lt = /* @__PURE__ */ K({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(a, { emit: x }) {
    const d = x;
    return (f, l) => (n(), F(me, {
      open: a.open,
      kind: "drawer",
      onClose: l[1] || (l[1] = (s) => d("close"))
    }, {
      default: Z(() => [
        e("aside", {
          class: "kx-drawer",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": a.title
        }, [
          e("div", Rt, [
            e("span", Mt, [
              b(t(w), {
                icon: a.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              N(c(a.title), 1)
            ]),
            b(X, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              onClick: l[0] || (l[0] = (s) => d("close"))
            })
          ]),
          e("div", Bt, [
            le(f.$slots, "default")
          ])
        ], 8, Et)
      ]),
      _: 3
    }, 8, ["open"]));
  }
}), Ut = ["aria-label"], Dt = { class: "kx-modal-h" }, Ft = { class: "kx-modal-h-ico" }, Ot = { class: "kx-modal-h-text" }, Pt = { class: "kx-modal-h-title" }, zt = {
  key: 0,
  class: "kx-modal-h-sub"
}, Kt = { class: "kx-modal-body" }, jt = { class: "kx-modal-foot" }, Wt = ["disabled"], Ht = ["disabled"], qt = /* @__PURE__ */ K({
  __name: "ConfirmDialog",
  props: {
    open: { type: Boolean },
    title: {},
    subtitle: {},
    icon: { default: "tabler:alert-circle" },
    danger: { type: Boolean },
    busy: { type: Boolean },
    confirmLabel: { default: "Confirm" }
  },
  emits: ["confirm", "cancel"],
  setup(a, { emit: x }) {
    const d = x;
    return (f, l) => (n(), F(me, {
      open: a.open,
      kind: "dialog",
      dismissible: !a.busy,
      onClose: l[3] || (l[3] = (s) => d("cancel"))
    }, {
      default: Z(() => [
        e("div", {
          class: D(["kx-modal", { danger: a.danger }]),
          role: "alertdialog",
          "aria-modal": "true",
          "aria-label": a.title
        }, [
          e("div", Dt, [
            e("span", Ft, [
              b(t(w), {
                icon: a.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            e("span", Ot, [
              e("span", Pt, c(a.title), 1),
              a.subtitle ? (n(), o("span", zt, c(a.subtitle), 1)) : h("", !0)
            ]),
            b(X, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              disabled: a.busy,
              onClick: l[0] || (l[0] = (s) => d("cancel"))
            }, null, 8, ["disabled"])
          ]),
          e("div", Kt, [
            le(f.$slots, "default")
          ]),
          e("div", jt, [
            e("button", {
              type: "button",
              class: "kx-btn kx-btn-ghost",
              disabled: a.busy,
              onClick: l[1] || (l[1] = (s) => d("cancel"))
            }, "Cancel", 8, Wt),
            e("button", {
              type: "button",
              class: D(["kx-btn", a.danger ? "kx-btn-danger" : "kx-btn-primary"]),
              disabled: a.busy,
              onClick: l[2] || (l[2] = (s) => d("confirm"))
            }, [
              a.busy ? (n(), F(t(w), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : h("", !0),
              N(c(a.confirmLabel), 1)
            ], 10, Ht)
          ])
        ], 10, Ut)
      ]),
      _: 3
    }, 8, ["open", "dismissible"]));
  }
}), Jt = {
  key: 0,
  class: "kx-notice error"
}, Gt = {
  key: 1,
  class: "mm-skel-reader"
}, Yt = {
  key: 2,
  class: "mm-reader"
}, Zt = { class: "mm-head" }, Qt = { class: "mm-head-body" }, Xt = { class: "mm-head-top" }, el = { class: "kx-chip" }, tl = { class: "mm-topic" }, ll = { class: "mm-head-acts" }, nl = ["disabled"], al = ["disabled"], sl = ["disabled"], ol = {
  key: 0,
  class: "mm-edit"
}, il = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, rl = { class: "mm-edit-acts" }, ul = ["disabled"], dl = {
  key: 1,
  class: "mm-title"
}, cl = { class: "mm-facts" }, ml = {
  key: 0,
  class: "mm-fact"
}, vl = ["title"], yl = ["title"], bl = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-claim-value"
}, fl = {
  key: 0,
  class: "mm-value-fields"
}, pl = {
  key: 1,
  class: "mm-value"
}, kl = {
  key: 1,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, hl = { class: "mm-timeline" }, _l = { class: "mm-tl-body" }, gl = { class: "mm-tl-t" }, xl = { class: "mm-tl-s" }, $l = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, wl = {
  key: 0,
  class: "mm-muted"
}, Cl = {
  key: 1,
  class: "mm-sources"
}, Sl = { class: "mm-source-body" }, Tl = { class: "mm-source-head" }, Al = ["title"], Il = {
  key: 0,
  class: "mm-quote"
}, Vl = ["onClick"], Nl = { class: "mm-source-topic" }, El = ["onClick"], Rl = /* @__PURE__ */ K({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(a, { emit: x }) {
    const d = a, f = x, l = T(null), s = T([]), r = T(null), i = T([]), _ = T(""), $ = T(null), S = T(null), C = T(""), V = T(!1), p = M(() => l.value ? q[l.value.kind] : null), v = M(() => l.value ? q[l.value.kind].icon : "tabler:brain"), g = M(() => l.value?.status === "current" || l.value?.status === "conflict"), E = M(() => l.value?.kind === "plan" && Ve(l.value.value) ? l.value.value : null), j = M(() => l.value?.value === void 0 ? "" : JSON.stringify(l.value.value, null, 2));
    let I = 0;
    async function y(A = 0, u) {
      const m = ++I;
      try {
        const B = await P(d.memory.memoryId.value).item(d.itemId, A, u);
        if (m !== I) return;
        if (!A) {
          const J = B.item;
          if (J.status === "forgotten") {
            f("gone");
            return;
          }
          l.value = J, i.value = B.provenance;
        }
        const U = B.versions;
        s.value = A ? [...s.value, ...U.rows] : U.rows, r.value = U.next, _.value = "";
      } catch (B) {
        if (m !== I) return;
        se(B) === 404 ? f("gone") : _.value = Y(B);
      }
    }
    O(() => d.itemId, () => {
      l.value = null, s.value = [], $.value = null, S.value = null, C.value = "", V.value = !1, y();
    }, { immediate: !0 });
    async function k() {
      const A = ++I, u = s.value.length;
      try {
        let m = 0, B = null;
        const U = [];
        let J = !0;
        do {
          const ke = Math.min(100, Math.max(1, u - U.length)), G = await P(d.memory.memoryId.value).item(d.itemId, m, ke);
          if (A !== I) return;
          if (J) {
            if (G.item.status === "forgotten") {
              f("gone");
              return;
            }
            l.value = G.item, i.value = G.provenance, J = !1;
          }
          U.push(...G.versions.rows), B = G.versions.next, m = B ?? 0;
        } while (U.length < u && B !== null);
        s.value = U, r.value = B, _.value = "";
      } catch (m) {
        A === I && (se(m) === 404 ? f("gone") : _.value = Y(m));
      }
    }
    O(d.memory.revision, () => {
      k();
    });
    function L(A) {
      return d.memory.act(() => P(d.memory.memoryId.value).act(d.itemId, A));
    }
    async function ve() {
      const A = ($.value || "").trim();
      if (!A || !l.value) return;
      let u;
      if (S.value !== null)
        try {
          u = JSON.parse(S.value);
        } catch {
          C.value = "Claim value must be valid JSON.";
          return;
        }
      await d.memory.act(async () => {
        const B = S.value === null ? { content: A } : { content: A, value: u }, U = await P(d.memory.memoryId.value).edit(d.itemId, B);
        U && U !== d.itemId && f("replaced", U);
      }) && ($.value = null, S.value = null, C.value = "");
    }
    function ye() {
      l.value && ($.value = l.value.content, S.value = l.value.value === void 0 ? null : JSON.stringify(l.value.value, null, 2), C.value = "");
    }
    async function be() {
      await L("forget") && (V.value = !1, f("gone"));
    }
    function fe(A) {
      return A.host_kind === "item" ? "tabler:brain" : A.host_kind === "content" ? "tabler:file-text" : A.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function pe(A) {
      if (A.line) {
        if (A.line.role === "tool") return "Tool result";
        if (A.line.role === "document") return "Document";
        const u = A.line.author;
        return u?.kind === "user" ? "They said" : u?.kind === "system" ? "Workflow input" : u?.kind === "agent" ? l.value?.scope_family === "agent" && l.value.scope_id === u.id ? "The agent said" : `Task from ${u.id || "an agent"}` : "Message";
      }
      return A.host_kind === "item" ? A.memory ? "From the memory" : "From a memory that is no longer kept" : A.host_kind === "content" ? "A document" : A.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (A, u) => (n(), o(R, null, [
      _.value ? (n(), o("div", Jt, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, c(_.value), 1)
      ])) : l.value ? (n(), o("article", Yt, [
        e("header", Zt, [
          e("span", {
            class: D(["mm-head-ic", p.value?.tone])
          }, [
            b(t(w), {
              icon: v.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          e("div", Qt, [
            e("div", Xt, [
              e("span", el, c(p.value?.label), 1),
              e("span", tl, c(t(W)(l.value.key)), 1),
              l.value.status !== "current" ? (n(), F(t(re), {
                key: 0,
                class: "kx-tag-sm",
                severity: t(de)(l.value.status),
                value: t(te)[l.value.status]
              }, null, 8, ["severity", "value"])) : h("", !0),
              e("span", ll, [
                g.value && $.value === null ? (n(), o("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: ye
                }, [
                  b(t(w), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  u[8] || (u[8] = N("Edit ", -1))
                ])) : h("", !0),
                g.value ? (n(), o("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: a.memory.busy.value,
                  onClick: u[0] || (u[0] = (m) => L("archive"))
                }, [
                  b(t(w), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  u[9] || (u[9] = N("Archive ", -1))
                ], 8, nl)) : h("", !0),
                l.value.status === "archived" ? (n(), o("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: a.memory.busy.value,
                  onClick: u[1] || (u[1] = (m) => L("restore"))
                }, [
                  b(t(w), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  u[10] || (u[10] = N("Restore ", -1))
                ], 8, al)) : h("", !0),
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: a.memory.busy.value,
                  onClick: u[2] || (u[2] = (m) => V.value = !0)
                }, [
                  b(t(w), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  u[11] || (u[11] = N("Forget ", -1))
                ], 8, sl)
              ])
            ]),
            $.value !== null ? (n(), o("div", ol, [
              u[14] || (u[14] = e("label", {
                class: "mm-label",
                for: "memory_content"
              }, "Display text", -1)),
              b(t(ee), {
                id: "memory_content",
                modelValue: $.value,
                "onUpdate:modelValue": u[3] || (u[3] = (m) => $.value = m),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              S.value !== null ? (n(), o(R, { key: 0 }, [
                u[12] || (u[12] = e("label", {
                  class: "mm-label",
                  for: "memory_value"
                }, "Claim value", -1)),
                b(t(ee), {
                  id: "memory_value",
                  modelValue: S.value,
                  "onUpdate:modelValue": u[4] || (u[4] = (m) => S.value = m),
                  "auto-resize": "",
                  rows: "5",
                  "aria-label": "Claim value"
                }, null, 8, ["modelValue"]),
                C.value ? (n(), o("span", il, c(C.value), 1)) : h("", !0)
              ], 64)) : h("", !0),
              e("div", rl, [
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: a.memory.busy.value || !$.value.trim(),
                  onClick: ve
                }, [
                  b(t(w), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  u[13] || (u[13] = N("Save ", -1))
                ], 8, ul),
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: u[5] || (u[5] = (m) => {
                    $.value = null, S.value = null, C.value = "";
                  })
                }, "Cancel")
              ])
            ])) : (n(), o("h2", dl, c(l.value.content), 1)),
            e("div", cl, [
              l.value.scope_family === "agent" ? (n(), o("span", ml, [
                b(t(w), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                u[15] || (u[15] = N("About the agent itself", -1))
              ])) : h("", !0),
              e("span", {
                class: "mm-fact",
                title: t(Q)(l.value.valid_at)
              }, [
                b(t(w), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                N("True since " + c(t(H)(l.value.valid_at)), 1)
              ], 8, vl),
              l.value.invalid_at ? (n(), o("span", {
                key: 1,
                class: "mm-fact",
                title: t(Q)(l.value.invalid_at)
              }, [
                b(t(w), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                N("Until " + c(t(H)(l.value.invalid_at)), 1)
              ], 8, yl)) : h("", !0)
            ])
          ])
        ]),
        $.value === null && l.value.value !== void 0 ? (n(), o("section", bl, [
          u[19] || (u[19] = e("h3", {
            id: "mm-claim-value",
            class: "mm-sec-h"
          }, "Claim value", -1)),
          E.value ? (n(), o("dl", fl, [
            e("div", null, [
              u[16] || (u[16] = e("dt", null, "Details", -1)),
              e("dd", null, c(E.value.details), 1)
            ]),
            e("div", null, [
              u[17] || (u[17] = e("dt", null, "Next step", -1)),
              e("dd", null, c(E.value.next_step), 1)
            ]),
            e("div", null, [
              u[18] || (u[18] = e("dt", null, "Status", -1)),
              e("dd", null, c(E.value.status === "done" ? "Done" : E.value.status), 1)
            ])
          ])) : (n(), o("pre", pl, c(j.value), 1))
        ])) : h("", !0),
        s.value.length > 1 || r.value !== null ? (n(), o("section", kl, [
          u[21] || (u[21] = e("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          e("ol", hl, [
            (n(!0), o(R, null, z(s.value, (m) => (n(), o("li", {
              key: m.id,
              class: D({ now: m.id === l.value.id, past: m.status !== "current" })
            }, [
              u[20] || (u[20] = e("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              e("span", _l, [
                e("span", gl, c(m.content), 1),
                e("span", xl, [
                  N("v" + c(m.version) + " · " + c(t(H)(m.valid_at)), 1),
                  m.status !== "current" ? (n(), o(R, { key: 0 }, [
                    N(" · " + c(t(te)[m.status]), 1)
                  ], 64)) : h("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          r.value !== null ? (n(), o("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: u[6] || (u[6] = (m) => y(r.value))
          }, "Show older versions")) : h("", !0)
        ])) : h("", !0),
        e("section", $l, [
          u[23] || (u[23] = e("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          i.value.length ? (n(), o("ul", Cl, [
            (n(!0), o(R, null, z(i.value, (m) => (n(), o("li", {
              key: m.host_kind + m.host_id + m.event_id,
              class: "mm-source"
            }, [
              b(t(w), {
                class: "mm-source-ic",
                icon: fe(m),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              e("div", Sl, [
                e("div", Tl, [
                  e("span", null, c(pe(m)), 1),
                  m.line?.created_at || m.recorded_at ? (n(), o("span", {
                    key: 0,
                    class: "mm-muted",
                    title: t(Q)(m.line?.created_at || m.recorded_at || "")
                  }, c(t(H)(m.line?.created_at || m.recorded_at || "")), 9, Al)) : h("", !0)
                ]),
                m.line ? (n(), o("blockquote", Il, c(m.line.text), 1)) : h("", !0),
                m.memory ? (n(), o("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (B) => f("open", m.memory.id)
                }, [
                  e("span", Nl, c(t(W)(m.memory.key)), 1),
                  e("span", null, c(m.memory.content), 1)
                ], 8, Vl)) : h("", !0),
                m.host_kind === "session" ? (n(), o("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (B) => f("conversation", m.host_id)
                }, [
                  b(t(w), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  u[22] || (u[22] = N("Open conversation ", -1))
                ], 8, El)) : h("", !0)
              ])
            ]))), 128))
          ])) : (n(), o("p", wl, c(l.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (n(), o("div", Gt, [
        (n(), o(R, null, z(4, (m) => e("div", {
          key: m,
          class: "mm-skel-line"
        })), 64))
      ])),
      b(qt, {
        open: V.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: l.value ? t(W)(l.value.key) : "",
        "confirm-label": "Forget for good",
        busy: a.memory.busy.value,
        onCancel: u[7] || (u[7] = (m) => V.value = !1),
        onConfirm: be
      }, {
        default: Z(() => [...u[24] || (u[24] = [
          N(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), Ml = { class: "mm-rail-tools" }, Bl = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, Ll = {
  key: 0,
  class: "mm-skel"
}, Ul = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Dl = {
  key: 2,
  class: "mm-rail-empty"
}, Fl = ["aria-expanded", "onClick"], Ol = { class: "kx-railsec-t" }, Pl = { class: "kx-railsec-b" }, zl = ["aria-current", "onClick"], Kl = { class: "mm-row-main" }, jl = { class: "mm-row-t" }, Wl = { class: "mm-row-s" }, Hl = ["disabled"], ql = /* @__PURE__ */ K({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(a, { emit: x }) {
    const d = a, f = x, l = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], s = T("current"), r = T(""), i = Re(r, 250, (V) => V.trim()), _ = ne(() => d.memory.memoryId.value ? [d.memory.memoryId.value, s.value, i.value] : null, (V) => P(d.memory.memoryId.value).items({ status: s.value, query: i.value, offset: V }), d.memory.revision);
    O([s, i], () => {
      f("filtered"), f("status-change", s.value);
    });
    const $ = T({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), S = M(() => Le.map((V) => ({ ...V, items: _.rows.value.filter((p) => q[p.kind].group === V.id) })).filter((V) => V.items.length)), C = M(() => i.value ? "No memories match this search." : s.value === "superseded" ? "No earlier versions yet." : s.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (V, p) => (n(), o(R, null, [
      e("div", Ml, [
        b(Me, {
          modelValue: r.value,
          "onUpdate:modelValue": p[0] || (p[0] = (v) => r.value = v),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        b(t(ue), {
          modelValue: s.value,
          "onUpdate:modelValue": p[1] || (p[1] = (v) => s.value = v),
          class: "mm-views",
          options: l,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      e("nav", Bl, [
        t(_).loading.value && !t(_).rows.value.length ? (n(), o("div", Ll, [
          (n(), o(R, null, z(6, (v) => e("div", {
            key: v,
            class: "mm-skel-row"
          })), 64))
        ])) : t(_).error.value ? (n(), o("div", Ul, [
          b(t(w), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          e("span", null, c(t(_).error.value), 1)
        ])) : t(_).rows.value.length ? h("", !0) : (n(), o("div", Dl, c(C.value), 1)),
        (n(!0), o(R, null, z(S.value, (v) => (n(), o("div", {
          key: v.id,
          class: D(["kx-railsec", { closed: $.value[v.id] }])
        }, [
          e("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !$.value[v.id],
            onClick: (g) => $.value[v.id] = !$.value[v.id]
          }, [
            b(t(w), {
              class: "kx-railsec-chev",
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            }),
            b(t(w), {
              class: "kx-railsec-ic",
              icon: v.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            e("span", Ol, c(v.title), 1)
          ], 8, Fl),
          $e(e("div", Pl, [
            (n(!0), o(R, null, z(v.items, (g) => (n(), o("button", {
              key: g.id,
              type: "button",
              class: D(["mm-row", { on: a.selectedId === g.id }]),
              "aria-current": a.selectedId === g.id ? "true" : void 0,
              onClick: (E) => f("select", g)
            }, [
              e("span", {
                class: D(["mm-row-ic", t(q)[g.kind].tone])
              }, [
                b(t(w), {
                  icon: t(q)[g.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              e("span", Kl, [
                e("span", jl, c(g.content), 1),
                e("span", Wl, c(t(W)(g.key)) + " · " + c(t(H)(g.valid_at)), 1)
              ])
            ], 10, zl))), 128))
          ], 512), [
            [we, !$.value[v.id]]
          ])
        ], 2))), 128)),
        t(_).next.value !== null ? (n(), o("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: t(_).loading.value,
          onClick: p[2] || (p[2] = //@ts-ignore
          (...v) => t(_).more && t(_).more(...v))
        }, [
          t(_).loading.value ? (n(), F(t(w), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : h("", !0),
          p[3] || (p[3] = N("Show more ", -1))
        ], 8, Hl)) : h("", !0)
      ])
    ], 64));
  }
}), Jl = {
  key: 0,
  class: "kx-notice error"
}, Gl = {
  key: 1,
  class: "mm-page"
}, Yl = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Zl = { class: "kx-shell" }, Ql = { class: "kx-rail" }, Xl = { class: "kx-railhead" }, en = { class: "kx-railhead-title" }, tn = { key: 0 }, ln = { class: "kx-railhead-acts" }, nn = { class: "kx-main" }, an = { class: "kx-main-scroll mm-main" }, sn = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, on = { class: "kx-empty-ico" }, rn = /* @__PURE__ */ K({
  __name: "MemoryManage",
  setup(a) {
    const x = Se(), d = Te(), f = T(""), l = T({});
    O(() => x.value.config, (y) => {
      try {
        l.value = Ne(y), f.value = "";
      } catch (k) {
        f.value = Y(k);
      }
    }, { immediate: !0 });
    const s = tt(M(() => String(l.value.kb_id || ""))), r = T("item"), i = T(String(l.value.route || "")), _ = T(!1), $ = T("current"), S = M(() => s.status.value?.counts[$.value]), C = M(() => s.status.value?.counts.conflict_groups || 0), V = M(() => (s.status.value?.runs || []).filter((y) => y.status === "failed").length);
    O(() => l.value.route, (y) => {
      const k = typeof y == "string" ? y : "";
      k !== i.value && (p = !0, i.value = k, k && (r.value = "item"));
    }), O(s.memoryId, () => {
      i.value = "", r.value = "item";
    });
    let p = !1;
    O(i, (y) => {
      if (p) {
        p = !1;
        return;
      }
      d("navigate", y || "");
    });
    function v(y) {
      d("kickside-chat-open", { kind: "session", sessionId: y });
    }
    function g(y) {
      r.value = "item", y !== i.value && (i.value = y);
    }
    function E(y) {
      g(y.id);
    }
    function j(y) {
      r.value = r.value === y ? "item" : y;
    }
    function I(y) {
      _.value = !1, y && g(y);
    }
    return (y, k) => f.value ? (n(), o("div", Jl, c(f.value), 1)) : (n(), o("div", Gl, [
      t(s).error.value ? (n(), o("div", Yl, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, c(t(s).error.value), 1)
      ])) : h("", !0),
      e("div", Zl, [
        e("aside", Ql, [
          e("div", Xl, [
            e("span", en, [
              k[7] || (k[7] = N("Memories", -1)),
              S.value !== void 0 ? (n(), o("b", tn, c(S.value), 1)) : h("", !0)
            ]),
            e("div", ln, [
              b(X, {
                icon: "tabler:activity",
                label: V.value ? `Activity, ${V.value} failed` : "Activity",
                active: r.value === "activity",
                onClick: k[0] || (k[0] = (L) => j("activity"))
              }, null, 8, ["label", "active"]),
              b(X, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: k[1] || (k[1] = (L) => _.value = !0)
              })
            ])
          ]),
          C.value ? (n(), o("button", {
            key: 0,
            type: "button",
            class: D(["mm-conflict-bar", { on: r.value === "conflicts" }]),
            onClick: k[2] || (k[2] = (L) => j("conflicts"))
          }, [
            b(t(w), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            e("span", null, c(C.value === 1 ? "1 conflict to resolve" : `${C.value} conflicts to resolve`), 1),
            b(t(w), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : h("", !0),
          b(ql, {
            memory: t(s),
            "selected-id": r.value === "item" ? i.value : "",
            onSelect: E,
            onFiltered: k[3] || (k[3] = (L) => i.value = ""),
            onStatusChange: k[4] || (k[4] = (L) => $.value = L)
          }, null, 8, ["memory", "selected-id"])
        ]),
        e("main", nn, [
          e("div", an, [
            r.value === "conflicts" ? (n(), F(Vt, {
              key: 0,
              memory: t(s)
            }, null, 8, ["memory"])) : r.value === "activity" ? (n(), F(Xe, {
              key: 1,
              memory: t(s)
            }, null, 8, ["memory"])) : i.value ? (n(), F(Rl, {
              key: i.value,
              memory: t(s),
              "item-id": i.value,
              onReplaced: g,
              onOpen: g,
              onConversation: v,
              onGone: k[5] || (k[5] = (L) => i.value = "")
            }, null, 8, ["memory", "item-id"])) : (n(), o("div", sn, [
              e("span", on, [
                b(t(w), {
                  icon: "tabler:brain",
                  "aria-hidden": "true"
                })
              ]),
              k[8] || (k[8] = e("p", { class: "kx-empty-title" }, "Select a memory", -1)),
              k[9] || (k[9] = e("p", { class: "kx-empty-sub" }, "Pick one from the list to see what it says, how it changed and where it was learned.", -1))
            ]))
          ])
        ])
      ]),
      b(Lt, {
        open: _.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: k[6] || (k[6] = (L) => _.value = !1)
      }, {
        default: Z(() => [
          _.value ? (n(), F(ft, {
            key: 0,
            memory: t(s),
            onAdded: I
          }, null, 8, ["memory"])) : h("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), gn = {
  rootComponent: rn,
  plugins: [he]
};
export {
  gn as mountConfig
};
//# sourceMappingURL=lazy-mount-B00vUwY3.js.map
