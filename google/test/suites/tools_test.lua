local test = require("test")
local transport = require("transport")
local gmail = require("gmail")
local calendar = require("calendar")
local sheets = require("sheets")
local slides = require("slides")
local drive = require("drive")
local docs = require("docs")
local contacts = require("contacts")
local analytics = require("analytics")
local gmail_tool = require("gmail_tool")
local calendar_tool = require("calendar_tool")
local sheets_tool = require("sheets_tool")
local slides_tool = require("slides_tool")
local drive_tool = require("drive_tool")
local docs_tool = require("docs_tool")

local LONG = string.rep("é complete text ", 3000)

local function stub(module: any, name: string, value: any): any
    local previous = module[name]
    module[name] = value
    return previous
end

local function ok(data: any): any
    return function(...: any): any return { success = true, data = data } end
end

local function define_tests()
    test.describe("Google tools return structured records", function()
        local connect = nil
        test.before_each(function()
            connect = stub(transport, "connect", function(): (any, any) return { access_token = "token" }, nil end)
        end)
        test.after_each(function()
            transport.connect = connect
        end)

        test.it("returns a complete Gmail message and thread as records", function()
            local message = { id = "m1", threadId = "t1", labelIds = { "INBOX" }, historyId = "h9",
                internalDate = "1760518800000", sizeEstimate = 4096, payload = {
                headers = { { name = "From", value = "ada@example.test" }, { name = "Subject", value = "Plan" } },
                body = { data = gmail._encode_base64url(LONG) },
                parts = { { filename = "a.pdf", mimeType = "application/pdf", body = { size = 3, attachmentId = "att" } } },
            } }
            local get_message = stub(gmail, "get_message", ok(message))
            local get_thread = stub(gmail, "get_thread", ok({ id = "t1", historyId = "h9", messages = { message, message } }))
            local got: any, err = gmail_tool.handler({ action = "get_message", message_id = "m1" })
            local thread: any = gmail_tool.handler({ action = "get_thread", thread_id = "t1" })
            gmail.get_message, gmail.get_thread = get_message, get_thread
            test.is_nil(err)
            test.eq(got.from, "ada@example.test")
            test.eq(got.subject, "Plan")
            test.eq(got.labelIds[1], "INBOX")
            test.eq(got.internalDate, "1760518800000")
            test.eq(got.sizeEstimate, 4096)
            test.eq(got.historyId, "h9")
            test.eq(got.payload.headers[1].name, "From")
            test.eq(got.attachments[1].filename, "a.pdf")
            test.eq(thread.id, "t1")
            test.eq(thread.historyId, "h9")
            test.eq(#thread.messages, 2)
            test.eq(thread.messages[2].threadId, "t1")
            test.eq(thread.messages[2].body, LONG)
        end)

        test.it("lists compact Gmail messages, threads and drafts", function()
            local headers = {
                { name = "Subject", value = "Plan" }, { name = "From", value = "ada@example.test" },
                { name = "To", value = "bob@example.test" }, { name = "Date", value = "Thu, 15 Oct 2026 09:00:00 +0000" },
            }
            local metadata = { id = "m1", threadId = "t1", labelIds = { "INBOX", "UNREAD" }, snippet = "Draft plan",
                internalDate = "1760518800000", sizeEstimate = 2048, historyId = "h1", payload = { headers = headers } }
            local list_messages = stub(gmail, "list_messages", ok({ messages = { { id = "m1", threadId = "t1" } }, nextPageToken = "next", resultSizeEstimate = 7 }))
            local list_threads = stub(gmail, "list_threads", ok({ threads = { { id = "t1", snippet = "Draft plan", historyId = "h1" } } }))
            local list_drafts = stub(gmail, "list_drafts", ok({ drafts = { { id = "d1", message = { id = "m1" } } } }))
            local get_message_metadata = stub(gmail, "get_message_metadata", function(_, _, headers)
                test.eq(headers[1], "Subject")
                return {success = true, data = metadata}
            end)
            local get_thread_metadata = stub(gmail, "get_thread_metadata", ok({ id = "t1", messages = { metadata, metadata } }))
            local get_draft = stub(gmail, "get_draft", function(_, id: any, format: any): any
                return { success = true, data = { id = id, format = format, message = metadata } }
            end)
            local messages: any = gmail_tool.handler({ action = "list_messages", query = "is:unread" })
            local threads: any = gmail_tool.handler({ action = "list_threads" })
            local drafts: any = gmail_tool.handler({ action = "list_drafts" })
            gmail.list_messages, gmail.list_threads, gmail.list_drafts = list_messages, list_threads, list_drafts
            gmail.get_message_metadata, gmail.get_thread_metadata, gmail.get_draft = get_message_metadata, get_thread_metadata, get_draft
            local row = messages.messages[1]
            test.eq(row.id, "m1")
            test.eq(row.threadId, "t1")
            test.eq(row.subject, "Plan")
            test.eq(row.from, "ada@example.test")
            test.eq(row.to, "bob@example.test")
            test.eq(row.date, "Thu, 15 Oct 2026 09:00:00 +0000")
            test.eq(row.snippet, "Draft plan")
            test.eq(row.labelIds[2], "UNREAD")
            test.eq(row.internalDate, "1760518800000")
            test.eq(row.sizeEstimate, 2048)
            test.eq(row.historyId, "h1")
            test.is_nil(row.payload)
            test.is_nil(row.body)
            test.eq(messages.next_page_token, "next")
            test.eq(messages.result_size_estimate, 7)
            test.is_nil(threads.threads[1].messages)
            test.eq(threads.threads[1].snippet, "Draft plan")
            test.eq(drafts.drafts[1].id, "d1")
            test.eq(drafts.drafts[1].message.to, "bob@example.test")
            test.eq(drafts.drafts[1].message.sizeEstimate, 2048)
        end)

        test.it("uses summary field masks and preserves requested Google fields and paging", function()
            local seen: any = nil
            local get = stub(transport, "get", function(_, _, query)
                seen = query
                return {success = true, data = {files = {}, nextPageToken = "next"}}
            end)
            drive.list_files({} :: any, nil, 1, "previous")
            test.eq(seen.fields, "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress))")
            test.eq(seen.pageToken, "previous")
            drive.search_files({} :: any, "Plan", 1, "next", "id,name,description")
            test.eq(seen.fields, "nextPageToken,files(id,name,description)")
            drive.get_file({} :: any, "f1")
            test.eq(seen.fields, "*")
            for _, service in ipairs({docs, sheets, slides}) do
                local list = service.list_documents or service.list_spreadsheets or service.list_presentations
                list({} :: any, 1, "previous", "id,name,description")
                test.eq(seen.fields, "nextPageToken,files(id,name,description)")
            end
            calendar.list_events({} :: any, "primary", {max_results = 1, page_token = "next", fields = "id,description"})
            test.eq(seen.fields, "nextPageToken,items(id,description)")
            calendar.list_events({} :: any, "primary", {})
            test.is_nil(seen.fields:find("description", 1, true))
            transport.get = get
        end)

        test.it("requests bounded Gmail headers and explicit fields without changing detail", function()
            local seen = ""
            local request = stub(transport, "request_json", function(_, _, url)
                seen = url
                return {success = true, data = {id = "m1", payload = {headers = {{name = "X-Tag", value = "tag"}}}}}
            end)
            gmail.get_message_metadata({} :: any, "m1")
            test.contains(seen, "format=metadata")
            test.is_nil((seen:find("metadataHeaders", 1, true)))
            -- The list request itself is separately paged by Gmail.
            gmail.get_message_metadata({} :: any, "m1", {"X-Tag"}, "id,payload")
            test.contains(seen, "fields=id%2Cpayload")
            test.contains(seen, "metadataHeaders=X-Tag")
            gmail.get_thread_metadata({} :: any, "t1", {"X-Tag"}, "id,messages(payload)")
            test.contains(seen, "format=metadata")
            test.contains(seen, "metadataHeaders=X-Tag")
            gmail.get_message({} :: any, "m1")
            test.contains(seen, "format=full")
            transport.request_json = request
        end)

        test.it("pages compact Gmail labels and returns requested label fields", function()
            local list = stub(gmail, "list_labels", ok({labels = {
                {id = "l1", name = "Plans", type = "user", color = {textColor = "red"}},
                {id = "l2", name = "Work", type = "user"},
            }}))
            local first: any = gmail_tool.handler({action = "list_labels", max_results = 1})
            local last: any = gmail_tool.handler({action = "list_labels", max_results = 1, page_token = first.next_page_token})
            local full: any = gmail_tool.handler({action = "list_labels", max_results = 1, fields = "id,name,color"})
            gmail.list_labels = list
            test.eq(#first.labels, 1)
            test.eq(first.labels[1].id, "l1")
            test.is_nil(first.labels[1].color)
            test.eq(first.next_page_token, "1")
            test.eq(last.labels[1].id, "l2")
            test.is_nil(last.next_page_token)
            test.eq(full.labels[1].color.textColor, "red")
        end)

        test.it("keeps draft requests within the provider API and rejects unsupported header selection", function()
            local seen = ""
            local request = stub(transport, "request_json", function(_, _, url)
                seen = url
                return {success = true, data = {id = "d1", message = {id = "m1"}}}
            end)
            gmail.get_draft({} :: any, "d1", "metadata")
            local unsupported: any = gmail_tool.handler({action = "list_drafts", metadata_headers = {"X-Tag"}})
            transport.request_json = request
            test.is_nil((seen:find("metadataHeaders", 1, true)))
            test.is_false(unsupported.success)
            test.contains(unsupported.error, "metadata_headers")
        end)

        test.it("returns a failed Gmail row read as the list failure", function()
            local list_messages = stub(gmail, "list_messages", ok({ messages = { { id = "m1", threadId = "t1" } } }))
            local get_message_metadata = stub(gmail, "get_message_metadata", function(): any
                return { success = false, error = "Requested entity was not found.", status_code = 404, data = { error = { code = 404 } } }
            end)
            local result: any = gmail_tool.handler({ action = "list_messages" })
            gmail.list_messages, gmail.get_message_metadata = list_messages, get_message_metadata
            test.is_false(result.success)
            test.eq(result.error, "Requested entity was not found.")
            test.eq(result.status_code, 404)
            test.eq(result.data.error.code, 404)
        end)

        test.it("fails with the typed transport and connection errors", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            local list_messages = stub(gmail, "list_messages", ok({ messages = { { id = "m1", threadId = "t1" } } }))
            local get_message_metadata = stub(gmail, "get_message_metadata", function(): (any?, error?) return nil, failure end)
            local listed, list_err = gmail_tool.handler({ action = "list_messages" })
            gmail.list_messages, gmail.get_message_metadata = list_messages, get_message_metadata
            test.is_nil(listed)
            test.eq(list_err, failure)
            local get_event = stub(calendar, "get_event", function(): (any?, error?) return nil, failure end)
            local event, event_err = calendar_tool.handler({ action = "get_event", event_id = "e1" })
            calendar.get_event = get_event
            test.is_nil(event)
            test.eq(event_err, failure)
            local denied = errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" })
            transport.connect = function(): (any, any) return nil, denied end
            local file, file_err = drive_tool.handler({ action = "get_file", file_id = "f1" })
            test.is_nil(file)
            test.eq(file_err, denied)
        end)

        test.it("returns Gmail errors as errors", function()
            local result: any = gmail_tool.handler({ action = "get_message" })
            test.is_false(result.success)
            test.eq(result.error, "message_id required")
        end)

        test.it("returns full calendar events with a page token", function()
            local event = { id = "e1", summary = "Review", description = LONG, attendees = { { email = "a@example.test", responseStatus = "accepted" } } }
            local list_events = stub(calendar, "list_events", ok({ items = { event }, nextPageToken = "p2" }))
            local get_event = stub(calendar, "get_event", ok(event))
            local page: any = calendar_tool.handler({ action = "list_events", time_min = "2026-01-01T00:00:00Z" })
            local one: any = calendar_tool.handler({ action = "get_event", event_id = "e1" })
            calendar.list_events, calendar.get_event = list_events, get_event
            test.eq(page.events[1].attendees[1].responseStatus, "accepted")
            test.eq(page.next_page_token, "p2")
            test.eq(one.description, LONG)
        end)

        test.it("returns every row of a Sheets range", function()
            local rows = {}
            for i = 1, 300 do rows[i] = { "row" .. tostring(i), LONG } end
            local read_range = stub(sheets, "read_range", ok({ range = "Sheet1!A1:B300", majorDimension = "ROWS", values = rows }))
            local result: any = sheets_tool.handler({ action = "read_range", spreadsheet_id = "s1", range = "Sheet1!A1:B300" })
            sheets.read_range = read_range
            test.eq(#result.values, 300)
            test.eq(result.values[300][1], "row300")
            test.eq(result.values[2][2], LONG)
            test.eq(result.range, "Sheet1!A1:B300")
        end)

        test.it("returns the text of every slide", function()
            local slide_list = {}
            for i = 1, 40 do
                slide_list[i] = { objectId = "s" .. tostring(i), pageElements = { { shape = { text = { textElements = { { textRun = { content = LONG } } } } } } } }
            end
            local read_presentation = stub(slides, "read_presentation", ok({ presentationId = "p1", title = "Deck", slides = slide_list }))
            local result: any = slides_tool.handler({ action = "read_presentation", presentation_id = "p1" })
            slides.read_presentation = read_presentation
            test.eq(#result.slides, 40)
            test.eq(result.slides[40].object_id, "s40")
            test.eq(result.slides[2].text, (LONG:gsub("%s+$", "")))
        end)

        test.it("requests summary fields for lists and full provider fields for detail", function()
            local requests: { any } = {}
            local request_json = stub(transport, "request_json", function(_, method: string, endpoint: string, _body: any, query: any): any
                requests[#requests + 1] = { method = method, endpoint = endpoint, query = query or {} }
                return { success = true, data = {} }
            end)
            drive.list_files(({} :: any), nil, nil, nil)
            drive.get_file(({} :: any), "f1")
            sheets.get_spreadsheet(({} :: any), "s1")
            slides.get_presentation(({} :: any), "p1")
            gmail.get_message_metadata(({} :: any), "m1")
            transport.request_json = request_json
            test.eq(requests[1].query.fields, "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress))")
            test.eq(requests[2].query.fields, "*")
            test.is_nil(requests[3].query.fields)
            test.is_nil(requests[4].query.fields)
            test.is_nil((requests[5].endpoint:find("metadataHeaders", 1, true)))
        end)

        test.it("selects contact and analytics summary fields while preserving explicit selection and full detail", function()
            local seen: any = nil
            local get = stub(transport, "get", function(_, _, query)
                seen = query
                return {success = true, data = {}}
            end)
            contacts.list_connections({} :: any, 1, "next")
            test.eq(seen.personFields, "names,emailAddresses,phoneNumbers,organizations")
            test.eq(seen.pageToken, "next")
            contacts.search_contacts({} :: any, "Ada", 1, "names,biographies")
            test.eq(seen.readMask, "names,biographies")
            contacts.get_contact({} :: any, "people/p1")
            test.contains(seen.personFields, "biographies")
            analytics.list_properties({} :: any, "123", 1, "next", "name,displayName,industryCategory")
            test.eq(seen.fields, "nextPageToken,properties(name,displayName,industryCategory)")
            transport.get = get
        end)

        test.it("returns complete Drive file and Docs document content", function()
            local get_file = stub(drive, "get_file", ok({ id = "f1", name = "notes.txt", mimeType = "text/plain" }))
            local read_file = stub(drive, "read_file", ok({ text = LONG }))
            local get_text = stub(docs, "get_document_text", ok({ text = LONG }))
            local file: any = drive_tool.handler({ action = "read_file", file_id = "f1" })
            local doc: any = docs_tool.handler({ action = "read_document", document_id = "d1" })
            drive.get_file, drive.read_file, docs.get_document_text = get_file, read_file, get_text
            test.eq(file.name, "notes.txt")
            test.eq(file.content, LONG)
            test.eq(doc.content, LONG)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
