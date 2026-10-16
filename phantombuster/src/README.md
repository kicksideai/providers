# KickSide PhantomBuster

PhantomBuster is a static API-key provider. Users create a connection from the shared Connections page; the key is stored in the connection component private context as `api_key` and validated before save.

This module exposes:

- `kickside.phantombuster.connection:phantombuster_connection`
- `PhantomBusterGet` for org status/resources, running containers, agents, deleted agents, agent output, containers, container output, and result objects
- `PhantomBusterWrite` for launching agents, scheduling launch-soon runs, and stopping agents

Traits use the provider-owned `kickside-phantombuster-picker` and store only `connection_id` in trait context. The tool schemas do not expose connection component IDs to the model.

Research reads only configured actor snapshots with explicit provider completion evidence and a stable provider/request identity. Every source binding must inject a complete `SourceOperationControlBounds/v1` document and every pull must inject a complete, digest-bound `SourceOperationPolicy/v1`; missing or partial documents fail closed. The receipt carries the effective policy digest and the control-bounds digest. Research never launches actors or sends outreach. Reader and writer traits likewise require the installed control bounds; list limits are caller-supplied and validated before a provider request.
