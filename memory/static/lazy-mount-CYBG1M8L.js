import { P as ke } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as W, computed as R, openBlock as l, createElementBlock as a, Fragment as M, createElementVNode as e, createVNode as b, unref as t, createTextVNode as V, renderList as F, normalizeClass as B, toDisplayString as m, createCommentVNode as $, createBlock as P, ref as A, watch as j, onUnmounted as he, withModifiers as ie, onBeforeUnmount as _e, Transition as ge, withCtx as Z, renderSlot as ne, nextTick as se, withDirectives as xe, vShow as $e } from "vue";
import { Icon as w } from "@iconify/vue";
import { b as we, a as Ce, u as Se } from "./wc-runtime-KO3cNuNo.js";
import re from "primevue/tag";
import Ae from "primevue/inputtext";
import ue from "primevue/selectbutton";
import ee from "primevue/textarea";
import { e as Y, b as Te, p as Ie } from "./types-DQ01_s6c.js";
import { on as Ve } from "@wippy-fe/proxy";
import { m as z, a as le, h as oe, u as Ne, _ as Ee } from "./usePaged-DWrKufE-.js";
import { u as Me } from "./useWidget-OxU0xAVl.js";
const q = {
  identity: { label: "Identity", icon: "tabler:id-badge-2", group: "instructions" },
  rule: { label: "Rule", icon: "tabler:list-check", group: "instructions" },
  skill: { label: "Skill", icon: "tabler:tool", group: "knowhow", tone: "kx-tone-violet" },
  lesson: { label: "Lesson", icon: "tabler:bulb", group: "knowhow", tone: "kx-tone-violet" },
  plan: { label: "Plan", icon: "tabler:route", group: "plans", tone: "kx-tone-amber" },
  profile_slot: { label: "Profile", icon: "tabler:user", group: "people", tone: "kx-tone-blue" },
  preference: { label: "Preference", icon: "tabler:heart", group: "people", tone: "kx-tone-blue" },
  fact: { label: "Fact", icon: "tabler:note", group: "people", tone: "kx-tone-blue" }
}, Re = [
  { id: "instructions", title: "Agent instructions", icon: "tabler:robot" },
  { id: "knowhow", title: "Skills and lessons", icon: "tabler:school", tone: "kx-tone-violet" },
  { id: "plans", title: "Ongoing plans", icon: "tabler:route", tone: "kx-tone-amber" },
  { id: "people", title: "About people", icon: "tabler:users", tone: "kx-tone-blue" }
];
function K(s) {
  const g = s.replace(/[_\-.]+/g, " ").trim();
  return g ? g.charAt(0).toUpperCase() + g.slice(1) : s;
}
function De(s, g) {
  if (s === void 0) return [];
  const u = [];
  function f(n, o) {
    if (n !== null && typeof n == "object") {
      const r = Array.isArray(n) ? n.map((h, _) => [String(_ + 1), h]) : Object.entries(n);
      if (r.length) {
        for (const [h, _] of r) f(_, [...o, K(h)]);
        return;
      }
    }
    const i = n === null ? "Not set" : typeof n == "object" ? "None" : typeof n == "boolean" ? n ? "Yes" : "No" : String(n);
    u.push({ label: o.length ? o.join(" · ") : K(g), text: i });
  }
  return f(s, []), u;
}
const Le = {
  capture: "learned in conversation",
  reflection: "from consolidation",
  owner: "added by a person"
};
function Ue(s) {
  return Le[s];
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
}, Be = { current: "success", conflict: "warn", failed: "danger", archived: "secondary" };
function de(s) {
  return Be[s] ?? "secondary";
}
function ce(s) {
  return s ? Date.parse(s.includes("T") ? s : s.replace(" ", "T") + "Z") : NaN;
}
function Q(s) {
  const g = ce(s);
  return Number.isFinite(g) ? new Date(g).toLocaleString() : "";
}
const Fe = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function H(s, g = Date.now()) {
  const u = ce(s);
  if (!Number.isFinite(u)) return "";
  const f = Math.round((u - g) / 1e3), n = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  for (const [o, i] of Fe)
    if (Math.abs(f) >= i) return n.format(Math.round(f / i), o);
  return "just now";
}
const Pe = { class: "mm-view-head" }, Oe = { class: "mm-view-title" }, je = {
  key: 0,
  class: "kx-empty kx-empty-spacious"
}, ze = { class: "kx-empty-ico" }, Ke = {
  key: 1,
  class: "mm-runs"
}, We = { class: "mm-run-main" }, He = { class: "mm-run-t" }, qe = ["title"], Je = {
  key: 0,
  class: "mm-run-err"
}, Ge = /* @__PURE__ */ W({
  __name: "ActivityView",
  props: {
    memory: {}
  },
  setup(s) {
    const g = s, u = R(() => g.memory.status.value?.runs || []);
    function f(o) {
      return o.run_type === "consolidate" ? "Consolidation" : o.run_type === "reembed" ? "Re-embedding" : o.host_kind === "content" ? "Learned from a document" : "Learned from a conversation";
    }
    function n(o) {
      const i = o.stats || {}, r = [
        i.added ? `${i.added} new` : "",
        i.superseded ? `${i.superseded} updated` : "",
        i.conflicted ? `${i.conflicted} contested` : "",
        i.rejected ? `${i.rejected} rejected` : ""
      ].filter(Boolean);
      return r.length ? r.join(" · ") : o.status === "succeeded" ? "No changes" : "";
    }
    return (o, i) => (l(), a(M, null, [
      e("header", Pe, [
        e("h2", Oe, [
          b(t(w), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          }),
          i[0] || (i[0] = V("Activity", -1))
        ]),
        i[1] || (i[1] = e("p", { class: "mm-muted" }, "The latest work on this memory: conversations captured, consolidation and re-embedding.", -1))
      ]),
      u.value.length ? (l(), a("ol", Ke, [
        (l(!0), a(M, null, F(u.value, (r) => (l(), a("li", {
          key: r.id,
          class: B(["mm-run", r.status])
        }, [
          e("div", We, [
            e("span", He, m(f(r)), 1),
            e("span", {
              class: "mm-muted",
              title: t(Q)(r.finished_at || r.started_at || r.created_at)
            }, [
              V(m(t(H)(r.finished_at || r.started_at || r.created_at)), 1),
              n(r) ? (l(), a(M, { key: 0 }, [
                V(" · " + m(n(r)), 1)
              ], 64)) : $("", !0)
            ], 8, qe),
            r.last_error ? (l(), a("span", Je, m(r.last_error), 1)) : $("", !0)
          ]),
          r.status !== "succeeded" ? (l(), P(t(re), {
            key: 0,
            class: "kx-tag-sm",
            severity: t(de)(r.status),
            value: t(te)[r.status]
          }, null, 8, ["severity", "value"])) : $("", !0)
        ], 2))), 128))
      ])) : (l(), a("div", je, [
        e("span", ze, [
          b(t(w), {
            icon: "tabler:activity",
            "aria-hidden": "true"
          })
        ]),
        i[2] || (i[2] = e("p", { class: "kx-empty-title" }, "Nothing captured yet", -1)),
        i[3] || (i[3] = e("p", { class: "kx-empty-sub" }, "Each time an agent captures a conversation or consolidates, it shows here.", -1))
      ]))
    ], 64));
  }
});
function Ye(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function ae(s) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(s);
}
function Ze(s) {
  const g = R(() => `/api/v1/memory/${encodeURIComponent(s.value)}`), u = A(null), f = A(""), n = A(!1), o = A(0);
  let i = 0;
  async function r() {
    const S = ++i;
    if (!s.value) return !1;
    try {
      const C = await z(s.value).status();
      return S !== i ? !1 : (u.value = C, f.value = "", o.value++, !0);
    } catch (C) {
      return S === i && (f.value = Y(C)), !1;
    }
  }
  async function h(S) {
    n.value = !0, f.value = "";
    try {
      return await S(), await r();
    } catch (C) {
      return f.value = Y(C), !1;
    } finally {
      n.value = !1;
    }
  }
  let _ = null;
  return j(s, (S) => {
    if (_ && _(), _ = null, i++, u.value = null, f.value = "", !S) return;
    const C = Ve(`component.${S}`, () => {
      r();
    });
    _ = typeof C == "function" ? C : null, r();
  }, { immediate: !0 }), he(() => {
    _ && _();
  }), we(async () => {
    await r();
  }), { memoryId: s, base: g, status: u, error: f, busy: n, revision: o, act: h };
}
const Qe = { class: "mm-field" }, Xe = { class: "mm-hint" }, et = { class: "mm-field" }, tt = ["selected"], nt = {
  key: 1,
  class: "kx-notice error"
}, lt = {
  key: 2,
  class: "mm-picker-pending mm-picker-pending--list",
  "aria-hidden": "true"
}, st = { class: "mm-field" }, ot = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, at = {
  key: 1,
  class: "mm-hint"
}, it = {
  key: 2,
  class: "kx-notice error"
}, rt = {
  key: 3,
  class: "mm-suggest",
  "aria-label": "Topics in use"
}, ut = ["onClick"], dt = { class: "mm-field" }, ct = { class: "mm-form-foot" }, mt = ["disabled"], vt = /* @__PURE__ */ W({
  __name: "AddMemory",
  props: {
    memory: {}
  },
  emits: ["added"],
  setup(s, { emit: g }) {
    const u = s, f = g, n = [
      { value: "identity", label: "Identity", hint: "Who the agent is: its name, role and voice. Part of every conversation." },
      { value: "rule", label: "Rule", hint: "How the agent must behave. Part of every conversation." },
      { value: "skill", label: "Skill", hint: "Something the agent knows how to do. Recalled when relevant." },
      { value: "lesson", label: "Lesson", hint: "Experience worth reusing. Recalled when relevant." }
    ], o = A("rule"), i = A(""), r = A(""), h = A(""), _ = Me("wc-agent-picker"), S = R(() => n.find((N) => N.value === o.value)?.hint || ""), C = R(() => Ye(r.value)), I = R(() => r.value && !ae(C.value) ? "Use a short topic of letters, digits and spaces." : ""), p = R(() => !!i.value && ae(C.value) && !!h.value.trim()), v = le(
      () => u.memory.memoryId.value ? [u.memory.memoryId.value, o.value] : null,
      (N) => z(u.memory.memoryId.value).topics({ kind: o.value, offset: N }),
      u.memory.revision
    ), x = R(() => v.rows.value.map((N) => N.key).filter((N) => N !== C.value).slice(0, 8));
    j(o, () => {
      r.value = "";
    });
    function D(N) {
      const y = Te(N).selected;
      i.value = String((Array.isArray(y) ? y : [])[0] || "");
    }
    async function L() {
      if (!p.value) return;
      let N = null;
      await u.memory.act(async () => {
        N = await z(u.memory.memoryId.value).create({
          kind: o.value,
          scope_family: "agent",
          scope_id: i.value,
          key: C.value,
          value: h.value.trim(),
          content: h.value.trim()
        });
      }) && N !== null && f("added", N);
    }
    return (N, y) => (l(), a("form", {
      class: "mm-form",
      onSubmit: ie(L, ["prevent"])
    }, [
      e("div", Qe, [
        y[3] || (y[3] = e("span", {
          id: "add_kind",
          class: "mm-label"
        }, "What to add", -1)),
        b(t(ue), {
          modelValue: o.value,
          "onUpdate:modelValue": y[0] || (y[0] = (k) => o.value = k),
          options: n,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          "aria-labelledby": "add_kind"
        }, null, 8, ["modelValue"]),
        e("span", Xe, [
          b(t(w), {
            icon: t(q)[o.value].icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          V(m(S.value), 1)
        ])
      ]),
      e("div", et, [
        y[4] || (y[4] = e("span", {
          id: "add_agent",
          class: "mm-label"
        }, "Agent", -1)),
        t(_).ready.value ? (l(), a("wc-agent-picker", {
          key: 0,
          "aria-labelledby": "add_agent",
          multi: "false",
          placeholder: "Pick the agent",
          selected: i.value ? JSON.stringify([i.value]) : "[]",
          onChange: D
        }, null, 40, tt)) : t(_).failed.value ? (l(), a("div", nt, "The agent picker could not load: " + m(t(_).failed.value), 1)) : (l(), a("div", lt))
      ]),
      e("div", st, [
        y[5] || (y[5] = e("label", {
          class: "mm-label",
          for: "add_topic"
        }, "Topic", -1)),
        b(t(Ae), {
          id: "add_topic",
          modelValue: r.value,
          "onUpdate:modelValue": y[1] || (y[1] = (k) => r.value = k),
          placeholder: "e.g. response style",
          invalid: !!I.value,
          autocomplete: "off"
        }, null, 8, ["modelValue", "invalid"]),
        I.value ? (l(), a("span", ot, m(I.value), 1)) : (l(), a("span", at, "What this is about, not what it says. A topic that already exists gets a new version.")),
        t(v).error.value ? (l(), a("div", it, m(t(v).error.value), 1)) : $("", !0),
        x.value.length ? (l(), a("div", rt, [
          (l(!0), a(M, null, F(x.value, (k) => (l(), a("button", {
            key: k,
            type: "button",
            class: "mm-suggest-chip",
            onClick: (O) => r.value = t(K)(k)
          }, m(t(K)(k)), 9, ut))), 128))
        ])) : $("", !0)
      ]),
      e("div", dt, [
        y[6] || (y[6] = e("label", {
          class: "mm-label",
          for: "add_text"
        }, "Text", -1)),
        b(t(ee), {
          id: "add_text",
          modelValue: h.value,
          "onUpdate:modelValue": y[2] || (y[2] = (k) => h.value = k),
          "auto-resize": "",
          rows: "3",
          placeholder: "e.g. Answer in short bullet points."
        }, null, 8, ["modelValue"])
      ]),
      e("div", ct, [
        e("button", {
          type: "submit",
          class: "kx-btn kx-btn-primary",
          disabled: s.memory.busy.value || !p.value
        }, [
          b(t(w), {
            icon: s.memory.busy.value ? "tabler:loader-2" : "tabler:plus",
            class: B({ spin: s.memory.busy.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          y[7] || (y[7] = V("Add to memory ", -1))
        ], 8, mt)
      ])
    ], 32));
  }
}), yt = { class: "mm-view-head" }, bt = { class: "mm-view-title" }, ft = {
  key: 0,
  class: "kx-notice error"
}, pt = {
  key: 1,
  class: "kx-empty kx-empty-spacious"
}, kt = { class: "kx-empty-ico" }, ht = ["aria-label"], _t = { class: "mm-card-h" }, gt = { class: "kx-chip" }, xt = { class: "mm-option-main" }, $t = { class: "mm-option-t" }, wt = { class: "mm-muted" }, Ct = ["disabled", "onClick"], St = ["disabled"], At = /* @__PURE__ */ W({
  __name: "ConflictView",
  props: {
    memory: {}
  },
  setup(s) {
    const g = s, u = le(() => g.memory.memoryId.value || null, (n) => z(g.memory.memoryId.value).conflicts(n), g.memory.revision);
    function f(n, o) {
      g.memory.act(() => z(g.memory.memoryId.value).resolve(n.group_id, o.id));
    }
    return (n, o) => (l(), a(M, null, [
      e("header", yt, [
        e("h2", bt, [
          b(t(w), {
            icon: "tabler:arrows-split-2",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = V("Conflicts", -1))
        ]),
        o[2] || (o[2] = e("p", { class: "mm-muted" }, "These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.", -1))
      ]),
      t(u).error.value ? (l(), a("div", ft, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, m(t(u).error.value), 1)
      ])) : !t(u).loading.value && !t(u).rows.value.length ? (l(), a("div", pt, [
        e("span", kt, [
          b(t(w), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = e("p", { class: "kx-empty-title" }, "No conflicts", -1)),
        o[4] || (o[4] = e("p", { class: "kx-empty-sub" }, "When two memories contradict each other they wait here for you to keep the right one.", -1))
      ])) : $("", !0),
      (l(!0), a(M, null, F(t(u).rows.value, (i) => (l(), a("section", {
        key: i.group_id,
        class: "mm-card",
        "aria-label": `Conflict about ${t(K)(i.items[0].key)}`
      }, [
        e("div", _t, [
          e("span", gt, m(t(q)[i.items[0].kind].label), 1),
          V(m(t(K)(i.items[0].key)), 1)
        ]),
        (l(!0), a(M, null, F(i.items, (r) => (l(), a("div", {
          key: r.id,
          class: "mm-option"
        }, [
          e("div", xt, [
            e("span", $t, m(r.content), 1),
            e("span", wt, m(t(H)(r.valid_at)) + " · " + m(t(Ue)(r.source)), 1)
          ]),
          e("button", {
            type: "button",
            class: "kx-btn kx-btn-soft sm",
            disabled: s.memory.busy.value,
            onClick: (h) => f(i, r)
          }, [
            b(t(w), {
              icon: "tabler:check",
              "aria-hidden": "true"
            }),
            o[5] || (o[5] = V("Keep this ", -1))
          ], 8, Ct)
        ]))), 128))
      ], 8, ht))), 128)),
      t(u).next.value !== null ? (l(), a("button", {
        key: 2,
        type: "button",
        class: "kx-btn kx-btn-ghost sm mm-more",
        disabled: t(u).loading.value,
        onClick: o[0] || (o[0] = //@ts-ignore
        (...i) => t(u).more && t(u).more(...i))
      }, "Show more conflicts", 8, St)) : $("", !0)
    ], 64));
  }
}), Tt = ["aria-label", "title", "aria-pressed", "disabled"], X = /* @__PURE__ */ W({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["click"],
  setup(s, { emit: g }) {
    const u = g;
    return (f, n) => (l(), a("button", {
      type: "button",
      class: B(["kx-iconbtn", { on: s.active }]),
      "aria-label": s.label,
      title: s.label,
      "aria-pressed": s.active === void 0 ? void 0 : s.active,
      disabled: s.disabled,
      onClick: n[0] || (n[0] = (o) => u("click"))
    }, [
      b(t(w), {
        icon: s.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 10, Tt));
  }
}), me = /* @__PURE__ */ W({
  __name: "AccessibleOverlay",
  props: {
    open: { type: Boolean },
    kind: {},
    dismissible: { type: Boolean, default: !0 }
  },
  emits: ["close"],
  setup(s, { emit: g }) {
    const u = s, f = g, n = A(null);
    let o = null;
    const i = /* @__PURE__ */ new Map();
    function r(p) {
      const v = p.getRootNode(), x = v instanceof ShadowRoot ? v.activeElement : document.activeElement;
      return x instanceof HTMLElement ? x : null;
    }
    function h(p) {
      let v = p;
      for (; v; ) {
        const x = v.parentNode;
        if (!(x instanceof HTMLElement || x instanceof ShadowRoot)) break;
        for (const D of Array.from(x.children))
          D instanceof HTMLElement && D !== v && !i.has(D) && (i.set(D, D.inert), D.inert = !0);
        v = x instanceof ShadowRoot ? x.host : x;
      }
    }
    function _() {
      for (const [p, v] of i) p.inert = v;
      i.clear();
    }
    function S() {
      return n.value ? Array.from(n.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((p) => !p.hasAttribute("disabled")) : [];
    }
    function C(p) {
      if (p.key === "Escape" && u.dismissible) {
        p.preventDefault(), f("close");
        return;
      }
      if (p.key !== "Tab") return;
      const v = S();
      if (!v.length) {
        p.preventDefault();
        return;
      }
      const x = v[0], D = n.value ? r(n.value) : null, L = v.indexOf(D || x), N = v[(L + (p.shiftKey ? -1 : 1) + v.length) % v.length];
      p.preventDefault(), N.focus();
    }
    async function I(p) {
      if (p) {
        if (await se(), !n.value) return;
        o = r(n.value), h(n.value), (n.value.querySelector("[data-overlay-initial]") || S()[0])?.focus();
        return;
      }
      _();
      const v = o;
      o = null, await se(), v?.focus();
    }
    return j(() => u.open, (p) => {
      I(p);
    }, { immediate: !0 }), _e(() => {
      _(), o?.focus(), o = null;
    }), (p, v) => (l(), P(ge, {
      name: s.kind === "drawer" ? "kx-drawer" : "kx-modal"
    }, {
      default: Z(() => [
        s.open ? (l(), a("div", {
          key: 0,
          ref_key: "overlay",
          ref: n,
          class: B(s.kind === "drawer" ? "kx-drawer-mask" : "kx-modal-mask"),
          onKeydown: C,
          onClick: v[0] || (v[0] = ie((x) => s.dismissible && f("close"), ["self"]))
        }, [
          ne(p.$slots, "default")
        ], 34)) : $("", !0)
      ]),
      _: 3
    }, 8, ["name"]));
  }
}), It = ["aria-label"], Vt = { class: "kx-drawer-h" }, Nt = { class: "kx-drawer-title" }, Et = { class: "kx-drawer-b" }, Mt = /* @__PURE__ */ W({
  __name: "SideDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {}
  },
  emits: ["close"],
  setup(s, { emit: g }) {
    const u = g;
    return (f, n) => (l(), P(me, {
      open: s.open,
      kind: "drawer",
      onClose: n[1] || (n[1] = (o) => u("close"))
    }, {
      default: Z(() => [
        e("aside", {
          class: "kx-drawer",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": s.title
        }, [
          e("div", Vt, [
            e("span", Nt, [
              b(t(w), {
                icon: s.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              V(m(s.title), 1)
            ]),
            b(X, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              onClick: n[0] || (n[0] = (o) => u("close"))
            })
          ]),
          e("div", Et, [
            ne(f.$slots, "default")
          ])
        ], 8, It)
      ]),
      _: 3
    }, 8, ["open"]));
  }
}), Rt = ["aria-label"], Dt = { class: "kx-modal-h" }, Lt = { class: "kx-modal-h-ico" }, Ut = { class: "kx-modal-h-text" }, Bt = { class: "kx-modal-h-title" }, Ft = {
  key: 0,
  class: "kx-modal-h-sub"
}, Pt = { class: "kx-modal-body" }, Ot = { class: "kx-modal-foot" }, jt = ["disabled"], zt = ["disabled"], Kt = /* @__PURE__ */ W({
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
  setup(s, { emit: g }) {
    const u = g;
    return (f, n) => (l(), P(me, {
      open: s.open,
      kind: "dialog",
      dismissible: !s.busy,
      onClose: n[3] || (n[3] = (o) => u("cancel"))
    }, {
      default: Z(() => [
        e("div", {
          class: B(["kx-modal", { danger: s.danger }]),
          role: "alertdialog",
          "aria-modal": "true",
          "aria-label": s.title
        }, [
          e("div", Dt, [
            e("span", Lt, [
              b(t(w), {
                icon: s.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            e("span", Ut, [
              e("span", Bt, m(s.title), 1),
              s.subtitle ? (l(), a("span", Ft, m(s.subtitle), 1)) : $("", !0)
            ]),
            b(X, {
              "data-overlay-initial": "",
              icon: "tabler:x",
              label: "Close",
              disabled: s.busy,
              onClick: n[0] || (n[0] = (o) => u("cancel"))
            }, null, 8, ["disabled"])
          ]),
          e("div", Pt, [
            ne(f.$slots, "default")
          ]),
          e("div", Ot, [
            e("button", {
              type: "button",
              class: "kx-btn kx-btn-ghost",
              disabled: s.busy,
              onClick: n[1] || (n[1] = (o) => u("cancel"))
            }, "Cancel", 8, jt),
            e("button", {
              type: "button",
              class: B(["kx-btn", s.danger ? "kx-btn-danger" : "kx-btn-primary"]),
              disabled: s.busy,
              onClick: n[2] || (n[2] = (o) => u("confirm"))
            }, [
              s.busy ? (l(), P(t(w), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : $("", !0),
              V(m(s.confirmLabel), 1)
            ], 10, zt)
          ])
        ], 10, Rt)
      ]),
      _: 3
    }, 8, ["open", "dismissible"]));
  }
}), Wt = {
  key: 0,
  class: "kx-notice error"
}, Ht = {
  key: 1,
  class: "mm-skel-reader"
}, qt = {
  key: 2,
  class: "mm-reader"
}, Jt = { class: "mm-head" }, Gt = { class: "mm-head-body" }, Yt = { class: "mm-head-top" }, Zt = { class: "kx-chip" }, Qt = { class: "mm-topic" }, Xt = { class: "mm-head-acts" }, en = ["disabled"], tn = ["disabled"], nn = ["disabled"], ln = {
  key: 0,
  class: "mm-edit"
}, sn = {
  key: 0,
  class: "mm-hint mm-hint-err"
}, on = { class: "mm-edit-acts" }, an = ["disabled"], rn = {
  key: 1,
  class: "mm-title"
}, un = { class: "mm-facts" }, dn = {
  key: 0,
  class: "mm-fact"
}, cn = ["title"], mn = ["title"], vn = {
  key: 0,
  class: "mm-sec",
  "aria-labelledby": "mm-details"
}, yn = { class: "mm-value-fields" }, bn = {
  key: 1,
  class: "mm-sec",
  "aria-labelledby": "mm-history"
}, fn = { class: "mm-timeline" }, pn = { class: "mm-tl-body" }, kn = { class: "mm-tl-t" }, hn = { class: "mm-tl-s" }, _n = {
  class: "mm-sec",
  "aria-labelledby": "mm-sources"
}, gn = {
  key: 0,
  class: "mm-muted"
}, xn = {
  key: 1,
  class: "mm-sources"
}, $n = { class: "mm-source-body" }, wn = { class: "mm-source-head" }, Cn = ["title"], Sn = {
  key: 0,
  class: "mm-quote"
}, An = ["onClick"], Tn = { class: "mm-source-topic" }, In = ["onClick"], Vn = /* @__PURE__ */ W({
  __name: "MemoryDetail",
  props: {
    memory: {},
    itemId: {}
  },
  emits: ["replaced", "gone", "open", "conversation"],
  setup(s, { emit: g }) {
    const u = s, f = g, n = A(null), o = A([]), i = A(null), r = A([]), h = A(""), _ = A(null), S = A(null), C = A(""), I = A(!1), p = R(() => n.value ? q[n.value.kind] : null), v = R(() => n.value ? q[n.value.kind].icon : "tabler:brain"), x = R(() => n.value?.status === "current" || n.value?.status === "conflict"), D = R(() => n.value ? De(n.value.value, n.value.key) : []);
    let L = 0;
    async function N(T = 0, d) {
      const c = ++L;
      try {
        const E = await z(u.memory.memoryId.value).item(u.itemId, T, d);
        if (c !== L) return;
        if (!T) {
          const J = E.item;
          if (J.status === "forgotten") {
            f("gone");
            return;
          }
          n.value = J, r.value = E.provenance;
        }
        const U = E.versions;
        o.value = T ? [...o.value, ...U.rows] : U.rows, i.value = U.next, h.value = "";
      } catch (E) {
        if (c !== L) return;
        oe(E) === 404 ? f("gone") : h.value = Y(E);
      }
    }
    j(() => u.itemId, () => {
      n.value = null, o.value = [], _.value = null, S.value = null, C.value = "", I.value = !1, N();
    }, { immediate: !0 });
    async function y() {
      const T = ++L, d = o.value.length;
      try {
        let c = 0, E = null;
        const U = [];
        let J = !0;
        do {
          const pe = Math.min(100, Math.max(1, d - U.length)), G = await z(u.memory.memoryId.value).item(u.itemId, c, pe);
          if (T !== L) return;
          if (J) {
            if (G.item.status === "forgotten") {
              f("gone");
              return;
            }
            n.value = G.item, r.value = G.provenance, J = !1;
          }
          U.push(...G.versions.rows), E = G.versions.next, c = E ?? 0;
        } while (U.length < d && E !== null);
        o.value = U, i.value = E, h.value = "";
      } catch (c) {
        T === L && (oe(c) === 404 ? f("gone") : h.value = Y(c));
      }
    }
    j(u.memory.revision, () => {
      y();
    });
    function k(T) {
      return u.memory.act(() => z(u.memory.memoryId.value).act(u.itemId, T));
    }
    async function O() {
      const T = (_.value || "").trim();
      if (!T || !n.value) return;
      let d;
      if (S.value !== null)
        try {
          d = JSON.parse(S.value);
        } catch {
          C.value = "Details must be valid JSON.";
          return;
        }
      await u.memory.act(async () => {
        const E = S.value === null ? { content: T } : { content: T, value: d }, U = await z(u.memory.memoryId.value).edit(u.itemId, E);
        U && U !== u.itemId && f("replaced", U);
      }) && (_.value = null, S.value = null, C.value = "");
    }
    function ve() {
      n.value && (_.value = n.value.content, S.value = n.value.value === void 0 ? null : JSON.stringify(n.value.value, null, 2), C.value = "");
    }
    async function ye() {
      await k("forget") && (I.value = !1, f("gone"));
    }
    function be(T) {
      return T.host_kind === "item" ? "tabler:brain" : T.host_kind === "content" ? "tabler:file-text" : T.host_kind === "dataflow" ? "tabler:route" : "tabler:message-circle";
    }
    function fe(T) {
      if (T.line) {
        if (T.line.role === "tool") return "Tool result";
        if (T.line.role === "document") return "Document";
        const d = T.line.author;
        return d?.kind === "user" ? "They said" : d?.kind === "system" ? "Workflow input" : d?.kind === "agent" ? n.value?.scope_family === "agent" && n.value.scope_id === d.id ? "The agent said" : `Task from ${d.id || "an agent"}` : "Message";
      }
      return T.host_kind === "item" ? T.memory ? "From the memory" : "From a memory that is no longer kept" : T.host_kind === "content" ? "A document" : T.host_kind === "dataflow" ? "A workflow run" : "A conversation whose text is no longer kept";
    }
    return (T, d) => (l(), a(M, null, [
      h.value ? (l(), a("div", Wt, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, m(h.value), 1)
      ])) : n.value ? (l(), a("article", qt, [
        e("header", Jt, [
          e("span", {
            class: B(["mm-head-ic", p.value?.tone])
          }, [
            b(t(w), {
              icon: v.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ], 2),
          e("div", Gt, [
            e("div", Yt, [
              e("span", Zt, m(p.value?.label), 1),
              e("span", Qt, m(t(K)(n.value.key)), 1),
              n.value.status !== "current" ? (l(), P(t(re), {
                key: 0,
                class: "kx-tag-sm",
                severity: t(de)(n.value.status),
                value: t(te)[n.value.status]
              }, null, 8, ["severity", "value"])) : $("", !0),
              e("span", Xt, [
                x.value && _.value === null ? (l(), a("button", {
                  key: 0,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: ve
                }, [
                  b(t(w), {
                    icon: "tabler:pencil",
                    "aria-hidden": "true"
                  }),
                  d[8] || (d[8] = V("Edit ", -1))
                ])) : $("", !0),
                x.value ? (l(), a("button", {
                  key: 1,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: s.memory.busy.value,
                  onClick: d[0] || (d[0] = (c) => k("archive"))
                }, [
                  b(t(w), {
                    icon: "tabler:archive",
                    "aria-hidden": "true"
                  }),
                  d[9] || (d[9] = V("Archive ", -1))
                ], 8, en)) : $("", !0),
                n.value.status === "archived" ? (l(), a("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  disabled: s.memory.busy.value,
                  onClick: d[1] || (d[1] = (c) => k("restore"))
                }, [
                  b(t(w), {
                    icon: "tabler:restore",
                    "aria-hidden": "true"
                  }),
                  d[10] || (d[10] = V("Restore ", -1))
                ], 8, tn)) : $("", !0),
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm mm-danger",
                  disabled: s.memory.busy.value,
                  onClick: d[2] || (d[2] = (c) => I.value = !0)
                }, [
                  b(t(w), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  }),
                  d[11] || (d[11] = V("Forget ", -1))
                ], 8, nn)
              ])
            ]),
            _.value !== null ? (l(), a("div", ln, [
              d[14] || (d[14] = e("label", {
                class: "mm-label",
                for: "memory_content"
              }, "Memory text", -1)),
              b(t(ee), {
                id: "memory_content",
                modelValue: _.value,
                "onUpdate:modelValue": d[3] || (d[3] = (c) => _.value = c),
                "auto-resize": "",
                rows: "2",
                "aria-label": "Memory text"
              }, null, 8, ["modelValue"]),
              S.value !== null ? (l(), a(M, { key: 0 }, [
                d[12] || (d[12] = e("label", {
                  class: "mm-label",
                  for: "memory_value"
                }, "Details", -1)),
                b(t(ee), {
                  id: "memory_value",
                  modelValue: S.value,
                  "onUpdate:modelValue": d[4] || (d[4] = (c) => S.value = c),
                  "auto-resize": "",
                  rows: "5",
                  "aria-label": "Details"
                }, null, 8, ["modelValue"]),
                C.value ? (l(), a("span", sn, m(C.value), 1)) : $("", !0)
              ], 64)) : $("", !0),
              e("div", on, [
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-primary sm",
                  disabled: s.memory.busy.value || !_.value.trim(),
                  onClick: O
                }, [
                  b(t(w), {
                    icon: "tabler:check",
                    "aria-hidden": "true"
                  }),
                  d[13] || (d[13] = V("Save ", -1))
                ], 8, an),
                e("button", {
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: d[5] || (d[5] = (c) => {
                    _.value = null, S.value = null, C.value = "";
                  })
                }, "Cancel")
              ])
            ])) : (l(), a("h2", rn, m(n.value.content), 1)),
            e("div", un, [
              n.value.scope_family === "agent" ? (l(), a("span", dn, [
                b(t(w), {
                  icon: "tabler:robot",
                  "aria-hidden": "true"
                }),
                d[15] || (d[15] = V("About the agent itself", -1))
              ])) : $("", !0),
              e("span", {
                class: "mm-fact",
                title: t(Q)(n.value.valid_at)
              }, [
                b(t(w), {
                  icon: "tabler:calendar-event",
                  "aria-hidden": "true"
                }),
                V("True since " + m(t(H)(n.value.valid_at)), 1)
              ], 8, cn),
              n.value.invalid_at ? (l(), a("span", {
                key: 1,
                class: "mm-fact",
                title: t(Q)(n.value.invalid_at)
              }, [
                b(t(w), {
                  icon: "tabler:calendar-off",
                  "aria-hidden": "true"
                }),
                V("Until " + m(t(H)(n.value.invalid_at)), 1)
              ], 8, mn)) : $("", !0)
            ])
          ])
        ]),
        _.value === null && D.value.length ? (l(), a("section", vn, [
          d[16] || (d[16] = e("h3", {
            id: "mm-details",
            class: "mm-sec-h"
          }, "Details", -1)),
          e("dl", yn, [
            (l(!0), a(M, null, F(D.value, (c, E) => (l(), a("div", { key: E }, [
              e("dt", null, m(c.label), 1),
              e("dd", null, m(c.text), 1)
            ]))), 128))
          ])
        ])) : $("", !0),
        o.value.length > 1 || i.value !== null ? (l(), a("section", bn, [
          d[18] || (d[18] = e("h3", {
            id: "mm-history",
            class: "mm-sec-h"
          }, "History", -1)),
          e("ol", fn, [
            (l(!0), a(M, null, F(o.value, (c) => (l(), a("li", {
              key: c.id,
              class: B({ now: c.id === n.value.id, past: c.status !== "current" })
            }, [
              d[17] || (d[17] = e("span", {
                class: "mm-dot",
                "aria-hidden": "true"
              }, null, -1)),
              e("span", pn, [
                e("span", kn, m(c.content), 1),
                e("span", hn, [
                  V("v" + m(c.version) + " · " + m(t(H)(c.valid_at)), 1),
                  c.status !== "current" ? (l(), a(M, { key: 0 }, [
                    V(" · " + m(t(te)[c.status]), 1)
                  ], 64)) : $("", !0)
                ])
              ])
            ], 2))), 128))
          ]),
          i.value !== null ? (l(), a("button", {
            key: 0,
            type: "button",
            class: "kx-btn kx-btn-ghost sm",
            onClick: d[6] || (d[6] = (c) => N(i.value))
          }, "Show older versions")) : $("", !0)
        ])) : $("", !0),
        e("section", _n, [
          d[20] || (d[20] = e("h3", {
            id: "mm-sources",
            class: "mm-sec-h"
          }, "Learned from", -1)),
          r.value.length ? (l(), a("ul", xn, [
            (l(!0), a(M, null, F(r.value, (c) => (l(), a("li", {
              key: c.host_kind + c.host_id + c.event_id,
              class: "mm-source"
            }, [
              b(t(w), {
                class: "mm-source-ic",
                icon: be(c),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              e("div", $n, [
                e("div", wn, [
                  e("span", null, m(fe(c)), 1),
                  c.line?.created_at || c.recorded_at ? (l(), a("span", {
                    key: 0,
                    class: "mm-muted",
                    title: t(Q)(c.line?.created_at || c.recorded_at || "")
                  }, m(t(H)(c.line?.created_at || c.recorded_at || "")), 9, Cn)) : $("", !0)
                ]),
                c.line ? (l(), a("blockquote", Sn, m(c.line.text), 1)) : $("", !0),
                c.memory ? (l(), a("button", {
                  key: 1,
                  type: "button",
                  class: "mm-source-link",
                  onClick: (E) => f("open", c.memory.id)
                }, [
                  e("span", Tn, m(t(K)(c.memory.key)), 1),
                  e("span", null, m(c.memory.content), 1)
                ], 8, An)) : $("", !0),
                c.host_kind === "session" ? (l(), a("button", {
                  key: 2,
                  type: "button",
                  class: "kx-btn kx-btn-ghost sm",
                  onClick: (E) => f("conversation", c.host_id)
                }, [
                  b(t(w), {
                    icon: "tabler:external-link",
                    "aria-hidden": "true"
                  }),
                  d[19] || (d[19] = V("Open conversation ", -1))
                ], 8, In)) : $("", !0)
              ])
            ]))), 128))
          ])) : (l(), a("p", gn, m(n.value.source === "owner" ? "Added by a person on this page." : "No conversation recorded for this memory."), 1))
        ])
      ])) : (l(), a("div", Ht, [
        (l(), a(M, null, F(4, (c) => e("div", {
          key: c,
          class: "mm-skel-line"
        })), 64))
      ])),
      b(Kt, {
        open: I.value,
        danger: "",
        icon: "tabler:trash",
        title: "Forget this memory",
        subtitle: n.value ? t(K)(n.value.key) : "",
        "confirm-label": "Forget for good",
        busy: s.memory.busy.value,
        onCancel: d[7] || (d[7] = (c) => I.value = !1),
        onConfirm: ye
      }, {
        default: Z(() => [...d[21] || (d[21] = [
          V(" This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone. ", -1)
        ])]),
        _: 1
      }, 8, ["open", "subtitle", "busy"])
    ], 64));
  }
}), Nn = { class: "mm-rail-tools" }, En = {
  class: "kx-rail-body",
  "aria-label": "Memories"
}, Mn = {
  key: 0,
  class: "mm-skel"
}, Rn = {
  key: 1,
  class: "kx-notice error mm-rail-note"
}, Dn = {
  key: 2,
  class: "mm-rail-empty"
}, Ln = ["aria-expanded", "onClick"], Un = { class: "kx-railsec-t" }, Bn = { class: "kx-railsec-b" }, Fn = ["aria-current", "onClick"], Pn = { class: "mm-row-main" }, On = { class: "mm-row-t" }, jn = { class: "mm-row-s" }, zn = ["disabled"], Kn = /* @__PURE__ */ W({
  __name: "MemoryRail",
  props: {
    memory: {},
    selectedId: {}
  },
  emits: ["select", "filtered", "status-change"],
  setup(s, { emit: g }) {
    const u = s, f = g, n = [
      { value: "current", label: "Current" },
      { value: "superseded", label: "Earlier" },
      { value: "archived", label: "Archived" }
    ], o = A("current"), i = A(""), r = Ne(i, 250, (I) => I.trim()), h = le(() => u.memory.memoryId.value ? [u.memory.memoryId.value, o.value, r.value] : null, (I) => z(u.memory.memoryId.value).items({ status: o.value, query: r.value, offset: I }), u.memory.revision);
    j([o, r], () => {
      f("filtered"), f("status-change", o.value);
    });
    const _ = A({ instructions: !1, knowhow: !1, plans: !1, people: !1 }), S = R(() => Re.map((I) => ({ ...I, items: h.rows.value.filter((p) => q[p.kind].group === I.id) })).filter((I) => I.items.length)), C = R(() => r.value ? "No memories match this search." : o.value === "superseded" ? "No earlier versions yet." : o.value === "archived" ? "Nothing archived." : "Nothing remembered yet. Memories appear as agents talk with people.");
    return (I, p) => (l(), a(M, null, [
      e("div", Nn, [
        b(Ee, {
          modelValue: i.value,
          "onUpdate:modelValue": p[0] || (p[0] = (v) => i.value = v),
          placeholder: "Search memories…",
          label: "Search memories"
        }, null, 8, ["modelValue"]),
        b(t(ue), {
          modelValue: o.value,
          "onUpdate:modelValue": p[1] || (p[1] = (v) => o.value = v),
          class: "mm-views",
          options: n,
          "option-label": "label",
          "option-value": "value",
          "allow-empty": !1,
          size: "small",
          "aria-label": "Which memories"
        }, null, 8, ["modelValue"])
      ]),
      e("nav", En, [
        t(h).loading.value && !t(h).rows.value.length ? (l(), a("div", Mn, [
          (l(), a(M, null, F(6, (v) => e("div", {
            key: v,
            class: "mm-skel-row"
          })), 64))
        ])) : t(h).error.value ? (l(), a("div", Rn, [
          b(t(w), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          e("span", null, m(t(h).error.value), 1)
        ])) : t(h).rows.value.length ? $("", !0) : (l(), a("div", Dn, m(C.value), 1)),
        (l(!0), a(M, null, F(S.value, (v) => (l(), a("div", {
          key: v.id,
          class: B(["kx-railsec", { closed: _.value[v.id] }])
        }, [
          e("button", {
            type: "button",
            class: "kx-railsec-h",
            "aria-expanded": !_.value[v.id],
            onClick: (x) => _.value[v.id] = !_.value[v.id]
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
            e("span", Un, m(v.title), 1)
          ], 8, Ln),
          xe(e("div", Bn, [
            (l(!0), a(M, null, F(v.items, (x) => (l(), a("button", {
              key: x.id,
              type: "button",
              class: B(["mm-row", { on: s.selectedId === x.id }]),
              "aria-current": s.selectedId === x.id ? "true" : void 0,
              onClick: (D) => f("select", x)
            }, [
              e("span", {
                class: B(["mm-row-ic", t(q)[x.kind].tone])
              }, [
                b(t(w), {
                  icon: t(q)[x.kind].icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              e("span", Pn, [
                e("span", On, m(x.content), 1),
                e("span", jn, m(t(K)(x.key)) + " · " + m(t(H)(x.valid_at)), 1)
              ])
            ], 10, Fn))), 128))
          ], 512), [
            [$e, !_.value[v.id]]
          ])
        ], 2))), 128)),
        t(h).next.value !== null ? (l(), a("button", {
          key: 3,
          type: "button",
          class: "kx-btn kx-btn-ghost sm mm-more",
          disabled: t(h).loading.value,
          onClick: p[2] || (p[2] = //@ts-ignore
          (...v) => t(h).more && t(h).more(...v))
        }, [
          t(h).loading.value ? (l(), P(t(w), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : $("", !0),
          p[3] || (p[3] = V("Show more ", -1))
        ], 8, zn)) : $("", !0)
      ])
    ], 64));
  }
}), Wn = {
  key: 0,
  class: "kx-notice error"
}, Hn = {
  key: 1,
  class: "mm-page"
}, qn = {
  key: 0,
  class: "kx-notice error mm-page-note"
}, Jn = { class: "kx-shell" }, Gn = { class: "kx-rail" }, Yn = { class: "kx-railhead" }, Zn = { class: "kx-railhead-title" }, Qn = { key: 0 }, Xn = { class: "kx-railhead-acts" }, el = { class: "kx-main" }, tl = { class: "kx-main-scroll mm-main" }, nl = {
  key: 3,
  class: "kx-empty kx-empty-spacious mm-empty"
}, ll = { class: "kx-empty-ico" }, sl = /* @__PURE__ */ W({
  __name: "MemoryManage",
  setup(s) {
    const g = Ce(), u = Se(), f = A(""), n = A({});
    j(() => g.value.config, (y) => {
      try {
        n.value = Ie(y), f.value = "";
      } catch (k) {
        f.value = Y(k);
      }
    }, { immediate: !0 });
    const o = Ze(R(() => String(n.value.kb_id || ""))), i = A("item"), r = A(String(n.value.route || "")), h = A(!1), _ = A("current"), S = R(() => o.status.value?.counts[_.value]), C = R(() => o.status.value?.counts.conflict_groups || 0), I = R(() => (o.status.value?.runs || []).filter((y) => y.status === "failed").length);
    j(() => n.value.route, (y) => {
      const k = typeof y == "string" ? y : "";
      k !== r.value && (p = !0, r.value = k, k && (i.value = "item"));
    }), j(o.memoryId, () => {
      r.value = "", i.value = "item";
    });
    let p = !1;
    j(r, (y) => {
      if (p) {
        p = !1;
        return;
      }
      u("navigate", y || "");
    });
    function v(y) {
      u("kickside-chat-open", { kind: "session", sessionId: y });
    }
    function x(y) {
      i.value = "item", y !== r.value && (r.value = y);
    }
    function D(y) {
      x(y.id);
    }
    function L(y) {
      i.value = i.value === y ? "item" : y;
    }
    function N(y) {
      h.value = !1, y && x(y);
    }
    return (y, k) => f.value ? (l(), a("div", Wn, m(f.value), 1)) : (l(), a("div", Hn, [
      t(o).error.value ? (l(), a("div", qn, [
        b(t(w), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e("span", null, m(t(o).error.value), 1)
      ])) : $("", !0),
      e("div", Jn, [
        e("aside", Gn, [
          e("div", Yn, [
            e("span", Zn, [
              k[7] || (k[7] = V("Memories", -1)),
              S.value !== void 0 ? (l(), a("b", Qn, m(S.value), 1)) : $("", !0)
            ]),
            e("div", Xn, [
              b(X, {
                icon: "tabler:activity",
                label: I.value ? `Activity, ${I.value} failed` : "Activity",
                active: i.value === "activity",
                onClick: k[0] || (k[0] = (O) => L("activity"))
              }, null, 8, ["label", "active"]),
              b(X, {
                icon: "tabler:plus",
                label: "Add agent memory",
                onClick: k[1] || (k[1] = (O) => h.value = !0)
              })
            ])
          ]),
          C.value ? (l(), a("button", {
            key: 0,
            type: "button",
            class: B(["mm-conflict-bar", { on: i.value === "conflicts" }]),
            onClick: k[2] || (k[2] = (O) => L("conflicts"))
          }, [
            b(t(w), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            e("span", null, m(C.value === 1 ? "1 conflict to resolve" : `${C.value} conflicts to resolve`), 1),
            b(t(w), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 2)) : $("", !0),
          b(Kn, {
            memory: t(o),
            "selected-id": i.value === "item" ? r.value : "",
            onSelect: D,
            onFiltered: k[3] || (k[3] = (O) => r.value = ""),
            onStatusChange: k[4] || (k[4] = (O) => _.value = O)
          }, null, 8, ["memory", "selected-id"])
        ]),
        e("main", el, [
          e("div", tl, [
            i.value === "conflicts" ? (l(), P(At, {
              key: 0,
              memory: t(o)
            }, null, 8, ["memory"])) : i.value === "activity" ? (l(), P(Ge, {
              key: 1,
              memory: t(o)
            }, null, 8, ["memory"])) : r.value ? (l(), P(Vn, {
              key: r.value,
              memory: t(o),
              "item-id": r.value,
              onReplaced: x,
              onOpen: x,
              onConversation: v,
              onGone: k[5] || (k[5] = (O) => r.value = "")
            }, null, 8, ["memory", "item-id"])) : (l(), a("div", nl, [
              e("span", ll, [
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
      b(Mt, {
        open: h.value,
        title: "Add agent memory",
        icon: "tabler:plus",
        onClose: k[6] || (k[6] = (O) => h.value = !1)
      }, {
        default: Z(() => [
          h.value ? (l(), P(vt, {
            key: 0,
            memory: t(o),
            onAdded: N
          }, null, 8, ["memory"])) : $("", !0)
        ]),
        _: 1
      }, 8, ["open"])
    ]));
  }
}), pl = {
  rootComponent: sl,
  plugins: [ke]
};
export {
  pl as mountConfig
};
//# sourceMappingURL=lazy-mount-CYBG1M8L.js.map
