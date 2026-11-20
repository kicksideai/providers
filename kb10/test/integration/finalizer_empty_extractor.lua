-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")

local function run(input)
    local event = input.event
    local db = assert(sql.get("app:db"))
    local _, err = db:execute("UPDATE kb10_finalizer_empty_source SET calls=calls+1 WHERE id=$1", {event.body.kb_id})
    db:release()
    assert(not err, tostring(err))
    return { documents = {}, deletes = {} }
end

return { run = run }
