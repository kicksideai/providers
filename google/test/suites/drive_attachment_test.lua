-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local source = require("drive_folder")

local DOC = "application/vnd.google-apps.document"
local FOLDER = "application/vnd.google-apps.folder"
local VERSION = "9007199254740993"

local function fixture()
    local file = {id = "file", parents = {"folder"}, driveId = "shared", name = "Spec",
        version = VERSION, mimeType = DOC, webViewLink = "https://docs.google.com/document/d/file/edit"}
    local selected = {id = "folder", mimeType = FOLDER, driveId = "shared", capabilities = {canListChildren = true}}
    local state = {file = file, start = "token", exports = 0, move_during_export = false, files = {file}}
    local api = {
        list_changes = function()
            return {success = true, data = {changes = state.changes or {}, newStartPageToken = "next"}}
        end,
        start_changes = function(_, shared)
            test.eq(shared, "shared")
            return {success = true, data = {startPageToken = state.start}}
        end,
        get_file = function(_, id)
            return {success = true, data = id == "folder" and selected or file}
        end,
        list_files = function(_, _, _, token, _, shared)
            test.eq(shared, "shared")
            if state.change_during_listing then state.start = "advanced" end
            if token and state.reject_page then return {success = false, status_code = 400} end
            if state.list_failure then return state.list_failure end
            return {success = true, data = {files = state.files, nextPageToken = not token and state.next_page or nil}}
        end,
        export_file = function(_, id, mime, max)
            test.eq(id, "file")
            test.eq(mime, "text/plain")
            test.eq(max, 10 * 1024 * 1024)
            state.exports = state.exports + 1
            if state.move_during_export then file.parents = {"different-folder"} end
            return {success = true, data = {text = "Discovered contents"}}
        end,
    }
    local deps = {
        drive = api,
        connect = function(id)
            test.eq(id, "connection")
            return {get_info = function()
                return {provider = "google", scopes_granted = "https://www.googleapis.com/auth/drive.readonly"}
            end}
        end,
    }
    local config = {connection_id = "connection", folder_id = "folder"}
    local ref = {file_id = "file", version = VERSION, folder_id = "folder", drive_id = "shared"}
    return state, deps, config, {component_id = "connection", ref = ref}
end

return {run = test.run_cases(function()
    test.describe("Google Drive versioned folder attachments", function()
        test.it("lists a versioned descriptor without downloading and exports the exact Docs revision", function()
            local state, deps, config, request = fixture()
            local page = assert(source.pull({config = config}, deps))
            test.eq(state.exports, 0)
            test.eq(page.items[1].item_key, "google:drive:file")
            test.eq(page.items[1].payload.source_version, VERSION)
            test.eq(page.items[1].payload.attachment.ref.version, VERSION)
            local result = assert(source.fetch(request, deps))
            test.eq(result.filename, "Spec.txt")
            test.eq(result.source_url, "https://docs.google.com/document/d/file/edit")
            test.eq(result.bytes, "Discovered contents")
        end)

        test.it("refuses bytes after the file moves during export", function()
            local state, deps, _, request = fixture()
            state.move_during_export = true
            local result, err = source.fetch(request, deps)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("restarts a rejected listing token and keeps the change anchor", function()
            local state, deps, config = fixture()
            state.next_page = "expired"
            local first = assert(source.pull({config = config}, deps))
            test.eq(first.next_cursor.page_token, "expired")
            state.reject_page = true
            state.next_page = nil
            local restarted = assert(source.pull({config = config, cursor = first.next_cursor}, deps))
            test.eq(restarted.next_cursor.change_token, first.next_cursor.change_token)
            test.eq(restarted.next_cursor.phase, "changes")
            test.eq(#restarted.items, 1)
        end)

        test.it("does not emit subfolders observed in the changes feed", function()
            local state, deps, config = fixture()
            state.changes = {{file = {id = "child-folder", driveId = "shared", parents = {"folder"}, mimeType = FOLDER}}}
            local first = assert(source.pull({config = config}, deps))
            local changes = assert(source.pull({config = config, cursor = first.next_cursor}, deps))
            test.eq(#changes.items, 0)
            test.eq(changes.next_cursor.change_token, "next")
        end)

        test.it("keeps quota responses retryable without treating genuine access failures as quota", function()
            local state, deps, config = fixture()
            state.list_failure = {success = false, status_code = 403, error_kind = "rate_limited", retry_after_ms = 3000}
            local page, err = source.pull({config = config}, deps)
            test.is_nil(page)
            test.is_true(errors.is(err, errors.RATE_LIMITED))
            state.list_failure = {success = false, status_code = 403}
            page, err = source.pull({config = config}, deps)
            test.is_nil(page)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("delays a key sweep when the corpus changes during enumeration", function()
            local state, deps, config = fixture()
            state.change_during_listing = true
            state.files = {}
            local restart = assert(source.pull_keys({config = config}, deps))
            test.is_true(restart.has_more)
            test.eq(restart.next_cursor.phase, "keys_restart")
            test.eq(restart.retry_after_ms, 60000)
            state.change_during_listing = false
            local stable = assert(source.pull_keys({config = config, cursor = restart.next_cursor}, deps))
            test.is_false(stable.has_more)
            test.eq(#stable.keys, 0)
        end)
    end)
end)}
