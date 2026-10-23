local time = require("time")
local M = {}

-- Bound complete discovery independently of a server's page size or tool count.
-- Single-page calls retain the remote server's native cursor and response.
function M.each_page(fetch: (string?) -> (any?, error?), consume: (any) -> (), deadline: any?): error?
    deadline = deadline or time.now():add(5 * time.MINUTE)
    local seen: {[string]: boolean} = {}
    local cursor: string? = nil
    repeat
        if not time.now():before(deadline) then
            return errors.new({kind=errors.TIMEOUT, message="MCP catalog discovery timed out"})
        end
        local page, err = fetch(cursor)
        if err then return err end
        if not time.now():before(deadline) then
            return errors.new({kind=errors.TIMEOUT, message="MCP catalog discovery timed out"})
        end
        cursor = page.next_cursor
        if cursor then
            if seen[cursor] then
                return errors.new({kind=errors.UNAVAILABLE, message="MCP server repeated a catalog cursor", details={code="MCP_CURSOR_CYCLE"}})
            end
            seen[cursor] = true
        end
        consume(page)
    until not cursor
    return nil
end

return M
