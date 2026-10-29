-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local types = require("types")

local M = {}

local PERSONAL_KINDS = {profile_slot = true, preference = true, plan = true, fact = true}

function M.is_statement(message: any, agent_id: string?): boolean
    local author = message.author
    if type(author) ~= "table" then return false end
    if author.kind == "document" then return true end
    if author.kind == "system" then return message.role == "tool" end
    if author.kind == "user" then return type(author.id) == "string" and author.id ~= "" end
    if author.kind == "agent" then return type(agent_id) == "string" and agent_id ~= "" and author.id == agent_id end
    return false
end

function M.scope_family(candidate: any, author: any, owner_id: string?): string
    if type(owner_id) == "string" and owner_id ~= "" and PERSONAL_KINDS[candidate.kind]
        and type(author) == "table" and author.kind == "user" and author.id == owner_id then
        return types.SCOPE.OWNER
    end
    if type(owner_id) == "string" and owner_id ~= "" and type(author) == "table" and author.kind == "document"
        and candidate.kind == types.KIND.FACT then
        return types.SCOPE.OWNER
    end
    return types.SCOPE.AGENT
end

function M.conversation(span: { any }, context: { any }?, agent_id: string?): string
    local lines: { string } = {}
    for _, message in ipairs(context or {}) do
        lines[#lines + 1] = string.format("(%s, preceding context only) %s", message.role, message.text)
    end
    for _, message in ipairs(span) do
        if M.is_statement(message, agent_id) then
            lines[#lines + 1] = string.format("[%s][%s][%s] %s", message.id, message.created_at or "", message.role ..
                (type(message.author) == "table" and ("; author=" .. message.author.kind .. ":" .. tostring(message.author.id or "")) or ""), message.text)
        else
            lines[#lines + 1] = string.format("(%s, context only) %s", message.role, message.text)
        end
    end
    return table.concat(lines, "\n")
end

return M
