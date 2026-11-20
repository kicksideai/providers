import { hasInjectionContext as Wn, inject as De, effectScope as Hn, ref as z, markRaw as zn, createApp as Bn, onMounted as Bt, onUnmounted as Fn, watch as ue, readonly as Kn, getCurrentInstance as it, nextTick as Yn, reactive as Gn, renderSlot as Ne, openBlock as qn, createBlock as Qn, Teleport as Ft, createCommentVNode as Kt, useId as Jn, mergeProps as Ae, h as Zn } from "vue";
import { addCollection as Xn } from "@iconify/vue";
import { config as st, addIcons as er, on as tr, applyThemeMode as Te, host as nr, hostCss as rr, loadCss as or } from "@wippy-fe/proxy";
var Fe = "data-wippy-visible";
function at(e) {
  const t = e.getAttribute(Fe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var ir = Object.defineProperty, Yt = (e) => {
  throw TypeError(e);
}, sr = (e, t, n) => t in e ? ir(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, C = (e, t, n) => sr(e, typeof t != "symbol" ? t + "" : t, n), Gt = (e, t, n) => t.has(e) || Yt("Cannot " + n), ar = (e, t, n) => (Gt(e, t, "read from private field"), n ? n.call(e) : t.get(e)), lr = (e, t, n) => t.has(e) ? Yt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), ur = (e, t, n, r) => (Gt(e, t, "write to private field"), t.set(e, n), n), cr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], dr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(",\n");
function lt(e) {
  const t = e.startsWith("--") ? e : "--".concat(e);
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function mr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, s] of Object.entries(o)) {
            const i = typeof s == "string" ? lt(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? lt(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function pr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => "  ".concat(n, ": inherit;")).join("\n");
  return "".concat(dr, " {\n").concat(t, "\n}");
}
function fr(e, t) {
  const n = pr(t);
  n && qt(e, n, "@wippy-fe/css-variables-bridge");
}
function hr(e, t) {
  const r = (t ?? cr).map(async (o) => {
    const a = rr[o];
    if (!a)
      return console.warn('[wippy-fe/webcomponent-core] hostCss key "'.concat(o, '" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.')), null;
    try {
      return await or(a);
    } catch (l) {
      return console.warn('[wippy-fe/webcomponent-core] Failed to load hostCss "'.concat(o, '" (').concat(a, "):"), l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const l = document.createElement("style");
      l.textContent = a, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function vr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function qt(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function gr(e, t) {
  qt(e, t, "@wippy-fe/custom-css");
}
function Qt(e) {
  return e.__wippyHost ?? null;
}
function yr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function br(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: "Invalid ".concat(e, ": expected a number") } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: "Invalid ".concat(e, ": expected an integer") } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: "Invalid ".concat(e, ": expected a JSON array") } : { value: r };
      } catch {
        return { value: void 0, error: "Invalid ".concat(e, ": must be valid JSON") };
      }
    default:
      return { value: t };
  }
}
function We(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), s = yr(o);
    if (l === null) {
      a.default !== void 0 && (n[s] = a.default);
      continue;
    }
    const i = br(o, l, a);
    i.error ? r.push(i.error) : n[s] = i.value;
  }
  return { props: n, errors: r };
}
var _r = class {
  constructor(e, t) {
    C(this, "_props"), C(this, "_errors"), C(this, "_content"), C(this, "_hostVisibility"), C(this, "_propsListeners", /* @__PURE__ */ new Set()), C(this, "_contentListeners", /* @__PURE__ */ new Set()), C(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), C(this, "_disposed", !1), C(this, "_emitToDom"), C(this, "props"), C(this, "events"), C(this, "content"), C(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
    }, this.content = e.hasContent ? {
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
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const n of this._hostVisibilityListeners)
        n(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, je, Sr = class extends HTMLElement {
  constructor() {
    super(), C(this, "_internals"), C(this, "_contentObserver", null), C(this, "_initialized", !1), C(this, "_container", null), lr(this, je, null), C(this, "_attachment", 0), C(this, "_reactive", null), C(this, "_lastProps", null), C(this, "_lastErrors", []), C(this, "_lastContent", null), C(this, "_themeUnsub", null), C(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = at(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, Fe])];
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
    return Qt(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
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
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const a = We(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new _r(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const e = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, n = this._initialized, r = ar(this, je) ?? ur(this, je, this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" }));
      let o;
      if (this._container)
        o = this._container;
      else {
        if (this.onInit(r), e !== this._attachment)
          return;
        t.inlineCss && vr(r, t.inlineCss);
        try {
          const d = st?.theming, c = mr(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          fr(r, c);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const d = st?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join("\n");
            c && gr(r, c);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && hr(r, t.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const u = t.containerClasses ?? [];
        u.length > 0 && o.classList.add(...u), r.appendChild(o), this._container = o, er(Xn);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = tr("@theme", (u) => this._applyTheme(u)));
      const { props: a, errors: l } = We(this, t.propsSchema);
      t.validateProps && l.push(...t.validateProps(a));
      const s = a;
      this._lastProps = s, this._lastErrors = l;
      let i = null;
      if (t.contentTemplate && (i = this._extractContent(t.contentTemplate), this._lastContent = i, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(t.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, s, l, i, n), e !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), e === this._attachment && this.emitEvent("load");
    } catch (t) {
      if (e !== this._attachment || (this.onError(t), e !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(e = nr.getThemeMode?.()) {
    Te(e, this), this._container && Te(e, this._container);
  }
  disconnectedCallback() {
    const e = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Te("auto", this), this._container && Te("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), e === this._attachment && (this.emitEvent("unload"), e === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Fe) {
      const s = this._hostVisible, i = at(this);
      if (i === s)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, s), this.onHostVisibilityChanged(i, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = We(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = a, this._reactive?.notifyProps(l, a), this.onPropsChanged(l, a);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error("".concat(this.constructor.name, " initialization failed:"), e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
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
  _extractContent(e) {
    const t = this.querySelector('template[data-type="'.concat(e, '"]'));
    return t ? t.content.textContent?.trim() || t.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
je = /* @__PURE__ */ new WeakMap();
function $r(e) {
  return e.__wippyHostBus ?? null;
}
function wr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Jt;
const Zt = (e) => Jt = e, Pr = () => Wn() && De(Xt) || Jt, Xt = (
  /* istanbul ignore next */
  Symbol()
);
function Tr() {
  const e = Hn(!0), t = e.run(() => z({}));
  let n = [], r = [];
  const o = zn({
    install(a) {
      Zt(o), o._a = a, a.provide(Xt, o), a.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
    },
    use(a) {
      return this._a ? n.push(a) : r.push(a), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Or = Object.defineProperty, Cr = (e, t, n) => t in e ? Or(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, W = (e, t, n) => Cr(e, typeof t != "symbol" ? t + "" : t, n);
function ji(e, t) {
  return { lazyConfig: e, mountLifecycle: !0, lazyUi: t };
}
function ut(e, t, n) {
  const r = e.createElement("div"), o = n ? t.failed : t.loading;
  r.dataset.lazyState = n ? "failed" : "loading", r.setAttribute("role", n ? "alert" : "status"), r.setAttribute("aria-label", o), r.style.cssText = "display:grid;place-items:center;text-align:center;";
  const a = t.surface === "page";
  if (r.style.cssText += a ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    r.style.color = "var(--p-danger-500, currentColor)", r.textContent = !a && t.iconOnly ? "⚠" : o, !a && t.iconOnly && (r.title = o);
  else {
    const l = e.createElement("style");
    l.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const s = e.createElement("span");
    s.dataset.wippySpinner = "", s.setAttribute("aria-hidden", "true"), s.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", s.style.fontSize = a ? "2rem" : "1em", r.append(l, s);
  }
  return r;
}
var en = /* @__PURE__ */ Symbol("wippy:emit"), tn = /* @__PURE__ */ Symbol("wippy:props"), xr = /* @__PURE__ */ Symbol("wippy:props_error"), kr = /* @__PURE__ */ Symbol("wippy:content"), Er = /* @__PURE__ */ Symbol("wippy:panel-id"), Lr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ar = /* @__PURE__ */ Symbol("wippy:host"), nn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ni() {
  const e = De(tn);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ri() {
  const e = De(en);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function jr() {
  const e = De(nn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Vi(e) {
  const t = jr();
  let n = !1, r = null, o = !1;
  function a() {
    if (r)
      return o = !0, r;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (i) {
      l = Promise.reject(i);
    }
    const s = l.finally(() => {
      if (r === s && (r = null, n && o))
        return o = !1, a();
    });
    return r = s, s;
  }
  return Bt(() => (n = !0, a())), Fn(() => {
    n = !1, o = !1;
  }), ue(t, (l, s) => {
    if (n && s === !1 && l === !0)
      return a();
  }), t;
}
var Oe = /* @__PURE__ */ new WeakMap();
function ct(e, t) {
  const n = Oe.get(e);
  if (n)
    return n;
  const r = Promise.resolve().then(t);
  return Oe.set(e, r), r.catch(() => {
    Oe.get(e) === r && Oe.delete(e);
  }), r;
}
var Ii = class extends Sr {
  constructor() {
    super(...arguments), W(this, "_vueApp", null), W(this, "_mountingApp", !1), W(this, "_mountState", "idle"), W(this, "_feedback", null), W(this, "_propsRef", z({})), W(this, "_errorsRef", z([])), W(this, "_contentRef", z(null)), W(this, "_hostVisibilityRef", z(null)), W(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const e = this.vueConfig;
    e.mountLifecycle && !e.rootComponent && e.lazyConfig && await ct(this, e.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(e, t, n, r, o, a) {
    const l = this.constructor, s = l.vueConfig, i = new AbortController();
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
      const m = Pr(), p = Bn(c.rootComponent);
      let f = !1, g = !1, v, b;
      this._mountingApp = !0;
      try {
        const _ = Tr();
        if (c.piniaPlugins)
          for (const $ of c.piniaPlugins)
            _.use($);
        p.use(_);
        for (const $ of c.plugins ?? [])
          p.use($);
        if (p.provide(tn, this._propsRef), p.provide(xr, this._errorsRef), p.provide(en, this.emitEvent.bind(this)), p.provide(kr, this._contentRef), p.provide(nn, this._hostVisibilityRef), p.provide(Er, wr(this)), p.provide(Lr, $r(this)), p.provide(Ar, Qt(this)), c.providers?.(p, this), !u())
          return;
        if (b = p.config.errorHandler, s.mountLifecycle && (p.config.errorHandler = ($, h, y) => {
          g || (v = $), g = !0, b?.($, h, y);
        }), p.mount(t), f = !0, g)
          throw v;
        u() && (this._vueApp = p);
      } finally {
        s.mountLifecycle && f && (p.config.errorHandler = b);
        try {
          f && (g || !u()) && p.unmount();
        } finally {
          Zt(m), this._mountingApp = !1;
        }
      }
      s.mountLifecycle && queueMicrotask(() => {
        u() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (s.rootComponent) {
      if (this._mountingApp && s.mountLifecycle) {
        queueMicrotask(() => {
          try {
            d(s);
          } catch (c) {
            u() && (this._mountState = "failed", this.emitEvent("error", { message: c instanceof Error ? c.message : String(c), error: c }));
          }
        });
        return;
      }
      try {
        d(s);
      } catch (c) {
        if (u())
          throw this._mountState = "failed", c;
      }
    } else if (s.lazyConfig) {
      const c = t.ownerDocument, m = s.lazyUi;
      m?.surface === "page" && (t.style.blockSize = "100%", t.style.minBlockSize = "0");
      let p = !1, f, g;
      const v = () => {
        clearTimeout(f), clearTimeout(g), this._feedback?.remove(), this._feedback = null;
      };
      i.signal.addEventListener("abort", v, { once: !0 });
      const b = () => {
        if (!u() || p)
          return;
        const y = m ? ut(c, m, !1) : c.createElement("wippy-loading");
        y.setAttribute("no-bg", ""), this._feedback = y, t.appendChild(y);
      }, _ = (y) => {
        if (!u())
          return;
        p = !0, v(), this._mountState = "failed";
        const k = m?.failed ?? (y instanceof Error ? y.message : String(y)), E = m ? ut(c, m, !0) : c.createElement("wippy-error");
        m || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", k)), this._feedback = E, t.appendChild(E), this.emitEvent("error", m ? { message: k, error: y } : { message: k });
      }, $ = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      $ > 0 ? f = setTimeout(b, $) : b(), m && (g = setTimeout(() => _(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (s.mountLifecycle ? ct(l, s.lazyConfig) : s.lazyConfig()).then((y) => {
        !u() || p || (p = !0, v(), d(y));
      }, (y) => {
        p || _(y);
      }).catch(_);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const e = this._vueApp;
    this._vueApp = null, e?.unmount();
  }
}, Nr = Object.defineProperty, dt = Object.getOwnPropertySymbols, Rr = Object.prototype.hasOwnProperty, Vr = Object.prototype.propertyIsEnumerable, mt = (e, t, n) => t in e ? Nr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ir = (e, t) => {
  for (var n in t || (t = {})) Rr.call(t, n) && mt(e, n, t[n]);
  if (dt) for (var n of dt(t)) Vr.call(t, n) && mt(e, n, t[n]);
  return e;
};
function $e(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ke(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, l, s;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (a = l; a-- !== 0; ) if (!Ke(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (l = m.length, l !== Object.keys(t).length) return !1;
  for (a = l; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[a])) return !1;
  for (a = l; a-- !== 0; ) if (s = m[a], !Ke(e[s], t[s], n)) return !1;
  return !0;
}
function Mr(e, t) {
  return Ke(e, t);
}
function Ue(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function O(e) {
  return !$e(e);
}
function pt(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (O(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ue(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, a = n.length; o < a; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function Mi(e, t, n) {
  return n ? pt(e, n) === pt(t, n) : Mr(e, t);
}
function D(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function rn(e = {}, t = {}) {
  let n = Ir({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    D(t[o]) && o in e && D(e[o]) ? n[o] = rn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Dr(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : rn(t, n), {});
}
function N(e, ...t) {
  return Ue(e) ? e(...t) : e;
}
function j(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function M(e) {
  return j(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function et(e, t = "", n = {}) {
  let r = M(t).split("."), o = r.shift();
  if (o) {
    if (D(e)) {
      let a = Object.keys(e).find((l) => M(l) === o) || "";
      return et(N(e[a], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function on(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Ur(e) {
  return O(e) && !isNaN(e);
}
function ne(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Wr(...e) {
  return Dr(...e);
}
function pe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Hr(e) {
  return j(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function sn(e) {
  return j(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function an() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function zr(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [zr(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        t = a.length ? t.concat(a.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Br(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Fr(e, t) {
  if (e && t) {
    let n = (r) => {
      Br(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function He(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function ft(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Kr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Yr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Gr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Yr(e));
}
function we(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Di() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function Re(e, t = {}) {
  if (we(e)) {
    let n = (r, o) => {
      var a, l;
      let s = (a = e?.$attrs) != null && a[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
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
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Re(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function qr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Re(r, t), r.append(...n), r;
  }
}
function Qr(e, t) {
  return we(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Jr(e, t) {
  if (we(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function ht(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Zr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || ft(document.documentElement) || ft(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Xr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ui() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function vt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function ln() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function eo(e, t = "", n) {
  we(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ce = {};
function to(e = "pui_id_") {
  return Object.hasOwn(Ce, e) || (Ce[e] = 0), Ce[e]++, "".concat(e).concat(Ce[e]);
}
var no = Object.defineProperty, ro = Object.defineProperties, oo = Object.getOwnPropertyDescriptors, Ve = Object.getOwnPropertySymbols, un = Object.prototype.hasOwnProperty, cn = Object.prototype.propertyIsEnumerable, gt = (e, t, n) => t in e ? no(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) un.call(t, n) && gt(e, n, t[n]);
  if (Ve) for (var n of Ve(t)) cn.call(t, n) && gt(e, n, t[n]);
  return e;
}, ze = (e, t) => ro(e, oo(t)), H = (e, t) => {
  var n = {};
  for (var r in e) un.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Ve) for (var r of Ve(e)) t.indexOf(r) < 0 && cn.call(e, r) && (n[r] = e[r]);
  return n;
}, io = an(), L = io, fe = /{([^}]*)}/g, dn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, mn = /var\([^)]+\)/g;
function yt(e) {
  return j(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function so(e) {
  return D(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ao(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ye(e = "", t = "") {
  return ao("".concat(j(e, !1) && j(t, !1) ? "".concat(e, "-") : e).concat(t));
}
function pn(e = "", t = "") {
  return "--".concat(Ye(e, t));
}
function lo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function fn(e, t = "", n = "", r = [], o) {
  if (j(e)) {
    let a = e.trim();
    if (lo(a)) return;
    if (ne(a, fe)) {
      let l = a.replaceAll(fe, (s) => {
        let i = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => ne(u, d)));
        return "var(".concat(pn(n, sn(i.join("-")))).concat(O(o) ? ", ".concat(o) : "", ")");
      });
      return ne(l.replace(mn, "0"), dn) ? "calc(".concat(l, ")") : l;
    }
    return a;
  } else if (Ur(e)) return e;
}
function uo(e, t, n) {
  j(t, !1) && e.push("".concat(t, ":").concat(n, ";"));
}
function le(e, t) {
  return e ? "".concat(e, "{").concat(t, "}") : "";
}
function hn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, s) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= l.length; ) {
      let p = l[u];
      if ((p === '"' || p === "'" || p === "`") && l[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && m++, p === ")" && m--, (p === "," || u === l.length) && m === 0)) {
        let f = d.trim();
        f.startsWith("dt(") ? i.push(hn(f, s)) : i.push(r(f)), d = "", u++;
        continue;
      }
      p !== void 0 && (d += p), u++;
    }
    return i;
  }
  function r(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let o = [], a = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") a.push(l), l += 2;
  else if (e[l] === ")" && a.length > 0) {
    let s = a.pop();
    a.length === 0 && o.push([s, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, i] = o[l], u = e.slice(s + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, s) + c + e.slice(i + 1);
  }
  return e;
}
var re = (...e) => co(T.getTheme(), ...e), co = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = T.defaults || {}, { prefix: l, transform: s } = e?.options || a || {}, i = ne(t, fe) ? t : "{".concat(t, "}");
    return r === "value" || $e(r) && s === "strict" ? T.getTokenValue(t) : fn(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function xe(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var l;
      return r + o + ((l = N(t[a], { dt: re })) != null ? l : "");
    }, "");
    return hn(n, re);
  }
  return N(e, { dt: re });
}
function mo(e, t = {}) {
  let n = T.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, l = [], s = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let p = d[m], f = so(p), g = ne(m, a) ? Ye(c) : Ye(c, sn(m));
      if (D(f)) i.push({ node: f, path: g });
      else {
        let v = pn(g), b = fn(f, g, r, [a]);
        uo(s, v, b);
        let _ = g;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), l.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: le(o, u) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: ":root".concat(e, ",:host").concat(e), matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return mo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l, s, i, u, d, c;
  let { preset: m, options: p } = t, f, g, v, b, _, $, h;
  if (O(m) && p.transform !== "strict") {
    let { primitive: y, semantic: k, extend: E } = m, B = k || {}, { colorScheme: F } = B, Q = H(B, ["colorScheme"]), K = E || {}, { colorScheme: J } = K, Z = H(K, ["colorScheme"]), Y = F || {}, { dark: X } = Y, oe = H(Y, ["dark"]), ee = J || {}, { dark: ie } = ee, se = H(ee, ["dark"]), U = O(y) ? this._toVariables({ primitive: y }, p) : {}, I = O(Q) ? this._toVariables({ semantic: Q }, p) : {}, te = O(oe) ? this._toVariables({ light: oe }, p) : {}, Pe = O(X) ? this._toVariables({ dark: X }, p) : {}, ae = O(Z) ? this._toVariables({ semantic: Z }, p) : {}, rt = O(se) ? this._toVariables({ light: se }, p) : {}, ot = O(ie) ? this._toVariables({ dark: ie }, p) : {}, [wn, Pn] = [(a = U.declarations) != null ? a : "", U.tokens], [Tn, On] = [(l = I.declarations) != null ? l : "", I.tokens || []], [Cn, xn] = [(s = te.declarations) != null ? s : "", te.tokens || []], [kn, En] = [(i = Pe.declarations) != null ? i : "", Pe.tokens || []], [Ln, An] = [(u = ae.declarations) != null ? u : "", ae.tokens || []], [jn, Nn] = [(d = rt.declarations) != null ? d : "", rt.tokens || []], [Rn, Vn] = [(c = ot.declarations) != null ? c : "", ot.tokens || []];
    f = this.transformCSS(e, wn, "light", "variable", p, r, o), g = Pn;
    let In = this.transformCSS(e, "".concat(Tn).concat(Cn), "light", "variable", p, r, o), Mn = this.transformCSS(e, "".concat(kn), "dark", "variable", p, r, o);
    v = "".concat(In).concat(Mn), b = [.../* @__PURE__ */ new Set([...On, ...xn, ...En])];
    let Dn = this.transformCSS(e, "".concat(Ln).concat(jn, "color-scheme:light"), "light", "variable", p, r, o), Un = this.transformCSS(e, "".concat(Rn, "color-scheme:dark"), "dark", "variable", p, r, o);
    _ = "".concat(Dn).concat(Un), $ = [.../* @__PURE__ */ new Set([...An, ...Nn, ...Vn])], h = N(m.css, { dt: re });
  }
  return { primitive: { css: f, tokens: g }, semantic: { css: v, tokens: b }, global: { css: _, tokens: $ }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: l }) {
  var s, i, u;
  let d, c, m;
  if (O(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), f = t, { colorScheme: g, extend: v, css: b } = f, _ = H(f, ["colorScheme", "extend", "css"]), $ = v || {}, { colorScheme: h } = $, y = H($, ["colorScheme"]), k = g || {}, { dark: E } = k, B = H(k, ["dark"]), F = h || {}, { dark: Q } = F, K = H(F, ["dark"]), J = O(_) ? this._toVariables({ [p]: V(V({}, _), y) }, n) : {}, Z = O(B) ? this._toVariables({ [p]: V(V({}, B), K) }, n) : {}, Y = O(E) ? this._toVariables({ [p]: V(V({}, E), Q) }, n) : {}, [X, oe] = [(s = J.declarations) != null ? s : "", J.tokens || []], [ee, ie] = [(i = Z.declarations) != null ? i : "", Z.tokens || []], [se, U] = [(u = Y.declarations) != null ? u : "", Y.tokens || []], I = this.transformCSS(p, "".concat(X).concat(ee), "light", "variable", n, o, a, l), te = this.transformCSS(p, se, "dark", "variable", n, o, a, l);
    d = "".concat(I).concat(te), c = [.../* @__PURE__ */ new Set([...oe, ...ie, ...U])], m = N(b, { dt: re });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: l, options: s } = t, i = (a = l?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l;
  let s = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((a = i?.components) == null ? void 0 : a[s]) || ((l = i?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? "@layer ".concat(N(o.order || o.name || "primeui", n)) : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), s = Object.entries(r).reduce((i, [u, d]) => i.push("".concat(u, '="').concat(d, '"')) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [u, d]) => {
    if (D(d) && Object.hasOwn(d, "css")) {
      let c = pe(d.css), m = "".concat(u, "-variables");
      i.push('<style type="text/css" data-primevue-style-id="'.concat(m, '" ').concat(s, ">").concat(c, "</style>"));
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var l;
  let s = { name: e, theme: t, params: n, set: o, defaults: a }, i = (l = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(r).reduce((d, [c, m]) => d.push("".concat(c, '="').concat(m, '"')) && d, []).join(" ");
  return i ? '<style type="text/css" data-primevue-style-id="'.concat(e, '-variables" ').concat(u, ">").concat(pe(i), "</style>") : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(s, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn("Circular reference detected at ".concat(this.path)), { colorScheme: s, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && fe.test(this.value)) {
      let c = this.value.trim().replace(fe, (m) => {
        var p;
        let f = m.slice(1, -1), g = this.tokens[f];
        if (!g) return console.warn("Token not found for path: ".concat(f)), "__UNRESOLVED__";
        let v = g.computed(s, i, u);
        return Array.isArray(v) && v.length === 2 ? "light-dark(".concat(v[0].value, ",").concat(v[1].value, ")") : (p = v?.value) != null ? p : "__UNRESOLVED__";
      });
      d = dn.test(c.replace(mn, "0")) ? "calc(".concat(c, ")") : c;
    }
    return $e(i.binding) && delete i.binding, u.pop(), { colorScheme: s, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (s, i, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let m = ne(d, t.variable.excludedKeyRegex) ? i : i ? "".concat(i, ".").concat(yt(d)) : yt(d), p = u ? "".concat(u, ".").concat(d) : d;
      D(c) ? l(c, m, p) : (o[m] || (o[m] = { paths: [], computed: (f, g = {}, v = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, g.binding, v);
        if (f && f !== "none") for (let b = 0; b < o[m].paths.length; b++) {
          let _ = o[m].paths[b];
          if (_.scheme === f) return _.computed(f, g.binding, v);
        }
        return o[m].paths.map((b) => b.computed(b.scheme, g[b.scheme], v));
      } }), o[m].paths.push({ path: p, value: c, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((i) => !ne(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, i) => {
    let u = i, { colorScheme: d } = u, c = H(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? le(O(t) ? "".concat(e).concat(t, ",").concat(e, " ").concat(t) : e, r) : le(e, le(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, l, s) {
  if (O(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, l);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (O(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, s, c, t)), d), "") : le(s ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      D(i) && (u.name = N(i.name, { name: e, type: r })), O(u.name) && (t = le("@layer ".concat(u.name), t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, T = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = ze(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), L.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = ze(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), L.emit("preset:change", e), L.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = ze(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), L.emit("options:change", e), L.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return R.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return R.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return R.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return R.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return R.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return R.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), L.emit("theme:".concat(t, ":load"), e), !this._loadingStyles.size && L.emit("theme:load"));
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
}, po = "\n    *,\n    ::before,\n    ::after {\n        box-sizing: border-box;\n    }\n\n    .p-collapsible-enter-active {\n        animation: p-animate-collapsible-expand 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    .p-collapsible-leave-active {\n        animation: p-animate-collapsible-collapse 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    @keyframes p-animate-collapsible-expand {\n        from {\n            grid-template-rows: 0fr;\n        }\n        to {\n            grid-template-rows: 1fr;\n        }\n    }\n\n    @keyframes p-animate-collapsible-collapse {\n        from {\n            grid-template-rows: 1fr;\n        }\n        to {\n            grid-template-rows: 0fr;\n        }\n    }\n\n    .p-disabled,\n    .p-disabled * {\n        cursor: default;\n        pointer-events: none;\n        user-select: none;\n    }\n\n    .p-disabled,\n    .p-component:disabled {\n        opacity: dt('disabled.opacity');\n    }\n\n    .pi {\n        font-size: dt('icon.size');\n    }\n\n    .p-icon {\n        width: dt('icon.size');\n        height: dt('icon.size');\n    }\n\n    .p-overlay-mask {\n        background: var(--px-mask-background, dt('mask.background'));\n        color: dt('mask.color');\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n    }\n\n    .p-overlay-mask-enter-active {\n        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;\n    }\n\n    .p-overlay-mask-leave-active {\n        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;\n    }\n\n    @keyframes p-animate-overlay-mask-enter {\n        from {\n            background: transparent;\n        }\n        to {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n    }\n    @keyframes p-animate-overlay-mask-leave {\n        from {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n        to {\n            background: transparent;\n        }\n    }\n\n    .p-anchored-overlay-enter-active {\n        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    .p-anchored-overlay-leave-active {\n        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    @keyframes p-animate-anchored-overlay-enter {\n        from {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n\n    @keyframes p-animate-anchored-overlay-leave {\n        to {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n";
function he(e) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, he(e);
}
function bt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? bt(Object(n), !0).forEach(function(r) {
      fo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fo(e, t, n) {
  return (t = ho(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ho(e) {
  var t = vo(e, "string");
  return he(t) == "symbol" ? t : t + "";
}
function vo(e, t) {
  if (he(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (he(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function go(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  it() && it().components ? Bt(e) : t ? e() : Yn(e);
}
var yo = 0;
function bo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = z(!1), r = z(e), o = z(null), a = ln() ? window.document : void 0, l = t.document, s = l === void 0 ? a : l, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, p = m === void 0 ? "style_".concat(++yo) : m, f = t.id, g = f === void 0 ? void 0 : f, v = t.media, b = v === void 0 ? void 0 : v, _ = t.nonce, $ = _ === void 0 ? void 0 : _, h = t.first, y = h === void 0 ? !1 : h, k = t.onMounted, E = k === void 0 ? void 0 : k, B = t.onUpdated, F = B === void 0 ? void 0 : B, Q = t.onLoad, K = Q === void 0 ? void 0 : Q, J = t.props, Z = J === void 0 ? {} : J, Y = function() {
  }, X = function(ie) {
    var se = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var U = _t(_t({}, Z), se), I = U.name || p, te = U.id || g, Pe = U.nonce || $;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(I, '"]')) || s.getElementById(te) || s.createElement("style"), o.value.isConnected || (r.value = ie || e, Re(o.value, {
        type: "text/css",
        id: te,
        media: b,
        nonce: Pe
      }), y ? s.head.prepend(o.value) : s.head.appendChild(o.value), eo(o.value, "data-primevue-style-id", I), Re(o.value, U), o.value.onload = function(ae) {
        return K?.(ae, {
          name: I
        });
      }, E?.(I)), !n.value && (Y = ue(r, function(ae) {
        o.value.textContent = ae, F?.(I);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, oe = function() {
    !s || !n.value || (Y(), Gr(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && go(X), {
    id: g,
    name: p,
    el: o,
    css: r,
    unload: oe,
    load: X,
    isLoaded: Kn(n)
  };
}
function ve(e) {
  "@babel/helpers - typeof";
  return ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ve(e);
}
var St, $t, wt, Pt;
function Tt(e, t) {
  return wo(e) || $o(e, t) || So(e, t) || _o();
}
function _o() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function So(e, t) {
  if (e) {
    if (typeof e == "string") return Ot(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ot(e, t) : void 0;
  }
}
function Ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function $o(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function wo(e) {
  if (Array.isArray(e)) return e;
}
function Ct(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Be(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ct(Object(n), !0).forEach(function(r) {
      Po(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ct(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Po(e, t, n) {
  return (t = To(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function To(e) {
  var t = Oo(e, "string");
  return ve(t) == "symbol" ? t : t + "";
}
function Oo(e, t) {
  if (ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ve(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ke(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Co = function(t) {
  var n = t.dt;
  return "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    opacity: 0;\n    overflow: hidden;\n    padding: 0;\n    pointer-events: none;\n    position: absolute;\n    white-space: nowrap;\n    width: 1px;\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n    padding-right: ".concat(n("scrollbar.width"), ";\n}\n");
}, xo = {}, ko = {}, x = {
  name: "base",
  css: Co,
  style: po,
  classes: xo,
  inlineStyles: ko,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(xe(St || (St = ke(["", ""])), t));
    return O(o) ? bo(pe(o), Be({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return T.transformCSS(n.name || t.name, "".concat(o).concat(xe($t || ($t = ke(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return T.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return T.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return T.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return T.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return T.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: re
      }) || "", o = pe(xe(wt || (wt = ke(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(l, s) {
        var i = Tt(s, 2), u = i[0], d = i[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
      }, []).join(" ");
      return O(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return T.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [T.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = xe(Pt || (Pt = ke(["", ""])), N(this.style, {
        dt: re
      })), l = pe(T.transformCSS(o, a)), s = Object.entries(n).reduce(function(i, u) {
        var d = Tt(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      O(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Be(Be({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, q = an();
function ge(e) {
  "@babel/helpers - typeof";
  return ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ge(e);
}
function xt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xt(Object(n), !0).forEach(function(r) {
      Eo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Eo(e, t, n) {
  return (t = Lo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Lo(e) {
  var t = Ao(e, "string");
  return ge(t) == "symbol" ? t : t + "";
}
function Ao(e, t) {
  if (ge(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jo = {
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
}, No = Symbol();
function Ro(e, t) {
  var n = {
    config: Gn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(No, n), Vo(), Io(e, n), n;
}
var ce = [];
function Vo() {
  L.clear(), ce.forEach(function(e) {
    return e?.();
  }), ce = [];
}
function Io(e, t) {
  var n = z(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !T.isStyleNameLoaded("common")) {
      var d, c, m = ((d = x.getCommonTheme) === null || d === void 0 ? void 0 : d.call(x)) || {}, p = m.primitive, f = m.semantic, g = m.global, v = m.style, b = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      x.load(p?.css, Ee({
        name: "primitive-variables"
      }, b)), x.load(f?.css, Ee({
        name: "semantic-variables"
      }, b)), x.load(g?.css, Ee({
        name: "global-variables"
      }, b)), x.loadStyle(Ee({
        name: "global-style"
      }, b), v), T.setLoadedStyleName("common");
    }
  };
  L.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ue(t.config, function(i, u) {
    q.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ue(function() {
    return t.config.ripple;
  }, function(i, u) {
    q.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = ue(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || T.setTheme(i), t.config.unstyled || r(), n.value = !1, q.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ue(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), q.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ce.push(o), ce.push(a), ce.push(l), ce.push(s);
}
var Mo = {
  install: function(t, n) {
    var r = Wr(jo, n);
    Ro(t, r);
  }
}, vn = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = ln();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Do(e, t, n, r, o, a) {
  return a.inline ? Ne(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (qn(), Qn(Ft, {
    key: 1,
    to: n.appendTo
  }, [Ne(e.$slots, "default")], 8, ["to"])) : Kt("", !0);
}
vn.render = Do;
var G = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(t) {
    return this._loadedStyleNames.has(t);
  },
  setLoadedStyleName: function(t) {
    this._loadedStyleNames.add(t);
  },
  deleteLoadedStyleName: function(t) {
    this._loadedStyleNames.delete(t);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function Uo() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Jn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var kt = x.extend({
  name: "common"
});
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ye(e);
}
function Wo(e) {
  return bn(e) || Ho(e) || yn(e) || gn();
}
function Ho(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function de(e, t) {
  return bn(e) || zo(e, t) || yn(e, t) || gn();
}
function gn() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function yn(e, t) {
  if (e) {
    if (typeof e == "string") return Ge(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ge(e, t) : void 0;
  }
}
function Ge(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function bn(e) {
  if (Array.isArray(e)) return e;
}
function Et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Et(Object(n), !0).forEach(function(r) {
      me(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Et(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function me(e, t, n) {
  return (t = Bo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bo(e) {
  var t = Fo(e, "string");
  return ye(t) == "symbol" ? t : t + "";
}
function Fo(e, t) {
  if (ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ko = {
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
      handler: function(t) {
        L.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        L.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, r, o, a, l, s, i, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var g = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, v = g ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, b = g ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = b || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Uo(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Qr(we(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
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
    _hook: function(t) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), r?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ue(t) ? t.apply(void 0, r) : Ae.apply(void 0, r);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (x.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (kt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      O(t) && x.load(t, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!T.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = a.primitive, s = a.semantic, i = a.global, u = a.style;
          x.load(l?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), x.load(s?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), x.load(i?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), x.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), u), T.setLoadedStyleName("common");
        }
        if (!T.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, p, f = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, g = f.css, v = f.style;
          (m = this.$style) === null || m === void 0 || m.load(g, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), T.setLoadedStyleName(this.$style.name);
        }
        if (!T.isStyleNameLoaded("layer-order")) {
          var b, _, $ = (b = this.$style) === null || b === void 0 || (_ = b.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(b);
          x.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), T.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, w({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      G.clearLoadedStyleNames(), L.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return et(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, m = a ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, w(w({}, o), {}, {
        global: m || {}
      })), f = this._getPTDatasets(r);
      return u || !u && p ? c ? this._mergeProps(c, m, p, f) : w(w(w({}, m), p), f) : w(w({}, p), f);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ae(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && O((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && w(w({}, r === "root" && w(w(me({}, "".concat(o, "name"), M(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && me({}, "".concat(o, "extend"), M(this.$.type.name))), {}, me({}, "".concat(this.$attrSelector), ""))), {}, me({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return j(t) || on(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(s) : s, c = M(r), m = M(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(g) {
        return n(g, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, s = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, m = a(t.originalValue), p = a(t.value);
        return m === void 0 && p === void 0 ? void 0 : j(p) ? p : j(m) ? m : u || !u && p ? c ? this._mergeProps(c, m, p) : w(w({}, m), p) : p;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, w(w({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Ae(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, w({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, w(w({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, w(w({}, this.$params), r)), a = this._getOptionValue(kt.inlineStyles, t, w(w({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return N(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, w({}, n.$params)) || N(r, w({}, n.$params));
      });
    },
    isUnstyled: function() {
      var t;
      return this.unstyled !== void 0 ? this.unstyled : (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var t, n = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = de(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
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
      var t;
      return {
        nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
      };
    },
    $primevueConfig: function() {
      var t;
      return (t = this.$primevue) === null || t === void 0 ? void 0 : t.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var t = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: t,
          props: t?.$props,
          state: t?.$data,
          attrs: t?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = de(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = de(n, 2), o = r[0], a = r[1], l = o.split(":"), s = Wo(l), i = Ge(s).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = de(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = de(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Yo = "\n    .p-contextmenu {\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n        min-width: 12.5rem;\n    }\n\n    .p-contextmenu-root-list,\n    .p-contextmenu-submenu {\n        margin: 0;\n        padding: dt('contextmenu.list.padding');\n        list-style: none;\n        outline: 0 none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('contextmenu.list.gap');\n    }\n\n    .p-contextmenu-submenu {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        min-width: 100%;\n        z-index: 1;\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n    }\n\n    .p-contextmenu-item {\n        position: relative;\n    }\n\n    .p-contextmenu-item-content {\n        transition:\n            background dt('contextmenu.transition.duration'),\n            color dt('contextmenu.transition.duration');\n        border-radius: dt('contextmenu.item.border.radius');\n        color: dt('contextmenu.item.color');\n    }\n\n    .p-contextmenu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('contextmenu.item.padding');\n        gap: dt('contextmenu.item.gap');\n        user-select: none;\n    }\n\n    .p-contextmenu-item-label {\n        line-height: 1;\n    }\n\n    .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.color');\n    }\n\n    .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.color');\n        margin-left: auto;\n        font-size: dt('contextmenu.submenu.icon.size');\n        width: dt('contextmenu.submenu.icon.size');\n        height: dt('contextmenu.submenu.icon.size');\n    }\n\n    .p-contextmenu-submenu-icon:dir(rtl) {\n        margin-left: 0;\n        margin-right: auto;\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.active.color');\n        background: dt('contextmenu.item.active.background');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.active.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.active.color');\n    }\n\n    .p-contextmenu-separator {\n        border-block-start: 1px solid dt('contextmenu.separator.border.color');\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu {\n        position: static;\n        box-shadow: none;\n        border: 0 none;\n        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');\n        padding-inline-end: 0;\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu-icon {\n        transition: transform 0.2s;\n        transform: rotate(90deg);\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        transform: rotate(-90deg);\n    }\n", Go = {
  root: function(t) {
    var n = t.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(t) {
    var n = t.instance, r = t.processedItem;
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
  style: Yo,
  classes: Go
});
var qo = "\n.p-icon {\n    display: inline-block;\n    vertical-align: baseline;\n    flex-shrink: 0;\n}\n\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n\n@-webkit-keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n\n@keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n", Qo = x.extend({
  name: "baseicon",
  css: qo
});
function be(e) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, be(e);
}
function Lt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function At(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Lt(Object(n), !0).forEach(function(r) {
      Jo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Lt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Jo(e, t, n) {
  return (t = Zo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zo(e) {
  var t = Xo(e, "string");
  return be(t) == "symbol" ? t : t + "";
}
function Xo(e, t) {
  if (be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Wi = {
  name: "BaseIcon",
  extends: Ko,
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
  style: Qo,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = $e(this.label);
      return At(At({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: t ? void 0 : "img",
        "aria-label": t ? void 0 : this.label,
        "aria-hidden": t
      });
    }
  }
};
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
function jt(e, t) {
  return ri(e) || ni(e, t) || ti(e, t) || ei();
}
function ei() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ti(e, t) {
  if (e) {
    if (typeof e == "string") return Nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(e, t) : void 0;
  }
}
function Nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ni(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function ri(e) {
  if (Array.isArray(e)) return e;
}
function Rt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function P(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(n), !0).forEach(function(r) {
      qe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function qe(e, t, n) {
  return (t = oi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oi(e) {
  var t = ii(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function ii(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var S = {
  _getMeta: function() {
    return [D(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(D(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: et,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var _ = S._getOptionValue.apply(S, arguments);
      return j(_) || on(_) ? {
        class: _
      } : _;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, p = m === void 0 ? !1 : m, f = s ? S._useDefaultPT(r, r.defaultPT(), i, a, l) : void 0, g = S._usePT(r, S._getPT(o, r.$name), i, a, P(P({}, l), {}, {
      global: f || {}
    })), v = S._getPTDatasets(r, a);
    return c || !c && g ? p ? S._mergeProps(r, p, f, g, v) : P(P(P({}, f), g), v) : P(P({}, g), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return P(P({}, n === "root" && qe({}, "".concat(r, "name"), M(t.$name))), {}, qe({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, i = r ? r(l) : l, u = M(n);
      return (s = i?.[u]) !== null && s !== void 0 ? s : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(v) {
      return r(v, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, i = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, p = l(n.originalValue), f = l(n.value);
      return p === void 0 && f === void 0 ? void 0 : j(f) ? f : j(p) ? p : d || !d && f ? m ? S._mergeProps(t, m, p, f) : P(P({}, p), f) : f;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = S._getConfig(r, o), l = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    S._loadCoreStyles(n, l), S._loadThemeStyles(n, l), S._loadScopedThemeStyles(n, l), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, l);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      x.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), G.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!T.isStyleNameLoaded("common")) {
        var l, s, i = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        x.load(u?.css, P({
          name: "primitive-variables"
        }, a)), x.load(d?.css, P({
          name: "semantic-variables"
        }, a)), x.load(c?.css, P({
          name: "global-variables"
        }, a)), x.loadStyle(P({
          name: "global-style"
        }, a), m), T.setLoadedStyleName("common");
      }
      if (!T.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, f, g, v, b = ((p = o.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, _ = b.css, $ = b.style;
        (g = o.$style) === null || g === void 0 || g.load(_, P({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (v = o.$style) === null || v === void 0 || v.loadStyle(P({
          name: "".concat(o.$style.name, "-style")
        }, a), $), T.setLoadedStyleName(o.$style.name);
      }
      if (!T.isStyleNameLoaded("layer-order")) {
        var h, y, k = (h = o.$style) === null || h === void 0 || (y = h.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(h);
        x.load(k, P({
          name: "layer-order",
          first: !0
        }, a)), T.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, l, s = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = s.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, P({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), L.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, l) {
    var s, i, u = "on".concat(Hr(n)), d = S._getConfig(o, a), c = r?.$instance, m = S._usePT(c, S._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, t), S._getOptionValue, "hooks.".concat(u)), p = S._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], S._getOptionValue, "hooks.".concat(u)), f = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: l
    };
    m?.(c, f), p?.(c, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ue(t) ? t.apply(void 0, r) : Ae.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, i, u, d, c) {
      var m, p, f, g;
      i._$instances = i._$instances || {};
      var v = S._getConfig(u, d), b = i._$instances[t] || {}, _ = $e(b) ? P(P({}, n), n?.methods) : {};
      i._$instances[t] = P(P({}, b), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: b.$el || i || void 0,
        $style: P({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: v,
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(v?.pt, void 0, function(h) {
            var y;
            return h == null || (y = h.directives) === null || y === void 0 ? void 0 : y[t];
          });
        },
        isUnstyled: function() {
          var h, y;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled : v?.unstyled;
        },
        theme: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, y, P({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(i._$instances[t], h, y, k, !1);
        },
        cx: function() {
          var h, y, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : S._getOptionValue((y = i._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.classes, k, P({}, E));
        },
        sx: function() {
          var h, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? S._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, y, P({}, E)) : void 0;
        }
      }, _), i.$instance = i._$instances[t], (p = (f = i.$instance)[s]) === null || p === void 0 || p.call(f, i, u, d, c), i["$".concat(t)] = i.$instance, S._hook(t, s, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = P(P({}, (g = i.$pd) === null || g === void 0 ? void 0 : g[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(s) {
      var i, u, d, c = s._$instances[t], m = c?.watch, p = function(v) {
        var b, _ = v.newValue, $ = v.oldValue;
        return m == null || (b = m.config) === null || b === void 0 ? void 0 : b.call(c, _, $);
      }, f = function(v) {
        var b, _ = v.newValue, $ = v.oldValue;
        return m == null || (b = m["config.ripple"]) === null || b === void 0 ? void 0 : b.call(c, _, $);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), q.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), q.on("config:ripple:change", f);
    }, a = function(s) {
      var i = s._$instances[t].$watchersCallback;
      i && (q.off("config:change", i.config), q.off("config:ripple:change", i["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, i, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: to("pd")
        }, r("created", s, i, u, d);
      },
      beforeMount: function(s, i, u, d) {
        var c;
        S._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", s, i, u, d), o(s);
      },
      mounted: function(s, i, u, d) {
        var c;
        S._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", s, i, u, d);
      },
      beforeUpdate: function(s, i, u, d) {
        r("beforeUpdate", s, i, u, d);
      },
      updated: function(s, i, u, d) {
        var c;
        S._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", s, i, u, d);
      },
      beforeUnmount: function(s, i, u, d) {
        var c;
        a(s), S._removeThemeListeners((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", s, i, u, d);
      },
      unmounted: function(s, i, u, d) {
        var c;
        (c = s.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", s, i, u, d);
      }
    };
  },
  extend: function() {
    var t = S._getMeta.apply(S, arguments), n = jt(t, 2), r = n[0], o = n[1];
    return P({
      extend: function() {
        var l = S._getMeta.apply(S, arguments), s = jt(l, 2), i = s[0], u = s[1];
        return S.extend(i, P(P(P({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, si = "\n    .p-ink {\n        display: block;\n        position: absolute;\n        background: dt('ripple.background');\n        border-radius: 100%;\n        transform: scale(0);\n        pointer-events: none;\n    }\n\n    .p-ink-active {\n        animation: ripple 0.4s linear;\n    }\n\n    @keyframes ripple {\n        100% {\n            opacity: 0;\n            transform: scale(2.5);\n        }\n    }\n", ai = {
  root: "p-ink"
}, li = x.extend({
  name: "ripple-directive",
  style: si,
  classes: ai
}), ui = S.extend({
  style: li
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function ci(e) {
  return fi(e) || pi(e) || mi(e) || di();
}
function di() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function mi(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(e, t) : void 0;
  }
}
function pi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fi(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Vt(e, t, n) {
  return (t = hi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function hi(e) {
  var t = vi(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function vi(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Hi = ui.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var n = this.getInk(t);
      n || (n = qr("span", Vt(Vt({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, r = t.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && He(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !ht(o) && !vt(o)) {
          var a = Math.max(Kr(r), Xr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var l = Zr(r), s = t.pageX - l.left + document.body.scrollTop - vt(o) / 2, i = t.pageY - l.top + document.body.scrollLeft - ht(o) / 2;
        o.style.top = i + "px", o.style.left = s + "px", !this.isUnstyled() && Fr(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && He(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && He(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? ci(t.children).find(function(n) {
        return Jr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), gi = "\n    .p-menu {\n        background: dt('menu.background');\n        color: dt('menu.color');\n        border: 1px solid dt('menu.border.color');\n        border-radius: dt('menu.border.radius');\n        min-width: 12.5rem;\n    }\n\n    .p-menu-list {\n        margin: 0;\n        padding: dt('menu.list.padding');\n        outline: 0 none;\n        list-style: none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('menu.list.gap');\n    }\n\n    .p-menu-item-content {\n        transition:\n            background dt('menu.transition.duration'),\n            color dt('menu.transition.duration');\n        border-radius: dt('menu.item.border.radius');\n        color: dt('menu.item.color');\n        overflow: hidden;\n    }\n\n    .p-menu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('menu.item.padding');\n        gap: dt('menu.item.gap');\n        user-select: none;\n        outline: 0 none;\n    }\n\n    .p-menu-item-label {\n        line-height: 1;\n    }\n\n    .p-menu-item-icon {\n        color: dt('menu.item.icon.color');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-content {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-overlay {\n        box-shadow: dt('menu.shadow');\n    }\n\n    .p-menu-submenu-label {\n        background: dt('menu.submenu.label.background');\n        padding: dt('menu.submenu.label.padding');\n        color: dt('menu.submenu.label.color');\n        font-weight: dt('menu.submenu.label.font.weight');\n    }\n\n    .p-menu-separator {\n        border-block-start: 1px solid dt('menu.separator.border.color');\n    }\n", yi = {
  root: function(t) {
    var n = t.props;
    return ["p-menu p-component", {
      "p-menu-overlay": n.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(t) {
    var n = t.instance;
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
  style: gi,
  classes: yi
});
const bi = "data-wippy-overlay-layer";
function _n() {
  return typeof window < "u" && typeof window.document < "u";
}
function Sn() {
  return _n() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function _i() {
  return Sn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Si = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let $i = 0;
const Ie = /* @__PURE__ */ new WeakMap();
function It(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function wi(e, t) {
  if (!Si.test(e.className))
    return;
  const n = e.style.cssText;
  It(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ie.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && It(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ie.set(e, r);
  }
}
function tt(e) {
  const t = Ie.get(e);
  t && (t.disconnect(), Ie.delete(e));
}
function Pi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Je(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = "".concat(-window.scrollY - t.top, "px"), e.style.left = "".concat(-window.scrollX - t.left, "px");
}
const Me = /* @__PURE__ */ new Set(), nt = /* @__PURE__ */ new WeakMap();
let Mt = !1, Ze = !1;
const Dt = ["w-theme-dark", "w-theme-light"], Le = "data-wippy-theme-root", Xe = /* @__PURE__ */ new WeakMap();
function Ti(e) {
  const t = [];
  let n = e ? e.parentNode : null;
  for (; n && n.nodeType === 1; )
    t.push(n), n = n.parentNode;
  return t;
}
function Oi(e, t, n) {
  const r = [...Ti(t), n.host], o = () => {
    let l;
    for (const s of r) {
      if (Dt.some((i) => s.classList.contains(i))) {
        l = s;
        break;
      }
      if (s.hasAttribute(Le))
        break;
    }
    for (const s of Dt)
      e.classList.toggle(s, !!(l && l.classList.contains(s)));
    l ? e.setAttribute(Le, "") : e.removeAttribute(Le);
  };
  o();
  const a = new MutationObserver(o);
  for (const l of r)
    a.observe(l, { attributes: !0, attributeFilter: ["class", Le] });
  Xe.set(e, a);
}
function $n(e) {
  Xe.get(e)?.disconnect(), Xe.delete(e);
}
function Ci() {
  Ze = !1;
  for (const e of Me) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && tt(t);
      Me.delete(e), nt.get(e)?.disconnect(), $n(e);
      continue;
    }
    e.childElementCount > 0 && Je(e);
  }
}
function Ut() {
  Ze || (Ze = !0, requestAnimationFrame(Ci));
}
function xi(e) {
  const t = document.createElement("div");
  t.setAttribute(bi, "");
  const n = Sn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Je(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const l of o) {
      if (a)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && wi(s, a);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && tt(s);
    }
    t.isConnected && t.childElementCount > 0 && Je(t);
  });
  return r.observe(t, { childList: !0 }), nt.set(t, r), Me.add(t), Mt || (Mt = !0, window.addEventListener("scroll", Ut, { capture: !0, passive: !0 }), window.addEventListener("resize", Ut, { passive: !0 })), t;
}
function Wt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = xi(e.hostRoot), Oi(e.layer, e.$el, e.hostRoot), _i())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = "--wippy-a-".concat(++$i), e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Ht(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && tt(t);
    Me.delete(e.layer), nt.get(e.layer)?.disconnect(), $n(e.layer), e.layer.remove(), e.layer = null;
  }
}
let zt = !1;
function ki() {
  if (zt)
    return;
  zt = !0;
  const e = vn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    _n() && (this.hostRoot = Pi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Wt(this), this.$watch("inline", (t) => {
      t ? Ht(this) : Wt(this);
    })));
  }, e.render = function() {
    return this.inline ? Ne(this.$slots, "default", { key: 0 }) : this.mounted ? Zn(Ft, { key: 1, to: this.resolvedTarget || document.body }, [
      Ne(this.$slots, "default")
    ]) : Kt("", !0);
  }, e.unmounted = function() {
    Ht(this);
  };
}
const zi = {
  install: (e) => {
    ki(), e.use(Mo, { theme: "none" });
  }
};
export {
  x as B,
  Ui as M,
  zi as P,
  Hi as R,
  Ii as W,
  $e as a,
  O as b,
  Ri as c,
  Ko as d,
  pt as e,
  zr as f,
  Vi as g,
  Mi as k,
  ji as l,
  Di as p,
  Wi as s,
  Ni as u
};
//# sourceMappingURL=wc-runtime-DBE0CU59.js.map
