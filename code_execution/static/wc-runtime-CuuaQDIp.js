import { hasInjectionContext as Y, inject as T, effectScope as q, ref as w, markRaw as J, createApp as G } from "vue";
import { addCollection as Q } from "@iconify/vue";
import { config as z, addIcons as X, on as Z, applyThemeMode as V, host as tt, hostCss as et, loadCss as st } from "@wippy-fe/proxy";
var I = "data-wippy-visible";
function x(t) {
  const e = t.getAttribute(I);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var it = Object.defineProperty, U = (t) => {
  throw TypeError(t);
}, nt = (t, e, s) => e in t ? it(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, h = (t, e, s) => nt(t, typeof e != "symbol" ? e + "" : e, s), $ = (t, e, s) => e.has(t) || U("Cannot " + s), rt = (t, e, s) => ($(t, e, "read from private field"), s ? s.call(t) : e.get(t)), ot = (t, e, s) => e.has(t) ? U("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), at = (t, e, s, i) => ($(t, e, "write to private field"), e.set(t, s), s), lt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], ct = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function k(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function ht(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, n] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [l, o] of Object.entries(n)) {
            const u = typeof o == "string" ? k(l) : null;
            u && e.add(u);
          }
          continue;
        }
        const r = typeof n == "string" ? k(i) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function ut(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${ct} {
${e}
}`;
}
function pt(t, e) {
  const s = ut(e);
  s && D(t, s, "@wippy-fe/css-variables-bridge");
}
function dt(t, e) {
  const i = (e ?? lt).map(async (n) => {
    const r = et[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await st(r);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${r}):`, l), null;
    }
  });
  return Promise.all(i).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const l = document.createElement("style");
      l.textContent = r, l.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(l);
    }
  });
}
function ft(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function D(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function _t(t, e) {
  D(t, e, "@wippy-fe/custom-css");
}
function W(t) {
  return t.__wippyHost ?? null;
}
function mt(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function bt(t, e, s) {
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
function L(t, e) {
  const s = {}, i = [];
  for (const [n, r] of Object.entries(e.properties)) {
    const l = t.getAttribute(n), o = mt(n);
    if (l === null) {
      r.default !== void 0 && (s[o] = r.default);
      continue;
    }
    const u = bt(n, l, r);
    u.error ? i.push(u.error) : s[o] = u.value;
  }
  return { props: s, errors: i };
}
var yt = class {
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
}, R, vt = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), ot(this, R, null), h(this, "_attachment", 0), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = x(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...s, I])];
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
    return W(this);
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
        const r = L(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), s = r.props, i = r.errors, this._lastProps = s, this._lastErrors = i;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new yt(
        { props: s, errors: i, content: n, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const t = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, s = this._initialized, i = rt(this, R) ?? at(this, R, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let n;
      if (this._container)
        n = this._container;
      else {
        if (this.onInit(i), t !== this._attachment)
          return;
        e.inlineCss && ft(i, e.inlineCss);
        try {
          const _ = z?.theming, a = ht(
            _?.global?.cssVariables,
            _?.children?.cssVariables
          );
          pt(i, a);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const _ = z?.theming, a = [_?.global?.customCSS, _?.children?.customCSS].filter(Boolean).join(`
`);
            a && _t(i, a);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && dt(i, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const p = e.containerClasses ?? [];
        p.length > 0 && n.classList.add(...p), i.appendChild(n), this._container = n, X(Q);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Z("@theme", (p) => this._applyTheme(p)));
      const { props: r, errors: l } = L(this, e.propsSchema);
      e.validateProps && l.push(...e.validateProps(r));
      const o = r;
      this._lastProps = o, this._lastErrors = l;
      let u = null;
      if (e.contentTemplate && (u = this._extractContent(e.contentTemplate), this._lastContent = u, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(e.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(i, n, o, l, u, s), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), s || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
    } catch (e) {
      if (t !== this._attachment || (this.onError(e), t !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
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
  _applyTheme(t = tt.getThemeMode?.()) {
    V(t, this), this._container && V(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), V("auto", this), this._container && V("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === I) {
      const o = this._hostVisible, u = x(this);
      if (u === o)
        return;
      this._hostVisible = u, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(u, o), this.onHostVisibilityChanged(u, o));
      return;
    }
    const i = this.constructor.wippyConfig, { props: n, errors: r } = L(this, i.propsSchema);
    i.validateProps && r.push(...i.validateProps(n));
    const l = n;
    this._lastProps = l, this._lastErrors = r, this._reactive?.notifyProps(l, r), this.onPropsChanged(l, r);
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
   *
   * A template keeps its children in one of two places. Parsed HTML (page
   * markup, `innerHTML`) puts them in `template.content`, a DocumentFragment.
   * DOM APIs add them as the template element's own child nodes and leave
   * `template.content` empty: that is how a Vue SFC sets
   * `<template data-type="...">{{ text }}</template>`. The content fragment is
   * read first, then the element's own children. Only text is returned, never
   * markup, in both cases.
   */
  _extractContent(t) {
    const e = this.querySelector(`template[data-type="${t}"]`);
    return e ? e.content.textContent?.trim() || e.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
R = /* @__PURE__ */ new WeakMap();
function gt(t) {
  return t.__wippyHostBus ?? null;
}
function Ct(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let B;
const M = (t) => B = t, St = () => Y() && T(F) || B, F = (
  /* istanbul ignore next */
  Symbol()
);
function wt() {
  const t = q(!0), e = t.run(() => w({}));
  let s = [], i = [];
  const n = J({
    install(r) {
      M(n), n._a = r, r.provide(F, n), r.config.globalProperties.$pinia = n, i.forEach((l) => s.push(l)), i = [];
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
var Et = Object.defineProperty, Vt = (t, e, s) => e in t ? Et(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, b = (t, e, s) => Vt(t, typeof e != "symbol" ? e + "" : e, s);
function kt(t, e) {
  return { lazyConfig: t, mountLifecycle: !0, lazyUi: e };
}
function H(t, e, s) {
  const i = t.createElement("div"), n = s ? e.failed : e.loading;
  i.dataset.lazyState = s ? "failed" : "loading", i.setAttribute("role", s ? "alert" : "status"), i.setAttribute("aria-label", n), i.style.cssText = "display:grid;place-items:center;text-align:center;";
  const r = e.surface === "page";
  if (i.style.cssText += r ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", s)
    i.style.color = "var(--p-danger-500, currentColor)", i.textContent = !r && e.iconOnly ? "⚠" : n, !r && e.iconOnly && (i.title = n);
  else {
    const l = t.createElement("style");
    l.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const o = t.createElement("span");
    o.dataset.wippySpinner = "", o.setAttribute("aria-hidden", "true"), o.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", o.style.fontSize = r ? "2rem" : "1em", i.append(l, o);
  }
  return i;
}
var j = /* @__PURE__ */ Symbol("wippy:emit"), K = /* @__PURE__ */ Symbol("wippy:props"), Pt = /* @__PURE__ */ Symbol("wippy:props_error"), Rt = /* @__PURE__ */ Symbol("wippy:content"), At = /* @__PURE__ */ Symbol("wippy:panel-id"), Lt = /* @__PURE__ */ Symbol("wippy:layout-bus"), It = /* @__PURE__ */ Symbol("wippy:host"), Tt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ht() {
  const t = T(K);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Nt() {
  const t = T(j);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var P = /* @__PURE__ */ new WeakMap();
function N(t, e) {
  const s = P.get(t);
  if (s)
    return s;
  const i = Promise.resolve().then(e);
  return P.set(t, i), i.catch(() => {
    P.get(t) === i && P.delete(t);
  }), i;
}
var Ut = class extends vt {
  constructor() {
    super(...arguments), b(this, "_vueApp", null), b(this, "_mountingApp", !1), b(this, "_mountState", "idle"), b(this, "_feedback", null), b(this, "_propsRef", w({})), b(this, "_errorsRef", w([])), b(this, "_contentRef", w(null)), b(this, "_hostVisibilityRef", w(null)), b(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const t = this.vueConfig;
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await N(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, s, i, n, r) {
    const l = this.constructor, o = l.vueConfig, u = new AbortController();
    this._bridgeAbort = u;
    const p = () => !u.signal.aborted && this._bridgeAbort === u;
    this._mountState = "mounting", this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const a of i)
      if (this.emitEvent("invalid", { message: a }), !p())
        return;
    this.reactive.props.subscribe((a, d) => {
      this._propsRef.value = a, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: u.signal }), this.reactive.content && this.reactive.content.subscribe((a) => {
      this._contentRef.value = a;
    }, { signal: u.signal }), this.reactive.hostVisibility.subscribe((a) => {
      this._hostVisibilityRef.value = a;
    }, { signal: u.signal });
    const _ = (a) => {
      if (!p())
        return;
      const d = St(), c = G(a.rootComponent);
      let v = !1, y = !1, g, C;
      this._mountingApp = !0;
      try {
        const S = wt();
        if (a.piniaPlugins)
          for (const m of a.piniaPlugins)
            S.use(m);
        c.use(S);
        for (const m of a.plugins ?? [])
          c.use(m);
        if (c.provide(K, this._propsRef), c.provide(Pt, this._errorsRef), c.provide(j, this.emitEvent.bind(this)), c.provide(Rt, this._contentRef), c.provide(Tt, this._hostVisibilityRef), c.provide(At, Ct(this)), c.provide(Lt, gt(this)), c.provide(It, W(this)), a.providers?.(c, this), !p())
          return;
        if (C = c.config.errorHandler, o.mountLifecycle && (c.config.errorHandler = (m, O, f) => {
          y || (g = m), y = !0, C?.(m, O, f);
        }), c.mount(e), v = !0, y)
          throw g;
        p() && (this._vueApp = c);
      } finally {
        o.mountLifecycle && v && (c.config.errorHandler = C);
        try {
          v && (y || !p()) && c.unmount();
        } finally {
          M(d), this._mountingApp = !1;
        }
      }
      o.mountLifecycle && queueMicrotask(() => {
        p() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (o.rootComponent) {
      if (this._mountingApp && o.mountLifecycle) {
        queueMicrotask(() => {
          try {
            _(o);
          } catch (a) {
            p() && (this._mountState = "failed", this.emitEvent("error", { message: a instanceof Error ? a.message : String(a), error: a }));
          }
        });
        return;
      }
      try {
        _(o);
      } catch (a) {
        if (p())
          throw this._mountState = "failed", a;
      }
    } else if (o.lazyConfig) {
      const a = e.ownerDocument, d = o.lazyUi;
      d?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let c = !1, v, y;
      const g = () => {
        clearTimeout(v), clearTimeout(y), this._feedback?.remove(), this._feedback = null;
      };
      u.signal.addEventListener("abort", g, { once: !0 });
      const C = () => {
        if (!p() || c)
          return;
        const f = d ? H(a, d, !1) : a.createElement("wippy-loading");
        f.setAttribute("no-bg", ""), this._feedback = f, e.appendChild(f);
      }, S = (f) => {
        if (!p())
          return;
        c = !0, g(), this._mountState = "failed";
        const A = d?.failed ?? (f instanceof Error ? f.message : String(f)), E = d ? H(a, d, !0) : a.createElement("wippy-error");
        d || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", A)), this._feedback = E, e.appendChild(E), this.emitEvent("error", d ? { message: A, error: f } : { message: A });
      }, m = d?.delay ?? (d?.surface === "compact" ? 200 : 0);
      m > 0 ? v = setTimeout(C, m) : C(), d && (y = setTimeout(() => S(new Error("The component did not load in time.")), d.timeout ?? 3e4)), (o.mountLifecycle ? N(l, o.lazyConfig) : o.lazyConfig()).then((f) => {
        !p() || c || (c = !0, g(), _(f));
      }, (f) => {
        c || S(f);
      }).catch(S);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
};
export {
  Ut as W,
  Nt as a,
  kt as l,
  Ht as u
};
