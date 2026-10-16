import { ref as x, inject as T, createApp as J, defineComponent as Z, computed as V, openBlock as b, createElementBlock as y, withModifiers as q, createElementVNode as s, createStaticVNode as Q, toDisplayString as w, createTextVNode as S, createCommentVNode as _, withDirectives as A, vModelText as X, vModelDynamic as rr, Fragment as er, renderList as tr } from "vue";
import { addCollection as or } from "@iconify/vue";
import { config as L, addIcons as ir, on as ar, applyThemeMode as E, host as sr, hostCss as nr, loadCss as pr, api as I, define as cr } from "@wippy-fe/proxy";
import { getActivePinia as lr, createPinia as ur, setActivePinia as dr } from "pinia";
var P = "data-wippy-visible";
function N(r) {
  const e = r.getAttribute(P);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var hr = Object.defineProperty, vr = (r, e, t) => e in r ? hr(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, h = (r, e, t) => vr(r, typeof e != "symbol" ? e + "" : e, t), fr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], mr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function O(r) {
  const e = r.startsWith("--") ? r : `--${r}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function gr(...r) {
  const e = /* @__PURE__ */ new Set();
  for (const t of r)
    if (t)
      for (const [o, a] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && a && typeof a == "object") {
          for (const [u, d] of Object.entries(a)) {
            const c = typeof d == "string" ? O(u) : null;
            c && e.add(c);
          }
          continue;
        }
        const p = typeof a == "string" ? O(o) : null;
        p && e.add(p);
      }
  return [...e].sort();
}
function br(r) {
  if (r.length === 0)
    return "";
  const e = r.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${mr} {
${e}
}`;
}
function yr(r, e) {
  const t = br(e);
  t && z(r, t, "@wippy-fe/css-variables-bridge");
}
function xr(r, e) {
  const o = (e ?? fr).map(async (a) => {
    const p = nr[a];
    if (!p)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${a}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await pr(p);
    } catch (u) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${a}" (${p}):`, u), null;
    }
  });
  return Promise.all(o).then((a) => {
    for (const p of a) {
      if (!p)
        continue;
      const u = document.createElement("style");
      u.textContent = p, u.setAttribute("role", "@wippy-fe/host-css"), r.appendChild(u);
    }
  });
}
function wr(r, e) {
  const t = document.createElement("style");
  t.textContent = e, r.appendChild(t);
}
function z(r, e, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const a = new CSSStyleSheet();
    a.replaceSync(e), r.adoptedStyleSheets = [...r.adoptedStyleSheets, a];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = e, r.appendChild(o);
}
function _r(r, e) {
  z(r, e, "@wippy-fe/custom-css");
}
function F(r) {
  return r.__wippyHost ?? null;
}
function kr(r) {
  return r.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function Cr(r, e, t) {
  switch (t.type) {
    case "string":
      return { value: e };
    case "number": {
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${r}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${r}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function R(r, e) {
  const t = {}, o = [];
  for (const [a, p] of Object.entries(e.properties)) {
    const u = r.getAttribute(a), d = kr(a);
    if (u === null) {
      p.default !== void 0 && (t[d] = p.default);
      continue;
    }
    const c = Cr(a, u, p);
    c.error ? o.push(c.error) : t[d] = c.value;
  }
  return { props: t, errors: o };
}
var Sr = class {
  constructor(r, e) {
    h(this, "_props"), h(this, "_errors"), h(this, "_content"), h(this, "_hostVisibility"), h(this, "_propsListeners", /* @__PURE__ */ new Set()), h(this, "_contentListeners", /* @__PURE__ */ new Set()), h(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), h(this, "_disposed", !1), h(this, "_emitToDom"), h(this, "props"), h(this, "events"), h(this, "content"), h(this, "hostVisibility"), this._props = r.props, this._errors = r.errors, this._content = r.content, this._hostVisibility = r.hostVisibility, this._emitToDom = e;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(o, a) {
        return t._subscribeProps(o, a);
      }
    }, this.events = {
      emit(o, a) {
        t._disposed || t._emitToDom(o, a);
      }
    }, this.content = r.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, a) {
        return t._subscribeContent(o, a);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, a) {
        return t._subscribeHostVisibility(o, a);
      }
    };
  }
  /** @internal */
  notifyProps(r, e) {
    if (!this._disposed) {
      this._props = r, this._errors = e;
      for (const t of this._propsListeners)
        t(r, e);
    }
  }
  /** @internal */
  notifyContent(r) {
    if (!this._disposed) {
      this._content = r;
      for (const e of this._contentListeners)
        e(r);
    }
  }
  /** @internal */
  notifyHostVisibility(r, e) {
    if (!(this._disposed || r === e)) {
      this._hostVisibility = r;
      for (const t of this._hostVisibilityListeners)
        t(r, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(r), e?.immediate && r(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(r), e?.immediate && r(this._content);
    const t = () => {
      this._contentListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(r), e?.immediate && r(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, Er = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = N(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const r = this.wippyConfig, e = Object.keys(r.propsSchema.properties), t = r.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...t, P])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return F(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(r, e) {
    this.dispatchEvent(new CustomEvent(r, {
      bubbles: !0,
      composed: !0,
      detail: e
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const r = this.constructor.wippyConfig, e = !!r.contentTemplate;
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const p = R(this, r.propsSchema);
        r.validateProps && p.errors.push(...r.validateProps(p.props)), t = p.props, o = p.errors, this._lastProps = t, this._lastErrors = o;
      }
      const a = e ? this._lastContent ?? this._extractContent(r.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = a), this._reactive = new Sr(
        { props: t, errors: o, content: a, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const r = this.constructor.wippyConfig, e = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: r.shadowMode ?? "open" });
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(t), r.inlineCss && wr(t, r.inlineCss);
        try {
          const n = L?.theming, f = gr(
            n?.global?.cssVariables,
            n?.children?.cssVariables
          );
          yr(t, f);
        } catch {
        }
        if (r.customCss !== !1)
          try {
            const n = L?.theming, f = [n?.global?.customCSS, n?.children?.customCSS].filter(Boolean).join(`
`);
            f && _r(t, f);
          } catch {
          }
        (r.hostCssKeys === void 0 || r.hostCssKeys.length > 0) && xr(t, r.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const c = r.containerClasses ?? [];
        c.length > 0 && o.classList.add(...c), t.appendChild(o), this._container = o, ir(or);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ar("@theme", (c) => this._applyTheme(c)));
      const { props: a, errors: p } = R(this, r.propsSchema);
      r.validateProps && p.push(...r.validateProps(a));
      const u = a;
      this._lastProps = u, this._lastErrors = p;
      let d = null;
      r.contentTemplate && (d = this._extractContent(r.contentTemplate), this._lastContent = d, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(r.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, u, p, d, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (r) {
      this.onError(r), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: r instanceof Error ? r.message : String(r),
        error: r
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(r = sr.getThemeMode?.()) {
    E(r, this), this._container && E(r, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), E("auto", this), this._container && E("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(r, e, t) {
    if (e === t)
      return;
    if (r === P) {
      const d = this._hostVisible, c = N(this);
      if (c === d)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, d), this.onHostVisibilityChanged(c, d));
      return;
    }
    const o = this.constructor.wippyConfig, { props: a, errors: p } = R(this, o.propsSchema);
    o.validateProps && p.push(...o.validateProps(a));
    const u = a;
    this._lastProps = u, this._lastErrors = p, this._reactive?.notifyProps(u, p), this.onPropsChanged(u, p);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(r) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(r) {
    console.error(`${this.constructor.name} initialization failed:`, r);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(r, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(r, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(r) {
    return this.querySelector(`template[data-type="${r}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(r) {
  }
};
function Vr(r) {
  return r.__wippyHostBus ?? null;
}
function Ir(r) {
  return r.dataset.wippyPanelId ?? null;
}
var Rr = Object.defineProperty, Pr = (r, e, t) => e in r ? Rr(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, k = (r, e, t) => Pr(r, typeof e != "symbol" ? e + "" : e, t), $ = /* @__PURE__ */ Symbol("wippy:emit"), D = /* @__PURE__ */ Symbol("wippy:props"), Ar = /* @__PURE__ */ Symbol("wippy:props_error"), Lr = /* @__PURE__ */ Symbol("wippy:content"), Nr = /* @__PURE__ */ Symbol("wippy:panel-id"), Or = /* @__PURE__ */ Symbol("wippy:layout-bus"), Tr = /* @__PURE__ */ Symbol("wippy:host"), zr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Fr() {
  const r = T(D);
  if (!r)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return r;
}
function $r() {
  const r = T($);
  if (!r)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return r;
}
var Dr = class extends Er {
  constructor() {
    super(...arguments), k(this, "_vueApp", null), k(this, "_propsRef", x({})), k(this, "_errorsRef", x([])), k(this, "_contentRef", x(null)), k(this, "_hostVisibilityRef", x(null)), k(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(r, e, t, o, a, p) {
    const u = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = a ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const n of o)
      this.emitEvent("invalid", { message: n });
    const d = new AbortController();
    this._bridgeAbort = d, this.reactive.props.subscribe((n, f) => {
      this._propsRef.value = n, this._errorsRef.value = [...f];
      for (const v of f)
        this.emitEvent("invalid", { message: v });
    }, { signal: d.signal }), this.reactive.content && this.reactive.content.subscribe((n) => {
      this._contentRef.value = n;
    }, { signal: d.signal }), this.reactive.hostVisibility.subscribe((n) => {
      this._hostVisibilityRef.value = n;
    }, { signal: d.signal });
    const c = (n) => {
      if (d.signal.aborted)
        return;
      const f = lr(), v = J(n.rootComponent);
      this._vueApp = v;
      const m = ur();
      if (n.piniaPlugins)
        for (const C of n.piniaPlugins)
          m.use(C);
      if (v.use(m), n.plugins)
        for (const C of n.plugins)
          v.use(C);
      v.provide(D, this._propsRef), v.provide(Ar, this._errorsRef), v.provide($, this.emitEvent.bind(this)), v.provide(Lr, this._contentRef), v.provide(zr, this._hostVisibilityRef), v.provide(Nr, Ir(this)), v.provide(Or, Vr(this)), v.provide(Tr, F(this)), n.providers && n.providers(v, this), v.mount(e), f && dr(f);
    };
    if (u.rootComponent)
      c(u);
    else if (u.lazyConfig) {
      const n = document.createElement("wippy-loading");
      n.setAttribute("no-bg", ""), e.appendChild(n), u.lazyConfig().then((f) => {
        d.signal.aborted || (n.remove(), c(f));
      }).catch((f) => {
        if (d.signal.aborted)
          return;
        const v = f instanceof Error ? f.message : String(f), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", v), n.replaceWith(m), this.emitEvent("error", { message: v });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Mr = { class: "sf-intro" }, Ur = { class: "sf-intro-text" }, jr = {
  key: 0,
  class: "sf-steps"
}, Br = {
  key: 1,
  class: "sf-field"
}, Hr = {
  key: 2,
  class: "sf-field"
}, Wr = { class: "sf-secret" }, Kr = ["type"], Yr = ["aria-label"], Gr = {
  key: 3,
  class: "sf-note"
}, Jr = {
  key: 4,
  class: "sf-feedback error",
  role: "alert"
}, Zr = {
  key: 5,
  class: "sf-feedback success",
  role: "status"
}, qr = { style: { flex: "1", "min-width": "0" } }, Qr = {
  key: 0,
  class: "sf-accounts"
}, Xr = { class: "sf-account-name" }, re = { class: "sf-account-balance" }, ee = ["disabled"], te = {
  key: 0,
  class: "sf-spinner",
  "aria-hidden": "true"
}, oe = "kickside.simplefin.connection:simplefin_connection", ie = "https://bridge.simplefin.org", ae = /* @__PURE__ */ Z({
  __name: "Connect",
  setup(r) {
    const e = Fr(), t = $r(), o = x("SimpleFIN"), a = x(""), p = x(!1), u = x(!1), d = x(""), c = x(null), n = x("");
    function f() {
      t("connection-saved", { success: !0, component_id: n.value });
    }
    const v = V(() => String(e.value.componentId ?? "")), m = V(() => v.value !== ""), C = V(() => u.value ? m.value ? "Claiming new token…" : "Claiming token…" : m.value ? "Claim and replace credential" : "Claim and connect");
    function M(l) {
      const i = l?.response;
      return i?.data?.error ? i.data.error : l instanceof Error ? l.message : String(l);
    }
    function U() {
      return a.value.trim() ? "" : "Paste the setup token from SimpleFIN Bridge.";
    }
    async function j(l) {
      const { data: i } = await I.post(`/api/v1/connections/${encodeURIComponent(l)}/discover_resources`, {});
      if (!i?.success) throw new Error(i?.error || "The connection was created but its accounts could not be listed.");
      c.value = Array.isArray(i.resources) ? i.resources : [];
    }
    async function B() {
      const { data: l } = await I.post("/api/v1/connections", {
        impl_id: oe,
        name: o.value.trim() || "SimpleFIN",
        private_context: { setup_token: a.value.trim() },
        validate: !0
      });
      if (!l?.success) throw new Error(l?.error || "SimpleFIN did not accept the setup token.");
      return String(l.component_id);
    }
    async function H() {
      const { data: l } = await I.put(`/api/v1/simplefin/connections/${encodeURIComponent(v.value)}`, {
        setup_token: a.value.trim(),
        name: o.value.trim() || void 0
      });
      if (!l?.success) throw new Error(l?.error || "SimpleFIN did not accept the new setup token.");
      return String(l.component_id || v.value);
    }
    async function W() {
      if (d.value = U(), c.value = null, n.value = "", !d.value) {
        u.value = !0;
        try {
          const l = m.value ? await H() : await B();
          n.value = l, await j(l), a.value = "";
        } catch (l) {
          d.value = M(l), t("connection-saved", { success: !1, error: d.value });
        } finally {
          u.value = !1;
        }
      }
    }
    function K(l) {
      return l.metadata?.account_name || l.name;
    }
    function Y(l) {
      return l.metadata?.org?.name || l.metadata?.org?.domain || "";
    }
    function G(l) {
      const i = l.metadata;
      if (!i?.balance) return l.description || "";
      const g = Number(i.balance);
      return `${Number.isFinite(g) ? g.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : i.balance} ${i.currency || ""}`.trim();
    }
    return (l, i) => (b(), y("form", {
      class: "sf",
      "aria-label": "SimpleFIN connection",
      onSubmit: q(W, ["prevent"])
    }, [
      s("div", Mr, [
        i[5] || (i[5] = Q('<div class="sf-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6"></path><path d="M5 10v8"></path><path d="M10 10v8"></path><path d="M14 10v8"></path><path d="M19 10v8"></path><path d="M3 20h18"></path></svg></div>', 1)),
        s("div", Ur, [
          s("strong", null, w(m.value ? "Replace the SimpleFIN credential" : "Connect your bank feed through SimpleFIN"), 1),
          i[4] || (i[4] = s("small", null, "SimpleFIN Bridge links your banks once and hands out a one-time setup token. The token is claimed on the server and never stored; only the access it unlocks is kept, privately, on this connection.", -1))
        ])
      ]),
      n.value ? _("", !0) : (b(), y("ol", jr, [
        s("li", null, [
          i[6] || (i[6] = S("Sign in at ", -1)),
          s("a", {
            href: ie,
            target: "_blank",
            rel: "noopener"
          }, "bridge.simplefin.org"),
          i[7] || (i[7] = S(" and link your institutions.", -1))
        ]),
        i[8] || (i[8] = s("li", null, "Under My Account, Apps, create a new app and copy the setup token it shows once.", -1)),
        i[9] || (i[9] = s("li", null, "Paste it below. Claiming takes a moment; then your accounts appear here.", -1))
      ])),
      !m.value && !n.value ? (b(), y("label", Br, [
        i[10] || (i[10] = s("span", null, "Connection name", -1)),
        A(s("input", {
          "onUpdate:modelValue": i[0] || (i[0] = (g) => o.value = g),
          class: "sf-input",
          autocomplete: "off",
          placeholder: "SimpleFIN"
        }, null, 512), [
          [X, o.value]
        ])
      ])) : _("", !0),
      n.value ? _("", !0) : (b(), y("label", Hr, [
        i[11] || (i[11] = s("span", null, [
          S("Setup token "),
          s("em", null, "Required")
        ], -1)),
        s("span", Wr, [
          A(s("input", {
            "onUpdate:modelValue": i[1] || (i[1] = (g) => a.value = g),
            class: "sf-input",
            type: p.value ? "text" : "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0v…",
            onInput: i[2] || (i[2] = (g) => d.value = "")
          }, null, 40, Kr), [
            [rr, a.value]
          ]),
          s("button", {
            type: "button",
            class: "sf-reveal",
            "aria-label": p.value ? "Hide token" : "Show token",
            onClick: i[3] || (i[3] = (g) => p.value = !p.value)
          }, w(p.value ? "Hide" : "Show"), 9, Yr)
        ]),
        i[12] || (i[12] = s("small", null, "A setup token works exactly once. If it was already used, create a new one at the bridge.", -1))
      ])),
      n.value ? _("", !0) : (b(), y("p", Gr, [...i[13] || (i[13] = [
        s("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          s("rect", {
            x: "5",
            y: "11",
            width: "14",
            height: "10",
            rx: "2"
          }),
          s("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" })
        ], -1),
        s("span", null, "Read-only. SimpleFIN cannot move money, and the credential stays in this connection's private context, never in agent prompts.", -1)
      ])])),
      d.value ? (b(), y("div", Jr, [
        i[15] || (i[15] = s("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          s("circle", {
            cx: "12",
            cy: "12",
            r: "9"
          }),
          s("path", { d: "M12 8v4" }),
          s("path", { d: "M12 16h.01" })
        ], -1)),
        s("div", null, [
          i[14] || (i[14] = s("strong", null, "Could not connect", -1)),
          s("small", null, w(d.value), 1)
        ])
      ])) : _("", !0),
      c.value ? (b(), y("div", Zr, [
        i[16] || (i[16] = s("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2.2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "aria-hidden": "true"
        }, [
          s("path", { d: "M5 12l5 5 9-10" })
        ], -1)),
        s("div", qr, [
          s("strong", null, w(m.value ? "Credential replaced" : "Connected"), 1),
          s("small", null, w(c.value.length === 0 ? "The bridge shares no accounts yet. Link an institution at bridge.simplefin.org and adjust which accounts it shares." : `${c.value.length} account${c.value.length === 1 ? "" : "s"} shared by the bridge. Sources and the SimpleFIN Reader trait can use this connection now.`), 1),
          c.value.length ? (b(), y("ul", Qr, [
            (b(!0), y(er, null, tr(c.value, (g) => (b(), y("li", {
              key: g.id,
              class: "sf-account"
            }, [
              s("div", Xr, [
                s("span", null, w(K(g)), 1),
                s("small", null, w(Y(g)), 1)
              ]),
              s("span", re, w(G(g)), 1)
            ]))), 128))
          ])) : _("", !0)
        ])
      ])) : _("", !0),
      n.value ? (b(), y("button", {
        key: 6,
        class: "sf-submit",
        type: "button",
        onClick: f
      }, "Done")) : (b(), y("button", {
        key: 7,
        class: "sf-submit",
        type: "submit",
        disabled: u.value
      }, [
        u.value ? (b(), y("span", te)) : _("", !0),
        S(" " + w(C.value), 1)
      ], 8, ee))
    ], 32));
  }
}), se = ":root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{display:block;min-height:0}*,*:before,*:after{box-sizing:border-box}.sf{display:flex;flex-direction:column;gap:16px;font-family:inherit;font-size:13.5px;line-height:1.45;color:var(--p-text-color)}.sf-intro{display:flex;align-items:flex-start;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--p-content-border-color)}.sf-mark{width:36px;height:36px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.sf-mark svg{width:20px;height:20px}.sf-intro-text{display:flex;flex-direction:column;gap:3px;min-width:0}.sf-intro-text strong{font-size:14px}.sf-intro-text small{color:var(--p-text-muted-color);font-size:12.5px}.sf-steps{margin:0;padding:0 0 0 18px;color:var(--p-text-muted-color);font-size:12.5px;display:flex;flex-direction:column;gap:3px}.sf-steps a{color:var(--p-primary-color);text-decoration:none}.sf-steps a:hover{text-decoration:underline}.sf-field{display:flex;flex-direction:column;gap:5px}.sf-field>span:first-child{display:flex;justify-content:space-between;font-weight:600;font-size:12.5px}.sf-field em{font-style:normal;font-weight:400;color:var(--p-text-muted-color);font-size:11.5px}.sf-field small{color:var(--p-text-muted-color);font-size:11.5px}.sf-input{width:100%;height:36px;padding:0 10px;font:inherit;color:var(--p-text-color);background:transparent;border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s ease,box-shadow .15s ease}.sf-input::placeholder{color:var(--p-text-muted-color)}.sf-input:focus{outline:none;border-color:var(--p-primary-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.sf-secret{position:relative;display:block}.sf-secret .sf-input{padding-right:58px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}.sf-reveal{position:absolute;top:50%;right:5px;transform:translateY(-50%);height:26px;padding:0 8px;border:none;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:600;cursor:pointer}.sf-reveal:focus-visible,.sf-submit:focus-visible{outline:2px solid var(--p-primary-color);outline-offset:2px}.sf-note{display:flex;gap:8px;align-items:flex-start;margin:0;padding:9px 11px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent);color:var(--p-text-muted-color);font-size:11.5px;line-height:1.4}.sf-note svg{width:14px;height:14px;flex:none;margin-top:1px;color:var(--p-primary-color)}.sf-feedback{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid;border-radius:10px}.sf-feedback strong{display:block;font-size:12.5px}.sf-feedback small{font-size:11.5px;line-height:1.4}.sf-feedback.error{border-color:color-mix(in srgb,var(--p-danger-600, var(--p-danger-500)) 35%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-600, var(--p-danger-500)) 7%,transparent)}.sf-feedback.error svg{color:var(--p-danger-600, var(--p-danger-500))}.sf-feedback.success{border-color:color-mix(in srgb,var(--p-primary-color) 35%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 7%,transparent)}.sf-feedback.success svg{color:var(--p-primary-color)}.sf-feedback svg{width:16px;height:16px;flex:none;margin-top:1px}.sf-accounts{list-style:none;margin:8px 0 0;padding:0;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.sf-account{display:flex;align-items:center;gap:10px;padding:8px 11px;font-size:12.5px}.sf-account+.sf-account{border-top:1px solid color-mix(in srgb,var(--p-content-border-color) 55%,transparent)}.sf-account-name{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.sf-account-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-account-name small{color:var(--p-text-muted-color);font-size:11px}.sf-account-balance{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}.sf-submit{width:100%;min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:13.5px;font-weight:600;color:var(--p-primary-contrast-color);background:var(--p-primary-color);border:none;border-radius:8px;cursor:pointer}.sf-submit:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 88%,var(--p-text-color))}.sf-submit:disabled{opacity:.6;cursor:wait}.sf-spinner{width:13px;height:13px;border:2px solid color-mix(in srgb,var(--p-primary-contrast-color) 40%,transparent);border-top-color:var(--p-primary-contrast-color);border-radius:999px;animation:sf-spin .7s linear infinite}@keyframes sf-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.sf-spinner{animation:none}}", ne = { props: { type: "object", properties: { "provider-id": { type: "string", default: "", description: "Provider identifier the Connections page selected." }, "component-id": { type: "string", default: "", description: "Existing connection component identifier when rotating its credential; empty while creating." } } } }, pe = {
  wippy: ne
};
class ce extends Dr {
  static get wippyConfig() {
    return {
      propsSchema: pe.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: se
    };
  }
  static get vueConfig() {
    return { rootComponent: ae };
  }
}
cr(import.meta.url, ce);
//# sourceMappingURL=index.js.map
