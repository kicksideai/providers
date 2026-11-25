-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local config = require("config")
local delivery = require("delivery")
local mail = require("mail")
local registry = require("registry")

local SETTINGS = "kickside.mail.example"
local TITLE = "Example Relay"
local M = {}

type Config = {key: string, url: string}

local function configuration(): (Config?, error?)
    local key, key_err = config.read_api_key(SETTINGS, TITLE)
    if key_err then return nil, key_err end
    local entry, read_err = registry.get(SETTINGS .. ":endpoints")
    if read_err then return nil, read_err end
    local url: unknown = entry.data.endpoints.api
    if type(url) ~= "string" or url:find("[%c%s#@\\?*]") or not url:match("^https://[^/]+/.+$") then
        return nil, config.missing("Configure an HTTPS delivery URL.", "provider_endpoint_invalid")
    end
    return {key = key :: string, url = url}, nil
end

function M.status(): (mail.TransportStatus?, error?)
    local _, err = configuration()
    local readiness, status_err = config.status_error(err)
    if status_err then return nil, status_err end
    return {title = TITLE, icon = "lucide:mail", description = "Deliver mail through Example Relay.",
        settings_ns = SETTINGS, max_recipients = 100, max_message_bytes = 10000000, idempotent = false,
        ready = readiness.ready, code = not readiness.ready and "invalid_config" or nil, reason = readiness.reason}, nil
end

function M.send(input: mail.TransportRequest): (mail.TransportResult?, error?)
    local endpoint, setup_err = configuration()
    if setup_err then return nil, setup_err end
    local attachments: {mail.Record}?
    if input.attachments and #input.attachments > 0 then
        attachments = {}
        for index, part in ipairs(input.attachments) do
            local encoded, encode_err = delivery.encode_attachment(part.content)
            if encode_err then return nil, encode_err end
            attachments[index] = {filename = part.filename, content_type = part.content_type,
                content_base64 = encoded, disposition = part.disposition, content_id = part.content_id}
        end
    end
    local body, encode_err = delivery.encode_message({from = config.mailbox(input.from),
        to = input.to, cc = input.cc, bcc = input.bcc, reply_to = input.reply_to,
        subject = input.subject, html = input.html, text = input.text, attachments = attachments})
    if encode_err then return nil, encode_err end
    local response, err = delivery.post(endpoint.url, body, delivery.bearer_json(endpoint.key), input.deadline)
    if err then return nil, err end
    if response.status_code < 200 or response.status_code >= 300 then
        return nil, delivery.status_error(response.status_code, 422,
            delivery.retry_hint(response, "x-ratelimit-reset", "epoch_seconds"),
            delivery.response_detail(response, endpoint.key))
    end
    return delivery.message_id(response)
end

return M
