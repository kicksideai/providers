-- Capture and reconcile eval cases. Each case captures `seed` in one session
-- and `follow` in a second; `expect` is what the second capture should do:
-- ADD a new memory, DEDUPE (keep or merge with an existing one), SUPERSEDE
-- (update), CONFLICT, or IGNORE (nothing worth remembering).
-- `ideal` holds the answers a correct model gives, for the scripted run; its
-- verdict targets the memories the seed produced.

local function u(id: string, text: string): any return { id = id, role = "user", content = text } end
local function c(kind: string, key: string, value: string, content: string, event_id: string): any
    return { kind = kind, key = key, value = value, content = content, event_id = event_id, valid_at = "", confidence = 0.9 }
end

return {
    {
        name = "duplicate name", expect = "DEDUPE",
        seed = { u("s1", "Hi, I'm Sam.") },
        follow = { u("f1", "You can call me Sam, that's my preferred name.") },
        ideal = {
            seed = { c("profile_slot", "name", "Sam", "The user's name is Sam.", "s1") },
            follow = { c("profile_slot", "name", "Sam", "The user's name is Sam.", "f1") },
        },
    },
    {
        name = "duplicate city phrasing", expect = "DEDUPE",
        seed = { u("s1", "I live in Paris.") },
        follow = { u("f1", "Paris is where I live these days.") },
        ideal = {
            seed = { c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1") },
            follow = { c("profile_slot", "home_city", "Paris (current home)", "The user currently lives in Paris.", "f1") },
            verdict = "MERGE",
        },
    },
    {
        name = "city move", expect = "SUPERSEDE",
        seed = { u("s1", "I live in Paris.") },
        follow = { u("f1", "I moved to Berlin last month.") },
        ideal = {
            seed = { c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1") },
            follow = { c("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "f1") },
            verdict = "SUPERSEDE",
        },
    },
    {
        name = "diet change", expect = "SUPERSEDE",
        seed = { u("s1", "I'm vegetarian.") },
        follow = { u("f1", "I've gone vegan since we last talked.") },
        ideal = {
            seed = { c("preference", "diet", "vegetarian", "The user is vegetarian.", "s1") },
            follow = { c("preference", "diet", "vegan", "The user is vegan.", "f1") },
            verdict = "SUPERSEDE",
        },
    },
    {
        name = "birth date contradiction", expect = "CONFLICT",
        seed = { u("s1", "My passport says I was born on 3 March 1990.") },
        follow = { u("f1", "My airline profile says 5 March 1990 and I honestly don't know which date is right.") },
        ideal = {
            seed = { c("profile_slot", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "s1") },
            follow = { c("profile_slot", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "f1") },
            verdict = "CONFLICT",
        },
    },
    {
        name = "pet name contradiction", expect = "CONFLICT",
        seed = { u("s1", "My cat is called Biscuit.") },
        follow = { u("f1", "My cat is called Pepper.") },
        ideal = {
            seed = { c("fact", "cat_name", "Biscuit", "The user's cat is called Biscuit.", "s1") },
            follow = { c("fact", "cat_name", "Pepper", "The user's cat is called Pepper.", "f1") },
            verdict = "CONFLICT",
        },
    },
    {
        name = "new fact", expect = "ADD",
        seed = { u("s1", "I live in Paris.") },
        follow = { u("f1", "I have two kids, Mia and Leo.") },
        ideal = {
            seed = { c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1") },
            follow = { c("fact", "children", "Mia and Leo", "The user has two kids, Mia and Leo.", "f1") },
            verdict = "ADD",
        },
    },
    {
        name = "small talk", expect = "IGNORE",
        seed = { u("s1", "I prefer trains over flights.") },
        follow = { u("f1", "Haha thanks, that's great! How are you today?"), { id = "f2", role = "assistant", content = "I'm well, thanks for asking!" } },
        ideal = {
            seed = { c("preference", "transport", "train", "The user prefers trains over flights.", "s1") },
            follow = {},
        },
    },
    {
        name = "acknowledgement", expect = "IGNORE",
        seed = { u("s1", "I prefer aisle seats.") },
        follow = { u("f1", "ok cool") },
        ideal = {
            seed = { c("preference", "seat", "aisle", "The user prefers aisle seats.", "s1") },
            follow = {},
        },
    },
    {
        name = "recalled memory is not captured", expect = "IGNORE",
        seed = { u("s1", "I prefer window seats.") },
        follow = {
            { id = "f1", role = "developer", content = "- The user lives in Rome.\n- The user likes opera.", metadata = { memory_ids = { "m-1", "m-2" } } },
            u("f2", "Thanks!"),
        },
        ideal = {
            seed = { c("preference", "seat", "window", "The user prefers window seats.", "s1") },
            follow = {},
        },
    },
}
