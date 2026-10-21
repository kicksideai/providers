-- kickside.data:writable sink that converges items onto Discord channel messages.
-- upsert with no dest_ref posts a new message and returns its id as the dest_ref
-- the engine id-map stores; upsert with a dest_ref edits that message in place;
-- delete removes the message the dest_ref names. Every dest_ref originates from
-- this sink's own posts, so edits/deletes always target bot-authored messages --
-- when Discord still refuses (permissions, someone else's message id passed in
-- directly) the provider error surfaces as-is.
--
-- All requests take the single-attempt client path: a 429 returns a rate_limited
-- DataError with retry_after_ms so the engine reschedules past the wait; nothing
-- sleeps in-process.

local canonical_json = require("canonical_json")
local data_error = require("data_error")
local transport = require("transport")
local types = require("types")

local M = {}

type Deps = {
    transport: any?,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- dest_ref/dest_version alias dest_refs.default per the writable contract.
local function resolve_dest_ref(req: any): any
    if type(req.dest_ref) == "table" then return req.dest_ref end
    local refs = type(req.dest_refs) == "table" and (req.dest_refs :: any) or nil
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    local selected = refs and type(refs[slot]) == "table" and (refs[slot] :: any) or nil
    if selected and type(selected.dest_ref) == "table" then return selected.dest_ref end
    return nil
end

-- The version of the destination message: its edit time, else its create time.
local function dest_version_of(msg: any): string?
    if type(msg) ~= "table" then return nil end
    local edited = (msg :: any).edited_timestamp
    if type(edited) == "string" and edited ~= "" then return edited end
    local created = (msg :: any).timestamp
    if type(created) == "string" and created ~= "" then return created end
    return nil
end

local function upsert(tp: any, conn: any, channel_id: string, req: any, input: any): (any?, error?)
    local content = input.content
    if type(content) ~= "string" or content == "" then
        return data_error.invalid_request("write input.content is required")
    end
    -- No chunking: convergence needs one message per item so the dest_ref stays
    -- a 1:1 identity the engine can edit and delete through.
    if #content > types.MESSAGE_MAX_LENGTH then
        return data_error.invalid_request("content exceeds the Discord message cap of " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters")
    end

    local ref = resolve_dest_ref(req)
    if ref ~= nil then
        local message_id = trim((ref :: any).message_id)
        if message_id == "" then return data_error.invalid_request("dest_ref.message_id is required to edit") end
        local target_channel = trim((ref :: any).channel_id)
        if target_channel == "" then target_channel = channel_id end
        local res, edit_err = tp.edit_channel_message_once(conn, target_channel, message_id, { content = content })
        if edit_err then return nil, edit_err end
        if type(res) ~= "table" or not (res :: any).success then
            return data_error.from_result(res, "edit message")
        end
        return {
            success = true,
            result = "updated",
            dest_ref = { channel_id = target_channel, message_id = message_id },
            dest_version = dest_version_of((res :: any).data),
        }
    end

    -- Every attempt of one (origin, sink_op, idempotency_key) delivery posts
    -- with the same enforced nonce, so Discord answers a retried post with the
    -- message an earlier attempt created instead of posting again.
    local delivery_key, key_err = canonical_json.encode({ origin = trim(req.origin), sink_op = "upsert",
        idempotency_key = trim(req.idempotency_key) })
    if key_err then return nil, key_err end
    local nonce, nonce_err = types.message_nonce(delivery_key :: string)
    if nonce_err then return nil, nonce_err end
    local res, send_err = tp.send_channel_message_once(conn, channel_id,
        { content = content, nonce = nonce, enforce_nonce = true })
    if send_err then return nil, send_err end
    if type(res) ~= "table" or not (res :: any).success then
        return data_error.from_result(res, "send message")
    end
    local message_id = trim(type((res :: any).data) == "table" and ((res :: any).data :: any).id or nil)
    if message_id == "" then
        return data_error.failure("provider_error", "send message: response carried no message id", true, "provider")
    end
    return {
        success = true,
        result = "created",
        dest_ref = { channel_id = channel_id, message_id = message_id },
        dest_version = dest_version_of((res :: any).data),
    }
end

local function delete_message(tp: any, conn: any, channel_id: string, req: any): (any?, error?)
    local ref = resolve_dest_ref(req)
    local message_id = ref ~= nil and trim((ref :: any).message_id) or ""
    if message_id == "" then
        return data_error.invalid_request("delete requires dest_ref.message_id; Discord messages carry no source identity to resolve one from")
    end
    local target_channel = ref ~= nil and trim((ref :: any).channel_id) or ""
    if target_channel == "" then target_channel = channel_id end

    local res, delete_err = tp.delete_channel_message(conn, target_channel, message_id)
    if delete_err then return nil, delete_err end
    if type(res) == "table" and (res :: any).success then
        return { success = true, result = "deleted" }
    end
    -- An already-removed message keeps the delete idempotent: the destination
    -- state the caller asked for holds.
    if type(res) == "table" and tonumber((res :: any).status_code) == 404 then
        return { success = true, result = "deleted" }
    end
    return data_error.from_result(res, "delete message")
end

function M.write(req: any, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    if trim(req.identity_key) == "" or trim(req.idempotency_key) == "" then
        return data_error.invalid_request("identity_key and idempotency_key are required")
    end
    local d = type(deps) == "table" and (deps :: Deps) or {}
    local tp = d.transport or transport

    local config = type(req.config) == "table" and req.config or {}
    local channel_id = trim((config :: any).channel_id)
    if channel_id == "" then return data_error.invalid_config("sink config.channel_id is required") end

    local connection_id = trim((config :: any).connection_id)
    local conn, cerr = tp.connect(connection_id ~= "" and connection_id or nil)
    if cerr then return nil, cerr end

    local sink_op = trim(req.sink_op)
    if sink_op == "" then sink_op = "upsert" end
    if sink_op == "delete" then return delete_message(tp, conn, channel_id, req) end
    if sink_op ~= "upsert" then
        return data_error.invalid_request("unsupported sink operation: " .. sink_op)
    end
    local input = type(req.input) == "table" and req.input or {}
    return upsert(tp, conn, channel_id, req, input)
end

return M
