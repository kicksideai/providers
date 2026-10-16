local endpoints = require("endpoints")
-- Google Slides domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local slides = {}

local function slides_api(): string
    return endpoints.get("kickside.google:endpoints", "slides")
end
local function drive_api(): string
    return endpoints.get("kickside.google:endpoints", "drive")
end
local DEFAULT_PAGE_SIZE = 20
local MAX_PAGE_SIZE = 100

function slides.list_presentations(conn: google_types.Connection, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = {
        q = "mimeType='application/vnd.google-apps.presentation' and trashed=false",
        fields = "nextPageToken,files(" .. (fields or "id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress)") .. ")",
        pageSize = size,
        orderBy = "modifiedTime desc",
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, drive_api() .. "/files", query)
end

function slides.get_presentation(conn: google_types.Connection, presentation_id: string): (google_types.Result?, error?)
    return transport.get(conn, slides_api() .. "/" .. presentation_id)
end

function slides.read_presentation(conn: google_types.Connection, presentation_id: string): (google_types.Result?, error?)
    return transport.get(conn, slides_api() .. "/" .. presentation_id)
end

function slides.create_presentation(conn: google_types.Connection, title: string): (google_types.Result?, error?)
    return transport.post(conn, slides_api(), { title = title })
end

-- The text runs of every slide (dynamic JSON), one record per slide.
function slides.slide_texts(presentation: any): { any }
    local out: { any } = {}
    for i, slide in ipairs(presentation.slides or {}) do
        local parts: { string } = {}
        for _, el in ipairs(slide.pageElements or {}) do
            local shape = el.shape
            local txt = shape and shape.text
            if txt and txt.textElements then
                for _, te in ipairs(txt.textElements) do
                    local run = te.textRun
                    if run and run.content then parts[#parts + 1] = run.content end
                end
            end
        end
        out[#out + 1] = { index = i, object_id = slide.objectId, text = (table.concat(parts, "")):gsub("%s+$", "") }
    end
    return out
end

return slides
