import { hasInjectionContext as ft, inject as z, effectScope as mt, ref as S, markRaw as _t, createApp as yt, renderSlot as D, createCommentVNode as bt, h as vt, Teleport as gt } from "vue";
import { addCollection as Ct } from "@iconify/vue";
import { config as U, addIcons as wt, on as St, applyThemeMode as P, host as Et, hostCss as Pt, loadCss as Lt } from "@wippy-fe/proxy";
import Tt from "primevue/config";
import At from "primevue/contextmenu";
import Rt from "primevue/menu";
import Vt from "primevue/portal";
var x = "data-wippy-visible";
function B(t) {
  const e = t.getAttribute(x);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var Ot = Object.defineProperty, it = (t) => {
  throw TypeError(t);
}, kt = (t, e, i) => e in t ? Ot(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, h = (t, e, i) => kt(t, typeof e != "symbol" ? e + "" : e, i), st = (t, e, i) => e.has(t) || it("Cannot " + i), xt = (t, e, i) => (st(t, e, "read from private field"), i ? i.call(t) : e.get(t)), It = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Nt = (t, e, i, s) => (st(t, e, "write to private field"), e.set(t, i), i), Mt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], zt = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(",\n");
function F(t) {
  const e = t.startsWith("--") ? t : "--".concat(t);
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function Ht(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const i of t)
    if (i)
      for (const [s, n] of Object.entries(i)) {
        if ((s === "@light" || s === "@dark") && n && typeof n == "object") {
          for (const [a, o] of Object.entries(n)) {
            const c = typeof o == "string" ? F(a) : null;
            c && e.add(c);
          }
          continue;
        }
        const r = typeof n == "string" ? F(s) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function $t(t) {
  if (t.length === 0)
    return "";
  const e = t.map((i) => "  ".concat(i, ": inherit;")).join("\n");
  return "".concat(zt, " {\n").concat(e, "\n}");
}
function Wt(t, e) {
  const i = $t(e);
  i && nt(t, i, "@wippy-fe/css-variables-bridge");
}
function Dt(t, e) {
  const s = (e ?? Mt).map(async (n) => {
    const r = Pt[n];
    if (!r)
      return console.warn('[wippy-fe/webcomponent-core] hostCss key "'.concat(n, '" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.')), null;
    try {
      return await Lt(r);
    } catch (a) {
      return console.warn('[wippy-fe/webcomponent-core] Failed to load hostCss "'.concat(n, '" (').concat(r, "):"), a), null;
    }
  });
  return Promise.all(s).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const a = document.createElement("style");
      a.textContent = r, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function Ut(t, e) {
  const i = document.createElement("style");
  i.textContent = e, t.appendChild(i);
}
function nt(t, e, i) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", i), s.textContent = e, t.appendChild(s);
}
function Bt(t, e) {
  nt(t, e, "@wippy-fe/custom-css");
}
function rt(t) {
  return t.__wippyHost ?? null;
}
function Ft(t) {
  return t.replace(/-([a-z])/g, (e, i) => i.toUpperCase());
}
function jt(t, e, i) {
  switch (i.type) {
    case "string":
      return { value: e };
    case "number": {
      const s = Number.parseFloat(e);
      return Number.isNaN(s) ? { value: void 0, error: "Invalid ".concat(t, ": expected a number") } : { value: s };
    }
    case "integer": {
      const s = Number.parseInt(e, 10);
      return Number.isNaN(s) ? { value: void 0, error: "Invalid ".concat(t, ": expected an integer") } : { value: s };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const s = JSON.parse(e);
        return i.type === "array" && !Array.isArray(s) ? { value: void 0, error: "Invalid ".concat(t, ": expected a JSON array") } : { value: s };
      } catch {
        return { value: void 0, error: "Invalid ".concat(t, ": must be valid JSON") };
      }
    default:
      return { value: e };
  }
}
function k(t, e) {
  const i = {}, s = [];
  for (const [n, r] of Object.entries(e.properties)) {
    const a = t.getAttribute(n), o = Ft(n);
    if (a === null) {
      r.default !== void 0 && (i[o] = r.default);
      continue;
    }
    const c = jt(n, a, r);
    c.error ? s.push(c.error) : i[o] = c.value;
  }
  return { props: i, errors: s };
}
var Kt = class {
  constructor(t, e) {
    h(this, "_props"), h(this, "_errors"), h(this, "_content"), h(this, "_hostVisibility"), h(this, "_propsListeners", /* @__PURE__ */ new Set()), h(this, "_contentListeners", /* @__PURE__ */ new Set()), h(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), h(this, "_disposed", !1), h(this, "_emitToDom"), h(this, "props"), h(this, "events"), h(this, "content"), h(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const i = this;
    this.props = {
      get value() {
        return i._props;
      },
      get errors() {
        return i._errors;
      },
      subscribe(s, n) {
        return i._subscribeProps(s, n);
      }
    }, this.events = {
      emit(s, n) {
        i._disposed || i._emitToDom(s, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return i._content;
      },
      subscribe(s, n) {
        return i._subscribeContent(s, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return i._hostVisibility;
      },
      subscribe(s, n) {
        return i._subscribeHostVisibility(s, n);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const i of this._propsListeners)
        i(t, e);
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
      for (const i of this._hostVisibilityListeners)
        i(t, e);
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
    const i = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const i = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const i = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
}, A, Yt = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), It(this, A, null), h(this, "_attachment", 0), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = B(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), i = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...i, x])];
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
    return rt(this);
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
      let i, s;
      if (this._lastProps !== null)
        i = this._lastProps, s = this._lastErrors;
      else {
        const r = k(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), i = r.props, s = r.errors, this._lastProps = i, this._lastErrors = s;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new Kt(
        { props: i, errors: s, content: n, hasContent: e, hostVisibility: this._hostVisible },
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
      const e = this.constructor.wippyConfig, i = this._initialized, s = xt(this, A) ?? Nt(this, A, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let n;
      if (this._container)
        n = this._container;
      else {
        if (this.onInit(s), t !== this._attachment)
          return;
        e.inlineCss && Ut(s, e.inlineCss);
        try {
          const m = U?.theming, l = Ht(
            m?.global?.cssVariables,
            m?.children?.cssVariables
          );
          Wt(s, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const m = U?.theming, l = [m?.global?.customCSS, m?.children?.customCSS].filter(Boolean).join("\n");
            l && Bt(s, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Dt(s, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const p = e.containerClasses ?? [];
        p.length > 0 && n.classList.add(...p), s.appendChild(n), this._container = n, wt(Ct);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = St("@theme", (p) => this._applyTheme(p)));
      const { props: r, errors: a } = k(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(r));
      const o = r;
      this._lastProps = o, this._lastErrors = a;
      let c = null;
      if (e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(e.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, n, o, a, c, i), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), i || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
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
  _applyTheme(t = Et.getThemeMode?.()) {
    P(t, this), this._container && P(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), P("auto", this), this._container && P("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, i) {
    if (e === i)
      return;
    if (t === x) {
      const o = this._hostVisible, c = B(this);
      if (c === o)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, o), this.onHostVisibilityChanged(c, o));
      return;
    }
    const s = this.constructor.wippyConfig, { props: n, errors: r } = k(this, s.propsSchema);
    s.validateProps && r.push(...s.validateProps(n));
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
A = /* @__PURE__ */ new WeakMap();
function qt(t) {
  return t.__wippyHostBus ?? null;
}
function Jt(t) {
  return t.dataset.wippyPanelId ?? null;
}
let ot;
const at = (t) => ot = t, Gt = () => ft() && z(lt) || ot, lt = (
  /* istanbul ignore next */
  Symbol()
);
function Xt() {
  const t = mt(!0), e = t.run(() => S({}));
  let i = [], s = [];
  const n = _t({
    install(r) {
      at(n), n._a = r, r.provide(lt, n), r.config.globalProperties.$pinia = n, s.forEach((a) => i.push(a)), s = [];
    },
    use(r) {
      return this._a ? i.push(r) : s.push(r), this;
    },
    _p: i,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return n;
}
var Qt = Object.defineProperty, Zt = (t, e, i) => e in t ? Qt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, y = (t, e, i) => Zt(t, typeof e != "symbol" ? e + "" : e, i);
function j(t, e, i) {
  const s = t.createElement("div"), n = i ? e.failed : e.loading;
  s.dataset.lazyState = i ? "failed" : "loading", s.setAttribute("role", i ? "alert" : "status"), s.setAttribute("aria-label", n), s.style.cssText = "display:grid;place-items:center;text-align:center;";
  const r = e.surface === "page";
  if (s.style.cssText += r ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", i)
    s.style.color = "var(--p-danger-500, currentColor)", s.textContent = !r && e.iconOnly ? "⚠" : n, !r && e.iconOnly && (s.title = n);
  else {
    const a = t.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const o = t.createElement("span");
    o.dataset.wippySpinner = "", o.setAttribute("aria-hidden", "true"), o.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", o.style.fontSize = r ? "2rem" : "1em", s.append(a, o);
  }
  return s;
}
var ct = /* @__PURE__ */ Symbol("wippy:emit"), ut = /* @__PURE__ */ Symbol("wippy:props"), te = /* @__PURE__ */ Symbol("wippy:props_error"), ee = /* @__PURE__ */ Symbol("wippy:content"), ie = /* @__PURE__ */ Symbol("wippy:panel-id"), se = /* @__PURE__ */ Symbol("wippy:layout-bus"), ne = /* @__PURE__ */ Symbol("wippy:host"), re = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Le() {
  const t = z(ut);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Te() {
  const t = z(ct);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var L = /* @__PURE__ */ new WeakMap();
function K(t, e) {
  const i = L.get(t);
  if (i)
    return i;
  const s = Promise.resolve().then(e);
  return L.set(t, s), s.catch(() => {
    L.get(t) === s && L.delete(t);
  }), s;
}
var Ae = class extends Yt {
  constructor() {
    super(...arguments), y(this, "_vueApp", null), y(this, "_mountingApp", !1), y(this, "_mountState", "idle"), y(this, "_feedback", null), y(this, "_propsRef", S({})), y(this, "_errorsRef", S([])), y(this, "_contentRef", S(null)), y(this, "_hostVisibilityRef", S(null)), y(this, "_bridgeAbort", null);
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
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await K(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, i, s, n, r) {
    const a = this.constructor, o = a.vueConfig, c = new AbortController();
    this._bridgeAbort = c;
    const p = () => !c.signal.aborted && this._bridgeAbort === c;
    this._mountState = "mounting", this._propsRef.value = i, this._errorsRef.value = s, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of s)
      if (this.emitEvent("invalid", { message: l }), !p())
        return;
    this.reactive.props.subscribe((l, d) => {
      this._propsRef.value = l, this._errorsRef.value = [...d];
      for (const u of d)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: c.signal });
    const m = (l) => {
      if (!p())
        return;
      const d = Gt(), u = yt(l.rootComponent);
      let v = !1, b = !1, g, C;
      this._mountingApp = !0;
      try {
        const w = Xt();
        if (l.piniaPlugins)
          for (const _ of l.piniaPlugins)
            w.use(_);
        u.use(w);
        for (const _ of l.plugins ?? [])
          u.use(_);
        if (u.provide(ut, this._propsRef), u.provide(te, this._errorsRef), u.provide(ct, this.emitEvent.bind(this)), u.provide(ee, this._contentRef), u.provide(re, this._hostVisibilityRef), u.provide(ie, Jt(this)), u.provide(se, qt(this)), u.provide(ne, rt(this)), l.providers?.(u, this), !p())
          return;
        if (C = u.config.errorHandler, o.mountLifecycle && (u.config.errorHandler = (_, W, f) => {
          b || (g = _), b = !0, C?.(_, W, f);
        }), u.mount(e), v = !0, b)
          throw g;
        p() && (this._vueApp = u);
      } finally {
        o.mountLifecycle && v && (u.config.errorHandler = C);
        try {
          v && (b || !p()) && u.unmount();
        } finally {
          at(d), this._mountingApp = !1;
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
            m(o);
          } catch (l) {
            p() && (this._mountState = "failed", this.emitEvent("error", { message: l instanceof Error ? l.message : String(l), error: l }));
          }
        });
        return;
      }
      try {
        m(o);
      } catch (l) {
        if (p())
          throw this._mountState = "failed", l;
      }
    } else if (o.lazyConfig) {
      const l = e.ownerDocument, d = o.lazyUi;
      d?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let u = !1, v, b;
      const g = () => {
        clearTimeout(v), clearTimeout(b), this._feedback?.remove(), this._feedback = null;
      };
      c.signal.addEventListener("abort", g, { once: !0 });
      const C = () => {
        if (!p() || u)
          return;
        const f = d ? j(l, d, !1) : l.createElement("wippy-loading");
        f.setAttribute("no-bg", ""), this._feedback = f, e.appendChild(f);
      }, w = (f) => {
        if (!p())
          return;
        u = !0, g(), this._mountState = "failed";
        const O = d?.failed ?? (f instanceof Error ? f.message : String(f)), E = d ? j(l, d, !0) : l.createElement("wippy-error");
        d || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", O)), this._feedback = E, e.appendChild(E), this.emitEvent("error", d ? { message: O, error: f } : { message: O });
      }, _ = d?.delay ?? (d?.surface === "compact" ? 200 : 0);
      _ > 0 ? v = setTimeout(C, _) : C(), d && (b = setTimeout(() => w(new Error("The component did not load in time.")), d.timeout ?? 3e4)), (o.mountLifecycle ? K(a, o.lazyConfig) : o.lazyConfig()).then((f) => {
        !p() || u || (u = !0, g(), m(f));
      }, (f) => {
        u || w(f);
      }).catch(w);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
};
const oe = "data-wippy-overlay-layer";
function ht() {
  return typeof window < "u" && typeof window.document < "u";
}
function pt() {
  return ht() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function ae() {
  return pt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const le = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ce = 0;
const R = /* @__PURE__ */ new WeakMap();
function Y(t, e) {
  const i = t.style;
  i.setProperty("position", "fixed", "important"), i.setProperty("inset", "auto", "important"), i.setProperty("margin", "0", "important"), i.setProperty("position-anchor", e), i.setProperty("position-area", "bottom span-right"), i.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), i.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), i.setProperty("max-width", "stretch", "important");
}
function ue(t, e) {
  if (!le.test(t.className))
    return;
  const i = t.style.cssText;
  Y(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = i;
    return;
  }
  if (!R.has(t)) {
    const s = new MutationObserver(() => {
      const n = t.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && Y(t, e);
    });
    s.observe(t, { attributes: !0, attributeFilter: ["style"] }), R.set(t, s);
  }
}
function H(t) {
  const e = R.get(t);
  e && (e.disconnect(), R.delete(t));
}
function he(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function I(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = "".concat(-window.scrollY - e.top, "px"), t.style.left = "".concat(-window.scrollX - e.left, "px");
}
const V = /* @__PURE__ */ new Set(), $ = /* @__PURE__ */ new WeakMap();
let q = !1, N = !1;
const J = ["w-theme-dark", "w-theme-light"], T = "data-wippy-theme-root", M = /* @__PURE__ */ new WeakMap();
function pe(t) {
  const e = [];
  let i = t ? t.parentNode : null;
  for (; i && i.nodeType === 1; )
    e.push(i), i = i.parentNode;
  return e;
}
function de(t, e, i) {
  const s = [...pe(e), i.host], n = () => {
    let a;
    for (const o of s) {
      if (J.some((c) => o.classList.contains(c))) {
        a = o;
        break;
      }
      if (o.hasAttribute(T))
        break;
    }
    for (const o of J)
      t.classList.toggle(o, !!(a && a.classList.contains(o)));
    a ? t.setAttribute(T, "") : t.removeAttribute(T);
  };
  n();
  const r = new MutationObserver(n);
  for (const a of s)
    r.observe(a, { attributes: !0, attributeFilter: ["class", T] });
  M.set(t, r);
}
function dt(t) {
  M.get(t)?.disconnect(), M.delete(t);
}
function fe() {
  N = !1;
  for (const t of V) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && H(e);
      V.delete(t), $.get(t)?.disconnect(), dt(t);
      continue;
    }
    t.childElementCount > 0 && I(t);
  }
}
function G() {
  N || (N = !0, requestAnimationFrame(fe));
}
function me(t) {
  const e = document.createElement("div");
  e.setAttribute(oe, "");
  const i = pt();
  if (e.style.cssText = i ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", i && e.setAttribute("popover", "manual"), t.appendChild(e), i) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  I(e);
  const s = new MutationObserver((n) => {
    const r = e.__wippyAnchorName;
    for (const a of n) {
      if (r)
        for (const o of Array.from(a.addedNodes))
          o instanceof HTMLElement && ue(o, r);
      for (const o of Array.from(a.removedNodes))
        o instanceof HTMLElement && H(o);
    }
    e.isConnected && e.childElementCount > 0 && I(e);
  });
  return s.observe(e, { childList: !0 }), $.set(e, s), V.add(e), q || (q = !0, window.addEventListener("scroll", G, { capture: !0, passive: !0 }), window.addEventListener("resize", G, { passive: !0 })), e;
}
function X(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = me(t.hostRoot), de(t.layer, t.$el, t.hostRoot), ae())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = "--wippy-a-".concat(++ce), t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Q(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && H(e);
    V.delete(t.layer), $.get(t.layer)?.disconnect(), dt(t.layer), t.layer.remove(), t.layer = null;
  }
}
let Z = !1;
function _e() {
  if (Z)
    return;
  const t = Rt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), s = this.container && !i.includes(this.container), n = !(this.target && i.includes(this.target));
      this.overlayVisible && s && n ? this.hide() : !this.popup && s && n && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Z = !0);
}
let tt = !1;
function ye() {
  if (tt)
    return;
  const t = At;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), s = this.container && !i.includes(this.container), n = this.visible ? !(this.target && i.includes(this.target)) : !0;
      s && n && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, tt = !0);
}
let et = !1;
function be() {
  if (et)
    return;
  et = !0;
  const t = Vt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    ht() && (this.hostRoot = he(this.$el), this.mounted = !0, this.hostRoot && (this.inline || X(this), this.$watch("inline", (e) => {
      e ? Q(this) : X(this);
    })));
  }, t.render = function() {
    return this.inline ? D(this.$slots, "default", { key: 0 }) : this.mounted ? vt(gt, { key: 1, to: this.resolvedTarget || document.body }, [
      D(this.$slots, "default")
    ]) : bt("", !0);
  }, t.unmounted = function() {
    Q(this);
  };
}
const Re = {
  install: (t) => {
    _e(), ye(), be(), t.use(Tt, { theme: "none" });
  }
};
export {
  Re as P,
  Ae as W,
  Le as a,
  Te as u
};
//# sourceMappingURL=wc-runtime-ChwhCkze.js.map
