import { u as ft, b as bt, W as _t } from "./MmSwitch.vue_vue_type_script_setup_true_lang-CAQfcCan.js";
import { defineComponent as kt, computed as I, ref as m, watch as st, onUnmounted as gt, openBlock as l, createElementBlock as o, createElementVNode as e, createVNode as r, unref as d, toDisplayString as a, normalizeClass as f, createTextVNode as p, createCommentVNode as c, Fragment as k, renderList as C, withDirectives as S, vModelSelect as J, vModelText as W, createBlock as ht } from "vue";
import { Icon as u } from "@iconify/vue";
import { on as Ct, api as b, define as wt } from "@wippy-fe/proxy";
import { e as Z, K as P, b as $t, a as St, i as T, s as At } from "./memory-DSw53YZr.js";
const Ut = { class: "mm-page" }, Vt = { class: "mm-stats" }, It = { class: "mm-stat" }, Nt = { class: "mm-stat-ico" }, Rt = { class: "mm-stat-n" }, xt = { class: "mm-stat" }, Et = { class: "mm-stat-ico" }, Kt = { class: "mm-stat-n" }, Lt = { class: "mm-stat" }, Tt = { class: "mm-stat-ico warn" }, Mt = { class: "mm-stat-n" }, Dt = {
  class: "mm-tabs",
  role: "tablist"
}, Ft = {
  key: 0,
  class: "mm-chip conflict"
}, Bt = {
  key: 0,
  class: "mm-chip failed"
}, Wt = {
  key: 0,
  class: "mm-notice error"
}, Pt = { class: "mm-filters" }, jt = ["onClick"], Ot = ["value"], qt = { class: "mm-split" }, zt = { class: "mm-card" }, Ht = {
  key: 0,
  class: "mm-empty"
}, Jt = {
  key: 1,
  class: "mm-empty"
}, Zt = {
  key: 2,
  class: "mm-list"
}, Gt = ["onClick"], Qt = { class: "mm-row-ico" }, Xt = { class: "mm-row-t" }, Yt = { class: "mm-row-s" }, te = { class: "mm-chip" }, ee = { class: "mm-chip" }, se = {
  key: 0,
  class: "mm-card"
}, ne = { class: "mm-card-h" }, le = { class: "mm-card-b" }, oe = { key: 0 }, ae = {
  class: "mm-actions",
  style: { "margin-top": "8px" }
}, ie = ["disabled"], de = {
  key: 1,
  class: "mm-row-t"
}, re = { class: "mm-dl" }, ue = { key: 0 }, me = { key: 1 }, ce = { class: "mm-actions" }, ve = ["disabled"], pe = ["disabled"], ye = {
  key: 2,
  class: "mm-hint"
}, fe = {
  key: 1,
  class: "mm-card"
}, be = { class: "mm-card-b" }, _e = { class: "mm-actions" }, ke = {
  key: 2,
  class: "mm-card"
}, ge = { class: "mm-card-b" }, he = { class: "mm-grid2" }, Ce = { class: "mm-field" }, we = { class: "mm-field" }, $e = { class: "mm-field" }, Se = { class: "mm-field" }, Ae = { class: "mm-actions" }, Ue = ["disabled"], Ve = {
  key: 2,
  class: "mm-card"
}, Ie = {
  key: 0,
  class: "mm-empty"
}, Ne = { class: "mm-row-t" }, Re = { class: "mm-row-s" }, xe = { class: "mm-chip" }, Ee = ["disabled", "onClick"], Ke = {
  key: 3,
  class: "mm-card"
}, Le = {
  key: 0,
  class: "mm-empty"
}, Te = {
  key: 1,
  class: "mm-list"
}, Me = { class: "mm-row-ico" }, De = { class: "mm-row-t" }, Fe = { class: "mm-row-s" }, Be = { key: 0 }, We = { key: 1 }, Pe = { key: 2 }, je = {
  key: 0,
  class: "mm-row-s",
  style: { color: "var(--mm-danger)" }
}, Oe = {
  key: 4,
  class: "mm-card"
}, qe = { class: "mm-card-b" }, ze = { class: "mm-actions" }, He = ["disabled"], Je = { class: "mm-hint" }, Ze = /* @__PURE__ */ kt({
  __name: "MemoryManage",
  setup(nt) {
    const lt = ft(), M = I(() => {
      const n = lt.value.config;
      if (typeof n == "string")
        try {
          return String(JSON.parse(n).kb_id || "");
        } catch {
          return "";
        }
      return String(n?.kb_id || "");
    }), _ = I(() => `/api/v1/memory/${encodeURIComponent(M.value)}`), y = m("memories"), A = m(null), N = m([]), R = m([]), i = m(null), j = m([]), G = m([]), O = m(!1), w = m(""), g = m(""), ot = ["identity", "rule", "profile_slot", "preference", "fact", "skill", "lesson"], at = [
      { status: "current", label: "Current" },
      { status: "superseded", label: "Earlier versions" },
      { status: "forgotten", label: "Forgotten" }
    ], x = m(""), E = m("current"), K = m(""), D = m(!1), v = m({ kind: "rule", scope_id: "", key: "", content: "" }), h = m(""), F = m({}), Q = m("");
    async function it() {
      const { data: n } = await b.get(`${_.value}/status`);
      A.value = n, F.value = { ...A.value?.config || {} };
    }
    async function X() {
      const n = new URLSearchParams({ limit: "200" });
      x.value && n.set("kind", x.value), E.value && n.set("status", E.value), K.value && n.set("scope_family", K.value);
      const { data: t } = await b.get(`${_.value}/items?${n.toString()}`);
      N.value = T(t) && Array.isArray(t.items) ? t.items : [], i.value && !N.value.some((s) => s.id === i.value?.id) && (i.value = null);
    }
    async function dt() {
      const { data: n } = await b.get(`${_.value}/conflicts`);
      R.value = T(n) && Array.isArray(n.groups) ? n.groups : [];
    }
    let B = 0;
    async function q() {
      if (!M.value) return;
      const n = ++B;
      O.value = !0;
      try {
        await Promise.all([it(), X(), dt()]), i.value && await Y(i.value), n === B && (w.value = "");
      } catch (t) {
        n === B && (w.value = Z(t));
      } finally {
        n === B && (O.value = !1);
      }
    }
    let U = null;
    st(M, (n) => {
      if (U && U(), U = null, !n) return;
      const t = Ct(`component.${n}`, () => {
        q();
      });
      U = typeof t == "function" ? t : null;
    }, { immediate: !0 }), gt(() => {
      U && U();
    }), bt(q), st([x, E, K], () => {
      X().catch((n) => {
        w.value = Z(n);
      });
    });
    async function Y(n) {
      i.value = n, h.value = "";
      const { data: t } = await b.get(`${_.value}/items/${encodeURIComponent(n.id)}`);
      T(t) && (T(t.item) && (i.value = t.item), j.value = Array.isArray(t.provenance) ? t.provenance : [], G.value = Array.isArray(t.versions) ? t.versions : []);
    }
    async function V(n, t) {
      g.value = n, w.value = "";
      try {
        await t(), await q();
      } catch (s) {
        w.value = Z(s);
      } finally {
        g.value = "";
      }
    }
    function rt(n) {
      V("forget", () => b.post(`${_.value}/items/${encodeURIComponent(n.id)}/forget`, { reason: "forgotten in the memory page" }));
    }
    function ut(n) {
      V("restore", () => b.post(`${_.value}/items/${encodeURIComponent(n.id)}/restore`, {}));
    }
    function mt(n) {
      const t = h.value.trim();
      t && V("edit", async () => {
        const { data: s } = await b.put(`${_.value}/items/${encodeURIComponent(n.id)}`, { content: t, value: t });
        T(s) && typeof s.item_id == "string" && (i.value = { ...n, id: s.item_id });
      });
    }
    function ct() {
      const n = v.value;
      !n.content.trim() || !n.scope_id.trim() || V("create", async () => {
        await b.post(`${_.value}/items`, {
          kind: n.kind,
          scope_family: "agent",
          scope_id: n.scope_id.trim(),
          key: n.key.trim() || n.content.trim(),
          content: n.content.trim()
        }), v.value = { ...n, key: "", content: "" }, D.value = !1;
      });
    }
    function vt(n, t) {
      V("resolve", () => b.post(`${_.value}/conflicts/${encodeURIComponent(n.group_id)}/resolve`, { winner_id: t.id }));
    }
    function pt() {
      V("settings", async () => {
        await b.put(`/api/v1/knowledge/${encodeURIComponent(M.value)}`, { config: F.value }), Q.value = "Saved.";
      });
    }
    const yt = I(() => !!i.value && (i.value.kind === "identity" || i.value.kind === "rule") && i.value.status === "current"), z = I(() => A.value?.counts), H = I(() => A.value?.runs || []), tt = I(() => H.value.filter((n) => n.status === "failed").length);
    function et(n) {
      return n.scope_family === "agent" ? `agent ${n.scope_id}` : n.scope_family === "owner" ? "user" : n.scope_family;
    }
    function L(n) {
      if (!n) return "";
      const t = Date.parse(n.includes("T") ? n : n.replace(" ", "T") + "Z");
      return Number.isFinite(t) ? new Date(t).toLocaleString() : n;
    }
    return (n, t) => (l(), o("div", Ut, [
      e("div", Vt, [
        e("div", It, [
          e("span", Nt, [
            r(d(u), { icon: "tabler:brain" })
          ]),
          e("div", null, [
            e("div", Rt, a(z.value?.current ?? 0), 1),
            t[19] || (t[19] = e("div", { class: "mm-stat-l" }, "current memories", -1))
          ])
        ]),
        e("div", xt, [
          e("span", Et, [
            r(d(u), { icon: "tabler:history" })
          ]),
          e("div", null, [
            e("div", Kt, a(z.value?.superseded ?? 0), 1),
            t[20] || (t[20] = e("div", { class: "mm-stat-l" }, "earlier versions", -1))
          ])
        ]),
        e("div", Lt, [
          e("span", Tt, [
            r(d(u), { icon: "tabler:alert-triangle" })
          ]),
          e("div", null, [
            e("div", Mt, a(z.value?.conflict_groups ?? 0), 1),
            t[21] || (t[21] = e("div", { class: "mm-stat-l" }, "conflicts to resolve", -1))
          ])
        ])
      ]),
      e("div", Dt, [
        e("button", {
          class: f(["mm-tab", { on: y.value === "memories" }]),
          role: "tab",
          onClick: t[0] || (t[0] = (s) => y.value = "memories")
        }, [
          r(d(u), { icon: "tabler:brain" }),
          t[22] || (t[22] = p("Memories", -1))
        ], 2),
        e("button", {
          class: f(["mm-tab", { on: y.value === "conflicts" }]),
          role: "tab",
          onClick: t[1] || (t[1] = (s) => y.value = "conflicts")
        }, [
          r(d(u), { icon: "tabler:git-compare" }),
          t[23] || (t[23] = p("Conflicts", -1)),
          R.value.length ? (l(), o("span", Ft, a(R.value.length), 1)) : c("", !0)
        ], 2),
        e("button", {
          class: f(["mm-tab", { on: y.value === "activity" }]),
          role: "tab",
          onClick: t[2] || (t[2] = (s) => y.value = "activity")
        }, [
          r(d(u), { icon: "tabler:activity" }),
          t[24] || (t[24] = p("Activity", -1)),
          tt.value ? (l(), o("span", Bt, a(tt.value) + " failed", 1)) : c("", !0)
        ], 2),
        e("button", {
          class: f(["mm-tab", { on: y.value === "settings" }]),
          role: "tab",
          onClick: t[3] || (t[3] = (s) => y.value = "settings")
        }, [
          r(d(u), { icon: "tabler:settings" }),
          t[25] || (t[25] = p("Settings", -1))
        ], 2)
      ]),
      w.value ? (l(), o("div", Wt, [
        r(d(u), { icon: "tabler:alert-circle" }),
        e("span", null, a(w.value), 1)
      ])) : c("", !0),
      y.value === "memories" ? (l(), o(k, { key: 1 }, [
        e("div", Pt, [
          (l(), o(k, null, C(at, (s) => e("button", {
            key: s.status,
            class: f(["mm-chip-btn", { on: E.value === s.status }]),
            onClick: ($) => E.value = s.status
          }, a(s.label), 11, jt)), 64)),
          t[28] || (t[28] = e("span", { class: "mm-sep" }, null, -1)),
          S(e("select", {
            class: "mm-select mm-select-sm",
            "onUpdate:modelValue": t[4] || (t[4] = (s) => K.value = s),
            name: "scope_filter",
            "aria-label": "Whose memories"
          }, [...t[26] || (t[26] = [
            e("option", { value: "" }, "Everyone", -1),
            e("option", { value: "owner" }, "About people", -1),
            e("option", { value: "agent" }, "Agent identity & rules", -1)
          ])], 512), [
            [J, K.value]
          ]),
          S(e("select", {
            class: "mm-select mm-select-sm",
            "onUpdate:modelValue": t[5] || (t[5] = (s) => x.value = s),
            name: "kind_filter",
            "aria-label": "Kind"
          }, [
            t[27] || (t[27] = e("option", { value: "" }, "All kinds", -1)),
            (l(), o(k, null, C(ot, (s) => e("option", {
              key: s,
              value: s
            }, a(d(P)[s]), 9, Ot)), 64))
          ], 512), [
            [J, x.value]
          ])
        ]),
        e("div", qt, [
          e("div", zt, [
            O.value && !N.value.length ? (l(), o("div", Ht, [
              r(d(u), {
                icon: "tabler:loader-2",
                class: "spin"
              })
            ])) : N.value.length ? (l(), o("div", Zt, [
              (l(!0), o(k, null, C(N.value, (s) => (l(), o("button", {
                key: s.id,
                class: f(["mm-row", { on: i.value?.id === s.id }]),
                onClick: ($) => Y(s)
              }, [
                e("span", Qt, [
                  r(d(u), {
                    icon: d($t)[s.kind]
                  }, null, 8, ["icon"])
                ]),
                e("span", null, [
                  e("span", Xt, a(s.content), 1),
                  e("span", Yt, [
                    e("span", te, a(d(P)[s.kind]), 1),
                    e("span", ee, a(et(s)), 1),
                    e("span", null, a(s.key) + " · v" + a(s.version), 1)
                  ])
                ]),
                e("span", {
                  class: f(["mm-chip", s.status])
                }, a(s.status), 3)
              ], 10, Gt))), 128))
            ])) : (l(), o("div", Jt, [
              r(d(u), { icon: "tabler:brain" }),
              t[29] || (t[29] = e("span", null, "No memories match these filters.", -1))
            ]))
          ]),
          i.value ? (l(), o("div", se, [
            e("div", ne, [
              e("span", null, a(d(P)[i.value.kind]) + " · " + a(i.value.key), 1),
              e("span", {
                class: f(["mm-chip", i.value.status])
              }, a(i.value.status), 3)
            ]),
            e("div", le, [
              h.value ? (l(), o("div", oe, [
                S(e("textarea", {
                  class: "mm-textarea",
                  "onUpdate:modelValue": t[6] || (t[6] = (s) => h.value = s),
                  name: "edit_content"
                }, null, 512), [
                  [W, h.value]
                ]),
                e("div", ae, [
                  e("button", {
                    class: "mm-btn primary",
                    disabled: !!g.value,
                    onClick: t[7] || (t[7] = (s) => mt(i.value))
                  }, [
                    r(d(u), { icon: "tabler:check" }),
                    t[30] || (t[30] = p("Save new version", -1))
                  ], 8, ie),
                  e("button", {
                    class: "mm-btn ghost",
                    onClick: t[8] || (t[8] = (s) => h.value = "")
                  }, "Cancel")
                ])
              ])) : (l(), o("div", de, a(i.value.content), 1)),
              e("dl", re, [
                t[31] || (t[31] = e("dt", null, "Scope", -1)),
                e("dd", null, a(et(i.value)), 1),
                t[32] || (t[32] = e("dt", null, "True since", -1)),
                e("dd", null, a(L(i.value.valid_at)), 1),
                i.value.invalid_at ? (l(), o("dt", ue, "Until")) : c("", !0),
                i.value.invalid_at ? (l(), o("dd", me, a(L(i.value.invalid_at)), 1)) : c("", !0),
                t[33] || (t[33] = e("dt", null, "Learned", -1)),
                e("dd", null, a(L(i.value.recorded_at)) + " · " + a(i.value.source), 1)
              ]),
              e("div", ce, [
                yt.value && !h.value ? (l(), o("button", {
                  key: 0,
                  class: "mm-btn ghost",
                  onClick: t[9] || (t[9] = (s) => h.value = i.value.content)
                }, [
                  r(d(u), { icon: "tabler:pencil" }),
                  t[34] || (t[34] = p("Edit", -1))
                ])) : c("", !0),
                i.value.status !== "forgotten" ? (l(), o("button", {
                  key: 1,
                  class: "mm-btn danger",
                  disabled: !!g.value,
                  onClick: t[10] || (t[10] = (s) => rt(i.value))
                }, [
                  r(d(u), { icon: "tabler:eye-off" }),
                  t[35] || (t[35] = p("Forget", -1))
                ], 8, ve)) : (l(), o("button", {
                  key: 2,
                  class: "mm-btn ghost",
                  disabled: !!g.value,
                  onClick: t[11] || (t[11] = (s) => ut(i.value))
                }, [
                  r(d(u), { icon: "tabler:restore" }),
                  t[36] || (t[36] = p("Restore", -1))
                ], 8, pe))
              ]),
              t[37] || (t[37] = e("p", { class: "mm-h" }, "Versions", -1)),
              (l(!0), o(k, null, C(G.value, (s) => (l(), o("div", {
                key: s.id,
                class: f(["mm-version", { past: s.status !== "current" }])
              }, [
                e("span", {
                  class: f(["mm-chip", s.status])
                }, "v" + a(s.version), 3),
                e("span", null, a(s.content), 1)
              ], 2))), 128)),
              t[38] || (t[38] = e("p", { class: "mm-h" }, "Seen in", -1)),
              j.value.length ? c("", !0) : (l(), o("div", ye, "Added by a person or by consolidation.")),
              (l(!0), o(k, null, C(j.value, (s) => (l(), o("div", {
                key: s.host_kind + s.host_id + s.event_id,
                class: "mm-hint"
              }, a(s.host_kind) + " " + a(s.host_id) + " · message " + a(s.event_id), 1))), 128))
            ])
          ])) : D.value ? (l(), o("div", ke, [
            t[48] || (t[48] = e("div", { class: "mm-card-h" }, "Add identity or rule", -1)),
            e("div", ge, [
              t[47] || (t[47] = e("span", { class: "mm-hint" }, "Agent identity and rules are part of the agent's instructions in every conversation.", -1)),
              e("div", he, [
                e("label", Ce, [
                  t[42] || (t[42] = e("span", { class: "mm-label" }, "Kind", -1)),
                  S(e("select", {
                    class: "mm-select",
                    "onUpdate:modelValue": t[13] || (t[13] = (s) => v.value.kind = s),
                    name: "draft_kind"
                  }, [...t[41] || (t[41] = [
                    e("option", { value: "identity" }, "Identity", -1),
                    e("option", { value: "rule" }, "Rule", -1),
                    e("option", { value: "skill" }, "Skill", -1),
                    e("option", { value: "lesson" }, "Lesson", -1)
                  ])], 512), [
                    [J, v.value.kind]
                  ])
                ]),
                e("label", we, [
                  t[43] || (t[43] = e("span", { class: "mm-label" }, "Agent id", -1)),
                  S(e("input", {
                    class: "mm-input",
                    "onUpdate:modelValue": t[14] || (t[14] = (s) => v.value.scope_id = s),
                    name: "draft_scope",
                    placeholder: "the agent this applies to"
                  }, null, 512), [
                    [W, v.value.scope_id]
                  ])
                ])
              ]),
              e("label", $e, [
                t[44] || (t[44] = e("span", { class: "mm-label" }, "Topic", -1)),
                S(e("input", {
                  class: "mm-input",
                  "onUpdate:modelValue": t[15] || (t[15] = (s) => v.value.key = s),
                  name: "draft_key",
                  placeholder: "e.g. tone"
                }, null, 512), [
                  [W, v.value.key]
                ])
              ]),
              e("label", Se, [
                t[45] || (t[45] = e("span", { class: "mm-label" }, "Text", -1)),
                S(e("textarea", {
                  class: "mm-textarea",
                  "onUpdate:modelValue": t[16] || (t[16] = (s) => v.value.content = s),
                  name: "draft_content",
                  placeholder: "e.g. Answer in short bullet points."
                }, null, 512), [
                  [W, v.value.content]
                ])
              ]),
              e("div", Ae, [
                e("button", {
                  class: "mm-btn primary",
                  disabled: !!g.value || !v.value.content.trim() || !v.value.scope_id.trim(),
                  onClick: ct
                }, [
                  r(d(u), { icon: "tabler:plus" }),
                  t[46] || (t[46] = p("Add", -1))
                ], 8, Ue),
                e("button", {
                  class: "mm-btn ghost",
                  onClick: t[17] || (t[17] = (s) => D.value = !1)
                }, "Cancel")
              ])
            ])
          ])) : (l(), o("div", fe, [
            e("div", be, [
              t[40] || (t[40] = e("span", { class: "mm-hint" }, "Select a memory to see its versions and where it was learned.", -1)),
              e("div", _e, [
                e("button", {
                  class: "mm-btn ghost",
                  onClick: t[12] || (t[12] = (s) => D.value = !0)
                }, [
                  r(d(u), { icon: "tabler:plus" }),
                  t[39] || (t[39] = p("Add identity or rule", -1))
                ])
              ])
            ])
          ]))
        ])
      ], 64)) : y.value === "conflicts" ? (l(), o("div", Ve, [
        R.value.length ? c("", !0) : (l(), o("div", Ie, [
          r(d(u), { icon: "tabler:circle-check" }),
          t[49] || (t[49] = e("span", null, "No conflicting memories.", -1))
        ])),
        (l(!0), o(k, null, C(R.value, (s) => (l(), o("div", {
          key: s.group_id,
          class: "mm-conflict"
        }, [
          t[51] || (t[51] = e("span", { class: "mm-hint" }, "These memories contradict each other. Keep the one that is right; the others become earlier versions.", -1)),
          (l(!0), o(k, null, C(s.items, ($) => (l(), o("div", {
            key: $.id,
            class: "mm-option"
          }, [
            e("div", null, [
              e("div", Ne, a($.content), 1),
              e("div", Re, [
                e("span", xe, a(d(P)[$.kind]), 1),
                e("span", null, a(L($.valid_at)), 1)
              ])
            ]),
            e("button", {
              class: "mm-btn primary",
              disabled: !!g.value,
              onClick: (Xe) => vt(s, $)
            }, [
              r(d(u), { icon: "tabler:check" }),
              t[50] || (t[50] = p("Keep this", -1))
            ], 8, Ee)
          ]))), 128))
        ]))), 128))
      ])) : y.value === "activity" ? (l(), o("div", Ke, [
        H.value.length ? (l(), o("div", Te, [
          (l(!0), o(k, null, C(H.value, (s) => (l(), o("div", {
            key: s.id,
            class: "mm-row",
            style: { cursor: "default" }
          }, [
            e("span", Me, [
              r(d(u), {
                icon: s.run_type === "consolidate" ? "tabler:sparkles" : s.run_type === "reembed" ? "tabler:vector" : "tabler:message-plus"
              }, null, 8, ["icon"])
            ]),
            e("span", null, [
              e("span", De, a(s.run_type === "derive" ? s.host_kind === "content" ? "Learned from content" : "Learned from a conversation" : s.run_type === "consolidate" ? "Consolidation" : "Re-embedding"), 1),
              e("span", Fe, [
                e("span", null, a(L(s.finished_at || s.started_at || s.created_at)), 1),
                s.stats?.added ? (l(), o("span", Be, "+" + a(s.stats.added) + " new", 1)) : c("", !0),
                s.stats?.superseded ? (l(), o("span", We, a(s.stats.superseded) + " updated", 1)) : c("", !0),
                s.stats?.conflicted ? (l(), o("span", Pe, a(s.stats.conflicted) + " conflicts", 1)) : c("", !0)
              ]),
              s.last_error ? (l(), o("span", je, a(s.last_error), 1)) : c("", !0)
            ]),
            e("span", {
              class: f(["mm-chip", s.status === "failed" ? "failed" : s.status === "succeeded" ? "current" : ""])
            }, a(s.status), 3)
          ]))), 128))
        ])) : (l(), o("div", Le, [
          r(d(u), { icon: "tabler:activity" }),
          t[52] || (t[52] = e("span", null, "Nothing captured yet.", -1))
        ]))
      ])) : (l(), o("div", Oe, [
        t[54] || (t[54] = e("div", { class: "mm-card-h" }, "Memory settings", -1)),
        e("div", qe, [
          A.value ? (l(), ht(St, {
            key: 0,
            schema: A.value.config_schema,
            modelValue: F.value,
            "onUpdate:modelValue": t[18] || (t[18] = (s) => F.value = s)
          }, null, 8, ["schema", "modelValue"])) : c("", !0),
          e("div", ze, [
            e("button", {
              class: "mm-btn primary",
              disabled: !!g.value,
              onClick: pt
            }, [
              r(d(u), { icon: "tabler:device-floppy" }),
              t[53] || (t[53] = p("Save settings", -1))
            ], 8, He),
            e("span", Je, a(Q.value), 1)
          ])
        ])
      ]))
    ]));
  }
}), Ge = {
  type: "object",
  properties: {
    config: { type: "object", description: "Memory page context: { kb_id: string, route?: string }" }
  }
};
class Qe extends _t {
  static get wippyConfig() {
    return { propsSchema: Ge, hostCssKeys: ["themeConfigUrl"], inlineCss: At };
  }
  static get vueConfig() {
    return { rootComponent: Ze };
  }
}
wt(import.meta.url, Qe);
//# sourceMappingURL=memory_kb.js.map
