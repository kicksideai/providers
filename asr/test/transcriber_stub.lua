local function transcribe(args: any): any
    args = type(args) == "table" and args or {}
    local audio = type(args.audio) == "string" and (args.audio :: string) or ""
    if audio == "" then return { error = "no audio" } end
    return { text = "heard " .. tostring(#audio) .. " bytes of " .. tostring(args.mime) }
end

return { transcribe = transcribe }
