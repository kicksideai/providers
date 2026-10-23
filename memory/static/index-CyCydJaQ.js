import { hasInjectionContext as T, inject as m, effectScope as H, ref as f, markRaw as N, createApp as $, onMounted as U, onUnmounted as x, watch as j } from "vue";
import { addCollection as D } from "@iconify/vue";
import { config as C, addIcons as W, on as B, applyThemeMode as b, host as z, hostCss as F, loadCss as M } from "@wippy-fe/proxy";
var g = "data-wippy-visible";
function E(t) {
  const e = t.getAttribute(g);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var K = Object.defineProperty, Y = (t, e, s) => e in t ? K(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, h = (t, e, s) => Y(t, typeof e != "symbol" ? e + "" : e, s), J = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], k = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function w(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function q(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, r] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [o, a] of Object.entries(r)) {
            const c = typeof a == "string" ? w(o) : null;
            c && e.add(c);
          }
          continue;
        }
        const n = typeof r == "string" ? w(i) : null;
        n && e.add(n);
      }
  return [...e].sort();
}
function G(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${k} {
${e}
}`;
}
function Q(t, e) {
  const s = G(e);
  s && S(t, s, "@wippy-fe/css-variables-bridge");
}
function X(t, e) {
  const i = (e ?? J).map(async (r) => {
    const n = F[r];
    if (!n)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await M(n);
    } catch (o) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${n}):`, o), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const n of r) {
      if (!n)
        continue;
      const o = document.createElement("style");
      o.textContent = n, o.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(o);
    }
  });
}
function Z(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function S(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function tt(t, e) {
  S(t, e, "@wippy-fe/custom-css");
}
function V(t) {
  return t.__wippyHost ?? null;
}
function et(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function st(t, e, s) {
  switch (s.type) {
    case "string":
      return { value: e };
    case "number": {
      const i = Number.parseFloat(e);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(e, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(e);
        return s.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function y(t, e) {
  const s = {}, i = [];
  for (const [r, n] of Object.entries(e.properties)) {
    const o = t.getAttribute(r), a = et(r);
    if (o === null) {
      n.default !== void 0 && (s[a] = n.default);
      continue;
    }
    const c = st(r, o, n);
    c.error ? i.push(c.error) : s[a] = c.value;
  }
  return { props: s, errors: i };
}
var it = class {
  constructor(t, e) {
    h(this, "_props"), h(this, "_errors"), h(this, "_content"), h(this, "_hostVisibility"), h(this, "_propsListeners", /* @__PURE__ */ new Set()), h(this, "_contentListeners", /* @__PURE__ */ new Set()), h(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), h(this, "_disposed", !1), h(this, "_emitToDom"), h(this, "props"), h(this, "events"), h(this, "content"), h(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, r) {
        return s._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        s._disposed || s._emitToDom(i, r);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, r) {
        return s._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, r) {
        return s._subscribeHostVisibility(i, r);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const s of this._propsListeners)
        s(t, e);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const e of this._contentListeners)
        e(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, e) {
    if (!(this._disposed || t === e)) {
      this._hostVisibility = t;
      for (const s of this._hostVisibilityListeners)
        s(t, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), e?.immediate && t(this._props, this._errors);
    const s = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const s = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const s = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
}, rt = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = E(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), s = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...s, g])];
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
    return V(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, e) {
    this.dispatchEvent(new CustomEvent(t, {
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
      const t = this.constructor.wippyConfig, e = !!t.contentTemplate;
      let s, i;
      if (this._lastProps !== null)
        s = this._lastProps, i = this._lastErrors;
      else {
        const n = y(this, t.propsSchema);
        t.validateProps && n.errors.push(...t.validateProps(n.props)), s = n.props, i = n.errors, this._lastProps = s, this._lastErrors = i;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new it(
        { props: s, errors: i, content: r, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, s = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(s), t.inlineCss && Z(s, t.inlineCss);
        try {
          const l = C?.theming, p = q(
            l?.global?.cssVariables,
            l?.children?.cssVariables
          );
          Q(s, p);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const l = C?.theming, p = [l?.global?.customCSS, l?.children?.customCSS].filter(Boolean).join(`
`);
            p && tt(s, p);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && X(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = t.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, W(D);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = B("@theme", (c) => this._applyTheme(c)));
      const { props: r, errors: n } = y(this, t.propsSchema);
      t.validateProps && n.push(...t.validateProps(r));
      const o = r;
      this._lastProps = o, this._lastErrors = n;
      let a = null;
      t.contentTemplate && (a = this._extractContent(t.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(t.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, o, n, a, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: t instanceof Error ? t.message : String(t),
        error: t
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
  _applyTheme(t = z.getThemeMode?.()) {
    b(t, this), this._container && b(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), b("auto", this), this._container && b("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === g) {
      const a = this._hostVisible, c = E(this);
      if (c === a)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, a), this.onHostVisibilityChanged(c, a));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: n } = y(this, i.propsSchema);
    i.validateProps && n.push(...i.validateProps(r));
    const o = r;
    this._lastProps = o, this._lastErrors = n, this._reactive?.notifyProps(o, n), this.onPropsChanged(o, n);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(t) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(t) {
    console.error(`${this.constructor.name} initialization failed:`, t);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(t, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function nt(t) {
  return t.__wippyHostBus ?? null;
}
function ot(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let P;
const R = (t) => P = t, at = () => T() && m(I) || P, I = (
  /* istanbul ignore next */
  Symbol()
);
function lt() {
  const t = H(!0), e = t.run(() => f({}));
  let s = [], i = [];
  const r = N({
    install(n) {
      R(r), r._a = n, n.provide(I, r), n.config.globalProperties.$pinia = r, i.forEach((o) => s.push(o)), i = [];
    },
    use(n) {
      return this._a ? s.push(n) : i.push(n), this;
    },
    _p: s,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return r;
}
var ct = Object.defineProperty, ht = (t, e, s) => e in t ? ct(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, _ = (t, e, s) => ht(t, typeof e != "symbol" ? e + "" : e, s), A = /* @__PURE__ */ Symbol("wippy:emit"), O = /* @__PURE__ */ Symbol("wippy:props"), ut = /* @__PURE__ */ Symbol("wippy:props_error"), pt = /* @__PURE__ */ Symbol("wippy:content"), dt = /* @__PURE__ */ Symbol("wippy:panel-id"), _t = /* @__PURE__ */ Symbol("wippy:layout-bus"), ft = /* @__PURE__ */ Symbol("wippy:host"), L = /* @__PURE__ */ Symbol("wippy:host-visibility");
function gt() {
  const t = m(O);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Ct() {
  const t = m(A);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function bt() {
  const t = m(L);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function Et(t) {
  const e = bt();
  let s = !1, i = null, r = !1;
  function n() {
    if (i)
      return r = !0, i;
    let o;
    try {
      o = Promise.resolve(t());
    } catch (c) {
      o = Promise.reject(c);
    }
    const a = o.finally(() => {
      if (i === a && (i = null, s && r))
        return r = !1, n();
    });
    return i = a, a;
  }
  return U(() => (s = !0, n())), x(() => {
    s = !1, r = !1;
  }), j(e, (o, a) => {
    if (s && a === !1 && o === !0)
      return n();
  }), e;
}
var wt = class extends rt {
  constructor() {
    super(...arguments), _(this, "_vueApp", null), _(this, "_propsRef", f({})), _(this, "_errorsRef", f([])), _(this, "_contentRef", f(null)), _(this, "_hostVisibilityRef", f(null)), _(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, r, n) {
    const o = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of i)
      this.emitEvent("invalid", { message: l });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((l, p) => {
      this._propsRef.value = l, this._errorsRef.value = [...p];
      for (const u of p)
        this.emitEvent("invalid", { message: u });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: a.signal });
    const c = (l) => {
      if (a.signal.aborted)
        return;
      const p = at(), u = $(l.rootComponent);
      this._vueApp = u;
      const d = lt();
      if (l.piniaPlugins)
        for (const v of l.piniaPlugins)
          d.use(v);
      if (u.use(d), l.plugins)
        for (const v of l.plugins)
          u.use(v);
      u.provide(O, this._propsRef), u.provide(ut, this._errorsRef), u.provide(A, this.emitEvent.bind(this)), u.provide(pt, this._contentRef), u.provide(L, this._hostVisibilityRef), u.provide(dt, ot(this)), u.provide(_t, nt(this)), u.provide(ft, V(this)), l.providers && l.providers(u, this), u.mount(e), p && R(p);
    };
    if (o.rootComponent)
      c(o);
    else if (o.lazyConfig) {
      const l = document.createElement("wippy-loading");
      l.setAttribute("no-bg", ""), e.appendChild(l), o.lazyConfig().then((p) => {
        a.signal.aborted || (l.remove(), c(p));
      }).catch((p) => {
        if (a.signal.aborted)
          return;
        const u = p instanceof Error ? p.message : String(p), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", u), l.replaceWith(d), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
export {
  wt as W,
  Ct as a,
  Et as b,
  gt as u
};
//# sourceMappingURL=index-CyCydJaQ.js.map
