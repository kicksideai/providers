-- Reconnect + heartbeat pacing for the gateway worker. Pure (the rng is
-- injectable) so the jitter is deterministic in tests and the worker stays a thin
-- executor. Exponential backoff with equal jitter keeps many bots from
-- reconnecting in lockstep and avoids hammering Discord's IDENTIFY limit after a
-- drop (repeated fast IDENTIFYs get a token temporarily banned).
local M = {}

M.BASE_MS = 1000   -- first reconnect waits ~0.5-1s
M.CAP_MS = 60000   -- never wait more than 60s between attempts

local function rng_of(rng: any): (() -> number)
    return type(rng) == "function" and rng or math.random
end

-- delay_ms(attempt) -> ms to wait before reconnect attempt `attempt` (1-based).
-- Equal jitter: half + random[0, half], where half = min(cap, base*2^(n-1)) / 2.
-- Never returns 0, so a flapping gateway is never hammered.
function M.delay_ms(attempt: any, rng: any): number
    local r = rng_of(rng)
    local n = math.floor(tonumber(attempt) or 1)
    if n < 1 then n = 1 end
    local exp = M.BASE_MS * (2 ^ (n - 1))
    if exp > M.CAP_MS then exp = M.CAP_MS end
    local half = exp / 2
    return math.floor(half + r() * half)
end

-- first_heartbeat_ms(interval) -> jittered delay before the FIRST heartbeat, per
-- Discord guidance (jitter * heartbeat_interval, jitter in [0,1)). Subsequent
-- heartbeats use the full interval.
function M.first_heartbeat_ms(interval: any, rng: any): number
    local r = rng_of(rng)
    local i = tonumber(interval) or 0
    if i < 0 then i = 0 end
    return math.floor(i * r())
end

return M
