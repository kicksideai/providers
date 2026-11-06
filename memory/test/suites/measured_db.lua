-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local db = require("memory_db")
local M = {}
local measurements: { [any]: any } = {}

local function current(): any
    return coroutine.running() or "main"
end

local function measurement(): any
    local key = current()
    local out = measurements[key]
    if not out then
        out = { statements = {}, records = {}, run_rows = 0, run_reads = 0 }
        measurements[key] = out
    end
    return out
end

function M.reset()
    measurements[current()] = { statements = {}, records = {}, run_rows = 0, run_reads = 0 }
end

function M.run_rows(): integer return measurement().run_rows end
function M.run_reads(): integer return measurement().run_reads end
function M.records(): { any } return measurement().records end
function M.statements(): { string } return measurement().statements end

local function measured(conn: any): any
    local out = measurement()
    return {
        type = function(_self: any): (any?, error?) return conn:type() end,
        begin = function(_self: any): (any?, error?) return conn:begin() end,
        query = function(_self: any, statement: string, params: any): (any?, error?)
            out.statements[#out.statements + 1] = statement
            out.records[#out.records + 1] = { statement = statement, params = params }
            local rows, err = conn:query(statement, params)
            if not err then out.records[#out.records].rows = #rows end
            local normalized = " " .. statement:lower():gsub('"', ''):gsub("%s+", " ") .. " "
            if normalized:find(" from kickside_memory_runs ", 1, true)
                or normalized:find(" join kickside_memory_runs ", 1, true) then
                out.run_reads = out.run_reads + 1
                if not err then out.run_rows = out.run_rows + #rows end
            end
            return rows, err
        end,
        execute = function(_self: any, statement: string, params: any): (any?, error?)
            out.statements[#out.statements + 1] = statement
            out.records[#out.records + 1] = { statement = statement, params = params }
            return conn:execute(statement, params)
        end,
    }
end

function M.read(fn: any): (any?, error?)
    return db.read(function(conn: any, sqlite: boolean): (any?, error?) return fn(measured(conn), sqlite) end)
end

function M.write(id: string?, fn: any): (any?, error?)
    return db.write(id, function(tx: any, sqlite: boolean): (any?, error?) return fn(measured(tx), sqlite) end)
end
return M
