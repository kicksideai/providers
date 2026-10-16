local test = require("test")
local sink = require("sink")
local function fake()
 local f: any = { calls={} }; function f.connect(id) f.calls[#f.calls+1]={connect=id}; return {},nil end; return f
end
local function deps(f)
 local gm = {}
 function gm.get_header(headers,name)
  for _,h in ipairs(headers or {}) do if tostring(h.name):lower()==name:lower() then return h.value end end
 end
 function gm.find_draft_by_message_id(_,message_id)
  f.calls[#f.calls+1]={find=message_id}
  if f.recovered then return {success=true,data=f.recovered} end
  return {success=true,data=nil}
 end
 function gm.create_draft(_,m) f.calls[#f.calls+1]={create=m}; return {success=true,data={id="d1",message={threadId="t1"}}} end
 return { transport=f, gmail=gm }
end
local function define()
 test.describe("Gmail draft sink", function()
  test.it("uses destination receipt for update", function()
   local f=fake(); local d=deps(f)
   function d.gmail.update_draft(_,id,m) f.calls[#f.calls+1]={update=id}; return {success=true,data={id=id,message={threadId="t1"}}} end
   local r=sink.write({config={connection_id="g"},sink_op="update",identity_key="draft-1",idempotency_key="draft-1@2",dest_ref={draft_id="d1"},input={to="recipient@example.test"}},d)
   test.eq(r.success,true); test.eq(r.dest_ref.draft_id,"d1"); test.eq(f.calls[2].update,"d1")
  end)
  test.it("creates a draft with a fake transport and never sends", function()
   local f=fake(); local r=sink.write({config={connection_id="google-1"},identity_key="approval",idempotency_key="approval-1",input={to="recipient@example.test",body="Approved"}},deps(f))
   test.eq(r.success,true); test.eq(r.result,"created"); test.eq(r.dest_ref.draft_id,"d1")
   test.eq(f.calls[3].create.to,"recipient@example.test")
   test.ok(f.calls[3].create.message_id:find("@draft.local>",1,true) ~= nil)
   test.ok(f.calls[3].create.idempotency_digest ~= "")
  end)
  test.it("requires a configured account and recipient", function()
   test.eq(sink.write({input={to="a"}},deps(fake())).success,false)
   test.eq(sink.write({config={connection_id="g"},input={}},deps(fake())).success,false)
  end)
  test.it("requires an idempotency key for create", function()
   local r=sink.write({config={connection_id="g"},input={to="recipient@example.test"}},deps(fake()))
   test.eq(r.success,false); test.eq(r.error.retriable,false)
  end)
  test.it("recovers an already-created draft without creating another", function()
   local f=fake()
   local first=sink.write({config={connection_id="g"},identity_key="approval",idempotency_key="approval-1",input={to="recipient@example.test",body="Approved"}},deps(f))
   local created=f.calls[3].create
   f.recovered={id="existing-draft",message={threadId="existing-thread",payload={headers={
    {name="X-Wippy-Idempotency-Digest",value=created.idempotency_digest},
   }}}}
   local second=sink.write({config={connection_id="g"},identity_key="approval",idempotency_key="approval-1",input={to="recipient@example.test",body="Approved"}},deps(f))
   test.eq(first.result,"created"); test.eq(second.result,"replayed"); test.eq(second.replayed,true)
   test.eq(second.dest_ref.draft_id,"existing-draft"); test.eq(#f.calls,5)
  end)
  test.it("rejects reuse of a key with a different payload", function()
   local f=fake()
   f.recovered={id="existing-draft",message={payload={headers={
    {name="X-Wippy-Idempotency-Digest",value="different"},
   }}}}
   local r=sink.write({config={connection_id="g"},identity_key="approval",idempotency_key="approval-1",input={to="recipient@example.test",body="Approved"}},deps(f))
   test.eq(r.success,false); test.eq(r.error.retriable,false)
  end)
 end)
end
local cases=test.run_cases(define); return {run=function(o) return cases(o) end}
