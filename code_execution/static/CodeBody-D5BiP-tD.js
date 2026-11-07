import { defineComponent as se, ref as i, computed as D, watch as P, onMounted as ae, openBlock as a, createElementBlock as n, createElementVNode as t, createVNode as m, unref as d, createTextVNode as w, createBlock as q, toDisplayString as p, normalizeClass as le, Fragment as M, renderList as z, createCommentVNode as x } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as F, host as re, loadByTagName as ne } from "@wippy-fe/proxy";
import { a as ie, u as ce } from "./wc-runtime-CNDpK4lj.js";
function U(c, l) {
  if (c && typeof c == "object") {
    const s = c;
    s.response?.status === 401 && re.handleError("auth-expired", s);
  }
  if (c && typeof c == "object") {
    const s = c, h = s.response?.data?.error;
    if (typeof h == "string" && h.trim()) return h;
    if (typeof s.message == "string" && s.message.trim()) return s.message;
  }
  return l;
}
async function ue(c) {
  try {
    const l = [];
    let s;
    do {
      const h = new URLSearchParams({ tool_ids: c.join(","), fields: "*", limit: "100" });
      s && h.set("cursor", s);
      const { data: b } = await F.get(`/api/v1/code-execution/sdk-reference?${h}`);
      if (b?.success === !1) throw new Error(b.error || "failed to load SDK reference");
      l.push(...b.tools), s = b.next_cursor;
    } while (s);
    return { tools: l };
  } catch (l) {
    throw new Error(U(l, "could not load SDK reference"));
  }
}
async function de(c) {
  try {
    const { data: l } = await F.post("/api/v1/code-execution/assist", c);
    if (l && l.success === !1) throw new Error(l.error || "could not generate code");
    const s = l || {};
    return {
      code: typeof s.code == "string" ? s.code : void 0,
      validated: s.validated === !0,
      errors: Array.isArray(s.errors) ? s.errors.map(String) : void 0
    };
  } catch (l) {
    throw new Error(U(l, "could not generate code"));
  }
}
const ve = { class: "ce ce-body" }, pe = { class: "kx-field" }, he = { class: "ce-label" }, fe = ["value"], ye = { class: "ce-assist-row" }, me = ["disabled"], ge = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, be = {
  key: 1,
  class: "ce-assist-result",
  "aria-live": "polite"
}, ke = {
  key: 0,
  class: "ce-errors"
}, _e = { key: 0 }, we = { class: "kx-field" }, xe = ["value"], Se = { class: "kx-field" }, Ce = ["value"], Ee = { class: "kx-field" }, Ne = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, Ie = ["selected"], Te = { class: "ce-disclosure-body" }, Oe = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, De = {
  key: 1,
  class: "ce-note",
  "aria-live": "polite"
}, Le = {
  key: 2,
  class: "ce-empty"
}, Be = {
  key: 0,
  class: "ce-sdk-group"
}, je = {
  class: "ce-list",
  "aria-label": "Callable tools"
}, Ae = { class: "ce-disclosure" }, Je = { class: "ce-sig" }, Me = { class: "ce-disclosure-body" }, Ke = {
  key: 0,
  class: "ce-tool-desc"
}, Re = { class: "ce-schema-grid" }, Ve = { class: "ce-schema-section" }, $e = ["aria-label"], Ge = { class: "ce-schema-section" }, Pe = ["aria-label"], We = /* @__PURE__ */ se({
  __name: "CodeBody",
  setup(c) {
    const l = ie(), s = ce();
    function h(e) {
      return e && typeof e == "object" && typeof e.code == "string" ? e.code : "";
    }
    function b(e) {
      return e && typeof e == "object" && typeof e.method == "string" ? e.method : "";
    }
    function K(e) {
      return !e || typeof e != "object" || !Array.isArray(e.tool_ids) ? [] : [...new Set(e.tool_ids.map(String).map((o) => o.trim()).filter(Boolean))];
    }
    const f = i(h(l.value.config)), y = i(b(l.value.config)), u = i(K(l.value.config)), W = D(() => JSON.stringify(u.value));
    let L = f.value, B = y.value, j = JSON.stringify(u.value);
    P(() => l.value.config, (e) => {
      const o = h(e), r = b(e), _ = K(e);
      o !== f.value && (f.value = o), r !== y.value && (y.value = r), JSON.stringify(_) !== JSON.stringify(u.value) && (u.value = _), L = o, B = r, j = JSON.stringify(_);
    });
    function H() {
      return {
        code: f.value,
        ...u.value.length ? { tool_ids: [...u.value] } : {},
        ...y.value !== "" ? { method: y.value } : {}
      };
    }
    function N() {
      const e = JSON.stringify(u.value);
      f.value === L && y.value === B && e === j || (L = f.value, B = y.value, j = e, s("config-changed", H()));
    }
    function Q(e) {
      f.value = e.target.value, N();
    }
    function X(e) {
      y.value = e.target.value.trim(), N();
    }
    function Y(e) {
      const o = e.detail, r = o && Array.isArray(o.selected) ? o.selected : [];
      u.value = [...new Set(r.map(String).map((_) => _.trim()).filter(Boolean))], N();
    }
    const I = i(""), S = i(!1), C = i(""), g = i(null), R = D(() => I.value.trim().length > 0 && !S.value), V = D(() => g.value?.errors || []);
    async function $() {
      if (R.value) {
        S.value = !0, C.value = "", g.value = null;
        try {
          const e = await de({ intent: I.value.trim(), tool_ids: u.value });
          g.value = e, e.validated && typeof e.code == "string" && (f.value = e.code, N());
        } catch (e) {
          C.value = e instanceof Error ? e.message : "could not generate code", s("error", { message: C.value, error: e });
        } finally {
          S.value = !1;
        }
      }
    }
    const k = i(null), T = i(!1), E = i(""), A = i(!1), Z = D(() => !!k.value && k.value.tools.length === 0);
    async function J() {
      T.value = !0, E.value = "";
      try {
        k.value = await ue(u.value);
      } catch (e) {
        E.value = e instanceof Error ? e.message : "could not load SDK reference", s("error", { message: E.value, error: e });
      } finally {
        T.value = !1;
      }
    }
    function ee(e) {
      A.value = e.target.open, A.value && !k.value && !T.value && J();
    }
    function te() {
      J();
    }
    P(u, () => {
      A.value && J();
    });
    function G(e, o) {
      return !e || Object.keys(e).length === 0 ? o === "input" ? "No input schema — takes no arguments." : "No output schema declared." : JSON.stringify(e, null, 2);
    }
    function oe(e) {
      return e.call || `sdk.tools["${e.id}"](args)`;
    }
    const O = i("");
    return ae(async () => {
      try {
        await ne("wc-multiselect", { timeoutMs: 8e3 });
      } catch (e) {
        O.value = "The tool picker could not be loaded.", s("error", { message: O.value, error: e });
      }
    }), (e, o) => (a(), n("div", ve, [
      t("div", pe, [
        t("span", he, [
          m(d(v), {
            icon: "tabler:sparkles",
            "aria-hidden": "true"
          }),
          o[1] || (o[1] = w(" What should this code do? ", -1))
        ]),
        t("textarea", {
          class: "kx-input kx-textarea ce-intent",
          value: I.value,
          rows: "3",
          "aria-label": "Describe what the code should do",
          placeholder: "Describe it in plain language — e.g. send a message to my inbox saying hi.",
          onInput: o[0] || (o[0] = (r) => {
            I.value = r.target.value;
          })
        }, null, 40, fe),
        t("div", ye, [
          t("button", {
            type: "button",
            class: "kx-btn kx-btn-primary",
            disabled: !R.value,
            onClick: $
          }, [
            S.value ? (a(), q(d(v), {
              key: 1,
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            })) : (a(), q(d(v), {
              key: 0,
              icon: "tabler:wand",
              "aria-hidden": "true"
            })),
            w(" " + p(S.value ? "Generating…" : "Generate"), 1)
          ], 8, me),
          o[2] || (o[2] = t("span", { class: "ce-hint" }, "Drafts Lua against the allowed tools and validates it in a sandbox dry-run.", -1))
        ]),
        C.value ? (a(), n("div", ge, [
          m(d(v), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          t("span", null, p(C.value), 1),
          t("button", {
            type: "button",
            class: "ce-retry",
            onClick: $
          }, "Retry")
        ])) : g.value ? (a(), n("div", be, [
          t("span", {
            class: le(["ce-status", g.value.validated ? "ok" : "bad"])
          }, [
            m(d(v), {
              icon: g.value.validated ? "tabler:circle-check" : "tabler:alert-triangle",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            w(" " + p(g.value.validated ? "Validated — the code is ready below." : "Not validated — nothing was filled in."), 1)
          ], 2),
          g.value.validated ? x("", !0) : (a(), n("ul", ke, [
            (a(!0), n(M, null, z(V.value, (r, _) => (a(), n("li", { key: _ }, p(r), 1))), 128)),
            V.value.length ? x("", !0) : (a(), n("li", _e, "The generator could not produce validated code."))
          ]))
        ])) : x("", !0)
      ]),
      t("label", we, [
        o[3] || (o[3] = t("span", { class: "ce-sublabel" }, "Code", -1)),
        t("textarea", {
          class: "ce-code",
          value: f.value,
          spellcheck: "false",
          autocapitalize: "off",
          autocomplete: "off",
          autocorrect: "off",
          wrap: "off",
          rows: "12",
          "aria-label": "Lua code to run",
          placeholder: `-- Lua run by this Block
local res, err = sdk.tools["namespace:tool_id"]({ query = '...' })
if err then error(err) end
return res`,
          onInput: Q
        }, null, 40, xe),
        o[4] || (o[4] = t("span", { class: "ce-hint" }, [
          w("The Lua this Block runs, as the current user. It reaches tools through the "),
          t("code", null, "sdk"),
          w(" import — see the SDK reference below.")
        ], -1))
      ]),
      t("label", Se, [
        o[5] || (o[5] = t("span", { class: "ce-sublabel" }, [
          w("Exported method "),
          t("span", { class: "ce-optional" }, "optional")
        ], -1)),
        t("input", {
          class: "kx-input ce-method",
          value: y.value,
          autocomplete: "off",
          spellcheck: "false",
          placeholder: "Leave empty to use the chunk result",
          onInput: X
        }, null, 40, Ce),
        o[6] || (o[6] = t("span", { class: "ce-hint" }, "Invoke this exported function after loading the Lua chunk.", -1))
      ]),
      t("div", Ee, [
        o[7] || (o[7] = t("span", { class: "ce-sublabel" }, "Allowed tools", -1)),
        O.value ? (a(), n("div", Ne, [
          m(d(v), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          t("span", null, p(O.value), 1)
        ])) : (a(), n("wc-multiselect", {
          key: 1,
          class: "ce-tool-picker",
          source: "/api/v1/code-execution/sdk-reference",
          "response-key": "tools",
          "id-key": "id",
          "label-key": "label",
          "desc-key": "description",
          selected: W.value,
          multi: !0,
          placeholder: "Search tools…",
          onChange: Y
        }, null, 40, Ie)),
        o[8] || (o[8] = t("span", { class: "ce-hint" }, "Select a restricted tool surface, or leave this empty to allow every tool the current user can reach.", -1))
      ]),
      t("details", {
        class: "ce-disclosure ce-sdk",
        onToggle: ee
      }, [
        t("summary", null, [
          m(d(v), {
            class: "ce-caret",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          }),
          m(d(v), {
            class: "ce-tool-icon",
            icon: "tabler:code",
            "aria-hidden": "true"
          }),
          o[9] || (o[9] = t("span", { class: "ce-tool-title" }, "SDK reference", -1)),
          o[10] || (o[10] = t("span", { class: "ce-schema-badge" }, "what you can call", -1))
        ]),
        t("div", Te, [
          E.value ? (a(), n("div", Oe, [
            m(d(v), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            }),
            t("span", null, p(E.value), 1),
            t("button", {
              type: "button",
              class: "ce-retry",
              onClick: te
            }, "Retry")
          ])) : T.value ? (a(), n("div", De, [
            m(d(v), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            o[11] || (o[11] = t("span", null, "Loading SDK reference…", -1))
          ])) : Z.value ? (a(), n("p", Le, "Nothing reachable for the current selection.")) : k.value ? (a(), n(M, { key: 3 }, [
            k.value.tools.length ? (a(), n("div", Be, [
              o[14] || (o[14] = t("span", { class: "ce-sublabel" }, "Tools", -1)),
              t("ul", je, [
                (a(!0), n(M, null, z(k.value.tools, (r) => (a(), n("li", {
                  key: r.id
                }, [
                  t("details", Ae, [
                    t("summary", null, [
                      m(d(v), {
                        class: "ce-caret",
                        icon: "tabler:chevron-right",
                        "aria-hidden": "true"
                      }),
                      t("code", Je, p(oe(r)), 1)
                    ]),
                    t("div", Me, [
                      r.description ? (a(), n("p", Ke, p(r.description), 1)) : x("", !0),
                      t("div", Re, [
                        t("section", Ve, [
                          o[12] || (o[12] = t("span", { class: "ce-schema-label" }, "Input schema", -1)),
                          t("pre", {
                            class: "ce-schema",
                            "aria-label": `Input schema for ${r.label}`
                          }, p(G(r.input_schema, "input")), 9, $e)
                        ]),
                        t("section", Ge, [
                          o[13] || (o[13] = t("span", { class: "ce-schema-label" }, "Output schema", -1)),
                          t("pre", {
                            class: "ce-schema",
                            "aria-label": `Output schema for ${r.label}`
                          }, p(G(r.output_schema, "output")), 9, Pe)
                        ])
                      ])
                    ])
                  ])
                ]))), 128))
              ])
            ])) : x("", !0)
          ], 64)) : x("", !0)
        ])
      ], 32)
    ]));
  }
});
export {
  We as default
};
