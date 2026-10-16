local query_service = require("query_service")

local function handle(request)
    return query_service.handle(request)
end

return { handle = handle }
