-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local types = require("mail_types")
local message = require("message")

local M = {}

function M.is_domain(value: unknown): boolean
    return type(value) == "string" and message.address("x@" .. value)
end

function M.is_region(value: unknown): boolean
    return value == "us" or value == "eu"
end

function M.domain(input: types.SettingInput): types.SettingValidation
    if input.value == "" or M.is_domain(input.value) then return {valid = true} end
    return {valid = false, error = "Enter a valid sending domain"}
end

function M.region(input: types.SettingInput): types.SettingValidation
    if M.is_region(input.value) then return {valid = true} end
    return {valid = false, error = "Choose the US or EU mail region"}
end

return M
