-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")

local function embed(args)
    local db = assert(sql.get("app:db"))
    local states = assert(db:query("SELECT online FROM kb10_checkpoint_model WHERE model=$1", {args.model}))
    local failed = tonumber(states[1].online) == 0
        and tostring(args.input[1]):find("queued replacement", 1, true) ~= nil
    assert(db:execute([[UPDATE kb10_checkpoint_model SET calls=calls+1, failures=failures+$1 WHERE model=$2]],
        {failed and 1 or 0, args.model}))
    db:release()
    if failed then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "fixture model provider cannot be reached", details = {code = "checkpoint_fixture_outage"}})
    end
    local vectors = {}
    for _, input in ipairs(args.input) do
        local vector = {}
        for i = 1, 512 do vector[i] = i == 1 and #input / 1024 or 0 end
        vectors[#vectors + 1] = vector
    end
    return {success = true, result = {embeddings = vectors}}, nil
end

return {embed = embed, status = function() return {success = true} end}
