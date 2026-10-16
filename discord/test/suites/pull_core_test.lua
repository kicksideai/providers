local test = require("test")

local pull_core = require("pull_core")

-- Realistic snowflake fixtures: id = ((unix_ms - 1420070400000) << 22) | worker
-- bits, so id order matches timestamp order exactly as on the live API.
--   M1 2026-06-01T10:00:00Z .. M6 2026-06-06T10:00:00Z, one day apart.
local M1 = "1510946006630531072"
local M2 = "1511308394496131072"
local M3 = "1511670782361731072"
local M4 = "1512033170227331072"
local M5 = "1512395558092931072"
local M6 = "1512757945958531072"

-- The smallest snowflake minted at 2026-06-03T00:00:00Z (backfill boundary).
local JUNE3_FLOOR = "1511519787417600000"

local CHANNEL = "chan1"

local function msg(id: string, ts: string, content: string, edited: string?): any
    return {
        id = id,
        timestamp = ts,
        edited_timestamp = edited,
        content = content,
        author = { id = "u1", username = "example-user", global_name = "Example User" },
        attachments = {},
        type = 0,
    }
end

local function default_messages(): { any }
    return {
        msg(M1, "2026-06-01T10:00:00+00:00", "one"),
        msg(M2, "2026-06-02T10:00:00+00:00", "two"),
        msg(M3, "2026-06-03T10:00:00+00:00", "three"),
        msg(M4, "2026-06-04T10:00:00+00:00", "four"),
        msg(M5, "2026-06-05T10:00:00+00:00", "five"),
    }
end

local function id_lt(a: string, b: string): boolean
    if #a ~= #b then return #a < #b end
    return a < b
end

