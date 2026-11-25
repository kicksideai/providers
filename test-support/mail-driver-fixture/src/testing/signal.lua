-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local pg = require("pg")
local process = require("process")

local SCOPE = "test.mail_driver_fixture.testing:changes"
local GROUP = "mail.driver.fixture.waiters"
local TOPIC = "mail.driver.fixture.changed"

local function subscribe()
    local scope = assert(pg.open(SCOPE))
    local changes = assert(process.listen(TOPIC))
    assert(scope:join(GROUP))
    return changes, function()
        assert(scope:leave(GROUP))
        process.unlisten(changes)
        scope:release()
    end
end

local function publish(topic)
    local scope = assert(pg.open(SCOPE))
    local sent, err = scope:broadcast_local(GROUP, TOPIC, topic)
    scope:release()
    assert(sent, tostring(err))
end

return {subscribe = subscribe, publish = publish}
