import { hasInjectionContext as nr, inject as He, effectScope as rr, ref as F, markRaw as or, createApp as ir, onMounted as ct, onUnmounted as ar, watch as fe, readonly as sr, getCurrentInstance as vt, nextTick as lr, reactive as cr, renderSlot as K, openBlock as D, createBlock as Fe, Teleport as rn, createCommentVNode as be, useId as ur, mergeProps as O, h as dr, createElementBlock as ie, createElementVNode as we, resolveComponent as pr, resolveDirective as mr, Transition as fr, withCtx as hr, normalizeClass as gr, resolveDynamicComponent as vr, withDirectives as yr } from "vue";
import { addCollection as br } from "@iconify/vue";
import { config as yt, addIcons as wr, on as Sr, applyThemeMode as Ve, host as xr, hostCss as _r, loadCss as $r, loadByTagName as kr } from "@wippy-fe/proxy";
var Qe = "data-wippy-visible";
function bt(e) {
  const t = e.getAttribute(Qe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Cr = Object.defineProperty, Pr = (e, t, n) => t in e ? Cr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, T = (e, t, n) => Pr(e, typeof t != "symbol" ? t + "" : t, n), Tr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Or = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function wt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Er(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, s] of Object.entries(o)) {
            const a = typeof s == "string" ? wt(l) : null;
            a && t.add(a);
          }
          continue;
        }
        const i = typeof o == "string" ? wt(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Ar(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Or} {
${t}
}`;
}
function Lr(e, t) {
  const n = Ar(t);
  n && on(e, n, "@wippy-fe/css-variables-bridge");
}
function jr(e, t) {
  const r = (t ?? Tr).map(async (o) => {
    const i = _r[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await $r(i);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const l = document.createElement("style");
      l.textContent = i, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function Nr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function on(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Vr(e, t) {
  on(e, t, "@wippy-fe/custom-css");
}
function an(e) {
  return e.__wippyHost ?? null;
}
function Ir(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Rr(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Ye(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), s = Ir(o);
    if (l === null) {
      i.default !== void 0 && (n[s] = i.default);
      continue;
    }
    const a = Rr(o, l, i);
    a.error ? r.push(a.error) : n[s] = a.value;
  }
  return { props: n, errors: r };
}
var Dr = class {
  constructor(e, t) {
    T(this, "_props"), T(this, "_errors"), T(this, "_content"), T(this, "_hostVisibility"), T(this, "_propsListeners", /* @__PURE__ */ new Set()), T(this, "_contentListeners", /* @__PURE__ */ new Set()), T(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), T(this, "_disposed", !1), T(this, "_emitToDom"), T(this, "props"), T(this, "events"), T(this, "content"), T(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Mr = class extends HTMLElement {
  constructor() {
    super(), T(this, "_internals"), T(this, "_contentObserver", null), T(this, "_initialized", !1), T(this, "_container", null), T(this, "_reactive", null), T(this, "_lastProps", null), T(this, "_lastErrors", []), T(this, "_lastContent", null), T(this, "_themeUnsub", null), T(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = bt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Qe])];
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
    return an(this);
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
        const i = Ye(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Dr(
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
        this.onInit(n), e.inlineCss && Nr(n, e.inlineCss);
        try {
          const c = yt?.theming, u = Er(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Lr(n, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = yt?.theming, u = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            u && Vr(n, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && jr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, wr(br);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Sr("@theme", (a) => this._applyTheme(a)));
      const { props: o, errors: i } = Ye(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = i;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, i, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = xr.getThemeMode?.()) {
    Ve(e, this), this._container && Ve(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Ve("auto", this), this._container && Ve("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Qe) {
      const s = this._hostVisible, a = bt(this);
      if (a === s)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, s), this.onHostVisibilityChanged(a, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = Ye(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = i, this._reactive?.notifyProps(l, i), this.onPropsChanged(l, i);
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
function Fr(e) {
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
let sn;
const ln = (e) => sn = e, Br = () => nr() && He(cn) || sn, cn = (
  /* istanbul ignore next */
  Symbol()
);
function Ur() {
  const e = rr(!0), t = e.run(() => F({}));
  let n = [], r = [];
  const o = or({
    install(i) {
      ln(o), o._a = i, i.provide(cn, o), i.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
    },
    use(i) {
      return this._a ? n.push(i) : r.push(i), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Wr = Object.defineProperty, Hr = (e, t, n) => t in e ? Wr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, pe = (e, t, n) => Hr(e, typeof t != "symbol" ? t + "" : t, n), un = /* @__PURE__ */ Symbol("wippy:emit"), dn = /* @__PURE__ */ Symbol("wippy:props"), Kr = /* @__PURE__ */ Symbol("wippy:props_error"), Yr = /* @__PURE__ */ Symbol("wippy:content"), qr = /* @__PURE__ */ Symbol("wippy:panel-id"), Gr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Jr = /* @__PURE__ */ Symbol("wippy:host"), pn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function ja() {
  const e = He(dn);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Na() {
  const e = He(un);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Qr() {
  const e = He(pn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Va(e) {
  const t = Qr();
  let n = !1, r = null, o = !1;
  function i() {
    if (r)
      return o = !0, r;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (a) {
      l = Promise.reject(a);
    }
    const s = l.finally(() => {
      if (r === s && (r = null, n && o))
        return o = !1, i();
    });
    return r = s, s;
  }
  return ct(() => (n = !0, i())), ar(() => {
    n = !1, o = !1;
  }), fe(t, (l, s) => {
    if (n && s === !1 && l === !0)
      return i();
  }), t;
}
var Zr = class extends Mr {
  constructor() {
    super(...arguments), pe(this, "_vueApp", null), pe(this, "_propsRef", F({})), pe(this, "_errorsRef", F([])), pe(this, "_contentRef", F(null)), pe(this, "_hostVisibilityRef", F(null)), pe(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, i) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of r)
      this.emitEvent("invalid", { message: c });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((c, u) => {
      this._propsRef.value = c, this._errorsRef.value = [...u];
      for (const d of u)
        this.emitEvent("invalid", { message: d });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: s.signal });
    const a = (c) => {
      if (s.signal.aborted)
        return;
      const u = Br(), d = ir(c.rootComponent);
      this._vueApp = d;
      const p = Ur();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          p.use(m);
      if (d.use(p), c.plugins)
        for (const m of c.plugins)
          d.use(m);
      d.provide(dn, this._propsRef), d.provide(Kr, this._errorsRef), d.provide(un, this.emitEvent.bind(this)), d.provide(Yr, this._contentRef), d.provide(pn, this._hostVisibilityRef), d.provide(qr, zr(this)), d.provide(Gr, Fr(this)), d.provide(Jr, an(this)), c.providers && c.providers(d, this), d.mount(t), u && ln(u);
    };
    if (l.rootComponent)
      a(l);
    else if (l.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), l.lazyConfig().then((u) => {
        s.signal.aborted || (c.remove(), a(u));
      }).catch((u) => {
        if (s.signal.aborted)
          return;
        const d = u instanceof Error ? u.message : String(u), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", d), c.replaceWith(p), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Xr = Object.defineProperty, St = Object.getOwnPropertySymbols, eo = Object.prototype.hasOwnProperty, to = Object.prototype.propertyIsEnumerable, xt = (e, t, n) => t in e ? Xr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, no = (e, t) => {
  for (var n in t || (t = {})) eo.call(t, n) && xt(e, n, t[n]);
  if (St) for (var n of St(t)) to.call(t, n) && xt(e, n, t[n]);
  return e;
};
function je(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ze(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), i, l, s;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (i = l; i-- !== 0; ) if (!Ze(e[i], t[i], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let a = e instanceof Date, c = t instanceof Date;
  if (a != c) return !1;
  if (a && c) return e.getTime() == t.getTime();
  let u = e instanceof RegExp, d = t instanceof RegExp;
  if (u != d) return !1;
  if (u && d) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (l = p.length, l !== Object.keys(t).length) return !1;
  for (i = l; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[i])) return !1;
  for (i = l; i-- !== 0; ) if (s = p[i], !Ze(e[s], t[s], n)) return !1;
  return !0;
}
function ro(e, t) {
  return Ze(e, t);
}
function Ke(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function $(e) {
  return !je(e);
}
function Xe(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if ($(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ke(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, i = n.length; o < i; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function oo(e, t, n) {
  return n ? Xe(e, n) === Xe(t, n) : ro(e, t);
}
function U(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function mn(e = {}, t = {}) {
  let n = no({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    U(t[o]) && o in e && U(e[o]) ? n[o] = mn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function io(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : mn(t, n), {});
}
function Ia(e, t) {
  let n = -1;
  if ($(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function N(e, ...t) {
  return Ke(e) ? e(...t) : e;
}
function j(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function B(e) {
  return j(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function ut(e, t = "", n = {}) {
  let r = B(t).split("."), o = r.shift();
  if (o) {
    if (U(e)) {
      let i = Object.keys(e).find((l) => B(l) === o) || "";
      return ut(N(e[i], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function fn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ao(e) {
  return $(e) && !isNaN(e);
}
function Ra(e = "") {
  return $(e) && e.length === 1 && !!e.match(/\S| /);
}
function ae(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function so(...e) {
  return io(...e);
}
function Se(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function I(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function lo(e) {
  return j(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function hn(e) {
  return j(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function gn() {
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
function dt(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let i = Array.isArray(r) ? [dt(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        t = i.length ? t.concat(i.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function co(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function uo(e, t) {
  if (e && t) {
    let n = (r) => {
      co(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function qe(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function et(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function vn(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function yn() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, i = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: i };
}
function tt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function po() {
  let e = document.documentElement;
  return (window.pageXOffset || tt(e)) - (e.clientLeft || 0);
}
function mo() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function fo(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Da(e, t, n = !0) {
  var r, o, i, l;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : vn(e), a = s.height, c = s.width, u = t.offsetHeight, d = t.offsetWidth, p = t.getBoundingClientRect(), m = mo(), f = po(), v = yn(), g, y, w = "top";
    p.top + u + a > v.height ? (g = p.top + m - a, w = "bottom", g < 0 && (g = m)) : g = u + p.top + m, p.left + c > v.width ? y = Math.max(0, p.left + f + d - c) : y = p.left + f, fo(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = w, n && (e.style.marginTop = w === "bottom" ? `calc(${(o = (r = et(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (l = (i = et(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? l : "");
  }
}
function Ma(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function ho(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Fa(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : vn(e), l = t.offsetHeight, s = t.getBoundingClientRect(), a = yn(), c, u, d = r ?? "top";
    if (!r && s.top + l + i.height > a.height ? (c = -1 * i.height, d = "bottom", s.top + c < 0 && (c = -1 * s.top)) : c = l, i.width > a.width ? u = s.left * -1 : s.left + i.width > a.width ? u = (s.left + i.width - a.width) * -1 : u = 0, e.style.top = c + "px", e.style.insetInlineStart = u + "px", e.style.transformOrigin = d, n) {
      let p = (o = et(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = d === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function bn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function go(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && bn(e));
}
function ge(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function za() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function ze(e, t = {}) {
  if (ge(e)) {
    let n = (r, o) => {
      var i, l;
      let s = (i = e?.$attrs) != null && i[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((a, c) => {
        if (c != null) {
          let u = typeof c;
          if (u === "string" || u === "number") a.push(c);
          else if (u === "object") {
            let d = Array.isArray(c) ? n(r, c) : Object.entries(c).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            a = d.length ? a.concat(d.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? ze(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function vo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return ze(r, t), r.append(...n), r;
  }
}
function yo(e, t) {
  return ge(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function wn(e, t) {
  return ge(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ba(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function bo(e, t) {
  if (ge(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Sn(e, t = "") {
  let n = yo(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Ua(e, t) {
  let n = Sn(e, t);
  return n.length > 0 ? n[0] : null;
}
function _t(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Wa(e, t) {
  let n = Sn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function wo(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || tt(document.documentElement) || tt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function So(e, t) {
  return e ? e.offsetHeight : 0;
}
function xn(e, t = []) {
  let n = bn(e);
  return n === null ? t : xn(n, t.concat([n]));
}
function Ha(e) {
  let t = [];
  if (e) {
    let n = xn(e), r = /(auto|scroll)/, o = (i) => {
      try {
        let l = window.getComputedStyle(i, null);
        return r.test(l.getPropertyValue("overflow")) || r.test(l.getPropertyValue("overflowX")) || r.test(l.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let l = i.nodeType === 1 && i.dataset.scrollselectors;
      if (l) {
        let s = l.split(",");
        for (let a of s) {
          let c = wn(i, a);
          c && o(c) && t.push(c);
        }
      }
      i.nodeType !== 9 && o(i) && t.push(i);
    }
  }
  return t;
}
function Ka() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function $t(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Ya() {
  return /(android)/i.test(navigator.userAgent);
}
function _n() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function qa(e) {
  return !!(e && e.offsetParent != null);
}
function Ga() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function xo(e, t = "", n) {
  ge(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ie = {};
function _o(e = "pui_id_") {
  return Object.hasOwn(Ie, e) || (Ie[e] = 0), Ie[e]++, `${e}${Ie[e]}`;
}
var $o = Object.defineProperty, ko = Object.defineProperties, Co = Object.getOwnPropertyDescriptors, Be = Object.getOwnPropertySymbols, $n = Object.prototype.hasOwnProperty, kn = Object.prototype.propertyIsEnumerable, kt = (e, t, n) => t in e ? $o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, M = (e, t) => {
  for (var n in t || (t = {})) $n.call(t, n) && kt(e, n, t[n]);
  if (Be) for (var n of Be(t)) kn.call(t, n) && kt(e, n, t[n]);
  return e;
}, Ge = (e, t) => ko(e, Co(t)), H = (e, t) => {
  var n = {};
  for (var r in e) $n.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Be) for (var r of Be(e)) t.indexOf(r) < 0 && kn.call(e, r) && (n[r] = e[r]);
  return n;
}, Po = gn(), A = Po, _e = /{([^}]*)}/g, Cn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Pn = /var\([^)]+\)/g;
function Ct(e) {
  return j(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function To(e) {
  return U(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Oo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function nt(e = "", t = "") {
  return Oo(`${j(e, !1) && j(t, !1) ? `${e}-` : e}${t}`);
}
function Tn(e = "", t = "") {
  return `--${nt(e, t)}`;
}
function Eo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function On(e, t = "", n = "", r = [], o) {
  if (j(e)) {
    let i = e.trim();
    if (Eo(i)) return;
    if (ae(i, _e)) {
      let l = i.replaceAll(_e, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((c) => !r.some((u) => ae(c, u)));
        return `var(${Tn(n, hn(a.join("-")))}${$(o) ? `, ${o}` : ""})`;
      });
      return ae(l.replace(Pn, "0"), Cn) ? `calc(${l})` : l;
    }
    return i;
  } else if (ao(e)) return e;
}
function Ao(e, t, n) {
  j(t, !1) && e.push(`${t}:${n};`);
}
function me(e, t) {
  return e ? `${e}{${t}}` : "";
}
function En(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, s) {
    let a = [], c = 0, u = "", d = null, p = 0;
    for (; c <= l.length; ) {
      let m = l[c];
      if ((m === '"' || m === "'" || m === "`") && l[c - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && p++, m === ")" && p--, (m === "," || c === l.length) && p === 0)) {
        let f = u.trim();
        f.startsWith("dt(") ? a.push(En(f, s)) : a.push(r(f)), u = "", c++;
        continue;
      }
      m !== void 0 && (u += m), c++;
    }
    return a;
  }
  function r(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let a = Number(l);
    return isNaN(a) ? l : a;
  }
  let o = [], i = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") i.push(l), l += 2;
  else if (e[l] === ")" && i.length > 0) {
    let s = i.pop();
    i.length === 0 && o.push([s, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, a] = o[l], c = e.slice(s + 3, a), u = n(c, t), d = t(...u);
    e = e.slice(0, s) + d + e.slice(a + 1);
  }
  return e;
}
var se = (...e) => Lo(k.getTheme(), ...e), Lo = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = k.defaults || {}, { prefix: l, transform: s } = e?.options || i || {}, a = ae(t, _e) ? t : `{${t}}`;
    return r === "value" || je(r) && s === "strict" ? k.getTokenValue(t) : On(a, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function Re(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var l;
      return r + o + ((l = N(t[i], { dt: se })) != null ? l : "");
    }, "");
    return En(n, se);
  }
  return N(e, { dt: se });
}
function jo(e, t = {}) {
  let n = k.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, l = [], s = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: u, path: d } = a.pop();
    for (let p in u) {
      let m = u[p], f = To(m), v = ae(p, i) ? nt(d) : nt(d, hn(p));
      if (U(f)) a.push({ node: f, path: v });
      else {
        let g = Tn(v), y = On(f, v, r, [i]);
        Ao(s, g, y);
        let w = v;
        r && w.startsWith(r + "-") && (w = w.slice(r.length + 1)), l.push(w.replace(/-/g, "."));
      }
    }
  }
  let c = s.join("");
  return { value: s, tokens: l, declarations: c, css: me(o, c) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return jo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l, s, a, c, u, d;
  let { preset: p, options: m } = t, f, v, g, y, w, C, h;
  if ($(p) && m.transform !== "strict") {
    let { primitive: S, semantic: E, extend: V } = p, Y = E || {}, { colorScheme: q } = Y, X = H(Y, ["colorScheme"]), G = V || {}, { colorScheme: ee } = G, te = H(G, ["colorScheme"]), J = q || {}, { dark: ne } = J, le = H(J, ["dark"]), re = ee || {}, { dark: ce } = re, ue = H(re, ["dark"]), W = $(S) ? this._toVariables({ primitive: S }, m) : {}, z = $(X) ? this._toVariables({ semantic: X }, m) : {}, oe = $(le) ? this._toVariables({ light: le }, m) : {}, Ne = $(ne) ? this._toVariables({ dark: ne }, m) : {}, de = $(te) ? this._toVariables({ semantic: te }, m) : {}, ht = $(ue) ? this._toVariables({ light: ue }, m) : {}, gt = $(ce) ? this._toVariables({ dark: ce }, m) : {}, [Dn, Mn] = [(i = W.declarations) != null ? i : "", W.tokens], [Fn, zn] = [(l = z.declarations) != null ? l : "", z.tokens || []], [Bn, Un] = [(s = oe.declarations) != null ? s : "", oe.tokens || []], [Wn, Hn] = [(a = Ne.declarations) != null ? a : "", Ne.tokens || []], [Kn, Yn] = [(c = de.declarations) != null ? c : "", de.tokens || []], [qn, Gn] = [(u = ht.declarations) != null ? u : "", ht.tokens || []], [Jn, Qn] = [(d = gt.declarations) != null ? d : "", gt.tokens || []];
    f = this.transformCSS(e, Dn, "light", "variable", m, r, o), v = Mn;
    let Zn = this.transformCSS(e, `${Fn}${Bn}`, "light", "variable", m, r, o), Xn = this.transformCSS(e, `${Wn}`, "dark", "variable", m, r, o);
    g = `${Zn}${Xn}`, y = [.../* @__PURE__ */ new Set([...zn, ...Un, ...Hn])];
    let er = this.transformCSS(e, `${Kn}${qn}color-scheme:light`, "light", "variable", m, r, o), tr = this.transformCSS(e, `${Jn}color-scheme:dark`, "dark", "variable", m, r, o);
    w = `${er}${tr}`, C = [.../* @__PURE__ */ new Set([...Yn, ...Gn, ...Qn])], h = N(p.css, { dt: se });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: w, tokens: C }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: l }) {
  var s, a, c;
  let u, d, p;
  if ($(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), f = t, { colorScheme: v, extend: g, css: y } = f, w = H(f, ["colorScheme", "extend", "css"]), C = g || {}, { colorScheme: h } = C, S = H(C, ["colorScheme"]), E = v || {}, { dark: V } = E, Y = H(E, ["dark"]), q = h || {}, { dark: X } = q, G = H(q, ["dark"]), ee = $(w) ? this._toVariables({ [m]: M(M({}, w), S) }, n) : {}, te = $(Y) ? this._toVariables({ [m]: M(M({}, Y), G) }, n) : {}, J = $(V) ? this._toVariables({ [m]: M(M({}, V), X) }, n) : {}, [ne, le] = [(s = ee.declarations) != null ? s : "", ee.tokens || []], [re, ce] = [(a = te.declarations) != null ? a : "", te.tokens || []], [ue, W] = [(c = J.declarations) != null ? c : "", J.tokens || []], z = this.transformCSS(m, `${ne}${re}`, "light", "variable", n, o, i, l), oe = this.transformCSS(m, ue, "dark", "variable", n, o, i, l);
    u = `${z}${oe}`, d = [.../* @__PURE__ */ new Set([...le, ...ce, ...W])], p = N(y, { dt: se });
  }
  return { css: u, tokens: d, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: l, options: s } = t, a = (i = l?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: a, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l;
  let s = e.replace("-directive", ""), { preset: a, options: c } = t, u = ((i = a?.components) == null ? void 0 : i[s]) || ((l = a?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: u, options: c, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), s = Object.entries(r).reduce((a, [c, u]) => a.push(`${c}="${u}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [c, u]) => {
    if (U(u) && Object.hasOwn(u, "css")) {
      let d = Se(u.css), p = `${c}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${d}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var l;
  let s = { name: e, theme: t, params: n, set: o, defaults: i }, a = (l = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, c = Object.entries(r).reduce((u, [d, p]) => u.push(`${d}="${p}"`) && u, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Se(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(s, a = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    c.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let u = this.value;
    if (typeof this.value == "string" && _e.test(this.value)) {
      let d = this.value.trim().replace(_e, (p) => {
        var m;
        let f = p.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let g = v.computed(s, a, c);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (m = g?.value) != null ? m : "__UNRESOLVED__";
      });
      u = Cn.test(d.replace(Pn, "0")) ? `calc(${d})` : d;
    }
    return je(a.binding) && delete a.binding, c.pop(), { colorScheme: s, path: this.path, paths: a, value: u.includes("__UNRESOLVED__") ? void 0 : u };
  }, l = (s, a, c) => {
    Object.entries(s).forEach(([u, d]) => {
      let p = ae(u, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Ct(u)}` : Ct(u), m = c ? `${c}.${u}` : u;
      U(d) ? l(d, p, m) : (o[p] || (o[p] = { paths: [], computed: (f, v = {}, g = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, v.binding, g);
        if (f && f !== "none") for (let y = 0; y < o[p].paths.length; y++) {
          let w = o[p].paths[y];
          if (w.scheme === f) return w.computed(f, v.binding, g);
        }
        return o[p].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), o[p].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((a) => !ae(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, a) => {
    let c = a, { colorScheme: u } = c, d = H(c, ["colorScheme"]);
    return s[u] = d, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? me($(t) ? `${e}${t},${e} ${t}` : e, r) : me(e, me(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, l, s) {
  if ($(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let c = this.getColorSchemeOption(o, l);
      t = n === "dark" ? c.reduce((u, { type: d, selector: p }) => ($(p) && (u += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, d, t)), u), "") : me(s ?? ":root,:host", t);
    }
    if (a) {
      let c = { name: "primeui" };
      U(a) && (c.name = N(a.name, { name: e, type: r })), $(c.name) && (t = me(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, k = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ge(M({}, t), { options: M(M({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Ge(M({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), A.emit("preset:change", e), A.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ge(M({}, this.theme), { options: e }), this.clearLoadedStyleNames(), A.emit("options:change", e), A.emit("theme:change", this.theme);
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
  this._loadingStyles.size && (this._loadingStyles.delete(t), A.emit(`theme:${t}:load`, e), !this._loadingStyles.size && A.emit("theme:load"));
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
function Pt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = No(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, l = !0, s = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var c = n.next();
    return l = c.done, c;
  }, e: function(c) {
    s = !0, i = c;
  }, f: function() {
    try {
      l || n.return == null || n.return();
    } finally {
      if (s) throw i;
    }
  } };
}
function No(e, t) {
  if (e) {
    if (typeof e == "string") return Tt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(e, t) : void 0;
  }
}
function Tt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ja = {
  filter: function(t, n, r, o, i) {
    var l = [];
    if (!t)
      return l;
    var s = Pt(t), a;
    try {
      for (s.s(); !(a = s.n()).done; ) {
        var c = a.value;
        if (typeof c == "string") {
          if (this.filters[o](c, r, i)) {
            l.push(c);
            continue;
          }
        } else {
          var u = Pt(n), d;
          try {
            for (u.s(); !(d = u.n()).done; ) {
              var p = d.value, m = Xe(c, p);
              if (this.filters[o](m, r, i)) {
                l.push(c);
                break;
              }
            }
          } catch (f) {
            u.e(f);
          } finally {
            u.f();
          }
        }
      }
    } catch (f) {
      s.e(f);
    } finally {
      s.f();
    }
    return l;
  },
  filters: {
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : I(t.toString()).toLocaleLowerCase(r) == I(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : I(t.toString()).toLocaleLowerCase(r) != I(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (oo(t, n[r]))
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
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function Ot(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Et(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Io(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Io(e, t, n) {
  return (t = Ro(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ro(e) {
  var t = Do(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function Do(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Mo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  vt() && vt().components ? ct(e) : t ? e() : lr(e);
}
var Fo = 0;
function zo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(e), o = F(null), i = _n() ? window.document : void 0, l = t.document, s = l === void 0 ? i : l, a = t.immediate, c = a === void 0 ? !0 : a, u = t.manual, d = u === void 0 ? !1 : u, p = t.name, m = p === void 0 ? "style_".concat(++Fo) : p, f = t.id, v = f === void 0 ? void 0 : f, g = t.media, y = g === void 0 ? void 0 : g, w = t.nonce, C = w === void 0 ? void 0 : w, h = t.first, S = h === void 0 ? !1 : h, E = t.onMounted, V = E === void 0 ? void 0 : E, Y = t.onUpdated, q = Y === void 0 ? void 0 : Y, X = t.onLoad, G = X === void 0 ? void 0 : X, ee = t.props, te = ee === void 0 ? {} : ee, J = function() {
  }, ne = function(ce) {
    var ue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var W = Et(Et({}, te), ue), z = W.name || m, oe = W.id || v, Ne = W.nonce || C;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(z, '"]')) || s.getElementById(oe) || s.createElement("style"), o.value.isConnected || (r.value = ce || e, ze(o.value, {
        type: "text/css",
        id: oe,
        media: y,
        nonce: Ne
      }), S ? s.head.prepend(o.value) : s.head.appendChild(o.value), xo(o.value, "data-primevue-style-id", z), ze(o.value, W), o.value.onload = function(de) {
        return G?.(de, {
          name: z
        });
      }, V?.(z)), !n.value && (J = fe(r, function(de) {
        o.value.textContent = de, q?.(z);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, le = function() {
    !s || !n.value || (J(), go(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return c && !d && Mo(ne), {
    id: v,
    name: m,
    el: o,
    css: r,
    unload: le,
    load: ne,
    isLoaded: sr(n)
  };
}
function ke(e) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ke(e);
}
var At, Lt, jt, Nt;
function Vt(e, t) {
  return Ho(e) || Wo(e, t) || Uo(e, t) || Bo();
}
function Bo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Uo(e, t) {
  if (e) {
    if (typeof e == "string") return It(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(e, t) : void 0;
  }
}
function It(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Wo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function Ho(e) {
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
function Je(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(n), !0).forEach(function(r) {
      Ko(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ko(e, t, n) {
  return (t = Yo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Yo(e) {
  var t = qo(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function qo(e, t) {
  if (ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ke(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function De(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Go = function(t) {
  var n = t.dt;
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
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, Jo = {}, Qo = {}, P = {
  name: "base",
  css: Go,
  style: Vo,
  classes: Jo,
  inlineStyles: Qo,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(Re(At || (At = De(["", ""])), t));
    return $(o) ? zo(Se(o), Je({
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
      return k.transformCSS(n.name || t.name, "".concat(o).concat(Re(Lt || (Lt = De(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return k.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return k.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return k.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return k.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return k.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: se
      }) || "", o = Se(Re(jt || (jt = De(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(l, s) {
        var a = Vt(s, 2), c = a[0], u = a[1];
        return l.push("".concat(c, '="').concat(u, '"')) && l;
      }, []).join(" ");
      return $(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return k.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [k.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Re(Nt || (Nt = De(["", ""])), N(this.style, {
        dt: se
      })), l = Se(k.transformCSS(o, i)), s = Object.entries(n).reduce(function(a, c) {
        var u = Vt(c, 2), d = u[0], p = u[1];
        return a.push("".concat(d, '="').concat(p, '"')) && a;
      }, []).join(" ");
      $(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Je(Je({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Z = gn();
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function Dt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Me(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Dt(Object(n), !0).forEach(function(r) {
      Zo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Dt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Zo(e, t, n) {
  return (t = Xo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xo(e) {
  var t = ei(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function ei(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ti = {
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
}, ni = Symbol();
function ri(e, t) {
  var n = {
    config: cr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ni, n), oi(), ii(e, n), n;
}
var he = [];
function oi() {
  A.clear(), he.forEach(function(e) {
    return e?.();
  }), he = [];
}
function ii(e, t) {
  var n = F(!1), r = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !k.isStyleNameLoaded("common")) {
      var u, d, p = ((u = P.getCommonTheme) === null || u === void 0 ? void 0 : u.call(P)) || {}, m = p.primitive, f = p.semantic, v = p.global, g = p.style, y = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      P.load(m?.css, Me({
        name: "primitive-variables"
      }, y)), P.load(f?.css, Me({
        name: "semantic-variables"
      }, y)), P.load(v?.css, Me({
        name: "global-variables"
      }, y)), P.loadStyle(Me({
        name: "global-style"
      }, y), g), k.setLoadedStyleName("common");
    }
  };
  A.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = fe(t.config, function(a, c) {
    Z.emit("config:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = fe(function() {
    return t.config.ripple;
  }, function(a, c) {
    Z.emit("config:ripple:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = fe(function() {
    return t.config.theme;
  }, function(a, c) {
    n.value || k.setTheme(a), t.config.unstyled || r(), n.value = !1, Z.emit("config:theme:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = fe(function() {
    return t.config.unstyled;
  }, function(a, c) {
    !a && t.config.theme && r(), Z.emit("config:unstyled:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  he.push(o), he.push(i), he.push(l), he.push(s);
}
var ai = {
  install: function(t, n) {
    var r = so(ti, n);
    ri(t, r);
  }
}, An = {
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
    this.mounted = _n();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function si(e, t, n, r, o, i) {
  return i.inline ? K(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (D(), Fe(rn, {
    key: 1,
    to: n.appendTo
  }, [K(e.$slots, "default")], 8, ["to"])) : be("", !0);
}
An.render = si;
var Q = {
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
function li() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = ur();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Mt = P.extend({
  name: "common"
});
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function ci(e) {
  return Nn(e) || ui(e) || jn(e) || Ln();
}
function ui(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ve(e, t) {
  return Nn(e) || di(e, t) || jn(e, t) || Ln();
}
function Ln() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jn(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function di(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function Nn(e) {
  if (Array.isArray(e)) return e;
}
function Ft(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function x(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ft(Object(n), !0).forEach(function(r) {
      ye(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ft(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ye(e, t, n) {
  return (t = pi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pi(e) {
  var t = mi(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function mi(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Pe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var pt = {
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
        A.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        A.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, i, l, s, a, c, u, d, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var v = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, g = v ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, y = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (u = y || g) === null || u === void 0 || (u = u[this.$.type.name]) === null || u === void 0 || (u = u.hooks) === null || u === void 0 || (d = u.onBeforeCreate) === null || d === void 0 || d.call(u), this.$attrSelector = li(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = wn(ge(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = x({
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
      return Ke(t) ? t.apply(void 0, r) : O.apply(void 0, r);
    },
    _load: function() {
      Q.isStyleNameLoaded("base") || (P.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Q.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Q.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Mt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Q.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      $(t) && P.load(t, x({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!k.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = i.primitive, s = i.semantic, a = i.global, c = i.style;
          P.load(l?.css, x({
            name: "primitive-variables"
          }, this.$styleOptions)), P.load(s?.css, x({
            name: "semantic-variables"
          }, this.$styleOptions)), P.load(a?.css, x({
            name: "global-variables"
          }, this.$styleOptions)), P.loadStyle(x({
            name: "global-style"
          }, this.$styleOptions), c), k.setLoadedStyleName("common");
        }
        if (!k.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var u, d, p, m, f = ((u = this.$style) === null || u === void 0 || (d = u.getComponentTheme) === null || d === void 0 ? void 0 : d.call(u)) || {}, v = f.css, g = f.style;
          (p = this.$style) === null || p === void 0 || p.load(v, x({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(x({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), k.setLoadedStyleName(this.$style.name);
        }
        if (!k.isStyleNameLoaded("layer-order")) {
          var y, w, C = (y = this.$style) === null || y === void 0 || (w = y.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(y);
          P.load(C, x({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), k.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, x({
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
      Q.clearLoadedStyleNames(), A.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      A.off("theme:change", this._loadCoreStyles), A.off("theme:change", this._load), A.off("theme:change", this._themeScopedListener);
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
      return ut(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = s.mergeSections, c = a === void 0 ? !0 : a, u = s.mergeProps, d = u === void 0 ? !1 : u, p = i ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, x(x({}, o), {}, {
        global: p || {}
      })), f = this._getPTDatasets(r);
      return c || !c && m ? d ? this._mergeProps(d, p, m, f) : x(x(x({}, p), m), f) : x(x({}, m), f);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return O(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && $((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && x(x({}, r === "root" && x(x(ye({}, "".concat(o, "name"), B(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && ye({}, "".concat(o, "extend"), B(this.$.type.name))), {}, ye({}, "".concat(this.$attrSelector), ""))), {}, ye({}, "".concat(o, "section"), B(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return j(t) || fn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var a, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, u = o ? o(s) : s, d = B(r), p = B(n.$name);
        return (a = c ? d !== p ? u?.[d] : void 0 : u?.[d]) !== null && a !== void 0 ? a : u;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(v) {
        return n(v, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, s = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = s.mergeSections, c = a === void 0 ? !0 : a, u = s.mergeProps, d = u === void 0 ? !1 : u, p = i(t.originalValue), m = i(t.value);
        return p === void 0 && m === void 0 ? void 0 : j(m) ? m : j(p) ? p : c || !c && m ? d ? this._mergeProps(d, p, m) : x(x({}, p), m) : m;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, x(x({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = O(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, x({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, x(x({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, x(x({}, this.$params), r)), i = this._getOptionValue(Mt.inlineStyles, t, x(x({}, this.$params), r));
        return [i, o];
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
        return n._getOptionValue(r, n.$name, x({}, n.$params)) || N(r, x({}, n.$params));
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
        var o = ve(r, 1), i = o[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return x(x({
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
        var n = ve(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = ve(n, 2), o = r[0], i = r[1], l = o.split(":"), s = ci(l), a = rt(s).slice(1);
        return a?.reduce(function(c, u, d, p) {
          return !c[u] && (c[u] = d === p.length - 1 ? i : {}), c[u];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ve(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = ve(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, fi = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, hi = P.extend({
  name: "baseicon",
  css: fi
});
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function zt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Bt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zt(Object(n), !0).forEach(function(r) {
      gi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function gi(e, t, n) {
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vi(e) {
  var t = yi(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function yi(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bi = {
  name: "BaseIcon",
  extends: pt,
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
  style: hi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = je(this.label);
      return Bt(Bt({}, !this.isUnstyled && {
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
function Oe(e) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Oe(e);
}
function Ut(e, t) {
  return _i(e) || xi(e, t) || Si(e, t) || wi();
}
function wi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Si(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function xi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (u) {
      c = !0, o = u;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function _i(e) {
  if (Array.isArray(e)) return e;
}
function Ht(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ht(Object(n), !0).forEach(function(r) {
      ot(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ht(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ot(e, t, n) {
  return (t = $i(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $i(e) {
  var t = ki(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function ki(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Oe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var b = {
  _getMeta: function() {
    return [U(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(U(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: ut,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var w = b._getOptionValue.apply(b, arguments);
      return j(w) || fn(w) ? {
        class: w
      } : w;
    }, c = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, u = c.mergeSections, d = u === void 0 ? !0 : u, p = c.mergeProps, m = p === void 0 ? !1 : p, f = s ? b._useDefaultPT(r, r.defaultPT(), a, i, l) : void 0, v = b._usePT(r, b._getPT(o, r.$name), a, i, _(_({}, l), {}, {
      global: f || {}
    })), g = b._getPTDatasets(r, i);
    return d || !d && v ? m ? b._mergeProps(r, m, f, v, g) : _(_(_({}, f), v), g) : _(_({}, v), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return _(_({}, n === "root" && ot({}, "".concat(r, "name"), B(t.$name))), {}, ot({}, "".concat(r, "section"), B(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, a = r ? r(l) : l, c = B(n);
      return (s = a?.[c]) !== null && s !== void 0 ? s : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(g) {
      return r(g, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, a = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, c = a.mergeSections, u = c === void 0 ? !0 : c, d = a.mergeProps, p = d === void 0 ? !1 : d, m = l(n.originalValue), f = l(n.value);
      return m === void 0 && f === void 0 ? void 0 : j(f) ? f : j(m) ? m : u || !u && f ? p ? b._mergeProps(t, p, m, f) : _(_({}, m), f) : f;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = b._getConfig(r, o), l = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    b._loadCoreStyles(n, l), b._loadThemeStyles(n, l), b._loadScopedThemeStyles(n, l), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, l);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Q.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      P.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), Q.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!k.isStyleNameLoaded("common")) {
        var l, s, a = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, c = a.primitive, u = a.semantic, d = a.global, p = a.style;
        P.load(c?.css, _({
          name: "primitive-variables"
        }, i)), P.load(u?.css, _({
          name: "semantic-variables"
        }, i)), P.load(d?.css, _({
          name: "global-variables"
        }, i)), P.loadStyle(_({
          name: "global-style"
        }, i), p), k.setLoadedStyleName("common");
      }
      if (!k.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, f, v, g, y = ((m = o.$style) === null || m === void 0 || (f = m.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(m)) || {}, w = y.css, C = y.style;
        (v = o.$style) === null || v === void 0 || v.load(w, _({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (g = o.$style) === null || g === void 0 || g.loadStyle(_({
          name: "".concat(o.$style.name, "-style")
        }, i), C), k.setLoadedStyleName(o.$style.name);
      }
      if (!k.isStyleNameLoaded("layer-order")) {
        var h, S, E = (h = o.$style) === null || h === void 0 || (S = h.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(h);
        P.load(E, _({
          name: "layer-order",
          first: !0
        }, i)), k.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, l, s = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, a = s.css, c = (l = t.$style) === null || l === void 0 ? void 0 : l.load(a, _({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Q.clearLoadedStyleNames(), A.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    A.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, l) {
    var s, a, c = "on".concat(lo(n)), u = b._getConfig(o, i), d = r?.$instance, p = b._usePT(d, b._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, t), b._getOptionValue, "hooks.".concat(c)), m = b._useDefaultPT(d, u == null || (a = u.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], b._getOptionValue, "hooks.".concat(c)), f = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: l
    };
    p?.(d, f), m?.(d, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ke(t) ? t.apply(void 0, r) : O.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, a, c, u, d) {
      var p, m, f, v;
      a._$instances = a._$instances || {};
      var g = b._getConfig(c, u), y = a._$instances[t] || {}, w = je(y) ? _(_({}, n), n?.methods) : {};
      a._$instances[t] = _(_({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: y.$el || a || void 0,
        $style: _({
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
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(g?.pt, void 0, function(h) {
            var S;
            return h == null || (S = h.directives) === null || S === void 0 ? void 0 : S[t];
          });
        },
        isUnstyled: function() {
          var h, S;
          return ((h = a._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (S = a._$instances[t]) === null || S === void 0 || (S = S.$binding) === null || S === void 0 || (S = S.value) === null || S === void 0 ? void 0 : S.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = a._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = a._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(a._$instances[t], (h = a._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, S, _({}, E));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(a._$instances[t], h, S, E, !1);
        },
        cx: function() {
          var h, S, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = a._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : b._getOptionValue((S = a._$instances[t]) === null || S === void 0 || (S = S.$style) === null || S === void 0 ? void 0 : S.classes, E, _({}, V));
        },
        sx: function() {
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, V = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return E ? b._getOptionValue((h = a._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, S, _({}, V)) : void 0;
        }
      }, w), a.$instance = a._$instances[t], (m = (f = a.$instance)[s]) === null || m === void 0 || m.call(f, a, c, u, d), a["$".concat(t)] = a.$instance, b._hook(t, s, a, c, u, d), a.$pd || (a.$pd = {}), a.$pd[t] = _(_({}, (v = a.$pd) === null || v === void 0 ? void 0 : v[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, o = function(s) {
      var a, c, u, d = s._$instances[t], p = d?.watch, m = function(g) {
        var y, w = g.newValue, C = g.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(d, w, C);
      }, f = function(g) {
        var y, w = g.newValue, C = g.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, w, C);
      };
      d.$watchersCallback = {
        config: m,
        "config.ripple": f
      }, p == null || (a = p.config) === null || a === void 0 || a.call(d, d?.$primevueConfig), Z.on("config:change", m), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(d, d == null || (u = d.$primevueConfig) === null || u === void 0 ? void 0 : u.ripple), Z.on("config:ripple:change", f);
    }, i = function(s) {
      var a = s._$instances[t].$watchersCallback;
      a && (Z.off("config:change", a.config), Z.off("config:ripple:change", a["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, c, u) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: _o("pd")
        }, r("created", s, a, c, u);
      },
      beforeMount: function(s, a, c, u) {
        var d;
        b._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, c), r("beforeMount", s, a, c, u), o(s);
      },
      mounted: function(s, a, c, u) {
        var d;
        b._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, c), r("mounted", s, a, c, u);
      },
      beforeUpdate: function(s, a, c, u) {
        r("beforeUpdate", s, a, c, u);
      },
      updated: function(s, a, c, u) {
        var d;
        b._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, c), r("updated", s, a, c, u);
      },
      beforeUnmount: function(s, a, c, u) {
        var d;
        i(s), b._removeThemeListeners((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", s, a, c, u);
      },
      unmounted: function(s, a, c, u) {
        var d;
        (d = s.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", s, a, c, u);
      }
    };
  },
  extend: function() {
    var t = b._getMeta.apply(b, arguments), n = Ut(t, 2), r = n[0], o = n[1];
    return _({
      extend: function() {
        var l = b._getMeta.apply(b, arguments), s = Ut(l, 2), a = s[0], c = s[1];
        return b.extend(a, _(_(_({}, o), o?.methods), c));
      }
    }, b._extend(r, o));
  }
}, Ci = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, Pi = {
  root: "p-ink"
}, Ti = P.extend({
  name: "ripple-directive",
  style: Ci,
  classes: Pi
}), Oi = b.extend({
  style: Ti
});
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function Ei(e) {
  return Ni(e) || ji(e) || Li(e) || Ai();
}
function Ai() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Li(e, t) {
  if (e) {
    if (typeof e == "string") return it(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? it(e, t) : void 0;
  }
}
function ji(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ni(e) {
  if (Array.isArray(e)) return it(e);
}
function it(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Kt(e, t, n) {
  return (t = Vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Vi(e) {
  var t = Ii(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function Ii(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ee(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ri = Oi.extend("ripple", {
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
      n || (n = vo("span", Kt(Kt({
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
        if (!this.isUnstyled() && qe(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !_t(o) && !$t(o)) {
          var i = Math.max(ho(r), So(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var l = wo(r), s = t.pageX - l.left + document.body.scrollTop - $t(o) / 2, a = t.pageY - l.top + document.body.scrollLeft - _t(o) / 2;
        o.style.top = a + "px", o.style.left = s + "px", !this.isUnstyled() && uo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && qe(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && qe(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ei(t.children).find(function(n) {
        return bo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Di = "data-wippy-overlay-layer";
function Vn() {
  return typeof window < "u" && typeof window.document < "u";
}
function In() {
  return Vn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Mi() {
  return In() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Fi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let zi = 0;
const Ue = /* @__PURE__ */ new WeakMap();
function Yt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Bi(e, t) {
  if (!Fi.test(e.className))
    return;
  const n = e.style.cssText;
  Yt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ue.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Yt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ue.set(e, r);
  }
}
function mt(e) {
  const t = Ue.get(e);
  t && (t.disconnect(), Ue.delete(e));
}
function Ui(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function at(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const We = /* @__PURE__ */ new Set(), ft = /* @__PURE__ */ new WeakMap();
let qt = !1, st = !1;
function Wi() {
  st = !1;
  for (const e of We) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && mt(t);
      We.delete(e), ft.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && at(e);
  }
}
function Gt() {
  st || (st = !0, requestAnimationFrame(Wi));
}
function Hi(e) {
  const t = document.createElement("div");
  t.setAttribute(Di, "");
  const n = In();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  at(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const l of o) {
      if (i)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && Bi(s, i);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && mt(s);
    }
    t.isConnected && t.childElementCount > 0 && at(t);
  });
  return r.observe(t, { childList: !0 }), ft.set(t, r), We.add(t), qt || (qt = !0, window.addEventListener("scroll", Gt, { capture: !0, passive: !0 }), window.addEventListener("resize", Gt, { passive: !0 })), t;
}
function Jt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Hi(e.hostRoot), Mi())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++zi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Qt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && mt(t);
    We.delete(e.layer), ft.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Zt = !1;
function Ki() {
  if (Zt)
    return;
  Zt = !0;
  const e = An;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Vn() && (this.hostRoot = Ui(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Jt(this), this.$watch("inline", (t) => {
      t ? Qt(this) : Jt(this);
    })));
  }, e.render = function() {
    return this.inline ? K(this.$slots, "default", { key: 0 }) : this.mounted ? dr(rn, { key: 1, to: this.resolvedTarget || document.body }, [
      K(this.$slots, "default")
    ]) : be("", !0);
  }, e.unmounted = function() {
    Qt(this);
  };
}
const Yi = {
  install: (e) => {
    Ki(), e.use(ai, { theme: "none" });
  }
}, qi = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:13px/1.45 var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.mm-stack{display:grid;gap:14px;align-content:start}.mm-field{display:grid;gap:6px}.mm-label{font-weight:600}.mm-hint{color:var(--p-text-muted-color);font-size:12px}.mm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}.mm-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.mm-confirm{margin-top:8px}.mm-page{height:100%;min-height:0;overflow-y:auto;padding:12px 24px 32px}.mm-error{margin:14px 0}.mm-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0}.mm-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:start}.mm-split.solo{grid-template-columns:minmax(0,1fr)}.mm-split>.mm-panel+.mm-panel{position:sticky;top:0}@media(max-width:860px){.mm-split{grid-template-columns:1fr}.mm-split>.mm-panel+.mm-panel{position:static}}.mm-panel{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);overflow:hidden}.mm-panel-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--p-content-border-color);font-weight:700}.mm-panel-b{padding:14px;display:grid;gap:10px}.mm-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;padding:11px 14px;border:none;border-bottom:1px solid var(--p-content-border-color);background:transparent;color:inherit;font:inherit;text-align:left}.mm-row:last-child{border-bottom:none}button.mm-row{cursor:pointer}button.mm-row:hover{background:var(--kx-overlay-hover)}.mm-row.on{background:var(--kx-wash-primary)}.mm-row-t{font-weight:600;overflow-wrap:anywhere}.mm-row-s{color:var(--p-text-muted-color);font-size:12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:3px}.mm-row-err{color:var(--p-danger-600, var(--p-danger-500))}.mm-dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px 12px;margin:0;font-size:12.5px}.mm-dl dt{color:var(--p-text-muted-color)}.mm-dl dd{margin:0;overflow-wrap:anywhere}.mm-h{font-size:12px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:4px 0 0}.mm-version{display:flex;gap:8px;align-items:baseline;font-size:12.5px}.mm-version.past{color:var(--p-text-muted-color)}.mm-conflict{display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--p-content-border-color)}.mm-conflict:last-child{border-bottom:none}.mm-option{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10)}';
function Qa(e, t) {
  return class extends Zr {
    static get wippyConfig() {
      return { propsSchema: t, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: qi };
    }
    static get vueConfig() {
      return { rootComponent: e, plugins: [Yi] };
    }
  };
}
var Rn = {
  name: "TimesIcon",
  extends: bi
};
function Gi(e) {
  return Xi(e) || Zi(e) || Qi(e) || Ji();
}
function Ji() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qi(e, t) {
  if (e) {
    if (typeof e == "string") return lt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? lt(e, t) : void 0;
  }
}
function Zi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Xi(e) {
  if (Array.isArray(e)) return lt(e);
}
function lt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ea(e, t, n, r, o, i) {
  return D(), ie("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Gi(t[0] || (t[0] = [we("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rn.render = ea;
var ta = {
  name: "BaseEditableHolder",
  extends: pt,
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, t)) || {};
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
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, n) {
      var r, o;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (o = this.formField).onChange) === null || r === void 0 || r.call(o, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find($);
    }
  },
  computed: {
    $filled: function() {
      return $(this.d_value);
    },
    $invalid: function() {
      var t, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
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
      var t, n;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var t, n;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, na = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, ra = {
  root: {
    position: "relative"
  }
}, oa = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, ia = P.extend({
  name: "toggleswitch",
  style: na,
  classes: oa,
  inlineStyles: ra
}), aa = {
  name: "BaseToggleSwitch",
  extends: ta,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: ia,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, sa = {
  name: "ToggleSwitch",
  extends: aa,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return dt({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, la = ["data-p-checked", "data-p-disabled", "data-p"], ca = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], ua = ["data-p"], da = ["data-p"];
function pa(e, t, n, r, o, i) {
  return D(), ie("div", O({
    class: e.cx("root"),
    style: e.sx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [we("input", O({
    id: e.inputId,
    type: "checkbox",
    role: "switch",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    checked: i.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-checked": i.checked,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, ca), we("div", O({
    class: e.cx("slider")
  }, i.getPTOptions("slider"), {
    "data-p": i.dataP
  }), [we("div", O({
    class: e.cx("handle")
  }, i.getPTOptions("handle"), {
    "data-p": i.dataP
  }), [K(e.$slots, "handle", {
    checked: i.checked
  })], 16, da)], 16, ua)], 16, la);
}
sa.render = pa;
var ma = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, fa = {
  root: function(t) {
    var n = t.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, ha = P.extend({
  name: "message",
  style: ma,
  classes: fa
}), ga = {
  name: "BaseMessage",
  extends: pt,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: ha,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function Xt(e, t, n) {
  return (t = va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function va(e) {
  var t = ya(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function ya(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ae(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ba = {
  name: "Message",
  extends: ga,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return dt(Xt(Xt({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Ri
  },
  components: {
    TimesIcon: Rn
  }
};
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function en(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function tn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? en(Object(n), !0).forEach(function(r) {
      wa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : en(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function wa(e, t, n) {
  return (t = Sa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Sa(e) {
  var t = xa(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function xa(e, t) {
  if (Le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Le(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _a = ["data-p"], $a = ["data-p"], ka = ["data-p"], Ca = ["aria-label", "data-p"], Pa = ["data-p"];
function Ta(e, t, n, r, o, i) {
  var l = pr("TimesIcon"), s = mr("ripple");
  return D(), Fe(fr, O({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: hr(function() {
      return [o.visible ? (D(), ie("div", O({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": i.dataP
      }, e.ptm("root")), [we("div", O({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? K(e.$slots, "container", {
        key: 0,
        closeCallback: i.close
      }) : (D(), ie("div", O({
        key: 1,
        class: e.cx("content"),
        "data-p": i.dataP
      }, e.ptm("content")), [K(e.$slots, "icon", {
        class: gr(e.cx("icon"))
      }, function() {
        return [(D(), Fe(vr(e.icon ? "span" : null), O({
          class: [e.cx("icon"), e.icon],
          "data-p": i.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (D(), ie("div", O({
        key: 0,
        class: e.cx("text"),
        "data-p": i.dataP
      }, e.ptm("text")), [K(e.$slots, "default")], 16, ka)) : be("", !0), e.closable ? yr((D(), ie("button", O({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": i.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(a) {
          return i.close(a);
        }),
        "data-p": i.dataP
      }, tn(tn({}, e.closeButtonProps), e.ptm("closeButton"))), [K(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (D(), ie("i", O({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, Pa)) : (D(), Fe(l, O({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ca)), [[s]]) : be("", !0)], 16, $a))], 16)], 16, _a)) : be("", !0)];
    }),
    _: 3
  }, 16);
}
ba.render = Ta;
const nn = {
  identity: "Identity",
  rule: "Rule",
  profile_slot: "Profile",
  fact: "Fact",
  preference: "Preference",
  skill: "Skill",
  lesson: "Lesson"
};
function xe(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function Oa(e) {
  if (xe(e)) {
    const t = e.response;
    if (xe(t) && xe(t.data) && typeof t.data.error == "string") return t.data.error;
    if (typeof e.message == "string") return e.message;
  }
  return String(e);
}
function Za(e = Object.keys(nn)) {
  return e.map((t) => ({ value: t, label: nn[t] }));
}
function Xa(e) {
  return e instanceof CustomEvent && xe(e.detail) ? e.detail : {};
}
function es(e) {
  if (typeof e == "string")
    try {
      e = JSON.parse(e);
    } catch {
      return {};
    }
  return xe(e) ? e : {};
}
function ts(e) {
  const t = F(!!customElements.get(e)), n = F("");
  return ct(async () => {
    if (!t.value)
      try {
        await kr(e, { timeoutMs: 8e3 }), t.value = !0;
      } catch (r) {
        n.value = Oa(r);
      }
  }), { ready: t, failed: n };
}
export {
  Ya as $,
  Ha as A,
  P as B,
  So as C,
  Da as D,
  Ua as E,
  Ja as F,
  Xe as G,
  ta as H,
  Fa as I,
  Ra as J,
  wo as K,
  Wa as L,
  Ia as M,
  Za as N,
  je as O,
  za as P,
  bo as Q,
  Ri as R,
  Ma as S,
  _t as T,
  Ka as U,
  fo as V,
  Ga as Y,
  Na as a,
  ts as b,
  sa as c,
  gn as d,
  Xa as e,
  pt as f,
  dt as g,
  Ba as h,
  xe as i,
  bi as j,
  oo as k,
  $t as l,
  Qa as m,
  Va as n,
  Oa as o,
  es as p,
  nn as q,
  qa as r,
  ba as s,
  Rn as t,
  ja as u,
  ho as v,
  An as w,
  $ as x,
  Sn as y,
  wn as z
};
//# sourceMappingURL=useWidget-Oapw5JdO.js.map
