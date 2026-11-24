-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("types")
local mail = require("mail_types")
local delivery = require("delivery")
local error_envelope = require("error_envelope")
local json = require("json")
local message = require("message")
local settings = require("settings")

local M = {}

local function response_error(response: mail.HttpResponse): error
    local status, body = response.status_code, response.body
    local hint = delivery.retry_hint(response, "ratelimit-reset", "seconds")
    if status == 409 or status == 429 then
        local decoded, err = json.decode(body)
        if err then
            if status == 409 then
                return delivery.invalid_response(err, "The mail service returned an invalid conflict response", status)
            end
            return error_envelope.wrap(delivery.status_error(status, 422, hint),
                "Cannot decode Resend rate limit details", {response_error = error_envelope.encode(err)})
        end
        if type(decoded) == "table" then
            local code = (decoded :: types.ErrorResponse).name
            if status == 409 and code == "concurrent_idempotent_requests" then
                return delivery.failure(errors.CONFLICT, "send_in_progress", "A request with this key is in progress", true, status, hint)
            end
            if status == 409 and code == "invalid_idempotent_request" then
                return delivery.failure(errors.CONFLICT, "idempotency_conflict", "This key already identifies a different request", false, status)
            end
            if status == 429 and (code == "daily_quota_exceeded" or code == "monthly_quota_exceeded") then
                return delivery.failure(errors.RATE_LIMITED, "quota_exhausted", "The mail service sending quota is exhausted", false, status)
            end
        end
    end
    return delivery.status_error(status, 422, hint)
end

function M.available(): (mail.Availability?, error?)
    local _, err = settings.read_api_key("kickside.mail.resend")
    return settings.available(err)
end

local function request(api_key: string, body: string, key: string?): (mail.HttpResponse?, error?)
    local url, url_err = settings.endpoint("kickside.mail.resend:endpoints", "api")
    if url_err then return nil, url_err end
    local headers = {Authorization = "Bearer " .. api_key, ["Content-Type"] = "application/json"}
    if key then headers["Idempotency-Key"] = key end

    local sent, err = delivery.post(url .. "/emails", body, headers)
    if err then return nil, err end
    local response = sent :: mail.HttpResponse
    if response.status_code < 200 or response.status_code >= 300 then
        return nil, response_error(response)
    end
    return response, nil
end

function M.send(input: mail.TransportRequest): (mail.TransportResult?, error?)
    local key, key_err = settings.read_api_key("kickside.mail.resend")
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
        from = message.mailbox(input.from),
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

    local response, err = request(key :: string, body :: string, input.idempotency_key)
    if err then return nil, err end
    return delivery.message_id(response :: mail.HttpResponse)
end

return M
