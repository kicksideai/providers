-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}

-- Start timing before the first input and check between complete sources.
function M.new(started)
    local group_started, source_started = started, started
    local longest_source = 0
    return function(now, deadline, single)
        if not deadline then return false end
        if single then return true end
        if not source_started then
            group_started, source_started = now, now
            return false
        end
        longest_source = math.max(longest_source, now - source_started)
        source_started = now
        -- Budget for another input as slow as the longest completed one and
        -- reserve the elapsed preparation time to publish the complete group.
        return deadline - now <= longest_source + (now - group_started)
    end
end

return M
