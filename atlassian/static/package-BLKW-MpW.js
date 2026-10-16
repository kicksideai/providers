import { hasInjectionContext as O, inject as g, effectScope as L, ref as b, markRaw as T, createApp as z } from "vue";
import { addCollection as N } from "@iconify/vue";
import { config as C, addIcons as $, on as H, applyThemeMode as _, host as U, hostCss as j, loadCss as D } from "@wippy-fe/proxy";
var y = "data-wippy-visible";
function w(t) {
  const e = t.getAttribute(y);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var W = Object.defineProperty, B = (t, e, s) => e in t ? W(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, p = (t, e, s) => B(t, typeof e != "symbol" ? e + "" : e, s), k = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], F = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function x(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function K(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, r] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [a, c] of Object.entries(r)) {
            const l = typeof c == "string" ? x(a) : null;
            l && e.add(l);
          }
          continue;
        }
        const n = typeof r == "string" ? x(i) : null;
        n && e.add(n);
      }
  return [...e].sort();
}
function M(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${F} {
${e}
}`;
}
function Y(t, e) {
  const s = M(e);
  s && E(t, s, "@wippy-fe/css-variables-bridge");
}
function J(t, e) {
  const i = (e ?? k).map(async (r) => {
    const n = j[r];
    if (!n)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await D(n);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${n}):`, a), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const n of r) {
      if (!n)
        continue;
      const a = document.createElement("style");
      a.textContent = n, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function q(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function E(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function G(t, e) {
  E(t, e, "@wippy-fe/custom-css");
}
function S(t) {
  return t.__wippyHost ?? null;
}
function Q(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function X(t, e, s) {
  switch (s.type) {
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
        return s.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function v(t, e) {
  const s = {}, i = [];
  for (const [r, n] of Object.entries(e.properties)) {
    const a = t.getAttribute(r), c = Q(r);
    if (a === null) {
      n.default !== void 0 && (s[c] = n.default);
      continue;
    }
    const l = X(r, a, n);
    l.error ? i.push(l.error) : s[c] = l.value;
  }
  return { props: s, errors: i };
}
var Z = class {
  constructor(t, e) {
    p(this, "_props"), p(this, "_errors"), p(this, "_content"), p(this, "_hostVisibility"), p(this, "_propsListeners", /* @__PURE__ */ new Set()), p(this, "_contentListeners", /* @__PURE__ */ new Set()), p(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), p(this, "_disposed", !1), p(this, "_emitToDom"), p(this, "props"), p(this, "events"), p(this, "content"), p(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, r) {
        return s._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        s._disposed || s._emitToDom(i, r);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, r) {
        return s._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, r) {
        return s._subscribeHostVisibility(i, r);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const s of this._propsListeners)
        s(t, e);
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
      for (const s of this._hostVisibilityListeners)
        s(t, e);
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
    const s = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const s = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const s = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
}, tt = class extends HTMLElement {
  constructor() {
    super(), p(this, "_internals"), p(this, "_contentObserver", null), p(this, "_initialized", !1), p(this, "_container", null), p(this, "_reactive", null), p(this, "_lastProps", null), p(this, "_lastErrors", []), p(this, "_lastContent", null), p(this, "_themeUnsub", null), p(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = w(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), s = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...s, y])];
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
    return S(this);
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
      let s, i;
      if (this._lastProps !== null)
        s = this._lastProps, i = this._lastErrors;
      else {
        const n = v(this, t.propsSchema);
        t.validateProps && n.errors.push(...t.validateProps(n.props)), s = n.props, i = n.errors, this._lastProps = s, this._lastErrors = i;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new Z(
        { props: s, errors: i, content: r, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, s = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(s), t.inlineCss && q(s, t.inlineCss);
        try {
          const o = C?.theming, u = K(
            o?.global?.cssVariables,
            o?.children?.cssVariables
          );
          Y(s, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const o = C?.theming, u = [o?.global?.customCSS, o?.children?.customCSS].filter(Boolean).join(`
`);
            u && G(s, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && J(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const l = t.containerClasses ?? [];
        l.length > 0 && i.classList.add(...l), s.appendChild(i), this._container = i, $(N);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = H("@theme", (l) => this._applyTheme(l)));
      const { props: r, errors: n } = v(this, t.propsSchema);
      t.validateProps && n.push(...t.validateProps(r));
      const a = r;
      this._lastProps = a, this._lastErrors = n;
      let c = null;
      t.contentTemplate && (c = this._extractContent(t.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(t.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, a, n, c, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = U.getThemeMode?.()) {
    _(t, this), this._container && _(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), _("auto", this), this._container && _("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === y) {
      const c = this._hostVisible, l = w(this);
      if (l === c)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, c), this.onHostVisibilityChanged(l, c));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: n } = v(this, i.propsSchema);
    i.validateProps && n.push(...i.validateProps(r));
    const a = r;
    this._lastProps = a, this._lastErrors = n, this._reactive?.notifyProps(a, n), this.onPropsChanged(a, n);
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
function et(t) {
  return t.__wippyHostBus ?? null;
}
function st(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let V;
const P = (t) => V = t, it = () => O() && g(R) || V, R = (
  /* istanbul ignore next */
  Symbol()
);
function rt() {
  const t = L(!0), e = t.run(() => b({}));
  let s = [], i = [];
  const r = T({
    install(n) {
      P(r), r._a = n, n.provide(R, r), n.config.globalProperties.$pinia = r, i.forEach((a) => s.push(a)), i = [];
    },
    use(n) {
      return this._a ? s.push(n) : i.push(n), this;
    },
    _p: s,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return r;
}
var nt = Object.defineProperty, ot = (t, e, s) => e in t ? nt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, f = (t, e, s) => ot(t, typeof e != "symbol" ? e + "" : e, s), I = /* @__PURE__ */ Symbol("wippy:emit"), A = /* @__PURE__ */ Symbol("wippy:props"), at = /* @__PURE__ */ Symbol("wippy:props_error"), lt = /* @__PURE__ */ Symbol("wippy:content"), pt = /* @__PURE__ */ Symbol("wippy:panel-id"), ct = /* @__PURE__ */ Symbol("wippy:layout-bus"), ht = /* @__PURE__ */ Symbol("wippy:host"), ut = /* @__PURE__ */ Symbol("wippy:host-visibility");
function mt() {
  const t = g(A);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function vt() {
  const t = g(I);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var yt = class extends tt {
  constructor() {
    super(...arguments), f(this, "_vueApp", null), f(this, "_propsRef", b({})), f(this, "_errorsRef", b([])), f(this, "_contentRef", b(null)), f(this, "_hostVisibilityRef", b(null)), f(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, r, n) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const o of i)
      this.emitEvent("invalid", { message: o });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((o, u) => {
      this._propsRef.value = o, this._errorsRef.value = [...u];
      for (const h of u)
        this.emitEvent("invalid", { message: h });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((o) => {
      this._contentRef.value = o;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((o) => {
      this._hostVisibilityRef.value = o;
    }, { signal: c.signal });
    const l = (o) => {
      if (c.signal.aborted)
        return;
      const u = it(), h = z(o.rootComponent);
      this._vueApp = h;
      const d = rt();
      if (o.piniaPlugins)
        for (const m of o.piniaPlugins)
          d.use(m);
      if (h.use(d), o.plugins)
        for (const m of o.plugins)
          h.use(m);
      h.provide(A, this._propsRef), h.provide(at, this._errorsRef), h.provide(I, this.emitEvent.bind(this)), h.provide(lt, this._contentRef), h.provide(ut, this._hostVisibilityRef), h.provide(pt, st(this)), h.provide(ct, et(this)), h.provide(ht, S(this)), o.providers && o.providers(h, this), h.mount(e), u && P(u);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const o = document.createElement("wippy-loading");
      o.setAttribute("no-bg", ""), e.appendChild(o), a.lazyConfig().then((u) => {
        c.signal.aborted || (o.remove(), l(u));
      }).catch((u) => {
        if (c.signal.aborted)
          return;
        const h = u instanceof Error ? u.message : String(u), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", h), o.replaceWith(d), this.emitEvent("error", { message: h });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const gt = ":host,.atl{--atl-bg: var(--p-content-background);--atl-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--atl-border: var(--p-content-border-color);--atl-text: var(--p-text-color);--atl-muted: var(--p-text-muted-color);--atl-primary: var(--p-primary-color);--atl-primary-text: var(--p-primary-contrast-color);--atl-danger: var(--p-danger-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--atl-text)}.atl{display:flex;flex-direction:column;gap:14px}.atl-tabs{display:flex;gap:6px}.atl-tab{flex:1;padding:8px 10px;border:1px solid var(--atl-border);border-radius:8px;background:var(--atl-bg);color:var(--atl-muted);font-size:13px;cursor:pointer}.atl-tab.on{background:var(--atl-surface);color:var(--atl-text);border-color:var(--atl-primary)}.atl-pane,.atl-pick{display:flex;flex-direction:column;gap:12px}.atl-field em{font-style:normal;color:var(--atl-faint, var(--atl-muted));font-size:12px}.atl-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.atl-field>span{color:var(--atl-muted)}.atl-field input,.atl-field select{padding:8px 10px;border:1px solid var(--atl-border);border-radius:8px;background:var(--atl-bg);color:var(--atl-text);font-size:14px}.atl-hint{margin:0;font-size:13px;color:var(--atl-muted)}.atl-primary{padding:9px 14px;border:none;border-radius:8px;background:var(--atl-primary);color:var(--atl-primary-text);font-size:14px;font-weight:500;cursor:pointer}.atl-primary:disabled{opacity:.6;cursor:default}.atl-error{margin:0;font-size:13px;color:var(--atl-danger)}.atl-warn{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--p-warn-500) 35%,var(--atl-border));border-radius:8px;background:color-mix(in srgb,var(--p-warn-500) 10%,transparent);color:var(--p-warn-600, var(--p-warn-500));font-size:12px}.atl-warn button{border:0;padding:0;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}", dt = { props: { type: "object", properties: { "provider-id": { type: "string", description: "Provider key (atlassian)", default: "" }, "component-id": { type: "string", description: "Existing connection id when reauthorizing", default: "" } } } }, Ct = {
  wippy: dt
};
export {
  yt as W,
  vt as a,
  Ct as p,
  gt as s,
  mt as u
};
//# sourceMappingURL=package-BLKW-MpW.js.map
