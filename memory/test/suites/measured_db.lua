-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local db = require("memory_db")
local M = {}
local statements: { string } = {}
local run_rows, run_reads, records = 0, 0, {}

function M.reset() statements = {}; run_rows, run_reads, records = 0, 0, {} end
function M.run_rows(): integer return run_rows end
function M.run_reads(): integer return run_reads end
function M.records(): { any } return records end
function M.statements(): { string } return statements end

local function measured(conn: any): any
    return {
        type = function(_self: any): (any?, error?) return conn:type() end,
        begin = function(_self: any): (any?, error?) return conn:begin() end,
        query = function(_self: any, statement: string, params: any): (any?, error?)
            statements[#statements + 1] = statement
            records[#records + 1] = { statement = statement, params = params }
            local rows, err = conn:query(statement, params)
            local normalized = " " .. statement:lower():gsub('"', ''):gsub("%s+", " ") .. " "
            if normalized:find(" from kickside_memory_runs ", 1, true)
                or normalized:find(" join kickside_memory_runs ", 1, true) then
                run_reads = run_reads + 1
                if not err then run_rows = run_rows + #rows end
            end
            return rows, err
        end,
        execute = function(_self: any, statement: string, params: any): (any?, error?)
            statements[#statements + 1] = statement
            records[#records + 1] = { statement = statement, params = params }
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
