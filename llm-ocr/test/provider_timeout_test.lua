-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local ocr = require("ocr")
local llm = require("llm")
local providers = require("providers")
local google_config = require("google_config")
local google_client = require("google_client")

local drivers = {
    {name = "OpenAI", generate = require("openai_generate"), client = require("openai_client")},
    {name = "OpenAI-compatible custom preset", generate = require("compat_generate"), client = require("compat_client")},
    {name = "Anthropic", generate = require("claude_generate"), client = require("claude_client")},
    {name = "Bedrock", generate = require("bedrock_generate"), client = require("bedrock_client")},
    {name = "Google Gemini", generate = require("google_generate"), client = require("generative_ai_client"), google = true},
    {name = "Google Vertex", generate = require("google_generate"), client = require("vertex_client"), google = true},
}

local cases = {
    {name = "supplies a finite default without provider configuration", expected = "600000ms"},
    {name = "inherits a shorter configured provider timeout", configured = 45, expected = "45000ms"},
    {name = "inherits a longer configured provider timeout", configured = 900, expected = "900000ms"},
    {name = "inherits a model route timeout", route = "15m", expected = "900000ms"},
    {name = "treats an empty provider timeout as unset", configured = "", expected = "600000ms"},
    {name = "treats zero OCR timeout as provider configuration", configured = 900, requested = 0, expected = "900000ms"},
    {name = "passes an explicit OCR timeout", requested = "90s", expected = "90000ms"},
    {name = "clamps an explicit OCR timeout to the cap", requested = 900000, expected = "600000ms"},
    {name = "clamps an explicit OCR timeout to one second", requested = 1, expected = "1000ms"},
}

local function check(driver, case)
    local restore = {}
    local function replace(object, key, value)
        local original = object[key]
        restore[#restore + 1] = function() object[key] = original end
        object[key] = value
    end
    local ok, err = pcall(function()
        local context, sent = {}, {}
        replace(llm, "_providers", providers)
        replace(llm, "_usage_tracker", false)
        replace(llm, "_model_resolver", {resolve = function()
            return {name = "ocr-timeout-model", providers = {{id = "ocr-timeout-provider",
                provider_model = "vision-model", context = {timeout = case.route}}}}
        end})
        replace(providers, "_registry", {get = function(id)
            if id == "ocr-timeout-provider" then
                return {meta = {type = "llm.provider"}, data = {driver = {id = "ocr-timeout-driver",
                    options = {api_key = "test-key", base_url = "https://ocr.invalid", retry = false,
                        timeout = case.configured}}}}
            end
            return {meta = {}}
        end})
        replace(providers, "_contract", {get = function()
            return {
                with_context = function(self, values) context = values; return self end,
                open = function()
                    return {generate = function(_, args) return driver.generate.handler(args) end}
                end,
            }
        end})
        local ctx = {all = function() return context end, get = function(key) return context[key] end}
        local env = {get = function() return nil end}
        local http = {post = function(_, options)
            sent[#sent + 1] = options.timeout
            return {status_code = 401, headers = {}, body = '{"error":{"message":"timeout probe"}}'}
        end}
        if driver.google then
            replace(google_config, "_ctx", ctx)
            replace(google_config, "_env", env)
            replace(google_config, "get_oauth2_token", function() return {access_token = "test-token"} end)
            replace(google_config, "get_project_id", function() return "test-project" end)
            replace(google_config, "get_vertex_location", function() return "us-central1" end)
            replace(google_client, "_http_client", http)
            replace(driver.client, "_config", google_config)
            replace(driver.client, "_client", google_client)
            replace(driver.generate, "_ctx", ctx)
            replace(driver.generate, "_contract", {get = function()
                return {with_context = function(self) return self end,
                    open = function() return {request = function(_, args) return driver.client.request(args) end} end}
            end})
        else
            replace(driver.generate, "_client", driver.client)
            replace(driver.client, "_ctx", ctx)
            replace(driver.client, "_env", env)
            replace(driver.client, "_http_client", http)
        end
        if driver.name == "Bedrock" then
            replace(driver.client, "_credentials", {resolve = function()
                return {access_key = "test-access", secret_key = "test-secret"}
            end})
        end
        local text, generate_err = ocr.new().transcribe("image bytes", {model = "ocr-timeout-model", timeout = case.requested})
        test.is_nil(text)
        test.not_nil(generate_err)
        test.eq(#sent, 1, tostring(generate_err))
        test.eq(sent[1], case.expected)
    end)
    for i = #restore, 1, -1 do restore[i]() end
    if not ok then error(err) end
end

return {run = test.run_cases(function()
    test.describe("OCR provider HTTP timeouts", function()
        for _, driver in ipairs(drivers) do
            for _, case in ipairs(cases) do
                test.it(driver.name .. " " .. case.name, function() check(driver, case) end)
            end
        end
    end)
end)}
