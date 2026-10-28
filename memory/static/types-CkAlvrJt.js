import { hasInjectionContext as et, inject as ke, effectScope as rt, ref as A, markRaw as tt, createApp as ot, onMounted as cr, onUnmounted as nt, watch as ne, readonly as at, getCurrentInstance as Me, nextTick as it, reactive as st, renderSlot as ve, openBlock as lt, createBlock as pt, Teleport as dr, createCommentVNode as ur, h as ct } from "vue";
import { addCollection as dt } from "@iconify/vue";
import { config as Ve, addIcons as ut, on as mt, applyThemeMode as ue, host as ht, hostCss as ft, loadCss as gt } from "@wippy-fe/proxy";
var Ee = "data-wippy-visible";
function Ie(e) {
  const r = e.getAttribute(Ee);
  return r === "true" ? !0 : r === "false" ? !1 : null;
}
var vt = Object.defineProperty, bt = (e, r, t) => r in e ? vt(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, g = (e, r, t) => bt(e, typeof r != "symbol" ? r + "" : r, t), xt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yt = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function De(e) {
  const r = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(r) ? r : null;
}
function wt(...e) {
  const r = /* @__PURE__ */ new Set();
  for (const t of e)
    if (t)
      for (const [o, n] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [a, l] of Object.entries(n)) {
            const i = typeof l == "string" ? De(a) : null;
            i && r.add(i);
          }
          continue;
        }
        const s = typeof n == "string" ? De(o) : null;
        s && r.add(s);
      }
  return [...r].sort();
}
function kt(e) {
  if (e.length === 0)
    return "";
  const r = e.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${yt} {
${r}
}`;
}
function St(e, r) {
  const t = kt(r);
  t && mr(e, t, "@wippy-fe/css-variables-bridge");
}
function _t(e, r) {
  const o = (r ?? xt).map(async (n) => {
    const s = ft[n];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await gt(s);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${s}):`, a), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const s of n) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Ct(e, r) {
  const t = document.createElement("style");
  t.textContent = r, e.appendChild(t);
}
function mr(e, r, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(r), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = r, e.appendChild(o);
}
function Ot(e, r) {
  mr(e, r, "@wippy-fe/custom-css");
}
function hr(e) {
  return e.__wippyHost ?? null;
}
function Et(e) {
  return e.replace(/-([a-z])/g, (r, t) => t.toUpperCase());
}
function Tt(e, r, t) {
  switch (t.type) {
    case "string":
      return { value: r };
    case "number": {
      const o = Number.parseFloat(r);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(r, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: r !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(r);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: r };
  }
}
function _e(e, r) {
  const t = {}, o = [];
  for (const [n, s] of Object.entries(r.properties)) {
    const a = e.getAttribute(n), l = Et(n);
    if (a === null) {
      s.default !== void 0 && (t[l] = s.default);
      continue;
    }
    const i = Tt(n, a, s);
    i.error ? o.push(i.error) : t[l] = i.value;
  }
  return { props: t, errors: o };
}
var Pt = class {
  constructor(e, r) {
    g(this, "_props"), g(this, "_errors"), g(this, "_content"), g(this, "_hostVisibility"), g(this, "_propsListeners", /* @__PURE__ */ new Set()), g(this, "_contentListeners", /* @__PURE__ */ new Set()), g(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), g(this, "_disposed", !1), g(this, "_emitToDom"), g(this, "props"), g(this, "events"), g(this, "content"), g(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = r;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(o, n) {
        return t._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        t._disposed || t._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, n) {
        return t._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, n) {
        return t._subscribeHostVisibility(o, n);
      }
    };
  }
  /** @internal */
  notifyProps(e, r) {
    if (!this._disposed) {
      this._props = e, this._errors = r;
      for (const t of this._propsListeners)
        t(e, r);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const r of this._contentListeners)
        r(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, r) {
    if (!(this._disposed || e === r)) {
      this._hostVisibility = e;
      for (const t of this._hostVisibilityListeners)
        t(e, r);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), r?.immediate && e(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), r?.immediate && e(this._content);
    const t = () => {
      this._contentListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), r?.immediate && e(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, At = class extends HTMLElement {
  constructor() {
    super(), g(this, "_internals"), g(this, "_contentObserver", null), g(this, "_initialized", !1), g(this, "_container", null), g(this, "_reactive", null), g(this, "_lastProps", null), g(this, "_lastErrors", []), g(this, "_lastContent", null), g(this, "_themeUnsub", null), g(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ie(this);
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
    const e = this.wippyConfig, r = Object.keys(e.propsSchema.properties), t = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...r, ...t, Ee])];
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
    return hr(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, r) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: r
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
      const e = this.constructor.wippyConfig, r = !!e.contentTemplate;
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const s = _e(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), t = s.props, o = s.errors, this._lastProps = t, this._lastErrors = o;
      }
      const n = r ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      r && this._lastContent === null && (this._lastContent = n), this._reactive = new Pt(
        { props: t, errors: o, content: n, hasContent: r, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, r = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let o;
      if (r)
        o = this._container;
      else {
        this.onInit(t), e.inlineCss && Ct(t, e.inlineCss);
        try {
          const p = Ve?.theming, c = wt(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          St(t, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const p = Ve?.theming, c = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            c && Ot(t, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && _t(t, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && o.classList.add(...i), t.appendChild(o), this._container = o, ut(dt);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = mt("@theme", (i) => this._applyTheme(i)));
      const { props: n, errors: s } = _e(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(n));
      const a = n;
      this._lastProps = a, this._lastErrors = s;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, a, s, l, r), this._internals.states.delete("loading"), this._internals.states.add("ready"), r || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ht.getThemeMode?.()) {
    ue(e, this), this._container && ue(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ue("auto", this), this._container && ue("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, r, t) {
    if (r === t)
      return;
    if (e === Ee) {
      const l = this._hostVisible, i = Ie(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: s } = _e(this, o.propsSchema);
    o.validateProps && s.push(...o.validateProps(n));
    const a = n;
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
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, r) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, r) {
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
function Nt(e) {
  return e.__wippyHostBus ?? null;
}
function jt(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let fr;
const gr = (e) => fr = e, Lt = () => et() && ke(vr) || fr, vr = (
  /* istanbul ignore next */
  Symbol()
);
function $t() {
  const e = rt(!0), r = e.run(() => A({}));
  let t = [], o = [];
  const n = tt({
    install(s) {
      gr(n), n._a = s, s.provide(vr, n), s.config.globalProperties.$pinia = n, o.forEach((a) => t.push(a)), o = [];
    },
    use(s) {
      return this._a ? t.push(s) : o.push(s), this;
    },
    _p: t,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: r
  });
  return n;
}
var Rt = Object.defineProperty, zt = (e, r, t) => r in e ? Rt(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, re = (e, r, t) => zt(e, typeof r != "symbol" ? r + "" : r, t), br = /* @__PURE__ */ Symbol("wippy:emit"), xr = /* @__PURE__ */ Symbol("wippy:props"), Mt = /* @__PURE__ */ Symbol("wippy:props_error"), Vt = /* @__PURE__ */ Symbol("wippy:content"), It = /* @__PURE__ */ Symbol("wippy:panel-id"), Dt = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ht = /* @__PURE__ */ Symbol("wippy:host"), yr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function rn() {
  const e = ke(xr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function tn() {
  const e = ke(br);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Ut() {
  const e = ke(yr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function on(e) {
  const r = Ut();
  let t = !1, o = null, n = !1;
  function s() {
    if (o)
      return n = !0, o;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (i) {
      a = Promise.reject(i);
    }
    const l = a.finally(() => {
      if (o === l && (o = null, t && n))
        return n = !1, s();
    });
    return o = l, l;
  }
  return cr(() => (t = !0, s())), nt(() => {
    t = !1, n = !1;
  }), ne(r, (a, l) => {
    if (t && l === !1 && a === !0)
      return s();
  }), r;
}
var Wt = class extends At {
  constructor() {
    super(...arguments), re(this, "_vueApp", null), re(this, "_propsRef", A({})), re(this, "_errorsRef", A([])), re(this, "_contentRef", A(null)), re(this, "_hostVisibilityRef", A(null)), re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, r, t, o, n, s) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const p of o)
      this.emitEvent("invalid", { message: p });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((p, c) => {
      this._propsRef.value = p, this._errorsRef.value = [...c];
      for (const d of c)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((p) => {
      this._contentRef.value = p;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((p) => {
      this._hostVisibilityRef.value = p;
    }, { signal: l.signal });
    const i = (p) => {
      if (l.signal.aborted)
        return;
      const c = Lt(), d = ot(p.rootComponent);
      this._vueApp = d;
      const u = $t();
      if (p.piniaPlugins)
        for (const m of p.piniaPlugins)
          u.use(m);
      if (d.use(u), p.plugins)
        for (const m of p.plugins)
          d.use(m);
      d.provide(xr, this._propsRef), d.provide(Mt, this._errorsRef), d.provide(br, this.emitEvent.bind(this)), d.provide(Vt, this._contentRef), d.provide(yr, this._hostVisibilityRef), d.provide(It, jt(this)), d.provide(Dt, Nt(this)), d.provide(Ht, hr(this)), p.providers && p.providers(d, this), d.mount(r), c && gr(c);
    };
    if (a.rootComponent)
      i(a);
    else if (a.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), r.appendChild(p), a.lazyConfig().then((c) => {
        l.signal.aborted || (p.remove(), i(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const d = c instanceof Error ? c.message : String(c), u = document.createElement("wippy-error");
        u.setAttribute("title", "Failed to load"), u.setAttribute("message", d), p.replaceWith(u), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Ft = Object.defineProperty, He = Object.getOwnPropertySymbols, Bt = Object.prototype.hasOwnProperty, Kt = Object.prototype.propertyIsEnumerable, Ue = (e, r, t) => r in e ? Ft(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, Yt = (e, r) => {
  for (var t in r || (r = {})) Bt.call(r, t) && Ue(e, t, r[t]);
  if (He) for (var t of He(r)) Kt.call(r, t) && Ue(e, t, r[t]);
  return e;
};
function je(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Te(e, r, t = /* @__PURE__ */ new WeakSet()) {
  if (e === r) return !0;
  if (!e || !r || typeof e != "object" || typeof r != "object" || t.has(e) || t.has(r)) return !1;
  t.add(e).add(r);
  let o = Array.isArray(e), n = Array.isArray(r), s, a, l;
  if (o && n) {
    if (a = e.length, a != r.length) return !1;
    for (s = a; s-- !== 0; ) if (!Te(e[s], r[s], t)) return !1;
    return !0;
  }
  if (o != n) return !1;
  let i = e instanceof Date, p = r instanceof Date;
  if (i != p) return !1;
  if (i && p) return e.getTime() == r.getTime();
  let c = e instanceof RegExp, d = r instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return e.toString() == r.toString();
  let u = Object.keys(e);
  if (a = u.length, a !== Object.keys(r).length) return !1;
  for (s = a; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(r, u[s])) return !1;
  for (s = a; s-- !== 0; ) if (l = u[s], !Te(e[l], r[l], t)) return !1;
  return !0;
}
function qt(e, r) {
  return Te(e, r);
}
function wr(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function b(e) {
  return !je(e);
}
function We(e, r) {
  if (!e || !r) return null;
  try {
    let t = e[r];
    if (b(t)) return t;
  } catch {
  }
  if (Object.keys(e).length) {
    if (wr(r)) return r(e);
    if (r.indexOf(".") === -1) return e[r];
    {
      let t = r.split("."), o = e;
      for (let n = 0, s = t.length; n < s; ++n) {
        if (o == null) return null;
        o = o[t[n]];
      }
      return o;
    }
  }
  return null;
}
function nn(e, r, t) {
  return t ? We(e, t) === We(r, t) : qt(e, r);
}
function M(e, r = !0) {
  return e instanceof Object && e.constructor === Object && (r || Object.keys(e).length !== 0);
}
function kr(e = {}, r = {}) {
  let t = Yt({}, e);
  return Object.keys(r).forEach((o) => {
    let n = o;
    M(r[n]) && n in e && M(e[n]) ? t[n] = kr(e[n], r[n]) : t[n] = r[n];
  }), t;
}
function Qt(...e) {
  return e.reduce((r, t, o) => o === 0 ? t : kr(r, t), {});
}
function O(e, ...r) {
  return wr(e) ? e(...r) : e;
}
function V(e, r = !0) {
  return typeof e == "string" && (r || e !== "");
}
function Fe(e) {
  return V(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Gt(e, r = "", t = {}) {
  let o = Fe(r).split("."), n = o.shift();
  if (n) {
    if (M(e)) {
      let s = Object.keys(e).find((a) => Fe(a) === n) || "";
      return Gt(O(e[s], t), o.join("."), t);
    }
    return;
  }
  return O(e, t);
}
function an(e, r = !0) {
  return Array.isArray(e) && (r || e.length !== 0);
}
function Jt(e) {
  return b(e) && !isNaN(e);
}
function q(e, r) {
  if (r) {
    let t = r.test(e);
    return r.lastIndex = 0, t;
  }
  return !1;
}
function Zt(...e) {
  return Qt(...e);
}
function ie(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function sn(e) {
  return V(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Sr(e) {
  return V(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function _r() {
  let e = /* @__PURE__ */ new Map();
  return { on(r, t) {
    let o = e.get(r);
    return o ? o.push(t) : o = [t], e.set(r, o), this;
  }, off(r, t) {
    let o = e.get(r);
    return o && o.splice(o.indexOf(t) >>> 0, 1), this;
  }, emit(r, t) {
    let o = e.get(r);
    o && o.forEach((n) => {
      n(t);
    });
  }, clear() {
    e.clear();
  } };
}
function Xt(e, r) {
  return e ? e.classList ? e.classList.contains(r) : new RegExp("(^| )" + r + "( |$)", "gi").test(e.className) : !1;
}
function ln(e, r) {
  if (e && r) {
    let t = (o) => {
      Xt(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [r].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(t));
  }
}
function pn(e, r) {
  if (e && r) {
    let t = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [r].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(t));
  }
}
function Be(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function cn(e, r) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function eo(e) {
  if (e) {
    let r = e.parentNode;
    return r && r instanceof ShadowRoot && r.host && (r = r.host), r;
  }
  return null;
}
function ro(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && eo(e));
}
function Se(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function dn() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function be(e, r = {}) {
  if (Se(e)) {
    let t = (o, n) => {
      var s, a;
      let l = (s = e?.$attrs) != null && s[o] ? [(a = e?.$attrs) == null ? void 0 : a[o]] : [];
      return [n].flat().reduce((i, p) => {
        if (p != null) {
          let c = typeof p;
          if (c === "string" || c === "number") i.push(p);
          else if (c === "object") {
            let d = Array.isArray(p) ? t(o, p) : Object.entries(p).map(([u, m]) => o === "style" && (m || m === 0) ? `${u.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? u : void 0);
            i = d.length ? i.concat(d.filter((u) => !!u)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(r).forEach(([o, n]) => {
      if (n != null) {
        let s = o.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? be(e, n) : (n = o === "class" ? [...new Set(t("class", n))].join(" ").trim() : o === "style" ? t("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function un(e, r = {}, ...t) {
  {
    let o = document.createElement(e);
    return be(o, r), o.append(...t), o;
  }
}
function mn(e, r) {
  return Se(e) ? e.matches(r) ? e : e.querySelector(r) : null;
}
function hn(e, r) {
  if (Se(e)) {
    let t = e.getAttribute(r);
    return isNaN(t) ? t === "true" || t === "false" ? t === "true" : t : +t;
  }
}
function fn(e) {
  if (e) {
    let r = e.offsetHeight, t = getComputedStyle(e);
    return r -= parseFloat(t.paddingTop) + parseFloat(t.paddingBottom) + parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), r;
  }
  return 0;
}
function gn(e) {
  if (e) {
    let r = e.getBoundingClientRect();
    return { top: r.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: r.left + (window.pageXOffset || Be(document.documentElement) || Be(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function vn(e, r) {
  return e ? e.offsetHeight : 0;
}
function bn() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function xn(e) {
  if (e) {
    let r = e.offsetWidth, t = getComputedStyle(e);
    return r -= parseFloat(t.paddingLeft) + parseFloat(t.paddingRight) + parseFloat(t.borderLeftWidth) + parseFloat(t.borderRightWidth), r;
  }
  return 0;
}
function Cr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function to(e, r = "", t) {
  Se(e) && t !== null && t !== void 0 && e.setAttribute(r, t);
}
var oo = Object.defineProperty, no = Object.defineProperties, ao = Object.getOwnPropertyDescriptors, xe = Object.getOwnPropertySymbols, Or = Object.prototype.hasOwnProperty, Er = Object.prototype.propertyIsEnumerable, Ke = (e, r, t) => r in e ? oo(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, _ = (e, r) => {
  for (var t in r || (r = {})) Or.call(r, t) && Ke(e, t, r[t]);
  if (xe) for (var t of xe(r)) Er.call(r, t) && Ke(e, t, r[t]);
  return e;
}, Ce = (e, r) => no(e, ao(r)), T = (e, r) => {
  var t = {};
  for (var o in e) Or.call(e, o) && r.indexOf(o) < 0 && (t[o] = e[o]);
  if (e != null && xe) for (var o of xe(e)) r.indexOf(o) < 0 && Er.call(e, o) && (t[o] = e[o]);
  return t;
}, io = _r(), P = io, se = /{([^}]*)}/g, Tr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Pr = /var\([^)]+\)/g;
function Ye(e) {
  return V(e) ? e.replace(/[A-Z]/g, (r, t) => t === 0 ? r : "." + r.toLowerCase()).toLowerCase() : e;
}
function so(e) {
  return M(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function lo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Pe(e = "", r = "") {
  return lo(`${V(e, !1) && V(r, !1) ? `${e}-` : e}${r}`);
}
function Ar(e = "", r = "") {
  return `--${Pe(e, r)}`;
}
function po(e = "") {
  let r = (e.match(/{/g) || []).length, t = (e.match(/}/g) || []).length;
  return (r + t) % 2 !== 0;
}
function Nr(e, r = "", t = "", o = [], n) {
  if (V(e)) {
    let s = e.trim();
    if (po(s)) return;
    if (q(s, se)) {
      let a = s.replaceAll(se, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((p) => !o.some((c) => q(p, c)));
        return `var(${Ar(t, Sr(i.join("-")))}${b(n) ? `, ${n}` : ""})`;
      });
      return q(a.replace(Pr, "0"), Tr) ? `calc(${a})` : a;
    }
    return s;
  } else if (Jt(e)) return e;
}
function co(e, r, t) {
  V(r, !1) && e.push(`${r}:${t};`);
}
function oe(e, r) {
  return e ? `${e}{${r}}` : "";
}
function jr(e, r) {
  if (e.indexOf("dt(") === -1) return e;
  function t(a, l) {
    let i = [], p = 0, c = "", d = null, u = 0;
    for (; p <= a.length; ) {
      let m = a[p];
      if ((m === '"' || m === "'" || m === "`") && a[p - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && u++, m === ")" && u--, (m === "," || p === a.length) && u === 0)) {
        let h = c.trim();
        h.startsWith("dt(") ? i.push(jr(h, l)) : i.push(o(h)), c = "", p++;
        continue;
      }
      m !== void 0 && (c += m), p++;
    }
    return i;
  }
  function o(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let i = Number(a);
    return isNaN(i) ? a : i;
  }
  let n = [], s = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") s.push(a), a += 2;
  else if (e[a] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && n.push([l, a]);
  }
  if (!n.length) return e;
  for (let a = n.length - 1; a >= 0; a--) {
    let [l, i] = n[a], p = e.slice(l + 3, i), c = t(p, r), d = r(...c);
    e = e.slice(0, l) + d + e.slice(i + 1);
  }
  return e;
}
var Q = (...e) => uo(k.getTheme(), ...e), uo = (e = {}, r, t, o) => {
  if (r) {
    let { variable: n, options: s } = k.defaults || {}, { prefix: a, transform: l } = e?.options || s || {}, i = q(r, se) ? r : `{${r}}`;
    return o === "value" || je(o) && l === "strict" ? k.getTokenValue(r) : Nr(i, void 0, a, [n.excludedKeyRegex], t);
  }
  return "";
};
function me(e, ...r) {
  if (e instanceof Array) {
    let t = e.reduce((o, n, s) => {
      var a;
      return o + n + ((a = O(r[s], { dt: Q })) != null ? a : "");
    }, "");
    return jr(t, Q);
  }
  return O(e, { dt: Q });
}
function mo(e, r = {}) {
  let t = k.defaults.variable, { prefix: o = t.prefix, selector: n = t.selector, excludedKeyRegex: s = t.excludedKeyRegex } = r, a = [], l = [], i = [{ node: e, path: o }];
  for (; i.length; ) {
    let { node: c, path: d } = i.pop();
    for (let u in c) {
      let m = c[u], h = so(m), f = q(u, s) ? Pe(d) : Pe(d, Sr(u));
      if (M(h)) i.push({ node: h, path: f });
      else {
        let v = Ar(f), x = Nr(h, f, o, [s]);
        co(l, v, x);
        let y = f;
        o && y.startsWith(o + "-") && (y = y.slice(o.length + 1)), a.push(y.replace(/-/g, "."));
      }
    }
  }
  let p = l.join("");
  return { value: l, tokens: a, declarations: p, css: oe(n, p) };
}
var S = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  let r = Object.keys(this.rules).filter((t) => t !== "custom").map((t) => this.rules[t]);
  return [e].flat().map((t) => {
    var o;
    return (o = r.map((n) => n.resolve(t)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(t);
  });
} }, _toVariables(e, r) {
  return mo(e, { prefix: r?.prefix });
}, getCommon({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var s, a, l, i, p, c, d;
  let { preset: u, options: m } = r, h, f, v, x, y, I, D;
  if (b(u) && m.transform !== "strict") {
    let { primitive: G, semantic: H, extend: j } = u, L = H || {}, { colorScheme: $ } = L, U = T(L, ["colorScheme"]), R = j || {}, { colorScheme: W } = R, F = T(R, ["colorScheme"]), z = $ || {}, { dark: B } = z, J = T(z, ["dark"]), K = W || {}, { dark: Z } = K, X = T(K, ["dark"]), E = b(G) ? this._toVariables({ primitive: G }, m) : {}, C = b(U) ? this._toVariables({ semantic: U }, m) : {}, Y = b(J) ? this._toVariables({ light: J }, m) : {}, de = b(B) ? this._toVariables({ dark: B }, m) : {}, ee = b(F) ? this._toVariables({ semantic: F }, m) : {}, Re = b(X) ? this._toVariables({ light: X }, m) : {}, ze = b(Z) ? this._toVariables({ dark: Z }, m) : {}, [zr, Mr] = [(s = E.declarations) != null ? s : "", E.tokens], [Vr, Ir] = [(a = C.declarations) != null ? a : "", C.tokens || []], [Dr, Hr] = [(l = Y.declarations) != null ? l : "", Y.tokens || []], [Ur, Wr] = [(i = de.declarations) != null ? i : "", de.tokens || []], [Fr, Br] = [(p = ee.declarations) != null ? p : "", ee.tokens || []], [Kr, Yr] = [(c = Re.declarations) != null ? c : "", Re.tokens || []], [qr, Qr] = [(d = ze.declarations) != null ? d : "", ze.tokens || []];
    h = this.transformCSS(e, zr, "light", "variable", m, o, n), f = Mr;
    let Gr = this.transformCSS(e, `${Vr}${Dr}`, "light", "variable", m, o, n), Jr = this.transformCSS(e, `${Ur}`, "dark", "variable", m, o, n);
    v = `${Gr}${Jr}`, x = [.../* @__PURE__ */ new Set([...Ir, ...Hr, ...Wr])];
    let Zr = this.transformCSS(e, `${Fr}${Kr}color-scheme:light`, "light", "variable", m, o, n), Xr = this.transformCSS(e, `${qr}color-scheme:dark`, "dark", "variable", m, o, n);
    y = `${Zr}${Xr}`, I = [.../* @__PURE__ */ new Set([...Br, ...Yr, ...Qr])], D = O(u.css, { dt: Q });
  }
  return { primitive: { css: h, tokens: f }, semantic: { css: v, tokens: x }, global: { css: y, tokens: I }, style: D };
}, getPreset({ name: e = "", preset: r = {}, options: t, params: o, set: n, defaults: s, selector: a }) {
  var l, i, p;
  let c, d, u;
  if (b(r) && t.transform !== "strict") {
    let m = e.replace("-directive", ""), h = r, { colorScheme: f, extend: v, css: x } = h, y = T(h, ["colorScheme", "extend", "css"]), I = v || {}, { colorScheme: D } = I, G = T(I, ["colorScheme"]), H = f || {}, { dark: j } = H, L = T(H, ["dark"]), $ = D || {}, { dark: U } = $, R = T($, ["dark"]), W = b(y) ? this._toVariables({ [m]: _(_({}, y), G) }, t) : {}, F = b(L) ? this._toVariables({ [m]: _(_({}, L), R) }, t) : {}, z = b(j) ? this._toVariables({ [m]: _(_({}, j), U) }, t) : {}, [B, J] = [(l = W.declarations) != null ? l : "", W.tokens || []], [K, Z] = [(i = F.declarations) != null ? i : "", F.tokens || []], [X, E] = [(p = z.declarations) != null ? p : "", z.tokens || []], C = this.transformCSS(m, `${B}${K}`, "light", "variable", t, n, s, a), Y = this.transformCSS(m, X, "dark", "variable", t, n, s, a);
    c = `${C}${Y}`, d = [.../* @__PURE__ */ new Set([...J, ...Z, ...E])], u = O(x, { dt: Q });
  }
  return { css: c, tokens: d, style: u };
}, getPresetC({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var s;
  let { preset: a, options: l } = r, i = (s = a?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: i, options: l, params: t, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var s, a;
  let l = e.replace("-directive", ""), { preset: i, options: p } = r, c = ((s = i?.components) == null ? void 0 : s[l]) || ((a = i?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: p, params: t, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, r) {
  var t;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? r.options.darkModeSelector : (t = e.darkModeSelector) != null ? t : r.options.darkModeSelector) : [];
}, getLayerOrder(e, r = {}, t, o) {
  let { cssLayer: n } = r;
  return n ? `@layer ${O(n.order || n.name || "primeui", t)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: r = {}, params: t, props: o = {}, set: n, defaults: s }) {
  let a = this.getCommon({ name: e, theme: r, params: t, set: n, defaults: s }), l = Object.entries(o).reduce((i, [p, c]) => i.push(`${p}="${c}"`) && i, []).join(" ");
  return Object.entries(a || {}).reduce((i, [p, c]) => {
    if (M(c) && Object.hasOwn(c, "css")) {
      let d = ie(c.css), u = `${p}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${u}" ${l}>${d}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: r = {}, params: t, props: o = {}, set: n, defaults: s }) {
  var a;
  let l = { name: e, theme: r, params: t, set: n, defaults: s }, i = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, p = Object.entries(o).reduce((c, [d, u]) => c.push(`${d}="${u}"`) && c, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${p}>${ie(i)}</style>` : "";
}, createTokens(e = {}, r, t = "", o = "", n = {}) {
  let s = function(l, i = {}, p = []) {
    if (p.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    p.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && se.test(this.value)) {
      let d = this.value.trim().replace(se, (u) => {
        var m;
        let h = u.slice(1, -1), f = this.tokens[h];
        if (!f) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let v = f.computed(l, i, p);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (m = v?.value) != null ? m : "__UNRESOLVED__";
      });
      c = Tr.test(d.replace(Pr, "0")) ? `calc(${d})` : d;
    }
    return je(i.binding) && delete i.binding, p.pop(), { colorScheme: l, path: this.path, paths: i, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, i, p) => {
    Object.entries(l).forEach(([c, d]) => {
      let u = q(c, r.variable.excludedKeyRegex) ? i : i ? `${i}.${Ye(c)}` : Ye(c), m = p ? `${p}.${c}` : c;
      M(d) ? a(d, u, m) : (n[u] || (n[u] = { paths: [], computed: (h, f = {}, v = []) => {
        if (n[u].paths.length === 1) return n[u].paths[0].computed(n[u].paths[0].scheme, f.binding, v);
        if (h && h !== "none") for (let x = 0; x < n[u].paths.length; x++) {
          let y = n[u].paths[x];
          if (y.scheme === h) return y.computed(h, f.binding, v);
        }
        return n[u].paths.map((x) => x.computed(x.scheme, f[x.scheme], v));
      } }), n[u].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: n }));
    });
  };
  return a(e, t, o), n;
}, getTokenValue(e, r, t) {
  var o;
  let n = ((l) => l.split(".").filter((i) => !q(i.toLowerCase(), t.variable.excludedKeyRegex)).join("."))(r), s = r.includes("colorScheme.light") ? "light" : r.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = e[n]) == null ? void 0 : o.computed(s)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, i) => {
    let p = i, { colorScheme: c } = p, d = T(p, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(e, r, t, o) {
  return t === "class" || t === "attr" ? oe(b(r) ? `${e}${r},${e} ${r}` : e, o) : oe(e, oe(r ?? ":root,:host", o));
}, transformCSS(e, r, t, o, n = {}, s, a, l) {
  if (b(r)) {
    let { cssLayer: i } = n;
    if (o !== "style") {
      let p = this.getColorSchemeOption(n, a);
      r = t === "dark" ? p.reduce((c, { type: d, selector: u }) => (b(u) && (c += u.includes("[CSS]") ? u.replace("[CSS]", r) : this.getSelectorRule(u, l, d, r)), c), "") : oe(l ?? ":root,:host", r);
    }
    if (i) {
      let p = { name: "primeui" };
      M(i) && (p.name = O(i.name, { name: e, type: o })), b(p.name) && (r = oe(`@layer ${p.name}`, r), s?.layerNames(p.name));
    }
    return r;
  }
  return "";
} }, k = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: r } = e;
  r && (this._theme = Ce(_({}, r), { options: _(_({}, this.defaults.options), r.options) }), this._tokens = S.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), P.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ce(_({}, this.theme), { preset: e }), this._tokens = S.createTokens(e, this.defaults), this.clearLoadedStyleNames(), P.emit("preset:change", e), P.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ce(_({}, this.theme), { options: e }), this.clearLoadedStyleNames(), P.emit("options:change", e), P.emit("theme:change", this.theme);
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
  return S.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", r) {
  return S.getCommon({ name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", r) {
  let t = { name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return S.getPresetC(t);
}, getDirective(e = "", r) {
  let t = { name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return S.getPresetD(t);
}, getCustomPreset(e = "", r, t, o) {
  let n = { name: e, preset: r, options: this.options, selector: t, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return S.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return S.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", r, t = "style", o) {
  return S.transformCSS(e, r, o, t, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", r, t = {}) {
  return S.getCommonStyleSheet({ name: e, theme: this.theme, params: r, props: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, r, t = {}) {
  return S.getStyleSheet({ name: e, theme: this.theme, params: r, props: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: r }) {
  this._loadingStyles.size && (this._loadingStyles.delete(r), P.emit(`theme:${r}:load`, e), !this._loadingStyles.size && P.emit("theme:load"));
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
}, ho = `
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
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, le(e);
}
function qe(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function Qe(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? qe(Object(t), !0).forEach(function(o) {
      fo(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : qe(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function fo(e, r, t) {
  return (r = go(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function go(e) {
  var r = vo(e, "string");
  return le(r) == "symbol" ? r : r + "";
}
function vo(e, r) {
  if (le(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (le(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
function bo(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Me() && Me().components ? cr(e) : r ? e() : it(e);
}
var xo = 0;
function yo(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = A(!1), o = A(e), n = A(null), s = Cr() ? window.document : void 0, a = r.document, l = a === void 0 ? s : a, i = r.immediate, p = i === void 0 ? !0 : i, c = r.manual, d = c === void 0 ? !1 : c, u = r.name, m = u === void 0 ? "style_".concat(++xo) : u, h = r.id, f = h === void 0 ? void 0 : h, v = r.media, x = v === void 0 ? void 0 : v, y = r.nonce, I = y === void 0 ? void 0 : y, D = r.first, G = D === void 0 ? !1 : D, H = r.onMounted, j = H === void 0 ? void 0 : H, L = r.onUpdated, $ = L === void 0 ? void 0 : L, U = r.onLoad, R = U === void 0 ? void 0 : U, W = r.props, F = W === void 0 ? {} : W, z = function() {
  }, B = function(Z) {
    var X = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var E = Qe(Qe({}, F), X), C = E.name || m, Y = E.id || f, de = E.nonce || I;
      n.value = l.querySelector('style[data-primevue-style-id="'.concat(C, '"]')) || l.getElementById(Y) || l.createElement("style"), n.value.isConnected || (o.value = Z || e, be(n.value, {
        type: "text/css",
        id: Y,
        media: x,
        nonce: de
      }), G ? l.head.prepend(n.value) : l.head.appendChild(n.value), to(n.value, "data-primevue-style-id", C), be(n.value, E), n.value.onload = function(ee) {
        return R?.(ee, {
          name: C
        });
      }, j?.(C)), !t.value && (z = ne(o, function(ee) {
        n.value.textContent = ee, $?.(C);
      }, {
        immediate: !0
      }), t.value = !0);
    }
  }, J = function() {
    !l || !t.value || (z(), ro(n.value) && l.head.removeChild(n.value), t.value = !1, n.value = null);
  };
  return p && !d && bo(B), {
    id: f,
    name: m,
    el: n,
    css: o,
    unload: J,
    load: B,
    isLoaded: at(t)
  };
}
function pe(e) {
  "@babel/helpers - typeof";
  return pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, pe(e);
}
var Ge, Je, Ze, Xe;
function er(e, r) {
  return _o(e) || So(e, r) || ko(e, r) || wo();
}
function wo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ko(e, r) {
  if (e) {
    if (typeof e == "string") return rr(e, r);
    var t = {}.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? rr(e, r) : void 0;
  }
}
function rr(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, o = Array(r); t < r; t++) o[t] = e[t];
  return o;
}
function So(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var o, n, s, a, l = [], i = !0, p = !1;
    try {
      if (s = (t = t.call(e)).next, r !== 0) for (; !(i = (o = s.call(t)).done) && (l.push(o.value), l.length !== r); i = !0) ;
    } catch (c) {
      p = !0, n = c;
    } finally {
      try {
        if (!i && t.return != null && (a = t.return(), Object(a) !== a)) return;
      } finally {
        if (p) throw n;
      }
    }
    return l;
  }
}
function _o(e) {
  if (Array.isArray(e)) return e;
}
function tr(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function Oe(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? tr(Object(t), !0).forEach(function(o) {
      Co(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : tr(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function Co(e, r, t) {
  return (r = Oo(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function Oo(e) {
  var r = Eo(e, "string");
  return pe(r) == "symbol" ? r : r + "";
}
function Eo(e, r) {
  if (pe(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (pe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
function he(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
var To = function(r) {
  var t = r.dt;
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
    padding-right: `.concat(t("scrollbar.width"), `;
}
`);
}, Po = {}, Ao = {}, te = {
  name: "base",
  css: To,
  style: ho,
  classes: Po,
  inlineStyles: Ao,
  load: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, n = o(me(Ge || (Ge = he(["", ""])), r));
    return b(n) ? yo(ie(n), Oe({
      name: this.name
    }, t)) : {};
  },
  loadCSS: function() {
    var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, r);
  },
  loadStyle: function() {
    var r = this, t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, t, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return k.transformCSS(t.name || r.name, "".concat(n).concat(me(Je || (Je = he(["", ""])), o)));
    });
  },
  getCommonTheme: function(r) {
    return k.getCommon(this.name, r);
  },
  getComponentTheme: function(r) {
    return k.getComponent(this.name, r);
  },
  getDirectiveTheme: function(r) {
    return k.getDirective(this.name, r);
  },
  getPresetTheme: function(r, t, o) {
    return k.getCustomPreset(this.name, r, t, o);
  },
  getLayerOrderThemeCSS: function() {
    return k.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = O(this.css, {
        dt: Q
      }) || "", n = ie(me(Ze || (Ze = he(["", "", ""])), o, r)), s = Object.entries(t).reduce(function(a, l) {
        var i = er(l, 2), p = i[0], c = i[1];
        return a.push("".concat(p, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return b(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return k.getCommonStyleSheet(this.name, r, t);
  },
  getThemeStyleSheet: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [k.getStyleSheet(this.name, r, t)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = me(Xe || (Xe = he(["", ""])), O(this.style, {
        dt: Q
      })), a = ie(k.transformCSS(n, s)), l = Object.entries(t).reduce(function(i, p) {
        var c = er(p, 2), d = c[0], u = c[1];
        return i.push("".concat(d, '="').concat(u, '"')) && i;
      }, []).join(" ");
      b(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(r) {
    return Oe(Oe({}, this), {}, {
      css: void 0,
      style: void 0
    }, r);
  }
}, fe = _r();
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, ce(e);
}
function or(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function ge(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? or(Object(t), !0).forEach(function(o) {
      No(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : or(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function No(e, r, t) {
  return (r = jo(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function jo(e) {
  var r = Lo(e, "string");
  return ce(r) == "symbol" ? r : r + "";
}
function Lo(e, r) {
  if (ce(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (ce(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
var $o = {
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
}, Ro = Symbol();
function zo(e, r) {
  var t = {
    config: st(r)
  };
  return e.config.globalProperties.$primevue = t, e.provide(Ro, t), Mo(), Vo(e, t), t;
}
var ae = [];
function Mo() {
  P.clear(), ae.forEach(function(e) {
    return e?.();
  }), ae = [];
}
function Vo(e, r) {
  var t = A(!1), o = function() {
    var p;
    if (((p = r.config) === null || p === void 0 ? void 0 : p.theme) !== "none" && !k.isStyleNameLoaded("common")) {
      var c, d, u = ((c = te.getCommonTheme) === null || c === void 0 ? void 0 : c.call(te)) || {}, m = u.primitive, h = u.semantic, f = u.global, v = u.style, x = {
        nonce: (d = r.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      te.load(m?.css, ge({
        name: "primitive-variables"
      }, x)), te.load(h?.css, ge({
        name: "semantic-variables"
      }, x)), te.load(f?.css, ge({
        name: "global-variables"
      }, x)), te.loadStyle(ge({
        name: "global-style"
      }, x), v), k.setLoadedStyleName("common");
    }
  };
  P.on("theme:change", function(i) {
    t.value || (e.config.globalProperties.$primevue.config.theme = i, t.value = !0);
  });
  var n = ne(r.config, function(i, p) {
    fe.emit("config:change", {
      newValue: i,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ne(function() {
    return r.config.ripple;
  }, function(i, p) {
    fe.emit("config:ripple:change", {
      newValue: i,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ne(function() {
    return r.config.theme;
  }, function(i, p) {
    t.value || k.setTheme(i), r.config.unstyled || o(), t.value = !1, fe.emit("config:theme:change", {
      newValue: i,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ne(function() {
    return r.config.unstyled;
  }, function(i, p) {
    !i && r.config.theme && o(), fe.emit("config:unstyled:change", {
      newValue: i,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ae.push(n), ae.push(s), ae.push(a), ae.push(l);
}
var Io = {
  install: function(r, t) {
    var o = Zt($o, t);
    zo(r, o);
  }
}, Lr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Cr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Do(e, r, t, o, n, s) {
  return s.inline ? ve(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (lt(), pt(dr, {
    key: 1,
    to: t.appendTo
  }, [ve(e.$slots, "default")], 8, ["to"])) : ur("", !0);
}
Lr.render = Do;
const Ho = "data-wippy-overlay-layer";
function $r() {
  return typeof window < "u" && typeof window.document < "u";
}
function Rr() {
  return $r() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Uo() {
  return Rr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Wo = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Fo = 0;
const ye = /* @__PURE__ */ new WeakMap();
function nr(e, r) {
  const t = e.style;
  t.setProperty("position", "fixed", "important"), t.setProperty("inset", "auto", "important"), t.setProperty("margin", "0", "important"), t.setProperty("position-anchor", r), t.setProperty("position-area", "bottom span-right"), t.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), t.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), t.setProperty("max-width", "stretch", "important");
}
function Bo(e, r) {
  if (!Wo.test(e.className))
    return;
  const t = e.style.cssText;
  nr(e, r), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = t;
    return;
  }
  if (!ye.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && nr(e, r);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), ye.set(e, o);
  }
}
function Le(e) {
  const r = ye.get(e);
  r && (r.disconnect(), ye.delete(e));
}
function Ko(e) {
  const r = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return r instanceof ShadowRoot ? r : null;
}
function Ae(e) {
  e.style.top = "0px", e.style.left = "0px";
  const r = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - r.top}px`, e.style.left = `${-window.scrollX - r.left}px`;
}
const we = /* @__PURE__ */ new Set(), $e = /* @__PURE__ */ new WeakMap();
let ar = !1, Ne = !1;
function Yo() {
  Ne = !1;
  for (const e of we) {
    if (!e.isConnected) {
      for (const r of Array.from(e.children))
        r instanceof HTMLElement && Le(r);
      we.delete(e), $e.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ae(e);
  }
}
function ir() {
  Ne || (Ne = !0, requestAnimationFrame(Yo));
}
function qo(e) {
  const r = document.createElement("div");
  r.setAttribute(Ho, "");
  const t = Rr();
  if (r.style.cssText = t ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", t && r.setAttribute("popover", "manual"), e.appendChild(r), t) {
    try {
      r.showPopover();
    } catch {
    }
    r.matches(":popover-open") || (r.removeAttribute("popover"), r.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ae(r);
  const o = new MutationObserver((n) => {
    const s = r.__wippyAnchorName;
    for (const a of n) {
      if (s)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Bo(l, s);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && Le(l);
    }
    r.isConnected && r.childElementCount > 0 && Ae(r);
  });
  return o.observe(r, { childList: !0 }), $e.set(r, o), we.add(r), ar || (ar = !0, window.addEventListener("scroll", ir, { capture: !0, passive: !0 }), window.addEventListener("resize", ir, { passive: !0 })), r;
}
function sr(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = qo(e.hostRoot), Uo())) {
    const r = e.$el ? e.$el.parentElement : null;
    r && (e.anchorName = `--wippy-a-${++Fo}`, e.anchorTrigger = r, r.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function lr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const r of Array.from(e.layer.children))
      r instanceof HTMLElement && Le(r);
    we.delete(e.layer), $e.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let pr = !1;
function Qo() {
  if (pr)
    return;
  pr = !0;
  const e = Lr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    $r() && (this.hostRoot = Ko(this.$el), this.mounted = !0, this.hostRoot && (this.inline || sr(this), this.$watch("inline", (r) => {
      r ? lr(this) : sr(this);
    })));
  }, e.render = function() {
    return this.inline ? ve(this.$slots, "default", { key: 0 }) : this.mounted ? ct(dr, { key: 1, to: this.resolvedTarget || document.body }, [
      ve(this.$slots, "default")
    ]) : ur("", !0);
  }, e.unmounted = function() {
    lr(this);
  };
}
const Go = {
  install: (e) => {
    Qo(), e.use(Io, { theme: "none" });
  }
}, Jo = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}:host,:root{--kx-tone-blue: #2563eb;--kx-tone-violet: #7c3aed;--kx-tone-amber: #b45309}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}}:host(.w-theme-dark),:root.w-theme-dark{--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}.kx-tone-blue{color:var(--kx-tone-blue);background-color:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-tone-violet{color:var(--kx-tone-violet);background-color:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-tone-amber{color:var(--kx-tone-amber);background-color:color-mix(in srgb,var(--kx-tone-amber) 13%,transparent)}.kx-tone-neutral{color:var(--p-text-muted-color);background-color:color-mix(in srgb,var(--p-text-color) 10%,transparent)}.kx-shell{flex:1;min-height:0;display:grid;grid-template-columns:var(--kx-rail-width) minmax(0,1fr);background:var(--p-content-background)}.kx-rail{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-rail-body{flex:1;min-height:0;overflow-y:auto;padding:4px 8px 12px}.kx-main{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.kx-main-scroll{flex:1;min-height:0;overflow-y:auto;padding:18px 28px 80px 24px;display:flex;flex-direction:column;gap:16px}@media(max-width:760px){.kx-shell{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto minmax(0,1fr)}.kx-rail{max-height:40vh;border-right:none;border-bottom:1px solid var(--p-content-border-color)}.kx-main-scroll{padding:20px 22px 64px}}.kx-railhead{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 10px;border-bottom:1px solid var(--p-content-border-color)}.kx-railhead-title{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railhead-title b{color:var(--p-text-muted-color);margin-left:4px;font-variant-numeric:tabular-nums}.kx-railhead-acts{display:flex;align-items:center;gap:2px}.kx-railsec+.kx-railsec{border-top:1px solid var(--p-content-border-color)}.kx-railsec-h{display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px 7px;background:none;border:none;cursor:pointer;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railsec-h:hover{color:var(--p-text-muted-color)}.kx-railsec-chev{width:13px;height:13px;flex:none;transition:transform .15s ease}.kx-railsec:not(.closed) .kx-railsec-chev{transform:rotate(90deg)}.kx-railsec-ic{width:14px;height:14px;flex:none}.kx-railsec-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-railsec-h .count{margin-left:auto;color:var(--p-text-muted-color);font-variant-numeric:tabular-nums}.kx-railsec-b{padding:2px 0 8px}.kx-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);transition:color .14s,background .14s,border-color .14s}.kx-iconbtn:hover:not(:disabled){color:var(--p-text-color);background:var(--kx-surface-2)}.kx-iconbtn.on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-iconbtn:disabled{opacity:.55;cursor:default}.kx-iconbtn svg{width:16px;height:16px}.kx-iconbtn.lg{width:var(--kx-control-height);height:var(--kx-control-height)}.kx-iconbtn.sm{width:var(--kx-control-height-sm);height:var(--kx-control-height-sm)}.kx-iconbtn.bordered{border-color:var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.kx-iconbtn.bordered:hover:not(:disabled){border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-iconbtn.danger:hover:not(:disabled),.kx-iconbtn.danger.on{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kx-control-height);padding:0 14px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kx-btn svg{width:15px;height:15px}.kx-btn:disabled{opacity:.5;cursor:not-allowed}.kx-btn.sm{height:var(--kx-control-height-sm);padding:0 12px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color);border-color:var(--p-primary-color)}.kx-btn-primary:hover:not(:disabled){background:var(--p-primary-hover-color);color:var(--p-button-primary-hover-color);border-color:var(--p-primary-hover-color);transform:translateY(-1px)}.kx-btn-primary:active:not(:disabled){background:var(--p-primary-active-color);color:var(--p-button-primary-active-color);border-color:var(--p-primary-active-color);transform:translateY(0)}.kx-btn-ghost{background:transparent;color:var(--p-text-color);border-color:var(--p-content-border-color)}.kx-btn-ghost:hover:not(:disabled){background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-btn-soft{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.kx-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-btn-danger{background:var(--p-danger-500);color:var(--p-danger-contrast-color);border-color:var(--p-danger-500)}.kx-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{width:100%;height:var(--kx-control-height);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-search-input:focus{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:var(--kx-radius-8);display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color)}.kx-search-clear:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.kx-search-clear svg{width:14px;height:14px}.kx-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.kx-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-notice{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:var(--kx-radius-14);font-size:13px;line-height:1.5;background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.kx-notice.info svg{color:var(--p-primary-color)}.kx-notice.warn{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent)}.kx-notice.error{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-danger-500) 30%,transparent)}.kx-notice.help{background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kx-notice.warn svg{color:var(--p-warn-500)}.kx-notice.error svg{color:var(--p-danger-500)}.kx-notice.help svg{color:var(--p-help-500)}.kx-notice-action{margin-left:8px;padding:2px 10px;border-radius:var(--kx-radius-8);font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor}.kx-notice-action:hover:not(:disabled){background:color-mix(in srgb,currentColor 10%,transparent)}.kx-notice-action:disabled{opacity:.6;cursor:default}.kx-drawer-mask{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;overflow:clip;background:color-mix(in srgb,var(--p-text-color) 32%,transparent);backdrop-filter:blur(2px)}.kx-drawer{width:min(560px,100%);min-width:0;box-sizing:border-box;height:100%;display:flex;flex-direction:column;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:-16px 0 50px -12px color-mix(in srgb,var(--p-text-color) 40%,transparent)}.kx-drawer-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-title{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:var(--p-text-color)}.kx-drawer-title svg{width:18px;height:18px;color:var(--p-primary-color)}.kx-drawer-b{flex:1;min-height:0;overflow-y:auto;padding:20px 20px 36px}.kx-drawer-enter-active,.kx-drawer-leave-active{transition:opacity .22s ease}.kx-drawer-enter-active .kx-drawer,.kx-drawer-leave-active .kx-drawer{transition:transform .26s cubic-bezier(.4,0,.2,1)}.kx-drawer-enter-from,.kx-drawer-leave-to{opacity:0}.kx-drawer-enter-from .kx-drawer,.kx-drawer-leave-to .kx-drawer{transform:translate(100%)}.kx-modal-mask{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kx-modal{width:min(460px,100%);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);overflow:hidden;box-shadow:0 20px 60px color-mix(in srgb,var(--p-text-color) 28%,transparent)}.kx-modal-h{display:flex;align-items:center;gap:11px;padding:14px 16px 4px}.kx-modal-h-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:var(--kx-radius-14);background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-modal.danger .kx-modal-h-ico{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.kx-modal-h-ico svg{width:17px;height:17px}.kx-modal-h-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.kx-modal-h-title{font-size:14px;font-weight:700;color:var(--p-text-color)}.kx-modal-h-sub{font-size:12px;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-modal-body{padding:8px 16px 14px;font-size:13px;line-height:1.55;color:var(--p-text-muted-color)}.kx-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color);background:var(--kx-surface-1)}.kx-modal-enter-active,.kx-modal-leave-active{transition:opacity .18s ease}.kx-modal-enter-from,.kx-modal-leave-to{opacity:0}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.mm-trait,.mm-form{display:grid;gap:16px;align-content:start}.mm-field{display:grid;gap:6px;min-width:0}.mm-label{font-weight:600}.mm-hint{display:inline-flex;align-items:flex-start;gap:6px;color:var(--p-text-muted-color);font-size:12px;line-height:1.45}.mm-hint svg{width:14px;height:14px;flex:none;margin-top:1px}.mm-hint-err{color:var(--p-danger-600, var(--p-danger-500))}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px}.mm-form-foot{display:flex;justify-content:flex-end;padding-top:4px}.mm-suggest{display:flex;flex-wrap:wrap;gap:6px}.mm-suggest-chip{padding:3px 10px;border-radius:999px;font:inherit;font-size:12px;cursor:pointer;color:var(--p-text-muted-color);background:var(--kx-overlay-subtle);border:1px solid var(--p-content-border-color)}.mm-suggest-chip:hover{color:var(--p-primary-color);border-color:var(--p-primary-color)}.mm-muted{color:var(--p-text-muted-color);font-size:12px}.mm-choices{display:grid;max-height:280px;overflow-y:auto;padding:4px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14)}.mm-choice{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-8);background:transparent;color:inherit;font:inherit;cursor:pointer}.mm-choice:hover{background:var(--kx-overlay-hover)}.mm-choice.on{background:var(--kx-wash-primary)}.mm-choice-ic{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:var(--kx-wash-primary)}.mm-choice-ic svg{width:16px;height:16px}.mm-choice-main{display:grid;min-width:0}.mm-choice-t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-choice.on .mm-choice-t{color:var(--p-primary-color)}.mm-choice-s{font-size:11.5px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-choice-empty{display:flex;align-items:center;gap:8px;padding:14px 10px;font-size:12.5px;color:var(--p-text-muted-color)}.mm-choice-empty svg{width:15px;height:15px}.mm-page{height:100%;min-height:0;overflow-y:auto;display:flex;flex-direction:column}.mm-page-note{margin:12px 16px 0}.mm-rail-tools{display:grid;gap:8px;padding:10px}.mm-views{display:flex}.mm-views .p-togglebutton{flex:1}.mm-rail-note{margin:6px 4px}.mm-rail-empty{padding:24px 12px;text-align:center;font-size:12.5px;line-height:1.5;color:var(--kx-text-faint)}.mm-more{margin:8px 4px 0;width:calc(100% - 8px);justify-content:center}.mm-conflict-bar{display:flex;align-items:center;gap:8px;margin:10px 10px 0;padding:8px 10px;border-radius:var(--kx-radius-10);border:1px solid var(--p-warn-500);background:var(--kx-wash-warn);color:var(--p-warn-500);font:inherit;font-size:12.5px;font-weight:600;text-align:left;cursor:pointer}.mm-conflict-bar svg{width:15px;height:15px;flex:none}.mm-conflict-bar span{flex:1}.mm-conflict-bar.on,.mm-conflict-bar:hover{background:var(--kx-wash-warn)}.mm-row{display:flex;align-items:center;gap:9px;width:100%;padding:7px 8px;text-align:left;border:none;border-radius:var(--kx-radius-8);background:transparent;color:inherit;font:inherit;cursor:pointer;transition:background .12s}.mm-row:hover{background:var(--kx-overlay-hover)}.mm-row.on{background:var(--kx-wash-primary);box-shadow:inset 2px 0 0 var(--p-primary-color)}.mm-row.on .mm-row-t{color:var(--p-primary-color)}.mm-row-ic,.mm-head-ic{display:grid;place-items:center;flex:none;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:var(--kx-wash-primary)}.mm-row-ic{width:28px;height:28px}.mm-row-ic svg{width:15px;height:15px}.mm-row-main{display:grid;gap:1px;min-width:0;flex:1}.mm-row-t{font-size:12.8px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-row-s{font-size:10.5px;color:var(--kx-text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-skel{display:grid;gap:6px;padding:6px}.mm-skel-row{height:42px;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);animation:mm-pulse 1.3s ease-in-out infinite}.mm-skel-reader{display:grid;gap:12px;max-width:var(--kx-reading-measure)}.mm-skel-line{height:14px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);animation:mm-pulse 1.3s ease-in-out infinite}.mm-skel-line:first-child{height:26px;width:70%}@keyframes mm-pulse{0%,to{opacity:.5}50%{opacity:1}}.mm-empty{margin:auto 0}.mm-reader{display:grid;gap:26px;max-width:var(--kx-reading-measure)}.mm-head{display:flex;align-items:flex-start;gap:16px}.mm-head-ic{width:48px;height:48px;border-radius:var(--kx-radius-10)}.mm-head-ic svg{width:22px;height:22px}.mm-head-body{flex:1;min-width:0;display:grid;gap:10px}.mm-head-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mm-topic{font-size:12.5px;font-weight:600;color:var(--p-text-muted-color)}.mm-head-acts{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}.mm-danger:hover:not(:disabled){color:var(--p-danger-500);border-color:color-mix(in srgb,var(--p-danger-500) 45%,transparent)}.mm-title{margin:0;font-size:20px;font-weight:700;line-height:1.35;letter-spacing:-.01em;overflow-wrap:anywhere}.mm-edit{display:grid;gap:8px}.mm-edit-acts{display:flex;gap:8px}.mm-facts{display:flex;flex-wrap:wrap;gap:6px 16px}.mm-fact{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--p-text-muted-color)}.mm-fact svg{width:14px;height:14px}.mm-sec{display:grid;gap:10px}.mm-sec-h{margin:0;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--kx-text-fainter)}.mm-timeline{list-style:none;margin:0;padding:0;display:grid}.mm-timeline li{position:relative;display:flex;gap:12px;padding:0 0 14px 2px}.mm-timeline li:not(:last-child):before{content:"";position:absolute;left:7px;top:14px;bottom:0;width:1px;background:var(--p-content-border-color)}.mm-dot{width:11px;height:11px;margin-top:4px;flex:none;border-radius:999px;border:2px solid var(--p-content-border-color);background:var(--p-content-background)}.mm-timeline li.now .mm-dot{border-color:var(--p-primary-color);background:var(--p-primary-color)}.mm-tl-body{display:grid;gap:2px;min-width:0}.mm-tl-t{font-size:13px;overflow-wrap:anywhere}.mm-timeline li.past .mm-tl-t{color:var(--p-text-muted-color)}.mm-tl-s{font-size:11.5px;color:var(--kx-text-faint)}.mm-sources{list-style:none;margin:0;padding:0;display:grid;gap:6px}.mm-sources li{display:flex;align-items:center;gap:8px;font-size:12.5px}.mm-sources svg{width:15px;height:15px;color:var(--p-text-muted-color)}.mm-view-head{display:grid;gap:4px;max-width:var(--kx-reading-measure)}.mm-view-title{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;font-weight:700}.mm-view-title svg{width:20px;height:20px;color:var(--p-primary-color)}.mm-card{display:grid;gap:8px;max-width:var(--kx-reading-measure);padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background)}.mm-card-h{display:flex;align-items:center;gap:8px;font-weight:700}.mm-option{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10)}.mm-option-main{display:grid;gap:2px;flex:1;min-width:0}.mm-option-t{overflow-wrap:anywhere}.mm-runs{list-style:none;margin:0;padding:0;display:grid;max-width:var(--kx-reading-measure)}.mm-run{display:flex;align-items:flex-start;gap:12px;padding:10px 2px;border-bottom:1px solid var(--p-content-border-color)}.mm-run:last-child{border-bottom:none}.mm-run-main{display:grid;gap:2px;flex:1;min-width:0}.mm-run-t{font-weight:600}.mm-run-err{font-size:12px;color:var(--p-danger-600, var(--p-danger-500));overflow-wrap:anywhere}.mm-sections{display:grid;gap:22px}.mm-section{display:grid;gap:10px}.mm-section+.mm-section{padding-top:18px;border-top:1px solid var(--p-content-border-color)}.mm-section-h{display:flex;align-items:center;gap:8px;margin:0;font-size:13.5px;font-weight:700}.mm-section-h svg{width:16px;height:16px;color:var(--p-primary-color)}.mm-section-hint{margin:-4px 0 2px;font-size:12px;color:var(--p-text-muted-color)}.mm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}.mm-grid>.wide{grid-column:1 / -1}@media(max-width:560px){.mm-grid{grid-template-columns:minmax(0,1fr)}}.mm-grid .p-inputnumber,.mm-grid .p-inputnumber-input{width:100%}';
function yn(e, r) {
  return class extends Wt {
    static get wippyConfig() {
      return { propsSchema: r, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: Jo };
    }
    static get vueConfig() {
      return { rootComponent: e, plugins: [Go] };
    }
  };
}
function N(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function wn(e) {
  if (N(e)) {
    const r = e.response;
    if (N(r) && N(r.data) && typeof r.data.error == "string") return r.data.error;
    if (typeof e.message == "string") return e.message;
  }
  return String(e);
}
function kn(e, r) {
  if (!N(e) || !Array.isArray(e[r])) throw new Error(`Memory response is missing ${r}`);
  const t = e.next_offset;
  if (t !== void 0 && (typeof t != "number" || !Number.isInteger(t) || t < 0))
    throw new Error("Memory response has an invalid next_offset");
  return { rows: e[r], next: typeof t == "number" ? t : null };
}
function Sn(e) {
  return e instanceof CustomEvent && N(e.detail) ? e.detail : {};
}
function _n(e) {
  if (e === void 0) return {};
  if (typeof e == "string" && (e = JSON.parse(e)), !N(e)) throw new Error("Memory configuration must be an object");
  return e;
}
function Cn(e) {
  if (!N(e) || e.type !== "object" || !N(e.properties) || !Object.keys(e.properties).length)
    throw new Error("Memory create schema must supply object properties");
  for (const r of Object.values(e.properties))
    if (!N(r) || !["string", "integer", "number", "boolean"].includes(String(r.type)))
      throw new Error("Memory create schema must supply object properties");
  return { type: "object", properties: e.properties };
}
export {
  te as B,
  an as C,
  Gt as F,
  gn as K,
  bn as M,
  P as N,
  fe as P,
  hn as Q,
  xn as R,
  k as S,
  fn as T,
  un as U,
  ln as W,
  tn as a,
  _n as b,
  Cn as c,
  wr as d,
  wn as e,
  V as f,
  Fe as g,
  O as h,
  M as i,
  pn as j,
  vn as k,
  je as l,
  yn as m,
  sn as n,
  nn as o,
  dn as p,
  We as q,
  on as r,
  b as s,
  Sn as t,
  rn as u,
  cn as v,
  Se as w,
  N as x,
  kn as y,
  mn as z
};
//# sourceMappingURL=types-CkAlvrJt.js.map
