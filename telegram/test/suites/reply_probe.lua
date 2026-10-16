local connection = require("connection")
local transport = require("transport")

return { run = function(args: any): any
    if args.sink == true then
        local conn, err = transport.connect_write(args.component_id)
        return { success = conn ~= nil, error = err }
    end
    return connection.send_reply({
        resource_id = args.resource_id,
        content = args.content,
        outbound = args.outbound,
        reply_proof = args.reply_proof,
    })
end }
