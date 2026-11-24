-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env = require("env")
local registry = require("registry")
local fs = require("fs")
local io = require("io")
local fixture = require("fixture")

local function checked(value, err, action)
    if not err and value then return value end
    local details = err and err:details()
    local code = details and details.code or (err and err:kind() or "missing_result")
    error("Live Mailgun " .. action .. " failed | " .. code)
end

local function required_env(id)
    local value, err = env.get(id)
    if err or type(value) ~= "string" or value == "" then
        error("Live Mailgun environment is incomplete")
    end
    return value
end

local function main()
    local endpoints = assert(registry.get("kickside.mail.mailgun:endpoints"))
    if endpoints.data.endpoints.us ~= "https://api.mailgun.net" then
        error("Live notice requires the Mailgun US endpoint")
    end

    local api_key = required_env("app.live:api_key")
    local domain = required_env("app.live:domain")
    local from = required_env("app.live:from")
    local to = required_env("app.live:to")
    local id = "a5c66173-40ac-41df-91b0-e438a913f900"
    local owner = fixture.user(id)
    local configured, config_err = fixture.probe(fixture.admin(id), "configure", {settings = {
        ["kickside.mail"] = {driver = "mailgun", from_address = from, from_name = "KickSide"},
        ["kickside.mail.mailgun"] = {api_key = api_key, domain = domain, region = "us"},
    }})
    assert(checked(configured, config_err, "settings").success, configured.error)

    local files = assert(fs.get("app.live:artifacts"))
    local function store(filename, content_type)
        local bytes = assert(files:readfile(filename))
        local upload, err = fixture.probe(owner, "store", {bytes = bytes, filename = filename, content_type = content_type})
        return checked(upload, err, "upload").uuid
    end

    local result, err = fixture.probe(owner, "send", {
        message = {
            to = {to},
            template = "notice",
            vars = {
                subject = "Your workspace activity report is ready",
                preheader = "See the weekly activity summary and open the attached PDF.",
                heading = "Your weekly report is ready",
                message = "Your workspace activity report for November 16–22 is ready. It brings together the week’s completed work and activity trends.",
                paragraphs = {
                    "Open the online report to explore the activity by day, or share the attached PDF with your team.",
                },
                action_url = "https://example.org/reports/weekly?period=2026-11-16",
                action_label = "Open the report",
                inline_content_id = "weekly-activity",
                image_alt = "Weekly activity chart beside a Report ready checkmark",
                details = {
                    {key = "Reporting period", value = "November 16–22, 2026"},
                    {key = "Report status", value = "Ready to share"},
                    {key = "Attachment", value = "report.pdf"},
                },
            },
            attachments = {
                {upload_id = store("activity-banner.png", "image/png"), disposition = "inline", content_id = "weekly-activity"},
                {upload_id = store("report.pdf", "application/pdf")},
            },
        },
    })
    local queued = checked(result, err, "admission")
    local sent = fixture.terminal(fixture.admin(id), queued.message_id, 180)
    local id = sent.provider_message_id
    if not id then
        io.print("Mailgun HTTP 200 | accepted")
        return 0
    end
    if not id:match("^<?[^%s<>@]+@[^%s<>@]+>?$") or id:find(api_key, 1, true) then
        error("Mailgun HTTP 200 | Unexpected message ID format")
    end
    io.print("Mailgun HTTP 200 | Message-ID " .. id)
    return 0
end

return {main = main}
