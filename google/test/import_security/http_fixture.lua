local http_client = require("http_client")
local json = require("json")

return {request = function(method: string, endpoint: string, options: any): (any?, error?)
    if endpoint:find("https://sheets.googleapis.com/", 1, true) == 1 then
        return {status_code = 200, body = json.encode({values = {{"Value"}, {"imported"}}})}, nil
    end
    if endpoint:find("googleapis.com", 1, true) then error("Unexpected Google HTTP request in test") end
    return http_client.request(method, endpoint, options)
end}
