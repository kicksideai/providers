local test = require("test")
local funcs = require("funcs")
local crypto = require("crypto")
local hash = require("hash")
local sql = require("sql")
local artifact_content_repo = require("artifact_content_repo")
local artifact_cleanup_repo = require("artifact_cleanup_repo")
local upload_record_repo = require("upload_record_repo")

local EXTRACTOR_REF = "kickside.kb10.injection:content_extractor"

local function call(event)
    return funcs.call(EXTRACTOR_REF, { event = event })
end

local function define_tests()
    test.describe("content extractor", function()
        local uploads = {}
        test.after_each(function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            for _, upload_id in ipairs(uploads) do
                local _, cleanup_err = artifact_cleanup_repo.delete_for_upload(upload_id)
                test.is_nil(cleanup_err)
                local _, delete_err = db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})
                test.is_nil(delete_err)
            end
            uploads = {}
            db:release()
        end)
        for _, omitted in ipairs({false, true}) do
            test.it("extracts stored artifact text with content_omitted=" .. tostring(omitted), function()
                local upload_id, uuid_err = crypto.random.uuid()
                test.is_nil(uuid_err)
                uploads[#uploads + 1] = upload_id
                local content = omitted and string.rep("document text ", 400000) or "Original inline document"
                local _, upload_err = upload_record_repo.create(upload_id, "test-user", #content,
                    "text/plain", "app:uploads", "source.txt", "document", {}, "completed", "test-checksum")
                test.is_nil(upload_err)
                local artifact, artifact_err = artifact_content_repo.create_artifact({
                    upload_id=upload_id, kind="markdown", role="primary", mime_type="text/plain",
                    content=content, storage_id="app:uploads"})
                test.is_nil(artifact_err)
                local body = {kb_id="test-kb", content_type="text/plain",
                    source_ref={kind="upload", upload_id=upload_id, artifact_id=artifact.artifact_id}}
                if omitted then body.content_omitted=true; body.content_bytes=#content; body.content_sha256=hash.sha256(content)
                else body.content=content end
                local result, call_err = call({id="test-event",seq=1,
                    type="kickside.knowledge.events:content.upserted",
                    external={external_source="knowledge.kb",external_id="upload:"..upload_id,external_version="v1"},body=body})
                test.is_nil(call_err)
                test.is_nil(result.error)
                test.eq(#result.documents, 1)
                test.eq(result.documents[1].content, content)
                test.eq(result.documents[1].source_ref.artifact_id, artifact.artifact_id)
                if omitted then
                    for _, corruption in ipairs({"length", "digest"}) do
                        if corruption == "length" then body.content_bytes=#content+1
                        else body.content_bytes=#content; body.content_sha256=string.rep("0",64) end
                        local stale, stale_err = call({type="kickside.knowledge.events:content.upserted",
                            external={external_id="upload:"..upload_id},body=body})
                        test.is_nil(stale_err)
                        test.eq(#stale.documents,0)
                        test.eq(stale.retryable,true)
                    end
                end
            end)
        end
        test.it("retains inline events after their artifact is unavailable", function()
            local result, err = call({type="kickside.knowledge.events:content.upserted",
                external={external_id="upload:missing"},body={content="Retained inline document",
                    source_ref={kind="upload",upload_id="missing",artifact_id="missing"}}})
            test.is_nil(err)
            test.is_nil(result.error)
            test.eq(#result.documents,1)
            test.eq(result.documents[1].content,"Retained inline document")
        end)
        test.it("surfaces an unreadable omitted artifact", function()
            local result, err = call({type="kickside.knowledge.events:content.upserted",
                external={external_id="upload:missing"}, body={content_omitted=true,content_bytes=5000000,
                    source_ref={kind="upload",upload_id="missing",artifact_id="missing"}}})
            test.is_nil(err)
            test.eq(#result.documents,0)
            test.contains(tostring(result.error), "artifact")
            test.eq(result.retryable, true)
        end)
        test.it("rejects upserts without natural external identity", function()
            local result, err = call({
                id = "evt-transient",
                seq = 1,
                type = "kickside.knowledge.events:content.upserted",
                body = {
                    content = "same source, different transport event",
                    metadata = {},
                },
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.error, "content event missing external_id")
            test.eq(#result.documents, 0)
        end)

        test.it("propagates delete external version into delete records", function()
            local result, err = call({
                id = "evt-delete",
                seq = 2,
                type = "kickside.knowledge.events:content.deleted",
                external = {
                    external_source = "knowledge.kb",
                    external_id = "doc-1",
                    external_version = "v2",
                },
                body = {
                    metadata = { actor_id = "user-1" },
                    source_ref = { kind = "manual", external_id = "doc-1", external_version = "v2" },
                },
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(#result.documents, 0)
            test.eq(#result.deletes, 1)
            test.eq(result.deletes[1].external_id, "doc-1")
            test.eq(result.deletes[1].external_version, "v2")
            test.eq(result.deletes[1].metadata.external_version, "v2")
            test.eq(result.deletes[1].user_id, "user-1")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
