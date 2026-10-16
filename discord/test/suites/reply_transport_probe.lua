local connection = require("connection")

return { run = function(args: any): any
    return connection.send_reply({
        resource_id = args.channel_id,
        content = args.payload and args.payload.content,
        outbound = args.kind == "outbound",
        reply_proof = args.reply_proof,
    })
end }
