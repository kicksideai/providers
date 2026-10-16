local types = require("types")
-- failure: a typed error every call returns; rejection: a failed Result the
-- next call returns.
local M = { failure = nil :: error?, rejection = nil :: any }
function M.connect(id: string?): (types.Conn?, error?)
    return { component_id = id, api_key = "fixture-key" }, nil
end
function M.list_transcripts(_conn: types.Conn, _variables: any?): (types.Result?, error?)
    if M.failure then return nil, M.failure end
    if M.rejection then return M.rejection, nil end
    return { success = true, data = { transcripts = {
        { id = "meeting-1", title = "Review", date = 1748772000000, dateString = "2025-06-01T10:00:00.000Z",
          is_live = false, speakers = { { name = "Ada" } },
          meeting_attendees = { { displayName = "Attendee", email = "attendee@example.com" } },
          participants = { "organizer@example.com", "attendee@example.com" } },
    } } }
end
function M.get_transcript_sentences(_conn: types.Conn, _id: string): types.Result
    return { success = true, data = { transcript = { id = "meeting-1", title = "Review", sentences = {
        { index = 1, speaker_name = "Ada", text = "éOne" },
        { index = 2, speaker_name = "Bob", text = "Two" },
        { index = 3, speaker_name = "Ada", text = "Three" },
    } } } }
end
function M.get_transcript(_conn: types.Conn, _id: string): types.Result
    return { success = true, data = { transcript = { id = "meeting-1", title = "Review", summary = {
        overview = string.rep("x", 3000), action_items = "Follow up",
    }, meeting_attendees = {
        { displayName = "Organizer", email = "organizer@example.com" },
        { displayName = "Attendee", email = "attendee@example.com" },
    } } } }
end
return M
