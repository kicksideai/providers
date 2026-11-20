local artifacts = require("artifacts")

local M = {}

-- Uploads distinguishes a missing resource from a missing object. Only an
-- explicit absence for the selected artifact or its bytes rejects a revision.
function M.read(upload_id: any, artifact_id: any, expected_size: any?, expected_checksum: any?): (string?, any?, string?, boolean?)
    local bytes, err, location = artifacts.read_artifact_content(upload_id, artifact_id)
    if not err then
        -- Locator-only reads and blobs rebound to a different revision cannot
        -- establish the identity of the bytes this event originally selected.
        local recorded_blob = type(bytes) == "string" and type(location) == "table"
            and type(location.blob_id) == "string" and location.blob_id ~= ""
            and type(expected_size) == "number" and tonumber(location.size) == expected_size
            and type(expected_checksum) == "string" and location.checksum == expected_checksum
        return bytes, nil, nil, recorded_blob
    end
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
