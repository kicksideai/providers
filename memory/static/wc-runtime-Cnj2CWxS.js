import { hasInjectionContext as Ln, inject as Ve, effectScope as An, ref as H, markRaw as jn, createApp as Nn, onMounted as It, onUnmounted as Rn, watch as ue, readonly as Vn, getCurrentInstance as tt, nextTick as In, reactive as Dn, renderSlot as Le, openBlock as Mn, createBlock as Un, Teleport as Dt, createCommentVNode as Mt, useId as Wn, mergeProps as Ee, h as Hn } from "vue";
import { addCollection as Bn } from "@iconify/vue";
import { config as nt, addIcons as Fn, on as zn, applyThemeMode as Oe, host as Kn, hostCss as Yn, loadCss as Gn } from "@wippy-fe/proxy";
var He = "data-wippy-visible";
function rt(e) {
  const t = e.getAttribute(He);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var qn = Object.defineProperty, Qn = (e, t, n) => t in e ? qn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, x = (e, t, n) => Qn(e, typeof t != "symbol" ? t + "" : t, n), Jn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Zn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(",\n");
function ot(e) {
  const t = e.startsWith("--") ? e : "--".concat(e);
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Xn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, a] of Object.entries(o)) {
            const i = typeof a == "string" ? ot(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const s = typeof o == "string" ? ot(r) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function er(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => "  ".concat(n, ": inherit;")).join("\n");
  return "".concat(Zn, " {\n").concat(t, "\n}");
}
function tr(e, t) {
  const n = er(t);
  n && Ut(e, n, "@wippy-fe/css-variables-bridge");
}
function nr(e, t) {
  const r = (t ?? Jn).map(async (o) => {
    const s = Yn[o];
    if (!s)
      return console.warn('[wippy-fe/webcomponent-core] hostCss key "'.concat(o, '" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.')), null;
    try {
      return await Gn(s);
    } catch (l) {
      return console.warn('[wippy-fe/webcomponent-core] Failed to load hostCss "'.concat(o, '" (').concat(s, "):"), l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const l = document.createElement("style");
      l.textContent = s, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function rr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ut(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function or(e, t) {
  Ut(e, t, "@wippy-fe/custom-css");
}
function Wt(e) {
  return e.__wippyHost ?? null;
}
function ir(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function sr(e, t, n) {
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
function De(e, t) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), a = ir(o);
    if (l === null) {
      s.default !== void 0 && (n[a] = s.default);
      continue;
    }
    const i = sr(o, l, s);
    i.error ? r.push(i.error) : n[a] = i.value;
  }
  return { props: n, errors: r };
}
var ar = class {
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
}, lr = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = rt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, He])];
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
    return Wt(this);
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
        const s = De(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new ar(
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
        this.onInit(n), e.inlineCss && rr(n, e.inlineCss);
        try {
          const u = nt?.theming, c = Xn(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          tr(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = nt?.theming, c = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join("\n");
            c && or(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && nr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Fn(Bn);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = zn("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: s } = De(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = s;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, s, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Kn.getThemeMode?.()) {
    Oe(e, this), this._container && Oe(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Oe("auto", this), this._container && Oe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === He) {
      const a = this._hostVisible, i = rt(this);
      if (i === a)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, a), this.onHostVisibilityChanged(i, a));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = De(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = s, this._reactive?.notifyProps(l, s), this.onPropsChanged(l, s);
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
function ur(e) {
  return e.__wippyHostBus ?? null;
}
function cr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Ht;
const Bt = (e) => Ht = e, dr = () => Ln() && Ve(Ft) || Ht, Ft = (
  /* istanbul ignore next */
  Symbol()
);
function mr() {
  const e = An(!0), t = e.run(() => H({}));
  let n = [], r = [];
  const o = jn({
    install(s) {
      Bt(o), o._a = s, s.provide(Ft, o), s.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
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
var pr = Object.defineProperty, fr = (e, t, n) => t in e ? pr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ae = (e, t, n) => fr(e, typeof t != "symbol" ? t + "" : t, n), zt = /* @__PURE__ */ Symbol("wippy:emit"), Kt = /* @__PURE__ */ Symbol("wippy:props"), hr = /* @__PURE__ */ Symbol("wippy:props_error"), vr = /* @__PURE__ */ Symbol("wippy:content"), gr = /* @__PURE__ */ Symbol("wippy:panel-id"), yr = /* @__PURE__ */ Symbol("wippy:layout-bus"), br = /* @__PURE__ */ Symbol("wippy:host"), Yt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function yi() {
  const e = Ve(Kt);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function bi() {
  const e = Ve(zt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function _r() {
  const e = Ve(Yt);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function _i(e) {
  const t = _r();
  let n = !1, r = null, o = !1;
  function s() {
    if (r)
      return o = !0, r;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (i) {
      l = Promise.reject(i);
    }
    const a = l.finally(() => {
      if (r === a && (r = null, n && o))
        return o = !1, s();
    });
    return r = a, a;
  }
  return It(() => (n = !0, s())), Rn(() => {
    n = !1, o = !1;
  }), ue(t, (l, a) => {
    if (n && a === !1 && l === !0)
      return s();
  }), t;
}
var Si = class extends lr {
  constructor() {
    super(...arguments), ae(this, "_vueApp", null), ae(this, "_propsRef", H({})), ae(this, "_errorsRef", H([])), ae(this, "_contentRef", H(null)), ae(this, "_hostVisibilityRef", H(null)), ae(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, s) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((u, c) => {
      this._propsRef.value = u, this._errorsRef.value = [...c];
      for (const d of c)
        this.emitEvent("invalid", { message: d });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: a.signal });
    const i = (u) => {
      if (a.signal.aborted)
        return;
      const c = dr(), d = Nn(u.rootComponent);
      this._vueApp = d;
      const m = mr();
      if (u.piniaPlugins)
        for (const p of u.piniaPlugins)
          m.use(p);
      if (d.use(m), u.plugins)
        for (const p of u.plugins)
          d.use(p);
      d.provide(Kt, this._propsRef), d.provide(hr, this._errorsRef), d.provide(zt, this.emitEvent.bind(this)), d.provide(vr, this._contentRef), d.provide(Yt, this._hostVisibilityRef), d.provide(gr, cr(this)), d.provide(yr, ur(this)), d.provide(br, Wt(this)), u.providers && u.providers(d, this), d.mount(t), c && Bt(c);
    };
    if (l.rootComponent)
      i(l);
    else if (l.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), l.lazyConfig().then((c) => {
        a.signal.aborted || (u.remove(), i(c));
      }).catch((c) => {
        if (a.signal.aborted)
          return;
        const d = c instanceof Error ? c.message : String(c), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", d), u.replaceWith(m), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Sr = Object.defineProperty, it = Object.getOwnPropertySymbols, $r = Object.prototype.hasOwnProperty, wr = Object.prototype.propertyIsEnumerable, st = (e, t, n) => t in e ? Sr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Pr = (e, t) => {
  for (var n in t || (t = {})) $r.call(t, n) && st(e, n, t[n]);
  if (it) for (var n of it(t)) wr.call(t, n) && st(e, n, t[n]);
  return e;
};
function $e(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Be(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), s, l, a;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (s = l; s-- !== 0; ) if (!Be(e[s], t[s], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, d = t instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (l = m.length, l !== Object.keys(t).length) return !1;
  for (s = l; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[s])) return !1;
  for (s = l; s-- !== 0; ) if (a = m[s], !Be(e[a], t[a], n)) return !1;
  return !0;
}
function Or(e, t) {
  return Be(e, t);
}
function Ie(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function T(e) {
  return !$e(e);
}
function at(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (T(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ie(t)) return t(e);
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
function $i(e, t, n) {
  return n ? at(e, n) === at(t, n) : Or(e, t);
}
function M(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Gt(e = {}, t = {}) {
  let n = Pr({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    M(t[o]) && o in e && M(e[o]) ? n[o] = Gt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Tr(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Gt(t, n), {});
}
function j(e, ...t) {
  return Ie(e) ? e(...t) : e;
}
function A(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function D(e) {
  return A(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Qe(e, t = "", n = {}) {
  let r = D(t).split("."), o = r.shift();
  if (o) {
    if (M(e)) {
      let s = Object.keys(e).find((l) => D(l) === o) || "";
      return Qe(j(e[s], n), r.join("."), n);
    }
    return;
  }
  return j(e, n);
}
function qt(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Cr(e) {
  return T(e) && !isNaN(e);
}
function te(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function xr(...e) {
  return Tr(...e);
}
function pe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function kr(e) {
  return A(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Qt(e) {
  return A(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Jt() {
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
function Er(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let s = Array.isArray(r) ? [Er(...r)] : Object.entries(r).map(([l, a]) => a ? l : void 0);
        t = s.length ? t.concat(s.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Lr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ar(e, t) {
  if (e && t) {
    let n = (r) => {
      Lr(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Me(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function lt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function jr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Nr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Rr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Nr(e));
}
function we(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function wi() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function Ae(e, t = {}) {
  if (we(e)) {
    let n = (r, o) => {
      var s, l;
      let a = (s = e?.$attrs) != null && s[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") i.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, p]) => r === "style" && (p || p === 0) ? "".concat(m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), ":").concat(p) : p ? m : void 0);
            i = d.length ? i.concat(d.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, a);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Ae(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Vr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Ae(r, t), r.append(...n), r;
  }
}
function Ir(e, t) {
  return we(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Dr(e, t) {
  if (we(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function ut(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Mr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || lt(document.documentElement) || lt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ur(e, t) {
  return e ? e.offsetHeight : 0;
}
function Pi() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function ct(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Zt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Wr(e, t = "", n) {
  we(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Te = {};
function Hr(e = "pui_id_") {
  return Object.hasOwn(Te, e) || (Te[e] = 0), Te[e]++, "".concat(e).concat(Te[e]);
}
var Br = Object.defineProperty, Fr = Object.defineProperties, zr = Object.getOwnPropertyDescriptors, je = Object.getOwnPropertySymbols, Xt = Object.prototype.hasOwnProperty, en = Object.prototype.propertyIsEnumerable, dt = (e, t, n) => t in e ? Br(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) Xt.call(t, n) && dt(e, n, t[n]);
  if (je) for (var n of je(t)) en.call(t, n) && dt(e, n, t[n]);
  return e;
}, Ue = (e, t) => Fr(e, zr(t)), W = (e, t) => {
  var n = {};
  for (var r in e) Xt.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && je) for (var r of je(e)) t.indexOf(r) < 0 && en.call(e, r) && (n[r] = e[r]);
  return n;
}, Kr = Jt(), E = Kr, fe = /{([^}]*)}/g, tn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, nn = /var\([^)]+\)/g;
function mt(e) {
  return A(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Yr(e) {
  return M(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Gr(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Fe(e = "", t = "") {
  return Gr("".concat(A(e, !1) && A(t, !1) ? "".concat(e, "-") : e).concat(t));
}
function rn(e = "", t = "") {
  return "--".concat(Fe(e, t));
}
function qr(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function on(e, t = "", n = "", r = [], o) {
  if (A(e)) {
    let s = e.trim();
    if (qr(s)) return;
    if (te(s, fe)) {
      let l = s.replaceAll(fe, (a) => {
        let i = a.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => te(u, c)));
        return "var(".concat(rn(n, Qt(i.join("-")))).concat(T(o) ? ", ".concat(o) : "", ")");
      });
      return te(l.replace(nn, "0"), tn) ? "calc(".concat(l, ")") : l;
    }
    return s;
  } else if (Cr(e)) return e;
}
function Qr(e, t, n) {
  A(t, !1) && e.push("".concat(t, ":").concat(n, ";"));
}
function le(e, t) {
  return e ? "".concat(e, "{").concat(t, "}") : "";
}
function sn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, a) {
    let i = [], u = 0, c = "", d = null, m = 0;
    for (; u <= l.length; ) {
      let p = l[u];
      if ((p === '"' || p === "'" || p === "`") && l[u - 1] !== "\\" && (d = d === p ? null : p), !d && (p === "(" && m++, p === ")" && m--, (p === "," || u === l.length) && m === 0)) {
        let h = c.trim();
        h.startsWith("dt(") ? i.push(sn(h, a)) : i.push(r(h)), c = "", u++;
        continue;
      }
      p !== void 0 && (c += p), u++;
    }
    return i;
  }
  function r(l) {
    let a = l[0];
    if ((a === '"' || a === "'" || a === "`") && l[l.length - 1] === a) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let o = [], s = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") s.push(l), l += 2;
  else if (e[l] === ")" && s.length > 0) {
    let a = s.pop();
    s.length === 0 && o.push([a, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [a, i] = o[l], u = e.slice(a + 3, i), c = n(u, t), d = t(...c);
    e = e.slice(0, a) + d + e.slice(i + 1);
  }
  return e;
}
var ne = (...e) => Jr(P.getTheme(), ...e), Jr = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: s } = P.defaults || {}, { prefix: l, transform: a } = e?.options || s || {}, i = te(t, fe) ? t : "{".concat(t, "}");
    return r === "value" || $e(r) && a === "strict" ? P.getTokenValue(t) : on(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function Ce(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, s) => {
      var l;
      return r + o + ((l = j(t[s], { dt: ne })) != null ? l : "");
    }, "");
    return sn(n, ne);
  }
  return j(e, { dt: ne });
}
function Zr(e, t = {}) {
  let n = P.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = t, l = [], a = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: c, path: d } = i.pop();
    for (let m in c) {
      let p = c[m], h = Yr(p), g = te(m, s) ? Fe(d) : Fe(d, Qt(m));
      if (M(h)) i.push({ node: h, path: g });
      else {
        let v = rn(g), y = on(h, g, r, [s]);
        Qr(a, v, y);
        let $ = g;
        r && $.startsWith(r + "-") && ($ = $.slice(r.length + 1)), l.push($.replace(/-/g, "."));
      }
    }
  }
  let u = a.join("");
  return { value: a, tokens: l, declarations: u, css: le(o, u) };
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
  return Zr(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, l, a, i, u, c, d;
  let { preset: m, options: p } = t, h, g, v, y, $, O, f;
  if (T(m) && p.transform !== "strict") {
    let { primitive: _, semantic: k, extend: N } = m, B = k || {}, { colorScheme: F } = B, q = W(B, ["colorScheme"]), z = N || {}, { colorScheme: Q } = z, J = W(z, ["colorScheme"]), K = F || {}, { dark: Z } = K, re = W(K, ["dark"]), X = Q || {}, { dark: oe } = X, ie = W(X, ["dark"]), U = T(_) ? this._toVariables({ primitive: _ }, p) : {}, I = T(q) ? this._toVariables({ semantic: q }, p) : {}, ee = T(re) ? this._toVariables({ light: re }, p) : {}, Pe = T(Z) ? this._toVariables({ dark: Z }, p) : {}, se = T(J) ? this._toVariables({ semantic: J }, p) : {}, Xe = T(ie) ? this._toVariables({ light: ie }, p) : {}, et = T(oe) ? this._toVariables({ dark: oe }, p) : {}, [pn, fn] = [(s = U.declarations) != null ? s : "", U.tokens], [hn, vn] = [(l = I.declarations) != null ? l : "", I.tokens || []], [gn, yn] = [(a = ee.declarations) != null ? a : "", ee.tokens || []], [bn, _n] = [(i = Pe.declarations) != null ? i : "", Pe.tokens || []], [Sn, $n] = [(u = se.declarations) != null ? u : "", se.tokens || []], [wn, Pn] = [(c = Xe.declarations) != null ? c : "", Xe.tokens || []], [On, Tn] = [(d = et.declarations) != null ? d : "", et.tokens || []];
    h = this.transformCSS(e, pn, "light", "variable", p, r, o), g = fn;
    let Cn = this.transformCSS(e, "".concat(hn).concat(gn), "light", "variable", p, r, o), xn = this.transformCSS(e, "".concat(bn), "dark", "variable", p, r, o);
    v = "".concat(Cn).concat(xn), y = [.../* @__PURE__ */ new Set([...vn, ...yn, ..._n])];
    let kn = this.transformCSS(e, "".concat(Sn).concat(wn, "color-scheme:light"), "light", "variable", p, r, o), En = this.transformCSS(e, "".concat(On, "color-scheme:dark"), "dark", "variable", p, r, o);
    $ = "".concat(kn).concat(En), O = [.../* @__PURE__ */ new Set([...$n, ...Pn, ...Tn])], f = j(m.css, { dt: ne });
  }
  return { primitive: { css: h, tokens: g }, semantic: { css: v, tokens: y }, global: { css: $, tokens: O }, style: f };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: s, selector: l }) {
  var a, i, u;
  let c, d, m;
  if (T(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), h = t, { colorScheme: g, extend: v, css: y } = h, $ = W(h, ["colorScheme", "extend", "css"]), O = v || {}, { colorScheme: f } = O, _ = W(O, ["colorScheme"]), k = g || {}, { dark: N } = k, B = W(k, ["dark"]), F = f || {}, { dark: q } = F, z = W(F, ["dark"]), Q = T($) ? this._toVariables({ [p]: V(V({}, $), _) }, n) : {}, J = T(B) ? this._toVariables({ [p]: V(V({}, B), z) }, n) : {}, K = T(N) ? this._toVariables({ [p]: V(V({}, N), q) }, n) : {}, [Z, re] = [(a = Q.declarations) != null ? a : "", Q.tokens || []], [X, oe] = [(i = J.declarations) != null ? i : "", J.tokens || []], [ie, U] = [(u = K.declarations) != null ? u : "", K.tokens || []], I = this.transformCSS(p, "".concat(Z).concat(X), "light", "variable", n, o, s, l), ee = this.transformCSS(p, ie, "dark", "variable", n, o, s, l);
    c = "".concat(I).concat(ee), d = [.../* @__PURE__ */ new Set([...re, ...oe, ...U])], m = j(y, { dt: ne });
  }
  return { css: c, tokens: d, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: l, options: a } = t, i = (s = l?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: i, options: a, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, l;
  let a = e.replace("-directive", ""), { preset: i, options: u } = t, c = ((s = i?.components) == null ? void 0 : s[a]) || ((l = i?.directives) == null ? void 0 : l[a]);
  return this.getPreset({ name: a, preset: c, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? "@layer ".concat(j(o.order || o.name || "primeui", n)) : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: s }), a = Object.entries(r).reduce((i, [u, c]) => i.push("".concat(u, '="').concat(c, '"')) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [u, c]) => {
    if (M(c) && Object.hasOwn(c, "css")) {
      let d = pe(c.css), m = "".concat(u, "-variables");
      i.push('<style type="text/css" data-primevue-style-id="'.concat(m, '" ').concat(a, ">").concat(d, "</style>"));
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var l;
  let a = { name: e, theme: t, params: n, set: o, defaults: s }, i = (l = e.includes("-directive") ? this.getPresetD(a) : this.getPresetC(a)) == null ? void 0 : l.css, u = Object.entries(r).reduce((c, [d, m]) => c.push("".concat(d, '="').concat(m, '"')) && c, []).join(" ");
  return i ? '<style type="text/css" data-primevue-style-id="'.concat(e, '-variables" ').concat(u, ">").concat(pe(i), "</style>") : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let s = function(a, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn("Circular reference detected at ".concat(this.path)), { colorScheme: a, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && fe.test(this.value)) {
      let d = this.value.trim().replace(fe, (m) => {
        var p;
        let h = m.slice(1, -1), g = this.tokens[h];
        if (!g) return console.warn("Token not found for path: ".concat(h)), "__UNRESOLVED__";
        let v = g.computed(a, i, u);
        return Array.isArray(v) && v.length === 2 ? "light-dark(".concat(v[0].value, ",").concat(v[1].value, ")") : (p = v?.value) != null ? p : "__UNRESOLVED__";
      });
      c = tn.test(d.replace(nn, "0")) ? "calc(".concat(d, ")") : d;
    }
    return $e(i.binding) && delete i.binding, u.pop(), { colorScheme: a, path: this.path, paths: i, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, l = (a, i, u) => {
    Object.entries(a).forEach(([c, d]) => {
      let m = te(c, t.variable.excludedKeyRegex) ? i : i ? "".concat(i, ".").concat(mt(c)) : mt(c), p = u ? "".concat(u, ".").concat(c) : c;
      M(d) ? l(d, m, p) : (o[m] || (o[m] = { paths: [], computed: (h, g = {}, v = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, g.binding, v);
        if (h && h !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let $ = o[m].paths[y];
          if ($.scheme === h) return $.computed(h, g.binding, v);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, g[y.scheme], v));
      } }), o[m].paths.push({ path: p, value: d, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((a) => a.split(".").filter((i) => !te(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), s = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(s)].flat().filter((a) => a);
  return l.length === 1 ? l[0].value : l.reduce((a = {}, i) => {
    let u = i, { colorScheme: c } = u, d = W(u, ["colorScheme"]);
    return a[c] = d, a;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? le(T(t) ? "".concat(e).concat(t, ",").concat(e, " ").concat(t) : e, r) : le(e, le(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, s, l, a) {
  if (T(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, l);
      t = n === "dark" ? u.reduce((c, { type: d, selector: m }) => (T(m) && (c += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, a, d, t)), c), "") : le(a ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      M(i) && (u.name = j(i.name, { name: e, type: r })), T(u.name) && (t = le("@layer ".concat(u.name), t), s?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, P = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ue(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Ue(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), E.emit("preset:change", e), E.emit("theme:change", this.theme);
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
}, Xr = "\n    *,\n    ::before,\n    ::after {\n        box-sizing: border-box;\n    }\n\n    .p-collapsible-enter-active {\n        animation: p-animate-collapsible-expand 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    .p-collapsible-leave-active {\n        animation: p-animate-collapsible-collapse 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    @keyframes p-animate-collapsible-expand {\n        from {\n            grid-template-rows: 0fr;\n        }\n        to {\n            grid-template-rows: 1fr;\n        }\n    }\n\n    @keyframes p-animate-collapsible-collapse {\n        from {\n            grid-template-rows: 1fr;\n        }\n        to {\n            grid-template-rows: 0fr;\n        }\n    }\n\n    .p-disabled,\n    .p-disabled * {\n        cursor: default;\n        pointer-events: none;\n        user-select: none;\n    }\n\n    .p-disabled,\n    .p-component:disabled {\n        opacity: dt('disabled.opacity');\n    }\n\n    .pi {\n        font-size: dt('icon.size');\n    }\n\n    .p-icon {\n        width: dt('icon.size');\n        height: dt('icon.size');\n    }\n\n    .p-overlay-mask {\n        background: var(--px-mask-background, dt('mask.background'));\n        color: dt('mask.color');\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n    }\n\n    .p-overlay-mask-enter-active {\n        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;\n    }\n\n    .p-overlay-mask-leave-active {\n        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;\n    }\n\n    @keyframes p-animate-overlay-mask-enter {\n        from {\n            background: transparent;\n        }\n        to {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n    }\n    @keyframes p-animate-overlay-mask-leave {\n        from {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n        to {\n            background: transparent;\n        }\n    }\n\n    .p-anchored-overlay-enter-active {\n        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    .p-anchored-overlay-leave-active {\n        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    @keyframes p-animate-anchored-overlay-enter {\n        from {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n\n    @keyframes p-animate-anchored-overlay-leave {\n        to {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n";
function he(e) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, he(e);
}
function pt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ft(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pt(Object(n), !0).forEach(function(r) {
      eo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function eo(e, t, n) {
  return (t = to(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function to(e) {
  var t = no(e, "string");
  return he(t) == "symbol" ? t : t + "";
}
function no(e, t) {
  if (he(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (he(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ro(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  tt() && tt().components ? It(e) : t ? e() : In(e);
}
var oo = 0;
function io(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = H(!1), r = H(e), o = H(null), s = Zt() ? window.document : void 0, l = t.document, a = l === void 0 ? s : l, i = t.immediate, u = i === void 0 ? !0 : i, c = t.manual, d = c === void 0 ? !1 : c, m = t.name, p = m === void 0 ? "style_".concat(++oo) : m, h = t.id, g = h === void 0 ? void 0 : h, v = t.media, y = v === void 0 ? void 0 : v, $ = t.nonce, O = $ === void 0 ? void 0 : $, f = t.first, _ = f === void 0 ? !1 : f, k = t.onMounted, N = k === void 0 ? void 0 : k, B = t.onUpdated, F = B === void 0 ? void 0 : B, q = t.onLoad, z = q === void 0 ? void 0 : q, Q = t.props, J = Q === void 0 ? {} : Q, K = function() {
  }, Z = function(oe) {
    var ie = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (a) {
      var U = ft(ft({}, J), ie), I = U.name || p, ee = U.id || g, Pe = U.nonce || O;
      o.value = a.querySelector('style[data-primevue-style-id="'.concat(I, '"]')) || a.getElementById(ee) || a.createElement("style"), o.value.isConnected || (r.value = oe || e, Ae(o.value, {
        type: "text/css",
        id: ee,
        media: y,
        nonce: Pe
      }), _ ? a.head.prepend(o.value) : a.head.appendChild(o.value), Wr(o.value, "data-primevue-style-id", I), Ae(o.value, U), o.value.onload = function(se) {
        return z?.(se, {
          name: I
        });
      }, N?.(I)), !n.value && (K = ue(r, function(se) {
        o.value.textContent = se, F?.(I);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, re = function() {
    !a || !n.value || (K(), Rr(o.value) && a.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !d && ro(Z), {
    id: g,
    name: p,
    el: o,
    css: r,
    unload: re,
    load: Z,
    isLoaded: Vn(n)
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
var ht, vt, gt, yt;
function bt(e, t) {
  return uo(e) || lo(e, t) || ao(e, t) || so();
}
function so() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ao(e, t) {
  if (e) {
    if (typeof e == "string") return _t(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(e, t) : void 0;
  }
}
function _t(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function lo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function uo(e) {
  if (Array.isArray(e)) return e;
}
function St(e, t) {
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
    t % 2 ? St(Object(n), !0).forEach(function(r) {
      co(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : St(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function co(e, t, n) {
  return (t = mo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function mo(e) {
  var t = po(e, "string");
  return ve(t) == "symbol" ? t : t + "";
}
function po(e, t) {
  if (ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ve(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function xe(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var fo = function(t) {
  var n = t.dt;
  return "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    opacity: 0;\n    overflow: hidden;\n    padding: 0;\n    pointer-events: none;\n    position: absolute;\n    white-space: nowrap;\n    width: 1px;\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n    padding-right: ".concat(n("scrollbar.width"), ";\n}\n");
}, ho = {}, vo = {}, C = {
  name: "base",
  css: fo,
  style: Xr,
  classes: ho,
  inlineStyles: vo,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(Ce(ht || (ht = xe(["", ""])), t));
    return T(o) ? io(pe(o), We({
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
      return P.transformCSS(n.name || t.name, "".concat(o).concat(Ce(vt || (vt = xe(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return P.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return P.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return P.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return P.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return P.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = j(this.css, {
        dt: ne
      }) || "", o = pe(Ce(gt || (gt = xe(["", "", ""])), r, t)), s = Object.entries(n).reduce(function(l, a) {
        var i = bt(a, 2), u = i[0], c = i[1];
        return l.push("".concat(u, '="').concat(c, '"')) && l;
      }, []).join(" ");
      return T(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return P.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [P.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = Ce(yt || (yt = xe(["", ""])), j(this.style, {
        dt: ne
      })), l = pe(P.transformCSS(o, s)), a = Object.entries(n).reduce(function(i, u) {
        var c = bt(u, 2), d = c[0], m = c[1];
        return i.push("".concat(d, '="').concat(m, '"')) && i;
      }, []).join(" ");
      T(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(a, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return We(We({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, G = Jt();
function ge(e) {
  "@babel/helpers - typeof";
  return ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ge(e);
}
function $t(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ke(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $t(Object(n), !0).forEach(function(r) {
      go(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $t(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function go(e, t, n) {
  return (t = yo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function yo(e) {
  var t = bo(e, "string");
  return ge(t) == "symbol" ? t : t + "";
}
function bo(e, t) {
  if (ge(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _o = {
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
}, So = Symbol();
function $o(e, t) {
  var n = {
    config: Dn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(So, n), wo(), Po(e, n), n;
}
var ce = [];
function wo() {
  E.clear(), ce.forEach(function(e) {
    return e?.();
  }), ce = [];
}
function Po(e, t) {
  var n = H(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !P.isStyleNameLoaded("common")) {
      var c, d, m = ((c = C.getCommonTheme) === null || c === void 0 ? void 0 : c.call(C)) || {}, p = m.primitive, h = m.semantic, g = m.global, v = m.style, y = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      C.load(p?.css, ke({
        name: "primitive-variables"
      }, y)), C.load(h?.css, ke({
        name: "semantic-variables"
      }, y)), C.load(g?.css, ke({
        name: "global-variables"
      }, y)), C.loadStyle(ke({
        name: "global-style"
      }, y), v), P.setLoadedStyleName("common");
    }
  };
  E.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ue(t.config, function(i, u) {
    G.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ue(function() {
    return t.config.ripple;
  }, function(i, u) {
    G.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = ue(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || P.setTheme(i), t.config.unstyled || r(), n.value = !1, G.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), a = ue(function() {
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
  ce.push(o), ce.push(s), ce.push(l), ce.push(a);
}
var Oo = {
  install: function(t, n) {
    var r = xr(_o, n);
    $o(t, r);
  }
}, an = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Zt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function To(e, t, n, r, o, s) {
  return s.inline ? Le(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (Mn(), Un(Dt, {
    key: 1,
    to: n.appendTo
  }, [Le(e.$slots, "default")], 8, ["to"])) : Mt("", !0);
}
an.render = To;
var Y = {
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
function Co() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Wn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var wt = C.extend({
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
function xo(e) {
  return cn(e) || ko(e) || un(e) || ln();
}
function ko(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function de(e, t) {
  return cn(e) || Eo(e, t) || un(e, t) || ln();
}
function ln() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function un(e, t) {
  if (e) {
    if (typeof e == "string") return ze(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ze(e, t) : void 0;
  }
}
function ze(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Eo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = s.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function cn(e) {
  if (Array.isArray(e)) return e;
}
function Pt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function S(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pt(Object(n), !0).forEach(function(r) {
      me(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function me(e, t, n) {
  return (t = Lo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Lo(e) {
  var t = Ao(e, "string");
  return ye(t) == "symbol" ? t : t + "";
}
function Ao(e, t) {
  if (ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jo = {
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
    var t, n, r, o, s, l, a, i, u, c, d, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, h = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = h || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (s = o.onBeforeCreate) === null || s === void 0 || s.call(o);
    var g = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, v = g ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.originalValue : void 0, y = g ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = y || v) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = Co(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Ir(we(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = S({
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
      return Ie(t) ? t.apply(void 0, r) : Ee.apply(void 0, r);
    },
    _load: function() {
      Y.isStyleNameLoaded("base") || (C.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Y.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Y.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (wt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Y.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      T(t) && C.load(t, S({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!P.isStyleNameLoaded("common")) {
          var r, o, s = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = s.primitive, a = s.semantic, i = s.global, u = s.style;
          C.load(l?.css, S({
            name: "primitive-variables"
          }, this.$styleOptions)), C.load(a?.css, S({
            name: "semantic-variables"
          }, this.$styleOptions)), C.load(i?.css, S({
            name: "global-variables"
          }, this.$styleOptions)), C.loadStyle(S({
            name: "global-style"
          }, this.$styleOptions), u), P.setLoadedStyleName("common");
        }
        if (!P.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, m, p, h = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, g = h.css, v = h.style;
          (m = this.$style) === null || m === void 0 || m.load(g, S({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(S({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), P.setLoadedStyleName(this.$style.name);
        }
        if (!P.isStyleNameLoaded("layer-order")) {
          var y, $, O = (y = this.$style) === null || y === void 0 || ($ = y.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(y);
          C.load(O, S({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), P.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, s = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = s.css, a = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, S({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = a.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Y.clearLoadedStyleNames(), E.on("theme:change", t);
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
      return Qe(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], a = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, c = a.mergeProps, d = c === void 0 ? !1 : c, m = s ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, S(S({}, o), {}, {
        global: m || {}
      })), h = this._getPTDatasets(r);
      return u || !u && p ? d ? this._mergeProps(d, m, p, h) : S(S(S({}, m), p), h) : S(S({}, p), h);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ee(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", s = r === "root" && T((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && S(S({}, r === "root" && S(S(me({}, "".concat(o, "name"), D(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && me({}, "".concat(o, "extend"), D(this.$.type.name))), {}, me({}, "".concat(this.$attrSelector), ""))), {}, me({}, "".concat(o, "section"), D(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return A(t) || qt(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, s = function(a) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = o ? o(a) : a, d = D(r), m = D(n.$name);
        return (i = u ? d !== m ? c?.[d] : void 0 : c?.[d]) !== null && i !== void 0 ? i : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: s(t.originalValue),
        value: s(t.value)
      } : s(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var s = function(g) {
        return n(g, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, a = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, c = a.mergeProps, d = c === void 0 ? !1 : c, m = s(t.originalValue), p = s(t.value);
        return m === void 0 && p === void 0 ? void 0 : A(p) ? p : A(m) ? m : u || !u && p ? d ? this._mergeProps(d, m, p) : S(S({}, m), p) : p;
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
      return this._getPTValue(this.pt, t, S(S({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Ee(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, S({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, S(S({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, S(S({}, this.$params), r)), s = this._getOptionValue(wt.inlineStyles, t, S(S({}, this.$params), r));
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
        return n._getOptionValue(r, n.$name, S({}, n.$params)) || j(r, S({}, n.$params));
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
        var o = de(r, 1), s = o[0];
        return n?.includes(s);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return S(S({
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
        var r = de(n, 2), o = r[0], s = r[1], l = o.split(":"), a = xo(l), i = ze(a).slice(1);
        return i?.reduce(function(u, c, d, m) {
          return !u[c] && (u[c] = d === m.length - 1 ? s : {}), u[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = de(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = de(n, 2), o = r[0], s = r[1];
        return t[o] = s, t;
      }, {});
    }
  }
}, No = "\n    .p-contextmenu {\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n        min-width: 12.5rem;\n    }\n\n    .p-contextmenu-root-list,\n    .p-contextmenu-submenu {\n        margin: 0;\n        padding: dt('contextmenu.list.padding');\n        list-style: none;\n        outline: 0 none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('contextmenu.list.gap');\n    }\n\n    .p-contextmenu-submenu {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        min-width: 100%;\n        z-index: 1;\n        background: dt('contextmenu.background');\n        color: dt('contextmenu.color');\n        border: 1px solid dt('contextmenu.border.color');\n        border-radius: dt('contextmenu.border.radius');\n        box-shadow: dt('contextmenu.shadow');\n    }\n\n    .p-contextmenu-item {\n        position: relative;\n    }\n\n    .p-contextmenu-item-content {\n        transition:\n            background dt('contextmenu.transition.duration'),\n            color dt('contextmenu.transition.duration');\n        border-radius: dt('contextmenu.item.border.radius');\n        color: dt('contextmenu.item.color');\n    }\n\n    .p-contextmenu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('contextmenu.item.padding');\n        gap: dt('contextmenu.item.gap');\n        user-select: none;\n    }\n\n    .p-contextmenu-item-label {\n        line-height: 1;\n    }\n\n    .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.color');\n    }\n\n    .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.color');\n        margin-left: auto;\n        font-size: dt('contextmenu.submenu.icon.size');\n        width: dt('contextmenu.submenu.icon.size');\n        height: dt('contextmenu.submenu.icon.size');\n    }\n\n    .p-contextmenu-submenu-icon:dir(rtl) {\n        margin-left: 0;\n        margin-right: auto;\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {\n        color: dt('contextmenu.item.focus.color');\n        background: dt('contextmenu.item.focus.background');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.focus.color');\n    }\n\n    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.focus.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content {\n        color: dt('contextmenu.item.active.color');\n        background: dt('contextmenu.item.active.background');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {\n        color: dt('contextmenu.item.icon.active.color');\n    }\n\n    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        color: dt('contextmenu.submenu.icon.active.color');\n    }\n\n    .p-contextmenu-separator {\n        border-block-start: 1px solid dt('contextmenu.separator.border.color');\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu {\n        position: static;\n        box-shadow: none;\n        border: 0 none;\n        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');\n        padding-inline-end: 0;\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-submenu-icon {\n        transition: transform 0.2s;\n        transform: rotate(90deg);\n    }\n\n    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {\n        transform: rotate(-90deg);\n    }\n", Ro = {
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
  style: No,
  classes: Ro
});
var Vo = "\n.p-icon {\n    display: inline-block;\n    vertical-align: baseline;\n    flex-shrink: 0;\n}\n\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n\n@-webkit-keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n\n@keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n", Io = C.extend({
  name: "baseicon",
  css: Vo
});
function be(e) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, be(e);
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
function Tt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Do(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Do(e, t, n) {
  return (t = Mo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mo(e) {
  var t = Uo(e, "string");
  return be(t) == "symbol" ? t : t + "";
}
function Uo(e, t) {
  if (be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Oi = {
  name: "BaseIcon",
  extends: jo,
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
  style: Io,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = $e(this.label);
      return Tt(Tt({}, !this.isUnstyled && {
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
function Ct(e, t) {
  return Fo(e) || Bo(e, t) || Ho(e, t) || Wo();
}
function Wo() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ho(e, t) {
  if (e) {
    if (typeof e == "string") return xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(e, t) : void 0;
  }
}
function xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Bo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function Fo(e) {
  if (Array.isArray(e)) return e;
}
function kt(e, t) {
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
    t % 2 ? kt(Object(n), !0).forEach(function(r) {
      Ke(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ke(e, t, n) {
  return (t = zo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function zo(e) {
  var t = Ko(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Ko(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var b = {
  _getMeta: function() {
    return [M(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], j(M(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, s;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Qe,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var $ = b._getOptionValue.apply(b, arguments);
      return A($) || qt($) ? {
        class: $
      } : $;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, m = u.mergeProps, p = m === void 0 ? !1 : m, h = a ? b._useDefaultPT(r, r.defaultPT(), i, s, l) : void 0, g = b._usePT(r, b._getPT(o, r.$name), i, s, w(w({}, l), {}, {
      global: h || {}
    })), v = b._getPTDatasets(r, s);
    return d || !d && g ? p ? b._mergeProps(r, p, h, g, v) : w(w(w({}, h), g), v) : w(w({}, g), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return w(w({}, n === "root" && Ke({}, "".concat(r, "name"), D(t.$name))), {}, Ke({}, "".concat(r, "section"), D(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var a, i = r ? r(l) : l, u = D(n);
      return (a = i?.[u]) !== null && a !== void 0 ? a : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, l = function(v) {
      return r(v, o, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var a, i = n._usept || ((a = t.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, u = i.mergeSections, c = u === void 0 ? !0 : u, d = i.mergeProps, m = d === void 0 ? !1 : d, p = l(n.originalValue), h = l(n.value);
      return p === void 0 && h === void 0 ? void 0 : A(h) ? h : A(p) ? p : c || !c && h ? m ? b._mergeProps(t, m, p, h) : w(w({}, p), h) : h;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(t, n, r, o, s);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, s = b._getConfig(r, o), l = {
      nonce: s == null || (t = s.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    b._loadCoreStyles(n, l), b._loadThemeStyles(n, l), b._loadScopedThemeStyles(n, l), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, l);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Y.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var s;
      C.loadCSS(o), (s = r.$style) === null || s === void 0 || s.loadCSS(o), Y.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!P.isStyleNameLoaded("common")) {
        var l, a, i = ((l = o.$style) === null || l === void 0 || (a = l.getCommonTheme) === null || a === void 0 ? void 0 : a.call(l)) || {}, u = i.primitive, c = i.semantic, d = i.global, m = i.style;
        C.load(u?.css, w({
          name: "primitive-variables"
        }, s)), C.load(c?.css, w({
          name: "semantic-variables"
        }, s)), C.load(d?.css, w({
          name: "global-variables"
        }, s)), C.loadStyle(w({
          name: "global-style"
        }, s), m), P.setLoadedStyleName("common");
      }
      if (!P.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, h, g, v, y = ((p = o.$style) === null || p === void 0 || (h = p.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(p)) || {}, $ = y.css, O = y.style;
        (g = o.$style) === null || g === void 0 || g.load($, w({
          name: "".concat(o.$style.name, "-variables")
        }, s)), (v = o.$style) === null || v === void 0 || v.loadStyle(w({
          name: "".concat(o.$style.name, "-style")
        }, s), O), P.setLoadedStyleName(o.$style.name);
      }
      if (!P.isStyleNameLoaded("layer-order")) {
        var f, _, k = (f = o.$style) === null || f === void 0 || (_ = f.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(f);
        C.load(k, w({
          name: "layer-order",
          first: !0
        }, s)), P.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, s, l, a = ((o = t.$style) === null || o === void 0 || (s = o.getPresetTheme) === null || s === void 0 ? void 0 : s.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = a.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, w({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Y.clearLoadedStyleNames(), E.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    E.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, s, l) {
    var a, i, u = "on".concat(kr(n)), c = b._getConfig(o, s), d = r?.$instance, m = b._usePT(d, b._getPT(o == null || (a = o.value) === null || a === void 0 ? void 0 : a.pt, t), b._getOptionValue, "hooks.".concat(u)), p = b._useDefaultPT(d, c == null || (i = c.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], b._getOptionValue, "hooks.".concat(u)), h = {
      el: r,
      binding: o,
      vnode: s,
      prevVnode: l
    };
    m?.(d, h), p?.(d, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ie(t) ? t.apply(void 0, r) : Ee.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(a, i, u, c, d) {
      var m, p, h, g;
      i._$instances = i._$instances || {};
      var v = b._getConfig(u, c), y = i._$instances[t] || {}, $ = $e(y) ? w(w({}, n), n?.methods) : {};
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
        $primevueConfig: v,
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(v?.pt, void 0, function(f) {
            var _;
            return f == null || (_ = f.directives) === null || _ === void 0 ? void 0 : _[t];
          });
        },
        isUnstyled: function() {
          var f, _;
          return ((f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled) !== void 0 ? (_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$binding) === null || _ === void 0 || (_ = _.value) === null || _ === void 0 ? void 0 : _.unstyled : v?.unstyled;
        },
        theme: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$primevueConfig) === null || f === void 0 ? void 0 : f.theme;
        },
        preset: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.dt;
        },
        /* instance's methods */
        ptm: function() {
          var f, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(i._$instances[t], (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.pt, _, w({}, k));
        },
        ptmo: function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(i._$instances[t], f, _, k, !1);
        },
        cx: function() {
          var f, _, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (f = i._$instances[t]) !== null && f !== void 0 && f.isUnstyled() ? void 0 : b._getOptionValue((_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$style) === null || _ === void 0 ? void 0 : _.classes, k, w({}, N));
        },
        sx: function() {
          var f, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, N = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? b._getOptionValue((f = i._$instances[t]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.inlineStyles, _, w({}, N)) : void 0;
        }
      }, $), i.$instance = i._$instances[t], (p = (h = i.$instance)[a]) === null || p === void 0 || p.call(h, i, u, c, d), i["$".concat(t)] = i.$instance, b._hook(t, a, i, u, c, d), i.$pd || (i.$pd = {}), i.$pd[t] = w(w({}, (g = i.$pd) === null || g === void 0 ? void 0 : g[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(a) {
      var i, u, c, d = a._$instances[t], m = d?.watch, p = function(v) {
        var y, $ = v.newValue, O = v.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(d, $, O);
      }, h = function(v) {
        var y, $ = v.newValue, O = v.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, $, O);
      };
      d.$watchersCallback = {
        config: p,
        "config.ripple": h
      }, m == null || (i = m.config) === null || i === void 0 || i.call(d, d?.$primevueConfig), G.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), G.on("config:ripple:change", h);
    }, s = function(a) {
      var i = a._$instances[t].$watchersCallback;
      i && (G.off("config:change", i.config), G.off("config:ripple:change", i["config.ripple"]), a._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(a, i, u, c) {
        a.$pd || (a.$pd = {}), a.$pd[t] = {
          name: t,
          attrSelector: Hr("pd")
        }, r("created", a, i, u, c);
      },
      beforeMount: function(a, i, u, c) {
        var d;
        b._loadStyles((d = a.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("beforeMount", a, i, u, c), o(a);
      },
      mounted: function(a, i, u, c) {
        var d;
        b._loadStyles((d = a.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("mounted", a, i, u, c);
      },
      beforeUpdate: function(a, i, u, c) {
        r("beforeUpdate", a, i, u, c);
      },
      updated: function(a, i, u, c) {
        var d;
        b._loadStyles((d = a.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("updated", a, i, u, c);
      },
      beforeUnmount: function(a, i, u, c) {
        var d;
        s(a), b._removeThemeListeners((d = a.$pd[t]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", a, i, u, c);
      },
      unmounted: function(a, i, u, c) {
        var d;
        (d = a.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", a, i, u, c);
      }
    };
  },
  extend: function() {
    var t = b._getMeta.apply(b, arguments), n = Ct(t, 2), r = n[0], o = n[1];
    return w({
      extend: function() {
        var l = b._getMeta.apply(b, arguments), a = Ct(l, 2), i = a[0], u = a[1];
        return b.extend(i, w(w(w({}, o), o?.methods), u));
      }
    }, b._extend(r, o));
  }
}, Yo = "\n    .p-ink {\n        display: block;\n        position: absolute;\n        background: dt('ripple.background');\n        border-radius: 100%;\n        transform: scale(0);\n        pointer-events: none;\n    }\n\n    .p-ink-active {\n        animation: ripple 0.4s linear;\n    }\n\n    @keyframes ripple {\n        100% {\n            opacity: 0;\n            transform: scale(2.5);\n        }\n    }\n", Go = {
  root: "p-ink"
}, qo = C.extend({
  name: "ripple-directive",
  style: Yo,
  classes: Go
}), Qo = b.extend({
  style: qo
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function Jo(e) {
  return ti(e) || ei(e) || Xo(e) || Zo();
}
function Zo() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Xo(e, t) {
  if (e) {
    if (typeof e == "string") return Ye(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ye(e, t) : void 0;
  }
}
function ei(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ti(e) {
  if (Array.isArray(e)) return Ye(e);
}
function Ye(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Et(e, t, n) {
  return (t = ni(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ni(e) {
  var t = ri(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function ri(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ti = Qo.extend("ripple", {
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
      n || (n = Vr("span", Et(Et({
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
        if (!this.isUnstyled() && Me(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !ut(o) && !ct(o)) {
          var s = Math.max(jr(r), Ur(r));
          o.style.height = s + "px", o.style.width = s + "px";
        }
        var l = Mr(r), a = t.pageX - l.left + document.body.scrollTop - ct(o) / 2, i = t.pageY - l.top + document.body.scrollLeft - ut(o) / 2;
        o.style.top = i + "px", o.style.left = a + "px", !this.isUnstyled() && Ar(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Me(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Me(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Jo(t.children).find(function(n) {
        return Dr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), oi = "\n    .p-menu {\n        background: dt('menu.background');\n        color: dt('menu.color');\n        border: 1px solid dt('menu.border.color');\n        border-radius: dt('menu.border.radius');\n        min-width: 12.5rem;\n    }\n\n    .p-menu-list {\n        margin: 0;\n        padding: dt('menu.list.padding');\n        outline: 0 none;\n        list-style: none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('menu.list.gap');\n    }\n\n    .p-menu-item-content {\n        transition:\n            background dt('menu.transition.duration'),\n            color dt('menu.transition.duration');\n        border-radius: dt('menu.item.border.radius');\n        color: dt('menu.item.color');\n        overflow: hidden;\n    }\n\n    .p-menu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('menu.item.padding');\n        gap: dt('menu.item.gap');\n        user-select: none;\n        outline: 0 none;\n    }\n\n    .p-menu-item-label {\n        line-height: 1;\n    }\n\n    .p-menu-item-icon {\n        color: dt('menu.item.icon.color');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-content {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-overlay {\n        box-shadow: dt('menu.shadow');\n    }\n\n    .p-menu-submenu-label {\n        background: dt('menu.submenu.label.background');\n        padding: dt('menu.submenu.label.padding');\n        color: dt('menu.submenu.label.color');\n        font-weight: dt('menu.submenu.label.font.weight');\n    }\n\n    .p-menu-separator {\n        border-block-start: 1px solid dt('menu.separator.border.color');\n    }\n", ii = {
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
  style: oi,
  classes: ii
});
const si = "data-wippy-overlay-layer";
function dn() {
  return typeof window < "u" && typeof window.document < "u";
}
function mn() {
  return dn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ai() {
  return mn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const li = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ui = 0;
const Ne = /* @__PURE__ */ new WeakMap();
function Lt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ci(e, t) {
  if (!li.test(e.className))
    return;
  const n = e.style.cssText;
  Lt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ne.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Lt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ne.set(e, r);
  }
}
function Je(e) {
  const t = Ne.get(e);
  t && (t.disconnect(), Ne.delete(e));
}
function di(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ge(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = "".concat(-window.scrollY - t.top, "px"), e.style.left = "".concat(-window.scrollX - t.left, "px");
}
const Re = /* @__PURE__ */ new Set(), Ze = /* @__PURE__ */ new WeakMap();
let At = !1, qe = !1;
function mi() {
  qe = !1;
  for (const e of Re) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Je(t);
      Re.delete(e), Ze.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ge(e);
  }
}
function jt() {
  qe || (qe = !0, requestAnimationFrame(mi));
}
function pi(e) {
  const t = document.createElement("div");
  t.setAttribute(si, "");
  const n = mn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ge(t);
  const r = new MutationObserver((o) => {
    const s = t.__wippyAnchorName;
    for (const l of o) {
      if (s)
        for (const a of Array.from(l.addedNodes))
          a instanceof HTMLElement && ci(a, s);
      for (const a of Array.from(l.removedNodes))
        a instanceof HTMLElement && Je(a);
    }
    t.isConnected && t.childElementCount > 0 && Ge(t);
  });
  return r.observe(t, { childList: !0 }), Ze.set(t, r), Re.add(t), At || (At = !0, window.addEventListener("scroll", jt, { capture: !0, passive: !0 }), window.addEventListener("resize", jt, { passive: !0 })), t;
}
function Nt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = pi(e.hostRoot), ai())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = "--wippy-a-".concat(++ui), e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Rt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Je(t);
    Re.delete(e.layer), Ze.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Vt = !1;
function fi() {
  if (Vt)
    return;
  Vt = !0;
  const e = an;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    dn() && (this.hostRoot = di(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Nt(this), this.$watch("inline", (t) => {
      t ? Rt(this) : Nt(this);
    })));
  }, e.render = function() {
    return this.inline ? Le(this.$slots, "default", { key: 0 }) : this.mounted ? Hn(Dt, { key: 1, to: this.resolvedTarget || document.body }, [
      Le(this.$slots, "default")
    ]) : Mt("", !0);
  }, e.unmounted = function() {
    Rt(this);
  };
}
const Ci = {
  install: (e) => {
    fi(), e.use(Oo, { theme: "none" });
  }
};
export {
  C as B,
  Pi as M,
  Ci as P,
  Ti as R,
  Si as W,
  T as a,
  yi as b,
  jo as c,
  at as d,
  _i as e,
  Er as f,
  $i as k,
  $e as l,
  wi as p,
  Oi as s,
  bi as u
};
//# sourceMappingURL=wc-runtime-Cnj2CWxS.js.map
