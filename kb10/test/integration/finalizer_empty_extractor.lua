-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")

local function run(input)
    local event = input.event
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT online FROM kb10_finalizer_empty_source WHERE id=$1", {event.body.kb_id}))
    local _, err = db:execute("UPDATE kb10_finalizer_empty_source SET calls=calls+1 WHERE id=$1", {event.body.kb_id})
    db:release()
    assert(not err, tostring(err))
    if tonumber(assert(rows[1]).online) == 0 then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "empty extractor unavailable"})
    end
    return { documents = {}, deletes = {} }
end

return { run = run }
