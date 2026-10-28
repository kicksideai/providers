-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function u(id: string, text: string): any return { id = id, role = "user", content = text } end
local function a(id: string, text: string): any return { id = id, role = "assistant", content = text } end
local function c(kind: string, key: string, value: any, content: string, event_id: string): any
    local cardinality = (kind == "profile_slot" or kind == "preference" or kind == "plan") and "single" or "multi"
    return { kind = kind, key = key, cardinality = cardinality, value = value, content = content, event_id = event_id, valid_at = "", confidence = 0.9 }
end

local function goal(key: string, details: string, event_id: string, next_step: string?): any
    return c("plan", key, { status = "open", next_step = next_step or "", details = details },
        "The user requests " .. details .. ".", event_id)
end

local function lesson(candidate: any, based_on: { integer }): any
    candidate.based_on = based_on
    return candidate
end

local SAM = { u("s1", "Hi! I'm Sam. I live in Paris and I'm vegetarian.") }
local SAM_IDEAL = {
    c("profile_slot", "name", "Sam", "The user's name is Sam.", "s1"),
    c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1"),
    c("preference", "diet", "vegetarian", "The user is vegetarian.", "s1"),
}

return {
    { name = "duplicate name", expect = "DEDUPE",
        seed = { u("s1", "Hi, I'm Sam.") },
        follow = { u("f1", "You can call me Sam, that's my preferred name.") },
        ideal = { seed = { c("profile_slot", "name", "Sam", "The user's name is Sam.", "s1") },
            follow = { c("profile_slot", "name", "Sam", "The user's name is Sam.", "f1") } } },
    { name = "duplicate city phrasing", expect = "DEDUPE",
        seed = { u("s1", "I live in Paris.") },
        follow = { u("f1", "Paris is where I live these days.") },
        ideal = { seed = { c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1") },
            follow = { c("profile_slot", "home_city", "Paris", "The user currently lives in Paris.", "f1") } } },
    { name = "diet restated", expect = "DEDUPE",
        seed = SAM,
        follow = { u("f1", "Like I said, I don't eat meat.") },
        ideal = { seed = SAM_IDEAL, seed_relations = { [3] = { "unrelated" } }, follow = { c("preference", "diet", "vegetarian", "The user is vegetarian.", "f1") } } },

    { name = "city move (demo)", expect = "SUPERSEDE",
        seed = SAM,
        follow = { u("f1", "Quick update: I moved to Berlin last month, so I'll be leaving from Berlin now.") },
        ideal = { seed = SAM_IDEAL, seed_relations = { [3] = { "unrelated" } }, follow = { c("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "f1") }, verdict = "SUPERSEDE" } },
    { name = "diet change (demo)", expect = "SUPERSEDE",
        seed = SAM,
        follow = { u("f1", "And I've gone vegan since we last talked.") },
        ideal = { seed = SAM_IDEAL, seed_relations = { [3] = { "unrelated" } }, follow = { c("preference", "diet", "vegan", "The user is vegan.", "f1") }, verdict = "SUPERSEDE" } },
    { name = "name correction", expect = "SUPERSEDE",
        seed = { u("s1", "I'm Sam.") },
        follow = { u("f1", "Actually, please call me Samantha, not Sam.") },
        ideal = { seed = { c("profile_slot", "name", "Sam", "The user's name is Sam.", "s1") },
            follow = { c("profile_slot", "name", "Samantha", "The user's name is Samantha.", "f1") }, verdict = "SUPERSEDE" } },
    { name = "job change", expect = "SUPERSEDE",
        seed = { u("s1", "I work as a nurse at St. Mary's.") },
        follow = { u("f1", "I left St. Mary's; I'm a paramedic with the city ambulance service now.") },
        ideal = { seed = { c("profile_slot", "occupation", "nurse at St. Mary's", "The user works as a nurse at St. Mary's.", "s1") },
            follow = { c("profile_slot", "occupation", "paramedic with the city ambulance service", "The user is a paramedic with the city ambulance service.", "f1") }, verdict = "SUPERSEDE" } },

    { name = "birth date contradiction (demo)", expect = "CONFLICT",
        seed = { u("s1", "For bookings: my passport says I was born on 3 March 1990.") },
        follow = { u("f1", "My airline profile says I was born on 5 March 1990, and honestly I don't know which date is right.") },
        ideal = { seed = { c("fact", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "s1") },
            follow = { c("fact", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "f1") }, verdict = "CONFLICT" } },
    { name = "pet name contradiction (demo)", expect = "CONFLICT",
        seed = { u("s1", "My cat is called Biscuit, by the way.") },
        follow = { u("f1", "My cat is called Pepper, by the way.") },
        ideal = { seed = { c("fact", "cat_name", "Biscuit", "The user's cat is called Biscuit.", "s1") },
            follow = { c("fact", "cat_name", "Pepper", "The user's cat is called Pepper.", "f1") }, verdict = "CONFLICT" } },

    { name = "new fact", expect = "ADD",
        seed = { u("s1", "I live in Paris.") },
        follow = { u("f1", "I have two kids, Mia and Leo.") },
        ideal = { seed = { c("profile_slot", "home_city", "Paris", "The user lives in Paris.", "s1") },
            follow = { c("fact", "children", "Mia and Leo", "The user has two kids, Mia and Leo.", "f1") } } },
    { name = "pet fact (demo)", expect = "ADD",
        follow = { u("f1", "My dog Pepper hates long car rides.") },
        ideal = { follow = { c("fact", "dog_car_rides", "Pepper hates long car rides", "The user's dog Pepper hates long car rides.", "f1") } } },
    { name = "allergy", expect = "ADD",
        follow = { u("f1", "Heads up, I'm allergic to peanuts.") },
        ideal = { follow = { c("fact", "allergy", "peanuts", "The user is allergic to peanuts.", "f1") } } },
    { name = "preference inside a request", expect = "ADD",
        follow = { u("f1", "Find me a quiet hotel in Lisbon - I can't sleep anywhere noisy.") },
        ideal = { follow = { c("preference", "hotel_noise", "quiet", "The user needs quiet hotels; they cannot sleep anywhere noisy.", "f1"),
            goal("hotel_search", "a quiet hotel in Lisbon", "f1") } } },
    { name = "travel preference (demo)", expect = "ADD",
        follow = { u("f1", "Plan me a long weekend somewhere warm in May. I'd rather take the train."),
            a("f2", "Great, Sam! For a warm long weekend in May by train from Paris, consider the South of France.") },
        ideal = { follow = { c("preference", "transport", "train", "The user prefers travelling by train.", "f1"),
            goal("warm_weekend", "a warm long weekend in May by train", "f1") } } },

    { name = "question with an actionable request", expect = "ADD",
        seed = SAM,
        follow = { u("f1", "Hi again! Where will I be leaving from, and what should I keep in mind about food? One short trip idea please."),
            a("f2", "You'll be leaving from Paris. Since you're vegetarian, look for vegetarian-friendly places.") },
        ideal = { seed = SAM_IDEAL, seed_relations = { [3] = { "unrelated" } }, follow = { goal("trip_idea", "one short trip idea", "f1") } } },
    { name = "recall question (demo)", expect = "IGNORE",
        seed = SAM,
        follow = { u("f1", "Hi, where do I live and what do I eat?"), a("f2", "You live in Paris and you're vegetarian.") },
        ideal = { seed = SAM_IDEAL, seed_relations = { [3] = { "unrelated" } }, follow = {} } },
    { name = "pets question (demo)", expect = "IGNORE",
        seed = { u("s1", "My cat is called Biscuit, by the way.") },
        follow = { u("f1", "What do you remember about my pets?"), a("f2", "You have a cat named Biscuit.") },
        ideal = { seed = { c("fact", "cat_name", "Biscuit", "The user's cat is called Biscuit.", "s1") }, follow = {} } },
    { name = "booking request", expect = "ADD",
        follow = { u("f1", "Can you look up trains from Berlin to Munich on Friday morning?") },
        ideal = { follow = { c("plan", "rail_booking", { status = "open", next_step = "Compare train options",
            details = "Berlin to Munich on Friday morning" }, "The user needs train options from Berlin to Munich on Friday morning.", "f1") } } },
    { name = "scheduled price check", expect = "ADD",
        follow = { u("f1", "Ok let's go with the second option and check the prices tomorrow.") },
        ideal = { follow = { goal("price_check", "the second option with prices checked tomorrow", "f1", "Check prices tomorrow") } } },
    { name = "trip idea request", expect = "ADD",
        follow = { u("f1", "One short trip idea please.") },
        ideal = { follow = { goal("trip_idea", "one short trip idea", "f1") } } },

    { name = "memory erasure request", expect = "IGNORE",
        follow = { u("f1", "Forget my dietary preferences.") }, ideal = { follow = {} } },
    { name = "memory deletion request", expect = "IGNORE",
        follow = { u("f1", "Delete what you remember about my work.") }, ideal = { follow = {} } },
    { name = "stop remembering request", expect = "IGNORE",
        follow = { u("f1", "Stop remembering my commute.") }, ideal = { follow = {} } },

    { name = "vague recollection (demo)", expect = "IGNORE",
        follow = { u("f1", "i forogt where i was recently"), a("f2", "Do you mean where you recently traveled?"), u("f3", "yeah travelled") },
        ideal = { follow = {} } },
    { name = "trivial statement", expect = "IGNORE",
        follow = { u("f1", "I've been on trips before.") },
        ideal = { follow = {} } },
    { name = "small talk", expect = "IGNORE",
        seed = { u("s1", "I prefer trains over flights.") },
        follow = { u("f1", "Haha thanks, that's great! How are you today?"), a("f2", "I'm well, thanks for asking!") },
        ideal = { seed = { c("preference", "transport", "train", "The user prefers trains over flights.", "s1") }, follow = {} } },
    { name = "acknowledgement", expect = "IGNORE",
        seed = { u("s1", "I prefer aisle seats.") },
        follow = { u("f1", "ok cool") },
        ideal = { seed = { c("preference", "seat", "aisle", "The user prefers aisle seats.", "s1") }, follow = {} } },
    { name = "recalled memory is not captured", expect = "IGNORE",
        seed = { u("s1", "I prefer window seats.") },
        follow = {
            { id = "f1", role = "developer", content = "- The user lives in Rome.\n- The user likes opera.", metadata = { memory_ids = { "m-1", "m-2" } } },
            u("f2", "Thanks!"),
        },
        ideal = { seed = { c("preference", "seat", "window", "The user prefers window seats.", "s1") }, follow = {} } },
    { name = "assistant narration only", expect = "IGNORE",
        follow = { u("f1", "Sounds good."), a("f2", "You told me you live in Rome and love opera, so I booked La Scala.") },
        ideal = { follow = {} } },

    { name = "reflection restating facts (demo)", expect = "IGNORE", reflect = true,
        seed = { u("s1", "I've gone vegan."), u("s2", "For bookings: my passport says I was born on 3 March 1990."), u("s3", "I have two kids, Mia and Leo.") },
        ideal = { seed = {
                c("preference", "diet", "vegan", "The user is vegan.", "s1"),
                c("profile_slot", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "s2"),
                c("fact", "children", "Mia and Leo", "The user has two kids, Mia and Leo.", "s3"),
            }, reflection = {} } },
    { name = "reflection over a single fact", expect = "IGNORE", reflect = true,
        seed = { u("s1", "My passport says I was born on 3 March 1990.") },
        ideal = { seed = { c("profile_slot", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "s1") }, reflection = {} } },
    { name = "reflection combining constraints", expect = "ADD", reflect = true,
        seed = { u("s1", "My dog Pepper hates long car rides."), u("s2", "I always travel with Pepper."), u("s3", "I prefer trains over flights.") },
        ideal = { seed = {
                c("fact", "dog_car_rides", "Pepper hates long car rides", "The user's dog Pepper hates long car rides.", "s1"),
                c("fact", "travels_with_dog", "always", "The user always travels with their dog Pepper.", "s2"),
                c("preference", "transport", "train", "The user prefers trains over flights.", "s3"),
            },
            reflection = { lesson(c("lesson", "pet_friendly_rail", "propose rail routes that allow dogs",
                "When planning the user's trips, propose rail routes that allow dogs and avoid long car transfers, since Pepper always comes along.", ""), { 1, 2, 3 }) },
 } },
}
