-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local checkpoint = require("checkpoint")
local test = require("test")

local function source(content_type, size, metadata)
    return {
        type = "kickside.knowledge.events:content.upserted",
        body = {content_type = content_type, content_bytes = size, metadata = metadata},
    }
end

return {run = test.run_cases(function()
    test.describe("source checkpoint eligibility", function()
        test.it("accepts oversized text and sheet artifact formats", function()
            for _, content_type in ipairs({"text/markdown", "text/plain", "text/csv"}) do
                test.is_true(checkpoint.eligible(source(content_type,128*1024)))
                test.is_false(checkpoint.eligible(source(content_type,128*1024-1)))
            end
        end)

        test.it("keeps image sources and deletes on the ordinary path", function()
            local image = {image_artifacts = {{kind = "image", artifact_id = "fixture-image"}}}
            test.is_false(checkpoint.eligible(source("text/markdown",128*1024,image)))
            test.is_false(checkpoint.eligible(source("image/png",128*1024)))
            local event = source("text/markdown",128*1024)
            event.type = "kickside.knowledge.events:content.deleted"
            test.is_false(checkpoint.eligible(event))
        end)
    end)
end)}
