local endpoints = require("endpoints")
-- Google Analytics Admin/Data read-only domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local analytics = {}

local function ga_admin_api(): string
    return endpoints.get("kickside.google:endpoints", "analytics_admin")
end
local function ga_data_api(): string
    return endpoints.get("kickside.google:endpoints", "analytics_data")
end
local DEFAULT_PAGE_SIZE = 50
local MAX_PAGE_SIZE = 200

local function property_segment(property_id: string): string
    local id = tostring(property_id or "")
    if id:sub(1, 11) == "properties/" then id = id:sub(12) end
    return transport.encode_segment(id)
end

function analytics.list_properties(conn: google_types.Connection, account_id: string, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local account = tostring(account_id or "")
    if account:sub(1, 9) == "accounts/" then account = account:sub(10) end
    if account == "" then return { success = false, error = "account_id is required" } end
    local query: { [string]: any } = {
        fields = "nextPageToken,properties(" .. (fields or "name,displayName,propertyType,parent,timeZone,currencyCode,createTime,updateTime") .. ")",
        filter = "parent:accounts/" .. account,
        pageSize = size,
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, ga_admin_api() .. "/properties", query)
end

function analytics.list_account_summaries(conn: google_types.Connection, max_results: number?, page_token: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = { pageSize = size }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, ga_admin_api() .. "/accountSummaries", query)
end

function analytics.run_report(conn: google_types.Connection, property_id: string, body: any): (google_types.Result?, error?)
    return transport.post(conn, ga_data_api() .. "/properties/" .. property_segment(property_id) .. ":runReport", body)
end

return analytics
