local test = require("test")
local source_materializer = require("source_materializer")
local kb10_store = require("kb10_store")
local materializer_store = require("materializer_store")
local uuid = require("uuid")
local fs = require("fs")
local doc2md = require("doc2md")

local fixture = "## Products\n\n<!-- kickside:sheet header-row=4 -->\n| SKU | Name | Finish |\n| --- | --- | --- |\n| A-1 | " .. string.rep("Alpha ", 8) .. " | Zinc |\n| B-2 | " .. string.rep("Beta ", 8) .. " | Black |\n| C-3 | " .. string.rep("Gamma ", 8) .. " | Chrome |\n\n## Other\n\n<!-- kickside:sheet header-row=1 -->\n| SKU | Name | Finish |\n| --- | --- | --- |\n| D-4 | Delta | Copper |\n"
local opts = { chunk_size = 240, chunk_overlap = 40, summary_max_chars = 0 }
local function document(content, filename)
    return { external_id = "sheet", content = content, metadata = { original_filename = filename or "products.xlsx" } }
end
local function plan(doc, size)
    local options = { chunk_size = size or 240, chunk_overlap = 40, summary_max_chars = 0 }
    return source_materializer.plan_document_writes({ doc }, options)
end

local function define_tests()
    test.describe("spreadsheet row chunks", function()
        test.it("uses declared row context without requesting model-generated context", function()
            local calls = 0
            local function enrich_batch(_doc, _summary, chunks)
                calls = calls + 1
                local prefixes = {}
                for i = 1, #chunks do prefixes[i] = "generated context" end
                return prefixes, nil
            end
            local plans, texts, err = source_materializer.plan_document_writes(
                { document(fixture) }, opts, nil, nil, nil, enrich_batch)
            test.is_nil(err)
            test.eq(calls, 0)
            test.eq(plans[1].chunk_prefixes[1], "Sheet Products, rows 5–6.")
            test.eq(plans[1].chunk_prefixes[2], "Sheet Products, row 7.")
            test.eq(plans[1].chunk_prefixes[3], "Sheet Other, row 2.")
            for i, chunk in ipairs(plans[1].chunk_texts) do
                test.eq(texts[i], plans[1].chunk_prefixes[i] .. "\n\n" .. chunk)
            end
        end)
        test.it("retains declared context when model enrichment is absent", function()
            local plans, texts, err = plan(document("SKU,Name\nA,Alpha", "items.csv"), 240)
            test.is_nil(err)
            test.eq(plans[1].chunk_prefixes[1], "Sheet items, row 2.")
            test.eq(texts[1], "Sheet items, row 2.\n\n" .. plans[1].chunk_texts[1])
        end)
        test.it("groups contiguous rows with headers, bounded size, and physical sheet ranges", function()
            local plans, texts, err = plan(document(fixture))
            test.is_nil(err)
            test.eq(#plans, 1)
            local p = plans[1]
            test.eq(#p.chunk_texts, 3)
            test.eq(#texts, 3)
            test.eq(p.chunk_metadata[1].sheet_name, "Products")
            test.eq(p.chunk_metadata[1].row_start, 5)
            test.eq(p.chunk_metadata[1].row_end, 6)
            test.eq(p.chunk_metadata[2].row_start, 7)
            test.eq(p.chunk_metadata[2].row_end, 7)
            test.eq(p.chunk_metadata[3].sheet_name, "Other")
            test.eq(p.chunk_metadata[3].row_start, 2)
            for _, chunk in ipairs(p.chunk_texts) do
                test.is_true(#chunk <= 240)
                test.is_true(chunk:find("| SKU | Name | Finish |", 1, true) ~= nil)
                test.is_false(chunk:find("Products", 1, true) ~= nil and chunk:find("Other", 1, true) ~= nil)
            end
        end)
        test.it("retains escaped pipes, missing cells, and blank row positions", function()
            local md = "## Items\n| SKU | Name | Finish |\n| --- | --- | --- |\n| A | Alpha\\|Beta |\n| | | |\n| C | Gamma | Zinc |"
            local plans, _, err = plan(document(md), 400)
            test.is_nil(err)
            test.eq(plans[1].chunk_metadata[1].row_start, 2)
            test.eq(plans[1].chunk_metadata[1].row_end, 4)
            test.is_true(plans[1].chunk_texts[1]:find("Alpha\\|Beta", 1, true) ~= nil)
        end)
        test.it("splits only an oversized row by cells, repeating identity and matching headers", function()
            local md = "## Items\n| SKU | Name | Material | Finish |\n| --- | --- | --- | --- |\n| A-1 | Alpha | " .. string.rep("Steel ", 15) .. " | " .. string.rep("Zinc ", 15) .. " |"
            local plans, _, err = plan(document(md), 200)
            test.is_nil(err)
            test.is_true(#plans[1].chunk_texts >= 2)
            local next_column = 1
            for i, chunk in ipairs(plans[1].chunk_texts) do
                local meta = plans[1].chunk_metadata[i]
                test.eq(meta.row_start, 2)
                test.eq(meta.row_end, 2)
                test.eq(meta.column_start, next_column)
                next_column = meta.column_end + 1
                test.is_true(chunk:find("A-1", 1, true) ~= nil)
                test.is_true(#chunk <= 200)
            end
            test.eq(next_column, 5)
        end)
        test.it("adds bounded named-attribute summaries without dropping original cells", function()
            local md = "## Items\n| PART_NUMBER | SKU | ATTR NAME1 | ATTR VALUE1 | Notes |\n| --- | --- | --- | --- | --- |\n| P-1 | S-1 | Finish | Zinc | " .. string.rep("long ", 80) .. " |"
            local plans, _, err = plan(document(md), 240)
            test.is_nil(err)
            local found = false
            local data_found = false
            for i, chunk in ipairs(plans[1].chunk_texts) do
                local meta = plans[1].chunk_metadata[i]
                test.is_true(#chunk <= 240)
                test.eq(meta.row_start, 2)
                if meta.row_summary then
                    found = true
                    test.is_true(chunk:find("PART_NUMBER: P-1", 1, true) ~= nil)
                    test.is_true(chunk:find("SKU: S-1", 1, true) ~= nil)
                    test.is_true(chunk:find("| Finish |", 1, true) ~= nil)
                    test.is_true(chunk:find("| Zinc |", 1, true) ~= nil)
                    test.eq(meta.attribute_columns[1].name, 3)
                    test.eq(meta.attribute_columns[1].value, 4)
                elseif chunk:find("ATTR VALUE1", 1, true) then data_found = true end
            end
            test.is_true(found)
            test.is_true(data_found)
        end)
        test.it("splits a single oversized Unicode cell losslessly", function()
            local value = "start " .. string.rep("é🙂 words ", 90) .. "tail"
            local plans, _, err = plan(document("## Items\n| SKU | Notes |\n| --- | --- |\n| A | " .. value .. " |"), 200)
            test.is_nil(err)
            local recovered = ""
            for i, chunk in ipairs(plans[1].chunk_texts) do
                test.is_true(#chunk <= 200)
                local meta = plans[1].chunk_metadata[i]
                if meta.column_start == 2 then
                    test.eq(meta.column_end, 2)
                    recovered = recovered .. (chunk:match("\n| ([^\n]-) |$") or "")
                end
            end
            test.eq(recovered, value)
        end)
        test.it("reads CSV quoted delimiters, escaped quotes, multiline cells, and CRLF", function()
            local csv = 'SKU,Name,Notes\r\nA,"Alpha, Beta","say ""hi""\nnext"\r\nB,Bravo,ok\r\n'
            local plans, _, err = plan(document(csv, "Products.CSV"), 400)
            test.is_nil(err)
            test.eq(plans[1].chunk_metadata[1].sheet_name, "Products")
            test.eq(plans[1].chunk_metadata[1].row_start, 2)
            test.eq(plans[1].chunk_metadata[1].row_end, 3)
            test.is_true(plans[1].chunk_texts[1]:find("Alpha, Beta", 1, true) ~= nil)
            test.is_true(plans[1].chunk_texts[1]:find('say "hi"<br>next', 1, true) ~= nil)
        end)
        test.it("allows row-aware expansion by default and honors explicit chunk limits", function()
            local rows = {}
            for i = 1, 1501 do rows[#rows + 1] = "| S" .. tostring(i) .. " | " .. string.rep("x", 130) .. " |" end
            local doc = document("## Large\n| SKU | Notes |\n| --- | --- |\n" .. table.concat(rows, "\n"))
            local plans, _, err = plan(doc, 200)
            test.is_nil(err)
            test.eq(#plans[1].chunk_texts, 1501)
            local _, _, limit_err = source_materializer.plan_document_writes({ doc },
                {chunk_size=200, chunk_overlap=0, summary_max_chars=0, max_chunks_per_doc=1500})
            test.not_nil(limit_err)
        end)
        test.it("escapes a literal backslash before a pipe in CSV cells", function()
            local plans, _, err = plan(document("SKU,Name\nA,path\\|leaf", "paths.csv"), 400)
            test.is_nil(err)
            test.is_true(plans[1].chunk_texts[1]:find("path" .. string.rep("\\", 3) .. "|leaf", 1, true) ~= nil)
        end)
        test.it("projects populated cells of wide rows and records empty column positions", function()
            local headers = {}; local separators = {}; local values = {}
            for i = 1, 80 do headers[i] = "Field" .. tostring(i); separators[i] = "---"; values[i] = "" end
            values[1] = "A-1"; values[80] = "Zinc"
            local md = "## Wide\n| " .. table.concat(headers, " | ") .. " |\n| " .. table.concat(separators, " | ") .. " |\n| " .. table.concat(values, " | ") .. " |"
            local plans, _, err = plan(document(md), 200)
            test.is_nil(err)
            test.eq(#plans[1].chunk_texts, 1)
            local meta = plans[1].chunk_metadata[1]
            test.eq(meta.column_start, 1); test.eq(meta.column_end, 80)
            test.eq(meta.columns[1], 1); test.eq(meta.columns[2], 80)
            test.eq(#meta.empty_columns, 78)
            test.eq(meta.empty_columns[1], 2); test.eq(meta.empty_columns[78], 79)
            test.is_true(plans[1].chunk_texts[1]:find("| Field1 | Field80 |", 1, true) ~= nil)
        end)
        test.it("keeps a header and empty positions for an entirely blank wide row", function()
            local headers = {}; local separators = {}; local values = {}
            for i = 1, 80 do headers[i] = "Field" .. tostring(i); separators[i] = "---"; values[i] = "" end
            local md = "## Wide\n| " .. table.concat(headers, " | ") .. " |\n| " .. table.concat(separators, " | ") .. " |\n| " .. table.concat(values, " | ") .. " |"
            local plans, _, err = plan(document(md), 200)
            test.is_nil(err)
            test.eq(#plans[1].chunk_texts, 1)
            test.is_true(plans[1].chunk_texts[1]:find("| Field1 |", 1, true) ~= nil)
            test.eq(#plans[1].chunk_metadata[1].empty_columns, 80)
        end)
        test.it("keeps prose documents on the original splitter", function()
            local doc = document("## Items\n| SKU | Name |\n| --- | --- |\n| A | Alpha |\n\n" .. string.rep("prose sentence. ", 70), "guide.md")
            local plans, _, err = plan(doc)
            test.is_nil(err)
            local old = source_materializer.chunk_text(doc.content, math.floor(240), math.floor(40))
            test.eq(#plans[1].chunk_texts, #old)
            for i, chunk in ipairs(old) do test.eq(plans[1].chunk_texts[i], chunk) end
        end)
        test.it("rejects malformed tabular data instead of indexing arbitrary prose slices", function()
            local _, _, err = plan(document('SKU,Name\nA,"unterminated', "bad.csv"))
            test.not_nil(err)
        end)
    end)
    test.describe("spreadsheet ingestion into the engine store", function()
        test.it("persists sheet and row metadata on searchable chunk nodes on both databases", function()
            local id = uuid.v7()
            local _, create_err = kb10_store.create_store(id, "class:embed", opts, { kb_type = "document" })
            test.is_nil(create_err)
            local store_row, get_err = kb10_store.get_store(id)
            test.is_nil(get_err)
            local storage, fs_err = fs.get("app:sheet_fixture")
            test.is_nil(fs_err)
            local bytes, read_err = storage:readfile("products.xlsx")
            test.is_nil(read_err)
            local converted, convert_err = doc2md.convert({bytes=bytes})
            test.is_nil(convert_err)
            test.is_true(converted.markdown:find("header-row=4", 1, true) ~= nil)
            local doc = document(converted.markdown)
            doc.external_source = "test:sheet"
            doc.external_version = "v1"
            doc.thread_event_id = uuid.v7()
            doc.thread_event_seq = 1
            doc.source_ref = { external_source = doc.external_source, external_id = doc.external_id,
                external_version = doc.external_version, thread_event_id = doc.thread_event_id, thread_event_seq = 1 }
            local function embed(batch, _model, dims)
                local result = {}
                for _, _value in ipairs(batch) do
                    local v = {}
                    for i = 1, dims do v[i] = i == 1 and 1.0 or 0.0 end
                    result[#result + 1] = v
                end
                return { result = result }, nil
            end
            local result, ingest_err = source_materializer.ingest_documents_into_store(id,
                { store_row = store_row, store = materializer_store }, { doc }, embed, nil, nil, nil, {}, nil)
            test.is_nil(ingest_err)
            test.eq(result.failed, 0)
            test.eq(result.chunk_count, 4)
            local q = {}
            for i = 1, kb10_store.VECTOR_DIMENSIONS do q[i] = i == 1 and 1.0 or 0.0 end
            local hits, search_err = kb10_store.vector_search(id, q, { node_types = { "chunk" }, limit = 10 })
            test.is_nil(search_err)
            test.eq(#hits, 4)
            for _, hit in ipairs(hits) do
                test.not_nil(hit.metadata.sheet_name)
                test.not_nil(hit.metadata.row_start)
                test.not_nil(hit.metadata.row_end)
                if hit.metadata.sheet_name == "Wide" then
                    test.eq(hit.metadata.row_start, 2)
                    test.eq(hit.metadata.column_start, 1)
                    test.eq(hit.metadata.column_end, 80)
                    test.eq(hit.metadata.columns[1], 1)
                    test.eq(hit.metadata.columns[2], 80)
                    test.eq(#hit.metadata.empty_columns, 78)
                    test.is_true(hit.content:find("| Field1 | Field80 |", 1, true) ~= nil)
                else
                    test.is_true(hit.content:find("| SKU | Name | Finish |", 1, true) ~= nil)
                end
            end
            local _, delete_err = kb10_store.delete_store(id)
            test.is_nil(delete_err)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
