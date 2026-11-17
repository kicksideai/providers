import { hasInjectionContext as L, inject as g, effectScope as T, ref as f, markRaw as N, createApp as $ } from "vue";
import { addCollection as x } from "@iconify/vue";
import { config as C, addIcons as H, on as U, applyThemeMode as b, host as D, hostCss as j, loadCss as W } from "@wippy-fe/proxy";
var y = "data-wippy-visible";
function E(t) {
  const e = t.getAttribute(y);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var B = Object.defineProperty, z = (t, e, s) => e in t ? B(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, c = (t, e, s) => z(t, typeof e != "symbol" ? e + "" : e, s), F = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], K = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function S(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function M(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, n] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [a, h] of Object.entries(n)) {
            const l = typeof h == "string" ? S(a) : null;
            l && e.add(l);
          }
          continue;
        }
        const r = typeof n == "string" ? S(i) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function Y(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${K} {
${e}
}`;
}
function J(t, e) {
  const s = Y(e);
  s && w(t, s, "@wippy-fe/css-variables-bridge");
}
function k(t, e) {
  const i = (e ?? F).map(async (n) => {
    const r = j[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await W(r);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${r}):`, a), null;
    }
  });
  return Promise.all(i).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const a = document.createElement("style");
      a.textContent = r, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function q(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function w(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function G(t, e) {
  w(t, e, "@wippy-fe/custom-css");
}
function V(t) {
  return t.__wippyHost ?? null;
}
function Q(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function X(t, e, s) {
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
function v(t, e) {
  const s = {}, i = [];
  for (const [n, r] of Object.entries(e.properties)) {
    const a = t.getAttribute(n), h = Q(n);
    if (a === null) {
      r.default !== void 0 && (s[h] = r.default);
      continue;
    }
    const l = X(n, a, r);
    l.error ? i.push(l.error) : s[h] = l.value;
  }
  return { props: s, errors: i };
}
var Z = class {
  constructor(t, e) {
    c(this, "_props"), c(this, "_errors"), c(this, "_content"), c(this, "_hostVisibility"), c(this, "_propsListeners", /* @__PURE__ */ new Set()), c(this, "_contentListeners", /* @__PURE__ */ new Set()), c(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), c(this, "_disposed", !1), c(this, "_emitToDom"), c(this, "props"), c(this, "events"), c(this, "content"), c(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, n) {
        return s._subscribeProps(i, n);
      }
    }, this.events = {
      emit(i, n) {
        s._disposed || s._emitToDom(i, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, n) {
        return s._subscribeContent(i, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, n) {
        return s._subscribeHostVisibility(i, n);
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
}, tt = class extends HTMLElement {
  constructor() {
    super(), c(this, "_internals"), c(this, "_contentObserver", null), c(this, "_initialized", !1), c(this, "_container", null), c(this, "_reactive", null), c(this, "_lastProps", null), c(this, "_lastErrors", []), c(this, "_lastContent", null), c(this, "_themeUnsub", null), c(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = E(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...s, y])];
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
        const r = v(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), s = r.props, i = r.errors, this._lastProps = s, this._lastErrors = i;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new Z(
        { props: s, errors: i, content: n, hasContent: e, hostVisibility: this._hostVisible },
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
        this.onInit(s), t.inlineCss && q(s, t.inlineCss);
        try {
          const o = C?.theming, u = M(
            o?.global?.cssVariables,
            o?.children?.cssVariables
          );
          J(s, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const o = C?.theming, u = [o?.global?.customCSS, o?.children?.customCSS].filter(Boolean).join(`
`);
            u && G(s, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && k(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const l = t.containerClasses ?? [];
        l.length > 0 && i.classList.add(...l), s.appendChild(i), this._container = i, H(x);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = U("@theme", (l) => this._applyTheme(l)));
      const { props: n, errors: r } = v(this, t.propsSchema);
      t.validateProps && r.push(...t.validateProps(n));
      const a = n;
      this._lastProps = a, this._lastErrors = r;
      let h = null;
      t.contentTemplate && (h = this._extractContent(t.contentTemplate), this._lastContent = h, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(t.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, a, r, h, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = D.getThemeMode?.()) {
    b(t, this), this._container && b(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), b("auto", this), this._container && b("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === y) {
      const h = this._hostVisible, l = E(this);
      if (l === h)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, h), this.onHostVisibilityChanged(l, h));
      return;
    }
    const i = this.constructor.wippyConfig, { props: n, errors: r } = v(this, i.propsSchema);
    i.validateProps && r.push(...i.validateProps(n));
    const a = n;
    this._lastProps = a, this._lastErrors = r, this._reactive?.notifyProps(a, r), this.onPropsChanged(a, r);
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
function et(t) {
  return t.__wippyHostBus ?? null;
}
function st(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let P;
const R = (t) => P = t, it = () => L() && g(I) || P, I = (
  /* istanbul ignore next */
  Symbol()
);
function nt() {
  const t = T(!0), e = t.run(() => f({}));
  let s = [], i = [];
  const n = N({
    install(r) {
      R(n), n._a = r, r.provide(I, n), r.config.globalProperties.$pinia = n, i.forEach((a) => s.push(a)), i = [];
    },
    use(r) {
      return this._a ? s.push(r) : i.push(r), this;
    },
    _p: s,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return n;
}
var rt = Object.defineProperty, ot = (t, e, s) => e in t ? rt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, _ = (t, e, s) => ot(t, typeof e != "symbol" ? e + "" : e, s), A = /* @__PURE__ */ Symbol("wippy:emit"), O = /* @__PURE__ */ Symbol("wippy:props"), at = /* @__PURE__ */ Symbol("wippy:props_error"), lt = /* @__PURE__ */ Symbol("wippy:content"), ct = /* @__PURE__ */ Symbol("wippy:panel-id"), ht = /* @__PURE__ */ Symbol("wippy:layout-bus"), pt = /* @__PURE__ */ Symbol("wippy:host"), ut = /* @__PURE__ */ Symbol("wippy:host-visibility");
function bt() {
  const t = g(O);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function mt() {
  const t = g(A);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var vt = class extends tt {
  constructor() {
    super(...arguments), _(this, "_vueApp", null), _(this, "_propsRef", f({})), _(this, "_errorsRef", f([])), _(this, "_contentRef", f(null)), _(this, "_hostVisibilityRef", f(null)), _(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, n, r) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const o of i)
      this.emitEvent("invalid", { message: o });
    const h = new AbortController();
    this._bridgeAbort = h, this.reactive.props.subscribe((o, u) => {
      this._propsRef.value = o, this._errorsRef.value = [...u];
      for (const p of u)
        this.emitEvent("invalid", { message: p });
    }, { signal: h.signal }), this.reactive.content && this.reactive.content.subscribe((o) => {
      this._contentRef.value = o;
    }, { signal: h.signal }), this.reactive.hostVisibility.subscribe((o) => {
      this._hostVisibilityRef.value = o;
    }, { signal: h.signal });
    const l = (o) => {
      if (h.signal.aborted)
        return;
      const u = it(), p = $(o.rootComponent);
      this._vueApp = p;
      const d = nt();
      if (o.piniaPlugins)
        for (const m of o.piniaPlugins)
          d.use(m);
      if (p.use(d), o.plugins)
        for (const m of o.plugins)
          p.use(m);
      p.provide(O, this._propsRef), p.provide(at, this._errorsRef), p.provide(A, this.emitEvent.bind(this)), p.provide(lt, this._contentRef), p.provide(ut, this._hostVisibilityRef), p.provide(ct, st(this)), p.provide(ht, et(this)), p.provide(pt, V(this)), o.providers && o.providers(p, this), p.mount(e), u && R(u);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const o = document.createElement("wippy-loading");
      o.setAttribute("no-bg", ""), e.appendChild(o), a.lazyConfig().then((u) => {
        h.signal.aborted || (o.remove(), l(u));
      }).catch((u) => {
        if (h.signal.aborted)
          return;
        const p = u instanceof Error ? u.message : String(u), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", p), o.replaceWith(d), this.emitEvent("error", { message: p });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
export {
  vt as W,
  bt as a,
  mt as u
};
//# sourceMappingURL=wc-runtime-f54Bo-yJ.js.map
