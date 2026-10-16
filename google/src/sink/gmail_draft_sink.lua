-- Writable Gmail surface for automation. This only creates/updates/deletes
-- drafts; it intentionally has no send operation.
local transport = require("transport")
local gmail = require("gmail")
local hash = require("hash")
local M = {}
local function trim(v)
    return type(v) == "string" and (v:gsub("^%s*(.-)%s*$", "%1")) or ""
end
local function fail(message, retriable, code, scope)
    return {
        success = false,
        error = { code = code or "provider_unavailable", message = tostring(message), retriable = retriable == true, scope = scope or "provider" },
    }
end
local function draft_ref(data, input)
    local message = type(data.message) == "table" and data.message or {}
    return {
        draft_id = trim(data.id or input.draft_id),
        thread_id = trim(message.threadId or input.thread_id),
    }
end
local function requested_draft_id(r, input)
    local ref = type(r.dest_ref) == "table" and r.dest_ref or nil
    if ref == nil and type(r.dest_refs) == "table" then
        local slot = trim(r.map_slot)
        if slot == "" then slot = "default" end
        local receipt = r.dest_refs[slot]
        if type(receipt) == "table" and type(receipt.dest_ref) == "table" then ref = receipt.dest_ref end
    end
    return trim(ref and ref.draft_id or input.draft_id)
end
local function content_digest(input)
    local encoded = {}
    for _, value in ipairs({
        input.to, input.cc, input.bcc, input.subject, input.body, input.html,
    }) do
        local text = type(value) == "string" and value or ""
        encoded[#encoded + 1] = tostring(#text) .. ":" .. text
    end
    local digest, err = hash.sha256(table.concat(encoded))
    if err then return nil, tostring(err) end
    return tostring(digest), nil
end
local function idempotency_message_id(connection_id, key)
    local digest, err = hash.sha256(connection_id .. "\0" .. key)
    if err then return nil, tostring(err) end
    return "<wippy-" .. tostring(digest) .. "@draft.local>", nil
end
local function recovered_draft(gm, conn, message_id, expected_digest)
    local recovered = gm.find_draft_by_message_id(conn, message_id)
    if type(recovered) ~= "table" or recovered.success ~= true then
        return nil, type(recovered) == "table" and recovered.error or "Gmail draft recovery failed"
    end
    if type(recovered.data) ~= "table" then return false, nil end
    local message = type(recovered.data.message) == "table" and recovered.data.message or {}
    local payload = type(message.payload) == "table" and message.payload or {}
    local actual = gm.get_header(payload.headers or {}, "X-Wippy-Idempotency-Digest")
    if trim(actual) ~= expected_digest then
        return nil, "idempotency key was already used with a different Gmail draft payload"
    end
    return draft_ref(recovered.data, {}), nil
end
function M.write(req, deps)
    local r, d = type(req) == "table" and req or {}, type(deps) == "table" and deps or {}
    if trim(r.identity_key) == "" or trim(r.idempotency_key) == "" then
        return fail("identity_key and idempotency_key are required", false, "invalid_request", "item")
    end
    if type(r.input) ~= "table" then return fail("write input must be a record", false, "invalid_request", "item") end
    local tp, gm = d.transport or transport, d.gmail or gmail
    local config, input = type(r.config) == "table" and r.config or {}, type(r.input) == "table" and r.input or {}
    local connection_id = trim(config.connection_id)
    if connection_id == "" then
        return fail("config.connection_id is required", false, "invalid_config", "flow")
    end
    local op = trim(r.sink_op)
    if op == "" then
        op = "create"
    end
    if op ~= "create" and op ~= "update" and op ~= "delete" then
        return fail("gmail draft sink supports create, update, or delete only", false, "invalid_request", "item")
    end
    local conn, cerr = tp.connect(connection_id)
    if cerr or not conn then
        return fail(cerr or "Google connection unavailable", false, "auth_expired", "connection")
    end
    local result
    if op == "delete" then
        local draft_id = requested_draft_id(r, input)
        if draft_id == "" then
            return fail("dest_ref.draft_id or input.draft_id is required", false, "invalid_request", "item")
        end
        result = gm.delete_draft(conn, draft_id)
    else
        if trim(input.to) == "" then
            return fail("input.to is required", false, "invalid_request", "item")
        end
        local message = {
            to = input.to,
            cc = input.cc,
            bcc = input.bcc,
            subject = input.subject,
            body = input.body,
            html = input.html,
        }
        if op == "update" then
            local draft_id = requested_draft_id(r, input)
            if draft_id == "" then
                return fail("dest_ref.draft_id or input.draft_id is required", false, "invalid_request", "item")
            end
            result = gm.update_draft(conn, draft_id, message)
        else
            local key = trim(r.idempotency_key)
            if key == "" then return fail("idempotency_key is required for Gmail draft creation", false, "invalid_request", "item") end
            local digest, digest_err = content_digest(input)
            if not digest then return fail(digest_err or "could not hash Gmail draft", false, "invalid_request", "item") end
            local message_id, message_id_err = idempotency_message_id(connection_id, key)
            if not message_id then return fail(message_id_err or "could not derive Gmail draft identity", false, "invalid_request", "item") end
            local recovered, recovery_err = recovered_draft(gm, conn, message_id, digest)
            if recovery_err then
                local message_text = tostring(recovery_err)
                local conflict = message_text:find("different Gmail draft payload", 1, true) ~= nil
                return fail(message_text, not conflict, conflict and "idempotency_conflict" or "provider_unavailable", conflict and "item" or "provider")
            end
            if recovered then
                return { success = true, result = "replayed", replayed = true, dest_ref = recovered }
            end
            message.message_id = message_id
            message.idempotency_digest = digest
            result = gm.create_draft(conn, message)
        end
    end
    if type(result) ~= "table" or result.success ~= true then
        return fail(type(result) == "table" and result.error or "Gmail draft write failed", true, "provider_unavailable", "provider")
    end
    local data = type(result.data) == "table" and result.data or {}
    return {
        success = true,
        result = op == "delete" and "deleted" or op == "update" and "updated" or "created",
        dest_ref = op == "delete" and nil or draft_ref(data, { draft_id = requested_draft_id(r, input), thread_id = input.thread_id }),
    }
end
return M
