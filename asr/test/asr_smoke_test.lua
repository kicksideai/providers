local test = require("test")
local registry = require("registry")
local upload_type = require("upload_type")

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function define_tests()
    test.describe("kickside.asr packaging", function()
        test.it("publishes a universal upload stage the pipeline can discover", function()
            local entry = get("kickside.asr:stage.universal")
            local m = meta(entry)

            test.eq(m.type, "upload.stage")
            test.eq(tostring(value(entry, "scope")), "universal")
            test.eq(tostring(value(entry, "func")), "kickside.asr:stage")
        end)

        test.it("leaves the transcriber to the deployment", function()
            local definition = get("kickside.asr:transcriber")
            test.eq(tostring(value(definition, "kind")), "contract.definition")

            local methods: any = value(definition, "methods")
            test.eq(#methods, 1)
            test.eq(methods[1].name, "transcribe")

            -- The transcriber is the deployment's choice, so the module ships none.
            -- This harness binds a stub, which is exactly how a host supplies one.
            local bindings = registry.find({ [".kind"] = "contract.binding" }) or {}
            for _, binding in ipairs(bindings) do
                local id = tostring((binding :: any).id or "")
                if id:sub(1, 13) == "kickside.asr:" then
                    local contracts: any = value(binding, "contracts") or {}
                    for _, bound in ipairs(contracts) do
                        test.is_true(tostring(bound.contract) ~= "kickside.asr:transcriber",
                            "the module must ship no transcriber binding of its own")
                    end
                end
            end
        end)

        test.it("is picked up by the pipeline uploads builds for a generic file", function()
            local resolved, resolve_err = upload_type.find_by_mime_or_ext("audio/ogg", "oga")
            test.is_nil(resolve_err)
            test.not_nil(resolved, "audio resolves no upload type at all")

            local pipeline, err = upload_type.get_pipeline(tostring((resolved :: any).id))
            test.is_nil(err)

            local found = false
            for _, stage in ipairs(pipeline :: { any }) do
                if tostring((stage :: any).func) == "kickside.asr:stage" then found = true end
            end
            test.is_true(found, "the universal stage is not in the generic pipeline")
        end)

        test.it("ships every setting the stage reads", function()
            local declared = {}
            local entries = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.settings:definition" }) or {}
            for _, entry in ipairs(entries) do
                if tostring(value(entry, "namespace")) == "kickside.asr" then
                    declared[tostring(value(entry, "key"))] = true
                end
            end

            test.is_true(declared["asr_enabled"], "asr_enabled is not declared")
            test.is_true(declared["asr_language"], "asr_language is not declared")
            test.is_true(declared["asr_max_bytes"], "asr_max_bytes is not declared")
            test.is_true(declared["asr_max_transcript_bytes"], "asr_max_transcript_bytes is not declared")
            test.is_true(declared["asr_call_timeout_ms"], "asr_call_timeout_ms is not declared")
        end)

        test.it("declares every foreign package it imports, unpinned", function()
            for id, component in pairs({
                ["kickside.asr:dep.kickside.uploads"] = "kickside/uploads",
                ["kickside.asr:dep.kickside.settings"] = "kickside/settings",
            }) do
                local entry = get(id)
                test.eq(tostring(value(entry, "component")), component)
                test.eq(tostring(value(entry, "version")), "*", component .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
