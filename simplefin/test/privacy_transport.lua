-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local api = require("api")
local fixture = require("fixture")
local M = {accounts = api.accounts}
function M.exchange() return fixture.secret, nil end
function M.claimed_context(value) return {access_url = value} end
function M.persist_context() return true, nil end
function M.connect() return {base_url = "https://bridge.example/simplefin", authorization = "Basic fixture"}, nil end
return M
