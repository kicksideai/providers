import { W as A, u as E } from "./wc-runtime-CNDpK4lj.js";
import M from "primevue/config";
import R from "primevue/contextmenu";
import N from "primevue/menu";
import $ from "primevue/portal";
import { renderSlot as m, createCommentVNode as z, h as i, Teleport as H, defineAsyncComponent as V, defineComponent as _, onMounted as j } from "vue";
import { Icon as y } from "@iconify/vue";
import { define as W } from "@wippy-fe/proxy";
const F = "data-wippy-overlay-layer";
function S() {
  return typeof window < "u" && typeof window.document < "u";
}
function T() {
  return S() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function I() {
  return T() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const q = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Y = 0;
const a = /* @__PURE__ */ new WeakMap();
function g(t, e) {
  const o = t.style;
  o.setProperty("position", "fixed", "important"), o.setProperty("inset", "auto", "important"), o.setProperty("margin", "0", "important"), o.setProperty("position-anchor", e), o.setProperty("position-area", "bottom span-right"), o.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), o.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), o.setProperty("max-width", "stretch", "important");
}
function B(t, e) {
  if (!q.test(t.className))
    return;
  const o = t.style.cssText;
  g(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = o;
    return;
  }
  if (!a.has(t)) {
    const n = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && g(t, e);
    });
    n.observe(t, { attributes: !0, attributeFilter: ["style"] }), a.set(t, n);
  }
}
function l(t) {
  const e = a.get(t);
  e && (e.disconnect(), a.delete(t));
}
function U(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function p(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new WeakMap();
let x = !1, d = !1;
function D() {
  d = !1;
  for (const t of c) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && l(e);
      c.delete(t), u.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && p(t);
  }
}
function b() {
  d || (d = !0, requestAnimationFrame(D));
}
function K(t) {
  const e = document.createElement("div");
  e.setAttribute(F, "");
  const o = T();
  if (e.style.cssText = o ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", o && e.setAttribute("popover", "manual"), t.appendChild(e), o) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  p(e);
  const n = new MutationObserver((r) => {
    const h = e.__wippyAnchorName;
    for (const f of r) {
      if (h)
        for (const s of Array.from(f.addedNodes))
          s instanceof HTMLElement && B(s, h);
      for (const s of Array.from(f.removedNodes))
        s instanceof HTMLElement && l(s);
    }
    e.isConnected && e.childElementCount > 0 && p(e);
  });
  return n.observe(e, { childList: !0 }), u.set(e, n), c.add(e), x || (x = !0, window.addEventListener("scroll", b, { capture: !0, passive: !0 }), window.addEventListener("resize", b, { passive: !0 })), e;
}
function v(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = K(t.hostRoot), I())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Y}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function w(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && l(e);
    c.delete(t.layer), u.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let C = !1;
function X() {
  if (C)
    return;
  const t = N;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), n = this.container && !o.includes(this.container), r = !(this.target && o.includes(this.target));
      this.overlayVisible && n && r ? this.hide() : !this.popup && n && r && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, C = !0);
}
let k = !1;
function G() {
  if (k)
    return;
  const t = R;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), n = this.container && !o.includes(this.container), r = this.visible ? !(this.target && o.includes(this.target)) : !0;
      n && r && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, k = !0);
}
let L = !1;
function J() {
  if (L)
    return;
  L = !0;
  const t = $;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    S() && (this.hostRoot = U(this.$el), this.mounted = !0, this.hostRoot && (this.inline || v(this), this.$watch("inline", (e) => {
      e ? w(this) : v(this);
    })));
  }, t.render = function() {
    return this.inline ? m(this.$slots, "default", { key: 0 }) : this.mounted ? i(H, { key: 1, to: this.resolvedTarget || document.body }, [
      m(this.$slots, "default")
    ]) : z("", !0);
  }, t.unmounted = function() {
    w(this);
  };
}
const Q = {
  install: (t) => {
    X(), G(), J(), t.use(M, { theme: "none" });
  }
}, Z = 3e4, P = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", tt = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function et(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function ot(t, e, o) {
  const n = o();
  j(() => n("error", { message: t, error: e }));
}
function rt(t, e, o) {
  return V({
    loader: t,
    loadingComponent: {
      render: () => i("span", {
        role: "status",
        "aria-label": e.loading,
        style: `${P}color:var(--p-text-muted-color);`
      }, i("span", { style: "display:inline-flex;", onVnodeMounted: et }, i(y, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: _({
      props: { error: { type: Error, required: !0 } },
      setup(n) {
        return ot(e.failed, n.error, o), () => i("span", {
          role: "alert",
          title: e.iconOnly ? e.failed : void 0,
          style: `${P}color:var(--p-danger-500);`
        }, e.iconOnly ? [i(y, { icon: "tabler:alert-circle", "aria-hidden": "true" }), i("span", { style: tt }, e.failed)] : e.failed);
      }
    }),
    delay: 200,
    timeout: Z,
    suspensible: !1
  });
}
const nt = ":host,.hs{--hs-bg: var(--p-content-background);--hs-surface: color-mix(in srgb, var(--p-text-color) 5%, var(--p-content-background));--hs-border: var(--p-content-border-color);--hs-text: var(--p-text-color);--hs-muted: var(--p-text-muted-color);--hs-primary: var(--p-primary-color);--hs-danger: var(--p-danger-500);font-family:Inter,system-ui,-apple-system,sans-serif;color:var(--hs-text)}.hs{display:flex;flex-direction:column;gap:12px}.hs-field{display:flex;flex-direction:column;gap:4px;font-size:13px}.hs-field>span{color:var(--hs-muted)}.hs-field wc-connection-picker,.hs-field .p-select{width:100%}.hs-field .p-select{padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-bg);color:var(--hs-text);font-size:14px}.hs-hint{margin:0;font-size:13px;color:var(--hs-muted)}.hs-error{margin:0;font-size:13px;color:var(--hs-danger)}.hs-summary{display:flex;gap:8px;align-items:center;min-height:24px;padding:8px 10px;border:1px solid var(--hs-border);border-radius:8px;background:var(--hs-surface);font-size:13px}.hs-dot{width:8px;height:8px;border-radius:999px;background:var(--hs-primary);flex:0 0 auto}:host>div:empty,:host>div:has(>[role=status]){min-height:227px}", it = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Current source/sink config containing connection_id and object_type." } } } }, st = {
  wippy: it
}, at = rt(
  () => import("./HubSpotPicker-BcIlDVKp.js"),
  {
    loading: "Loading HubSpot picker…",
    failed: "Could not load the HubSpot picker. Reload the page to try again."
  },
  E
);
class O extends A {
  static get wippyConfig() {
    return {
      propsSchema: st.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: nt
    };
  }
  static get vueConfig() {
    return { rootComponent: at, plugins: [Q] };
  }
}
async function yt() {
  return O;
}
W(import.meta.url, O);
export {
  yt as webComponent
};
//# sourceMappingURL=picker.js.map
