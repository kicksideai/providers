local test = require("test")
local service = require("service")
local fixture = require("fixture")
local function cases()
    test.describe("Notion workspace workflows", function()
        test.it("searches a cursor page and creates a page using the data-source parent", function()
            local deps, state = fixture.new("notion", {
                {method = "POST", url = "https://api.notion.com/v1/search", body = {query = "Roadmap", page_size = 2},
                    reply = {results = {{id = "ds-1", object = "data_source"}}, next_cursor = "cursor-2", has_more = true},
                    check = function(options) test.eq(options.headers["Notion-Version"], "2025-09-03") end},
                {method = "POST", url = "https://api.notion.com/v1/data_sources/ds-1/query?filter_properties=Name&filter_properties=Status",
                    body = {page_size = 2, start_cursor = "cursor-2"}, reply = {results = {}, has_more = false}},
                {method = "POST", url = "https://api.notion.com/v1/pages",
                    body = {parent = {data_source_id = "ds-1"}, properties = {Name = {title = {{text = {content = "Ship"}}}}}},
                    reply = {object = "page", id = "page-1"}},
            })
            local run = service.new(deps).run
            local page, err = run("search", {query = "Roadmap", page_size = 2}, nil, false)
            test.is_nil(err); test.eq(page.next_cursor, "cursor-2"); test.eq(page.has_more, true)
            local last = run("query_data_source", {data_source_id = "ds-1", page_size = 2, start_cursor = page.next_cursor, filter_properties = {"Name", "Status"}}, nil, false)
            test.eq(last.has_more, false)
            local created = run("create_page", {parent = {data_source_id = "ds-1"}, properties = {Name = {title = {{text = {content = "Ship"}}}}}}, nil, true)
            test.eq(created.data.id, "page-1"); test.eq(state.writes, 1); state.done()
        end)
        test.it("encodes page identifiers as one path segment", function()
            local deps, state = fixture.new("notion", {{method = "GET", url = "https://api.notion.com/v1/pages/a%2Fb%3Fx", reply = {id = "page"}}})
            local result, err = service.new(deps).run("get_page", {page_id = "a/b?x"}, nil, false)
            test.is_nil(err); test.eq(result.success, true); state.done()
        end)
        test.it("owns the multipart file envelope and optional part number without mutating its declaration", function()
            local operation = service.config.operations.send_file_upload
            local deps, state = fixture.new("notion", {{method = "POST", url = "https://api.notion.com/v1/file_uploads/upload1/send",
                reply = {id = "upload1"}, check = function(options)
                    test.ok(options.headers["Content-Type"]:find("multipart/form-data; boundary=kickside-", 1, true) ~= nil)
                    test.ok(options.body:find('name="part_number"\r\n\r\n2\r\n', 1, true) ~= nil)
                    test.ok(options.body:find('name="file"; filename="upload"', 1, true) ~= nil)
                    test.ok(options.body:find("hello\0world", 1, true) ~= nil)
                end}})
            local result, err = service.new(deps).run("send_file_upload", {file_upload_id = "upload1", part_number = 2,
                content_base64 = "aGVsbG8Ad29ybGQ="}, nil, true)
            test.is_nil(err); test.eq(result.data.id, "upload1"); state.done()
            test.eq(operation.mode, "notion_upload")
        end)
        test.it("rejects missing write properties and oversized append batches locally", function()
            local deps, state = fixture.new("notion", {})
            local result, err = service.new(deps).run("create_page", {parent = {page_id = "page"}}, nil, true)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID))
            local children = {}; for i = 1, 101 do children[i] = {object = "block"} end
            result, err = service.new(deps).run("append_block_children", {block_id = "page", children = children}, nil, true)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); state.done()
        end)
    end)
end
return {run = test.run_cases(cases)}
