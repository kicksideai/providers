local opened = 0
return {
    new = function()
        opened = opened + 1
        return { generation = opened }, nil
    end,
    close = function(session) session.closed = true end,
    call_tool = function(session, name)
        if name == "tool_failure" then
            return { success = false, isError = true, error = "remote MCP tool returned an error" }, nil
        end
        if name == "transport_failure" then
            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP HTTP 500", details = { status_code = 500 } })
        end
        return { generation = session.generation, closed = session.closed == true }, nil
    end,
    list_tools = function() return {tools = {}}, nil end,
}
