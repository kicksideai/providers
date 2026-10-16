local test = require("test")
local runtime = require("runtime")
local sql = require("sql")
local prompt = require("prompt")
local function define_tests()
    test.describe("session checkpoint working memory", function()
        test.after_each(function() runtime._reset_deps() end)
        local function setup(text, window, fail_working, bytes_per_token, declared_window, truncate_working, durable_result)
            local captured = { requests = {}, writes = 0, model_resolutions = 0 }
            runtime._set_deps({
                ctx = { get = function() return nil end },
                contract = { get = function() return { open = function() return { get_prompt = function(_, args)
                    captured.selector = args.selector
                    return { text = text, range = {from_id = "first", to_id = "last"} }
                end } end } end },
                prompt = prompt,
                llm = {
                    resolve_model = function(name) captured.model_resolutions = captured.model_resolutions + 1; return {name = name, max_tokens = declared_window or window, output_tokens = 1024} end,
                    generate = function(builder, options)
                        local messages = builder:get_messages()
                        local parts = {}
                        for _, message in ipairs(messages) do
                            for _, part in ipairs(message.content or {}) do
                                if part.text then parts[#parts + 1] = part.text end
                            end
                        end
                        local source = table.concat(parts, "\n")
                        local size = math.ceil(#source / (bytes_per_token or 4)) + 16 * #messages
                        local durable = source:find("You write durable long-term", 1, true) ~= nil
                        captured.requests[#captured.requests + 1] = {input = size, output = options.max_tokens, source = source, durable = durable, model = options.model}
                        if size + options.max_tokens > window then return nil, "maximum context length is " .. tostring(window) .. " tokens" end
                        if not durable and fail_working then return nil, "working checkpoint unavailable" end
                        if not durable and truncate_working then return {result = "partial checkpoint", finish_reason = "length"} end
                        if durable then return {result = durable_result or "NO_DURABLE_MEMORY", tokens = {context_tokens = size}} end
                        local markers, seen = {}, {}
                        for marker in source:gmatch("%[[A-Z]+:[%w_-]+%]") do
                            if not seen[marker] then seen[marker] = true; markers[#markers + 1] = marker end
                        end
                        return {result = "Session working state: " .. table.concat(markers, " "), tokens = {context_tokens = size}}
                    end,
                },
                component = { ACCESS = {READ = 1, WRITE = 2}, open = function() return {
                    embed_content = function(_, args) captured.writes = captured.writes + 1; captured.stored = args.content; return {success = true} end,
                } end },
            })
            return captured
        end

        test.it("keeps working facts, decisions and tasks separate from the durable digest", function()
            local captured = setup("[FACT:temporary] [DECISION:approved] [OPEN:finish]", 8192)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"},
                write_kb_id = "owned-library"})
            test.is_nil(err)
            test.eq(result.memory, "NO_DURABLE_MEMORY")
            test.eq(captured.writes, 0)
            test.contains(result.summary, "[FACT:temporary]")
            test.contains(result.summary, "[DECISION:approved]")
            test.contains(result.summary, "[OPEN:finish]")
            test.eq(#captured.requests, 2)
        end)
        test.it("stores only the durable digest while returning working state", function()
            local captured = setup("[FACT:temporary] [DECISION:approved] [OPEN:finish]", 8192,
                false, 4, 8192, false, "## Memory Digest\n\n- Stable preference: concise replies.")
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"},
                write_kb_id = "owned-library"})
            test.is_nil(err)
            test.eq(captured.writes, 1)
            test.eq(captured.stored, result.memory)
            test.contains(result.memory, "Stable preference")
            test.contains(result.summary, "[OPEN:finish]")
            test.is_true(result.summary ~= result.memory)
        end)
        test.it("passes the source bound through the host selector", function()
            local captured = setup("[OPEN:finish]", 8192)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"}, checkpoint_source_max_chars = 256,
                selector = {mode = "range", from_id = "first", to_id = "last"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"}})
            test.is_nil(err)
            test.eq(captured.selector.mode, "range")
            test.eq(captured.selector.from_id, "first")
            test.eq(captured.selector.to_id, "last")
            test.eq(captured.selector.max_chars, 256)
            test.eq(captured.model_resolutions, 0)
            test.eq(#captured.requests, 2)
        end)
        test.it("rejects a truncated working summary before committing durable memory", function()
            local captured = setup("[OPEN:finish]", 8192, false, 4, 8192, true)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"},
                write_kb_id = "owned-library"})
            test.is_nil(result)
            test.contains(tostring(err), "checkpoint generation does not complete")
            test.eq(captured.writes, 0)
        end)
        test.it("uses the configured checkpoint model when the host supplies no agent model", function()
            local captured = setup("[OPEN:finish]", 8192)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent"}, checkpoint_model = "owned-checkpoint",
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"}})
            test.is_nil(err)
            test.contains(result.summary, "[OPEN:finish]")
            for _, request in ipairs(captured.requests) do test.eq(request.model, "owned-checkpoint") end
        end)
        test.it("keeps empty-history checkpoints free of model calls", function()
            local captured = setup("", 8192)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"}})
            test.is_nil(err)
            test.eq(result.memory, "NO_DURABLE_MEMORY")
            test.eq(result.summary, "No working conversation state.")
            test.eq(#captured.requests, 0)
            test.eq(captured.writes, 0)
        end)
        test.it("returns a working-summary failure before committing durable memory", function()
            local captured = setup("[OPEN:finish]", 8192, true)
            local result, err = runtime.create({host = {kind = "session", session_id = "owned-session"},
                agent = {id = "owned-agent", model = "active-model"},
                run_context = {contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding"},
                write_kb_id = "owned-library"})
            test.is_nil(result)
            test.contains(tostring(err), "working checkpoint unavailable")
            test.eq(captured.writes, 0)
        end)
    end)
    test.describe("memory checkpoint failures", function()
        test.after_each(function() runtime._reset_deps() end)
        local payload = { host = { kind = "session", session_id = "owned-session" }, agent = { id = "owned-agent" }, run_context = { contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding" }, write_kb_id = "owned-library" }
        local function setup(prompt_error, model_error, write_error)
            runtime._set_deps({
                ctx = { get = function() return nil end },
                contract = { get = function() return { open = function() return { get_prompt = function() return { text = "Northwind delivery team prefers green tea." }, prompt_error end } end } end },
                prompt = prompt,
                llm = { resolve_model = function() return {max_tokens = 8192, output_tokens = 1024} end,
                    generate = function() return { result = "Northwind delivery team prefers green tea." }, model_error end },
                component = { ACCESS = { READ = 1, WRITE = 2 }, open = function() return { embed_content = function() return nil, write_error end } end },
            })
        end
        test.it("preserves run-context and knowledge-base open failures", function()
            for _, boundary in ipairs({ "contract", "binding", "knowledge" }) do
                local cause = errors.new({ message = boundary .. " unavailable", kind = errors.UNAVAILABLE })
                runtime._set_deps({
                    ctx = { get = function() return nil end }, prompt = prompt,
                    contract = { get = function()
                        if boundary == "contract" then return nil, cause end
                        return { open = function()
                            if boundary == "binding" then return nil, cause end
                            return { get_prompt = function() return { text = "Durable preference." }, nil end }, nil
                        end }, nil
                    end },
                    llm = { generate = function() return { result = "## Memory Digest\n- Durable preference." }, nil end },
                    component = { ACCESS = { READ = 1, WRITE = 2 }, open = function() return nil, cause end },
                })
                local result, err = runtime.create(payload)
                test.is_nil(result)
                test.eq(err, cause)
            end
        end)
        test.it("returns lifecycle prompt, model and write failures without successful observations", function()
            for _, boundary in ipairs({ "prompt", "model", "write" }) do
                local cause = errors.new({ message = boundary .. " unavailable", kind = errors.UNAVAILABLE })
                setup(boundary == "prompt" and cause or nil, boundary == "model" and cause or nil, boundary == "write" and cause or nil)
                local result, err = runtime.apply({ phase = "deactivate", host = payload.host,
                    agent = payload.agent, run_context = payload.run_context, write_kb_id = payload.write_kb_id })
                test.is_nil(result)
                test.eq(err, cause)
            end
        end)
        test.it("returns recall prompt failures when activating memory", function()
            local cause = errors.new({ message = "recall prompt unavailable", kind = errors.UNAVAILABLE })
            setup(cause, nil, nil)
            local result, err = runtime.apply({ phase = "activate", host = payload.host,
                agent = payload.agent, run_context = payload.run_context })
            test.is_nil(result)
            test.eq(err, cause)
        end)
        test.it("returns a write failure so the host does not advance past unpersisted memory", function()
            setup(nil, nil, "output event requires its producer capability")
            local result, err = runtime.create(payload)
            test.is_nil(result)
            test.eq(err, "output event requires its producer capability")
        end)
        test.it("returns a prompt failure before generating a checkpoint", function()
            setup("owned session prompt unavailable", nil, nil)
            local result, err = runtime.create(payload)
            test.is_nil(result)
            test.eq(err, "owned session prompt unavailable")
        end)
        test.it("returns a model failure before committing a checkpoint", function()
            setup(nil, "checkpoint model unavailable", nil)
            local result, err = runtime.create(payload)
            test.is_nil(result)
            test.eq(err, "checkpoint model unavailable")
        end)
    end)
    test.describe("memory runtime boundaries", function()
        test.after_each(function() runtime._reset_deps() end)
        test.it("uses the configured SQL engine", function()
            local db = assert(sql.get("app:db"))
            local rows, err = db:query("SELECT 1 AS alive", {})
            db:release()
            test.is_nil(err)
            test.eq(tonumber(rows[1].alive), 1)
        end)
        test.it("requires a host and run context before lifecycle work", function()
            local result, err = runtime.apply({})
            test.is_nil(result)
            test.eq(err, "host.kind is required")
            result, err = runtime.create({ host = { kind = "session" } })
            test.is_nil(result)
            test.eq(err, "run_context is required")
            result, err = runtime.apply({ host = { kind = "session" }, run_context = {} })
            test.is_nil(result)
            test.eq(err, "run_context contract and binding are required")
        end)
        test.it("ignores unrelated phases without calling dependencies", function()
            local result, err = runtime.apply({ phase = "observe", host = { kind = "session" }, run_context = { contract = "test:contract", binding = "test:binding" } })
            test.is_nil(err)
            test.is_true(result.metadata.ignored)
            test.eq(#result.messages, 0)
        end)
        test.it("requires query text and a configured knowledge base", function()
            local result, err = runtime.recall({})
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "query is required")
            result, err = runtime.recall({ query = "customer preference" })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "memory knowledge base is not configured")
        end)
        test.it("does not recall when the trait instance disables reads", function()
            local result, err = runtime.recall({ read_enabled = false })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "Memory recall is disabled for this trait instance.")
            test.eq(result.count, 0)
            test.eq(#result.items, 0)
        end)
        test.it("returns complete memory records at the requested limit", function()
            local requested
            runtime._set_deps({
                component = {
                    ACCESS = { READ = 1, WRITE = 2 },
                    open = function()
                        return {
                            query = function(_, args)
                                requested = args
                                local items = {}
                                for index = 1, args.limit do
                                    items[#items + 1] = {
                                        id = "memory-" .. tostring(index),
                                        content = string.rep("é", 2000),
                                        metadata = { source = "chat-" .. tostring(index) },
                                    }
                                end
                                return { success = true, items = items, next_offset = args.limit }
                            end,
                        }
                    end,
                },
            })

            local query = string.rep("q", 2000)
            local result, err = runtime.recall({ query = query, kb_id = "memory-kb", limit = 25 })
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(requested.limit, 25)
            test.eq(requested.offset, 0)
            test.eq(requested.query, query)
            test.eq(result.query, query)
            test.eq(result.count, 25)
            test.eq(result.items[1].id, "memory-1")
            test.eq(result.items[1].kb_id, "memory-kb")
            test.is_nil(result.items[1].content)
            test.is_nil(result.items[25].metadata)
            test.eq(result.items[25].source, "chat-25")
            test.eq(result.next_cursor, "1:25")
        end)
        test.it("returns compact memories and full content only when requested", function()
            local content = string.rep("Customer prefers email over phone. ", 200)
            runtime._set_deps({
                component = {
                    ACCESS = { READ = 1, WRITE = 2 },
                    open = function()
                        return { query = function() return { items = { { id = "memory-1", content = content, meta = {} } } } end }
                    end,
                },
            })
            local result, err = runtime.recall({ query = "contact preference", kb_id = "memory-kb" })
            test.is_nil(err)
            test.is_true(result.success)
            test.is_nil(result.items[1].content)
            test.is_nil(result.message)
            local full = runtime.recall({query = "contact preference", kb_id = "memory-kb", fields = {"content"}})
            test.eq(full.items[1].content, content)
        end)
        -- A queryable KB answering offset/limit pages over `count` ranked matches.
        local function paged_kbs(counts: { [string]: number }, requests: { any })
            runtime._set_deps({
                ctx = { get = function(name)
                    if name == "kb_ids" then
                        local ids = {}
                        for kb_id in pairs(counts) do ids[#ids + 1] = kb_id end
                        table.sort(ids)
                        return ids
                    end
                    return nil
                end },
                component = {
                    ACCESS = { READ = 1, WRITE = 2 },
                    open = function(kb_id)
                        return {
                            query = function(_, args)
                                requests[#requests + 1] = { kb_id = kb_id, offset = args.offset, limit = args.limit }
                                local items = {}
                                for index = args.offset + 1, math.min(args.offset + args.limit, counts[kb_id]) do
                                    items[#items + 1] = { id = kb_id .. "-" .. tostring(index), content = "memory", meta = {} }
                                end
                                local next_offset = args.offset + args.limit < counts[kb_id] and args.offset + args.limit or nil
                                return { success = true, items = items, count = #items, next_offset = next_offset }
                            end,
                        }
                    end,
                },
            })
        end
        local function ids(result: any): string
            local out = {}
            for _, item in ipairs(result.items) do out[#out + 1] = item.id end
            return table.concat(out, ",")
        end
        test.it("pages memories merged across knowledge bases with a cursor", function()
            local requests = {}
            paged_kbs({ ["kb-a"] = 5, ["kb-b"] = 5 }, requests)
            local first, err = runtime.recall({ query = "preferences", limit = 3 })
            test.is_nil(err)
            test.eq(ids(first), "kb-a-1,kb-b-1,kb-a-2")
            test.eq(requests[1].offset, 0)
            test.eq(requests[1].limit, 3)
            test.eq(first.next_cursor, "2:2,1")
            local second = runtime.recall({ query = "preferences", limit = 3, cursor = first.next_cursor })
            test.eq(ids(second), "kb-b-2,kb-a-3,kb-b-3")
            test.eq(requests[3].offset, 2)
            test.eq(requests[4].offset, 1)
            test.eq(second.next_cursor, "1:3,3")
            local third = runtime.recall({ query = "preferences", limit = 3, cursor = second.next_cursor })
            test.eq(ids(third), "kb-a-4,kb-b-4,kb-a-5")
            local last = runtime.recall({ query = "preferences", limit = 3, cursor = third.next_cursor })
            test.eq(ids(last), "kb-b-5")
            test.is_nil(last.next_cursor)
            local invalid = runtime.recall({ query = "preferences", cursor = "next" })
            test.is_false(invalid.success)
            test.eq(invalid.error, "cursor must be a next_cursor value from a previous SearchMemory result")
        end)
        test.it("pages past the hundredth match of a knowledge base to its last match", function()
            local requests = {}
            paged_kbs({ ["kb-a"] = 101, ["kb-b"] = 250 }, requests)
            local seen, total, cursor = {}, 0, nil
            repeat
                local page, err = runtime.recall({ query = "preferences", limit = 100, cursor = cursor })
                test.is_nil(err)
                for _, item in ipairs(page.items) do
                    test.is_nil(seen[item.id])
                    seen[item.id] = true
                    total = total + 1
                end
                cursor = page.next_cursor
            until cursor == nil
            test.eq(total, 351)
            test.is_true(seen["kb-a-101"])
            test.is_true(seen["kb-b-250"])
        end)
        test.it("fails with the knowledge base's typed open and read errors", function()
            local cause = errors.new({ kind = errors.UNAVAILABLE, message = "knowledge base unavailable" })
            for _, boundary in ipairs({ "open", "query" }) do
                runtime._set_deps({
                    component = { ACCESS = { READ = 1, WRITE = 2 }, open = function()
                        if boundary == "open" then return nil, cause end
                        return { query = function() return nil, cause end }
                    end },
                })
                local result, err = runtime.recall({ query = "preferences", kb_id = "memory-kb" })
                test.is_nil(result)
                test.eq(err, cause)
            end
        end)
        test.it("returns a knowledge base's domain error with its kb_id", function()
            runtime._set_deps({
                component = { ACCESS = { READ = 1, WRITE = 2 }, open = function()
                    return { query = function() return { success = false, error = "limit must be between 1 and 100", items = {}, count = 0 } end }
                end },
            })
            local result, err = runtime.recall({ query = "preferences", kb_id = "memory-kb" })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "limit must be between 1 and 100")
            test.eq(result.kb_id, "memory-kb")
        end)
        test.it("does not persist conversational answers as durable memory", function()
            local result, reason = runtime._private.normalize_memory_digest("I found the answer for you")
            test.is_nil(result)
            test.eq(reason, "assistant_answer")
            result, reason = runtime._private.normalize_memory_digest("Customer prefers email")
            test.is_nil(reason)
            test.eq(result, "## Memory Digest\n\nCustomer prefers email")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
