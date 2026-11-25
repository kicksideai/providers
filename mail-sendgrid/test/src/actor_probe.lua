-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local security = require("security")
local contract = require("contract")
local client = require("client")
local funcs = require("funcs")
local settings = require("settings")
local uploads = require("uploads")

local function run(input)
    if input.action == "configure" then
        local service = assert(assert(contract.get("kickside.settings:settings")):open())
        for namespace, values in pairs(input.settings) do
            for key, value in pairs(values) do
                local result, err = service:set({namespace = namespace, key = key, value = value})
                if err or not result.success then return result, err end
            end
        end
        return {success = true}
    end
    if input.action == "available" then
        return funcs.call("kickside.mail.sendgrid:available")
    end
    if input.action == "read_settings" then
        return settings.read("kickside.mail.sendgrid")
    end
    if input.action == "store" then
        local actor = assert(security.actor())
        return uploads.store_file(actor:id(), input.bytes, input.filename, #input.bytes, input.content_type)
    end
    if input.action == "get_message" then
        return client.get_message(input.message_id)
    end
    if input.action == "transport" then
        local definition = assert(contract.get("kickside.mail:transport"))
        local transport = assert(definition:open("kickside.mail.sendgrid:transport"))
        input.message.deadline = time.now():add("30s"):utc():format(time.RFC3339)
        return transport:send(input.message)
    end
    if input.action == "write" then
        local writable = assert(assert(contract.get("kickside.data:writable")):open("kickside.mail.sink:writable"))
        return writable:write(input.request)
    end
    return client.send(input.message)
end

return { run = run }