-- A fake transport over an in-memory channel, mirroring the live API surface:
-- `after` answers the oldest messages strictly past the anchor, no `after`
-- answers the newest window; both newest-first, both capped by limit.
local function new_fake(messages: { any }): any
    local fake: any = { messages = messages, calls = {} }
    function fake.connect(component_id: string?): (any, string?)
        return { component_id = component_id or "conn-default", bot_token = "t" }, nil
    end
    function fake.list_channel_messages(_conn: any, channel_id: string, opts: any): any
        local o = type(opts) == "table" and opts or {}
        fake.calls[#fake.calls + 1] = { channel_id = channel_id, limit = o.limit, after = o.after }
        local limit = tonumber(o.limit) or 50
        local ascending: { any } = {}
        for _, m in ipairs(fake.messages :: { any }) do
            if o.after == nil or id_lt(tostring(o.after), tostring(m.id)) then
                ascending[#ascending + 1] = m
            end
        end
        table.sort(ascending, function(a: any, b: any): boolean return id_lt(tostring(a.id), tostring(b.id)) end)
        local slice: { any } = {}
        if o.after ~= nil then
            for i = 1, math.min(limit, #ascending) do slice[#slice + 1] = ascending[i] end
        else
            for i = math.max(1, #ascending - limit + 1), #ascending do slice[#slice + 1] = ascending[i] end
        end
        local newest_first: { any } = {}
        for i = #slice, 1, -1 do newest_first[#newest_first + 1] = slice[i] end
        return { success = true, data = newest_first }
    end
    return fake
end

type TestDeps = { transport: any?, component_id: string? }

local function deps(fake: any): TestDeps
    return { transport = fake, component_id = "c1" }
end

local function pull(fake: any, cursor: any, config: any, limit: number): any
    local res = pull_core.pull({ cursor = cursor, config = config or { channel_id = CHANNEL }, limit = limit }, deps(fake))
    test.not_nil(res, "pull returned nil")
    return res
end

local function item_keys(res: any): { string }
    local out: { string } = {}
    for _, item in ipairs(res.items or {}) do out[#out + 1] = tostring(item.item_key) end
    return out
end

local function drain(fake: any, config: any, limit: number): (any, { any })
    local cursor: any = nil
    local all: { any } = {}
    for _ = 1, 10 do
        local res = pull(fake, cursor, config, limit)
        test.is_true(res.success, "pull did not succeed: " .. tostring(res.error and res.error.message))
        for _, item in ipairs(res.items) do all[#all + 1] = item end
        cursor = res.next_cursor
        if not res.has_more then return cursor, all end
    end
    error("drain did not reach has_more=false")
end

local function define_tests()
    test.describe("Discord pull_core snowflake math", function()
        test.it("orders decimal snowflake strings numerically", function()
            test.is_true(pull_core.snowflake_lt("99", "100"), "shorter string is smaller")
            test.is_true(pull_core.snowflake_lt(M1, M2), "older id is smaller")
            test.is_true(not pull_core.snowflake_lt(M2, M2), "equal ids are not less-than")
        end)

        test.it("projects an ISO instant onto the snowflake timeline", function()
            test.eq(pull_core.snowflake_floor("2026-06-03T00:00:00Z"), JUNE3_FLOOR)
            test.eq(pull_core.snowflake_floor("2014-01-01T00:00:00Z"), "0")
            test.is_nil(pull_core.snowflake_floor("not a date"))
        end)
    end)

    test.describe("Discord pull_core backfill", function()
        test.it("starts from the channel beginning and paginates by snowflake", function()
            local fake = new_fake(default_messages())
            local res = pull(fake, nil, nil, 2)
            test.is_true(res.success, "first page failed")
            test.eq(fake.calls[1].after, "0", "first run anchors at the channel start")
            test.eq(#res.items, 2)
            test.eq(res.items[1].item_key, "discord:message:" .. CHANNEL .. ":" .. M1)
            test.eq(res.items[1].op, "upsert")
            test.eq(res.has_more, true)
            test.eq(res.next_cursor.after, M2, "cursor advances to the last delivered snowflake")
            test.eq(#fake.calls, 1, "a full page defers the edit scan")

            local res2 = pull(fake, res.next_cursor, nil, 2)
            test.eq(fake.calls[2].after, M2, "second page resumes strictly after the cursor")
            test.eq(res2.items[1].item_key, "discord:message:" .. CHANNEL .. ":" .. M3)
        end)

        test.it("reaches has_more=false and shapes items for the catalog schema", function()
            local messages = default_messages()
            messages[5].attachments = { { url = "https://cdn.example/a.png" }, { url = "https://cdn.example/b.png" } }
            local fake = new_fake(messages)
            local cursor, all = drain(fake, nil, 2)
            test.eq(#all, 5)
            test.eq(cursor.after, M5)
            local last = all[5]
            test.eq(last.dedup_key, last.item_key, "identity is stable, versions ride source_version")
            test.eq(last.source_version, "2026-06-05T10:00:00+00:00")
            test.eq(last.occurred_at, "2026-06-05T10:00:00+00:00")
            test.eq(last.payload.id, M5)
            test.eq(last.payload.channel_id, CHANNEL)
            test.eq(last.payload.author.name, "Example User")
            test.eq(#last.payload.attachments, 2)
            test.eq(last.payload.attachments[1], "https://cdn.example/a.png")
            test.eq(last.payload.message_type, 0)
        end)

        test.it("honors backfill_since by anchoring at the boundary snowflake", function()
            local fake = new_fake(default_messages())
            local _, all = drain(fake, { channel_id = CHANNEL, backfill_since = "2026-06-03T00:00:00Z" }, 10)
            test.eq(fake.calls[1].after, JUNE3_FLOOR)
            test.eq(#all, 3, "only messages at or past the boundary are delivered")
            test.eq(all[1].payload.id, M3)
        end)

        test.it("replays the same page with identical identity keys", function()
            local fake = new_fake(default_messages())
            local a = pull(fake, nil, nil, 2)
            local b = pull(fake, nil, nil, 2)
            test.eq(a.items[1].item_key, b.items[1].item_key)
            test.eq(a.items[1].dedup_key, b.items[1].dedup_key)
        end)
    end)

    test.describe("Discord pull_core live edits", function()
        test.it("re-emits an edited message with op upsert and the bumped version", function()
            local messages = default_messages()
            local fake = new_fake(messages)
            local cursor = (drain(fake, nil, 10))

            messages[2].edited_timestamp = "2026-06-06T09:00:00+00:00"
            messages[2].content = "two (edited)"
            local res = pull(fake, cursor, nil, 10)
            test.is_true(res.success)
            test.eq(#res.items, 1)
            test.eq(res.items[1].op, "upsert")
            test.eq(res.items[1].item_key, "discord:message:" .. CHANNEL .. ":" .. M2)
            test.eq(res.items[1].source_version, "2026-06-06T09:00:00+00:00")
            test.eq(res.items[1].payload.content, "two (edited)")
            test.eq(res.next_cursor.edit_hw, "2026-06-06T09:00:00+00:00")

            local res2 = pull(fake, res.next_cursor, nil, 10)
            test.eq(#res2.items, 0, "an already-delivered edit does not re-emit")
        end)

        test.it("delivers a new message and an old edit in one tick without duplicates", function()
            local messages = default_messages()
            local fake = new_fake(messages)
            local cursor = (drain(fake, nil, 10))

            messages[1].edited_timestamp = "2026-06-06T11:00:00+00:00"
            messages[#messages + 1] = msg(M6, "2026-06-06T10:00:00+00:00", "six")
            local res = pull(fake, cursor, nil, 10)
            test.is_true(res.success)
            local keys = item_keys(res)
            test.eq(#keys, 2, table.concat(keys, ", "))
            test.eq(keys[1], "discord:message:" .. CHANNEL .. ":" .. M6, "the drain ships the new message once")
            test.eq(keys[2], "discord:message:" .. CHANNEL .. ":" .. M1, "the scan ships the old edit")
            test.eq(res.next_cursor.after, M6)
        end)

        test.it("does not re-emit backfilled content whose edit predates delivery", function()
            local messages = default_messages()
            messages[3].edited_timestamp = "2026-06-03T12:00:00+00:00"
            local fake = new_fake(messages)
            local cursor, all = drain(fake, nil, 10)
            test.eq(#all, 5, "backfill delivers the edited message once, at its current version")
            test.eq(all[3].source_version, "2026-06-03T12:00:00+00:00")
            test.eq(cursor.edit_hw, "2026-06-03T12:00:00+00:00", "backfill seeds the edit high-water mark")

            local res = pull(fake, cursor, nil, 10)
            test.eq(#res.items, 0, "the first live tick does not replay the backfilled edit")
        end)
    end)

    test.describe("Discord pull_core reconcile keys", function()
        test.it("enumerates current message keys and reflects deletions", function()
            local messages = default_messages()
            table.remove(messages, 2)
            local fake = new_fake(messages)
            local res = pull_core.pull_keys({ cursor = nil, config = { channel_id = CHANNEL }, limit = 10 }, deps(fake))
            test.is_true(res.success)
            test.eq(res.has_more, false)
            test.eq(#res.keys, 4)
            for _, key in ipairs(res.keys) do
                test.eq(key.dedup_key, key.item_key)
                test.is_true(key.item_key ~= "discord:message:" .. CHANNEL .. ":" .. M2, "the deleted message is absent from the key set")
            end
        end)

        test.it("paginates the key listing on the same snowflake cursor", function()
            local fake = new_fake(default_messages())
            local res = pull_core.pull_keys({ cursor = nil, config = { channel_id = CHANNEL }, limit = 2 }, deps(fake))
            test.is_true(res.success)
            test.eq(res.has_more, true)
            test.eq(#res.keys, 2)
            test.eq(res.next_cursor.after, M2)
            local res2 = pull_core.pull_keys({ cursor = res.next_cursor, config = { channel_id = CHANNEL }, limit = 10 }, deps(fake))
            test.eq(res2.has_more, false)
            test.eq(#res2.keys, 3)
        end)
    end)

    test.describe("Discord pull_core failures", function()
        test.it("surfaces a 429 as rate_limited with retry_after_ms for the engine pacing", function()
            local fake: any = new_fake(default_messages())
            function fake.list_channel_messages(_conn: any, _channel_id: string, _opts: any): any
                return { success = false, error = "rate limited", status_code = 429, retry_after_ms = 2500 }
            end
            local res = pull_core.pull({ cursor = nil, config = { channel_id = CHANNEL }, limit = 10 }, deps(fake))
            test.eq(res.success, false)
            test.eq(res.error.code, "rate_limited")
            test.eq(res.error.retriable, true)
            test.eq(res.error.scope, "provider")
            test.eq(res.retry_after_ms, 2500)
            test.is_nil(res.items, "a failed page carries no items")
        end)

        test.it("requires channel_id in the source config", function()
            local res = pull_core.pull({ cursor = nil, config = {}, limit = 10 }, deps(new_fake({})))
            test.eq(res.success, false)
            test.eq(res.error.code, "invalid_config")
        end)

        test.it("maps a dead connection to auth_expired on the connection scope", function()
            local fake: any = new_fake({})
            function fake.connect(_component_id: string?): (any, string?)
                return nil, "connection revoked"
            end
            local res = pull_core.pull({ cursor = nil, config = { channel_id = CHANNEL }, limit = 10 }, deps(fake))
            test.eq(res.error.code, "auth_expired")
            test.eq(res.error.scope, "connection")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
