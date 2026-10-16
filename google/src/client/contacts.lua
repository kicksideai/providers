local endpoints = require("endpoints")
-- Google People/Contacts domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local contacts = {}

local function people_api(): string
    return endpoints.get("kickside.google:endpoints", "contacts")
end
-- Every Person field the People API answers; personFields/readMask must name them.
local PERSON_FIELDS = "addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,"
    .. "events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,"
    .. "nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined"
local SUMMARY_FIELDS = "names,emailAddresses,phoneNumbers,organizations"
local DEFAULT_LIST_PAGE_SIZE = 25
local MAX_LIST_PAGE_SIZE = 100
local DEFAULT_SEARCH_PAGE_SIZE = 10
local MAX_SEARCH_PAGE_SIZE = 30

function contacts.list_connections(conn: google_types.Connection, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_LIST_PAGE_SIZE, MAX_LIST_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = {
        personFields = fields or SUMMARY_FIELDS,
        pageSize = size,
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, people_api() .. "/people/me/connections", query)
end

function contacts.search_contacts(conn: google_types.Connection, query_text: string, max_results: number?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_SEARCH_PAGE_SIZE, MAX_SEARCH_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    return transport.get(conn, people_api() .. "/people:searchContacts", {
        query = query_text,
        readMask = fields or SUMMARY_FIELDS,
        pageSize = size,
    })
end

function contacts.get_contact(conn: google_types.Connection, resource_name: string): (google_types.Result?, error?)
    if not resource_name:match("^people/[%w_-]+$") then return {success = false, error = "resource_name must be a people/<id> resource"} end
    return transport.get(conn, people_api() .. "/" .. resource_name, {personFields = PERSON_FIELDS})
end

return contacts
