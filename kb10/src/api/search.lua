local http = require("http")
local security = require("security")
local component = require("component")
local query_params = require("query_params")
local http_errors = require("http_errors")

local QUERYABLE_CONTRACT = "kickside.contract:queryable"
local MAX_QUERY_BYTES = 8192

-- In-KB semantic search on the kb10 domain. Resolves the KB's queryable binding
-- through the component contract (component.open sets the component_id context
-- and validates READ access) and runs the engine's two-stage adaptive query.
-- It never touches the persist store directly.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local kb_id = req:param("id")
    if not kb_id or kb_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "knowledge base id is required" })
        return
    end

    local query_text = req:query("q")
    if not query_text or query_text == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query is required" })
        return
    end
    if #query_text > MAX_QUERY_BYTES then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query must be at most " .. MAX_QUERY_BYTES .. " bytes" })
        return
    end

    local limit, limit_err = query_params.query_int(req, "limit", 10, 1, 50)
    if limit_err then
        query_params.bad_request(res, limit_err)
        return
    end

    -- component.open validates READ access for the actor, binds component_id into
    -- the contract context, and resolves the KB's queryable impl binding.
    local inst, open_err = component.open(kb_id, component.ACCESS.READ, QUERYABLE_CONTRACT)
    if open_err or not inst then
        local status, classification = http_errors.classify(open_err)
        local msg = classification.kind ~= nil and open_err:message() or tostring(open_err or "failed to open knowledge base")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local result, query_err = inst:query({ query = query_text, limit = limit })
    if query_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "search failed: " .. tostring(query_err) })
        return
    end
    if not result or not result.success then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json(result or { success = false, error = "search failed" })
        return
    end

    -- Normalize the contract's { items = [{ id, content, meta }] } into the
    -- ranked-results shape the UI renders.
    local results = {}
    for _, item in ipairs(result.items or {}) do
        local meta = item.meta or {}
        table.insert(results, {
            id = item.id,
            content = item.content or "",
            node_type = meta.node_type,
            parent_id = meta.parent_id,
            score = meta.similarity,
            similarity = meta.similarity,
            llm_score = meta.llm_score,
            metadata = meta.metadata,
        })
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        query = query_text,
        results = results,
        count = #results,
    })
end

return { handler = handler }
