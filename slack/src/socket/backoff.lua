-- Reconnect pacing for the socket worker. Pure (the rng is injectable) so the
-- jitter is deterministic in tests and the worker stays a thin executor.
-- Exponential backoff with equal jitter keeps many workers from reconnecting in
-- lockstep and avoids hammering apps.connections.open after a drop. Slack Socket
-- Mode has no application-level heartbeat, so this layer only paces reconnects.
local M = {}

M.BASE_MS = 1000   -- first reconnect waits ~0.5-1s
M.CAP_MS = 60000   -- never wait more than 60s between attempts

local function rng_of(rng: any): (() -> number)
    return type(rng) == "function" and rng or math.random
end

-- delay_ms(attempt) -> ms to wait before reconnect attempt `attempt` (1-based).
-- Equal jitter: half + random[0, half], where half = min(cap, base*2^(n-1)) / 2.
-- Never returns 0, so a flapping socket is never hammered.
function M.delay_ms(attempt: any, rng: any): number
    local r = rng_of(rng)
    local n = math.floor(tonumber(attempt) or 1)
    if n < 1 then n = 1 end
    local exp = M.BASE_MS * (2 ^ (n - 1))
    if exp > M.CAP_MS then exp = M.CAP_MS end
    local half = exp / 2
    return math.floor(half + r() * half)
end

return M
