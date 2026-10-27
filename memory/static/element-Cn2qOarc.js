import { hasInjectionContext as lr, inject as ke, effectScope as cr, ref as L, markRaw as pr, createApp as ur, onMounted as mt, onUnmounted as dr, watch as oe, readonly as mr, getCurrentInstance as ze, nextTick as fr, reactive as hr, renderSlot as ye, openBlock as gr, createBlock as vr, Teleport as ft, createCommentVNode as ht, h as yr } from "vue";
import { addCollection as br } from "@iconify/vue";
import { config as Fe, addIcons as xr, on as wr, applyThemeMode as me, host as Sr, hostCss as kr, loadCss as _r } from "@wippy-fe/proxy";
var Oe = "data-wippy-visible";
function He(e) {
  const t = e.getAttribute(Oe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Cr = Object.defineProperty, Tr = (e, t, r) => t in e ? Cr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, b = (e, t, r) => Tr(e, typeof t != "symbol" ? t + "" : t, r), Or = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Er = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function We(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Pr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [n, o] of Object.entries(r)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const s = typeof l == "string" ? We(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof o == "string" ? We(n) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Ar(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Er} {
${t}
}`;
}
function Lr(e, t) {
  const r = Ar(t);
  r && gt(e, r, "@wippy-fe/css-variables-bridge");
}
function $r(e, t) {
  const n = (t ?? Or).map(async (o) => {
    const i = kr[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await _r(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, a), null;
    }
  });
  return Promise.all(n).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Nr(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function gt(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", r), n.textContent = t, e.appendChild(n);
}
function Rr(e, t) {
  gt(e, t, "@wippy-fe/custom-css");
}
function vt(e) {
  return e.__wippyHost ?? null;
}
function jr(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function Dr(e, t, r) {
  switch (r.type) {
    case "string":
      return { value: t };
    case "number": {
      const n = Number.parseFloat(t);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: n };
    }
    case "integer": {
      const n = Number.parseInt(t, 10);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: n };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const n = JSON.parse(t);
        return r.type === "array" && !Array.isArray(n) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: n };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function _e(e, t) {
  const r = {}, n = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = jr(o);
    if (a === null) {
      i.default !== void 0 && (r[l] = i.default);
      continue;
    }
    const s = Dr(o, a, i);
    s.error ? n.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: n };
}
var Vr = class {
  constructor(e, t) {
    b(this, "_props"), b(this, "_errors"), b(this, "_content"), b(this, "_hostVisibility"), b(this, "_propsListeners", /* @__PURE__ */ new Set()), b(this, "_contentListeners", /* @__PURE__ */ new Set()), b(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), b(this, "_disposed", !1), b(this, "_emitToDom"), b(this, "props"), b(this, "events"), b(this, "content"), b(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(n, o) {
        return r._subscribeProps(n, o);
      }
    }, this.events = {
      emit(n, o) {
        r._disposed || r._emitToDom(n, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(n, o) {
        return r._subscribeContent(n, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(n, o) {
        return r._subscribeHostVisibility(n, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const r of this._propsListeners)
        r(e, t);
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
      for (const r of this._hostVisibilityListeners)
        r(e, t);
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
    const r = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const r = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const r = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
}, Ir = class extends HTMLElement {
  constructor() {
    super(), b(this, "_internals"), b(this, "_contentObserver", null), b(this, "_initialized", !1), b(this, "_container", null), b(this, "_reactive", null), b(this, "_lastProps", null), b(this, "_lastErrors", []), b(this, "_lastContent", null), b(this, "_themeUnsub", null), b(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = He(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), r = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...r, Oe])];
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
    return vt(this);
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
      let r, n;
      if (this._lastProps !== null)
        r = this._lastProps, n = this._lastErrors;
      else {
        const i = _e(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, n = i.errors, this._lastProps = r, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Vr(
        { props: r, errors: n, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, r = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let n;
      if (t)
        n = this._container;
      else {
        this.onInit(r), e.inlineCss && Nr(r, e.inlineCss);
        try {
          const c = Fe?.theming, p = Pr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Lr(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = Fe?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Rr(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && $r(r, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && n.classList.add(...s), r.appendChild(n), this._container = n, xr(br);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = wr("@theme", (s) => this._applyTheme(s)));
      const { props: o, errors: i } = _e(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const a = o;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, n, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Sr.getThemeMode?.()) {
    me(e, this), this._container && me(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), me("auto", this), this._container && me("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === Oe) {
      const l = this._hostVisible, s = He(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: i } = _e(this, n.propsSchema);
    n.validateProps && i.push(...n.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = i, this._reactive?.notifyProps(a, i), this.onPropsChanged(a, i);
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
    console.error(`${this.constructor.name} initialization failed:`, e);
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
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function Mr(e) {
  return e.__wippyHostBus ?? null;
}
function zr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let yt;
const bt = (e) => yt = e, Fr = () => lr() && ke(xt) || yt, xt = (
  /* istanbul ignore next */
  Symbol()
);
function Hr() {
  const e = cr(!0), t = e.run(() => L({}));
  let r = [], n = [];
  const o = pr({
    install(i) {
      bt(o), o._a = i, i.provide(xt, o), i.config.globalProperties.$pinia = o, n.forEach((a) => r.push(a)), n = [];
    },
    use(i) {
      return this._a ? r.push(i) : n.push(i), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Wr = Object.defineProperty, Br = (e, t, r) => t in e ? Wr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, te = (e, t, r) => Br(e, typeof t != "symbol" ? t + "" : t, r), wt = /* @__PURE__ */ Symbol("wippy:emit"), St = /* @__PURE__ */ Symbol("wippy:props"), Ur = /* @__PURE__ */ Symbol("wippy:props_error"), Kr = /* @__PURE__ */ Symbol("wippy:content"), Yr = /* @__PURE__ */ Symbol("wippy:panel-id"), qr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Gr = /* @__PURE__ */ Symbol("wippy:host"), kt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function go() {
  const e = ke(St);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function vo() {
  const e = ke(wt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Jr() {
  const e = ke(kt);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function yo(e) {
  const t = Jr();
  let r = !1, n = null, o = !1;
  function i() {
    if (n)
      return o = !0, n;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (s) {
      a = Promise.reject(s);
    }
    const l = a.finally(() => {
      if (n === l && (n = null, r && o))
        return o = !1, i();
    });
    return n = l, l;
  }
  return mt(() => (r = !0, i())), dr(() => {
    r = !1, o = !1;
  }), oe(t, (a, l) => {
    if (r && l === !1 && a === !0)
      return i();
  }), t;
}
var Qr = class extends Ir {
  constructor() {
    super(...arguments), te(this, "_vueApp", null), te(this, "_propsRef", L({})), te(this, "_errorsRef", L([])), te(this, "_contentRef", L(null)), te(this, "_hostVisibilityRef", L(null)), te(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, n, o, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = n, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of n)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const d of p)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const s = (c) => {
      if (l.signal.aborted)
        return;
      const p = Fr(), d = ur(c.rootComponent);
      this._vueApp = d;
      const u = Hr();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          u.use(m);
      if (d.use(u), c.plugins)
        for (const m of c.plugins)
          d.use(m);
      d.provide(St, this._propsRef), d.provide(Ur, this._errorsRef), d.provide(wt, this.emitEvent.bind(this)), d.provide(Kr, this._contentRef), d.provide(kt, this._hostVisibilityRef), d.provide(Yr, zr(this)), d.provide(qr, Mr(this)), d.provide(Gr, vt(this)), c.providers && c.providers(d, this), d.mount(t), p && bt(p);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), a.lazyConfig().then((p) => {
        l.signal.aborted || (c.remove(), s(p));
      }).catch((p) => {
        if (l.signal.aborted)
          return;
        const d = p instanceof Error ? p.message : String(p), u = document.createElement("wippy-error");
        u.setAttribute("title", "Failed to load"), u.setAttribute("message", d), c.replaceWith(u), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Zr = Object.defineProperty, Be = Object.getOwnPropertySymbols, Xr = Object.prototype.hasOwnProperty, en = Object.prototype.propertyIsEnumerable, Ue = (e, t, r) => t in e ? Zr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, tn = (e, t) => {
  for (var r in t || (t = {})) Xr.call(t, r) && Ue(e, r, t[r]);
  if (Be) for (var r of Be(t)) en.call(t, r) && Ue(e, r, t[r]);
  return e;
};
function je(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ee(e, t, r = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || r.has(e) || r.has(t)) return !1;
  r.add(e).add(t);
  let n = Array.isArray(e), o = Array.isArray(t), i, a, l;
  if (n && o) {
    if (a = e.length, a != t.length) return !1;
    for (i = a; i-- !== 0; ) if (!Ee(e[i], t[i], r)) return !1;
    return !0;
  }
  if (n != o) return !1;
  let s = e instanceof Date, c = t instanceof Date;
  if (s != c) return !1;
  if (s && c) return e.getTime() == t.getTime();
  let p = e instanceof RegExp, d = t instanceof RegExp;
  if (p != d) return !1;
  if (p && d) return e.toString() == t.toString();
  let u = Object.keys(e);
  if (a = u.length, a !== Object.keys(t).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, u[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = u[i], !Ee(e[l], t[l], r)) return !1;
  return !0;
}
function rn(e, t) {
  return Ee(e, t);
}
function _t(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function y(e) {
  return !je(e);
}
function Pe(e, t) {
  if (!e || !t) return null;
  try {
    let r = e[t];
    if (y(r)) return r;
  } catch {
  }
  if (Object.keys(e).length) {
    if (_t(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let r = t.split("."), n = e;
      for (let o = 0, i = r.length; o < i; ++o) {
        if (n == null) return null;
        n = n[r[o]];
      }
      return n;
    }
  }
  return null;
}
function nn(e, t, r) {
  return r ? Pe(e, r) === Pe(t, r) : rn(e, t);
}
function V(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Ct(e = {}, t = {}) {
  let r = tn({}, e);
  return Object.keys(t).forEach((n) => {
    let o = n;
    V(t[o]) && o in e && V(e[o]) ? r[o] = Ct(e[o], t[o]) : r[o] = t[o];
  }), r;
}
function on(...e) {
  return e.reduce((t, r, n) => n === 0 ? r : Ct(t, r), {});
}
function bo(e, t) {
  let r = -1;
  if (y(e)) try {
    r = e.findLastIndex(t);
  } catch {
    r = e.lastIndexOf([...e].reverse().find(t));
  }
  return r;
}
function O(e, ...t) {
  return _t(e) ? e(...t) : e;
}
function I(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ke(e) {
  return I(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function an(e, t = "", r = {}) {
  let n = Ke(t).split("."), o = n.shift();
  if (o) {
    if (V(e)) {
      let i = Object.keys(e).find((a) => Ke(a) === o) || "";
      return an(O(e[i], r), n.join("."), r);
    }
    return;
  }
  return O(e, r);
}
function xo(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function sn(e) {
  return y(e) && !isNaN(e);
}
function wo(e = "") {
  return y(e) && e.length === 1 && !!e.match(/\S| /);
}
function q(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function ln(...e) {
  return on(...e);
}
function ae(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function k(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let r in t) e = e.replace(t[r], r);
  }
  return e;
}
function So(e) {
  return I(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Tt(e) {
  return I(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Ot() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let n = e.get(t);
    return n ? n.push(r) : n = [r], e.set(t, n), this;
  }, off(t, r) {
    let n = e.get(t);
    return n && n.splice(n.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let n = e.get(t);
    n && n.forEach((o) => {
      o(r);
    });
  }, clear() {
    e.clear();
  } };
}
function cn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function ko(e, t) {
  if (e && t) {
    let r = (n) => {
      cn(e, n) || (e.classList ? e.classList.add(n) : e.className += " " + n);
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function _o(e, t) {
  if (e && t) {
    let r = (n) => {
      e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Ae(e) {
  for (let t of document?.styleSheets) try {
    for (let r of t?.cssRules) for (let n of r?.style) if (e.test(n)) return { name: n, value: r.style.getPropertyValue(n).trim() };
  } catch {
  }
  return null;
}
function Et(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [r, n] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = n, e.style.visibility = r;
  }
  return t;
}
function Pt() {
  let e = window, t = document, r = t.documentElement, n = t.getElementsByTagName("body")[0], o = e.innerWidth || r.clientWidth || n.clientWidth, i = e.innerHeight || r.clientHeight || n.clientHeight;
  return { width: o, height: i };
}
function Le(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function pn() {
  let e = document.documentElement;
  return (window.pageXOffset || Le(e)) - (e.clientLeft || 0);
}
function un() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function dn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Co(e, t, r = !0) {
  var n, o, i, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Et(e), s = l.height, c = l.width, p = t.offsetHeight, d = t.offsetWidth, u = t.getBoundingClientRect(), m = un(), f = pn(), g = Pt(), h, v, x = "top";
    u.top + p + s > g.height ? (h = u.top + m - s, x = "bottom", h < 0 && (h = m)) : h = p + u.top + m, u.left + c > g.width ? v = Math.max(0, u.left + f + d - c) : v = u.left + f, dn(e) ? e.style.insetInlineEnd = v + "px" : e.style.insetInlineStart = v + "px", e.style.top = h + "px", e.style.transformOrigin = x, r && (e.style.marginTop = x === "bottom" ? `calc(${(o = (n = Ae(/-anchor-gutter$/)) == null ? void 0 : n.value) != null ? o : "2px"} * -1)` : (a = (i = Ae(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? a : "");
  }
}
function To(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([r, n]) => e.style[r] = n));
}
function Oo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Eo(e, t, r = !0, n = void 0) {
  var o;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Et(e), a = t.offsetHeight, l = t.getBoundingClientRect(), s = Pt(), c, p, d = n ?? "top";
    if (!n && l.top + a + i.height > s.height ? (c = -1 * i.height, d = "bottom", l.top + c < 0 && (c = -1 * l.top)) : c = a, i.width > s.width ? p = l.left * -1 : l.left + i.width > s.width ? p = (l.left + i.width - s.width) * -1 : p = 0, e.style.top = c + "px", e.style.insetInlineStart = p + "px", e.style.transformOrigin = d, r) {
      let u = (o = Ae(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = d === "bottom" ? `calc(${u ?? "2px"} * -1)` : u ?? "";
    }
  }
}
function At(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function mn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && At(e));
}
function ue(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Po() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function be(e, t = {}) {
  if (ue(e)) {
    let r = (n, o) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[n] ? [(a = e?.$attrs) == null ? void 0 : a[n]] : [];
      return [o].flat().reduce((s, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") s.push(c);
          else if (p === "object") {
            let d = Array.isArray(c) ? r(n, c) : Object.entries(c).map(([u, m]) => n === "style" && (m || m === 0) ? `${u.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? u : void 0);
            s = d.length ? s.concat(d.filter((u) => !!u)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([n, o]) => {
      if (o != null) {
        let i = n.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : n === "p-bind" || n === "pBind" ? be(e, o) : (o = n === "class" ? [...new Set(r("class", o))].join(" ").trim() : n === "style" ? r("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[n] = o), e.setAttribute(n, o));
      }
    });
  }
}
function Ao(e, t = {}, ...r) {
  {
    let n = document.createElement(e);
    return be(n, t), n.append(...r), n;
  }
}
function fn(e, t) {
  return ue(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function hn(e, t) {
  return ue(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Lo(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function $o(e, t) {
  if (ue(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function Lt(e, t = "") {
  let r = fn(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), n = [];
  for (let o of r) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && n.push(o);
  return n;
}
function No(e, t) {
  let r = Lt(e, t);
  return r.length > 0 ? r[0] : null;
}
function Ro(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function jo(e, t) {
  let r = Lt(e, t);
  return r.length > 0 ? r[r.length - 1] : null;
}
function Do(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Le(document.documentElement) || Le(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Vo(e, t) {
  return e ? e.offsetHeight : 0;
}
function $t(e, t = []) {
  let r = At(e);
  return r === null ? t : $t(r, t.concat([r]));
}
function Io(e) {
  let t = [];
  if (e) {
    let r = $t(e), n = /(auto|scroll)/, o = (i) => {
      try {
        let a = window.getComputedStyle(i, null);
        return n.test(a.getPropertyValue("overflow")) || n.test(a.getPropertyValue("overflowX")) || n.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of r) {
      let a = i.nodeType === 1 && i.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let s of l) {
          let c = hn(i, s);
          c && o(c) && t.push(c);
        }
      }
      i.nodeType !== 9 && o(i) && t.push(i);
    }
  }
  return t;
}
function Mo() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function zo(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function Fo() {
  return /(android)/i.test(navigator.userAgent);
}
function Nt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ho(e) {
  return !!(e && e.offsetParent != null);
}
function Wo() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function gn(e, t = "", r) {
  ue(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var vn = Object.defineProperty, yn = Object.defineProperties, bn = Object.getOwnPropertyDescriptors, xe = Object.getOwnPropertySymbols, Rt = Object.prototype.hasOwnProperty, jt = Object.prototype.propertyIsEnumerable, Ye = (e, t, r) => t in e ? vn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, C = (e, t) => {
  for (var r in t || (t = {})) Rt.call(t, r) && Ye(e, r, t[r]);
  if (xe) for (var r of xe(t)) jt.call(t, r) && Ye(e, r, t[r]);
  return e;
}, Ce = (e, t) => yn(e, bn(t)), P = (e, t) => {
  var r = {};
  for (var n in e) Rt.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && xe) for (var n of xe(e)) t.indexOf(n) < 0 && jt.call(e, n) && (r[n] = e[n]);
  return r;
}, xn = Ot(), A = xn, se = /{([^}]*)}/g, Dt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Vt = /var\([^)]+\)/g;
function qe(e) {
  return I(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function wn(e) {
  return V(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Sn(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function $e(e = "", t = "") {
  return Sn(`${I(e, !1) && I(t, !1) ? `${e}-` : e}${t}`);
}
function It(e = "", t = "") {
  return `--${$e(e, t)}`;
}
function kn(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function Mt(e, t = "", r = "", n = [], o) {
  if (I(e)) {
    let i = e.trim();
    if (kn(i)) return;
    if (q(i, se)) {
      let a = i.replaceAll(se, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !n.some((p) => q(c, p)));
        return `var(${It(r, Tt(s.join("-")))}${y(o) ? `, ${o}` : ""})`;
      });
      return q(a.replace(Vt, "0"), Dt) ? `calc(${a})` : a;
    }
    return i;
  } else if (sn(e)) return e;
}
function _n(e, t, r) {
  I(t, !1) && e.push(`${t}:${r};`);
}
function ne(e, t) {
  return e ? `${e}{${t}}` : "";
}
function zt(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, l) {
    let s = [], c = 0, p = "", d = null, u = 0;
    for (; c <= a.length; ) {
      let m = a[c];
      if ((m === '"' || m === "'" || m === "`") && a[c - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && u++, m === ")" && u--, (m === "," || c === a.length) && u === 0)) {
        let f = p.trim();
        f.startsWith("dt(") ? s.push(zt(f, l)) : s.push(n(f)), p = "", c++;
        continue;
      }
      m !== void 0 && (p += m), c++;
    }
    return s;
  }
  function n(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let o = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && o.push([l, a]);
  }
  if (!o.length) return e;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, s] = o[a], c = e.slice(l + 3, s), p = r(c, t), d = t(...p);
    e = e.slice(0, l) + d + e.slice(s + 1);
  }
  return e;
}
var G = (...e) => Cn(S.getTheme(), ...e), Cn = (e = {}, t, r, n) => {
  if (t) {
    let { variable: o, options: i } = S.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = q(t, se) ? t : `{${t}}`;
    return n === "value" || je(n) && l === "strict" ? S.getTokenValue(t) : Mt(s, void 0, a, [o.excludedKeyRegex], r);
  }
  return "";
};
function fe(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((n, o, i) => {
      var a;
      return n + o + ((a = O(t[i], { dt: G })) != null ? a : "");
    }, "");
    return zt(r, G);
  }
  return O(e, { dt: G });
}
function Tn(e, t = {}) {
  let r = S.defaults.variable, { prefix: n = r.prefix, selector: o = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: n }];
  for (; s.length; ) {
    let { node: p, path: d } = s.pop();
    for (let u in p) {
      let m = p[u], f = wn(m), g = q(u, i) ? $e(d) : $e(d, Tt(u));
      if (V(f)) s.push({ node: f, path: g });
      else {
        let h = It(g), v = Mt(f, g, n, [i]);
        _n(l, h, v);
        let x = g;
        n && x.startsWith(n + "-") && (x = x.slice(n.length + 1)), a.push(x.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: a, declarations: c, css: ne(o, c) };
}
var _ = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((r) => r !== "custom").map((r) => this.rules[r]);
  return [e].flat().map((r) => {
    var n;
    return (n = t.map((o) => o.resolve(r)).find((o) => o.matched)) != null ? n : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return Tn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i, a, l, s, c, p, d;
  let { preset: u, options: m } = t, f, g, h, v, x, M, z;
  if (y(u) && m.transform !== "strict") {
    let { primitive: J, semantic: F, extend: $ } = u, N = F || {}, { colorScheme: R } = N, H = P(N, ["colorScheme"]), j = $ || {}, { colorScheme: W } = j, B = P(j, ["colorScheme"]), D = R || {}, { dark: U } = D, Q = P(D, ["dark"]), K = W || {}, { dark: Z } = K, X = P(K, ["dark"]), E = y(J) ? this._toVariables({ primitive: J }, m) : {}, T = y(H) ? this._toVariables({ semantic: H }, m) : {}, Y = y(Q) ? this._toVariables({ light: Q }, m) : {}, de = y(U) ? this._toVariables({ dark: U }, m) : {}, ee = y(B) ? this._toVariables({ semantic: B }, m) : {}, Ie = y(X) ? this._toVariables({ light: X }, m) : {}, Me = y(Z) ? this._toVariables({ dark: Z }, m) : {}, [Bt, Ut] = [(i = E.declarations) != null ? i : "", E.tokens], [Kt, Yt] = [(a = T.declarations) != null ? a : "", T.tokens || []], [qt, Gt] = [(l = Y.declarations) != null ? l : "", Y.tokens || []], [Jt, Qt] = [(s = de.declarations) != null ? s : "", de.tokens || []], [Zt, Xt] = [(c = ee.declarations) != null ? c : "", ee.tokens || []], [er, tr] = [(p = Ie.declarations) != null ? p : "", Ie.tokens || []], [rr, nr] = [(d = Me.declarations) != null ? d : "", Me.tokens || []];
    f = this.transformCSS(e, Bt, "light", "variable", m, n, o), g = Ut;
    let or = this.transformCSS(e, `${Kt}${qt}`, "light", "variable", m, n, o), ir = this.transformCSS(e, `${Jt}`, "dark", "variable", m, n, o);
    h = `${or}${ir}`, v = [.../* @__PURE__ */ new Set([...Yt, ...Gt, ...Qt])];
    let ar = this.transformCSS(e, `${Zt}${er}color-scheme:light`, "light", "variable", m, n, o), sr = this.transformCSS(e, `${rr}color-scheme:dark`, "dark", "variable", m, n, o);
    x = `${ar}${sr}`, M = [.../* @__PURE__ */ new Set([...Xt, ...tr, ...nr])], z = O(u.css, { dt: G });
  }
  return { primitive: { css: f, tokens: g }, semantic: { css: h, tokens: v }, global: { css: x, tokens: M }, style: z };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: n, set: o, defaults: i, selector: a }) {
  var l, s, c;
  let p, d, u;
  if (y(t) && r.transform !== "strict") {
    let m = e.replace("-directive", ""), f = t, { colorScheme: g, extend: h, css: v } = f, x = P(f, ["colorScheme", "extend", "css"]), M = h || {}, { colorScheme: z } = M, J = P(M, ["colorScheme"]), F = g || {}, { dark: $ } = F, N = P(F, ["dark"]), R = z || {}, { dark: H } = R, j = P(R, ["dark"]), W = y(x) ? this._toVariables({ [m]: C(C({}, x), J) }, r) : {}, B = y(N) ? this._toVariables({ [m]: C(C({}, N), j) }, r) : {}, D = y($) ? this._toVariables({ [m]: C(C({}, $), H) }, r) : {}, [U, Q] = [(l = W.declarations) != null ? l : "", W.tokens || []], [K, Z] = [(s = B.declarations) != null ? s : "", B.tokens || []], [X, E] = [(c = D.declarations) != null ? c : "", D.tokens || []], T = this.transformCSS(m, `${U}${K}`, "light", "variable", r, o, i, a), Y = this.transformCSS(m, X, "dark", "variable", r, o, i, a);
    p = `${T}${Y}`, d = [.../* @__PURE__ */ new Set([...Q, ...Z, ...E])], u = O(v, { dt: G });
  }
  return { css: p, tokens: d, style: u };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: r, set: n, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: c } = t, p = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: p, options: c, params: r, set: n, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, n) {
  let { cssLayer: o } = t;
  return o ? `@layer ${O(o.order || o.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: o, defaults: i }), l = Object.entries(n).reduce((s, [c, p]) => s.push(`${c}="${p}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [c, p]) => {
    if (V(p) && Object.hasOwn(p, "css")) {
      let d = ae(p.css), u = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${u}" ${l}>${d}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: r, set: o, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, c = Object.entries(n).reduce((p, [d, u]) => p.push(`${d}="${u}"`) && p, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${ae(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", n = "", o = {}) {
  let i = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && se.test(this.value)) {
      let d = this.value.trim().replace(se, (u) => {
        var m;
        let f = u.slice(1, -1), g = this.tokens[f];
        if (!g) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let h = g.computed(l, s, c);
        return Array.isArray(h) && h.length === 2 ? `light-dark(${h[0].value},${h[1].value})` : (m = h?.value) != null ? m : "__UNRESOLVED__";
      });
      p = Dt.test(d.replace(Vt, "0")) ? `calc(${d})` : d;
    }
    return je(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, a = (l, s, c) => {
    Object.entries(l).forEach(([p, d]) => {
      let u = q(p, t.variable.excludedKeyRegex) ? s : s ? `${s}.${qe(p)}` : qe(p), m = c ? `${c}.${p}` : p;
      V(d) ? a(d, u, m) : (o[u] || (o[u] = { paths: [], computed: (f, g = {}, h = []) => {
        if (o[u].paths.length === 1) return o[u].paths[0].computed(o[u].paths[0].scheme, g.binding, h);
        if (f && f !== "none") for (let v = 0; v < o[u].paths.length; v++) {
          let x = o[u].paths[v];
          if (x.scheme === f) return x.computed(f, g.binding, h);
        }
        return o[u].paths.map((v) => v.computed(v.scheme, g[v.scheme], h));
      } }), o[u].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return a(e, r, n), o;
}, getTokenValue(e, t, r) {
  var n;
  let o = ((l) => l.split(".").filter((s) => !q(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(n = e[o]) == null ? void 0 : n.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let c = s, { colorScheme: p } = c, d = P(c, ["colorScheme"]);
    return l[p] = d, l;
  }, void 0);
}, getSelectorRule(e, t, r, n) {
  return r === "class" || r === "attr" ? ne(y(t) ? `${e}${t},${e} ${t}` : e, n) : ne(e, ne(t ?? ":root,:host", n));
}, transformCSS(e, t, r, n, o = {}, i, a, l) {
  if (y(t)) {
    let { cssLayer: s } = o;
    if (n !== "style") {
      let c = this.getColorSchemeOption(o, a);
      t = r === "dark" ? c.reduce((p, { type: d, selector: u }) => (y(u) && (p += u.includes("[CSS]") ? u.replace("[CSS]", t) : this.getSelectorRule(u, l, d, t)), p), "") : ne(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      V(s) && (c.name = O(s.name, { name: e, type: n })), y(c.name) && (t = ne(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, S = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ce(C({}, t), { options: C(C({}, this.defaults.options), t.options) }), this._tokens = _.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), A.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ce(C({}, this.theme), { preset: e }), this._tokens = _.createTokens(e, this.defaults), this.clearLoadedStyleNames(), A.emit("preset:change", e), A.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ce(C({}, this.theme), { options: e }), this.clearLoadedStyleNames(), A.emit("options:change", e), A.emit("theme:change", this.theme);
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
  return _.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return _.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPresetD(r);
}, getCustomPreset(e = "", t, r, n) {
  let o = { name: e, preset: t, options: this.options, selector: r, params: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return _.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", n) {
  return _.transformCSS(e, t, n, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return _.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return _.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), A.emit(`theme:${t}:load`, e), !this._loadingStyles.size && A.emit("theme:load"));
} }, w = {
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
function Ge(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!r) {
    if (Array.isArray(e) || (r = On(e)) || t) {
      r && (e = r);
      var n = 0, o = function() {
      };
      return { s: o, n: function() {
        return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, a = !0, l = !1;
  return { s: function() {
    r = r.call(e);
  }, n: function() {
    var c = r.next();
    return a = c.done, c;
  }, e: function(c) {
    l = !0, i = c;
  }, f: function() {
    try {
      a || r.return == null || r.return();
    } finally {
      if (l) throw i;
    }
  } };
}
function On(e, t) {
  if (e) {
    if (typeof e == "string") return Je(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Je(e, t) : void 0;
  }
}
function Je(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
var Bo = {
  filter: function(t, r, n, o, i) {
    var a = [];
    if (!t)
      return a;
    var l = Ge(t), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var c = s.value;
        if (typeof c == "string") {
          if (this.filters[o](c, n, i)) {
            a.push(c);
            continue;
          }
        } else {
          var p = Ge(r), d;
          try {
            for (p.s(); !(d = p.n()).done; ) {
              var u = d.value, m = Pe(c, u);
              if (this.filters[o](m, n, i)) {
                a.push(c);
                break;
              }
            }
          } catch (f) {
            p.e(f);
          } finally {
            p.f();
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
    startsWith: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = k(r.toString()).toLocaleLowerCase(n), i = k(t.toString()).toLocaleLowerCase(n);
      return i.slice(0, o.length) === o;
    },
    contains: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = k(r.toString()).toLocaleLowerCase(n), i = k(t.toString()).toLocaleLowerCase(n);
      return i.indexOf(o) !== -1;
    },
    notContains: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = k(r.toString()).toLocaleLowerCase(n), i = k(t.toString()).toLocaleLowerCase(n);
      return i.indexOf(o) === -1;
    },
    endsWith: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = k(r.toString()).toLocaleLowerCase(n), i = k(t.toString()).toLocaleLowerCase(n);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(t, r, n) {
      return r == null || r === "" ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() === r.getTime() : k(t.toString()).toLocaleLowerCase(n) == k(r.toString()).toLocaleLowerCase(n);
    },
    notEquals: function(t, r, n) {
      return r == null || r === "" ? !1 : t == null ? !0 : t.getTime && r.getTime ? t.getTime() !== r.getTime() : k(t.toString()).toLocaleLowerCase(n) != k(r.toString()).toLocaleLowerCase(n);
    },
    in: function(t, r) {
      if (r == null || r.length === 0)
        return !0;
      for (var n = 0; n < r.length; n++)
        if (nn(t, r[n]))
          return !0;
      return !1;
    },
    between: function(t, r) {
      return r == null || r[0] == null || r[1] == null ? !0 : t == null ? !1 : t.getTime ? r[0].getTime() <= t.getTime() && t.getTime() <= r[1].getTime() : r[0] <= t && t <= r[1];
    },
    lt: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() < r.getTime() : t < r;
    },
    lte: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() <= r.getTime() : t <= r;
    },
    gt: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() > r.getTime() : t > r;
    },
    gte: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() >= r.getTime() : t >= r;
    },
    dateIs: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.toDateString() === r.toDateString());
    },
    dateIsNot: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.toDateString() !== r.toDateString());
    },
    dateBefore: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.getTime() < r.getTime());
    },
    dateAfter: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.getTime() > r.getTime());
    }
  },
  register: function(t, r) {
    this.filters[t] = r;
  }
}, En = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function le(e) {
  "@babel/helpers - typeof";
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, le(e);
}
function Qe(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Ze(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qe(Object(r), !0).forEach(function(n) {
      Pn(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Qe(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Pn(e, t, r) {
  return (t = An(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function An(e) {
  var t = Ln(e, "string");
  return le(t) == "symbol" ? t : t + "";
}
function Ln(e, t) {
  if (le(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (le(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function $n(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  ze() && ze().components ? mt(e) : t ? e() : fr(e);
}
var Nn = 0;
function Rn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = L(!1), n = L(e), o = L(null), i = Nt() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, c = s === void 0 ? !0 : s, p = t.manual, d = p === void 0 ? !1 : p, u = t.name, m = u === void 0 ? "style_".concat(++Nn) : u, f = t.id, g = f === void 0 ? void 0 : f, h = t.media, v = h === void 0 ? void 0 : h, x = t.nonce, M = x === void 0 ? void 0 : x, z = t.first, J = z === void 0 ? !1 : z, F = t.onMounted, $ = F === void 0 ? void 0 : F, N = t.onUpdated, R = N === void 0 ? void 0 : N, H = t.onLoad, j = H === void 0 ? void 0 : H, W = t.props, B = W === void 0 ? {} : W, D = function() {
  }, U = function(Z) {
    var X = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var E = Ze(Ze({}, B), X), T = E.name || m, Y = E.id || g, de = E.nonce || M;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(T, '"]')) || l.getElementById(Y) || l.createElement("style"), o.value.isConnected || (n.value = Z || e, be(o.value, {
        type: "text/css",
        id: Y,
        media: v,
        nonce: de
      }), J ? l.head.prepend(o.value) : l.head.appendChild(o.value), gn(o.value, "data-primevue-style-id", T), be(o.value, E), o.value.onload = function(ee) {
        return j?.(ee, {
          name: T
        });
      }, $?.(T)), !r.value && (D = oe(n, function(ee) {
        o.value.textContent = ee, R?.(T);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, Q = function() {
    !l || !r.value || (D(), mn(o.value) && l.head.removeChild(o.value), r.value = !1, o.value = null);
  };
  return c && !d && $n(U), {
    id: g,
    name: m,
    el: o,
    css: n,
    unload: Q,
    load: U,
    isLoaded: mr(r)
  };
}
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ce(e);
}
var Xe, et, tt, rt;
function nt(e, t) {
  return In(e) || Vn(e, t) || Dn(e, t) || jn();
}
function jn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dn(e, t) {
  if (e) {
    if (typeof e == "string") return ot(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ot(e, t) : void 0;
  }
}
function ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Vn(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(s = (n = i.call(r)).done) && (l.push(n.value), l.length !== t); s = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!s && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function In(e) {
  if (Array.isArray(e)) return e;
}
function it(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Te(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? it(Object(r), !0).forEach(function(n) {
      Mn(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : it(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Mn(e, t, r) {
  return (t = zn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function zn(e) {
  var t = Fn(e, "string");
  return ce(t) == "symbol" ? t : t + "";
}
function Fn(e, t) {
  if (ce(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (ce(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function he(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Hn = function(t) {
  var r = t.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(r("scrollbar.width"), `;
}
`);
}, Wn = {}, Bn = {}, re = {
  name: "base",
  css: Hn,
  style: En,
  classes: Wn,
  inlineStyles: Bn,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = n(fe(Xe || (Xe = he(["", ""])), t));
    return y(o) ? Rn(ae(o), Te({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return S.transformCSS(r.name || t.name, "".concat(o).concat(fe(et || (et = he(["", ""])), n)));
    });
  },
  getCommonTheme: function(t) {
    return S.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return S.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return S.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, n) {
    return S.getCustomPreset(this.name, t, r, n);
  },
  getLayerOrderThemeCSS: function() {
    return S.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var n = O(this.css, {
        dt: G
      }) || "", o = ae(fe(tt || (tt = he(["", "", ""])), n, t)), i = Object.entries(r).reduce(function(a, l) {
        var s = nt(l, 2), c = s[0], p = s[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      return y(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return S.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = [S.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = fe(rt || (rt = he(["", ""])), O(this.style, {
        dt: G
      })), a = ae(S.transformCSS(o, i)), l = Object.entries(r).reduce(function(s, c) {
        var p = nt(c, 2), d = p[0], u = p[1];
        return s.push("".concat(d, '="').concat(u, '"')) && s;
      }, []).join(" ");
      y(a) && n.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return n.join("");
  },
  extend: function(t) {
    return Te(Te({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ge = Ot();
function pe(e) {
  "@babel/helpers - typeof";
  return pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pe(e);
}
function at(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? at(Object(r), !0).forEach(function(n) {
      Un(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : at(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Un(e, t, r) {
  return (t = Kn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Kn(e) {
  var t = Yn(e, "string");
  return pe(t) == "symbol" ? t : t + "";
}
function Yn(e, t) {
  if (pe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (pe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qn = {
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
    text: [w.STARTS_WITH, w.CONTAINS, w.NOT_CONTAINS, w.ENDS_WITH, w.EQUALS, w.NOT_EQUALS],
    numeric: [w.EQUALS, w.NOT_EQUALS, w.LESS_THAN, w.LESS_THAN_OR_EQUAL_TO, w.GREATER_THAN, w.GREATER_THAN_OR_EQUAL_TO],
    date: [w.DATE_IS, w.DATE_IS_NOT, w.DATE_BEFORE, w.DATE_AFTER]
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
}, Gn = Symbol();
function Jn(e, t) {
  var r = {
    config: hr(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(Gn, r), Qn(), Zn(e, r), r;
}
var ie = [];
function Qn() {
  A.clear(), ie.forEach(function(e) {
    return e?.();
  }), ie = [];
}
function Zn(e, t) {
  var r = L(!1), n = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !S.isStyleNameLoaded("common")) {
      var p, d, u = ((p = re.getCommonTheme) === null || p === void 0 ? void 0 : p.call(re)) || {}, m = u.primitive, f = u.semantic, g = u.global, h = u.style, v = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      re.load(m?.css, ve({
        name: "primitive-variables"
      }, v)), re.load(f?.css, ve({
        name: "semantic-variables"
      }, v)), re.load(g?.css, ve({
        name: "global-variables"
      }, v)), re.loadStyle(ve({
        name: "global-style"
      }, v), h), S.setLoadedStyleName("common");
    }
  };
  A.on("theme:change", function(s) {
    r.value || (e.config.globalProperties.$primevue.config.theme = s, r.value = !0);
  });
  var o = oe(t.config, function(s, c) {
    ge.emit("config:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = oe(function() {
    return t.config.ripple;
  }, function(s, c) {
    ge.emit("config:ripple:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = oe(function() {
    return t.config.theme;
  }, function(s, c) {
    r.value || S.setTheme(s), t.config.unstyled || n(), r.value = !1, ge.emit("config:theme:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = oe(function() {
    return t.config.unstyled;
  }, function(s, c) {
    !s && t.config.theme && n(), ge.emit("config:unstyled:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ie.push(o), ie.push(i), ie.push(a), ie.push(l);
}
var Xn = {
  install: function(t, r) {
    var n = ln(qn, r);
    Jn(t, n);
  }
}, Ft = {
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
    this.mounted = Nt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function eo(e, t, r, n, o, i) {
  return i.inline ? ye(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (gr(), vr(ft, {
    key: 1,
    to: r.appendTo
  }, [ye(e.$slots, "default")], 8, ["to"])) : ht("", !0);
}
Ft.render = eo;
const to = "data-wippy-overlay-layer";
function Ht() {
  return typeof window < "u" && typeof window.document < "u";
}
function Wt() {
  return Ht() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ro() {
  return Wt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const no = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let oo = 0;
const we = /* @__PURE__ */ new WeakMap();
function st(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function io(e, t) {
  if (!no.test(e.className))
    return;
  const r = e.style.cssText;
  st(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!we.has(e)) {
    const n = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && st(e, t);
    });
    n.observe(e, { attributes: !0, attributeFilter: ["style"] }), we.set(e, n);
  }
}
function De(e) {
  const t = we.get(e);
  t && (t.disconnect(), we.delete(e));
}
function ao(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ne(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Se = /* @__PURE__ */ new Set(), Ve = /* @__PURE__ */ new WeakMap();
let lt = !1, Re = !1;
function so() {
  Re = !1;
  for (const e of Se) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && De(t);
      Se.delete(e), Ve.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ne(e);
  }
}
function ct() {
  Re || (Re = !0, requestAnimationFrame(so));
}
function lo(e) {
  const t = document.createElement("div");
  t.setAttribute(to, "");
  const r = Wt();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ne(t);
  const n = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const a of o) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && io(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && De(l);
    }
    t.isConnected && t.childElementCount > 0 && Ne(t);
  });
  return n.observe(t, { childList: !0 }), Ve.set(t, n), Se.add(t), lt || (lt = !0, window.addEventListener("scroll", ct, { capture: !0, passive: !0 }), window.addEventListener("resize", ct, { passive: !0 })), t;
}
function pt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = lo(e.hostRoot), ro())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++oo}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function ut(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && De(t);
    Se.delete(e.layer), Ve.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let dt = !1;
function co() {
  if (dt)
    return;
  dt = !0;
  const e = Ft;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ht() && (this.hostRoot = ao(this.$el), this.mounted = !0, this.hostRoot && (this.inline || pt(this), this.$watch("inline", (t) => {
      t ? ut(this) : pt(this);
    })));
  }, e.render = function() {
    return this.inline ? ye(this.$slots, "default", { key: 0 }) : this.mounted ? yr(ft, { key: 1, to: this.resolvedTarget || document.body }, [
      ye(this.$slots, "default")
    ]) : ht("", !0);
  }, e.unmounted = function() {
    ut(this);
  };
}
const po = {
  install: (e) => {
    co(), e.use(Xn, { theme: "none" });
  }
}, uo = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{display:grid;gap:12px}.km .field{display:grid;gap:6px;font-weight:600}.km .row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:end}.km .switches{display:flex;flex-wrap:wrap;gap:8px 14px}.km .check{display:inline-flex;align-items:center;gap:7px;font-weight:600}.km input,.km textarea{width:100%;border:1px solid var(--p-content-border-color);border-radius:var(--p-form-field-border-radius);padding:8px 10px;background:var(--p-inputtext-background);color:inherit;font:inherit}.km .check input{width:16px;height:16px;margin:0;accent-color:var(--p-primary-color)}.km textarea{min-height:78px;resize:vertical}.km details{border-top:1px solid var(--p-content-border-color);padding-top:10px}.km summary{cursor:pointer;color:var(--p-text-muted-color);font-weight:600}.km .hint{color:var(--p-text-muted-color);font-size:12px;font-weight:400}@media(max-width:560px){.km .row{grid-template-columns:1fr}}.mm-stack{display:grid;gap:14px;align-content:start}.mm-field{display:grid;gap:6px}.mm-label{font-weight:600}.mm-hint{color:var(--p-text-muted-color);font-size:12px}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}.mm-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.mm-confirm{margin-top:8px}.mm-page{height:100%;min-height:0;overflow-y:auto;padding:12px 24px 32px}.mm-error{margin:14px 0}.mm-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0}.mm-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:start}.mm-split.solo{grid-template-columns:minmax(0,1fr)}.mm-split>.mm-panel+.mm-panel{position:sticky;top:0}@media(max-width:860px){.mm-split{grid-template-columns:1fr}.mm-split>.mm-panel+.mm-panel{position:static}}.mm-panel{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);overflow:hidden}.mm-panel-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--p-content-border-color);font-weight:700}.mm-panel-b{padding:14px;display:grid;gap:10px}.mm-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;padding:11px 14px;border:none;border-bottom:1px solid var(--p-content-border-color);background:transparent;color:inherit;font:inherit;text-align:left}.mm-row:last-child{border-bottom:none}button.mm-row{cursor:pointer}button.mm-row:hover{background:var(--kx-overlay-hover)}.mm-row.on{background:var(--kx-wash-primary)}.mm-row-t{font-weight:600;overflow-wrap:anywhere}.mm-row-s{color:var(--p-text-muted-color);font-size:12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:3px}.mm-row-err{color:var(--p-danger-600, var(--p-danger-500))}.mm-dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 12px;margin:0;font-size:12.5px}.mm-dl dt{color:var(--p-text-muted-color)}.mm-dl dd{margin:0;overflow-wrap:anywhere}.mm-h{font-size:12px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:4px 0 0}.mm-version{display:flex;gap:8px;align-items:baseline;font-size:12.5px}.mm-version.past{color:var(--p-text-muted-color)}.mm-conflict{display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--p-content-border-color)}.mm-conflict:last-child{border-bottom:none}.mm-option{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10)}';
function Uo(e, t) {
  return class extends Qr {
    static get wippyConfig() {
      return { propsSchema: t, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: uo };
    }
    static get vueConfig() {
      return { rootComponent: e, plugins: [po] };
    }
  };
}
export {
  Fo as $,
  Io as A,
  re as B,
  Vo as C,
  Co as D,
  _o as E,
  Bo as F,
  Po as G,
  Mo as H,
  Eo as I,
  wo as J,
  Do as K,
  jo as L,
  bo as M,
  A as N,
  ge as P,
  $o as Q,
  zo as R,
  To as S,
  Ro as T,
  Ao as U,
  dn as V,
  ko as W,
  Wo as Y,
  vo as a,
  Lo as b,
  yo as c,
  Ft as d,
  Ho as e,
  y as f,
  Lt as g,
  No as h,
  O as i,
  I as j,
  nn as k,
  xo as l,
  Uo as m,
  Ke as n,
  an as o,
  Pe as p,
  S as q,
  _t as r,
  Ot as s,
  ue as t,
  go as u,
  Oo as v,
  je as w,
  So as x,
  V as y,
  hn as z
};
//# sourceMappingURL=element-Cn2qOarc.js.map
