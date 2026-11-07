import k from "primevue/config";
import O from "primevue/contextmenu";
import x from "primevue/menu";
import A from "primevue/portal";
import { renderSlot as h, createCommentVNode as S, h as E, Teleport as M } from "vue";
const R = "data-wippy-overlay-layer";
function P() {
  return typeof window < "u" && typeof window.document < "u";
}
function T() {
  return P() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function N() {
  return T() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const $ = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let H = 0;
const s = /* @__PURE__ */ new WeakMap();
function m(t, e) {
  const o = t.style;
  o.setProperty("position", "fixed", "important"), o.setProperty("inset", "auto", "important"), o.setProperty("margin", "0", "important"), o.setProperty("position-anchor", e), o.setProperty("position-area", "bottom span-right"), o.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), o.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), o.setProperty("max-width", "stretch", "important");
}
function _(t, e) {
  if (!$.test(t.className))
    return;
  const o = t.style.cssText;
  m(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = o;
    return;
  }
  if (!s.has(t)) {
    const i = new MutationObserver(() => {
      const n = t.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && m(t, e);
    });
    i.observe(t, { attributes: !0, attributeFilter: ["style"] }), s.set(t, i);
  }
}
function p(t) {
  const e = s.get(t);
  e && (e.disconnect(), s.delete(t));
}
function V(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function a(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new WeakMap();
let y = !1, u = !1;
function z() {
  u = !1;
  for (const t of c) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && p(e);
      c.delete(t), l.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && a(t);
  }
}
function g() {
  u || (u = !0, requestAnimationFrame(z));
}
function F(t) {
  const e = document.createElement("div");
  e.setAttribute(R, "");
  const o = T();
  if (e.style.cssText = o ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", o && e.setAttribute("popover", "manual"), t.appendChild(e), o) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  a(e);
  const i = new MutationObserver((n) => {
    const d = e.__wippyAnchorName;
    for (const f of n) {
      if (d)
        for (const r of Array.from(f.addedNodes))
          r instanceof HTMLElement && _(r, d);
      for (const r of Array.from(f.removedNodes))
        r instanceof HTMLElement && p(r);
    }
    e.isConnected && e.childElementCount > 0 && a(e);
  });
  return i.observe(e, { childList: !0 }), l.set(e, i), c.add(e), y || (y = !0, window.addEventListener("scroll", g, { capture: !0, passive: !0 }), window.addEventListener("resize", g, { passive: !0 })), e;
}
function w(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = F(t.hostRoot), N())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++H}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function b(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && p(e);
    c.delete(t.layer), l.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let C = !1;
function W() {
  if (C)
    return;
  const t = x;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), i = this.container && !o.includes(this.container), n = !(this.target && o.includes(this.target));
      this.overlayVisible && i && n ? this.hide() : !this.popup && i && n && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, C = !0);
}
let L = !1;
function Y() {
  if (L)
    return;
  const t = O;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), i = this.container && !o.includes(this.container), n = this.visible ? !(this.target && o.includes(this.target)) : !0;
      i && n && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, L = !0);
}
let v = !1;
function q() {
  if (v)
    return;
  v = !0;
  const t = A;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    P() && (this.hostRoot = V(this.$el), this.mounted = !0, this.hostRoot && (this.inline || w(this), this.$watch("inline", (e) => {
      e ? b(this) : w(this);
    })));
  }, t.render = function() {
    return this.inline ? h(this.$slots, "default", { key: 0 }) : this.mounted ? E(M, { key: 1, to: this.resolvedTarget || document.body }, [
      h(this.$slots, "default")
    ]) : S("", !0);
  }, t.unmounted = function() {
    b(this);
  };
}
const G = {
  install: (t) => {
    W(), Y(), q(), t.use(k, { theme: "none" });
  }
};
export {
  G as P
};
//# sourceMappingURL=primevue-plugin-CaP7wV_M.js.map
