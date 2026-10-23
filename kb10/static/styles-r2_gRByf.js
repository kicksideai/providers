import { hasInjectionContext as T, inject as y, effectScope as B, ref as u, markRaw as N, createApp as $, defineComponent as M, openBlock as f, createElementBlock as H, normalizeClass as U, createBlock as w, unref as _, createCommentVNode as D, createElementVNode as W, renderSlot as F } from "vue";
import { addCollection as K, Icon as z } from "@iconify/vue";
import { config as C, addIcons as Y, on as J, applyThemeMode as m, host as q, hostCss as G, loadCss as Q } from "@wippy-fe/proxy";
var k = "data-wippy-visible";
function S(r) {
  const e = r.getAttribute(k);
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
      for (const [o, i] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && i && typeof i == "object") {
          for (const [s, c] of Object.entries(i)) {
            const p = typeof c == "string" ? E(s) : null;
            p && e.add(p);
          }
          continue;
        }
        const n = typeof i == "string" ? E(o) : null;
        n && e.add(n);
      }
  return [...e].sort();
}
function or(r) {
  if (r.length === 0)
    return "";
  const e = r.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${er} {
${e}
}`;
}
function ir(r, e) {
  const t = or(e);
  t && V(r, t, "@wippy-fe/css-variables-bridge");
}
function nr(r, e) {
  const o = (e ?? rr).map(async (i) => {
    const n = G[i];
    if (!n)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Q(n);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${n}):`, s), null;
    }
  });
  return Promise.all(o).then((i) => {
    for (const n of i) {
      if (!n)
        continue;
      const s = document.createElement("style");
      s.textContent = n, s.setAttribute("role", "@wippy-fe/host-css"), r.appendChild(s);
    }
  });
}
function ar(r, e) {
  const t = document.createElement("style");
  t.textContent = e, r.appendChild(t);
}
function V(r, e, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), r.adoptedStyleSheets = [...r.adoptedStyleSheets, i];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = e, r.appendChild(o);
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
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${r}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${r}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function v(r, e) {
  const t = {}, o = [];
  for (const [i, n] of Object.entries(e.properties)) {
    const s = r.getAttribute(i), c = pr(i);
    if (s === null) {
      n.default !== void 0 && (t[c] = n.default);
      continue;
    }
    const p = lr(i, s, n);
    p.error ? o.push(p.error) : t[c] = p.value;
  }
  return { props: t, errors: o };
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
      subscribe(o, i) {
        return t._subscribeProps(o, i);
      }
    }, this.events = {
      emit(o, i) {
        t._disposed || t._emitToDom(o, i);
      }
    }, this.content = r.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, i) {
        return t._subscribeContent(o, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, i) {
        return t._subscribeHostVisibility(o, i);
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
    return [.../* @__PURE__ */ new Set([...e, ...t, k])];
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
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const n = v(this, r.propsSchema);
        r.validateProps && n.errors.push(...r.validateProps(n.props)), t = n.props, o = n.errors, this._lastProps = t, this._lastErrors = o;
      }
      const i = e ? this._lastContent ?? this._extractContent(r.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new cr(
        { props: t, errors: o, content: i, hasContent: e, hostVisibility: this._hostVisible },
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
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(t), r.inlineCss && ar(t, r.inlineCss);
        try {
          const a = C?.theming, x = tr(
            a?.global?.cssVariables,
            a?.children?.cssVariables
          );
          ir(t, x);
        } catch {
        }
        if (r.customCss !== !1)
          try {
            const a = C?.theming, x = [a?.global?.customCSS, a?.children?.customCSS].filter(Boolean).join(`
`);
            x && sr(t, x);
          } catch {
          }
        (r.hostCssKeys === void 0 || r.hostCssKeys.length > 0) && nr(t, r.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const p = r.containerClasses ?? [];
        p.length > 0 && o.classList.add(...p), t.appendChild(o), this._container = o, Y(K);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = J("@theme", (p) => this._applyTheme(p)));
      const { props: i, errors: n } = v(this, r.propsSchema);
      r.validateProps && n.push(...r.validateProps(i));
      const s = i;
      this._lastProps = s, this._lastErrors = n;
      let c = null;
      r.contentTemplate && (c = this._extractContent(r.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(r.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, s, n, c, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
    m(r, this), this._container && m(r, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), m("auto", this), this._container && m("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(r, e, t) {
    if (e === t)
      return;
    if (r === k) {
      const c = this._hostVisible, p = S(this);
      if (p === c)
        return;
      this._hostVisible = p, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(p, c), this.onHostVisibilityChanged(p, c));
      return;
    }
    const o = this.constructor.wippyConfig, { props: i, errors: n } = v(this, o.propsSchema);
    o.validateProps && n.push(...o.validateProps(i));
    const s = i;
    this._lastProps = s, this._lastErrors = n, this._reactive?.notifyProps(s, n), this.onPropsChanged(s, n);
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
function xr(r) {
  return r.__wippyHostBus ?? null;
}
function gr(r) {
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
function ur() {
  const r = B(!0), e = r.run(() => u({}));
  let t = [], o = [];
  const i = N({
    install(n) {
      I(i), i._a = n, n.provide(A, i), n.config.globalProperties.$pinia = i, o.forEach((s) => t.push(s)), o = [];
    },
    use(n) {
      return this._a ? t.push(n) : o.push(n), this;
    },
    _p: t,
    _a: null,
    _e: r,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var mr = Object.defineProperty, br = (r, e, t) => e in r ? mr(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, h = (r, e, t) => br(r, typeof e != "symbol" ? e + "" : e, t), j = /* @__PURE__ */ Symbol("wippy:emit"), O = /* @__PURE__ */ Symbol("wippy:props"), fr = /* @__PURE__ */ Symbol("wippy:props_error"), vr = /* @__PURE__ */ Symbol("wippy:content"), kr = /* @__PURE__ */ Symbol("wippy:panel-id"), yr = /* @__PURE__ */ Symbol("wippy:layout-bus"), wr = /* @__PURE__ */ Symbol("wippy:host"), _r = /* @__PURE__ */ Symbol("wippy:host-visibility");
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
    super(...arguments), h(this, "_vueApp", null), h(this, "_propsRef", u({})), h(this, "_errorsRef", u([])), h(this, "_contentRef", u(null)), h(this, "_hostVisibilityRef", u(null)), h(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(r, e, t, o, i, n) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const a of o)
      this.emitEvent("invalid", { message: a });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((a, x) => {
      this._propsRef.value = a, this._errorsRef.value = [...x];
      for (const d of x)
        this.emitEvent("invalid", { message: d });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((a) => {
      this._contentRef.value = a;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((a) => {
      this._hostVisibilityRef.value = a;
    }, { signal: c.signal });
    const p = (a) => {
      if (c.signal.aborted)
        return;
      const x = hr(), d = $(a.rootComponent);
      this._vueApp = d;
      const g = ur();
      if (a.piniaPlugins)
        for (const b of a.piniaPlugins)
          g.use(b);
      if (d.use(g), a.plugins)
        for (const b of a.plugins)
          d.use(b);
      d.provide(O, this._propsRef), d.provide(fr, this._errorsRef), d.provide(j, this.emitEvent.bind(this)), d.provide(vr, this._contentRef), d.provide(_r, this._hostVisibilityRef), d.provide(kr, gr(this)), d.provide(yr, xr(this)), d.provide(wr, P(this)), a.providers && a.providers(d, this), d.mount(e), x && I(x);
    };
    if (s.rootComponent)
      p(s);
    else if (s.lazyConfig) {
      const a = document.createElement("wippy-loading");
      a.setAttribute("no-bg", ""), e.appendChild(a), s.lazyConfig().then((x) => {
        c.signal.aborted || (a.remove(), p(x));
      }).catch((x) => {
        if (c.signal.aborted)
          return;
        const d = x instanceof Error ? x.message : String(x), g = document.createElement("wippy-error");
        g.setAttribute("title", "Failed to load"), g.setAttribute("message", d), a.replaceWith(g), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const zr = ["type", "disabled"], Ar = /* @__PURE__ */ M({
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
    return (o, i) => (f(), H("button", {
      class: U(["kx-btn", [`kx-btn-${r.variant}`, r.small && "sm"]]),
      type: r.type,
      disabled: r.disabled,
      onClick: i[0] || (i[0] = (n) => t("click"))
    }, [
      r.loading ? (f(), w(_(z), {
        key: 0,
        icon: "tabler:loader-2",
        class: "spin",
        "aria-hidden": "true"
      })) : r.icon ? (f(), w(_(z), {
        key: 1,
        icon: r.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])) : D("", !0),
      W("span", null, [
        F(o.$slots, "default")
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
const Lr = `:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-shell{flex:1;min-height:0;display:grid;grid-template-columns:var(--kx-rail-width) minmax(0,1fr);background:var(--p-content-background)}.kx-rail{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-rail-body{flex:1;min-height:0;overflow-y:auto;padding:4px 8px 12px}.kx-main{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.kx-main-scroll{flex:1;min-height:0;overflow-y:auto;padding:18px 28px 80px 24px;display:flex;flex-direction:column;gap:16px}@media(max-width:760px){.kx-shell{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto minmax(0,1fr)}.kx-rail{max-height:40vh;border-right:none;border-bottom:1px solid var(--p-content-border-color)}.kx-main-scroll{padding:20px 22px 64px}}.kx-railhead{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px 10px;border-bottom:1px solid var(--p-content-border-color)}.kx-railhead-title{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railhead-title b{color:var(--p-text-muted-color);margin-left:4px;font-variant-numeric:tabular-nums}.kx-railhead-acts{display:flex;align-items:center;gap:2px}.kx-railsec+.kx-railsec{border-top:1px solid var(--p-content-border-color)}.kx-railsec-h{display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px 7px;background:none;border:none;cursor:pointer;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-railsec-h:hover{color:var(--p-text-muted-color)}.kx-railsec-chev{width:13px;height:13px;flex:none;transition:transform .15s ease}.kx-railsec:not(.closed) .kx-railsec-chev{transform:rotate(90deg)}.kx-railsec-ic{width:14px;height:14px;flex:none}.kx-railsec-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-railsec-h .count{margin-left:auto;color:var(--p-text-muted-color);font-variant-numeric:tabular-nums}.kx-railsec-b{padding:2px 0 8px}.kx-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);transition:color .14s,background .14s,border-color .14s}.kx-iconbtn:hover:not(:disabled){color:var(--p-text-color);background:var(--kx-surface-2)}.kx-iconbtn.on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-iconbtn:disabled{opacity:.55;cursor:default}.kx-iconbtn svg{width:16px;height:16px}.kx-iconbtn.lg{width:var(--kx-control-height);height:var(--kx-control-height)}.kx-iconbtn.sm{width:var(--kx-control-height-sm);height:var(--kx-control-height-sm)}.kx-iconbtn.bordered{border-color:var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.kx-iconbtn.bordered:hover:not(:disabled){border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-iconbtn.danger:hover:not(:disabled),.kx-iconbtn.danger.on{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kx-control-height);padding:0 14px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kx-btn svg{width:15px;height:15px}.kx-btn:disabled{opacity:.5;cursor:not-allowed}.kx-btn.sm{height:var(--kx-control-height-sm);padding:0 12px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-primary-contrast-color);border-color:var(--p-primary-color)}.kx-btn-primary:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.kx-btn-ghost{background:transparent;color:var(--p-text-color);border-color:var(--p-content-border-color)}.kx-btn-ghost:hover:not(:disabled){background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-btn-soft{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.kx-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-btn-danger{background:var(--p-danger-500);color:var(--p-danger-contrast-color);border-color:var(--p-danger-500)}.kx-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{width:100%;height:var(--kx-control-height);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-search-input:focus{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:var(--kx-radius-8);display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color)}.kx-search-clear:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.kx-search-clear svg{width:14px;height:14px}.kx-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.kx-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-notice{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:var(--kx-radius-14);font-size:13px;line-height:1.5;background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.kx-notice.info svg{color:var(--p-primary-color)}.kx-notice.warn{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent)}.kx-notice.error{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-danger-500) 30%,transparent)}.kx-notice.help{background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kx-notice.warn svg{color:var(--p-warn-500)}.kx-notice.error svg{color:var(--p-danger-500)}.kx-notice.help svg{color:var(--p-help-500)}.kx-notice-action{margin-left:8px;padding:2px 10px;border-radius:var(--kx-radius-8);font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor}.kx-notice-action:hover:not(:disabled){background:color-mix(in srgb,currentColor 10%,transparent)}.kx-notice-action:disabled{opacity:.6;cursor:default}.kx-drawer-mask{position:fixed;inset:0;z-index:1000;display:flex;justify-content:flex-end;overflow:clip;background:color-mix(in srgb,var(--p-text-color) 32%,transparent);backdrop-filter:blur(2px)}.kx-drawer{width:min(560px,100%);min-width:0;box-sizing:border-box;height:100%;display:flex;flex-direction:column;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:-16px 0 50px -12px color-mix(in srgb,var(--p-text-color) 40%,transparent)}.kx-drawer-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-title{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:var(--p-text-color)}.kx-drawer-title svg{width:18px;height:18px;color:var(--p-primary-color)}.kx-drawer-b{flex:1;min-height:0;overflow-y:auto;padding:20px 20px 36px}.kx-drawer-enter-active,.kx-drawer-leave-active{transition:opacity .22s ease}.kx-drawer-enter-active .kx-drawer,.kx-drawer-leave-active .kx-drawer{transition:transform .26s cubic-bezier(.4,0,.2,1)}.kx-drawer-enter-from,.kx-drawer-leave-to{opacity:0}.kx-drawer-enter-from .kx-drawer,.kx-drawer-leave-to .kx-drawer{transform:translate(100%)}.kx-modal-mask{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kx-modal{width:min(460px,100%);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);overflow:hidden;box-shadow:0 20px 60px color-mix(in srgb,var(--p-text-color) 28%,transparent)}.kx-modal-h{display:flex;align-items:center;gap:11px;padding:14px 16px 4px}.kx-modal-h-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:var(--kx-radius-14);background:var(--kx-surface-2);color:var(--p-text-muted-color)}.kx-modal.danger .kx-modal-h-ico{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.kx-modal-h-ico svg{width:17px;height:17px}.kx-modal-h-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.kx-modal-h-title{font-size:14px;font-weight:700;color:var(--p-text-color)}.kx-modal-h-sub{font-size:12px;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-modal-body{padding:8px 16px 14px;font-size:13px;line-height:1.55;color:var(--p-text-muted-color)}.kx-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color);background:var(--kx-surface-1)}.kx-modal-enter-active,.kx-modal-leave-active{transition:opacity .18s ease}.kx-modal-enter-from,.kx-modal-leave-to{opacity:0}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host,.kb-page{font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--p-text-color)}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}.kb-page{display:flex;flex-direction:column;gap:16px;height:100%;min-height:0}.kb-tabpanel{min-width:0}.spin.big{width:22px;height:22px}.tb{display:inline-flex;align-items:stretch;gap:2px;flex-wrap:wrap;border-bottom:1px solid var(--p-content-border-color);width:100%}.tb-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;cursor:pointer;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:600;transition:color .14s,border-color .14s}.tb-tab:hover{color:var(--p-text-color)}.tb-tab.on{color:var(--p-primary-color);border-bottom-color:var(--p-primary-color)}.tb-tab svg{width:15px;height:15px}.kb-wiki-note{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;margin-bottom:14px;border-radius:10px;font-size:12.5px;line-height:1.5;background:color-mix(in srgb,var(--p-help-500) 12%,transparent);color:var(--p-text-color);border:1px solid color-mix(in srgb,var(--p-help-500) 30%,transparent)}.kb-wiki-note svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-help-500)}.bl-notice,.gv-notice{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;border-radius:10px;font-size:13px;background:var(--kx-surface-2);color:var(--p-text-muted-color)}.bl-notice svg,.gv-notice svg{width:16px;height:16px;flex:none;margin-top:1px}.bl-state,.gv-state{display:flex;align-items:center;justify-content:center;padding:64px 20px;color:var(--p-text-muted-color)}.bl-list{display:flex;flex-direction:column;gap:9px}.bl-row{display:grid;grid-template-columns:1fr auto;align-items:stretch;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;transition:border-color .14s,box-shadow .14s}.bl-row:hover{border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.bl-row.open{box-shadow:0 2px 10px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.bl-main{grid-column:1;display:flex;align-items:center;gap:13px;padding:13px 14px;min-width:0;background:transparent;border:none;cursor:pointer;text-align:left;font:inherit;color:inherit}.bl-ico{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border:1px solid color-mix(in srgb,var(--p-primary-color) 24%,transparent)}.bl-ico svg{width:18px;height:18px}.bl-body{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.bl-title{font-size:13.5px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.bl-m{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-text-muted-color)}.bl-m svg{width:12px;height:12px}.bl-m.mono{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:10.5px}.bl-kind{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.bl-chev{width:16px;height:16px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);flex-shrink:0}.bl-del{grid-column:2;align-self:center;margin-right:12px;width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);opacity:.7;transition:opacity .14s,background .14s,color .14s}.bl-row:hover .bl-del{opacity:1}.bl-del:hover:not(:disabled){background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.bl-del:disabled{cursor:default;opacity:.6}.bl-del svg{width:15px;height:15px}.bl-preview{grid-column:1 / -1;padding:13px 16px 15px 65px;border-top:1px solid var(--p-content-border-color);margin-top:-1px}.bl-prose{margin:0;font-size:12.5px;line-height:1.62;color:var(--p-text-muted-color);white-space:pre-wrap}.bl-noprev{display:flex;align-items:center;gap:7px;font-size:12px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);font-style:italic}.bl-noprev svg{width:14px;height:14px}.ap{max-width:760px}.ap-modes{display:inline-flex;gap:4px;margin-bottom:18px;flex-wrap:wrap}.ap-mode{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 13px;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;background:var(--kx-surface-1);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color);transition:background .14s,color .14s,border-color .14s}.ap-mode:hover{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.ap-mode.on{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,transparent)}.ap-mode svg{width:15px;height:15px}.ap-pane{display:flex;flex-direction:column;gap:14px}.ap-form{display:flex;flex-direction:column;gap:16px}.ap-field{display:flex;flex-direction:column;gap:7px}.ap-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}.ap-row{display:flex;gap:9px}.ap-row .ap-input{flex:1}.ap-label-row{display:flex;align-items:baseline;justify-content:space-between}.ap-label{font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.ap-opt{margin-left:6px;font-size:9.5px;font-weight:700;letter-spacing:.03em;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.ap-count{font-size:11px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);font-variant-numeric:tabular-nums}.ap-input,.ap-textarea{width:100%;box-sizing:border-box;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:8px;font:inherit;color:var(--p-text-color);transition:border-color .15s,background .15s}.ap-input{height:34px;padding:0 13px;font-size:13px}select.ap-input{cursor:pointer}.ap-textarea{padding:12px 13px;font-size:13px;line-height:1.6;resize:vertical;min-height:220px}.ap-input:focus,.ap-textarea:focus{outline:none;border-color:var(--p-primary-color);background:var(--p-content-background);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.ap-input::placeholder,.ap-textarea::placeholder{color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.ap-input:disabled{opacity:.6;cursor:not-allowed}.mono{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:12px}.ap-file{display:none}.ap-drop{width:100%;font:inherit;color:inherit;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;cursor:pointer;padding:40px 24px;border-radius:14px;border:2px dashed color-mix(in srgb,var(--p-text-color) 18%,transparent);background:var(--kx-surface-1);transition:border-color .16s,background .16s,transform .16s,box-shadow .16s}.ap-drop:hover,.ap-drop.over{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);transform:translateY(-1px);box-shadow:0 0 0 4px color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.ap-drop.busy{cursor:progress}.ap-drop-ico{width:34px;height:34px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.ap-drop:hover .ap-drop-ico,.ap-drop.over .ap-drop-ico{color:var(--p-primary-color)}.ap-drop-t{margin:4px 0 0;font-size:13.5px;font-weight:600;color:var(--p-text-color)}.ap-drop-s{margin:0;font-size:12px;color:var(--p-text-muted-color)}.ap-msg{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-size:12.5px}.ap-msg svg{width:15px;height:15px;flex-shrink:0}.ap-msg.ok{background:color-mix(in srgb,var(--p-success-500) 12%,transparent);color:var(--p-success-500);border:1px solid color-mix(in srgb,var(--p-success-500) 30%,transparent)}.ap-msg.err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500);border:1px solid color-mix(in srgb,var(--p-danger-500) 30%,transparent)}.ap-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ap-hint{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin:0}.ap-hint svg{width:14px;height:14px;flex-shrink:0}.ap-submit{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;flex-shrink:0;border-radius:8px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;background:var(--p-primary-color);color:var(--p-primary-contrast-color);border:1px solid var(--p-primary-color);transition:filter .15s,transform .15s}.ap-submit:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.ap-submit:disabled{opacity:.5;cursor:not-allowed}.ap-submit svg{width:16px;height:16px}.ap-uploads-bar{display:flex;gap:9px;align-items:center}.ap-uploads-bar .ap-input{flex:1}.ap-uploads-state{display:flex;align-items:center;gap:8px;padding:22px 4px;font-size:12.5px;color:var(--p-text-muted-color)}.ap-uploads-state svg{width:16px;height:16px}.ap-uploads-state.err{color:var(--p-danger-500)}.ap-uploads{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:360px;overflow-y:auto}.ap-upload{display:flex;align-items:center;gap:10px;padding:8px 11px;cursor:pointer;border-radius:8px;border:1px solid var(--p-content-border-color);background:var(--kx-surface-1);transition:border-color .13s,background .13s}.ap-upload:hover{border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.ap-upload.on{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ap-upload-check{width:17px;height:17px;flex:none;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.ap-upload.on .ap-upload-check{color:var(--p-primary-color)}.ap-upload-ico{width:16px;height:16px;flex:none;color:var(--p-text-muted-color)}.ap-upload-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ap-upload-name{font-size:13px;font-weight:600;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ap-upload-meta{display:flex;gap:8px;font-size:11px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.ap-items{margin-top:4px;border-top:1px solid var(--p-content-border-color);padding-top:12px}.ap-items-h{display:flex;align-items:center;justify-content:space-between;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin-bottom:8px}.ap-items-clear{background:none;border:none;cursor:pointer;font:inherit;font-size:11px;color:var(--p-text-muted-color)}.ap-items-clear:hover{color:var(--p-text-color)}.ap-items-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.ap-item{display:flex;align-items:center;gap:9px;padding:7px 11px;border-radius:8px;background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);font-size:12.5px}.ap-item-ic{width:15px;height:15px;flex:none;color:var(--p-text-muted-color)}.ap-item.done .ap-item-ic{color:var(--p-success-500)}.ap-item.error .ap-item-ic{color:var(--p-danger-500)}.ap-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-color)}.ap-item-status{flex:none;font-size:11px;color:var(--p-text-muted-color)}.ap-item.error .ap-item-status{color:var(--p-danger-500)}.st{max-width:760px}.st-form{display:flex;flex-direction:column;gap:14px}.st-card{background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden}.st-card-h{padding:11px 16px;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color);background:var(--kx-surface-2);border-bottom:1px solid var(--p-content-border-color)}.st-card-b{padding:18px;display:flex;flex-direction:column;gap:16px}.st-desc{min-height:76px}.st-readonly{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border-radius:10px;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color)}.st-ro-value{color:var(--p-text-color)}.st-card-tag{margin-left:8px;font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;vertical-align:middle;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.st-toggle{display:flex;align-items:flex-start;gap:11px;cursor:pointer;padding:11px 13px;border-radius:10px;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color)}.st-toggle input{margin-top:2px;width:16px;height:16px;flex:none;accent-color:var(--p-primary-color);cursor:pointer}.st-toggle-text{display:flex;flex-direction:column;gap:3px;min-width:0}.st-hint{margin:0;font-size:11.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);line-height:1.45}.st-hint code{font-family:JetBrains Mono,SF Mono,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color)}.st-actions{justify-content:flex-end}@media(max-width:640px){.ap-grid2{grid-template-columns:1fr}}.tv{display:flex;flex-direction:column}.tv-bar-h{font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.tv-refresh{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;background:var(--kx-surface-1);color:var(--p-text-color);border:1px solid var(--p-content-border-color);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .14s,border-color .14s}.tv-tree{background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:14px;padding:8px}.tv-row{display:flex;align-items:center;gap:8px;height:34px;padding:0 8px;border-radius:8px;min-width:0;transition:background .12s}.tv-chev{width:20px;height:20px;flex-shrink:0;display:grid;place-items:center;border:none;border-radius:8px;background:transparent;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);cursor:pointer;transition:color .12s,background .12s}.tv-label{font-size:13px;font-weight:600;color:var(--p-text-color);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tv-row.leaf .tv-label{font-weight:500;color:var(--p-text-muted-color)}.tv-chip{flex-shrink:0;font-size:9px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.tv-count{flex-shrink:0;margin-left:auto;min-width:20px;height:18px;padding:0 6px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.tv-children{margin-left:19px;padding-left:9px;border-left:1px solid var(--p-content-border-color)}.cx{display:flex;flex-direction:column;gap:22px;padding:20px 22px;container-type:inline-size}.cx-group{display:flex;flex-direction:column;gap:10px}.cx-group-h{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:650;color:var(--p-text-color)}.cx-group-h svg{width:16px;height:16px;color:var(--p-primary-color)}.cx-tag{font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.cx-toggle{display:flex;align-items:flex-start;gap:11px}.cx-toggle>span{display:flex;flex-direction:column;gap:2px;min-width:0}.cx-textarea{height:auto;min-height:72px;padding:10px 12px;line-height:1.55;resize:vertical}.cx-lead{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-muted-color)}.cx-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.cx-span{grid-column:1 / -1}.cx-span>.cx-input:not(.cx-textarea){max-width:240px}@container (max-width: 420px){.cx-row{grid-template-columns:minmax(0,1fr)}}.cx-field{display:flex;flex-direction:column;gap:6px}.cx-label{font-size:12px;font-weight:600;color:var(--p-text-color)}.cx-opt{font-weight:400;font-size:11px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);text-transform:none;letter-spacing:0}.cx-input{height:38px;padding:0 12px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:8px}.cx-input:focus{outline:none;border-color:var(--p-primary-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 18%,transparent)}select.cx-input{appearance:none;-webkit-appearance:none;padding-right:32px;cursor:pointer;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6 -6'/></svg>");background-repeat:no-repeat;background-position:right 10px center;background-size:16px}.cx-fixed{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color)}.cx-fixed svg{width:15px;height:15px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.cx-fixed-v{font-family:ui-monospace,Menlo,monospace}.cx-hint{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin:0}.cx-hint svg{width:14px;height:14px;flex-shrink:0}wc-model-picker{display:block}.cx-loading{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--p-text-muted-color)}.cx-loading svg{width:16px;height:16px}.cx-note{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;border-radius:10px;background:var(--kx-surface-2);color:var(--p-text-muted-color);font-size:12.5px;line-height:1.5}.cx-note svg{width:16px;height:16px;flex:none;margin-top:1px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.cx-sub{display:flex;flex-direction:column;gap:12px;padding:12px 13px;border-radius:10px;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color)}.cx-sub-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.cx-sub-t{display:flex;flex-direction:column;gap:3px;min-width:0}.cx-switch{position:relative;flex:none;width:40px;height:23px;padding:0;border:1px solid color-mix(in srgb,var(--p-text-color) 18%,transparent);border-radius:999px;background:var(--kx-surface-2);cursor:pointer;transition:background .16s,border-color .16s}.cx-switch.on{background:var(--p-primary-color);border-color:var(--p-primary-color)}.cx-switch:disabled{opacity:.5;cursor:not-allowed}.cx-switch-knob{position:absolute;top:50%;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transform:translateY(-50%);transition:left .16s;box-shadow:0 1px 2px #00000040}.cx-switch.on .cx-switch-knob{left:19px}.cx-req{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border-radius:6px;padding:2px 7px}.cx-err{margin:0;font-size:11.5px;line-height:1.45;color:var(--p-danger-500)}.cx-maint-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.cx-maint-status{margin:0;font-size:11.5px;line-height:1.45;color:var(--p-text-muted-color)}.cx-maint-what{font-weight:700;margin-right:7px}.cx-maint-status.ok{color:var(--p-success-500)}.cx-maint-status.err{color:var(--p-danger-500)}.kc-orig-mask{position:fixed;inset:0;z-index:1050;display:flex;flex-direction:column;background:color-mix(in srgb,var(--p-content-background) 90%,transparent);backdrop-filter:blur(6px)}.kc-orig-mask:fullscreen{background:var(--p-content-background);backdrop-filter:none}.kc-orig-contained{position:fixed;inset:0;z-index:1050;padding:28px;display:flex;flex-direction:row;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-text-color) 34%,transparent);backdrop-filter:blur(4px)}.kc-orig-contained .kc-orig{flex:0 1 auto;width:90%;height:90%;max-width:1400px;margin:auto;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;box-shadow:0 30px 90px -30px color-mix(in srgb,var(--p-text-color) 60%,transparent)}.kc-orig{flex:1;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background)}.kc-orig-h{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--p-content-border-color)}.kc-orig-title{display:inline-flex;align-items:center;gap:9px;min-width:0;font-size:14px;font-weight:700;color:var(--p-text-color)}.kc-orig-title svg{width:18px;height:18px;color:var(--p-primary-color);flex:none}.kc-orig-title-t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-orig-b{flex:1;min-height:0;overflow:auto}.kc-orig-rv{display:block;width:100%;height:100%}.kc-orig-enter-active,.kc-orig-leave-active{transition:opacity .18s ease}.kc-orig-enter-from,.kc-orig-leave-to{opacity:0}.kc-docsum{border:1px solid var(--p-content-border-color);border-left:3px solid var(--p-primary-color);background:var(--kx-surface-1);border-radius:8px;padding:12px 14px}.kc-docsum-h{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kc-docsum-h svg{width:15px;height:15px;color:var(--p-primary-color)}.kc-docsum-b{margin:8px 0 0;font-size:13px;line-height:1.6;color:var(--p-text-color);white-space:pre-wrap}.kc-docsum-b.clamp{display:-webkit-box;-webkit-line-clamp:6;line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}.kc-docsum-more{margin-top:6px;padding:0;background:none;border:none;cursor:pointer;font:inherit;font-size:12px;font-weight:600;color:var(--p-primary-color)}.kc-docsum-more:hover{text-decoration:underline}.kc-refs{display:flex;flex-wrap:wrap;gap:6px}.kc-ref{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:4px 10px 4px 8px;border-radius:8px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;color:var(--p-text-color);white-space:nowrap;flex:none;background:var(--kx-surface-2);border:1px solid var(--p-content-border-color)}.kc-ref .kc-ref-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kc-ref:hover{border-color:var(--p-primary-color);color:var(--p-primary-color)}.kc-orig{align-self:flex-start}.kc-ref-dot{width:9px;height:9px;border-radius:50%;flex:none}.kc-ref-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kc-ref-go{width:14px;height:14px;flex:none;opacity:.6}.kc-search-rail{position:relative}.kc-search-pop{position:absolute;z-index:30;left:0;right:0;top:calc(var(--kx-control-height) + 4px);max-height:320px;overflow-y:auto;padding:5px;background:var(--p-content-background);border:1px solid color-mix(in srgb,var(--p-text-color) 18%,transparent);border-radius:var(--kx-radius-14);box-shadow:0 14px 38px color-mix(in srgb,var(--p-text-color) 22%,transparent)}.kc-search-hits{display:flex;flex-direction:column;gap:2px}.kc-search-hit{display:flex;flex-direction:column;gap:4px;width:100%;padding:8px 9px;border-radius:var(--kx-radius-8);cursor:pointer;text-align:left;background:transparent;border:none;font:inherit;transition:background .12s}.kc-search-hit:hover{background:var(--kx-surface-2)}.kc-search-hit-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.kc-search-hit-kind{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kc-search-hit-score{font-size:10.5px;font-weight:700;color:var(--p-primary-color);font-variant-numeric:tabular-nums}.kc-search-hit-body{font-size:12px;line-height:1.5;color:var(--p-text-muted-color)}.kc-search-state{display:flex;align-items:center;gap:8px;padding:12px 10px;font-size:12.5px;color:var(--p-text-muted-color)}.kc-search-state.err{color:var(--p-danger-500)}.kc-search-state svg{width:15px;height:15px;flex:none}.kc-search-busy-ico{color:var(--p-primary-color)}.kc-search-panel{display:flex;flex-direction:column;gap:16px;max-width:var(--kx-reading-measure)}.kc-search-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.kc-search-modes{display:inline-flex;gap:2px;padding:3px;background:var(--kx-surface-2);border-radius:var(--kx-radius-8)}.kc-search-mode{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:6px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color);transition:background .14s,color .14s}.kc-search-mode svg{width:15px;height:15px}.kc-search-mode:hover{color:var(--p-text-color)}.kc-search-mode.on{background:var(--p-content-background);color:var(--p-text-color);box-shadow:0 1px 3px color-mix(in srgb,var(--p-text-color) 12%,transparent)}.kc-search-field{flex:1;min-width:200px}.kc-search-err{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--kx-radius-14);font-size:12.5px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500);border:1px solid color-mix(in srgb,var(--p-danger-500) 30%,transparent)}.kc-search-skel{display:flex;flex-direction:column;gap:10px}.kc-search-skel-row{height:56px;border-radius:var(--kx-radius-14);background:var(--kx-surface-2);opacity:.6}.kc-ans{padding:16px 18px;border-radius:var(--kx-radius-14);background:color-mix(in srgb,var(--p-primary-color) 6%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 24%,transparent)}.kc-ans-h{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--p-primary-color);margin-bottom:9px}.kc-ans-h svg{width:14px;height:14px}.kc-ans-body{margin:0;font-size:14px;line-height:1.65;color:var(--p-text-color);white-space:pre-wrap}.kc-ans-src{display:inline-flex;align-items:center;gap:7px;margin-top:12px;height:var(--kx-control-height-sm);padding:0 12px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12px;font-weight:600;background:var(--p-content-background);color:var(--p-text-color);border:1px solid var(--p-content-border-color);transition:border-color .14s,background .14s}.kc-ans-src:hover{background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kc-ans-src svg{width:14px;height:14px}.kc-ans-sim{margin-left:4px;font-size:11px;font-weight:700;color:var(--p-primary-color);font-variant-numeric:tabular-nums}.kc-search-results{display:flex;flex-direction:column;gap:10px}.kc-search-results-h{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--p-text-color) 45%,transparent)}.kc-search-result{display:flex;flex-direction:column;gap:8px;width:100%;text-align:left;padding:14px 16px;border-radius:var(--kx-radius-14);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);font:inherit;transition:border-color .14s,box-shadow .14s}.kc-search-result.link{cursor:pointer}.kc-search-result.link:hover{border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent);box-shadow:0 2px 10px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kc-search-r-h{display:flex;align-items:center;gap:10px}.kc-search-r-llm{font-size:11px;font-weight:700;color:var(--p-warn-500)}.kc-search-r-h .kc-search-hit-score{margin-left:auto}.kc-search-r-doc{display:inline-flex;align-items:center;gap:5px;min-width:0;font-size:12px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kc-search-r-doc svg{width:13px;height:13px;flex:none;color:var(--p-primary-color)}.kc-search-hit-h .kc-search-r-doc{font-size:11.5px}.kc-search-hit-h .kc-search-hit-score{margin-left:auto}.kc-search-r-body{margin:0;font-size:12.5px;line-height:1.62;color:var(--p-text-muted-color);white-space:pre-wrap}.kc-search-r-open{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--p-primary-color)}.kc-search-r-open svg{width:14px;height:14px}.kc-search-zero{display:flex;flex-direction:column;align-items:center;gap:6px;padding:56px 20px;text-align:center;color:var(--p-text-muted-color)}.kc-search-zero>svg{width:30px;height:30px;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);margin-bottom:4px}.kc-search-zero-t{font-size:14px;font-weight:700;color:var(--p-text-color)}.kc-search-zero-s{font-size:12.5px;color:var(--p-text-muted-color);max-width:340px;line-height:1.5}@media(prefers-color-scheme:dark){:host{--p-primary-contrast-color: var(--p-surface-0) !important}}.gx-canvas-wrap{position:relative}.gx-search-panel{position:absolute;inset:0;background:var(--p-content-background);overflow:auto}.kb-view{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.kb-menu-backdrop{position:fixed;inset:0;z-index:60}.kb-menu{position:fixed;z-index:61;padding:5px;background:var(--p-content-background);border:1px solid color-mix(in srgb,var(--p-text-color) 18%,transparent);border-radius:14px;box-shadow:0 12px 34px -10px color-mix(in srgb,var(--p-text-color) 38%,transparent)}.kb-menu-title{padding:5px 9px 6px;font-size:11px;font-weight:700;color:color-mix(in srgb,var(--p-text-color) 45%,transparent);letter-spacing:.02em}.kb-menu-item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;background:transparent;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:550;color:var(--p-text-color);text-align:left;transition:background .1s}.kb-menu-item:hover{background:var(--kx-surface-2)}.kb-menu-item.danger{color:var(--p-danger-500)}.kb-menu-item.danger:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent)}.kb-menu-item.disabled,.kb-menu-item:disabled{opacity:.4;cursor:not-allowed}.kb-menu-item.disabled:hover,.kb-menu-item:disabled:hover{background:transparent}.kb-menu-ic{width:16px;height:16px;flex:none;color:var(--p-text-muted-color)}.kb-menu-item.danger .kb-menu-ic{color:inherit}.kb-menu-sep{height:1px;margin:4px 6px;background:var(--p-content-border-color)}.kb-railtop{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 10px 8px;border-bottom:1px solid var(--p-content-border-color)}.kb-railtop-acts{display:flex;align-items:center;gap:2px;justify-content:flex-end}.cn{display:flex;flex-direction:column;flex:1;min-height:0}.kb-fade-enter-active,.kb-fade-leave-active{transition:opacity .16s ease}.kb-fade-enter-from,.kb-fade-leave-to{opacity:0}.kb-view.wk-dragging{user-select:none}.kb-view.wk-dragging *{cursor:col-resize!important}.ap-drop-t,.ap-drop-s{display:block}`;
export {
  Ir as W,
  Ar as _,
  Rr as a,
  Or as b,
  Lr as c,
  jr as d,
  Pr as u
};
//# sourceMappingURL=styles-r2_gRByf.js.map
