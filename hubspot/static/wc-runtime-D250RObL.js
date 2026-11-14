import { hasInjectionContext as Bn, inject as et, effectScope as Un, ref as F, markRaw as Wn, createApp as Fn, readonly as Hn, getCurrentInstance as at, onMounted as zn, nextTick as Kn, watch as pe, reactive as Yn, renderSlot as je, openBlock as qn, createBlock as Gn, Teleport as Ft, createCommentVNode as Ht, useId as Jn, mergeProps as Ae, h as Qn } from "vue";
import { addCollection as Zn } from "@iconify/vue";
import { config as lt, addIcons as Xn, on as er, applyThemeMode as Ce, host as tr, hostCss as nr, loadCss as rr } from "@wippy-fe/proxy";
var Fe = "data-wippy-visible";
function ut(e) {
  const t = e.getAttribute(Fe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var or = Object.defineProperty, ir = (e, t, n) => t in e ? or(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, x = (e, t, n) => ir(e, typeof t != "symbol" ? t + "" : t, n), sr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], ar = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(",\n");
function dt(e) {
  const t = e.startsWith("--") ? e : "--".concat(e);
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function lr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const i = typeof l == "string" ? dt(a) : null;
            i && t.add(i);
          }
          continue;
        }
        const s = typeof o == "string" ? dt(r) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function ur(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => "  ".concat(n, ": inherit;")).join("\n");
  return "".concat(ar, " {\n").concat(t, "\n}");
}
function dr(e, t) {
  const n = ur(t);
  n && zt(e, n, "@wippy-fe/css-variables-bridge");
}
function cr(e, t) {
  const r = (t ?? sr).map(async (o) => {
    const s = nr[o];
    if (!s)
      return console.warn('[wippy-fe/webcomponent-core] hostCss key "'.concat(o, '" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.')), null;
    try {
      return await rr(s);
    } catch (a) {
      return console.warn('[wippy-fe/webcomponent-core] Failed to load hostCss "'.concat(o, '" (').concat(s, "):"), a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function mr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function zt(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function pr(e, t) {
  zt(e, t, "@wippy-fe/custom-css");
}
function Kt(e) {
  return e.__wippyHost ?? null;
}
function fr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function hr(e, t, n) {
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
function Me(e, t) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = fr(o);
    if (a === null) {
      s.default !== void 0 && (n[l] = s.default);
      continue;
    }
    const i = hr(o, a, s);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
}
var gr = class {
  constructor(e, t) {
    x(this, "_props"), x(this, "_errors"), x(this, "_content"), x(this, "_hostVisibility"), x(this, "_propsListeners", /* @__PURE__ */ new Set()), x(this, "_contentListeners", /* @__PURE__ */ new Set()), x(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), x(this, "_disposed", !1), x(this, "_emitToDom"), x(this, "props"), x(this, "events"), x(this, "content"), x(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, vr = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = ut(this);
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
    return Kt(this);
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
        const s = Me(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new gr(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let r;
      if (t)
        r = this._container;
      else {
        this.onInit(n), e.inlineCss && mr(n, e.inlineCss);
        try {
          const u = lt?.theming, d = lr(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          dr(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = lt?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join("\n");
            d && pr(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && cr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Xn(Zn);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = er("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: s } = Me(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(o));
      const a = o;
      this._lastProps = a, this._lastErrors = s;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, a, s, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(e = tr.getThemeMode?.()) {
    Ce(e, this), this._container && Ce(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Ce("auto", this), this._container && Ce("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Fe) {
      const l = this._hostVisible, i = ut(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = Me(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = s, this._reactive?.notifyProps(a, s), this.onPropsChanged(a, s);
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
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector('template[data-type="'.concat(e, '"]'))?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function yr(e) {
  return e.__wippyHostBus ?? null;
}
function br(e) {
  return e.dataset.wippyPanelId ?? null;
}
let Yt;
const qt = (e) => Yt = e, _r = () => Bn() && et(Gt) || Yt, Gt = (
  /* istanbul ignore next */
  Symbol()
);
function Sr() {
  const e = Un(!0), t = e.run(() => F({}));
  let n = [], r = [];
  const o = Wn({
    install(s) {
      qt(o), o._a = s, s.provide(Gt, o), s.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(s) {
      return this._a ? n.push(s) : r.push(s), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var $r = Object.defineProperty, wr = (e, t, n) => t in e ? $r(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, le = (e, t, n) => wr(e, typeof t != "symbol" ? t + "" : t, n), Jt = /* @__PURE__ */ Symbol("wippy:emit"), Qt = /* @__PURE__ */ Symbol("wippy:props"), Tr = /* @__PURE__ */ Symbol("wippy:props_error"), Pr = /* @__PURE__ */ Symbol("wippy:content"), Or = /* @__PURE__ */ Symbol("wippy:panel-id"), Cr = /* @__PURE__ */ Symbol("wippy:layout-bus"), xr = /* @__PURE__ */ Symbol("wippy:host"), kr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Di() {
  const e = et(Qt);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Mi() {
  const e = et(Jt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var Bi = class extends vr {
  constructor() {
    super(...arguments), le(this, "_vueApp", null), le(this, "_propsRef", F({})), le(this, "_errorsRef", F([])), le(this, "_contentRef", F(null)), le(this, "_hostVisibilityRef", F(null)), le(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, s) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const i = (u) => {
      if (l.signal.aborted)
        return;
      const d = _r(), c = Fn(u.rootComponent);
      this._vueApp = c;
      const m = Sr();
      if (u.piniaPlugins)
        for (const p of u.piniaPlugins)
          m.use(p);
      if (c.use(m), u.plugins)
        for (const p of u.plugins)
          c.use(p);
      c.provide(Qt, this._propsRef), c.provide(Tr, this._errorsRef), c.provide(Jt, this.emitEvent.bind(this)), c.provide(Pr, this._contentRef), c.provide(kr, this._hostVisibilityRef), c.provide(Or, br(this)), c.provide(Cr, yr(this)), c.provide(xr, Kt(this)), u.providers && u.providers(c, this), c.mount(t), d && qt(d);
    };
    if (a.rootComponent)
      i(a);
    else if (a.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), a.lazyConfig().then((d) => {
        l.signal.aborted || (u.remove(), i(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", c), u.replaceWith(m), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Er = Object.defineProperty, ct = Object.getOwnPropertySymbols, Lr = Object.prototype.hasOwnProperty, Ar = Object.prototype.propertyIsEnumerable, mt = (e, t, n) => t in e ? Er(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, jr = (e, t) => {
  for (var n in t || (t = {})) Lr.call(t, n) && mt(e, n, t[n]);
  if (ct) for (var n of ct(t)) Ar.call(t, n) && mt(e, n, t[n]);
  return e;
};
function Pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function He(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), s, a, l;
  if (r && o) {
    if (a = e.length, a != t.length) return !1;
    for (s = a; s-- !== 0; ) if (!He(e[s], t[s], n)) return !1;
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
  if (a = m.length, a !== Object.keys(t).length) return !1;
  for (s = a; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[s])) return !1;
  for (s = a; s-- !== 0; ) if (l = m[s], !He(e[l], t[l], n)) return !1;
  return !0;
}
function Nr(e, t) {
  return He(e, t);
}
function De(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function O(e) {
  return !Pe(e);
}
function ze(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (O(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (De(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, s = n.length; o < s; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function Rr(e, t, n) {
  return n ? ze(e, n) === ze(t, n) : Nr(e, t);
}
function B(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Zt(e = {}, t = {}) {
  let n = jr({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    B(t[o]) && o in e && B(e[o]) ? n[o] = Zt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Ir(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Zt(t, n), {});
}
function Ui(e, t) {
  let n = -1;
  if (O(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function j(e, ...t) {
  return De(e) ? e(...t) : e;
}
function A(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function M(e) {
  return A(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function tt(e, t = "", n = {}) {
  let r = M(t).split("."), o = r.shift();
  if (o) {
    if (B(e)) {
      let s = Object.keys(e).find((a) => M(a) === o) || "";
      return tt(j(e[s], n), r.join("."), n);
    }
    return;
  }
  return j(e, n);
}
function Xt(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Vr(e) {
  return O(e) && !isNaN(e);
}
function Wi(e = "") {
  return O(e) && e.length === 1 && !!e.match(/\S| /);
}
function ne(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Dr(...e) {
  return Ir(...e);
}
function he(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function R(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function Mr(e) {
  return A(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function en(e) {
  return A(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function nt() {
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
function Br(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let s = Array.isArray(r) ? [Br(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        t = s.length ? t.concat(s.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Ur(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Wr(e, t) {
  if (e && t) {
    let n = (r) => {
      Ur(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Be(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ke(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function tn(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function nn() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, s = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: s };
}
function Ye(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Fr() {
  let e = document.documentElement;
  return (window.pageXOffset || Ye(e)) - (e.clientLeft || 0);
}
function Hr() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function zr(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Fi(e, t, n = !0) {
  var r, o, s, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : tn(e), i = l.height, u = l.width, d = t.offsetHeight, c = t.offsetWidth, m = t.getBoundingClientRect(), p = Hr(), f = Fr(), v = nn(), g, y, _ = "top";
    m.top + d + i > v.height ? (g = m.top + p - i, _ = "bottom", g < 0 && (g = p)) : g = d + m.top + p, m.left + u > v.width ? y = Math.max(0, m.left + f + c - u) : y = m.left + f, zr(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = _, n && (e.style.marginTop = _ === "bottom" ? "calc(".concat((o = (r = Ke(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px", " * -1)") : (a = (s = Ke(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? a : "");
  }
}
function Hi(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Kr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function zi(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : tn(e), a = t.offsetHeight, l = t.getBoundingClientRect(), i = nn(), u, d, c = r ?? "top";
    if (!r && l.top + a + s.height > i.height ? (u = -1 * s.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, s.width > i.width ? d = l.left * -1 : l.left + s.width > i.width ? d = (l.left + s.width - i.width) * -1 : d = 0, e.style.top = u + "px", e.style.insetInlineStart = d + "px", e.style.transformOrigin = c, n) {
      let m = (o = Ke(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = c === "bottom" ? "calc(".concat(m ?? "2px", " * -1)") : m ?? "";
    }
  }
}
function rn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Yr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && rn(e));
}
function ce(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ne(e, t = {}) {
  if (ce(e)) {
    let n = (r, o) => {
      var s, a;
      let l = (s = e?.$attrs) != null && s[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
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
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Ne(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function qr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Ne(r, t), r.append(...n), r;
  }
}
function Gr(e, t) {
  return ce(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function on(e, t) {
  return ce(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ki(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Jr(e, t) {
  if (ce(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function sn(e, t = "") {
  let n = Gr(e, 'button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(t, ',\n            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])').concat(t, ',\n            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(t, ',\n            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(t, ',\n            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(t, ',\n            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(t, ',\n            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(t)), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Yi(e, t) {
  let n = sn(e, t);
  return n.length > 0 ? n[0] : null;
}
function pt(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function qi(e, t) {
  let n = sn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Qr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Ye(document.documentElement) || Ye(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Zr(e, t) {
  return e ? e.offsetHeight : 0;
}
function an(e, t = []) {
  let n = rn(e);
  return n === null ? t : an(n, t.concat([n]));
}
function Xr(e) {
  let t = [];
  if (e) {
    let n = an(e), r = /(auto|scroll)/, o = (s) => {
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
          let u = on(s, i);
          u && o(u) && t.push(u);
        }
      }
      s.nodeType !== 9 && o(s) && t.push(s);
    }
  }
  return t;
}
function ft(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Gi() {
  return /(android)/i.test(navigator.userAgent);
}
function ln() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ji(e) {
  return !!(e && e.offsetParent != null);
}
function Qi() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function eo(e, t = "", n) {
  ce(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var xe = {};
function to(e = "pui_id_") {
  return Object.hasOwn(xe, e) || (xe[e] = 0), xe[e]++, "".concat(e).concat(xe[e]);
}
function no() {
  let e = [], t = (a, l, i = 999) => {
    let u = o(a, l, i), d = u.value + (u.key === a ? 0 : i) + 1;
    return e.push({ key: a, value: d }), d;
  }, n = (a) => {
    e = e.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, i = 0) => [...e].reverse().find((u) => !0) || { key: a, value: i }, s = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: s, set: (a, l, i) => {
    l && (l.style.zIndex = String(t(a, !0, i)));
  }, clear: (a) => {
    a && (n(s(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Zi = no(), ro = Object.defineProperty, oo = Object.defineProperties, io = Object.getOwnPropertyDescriptors, Re = Object.getOwnPropertySymbols, un = Object.prototype.hasOwnProperty, dn = Object.prototype.propertyIsEnumerable, ht = (e, t, n) => t in e ? ro(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) un.call(t, n) && ht(e, n, t[n]);
  if (Re) for (var n of Re(t)) dn.call(t, n) && ht(e, n, t[n]);
  return e;
}, Ue = (e, t) => oo(e, io(t)), W = (e, t) => {
  var n = {};
  for (var r in e) un.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Re) for (var r of Re(e)) t.indexOf(r) < 0 && dn.call(e, r) && (n[r] = e[r]);
  return n;
}, so = nt(), E = so, ge = /{([^}]*)}/g, cn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, mn = /var\([^)]+\)/g;
function gt(e) {
  return A(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ao(e) {
  return B(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function lo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function qe(e = "", t = "") {
  return lo("".concat(A(e, !1) && A(t, !1) ? "".concat(e, "-") : e).concat(t));
}
function pn(e = "", t = "") {
  return "--".concat(qe(e, t));
}
function uo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function fn(e, t = "", n = "", r = [], o) {
  if (A(e)) {
    let s = e.trim();
    if (uo(s)) return;
    if (ne(s, ge)) {
      let a = s.replaceAll(ge, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => ne(u, d)));
        return "var(".concat(pn(n, en(i.join("-")))).concat(O(o) ? ", ".concat(o) : "", ")");
      });
      return ne(a.replace(mn, "0"), cn) ? "calc(".concat(a, ")") : a;
    }
    return s;
  } else if (Vr(e)) return e;
}
function co(e, t, n) {
  A(t, !1) && e.push("".concat(t, ":").concat(n, ";"));
}
function ue(e, t) {
  return e ? "".concat(e, "{").concat(t, "}") : "";
}
function hn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= a.length; ) {
      let p = a[u];
      if ((p === '"' || p === "'" || p === "`") && a[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && m++, p === ")" && m--, (p === "," || u === a.length) && m === 0)) {
        let f = d.trim();
        f.startsWith("dt(") ? i.push(hn(f, l)) : i.push(r(f)), d = "", u++;
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
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") s.push(a), a += 2;
  else if (e[a] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && o.push([l, a]);
  }
  if (!o.length) return e;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, i] = o[a], u = e.slice(l + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, l) + c + e.slice(i + 1);
  }
  return e;
}
var re = (...e) => mo(T.getTheme(), ...e), mo = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: s } = T.defaults || {}, { prefix: a, transform: l } = e?.options || s || {}, i = ne(t, ge) ? t : "{".concat(t, "}");
    return r === "value" || Pe(r) && l === "strict" ? T.getTokenValue(t) : fn(i, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function ke(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, s) => {
      var a;
      return r + o + ((a = j(t[s], { dt: re })) != null ? a : "");
    }, "");
    return hn(n, re);
  }
  return j(e, { dt: re });
}
function po(e, t = {}) {
  let n = T.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = t, a = [], l = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let p = d[m], f = ao(p), v = ne(m, s) ? qe(c) : qe(c, en(m));
      if (B(f)) i.push({ node: f, path: v });
      else {
        let g = pn(v), y = fn(f, v, r, [s]);
        co(l, g, y);
        let _ = v;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: ue(o, u) };
}
var I = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return po(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, a, l, i, u, d, c;
  let { preset: m, options: p } = t, f, v, g, y, _, P, h;
  if (O(m) && p.transform !== "strict") {
    let { primitive: S, semantic: k, extend: N } = m, H = k || {}, { colorScheme: z } = H, J = W(H, ["colorScheme"]), K = N || {}, { colorScheme: Q } = K, Z = W(K, ["colorScheme"]), Y = z || {}, { dark: X } = Y, oe = W(Y, ["dark"]), ee = Q || {}, { dark: ie } = ee, se = W(ee, ["dark"]), U = O(S) ? this._toVariables({ primitive: S }, p) : {}, D = O(J) ? this._toVariables({ semantic: J }, p) : {}, te = O(oe) ? this._toVariables({ light: oe }, p) : {}, Oe = O(X) ? this._toVariables({ dark: X }, p) : {}, ae = O(Z) ? this._toVariables({ semantic: Z }, p) : {}, it = O(se) ? this._toVariables({ light: se }, p) : {}, st = O(ie) ? this._toVariables({ dark: ie }, p) : {}, [$n, wn] = [(s = U.declarations) != null ? s : "", U.tokens], [Tn, Pn] = [(a = D.declarations) != null ? a : "", D.tokens || []], [On, Cn] = [(l = te.declarations) != null ? l : "", te.tokens || []], [xn, kn] = [(i = Oe.declarations) != null ? i : "", Oe.tokens || []], [En, Ln] = [(u = ae.declarations) != null ? u : "", ae.tokens || []], [An, jn] = [(d = it.declarations) != null ? d : "", it.tokens || []], [Nn, Rn] = [(c = st.declarations) != null ? c : "", st.tokens || []];
    f = this.transformCSS(e, $n, "light", "variable", p, r, o), v = wn;
    let In = this.transformCSS(e, "".concat(Tn).concat(On), "light", "variable", p, r, o), Vn = this.transformCSS(e, "".concat(xn), "dark", "variable", p, r, o);
    g = "".concat(In).concat(Vn), y = [.../* @__PURE__ */ new Set([...Pn, ...Cn, ...kn])];
    let Dn = this.transformCSS(e, "".concat(En).concat(An, "color-scheme:light"), "light", "variable", p, r, o), Mn = this.transformCSS(e, "".concat(Nn, "color-scheme:dark"), "dark", "variable", p, r, o);
    _ = "".concat(Dn).concat(Mn), P = [.../* @__PURE__ */ new Set([...Ln, ...jn, ...Rn])], h = j(m.css, { dt: re });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: _, tokens: P }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: s, selector: a }) {
  var l, i, u;
  let d, c, m;
  if (O(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), f = t, { colorScheme: v, extend: g, css: y } = f, _ = W(f, ["colorScheme", "extend", "css"]), P = g || {}, { colorScheme: h } = P, S = W(P, ["colorScheme"]), k = v || {}, { dark: N } = k, H = W(k, ["dark"]), z = h || {}, { dark: J } = z, K = W(z, ["dark"]), Q = O(_) ? this._toVariables({ [p]: V(V({}, _), S) }, n) : {}, Z = O(H) ? this._toVariables({ [p]: V(V({}, H), K) }, n) : {}, Y = O(N) ? this._toVariables({ [p]: V(V({}, N), J) }, n) : {}, [X, oe] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [ee, ie] = [(i = Z.declarations) != null ? i : "", Z.tokens || []], [se, U] = [(u = Y.declarations) != null ? u : "", Y.tokens || []], D = this.transformCSS(p, "".concat(X).concat(ee), "light", "variable", n, o, s, a), te = this.transformCSS(p, se, "dark", "variable", n, o, s, a);
    d = "".concat(D).concat(te), c = [.../* @__PURE__ */ new Set([...oe, ...ie, ...U])], m = j(y, { dt: re });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: a, options: l } = t, i = (s = a?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: i, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, a;
  let l = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((s = i?.components) == null ? void 0 : s[l]) || ((a = i?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? "@layer ".concat(j(o.order || o.name || "primeui", n)) : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: s }), l = Object.entries(r).reduce((i, [u, d]) => i.push("".concat(u, '="').concat(d, '"')) && i, []).join(" ");
  return Object.entries(a || {}).reduce((i, [u, d]) => {
    if (B(d) && Object.hasOwn(d, "css")) {
      let c = he(d.css), m = "".concat(u, "-variables");
      i.push('<style type="text/css" data-primevue-style-id="'.concat(m, '" ').concat(l, ">").concat(c, "</style>"));
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var a;
  let l = { name: e, theme: t, params: n, set: o, defaults: s }, i = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(r).reduce((d, [c, m]) => d.push("".concat(c, '="').concat(m, '"')) && d, []).join(" ");
  return i ? '<style type="text/css" data-primevue-style-id="'.concat(e, '-variables" ').concat(u, ">").concat(he(i), "</style>") : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
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
      d = cn.test(c.replace(mn, "0")) ? "calc(".concat(c, ")") : c;
    }
    return Pe(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let m = ne(d, t.variable.excludedKeyRegex) ? i : i ? "".concat(i, ".").concat(gt(d)) : gt(d), p = u ? "".concat(u, ".").concat(d) : d;
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
  return a(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !ne(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), s = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[o]) == null ? void 0 : r.computed(s)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = W(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? ue(O(t) ? "".concat(e).concat(t, ",").concat(e, " ").concat(t) : e, r) : ue(e, ue(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, s, a, l) {
  if (O(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, a);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (O(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, l, c, t)), d), "") : ue(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      B(i) && (u.name = j(i.name, { name: e, type: r })), O(u.name) && (t = ue("@layer ".concat(u.name), t), s?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, T = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ue(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = I.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), E.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ue(V({}, this.theme), { preset: e }), this._tokens = I.createTokens(e, this.defaults), this.clearLoadedStyleNames(), E.emit("preset:change", e), E.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ue(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), E.emit("options:change", e), E.emit("theme:change", this.theme);
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
  return I.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return I.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return I.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return I.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return I.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return I.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), E.emit("theme:".concat(t, ":load"), e), !this._loadingStyles.size && E.emit("theme:load"));
} }, L = {
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
function vt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = fo(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var s, a = !0, l = !1;
  return { s: function() {
    n = n.call(e);
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
function fo(e, t) {
  if (e) {
    if (typeof e == "string") return yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yt(e, t) : void 0;
  }
}
function yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Xi = {
  filter: function(t, n, r, o, s) {
    var a = [];
    if (!t)
      return a;
    var l = vt(t), i;
    try {
      for (l.s(); !(i = l.n()).done; ) {
        var u = i.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, s)) {
            a.push(u);
            continue;
          }
        } else {
          var d = vt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var m = c.value, p = ze(u, m);
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
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(t.toString()).toLocaleLowerCase(r);
      return s.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(n.toString()).toLocaleLowerCase(r), s = R(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o, s.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : R(t.toString()).toLocaleLowerCase(r) == R(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : R(t.toString()).toLocaleLowerCase(r) != R(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Rr(t, n[r]))
          return !0;
      return !1;
    },
    between: function(t, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : t == null ? !1 : t.getTime ? n[0].getTime() <= t.getTime() && t.getTime() <= n[1].getTime() : n[0] <= t && t <= n[1];
    },
    lt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() < n.getTime() : t < n;
    },
    lte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() <= n.getTime() : t <= n;
    },
    gt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() > n.getTime() : t > n;
    },
    gte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() >= n.getTime() : t >= n;
    },
    dateIs: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() === n.toDateString());
    },
    dateIsNot: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() !== n.toDateString());
    },
    dateBefore: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() < n.getTime());
    },
    dateAfter: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() > n.getTime());
    }
  },
  register: function(t, n) {
    this.filters[t] = n;
  }
}, ho = "\n    *,\n    ::before,\n    ::after {\n        box-sizing: border-box;\n    }\n\n    .p-collapsible-enter-active {\n        animation: p-animate-collapsible-expand 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    .p-collapsible-leave-active {\n        animation: p-animate-collapsible-collapse 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    @keyframes p-animate-collapsible-expand {\n        from {\n            grid-template-rows: 0fr;\n        }\n        to {\n            grid-template-rows: 1fr;\n        }\n    }\n\n    @keyframes p-animate-collapsible-collapse {\n        from {\n            grid-template-rows: 1fr;\n        }\n        to {\n            grid-template-rows: 0fr;\n        }\n    }\n\n    .p-disabled,\n    .p-disabled * {\n        cursor: default;\n        pointer-events: none;\n        user-select: none;\n    }\n\n    .p-disabled,\n    .p-component:disabled {\n        opacity: dt('disabled.opacity');\n    }\n\n    .pi {\n        font-size: dt('icon.size');\n    }\n\n    .p-icon {\n        width: dt('icon.size');\n        height: dt('icon.size');\n    }\n\n    .p-overlay-mask {\n        background: var(--px-mask-background, dt('mask.background'));\n        color: dt('mask.color');\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n    }\n\n    .p-overlay-mask-enter-active {\n        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;\n    }\n\n    .p-overlay-mask-leave-active {\n        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;\n    }\n\n    @keyframes p-animate-overlay-mask-enter {\n        from {\n            background: transparent;\n        }\n        to {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n    }\n    @keyframes p-animate-overlay-mask-leave {\n        from {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n        to {\n            background: transparent;\n        }\n    }\n\n    .p-anchored-overlay-enter-active {\n        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    .p-anchored-overlay-leave-active {\n        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    @keyframes p-animate-anchored-overlay-enter {\n        from {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n\n    @keyframes p-animate-anchored-overlay-leave {\n        to {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n";
function ve(e) {
  "@babel/helpers - typeof";
  return ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ve(e);
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
      go(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function go(e, t, n) {
  return (t = vo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vo(e) {
  var t = yo(e, "string");
  return ve(t) == "symbol" ? t : t + "";
}
function yo(e, t) {
  if (ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ve(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function bo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  at() && at().components ? zn(e) : t ? e() : Kn(e);
}
var _o = 0;
function So(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(e), o = F(null), s = ln() ? window.document : void 0, a = t.document, l = a === void 0 ? s : a, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, p = m === void 0 ? "style_".concat(++_o) : m, f = t.id, v = f === void 0 ? void 0 : f, g = t.media, y = g === void 0 ? void 0 : g, _ = t.nonce, P = _ === void 0 ? void 0 : _, h = t.first, S = h === void 0 ? !1 : h, k = t.onMounted, N = k === void 0 ? void 0 : k, H = t.onUpdated, z = H === void 0 ? void 0 : H, J = t.onLoad, K = J === void 0 ? void 0 : J, Q = t.props, Z = Q === void 0 ? {} : Q, Y = function() {
  }, X = function(ie) {
    var se = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var U = _t(_t({}, Z), se), D = U.name || p, te = U.id || v, Oe = U.nonce || P;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(te) || l.createElement("style"), o.value.isConnected || (r.value = ie || e, Ne(o.value, {
        type: "text/css",
        id: te,
        media: y,
        nonce: Oe
      }), S ? l.head.prepend(o.value) : l.head.appendChild(o.value), eo(o.value, "data-primevue-style-id", D), Ne(o.value, U), o.value.onload = function(ae) {
        return K?.(ae, {
          name: D
        });
      }, N?.(D)), !n.value && (Y = pe(r, function(ae) {
        o.value.textContent = ae, z?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, oe = function() {
    !l || !n.value || (Y(), Yr(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && bo(X), {
    id: v,
    name: p,
    el: o,
    css: r,
    unload: oe,
    load: X,
    isLoaded: Hn(n)
  };
}
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ye(e);
}
var St, $t, wt, Tt;
function Pt(e, t) {
  return Po(e) || To(e, t) || wo(e, t) || $o();
}
function $o() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function wo(e, t) {
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
function To(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
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
function Po(e) {
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
function We(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ct(Object(n), !0).forEach(function(r) {
      Oo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ct(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Oo(e, t, n) {
  return (t = Co(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Co(e) {
  var t = xo(e, "string");
  return ye(t) == "symbol" ? t : t + "";
}
function xo(e, t) {
  if (ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ee(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ko = function(t) {
  var n = t.dt;
  return "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    opacity: 0;\n    overflow: hidden;\n    padding: 0;\n    pointer-events: none;\n    position: absolute;\n    white-space: nowrap;\n    width: 1px;\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n    padding-right: ".concat(n("scrollbar.width"), ";\n}\n");
}, Eo = {}, Lo = {}, C = {
  name: "base",
  css: ko,
  style: ho,
  classes: Eo,
  inlineStyles: Lo,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(ke(St || (St = Ee(["", ""])), t));
    return O(o) ? So(he(o), We({
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
      return T.transformCSS(n.name || t.name, "".concat(o).concat(ke($t || ($t = Ee(["", ""])), r)));
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
      var r = j(this.css, {
        dt: re
      }) || "", o = he(ke(wt || (wt = Ee(["", "", ""])), r, t)), s = Object.entries(n).reduce(function(a, l) {
        var i = Pt(l, 2), u = i[0], d = i[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return O(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = ke(Tt || (Tt = Ee(["", ""])), j(this.style, {
        dt: re
      })), a = he(T.transformCSS(o, s)), l = Object.entries(n).reduce(function(i, u) {
        var d = Pt(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      O(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return We(We({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, G = nt();
function be(e) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, be(e);
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
function Le(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xt(Object(n), !0).forEach(function(r) {
      Ao(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ao(e, t, n) {
  return (t = jo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function jo(e) {
  var t = No(e, "string");
  return be(t) == "symbol" ? t : t + "";
}
function No(e, t) {
  if (be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ro = {
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
    text: [L.STARTS_WITH, L.CONTAINS, L.NOT_CONTAINS, L.ENDS_WITH, L.EQUALS, L.NOT_EQUALS],
    numeric: [L.EQUALS, L.NOT_EQUALS, L.LESS_THAN, L.LESS_THAN_OR_EQUAL_TO, L.GREATER_THAN, L.GREATER_THAN_OR_EQUAL_TO],
    date: [L.DATE_IS, L.DATE_IS_NOT, L.DATE_BEFORE, L.DATE_AFTER]
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
}, Io = Symbol();
function Vo(e, t) {
  var n = {
    config: Yn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Io, n), Do(), Mo(e, n), n;
}
var de = [];
function Do() {
  E.clear(), de.forEach(function(e) {
    return e?.();
  }), de = [];
}
function Mo(e, t) {
  var n = F(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !T.isStyleNameLoaded("common")) {
      var d, c, m = ((d = C.getCommonTheme) === null || d === void 0 ? void 0 : d.call(C)) || {}, p = m.primitive, f = m.semantic, v = m.global, g = m.style, y = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      C.load(p?.css, Le({
        name: "primitive-variables"
      }, y)), C.load(f?.css, Le({
        name: "semantic-variables"
      }, y)), C.load(v?.css, Le({
        name: "global-variables"
      }, y)), C.loadStyle(Le({
        name: "global-style"
      }, y), g), T.setLoadedStyleName("common");
    }
  };
  E.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = pe(t.config, function(i, u) {
    G.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = pe(function() {
    return t.config.ripple;
  }, function(i, u) {
    G.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = pe(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || T.setTheme(i), t.config.unstyled || r(), n.value = !1, G.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = pe(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), G.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  de.push(o), de.push(s), de.push(a), de.push(l);
}
var Bo = {
  install: function(t, n) {
    var r = Dr(Ro, n);
    Vo(t, r);
  }
}, gn = {
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
    this.mounted = ln();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Uo(e, t, n, r, o, s) {
  return s.inline ? je(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (qn(), Gn(Ft, {
    key: 1,
    to: n.appendTo
  }, [je(e.$slots, "default")], 8, ["to"])) : Ht("", !0);
}
gn.render = Uo;
var q = {
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
function Wo() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Jn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var kt = C.extend({
  name: "common"
});
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
function Fo(e) {
  return bn(e) || Ho(e) || yn(e) || vn();
}
function Ho(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function me(e, t) {
  return bn(e) || zo(e, t) || yn(e, t) || vn();
}
function vn() {
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
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
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
function $(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Et(Object(n), !0).forEach(function(r) {
      fe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Et(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fe(e, t, n) {
  return (t = Ko(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ko(e) {
  var t = Yo(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Yo(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qo = {
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
        E.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        E.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, s, a, l, i, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (s = o.onBeforeCreate) === null || s === void 0 || s.call(o);
    var v = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Wo(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = on(ce(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = $({
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
      return De(t) ? t.apply(void 0, r) : Ae.apply(void 0, r);
    },
    _load: function() {
      q.isStyleNameLoaded("base") || (C.loadCSS(this.$styleOptions), this._loadGlobalStyles(), q.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !q.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (kt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), q.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      O(t) && C.load(t, $({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!T.isStyleNameLoaded("common")) {
          var r, o, s = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = s.primitive, l = s.semantic, i = s.global, u = s.style;
          C.load(a?.css, $({
            name: "primitive-variables"
          }, this.$styleOptions)), C.load(l?.css, $({
            name: "semantic-variables"
          }, this.$styleOptions)), C.load(i?.css, $({
            name: "global-variables"
          }, this.$styleOptions)), C.loadStyle($({
            name: "global-style"
          }, this.$styleOptions), u), T.setLoadedStyleName("common");
        }
        if (!T.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, p, f = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = f.css, g = f.style;
          (m = this.$style) === null || m === void 0 || m.load(v, $({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle($({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), T.setLoadedStyleName(this.$style.name);
        }
        if (!T.isStyleNameLoaded("layer-order")) {
          var y, _, P = (y = this.$style) === null || y === void 0 || (_ = y.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(y);
          C.load(P, $({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), T.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, s = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = s.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, $({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      q.clearLoadedStyleNames(), E.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      E.off("theme:change", this._loadCoreStyles), E.off("theme:change", this._load), E.off("theme:change", this._themeScopedListener);
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
      return tt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = s ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, $($({}, o), {}, {
        global: m || {}
      })), f = this._getPTDatasets(r);
      return u || !u && p ? c ? this._mergeProps(c, m, p, f) : $($($({}, m), p), f) : $($({}, p), f);
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
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", s = r === "root" && O((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && $($({}, r === "root" && $($(fe({}, "".concat(o, "name"), M(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && fe({}, "".concat(o, "extend"), M(this.$.type.name))), {}, fe({}, "".concat(this.$attrSelector), ""))), {}, fe({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return A(t) || Xt(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, s = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = M(r), m = M(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: s(t.originalValue),
        value: s(t.value)
      } : s(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var s = function(v) {
        return n(v, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = s(t.originalValue), p = s(t.value);
        return m === void 0 && p === void 0 ? void 0 : A(p) ? p : A(m) ? m : u || !u && p ? c ? this._mergeProps(c, m, p) : $($({}, m), p) : p;
      }
      return s(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, $($({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Ae(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, $({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, $($({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, $($({}, this.$params), r)), s = this._getOptionValue(kt.inlineStyles, t, $($({}, this.$params), r));
        return [s, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return j(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, $({}, n.$params)) || j(r, $({}, n.$params));
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
        var o = me(r, 1), s = o[0];
        return n?.includes(s);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return $($({
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
        var n = me(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = me(n, 2), o = r[0], s = r[1], a = o.split(":"), l = Fo(a), i = Ge(l).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? s : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = me(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = me(n, 2), o = r[0], s = r[1];
        return t[o] = s, t;
      }, {});
    }
  }
}, Go = "\n    .p-contextmenu {\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n        min-width: 12.5rem;\n    }\n\n    .p-contextmenu-root-list,\n    .p-contextmenu-submenu {\n        margin: 0;\n        padding: dt('contextmenu.list.padding');\n        list-style: none;\n        outline: 0 none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('contextmenu.list.gap');\n    }\n\n    .p-contextmenu-submenu {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        min-width: 100%;\n        z-index: 1;\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n    }\n\n    .p-contextmenu-item {\n        position: relative;\n    }\n\n    .p-contextmenu-item-content {\n        transition:\n            background dt('contextmenu.transition.duration'),\n            color dt('contextmenu.transition.duration');\n        border-radius: dt('contextmenu.item.border.radius');\n        color: dt('contextmenu.item.color');\n    }\n\n    .p-contextmenu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('contextmenu.item.padding');\n        gap: dt('contextmenu.item.gap');\n        user-select: none;\n    }\n\n    .p-contextmenu-item-label {\n        line-height: 1;\n    }\n\n    .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.color');\n    }\n\n    .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.color');\n        margin-left: auto;\n        font-size: dt('contextmenu.submenu.icon.size');\n        width: dt('contextmenu.submenu.icon.size');\n        height: dt('contextmenu.submenu.icon.size');\n    }\n\n    .p-contextmenu-submenu-icon:dir(rtl) {\n        margin-left: 0;\n        margin-right: auto;\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.active.color');\n        background: dt('contextmenu.item.active.background');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.active.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.active.color');\n    }\n\n    .p-contextmenu-separator {\n        border-block-start: 1px solid dt('contextmenu.separator.border.color');\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu {\n        position: static;\n        box-shadow: none;\n        border: 0 none;\n        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');\n        padding-inline-end: 0;\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu-icon {\n        transition: transform 0.2s;\n        transform: rotate(90deg);\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        transform: rotate(-90deg);\n    }\n", Jo = {
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
C.extend({
  name: "contextmenu",
  style: Go,
  classes: Jo
});
var Qo = "\n.p-icon {\n    display: inline-block;\n    vertical-align: baseline;\n    flex-shrink: 0;\n}\n\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n\n@-webkit-keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n\n@keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n", Zo = C.extend({
  name: "baseicon",
  css: Qo
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
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
      Xo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Lt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Xo(e, t, n) {
  return (t = ei(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ei(e) {
  var t = ti(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function ti(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var es = {
  name: "BaseIcon",
  extends: qo,
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
  style: Zo,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Pe(this.label);
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
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function jt(e, t) {
  return ii(e) || oi(e, t) || ri(e, t) || ni();
}
function ni() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ri(e, t) {
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
function oi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
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
function ii(e) {
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
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(n), !0).forEach(function(r) {
      Je(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Je(e, t, n) {
  return (t = si(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function si(e) {
  var t = ai(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function ai(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var b = {
  _getMeta: function() {
    return [B(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], j(B(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, s;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: tt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var _ = b._getOptionValue.apply(b, arguments);
      return A(_) || Xt(_) ? {
        class: _
      } : _;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, p = m === void 0 ? !1 : m, f = l ? b._useDefaultPT(r, r.defaultPT(), i, s, a) : void 0, v = b._usePT(r, b._getPT(o, r.$name), i, s, w(w({}, a), {}, {
      global: f || {}
    })), g = b._getPTDatasets(r, s);
    return c || !c && v ? p ? b._mergeProps(r, p, f, v, g) : w(w(w({}, f), v), g) : w(w({}, v), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return w(w({}, n === "root" && Je({}, "".concat(r, "name"), M(t.$name))), {}, Je({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, i = r ? r(a) : a, u = M(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, a = function(g) {
      return r(g, o, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, p = a(n.originalValue), f = a(n.value);
      return p === void 0 && f === void 0 ? void 0 : A(f) ? f : A(p) ? p : d || !d && f ? m ? b._mergeProps(t, m, p, f) : w(w({}, p), f) : f;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(t, n, r, o, s);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, s = b._getConfig(r, o), a = {
      nonce: s == null || (t = s.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    b._loadCoreStyles(n, a), b._loadThemeStyles(n, a), b._loadScopedThemeStyles(n, a), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, a);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!q.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var s;
      C.loadCSS(o), (s = r.$style) === null || s === void 0 || s.loadCSS(o), q.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!T.isStyleNameLoaded("common")) {
        var a, l, i = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        C.load(u?.css, w({
          name: "primitive-variables"
        }, s)), C.load(d?.css, w({
          name: "semantic-variables"
        }, s)), C.load(c?.css, w({
          name: "global-variables"
        }, s)), C.loadStyle(w({
          name: "global-style"
        }, s), m), T.setLoadedStyleName("common");
      }
      if (!T.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, f, v, g, y = ((p = o.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, _ = y.css, P = y.style;
        (v = o.$style) === null || v === void 0 || v.load(_, w({
          name: "".concat(o.$style.name, "-variables")
        }, s)), (g = o.$style) === null || g === void 0 || g.loadStyle(w({
          name: "".concat(o.$style.name, "-style")
        }, s), P), T.setLoadedStyleName(o.$style.name);
      }
      if (!T.isStyleNameLoaded("layer-order")) {
        var h, S, k = (h = o.$style) === null || h === void 0 || (S = h.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(h);
        C.load(k, w({
          name: "layer-order",
          first: !0
        }, s)), T.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, s, a, l = ((o = t.$style) === null || o === void 0 || (s = o.getPresetTheme) === null || s === void 0 ? void 0 : s.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (a = t.$style) === null || a === void 0 ? void 0 : a.load(i, w({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    q.clearLoadedStyleNames(), E.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    E.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, s, a) {
    var l, i, u = "on".concat(Mr(n)), d = b._getConfig(o, s), c = r?.$instance, m = b._usePT(c, b._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), b._getOptionValue, "hooks.".concat(u)), p = b._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], b._getOptionValue, "hooks.".concat(u)), f = {
      el: r,
      binding: o,
      vnode: s,
      prevVnode: a
    };
    m?.(c, f), p?.(c, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return De(t) ? t.apply(void 0, r) : Ae.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, d, c) {
      var m, p, f, v;
      i._$instances = i._$instances || {};
      var g = b._getConfig(u, d), y = i._$instances[t] || {}, _ = Pe(y) ? w(w({}, n), n?.methods) : {};
      i._$instances[t] = w(w({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
        $style: w({
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
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(g?.pt, void 0, function(h) {
            var S;
            return h == null || (S = h.directives) === null || S === void 0 ? void 0 : S[t];
          });
        },
        isUnstyled: function() {
          var h, S;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (S = i._$instances[t]) === null || S === void 0 || (S = S.$binding) === null || S === void 0 || (S = S.value) === null || S === void 0 ? void 0 : S.unstyled : g?.unstyled;
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
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, S, w({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(i._$instances[t], h, S, k, !1);
        },
        cx: function() {
          var h, S, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : b._getOptionValue((S = i._$instances[t]) === null || S === void 0 || (S = S.$style) === null || S === void 0 ? void 0 : S.classes, k, w({}, N));
        },
        sx: function() {
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, N = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? b._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, S, w({}, N)) : void 0;
        }
      }, _), i.$instance = i._$instances[t], (p = (f = i.$instance)[l]) === null || p === void 0 || p.call(f, i, u, d, c), i["$".concat(t)] = i.$instance, b._hook(t, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = w(w({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(l) {
      var i, u, d, c = l._$instances[t], m = c?.watch, p = function(g) {
        var y, _ = g.newValue, P = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(c, _, P);
      }, f = function(g) {
        var y, _ = g.newValue, P = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, _, P);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), G.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), G.on("config:ripple:change", f);
    }, s = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (G.off("config:change", i.config), G.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: to("pd")
        }, r("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        b._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", l, i, u, d), o(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        b._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        r("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        b._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        s(l), b._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var t = b._getMeta.apply(b, arguments), n = jt(t, 2), r = n[0], o = n[1];
    return w({
      extend: function() {
        var a = b._getMeta.apply(b, arguments), l = jt(a, 2), i = l[0], u = l[1];
        return b.extend(i, w(w(w({}, o), o?.methods), u));
      }
    }, b._extend(r, o));
  }
}, li = "\n    .p-ink {\n        display: block;\n        position: absolute;\n        background: dt('ripple.background');\n        border-radius: 100%;\n        transform: scale(0);\n        pointer-events: none;\n    }\n\n    .p-ink-active {\n        animation: ripple 0.4s linear;\n    }\n\n    @keyframes ripple {\n        100% {\n            opacity: 0;\n            transform: scale(2.5);\n        }\n    }\n", ui = {
  root: "p-ink"
}, di = C.extend({
  name: "ripple-directive",
  style: li,
  classes: ui
}), ci = b.extend({
  style: di
});
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function mi(e) {
  return gi(e) || hi(e) || fi(e) || pi();
}
function pi() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function fi(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(e, t) : void 0;
  }
}
function hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gi(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function It(e, t, n) {
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vi(e) {
  var t = yi(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function yi(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ts = ci.extend("ripple", {
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
      n || (n = qr("span", It(It({
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
        if (!this.isUnstyled() && Be(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !pt(o) && !ft(o)) {
          var s = Math.max(Kr(r), Zr(r));
          o.style.height = s + "px", o.style.width = s + "px";
        }
        var a = Qr(r), l = t.pageX - a.left + document.body.scrollTop - ft(o) / 2, i = t.pageY - a.top + document.body.scrollLeft - pt(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Wr(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Be(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Be(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? mi(t.children).find(function(n) {
        return Jr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function bi(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function _i(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, $i(r.key), r);
  }
}
function Si(e, t, n) {
  return t && _i(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function $i(e) {
  var t = wi(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function wi(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var ns = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    bi(this, e), this.element = t, this.listener = n;
  }
  return Si(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Xr(this.element);
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
})(), rs = nt(), Ti = "\n    .p-menu {\n        background: dt('menu.background');\n        color: dt('menu.color');\n        border: 1px solid dt('menu.border.color');\n        border-radius: dt('menu.border.radius');\n        min-width: 12.5rem;\n    }\n\n    .p-menu-list {\n        margin: 0;\n        padding: dt('menu.list.padding');\n        outline: 0 none;\n        list-style: none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('menu.list.gap');\n    }\n\n    .p-menu-item-content {\n        transition:\n            background dt('menu.transition.duration'),\n            color dt('menu.transition.duration');\n        border-radius: dt('menu.item.border.radius');\n        color: dt('menu.item.color');\n        overflow: hidden;\n    }\n\n    .p-menu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('menu.item.padding');\n        gap: dt('menu.item.gap');\n        user-select: none;\n        outline: 0 none;\n    }\n\n    .p-menu-item-label {\n        line-height: 1;\n    }\n\n    .p-menu-item-icon {\n        color: dt('menu.item.icon.color');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-content {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-overlay {\n        box-shadow: dt('menu.shadow');\n    }\n\n    .p-menu-submenu-label {\n        background: dt('menu.submenu.label.background');\n        padding: dt('menu.submenu.label.padding');\n        color: dt('menu.submenu.label.color');\n        font-weight: dt('menu.submenu.label.font.weight');\n    }\n\n    .p-menu-separator {\n        border-block-start: 1px solid dt('menu.separator.border.color');\n    }\n", Pi = {
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
C.extend({
  name: "menu",
  style: Ti,
  classes: Pi
});
const Oi = "data-wippy-overlay-layer";
function _n() {
  return typeof window < "u" && typeof window.document < "u";
}
function Sn() {
  return _n() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ci() {
  return Sn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const xi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ki = 0;
const Ie = /* @__PURE__ */ new WeakMap();
function Vt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ei(e, t) {
  if (!xi.test(e.className))
    return;
  const n = e.style.cssText;
  Vt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
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
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Vt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ie.set(e, r);
  }
}
function rt(e) {
  const t = Ie.get(e);
  t && (t.disconnect(), Ie.delete(e));
}
function Li(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ze(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = "".concat(-window.scrollY - t.top, "px"), e.style.left = "".concat(-window.scrollX - t.left, "px");
}
const Ve = /* @__PURE__ */ new Set(), ot = /* @__PURE__ */ new WeakMap();
let Dt = !1, Xe = !1;
function Ai() {
  Xe = !1;
  for (const e of Ve) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && rt(t);
      Ve.delete(e), ot.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ze(e);
  }
}
function Mt() {
  Xe || (Xe = !0, requestAnimationFrame(Ai));
}
function ji(e) {
  const t = document.createElement("div");
  t.setAttribute(Oi, "");
  const n = Sn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ze(t);
  const r = new MutationObserver((o) => {
    const s = t.__wippyAnchorName;
    for (const a of o) {
      if (s)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Ei(l, s);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && rt(l);
    }
    t.isConnected && t.childElementCount > 0 && Ze(t);
  });
  return r.observe(t, { childList: !0 }), ot.set(t, r), Ve.add(t), Dt || (Dt = !0, window.addEventListener("scroll", Mt, { capture: !0, passive: !0 }), window.addEventListener("resize", Mt, { passive: !0 })), t;
}
function Bt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ji(e.hostRoot), Ci())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = "--wippy-a-".concat(++ki), e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Ut(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && rt(t);
    Ve.delete(e.layer), ot.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Wt = !1;
function Ni() {
  if (Wt)
    return;
  Wt = !0;
  const e = gn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    _n() && (this.hostRoot = Li(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Bt(this), this.$watch("inline", (t) => {
      t ? Ut(this) : Bt(this);
    })));
  }, e.render = function() {
    return this.inline ? je(this.$slots, "default", { key: 0 }) : this.mounted ? Qn(Ft, { key: 1, to: this.resolvedTarget || document.body }, [
      je(this.$slots, "default")
    ]) : Ht("", !0);
  }, e.unmounted = function() {
    Ut(this);
  };
}
const os = {
  install: (e) => {
    Ni(), e.use(Bo, { theme: "none" });
  }
};
export {
  Gi as $,
  C as B,
  ns as C,
  Fi as D,
  Xi as F,
  zi as I,
  Wi as J,
  qi as L,
  Ui as M,
  rs as O,
  os as P,
  ft as R,
  Hi as S,
  pt as T,
  Bi as W,
  Qi as Y,
  qo as a,
  O as b,
  gn as c,
  ts as d,
  Ji as e,
  Br as f,
  sn as g,
  Ki as h,
  Yi as i,
  Di as j,
  Rr as k,
  ze as p,
  es as s,
  Mi as u,
  Kr as v,
  Zi as x,
  on as z
};
//# sourceMappingURL=wc-runtime-D250RObL.js.map
