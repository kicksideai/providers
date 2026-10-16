local connection = require("connection")

return { run = function(args: any): any
    return connection.send_reply({
        resource_id = args.resource_id,
        content = args.content,
        outbound = args.outbound,
        reply_proof = args.reply_proof,
    })
end }
