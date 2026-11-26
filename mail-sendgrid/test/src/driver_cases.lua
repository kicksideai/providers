-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
local base64 = require("base64")
local json = require("json")
local fixture = require("fixture")

local BINDING = "kickside.mail.sendgrid:transport"
local ADMISSION = "kickside.mail.sendgrid.security:transport_open"

local function configure(settings)
    return assert(fixture.probe(fixture.member("app:fixture_admins"), "configure", {settings = settings}))
end

local function send(actor, message)
    return fixture.probe(actor, "send", {message = message})
end

local function transport(input)
    input.from = {address = "sender@example.org"}
    return fixture.probe(fixture.member("app:fixture_admins"), "transport", {message = input})
end

local function sendgrid_status(delivery)
    for _, status in ipairs(delivery.transports) do
        if status.id == BINDING then return status end
    end
    return nil
end

local function fixture_message(subject)
    return {to = {"recipient@example.org"}, subject = subject .. " " .. uuid.v4(), text = "Hello"}
end

local function requests(method, subject)
    local volume = assert(fs.get("app:sendgrid_requests"))
    local matches = {}
    for file in assert(volume:readdir(".")) do
        local request = assert(json.decode(assert(volume:readfile(file.name))))
        if request.method == method and (not subject or (request.payload and request.payload.subject == subject)) then
            matches[#matches + 1] = request
        end
    end
    return matches
end

local function library_logo()
    local assets = assert(fs.get("kickside.mail.views:asset_files"))
    return assert(base64.encode(assert(assets:readfile("logo.png"))))
end

local function configured_sender()
    local owner = fixture.user()
    local configured = configure({
        ["kickside.mail"] = {driver = "kickside.mail.sendgrid:transport", from_address = "sender@example.org",
            from_name = 'Support, "North"', reply_to = "default@example.org"},
        ["kickside.mail.sendgrid"] = {api_key = "sg_fixture"},
    })
    test.is_true(configured.success, configured.error)
    return owner
end

return {
    BINDING = BINDING,
    ADMISSION = ADMISSION,
    configure = configure,
    send = send,
    transport = transport,
    delivery_admin = fixture.delivery_admin,
    sendgrid_status = sendgrid_status,
    fixture_message = fixture_message,
    requests = requests,
    library_logo = library_logo,
    configured_sender = configured_sender,
}
