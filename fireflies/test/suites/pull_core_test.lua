local test = require("test")

local core = require("pull_core")

-- A fake transport injected via deps so the pull core never touches the network.
-- list_transcripts returns two newest-first rows; get_transcript returns structured
-- detail and records that it was called (the meetings path must never enrich).
local function new_fake(): any
    local fake: any = { detail_calls = 0, list_calls = {} }
    function fake.connect(_component_id: string?): (any, string?)
        return { component_id = "c1", api_key = "k" }, nil
    end
    function fake.list_transcripts(_conn: any, args: any): any
        fake.list_calls[#fake.list_calls + 1] = args
        return { success = true, data = { transcripts = {
            { id = "t1", title = "Sync", date = 1748772000000, dateString = "2026-06-01T10:00:00.000Z",
              duration = 30, host_email = "a@x", organizer_email = "b@x", participants = { "a@x", "lead@acme.com" },
              meeting_attendees = { { displayName = "Lead Person", email = "lead@acme.com" } } },
            { id = "t2", title = "Standup", date = 1748858400000, dateString = "2026-06-02T10:00:00.000Z",
              duration = 15, host_email = "c@x", organizer_email = "d@x", participants = { "c@x", "d@x" } },
        } } }
    end
    function fake.get_transcript(_conn: any, _id: string): any
        fake.detail_calls = fake.detail_calls + 1
        return { success = true, data = { transcript = {
            summary = { overview = "x" },
            meeting_attendees = { { displayName = "Lead Person", email = "lead@acme.com" } },
            transcript_url = "u",
        } } }
    end
    fake.sentence_calls = 0
    function fake.get_transcript_sentences(_conn: any, _id: string): any
        fake.sentence_calls = fake.sentence_calls + 1
        return { success = true, data = { transcript = { sentences = {
            { index = 0, speaker_name = "Alice", text = "Let's kick off the sync.", start_time = 0 },
            { index = 1, speaker_name = "Bob", text = "Sounds good, I have three updates.", start_time = 4 },
        } } } }
    end
    return fake
end

local function first_item(res: any): any
    test.not_nil(res, "pull returned nil")
    test.is_true(res.success, "pull did not succeed")
    test.not_nil(res.items, "pull returned no items")
    test.is_true(#res.items > 0, "pull returned an empty page")
    return res.items[1]
end

local function new_single_transcript_fake(id: string, title: string, date_ms: number): any
    local fake: any = new_fake()
    fake.transcript = {
        id = id, title = title, date = date_ms, dateString = "2033-05-18T03:33:19.000Z",
        duration = 30, host_email = "a@x", organizer_email = "b@x", participants = { "a@x" },
    }
    function fake.list_transcripts(_conn: any, args: any): any
        fake.list_calls[#fake.list_calls + 1] = args
        return { success = true, data = { transcripts = { fake.transcript } } }
    end
    return fake
end

local function define_tests()
    test.describe("Fireflies pull_core", function()
        test.it("passes typed list and enrichment failures through the source operations", function()
            local list_failure = errors.new({ kind = errors.UNAVAILABLE, message = "list transport unavailable" })
            local listed = new_fake()
            listed.list_transcripts = function(): (any?, error?) return nil, list_failure end
            local pull_result, pull_err = core.pull({}, { default_shape = "meeting" },
                { transport = listed, component_id = "connection" })
            local keys_result, keys_err = core.pull_keys({}, nil, { transport = listed, component_id = "connection" })
            test.is_nil(pull_result)
            test.eq(pull_err, list_failure)
            test.is_nil(keys_result)
            test.eq(keys_err, list_failure)

            local detail_failure = errors.new({ kind = errors.UNAVAILABLE, message = "detail transport unavailable" })
            local detailed = new_fake()
            detailed.get_transcript = function(): (any?, error?) return nil, detail_failure end
            local detail_result, detail_err = core.pull({}, { default_shape = "transcript" },
                { transport = detailed, component_id = "connection" })
            test.is_nil(detail_result)
            test.eq(detail_err, detail_failure)

            local sentences_failure = errors.new({ kind = errors.UNAVAILABLE, message = "sentences transport unavailable" })
            local sentenced = new_fake()
            sentenced.get_transcript_sentences = function(): (any?, error?) return nil, sentences_failure end
            local sentence_result, sentence_err = core.pull({}, { default_shape = "transcript" },
                { transport = sentenced, component_id = "connection" })
            test.is_nil(sentence_result)
            test.eq(sentence_err, sentences_failure)
        end)

        test.it("preserves typed capacity without parsing provider message text", function()
            local tp = new_fake()
            tp.list_transcripts = function() return {success = false, error = "paced", status_code = 429,
                retry_after_ms = 2500, kind = errors.RATE_LIMITED, retryable = true,
                details = {code = "provider_capacity", scope = "capacity", retry_at_ms = 1893456000123}} end
            local result = core.pull({}, {default_shape = "meeting"}, {transport = tp, component_id = "connection"})
            test.eq(result.error.code, "rate_limited")
            test.eq(result.retry_after_ms, 2500)
            test.eq(result.error.kind, errors.RATE_LIMITED)
            test.eq(result.error.details.retry_at_ms, 1893456000123)
        end)

        test.it("enriches on the transcripts path (default_shape=transcript)", function()
            local fake = new_fake()
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.not_nil(item.payload.summary, "transcript payload missing summary")
            test.eq(item.item_key, "fireflies:transcript:t1")
            test.is_true(item.dedup_key:find("fireflies:transcript:t1:", 1, true) == 1,
                "transcript dedup key must include the title hash")
            test.eq(item.op, "upsert")
            test.is_true(fake.detail_calls > 0, "get_transcript was never called for the transcript shape")
        end)

        test.it("emits the port-declared ISO date string and the meeting participants", function()
            local fake = new_fake()
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.eq(item.payload.date, "2026-06-01T10:00:00.000Z")
            test.eq(item.payload.date_ms, 1748772000000)
            test.eq(#item.payload.participants, 2)
            test.eq(item.payload.participants[2], "lead@acme.com")
            -- The roster with display names rides the LIST answer for every
            -- shape, so a meetings consumer can attribute people without a
            -- per-meeting detail call.
            test.eq(#item.payload.attendees, 1)
            test.eq(item.payload.attendees[1].displayName, "Lead Person")
            test.eq(item.payload.attendees[1].email, "lead@acme.com")
        end)

        test.it("preserves ISO dates and participant identities for every meeting without detail requests", function()
            local fake = new_fake()
            local res = core.pull({}, { default_shape = "meeting" }, { transport = fake, component_id = "c1" })
            test.is_true(res.success)
            test.eq(#res.items, 2)
            for index, expected in ipairs({
                { iso = "2026-06-01T10:00:00.000Z", epoch = 1748772000000, participant = "lead@acme.com" },
                { iso = "2026-06-02T10:00:00.000Z", epoch = 1748858400000, participant = "d@x" },
            }) do
                local payload = res.items[index].payload
                test.eq(payload.date, expected.iso)
                test.eq(payload.date_ms, expected.epoch)
                test.eq(payload.participants[2], expected.participant)
            end
            test.eq(fake.detail_calls, 0)
            test.eq(fake.sentence_calls, 0)
        end)

        test.it("holds a live meeting back until Fireflies finishes writing it", function()
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, args: any): any
                fake.list_calls[#fake.list_calls + 1] = args
                return { success = true, data = { transcripts = {
                    { id = "t-live", title = "In progress", date = 1748944800000, is_live = true,
                      host_email = "a@x", organizer_email = "b@x", participants = { "a@x" } },
                    { id = "t-done", title = "Finished", date = 1748858400000, duration = 15,
                      host_email = "c@x", organizer_email = "d@x", participants = { "c@x" } },
                } } }
            end
            local res = core.pull({ cursor = { phase = "live", skip = 0, hw = 1748772000 } },
                { default_shape = "transcript" }, { transport = fake, component_id = "c1", now_ms = 1749000000000 })
            test.is_true(res.success, tostring(res.error))
            test.eq(#res.items, 1)
            test.eq((res.items[1] :: any).item_key, "fireflies:transcript:t-done")
            test.is_nil(res.next_cursor.titles["t-live"], "a live transcript must not enter the title map")
            -- The high-water mark must stay below the live meeting so the next
            -- tick reads it again once it ends.
            test.eq(res.next_cursor.hw, 1748858400)

            function fake.list_transcripts(_conn: any, args: any): any
                fake.list_calls[#fake.list_calls + 1] = args
                return { success = true, data = { transcripts = {
                    { id = "t-live", title = "In progress", date = 1748944800000, is_live = false, duration = 42,
                      host_email = "a@x", organizer_email = "b@x", participants = { "a@x" } },
                    { id = "t-done", title = "Finished", date = 1748858400000, duration = 15,
                      host_email = "c@x", organizer_email = "d@x", participants = { "c@x" } },
                } } }
            end
            local after = core.pull({ cursor = res.next_cursor },
                { default_shape = "transcript" }, { transport = fake, component_id = "c1", now_ms = 1749000000000 })
            test.is_true(after.success, tostring(after.error))
            test.eq(#after.items, 1)
            test.eq((after.items[1] :: any).item_key, "fireflies:transcript:t-live")
            test.eq(after.next_cursor.hw, 1748944800)
            test.not_nil(after.next_cursor.titles["t-live"], "a finished transcript must enter the title map")
        end)

        test.it("re-delivers a recent title rename once with the same item key and a new dedup key", function()
            local now_ms = 2000000000000
            local fake = new_single_transcript_fake("rename", "Original title", now_ms - 1000)
            local first = core.pull({}, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            local first_delivery = first_item(first)
            local first_dedup_key = first_delivery.dedup_key
            test.not_nil(first.next_cursor.titles.rename, "a first recent delivery must record its title hash")

            fake.transcript.title = "Renamed title"
            local renamed = core.pull({ cursor = first.next_cursor }, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#renamed.items, 1)
            local renamed_delivery = renamed.items[1]
            test.eq(renamed_delivery.item_key, first_delivery.item_key)
            test.eq(renamed_delivery.payload.title, "Renamed title")
            test.is_true(renamed_delivery.dedup_key ~= first_dedup_key,
                "a title rename must change the delivery dedup key")
            test.eq(renamed.next_cursor.titles.rename,
                renamed_delivery.dedup_key:match("fireflies:transcript:rename:(.+)"))

            local unchanged = core.pull({ cursor = renamed.next_cursor }, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#unchanged.items, 0, "an unchanged recent title must not re-deliver")
            test.eq(fake.detail_calls, 2, "only the first delivery and rename may enrich")
        end)

        test.it("re-delivers a recent speaker-name assignment once", function()
            local now_ms = 2000000000000
            local fake = new_single_transcript_fake("speakers", "Kept title", now_ms - 1000)
            local first = core.pull({}, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            local first_delivery = first_item(first)

            fake.transcript.speakers = { { name = "Ada Example" }, { name = "Sam Example" } }
            local assigned = core.pull({ cursor = first.next_cursor }, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#assigned.items, 1, "a speaker assignment must re-deliver the item")
            test.eq(assigned.items[1].item_key, first_delivery.item_key)
            test.is_true(assigned.items[1].dedup_key ~= first_delivery.dedup_key,
                "a speaker assignment must change the delivery dedup key")

            local unchanged = core.pull({ cursor = assigned.next_cursor }, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#unchanged.items, 0, "an unchanged roster must not re-deliver")
        end)

        test.it("does not re-deliver unchanged titles inside the re-scan window", function()
            local now_ms = 2000000000000
            local fake = new_single_transcript_fake("unchanged", "Steady title", now_ms - 1000)
            local first = core.pull({}, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            local replay = core.pull({ cursor = first.next_cursor }, { default_shape = "transcript" },
                { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#replay.items, 0)
            test.eq(fake.detail_calls, 1, "an unchanged title must not enrich again")
        end)

        test.it("does not re-deliver a title rename outside the re-scan window", function()
            local now_ms = 2000000000000
            local old_date_ms = now_ms - (14 * 24 * 60 * 60 * 1000) - 1
            local fake = new_single_transcript_fake("old", "Renamed old title", old_date_ms)
            local old_date = old_date_ms / 1000
            local res = core.pull({ cursor = {
                phase = "live", skip = 0, hw = old_date,
                titles = { old = "old-title-hash" }, title_dates = { old = old_date },
            } }, { default_shape = "transcript" }, { transport = fake, component_id = "c1", now_ms = now_ms })
            test.eq(#res.items, 0)
            test.is_nil(res.next_cursor.titles.old, "old title state must be pruned")
        end)

        test.it("prunes title-map entries that leave the re-scan window", function()
            local now_ms = 2000000000000
            local old_date = (now_ms - (14 * 24 * 60 * 60 * 1000) - 1) / 1000
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, args: any): any
                fake.list_calls[#fake.list_calls + 1] = args
                return { success = true, data = { transcripts = {} } }
            end
            local res = core.pull({ cursor = {
                phase = "live", skip = 0, hw = old_date,
                titles = { old = "old-title-hash" }, title_dates = { old = old_date },
            } }, { default_shape = "transcript" }, { transport = fake, component_id = "c1", now_ms = now_ms })
            test.is_nil(res.next_cursor.titles.old)
            test.is_nil(res.next_cursor.title_dates.old)
        end)

        test.it("delivers the verbatim call text alongside the summary", function()
            local fake = new_fake()
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.eq(item.payload.transcript, "Alice: Let's kick off the sync.\nBob: Sounds good, I have three updates.")
            test.is_true(fake.sentence_calls > 0, "get_transcript_sentences was never called for the transcript shape")
        end)

        test.it("does not enrich on the meetings path (force_shape=event)", function()
            local fake = new_fake()
            local res = core.pull({}, { force_shape = "event" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.is_nil(item.payload.summary, "meetings payload should carry no summary")
            test.eq(fake.detail_calls, 0, "get_transcript must not be called for the event shape")
            test.eq(fake.sentence_calls, 0, "get_transcript_sentences must not be called for the event shape")
        end)

        test.it("caps the page size on the enriching transcripts path so one tick can't burst the provider", function()
            local fake = new_fake()
            core.pull({ limit = 25 }, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            test.eq(#fake.list_calls, 1)
            test.is_true(fake.list_calls[1].limit <= 10, "an enriching page must stay small: got " .. tostring(fake.list_calls[1].limit))
        end)

        test.it("keeps the full page size on the non-enriching meetings path", function()
            local fake = new_fake()
            core.pull({ limit = 25 }, { force_shape = "event" }, { transport = fake, component_id = "c1" })
            test.eq(fake.list_calls[1].limit, 25)
        end)

        test.it("lists reconcile keys without fetching transcript details", function()
            local fake = new_fake()
            local res = core.pull_keys({}, {}, { transport = fake, component_id = "c1" })
            test.not_nil(res, "pull_keys returned nil")
            test.is_true(res.success, "pull_keys did not succeed")
            test.eq(#res.keys, 2)
            test.eq(res.keys[1].item_key, "fireflies:transcript:t1")
            test.eq(res.keys[1].dedup_key, "fireflies:transcript:t1")
            test.eq(fake.detail_calls, 0, "pull_keys must not fetch transcript details")
        end)

        test.it("ignores stored config.shape on the transcripts binding", function()
            local fake = new_fake()
            local res = core.pull({ config = { shape = "event" } }, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.not_nil(item.payload.summary, "transcripts binding should enrich regardless of stored config.shape")
            test.is_true(fake.detail_calls > 0, "get_transcript must be called for the transcripts binding")
        end)

        test.it("surfaces a rate limit as retry_after_ms past the provider Retry-After", function()
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, _args: any): any
                return { success = false, error = "Too many requests. Please retry after Wed, 01 Jul 2099 20:25:10 GMT (UTC)" }
            end
            local res = core.pull({}, { default_shape = "event" }, { transport = fake, component_id = "c1" })
            test.not_nil(res, "pull returned nil")
            test.eq(res.error.kind, errors.RATE_LIMITED)
            test.eq(res.error.details.scope, "capacity")
            test.eq(res.error.details.retry_at_ms, 4086620710000)
            test.is_true(res.success == false, "a rate-limited pull must not succeed")
            test.eq(res.error.code, "rate_limited")
            test.is_true(res.error.retriable == true, "a rate limit must be retriable")
            test.not_nil(res.retry_after_ms, "a rate limit must carry retry_after_ms")
            test.is_true(res.retry_after_ms > 0, "retry_after_ms must be a positive delay for a future Retry-After")
        end)

        test.it("fails the page with an item-scoped error when enrichment fails, never a thin doc", function()
            local fake: any = new_fake()
            function fake.get_transcript(_conn: any, _id: string): any
                return { success = false, error = "get_transcript: not found" }
            end
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            test.not_nil(res, "pull returned nil")
            test.is_true(res.success == false, "an enrichment failure must fail the page, not ingest a thin doc")
            test.eq(res.error.code, "provider_error")
            test.eq(res.error.scope, "item")
            test.is_true(res.error.retriable == true, "an enrichment failure must be retriable")
            test.is_nil(res.items, "a failed page must not carry a thin item")
            test.is_nil(res.retry_after_ms, "a non-rate-limit enrichment failure must not carry retry_after_ms")
        end)

        test.it("fails the page with an item-scoped error when the sentence fetch fails, never a thin transcript", function()
            local fake: any = new_fake()
            function fake.get_transcript_sentences(_conn: any, _id: string): any
                return { success = false, error = "get_transcript_sentences: not found" }
            end
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            test.not_nil(res, "pull returned nil")
            test.is_true(res.success == false, "a sentence-fetch failure must fail the page, not ingest a thin doc")
            test.eq(res.error.code, "provider_error")
            test.eq(res.error.scope, "item")
            test.is_true(res.error.retriable == true, "a sentence-fetch failure must be retriable")
            test.is_nil(res.items, "a failed page must not carry a thin item")
        end)

        test.it("bounds the delivered transcript text so one long call can't blow out the item", function()
            local fake: any = new_fake()
            function fake.get_transcript_sentences(_conn: any, _id: string): any
                local sentences: { any } = {}
                for i = 1, 20000 do
                    sentences[i] = { index = i, speaker_name = "Alice", text = "word", start_time = i }
                end
                return { success = true, data = { transcript = { sentences = sentences } } }
            end
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            local item = first_item(res)
            test.is_true(#item.payload.transcript <= 60000, "transcript text must stay bounded")
        end)

        test.it("surfaces retry_after_ms when enrichment hits a rate limit", function()
            local fake: any = new_fake()
            function fake.get_transcript(_conn: any, _id: string): any
                return { success = false, error = "Too many requests. Please retry after Wed, 01 Jul 2099 20:25:10 GMT" }
            end
            local res = core.pull({}, { default_shape = "transcript" }, { transport = fake, component_id = "c1" })
            test.is_true(res.success == false, "a rate-limited enrichment must fail the page")
            test.eq(res.error.code, "rate_limited")
            test.eq(res.error.scope, "provider")
            test.not_nil(res.retry_after_ms, "a rate-limited enrichment must carry retry_after_ms")
            test.is_true(res.retry_after_ms > 0, "retry_after_ms must be a positive delay for a future Retry-After")
        end)

        test.it("classifies a non-rate-limit failure as provider_error with no retry_after_ms", function()
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, _args: any): any
                return { success = false, error = "Internal server error" }
            end
            local res = core.pull({}, { default_shape = "event" }, { transport = fake, component_id = "c1" })
            test.eq(res.error.code, "provider_error")
            test.is_nil(res.retry_after_ms, "a non-rate-limit failure must not carry retry_after_ms")
        end)

        test.it("classifies a transport failure as retriable provider_unavailable", function()
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, _args: any): any
                local failure = errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "dial tcp: lookup api.fireflies.ai: no such host",
                    details = { code = "provider_unreachable" } })
                return { success = false, kind = failure:kind(), message = failure:message(), retryable = failure:retryable(),
                    details = failure:details(), error = failure:message() }
            end
            local res = core.pull({}, { default_shape = "event" }, { transport = fake, component_id = "c1" })
            test.is_true(res.success == false)
            test.eq(res.error.code, "provider_unavailable")
            test.eq(res.error.scope, "provider")
            test.eq(res.error.retriable, true)
        end)

        test.it("classifies an HTTP 5xx answer as retriable provider_unavailable", function()
            local fake: any = new_fake()
            function fake.list_transcripts(_conn: any, _args: any): any
                return { success = false, error = "Bad gateway", status_code = 502 }
            end
            local res = core.pull({}, { default_shape = "event" }, { transport = fake, component_id = "c1" })
            test.eq(res.error.code, "provider_unavailable")
            test.eq(res.error.scope, "provider")
            test.eq(res.error.retriable, true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
