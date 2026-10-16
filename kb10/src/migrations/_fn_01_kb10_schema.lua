local implementation = require("operation_impl")

type RunOptions = {
    database_id: string?,
    db: any?,
    db_type: string?,
    direction: string?,
    force: boolean?,
    id: string?,
}

local function migrate(options: RunOptions?): any
    return implementation(options)
end

return { migrate = migrate }
