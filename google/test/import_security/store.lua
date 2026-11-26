-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local sql = require("sql")

local M = {}

local function write(step: string): error?
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope or scope:evaluate(actor, "store.write", "test.store:demo_sales") ~= "allow" then
        return errors.new({kind = errors.PERMISSION_DENIED, message = "Store write permission is required"})
    end
    local db = assert(sql.get("app:db"))
    -- The import calls the store one step at a time, so the row count gives the call order on SQLite and PostgreSQL.
    local counted, count_err = db:query("SELECT COUNT(*) AS n FROM google_import_identity", {})
    if count_err then
        db:release()
        return count_err
    end
    local _, err = db:execute("INSERT INTO google_import_identity (seq, actor_id, step, can_write, can_unrelated) VALUES ($1,$2,$3,$4,$5)",
        {assert(tonumber(counted[1].n)) + 1, actor:id(), step, 1, scope:evaluate(actor, "unrelated.write", "unrelated:store") == "allow" and 1 or 0})
    db:release()
    return err
end

function M.types(): any
    return {success = true, types = {{name = "string", title = "Text", coerces_to = "string"}}}
end

function M.list(): any return {success = true, targets = {}} end

function M.define(): (any?, error?)
    local err = write("define")
    if err then return nil, err end
    return {success = true, target = "test.store:demo_sales", created = true}, nil
end

function M.describe(): any
    return {success = true, columns = {{name = "value", type = "string", nullable = true}},
        key = {}, columns_version = "1", limits = {max_batch_rows = 10}, supports = {replace_scope = true}}
end

function M.begin(): (any?, error?)
    local err = write("begin")
    if err then return nil, err end
    return {success = true, load_id = "identity-load"}, nil
end

function M.append(req: any): (any?, error?)
    local err = write("append")
    if err then return nil, err end
    return {success = true, staged = #req.rows}, nil
end

function M.commit(): (any?, error?)
    local err = write("commit")
    if err then return nil, err end
    return {success = true, targets = {{target = "test.store:demo_sales", result = "replaced", inserted = 1, deleted = 0}}}, nil
end

function M.discard(): any return {success = true} end

function M.unsupported(): any error("The import must not call this fixture method") end

return M
