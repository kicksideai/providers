import { hasInjectionContext as Ot, inject as Me, effectScope as jr, ref as A, markRaw as jt, toRaw as Se, watch as et, unref as F, isRef as Hr, isReadonly as Gr, createApp as Br, defineComponent as Fr, computed as Ne, onMounted as Kr, openBlock as C, createElementBlock as P, createElementVNode as E, createVNode as Q, createTextVNode as ue, createBlock as It, toDisplayString as J, normalizeClass as Wr, Fragment as Ye, renderList as xt, createCommentVNode as de } from "vue";
import { addCollection as Yr, Icon as W } from "@iconify/vue";
import { config as kt, addIcons as qr, on as Jr, applyThemeMode as Re, host as Ht, hostCss as Zr, loadCss as Xr, api as Gt, loadByTagName as Qr, define as eo } from "@wippy-fe/proxy";
var tt = "data-wippy-visible";
function Ct(e) {
  const t = e.getAttribute(tt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var to = Object.defineProperty, ro = (e, t, r) => t in e ? to(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, k = (e, t, r) => ro(e, typeof t != "symbol" ? t + "" : t, r), oo = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], no = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Nt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function so(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [i, a] of Object.entries(n)) {
            const c = typeof a == "string" ? Nt(i) : null;
            c && t.add(c);
          }
          continue;
        }
        const s = typeof n == "string" ? Nt(o) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function io(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${no} {
${t}
}`;
}
function ao(e, t) {
  const r = io(t);
  r && Bt(e, r, "@wippy-fe/css-variables-bridge");
}
function co(e, t) {
  const o = (t ?? oo).map(async (n) => {
    const s = Zr[n];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Xr(s);
    } catch (i) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${s}):`, i), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const s of n) {
      if (!s)
        continue;
      const i = document.createElement("style");
      i.textContent = s, i.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(i);
    }
  });
}
function lo(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Bt(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function po(e, t) {
  Bt(e, t, "@wippy-fe/custom-css");
}
function Ft(e) {
  return e.__wippyHost ?? null;
}
function uo(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function fo(e, t, r) {
  switch (r.type) {
    case "string":
      return { value: t };
    case "number": {
      const o = Number.parseFloat(t);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(t, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(t);
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function qe(e, t) {
  const r = {}, o = [];
  for (const [n, s] of Object.entries(t.properties)) {
    const i = e.getAttribute(n), a = uo(n);
    if (i === null) {
      s.default !== void 0 && (r[a] = s.default);
      continue;
    }
    const c = fo(n, i, s);
    c.error ? o.push(c.error) : r[a] = c.value;
  }
  return { props: r, errors: o };
}
var ho = class {
  constructor(e, t) {
    k(this, "_props"), k(this, "_errors"), k(this, "_content"), k(this, "_hostVisibility"), k(this, "_propsListeners", /* @__PURE__ */ new Set()), k(this, "_contentListeners", /* @__PURE__ */ new Set()), k(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), k(this, "_disposed", !1), k(this, "_emitToDom"), k(this, "props"), k(this, "events"), k(this, "content"), k(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, n) {
        return r._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        r._disposed || r._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, n) {
        return r._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, n) {
        return r._subscribeHostVisibility(o, n);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const r of this._propsListeners)
        r(e, t);
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
      for (const r of this._hostVisibilityListeners)
        r(e, t);
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
    const r = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const r = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const r = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
}, mo = class extends HTMLElement {
  constructor() {
    super(), k(this, "_internals"), k(this, "_contentObserver", null), k(this, "_initialized", !1), k(this, "_container", null), k(this, "_reactive", null), k(this, "_lastProps", null), k(this, "_lastErrors", []), k(this, "_lastContent", null), k(this, "_themeUnsub", null), k(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ct(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), r = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...r, tt])];
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
    return Ft(this);
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
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const s = qe(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), r = s.props, o = s.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new ho(
        { props: r, errors: o, content: n, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, r = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(r), e.inlineCss && lo(r, e.inlineCss);
        try {
          const p = kt?.theming, v = so(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          ao(r, v);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const p = kt?.theming, v = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            v && po(r, v);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && co(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const c = e.containerClasses ?? [];
        c.length > 0 && o.classList.add(...c), r.appendChild(o), this._container = o, qr(Yr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Jr("@theme", (c) => this._applyTheme(c)));
      const { props: n, errors: s } = qe(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(n));
      const i = n;
      this._lastProps = i, this._lastErrors = s;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(e.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, i, s, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ht.getThemeMode?.()) {
    Re(e, this), this._container && Re(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Re("auto", this), this._container && Re("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === tt) {
      const a = this._hostVisible, c = Ct(this);
      if (c === a)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, a), this.onHostVisibilityChanged(c, a));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: s } = qe(this, o.propsSchema);
    o.validateProps && s.push(...o.validateProps(n));
    const i = n;
    this._lastProps = i, this._lastErrors = s, this._reactive?.notifyProps(i, s), this.onPropsChanged(i, s);
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
function go(e) {
  return e.__wippyHostBus ?? null;
}
function _o(e) {
  return e.dataset.wippyPanelId ?? null;
}
function vo(e) {
  const t = `[${e.name}] ${e.message}`, r = [];
  return e.fix && r.push(`fix: ${e.fix}`), e.sources?.length && r.push(`sources: ${e.sources.join(", ")}`), e.docs && r.push(`see: ${e.docs}`), r.length === 0 ? t : [t, ...r.map((o, n) => `${n < r.length - 1 ? "├▶" : "╰▶"} ${o}`)].join(`
`);
}
function Je(e, ...t) {
  return typeof e == "function" ? e(...t) : e;
}
// @__NO_SIDE_EFFECTS__
function yo({ method: e = "warn", formatter: t = vo } = {}) {
  return (r, { method: o = e } = {}) => {
    console[o](t(r));
  };
}
const Eo = Error.captureStackTrace;
var bo = class Kt extends Error {
  name;
  /**
  * The diagnostic code, e.g. `MATH_E001`.
  * Also appears as the `name` property.
  */
  code;
  /**
  * URL to extended documentation for this diagnostic code.
  * Auto-generated from {@link DefineDiagnosticsOptions.docsBase}.
  */
  docs;
  /**
  * Optional actionable instructions on how to resolve the problem.
  */
  fix;
  /**
  * Locations in user code that contributed to this diagnostic, in
  * `file:line:column` format. Relevant when the stack trace doesn't reflect
  * the user's source (e.g. compilers, bundlers), otherwise redundant with the
  * stack and should be omitted.
  */
  sources;
  /**
  * Structured information associated with this diagnostic code.
  */
  data;
  /**
  * Alias for {@link Error.message}: the reason this diagnostic was raised.
  */
  get why() {
    return this.message;
  }
  /**
  * @param init        structured initializer; `why` is required
  * @param captureFrom V8 stack-cutoff frame. Defaults to {@link Diagnostic}
  * so the top of the trace is the `new Diagnostic(...)` call site.
  * `defineDiagnostics` passes its action method to strip its own frames too.
  * Ignored on engines without `Error.captureStackTrace`.
  */
  constructor(t, r = Kt) {
    super(t.why, { cause: t.cause }), this.code = this.name = t.code, this.fix = t.fix, this.docs = t.docs, this.sources = t.sources, this.data = t.data, Eo?.(this, r);
  }
  /**
  * Converts the diagnostic into a serializable structured object.
  */
  toJSON() {
    return {
      name: this.name,
      why: this.why,
      fix: this.fix,
      docs: this.docs,
      sources: this.sources,
      cause: this.cause,
      data: this.data,
      stack: this.stack
    };
  }
};
function wo(e, t) {
  return typeof e == "string" ? `${e}/${t.toLowerCase()}` : e?.(t);
}
// @__NO_SIDE_EFFECTS__
function To(e) {
  const t = e.reporters ?? [], r = {}, { docsBase: o } = e;
  for (const n of Object.keys(e.codes)) {
    const s = e.codes[n], i = s.docs === !1 ? void 0 : s.docs || wo(o, n), a = (c = {}, p = {}) => {
      const v = new bo({
        code: n,
        why: Je(s.why, c),
        fix: Je(s.fix, c),
        docs: i,
        cause: c.cause,
        sources: c.sources,
        data: Je(s.data, c)
      }, a);
      for (const l of t) l(v, p);
      return v;
    };
    r[n] = a;
  }
  return r;
}
var So = Object.create, Wt = Object.defineProperty, Oo = Object.getOwnPropertyDescriptor, Io = Object.getOwnPropertyNames, xo = Object.getPrototypeOf, ko = Object.prototype.hasOwnProperty, Co = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), No = (e, t, r, o) => {
  if (t && typeof t == "object" || typeof t == "function") for (var n = Io(t), s = 0, i = n.length, a; s < i; s++)
    a = n[s], !ko.call(e, a) && a !== r && Wt(e, a, {
      get: ((c) => t[c]).bind(null, a),
      enumerable: !(o = Oo(t, a)) || o.enumerable
    });
  return e;
}, Ro = (e, t, r) => (r = e != null ? So(xo(e)) : {}, No(Wt(r, "default", {
  value: e,
  enumerable: !0
}), e));
const Yt = typeof navigator < "u", f = typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : typeof global < "u" ? global : {};
typeof f.chrome < "u" && f.chrome.devtools;
Yt && (f.self, f.top);
typeof navigator < "u" && navigator.userAgent?.toLowerCase().includes("electron");
var Po = /* @__PURE__ */ Ro((/* @__PURE__ */ Co(((e, t) => {
  t.exports = o;
  function r(s) {
    return s instanceof Buffer ? Buffer.from(s) : new s.constructor(s.buffer.slice(), s.byteOffset, s.length);
  }
  function o(s) {
    if (s = s || {}, s.circles) return n(s);
    const i = /* @__PURE__ */ new Map();
    if (i.set(Date, (l) => new Date(l)), i.set(Map, (l, y) => new Map(c(Array.from(l), y))), i.set(Set, (l, y) => new Set(c(Array.from(l), y))), s.constructorHandlers) for (const l of s.constructorHandlers) i.set(l[0], l[1]);
    let a = null;
    return s.proto ? v : p;
    function c(l, y) {
      const u = Object.keys(l), d = new Array(u.length);
      for (let b = 0; b < u.length; b++) {
        const g = u[b], h = l[g];
        typeof h != "object" || h === null ? d[g] = h : h.constructor !== Object && (a = i.get(h.constructor)) ? d[g] = a(h, y) : ArrayBuffer.isView(h) ? d[g] = r(h) : d[g] = y(h);
      }
      return d;
    }
    function p(l) {
      if (typeof l != "object" || l === null) return l;
      if (Array.isArray(l)) return c(l, p);
      if (l.constructor !== Object && (a = i.get(l.constructor))) return a(l, p);
      const y = {};
      for (const u in l) {
        if (Object.hasOwnProperty.call(l, u) === !1) continue;
        const d = l[u];
        typeof d != "object" || d === null ? y[u] = d : d.constructor !== Object && (a = i.get(d.constructor)) ? y[u] = a(d, p) : ArrayBuffer.isView(d) ? y[u] = r(d) : y[u] = p(d);
      }
      return y;
    }
    function v(l) {
      if (typeof l != "object" || l === null) return l;
      if (Array.isArray(l)) return c(l, v);
      if (l.constructor !== Object && (a = i.get(l.constructor))) return a(l, v);
      const y = {};
      for (const u in l) {
        const d = l[u];
        typeof d != "object" || d === null ? y[u] = d : d.constructor !== Object && (a = i.get(d.constructor)) ? y[u] = a(d, v) : ArrayBuffer.isView(d) ? y[u] = r(d) : y[u] = v(d);
      }
      return y;
    }
  }
  function n(s) {
    const i = [], a = [], c = /* @__PURE__ */ new Map();
    if (c.set(Date, (u) => new Date(u)), c.set(Map, (u, d) => new Map(v(Array.from(u), d))), c.set(Set, (u, d) => new Set(v(Array.from(u), d))), s.constructorHandlers) for (const u of s.constructorHandlers) c.set(u[0], u[1]);
    let p = null;
    return s.proto ? y : l;
    function v(u, d) {
      const b = Object.keys(u), g = new Array(b.length);
      for (let h = 0; h < b.length; h++) {
        const O = b[h], T = u[O];
        if (typeof T != "object" || T === null) g[O] = T;
        else if (T.constructor !== Object && (p = c.get(T.constructor))) g[O] = p(T, d);
        else if (ArrayBuffer.isView(T)) g[O] = r(T);
        else {
          const D = i.indexOf(T);
          D !== -1 ? g[O] = a[D] : g[O] = d(T);
        }
      }
      return g;
    }
    function l(u) {
      if (typeof u != "object" || u === null) return u;
      if (Array.isArray(u)) return v(u, l);
      if (u.constructor !== Object && (p = c.get(u.constructor))) return p(u, l);
      const d = {};
      i.push(u), a.push(d);
      for (const b in u) {
        if (Object.hasOwnProperty.call(u, b) === !1) continue;
        const g = u[b];
        if (typeof g != "object" || g === null) d[b] = g;
        else if (g.constructor !== Object && (p = c.get(g.constructor))) d[b] = p(g, l);
        else if (ArrayBuffer.isView(g)) d[b] = r(g);
        else {
          const h = i.indexOf(g);
          h !== -1 ? d[b] = a[h] : d[b] = l(g);
        }
      }
      return i.pop(), a.pop(), d;
    }
    function y(u) {
      if (typeof u != "object" || u === null) return u;
      if (Array.isArray(u)) return v(u, y);
      if (u.constructor !== Object && (p = c.get(u.constructor))) return p(u, y);
      const d = {};
      i.push(u), a.push(d);
      for (const b in u) {
        const g = u[b];
        if (typeof g != "object" || g === null) d[b] = g;
        else if (g.constructor !== Object && (p = c.get(g.constructor))) d[b] = p(g, y);
        else if (ArrayBuffer.isView(g)) d[b] = r(g);
        else {
          const h = i.indexOf(g);
          h !== -1 ? d[b] = a[h] : d[b] = y(g);
        }
      }
      return i.pop(), a.pop(), d;
    }
  }
})))());
const Ao = /(?:^|[-_/])(\w)/g;
function Do(e, t) {
  return t ? t.toUpperCase() : "";
}
function Vo(e) {
  return e && `${e}`.replace(Ao, Do);
}
function Lo(e, t) {
  let r = e.replace(/^[a-z]:/i, "").replace(/\\/g, "/");
  r.endsWith(`index${t}`) && (r = r.replace(`/index${t}`, t));
  const o = r.lastIndexOf("/"), n = r.substring(o + 1);
  {
    const s = n.lastIndexOf(t);
    return n.substring(0, s);
  }
}
const Rt = (0, Po.default)({ circles: !0 }), Uo = { trailing: !0 };
function ge(e, t = 25, r = {}) {
  if (r = {
    ...Uo,
    ...r
  }, !Number.isFinite(t)) throw new TypeError("Expected `wait` to be a finite number");
  let o, n, s = [], i, a;
  const c = (l, y) => (i = Mo(e, l, y), i.finally(() => {
    if (i = null, r.trailing && a && !n) {
      const u = c(l, a);
      return a = null, u;
    }
  }), i), p = function(...l) {
    return r.trailing && (a = l), i || new Promise((y) => {
      const u = !n && r.leading;
      clearTimeout(n), n = setTimeout(() => {
        n = null;
        const d = r.leading ? o : c(this, l);
        a = null;
        for (const b of s) b(d);
        s = [];
      }, t), u ? (o = c(this, l), y(o)) : s.push(y);
    });
  }, v = (l) => {
    l && (clearTimeout(l), n = null);
  };
  return p.isPending = () => !!n, p.cancel = () => {
    v(n), s = [], a = null;
  }, p.flush = () => {
    if (v(n), !a || i) return;
    const l = a;
    return a = null, c(this, l);
  }, p;
}
async function Mo(e, t, r) {
  return await e.apply(t, r);
}
function rt(e, t = {}, r) {
  for (const o in e) {
    const n = e[o], s = r ? `${r}:${o}` : o;
    typeof n == "object" && n !== null ? rt(n, t, s) : typeof n == "function" && (t[s] = n);
  }
  return t;
}
const $o = { run: (e) => e() }, zo = () => $o, qt = typeof console.createTask < "u" ? console.createTask : zo;
function jo(e, t) {
  const r = t.shift(), o = qt(r);
  return e.reduce(
    (n, s) => n.then(() => o.run(() => s(...t))),
    Promise.resolve()
  );
}
function Ho(e, t) {
  const r = t.shift(), o = qt(r);
  return Promise.all(e.map((n) => o.run(() => n(...t))));
}
function Ze(e, t) {
  for (const r of [...e])
    r(t);
}
class Go {
  constructor() {
    this._hooks = {}, this._before = void 0, this._after = void 0, this._deprecatedMessages = void 0, this._deprecatedHooks = {}, this.hook = this.hook.bind(this), this.callHook = this.callHook.bind(this), this.callHookWith = this.callHookWith.bind(this);
  }
  hook(t, r, o = {}) {
    if (!t || typeof r != "function")
      return () => {
      };
    const n = t;
    let s;
    for (; this._deprecatedHooks[t]; )
      s = this._deprecatedHooks[t], t = s.to;
    if (s && !o.allowDeprecated) {
      let i = s.message;
      i || (i = `${n} hook has been deprecated` + (s.to ? `, please use ${s.to}` : "")), this._deprecatedMessages || (this._deprecatedMessages = /* @__PURE__ */ new Set()), this._deprecatedMessages.has(i) || (console.warn(i), this._deprecatedMessages.add(i));
    }
    if (!r.name)
      try {
        Object.defineProperty(r, "name", {
          get: () => "_" + t.replace(/\W+/g, "_") + "_hook_cb",
          configurable: !0
        });
      } catch {
      }
    return this._hooks[t] = this._hooks[t] || [], this._hooks[t].push(r), () => {
      r && (this.removeHook(t, r), r = void 0);
    };
  }
  hookOnce(t, r) {
    let o, n = (...s) => (typeof o == "function" && o(), o = void 0, n = void 0, r(...s));
    return o = this.hook(t, n), o;
  }
  removeHook(t, r) {
    if (this._hooks[t]) {
      const o = this._hooks[t].indexOf(r);
      o !== -1 && this._hooks[t].splice(o, 1), this._hooks[t].length === 0 && delete this._hooks[t];
    }
  }
  deprecateHook(t, r) {
    this._deprecatedHooks[t] = typeof r == "string" ? { to: r } : r;
    const o = this._hooks[t] || [];
    delete this._hooks[t];
    for (const n of o)
      this.hook(t, n);
  }
  deprecateHooks(t) {
    Object.assign(this._deprecatedHooks, t);
    for (const r in t)
      this.deprecateHook(r, t[r]);
  }
  addHooks(t) {
    const r = rt(t), o = Object.keys(r).map(
      (n) => this.hook(n, r[n])
    );
    return () => {
      for (const n of o.splice(0, o.length))
        n();
    };
  }
  removeHooks(t) {
    const r = rt(t);
    for (const o in r)
      this.removeHook(o, r[o]);
  }
  removeAllHooks() {
    for (const t in this._hooks)
      delete this._hooks[t];
  }
  callHook(t, ...r) {
    return r.unshift(t), this.callHookWith(jo, t, ...r);
  }
  callHookParallel(t, ...r) {
    return r.unshift(t), this.callHookWith(Ho, t, ...r);
  }
  callHookWith(t, r, ...o) {
    const n = this._before || this._after ? { name: r, args: o, context: {} } : void 0;
    this._before && Ze(this._before, n);
    const s = t(
      r in this._hooks ? [...this._hooks[r]] : [],
      o
    );
    return s instanceof Promise ? s.finally(() => {
      this._after && n && Ze(this._after, n);
    }) : (this._after && n && Ze(this._after, n), s);
  }
  beforeEach(t) {
    return this._before = this._before || [], this._before.push(t), () => {
      if (this._before !== void 0) {
        const r = this._before.indexOf(t);
        r !== -1 && this._before.splice(r, 1);
      }
    };
  }
  afterEach(t) {
    return this._after = this._after || [], this._after.push(t), () => {
      if (this._after !== void 0) {
        const r = this._after.indexOf(t);
        r !== -1 && this._after.splice(r, 1);
      }
    };
  }
}
function Jt() {
  return new Go();
}
var Bo = Object.create, Zt = Object.defineProperty, Fo = Object.getOwnPropertyDescriptor, Ko = Object.getOwnPropertyNames, Wo = Object.getPrototypeOf, Yo = Object.prototype.hasOwnProperty, Xt = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), qo = (e, t, r, o) => {
  if (t && typeof t == "object" || typeof t == "function") for (var n = Ko(t), s = 0, i = n.length, a; s < i; s++)
    a = n[s], !Yo.call(e, a) && a !== r && Zt(e, a, {
      get: ((c) => t[c]).bind(null, a),
      enumerable: !(o = Fo(t, a)) || o.enumerable
    });
  return e;
}, Jo = (e, t, r) => (r = e != null ? Bo(Wo(e)) : {}, qo(Zt(r, "default", {
  value: e,
  enumerable: !0
}), e));
function Zo(e) {
  if (typeof e == "function") return e.displayName || e.name || e.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || "";
  const t = e.name || e._componentTag || e.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || e.__name;
  return t === "index" && e.__file?.endsWith("index.vue") ? "" : t;
}
function Xo(e) {
  const t = e.__file;
  if (t) return Vo(Lo(t, ".vue"));
}
function Pt(e, t) {
  return e.type.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ = t, t;
}
function ft(e) {
  if (e.__VUE_DEVTOOLS_NEXT_APP_RECORD__) return e.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
  if (e.root) return e.appContext.app.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
}
function Qt(e) {
  const t = e.subTree?.type, r = ft(e);
  return r ? r?.types?.Fragment === t : !1;
}
function Be(e) {
  const t = Zo(e?.type || {});
  if (t) return t;
  if (e?.root === e) return "Root";
  for (const o in e.parent?.type?.components) if (e.parent.type.components[o] === e?.type) return Pt(e, o);
  for (const o in e.appContext?.components) if (e.appContext.components[o] === e?.type) return Pt(e, o);
  const r = Xo(e?.type || {});
  return r || "Anonymous Component";
}
function Qo(e) {
  return `${e?.appContext?.app?.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__ ?? 0}:${e === e?.root ? "root" : e.uid}`;
}
function ot(e, t) {
  return t = t || `${e.id}:root`, e.instanceMap.get(t) || e.instanceMap.get(":root");
}
function en() {
  const e = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width() {
      return e.right - e.left;
    },
    get height() {
      return e.bottom - e.top;
    }
  };
  return e;
}
let Pe;
function tn(e) {
  return Pe || (Pe = document.createRange()), Pe.selectNode(e), Pe.getBoundingClientRect();
}
function rn(e) {
  const t = en();
  if (!e.children) return t;
  for (let r = 0, o = e.children.length; r < o; r++) {
    const n = e.children[r];
    let s;
    if (n.component) s = ce(n.component);
    else if (n.el) {
      const i = n.el;
      i.nodeType === 1 || i.getBoundingClientRect ? s = i.getBoundingClientRect() : i.nodeType === 3 && i.data.trim() && (s = tn(i));
    }
    s && on(t, s);
  }
  return t;
}
function on(e, t) {
  return (!e.top || t.top < e.top) && (e.top = t.top), (!e.bottom || t.bottom > e.bottom) && (e.bottom = t.bottom), (!e.left || t.left < e.left) && (e.left = t.left), (!e.right || t.right > e.right) && (e.right = t.right), e;
}
const At = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
};
function ce(e) {
  const t = e.subTree.el;
  return typeof window > "u" ? At : Qt(e) ? rn(e.subTree) : t?.nodeType === 1 ? t?.getBoundingClientRect() : e.subTree.component ? ce(e.subTree.component) : At;
}
function ht(e) {
  return Qt(e) ? nn(e.subTree) : e.subTree ? [e.subTree.el] : [];
}
function nn(e) {
  if (!e.children) return [];
  const t = [];
  return e.children.forEach((r) => {
    r.component ? t.push(...ht(r.component)) : r?.el && t.push(r.el);
  }), t;
}
const er = "__vue-devtools-component-inspector__", tr = "__vue-devtools-component-inspector__card__", rr = "__vue-devtools-component-inspector__name__", or = "__vue-devtools-component-inspector__indicator__", nr = {
  display: "block",
  zIndex: 2147483640,
  position: "fixed",
  backgroundColor: "#42b88325",
  border: "1px solid #42b88350",
  borderRadius: "5px",
  transition: "all 0.1s ease-in",
  pointerEvents: "none"
}, sn = {
  fontFamily: "Arial, Helvetica, sans-serif",
  padding: "5px 8px",
  borderRadius: "4px",
  textAlign: "left",
  position: "absolute",
  left: 0,
  color: "#e9e9e9",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "24px",
  backgroundColor: "#42b883",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
}, an = {
  display: "inline-block",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: "12px",
  opacity: 0.7
};
function ve() {
  return document.getElementById(er);
}
function cn() {
  return document.getElementById(tr);
}
function ln() {
  return document.getElementById(or);
}
function pn() {
  return document.getElementById(rr);
}
function mt(e) {
  return {
    left: `${Math.round(e.left * 100) / 100}px`,
    top: `${Math.round(e.top * 100) / 100}px`,
    width: `${Math.round(e.width * 100) / 100}px`,
    height: `${Math.round(e.height * 100) / 100}px`
  };
}
function gt(e) {
  const t = document.createElement("div");
  t.id = e.elementId ?? er, Object.assign(t.style, {
    ...nr,
    ...mt(e.bounds),
    ...e.style
  });
  const r = document.createElement("span");
  r.id = tr, Object.assign(r.style, {
    ...sn,
    top: e.bounds.top < 35 ? 0 : "-35px"
  });
  const o = document.createElement("span");
  o.id = rr, o.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`;
  const n = document.createElement("i");
  return n.id = or, n.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`, Object.assign(n.style, an), r.appendChild(o), r.appendChild(n), t.appendChild(r), document.body.appendChild(t), t;
}
function _t(e) {
  const t = ve(), r = cn(), o = pn(), n = ln();
  t && (Object.assign(t.style, {
    ...nr,
    ...mt(e.bounds)
  }), Object.assign(r.style, { top: e.bounds.top < 35 ? 0 : "-35px" }), o.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`, n.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`);
}
function un(e) {
  const t = ce(e);
  if (!t.width && !t.height) return;
  const r = Be(e);
  ve() ? _t({
    bounds: t,
    name: r
  }) : gt({
    bounds: t,
    name: r
  });
}
function sr() {
  const e = ve();
  e && (e.style.display = "none");
}
let nt = null;
function st(e) {
  const t = e.target;
  if (t) {
    const r = t.__vueParentComponent;
    if (r && (nt = r, r.vnode.el)) {
      const o = ce(r), n = Be(r);
      ve() ? _t({
        bounds: o,
        name: n
      }) : gt({
        bounds: o,
        name: n
      });
    }
  }
}
function dn(e, t) {
  e.preventDefault(), e.stopPropagation(), nt && t(Qo(nt));
}
let $e = null;
function fn() {
  sr(), window.removeEventListener("mouseover", st), window.removeEventListener("click", $e, !0), $e = null;
}
function hn() {
  return window.addEventListener("mouseover", st), new Promise((e) => {
    function t(r) {
      r.preventDefault(), r.stopPropagation(), dn(r, (o) => {
        window.removeEventListener("click", t, !0), $e = null, window.removeEventListener("mouseover", st);
        const n = ve();
        n && (n.style.display = "none"), e(JSON.stringify({ id: o }));
      });
    }
    $e = t, window.addEventListener("click", t, !0);
  });
}
function mn(e) {
  const t = ot(M.value, e.id);
  if (t) {
    const [r] = ht(t);
    if (typeof r.scrollIntoView == "function") r.scrollIntoView({ behavior: "smooth" });
    else {
      const o = ce(t), n = document.createElement("div"), s = {
        ...mt(o),
        position: "absolute"
      };
      Object.assign(n.style, s), document.body.appendChild(n), n.scrollIntoView({ behavior: "smooth" }), setTimeout(() => {
        document.body.removeChild(n);
      }, 2e3);
    }
    setTimeout(() => {
      const o = ce(t);
      if (o.width || o.height) {
        const n = Be(t), s = ve();
        s ? _t({
          ...e,
          name: n,
          bounds: o
        }) : gt({
          ...e,
          name: n,
          bounds: o
        }), setTimeout(() => {
          s && (s.style.display = "none");
        }, 1500);
      }
    }, 1200);
  }
}
f.__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ ??= !0;
function gn(e) {
  let t = 0;
  const r = setInterval(() => {
    f.__VUE_INSPECTOR__ && (clearInterval(r), t += 30, e()), t >= 5e3 && clearInterval(r);
  }, 30);
}
function _n() {
  const e = f.__VUE_INSPECTOR__, t = e.openInEditor;
  e.openInEditor = async (...r) => {
    e.disable(), t(...r);
  };
}
function vn() {
  return new Promise((e) => {
    function t() {
      _n(), e(f.__VUE_INSPECTOR__);
    }
    f.__VUE_INSPECTOR__ ? t() : gn(() => {
      t();
    });
  });
}
let ze = /* @__PURE__ */ (function(e) {
  return e.SKIP = "__v_skip", e.IS_REACTIVE = "__v_isReactive", e.IS_READONLY = "__v_isReadonly", e.IS_SHALLOW = "__v_isShallow", e.RAW = "__v_raw", e;
})({});
function yn(e) {
  return !!(e && e[ze.IS_READONLY]);
}
function ir(e) {
  return yn(e) ? ir(e[ze.RAW]) : !!(e && e[ze.IS_REACTIVE]);
}
function Xe(e) {
  return !!(e && e.__v_isRef === !0);
}
function be(e) {
  const t = e && e[ze.RAW];
  return t ? be(t) : e;
}
var En = class {
  constructor() {
    this.refEditor = new bn();
  }
  set(e, t, r, o) {
    const n = Array.isArray(t) ? t : t.split(".");
    for (; n.length > 1; ) {
      const a = n.shift();
      e instanceof Map ? e = e.get(a) : e instanceof Set ? e = Array.from(e.values())[a] : e = e[a], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
    }
    const s = n[0], i = this.refEditor.get(e)[s];
    o ? o(e, s, r) : this.refEditor.isRef(i) ? this.refEditor.set(i, r) : e[s] = r;
  }
  get(e, t) {
    const r = Array.isArray(t) ? t : t.split(".");
    for (let o = 0; o < r.length; o++)
      if (e instanceof Map ? e = e.get(r[o]) : e = e[r[o]], this.refEditor.isRef(e) && (e = this.refEditor.get(e)), !e) return;
    return e;
  }
  has(e, t, r = !1) {
    if (typeof e > "u") return !1;
    const o = Array.isArray(t) ? t.slice() : t.split("."), n = r ? 2 : 1;
    for (; e && o.length > n; ) {
      const s = o.shift();
      e = e[s], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
    }
    return e != null && Object.prototype.hasOwnProperty.call(e, o[0]);
  }
  createDefaultSetCallback(e) {
    return (t, r, o) => {
      if ((e.remove || e.newKey) && (Array.isArray(t) ? t.splice(r, 1) : be(t) instanceof Map ? t.delete(r) : be(t) instanceof Set ? t.delete(Array.from(t.values())[r]) : Reflect.deleteProperty(t, r)), !e.remove) {
        const n = t[e.newKey || r];
        this.refEditor.isRef(n) ? this.refEditor.set(n, o) : be(t) instanceof Map ? t.set(e.newKey || r, o) : be(t) instanceof Set ? t.add(o) : t[e.newKey || r] = o;
      }
    };
  }
}, bn = class {
  set(e, t) {
    if (Xe(e)) e.value = t;
    else {
      if (e instanceof Set && Array.isArray(t)) {
        e.clear(), t.forEach((n) => e.add(n));
        return;
      }
      const r = Object.keys(t);
      if (e instanceof Map) {
        const n = new Set(e.keys());
        r.forEach((s) => {
          e.set(s, Reflect.get(t, s)), n.delete(s);
        }), n.forEach((s) => e.delete(s));
        return;
      }
      const o = new Set(Object.keys(e));
      r.forEach((n) => {
        Reflect.set(e, n, Reflect.get(t, n)), o.delete(n);
      }), o.forEach((n) => Reflect.deleteProperty(e, n));
    }
  }
  get(e) {
    return Xe(e) ? e.value : e;
  }
  isRef(e) {
    return Xe(e) || ir(e);
  }
};
const wn = "__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS_STATE__";
function Tn() {
  if (typeof window > "u" || !Yt || typeof localStorage > "u" || localStorage === null) return {
    recordingState: !1,
    mouseEventEnabled: !1,
    keyboardEventEnabled: !1,
    componentEventEnabled: !1,
    performanceEventEnabled: !1,
    selected: ""
  };
  const e = typeof localStorage.getItem < "u" ? localStorage.getItem(wn) : null;
  return e ? JSON.parse(e) : {
    recordingState: !1,
    mouseEventEnabled: !1,
    keyboardEventEnabled: !1,
    componentEventEnabled: !1,
    performanceEventEnabled: !1,
    selected: ""
  };
}
f.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS ??= [];
const Sn = new Proxy(f.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS, { get(e, t, r) {
  return Reflect.get(e, t, r);
} });
function On(e, t) {
  N.timelineLayersState[t.id] = !1, Sn.push({
    ...e,
    descriptorId: t.id,
    appRecord: ft(t.app)
  });
}
f.__VUE_DEVTOOLS_KIT_INSPECTOR__ ??= [];
const vt = new Proxy(f.__VUE_DEVTOOLS_KIT_INSPECTOR__, { get(e, t, r) {
  return Reflect.get(e, t, r);
} }), ar = ge(() => {
  ye.hooks.callHook(ae.SEND_INSPECTOR_TO_CLIENT, cr());
});
function In(e, t) {
  vt.push({
    options: e,
    descriptor: t,
    treeFilterPlaceholder: e.treeFilterPlaceholder ?? "Search tree...",
    stateFilterPlaceholder: e.stateFilterPlaceholder ?? "Search state...",
    treeFilter: "",
    selectedNodeId: "",
    appRecord: ft(t.app)
  }), ar();
}
function cr() {
  return vt.filter((e) => e.descriptor.app === M.value.app).filter((e) => e.descriptor.id !== "components").map((e) => {
    const t = e.descriptor, r = e.options;
    return {
      id: r.id,
      label: r.label,
      logo: t.logo,
      icon: `custom-ic-baseline-${r?.icon?.replace(/_/g, "-")}`,
      packageName: t.packageName,
      homepage: t.homepage,
      pluginId: t.id
    };
  });
}
function Ae(e, t) {
  return vt.find((r) => r.options.id === e && (t ? r.descriptor.app === t : !0));
}
let V = /* @__PURE__ */ (function(e) {
  return e.VISIT_COMPONENT_TREE = "visitComponentTree", e.INSPECT_COMPONENT = "inspectComponent", e.EDIT_COMPONENT_STATE = "editComponentState", e.GET_INSPECTOR_TREE = "getInspectorTree", e.GET_INSPECTOR_STATE = "getInspectorState", e.EDIT_INSPECTOR_STATE = "editInspectorState", e.INSPECT_TIMELINE_EVENT = "inspectTimelineEvent", e.TIMELINE_CLEARED = "timelineCleared", e.SET_PLUGIN_SETTINGS = "setPluginSettings", e;
})({}), x = /* @__PURE__ */ (function(e) {
  return e.ADD_INSPECTOR = "addInspector", e.SEND_INSPECTOR_TREE = "sendInspectorTree", e.SEND_INSPECTOR_STATE = "sendInspectorState", e.CUSTOM_INSPECTOR_SELECT_NODE = "customInspectorSelectNode", e.TIMELINE_LAYER_ADDED = "timelineLayerAdded", e.TIMELINE_EVENT_ADDED = "timelineEventAdded", e.GET_COMPONENT_INSTANCES = "getComponentInstances", e.GET_COMPONENT_BOUNDS = "getComponentBounds", e.GET_COMPONENT_NAME = "getComponentName", e.COMPONENT_HIGHLIGHT = "componentHighlight", e.COMPONENT_UNHIGHLIGHT = "componentUnhighlight", e;
})({}), ae = /* @__PURE__ */ (function(e) {
  return e.SEND_INSPECTOR_TREE_TO_CLIENT = "sendInspectorTreeToClient", e.SEND_INSPECTOR_STATE_TO_CLIENT = "sendInspectorStateToClient", e.SEND_TIMELINE_EVENT_TO_CLIENT = "sendTimelineEventToClient", e.SEND_INSPECTOR_TO_CLIENT = "sendInspectorToClient", e.SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT = "sendActiveAppUpdatedToClient", e.DEVTOOLS_STATE_UPDATED = "devtoolsStateUpdated", e.DEVTOOLS_CONNECTED_UPDATED = "devtoolsConnectedUpdated", e.ROUTER_INFO_UPDATED = "routerInfoUpdated", e;
})({});
function xn() {
  const e = Jt();
  e.hook(x.ADD_INSPECTOR, ({ inspector: o, plugin: n }) => {
    In(o, n.descriptor);
  });
  const t = ge(async ({ inspectorId: o, plugin: n }) => {
    if (!o || !n?.descriptor?.app || N.highPerfModeEnabled) return;
    const s = Ae(o, n.descriptor.app), i = {
      app: n.descriptor.app,
      inspectorId: o,
      filter: s?.treeFilter || "",
      rootNodes: []
    };
    await new Promise((a) => {
      e.callHookWith(async (c) => {
        await Promise.all(c.map((p) => p(i))), a();
      }, V.GET_INSPECTOR_TREE);
    }), e.callHookWith(async (a) => {
      await Promise.all(a.map((c) => c({
        inspectorId: o,
        rootNodes: i.rootNodes
      })));
    }, ae.SEND_INSPECTOR_TREE_TO_CLIENT);
  }, 120);
  e.hook(x.SEND_INSPECTOR_TREE, t);
  const r = ge(async ({ inspectorId: o, plugin: n }) => {
    if (!o || !n?.descriptor?.app || N.highPerfModeEnabled) return;
    const s = Ae(o, n.descriptor.app), i = {
      app: n.descriptor.app,
      inspectorId: o,
      nodeId: s?.selectedNodeId || "",
      state: null
    }, a = { currentTab: `custom-inspector:${o}` };
    i.nodeId && await new Promise((c) => {
      e.callHookWith(async (p) => {
        await Promise.all(p.map((v) => v(i, a))), c();
      }, V.GET_INSPECTOR_STATE);
    }), e.callHookWith(async (c) => {
      await Promise.all(c.map((p) => p({
        inspectorId: o,
        nodeId: i.nodeId,
        state: i.state
      })));
    }, ae.SEND_INSPECTOR_STATE_TO_CLIENT);
  }, 120);
  return e.hook(x.SEND_INSPECTOR_STATE, r), e.hook(x.CUSTOM_INSPECTOR_SELECT_NODE, ({ inspectorId: o, nodeId: n, plugin: s }) => {
    const i = Ae(o, s.descriptor.app);
    i && (i.selectedNodeId = n);
  }), e.hook(x.TIMELINE_LAYER_ADDED, ({ options: o, plugin: n }) => {
    On(o, n.descriptor);
  }), e.hook(x.TIMELINE_EVENT_ADDED, ({ options: o, plugin: n }) => {
    N.highPerfModeEnabled || !N.timelineLayersState?.[n.descriptor.id] && ![
      "performance",
      "component-event",
      "keyboard",
      "mouse"
    ].includes(o.layerId) || e.callHookWith(async (s) => {
      await Promise.all(s.map((i) => i(o)));
    }, ae.SEND_TIMELINE_EVENT_TO_CLIENT);
  }), e.hook(x.GET_COMPONENT_INSTANCES, async ({ app: o }) => {
    const n = o.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
    if (!n) return null;
    const s = n.id.toString();
    return [...n.instanceMap].filter(([i]) => i.split(":")[0] === s).map(([, i]) => i);
  }), e.hook(x.GET_COMPONENT_BOUNDS, async ({ instance: o }) => ce(o)), e.hook(x.GET_COMPONENT_NAME, ({ instance: o }) => Be(o)), e.hook(x.COMPONENT_HIGHLIGHT, ({ uid: o }) => {
    const n = M.value.instanceMap.get(o);
    n && un(n);
  }), e.hook(x.COMPONENT_UNHIGHLIGHT, () => {
    sr();
  }), e;
}
f.__VUE_DEVTOOLS_KIT_APP_RECORDS__ ??= [];
f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ ??= {};
f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ ??= "";
f.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ ??= [];
f.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ ??= [];
const we = "__VUE_DEVTOOLS_KIT_GLOBAL_STATE__";
function kn() {
  return {
    connected: !1,
    clientConnected: !1,
    vitePluginDetected: !0,
    appRecords: [],
    activeAppRecordId: "",
    tabs: [],
    commands: [],
    highPerfModeEnabled: !0,
    devtoolsClientDetected: {},
    perfUniqueGroupId: 0,
    timelineLayersState: Tn()
  };
}
f[we] ??= kn();
const Cn = ge((e) => {
  ye.hooks.callHook(ae.DEVTOOLS_STATE_UPDATED, { state: e });
});
ge((e, t) => {
  ye.hooks.callHook(ae.DEVTOOLS_CONNECTED_UPDATED, {
    state: e,
    oldState: t
  });
});
const Fe = new Proxy(f.__VUE_DEVTOOLS_KIT_APP_RECORDS__, { get(e, t, r) {
  return t === "value" ? f.__VUE_DEVTOOLS_KIT_APP_RECORDS__ : f.__VUE_DEVTOOLS_KIT_APP_RECORDS__[t];
} }), M = new Proxy(f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__, { get(e, t, r) {
  return t === "value" ? f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ : t === "id" ? f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ : f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__[t];
} });
function lr() {
  Cn({
    ...f[we],
    appRecords: Fe.value,
    activeAppRecordId: M.id,
    tabs: f.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__,
    commands: f.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__
  });
}
function Nn(e) {
  f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = e, lr();
}
function Rn(e) {
  f.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = e, lr();
}
const N = new Proxy(f[we], {
  get(e, t) {
    return t === "appRecords" ? Fe : t === "activeAppRecordId" ? M.id : t === "tabs" ? f.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ : t === "commands" ? f.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ : f[we][t];
  },
  deleteProperty(e, t) {
    return delete e[t], !0;
  },
  set(e, t, r) {
    return e[t] = r, f[we][t] = r, !0;
  }
});
function Pn(e = {}) {
  const { file: t, host: r, baseUrl: o = window.location.origin, line: n = 0, column: s = 0 } = e;
  if (t) {
    if (r === "chrome-extension") {
      const i = t.replace(/\\/g, "\\\\"), a = window.VUE_DEVTOOLS_CONFIG?.openInEditorHost ?? "/";
      fetch(`${a}__open-in-editor?file=${encodeURI(t)}`).then((c) => {
        if (!c.ok) {
          const p = `Opening component ${i} failed`;
          console.log(`%c${p}`, "color:red");
        }
      });
    } else if (N.vitePluginDetected) {
      const i = f.__VUE_DEVTOOLS_OPEN_IN_EDITOR_BASE_URL__ ?? o;
      f.__VUE_INSPECTOR__.openInEditor(i, t, n, s);
    }
  }
}
f.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ ??= [];
const yt = new Proxy(f.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__, { get(e, t, r) {
  return Reflect.get(e, t, r);
} });
function it(e) {
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = e[r].defaultValue;
  }), t;
}
function Et(e) {
  return `__VUE_DEVTOOLS_NEXT_PLUGIN_SETTINGS__${e}__`;
}
function An(e) {
  return (yt.find((t) => t[0].id === e && !!t[0]?.settings)?.[0] ?? null)?.settings ?? null;
}
function pr(e, t) {
  const r = Et(e);
  if (r) {
    const o = localStorage.getItem(r);
    if (o) return JSON.parse(o);
  }
  return it(e ? (yt.find((o) => o[0].id === e)?.[0] ?? null)?.settings ?? {} : t);
}
function Dn(e, t) {
  const r = Et(e);
  localStorage.getItem(r) || localStorage.setItem(r, JSON.stringify(it(t)));
}
function Vn(e, t, r) {
  const o = Et(e), n = localStorage.getItem(o), s = JSON.parse(n || "{}"), i = {
    ...s,
    [t]: r
  };
  localStorage.setItem(o, JSON.stringify(i)), ye.hooks.callHookWith((a) => {
    a.forEach((c) => c({
      pluginId: e,
      key: t,
      oldValue: s[t],
      newValue: r,
      settings: i
    }));
  }, V.SET_PLUGIN_SETTINGS);
}
let j = /* @__PURE__ */ (function(e) {
  return e.APP_INIT = "app:init", e.APP_UNMOUNT = "app:unmount", e.COMPONENT_UPDATED = "component:updated", e.COMPONENT_ADDED = "component:added", e.COMPONENT_REMOVED = "component:removed", e.COMPONENT_EMIT = "component:emit", e.PERFORMANCE_START = "perf:start", e.PERFORMANCE_END = "perf:end", e.ADD_ROUTE = "router:add-route", e.REMOVE_ROUTE = "router:remove-route", e.RENDER_TRACKED = "render:tracked", e.RENDER_TRIGGERED = "render:triggered", e.APP_CONNECTED = "app:connected", e.SETUP_DEVTOOLS_PLUGIN = "devtools-plugin:setup", e;
})({});
const H = f.__VUE_DEVTOOLS_HOOK ??= Jt(), Ln = {
  vueAppInit(e) {
    H.hook(j.APP_INIT, e);
  },
  vueAppUnmount(e) {
    H.hook(j.APP_UNMOUNT, e);
  },
  vueAppConnected(e) {
    H.hook(j.APP_CONNECTED, e);
  },
  componentAdded(e) {
    return H.hook(j.COMPONENT_ADDED, e);
  },
  componentEmit(e) {
    return H.hook(j.COMPONENT_EMIT, e);
  },
  componentUpdated(e) {
    return H.hook(j.COMPONENT_UPDATED, e);
  },
  componentRemoved(e) {
    return H.hook(j.COMPONENT_REMOVED, e);
  },
  setupDevtoolsPlugin(e) {
    H.hook(j.SETUP_DEVTOOLS_PLUGIN, e);
  },
  perfStart(e) {
    return H.hook(j.PERFORMANCE_START, e);
  },
  perfEnd(e) {
    return H.hook(j.PERFORMANCE_END, e);
  }
}, ur = {
  on: Ln,
  setupDevToolsPlugin(e, t) {
    return H.callHook(j.SETUP_DEVTOOLS_PLUGIN, e, t);
  }
};
var Un = class {
  constructor({ plugin: e, ctx: t }) {
    this.hooks = t.hooks, this.plugin = e;
  }
  get on() {
    return {
      visitComponentTree: (e) => {
        this.hooks.hook(V.VISIT_COMPONENT_TREE, e);
      },
      inspectComponent: (e) => {
        this.hooks.hook(V.INSPECT_COMPONENT, e);
      },
      editComponentState: (e) => {
        this.hooks.hook(V.EDIT_COMPONENT_STATE, e);
      },
      getInspectorTree: (e) => {
        this.hooks.hook(V.GET_INSPECTOR_TREE, e);
      },
      getInspectorState: (e) => {
        this.hooks.hook(V.GET_INSPECTOR_STATE, e);
      },
      editInspectorState: (e) => {
        this.hooks.hook(V.EDIT_INSPECTOR_STATE, e);
      },
      inspectTimelineEvent: (e) => {
        this.hooks.hook(V.INSPECT_TIMELINE_EVENT, e);
      },
      timelineCleared: (e) => {
        this.hooks.hook(V.TIMELINE_CLEARED, e);
      },
      setPluginSettings: (e) => {
        this.hooks.hook(V.SET_PLUGIN_SETTINGS, e);
      }
    };
  }
  notifyComponentUpdate(e) {
    if (N.highPerfModeEnabled) return;
    const t = cr().find((r) => r.packageName === this.plugin.descriptor.packageName);
    if (t?.id) {
      if (e) {
        const r = [
          e.appContext.app,
          e.uid,
          e.parent?.uid,
          e
        ];
        H.callHook(j.COMPONENT_UPDATED, ...r);
      } else H.callHook(j.COMPONENT_UPDATED);
      this.hooks.callHook(x.SEND_INSPECTOR_STATE, {
        inspectorId: t.id,
        plugin: this.plugin
      });
    }
  }
  addInspector(e) {
    this.hooks.callHook(x.ADD_INSPECTOR, {
      inspector: e,
      plugin: this.plugin
    }), this.plugin.descriptor.settings && Dn(e.id, this.plugin.descriptor.settings);
  }
  sendInspectorTree(e) {
    N.highPerfModeEnabled || this.hooks.callHook(x.SEND_INSPECTOR_TREE, {
      inspectorId: e,
      plugin: this.plugin
    });
  }
  sendInspectorState(e) {
    N.highPerfModeEnabled || this.hooks.callHook(x.SEND_INSPECTOR_STATE, {
      inspectorId: e,
      plugin: this.plugin
    });
  }
  selectInspectorNode(e, t) {
    this.hooks.callHook(x.CUSTOM_INSPECTOR_SELECT_NODE, {
      inspectorId: e,
      nodeId: t,
      plugin: this.plugin
    });
  }
  visitComponentTree(e) {
    return this.hooks.callHook(V.VISIT_COMPONENT_TREE, e);
  }
  now() {
    return N.highPerfModeEnabled ? 0 : Date.now();
  }
  addTimelineLayer(e) {
    this.hooks.callHook(x.TIMELINE_LAYER_ADDED, {
      options: e,
      plugin: this.plugin
    });
  }
  addTimelineEvent(e) {
    N.highPerfModeEnabled || this.hooks.callHook(x.TIMELINE_EVENT_ADDED, {
      options: e,
      plugin: this.plugin
    });
  }
  getSettings(e) {
    return pr(e ?? this.plugin.descriptor.id, this.plugin.descriptor.settings);
  }
  getComponentInstances(e) {
    return this.hooks.callHook(x.GET_COMPONENT_INSTANCES, { app: e });
  }
  getComponentBounds(e) {
    return this.hooks.callHook(x.GET_COMPONENT_BOUNDS, { instance: e });
  }
  getComponentName(e) {
    return this.hooks.callHook(x.GET_COMPONENT_NAME, { instance: e });
  }
  highlightElement(e) {
    const t = e.__VUE_DEVTOOLS_NEXT_UID__;
    return this.hooks.callHook(x.COMPONENT_HIGHLIGHT, { uid: t });
  }
  unhighlightElement() {
    return this.hooks.callHook(x.COMPONENT_UNHIGHLIGHT);
  }
};
const Mn = Un, $n = "__vue_devtool_undefined__", zn = "__vue_devtool_infinity__", jn = "__vue_devtool_negative_infinity__", Hn = "__vue_devtool_nan__", Gn = {
  [$n]: "undefined",
  [Hn]: "NaN",
  [zn]: "Infinity",
  [jn]: "-Infinity"
};
Object.entries(Gn).reduce((e, [t, r]) => (e[r] = t, e), {});
f.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ ??= /* @__PURE__ */ new Set();
function dr(e, t) {
  return ur.setupDevToolsPlugin(e, t);
}
function Bn(e, t) {
  const [r, o] = e;
  if (r.app !== t) return;
  const n = new Mn({
    plugin: {
      setupFn: o,
      descriptor: r
    },
    ctx: ye
  });
  r.packageName === "vuex" && n.on.editInspectorState((s) => {
    n.sendInspectorState(s.inspectorId);
  }), o(n);
}
function fr(e, t) {
  f.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.has(e) || N.highPerfModeEnabled && !t?.inspectingComponent || (f.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.add(e), yt.forEach((r) => {
    Bn(r, e);
  }));
}
const je = "__VUE_DEVTOOLS_ROUTER__", Oe = "__VUE_DEVTOOLS_ROUTER_INFO__";
f[Oe] ??= {
  currentRoute: null,
  routes: []
};
f[je] ??= {};
new Proxy(f[Oe], { get(e, t) {
  return f[Oe][t];
} });
new Proxy(f[je], { get(e, t) {
  if (t === "value") return f[je];
} });
function Fn(e) {
  const t = /* @__PURE__ */ new Map();
  return (e?.getRoutes() || []).filter((r) => !t.has(r.path) && t.set(r.path, 1));
}
function bt(e) {
  return e.map((t) => {
    let { path: r, name: o, children: n, meta: s } = t;
    return n?.length && (n = bt(n)), {
      path: r,
      name: o,
      children: n,
      meta: s
    };
  });
}
function Kn(e) {
  if (e) {
    const { fullPath: t, hash: r, href: o, path: n, name: s, matched: i, params: a, query: c } = e;
    return {
      fullPath: t,
      hash: r,
      href: o,
      path: n,
      name: s,
      params: a,
      query: c,
      matched: bt(i)
    };
  }
  return e;
}
function Wn(e, t) {
  function r() {
    const o = e.app?.config.globalProperties.$router, n = Kn(o?.currentRoute.value), s = bt(Fn(o)), i = console.warn;
    console.warn = () => {
    }, f[Oe] = {
      currentRoute: n ? Rt(n) : {},
      routes: Rt(s)
    }, f[je] = o, console.warn = i;
  }
  r(), ur.on.componentUpdated(ge(() => {
    t.value?.app === e.app && (r(), !N.highPerfModeEnabled && ye.hooks.callHook(ae.ROUTER_INFO_UPDATED, { state: f[Oe] }));
  }, 200));
}
function Yn(e) {
  return {
    async getInspectorTree(t) {
      const r = {
        ...t,
        app: M.value.app,
        rootNodes: []
      };
      return await new Promise((o) => {
        e.callHookWith(async (n) => {
          await Promise.all(n.map((s) => s(r))), o();
        }, V.GET_INSPECTOR_TREE);
      }), r.rootNodes;
    },
    async getInspectorState(t) {
      const r = {
        ...t,
        app: M.value.app,
        state: null
      }, o = { currentTab: `custom-inspector:${t.inspectorId}` };
      return await new Promise((n) => {
        e.callHookWith(async (s) => {
          await Promise.all(s.map((i) => i(r, o))), n();
        }, V.GET_INSPECTOR_STATE);
      }), r.state;
    },
    editInspectorState(t) {
      const r = new En(), o = {
        ...t,
        app: M.value.app,
        set: (n, s = t.path, i = t.state.value, a) => {
          r.set(n, s, i, a || r.createDefaultSetCallback(t.state));
        }
      };
      e.callHookWith((n) => {
        n.forEach((s) => s(o));
      }, V.EDIT_INSPECTOR_STATE);
    },
    sendInspectorState(t) {
      const r = Ae(t);
      e.callHook(x.SEND_INSPECTOR_STATE, {
        inspectorId: t,
        plugin: {
          descriptor: r.descriptor,
          setupFn: () => ({})
        }
      });
    },
    inspectComponentInspector() {
      return hn();
    },
    cancelInspectComponentInspector() {
      return fn();
    },
    getComponentRenderCode(t) {
      const r = ot(M.value, t);
      if (r) return typeof r?.type != "function" ? r.render.toString() : r.type.toString();
    },
    scrollToComponent(t) {
      return mn({ id: t });
    },
    openInEditor: Pn,
    getVueInspector: vn,
    toggleApp(t, r) {
      const o = Fe.value.find((n) => n.id === t);
      o && (Rn(t), Nn(o), Wn(o, M), ar(), fr(o.app, r));
    },
    inspectDOM(t) {
      const r = ot(M.value, t);
      if (r) {
        const [o] = ht(r);
        o && (f.__VUE_DEVTOOLS_INSPECT_DOM_TARGET__ = o);
      }
    },
    updatePluginSettings(t, r, o) {
      Vn(t, r, o);
    },
    getPluginSettings(t) {
      return {
        options: An(t),
        values: pr(t)
      };
    }
  };
}
f.__VUE_DEVTOOLS_ENV__ ??= { vitePluginDetected: !1 };
const Dt = xn();
f.__VUE_DEVTOOLS_KIT_CONTEXT__ ??= {
  hooks: Dt,
  get state() {
    return {
      ...N,
      activeAppRecordId: M.id,
      activeAppRecord: M.value,
      appRecords: Fe.value
    };
  },
  api: Yn(Dt)
};
const ye = f.__VUE_DEVTOOLS_KIT_CONTEXT__;
var qn = /* @__PURE__ */ Xt(((e, t) => {
  (function(r) {
    var o = {
      À: "A",
      Á: "A",
      Â: "A",
      Ã: "A",
      Ä: "Ae",
      Å: "A",
      Æ: "AE",
      Ç: "C",
      È: "E",
      É: "E",
      Ê: "E",
      Ë: "E",
      Ì: "I",
      Í: "I",
      Î: "I",
      Ï: "I",
      Ð: "D",
      Ñ: "N",
      Ò: "O",
      Ó: "O",
      Ô: "O",
      Õ: "O",
      Ö: "Oe",
      Ő: "O",
      Ø: "O",
      Ù: "U",
      Ú: "U",
      Û: "U",
      Ü: "Ue",
      Ű: "U",
      Ý: "Y",
      Þ: "TH",
      ß: "ss",
      à: "a",
      á: "a",
      â: "a",
      ã: "a",
      ä: "ae",
      å: "a",
      æ: "ae",
      ç: "c",
      è: "e",
      é: "e",
      ê: "e",
      ë: "e",
      ì: "i",
      í: "i",
      î: "i",
      ï: "i",
      ð: "d",
      ñ: "n",
      ò: "o",
      ó: "o",
      ô: "o",
      õ: "o",
      ö: "oe",
      ő: "o",
      ø: "o",
      ù: "u",
      ú: "u",
      û: "u",
      ü: "ue",
      ű: "u",
      ý: "y",
      þ: "th",
      ÿ: "y",
      "ẞ": "SS",
      ا: "a",
      أ: "a",
      إ: "i",
      آ: "aa",
      ؤ: "u",
      ئ: "e",
      ء: "a",
      ب: "b",
      ت: "t",
      ث: "th",
      ج: "j",
      ح: "h",
      خ: "kh",
      د: "d",
      ذ: "th",
      ر: "r",
      ز: "z",
      س: "s",
      ش: "sh",
      ص: "s",
      ض: "dh",
      ط: "t",
      ظ: "z",
      ع: "a",
      غ: "gh",
      ف: "f",
      ق: "q",
      ك: "k",
      ل: "l",
      م: "m",
      ن: "n",
      ه: "h",
      و: "w",
      ي: "y",
      ى: "a",
      ة: "h",
      ﻻ: "la",
      ﻷ: "laa",
      ﻹ: "lai",
      ﻵ: "laa",
      گ: "g",
      چ: "ch",
      پ: "p",
      ژ: "zh",
      ک: "k",
      ی: "y",
      "َ": "a",
      "ً": "an",
      "ِ": "e",
      "ٍ": "en",
      "ُ": "u",
      "ٌ": "on",
      "ْ": "",
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
      က: "k",
      ခ: "kh",
      ဂ: "g",
      ဃ: "ga",
      င: "ng",
      စ: "s",
      ဆ: "sa",
      ဇ: "z",
      "စျ": "za",
      ည: "ny",
      ဋ: "t",
      ဌ: "ta",
      ဍ: "d",
      ဎ: "da",
      ဏ: "na",
      တ: "t",
      ထ: "ta",
      ဒ: "d",
      ဓ: "da",
      န: "n",
      ပ: "p",
      ဖ: "pa",
      ဗ: "b",
      ဘ: "ba",
      မ: "m",
      ယ: "y",
      ရ: "ya",
      လ: "l",
      ဝ: "w",
      သ: "th",
      ဟ: "h",
      ဠ: "la",
      အ: "a",
      "ြ": "y",
      "ျ": "ya",
      "ွ": "w",
      "ြွ": "yw",
      "ျွ": "ywa",
      "ှ": "h",
      ဧ: "e",
      "၏": "-e",
      ဣ: "i",
      ဤ: "-i",
      ဉ: "u",
      ဦ: "-u",
      ဩ: "aw",
      "သြော": "aw",
      ဪ: "aw",
      "၀": "0",
      "၁": "1",
      "၂": "2",
      "၃": "3",
      "၄": "4",
      "၅": "5",
      "၆": "6",
      "၇": "7",
      "၈": "8",
      "၉": "9",
      "္": "",
      "့": "",
      "း": "",
      č: "c",
      ď: "d",
      ě: "e",
      ň: "n",
      ř: "r",
      š: "s",
      ť: "t",
      ů: "u",
      ž: "z",
      Č: "C",
      Ď: "D",
      Ě: "E",
      Ň: "N",
      Ř: "R",
      Š: "S",
      Ť: "T",
      Ů: "U",
      Ž: "Z",
      ހ: "h",
      ށ: "sh",
      ނ: "n",
      ރ: "r",
      ބ: "b",
      ޅ: "lh",
      ކ: "k",
      އ: "a",
      ވ: "v",
      މ: "m",
      ފ: "f",
      ދ: "dh",
      ތ: "th",
      ލ: "l",
      ގ: "g",
      ޏ: "gn",
      ސ: "s",
      ޑ: "d",
      ޒ: "z",
      ޓ: "t",
      ޔ: "y",
      ޕ: "p",
      ޖ: "j",
      ޗ: "ch",
      ޘ: "tt",
      ޙ: "hh",
      ޚ: "kh",
      ޛ: "th",
      ޜ: "z",
      ޝ: "sh",
      ޞ: "s",
      ޟ: "d",
      ޠ: "t",
      ޡ: "z",
      ޢ: "a",
      ޣ: "gh",
      ޤ: "q",
      ޥ: "w",
      "ަ": "a",
      "ާ": "aa",
      "ި": "i",
      "ީ": "ee",
      "ު": "u",
      "ޫ": "oo",
      "ެ": "e",
      "ޭ": "ey",
      "ޮ": "o",
      "ޯ": "oa",
      "ް": "",
      ა: "a",
      ბ: "b",
      გ: "g",
      დ: "d",
      ე: "e",
      ვ: "v",
      ზ: "z",
      თ: "t",
      ი: "i",
      კ: "k",
      ლ: "l",
      მ: "m",
      ნ: "n",
      ო: "o",
      პ: "p",
      ჟ: "zh",
      რ: "r",
      ს: "s",
      ტ: "t",
      უ: "u",
      ფ: "p",
      ქ: "k",
      ღ: "gh",
      ყ: "q",
      შ: "sh",
      ჩ: "ch",
      ც: "ts",
      ძ: "dz",
      წ: "ts",
      ჭ: "ch",
      ხ: "kh",
      ჯ: "j",
      ჰ: "h",
      α: "a",
      β: "v",
      γ: "g",
      δ: "d",
      ε: "e",
      ζ: "z",
      η: "i",
      θ: "th",
      ι: "i",
      κ: "k",
      λ: "l",
      μ: "m",
      ν: "n",
      ξ: "ks",
      ο: "o",
      π: "p",
      ρ: "r",
      σ: "s",
      τ: "t",
      υ: "y",
      φ: "f",
      χ: "x",
      ψ: "ps",
      ω: "o",
      ά: "a",
      έ: "e",
      ί: "i",
      ό: "o",
      ύ: "y",
      ή: "i",
      ώ: "o",
      ς: "s",
      ϊ: "i",
      ΰ: "y",
      ϋ: "y",
      ΐ: "i",
      Α: "A",
      Β: "B",
      Γ: "G",
      Δ: "D",
      Ε: "E",
      Ζ: "Z",
      Η: "I",
      Θ: "TH",
      Ι: "I",
      Κ: "K",
      Λ: "L",
      Μ: "M",
      Ν: "N",
      Ξ: "KS",
      Ο: "O",
      Π: "P",
      Ρ: "R",
      Σ: "S",
      Τ: "T",
      Υ: "Y",
      Φ: "F",
      Χ: "X",
      Ψ: "PS",
      Ω: "O",
      Ά: "A",
      Έ: "E",
      Ί: "I",
      Ό: "O",
      Ύ: "Y",
      Ή: "I",
      Ώ: "O",
      Ϊ: "I",
      Ϋ: "Y",
      ā: "a",
      ē: "e",
      ģ: "g",
      ī: "i",
      ķ: "k",
      ļ: "l",
      ņ: "n",
      ū: "u",
      Ā: "A",
      Ē: "E",
      Ģ: "G",
      Ī: "I",
      Ķ: "k",
      Ļ: "L",
      Ņ: "N",
      Ū: "U",
      Ќ: "Kj",
      ќ: "kj",
      Љ: "Lj",
      љ: "lj",
      Њ: "Nj",
      њ: "nj",
      Тс: "Ts",
      тс: "ts",
      ą: "a",
      ć: "c",
      ę: "e",
      ł: "l",
      ń: "n",
      ś: "s",
      ź: "z",
      ż: "z",
      Ą: "A",
      Ć: "C",
      Ę: "E",
      Ł: "L",
      Ń: "N",
      Ś: "S",
      Ź: "Z",
      Ż: "Z",
      Є: "Ye",
      І: "I",
      Ї: "Yi",
      Ґ: "G",
      є: "ye",
      і: "i",
      ї: "yi",
      ґ: "g",
      ă: "a",
      Ă: "A",
      ș: "s",
      Ș: "S",
      ț: "t",
      Ț: "T",
      ţ: "t",
      Ţ: "T",
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "i",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "c",
      ч: "ch",
      ш: "sh",
      щ: "sh",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
      А: "A",
      Б: "B",
      В: "V",
      Г: "G",
      Д: "D",
      Е: "E",
      Ё: "Yo",
      Ж: "Zh",
      З: "Z",
      И: "I",
      Й: "I",
      К: "K",
      Л: "L",
      М: "M",
      Н: "N",
      О: "O",
      П: "P",
      Р: "R",
      С: "S",
      Т: "T",
      У: "U",
      Ф: "F",
      Х: "Kh",
      Ц: "C",
      Ч: "Ch",
      Ш: "Sh",
      Щ: "Sh",
      Ъ: "",
      Ы: "Y",
      Ь: "",
      Э: "E",
      Ю: "Yu",
      Я: "Ya",
      ђ: "dj",
      ј: "j",
      ћ: "c",
      џ: "dz",
      Ђ: "Dj",
      Ј: "j",
      Ћ: "C",
      Џ: "Dz",
      ľ: "l",
      ĺ: "l",
      ŕ: "r",
      Ľ: "L",
      Ĺ: "L",
      Ŕ: "R",
      ş: "s",
      Ş: "S",
      ı: "i",
      İ: "I",
      ğ: "g",
      Ğ: "G",
      ả: "a",
      Ả: "A",
      ẳ: "a",
      Ẳ: "A",
      ẩ: "a",
      Ẩ: "A",
      đ: "d",
      Đ: "D",
      ẹ: "e",
      Ẹ: "E",
      ẽ: "e",
      Ẽ: "E",
      ẻ: "e",
      Ẻ: "E",
      ế: "e",
      Ế: "E",
      ề: "e",
      Ề: "E",
      ệ: "e",
      Ệ: "E",
      ễ: "e",
      Ễ: "E",
      ể: "e",
      Ể: "E",
      ỏ: "o",
      ọ: "o",
      Ọ: "o",
      ố: "o",
      Ố: "O",
      ồ: "o",
      Ồ: "O",
      ổ: "o",
      Ổ: "O",
      ộ: "o",
      Ộ: "O",
      ỗ: "o",
      Ỗ: "O",
      ơ: "o",
      Ơ: "O",
      ớ: "o",
      Ớ: "O",
      ờ: "o",
      Ờ: "O",
      ợ: "o",
      Ợ: "O",
      ỡ: "o",
      Ỡ: "O",
      Ở: "o",
      ở: "o",
      ị: "i",
      Ị: "I",
      ĩ: "i",
      Ĩ: "I",
      ỉ: "i",
      Ỉ: "i",
      ủ: "u",
      Ủ: "U",
      ụ: "u",
      Ụ: "U",
      ũ: "u",
      Ũ: "U",
      ư: "u",
      Ư: "U",
      ứ: "u",
      Ứ: "U",
      ừ: "u",
      Ừ: "U",
      ự: "u",
      Ự: "U",
      ữ: "u",
      Ữ: "U",
      ử: "u",
      Ử: "ư",
      ỷ: "y",
      Ỷ: "y",
      ỳ: "y",
      Ỳ: "Y",
      ỵ: "y",
      Ỵ: "Y",
      ỹ: "y",
      Ỹ: "Y",
      ạ: "a",
      Ạ: "A",
      ấ: "a",
      Ấ: "A",
      ầ: "a",
      Ầ: "A",
      ậ: "a",
      Ậ: "A",
      ẫ: "a",
      Ẫ: "A",
      ắ: "a",
      Ắ: "A",
      ằ: "a",
      Ằ: "A",
      ặ: "a",
      Ặ: "A",
      ẵ: "a",
      Ẵ: "A",
      "⓪": "0",
      "①": "1",
      "②": "2",
      "③": "3",
      "④": "4",
      "⑤": "5",
      "⑥": "6",
      "⑦": "7",
      "⑧": "8",
      "⑨": "9",
      "⑩": "10",
      "⑪": "11",
      "⑫": "12",
      "⑬": "13",
      "⑭": "14",
      "⑮": "15",
      "⑯": "16",
      "⑰": "17",
      "⑱": "18",
      "⑲": "18",
      "⑳": "18",
      "⓵": "1",
      "⓶": "2",
      "⓷": "3",
      "⓸": "4",
      "⓹": "5",
      "⓺": "6",
      "⓻": "7",
      "⓼": "8",
      "⓽": "9",
      "⓾": "10",
      "⓿": "0",
      "⓫": "11",
      "⓬": "12",
      "⓭": "13",
      "⓮": "14",
      "⓯": "15",
      "⓰": "16",
      "⓱": "17",
      "⓲": "18",
      "⓳": "19",
      "⓴": "20",
      "Ⓐ": "A",
      "Ⓑ": "B",
      "Ⓒ": "C",
      "Ⓓ": "D",
      "Ⓔ": "E",
      "Ⓕ": "F",
      "Ⓖ": "G",
      "Ⓗ": "H",
      "Ⓘ": "I",
      "Ⓙ": "J",
      "Ⓚ": "K",
      "Ⓛ": "L",
      "Ⓜ": "M",
      "Ⓝ": "N",
      "Ⓞ": "O",
      "Ⓟ": "P",
      "Ⓠ": "Q",
      "Ⓡ": "R",
      "Ⓢ": "S",
      "Ⓣ": "T",
      "Ⓤ": "U",
      "Ⓥ": "V",
      "Ⓦ": "W",
      "Ⓧ": "X",
      "Ⓨ": "Y",
      "Ⓩ": "Z",
      "ⓐ": "a",
      "ⓑ": "b",
      "ⓒ": "c",
      "ⓓ": "d",
      "ⓔ": "e",
      "ⓕ": "f",
      "ⓖ": "g",
      "ⓗ": "h",
      "ⓘ": "i",
      "ⓙ": "j",
      "ⓚ": "k",
      "ⓛ": "l",
      "ⓜ": "m",
      "ⓝ": "n",
      "ⓞ": "o",
      "ⓟ": "p",
      "ⓠ": "q",
      "ⓡ": "r",
      "ⓢ": "s",
      "ⓣ": "t",
      "ⓤ": "u",
      "ⓦ": "v",
      "ⓥ": "w",
      "ⓧ": "x",
      "ⓨ": "y",
      "ⓩ": "z",
      "“": '"',
      "”": '"',
      "‘": "'",
      "’": "'",
      "∂": "d",
      ƒ: "f",
      "™": "(TM)",
      "©": "(C)",
      œ: "oe",
      Œ: "OE",
      "®": "(R)",
      "†": "+",
      "℠": "(SM)",
      "…": "...",
      "˚": "o",
      º: "o",
      ª: "a",
      "•": "*",
      "၊": ",",
      "။": ".",
      $: "USD",
      "€": "EUR",
      "₢": "BRN",
      "₣": "FRF",
      "£": "GBP",
      "₤": "ITL",
      "₦": "NGN",
      "₧": "ESP",
      "₩": "KRW",
      "₪": "ILS",
      "₫": "VND",
      "₭": "LAK",
      "₮": "MNT",
      "₯": "GRD",
      "₱": "ARS",
      "₲": "PYG",
      "₳": "ARA",
      "₴": "UAH",
      "₵": "GHS",
      "¢": "cent",
      "¥": "CNY",
      元: "CNY",
      円: "YEN",
      "﷼": "IRR",
      "₠": "EWE",
      "฿": "THB",
      "₨": "INR",
      "₹": "INR",
      "₰": "PF",
      "₺": "TRY",
      "؋": "AFN",
      "₼": "AZN",
      лв: "BGN",
      "៛": "KHR",
      "₡": "CRC",
      "₸": "KZT",
      ден: "MKD",
      zł: "PLN",
      "₽": "RUB",
      "₾": "GEL"
    }, n = ["်", "ް"], s = {
      "ာ": "a",
      "ါ": "a",
      "ေ": "e",
      "ဲ": "e",
      "ိ": "i",
      "ီ": "i",
      "ို": "o",
      "ု": "u",
      "ူ": "u",
      "ေါင်": "aung",
      "ော": "aw",
      "ော်": "aw",
      "ေါ": "aw",
      "ေါ်": "aw",
      "်": "်",
      "က်": "et",
      "ိုက်": "aik",
      "ောက်": "auk",
      "င်": "in",
      "ိုင်": "aing",
      "ောင်": "aung",
      "စ်": "it",
      "ည်": "i",
      "တ်": "at",
      "ိတ်": "eik",
      "ုတ်": "ok",
      "ွတ်": "ut",
      "ေတ်": "it",
      "ဒ်": "d",
      "ိုဒ်": "ok",
      "ုဒ်": "ait",
      "န်": "an",
      "ာန်": "an",
      "ိန်": "ein",
      "ုန်": "on",
      "ွန်": "un",
      "ပ်": "at",
      "ိပ်": "eik",
      "ုပ်": "ok",
      "ွပ်": "ut",
      "န်ုပ်": "nub",
      "မ်": "an",
      "ိမ်": "ein",
      "ုမ်": "on",
      "ွမ်": "un",
      "ယ်": "e",
      "ိုလ်": "ol",
      "ဉ်": "in",
      "ံ": "an",
      "ိံ": "ein",
      "ုံ": "on",
      "ައް": "ah",
      "ަށް": "ah"
    }, i = {
      en: {},
      az: {
        ç: "c",
        ə: "e",
        ğ: "g",
        ı: "i",
        ö: "o",
        ş: "s",
        ü: "u",
        Ç: "C",
        Ə: "E",
        Ğ: "G",
        İ: "I",
        Ö: "O",
        Ş: "S",
        Ü: "U"
      },
      cs: {
        č: "c",
        ď: "d",
        ě: "e",
        ň: "n",
        ř: "r",
        š: "s",
        ť: "t",
        ů: "u",
        ž: "z",
        Č: "C",
        Ď: "D",
        Ě: "E",
        Ň: "N",
        Ř: "R",
        Š: "S",
        Ť: "T",
        Ů: "U",
        Ž: "Z"
      },
      fi: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O"
      },
      hu: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O",
        ü: "u",
        Ü: "U",
        ű: "u",
        Ű: "U"
      },
      lt: {
        ą: "a",
        č: "c",
        ę: "e",
        ė: "e",
        į: "i",
        š: "s",
        ų: "u",
        ū: "u",
        ž: "z",
        Ą: "A",
        Č: "C",
        Ę: "E",
        Ė: "E",
        Į: "I",
        Š: "S",
        Ų: "U",
        Ū: "U"
      },
      lv: {
        ā: "a",
        č: "c",
        ē: "e",
        ģ: "g",
        ī: "i",
        ķ: "k",
        ļ: "l",
        ņ: "n",
        š: "s",
        ū: "u",
        ž: "z",
        Ā: "A",
        Č: "C",
        Ē: "E",
        Ģ: "G",
        Ī: "i",
        Ķ: "k",
        Ļ: "L",
        Ņ: "N",
        Š: "S",
        Ū: "u",
        Ž: "Z"
      },
      pl: {
        ą: "a",
        ć: "c",
        ę: "e",
        ł: "l",
        ń: "n",
        ó: "o",
        ś: "s",
        ź: "z",
        ż: "z",
        Ą: "A",
        Ć: "C",
        Ę: "e",
        Ł: "L",
        Ń: "N",
        Ó: "O",
        Ś: "S",
        Ź: "Z",
        Ż: "Z"
      },
      sv: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O"
      },
      sk: {
        ä: "a",
        Ä: "A"
      },
      sr: {
        љ: "lj",
        њ: "nj",
        Љ: "Lj",
        Њ: "Nj",
        đ: "dj",
        Đ: "Dj"
      },
      tr: {
        Ü: "U",
        Ö: "O",
        ü: "u",
        ö: "o"
      }
    }, a = {
      ar: {
        "∆": "delta",
        "∞": "la-nihaya",
        "♥": "hob",
        "&": "wa",
        "|": "aw",
        "<": "aqal-men",
        ">": "akbar-men",
        "∑": "majmou",
        "¤": "omla"
      },
      az: {},
      ca: {
        "∆": "delta",
        "∞": "infinit",
        "♥": "amor",
        "&": "i",
        "|": "o",
        "<": "menys que",
        ">": "mes que",
        "∑": "suma dels",
        "¤": "moneda"
      },
      cs: {
        "∆": "delta",
        "∞": "nekonecno",
        "♥": "laska",
        "&": "a",
        "|": "nebo",
        "<": "mensi nez",
        ">": "vetsi nez",
        "∑": "soucet",
        "¤": "mena"
      },
      de: {
        "∆": "delta",
        "∞": "unendlich",
        "♥": "Liebe",
        "&": "und",
        "|": "oder",
        "<": "kleiner als",
        ">": "groesser als",
        "∑": "Summe von",
        "¤": "Waehrung"
      },
      dv: {
        "∆": "delta",
        "∞": "kolunulaa",
        "♥": "loabi",
        "&": "aai",
        "|": "noonee",
        "<": "ah vure kuda",
        ">": "ah vure bodu",
        "∑": "jumula",
        "¤": "faisaa"
      },
      en: {
        "∆": "delta",
        "∞": "infinity",
        "♥": "love",
        "&": "and",
        "|": "or",
        "<": "less than",
        ">": "greater than",
        "∑": "sum",
        "¤": "currency"
      },
      es: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amor",
        "&": "y",
        "|": "u",
        "<": "menos que",
        ">": "mas que",
        "∑": "suma de los",
        "¤": "moneda"
      },
      fa: {
        "∆": "delta",
        "∞": "bi-nahayat",
        "♥": "eshgh",
        "&": "va",
        "|": "ya",
        "<": "kamtar-az",
        ">": "bishtar-az",
        "∑": "majmooe",
        "¤": "vahed"
      },
      fi: {
        "∆": "delta",
        "∞": "aarettomyys",
        "♥": "rakkaus",
        "&": "ja",
        "|": "tai",
        "<": "pienempi kuin",
        ">": "suurempi kuin",
        "∑": "summa",
        "¤": "valuutta"
      },
      fr: {
        "∆": "delta",
        "∞": "infiniment",
        "♥": "Amour",
        "&": "et",
        "|": "ou",
        "<": "moins que",
        ">": "superieure a",
        "∑": "somme des",
        "¤": "monnaie"
      },
      ge: {
        "∆": "delta",
        "∞": "usasruloba",
        "♥": "siqvaruli",
        "&": "da",
        "|": "an",
        "<": "naklebi",
        ">": "meti",
        "∑": "jami",
        "¤": "valuta"
      },
      gr: {},
      hu: {
        "∆": "delta",
        "∞": "vegtelen",
        "♥": "szerelem",
        "&": "es",
        "|": "vagy",
        "<": "kisebb mint",
        ">": "nagyobb mint",
        "∑": "szumma",
        "¤": "penznem"
      },
      it: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amore",
        "&": "e",
        "|": "o",
        "<": "minore di",
        ">": "maggiore di",
        "∑": "somma",
        "¤": "moneta"
      },
      lt: {
        "∆": "delta",
        "∞": "begalybe",
        "♥": "meile",
        "&": "ir",
        "|": "ar",
        "<": "maziau nei",
        ">": "daugiau nei",
        "∑": "suma",
        "¤": "valiuta"
      },
      lv: {
        "∆": "delta",
        "∞": "bezgaliba",
        "♥": "milestiba",
        "&": "un",
        "|": "vai",
        "<": "mazak neka",
        ">": "lielaks neka",
        "∑": "summa",
        "¤": "valuta"
      },
      my: {
        "∆": "kwahkhyaet",
        "∞": "asaonasme",
        "♥": "akhyait",
        "&": "nhin",
        "|": "tho",
        "<": "ngethaw",
        ">": "kyithaw",
        "∑": "paungld",
        "¤": "ngwekye"
      },
      mk: {},
      nl: {
        "∆": "delta",
        "∞": "oneindig",
        "♥": "liefde",
        "&": "en",
        "|": "of",
        "<": "kleiner dan",
        ">": "groter dan",
        "∑": "som",
        "¤": "valuta"
      },
      pl: {
        "∆": "delta",
        "∞": "nieskonczonosc",
        "♥": "milosc",
        "&": "i",
        "|": "lub",
        "<": "mniejsze niz",
        ">": "wieksze niz",
        "∑": "suma",
        "¤": "waluta"
      },
      pt: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amor",
        "&": "e",
        "|": "ou",
        "<": "menor que",
        ">": "maior que",
        "∑": "soma",
        "¤": "moeda"
      },
      ro: {
        "∆": "delta",
        "∞": "infinit",
        "♥": "dragoste",
        "&": "si",
        "|": "sau",
        "<": "mai mic ca",
        ">": "mai mare ca",
        "∑": "suma",
        "¤": "valuta"
      },
      ru: {
        "∆": "delta",
        "∞": "beskonechno",
        "♥": "lubov",
        "&": "i",
        "|": "ili",
        "<": "menshe",
        ">": "bolshe",
        "∑": "summa",
        "¤": "valjuta"
      },
      sk: {
        "∆": "delta",
        "∞": "nekonecno",
        "♥": "laska",
        "&": "a",
        "|": "alebo",
        "<": "menej ako",
        ">": "viac ako",
        "∑": "sucet",
        "¤": "mena"
      },
      sr: {},
      tr: {
        "∆": "delta",
        "∞": "sonsuzluk",
        "♥": "ask",
        "&": "ve",
        "|": "veya",
        "<": "kucuktur",
        ">": "buyuktur",
        "∑": "toplam",
        "¤": "para birimi"
      },
      uk: {
        "∆": "delta",
        "∞": "bezkinechnist",
        "♥": "lubov",
        "&": "i",
        "|": "abo",
        "<": "menshe",
        ">": "bilshe",
        "∑": "suma",
        "¤": "valjuta"
      },
      vn: {
        "∆": "delta",
        "∞": "vo cuc",
        "♥": "yeu",
        "&": "va",
        "|": "hoac",
        "<": "nho hon",
        ">": "lon hon",
        "∑": "tong",
        "¤": "tien te"
      }
    }, c = [
      ";",
      "?",
      ":",
      "@",
      "&",
      "=",
      "+",
      "$",
      ",",
      "/"
    ].join(""), p = [
      ";",
      "?",
      ":",
      "@",
      "&",
      "=",
      "+",
      "$",
      ","
    ].join(""), v = [
      ".",
      "!",
      "~",
      "*",
      "'",
      "(",
      ")"
    ].join(""), l = function(g, h) {
      var O = "-", T = "", D = "", G = !0, B = {}, Ee, ne, $, te, X, le, se, q, Ce, K, w, pe, U, m, _ = "";
      if (typeof g != "string") return "";
      if (typeof h == "string" && (O = h), se = a.en, q = i.en, typeof h == "object") {
        Ee = h.maintainCase || !1, B = h.custom && typeof h.custom == "object" ? h.custom : B, $ = +h.truncate > 1 && h.truncate || !1, te = h.uric || !1, X = h.uricNoSlash || !1, le = h.mark || !1, G = !(h.symbols === !1 || h.lang === !1), O = h.separator || O, te && (_ += c), X && (_ += p), le && (_ += v), se = h.lang && a[h.lang] && G ? a[h.lang] : G ? a.en : {}, q = h.lang && i[h.lang] ? i[h.lang] : h.lang === !1 || h.lang === !0 ? {} : i.en, h.titleCase && typeof h.titleCase.length == "number" && Array.prototype.toString.call(h.titleCase) ? (h.titleCase.forEach(function(S) {
          B[S + ""] = S + "";
        }), ne = !0) : ne = !!h.titleCase, h.custom && typeof h.custom.length == "number" && Array.prototype.toString.call(h.custom) && h.custom.forEach(function(S) {
          B[S + ""] = S + "";
        }), Object.keys(B).forEach(function(S) {
          var z;
          S.length > 1 ? z = new RegExp("\\b" + u(S) + "\\b", "gi") : z = new RegExp(u(S), "gi"), g = g.replace(z, B[S]);
        });
        for (w in B) _ += w;
      }
      for (_ += O, _ = u(_), g = g.replace(/(^\s+|\s+$)/g, ""), U = !1, m = !1, K = 0, pe = g.length; K < pe; K++)
        w = g[K], d(w, B) ? U = !1 : q[w] ? (w = U && q[w].match(/[A-Za-z0-9]/) ? " " + q[w] : q[w], U = !1) : w in o ? (K + 1 < pe && n.indexOf(g[K + 1]) >= 0 ? (D += w, w = "") : m === !0 ? (w = s[D] + o[w], D = "") : w = U && o[w].match(/[A-Za-z0-9]/) ? " " + o[w] : o[w], U = !1, m = !1) : w in s ? (D += w, w = "", K === pe - 1 && (w = s[D]), m = !0) : se[w] && !(te && c.indexOf(w) !== -1) && !(X && p.indexOf(w) !== -1) ? (w = U || T.substr(-1).match(/[A-Za-z0-9]/) ? O + se[w] : se[w], w += g[K + 1] !== void 0 && g[K + 1].match(/[A-Za-z0-9]/) ? O : "", U = !0) : (m === !0 ? (w = s[D] + w, D = "", m = !1) : U && (/[A-Za-z0-9]/.test(w) || T.substr(-1).match(/A-Za-z0-9]/)) && (w = " " + w), U = !1), T += w.replace(new RegExp("[^\\w\\s" + _ + "_-]", "g"), O);
      return ne && (T = T.replace(/(\w)(\S*)/g, function(S, z, St) {
        var We = z.toUpperCase() + (St !== null ? St : "");
        return Object.keys(B).indexOf(We.toLowerCase()) < 0 ? We : We.toLowerCase();
      })), T = T.replace(/\s+/g, O).replace(new RegExp("\\" + O + "+", "g"), O).replace(new RegExp("(^\\" + O + "+|\\" + O + "+$)", "g"), ""), $ && T.length > $ && (Ce = T.charAt($) === O, T = T.slice(0, $), Ce || (T = T.slice(0, T.lastIndexOf(O)))), !Ee && !ne && (T = T.toLowerCase()), T;
    }, y = function(g) {
      return function(O) {
        return l(O, g);
      };
    }, u = function(g) {
      return g.replace(/[-\\^$*+?.()|[\]{}\/]/g, "\\$&");
    }, d = function(b, g) {
      for (var h in g) if (g[h] === b) return !0;
    };
    if (typeof t < "u" && t.exports)
      t.exports = l, t.exports.createSlug = y;
    else if (typeof define < "u" && define.amd) define([], function() {
      return l;
    });
    else try {
      if (r.getSlug || r.createSlug) throw "speakingurl: globals exists /(getSlug|createSlug)/";
      r.getSlug = l, r.createSlug = y;
    } catch {
    }
  })(e);
}));
(/* @__PURE__ */ Xt(((e, t) => {
  t.exports = qn();
})))();
f.__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__ ??= {
  id: 0,
  appIds: /* @__PURE__ */ new Set()
};
function Jn(e) {
  N.highPerfModeEnabled = e ?? !N.highPerfModeEnabled, !e && M.value && fr(M.value.app);
}
function Zn(e) {
  N.devtoolsClientDetected = {
    ...N.devtoolsClientDetected,
    ...e
  }, Jn(!Object.values(N.devtoolsClientDetected).some(Boolean));
}
f.__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__ ??= Zn;
var Xn = class {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map(), this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(e, t) {
    this.keyToValue.set(e, t), this.valueToKey.set(t, e);
  }
  getByKey(e) {
    return this.keyToValue.get(e);
  }
  getByValue(e) {
    return this.valueToKey.get(e);
  }
  clear() {
    this.keyToValue.clear(), this.valueToKey.clear();
  }
}, hr = class {
  constructor(e) {
    this.generateIdentifier = e, this.kv = new Xn();
  }
  register(e, t) {
    this.kv.getByValue(e) || (t || (t = this.generateIdentifier(e)), this.kv.set(t, e));
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(e) {
    return this.kv.getByValue(e);
  }
  getValue(e) {
    return this.kv.getByKey(e);
  }
}, Qn = class extends hr {
  constructor() {
    super((e) => e.name), this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(e, t) {
    typeof t == "object" ? (t.allowProps && this.classToAllowedProps.set(e, t.allowProps), super.register(e, t.identifier)) : super.register(e, t);
  }
  getAllowedProps(e) {
    return this.classToAllowedProps.get(e);
  }
};
function es(e) {
  if ("values" in Object) return Object.values(e);
  const t = [];
  for (const r in e) e.hasOwnProperty(r) && t.push(e[r]);
  return t;
}
function ts(e, t) {
  const r = es(e);
  if ("find" in r) return r.find(t);
  const o = r;
  for (let n = 0; n < o.length; n++) {
    const s = o[n];
    if (t(s)) return s;
  }
}
function _e(e, t) {
  Object.entries(e).forEach(([r, o]) => t(o, r));
}
function De(e, t) {
  return e.indexOf(t) !== -1;
}
function Vt(e, t) {
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    if (t(o)) return o;
  }
}
var rs = class {
  constructor() {
    this.transfomers = {};
  }
  register(e) {
    this.transfomers[e.name] = e;
  }
  findApplicable(e) {
    return ts(this.transfomers, (t) => t.isApplicable(e));
  }
  findByName(e) {
    return this.transfomers[e];
  }
};
const os = (e) => Object.prototype.toString.call(e).slice(8, -1), mr = (e) => typeof e > "u", ns = (e) => e === null, Ie = (e) => typeof e != "object" || e === null || e === Object.prototype ? !1 : Object.getPrototypeOf(e) === null ? !0 : Object.getPrototypeOf(e) === Object.prototype, at = (e) => Ie(e) && Object.keys(e).length === 0, oe = (e) => Array.isArray(e), ss = (e) => typeof e == "string", is = (e) => typeof e == "number" && !isNaN(e), as = (e) => typeof e == "boolean", cs = (e) => e instanceof RegExp, xe = (e) => e instanceof Map, ke = (e) => e instanceof Set, gr = (e) => os(e) === "Symbol", ls = (e) => e instanceof Date && !isNaN(e.valueOf()), ps = (e) => e instanceof Error, Lt = (e) => typeof e == "number" && isNaN(e), us = (e) => as(e) || ns(e) || mr(e) || is(e) || ss(e) || gr(e), ds = (e) => typeof e == "bigint", fs = (e) => e === 1 / 0 || e === -1 / 0, hs = (e) => ArrayBuffer.isView(e) && !(e instanceof DataView), ms = (e) => e instanceof URL, _r = (e) => e.replace(/\./g, "\\."), Qe = (e) => e.map(String).map(_r).join("."), Te = (e) => {
  const t = [];
  let r = "";
  for (let n = 0; n < e.length; n++) {
    let s = e.charAt(n);
    if (s === "\\" && e.charAt(n + 1) === ".") {
      r += ".", n++;
      continue;
    }
    if (s === ".") {
      t.push(r), r = "";
      continue;
    }
    r += s;
  }
  const o = r;
  return t.push(o), t;
};
function Z(e, t, r, o) {
  return {
    isApplicable: e,
    annotation: t,
    transform: r,
    untransform: o
  };
}
const vr = [
  Z(mr, "undefined", () => null, () => {
  }),
  Z(ds, "bigint", (e) => e.toString(), (e) => typeof BigInt < "u" ? BigInt(e) : (console.error("Please add a BigInt polyfill."), e)),
  Z(ls, "Date", (e) => e.toISOString(), (e) => new Date(e)),
  Z(ps, "Error", (e, t) => {
    const r = {
      name: e.name,
      message: e.message
    };
    return t.allowedErrorProps.forEach((o) => {
      r[o] = e[o];
    }), r;
  }, (e, t) => {
    const r = new Error(e.message);
    return r.name = e.name, r.stack = e.stack, t.allowedErrorProps.forEach((o) => {
      r[o] = e[o];
    }), r;
  }),
  Z(cs, "regexp", (e) => "" + e, (e) => {
    const t = e.slice(1, e.lastIndexOf("/")), r = e.slice(e.lastIndexOf("/") + 1);
    return new RegExp(t, r);
  }),
  Z(ke, "set", (e) => [...e.values()], (e) => new Set(e)),
  Z(xe, "map", (e) => [...e.entries()], (e) => new Map(e)),
  Z((e) => Lt(e) || fs(e), "number", (e) => Lt(e) ? "NaN" : e > 0 ? "Infinity" : "-Infinity", Number),
  Z((e) => e === 0 && 1 / e === -1 / 0, "number", () => "-0", Number),
  Z(ms, "URL", (e) => e.toString(), (e) => new URL(e))
];
function Ke(e, t, r, o) {
  return {
    isApplicable: e,
    annotation: t,
    transform: r,
    untransform: o
  };
}
const yr = Ke((e, t) => gr(e) ? !!t.symbolRegistry.getIdentifier(e) : !1, (e, t) => ["symbol", t.symbolRegistry.getIdentifier(e)], (e) => e.description, (e, t, r) => {
  const o = r.symbolRegistry.getValue(t[1]);
  if (!o) throw new Error("Trying to deserialize unknown symbol");
  return o;
}), gs = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((e, t) => (e[t.name] = t, e), {}), Er = Ke(hs, (e) => ["typed-array", e.constructor.name], (e) => [...e], (e, t) => {
  const r = gs[t[1]];
  if (!r) throw new Error("Trying to deserialize unknown typed array");
  return new r(e);
});
function br(e, t) {
  return e?.constructor ? !!t.classRegistry.getIdentifier(e.constructor) : !1;
}
const wr = Ke(br, (e, t) => ["class", t.classRegistry.getIdentifier(e.constructor)], (e, t) => {
  const r = t.classRegistry.getAllowedProps(e.constructor);
  if (!r) return { ...e };
  const o = {};
  return r.forEach((n) => {
    o[n] = e[n];
  }), o;
}, (e, t, r) => {
  const o = r.classRegistry.getValue(t[1]);
  if (!o) throw new Error(`Trying to deserialize unknown class '${t[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  return Object.assign(Object.create(o.prototype), e);
}), Tr = Ke((e, t) => !!t.customTransformerRegistry.findApplicable(e), (e, t) => ["custom", t.customTransformerRegistry.findApplicable(e).name], (e, t) => t.customTransformerRegistry.findApplicable(e).serialize(e), (e, t, r) => {
  const o = r.customTransformerRegistry.findByName(t[1]);
  if (!o) throw new Error("Trying to deserialize unknown custom value");
  return o.deserialize(e);
}), _s = [
  wr,
  yr,
  Tr,
  Er
], Ut = (e, t) => {
  const r = Vt(_s, (n) => n.isApplicable(e, t));
  if (r) return {
    value: r.transform(e, t),
    type: r.annotation(e, t)
  };
  const o = Vt(vr, (n) => n.isApplicable(e, t));
  if (o) return {
    value: o.transform(e, t),
    type: o.annotation
  };
}, Sr = {};
vr.forEach((e) => {
  Sr[e.annotation] = e;
});
const vs = (e, t, r) => {
  if (oe(t)) switch (t[0]) {
    case "symbol":
      return yr.untransform(e, t, r);
    case "class":
      return wr.untransform(e, t, r);
    case "custom":
      return Tr.untransform(e, t, r);
    case "typed-array":
      return Er.untransform(e, t, r);
    default:
      throw new Error("Unknown transformation: " + t);
  }
  else {
    const o = Sr[t];
    if (!o) throw new Error("Unknown transformation: " + t);
    return o.untransform(e, r);
  }
}, he = (e, t) => {
  if (t > e.size) throw new Error("index out of bounds");
  const r = e.keys();
  for (; t > 0; )
    r.next(), t--;
  return r.next().value;
};
function Or(e) {
  if (De(e, "__proto__")) throw new Error("__proto__ is not allowed as a property");
  if (De(e, "prototype")) throw new Error("prototype is not allowed as a property");
  if (De(e, "constructor")) throw new Error("constructor is not allowed as a property");
}
const ys = (e, t) => {
  Or(t);
  for (let r = 0; r < t.length; r++) {
    const o = t[r];
    if (ke(e)) e = he(e, +o);
    else if (xe(e)) {
      const n = +o, s = +t[++r] == 0 ? "key" : "value", i = he(e, n);
      switch (s) {
        case "key":
          e = i;
          break;
        case "value":
          e = e.get(i);
          break;
      }
    } else e = e[o];
  }
  return e;
}, ct = (e, t, r) => {
  if (Or(t), t.length === 0) return r(e);
  let o = e;
  for (let s = 0; s < t.length - 1; s++) {
    const i = t[s];
    if (oe(o)) {
      const a = +i;
      o = o[a];
    } else if (Ie(o)) o = o[i];
    else if (ke(o)) {
      const a = +i;
      o = he(o, a);
    } else if (xe(o)) {
      if (s === t.length - 2) break;
      const a = +i, c = +t[++s] == 0 ? "key" : "value", p = he(o, a);
      switch (c) {
        case "key":
          o = p;
          break;
        case "value":
          o = o.get(p);
          break;
      }
    }
  }
  const n = t[t.length - 1];
  if (oe(o) ? o[+n] = r(o[+n]) : Ie(o) && (o[n] = r(o[n])), ke(o)) {
    const s = he(o, +n), i = r(s);
    s !== i && (o.delete(s), o.add(i));
  }
  if (xe(o)) {
    const s = +t[t.length - 2], i = he(o, s);
    switch (+n == 0 ? "key" : "value") {
      case "key": {
        const a = r(i);
        o.set(a, o.get(i)), a !== i && o.delete(i);
        break;
      }
      case "value":
        o.set(i, r(o.get(i)));
        break;
    }
  }
  return e;
};
function lt(e, t, r = []) {
  if (!e) return;
  if (!oe(e)) {
    _e(e, (s, i) => lt(s, t, [...r, ...Te(i)]));
    return;
  }
  const [o, n] = e;
  n && _e(n, (s, i) => {
    lt(s, t, [...r, ...Te(i)]);
  }), t(o, r);
}
function Es(e, t, r) {
  return lt(t, (o, n) => {
    e = ct(e, n, (s) => vs(s, o, r));
  }), e;
}
function bs(e, t) {
  function r(o, n) {
    const s = ys(e, Te(n));
    o.map(Te).forEach((i) => {
      e = ct(e, i, () => s);
    });
  }
  if (oe(t)) {
    const [o, n] = t;
    o.forEach((s) => {
      e = ct(e, Te(s), () => e);
    }), n && _e(n, r);
  } else _e(t, r);
  return e;
}
const ws = (e, t) => Ie(e) || oe(e) || xe(e) || ke(e) || br(e, t);
function Ts(e, t, r) {
  const o = r.get(e);
  o ? o.push(t) : r.set(e, [t]);
}
function Ss(e, t) {
  const r = {};
  let o;
  return e.forEach((n) => {
    if (n.length <= 1) return;
    t || (n = n.map((a) => a.map(String)).sort((a, c) => a.length - c.length));
    const [s, ...i] = n;
    s.length === 0 ? o = i.map(Qe) : r[Qe(s)] = i.map(Qe);
  }), o ? at(r) ? [o] : [o, r] : at(r) ? void 0 : r;
}
const Ir = (e, t, r, o, n = [], s = [], i = /* @__PURE__ */ new Map()) => {
  const a = us(e);
  if (!a) {
    Ts(e, n, t);
    const u = i.get(e);
    if (u) return o ? { transformedValue: null } : u;
  }
  if (!ws(e, r)) {
    const u = Ut(e, r), d = u ? {
      transformedValue: u.value,
      annotations: [u.type]
    } : { transformedValue: e };
    return a || i.set(e, d), d;
  }
  if (De(s, e)) return { transformedValue: null };
  const c = Ut(e, r), p = c?.value ?? e, v = oe(p) ? [] : {}, l = {};
  _e(p, (u, d) => {
    if (d === "__proto__" || d === "constructor" || d === "prototype") throw new Error(`Detected property ${d}. This is a prototype pollution risk, please remove it from your object.`);
    const b = Ir(u, t, r, o, [...n, d], [...s, e], i);
    v[d] = b.transformedValue, oe(b.annotations) ? l[d] = b.annotations : Ie(b.annotations) && _e(b.annotations, (g, h) => {
      l[_r(d) + "." + h] = g;
    });
  });
  const y = at(l) ? {
    transformedValue: v,
    annotations: c ? [c.type] : void 0
  } : {
    transformedValue: v,
    annotations: c ? [c.type, l] : l
  };
  return a || i.set(e, y), y;
};
function xr(e) {
  return Object.prototype.toString.call(e).slice(8, -1);
}
function Mt(e) {
  return xr(e) === "Array";
}
function Os(e) {
  if (xr(e) !== "Object") return !1;
  const t = Object.getPrototypeOf(e);
  return !!t && t.constructor === Object && t === Object.prototype;
}
function Is(e, t, r, o, n) {
  const s = {}.propertyIsEnumerable.call(o, t) ? "enumerable" : "nonenumerable";
  s === "enumerable" && (e[t] = r), n && s === "nonenumerable" && Object.defineProperty(e, t, {
    value: r,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
}
function pt(e, t = {}) {
  if (Mt(e)) return e.map((n) => pt(n, t));
  if (!Os(e)) return e;
  const r = Object.getOwnPropertyNames(e), o = Object.getOwnPropertySymbols(e);
  return [...r, ...o].reduce((n, s) => {
    if (Mt(t.props) && !t.props.includes(s)) return n;
    const i = e[s];
    return Is(n, s, pt(i, t), e, t.nonenumerable), n;
  }, {});
}
var I = class {
  /**
  * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
  */
  constructor({ dedupe: e = !1 } = {}) {
    this.classRegistry = new Qn(), this.symbolRegistry = new hr((t) => t.description ?? ""), this.customTransformerRegistry = new rs(), this.allowedErrorProps = [], this.dedupe = e;
  }
  serialize(e) {
    const t = /* @__PURE__ */ new Map(), r = Ir(e, t, this, this.dedupe), o = { json: r.transformedValue };
    r.annotations && (o.meta = {
      ...o.meta,
      values: r.annotations
    });
    const n = Ss(t, this.dedupe);
    return n && (o.meta = {
      ...o.meta,
      referentialEqualities: n
    }), o;
  }
  deserialize(e) {
    const { json: t, meta: r } = e;
    let o = pt(t);
    return r?.values && (o = Es(o, r.values, this)), r?.referentialEqualities && (o = bs(o, r.referentialEqualities)), o;
  }
  stringify(e) {
    return JSON.stringify(this.serialize(e));
  }
  parse(e) {
    return this.deserialize(JSON.parse(e));
  }
  registerClass(e, t) {
    this.classRegistry.register(e, t);
  }
  registerSymbol(e, t) {
    this.symbolRegistry.register(e, t);
  }
  registerCustom(e, t) {
    this.customTransformerRegistry.register({
      name: t,
      ...e
    });
  }
  allowErrorProps(...e) {
    this.allowedErrorProps.push(...e);
  }
};
I.defaultInstance = new I();
I.serialize = I.defaultInstance.serialize.bind(I.defaultInstance);
I.deserialize = I.defaultInstance.deserialize.bind(I.defaultInstance);
I.stringify = I.defaultInstance.stringify.bind(I.defaultInstance);
I.parse = I.defaultInstance.parse.bind(I.defaultInstance);
I.registerClass = I.defaultInstance.registerClass.bind(I.defaultInstance);
I.registerSymbol = I.defaultInstance.registerSymbol.bind(I.defaultInstance);
I.registerCustom = I.defaultInstance.registerCustom.bind(I.defaultInstance);
I.allowErrorProps = I.defaultInstance.allowErrorProps.bind(I.defaultInstance);
f.__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__ ??= [];
f.__VUE_DEVTOOLS_KIT_RPC_CLIENT__ ??= null;
f.__VUE_DEVTOOLS_KIT_RPC_SERVER__ ??= null;
f.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ ??= null;
f.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ ??= null;
f.__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__ ??= null;
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
const He = typeof window < "u", xs = /* @__PURE__ */ To({
  reporters: [/* @__PURE__ */ yo()],
  codes: {
    PINIA_R1001: {
      why: 'Directly pass all stores to "mapStores()" without putting them in an array. This will fail in production.',
      fix: "Replace mapStores([useAuthStore, useCartStore]) with mapStores(useAuthStore, useCartStore).",
      docs: "https://pinia.vuejs.org/cookbook/options-api.html#Giving-access-to-the-whole-store"
    },
    PINIA_R1002: {
      why: (e) => `A getter cannot have the same name as another state property. Found "${e.name}" in store "${e.id}".`,
      fix: "Rename either the getter or the state property.",
      docs: "https://pinia.vuejs.org/core-concepts/getters.html#Accessing-other-getters"
    },
    PINIA_R1003: {
      why: (e) => `The "state" must be a plain object. Found in store "${e.id}".`,
      fix: "Return a plain object, e.g. avoid state: () => new MyClass().",
      docs: "https://pinia.vuejs.org/core-concepts/state.html#State"
    },
    PINIA_R1004: {
      why: "Pinia instance not found in context. This falls back to the global activePinia, which exposes you to cross-request pollution on the server.",
      fix: '"useStore()" is a composable and follows the same rules: call it at the top of setup() (or another composable), or pass the pinia instance explicitly when used outside of a component.',
      docs: "https://pinia.vuejs.org/ssr/#Using-the-store-outside-of-setup-"
    },
    PINIA_R1005: {
      why: (e) => `The store id changed from "${e.from}" to "${e.to}", forcing a reload.`,
      docs: "https://pinia.vuejs.org/cookbook/hot-module-replacement.html#HMR-Hot-Module-Replacement-"
    },
    PINIA_R1006: {
      why: (e) => `Property "${e.key}" of store "${e.id}" is not reactive (not a ref, reactive object, or shallowRef), so storeToRefs() ignores it.`,
      fix: "If it should be reactive state, wrap it with ref(), reactive(), or shallowRef(). If it is an intentional non-reactive property, wrap it with markRaw() so storeToRefs() skips it explicitly.",
      docs: "https://pinia.vuejs.org/core-concepts/plugins.html#Adding-new-external-properties"
    },
    PINIA_R1007: {
      why: (e) => `The same callback was passed to "$subscribe()" of store "${e.id}" more than once. Subscriptions are deduplicated, so the duplicate is ignored.`,
      fix: "Subscribe each callback only once. If you need to resubscribe, call the returned function to remove the previous subscription first, or create a new function.",
      docs: "https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state"
    }
  }
});
let ut;
const kr = (e) => ut = e, ks = process.env.NODE_ENV !== "production" ? () => {
  const e = Ot() && Me(dt);
  return !e && !He && xs.PINIA_R1004({}, { method: "error" }), e || ut;
} : () => Ot() && Me(dt) || ut, dt = process.env.NODE_ENV !== "production" ? Symbol("pinia") : (
  /* istanbul ignore next */
  Symbol()
), $t = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function Cs(e, { autoBom: t = !1 } = {}) {
  return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["\uFEFF", e], { type: e.type }) : e;
}
function wt(e, t, r) {
  const o = new XMLHttpRequest();
  o.open("GET", e), o.responseType = "blob", o.onload = function() {
    Rr(o.response, t, r);
  }, o.onerror = function() {
    console.error("could not download file");
  }, o.send();
}
function Cr(e) {
  const t = new XMLHttpRequest();
  t.open("HEAD", e, !1);
  try {
    t.send();
  } catch {
  }
  return t.status >= 200 && t.status <= 299;
}
function Ve(e) {
  try {
    e.dispatchEvent(new MouseEvent("click"));
  } catch {
    const r = new MouseEvent("click", {
      bubbles: !0,
      cancelable: !0,
      view: window,
      detail: 0,
      screenX: 80,
      screenY: 20,
      clientX: 80,
      clientY: 20,
      ctrlKey: !1,
      altKey: !1,
      shiftKey: !1,
      metaKey: !1,
      button: 0,
      relatedTarget: null
    });
    e.dispatchEvent(r);
  }
}
const Le = typeof navigator == "object" ? navigator : { userAgent: "" }, Nr = /Macintosh/.test(Le.userAgent) && /AppleWebKit/.test(Le.userAgent) && !/Safari/.test(Le.userAgent), Rr = He ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !Nr ? Ns : "msSaveOrOpenBlob" in Le ? Rs : Ps : () => {
};
function Ns(e, t = "download", r) {
  const o = document.createElement("a");
  o.download = t, o.rel = "noopener", typeof e == "string" ? (o.href = e, o.origin !== location.origin ? Cr(o.href) ? wt(e, t, r) : (o.target = "_blank", Ve(o)) : Ve(o)) : (o.href = URL.createObjectURL(e), setTimeout(function() {
    URL.revokeObjectURL(o.href);
  }, 4e4), setTimeout(function() {
    Ve(o);
  }, 0));
}
function Rs(e, t = "download", r) {
  if (typeof e == "string") if (Cr(e)) wt(e, t, r);
  else {
    const o = document.createElement("a");
    o.href = e, o.target = "_blank", setTimeout(function() {
      Ve(o);
    });
  }
  else navigator.msSaveOrOpenBlob(Cs(e, r), t);
}
function Ps(e, t, r, o) {
  if (o = o || open("", "_blank"), o && (o.document.title = o.document.body.innerText = "downloading..."), typeof e == "string") return wt(e, t, r);
  const n = e.type === "application/octet-stream", s = /constructor/i.test(String($t.HTMLElement)) || "safari" in $t, i = /CriOS\/[\d]+/.test(navigator.userAgent);
  if ((i || n && s || Nr) && typeof FileReader < "u") {
    const a = new FileReader();
    a.onloadend = function() {
      let c = a.result;
      if (typeof c != "string")
        throw o = null, new Error("Wrong reader.result type");
      c = i ? c : c.replace(/^data:[^;]*;/, "data:attachment/file;"), o ? o.location.href = c : location.assign(c), o = null;
    }, a.readAsDataURL(e);
  } else {
    const a = URL.createObjectURL(e);
    o ? o.location.assign(a) : location.href = a, o = null, setTimeout(function() {
      URL.revokeObjectURL(a);
    }, 4e4);
  }
}
function R(e, t) {
  const r = "🍍 " + e;
  t === "error" ? console.error(r) : t === "warn" ? console.warn(r) : console.debug(r);
}
function Tt(e) {
  return "_a" in e && "install" in e;
}
function Pr(e, t) {
  const r = Se(e)[t];
  return Hr(r) && !Gr(r);
}
function Ar() {
  if (!("clipboard" in navigator))
    return R("Your browser doesn't support the Clipboard API", "error"), !0;
}
function Dr(e) {
  return e instanceof Error && e.message.toLowerCase().includes("document is not focused") ? (R('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn"), !0) : !1;
}
async function As(e) {
  if (!Ar())
    try {
      await navigator.clipboard.writeText(JSON.stringify(e.state.value)), R("Global state copied to clipboard.");
    } catch (t) {
      if (Dr(t)) return;
      R("Failed to serialize the state. Check the console for more details.", "error"), console.error(t);
    }
}
async function Ds(e) {
  if (!Ar())
    try {
      Vr(e, JSON.parse(await navigator.clipboard.readText())), R("Global state pasted from clipboard.");
    } catch (t) {
      if (Dr(t)) return;
      R("Failed to deserialize the state from clipboard. Check the console for more details.", "error"), console.error(t);
    }
}
async function Vs(e) {
  try {
    Rr(new Blob([JSON.stringify(e.state.value)], { type: "text/plain;charset=utf-8" }), "pinia-state.json");
  } catch (t) {
    R("Failed to export the state as JSON. Check the console for more details.", "error"), console.error(t);
  }
}
let ee;
function Ls() {
  ee || (ee = document.createElement("input"), ee.type = "file", ee.accept = ".json");
  function e() {
    return new Promise((t, r) => {
      ee.onchange = async () => {
        const o = ee.files;
        if (!o) return t(null);
        const n = o.item(0);
        return t(n ? {
          text: await n.text(),
          file: n
        } : null);
      }, ee.oncancel = () => t(null), ee.onerror = r, ee.click();
    });
  }
  return e;
}
async function Us(e) {
  try {
    const t = await Ls()();
    if (!t) return;
    const { text: r, file: o } = t;
    Vr(e, JSON.parse(r)), R(`Global state imported from "${o.name}".`);
  } catch (t) {
    R("Failed to import the state from JSON. Check the console for more details.", "error"), console.error(t);
  }
}
function Vr(e, t) {
  for (const r in t) {
    const o = e.state.value[r];
    o ? Object.assign(o, t[r]) : e.state.value[r] = t[r];
  }
}
function Y(e) {
  return { _custom: { display: e } };
}
const Lr = "🍍 Pinia (root)", Ms = "_root";
function $s(e) {
  return Tt(e) ? {
    id: Ms,
    label: Lr
  } : {
    id: e.$id,
    label: e.$id
  };
}
function zs(e) {
  if (Tt(e)) {
    const r = Array.from(e._s.keys()), o = e._s;
    return {
      state: r.map((n) => ({
        editable: !0,
        key: n,
        value: e.state.value[n]
      })),
      getters: r.filter((n) => o.get(n)._getters).map((n) => {
        const s = o.get(n);
        return {
          editable: !1,
          key: n,
          value: s._getters.reduce((i, a) => (i[a] = s[a], i), {})
        };
      })
    };
  }
  const t = { state: Object.keys(e.$state).map((r) => ({
    editable: !0,
    key: r,
    value: e.$state[r]
  })) };
  return e._getters && e._getters.length && (t.getters = e._getters.map((r) => ({
    editable: Pr(e, r),
    key: r,
    value: e[r]
  }))), e._customProperties.size && (t.customProperties = Array.from(e._customProperties).map((r) => ({
    editable: !0,
    key: r,
    value: e[r]
  }))), t;
}
function js(e) {
  return e ? Array.isArray(e) ? e.reduce((t, r) => (t.keys.push(r.key), t.operations.push(r.type), t.oldValue[r.key] = r.oldValue, t.newValue[r.key] = r.newValue, t), {
    oldValue: {},
    keys: [],
    operations: [],
    newValue: {}
  }) : {
    operation: Y(e.type),
    key: Y(e.key),
    oldValue: e.oldValue,
    newValue: e.newValue
  } : {};
}
function Hs(e) {
  switch (e) {
    case "direct":
      return "mutation";
    case "patch function":
      return "$patch";
    case "patch object":
      return "$patch";
    default:
      return "unknown";
  }
}
let me = !0;
const Ue = [], ie = "pinia:mutations", L = "pinia", { assign: Gs } = Object, Ge = (e) => "🍍 " + e;
function Bs(e, t) {
  dr({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes: Ue,
    app: e
  }, (r) => {
    typeof r.now != "function" && R("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html."), r.addTimelineLayer({
      id: ie,
      label: "Pinia 🍍",
      color: 15064968
    }), r.addInspector({
      id: L,
      label: "Pinia 🍍",
      icon: "storage",
      treeFilterPlaceholder: "Search stores",
      actions: [
        {
          icon: "content_copy",
          action: () => {
            As(t);
          },
          tooltip: "Serialize and copy the state"
        },
        {
          icon: "content_paste",
          action: async () => {
            await Ds(t), r.sendInspectorTree(L), r.sendInspectorState(L);
          },
          tooltip: "Replace the state with the content of your clipboard"
        },
        {
          icon: "save",
          action: () => {
            Vs(t);
          },
          tooltip: "Save the state as a JSON file"
        },
        {
          icon: "folder_open",
          action: async () => {
            await Us(t), r.sendInspectorTree(L), r.sendInspectorState(L);
          },
          tooltip: "Import the state from a JSON file"
        }
      ],
      nodeActions: [{
        icon: "restore",
        tooltip: 'Reset the state (with "$reset")',
        action: (o) => {
          const n = t._s.get(o);
          n ? typeof n.$reset != "function" ? R(`Cannot reset "${o}" store because it doesn't have a "$reset" method implemented.`, "warn") : (n.$reset(), R(`Store "${o}" reset.`)) : R(`Cannot reset "${o}" store because it wasn't found.`, "warn");
        }
      }]
    }), r.on.inspectComponent((o) => {
      const n = o.componentInstance && o.componentInstance.proxy;
      if (n && n._pStores) {
        const s = o.componentInstance.proxy._pStores;
        Object.values(s).forEach((i) => {
          o.instanceData.state.push({
            type: Ge(i.$id),
            key: "state",
            editable: !0,
            value: i._isOptionsAPI ? { _custom: {
              value: Se(i.$state),
              actions: [{
                icon: "restore",
                tooltip: "Reset the state of this store",
                action: () => i.$reset()
              }]
            } } : Object.keys(i.$state).reduce((a, c) => (a[c] = i.$state[c], a), {})
          }), i._getters && i._getters.length && o.instanceData.state.push({
            type: Ge(i.$id),
            key: "getters",
            editable: !1,
            value: i._getters.reduce((a, c) => {
              try {
                a[c] = i[c];
              } catch (p) {
                a[c] = p;
              }
              return a;
            }, {})
          });
        });
      }
    }), r.on.getInspectorTree((o) => {
      if (o.app === e && o.inspectorId === L) {
        let n = [t];
        n = n.concat(Array.from(t._s.values())), o.rootNodes = (o.filter ? n.filter((s) => "$id" in s ? s.$id.toLowerCase().includes(o.filter.toLowerCase()) : Lr.toLowerCase().includes(o.filter.toLowerCase())) : n).map($s);
      }
    }), globalThis.$pinia = t, r.on.getInspectorState((o) => {
      if (o.app === e && o.inspectorId === L) {
        const n = o.nodeId === "_root" ? t : t._s.get(o.nodeId);
        if (!n) return;
        n && (o.nodeId !== "_root" && (globalThis.$store = Se(n)), o.state = zs(n));
      }
    }), r.on.editInspectorState((o) => {
      if (o.app === e && o.inspectorId === L) {
        const n = o.nodeId === "_root" ? t : t._s.get(o.nodeId);
        if (!n) return R(`store "${o.nodeId}" not found`, "error");
        const { path: s } = o;
        Tt(n) ? s.unshift("state") : (s.length !== 1 || !n._customProperties.has(s[0]) && !Pr(n, s[0]) || s[0] in n.$state) && s.unshift("$state"), me = !1, o.set(n, s, o.state.value), me = !0;
      }
    }), r.on.editComponentState((o) => {
      if (o.type.startsWith("🍍")) {
        const n = o.type.replace(/^🍍\s*/, ""), s = t._s.get(n);
        if (!s) return R(`store "${n}" not found`, "error");
        const { path: i } = o;
        if (i[0] !== "state") return R(`Invalid path for store "${n}":
${i}
Only state can be modified.`);
        i[0] = "$state", me = !1, o.set(s, i, o.state.value), me = !0;
      }
    });
  });
}
function Fs(e, t) {
  Ue.includes(Ge(t.$id)) || Ue.push(Ge(t.$id)), dr({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes: Ue,
    app: e,
    settings: { logStoreChanges: {
      label: "Notify about new/deleted stores",
      type: "boolean",
      defaultValue: !0
    } }
  }, (r) => {
    const o = typeof r.now == "function" ? r.now.bind(r) : Date.now;
    t.$onAction(({ after: i, onError: a, name: c, args: p }) => {
      const v = Ur++;
      r.addTimelineEvent({
        layerId: ie,
        event: {
          time: o(),
          title: "🛫 " + c,
          subtitle: "start",
          data: {
            store: Y(t.$id),
            action: Y(c),
            args: p
          },
          groupId: v
        }
      }), i((l) => {
        re = void 0, r.addTimelineEvent({
          layerId: ie,
          event: {
            time: o(),
            title: "🛬 " + c,
            subtitle: "end",
            data: {
              store: Y(t.$id),
              action: Y(c),
              args: p,
              result: l
            },
            groupId: v
          }
        });
      }), a((l) => {
        re = void 0, r.addTimelineEvent({
          layerId: ie,
          event: {
            time: o(),
            logType: "error",
            title: "💥 " + c,
            subtitle: "end",
            data: {
              store: Y(t.$id),
              action: Y(c),
              args: p,
              error: l
            },
            groupId: v
          }
        });
      });
    }, !0), t._customProperties.forEach((i) => {
      et(() => F(t[i]), (a, c) => {
        r.notifyComponentUpdate(), r.sendInspectorState(L), me && r.addTimelineEvent({
          layerId: ie,
          event: {
            time: o(),
            title: "Change",
            subtitle: i,
            data: {
              newValue: a,
              oldValue: c
            },
            groupId: re
          }
        });
      }, { deep: !0 });
    }), t.$subscribe(({ events: i, type: a }, c) => {
      if (r.notifyComponentUpdate(), r.sendInspectorState(L), !me) return;
      const p = {
        time: o(),
        title: Hs(a),
        data: Gs({ store: Y(t.$id) }, js(i)),
        groupId: re
      };
      a === "patch function" ? p.subtitle = "⤵️" : a === "patch object" ? p.subtitle = "🧩" : i && !Array.isArray(i) && (p.subtitle = i.type), i && (p.data["rawEvent(s)"] = { _custom: {
        display: "DebuggerEvent",
        type: "object",
        tooltip: "raw DebuggerEvent[]",
        value: i
      } }), r.addTimelineEvent({
        layerId: ie,
        event: p
      });
    }, {
      detached: !0,
      flush: "sync"
    });
    const n = t._hotUpdate;
    t._hotUpdate = jt((i) => {
      n(i), r.addTimelineEvent({
        layerId: ie,
        event: {
          time: o(),
          title: "🔥 " + t.$id,
          subtitle: "HMR update",
          data: {
            store: Y(t.$id),
            info: Y("HMR update")
          }
        }
      }), r.notifyComponentUpdate(), r.sendInspectorTree(L), r.sendInspectorState(L);
    });
    const { $dispose: s } = t;
    t.$dispose = () => {
      s(), r.notifyComponentUpdate(), r.sendInspectorTree(L), r.sendInspectorState(L), r.getSettings().logStoreChanges && R(`Disposed "${t.$id}" store 🗑`);
    }, r.notifyComponentUpdate(), r.sendInspectorTree(L), r.sendInspectorState(L), r.getSettings().logStoreChanges && R(`"${t.$id}" store installed 🆕`);
  });
}
let Ur = 0, re;
function zt(e, t, r) {
  const o = t.reduce((n, s) => (n[s] = Se(e)[s], n), {});
  for (const n in o) e[n] = function() {
    const s = Ur, i = r ? new Proxy(e, {
      get(...c) {
        return re = s, Reflect.get(...c);
      },
      set(...c) {
        return re = s, Reflect.set(...c);
      }
    }) : e;
    re = s;
    const a = o[n].apply(i, arguments);
    return re = void 0, a;
  };
}
function Ks({ app: e, store: t, options: r }) {
  if (!t.$id.startsWith("__hot:")) {
    if (t._isOptionsAPI = !!r.state, !t._p._testing) {
      zt(t, Object.keys(r.actions), t._isOptionsAPI);
      const o = t._hotUpdate;
      Se(t)._hotUpdate = function(n) {
        o.apply(this, arguments), zt(t, Object.keys(n._hmrPayload.actions), !!t._isOptionsAPI);
      };
    }
    Fs(e, t);
  }
}
function Ws() {
  const e = jr(!0), t = e.run(() => A({}));
  let r = [], o = [];
  const n = jt({
    install(s) {
      kr(n), n._a = s, s.provide(dt, n), s.config.globalProperties.$pinia = n, process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && He && Bs(s, n), o.forEach((i) => r.push(i)), o = [];
    },
    use(s) {
      return this._a ? r.push(s) : o.push(s), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && He && typeof Proxy < "u" && n.use(Ks), n;
}
process.env.NODE_ENV !== "production" ? Symbol("pinia:skipHydration") : (
  /* istanbul ignore next */
  Symbol()
);
var Ys = Object.defineProperty, qs = (e, t, r) => t in e ? Ys(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, fe = (e, t, r) => qs(e, typeof t != "symbol" ? t + "" : t, r), Mr = /* @__PURE__ */ Symbol("wippy:emit"), $r = /* @__PURE__ */ Symbol("wippy:props"), Js = /* @__PURE__ */ Symbol("wippy:props_error"), Zs = /* @__PURE__ */ Symbol("wippy:content"), Xs = /* @__PURE__ */ Symbol("wippy:panel-id"), Qs = /* @__PURE__ */ Symbol("wippy:layout-bus"), ei = /* @__PURE__ */ Symbol("wippy:host"), ti = /* @__PURE__ */ Symbol("wippy:host-visibility");
function ri() {
  const e = Me($r);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function oi() {
  const e = Me(Mr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var ni = class extends mo {
  constructor() {
    super(...arguments), fe(this, "_vueApp", null), fe(this, "_propsRef", A({})), fe(this, "_errorsRef", A([])), fe(this, "_contentRef", A(null)), fe(this, "_hostVisibilityRef", A(null)), fe(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, s) {
    const i = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const p of o)
      this.emitEvent("invalid", { message: p });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((p, v) => {
      this._propsRef.value = p, this._errorsRef.value = [...v];
      for (const l of v)
        this.emitEvent("invalid", { message: l });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((p) => {
      this._contentRef.value = p;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((p) => {
      this._hostVisibilityRef.value = p;
    }, { signal: a.signal });
    const c = (p) => {
      if (a.signal.aborted)
        return;
      const v = ks(), l = Br(p.rootComponent);
      this._vueApp = l;
      const y = Ws();
      if (p.piniaPlugins)
        for (const u of p.piniaPlugins)
          y.use(u);
      if (l.use(y), p.plugins)
        for (const u of p.plugins)
          l.use(u);
      l.provide($r, this._propsRef), l.provide(Js, this._errorsRef), l.provide(Mr, this.emitEvent.bind(this)), l.provide(Zs, this._contentRef), l.provide(ti, this._hostVisibilityRef), l.provide(Xs, _o(this)), l.provide(Qs, go(this)), l.provide(ei, Ft(this)), p.providers && p.providers(l, this), l.mount(t), v && kr(v);
    };
    if (i.rootComponent)
      c(i);
    else if (i.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), t.appendChild(p), i.lazyConfig().then((v) => {
        a.signal.aborted || (p.remove(), c(v));
      }).catch((v) => {
        if (a.signal.aborted)
          return;
        const l = v instanceof Error ? v.message : String(v), y = document.createElement("wippy-error");
        y.setAttribute("title", "Failed to load"), y.setAttribute("message", l), p.replaceWith(y), this.emitEvent("error", { message: l });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
function zr(e, t) {
  if (e && typeof e == "object") {
    const r = e;
    r.response?.status === 401 && Ht.handleError("auth-expired", r);
  }
  if (e && typeof e == "object") {
    const r = e, o = r.response?.data?.error;
    if (typeof o == "string" && o.trim()) return o;
    if (typeof r.message == "string" && r.message.trim()) return r.message;
  }
  return t;
}
async function si(e) {
  try {
    const t = [];
    let r;
    do {
      const o = new URLSearchParams({ tool_ids: e.join(","), fields: "*", limit: "100" });
      r && o.set("cursor", r);
      const { data: n } = await Gt.get(`/api/v1/code-execution/sdk-reference?${o}`);
      if (n?.success === !1) throw new Error(n.error || "failed to load SDK reference");
      t.push(...n.tools), r = n.next_cursor;
    } while (r);
    return { tools: t };
  } catch (t) {
    throw new Error(zr(t, "could not load SDK reference"));
  }
}
async function ii(e) {
  try {
    const { data: t } = await Gt.post("/api/v1/code-execution/assist", e);
    if (t && t.success === !1) throw new Error(t.error || "could not generate code");
    const r = t || {};
    return {
      code: typeof r.code == "string" ? r.code : void 0,
      validated: r.validated === !0,
      errors: Array.isArray(r.errors) ? r.errors.map(String) : void 0
    };
  } catch (t) {
    throw new Error(zr(t, "could not generate code"));
  }
}
const ai = { class: "ce ce-body" }, ci = { class: "kx-field" }, li = { class: "ce-label" }, pi = ["value"], ui = { class: "ce-assist-row" }, di = ["disabled"], fi = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, hi = {
  key: 1,
  class: "ce-assist-result",
  "aria-live": "polite"
}, mi = {
  key: 0,
  class: "ce-errors"
}, gi = { key: 0 }, _i = { class: "kx-field" }, vi = ["value"], yi = { class: "kx-field" }, Ei = ["value"], bi = { class: "kx-field" }, wi = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, Ti = ["selected"], Si = { class: "ce-disclosure-body" }, Oi = {
  key: 0,
  class: "ce-error",
  role: "alert"
}, Ii = {
  key: 1,
  class: "ce-note",
  "aria-live": "polite"
}, xi = {
  key: 2,
  class: "ce-empty"
}, ki = {
  key: 0,
  class: "ce-sdk-group"
}, Ci = {
  class: "ce-list",
  "aria-label": "Callable tools"
}, Ni = { class: "ce-disclosure" }, Ri = { class: "ce-sig" }, Pi = { class: "ce-disclosure-body" }, Ai = {
  key: 0,
  class: "ce-tool-desc"
}, Di = { class: "ce-schema-grid" }, Vi = { class: "ce-schema-section" }, Li = ["aria-label"], Ui = { class: "ce-schema-section" }, Mi = ["aria-label"], $i = /* @__PURE__ */ Fr({
  __name: "CodeBody",
  setup(e) {
    const t = ri(), r = oi();
    function o(m) {
      return m && typeof m == "object" && typeof m.code == "string" ? m.code : "";
    }
    function n(m) {
      return m && typeof m == "object" && typeof m.method == "string" ? m.method : "";
    }
    function s(m) {
      return !m || typeof m != "object" || !Array.isArray(m.tool_ids) ? [] : [...new Set(m.tool_ids.map(String).map((_) => _.trim()).filter(Boolean))];
    }
    const i = A(o(t.value.config)), a = A(n(t.value.config)), c = A(s(t.value.config)), p = Ne(() => JSON.stringify(c.value));
    let v = i.value, l = a.value, y = JSON.stringify(c.value);
    et(() => t.value.config, (m) => {
      const _ = o(m), S = n(m), z = s(m);
      _ !== i.value && (i.value = _), S !== a.value && (a.value = S), JSON.stringify(z) !== JSON.stringify(c.value) && (c.value = z), v = _, l = S, y = JSON.stringify(z);
    });
    function u() {
      return {
        code: i.value,
        ...c.value.length ? { tool_ids: [...c.value] } : {},
        ...a.value !== "" ? { method: a.value } : {}
      };
    }
    function d() {
      const m = JSON.stringify(c.value);
      i.value === v && a.value === l && m === y || (v = i.value, l = a.value, y = m, r("config-changed", u()));
    }
    function b(m) {
      i.value = m.target.value, d();
    }
    function g(m) {
      a.value = m.target.value.trim(), d();
    }
    function h(m) {
      const _ = m.detail, S = _ && Array.isArray(_.selected) ? _.selected : [];
      c.value = [...new Set(S.map(String).map((z) => z.trim()).filter(Boolean))], d();
    }
    const O = A(""), T = A(!1), D = A(""), G = A(null), B = Ne(() => O.value.trim().length > 0 && !T.value), Ee = Ne(() => G.value?.errors || []);
    async function ne() {
      if (B.value) {
        T.value = !0, D.value = "", G.value = null;
        try {
          const m = await ii({ intent: O.value.trim(), tool_ids: c.value });
          G.value = m, m.validated && typeof m.code == "string" && (i.value = m.code, d());
        } catch (m) {
          D.value = m instanceof Error ? m.message : "could not generate code", r("error", { message: D.value, error: m });
        } finally {
          T.value = !1;
        }
      }
    }
    const $ = A(null), te = A(!1), X = A(""), le = A(!1), se = Ne(() => !!$.value && $.value.tools.length === 0);
    async function q() {
      te.value = !0, X.value = "";
      try {
        $.value = await si(c.value);
      } catch (m) {
        X.value = m instanceof Error ? m.message : "could not load SDK reference", r("error", { message: X.value, error: m });
      } finally {
        te.value = !1;
      }
    }
    function Ce(m) {
      le.value = m.target.open, le.value && !$.value && !te.value && q();
    }
    function K() {
      q();
    }
    et(c, () => {
      le.value && q();
    });
    function w(m, _) {
      return !m || Object.keys(m).length === 0 ? _ === "input" ? "No input schema — takes no arguments." : "No output schema declared." : JSON.stringify(m, null, 2);
    }
    function pe(m) {
      return m.call || `sdk.tools["${m.id}"](args)`;
    }
    const U = A("");
    return Kr(async () => {
      try {
        await Qr("wc-multiselect", { timeoutMs: 8e3 });
      } catch (m) {
        U.value = "The tool picker could not be loaded.", r("error", { message: U.value, error: m });
      }
    }), (m, _) => (C(), P("div", ai, [
      E("div", ci, [
        E("span", li, [
          Q(F(W), {
            icon: "tabler:sparkles",
            "aria-hidden": "true"
          }),
          _[1] || (_[1] = ue(" What should this code do? ", -1))
        ]),
        E("textarea", {
          class: "kx-input kx-textarea ce-intent",
          value: O.value,
          rows: "3",
          "aria-label": "Describe what the code should do",
          placeholder: "Describe it in plain language — e.g. send a message to my inbox saying hi.",
          onInput: _[0] || (_[0] = (S) => {
            O.value = S.target.value;
          })
        }, null, 40, pi),
        E("div", ui, [
          E("button", {
            type: "button",
            class: "kx-btn kx-btn-primary",
            disabled: !B.value,
            onClick: ne
          }, [
            T.value ? (C(), It(F(W), {
              key: 1,
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            })) : (C(), It(F(W), {
              key: 0,
              icon: "tabler:wand",
              "aria-hidden": "true"
            })),
            ue(" " + J(T.value ? "Generating…" : "Generate"), 1)
          ], 8, di),
          _[2] || (_[2] = E("span", { class: "ce-hint" }, "Drafts Lua against the allowed tools and validates it in a sandbox dry-run.", -1))
        ]),
        D.value ? (C(), P("div", fi, [
          Q(F(W), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          E("span", null, J(D.value), 1),
          E("button", {
            type: "button",
            class: "ce-retry",
            onClick: ne
          }, "Retry")
        ])) : G.value ? (C(), P("div", hi, [
          E("span", {
            class: Wr(["ce-status", G.value.validated ? "ok" : "bad"])
          }, [
            Q(F(W), {
              icon: G.value.validated ? "tabler:circle-check" : "tabler:alert-triangle",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ue(" " + J(G.value.validated ? "Validated — the code is ready below." : "Not validated — nothing was filled in."), 1)
          ], 2),
          G.value.validated ? de("", !0) : (C(), P("ul", mi, [
            (C(!0), P(Ye, null, xt(Ee.value, (S, z) => (C(), P("li", { key: z }, J(S), 1))), 128)),
            Ee.value.length ? de("", !0) : (C(), P("li", gi, "The generator could not produce validated code."))
          ]))
        ])) : de("", !0)
      ]),
      E("label", _i, [
        _[3] || (_[3] = E("span", { class: "ce-sublabel" }, "Code", -1)),
        E("textarea", {
          class: "ce-code",
          value: i.value,
          spellcheck: "false",
          autocapitalize: "off",
          autocomplete: "off",
          autocorrect: "off",
          wrap: "off",
          rows: "12",
          "aria-label": "Lua code to run",
          placeholder: `-- Lua run by this Block
local res, err = sdk.tools["namespace:tool_id"]({ query = '...' })
if err then error(err) end
return res`,
          onInput: b
        }, null, 40, vi),
        _[4] || (_[4] = E("span", { class: "ce-hint" }, [
          ue("The Lua this Block runs, as the current user. It reaches tools through the "),
          E("code", null, "sdk"),
          ue(" import — see the SDK reference below.")
        ], -1))
      ]),
      E("label", yi, [
        _[5] || (_[5] = E("span", { class: "ce-sublabel" }, [
          ue("Exported method "),
          E("span", { class: "ce-optional" }, "optional")
        ], -1)),
        E("input", {
          class: "kx-input ce-method",
          value: a.value,
          autocomplete: "off",
          spellcheck: "false",
          placeholder: "Leave empty to use the chunk result",
          onInput: g
        }, null, 40, Ei),
        _[6] || (_[6] = E("span", { class: "ce-hint" }, "Invoke this exported function after loading the Lua chunk.", -1))
      ]),
      E("div", bi, [
        _[7] || (_[7] = E("span", { class: "ce-sublabel" }, "Allowed tools", -1)),
        U.value ? (C(), P("div", wi, [
          Q(F(W), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          E("span", null, J(U.value), 1)
        ])) : (C(), P("wc-multiselect", {
          key: 1,
          class: "ce-tool-picker",
          source: "/api/v1/code-execution/sdk-reference",
          "response-key": "tools",
          "id-key": "id",
          "label-key": "label",
          "desc-key": "description",
          selected: p.value,
          multi: !0,
          placeholder: "Search tools…",
          onChange: h
        }, null, 40, Ti)),
        _[8] || (_[8] = E("span", { class: "ce-hint" }, "Select a restricted tool surface, or leave this empty to allow every tool the current user can reach.", -1))
      ]),
      E("details", {
        class: "ce-disclosure ce-sdk",
        onToggle: Ce
      }, [
        E("summary", null, [
          Q(F(W), {
            class: "ce-caret",
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          }),
          Q(F(W), {
            class: "ce-tool-icon",
            icon: "tabler:code",
            "aria-hidden": "true"
          }),
          _[9] || (_[9] = E("span", { class: "ce-tool-title" }, "SDK reference", -1)),
          _[10] || (_[10] = E("span", { class: "ce-schema-badge" }, "what you can call", -1))
        ]),
        E("div", Si, [
          X.value ? (C(), P("div", Oi, [
            Q(F(W), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            }),
            E("span", null, J(X.value), 1),
            E("button", {
              type: "button",
              class: "ce-retry",
              onClick: K
            }, "Retry")
          ])) : te.value ? (C(), P("div", Ii, [
            Q(F(W), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            _[11] || (_[11] = E("span", null, "Loading SDK reference…", -1))
          ])) : se.value ? (C(), P("p", xi, "Nothing reachable for the current selection.")) : $.value ? (C(), P(Ye, { key: 3 }, [
            $.value.tools.length ? (C(), P("div", ki, [
              _[14] || (_[14] = E("span", { class: "ce-sublabel" }, "Tools", -1)),
              E("ul", Ci, [
                (C(!0), P(Ye, null, xt($.value.tools, (S) => (C(), P("li", {
                  key: S.id
                }, [
                  E("details", Ni, [
                    E("summary", null, [
                      Q(F(W), {
                        class: "ce-caret",
                        icon: "tabler:chevron-right",
                        "aria-hidden": "true"
                      }),
                      E("code", Ri, J(pe(S)), 1)
                    ]),
                    E("div", Pi, [
                      S.description ? (C(), P("p", Ai, J(S.description), 1)) : de("", !0),
                      E("div", Di, [
                        E("section", Vi, [
                          _[12] || (_[12] = E("span", { class: "ce-schema-label" }, "Input schema", -1)),
                          E("pre", {
                            class: "ce-schema",
                            "aria-label": `Input schema for ${S.label}`
                          }, J(w(S.input_schema, "input")), 9, Li)
                        ]),
                        E("section", Ui, [
                          _[13] || (_[13] = E("span", { class: "ce-schema-label" }, "Output schema", -1)),
                          E("pre", {
                            class: "ce-schema",
                            "aria-label": `Output schema for ${S.label}`
                          }, J(w(S.output_schema, "output")), 9, Mi)
                        ])
                      ])
                    ])
                  ])
                ]))), 128))
              ])
            ])) : de("", !0)
          ], 64)) : de("", !0)
        ])
      ], 32)
    ]));
  }
}), zi = ":root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;color:var(--p-text-color);font:14px/1.4 system-ui,sans-serif}*,*:before,*:after{box-sizing:border-box}.ce{display:flex;flex-direction:column;gap:18px;width:100%;min-width:0;max-width:100%;margin:0}.kx-field{display:flex;flex-direction:column;gap:5px;min-width:0;max-width:100%}.ce-label{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:650;color:var(--p-text-color)}.ce-sublabel{font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.ce-optional{font-weight:400}.ce-hint{margin:0;font-size:12px;line-height:1.5;color:var(--p-text-muted-color)}.kx-input{width:100%;height:36px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;transition:border-color .15s}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-input:focus{outline:none;border-color:var(--p-primary-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-textarea{height:auto;padding:10px;resize:vertical;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px}.ce-intent{min-height:44px;font-family:inherit;font-size:13.5px}.ce-method{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.ce-tool-picker{display:block;width:100%;min-width:0;max-width:100%}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border:1px solid transparent;border-radius:8px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:filter .15s,opacity .15s}.kx-btn:disabled{opacity:.55;cursor:default}.kx-btn svg{width:15px;height:15px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.kx-btn-primary:hover:not(:disabled){filter:brightness(1.05)}.ce-assist-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ce-code{width:100%;min-width:0;max-width:100%;min-height:220px;padding:10px;overflow:auto;resize:vertical;tab-size:2;border:1px solid var(--p-content-border-color);border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent);color:var(--p-text-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;white-space:pre}.ce-code:focus-visible{outline:2px solid var(--p-primary-color);outline-offset:1px}.ce-error{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 35%,transparent);border-radius:8px;color:var(--p-danger-500);font-size:12px}.ce-retry{margin-left:auto;padding:4px 9px;appearance:none;cursor:pointer;border:1px solid var(--p-content-border-color);border-radius:8px;background:transparent;color:var(--p-text-color);font:inherit;font-weight:650}.ce-retry:focus-visible{outline:2px solid var(--p-primary-color);outline-offset:1px}.ce-assist-result{display:grid;gap:8px}.ce-status{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600}.ce-status.ok{color:var(--p-success-500)}.ce-status.bad{color:var(--p-danger-500)}.ce-errors{margin:0;padding:8px 10px 8px 26px;border:1px solid color-mix(in srgb,var(--p-danger-500) 35%,transparent);border-radius:8px;color:var(--p-text-color);font-size:12px;line-height:1.5;list-style:disc}.ce-disclosure{width:100%;min-width:0;max-width:100%;overflow:hidden;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background)}.ce-disclosure>summary{display:flex;align-items:center;gap:8px;min-width:0;max-width:100%;padding:8px 10px;cursor:pointer;color:var(--p-text-color);font-size:13px;font-weight:650;list-style:none;user-select:none}.ce-disclosure>summary::-webkit-details-marker{display:none}.ce-disclosure-body{display:grid;gap:8px;width:100%;min-width:0;max-width:100%;padding:0 10px 10px}.ce-caret{flex:none;color:var(--p-text-muted-color);transition:transform .15s ease}.ce-disclosure[open]>summary .ce-caret{transform:rotate(90deg)}.ce-tool-icon{flex:none;color:var(--p-text-muted-color)}.ce-tool-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ce-schema-badge{flex:none;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color);font-size:10.5px;font-weight:650;letter-spacing:.04em;text-transform:uppercase}.ce-note{display:inline-flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:12px}.ce-empty{margin:0;color:var(--p-text-muted-color);font-size:12px}.ce-sdk-group{display:grid;gap:8px;min-width:0;max-width:100%}.ce-list{display:grid;gap:8px;min-width:0;max-width:100%;margin:0;padding:0;list-style:none}.ce-list>li{min-width:0;max-width:100%}.ce-sig{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px}.ce-tool-desc{margin:0;color:var(--p-text-muted-color);font-size:12px;font-weight:400;line-height:1.5}.ce-schema{width:100%;min-width:0;max-width:100%;max-height:240px;margin:0;padding:10px;overflow:auto;white-space:pre;border:1px solid var(--p-content-border-color);border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent);color:var(--p-text-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.4}.ce-schema-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:2px}.ce-schema-section{display:grid;gap:5px;min-width:0}.ce-schema-label{color:var(--p-text-muted-color);font-size:11px;font-weight:650;text-transform:uppercase;letter-spacing:.04em}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}", ji = {
  type: "object",
  properties: {
    config: { type: "object", description: "Run Code Block config: { code, tool_ids?, method? }." }
  }
};
class Hi extends ni {
  static get wippyConfig() {
    return {
      propsSchema: ji,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: zi
    };
  }
  static get vueConfig() {
    return { rootComponent: $i };
  }
}
eo(import.meta.url, Hi);
