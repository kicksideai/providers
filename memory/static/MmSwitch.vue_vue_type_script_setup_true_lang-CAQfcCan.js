import { hasInjectionContext as T, inject as m, effectScope as N, ref as _, markRaw as H, createApp as $, onMounted as x, onUnmounted as U, watch as B, defineComponent as j, openBlock as D, createElementBlock as W, normalizeClass as z, createElementVNode as F } from "vue";
import { addCollection as M } from "@iconify/vue";
import { config as C, addIcons as k, on as K, applyThemeMode as b, host as Y, hostCss as J, loadCss as q } from "@wippy-fe/proxy";
var g = "data-wippy-visible";
function V(t) {
  const e = t.getAttribute(g);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var G = Object.defineProperty, Q = (t, e, s) => e in t ? G(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, u = (t, e, s) => Q(t, typeof e != "symbol" ? e + "" : e, s), X = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Z = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function w(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function tt(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, n] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [o, a] of Object.entries(n)) {
            const c = typeof a == "string" ? w(o) : null;
            c && e.add(c);
          }
          continue;
        }
        const r = typeof n == "string" ? w(i) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function et(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${Z} {
${e}
}`;
}
function st(t, e) {
  const s = et(e);
  s && E(t, s, "@wippy-fe/css-variables-bridge");
}
function it(t, e) {
  const i = (e ?? X).map(async (n) => {
    const r = J[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await q(r);
    } catch (o) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${r}):`, o), null;
    }
  });
  return Promise.all(i).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const o = document.createElement("style");
      o.textContent = r, o.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(o);
    }
  });
}
function nt(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function E(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function rt(t, e) {
  E(t, e, "@wippy-fe/custom-css");
}
function S(t) {
  return t.__wippyHost ?? null;
}
function ot(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function at(t, e, s) {
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
function y(t, e) {
  const s = {}, i = [];
  for (const [n, r] of Object.entries(e.properties)) {
    const o = t.getAttribute(n), a = ot(n);
    if (o === null) {
      r.default !== void 0 && (s[a] = r.default);
      continue;
    }
    const c = at(n, o, r);
    c.error ? i.push(c.error) : s[a] = c.value;
  }
  return { props: s, errors: i };
}
var lt = class {
  constructor(t, e) {
    u(this, "_props"), u(this, "_errors"), u(this, "_content"), u(this, "_hostVisibility"), u(this, "_propsListeners", /* @__PURE__ */ new Set()), u(this, "_contentListeners", /* @__PURE__ */ new Set()), u(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), u(this, "_disposed", !1), u(this, "_emitToDom"), u(this, "props"), u(this, "events"), u(this, "content"), u(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, n) {
        return s._subscribeProps(i, n);
      }
    }, this.events = {
      emit(i, n) {
        s._disposed || s._emitToDom(i, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, n) {
        return s._subscribeContent(i, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, n) {
        return s._subscribeHostVisibility(i, n);
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
}, ct = class extends HTMLElement {
  constructor() {
    super(), u(this, "_internals"), u(this, "_contentObserver", null), u(this, "_initialized", !1), u(this, "_container", null), u(this, "_reactive", null), u(this, "_lastProps", null), u(this, "_lastErrors", []), u(this, "_lastContent", null), u(this, "_themeUnsub", null), u(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = V(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...s, g])];
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
        const r = y(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), s = r.props, i = r.errors, this._lastProps = s, this._lastErrors = i;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new lt(
        { props: s, errors: i, content: n, hasContent: e, hostVisibility: this._hostVisible },
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
        this.onInit(s), t.inlineCss && nt(s, t.inlineCss);
        try {
          const l = C?.theming, p = tt(
            l?.global?.cssVariables,
            l?.children?.cssVariables
          );
          st(s, p);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const l = C?.theming, p = [l?.global?.customCSS, l?.children?.customCSS].filter(Boolean).join(`
`);
            p && rt(s, p);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && it(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = t.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, k(M);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = K("@theme", (c) => this._applyTheme(c)));
      const { props: n, errors: r } = y(this, t.propsSchema);
      t.validateProps && r.push(...t.validateProps(n));
      const o = n;
      this._lastProps = o, this._lastErrors = r;
      let a = null;
      t.contentTemplate && (a = this._extractContent(t.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(t.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, o, r, a, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = Y.getThemeMode?.()) {
    b(t, this), this._container && b(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), b("auto", this), this._container && b("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === g) {
      const a = this._hostVisible, c = V(this);
      if (c === a)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, a), this.onHostVisibilityChanged(c, a));
      return;
    }
    const i = this.constructor.wippyConfig, { props: n, errors: r } = y(this, i.propsSchema);
    i.validateProps && r.push(...i.validateProps(n));
    const o = n;
    this._lastProps = o, this._lastErrors = r, this._reactive?.notifyProps(o, r), this.onPropsChanged(o, r);
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
function ut(t) {
  return t.__wippyHostBus ?? null;
}
function ht(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let P;
const R = (t) => P = t, pt = () => T() && m(I) || P, I = (
  /* istanbul ignore next */
  Symbol()
);
function dt() {
  const t = N(!0), e = t.run(() => _({}));
  let s = [], i = [];
  const n = H({
    install(r) {
      R(n), n._a = r, r.provide(I, n), r.config.globalProperties.$pinia = n, i.forEach((o) => s.push(o)), i = [];
    },
    use(r) {
      return this._a ? s.push(r) : i.push(r), this;
    },
    _p: s,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return n;
}
var ft = Object.defineProperty, _t = (t, e, s) => e in t ? ft(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, f = (t, e, s) => _t(t, typeof e != "symbol" ? e + "" : e, s), A = /* @__PURE__ */ Symbol("wippy:emit"), O = /* @__PURE__ */ Symbol("wippy:props"), bt = /* @__PURE__ */ Symbol("wippy:props_error"), mt = /* @__PURE__ */ Symbol("wippy:content"), vt = /* @__PURE__ */ Symbol("wippy:panel-id"), yt = /* @__PURE__ */ Symbol("wippy:layout-bus"), gt = /* @__PURE__ */ Symbol("wippy:host"), L = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Pt() {
  const t = m(O);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Rt() {
  const t = m(A);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function Ct() {
  const t = m(L);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function It(t) {
  const e = Ct();
  let s = !1, i = null, n = !1;
  function r() {
    if (i)
      return n = !0, i;
    let o;
    try {
      o = Promise.resolve(t());
    } catch (c) {
      o = Promise.reject(c);
    }
    const a = o.finally(() => {
      if (i === a && (i = null, s && n))
        return n = !1, r();
    });
    return i = a, a;
  }
  return x(() => (s = !0, r())), U(() => {
    s = !1, n = !1;
  }), B(e, (o, a) => {
    if (s && a === !1 && o === !0)
      return r();
  }), e;
}
var At = class extends ct {
  constructor() {
    super(...arguments), f(this, "_vueApp", null), f(this, "_propsRef", _({})), f(this, "_errorsRef", _([])), f(this, "_contentRef", _(null)), f(this, "_hostVisibilityRef", _(null)), f(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, n, r) {
    const o = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of i)
      this.emitEvent("invalid", { message: l });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((l, p) => {
      this._propsRef.value = l, this._errorsRef.value = [...p];
      for (const h of p)
        this.emitEvent("invalid", { message: h });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: a.signal });
    const c = (l) => {
      if (a.signal.aborted)
        return;
      const p = pt(), h = $(l.rootComponent);
      this._vueApp = h;
      const d = dt();
      if (l.piniaPlugins)
        for (const v of l.piniaPlugins)
          d.use(v);
      if (h.use(d), l.plugins)
        for (const v of l.plugins)
          h.use(v);
      h.provide(O, this._propsRef), h.provide(bt, this._errorsRef), h.provide(A, this.emitEvent.bind(this)), h.provide(mt, this._contentRef), h.provide(L, this._hostVisibilityRef), h.provide(vt, ht(this)), h.provide(yt, ut(this)), h.provide(gt, S(this)), l.providers && l.providers(h, this), h.mount(e), p && R(p);
    };
    if (o.rootComponent)
      c(o);
    else if (o.lazyConfig) {
      const l = document.createElement("wippy-loading");
      l.setAttribute("no-bg", ""), e.appendChild(l), o.lazyConfig().then((p) => {
        a.signal.aborted || (l.remove(), c(p));
      }).catch((p) => {
        if (a.signal.aborted)
          return;
        const h = p instanceof Error ? p.message : String(p), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", h), l.replaceWith(d), this.emitEvent("error", { message: h });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Vt = ["disabled", "aria-checked", "aria-label"], Ot = /* @__PURE__ */ j({
  __name: "MmSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean },
    label: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const s = e;
    return (i, n) => (D(), W("button", {
      type: "button",
      class: z(["mm-switch", { on: t.modelValue }]),
      disabled: t.disabled,
      role: "switch",
      "aria-checked": t.modelValue,
      "aria-label": t.label,
      onClick: n[0] || (n[0] = (r) => s("update:modelValue", !t.modelValue))
    }, [...n[1] || (n[1] = [
      F("span", { class: "mm-switch-knob" }, null, -1)
    ])], 10, Vt));
  }
});
export {
  At as W,
  Ot as _,
  Rt as a,
  It as b,
  Pt as u
};
//# sourceMappingURL=MmSwitch.vue_vue_type_script_setup_true_lang-CAQfcCan.js.map
