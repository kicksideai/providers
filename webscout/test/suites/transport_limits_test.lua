local test = require("test")
local read = require("read")
local links = require("links")
local client = require("client")

-- A long page, so the complete-content path is under test rather than a lucky
-- short answer.
local LONG_TEXT = string.rep("Fixture Systems ships legal analytics. ", 4000)
local LONG_PAGE = "<html><body><p>" .. LONG_TEXT .. "</p></body></html>"

local function responder(body, content_type, seen)
    return {
        get = function(url, options)
            seen.url = url
            seen.options = options
            return {
                status_code = 200,
                url = url,
                headers = { ["content-type"] = content_type or "text/html; charset=utf-8" },
                body = body,
            }, nil
        end,
    }
end

local function define_tests()
    test.describe("WebScout transport limits", function()
        test.it("returns the complete text of a long page", function()
            local seen: any = {}
            local content, err = read.handle({ url = "https://fixture.example/long" }, {
                client = responder(LONG_PAGE, nil, seen),
            })
            test.is_nil(err)
            test.eq(content, (LONG_TEXT:gsub("%s+$", "")))
        end)

        test.it("asks the transport for no limits of its own when the caller states none", function()
            local seen: any = {}
            read.handle({ url = "https://fixture.example/page" }, {
                client = responder("<html><body>short</body></html>", nil, seen),
            })
            -- Nothing guessed: the client fills these in from the deployment.
            test.is_nil(seen.options.max_response_body)
            test.is_nil(seen.options.timeout)
            test.is_nil(seen.options.headers)
        end)

        test.it("still honours transport values from a caller that owns them", function()
            local seen: any = {}
            read.handle({
                url = "https://fixture.example/page",
                max_response_body = 4096,
                timeout = 7,
                user_agent = "Kickside-Research/1",
            }, { client = responder("<html><body>short</body></html>", nil, seen) })
            test.eq(seen.options.max_response_body, 4096)
            test.eq(seen.options.timeout, 7)
            test.eq(seen.options.headers["User-Agent"], "Kickside-Research/1")
        end)

        test.it("reads a page when the model supplies only a url", function()
            local seen: any = {}
            local content, err = read.handle({ url = "https://fixture.example/page" }, {
                client = responder("<html><body>Readable.</body></html>", nil, seen),
            })
            test.is_nil(err)
            test.eq(content, "Readable.")
        end)

        test.it("pages every link on the page with limit and cursor", function()
            local page_html = '<html><body><a href="https://fixture.example/a">a</a>'
                .. '<a href="https://fixture.example/b">b</a><img src="https://fixture.example/c.png"></body></html>'
            local first, err = links.handle({ url = "https://fixture.example/page", limit = 2 }, {
                client = responder(page_html, nil, {}),
            })
            test.is_nil(err)
            test.eq(first.total_links, 3)
            test.eq(#first.links, 2)
            test.eq(first.links[2], "https://fixture.example/b")
            test.eq(first.next_cursor, "2")
            local rest = links.handle({ url = "https://fixture.example/page", limit = 2, cursor = first.next_cursor }, {
                client = responder(page_html, nil, {}),
            })
            test.eq(rest.total_links, 3)
            test.eq(#rest.links, 1)
            test.eq(rest.links[1], "https://fixture.example/c.png")
            test.is_nil(rest.next_cursor)
            local _, cursor_err = links.handle({ url = "https://fixture.example/page", cursor = "two" }, {
                client = responder(page_html, nil, {}),
            })
            test.is_true(errors.is(cursor_err, errors.INVALID))
            test.contains(cursor_err:message(), "cursor must be a next_cursor value")
        end)

        test.it("refuses a page that yields no text instead of returning nothing", function()
            -- The empty read is the dangerous one: a caller that gets "" back
            -- with no error has no way to tell an empty page from a page with
            -- nothing to say, and falls back to whatever it already believed.
            local seen: any = {}
            local content, err = read.handle({ url = "https://fixture.example/shell" }, {
                client = responder("<html><head><title>Shell</title></head><body></body></html>", nil, seen),
            })
            test.is_nil(content)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.contains(err:message(), "no readable text")

            local blank, blank_err = read.handle({ url = "https://fixture.example/blank" }, {
                client = responder("   \n\t  ", "text/plain", seen),
            })
            test.is_nil(blank)
            test.is_true(errors.is(blank_err, errors.NOT_FOUND))
            test.contains(blank_err:message(), "no readable text")
        end)

        test.it("fails bad requests and unreachable pages with typed errors", function()
            local seen: any = {}
            local _, read_missing = read.handle({}, { client = responder("", nil, seen) })
            local _, links_missing = links.handle({ url = 7 }, { client = responder("", nil, seen) })
            test.is_true(errors.is(read_missing, errors.INVALID))
            test.is_true(errors.is(links_missing, errors.INVALID))

            local down = { get = function(): (any, any) return nil, "connection refused" end }
            local _, read_down = read.handle({ url = "https://fixture.example/down" }, { client = down })
            local _, links_down = links.handle({ url = "https://fixture.example/down" }, { client = down })
            test.is_true(errors.is(read_down, errors.UNAVAILABLE))
            test.is_true(errors.is(links_down, errors.UNAVAILABLE))
            test.contains(read_down:message(), "connection refused")

            local gone = { get = function(url: string): (any, any)
                return { status_code = 404, url = url, headers = {}, body = "" }, nil
            end }
            local read_gone, read_gone_err = read.handle({ url = "https://fixture.example/gone" }, { client = gone })
            test.is_nil(read_gone_err)
            test.eq(read_gone.success, false)
            test.eq(read_gone.status_code, 404)

            local links_gone, links_gone_err = links.handle({ url = "https://fixture.example/gone" }, { client = gone })
            test.is_nil(links_gone_err)
            test.eq(links_gone.success, false)
            test.eq(links_gone.status_code, 404)

            local unavailable = { get = function(url: string): (any, any)
                return { status_code = 503, url = url, headers = {}, body = "" }, nil
            end }
            local _, read_unavailable = read.handle({ url = "https://fixture.example/unavailable" }, { client = unavailable })
            local _, links_unavailable = links.handle({ url = "https://fixture.example/unavailable" }, { client = unavailable })
            test.is_true(errors.is(read_unavailable, errors.UNAVAILABLE))
            test.is_true(errors.is(links_unavailable, errors.UNAVAILABLE))

            local _, binary = read.handle({ url = "https://fixture.example/image" },
                { client = responder("PNG", "image/png", seen) })
            test.is_true(errors.is(binary, errors.INVALID))
        end)

        test.it("extracts links when the model supplies only a url", function()
            local seen: any = {}
            local result, err = links.handle({ url = "https://fixture.example/page" }, {
                client = responder(
                    '<html><body><a href="https://fixture.example/a">a</a>'
                        .. '<a href="/relative">b</a></body></html>',
                    nil, seen
                ),
            })
            test.is_nil(err)
            test.eq(result.absolute_only, true)
            test.eq(result.total_links, 2)
            test.is_nil(seen.options.max_response_body)
        end)

        test.it("fills transport limits from the deployment, not from the caller", function()
            test.eq(client.CONFIG.DEFAULT_TIMEOUT, 30)
            test.eq(client.CONFIG.MAX_RESPONSE_BODY > 1000000, true)
            -- No user_agent setting in this harness, so the built-in stands in.
            test.contains(client.get_user_agent(), "Mozilla/5.0")
            local headers = client.merge_headers(nil)
            test.contains(headers["User-Agent"], "Mozilla/5.0")
            test.eq(client.merge_headers({ ["User-Agent"] = "Caller/1" })["User-Agent"], "Caller/1")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
