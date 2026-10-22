import { u as pt, c as yt, W as ft } from "./ModelPicker.vue_vue_type_script_setup_true_lang-BXa7KiZU.js";
import { defineComponent as bt, computed as R, ref as m, watch as tt, onUnmounted as _t, openBlock as o, createElementBlock as l, createElementVNode as e, createVNode as r, unref as d, toDisplayString as i, normalizeClass as c, createTextVNode as f, createCommentVNode as v, Fragment as g, renderList as $, withDirectives as E, vModelText as P, vModelSelect as kt, createBlock as gt } from "vue";
import { Icon as u } from "@iconify/vue";
import { on as ht, api as b, define as Ct } from "@wippy-fe/proxy";
import { e as H, K as j, a as wt, _ as $t, i as K, s as St } from "./memory-CDlIk0ZK.js";
const At = { class: "mm-page" }, Ut = { class: "mm-stats" }, It = { class: "mm-stat" }, Vt = { class: "mm-stat-ico" }, Nt = { class: "mm-stat-n" }, Rt = { class: "mm-stat" }, xt = { class: "mm-stat-ico" }, Tt = { class: "mm-stat-n" }, Lt = { class: "mm-stat" }, Et = { class: "mm-stat-ico warn" }, Kt = { class: "mm-stat-n" }, Mt = { class: "mm-stat" }, Dt = { class: "mm-stat-ico" }, Ft = { class: "mm-stat-n" }, Bt = {
  class: "mm-tabs",
  role: "tablist"
}, Pt = {
  key: 0,
  class: "mm-chip conflict"
}, jt = {
  key: 0,
  class: "mm-chip failed"
}, Ot = {
  key: 0,
  class: "mm-notice error"
}, Wt = { class: "mm-filters" }, qt = ["onClick"], zt = ["onClick"], Ht = { class: "mm-split" }, Jt = { class: "mm-card" }, Zt = {
  key: 0,
  class: "mm-empty"
}, Gt = {
  key: 1,
  class: "mm-empty"
}, Qt = {
  key: 2,
  class: "mm-list"
}, Xt = ["onClick"], Yt = { class: "mm-row-ico" }, te = { class: "mm-row-t" }, ee = { class: "mm-row-s" }, se = { class: "mm-chip" }, ne = { class: "mm-chip" }, oe = {
  key: 0,
  class: "mm-card"
}, le = { class: "mm-card-h" }, ie = { class: "mm-card-b" }, ae = { key: 0 }, de = {
  class: "mm-actions",
  style: { "margin-top": "8px" }
}, re = ["disabled"], ue = {
  key: 1,
  class: "mm-row-t"
}, me = { class: "mm-dl" }, ce = { key: 0 }, ve = { key: 1 }, pe = { class: "mm-actions" }, ye = ["disabled"], fe = ["disabled"], be = {
  key: 2,
  class: "mm-hint"
}, _e = {
  key: 1,
  class: "mm-card"
}, ke = { class: "mm-card-b" }, ge = { class: "mm-grid2" }, he = { class: "mm-field" }, Ce = { class: "mm-field" }, we = { class: "mm-field" }, $e = { class: "mm-field" }, Se = { class: "mm-actions" }, Ae = ["disabled"], Ue = {
  key: 2,
  class: "mm-card"
}, Ie = {
  key: 0,
  class: "mm-empty"
}, Ve = { class: "mm-row-t" }, Ne = { class: "mm-row-s" }, Re = { class: "mm-chip" }, xe = ["disabled", "onClick"], Te = {
  key: 3,
  class: "mm-card"
}, Le = {
  key: 0,
  class: "mm-empty"
}, Ee = {
  key: 1,
  class: "mm-list"
}, Ke = { class: "mm-row-ico" }, Me = { class: "mm-row-t" }, De = { class: "mm-row-s" }, Fe = { key: 0 }, Be = { key: 1 }, Pe = { key: 2 }, je = {
  key: 0,
  class: "mm-row-s",
  style: { color: "var(--mm-danger)" }
}, Oe = {
  key: 4,
  class: "mm-card"
}, We = { class: "mm-card-b" }, qe = { class: "mm-hint" }, ze = { class: "mm-actions" }, He = ["disabled"], Je = { class: "mm-hint" }, Ze = /* @__PURE__ */ bt({
  __name: "MemoryManage",
  setup(et) {
    const st = pt(), M = R(() => {
      const n = st.value.config;
      if (typeof n == "string")
        try {
          return String(JSON.parse(n).kb_id || "");
        } catch {
          return "";
        }
      return String(n?.kb_id || "");
    }), _ = R(() => `/api/v1/memory/${encodeURIComponent(M.value)}`), y = m("memories"), S = m(null), x = m([]), T = m([]), a = m(null), O = m([]), J = m([]), W = m(!1), A = m(""), h = m(""), nt = ["identity", "rule", "profile_slot", "preference", "fact", "skill", "lesson"], ot = ["current", "conflict", "superseded", "forgotten"], U = m(""), I = m("current"), k = m(""), p = m({ kind: "rule", scope_id: "", key: "", content: "" }), C = m(""), D = m({}), Z = m("");
    async function lt() {
      const { data: n } = await b.get(`${_.value}/status`);
      S.value = n, D.value = { ...S.value?.config || {} };
    }
    async function G() {
      const n = new URLSearchParams({ limit: "200" });
      U.value && n.set("kind", U.value), I.value && n.set("status", I.value), k.value && n.set("scope_family", k.value);
      const { data: t } = await b.get(`${_.value}/items?${n.toString()}`);
      x.value = K(t) && Array.isArray(t.items) ? t.items : [], a.value && !x.value.some((s) => s.id === a.value?.id) && (a.value = null);
    }
    async function it() {
      const { data: n } = await b.get(`${_.value}/conflicts`);
      T.value = K(n) && Array.isArray(n.groups) ? n.groups : [];
    }
    let F = 0;
    async function q() {
      if (!M.value) return;
      const n = ++F;
      W.value = !0;
      try {
        await Promise.all([lt(), G(), it()]), a.value && await Q(a.value), n === F && (A.value = "");
      } catch (t) {
        n === F && (A.value = H(t));
      } finally {
        n === F && (W.value = !1);
      }
    }
    let V = null;
    tt(M, (n) => {
      if (V && V(), V = null, !n) return;
      const t = ht(`component.${n}`, () => {
        q();
      });
      V = typeof t == "function" ? t : null;
    }, { immediate: !0 }), _t(() => {
      V && V();
    }), yt(q), tt([U, I, k], () => {
      G().catch((n) => {
        A.value = H(n);
      });
    });
    async function Q(n) {
      a.value = n, C.value = "";
      const { data: t } = await b.get(`${_.value}/items/${encodeURIComponent(n.id)}`);
      K(t) && (K(t.item) && (a.value = t.item), O.value = Array.isArray(t.provenance) ? t.provenance : [], J.value = Array.isArray(t.versions) ? t.versions : []);
    }
    async function N(n, t) {
      h.value = n, A.value = "";
      try {
        await t(), await q();
      } catch (s) {
        A.value = H(s);
      } finally {
        h.value = "";
      }
    }
    function at(n) {
      N("forget", () => b.post(`${_.value}/items/${encodeURIComponent(n.id)}/forget`, { reason: "forgotten in the memory page" }));
    }
    function dt(n) {
      N("restore", () => b.post(`${_.value}/items/${encodeURIComponent(n.id)}/restore`, {}));
    }
    function rt(n) {
      const t = C.value.trim();
      t && N("edit", async () => {
        const { data: s } = await b.put(`${_.value}/items/${encodeURIComponent(n.id)}`, { content: t, value: t });
        K(s) && typeof s.item_id == "string" && (a.value = { ...n, id: s.item_id });
      });
    }
    function ut() {
      const n = p.value;
      !n.content.trim() || !n.scope_id.trim() || N("create", async () => {
        await b.post(`${_.value}/items`, {
          kind: n.kind,
          scope_family: "agent",
          scope_id: n.scope_id.trim(),
          key: n.key.trim() || n.content.trim(),
          content: n.content.trim()
        }), p.value = { ...n, key: "", content: "" };
      });
    }
    function mt(n, t) {
      N("resolve", () => b.post(`${_.value}/conflicts/${encodeURIComponent(n.group_id)}/resolve`, { winner_id: t.id }));
    }
    function ct() {
      N("settings", async () => {
        await b.put(`/api/v1/knowledge/${encodeURIComponent(M.value)}`, { config: D.value }), Z.value = "Saved.";
      });
    }
    const vt = R(() => !!a.value && (a.value.kind === "identity" || a.value.kind === "rule") && a.value.status === "current"), B = R(() => S.value?.counts), z = R(() => S.value?.runs || []), X = R(() => z.value.filter((n) => n.status === "failed").length);
    function Y(n) {
      return n.scope_family === "agent" ? `agent ${n.scope_id}` : n.scope_family === "owner" ? "user" : n.scope_family;
    }
    function L(n) {
      if (!n) return "";
      const t = Date.parse(n.includes("T") ? n : n.replace(" ", "T") + "Z");
      return Number.isFinite(t) ? new Date(t).toLocaleString() : n;
    }
    return (n, t) => (o(), l("div", At, [
      e("div", Ut, [
        e("div", It, [
          e("span", Vt, [
            r(d(u), { icon: "tabler:brain" })
          ]),
          e("div", null, [
            e("div", Nt, i(B.value?.current ?? 0), 1),
            t[18] || (t[18] = e("div", { class: "mm-stat-l" }, "current memories", -1))
          ])
        ]),
        e("div", Rt, [
          e("span", xt, [
            r(d(u), { icon: "tabler:history" })
          ]),
          e("div", null, [
            e("div", Tt, i(B.value?.superseded ?? 0), 1),
            t[19] || (t[19] = e("div", { class: "mm-stat-l" }, "earlier versions", -1))
          ])
        ]),
        e("div", Lt, [
          e("span", Et, [
            r(d(u), { icon: "tabler:alert-triangle" })
          ]),
          e("div", null, [
            e("div", Kt, i(B.value?.conflict_groups ?? 0), 1),
            t[20] || (t[20] = e("div", { class: "mm-stat-l" }, "conflicts to resolve", -1))
          ])
        ]),
        e("div", Mt, [
          e("span", Dt, [
            r(d(u), { icon: "tabler:eye-off" })
          ]),
          e("div", null, [
            e("div", Ft, i(B.value?.forgotten ?? 0), 1),
            t[21] || (t[21] = e("div", { class: "mm-stat-l" }, "forgotten", -1))
          ])
        ])
      ]),
      e("div", Bt, [
        e("button", {
          class: c(["mm-tab", { on: y.value === "memories" }]),
          role: "tab",
          onClick: t[0] || (t[0] = (s) => y.value = "memories")
        }, [
          r(d(u), { icon: "tabler:brain" }),
          t[22] || (t[22] = f("Memories", -1))
        ], 2),
        e("button", {
          class: c(["mm-tab", { on: y.value === "conflicts" }]),
          role: "tab",
          onClick: t[1] || (t[1] = (s) => y.value = "conflicts")
        }, [
          r(d(u), { icon: "tabler:git-compare" }),
          t[23] || (t[23] = f("Conflicts", -1)),
          T.value.length ? (o(), l("span", Pt, i(T.value.length), 1)) : v("", !0)
        ], 2),
        e("button", {
          class: c(["mm-tab", { on: y.value === "activity" }]),
          role: "tab",
          onClick: t[2] || (t[2] = (s) => y.value = "activity")
        }, [
          r(d(u), { icon: "tabler:activity" }),
          t[24] || (t[24] = f("Activity", -1)),
          X.value ? (o(), l("span", jt, i(X.value) + " failed", 1)) : v("", !0)
        ], 2),
        e("button", {
          class: c(["mm-tab", { on: y.value === "settings" }]),
          role: "tab",
          onClick: t[3] || (t[3] = (s) => y.value = "settings")
        }, [
          r(d(u), { icon: "tabler:settings" }),
          t[25] || (t[25] = f("Settings", -1))
        ], 2)
      ]),
      A.value ? (o(), l("div", Ot, [
        r(d(u), { icon: "tabler:alert-circle" }),
        e("span", null, i(A.value), 1)
      ])) : v("", !0),
      y.value === "memories" ? (o(), l(g, { key: 1 }, [
        e("div", Wt, [
          e("button", {
            class: c(["mm-chip-btn", { on: !U.value }]),
            onClick: t[4] || (t[4] = (s) => U.value = "")
          }, "All kinds", 2),
          (o(), l(g, null, $(nt, (s) => e("button", {
            key: s,
            class: c(["mm-chip-btn", { on: U.value === s }]),
            onClick: (w) => U.value = s
          }, i(d(j)[s]), 11, qt)), 64)),
          t[26] || (t[26] = e("span", { class: "mm-sep" }, null, -1)),
          (o(), l(g, null, $(ot, (s) => e("button", {
            key: s,
            class: c(["mm-chip-btn", { on: I.value === s }]),
            onClick: (w) => I.value = I.value === s ? "" : s
          }, i(s), 11, zt)), 64)),
          t[27] || (t[27] = e("span", { class: "mm-sep" }, null, -1)),
          e("button", {
            class: c(["mm-chip-btn", { on: k.value === "owner" }]),
            onClick: t[5] || (t[5] = (s) => k.value = k.value === "owner" ? "" : "owner")
          }, "About users", 2),
          e("button", {
            class: c(["mm-chip-btn", { on: k.value === "agent" }]),
            onClick: t[6] || (t[6] = (s) => k.value = k.value === "agent" ? "" : "agent")
          }, "Agent identity & rules", 2)
        ]),
        e("div", Ht, [
          e("div", Jt, [
            W.value && !x.value.length ? (o(), l("div", Zt, [
              r(d(u), {
                icon: "tabler:loader-2",
                class: "spin"
              })
            ])) : x.value.length ? (o(), l("div", Qt, [
              (o(!0), l(g, null, $(x.value, (s) => (o(), l("button", {
                key: s.id,
                class: c(["mm-row", { on: a.value?.id === s.id }]),
                onClick: (w) => Q(s)
              }, [
                e("span", Yt, [
                  r(d(u), {
                    icon: d(wt)[s.kind]
                  }, null, 8, ["icon"])
                ]),
                e("span", null, [
                  e("span", te, i(s.content), 1),
                  e("span", ee, [
                    e("span", se, i(d(j)[s.kind]), 1),
                    e("span", ne, i(Y(s)), 1),
                    e("span", null, i(s.key) + " · v" + i(s.version), 1)
                  ])
                ]),
                e("span", {
                  class: c(["mm-chip", s.status])
                }, i(s.status), 3)
              ], 10, Xt))), 128))
            ])) : (o(), l("div", Gt, [
              r(d(u), { icon: "tabler:brain" }),
              t[28] || (t[28] = e("span", null, "No memories match these filters.", -1))
            ]))
          ]),
          a.value ? (o(), l("div", oe, [
            e("div", le, [
              e("span", null, i(d(j)[a.value.kind]) + " · " + i(a.value.key), 1),
              e("span", {
                class: c(["mm-chip", a.value.status])
              }, i(a.value.status), 3)
            ]),
            e("div", ie, [
              C.value ? (o(), l("div", ae, [
                E(e("textarea", {
                  class: "mm-textarea",
                  "onUpdate:modelValue": t[7] || (t[7] = (s) => C.value = s),
                  name: "edit_content"
                }, null, 512), [
                  [P, C.value]
                ]),
                e("div", de, [
                  e("button", {
                    class: "mm-btn primary",
                    disabled: !!h.value,
                    onClick: t[8] || (t[8] = (s) => rt(a.value))
                  }, [
                    r(d(u), { icon: "tabler:check" }),
                    t[29] || (t[29] = f("Save new version", -1))
                  ], 8, re),
                  e("button", {
                    class: "mm-btn ghost",
                    onClick: t[9] || (t[9] = (s) => C.value = "")
                  }, "Cancel")
                ])
              ])) : (o(), l("div", ue, i(a.value.content), 1)),
              e("dl", me, [
                t[30] || (t[30] = e("dt", null, "Scope", -1)),
                e("dd", null, i(Y(a.value)), 1),
                t[31] || (t[31] = e("dt", null, "True since", -1)),
                e("dd", null, i(L(a.value.valid_at)), 1),
                a.value.invalid_at ? (o(), l("dt", ce, "Until")) : v("", !0),
                a.value.invalid_at ? (o(), l("dd", ve, i(L(a.value.invalid_at)), 1)) : v("", !0),
                t[32] || (t[32] = e("dt", null, "Learned", -1)),
                e("dd", null, i(L(a.value.recorded_at)) + " · " + i(a.value.source), 1)
              ]),
              e("div", pe, [
                vt.value && !C.value ? (o(), l("button", {
                  key: 0,
                  class: "mm-btn ghost",
                  onClick: t[10] || (t[10] = (s) => C.value = a.value.content)
                }, [
                  r(d(u), { icon: "tabler:pencil" }),
                  t[33] || (t[33] = f("Edit", -1))
                ])) : v("", !0),
                a.value.status !== "forgotten" ? (o(), l("button", {
                  key: 1,
                  class: "mm-btn danger",
                  disabled: !!h.value,
                  onClick: t[11] || (t[11] = (s) => at(a.value))
                }, [
                  r(d(u), { icon: "tabler:eye-off" }),
                  t[34] || (t[34] = f("Forget", -1))
                ], 8, ye)) : (o(), l("button", {
                  key: 2,
                  class: "mm-btn ghost",
                  disabled: !!h.value,
                  onClick: t[12] || (t[12] = (s) => dt(a.value))
                }, [
                  r(d(u), { icon: "tabler:restore" }),
                  t[35] || (t[35] = f("Restore", -1))
                ], 8, fe))
              ]),
              t[36] || (t[36] = e("p", { class: "mm-h" }, "Versions", -1)),
              (o(!0), l(g, null, $(J.value, (s) => (o(), l("div", {
                key: s.id,
                class: c(["mm-version", { past: s.status !== "current" }])
              }, [
                e("span", {
                  class: c(["mm-chip", s.status])
                }, "v" + i(s.version), 3),
                e("span", null, i(s.content), 1)
              ], 2))), 128)),
              t[37] || (t[37] = e("p", { class: "mm-h" }, "Seen in", -1)),
              O.value.length ? v("", !0) : (o(), l("div", be, "Added by a person or by consolidation.")),
              (o(!0), l(g, null, $(O.value, (s) => (o(), l("div", {
                key: s.host_kind + s.host_id + s.event_id,
                class: "mm-hint"
              }, i(s.host_kind) + " " + i(s.host_id) + " · message " + i(s.event_id), 1))), 128))
            ])
          ])) : (o(), l("div", _e, [
            t[45] || (t[45] = e("div", { class: "mm-card-h" }, "Add identity or rule", -1)),
            e("div", ke, [
              t[44] || (t[44] = e("span", { class: "mm-hint" }, "Agent identity and rules are part of the agent's instructions in every conversation.", -1)),
              e("div", ge, [
                e("label", he, [
                  t[39] || (t[39] = e("span", { class: "mm-label" }, "Kind", -1)),
                  E(e("select", {
                    class: "mm-select",
                    "onUpdate:modelValue": t[13] || (t[13] = (s) => p.value.kind = s),
                    name: "draft_kind"
                  }, [...t[38] || (t[38] = [
                    e("option", { value: "identity" }, "Identity", -1),
                    e("option", { value: "rule" }, "Rule", -1),
                    e("option", { value: "skill" }, "Skill", -1),
                    e("option", { value: "lesson" }, "Lesson", -1)
                  ])], 512), [
                    [kt, p.value.kind]
                  ])
                ]),
                e("label", Ce, [
                  t[40] || (t[40] = e("span", { class: "mm-label" }, "Agent id", -1)),
                  E(e("input", {
                    class: "mm-input",
                    "onUpdate:modelValue": t[14] || (t[14] = (s) => p.value.scope_id = s),
                    name: "draft_scope",
                    placeholder: "the agent this applies to"
                  }, null, 512), [
                    [P, p.value.scope_id]
                  ])
                ])
              ]),
              e("label", we, [
                t[41] || (t[41] = e("span", { class: "mm-label" }, "Topic", -1)),
                E(e("input", {
                  class: "mm-input",
                  "onUpdate:modelValue": t[15] || (t[15] = (s) => p.value.key = s),
                  name: "draft_key",
                  placeholder: "e.g. tone"
                }, null, 512), [
                  [P, p.value.key]
                ])
              ]),
              e("label", $e, [
                t[42] || (t[42] = e("span", { class: "mm-label" }, "Text", -1)),
                E(e("textarea", {
                  class: "mm-textarea",
                  "onUpdate:modelValue": t[16] || (t[16] = (s) => p.value.content = s),
                  name: "draft_content",
                  placeholder: "e.g. Answer in short bullet points."
                }, null, 512), [
                  [P, p.value.content]
                ])
              ]),
              e("div", Se, [
                e("button", {
                  class: "mm-btn primary",
                  disabled: !!h.value || !p.value.content.trim() || !p.value.scope_id.trim(),
                  onClick: ut
                }, [
                  r(d(u), { icon: "tabler:plus" }),
                  t[43] || (t[43] = f("Add", -1))
                ], 8, Ae)
              ])
            ])
          ]))
        ])
      ], 64)) : y.value === "conflicts" ? (o(), l("div", Ue, [
        T.value.length ? v("", !0) : (o(), l("div", Ie, [
          r(d(u), { icon: "tabler:circle-check" }),
          t[46] || (t[46] = e("span", null, "No conflicting memories.", -1))
        ])),
        (o(!0), l(g, null, $(T.value, (s) => (o(), l("div", {
          key: s.group_id,
          class: "mm-conflict"
        }, [
          t[48] || (t[48] = e("span", { class: "mm-hint" }, "These memories contradict each other. Keep the one that is right; the others become earlier versions.", -1)),
          (o(!0), l(g, null, $(s.items, (w) => (o(), l("div", {
            key: w.id,
            class: "mm-option"
          }, [
            e("div", null, [
              e("div", Ve, i(w.content), 1),
              e("div", Ne, [
                e("span", Re, i(d(j)[w.kind]), 1),
                e("span", null, i(L(w.valid_at)), 1)
              ])
            ]),
            e("button", {
              class: "mm-btn primary",
              disabled: !!h.value,
              onClick: (Xe) => mt(s, w)
            }, [
              r(d(u), { icon: "tabler:check" }),
              t[47] || (t[47] = f("Keep this", -1))
            ], 8, xe)
          ]))), 128))
        ]))), 128))
      ])) : y.value === "activity" ? (o(), l("div", Te, [
        z.value.length ? (o(), l("div", Ee, [
          (o(!0), l(g, null, $(z.value, (s) => (o(), l("div", {
            key: s.id,
            class: "mm-row",
            style: { cursor: "default" }
          }, [
            e("span", Ke, [
              r(d(u), {
                icon: s.run_type === "consolidate" ? "tabler:sparkles" : s.run_type === "reembed" ? "tabler:vector" : "tabler:message-plus"
              }, null, 8, ["icon"])
            ]),
            e("span", null, [
              e("span", Me, i(s.run_type === "derive" ? s.host_kind === "content" ? "Learned from content" : "Learned from a conversation" : s.run_type === "consolidate" ? "Consolidation" : "Re-embedding"), 1),
              e("span", De, [
                e("span", null, i(L(s.finished_at || s.started_at || s.created_at)), 1),
                s.stats?.added ? (o(), l("span", Fe, "+" + i(s.stats.added) + " new", 1)) : v("", !0),
                s.stats?.superseded ? (o(), l("span", Be, i(s.stats.superseded) + " updated", 1)) : v("", !0),
                s.stats?.conflicted ? (o(), l("span", Pe, i(s.stats.conflicted) + " conflicts", 1)) : v("", !0)
              ]),
              s.last_error ? (o(), l("span", je, i(s.last_error), 1)) : v("", !0)
            ]),
            e("span", {
              class: c(["mm-chip", s.status === "failed" ? "failed" : s.status === "succeeded" ? "current" : ""])
            }, i(s.status), 3)
          ]))), 128))
        ])) : (o(), l("div", Le, [
          r(d(u), { icon: "tabler:activity" }),
          t[49] || (t[49] = e("span", null, "Nothing captured yet.", -1))
        ]))
      ])) : (o(), l("div", Oe, [
        t[51] || (t[51] = e("div", { class: "mm-card-h" }, "Memory settings", -1)),
        e("div", We, [
          e("span", qe, "Embedding model: " + i(S.value?.embedding_model), 1),
          S.value ? (o(), gt($t, {
            key: 0,
            schema: S.value.config_schema,
            modelValue: D.value,
            "onUpdate:modelValue": t[17] || (t[17] = (s) => D.value = s)
          }, null, 8, ["schema", "modelValue"])) : v("", !0),
          e("div", ze, [
            e("button", {
              class: "mm-btn primary",
              disabled: !!h.value,
              onClick: ct
            }, [
              r(d(u), { icon: "tabler:device-floppy" }),
              t[50] || (t[50] = f("Save settings", -1))
            ], 8, He),
            e("span", Je, i(Z.value), 1)
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
class Qe extends ft {
  static get wippyConfig() {
    return { propsSchema: Ge, hostCssKeys: ["themeConfigUrl"], inlineCss: St };
  }
  static get vueConfig() {
    return { rootComponent: Ze };
  }
}
Ct(import.meta.url, Qe);
//# sourceMappingURL=memory_kb.js.map
