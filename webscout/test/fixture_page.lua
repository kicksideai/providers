local http = require("http")
local function handler()
    local response = http.response()
    response:set_status(http.STATUS.OK)
    response:set_content_type("text/html")
    response:write('<html><body>NORTHWIND-NATIVE-731 <a href="/orders">Orders</a></body></html>')
end
return { handler = handler }
