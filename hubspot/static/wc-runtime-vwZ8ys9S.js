import { hasInjectionContext as Jn, inject as ot, effectScope as Qn, ref as F, markRaw as Zn, createApp as Xn, readonly as er, getCurrentInstance as dt, onMounted as tr, nextTick as nr, watch as pe, reactive as rr, renderSlot as Ie, openBlock as or, createBlock as ir, Teleport as Jt, createCommentVNode as Qt, useId as sr, mergeProps as Ne, h as ar } from "vue";
import { addCollection as lr } from "@iconify/vue";
import { config as mt, addIcons as ur, on as cr, applyThemeMode as Oe, host as dr, hostCss as mr, loadCss as pr } from "@wippy-fe/proxy";
var Ke = "data-wippy-visible";
function pt(t) {
  const e = t.getAttribute(Ke);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var fr = Object.defineProperty, Zt = (t) => {
  throw TypeError(t);
}, hr = (t, e, n) => e in t ? fr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, O = (t, e, n) => hr(t, typeof e != "symbol" ? e + "" : e, n), Xt = (t, e, n) => e.has(t) || Zt("Cannot " + n), gr = (t, e, n) => (Xt(t, e, "read from private field"), n ? n.call(t) : e.get(t)), vr = (t, e, n) => e.has(t) ? Zt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), yr = (t, e, n, r) => (Xt(t, e, "write to private field"), e.set(t, n), n), br = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], _r = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(",\n");
function ft(t) {
  const e = t.startsWith("--") ? t : "--".concat(t);
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function Sr(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const i = typeof l == "string" ? ft(a) : null;
            i && e.add(i);
          }
          continue;
        }
        const s = typeof o == "string" ? ft(r) : null;
        s && e.add(s);
      }
  return [...e].sort();
}
function $r(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => "  ".concat(n, ": inherit;")).join("\n");
  return "".concat(_r, " {\n").concat(e, "\n}");
}
function wr(t, e) {
  const n = $r(e);
  n && en(t, n, "@wippy-fe/css-variables-bridge");
}
function Tr(t, e) {
  const r = (e ?? br).map(async (o) => {
    const s = mr[o];
    if (!s)
      return console.warn('[wippy-fe/webcomponent-core] hostCss key "'.concat(o, '" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.')), null;
    try {
      return await pr(s);
    } catch (a) {
      return console.warn('[wippy-fe/webcomponent-core] Failed to load hostCss "'.concat(o, '" (').concat(s, "):"), a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function Cr(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function en(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = e, t.appendChild(r);
}
function Pr(t, e) {
  en(t, e, "@wippy-fe/custom-css");
}
function tn(t) {
  return t.__wippyHost ?? null;
}
function Or(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function xr(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const r = Number.parseFloat(e);
      return Number.isNaN(r) ? { value: void 0, error: "Invalid ".concat(t, ": expected a number") } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(e, 10);
      return Number.isNaN(r) ? { value: void 0, error: "Invalid ".concat(t, ": expected an integer") } : { value: r };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(e);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: "Invalid ".concat(t, ": expected a JSON array") } : { value: r };
      } catch {
        return { value: void 0, error: "Invalid ".concat(t, ": must be valid JSON") };
      }
    default:
      return { value: e };
  }
}
function We(t, e) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(e.properties)) {
    const a = t.getAttribute(o), l = Or(o);
    if (a === null) {
      s.default !== void 0 && (n[l] = s.default);
      continue;
    }
    const i = xr(o, a, s);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
}
var kr = class {
  constructor(t, e) {
    O(this, "_props"), O(this, "_errors"), O(this, "_content"), O(this, "_hostVisibility"), O(this, "_propsListeners", /* @__PURE__ */ new Set()), O(this, "_contentListeners", /* @__PURE__ */ new Set()), O(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), O(this, "_disposed", !1), O(this, "_emitToDom"), O(this, "props"), O(this, "events"), O(this, "content"), O(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, o) {
        return n._subscribeProps(r, o);
      }
    }, this.events = {
      emit(r, o) {
        n._disposed || n._emitToDom(r, o);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, o) {
        return n._subscribeContent(r, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, o) {
        return n._subscribeHostVisibility(r, o);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const n of this._propsListeners)
        n(t, e);
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
      for (const n of this._hostVisibilityListeners)
        n(t, e);
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
    const n = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const n = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Re, Er = class extends HTMLElement {
  constructor() {
    super(), O(this, "_internals"), O(this, "_contentObserver", null), O(this, "_initialized", !1), O(this, "_container", null), vr(this, Re, null), O(this, "_attachment", 0), O(this, "_reactive", null), O(this, "_lastProps", null), O(this, "_lastErrors", []), O(this, "_lastContent", null), O(this, "_themeUnsub", null), O(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = pt(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), n = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...n, Ke])];
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
    return tn(this);
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
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const s = We(this, t.propsSchema);
        t.validateProps && s.errors.push(...t.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = o), this._reactive = new kr(
        { props: n, errors: r, content: o, hasContent: e, hostVisibility: this._hostVisible },
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
      const e = this.constructor.wippyConfig, n = this._initialized, r = gr(this, Re) ?? yr(this, Re, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let o;
      if (this._container)
        o = this._container;
      else {
        if (this.onInit(r), t !== this._attachment)
          return;
        e.inlineCss && Cr(r, e.inlineCss);
        try {
          const d = mt?.theming, c = Sr(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          wr(r, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = mt?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join("\n");
            c && Pr(r, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Tr(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const u = e.containerClasses ?? [];
        u.length > 0 && o.classList.add(...u), r.appendChild(o), this._container = o, ur(lr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = cr("@theme", (u) => this._applyTheme(u)));
      const { props: s, errors: a } = We(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(s));
      const l = s;
      this._lastProps = l, this._lastErrors = a;
      let i = null;
      if (e.contentTemplate && (i = this._extractContent(e.contentTemplate), this._lastContent = i, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(e.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, l, a, i, n), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
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
  _applyTheme(t = dr.getThemeMode?.()) {
    Oe(t, this), this._container && Oe(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Oe("auto", this), this._container && Oe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === Ke) {
      const l = this._hostVisible, i = pt(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = We(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = s, this._reactive?.notifyProps(a, s), this.onPropsChanged(a, s);
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
    console.error("".concat(this.constructor.name, " initialization failed:"), t);
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
    const e = this.querySelector('template[data-type="'.concat(t, '"]'));
    return e ? e.content.textContent?.trim() || e.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
Re = /* @__PURE__ */ new WeakMap();
function Lr(t) {
  return t.__wippyHostBus ?? null;
}
function Ar(t) {
  return t.dataset.wippyPanelId ?? null;
}
let nn;
const rn = (t) => nn = t, jr = () => Jn() && ot(on) || nn, on = (
  /* istanbul ignore next */
  Symbol()
);
function Nr() {
  const t = Qn(!0), e = t.run(() => F({}));
  let n = [], r = [];
  const o = Zn({
    install(s) {
      rn(o), o._a = s, s.provide(on, o), s.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(s) {
      return this._a ? n.push(s) : r.push(s), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return o;
}
var Rr = Object.defineProperty, Ir = (t, e, n) => e in t ? Rr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, W = (t, e, n) => Ir(t, typeof e != "symbol" ? e + "" : e, n);
function Xi(t, e) {
  return { lazyConfig: t, mountLifecycle: !0, lazyUi: e };
}
function ht(t, e, n) {
  const r = t.createElement("div"), o = n ? e.failed : e.loading;
  r.dataset.lazyState = n ? "failed" : "loading", r.setAttribute("role", n ? "alert" : "status"), r.setAttribute("aria-label", o), r.style.cssText = "display:grid;place-items:center;text-align:center;";
  const s = e.surface === "page";
  if (r.style.cssText += s ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    r.style.color = "var(--p-danger-500, currentColor)", r.textContent = !s && e.iconOnly ? "⚠" : o, !s && e.iconOnly && (r.title = o);
  else {
    const a = t.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const l = t.createElement("span");
    l.dataset.wippySpinner = "", l.setAttribute("aria-hidden", "true"), l.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", l.style.fontSize = s ? "2rem" : "1em", r.append(a, l);
  }
  return r;
}
var sn = /* @__PURE__ */ Symbol("wippy:emit"), an = /* @__PURE__ */ Symbol("wippy:props"), Vr = /* @__PURE__ */ Symbol("wippy:props_error"), Dr = /* @__PURE__ */ Symbol("wippy:content"), Mr = /* @__PURE__ */ Symbol("wippy:panel-id"), Br = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ur = /* @__PURE__ */ Symbol("wippy:host"), Wr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function es() {
  const t = ot(an);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function ts() {
  const t = ot(sn);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var xe = /* @__PURE__ */ new WeakMap();
function gt(t, e) {
  const n = xe.get(t);
  if (n)
    return n;
  const r = Promise.resolve().then(e);
  return xe.set(t, r), r.catch(() => {
    xe.get(t) === r && xe.delete(t);
  }), r;
}
var ns = class extends Er {
  constructor() {
    super(...arguments), W(this, "_vueApp", null), W(this, "_mountingApp", !1), W(this, "_mountState", "idle"), W(this, "_feedback", null), W(this, "_propsRef", F({})), W(this, "_errorsRef", F([])), W(this, "_contentRef", F(null)), W(this, "_hostVisibilityRef", F(null)), W(this, "_bridgeAbort", null);
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
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await gt(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, n, r, o, s) {
    const a = this.constructor, l = a.vueConfig, i = new AbortController();
    this._bridgeAbort = i;
    const u = () => !i.signal.aborted && this._bridgeAbort === i;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of r)
      if (this.emitEvent("invalid", { message: c }), !u())
        return;
    this.reactive.props.subscribe((c, m) => {
      this._propsRef.value = c, this._errorsRef.value = [...m];
      for (const p of m)
        this.emitEvent("invalid", { message: p });
    }, { signal: i.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: i.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: i.signal });
    const d = (c) => {
      if (!u())
        return;
      const m = jr(), p = Xn(c.rootComponent);
      let f = !1, v = !1, g, y;
      this._mountingApp = !0;
      try {
        const _ = Nr();
        if (c.piniaPlugins)
          for (const $ of c.piniaPlugins)
            _.use($);
        p.use(_);
        for (const $ of c.plugins ?? [])
          p.use($);
        if (p.provide(an, this._propsRef), p.provide(Vr, this._errorsRef), p.provide(sn, this.emitEvent.bind(this)), p.provide(Dr, this._contentRef), p.provide(Wr, this._hostVisibilityRef), p.provide(Mr, Ar(this)), p.provide(Br, Lr(this)), p.provide(Ur, tn(this)), c.providers?.(p, this), !u())
          return;
        if (y = p.config.errorHandler, l.mountLifecycle && (p.config.errorHandler = ($, h, b) => {
          v || (g = $), v = !0, y?.($, h, b);
        }), p.mount(e), f = !0, v)
          throw g;
        u() && (this._vueApp = p);
      } finally {
        l.mountLifecycle && f && (p.config.errorHandler = y);
        try {
          f && (v || !u()) && p.unmount();
        } finally {
          rn(m), this._mountingApp = !1;
        }
      }
      l.mountLifecycle && queueMicrotask(() => {
        u() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (l.rootComponent) {
      if (this._mountingApp && l.mountLifecycle) {
        queueMicrotask(() => {
          try {
            d(l);
          } catch (c) {
            u() && (this._mountState = "failed", this.emitEvent("error", { message: c instanceof Error ? c.message : String(c), error: c }));
          }
        });
        return;
      }
      try {
        d(l);
      } catch (c) {
        if (u())
          throw this._mountState = "failed", c;
      }
    } else if (l.lazyConfig) {
      const c = e.ownerDocument, m = l.lazyUi;
      m?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let p = !1, f, v;
      const g = () => {
        clearTimeout(f), clearTimeout(v), this._feedback?.remove(), this._feedback = null;
      };
      i.signal.addEventListener("abort", g, { once: !0 });
      const y = () => {
        if (!u() || p)
          return;
        const b = m ? ht(c, m, !1) : c.createElement("wippy-loading");
        b.setAttribute("no-bg", ""), this._feedback = b, e.appendChild(b);
      }, _ = (b) => {
        if (!u())
          return;
        p = !0, g(), this._mountState = "failed";
        const k = m?.failed ?? (b instanceof Error ? b.message : String(b)), E = m ? ht(c, m, !0) : c.createElement("wippy-error");
        m || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", k)), this._feedback = E, e.appendChild(E), this.emitEvent("error", m ? { message: k, error: b } : { message: k });
      }, $ = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      $ > 0 ? f = setTimeout(y, $) : y(), m && (v = setTimeout(() => _(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (l.mountLifecycle ? gt(a, l.lazyConfig) : l.lazyConfig()).then((b) => {
        !u() || p || (p = !0, g(), d(b));
      }, (b) => {
        p || _(b);
      }).catch(_);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
}, Hr = Object.defineProperty, vt = Object.getOwnPropertySymbols, Fr = Object.prototype.hasOwnProperty, zr = Object.prototype.propertyIsEnumerable, yt = (t, e, n) => e in t ? Hr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Kr = (t, e) => {
  for (var n in e || (e = {})) Fr.call(e, n) && yt(t, n, e[n]);
  if (vt) for (var n of vt(e)) zr.call(e, n) && yt(t, n, e[n]);
  return t;
};
function Ce(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Ye(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), o = Array.isArray(e), s, a, l;
  if (r && o) {
    if (a = t.length, a != e.length) return !1;
    for (s = a; s-- !== 0; ) if (!Ye(t[s], e[s], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = t instanceof Date, u = e instanceof Date;
  if (i != u) return !1;
  if (i && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let m = Object.keys(t);
  if (a = m.length, a !== Object.keys(e).length) return !1;
  for (s = a; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, m[s])) return !1;
  for (s = a; s-- !== 0; ) if (l = m[s], !Ye(t[l], e[l], n)) return !1;
  return !0;
}
function Yr(t, e) {
  return Ye(t, e);
}
function Ue(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function P(t) {
  return !Ce(t);
}
function qe(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (P(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (Ue(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let o = 0, s = n.length; o < s; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function qr(t, e, n) {
  return n ? qe(t, n) === qe(e, n) : Yr(t, e);
}
function B(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function ln(t = {}, e = {}) {
  let n = Kr({}, t);
  return Object.keys(e).forEach((r) => {
    let o = r;
    B(e[o]) && o in t && B(t[o]) ? n[o] = ln(t[o], e[o]) : n[o] = e[o];
  }), n;
}
function Gr(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : ln(e, n), {});
}
function rs(t, e) {
  let n = -1;
  if (P(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function N(t, ...e) {
  return Ue(t) ? t(...e) : t;
}
function j(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function M(t) {
  return j(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function it(t, e = "", n = {}) {
  let r = M(e).split("."), o = r.shift();
  if (o) {
    if (B(t)) {
      let s = Object.keys(t).find((a) => M(a) === o) || "";
      return it(N(t[s], n), r.join("."), n);
    }
    return;
  }
  return N(t, n);
}
function un(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Jr(t) {
  return P(t) && !isNaN(t);
}
function os(t = "") {
  return P(t) && t.length === 1 && !!t.match(/\S| /);
}
function re(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Qr(...t) {
  return Gr(...t);
}
function he(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function R(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Zr(t) {
  return j(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function cn(t) {
  return j(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function st() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    t.clear();
  } };
}
function Xr(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") e.push(r);
      else if (o === "object") {
        let s = Array.isArray(r) ? [Xr(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        e = s.length ? e.concat(s.filter((a) => !!a)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function eo(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function to(t, e) {
  if (t && e) {
    let n = (r) => {
      eo(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function He(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ge(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function dn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], o = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = o.width || t.offsetWidth, e.height = o.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function mn() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], o = t.innerWidth || n.clientWidth || r.clientWidth, s = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: s };
}
function Je(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function no() {
  let t = document.documentElement;
  return (window.pageXOffset || Je(t)) - (t.clientLeft || 0);
}
function ro() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function oo(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function is(t, e, n = !0) {
  var r, o, s, a;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : dn(t), i = l.height, u = l.width, d = e.offsetHeight, c = e.offsetWidth, m = e.getBoundingClientRect(), p = ro(), f = no(), v = mn(), g, y, _ = "top";
    m.top + d + i > v.height ? (g = m.top + p - i, _ = "bottom", g < 0 && (g = p)) : g = d + m.top + p, m.left + u > v.width ? y = Math.max(0, m.left + f + c - u) : y = m.left + f, oo(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = g + "px", t.style.transformOrigin = _, n && (t.style.marginTop = _ === "bottom" ? "calc(".concat((o = (r = Ge(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px", " * -1)") : (a = (s = Ge(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? a : "");
  }
}
function ss(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function io(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function as(t, e, n = !0, r = void 0) {
  var o;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : dn(t), a = e.offsetHeight, l = e.getBoundingClientRect(), i = mn(), u, d, c = r ?? "top";
    if (!r && l.top + a + s.height > i.height ? (u = -1 * s.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, s.width > i.width ? d = l.left * -1 : l.left + s.width > i.width ? d = (l.left + s.width - i.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let m = (o = Ge(/-anchor-gutter$/)) == null ? void 0 : o.value;
      t.style.marginTop = c === "bottom" ? "calc(".concat(m ?? "2px", " * -1)") : m ?? "";
    }
  }
}
function pn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function so(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && pn(t));
}
function de(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Ve(t, e = {}) {
  if (de(t)) {
    let n = (r, o) => {
      var s, a;
      let l = (s = t?.$attrs) != null && s[r] ? [(a = t?.$attrs) == null ? void 0 : a[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, p]) => r === "style" && (p || p === 0) ? "".concat(m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), ":").concat(p) : p ? m : void 0);
            i = c.length ? i.concat(c.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(e).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? t.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Ve(t, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = o), t.setAttribute(r, o));
      }
    });
  }
}
function ao(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return Ve(r, e), r.append(...n), r;
  }
}
function lo(t, e) {
  return de(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function fn(t, e) {
  return de(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function ls(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function uo(t, e) {
  if (de(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function hn(t, e = "") {
  let n = lo(t, 'button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(e, ',\n            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])').concat(e, ',\n            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(e, ',\n            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(e, ',\n            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(e, ',\n            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(e, ',\n            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(e)), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function us(t, e) {
  let n = hn(t, e);
  return n.length > 0 ? n[0] : null;
}
function bt(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function cs(t, e) {
  let n = hn(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function co(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Je(document.documentElement) || Je(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function mo(t, e) {
  return t ? t.offsetHeight : 0;
}
function gn(t, e = []) {
  let n = pn(t);
  return n === null ? e : gn(n, e.concat([n]));
}
function po(t) {
  let e = [];
  if (t) {
    let n = gn(t), r = /(auto|scroll)/, o = (s) => {
      try {
        let a = window.getComputedStyle(s, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let s of n) {
      let a = s.nodeType === 1 && s.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let i of l) {
          let u = fn(s, i);
          u && o(u) && e.push(u);
        }
      }
      s.nodeType !== 9 && o(s) && e.push(s);
    }
  }
  return e;
}
function _t(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function ds() {
  return /(android)/i.test(navigator.userAgent);
}
function vn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ms(t) {
  return !!(t && t.offsetParent != null);
}
function ps() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function fo(t, e = "", n) {
  de(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var ke = {};
function ho(t = "pui_id_") {
  return Object.hasOwn(ke, t) || (ke[t] = 0), ke[t]++, "".concat(t).concat(ke[t]);
}
function go() {
  let t = [], e = (a, l, i = 999) => {
    let u = o(a, l, i), d = u.value + (u.key === a ? 0 : i) + 1;
    return t.push({ key: a, value: d }), d;
  }, n = (a) => {
    t = t.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, i = 0) => [...t].reverse().find((u) => !0) || { key: a, value: i }, s = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: s, set: (a, l, i) => {
    l && (l.style.zIndex = String(e(a, !0, i)));
  }, clear: (a) => {
    a && (n(s(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var fs = go(), vo = Object.defineProperty, yo = Object.defineProperties, bo = Object.getOwnPropertyDescriptors, De = Object.getOwnPropertySymbols, yn = Object.prototype.hasOwnProperty, bn = Object.prototype.propertyIsEnumerable, St = (t, e, n) => e in t ? vo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, V = (t, e) => {
  for (var n in e || (e = {})) yn.call(e, n) && St(t, n, e[n]);
  if (De) for (var n of De(e)) bn.call(e, n) && St(t, n, e[n]);
  return t;
}, Fe = (t, e) => yo(t, bo(e)), H = (t, e) => {
  var n = {};
  for (var r in t) yn.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && De) for (var r of De(t)) e.indexOf(r) < 0 && bn.call(t, r) && (n[r] = t[r]);
  return n;
}, _o = st(), L = _o, ge = /{([^}]*)}/g, _n = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Sn = /var\([^)]+\)/g;
function $t(t) {
  return j(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function So(t) {
  return B(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function $o(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Qe(t = "", e = "") {
  return $o("".concat(j(t, !1) && j(e, !1) ? "".concat(t, "-") : t).concat(e));
}
function $n(t = "", e = "") {
  return "--".concat(Qe(t, e));
}
function wo(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function wn(t, e = "", n = "", r = [], o) {
  if (j(t)) {
    let s = t.trim();
    if (wo(s)) return;
    if (re(s, ge)) {
      let a = s.replaceAll(ge, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => re(u, d)));
        return "var(".concat($n(n, cn(i.join("-")))).concat(P(o) ? ", ".concat(o) : "", ")");
      });
      return re(a.replace(Sn, "0"), _n) ? "calc(".concat(a, ")") : a;
    }
    return s;
  } else if (Jr(t)) return t;
}
function To(t, e, n) {
  j(e, !1) && t.push("".concat(e, ":").concat(n, ";"));
}
function ue(t, e) {
  return t ? "".concat(t, "{").concat(e, "}") : "";
}
function Tn(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(a, l) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= a.length; ) {
      let p = a[u];
      if ((p === '"' || p === "'" || p === "`") && a[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && m++, p === ")" && m--, (p === "," || u === a.length) && m === 0)) {
        let f = d.trim();
        f.startsWith("dt(") ? i.push(Tn(f, l)) : i.push(r(f)), d = "", u++;
        continue;
      }
      p !== void 0 && (d += p), u++;
    }
    return i;
  }
  function r(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let i = Number(a);
    return isNaN(i) ? a : i;
  }
  let o = [], s = [];
  for (let a = 0; a < t.length; a++) if (t[a] === "d" && t.slice(a, a + 3) === "dt(") s.push(a), a += 2;
  else if (t[a] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && o.push([l, a]);
  }
  if (!o.length) return t;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, i] = o[a], u = t.slice(l + 3, i), d = n(u, e), c = e(...d);
    t = t.slice(0, l) + c + t.slice(i + 1);
  }
  return t;
}
var oe = (...t) => Co(C.getTheme(), ...t), Co = (t = {}, e, n, r) => {
  if (e) {
    let { variable: o, options: s } = C.defaults || {}, { prefix: a, transform: l } = t?.options || s || {}, i = re(e, ge) ? e : "{".concat(e, "}");
    return r === "value" || Ce(r) && l === "strict" ? C.getTokenValue(e) : wn(i, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function Ee(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, o, s) => {
      var a;
      return r + o + ((a = N(e[s], { dt: oe })) != null ? a : "");
    }, "");
    return Tn(n, oe);
  }
  return N(t, { dt: oe });
}
function Po(t, e = {}) {
  let n = C.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = e, a = [], l = [], i = [{ node: t, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let p = d[m], f = So(p), v = re(m, s) ? Qe(c) : Qe(c, cn(m));
      if (B(f)) i.push({ node: f, path: v });
      else {
        let g = $n(v), y = wn(f, v, r, [s]);
        To(l, g, y);
        let _ = v;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: ue(o, u) };
}
var I = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: ":root".concat(t, ",:host").concat(t), matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var r;
    return (r = e.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Po(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s, a, l, i, u, d, c;
  let { preset: m, options: p } = e, f, v, g, y, _, $, h;
  if (P(m) && p.transform !== "strict") {
    let { primitive: b, semantic: k, extend: E } = m, z = k || {}, { colorScheme: K } = z, Q = H(z, ["colorScheme"]), Y = E || {}, { colorScheme: Z } = Y, X = H(Y, ["colorScheme"]), q = K || {}, { dark: ee } = q, ie = H(q, ["dark"]), te = Z || {}, { dark: se } = te, ae = H(te, ["dark"]), U = P(b) ? this._toVariables({ primitive: b }, p) : {}, D = P(Q) ? this._toVariables({ semantic: Q }, p) : {}, ne = P(ie) ? this._toVariables({ light: ie }, p) : {}, Pe = P(ee) ? this._toVariables({ dark: ee }, p) : {}, le = P(X) ? this._toVariables({ semantic: X }, p) : {}, ut = P(ae) ? this._toVariables({ light: ae }, p) : {}, ct = P(se) ? this._toVariables({ dark: se }, p) : {}, [An, jn] = [(s = U.declarations) != null ? s : "", U.tokens], [Nn, Rn] = [(a = D.declarations) != null ? a : "", D.tokens || []], [In, Vn] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [Dn, Mn] = [(i = Pe.declarations) != null ? i : "", Pe.tokens || []], [Bn, Un] = [(u = le.declarations) != null ? u : "", le.tokens || []], [Wn, Hn] = [(d = ut.declarations) != null ? d : "", ut.tokens || []], [Fn, zn] = [(c = ct.declarations) != null ? c : "", ct.tokens || []];
    f = this.transformCSS(t, An, "light", "variable", p, r, o), v = jn;
    let Kn = this.transformCSS(t, "".concat(Nn).concat(In), "light", "variable", p, r, o), Yn = this.transformCSS(t, "".concat(Dn), "dark", "variable", p, r, o);
    g = "".concat(Kn).concat(Yn), y = [.../* @__PURE__ */ new Set([...Rn, ...Vn, ...Mn])];
    let qn = this.transformCSS(t, "".concat(Bn).concat(Wn, "color-scheme:light"), "light", "variable", p, r, o), Gn = this.transformCSS(t, "".concat(Fn, "color-scheme:dark"), "dark", "variable", p, r, o);
    _ = "".concat(qn).concat(Gn), $ = [.../* @__PURE__ */ new Set([...Un, ...Hn, ...zn])], h = N(m.css, { dt: oe });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: _, tokens: $ }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: o, defaults: s, selector: a }) {
  var l, i, u;
  let d, c, m;
  if (P(e) && n.transform !== "strict") {
    let p = t.replace("-directive", ""), f = e, { colorScheme: v, extend: g, css: y } = f, _ = H(f, ["colorScheme", "extend", "css"]), $ = g || {}, { colorScheme: h } = $, b = H($, ["colorScheme"]), k = v || {}, { dark: E } = k, z = H(k, ["dark"]), K = h || {}, { dark: Q } = K, Y = H(K, ["dark"]), Z = P(_) ? this._toVariables({ [p]: V(V({}, _), b) }, n) : {}, X = P(z) ? this._toVariables({ [p]: V(V({}, z), Y) }, n) : {}, q = P(E) ? this._toVariables({ [p]: V(V({}, E), Q) }, n) : {}, [ee, ie] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [te, se] = [(i = X.declarations) != null ? i : "", X.tokens || []], [ae, U] = [(u = q.declarations) != null ? u : "", q.tokens || []], D = this.transformCSS(p, "".concat(ee).concat(te), "light", "variable", n, o, s, a), ne = this.transformCSS(p, ae, "dark", "variable", n, o, s, a);
    d = "".concat(D).concat(ne), c = [.../* @__PURE__ */ new Set([...ie, ...se, ...U])], m = N(y, { dt: oe });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: a, options: l } = e, i = (s = a?.components) == null ? void 0 : s[t];
  return this.getPreset({ name: t, preset: i, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s, a;
  let l = t.replace("-directive", ""), { preset: i, options: u } = e, d = ((s = i?.components) == null ? void 0 : s[l]) || ((a = i?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: o } = e;
  return o ? "@layer ".concat(N(o.order || o.name || "primeui", n)) : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let a = this.getCommon({ name: t, theme: e, params: n, set: o, defaults: s }), l = Object.entries(r).reduce((i, [u, d]) => i.push("".concat(u, '="').concat(d, '"')) && i, []).join(" ");
  return Object.entries(a || {}).reduce((i, [u, d]) => {
    if (B(d) && Object.hasOwn(d, "css")) {
      let c = he(d.css), m = "".concat(u, "-variables");
      i.push('<style type="text/css" data-primevue-style-id="'.concat(m, '" ').concat(l, ">").concat(c, "</style>"));
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var a;
  let l = { name: t, theme: e, params: n, set: o, defaults: s }, i = (a = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(r).reduce((d, [c, m]) => d.push("".concat(c, '="').concat(m, '"')) && d, []).join(" ");
  return i ? '<style type="text/css" data-primevue-style-id="'.concat(t, '-variables" ').concat(u, ">").concat(he(i), "</style>") : "";
}, createTokens(t = {}, e, n = "", r = "", o = {}) {
  let s = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn("Circular reference detected at ".concat(this.path)), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && ge.test(this.value)) {
      let c = this.value.trim().replace(ge, (m) => {
        var p;
        let f = m.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn("Token not found for path: ".concat(f)), "__UNRESOLVED__";
        let g = v.computed(l, i, u);
        return Array.isArray(g) && g.length === 2 ? "light-dark(".concat(g[0].value, ",").concat(g[1].value, ")") : (p = g?.value) != null ? p : "__UNRESOLVED__";
      });
      d = _n.test(c.replace(Sn, "0")) ? "calc(".concat(c, ")") : c;
    }
    return Ce(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let m = re(d, e.variable.excludedKeyRegex) ? i : i ? "".concat(i, ".").concat($t(d)) : $t(d), p = u ? "".concat(u, ".").concat(d) : d;
      B(c) ? a(c, m, p) : (o[m] || (o[m] = { paths: [], computed: (f, v = {}, g = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, v.binding, g);
        if (f && f !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let _ = o[m].paths[y];
          if (_.scheme === f) return _.computed(f, v.binding, g);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), o[m].paths.push({ path: p, value: c, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: o }));
    });
  };
  return a(t, n, r), o;
}, getTokenValue(t, e, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !re(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), s = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = t[o]) == null ? void 0 : r.computed(s)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = H(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? ue(P(e) ? "".concat(t).concat(e, ",").concat(t, " ").concat(e) : t, r) : ue(t, ue(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, o = {}, s, a, l) {
  if (P(e)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, a);
      e = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (P(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", e) : this.getSelectorRule(m, l, c, e)), d), "") : ue(l ?? ":root,:host", e);
    }
    if (i) {
      let u = { name: "primeui" };
      B(i) && (u.name = N(i.name, { name: t, type: r })), P(u.name) && (e = ue("@layer ".concat(u.name), e), s?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, C = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Fe(V({}, e), { options: V(V({}, this.defaults.options), e.options) }), this._tokens = I.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), L.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Fe(V({}, this.theme), { preset: t }), this._tokens = I.createTokens(t, this.defaults), this.clearLoadedStyleNames(), L.emit("preset:change", t), L.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Fe(V({}, this.theme), { options: t }), this.clearLoadedStyleNames(), L.emit("options:change", t), L.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return I.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return I.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let o = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPreset(o);
}, getLayerOrderCSS(t = "") {
  return I.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return I.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return I.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return I.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), L.emit("theme:".concat(e, ":load"), t), !this._loadingStyles.size && L.emit("theme:load"));
} }, A = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function wt(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Oo(t)) || e) {
      n && (t = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var s, a = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    l = !0, s = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw s;
    }
  } };
}
function Oo(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var hs = {
  filter: function(e, n, r, o, s) {
    var a = [];
    if (!e)
      return a;
    var l = wt(e), i;
    try {
      for (l.s(); !(i = l.n()).done; ) {
        var u = i.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, s)) {
            a.push(u);
            continue;
          }
        } else {
          var d = wt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var m = c.value, p = qe(u, m);
              if (this.filters[o](p, r, s)) {
                a.push(u);
                break;
              }
            }
          } catch (f) {
            d.e(f);
          } finally {
            d.f();
          }
        }
      }
    } catch (f) {
      l.e(f);
    } finally {
      l.f();
    }
    return a;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(e.toString()).toLocaleLowerCase(r);
      return s.slice(0, o.length) === o;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o, s.length - o.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : R(e.toString()).toLocaleLowerCase(r) == R(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : R(e.toString()).toLocaleLowerCase(r) != R(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (qr(e, n[r]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
}, xo = "\n    *,\n    ::before,\n    ::after {\n        box-sizing: border-box;\n    }\n\n    .p-collapsible-enter-active {\n        animation: p-animate-collapsible-expand 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    .p-collapsible-leave-active {\n        animation: p-animate-collapsible-collapse 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    @keyframes p-animate-collapsible-expand {\n        from {\n            grid-template-rows: 0fr;\n        }\n        to {\n            grid-template-rows: 1fr;\n        }\n    }\n\n    @keyframes p-animate-collapsible-collapse {\n        from {\n            grid-template-rows: 1fr;\n        }\n        to {\n            grid-template-rows: 0fr;\n        }\n    }\n\n    .p-disabled,\n    .p-disabled * {\n        cursor: default;\n        pointer-events: none;\n        user-select: none;\n    }\n\n    .p-disabled,\n    .p-component:disabled {\n        opacity: dt('disabled.opacity');\n    }\n\n    .pi {\n        font-size: dt('icon.size');\n    }\n\n    .p-icon {\n        width: dt('icon.size');\n        height: dt('icon.size');\n    }\n\n    .p-overlay-mask {\n        background: var(--px-mask-background, dt('mask.background'));\n        color: dt('mask.color');\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n    }\n\n    .p-overlay-mask-enter-active {\n        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;\n    }\n\n    .p-overlay-mask-leave-active {\n        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;\n    }\n\n    @keyframes p-animate-overlay-mask-enter {\n        from {\n            background: transparent;\n        }\n        to {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n    }\n    @keyframes p-animate-overlay-mask-leave {\n        from {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n        to {\n            background: transparent;\n        }\n    }\n\n    .p-anchored-overlay-enter-active {\n        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    .p-anchored-overlay-leave-active {\n        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    @keyframes p-animate-anchored-overlay-enter {\n        from {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n\n    @keyframes p-animate-anchored-overlay-leave {\n        to {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n";
function ve(t) {
  "@babel/helpers - typeof";
  return ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ve(t);
}
function Ct(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Pt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ct(Object(n), !0).forEach(function(r) {
      ko(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ct(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ko(t, e, n) {
  return (e = Eo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Eo(t) {
  var e = Lo(t, "string");
  return ve(e) == "symbol" ? e : e + "";
}
function Lo(t, e) {
  if (ve(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ve(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Ao(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  dt() && dt().components ? tr(t) : e ? t() : nr(t);
}
var jo = 0;
function No(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(t), o = F(null), s = vn() ? window.document : void 0, a = e.document, l = a === void 0 ? s : a, i = e.immediate, u = i === void 0 ? !0 : i, d = e.manual, c = d === void 0 ? !1 : d, m = e.name, p = m === void 0 ? "style_".concat(++jo) : m, f = e.id, v = f === void 0 ? void 0 : f, g = e.media, y = g === void 0 ? void 0 : g, _ = e.nonce, $ = _ === void 0 ? void 0 : _, h = e.first, b = h === void 0 ? !1 : h, k = e.onMounted, E = k === void 0 ? void 0 : k, z = e.onUpdated, K = z === void 0 ? void 0 : z, Q = e.onLoad, Y = Q === void 0 ? void 0 : Q, Z = e.props, X = Z === void 0 ? {} : Z, q = function() {
  }, ee = function(se) {
    var ae = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var U = Pt(Pt({}, X), ae), D = U.name || p, ne = U.id || v, Pe = U.nonce || $;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(ne) || l.createElement("style"), o.value.isConnected || (r.value = se || t, Ve(o.value, {
        type: "text/css",
        id: ne,
        media: y,
        nonce: Pe
      }), b ? l.head.prepend(o.value) : l.head.appendChild(o.value), fo(o.value, "data-primevue-style-id", D), Ve(o.value, U), o.value.onload = function(le) {
        return Y?.(le, {
          name: D
        });
      }, E?.(D)), !n.value && (q = pe(r, function(le) {
        o.value.textContent = le, K?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ie = function() {
    !l || !n.value || (q(), so(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && Ao(ee), {
    id: v,
    name: p,
    el: o,
    css: r,
    unload: ie,
    load: ee,
    isLoaded: er(n)
  };
}
function ye(t) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ye(t);
}
var Ot, xt, kt, Et;
function Lt(t, e) {
  return Do(t) || Vo(t, e) || Io(t, e) || Ro();
}
function Ro() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Io(t, e) {
  if (t) {
    if (typeof t == "string") return At(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(t, e) : void 0;
  }
}
function At(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Vo(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Do(t) {
  if (Array.isArray(t)) return t;
}
function jt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ze(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? jt(Object(n), !0).forEach(function(r) {
      Mo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : jt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Mo(t, e, n) {
  return (e = Bo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Bo(t) {
  var e = Uo(t, "string");
  return ye(e) == "symbol" ? e : e + "";
}
function Uo(t, e) {
  if (ye(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Le(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Wo = function(e) {
  var n = e.dt;
  return "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    opacity: 0;\n    overflow: hidden;\n    padding: 0;\n    pointer-events: none;\n    position: absolute;\n    white-space: nowrap;\n    width: 1px;\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n    padding-right: ".concat(n("scrollbar.width"), ";\n}\n");
}, Ho = {}, Fo = {}, x = {
  name: "base",
  css: Wo,
  style: xo,
  classes: Ho,
  inlineStyles: Fo,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(Ee(Ot || (Ot = Le(["", ""])), e));
    return P(o) ? No(he(o), ze({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return C.transformCSS(n.name || e.name, "".concat(o).concat(Ee(xt || (xt = Le(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return C.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return C.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return C.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return C.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return C.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: oe
      }) || "", o = he(Ee(kt || (kt = Le(["", "", ""])), r, e)), s = Object.entries(n).reduce(function(a, l) {
        var i = Lt(l, 2), u = i[0], d = i[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return P(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return C.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [C.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = Ee(Et || (Et = Le(["", ""])), N(this.style, {
        dt: oe
      })), a = he(C.transformCSS(o, s)), l = Object.entries(n).reduce(function(i, u) {
        var d = Lt(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      P(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return ze(ze({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, J = st();
function be(t) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, be(t);
}
function Nt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ae(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Nt(Object(n), !0).forEach(function(r) {
      zo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Nt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function zo(t, e, n) {
  return (e = Ko(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ko(t) {
  var e = Yo(t, "string");
  return be(e) == "symbol" ? e : e + "";
}
function Yo(t, e) {
  if (be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qo = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [A.STARTS_WITH, A.CONTAINS, A.NOT_CONTAINS, A.ENDS_WITH, A.EQUALS, A.NOT_EQUALS],
    numeric: [A.EQUALS, A.NOT_EQUALS, A.LESS_THAN, A.LESS_THAN_OR_EQUAL_TO, A.GREATER_THAN, A.GREATER_THAN_OR_EQUAL_TO],
    date: [A.DATE_IS, A.DATE_IS_NOT, A.DATE_BEFORE, A.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, Go = Symbol();
function Jo(t, e) {
  var n = {
    config: rr(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Go, n), Qo(), Zo(t, n), n;
}
var ce = [];
function Qo() {
  L.clear(), ce.forEach(function(t) {
    return t?.();
  }), ce = [];
}
function Zo(t, e) {
  var n = F(!1), r = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !C.isStyleNameLoaded("common")) {
      var d, c, m = ((d = x.getCommonTheme) === null || d === void 0 ? void 0 : d.call(x)) || {}, p = m.primitive, f = m.semantic, v = m.global, g = m.style, y = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      x.load(p?.css, Ae({
        name: "primitive-variables"
      }, y)), x.load(f?.css, Ae({
        name: "semantic-variables"
      }, y)), x.load(v?.css, Ae({
        name: "global-variables"
      }, y)), x.loadStyle(Ae({
        name: "global-style"
      }, y), g), C.setLoadedStyleName("common");
    }
  };
  L.on("theme:change", function(i) {
    n.value || (t.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = pe(e.config, function(i, u) {
    J.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = pe(function() {
    return e.config.ripple;
  }, function(i, u) {
    J.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = pe(function() {
    return e.config.theme;
  }, function(i, u) {
    n.value || C.setTheme(i), e.config.unstyled || r(), n.value = !1, J.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = pe(function() {
    return e.config.unstyled;
  }, function(i, u) {
    !i && e.config.theme && r(), J.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ce.push(o), ce.push(s), ce.push(a), ce.push(l);
}
var Xo = {
  install: function(e, n) {
    var r = Qr(qo, n);
    Jo(e, r);
  }
}, Cn = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = vn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ei(t, e, n, r, o, s) {
  return s.inline ? Ie(t.$slots, "default", {
    key: 0
  }) : o.mounted ? (or(), ir(Jt, {
    key: 1,
    to: n.appendTo
  }, [Ie(t.$slots, "default")], 8, ["to"])) : Qt("", !0);
}
Cn.render = ei;
var G = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function ti() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = sr();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var Rt = x.extend({
  name: "common"
});
function _e(t) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, _e(t);
}
function ni(t) {
  return xn(t) || ri(t) || On(t) || Pn();
}
function ri(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function me(t, e) {
  return xn(t) || oi(t, e) || On(t, e) || Pn();
}
function Pn() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function On(t, e) {
  if (t) {
    if (typeof t == "string") return Ze(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(t, e) : void 0;
  }
}
function Ze(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function oi(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function xn(t) {
  if (Array.isArray(t)) return t;
}
function It(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function w(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? It(Object(n), !0).forEach(function(r) {
      fe(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : It(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function fe(t, e, n) {
  return (e = ii(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ii(t) {
  var e = si(t, "string");
  return _e(e) == "symbol" ? e : e + "";
}
function si(t, e) {
  if (_e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ai = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(e) {
        L.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        L.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, r, o, s, a, l, i, u, d, c, m = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (s = o.onBeforeCreate) === null || s === void 0 || s.call(o);
    var v = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = ti(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = fn(de(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), r?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ue(e) ? e.apply(void 0, r) : Ne.apply(void 0, r);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (x.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !G.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Rt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      P(e) && x.load(e, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!C.isStyleNameLoaded("common")) {
          var r, o, s = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = s.primitive, l = s.semantic, i = s.global, u = s.style;
          x.load(a?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), x.load(l?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), x.load(i?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), x.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), u), C.setLoadedStyleName("common");
        }
        if (!C.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, p, f = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = f.css, g = f.style;
          (m = this.$style) === null || m === void 0 || m.load(v, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), C.setLoadedStyleName(this.$style.name);
        }
        if (!C.isStyleNameLoaded("layer-order")) {
          var y, _, $ = (y = this.$style) === null || y === void 0 || (_ = y.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(y);
          x.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), C.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, o, s = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, a = s.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, w({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      G.clearLoadedStyleNames(), L.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return it(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = s ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, w(w({}, o), {}, {
        global: m || {}
      })), f = this._getPTDatasets(r);
      return u || !u && p ? c ? this._mergeProps(c, m, p, f) : w(w(w({}, m), p), f) : w(w({}, p), f);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ne(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", s = r === "root" && P((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && w(w({}, r === "root" && w(w(fe({}, "".concat(o, "name"), M(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && fe({}, "".concat(o, "extend"), M(this.$.type.name))), {}, fe({}, "".concat(this.$attrSelector), ""))), {}, fe({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return j(e) || un(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, s = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = M(r), m = M(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: s(e.originalValue),
        value: s(e.value)
      } : s(e, !0);
    },
    _usePT: function(e, n, r, o) {
      var s = function(v) {
        return n(v, r, o);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var a, l = e._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = s(e.originalValue), p = s(e.value);
        return m === void 0 && p === void 0 ? void 0 : j(p) ? p : j(m) ? m : u || !u && p ? c ? this._mergeProps(c, m, p) : w(w({}, m), p) : p;
      }
      return s(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, w(w({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Ne(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((e = o.id) !== null && e !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, w({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, w(w({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, e, w(w({}, this.$params), r)), s = this._getOptionValue(Rt.inlineStyles, e, w(w({}, this.$params), r));
        return [s, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return N(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, w({}, n.$params)) || N(r, w({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = me(r, 1), s = o[0];
        return n?.includes(s);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return w(w({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = me(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = me(n, 2), o = r[0], s = r[1], a = o.split(":"), l = ni(a), i = Ze(l).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? s : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = me(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = me(n, 2), o = r[0], s = r[1];
        return e[o] = s, e;
      }, {});
    }
  }
}, li = "\n    .p-contextmenu {\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n        min-width: 12.5rem;\n    }\n\n    .p-contextmenu-root-list,\n    .p-contextmenu-submenu {\n        margin: 0;\n        padding: dt('contextmenu.list.padding');\n        list-style: none;\n        outline: 0 none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('contextmenu.list.gap');\n    }\n\n    .p-contextmenu-submenu {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        min-width: 100%;\n        z-index: 1;\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n    }\n\n    .p-contextmenu-item {\n        position: relative;\n    }\n\n    .p-contextmenu-item-content {\n        transition:\n            background dt('contextmenu.transition.duration'),\n            color dt('contextmenu.transition.duration');\n        border-radius: dt('contextmenu.item.border.radius');\n        color: dt('contextmenu.item.color');\n    }\n\n    .p-contextmenu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('contextmenu.item.padding');\n        gap: dt('contextmenu.item.gap');\n        user-select: none;\n    }\n\n    .p-contextmenu-item-label {\n        line-height: 1;\n    }\n\n    .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.color');\n    }\n\n    .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.color');\n        margin-left: auto;\n        font-size: dt('contextmenu.submenu.icon.size');\n        width: dt('contextmenu.submenu.icon.size');\n        height: dt('contextmenu.submenu.icon.size');\n    }\n\n    .p-contextmenu-submenu-icon:dir(rtl) {\n        margin-left: 0;\n        margin-right: auto;\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.active.color');\n        background: dt('contextmenu.item.active.background');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.active.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.active.color');\n    }\n\n    .p-contextmenu-separator {\n        border-block-start: 1px solid dt('contextmenu.separator.border.color');\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu {\n        position: static;\n        box-shadow: none;\n        border: 0 none;\n        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');\n        padding-inline-end: 0;\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu-icon {\n        transition: transform 0.2s;\n        transform: rotate(90deg);\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        transform: rotate(-90deg);\n    }\n", ui = {
  root: function(e) {
    var n = e.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(e) {
    var n = e.instance, r = e.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": n.isItemActive(r),
      "p-focus": n.isItemFocused(r),
      "p-disabled": n.isItemDisabled(r)
    }];
  },
  itemContent: "p-contextmenu-item-content",
  itemLink: "p-contextmenu-item-link",
  itemIcon: "p-contextmenu-item-icon",
  itemLabel: "p-contextmenu-item-label",
  submenuIcon: "p-contextmenu-submenu-icon",
  submenu: "p-contextmenu-submenu",
  separator: "p-contextmenu-separator"
};
x.extend({
  name: "contextmenu",
  style: li,
  classes: ui
});
var ci = "\n.p-icon {\n    display: inline-block;\n    vertical-align: baseline;\n    flex-shrink: 0;\n}\n\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n\n@-webkit-keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n\n@keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n", di = x.extend({
  name: "baseicon",
  css: ci
});
function Se(t) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Se(t);
}
function Vt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Dt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Vt(Object(n), !0).forEach(function(r) {
      mi(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function mi(t, e, n) {
  return (e = pi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pi(t) {
  var e = fi(t, "string");
  return Se(e) == "symbol" ? e : e + "";
}
function fi(t, e) {
  if (Se(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var gs = {
  name: "BaseIcon",
  extends: ai,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: di,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Ce(this.label);
      return Dt(Dt({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function $e(t) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, $e(t);
}
function Mt(t, e) {
  return yi(t) || vi(t, e) || gi(t, e) || hi();
}
function hi() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function gi(t, e) {
  if (t) {
    if (typeof t == "string") return Bt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(t, e) : void 0;
  }
}
function Bt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function vi(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function yi(t) {
  if (Array.isArray(t)) return t;
}
function Ut(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ut(Object(n), !0).forEach(function(r) {
      Xe(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ut(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Xe(t, e, n) {
  return (e = bi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function bi(t) {
  var e = _i(t, "string");
  return $e(e) == "symbol" ? e : e + "";
}
function _i(t, e) {
  if ($e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var S = {
  _getMeta: function() {
    return [B(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(B(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, o, s;
    return (r = (e == null || (o = e.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: it,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var _ = S._getOptionValue.apply(S, arguments);
      return j(_) || un(_) ? {
        class: _
      } : _;
    }, u = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, p = m === void 0 ? !1 : m, f = l ? S._useDefaultPT(r, r.defaultPT(), i, s, a) : void 0, v = S._usePT(r, S._getPT(o, r.$name), i, s, T(T({}, a), {}, {
      global: f || {}
    })), g = S._getPTDatasets(r, s);
    return c || !c && v ? p ? S._mergeProps(r, p, f, v, g) : T(T(T({}, f), v), g) : T(T({}, v), g);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return T(T({}, n === "root" && Xe({}, "".concat(r, "name"), M(e.$name))), {}, Xe({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, i = r ? r(a) : a, u = M(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: o(e.originalValue),
      value: o(e.value)
    } : o(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, a = function(g) {
      return r(g, o, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, p = a(n.originalValue), f = a(n.value);
      return p === void 0 && f === void 0 ? void 0 : j(f) ? f : j(p) ? p : d || !d && f ? m ? S._mergeProps(e, m, p, f) : T(T({}, p), f) : f;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(e, n, r, o, s);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, s = S._getConfig(r, o), a = {
      nonce: s == null || (e = s.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    S._loadCoreStyles(n, a), S._loadThemeStyles(n, a), S._loadScopedThemeStyles(n, a), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, a);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var s;
      x.loadCSS(o), (s = r.$style) === null || s === void 0 || s.loadCSS(o), G.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (e = o.theme) === null || e === void 0 ? void 0 : e.call(o)) === "none")) {
      if (!C.isStyleNameLoaded("common")) {
        var a, l, i = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        x.load(u?.css, T({
          name: "primitive-variables"
        }, s)), x.load(d?.css, T({
          name: "semantic-variables"
        }, s)), x.load(c?.css, T({
          name: "global-variables"
        }, s)), x.loadStyle(T({
          name: "global-style"
        }, s), m), C.setLoadedStyleName("common");
      }
      if (!C.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, f, v, g, y = ((p = o.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, _ = y.css, $ = y.style;
        (v = o.$style) === null || v === void 0 || v.load(_, T({
          name: "".concat(o.$style.name, "-variables")
        }, s)), (g = o.$style) === null || g === void 0 || g.loadStyle(T({
          name: "".concat(o.$style.name, "-style")
        }, s), $), C.setLoadedStyleName(o.$style.name);
      }
      if (!C.isStyleNameLoaded("layer-order")) {
        var h, b, k = (h = o.$style) === null || h === void 0 || (b = h.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(h);
        x.load(k, T({
          name: "layer-order",
          first: !0
        }, s)), C.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var o, s, a, l = ((o = e.$style) === null || o === void 0 || (s = o.getPresetTheme) === null || s === void 0 ? void 0 : s.call(o, r, "[".concat(e.$attrSelector, "]"))) || {}, i = l.css, u = (a = e.$style) === null || a === void 0 ? void 0 : a.load(i, T({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), L.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, o, s, a) {
    var l, i, u = "on".concat(Zr(n)), d = S._getConfig(o, s), c = r?.$instance, m = S._usePT(c, S._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, e), S._getOptionValue, "hooks.".concat(u)), p = S._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[e], S._getOptionValue, "hooks.".concat(u)), f = {
      el: r,
      binding: o,
      vnode: s,
      prevVnode: a
    };
    m?.(c, f), p?.(c, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ue(e) ? e.apply(void 0, r) : Ne.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, d, c) {
      var m, p, f, v;
      i._$instances = i._$instances || {};
      var g = S._getConfig(u, d), y = i._$instances[e] || {}, _ = Ce(y) ? T(T({}, n), n?.methods) : {};
      i._$instances[e] = T(T({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
        $style: T({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: g,
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[e]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(g?.pt, void 0, function(h) {
            var b;
            return h == null || (b = h.directives) === null || b === void 0 ? void 0 : b[e];
          });
        },
        isUnstyled: function() {
          var h, b;
          return ((h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (b = i._$instances[e]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = i._$instances[e]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(i._$instances[e], (h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, b, T({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(i._$instances[e], h, b, k, !1);
        },
        cx: function() {
          var h, b, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : S._getOptionValue((b = i._$instances[e]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, k, T({}, E));
        },
        sx: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? S._getOptionValue((h = i._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, b, T({}, E)) : void 0;
        }
      }, _), i.$instance = i._$instances[e], (p = (f = i.$instance)[l]) === null || p === void 0 || p.call(f, i, u, d, c), i["$".concat(e)] = i.$instance, S._hook(e, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[e] = T(T({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: i._$instances[e]
      });
    }, o = function(l) {
      var i, u, d, c = l._$instances[e], m = c?.watch, p = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(c, _, $);
      }, f = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, _, $);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), J.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), J.on("config:ripple:change", f);
    }, s = function(l) {
      var i = l._$instances[e].$watchersCallback;
      i && (J.off("config:change", i.config), J.off("config:ripple:change", i["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: ho("pd")
        }, r("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        S._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", l, i, u, d), o(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        S._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        r("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        S._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        s(l), S._removeThemeListeners((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var e = S._getMeta.apply(S, arguments), n = Mt(e, 2), r = n[0], o = n[1];
    return T({
      extend: function() {
        var a = S._getMeta.apply(S, arguments), l = Mt(a, 2), i = l[0], u = l[1];
        return S.extend(i, T(T(T({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, Si = "\n    .p-ink {\n        display: block;\n        position: absolute;\n        background: dt('ripple.background');\n        border-radius: 100%;\n        transform: scale(0);\n        pointer-events: none;\n    }\n\n    .p-ink-active {\n        animation: ripple 0.4s linear;\n    }\n\n    @keyframes ripple {\n        100% {\n            opacity: 0;\n            transform: scale(2.5);\n        }\n    }\n", $i = {
  root: "p-ink"
}, wi = x.extend({
  name: "ripple-directive",
  style: Si,
  classes: $i
}), Ti = S.extend({
  style: wi
});
function we(t) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, we(t);
}
function Ci(t) {
  return ki(t) || xi(t) || Oi(t) || Pi();
}
function Pi() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Oi(t, e) {
  if (t) {
    if (typeof t == "string") return et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(t, e) : void 0;
  }
}
function xi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ki(t) {
  if (Array.isArray(t)) return et(t);
}
function et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Wt(t, e, n) {
  return (e = Ei(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ei(t) {
  var e = Li(t, "string");
  return we(e) == "symbol" ? e : e + "";
}
function Li(t, e) {
  if (we(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vs = Ti.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = ao("span", Wt(Wt({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, r = e.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && He(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !bt(o) && !_t(o)) {
          var s = Math.max(io(r), mo(r));
          o.style.height = s + "px", o.style.width = s + "px";
        }
        var a = co(r), l = e.pageX - a.left + document.body.scrollTop - _t(o) / 2, i = e.pageY - a.top + document.body.scrollLeft - bt(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && to(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && He(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && He(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Ci(e.children).find(function(n) {
        return uo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function Ai(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function ji(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, Ri(r.key), r);
  }
}
function Ni(t, e, n) {
  return e && ji(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Ri(t) {
  var e = Ii(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function Ii(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var ys = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ai(this, t), this.element = e, this.listener = n;
  }
  return Ni(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = po(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), bs = st(), Vi = "\n    .p-menu {\n        background: dt('menu.background');\n        color: dt('menu.color');\n        border: 1px solid dt('menu.border.color');\n        border-radius: dt('menu.border.radius');\n        min-width: 12.5rem;\n    }\n\n    .p-menu-list {\n        margin: 0;\n        padding: dt('menu.list.padding');\n        outline: 0 none;\n        list-style: none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('menu.list.gap');\n    }\n\n    .p-menu-item-content {\n        transition:\n            background dt('menu.transition.duration'),\n            color dt('menu.transition.duration');\n        border-radius: dt('menu.item.border.radius');\n        color: dt('menu.item.color');\n        overflow: hidden;\n    }\n\n    .p-menu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('menu.item.padding');\n        gap: dt('menu.item.gap');\n        user-select: none;\n        outline: 0 none;\n    }\n\n    .p-menu-item-label {\n        line-height: 1;\n    }\n\n    .p-menu-item-icon {\n        color: dt('menu.item.icon.color');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-content {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-overlay {\n        box-shadow: dt('menu.shadow');\n    }\n\n    .p-menu-submenu-label {\n        background: dt('menu.submenu.label.background');\n        padding: dt('menu.submenu.label.padding');\n        color: dt('menu.submenu.label.color');\n        font-weight: dt('menu.submenu.label.font.weight');\n    }\n\n    .p-menu-separator {\n        border-block-start: 1px solid dt('menu.separator.border.color');\n    }\n", Di = {
  root: function(e) {
    var n = e.props;
    return ["p-menu p-component", {
      "p-menu-overlay": n.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(e) {
    var n = e.instance;
    return ["p-menu-item", {
      "p-focus": n.id === n.focusedOptionId,
      "p-disabled": n.disabled()
    }];
  },
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: "p-menu-item-icon",
  itemLabel: "p-menu-item-label"
};
x.extend({
  name: "menu",
  style: Vi,
  classes: Di
});
const Mi = "data-wippy-overlay-layer";
function kn() {
  return typeof window < "u" && typeof window.document < "u";
}
function En() {
  return kn() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function Bi() {
  return En() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Ui = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Wi = 0;
const Me = /* @__PURE__ */ new WeakMap();
function Ht(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Hi(t, e) {
  if (!Ui.test(t.className))
    return;
  const n = t.style.cssText;
  Ht(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!Me.has(t)) {
    const r = new MutationObserver(() => {
      const o = t.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Ht(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), Me.set(t, r);
  }
}
function at(t) {
  const e = Me.get(t);
  e && (e.disconnect(), Me.delete(t));
}
function Fi(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function tt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = "".concat(-window.scrollY - e.top, "px"), t.style.left = "".concat(-window.scrollX - e.left, "px");
}
const Be = /* @__PURE__ */ new Set(), lt = /* @__PURE__ */ new WeakMap();
let Ft = !1, nt = !1;
const zt = ["w-theme-dark", "w-theme-light"], je = "data-wippy-theme-root", rt = /* @__PURE__ */ new WeakMap();
function zi(t) {
  const e = [];
  let n = t ? t.parentNode : null;
  for (; n && n.nodeType === 1; )
    e.push(n), n = n.parentNode;
  return e;
}
function Ki(t, e, n) {
  const r = [...zi(e), n.host], o = () => {
    let a;
    for (const l of r) {
      if (zt.some((i) => l.classList.contains(i))) {
        a = l;
        break;
      }
      if (l.hasAttribute(je))
        break;
    }
    for (const l of zt)
      t.classList.toggle(l, !!(a && a.classList.contains(l)));
    a ? t.setAttribute(je, "") : t.removeAttribute(je);
  };
  o();
  const s = new MutationObserver(o);
  for (const a of r)
    s.observe(a, { attributes: !0, attributeFilter: ["class", je] });
  rt.set(t, s);
}
function Ln(t) {
  rt.get(t)?.disconnect(), rt.delete(t);
}
function Yi() {
  nt = !1;
  for (const t of Be) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && at(e);
      Be.delete(t), lt.get(t)?.disconnect(), Ln(t);
      continue;
    }
    t.childElementCount > 0 && tt(t);
  }
}
function Kt() {
  nt || (nt = !0, requestAnimationFrame(Yi));
}
function qi(t) {
  const e = document.createElement("div");
  e.setAttribute(Mi, "");
  const n = En();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  tt(e);
  const r = new MutationObserver((o) => {
    const s = e.__wippyAnchorName;
    for (const a of o) {
      if (s)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Hi(l, s);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && at(l);
    }
    e.isConnected && e.childElementCount > 0 && tt(e);
  });
  return r.observe(e, { childList: !0 }), lt.set(e, r), Be.add(e), Ft || (Ft = !0, window.addEventListener("scroll", Kt, { capture: !0, passive: !0 }), window.addEventListener("resize", Kt, { passive: !0 })), e;
}
function Yt(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = qi(t.hostRoot), Ki(t.layer, t.$el, t.hostRoot), Bi())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = "--wippy-a-".concat(++Wi), t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function qt(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && at(e);
    Be.delete(t.layer), lt.get(t.layer)?.disconnect(), Ln(t.layer), t.layer.remove(), t.layer = null;
  }
}
let Gt = !1;
function Gi() {
  if (Gt)
    return;
  Gt = !0;
  const t = Cn;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    kn() && (this.hostRoot = Fi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Yt(this), this.$watch("inline", (e) => {
      e ? qt(this) : Yt(this);
    })));
  }, t.render = function() {
    return this.inline ? Ie(this.$slots, "default", { key: 0 }) : this.mounted ? ar(Jt, { key: 1, to: this.resolvedTarget || document.body }, [
      Ie(this.$slots, "default")
    ]) : Qt("", !0);
  }, t.unmounted = function() {
    qt(this);
  };
}
const _s = {
  install: (t) => {
    Gi(), t.use(Xo, { theme: "none" });
  }
};
export {
  ds as $,
  x as B,
  ys as C,
  is as D,
  hs as F,
  as as I,
  os as J,
  cs as L,
  rs as M,
  bs as O,
  _s as P,
  _t as R,
  ss as S,
  bt as T,
  ns as W,
  ps as Y,
  ai as a,
  P as b,
  Cn as c,
  vs as d,
  ms as e,
  Xr as f,
  hn as g,
  ls as h,
  us as i,
  ts as j,
  qr as k,
  Xi as l,
  qe as p,
  gs as s,
  es as u,
  io as v,
  fs as x,
  fn as z
};
//# sourceMappingURL=wc-runtime-vwZ8ys9S.js.map
