function t(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function o(e) {
  if (t(e)) {
    const r = e.response;
    if (t(r) && t(r.data) && typeof r.data.error == "string") return r.data.error;
    if (typeof e.message == "string") return e.message;
  }
  return String(e);
}
function n(e) {
  return e instanceof CustomEvent && t(e.detail) ? e.detail : {};
}
function s(e) {
  if (e === void 0) return {};
  if (typeof e == "string" && (e = JSON.parse(e)), !t(e)) throw new Error("Memory configuration must be an object");
  return e;
}
function i(e) {
  if (!t(e) || e.type !== "object" || !t(e.properties) || !Object.keys(e.properties).length)
    throw new Error("Memory create schema must supply object properties");
  for (const r of Object.values(e.properties))
    if (!t(r) || !["string", "integer", "number", "boolean"].includes(String(r.type)))
      throw new Error("Memory create schema must supply object properties");
  return { type: "object", properties: e.properties };
}
export {
  i as a,
  n as b,
  o as e,
  t as i,
  s as p
};
//# sourceMappingURL=types-DQ01_s6c.js.map
