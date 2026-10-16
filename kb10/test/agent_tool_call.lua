local M = {}

function M.fetch_url(args: {[string]: any}?)
    local agent_fetch_url = require("agent_fetch_url")
    return agent_fetch_url.handle(args or {})
end

function M.embed_content(args: {[string]: any}?)
    local agent_embed_content = require("agent_embed_content")
    return agent_embed_content.handle(args or {})
end

function M.delete_content(args: {[string]: any}?)
    local agent_delete_content = require("agent_delete_content")
    return agent_delete_content.handle(args or {})
end

function M.select_kb(args: {[string]: any}?)
    local agent_select_kb = require("agent_select_kb")
    return agent_select_kb.handle(args or {})
end

return M
