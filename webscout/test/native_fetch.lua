local client = require("client")
local function handler(args)
    local response, err = client.get(args.url)
    return { response = response, error = err and tostring(err) }, nil
end
return { handler = handler }
