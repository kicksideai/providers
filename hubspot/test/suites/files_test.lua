local test = require("test")
local refs = require("refs")
local fetcher = require("fetcher")
local registry = require("registry")

local LINK = "https://api-na2.hubspot.com/form-integrations/v1/uploaded-files/signed-url-redirect/"
local SIGNED = "https://cdn.example.test/signed/abc?X-Signature=secret"

type Calls = { meta: integer, url: integer, http: integer, url_seen: string? }

local function stub(opts: any): Calls
    local calls: Calls = { meta = 0, url = 0, http = 0 }
    fetcher._transport = {
        connect = function(_component_id: string): (any, any)
            if opts.no_conn then return nil, "no connection" end
            return { api_key = "pat" }, nil
        end,
        get_file = function(_conn: any, _id: string): (any, any)
            calls.meta = calls.meta + 1
            return opts.meta or { success = true, status_code = 200,
                data = { name = "Northwind_brief", extension = "pdf", size = 5, archived = false } }, nil
        end,
        get_file_signed_url = function(_conn: any, _id: string): (any, any)
            calls.url = calls.url + 1
            return opts.signed or { success = true, status_code = 200, data = { url = SIGNED } }, nil
        end,
    }
    fetcher._http = {
        request = function(method: string, url: string, _o: any): (any, any)
            calls.http = calls.http + 1
            calls.url_seen = method .. " " .. url
            if opts.http_err then return nil, "dial " .. url end
            return opts.response or { status_code = 200, body = "%PDF-",
                headers = { ["Content-Type"] = "application/pdf" } }, nil
        end,
    }
    return calls
end

local function define_tests()
    test.describe("HubSpot form file refs", function()
        test.it("parses ids from ;-separated form links in order, without duplicates", function()
            local value = LINK .. "421352880884?portalId=1&sign=x ; " .. LINK .. "421331183346;"
                .. LINK .. "421352880884?again=1"
            local parsed = refs.parse(value)
            test.eq(#parsed.refs, 2)
            test.eq(parsed.refs[1].ref, "421352880884")
            test.eq(parsed.refs[2].ref, "421331183346")
            test.eq(parsed.skipped, 0)
        end)

        test.it("counts non-HubSpot entries as skipped and accepts empty values", function()
            local parsed = refs.parse("https://example.test/file.pdf; ;" .. LINK .. "7")
            test.eq(#parsed.refs, 1)
            test.eq(parsed.refs[1].ref, "7")
            test.eq(parsed.skipped, 1)
            test.eq(#refs.parse(nil).refs, 0)
            test.eq(#refs.parse("").refs, 0)
        end)

        test.it("refuses non-string values", function()
            local parsed, err = refs.parse({})
            test.is_nil(parsed)
            test.not_nil(err)
        end)
    end)

    test.describe("HubSpot attachment fetcher", function()
        test.it("downloads metadata, signed URL and bytes", function()
            local calls = stub({})
            local out = fetcher.fetch_attachment({ ref = "421352880884", component_id = "c1" })
            test.is_nil(out.error)
            test.eq(out.bytes, "%PDF-")
            test.eq(out.filename, "Northwind_brief.pdf")
            test.eq(out.content_type, "application/pdf")
            test.eq(out.size, 5)
            test.eq(calls.url_seen, "GET " .. SIGNED)
        end)

        test.it("falls back to the extension for the content type", function()
            stub({ response = { status_code = 200, body = "png", headers = { ["content-type"] = "application/octet-stream" } },
                meta = { success = true, data = { name = "logo.png", extension = "png", size = 3 } } })
            local out = fetcher.fetch_attachment({ ref = "1" })
            test.eq(out.filename, "logo.png")
            test.eq(out.content_type, "image/png")
        end)

        test.it("takes the type from the extension over the download's header", function()
            stub({ response = { status_code = 200, body = "%PDF-", headers = { ["Content-Type"] = "binary/octet-stream" } } })
            test.eq(fetcher.fetch_attachment({ ref = "1" }).content_type, "application/pdf")
            stub({ response = { status_code = 200, body = "%PDF-", headers = { ["Content-Type"] = "text/html" } } })
            test.eq(fetcher.fetch_attachment({ ref = "1" }).content_type, "application/pdf")
        end)

        test.it("uses the header for an unknown extension, never a generic octet-stream", function()
            local meta = { success = true, data = { name = "notes", extension = "md", size = 3 } }
            stub({ meta = meta, response = { status_code = 200, body = "# x", headers = { ["Content-Type"] = "text/markdown; charset=utf-8" } } })
            test.eq(fetcher.fetch_attachment({ ref = "1" }).content_type, "text/markdown")
            for _, generic in ipairs({ "binary/octet-stream", "application/octet-stream" }) do
                stub({ meta = meta, response = { status_code = 200, body = "# x", headers = { ["Content-Type"] = generic } } })
                test.is_nil(fetcher.fetch_attachment({ ref = "1" }).content_type)
            end
        end)

        test.it("maps HubSpot access and missing files onto shared codes", function()
            stub({ meta = { success = false, status_code = 403 } })
            test.is_true(fetcher.fetch_attachment({ ref = "1" }).error:find("^no_access:") ~= nil)
            stub({ meta = { success = false, status_code = 404 } })
            test.is_true(fetcher.fetch_attachment({ ref = "1" }).error:find("^not_found:") ~= nil)
            stub({ meta = { success = true, data = { archived = true } } })
            test.is_true(fetcher.fetch_attachment({ ref = "1" }).error:find("^not_found:") ~= nil)
            stub({ no_conn = true })
            test.is_true(fetcher.fetch_attachment({ ref = "1" }).error:find("^no_access:") ~= nil)
            test.is_true(fetcher.fetch_attachment({ ref = "../x" }).error:find("^not_found:") ~= nil)
        end)

        test.it("refuses a declared oversize file before asking for a URL", function()
            local calls = stub({ meta = { success = true, data = { size = fetcher.MAX_BYTES + 1 } } })
            local out = fetcher.fetch_attachment({ ref = "1" })
            test.is_true(out.error:find("^too_large:") ~= nil)
            test.eq(calls.url, 0)
            test.eq(calls.http, 0)
        end)

        test.it("never returns the signed URL inside an error", function()
            stub({ http_err = true })
            local out = fetcher.fetch_attachment({ ref = "1" })
            test.is_true(out.error:find("^download_failed:") ~= nil)
            test.is_nil(out.error:find("signed", 1, true))
            stub({ response = { status_code = 403, body = SIGNED } })
            out = fetcher.fetch_attachment({ ref = "1" })
            test.eq(out.error, "download_failed: download HTTP 403")
        end)
    end)

    test.describe("HubSpot attachment.fetcher declaration", function()
        test.it("names the fetch and parse functions", function()
            local entry = registry.get("kickside.hubspot.files:attachment_fetcher")
            test.not_nil(entry)
            test.eq(entry.meta.type, "attachment.fetcher")
            test.eq(entry.data.provider, "hubspot")
            test.eq(entry.data.fetch_func, "kickside.hubspot.files:fetch_attachment")
            test.eq(entry.data.parse_func, "kickside.hubspot.files:parse_refs")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
