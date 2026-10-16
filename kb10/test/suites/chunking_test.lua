local test = require("test")
local text = require("text")

-- Regression: markdown tables must not be shredded into one chunk per row, which
-- would destroy table embeddings. embed_func passes join_table_rows = true to the
-- markdown splitter; this guards that the option keeps rows together.

local function build_table(rows)
    local lines = { "| Name | Role | Score |", "| --- | --- | --- |" }
    for i = 1, rows do
        lines[#lines + 1] = "| Person" .. i .. " | Engineer | " .. tostring(i) .. " |"
    end
    return table.concat(lines, "\n")
end

local function count_rows_in_chunk(chunk)
    local n = 0
    for _ in chunk:gmatch("Person%d+") do
        n = n + 1
    end
    return n
end

local function define_tests()
    test.describe("kb10 markdown chunking", function()
        local ROWS = 8
        local md = build_table(ROWS)

        test.it("keeps table rows together with join_table_rows = true", function()
            -- chunk_size large enough to hold the whole small table.
            local splitter, err = text.splitter.markdown({
                chunk_size = 4000,
                chunk_overlap = 0,
                code_blocks = true,
                join_table_rows = true
            })
            test.is_nil(err)

            local chunks, split_err = splitter:split_text(md)
            test.is_nil(split_err)

            local max_rows = 0
            for _, chunk in ipairs(chunks) do
                local r = count_rows_in_chunk(chunk)
                if r > max_rows then max_rows = r end
            end

            -- A single chunk must hold multiple data rows (not one-row-per-chunk).
            test.is_true(max_rows >= 2,
                "expected a chunk with multiple table rows, max rows in any chunk = " .. tostring(max_rows))
        end)

        test.it("default markdown splitter shreds the table per row", function()
            -- Contrast case: without join_table_rows the langchaingo default emits
            -- one chunk per row. This documents why embed_func sets the option.
            local splitter, err = text.splitter.markdown({
                chunk_size = 4000,
                chunk_overlap = 0,
                code_blocks = true
            })
            test.is_nil(err)

            local chunks, split_err = splitter:split_text(md)
            test.is_nil(split_err)

            local max_rows = 0
            for _, chunk in ipairs(chunks) do
                local r = count_rows_in_chunk(chunk)
                if r > max_rows then max_rows = r end
            end

            -- Each chunk carries a single data row (header repeated per chunk).
            test.eq(max_rows, 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
