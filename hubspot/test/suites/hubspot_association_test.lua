local conformance = require("conformance")
local source = require("source")
local test = require("test")
local types = require("types")

type ListCall = { object_type: string, query: source.ObjectQuery }
type BatchCall = { from_type: string, to_type: string, inputs: { types.AssociationInput } }
type Calls = { lists: { ListCall }, batches: { BatchCall } }
type Overrides = {
    connect: ((string?) -> (types.Conn?, string?))?,
    list_objects: ((types.Conn, string, source.ObjectQuery) -> (source.ClientResult?, unknown?))?,
    batch_read_associations: ((types.Conn, string, string, { types.AssociationInput }) -> (types.AssociationBatchResult?, unknown?))?,
}

local function connect(component_id: string?): (types.Conn?, string?)
    return { component_id = component_id, api_key = "pat" }, nil
end

local function fake_transport(overrides: Overrides?): (source.Transport, Calls)
    local custom: Overrides = overrides or {}
    local calls: Calls = { lists = {}, batches = {} }
    local function list_objects(_conn: types.Conn, object_type: string, query: source.ObjectQuery): (source.ClientResult?, unknown?)
        calls.lists[#calls.lists + 1] = { object_type = object_type, query = query }
        if query.after == "objects-2" then
            return { success = true, data = { results = { { id = "30" } } } }, nil
        end
        return {
            success = true,
            data = {
                results = { { id = "10" }, { id = "20" } },
                paging = { next = { after = "objects-2" } },
            },
        }, nil
    end
    local function batch_read_associations(
        _conn: types.Conn,
        from_type: string,
        to_type: string,
        inputs: { types.AssociationInput }
    ): (types.AssociationBatchResult?, unknown?)
        calls.batches[#calls.batches + 1] = { from_type = from_type, to_type = to_type, inputs = inputs }
        if inputs[1].after == "assoc-2" then
            return {
                success = true,
                status_code = 200,
                data = { results = {
                    {
                        from = { id = "10" },
                        to = {
                            { toObjectId = "200", associationTypes = {
                                { category = "USER_DEFINED", typeId = 42, label = "Decision maker" },
                            } },
                        },
                    },
                } },
            }, nil
        end
        if inputs[1].id == "30" then
            return { success = true, status_code = 200, data = { results = {} } }, nil
        end
        return {
            success = true,
            status_code = 207,
            data = { numErrors = 0, results = {
                {
                    from = { id = "10" },
                    to = {
                        { toObjectId = "100", associationTypes = {
                            { category = "HUBSPOT_DEFINED", typeId = 1, label = "Primary" },
                            { category = "USER_DEFINED", typeId = 42, label = "Decision maker" },
                        } },
                    },
                    paging = { next = { after = "assoc-2" } },
                },
                { from = { id = "20" }, to = {} },
            } },
        }, nil
    end
    local fake: source.Transport = {
        connect = custom.connect or connect,
        list_objects = custom.list_objects or list_objects,
        batch_read_associations = custom.batch_read_associations or batch_read_associations,
    }
    return fake, calls
end

local function canonical(value: any): string
    if type(value) ~= "table" then return type(value) .. ":" .. tostring(value) end
    local keys: { string } = {}
    for key in pairs(value) do keys[#keys + 1] = tostring(key) end
    table.sort(keys)
    local parts: { string } = {}
    for _, key in ipairs(keys) do
        local item = value[key]
        if item == nil then item = value[tonumber(key)] end
        parts[#parts + 1] = key .. "=" .. canonical(item)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

local function pair_transport(association_types: { types.AssociationType }): source.Transport
    local fake = fake_transport({
        list_objects = function(_conn: types.Conn, _object_type: string, _query: source.ObjectQuery): (source.ClientResult?, unknown?)
            return { success = true, data = { results = { { id = "10" } } } }, nil
        end,
        batch_read_associations = function(_conn: types.Conn, _from: string, _to: string,
                _inputs: { types.AssociationInput }): (types.AssociationBatchResult?, unknown?)
            return { success = true, status_code = 200, data = { results = {
                { from = { id = "10" }, to = { { toObjectId = "100", associationTypes = association_types } } },
            } } }, nil
        end,
    })
    return fake
end

local function payloads_by_key(transport: source.Transport): { [string]: string }
    local result = source.pull({
        config = { connection_id = "conn-a", from_object_type = "contacts", to_object_type = "companies" },
    }, nil, { transport = transport })
    local out: { [string]: string } = {}
    for _, item in ipairs(result.items) do out[item.dedup_key] = canonical(item.payload) end
    return out
end

local function define_tests()
    test.describe("HubSpot association source", function()
        test.it("bounds flattened fan-out and resumes by stable association identity", function()
            local batch_calls = 0
            local fake = fake_transport({
                connect = function(_id: string?): (types.Conn?, string?)
                    return { component_id = "conn-1", api_key = "pat" }, nil
                end,
                list_objects = function(_conn: types.Conn, _from: string, _query: source.ObjectQuery): (source.ClientResult?, unknown?)
                    return { success = true, data = { results = { { id = "1" }, { id = "2" }, { id = "3" } } } }, nil
                end,
                batch_read_associations = function(
                    _conn: types.Conn,
                    _from: string,
                    _to: string,
                    inputs: { types.AssociationInput }
                ): (types.AssociationBatchResult?, unknown?)
                    batch_calls = batch_calls + 1
                    local results: { types.AssociationResult } = {}
                    for _, input in ipairs(inputs) do
                        local to: { types.AssociationTarget } = {}
                        for n = 1, 5 do
                            to[#to + 1] = {
                                toObjectId = tostring(input.id) .. "0" .. tostring(n),
                                associationTypes = { { category = "HUBSPOT_DEFINED", typeId = 1 } },
                            }
                        end
                        -- Deliberately reverse each repeated provider page. Resume
                        -- must depend on stable identity, not transport order.
                        if batch_calls % 2 == 0 then
                            local reversed: { types.AssociationTarget } = {}
                            for index = #to, 1, -1 do reversed[#reversed + 1] = to[index] end
                            to = reversed
                        end
                        results[#results + 1] = { from = { id = input.id }, to = to }
                    end
                    return { success = true, status_code = 200, data = { results = results } }, nil
                end,
            })

            local config = {
                connection_id = "conn-1",
                from_object_type = "contacts",
                to_object_type = "companies",
            }
            local seen: { [string]: boolean } = {}
            local count = 0
            local cursor: source.Cursor? = nil
            for _ = 1, 12 do
                local page = source.pull({ config = config, limit = 4, cursor = cursor }, nil, { transport = fake })
                test.eq(page.success, true, tostring(page.error))
                test.is_true(#(page.items or {}) <= 4)
                for _, item in ipairs(page.items or {}) do
                    test.is_nil(seen[item.item_key], "duplicate association: " .. tostring(item.item_key))
                    seen[item.item_key] = true
                    count = count + 1
                end
                if page.has_more ~= true then break end
                cursor = page.next_cursor
            end
            test.eq(count, 15)
        end)

        test.it("preserves object and per-record association pagination", function()
            local fake, calls = fake_transport()
            local config = {
                connection_id = "component:hubspot/one",
                from_object_type = "contacts",
                to_object_type = "companies",
            }
            local first = source.pull({ config = config, limit = 2 }, nil, { transport = fake })
            test.eq(first.success, true)
            test.eq(first.has_more, true)
            test.eq(#first.items, 2)
            test.eq(first.next_cursor.object_after, "objects-2")
            test.eq(first.next_cursor.association_inputs[1].id, "10")
            test.eq(first.next_cursor.association_inputs[1].after, "assoc-2")
            test.eq(first.items[1].item_key, "hubspot:association:component%3Ahubspot%2Fone:contacts:10:companies:100:HUBSPOT_DEFINED:1")
            test.eq(first.items[1].payload.kind, "association")
            test.eq(first.items[1].payload.edge.from.object_type, "contacts")
            test.eq(first.items[1].payload.edge.to.id, "100")
            test.eq(first.items[2].payload.edge.association_type.label, "Decision maker")

            local second = source.pull({ config = config, cursor = first.next_cursor }, nil, { transport = fake })
            test.eq(second.success, true)
            test.eq(second.has_more, true)
            test.eq(second.items[1].payload.edge.to.id, "200")
            test.eq(second.next_cursor.object_after, "objects-2")
            test.is_nil(second.next_cursor.association_inputs)
            test.eq(calls.lists[2], nil)

            local third = source.pull({ config = config, cursor = second.next_cursor }, nil, { transport = fake })
            test.eq(third.success, true)
            test.eq(third.has_more, false)
            test.eq(calls.lists[2].query.after, "objects-2")
            test.eq(calls.batches[3].inputs[1].id, "30")
        end)

        test.it("normalizes numeric HubSpot object identifiers at the transport boundary", function()
            local fake = fake_transport({
                list_objects = function(_conn: types.Conn, _object_type: string, _query: source.ObjectQuery): (source.ClientResult?, unknown?)
                    return { success = true, data = { results = { { id = 10 } } } }, nil
                end,
                batch_read_associations = function(
                    _conn: types.Conn,
                    _from: string,
                    _to: string,
                    inputs: { types.AssociationInput }
                ): (types.AssociationBatchResult?, unknown?)
                    test.eq(inputs[1].id, "10")
                    return {
                        success = true,
                        status_code = 200,
                        data = {
                            results = {
                                {
                                    from = { id = 10 },
                                    to = {
                                        {
                                            toObjectId = 100,
                                            associationTypes = {
                                                { category = "HUBSPOT_DEFINED", typeId = 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }, nil
                end,
            })
            local result = source.pull({
                config = { connection_id = "conn", from_object_type = "contacts", to_object_type = "companies" },
            }, nil, { transport = fake })
            test.eq(result.success, true)
            test.eq(result.items[1].payload.edge.from.id, "10")
            test.eq(result.items[1].payload.edge.to.id, "100")
        end)

        test.it("uses a versioned dedup key and connection-scoped identity", function()
            local first_fake = fake_transport()
            local a = source.pull({
                config = { connection_id = "conn-a", from_object_type = "contacts", to_object_type = "companies" },
            }, nil, { transport = first_fake })
            local second_fake = fake_transport()
            local b = source.pull({
                config = { connection_id = "conn-b", from_object_type = "contacts", to_object_type = "companies" },
            }, nil, { transport = second_fake })
            test.is_true(a.items[1].item_key ~= b.items[1].item_key)
            test.is_true(a.items[1].source_version ~= "")
            test.is_true(a.items[1].dedup_key ~= a.items[1].item_key .. ":upsert")
        end)

        test.it("derives each association payload from its own edge alone", function()
            local primary = { category = "HUBSPOT_DEFINED", typeId = 1, label = "Primary" }
            local unlabeled = { category = "HUBSPOT_DEFINED", typeId = 279 }
            local decision = { category = "USER_DEFINED", typeId = 42, label = "Decision maker" }
            local first = payloads_by_key(pair_transport({ primary, unlabeled }))
            local reordered = payloads_by_key(pair_transport({ unlabeled, primary }))
            local widened = payloads_by_key(pair_transport({ decision, primary, unlabeled }))
            local count = 0
            for dedup_key, payload in pairs(first) do
                count = count + 1
                test.eq(reordered[dedup_key], payload)
                test.eq(widened[dedup_key], payload)
            end
            test.eq(count, 2)
        end)

        test.it("does not advance a partial 207 response", function()
            local fake = fake_transport({
                batch_read_associations = function(
                    _conn: types.Conn,
                    _from: string,
                    _to: string,
                    _inputs: { types.AssociationInput }
                ): (types.AssociationBatchResult?, unknown?)
                    return {
                        success = true,
                        status_code = 207,
                        data = { numErrors = 1, results = {}, errors = { { message = "one failed" } } },
                    }, nil
                end,
            })
            local result = source.pull({
                config = { connection_id = "conn", from_object_type = "contacts", to_object_type = "companies" },
            }, nil, { transport = fake })
            test.eq(result.success, false)
            test.is_true(result.error.message:find("partial errors", 1, true) ~= nil)
        end)

        test.it("keeps successful associations when missing objects race a batch read", function()
            local fake = fake_transport({
                batch_read_associations = function(
                    _conn: types.Conn,
                    _from: string,
                    _to: string,
                    _inputs: { types.AssociationInput }
                ): (types.AssociationBatchResult?, unknown?)
                    return {
                        success = true,
                        status_code = 207,
                        data = {
                            numErrors = 1,
                            errors = {
                                {
                                    category = "OBJECT_NOT_FOUND",
                                    message = "source object disappeared",
                                    context = { id = { "20" } },
                                },
                            },
                            results = {
                                {
                                    from = { id = "10" },
                                    to = {
                                        {
                                            toObjectId = "100",
                                            associationTypes = {
                                                { category = "HUBSPOT_DEFINED", typeId = 1, label = "Primary" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }, nil
                end,
            })
            local result = source.pull({
                config = { connection_id = "conn", from_object_type = "contacts", to_object_type = "companies" },
            }, nil, { transport = fake })
            test.eq(result.success, true)
            test.eq(#result.items, 1)
            test.eq(result.items[1].payload.edge.from.id, "10")
            test.eq(result.items[1].payload.edge.to.id, "100")
        end)

        test.it("enumerates the same stable identities for reconciliation", function()
            local result = source.pull_keys({
                config = {
                    connection_id = "conn",
                    from_object_type = "contacts",
                    to_object_type = "companies",
                },
                limit = 2,
            }, nil, { transport = (fake_transport()) })
            test.eq(result.success, true)
            test.eq(#result.keys, 2)
            test.eq(result.keys[1].item_key, "hubspot:association:conn:contacts:10:companies:100:HUBSPOT_DEFINED:1")
            test.is_true(result.keys[1].dedup_key ~= result.keys[1].item_key)
            test.eq(result.has_more, true)
            test.eq(result.next_cursor.association_inputs[1].after, "assoc-2")
        end)

        test.it("pull_keys connects with the request-carried connection component", function()
            local fake = fake_transport()
            local result = source.pull_keys({
                component_id = "conn-reconcile",
                config = {
                    from_object_type = "contacts",
                    to_object_type = "companies",
                },
                limit = 2,
            }, nil, { transport = fake })
            test.eq(result.success, true)
            test.eq(result.keys[1].item_key, "hubspot:association:conn-reconcile:contacts:10:companies:100:HUBSPOT_DEFINED:1")
        end)

        test.it("returns typed transport failures from pull and key listing", function()
            local cause = errors.new({ message = "transport unavailable", kind = errors.UNAVAILABLE })
            for _, operation in ipairs({ "connect", "list_objects", "batch_read_associations" }) do
                local fake = fake_transport()
                fake[operation] = function(...): (nil, any)
                    return nil, cause
                end
                for _, pull in ipairs({ source.pull, source.pull_keys }) do
                    local out, err = pull({
                        config = { connection_id = "conn", from_object_type = "contacts", to_object_type = "companies" },
                    }, nil, { transport = fake })
                    test.is_nil(out, operation)
                    test.eq(err, cause, operation)
                end
            end
        end)

        test.it("conforms to the pullable envelope", function()
            local fake = fake_transport()
            local result = conformance.run({
                pull = function(request: source.Request): source.PullResult
                    local result, err = source.pull(request, nil, { transport = fake })
                    test.is_nil(err)
                    test.not_nil(result)
                    return result :: source.PullResult
                end,
                config = function(_name: string): any
                    return {
                        connection_id = "conn",
                        from_object_type = "contacts",
                        to_object_type = "companies",
                    }
                end,
                failure_config = {
                    connection_id = "conn",
                    from_object_type = "",
                    to_object_type = "companies",
                },
                pull_keys = function(request: source.Request): source.PullResult
                    local result, err = source.pull_keys(request, nil, { transport = (fake_transport()) })
                    test.is_nil(err)
                    test.not_nil(result)
                    return result :: source.PullResult
                end,
                backfill_since = { mode = "ignored", reason = "Associations are enumerated from the current object graph." },
                limit = 2,
                max_pages = 5,
            })
            test.eq(result.success, true, conformance.format_failures(result))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
