-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("types")
local mail = require("mail_types")
local delivery = require("delivery")
local uuid = require("uuid")
local message = require("message")
local validate = require("validate")
local settings = require("settings")

local M = {}
local MIME_TOKEN = "[%w!#$%%&'*+.^_`|~%-]+"

local function response_error(response: mail.HttpResponse): error
    local status = response.status_code
    local hint = delivery.retry_hint(response, "x-ratelimit-reset", "epoch_milliseconds")
    if status == 420 then
        return delivery.failure(errors.RATE_LIMITED, "rate_limited", "Mail sending rate limit exceeded", true, status, hint)
    end
    if status == 403 then
        return delivery.failure(errors.PERMISSION_DENIED, "sender_or_recipient_not_allowed",
            "The mail service did not allow the sender or recipient", false, status)
    end
    return delivery.status_error(status, 413, hint)
end

local function configuration(): (types.Config?, error?)
    local values, err = settings.read("kickside.mail.mailgun")
    if err then return nil, err end
    values = values :: types.Settings
    local key, key_err = settings.api_key(values)
    if key_err then return nil, key_err end
    if not values.domain or not values.domain:find("%S") then
        return nil, settings.missing("The active mail driver requires a sending domain")
    end
    if not validate.is_domain(values.domain) then
        return nil, settings.missing("The mail sending domain is invalid")
    end
    if not validate.is_region(values.region) then
        return nil, settings.missing("The mail sending region is invalid")
    end
    return {key = key, domain = values.domain, region = values.region}, nil
end

function M.available(): (mail.Availability?, error?)
    local _, err = configuration()
    return settings.available(err)
end

local function request(config: types.Config, body: string, content_type: string): (mail.HttpResponse?, error?)
    local url, url_err = settings.endpoint("kickside.mail.mailgun:endpoints", config.region)
    if url_err then return nil, url_err end
    local sent, err = delivery.post(url .. "/v3/" .. config.domain .. "/messages", body,
        {["Content-Type"] = content_type}, {user = "api", pass = config.key})
    if err then return nil, err end
    local response = sent :: mail.HttpResponse
    if response.status_code ~= 200 then
        return nil, response_error(response)
    end
    return response, nil
end

local function multipart(input: mail.TransportRequest, from: string): (string?, string?, error?)
    local boundary = "mailgun-" .. uuid.v4()
    local chunks = {}
    local function part(name: string, bytes: string, filename: string?, content_type: string?)
        local disposition = 'Content-Disposition: form-data; name="' .. name .. '"'
        if filename then
            local quoted = filename:gsub('[\\"]', "\\%0")
            disposition = disposition .. '; filename="' .. quoted .. '"\r\nContent-Type: ' .. content_type
        end
        chunks[#chunks + 1] = "--" .. boundary .. "\r\n" .. disposition .. "\r\n\r\n"
        chunks[#chunks + 1] = bytes
        chunks[#chunks + 1] = "\r\n"
    end

    part("from", from)
    for _, field in ipairs({"to", "cc", "bcc"}) do
        for _, address in ipairs(input[field] or {}) do
            part(field, address)
        end
    end
    for _, field in ipairs({"subject", "text", "html"}) do
        local value = input[field]
        if value and value ~= "" then part(field, value) end
    end
    if input.reply_to then part("h:Reply-To", input.reply_to) end

    local content_ids = {}
    for _, attachment in ipairs(input.attachments or {}) do
        local filename = attachment.filename
        if attachment.disposition == "inline" then
            -- Mailgun uses the part's filename as the Content-ID.
            filename = attachment.content_id
            if type(filename) ~= "string" or not filename:match("^[%w._@+%-]+$") or content_ids[filename:lower()] then
                return nil, nil, delivery.failure(errors.INVALID, "invalid_content_id", "Mail requires distinct and valid inline content IDs", false)
            end
            content_ids[filename:lower()] = true
        end
        local content_type = attachment.content_type
        local media, parameters = content_type:match("^(" .. MIME_TOKEN .. "/" .. MIME_TOKEN .. ")(.*)$")
        if not filename:find("%S") or filename:find("%c") or content_type:find("%c")
            or not media or (parameters ~= "" and not parameters:match("^ *;")) then
            return nil, nil, delivery.failure(errors.INVALID, "invalid_attachment", "Mail attachment filename or media type is invalid", false)
        end
        part(attachment.disposition, attachment.content, filename, content_type)
    end
    chunks[#chunks + 1] = "--" .. boundary .. "--\r\n"
    return table.concat(chunks), "multipart/form-data; boundary=" .. boundary, nil
end

function M.send(input: mail.TransportRequest): (mail.TransportResult?, error?)
    local config, config_err = configuration()
    if config_err then return nil, config_err end
    local body, content_type, body_err = multipart(input, message.mailbox(input.from))
    if body_err then return nil, body_err end

    local response, err = request(config, body :: string, content_type :: string)
    if err then return nil, err end
    return delivery.message_id(response :: mail.HttpResponse)
end

return M
