import { hasInjectionContext as T, inject as y, effectScope as B, ref as g, markRaw as M, createApp as N, defineComponent as $, openBlock as m, createElementBlock as H, normalizeClass as U, createBlock as w, unref as _, createCommentVNode as D, createElementVNode as F, renderSlot as W } from "vue";
import { addCollection as Y, Icon as z } from "@iconify/vue";
import { config as C, addIcons as K, on as J, applyThemeMode as u, host as q, hostCss as G, loadCss as Q } from "@wippy-fe/proxy";
var v = "data-wippy-visible";
function S(r) {
  const e = r.getAttribute(v);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var X = Object.defineProperty, Z = (r, e, t) => e in r ? X(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, l = (r, e, t) => Z(r, typeof e != "symbol" ? e + "" : e, t), rr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], er = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function E(r) {
  const e = r.startsWith("--") ? r : `--${r}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function tr(...r) {
  const e = /* @__PURE__ */ new Set();
  for (const t of r)
    if (t)
      for (const [i, o] of Object.entries(t)) {
        if ((i === "@light" || i === "@dark") && o && typeof o == "object") {
          for (const [s, c] of Object.entries(o)) {
            const p = typeof c == "string" ? E(s) : null;
            p && e.add(p);
          }
          continue;
        }
        const a = typeof o == "string" ? E(i) : null;
        a && e.add(a);
      }
  return [...e].sort();
}
function ir(r) {
  if (r.length === 0)
    return "";
  const e = r.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${er} {
${e}
}`;
}
function or(r, e) {
  const t = ir(e);
  t && V(r, t, "@wippy-fe/css-variables-bridge");
}
function ar(r, e) {
  const i = (e ?? rr).map(async (o) => {
    const a = G[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Q(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, s), null;
    }
  });
  return Promise.all(i).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), r.appendChild(s);
    }
  });
}
function nr(r, e) {
  const t = document.createElement("style");
  t.textContent = e, r.appendChild(t);
}
function V(r, e, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(e), r.adoptedStyleSheets = [...r.adoptedStyleSheets, o];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", t), i.textContent = e, r.appendChild(i);
}
function sr(r, e) {
  V(r, e, "@wippy-fe/custom-css");
}
function P(r) {
  return r.__wippyHost ?? null;
}
function pr(r) {
  return r.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function lr(r, e, t) {
  switch (t.type) {
    case "string":
      return { value: e };
    case "number": {
      const i = Number.parseFloat(e);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${r}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(e, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${r}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(e);
        return t.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${r}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${r}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function k(r, e) {
  const t = {}, i = [];
  for (const [o, a] of Object.entries(e.properties)) {
    const s = r.getAttribute(o), c = pr(o);
    if (s === null) {
      a.default !== void 0 && (t[c] = a.default);
      continue;
    }
    const p = lr(o, s, a);
    p.error ? i.push(p.error) : t[c] = p.value;
  }
  return { props: t, errors: i };
}
var cr = class {
  constructor(r, e) {
    l(this, "_props"), l(this, "_errors"), l(this, "_content"), l(this, "_hostVisibility"), l(this, "_propsListeners", /* @__PURE__ */ new Set()), l(this, "_contentListeners", /* @__PURE__ */ new Set()), l(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), l(this, "_disposed", !1), l(this, "_emitToDom"), l(this, "props"), l(this, "events"), l(this, "content"), l(this, "hostVisibility"), this._props = r.props, this._errors = r.errors, this._content = r.content, this._hostVisibility = r.hostVisibility, this._emitToDom = e;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(i, o) {
        return t._subscribeProps(i, o);
      }
    }, this.events = {
      emit(i, o) {
        t._disposed || t._emitToDom(i, o);
      }
    }, this.content = r.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(i, o) {
        return t._subscribeContent(i, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(i, o) {
        return t._subscribeHostVisibility(i, o);
      }
    };
  }
  /** @internal */
  notifyProps(r, e) {
    if (!this._disposed) {
      this._props = r, this._errors = e;
      for (const t of this._propsListeners)
        t(r, e);
    }
  }
  /** @internal */
  notifyContent(r) {
    if (!this._disposed) {
      this._content = r;
      for (const e of this._contentListeners)
        e(r);
    }
  }
  /** @internal */
  notifyHostVisibility(r, e) {
    if (!(this._disposed || r === e)) {
      this._hostVisibility = r;
      for (const t of this._hostVisibilityListeners)
        t(r, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(r), e?.immediate && r(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(r), e?.immediate && r(this._content);
    const t = () => {
      this._contentListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(r), e?.immediate && r(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, dr = class extends HTMLElement {
  constructor() {
    super(), l(this, "_internals"), l(this, "_contentObserver", null), l(this, "_initialized", !1), l(this, "_container", null), l(this, "_reactive", null), l(this, "_lastProps", null), l(this, "_lastErrors", []), l(this, "_lastContent", null), l(this, "_themeUnsub", null), l(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = S(this);
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
    const r = this.wippyConfig, e = Object.keys(r.propsSchema.properties), t = r.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...t, v])];
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
    return P(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(r, e) {
    this.dispatchEvent(new CustomEvent(r, {
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
      const r = this.constructor.wippyConfig, e = !!r.contentTemplate;
      let t, i;
      if (this._lastProps !== null)
        t = this._lastProps, i = this._lastErrors;
      else {
        const a = k(this, r.propsSchema);
        r.validateProps && a.errors.push(...r.validateProps(a.props)), t = a.props, i = a.errors, this._lastProps = t, this._lastErrors = i;
      }
      const o = e ? this._lastContent ?? this._extractContent(r.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = o), this._reactive = new cr(
        { props: t, errors: i, content: o, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const r = this.constructor.wippyConfig, e = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: r.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(t), r.inlineCss && nr(t, r.inlineCss);
        try {
          const n = C?.theming, b = tr(
            n?.global?.cssVariables,
            n?.children?.cssVariables
          );
          or(t, b);
        } catch {
        }
        if (r.customCss !== !1)
          try {
            const n = C?.theming, b = [n?.global?.customCSS, n?.children?.customCSS].filter(Boolean).join(`
`);
            b && sr(t, b);
          } catch {
          }
        (r.hostCssKeys === void 0 || r.hostCssKeys.length > 0) && ar(t, r.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const p = r.containerClasses ?? [];
        p.length > 0 && i.classList.add(...p), t.appendChild(i), this._container = i, K(Y);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = J("@theme", (p) => this._applyTheme(p)));
      const { props: o, errors: a } = k(this, r.propsSchema);
      r.validateProps && a.push(...r.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let c = null;
      r.contentTemplate && (c = this._extractContent(r.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(r.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, i, s, a, c, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (r) {
      this.onError(r), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: r instanceof Error ? r.message : String(r),
        error: r
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
  _applyTheme(r = q.getThemeMode?.()) {
    u(r, this), this._container && u(r, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), u("auto", this), this._container && u("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(r, e, t) {
    if (e === t)
      return;
    if (r === v) {
      const c = this._hostVisible, p = S(this);
      if (p === c)
        return;
      this._hostVisible = p, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(p, c), this.onHostVisibilityChanged(p, c));
      return;
    }
    const i = this.constructor.wippyConfig, { props: o, errors: a } = k(this, i.propsSchema);
    i.validateProps && a.push(...i.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = a, this._reactive?.notifyProps(s, a), this.onPropsChanged(s, a);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(r) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(r) {
    console.error(`${this.constructor.name} initialization failed:`, r);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(r, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(r, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(r) {
    return this.querySelector(`template[data-type="${r}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(r) {
  }
};
function br(r) {
  return r.__wippyHostBus ?? null;
}
function xr(r) {
  return r.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let R;
const I = (r) => R = r, hr = () => T() && y(A) || R, A = (
  /* istanbul ignore next */
  Symbol()
);
function gr() {
  const r = B(!0), e = r.run(() => g({}));
  let t = [], i = [];
  const o = M({
    install(a) {
      I(o), o._a = a, a.provide(A, o), a.config.globalProperties.$pinia = o, i.forEach((s) => t.push(s)), i = [];
    },
    use(a) {
      return this._a ? t.push(a) : i.push(a), this;
    },
    _p: t,
    _a: null,
    _e: r,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return o;
}
var ur = Object.defineProperty, fr = (r, e, t) => e in r ? ur(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, h = (r, e, t) => fr(r, typeof e != "symbol" ? e + "" : e, t), j = /* @__PURE__ */ Symbol("wippy:emit"), O = /* @__PURE__ */ Symbol("wippy:props"), mr = /* @__PURE__ */ Symbol("wippy:props_error"), kr = /* @__PURE__ */ Symbol("wippy:content"), vr = /* @__PURE__ */ Symbol("wippy:panel-id"), yr = /* @__PURE__ */ Symbol("wippy:layout-bus"), wr = /* @__PURE__ */ Symbol("wippy:host"), _r = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Pr() {
  const r = y(O);
  if (!r)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return r;
}
function Rr() {
  const r = y(j);
  if (!r)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return r;
}
var Ir = class extends dr {
  constructor() {
    super(...arguments), h(this, "_vueApp", null), h(this, "_propsRef", g({})), h(this, "_errorsRef", g([])), h(this, "_contentRef", g(null)), h(this, "_hostVisibilityRef", g(null)), h(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(r, e, t, i, o, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = i, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const n of i)
      this.emitEvent("invalid", { message: n });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((n, b) => {
      this._propsRef.value = n, this._errorsRef.value = [...b];
      for (const d of b)
        this.emitEvent("invalid", { message: d });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((n) => {
      this._contentRef.value = n;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((n) => {
      this._hostVisibilityRef.value = n;
    }, { signal: c.signal });
    const p = (n) => {
      if (c.signal.aborted)
        return;
      const b = hr(), d = N(n.rootComponent);
      this._vueApp = d;
      const x = gr();
      if (n.piniaPlugins)
        for (const f of n.piniaPlugins)
          x.use(f);
      if (d.use(x), n.plugins)
        for (const f of n.plugins)
          d.use(f);
      d.provide(O, this._propsRef), d.provide(mr, this._errorsRef), d.provide(j, this.emitEvent.bind(this)), d.provide(kr, this._contentRef), d.provide(_r, this._hostVisibilityRef), d.provide(vr, xr(this)), d.provide(yr, br(this)), d.provide(wr, P(this)), n.providers && n.providers(d, this), d.mount(e), b && I(b);
    };
    if (s.rootComponent)
      p(s);
    else if (s.lazyConfig) {
      const n = document.createElement("wippy-loading");
      n.setAttribute("no-bg", ""), e.appendChild(n), s.lazyConfig().then((b) => {
        c.signal.aborted || (n.remove(), p(b));
      }).catch((b) => {
        if (c.signal.aborted)
          return;
        const d = b instanceof Error ? b.message : String(b), x = document.createElement("wippy-error");
        x.setAttribute("title", "Failed to load"), x.setAttribute("message", d), n.replaceWith(x), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const zr = ["type", "disabled"], Ar = /* @__PURE__ */ $({
  __name: "KbButton",
  props: {
    variant: { default: "primary" },
    icon: {},
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean },
    type: { default: "button" }
  },
  emits: ["click"],
  setup(r, { emit: e }) {
    const t = e;
    return (i, o) => (m(), H("button", {
      class: U(["kc-btn", [`kc-btn-${r.variant}`, r.small && "sm"]]),
      type: r.type,
      disabled: r.disabled,
      onClick: o[0] || (o[0] = (a) => t("click"))
    }, [
      r.loading ? (m(), w(_(z), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : r.icon ? (m(), w(_(z), {
        key: 1,
        icon: r.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : D("", !0),
      F("span", null, [
        W(i.$slots, "default")
      ])
    ], 10, zr));
  }
});
function L(r) {
  return typeof r == "string" ? r.trim() : "";
}
function Cr(r) {
  return L(r.analysis_model);
}
function jr(r) {
  return Cr(r) !== "";
}
function Or(r, e) {
  const t = L(e);
  if (t) {
    r.retrieval_model = t, r.analysis_model = t;
    return;
  }
  delete r.retrieval_model, r.analysis_model = !1;
}
const Lr = `:host,.kb-page{--kb-bg: var(--p-content-background);--kb-surface: color-mix(in srgb, var(--p-text-color) 4%, var(--p-content-background));--kb-surface-2: color-mix(in srgb, var(--p-text-color) 8%, var(--p-content-background));--kb-border: var(--p-content-border-color);--kb-border-strong: color-mix(in srgb, var(--p-text-color) 18%, transparent);--kb-text: var(--p-text-color);--kb-muted: var(--p-text-muted-color);--kb-faint: color-mix(in srgb, var(--p-text-color) 45%, transparent);--kb-primary: var(--p-primary-color);--kb-primary-soft: color-mix(in srgb, var(--p-primary-color) 14%, transparent);--kb-danger: var(--p-danger-500);--kb-nav-w: 264px;--kb-measure: 880px;--kb-ctl: 34px;--kb-ctl-sm: 30px;--kb-row: 32px;--kb-r: 8px;--kb-r-card: 14px;--kb-r-sm: 6px;--kb-ring: 0 0 0 3px color-mix(in srgb, var(--kb-primary) 18%, transparent);--kb-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--kb-text)}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}.kb-page{display:flex;flex-direction:column;gap:16px;height:100%;min-height:0}.kb-tabpanel{min-width:0}.spin{animation:kb-spin 1s linear infinite}.spin.big{width:22px;height:22px}@keyframes kb-spin{to{transform:rotate(360deg)}}.tb{display:inline-flex;align-items:stretch;gap:2px;flex-wrap:wrap;border-bottom:1px solid var(--kb-border);width:100%}.tb-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;cursor:pointer;background:transparent;color:var(--kb-muted);font:inherit;font-size:13px;font-weight:600;transition:color .14s,border-color .14s}.tb-tab:hover{color:var(--kb-text)}.tb-tab.on{color:var(--kb-primary);border-bottom-color:var(--kb-primary)}.tb-tab svg{width:15px;height:15px}.kb-wiki-note{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;margin-bottom:14px;border-radius:10px;font-size:12.5px;line-height:1.5;background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--kb-text);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kb-wiki-note svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-help-500)}.bl-notice,.gv-notice{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;border-radius:10px;font-size:13px;background:var(--kb-surface-2);color:var(--kb-muted)}.bl-notice svg,.gv-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.bl-state,.gv-state{display:flex;align-items:center;justify-content:center;padding:64px 20px;color:var(--kb-muted)}.es{text-align:center;padding:60px 24px;display:flex;flex-direction:column;align-items:center;gap:9px}.es-ico{width:58px;height:58px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:5px}.es-ico.primary{background:var(--kb-primary-soft);color:var(--kb-primary);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.es-ico.muted{background:var(--kb-surface-2);color:var(--kb-faint);border:1px solid var(--kb-border)}.es-ico svg{width:27px;height:27px}.es-t{font-size:14.5px;font-weight:700;color:var(--kb-text)}.es-s{font-size:12.5px;color:var(--kb-muted);max-width:360px;line-height:1.55}.es-cta{margin-top:8px;display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 16px;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;background:var(--kb-primary);color:var(--p-primary-contrast-color);border:1px solid var(--kb-primary);transition:filter .15s,transform .15s}.es-cta:hover{filter:brightness(1.07);transform:translateY(-1px)}.es-cta svg{width:15px;height:15px}.bl-list{display:flex;flex-direction:column;gap:9px}.bl-row{display:grid;grid-template-columns:1fr auto;align-items:stretch;background:var(--kb-surface);border:1px solid var(--kb-border);border-radius:14px;overflow:hidden;transition:border-color .14s,box-shadow .14s}.bl-row:hover{border-color:var(--kb-border-strong)}.bl-row.open{box-shadow:0 2px 10px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.bl-main{grid-column:1;display:flex;align-items:center;gap:13px;padding:13px 14px;min-width:0;background:transparent;border:none;cursor:pointer;text-align:left;font:inherit;color:inherit}.bl-ico{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--kb-primary-soft);color:var(--kb-primary);border:1px solid color-mix(in srgb,var(--p-primary-color) 24%,transparent)}.bl-ico svg{width:18px;height:18px}.bl-body{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.bl-title{font-size:13.5px;font-weight:600;color:var(--kb-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.bl-m{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--kb-muted)}.bl-m svg{width:12px;height:12px}.bl-m.mono{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:10.5px}.bl-kind{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:var(--kb-surface-2);color:var(--kb-muted);border:1px solid var(--kb-border)}.bl-chev{width:16px;height:16px;color:var(--kb-faint);flex-shrink:0}.bl-del{grid-column:2;align-self:center;margin-right:12px;width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:var(--kb-faint);opacity:.7;transition:opacity .14s,background .14s,color .14s}.bl-row:hover .bl-del{opacity:1}.bl-del:hover:not(:disabled){background:color-mix(in srgb,var(--kb-danger) 14%,transparent);color:var(--kb-danger)}.bl-del:disabled{cursor:default;opacity:.6}.bl-del svg{width:15px;height:15px}.bl-preview{grid-column:1 / -1;padding:13px 16px 15px 65px;border-top:1px solid var(--kb-border);margin-top:-1px}.bl-prose{margin:0;font-size:12.5px;line-height:1.62;color:var(--kb-muted);white-space:pre-wrap}.bl-noprev{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--kb-faint);font-style:italic}.bl-noprev svg{width:14px;height:14px}.ap{max-width:760px}.ap-modes{display:inline-flex;gap:4px;margin-bottom:18px;flex-wrap:wrap}.ap-mode{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 13px;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;background:var(--kb-surface);color:var(--kb-muted);border:1px solid var(--kb-border);transition:background .14s,color .14s,border-color .14s}.ap-mode:hover{color:var(--kb-text);border-color:var(--kb-border-strong)}.ap-mode.on{background:var(--kb-primary-soft);color:var(--kb-primary);border-color:color-mix(in srgb,var(--p-primary-color) 38%,transparent)}.ap-mode svg{width:15px;height:15px}.ap-pane{display:flex;flex-direction:column;gap:14px}.ap-form{display:flex;flex-direction:column;gap:16px}.ap-field{display:flex;flex-direction:column;gap:7px}.ap-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}.ap-row{display:flex;gap:9px}.ap-row .ap-input{flex:1}.ap-label-row{display:flex;align-items:baseline;justify-content:space-between}.ap-label{font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--kb-muted)}.ap-opt{margin-left:6px;font-size:9.5px;font-weight:700;letter-spacing:.03em;color:var(--kb-faint)}.ap-count{font-size:11px;color:var(--kb-faint);font-variant-numeric:tabular-nums}.ap-input,.ap-textarea{width:100%;box-sizing:border-box;background:var(--kb-surface);border:1px solid var(--kb-border);border-radius:8px;font:inherit;color:var(--kb-text);transition:border-color .15s,background .15s}.ap-input{height:34px;padding:0 13px;font-size:13px}select.ap-input{cursor:pointer}.ap-textarea{padding:12px 13px;font-size:13px;line-height:1.6;resize:vertical;min-height:220px}.ap-input:focus,.ap-textarea:focus{outline:none;border-color:var(--kb-primary);background:var(--kb-bg);box-shadow:0 0 0 3px color-mix(in srgb,var(--kb-primary) 18%,transparent)}.ap-input::placeholder,.ap-textarea::placeholder{color:var(--kb-faint)}.ap-input:disabled{opacity:.6;cursor:not-allowed}.mono{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:12px}.ap-file{display:none}.ap-drop{width:100%;font:inherit;color:inherit;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;cursor:pointer;padding:40px 24px;border-radius:14px;border:2px dashed var(--kb-border-strong);background:var(--kb-surface);transition:border-color .16s,background .16s,transform .16s,box-shadow .16s}.ap-drop:hover,.ap-drop.over{border-color:var(--kb-primary);background:var(--kb-primary-soft);transform:translateY(-1px);box-shadow:0 0 0 4px color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.ap-drop.busy{cursor:progress}.ap-drop-ico{width:34px;height:34px;color:var(--kb-faint)}.ap-drop:hover .ap-drop-ico,.ap-drop.over .ap-drop-ico{color:var(--kb-primary)}.ap-drop-t{margin:4px 0 0;font-size:13.5px;font-weight:600;color:var(--kb-text)}.ap-drop-s{margin:0;font-size:12px;color:var(--kb-muted)}.ap-msg{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-size:12.5px}.ap-msg svg{width:15px;height:15px;flex-shrink:0}.ap-msg.ok{background:color-mix(in srgb,var(--p-success-500) 12%,transparent);color:var(--p-success-500);border:1px solid color-mix(in srgb,var(--p-success-500) 30%,transparent)}.ap-msg.err{background:color-mix(in srgb,var(--kb-danger) 12%,transparent);color:var(--kb-danger);border:1px solid color-mix(in srgb,var(--kb-danger) 30%,transparent)}.ap-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ap-hint{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--kb-faint);margin:0}.ap-hint svg{width:14px;height:14px;flex-shrink:0}.ap-submit{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;flex-shrink:0;border-radius:8px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;background:var(--kb-primary);color:var(--p-primary-contrast-color);border:1px solid var(--kb-primary);transition:filter .15s,transform .15s}.ap-submit:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.ap-submit:disabled{opacity:.5;cursor:not-allowed}.ap-submit svg{width:16px;height:16px}.ap-uploads-bar{display:flex;gap:9px;align-items:center}.ap-uploads-bar .ap-input{flex:1}.ap-uploads-state{display:flex;align-items:center;gap:8px;padding:22px 4px;font-size:12.5px;color:var(--kb-muted)}.ap-uploads-state svg{width:16px;height:16px}.ap-uploads-state.err{color:var(--kb-danger)}.ap-uploads{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:360px;overflow-y:auto}.ap-upload{display:flex;align-items:center;gap:10px;padding:8px 11px;cursor:pointer;border-radius:8px;border:1px solid var(--kb-border);background:var(--kb-surface);transition:border-color .13s,background .13s}.ap-upload:hover{border-color:var(--kb-border-strong)}.ap-upload.on{border-color:var(--kb-primary);background:var(--kb-primary-soft)}.ap-upload-check{width:17px;height:17px;flex:none;color:var(--kb-faint)}.ap-upload.on .ap-upload-check{color:var(--kb-primary)}.ap-upload-ico{width:16px;height:16px;flex:none;color:var(--kb-muted)}.ap-upload-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ap-upload-name{font-size:13px;font-weight:600;color:var(--kb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ap-upload-meta{display:flex;gap:8px;font-size:11px;color:var(--kb-faint)}.ap-items{margin-top:4px;border-top:1px solid var(--kb-border);padding-top:12px}.ap-items-h{display:flex;align-items:center;justify-content:space-between;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--kb-faint);margin-bottom:8px}.ap-items-clear{background:none;border:none;cursor:pointer;font:inherit;font-size:11px;color:var(--kb-muted)}.ap-items-clear:hover{color:var(--kb-text)}.ap-items-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.ap-item{display:flex;align-items:center;gap:9px;padding:7px 11px;border-radius:8px;background:var(--kb-surface);border:1px solid var(--kb-border);font-size:12.5px}.ap-item-ic{width:15px;height:15px;flex:none;color:var(--kb-muted)}.ap-item.done .ap-item-ic{color:var(--p-success-500)}.ap-item.error .ap-item-ic{color:var(--kb-danger)}.ap-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kb-text)}.ap-item-status{flex:none;font-size:11px;color:var(--kb-muted)}.ap-item.error .ap-item-status{color:var(--kb-danger)}.st{max-width:760px}.st-form{display:flex;flex-direction:column;gap:14px}.st-card{background:var(--kb-surface);border:1px solid var(--kb-border);border-radius:14px;overflow:hidden}.st-card-h{padding:11px 16px;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--kb-muted);background:var(--kb-surface-2);border-bottom:1px solid var(--kb-border)}.st-card-b{padding:18px;display:flex;flex-direction:column;gap:16px}.st-desc{min-height:76px}.st-readonly{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border-radius:10px;background:var(--kb-surface-2);border:1px solid var(--kb-border)}.st-ro-value{color:var(--kb-text)}.st-card-tag{margin-left:8px;font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;vertical-align:middle;background:var(--kb-primary-soft);color:var(--kb-primary);border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.st-toggle{display:flex;align-items:flex-start;gap:11px;cursor:pointer;padding:11px 13px;border-radius:10px;background:var(--kb-surface-2);border:1px solid var(--kb-border)}.st-toggle input{margin-top:2px;width:16px;height:16px;flex:none;accent-color:var(--kb-primary);cursor:pointer}.st-toggle-text{display:flex;flex-direction:column;gap:3px;min-width:0}.st-hint{margin:0;font-size:11.5px;color:var(--kb-faint);line-height:1.45}.st-hint code{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kb-surface-2);border:1px solid var(--kb-border)}.st-actions{justify-content:flex-end}@media(max-width:640px){.ap-grid2{grid-template-columns:1fr}}.tv{display:flex;flex-direction:column}.tv-bar-h{font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--kb-muted)}.tv-refresh{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;background:var(--kb-surface);color:var(--kb-text);border:1px solid var(--kb-border);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .14s,border-color .14s}.tv-tree{background:var(--kb-surface);border:1px solid var(--kb-border);border-radius:14px;padding:8px}.tv-row{display:flex;align-items:center;gap:8px;height:34px;padding:0 8px;border-radius:8px;min-width:0;transition:background .12s}.tv-chev{width:20px;height:20px;flex-shrink:0;display:grid;place-items:center;border:none;border-radius:8px;background:transparent;color:var(--kb-faint);cursor:pointer;transition:color .12s,background .12s}.tv-label{font-size:13px;font-weight:600;color:var(--kb-text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tv-row.leaf .tv-label{font-weight:500;color:var(--kb-muted)}.tv-chip{flex-shrink:0;font-size:9px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:var(--kb-surface-2);color:var(--kb-muted);border:1px solid var(--kb-border)}.tv-count{flex-shrink:0;margin-left:auto;min-width:20px;height:18px;padding:0 6px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--kb-primary-soft);color:var(--kb-primary)}.tv-children{margin-left:19px;padding-left:9px;border-left:1px solid var(--kb-border)}.cx{display:flex;flex-direction:column;gap:22px;padding:20px 22px;container-type:inline-size}.cx-group{display:flex;flex-direction:column;gap:10px}.cx-group-h{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:650;color:var(--kb-text)}.cx-group-h svg{width:16px;height:16px;color:var(--kb-primary)}.cx-tag{font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:var(--kb-primary-soft);color:var(--kb-primary);border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.cx-toggle{display:flex;align-items:flex-start;gap:11px}.cx-toggle>span{display:flex;flex-direction:column;gap:2px;min-width:0}.cx-textarea{height:auto;min-height:72px;padding:10px 12px;line-height:1.55;resize:vertical}.cx-lead{margin:0;font-size:12.5px;line-height:1.5;color:var(--kb-muted)}.cx-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.cx-span{grid-column:1 / -1}.cx-span>.cx-input:not(.cx-textarea){max-width:240px}@container (max-width: 420px){.cx-row{grid-template-columns:minmax(0,1fr)}}.cx-field{display:flex;flex-direction:column;gap:6px}.cx-label{font-size:12px;font-weight:600;color:var(--kb-text)}.cx-opt{font-weight:400;font-size:11px;color:var(--kb-faint);text-transform:none;letter-spacing:0}.cx-input{height:38px;padding:0 12px;font:inherit;font-size:13px;color:var(--kb-text);background:var(--kb-surface);border:1px solid var(--kb-border);border-radius:8px}.cx-input:focus{outline:none;border-color:var(--kb-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--kb-primary) 18%,transparent)}select.cx-input{appearance:none;-webkit-appearance:none;padding-right:32px;cursor:pointer;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6 -6'/></svg>");background-repeat:no-repeat;background-position:right 10px center;background-size:16px}.cx-fixed{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--kb-text)}.cx-fixed svg{width:15px;height:15px;color:var(--kb-faint)}.cx-fixed-v{font-family:ui-monospace,Menlo,monospace}.cx-hint{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--kb-faint);margin:0}.cx-hint svg{width:14px;height:14px;flex-shrink:0}wc-model-picker{display:block}.cx-loading{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--kb-muted)}.cx-loading svg{width:16px;height:16px}.cx-note{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;border-radius:10px;background:var(--kb-surface-2);color:var(--kb-muted);font-size:12.5px;line-height:1.5}.cx-note svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--kb-faint)}.cx-sub{display:flex;flex-direction:column;gap:12px;padding:12px 13px;border-radius:10px;background:var(--kb-surface-2);border:1px solid var(--kb-border)}.cx-sub-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.cx-sub-t{display:flex;flex-direction:column;gap:3px;min-width:0}.cx-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid var(--kb-border-strong);border-radius:999px;background:var(--kb-surface-2);cursor:pointer;transition:background .16s,border-color .16s}.cx-switch.on{background:var(--kb-primary);border-color:var(--kb-primary)}.cx-switch:disabled{opacity:.5;cursor:not-allowed}.cx-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.cx-switch.on .cx-switch-knob{left:19px}.cx-req{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--kb-primary);background:color-mix(in srgb,var(--kb-primary) 14%,transparent);border-radius:6px;padding:2px 7px}.cx-err{margin:0;font-size:11.5px;line-height:1.45;color:var(--kb-danger)}.cx-maint-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.cx-maint-status{margin:0;font-size:11.5px;line-height:1.45;color:var(--kb-muted)}.cx-maint-what{font-weight:700;margin-right:7px}.cx-maint-status.ok{color:var(--p-success-500)}.cx-maint-status.err{color:var(--kb-danger)}.kc-shell{flex:1;min-height:0;display:grid;grid-template-columns:var(--kb-nav-w) minmax(0,1fr);background:var(--kb-bg)}.kc-rail{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--kb-border);background:color-mix(in srgb,var(--kb-text) 2.5%,var(--kb-bg))}.kc-rail-body{flex:1;min-height:0;overflow-y:auto;padding:4px 8px 12px}.kc-main{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.kc-main-scroll{flex:1;min-height:0;overflow-y:auto;padding:18px 28px 80px 24px;display:flex;flex-direction:column;gap:16px}@media(max-width:760px){.kc-shell{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto minmax(0,1fr)}.kc-rail{max-height:40vh;border-right:none;border-bottom:1px solid var(--kb-border)}.kc-main-scroll{padding:20px 22px 64px}}.kc-railhead{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 10px;border-bottom:1px solid var(--kb-border)}.kc-railhead-title{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--kb-faint)}.kc-railhead-title b{color:var(--kb-muted);margin-left:4px;font-variant-numeric:tabular-nums}.kc-railhead-acts{display:flex;align-items:center;gap:2px}.kc-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kb-r);background:transparent;color:var(--kb-faint);transition:color .14s,background .14s,border-color .14s}.kc-iconbtn:hover:not(:disabled){color:var(--kb-text);background:var(--kb-surface-2)}.kc-iconbtn.on{color:var(--kb-primary);background:var(--kb-primary-soft)}.kc-iconbtn:disabled{opacity:.55;cursor:default}.kc-iconbtn svg{width:16px;height:16px}.kc-iconbtn.lg{width:var(--kb-ctl);height:var(--kb-ctl)}.kc-iconbtn.sm{width:var(--kb-ctl-sm);height:var(--kb-ctl-sm)}.kc-iconbtn.bordered{border-color:var(--kb-border);background:var(--kb-surface);color:var(--kb-muted)}.kc-iconbtn.bordered:hover:not(:disabled){border-color:var(--kb-border-strong)}.kc-iconbtn.danger:hover:not(:disabled),.kc-iconbtn.danger.on{background:color-mix(in srgb,var(--kb-danger) 12%,transparent);color:var(--kb-danger)}.kc-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kb-ctl);padding:0 14px;border-radius:var(--kb-r);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kc-btn svg{width:15px;height:15px}.kc-btn:disabled{opacity:.5;cursor:not-allowed}.kc-btn.sm{height:var(--kb-ctl-sm);padding:0 12px}.kc-btn-primary{background:var(--kb-primary);color:var(--p-primary-contrast-color);border-color:var(--kb-primary)}.kc-btn-primary:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.kc-btn-ghost{background:transparent;color:var(--kb-text);border-color:var(--kb-border)}.kc-btn-ghost:hover:not(:disabled){background:var(--kb-surface-2);border-color:var(--kb-border-strong)}.kc-btn-soft{background:var(--kb-primary-soft);color:var(--kb-primary);border-color:color-mix(in srgb,var(--kb-primary) 30%,transparent)}.kc-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--kb-primary) 18%,transparent)}.kc-btn-danger{background:var(--kb-danger);color:#fff;border-color:var(--kb-danger)}.kc-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kc-search{position:relative;display:flex;align-items:center}.kc-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--kb-faint);pointer-events:none}.kc-search-input{width:100%;height:var(--kb-ctl);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--kb-text);background:var(--kb-bg);border:1px solid var(--kb-border);border-radius:var(--kb-r);transition:border-color .14s,box-shadow .14s}.kc-search-input::placeholder{color:var(--kb-faint)}.kc-search-input:focus{outline:none;border-color:var(--kb-primary);box-shadow:var(--kb-ring)}.kc-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:6px;display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--kb-faint)}.kc-search-clear:hover{color:var(--kb-text);background:var(--kb-surface-2)}.kc-search-clear svg{width:14px;height:14px}.kc-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kb-r-sm);background:var(--kb-surface-2);color:var(--kb-muted);border:1px solid var(--kb-border)}.kc-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--kb-primary-soft);color:var(--kb-primary)}.kc-notice{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:var(--kb-r-card);font-size:13px;line-height:1.5;background:var(--kb-surface-2);color:var(--kb-muted)}.kc-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.kc-notice.info svg{color:var(--kb-primary)}.kc-notice.warn{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-warn-500);border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent)}.kc-notice.error{background:color-mix(in srgb,var(--kb-danger) 12%,transparent);color:var(--kb-danger);border:1px solid color-mix(in srgb,var(--kb-danger) 30%,transparent)}.kc-notice.help{background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--kb-text);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kc-notice.help svg{color:var(--p-help-500)}.kc-notice-action{margin-left:8px;padding:2px 10px;border-radius:var(--kb-r-sm);font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor}.kc-notice-action:hover:not(:disabled){background:color-mix(in srgb,currentColor 10%,transparent)}.kc-notice-action:disabled{opacity:.6;cursor:default}.kc-loading{flex:1;display:grid;place-items:center;padding:64px 20px;color:var(--kb-muted)}.kc-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kc-loading-inner svg{width:24px;height:24px}.kc-drawer-mask{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;overflow:clip;background:color-mix(in srgb,var(--p-text-color) 32%,transparent);backdrop-filter:blur(2px)}.kc-drawer{width:min(560px,100%);min-width:0;box-sizing:border-box;height:100%;display:flex;flex-direction:column;background:var(--kb-bg);border-left:1px solid var(--kb-border);box-shadow:-16px 0 50px -12px color-mix(in srgb,var(--p-text-color) 40%,transparent)}.kc-drawer-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--kb-border);flex:none}.kc-drawer-title{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:var(--kb-text)}.kc-drawer-title svg{width:18px;height:18px;color:var(--kb-primary)}.kc-drawer-b{flex:1;min-height:0;overflow-y:auto;padding:20px 20px 36px}.kc-drawer-enter-active,.kc-drawer-leave-active{transition:opacity .22s ease}.kc-drawer-enter-active .kc-drawer,.kc-drawer-leave-active .kc-drawer{transition:transform .26s cubic-bezier(.4,0,.2,1)}.kc-drawer-enter-from,.kc-drawer-leave-to{opacity:0}.kc-orig-mask{position:fixed;inset:0;z-index:1050;display:flex;flex-direction:column;background:color-mix(in srgb,var(--kb-bg) 90%,transparent);backdrop-filter:blur(6px)}.kc-orig-mask:fullscreen{background:var(--kb-bg);backdrop-filter:none}.kc-orig-contained{position:fixed;inset:0;z-index:1050;padding:28px;display:flex;flex-direction:row;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-text-color) 34%,transparent);backdrop-filter:blur(4px)}.kc-orig-contained .kc-orig{flex:0 1 auto;width:90%;height:90%;max-width:1400px;margin:auto;border:1px solid var(--kb-border);border-radius:14px;overflow:hidden;box-shadow:0 30px 90px -30px color-mix(in srgb,var(--p-text-color) 60%,transparent)}.kc-orig{flex:1;min-height:0;display:flex;flex-direction:column;background:var(--kb-bg)}.kc-orig-h{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--kb-border)}.kc-orig-title{display:inline-flex;align-items:center;gap:9px;min-width:0;font-size:14px;font-weight:700;color:var(--kb-text)}.kc-orig-title svg{width:18px;height:18px;color:var(--kb-primary);flex:none}.kc-orig-title-t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-orig-b{flex:1;min-height:0;overflow:auto}.kc-orig-rv{display:block;width:100%;height:100%}.kc-orig-enter-active,.kc-orig-leave-active{transition:opacity .18s ease}.kc-orig-enter-from,.kc-orig-leave-to{opacity:0}.kc-railsec+.kc-railsec{border-top:1px solid var(--kb-border)}.kc-railsec-h{display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px 7px;background:none;border:none;cursor:pointer;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--kb-faint)}.kc-railsec-h:hover{color:var(--kb-muted)}.kc-railsec-chev{width:13px;height:13px;flex:none;transition:transform .15s ease}.kc-railsec:not(.closed) .kc-railsec-chev{transform:rotate(90deg)}.kc-railsec-ic{width:14px;height:14px;flex:none}.kc-railsec-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-railsec-h .count{margin-left:auto;color:var(--kb-muted);font-variant-numeric:tabular-nums}.kc-railsec-b{padding:2px 0 8px}.kc-docsum{border:1px solid var(--kb-border);border-left:3px solid var(--kb-primary);background:var(--kb-surface);border-radius:8px;padding:12px 14px}.kc-docsum-h{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--kb-faint)}.kc-docsum-h svg{width:15px;height:15px;color:var(--kb-primary)}.kc-docsum-b{margin:8px 0 0;font-size:13px;line-height:1.6;color:var(--kb-text);white-space:pre-wrap}.kc-docsum-b.clamp{display:-webkit-box;-webkit-line-clamp:6;line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}.kc-docsum-more{margin-top:6px;padding:0;background:none;border:none;cursor:pointer;font:inherit;font-size:12px;font-weight:600;color:var(--kb-primary)}.kc-docsum-more:hover{text-decoration:underline}.kc-refs{display:flex;flex-wrap:wrap;gap:6px}.kc-ref{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:4px 10px 4px 8px;border-radius:8px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;color:var(--kb-text);white-space:nowrap;flex:none;background:var(--kb-surface-2);border:1px solid var(--kb-border)}.kc-ref .kc-ref-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kc-ref:hover{border-color:var(--kb-primary);color:var(--kb-primary)}.kc-orig{align-self:flex-start}.kc-ref-dot{width:9px;height:9px;border-radius:50%;flex:none}.kc-ref-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-ref-go{width:14px;height:14px;flex:none;opacity:.6}.kc-drawer-enter-from .kc-drawer,.kc-drawer-leave-to .kc-drawer{transform:translate(100%)}.kc-modal-mask{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kc-modal{width:min(460px,100%);background:var(--kb-bg);border:1px solid var(--kb-border);border-radius:var(--kb-r-card);overflow:hidden;box-shadow:0 20px 60px color-mix(in srgb,var(--p-text-color) 28%,transparent)}.kc-modal-h{display:flex;align-items:center;gap:11px;padding:14px 16px 4px}.kc-modal-h-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:11px;background:var(--kb-surface-2);color:var(--kb-muted)}.kc-modal.danger .kc-modal-h-ico{background:color-mix(in srgb,var(--kb-danger) 14%,transparent);color:var(--kb-danger)}.kc-modal-h-ico svg{width:17px;height:17px}.kc-modal-h-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.kc-modal-h-title{font-size:14px;font-weight:700;color:var(--kb-text)}.kc-modal-h-sub{font-size:12px;color:var(--kb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-modal-body{padding:8px 16px 14px;font-size:13px;line-height:1.55;color:var(--kb-muted)}.kc-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--kb-border);background:var(--kb-surface)}.kc-modal-enter-active,.kc-modal-leave-active{transition:opacity .18s ease}.kc-modal-enter-from,.kc-modal-leave-to{opacity:0}.kc-search-rail{position:relative}.kc-search-pop{position:absolute;z-index:30;left:0;right:0;top:calc(var(--kb-ctl) + 4px);max-height:320px;overflow-y:auto;padding:5px;background:var(--kb-bg);border:1px solid var(--kb-border-strong);border-radius:var(--kb-r-card);box-shadow:0 14px 38px color-mix(in srgb,var(--p-text-color) 22%,transparent)}.kc-search-hits{display:flex;flex-direction:column;gap:2px}.kc-search-hit{display:flex;flex-direction:column;gap:4px;width:100%;padding:8px 9px;border-radius:var(--kb-r);cursor:pointer;text-align:left;background:transparent;border:none;font:inherit;transition:background .12s}.kc-search-hit:hover{background:var(--kb-surface-2)}.kc-search-hit-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.kc-search-hit-kind{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--kb-faint)}.kc-search-hit-score{font-size:10.5px;font-weight:700;color:var(--kb-primary);font-variant-numeric:tabular-nums}.kc-search-hit-body{font-size:12px;line-height:1.5;color:var(--kb-muted)}.kc-search-state{display:flex;align-items:center;gap:8px;padding:12px 10px;font-size:12.5px;color:var(--kb-muted)}.kc-search-state.err{color:var(--kb-danger)}.kc-search-state svg{width:15px;height:15px;flex:none}.kc-search-busy-ico{color:var(--kb-primary)}.kc-search-panel{display:flex;flex-direction:column;gap:16px;max-width:var(--kb-measure)}.kc-search-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.kc-search-modes{display:inline-flex;gap:2px;padding:3px;background:var(--kb-surface-2);border-radius:var(--kb-r)}.kc-search-mode{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:6px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;background:transparent;border:none;color:var(--kb-muted);transition:background .14s,color .14s}.kc-search-mode svg{width:15px;height:15px}.kc-search-mode:hover{color:var(--kb-text)}.kc-search-mode.on{background:var(--kb-bg);color:var(--kb-text);box-shadow:0 1px 3px color-mix(in srgb,var(--p-text-color) 12%,transparent)}.kc-search-field{flex:1;min-width:200px}.kc-search-err{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--kb-r-card);font-size:12.5px;background:color-mix(in srgb,var(--kb-danger) 12%,transparent);color:var(--kb-danger);border:1px solid color-mix(in srgb,var(--kb-danger) 30%,transparent)}.kc-search-skel{display:flex;flex-direction:column;gap:10px}.kc-search-skel-row{height:56px;border-radius:var(--kb-r-card);background:var(--kb-surface-2);animation:kb-spin 0s;opacity:.6}.kc-ans{padding:16px 18px;border-radius:var(--kb-r-card);background:color-mix(in srgb,var(--kb-primary) 6%,transparent);border:1px solid color-mix(in srgb,var(--kb-primary) 24%,transparent)}.kc-ans-h{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--kb-primary);margin-bottom:9px}.kc-ans-h svg{width:14px;height:14px}.kc-ans-body{margin:0;font-size:14px;line-height:1.65;color:var(--kb-text);white-space:pre-wrap}.kc-ans-src{display:inline-flex;align-items:center;gap:7px;margin-top:12px;height:var(--kb-ctl-sm);padding:0 12px;border-radius:var(--kb-r);cursor:pointer;font:inherit;font-size:12px;font-weight:600;background:var(--kb-bg);color:var(--kb-text);border:1px solid var(--kb-border);transition:border-color .14s,background .14s}.kc-ans-src:hover{background:var(--kb-surface-2);border-color:var(--kb-border-strong)}.kc-ans-src svg{width:14px;height:14px}.kc-ans-sim{margin-left:4px;font-size:11px;font-weight:700;color:var(--kb-primary);font-variant-numeric:tabular-nums}.kc-search-results{display:flex;flex-direction:column;gap:10px}.kc-search-results-h{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--kb-faint)}.kc-search-result{display:flex;flex-direction:column;gap:8px;width:100%;text-align:left;padding:14px 16px;border-radius:var(--kb-r-card);background:var(--kb-surface);border:1px solid var(--kb-border);font:inherit;transition:border-color .14s,box-shadow .14s}.kc-search-result.link{cursor:pointer}.kc-search-result.link:hover{border-color:var(--kb-border-strong);box-shadow:0 2px 10px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kc-search-r-h{display:flex;align-items:center;gap:10px}.kc-search-r-llm{font-size:11px;font-weight:700;color:var(--p-warn-500)}.kc-search-r-h .kc-search-hit-score{margin-left:auto}.kc-search-r-doc{display:inline-flex;align-items:center;gap:5px;min-width:0;font-size:12px;font-weight:600;color:var(--kb-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kc-search-r-doc svg{width:13px;height:13px;flex:none;color:var(--kb-primary)}.kc-search-hit-h .kc-search-r-doc{font-size:11.5px}.kc-search-hit-h .kc-search-hit-score{margin-left:auto}.kc-search-r-body{margin:0;font-size:12.5px;line-height:1.62;color:var(--kb-muted);white-space:pre-wrap}.kc-search-r-open{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--kb-primary)}.kc-search-r-open svg{width:14px;height:14px}.kc-search-zero{display:flex;flex-direction:column;align-items:center;gap:6px;padding:56px 20px;text-align:center;color:var(--kb-muted)}.kc-search-zero>svg{width:30px;height:30px;color:var(--kb-faint);margin-bottom:4px}.kc-search-zero-t{font-size:14px;font-weight:700;color:var(--kb-text)}.kc-search-zero-s{font-size:12.5px;color:var(--kb-muted);max-width:340px;line-height:1.5}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}.gx-canvas-wrap{position:relative}.gx-search-panel{position:absolute;inset:0;background:var(--kb-bg);overflow:auto}.kb-view{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.kb-menu-backdrop{position:fixed;inset:0;z-index:60}.kb-menu{position:fixed;z-index:61;padding:5px;background:var(--kb-bg);border:1px solid var(--kb-border-strong);border-radius:14px;box-shadow:0 12px 34px -10px color-mix(in srgb,var(--kb-text) 38%,transparent)}.kb-menu-title{padding:5px 9px 6px;font-size:11px;font-weight:700;color:var(--kb-faint);letter-spacing:.02em}.kb-menu-item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;background:transparent;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:550;color:var(--kb-text);text-align:left;transition:background .1s}.kb-menu-item:hover{background:var(--kb-surface-2)}.kb-menu-item.danger{color:var(--p-danger-500)}.kb-menu-item.danger:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent)}.kb-menu-item.disabled,.kb-menu-item:disabled{opacity:.4;cursor:not-allowed}.kb-menu-item.disabled:hover,.kb-menu-item:disabled:hover{background:transparent}.kb-menu-ic{width:16px;height:16px;flex:none;color:var(--kb-muted)}.kb-menu-item.danger .kb-menu-ic{color:inherit}.kb-menu-sep{height:1px;margin:4px 6px;background:var(--kb-border)}.kb-railtop{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 10px 8px;border-bottom:1px solid var(--kb-border)}.kb-railtop-acts{display:flex;align-items:center;gap:2px;justify-content:flex-end}.cn{display:flex;flex-direction:column;flex:1;min-height:0}.kb-fade-enter-active,.kb-fade-leave-active{transition:opacity .16s ease}.kb-fade-enter-from,.kb-fade-leave-to{opacity:0}.kb-view.wk-dragging{user-select:none}.kb-view.wk-dragging *{cursor:col-resize!important}.ap-drop-t,.ap-drop-s{display:block}`;
export {
  Ir as W,
  Ar as _,
  Rr as a,
  Or as b,
  Lr as c,
  jr as d,
  Pr as u
};
//# sourceMappingURL=styles-CpBFKx7r.js.map
