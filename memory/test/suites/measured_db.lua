local db = require("memory_db")
local M = {}
local statements: { string } = {}
local run_rows = 0

function M.reset() statements = {}; run_rows = 0 end
function M.run_rows(): integer return run_rows end
function M.statements(): { string } return statements end

local function measured(conn: any): any
    return {
        type = function(_self: any): (any?, error?) return conn:type() end,
        begin = function(_self: any): (any?, error?) return conn:begin() end,
        query = function(_self: any, statement: string, params: any): (any?, error?)
            statements[#statements + 1] = statement
            local rows, err = conn:query(statement, params)
            if statement:find("SELECT id, input, last_error FROM kickside_memory_runs", 1, true) then run_rows = run_rows + #(rows or {}) end
            return rows, err
        end,
        execute = function(_self: any, statement: string, params: any): (any?, error?)
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
