import { hasInjectionContext as de, inject as D, effectScope as he, ref as b, markRaw as me, createApp as _e, defineComponent as fe, computed as N, watch as be, onMounted as ve, openBlock as E, createElementBlock as V, createElementVNode as p, toDisplayString as ye, withDirectives as w, vModelCheckbox as F, createTextVNode as k, vModelText as P } from "vue";
import { addCollection as ge } from "@iconify/vue";
import { config as K, addIcons as Ce, on as we, applyThemeMode as A, host as ke, hostCss as Se, loadCss as xe, loadByTagName as z, define as Ee } from "@wippy-fe/proxy";
var M = "data-wippy-visible";
function W(e) {
  const t = e.getAttribute(M);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Ve = Object.defineProperty, Pe = (e, t, s) => t in e ? Ve(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s, _ = (e, t, s) => Pe(e, typeof t != "symbol" ? t + "" : t, s), Re = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ie = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function J(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Ae(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e)
    if (s)
      for (const [n, o] of Object.entries(s)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [l, u] of Object.entries(o)) {
            const c = typeof u == "string" ? J(l) : null;
            c && t.add(c);
          }
          continue;
        }
        const r = typeof o == "string" ? J(n) : null;
        r && t.add(r);
      }
  return [...t].sort();
}
function Oe(e) {
  if (e.length === 0)
    return "";
  const t = e.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${Ie} {
${t}
}`;
}
function Te(e, t) {
  const s = Oe(t);
  s && q(e, s, "@wippy-fe/css-variables-bridge");
}
function Le(e, t) {
  const n = (t ?? Re).map(async (o) => {
    const r = Se[o];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await xe(r);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${r}):`, l), null;
    }
  });
  return Promise.all(n).then((o) => {
    for (const r of o) {
      if (!r)
        continue;
      const l = document.createElement("style");
      l.textContent = r, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function Ne(e, t) {
  const s = document.createElement("style");
  s.textContent = t, e.appendChild(s);
}
function q(e, t, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", s), n.textContent = t, e.appendChild(n);
}
function Ue(e, t) {
  q(e, t, "@wippy-fe/custom-css");
}
function G(e) {
  return e.__wippyHost ?? null;
}
function Me(e) {
  return e.replace(/-([a-z])/g, (t, s) => s.toUpperCase());
}
function De(e, t, s) {
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
function U(e, t) {
  const s = {}, n = [];
  for (const [o, r] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), u = Me(o);
    if (l === null) {
      r.default !== void 0 && (s[u] = r.default);
      continue;
    }
    const c = De(o, l, r);
    c.error ? n.push(c.error) : s[u] = c.value;
  }
  return { props: s, errors: n };
}
var $e = class {
  constructor(e, t) {
    _(this, "_props"), _(this, "_errors"), _(this, "_content"), _(this, "_hostVisibility"), _(this, "_propsListeners", /* @__PURE__ */ new Set()), _(this, "_contentListeners", /* @__PURE__ */ new Set()), _(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), _(this, "_disposed", !1), _(this, "_emitToDom"), _(this, "props"), _(this, "events"), _(this, "content"), _(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, je = class extends HTMLElement {
  constructor() {
    super(), _(this, "_internals"), _(this, "_contentObserver", null), _(this, "_initialized", !1), _(this, "_container", null), _(this, "_reactive", null), _(this, "_lastProps", null), _(this, "_lastErrors", []), _(this, "_lastContent", null), _(this, "_themeUnsub", null), _(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = W(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...s, M])];
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
    return G(this);
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
        const r = U(this, e.propsSchema);
        e.validateProps && r.errors.push(...e.validateProps(r.props)), s = r.props, n = r.errors, this._lastProps = s, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new $e(
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
        this.onInit(s), e.inlineCss && Ne(s, e.inlineCss);
        try {
          const a = K?.theming, h = Ae(
            a?.global?.cssVariables,
            a?.children?.cssVariables
          );
          Te(s, h);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const a = K?.theming, h = [a?.global?.customCSS, a?.children?.customCSS].filter(Boolean).join(`
`);
            h && Ue(s, h);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Le(s, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && n.classList.add(...c), s.appendChild(n), this._container = n, Ce(ge);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = we("@theme", (c) => this._applyTheme(c)));
      const { props: o, errors: r } = U(this, e.propsSchema);
      e.validateProps && r.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = r;
      let u = null;
      e.contentTemplate && (u = this._extractContent(e.contentTemplate), this._lastContent = u, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, n, l, r, u, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ke.getThemeMode?.()) {
    A(e, this), this._container && A(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), A("auto", this), this._container && A("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, s) {
    if (t === s)
      return;
    if (e === M) {
      const u = this._hostVisible, c = W(this);
      if (c === u)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, u), this.onHostVisibilityChanged(c, u));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: r } = U(this, n.propsSchema);
    n.validateProps && r.push(...n.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = r, this._reactive?.notifyProps(l, r), this.onPropsChanged(l, r);
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
function He(e) {
  return e.__wippyHostBus ?? null;
}
function Be(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Q;
const X = (e) => Q = e, Fe = () => de() && D(Z) || Q, Z = (
  /* istanbul ignore next */
  Symbol()
);
function Ke() {
  const e = he(!0), t = e.run(() => b({}));
  let s = [], n = [];
  const o = me({
    install(r) {
      X(o), o._a = r, r.provide(Z, o), r.config.globalProperties.$pinia = o, n.forEach((l) => s.push(l)), n = [];
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
var ze = Object.defineProperty, We = (e, t, s) => t in e ? ze(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s, S = (e, t, s) => We(e, typeof t != "symbol" ? t + "" : t, s), ee = /* @__PURE__ */ Symbol("wippy:emit"), te = /* @__PURE__ */ Symbol("wippy:props"), Je = /* @__PURE__ */ Symbol("wippy:props_error"), Ye = /* @__PURE__ */ Symbol("wippy:content"), qe = /* @__PURE__ */ Symbol("wippy:panel-id"), Ge = /* @__PURE__ */ Symbol("wippy:layout-bus"), Qe = /* @__PURE__ */ Symbol("wippy:host"), Xe = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ze() {
  const e = D(te);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function et() {
  const e = D(ee);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var tt = class extends je {
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
    const l = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = n, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const a of n)
      this.emitEvent("invalid", { message: a });
    const u = new AbortController();
    this._bridgeAbort = u, this.reactive.props.subscribe((a, h) => {
      this._propsRef.value = a, this._errorsRef.value = [...h];
      for (const d of h)
        this.emitEvent("invalid", { message: d });
    }, { signal: u.signal }), this.reactive.content && this.reactive.content.subscribe((a) => {
      this._contentRef.value = a;
    }, { signal: u.signal }), this.reactive.hostVisibility.subscribe((a) => {
      this._hostVisibilityRef.value = a;
    }, { signal: u.signal });
    const c = (a) => {
      if (u.signal.aborted)
        return;
      const h = Fe(), d = _e(a.rootComponent);
      this._vueApp = d;
      const y = Ke();
      if (a.piniaPlugins)
        for (const C of a.piniaPlugins)
          y.use(C);
      if (d.use(y), a.plugins)
        for (const C of a.plugins)
          d.use(C);
      d.provide(te, this._propsRef), d.provide(Je, this._errorsRef), d.provide(ee, this.emitEvent.bind(this)), d.provide(Ye, this._contentRef), d.provide(Xe, this._hostVisibilityRef), d.provide(qe, Be(this)), d.provide(Ge, He(this)), d.provide(Qe, G(this)), a.providers && a.providers(d, this), d.mount(t), h && X(h);
    };
    if (l.rootComponent)
      c(l);
    else if (l.lazyConfig) {
      const a = document.createElement("wippy-loading");
      a.setAttribute("no-bg", ""), t.appendChild(a), l.lazyConfig().then((h) => {
        u.signal.aborted || (a.remove(), c(h));
      }).catch((h) => {
        if (u.signal.aborted)
          return;
        const d = h instanceof Error ? h.message : String(h), y = document.createElement("wippy-error");
        y.setAttribute("title", "Failed to load"), y.setAttribute("message", d), a.replaceWith(y), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
function R(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function Y(e) {
  return Array.isArray(e) && e.every((t) => typeof t == "string");
}
function O(e) {
  return typeof e == "string" ? e : void 0;
}
function I(e) {
  return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}
const st = { class: "km" }, it = { class: "field" }, nt = { "data-kb-picker": "" }, ot = ["config"], rt = ["value"], lt = { class: "hint" }, at = { class: "switches" }, ct = { class: "check" }, pt = { class: "check" }, ut = { class: "row" }, dt = { class: "field" }, ht = { class: "field" }, mt = { "data-model-picker": "" }, _t = ["value"], ft = ["value"], bt = { style: { display: "grid", gap: "10px", "margin-top": "10px" } }, vt = { class: "field" }, yt = { class: "field" }, gt = {
  class: "row",
  style: { "margin-top": "10px" }
}, Ct = { class: "field" }, wt = { class: "field" }, kt = /* @__PURE__ */ fe({
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
    }, s = Ze(), n = et(), o = b({}), r = b({}), l = b([]), u = b(t.read_enabled), c = b(t.write_enabled), a = b(String(t.token_threshold)), h = b(t.checkpoint_model), d = b(t.checkpoint_prompt), y = b(t.recall_prompt), C = b(String(t.recall_limit)), x = b(String(t.recall_max_chars)), $ = b(!1), j = b(!1), se = N(() => JSON.stringify({ kb_ids: l.value })), H = N(() => h.value || t.checkpoint_model), ie = N(
      () => l.value.length ? `${l.value.length} selected; the first selected base is the write target.` : "Select a knowledge base to enable recall and optional writes."
    );
    function T(m, i) {
      const f = Number(m);
      return Number.isFinite(f) && f > 0 ? f : i;
    }
    function ne(m) {
      if (m == null || m === "") return;
      let i;
      if (typeof m == "string")
        try {
          i = JSON.parse(m);
        } catch {
          oe();
          return;
        }
      else if (typeof m == "object")
        i = m;
      else
        return;
      if (!R(i)) return;
      const f = R(i.context) ? i.context : {}, v = { ...f, ...i }, B = R(i.agent_options) ? i.agent_options : {}, L = R(B.checkpoint) ? B.checkpoint : {}, { context: Vt, agent_options: Pt, ...ue } = i;
      o.value = { ...f, ...ue }, r.value = { ...L }, l.value = Y(v.kb_ids) ? v.kb_ids : typeof v.kb_id == "string" && v.kb_id ? [v.kb_id] : [], u.value = v.read_enabled !== !1, c.value = v.write_enabled !== !1, h.value = O(v.checkpoint_model) || O(L.model) || t.checkpoint_model, d.value = O(v.checkpoint_prompt) || "", y.value = O(v.recall_prompt) || "", a.value = String(I(L.token_threshold) ?? I(v.token_threshold) ?? t.token_threshold), C.value = String(I(v.recall_limit) || t.recall_limit), x.value = String(I(v.recall_max_chars) || t.recall_max_chars);
    }
    function oe() {
      o.value = {}, r.value = {}, l.value = [], u.value = t.read_enabled, c.value = t.write_enabled, a.value = String(t.token_threshold), h.value = t.checkpoint_model, d.value = t.checkpoint_prompt, y.value = t.recall_prompt, C.value = String(t.recall_limit), x.value = String(t.recall_max_chars);
    }
    function re() {
      const m = h.value || t.checkpoint_model, i = {
        ...o.value,
        kb_ids: [...l.value],
        read_enabled: u.value,
        write_enabled: c.value,
        checkpoint_model: m,
        checkpoint_prompt: d.value,
        recall_prompt: y.value,
        recall_limit: T(C.value, t.recall_limit),
        recall_max_chars: T(x.value, t.recall_max_chars)
      };
      return {
        context: i,
        agent_options: {
          checkpoint: {
            ...r.value,
            token_threshold: T(a.value, t.token_threshold),
            model: i.checkpoint_model,
            max_tokens: I(r.value.max_tokens) ?? 1e3
          }
        }
      };
    }
    function g() {
      n("config-changed", re());
    }
    function le(m) {
      const i = m instanceof CustomEvent ? m.detail : void 0;
      l.value = R(i) && Y(i.kb_ids) ? i.kb_ids : [], g();
    }
    function ae(m) {
      if (!(m.target instanceof HTMLInputElement)) return;
      const i = m.target.value;
      l.value = i ? [i] : [], g();
    }
    function ce(m) {
      const i = m instanceof CustomEvent ? m.detail : void 0;
      h.value = typeof i == "string" && i || t.checkpoint_model, g();
    }
    function pe(m) {
      if (!(m.target instanceof HTMLInputElement)) return;
      const i = m.target.value;
      h.value = i || t.checkpoint_model, g();
    }
    return be(() => s.value.config, ne, { immediate: !0, deep: !0 }), ve(async () => {
      try {
        customElements.get("wc-kb-picker") || await z("wc-kb-picker", { timeoutMs: 8e3 });
      } catch {
        $.value = !0;
      }
      try {
        customElements.get("wc-model-picker") || await z("wc-model-picker", { timeoutMs: 8e3 });
      } catch {
        j.value = !0;
      }
    }), (m, i) => (E(), V("div", st, [
      p("div", it, [
        i[7] || (i[7] = p("span", { id: "legacy_memory_kbs" }, "Memory knowledge bases", -1)),
        p("div", nt, [
          $.value ? (E(), V("input", {
            key: 1,
            "aria-label": "Memory knowledge base ID",
            name: "kb_id_fallback",
            placeholder: "Knowledge base id",
            value: l.value[0] || "",
            onInput: ae
          }, null, 40, rt)) : (E(), V("wc-kb-picker", {
            key: 0,
            "aria-labelledby": "legacy_memory_kbs",
            config: se.value,
            onConfigChanged: le
          }, null, 40, ot))
        ]),
        p("span", lt, ye(ie.value), 1)
      ]),
      p("div", at, [
        p("label", ct, [
          w(p("input", {
            name: "read_enabled",
            type: "checkbox",
            "onUpdate:modelValue": i[0] || (i[0] = (f) => u.value = f),
            onChange: g
          }, null, 544), [
            [F, u.value]
          ]),
          i[8] || (i[8] = k(" Inject memory on activation ", -1))
        ]),
        p("label", pt, [
          w(p("input", {
            name: "write_enabled",
            type: "checkbox",
            "onUpdate:modelValue": i[1] || (i[1] = (f) => c.value = f),
            onChange: g
          }, null, 544), [
            [F, c.value]
          ]),
          i[9] || (i[9] = k(" Persist checkpoints to memory ", -1))
        ])
      ]),
      p("div", ut, [
        p("label", dt, [
          i[10] || (i[10] = k("Checkpoint after tokens ", -1)),
          w(p("input", {
            name: "token_threshold",
            type: "number",
            min: "200",
            max: "200000",
            step: "100",
            "onUpdate:modelValue": i[2] || (i[2] = (f) => a.value = f),
            onInput: g
          }, null, 544), [
            [P, a.value]
          ])
        ]),
        p("div", ht, [
          i[11] || (i[11] = p("span", { id: "legacy_checkpoint_model" }, "Checkpoint model", -1)),
          p("div", mt, [
            j.value ? (E(), V("input", {
              key: 1,
              "aria-label": "Checkpoint model",
              name: "model_fallback",
              placeholder: "class:fast",
              value: H.value,
              onInput: pe
            }, null, 40, ft)) : (E(), V("wc-model-picker", {
              key: 0,
              "aria-labelledby": "legacy_checkpoint_model",
              value: H.value,
              onSelect: ce
            }, null, 40, _t))
          ])
        ])
      ]),
      p("details", null, [
        i[16] || (i[16] = p("summary", null, "Advanced", -1)),
        p("div", bt, [
          p("label", vt, [
            i[12] || (i[12] = k("Memory write instructions ", -1)),
            w(p("textarea", {
              name: "checkpoint_prompt",
              placeholder: "Store relevant details for future conversations. Do not store literal assistant answers.",
              "onUpdate:modelValue": i[3] || (i[3] = (f) => d.value = f),
              onInput: g
            }, null, 544), [
              [P, d.value]
            ])
          ]),
          p("label", yt, [
            i[13] || (i[13] = k("Recall guidance ", -1)),
            w(p("textarea", {
              name: "recall_prompt",
              placeholder: "Long-term memory may be incomplete or inaccurate; use it as advisory context.",
              "onUpdate:modelValue": i[4] || (i[4] = (f) => y.value = f),
              onInput: g
            }, null, 544), [
              [P, y.value]
            ])
          ])
        ]),
        p("div", gt, [
          p("label", Ct, [
            i[14] || (i[14] = k("Recall results ", -1)),
            w(p("input", {
              name: "recall_limit",
              type: "number",
              min: "1",
              max: "20",
              "onUpdate:modelValue": i[5] || (i[5] = (f) => C.value = f),
              onInput: g
            }, null, 544), [
              [P, C.value]
            ])
          ]),
          p("label", wt, [
            i[15] || (i[15] = k("Recall budget ", -1)),
            w(p("input", {
              name: "recall_max_chars",
              type: "number",
              min: "500",
              max: "20000",
              step: "500",
              "onUpdate:modelValue": i[6] || (i[6] = (f) => x.value = f),
              onInput: g
            }, null, 544), [
              [P, x.value]
            ])
          ])
        ])
      ])
    ]));
  }
}), St = ":host{display:block;color:var(--p-text-color, #172033);font:13px/1.4 Inter,system-ui,sans-serif}.km{display:grid;gap:12px}.field{display:grid;gap:6px;font-weight:600}.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:end}.switches{display:flex;flex-wrap:wrap;gap:8px 14px}.check{display:inline-flex;align-items:center;gap:7px;font-weight:600}.check input{width:16px;height:16px;margin:0;accent-color:var(--p-primary-color, #2563eb)}input,textarea{width:100%;box-sizing:border-box;border:1px solid var(--p-content-border-color, #d0d7e2);border-radius:6px;padding:8px 10px;background:var(--p-inputtext-background, #fff);color:inherit;font:inherit}textarea{min-height:78px;resize:vertical}details{border-top:1px solid var(--p-content-border-color, #e2e8f0);padding-top:10px}summary{cursor:pointer;color:var(--p-text-muted-color, #64748b);font-weight:600}.hint{color:var(--p-text-muted-color, #64748b);font-size:12px;font-weight:400}@media(max-width:560px){.row{grid-template-columns:1fr}}", xt = { type: "object", properties: { config: { type: "object", description: "Existing KB memory context and checkpoint policy." } } };
class Et extends tt {
  static get wippyConfig() {
    return {
      propsSchema: xt,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: St
    };
  }
  static get vueConfig() {
    return { rootComponent: kt };
  }
}
Ee(import.meta.url, Et);
//# sourceMappingURL=knowledge_memory.js.map
