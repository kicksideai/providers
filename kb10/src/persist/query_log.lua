local text_limits = require("text_limits")
local ops = require("ops")
local time = require("time")
local uuid = require("uuid")

local M = { KEEP_PER_STORE = 500, WEAK_TOP_SCORE = 0.35, MAX_QUERY_CHARS = 500 }

local function rows(query: string, params: table): (any, any?)
    local db, err = ops.get_db()
    if err then return nil, errors.wrap(err, "query observations database") end
    local result, query_err = db:query(query, params)
    db:release()
    if query_err then return nil, errors.wrap(query_err, "query observations") end
    return result, nil
end

function M.record(store_id: string, observation: table): (any, any?)
    local db, err = ops.get_db()
    if err then return nil, errors.wrap(err, "query observations database") end
    local now = time.now():utc():format(time.RFC3339)
    local _, insert_err = db:execute(
        "INSERT INTO kb10_query_log(store_id, query, strategy, top_score, results, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        { store_id, text_limits.prefix(observation.query, M.MAX_QUERY_CHARS), observation.strategy, observation.top_score, observation.results, now })
    if insert_err then db:release(); return nil, errors.wrap(insert_err, "record retrieval observation") end
    local _, prune_err = db:execute(
        "DELETE FROM kb10_query_log WHERE store_id = $1 AND id NOT IN (SELECT id FROM kb10_query_log WHERE store_id = $1 ORDER BY id DESC LIMIT $2)",
        { store_id, M.KEEP_PER_STORE })
    if prune_err then db:release(); return nil, errors.wrap(prune_err, "prune retrieval observations") end
    local state, state_err = db:query(
        "INSERT INTO kb10_tuning_state(store_id, observed) VALUES ($1, 1) ON CONFLICT(store_id) DO UPDATE SET observed = kb10_tuning_state.observed + 1 RETURNING *",
        { store_id })
    db:release()
    if state_err then return nil, errors.wrap(state_err, "count retrieval observations") end
    return state[1], nil
end

function M.stats(store_id: string): (any, any?)
    local result, err = rows(
        "SELECT COUNT(*) AS total, AVG(top_score) AS avg_top, SUM(CASE WHEN top_score < $1 OR results = 0 THEN 1 ELSE 0 END) AS weak FROM kb10_query_log WHERE store_id = $2",
        { M.WEAK_TOP_SCORE, store_id })
    if err then return nil, err end
    return result[1], nil
end

function M.weak_samples(store_id: string): (any, any?)
    return rows("SELECT query, top_score, results FROM kb10_query_log WHERE store_id = $1 AND (top_score < $2 OR results = 0) ORDER BY id DESC LIMIT 12", { store_id, M.WEAK_TOP_SCORE })
end

function M.claim(store_id: string, interval: integer): (string?, any?)
    local token = uuid.v7()
    local now = time.now():utc()
    local result, err = rows(
        "UPDATE kb10_tuning_state SET lease_token = $1, lease_until = $2, claimed_observed = observed WHERE store_id = $3 AND observed - claimed_observed >= $4 AND lease_until < $5 RETURNING store_id",
        { token, now:add(120 * time.SECOND):format(time.RFC3339), store_id, interval, now:format(time.RFC3339) })
    if err then return nil, err end
    if #result == 0 then return nil, nil end
    return token, nil
end

function M.finish(store_id: string, token: string, proposal: any, err: any): (boolean?, any?)
    local applied = proposal ~= nil and not err
    local result, finish_err = rows(
        "UPDATE kb10_tuning_state SET lease_token = '', lease_until = '', applied_at = $1, last_error = $2, rationale = $3 WHERE store_id = $4 AND lease_token = $5 RETURNING store_id",
        { applied and time.now():utc():format(time.RFC3339) or "", err and tostring(err) or "", applied and proposal.rationale or "", store_id, token })
    if finish_err then return nil, finish_err end
    if #result == 0 then return nil, errors.new({ kind = errors.CONFLICT, message = "tuning lease no longer belongs to this attempt" }) end
    return true, nil
end

return M
