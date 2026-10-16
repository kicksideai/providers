local endpoints = require("endpoints")
-- Atlassian site and declared gateway resolution build the REST base.
-- Cloud uses Jira REST v3 and
-- Confluence v2; Server/Data Center uses Jira REST v2 and Confluence v1. OAuth
-- targets the declared gateway keyed by cloudId.

local site = {}

-- Cloud sites are *.atlassian.net; everything else is Server/Data Center.
local function is_cloud(site_url: string?): boolean
    if not site_url or site_url == "" then return false end
    return (site_url :: string):match("%.atlassian%.net") ~= nil
end
site.is_cloud = is_cloud

-- Strip a trailing slash and default the scheme to https.
local function normalize_url(url: string?): string
    local s = url or ""
    if s == "" then return s end
    if not s:match("^https?://") then s = "https://" .. s end
    s = s:gsub("/+$", "")
    return s
end
site.normalize_url = normalize_url

-- "cloud" when the URL is *.atlassian.net, else "server".
local function detect_deployment(site_url: string?): string
    return is_cloud(site_url) and "cloud" or "server"
end
site.detect_deployment = detect_deployment

-- Jira REST base, version included. Services append /issue/... etc.
local function jira_base(deployment: string, site_url: string?, cloud_id: string?): string
    if cloud_id and cloud_id ~= "" then
        return endpoints.get("kickside.atlassian:endpoints", "gateway") .. "/ex/jira/" .. cloud_id .. "/rest/api/3"
    end
    local base = normalize_url(site_url)
    if deployment == "server" then
        return base .. "/rest/api/2"
    end
    return base .. "/rest/api/3"
end
site.jira_base = jira_base

-- Confluence REST base. Uses the v1 REST API, which exists uniformly on Cloud
-- (under /wiki) and Server/Data Center, so the client appends the same paths
-- regardless of deployment.
local function confluence_base(deployment: string, site_url: string?, cloud_id: string?): string
    if cloud_id and cloud_id ~= "" then
        return endpoints.get("kickside.atlassian:endpoints", "gateway") .. "/ex/confluence/" .. cloud_id .. "/wiki/rest/api"
    end
    local base = normalize_url(site_url)
    if deployment == "server" then
        return base .. "/rest/api"
    end
    return base .. "/wiki/rest/api"
end
site.confluence_base = confluence_base

return site
