-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")

local function run(input)
    local event = input.event
    local marker = event.body.timeout_until_event_type
    if marker then
        local db = assert(sql.get("app:db"))
        local rows = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 AND type=$2",
            { event.body.kb_id, marker }))
        assert(select(2, db:release()) == nil)
        if #rows == 0 then return { error = "extractor timeout", retryable = true } end
        return {}
    end
    return event.body.result
end

return { run = run }
