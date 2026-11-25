local test = require("test")
local transport = require("transport")
local store = require("store")
local importer = require("importer")
local registry = require("registry")
local json = require("json")

local function define_schema(): any
    local entry = registry.get("kickside.data:definable")
    for _, method in ipairs(entry.data.methods) do
        if method.name == "define" then return method.input_schemas[1].definition end
    end
    error("Missing definable.define input schema")
end

local function args(mode: string?): any
    return {spreadsheet = "sales-id", range = "Sales!A1:D20",
        dataset = {code = "demo_sales", title = "Demo sales"}, mode = mode or "replace"}
end

local function define_tests()
    test.describe("Google Sheets import", function()
        local old_connect, old_get, old_open
        local state: any
        test.before_each(function()
            old_connect, old_get, old_open = transport.connect, transport.get, store.open
            state = {values = {{"Month", "Revenue", "Orders", "Paid"}, {"2026-01", 12.5, 2, true}, {"2026-02", 9, 1, false}},
                calls = {}, requests = {}, batches = {}, limit = 2, target = "test.store:demo_sales", commits = 0, discarded = 0,
                definitions = {}, schema = {}, stored_rows = {}}
            local function response(step: string, answer: any): (any?, error?)
                state.calls[#state.calls + 1] = step
                if state.fail == step then
                    if state.typed then return nil, state.typed end
                    return {success = false, error = {code = "permission_denied", message = step .. " refused"}}
                end
                return answer
            end
            local administrator = {}
            function administrator:types(_: any): any
                return response("types", {success = true, types = {
                    {name = "string", coerces_to = "string", options_schema = {properties = {
                        max_length = {type = "integer", minimum = 1, maximum = 65535, default = 255}}}},
                    {name = "text", coerces_to = "string"}, {name = "int", coerces_to = "integer"},
                    {name = "float", coerces_to = "number"}, {name = "bool", coerces_to = "boolean"},
                    {name = "date", coerces_to = "date"},
                }})
            end
            function administrator:define(request: any): any
                local encoded, encode_err = json.encode(request)
                test.is_nil(encode_err)
                local valid, schema_err = json.validate_string(define_schema(), encoded)
                test.is_nil(schema_err)
                test.is_true(valid)
                state.definitions[#state.definitions + 1] = request
                for _, column in ipairs(request.columns or {}) do
                    local held = state.schema[column.name]
                    if held and column.type and held.type ~= column.type then
                        return {success = false, error = {message = "type conflict: " .. column.name}}
                    end
                end
                if state.fail ~= "define" then
                    for _, column in ipairs(request.columns or {}) do
                        local held = state.schema[column.name] or {}
                        for key, value in pairs(column) do held[key] = value end
                        state.schema[column.name] = held
                    end
                end
                return response("define", {success = true, target = state.target, created = #state.definitions == 1})
            end
            local receiver = {}
            function receiver:list(_: any): any
                return response("list", {success = true, targets = next(state.schema) and {{id = state.target, title = "Demo sales"}} or {}})
            end
            function receiver:describe(request: any): any
                test.eq(request.target, state.target)
                local columns, normalized = {}, {int = "integer", float = "number", bool = "boolean", text = "string"}
                for _, column in pairs(state.schema) do
                    columns[#columns + 1] = {name = column.name, type = normalized[column.type] or column.type,
                        nullable = column.nullable, options = column.options}
                end
                return response("describe", {success = true, columns = columns, limits = {max_batch_rows = state.limit}})
            end
            function receiver:begin(request: any): any
                state.begin = request
                state.load_rows = 0
                state.staged = {}
                return response("begin", {success = true, load_id = "load-1"})
            end
            function receiver:append(request: any): any
                for _, row in ipairs(request.rows) do
                    for name, value in pairs(row) do
                        local column = state.schema[name]
                        if column.type == "string" then
                            local _, length = tostring(value):gsub("[^\128-\191]", "")
                            if length > (column.options and column.options.max_length or 255) then
                                return {success = false, error = {message = "FIELD_TOO_LONG: " .. name}}
                            end
                        end
                    end
                    state.staged[#state.staged + 1] = row
                end
                state.batches[#state.batches + 1] = request
                state.load_rows = state.load_rows + #request.rows
                return response("append", {success = true, staged = #request.rows})
            end
            function receiver:commit(request: any): any
                state.commits = state.commits + 1
                state.commit = request
                local outcome = state.outcome or (state.load_rows == 0 and "noop" or "replaced")
                if state.fail ~= "commit" and outcome ~= "noop" then
                    if request.targets[1].replace_scope then state.stored_rows = {} end
                    for _, row in ipairs(state.staged) do state.stored_rows[#state.stored_rows + 1] = row end
                end
                return response("commit", {success = true, targets = {{target = state.target,
                    inserted = state.confirmed_rows or state.load_rows, result = outcome}}})
            end
            function receiver:discard(_: any): any
                state.discarded = state.discarded + 1
                if state.cleanup_fail then return {success = false, error = {message = "discard refused"}} end
                return response("discard", {success = true})
            end
            store.open = function(role: string): (any?, error?)
                state.calls[#state.calls + 1] = "open_" .. role
                if state.fail == "open" then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "store denied"}) end
                return role == "administrator" and administrator or receiver, nil
            end
            transport.connect = function(selected: any): (any?, error?)
                state.selected = selected
                if state.fail == "connect" then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "connection denied"}) end
                return {}, nil
            end
            transport.get = function(_: any, url: string, query: any): (any?, error?)
                state.requests[#state.requests + 1] = {url = url, query = query}
                if state.fail == "http" then return {success = false, error = "Google refused", status_code = 403} end
                if url:find("/values/", 1, true) then return {success = true, data = {values = state.values}} end
                return {success = true, data = {sheets = {{properties = {title = "Sales team's data"}}}}}
            end
        end)
        test.after_each(function()
            transport.connect, transport.get, store.open = old_connect, old_get, old_open
        end)

        test.it("loads typed rows through one load and commits a replacement", function()
            local result, err = importer.handler(args())
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(result.dataset.target, state.target)
            test.eq(result.rows, 2)
            test.eq(result.fields[2].type, "number")
            test.eq(result.fields[3].type, "integer")
            test.eq(result.fields[4].type, "boolean")
            test.eq(state.definitions[1].columns[2].type, "float")
            test.eq(state.batches[1].rows[2].paid, false)
            test.eq(state.begin.targets[1].target, state.target)
            test.not_nil(state.begin.run.run_id)
            test.eq(state.commits, 1)
            test.eq(state.commit.targets[1].batches, 1)
            test.is_true(state.commit.targets[1].replace_scope.all)
            test.eq(state.requests[1].query.valueRenderOption, "UNFORMATTED_VALUE")
            test.eq(state.requests[1].query.dateTimeRenderOption, "FORMATTED_STRING")
        end)

        test.it("appends without a replacement scope", function()
            local result = importer.handler(args("append"))
            test.is_true(result.success)
            test.is_nil(state.commit.targets[1].replace_scope)
        end)

        test.it("batches to the receiver limit and returns only five preview rows", function()
            for index = 4, 10 do state.values[index] = {"2026-03", index, index, false} end
            local result = importer.handler(args())
            test.eq(result.rows, 9)
            test.eq(#result.preview, 5)
            test.eq(#state.batches, 5)
            test.eq(state.batches[5].batch_index, 5)
            test.eq(state.batches[5].load_id, "load-1")
            test.eq(#state.batches[5].rows, 1)
            test.eq(state.commits, 1)
            test.is_nil(result.values)
        end)

        test.it("accepts a Sheets URL and quotes a literal sheet name", function()
            local input = args()
            input.spreadsheet = "https://docs.google.com/spreadsheets/d/sales-id/edit#gid=4"
            input.range, input.sheet = nil, "Sales team's data"
            local result = importer.handler(input)
            test.is_true(result.success)
            test.contains(state.requests[1].url, "/sales-id/values/%27Sales%20team%27%27s%20data%27")
        end)

        test.it("defaults to the first sheet", function()
            local input = args()
            input.range = nil
            local result = importer.handler(input)
            test.is_true(result.success)
            test.eq(#state.requests, 2)
            test.contains(state.requests[2].url, "Sales%20team%27%27s%20data")
        end)

        test.it("normalizes field names and infers dates with nullable missing cells", function()
            state.values = {{"Sale date", "Net revenue", "Customer code"}, {"2024-02-29", 2.5, "001"}, {"2026-01-01", 4}}
            local result = importer.handler(args())
            test.eq(result.fields[1].name, "sale_date")
            test.eq(result.fields[1].type, "date")
            test.eq(result.fields[3].type, "string")
            test.eq(result.preview[1].customer_code, "001")
            test.is_nil(result.preview[2].customer_code)
            test.is_true(result.fields[3].nullable)
        end)

        test.it("keeps invalid dates as text and mixed cells as strings", function()
            state.values = {{"Date", "Amount"}, {"2026-02-29", 4}, {"2026-03-01", "pending"}}
            local result = importer.handler(args())
            test.eq(result.fields[1].type, "string")
            test.eq(result.fields[2].type, "string")
            test.eq(result.preview[1].amount, "4")
        end)

        test.it("skips blank rows while keeping false and zero", function()
            state.values = {{"Amount", "Paid"}, {}, {0, false}, {"", ""}}
            local result = importer.handler(args())
            test.eq(result.rows, 1)
            test.eq(result.preview[1].amount, 0)
            test.eq(result.preview[1].paid, false)
        end)

        test.it("defines added fields on a later import of the same dataset", function()
            test.is_true(importer.handler(args()).success)
            state.values[1][5], state.values[2][5] = "Region", "North"
            test.is_true(importer.handler(args("append")).success)
            test.eq(#state.definitions, 2)
            test.eq(state.definitions[2].target, state.target)
            test.eq(#state.definitions[2].columns, 1)
            test.eq(state.definitions[2].columns[1].name, "region")
        end)

        test.it("keeps a float field when a later import contains only integers", function()
            state.values = {{"Revenue"}, {12.5}}
            test.is_true(importer.handler(args()).success)
            state.values = {{"Revenue"}, {12}}
            local result = importer.handler(args())
            test.is_true(result.success)
            test.eq(result.fields[1].type, "number")
            test.eq(state.schema.revenue.type, "float")
            test.is_nil(state.definitions[2].columns)
            test.eq(state.stored_rows[1].revenue, 12)
        end)

        test.it("keeps text fields and converts later numbers and booleans to text", function()
            state.values = {{"Value"}, {string.rep("x", 65536)}}
            test.is_true(importer.handler(args()).success)
            test.eq(state.schema.value.type, "text")
            state.values = {{"Value"}, {12}, {false}}
            local result = importer.handler(args())
            test.is_true(result.success)
            test.eq(result.preview[1].value, "12")
            test.eq(result.preview[2].value, "false")
            test.is_nil(state.definitions[2].columns)
        end)

        test.it("omits unchanged columns and validates repeat requests against the define contract", function()
            test.is_true(importer.handler(args()).success)
            test.is_true(importer.handler(args()).success)
            test.eq(#state.definitions, 2)
            test.is_nil(state.definitions[2].columns)
            local valid = json.validate_string(define_schema(), '{"target":"test.store:demo_sales","title":"Demo sales","columns":[]}')
            test.is_false(valid)
            test.eq(#state.stored_rows, 2)
        end)

        test.it("keeps existing types when later columns contain only blank values", function()
            state.values = {{"Label", "Revenue", "Paid", "Date"}, {"first", 12.5, true, "2026-01-01"}}
            test.is_true(importer.handler(args()).success)
            state.values = {{"Label", "Revenue", "Paid", "Date"}, {"second", "", "  ", ""}, {"third"}}
            local result = importer.handler(args())
            test.is_true(result.success)
            test.eq(result.fields[2].type, "number")
            test.eq(result.fields[3].type, "boolean")
            test.eq(result.fields[4].type, "date")
            test.is_nil(state.definitions[2].columns)
            test.eq(state.schema.revenue.type, "float")
            test.eq(state.schema.paid.type, "bool")
            test.eq(state.schema.date.type, "date")
            test.is_nil(state.stored_rows[1].revenue)
            test.is_nil(state.stored_rows[1].paid)
            test.is_nil(state.stored_rows[2].date)
        end)

        test.it("widens an existing 255 character field before loading 600 characters", function()
            state.values = {{"Notes"}, {"short"}}
            test.is_true(importer.handler(args()).success)
            test.eq(state.schema.notes.options.max_length, 255)
            local longest = string.rep("é", 600)
            state.values = {{"Notes"}, {longest}}
            local result = importer.handler(args())
            test.is_true(result.success)
            test.eq(state.definitions[2].target, state.target)
            test.eq(state.definitions[2].columns[1].name, "notes")
            test.is_nil(state.definitions[2].columns[1].type)
            test.eq(state.schema.notes.type, "string")
            test.eq(state.schema.notes.options.max_length, 600)
            test.eq(state.stored_rows[1].notes, longest)
            test.eq(state.discarded, 0)
        end)

        test.it("names a conflicting existing field before changing schema or staging rows", function()
            state.values = {{"Revenue"}, {12.5}}
            test.is_true(importer.handler(args()).success)
            state.values = {{"Revenue"}, {"pending"}}
            local result = importer.handler(args())
            test.is_false(result.success)
            test.contains(result.error, "revenue")
            test.contains(result.error, "existing field is number")
            test.eq(#state.definitions, 1)
            test.eq(#state.batches, 1)
            test.eq(state.stored_rows[1].revenue, 12.5)
        end)

        test.it("profiles the longest string and supplies Storage max_length", function()
            local longest = string.rep("x", 600)
            state.values = {{"Notes"}, {"short"}, {longest}}
            local result = importer.handler(args())
            test.is_true(result.success)
            test.eq(state.schema.notes.type, "string")
            test.eq(state.schema.notes.options.max_length, 600)
            test.eq(state.stored_rows[2].notes, longest)
        end)

        test.it("rejects malformed arguments before calling Google or the store", function()
            local inputs = {args(), args(), args(), args(), args(), args()}
            inputs[1].spreadsheet = "https://evil.test/sheet"
            inputs[2].dataset.code = "bad-code"
            inputs[3].dataset.title = " "
            inputs[4].mode = "upsert"
            inputs[5].sheet = "Sales"
            inputs[6].range = " "
            for _, input in ipairs(inputs) do
                local result = importer.handler(input)
                test.is_false(result.success)
            end
            test.eq(#state.requests, 0)
            test.eq(#state.calls, 0)
        end)

        test.it("rejects empty, duplicate and missing headers before defining", function()
            for _, values in ipairs({{}, {{""}, {1}}, {{"Net revenue", "net_revenue"}, {1, 2}}, {{"A"}, {1, 2}}}) do
                state.values = values
                test.is_false(importer.handler(args()).success)
            end
            test.eq(#state.definitions, 0)
            test.eq(state.commits, 0)
        end)

        test.it("refuses header-only, empty and blank replacements while keeping populated rows", function()
            test.is_true(importer.handler(args()).success)
            local retained = state.stored_rows
            for _, values in ipairs({{{"Month", "Revenue"}}, {}, {{"Month", "Revenue"}, {}, {"", ""}}}) do
                state.values = values
                local result = importer.handler(args())
                test.is_false(result.success)
                test.not_nil(result.error)
                test.eq(state.stored_rows, retained)
                test.eq(#state.stored_rows, 2)
            end
            test.eq(#state.definitions, 1)
            test.eq(#state.batches, 1)
            test.eq(state.commits, 1)
        end)

        test.it("does not report an empty append noop as imported", function()
            state.values = {{"Month", "Revenue"}}
            local result = importer.handler(args("append"))
            test.is_false(result.success)
            test.contains(result.error, "noop")
        end)

        test.it("rejects noop even if the returned count matches the nonempty input", function()
            state.outcome = "noop"
            local result = importer.handler(args())
            test.is_false(result.success)
            test.contains(result.error, "no rows were imported")
        end)

        test.it("stops before storage changes when Google refuses", function()
            state.fail = "http"
            local result = importer.handler(args())
            test.is_false(result.success)
            test.eq(#state.definitions, 0)
            test.eq(state.commits, 0)
        end)

        test.it("preserves connection and store permission errors", function()
            for _, step in ipairs({"open", "connect"}) do
                state.fail = step
                local result, err = importer.handler(args())
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            end
            test.eq(#state.requests, 0)
        end)

        test.it("stops on each store refusal and discards an append failure", function()
            for _, step in ipairs({"list", "types", "define", "describe", "begin", "append", "commit"}) do
                state.fail = step
                local result = importer.handler(args())
                test.is_false(result.success)
                test.contains(result.error, step .. " refused")
            end
            test.eq(state.discarded, 2)
            test.eq(state.commits, 1)
        end)

        test.it("preserves a typed store failure", function()
            state.fail, state.typed = "define", errors.new({kind = errors.UNAVAILABLE, message = "store offline"})
            local result, err = importer.handler(args())
            test.is_nil(result)
            test.eq(err, state.typed)
            test.eq(state.commits, 0)
        end)

        test.it("keeps an uncertain commit without discarding its load", function()
            state.fail, state.typed = "commit", errors.new({kind = errors.UNAVAILABLE, message = "commit response lost"})
            local result, err = importer.handler(args())
            test.is_nil(result)
            test.eq(err, state.typed)
            test.eq(state.discarded, 0)
        end)

        test.it("reports both the append failure and a failed discard", function()
            state.fail, state.cleanup_fail = "append", true
            local result = importer.handler(args())
            test.is_false(result.success)
            test.contains(result.error, "append refused")
            test.contains(result.error, "discard refused")
        end)

        test.it("requires the store to confirm the committed row count", function()
            state.confirmed_rows = 1
            local result = importer.handler(args())
            test.is_false(result.success)
            test.contains(result.error, "committed row count")
        end)

        test.it("rejects a missing receiver batch limit before opening a load", function()
            state.limit = 0
            local result = importer.handler(args())
            test.is_false(result.success)
            test.is_nil(state.begin)
        end)
    end)

    test.describe("Google import bindings", function()
        test.it("requests Sheets and Drive metadata access before Google calls", function()
            local trait = registry.get("kickside.google.traits:sheets_importer")
            local prompt = trait.data.prompt
            test.contains(prompt, "ConnectAccount")
            test.contains(prompt, 'provider "google"')
            test.contains(prompt, "https://www.googleapis.com/auth/spreadsheets.readonly")
            test.contains(prompt, "https://www.googleapis.com/auth/drive.metadata.readonly")
            test.contains(prompt, "before the first Google call")
            test.contains(prompt, "missing access")
            test.contains(prompt, "list_files")
            test.contains(prompt, "name =")
        end)

        test.it("refuses an unwired import without selecting a default store", function()
            local saved = store._registry
            store._registry = {get = function(_: string): any return {meta = {binding = ""}} end}
            local result, err = store.open("administrator")
            store._registry = saved
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("requires the caller's identity before opening a store", function()
            local saved_registry, saved_security = store._registry, store._security
            store._registry = {get = function(_: string): any return {meta = {binding = "test:store"}} end}
            store._security = {actor = function(): any return nil end, scope = function(): any return {} end}
            local result, err = store.open("receiver")
            store._registry, store._security = saved_registry, saved_security
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("opens the configured contracts with the caller's actor and scope", function()
            local saved_contract, saved_registry, saved_security = store._contract, store._registry, store._security
            local seen, actor, scope = {}, {}, {}
            local definition = {}
            function definition:with_actor(value: any): any seen.actor = value; return self end
            function definition:with_scope(value: any): any seen.scope = value; return self end
            function definition:open(value: any): any seen.binding = value; return {} end
            store._contract = {get = function(id: string): any seen.contract = id; return definition end}
            store._registry = {get = function(_: string): any return {meta = {binding = "test:store"}} end}
            store._security = {actor = function(): any return actor end, scope = function(): any return scope end}
            local administrator, err = store.open("administrator")
            store._contract, store._registry, store._security = saved_contract, saved_registry, saved_security
            test.not_nil(administrator)
            test.is_nil(err)
            test.eq(seen.contract, "kickside.data:definable")
            test.eq(seen.binding, "test:store")
            test.eq(seen.actor, actor)
            test.eq(seen.scope, scope)
        end)

        test.it("declares the import tool schema and Data Explorer store bindings", function()
            local tool = registry.get("kickside.google.traits:sheets_import_tool")
            test.eq(tool.meta.llm_alias, "GoogleSheetsImport")
            local schema, err = json.decode(tool.meta.input_schema)
            test.is_nil(err)
            test.eq(schema.required[1], "spreadsheet")
            test.is_nil(schema.properties.connection_id)
            local output = json.decode(tool.meta.output_schema)
            test.eq(output.properties.preview.maxItems, 5)
            local source = registry.get("kickside.google:data_explorer_source")
            test.eq(source.meta.type, "spiralscout.data_explorer:source")
            test.eq(source.data.store.bind["kickside.google:import_receiver_binding"], "kickside.data:loadable")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
