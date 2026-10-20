local test = require("test")
local service = require("service")
local fixture = require("fixture")
local json = require("json")
local function cases()
    test.describe("Dropbox file workflows", function()
        test.it("uses JSON null for no-argument RPC and follows folder cursors", function()
            local deps, state = fixture.new("dropbox", {
                {method = "POST", url = "https://api.dropboxapi.com/2/users/get_current_account", check = function(o) test.eq(o.body, "null") end, reply = {account_id = "dbid:1"}},
                {method = "POST", url = "https://api.dropboxapi.com/2/files/list_folder", body = {path = "", limit = 2}, reply = {entries = {{id = "id:1", name = "hello.txt"}}, cursor = "c1", has_more = true}},
                {method = "POST", url = "https://api.dropboxapi.com/2/files/list_folder/continue", body = {cursor = "c1"}, reply = {entries = {}, cursor = "c2", has_more = false}},
            })
            local run = service.new(deps).run
            test.eq(run("get_account", {}, nil, false).data.account_id, "dbid:1")
            local page = run("list_folder", {path = "", limit = 2}, nil, false)
            test.eq(page.next_cursor, "c1"); test.eq(page.has_more, true)
            test.eq(run("continue_list_folder", {cursor = page.next_cursor}, nil, false).has_more, false); state.done()
        end)
        test.it("uploads binary bytes and downloads them through the content endpoint", function()
            local deps, state = fixture.new("dropbox", {
                {method = "POST", url = "https://content.dropboxapi.com/2/files/upload", reply = {id = "id:1", rev = "rev1"}, check = function(o)
                    test.eq(o.body, "hello\0world")
                    test.eq(o.headers["Content-Type"], "application/octet-stream")
                    local arg = json.decode(o.headers["Dropbox-API-Arg"])
                    test.eq(arg.path, "/hello.txt"); test.eq(arg.mode, "add"); test.is_nil(arg.content_base64)
                end},
                {method = "POST", url = "https://content.dropboxapi.com/2/files/download", raw = "hello\0world", check = function(o)
                    test.eq(json.decode(o.headers["Dropbox-API-Arg"]).path, "id:1")
                end},
            })
            local run = service.new(deps).run
            local result, err = run("upload_file", {path = "/hello.txt", mode = "add", content_base64 = "aGVsbG8Ad29ybGQ="}, nil, true)
            test.is_nil(err); test.eq(result.data.rev, "rev1")
            test.eq(run("download_file", {path = "id:1"}, nil, false).data.content_base64, "aGVsbG8Ad29ybGQ="); state.done()
        end)
        test.it("rejects malformed file content before opening the connection", function()
            local deps, state = fixture.new("dropbox", {})
            local result, err = service.new(deps).run("upload_file", {path = "/x", content_base64 = "not!base64"}, nil, true)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); test.eq(state.writes, 0); state.done()
        end)
    end)
end
return {run = test.run_cases(cases)}
