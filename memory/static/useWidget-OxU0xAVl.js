import { ref as o, onMounted as u } from "vue";
import { loadByTagName as m } from "@wippy-fe/proxy";
import { e as n } from "./types-DQ01_s6c.js";
function f(r) {
  const e = o(!!customElements.get(r)), t = o("");
  return u(async () => {
    if (!e.value)
      try {
        await m(r, { timeoutMs: 8e3 }), e.value = !0;
      } catch (a) {
        t.value = n(a);
      }
  }), { ready: e, failed: t };
}
export {
  f as u
};
//# sourceMappingURL=useWidget-OxU0xAVl.js.map
