local test = require("test")
local service = require("service")
local fixture = require("fixture")
local function cases()
    test.describe("Box content workflows", function()
        test.it("supports marker folder pages and offset search pages", function()
            local deps, state = fixture.new("box", {
                {method = "GET", url = "https://api.box.com/2.0/folders/0/items?limit=2&usemarker=true", reply = {entries = {{id = "1", name = "one"}}, next_marker = "marker-2"}},
                {method = "GET", url = "https://api.box.com/2.0/search?limit=2&offset=2&query=report", reply = {entries = {{id = "3"}, {id = "4"}}, offset = 2, total_count = 5}},
            })
            local run = service.new(deps).run
            local page, err = run("list_folder_items", {folder_id = "0", limit = 2}, nil, false)
            test.is_nil(err); test.eq(page.next_cursor, "marker-2")
            local search = run("search", {query = "report", limit = 2, offset = 2}, nil, false)
            test.eq(search.next_cursor, "4"); test.eq(search.has_more, true); state.done()
        end)
        test.it("uploads multipart data with file attributes and preserves binary bytes", function()
            local deps, state = fixture.new("box", {{method = "POST", url = "https://upload.box.com/api/2.0/files/content", reply = {entries = {{id = "file1"}}}, check = function(o)
                test.ok(o.headers["Content-Type"]:find("multipart/form-data; boundary=kickside-", 1, true) ~= nil)
                test.ok(o.body:find('"name":"hello.txt"', 1, true) ~= nil)
                test.ok(o.body:find('"parent":{"id":"0"}', 1, true) ~= nil)
                test.ok(o.body:find("hello\0world", 1, true) ~= nil)
            end}})
            local result, err = service.new(deps).run("upload_file", {name = "hello.txt", parent_id = "0", content_base64 = "aGVsbG8Ad29ybGQ="}, nil, true)
            test.is_nil(err); test.eq(result.data.entries[1].id, "file1"); state.done()
        end)
        test.it("sends metadata patches as a JSON Patch array and uses explicit revision conditions", function()
            local deps, state = fixture.new("box", {
                {method = "PUT", url = "https://api.box.com/2.0/files/f1/metadata/enterprise/template", body = {{op = "replace", path = "/status", value = "done"}}, check = function(o)
                    test.eq(o.headers["Content-Type"], "application/json-patch+json")
                end},
                {method = "DELETE", url = "https://api.box.com/2.0/files/f1", status = 204, raw = "", check = function(o) test.eq(o.headers["If-Match"], "rev-1") end},
            })
            local run = service.new(deps).run
            local result, err = run("update_file_metadata", {file_id = "f1", scope = "enterprise", template_key = "template", operations = {{op = "replace", path = "/status", value = "done"}}}, nil, true)
            test.is_nil(err); test.eq(result.success, true)
            test.eq(run("delete_file", {file_id = "f1", if_match = "rev-1"}, nil, true).success, true); state.done()
        end)
        test.it("uploads session parts with computed digests and commits with a whole-file digest", function()
            local deps, state = fixture.new("box", {
                {method = "PUT", url = "https://upload.box.com/api/2.0/files/upload_sessions/session1",
                    reply = {part = {part_id = "part1", offset = 0, size = 11, sha1 = "f85b420f1e43ebf88649dfcab302b898d889606c"}}, check = function(o)
                        test.eq(o.body, "hello\0world")
                        test.eq(o.headers["Content-Range"], "bytes 0-10/11")
                        test.eq(o.headers.Digest, "sha=+FtCDx5D6/iGSd/KswK4mNiJYGw=")
                    end},
                {method = "POST", url = "https://upload.box.com/api/2.0/files/upload_sessions/session1/commit", status = 202,
                    raw = "", headers = {["Retry-After"] = "2"}, check = function(o)
                        test.eq(o.headers.Digest, "sha=+FtCDx5D6/iGSd/KswK4mNiJYGw=")
                        test.is_nil(o.body:find("sha1_base64", 1, true))
                        test.ok(o.body:find('"part_id":"part1"', 1, true) ~= nil)
                    end},
            })
            local run = service.new(deps).run
            local part, err = run("upload_session_part", {upload_session_id = "session1", offset = 0, total_size = 11, content_base64 = "aGVsbG8Ad29ybGQ="}, nil, true)
            test.is_nil(err)
            local commit = run("commit_upload_session", {upload_session_id = "session1", parts = {part.data.part}, sha1_base64 = "+FtCDx5D6/iGSd/KswK4mNiJYGw="}, nil, true)
            test.eq(commit.success, true); test.eq(commit.status_code, 202); test.eq(commit.retry_after_ms, 2000); state.done()
        end)
        test.it("removes shared links with JSON null rather than silently omitting the field", function()
            local deps, state = fixture.new("box", {{method = "PUT", url = "https://api.box.com/2.0/files/f1",
                check = function(o) test.eq(o.body, '{"shared_link":null}') end, reply = {id = "f1"}}})
            local result, err = service.new(deps).run("remove_file_shared_link", {file_id = "f1"}, nil, true)
            test.is_nil(err); test.eq(result.success, true); state.done()
        end)
    end)
end
return {run = test.run_cases(cases)}
