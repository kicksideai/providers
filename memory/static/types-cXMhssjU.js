import { hasInjectionContext as vr, inject as Te, effectScope as br, ref as j, markRaw as yr, createApp as xr, onMounted as _t, onUnmounted as wr, watch as ae, readonly as kr, getCurrentInstance as Ye, nextTick as _r, reactive as Sr, renderSlot as Se, openBlock as $r, createBlock as Cr, Teleport as St, createCommentVNode as $t, useId as Or, mergeProps as Ee, h as Pr } from "vue";
import { addCollection as Tr } from "@iconify/vue";
import { config as Ge, addIcons as Er, on as Nr, applyThemeMode as ye, host as Ar, hostCss as Lr, loadCss as jr } from "@wippy-fe/proxy";
var je = "data-wippy-visible";
function qe(e) {
  const t = e.getAttribute(je);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Vr = Object.defineProperty, Rr = (e, t, r) => t in e ? Vr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, x = (e, t, r) => Rr(e, typeof t != "symbol" ? t + "" : t, r), Ir = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], zr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Qe(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Mr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [a, l] of Object.entries(n)) {
            const s = typeof l == "string" ? Qe(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof n == "string" ? Qe(o) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Fr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${zr} {
${t}
}`;
}
function Dr(e, t) {
  const r = Fr(t);
  r && Ct(e, r, "@wippy-fe/css-variables-bridge");
}
function Ur(e, t) {
  const o = (t ?? Ir).map(async (n) => {
    const i = Lr[n];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await jr(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${i}):`, a), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const i of n) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Hr(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Ct(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function Wr(e, t) {
  Ct(e, t, "@wippy-fe/custom-css");
}
function Ot(e) {
  return e.__wippyHost ?? null;
}
function Br(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function Kr(e, t, r) {
  switch (r.type) {
    case "string":
      return { value: t };
    case "number": {
      const o = Number.parseFloat(t);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(t, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(t);
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Ne(e, t) {
  const r = {}, o = [];
  for (const [n, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(n), l = Br(n);
    if (a === null) {
      i.default !== void 0 && (r[l] = i.default);
      continue;
    }
    const s = Kr(n, a, i);
    s.error ? o.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: o };
}
var Yr = class {
  constructor(e, t) {
    x(this, "_props"), x(this, "_errors"), x(this, "_content"), x(this, "_hostVisibility"), x(this, "_propsListeners", /* @__PURE__ */ new Set()), x(this, "_contentListeners", /* @__PURE__ */ new Set()), x(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), x(this, "_disposed", !1), x(this, "_emitToDom"), x(this, "props"), x(this, "events"), x(this, "content"), x(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, n) {
        return r._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        r._disposed || r._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, n) {
        return r._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, n) {
        return r._subscribeHostVisibility(o, n);
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
}, Gr = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = qe(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, je])];
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
    return Ot(this);
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
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const i = Ne(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, o = i.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new Yr(
        { props: r, errors: o, content: n, hasContent: t, hostVisibility: this._hostVisible },
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
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(r), e.inlineCss && Hr(r, e.inlineCss);
        try {
          const p = Ge?.theming, c = Mr(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          Dr(r, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const p = Ge?.theming, c = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            c && Wr(r, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Ur(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), r.appendChild(o), this._container = o, Er(Tr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Nr("@theme", (s) => this._applyTheme(s)));
      const { props: n, errors: i } = Ne(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(n));
      const a = n;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ar.getThemeMode?.()) {
    ye(e, this), this._container && ye(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ye("auto", this), this._container && ye("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === je) {
      const l = this._hostVisible, s = qe(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: i } = Ne(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(n));
    const a = n;
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
function qr(e) {
  return e.__wippyHostBus ?? null;
}
function Qr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Pt;
const Tt = (e) => Pt = e, Jr = () => vr() && Te(Et) || Pt, Et = (
  /* istanbul ignore next */
  Symbol()
);
function Zr() {
  const e = br(!0), t = e.run(() => j({}));
  let r = [], o = [];
  const n = yr({
    install(i) {
      Tt(n), n._a = i, i.provide(Et, n), i.config.globalProperties.$pinia = n, o.forEach((a) => r.push(a)), o = [];
    },
    use(i) {
      return this._a ? r.push(i) : o.push(i), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return n;
}
var Xr = Object.defineProperty, eo = (e, t, r) => t in e ? Xr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ne = (e, t, r) => eo(e, typeof t != "symbol" ? t + "" : t, r), Nt = /* @__PURE__ */ Symbol("wippy:emit"), At = /* @__PURE__ */ Symbol("wippy:props"), to = /* @__PURE__ */ Symbol("wippy:props_error"), ro = /* @__PURE__ */ Symbol("wippy:content"), oo = /* @__PURE__ */ Symbol("wippy:panel-id"), no = /* @__PURE__ */ Symbol("wippy:layout-bus"), io = /* @__PURE__ */ Symbol("wippy:host"), Lt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function En() {
  const e = Te(At);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Nn() {
  const e = Te(Nt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function ao() {
  const e = Te(Lt);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function An(e) {
  const t = ao();
  let r = !1, o = null, n = !1;
  function i() {
    if (o)
      return n = !0, o;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (s) {
      a = Promise.reject(s);
    }
    const l = a.finally(() => {
      if (o === l && (o = null, r && n))
        return n = !1, i();
    });
    return o = l, l;
  }
  return _t(() => (r = !0, i())), wr(() => {
    r = !1, n = !1;
  }), ae(t, (a, l) => {
    if (r && l === !1 && a === !0)
      return i();
  }), t;
}
var so = class extends Gr {
  constructor() {
    super(...arguments), ne(this, "_vueApp", null), ne(this, "_propsRef", j({})), ne(this, "_errorsRef", j([])), ne(this, "_contentRef", j(null)), ne(this, "_hostVisibilityRef", j(null)), ne(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
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
    const s = (p) => {
      if (l.signal.aborted)
        return;
      const c = Jr(), d = xr(p.rootComponent);
      this._vueApp = d;
      const u = Zr();
      if (p.piniaPlugins)
        for (const m of p.piniaPlugins)
          u.use(m);
      if (d.use(u), p.plugins)
        for (const m of p.plugins)
          d.use(m);
      d.provide(At, this._propsRef), d.provide(to, this._errorsRef), d.provide(Nt, this.emitEvent.bind(this)), d.provide(ro, this._contentRef), d.provide(Lt, this._hostVisibilityRef), d.provide(oo, Qr(this)), d.provide(no, qr(this)), d.provide(io, Ot(this)), p.providers && p.providers(d, this), d.mount(t), c && Tt(c);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), t.appendChild(p), a.lazyConfig().then((c) => {
        l.signal.aborted || (p.remove(), s(c));
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
}, lo = Object.defineProperty, Je = Object.getOwnPropertySymbols, po = Object.prototype.hasOwnProperty, co = Object.prototype.propertyIsEnumerable, Ze = (e, t, r) => t in e ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, uo = (e, t) => {
  for (var r in t || (t = {})) po.call(t, r) && Ze(e, r, t[r]);
  if (Je) for (var r of Je(t)) co.call(t, r) && Ze(e, r, t[r]);
  return e;
};
function De(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ve(e, t, r = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || r.has(e) || r.has(t)) return !1;
  r.add(e).add(t);
  let o = Array.isArray(e), n = Array.isArray(t), i, a, l;
  if (o && n) {
    if (a = e.length, a != t.length) return !1;
    for (i = a; i-- !== 0; ) if (!Ve(e[i], t[i], r)) return !1;
    return !0;
  }
  if (o != n) return !1;
  let s = e instanceof Date, p = t instanceof Date;
  if (s != p) return !1;
  if (s && p) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, d = t instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return e.toString() == t.toString();
  let u = Object.keys(e);
  if (a = u.length, a !== Object.keys(t).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, u[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = u[i], !Ve(e[l], t[l], r)) return !1;
  return !0;
}
function mo(e, t) {
  return Ve(e, t);
}
function Ue(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function y(e) {
  return !De(e);
}
function Xe(e, t) {
  if (!e || !t) return null;
  try {
    let r = e[t];
    if (y(r)) return r;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ue(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let r = t.split("."), o = e;
      for (let n = 0, i = r.length; n < i; ++n) {
        if (o == null) return null;
        o = o[r[n]];
      }
      return o;
    }
  }
  return null;
}
function Ln(e, t, r) {
  return r ? Xe(e, r) === Xe(t, r) : mo(e, t);
}
function F(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function jt(e = {}, t = {}) {
  let r = uo({}, e);
  return Object.keys(t).forEach((o) => {
    let n = o;
    F(t[n]) && n in e && F(e[n]) ? r[n] = jt(e[n], t[n]) : r[n] = t[n];
  }), r;
}
function ho(...e) {
  return e.reduce((t, r, o) => o === 0 ? r : jt(t, r), {});
}
function C(e, ...t) {
  return Ue(e) ? e(...t) : e;
}
function T(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function q(e) {
  return T(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Vt(e, t = "", r = {}) {
  let o = q(t).split("."), n = o.shift();
  if (n) {
    if (F(e)) {
      let i = Object.keys(e).find((a) => q(a) === n) || "";
      return Vt(C(e[i], r), o.join("."), r);
    }
    return;
  }
  return C(e, r);
}
function fo(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function go(e) {
  return y(e) && !isNaN(e);
}
function Q(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function vo(...e) {
  return ho(...e);
}
function ue(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function jn(e) {
  return T(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Rt(e) {
  return T(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function It() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let o = e.get(t);
    return o ? o.push(r) : o = [r], e.set(t, o), this;
  }, off(t, r) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let o = e.get(t);
    o && o.forEach((n) => {
      n(r);
    });
  }, clear() {
    e.clear();
  } };
}
function bo(...e) {
  if (e) {
    let t = [];
    for (let r = 0; r < e.length; r++) {
      let o = e[r];
      if (!o) continue;
      let n = typeof o;
      if (n === "string" || n === "number") t.push(o);
      else if (n === "object") {
        let i = Array.isArray(o) ? [bo(...o)] : Object.entries(o).map(([a, l]) => l ? a : void 0);
        t = i.length ? t.concat(i.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function yo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function et(e, t) {
  if (e && t) {
    let r = (o) => {
      yo(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function xo() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Vn(e) {
  typeof e == "string" ? et(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, xo() + "px"), et(document.body, e?.className || "p-overflow-hidden"));
}
function tt(e, t) {
  if (e && t) {
    let r = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Rn(e) {
  typeof e == "string" ? tt(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), tt(document.body, e?.className || "p-overflow-hidden"));
}
function In() {
  let e = window, t = document, r = t.documentElement, o = t.getElementsByTagName("body")[0], n = e.innerWidth || r.clientWidth || o.clientWidth, i = e.innerHeight || r.clientHeight || o.clientHeight;
  return { width: n, height: i };
}
function rt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function zn(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([r, o]) => e.style[r] = o));
}
function Mn(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function wo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function ko(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && wo(e));
}
function Z(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Fn() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function $e(e, t = {}) {
  if (Z(e)) {
    let r = (o, n) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[o] ? [(a = e?.$attrs) == null ? void 0 : a[o]] : [];
      return [n].flat().reduce((s, p) => {
        if (p != null) {
          let c = typeof p;
          if (c === "string" || c === "number") s.push(p);
          else if (c === "object") {
            let d = Array.isArray(p) ? r(o, p) : Object.entries(p).map(([u, m]) => o === "style" && (m || m === 0) ? `${u.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? u : void 0);
            s = d.length ? s.concat(d.filter((u) => !!u)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([o, n]) => {
      if (n != null) {
        let i = o.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? $e(e, n) : (n = o === "class" ? [...new Set(r("class", n))].join(" ").trim() : o === "style" ? r("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function Dn(e, t = {}, ...r) {
  {
    let o = document.createElement(e);
    return $e(o, t), o.append(...r), o;
  }
}
function _o(e, t) {
  return Z(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function So(e, t) {
  return Z(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Un(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Hn(e, t) {
  if (Z(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function zt(e, t = "") {
  let r = _o(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), o = [];
  for (let n of r) getComputedStyle(n).display != "none" && getComputedStyle(n).visibility != "hidden" && o.push(n);
  return o;
}
function Wn(e, t) {
  let r = zt(e, t);
  return r.length > 0 ? r[0] : null;
}
function Bn(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Kn(e, t) {
  let r = zt(e, t);
  return r.length > 0 ? r[r.length - 1] : null;
}
function Yn(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || rt(document.documentElement) || rt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Gn(e, t) {
  return e ? e.offsetHeight : 0;
}
function qn() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function Qn(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function Mt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Jn(e, t = "") {
  return Z(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function $o(e, t = "", r) {
  Z(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var Co = Object.defineProperty, Oo = Object.defineProperties, Po = Object.getOwnPropertyDescriptors, Ce = Object.getOwnPropertySymbols, Ft = Object.prototype.hasOwnProperty, Dt = Object.prototype.propertyIsEnumerable, ot = (e, t, r) => t in e ? Co(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, P = (e, t) => {
  for (var r in t || (t = {})) Ft.call(t, r) && ot(e, r, t[r]);
  if (Ce) for (var r of Ce(t)) Dt.call(t, r) && ot(e, r, t[r]);
  return e;
}, Ae = (e, t) => Oo(e, Po(t)), L = (e, t) => {
  var r = {};
  for (var o in e) Ft.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && Ce) for (var o of Ce(e)) t.indexOf(o) < 0 && Dt.call(e, o) && (r[o] = e[o]);
  return r;
}, To = It(), S = To, me = /{([^}]*)}/g, Ut = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Ht = /var\([^)]+\)/g;
function nt(e) {
  return T(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Eo(e) {
  return F(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function No(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Re(e = "", t = "") {
  return No(`${T(e, !1) && T(t, !1) ? `${e}-` : e}${t}`);
}
function Wt(e = "", t = "") {
  return `--${Re(e, t)}`;
}
function Ao(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function Bt(e, t = "", r = "", o = [], n) {
  if (T(e)) {
    let i = e.trim();
    if (Ao(i)) return;
    if (Q(i, me)) {
      let a = i.replaceAll(me, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((p) => !o.some((c) => Q(p, c)));
        return `var(${Wt(r, Rt(s.join("-")))}${y(n) ? `, ${n}` : ""})`;
      });
      return Q(a.replace(Ht, "0"), Ut) ? `calc(${a})` : a;
    }
    return i;
  } else if (go(e)) return e;
}
function Lo(e, t, r) {
  T(t, !1) && e.push(`${t}:${r};`);
}
function ie(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Kt(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, l) {
    let s = [], p = 0, c = "", d = null, u = 0;
    for (; p <= a.length; ) {
      let m = a[p];
      if ((m === '"' || m === "'" || m === "`") && a[p - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && u++, m === ")" && u--, (m === "," || p === a.length) && u === 0)) {
        let h = c.trim();
        h.startsWith("dt(") ? s.push(Kt(h, l)) : s.push(o(h)), c = "", p++;
        continue;
      }
      m !== void 0 && (c += m), p++;
    }
    return s;
  }
  function o(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let n = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && n.push([l, a]);
  }
  if (!n.length) return e;
  for (let a = n.length - 1; a >= 0; a--) {
    let [l, s] = n[a], p = e.slice(l + 3, s), c = r(p, t), d = t(...c);
    e = e.slice(0, l) + d + e.slice(s + 1);
  }
  return e;
}
var Zn = (e) => {
  var t;
  let r = w.getTheme(), o = Ie(r, e, void 0, "variable"), n = (t = o?.match(/--[\w-]+/g)) == null ? void 0 : t[0], i = Ie(r, e, void 0, "value");
  return { name: n, variable: o, value: i };
}, J = (...e) => Ie(w.getTheme(), ...e), Ie = (e = {}, t, r, o) => {
  if (t) {
    let { variable: n, options: i } = w.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = Q(t, me) ? t : `{${t}}`;
    return o === "value" || De(o) && l === "strict" ? w.getTokenValue(t) : Bt(s, void 0, a, [n.excludedKeyRegex], r);
  }
  return "";
};
function xe(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((o, n, i) => {
      var a;
      return o + n + ((a = C(t[i], { dt: J })) != null ? a : "");
    }, "");
    return Kt(r, J);
  }
  return C(e, { dt: J });
}
function jo(e, t = {}) {
  let r = w.defaults.variable, { prefix: o = r.prefix, selector: n = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: o }];
  for (; s.length; ) {
    let { node: c, path: d } = s.pop();
    for (let u in c) {
      let m = c[u], h = Eo(m), g = Q(u, i) ? Re(d) : Re(d, Rt(u));
      if (F(h)) s.push({ node: h, path: g });
      else {
        let b = Wt(g), v = Bt(h, g, o, [i]);
        Lo(l, b, v);
        let k = g;
        o && k.startsWith(o + "-") && (k = k.slice(o.length + 1)), a.push(k.replace(/-/g, "."));
      }
    }
  }
  let p = l.join("");
  return { value: l, tokens: a, declarations: p, css: ie(n, p) };
}
var O = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((n) => n.resolve(r)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return jo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a, l, s, p, c, d;
  let { preset: u, options: m } = t, h, g, b, v, k, N, D;
  if (y(u) && m.transform !== "strict") {
    let { primitive: X, semantic: U, extend: V } = u, R = U || {}, { colorScheme: I } = R, H = L(R, ["colorScheme"]), z = V || {}, { colorScheme: W } = z, B = L(z, ["colorScheme"]), M = I || {}, { dark: K } = M, ee = L(M, ["dark"]), Y = W || {}, { dark: te } = Y, re = L(Y, ["dark"]), A = y(X) ? this._toVariables({ primitive: X }, m) : {}, E = y(H) ? this._toVariables({ semantic: H }, m) : {}, G = y(ee) ? this._toVariables({ light: ee }, m) : {}, be = y(K) ? this._toVariables({ dark: K }, m) : {}, oe = y(B) ? this._toVariables({ semantic: B }, m) : {}, Be = y(re) ? this._toVariables({ light: re }, m) : {}, Ke = y(te) ? this._toVariables({ dark: te }, m) : {}, [Xt, er] = [(i = A.declarations) != null ? i : "", A.tokens], [tr, rr] = [(a = E.declarations) != null ? a : "", E.tokens || []], [or, nr] = [(l = G.declarations) != null ? l : "", G.tokens || []], [ir, ar] = [(s = be.declarations) != null ? s : "", be.tokens || []], [sr, lr] = [(p = oe.declarations) != null ? p : "", oe.tokens || []], [pr, cr] = [(c = Be.declarations) != null ? c : "", Be.tokens || []], [dr, ur] = [(d = Ke.declarations) != null ? d : "", Ke.tokens || []];
    h = this.transformCSS(e, Xt, "light", "variable", m, o, n), g = er;
    let mr = this.transformCSS(e, `${tr}${or}`, "light", "variable", m, o, n), hr = this.transformCSS(e, `${ir}`, "dark", "variable", m, o, n);
    b = `${mr}${hr}`, v = [.../* @__PURE__ */ new Set([...rr, ...nr, ...ar])];
    let fr = this.transformCSS(e, `${sr}${pr}color-scheme:light`, "light", "variable", m, o, n), gr = this.transformCSS(e, `${dr}color-scheme:dark`, "dark", "variable", m, o, n);
    k = `${fr}${gr}`, N = [.../* @__PURE__ */ new Set([...lr, ...cr, ...ur])], D = C(u.css, { dt: J });
  }
  return { primitive: { css: h, tokens: g }, semantic: { css: b, tokens: v }, global: { css: k, tokens: N }, style: D };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: o, set: n, defaults: i, selector: a }) {
  var l, s, p;
  let c, d, u;
  if (y(t) && r.transform !== "strict") {
    let m = e.replace("-directive", ""), h = t, { colorScheme: g, extend: b, css: v } = h, k = L(h, ["colorScheme", "extend", "css"]), N = b || {}, { colorScheme: D } = N, X = L(N, ["colorScheme"]), U = g || {}, { dark: V } = U, R = L(U, ["dark"]), I = D || {}, { dark: H } = I, z = L(I, ["dark"]), W = y(k) ? this._toVariables({ [m]: P(P({}, k), X) }, r) : {}, B = y(R) ? this._toVariables({ [m]: P(P({}, R), z) }, r) : {}, M = y(V) ? this._toVariables({ [m]: P(P({}, V), H) }, r) : {}, [K, ee] = [(l = W.declarations) != null ? l : "", W.tokens || []], [Y, te] = [(s = B.declarations) != null ? s : "", B.tokens || []], [re, A] = [(p = M.declarations) != null ? p : "", M.tokens || []], E = this.transformCSS(m, `${K}${Y}`, "light", "variable", r, n, i, a), G = this.transformCSS(m, re, "dark", "variable", r, n, i, a);
    c = `${E}${G}`, d = [.../* @__PURE__ */ new Set([...ee, ...te, ...A])], u = C(v, { dt: J });
  }
  return { css: c, tokens: d, style: u };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: r, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: p } = t, c = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: p, params: r, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, o) {
  let { cssLayer: n } = t;
  return n ? `@layer ${C(n.order || n.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: n, defaults: i }), l = Object.entries(o).reduce((s, [p, c]) => s.push(`${p}="${c}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [p, c]) => {
    if (F(c) && Object.hasOwn(c, "css")) {
      let d = ue(c.css), u = `${p}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${u}" ${l}>${d}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: r, set: n, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, p = Object.entries(o).reduce((c, [d, u]) => c.push(`${d}="${u}"`) && c, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${p}>${ue(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", o = "", n = {}) {
  let i = function(l, s = {}, p = []) {
    if (p.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    p.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && me.test(this.value)) {
      let d = this.value.trim().replace(me, (u) => {
        var m;
        let h = u.slice(1, -1), g = this.tokens[h];
        if (!g) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let b = g.computed(l, s, p);
        return Array.isArray(b) && b.length === 2 ? `light-dark(${b[0].value},${b[1].value})` : (m = b?.value) != null ? m : "__UNRESOLVED__";
      });
      c = Ut.test(d.replace(Ht, "0")) ? `calc(${d})` : d;
    }
    return De(s.binding) && delete s.binding, p.pop(), { colorScheme: l, path: this.path, paths: s, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, s, p) => {
    Object.entries(l).forEach(([c, d]) => {
      let u = Q(c, t.variable.excludedKeyRegex) ? s : s ? `${s}.${nt(c)}` : nt(c), m = p ? `${p}.${c}` : c;
      F(d) ? a(d, u, m) : (n[u] || (n[u] = { paths: [], computed: (h, g = {}, b = []) => {
        if (n[u].paths.length === 1) return n[u].paths[0].computed(n[u].paths[0].scheme, g.binding, b);
        if (h && h !== "none") for (let v = 0; v < n[u].paths.length; v++) {
          let k = n[u].paths[v];
          if (k.scheme === h) return k.computed(h, g.binding, b);
        }
        return n[u].paths.map((v) => v.computed(v.scheme, g[v.scheme], b));
      } }), n[u].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: n }));
    });
  };
  return a(e, r, o), n;
}, getTokenValue(e, t, r) {
  var o;
  let n = ((l) => l.split(".").filter((s) => !Q(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = e[n]) == null ? void 0 : o.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let p = s, { colorScheme: c } = p, d = L(p, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(e, t, r, o) {
  return r === "class" || r === "attr" ? ie(y(t) ? `${e}${t},${e} ${t}` : e, o) : ie(e, ie(t ?? ":root,:host", o));
}, transformCSS(e, t, r, o, n = {}, i, a, l) {
  if (y(t)) {
    let { cssLayer: s } = n;
    if (o !== "style") {
      let p = this.getColorSchemeOption(n, a);
      t = r === "dark" ? p.reduce((c, { type: d, selector: u }) => (y(u) && (c += u.includes("[CSS]") ? u.replace("[CSS]", t) : this.getSelectorRule(u, l, d, t)), c), "") : ie(l ?? ":root,:host", t);
    }
    if (s) {
      let p = { name: "primeui" };
      F(s) && (p.name = C(s.name, { name: e, type: o })), y(p.name) && (t = ie(`@layer ${p.name}`, t), i?.layerNames(p.name));
    }
    return t;
  }
  return "";
} }, w = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ae(P({}, t), { options: P(P({}, this.defaults.options), t.options) }), this._tokens = O.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), S.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ae(P({}, this.theme), { preset: e }), this._tokens = O.createTokens(e, this.defaults), this.clearLoadedStyleNames(), S.emit("preset:change", e), S.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ae(P({}, this.theme), { options: e }), this.clearLoadedStyleNames(), S.emit("options:change", e), S.emit("theme:change", this.theme);
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
  return O.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return O.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetD(r);
}, getCustomPreset(e = "", t, r, o) {
  let n = { name: e, preset: t, options: this.options, selector: r, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return O.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", o) {
  return O.transformCSS(e, t, o, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return O.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return O.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), S.emit(`theme:${t}:load`, e), !this._loadingStyles.size && S.emit("theme:load"));
} }, _ = {
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
}, Vo = `
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
function he(e) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, he(e);
}
function it(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function at(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? it(Object(r), !0).forEach(function(o) {
      Ro(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : it(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Ro(e, t, r) {
  return (t = Io(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Io(e) {
  var t = zo(e, "string");
  return he(t) == "symbol" ? t : t + "";
}
function zo(e, t) {
  if (he(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (he(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Mo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Ye() && Ye().components ? _t(e) : t ? e() : _r(e);
}
var Fo = 0;
function Do(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = j(!1), o = j(e), n = j(null), i = Mt() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, p = s === void 0 ? !0 : s, c = t.manual, d = c === void 0 ? !1 : c, u = t.name, m = u === void 0 ? "style_".concat(++Fo) : u, h = t.id, g = h === void 0 ? void 0 : h, b = t.media, v = b === void 0 ? void 0 : b, k = t.nonce, N = k === void 0 ? void 0 : k, D = t.first, X = D === void 0 ? !1 : D, U = t.onMounted, V = U === void 0 ? void 0 : U, R = t.onUpdated, I = R === void 0 ? void 0 : R, H = t.onLoad, z = H === void 0 ? void 0 : H, W = t.props, B = W === void 0 ? {} : W, M = function() {
  }, K = function(te) {
    var re = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var A = at(at({}, B), re), E = A.name || m, G = A.id || g, be = A.nonce || N;
      n.value = l.querySelector('style[data-primevue-style-id="'.concat(E, '"]')) || l.getElementById(G) || l.createElement("style"), n.value.isConnected || (o.value = te || e, $e(n.value, {
        type: "text/css",
        id: G,
        media: v,
        nonce: be
      }), X ? l.head.prepend(n.value) : l.head.appendChild(n.value), $o(n.value, "data-primevue-style-id", E), $e(n.value, A), n.value.onload = function(oe) {
        return z?.(oe, {
          name: E
        });
      }, V?.(E)), !r.value && (M = ae(o, function(oe) {
        n.value.textContent = oe, I?.(E);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, ee = function() {
    !l || !r.value || (M(), ko(n.value) && l.head.removeChild(n.value), r.value = !1, n.value = null);
  };
  return p && !d && Mo(K), {
    id: g,
    name: m,
    el: n,
    css: o,
    unload: ee,
    load: K,
    isLoaded: kr(r)
  };
}
function fe(e) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, fe(e);
}
var st, lt, pt, ct;
function dt(e, t) {
  return Bo(e) || Wo(e, t) || Ho(e, t) || Uo();
}
function Uo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ho(e, t) {
  if (e) {
    if (typeof e == "string") return ut(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ut(e, t) : void 0;
  }
}
function ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function Wo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, i, a, l = [], s = !0, p = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(s = (o = i.call(r)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (c) {
      p = !0, n = c;
    } finally {
      try {
        if (!s && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (p) throw n;
      }
    }
    return l;
  }
}
function Bo(e) {
  if (Array.isArray(e)) return e;
}
function mt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function Le(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mt(Object(r), !0).forEach(function(o) {
      Ko(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : mt(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Ko(e, t, r) {
  return (t = Yo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Yo(e) {
  var t = Go(e, "string");
  return fe(t) == "symbol" ? t : t + "";
}
function Go(e, t) {
  if (fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (fe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function we(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var qo = function(t) {
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
}, Qo = {}, Jo = {}, $ = {
  name: "base",
  css: qo,
  style: Vo,
  classes: Qo,
  inlineStyles: Jo,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, n = o(xe(st || (st = we(["", ""])), t));
    return y(n) ? Do(ue(n), Le({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return w.transformCSS(r.name || t.name, "".concat(n).concat(xe(lt || (lt = we(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return w.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return w.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return w.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, o) {
    return w.getCustomPreset(this.name, t, r, o);
  },
  getLayerOrderThemeCSS: function() {
    return w.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = C(this.css, {
        dt: J
      }) || "", n = ue(xe(pt || (pt = we(["", "", ""])), o, t)), i = Object.entries(r).reduce(function(a, l) {
        var s = dt(l, 2), p = s[0], c = s[1];
        return a.push("".concat(p, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return y(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return w.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [w.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = xe(ct || (ct = we(["", ""])), C(this.style, {
        dt: J
      })), a = ue(w.transformCSS(n, i)), l = Object.entries(r).reduce(function(s, p) {
        var c = dt(p, 2), d = c[0], u = c[1];
        return s.push("".concat(d, '="').concat(u, '"')) && s;
      }, []).join(" ");
      y(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Le(Le({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ke = It();
function ge(e) {
  "@babel/helpers - typeof";
  return ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ge(e);
}
function ht(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function _e(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ht(Object(r), !0).forEach(function(o) {
      Zo(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ht(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Zo(e, t, r) {
  return (t = Xo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Xo(e) {
  var t = en(e, "string");
  return ge(t) == "symbol" ? t : t + "";
}
function en(e, t) {
  if (ge(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (ge(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var tn = {
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
    text: [_.STARTS_WITH, _.CONTAINS, _.NOT_CONTAINS, _.ENDS_WITH, _.EQUALS, _.NOT_EQUALS],
    numeric: [_.EQUALS, _.NOT_EQUALS, _.LESS_THAN, _.LESS_THAN_OR_EQUAL_TO, _.GREATER_THAN, _.GREATER_THAN_OR_EQUAL_TO],
    date: [_.DATE_IS, _.DATE_IS_NOT, _.DATE_BEFORE, _.DATE_AFTER]
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
}, rn = Symbol();
function on(e, t) {
  var r = {
    config: Sr(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(rn, r), nn(), an(e, r), r;
}
var se = [];
function nn() {
  S.clear(), se.forEach(function(e) {
    return e?.();
  }), se = [];
}
function an(e, t) {
  var r = j(!1), o = function() {
    var p;
    if (((p = t.config) === null || p === void 0 ? void 0 : p.theme) !== "none" && !w.isStyleNameLoaded("common")) {
      var c, d, u = ((c = $.getCommonTheme) === null || c === void 0 ? void 0 : c.call($)) || {}, m = u.primitive, h = u.semantic, g = u.global, b = u.style, v = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      $.load(m?.css, _e({
        name: "primitive-variables"
      }, v)), $.load(h?.css, _e({
        name: "semantic-variables"
      }, v)), $.load(g?.css, _e({
        name: "global-variables"
      }, v)), $.loadStyle(_e({
        name: "global-style"
      }, v), b), w.setLoadedStyleName("common");
    }
  };
  S.on("theme:change", function(s) {
    r.value || (e.config.globalProperties.$primevue.config.theme = s, r.value = !0);
  });
  var n = ae(t.config, function(s, p) {
    ke.emit("config:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ae(function() {
    return t.config.ripple;
  }, function(s, p) {
    ke.emit("config:ripple:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ae(function() {
    return t.config.theme;
  }, function(s, p) {
    r.value || w.setTheme(s), t.config.unstyled || o(), r.value = !1, ke.emit("config:theme:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ae(function() {
    return t.config.unstyled;
  }, function(s, p) {
    !s && t.config.theme && o(), ke.emit("config:unstyled:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  });
  se.push(n), se.push(i), se.push(a), se.push(l);
}
var sn = {
  install: function(t, r) {
    var o = vo(tn, r);
    on(t, o);
  }
}, Yt = {
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
    this.mounted = Mt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ln(e, t, r, o, n, i) {
  return i.inline ? Se(e.$slots, "default", {
    key: 0
  }) : n.mounted ? ($r(), Cr(St, {
    key: 1,
    to: r.appendTo
  }, [Se(e.$slots, "default")], 8, ["to"])) : $t("", !0);
}
Yt.render = ln;
var pe = {
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
function pn() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Or();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var ft = $.extend({
  name: "common"
});
function ve(e) {
  "@babel/helpers - typeof";
  return ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ve(e);
}
function cn(e) {
  return Qt(e) || dn(e) || qt(e) || Gt();
}
function dn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ce(e, t) {
  return Qt(e) || un(e, t) || qt(e, t) || Gt();
}
function Gt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qt(e, t) {
  if (e) {
    if (typeof e == "string") return ze(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ze(e, t) : void 0;
  }
}
function ze(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function un(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, i, a, l = [], s = !0, p = !1;
    try {
      if (i = (r = r.call(e)).next, t === 0) {
        if (Object(r) !== r) return;
        s = !1;
      } else for (; !(s = (o = i.call(r)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (c) {
      p = !0, n = c;
    } finally {
      try {
        if (!s && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (p) throw n;
      }
    }
    return l;
  }
}
function Qt(e) {
  if (Array.isArray(e)) return e;
}
function gt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function f(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? gt(Object(r), !0).forEach(function(o) {
      de(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : gt(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function de(e, t, r) {
  return (t = mn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function mn(e) {
  var t = hn(e, "string");
  return ve(t) == "symbol" ? t : t + "";
}
function hn(e, t) {
  if (ve(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (ve(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var fn = {
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
        S.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, r) {
        var o = this;
        S.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, r, o, n, i, a, l, s, p, c, d, u = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = u ? (r = this.pt) === null || r === void 0 || (r = r.originalValue) === null || r === void 0 ? void 0 : r[this.$.type.name] : void 0, h = u ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (n = h || m) === null || n === void 0 || (n = n.hooks) === null || n === void 0 || (i = n.onBeforeCreate) === null || i === void 0 || i.call(n);
    var g = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, b = g ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, v = g ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (p = this.$primevue) === null || p === void 0 || (p = p.config) === null || p === void 0 ? void 0 : p.pt;
    (c = v || b) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = pn(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = So(Z(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = f({
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
        var r = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        r?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
        o[n - 1] = arguments[n];
      return Ue(t) ? t.apply(void 0, o) : Ee.apply(void 0, o);
    },
    _load: function() {
      pe.isStyleNameLoaded("base") || ($.loadCSS(this.$styleOptions), this._loadGlobalStyles(), pe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, r;
      !pe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name && (ft.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), pe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      y(t) && $.load(t, f({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, r;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!w.isStyleNameLoaded("common")) {
          var o, n, i = ((o = this.$style) === null || o === void 0 || (n = o.getCommonTheme) === null || n === void 0 ? void 0 : n.call(o)) || {}, a = i.primitive, l = i.semantic, s = i.global, p = i.style;
          $.load(a?.css, f({
            name: "primitive-variables"
          }, this.$styleOptions)), $.load(l?.css, f({
            name: "semantic-variables"
          }, this.$styleOptions)), $.load(s?.css, f({
            name: "global-variables"
          }, this.$styleOptions)), $.loadStyle(f({
            name: "global-style"
          }, this.$styleOptions), p), w.setLoadedStyleName("common");
        }
        if (!w.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name) {
          var c, d, u, m, h = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, g = h.css, b = h.style;
          (u = this.$style) === null || u === void 0 || u.load(g, f({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(f({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), b), w.setLoadedStyleName(this.$style.name);
        }
        if (!w.isStyleNameLoaded("layer-order")) {
          var v, k, N = (v = this.$style) === null || v === void 0 || (k = v.getLayerOrderThemeCSS) === null || k === void 0 ? void 0 : k.call(v);
          $.load(N, f({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), w.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var r, o, n, i = ((r = this.$style) === null || r === void 0 || (o = r.getPresetTheme) === null || o === void 0 ? void 0 : o.call(r, t, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, l = (n = this.$style) === null || n === void 0 ? void 0 : n.load(a, f({
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
      pe.clearLoadedStyleNames(), S.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      S.off("theme:change", this._loadCoreStyles), S.off("theme:change", this._load), S.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var r;
      return this[t] || ((r = this._getHostInstance(this)) === null || r === void 0 ? void 0 : r[t]);
    },
    _getOptionValue: function(t) {
      var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Vt(t, r, o);
    },
    _getPTValue: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(o) && !!n[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, p = s === void 0 ? !0 : s, c = l.mergeProps, d = c === void 0 ? !1 : c, u = i ? a ? this._useGlobalPT(this._getPTClassValue, o, n) : this._useDefaultPT(this._getPTClassValue, o, n) : void 0, m = a ? void 0 : this._getPTSelf(r, this._getPTClassValue, o, f(f({}, n), {}, {
        global: u || {}
      })), h = this._getPTDatasets(o);
      return p || !p && m ? d ? this._mergeProps(d, u, m, h) : f(f(f({}, u), m), h) : f(f({}, m), h);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
        o[n - 1] = arguments[n];
      return Ee(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = "data-pc-", i = o === "root" && y((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && f(f({}, o === "root" && f(f(de({}, "".concat(n, "name"), q(i ? (r = this.pt) === null || r === void 0 ? void 0 : r["data-pc-section"] : this.$.type.name)), i && de({}, "".concat(n, "extend"), q(this.$.type.name))), {}, de({}, "".concat(this.$attrSelector), ""))), {}, de({}, "".concat(n, "section"), q(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return T(t) || fo(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var r = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var s, p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = n ? n(l) : l, d = q(o), u = q(r.$name);
        return (s = p ? d !== u ? c?.[d] : void 0 : c?.[d]) !== null && s !== void 0 ? s : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, r, o, n) {
      var i = function(g) {
        return r(g, o, n);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, p = s === void 0 ? !0 : s, c = l.mergeProps, d = c === void 0 ? !1 : c, u = i(t.originalValue), m = i(t.value);
        return u === void 0 && m === void 0 ? void 0 : T(m) ? m : T(u) ? u : p || !p && m ? d ? this._mergeProps(d, u, m) : f(f({}, u), m) : m;
      }
      return i(t);
    },
    _useGlobalPT: function(t, r, o) {
      return this._usePT(this.globalPT, t, r, o);
    },
    _useDefaultPT: function(t, r, o) {
      return this._usePT(this.defaultPT, t, r, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, f(f({}, this.$params), r));
    },
    ptmi: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = Ee(this.$_attrsWithoutPT, this.ptm(r, o));
      return n?.hasOwnProperty("id") && ((t = n.id) !== null && t !== void 0 || (n.id = this.$id)), n;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, r, f({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, f(f({}, this.$params), r));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (r) {
        var n = this._getOptionValue(this.$style.inlineStyles, t, f(f({}, this.$params), o)), i = this._getOptionValue(ft.inlineStyles, t, f(f({}, this.$params), o));
        return [i, n];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return C(o, {
          instance: r
        });
      });
    },
    defaultPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return r._getOptionValue(o, r.$name, f({}, r.$params)) || C(o, f({}, r.$params));
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
      var t, r = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var n = ce(o, 1), i = n[0];
        return r?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return f(f({
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
        var r = ce(t, 1), o = r[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, r) {
        var o = ce(r, 2), n = o[0], i = o[1], a = n.split(":"), l = cn(a), s = ze(l).slice(1);
        return s?.reduce(function(p, c, d, u) {
          return !p[c] && (p[c] = d === u.length - 1 ? i : {}), p[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var r = ce(t, 1), o = r[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, r) {
        var o = ce(r, 2), n = o[0], i = o[1];
        return t[n] = i, t;
      }, {});
    }
  }
};
const gn = "data-wippy-overlay-layer";
function Jt() {
  return typeof window < "u" && typeof window.document < "u";
}
function Zt() {
  return Jt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function vn() {
  return Zt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const bn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let yn = 0;
const Oe = /* @__PURE__ */ new WeakMap();
function vt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function xn(e, t) {
  if (!bn.test(e.className))
    return;
  const r = e.style.cssText;
  vt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!Oe.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && vt(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Oe.set(e, o);
  }
}
function He(e) {
  const t = Oe.get(e);
  t && (t.disconnect(), Oe.delete(e));
}
function wn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Me(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Pe = /* @__PURE__ */ new Set(), We = /* @__PURE__ */ new WeakMap();
let bt = !1, Fe = !1;
function kn() {
  Fe = !1;
  for (const e of Pe) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && He(t);
      Pe.delete(e), We.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Me(e);
  }
}
function yt() {
  Fe || (Fe = !0, requestAnimationFrame(kn));
}
function _n(e) {
  const t = document.createElement("div");
  t.setAttribute(gn, "");
  const r = Zt();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Me(t);
  const o = new MutationObserver((n) => {
    const i = t.__wippyAnchorName;
    for (const a of n) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && xn(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && He(l);
    }
    t.isConnected && t.childElementCount > 0 && Me(t);
  });
  return o.observe(t, { childList: !0 }), We.set(t, o), Pe.add(t), bt || (bt = !0, window.addEventListener("scroll", yt, { capture: !0, passive: !0 }), window.addEventListener("resize", yt, { passive: !0 })), t;
}
function xt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = _n(e.hostRoot), vn())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++yn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function wt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && He(t);
    Pe.delete(e.layer), We.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let kt = !1;
function Sn() {
  if (kt)
    return;
  kt = !0;
  const e = Yt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Jt() && (this.hostRoot = wn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || xt(this), this.$watch("inline", (t) => {
      t ? wt(this) : xt(this);
    })));
  }, e.render = function() {
    return this.inline ? Se(this.$slots, "default", { key: 0 }) : this.mounted ? Pr(St, { key: 1, to: this.resolvedTarget || document.body }, [
      Se(this.$slots, "default")
    ]) : $t("", !0);
  }, e.unmounted = function() {
    wt(this);
  };
}
const $n = {
  install: (e) => {
    Sn(), e.use(sn, { theme: "none" });
  }
}, Cn = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}:host,:root{--kx-tone-blue: #2563eb;--kx-tone-violet: #7c3aed;--kx-tone-amber: #b45309}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}}:host(.w-theme-dark),:root.w-theme-dark{--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}.kx-tone-blue{color:var(--kx-tone-blue);background-color:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-tone-violet{color:var(--kx-tone-violet);background-color:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-tone-amber{color:var(--kx-tone-amber);background-color:color-mix(in srgb,var(--kx-tone-amber) 13%,transparent)}.kx-tone-neutral{color:var(--p-text-muted-color);background-color:color-mix(in srgb,var(--p-text-color) 10%,transparent)}.kx-shell{flex:1;min-height:0;display:grid;grid-template-columns:var(--kx-rail-width) minmax(0,1fr);background:var(--p-content-background)}.kx-rail{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-rail-body{flex:1;min-height:0;overflow-y:auto;padding:4px 8px 12px}.kx-main{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.kx-main-scroll{flex:1;min-height:0;overflow-y:auto;padding:18px 28px 80px 24px;display:flex;flex-direction:column;gap:16px}@media(max-width:760px){.kx-shell{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto minmax(0,1fr)}.kx-rail{max-height:40vh;border-right:none;border-bottom:1px solid var(--p-content-border-color)}.kx-main-scroll{padding:20px 22px 64px}}.kx-railhead{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 10px;border-bottom:1px solid var(--p-content-border-color)}.kx-railhead-title{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railhead-title b{color:var(--p-text-muted-color);margin-left:4px;font-variant-numeric:tabular-nums}.kx-railhead-acts{display:flex;align-items:center;gap:2px}.kx-railsec+.kx-railsec{border-top:1px solid var(--p-content-border-color)}.kx-railsec-h{display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px 7px;background:none;border:none;cursor:pointer;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railsec-h:hover{color:var(--p-text-muted-color)}.kx-railsec-chev{width:13px;height:13px;flex:none;transition:transform .15s ease}.kx-railsec:not(.closed) .kx-railsec-chev{transform:rotate(90deg)}.kx-railsec-ic{width:14px;height:14px;flex:none}.kx-railsec-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-railsec-h .count{margin-left:auto;color:var(--p-text-muted-color);font-variant-numeric:tabular-nums}.kx-railsec-b{padding:2px 0 8px}.kx-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);transition:color .14s,background .14s,border-color .14s}.kx-iconbtn:hover:not(:disabled){color:var(--p-text-color);background:var(--kx-surface-2)}.kx-iconbtn.on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-iconbtn:disabled{opacity:.55;cursor:default}.kx-iconbtn svg{width:16px;height:16px}.kx-iconbtn.lg{width:var(--kx-control-height);height:var(--kx-control-height)}.kx-iconbtn.sm{width:var(--kx-control-height-sm);height:var(--kx-control-height-sm)}.kx-iconbtn.bordered{border-color:var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.kx-iconbtn.bordered:hover:not(:disabled){border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-iconbtn.danger:hover:not(:disabled),.kx-iconbtn.danger.on{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kx-control-height);padding:0 14px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kx-btn svg{width:15px;height:15px}.kx-btn:disabled{opacity:.5;cursor:not-allowed}.kx-btn.sm{height:var(--kx-control-height-sm);padding:0 12px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-primary-contrast-color);border-color:var(--p-primary-color)}.kx-btn-primary:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.kx-btn-ghost{background:transparent;color:var(--p-text-color);border-color:var(--p-content-border-color)}.kx-btn-ghost:hover:not(:disabled){background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-btn-soft{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.kx-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-btn-danger{background:var(--p-danger-500);color:var(--p-danger-contrast-color);border-color:var(--p-danger-500)}.kx-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{width:100%;height:var(--kx-control-height);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-search-input:focus{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:var(--kx-radius-8);display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color)}.kx-search-clear:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.kx-search-clear svg{width:14px;height:14px}.kx-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.kx-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-notice{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:var(--kx-radius-14);font-size:13px;line-height:1.5;background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.kx-notice.info svg{color:var(--p-primary-color)}.kx-notice.warn{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent)}.kx-notice.error{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-danger-500) 30%,transparent)}.kx-notice.help{background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kx-notice.warn svg{color:var(--p-warn-500)}.kx-notice.error svg{color:var(--p-danger-500)}.kx-notice.help svg{color:var(--p-help-500)}.kx-notice-action{margin-left:8px;padding:2px 10px;border-radius:var(--kx-radius-8);font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor}.kx-notice-action:hover:not(:disabled){background:color-mix(in srgb,currentColor 10%,transparent)}.kx-notice-action:disabled{opacity:.6;cursor:default}.kx-drawer-mask{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;overflow:clip;background:color-mix(in srgb,var(--p-text-color) 32%,transparent);backdrop-filter:blur(2px)}.kx-drawer{width:min(560px,100%);min-width:0;box-sizing:border-box;height:100%;display:flex;flex-direction:column;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:-16px 0 50px -12px color-mix(in srgb,var(--p-text-color) 40%,transparent)}.kx-drawer-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-title{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:var(--p-text-color)}.kx-drawer-title svg{width:18px;height:18px;color:var(--p-primary-color)}.kx-drawer-b{flex:1;min-height:0;overflow-y:auto;padding:20px 20px 36px}.kx-drawer-enter-active,.kx-drawer-leave-active{transition:opacity .22s ease}.kx-drawer-enter-active .kx-drawer,.kx-drawer-leave-active .kx-drawer{transition:transform .26s cubic-bezier(.4,0,.2,1)}.kx-drawer-enter-from,.kx-drawer-leave-to{opacity:0}.kx-drawer-enter-from .kx-drawer,.kx-drawer-leave-to .kx-drawer{transform:translate(100%)}.kx-modal-mask{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kx-modal{width:min(460px,100%);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);overflow:hidden;box-shadow:0 20px 60px color-mix(in srgb,var(--p-text-color) 28%,transparent)}.kx-modal-h{display:flex;align-items:center;gap:11px;padding:14px 16px 4px}.kx-modal-h-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:var(--kx-radius-14);background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-modal.danger .kx-modal-h-ico{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.kx-modal-h-ico svg{width:17px;height:17px}.kx-modal-h-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.kx-modal-h-title{font-size:14px;font-weight:700;color:var(--p-text-color)}.kx-modal-h-sub{font-size:12px;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-modal-body{padding:8px 16px 14px;font-size:13px;line-height:1.55;color:var(--p-text-muted-color)}.kx-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color);background:var(--kx-surface-1)}.kx-modal-enter-active,.kx-modal-leave-active{transition:opacity .18s ease}.kx-modal-enter-from,.kx-modal-leave-to{opacity:0}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.mm-trait,.mm-form{display:grid;gap:16px;align-content:start}.mm-field{display:grid;gap:6px;min-width:0}.mm-label{font-weight:600}.mm-hint{display:inline-flex;align-items:flex-start;gap:6px;color:var(--p-text-muted-color);font-size:12px;line-height:1.45}.mm-hint svg{width:14px;height:14px;flex:none;margin-top:1px}.mm-hint-err{color:var(--p-danger-600, var(--p-danger-500))}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px}.mm-form-foot{display:flex;justify-content:flex-end;padding-top:4px}.mm-suggest{display:flex;flex-wrap:wrap;gap:6px}.mm-suggest-chip{padding:3px 10px;border-radius:999px;font:inherit;font-size:12px;cursor:pointer;color:var(--p-text-muted-color);background:var(--kx-overlay-subtle);border:1px solid var(--p-content-border-color)}.mm-suggest-chip:hover{color:var(--p-primary-color);border-color:var(--p-primary-color)}.mm-muted{color:var(--p-text-muted-color);font-size:12px}.mm-choices{display:grid;max-height:280px;overflow-y:auto;padding:4px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14)}.mm-choice{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-8);background:transparent;color:inherit;font:inherit;cursor:pointer}.mm-choice:hover{background:var(--kx-overlay-hover)}.mm-choice.on{background:var(--kx-wash-primary)}.mm-choice-ic{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:var(--kx-wash-primary)}.mm-choice-ic svg{width:16px;height:16px}.mm-choice-main{display:grid;min-width:0}.mm-choice-t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-choice.on .mm-choice-t{color:var(--p-primary-color)}.mm-choice-s{font-size:11.5px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-choice-empty{display:flex;align-items:center;gap:8px;padding:14px 10px;font-size:12.5px;color:var(--p-text-muted-color)}.mm-choice-empty svg{width:15px;height:15px}.mm-page{height:100%;min-height:0;overflow-y:auto;display:flex;flex-direction:column}.mm-page-note{margin:12px 16px 0}.mm-rail-tools{display:grid;gap:8px;padding:10px}.mm-views{display:flex}.mm-views .p-togglebutton{flex:1}.mm-rail-note{margin:6px 4px}.mm-rail-empty{padding:24px 12px;text-align:center;font-size:12.5px;line-height:1.5;color:var(--kx-text-faint)}.mm-more{margin:8px 4px 0;width:calc(100% - 8px);justify-content:center}.mm-conflict-bar{display:flex;align-items:center;gap:8px;margin:10px 10px 0;padding:8px 10px;border-radius:var(--kx-radius-10);border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-warn-500);font:inherit;font-size:12.5px;font-weight:600;text-align:left;cursor:pointer}.mm-conflict-bar svg{width:15px;height:15px;flex:none}.mm-conflict-bar span{flex:1}.mm-conflict-bar.on,.mm-conflict-bar:hover{background:color-mix(in srgb,var(--p-warn-500) 18%,transparent)}.mm-row{display:flex;align-items:center;gap:9px;width:100%;padding:7px 8px;text-align:left;border:none;border-radius:var(--kx-radius-8);background:transparent;color:inherit;font:inherit;cursor:pointer;transition:background .12s}.mm-row:hover{background:var(--kx-overlay-hover)}.mm-row.on{background:var(--kx-wash-primary);box-shadow:inset 2px 0 0 var(--p-primary-color)}.mm-row.on .mm-row-t{color:var(--p-primary-color)}.mm-row-ic,.mm-head-ic{display:grid;place-items:center;flex:none;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:var(--kx-wash-primary)}.mm-row-ic{width:28px;height:28px}.mm-row-ic svg{width:15px;height:15px}.mm-row-ic.knowhow,.mm-head-ic.knowhow{color:var(--kx-tone-violet);background:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.mm-row-ic.people,.mm-head-ic.people{color:var(--kx-tone-blue);background:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.mm-row-main{display:grid;gap:1px;min-width:0;flex:1}.mm-row-t{font-size:12.8px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-row-s{font-size:10.5px;color:var(--kx-text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-skel{display:grid;gap:6px;padding:6px}.mm-skel-row{height:42px;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);animation:mm-pulse 1.3s ease-in-out infinite}.mm-skel-reader{display:grid;gap:12px;max-width:var(--kx-reading-measure)}.mm-skel-line{height:14px;border-radius:6px;background:var(--kx-surface-2);animation:mm-pulse 1.3s ease-in-out infinite}.mm-skel-line:first-child{height:26px;width:70%}@keyframes mm-pulse{0%,to{opacity:.5}50%{opacity:1}}.mm-main{max-width:none}.mm-empty{margin:auto 0}.mm-reader{display:grid;gap:26px;max-width:var(--kx-reading-measure)}.mm-head{display:flex;align-items:flex-start;gap:16px}.mm-head-ic{width:48px;height:48px;border-radius:11px}.mm-head-ic svg{width:22px;height:22px}.mm-head-body{flex:1;min-width:0;display:grid;gap:10px}.mm-head-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mm-topic{font-size:12.5px;font-weight:600;color:var(--p-text-muted-color)}.mm-head-acts{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}.mm-danger:hover:not(:disabled){color:var(--p-danger-500);border-color:color-mix(in srgb,var(--p-danger-500) 45%,transparent)}.mm-title{margin:0;font-size:20px;font-weight:700;line-height:1.35;letter-spacing:-.01em;overflow-wrap:anywhere}.mm-edit{display:grid;gap:8px}.mm-edit-acts{display:flex;gap:8px}.mm-facts{display:flex;flex-wrap:wrap;gap:6px 16px}.mm-fact{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--p-text-muted-color)}.mm-fact svg{width:14px;height:14px}.mm-sec{display:grid;gap:10px}.mm-sec-h{margin:0;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.mm-timeline{list-style:none;margin:0;padding:0;display:grid}.mm-timeline li{position:relative;display:flex;gap:12px;padding:0 0 14px 2px}.mm-timeline li:not(:last-child):before{content:"";position:absolute;left:7px;top:14px;bottom:0;width:1px;background:var(--p-content-border-color)}.mm-dot{width:11px;height:11px;margin-top:4px;flex:none;border-radius:999px;border:2px solid var(--p-content-border-color);background:var(--p-content-background)}.mm-timeline li.now .mm-dot{border-color:var(--p-primary-color);background:var(--p-primary-color)}.mm-tl-body{display:grid;gap:2px;min-width:0}.mm-tl-t{font-size:13px;overflow-wrap:anywhere}.mm-timeline li.past .mm-tl-t{color:var(--p-text-muted-color)}.mm-tl-s{font-size:11.5px;color:var(--kx-text-faint)}.mm-sources{list-style:none;margin:0;padding:0;display:grid;gap:6px}.mm-sources li{display:flex;align-items:center;gap:8px;font-size:12.5px}.mm-sources svg{width:15px;height:15px;color:var(--p-text-muted-color)}.mm-view-head{display:grid;gap:4px;max-width:var(--kx-reading-measure)}.mm-view-title{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;font-weight:700}.mm-view-title svg{width:20px;height:20px;color:var(--p-primary-color)}.mm-card{display:grid;gap:8px;max-width:var(--kx-reading-measure);padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background)}.mm-card-h{display:flex;align-items:center;gap:8px;font-weight:700}.mm-option{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10)}.mm-option-main{display:grid;gap:2px;flex:1;min-width:0}.mm-option-t{overflow-wrap:anywhere}.mm-runs{list-style:none;margin:0;padding:0;display:grid;max-width:var(--kx-reading-measure)}.mm-run{display:flex;align-items:flex-start;gap:12px;padding:10px 2px;border-bottom:1px solid var(--p-content-border-color)}.mm-run:last-child{border-bottom:none}.mm-run-main{display:grid;gap:2px;flex:1;min-width:0}.mm-run-t{font-weight:600}.mm-run-err{font-size:12px;color:var(--p-danger-600, var(--p-danger-500));overflow-wrap:anywhere}.mm-sections{display:grid;gap:22px}.mm-section{display:grid;gap:10px}.mm-section+.mm-section{padding-top:18px;border-top:1px solid var(--p-content-border-color)}.mm-section-h{display:flex;align-items:center;gap:8px;margin:0;font-size:13.5px;font-weight:700}.mm-section-h svg{width:16px;height:16px;color:var(--p-primary-color)}.mm-section-hint{margin:-4px 0 2px;font-size:12px;color:var(--p-text-muted-color)}.mm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}.mm-grid>.wide{grid-column:1 / -1}@media(max-width:560px){.mm-grid{grid-template-columns:minmax(0,1fr)}}.mm-grid .p-inputnumber,.mm-grid .p-inputnumber-input{width:100%}.mm-row-ic.plans,.mm-head-ic.plans{color:var(--p-warn-500);background:var(--kx-wash-warn)}';
function Xn(e, t) {
  return class extends so {
    static get wippyConfig() {
      return { propsSchema: t, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: Cn };
    }
    static get vueConfig() {
      return { rootComponent: e, plugins: [$n] };
    }
  };
}
var ei = {
  name: "BaseEditableHolder",
  extends: fn,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(t) {
        this.d_value = t;
      }
    },
    defaultValue: function(t) {
      this.d_value = t;
    },
    $formName: {
      immediate: !0,
      handler: function(t) {
        var r, o;
        this.formField = ((r = this.$pcForm) === null || r === void 0 || (o = r.register) === null || o === void 0 ? void 0 : o.call(r, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var r, o;
        this.formField = ((r = this.$pcForm) === null || r === void 0 || (o = r.register) === null || o === void 0 ? void 0 : o.call(r, this.$formName, t)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(t) {
        this.d_value !== t && (this.d_value = t);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(t) {
        var r;
        (r = this.$pcForm) !== null && r !== void 0 && r.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, r) {
      var o, n;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (o = (n = this.formField).onChange) === null || o === void 0 || o.call(n, {
        originalEvent: r,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, r = new Array(t), o = 0; o < t; o++)
        r[o] = arguments[o];
      return r.find(y);
    }
  },
  computed: {
    $filled: function() {
      return y(this.d_value);
    },
    $invalid: function() {
      var t, r;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (r = this.$pcForm) === null || r === void 0 || (r = r.getFieldState(this.$formName)) === null || r === void 0 ? void 0 : r.invalid);
    },
    $formName: function() {
      var t;
      return this.$formNovalidate ? void 0 : this.name || ((t = this.$formControl) === null || t === void 0 ? void 0 : t.name);
    },
    $formControl: function() {
      var t;
      return this.formControl || ((t = this.$pcFormField) === null || t === void 0 ? void 0 : t.formControl);
    },
    $formNovalidate: function() {
      var t;
      return (t = this.$formControl) === null || t === void 0 ? void 0 : t.novalidate;
    },
    $formDefaultValue: function() {
      var t, r;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (r = this.$pcForm) === null || r === void 0 || (r = r.initialValues) === null || r === void 0 ? void 0 : r[this.$formName]);
    },
    $formValue: function() {
      var t, r;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (r = this.$pcForm) === null || r === void 0 || (r = r.getFieldState(this.$formName)) === null || r === void 0 ? void 0 : r.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
};
function le(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function ti(e) {
  if (le(e)) {
    const t = e.response;
    if (le(t) && le(t.data) && typeof t.data.error == "string") return t.data.error;
    if (typeof e.message == "string") return e.message;
  }
  return String(e);
}
function ri(e, t) {
  if (!le(e) || !Array.isArray(e[t])) throw new Error(`Memory response is missing ${t}`);
  const r = e.next_offset;
  if (r !== void 0 && (typeof r != "number" || !Number.isInteger(r) || r < 0))
    throw new Error("Memory response has an invalid next_offset");
  return { rows: e[t], next: typeof r == "number" ? r : null };
}
function oi(e) {
  return e instanceof CustomEvent && le(e.detail) ? e.detail : {};
}
function ni(e) {
  if (e === void 0) return {};
  if (typeof e == "string" && (e = JSON.parse(e)), !le(e)) throw new Error("Memory configuration must be an object");
  return e;
}
export {
  pe as A,
  $ as B,
  Gn as C,
  w as D,
  T as E,
  Vt as F,
  q as G,
  F as H,
  Jn as I,
  C as J,
  fo as K,
  Kn as L,
  qn as M,
  S as N,
  tt as O,
  ke as P,
  Hn as Q,
  Qn as R,
  zn as S,
  Bn as T,
  Dn as U,
  Yn as V,
  et as W,
  An as X,
  $o as _,
  Nn as a,
  ni as b,
  ei as c,
  fn as d,
  ti as e,
  bo as f,
  Xe as g,
  oi as h,
  le as i,
  Un as j,
  Ln as k,
  De as l,
  Xn as m,
  Rn as n,
  Vn as o,
  Fn as p,
  Yt as q,
  Zn as r,
  y as s,
  Mn as t,
  En as u,
  Wn as v,
  In as w,
  ri as x,
  Ue as y,
  jn as z
};
//# sourceMappingURL=types-cXMhssjU.js.map
