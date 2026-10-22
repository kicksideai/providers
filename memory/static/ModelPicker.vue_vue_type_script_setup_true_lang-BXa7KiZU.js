import { hasInjectionContext as x, inject as b, effectScope as B, ref as d, markRaw as U, createApp as D, onMounted as P, onUnmounted as j, watch as k, defineComponent as R, openBlock as g, createElementBlock as C, normalizeClass as W, createElementVNode as z, toDisplayString as M, createCommentVNode as F } from "vue";
import { addCollection as K } from "@iconify/vue";
import { config as E, addIcons as Y, on as J, applyThemeMode as m, host as q, hostCss as G, loadCss as Q, loadByTagName as X } from "@wippy-fe/proxy";
var w = "data-wippy-visible";
function V(t) {
  const e = t.getAttribute(w);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var Z = Object.defineProperty, tt = (t, e, s) => e in t ? Z(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, u = (t, e, s) => tt(t, typeof e != "symbol" ? e + "" : e, s), et = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], st = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function S(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function it(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, n] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [o, a] of Object.entries(n)) {
            const c = typeof a == "string" ? S(o) : null;
            c && e.add(c);
          }
          continue;
        }
        const r = typeof n == "string" ? S(i) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function nt(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${st} {
${e}
}`;
}
function rt(t, e) {
  const s = nt(e);
  s && I(t, s, "@wippy-fe/css-variables-bridge");
}
function ot(t, e) {
  const i = (e ?? et).map(async (n) => {
    const r = G[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Q(r);
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
function at(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function I(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function lt(t, e) {
  I(t, e, "@wippy-fe/custom-css");
}
function A(t) {
  return t.__wippyHost ?? null;
}
function ct(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function ut(t, e, s) {
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
    const o = t.getAttribute(n), a = ct(n);
    if (o === null) {
      r.default !== void 0 && (s[a] = r.default);
      continue;
    }
    const c = ut(n, o, r);
    c.error ? i.push(c.error) : s[a] = c.value;
  }
  return { props: s, errors: i };
}
var ht = class {
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
}, pt = class extends HTMLElement {
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
    return [.../* @__PURE__ */ new Set([...e, ...s, w])];
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
    return A(this);
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
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new ht(
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
        this.onInit(s), t.inlineCss && at(s, t.inlineCss);
        try {
          const l = E?.theming, p = it(
            l?.global?.cssVariables,
            l?.children?.cssVariables
          );
          rt(s, p);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const l = E?.theming, p = [l?.global?.customCSS, l?.children?.customCSS].filter(Boolean).join(`
`);
            p && lt(s, p);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && ot(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const c = t.containerClasses ?? [];
        c.length > 0 && i.classList.add(...c), s.appendChild(i), this._container = i, Y(K);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = J("@theme", (c) => this._applyTheme(c)));
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
  _applyTheme(t = q.getThemeMode?.()) {
    m(t, this), this._container && m(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), m("auto", this), this._container && m("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === w) {
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
function dt(t) {
  return t.__wippyHostBus ?? null;
}
function ft(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let O;
const T = (t) => O = t, _t = () => x() && b(L) || O, L = (
  /* istanbul ignore next */
  Symbol()
);
function mt() {
  const t = B(!0), e = t.run(() => d({}));
  let s = [], i = [];
  const n = U({
    install(r) {
      T(n), n._a = r, r.provide(L, n), r.config.globalProperties.$pinia = n, i.forEach((o) => s.push(o)), i = [];
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
var bt = Object.defineProperty, vt = (t, e, s) => e in t ? bt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, _ = (t, e, s) => vt(t, typeof e != "symbol" ? e + "" : e, s), N = /* @__PURE__ */ Symbol("wippy:emit"), $ = /* @__PURE__ */ Symbol("wippy:props"), yt = /* @__PURE__ */ Symbol("wippy:props_error"), gt = /* @__PURE__ */ Symbol("wippy:content"), Ct = /* @__PURE__ */ Symbol("wippy:panel-id"), wt = /* @__PURE__ */ Symbol("wippy:layout-bus"), Et = /* @__PURE__ */ Symbol("wippy:host"), H = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Tt() {
  const t = b($);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Lt() {
  const t = b(N);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function Vt() {
  const t = b(H);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function Nt(t) {
  const e = Vt();
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
  return P(() => (s = !0, r())), j(() => {
    s = !1, n = !1;
  }), k(e, (o, a) => {
    if (s && a === !1 && o === !0)
      return r();
  }), e;
}
var $t = class extends pt {
  constructor() {
    super(...arguments), _(this, "_vueApp", null), _(this, "_propsRef", d({})), _(this, "_errorsRef", d([])), _(this, "_contentRef", d(null)), _(this, "_hostVisibilityRef", d(null)), _(this, "_bridgeAbort", null);
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
      const p = _t(), h = D(l.rootComponent);
      this._vueApp = h;
      const f = mt();
      if (l.piniaPlugins)
        for (const v of l.piniaPlugins)
          f.use(v);
      if (h.use(f), l.plugins)
        for (const v of l.plugins)
          h.use(v);
      h.provide($, this._propsRef), h.provide(yt, this._errorsRef), h.provide(N, this.emitEvent.bind(this)), h.provide(gt, this._contentRef), h.provide(H, this._hostVisibilityRef), h.provide(Ct, ft(this)), h.provide(wt, dt(this)), h.provide(Et, A(this)), l.providers && l.providers(h, this), h.mount(e), p && T(p);
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
        const h = p instanceof Error ? p.message : String(p), f = document.createElement("wippy-error");
        f.setAttribute("title", "Failed to load"), f.setAttribute("message", h), l.replaceWith(f), this.emitEvent("error", { message: h });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const St = ["disabled", "aria-checked", "aria-label"], Ht = /* @__PURE__ */ R({
  __name: "MmSwitch",
  props: {
    modelValue: { type: Boolean },
    disabled: { type: Boolean },
    label: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const s = e;
    return (i, n) => (g(), C("button", {
      type: "button",
      class: W(["mm-switch", { on: t.modelValue }]),
      disabled: t.disabled,
      role: "switch",
      "aria-checked": t.modelValue,
      "aria-label": t.label,
      onClick: n[0] || (n[0] = (r) => s("update:modelValue", !t.modelValue))
    }, [...n[1] || (n[1] = [
      z("span", { class: "mm-switch-knob" }, null, -1)
    ])], 10, St));
  }
}), Pt = ["value", "capability"], Rt = {
  key: 1,
  class: "mm-notice error"
}, xt = /* @__PURE__ */ R({
  __name: "ModelPicker",
  props: {
    value: {},
    capability: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const s = e, i = d(!!customElements.get("wc-model-picker")), n = d("");
    P(async () => {
      if (!i.value)
        try {
          await X("wc-model-picker", { timeoutMs: 8e3 }), i.value = !0;
        } catch (o) {
          n.value = o instanceof Error ? o.message : String(o);
        }
    });
    function r(o) {
      const a = o instanceof CustomEvent ? o.detail : void 0;
      typeof a == "string" && a && s("select", a);
    }
    return (o, a) => i.value ? (g(), C("wc-model-picker", {
      key: 0,
      value: t.value,
      capability: t.capability,
      onSelect: r
    }, null, 40, Pt)) : n.value ? (g(), C("div", Rt, "The model picker could not load: " + M(n.value), 1)) : F("", !0);
  }
});
export {
  $t as W,
  xt as _,
  Lt as a,
  Ht as b,
  Nt as c,
  Tt as u
};
//# sourceMappingURL=ModelPicker.vue_vue_type_script_setup_true_lang-BXa7KiZU.js.map
