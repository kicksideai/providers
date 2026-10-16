import { hasInjectionContext as ce, inject as U, effectScope as pe, ref as b, markRaw as ue, createApp as de, defineComponent as he, computed as O, watch as me, onMounted as _e, openBlock as x, createElementBlock as E, createElementVNode as p, toDisplayString as fe, withDirectives as C, vModelCheckbox as H, createTextVNode as w, vModelText as V } from "vue";
import { addCollection as be } from "@iconify/vue";
import { config as F, addIcons as ve, on as ye, applyThemeMode as R, host as ge, hostCss as Ce, loadCss as we, loadByTagName as B, define as ke } from "@wippy-fe/proxy";
var N = "data-wippy-visible";
function z(e) {
  const t = e.getAttribute(N);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Se = Object.defineProperty, xe = (e, t, s) => t in e ? Se(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s, m = (e, t, s) => xe(e, typeof t != "symbol" ? t + "" : t, s), Ee = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ve = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function K(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Pe(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e)
    if (s)
      for (const [n, o] of Object.entries(s)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [a, u] of Object.entries(o)) {
            const c = typeof u == "string" ? K(a) : null;
            c && t.add(c);
          }
          continue;
        }
        const r = typeof o == "string" ? K(n) : null;
        r && t.add(r);
      }
  return [...t].sort();
}
function Re(e) {
  if (e.length === 0)
    return "";
  const t = e.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${Ve} {
${t}
}`;
}
function Ie(e, t) {
  const s = Re(t);
  s && J(e, s, "@wippy-fe/css-variables-bridge");
}
function Ae(e, t) {
  const n = (t ?? Ee).map(async (o) => {
    const r = Ce[o];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await we(r);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${r}):`, a), null;
    }
  });
  return Promise.all(n).then((o) => {
    for (const r of o) {
      if (!r)
        continue;
      const a = document.createElement("style");
      a.textContent = r, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Te(e, t) {
  const s = document.createElement("style");
  s.textContent = t, e.appendChild(s);
}
function J(e, t, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", s), n.textContent = t, e.appendChild(n);
}
function Oe(e, t) {
  J(e, t, "@wippy-fe/custom-css");
}
function Y(e) {
  return e.__wippyHost ?? null;
}
function Le(e) {
  return e.replace(/-([a-z])/g, (t, s) => s.toUpperCase());
}
function Ne(e, t, s) {
  switch (s.type) {
    case "string":
      return { value: t };
    case "number": {
      const n = Number.parseFloat(t);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: n };
    }
    case "integer": {
      const n = Number.parseInt(t, 10);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: n };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const n = JSON.parse(t);
        return s.type === "array" && !Array.isArray(n) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: n };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function L(e, t) {
  const s = {}, n = [];
  for (const [o, r] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), u = Le(o);
    if (a === null) {
      r.default !== void 0 && (s[u] = r.default);
      continue;
    }
    const c = Ne(o, a, r);
    c.error ? n.push(c.error) : s[u] = c.value;
  }
  return { props: s, errors: n };
}
var Ue = class {
  constructor(e, t) {
    m(this, "_props"), m(this, "_errors"), m(this, "_content"), m(this, "_hostVisibility"), m(this, "_propsListeners", /* @__PURE__ */ new Set()), m(this, "_contentListeners", /* @__PURE__ */ new Set()), m(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), m(this, "_disposed", !1), m(this, "_emitToDom"), m(this, "props"), m(this, "events"), m(this, "content"), m(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(n, o) {
        return s._subscribeProps(n, o);
      }
    }, this.events = {
      emit(n, o) {
        s._disposed || s._emitToDom(n, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(n, o) {
        return s._subscribeContent(n, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(n, o) {
        return s._subscribeHostVisibility(n, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const s of this._propsListeners)
        s(e, t);
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
      for (const s of this._hostVisibilityListeners)
        s(e, t);
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
    const s = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", s);
    };
    return t?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const s = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", s);
    };
    return t?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const s = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", s);
    };
    return t?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
}, Me = class extends HTMLElement {
  constructor() {
    super(), m(this, "_internals"), m(this, "_contentObserver", null), m(this, "_initialized", !1), m(this, "_container", null), m(this, "_reactive", null), m(this, "_lastProps", null), m(this, "_lastErrors", []), m(this, "_lastContent", null), m(this, "_themeUnsub", null), m(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = z(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), s = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...s, N])];
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
    return Y(this);
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
      let s, n;
      if (this._lastProps !== null)
        s = this._lastProps, n = this._lastErrors;
      else {
        const r = L(this, e.propsSchema);
        e.validateProps && r.errors.push(...e.validateProps(r.props)), s = r.props, n = r.errors, this._lastProps = s, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Ue(
        { props: s, errors: n, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, s = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let n;
      if (t)
        n = this._container;
      else {
        this.onInit(s), e.inlineCss && Te(s, e.inlineCss);
        try {
          const l = F?.theming, _ = Pe(
            l?.global?.cssVariables,
            l?.children?.cssVariables
          );
          Ie(s, _);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const l = F?.theming, _ = [l?.global?.customCSS, l?.children?.customCSS].filter(Boolean).join(`
`);
            _ && Oe(s, _);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Ae(s, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && n.classList.add(...c), s.appendChild(n), this._container = n, ve(be);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ye("@theme", (c) => this._applyTheme(c)));
      const { props: o, errors: r } = L(this, e.propsSchema);
      e.validateProps && r.push(...e.validateProps(o));
      const a = o;
      this._lastProps = a, this._lastErrors = r;
      let u = null;
      e.contentTemplate && (u = this._extractContent(e.contentTemplate), this._lastContent = u, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, n, a, r, u, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ge.getThemeMode?.()) {
    R(e, this), this._container && R(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), R("auto", this), this._container && R("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, s) {
    if (t === s)
      return;
    if (e === N) {
      const u = this._hostVisible, c = z(this);
      if (c === u)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, u), this.onHostVisibilityChanged(c, u));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: r } = L(this, n.propsSchema);
    n.validateProps && r.push(...n.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = r, this._reactive?.notifyProps(a, r), this.onPropsChanged(a, r);
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
function De(e) {
  return e.__wippyHostBus ?? null;
}
function $e(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let q;
const G = (e) => q = e, je = () => ce() && U(Q) || q, Q = (
  /* istanbul ignore next */
  Symbol()
);
function He() {
  const e = pe(!0), t = e.run(() => b({}));
  let s = [], n = [];
  const o = ue({
    install(r) {
      G(o), o._a = r, r.provide(Q, o), r.config.globalProperties.$pinia = o, n.forEach((a) => s.push(a)), n = [];
    },
    use(r) {
      return this._a ? s.push(r) : n.push(r), this;
    },
    _p: s,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Fe = Object.defineProperty, Be = (e, t, s) => t in e ? Fe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s, S = (e, t, s) => Be(e, typeof t != "symbol" ? t + "" : t, s), X = /* @__PURE__ */ Symbol("wippy:emit"), Z = /* @__PURE__ */ Symbol("wippy:props"), ze = /* @__PURE__ */ Symbol("wippy:props_error"), Ke = /* @__PURE__ */ Symbol("wippy:content"), We = /* @__PURE__ */ Symbol("wippy:panel-id"), Je = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ye = /* @__PURE__ */ Symbol("wippy:host"), qe = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ge() {
  const e = U(Z);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Qe() {
  const e = U(X);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var Xe = class extends Me {
  constructor() {
    super(...arguments), S(this, "_vueApp", null), S(this, "_propsRef", b({})), S(this, "_errorsRef", b([])), S(this, "_contentRef", b(null)), S(this, "_hostVisibilityRef", b(null)), S(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, s, n, o, r) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = n, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of n)
      this.emitEvent("invalid", { message: l });
    const u = new AbortController();
    this._bridgeAbort = u, this.reactive.props.subscribe((l, _) => {
      this._propsRef.value = l, this._errorsRef.value = [..._];
      for (const d of _)
        this.emitEvent("invalid", { message: d });
    }, { signal: u.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: u.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: u.signal });
    const c = (l) => {
      if (u.signal.aborted)
        return;
      const _ = je(), d = de(l.rootComponent);
      this._vueApp = d;
      const y = He();
      if (l.piniaPlugins)
        for (const k of l.piniaPlugins)
          y.use(k);
      if (d.use(y), l.plugins)
        for (const k of l.plugins)
          d.use(k);
      d.provide(Z, this._propsRef), d.provide(ze, this._errorsRef), d.provide(X, this.emitEvent.bind(this)), d.provide(Ke, this._contentRef), d.provide(qe, this._hostVisibilityRef), d.provide(We, $e(this)), d.provide(Je, De(this)), d.provide(Ye, Y(this)), l.providers && l.providers(d, this), d.mount(t), _ && G(_);
    };
    if (a.rootComponent)
      c(a);
    else if (a.lazyConfig) {
      const l = document.createElement("wippy-loading");
      l.setAttribute("no-bg", ""), t.appendChild(l), a.lazyConfig().then((_) => {
        u.signal.aborted || (l.remove(), c(_));
      }).catch((_) => {
        if (u.signal.aborted)
          return;
        const d = _ instanceof Error ? _.message : String(_), y = document.createElement("wippy-error");
        y.setAttribute("title", "Failed to load"), y.setAttribute("message", d), l.replaceWith(y), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
function P(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function W(e) {
  return Array.isArray(e) && e.every((t) => typeof t == "string");
}
function I(e) {
  return typeof e == "string" ? e : void 0;
}
function A(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}
const Ze = { class: "km" }, et = { class: "field" }, tt = { "data-kb-picker": "" }, st = ["config"], it = ["value"], nt = { class: "hint" }, ot = { class: "switches" }, rt = { class: "check" }, lt = { class: "check" }, at = { class: "row" }, ct = { class: "field" }, pt = { class: "field" }, ut = { "data-model-picker": "" }, dt = ["value"], ht = ["value"], mt = { style: { display: "grid", gap: "10px", "margin-top": "10px" } }, _t = { class: "field" }, ft = { class: "field" }, bt = {
  class: "row",
  style: { "margin-top": "10px" }
}, vt = { class: "field" }, yt = { class: "field" }, gt = /* @__PURE__ */ he({
  __name: "knowledge-memory",
  setup(e) {
    const t = {
      read_enabled: !0,
      write_enabled: !0,
      token_threshold: 64e3,
      checkpoint_model: "class:fast",
      checkpoint_prompt: "",
      recall_prompt: "",
      recall_limit: 5,
      recall_max_chars: 4e3
    }, s = Ge(), n = Qe(), o = b([]), r = b(t.read_enabled), a = b(t.write_enabled), u = b(String(t.token_threshold)), c = b(t.checkpoint_model), l = b(t.checkpoint_prompt), _ = b(t.recall_prompt), d = b(String(t.recall_limit)), y = b(String(t.recall_max_chars)), k = b(!1), M = b(!1), ee = O(() => JSON.stringify({ kb_ids: o.value })), D = O(() => c.value || t.checkpoint_model), te = O(
      () => o.value.length ? `${o.value.length} selected; the first selected base is the write target.` : "Select a knowledge base to enable recall and optional writes."
    );
    function T(h, i) {
      const f = Number(h);
      return Number.isFinite(f) && f > 0 ? f : i;
    }
    function se(h) {
      if (h == null || h === "") return;
      let i;
      if (typeof h == "string")
        try {
          i = JSON.parse(h);
        } catch {
          ie();
          return;
        }
      else if (typeof h == "object")
        i = h;
      else
        return;
      if (!P(i)) return;
      const v = { ...P(i.context) ? i.context : {}, ...i }, $ = P(i.agent_options) ? i.agent_options : {}, j = P($.checkpoint) ? $.checkpoint : {};
      o.value = W(v.kb_ids) ? v.kb_ids : typeof v.kb_id == "string" && v.kb_id ? [v.kb_id] : [], r.value = v.read_enabled !== !1, a.value = v.write_enabled !== !1, c.value = I(v.checkpoint_model) || I(j.model) || t.checkpoint_model, l.value = I(v.checkpoint_prompt) || "", _.value = I(v.recall_prompt) || "", u.value = String(A(j.token_threshold) ?? A(v.token_threshold) ?? t.token_threshold), d.value = String(A(v.recall_limit) || t.recall_limit), y.value = String(A(v.recall_max_chars) || t.recall_max_chars);
    }
    function ie() {
      o.value = [], r.value = t.read_enabled, a.value = t.write_enabled, u.value = String(t.token_threshold), c.value = t.checkpoint_model, l.value = t.checkpoint_prompt, _.value = t.recall_prompt, d.value = String(t.recall_limit), y.value = String(t.recall_max_chars);
    }
    function ne() {
      const h = c.value || t.checkpoint_model, i = {
        kb_ids: [...o.value],
        read_enabled: r.value,
        write_enabled: a.value,
        checkpoint_model: h,
        checkpoint_prompt: l.value,
        recall_prompt: _.value,
        recall_limit: T(d.value, t.recall_limit),
        recall_max_chars: T(y.value, t.recall_max_chars)
      };
      return {
        context: i,
        agent_options: {
          checkpoint: {
            token_threshold: T(u.value, t.token_threshold),
            model: i.checkpoint_model,
            max_tokens: 1e3
          }
        }
      };
    }
    function g() {
      n("config-changed", ne());
    }
    function oe(h) {
      const i = h instanceof CustomEvent ? h.detail : void 0;
      o.value = P(i) && W(i.kb_ids) ? i.kb_ids : [], g();
    }
    function re(h) {
      if (!(h.target instanceof HTMLInputElement)) return;
      const i = h.target.value;
      o.value = i ? [i] : [], g();
    }
    function le(h) {
      const i = h instanceof CustomEvent ? h.detail : void 0;
      c.value = typeof i == "string" && i || t.checkpoint_model, g();
    }
    function ae(h) {
      if (!(h.target instanceof HTMLInputElement)) return;
      const i = h.target.value;
      c.value = i || t.checkpoint_model, g();
    }
    return me(() => s.value.config, se, { immediate: !0, deep: !0 }), _e(async () => {
      try {
        customElements.get("wc-kb-picker") || await B("wc-kb-picker", { timeoutMs: 8e3 });
      } catch {
        k.value = !0;
      }
      try {
        customElements.get("wc-model-picker") || await B("wc-model-picker", { timeoutMs: 8e3 });
      } catch {
        M.value = !0;
      }
    }), (h, i) => (x(), E("div", Ze, [
      p("div", et, [
        i[7] || (i[7] = p("span", null, "Memory knowledge base", -1)),
        p("div", tt, [
          k.value ? (x(), E("input", {
            key: 1,
            name: "kb_id_fallback",
            placeholder: "Knowledge base id",
            value: o.value[0] || "",
            onInput: re
          }, null, 40, it)) : (x(), E("wc-kb-picker", {
            key: 0,
            config: ee.value,
            onConfigChanged: oe
          }, null, 40, st))
        ]),
        p("span", nt, fe(te.value), 1)
      ]),
      p("div", ot, [
        p("label", rt, [
          C(p("input", {
            name: "read_enabled",
            type: "checkbox",
            "onUpdate:modelValue": i[0] || (i[0] = (f) => r.value = f),
            onChange: g
          }, null, 544), [
            [H, r.value]
          ]),
          i[8] || (i[8] = w(" Inject memory on activation ", -1))
        ]),
        p("label", lt, [
          C(p("input", {
            name: "write_enabled",
            type: "checkbox",
            "onUpdate:modelValue": i[1] || (i[1] = (f) => a.value = f),
            onChange: g
          }, null, 544), [
            [H, a.value]
          ]),
          i[9] || (i[9] = w(" Persist checkpoints to memory ", -1))
        ])
      ]),
      p("div", at, [
        p("label", ct, [
          i[10] || (i[10] = w("Checkpoint after tokens ", -1)),
          C(p("input", {
            name: "token_threshold",
            type: "number",
            min: "200",
            max: "200000",
            step: "100",
            "onUpdate:modelValue": i[2] || (i[2] = (f) => u.value = f),
            onInput: g
          }, null, 544), [
            [V, u.value]
          ])
        ]),
        p("div", pt, [
          i[11] || (i[11] = p("span", null, "Checkpoint model", -1)),
          p("div", ut, [
            M.value ? (x(), E("input", {
              key: 1,
              name: "model_fallback",
              placeholder: "class:fast",
              value: D.value,
              onInput: ae
            }, null, 40, ht)) : (x(), E("wc-model-picker", {
              key: 0,
              value: D.value,
              onSelect: le
            }, null, 40, dt))
          ])
        ])
      ]),
      p("details", null, [
        i[16] || (i[16] = p("summary", null, "Advanced", -1)),
        p("div", mt, [
          p("label", _t, [
            i[12] || (i[12] = w("Memory write instructions ", -1)),
            C(p("textarea", {
              name: "checkpoint_prompt",
              placeholder: "Store relevant details for future conversations. Do not store literal assistant answers.",
              "onUpdate:modelValue": i[3] || (i[3] = (f) => l.value = f),
              onInput: g
            }, null, 544), [
              [V, l.value]
            ])
          ]),
          p("label", ft, [
            i[13] || (i[13] = w("Recall guidance ", -1)),
            C(p("textarea", {
              name: "recall_prompt",
              placeholder: "Long-term memory may be incomplete or inaccurate; use it as advisory context.",
              "onUpdate:modelValue": i[4] || (i[4] = (f) => _.value = f),
              onInput: g
            }, null, 544), [
              [V, _.value]
            ])
          ])
        ]),
        p("div", bt, [
          p("label", vt, [
            i[14] || (i[14] = w("Recall results ", -1)),
            C(p("input", {
              name: "recall_limit",
              type: "number",
              min: "1",
              max: "20",
              "onUpdate:modelValue": i[5] || (i[5] = (f) => d.value = f),
              onInput: g
            }, null, 544), [
              [V, d.value]
            ])
          ]),
          p("label", yt, [
            i[15] || (i[15] = w("Recall budget ", -1)),
            C(p("input", {
              name: "recall_max_chars",
              type: "number",
              min: "500",
              max: "20000",
              step: "500",
              "onUpdate:modelValue": i[6] || (i[6] = (f) => y.value = f),
              onInput: g
            }, null, 544), [
              [V, y.value]
            ])
          ])
        ])
      ])
    ]));
  }
}), Ct = ":host{display:block;color:var(--p-text-color, #172033);font:13px/1.4 Inter,system-ui,sans-serif}.km{display:grid;gap:12px}.field{display:grid;gap:6px;font-weight:600}.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:end}.switches{display:flex;flex-wrap:wrap;gap:8px 14px}.check{display:inline-flex;align-items:center;gap:7px;font-weight:600}.check input{width:16px;height:16px;margin:0;accent-color:var(--p-primary-color, #2563eb)}input,textarea{width:100%;box-sizing:border-box;border:1px solid var(--p-content-border-color, #d0d7e2);border-radius:6px;padding:8px 10px;background:var(--p-inputtext-background, #fff);color:inherit;font:inherit}textarea{min-height:78px;resize:vertical}details{border-top:1px solid var(--p-content-border-color, #e2e8f0);padding-top:10px}summary{cursor:pointer;color:var(--p-text-muted-color, #64748b);font-weight:600}.hint{color:var(--p-text-muted-color, #64748b);font-size:12px;font-weight:400}@media(max-width:560px){.row{grid-template-columns:1fr}}", wt = { props: { type: "object", properties: { config: { type: "object", description: "Trait activation context and agent_options.checkpoint policy for the memory capability.", default: {} } } } }, kt = {
  wippy: wt
};
class St extends Xe {
  static get wippyConfig() {
    return {
      propsSchema: kt.wippy.props,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Ct
    };
  }
  static get vueConfig() {
    return { rootComponent: gt };
  }
}
ke(import.meta.url, St);
//# sourceMappingURL=knowledge_memory.js.map
