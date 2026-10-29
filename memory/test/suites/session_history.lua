-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local context_repo = require("context_repo")
local session_repo = require("session_repo")
local writer = require("writer")
local message_handlers = require("message_handlers")
local consts = require("consts")
local uuid = require("uuid")
local contract = require("contract")

local function ensure_session(user_id: string, session_id: string)
    local existing, read_err = session_repo.get(session_id, user_id)
    if existing then return true end
    if read_err ~= "Session not found" then return nil, read_err end

    local context_id, id_err = uuid.v7()
    if not context_id then return nil, id_err end
    local _, context_err = context_repo.create(context_id, "primary", "{}")
    if context_err then return nil, context_err end
    local _, session_err = session_repo.create(session_id, user_id, context_id, "Memory test session", "test", {}, {})
    if session_err then return nil, session_err end
    return true
end

local function input_context(user_id: string, session_id: string, session_writer: any): any
    return {
        session_id = session_id,
        user_id = user_id,
        admission_actor_id = user_id,
        writer = session_writer,
        held = {},
        status = consts.STATUS.IDLE,
        config = {},
        upstream = {
            message_received = function() end,
            command_error = function() end,
        },
    }
end

local function input_type(role: string): string?
    if role == "user" then return consts.MSG_TYPE.USER end
    if role == "developer" then return consts.MSG_TYPE.DEVELOPER end
    if role == "system" then return consts.MSG_TYPE.SYSTEM end
    return nil
end

local function emitted_type(role: string): string?
    if role == "function" then return consts.MSG_TYPE.FUNCTION end
    return nil
end

local function record_one(user_id: string, session_id: string, session_writer: any, message: any)
    if type(message) ~= "table" or type(message.id) ~= "string" or message.id == ""
        or type(message.role) ~= "string" or type(message.content) ~= "string"
        or type(message.author) ~= "table" then
        return nil, "message id, role, content, and author are required"
    end

    local accepted = input_type(message.role)
    if accepted then
        local result, admit_err = message_handlers.handle_message(input_context(user_id, session_id, session_writer), {
            data = { type = accepted, text = message.content },
            author = message.author,
        })
        if not result then return nil, admit_err end
        message.id = result.message_id
        return true
    end

    if message.role == "assistant" then
        if message.author.kind ~= "agent" or type(message.author.id) ~= "string" or message.author.id == "" then
            return nil, "assistant messages require an agent author"
        end
        local message_id, _, write_err = session_writer:add_response(message.content, {
            author = message.author,
            agent_id = message.author.id,
        }, {})
        if write_err then return nil, write_err end
        message.id = message_id
        return true
    end

    local emitted = emitted_type(message.role)
    if not emitted then return nil, "unsupported session message role: " .. message.role end
    local metadata = {}
    for key, value in pairs(message.metadata or {}) do metadata[key] = value end
    metadata.author = message.author
    local message_id, write_err = session_writer:add_message(emitted, message.content, metadata)
    if write_err then return nil, write_err end
    message.id = message_id
    return true
end

local M = {}

function M.record(args: any)
    if type(args) ~= "table" or type(args.user_id) ~= "string" or args.user_id == ""
        or type(args.session_id) ~= "string" or args.session_id == "" or type(args.messages) ~= "table" then
        return nil, "user_id, session_id, and messages are required"
    end
    local _, setup_err = ensure_session(args.user_id, args.session_id)
    if setup_err then return nil, setup_err end
    local session_writer, writer_err = writer.new(args.session_id)
    if not session_writer then return nil, writer_err end
    local event_ids = {}
    for _, message in ipairs(args.messages) do
        local _, record_err = record_one(args.user_id, args.session_id, session_writer, message)
        if record_err then return nil, record_err end
        event_ids[#event_ids + 1] = message.id
    end
    return event_ids
end

function M.read(args: any)
    local definition, definition_err = contract.get("wippy.agent:run_context")
    if not definition then return nil, definition_err end
    local binding, binding_err = definition:open("wippy.session.run_context:binding")
    if not binding then return nil, binding_err end
    return binding:get_history(args)
end

return M
