-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local security = require("security")
local contract = require("contract")
local client = require("client")
local settings = require("settings")
local uploads = require("uploads")

local function run(binding, input)
    if input.action == "member_permissions" then
        return {
            database = security.can("db.get", "test.mail_driver_fixture.host:db"),
            storage = security.can("fs.get", "test.mail_driver_fixture.host:uploads"),
            component_env = security.can("env.get", "kickside.component.env:target_db"),
        }
    end
    if input.action == "may_request" then
        return security.can("http_client.request", input.url)
    end
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
    if input.action == "preview_edit" or input.action == "create_resource" or input.action == "delete_resource" then
        local library, err = client.library()
        if err then return nil, err end
        if input.action == "preview_edit" then return library:preview(input.request) end
        if input.action == "create_resource" then return library:create(input.request) end
        return library:delete(input.request)
    end
    if input.action == "status" then
        local transport, err = contract.open(binding)
        if err then return nil, err end
        return transport:status()
    end
    if input.action == "read_settings" then
        local values, err = settings.settings(input.namespace)
        if err then return nil, err end
        return {has_api_key = type(values.api_key) == "string" and values.api_key ~= ""}
    end
    if input.action == "store" then
        local actor = assert(security.actor())
        return uploads.store_file(actor:id(), input.bytes, input.filename, #input.bytes, input.content_type)
    end
    if input.action == "transport" then
        local definition = assert(contract.get("kickside.mail:transport"))
        local transport = assert(definition:open(binding))
        input.message.deadline = input.message.deadline or time.now():add("30s"):utc():format(time.RFC3339)
        return transport:send(input.message)
    end
    local mailer, err = client.mailer()
    if not mailer then return nil, err end
    if input.action == "delivery_status" then return mailer:delivery_status() end
    if input.action == "preview_template" then return mailer:preview(input.request) end
    if input.action == "get_message" then return mailer:get_message(input.message_id) end
    return mailer:send(input.message)
end

return { run = run }
