import { hasInjectionContext as Di, inject as Vt, effectScope as Ri, ref as B, markRaw as Bi, createApp as Hi, readonly as Ki, getCurrentInstance as Kt, onMounted as En, nextTick as Ui, watch as Ie, reactive as Wi, renderSlot as j, openBlock as C, createBlock as ve, Teleport as Vn, createCommentVNode as W, useId as Gi, mergeProps as O, h as qi, createElementBlock as T, createElementVNode as F, resolveComponent as oe, Fragment as ke, renderList as vt, createVNode as pe, resolveDirective as Yi, createTextVNode as dt, toDisplayString as te, normalizeClass as Je, resolveDynamicComponent as Ut, withCtx as $e, Transition as Zi, normalizeProps as Ji, createSlots as Qi, withDirectives as Xi, withModifiers as er, defineComponent as tr, computed as Wt, unref as nr } from "vue";
import { addCollection as ir } from "@iconify/vue";
import { config as Gt, addIcons as rr, on as or, applyThemeMode as Qe, host as sr, hostCss as ar, loadCss as lr, loadByTagName as ur, api as qt, define as dr } from "@wippy-fe/proxy";
var gt = "data-wippy-visible";
function Yt(t) {
  const e = t.getAttribute(gt);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var cr = Object.defineProperty, pr = (t, e, n) => e in t ? cr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, N = (t, e, n) => pr(t, typeof e != "symbol" ? e + "" : e, n), fr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], hr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Zt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function mr(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [i, r] of Object.entries(n)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [a, l] of Object.entries(r)) {
            const s = typeof l == "string" ? Zt(a) : null;
            s && e.add(s);
          }
          continue;
        }
        const o = typeof r == "string" ? Zt(i) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function vr(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${hr} {
${e}
}`;
}
function gr(t, e) {
  const n = vr(e);
  n && jn(t, n, "@wippy-fe/css-variables-bridge");
}
function yr(t, e) {
  const i = (e ?? fr).map(async (r) => {
    const o = ar[r];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await lr(o);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${o}):`, a), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const o of r) {
      if (!o)
        continue;
      const a = document.createElement("style");
      a.textContent = o, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function br(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function jn(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", n), i.textContent = e, t.appendChild(i);
}
function Sr(t, e) {
  jn(t, e, "@wippy-fe/custom-css");
}
function Fn(t) {
  return t.__wippyHost ?? null;
}
function wr(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function Or(t, e, n) {
  switch (n.type) {
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
        return n.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function ct(t, e) {
  const n = {}, i = [];
  for (const [r, o] of Object.entries(e.properties)) {
    const a = t.getAttribute(r), l = wr(r);
    if (a === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const s = Or(r, a, o);
    s.error ? i.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: i };
}
var $r = class {
  constructor(t, e) {
    N(this, "_props"), N(this, "_errors"), N(this, "_content"), N(this, "_hostVisibility"), N(this, "_propsListeners", /* @__PURE__ */ new Set()), N(this, "_contentListeners", /* @__PURE__ */ new Set()), N(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), N(this, "_disposed", !1), N(this, "_emitToDom"), N(this, "props"), N(this, "events"), N(this, "content"), N(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(i, r) {
        return n._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        n._disposed || n._emitToDom(i, r);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(i, r) {
        return n._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(i, r) {
        return n._subscribeHostVisibility(i, r);
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
}, Cr = class extends HTMLElement {
  constructor() {
    super(), N(this, "_internals"), N(this, "_contentObserver", null), N(this, "_initialized", !1), N(this, "_container", null), N(this, "_reactive", null), N(this, "_lastProps", null), N(this, "_lastErrors", []), N(this, "_lastContent", null), N(this, "_themeUnsub", null), N(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Yt(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...n, gt])];
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
    return Fn(this);
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
      let n, i;
      if (this._lastProps !== null)
        n = this._lastProps, i = this._lastErrors;
      else {
        const o = ct(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), n = o.props, i = o.errors, this._lastProps = n, this._lastErrors = i;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new $r(
        { props: n, errors: i, content: r, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(n), t.inlineCss && br(n, t.inlineCss);
        try {
          const u = Gt?.theming, d = mr(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          gr(n, d);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const u = Gt?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Sr(n, d);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && yr(n, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const s = t.containerClasses ?? [];
        s.length > 0 && i.classList.add(...s), n.appendChild(i), this._container = i, rr(ir);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = or("@theme", (s) => this._applyTheme(s)));
      const { props: r, errors: o } = ct(this, t.propsSchema);
      t.validateProps && o.push(...t.validateProps(r));
      const a = r;
      this._lastProps = a, this._lastErrors = o;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(t.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, i, a, o, l, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(t = sr.getThemeMode?.()) {
    Qe(t, this), this._container && Qe(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Qe("auto", this), this._container && Qe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === gt) {
      const l = this._hostVisible, s = Yt(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: o } = ct(this, i.propsSchema);
    i.validateProps && o.push(...i.validateProps(r));
    const a = r;
    this._lastProps = a, this._lastErrors = o, this._reactive?.notifyProps(a, o), this.onPropsChanged(a, o);
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
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function _r(t) {
  return t.__wippyHostBus ?? null;
}
function Ir(t) {
  return t.dataset.wippyPanelId ?? null;
}
let Nn;
const Mn = (t) => Nn = t, Tr = () => Di() && Vt(zn) || Nn, zn = (
  /* istanbul ignore next */
  Symbol()
);
function Pr() {
  const t = Ri(!0), e = t.run(() => B({}));
  let n = [], i = [];
  const r = Bi({
    install(o) {
      Mn(r), r._a = o, o.provide(zn, r), o.config.globalProperties.$pinia = r, i.forEach((a) => n.push(a)), i = [];
    },
    use(o) {
      return this._a ? n.push(o) : i.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return r;
}
var kr = Object.defineProperty, Lr = (t, e, n) => e in t ? kr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Ce = (t, e, n) => Lr(t, typeof e != "symbol" ? e + "" : e, n), Dn = /* @__PURE__ */ Symbol("wippy:emit"), Rn = /* @__PURE__ */ Symbol("wippy:props"), xr = /* @__PURE__ */ Symbol("wippy:props_error"), Ar = /* @__PURE__ */ Symbol("wippy:content"), Er = /* @__PURE__ */ Symbol("wippy:panel-id"), Vr = /* @__PURE__ */ Symbol("wippy:layout-bus"), jr = /* @__PURE__ */ Symbol("wippy:host"), Fr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Nr() {
  const t = Vt(Rn);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Mr() {
  const t = Vt(Dn);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var zr = class extends Cr {
  constructor() {
    super(...arguments), Ce(this, "_vueApp", null), Ce(this, "_propsRef", B({})), Ce(this, "_errorsRef", B([])), Ce(this, "_contentRef", B(null)), Ce(this, "_hostVisibilityRef", B(null)), Ce(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, i, r, o) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of i)
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
    const s = (u) => {
      if (l.signal.aborted)
        return;
      const d = Tr(), c = Hi(u.rootComponent);
      this._vueApp = c;
      const p = Pr();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (c.use(p), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(Rn, this._propsRef), c.provide(xr, this._errorsRef), c.provide(Dn, this.emitEvent.bind(this)), c.provide(Ar, this._contentRef), c.provide(Fr, this._hostVisibilityRef), c.provide(Er, Ir(this)), c.provide(Vr, _r(this)), c.provide(jr, Fn(this)), u.providers && u.providers(c, this), c.mount(e), d && Mn(d);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), e.appendChild(u), a.lazyConfig().then((d) => {
        l.signal.aborted || (u.remove(), s(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", c), u.replaceWith(p), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Dr = Object.defineProperty, Jt = Object.getOwnPropertySymbols, Rr = Object.prototype.hasOwnProperty, Br = Object.prototype.propertyIsEnumerable, Qt = (t, e, n) => e in t ? Dr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Hr = (t, e) => {
  for (var n in e || (e = {})) Rr.call(e, n) && Qt(t, n, e[n]);
  if (Jt) for (var n of Jt(e)) Br.call(e, n) && Qt(t, n, e[n]);
  return t;
};
function qe(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function yt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let i = Array.isArray(t), r = Array.isArray(e), o, a, l;
  if (i && r) {
    if (a = t.length, a != e.length) return !1;
    for (o = a; o-- !== 0; ) if (!yt(t[o], e[o], n)) return !1;
    return !0;
  }
  if (i != r) return !1;
  let s = t instanceof Date, u = e instanceof Date;
  if (s != u) return !1;
  if (s && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (a = p.length, a !== Object.keys(e).length) return !1;
  for (o = a; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[o])) return !1;
  for (o = a; o-- !== 0; ) if (l = p[o], !yt(t[l], e[l], n)) return !1;
  return !0;
}
function Kr(t, e) {
  return yt(t, e);
}
function lt(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function x(t) {
  return !qe(t);
}
function de(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (x(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (lt(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), i = t;
      for (let r = 0, o = n.length; r < o; ++r) {
        if (i == null) return null;
        i = i[n[r]];
      }
      return i;
    }
  }
  return null;
}
function Bn(t, e, n) {
  return n ? de(t, n) === de(e, n) : Kr(t, e);
}
function ae(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Hn(t = {}, e = {}) {
  let n = Hr({}, t);
  return Object.keys(e).forEach((i) => {
    let r = i;
    ae(e[r]) && r in t && ae(t[r]) ? n[r] = Hn(t[r], e[r]) : n[r] = e[r];
  }), n;
}
function Ur(...t) {
  return t.reduce((e, n, i) => i === 0 ? n : Hn(e, n), {});
}
function Xt(t, e) {
  let n = -1;
  if (x(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function Z(t, ...e) {
  return lt(t) ? t(...e) : t;
}
function G(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function se(t) {
  return G(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function jt(t, e = "", n = {}) {
  let i = se(e).split("."), r = i.shift();
  if (r) {
    if (ae(t)) {
      let o = Object.keys(t).find((a) => se(a) === r) || "";
      return jt(Z(t[o], n), i.join("."), n);
    }
    return;
  }
  return Z(t, n);
}
function Kn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Wr(t) {
  return x(t) && !isNaN(t);
}
function Gr(t = "") {
  return x(t) && t.length === 1 && !!t.match(/\S| /);
}
function Se(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function qr(...t) {
  return Ur(...t);
}
function je(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function X(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Yr(t) {
  return G(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Un(t) {
  return G(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Ft() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let i = t.get(e);
    return i ? i.push(n) : i = [n], t.set(e, i), this;
  }, off(e, n) {
    let i = t.get(e);
    return i && i.splice(i.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let i = t.get(e);
    i && i.forEach((r) => {
      r(n);
    });
  }, clear() {
    t.clear();
  } };
}
function Te(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let i = t[n];
      if (!i) continue;
      let r = typeof i;
      if (r === "string" || r === "number") e.push(i);
      else if (r === "object") {
        let o = Array.isArray(i) ? [Te(...i)] : Object.entries(i).map(([a, l]) => l ? a : void 0);
        e = o.length ? e.concat(o.filter((a) => !!a)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function Zr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Jr(t, e) {
  if (t && e) {
    let n = (i) => {
      Zr(t, i) || (t.classList ? t.classList.add(i) : t.className += " " + i);
    };
    [e].flat().filter(Boolean).forEach((i) => i.split(" ").forEach(n));
  }
}
function pt(t, e) {
  if (t && e) {
    let n = (i) => {
      t.classList ? t.classList.remove(i) : t.className = t.className.replace(new RegExp("(^|\\b)" + i.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((i) => i.split(" ").forEach(n));
  }
}
function bt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let i of n?.style) if (t.test(i)) return { name: i, value: n.style.getPropertyValue(i).trim() };
  } catch {
  }
  return null;
}
function Wn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, i] = [t.style.visibility, t.style.display], r = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = r.width || t.offsetWidth, e.height = r.height || t.offsetHeight, t.style.display = i, t.style.visibility = n;
  }
  return e;
}
function Gn() {
  let t = window, e = document, n = e.documentElement, i = e.getElementsByTagName("body")[0], r = t.innerWidth || n.clientWidth || i.clientWidth, o = t.innerHeight || n.clientHeight || i.clientHeight;
  return { width: r, height: o };
}
function St(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Qr() {
  let t = document.documentElement;
  return (window.pageXOffset || St(t)) - (t.clientLeft || 0);
}
function Xr() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function eo(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function to(t, e, n = !0) {
  var i, r, o, a;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Wn(t), s = l.height, u = l.width, d = e.offsetHeight, c = e.offsetWidth, p = e.getBoundingClientRect(), f = Xr(), m = Qr(), g = Gn(), v, y, S = "top";
    p.top + d + s > g.height ? (v = p.top + f - s, S = "bottom", v < 0 && (v = f)) : v = d + p.top + f, p.left + u > g.width ? y = Math.max(0, p.left + m + c - u) : y = p.left + m, eo(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = v + "px", t.style.transformOrigin = S, n && (t.style.marginTop = S === "bottom" ? `calc(${(r = (i = bt(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? r : "2px"} * -1)` : (a = (o = bt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? a : "");
  }
}
function no(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, i]) => t.style[n] = i));
}
function qn(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function io(t, e, n = !0, i = void 0) {
  var r;
  if (t) {
    let o = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Wn(t), a = e.offsetHeight, l = e.getBoundingClientRect(), s = Gn(), u, d, c = i ?? "top";
    if (!i && l.top + a + o.height > s.height ? (u = -1 * o.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, o.width > s.width ? d = l.left * -1 : l.left + o.width > s.width ? d = (l.left + o.width - s.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let p = (r = bt(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function Yn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function ro(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Yn(t));
}
function Le(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function it(t, e = {}) {
  if (Le(t)) {
    let n = (i, r) => {
      var o, a;
      let l = (o = t?.$attrs) != null && o[i] ? [(a = t?.$attrs) == null ? void 0 : a[i]] : [];
      return [r].flat().reduce((s, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") s.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(i, u) : Object.entries(u).map(([p, f]) => i === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            s = c.length ? s.concat(c.filter((p) => !!p)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(e).forEach(([i, r]) => {
      if (r != null) {
        let o = i.match(/^on(.+)/);
        o ? t.addEventListener(o[1].toLowerCase(), r) : i === "p-bind" || i === "pBind" ? it(t, r) : (r = i === "class" ? [...new Set(n("class", r))].join(" ").trim() : i === "style" ? n("style", r).join(";").trim() : r, (t.$attrs = t.$attrs || {}) && (t.$attrs[i] = r), t.setAttribute(i, r));
      }
    });
  }
}
function oo(t, e = {}, ...n) {
  {
    let i = document.createElement(t);
    return it(i, e), i.append(...n), i;
  }
}
function so(t, e) {
  return Le(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function ut(t, e) {
  return Le(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function le(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function ao(t, e) {
  if (Le(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Nt(t, e = "") {
  let n = so(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), i = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && i.push(r);
  return i;
}
function lo(t, e) {
  let n = Nt(t, e);
  return n.length > 0 ? n[0] : null;
}
function ye(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function uo(t, e) {
  let n = Nt(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function co(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || St(document.documentElement) || St(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function po(t, e) {
  return t ? t.offsetHeight : 0;
}
function Zn(t, e = []) {
  let n = Yn(t);
  return n === null ? e : Zn(n, e.concat([n]));
}
function fo(t) {
  let e = [];
  if (t) {
    let n = Zn(t), i = /(auto|scroll)/, r = (o) => {
      try {
        let a = window.getComputedStyle(o, null);
        return i.test(a.getPropertyValue("overflow")) || i.test(a.getPropertyValue("overflowX")) || i.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let a = o.nodeType === 1 && o.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let s of l) {
          let u = ut(o, s);
          u && r(u) && e.push(u);
        }
      }
      o.nodeType !== 9 && r(o) && e.push(o);
    }
  }
  return e;
}
function be(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function ho() {
  return /(android)/i.test(navigator.userAgent);
}
function Jn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function rt(t) {
  return !!(t && t.offsetParent != null);
}
function mo() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function vo(t, e = "", n) {
  Le(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Xe = {};
function go(t = "pui_id_") {
  return Object.hasOwn(Xe, t) || (Xe[t] = 0), Xe[t]++, `${t}${Xe[t]}`;
}
function yo() {
  let t = [], e = (a, l, s = 999) => {
    let u = r(a, l, s), d = u.value + (u.key === a ? 0 : s) + 1;
    return t.push({ key: a, value: d }), d;
  }, n = (a) => {
    t = t.filter((l) => l.value !== a);
  }, i = (a, l) => r(a).value, r = (a, l, s = 0) => [...t].reverse().find((u) => !0) || { key: a, value: s }, o = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: o, set: (a, l, s) => {
    l && (l.style.zIndex = String(e(a, !0, s)));
  }, clear: (a) => {
    a && (n(o(a)), a.style.zIndex = "");
  }, getCurrent: (a) => i(a) };
}
var ft = yo(), bo = Object.defineProperty, So = Object.defineProperties, wo = Object.getOwnPropertyDescriptors, ot = Object.getOwnPropertySymbols, Qn = Object.prototype.hasOwnProperty, Xn = Object.prototype.propertyIsEnumerable, en = (t, e, n) => e in t ? bo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ne = (t, e) => {
  for (var n in e || (e = {})) Qn.call(e, n) && en(t, n, e[n]);
  if (ot) for (var n of ot(e)) Xn.call(e, n) && en(t, n, e[n]);
  return t;
}, ht = (t, e) => So(t, wo(e)), ue = (t, e) => {
  var n = {};
  for (var i in t) Qn.call(t, i) && e.indexOf(i) < 0 && (n[i] = t[i]);
  if (t != null && ot) for (var i of ot(t)) e.indexOf(i) < 0 && Xn.call(t, i) && (n[i] = t[i]);
  return n;
}, Oo = Ft(), H = Oo, Fe = /{([^}]*)}/g, ei = /(\d+\s+[\+\-\*\/]\s+\d+)/g, ti = /var\([^)]+\)/g;
function tn(t) {
  return G(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function $o(t) {
  return ae(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function Co(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function wt(t = "", e = "") {
  return Co(`${G(t, !1) && G(e, !1) ? `${t}-` : t}${e}`);
}
function ni(t = "", e = "") {
  return `--${wt(t, e)}`;
}
function _o(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function ii(t, e = "", n = "", i = [], r) {
  if (G(t)) {
    let o = t.trim();
    if (_o(o)) return;
    if (Se(o, Fe)) {
      let a = o.replaceAll(Fe, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((u) => !i.some((d) => Se(u, d)));
        return `var(${ni(n, Un(s.join("-")))}${x(r) ? `, ${r}` : ""})`;
      });
      return Se(a.replace(ti, "0"), ei) ? `calc(${a})` : a;
    }
    return o;
  } else if (Wr(t)) return t;
}
function Io(t, e, n) {
  G(e, !1) && t.push(`${e}:${n};`);
}
function _e(t, e) {
  return t ? `${t}{${e}}` : "";
}
function ri(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(a, l) {
    let s = [], u = 0, d = "", c = null, p = 0;
    for (; u <= a.length; ) {
      let f = a[u];
      if ((f === '"' || f === "'" || f === "`") && a[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === a.length) && p === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? s.push(ri(m, l)) : s.push(i(m)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return s;
  }
  function i(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let r = [], o = [];
  for (let a = 0; a < t.length; a++) if (t[a] === "d" && t.slice(a, a + 3) === "dt(") o.push(a), a += 2;
  else if (t[a] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && r.push([l, a]);
  }
  if (!r.length) return t;
  for (let a = r.length - 1; a >= 0; a--) {
    let [l, s] = r[a], u = t.slice(l + 3, s), d = n(u, e), c = e(...d);
    t = t.slice(0, l) + c + t.slice(s + 1);
  }
  return t;
}
var we = (...t) => To(A.getTheme(), ...t), To = (t = {}, e, n, i) => {
  if (e) {
    let { variable: r, options: o } = A.defaults || {}, { prefix: a, transform: l } = t?.options || o || {}, s = Se(e, Fe) ? e : `{${e}}`;
    return i === "value" || qe(i) && l === "strict" ? A.getTokenValue(e) : ii(s, void 0, a, [r.excludedKeyRegex], n);
  }
  return "";
};
function et(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((i, r, o) => {
      var a;
      return i + r + ((a = Z(e[o], { dt: we })) != null ? a : "");
    }, "");
    return ri(n, we);
  }
  return Z(t, { dt: we });
}
function Po(t, e = {}) {
  let n = A.defaults.variable, { prefix: i = n.prefix, selector: r = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = e, a = [], l = [], s = [{ node: t, path: i }];
  for (; s.length; ) {
    let { node: d, path: c } = s.pop();
    for (let p in d) {
      let f = d[p], m = $o(f), g = Se(p, o) ? wt(c) : wt(c, Un(p));
      if (ae(m)) s.push({ node: m, path: g });
      else {
        let v = ni(g), y = ii(m, g, i, [o]);
        Io(l, v, y);
        let S = g;
        i && S.startsWith(i + "-") && (S = S.slice(i.length + 1)), a.push(S.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: _e(r, u) };
}
var ee = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var i;
    return (i = e.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? i : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Po(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o, a, l, s, u, d, c;
  let { preset: p, options: f } = e, m, g, v, y, S, b, h;
  if (x(p) && f.transform !== "strict") {
    let { primitive: w, semantic: P, extend: $ } = p, L = P || {}, { colorScheme: z } = L, D = ue(L, ["colorScheme"]), V = $ || {}, { colorScheme: M } = V, q = ue(V, ["colorScheme"]), Y = z || {}, { dark: R } = Y, U = ue(Y, ["dark"]), J = M || {}, { dark: ce } = J, ie = ue(J, ["dark"]), Q = x(w) ? this._toVariables({ primitive: w }, f) : {}, re = x(D) ? this._toVariables({ semantic: D }, f) : {}, me = x(U) ? this._toVariables({ light: U }, f) : {}, Ze = x(R) ? this._toVariables({ dark: R }, f) : {}, Oe = x(q) ? this._toVariables({ semantic: q }, f) : {}, Bt = x(ie) ? this._toVariables({ light: ie }, f) : {}, Ht = x(ce) ? this._toVariables({ dark: ce }, f) : {}, [Oi, $i] = [(o = Q.declarations) != null ? o : "", Q.tokens], [Ci, _i] = [(a = re.declarations) != null ? a : "", re.tokens || []], [Ii, Ti] = [(l = me.declarations) != null ? l : "", me.tokens || []], [Pi, ki] = [(s = Ze.declarations) != null ? s : "", Ze.tokens || []], [Li, xi] = [(u = Oe.declarations) != null ? u : "", Oe.tokens || []], [Ai, Ei] = [(d = Bt.declarations) != null ? d : "", Bt.tokens || []], [Vi, ji] = [(c = Ht.declarations) != null ? c : "", Ht.tokens || []];
    m = this.transformCSS(t, Oi, "light", "variable", f, i, r), g = $i;
    let Fi = this.transformCSS(t, `${Ci}${Ii}`, "light", "variable", f, i, r), Ni = this.transformCSS(t, `${Pi}`, "dark", "variable", f, i, r);
    v = `${Fi}${Ni}`, y = [.../* @__PURE__ */ new Set([..._i, ...Ti, ...ki])];
    let Mi = this.transformCSS(t, `${Li}${Ai}color-scheme:light`, "light", "variable", f, i, r), zi = this.transformCSS(t, `${Vi}color-scheme:dark`, "dark", "variable", f, i, r);
    S = `${Mi}${zi}`, b = [.../* @__PURE__ */ new Set([...xi, ...Ei, ...ji])], h = Z(p.css, { dt: we });
  }
  return { primitive: { css: m, tokens: g }, semantic: { css: v, tokens: y }, global: { css: S, tokens: b }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: i, set: r, defaults: o, selector: a }) {
  var l, s, u;
  let d, c, p;
  if (x(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: g, extend: v, css: y } = m, S = ue(m, ["colorScheme", "extend", "css"]), b = v || {}, { colorScheme: h } = b, w = ue(b, ["colorScheme"]), P = g || {}, { dark: $ } = P, L = ue(P, ["dark"]), z = h || {}, { dark: D } = z, V = ue(z, ["dark"]), M = x(S) ? this._toVariables({ [f]: ne(ne({}, S), w) }, n) : {}, q = x(L) ? this._toVariables({ [f]: ne(ne({}, L), V) }, n) : {}, Y = x($) ? this._toVariables({ [f]: ne(ne({}, $), D) }, n) : {}, [R, U] = [(l = M.declarations) != null ? l : "", M.tokens || []], [J, ce] = [(s = q.declarations) != null ? s : "", q.tokens || []], [ie, Q] = [(u = Y.declarations) != null ? u : "", Y.tokens || []], re = this.transformCSS(f, `${R}${J}`, "light", "variable", n, r, o, a), me = this.transformCSS(f, ie, "dark", "variable", n, r, o, a);
    d = `${re}${me}`, c = [.../* @__PURE__ */ new Set([...U, ...ce, ...Q])], p = Z(y, { dt: we });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o;
  let { preset: a, options: l } = e, s = (o = a?.components) == null ? void 0 : o[t];
  return this.getPreset({ name: t, preset: s, options: l, params: n, set: i, defaults: r });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o, a;
  let l = t.replace("-directive", ""), { preset: s, options: u } = e, d = ((o = s?.components) == null ? void 0 : o[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: i, defaults: r });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, i) {
  let { cssLayer: r } = e;
  return r ? `@layer ${Z(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: i = {}, set: r, defaults: o }) {
  let a = this.getCommon({ name: t, theme: e, params: n, set: r, defaults: o }), l = Object.entries(i).reduce((s, [u, d]) => s.push(`${u}="${d}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [u, d]) => {
    if (ae(d) && Object.hasOwn(d, "css")) {
      let c = je(d.css), p = `${u}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${c}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: i = {}, set: r, defaults: o }) {
  var a;
  let l = { name: t, theme: e, params: n, set: r, defaults: o }, s = (a = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(i).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${je(s)}</style>` : "";
}, createTokens(t = {}, e, n = "", i = "", r = {}) {
  let o = function(l, s = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    u.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Fe.test(this.value)) {
      let c = this.value.trim().replace(Fe, (p) => {
        var f;
        let m = p.slice(1, -1), g = this.tokens[m];
        if (!g) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let v = g.computed(l, s, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (f = v?.value) != null ? f : "__UNRESOLVED__";
      });
      d = ei.test(c.replace(ti, "0")) ? `calc(${c})` : c;
    }
    return qe(s.binding) && delete s.binding, u.pop(), { colorScheme: l, path: this.path, paths: s, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (l, s, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let p = Se(d, e.variable.excludedKeyRegex) ? s : s ? `${s}.${tn(d)}` : tn(d), f = u ? `${u}.${d}` : d;
      ae(c) ? a(c, p, f) : (r[p] || (r[p] = { paths: [], computed: (m, g = {}, v = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, g.binding, v);
        if (m && m !== "none") for (let y = 0; y < r[p].paths.length; y++) {
          let S = r[p].paths[y];
          if (S.scheme === m) return S.computed(m, g.binding, v);
        }
        return r[p].paths.map((y) => y.computed(y.scheme, g[y.scheme], v));
      } }), r[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: r }));
    });
  };
  return a(t, n, i), r;
}, getTokenValue(t, e, n) {
  var i;
  let r = ((l) => l.split(".").filter((s) => !Se(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), o = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, a = [(i = t[r]) == null ? void 0 : i.computed(o)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let u = s, { colorScheme: d } = u, c = ue(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(t, e, n, i) {
  return n === "class" || n === "attr" ? _e(x(e) ? `${t}${e},${t} ${e}` : t, i) : _e(t, _e(e ?? ":root,:host", i));
}, transformCSS(t, e, n, i, r = {}, o, a, l) {
  if (x(e)) {
    let { cssLayer: s } = r;
    if (i !== "style") {
      let u = this.getColorSchemeOption(r, a);
      e = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (x(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, l, c, e)), d), "") : _e(l ?? ":root,:host", e);
    }
    if (s) {
      let u = { name: "primeui" };
      ae(s) && (u.name = Z(s.name, { name: t, type: i })), x(u.name) && (e = _e(`@layer ${u.name}`, e), o?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, A = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = ht(ne({}, e), { options: ne(ne({}, this.defaults.options), e.options) }), this._tokens = ee.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), H.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = ht(ne({}, this.theme), { preset: t }), this._tokens = ee.createTokens(t, this.defaults), this.clearLoadedStyleNames(), H.emit("preset:change", t), H.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = ht(ne({}, this.theme), { options: t }), this.clearLoadedStyleNames(), H.emit("options:change", t), H.emit("theme:change", this.theme);
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
  return ee.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return ee.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPresetD(n);
}, getCustomPreset(t = "", e, n, i) {
  let r = { name: t, preset: e, options: this.options, selector: n, params: i, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPreset(r);
}, getLayerOrderCSS(t = "") {
  return ee.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", i) {
  return ee.transformCSS(t, e, i, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return ee.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return ee.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), H.emit(`theme:${e}:load`, t), !this._loadingStyles.size && H.emit("theme:load"));
} }, K = {
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
function nn(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = ko(t)) || e) {
      n && (t = n);
      var i = 0, r = function() {
      };
      return { s: r, n: function() {
        return i >= t.length ? { done: !0 } : { done: !1, value: t[i++] };
      }, e: function(u) {
        throw u;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, a = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    l = !0, o = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function ko(t, e) {
  if (t) {
    if (typeof t == "string") return rn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rn(t, e) : void 0;
  }
}
function rn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
var Lo = {
  filter: function(e, n, i, r, o) {
    var a = [];
    if (!e)
      return a;
    var l = nn(e), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var u = s.value;
        if (typeof u == "string") {
          if (this.filters[r](u, i, o)) {
            a.push(u);
            continue;
          }
        } else {
          var d = nn(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = de(u, p);
              if (this.filters[r](f, i, o)) {
                a.push(u);
                break;
              }
            }
          } catch (m) {
            d.e(m);
          } finally {
            d.f();
          }
        }
      }
    } catch (m) {
      l.e(m);
    } finally {
      l.f();
    }
    return a;
  },
  filters: {
    startsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(i), o = X(e.toString()).toLocaleLowerCase(i);
      return o.slice(0, r.length) === r;
    },
    contains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(i), o = X(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r) !== -1;
    },
    notContains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(i), o = X(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r) === -1;
    },
    endsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(i), o = X(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r, o.length - r.length) !== -1;
    },
    equals: function(e, n, i) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : X(e.toString()).toLocaleLowerCase(i) == X(n.toString()).toLocaleLowerCase(i);
    },
    notEquals: function(e, n, i) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : X(e.toString()).toLocaleLowerCase(i) != X(n.toString()).toLocaleLowerCase(i);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var i = 0; i < n.length; i++)
        if (Bn(e, n[i]))
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
}, xo = `
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
function Ne(t) {
  "@babel/helpers - typeof";
  return Ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ne(t);
}
function on(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function sn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? on(Object(n), !0).forEach(function(i) {
      Ao(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : on(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Ao(t, e, n) {
  return (e = Eo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Eo(t) {
  var e = Vo(t, "string");
  return Ne(e) == "symbol" ? e : e + "";
}
function Vo(t, e) {
  if (Ne(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ne(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function jo(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Kt() && Kt().components ? En(t) : e ? t() : Ui(t);
}
var Fo = 0;
function No(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = B(!1), i = B(t), r = B(null), o = Jn() ? window.document : void 0, a = e.document, l = a === void 0 ? o : a, s = e.immediate, u = s === void 0 ? !0 : s, d = e.manual, c = d === void 0 ? !1 : d, p = e.name, f = p === void 0 ? "style_".concat(++Fo) : p, m = e.id, g = m === void 0 ? void 0 : m, v = e.media, y = v === void 0 ? void 0 : v, S = e.nonce, b = S === void 0 ? void 0 : S, h = e.first, w = h === void 0 ? !1 : h, P = e.onMounted, $ = P === void 0 ? void 0 : P, L = e.onUpdated, z = L === void 0 ? void 0 : L, D = e.onLoad, V = D === void 0 ? void 0 : D, M = e.props, q = M === void 0 ? {} : M, Y = function() {
  }, R = function(ce) {
    var ie = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var Q = sn(sn({}, q), ie), re = Q.name || f, me = Q.id || g, Ze = Q.nonce || b;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(re, '"]')) || l.getElementById(me) || l.createElement("style"), r.value.isConnected || (i.value = ce || t, it(r.value, {
        type: "text/css",
        id: me,
        media: y,
        nonce: Ze
      }), w ? l.head.prepend(r.value) : l.head.appendChild(r.value), vo(r.value, "data-primevue-style-id", re), it(r.value, Q), r.value.onload = function(Oe) {
        return V?.(Oe, {
          name: re
        });
      }, $?.(re)), !n.value && (Y = Ie(i, function(Oe) {
        r.value.textContent = Oe, z?.(re);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, U = function() {
    !l || !n.value || (Y(), ro(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && jo(R), {
    id: g,
    name: f,
    el: r,
    css: i,
    unload: U,
    load: R,
    isLoaded: Ki(n)
  };
}
function Me(t) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Me(t);
}
var an, ln, un, dn;
function cn(t, e) {
  return Ro(t) || Do(t, e) || zo(t, e) || Mo();
}
function Mo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zo(t, e) {
  if (t) {
    if (typeof t == "string") return pn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? pn(t, e) : void 0;
  }
}
function pn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Do(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, a, l = [], s = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(s = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function Ro(t) {
  if (Array.isArray(t)) return t;
}
function fn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function mt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? fn(Object(n), !0).forEach(function(i) {
      Bo(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : fn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Bo(t, e, n) {
  return (e = Ho(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ho(t) {
  var e = Ko(t, "string");
  return Me(e) == "symbol" ? e : e + "";
}
function Ko(t, e) {
  if (Me(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Me(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function tt(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Uo = function(e) {
  var n = e.dt;
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
}, Wo = {}, Go = {}, E = {
  name: "base",
  css: Uo,
  style: xo,
  classes: Wo,
  inlineStyles: Go,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, r = i(et(an || (an = tt(["", ""])), e));
    return x(r) ? No(je(r), mt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return A.transformCSS(n.name || e.name, "".concat(r).concat(et(ln || (ln = tt(["", ""])), i)));
    });
  },
  getCommonTheme: function(e) {
    return A.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return A.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return A.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, i) {
    return A.getCustomPreset(this.name, e, n, i);
  },
  getLayerOrderThemeCSS: function() {
    return A.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var i = Z(this.css, {
        dt: we
      }) || "", r = je(et(un || (un = tt(["", "", ""])), i, e)), o = Object.entries(n).reduce(function(a, l) {
        var s = cn(l, 2), u = s[0], d = s[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return x(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return A.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = [A.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = et(dn || (dn = tt(["", ""])), Z(this.style, {
        dt: we
      })), a = je(A.transformCSS(r, o)), l = Object.entries(n).reduce(function(s, u) {
        var d = cn(u, 2), c = d[0], p = d[1];
        return s.push("".concat(c, '="').concat(p, '"')) && s;
      }, []).join(" ");
      x(a) && i.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return i.join("");
  },
  extend: function(e) {
    return mt(mt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, he = Ft();
function ze(t) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ze(t);
}
function hn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function nt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? hn(Object(n), !0).forEach(function(i) {
      qo(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : hn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function qo(t, e, n) {
  return (e = Yo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Yo(t) {
  var e = Zo(t, "string");
  return ze(e) == "symbol" ? e : e + "";
}
function Zo(t, e) {
  if (ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ze(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Jo = {
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
    text: [K.STARTS_WITH, K.CONTAINS, K.NOT_CONTAINS, K.ENDS_WITH, K.EQUALS, K.NOT_EQUALS],
    numeric: [K.EQUALS, K.NOT_EQUALS, K.LESS_THAN, K.LESS_THAN_OR_EQUAL_TO, K.GREATER_THAN, K.GREATER_THAN_OR_EQUAL_TO],
    date: [K.DATE_IS, K.DATE_IS_NOT, K.DATE_BEFORE, K.DATE_AFTER]
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
}, Qo = Symbol();
function Xo(t, e) {
  var n = {
    config: Wi(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Qo, n), es(), ts(t, n), n;
}
var Pe = [];
function es() {
  H.clear(), Pe.forEach(function(t) {
    return t?.();
  }), Pe = [];
}
function ts(t, e) {
  var n = B(!1), i = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !A.isStyleNameLoaded("common")) {
      var d, c, p = ((d = E.getCommonTheme) === null || d === void 0 ? void 0 : d.call(E)) || {}, f = p.primitive, m = p.semantic, g = p.global, v = p.style, y = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      E.load(f?.css, nt({
        name: "primitive-variables"
      }, y)), E.load(m?.css, nt({
        name: "semantic-variables"
      }, y)), E.load(g?.css, nt({
        name: "global-variables"
      }, y)), E.loadStyle(nt({
        name: "global-style"
      }, y), v), A.setLoadedStyleName("common");
    }
  };
  H.on("theme:change", function(s) {
    n.value || (t.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var r = Ie(e.config, function(s, u) {
    he.emit("config:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = Ie(function() {
    return e.config.ripple;
  }, function(s, u) {
    he.emit("config:ripple:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Ie(function() {
    return e.config.theme;
  }, function(s, u) {
    n.value || A.setTheme(s), e.config.unstyled || i(), n.value = !1, he.emit("config:theme:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Ie(function() {
    return e.config.unstyled;
  }, function(s, u) {
    !s && e.config.theme && i(), he.emit("config:unstyled:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Pe.push(r), Pe.push(o), Pe.push(a), Pe.push(l);
}
var ns = {
  install: function(e, n) {
    var i = qr(Jo, n);
    Xo(e, i);
  }
}, Mt = {
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
    this.mounted = Jn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function is(t, e, n, i, r, o) {
  return o.inline ? j(t.$slots, "default", {
    key: 0
  }) : r.mounted ? (C(), ve(Vn, {
    key: 1,
    to: n.appendTo
  }, [j(t.$slots, "default")], 8, ["to"])) : W("", !0);
}
Mt.render = is;
var fe = {
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
function rs() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Gi();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var mn = E.extend({
  name: "common"
});
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function os(t) {
  return ai(t) || ss(t) || si(t) || oi();
}
function ss(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ae(t, e) {
  return ai(t) || as(t, e) || si(t, e) || oi();
}
function oi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function si(t, e) {
  if (t) {
    if (typeof t == "string") return Ot(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ot(t, e) : void 0;
  }
}
function Ot(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function as(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, a, l = [], s = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function ai(t) {
  if (Array.isArray(t)) return t;
}
function vn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function I(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? vn(Object(n), !0).forEach(function(i) {
      Ve(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : vn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Ve(t, e, n) {
  return (e = ls(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ls(t) {
  var e = us(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function us(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (De(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ye = {
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
        H.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var i = this;
        H.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return i._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, i, r, o, a, l, s, u, d, c, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (i = this.pt) === null || i === void 0 || (i = i.value) === null || i === void 0 ? void 0 : i[this.$.type.name] : this.pt;
    (r = m || f) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (o = r.onBeforeCreate) === null || o === void 0 || o.call(r);
    var g = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, v = g ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = g ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = rs(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = ut(Le(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = I({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), i = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), i?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return lt(e) ? e.apply(void 0, i) : O.apply(void 0, i);
    },
    _load: function() {
      fe.isStyleNameLoaded("base") || (E.loadCSS(this.$styleOptions), this._loadGlobalStyles(), fe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !fe.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (mn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), fe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      x(e) && E.load(e, I({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!A.isStyleNameLoaded("common")) {
          var i, r, o = ((i = this.$style) === null || i === void 0 || (r = i.getCommonTheme) === null || r === void 0 ? void 0 : r.call(i)) || {}, a = o.primitive, l = o.semantic, s = o.global, u = o.style;
          E.load(a?.css, I({
            name: "primitive-variables"
          }, this.$styleOptions)), E.load(l?.css, I({
            name: "semantic-variables"
          }, this.$styleOptions)), E.load(s?.css, I({
            name: "global-variables"
          }, this.$styleOptions)), E.loadStyle(I({
            name: "global-style"
          }, this.$styleOptions), u), A.setLoadedStyleName("common");
        }
        if (!A.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, g = m.css, v = m.style;
          (p = this.$style) === null || p === void 0 || p.load(g, I({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(I({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), A.setLoadedStyleName(this.$style.name);
        }
        if (!A.isStyleNameLoaded("layer-order")) {
          var y, S, b = (y = this.$style) === null || y === void 0 || (S = y.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(y);
          E.load(b, I({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), A.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, i, r, o = ((n = this.$style) === null || n === void 0 || (i = n.getPresetTheme) === null || i === void 0 ? void 0 : i.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, a = o.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(a, I({
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
      fe.clearLoadedStyleNames(), H.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      H.off("theme:change", this._loadCoreStyles), H.off("theme:change", this._load), H.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return jt(e, n, i);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(i) && !!r[i.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, p = o ? a ? this._useGlobalPT(this._getPTClassValue, i, r) : this._useDefaultPT(this._getPTClassValue, i, r) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, i, I(I({}, r), {}, {
        global: p || {}
      })), m = this._getPTDatasets(i);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : I(I(I({}, p), f), m) : I(I({}, f), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return O(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(i)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(i))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", o = i === "root" && x((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return i !== "transition" && I(I({}, i === "root" && I(I(Ve({}, "".concat(r, "name"), se(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && Ve({}, "".concat(r, "extend"), se(this.$.type.name))), {}, Ve({}, "".concat(this.$attrSelector), ""))), {}, Ve({}, "".concat(r, "section"), se(i)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return G(e) || Kn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var s, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, c = se(i), p = se(n.$name);
        return (s = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && s !== void 0 ? s : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: o(e.originalValue),
        value: o(e.value)
      } : o(e, !0);
    },
    _usePT: function(e, n, i, r) {
      var o = function(g) {
        return n(g, i, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var a, l = e._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, p = o(e.originalValue), f = o(e.value);
        return p === void 0 && f === void 0 ? void 0 : G(f) ? f : G(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : I(I({}, p), f) : f;
      }
      return o(e);
    },
    _useGlobalPT: function(e, n, i) {
      return this._usePT(this.globalPT, e, n, i);
    },
    _useDefaultPT: function(e, n, i) {
      return this._usePT(this.defaultPT, e, n, i);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, I(I({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = O(this.$_attrsWithoutPT, this.ptm(n, i));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, I({
        instance: this
      }, i), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, I(I({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, I(I({}, this.$params), i)), o = this._getOptionValue(mn.inlineStyles, e, I(I({}, this.$params), i));
        return [o, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return Z(i, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return n._getOptionValue(i, n.$name, I({}, n.$params)) || Z(i, I({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(i) {
        var r = Ae(i, 1), o = r[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return I(I({
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
        var n = Ae(e, 1), i = n[0];
        return i?.startsWith("pt:");
      }).reduce(function(e, n) {
        var i = Ae(n, 2), r = i[0], o = i[1], a = r.split(":"), l = os(a), s = Ot(l).slice(1);
        return s?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? o : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Ae(e, 1), i = n[0];
        return !(i != null && i.startsWith("pt:"));
      }).reduce(function(e, n) {
        var i = Ae(n, 2), r = i[0], o = i[1];
        return e[r] = o, e;
      }, {});
    }
  }
}, ds = `
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
`, cs = E.extend({
  name: "baseicon",
  css: ds
});
function Re(t) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Re(t);
}
function gn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function yn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? gn(Object(n), !0).forEach(function(i) {
      ps(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function ps(t, e, n) {
  return (e = fs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function fs(t) {
  var e = hs(t, "string");
  return Re(e) == "symbol" ? e : e + "";
}
function hs(t, e) {
  if (Re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Re(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var xe = {
  name: "BaseIcon",
  extends: Ye,
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
  style: cs,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = qe(this.label);
      return yn(yn({}, !this.isUnstyled && {
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
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
function bn(t, e) {
  return ys(t) || gs(t, e) || vs(t, e) || ms();
}
function ms() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vs(t, e) {
  if (t) {
    if (typeof t == "string") return Sn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sn(t, e) : void 0;
  }
}
function Sn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function gs(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, a, l = [], s = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(s = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function ys(t) {
  if (Array.isArray(t)) return t;
}
function wn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function k(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wn(Object(n), !0).forEach(function(i) {
      $t(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function $t(t, e, n) {
  return (e = bs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function bs(t) {
  var e = Ss(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function Ss(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Be(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _ = {
  _getMeta: function() {
    return [ae(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Z(ae(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var i, r, o;
    return (i = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || i === void 0 ? void 0 : i.config;
  },
  _getOptionValue: jt,
  _getPTValue: function() {
    var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var S = _._getOptionValue.apply(_, arguments);
      return G(S) || Kn(S) ? {
        class: S
      } : S;
    }, u = ((e = i.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = i.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = l ? _._useDefaultPT(i, i.defaultPT(), s, o, a) : void 0, g = _._usePT(i, _._getPT(r, i.$name), s, o, k(k({}, a), {}, {
      global: m || {}
    })), v = _._getPTDatasets(i, o);
    return c || !c && g ? f ? _._mergeProps(i, f, m, g, v) : k(k(k({}, m), g), v) : k(k({}, g), v);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = "data-pc-";
    return k(k({}, n === "root" && $t({}, "".concat(i, "name"), se(e.$name))), {}, $t({}, "".concat(i, "section"), se(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, r = function(a) {
      var l, s = i ? i(a) : a, u = se(n);
      return (l = s?.[u]) !== null && l !== void 0 ? l : s;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, a = function(v) {
      return i(v, r, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = s.mergeSections, d = u === void 0 ? !0 : u, c = s.mergeProps, p = c === void 0 ? !1 : c, f = a(n.originalValue), m = a(n.value);
      return f === void 0 && m === void 0 ? void 0 : G(m) ? m : G(f) ? f : d || !d && m ? p ? _._mergeProps(e, p, f, m) : k(k({}, f), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return _._usePT(e, n, i, r, o);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = _._getConfig(i, r), a = {
      nonce: o == null || (e = o.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    _._loadCoreStyles(n, a), _._loadThemeStyles(n, a), _._loadScopedThemeStyles(n, a), _._removeThemeListeners(n), n.$loadStyles = function() {
      return _._loadThemeStyles(n, a);
    }, _._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!fe.isStyleNameLoaded((e = i.$style) === null || e === void 0 ? void 0 : e.name) && (n = i.$style) !== null && n !== void 0 && n.name) {
      var o;
      E.loadCSS(r), (o = i.$style) === null || o === void 0 || o.loadCSS(r), fe.setLoadedStyleName(i.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, i, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!A.isStyleNameLoaded("common")) {
        var a, l, s = ((a = r.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = s.primitive, d = s.semantic, c = s.global, p = s.style;
        E.load(u?.css, k({
          name: "primitive-variables"
        }, o)), E.load(d?.css, k({
          name: "semantic-variables"
        }, o)), E.load(c?.css, k({
          name: "global-variables"
        }, o)), E.loadStyle(k({
          name: "global-style"
        }, o), p), A.setLoadedStyleName("common");
      }
      if (!A.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (i = r.$style) !== null && i !== void 0 && i.name) {
        var f, m, g, v, y = ((f = r.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, S = y.css, b = y.style;
        (g = r.$style) === null || g === void 0 || g.load(S, k({
          name: "".concat(r.$style.name, "-variables")
        }, o)), (v = r.$style) === null || v === void 0 || v.loadStyle(k({
          name: "".concat(r.$style.name, "-style")
        }, o), b), A.setLoadedStyleName(r.$style.name);
      }
      if (!A.isStyleNameLoaded("layer-order")) {
        var h, w, P = (h = r.$style) === null || h === void 0 || (w = h.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(h);
        E.load(P, k({
          name: "layer-order",
          first: !0
        }, o)), A.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = e.preset();
    if (i && e.$attrSelector) {
      var r, o, a, l = ((r = e.$style) === null || r === void 0 || (o = r.getPresetTheme) === null || o === void 0 ? void 0 : o.call(r, i, "[".concat(e.$attrSelector, "]"))) || {}, s = l.css, u = (a = e.$style) === null || a === void 0 ? void 0 : a.load(s, k({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    fe.clearLoadedStyleNames(), H.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    H.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, i, r, o, a) {
    var l, s, u = "on".concat(Yr(n)), d = _._getConfig(r, o), c = i?.$instance, p = _._usePT(c, _._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, e), _._getOptionValue, "hooks.".concat(u)), f = _._useDefaultPT(c, d == null || (s = d.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[e], _._getOptionValue, "hooks.".concat(u)), m = {
      el: i,
      binding: r,
      vnode: o,
      prevVnode: a
    };
    p?.(c, m), f?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      i[r - 2] = arguments[r];
    return lt(e) ? e.apply(void 0, i) : O.apply(void 0, i);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = function(l, s, u, d, c) {
      var p, f, m, g;
      s._$instances = s._$instances || {};
      var v = _._getConfig(u, d), y = s._$instances[e] || {}, S = qe(y) ? k(k({}, n), n?.methods) : {};
      s._$instances[e] = k(k({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: s,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || s || void 0,
        $style: k({
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
        $attrSelector: (p = s.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return _._getPT(v?.pt, void 0, function(h) {
            var w;
            return h == null || (w = h.directives) === null || w === void 0 ? void 0 : w[e];
          });
        },
        isUnstyled: function() {
          var h, w;
          return ((h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (w = s._$instances[e]) === null || w === void 0 || (w = w.$binding) === null || w === void 0 || (w = w.value) === null || w === void 0 ? void 0 : w.unstyled : v?.unstyled;
        },
        theme: function() {
          var h;
          return (h = s._$instances[e]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return _._getPTValue(s._$instances[e], (h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, w, k({}, P));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", P = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return _._getPTValue(s._$instances[e], h, w, P, !1);
        },
        cx: function() {
          var h, w, P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = s._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : _._getOptionValue((w = s._$instances[e]) === null || w === void 0 || (w = w.$style) === null || w === void 0 ? void 0 : w.classes, P, k({}, $));
        },
        sx: function() {
          var h, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P ? _._getOptionValue((h = s._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, w, k({}, $)) : void 0;
        }
      }, S), s.$instance = s._$instances[e], (f = (m = s.$instance)[l]) === null || f === void 0 || f.call(m, s, u, d, c), s["$".concat(e)] = s.$instance, _._hook(e, l, s, u, d, c), s.$pd || (s.$pd = {}), s.$pd[e] = k(k({}, (g = s.$pd) === null || g === void 0 ? void 0 : g[e]), {}, {
        name: e,
        instance: s._$instances[e]
      });
    }, r = function(l) {
      var s, u, d, c = l._$instances[e], p = c?.watch, f = function(v) {
        var y, S = v.newValue, b = v.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(c, S, b);
      }, m = function(v) {
        var y, S = v.newValue, b = v.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, S, b);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (s = p.config) === null || s === void 0 || s.call(c, c?.$primevueConfig), he.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), he.on("config:ripple:change", m);
    }, o = function(l) {
      var s = l._$instances[e].$watchersCallback;
      s && (he.off("config:change", s.config), he.off("config:ripple:change", s["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: go("pd")
        }, i("created", l, s, u, d);
      },
      beforeMount: function(l, s, u, d) {
        var c;
        _._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), i("beforeMount", l, s, u, d), r(l);
      },
      mounted: function(l, s, u, d) {
        var c;
        _._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), i("mounted", l, s, u, d);
      },
      beforeUpdate: function(l, s, u, d) {
        i("beforeUpdate", l, s, u, d);
      },
      updated: function(l, s, u, d) {
        var c;
        _._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), i("updated", l, s, u, d);
      },
      beforeUnmount: function(l, s, u, d) {
        var c;
        o(l), _._removeThemeListeners((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance), i("beforeUnmount", l, s, u, d);
      },
      unmounted: function(l, s, u, d) {
        var c;
        (c = l.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), i("unmounted", l, s, u, d);
      }
    };
  },
  extend: function() {
    var e = _._getMeta.apply(_, arguments), n = bn(e, 2), i = n[0], r = n[1];
    return k({
      extend: function() {
        var a = _._getMeta.apply(_, arguments), l = bn(a, 2), s = l[0], u = l[1];
        return _.extend(s, k(k(k({}, r), r?.methods), u));
      }
    }, _._extend(i, r));
  }
}, ws = `
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
`, Os = {
  root: "p-ink"
}, $s = E.extend({
  name: "ripple-directive",
  style: ws,
  classes: Os
}), Cs = _.extend({
  style: $s
});
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function _s(t) {
  return ks(t) || Ps(t) || Ts(t) || Is();
}
function Is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ts(t, e) {
  if (t) {
    if (typeof t == "string") return Ct(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ct(t, e) : void 0;
  }
}
function Ps(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ks(t) {
  if (Array.isArray(t)) return Ct(t);
}
function Ct(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function On(t, e, n) {
  return (e = Ls(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ls(t) {
  var e = xs(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function xs(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (He(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var As = Cs.extend("ripple", {
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
      n || (n = oo("span", On(On({
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
      var n = this, i = e.currentTarget, r = this.getInk(i);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && pt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !ye(r) && !be(r)) {
          var o = Math.max(qn(i), po(i));
          r.style.height = o + "px", r.style.width = o + "px";
        }
        var a = co(i), l = e.pageX - a.left + document.body.scrollTop - be(r) / 2, s = e.pageY - a.top + document.body.scrollLeft - ye(r) / 2;
        r.style.top = s + "px", r.style.left = l + "px", !this.isUnstyled() && Jr(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && pt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && pt(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? _s(e.children).find(function(n) {
        return ao(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function Es(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Vs(t, e) {
  for (var n = 0; n < e.length; n++) {
    var i = e[n];
    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, Fs(i.key), i);
  }
}
function js(t, e, n) {
  return e && Vs(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Fs(t) {
  var e = Ns(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function Ns(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ke(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Ms = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Es(this, t), this.element = e, this.listener = n;
  }
  return js(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = fo(this.element);
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
})(), zs = Ft();
const Ds = "data-wippy-overlay-layer";
function li() {
  return typeof window < "u" && typeof window.document < "u";
}
function ui() {
  return li() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Rs() {
  return ui() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Bs = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Hs = 0;
const st = /* @__PURE__ */ new WeakMap();
function $n(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ks(t, e) {
  if (!Bs.test(t.className))
    return;
  const n = t.style.cssText;
  $n(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!st.has(t)) {
    const i = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && $n(t, e);
    });
    i.observe(t, { attributes: !0, attributeFilter: ["style"] }), st.set(t, i);
  }
}
function zt(t) {
  const e = st.get(t);
  e && (e.disconnect(), st.delete(t));
}
function Us(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function _t(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const at = /* @__PURE__ */ new Set(), Dt = /* @__PURE__ */ new WeakMap();
let Cn = !1, It = !1;
function Ws() {
  It = !1;
  for (const t of at) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && zt(e);
      at.delete(t), Dt.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && _t(t);
  }
}
function _n() {
  It || (It = !0, requestAnimationFrame(Ws));
}
function Gs(t) {
  const e = document.createElement("div");
  e.setAttribute(Ds, "");
  const n = ui();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  _t(e);
  const i = new MutationObserver((r) => {
    const o = e.__wippyAnchorName;
    for (const a of r) {
      if (o)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Ks(l, o);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && zt(l);
    }
    e.isConnected && e.childElementCount > 0 && _t(e);
  });
  return i.observe(e, { childList: !0 }), Dt.set(e, i), at.add(e), Cn || (Cn = !0, window.addEventListener("scroll", _n, { capture: !0, passive: !0 }), window.addEventListener("resize", _n, { passive: !0 })), e;
}
function In(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Gs(t.hostRoot), Rs())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Hs}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Tn(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && zt(e);
    at.delete(t.layer), Dt.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Pn = !1;
function qs() {
  if (Pn)
    return;
  Pn = !0;
  const t = Mt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    li() && (this.hostRoot = Us(this.$el), this.mounted = !0, this.hostRoot && (this.inline || In(this), this.$watch("inline", (e) => {
      e ? Tn(this) : In(this);
    })));
  }, t.render = function() {
    return this.inline ? j(this.$slots, "default", { key: 0 }) : this.mounted ? qi(Vn, { key: 1, to: this.resolvedTarget || document.body }, [
      j(this.$slots, "default")
    ]) : W("", !0);
  }, t.unmounted = function() {
    Tn(this);
  };
}
const Ys = {
  install: (t) => {
    qs(), t.use(ns, { theme: "none" });
  }
};
var di = {
  name: "BlankIcon",
  extends: xe
};
function Zs(t) {
  return ea(t) || Xs(t) || Qs(t) || Js();
}
function Js() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qs(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function Xs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ea(t) {
  if (Array.isArray(t)) return Tt(t);
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ta(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Zs(e[0] || (e[0] = [F("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
di.render = ta;
var ci = {
  name: "CheckIcon",
  extends: xe
};
function na(t) {
  return sa(t) || oa(t) || ra(t) || ia();
}
function ia() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ra(t, e) {
  if (t) {
    if (typeof t == "string") return Pt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(t, e) : void 0;
  }
}
function oa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function sa(t) {
  if (Array.isArray(t)) return Pt(t);
}
function Pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function aa(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), na(e[0] || (e[0] = [F("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ci.render = aa;
var pi = {
  name: "ChevronDownIcon",
  extends: xe
};
function la(t) {
  return pa(t) || ca(t) || da(t) || ua();
}
function ua() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function da(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function ca(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function pa(t) {
  if (Array.isArray(t)) return kt(t);
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function fa(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), la(e[0] || (e[0] = [F("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
pi.render = fa;
var fi = {
  name: "SearchIcon",
  extends: xe
};
function ha(t) {
  return ya(t) || ga(t) || va(t) || ma();
}
function ma() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function ga(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ya(t) {
  if (Array.isArray(t)) return Lt(t);
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ba(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ha(e[0] || (e[0] = [F("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
fi.render = ba;
var Rt = {
  name: "SpinnerIcon",
  extends: xe
};
function Sa(t) {
  return Ca(t) || $a(t) || Oa(t) || wa();
}
function wa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Oa(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function $a(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ca(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function _a(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Sa(e[0] || (e[0] = [F("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rt.render = _a;
var hi = {
  name: "TimesIcon",
  extends: xe
};
function Ia(t) {
  return La(t) || ka(t) || Pa(t) || Ta();
}
function Ta() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pa(t, e) {
  if (t) {
    if (typeof t == "string") return At(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(t, e) : void 0;
  }
}
function ka(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function La(t) {
  if (Array.isArray(t)) return At(t);
}
function At(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function xa(t, e, n, i, r, o) {
  return C(), T("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ia(e[0] || (e[0] = [F("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hi.render = xa;
var Aa = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, Ea = {
  root: "p-iconfield"
}, Va = E.extend({
  name: "iconfield",
  style: Aa,
  classes: Ea
}), ja = {
  name: "BaseIconField",
  extends: Ye,
  style: Va,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, mi = {
  name: "IconField",
  extends: ja,
  inheritAttrs: !1
};
function Fa(t, e, n, i, r, o) {
  return C(), T("div", O({
    class: t.cx("root")
  }, t.ptmi("root")), [j(t.$slots, "default")], 16);
}
mi.render = Fa;
var Na = {
  root: "p-inputicon"
}, Ma = E.extend({
  name: "inputicon",
  classes: Na
}), za = {
  name: "BaseInputIcon",
  extends: Ye,
  style: Ma,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, vi = {
  name: "InputIcon",
  extends: za,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Da(t, e, n, i, r, o) {
  return C(), T("span", O({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [j(t.$slots, "default")], 16);
}
vi.render = Da;
var Ra = {
  name: "BaseEditableHolder",
  extends: Ye,
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
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var i, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (i = (r = this.formField).onChange) === null || i === void 0 || i.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), i = 0; i < e; i++)
        n[i] = arguments[i];
      return n.find(x);
    }
  },
  computed: {
    $filled: function() {
      return x(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, gi = {
  name: "BaseInput",
  extends: Ra,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, Ba = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Ha = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ka = E.extend({
  name: "inputtext",
  style: Ba,
  classes: Ha
}), Ua = {
  name: "BaseInputText",
  extends: gi,
  style: Ka,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function Wa(t, e, n) {
  return (e = Ga(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ga(t) {
  var e = qa(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function qa(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ue(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var yi = {
  name: "InputText",
  extends: Ua,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return O(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Te(Wa({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ya = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Za(t, e, n, i, r, o) {
  return C(), T("input", O({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Ya);
}
yi.render = Za;
var Ja = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Qa = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, kn = E.extend({
  name: "virtualscroller",
  css: Qa,
  style: Ja
}), Xa = {
  name: "BaseVirtualScroller",
  extends: Ye,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: kn,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    kn.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function Ln(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ln(Object(n), !0).forEach(function(i) {
      bi(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function bi(t, e, n) {
  return (e = el(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function el(t) {
  var e = tl(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function tl(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (We(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Si = {
  name: "VirtualScroller",
  extends: Xa,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      rt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = be(this.element), this.defaultHeight = ye(this.element), this.defaultContentWidth = be(this.content), this.defaultContentHeight = ye(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), o = this.isHorizontal(), a = r ? e.every(function($) {
        return $ > -1;
      }) : e > -1;
      if (a) {
        var l = this.first, s = this.element, u = s.scrollTop, d = u === void 0 ? 0 : u, c = s.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, g = this.getContentPosition(), v = this.itemSize, y = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, z = arguments.length > 1 ? arguments[1] : void 0;
          return L <= z ? 0 : L;
        }, S = function(L, z, D) {
          return L * z + D;
        }, b = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: L,
            top: z,
            behavior: i
          });
        }, h = r ? {
          rows: 0,
          cols: 0
        } : 0, w = !1, P = !1;
        r ? (h = {
          rows: y(e[0], m[0]),
          cols: y(e[1], m[1])
        }, b(S(h.cols, v[1], g.left), S(h.rows, v[0], g.top)), P = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, w = h.rows !== l.rows || h.cols !== l.cols) : (h = y(e, m), o ? b(S(h, v, g.left), d) : b(p, S(h, v, g.top)), P = this.lastScrollPos !== (o ? p : d), w = h !== l), this.isRangeChanged = w, P && (this.first = h);
      }
    },
    scrollInView: function(e, n) {
      var i = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), a = this.isHorizontal(), l = o ? e.every(function(v) {
          return v > -1;
        }) : e > -1;
        if (l) {
          var s = this.getRenderedRange(), u = s.first, d = s.viewport, c = function() {
            var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: y,
              top: S,
              behavior: r
            });
          }, p = n === "to-start", f = n === "to-end";
          if (p) {
            if (o)
              d.first.rows - u.rows > e[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var m = (d.first - 1) * this.itemSize;
              a ? c(m, 0) : c(0, m);
            }
          } else if (f) {
            if (o)
              d.last.rows - u.rows <= e[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var g = (d.first + 1) * this.itemSize;
              a ? c(g, 0) : c(0, g);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(c, p) {
        return Math.floor(c / (p || c));
      }, n = this.first, i = 0;
      if (this.element) {
        var r = this.isBoth(), o = this.isHorizontal(), a = this.element, l = a.scrollTop, s = a.scrollLeft;
        if (r)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(s, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? s : l;
          n = e(u, this.itemSize), i = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: i
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, r = this.getContentPosition(), o = this.element ? this.element.offsetWidth - r.left : 0, a = this.element ? this.element.offsetHeight - r.top : 0, l = function(p, f) {
        return Math.ceil(p / (f || p));
      }, s = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: l(a, i[0]),
        cols: l(o, i[1])
      } : l(n ? o : a, i), d = this.d_numToleratedItems || (e ? [s(u.rows), s(u.cols)] : s(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), i = this.first, r = this.calculateNumItems(), o = r.numItemsInViewport, a = r.numToleratedItems, l = function(d, c, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + c + (d < p ? 2 : 3) * p, f);
      }, s = n ? {
        rows: l(i.rows, o.rows, a[0]),
        cols: l(i.cols, o.cols, a[1], !0)
      } : l(i, o, a);
      this.last = s, this.numItemsInViewport = o, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(e.step ? e.step : s, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), i = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [be(e.element), ye(e.element)], a = o[0], l = o[1];
          (n || i) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || r) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), i = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: r,
          bottom: o,
          x: n + i,
          y: r + o
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), i = this.isHorizontal(), r = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), l = function(u, d) {
          return e.element.style[u] = d;
        };
        n || i ? (l("height", a), l("width", o)) : l("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var i = this.isBoth(), r = this.isHorizontal(), o = this.getContentPosition(), a = function(s, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Ee(Ee({}, e.spacerStyle), bi({}, "".concat(s), (u || []).length * d + c + "px"));
        };
        i ? (a("height", n, this.itemSize[0], o.y), a("width", this.columns || n[1], this.itemSize[1], o.x)) : r ? a("width", this.columns || n, this.itemSize, o.x) : a("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), r = this.isHorizontal(), o = e ? e.first : this.first, a = function(d, c) {
          return d * c;
        }, l = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ee(Ee({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(c, "px, 0)")
          });
        };
        if (i)
          l(a(o.cols, this.itemSize[1]), a(o.rows, this.itemSize[0]));
        else {
          var s = a(o, this.itemSize);
          r ? l(s, 0) : l(0, s);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, i = e.target, r = this.isBoth(), o = this.isHorizontal(), a = this.getContentPosition(), l = function(V, M) {
        return V ? V > M ? V - M : V : 0;
      }, s = function(V, M) {
        return Math.floor(V / (M || V));
      }, u = function(V, M, q, Y, R, U) {
        return V <= R ? R : U ? q - Y - R : M + R - 1;
      }, d = function(V, M, q, Y, R, U, J, ce) {
        if (V <= U) return 0;
        var ie = Math.max(0, J ? V < M ? q : V - U : V > M ? q : V - 2 * U), Q = n.getLast(ie, ce);
        return ie > Q ? Q - R : ie;
      }, c = function(V, M, q, Y, R, U) {
        var J = M + Y + 2 * R;
        return V >= R && (J += R + 1), n.getLast(J, U);
      }, p = l(i.scrollTop, a.top), f = l(i.scrollLeft, a.left), m = r ? {
        rows: 0,
        cols: 0
      } : 0, g = this.last, v = !1, y = this.lastScrollPos;
      if (r) {
        var S = this.lastScrollPos.top <= p, b = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (S || b)) {
          var h = {
            rows: s(p, this.itemSize[0]),
            cols: s(f, this.itemSize[1])
          }, w = {
            rows: u(h.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], S),
            cols: u(h.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], b)
          };
          m = {
            rows: d(h.rows, w.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], S),
            cols: d(h.cols, w.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], b, !0)
          }, g = {
            rows: c(h.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(h.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, v = m.rows !== this.first.rows || g.rows !== this.last.rows || m.cols !== this.first.cols || g.cols !== this.last.cols || this.isRangeChanged, y = {
            top: p,
            left: f
          };
        }
      } else {
        var P = o ? f : p, $ = this.lastScrollPos <= P;
        if (!this.appendOnly || this.appendOnly && $) {
          var L = s(P, this.itemSize), z = u(L, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $);
          m = d(L, z, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $), g = c(L, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), v = m !== this.first || g !== this.last || this.isRangeChanged, y = P;
        }
      }
      return {
        first: m,
        last: g,
        isRangeChanged: v,
        scrollPos: y
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), i = n.first, r = n.last, o = n.isRangeChanged, a = n.scrollPos;
      if (o) {
        var l = {
          first: i,
          last: r
        };
        if (this.setContentPosition(l), this.first = i, this.last = r, this.lastScrollPos = a, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(i)) {
          var s, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((s = this.items) === null || s === void 0 ? void 0 : s.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : r, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, c = this.lazyLoadState.first !== d.first || this.lazyLoadState.last !== d.last;
          c && this.$emit("lazy-load", d), this.lazyLoadState = d;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var i = this.onScrollPositionChange(e), r = i.isRangeChanged, o = r || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (rt(e.element)) {
          var n = e.isBoth(), i = e.isVertical(), r = e.isHorizontal(), o = [be(e.element), ye(e.element)], a = o[0], l = o[1], s = a !== e.defaultWidth, u = l !== e.defaultHeight, d = n ? s || u : r ? s : i ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = l, e.defaultContentWidth = be(e.content), e.defaultContentHeight = ye(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, i = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: i,
        count: n,
        first: i === 0,
        last: i === n - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var i = this.loaderArr.length;
      return Ee({
        index: e,
        count: i,
        first: e === 0,
        last: e === i - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || ut(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Rt
  }
}, nl = ["tabindex"];
function il(t, e, n, i, r, o) {
  var a = oe("SpinnerIcon");
  return t.disabled ? (C(), T(ke, {
    key: 1
  }, [j(t.$slots, "default"), j(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (C(), T("div", O({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [j(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: r.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [F("div", O({
      ref: o.contentRef,
      class: o.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(C(!0), T(ke, null, vt(o.loadedItems, function(l, s) {
      return j(t.$slots, "item", {
        key: s,
        item: l,
        options: o.getOptions(s)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (C(), T("div", O({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : W("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (C(), T("div", O({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (C(!0), T(ke, {
    key: 0
  }, vt(r.loaderArr, function(l, s) {
    return j(t.$slots, "loader", {
      key: s,
      options: o.getLoaderOptions(s, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : W("", !0), j(t.$slots, "loadingicon", {}, function() {
    return [pe(a, O({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : W("", !0)], 16, nl));
}
Si.render = il;
var rl = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, ol = {
  root: function(e) {
    var n = e.instance, i = e.props, r = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": i.size === "small",
      "p-select-lg p-inputfield-lg": i.size === "large"
    }];
  },
  label: function(e) {
    var n, i = e.instance, r = e.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && i.label === r.placeholder,
      "p-select-label-empty": !r.editable && !i.$slots.value && (i.label === "p-emptylabel" || ((n = i.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(e) {
    var n = e.instance, i = e.props, r = e.state, o = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && i.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, sl = E.extend({
  name: "select",
  style: rl,
  classes: ol
}), al = {
  name: "BaseSelect",
  extends: gi,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
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
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: sl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Ge(t) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ge(t);
}
function ll(t) {
  return pl(t) || cl(t) || dl(t) || ul();
}
function ul() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dl(t, e) {
  if (t) {
    if (typeof t == "string") return Et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(t, e) : void 0;
  }
}
function cl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function pl(t) {
  if (Array.isArray(t)) return Et(t);
}
function Et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function xn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function An(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? xn(Object(n), !0).forEach(function(i) {
      ge(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : xn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function ge(t, e, n) {
  return (e = fl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function fl(t) {
  var e = hl(t, "string");
  return Ge(e) == "symbol" ? e : e + "";
}
function hl(t, e) {
  if (Ge(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ge(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wi = {
  name: "Select",
  extends: al,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (ft.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? de(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? de(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? de(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, i, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: i,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(i, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? de(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return de(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return de(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && le(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && le(n.$refs.focusInput);
      };
      setTimeout(function() {
        i();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var i, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (i = (r = n.formField).onBlur) === null || i === void 0 || i.call(r, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (ho())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var i = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !i && Gr(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && le(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var i = this.searchOptions(e, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && x(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? lo(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      le(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? uo(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      le(n);
    },
    onOptionSelect: function(e, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(e, r), i && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      zs.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var i = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, i), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        e.shiftKey ? i.setSelectionRange(0, e.target.selectionStart) : (i.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        if (e.shiftKey)
          i.setSelectionRange(e.target.selectionStart, i.value.length);
        else {
          var r = i.value.length;
          i.setSelectionRange(r, r), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (le(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      ft.set("overlay", e, this.$primevue.config.zIndex.overlay), no(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && le(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && le(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      ft.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? io(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = qn(this.$el) + "px", to(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var i = n.composedPath();
        e.overlayVisible && e.overlay && !i.includes(e.$el) && !i.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Ms(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !mo() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && rt(n) && (this.labelClickListener = function() {
          le(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && rt(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Nt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return x(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Bn(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Xt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, i = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, i = e > 0 ? Xt(this.visibleOptions.slice(0, e), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var i = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, o = !1;
      return x(this.searchValue) && (r = this.visibleOptions.findIndex(function(a) {
        return i.isOptionExactMatched(a);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(a) {
        return i.isOptionStartsWith(a);
      })), r !== -1 && (o = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = ut(e.list, 'li[id="'.concat(i, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(i, r, o) {
        i.push({
          optionGroup: r,
          group: !0,
          index: o
        });
        var a = n.getOptionGroupChildren(r);
        return a && a.forEach(function(l) {
          return i.push(l);
        }), i;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var i = Lo.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], o = [];
          return r.forEach(function(a) {
            var l = e.getOptionGroupChildren(a), s = l.filter(function(u) {
              return i.includes(u);
            });
            s.length > 0 && o.push(An(An({}, a), {}, ge({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", ll(s))));
          }), this.flatOptions(o);
        }
        return i;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return x(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return Te(ge({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Te(ge(ge({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Te(ge({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Te(ge({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: As
  },
  components: {
    InputText: yi,
    VirtualScroller: Si,
    Portal: Mt,
    InputIcon: vi,
    IconField: mi,
    TimesIcon: hi,
    ChevronDownIcon: pi,
    SpinnerIcon: Rt,
    SearchIcon: fi,
    CheckIcon: ci,
    BlankIcon: di
  }
}, ml = ["id", "data-p"], vl = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], gl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], yl = ["data-p"], bl = ["id"], Sl = ["id"], wl = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Ol(t, e, n, i, r, o) {
  var a = oe("SpinnerIcon"), l = oe("InputText"), s = oe("SearchIcon"), u = oe("InputIcon"), d = oe("IconField"), c = oe("CheckIcon"), p = oe("BlankIcon"), f = oe("VirtualScroller"), m = oe("Portal"), g = Yi("ripple");
  return C(), T("div", O({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (C(), T("input", O({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: o.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), null, 16, vl)) : (C(), T("span", O({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), [j(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var v;
    return [dt(te(o.label === "p-emptylabel" ? " " : (v = o.label) !== null && v !== void 0 ? v : "empty"), 1)];
  })], 16, gl)), o.isClearIconVisible ? j(t.$slots, "clearicon", {
    key: 2,
    class: Je(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(C(), ve(Ut(t.clearIcon ? "i" : "TimesIcon"), O({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : W("", !0), F("div", O({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? j(t.$slots, "loadingicon", {
    key: 0,
    class: Je(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (C(), T("span", O({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (C(), ve(a, O({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : j(t.$slots, "dropdownicon", {
    key: 1,
    class: Je(t.cx("dropdownIcon"))
  }, function() {
    return [(C(), ve(Ut(t.dropdownIcon ? "span" : "ChevronDownIcon"), O({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), pe(m, {
    appendTo: t.appendTo
  }, {
    default: $e(function() {
      return [pe(Zi, O({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: $e(function() {
          return [r.overlayVisible ? (C(), T("div", O({
            key: 0,
            ref: o.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, t.ptm("overlay")), [F("span", O({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), j(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (C(), T("div", O({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [pe(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: $e(function() {
              return [pe(l, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: Je(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), pe(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: $e(function() {
                  return [j(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (C(), T("span", O({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (C(), ve(s, Ji(O({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), F("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), te(o.filterResultMessageText), 17)], 16)) : W("", !0), F("div", O({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [pe(f, O({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Qi({
            content: $e(function(v) {
              var y = v.styleClass, S = v.contentRef, b = v.items, h = v.getItemOptions, w = v.contentStyle, P = v.itemSize;
              return [F("ul", O({
                ref: function(L) {
                  return o.listRef(L, S);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), y],
                style: w,
                role: "listbox"
              }, t.ptm("list")), [(C(!0), T(ke, null, vt(b, function($, L) {
                return C(), T(ke, {
                  key: o.getOptionRenderKey($, o.getOptionIndex(L, h))
                }, [o.isOptionGroup($) ? (C(), T("li", O({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(L, h),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [j(t.$slots, "optiongroup", {
                  option: $.optionGroup,
                  index: o.getOptionIndex(L, h)
                }, function() {
                  return [F("span", O({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), te(o.getOptionGroupLabel($.optionGroup)), 17)];
                })], 16, Sl)) : Xi((C(), T("li", O({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(L, h),
                  class: t.cx("option", {
                    option: $,
                    focusedOption: o.getOptionIndex(L, h)
                  }),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel($),
                  "aria-selected": o.isSelected($),
                  "aria-disabled": o.isOptionDisabled($),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(L, h)),
                  onMousedown: function(D) {
                    return o.onOptionSelect(D, $);
                  },
                  onMousemove: function(D) {
                    return o.onOptionMouseMove(D, o.getOptionIndex(L, h));
                  },
                  onClick: e[8] || (e[8] = er(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected($),
                  "data-p-focused": r.focusedOptionIndex === o.getOptionIndex(L, h),
                  "data-p-disabled": o.isOptionDisabled($)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions($, h, L, "option")), [t.checkmark ? (C(), T(ke, {
                  key: 0
                }, [o.isSelected($) ? (C(), ve(c, O({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (C(), ve(p, O({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : W("", !0), j(t.$slots, "option", {
                  option: $,
                  selected: o.isSelected($),
                  index: o.getOptionIndex(L, h)
                }, function() {
                  return [F("span", O({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), te(o.getOptionLabel($)), 17)];
                })], 16, wl)), [[g]])], 64);
              }), 128)), r.filterValue && (!b || b && b.length === 0) ? (C(), T("li", O({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "emptyfilter", {}, function() {
                return [dt(te(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (C(), T("li", O({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "empty", {}, function() {
                return [dt(te(o.emptyMessageText), 1)];
              })], 16)) : W("", !0)], 16, bl)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: $e(function(v) {
              var y = v.options;
              return [j(t.$slots, "loader", {
                options: y
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), j(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (C(), T("span", O({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), te(o.emptyMessageText), 17)) : W("", !0), F("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), te(o.selectedMessageText), 17), F("span", O({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, yl)) : W("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, ml);
}
wi.render = Ol;
const $l = { class: "hs" }, Cl = { class: "hs-field" }, _l = ["value"], Il = { class: "hs-field" }, Tl = { class: "hs-summary" }, Pl = {
  key: 0,
  class: "hs-hint"
}, kl = {
  key: 1,
  class: "hs-error",
  role: "alert"
}, Ll = {
  key: 2,
  class: "hs-error"
}, xl = 240, Al = /* @__PURE__ */ tr({
  __name: "HubSpotPicker",
  setup(t) {
    const e = Nr(), n = Mr(), i = B([]), r = B([]), o = B(""), a = B("contacts"), l = B(!1), s = B(!1), u = B(""), d = B(""), c = Wt(() => r.value.find((h) => h.id === a.value)?.name || a.value), p = Wt(
      () => JSON.stringify({ connection_id: o.value })
    );
    function f(b) {
      o.value = b?.connection_id || "", a.value = b?.object_type || "contacts";
    }
    Ie(
      () => e.value.config,
      (b) => f(b),
      { immediate: !0 }
    );
    function m() {
      n("config-changed", {
        connection_id: o.value || void 0,
        object_type: a.value || void 0
      });
    }
    async function g() {
      l.value = !0, u.value = "";
      try {
        const { data: b } = await qt.get("/api/v1/connections?provider=hubspot");
        i.value = b && b.connections || [];
      } catch (b) {
        u.value = b instanceof Error ? b.message : String(b);
      } finally {
        l.value = !1;
      }
    }
    async function v() {
      if (r.value = [], !!o.value) {
        s.value = !0, u.value = "";
        try {
          const { data: b } = await qt.post(
            `/api/v1/connections/${encodeURIComponent(o.value)}/discover_resources`,
            {}
          ), h = b && typeof b == "object" ? b : null;
          if (h?.success === !1) {
            const $ = typeof h.error == "string" ? h.error.trim().slice(0, xl) : "";
            u.value = $ ? `HubSpot object discovery failed: ${$}` : "HubSpot object discovery failed";
            return;
          }
          const P = (Array.isArray(h?.resources) ? h.resources : []).filter(($) => $.type === "hubspot_object" && $.id);
          if (!P.length) {
            u.value = "HubSpot object discovery returned no readable objects";
            return;
          }
          r.value = P, r.value.some(($) => $.id === a.value) || (a.value = r.value[0]?.id || a.value);
        } catch (b) {
          r.value = [], u.value = b instanceof Error ? b.message : "HubSpot object discovery failed";
        } finally {
          s.value = !1;
        }
      }
    }
    function y(b) {
      const h = b.detail;
      o.value = h?.connection_id || "", m(), v();
    }
    function S() {
      m();
    }
    return En(async () => {
      try {
        await ur("wc-connection-picker", { timeoutMs: 8e3 });
      } catch (b) {
        d.value = b instanceof Error ? b.message : "Connection picker unavailable";
      }
      await g(), o.value && await v();
    }), (b, h) => (C(), T("div", $l, [
      F("label", Cl, [
        h[1] || (h[1] = F("span", null, "HubSpot connection", -1)),
        F("wc-connection-picker", {
          source: "/api/v1/connections",
          providers: "hubspot",
          "reply-only": "false",
          placeholder: "Select a connection",
          value: p.value,
          onChange: y
        }, null, 40, _l)
      ]),
      F("label", Il, [
        h[2] || (h[2] = F("span", null, "CRM object", -1)),
        pe(nr(wi), {
          modelValue: a.value,
          "onUpdate:modelValue": h[0] || (h[0] = (w) => a.value = w),
          options: r.value,
          "option-label": "name",
          "option-value": "id",
          loading: s.value,
          "aria-label": "CRM object",
          onChange: S
        }, null, 8, ["modelValue", "options", "loading"])
      ]),
      F("div", Tl, [
        h[3] || (h[3] = F("span", { class: "hs-dot" }, null, -1)),
        F("span", null, te(s.value ? "Loading objects..." : c.value), 1)
      ]),
      !i.value.length && !l.value ? (C(), T("p", Pl, " No HubSpot connection yet. Add one from the Connections page first. ")) : W("", !0),
      d.value ? (C(), T("p", kl, " Connection picker unavailable: " + te(d.value), 1)) : W("", !0),
      u.value ? (C(), T("p", Ll, te(u.value), 1)) : W("", !0)
    ]));
  }
}), El = ":host,.hs{--hs-bg: var(--p-content-background);--hs-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--hs-border: var(--p-content-border-color);--hs-text: var(--p-text-color);--hs-muted: var(--p-text-muted-color);--hs-primary: var(--p-primary-color);--hs-danger: var(--p-danger-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--hs-text)}.hs{display:flex;flex-direction:column;gap:12px}.hs-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.hs-field>span{color:var(--hs-muted)}.hs-field wc-connection-picker,.hs-field .p-select{width:100%}.hs-field .p-select{padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-bg);color:var(--hs-text);font-size:14px}.hs-hint{margin:0;font-size:13px;color:var(--hs-muted)}.hs-error{margin:0;font-size:13px;color:var(--hs-danger)}.hs-summary{display:flex;gap:8px;align-items:center;min-height:24px;padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-surface);font-size:13px}.hs-dot{width:8px;height:8px;border-radius:999px;background:var(--hs-primary);flex:0 0 auto}", Vl = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Current source/sink config containing connection_id and object_type." } } } }, jl = {
  wippy: Vl
};
class Fl extends zr {
  static get wippyConfig() {
    return {
      propsSchema: jl.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: El
    };
  }
  static get vueConfig() {
    return { rootComponent: Al, plugins: [Ys] };
  }
}
dr(import.meta.url, Fl);
//# sourceMappingURL=picker.js.map
