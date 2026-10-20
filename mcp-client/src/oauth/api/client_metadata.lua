local http = require("http")
local env = require("env")
local oauth = require("oauth")
local function handler()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    local base = env.get("PUBLIC_API_URL")
    base = type(base) == "string" and base:gsub("/+$", "") or ""
    if not oauth.url(base) then res:set_status(http.STATUS.INTERNAL_ERROR); res:write_json({error = "PUBLIC_API_URL is not configured"}); return end
    res:write_json(oauth.client_metadata(base .. "/api/public/mcp-client/client-metadata.json", base .. "/api/public/oauth/callback"))
end
return {handler = handler}
