-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local glyphs = {
    S = {31,16,16,31,1,1,31}, C = {31,16,16,16,16,16,31},
    A = {14,17,17,31,17,17,17}, N = {17,25,25,21,19,19,17},
    E = {31,16,16,30,16,16,31}, D = {30,17,17,17,17,17,30},
    ["0"] = {14,17,19,21,25,17,14}, ["7"] = {31,1,2,4,8,8,8},
    ["8"] = {14,17,17,14,17,17,14}, ["9"] = {14,17,17,15,1,1,14},
    ["1"] = {4,12,4,4,4,4,14}, ["2"] = {30,1,1,14,16,16,31},
    ["3"] = {30,1,1,14,1,1,30}, ["4"] = {18,18,18,31,2,2,2},
    ["5"] = {31,16,16,30,1,1,30}, ["6"] = {15,16,16,30,17,17,14},
}
local function image(text: string): string
    local pixels = {}
    for row = 1, 7 do
        for column = 1, #text do
            local bits = (glyphs[text:sub(column, column)] or {})[row] or 0
            for bit = 4, 0, -1 do pixels[#pixels + 1] = ((bits >> bit) & 1) == 1 and "\0" or "\255" end
            pixels[#pixels + 1] = "\255"
        end
    end
    return table.concat(pixels)
end
local function text(page: integer): string
    local lines = { "TEXT " .. page .. " has the reference number " .. (4100 + page) .. "." }
    for line = 1, 18 do lines[#lines + 1] = "The text layer preserves the complete paragraph and its original wording." end
    return table.concat(lines, "\n")
end
local function pdf(kinds: { string }, first_page: integer?): string
    local objects = {}
    local function add(body: string): integer objects[#objects + 1] = body; return #objects end
    local function stream(body: string, attrs: string): integer
        return add("<< /Length " .. #body .. " " .. attrs .. " >>\nstream\n" .. body .. "\nendstream")
    end
    add("<< /Type /Catalog /Pages 2 0 R >>")
    add("")
    local font = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    local kids = {}
    for index, kind in ipairs(kinds) do
        local page = index + (first_page or 1) - 1
        local resource, content
        if kind == "text" then
            local lines = {"BT /F1 10 Tf 40 740 Td 16 TL"}
            for line in (text(page) .. "\n"):gmatch("(.-)\n") do lines[#lines + 1] = "(" .. line .. ") Tj T*" end
            lines[#lines + 1] = "ET"
            content = stream(table.concat(lines, "\n"), "")
            resource = "/Font << /F1 " .. font .. " 0 R >>"
        elseif kind == "blank" then
            content, resource = stream("", ""), ""
        else
            local words = "SCANNED " .. page
            local img = stream(image(words), "/Type /XObject /Subtype /Image /Width " .. (#words * 6) .. " /Height 7 /ColorSpace /DeviceGray /BitsPerComponent 8")
            content = stream("q 432 0 0 56 40 680 cm /I Do Q" .. (kind == "double" and "\nq 432 0 0 56 40 580 cm /J Do Q" or ""), "")
            local extra = ""
            if kind == "double" then
                local second = "SEEN " .. page
                local other = stream(image(second), "/Type /XObject /Subtype /Image /Width " .. (#second * 6) .. " /Height 7 /ColorSpace /DeviceGray /BitsPerComponent 8")
                extra = "/J " .. other .. " 0 R "
            end
            if kind == "form" then
                local nested = stream("q 432 0 0 56 40 580 cm /I Do Q", "/Type /XObject /Subtype /Form /BBox [0 0 612 792] /Resources << /XObject << /I " .. img .. " 0 R >> >>")
                extra = "/F " .. nested .. " 0 R "
                content = stream("q 432 0 0 56 40 680 cm /I Do Q /F Do", "")
            end
            if kind == "inline" then
                content = stream("q 432 0 0 56 40 680 cm /I Do Q\nq 100 0 0 100 40 540 cm BI /W 1 /H 1 /CS /G /BPC 8 ID \127 EI Q", "")
            end
            resource = "/XObject << /I " .. img .. " 0 R " .. extra .. ">>"
        end
        local id = add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << " .. resource .. " >> /Contents " .. content .. " 0 R >>")
        kids[#kids + 1] = id .. " 0 R"
    end
    objects[2] = "<< /Type /Pages /Count " .. #kinds .. " /Kids [" .. table.concat(kids, " ") .. "] >>"
    local out, offsets, length = {"%PDF-1.4\n"}, {}, 9
    for index, body in ipairs(objects) do
        offsets[index] = length
        local obj = index .. " 0 obj\n" .. body .. "\nendobj\n"
        out[#out + 1], length = obj, length + #obj
    end
    out[#out + 1] = "xref\n0 " .. (#objects + 1) .. "\n0000000000 65535 f \n"
    for _, offset in ipairs(offsets) do out[#out + 1] = string.format("%010d 00000 n \n", offset) end
    out[#out + 1] = "trailer\n<< /Size " .. (#objects + 1) .. " /Root 1 0 R >>\nstartxref\n" .. length .. "\n%%EOF\n"
    return table.concat(out)
end
return { pdf = pdf, text = text }
