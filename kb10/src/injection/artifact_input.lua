local artifacts = require("artifacts")

local M = {}

-- Uploads distinguishes a missing resource from a missing object. Only an
-- explicit absence for the selected artifact or its bytes rejects a revision.
function M.read(upload_id: any, artifact_id: any): (string?, any?, string?)
    local bytes, err = artifacts.read_artifact_content(upload_id, artifact_id)
    if not errors.is(err, errors.NOT_FOUND) or err:retryable() == true then
        return bytes, err
    end
    local details = err:details() or {}
    if details.code == "artifact_reference_not_found" then
        return nil, err, "artifact_reference_not_found"
    end
    if details.artifact_read_source == "blob" or details.artifact_read_source == "locator" then
        return nil, err, "artifact_bytes_not_found"
    end
    return bytes, err
end

return M
