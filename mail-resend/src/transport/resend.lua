-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("types")
local mail = require("mail_types")
local delivery = require("delivery")
local json = require("json")
local settings = require("settings")

local SETTINGS_NS = "kickside.mail.resend"
local TITLE = "Resend"

local M = {}

local function response_error(response: mail.HttpResponse, api_key: string): error
    local status, body = response.status_code, response.body
    local hint = delivery.retry_hint(response, "ratelimit-reset", "seconds")
    local detail = delivery.response_detail(response, api_key)
    if status == 400 or status == 403 or status == 409 or status == 429 then
        local decoded, err = json.decode(body)
        if err and status == 409 then
            return delivery.failure(errors.INTERNAL, "provider_response_invalid",
                "The mail service returned an invalid conflict response", false, status, nil, detail)
        end
        local code = not err and type(decoded) == "table" and (decoded :: types.ErrorResponse).name or nil
        if status == 400 and code == "validation_error" then
            return delivery.failure(errors.INVALID, "request_rejected", "The mail service refused the request",
                false, status, nil, detail)
        end
        if status == 403 and (code == "restricted_api_key" or code == "suspended_api_key") then
            return delivery.failure(errors.PERMISSION_DENIED, "credentials_invalid",
                "The mail service refused authorization", false, status, nil, detail)
        end
        if status == 403 and code == "validation_error" then
            return delivery.failure(errors.PERMISSION_DENIED, "sender_or_recipient_not_allowed",
                "The mail service did not allow the sender or recipient", false, status, nil, detail)
        end
        if status == 409 and code == "concurrent_idempotent_requests" then
            return delivery.failure(errors.CONFLICT, "send_in_progress", "A request with this key is in progress", true, status, hint, detail)
        end
        if status == 409 and code == "invalid_idempotent_request" then
            return delivery.failure(errors.CONFLICT, "idempotency_conflict", "This key already identifies a different request", false, status, nil, detail)
        end
        if status == 429 and (code == "daily_quota_exceeded" or code == "monthly_quota_exceeded") then
            return delivery.failure(errors.RATE_LIMITED, "quota_exhausted", "The mail service sending quota is exhausted", false, status, nil, detail)
        end
    end
    return delivery.status_error(status, 422, hint, detail)
end

function M.status(): (mail.TransportStatus?, error?)
    local _, err = settings.read_api_key(SETTINGS_NS, TITLE)
    local state, status_err = settings.status_error(err)
    if status_err then return nil, status_err end
    return {title = TITLE, icon = "simple-icons:resend", description = "Deliver mail through Resend.",
        settings_ns = SETTINGS_NS, max_recipients = 50, max_message_bytes = 40000000, idempotent = true,
        ready = state.ready, code = not state.ready and "invalid_config" or nil, reason = state.reason}, nil
end

local function request(api_key: string, body: string, key: string?, deadline: string): (mail.HttpResponse?, error?)
    local url, err = settings.endpoint("kickside.mail.resend:endpoints", "api", "exact")
    if err then return nil, err end
    local headers = delivery.bearer_json(api_key)
    if key then headers["Idempotency-Key"] = key end

    local sent, err = delivery.post(url :: string, body, headers, deadline)
    if err then return nil, err end
    local response = sent :: mail.HttpResponse
    if response.status_code < 200 or response.status_code >= 300 then
        return nil, response_error(response, api_key)
    end
    return response, nil
end

function M.send(input: mail.TransportRequest): (mail.TransportResult?, error?)
    local key, key_err = settings.read_api_key(SETTINGS_NS, TITLE)
    if key_err then return nil, key_err end

    local attachments: {types.Attachment}?
    if input.attachments and #input.attachments > 0 then
        attachments = {}
        for _, attachment in ipairs(input.attachments) do
            local encoded, encode_err = delivery.encode_attachment(attachment.content)
            if encode_err then
                return nil, encode_err
            end
            attachments[#attachments + 1] = {
                filename = attachment.filename,
                content_type = attachment.content_type,
                content = encoded,
                content_id = attachment.disposition == "inline" and attachment.content_id or nil,
            }
        end
    end
    local body, body_err = delivery.encode_message({
        from = settings.mailbox(input.from),
        to = input.to,
        cc = input.cc,
        bcc = input.bcc,
        reply_to = input.reply_to,
        subject = input.subject,
        html = input.html,
        text = input.text,
        attachments = attachments,
    })
    if body_err then return nil, body_err end

    local response, err = request(key :: string, body :: string, input.idempotency_key, input.deadline)
    if err then return nil, err end
    return delivery.message_id(response :: mail.HttpResponse)
end

return M
