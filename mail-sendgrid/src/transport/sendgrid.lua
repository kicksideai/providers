-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("types")
local mail = require("mail_types")
local delivery = require("delivery")
local settings = require("settings")

local M = {}
local SETTINGS_NS = "kickside.mail.sendgrid"
local TITLE = "SendGrid"

function M.status(): (mail.TransportStatus?, error?)
    local _, err = settings.read_api_key(SETTINGS_NS, TITLE)
    local state, status_err = settings.status_error(err)
    if status_err then return nil, status_err end
    return {title = TITLE, icon = "simple-icons:sendgrid", description = "Deliver mail through SendGrid.",
        settings_ns = SETTINGS_NS, max_recipients = 1000, max_message_bytes = 29999999, idempotent = false,
        ready = state.ready, code = not state.ready and "invalid_config" or nil, reason = state.reason}, nil
end

local function request(key: string, body: string, deadline: string): (mail.HttpResponse?, error?)
    local url, err = settings.endpoint("kickside.mail.sendgrid:endpoints", "api", "exact")
    if err then return nil, err end
    local sent, err = delivery.post(url :: string, body,
        delivery.bearer_json(key), deadline)
    if err then return nil, err end
    local response = sent :: mail.HttpResponse
    if response.status_code ~= 202 then
        local detail = delivery.response_detail(response, key)
        if response.status_code == 401 then return nil, delivery.authorization_refused(401, detail) end
        local hint = delivery.retry_hint(response, "x-ratelimit-reset", "epoch_seconds")
        return nil, delivery.status_error(response.status_code, 413, hint, detail)
    end
    return response, nil
end

local function email_objects(addresses: {string}?): {types.Address}?
    if not addresses or #addresses == 0 then return nil end
    local recipients = {}
    for i, address in ipairs(addresses) do
        recipients[i] = {email = address}
    end
    return recipients
end

local function encode_attachments(attachments: {mail.Attachment}?): ({types.Attachment}?, error?)
    if not attachments or #attachments == 0 then return nil, nil end
    local encoded = {}
    for i, attachment in ipairs(attachments) do
        local content, err = delivery.encode_attachment(attachment.content)
        if err then
            return nil, err
        end
        encoded[i] = {
            content = content :: string,
            filename = attachment.filename,
            type = attachment.content_type,
            disposition = attachment.disposition,
            content_id = attachment.content_id,
        }
    end
    return encoded, nil
end

function M.send(input: mail.TransportRequest): (mail.TransportResult?, error?)
    local key, key_err = settings.read_api_key(SETTINGS_NS, TITLE)
    if key_err then return nil, key_err end

    local content: {types.ContentPart} = {}
    if input.text and input.text ~= "" then
        content[#content + 1] = {type = "text/plain", value = input.text}
    end
    if input.html and input.html ~= "" then
        content[#content + 1] = {type = "text/html", value = input.html}
    end

    local attachments, attachment_err = encode_attachments(input.attachments)
    if attachment_err then return nil, attachment_err end
    local body, body_err = delivery.encode_message({
        personalizations = {{to = email_objects(input.to), cc = email_objects(input.cc), bcc = email_objects(input.bcc)}},
        from = {email = input.from.address, name = input.from.name},
        reply_to = input.reply_to and {email = input.reply_to} or nil,
        subject = input.subject,
        content = content,
        attachments = attachments,
    })
    if body_err then
        return nil, body_err
    end

    local response, err = request(key :: string, body :: string, input.deadline)
    if err then return nil, err end
    for name, value in pairs(response.headers) do
        if name:lower() == "x-message-id" and type(value) == "string" and value:find("%S") then
            return {provider_message_id = value}, nil
        end
    end
    return {}, nil
end

return M
