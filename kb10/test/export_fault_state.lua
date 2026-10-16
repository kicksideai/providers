local sql = require("sql")
local M = {}
local counters = {}
local fail_at = 0

function M.reset(at)
    fail_at = at
    counters = { mkdir = 0, queries = 0, opens = 0, releases = 0 }
end

function M.counters() return counters end

function M.get(_storage_id)
    return {
        mkdir = function(_self, _path)
            counters.mkdir = counters.mkdir + 1
            if counters.mkdir == fail_at then
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "directory backend unavailable" })
            end
            return true, nil
        end,
        writefile = function(_self, _path, _content) return true, nil end,
        open = function(_self, _path, _mode)
            counters.opens = counters.opens + 1
            return {
                write = function(_self, content) return #content, nil end,
                close = function() return true, nil end,
            }, nil
        end,
    }, nil
end

function M.get_db()
    return {
        query = function(_self, _query, _args)
            counters.queries = counters.queries + 1
            return {}, nil
        end,
        release = function() counters.releases = counters.releases + 1; return true, nil end,
    }, nil
end

function M.get_db_type(_db) return sql.type.SQLITE, nil end

return M
